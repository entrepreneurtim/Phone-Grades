import { LetterGrade, GradeBreakdown } from '@/lib/types';

/**
 * Convert numeric score to letter grade
 */
export function scoreToGrade(score: number): LetterGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Get grade breakdown for display
 */
export function getGradeBreakdown(
  objectiveScore: number,
  sentimentScore: number
): GradeBreakdown {
  const overall = objectiveScore + sentimentScore;

  return {
    overall: scoreToGrade(overall),
    objective: scoreToGrade((objectiveScore / 70) * 100),
    sentiment: scoreToGrade((sentimentScore / 30) * 100),
  };
}

/**
 * Get grade color for UI
 */
export function getGradeColor(grade: LetterGrade): string {
  switch (grade) {
    case 'A':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'B':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'C':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'D':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'F':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

/**
 * Get encouraging message based on grade
 */
export function getGradeMessage(grade: LetterGrade): string {
  switch (grade) {
    case 'A':
      return 'Excellent! Your team is converting calls effectively.';
    case 'B':
      return 'Good work! Some areas for improvement remain.';
    case 'C':
      return 'Fair performance. Focus on the recommendations below.';
    case 'D':
      return 'Needs improvement. Review the key missed opportunities.';
    case 'F':
      return 'Significant improvement needed. Start with top recommendations.';
  }
}
