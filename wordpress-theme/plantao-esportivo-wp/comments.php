<?php
if (post_password_required()) {
    return;
}
?>
<section class="pew-comments" id="comentarios">
    <?php if (have_comments()) : ?>
        <h2><?php echo esc_html(get_comments_number()) . ' comentário(s)'; ?></h2>
        <ol class="pew-comment-list"><?php wp_list_comments(array('style'=>'ol','short_ping'=>true,'avatar_size'=>44)); ?></ol>
        <?php the_comments_pagination(); ?>
    <?php endif; ?>
    <?php if (comments_open()) : comment_form(); endif; ?>
</section>
