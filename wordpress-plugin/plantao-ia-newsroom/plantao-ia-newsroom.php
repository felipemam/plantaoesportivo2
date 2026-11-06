<?php
/**
 * Plugin Name: Plantão IA Newsroom
 * Plugin URI: https://github.com/felipemam/plantaoesportivo2
 * Description: Captura pautas de feeds RSS, organiza uma fila editorial e oferece roteiros de apuração com IA. Nunca publica automaticamente.
 * Version: 0.1.0
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Author: Plantão Esportivo
 * License: GPL-2.0-or-later
 * Text Domain: plantao-ia-newsroom
 */

if (!defined('ABSPATH')) {
    exit;
}

define('PIAN_VERSION', '0.1.0');
define('PIAN_PLUGIN_DIR', plugin_dir_path(__FILE__));

require_once PIAN_PLUGIN_DIR . 'includes/class-pian-core.php';
require_once PIAN_PLUGIN_DIR . 'includes/class-pian-ai.php';
require_once PIAN_PLUGIN_DIR . 'includes/class-pian-admin.php';

register_activation_hook(__FILE__, array('PIAN_Core', 'activate'));
register_deactivation_hook(__FILE__, array('PIAN_Core', 'deactivate'));
add_action('plugins_loaded', array('PIAN_Core', 'boot'));
