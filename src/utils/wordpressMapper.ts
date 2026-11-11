import { Article } from '../data/portalData';

export interface WPPostRaw {
  id: number;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories?: number[];
  _embedded?: {
    author?: Array<{
      name?: string;
      description?: string;
      avatar_urls?: Record<string, string>;
    }>;
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
      caption?: { rendered?: string };
    }>;
    'wp:term'?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export type PortalCategory = Article['category'];
export type PortalSubcategory = Article['subcategory'];

export interface CategoryMappingResult {
  category: PortalCategory;
  subcategory?: PortalSubcategory;
  tags: string[];
}

const CATEGORY_MAP: Record<string, PortalCategory> = {
  futebol: 'Futebol',
  'corrida-de-rua': 'Corrida de Rua',
  corrida: 'Corrida de Rua',
  maratona: 'Corrida de Rua',
  ciclismo: 'Ciclismo',
  bike: 'Ciclismo',
  esportes: 'Esportes',
  olimpico: 'Esportes',
  volei: 'Esportes',
  basquete: 'Esportes',
  politica: 'Política',
  'politica-esportiva': 'Política',
  editoriais: 'Editoriais',
  opiniao: 'Editoriais',
  coluna: 'Editoriais'
};

const SUBCATEGORY_MAP: Record<string, PortalSubcategory> = {
  regional: 'Regional',
  nacional: 'Nacional',
  brasileirao: 'Nacional',
  internacional: 'Internacional',
  calendario: 'Calendário',
  treino: 'Treino',
  estrada: 'Estrada',
  opiniao: 'Opinião'
};

/**
 * Strips HTML tags and decodes common HTML entities from WordPress rendered strings.
 */
export function stripWpHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8211;|&ndash;/gi, '–')
    .replace(/&#8212;|&mdash;/gi, '—')
    .replace(/&#8216;|&#8217;|&lsquo;|&rsquo;/gi, "'")
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;|&quot;/gi, '"')
    .replace(/&#038;|&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Maps WordPress embedded terms (categories & tags) to Plantão Esportivo categories and subcategories.
 */
export function resolveWpCategories(wpPost: WPPostRaw): CategoryMappingResult {
  const termsFlat = (wpPost._embedded?.['wp:term'] || []).flat();
  let matchedCategory: PortalCategory = 'Esportes';
  let matchedSubcategory: PortalSubcategory | undefined = undefined;
  const tags: string[] = [];

  for (const term of termsFlat) {
    const slug = (term.slug || '').toLowerCase();
    const nameLower = (term.name || '').toLowerCase();

    if (term.taxonomy === 'category') {
      if (CATEGORY_MAP[slug]) {
        matchedCategory = CATEGORY_MAP[slug];
      } else if (nameLower.includes('futebol')) {
        matchedCategory = 'Futebol';
      } else if (nameLower.includes('corrida') || nameLower.includes('maratona')) {
        matchedCategory = 'Corrida de Rua';
      } else if (nameLower.includes('ciclismo') || nameLower.includes('bike')) {
        matchedCategory = 'Ciclismo';
      } else if (nameLower.includes('política') || nameLower.includes('politica')) {
        matchedCategory = 'Política';
      } else if (nameLower.includes('editorial') || nameLower.includes('opinião')) {
        matchedCategory = 'Editoriais';
      }

      if (SUBCATEGORY_MAP[slug]) {
        matchedSubcategory = SUBCATEGORY_MAP[slug];
      }
    } else if (term.taxonomy === 'post_tag') {
      if (term.name) tags.push(term.name);
      if (!matchedSubcategory && SUBCATEGORY_MAP[slug]) {
        matchedSubcategory = SUBCATEGORY_MAP[slug];
      }
    }
  }

  if (tags.length === 0) {
    tags.push(matchedCategory, 'WordPress');
  }

  return {
    category: matchedCategory,
    subcategory: matchedSubcategory,
    tags
  };
}

/**
 * Parses WordPress HTML content into structured Article blocks.
 */
export function parseWpContentBlocks(html: string): Article['content'] {
  if (!html || !html.trim()) {
    return [{ type: 'paragraph', text: 'Matéria sincronizada via WordPress.' }];
  }

  const blocks: Article['content'] = [];
  const blockRegex = /<(p|h2|h3|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = stripWpHtml(match[2]);
    if (!text) continue;

    if (tag === 'h2' || tag === 'h3') {
      blocks.push({ type: 'heading', text });
    } else if (tag === 'blockquote') {
      blocks.push({
        type: 'quote',
        text,
        quoteAuthor: ' Destaque da Redação',
        quoteRole: 'Plantão Esportivo'
      });
    } else {
      blocks.push({ type: 'paragraph', text });
    }
  }

  if (blocks.length === 0) {
    const plain = stripWpHtml(html);
    if (plain) {
      blocks.push({ type: 'paragraph', text: plain });
    }
  }

  return blocks;
}

/**
 * Converts a WordPress REST API post object into a Plantão Esportivo Article.
 */
export function mapWpPostToArticle(wpPost: WPPostRaw): Article {
  const cleanTitle = stripWpHtml(wpPost.title?.rendered || 'Sem título');
  const cleanExcerpt = stripWpHtml(wpPost.excerpt?.rendered || '');
  const contentBlocks = parseWpContentBlocks(wpPost.content?.rendered || '');
  const { category, subcategory, tags } = resolveWpCategories(wpPost);

  const authorObj = wpPost._embedded?.author?.[0];
  const authorName = authorObj?.name || 'Redação WordPress';
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const mediaObj = wpPost._embedded?.['wp:featuredmedia']?.[0];
  const mediaUrl = mediaObj?.source_url;

  const fallbackGradients: Record<PortalCategory, string> = {
    Futebol: 'linear-gradient(135deg, #1e3a8a 0%, #172554 50%, #dc2626 100%)',
    'Corrida de Rua': 'linear-gradient(135deg, #b91c1c 0%, #991b1b 50%, #facc15 100%)',
    Ciclismo: 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 50%, #38bdf8 100%)',
    Esportes: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #2dd4bf 100%)',
    Política: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #1e3a8a 100%)',
    Editoriais: 'linear-gradient(135deg, #831843 0%, #701a75 50%, #be185d 100%)'
  };

  const imageBg = mediaUrl
    ? `linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.85)), url("${mediaUrl}") center/cover no-repeat`
    : fallbackGradients[category];

  const totalWords = contentBlocks
    .map((b) => b.text || '')
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(2, Math.ceil(totalWords / 180));

  const firstParagraph =
    contentBlocks.find((b) => b.type === 'paragraph')?.text ||
    cleanExcerpt ||
    cleanTitle;

  return {
    id: `wp-${wpPost.id}-${wpPost.slug || 'post'}`,
    title: cleanTitle,
    dek: cleanExcerpt || firstParagraph.slice(0, 160),
    category,
    subcategory,
    badgeColor: category === 'Futebol' ? 'red' : category === 'Ciclismo' ? 'blue' : 'yellow',
    author: {
      name: authorName,
      role: 'Correspondente WordPress',
      avatar: authorInitials || 'WP',
      bio: stripWpHtml(authorObj?.description || 'Jornalista integrado via WordPress CMS.'),
      publishedCount: 12,
      social: { twitter: '@plantaoesportivo' }
    },
    publishedAt: formatWpDate(wpPost.date),
    readTime: `${minutes} min de leitura`,
    readCount: 'Sincronizado via WP',
    imageBg,
    imageCaption: stripWpHtml(mediaObj?.caption?.rendered || mediaObj?.alt_text || cleanTitle),
    imageCredit: 'WordPress CMS / Plantão Esportivo',
    heroTag: 'WORDPRESS',
    leadParagraph: firstParagraph,
    content: contentBlocks,
    tags,
    commentsCount: 0,
    initialComments: []
  };
}

function formatWpDate(dateStr: string): string {
  if (!dateStr) return 'Agora mesmo';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Hoje';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return 'Hoje';
  }
}
