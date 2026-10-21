import React from 'react';
import { X, ExternalLink, Compass, BookOpen, Layers, Award, CheckCircle2, Cpu } from 'lucide-react';
import { DISCIPLINES } from '../data/disciplines';

interface AboutTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutTestModal: React.FC<AboutTestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight">
                About the Polymath Aptitude Assessment
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Psychometric framework, 20 academic curricula, and Renaissance Quotient formulation
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs md:text-sm leading-relaxed">
          {/* GitHub Repository Banner */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 text-slate-200 border border-slate-800">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-100">
                  Open Source on GitHub
                </div>
                <div className="text-xs text-slate-400">
                  https://github.com/Nate-Mina/Polymath
                </div>
              </div>
            </div>

            <a
              href="https://github.com/Nate-Mina/Polymath"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-950"
            >
              <span>View Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Core Philosophy */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-cyan-400">
              01. What Defines a Polymath?
            </h3>
            <p className="text-slate-300">
              A polymath is an individual whose intellectual competency extends across significantly divergent academic disciplines, synthesizing principles from both formal sciences and qualitative humanities. Unlike pure domain specialists who master a single vertical, a polymath exhibits both <strong>horizontal breadth</strong> (interdisciplinary cognitive transfer) and <strong>vertical depth</strong> (rigorous analytical problem-solving).
            </p>
          </div>

          {/* Curricula Table & Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-cyan-400">
              02. 20 University-Level Curricula Tested
            </h3>
            <p className="text-slate-300">
              The test encompasses <strong>15 Technical (STEM) disciplines</strong> and <strong>5 Non-Technical (Humanities &amp; Social Sciences) disciplines</strong>:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <span className="font-mono text-cyan-400 font-semibold block uppercase">
                  15 Technical Fields (60 Qs)
                </span>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Medicine &amp; Clinical Science</li>
                  <li>Pure &amp; Applied Mathematics</li>
                  <li>Physics &amp; Quantum Mechanics</li>
                  <li>Electrical Engineering &amp; Circuits</li>
                  <li>Computer Science &amp; Software Systems</li>
                  <li>Mechanical Engineering &amp; Fluids</li>
                  <li>Chemical Engineering &amp; Kinetics</li>
                  <li>Civil &amp; Structural Engineering</li>
                  <li>Aerospace &amp; Aeronautical Engineering</li>
                  <li>Biomedical Engineering &amp; Biomechanics</li>
                  <li>Cognitive Neuroscience &amp; Psychology</li>
                  <li>Data Science &amp; Machine Learning</li>
                  <li>Materials Science &amp; Metallurgy</li>
                  <li>Genetics &amp; Molecular Biology</li>
                  <li>Robotics &amp; Control Systems</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <span className="font-mono text-amber-400 font-semibold block uppercase">
                  5 Non-Technical Fields (20 Qs)
                </span>
                <ul className="text-slate-400 space-y-1 list-disc list-inside">
                  <li>Epistemology &amp; Formal Logic</li>
                  <li>World History &amp; Historiography</li>
                  <li>Linguistics &amp; Literary Theory</li>
                  <li>Music Theory &amp; Psychoacoustics</li>
                  <li>Economics &amp; Strategic Game Theory</li>
                </ul>

                <div className="pt-3 border-t border-slate-900 mt-2 space-y-1">
                  <span className="font-mono text-slate-300 font-semibold block">
                    Strict Tier Calibration:
                  </span>
                  <div className="text-slate-400 text-[11px]">
                    Every discipline includes exactly:
                    <div>• <strong>2 Easy (1 pt each)</strong>: Foundational definitions &amp; laws</div>
                    <div>• <strong>1 Medium (2 pts)</strong>: Applied multi-step calculation</div>
                    <div>• <strong>1 Hard (3 pts)</strong>: Advanced theoretical edge case</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Tracks */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-cyan-400">
              03. Available Tracks &amp; Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="font-semibold text-slate-100 block">Full Polymath Exam (80 Problems)</span>
                <span className="text-slate-400">All 20 degree fields with complete 20-axis radar telemetry.</span>
              </div>
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-xl">
                <span className="font-semibold text-cyan-300 block">Partial Polymath Sprint (22 Problems)</span>
                <span className="text-slate-400">Customizable: 8 technical + 3 humanities disciplines (1 Easy + 1 Medium each).</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="font-semibold text-slate-100 block">STEM &amp; Technical Suite (60 Problems)</span>
                <span className="text-slate-400">Concentrated diagnostic across all 15 technical fields.</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="font-semibold text-slate-100 block">Humanities Suite (20 Problems)</span>
                <span className="text-slate-400">Concentrated diagnostic across philosophy, history, linguistics, music, and economics.</span>
              </div>
            </div>
          </div>

          {/* Renaissance Quotient Formula */}
          <div className="space-y-2 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-cyan-400">
              04. Renaissance Quotient (0–100) Formulation
            </h3>
            <p className="text-slate-300 text-xs">
              The Renaissance Quotient ($RQ$) calculates a balanced multidimensional index:
            </p>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-cyan-300 overflow-x-auto">
              RQ = 0.35 × (Accuracy) + 0.25 × (Breadth ≥ 50%) + 0.25 × (Depth: Med/Hard) + 0.15 × (STEM/Humanities Harmony)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-slate-400">
              <div>• Tier I: Homo Universalis (&ge;88)</div>
              <div>• Tier II: Renaissance Scholar (&ge;72)</div>
              <div>• Tier III: Broad Generalist (&ge;56)</div>
              <div>• Tier IV: Domain Specialist</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-4">
          <a
            href="https://github.com/Nate-Mina/Polymath"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Nate-Mina/Polymath</span>
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
