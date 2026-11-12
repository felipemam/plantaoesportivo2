<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class('pew-site'); ?>>
<?php wp_body_open(); ?>
<a class="pew-skip" href="#conteudo">Pular para o conteúdo</a>
<div class="pew">
    <div class="pew-top">
        <div class="pew-container pew-top-inner">
            <span><?php echo esc_html(wp_date('l, j \d\e F \d\e Y')); ?></span>
            <span>Jornalismo esportivo independente</span>
        </div>
    </div>
    <header class="pew-header">
        <div class="pew-container pew-header-row">
            <div class="pew-brand">
                <?php if (has_custom_logo()) : ?>
                    <?php the_custom_logo(); ?>
                <?php else : ?>
                    <a class="pew-brand-link" href="<?php echo esc_url(home_url('/')); ?>" rel="home">PLANTÃO <span>ESPORTIVO</span></a>
                <?php endif; ?>
                <p class="pew-tagline"><?php echo esc_html(get_bloginfo('description') ?: 'O esporte em destaque'); ?></p>
            </div>
            <div class="pew-header-search"><?php get_search_form(); ?></div>
            <button class="pew-menu-toggle" type="button" aria-expanded="false" aria-controls="pew-navigation" aria-label="Abrir menu">☰ <span>Menu</span></button>
        </div>
    </header>
    <nav class="pew-nav" id="pew-navigation" aria-label="Menu principal">
        <div class="pew-container">
            <?php wp_nav_menu(array('theme_location' => 'principal', 'container' => false, 'menu_class' => 'pew-nav-list', 'fallback_cb' => 'pew_menu_fallback', 'depth' => 2)); ?>
        </div>
    </nav>
