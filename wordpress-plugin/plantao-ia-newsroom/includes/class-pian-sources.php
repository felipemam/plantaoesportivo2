<?php
/** Cadastro de fontes RSS e sincronização manual. */
if (!defined('ABSPATH')) {
    exit;
}

final class PIAN_Sources {
    public static function boot(): void {
        add_action('admin_post_pian_add_source', array(__CLASS__, 'add'));
        add_action('admin_post_pian_change_source', array(__CLASS__, 'change'));
        add_action('admin_post_pian_sync_now', array(__CLASS__, 'sync'));
    }

    private static function authorize(): void {
        if (!current_user_can('manage_options')) {
            wp_die('Sem permissão para administrar fontes.', '', array('response' => 403));
        }
    }

    private static function redirect(array $args): void {
        wp_safe_redirect(add_query_arg($args, admin_url('admin.php?page=pian-sources')));
        exit;
    }

    public static function screen(): void {
        self::authorize();
        $sources = PIAN_Core::get_sources();
        echo '<div class="wrap"><h1>Plantão IA — Fontes RSS</h1>';
        echo '<p>Cadastre feeds com permissão de consulta. Títulos e resumos são apenas pistas para apuração original. Limite inicial: 8 fontes.</p>';
        echo '<table class="widefat striped"><thead><tr><th>Nome</th><th>Feed</th><th>Categoria</th><th>Limite</th><th>Situação</th><th>Ações</th></tr></thead><tbody>';
        foreach ($sources as $source) {
            $id = (string) $source['id'];
            $category = (int) $source['category'];
            $term = $category ? get_term($category, 'category') : null;
            $category_name = $term && !is_wp_error($term) ? $term->name : 'Sem categoria';
            echo '<tr><td>' . esc_html($source['name']) . '</td>';
            echo '<td><a target="_blank" rel="noopener noreferrer" href="' . esc_url($source['url']) . '">' . esc_html($source['url']) . '</a></td>';
            echo '<td>' . esc_html($category_name) . '</td><td>' . (int) $source['limit'] . '</td>';
            echo '<td>' . (!empty($source['active']) ? 'Ativa' : 'Pausada') . '</td><td>';
            foreach (array('toggle', 'delete') as $operation) {
                echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '" style="display:inline-block;margin-right:6px">';
                echo '<input type="hidden" name="action" value="pian_change_source">';
                echo '<input type="hidden" name="source_id" value="' . esc_attr($id) . '">';
                echo '<input type="hidden" name="operation" value="' . esc_attr($operation) . '">';
                wp_nonce_field('pian_source_' . $id);
                $label = $operation === 'delete' ? 'Remover' : (!empty($source['active']) ? 'Pausar' : 'Ativar');
                submit_button($label, 'secondary small', 'submit', false);
                echo '</form>';
            }
            echo '</td></tr>';
        }
        if (!$sources) {
            echo '<tr><td colspan="6">Nenhuma fonte cadastrada.</td></tr>';
        }
        echo '</tbody></table><h2>Adicionar fonte</h2>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        echo '<input type="hidden" name="action" value="pian_add_source">';
        wp_nonce_field('pian_add_source');
        echo '<table class="form-table"><tbody>';
        echo '<tr><th><label for="pian-name">Nome</label></th><td><input required id="pian-name" name="source_name" class="regular-text" maxlength="120" placeholder="Ex.: Federação oficial"></td></tr>';
        echo '<tr><th><label for="pian-url">URL do feed</label></th><td><input required id="pian-url" type="url" name="source_url" class="regular-text" maxlength="500" placeholder="https://exemplo.com/feed/"></td></tr>';
        echo '<tr><th><label for="pian-category">Categoria</label></th><td><select id="pian-category" name="source_category"><option value="0">Sem categoria</option>';
        foreach (get_categories(array('hide_empty' => false)) as $category) {
            echo '<option value="' . (int) $category->term_id . '">' . esc_html($category->name) . '</option>';
        }
        echo '</select></td></tr>';
        echo '<tr><th><label for="pian-limit">Itens por fonte</label></th><td><input id="pian-limit" type="number" name="source_limit" min="1" max="10" value="5"></td></tr>';
        echo '<tr><th>Ativação</th><td><label><input type="checkbox" name="source_active" value="1" checked> Ativa</label></td></tr>';
        echo '</tbody></table>';
        submit_button('Cadastrar fonte');
        echo '</form><h2>Buscar pautas agora</h2>';
        echo '<p>Até 30 pautas novas por execução; WP-Cron a cada 15 minutos (dependente de visitas ou cron real).</p>';
        echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
        echo '<input type="hidden" name="action" value="pian_sync_now">';
        wp_nonce_field('pian_sync_now');
        submit_button('Sincronizar feeds', 'secondary');
        echo '</form></div>';
    }

    public static function add(): void {
        self::authorize();
        check_admin_referer('pian_add_source');
        $name = sanitize_text_field(wp_unslash($_POST['source_name'] ?? ''));
        $url = esc_url_raw(wp_unslash($_POST['source_url'] ?? ''));
        $sources = PIAN_Core::get_sources();
        if (!$name || strlen($name) > 120 || strlen($url) > 500 ||
            count($sources) >= 8 || !PIAN_Core::safe_feed_url($url)) {
            self::redirect(array('pian_notice' => 'invalid_source'));
        }
        foreach ($sources as $source) {
            if ($source['url'] === $url) {
                self::redirect(array('pian_notice' => 'invalid_source'));
            }
        }
        $category = absint($_POST['source_category'] ?? 0);
        if ($category && !term_exists($category, 'category')) {
            $category = 0;
        }
        $sources[] = array(
            'id' => wp_generate_uuid4(),
            'name' => $name,
            'url' => $url,
            'category' => $category,
            'limit' => min(10, max(1, absint($_POST['source_limit'] ?? 5))),
            'active' => !empty($_POST['source_active']),
        );
        update_option('pian_sources', $sources, false);
        PIAN_Core::log('info', 'Fonte cadastrada: ' . $name);
        self::redirect(array('pian_notice' => 'source_added'));
    }

    public static function change(): void {
        self::authorize();
        $id = sanitize_text_field(wp_unslash($_POST['source_id'] ?? ''));
        check_admin_referer('pian_source_' . $id);
        $operation = sanitize_key(wp_unslash($_POST['operation'] ?? ''));
        if (!in_array($operation, array('toggle', 'delete'), true)) {
            wp_die('Operação inválida.', '', array('response' => 400));
        }
        $sources = PIAN_Core::get_sources();
        $found = false;
        foreach ($sources as $index => $source) {
            if ($source['id'] !== $id) {
                continue;
            }
            $found = true;
            if ($operation === 'delete') {
                unset($sources[$index]);
            } else {
                $sources[$index]['active'] = empty($source['active']);
            }
            PIAN_Core::log('info', 'Fonte alterada: ' . $source['name']);
            break;
        }
        if (!$found) {
            wp_die('Fonte não encontrada.', '', array('response' => 404));
        }
        update_option('pian_sources', array_values($sources), false);
        self::redirect(array('pian_notice' => $operation === 'delete' ? 'source_deleted' : 'source_changed'));
    }

    public static function sync(): void {
        self::authorize();
        check_admin_referer('pian_sync_now');
        $result = PIAN_Core::sync_all();
        if ($result['locked']) {
            self::redirect(array('pian_notice' => 'locked'));
        }
        self::redirect(array(
            'pian_notice' => 'sync',
            'created' => $result['created'],
            'duplicates' => $result['duplicates'],
            'errors' => $result['errors'],
        ));
    }
}
