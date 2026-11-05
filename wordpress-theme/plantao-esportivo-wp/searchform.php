<form role="search" method="get" class="pew-search" action="<?php echo esc_url(home_url('/')); ?>">
    <label class="screen-reader-text" for="pew-search-<?php echo esc_attr(uniqid()); ?>">Buscar notícias</label>
    <input type="search" name="s" value="<?php echo esc_attr(get_search_query()); ?>" placeholder="Buscar notícias, times, atletas..." aria-label="Buscar notícias" required>
    <button type="submit" aria-label="Pesquisar">Buscar</button>
</form>
