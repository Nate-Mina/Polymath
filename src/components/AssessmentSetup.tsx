import React, { useState } from 'react';
import { AssessmentScope, FeedbackTiming } from '../types/polymath';
import { DISCIPLINES, TECHNICAL_DISCIPLINES, NON_TECHNICAL_DISCIPLINES } from '../data/disciplines';
import { DEFAULT_PARTIAL_TECHNICAL_FIELDS, DEFAULT_PARTIAL_HUMANITIES_FIELDS } from '../data/questions';
import {
  Compass,
  Sparkles,
  BookOpen,
  Cpu,
  Layers,
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface AssessmentSetupProps {
  onStart: (
    scope: AssessmentScope,
    timing: FeedbackTiming,
    fieldId?: string,
    customPartialFields?: { technical: string[]; humanities: string[] }
  ) => void;
  hasSavedSession: boolean;
  onResumeSession: () => void;
  savedAnswerCount: number;
}

export const AssessmentSetup: React.FC<AssessmentSetupProps> = ({
  onStart,
  hasSavedSession,
  onResumeSession,
  savedAnswerCount,
}) => {
  const [selectedScope, setSelectedScope] = useState<AssessmentScope>('partial');
  const [selectedTiming, setSelectedTiming] = useState<FeedbackTiming>('instant');
  const [selectedFieldId, setSelectedFieldId] = useState<string>(DISCIPLINES[0].id);

  // Partial Polymath customizable choice fields
  const [partialTechFields, setPartialTechFields] = useState<string[]>(DEFAULT_PARTIAL_TECHNICAL_FIELDS);
  const [partialHumFields, setPartialHumFields] = useState<string[]>(DEFAULT_PARTIAL_HUMANITIES_FIELDS);
  const [isCustomizingPartial, setIsCustomizingPartial] = useState<boolean>(false);

  const toggleTechField = (id: string) => {
    if (partialTechFields.includes(id)) {
      if (partialTechFields.length > 1) {
        setPartialTechFields(partialTechFields.filter((f) => f !== id));
      }
    } else {
      if (partialTechFields.length < 8) {
        setPartialTechFields([...partialTechFields, id]);
      } else {
        // Replace oldest or keep max 8
        setPartialTechFields([...partialTechFields.slice(1), id]);
      }
    }
  };

  const toggleHumField = (id: string) => {
    if (partialHumFields.includes(id)) {
      if (partialHumFields.length > 1) {
        setPartialHumFields(partialHumFields.filter((f) => f !== id));
      }
    } else {
      if (partialHumFields.length < 3) {
        setPartialHumFields([...partialHumFields, id]);
      } else {
        setPartialHumFields([...partialHumFields.slice(1), id]);
      }
    }
  };

  const resetPartialToDefault = () => {
    setPartialTechFields(DEFAULT_PARTIAL_TECHNICAL_FIELDS);
    setPartialHumFields(DEFAULT_PARTIAL_HUMANITIES_FIELDS);
  };

  const getQuestionCount = () => {
    switch (selectedScope) {
      case 'partial':
        return 22; // 8 tech * 2 + 3 hum * 2
      case 'full':
        return 80;
      case 'technical':
        return 60;
      case 'humanities':
        return 20;
      case 'single-field':
        return 4;
    }
  };

  const isPartialValid = partialTechFields.length === 8 && partialHumFields.length === 3;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* Hero Intro Box */}
      <div className="relative p-6 md:p-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Compass className="w-4 h-4" />
          <span>POLYMATH MATRIX · 20 DISCIPLINES</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-slate-100 tracking-tight leading-tight">
          Polymath Multidisciplinary Aptitude Assessment
        </h1>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
          A calibrated psychometric and technical assessment evaluating analytical reasoning across{' '}
          <strong className="text-cyan-300">15 technical university degree fields</strong> and{' '}
          <strong className="text-amber-300">5 classical non-technical disciplines</strong>.
          Choose the full comprehensive matrix or the streamlined{' '}
          <strong className="text-cyan-400">Partial Polymath Choice Assessment</strong> (8 technical + 3 humanities, with 1 Easy and 1 Medium problem per discipline).
        </p>

        {/* 20 Fields Overview Chips */}
        <div className="pt-4 border-t border-slate-800/80">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            20 Academic Curricula Covered:
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {DISCIPLINES.map((d) => (
              <span
                key={d.id}
                className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                  d.type === 'technical'
                    ? 'bg-slate-950/80 text-cyan-300 border-slate-800'
                    : 'bg-slate-950/80 text-amber-300 border-slate-800'
                }`}
              >
                {d.shortName}
              </span>
            ))}
          </div>
        </div>

        {/* Resume Banner if in progress */}
        {hasSavedSession && (
          <div className="mt-4 p-4 bg-cyan-950/40 border border-cyan-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-cyan-300">
                Active Assessment Found in Memory
              </div>
              <div className="text-xs text-slate-300">
                You have {savedAnswerCount} responses recorded from your previous session.
              </div>
            </div>

            <button
              onClick={onResumeSession}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-950 cursor-pointer"
            >
              Resume Previous Session
            </button>
          </div>
        )}
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Select Track / Scope */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-slate-200">
            01. Choose Assessment Scope
          </h2>

          <div className="space-y-2.5">
            {/* PARTIAL POLYMATH CHOICE ASSESSMENT OPTION */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                selectedScope === 'partial'
                  ? 'bg-cyan-950/70 border-cyan-400 ring-1 ring-cyan-500/50 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setSelectedScope('partial')}
                className="w-full text-left cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-cyan-200">
                      Partial Polymath (Choice Track)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-900 text-cyan-200 uppercase font-bold border border-cyan-700">
                      New
                    </span>
                  </div>
                  <span className="font-mono text-xs text-cyan-400 font-bold">22 Problems</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Customizable: <strong>8 Technical</strong> + <strong>3 Humanities</strong> fields.
                  Exactly <strong>1 Easy</strong> and <strong>1 Medium</strong> problem per field.
                </p>
              </button>

              {/* Customizer trigger if partial is selected */}
              {selectedScope === 'partial' && (
                <div className="mt-3 pt-3 border-t border-cyan-900/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300">
                    Active: {partialTechFields.length}/8 Tech · {partialHumFields.length}/3 Hum
                  </span>
                  <button
                    onClick={() => setIsCustomizingPartial(!isCustomizingPartial)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-800 text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>{isCustomizingPartial ? 'Hide Field Selector' : 'Choose 8+3 Fields'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* FULL POLYMATH EXAM */}
            <button
              onClick={() => setSelectedScope('full')}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedScope === 'full'
                  ? 'bg-cyan-950/60 border-cyan-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">
                  Full Polymath Exam (Comprehensive)
                </span>
                <span className="font-mono text-xs text-cyan-400">80 Problems</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                All 20 disciplines (15 technical + 5 humanities). 4 tiered problems per degree.
              </p>
            </button>

            {/* TECHNICAL SUITE */}
            <button
              onClick={() => setSelectedScope('technical')}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedScope === 'technical'
                  ? 'bg-cyan-950/60 border-cyan-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">
                  STEM &amp; Technical Suite
                </span>
                <span className="font-mono text-xs text-cyan-400">60 Problems</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Medicine, Math, Physics, Engineering, Computer Science, and Biosciences.
              </p>
            </button>

            {/* HUMANITIES SUITE */}
            <button
              onClick={() => setSelectedScope('humanities')}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedScope === 'humanities'
                  ? 'bg-amber-950/60 border-amber-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">
                  Humanities &amp; Social Sciences
                </span>
                <span className="font-mono text-xs text-amber-400">20 Problems</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Philosophy, History, Linguistics, Music Theory, and Economics.
              </p>
            </button>

            {/* SINGLE FIELD */}
            <button
              onClick={() => setSelectedScope('single-field')}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedScope === 'single-field'
                  ? 'bg-cyan-950/60 border-cyan-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-100">
                  Single Field Sprint
                </span>
                <span className="font-mono text-xs text-cyan-400">4 Problems</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Deep-dive into a single discipline (2 Easy, 1 Medium, 1 Hard).
              </p>
            </button>

            {selectedScope === 'single-field' && (
              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1 font-mono">
                  Target Degree Field:
                </label>
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.type})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Feedback Timing & Mode */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-slate-200">
              02. Feedback Timing &amp; Style
            </h2>

            <div className="space-y-2.5">
              <button
                onClick={() => setSelectedTiming('instant')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedTiming === 'instant'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-100">
                    Instant Solution Check (Recommended)
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Study Mode</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Answers reveal immediately with worked scientific derivations and formula explanations.
                </p>
              </button>

              <button
                onClick={() => setSelectedTiming('exam')}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedTiming === 'exam'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-100">
                    Exam Mode (Silent &amp; Timed)
                  </span>
                  <span className="text-xs font-mono text-slate-400">Formal Test</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Answers remain hidden until completion, yielding an authentic final diagnostic report.
                </p>
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="text-slate-300 font-medium">
                {selectedScope === 'partial' ? 'Partial Polymath Blueprint:' : 'Difficulty Calibration:'}
              </div>
              {selectedScope === 'partial' ? (
                <>
                  <div className="text-cyan-300">• 8 Technical Fields (1 Easy + 1 Medium each = 16 Qs)</div>
                  <div className="text-amber-300">• 3 Humanities Fields (1 Easy + 1 Medium each = 6 Qs)</div>
                  <div className="text-slate-400">• Total: 22 Problems with comprehensive radar evaluation</div>
                </>
              ) : (
                <>
                  <div>• 2 Easy (1 pt each): Core foundational theorems</div>
                  <div>• 1 Medium (2 pts): Applied multi-step analytical problem</div>
                  <div>• 1 Hard (3 pts): Deep theoretical edge-case or synthesis</div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              onStart(
                selectedScope,
                selectedTiming,
                selectedFieldId,
                selectedScope === 'partial'
                  ? { technical: partialTechFields, humanities: partialHumFields }
                  : undefined
              )
            }
            disabled={selectedScope === 'partial' && !isPartialValid}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-amber-400 hover:from-cyan-300 hover:to-amber-300 transition-all shadow-lg shadow-cyan-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Launch Assessment ({getQuestionCount()} Questions)</span>
          </button>
        </div>
      </div>

      {/* Interactive Partial Polymath Field Customization Drawer */}
      {selectedScope === 'partial' && isCustomizingPartial && (
        <div className="p-6 bg-slate-900 border border-cyan-800/80 rounded-2xl space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Customize Your Partial Polymath Disciplines</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose precisely which 8 technical and 3 humanities fields to include in your assessment.
              </p>
            </div>

            <button
              onClick={resetPartialToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          {/* Technical Section (Choose 8) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-cyan-400 uppercase">
                Technical Fields (Select 8 of 15)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  partialTechFields.length === 8
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {partialTechFields.length} of 8 Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {TECHNICAL_DISCIPLINES.map((d) => {
                const isSelected = partialTechFields.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleTechField(d.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-100 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500">
                        STEM
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                      )}
                    </div>
                    <div className="font-semibold truncate">{d.shortName}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Humanities Section (Choose 3) */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-amber-400 uppercase">
                Humanities &amp; Social Sciences (Select 3 of 5)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  partialHumFields.length === 3
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {partialHumFields.length} of 3 Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {NON_TECHNICAL_DISCIPLINES.map((d) => {
                const isSelected = partialHumFields.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggleHumField(d.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950 border-amber-500 text-amber-100 ring-1 ring-amber-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500">
                        HUM
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                      )}
                    </div>
                    <div className="font-semibold truncate">{d.shortName}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
