# Plantão IA Newsroom — MVP 0.1.0

Plugin WordPress **independente do tema** Plantão Esportivo. Primeira versão de testes: transforma feeds RSS autorizados em **pautas para apuração humana**, nunca em notícias publicadas automaticamente.

## O que está implementado

- Menu **Plantão IA > Fontes RSS**: até 8 fontes HTTPS públicas, ativação/pausa/remoção, categoria e limite de 1 a 10 itens por fonte.
- **Sincronização manual** e **WP-Cron a cada 15 minutos**, com trava de execução, limite global de 30 itens e filtro de notícias com mais de 7 dias.
- **Deduplicação** por URL normalizada (sem parâmetros de rastreamento) ou GUID, com índice único em tabela própria do banco.
- Criação de **posts nativos do WordPress como rascunho**, com título iniciado por [Pauta] e corpo vazio. Resumo curto, link e nome da fonte ficam em metadados privados.
- **Fila editorial** (50 pautas recentes), painel de apuração dentro do editor e histórico administrativo dos últimos 100 eventos.
- **Aprovação humana explícita** por usuário com permissão de publicar. Tentativas de publicação antes da aprovação são bloqueadas.
- **IA opcional**, acionada manualmente no editor: envia somente título, resumo e link públicos do feed à API OpenAI para obter um roteiro de perguntas e verificações. Não cria artigo pronto nem altera o conteúdo do post.
- Desativação limpa do agendamento, sem apagar as pautas ou os dados das fontes.

## Requisitos

- WordPress 6.5 ou superior; PHP 8.0 ou superior.
- Acesso de administrador para configurar fontes.
- HTTPS e permissão de saída HTTP do servidor para consultar feeds.
- Para a IA opcional: chave de API OpenAI própria e créditos disponíveis.

## Instalação segura — somente staging inicialmente

1. Faça backup verificável do banco e de wp-content.
2. Abra o GitHub Actions da branch feat/plantao-ia-newsroom e o workflow **Plantão IA Newsroom — PHP lint and plugin ZIP**.
3. Aguarde o job ficar verde e baixe o artefato **plantao-ia-newsroom-wordpress-plugin**. Dentro dele está o arquivo **plantao-ia-newsroom.zip**.
4. No WordPress de staging: Plugins > Adicionar plugin > Enviar plugin > selecione o ZIP interno e ative.
5. Acesse Plantão IA > Fontes RSS. Cadastre primeiro **uma** fonte de teste autorizada e clique em **Sincronizar feeds**.
6. Abra Plantão IA > Fila editorial. Confirme que todos os posts estão em **Rascunho**, sem conteúdo copiado, sem imagens e sem publicação pública.
7. Teste o bloqueio de publicação, a aprovação editorial e a deduplicação ao sincronizar duas vezes.
8. Só após testes funcionais e revisão de segurança, avalie a instalação em produção. **Não atualize o tema para instalar este plugin.**

## Configuração opcional de IA

No servidor, configure a chave fora do repositório, preferencialmente como variável de ambiente. Em wp-config.php, antes de "That's all, stop editing!", use:

    define('PLANTAO_IA_OPENAI_API_KEY', getenv('PLANTAO_IA_OPENAI_API_KEY') ?: '');

Se o provedor não oferecer variáveis de ambiente, defina a constante somente no wp-config.php do servidor e restrinja o acesso ao arquivo. **Nunca envie a chave ao GitHub, ao navegador, a prints ou ao suporte público.**

A integração usa o endpoint Responses API e o modelo gpt-4.1-mini. Cada clique no botão "Gerar roteiro com IA" consome créditos da API. Há um intervalo mínimo de 60 segundos entre solicitações para a mesma pauta. A saída da IA é apenas uma sugestão e exige verificação humana.

## Rotina editorial

1. RSS detecta um assunto e cria [Pauta] em rascunho.
2. Editor consulta a origem, fontes primárias e dados verificáveis.
3. Opcionalmente solicita um roteiro de apuração com IA.
4. Escreve matéria **original**, com autoria, contexto, links e imagens próprias ou licenciadas.
5. Confirma fatos, data, título, direitos de uso e qualidade; usa **Confirmar apuração e aprovar**.
6. Publica pelo WordPress. O plugin nunca aciona a publicação sozinho.

**Importante:** um RSS público não é licença para copiar artigo, foto ou texto integral. O plugin guarda apenas um resumo curto como referência interna. A aprovação é responsabilidade do editor, não um sistema automático de checagem factual.

## Limitações do MVP

- Sem postagem automática, sem importação de imagens, sem scraping de sites, sem tradução/reescrita em massa e sem publicação em redes sociais.
- Não há verificação automática de fatos nem detecção semântica de notícias semelhantes; a deduplicação usa URL/GUID.
- A lista da fila mostra as 50 pautas mais recentes. Não há filtros avançados, papéis customizados nem relatórios de analytics.
- O WP-Cron depende de tráfego. Em staging, use a sincronização manual; em produção, configure cron real ou WP-CLI com a equipe de hospedagem.
- Testes automatizados atuais: sintaxe PHP e empacotamento ZIP no GitHub Actions. Ainda requer testes de integração WordPress, segurança, cron, feeds reais, editor clássico e Gutenberg.
- Não gera schema NewsArticle nem sitemap: estes recursos pertencem à publicação final e devem ser tratados por SEO/editorial sem duplicar plugins existentes.
- Não garante aprovação no Google News, Discover, indexação, tráfego ou monetização.

## Dados e reversão

A ativação cria a tabela wp_pian_items (prefixo real da instalação) e as opções pian_sources e pian_logs. A desativação cancela o WP-Cron, mas mantém tabela, fontes, logs e rascunhos para evitar perda acidental. Para remover dados definitivamente, faça uma decisão explícita após backup; a exclusão não é automática.

## Estrutura

    wordpress-plugin/plantao-ia-newsroom/
      plantao-ia-newsroom.php
      includes/
        class-pian-core.php
        class-pian-admin.php
        class-pian-sources.php
        class-pian-editor.php
        class-pian-ai.php
      README.md

## Próximos incrementos

Testes de integração com WordPress real, melhorias de acessibilidade e UX, painel de verificação de fontes, papéis de revisor, integração com Search Console e métricas editoriais. Somente após homologação, considerar outros fluxos de IA com aprovação e direitos de uso explícitos.
