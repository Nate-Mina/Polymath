# Polymath Test: Progress Tracking, Cloud Score Saving & Community Scores

Adds a segmented assessment progress indicator with a remaining-questions counter, an editable scholar name input at the top of assessments with an explicit Firebase save flow on results, and a comprehensive Scores page comparing your Polymath Quotient (PQ) and accuracy against both the global community average and your personal history.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices from Clarification**
> - **Confirmed Decision 1 (Progress Indicator)**: Segmented progress bar across the top of the assessment screen paired with an explicit `"X remaining"` badge.
> - **Confirmed Decision 2 (Name Input & Saving)**: Editable scholar name field positioned at the top of the assessment screen, paired with a **"Save Score to Cloud"** action on the Results screen to persist the name and score to Firebase Firestore.
> - **Confirmed Decision 3 (Scores Scope)**: The Scores page compares the user against **both the global community average** of all past test takers **and their own personal score history**.
> - **Confirmed Decision 4 (Primary Metric)**: **Polymath Quotient (PQ)** serves as the primary benchmark score, with **accuracy percentage** displayed alongside it.

- **Authentication Requirement**: In this Android environment, Firebase Firestore access requires **Google Sign-In via Jetpack Credential Manager**. The app will attempt silent Google Sign-In on launch and provide a Renaissance-themed Sign-In screen with a **"Sign in with Google"** button, pre-filling the editable scholar name field from the signed-in profile while letting users enter any custom name before saving.

---

## 1. Overview & Core Concept

- **What It Does**: Elevates the Polymath Test from an individual self-assessment into a trackable, cloud-backed benchmarking experience. Test takers maintain clear situational awareness of how many problems remain, personalize each attempt with a scholar name, deliberately commit their results to Firebase Firestore, and inspect how their Polymath Quotient and accuracy stack up against everyone else who has taken the test.
- **Target Audience**: Lifelong learners, curious generalists, and competitive trivia/aptitude enthusiasts who want immediate clarity during long 24-question sessions and meaningful social/historical context for their scores.
- **Key Value**: Eliminates uncertainty during multi-domain assessments, preserves achievements safely in the cloud, and turns an isolated numerical score (`PQ 124`) into an intuitive benchmark (`+16 PQ above the global average of 108`).

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌──────────────────┐     ┌──────────────────────────────┐     ┌─────────────────────────┐
│  Google Sign-In  │────▶│  Home / Protocol Selection   │────▶│    Assessment Screen    │
│ (Auto or Button) │     │  (Tap Assessment Mode)       │     │ - Segmented Progress    │
└──────────────────┘     └──────────────────────────────┘     │ - "X Left" Badge        │
                                                              │ - Top Scholar Name Box  │
                                                              │ - Read-Aloud & Options  │
                                                              └────────────┬────────────┘
                                                                           │ Finish
                                                                           ▼
┌──────────────────┐     ┌──────────────────────────────┐     ┌─────────────────────────┐
│   Scores Page    │◀────│  Firebase Save Confirmation  │◀────│      Result Screen      │
│ - Global Avg PQ  │     │  (Atomic Batch Commit)       │     │ - Archetype & Radar     │
│ - Delta vs Avg   │     └──────────────────────────────┘     │ - Confirm Scholar Name  │
│ - My Scores/Feed │                                          │ - [Save Score to Cloud] │
└──────────────────┘                                          └─────────────────────────┘
```

1. **Sign-In Gate**: On startup, silent Credential Manager sign-in runs automatically. If unauthenticated, a focused Scholar's Entry screen displays the astrolabe emblem, brief overview, and a gold **"Sign in with Google"** button.
2. **Assessment Header & Name Entry**:
   - At the very top of the assessment sits the **Segmented Progress Bar**: one slim rounded segment per question (`Completed` in Renaissance Gold, `Active` in Warm Gold Light, `Remaining` in Midnight Border) paired with a high-contrast pill badge showing `"18 left"` (updating live on each advance).
   - Directly beneath the progress header sits a sleek **Scholar Name** card (`OutlinedTextField`) pre-populated with the user's profile name or last entered name, editable before or during the test without interrupting the read-aloud flow.
3. **Result Screen & Explicit Cloud Save**:
   - Displays the calculated Polymath Quotient (`PQ`), accuracy percentage, Breadth Index, Archetype, and 8-axis Radar Chart.
   - A dedicated **"Save Score to Cloud"** card confirms the scholar name (still editable in case of typos), previews the PQ and accuracy, and executes the Firestore write on tap—transitioning cleanly through `Saving…` → `Saved to Cloud` with a one-tap `"View Scores & Averages"` button.
4. **Scores Page (Community Comparison & History)**:
   - Accessible from the bottom navigation bar (**Scores** tab, replacing Archives) or directly from the Result screen.
   - **Global Comparison Card**: Prominently contrasts **Your Latest PQ** (and Accuracy %) against the **Global Community Average PQ** (and Average Accuracy %) across all past test takers, highlighting the exact difference badge (e.g., `+14 PQ above average` in Scholar Emerald or `-5 PQ vs average` in Golden Amber) and a dual-marker comparison bar.
   - **Personal Summary Strip**: Shows Personal Average PQ, Personal Best PQ, and Total Saved Tests.
   - **Two-Tab Score Feed**: Switch cleanly between **My Saved Scores** (with tap-to-view 8-axis Radar Chart breakdown and delete support) and **Community Scores** (recent public entries showing scholar name, PQ, accuracy %, archetype, and comparison delta).

### Visual Identity & Theme

- **Aesthetic Direction**: *Celestial Renaissance Observatory* — dark scholarly precision punctuated by warm metallic gold accents and crisp high-contrast typography.
- **Color Tokens**:
  - Surfaces: `CelestialNavy` (`#090E1A`) background, `MidnightDeep` (`#0F172A`) top bars and comparison panels, `MidnightCard` (`#1E293B`) cards, `MidnightBorder` (`#334155`) hairlines.
  - Accents: `RenaissanceGold` (`#D4AF37`) for completed progress segments and primary save actions, `WarmGoldLight` (`#FDE68A`) for active segment glow and remaining badge text, `ScholarEmerald` (`#10B981`) for positive delta vs. average, `GoldenAmber` (`#F59E0B`) for below-average or benchmark markers.
  - Text: `ParchmentWhite` (`#F8FAFC`) primary copy, `ParchmentMuted` (`#94A3B8`) secondary metadata.
- **Interactive Feedback & Motion**: Animated segment fills when advancing questions, deterministic loading spinners during Firebase save/fetch, clear inline validation if the scholar name is blank, and spring/fade transitions on comparison cards.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Atomic Aggregate Document + Public Score Entries vs. Full-Collection Client Aggregation**
  - *Chosen Approach*: Maintain a lightweight aggregate summary document (`community_stats/global`) updated atomically via server increments alongside individual public score entries (`community_scores`) and private full assessments (`users/{uid}/assessments`).
  - *Why*: Computing an average by downloading every score document ever created does not scale and violates strict Firestore security-rule isolation. An atomic counter document gives an exact, real-time global average across *all* historical test takers in a single document read, while bounded queries on `community_scores` populate the recent scores feed.
  - *Alternatives Considered*: Downloading the entire `scores` collection on the client to average locally (fails on scale and quota, and exposes unindexed full-collection scans).

- **Decision 2: Explicit "Save Score to Cloud" Action on Results vs. Silent Auto-Save**
  - *Chosen Approach*: Let the user enter/edit their name at the top of the assessment and tap an explicit **Save Score to Cloud** button on the Results screen (per confirmed preference).
  - *Why*: Prevents test abandonment or accidental practice runs from skewing the global community average, and lets users verify their scholar name before publishing their score.
  - *Alternatives Considered*: Auto-saving immediately upon answering the final question (risks polluting community averages with test/practice runs or unedited default names).

- **Decision 3: Segmented Progress Bar Scaling for 24-Question Sessions**
  - *Chosen Approach*: Render proportional flex-weighted segments in a single horizontal track with `2.dp` gaps so both 8-question Rapid and 24-question Comprehensive tests fit cleanly inside one crisp line, accompanied by an explicit `"X left"` pill badge.
  - *Why*: Wrapping 24 numbered pills across multiple rows consumes valuable vertical screen space above the question card; a crisp segmented track plus numeric `"X left"` badge communicates both exact remaining count and overall proportion at a glance.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        MainActivity (Auth Gate)                         │
│   CredentialManager (Google Sign-In) ──▶ FirebaseAuth.authStateFlow()   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ Authenticated (uid, displayName)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           PolymathViewModel                             │
│  - scholarName: StateFlow<String>                                       │
│  - quizState (index, remainingCount, result, saveStatus)                │
│  - scoresUiState (communityStats, personalScores, communityScores)      │
└──────────────┬───────────────────────────────────────────┬──────────────┘
               │                                           │
               ▼                                           ▼
┌──────────────────────────────┐            ┌─────────────────────────────┐
│    Assessment & Results UI   │            │       Scores Page UI        │
│ - SegmentedProgressHeader    │            │ - GlobalAvgComparisonCard   │
│ - ScholarNameTopField        │            │ - PersonalAverageSummary    │
│ - SaveScoreToCloudCard       │            │ - MyScores / CommunityTabs  │
└──────────────┬───────────────┘            └──────────────▲──────────────┘
               │ Explicit Save (WriteBatch)                │ Realtime Flows
               ▼                                           │
┌─────────────────────────────────────────────────────────────────────────┐
│                   FirestoreScoreRepository (Named DB ID)                │
│  1. /users/{uid}/assessments/{id}   (Private full record + 8 domains)   │
│  2. /community_scores/{id}          (Public scoreboard entry, no PII)   │
│  3. /community_stats/global         (Atomic totalAttempts & sums)       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Firestore Schema

1. **Private Assessment Record** (`/users/{userId}/assessments/{recordId}`):
   - Stores `userId`, `scholarName`, `modeName`, `polymathQuotient` (75–160), `accuracyPercentage` (0–100), `percentile`, `breadthIndex`, `archetypeName`, `archetypeTitle`, `correctCount`, `totalCount`, `durationSeconds`, `domainScores` (map), and `createdAt` (`@ServerTimestamp`).
   - Strict owner-only rules: only `request.auth.uid == userId` can read, create, or delete.
2. **Community Score Entry** (`/community_scores/{scoreId}`):
   - Contains **zero PII** (no email or private metadata): `userId`, `scholarName` (1–40 chars), `polymathQuotient`, `accuracyPercentage`, `archetypeTitle`, `modeName`, `isPublic` (`true`), and `createdAt` (`@ServerTimestamp`).
   - Enforces `isPublic == true` in both `allow list` security rules and the client `.whereEqualTo("isPublic", true)` query; only the owning `request.auth.uid` can create or delete their entry.
3. **Global Community Aggregate** (`/community_stats/global`):
   - Single aggregate document (`allow get: if isSignedIn()`, no `list` access): `totalAttempts` (Long), `totalPqSum` (Long), `totalAccuracySum` (Long), `highestPq` (Long), and `updatedAt` (Timestamp).
   - Updated atomically via `FieldValue.increment(...)` inside the same `WriteBatch` when saving a score, with security rules enforcing exact `+1` count increments and valid score bounds (`75..160` PQ, `0..100` accuracy).

### Interactive Component & State Mapping

- **Scholar Name Input (`AssessmentScreen`)**: Updates `PolymathViewModel.scholarName` (trimmed and length-capped at 40 characters); pre-initialized from `Firebase.auth.currentUser?.displayName` on session start.
- **Segmented Progress Header (`AssessmentScreen`)**: Computes `completedCount = currentIndex + (if (isAnswerSubmitted) 1 else 0)` and `remainingCount = (totalCount - completedCount).coerceAtLeast(0)` to render the segmented bar and `"$remainingCount left"` indicator.
- **Save Score Action (`ResultScreen`)**: Validates non-blank scholar name, disables button during `SaveStatus.SAVING`, executes an atomic Firestore `WriteBatch` across the three paths, catches exceptions with structured `handleFirestoreError(...)` logging, and transitions to `SaveStatus.SAVED` (preventing duplicate saves for the same assessment ID).
- **Scores Page (`ScoresScreen`)**: Collects `StateFlow<ScoresUiState>` combining real-time `snapshots()` from the user's assessments, `community_stats/global`, and top/recent `community_scores`, calculating:
  - `globalAveragePq = totalPqSum.toFloat() / totalAttempts`
  - `globalAverageAccuracy = totalAccuracySum.toFloat() / totalAttempts`
  - `personalAveragePq` and `deltaVsGlobal = userComparisonPq - globalAveragePq`

### Firebase Provisioning & Verification Strategy

- Upon plan approval, execute Firebase provisioning (`keytool` fingerprint extraction -> UI terms consent -> `ProvisionFirebase` RPC for `"firestore"` -> SHA-1 `google-services.json` verification), write `firebase-blueprint.json`, `firestore.rules`, and `firebase.json` targeting the single provisioned `firestore_database_id`, verify security rules with both JavaScript (`firestore.test.js`) and Robolectric (`*RuleTest.kt`) emulator suites, deploy rules via `DeployRules` RPC, and compile the Android app.
