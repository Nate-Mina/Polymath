import React from 'react';
import { AssessmentScope, FeedbackTiming } from '../types/polymath';
import { Compass, Sparkles, BookOpen, Clock, RotateCcw } from 'lucide-react';

interface AssessmentHeaderProps {
  scope: AssessmentScope;
  feedbackTiming: FeedbackTiming;
  onToggleFeedbackTiming: () => void;
  onResetAssessment: () => void;
  onOpenAbout: () => void;
  currentIndex?: number;
  totalQuestions?: number;
  isTestActive: boolean;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({
  scope,
  feedbackTiming,
  onToggleFeedbackTiming,
  onResetAssessment,
  onOpenAbout,
  currentIndex = 0,
  totalQuestions = 80,
  isTestActive,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="/"
        onClick={(e) => {
          e.preventDefault();
          if (isTestActive && window.confirm('Return to assessment dashboard? Your progress is saved.')) {
            onResetAssessment();
          }
        }}
        className="text-base md:text-lg font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
      >
        <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
        <span className="truncate">Polymath Multidisciplinary Aptitude Assessment</span>
      </a>

      {/* Zone 2: Clean single-line text indicators */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-400 whitespace-nowrap shrink-0">
        {scope === 'partial' ? (
          <>
            <span className="text-cyan-300 font-semibold">Partial Polymath Track</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>8 Technical + 3 Humanities Fields</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">22 Problems (1 Easy + 1 Med each)</span>
          </>
        ) : scope === 'technical' ? (
          <>
            <span>15 Technical Disciplines</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">60 Tiered Problems</span>
          </>
        ) : scope === 'humanities' ? (
          <>
            <span>5 Humanities Disciplines</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">20 Tiered Problems</span>
          </>
        ) : scope === 'single-field' ? (
          <>
            <span>Single Field Sprint</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">4 Tiered Problems</span>
          </>
        ) : (
          <>
            <span>15 Technical Disciplines</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>5 Non-Technical Disciplines</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-mono">80 Calibrated Tiered Problems</span>
          </>
        )}
      </div>

      {/* Zone 3: Primary action & Mode Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* About Test Button */}
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          title="View detailed test background, curricula, and scoring methodology"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>About Test</span>
        </button>

        {/* GitHub Link */}
        <a
          href="https://github.com/Nate-Mina/Polymath"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="GitHub Repository: Nate-Mina/Polymath"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>

        {/* Toggle between Instant practice check and Exam mode */}
        <button
          onClick={onToggleFeedbackTiming}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            feedbackTiming === 'instant'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-700/80 hover:bg-cyan-900'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
          }`}
          title={
            feedbackTiming === 'instant'
              ? 'Instant Mode: Explanations show immediately after answering'
              : 'Exam Mode: Test continues quietly with full diagnostic report at the end'
          }
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{feedbackTiming === 'instant' ? 'Instant: ON' : 'Exam Mode'}</span>
        </button>

        {isTestActive && (
          <button
            onClick={() => {
              if (window.confirm('Reset this assessment session?')) {
                onResetAssessment();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
            title="Reset Assessment"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
