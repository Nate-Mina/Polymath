import React, { useState } from 'react';
import { PolymathEvaluation, Question, UserAnswerRecord } from '../types/polymath';
import { PolymathRadarChart } from './PolymathRadarChart';
import { DomainMasteryGrid } from './DomainMasteryGrid';
import { ShareResultsModal } from './ShareResultsModal';
import { generateShareableResultsSnippet, copyToClipboard } from '../utils/shareResults';
import {
  Award,
  CheckCircle2,
  XCircle,
  Bookmark,
  Share2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Filter,
  Brain,
  Scale,
  Compass,
  ArrowRight,
  Check,
} from 'lucide-react';

interface PolymathReportViewProps {
  evaluation: PolymathEvaluation;
  questions: Question[];
  userAnswers: Record<string, UserAnswerRecord>;
  onRetake: () => void;
  onRetestWeakFields: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const PolymathReportView: React.FC<PolymathReportViewProps> = ({
  evaluation,
  questions,
  userAnswers,
  onRetake,
  onRetestWeakFields,
}) => {
  const [activeTab, setActiveTab] = useState<'visualizations' | 'audit'>('visualizations');
  const [auditFilter, setAuditFilter] = useState<'all' | 'incorrect' | 'correct' | 'flagged'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Filter audit questions
  const filteredAuditQuestions = questions.filter((q) => {
    const ans = userAnswers[q.id];
    const isAnswered = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
    const isCorrect = isAnswered && ans.selectedOption === q.correctIndex;

    if (auditFilter === 'incorrect') return isAnswered && !isCorrect;
    if (auditFilter === 'correct') return isCorrect;
    if (auditFilter === 'flagged') return ans?.isFlagged;
    return true;
  });

  const handleCopySummary = async () => {
    const snippet = generateShareableResultsSnippet(evaluation, 'detailed');
    const success = await copyToClipboard(snippet);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
    setIsShareModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16">
      {/* ==================================================== */}
      {/* 1. HERO EVALUATION BANNER                            */}
      {/* ==================================================== */}
      <div className="relative p-6 md:p-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left Title & Archetype */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Compass className="w-4 h-4" />
              <span>COGNITIVE PROFILE SYNTHESIS</span>
              <span className="text-slate-600">·</span>
              <span>20 DEGREE DISCIPLINES</span>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-mono text-amber-400 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800 inline-block mb-2">
                {evaluation.archetype.badge}
              </span>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-100 tracking-tight">
                {evaluation.archetype.title}
              </h1>
            </div>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              {evaluation.archetype.description}
            </p>
          </div>

          {/* Right Main Quotient Dial */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/90 border border-slate-800 rounded-2xl shrink-0 w-full lg:w-64 text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              RENAISSANCE QUOTIENT
            </span>
            <div className="text-5xl md:text-6xl font-black font-mono text-cyan-400 tracking-tight my-1">
              {evaluation.polymathQuotient}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Scale 0–100 · High Breadth
            </span>

            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-3 border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full rounded-full"
                style={{ width: `${evaluation.polymathQuotient}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80 font-mono">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              TOTAL ACCURACY
            </span>
            <div className="text-xl font-bold text-slate-100 mt-0.5">
              {evaluation.accuracyPercentage}%
            </div>
            <span className="text-xs text-slate-500">
              {evaluation.correctCount} / {evaluation.totalQuestions} Solved
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              TECHNICAL (STEM)
            </span>
            <div className="text-xl font-bold text-cyan-400 mt-0.5">
              {evaluation.technicalScore.percentage}%
            </div>
            <span className="text-xs text-slate-500">
              {evaluation.technicalScore.correct} / {evaluation.technicalScore.total} Qs
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              HUMANITIES &amp; ARTS
            </span>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {evaluation.humanitiesScore.percentage}%
            </div>
            <span className="text-xs text-slate-500">
              {evaluation.humanitiesScore.correct} / {evaluation.humanitiesScore.total} Qs
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              POLYPATHIC BALANCE
            </span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {evaluation.balanceIndex}/100
            </div>
            <span className="text-xs text-slate-500">
              Uniformity Index
            </span>
          </div>
        </div>

        {/* Strengths & Growth Areas Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Core Intellectual Pillars
            </span>
            <p className="text-xs text-slate-300">
              {evaluation.topStrengths.join(' · ')}
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-xs font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> High-Leverage Growth Horizons
            </span>
            <p className="text-xs text-slate-300">
              {evaluation.growthAreas.join(' · ')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-gradient-to-r from-cyan-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 shadow-md shadow-cyan-950/40 transition-all cursor-pointer"
              title="Copy formatted radar scores and evaluation summary to clipboard"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Results Copied to Clipboard!' : 'Share Results'}</span>
            </button>

            <button
              onClick={onRetestWeakFields}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg text-cyan-300 bg-cyan-950/70 border border-cyan-800 hover:bg-cyan-900 transition-colors cursor-pointer"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Drill Into Weak Disciplines</span>
            </button>
          </div>

          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Full Assessment</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. TAB CONTROLLER: VISUALIZATIONS VS ANSWER AUDIT    */}
      {/* ==================================================== */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('visualizations')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'visualizations'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Diagnostics &amp; Mastery Cards
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 80 Questions &amp; Solutions ({questions.length})
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: RADAR CHART + DOMAIN MASTERY CARDS GRID       */}
      {/* ==================================================== */}
      {activeTab === 'visualizations' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Section 1: 20-Axis Radar Visualizer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Multidisciplinary Radar Spectrum
                </h2>
                <p className="text-xs text-slate-400">
                  Visual symmetry indicates balanced polymathy across technical and humanistic domains
                </p>
              </div>
            </div>

            <PolymathRadarChart domainScores={evaluation.domainScores} />
          </div>

          {/* Section 2: Domain Mastery Cards Grid */}
          <div className="space-y-3 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Domain Mastery Cards (20 Fields)
                </h2>
                <p className="text-xs text-slate-400">
                  Granular performance across 15 technical degrees and 5 non-technical degrees
                </p>
              </div>
            </div>

            <DomainMasteryGrid
              domainScores={evaluation.domainScores}
              questions={questions}
              userAnswers={userAnswers}
              onSelectField={(fieldId) => {
                setActiveTab('audit');
              }}
            />
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: DETAILED QUESTION AUDIT WITH WORKED SOLUTIONS */}
      {/* ==================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg">
              <button
                onClick={() => setAuditFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  auditFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Questions ({questions.length})
              </button>
              <button
                onClick={() => setAuditFilter('incorrect')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  auditFilter === 'incorrect'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Missed / Incorrect ({questions.length - evaluation.correctCount})
              </button>
              <button
                onClick={() => setAuditFilter('correct')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  auditFilter === 'correct'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Correct ({evaluation.correctCount})
              </button>
              <button
                onClick={() => setAuditFilter('flagged')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  auditFilter === 'flagged'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Flagged
              </button>
            </div>

            <div className="text-slate-400 font-mono">
              Showing {filteredAuditQuestions.length} of {questions.length} problems
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3.5">
            {filteredAuditQuestions.map((q, idx) => {
              const ans = userAnswers[q.id];
              const isAnswered = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
              const isCorrect = isAnswered && ans.selectedOption === q.correctIndex;
              const isExpanded = expandedQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden transition-all duration-150"
                >
                  <button
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="w-full text-left p-4 flex items-start justify-between gap-4 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : isAnswered ? (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                            -
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-200">
                            {q.fieldName}
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="font-mono text-slate-400">{q.subtopic}</span>
                          <span className="text-slate-500">·</span>
                          <span
                            className={`font-mono uppercase text-[10px] px-1.5 py-0.5 rounded ${
                              q.difficulty === 'easy'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : q.difficulty === 'medium'
                                ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        <p className="text-sm text-slate-300 font-normal line-clamp-2">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {ans?.isFlagged && (
                        <Bookmark className="w-4 h-4 fill-amber-400 text-amber-400" />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Solution View */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-800/60 bg-slate-950/70 space-y-4">
                      {q.formulaOrSnippet && (
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300">
                          <code>{q.formulaOrSnippet}</code>
                        </div>
                      )}

                      {/* Options breakdown */}
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt, oIdx) => {
                          const isUserChoice = ans?.selectedOption === oIdx;
                          const isCorrectChoice = q.correctIndex === oIdx;

                          let itemStyle = 'border-slate-800/80 bg-slate-950/40 text-slate-400';
                          if (isCorrectChoice) {
                            itemStyle = 'border-emerald-600 bg-emerald-950/60 text-emerald-200 font-medium';
                          } else if (isUserChoice && !isCorrectChoice) {
                            itemStyle = 'border-rose-600 bg-rose-950/60 text-rose-200';
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-lg border text-xs md:text-sm flex items-center justify-between gap-3 ${itemStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="font-mono font-semibold">
                                  {OPTION_LABELS[oIdx]}.
                                </span>
                                <span>{opt}</span>
                              </div>

                              <div className="shrink-0 flex items-center gap-2">
                                {isCorrectChoice && (
                                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                    [Correct Key]
                                  </span>
                                )}
                                {isUserChoice && !isCorrectChoice && (
                                  <span className="text-[11px] font-mono text-rose-400 font-bold">
                                    [Your Choice]
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Worked Derivation &amp; Scientific Rationale
                        </div>
                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                          {q.explanation}
                        </p>
                        <div className="pt-2 text-xs font-mono text-slate-400 border-t border-slate-800">
                          <span className="text-slate-500">Epistemic Principle: </span>
                          <span className="text-cyan-400">{q.corePrinciple}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share Results Modal */}
      <ShareResultsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        evaluation={evaluation}
      />
    </div>
  );
};
