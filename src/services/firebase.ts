import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  MAX_ARTICLE_TITLE_LENGTH,
  MAX_AUTHOR_AVATAR_LENGTH,
  MAX_AUTHOR_NAME_LENGTH,
  MAX_CATEGORY_LENGTH,
  MAX_COMMENT_TEXT_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_FILE_NAME_LENGTH,
  MAX_MIME_TYPE_LENGTH,
  MAX_PHOTO_URL_LENGTH,
  sanitizeId,
  truncateString
} from '../utils/validation';

// 1. Initialize Firebase App, Firestore & Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 2. Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// 3. Google Workspace OAuth Scopes (All requested Google Drive scopes)
export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts'
];

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

// 4. In-Memory Access Token Cache (NEVER store in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User has a Firebase session, though Drive OAuth token requires interactive sign-in if expired
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    await ensureUserProfile(result.user);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: unknown) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// 5. Mandatory Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 6. Firestore Data Operations (Synchronized with firebase-blueprint.json & firestore.rules)

export async function ensureUserProfile(user: User): Promise<void> {
  const userId = sanitizeId(user.uid);
  const userPath = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  try {
    const snap = await getDoc(userRef);
    const displayName = truncateString(
      user.displayName || user.email?.split('@')[0] || 'Leitor Plantão',
      MAX_DISPLAY_NAME_LENGTH
    );
    const photoURL = user.photoURL
      ? truncateString(user.photoURL, MAX_PHOTO_URL_LENGTH)
      : '';

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: userId,
        displayName,
        ...(photoURL ? { photoURL } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export interface CloudBookmark {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  category: string;
  driveFileId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function saveBookmarkToCloud(
  user: User,
  article: { id: string; title: string; category: string },
  driveFileId?: string
): Promise<void> {
  await ensureUserProfile(user);
  const userId = sanitizeId(user.uid);
  const bookmarkId = sanitizeId(article.id);
  const path = `users/${userId}/bookmarks/${bookmarkId}`;

  try {
    await setDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId), {
      userId,
      articleId: bookmarkId,
      articleTitle: truncateString(article.title, MAX_ARTICLE_TITLE_LENGTH),
      category: truncateString(article.category, MAX_CATEGORY_LENGTH),
      ...(driveFileId ? { driveFileId: sanitizeId(driveFileId) } : {}),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function removeBookmarkFromCloud(user: User, articleId: string): Promise<void> {
  const userId = sanitizeId(user.uid);
  const bookmarkId = sanitizeId(articleId);
  const path = `users/${userId}/bookmarks/${bookmarkId}`;

  try {
    await deleteDoc(doc(db, 'users', userId, 'bookmarks', bookmarkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserBookmarks(
  user: User,
  onUpdate: (bookmarks: CloudBookmark[]) => void
) {
  const userId = sanitizeId(user.uid);
  const path = `users/${userId}/bookmarks`;
  const q = query(
    collection(db, 'users', userId, 'bookmarks'),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CloudBookmark[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CloudBookmark, 'id'>)
      }));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface CloudComment {
  id: string;
  articleId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  likes: number;
  status: 'published' | 'archived';
  createdAt?: Timestamp;
}

export async function postCommentToCloud(
  user: User,
  articleId: string,
  text: string
): Promise<void> {
  await ensureUserProfile(user);
  const userId = sanitizeId(user.uid);
  const cleanArticleId = sanitizeId(articleId);
  const commentId = sanitizeId(`c_${userId.slice(0, 12)}_${Date.now()}`);
  const path = `comments/${commentId}`;

  const rawName = user.displayName || user.email?.split('@')[0] || 'Leitor Plantão';
  const authorName = truncateString(rawName, MAX_AUTHOR_NAME_LENGTH);
  const initials =
    authorName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'LP';
  const authorAvatar = truncateString(initials, MAX_AUTHOR_AVATAR_LENGTH);

  try {
    await setDoc(doc(db, 'comments', commentId), {
      articleId: cleanArticleId,
      authorId: userId,
      authorName,
      authorAvatar,
      text: truncateString(text, MAX_COMMENT_TEXT_LENGTH),
      likes: 0,
      status: 'published',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToArticleComments(
  articleId: string,
  onUpdate: (comments: CloudComment[]) => void
) {
  const cleanArticleId = sanitizeId(articleId);
  const path = 'comments';
  const q = query(
    collection(db, 'comments'),
    where('status', '==', 'published'),
    where('articleId', '==', cleanArticleId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CloudComment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<CloudComment, 'id'>)
      }));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export interface CloudDriveExport {
  id: string;
  ownerId: string;
  driveFileId: string;
  fileName: string;
  mimeType: string;
  articleId: string;
  status: 'synced' | 'deleted';
  createdAt?: Timestamp;
}

export async function recordDriveExportInCloud(
  user: User,
  params: {
    driveFileId: string;
    fileName: string;
    mimeType: string;
    articleId: string;
  }
): Promise<void> {
  await ensureUserProfile(user);
  const ownerId = sanitizeId(user.uid);
  const exportId = sanitizeId(`exp_${params.driveFileId}`);
  const path = `driveExports/${exportId}`;

  try {
    await setDoc(doc(db, 'driveExports', exportId), {
      ownerId,
      driveFileId: sanitizeId(params.driveFileId),
      fileName: truncateString(params.fileName, MAX_FILE_NAME_LENGTH),
      mimeType: truncateString(params.mimeType, MAX_MIME_TYPE_LENGTH),
      articleId: sanitizeId(params.articleId),
      status: 'synced',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markDriveExportDeletedInCloud(
  driveFileId: string
): Promise<void> {
  const exportId = sanitizeId(`exp_${driveFileId}`);
  const path = `driveExports/${exportId}`;

  try {
    const ref = doc(db, 'driveExports', exportId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().status !== 'deleted') {
      await updateDoc(ref, {
        status: 'deleted',
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeToUserDriveExports(
  user: User,
  onUpdate: (exportsList: CloudDriveExport[]) => void
) {
  const ownerId = sanitizeId(user.uid);
  const path = 'driveExports';
  const q = query(
    collection(db, 'driveExports'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CloudDriveExport[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CloudDriveExport, 'id'>)
        }))
        .filter((item) => item.status === 'synced');
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
