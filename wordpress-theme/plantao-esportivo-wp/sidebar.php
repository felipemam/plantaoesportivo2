<aside class="pew-sidebar" aria-label="Barra lateral">
    <?php if (is_active_sidebar('noticias-sidebar')) : ?>
        <?php dynamic_sidebar('noticias-sidebar'); ?>
    <?php else : ?>
        <section class="pew-widget">
            <h2 class="pew-widget-title">Mais recentes</h2>
            <?php
            $recent = new WP_Query(array('post_type'=>'post','post_status'=>'publish','posts_per_page'=>5,'ignore_sticky_posts'=>1));
            if ($recent->have_posts()) :
                echo '<ul class="pew-widget-list">';
                while ($recent->have_posts()) : $recent->the_post();
                    echo '<li><a href="' . esc_url(get_permalink()) . '">' . esc_html(get_the_title()) . '</a><time>' . esc_html(get_the_date()) . '</time></li>';
                endwhile;
                echo '</ul>';
            endif;
            wp_reset_postdata();
            ?>
        </section>
        <section class="pew-widget">
            <h2 class="pew-widget-title">Categorias</h2>
            <ul class="pew-widget-list">
                <?php foreach (get_categories(array('hide_empty'=>true,'number'=>12)) as $term) : ?>
                    <li><a href="<?php echo esc_url(get_category_link($term->term_id)); ?>"><?php echo esc_html($term->name); ?></a></li>
                <?php endforeach; ?>
            </ul>
        </section>
    <?php endif; ?>
</aside>
