# Orientação CloudPanel — staging

Não execute na produção. Configure antes um ambiente de staging separado no CloudPanel com banco próprio.

Com o projeto clonado e autenticado no GitHub:
1. Acesse a pasta do staging.
2. Confirme a presença de wp-config.php e wp-content/themes.
3. Rode PHP lint nos arquivos wordpress-theme/plantao-esportivo-wp/*.php e template-parts/*.php.
4. Copie somente wordpress-theme/plantao-esportivo-wp para wp-content/themes/plantao-esportivo-wp do staging.
5. Verifique com WP-CLI theme list e ative apenas no staging.
6. Teste, faça revisão e planeje janela de troca.
7. O site de produção tem tema ativo plantao-esportivo, que deve permanecer intacto até aprovação.
