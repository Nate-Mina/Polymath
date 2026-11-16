import React, { useState, useEffect } from 'react';
import {
  Trophy,
  X,
  Medal,
  Sparkles,
  Trash2,
  Globe,
  Database,
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  LogIn,
  Cloud,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react';
import {
  LocalLeaderboardEntry,
  getLocalLeaderboard,
  clearLocalLeaderboard,
  getPersonalBest,
} from '../utils/localLeaderboard';
import {
  AuthUser,
  CommunityScoreRecord,
  PersonalAssessmentRecord,
  GlobalCommunityStats,
  QuestionStatItem,
  subscribeToCommunityScores,
  subscribeToGlobalCommunityStats,
  subscribeToPersonalAssessments,
  deletePersonalAssessment,
  fetchQuestionStatsMap,
  signInWithGoogle,
} from '../utils/firebase';
import { DISCIPLINE_MAP } from '../data/disciplines';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: AuthUser | null;
  currentCandidateName?: string;
  latestPq?: number;
  latestAccuracy?: number;
  highlightSessionId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  authUser,
  currentCandidateName,
  latestPq,
  latestAccuracy,
  highlightSessionId,
}) => {
  const [activeTab, setActiveTab] = useState<'community' | 'personal' | 'questions'>('community');
  const [localEntries, setLocalEntries] = useState<LocalLeaderboardEntry[]>([]);
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);

  // Firebase Live Streams
  const [globalStats, setGlobalStats] = useState<GlobalCommunityStats | null>(null);
  const [communityScores, setCommunityScores] = useState<CommunityScoreRecord[]>([]);
  const [personalAssessments, setPersonalAssessments] = useState<PersonalAssessmentRecord[]>([]);
  const [questionStatsMap, setQuestionStatsMap] = useState<Record<string, QuestionStatItem>>({});
  const [isLoadingCloud, setIsLoadingCloud] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  const loadLocalData = () => {
    setLocalEntries(getLocalLeaderboard());
  };

  const loadQuestionStats = async () => {
    if (!authUser) return;
    setIsLoadingCloud(true);
    try {
      const qMap = await fetchQuestionStatsMap();
      setQuestionStatsMap(qMap);
    } catch (err) {
      console.warn('Could not load question stats:', err);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadLocalData();

    if (!authUser) {
      setGlobalStats(null);
      setCommunityScores([]);
      setPersonalAssessments([]);
      return;
    }

    setIsLoadingCloud(true);
    setCloudError(null);

    const unsubStats = subscribeToGlobalCommunityStats(
      (stats) => {
        setGlobalStats(stats);
        setIsLoadingCloud(false);
      },
      (err) => {
        setCloudError(err.message);
        setIsLoadingCloud(false);
      }
    );

    const unsubCommunity = subscribeToCommunityScores(
      (scores) => {
        setCommunityScores(scores);
        setIsLoadingCloud(false);
      },
      (err) => {
        setCloudError(err.message);
        setIsLoadingCloud(false);
      }
    );

    const unsubPersonal = subscribeToPersonalAssessments(
      authUser.uid,
      (records) => {
        setPersonalAssessments(records);
      },
      (err) => {
        console.warn('Personal assessments sync:', err.message);
      }
    );

    loadQuestionStats();

    return () => {
      unsubStats();
      unsubCommunity();
      unsubPersonal();
    };
  }, [isOpen, authUser]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setCloudError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setCloudError('Google Sign-In was cancelled or failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDeleteCloudRecord = async (recordId: string) => {
    if (!authUser) return;
    if (!window.confirm('Delete this saved assessment from your cloud history?')) return;
    try {
      await deletePersonalAssessment(authUser.uid, recordId);
    } catch (err) {
      console.error('Failed deleting record:', err);
    }
  };

  const handleClearLocalHistory = () => {
    if (window.confirm('Are you sure you want to clear your browser-local assessment history?')) {
      clearLocalLeaderboard();
      setLocalEntries([]);
    }
  };

  // Compute Personal Metrics (preferring Cloud Personal Records when signed in, falling back to Local)
  const effectivePersonalList =
    personalAssessments.length > 0
      ? personalAssessments.map((r) => ({
          pq: r.polymathQuotient,
          acc: r.accuracyPercentage,
        }))
      : localEntries.map((r) => ({
          pq: r.rqScore,
          acc: r.score,
        }));

  const personalTotalTests = effectivePersonalList.length;
  const personalAvgPq =
    personalTotalTests > 0
      ? Math.round(
          (effectivePersonalList.reduce((sum, item) => sum + item.pq, 0) / personalTotalTests) * 10
        ) / 10
      : 0;
  const personalBestPq =
    personalTotalTests > 0 ? Math.max(...effectivePersonalList.map((item) => item.pq)) : 0;

  // Determine the user's latest benchmark PQ & Accuracy
  const userComparisonPq =
    latestPq !== undefined && latestPq > 0
      ? latestPq
      : personalAssessments[0]?.polymathQuotient ??
        localEntries[0]?.rqScore ??
        personalAvgPq;

  const userComparisonAccuracy =
    latestAccuracy !== undefined && latestAccuracy > 0
      ? latestAccuracy
      : personalAssessments[0]?.accuracyPercentage ??
        localEntries[0]?.score ??
        0;

  const hasUserScore = userComparisonPq > 0 || personalTotalTests > 0;
  const globalAvgPq = globalStats?.averagePq ?? 0;
  const globalAvgAcc = globalStats?.averageAccuracy ?? 0;
  const hasGlobalStats = !!globalStats && globalStats.totalAttempts > 0;

  const deltaVsGlobalPq =
    hasUserScore && hasGlobalStats
      ? Math.round((userComparisonPq - globalAvgPq) * 10) / 10
      : 0;

  // Dual-marker scale ceiling
  const scaleMax = Math.max(100, globalStats?.highestPq || 100, userComparisonPq || 100);
  const userPctOnBar = Math.min(100, Math.max(0, (userComparisonPq / scaleMax) * 100));
  const globalPctOnBar = Math.min(100, Math.max(0, (globalAvgPq / scaleMax) * 100));

  const filteredLocal = localEntries.filter((e) =>
    selectedTrackFilter === 'all' ? true : e.track === selectedTrackFilter
  );

  const personalBestLocal = getPersonalBest(currentCandidateName);
  const questionList = Object.values(questionStatsMap).sort((a, b) => a.successRate - b.successRate);

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-[#FDE68A] border border-[#D4AF37]/60">
          <Medal className="w-3.5 h-3.5 text-[#D4AF37]" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#090E1A]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0F172A] border border-[#334155] rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-[#334155]/80 flex items-center justify-between bg-[#090E1A]/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-950/60 border border-[#D4AF37]/50 text-[#D4AF37]">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#F8FAFC]">
                  Scores, Global Averages &amp; Community Benchmarks
                </h2>
                {authUser && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/70 text-[#10B981] border border-emerald-700/60">
                    Cloud Synced
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">
                Compare your Polymath Quotient (PQ) &amp; accuracy against the global community average and your personal history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <button
                onClick={loadQuestionStats}
                title="Refresh empirical analytics"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingCloud ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* GLOBAL COMPARISON CARD + PERSONAL SUMMARY STRIP              */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 bg-[#090E1A]/40 border-b border-[#334155]/80 space-y-4">
          {!authUser ? (
            <div className="p-4 rounded-2xl bg-[#1E293B] border border-[#D4AF37]/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-950/70 border border-[#D4AF37]/50 text-[#D4AF37]">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#F8FAFC]">
                    Sign in with Google to Unlock Global Community Benchmarks
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    View real-time Global Community Average PQ, save scores to your cloud profile, and compare on the community leaderboard.
                  </p>
                </div>
              </div>
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-[#D4AF37] hover:bg-[#FDE68A] transition-colors shadow-md cursor-pointer disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#1E293B] border border-[#334155] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Latest User Score vs Global Average */}
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      Your Latest PQ
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black font-mono text-[#FDE68A]">
                        {hasUserScore ? `PQ ${userComparisonPq}` : '—'}
                      </span>
                      {hasUserScore && (
                        <span className="text-xs font-mono text-cyan-300 font-semibold">
                          ({userComparisonAccuracy}% Acc)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-10 w-px bg-[#334155] hidden sm:block" />

                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      Global Community Avg
                    </div>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black font-mono text-[#F8FAFC]">
                        {hasGlobalStats ? `PQ ${globalAvgPq.toFixed(1)}` : 'No entries yet'}
                      </span>
                      {hasGlobalStats && (
                        <span className="text-xs font-mono text-[#94A3B8]">
                          ({globalAvgAcc.toFixed(1)}% Avg Acc · {globalStats.totalAttempts} saves)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delta vs Global Average Badge */}
                {hasUserScore && hasGlobalStats && (
                  <div
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold ${
                      deltaVsGlobalPq >= 0
                        ? 'bg-emerald-950/60 border-emerald-700/70 text-[#10B981]'
                        : 'bg-amber-950/60 border-amber-700/70 text-[#F59E0B]'
                    }`}
                  >
                    {deltaVsGlobalPq > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : deltaVsGlobalPq < 0 ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                    <span>
                      {deltaVsGlobalPq > 0
                        ? `+${deltaVsGlobalPq} PQ above average`
                        : deltaVsGlobalPq < 0
                        ? `${deltaVsGlobalPq} PQ vs average`
                        : 'Exact match with global average'}
                    </span>
                  </div>
                )}
              </div>

              {/* Dual-Marker Visual Comparison Bar */}
              {hasGlobalStats && (
                <div className="space-y-1.5">
                  <div className="relative h-3 w-full bg-[#090E1A] rounded-full border border-[#334155] overflow-hidden">
                    {/* Global Average Marker Line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-[#F59E0B] z-20"
                      style={{ left: `${globalPctOnBar}%` }}
                      title={`Global Community Average: PQ ${globalAvgPq.toFixed(1)}`}
                    />
                    {/* Your Latest PQ Fill */}
                    {hasUserScore && (
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] transition-all duration-500"
                        style={{ width: `${userPctOnBar}%` }}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>0 PQ</span>
                    <span className="text-[#F59E0B]">
                      ▲ Global Avg: {globalAvgPq.toFixed(1)} PQ
                    </span>
                    <span>Peak Recorded: {globalStats?.highestPq || 100} PQ</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Personal Summary Strip */}
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Personal Avg PQ</div>
              <div className="text-lg font-bold text-[#FDE68A] mt-0.5">
                {personalTotalTests > 0 ? `PQ ${personalAvgPq}` : '—'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Personal Best PQ</div>
              <div className="text-lg font-bold text-[#10B981] mt-0.5">
                {personalTotalTests > 0 ? `PQ ${personalBestPq}` : '—'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#0F172A] border border-[#334155]">
              <div className="text-[10px] text-[#94A3B8] uppercase">Total Saved Tests</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">{personalTotalTests}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 pt-3 border-b border-[#334155]/80 flex items-center gap-2 overflow-x-auto bg-[#0F172A]">
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-[#1E293B] text-[#FDE68A] border-t-2 border-[#D4AF37] font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Community Scores ({communityScores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-[#1E293B] text-[#FDE68A] border-t-2 border-[#D4AF37] font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>
              My Saved Scores ({personalAssessments.length} Cloud · {localEntries.length} Local)
            </span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-[#1E293B] text-[#FDE68A] border-t-2 border-[#D4AF37] font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Per-Question Averages ({questionList.length})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {cloudError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 font-mono">
              {cloudError}
            </div>
          )}

          {/* TAB 1: COMMUNITY SCORES FEED */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              {!authUser ? (
                <div className="p-10 text-center border border-dashed border-[#334155] rounded-2xl bg-[#090E1A]/40 space-y-3">
                  <Globe className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-200">
                    Sign in with Google to View Live Community Scores
                  </div>
                  <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                    Your Google identity keeps public community scoreboards secure while displaying zero private email or PII fields.
                  </p>
                </div>
              ) : communityScores.length === 0 ? (
                <div className="p-10 text-center border border-dashed border-[#334155] rounded-2xl bg-[#090E1A]/40 space-y-2">
                  <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto" />
                  <div className="text-sm font-semibold text-slate-200">
                    Be the First Scholar on the Cloud Scoreboard!
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Complete an assessment and click &ldquo;Save Score to Cloud&rdquo; on your Results screen.
                  </p>
                </div>
              ) : (
                <div className="border border-[#334155] rounded-2xl overflow-hidden bg-[#090E1A]/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#334155] bg-[#1E293B]/80 font-mono text-[#94A3B8]">
                        <th className="py-3 px-3 sm:px-4">Rank</th>
                        <th className="py-3 px-3 sm:px-4">Scholar</th>
                        <th className="py-3 px-3 sm:px-4">Polymath Quotient</th>
                        <th className="py-3 px-3 sm:px-4">Accuracy</th>
                        <th className="py-3 px-3 sm:px-4 hidden md:table-cell">vs Global Avg</th>
                        <th className="py-3 px-3 sm:px-4 hidden lg:table-cell">Archetype &amp; Track</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/60">
                      {communityScores.map((entry, idx) => {
                        const isMine = authUser && entry.userId === authUser.uid;
                        const entryDelta = hasGlobalStats
                          ? Math.round((entry.polymathQuotient - globalAvgPq) * 10) / 10
                          : 0;

                        return (
                          <tr
                            key={entry.id}
                            className={isMine ? 'bg-amber-950/20' : 'hover:bg-slate-900/40'}
                          >
                            <td className="py-3 px-3 sm:px-4">{getRankBadge(idx)}</td>
                            <td className="py-3 px-3 sm:px-4 font-semibold text-slate-100">
                              <div className="flex items-center gap-1.5">
                                <span>{entry.scholarName}</span>
                                {isMine && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-900/70 text-[#FDE68A] border border-[#D4AF37]/40 uppercase font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-mono font-bold text-[#FDE68A]">
                              PQ {entry.polymathQuotient}
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-mono text-cyan-300">
                              {entry.accuracyPercentage}%
                            </td>
                            <td className="py-3 px-3 sm:px-4 font-mono hidden md:table-cell">
                              {hasGlobalStats ? (
                                <span
                                  className={
                                    entryDelta >= 0 ? 'text-[#10B981]' : 'text-[#F59E0B]'
                                  }
                                >
                                  {entryDelta >= 0 ? `+${entryDelta}` : entryDelta} PQ
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-slate-300 hidden lg:table-cell">
                              <div className="truncate max-w-[200px] font-medium">
                                {entry.archetypeTitle}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500">
                                {entry.modeName} · {new Date(entry.createdAtMs).toLocaleDateString()}
                              </div>
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

          {/* TAB 2: MY SAVED SCORES (CLOUD + LOCAL) */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              {/* Cloud Personal History */}
              {authUser && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-[#D4AF37]" />
                      <span>Cloud Saved Assessments ({personalAssessments.length})</span>
                    </h3>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      Click any assessment to inspect domain scores
                    </span>
                  </div>

                  {personalAssessments.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[#334155] rounded-2xl bg-[#090E1A]/40 text-xs text-[#94A3B8]">
                      No cloud-saved scores yet. Tap &ldquo;Save Score to Cloud&rdquo; after finishing an assessment!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {personalAssessments.map((rec) => {
                        const isExpanded = expandedRecordId === rec.id;
                        return (
                          <div
                            key={rec.id}
                            className="border border-[#334155] rounded-2xl bg-[#1E293B]/60 overflow-hidden"
                          >
                            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                              <button
                                onClick={() =>
                                  setExpandedRecordId(isExpanded ? null : rec.id)
                                }
                                className="flex-1 text-left flex flex-wrap items-center gap-4 cursor-pointer"
                              >
                                <div>
                                  <div className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                                    <span>{rec.scholarName}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0F172A] text-cyan-300 border border-[#334155]">
                                      {rec.modeName}
                                    </span>
                                  </div>
                                  <div className="text-xs text-[#94A3B8] mt-0.5">
                                    {rec.archetypeTitle} ·{' '}
                                    {new Date(rec.createdAtMs).toLocaleDateString()}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 font-mono ml-auto">
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-[#FDE68A]">
                                      PQ {rec.polymathQuotient}
                                    </div>
                                    <div className="text-[11px] text-cyan-300">
                                      {rec.accuracyPercentage}% ({rec.correctCount}/{rec.totalCount})
                                    </div>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                              </button>

                              <button
                                onClick={() => handleDeleteCloudRecord(rec.id)}
                                title="Delete cloud score"
                                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="px-4 pb-4 pt-2 border-t border-[#334155]/70 bg-[#090E1A]/40 space-y-2">
                                <div className="text-[11px] font-mono uppercase text-[#94A3B8]">
                                  Domain Mastery Breakdown
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                                  {Object.entries(rec.domainScores).map(([fieldId, pct]) => {
                                    const meta = DISCIPLINE_MAP.get(fieldId);
                                    return (
                                      <div
                                        key={fieldId}
                                        className="p-2 rounded-lg bg-[#0F172A] border border-[#334155] flex items-center justify-between gap-2"
                                      >
                                        <span className="text-slate-300 truncate">
                                          {meta?.shortName || fieldId}
                                        </span>
                                        <span
                                          className={`font-bold ${
                                            pct >= 75
                                              ? 'text-[#10B981]'
                                              : pct >= 50
                                              ? 'text-[#FDE68A]'
                                              : 'text-rose-400'
                                          }`}
                                        >
                                          {pct}%
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Local Browser Session History */}
              <div className="space-y-3 pt-2 border-t border-[#334155]/60">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-200">
                      Browser Session History ({localEntries.length})
                    </h3>
                    {personalBestLocal && (
                      <span className="text-cyan-300 font-mono text-[11px]">
                        Best: {personalBestLocal.score.toFixed(1)}% (PQ {personalBestLocal.rqScore})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTrackFilter}
                      onChange={(e) => setSelectedTrackFilter(e.target.value)}
                      className="bg-[#090E1A] border border-[#334155] text-slate-200 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="all">All Tracks</option>
                      <option value="partial">Partial (22)</option>
                      <option value="full">Full Exam (80)</option>
                    </select>

                    {localEntries.length > 0 && (
                      <button
                        onClick={handleClearLocalHistory}
                        className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-950/40 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Local</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredLocal.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-[#334155] rounded-2xl bg-[#090E1A]/40 text-xs text-[#94A3B8]">
                    No local browser attempts recorded yet.
                  </div>
                ) : (
                  <div className="border border-[#334155] rounded-2xl overflow-hidden bg-[#090E1A]/50">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] bg-[#1E293B]/60 font-mono text-[#94A3B8]">
                          <th className="py-2.5 px-3">Candidate</th>
                          <th className="py-2.5 px-3">PQ</th>
                          <th className="py-2.5 px-3">Accuracy</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">Track</th>
                          <th className="py-2.5 px-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {filteredLocal.map((entry) => {
                          const isCurrent = entry.id === highlightSessionId;
                          return (
                            <tr
                              key={entry.id}
                              className={isCurrent ? 'bg-cyan-950/40' : 'hover:bg-slate-900/40'}
                            >
                              <td className="py-2.5 px-3 font-semibold text-slate-100">
                                {entry.candidateName}
                                {isCurrent && (
                                  <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-900 text-cyan-200 uppercase">
                                    Current
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-[#FDE68A]">
                                PQ {entry.rqScore}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-cyan-300">
                                {entry.score.toFixed(1)}% ({entry.correctCount}/{entry.totalQuestions})
                              </td>
                              <td className="py-2.5 px-3 font-mono uppercase text-[11px] text-slate-400 hidden sm:table-cell">
                                {entry.track}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-slate-500 text-[11px]">
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
            </div>
          )}

          {/* TAB 3: PER-QUESTION EMPIRICAL AVERAGES */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1E293B]/60 border border-[#334155] rounded-2xl space-y-1">
                <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Empirical Question Difficulty Breakdown</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Aggregated success rates and average deliberation duration across cloud-saved assessments.
                </p>
              </div>

              {questionList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#334155] rounded-2xl bg-[#090E1A]/40 text-xs text-[#94A3B8]">
                  {authUser
                    ? 'Per-question telemetry will appear once cloud scores are saved.'
                    : 'Sign in with Google to view live per-question accuracy telemetry.'}
                </div>
              ) : (
                <div className="border border-[#334155] rounded-2xl overflow-hidden bg-[#090E1A]/50">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#334155] bg-[#1E293B]/80 font-mono text-[#94A3B8]">
                        <th className="py-3 px-3">Question ID</th>
                        <th className="py-3 px-3">Community Success Rate</th>
                        <th className="py-3 px-3">Attempts</th>
                        <th className="py-3 px-3">Avg Deliberation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#334155]/60 font-mono">
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
                                      ? 'text-[#10B981]'
                                      : 'text-[#F59E0B]'
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
                                        ? 'bg-[#10B981]'
                                        : 'bg-[#F59E0B]'
                                    }`}
                                    style={{ width: `${Math.min(100, q.successRate)}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">{q.attemptCount}</td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {q.avgTimeSpentSec ? `${q.avgTimeSpentSec}s` : '—'}
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
        <div className="p-4 border-t border-[#334155] bg-[#090E1A]/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[#94A3B8] flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              Test written by{' '}
              <a
                href="https://nate-mina.github.io/Portfolio-CV/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
              >
                Nathaniel Mina
              </a>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close Scores
          </button>
        </div>
      </div>
    </div>
  );
};
