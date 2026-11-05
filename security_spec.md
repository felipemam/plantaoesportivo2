# Plantão Esportivo — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Default-Deny Global Safety Net**: Any path not explicitly matched is unconditionally denied (`allow read, write: if false`).
2. **Verified Identity Enforcement**: All write operations (`create`, `update`, `delete`) across `/users`, `/users/{userId}/bookmarks`, `/comments`, and `/driveExports` require an authenticated user with `request.auth.token.email_verified == true`.
3. **Path Variable Hardening (`isValidId`)**: Every single-document target operation (`get`, `create`, `update`, `delete`) validates all path IDs against `^[a-zA-Z0-9_\-]+$` with length `1..128`. `list` operations never call `isValidId` on the target document ID or `get()`/`exists()` inside `allow list`.
4. **Master Gate & Relational Sync**:
   - Subcollection `/users/{userId}/bookmarks/{bookmarkId}` requires that the parent `/users/{userId}` document exists and its `uid` matches `request.auth.uid`.
   - Creating a document in `/comments/{commentId}` or `/driveExports/{exportId}` verifies that the referenced `/users/{authorId}` or `/users/{ownerId}` document exists and belongs to `request.auth.uid`.
5. **Anti-Update-Gap & Schema Blueprints**:
   - Every `create` and `update` invokes `isValidUserProfile`, `isValidBookmark`, `isValidComment`, or `isValidDriveExport`.
   - Every string field enforces `.size() <= MAX`.
   - Every `create` enforces `hasAll` and `hasOnly` key allowlists.
   - Every `update` wraps logic with `isValid[Entity](incoming())` and splits mutations into explicit Action branches using `incoming().diff(existing()).affectedKeys().hasOnly([...])`.
6. **Temporal & Ownership Immutability**:
   - On `create`: `incoming().createdAt == request.time && incoming().updatedAt == request.time`.
   - On `update`: `incoming().createdAt == existing().createdAt && incoming().updatedAt == request.time`, and owner/author fields (`uid`, `userId`, `authorId`, `ownerId`) are immutable.
7. **Terminal State Locking**:
   - `Comment.status`: Once `existing().status == 'archived'`, no further updates are permitted.
   - `DriveExport.status`: Once `existing().status == 'deleted'`, no further updates are permitted.
8. **Secure List Queries (Query Enforcer)**:
   - `/users/{userId}/bookmarks`: `allow list: if isSignedIn() && request.auth.uid == userId && resource.data.userId == request.auth.uid;`
   - `/comments`: `allow list: if isSignedIn() && (resource.data.authorId == request.auth.uid || resource.data.status == 'published');`
   - `/driveExports`: `allow list: if isSignedIn() && resource.data.ownerId == request.auth.uid;`

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Vectors)

1. **Payload 1 (Identity Spoofing on UserProfile)**: Authenticated user `user_A` attempts to create `/users/user_A` with `{ uid: "user_B", displayName: "Spoofer", createdAt: SERVER_TIME, updatedAt: SERVER_TIME }` -> **PERMISSION_DENIED**.
2. **Payload 2 (Unverified Email Write)**: User `user_A` with `email_verified: false` attempts to create `/users/user_A` -> **PERMISSION_DENIED**.
3. **Payload 3 (Shadow Field Injection on Bookmark)**: User `user_A` sends valid bookmark fields plus `{ isAdmin: true }` -> **PERMISSION_DENIED** (`hasOnly` rejection).
4. **Payload 4 (Orphaned Subcollection Write on Bookmark)**: User `user_A` attempts to create `/users/user_A/bookmarks/bm_1` when `/users/user_A` does not exist -> **PERMISSION_DENIED** (Master Gate `exists()` failure).
5. **Payload 5 (ID Poisoning Attack)**: User `user_A` attempts to create `/comments/invalid$id!with spaces` -> **PERMISSION_DENIED** (`isValidId` regex failure).
6. **Payload 6 (Denial-of-Wallet Oversized String)**: User `user_A` attempts to create `/comments/c_1` with `text` of length `2500` (max `1000`) -> **PERMISSION_DENIED**.
7. **Payload 7 (Client Timestamp Forgery)**: User `user_A` attempts to create `/comments/c_1` with `createdAt` set to a past timestamp (`request.time - 1000s`) -> **PERMISSION_DENIED**.
8. **Payload 8 (Immortal Field Mutation on Update)**: User `user_A` attempts to update `/comments/c_1` changing `createdAt` or `authorId` -> **PERMISSION_DENIED**.
9. **Payload 9 (Terminal State Bypass on Comment)**: User `user_A` attempts to update `/comments/c_1` when `existing().status == 'archived'` -> **PERMISSION_DENIED**.
10. **Payload 10 (Value Poisoning on Whitelisted Update Key)**: User `user_A` updates only `['text', 'updatedAt']` on `/comments/c_1`, but passes `text: 99999` (number instead of string) -> **PERMISSION_DENIED** (`isValidComment` wrapper blocks invalid type).
11. **Payload 11 (Cross-Tenant Bookmark Read/List)**: User `user_B` attempts `get` or `list` on `/users/user_A/bookmarks` -> **PERMISSION_DENIED**.
12. **Payload 12 (Cross-Tenant DriveExport Access)**: User `user_B` attempts to read or update `/driveExports/exp_1` where `ownerId == 'user_A'` -> **PERMISSION_DENIED**.
