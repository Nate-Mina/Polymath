# Polymath Multidisciplinary Aptitude Assessment

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?logo=github&logoColor=white)](#deploying-to-github-pages)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

A rigorous psychometric and technical diagnostic testing engine designed to measure intellectual breadth, analytical depth, and polymathic cross-domain transfer across **20 academic degree fields** (15 technical + 5 non-technical disciplines).

---

## Key Features

- **20 Academic Curricula Covered**:
  - **15 Technical Fields**: Medicine & Clinical Diagnostics, Pure & Applied Mathematics, Physics & Mechanics, Electrical Engineering, Computer Science & Systems, Mechanical Engineering, Chemical Engineering, Civil & Structural Engineering, Aerospace Engineering, Biomedical Engineering, Cognitive Neuroscience & Psychology, Data Science & Machine Learning, Materials Science & Metallurgy, Genetics & Molecular Biology, and Robotics & Control Systems.
  - **5 Non-Technical Fields**: Epistemology & Formal Logic, World History & Historiography, Linguistics & Literary Theory, Music Theory & Psychoacoustics, and Economics & Game Theory.
- **Strict Difficulty Calibration (80 Problems Total)**:
  - Exactly **two Easy problems** (foundational theorems and definitions), **one Medium problem** (applied quantitative calculation or multi-step analysis), and **one Hard problem** (advanced theoretical edge cases and multivariable synthesis) per degree field.
- **Assessment Tracks**:
  - **Full Polymath Exam (80 Problems)**: The comprehensive evaluation testing all 20 degree disciplines.
  - **Partial Polymath Choice Sprint (22 Problems)**: A focused diagnostic featuring **8 technical fields** and **3 humanities fields**, with exactly **1 Easy** and **1 Medium** problem per discipline. Includes an interactive picker to customize which disciplines to test.
  - **STEM & Technical Suite (60 Problems)**: Concentrated assessment covering all 15 scientific and engineering degrees.
  - **Humanities & Social Sciences Suite (20 Problems)**: Concentrated assessment covering philosophy, history, linguistics, music acoustics, and economics.
  - **Single Field Sprint (4 Problems)**: 4-tier deep dive into any chosen discipline.
- **Dual Feedback Modes**:
  - **Instant Check Mode (Study Mode)**: Displays step-by-step scientific derivations, reference equations, and core epistemic principles immediately after answering.
  - **Exam Mode (Formal Test)**: Answers remain private until completion, producing a clean final diagnostic report.
- **Advanced Diagnostics & Telemetry**:
  - **Interactive 20-Axis SVG Radar Chart**: High-precision vector spider chart displaying the complete cognitive footprint across all disciplines with interactive vertex HUD probes.
  - **Renaissance Quotient (0–100) & Archetype Classifier**: Evaluates breadth of competence, technical-to-humanities balance, and depth of hard problem mastery (*Homo Universalis*, *Renaissance Scholar*, *Broad Generalist*, *STEM Polymath*, etc.).
  - **Domain Mastery Cards**: Granular cards with accuracy percentages, difficulty tier indicators, and direct question navigation.
  - **Comprehensive Answer Audit**: Filterable review of all problems with full scientific rationales and core principles.
  - **One-Click Share Results**: Generates formatted ASCII summaries and social cards of radar scores directly to the clipboard.
  - **Local Persistence & Hotkeys**: Seamless session saving in `localStorage` and keyboard shortcuts (`A`–`D`, `1`–`4`, `←`/`→`, `M` for question map).

---

## Architecture & System Design Blueprint (Implementation Artifact)

Below is the architectural specification and design blueprint used to construct the evaluation engine.

### 1. System Architecture & Component Topology

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
│                 │  - Renaissance Quotient (0-100)   │                  │
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

### 2. Renaissance Quotient & Archetype Mathematics

A genuine polymath is not merely someone who knows trivia in one field; they possess both **multidisciplinary breadth** and **analytical depth**. The Renaissance Quotient ($RQ \in [0, 100]$) is computed through four weighted dimensions:

$$RQ = 0.35 \cdot A_{\text{raw}} + 0.25 \cdot B_{\text{fields}} + 0.25 \cdot D_{\text{depth}} + 0.15 \cdot C_{\text{balance}}$$

- **Raw Accuracy ($A_{\text{raw}}$)**: The proportion of correct answers across all questions ($35\%$).
- **Breadth of Competence ($B_{\text{fields}}$)**: The percentage of tested disciplines where the user achieves $\ge 50\%$ mastery ($25\%$).
- **Depth of Analytical Rigor ($D_{\text{depth}}$)**: Performance specifically on Medium ($2\times$) and Hard ($3\times$) questions ($25\%$).
- **Cross-Disciplinary Harmony ($C_{\text{balance}}$)**: The symmetry ratio between STEM and Humanities performance ($\min(T, H) / \max(T, H)$), penalizing hyper-specialization in favor of trans-disciplinary breadth ($15\%$).

#### Archetype Tier Classifications:
1. **Tier I · Homo Universalis (Universal Polymath)** ($RQ \ge 88$, $\ge 16$ competent fields): Rare cross-domain synthesis combining advanced STEM mastery with deep humanistic insight (comparable to Leonardo da Vinci, Gottfried Wilhelm Leibniz, and Henri Poincaré).
2. **Tier II · Renaissance Scholar** ($RQ \ge 72$, $\ge 12$ competent fields): High-caliber multidisciplinary versatility across divergent scientific and qualitative domains.
3. **Tier III · Broad Generalist Synthesizer** ($RQ \ge 56$, $\ge 8$ competent fields): Well-rounded foundational fluency and intellectual curiosity across varied degree disciplines.
4. **Domain Specialist** (Skewed STEM $>70\%$ or Humanities $>70\%$): Concentrated mastery in one hemisphere with growth opportunity in the other.

### 3. Core Data Schema

```typescript
export type DomainType = 'technical' | 'non-technical';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  fieldId: string;
  fieldName: string;
  domainType: DomainType;
  difficulty: Difficulty;
  points: number; // Easy: 1, Medium: 2, Hard: 3
  question: string;
  formulaOrSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  corePrinciple: string;
  subtopic: string;
}

export interface DisciplineMeta {
  id: string;
  name: string;
  shortName: string;
  type: DomainType;
  category: string;
  description: string;
  iconName: string;
  color: string;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOption: number | null;
  isFlagged: boolean;
  timeSpentSec: number;
  submittedAt?: number;
}
```

### 4. Key Engineering Decisions & Rationale

- **Deterministic Curated Bank vs. Real-Time LLM Invocations**:
  - *Decision*: Embed the complete 80-problem bank directly in modular TypeScript files with verified solutions and scientific citations.
  - *Rationale*: Eliminates API latency during timed exams, guarantees zero hallucinated scientific keys or incorrect physics formulas, and ensures reproducible psychometric scoring.
- **Zero-Dependency Vector SVG Radar Engine**:
  - *Decision*: Implemented custom trigonometric SVG calculations with 20 radial axes, concentric score polygons, and hover probes.
  - *Rationale*: Zero heavy external chart library bundle overhead, zero React 19 compatibility conflicts, and complete styling harmony with Tailwind CSS tokens.
- **Relative Asset Paths (`base: './'`)**:
  - *Decision*: Configured Vite with relative base resolution.
  - *Rationale*: Enables seamless one-click hosting on GitHub Pages (which commonly mounts applications under a subpath like `/repo-name/`) without broken asset URLs.

---

## Academic Curricula & Problem Distribution

| # | Degree Discipline | Category | Easy (1 pt) | Medium (2 pts) | Hard (3 pts) |
|---|-------------------|----------|-------------|----------------|--------------|
| 1 | **Medicine & Clinical Science** | Biomedical | Anatomy & Circulation · Islet Endocrinology | Hemodynamics & Cardiac Output | ABG Acid-Base & Winter's Formula |
| 2 | **Pure & Applied Mathematics** | Formal Science | Product Rule Calculus · 2x2 Matrix Determinants | Triangular Spectral Eigenvalues | Green's Theorem & Conservative Fields |
| 3 | **Physics & Quantum Mechanics** | Physical Science | Kinetic Energy · Faraday's Induction Law | Carnot Engine Efficiency | 1D Infinite Well Nodal Wavefunctions |
| 4 | **Electrical Engineering** | Applied Engineering | Parallel Resistance · NAND Gate Logic | Series RLC Angular Resonance | Laplace Pole Stability & Damping |
| 5 | **Computer Science & Systems** | Computational | Balanced BST Complexity · Program Counter Cycle | 0/1 Knapsack Dynamic Programming | PACELC Distributed Systems Theorem |
| 6 | **Mechanical Engineering** | Applied Engineering | Hooke's Law Elasticity · Reynolds Number | Rankine Steam Cycle Efficiency | Blasius Boundary Layer Scaling |
| 7 | **Chemical Engineering** | Chemical Science | Le Chatelier Equilibrium · Arrhenius Kinetics | CSTR Design & Conversion Sizing | Positive Azeotrope Non-Ideal Vapor |
| 8 | **Civil & Structural Engineering**| Applied Engineering | Center-Point Beam Moment · Terzaghi Effective Stress | Euler Column Buckling Constraints | Tuned Mass Damper Frequency Splitting |
| 9 | **Aerospace Engineering** | Applied Engineering | Lift Vector Direction · Rocket Specific Impulse | Hohmann Transfer Semi-Major Axis | Normal Shock Wave Rankine-Hugoniot |
| 10 | **Biomedical Engineering** | Biomedical | Titanium Passivation · Pulse Oximetry Wavelengths | Standard Linear Solid Viscoelasticity | Counter-Current Dialyzer Clearance |
| 11 | **Cognitive Neuroscience** | Cognitive Science | Action Potential Depolarization · Patient H.M. Memory | NMDA Receptor Magnesium Block | Signal Detection Theory (d' & c) |
| 12 | **Data Science & ML** | Computational | Overfitting & Variance · Bayes' Theorem | L1 Norm Sparsity Geometry | Covariance SVD & PCA Duality |
| 13 | **Materials Science** | Physical Science | Bragg's Law Diffraction · FCC Packing Factor | Eutectic Invariant Reaction | Griffith Brittle Crack Mechanics |
| 14 | **Genetics & Molecular Biology** | Biological Science | Central Dogma Flow · PCR Thermal Cycles | Hardy-Weinberg Carrier Frequency | CRISPR SpCas9 PAM Sequence Motif |
| 15 | **Robotics & Control Systems** | Applied Engineering | PID Integral DC Offset · FK vs IK Mapping | Jacobian Kinematic Singularities | Kalman Filter Gain MMSE Optimality |
| 16 | **Epistemology & Formal Logic** | Humanities | Denying the Antecedent Fallacy · Tripartite JTB | Kantian Categorical Imperative | Modal System S5 Equivalence Frames |
| 17 | **World History & Historiography**| Humanities | Peace of Westphalia · Spinning Jenny | Late Bronze Age Systems Collapse | Braudel's Annales "Longue Durée" |
| 18 | **Linguistics & Literary Theory**| Humanities | Iambic Pentameter · Saussurean Semiotics | Grimm's Law PIE Consonant Shift | Wh-Island Subjacency Constraint |
| 19 | **Music Theory & Psychoacoustics**| Arts & Acoustics | Harmonic Series Overtones · Mixolydian Mode | Tritone Guide-Tone Substitution | Syntonic Comma & Meantone Tuning |
| 20 | **Economics & Game Theory** | Social Science | Inelastic Demand Pricing · Prisoner's Dilemma | IS-LM Monetary Expansion | Akerlof Lemon Market Unraveling |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- `npm` (or `pnpm` / `yarn`)

### Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nate-Mina/Polymath.git
   cd Polymath
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready bundle will be compiled into the `dist/` directory.

---

## Deploying to GitHub Pages

This project is pre-configured with relative asset paths (`base: './'` in `vite.config.ts`), ensuring it deploys seamlessly to GitHub Pages without asset path errors.

### Method 1: Automatic Deployment with GitHub Actions (Recommended)

1. Push your repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The included workflow in `.github/workflows/deploy.yml` automatically installs dependencies using `npm ci` (leveraging the root `package-lock.json` and Node cache) and builds the site with `npm run build` on every push to the `main` branch.
5. GitHub Pages will serve the static bundle directly from the uploaded artifact with zero server overhead.

### Method 2: Manual Deployment via `gh-pages`

1. Install the `gh-pages` package:
   ```bash
   npm install -D gh-pages
   ```

2. Add deployment scripts to your `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Run the deployment command:
   ```bash
   npm run deploy
   ```

4. Go to **Settings** > **Pages** in your repository and set the branch to `gh-pages` / `root`.

---

## Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) (with relative base support)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: Custom Zero-Dependency Mathematical Vector SVG Radar Engine
- **State & Storage**: React Hooks with automatic `localStorage` synchronization

---

## License

This project is licensed under the Apache License 2.0. See [LICENSE](LICENSE) for details.
