    <footer class="pew-footer">
        <div class="pew-container pew-footer-grid">
            <section>
                <a href="<?php echo esc_url(home_url('/')); ?>" class="pew-footer-logo">PLANTÃO <span>ESPORTIVO</span></a>
                <p>Jornalismo esportivo com cobertura de futebol, corrida de rua, ciclismo e outras modalidades.</p>
            </section>
            <section>
                <h2>Categorias</h2>
                <ul>
                    <?php foreach (array('futebol'=>'Futebol','corrida-de-rua'=>'Corrida de Rua','ciclismo'=>'Ciclismo','esportes'=>'Esportes','politica'=>'Política','editoriais'=>'Editoriais') as $slug=>$label) : ?>
                        <?php if (get_category_by_slug($slug)) : ?>
                            <li><a href="<?php echo esc_url(pew_category_url($slug)); ?>"><?php echo esc_html($label); ?></a></li>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </ul>
            </section>
            <section>
                <h2>Institucional</h2>
                <?php if (has_nav_menu('rodape')) : ?>
                    <?php wp_nav_menu(array('theme_location'=>'rodape','container'=>false,'menu_class'=>'pew-footer-links','depth'=>1)); ?>
                <?php endif; ?>
                <?php if (function_exists('get_privacy_policy_url') && get_privacy_policy_url()) : ?>
                    <p><a href="<?php echo esc_url(get_privacy_policy_url()); ?>">Política de privacidade</a></p>
                <?php endif; ?>
            </section>
            <section>
                <?php if (is_active_sidebar('newsletter')) : ?>
                    <?php dynamic_sidebar('newsletter'); ?>
                <?php else : ?>
                    <h2>Busque uma notícia</h2>
                    <?php get_search_form(); ?>
                <?php endif; ?>
            </section>
        </div>
        <div class="pew-container pew-footer-bottom">© <?php echo esc_html(wp_date('Y')); ?> <?php bloginfo('name'); ?>. Todos os direitos reservados.</div>
    </footer>
</div>
<?php wp_footer(); ?>
</body>
</html>
