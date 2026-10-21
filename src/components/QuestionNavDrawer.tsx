import React from 'react';
import { Question, UserAnswerRecord } from '../types/polymath';
import { X, Bookmark, CheckCircle2 } from 'lucide-react';

interface QuestionNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, UserAnswerRecord>;
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavDrawer: React.FC<QuestionNavDrawerProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  userAnswers,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  const answeredCount = Object.values(userAnswers).filter(
    (a) => a.selectedOption !== null && a.selectedOption !== undefined
  ).length;

  const flaggedCount = Object.values(userAnswers).filter((a) => a.isFlagged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Assessment Question Map
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Jump directly to any discipline or flagged problem
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status ribbon */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-950 border-b border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              Total: <strong className="text-slate-200">{questions.length}</strong>
            </span>
            <span>
              Answered:{' '}
              <strong className="text-cyan-400">
                {answeredCount}/{questions.length}
              </strong>
            </span>
            <span>
              Flagged: <strong className="text-amber-400">{flaggedCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-cyan-600"></span> Answered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-amber-500 bg-amber-950"></span> Flagged
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded border border-slate-700 bg-slate-900"></span> Empty
            </span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const ans = userAnswers[q.id];
              const isAnswered = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
              const isFlagged = ans?.isFlagged;
              const isCurrent = idx === currentIndex;

              let style = 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700';

              if (isCurrent) {
                style = 'ring-2 ring-cyan-400 bg-cyan-950 text-cyan-200 border-cyan-500 font-bold';
              } else if (isFlagged) {
                style = 'bg-amber-950/80 text-amber-200 border-amber-600/80';
              } else if (isAnswered) {
                style = 'bg-cyan-950 text-cyan-300 border-cyan-800/80';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  className={`relative flex flex-col items-center justify-center h-12 rounded-xl text-xs font-mono border transition-all ${style}`}
                  title={`#${idx + 1} (${q.fieldName} - ${q.difficulty.toUpperCase()}): ${q.subtopic}`}
                >
                  <span className="text-[12px]">{idx + 1}</span>
                  <span className="text-[9px] uppercase opacity-75">
                    {q.difficulty[0]}
                  </span>

                  {isFlagged && (
                    <Bookmark className="w-2.5 h-2.5 fill-amber-400 text-amber-400 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
