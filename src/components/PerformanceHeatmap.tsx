import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { DisciplinePacing } from '../types/polymath';
import { Clock, Zap, AlertTriangle, CheckCircle2, Filter, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface PerformanceHeatmapProps {
  disciplinePacing?: DisciplinePacing[];
  totalSessionSeconds: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({
  disciplinePacing = [],
  totalSessionSeconds,
}) => {
  const [filter, setFilter] = useState<'all' | 'outliers' | 'technical' | 'non-technical'>('all');
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string | null>(null);

  // Pacing statistics
  const stats = useMemo(() => {
    if (disciplinePacing.length === 0) {
      return {
        meanSeconds: 0,
        minSeconds: 0,
        maxSeconds: 0,
        outlierCount: 0,
        avgSecondsPerQ: 0,
      };
    }

    const times = disciplinePacing.map((d) => d.totalSeconds);
    const totalSec = times.reduce((a, b) => a + b, 0);
    const meanSeconds = totalSec / disciplinePacing.length;
    const minSeconds = Math.min(...times);
    const maxSeconds = Math.max(...times);
    const outlierCount = disciplinePacing.filter((d) => d.isOutlier).length;

    const totalQuestions = disciplinePacing.reduce((sum, d) => sum + d.questionCount, 0);
    const avgSecondsPerQ = totalQuestions > 0 ? Math.round(totalSec / totalQuestions) : 0;

    return {
      meanSeconds,
      minSeconds,
      maxSeconds,
      outlierCount,
      avgSecondsPerQ,
    };
  }, [disciplinePacing]);

  // D3 Color Scale Generator
  const colorScale = useMemo(() => {
    const { minSeconds, meanSeconds, maxSeconds } = stats;
    // Map: min -> Cyan/Sky, mean -> Indigo/Slate, max (outliers) -> Amber/Rose
    const safeMax = Math.max(maxSeconds, meanSeconds * 1.5, 10);
    const safeMin = Math.max(0, minSeconds);

    return d3
      .scaleLinear<string>()
      .domain([safeMin, meanSeconds * 0.8, meanSeconds, meanSeconds * 1.35, safeMax])
      .range(['#0284c7', '#0891b2', '#0f766e', '#d97706', '#e11d48'])
      .interpolate(d3.interpolateRgb);
  }, [stats]);

  // Filtered disciplines
  const filteredList = useMemo(() => {
    return disciplinePacing.filter((d) => {
      if (filter === 'outliers') return d.isOutlier;
      if (filter === 'technical') return d.domainType === 'technical';
      if (filter === 'non-technical') return d.domainType === 'non-technical';
      return true;
    });
  }, [disciplinePacing, filter]);

  const selectedDiscipline = useMemo(() => {
    return disciplinePacing.find((d) => d.disciplineId === selectedDisciplineId);
  }, [disciplinePacing, selectedDisciplineId]);

  if (disciplinePacing.length === 0) {
    return null;
  }

  return (
    <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
      {/* Title & Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Performance Pacing &amp; Deliberation Heatmap</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              D3 Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Dynamic D3 color scaling visualizing time invested per discipline relative to your session mean. Fields highlighted in amber/rose represent cognitive deliberation bottlenecks where time exceeded 135% of average.
          </p>
        </div>

        {/* Global Pacing Telemetry Strip */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Duration</div>
            <div className="text-sm font-bold text-slate-100 tabular-nums">
              {formatDuration(totalSessionSeconds)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Mean / Field</div>
            <div className="text-sm font-bold text-cyan-300 tabular-nums">
              {formatDuration(Math.round(stats.meanSeconds))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Pace / Question</div>
            <div className="text-sm font-bold text-emerald-300 tabular-nums">
              {stats.avgSecondsPerQ}s
            </div>
          </div>

          <div className={`p-2.5 rounded-xl border ${stats.outlierCount > 0 ? 'bg-amber-950/40 border-amber-800/80' : 'bg-slate-950 border-slate-800'}`}>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Deliberate Outliers</div>
            <div className={`text-sm font-bold tabular-nums ${stats.outlierCount > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
              {stats.outlierCount} {stats.outlierCount === 1 ? 'Field' : 'Fields'}
            </div>
          </div>
        </div>
      </div>

      {/* D3 Calibration Scale & Legend */}
      <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Pacing Scale:</span>
          {/* Visual gradient bar */}
          <div className="w-36 md:w-56 h-3 rounded-full bg-gradient-to-r from-sky-600 via-teal-600 via-amber-600 to-rose-600 border border-slate-700/80" />
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="text-sky-400">Rapid (&lt;75%)</span>
            <span className="text-slate-600">·</span>
            <span className="text-teal-400">Nominal</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-semibold">Bottleneck (&gt;135%)</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({disciplinePacing.length})
          </button>
          <button
            onClick={() => setFilter('outliers')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'outliers' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Outliers ({stats.outlierCount})
          </button>
          <button
            onClick={() => setFilter('technical')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'technical' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Technical
          </button>
          <button
            onClick={() => setFilter('non-technical')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              filter === 'non-technical' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:text-white'
            }`}
          >
            Humanities
          </button>
        </div>
      </div>

      {/* Outlier Alert Banner */}
      {stats.outlierCount > 0 && filter !== 'outliers' && (
        <div className="p-3.5 bg-amber-950/20 border border-amber-800/60 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{stats.outlierCount} discipline(s)</strong> required significantly elevated deliberation time (&gt;35% over mean). Review these fields below for conceptual mastery opportunities.
            </span>
          </div>
          <button
            onClick={() => setFilter('outliers')}
            className="px-2.5 py-1 rounded text-[11px] font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            Filter Outliers
          </button>
        </div>
      )}

      {/* The Heatmap Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredList.map((item) => {
          const cellColor = colorScale(item.totalSeconds);
          const isSelected = selectedDisciplineId === item.disciplineId;
          const deltaPct = Math.round((item.ratioToMean - 1) * 100);

          return (
            <div
              key={item.disciplineId}
              onClick={() => setSelectedDisciplineId(isSelected ? null : item.disciplineId)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                item.isOutlier
                  ? 'border-amber-500/80 bg-slate-950/90 shadow-md shadow-amber-950/30'
                  : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
              } ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
            >
              {/* Dynamic D3 Color Accent Line */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-all"
                style={{ backgroundColor: cellColor }}
              />

              <div className="flex items-start justify-between gap-2 pt-1">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    {item.domainType === 'technical' ? 'Technical' : 'Humanities'}
                  </div>
                  <h4 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {item.shortName}
                  </h4>
                </div>

                {item.isOutlier ? (
                  <span
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/80 shrink-0"
                    title="Outlier: Spent significantly more time than average on this field"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>+{deltaPct}%</span>
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border shrink-0 ${
                      item.ratioToMean < 0.75
                        ? 'bg-sky-950/60 text-sky-300 border-sky-800/60'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {deltaPct >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                  </span>
                )}
              </div>

              {/* Time display & Pacing detail */}
              <div className="mt-3 flex items-baseline justify-between text-xs font-mono">
                <div>
                  <span className="text-lg font-bold text-slate-100 tabular-nums">
                    {formatDuration(item.totalSeconds)}
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1">total</span>
                </div>
                <div className="text-right text-slate-400 text-[11px]">
                  <span className="text-cyan-300 font-semibold">{item.avgSecondsPerQ}s</span>
                  <span> / problem</span>
                </div>
              </div>

              {/* Mini Question-Time Distribution Dots */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-[10px]">{item.questionCount} Problems</span>
                <span className="text-cyan-400 font-medium group-hover:underline flex items-center gap-0.5 text-[11px]">
                  <span>{isSelected ? 'Collapse' : 'Inspect Pacing'}</span>
                  {isSelected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Discipline Inspection Drawer */}
      {selectedDiscipline && (
        <div className="p-5 bg-slate-950 border border-cyan-800/80 rounded-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorScale(selectedDiscipline.totalSeconds) }} />
              <h4 className="text-sm font-bold text-slate-100">
                {selectedDiscipline.disciplineName} — Problem-by-Problem Time Breakdown
              </h4>
            </div>

            <button
              onClick={() => setSelectedDisciplineId(null)}
              className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Close Inspection [×]
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {selectedDiscipline.questionTimes.map((q, idx) => {
              const diffColor =
                q.difficulty === 'easy'
                  ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                  : q.difficulty === 'medium'
                  ? 'text-amber-400 bg-amber-950/80 border-amber-800'
                  : 'text-rose-400 bg-rose-950/80 border-rose-800';

              return (
                <div key={q.questionId} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-300 font-semibold">Problem #{idx + 1}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${diffColor}`}>
                      {q.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate" title={q.subtopic}>
                    {q.subtopic}
                  </div>
                  <div className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
                    {formatDuration(q.seconds)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
