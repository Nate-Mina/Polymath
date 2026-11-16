import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAnswerRecord } from '../types/polymath';
import { ALL_QUESTIONS } from '../data/questions';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App & Firestore with configured Database ID
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Validate connection to Firestore on initialization
 */
export async function testConnection(): Promise<boolean> {
  const probePath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline.');
    }
    // Probe doc might not exist, which is normal for a fresh connection check
    return true;
  }
}

// Automatically invoke connection test on boot
testConnection().catch((err) => console.warn('Firebase init probe:', err));

export interface FirebaseScoreRecord {
  id?: string;
  candidateName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  track: string;
  archetype?: string;
  rqScore?: number;
  confidenceScore?: number;
  timeTakenSec?: number;
  createdAt: string;
}

export interface GlobalTestStats {
  totalSubmissions: number;
  averageScore: number;
  totalScoreSum: number;
  fullTrackSubmissions?: number;
  fullTrackAvgScore?: number;
  partialTrackSubmissions?: number;
  partialTrackAvgScore?: number;
  updatedAt?: string;
}

export interface QuestionStatItem {
  questionId: string;
  attemptCount: number;
  correctCount: number;
  successRate: number; // 0-100%
  totalTimeSpentSec?: number;
  avgTimeSpentSec?: number;
  updatedAt?: string;
}

/**
 * Uploads candidate score to Firestore and updates aggregate test and per-question averages
 */
export async function saveScoreToFirebase(params: {
  candidateName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  track: string;
  archetype: string;
  rqScore: number;
  confidenceScore: number;
  timeTakenSec: number;
  answers: UserAnswerRecord[];
}): Promise<string> {
  const scoreId = `score_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const scorePath = `test_scores/${scoreId}`;

  const payload: FirebaseScoreRecord = {
    candidateName: params.candidateName.trim().slice(0, 100),
    score: Math.round(params.score * 10) / 10,
    correctCount: params.correctCount,
    totalQuestions: params.totalQuestions,
    track: params.track.slice(0, 30),
    archetype: params.archetype.slice(0, 100),
    rqScore: Math.round(params.rqScore),
    confidenceScore: Math.round(params.confidenceScore),
    timeTakenSec: Math.round(params.timeTakenSec),
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'test_scores', scoreId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, scorePath);
  }

  // Update Global Test Stats (Running Average)
  const globalStatsPath = 'test_stats/global';
  try {
    const statsDocRef = doc(db, 'test_stats', 'global');
    const existingSnap = await getDoc(statsDocRef);

    let totalSubmissions = 1;
    let totalScoreSum = payload.score;
    let fullTrackSubmissions = payload.track === 'full' ? 1 : 0;
    let fullTrackScoreSum = payload.track === 'full' ? payload.score : 0;
    let partialTrackSubmissions = payload.track === 'partial' ? 1 : 0;
    let partialTrackScoreSum = payload.track === 'partial' ? payload.score : 0;

    if (existingSnap.exists()) {
      const data = existingSnap.data() as GlobalTestStats;
      totalSubmissions = (data.totalSubmissions || 0) + 1;
      totalScoreSum = (data.totalScoreSum || 0) + payload.score;

      fullTrackSubmissions = (data.fullTrackSubmissions || 0) + (payload.track === 'full' ? 1 : 0);
      const prevFullSum = (data.fullTrackAvgScore || 0) * (data.fullTrackSubmissions || 0);
      fullTrackScoreSum = prevFullSum + (payload.track === 'full' ? payload.score : 0);

      partialTrackSubmissions = (data.partialTrackSubmissions || 0) + (payload.track === 'partial' ? 1 : 0);
      const prevPartialSum = (data.partialTrackAvgScore || 0) * (data.partialTrackSubmissions || 0);
      partialTrackScoreSum = prevPartialSum + (payload.track === 'partial' ? payload.score : 0);
    }

    const updatedStats: GlobalTestStats = {
      totalSubmissions,
      totalScoreSum: Math.round(totalScoreSum * 10) / 10,
      averageScore: Math.round((totalScoreSum / totalSubmissions) * 10) / 10,
      fullTrackSubmissions,
      fullTrackAvgScore:
        fullTrackSubmissions > 0 ? Math.round((fullTrackScoreSum / fullTrackSubmissions) * 10) / 10 : 0,
      partialTrackSubmissions,
      partialTrackAvgScore:
        partialTrackSubmissions > 0
          ? Math.round((partialTrackScoreSum / partialTrackSubmissions) * 10) / 10
          : 0,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(statsDocRef, updatedStats);
  } catch (err) {
    console.warn('Could not update global stats:', err);
  }

  // Update per-question empirical performance in parallel
  if (params.answers && params.answers.length > 0) {
    const questionRefMap = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

    for (const ans of params.answers) {
      const cleanQId = ans.questionId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 64);
      const qDocRef = doc(db, 'question_stats', cleanQId);
      const qRef = questionRefMap.get(ans.questionId);
      const isCorrect = qRef && ans.selectedOption !== null && ans.selectedOption !== undefined
        ? ans.selectedOption === qRef.correctIndex
        : false;

      try {
        const qSnap = await getDoc(qDocRef);
        let attemptCount = 1;
        let correctCount = isCorrect ? 1 : 0;
        let totalTimeSpentSec = ans.timeSpentSec || 0;

        if (qSnap.exists()) {
          const qData = qSnap.data() as QuestionStatItem;
          attemptCount = (qData.attemptCount || 0) + 1;
          correctCount = (qData.correctCount || 0) + (isCorrect ? 1 : 0);
          totalTimeSpentSec = (qData.totalTimeSpentSec || 0) + (ans.timeSpentSec || 0);
        }

        const successRate = Math.round((correctCount / attemptCount) * 1000) / 10;
        const avgTimeSpentSec = Math.round((totalTimeSpentSec / attemptCount) * 10) / 10;

        const qPayload: QuestionStatItem = {
          questionId: cleanQId,
          attemptCount,
          correctCount,
          successRate,
          totalTimeSpentSec,
          avgTimeSpentSec,
          updatedAt: new Date().toISOString(),
        };

        await setDoc(qDocRef, qPayload);
      } catch (err) {
        console.warn(`Could not update stats for question ${cleanQId}:`, err);
      }
    }
  }

  return scoreId;
}

/**
 * Fetch global test aggregate stats from Firestore
 */
export async function fetchGlobalStats(): Promise<GlobalTestStats | null> {
  const path = 'test_stats/global';
  try {
    const snap = await getDoc(doc(db, 'test_stats', 'global'));
    if (snap.exists()) {
      return snap.data() as GlobalTestStats;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Fetch question stats dictionary from Firestore
 */
export async function fetchQuestionStatsMap(): Promise<Record<string, QuestionStatItem>> {
  const path = 'question_stats';
  try {
    const snap = await getDocs(collection(db, 'question_stats'));
    const map: Record<string, QuestionStatItem> = {};
    snap.forEach((docItem) => {
      const data = docItem.data() as QuestionStatItem;
      map[data.questionId] = data;
    });
    return map;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {};
  }
}

/**
 * Fetch recent test scores from Firebase
 */
export async function fetchRecentFirebaseScores(count = 20): Promise<FirebaseScoreRecord[]> {
  const path = 'test_scores';
  try {
    const q = query(collection(db, 'test_scores'), limit(count));
    const snap = await getDocs(q);
    const list: FirebaseScoreRecord[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as FirebaseScoreRecord) });
    });
    // Sort descending by score then date
    return list.sort((a, b) => b.score - a.score);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}
