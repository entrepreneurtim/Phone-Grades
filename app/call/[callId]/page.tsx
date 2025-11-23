'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LiveCallInterface from '@/components/ui/LiveCallInterface';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CallPage() {
  const router = useRouter();
  const params = useParams();
  const callId = params.callId as string;

  const [loading, setLoading] = useState(true);
  const [callData, setCallData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch call details
    const fetchCallData = async () => {
      try {
        const response = await fetch(`/api/call/${callId}`);
        const data = await response.json();

        if (data.success) {
          setCallData(data.call);
        } else {
          setError(data.error || 'Failed to load call data');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    if (callId) {
      fetchCallData();
    }
  }, [callId]);

  const handleCallComplete = () => {
    // Redirect to scorecard page
    router.push(`/scorecard/${callId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading call session...</p>
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Mystery Call
          </h1>
          <p className="text-gray-600">
            Listen to the call in real-time. You'll be redirected to the scorecard
            when the call completes.
          </p>
        </div>

        {callData && (
          <LiveCallInterface
            callId={callId}
            practiceName={callData.practiceInfo?.practiceName || 'Unknown Practice'}
            onCallComplete={handleCallComplete}
          />
        )}
      </section>
    </main>
  );
}
