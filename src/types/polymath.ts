export type DomainType = 'technical' | 'non-technical';
export type Difficulty = 'easy' | 'medium' | 'hard';

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

export interface Question {
  id: string;
  fieldId: string;
  fieldName: string;
  domainType: DomainType;
  difficulty: Difficulty;
  points: number;
  question: string;
  formulaOrSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  corePrinciple: string;
  subtopic: string;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedOption: number | null;
  isFlagged: boolean;
  timeSpentSec: number;
  submittedAt?: number;
}

export type AssessmentScope = 'full' | 'technical' | 'humanities' | 'single-field' | 'partial';
export type FeedbackTiming = 'instant' | 'exam';

export interface PolymathEvaluation {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  rawScore: number;
  maxScore: number;
  accuracyPercentage: number;
  polymathQuotient: number; // 0 - 100 Renaissance Index
  archetype: {
    title: string;
    description: string;
    badge: string;
    level: string;
  };
  technicalScore: { correct: number; total: number; percentage: number };
  humanitiesScore: { correct: number; total: number; percentage: number };
  difficultyBreakdown: {
    easy: { correct: number; total: number; percentage: number };
    medium: { correct: number; total: number; percentage: number };
    hard: { correct: number; total: number; percentage: number };
  };
  domainScores: Record<
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
  >;
  topStrengths: string[];
  growthAreas: string[];
  balanceIndex: number; // Variance across fields (lower variance = higher polymathic balance)
}
