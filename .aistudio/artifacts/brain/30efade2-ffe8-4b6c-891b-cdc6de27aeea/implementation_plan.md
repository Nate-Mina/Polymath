# Performance Heatmap (D3), Polymath Certificate & Audit PDF Export, and Candidate Onboarding

A diagnostic reporting and credentialing upgrade for the Polymath Multidisciplinary Aptitude Assessment, incorporating candidate identity intake, a D3-powered discipline time & deliberation heatmap with pacing anomaly alerts, and a multi-page PDF certificate and exam audit exporter.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions were clarified during Phase 1:
> - **Candidate Identity**: Configurable on the assessment setup screen with optional guest fallback (`"Guest Scholar"`). Candidate name persists across sessions and is inscribed on the diploma certificate.
> - **PDF Export Topology**: Formal executive certificate diploma cover page followed by organized multi-page question audits displaying candidate selections, correct answers, status glyphs, and scientific rationales.
> - **D3 Performance Heatmap**: An interactive colored discipline matrix visualizing time spent per degree field, comparing against the global session average, and highlighting deliberate outliers with pacing anomaly badges.

---

## 1. Overview & Core Concept

### What It Delivers
1. **Candidate Name Onboarding**: An identity intake field on the test setup view that captures the test-taker's name, persists it to `localStorage`, and displays it on the header, report dashboard, and official certificate.
2. **Real-Time Question Pacing Tracker**: Upgraded telemetry in the test session that logs precise seconds spent on each individual problem and aggregates time-by-discipline.
3. **D3 Performance Heatmap**: An interactive D3 data visualization rendering all tested academic disciplines in a calibrated matrix. Heat colors map directly to time spent relative to the session average, calling out disciplines where the candidate experienced significant cognitive deliberation (outliers > 135% of mean).
4. **Official Polymath Diploma & Audit PDF Generator**: One-click PDF compilation generating a high-resolution, vector-crisp certificate displaying the candidate's name, Polymath Quotient confidence score, archetype classification, and issuance timestamp, followed by an exhaustive catalog of every question taken, the candidate's chosen option, the verified answer, correctness badge, and explanation of the underlying scientific principle.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ASSESSMENT SETUP VIEW                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Candidate Name: [ Leonardo da Vinci                            ] │  │
│  │ (Optional: leave blank for anonymous "Guest Scholar" evaluation) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│   Select Track (Full 80 / Partial 22 / STEM 60 / Humanities 20)        │
│   Select Timing Mode (Instant Explanations vs Exam Mode)               │
│   [ Begin Assessment Button ]                                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       ACTIVE QUESTION STAGE                            │
│  - Active question timer increments active problem timeSpentSec        │
│  - Candidate answers, flags, navigates problems                        │
│  - Session persists to localStorage with per-question timestamps       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Finish Test)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       POLYMATH DIAGNOSTIC REPORT                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Candidate: Leonardo da Vinci · Renaissance Quotient: 92/100     │  │
│  │ Archetype: Homo Universalis · STEM: 95% · Humanities: 88%       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [ Export Official Certificate & Full Test Audit (PDF) ]          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [20-Axis Radar Chart]   [D3 Performance & Time Deliberation Heatmap]  │
│  - Multi-axis geometry   - D3 color scales (Emerald -> Cyan -> Amber)  │
│                          - Global avg vs discipline time contrast      │
│                          - Outlier badges: [▲ High Deliberation +68%]  │
│                          - Interactive tooltip with question breakdown │
│                                                                        │
│  [Domain Mastery Grid]   [Comprehensive 80-Question Answer Audit]      │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Layout
- **Design Constitution Compliance**: Deep slate background (`#020617` / `#0f172a`), clinical cyan (`#06b6d4`), amber deliberation warnings (`#f59e0b`), and clean emerald accuracy (`#10b981`).
- **Zero-Pill Discipline**: Metadata formatted as clean, unboxed typography separated by `·` dots.
- **D3 Heatmap Aesthetics**: Crisp cell matrices with 1px hairline borders (`border-slate-800`), smooth color ramps generated via `d3-interpolate` and `d3-scale`, and interactive hovering HUD cards.
- **Executive Certificate Design**: Classical academic border engraving, Latin typography (`Cinzel` & `Plus Jakarta Sans`), seal emblem, verified confidence metric, and structured audit tables.

---

## 3. Key Product Decisions & Trade-Offs

### 1. Client-Side PDF Compilation vs Server Rendering
- **Chosen Approach**: Client-side vector generation using `jspdf` supplemented by `html2canvas` for embedded SVG radar snapshots.
- **Why**: Zero backend cold starts, instantaneous client generation, zero data leakage, and works offline and on GitHub Pages static hosting.
- **Alternatives Considered**: Headless Chromium / Puppeteer backend. Rejected due to heavy server dependencies, deployment incompatibility with GitHub Pages static hosting, and slower generation speeds.

### 2. D3 Heatmap Architecture
- **Chosen Approach**: React-wrapped D3 visualizer utilizing D3 scales (`scaleSequential`, `scaleLinear`, `interpolateLab`) with accessible SVG/HTML hybrid rendering.
- **Why**: Combines D3's mathematical color scaling and quantile distributions with React's reliable DOM lifecycle, responsive resizing, and keyboard navigation.
- **Alternatives Considered**: Static CSS table without D3. Rejected because D3 dynamic scales provide true statistical outlier highlighting and quantile pacing analysis.

### 3. Active Question Time Tracking
- **Chosen Approach**: Track cumulative active seconds on each question by incrementing the active question's `timeSpentSec` while the question card is mounted and in view.
- **Why**: Captures true deliberation time per question and discipline rather than merely total session time, enabling meaningful heatmap diagnostics.

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App.tsx                                  │
│  - candidateName state & localStorage sync                             │
│  - sessionSeconds & active question activeTimeSec per-second ticker    │
│  - scope, feedbackTiming, userAnswers, polymathEvaluation              │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌───────────────────────────────┐
       │  AssessmentSetup.tsx   │       │    PolymathReportView.tsx     │
       │  - Candidate Name Input│       │  - Candidate Name Banner      │
       │  - Guest Scholar Fallbk│       │  - Export Certificate PDF CTA │
       │  - Track & Mode Select │       │  - PolymathRadarChart (SVG)   │
       └────────────────────────┘       │  - PerformanceHeatmap (D3)    │
                                        │  - DomainMasteryGrid          │
                                        │  - CertificateExportModal     │
                                        └───────────────┬───────────────┘
                                                        │
                                                        ▼
                                        ┌───────────────────────────────┐
                                        │     pdfCertificateExport.ts   │
                                        │  - jsPDF Executive Diploma    │
                                        │  - Polymath Confidence Score  │
                                        │  - Multi-page Audit Tables    │
                                        │  - Question / Chosen / Answer │
                                        │  - Rationale & Principle      │
                                        └───────────────────────────────┘
```

### Component & File Strategy

1. **`src/types/polymath.ts`**:
   - Add `candidateName?: string` to `UserAnswerRecord` or session state.
   - Add `DisciplinePacing` structure: `disciplineId`, `timeSpentSec`, `avgSecondsPerQ`, `deviationFromMean`, `isOutlier`.
2. **`src/components/AssessmentSetup.tsx`**:
   - Add candidate name input field with clear labeling and "Guest Scholar" fallback placeholder.
3. **`src/components/PerformanceHeatmap.tsx` (New D3 Component)**:
   - D3-based performance matrix rendering time per academic discipline.
   - Color interpolation based on pacing delta from overall mean.
   - Outlier highlight cards for disciplines with $+35\%$ above average deliberation.
   - Interactive hover cards detailing problem-by-problem time breakdown.
4. **`src/utils/pdfCertificateExport.ts` (New Module)**:
   - Multi-page PDF generator utilizing `jspdf`.
   - **Page 1 (Diploma Certificate)**: Formal certificate border, candidate name, Polymath Quotient confidence score, archetype title, date, and verified credential seal.
   - **Page 2+ (Comprehensive Question Audit)**: Discipline, difficulty, question text, selected option, correct answer, correctness indicator, and full explanation.
5. **`src/components/PolymathReportView.tsx`**:
   - Integrate the D3 `PerformanceHeatmap` right alongside the 20-axis Radar Visualizer.
   - Add "Download Official Certificate & Audit (PDF)" button triggering the PDF exporter with loading states.
6. **`package.json`**:
   - Install `d3`, `@types/d3`, `jspdf`, and `@types/jspdf`.

---

## 5. Verification & Testing Strategy

- **Build & Types**: Run `compile_applet` and `lint_applet` to ensure zero compilation or TypeScript errors.
- **Pacing Accuracy**: Verify active question timer correctly records seconds per problem.
- **D3 Matrix Visuals**: Verify D3 colors scale accurately from rapid (< avg) to elevated (> avg) and flag outliers (> 135% avg).
- **PDF Generation**: Verify generated PDF contains candidate name, confidence score, archetype, and complete question breakdown with correct options and rationales across page breaks.
- **Storage Resilience**: Test session reload with candidate name and per-question durations preserved.
