'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Mail, Loader2 } from 'lucide-react';
import ScoreHeader from '@/components/scorecard/ScoreHeader';
import RubricBreakdown from '@/components/scorecard/RubricBreakdown';
import SentimentBreakdown from '@/components/scorecard/SentimentBreakdown';
import InsightsPanel from '@/components/scorecard/InsightsPanel';
import { CallRecord, CallInsights } from '@/lib/types';
import { GradeBreakdown } from '@/lib/types';

interface ScoresData {
  rubric: any;
  sentiment: any;
  overall: number;
  grades: GradeBreakdown;
}

export default function ScorecardPage() {
  const params = useParams();
  const callId = params.callId as string;

  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [callData, setCallData] = useState<CallRecord | null>(null);
  const [scores, setScores] = useState<ScoresData | null>(null);
  const [insights, setInsights] = useState<CallInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScorecardData();
  }, [callId]);

  const loadScorecardData = async () => {
    try {
      // Get call data
      const callResponse = await fetch(`/api/call/${callId}`);
      const callResult = await callResponse.json();

      if (!callResult.success) {
        throw new Error(callResult.error || 'Failed to load call data');
      }

      setCallData(callResult.call);

      // Check if already scored
      if (callResult.call.rubricScores && callResult.call.sentimentScores) {
        // Get existing scores
        const scoreResponse = await fetch(`/api/score/${callId}`);
        const scoreResult = await scoreResponse.json();

        if (scoreResult.success) {
          setScores(scoreResult.scores);
          setInsights(scoreResult.insights);
        }
      } else {
        // Need to score the call
        setScoring(true);
        const scoreResponse = await fetch(`/api/score/${callId}`, {
          method: 'POST',
        });
        const scoreResult = await scoreResponse.json();

        if (scoreResult.success) {
          setScores(scoreResult.scores);
          setInsights(scoreResult.insights);
        } else {
          throw new Error(scoreResult.error || 'Failed to score call');
        }
        setScoring(false);
      }
    } catch (err: any) {
      console.error('Error loading scorecard:', err);
      setError(err.message || 'Failed to load scorecard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/export/pdf/${callId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scorecard-${callId}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleEmailReport = async () => {
    const email = prompt('Enter your email address:');
    if (!email) return;

    try {
      const response = await fetch(`/api/export/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, email }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Report sent successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      alert('Failed to send email: ' + error.message);
    }
  };

  if (loading || scoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {scoring ? 'Analyzing call and generating scorecard...' : 'Loading scorecard...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="btn-primary inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!callData || !scores || !insights) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={handleEmailReport}
                className="btn-secondary flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email Report
              </button>
              <button
                onClick={handleDownloadPDF}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Score Header */}
          <ScoreHeader
            overallScore={scores.overall}
            rubricScore={scores.rubric.total}
            sentimentScore={scores.sentiment.total}
            grades={scores.grades}
            practiceName={callData.practiceInfo.practiceName}
          />

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Detailed Scores */}
            <div className="lg:col-span-2 space-y-8">
              <RubricBreakdown scores={scores.rubric} />
              <SentimentBreakdown scores={scores.sentiment} />
            </div>

            {/* Right Column - Insights */}
            <div className="lg:col-span-1">
              <InsightsPanel insights={insights} />
            </div>
          </div>

          {/* Call Recording */}
          {callData.audioUrl && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Call Recording
              </h3>
              <audio controls className="w-full">
                <source src={callData.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* CTA */}
          <div className="card bg-primary-50 border-primary-200 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Improve Your Phone Conversion?
            </h3>
            <p className="text-gray-600 mb-6">
              Run another test to track your progress over time
            </p>
            <Link href="/" className="btn-primary inline-block">
              Run Another Test
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
