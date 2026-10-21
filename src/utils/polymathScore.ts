import { Question, UserAnswerRecord, PolymathEvaluation, DisciplineMeta } from '../types/polymath';
import { DISCIPLINES, DISCIPLINE_MAP } from '../data/disciplines';

export function calculatePolymathEvaluation(
  questions: Question[],
  userAnswers: Record<string, UserAnswerRecord>
): PolymathEvaluation {
  const totalQuestions = questions.length;
  let answeredCount = 0;
  let correctCount = 0;
  let rawScore = 0;
  let maxScore = 0;

  let techCorrect = 0;
  let techTotal = 0;
  let humCorrect = 0;
  let humTotal = 0;

  const diffCounts = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  const domainScores: Record<
    string,
    {
      discipline: DisciplineMeta;
      correct: number;
      total: number;
      percentage: number;
      easyCorrect: number;
      medCorrect: number;
      hardCorrect: number;
    }
  > = {};

  // Initialize domain tracking
  questions.forEach((q) => {
    if (!domainScores[q.fieldId]) {
      const meta = DISCIPLINE_MAP.get(q.fieldId) || {
        id: q.fieldId,
        name: q.fieldName,
        shortName: q.fieldName,
        type: q.domainType,
        category: 'Field',
        description: '',
        iconName: 'Book',
        color: '#2563EB',
      };
      domainScores[q.fieldId] = {
        discipline: meta,
        correct: 0,
        total: 0,
        percentage: 0,
        easyCorrect: 0,
        medCorrect: 0,
        hardCorrect: 0,
      };
    }
  });

  questions.forEach((q) => {
    maxScore += q.points;
    const ans = userAnswers[q.id];
    const isAnswered = ans && ans.selectedOption !== null && ans.selectedOption !== undefined;
    if (isAnswered) answeredCount++;

    const isCorrect = isAnswered && ans.selectedOption === q.correctIndex;

    // Track domain totals
    domainScores[q.fieldId].total++;
    diffCounts[q.difficulty].total++;

    if (q.domainType === 'technical') {
      techTotal++;
    } else {
      humTotal++;
    }

    if (isCorrect) {
      correctCount++;
      rawScore += q.points;
      domainScores[q.fieldId].correct++;

      if (q.difficulty === 'easy') domainScores[q.fieldId].easyCorrect++;
      if (q.difficulty === 'medium') domainScores[q.fieldId].medCorrect++;
      if (q.difficulty === 'hard') domainScores[q.fieldId].hardCorrect++;

      diffCounts[q.difficulty].correct++;

      if (q.domainType === 'technical') {
        techCorrect++;
      } else {
        humCorrect++;
      }
    }
  });

  // Calculate percentages
  Object.keys(domainScores).forEach((fId) => {
    const d = domainScores[fId];
    d.percentage = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
  });

  const accuracyPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const techPercentage = techTotal > 0 ? Math.round((techCorrect / techTotal) * 100) : 0;
  const humPercentage = humTotal > 0 ? Math.round((humCorrect / humTotal) * 100) : 0;

  const easyPercentage = diffCounts.easy.total > 0 ? Math.round((diffCounts.easy.correct / diffCounts.easy.total) * 100) : 0;
  const medPercentage = diffCounts.medium.total > 0 ? Math.round((diffCounts.medium.correct / diffCounts.medium.total) * 100) : 0;
  const hardPercentage = diffCounts.hard.total > 0 ? Math.round((diffCounts.hard.correct / diffCounts.hard.total) * 100) : 0;

  // Calculate Breadth & Balance
  const domainPercentages = Object.values(domainScores).map((d) => d.percentage);
  const fieldsTestedCount = domainPercentages.length;
  const competentFieldsCount = domainPercentages.filter((p) => p >= 50).length;
  const masteryFieldsCount = domainPercentages.filter((p) => p >= 75).length;

  // Standard deviation across fields (balance index: 0 = completely uniform, 50 = highly skewed)
  const meanPct = domainPercentages.length > 0 ? domainPercentages.reduce((a, b) => a + b, 0) / domainPercentages.length : 0;
  const variance = domainPercentages.length > 0
    ? domainPercentages.reduce((acc, val) => acc + Math.pow(val - meanPct, 2), 0) / domainPercentages.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const balanceIndex = Math.max(0, Math.round(100 - stdDev * 1.5));

  // Compute Polymath Quotient (0 - 100)
  // Components:
  // 1. Raw Accuracy (35%)
  // 2. Breadth of Competence (percentage of fields with ≥50% score) (25%)
  // 3. Depth (Medium & Hard accuracy) (25%)
  // 4. STEM & Humanities Cross-Disciplinary Balance (15%)
  const breadthScore = fieldsTestedCount > 0 ? (competentFieldsCount / fieldsTestedCount) * 100 : 0;
  const depthScore = (medPercentage * 0.4 + hardPercentage * 0.6);
  
  let crossBalanceRatio = 100;
  if (techTotal > 0 && humTotal > 0) {
    const higher = Math.max(techPercentage, humPercentage);
    const lower = Math.min(techPercentage, humPercentage);
    crossBalanceRatio = higher > 0 ? Math.round((lower / higher) * 100) : 50;
  }

  const polymathQuotient = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        accuracyPercentage * 0.35 +
        breadthScore * 0.25 +
        depthScore * 0.25 +
        crossBalanceRatio * 0.15
      )
    )
  );

  // Archetype Classification
  let archetype = {
    title: 'Focused Specialist',
    description: 'Concentrated excellence in a specific academic cluster with emerging interest in adjacent fields.',
    badge: 'Tier IV · Domain Specialist',
    level: 'Specialist',
  };

  if (polymathQuotient >= 88 && competentFieldsCount >= 16) {
    archetype = {
      title: 'Homo Universalis (Universal Polymath)',
      description: 'Exceptional intellectual breadth coupled with profound analytical depth across medicine, natural sciences, engineering, and the humanities. Exhibits rare trans-disciplinary synthesis comparable to Da Vinci, Leibniz, and Poincaré.',
      badge: 'Tier I · Grand Polymath',
      level: 'Universal Polymath',
    };
  } else if (polymathQuotient >= 72 && competentFieldsCount >= 12) {
    archetype = {
      title: 'Renaissance Scholar',
      description: 'High-caliber versatility across diverse STEM disciplines and qualitative humanities. Capable of bridging technical rigor with conceptual humanistic insight.',
      badge: 'Tier II · Renaissance Scholar',
      level: 'Renaissance Scholar',
    };
  } else if (polymathQuotient >= 56 && competentFieldsCount >= 8) {
    archetype = {
      title: 'Broad Generalist Synthesizer',
      description: 'Strong foundational literacy and solid problem-solving adaptability across a wide array of degree domains.',
      badge: 'Tier III · Broad Generalist',
      level: 'Generalist',
    };
  } else if (techPercentage >= 70 && humPercentage < 40) {
    archetype = {
      title: 'STEM Poly-Engineer',
      description: 'Robust multi-disciplinary mastery across physical sciences, mathematics, and engineering, with opportunity to expand humanistic synthesis.',
      badge: 'Tier III · STEM Polymath',
      level: 'STEM Specialist',
    };
  } else if (humPercentage >= 70 && techPercentage < 40) {
    archetype = {
      title: 'Humanities & Dialectical Scholar',
      description: 'Exceptional mastery across philosophy, linguistics, history, and social sciences, with opportunity to deepen formal mathematical and physical models.',
      badge: 'Tier III · Humanities Polymath',
      level: 'Humanities Specialist',
    };
  }

  // Top Strengths & Growth Areas
  const sortedDomains = Object.entries(domainScores).sort((a, b) => b[1].percentage - a[1].percentage);
  const topStrengths = sortedDomains.slice(0, 3).map(([_, d]) => d.discipline.name);
  const growthAreas = sortedDomains.slice(-3).reverse().map(([_, d]) => d.discipline.name);

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    rawScore,
    maxScore,
    accuracyPercentage,
    polymathQuotient,
    archetype,
    technicalScore: { correct: techCorrect, total: techTotal, percentage: techPercentage },
    humanitiesScore: { correct: humCorrect, total: humTotal, percentage: humPercentage },
    difficultyBreakdown: {
      easy: { correct: diffCounts.easy.correct, total: diffCounts.easy.total, percentage: easyPercentage },
      medium: { correct: diffCounts.medium.correct, total: diffCounts.medium.total, percentage: medPercentage },
      hard: { correct: diffCounts.hard.correct, total: diffCounts.hard.total, percentage: hardPercentage },
    },
    domainScores,
    topStrengths,
    growthAreas,
    balanceIndex,
  };
}
