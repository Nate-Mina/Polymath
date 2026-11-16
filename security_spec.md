# Security Specification: Polymath Aptitude Assessment

## 1. Data Invariants
- `/users/{userId}/assessments/{recordId}`:
  - Strictly private owner-only full assessment records.
  - Only verified authenticated user (`request.auth.uid == userId`) can `read`, `create`, or `delete`.
  - Updates are prohibited (assessment records are immutable snapshots).
  - `scholarName` must be 1 to 40 characters; `polymathQuotient` must be bounded in `[0, 160]`; `accuracyPercentage` in `[0, 100]`; `createdAt == request.time`.
- `/community_scores/{scoreId}`:
  - Public zero-PII scoreboard entry. Contains NO email, phone, or private metadata.
  - `allow get` requires `isSignedIn() && (existing().isPublic == true || isOwner(existing().userId))`.
  - `allow list` strictly enforces `isSignedIn() && resource.data.isPublic == true` so clients cannot query non-public documents.
  - `allow create` requires verified auth, `incoming().userId == request.auth.uid`, `incoming().isPublic == true`, `createdAt == request.time`, and strict `hasAll`/`hasOnly` keys.
  - `allow delete` permitted only for owner (`isOwner(existing().userId)`).
- `/community_stats/global`:
  - Singleton aggregate document tracking `totalAttempts`, `totalPqSum`, `totalAccuracySum`, `highestPq`, and `updatedAt`.
  - `allow get: if isSignedIn();` (`allow list: if false;`).
  - `allow create` requires `totalAttempts == 1`, valid score bounds, and `updatedAt == request.time`.
  - `allow update` requires exact `+1` increment (`incoming().totalAttempts == existing().totalAttempts + 1`), bounded sum deltas (`0 <= deltaPQ <= 160`, `0 <= deltaAcc <= 100`), non-decreasing `highestPq <= 160`, and `updatedAt == request.time`.
- `/question_stats/{questionId}`:
  - Aggregated per-question empirical accuracy and deliberation time.
  - `allow read: if isSignedIn();`
  - `allow create, update` require verified user, valid `questionId`, bounded numeric values (`0 <= successRate <= 100`), and `updatedAt == request.time`.

## 2. Dirty Dozen Attack Payloads
1. Unauthenticated read/write to `/community_scores` or `/users/{uid}/assessments` -> Denied (`isSignedIn()` fails).
2. Cross-user assessment read/create/delete in `/users/{otherUid}/assessments` -> Denied (`isOwner(userId)` fails).
3. Spoofed `userId` in `/community_scores` -> Denied (`incoming().userId == request.auth.uid` fails).
4. Setting `isPublic: false` on `/community_scores` create or listing without `where('isPublic', '==', true)` -> Denied.
5. Client-forged `createdAt` or `updatedAt` timestamp -> Denied (`== request.time` check fails).
6. Ghost/shadow field injection (e.g., `email: "leak@..."` or `isAdmin: true`) -> Denied by `hasOnly(...)`.
7. Oversized `scholarName` (e.g., 500 chars) or blank name -> Denied by `size() >= 1 && size() <= 40`.
8. Corrupting `community_stats/global` by jumping `totalAttempts` by `+50` or decrementing -> Denied by `totalAttempts == prev + 1`.
9. Injecting absurd `polymathQuotient: 99999` into `community_stats/global` -> Denied by delta bound `<= 160`.
10. Overwriting an existing `/community_scores/{id}` or `/users/{uid}/assessments/{id}` -> Denied (`update: if false`).
11. Path poisoning with invalid characters or 1.5KB document ID -> Denied by `isValidId()`.
12. Email unverified token spoof attempt -> Denied by `request.auth.token.email_verified == true`.
