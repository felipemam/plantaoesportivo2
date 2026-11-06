<?php
/** Metabox de origem, roteiro de IA e aprovação por editor humano. */
if (!defined('ABSPATH')) {
    exit;
}

final class PIAN_Editor {
    public static function boot(): void {
        add_action('add_meta_boxes_post', array(__CLASS__, 'metabox'));
        add_action('admin_post_pian_approve', array(__CLASS__, 'approve'));
        add_action('admin_post_pian_generate_outline', array(__CLASS__, 'generate_outline'));
    }

    public static function metabox($post): void {
        if ($post instanceof WP_Post && get_post_meta($post->ID, '_pian_source_id', true)) {
            add_meta_box(
                'pian-editorial',
                'Plantão IA — Apuração',
                array(__CLASS__, 'render'),
                'post',
                'side',
                'high'
            );
        }
    }

    public static function render(WP_Post $post): void {
        $name = (string) get_post_meta($post->ID, '_pian_source_name', true);
        $url = (string) get_post_meta($post->ID, '_pian_source_url', true);
        $summary = (string) get_post_meta($post->ID, '_pian_source_summary', true);
        $approved = get_post_meta($post->ID, '_pian_editorial_approved', true) === '1';
        $outline = (string) get_post_meta($post->ID, '_pian_ai_brief', true);

        echo '<p><strong>Fonte:</strong> ' . esc_html($name) . '</p>';
        if ($url) {
            echo '<p><a href="' . esc_url($url) . '" target="_blank" rel="noopener noreferrer">Abrir notícia de origem</a></p>';
        }
        echo '<p><strong>Resumo do feed (não verificado):</strong></p>';
        echo '<p>' . esc_html($summary ?: 'Sem resumo no RSS.') . '</p>';
        echo '<p><strong>Checklist:</strong> conferir fatos, datas, fontes primárias, contexto, direitos de imagem, título e autoria.</p>';

        if ($outline) {
            echo '<p><strong>Roteiro sugerido pela IA (não verificado):</strong></p>';
            echo '<div style="white-space:pre-wrap;max-height:320px;overflow:auto;border:1px solid #ccd0d4;padding:8px">' . esc_html($outline) . '</div>';
        }
        if (current_user_can('edit_post', $post->ID)) {
            if (PIAN_AI::configured()) {
                $ai_url = wp_nonce_url(
                    admin_url('admin-post.php?action=pian_generate_outline&post_id=' . $post->ID),
                    'pian_ai_' . $post->ID
                );
                echo '<p><a class="button" href="' . esc_url($ai_url) . '">Gerar roteiro com IA</a></p>';
            } else {
                echo '<p><em>IA opcional: defina PLANTAO_IA_OPENAI_API_KEY no wp-config.php.</em></p>';
            }
        }
        if ($approved) {
            $reviewer = absint(get_post_meta($post->ID, '_pian_reviewed_by', true));
            $user = $reviewer ? get_userdata($reviewer) : false;
            echo '<p><strong>Aprovação editorial registrada</strong>' . ($user ? ' por ' . esc_html($user->display_name) : '') . '.</p>';
        } elseif (current_user_can('publish_posts') && current_user_can('edit_post', $post->ID)) {
            $approve_url = wp_nonce_url(
                admin_url('admin-post.php?action=pian_approve&post_id=' . $post->ID),
                'pian_approve_' . $post->ID
            );
            echo '<p><strong>Bloqueio ativo:</strong> não é possível publicar antes da aprovação.</p>';
            echo '<p><a class="button button-primary" href="' . esc_url($approve_url) . '">Confirmar apuração e aprovar</a></p>';
            echo '<p class="description">Aprovar registra sua responsabilidade editorial, mas não publica o post.</p>';
        }
    }

    private static function authorize(int $post_id, string $nonce_action): void {
        check_admin_referer($nonce_action);
        if (!$post_id || !current_user_can('edit_post', $post_id) ||
            !get_post_meta($post_id, '_pian_source_id', true)) {
            wp_die('Sem permissão ou pauta inexistente.', '', array('response' => 403));
        }
    }

    private static function back(int $post_id, string $notice): void {
        wp_safe_redirect(add_query_arg('pian_notice', $notice, get_edit_post_link($post_id, '')));
        exit;
    }

    public static function approve(): void {
        $post_id = absint($_GET['post_id'] ?? 0);
        self::authorize($post_id, 'pian_approve_' . $post_id);
        if (!current_user_can('publish_posts')) {
            wp_die('Aprovação reservada a editores com permissão de publicar.', '', array('response' => 403));
        }
        update_post_meta($post_id, '_pian_editorial_approved', '1');
        update_post_meta($post_id, '_pian_reviewed_by', get_current_user_id());
        update_post_meta($post_id, '_pian_reviewed_at', current_time('mysql'));
        PIAN_Core::log('info', 'Pauta ' . $post_id . ' aprovada pelo usuário ' . get_current_user_id());
        self::back($post_id, 'approved');
    }

    public static function generate_outline(): void {
        $post_id = absint($_GET['post_id'] ?? 0);
        self::authorize($post_id, 'pian_ai_' . $post_id);
        $result = PIAN_AI::generate_outline($post_id);
        if (is_wp_error($result)) {
            PIAN_Core::log('error', 'IA na pauta ' . $post_id . ': ' . $result->get_error_message());
        }
        self::back($post_id, is_wp_error($result) ? 'ai_error' : 'ai_done');
    }
}
