import { AssessmentScope } from '../types/polymath';

export interface LocalLeaderboardEntry {
  id: string;
  candidateName: string;
  timestamp: number;
  score: number; // 0 - 100%
  correctCount: number;
  totalQuestions: number;
  track: AssessmentScope | string;
  archetype: string;
  rqScore: number;
  confidenceScore: number;
  timeTakenSec: number;
  formattedDate: string;
}

const STORAGE_KEY = 'polymath_local_leaderboard_attempts_v1';

export function getLocalLeaderboard(): LocalLeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to parse local leaderboard from storage:', err);
    return [];
  }
}

export function saveLocalLeaderboardEntry(
  entry: Omit<LocalLeaderboardEntry, 'id' | 'timestamp' | 'formattedDate'>
): { saved: LocalLeaderboardEntry; all: LocalLeaderboardEntry[]; isNewBest: boolean } {
  const existing = getLocalLeaderboard();
  const dateObj = new Date();

  const newEntry: LocalLeaderboardEntry = {
    ...entry,
    id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    formattedDate: dateObj.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // Check if this is the user's best score so far
  const userPastAttempts = existing.filter(
    (e) => e.candidateName.trim().toLowerCase() === entry.candidateName.trim().toLowerCase()
  );
  const previousBestScore = userPastAttempts.length > 0 ? Math.max(...userPastAttempts.map((e) => e.score)) : -1;
  const isNewBest = newEntry.score > previousBestScore;

  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100))); // keep up to 100 local attempts
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }

  return { saved: newEntry, all: updated, isNewBest };
}

export function getPersonalBest(candidateName?: string): LocalLeaderboardEntry | null {
  const all = getLocalLeaderboard();
  if (all.length === 0) return null;

  const pool = candidateName?.trim()
    ? all.filter((e) => e.candidateName.trim().toLowerCase() === candidateName.trim().toLowerCase())
    : all;

  if (pool.length === 0) return null;

  return [...pool].sort((a, b) => b.score - a.score || b.rqScore - a.rqScore)[0] || null;
}

export function compareWithPreviousAttempt(
  currentScore: number,
  candidateName: string
): {
  diffScore: number;
  hasPrevious: boolean;
  previousAttempt: LocalLeaderboardEntry | null;
  attemptCount: number;
  rankAmongAll: number;
  totalAttempts: number;
} {
  const all = getLocalLeaderboard();
  const userAttempts = all.filter(
    (e) => e.candidateName.trim().toLowerCase() === candidateName.trim().toLowerCase()
  );

  // User attempts are ordered newest first. The immediate prior attempt is index 1 if just saved, or index 0 if not yet saved.
  const previousAttempt = userAttempts.length > 1 ? userAttempts[1] : userAttempts[0] || null;
  const diffScore = previousAttempt ? Math.round((currentScore - previousAttempt.score) * 10) / 10 : 0;

  // Rank among all local attempts
  const sorted = [...all].sort((a, b) => b.score - a.score);
  const rankIndex = sorted.findIndex((e) => e.score <= currentScore);
  const rankAmongAll = rankIndex === -1 ? sorted.length + 1 : rankIndex + 1;

  return {
    diffScore,
    hasPrevious: !!previousAttempt,
    previousAttempt,
    attemptCount: userAttempts.length,
    rankAmongAll,
    totalAttempts: all.length,
  };
}

export function clearLocalLeaderboard(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear local leaderboard:', err);
  }
}
