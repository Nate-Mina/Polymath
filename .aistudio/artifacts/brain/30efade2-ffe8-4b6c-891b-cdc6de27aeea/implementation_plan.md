# Polymath Aptitude & Renaissance Quotient Evaluation Engine

A calibrated diagnostic testing system to evaluate multidimensional intellectual breadth and technical depth across 20 distinct academic fields (15 technical disciplines and 5 non-technical disciplines). The engine features 80 tiered multi-choice problems (2 Easy, 1 Medium, 1 Hard per field), flexible full-exam or field-by-field tracks, toggleable instant-check practice mode, a 20-axis interactive vector radar chart, and detailed cognitive mastery diagnostics.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters were confirmed during clarification and incorporated into the design:
> - **Test Traversal Modes**: Flexible support for both a Full Comprehensive 80-Question Renaissance Exam and Domain-by-Domain modular tracks (allows testing single fields or domain clusters like Engineering, Natural Sciences, or Humanities).
> - **Feedback Timing**: Dynamic toggle between **Exam Mode** (strict test conditions with final diagnostic report) and **Instant-Check Mode** (immediate answer validation, step-by-step mathematical/conceptual derivations, and key insights).
> - **Primary Diagnostics Visualizations**: Dual presentation featuring an interactive 20-axis SVG Spider/Radar Chart with Polymath Index calculation *alongside* Domain-by-Domain Mastery Cards highlighting cognitive strengths, cross-disciplinary blind spots, and technical vs. humanities balance.

---

## 1. Overview & Core Concept

- **What It Does**: Administers a psychometrically structured aptitude evaluation measuring cognitive transfer, analytical reasoning, and empirical domain knowledge across 20 university-level disciplines. It computes a granular **Polymath Index (PI)**, categorizes the intellectual archetype (e.g., *Narrow Specialist*, *Bifocal Polymath*, *Broad Generalist*, *Universal Polymath*), and generates an exhaustive breakdown of mastery across all 80 problems.
- **Academic Disciplines Covered (20 Fields Total)**:
  - **15 Technical Fields**:
    1. Medicine & Clinical Diagnostics
    2. Pure & Applied Mathematics
    3. Physics & Mechanics
    4. Electrical Engineering & Circuits
    5. Computer Science & Algorithms
    6. Mechanical & Materials Engineering
    7. Chemical Engineering & Reaction Kinetics
    8. Civil & Structural Engineering
    9. Aerospace & Aeronautical Engineering
    10. Biomedical Engineering & Biomechanics
    11. Cognitive Neuroscience & Psychology
    12. Data Science, Statistics & Machine Learning
    13. Materials Science & Solid-State Physics
    14. Genetics & Molecular Biology
    15. Robotics & Dynamical Control Systems
  - **5 Non-Technical Fields**:
    16. Epistemology & Formal Logic
    17. World History & Historiography
    18. Linguistics & Comparative Literature
    19. Music Theory & Psychoacoustics
    20. Micro/Macroeconomics & Game Theory
- **Tiered Question Distribution**: Exactly 4 problems per discipline (2 Easy baseline conceptual, 1 Medium applied analysis, 1 Hard advanced theoretical or multivariable problem), yielding 80 unique calibrated questions with verifiable scientific rationales.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Welcome & Assessment Configuration**:
   - Clean, focused introduction explaining the Renaissance Quotient methodology.
   - Mode selector: **Comprehensive 80-Question Exam**, **Technical Suite (60 Questions)**, **Humanities Suite (20 Questions)**, or **Focused Field Sprint (4 Questions per chosen discipline)**.
   - Mode toggle: **Exam Mode** (timed/silent) vs. **Study & Verification Mode** (instant step-by-step reveals).
2. **Interactive Testing Stage**:
   - Single-elevation, focused question stage displaying:
     - Clear discipline header with category grouping (e.g., `Engineering · Aerospace`, `Humanities · Philosophy`).
     - Problem difficulty indicator (`Easy`, `Medium`, `Hard`) with point weighting ($1\times, 2\times, 3\times$).
     - Clean typography for question prompt, formulas, and 4 distinct answer choices.
     - Option to flag question for review, skip, or jump via the persistent 80-item question map tray.
     - In Practice Mode: Immediate expandable solution drawer showing fundamental equations, step-by-step logic, and why distractor options are incorrect.
3. **Comprehensive Evaluation Report & Polymath Diagnostics**:
   - **Polymath Index Header**: Renaissance Quotient (0–100), Polymath Archetype classification, and total score with percentile rank.
   - **Interactive 20-Axis Radar Chart**: High-precision SVG polygon rendering with axis hover probes, overlaying technical vs. humanities coverage.
   - **Mastery Cards Grid**: Filterable domain cards showing accuracy, difficulty breakdown (Easy/Med/Hard success rates), and specific domain recommendations.
   - **Comprehensive Answer Audit**: Review all 80 answers with full worked solutions, formulas, and filter by Incorrect/Correct/Flagged.
   - **Export & Retest**: Retake weak areas or reset assessment; printable performance summary.

### Visual Identity & Theme
- **Aesthetic Direction**: Academic precision, clinical authority, and intellectual elegance inspired by rigorous scientific instrumentation and archival manuscripts.
- **Color Distribution (60-30-10 Rule)**:
  - **60% Primary Canvas**: Deep obsidian slate (`#0B0F19`) or pristine technical white (`#F8FAFC`).
  - **30% Structural Panels**: Monochromatic hairline bordered surfaces (`#111827` / `#FFFFFF` with `border-slate-200` or `border-slate-800`).
  - **10% Calibrated Accents**: Cobalt blue (`#2563EB`) and laser cyan (`#06B6D4`) for technical rigor; warm amber (`#D97706`) for humanities; emerald (`#059669`) and crimson (`#DC2626`) for score accuracy.
- **Typography**:
  - Display: `Plus Jakarta Sans` / `Cinzel` touch for the Renaissance header.
  - Body: `DM Sans` / `Plus Jakarta Sans` for effortless readability across technical prose.
  - Metrics & Formulae: Tabular monospace (`JetBrains Mono` / `font-mono tabular-nums`) with proper notation ($e^{i\pi}$, $\nabla \times \mathbf{B}$, $O(N \log N)$).
- **Anti-Slop Restraint**: Zero decorative glowing badges, no fake version tags ("SYNTHEX"), no pill badge sandwiches, no line-by-line emoji scatter.

---

## 3. Key Product Decisions & Trade-Offs

- **Curated High-Rigor Bank vs AI Generation on the Fly**:
  - *Chosen Approach*: Embed the complete, psychometrically balanced 80-question bank directly in the application with exact question definitions, diagrams/formulas, verified solutions, and distractor rationales, while offering optional AI Gemini explanations for on-demand deep dives.
  - *Why*: Ensures instant load times, zero latency during the test, zero hallucinated questions or incorrect physics/medical keys, and 100% deterministic score benchmarking.
- **Interactive SVG Vector Radar vs Third-Party Chart Libraries**:
  - *Chosen Approach*: Custom mathematical SVG Radar Chart component with 20 radial axes, concentric score polygons, interactive vertex hover HUD, and responsive sizing.
  - *Why*: Zero heavy bundle overhead, ultra-fast rendering, zero chart library mismatch bugs in React 19, and full styling harmony with Tailwind CSS.
- **Local Persistence with Session Resumption**:
  - *Chosen Approach*: Automatic state caching in `localStorage` so users never lose their progress if they refresh or pause during an 80-question exam.

---

## 4. Technical Architecture & System Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          POLYMATHOUS CORE APP                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────┐   ┌──────────────────────┐   ┌─────────────────┐  │
│  │ Assessment Config│──▶│ Question Bank Store  │◀──│ LocalStorage Sync│
│  │ (Exam vs Instant│   │ (80 Tiered Questions │   │ (Resume State)  │  │
│  │  Full vs Sprint)│   │  across 20 Domains)  │   └─────────────────┘  │
│  └─────────────────┘   └──────────┬───────────┘                        │
│                                   │                                    │
│                                   ▼                                    │
│                 ┌───────────────────────────────────┐                  │
│                 │      Test Engine & Question UI    │                  │
│                 │  - Question Stage & Formula Box   │                  │
│                 │  - 4 Tiered Choices & Hotkeys     │                  │
│                 │  - Persistent 80-Item Grid Drawer │                  │
│                 │  - Instant Solution Modal/Drawer  │                  │
│                 └─────────────────┬─────────────────┘                  │
│                                   │ (Submission)                       │
│                                   ▼                                    │
│                 ┌───────────────────────────────────┐                  │
│                 │    Polymath Diagnostic Engine     │                  │
│                 │  - Polymath Index & Archetype     │                  │
│                 │  - Technical vs Non-Tech Ratio    │                  │
│                 │  - Depth vs Breadth Coefficient   │                  │
│                 └─────────────────┬─────────────────┘                  │
│                                   │                                    │
│        ┌──────────────────────────┴──────────────────────────┐         │
│        ▼                                                     ▼         │
│ ┌──────────────────────────────┐              ┌──────────────────────┐ │
│ │  Interactive 20-Axis Radar   │              │ Domain Mastery Cards │ │
│ │  - 20 Discipline Radii       │              │ - 20 Field Summaries │ │
│ │  - Technical vs Humanities   │              │ - Strength/Weakness  │ │
│ │  - Interactive Vertex Probes │              │ - Full Answer Audit  │ │
│ └──────────────────────────────┘              └──────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State Schema
```typescript
export type DisciplineType = 'technical' | 'non-technical';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  fieldId: string;
  fieldName: string;
  domainType: DisciplineType;
  difficulty: Difficulty;
  points: number;
  question: string;
  contextOrCode?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  corePrinciple: string;
}

export interface DisciplineMeta {
  id: string;
  name: string;
  type: DisciplineType;
  category: string;
  description: string;
  iconName: string;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOptionIndex: number | null;
  isFlagged: boolean;
  timeSpentSeconds: number;
}
```

---

## 5. Execution Plan & Next Steps

1. **Step 1: Question Bank Formulation**: Build the full, rigorous 80-question database across all 20 degree fields (15 technical + 5 non-technical) with precise 2-Easy, 1-Medium, 1-Hard distributions and complete solutions.
2. **Step 2: Core State Engine**: Implement state machine handling assessment progress, timer, instant-check logic, flagging, question navigation, and persistence.
3. **Step 3: Test Runner UI**: Build the focused, accessible testing stage with keyboard navigation (1-4 or A-D, Enter, Arrow keys), formula typography, and instant explanation reveal.
4. **Step 4: 20-Axis SVG Radar Chart & Metrics**: Implement the mathematical radar polygon generator, polymath quotient score formula, and interactive tooltips.
5. **Step 5: Diagnostics & Review Audit View**: Build domain mastery cards, strengths/weaknesses analyzer, and comprehensive solution review list.
6. **Step 6: Verification**: Run `compile_applet` and perform complete end-to-end testing of both Exam and Instant-Check modes.
