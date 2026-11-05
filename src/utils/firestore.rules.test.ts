import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateRuleOperation,
  formatArticleForDriveMarkdown,
  isValidId,
  sanitizeId
} from './validation';
import { INITIAL_ARTICLES } from '../data/portalData';

const SERVER_TIME = 1793811000000;

test('Dirty Dozen #1: Identity Spoofing on UserProfile is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'users',
    operation: 'create',
    docId: 'user_A',
    ctx: { auth: { uid: 'user_A', emailVerified: true }, requestTimeMs: SERVER_TIME },
    incomingData: {
      uid: 'user_B', // Spoofed UID!
      displayName: 'Spoofer',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #2: Unverified Email write is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'users',
    operation: 'create',
    docId: 'user_A',
    ctx: { auth: { uid: 'user_A', emailVerified: false }, requestTimeMs: SERVER_TIME },
    incomingData: {
      uid: 'user_A',
      displayName: 'Unverified User',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #3: Shadow Field Injection on Bookmark is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'bookmarks',
    operation: 'create',
    parentUserId: 'user_A',
    docId: 'bm_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    incomingData: {
      userId: 'user_A',
      articleId: 'palmeiras-corinthians-virada',
      articleTitle: 'Palmeiras vira',
      category: 'Futebol',
      isAdmin: true, // Ghost shadow field
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #4: Orphaned Subcollection Write on Bookmark is denied when parent User is missing', () => {
  const allowed = evaluateRuleOperation({
    collection: 'bookmarks',
    operation: 'create',
    parentUserId: 'user_A',
    docId: 'bm_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: false // Parent /users/user_A does not exist!
    },
    incomingData: {
      userId: 'user_A',
      articleId: 'palmeiras-corinthians-virada',
      articleTitle: 'Palmeiras vira',
      category: 'Futebol',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #5: ID Poisoning Attack with illegal characters is denied', () => {
  assert.equal(isValidId('invalid$id!with spaces'), false);
  const allowed = evaluateRuleOperation({
    collection: 'comments',
    operation: 'create',
    docId: 'invalid$id!with spaces',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    incomingData: {
      articleId: 'palmeiras-corinthians-virada',
      authorId: 'user_A',
      authorName: 'Carlos',
      authorAvatar: 'CA',
      text: 'Ótimo jogo!',
      likes: 0,
      status: 'published',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #6: Denial-of-Wallet oversized comment text (>1000 chars) is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'comments',
    operation: 'create',
    docId: 'comment_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    incomingData: {
      articleId: 'palmeiras-corinthians-virada',
      authorId: 'user_A',
      authorName: 'Carlos',
      authorAvatar: 'CA',
      text: 'A'.repeat(1500),
      likes: 0,
      status: 'published',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #7: Client Timestamp Forgery on create is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'comments',
    operation: 'create',
    docId: 'comment_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    incomingData: {
      articleId: 'palmeiras-corinthians-virada',
      authorId: 'user_A',
      authorName: 'Carlos',
      authorAvatar: 'CA',
      text: 'Ótimo jogo!',
      likes: 0,
      status: 'published',
      createdAt: SERVER_TIME - 60000, // Forged timestamp
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #8: Immortal Field Mutation (createdAt / authorId) on update is denied', () => {
  const existing = {
    articleId: 'palmeiras-corinthians-virada',
    authorId: 'user_A',
    authorName: 'Carlos',
    authorAvatar: 'CA',
    text: 'Texto original',
    likes: 0,
    status: 'published',
    createdAt: SERVER_TIME - 5000,
    updatedAt: SERVER_TIME - 5000
  };
  const allowed = evaluateRuleOperation({
    collection: 'comments',
    operation: 'update',
    docId: 'comment_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    existingData: existing,
    incomingData: {
      ...existing,
      text: 'Texto atualizado',
      createdAt: SERVER_TIME, // Mutated immortal field!
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #9: Terminal State Bypass on archived comment is denied', () => {
  const existing = {
    articleId: 'palmeiras-corinthians-virada',
    authorId: 'user_A',
    authorName: 'Carlos',
    authorAvatar: 'CA',
    text: 'Texto arquivado',
    likes: 0,
    status: 'archived', // Terminal state!
    createdAt: SERVER_TIME - 5000,
    updatedAt: SERVER_TIME - 5000
  };
  const allowed = evaluateRuleOperation({
    collection: 'comments',
    operation: 'update',
    docId: 'comment_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    existingData: existing,
    incomingData: {
      ...existing,
      text: 'Tentando editar após arquivo',
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #10: Value Poisoning on whitelisted update key is denied', () => {
  const existing = {
    articleId: 'palmeiras-corinthians-virada',
    authorId: 'user_A',
    authorName: 'Carlos',
    authorAvatar: 'CA',
    text: 'Texto válido',
    likes: 0,
    status: 'published',
    createdAt: SERVER_TIME - 5000,
    updatedAt: SERVER_TIME - 5000
  };
  const allowed = evaluateRuleOperation({
    collection: 'comments',
    operation: 'update',
    docId: 'comment_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    existingData: existing,
    incomingData: {
      ...existing,
      text: 999999 as unknown as string, // Invalid type on whitelisted key!
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #11: Cross-Tenant Bookmark list/read is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'bookmarks',
    operation: 'list',
    parentUserId: 'user_A',
    ctx: {
      auth: { uid: 'user_B', emailVerified: true },
      requestTimeMs: SERVER_TIME
    },
    existingData: { userId: 'user_A' }
  });
  assert.equal(allowed, false);
});

test('Dirty Dozen #12: Cross-Tenant DriveExport read is denied', () => {
  const allowed = evaluateRuleOperation({
    collection: 'driveExports',
    operation: 'get',
    docId: 'exp_1',
    ctx: {
      auth: { uid: 'user_B', emailVerified: true },
      requestTimeMs: SERVER_TIME
    },
    existingData: { ownerId: 'user_A' }
  });
  assert.equal(allowed, false);
});

test('Valid operations succeed and Drive Markdown formatter outputs complete article', () => {
  const validCreate = evaluateRuleOperation({
    collection: 'comments',
    operation: 'create',
    docId: 'comment_valid_1',
    ctx: {
      auth: { uid: 'user_A', emailVerified: true },
      requestTimeMs: SERVER_TIME,
      parentUserExists: true,
      parentUserUid: 'user_A'
    },
    incomingData: {
      articleId: 'palmeiras-corinthians-virada',
      authorId: 'user_A',
      authorName: 'Carlos',
      authorAvatar: 'CA',
      text: 'Excelente cobertura do clássico!',
      likes: 0,
      status: 'published',
      createdAt: SERVER_TIME,
      updatedAt: SERVER_TIME
    }
  });
  assert.equal(validCreate, true);

  const md = formatArticleForDriveMarkdown(INITIAL_ARTICLES[0]);
  assert.equal(md.includes(INITIAL_ARTICLES[0].title), true);
  assert.equal(md.includes('Exportado via Portal Plantão Esportivo'), true);
  assert.equal(sanitizeId('bad id!@#'), 'bad-id---');
});
