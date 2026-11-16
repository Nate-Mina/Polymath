import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAnswerRecord, PolymathEvaluation, AssessmentScope } from '../types/polymath';
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase App, Auth, and Named Firestore Database
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export type AuthUser = FirebaseUser;

/**
 * Validate connection to Firestore on initialization
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

testConnection().catch((err) => console.warn('Firebase init probe:', err));

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export interface PersonalAssessmentRecord {
  id: string;
  userId: string;
  scholarName: string;
  modeName: string;
  polymathQuotient: number;
  accuracyPercentage: number;
  confidenceScore: number;
  breadthIndex: number;
  archetypeName: string;
  archetypeTitle: string;
  correctCount: number;
  totalCount: number;
  durationSeconds: number;
  domainScores: Record<string, number>;
  createdAtMs: number;
}

export interface CommunityScoreRecord {
  id: string;
  userId: string;
  scholarName: string;
  polymathQuotient: number;
  accuracyPercentage: number;
  archetypeTitle: string;
  modeName: string;
  isPublic: boolean;
  createdAtMs: number;
}

export interface GlobalCommunityStats {
  totalAttempts: number;
  totalPqSum: number;
  totalAccuracySum: number;
  highestPq: number;
  averagePq: number;
  averageAccuracy: number;
  updatedAtMs: number;
}

export interface QuestionStatItem {
  questionId: string;
  attemptCount: number;
  correctCount: number;
  successRate: number;
  totalTimeSpentSec?: number;
  avgTimeSpentSec?: number;
}

function timestampToMs(ts: unknown): number {
  if (!ts) return Date.now();
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts === 'object' && ts !== null && 'seconds' in ts) {
    return Number((ts as { seconds: number }).seconds) * 1000;
  }
  if (typeof ts === 'string') {
    const parsed = Date.parse(ts);
    return Number.isNaN(parsed) ? Date.now() : parsed;
  }
  return Date.now();
}

function formatScopeLabel(scope: AssessmentScope): string {
  switch (scope) {
    case 'partial':
      return 'Partial Polymath (22)';
    case 'full':
      return 'Full Exam (80)';
    case 'technical':
      return 'STEM Suite (60)';
    case 'humanities':
      return 'Humanities (20)';
    case 'single-field':
      return 'Single Field (4)';
    default:
      return String(scope).slice(0, 40);
  }
}

/**
 * Atomic multi-document transaction saving:
 * 1. /users/{uid}/assessments/{recordId}
 * 2. /community_scores/{recordId}
 * 3. /community_stats/global (atomic +1 attempts & sum updates)
 * Followed by empirical per-question telemetry updates.
 */
export async function saveAssessmentToCloud(params: {
  scholarName: string;
  evaluation: PolymathEvaluation;
  scope: AssessmentScope;
  durationSeconds: number;
  answers: UserAnswerRecord[];
}): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required: please sign in with Google before saving to cloud.');
  }

  const sanitizedName = params.scholarName.trim().slice(0, 40);
  if (sanitizedName.length < 1) {
    throw new Error('Scholar name is required to save your score.');
  }

  const recordId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const userId = currentUser.uid;
  const pq = Math.min(160, Math.max(0, Math.round(params.evaluation.polymathQuotient)));
  const acc = Math.min(100, Math.max(0, Math.round(params.evaluation.accuracyPercentage)));
  const confidence = Math.min(100, Math.max(0, Math.round(params.evaluation.confidenceScore)));
  const breadth = Math.min(100, Math.max(0, Math.round(params.evaluation.balanceIndex)));
  const modeName = formatScopeLabel(params.scope).slice(0, 40);

  // Build domain accuracy map bounded to 25 keys
  const domainScoresMap: Record<string, number> = {};
  Object.entries(params.evaluation.domainScores)
    .slice(0, 25)
    .forEach(([key, val]) => {
      domainScoresMap[key] = Math.round(val.percentage);
    });

  const assessmentRef = doc(db, 'users', userId, 'assessments', recordId);
  const communityScoreRef = doc(db, 'community_scores', recordId);
  const globalStatsRef = doc(db, 'community_stats', 'global');

  const txPath = `users/${userId}/assessments/${recordId} + community_scores/${recordId} + community_stats/global`;

  try {
    await runTransaction(db, async (transaction) => {
      const statsSnap = await transaction.get(globalStatsRef);

      // 1. Write Private Personal Assessment
      transaction.set(assessmentRef, {
        userId,
        scholarName: sanitizedName,
        modeName,
        polymathQuotient: pq,
        accuracyPercentage: acc,
        confidenceScore: confidence,
        breadthIndex: breadth,
        archetypeName: (params.evaluation.archetype.level || 'Generalist').slice(0, 100),
        archetypeTitle: (params.evaluation.archetype.title || 'Polymath Candidate').slice(0, 100),
        correctCount: params.evaluation.correctCount,
        totalCount: Math.max(1, params.evaluation.totalQuestions),
        durationSeconds: Math.min(86400, Math.max(0, Math.round(params.durationSeconds))),
        domainScores: domainScoresMap,
        createdAt: serverTimestamp(),
      });

      // 2. Write Public Zero-PII Community Score Entry
      transaction.set(communityScoreRef, {
        userId,
        scholarName: sanitizedName,
        polymathQuotient: pq,
        accuracyPercentage: acc,
        archetypeTitle: (params.evaluation.archetype.title || 'Polymath Candidate').slice(0, 100),
        modeName,
        isPublic: true,
        createdAt: serverTimestamp(),
      });

      // 3. Atomic Update of Community Aggregate Document
      if (!statsSnap.exists()) {
        transaction.set(globalStatsRef, {
          totalAttempts: 1,
          totalPqSum: pq,
          totalAccuracySum: acc,
          highestPq: pq,
          updatedAt: serverTimestamp(),
        });
      } else {
        const prev = statsSnap.data();
        const prevAttempts = Number(prev.totalAttempts || 0);
        const prevPqSum = Number(prev.totalPqSum || 0);
        const prevAccSum = Number(prev.totalAccuracySum || 0);
        const prevHighest = Number(prev.highestPq || 0);

        transaction.update(globalStatsRef, {
          totalAttempts: prevAttempts + 1,
          totalPqSum: prevPqSum + pq,
          totalAccuracySum: prevAccSum + acc,
          highestPq: Math.max(prevHighest, pq),
          updatedAt: serverTimestamp(),
        });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, txPath);
  }

  // 4. Update per-question empirical statistics asynchronously (non-blocking)
  if (params.answers && params.answers.length > 0) {
    const questionRefMap = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
    for (const ans of params.answers) {
      const cleanQId = ans.questionId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 64);
      const qDocRef = doc(db, 'question_stats', cleanQId);
      const qRef = questionRefMap.get(ans.questionId);
      const isCorrect =
        qRef && ans.selectedOption !== null && ans.selectedOption !== undefined
          ? ans.selectedOption === qRef.correctIndex
          : false;

      try {
        const qSnap = await getDoc(qDocRef);
        let attemptCount = 1;
        let correctCount = isCorrect ? 1 : 0;
        let totalTimeSpentSec = Math.max(0, ans.timeSpentSec || 0);

        if (qSnap.exists()) {
          const qData = qSnap.data();
          attemptCount = Number(qData.attemptCount || 0) + 1;
          correctCount = Number(qData.correctCount || 0) + (isCorrect ? 1 : 0);
          totalTimeSpentSec = Number(qData.totalTimeSpentSec || 0) + Math.max(0, ans.timeSpentSec || 0);
        }

        const successRate = Math.round((correctCount / attemptCount) * 1000) / 10;
        const avgTimeSpentSec = Math.round((totalTimeSpentSec / attemptCount) * 10) / 10;

        await setDoc(qDocRef, {
          questionId: cleanQId,
          attemptCount,
          correctCount,
          successRate,
          totalTimeSpentSec,
          avgTimeSpentSec,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn(`Question stat update skipped for ${cleanQId}:`, err);
      }
    }
  }

  return recordId;
}

/**
 * Subscribe to the signed-in user's private saved assessments
 */
export function subscribeToPersonalAssessments(
  userId: string,
  onData: (records: PersonalAssessmentRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = `users/${userId}/assessments`;
  const q = query(collection(db, 'users', userId, 'assessments'), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: PersonalAssessmentRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: String(d.userId || userId),
          scholarName: String(d.scholarName || 'Scholar'),
          modeName: String(d.modeName || 'Assessment'),
          polymathQuotient: Number(d.polymathQuotient || 0),
          accuracyPercentage: Number(d.accuracyPercentage || 0),
          confidenceScore: Number(d.confidenceScore || 0),
          breadthIndex: Number(d.breadthIndex || 0),
          archetypeName: String(d.archetypeName || ''),
          archetypeTitle: String(d.archetypeTitle || ''),
          correctCount: Number(d.correctCount || 0),
          totalCount: Number(d.totalCount || 0),
          durationSeconds: Number(d.durationSeconds || 0),
          domainScores: (d.domainScores as Record<string, number>) || {},
          createdAtMs: timestampToMs(d.createdAt),
        });
      });
      items.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Error logged via handleFirestoreError
      }
    }
  );
}

/**
 * Subscribe to public community scores (enforcing isPublic == true per security rules)
 */
export function subscribeToCommunityScores(
  onData: (scores: CommunityScoreRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'community_scores';
  const q = query(collection(db, 'community_scores'), where('isPublic', '==', true), limit(60));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: CommunityScoreRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: String(d.userId || ''),
          scholarName: String(d.scholarName || 'Scholar'),
          polymathQuotient: Number(d.polymathQuotient || 0),
          accuracyPercentage: Number(d.accuracyPercentage || 0),
          archetypeTitle: String(d.archetypeTitle || ''),
          modeName: String(d.modeName || ''),
          isPublic: Boolean(d.isPublic),
          createdAtMs: timestampToMs(d.createdAt),
        });
      });
      items.sort((a, b) => b.polymathQuotient - a.polymathQuotient || b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch {
        // Error logged via handleFirestoreError
      }
    }
  );
}

/**
 * Subscribe to singleton global community averages (/community_stats/global)
 */
export function subscribeToGlobalCommunityStats(
  onData: (stats: GlobalCommunityStats | null) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'community_stats/global';
  const statsRef = doc(db, 'community_stats', 'global');

  return onSnapshot(
    statsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      const d = snapshot.data();
      const totalAttempts = Number(d.totalAttempts || 0);
      const totalPqSum = Number(d.totalPqSum || 0);
      const totalAccuracySum = Number(d.totalAccuracySum || 0);
      const highestPq = Number(d.highestPq || 0);

      onData({
        totalAttempts,
        totalPqSum,
        totalAccuracySum,
        highestPq,
        averagePq: totalAttempts > 0 ? Math.round((totalPqSum / totalAttempts) * 10) / 10 : 0,
        averageAccuracy:
          totalAttempts > 0 ? Math.round((totalAccuracySum / totalAttempts) * 10) / 10 : 0,
        updatedAtMs: timestampToMs(d.updatedAt),
      });
    },
    (error) => {
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch {
        // Error logged
      }
    }
  );
}

/**
 * Delete a personal assessment (and its corresponding community score entry if present)
 */
export async function deletePersonalAssessment(userId: string, recordId: string): Promise<void> {
  const assessmentPath = `users/${userId}/assessments/${recordId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'assessments', recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, assessmentPath);
  }

  // Clean up paired public community score if owned by the same user
  try {
    await deleteDoc(doc(db, 'community_scores', recordId));
  } catch {
    // Public entry might not exist or already deleted
  }
}

/**
 * Fetch empirical per-question statistics from Firestore (requires auth)
 */
export async function fetchQuestionStatsMap(): Promise<Record<string, QuestionStatItem>> {
  if (!auth.currentUser) return {};
  const path = 'question_stats';
  try {
    const q = query(collection(db, 'question_stats'), where('attemptCount', '>=', 0));
    const snap = await getDocs(q);
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
