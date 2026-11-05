<?php get_header(); ?>
<main id="conteudo" class="pew-main pew-container pew-section">
    <?php while (have_posts()) : the_post(); ?>
        <nav class="pew-breadcrumb" aria-label="Navegação estrutural">
            <a href="<?php echo esc_url(home_url('/')); ?>">Início</a>
            <span aria-hidden="true">/</span>
            <?php $cats = get_the_category(); if (!empty($cats)) : ?>
                <a href="<?php echo esc_url(get_category_link($cats[0]->term_id)); ?>"><?php echo esc_html($cats[0]->name); ?></a>
                <span aria-hidden="true">/</span>
            <?php endif; ?>
            <span>Matéria</span>
        </nav>
        <div class="pew-article-layout">
            <article <?php post_class('pew-article'); ?>>
                <header class="pew-article-header">
                    <?php pew_post_category(); ?>
                    <h1><?php the_title(); ?></h1>
                    <?php if (has_excerpt()) : ?><p class="pew-lead"><?php echo esc_html(get_the_excerpt()); ?></p><?php endif; ?>
                    <div class="pew-meta">
                        Por <?php the_author_posts_link(); ?> ·
                        <time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>
                        <?php if (get_the_modified_time('U') > get_the_time('U') + 300) : ?>
                            · Atualizada em <?php echo esc_html(get_the_modified_date()); ?>
                        <?php endif; ?>
                    </div>
                </header>
                <?php if (has_post_thumbnail()) : ?>
                    <figure class="pew-featured-figure">
                        <?php pew_thumbnail('pew-hero'); ?>
                        <?php if (get_the_post_thumbnail_caption()) : ?>
                            <figcaption><?php echo esc_html(get_the_post_thumbnail_caption()); ?></figcaption>
                        <?php endif; ?>
                    </figure>
                <?php endif; ?>
                <div class="pew-prose">
                    <?php the_content(); ?>
                    <?php wp_link_pages(array('before'=>'<div class="pew-pagination">','after'=>'</div>')); ?>
                </div>
                <div class="pew-article-bottom">
                    <?php the_tags('<div class="pew-tags"><strong>Assuntos:</strong> ', ' · ', '</div>'); ?>
                    <div class="pew-share">
                        <strong>Compartilhe</strong>
                        <a target="_blank" rel="noopener noreferrer" href="<?php echo esc_url('https://wa.me/?text=' . rawurlencode(get_the_title() . ' ' . get_permalink())); ?>">WhatsApp</a>
                        <a target="_blank" rel="noopener noreferrer" href="<?php echo esc_url('https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode(get_permalink())); ?>">Facebook</a>
                    </div>
                </div>
                <nav class="pew-post-nav" aria-label="Outras matérias">
                    <div><?php previous_post_link('%link', '← %title'); ?></div>
                    <div><?php next_post_link('%link', '%title →'); ?></div>
                </nav>
                <?php if (comments_open() || get_comments_number()) : ?>
                    <?php comments_template(); ?>
                <?php endif; ?>
            </article>
            <?php get_sidebar(); ?>
        </div>
        <?php
        $related_cats = wp_list_pluck(get_the_category(), 'term_id');
        $related = new WP_Query(array(
            'post_type'=>'post','post_status'=>'publish','posts_per_page'=>3,
            'post__not_in'=>array(get_the_ID()),'category__in'=>$related_cats,
            'ignore_sticky_posts'=>1,
        ));
        if ($related->have_posts()) :
        ?>
            <section class="pew-section" aria-labelledby="pew-related-title">
                <div class="pew-section-heading"><div><h2 id="pew-related-title">Leia também</h2></div></div>
                <div class="pew-card-grid">
                    <?php while ($related->have_posts()) : $related->the_post(); get_template_part('template-parts/card', 'news'); endwhile; ?>
                </div>
            </section>
        <?php endif; wp_reset_postdata(); ?>
    <?php endwhile; ?>
</main>
<?php get_footer(); ?>
