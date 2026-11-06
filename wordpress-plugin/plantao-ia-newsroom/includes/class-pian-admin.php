<?php
/** Menu administrativo, fila editorial e histórico. */
if (!defined('ABSPATH')) {
    exit;
}

final class PIAN_Admin {
    public static function boot(): void {
        add_action('admin_menu', array(__CLASS__, 'menu'));
        add_action('admin_notices', array(__CLASS__, 'notices'));
    }

    public static function menu(): void {
        add_menu_page('Plantão IA Newsroom', 'Plantão IA', 'edit_posts', 'pian-queue', array(__CLASS__, 'queue'), 'dashicons-edit-page', 26);
        add_submenu_page('pian-queue', 'Fila editorial', 'Fila editorial', 'edit_posts', 'pian-queue', array(__CLASS__, 'queue'));
        add_submenu_page('pian-queue', 'Fontes RSS', 'Fontes RSS', 'manage_options', 'pian-sources', array('PIAN_Sources', 'screen'));
        add_submenu_page('pian-queue', 'Histórico', 'Histórico', 'manage_options', 'pian-logs', array(__CLASS__, 'logs'));
    }

    public static function notices(): void {
        $notice = sanitize_key(wp_unslash($_GET['pian_notice'] ?? ''));
        $messages = array(
            'source_added' => 'Fonte RSS cadastrada.',
            'source_changed' => 'Fonte RSS atualizada.',
            'source_deleted' => 'Fonte removida. Pautas anteriores preservadas.',
            'invalid_source' => 'Fonte inválida ou duplicada. Use URL HTTPS pública.',
            'approved' => 'Pauta aprovada. Confira o texto final antes de publicar.',
            'ai_done' => 'Roteiro de apuração gerado. Verifique todas as informações.',
            'ai_error' => 'Erro ao gerar roteiro. Consulte o histórico e a configuração.',
            'locked' => 'Outra sincronização está em andamento.',
        );
        if ($notice === 'sync') {
            $message = sprintf(
                'Sincronização: %d novas, %d repetidas, %d erros.',
                absint($_GET['created'] ?? 0),
                absint($_GET['duplicates'] ?? 0),
                absint($_GET['errors'] ?? 0)
            );
        } else {
            $message = $messages[$notice] ?? '';
        }
        if (!$message) {
            return;
        }
        $error = in_array($notice, array('invalid_source', 'ai_error'), true);
        echo '<div class="notice ' . ($error ? 'notice-error' : 'notice-success') . ' is-dismissible"><p>' . esc_html($message) . '</p></div>';
    }

    public static function queue(): void {
        if (!current_user_can('edit_posts')) {
            wp_die('Sem permissão.', '', array('response' => 403));
        }
        $posts = get_posts(array(
            'post_type' => 'post',
            'post_status' => array('draft', 'pending'),
            'numberposts' => 50,
            'orderby' => 'date',
            'order' => 'DESC',
            'meta_query' => array(array('key' => '_pian_source_id', 'compare' => 'EXISTS')),
        ));
        echo '<div class="wrap"><h1>Plantão IA — Fila editorial</h1>';
        echo '<p>O RSS cria <strong>rascunhos vazios</strong> para apuração. Não copia matérias completas nem imagens e não publica automaticamente.</p>';
        if (current_user_can('manage_options')) {
            echo '<p><a class="button button-primary" href="' . esc_url(admin_url('admin.php?page=pian-sources')) . '">Gerenciar fontes</a></p>';
        }
        echo '<table class="widefat striped"><thead><tr><th>Pauta</th><th>Fonte</th><th>Status</th><th>Data</th><th>Ação</th></tr></thead><tbody>';
        $visible = 0;
        foreach ($posts as $post) {
            if (!current_user_can('edit_post', $post->ID)) {
                continue;
            }
            ++$visible;
            $status = get_post_status($post->ID) === 'pending' ? 'Pendente' : 'Rascunho';
            echo '<tr><td><strong>' . esc_html(get_the_title($post)) . '</strong></td>';
            echo '<td>' . esc_html((string) get_post_meta($post->ID, '_pian_source_name', true)) . '</td>';
            echo '<td>' . esc_html($status) . '</td>';
            echo '<td>' . esc_html(get_the_date('d/m/Y H:i', $post)) . '</td>';
            echo '<td><a href="' . esc_url((string) get_edit_post_link($post->ID)) . '">Editar e apurar</a></td></tr>';
        }
        if (!$visible) {
            echo '<tr><td colspan="5">Nenhuma pauta aguardando revisão.</td></tr>';
        }
        echo '</tbody></table></div>';
    }

    public static function logs(): void {
        if (!current_user_can('manage_options')) {
            wp_die('Sem permissão.', '', array('response' => 403));
        }
        $logs = get_option('pian_logs', array());
        echo '<div class="wrap"><h1>Plantão IA — Histórico</h1><p>Últimos 100 eventos; sem chaves de API.</p>';
        echo '<table class="widefat striped"><thead><tr><th>Data</th><th>Nível</th><th>Mensagem</th></tr></thead><tbody>';
        foreach (is_array($logs) ? $logs : array() as $entry) {
            echo '<tr><td>' . esc_html($entry['date'] ?? '') . '</td><td>' . esc_html($entry['level'] ?? '') . '</td><td>' . esc_html($entry['message'] ?? '') . '</td></tr>';
        }
        echo '</tbody></table></div>';
    }
}
