<?php
/**
 * Capa do portal: posts fixados e notícias reais do WordPress.
 */
get_header();
$featured = pew_featured_posts(4);
?>
<main id="conteudo" class="pew-main">
    <?php if ($featured) : ?>
    <section class="pew-container pew-section" aria-labelledby="pew-feature-title">
        <div class="pew-section-heading">
            <div><span class="pew-red-dot"></span><h1 id="pew-feature-title">Destaques</h1><p>As principais notícias da redação</p></div>
        </div>
        <div class="pew-feature-layout">
            <div class="pew-hero" data-pew-hero>
                <?php global $post; foreach ($featured as $index => $post) : setup_postdata($post); ?>
                    <article class="pew-hero-slide<?php echo $index === 0 ? ' is-active' : ''; ?>" <?php echo $index === 0 ? '' : 'hidden'; ?>>
                        <a href="<?php the_permalink(); ?>" class="pew-hero-link">
                            <div class="pew-hero-image"><?php pew_thumbnail('pew-hero'); ?></div>
                            <div class="pew-hero-shade"></div>
                            <div class="pew-hero-copy">
                                <?php pew_post_category(); ?>
                                <h2><?php the_title(); ?></h2>
                                <p><?php pew_summary(26); ?></p>
                                <span class="pew-meta">Por <?php the_author(); ?> · <?php echo esc_html(get_the_date()); ?></span>
                            </div>
                        </a>
                    </article>
                <?php endforeach; wp_reset_postdata(); ?>
                <?php if (count($featured) > 1) : ?>
                    <div class="pew-hero-controls">
                        <button type="button" data-pew-prev aria-label="Destaque anterior">‹</button>
                        <button type="button" data-pew-next aria-label="Próximo destaque">›</button>
                    </div>
                <?php endif; ?>
            </div>
            <div class="pew-hero-side">
                <?php foreach (array_slice($featured, 1, 3) as $post) : setup_postdata($post); ?>
                    <article class="pew-hero-side-card">
                        <a href="<?php the_permalink(); ?>" class="pew-side-media"><?php pew_thumbnail('pew-card'); ?></a>
                        <div class="pew-side-content">
                            <?php pew_post_category(); ?>
                            <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                            <span class="pew-meta"><?php echo esc_html(get_the_date()); ?></span>
                        </div>
                    </article>
                <?php endforeach; wp_reset_postdata(); ?>
            </div>
        </div>
    </section>
    <?php elseif (current_user_can('edit_posts')) : ?>
        <div class="pew-container pew-empty"><h1>Seu portal está pronto para receber notícias.</h1><p>Crie uma publicação em Posts → Adicionar novo, com categoria e imagem destacada.</p></div>
    <?php else : ?>
        <div class="pew-container pew-empty"><h1>Plantão Esportivo</h1><p>As primeiras notícias serão publicadas em breve.</p></div>
    <?php endif; ?>

    <?php
    $latest = new WP_Query(array('post_type'=>'post','post_status'=>'publish','posts_per_page'=>6,'ignore_sticky_posts'=>1));
    if ($latest->have_posts()) :
    ?>
    <section class="pew-section pew-container" aria-labelledby="pew-latest-title">
        <div class="pew-section-heading">
            <div><span class="pew-red-dot"></span><h2 id="pew-latest-title">Últimas Notícias</h2><p>Publicadas pela redação</p></div>
            <a class="pew-section-link" href="<?php echo esc_url(get_post_type_archive_link('post') ?: home_url('/')); ?>">Ver todas →</a>
        </div>
        <div class="pew-card-grid">
            <?php while ($latest->have_posts()) : $latest->the_post(); get_template_part('template-parts/card', 'news'); endwhile; ?>
        </div>
    </section>
    <?php endif; wp_reset_postdata(); ?>

    <div class="pew-container pew-section pew-content-columns">
        <div>
            <?php
            $sections = array(
                'futebol' => array('Futebol','Análises, bastidores e competições'),
                'corrida-de-rua' => array('Corrida de Rua','Calendários, eventos e treinamento'),
                'ciclismo' => array('Ciclismo','Estradas, pistas e resultados'),
                'esportes' => array('Esportes','Modalidades e atletas em destaque'),
                'politica' => array('Política','Políticas públicas do esporte'),
                'editoriais' => array('Editoriais','Análises e opinião'),
            );
            foreach ($sections as $slug => $data) :
                $category = get_category_by_slug($slug);
                if (!$category) { continue; }
                $category_posts = new WP_Query(array(
                    'post_type'=>'post','post_status'=>'publish',
                    'posts_per_page'=>3,'cat'=>$category->term_id,'ignore_sticky_posts'=>1,
                ));
                if (!$category_posts->have_posts()) { wp_reset_postdata(); continue; }
            ?>
                <section class="pew-category-block" aria-labelledby="pew-cat-<?php echo esc_attr($slug); ?>">
                    <div class="pew-section-heading">
                        <div><h2 id="pew-cat-<?php echo esc_attr($slug); ?>"><?php echo esc_html($data[0]); ?></h2><p><?php echo esc_html($data[1]); ?></p></div>
                        <a class="pew-section-link" href="<?php echo esc_url(get_category_link($category->term_id)); ?>">Ver mais →</a>
                    </div>
                    <div class="pew-category-rows">
                        <?php while ($category_posts->have_posts()) : $category_posts->the_post(); ?>
                            <article class="pew-row-card">
                                <a href="<?php the_permalink(); ?>" class="pew-row-thumb"><?php pew_thumbnail('pew-card'); ?></a>
                                <div>
                                    <?php pew_post_category(); ?>
                                    <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                                    <p><?php pew_summary(18); ?></p>
                                    <span class="pew-meta"><?php echo esc_html(get_the_date()); ?></span>
                                </div>
                            </article>
                        <?php endwhile; ?>
                    </div>
                </section>
            <?php wp_reset_postdata(); endforeach; ?>
        </div>
        <?php get_sidebar(); ?>
    </div>
</main>
<?php get_footer(); ?>
