import { RubricScores } from '@/lib/types';
import { CheckCircle, Circle } from 'lucide-react';

interface RubricBreakdownProps {
  scores: RubricScores;
}

export default function RubricBreakdown({ scores }: RubricBreakdownProps) {
  const categories = [
    {
      name: 'Speed to Answer',
      points: scores.speedToAnswer.points,
      maxPoints: 10,
      category: scores.speedToAnswer.category,
      evidence: scores.speedToAnswer.seconds
        ? `Answered in ${scores.speedToAnswer.seconds.toFixed(0)} seconds`
        : 'Not answered or voicemail',
    },
    {
      name: 'Greeting & Identification',
      points: scores.greetingIdentification.points,
      maxPoints: 6,
      category: scores.greetingIdentification.category,
      evidence: scores.greetingIdentification.evidence,
    },
    {
      name: 'New Patient Acceptance',
      points: scores.newPatientAcceptance.points,
      maxPoints: 6,
      category: scores.newPatientAcceptance.category,
      evidence: scores.newPatientAcceptance.evidence,
    },
    {
      name: 'Insurance Handling',
      points: scores.insuranceHandling.points,
      maxPoints: 8,
      category: scores.insuranceHandling.category,
      evidence: scores.insuranceHandling.evidence,
    },
    {
      name: 'Offer Mention',
      points: scores.offerMention.points,
      maxPoints: 10,
      category: scores.offerMention.category,
      evidence: scores.offerMention.evidence,
    },
    {
      name: 'Price Framing',
      points: scores.priceFraming.points,
      maxPoints: 6,
      category: scores.priceFraming.category,
      evidence: scores.priceFraming.evidence,
    },
    {
      name: 'Booking Attempts',
      points: scores.bookingAttempts.points,
      maxPoints: 12,
      category: `${scores.bookingAttempts.count} attempt(s)`,
      evidence: scores.bookingAttempts.attempts[0] || 'No booking attempts made',
    },
    {
      name: 'Contact Info Capture',
      points: scores.contactInfoCapture.points,
      maxPoints: 6,
      category: scores.contactInfoCapture.category,
      evidence: scores.contactInfoCapture.evidence,
    },
    {
      name: 'Objection Handling',
      points: scores.objectionHandling.points,
      maxPoints: 6,
      category: scores.objectionHandling.category,
      evidence: scores.objectionHandling.evidence,
    },
  ];

  const getScoreColor = (points: number, maxPoints: number): string => {
    const percentage = (points / maxPoints) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Objective Rubric Breakdown
      </h2>

      <div className="space-y-4">
        {categories.map((category, index) => {
          const percentage = (category.points / category.maxPoints) * 100;
          const colorClass = getScoreColor(category.points, category.maxPoints);

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">{category.category}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold ${colorClass}`}>
                  {category.points} / {category.maxPoints}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div
                  className={`h-2 rounded-full transition-all ${
                    percentage >= 80
                      ? 'bg-green-500'
                      : percentage >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Evidence */}
              {category.evidence && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Evidence:
                  </p>
                  <p className="text-sm text-gray-800 italic">
                    "{category.evidence}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">
            Total Objective Score
          </span>
          <span className="text-3xl font-bold text-primary-600">
            {scores.total} / 70
          </span>
        </div>
      </div>
    </div>
  );
}
