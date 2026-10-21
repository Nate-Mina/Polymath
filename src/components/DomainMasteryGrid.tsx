import React, { useState } from 'react';
import { DisciplineMeta, Question, UserAnswerRecord } from '../types/polymath';
import {
  Activity,
  Sigma,
  Atom,
  Zap,
  Code,
  Cog,
  FlaskConical,
  Building2,
  Plane,
  Stethoscope,
  Brain,
  Binary,
  Layers,
  Dna,
  Bot,
  BookOpen,
  Hourglass,
  Scroll,
  Music,
  TrendingUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface DomainMasteryGridProps {
  domainScores: Record<
    string,
    {
      discipline: DisciplineMeta;
      correct: number;
      total: number;
      percentage: number;
      easyCorrect: number;
      medCorrect: number;
      hardCorrect: number;
    }
  >;
  questions: Question[];
  userAnswers: Record<string, UserAnswerRecord>;
  onSelectField?: (fieldId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Sigma,
  Atom,
  Zap,
  Code,
  Cog,
  FlaskConical,
  Building2,
  Plane,
  Stethoscope,
  Brain,
  Binary,
  Layers,
  Dna,
  Bot,
  BookOpen,
  Hourglass,
  Scroll,
  Music,
  TrendingUp,
};

export const DomainMasteryGrid: React.FC<DomainMasteryGridProps> = ({
  domainScores,
  questions,
  userAnswers,
  onSelectField,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'technical' | 'non-technical'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'highest' | 'lowest'>('default');

  const domainList = Object.values(domainScores).filter((item) => {
    if (filterType === 'all') return true;
    return item.discipline.type === filterType;
  });

  if (sortBy === 'highest') {
    domainList.sort((a, b) => b.percentage - a.percentage);
  } else if (sortBy === 'lowest') {
    domainList.sort((a, b) => a.percentage - b.percentage);
  }

  return (
    <div className="space-y-4">
      {/* Interactive Controls & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Fields ({Object.values(domainScores).length})
          </button>
          <button
            onClick={() => setFilterType('technical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'technical'
                ? 'bg-cyan-950 text-cyan-200 border border-cyan-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Technical ({Object.values(domainScores).filter((d) => d.discipline.type === 'technical').length})
          </button>
          <button
            onClick={() => setFilterType('non-technical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'non-technical'
                ? 'bg-amber-950 text-amber-200 border border-amber-800/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Non-Technical ({Object.values(domainScores).filter((d) => d.discipline.type === 'non-technical').length})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="default">Academic Standard Order</option>
            <option value="highest">Highest Score First</option>
            <option value="lowest">Lowest Score First</option>
          </select>
        </div>
      </div>

      {/* Grid of 20 Mastery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {domainList.map((domain) => {
          const IconComp = ICON_MAP[domain.discipline.iconName] || BookOpen;
          const isTechnical = domain.discipline.type === 'technical';
          const fieldQuestions = questions.filter((q) => q.fieldId === domain.discipline.id);

          // Get score tone
          let progressColor = 'bg-slate-600';
          let textColor = 'text-slate-400';
          if (domain.percentage >= 75) {
            progressColor = 'bg-emerald-500';
            textColor = 'text-emerald-400';
          } else if (domain.percentage >= 50) {
            progressColor = isTechnical ? 'bg-cyan-500' : 'bg-amber-500';
            textColor = isTechnical ? 'text-cyan-400' : 'text-amber-400';
          } else if (domain.percentage > 0) {
            progressColor = 'bg-rose-500';
            textColor = 'text-rose-400';
          }

          return (
            <div
              key={domain.discipline.id}
              className="group relative flex flex-col justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg ${
                        isTechnical
                          ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/40'
                          : 'bg-amber-950/70 text-amber-400 border border-amber-800/40'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {domain.discipline.shortName}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-tight line-clamp-1">
                        {domain.discipline.category}
                      </p>
                    </div>
                  </div>

                  <span className={`text-base font-bold font-mono ${textColor}`}>
                    {domain.percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden my-2.5 border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>

                {/* 4 Tiered Question Indicators */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {fieldQuestions.map((q, idx) => {
                      const ans = userAnswers[q.id];
                      const isAnswered = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
                      const isCorrect = isAnswered && ans.selectedOption === q.correctIndex;

                      return (
                        <div
                          key={q.id}
                          title={`${q.difficulty.toUpperCase()} (${q.points}pt): ${q.subtopic}`}
                          className={`flex items-center justify-center w-5 h-5 rounded text-[10px] font-mono border ${
                            !isAnswered
                              ? 'bg-slate-950 text-slate-500 border-slate-800'
                              : isCorrect
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border-rose-800'
                          }`}
                        >
                          {q.difficulty === 'easy' ? 'E' : q.difficulty === 'medium' ? 'M' : 'H'}
                        </div>
                      );
                    })}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {domain.correct} of {domain.total} solved
                  </span>
                </div>
              </div>

              {/* Action Link */}
              {onSelectField && (
                <button
                  onClick={() => onSelectField(domain.discipline.id)}
                  className="mt-3 pt-2 text-left flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-cyan-300 transition-colors border-t border-slate-800/50"
                >
                  <span>Review {domain.discipline.shortName} Problems</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
