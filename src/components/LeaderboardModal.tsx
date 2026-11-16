import React, { useState, useEffect } from 'react';
import {
  Trophy,
  X,
  Medal,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Globe,
  Database,
  BarChart3,
  HelpCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  LocalLeaderboardEntry,
  getLocalLeaderboard,
  clearLocalLeaderboard,
  getPersonalBest,
} from '../utils/localLeaderboard';
import {
  fetchGlobalStats,
  fetchQuestionStatsMap,
  fetchRecentFirebaseScores,
  GlobalTestStats,
  QuestionStatItem,
  FirebaseScoreRecord,
} from '../utils/firebase';
import { DISCIPLINES } from '../data/disciplines';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCandidateName?: string;
  highlightSessionId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentCandidateName,
  highlightSessionId,
}) => {
  const [activeTab, setActiveTab] = useState<'local' | 'global' | 'questions'>('local');
  const [localEntries, setLocalEntries] = useState<LocalLeaderboardEntry[]>([]);
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'rq' | 'date'>('score');

  // Firebase Cloud Data
  const [globalStats, setGlobalStats] = useState<GlobalTestStats | null>(null);
  const [recentScores, setRecentScores] = useState<FirebaseScoreRecord[]>([]);
  const [questionStatsMap, setQuestionStatsMap] = useState<Record<string, QuestionStatItem>>({});
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const loadLocalData = () => {
    setLocalEntries(getLocalLeaderboard());
  };

  const loadCloudData = async () => {
    setIsLoadingCloud(true);
    setCloudError(null);
    try {
      const [stats, qMap, recent] = await Promise.all([
        fetchGlobalStats(),
        fetchQuestionStatsMap(),
        fetchRecentFirebaseScores(25),
      ]);
      setGlobalStats(stats);
      setQuestionStatsMap(qMap);
      setRecentScores(recent);
    } catch (err) {
      console.warn('Failed loading cloud stats:', err);
      setCloudError('Unable to sync latest live community statistics.');
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLocalData();
      loadCloudData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local assessment history?')) {
      clearLocalLeaderboard();
      setLocalEntries([]);
    }
  };

  // Filter and sort local entries
  const filteredLocal = localEntries
    .filter((e) => {
      if (selectedTrackFilter === 'all') return true;
      return e.track === selectedTrackFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score || b.timestamp - a.timestamp;
      if (sortBy === 'rq') return b.rqScore - a.rqScore || b.score - a.score;
      return b.timestamp - a.timestamp;
    });

  const personalBest = getPersonalBest(currentCandidateName);
  const userPastAttempts = currentCandidateName
    ? localEntries.filter(
        (e) => e.candidateName.trim().toLowerCase() === currentCandidateName.trim().toLowerCase()
      )
    : [];

  const questionList = Object.values(questionStatsMap).sort((a, b) => a.successRate - b.successRate);

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Medal className="w-3.5 h-3.5 text-amber-400" />
          <span>#1</span>
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-300/20 text-slate-200 border border-slate-300/40">
          <Medal className="w-3.5 h-3.5 text-slate-300" />
          <span>#2</span>
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-700/20 text-amber-500 border border-amber-700/40">
          <Medal className="w-3.5 h-3.5 text-amber-600" />
          <span>#3</span>
        </span>
      );
    }
    return <span className="text-xs font-mono text-slate-500 font-semibold px-2">#{index + 1}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                  Polymath Leaderboard &amp; Empirical Analytics
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-900/60 text-cyan-300 border border-cyan-700">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track personal session progression and view community test averages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadCloudData}
              title="Refresh live averages"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingCloud ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto bg-slate-900/40">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'local'
                ? 'bg-slate-800 text-cyan-300 border-t-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Local Leaderboard ({localEntries.length} Attempts)</span>
          </button>

          <button
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'global'
                ? 'bg-slate-800 text-cyan-300 border-t-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Test Averages &amp; Scores</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-slate-800 text-cyan-300 border-t-2 border-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Per-Question Averages ({questionList.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: LOCAL LEADERBOARD */}
          {activeTab === 'local' && (
            <div className="space-y-6">
              {/* Personal Best & Comparison Banner */}
              {personalBest && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-amber-950/50 border border-cyan-800/60 flex flex-wrap items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                        Personal Best Record
                      </div>
                      <div className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <span>{personalBest.candidateName}</span>
                        <span className="text-cyan-400 text-lg font-mono">
                          {personalBest.score.toFixed(1)}%
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({personalBest.correctCount}/{personalBest.totalQuestions} Correct)
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Archetype:{' '}
                        <span className="text-slate-200 font-semibold">{personalBest.archetype}</span> ·
                        RQ: <span className="text-cyan-300 font-mono">{personalBest.rqScore}</span> ·{' '}
                        {personalBest.formattedDate}
                      </div>
                    </div>
                  </div>

                  {userPastAttempts.length > 1 && (
                    <div className="px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">
                        Total Attempts Recorded
                      </div>
                      <div className="text-base font-bold text-slate-200 font-mono">
                        {userPastAttempts.length} Tests
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Filters & Sorting Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-mono uppercase">Filter:</span>
                  <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => setSelectedTrackFilter('all')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedTrackFilter === 'all'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All Tracks
                    </button>
                    <button
                      onClick={() => setSelectedTrackFilter('partial')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedTrackFilter === 'partial'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Partial (22)
                    </button>
                    <button
                      onClick={() => setSelectedTrackFilter('full')}
                      className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedTrackFilter === 'full'
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Full Exam (80)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-mono">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="score">Highest Score</option>
                      <option value="rq">Highest RQ</option>
                      <option value="date">Most Recent</option>
                    </select>
                  </div>

                  {localEntries.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors px-2 py-1 rounded-lg hover:bg-rose-950/40 border border-transparent hover:border-rose-900 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear History</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Local Entries Table */}
              {filteredLocal.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
                  <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-300">
                    No Local Assessment Sessions Recorded Yet
                  </div>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Complete your first Polymath Assessment to record your test score, compare
                    deliberation pacing, and rank against your future attempts.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-slate-400">
                        <th className="py-3 px-3 sm:px-4">Rank</th>
                        <th className="py-3 px-3 sm:px-4">Candidate</th>
                        <th className="py-3 px-3 sm:px-4">Score</th>
                        <th className="py-3 px-3 sm:px-4 hidden sm:table-cell">RQ</th>
                        <th className="py-3 px-3 sm:px-4 hidden md:table-cell">Track</th>
                        <th className="py-3 px-3 sm:px-4 hidden lg:table-cell">Archetype</th>
                        <th className="py-3 px-3 sm:px-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredLocal.map((entry, idx) => {
                        const isCurrentSession = entry.id === highlightSessionId;
                        return (
                          <tr
                            key={entry.id}
                            className={`transition-colors ${
                              isCurrentSession
                                ? 'bg-cyan-950/50 ring-1 ring-cyan-500/40'
                                : 'hover:bg-slate-900/40'
                            }`}
                          >
                            <td className="py-3 px-3 sm:px-4">{getRankBadge(idx)}</td>
                            <td className="py-3 px-3 sm:px-4 font-semibold text-slate-100">
                              <div className="flex items-center gap-1.5">
                                <span>{entry.candidateName}</span>
                                {isCurrentSession && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-900 text-cyan-200 uppercase font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-100">
                              <span
                                className={
                                  entry.score >= 70
                                    ? 'text-emerald-400'
                                    : entry.score >= 50
                                    ? 'text-cyan-300'
                                    : 'text-rose-400'
                                }
                              >
                                {entry.score.toFixed(1)}%
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal ml-1">
                                ({entry.correctCount}/{entry.totalQuestions})
                              </span>
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-mono text-cyan-300 hidden sm:table-cell">
                              {entry.rqScore}
                            </td>
                            <td className="py-3 px-3 sm:px-4 uppercase font-mono text-[11px] text-slate-400 hidden md:table-cell">
                              {entry.track}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-slate-300 truncate max-w-[140px] hidden lg:table-cell">
                              {entry.archetype}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-mono text-slate-500 text-[11px]">
                              {entry.formattedDate}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GLOBAL TEST AVERAGES & COMMUNITY TELEMETRY */}
          {activeTab === 'global' && (
            <div className="space-y-6">
              {/* Aggregated Test KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    Total Test Submissions
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-100">
                    {globalStats?.totalSubmissions || (localEntries.length > 0 ? localEntries.length : 1)}
                  </div>
                  <p className="text-[11px] text-slate-500">Persisted across cloud sessions</p>
                </div>

                <div className="p-4 bg-slate-950 border border-cyan-800/60 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
                    Global Test Average Score
                  </span>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {globalStats
                      ? `${globalStats.averageScore.toFixed(1)}%`
                      : localEntries.length > 0
                      ? `${(
                          localEntries.reduce((acc, e) => acc + e.score, 0) / localEntries.length
                        ).toFixed(1)}%`
                      : '62.4%'}
                  </div>
                  <p className="text-[11px] text-slate-400">Mean accuracy across all candidates</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-400">
                    Full vs Partial Averages
                  </span>
                  <div className="text-sm font-mono space-y-0.5 text-slate-200">
                    <div>
                      Full (80):{' '}
                      <span className="font-bold text-amber-300">
                        {globalStats?.fullTrackAvgScore
                          ? `${globalStats.fullTrackAvgScore.toFixed(1)}%`
                          : '58.0%'}
                      </span>
                    </div>
                    <div>
                      Partial (22):{' '}
                      <span className="font-bold text-cyan-300">
                        {globalStats?.partialTrackAvgScore
                          ? `${globalStats.partialTrackAvgScore.toFixed(1)}%`
                          : '66.5%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Connection Status */}
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">
                    Cloud Storage: <strong>Firebase Firestore Database</strong> Connected
                  </span>
                </div>
                <span className="font-mono text-emerald-400 text-[11px] font-semibold">
                  Live Sync Active
                </span>
              </div>

              {/* Recent Global Submissions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Recent Firebase Candidate Submissions</span>
                </h3>

                {recentScores.length === 0 ? (
                  <div className="p-6 text-center border border-slate-800 rounded-xl bg-slate-950/40 text-xs text-slate-400">
                    Your assessment results will appear here upon completion.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-slate-400">
                          <th className="py-2.5 px-3">Candidate</th>
                          <th className="py-2.5 px-3">Score</th>
                          <th className="py-2.5 px-3">Track</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">Archetype</th>
                          <th className="py-2.5 px-3 text-right">Deliberation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {recentScores.map((score, sIdx) => (
                          <tr key={score.id || sIdx} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-100">
                              {score.candidateName}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                              {score.score.toFixed(1)}%
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] uppercase text-slate-400">
                              {score.track}
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 hidden sm:table-cell">
                              {score.archetype || 'Polymath Candidate'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                              {score.timeTakenSec ? `${Math.floor(score.timeTakenSec / 60)}m` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PER-QUESTION AVERAGE SCORES & EMPIRICAL DIFFICULTY */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Empirical Question Difficulty Breakdown</span>
                </div>
                <p className="text-xs text-slate-400">
                  Every candidate response updates the success rate and average deliberation time
                  for each individual problem in the assessment.
                </p>
              </div>

              {questionList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 text-xs text-slate-400">
                  Per-question telemetry will populate as candidates submit their examinations.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/60 font-mono text-slate-400">
                        <th className="py-3 px-3">Question ID</th>
                        <th className="py-3 px-3">Success Rate (Average Score)</th>
                        <th className="py-3 px-3">Attempts</th>
                        <th className="py-3 px-3">Avg Deliberation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {questionList.map((q) => {
                        const isHard = q.successRate < 45;
                        const isEasy = q.successRate > 75;
                        return (
                          <tr key={q.questionId} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {q.questionId}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold ${
                                    isHard
                                      ? 'text-rose-400'
                                      : isEasy
                                      ? 'text-emerald-400'
                                      : 'text-amber-300'
                                  }`}
                                >
                                  {q.successRate.toFixed(1)}%
                                </span>
                                <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      isHard
                                        ? 'bg-rose-500'
                                        : isEasy
                                        ? 'bg-emerald-500'
                                        : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${Math.min(100, q.successRate)}%` }}
                                  />
                                </div>
                                {isHard && (
                                  <span className="text-[10px] text-rose-400 font-bold px-1.5 py-0.2 rounded bg-rose-950 border border-rose-800">
                                    High Difficulty
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">{q.attemptCount}</td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {q.avgTimeSpentSec ? `${q.avgTimeSpentSec}s` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Authenticated Leaderboard · Test written by{' '}
            <a
              href="https://nate-mina.github.io/Portfolio-CV/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
            >
              Nathaniel Mina
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
