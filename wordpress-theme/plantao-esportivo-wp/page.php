<?php get_header(); ?>
<main id="conteudo" class="pew-main pew-container pew-section">
    <?php while (have_posts()) : the_post(); ?>
        <article <?php post_class('pew-page'); ?>>
            <h1><?php the_title(); ?></h1>
            <div class="pew-prose"><?php the_content(); wp_link_pages(); ?></div>
            <?php if (comments_open() || get_comments_number()) { comments_template(); } ?>
        </article>
    <?php endwhile; ?>
</main>
<?php get_footer(); ?>
