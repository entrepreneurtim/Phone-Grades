import { GradeBreakdown, LetterGrade } from '@/lib/types';
import { getGradeColor, getGradeMessage } from '@/lib/utils/grading';
import { Award, TrendingUp, Heart } from 'lucide-react';

interface ScoreHeaderProps {
  overallScore: number;
  rubricScore: number;
  sentimentScore: number;
  grades: GradeBreakdown;
  practiceName: string;
}

export default function ScoreHeader({
  overallScore,
  rubricScore,
  sentimentScore,
  grades,
  practiceName,
}: ScoreHeaderProps) {
  const overallColorClass = getGradeColor(grades.overall);

  return (
    <div className="space-y-6">
      {/* Practice Name */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{practiceName}</h1>
        <p className="text-gray-600 mt-1">Phone Conversion Scorecard</p>
      </div>

      {/* Overall Score Card */}
      <div className={`card border-2 ${overallColorClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Overall Score
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold">{overallScore}</span>
              <span className="text-2xl text-gray-500">/ 100</span>
            </div>
            <p className="text-sm mt-2">{getGradeMessage(grades.overall)}</p>
          </div>
          <div className={`text-6xl font-bold ${overallColorClass.split(' ')[0]}`}>
            {grades.overall}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Objective Score */}
        <div className={`card border ${getGradeColor(grades.objective)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">
                  Objective Scoring
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Algorithmic evaluation based on repeatable criteria
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{rubricScore}</span>
                <span className="text-lg text-gray-500">/ 70</span>
              </div>
            </div>
            <div className={`text-4xl font-bold ${getGradeColor(grades.objective).split(' ')[0]}`}>
              {grades.objective}
            </div>
          </div>
        </div>

        {/* Sentiment Score */}
        <div className={`card border ${getGradeColor(grades.sentiment)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-900">
                  Soft Skills & Tone
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                AI-powered analysis of warmth, empathy, and professionalism
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{sentimentScore}</span>
                <span className="text-lg text-gray-500">/ 30</span>
              </div>
            </div>
            <div className={`text-4xl font-bold ${getGradeColor(grades.sentiment).split(' ')[0]}`}>
              {grades.sentiment}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
