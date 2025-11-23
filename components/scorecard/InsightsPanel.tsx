import { CallInsights } from '@/lib/types';
import { TrendingUp, AlertTriangle, Star, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  insights: CallInsights;
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Best Moment */}
      {insights.bestMoment && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-200 rounded-lg">
              <Star className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">
                Best Moment
              </h3>
              <p className="text-sm text-green-800 mb-2">
                {insights.bestMoment.reason}
              </p>
              <div className="bg-white border border-green-200 rounded-lg p-3">
                <p className="text-sm text-gray-800 italic">
                  "{insights.bestMoment.quote}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Missed Opportunity */}
      {insights.missedOpportunity && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Biggest Missed Opportunity
              </h3>
              <p className="text-sm text-yellow-800 mb-2">
                {insights.missedOpportunity.reason}
              </p>
              {insights.missedOpportunity.quote !== 'Throughout the call' && (
                <div className="bg-white border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-800 italic">
                    "{insights.missedOpportunity.quote}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Moments */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Moments</h3>

        {/* Booking Attempts */}
        {insights.keyMoments.bookingAttempts.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Booking Attempts ({insights.keyMoments.bookingAttempts.length})
            </h4>
            <div className="space-y-2">
              {insights.keyMoments.bookingAttempts.map((quote, index) => (
                <div
                  key={index}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                >
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold text-blue-600">
                      Attempt {index + 1}:
                    </span>{' '}
                    "{quote}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Offer Explanations */}
        {insights.keyMoments.offerExplanations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Offer Explanations
            </h4>
            <div className="space-y-2">
              {insights.keyMoments.offerExplanations.map((quote, index) => (
                <div
                  key={index}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                >
                  <p className="text-sm text-gray-800 italic">"{quote}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights.keyMoments.bookingAttempts.length === 0 &&
          insights.keyMoments.offerExplanations.length === 0 && (
            <p className="text-gray-500 italic">
              No significant booking attempts or offer explanations detected.
            </p>
          )}
      </div>

      {/* Recommendations */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-200 rounded-lg">
            <Lightbulb className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-900">
              Top Recommendations
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Focus on these areas to improve your phone conversion rate
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="bg-white border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-800">{recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
