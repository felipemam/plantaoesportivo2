<?php
/**
 * Página inicial completa do Plantão Esportivo WP.
 *
 * Todas as matérias exibidas vêm dos posts WordPress.
 * Se não houver conteúdo publicado, os módulos permanecem visíveis
 * com avisos neutros (nunca notícias, placares ou vídeos inventados).
 */
get_header();
$featured = pew_featured_posts(4);
$pew_sections = array(
    'futebol' => array('Futebol', 'Campeonatos, análises e bastidores'),
    'corrida-de-rua' => array('Corrida de Rua', 'Provas, calendário e treinamento'),
    'ciclismo' => array('Ciclismo', 'Estradas, pistas e resultados'),
    'esportes' => array('Esportes', 'Todas as modalidades em destaque'),
    'politica' => array('Política', 'Políticas públicas para o esporte'),
    'editoriais' => array('Editoriais', 'Análise e opinião da redação'),
);
?>
<main id="conteudo" class="pew-main pew-home">
    <section class="pew-home-topicbar" aria-label="Cobertura do portal">
        <div class="pew-container pew-topicbar-inner">
            <span class="pew-topicbar-label"><span class="pew-red-dot"></span> COBERTURA ESPORTIVA</span>
            <div class="pew-topics">
                <?php foreach ($pew_sections as $slug => $data) :
                    $topic_term = get_category_by_slug($slug);
                    if ($topic_term) : ?>
                        <a href="<?php echo esc_url(get_category_link($topic_term->term_id)); ?>"><?php echo esc_html($data[0]); ?></a>
                    <?php else : ?>
                        <span><?php echo esc_html($data[0]); ?></span>
                    <?php endif;
                endforeach; ?>
            </div>
        </div>
    </section>

    <section class="pew-container pew-section" aria-labelledby="pew-feature-title">
        <div class="pew-section-heading">
            <div><span class="pew-red-dot"></span><h1 id="pew-feature-title">Destaques</h1><p>As principais notícias do Plantão Esportivo</p></div>
        </div>
        <div class="pew-feature-layout">
            <?php if ($featured) : ?>
            <div class="pew-hero" data-pew-hero>
                <?php global $post; foreach ($featured as $index => $post) : setup_postdata($post); ?>
                    <article class="pew-hero-slide<?php echo $index === 0 ? ' is-active' : ''; ?>" <?php echo $index === 0 ? '' : ' hidden'; ?>>
                        <a href="<?php the_permalink(); ?>" class="pew-hero-link">
                            <div class="pew-hero-image"><?php pew_thumbnail('pew-hero'); ?></div>
                            <div class="pew-hero-shade"></div>
                            <div class="pew-hero-copy">
                                <?php $hero_cats = get_the_category(); if ($hero_cats) : ?>
                                    <span class="pew-category"><?php echo esc_html($hero_cats[0]->name); ?></span>
                                <?php endif; ?>
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
            <?php else : ?>
            <div class="pew-hero pew-hero-welcome">
                <div class="pew-hero-welcome-art" aria-hidden="true"><span>PE</span></div>
                <div class="pew-hero-shade"></div>
                <div class="pew-hero-copy">
                    <span class="pew-category">Plantão Esportivo</span>
                    <h2>O esporte em destaque, todos os dias</h2>
                    <p>Futebol, corrida de rua, ciclismo e muito mais. Nossa cobertura começa aqui.</p>
                    <?php if (current_user_can('edit_posts')) : ?>
                        <a class="pew-editor-link" href="<?php echo esc_url(admin_url('post-new.php')); ?>">Publicar primeira notícia →</a>
                    <?php endif; ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="pew-hero-side">
                <?php if (count($featured) > 1) : ?>
                    <?php global $post; foreach (array_slice($featured, 1, 3) as $post) : setup_postdata($post); ?>
                        <article class="pew-hero-side-card">
                            <a href="<?php the_permalink(); ?>" class="pew-side-media"><?php pew_thumbnail('pew-card'); ?></a>
                            <div class="pew-side-content">
                                <?php pew_post_category(); ?>
                                <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                                <span class="pew-meta"><?php echo esc_html(get_the_date()); ?></span>
                            </div>
                        </article>
                    <?php endforeach; wp_reset_postdata(); ?>
                <?php endif; ?>
                <?php
                $side_count = max(0, 3 - max(0, count($featured) - 1));
                for ($i = 0; $i < $side_count; $i++) :
                    $side_slugs = array_keys($pew_sections);
                    $side_data = $pew_sections[$side_slugs[$i % count($side_slugs)]];
                ?>
                    <div class="pew-hero-side-card pew-placeholder-card">
                        <div class="pew-side-media pew-placeholder-media"><span aria-hidden="true">PE</span></div>
                        <div class="pew-side-content">
                            <span class="pew-category"><?php echo esc_html($side_data[0]); ?></span>
                            <h3>Em preparação</h3>
                            <p class="pew-meta">Novas notícias desta editoria aparecerão aqui.</p>
                        </div>
                    </div>
                <?php endfor; ?>
            </div>
        </div>
    </section>

    <section class="pew-section pew-container" aria-labelledby="pew-latest-title">
        <div class="pew-section-heading">
            <div><span class="pew-red-dot"></span><h2 id="pew-latest-title">Últimas Notícias</h2><p>Atualizações publicadas pela nossa redação</p></div>
            <?php $posts_page_id = (int) get_option('page_for_posts'); if ($posts_page_id) : ?>
                <a class="pew-section-link" href="<?php echo esc_url(get_permalink($posts_page_id)); ?>">Ver todas →</a>
            <?php endif; ?>
        </div>
        <?php $latest = new WP_Query(array('post_type'=>'post', 'post_status'=>'publish', 'posts_per_page'=>6, 'ignore_sticky_posts'=>1)); ?>
        <div class="pew-card-grid">
            <?php if ($latest->have_posts()) : ?>
                <?php while ($latest->have_posts()) : $latest->the_post(); get_template_part('template-parts/card', 'news'); endwhile; ?>
            <?php else : ?>
                <?php foreach (array_slice($pew_sections, 0, 3) as $data) : ?>
                    <article class="pew-card pew-placeholder-card">
                        <div class="pew-card-media pew-placeholder-media"><span aria-hidden="true">PE</span></div>
                        <div class="pew-card-body">
                            <span class="pew-category"><?php echo esc_html($data[0]); ?></span>
                            <h3>Notícias em breve</h3>
                            <p>As próximas publicações desta editoria aparecerão nesta seção.</p>
                        </div>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
        <?php wp_reset_postdata(); ?>
    </section>

    <div class="pew-container pew-section pew-content-columns">
        <div>
            <?php foreach ($pew_sections as $slug => $data) :
                $category = get_category_by_slug($slug);
                $query_args = array('post_type'=>'post','post_status'=>'publish','posts_per_page'=>3,'ignore_sticky_posts'=>1);
                if ($category) {
                    $query_args['cat'] = (int) $category->term_id;
                    $category_posts = new WP_Query($query_args);
                } else {
                    $category_posts = null;
                }
            ?>
                <section class="pew-category-block" aria-labelledby="pew-cat-<?php echo esc_attr($slug); ?>">
                    <div class="pew-section-heading">
                        <div><h2 id="pew-cat-<?php echo esc_attr($slug); ?>"><?php echo esc_html($data[0]); ?></h2><p><?php echo esc_html($data[1]); ?></p></div>
                        <?php if ($category) : ?>
                            <a class="pew-section-link" href="<?php echo esc_url(get_category_link($category->term_id)); ?>">Ver mais →</a>
                        <?php endif; ?>
                    </div>
                    <div class="pew-category-rows">
                        <?php if ($category_posts && $category_posts->have_posts()) : ?>
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
                        <?php else : ?>
                            <div class="pew-category-waiting">
                                <span class="pew-category-waiting-symbol" aria-hidden="true"><?php echo esc_html(strtoupper(substr($data[0], 0, 1))); ?></span>
                                <div><strong>Cobertura em preparação</strong><p>Quando houver notícias em <?php echo esc_html($data[0]); ?>, elas aparecerão aqui automaticamente.</p></div>
                            </div>
                        <?php endif; ?>
                    </div>
                </section>
                <?php if ($category_posts) { wp_reset_postdata(); } ?>
            <?php endforeach; ?>
        </div>
        <aside class="pew-sidebar pew-home-sidebar" aria-label="Informações do portal">
            <section class="pew-widget">
                <h2 class="pew-widget-title">Acompanhe o Plantão</h2>
                <p>Notícias, análises e novidades do esporte em um só lugar.</p>
                <a class="pew-sidebar-action" href="<?php echo esc_url(home_url('/feed/')); ?>">Assinar feed de notícias ↗</a>
            </section>
            <section class="pew-widget">
                <h2 class="pew-widget-title">Editorias</h2>
                <ul class="pew-widget-list">
                    <?php foreach ($pew_sections as $slug => $data) :
                        $term = get_category_by_slug($slug); ?>
                        <li><?php if ($term) : ?><a href="<?php echo esc_url(get_category_link($term->term_id)); ?>"><?php echo esc_html($data[0]); ?></a><?php else : ?><span><?php echo esc_html($data[0]); ?></span><?php endif; ?></li>
                    <?php endforeach; ?>
                </ul>
            </section>
            <?php if (is_active_sidebar('noticias-sidebar')) : dynamic_sidebar('noticias-sidebar'); endif; ?>
        </aside>
    </div>

    <section class="pew-section pew-container" aria-labelledby="pew-video-title">
        <div class="pew-section-heading">
            <div><h2 id="pew-video-title">Vídeos e entrevistas</h2><p>Confira conteúdos multimídia do Plantão Esportivo</p></div>
        </div>
        <?php
        $videos_term = get_term_by('slug', 'videos', 'category');
        $video_args = array('post_type'=>'post','post_status'=>'publish','posts_per_page'=>3,'ignore_sticky_posts'=>1);
        if ($videos_term) {
            $video_args['cat'] = (int) $videos_term->term_id;
        }
        ?>
        <?php if ($videos_term) : ?>
            <?php $video_posts = new WP_Query($video_args); ?>
            <?php if ($video_posts->have_posts()) : ?>
                <div class="pew-card-grid">
                    <?php while ($video_posts->have_posts()) : $video_posts->the_post(); get_template_part('template-parts/card', 'news'); endwhile; ?>
                </div>
            <?php else : ?>
                <div class="pew-video-placeholder"><span>▶</span><div><strong>Novos vídeos em preparação</strong><p>Entrevistas e melhores momentos serão publicados nesta editoria.</p></div></div>
            <?php endif; ?>
            <?php wp_reset_postdata(); ?>
        <?php else : ?>
            <div class="pew-video-placeholder"><span>▶</span><div><strong>Novos vídeos em preparação</strong><p>Quando a editoria de vídeos estiver cadastrada, os conteúdos aparecerão aqui.</p></div></div>
        <?php endif; ?>
    </section>

    <section class="pew-home-newsletter" aria-labelledby="pew-newsletter-title">
        <div class="pew-container pew-newsletter-inner">
            <div>
                <span class="pew-newsletter-eyebrow">PLANTÃO ESPORTIVO</span>
                <h2 id="pew-newsletter-title">Fique por dentro de tudo</h2>
                <p>Acompanhe as novidades do esporte e as análises da nossa redação.</p>
            </div>
            <div class="pew-newsletter-content">
                <?php if (is_active_sidebar('newsletter')) : ?>
                    <?php dynamic_sidebar('newsletter'); ?>
                <?php else : ?>
                    <a href="<?php echo esc_url(home_url('/feed/')); ?>">Acompanhar notícias no feed RSS →</a>
                <?php endif; ?>
            </div>
        </div>
    </section>
</main>
<?php get_footer(); ?>
