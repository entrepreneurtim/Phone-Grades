'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PracticeForm from '@/components/ui/PracticeForm';
import ConsentModal from '@/components/ui/ConsentModal';
import { PracticeInfo } from '@/lib/types';
import { Phone, TrendingUp, Clock, Award } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showConsent, setShowConsent] = useState(false);
  const [practiceInfo, setPracticeInfo] = useState<PracticeInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (info: PracticeInfo) => {
    setPracticeInfo(info);
    setShowConsent(true);
  };

  const handleConsent = async () => {
    if (!practiceInfo) return;

    setIsLoading(true);
    setShowConsent(false);

    try {
      // Create a new call session
      const response = await fetch('/api/call/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(practiceInfo),
      });

      const data = await response.json();

      if (data.success && data.callId) {
        // Redirect to the live call page
        router.push(`/call/${data.callId}`);
      } else {
        throw new Error(data.error || 'Failed to initiate call');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      alert('Failed to start the call. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Patient Conversion Scorecard
                </h1>
                <p className="text-sm text-gray-600">
                  Professional phone call analysis for dental practices
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How Well Does Your Front Desk Convert New Patients?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get an instant, objective score based on a live mystery-shopper call
            to your practice. Discover exactly where you're winning calls and where
            you're losing them.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Call Playback</h3>
            <p className="text-gray-600 text-sm">
              Listen to the mystery call in real-time as our AI caller speaks with
              your front desk
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Objective Scoring</h3>
            <p className="text-gray-600 text-sm">
              70-point algorithmic rubric based on proven conversion best practices
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Actionable Insights</h3>
            <p className="text-gray-600 text-sm">
              Get specific recommendations to improve your phone conversion rate
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Start Your Free Phone Scorecard
              </h3>
              <p className="text-gray-600">
                Fill in your practice information to begin the mystery-shopper test
              </p>
            </div>

            <PracticeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h4 className="font-semibold mb-2">Enter Details</h4>
              <p className="text-sm text-gray-600">
                Provide your practice name and phone number
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h4 className="font-semibold mb-2">Live Call</h4>
              <p className="text-sm text-gray-600">
                Our AI calls your practice while you listen live
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">
                Advanced scoring evaluates every aspect of the call
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h4 className="font-semibold mb-2">Get Results</h4>
              <p className="text-sm text-gray-600">
                Receive detailed scorecard with actionable insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsent}
        onClose={() => setShowConsent(false)}
        onConsent={handleConsent}
        practiceName={practiceInfo?.practiceName || ''}
      />
    </main>
  );
}
