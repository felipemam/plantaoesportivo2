import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripWpHtml,
  resolveWpCategories,
  parseWpContentBlocks,
  mapWpPostToArticle,
  WPPostRaw
} from './wordpressMapper';

test('stripWpHtml removes HTML tags and decodes WordPress entities', () => {
  const raw = '<p>Palmeiras &#8211; Campe&atilde;o &amp; L&iacute;der &#8220;2026&#8221;</p>';
  const cleaned = stripWpHtml(raw);
  assert.ok(cleaned.includes('Palmeiras –'));
  assert.ok(cleaned.includes('&'));
  assert.ok(cleaned.includes('"2026"'));
});

test('resolveWpCategories maps WordPress category slugs to Plantão Esportivo categories and subcategories', () => {
  const samplePost: WPPostRaw = {
    id: 101,
    date: '2026-11-10T10:00:00',
    slug: 'maratona-internacional-sp',
    title: { rendered: 'Maratona Internacional de SP' },
    excerpt: { rendered: '<p>Resumo da prova</p>' },
    content: { rendered: '<p>Conteúdo completo</p>' },
    _embedded: {
      'wp:term': [
        [
          { id: 1, name: 'Corrida de Rua', slug: 'corrida-de-rua', taxonomy: 'category' },
          { id: 2, name: 'Calendário', slug: 'calendario', taxonomy: 'category' }
        ],
        [
          { id: 10, name: 'Maratona 42km', slug: 'maratona-42km', taxonomy: 'post_tag' }
        ]
      ]
    }
  };

  const resolved = resolveWpCategories(samplePost);
  assert.equal(resolved.category, 'Corrida de Rua');
  assert.equal(resolved.subcategory, 'Calendário');
  assert.deepEqual(resolved.tags, ['Maratona 42km']);
});

test('parseWpContentBlocks extracts paragraphs, headings, and blockquotes from WordPress HTML', () => {
  const html = `
    <p>Primeiro parágrafo direto do WordPress.</p>
    <h2>Subtítulo Tático</h2>
    <blockquote>Aspas do treinador após a partida.</blockquote>
    <p>Segundo parágrafo com análise.</p>
  `;
  const blocks = parseWpContentBlocks(html);
  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, 'paragraph');
  assert.equal(blocks[1].type, 'heading');
  assert.equal(blocks[2].type, 'quote');
  assert.equal(blocks[3].type, 'paragraph');
});

test('mapWpPostToArticle converts a full WP REST API post into a valid Portal Article', () => {
  const wpPost: WPPostRaw = {
    id: 555,
    date: '2026-11-10T11:30:00',
    slug: 'botafogo-vence-classico',
    title: { rendered: 'Botafogo vence clássico carioca e dispara na liderança' },
    excerpt: { rendered: '<p>Equipe alvinegra domina o meio-campo no Nilton Santos.</p>' },
    content: {
      rendered:
        '<p>Em noite inspirada no Estádio Nilton Santos, o Botafogo superou o rival com autoridade.</p><p>A equipe agora soma 65 pontos na tabela.</p>'
    },
    _embedded: {
      author: [{ name: 'Felipe Maciel', description: 'Editor-chefe no WordPress' }],
      'wp:term': [
        [
          { id: 3, name: 'Futebol', slug: 'futebol', taxonomy: 'category' },
          { id: 4, name: 'Nacional', slug: 'nacional', taxonomy: 'category' }
        ]
      ]
    }
  };

  const article = mapWpPostToArticle(wpPost);
  assert.equal(article.id, 'wp-555-botafogo-vence-classico');
  assert.equal(article.category, 'Futebol');
  assert.equal(article.subcategory, 'Nacional');
  assert.equal(article.author.name, 'Felipe Maciel');
  assert.equal(article.author.avatar, 'FM');
  assert.equal(article.heroTag, 'WORDPRESS');
  assert.equal(article.content.length, 2);
});
