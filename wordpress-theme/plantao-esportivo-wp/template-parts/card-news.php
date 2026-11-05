<article <?php post_class('pew-card'); ?>>
    <a href="<?php the_permalink(); ?>" class="pew-card-media" aria-label="<?php echo esc_attr(get_the_title()); ?>"><?php pew_thumbnail('pew-card'); ?></a>
    <div class="pew-card-body">
        <?php pew_post_category(); ?>
        <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
        <p><?php pew_summary(22); ?></p>
        <div class="pew-meta">Por <?php the_author(); ?> · <time datetime="<?php echo esc_attr(get_the_date('c')); ?>"><?php echo esc_html(get_the_date()); ?></time></div>
    </div>
</article>
