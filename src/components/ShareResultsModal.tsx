import React, { useState } from 'react';
import { PolymathEvaluation } from '../types/polymath';
import { generateShareableResultsSnippet, copyToClipboard } from '../utils/shareResults';
import { X, Check, Copy, Share2, Twitter, Mail, Sparkles } from 'lucide-react';

interface ShareResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: PolymathEvaluation;
}

export const ShareResultsModal: React.FC<ShareResultsModalProps> = ({
  isOpen,
  onClose,
  evaluation,
}) => {
  const [format, setFormat] = useState<'detailed' | 'compact'>('detailed');
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const snippet = generateShareableResultsSnippet(evaluation, format);

  const handleCopy = async () => {
    const success = await copyToClipboard(snippet);
    if (success) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Polymath Multidisciplinary Aptitude Report',
          text: snippet,
        });
      } catch (e) {
        // user aborted or not supported
      }
    } else {
      handleCopy();
    }
  };

  const shareOnTwitter = () => {
    const tweetText = encodeURIComponent(
      `I scored ${evaluation.polymathQuotient}/100 on the Polymath Multidisciplinary Aptitude Assessment! Archetype: ${evaluation.archetype.title}.\n\nTest your intellectual breadth:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Share Polymath Evaluation Results
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formatted text snippet summarizing your radar scores &amp; cognitive profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Format:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setFormat('detailed')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  format === 'detailed'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Detailed Radar Breakdown
              </button>
              <button
                onClick={() => setFormat('compact')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  format === 'compact'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Compact Card
              </button>
            </div>
          </div>

          {hasCopied && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs animate-in fade-in">
              <Check className="w-4 h-4" /> Copied to Clipboard!
            </span>
          )}
        </div>

        {/* Monospace Code Preview */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="relative">
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 whitespace-pre leading-relaxed overflow-x-auto selection:bg-cyan-500 selection:text-slate-950">
              {snippet}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={shareOnTwitter}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              <Twitter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share on X</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Device Share</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg text-slate-950 bg-gradient-to-r from-cyan-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 transition-all shadow-md shadow-cyan-950 cursor-pointer"
            >
              {hasCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
