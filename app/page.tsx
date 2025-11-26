'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PracticeForm from '@/components/ui/PracticeForm';
import ConsentModal from '@/components/ui/ConsentModal';
import { PracticeInfo } from '@/lib/types';
import { Phone, TrendingUp, Clock, Award, ChevronRight, Star, Shield, Zap } from 'lucide-react';

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
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Phone<span className="text-blue-400">Grades</span>
                </h1>
                <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                  AI Diagnostic Platform
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
              <span className="hover:text-white transition-colors cursor-pointer">How it Works</span>
              <span className="hover:text-white transition-colors cursor-pointer">Methodology</span>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all border border-white/5">
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4">
            <Zap className="w-4 h-4" />
            <span>Powered by OpenAI Realtime Voice</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            How Well Does Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Front Desk Convert?
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Deploy an AI mystery shopper to audit your practice's phone performance.
            Get an instant, objective scorecard based on 70+ data points.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Main Form */}
          <div className="glass-panel rounded-2xl p-8 animate-in fade-in slide-in-from-left-8 duration-700 delay-200">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Run Your Diagnostic
              </h3>
              <p className="text-gray-400">
                Enter your practice details to initiate the live AI audit.
              </p>
            </div>

            <PracticeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {/* Features / Value Prop */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
            <div className="glass-panel rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Live Audio Stream</h3>
                <p className="text-gray-400 leading-relaxed">
                  Listen in real-time as our advanced AI navigates your phone tree and speaks with your staff naturally.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Objective Scoring</h3>
                <p className="text-gray-400 leading-relaxed">
                  We evaluate speed to answer, tone, objection handling, and booking attempts against a strict 70-point rubric.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Actionable Insights</h3>
                <p className="text-gray-400 leading-relaxed">
                  Receive a detailed PDF report with specific training recommendations to boost your conversion rate.
                </p>
              </div>
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
