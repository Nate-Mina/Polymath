import React, { useState } from 'react';
import { PolymathEvaluation } from '../types/polymath';
import { FireworksCanvas } from './FireworksCanvas';
import {
  X,
  Award,
  Sparkles,
  FileDown,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: PolymathEvaluation;
  candidateName?: string;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  evaluation,
  candidateName,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  const [showFireworks, setShowFireworks] = useState<boolean>(true);

  if (!isOpen) return null;

  const effectiveName = candidateName?.trim() || evaluation.candidateName || 'Guest Scholar';
  const isPolymath = evaluation.polymathQuotient > 70;
  const isUnderFifty = evaluation.accuracyPercentage < 50 || evaluation.polymathQuotient < 50;
  const issuedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const verificationId = `POLYMATH-${Math.abs(Date.now() % 10000000).toString(16).toUpperCase()}-${evaluation.polymathQuotient}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Active Fireworks Canvas if score > 70 */}
      {isPolymath && showFireworks && (
        <FireworksCanvas durationMs={12000} />
      )}

      <div className="relative w-full max-w-3xl my-auto bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] z-10">
        {/* Top Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          title="Close certificate window"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Banner for Polymaths (> 70) */}
        {isPolymath && (
          <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-slate-950 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950/20 rounded-2xl">
                <Flame className="w-7 h-7 text-yellow-200 animate-bounce" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-wider uppercase font-mono drop-shadow-sm flex items-center gap-2">
                  <span>YAY YOUR POLY!</span>
                  <span>🎉</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900/90 mt-0.5">
                  Outstanding! You scored over 70 ({evaluation.polymathQuotient}/100) and demonstrated true multidisciplinary cognitive breadth!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowFireworks(false);
                setTimeout(() => setShowFireworks(true), 50);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-amber-300 text-xs font-bold font-mono hover:bg-slate-900 transition-all cursor-pointer shadow-md"
              title="Launch fireworks again!"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Replay Fireworks</span>
            </button>
          </div>
        )}

        {/* Roast Banner for Scores Under 50% */}
        {isUnderFifty && !isPolymath && (
          <div className="relative px-6 py-5 bg-gradient-to-r from-red-950 via-rose-900 to-amber-950 border-b border-red-800 text-white shadow-xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-900/60 border border-red-700/80 rounded-2xl shrink-0 text-3xl shadow-inner">
                🍔🔥
              </div>
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
                  SCORE UNDER 50% · SPECIAL VERDICT
                </div>
                <div className="text-base sm:text-lg font-black text-amber-200 tracking-tight leading-snug font-mono">
                  &ldquo;Your A Jack Of No Trades, jackass go flip some burgers and maybe in years you will learn how not to burn them&rdquo;
                </div>
                <p className="text-xs text-rose-300 font-mono">
                  Accuracy: {evaluation.accuracyPercentage}% · Renaissance Quotient: {evaluation.polymathQuotient}/100
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Display Stage */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6">
          {/* Certificate Parchment Container */}
          <div className="relative p-6 sm:p-10 bg-slate-950 border-2 border-slate-700 rounded-2xl shadow-inner space-y-6 overflow-hidden">
            {/* Ornate Inner Border */}
            <div className="absolute inset-2 border border-cyan-500/30 rounded-xl pointer-events-none" />

            {/* Corner Decorative Glyphs */}
            <div className="absolute top-3 left-3 text-amber-400/60 font-serif text-sm">✦</div>
            <div className="absolute top-3 right-3 text-amber-400/60 font-serif text-sm">✦</div>
            <div className="absolute bottom-3 left-3 text-amber-400/60 font-serif text-sm">✦</div>
            <div className="absolute bottom-3 right-3 text-amber-400/60 font-serif text-sm">✦</div>

            {/* Header Institution */}
            <div className="text-center space-y-1">
              <div className="text-[10px] sm:text-xs font-mono font-semibold tracking-widest text-slate-400 uppercase">
                ACADEMIA POLYMATHICA UNIVERSALIS
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-100 tracking-tight font-serif">
                CERTIFICATE OF POLYMATHIC APTITUDE
              </h2>
              <div className="text-[11px] font-mono text-cyan-400 tracking-wide">
                CALIBRATED MULTIDISCIPLINARY COGNITIVE EVALUATION
              </div>
            </div>

            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto" />

            {/* Inscription Body */}
            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-slate-400 italic font-serif">
                This officially certifies that
              </p>
              <div className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-slate-100 to-amber-300 py-1">
                {effectiveName}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                has completed the rigorous 20-discipline examination, demonstrating analytical breadth and epistemic depth across technical and humanistic curricula.
              </p>
            </div>

            {/* Metric Dial Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl text-center">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Renaissance Quotient</div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tabular-nums">
                  {evaluation.polymathQuotient}
                </div>
                <div className="text-[10px] font-mono text-slate-500">Scale 0 - 100</div>
              </div>

              <div className="space-y-1 sm:border-x sm:border-slate-800 px-2">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Confidence Score</div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tabular-nums">
                  {evaluation.confidenceScore}%
                </div>
                <div className="text-[10px] font-mono text-emerald-500">
                  {evaluation.confidenceScore >= 70 ? 'High Polymathic Confidence' : 'Developing Broadness'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Archetype Designation</div>
                <div className="text-sm font-bold text-amber-300 leading-tight">
                  {evaluation.archetype.title}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {evaluation.archetype.badge}
                </div>
              </div>
            </div>

            {/* Breakdown Mini Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">TOTAL ACCURACY</span>
                <span className="text-slate-200 font-bold">{evaluation.accuracyPercentage}%</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">STEM MASTERY</span>
                <span className="text-cyan-400 font-bold">{evaluation.technicalScore.percentage}%</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">HUMANITIES</span>
                <span className="text-amber-400 font-bold">{evaluation.humanitiesScore.percentage}%</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">HARMONY INDEX</span>
                <span className="text-emerald-400 font-bold">{evaluation.balanceIndex}/100</span>
              </div>
            </div>

            {/* In-Certificate Verdict for Scores Under 50% */}
            {isUnderFifty && (
              <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl text-center space-y-1">
                <div className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
                  Diagnostic Classification
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-200 font-mono">
                  &ldquo;Your A Jack Of No Trades, jackass go flip some burgers and maybe in years you will learn how not to burn them&rdquo;
                </div>
              </div>
            )}

            {/* Certificate Signatory & Attribution */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div>
                <div>CREDENTIAL ID: <span className="text-slate-300">{verificationId}</span></div>
                <div>ISSUED: <span className="text-slate-300">{issuedDate}</span></div>
              </div>

              <div className="text-right">
                <div>Test written by <a href="https://nate-mina.github.io/Portfolio-CV/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Nathaniel Mina</a></div>
                <div className="text-[11px] text-slate-500">Board of Interdisciplinary Psychometrics</div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 transition-all shadow-lg shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Compiling PDF Certificate...' : 'Download Official PDF Certificate & Exam Audit'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <span>Explore Full Diagnostic Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
