import { SentimentScores } from '@/lib/types';
import { Heart, Sparkles, MessageCircle, ShieldCheck, Award } from 'lucide-react';

interface SentimentBreakdownProps {
  scores: SentimentScores;
}

export default function SentimentBreakdown({ scores }: SentimentBreakdownProps) {
  const dimensions = [
    {
      name: 'Warmth',
      icon: <Heart className="w-5 h-5" />,
      points: scores.warmth.points,
      justification: scores.warmth.justification,
      color: 'text-pink-600 bg-pink-50',
    },
    {
      name: 'Confidence',
      icon: <Sparkles className="w-5 h-5" />,
      points: scores.confidence.points,
      justification: scores.confidence.justification,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      name: 'Clarity',
      icon: <MessageCircle className="w-5 h-5" />,
      points: scores.clarity.points,
      justification: scores.clarity.justification,
      color: 'text-green-600 bg-green-50',
    },
    {
      name: 'Empathy',
      icon: <Heart className="w-5 h-5" />,
      points: scores.empathy.points,
      justification: scores.empathy.justification,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      name: 'Professional Tone',
      icon: <ShieldCheck className="w-5 h-5" />,
      points: scores.professionalTone.points,
      justification: scores.professionalTone.justification,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sentiment & Soft Skills Analysis
      </h2>

      <div className="space-y-4">
        {dimensions.map((dimension, index) => {
          const percentage = (dimension.points / 6) * 100;

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dimension.color}`}>
                    {dimension.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {dimension.name}
                  </h3>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold ${dimension.color}`}>
                  {dimension.points} / 6
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

              {/* Justification */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{dimension.justification}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold text-gray-900">
            Total Sentiment Score
          </span>
          <span className="text-3xl font-bold text-pink-600">
            {scores.total} / 30
          </span>
        </div>
      </div>
    </div>
  );
}
