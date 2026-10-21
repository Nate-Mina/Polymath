import { PolymathEvaluation } from '../types/polymath';

export function generateShareableResultsSnippet(
  evaluation: PolymathEvaluation,
  format: 'detailed' | 'compact' = 'detailed'
): string {
  const testedDomains = Object.values(evaluation.domainScores);
  const techDomains = testedDomains.filter((d) => d.discipline.type === 'technical');
  const humDomains = testedDomains.filter((d) => d.discipline.type === 'non-technical');

  if (format === 'compact') {
    return `🎯 Polymath Multidisciplinary Aptitude Assessment
• Renaissance Quotient: ${evaluation.polymathQuotient}/100
• Archetype: ${evaluation.archetype.title} (${evaluation.archetype.badge})
• Overall Accuracy: ${evaluation.accuracyPercentage}% (${evaluation.correctCount}/${evaluation.totalQuestions} solved)
• STEM Accuracy: ${evaluation.technicalScore.percentage}% | Humanities: ${evaluation.humanitiesScore.percentage}%
• Cognitive Balance: ${evaluation.balanceIndex}/100
• Top Pillars: ${evaluation.topStrengths.join(', ')}
• Growth Horizons: ${evaluation.growthAreas.join(', ')}
Test your polymathic depth & multidisciplinary breadth!`;
  }

  const techLines = techDomains
    .map(
      (d) =>
        `  ▪ ${d.discipline.shortName.padEnd(16)}: ${d.percentage.toString().padStart(3)}% (${d.correct}/${d.total} solved)`
    )
    .join('\n');

  const humLines = humDomains
    .map(
      (d) =>
        `  ▪ ${d.discipline.shortName.padEnd(16)}: ${d.percentage.toString().padStart(3)}% (${d.correct}/${d.total} solved)`
    )
    .join('\n');

  return `═══════════════════════════════════════════════════
🏛️  POLYMATH MULTIDISCIPLINARY APTITUDE REPORT
═══════════════════════════════════════════════════

✦ Renaissance Quotient : ${evaluation.polymathQuotient} / 100
✦ Archetype Class      : ${evaluation.archetype.title}
✦ Rank Tier            : ${evaluation.archetype.badge}
✦ Total Accuracy       : ${evaluation.accuracyPercentage}% (${evaluation.correctCount}/${evaluation.totalQuestions} solved)
✦ STEM Score           : ${evaluation.technicalScore.percentage}% (${evaluation.technicalScore.correct}/${evaluation.technicalScore.total})
✦ Humanities Score     : ${evaluation.humanitiesScore.percentage}% (${evaluation.humanitiesScore.correct}/${evaluation.humanitiesScore.total})
✦ Cognitive Balance    : ${evaluation.balanceIndex} / 100 (Symmetry Index)

────────────── 20-AXIS RADAR EVALUATION ──────────────
[ Technical Disciplines (${techDomains.length}) ]
${techLines}

[ Humanities & Social Sciences (${humDomains.length}) ]
${humLines}

────────────── COGNITIVE PROFILE ──────────────
✦ Intellectual Pillars : ${evaluation.topStrengths.join(' · ')}
✦ Growth Horizons      : ${evaluation.growthAreas.join(' · ')}
═══════════════════════════════════════════════════`;
}

/**
 * Copies text to clipboard with fallback for hermetic iframes and permissions boundaries
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed, falling back to textarea execCommand', err);
    }
  }

  // Fallback for sandboxed iframes without clipboard permissions
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback execCommand copy failed', err);
    return false;
  }
}
