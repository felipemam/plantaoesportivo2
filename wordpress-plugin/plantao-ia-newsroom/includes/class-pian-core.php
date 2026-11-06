<?php
/**
 * Núcleo: instalação, sincronização, deduplicação e bloqueio editorial.
 *
 * @package PlantaoIANewsroom
 */
if (!defined('ABSPATH')) {
    exit;
}

final class PIAN_Core {
    public const CRON_HOOK = 'pian_sync_sources';
    private const LOCK_OPTION = 'pian_sync_lock';

    public static function boot(): void {
        add_filter('cron_schedules', array(__CLASS__, 'cron_schedules'));
        add_action(self::CRON_HOOK, array(__CLASS__, 'cron_sync'));
        add_filter('wp_insert_post_data', array(__CLASS__, 'guard_post_status'), 10, 2);
        add_filter('rest_pre_insert_post', array(__CLASS__, 'guard_rest_publish'), 10, 2);

        if (is_admin()) {
            PIAN_Admin::boot();
        }
    }

    public static function table(): string {
        global $wpdb;
        return $wpdb->prefix . 'pian_items';
    }

    public static function cron_schedules(array $schedules): array {
        $schedules['pian_15_minutes'] = array(
            'interval' => 15 * MINUTE_IN_SECONDS,
            'display'  => 'A cada 15 minutos (Plantão IA)',
        );
        return $schedules;
    }

    public static function activate(): void {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $table   = self::table();
        $collate = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE {$table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            item_hash char(64) NOT NULL,
            source_id varchar(36) NOT NULL,
            post_id bigint(20) unsigned NOT NULL DEFAULT 0,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY item_hash (item_hash),
            KEY source_id (source_id),
            KEY post_id (post_id)
        ) {$collate};";
        dbDelta($sql);

        add_option('pian_sources', array(), '', false);
        add_option('pian_logs', array(), '', false);
        add_filter('cron_schedules', array(__CLASS__, 'cron_schedules'));

        if (!wp_next_scheduled(self::CRON_HOOK)) {
            wp_schedule_event(time() + 5 * MINUTE_IN_SECONDS, 'pian_15_minutes', self::CRON_HOOK);
        }
    }

    public static function deactivate(): void {
        wp_clear_scheduled_hook(self::CRON_HOOK);
        delete_option(self::LOCK_OPTION);
        // Pautas, fontes e histórico são preservados para eventual reativação.
    }

    public static function get_sources(): array {
        $sources = get_option('pian_sources', array());
        return is_array($sources) ? array_values($sources) : array();
    }

    public static function log(string $level, string $message): void {
        $entries = get_option('pian_logs', array());
        $entries = is_array($entries) ? $entries : array();
        array_unshift($entries, array(
            'date'    => current_time('mysql'),
            'level'   => in_array($level, array('info', 'error'), true) ? $level : 'info',
            'message' => sanitize_text_field($message),
        ));
        update_option('pian_logs', array_slice($entries, 0, 100), false);
    }

    public static function cron_sync(): void {
        self::sync_all();
    }

    /**
     * Sincroniza até 30 itens por execução, com trava entre cron e ações manuais.
     */
    public static function sync_all(): array {
        $summary = array(
            'sources' => 0,
            'created' => 0,
            'duplicates' => 0,
            'errors' => 0,
            'locked' => false,
        );

        $token = wp_generate_uuid4();
        $lock = array('token' => $token, 'at' => time());
        if (!add_option(self::LOCK_OPTION, $lock, '', false)) {
            $old = get_option(self::LOCK_OPTION, array());
            if (is_array($old) && (time() - (int) ($old['at'] ?? 0)) > 15 * MINUTE_IN_SECONDS) {
                delete_option(self::LOCK_OPTION);
            }
            if (!add_option(self::LOCK_OPTION, $lock, '', false)) {
                $summary['locked'] = true;
                return $summary;
            }
        }

        try {
            foreach (self::get_sources() as $source) {
                if (empty($source['active'])) {
                    continue;
                }
                $remaining = 30 - $summary['created'] - $summary['duplicates'];
                if ($remaining <= 0) {
                    break;
                }
                ++$summary['sources'];
                $result = self::sync_source($source, $remaining);
                foreach (array('created', 'duplicates', 'errors') as $key) {
                    $summary[$key] += $result[$key];
                }
            }
            self::log('info', sprintf(
                'Sincronização: %d fontes, %d pautas, %d repetidas, %d erros.',
                $summary['sources'],
                $summary['created'],
                $summary['duplicates'],
                $summary['errors']
            ));
        } finally {
            $current = get_option(self::LOCK_OPTION, array());
            if (is_array($current) && ($current['token'] ?? '') === $token) {
                delete_option(self::LOCK_OPTION);
            }
        }

        return $summary;
    }

    /**
     * Somente HTTPS público. fetch_feed usa o transporte seguro da API HTTP do WP.
     */
    public static function safe_feed_url(string $url): bool {
        $parts = wp_parse_url($url);
        if (!is_array($parts) || strtolower((string) ($parts['scheme'] ?? '')) !== 'https') {
            return false;
        }
        if (empty($parts['host']) || isset($parts['user']) || isset($parts['pass'])) {
            return false;
        }
        return (bool) wp_http_validate_url($url);
    }

    public static function feed_cache_lifetime(): int {
        return 15 * MINUTE_IN_SECONDS;
    }

    private static function sync_source(array $source, int $remaining): array {
        $result = array('created' => 0, 'duplicates' => 0, 'errors' => 0);
        $url = (string) ($source['url'] ?? '');
        $name = (string) ($source['name'] ?? 'Fonte sem nome');
        if (!self::safe_feed_url($url)) {
            self::log('error', 'Fonte recusada por URL insegura: ' . $name);
            ++$result['errors'];
            return $result;
        }

        require_once ABSPATH . WPINC . '/feed.php';
        add_filter('wp_feed_cache_transient_lifetime', array(__CLASS__, 'feed_cache_lifetime'));
        try {
            $feed = fetch_feed($url);
        } finally {
            remove_filter('wp_feed_cache_transient_lifetime', array(__CLASS__, 'feed_cache_lifetime'));
        }

        if (is_wp_error($feed)) {
            self::log('error', 'Falha no RSS ' . $name . ': ' . $feed->get_error_message());
            ++$result['errors'];
            return $result;
        }

        $limit = min(10, max(1, (int) ($source['limit'] ?? 5)), $remaining);
        $items = $feed->get_items(0, $limit);
        foreach ($items as $item) {
            $date = (int) $item->get_date('U');
            if ($date && $date < time() - 7 * DAY_IN_SECONDS) {
                continue;
            }

            $title = sanitize_text_field((string) $item->get_title());
            $title = wp_html_excerpt($title, 180, '');
            if ('' === $title) {
                continue;
            }

            $original = esc_url_raw((string) $item->get_permalink());
            $canonical = self::normalize_article_url($original);
            $guid = sanitize_text_field((string) $item->get_id());
            if ('' === $canonical && '' === $guid) {
                continue;
            }

            $hash = hash('sha256', '' !== $canonical ? $canonical : ($source['id'] . '|' . $guid));
            $summary = wp_trim_words(
                wp_strip_all_tags((string) $item->get_description(), true),
                55,
                '…'
            );
            $outcome = self::create_pauta($source, $title, $canonical ? $original : '', $summary, $guid, $hash);
            if (isset($result[$outcome])) {
                ++$result[$outcome];
            }
        }
        return $result;
    }

    /**
     * Normalização usada somente para deduplicação; nunca faz requisições à matéria.
     */
    private static function normalize_article_url(string $url): string {
        $parts = wp_parse_url($url);
        if (!is_array($parts) || empty($parts['host'])) {
            return '';
        }
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) $parts['host']);
        if (!in_array($scheme, array('http', 'https'), true) ||
            filter_var($host, FILTER_VALIDATE_IP) ||
            $host === 'localhost' ||
            str_ends_with($host, '.local') ||
            isset($parts['user']) || isset($parts['pass'])) {
            return '';
        }

        $path = (string) ($parts['path'] ?? '/');
        $path = '/' === $path ? '/' : rtrim($path, '/');
        $query = array();
        if (!empty($parts['query'])) {
            parse_str($parts['query'], $query);
        }
        foreach (array_keys($query) as $key) {
            if (str_starts_with(strtolower((string) $key), 'utm_') ||
                in_array(strtolower((string) $key), array('fbclid', 'gclid', 'igshid', 'mc_cid', 'mc_eid'), true)) {
                unset($query[$key]);
            }
        }
        ksort($query);
        $port = isset($parts['port']) ? ':' . (int) $parts['port'] : '';
        $normalized = 'https://' . $host . $port . $path;
        if ($query) {
            $normalized .= '?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
        }
        return esc_url_raw($normalized);
    }

    private static function create_pauta(
        array $source,
        string $title,
        string $original,
        string $summary,
        string $guid,
        string $hash
    ): string {
        global $wpdb;
        $table = self::table();

        $reserved = $wpdb->insert(
            $table,
            array(
                'item_hash' => $hash,
                'source_id' => (string) $source['id'],
                'post_id' => 0,
                'created_at' => current_time('mysql', true),
            ),
            array('%s', '%s', '%d', '%s')
        );
        if (false === $reserved) {
            $exists = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$table} WHERE item_hash = %s LIMIT 1",
                $hash
            ));
            if ($exists) {
                return 'duplicates';
            }
            self::log('error', 'Não foi possível reservar uma pauta na base de dados.');
            return 'errors';
        }

        $reservation_id = (int) $wpdb->insert_id;
        $category = (int) ($source['category'] ?? 0);
        $post_args = array(
            'post_type' => 'post',
            'post_status' => 'draft',
            'post_title' => '[Pauta] ' . $title,
            'post_content' => '',
            'post_excerpt' => '',
            'post_author' => 0,
            'post_category' => $category && term_exists($category, 'category') ? array($category) : array(),
        );

        $post_id = wp_insert_post($post_args, true);
        if (is_wp_error($post_id) || !$post_id) {
            $wpdb->delete($table, array('id' => $reservation_id), array('%d'));
            self::log('error', 'Falha ao criar rascunho para a fonte ' . $source['name']);
            return 'errors';
        }

        $meta = array(
            '_pian_item_hash' => $hash,
            '_pian_source_id' => (string) $source['id'],
            '_pian_source_name' => (string) $source['name'],
            '_pian_source_url' => $original,
            '_pian_source_summary' => sanitize_textarea_field($summary),
            '_pian_original_guid' => wp_html_excerpt($guid, 255, ''),
            '_pian_editorial_approved' => '0',
        );
        foreach ($meta as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
        $wpdb->update($table, array('post_id' => (int) $post_id), array('id' => $reservation_id), array('%d'), array('%d'));
        return 'created';
    }

    /**
     * No editor clássico, uma pauta sem aprovação fica pendente, nunca publicada.
     */
    public static function guard_post_status(array $data, array $postarr): array {
        $post_id = (int) ($postarr['ID'] ?? 0);
        if ($post_id && ($data['post_status'] ?? '') === 'publish' &&
            get_post_meta($post_id, '_pian_source_id', true) &&
            get_post_meta($post_id, '_pian_editorial_approved', true) !== '1') {
            $data['post_status'] = 'pending';
        }
        return $data;
    }

    /**
     * No editor de blocos, devolve erro claro antes da tentativa de publicação.
     */
    public static function guard_rest_publish($prepared_post, $request) {
        $post_id = (int) $request->get_param('id');
        if ($post_id && $request->get_param('status') === 'publish' &&
            get_post_meta($post_id, '_pian_source_id', true) &&
            get_post_meta($post_id, '_pian_editorial_approved', true) !== '1') {
            return new WP_Error(
                'pian_review_required',
                'Esta pauta exige aprovação editorial em Plantão IA antes da publicação.',
                array('status' => 403)
            );
        }
        return $prepared_post;
    }
}
