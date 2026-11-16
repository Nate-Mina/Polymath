import React from 'react';
import { Question, UserAnswerRecord, FeedbackTiming } from '../types/polymath';
import { Bookmark, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Clock, Zap, User, Check } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  allUserAnswers: Record<string, UserAnswerRecord>;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  sessionSeconds: number;
  userAnswer?: UserAnswerRecord;
  feedbackTiming: FeedbackTiming;
  candidateName: string;
  onCandidateNameChange: (name: string) => void;
  onSelectOption: (optionIndex: number) => void;
  onToggleFlag: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onJumpToGrid: () => void;
  onJumpToQuestion?: (index: number) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questions,
  allUserAnswers,
  currentIndex,
  totalQuestions,
  answeredCount,
  sessionSeconds,
  userAnswer,
  feedbackTiming,
  candidateName,
  onCandidateNameChange,
  onSelectOption,
  onToggleFlag,
  onNext,
  onPrevious,
  onJumpToGrid,
  onJumpToQuestion,
}) => {
  const selectedIndex = userAnswer?.selectedOption;
  const isAnswered = selectedIndex !== null && selectedIndex !== undefined;
  const isFlagged = userAnswer?.isFlagged || false;
  const showImmediateFeedback = feedbackTiming === 'instant' && isAnswered;

  const isTechnical = question.domainType === 'technical';
  const difficultyBadgeColor =
    question.difficulty === 'easy'
      ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80'
      : question.difficulty === 'medium'
      ? 'text-amber-400 bg-amber-950/80 border-amber-800/80'
      : 'text-rose-400 bg-rose-950/80 border-rose-800/80';

  // Real-time completion rate & remaining count
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const remainingQuestions = Math.max(0, totalQuestions - answeredCount);

  let avgPaceText = 'Calculating pace...';
  let estimatedRemainingText: string | null = null;

  if (answeredCount > 0 && sessionSeconds > 0) {
    const avgSecondsPerQ = sessionSeconds / answeredCount;
    avgPaceText = `${Math.round(avgSecondsPerQ)}s / problem`;

    if (remainingQuestions > 0) {
      const estSeconds = remainingQuestions * avgSecondsPerQ;
      if (estSeconds < 60) {
        estimatedRemainingText = `~${Math.max(1, Math.round(estSeconds))}s est.`;
      } else {
        const estMins = Math.round(estSeconds / 60);
        estimatedRemainingText = `~${estMins}m est.`;
      }
    } else {
      estimatedRemainingText = 'All answered!';
    }
  } else if (remainingQuestions > 0) {
    const estSeconds = remainingQuestions * 45;
    const estMins = Math.round(estSeconds / 60);
    estimatedRemainingText = `~${estMins}m est. total`;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* 1. Segmented Progress Header & Remaining Badge */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="text-slate-100 font-semibold">
              {answeredCount} of {totalQuestions} answered
            </span>
            <span className="text-amber-300 font-bold">
              ({completionPercentage}%)
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-[#FDE68A] border border-[#D4AF37]/60 shadow-sm"
              title="Questions remaining to complete this assessment"
            >
              {remainingQuestions} left
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5" title="Elapsed session duration">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{formatTime(sessionSeconds)}</span>
            </span>

            <span className="text-slate-600">·</span>

            <span className="flex items-center gap-1.5 text-amber-300" title="Average completion speed per problem">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{avgPaceText}</span>
            </span>

            {estimatedRemainingText && (
              <>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-emerald-400 font-medium hidden sm:inline" title="Estimated remaining time">
                  {estimatedRemainingText}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Segmented Horizontal Progress Track (Completed = Renaissance Gold, Active = Warm Gold Light, Remaining = Midnight Border) */}
        <div
          className="flex items-center gap-[2px] w-full"
          role="progressbar"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
        >
          {questions.map((q, idx) => {
            const qAns = allUserAnswers[q.id];
            const isQAnswered = qAns && qAns.selectedOption !== null && qAns.selectedOption !== undefined;
            const isCurrent = idx === currentIndex;

            let segmentClass = 'bg-[#334155] hover:bg-slate-600';
            if (isCurrent) {
              segmentClass =
                'bg-[#FDE68A] ring-1 ring-[#D4AF37] shadow-[0_0_8px_rgba(253,230,138,0.65)] scale-y-125';
            } else if (isQAnswered) {
              segmentClass = 'bg-[#D4AF37] hover:bg-amber-400';
            }

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onJumpToQuestion && onJumpToQuestion(idx)}
                title={`Q${idx + 1}: ${q.fieldName} (${isCurrent ? 'Active' : isQAnswered ? 'Answered' : 'Remaining'})`}
                className={`h-2.5 flex-1 min-w-[2px] rounded-full transition-all duration-200 cursor-pointer ${segmentClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Sleek Top Editable Scholar Name Card */}
      <div className="px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
          <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[#D4AF37] shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <label htmlFor="live-scholar-name" className="text-xs font-mono text-slate-400 shrink-0">
            Scholar Name:
          </label>
          <input
            id="live-scholar-name"
            type="text"
            value={candidateName}
            onChange={(e) => onCandidateNameChange(e.target.value.slice(0, 40))}
            maxLength={40}
            placeholder="Enter scholar name..."
            className="flex-1 bg-slate-950/90 border border-slate-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 rounded-lg px-3 py-1 text-xs font-medium text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          {candidateName.trim().length >= 1 ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Ready for Certificate &amp; Cloud Score</span>
            </span>
          ) : (
            <span className="text-amber-400">Add name for saved scores</span>
          )}
        </div>
      </div>
      {/* Top Question Meta Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded font-mono uppercase tracking-wider text-[11px] font-semibold border ${
              isTechnical
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80'
                : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
            }`}
          >
            {question.domainType}
          </span>
          <span className="text-slate-400">·</span>
          <span className="font-medium text-slate-200">{question.fieldName}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 font-mono">{question.subtopic}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${difficultyBadgeColor}`}>
            {question.difficulty.toUpperCase()} ({question.points} {question.points === 1 ? 'pt' : 'pts'})
          </span>

          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              isFlagged
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Flag question for later review"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
            <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
          </button>
        </div>
      </div>

      {/* Primary Question Stage */}
      <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        {/* Question Counter & Prompt */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-cyan-400 tracking-wider">
            Problem {currentIndex + 1} of {totalQuestions}
          </div>
          <h2 className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed max-w-3xl">
            {question.question}
          </h2>
        </div>

        {/* Formula / Equation / Code snippet if present */}
        {question.formulaOrSnippet && (
          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-sm text-cyan-300/95 overflow-x-auto">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block mb-1">
              Reference Relation / Context
            </span>
            <code>{question.formulaOrSnippet}</code>
          </div>
        )}

        {/* 4 Multi-Choice Options */}
        <div className="space-y-2.5 pt-2">
          {question.options.map((optionText, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = idx === question.correctIndex;

            let optionStyle = 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-950';

            if (showImmediateFeedback) {
              if (isCorrect) {
                optionStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-950';
              } else if (isSelected && !isCorrect) {
                optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-sm shadow-rose-950';
              } else {
                optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
              }
            } else if (isSelected) {
              optionStyle = 'bg-cyan-950/80 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/50';
            }

            return (
              <button
                key={idx}
                onClick={() => onSelectOption(idx)}
                className={`w-full text-left p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-150 group cursor-pointer ${optionStyle}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0 border transition-colors ${
                    showImmediateFeedback && isCorrect
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : showImmediateFeedback && isSelected && !isCorrect
                      ? 'bg-rose-500 text-white border-rose-400'
                      : isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 group-hover:text-slate-200 group-hover:border-slate-700'
                  }`}
                >
                  {OPTION_LABELS[idx]}
                </div>

                <div className="flex-1 text-sm md:text-[15px] pt-0.5 leading-relaxed">
                  {optionText}
                </div>

                {showImmediateFeedback && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                {showImmediateFeedback && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Solution Walkthrough Drawer */}
        {showImmediateFeedback && (
          <div className="mt-6 p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              {selectedIndex === question.correctIndex ? (
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Correct Formulation
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-rose-400">
                  <XCircle className="w-4 h-4" /> Incorrect · Correct Answer: Option {OPTION_LABELS[question.correctIndex]}
                </span>
              )}
            </div>

            <div className="text-xs md:text-sm text-slate-300 leading-relaxed space-y-2">
              <p>{question.explanation}</p>
            </div>

            <div className="pt-2 border-t border-slate-900 text-xs text-slate-400 font-mono">
              <span className="text-slate-500">Core Principle: </span>
              <span className="text-slate-300">{question.corePrinciple}</span>
            </div>
          </div>
        )}

        {/* Bottom Navigation Ribbon */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={onPrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={onJumpToGrid}
            className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Question Map ({totalQuestions})
          </button>

          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2 text-xs font-medium rounded-lg text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-md shadow-cyan-950"
          >
            <span>{currentIndex === totalQuestions - 1 ? 'Finish Assessment' : 'Next Question'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
