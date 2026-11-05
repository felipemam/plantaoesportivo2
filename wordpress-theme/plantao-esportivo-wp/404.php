<?php get_header(); ?>
<main id="conteudo" class="pew-main pew-container pew-section">
    <div class="pew-empty">
        <h1>Página não encontrada</h1>
        <p>O endereço pode ter mudado. Encontre uma notícia usando a busca.</p>
        <?php get_search_form(); ?>
        <p><a class="pew-section-link" href="<?php echo esc_url(home_url('/')); ?>">Voltar à página inicial →</a></p>
    </div>
</main>
<?php get_footer(); ?>
