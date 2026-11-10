import { jsPDF } from 'jspdf';
import { PolymathEvaluation, Question, UserAnswerRecord } from '../types/polymath';

export function exportPolymathCertificateAndAuditPdf(
  evaluation: PolymathEvaluation,
  questions: Question[],
  userAnswers: Record<string, UserAnswerRecord>,
  candidateName?: string
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const effectiveName = (candidateName && candidateName.trim()) || evaluation.candidateName || 'Guest Scholar';
  const issuedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const verificationId = `POLYMATH-${Math.abs(Date.now() % 10000000).toString(16).toUpperCase()}-${evaluation.polymathQuotient}`;

  // =========================================================================
  // PAGE 1: FORMAL EXECUTIVE DIPLOMA & CERTIFICATE OF POLYMATHY
  // =========================================================================

  // Background subtle tint
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Ornate double border
  doc.setDrawColor(30, 41, 59); // slate-800
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, contentWidth, pageHeight - margin * 2);

  doc.setDrawColor(8, 145, 178); // cyan-600
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, contentWidth - 5, pageHeight - margin * 2 - 5);

  // Corner decorative marks
  const corners = [
    [margin + 5, margin + 5],
    [pageWidth - margin - 5, margin + 5],
    [margin + 5, pageHeight - margin - 5],
    [pageWidth - margin - 5, pageHeight - margin - 5],
  ];
  doc.setDrawColor(180, 83, 9); // amber-700
  doc.setLineWidth(0.8);
  corners.forEach(([cx, cy]) => {
    doc.line(cx - 3, cy, cx + 3, cy);
    doc.line(cx, cy - 3, cx, cy + 3);
  });

  let y = 30;

  // Header Institution / Emblem
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('ACADEMIA POLYMATHICA UNIVERSALIS', pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('CERTIFICATE OF POLYMATHIC APTITUDE', pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('CALIBRATED MULTIDISCIPLINARY COGNITIVE EVALUATION', pageWidth / 2, y, { align: 'center' });

  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin + 20, y, pageWidth - margin - 20, y);

  y += 11;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('This credential officially certifies that', pageWidth / 2, y, { align: 'center' });

  y += 10;
  // Candidate Name Inscription
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text(effectiveName, pageWidth / 2, y, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(effectiveName);
  doc.setDrawColor(14, 116, 144);
  doc.setLineWidth(0.5);
  doc.line((pageWidth - nameWidth) / 2 - 4, y + 2, (pageWidth + nameWidth) / 2 + 4, y + 2);

  y += 9;
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const declarationText = `has completed the comprehensive aptitude evaluation testing analytical breadth and cognitive depth across ${evaluation.totalQuestions} tiered examination problems spanning medicine, natural sciences, engineering, and qualitative humanities.`;
  const splitDeclaration = doc.splitTextToSize(declarationText, contentWidth - 24);
  doc.text(splitDeclaration, pageWidth / 2, y, { align: 'center' });

  y += splitDeclaration.length * 5 + 6;

  // Primary Assessment Score Shield
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + 12, y, contentWidth - 24, 40, 3, 3, 'FD');

  // 3 Key Score Columns inside Shield
  const colW = (contentWidth - 24) / 3;
  const col1X = margin + 12 + colW * 0.5;
  const col2X = margin + 12 + colW * 1.5;
  const col3X = margin + 12 + colW * 2.5;

  // Polymath Quotient
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RENAISSANCE QUOTIENT', col1X, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(`${evaluation.polymathQuotient}/100`, col1X, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(14, 116, 144);
  doc.text('Multidisciplinary Index', col1X, y + 27, { align: 'center' });

  // Divider lines
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 12 + colW, y + 6, margin + 12 + colW, y + 34);
  doc.line(margin + 12 + colW * 2, y + 6, margin + 12 + colW * 2, y + 34);

  // Confidence Score of Polymathy
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('POLYMATH CONFIDENCE', col2X, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // emerald-600
  doc.text(`${evaluation.confidenceScore}%`, col2X, y + 20, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text(evaluation.confidenceScore >= 80 ? 'High Confidence' : evaluation.confidenceScore >= 55 ? 'Moderate Confidence' : 'Developing Broadness', col2X, y + 27, { align: 'center' });

  // Archetype
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ARCHETYPE LEVEL', col3X, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // amber-700
  const archSplit = doc.splitTextToSize(evaluation.archetype.title, colW - 6);
  doc.text(archSplit, col3X, y + 18, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(evaluation.archetype.badge, col3X, y + 27, { align: 'center' });

  y += 48;

  // Secondary Performance Metrics Grid (2 columns)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('DIAGNOSTIC MASTERY METRICS', margin + 14, y);

  y += 5;
  const metrics = [
    { label: 'Overall Exam Accuracy', val: `${evaluation.accuracyPercentage}% (${evaluation.correctCount}/${evaluation.totalQuestions} Correct)` },
    { label: 'Technical Disciplines (STEM)', val: `${evaluation.technicalScore.percentage}% (${evaluation.technicalScore.correct}/${evaluation.technicalScore.total})` },
    { label: 'Humanities & Dialectical Sciences', val: `${evaluation.humanitiesScore.percentage}% (${evaluation.humanitiesScore.correct}/${evaluation.humanitiesScore.total})` },
    { label: 'Hard Analytical Rigor Depth', val: `${evaluation.difficultyBreakdown.hard.percentage}% (${evaluation.difficultyBreakdown.hard.correct}/${evaluation.difficultyBreakdown.hard.total})` },
    { label: 'Competent Fields (>=50% Score)', val: `${Object.values(evaluation.domainScores).filter((d) => d.percentage >= 50).length} of ${Object.keys(evaluation.domainScores).length} Fields` },
    { label: 'Cross-Disciplinary Balance Index', val: `${evaluation.balanceIndex}/100 Harmony` },
  ];

  doc.setFontSize(8.5);
  metrics.forEach((m, idx) => {
    const rx = idx % 2 === 0 ? margin + 14 : pageWidth / 2 + 3;
    const ry = y + Math.floor(idx / 2) * 7.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label + ':', rx, ry);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(m.val, rx + 52, ry);
  });

  y += Math.ceil(metrics.length / 2) * 7.5 + 12;

  // Authentication & Verification Seal
  doc.setDrawColor(226, 232, 240);
  doc.line(margin + 14, y, pageWidth - margin - 14, y);

  y += 10;
  // Left: Verification & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`ISSUED: ${issuedDate.toUpperCase()}`, margin + 14, y);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`CREDENTIAL ID: ${verificationId}`, margin + 14, y + 5);

  // Center Seal Emblem
  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(14, 116, 144);
  doc.text('[ VERIFIED COGNITIVE AUDIT ]', pageWidth / 2, y + 2, { align: 'center' });

  // Right Signatory & Author
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Test written by Nathaniel Mina', pageWidth - margin - 14, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(14, 116, 144);
  doc.text('https://nate-mina.github.io/Portfolio-CV/', pageWidth - margin - 14, y + 5, { align: 'right' });

  // Bottom Notice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Polymath Multidisciplinary Aptitude Assessment · Test written by Nathaniel Mina (https://nate-mina.github.io/Portfolio-CV/)', pageWidth / 2, pageHeight - margin - 2, { align: 'center' });

  // =========================================================================
  // PAGE 2+: COMPREHENSIVE QUESTION AUDIT & DIAGNOSTIC TRANSCRIPT
  // =========================================================================

  let auditPageNum = 2;

  const startNewAuditPage = () => {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Running Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('POLYMATH MULTIDISCIPLINARY APTITUDE ASSESSMENT — FULL TEST AUDIT', margin, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Candidate: ${effectiveName} · Page ${auditPageNum}`, pageWidth - margin, 12, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 15, pageWidth - margin, 15);

    auditPageNum++;
    return 22; // starting y for content
  };

  y = startNewAuditPage();

  questions.forEach((q, idx) => {
    const ans = userAnswers[q.id];
    const selectedIdx = ans?.selectedOption;
    const isAnswered = selectedIdx !== null && selectedIdx !== undefined;
    const isCorrect = isAnswered && selectedIdx === q.correctIndex;
    const timeSpent = Math.max(1, ans?.timeSpentSec || 0);

    const optionLabels = ['A', 'B', 'C', 'D'];
    const selectedLabel = isAnswered ? `${optionLabels[selectedIdx]}: ${q.options[selectedIdx]}` : 'No Answer Submitted';
    const correctLabel = `${optionLabels[q.correctIndex]}: ${q.options[q.correctIndex]}`;

    // Calculate block height needed
    const qPromptLines = doc.splitTextToSize(q.question, contentWidth - 12);
    const explanationLines = doc.splitTextToSize(q.explanation, contentWidth - 12);
    const principleLines = doc.splitTextToSize(`Core Epistemic Principle: ${q.corePrinciple}`, contentWidth - 12);

    const blockHeight =
      12 + // header line
      qPromptLines.length * 4 + // prompt
      (q.formulaOrSnippet ? 8 : 0) + // formula
      12 + // candidate answer + correct answer
      explanationLines.length * 3.8 + // explanation
      principleLines.length * 3.8 + // principle
      8; // margin

    // Check if new page needed
    if (y + blockHeight > pageHeight - 16) {
      y = startNewAuditPage();
    }

    // Card boundary
    doc.setFillColor(isCorrect ? 248 : 254, isCorrect ? 250 : 242, isCorrect ? 252 : 242);
    doc.setDrawColor(isCorrect ? 203 : 254, isCorrect ? 213 : 202, isCorrect ? 225 : 202);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, blockHeight - 3, 2, 2, 'FD');

    // Header row of question card
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Problem #${idx + 1}: ${q.fieldName}`, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Subtopic: ${q.subtopic} · ${q.difficulty.toUpperCase()} (${q.points} pt) · ${timeSpent}s spent`, margin + 4, y + 9);

    // Status Pill on top right
    if (isCorrect) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(`[✓ CORRECT (+${q.points})]`, pageWidth - margin - 4, y + 6, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text(`[✗ INCORRECT (0/${q.points})]`, pageWidth - margin - 4, y + 6, { align: 'right' });
    }

    let innerY = y + 14;

    // Prompt Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(qPromptLines, margin + 4, innerY);
    innerY += qPromptLines.length * 4;

    // Formula / snippet
    if (q.formulaOrSnippet) {
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`Reference: ${q.formulaOrSnippet}`, margin + 4, innerY);
      innerY += 6;
    }

    // Candidate choice
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    if (isCorrect) {
      doc.setTextColor(5, 150, 105);
    } else {
      doc.setTextColor(225, 29, 72);
    }
    doc.text(`Your Selection: ${selectedLabel}`, margin + 4, innerY);
    innerY += 4.5;

    // Correct Answer
    if (!isCorrect) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Verified Correct Answer: ${correctLabel}`, margin + 4, innerY);
      innerY += 4.5;
    }

    // Explanation & Principle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Why & Scientific Rationale:', margin + 4, innerY);
    innerY += 3.5;
    doc.text(explanationLines, margin + 4, innerY);
    innerY += explanationLines.length * 3.8;

    doc.setFont('times', 'italic');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(principleLines, margin + 4, innerY);

    y += blockHeight;
  });

  // Save the PDF
  const sanitizedName = effectiveName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Polymath_Certificate_Audit_${sanitizedName}.pdf`);
}
