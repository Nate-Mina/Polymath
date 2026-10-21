import { Question, AssessmentScope } from '../../types/polymath';
import { TECHNICAL_QUESTIONS_PART_1 } from './technicalPart1';
import { TECHNICAL_QUESTIONS_PART_2 } from './technicalPart2';
import { TECHNICAL_QUESTIONS_PART_3 } from './technicalPart3';
import { NON_TECHNICAL_QUESTIONS } from './nonTechnical';

export const ALL_QUESTIONS: Question[] = [
  ...TECHNICAL_QUESTIONS_PART_1,
  ...TECHNICAL_QUESTIONS_PART_2,
  ...TECHNICAL_QUESTIONS_PART_3,
  ...NON_TECHNICAL_QUESTIONS,
];

export const QUESTION_MAP = new Map<string, Question>(
  ALL_QUESTIONS.map((q) => [q.id, q])
);

export const DEFAULT_PARTIAL_TECHNICAL_FIELDS = [
  'medicine',
  'mathematics',
  'physics',
  'electrical',
  'computer_science',
  'mechanical',
  'neuroscience',
  'data_science',
];

export const DEFAULT_PARTIAL_HUMANITIES_FIELDS = [
  'philosophy',
  'history',
  'economics',
];

export function getQuestionsForScope(
  scope: AssessmentScope,
  selectedFieldId?: string,
  customPartialFields?: { technical: string[]; humanities: string[] }
): Question[] {
  switch (scope) {
    case 'technical':
      return ALL_QUESTIONS.filter((q) => q.domainType === 'technical');
    case 'humanities':
      return ALL_QUESTIONS.filter((q) => q.domainType === 'non-technical');
    case 'single-field':
      if (selectedFieldId) {
        return ALL_QUESTIONS.filter((q) => q.fieldId === selectedFieldId);
      }
      return ALL_QUESTIONS;
    case 'partial': {
      const techIds = customPartialFields?.technical && customPartialFields.technical.length === 8
        ? customPartialFields.technical
        : DEFAULT_PARTIAL_TECHNICAL_FIELDS;
      const humIds = customPartialFields?.humanities && customPartialFields.humanities.length === 3
        ? customPartialFields.humanities
        : DEFAULT_PARTIAL_HUMANITIES_FIELDS;

      const chosenIds = [...techIds, ...humIds];
      const partialQuestions: Question[] = [];

      chosenIds.forEach((fId) => {
        // Pick exactly 1 easy problem
        const easyQ = ALL_QUESTIONS.find((q) => q.fieldId === fId && q.difficulty === 'easy');
        // Pick exactly 1 medium problem
        const medQ = ALL_QUESTIONS.find((q) => q.fieldId === fId && q.difficulty === 'medium');

        if (easyQ) partialQuestions.push(easyQ);
        if (medQ) partialQuestions.push(medQ);
      });

      return partialQuestions;
    }
    case 'full':
    default:
      return ALL_QUESTIONS;
  }
}

// Verification assertion to ensure question bank integrity
export const BANK_STATS = {
  total: ALL_QUESTIONS.length,
  technical: ALL_QUESTIONS.filter((q) => q.domainType === 'technical').length,
  nonTechnical: ALL_QUESTIONS.filter((q) => q.domainType === 'non-technical').length,
  easy: ALL_QUESTIONS.filter((q) => q.difficulty === 'easy').length,
  medium: ALL_QUESTIONS.filter((q) => q.difficulty === 'medium').length,
  hard: ALL_QUESTIONS.filter((q) => q.difficulty === 'hard').length,
};
