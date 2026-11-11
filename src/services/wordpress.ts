import { Article } from '../data/portalData';
import { mapWpPostToArticle, WPPostRaw } from '../utils/wordpressMapper';

export interface WordPressConfig {
  siteUrl: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  username?: string;
  appPassword?: string;
  lastSyncedAt?: string;
}

const WP_CONFIG_KEY = 'plantao_wp_config';

export function getWordPressConfig(): WordPressConfig {
  try {
    const raw = localStorage.getItem(WP_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    siteUrl: '',
    autoSync: true,
    syncIntervalMinutes: 5
  };
}

export function saveWordPressConfig(config: WordPressConfig): void {
  try {
    localStorage.setItem(WP_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

/**
 * Normalizes a WordPress site URL and returns the REST API endpoint for posts.
 */
export function buildWpPostsEndpoint(siteUrl: string, perPage = 15): string {
  const cleanUrl = siteUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl) return '';
  if (cleanUrl.includes('/wp-json/wp/v2/posts')) {
    return cleanUrl.includes('_embed') ? cleanUrl : `${cleanUrl}${cleanUrl.includes('?') ? '&' : '?'}_embed=1`;
  }
  return `${cleanUrl}/wp-json/wp/v2/posts?_embed=1&per_page=${perPage}`;
}

/**
 * Fetches published posts from a WordPress site using the official WP REST API v2
 * and maps each post into Plantão Esportivo's Article & Category structure.
 */
export async function fetchArticlesFromWordPress(siteUrl: string): Promise<Article[]> {
  const endpoint = buildWpPostsEndpoint(siteUrl);
  if (!endpoint) {
    throw new Error('Informe a URL do site WordPress (ex: https://seuportal.com.br)');
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status} ao conectar ao WordPress REST API.`);
  }

  const data: WPPostRaw[] = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Formato inesperado retornado pela API do WordPress.');
  }

  return data.map(mapWpPostToArticle);
}

/**
 * Generates a realistic WordPress REST API v2 payload (`wp-json/wp/v2/posts?_embed`)
 * to demonstrate and test automatic category synchronization when a post is published in WordPress.
 */
export function createSampleWpPostPayload(params: {
  title: string;
  excerpt: string;
  contentHtml: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  subcategoryName?: string;
  authorName: string;
  featuredImageUrl?: string;
}): WPPostRaw {
  const terms: Array<{ id: number; name: string; slug: string; taxonomy: string }> = [
    {
      id: Math.floor(Math.random() * 100) + 1,
      name: params.categoryName,
      slug: params.categorySlug,
      taxonomy: 'category'
    }
  ];

  if (params.subcategorySlug && params.subcategoryName) {
    terms.push({
      id: Math.floor(Math.random() * 100) + 101,
      name: params.subcategoryName,
      slug: params.subcategorySlug,
      taxonomy: 'category'
    });
  }

  return {
    id: Math.floor(Date.now() / 1000),
    date: new Date().toISOString(),
    slug: params.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 45),
    title: { rendered: params.title },
    excerpt: { rendered: `<p>${params.excerpt}</p>` },
    content: { rendered: params.contentHtml },
    _embedded: {
      author: [
        {
          name: params.authorName || 'Editor WordPress',
          description: 'Publicado via Painel WordPress (WP REST API v2)'
        }
      ],
      ...(params.featuredImageUrl
        ? {
            'wp:featuredmedia': [
              {
                source_url: params.featuredImageUrl,
                alt_text: params.title
              }
            ]
          }
        : {}),
      'wp:term': [terms]
    }
  };
}
