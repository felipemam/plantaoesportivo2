# Plantão Esportivo WP — protótipo editorial 0.1.0

Tema WordPress clássico (PHP) preparado a partir do design e da estrutura editorial do projeto React plantaoesportivo2.

**Não é um build do React original.** O visual foi refeito em CSS próprio, baseado nas cores, tipografia, cards e organização da interface React. Primeira versão funcional, requer homologação.

## Integrações prontas

- Página inicial alimentada por posts WordPress publicados
- Destaques por posts fixados (sticky posts), com complemento por posts recentes
- Últimas notícias, blocos por categoria, listagens, navegação e busca
- Páginas individuais com autor, data, imagem destacada, legenda, resumo, conteúdo, tags e comentários nativos
- Menus principal e rodapé configuráveis em Aparência > Menus
- Logo em Aparência > Personalizar > Identidade do site
- Widgets de barra lateral e área para formulário de newsletter configurável
- Capa responsiva e carrossel com JavaScript próprio, sem depender de Firebase
- Nenhuma alteração no banco de dados ao instalar

## Fora do escopo desta versão

- Firebase Auth, Firestore, Google Drive, exportação, sincronização e comentários do Firestore
- Placares ao vivo, tabelas, vídeos, enquetes: requerem fonte/API e validação
- Serviço de newsletter: configure plugin externo legítimo
- Importar artigos estáticos do React como posts
- Compatibilidade pixel-perfect com React: layout é inspirado na interface, sem incorporar o bundle React

## Instalação segura

1. Faça backup de banco de dados e wp-content e verifique a restauração.
2. Configure staging separado no CloudPanel com banco e arquivos próprios.
3. Copie apenas a pasta wordpress-theme/plantao-esportivo-wp para wp-content/themes/plantao-esportivo-wp do staging.
4. Rode php -l em todos os PHP; teste CSS/JS, páginas, busca, permalinks, comentários, menus, mídia, celular, plugins e cache.
5. Ative somente no WordPress do staging.
6. Depois da aprovação, instale a versão revisada como tema novo na produção e mantenha o tema anterior para rollback.

## Configuração editorial

- Posts > Categorias: slugs futebol, corrida-de-rua, ciclismo, esportes, politica, editoriais.
- Aparência > Menus: menu principal e menu do rodapé; adicione submenus por necessidade.
- Posts > Adicionar novo: título, resumo, imagem destacada, categoria, tags e autor.
- Edição rápida > Fixar no topo do blog: destaca notícias na capa.
- Aparência > Widgets: barra lateral e formulário de newsletter mediante serviço externo.
- Configurações > Links permanentes: Nome do post, testando os redirecionamentos.

## GitHub

O tema está em subdiretório. Clonar o repositório React inteiro em wp-content/themes não instala corretamente um tema WordPress. Use clone em pasta temporária, depois copie somente wordpress-theme/plantao-esportivo-wp. Como é repositório privado, use deploy key de leitura ou credenciais já configuradas; nunca compartilhe tokens nem os inclua em URLs.

## Pendências de homologação

- PHP lint e execução em WordPress no servidor de staging
- Revisão visual de desktop/mobile e conteúdo real
- Compatibilidade com plugins atuais, inclusive Elementor
- Revisão de SEO/acessibilidade/segurança, comentários, menus, imagens e formulários
- Configurar newsletter e dados institucionais reais; não publicar informações fictícias.
