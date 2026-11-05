import { Article } from '../data/portalData';

// Verbatim constants & regexes synchronized with firebase-blueprint.json & firestore.rules
export const ID_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const MAX_ID_LENGTH = 128;
export const MAX_DISPLAY_NAME_LENGTH = 100;
export const MAX_PHOTO_URL_LENGTH = 500;
export const MAX_ARTICLE_TITLE_LENGTH = 200;
export const MAX_CATEGORY_LENGTH = 60;
export const MAX_AUTHOR_NAME_LENGTH = 80;
export const MAX_AUTHOR_AVATAR_LENGTH = 10;
export const MAX_COMMENT_TEXT_LENGTH = 1000;
export const MAX_FILE_NAME_LENGTH = 200;
export const MAX_MIME_TYPE_LENGTH = 100;

export function isValidId(id: unknown): id is string {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= MAX_ID_LENGTH &&
    ID_REGEX.test(id)
  );
}

export function sanitizeId(raw: string, fallback = 'item-default'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, MAX_ID_LENGTH);
  return cleaned.length >= 1 ? cleaned : fallback;
}

export function truncateString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

export interface SimulatedAuthContext {
  uid: string;
  emailVerified: boolean;
}

export interface SimulatedRequestContext {
  auth: SimulatedAuthContext | null;
  requestTimeMs: number;
  parentUserExists?: boolean;
  parentUserUid?: string;
}

const ALLOWED_USER_KEYS = new Set(['uid', 'displayName', 'photoURL', 'createdAt', 'updatedAt']);
const REQUIRED_USER_KEYS = ['uid', 'displayName', 'createdAt', 'updatedAt'];

const ALLOWED_BOOKMARK_KEYS = new Set([
  'userId',
  'articleId',
  'articleTitle',
  'category',
  'driveFileId',
  'createdAt',
  'updatedAt'
]);
const REQUIRED_BOOKMARK_KEYS = [
  'userId',
  'articleId',
  'articleTitle',
  'category',
  'createdAt',
  'updatedAt'
];

const ALLOWED_COMMENT_KEYS = new Set([
  'articleId',
  'authorId',
  'authorName',
  'authorAvatar',
  'text',
  'likes',
  'status',
  'createdAt',
  'updatedAt'
]);
const REQUIRED_COMMENT_KEYS = [
  'articleId',
  'authorId',
  'authorName',
  'authorAvatar',
  'text',
  'likes',
  'status',
  'createdAt',
  'updatedAt'
];

const ALLOWED_EXPORT_KEYS = new Set([
  'ownerId',
  'driveFileId',
  'fileName',
  'mimeType',
  'articleId',
  'status',
  'createdAt',
  'updatedAt'
]);
const REQUIRED_EXPORT_KEYS = [
  'ownerId',
  'driveFileId',
  'fileName',
  'mimeType',
  'articleId',
  'status',
  'createdAt',
  'updatedAt'
];

function hasExactKeys(
  data: Record<string, unknown>,
  required: string[],
  allowed: Set<string>
): boolean {
  const keys = Object.keys(data);
  for (const req of required) {
    if (!(req in data)) return false;
  }
  for (const k of keys) {
    if (!allowed.has(k)) return false;
  }
  return true;
}

export function validateUserProfilePayload(
  data: Record<string, unknown>,
  authUid: string
): boolean {
  if (!hasExactKeys(data, REQUIRED_USER_KEYS, ALLOWED_USER_KEYS)) return false;
  if (!isValidId(data.uid) || data.uid !== authUid) return false;
  if (
    typeof data.displayName !== 'string' ||
    data.displayName.length < 1 ||
    data.displayName.length > MAX_DISPLAY_NAME_LENGTH
  ) {
    return false;
  }
  if (
    'photoURL' in data &&
    (typeof data.photoURL !== 'string' || data.photoURL.length > MAX_PHOTO_URL_LENGTH)
  ) {
    return false;
  }
  if (typeof data.createdAt !== 'number' || typeof data.updatedAt !== 'number') {
    return false;
  }
  return true;
}

export function validateBookmarkPayload(
  data: Record<string, unknown>,
  authUid: string
): boolean {
  if (!hasExactKeys(data, REQUIRED_BOOKMARK_KEYS, ALLOWED_BOOKMARK_KEYS)) return false;
  if (!isValidId(data.userId) || data.userId !== authUid) return false;
  if (!isValidId(data.articleId)) return false;
  if (
    typeof data.articleTitle !== 'string' ||
    data.articleTitle.length < 1 ||
    data.articleTitle.length > MAX_ARTICLE_TITLE_LENGTH
  ) {
    return false;
  }
  if (
    typeof data.category !== 'string' ||
    data.category.length < 1 ||
    data.category.length > MAX_CATEGORY_LENGTH
  ) {
    return false;
  }
  if ('driveFileId' in data && !isValidId(data.driveFileId)) {
    return false;
  }
  if (typeof data.createdAt !== 'number' || typeof data.updatedAt !== 'number') {
    return false;
  }
  return true;
}

export function validateCommentPayload(
  data: Record<string, unknown>,
  authUid: string
): boolean {
  if (!hasExactKeys(data, REQUIRED_COMMENT_KEYS, ALLOWED_COMMENT_KEYS)) return false;
  if (!isValidId(data.articleId)) return false;
  if (!isValidId(data.authorId) || data.authorId !== authUid) return false;
  if (
    typeof data.authorName !== 'string' ||
    data.authorName.length < 1 ||
    data.authorName.length > MAX_AUTHOR_NAME_LENGTH
  ) {
    return false;
  }
  if (
    typeof data.authorAvatar !== 'string' ||
    data.authorAvatar.length < 1 ||
    data.authorAvatar.length > MAX_AUTHOR_AVATAR_LENGTH
  ) {
    return false;
  }
  if (
    typeof data.text !== 'string' ||
    data.text.length < 1 ||
    data.text.length > MAX_COMMENT_TEXT_LENGTH
  ) {
    return false;
  }
  if (
    typeof data.likes !== 'number' ||
    !Number.isInteger(data.likes) ||
    data.likes < 0 ||
    data.likes > 1000000
  ) {
    return false;
  }
  if (data.status !== 'published' && data.status !== 'archived') {
    return false;
  }
  if (typeof data.createdAt !== 'number' || typeof data.updatedAt !== 'number') {
    return false;
  }
  return true;
}

export function validateDriveExportPayload(
  data: Record<string, unknown>,
  authUid: string
): boolean {
  if (!hasExactKeys(data, REQUIRED_EXPORT_KEYS, ALLOWED_EXPORT_KEYS)) return false;
  if (!isValidId(data.ownerId) || data.ownerId !== authUid) return false;
  if (!isValidId(data.driveFileId)) return false;
  if (
    typeof data.fileName !== 'string' ||
    data.fileName.length < 1 ||
    data.fileName.length > MAX_FILE_NAME_LENGTH
  ) {
    return false;
  }
  if (
    typeof data.mimeType !== 'string' ||
    data.mimeType.length < 1 ||
    data.mimeType.length > MAX_MIME_TYPE_LENGTH
  ) {
    return false;
  }
  if (!isValidId(data.articleId)) return false;
  if (data.status !== 'synced' && data.status !== 'deleted') return false;
  if (typeof data.createdAt !== 'number' || typeof data.updatedAt !== 'number') {
    return false;
  }
  return true;
}

/**
 * Deterministic evaluator mirroring firestore.rules for TDD verification of the Dirty Dozen payloads.
 */
export function evaluateRuleOperation(params: {
  collection: 'users' | 'bookmarks' | 'comments' | 'driveExports';
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  docId?: string;
  parentUserId?: string;
  ctx: SimulatedRequestContext;
  incomingData?: Record<string, unknown>;
  existingData?: Record<string, unknown>;
}): boolean {
  const { collection, operation, docId = '', parentUserId = '', ctx, incomingData, existingData } = params;

  const isSignedIn = ctx.auth !== null;
  const isVerified = isSignedIn && ctx.auth?.emailVerified === true;
  const authUid = ctx.auth?.uid || '';
  const hasValidParent =
    ctx.parentUserExists === true && ctx.parentUserUid === authUid;

  if (collection === 'users') {
    if (operation === 'get') {
      return (
        isSignedIn &&
        isValidId(docId) &&
        authUid === docId &&
        existingData?.uid === authUid
      );
    }
    if (operation === 'create') {
      if (!isVerified || !isValidId(docId) || authUid !== docId || !incomingData) return false;
      return (
        validateUserProfilePayload(incomingData, authUid) &&
        incomingData.createdAt === ctx.requestTimeMs &&
        incomingData.updatedAt === ctx.requestTimeMs
      );
    }
    return false;
  }

  if (collection === 'bookmarks') {
    if (operation === 'get') {
      return (
        isSignedIn &&
        isValidId(parentUserId) &&
        isValidId(docId) &&
        authUid === parentUserId &&
        existingData?.userId === authUid &&
        hasValidParent
      );
    }
    if (operation === 'list') {
      return (
        isSignedIn &&
        authUid === parentUserId &&
        existingData?.userId === authUid
      );
    }
    if (operation === 'create') {
      if (
        !isVerified ||
        !isValidId(parentUserId) ||
        !isValidId(docId) ||
        authUid !== parentUserId ||
        !incomingData
      ) {
        return false;
      }
      return (
        validateBookmarkPayload(incomingData, authUid) &&
        incomingData.userId === parentUserId &&
        incomingData.createdAt === ctx.requestTimeMs &&
        incomingData.updatedAt === ctx.requestTimeMs &&
        hasValidParent
      );
    }
    return false;
  }

  if (collection === 'comments') {
    if (operation === 'create') {
      if (!isVerified || !isValidId(docId) || !incomingData) return false;
      return (
        validateCommentPayload(incomingData, authUid) &&
        incomingData.status === 'published' &&
        incomingData.likes === 0 &&
        incomingData.createdAt === ctx.requestTimeMs &&
        incomingData.updatedAt === ctx.requestTimeMs &&
        hasValidParent
      );
    }
    if (operation === 'update') {
      if (!isVerified || !isValidId(docId) || !incomingData || !existingData) return false;
      if (!validateCommentPayload(incomingData, authUid)) return false;
      if (existingData.authorId !== authUid) return false;
      if (incomingData.authorId !== existingData.authorId) return false;
      if (incomingData.articleId !== existingData.articleId) return false;
      if (incomingData.createdAt !== existingData.createdAt) return false;
      if (incomingData.updatedAt !== ctx.requestTimeMs) return false;
      if (existingData.status === 'archived') return false;
      if (!hasValidParent) return false;

      const changedKeys = Object.keys(incomingData).filter(
        (k) => incomingData[k] !== existingData[k]
      );
      const isEditText =
        incomingData.status === existingData.status &&
        incomingData.likes === existingData.likes &&
        changedKeys.every((k) => k === 'text' || k === 'updatedAt');
      const isArchive =
        incomingData.status === 'archived' &&
        incomingData.text === existingData.text &&
        incomingData.likes === existingData.likes &&
        changedKeys.every((k) => k === 'status' || k === 'updatedAt');

      return isEditText || isArchive;
    }
    return false;
  }

  if (collection === 'driveExports') {
    if (operation === 'get') {
      return (
        isSignedIn &&
        isValidId(docId) &&
        existingData?.ownerId === authUid
      );
    }
    if (operation === 'create') {
      if (!isVerified || !isValidId(docId) || !incomingData) return false;
      return (
        validateDriveExportPayload(incomingData, authUid) &&
        incomingData.status === 'synced' &&
        incomingData.createdAt === ctx.requestTimeMs &&
        incomingData.updatedAt === ctx.requestTimeMs &&
        hasValidParent
      );
    }
    return false;
  }

  return false;
}

/**
 * Formats an Article into clean Markdown for Google Drive export.
 */
export function formatArticleForDriveMarkdown(article: Article): string {
  const lines: string[] = [
    `# ${article.title}`,
    ``,
    `> ${article.dek}`,
    ``,
    `**Categoria:** ${article.category}${article.subcategory ? ` • ${article.subcategory}` : ''}`,
    `**Autor:** ${article.author.name} (${article.author.role})`,
    `**Publicado em:** ${article.publishedAt} | **Tempo de leitura:** ${article.readTime}`,
    ``,
    `---`,
    ``,
    article.leadParagraph,
    ``
  ];

  for (const block of article.content) {
    if (block.type === 'heading' && block.text) {
      lines.push(`## ${block.text}`, ``);
    } else if (block.type === 'paragraph' && block.text) {
      lines.push(block.text, ``);
    } else if (block.type === 'quote' && block.text) {
      lines.push(`> "${block.text}" — ${block.quoteAuthor || ''}`, ``);
    } else if (block.type === 'nextGame' && block.text) {
      lines.push(`**Próximos Jogos:** ${block.text}`, ``);
    }
  }

  lines.push(`---`, `Exportado via Portal Plantão Esportivo`);
  return lines.join('\n');
}
