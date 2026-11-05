<?php
/**
 * Funções do tema Plantão Esportivo WP.
 *
 * @package PlantaoEsportivoWP
 */
if (!defined('ABSPATH')) {
    exit;
}

function pew_setup() {
    load_theme_textdomain('plantao-esportivo-wp', get_template_directory() . '/languages');
    add_theme_support('title-tag');
    add_theme_support('automatic-feed-links');
    add_theme_support('post-thumbnails');
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');
    add_theme_support('custom-logo', array('height' => 100, 'width' => 440, 'flex-width' => true, 'flex-height' => true));
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    register_nav_menus(array(
        'principal' => __('Menu principal', 'plantao-esportivo-wp'),
        'rodape' => __('Menu institucional do rodapé', 'plantao-esportivo-wp'),
    ));
    add_image_size('pew-hero', 1280, 780, true);
    add_image_size('pew-card', 720, 450, true);
}
add_action('after_setup_theme', 'pew_setup');

function pew_assets() {
    $dir = get_template_directory();
    $uri = get_template_directory_uri();
    wp_enqueue_style(
        'pew-fonts',
        'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap',
        array(),
        null
    );
    wp_enqueue_style('pew-site', $uri . '/assets/css/site.css', array('pew-fonts'), filemtime($dir . '/assets/css/site.css'));
    wp_enqueue_script('pew-site', $uri . '/assets/js/site.js', array(), filemtime($dir . '/assets/js/site.js'), true);
}
add_action('wp_enqueue_scripts', 'pew_assets');

function pew_category_url($slug) {
    $term = get_category_by_slug($slug);
    return $term ? get_category_link($term->term_id) : home_url('/');
}

function pew_menu_fallback() {
    $categories = array(
        'futebol' => 'Futebol',
        'corrida-de-rua' => 'Corrida de Rua',
        'ciclismo' => 'Ciclismo',
        'esportes' => 'Esportes',
        'politica' => 'Política',
        'editoriais' => 'Editoriais',
    );
    echo '<ul class="pew-nav-list"><li><a href="' . esc_url(home_url('/')) . '">Início</a></li>';
    foreach ($categories as $slug => $label) {
        $term = get_category_by_slug($slug);
        if ($term) {
            echo '<li><a href="' . esc_url(get_category_link($term->term_id)) . '">' . esc_html($label) . '</a></li>';
        }
    }
    echo '</ul>';
}

function pew_post_category() {
    $cats = get_the_category();
    if (!$cats) {
        return;
    }
    $cat = $cats[0];
    echo '<a class="pew-category" href="' . esc_url(get_category_link($cat->term_id)) . '">' . esc_html($cat->name) . '</a>';
}

function pew_thumbnail($size = 'pew-card') {
    if (has_post_thumbnail()) {
        echo get_the_post_thumbnail(get_the_ID(), $size, array('class' => 'pew-thumb', 'loading' => 'lazy', 'alt' => trim(wp_strip_all_tags(get_post_meta(get_post_thumbnail_id(), '_wp_attachment_image_alt', true))) ?: get_the_title()));
    } else {
        echo '<span class="pew-image-placeholder" aria-hidden="true"><span>PLANTÃO <strong>ESPORTIVO</strong></span></span>';
    }
}

function pew_summary($words = 24) {
    $excerpt = get_the_excerpt();
    echo esc_html(wp_trim_words(wp_strip_all_tags($excerpt), $words, '…'));
}

/**
 * Posts fixados primeiro, completando com as publicações mais recentes.
 * Nenhum conteúdo fictício é gerado.
 */
function pew_featured_posts($limit = 4) {
    $sticky_ids = array_map('intval', (array) get_option('sticky_posts', array()));
    $posts = array();
    if ($sticky_ids) {
        $posts = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'post__in' => $sticky_ids,
            'orderby' => 'date',
            'order' => 'DESC',
            'posts_per_page' => $limit,
            'ignore_sticky_posts' => 1,
        ));
    }
    if (count($posts) < $limit) {
        $other = get_posts(array(
            'post_type' => 'post',
            'post_status' => 'publish',
            'posts_per_page' => $limit - count($posts),
            'post__not_in' => wp_list_pluck($posts, 'ID'),
            'ignore_sticky_posts' => 1,
        ));
        $posts = array_merge($posts, $other);
    }
    return array_slice($posts, 0, $limit);
}

function pew_register_sidebars() {
    register_sidebar(array(
        'name' => __('Barra lateral das notícias', 'plantao-esportivo-wp'),
        'id' => 'noticias-sidebar',
        'description' => __('Widgets adicionais na barra lateral do portal.', 'plantao-esportivo-wp'),
        'before_widget' => '<section id="%1$s" class="pew-widget %2$s">',
        'after_widget' => '</section>',
        'before_title' => '<h3 class="pew-widget-title">',
        'after_title' => '</h3>',
    ));
    register_sidebar(array(
        'name' => __('Newsletter do rodapé', 'plantao-esportivo-wp'),
        'id' => 'newsletter',
        'description' => __('Insira aqui o formulário do serviço de newsletter que você configurar.', 'plantao-esportivo-wp'),
        'before_widget' => '<div class="pew-newsletter-widget">',
        'after_widget' => '</div>',
        'before_title' => '<h3>',
        'after_title' => '</h3>',
    ));
}
add_action('widgets_init', 'pew_register_sidebars');
