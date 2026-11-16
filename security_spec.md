# Security Specification: Polymath Aptitude Assessment

## 1. Data Invariants
- `test_scores/{scoreId}`:
  - Candidates submit assessment scores.
  - `candidateName` must be a non-empty string between 2 and 100 characters.
  - `score`, `correctCount`, and `totalQuestions` must be valid numeric values (`0 <= score <= 100`).
  - Read access allows fetching leaderboard entries and public test performance.
  - Creation requires schema validation (`isValidTestScore`).
  - Documents cannot be mutated or deleted once submitted (immutable records to preserve score integrity).
- `test_stats/global`:
  - Public read for community averages (total tests completed, average score).
  - Updates require valid aggregation fields (`totalSubmissions >= 0`, `averageScore >= 0 && <= 100`).
- `question_stats/{questionId}`:
  - Public read for empirical difficulty & community question accuracy.
  - Creation and update must conform to `isValidQuestionStats` (`successRate >= 0 && <= 100`, `attemptCount >= 1`).
  - Document IDs must match standard identifier constraints (`isValidId`).

## 2. Dirty Dozen Attack Payloads
1. Payload with 50KB name string -> Blocked by `.size() <= 100`.
2. Negative score (`score: -10`) -> Blocked by range guard (`>= 0 && <= 100`).
3. Impossible score (`score: 150`) -> Blocked by range guard.
4. Overwriting an existing score document (`update`) -> Denied (scores are immutable).
5. Deleting an existing score document -> Denied.
6. Malformed questionId in `question_stats` with path traversal -> Blocked by `isValidId(questionId)`.
7. Success rate > 100 in `question_stats` -> Blocked by range guard.
8. Injection of arbitrary ghost properties -> Blocked by strict `hasAll` and `hasOnly` key validation.
9. Blank candidate name string -> Blocked by `.size() >= 2`.
10. String injected into numeric `totalQuestions` -> Blocked by `is number` check.
11. Total questions equal to 0 -> Blocked by `totalQuestions > 0`.
12. Unauthenticated write bypass attempt -> Validated against schema; anonymous/guest testing allowed for assessment submission but bounded by strict schema guards.
