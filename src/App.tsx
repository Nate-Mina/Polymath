/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AssessmentScope, FeedbackTiming, Question, UserAnswerRecord, PolymathEvaluation } from './types/polymath';
import { ALL_QUESTIONS, getQuestionsForScope } from './data/questions';
import { calculatePolymathEvaluation } from './utils/polymathScore';
import { AssessmentHeader } from './components/AssessmentHeader';
import { AssessmentSetup } from './components/AssessmentSetup';
import { QuestionCard } from './components/QuestionCard';
import { QuestionNavDrawer } from './components/QuestionNavDrawer';
import { PolymathReportView } from './components/PolymathReportView';
import { AboutTestModal } from './components/AboutTestModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { saveLocalLeaderboardEntry } from './utils/localLeaderboard';
import {
  AuthUser,
  subscribeToAuthState,
  signInWithGoogle,
  signOutUser,
  saveAssessmentToCloud,
} from './utils/firebase';

const LOCAL_STORAGE_KEY = 'polymath_assessment_session_v1';

export default function App() {
  const [appStage, setAppStage] = useState<'setup' | 'testing' | 'report'>('setup');
  const [scope, setScope] = useState<AssessmentScope>('full');
  const [feedbackTiming, setFeedbackTiming] = useState<FeedbackTiming>('instant');
  const [_targetFieldId, setTargetFieldId] = useState<string | undefined>(undefined);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [candidateName, setCandidateName] = useState<string>('');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(ALL_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [highlightSessionId, setHighlightSessionId] = useState<string | undefined>(undefined);
  const [hasPersistedReport, setHasPersistedReport] = useState<boolean>(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [cloudSaveError, setCloudSaveError] = useState<string | null>(null);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // Subscribe to Firebase Google Auth state and pre-fill scholar name if empty
  useEffect(() => {
    const unsub = subscribeToAuthState((user) => {
      setAuthUser(user);
      if (user?.displayName) {
        setCandidateName((prev) => (prev.trim().length === 0 ? user.displayName!.slice(0, 40) : prev));
      }
    });
    return () => unsub();
  }, []);

  // Real-time session elapsed timer & active question pacing
  useEffect(() => {
    let interval: any;
    if (appStage === 'testing') {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);

        // Keep current question active deliberation time incremented in real time
        setUserAnswers((prev) => {
          const currentQ = activeQuestions[currentIndex];
          if (!currentQ) return prev;
          const existing = prev[currentQ.id];
          return {
            ...prev,
            [currentQ.id]: {
              questionId: currentQ.id,
              selectedOption: existing ? existing.selectedOption : null,
              isFlagged: existing ? existing.isFlagged : false,
              timeSpentSec: (existing?.timeSpentSec || 0) + 1,
              submittedAt: existing?.submittedAt,
            },
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appStage, activeQuestions, currentIndex]);

  // Load saved session if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userAnswers && Object.keys(parsed.userAnswers).length > 0) {
          setUserAnswers(parsed.userAnswers);
        }
        if (parsed.candidateName) {
          setCandidateName(parsed.candidateName);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved assessment session', e);
    }
  }, []);

  // Save session to localStorage
  const persistSession = (answers: Record<string, UserAnswerRecord>, name?: string) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          candidateName: name !== undefined ? name : candidateName,
          userAnswers: answers,
          updatedAt: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Failed to persist assessment session', e);
    }
  };

  const handleStartAssessment = (
    newScope: AssessmentScope,
    newTiming: FeedbackTiming,
    fieldId?: string,
    customPartialFields?: { technical: string[]; humanities: string[] }
  ) => {
    const questions = getQuestionsForScope(newScope, fieldId, customPartialFields);
    setScope(newScope);
    setFeedbackTiming(newTiming);
    setTargetFieldId(fieldId);
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSessionSeconds(0);
    setHasPersistedReport(false);
    setCloudSaveStatus('idle');
    setCloudSaveError(null);
    setAppStage('testing');
  };

  // Auto-record session on completion to Local Leaderboard (localStorage)
  // Cloud saving to Firebase is deliberately triggered by explicit user click on "Save Score to Cloud"
  useEffect(() => {
    if (appStage === 'report' && !hasPersistedReport) {
      const answeredList = Object.values(userAnswers).filter(
        (a) => a.selectedOption !== null && a.selectedOption !== undefined
      );

      if (answeredList.length > 0) {
        setHasPersistedReport(true);
        const evalResult = calculatePolymathEvaluation(activeQuestions, userAnswers, candidateName);
        const effectiveName = candidateName.trim() || 'Guest Scholar';

        try {
          const { saved } = saveLocalLeaderboardEntry({
            candidateName: effectiveName,
            score: evalResult.accuracyPercentage,
            correctCount: evalResult.correctCount,
            totalQuestions: evalResult.totalQuestions,
            track: scope,
            archetype: evalResult.archetype.title,
            rqScore: evalResult.polymathQuotient,
            confidenceScore: evalResult.confidenceScore,
            timeTakenSec: sessionSeconds,
          });
          setHighlightSessionId(saved.id);
        } catch (err) {
          console.warn('Could not save to local leaderboard:', err);
        }
      }
    }
  }, [appStage, hasPersistedReport, activeQuestions, userAnswers, candidateName, scope, sessionSeconds]);

  const handleSaveScoreToCloud = async () => {
    if (cloudSaveStatus === 'saved' || cloudSaveStatus === 'saving') return;
    const trimmedName = candidateName.trim();
    if (!trimmedName) {
      setCloudSaveStatus('error');
      setCloudSaveError('Scholar name cannot be empty.');
      return;
    }

    setCloudSaveStatus('saving');
    setCloudSaveError(null);
    try {
      const evalResult = calculatePolymathEvaluation(activeQuestions, userAnswers, trimmedName);
      const answeredList = Object.values(userAnswers).filter(
        (a) => a.selectedOption !== null && a.selectedOption !== undefined
      );

      await saveAssessmentToCloud({
        scholarName: trimmedName,
        evaluation: evalResult,
        scope,
        durationSeconds: sessionSeconds,
        answers: answeredList,
      });
      setCloudSaveStatus('saved');
    } catch (err) {
      setCloudSaveStatus('error');
      setCloudSaveError(err instanceof Error ? err.message : 'Failed to save score to cloud.');
    }
  };

  const handleSignInAndSave = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        await handleSaveScoreToCloud();
      }
    } catch (err) {
      setCloudSaveStatus('error');
      setCloudSaveError('Google Sign-In was cancelled or failed.');
    }
  };

  const handleResumeSession = () => {
    setActiveQuestions(ALL_QUESTIONS);
    setScope('full');
    setCurrentIndex(0);
    setAppStage('testing');
  };

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    setUserAnswers((prev) => {
      const existing = prev[currentQ.id];
      const updated: UserAnswerRecord = {
        questionId: currentQ.id,
        selectedOption: optionIndex,
        isFlagged: existing?.isFlagged || false,
        timeSpentSec: (existing?.timeSpentSec || 0) + 1,
        submittedAt: Date.now(),
      };
      const newAnswers = { ...prev, [currentQ.id]: updated };
      persistSession(newAnswers);
      return newAnswers;
    });
  };

  const handleToggleFlag = () => {
    const currentQ = activeQuestions[currentIndex];
    if (!currentQ) return;

    setUserAnswers((prev) => {
      const existing = prev[currentQ.id];
      const updated: UserAnswerRecord = {
        questionId: currentQ.id,
        selectedOption: existing ? existing.selectedOption : null,
        isFlagged: existing ? !existing.isFlagged : true,
        timeSpentSec: existing?.timeSpentSec || 0,
      };
      const newAnswers = { ...prev, [currentQ.id]: updated };
      persistSession(newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed last question -> transition to report
      setAppStage('report');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleResetAssessment = () => {
    setUserAnswers({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setHasPersistedReport(false);
    setCloudSaveStatus('idle');
    setCloudSaveError(null);
    setAppStage('setup');
    setCurrentIndex(0);
    setSessionSeconds(0);
  };

  const handleRetake = () => {
    setUserAnswers({});
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    setHasPersistedReport(false);
    setCloudSaveStatus('idle');
    setCloudSaveError(null);
    setCurrentIndex(0);
    setSessionSeconds(0);
    setAppStage('testing');
  };

  const handleRetestWeakFields = () => {
    const evaluation = calculatePolymathEvaluation(activeQuestions, userAnswers);
    // Find fields with accuracy < 50%
    const weakFieldIds = Object.entries(evaluation.domainScores)
      .filter(([_, d]) => d.percentage < 75)
      .map(([id]) => id);

    if (weakFieldIds.length > 0) {
      const filteredQs = ALL_QUESTIONS.filter((q) => weakFieldIds.includes(q.fieldId));
      setActiveQuestions(filteredQs);
      setCurrentIndex(0);
      setSessionSeconds(0);
      setHasPersistedReport(false);
      setCloudSaveStatus('idle');
      setCloudSaveError(null);
      setAppStage('testing');
    } else {
      setActiveQuestions(ALL_QUESTIONS);
      setCurrentIndex(0);
      setSessionSeconds(0);
      setHasPersistedReport(false);
      setCloudSaveStatus('idle');
      setCloudSaveError(null);
      setAppStage('testing');
    }
  };

  // Keyboard navigation shortcuts (ignored while typing inside input/textarea/select)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (appStage !== 'testing') return;
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        handleSelectOption(0);
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        handleSelectOption(1);
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        handleSelectOption(2);
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        handleSelectOption(3);
      } else if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        handlePrevious();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsNavDrawerOpen((prev) => !prev);
      }
    },
    [appStage, currentIndex, activeQuestions]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentQuestion = activeQuestions[currentIndex];
  const evaluation: PolymathEvaluation = calculatePolymathEvaluation(activeQuestions, userAnswers, candidateName);
  const savedAnswerCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <AssessmentHeader
        scope={scope}
        feedbackTiming={feedbackTiming}
        onToggleFeedbackTiming={() =>
          setFeedbackTiming((prev) => (prev === 'instant' ? 'exam' : 'instant'))
        }
        onResetAssessment={handleResetAssessment}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        authUser={authUser}
        onSignIn={() => signInWithGoogle().catch((err) => console.warn('Sign-in cancelled:', err))}
        onSignOut={() => signOutUser().catch((err) => console.warn('Sign-out error:', err))}
        currentIndex={currentIndex}
        totalQuestions={activeQuestions.length}
        isTestActive={appStage === 'testing'}
      />

      {/* Main Body Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {appStage === 'setup' && (
          <AssessmentSetup
            candidateName={candidateName}
            onCandidateNameChange={(name) => {
              setCandidateName(name);
              persistSession(userAnswers, name);
            }}
            onStart={handleStartAssessment}
            hasSavedSession={savedAnswerCount > 0}
            onResumeSession={handleResumeSession}
            savedAnswerCount={savedAnswerCount}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}

        {appStage === 'testing' && currentQuestion && (
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              questions={activeQuestions}
              allUserAnswers={userAnswers}
              currentIndex={currentIndex}
              totalQuestions={activeQuestions.length}
              answeredCount={Object.values(userAnswers).filter((a) => a.selectedOption !== null && a.selectedOption !== undefined).length}
              sessionSeconds={sessionSeconds}
              userAnswer={userAnswers[currentQuestion.id]}
              feedbackTiming={feedbackTiming}
              candidateName={candidateName}
              onCandidateNameChange={(name) => {
                setCandidateName(name);
                persistSession(userAnswers, name);
              }}
              onSelectOption={handleSelectOption}
              onToggleFlag={handleToggleFlag}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onJumpToGrid={() => setIsNavDrawerOpen(true)}
              onJumpToQuestion={(idx) => setCurrentIndex(idx)}
            />

            {/* Quick Keyboard Hotkeys bar */}
            <div className="max-w-4xl mx-auto flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
              <span>Hotkeys: Press [A-D] or [1-4] to select · [←/→] to navigate</span>
              <button
                onClick={() => setAppStage('report')}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
              >
                Skip to Evaluation Report
              </button>
            </div>
          </div>
        )}

        {appStage === 'report' && (
          <PolymathReportView
            evaluation={evaluation}
            questions={activeQuestions}
            userAnswers={userAnswers}
            scope={scope}
            authUser={authUser}
            cloudSaveStatus={cloudSaveStatus}
            cloudSaveError={cloudSaveError}
            onSaveScoreToCloud={handleSaveScoreToCloud}
            onSignInAndSave={handleSignInAndSave}
            candidateName={candidateName}
            onCandidateNameChange={(name) => {
              setCandidateName(name);
              persistSession(userAnswers, name);
            }}
            totalSessionSeconds={sessionSeconds}
            onRetake={handleRetake}
            onRetestWeakFields={handleRetestWeakFields}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          />
        )}
      </main>

      {/* Modal Drawer: 80-Question Navigation Grid */}
      <QuestionNavDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        questions={activeQuestions}
        currentIndex={currentIndex}
        userAnswers={userAnswers}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
      />

      {/* Modal: About Assessment & Methodology */}
      <AboutTestModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Modal: Scores, Global Community Averages & Empirical Question Stats */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        authUser={authUser}
        currentCandidateName={candidateName}
        latestPq={appStage === 'report' ? evaluation.polymathQuotient : undefined}
        latestAccuracy={appStage === 'report' ? evaluation.accuracyPercentage : undefined}
        highlightSessionId={highlightSessionId}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span>Polymath Multidisciplinary Aptitude Assessment</span>
          <span>·</span>
          <span>Test written by</span>
          <a
            href="https://nate-mina.github.io/Portfolio-CV/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 decoration-cyan-500/50 hover:decoration-cyan-300 transition-colors"
          >
            Nathaniel Mina
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://nate-mina.github.io/Portfolio-CV/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            Portfolio &amp; CV
          </a>
          <span>·</span>
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="hover:text-slate-300 underline underline-offset-4 cursor-pointer"
          >
            About Methodology
          </button>
          <span>·</span>
          <a
            href="https://github.com/Nate-Mina/Polymath"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <span>GitHub (Nate-Mina/Polymath)</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
