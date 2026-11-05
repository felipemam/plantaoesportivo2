<?php get_header(); ?>
<main id="conteudo" class="pew-main pew-container pew-section">
    <div class="pew-section-heading">
        <div>
            <h1>
                <?php
                if (is_search()) {
                    printf(esc_html__('Busca por: %s', 'plantao-esportivo-wp'), esc_html(get_search_query()));
                } elseif (is_home()) {
                    esc_html_e('Todas as notícias', 'plantao-esportivo-wp');
                } elseif (is_archive()) {
                    the_archive_title();
                } else {
                    esc_html_e('Notícias', 'plantao-esportivo-wp');
                }
                ?>
            </h1>
            <?php if (is_archive()) : ?><p><?php echo esc_html(wp_strip_all_tags(get_the_archive_description())); ?></p><?php endif; ?>
        </div>
    </div>
    <?php if (have_posts()) : ?>
        <div class="pew-card-grid">
            <?php while (have_posts()) : the_post(); get_template_part('template-parts/card', 'news'); endwhile; ?>
        </div>
        <div class="pew-pagination"><?php the_posts_pagination(array('mid_size'=>2,'prev_text'=>'← Anteriores','next_text'=>'Próximas →')); ?></div>
    <?php else : ?>
        <div class="pew-empty"><p>Nenhuma notícia encontrada.</p><p>Tente outra busca ou navegue pelas categorias.</p><?php get_search_form(); ?></div>
    <?php endif; ?>
</main>
<?php get_footer(); ?>
