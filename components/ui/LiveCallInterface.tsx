'use client';

import { useState, useEffect, useRef } from 'react';
import { Phone, Volume2, VolumeX, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TranscriptSegment } from '@/lib/types';

interface LiveCallInterfaceProps {
  callId: string;
  practiceName: string;
  onCallComplete: () => void;
}

type CallStatus = 'initiating' | 'ringing' | 'in-progress' | 'completed' | 'failed';

export default function LiveCallInterface({
  callId,
  practiceName,
  onCallComplete,
}: LiveCallInterfaceProps) {
  const [status, setStatus] = useState<CallStatus>('initiating');
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Poll for call status updates (better for Vercel than WebSocket)
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/call/stream?callId=${callId}`);
        const data = await response.json();

        if (data.success) {
          const newStatus = data.data.status;
          setStatus(newStatus);
          setTranscript(data.data.transcript || []);

          // Start timer when call is in progress
          if (newStatus === 'in-progress' && !timerRef.current) {
            startTimer();
          }

          // Stop timer and redirect when completed
          if ((newStatus === 'completed' || newStatus === 'failed') && timerRef.current) {
            stopTimer();
            if (pollRef.current) {
              clearInterval(pollRef.current);
            }
            if (newStatus === 'completed') {
              setTimeout(onCallComplete, 2000);
            }
          }

          // Update audio visualization (simulate based on status)
          if (newStatus === 'in-progress') {
            setAudioLevel(Math.random() * 0.8 + 0.2);
          } else {
            setAudioLevel(0.1);
          }
        }
      } catch (error) {
        console.error('Error polling call status:', error);
      }
    };

    // Poll every 2 seconds
    pollStatus(); // Initial poll
    pollRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [callId, onCallComplete]);

  useEffect(() => {
    // Auto-scroll transcript
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'initiating':
        return {
          icon: <Loader2 className="animate-spin" />,
          text: 'Initiating call...',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        };
      case 'ringing':
        return {
          icon: <Phone className="animate-pulse" />,
          text: 'Calling your front desk...',
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
        };
      case 'in-progress':
        return {
          icon: <Phone />,
          text: 'Call in progress - AI is speaking with your receptionist',
          color: 'text-green-600',
          bg: 'bg-green-50',
        };
      case 'completed':
        return {
          icon: <CheckCircle />,
          text: 'Call completed successfully!',
          color: 'text-green-600',
          bg: 'bg-green-50',
        };
      case 'failed':
        return {
          icon: <XCircle />,
          text: 'Call failed',
          color: 'text-red-600',
          bg: 'bg-red-50',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`${statusConfig.bg} rounded-xl p-6 border border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${statusConfig.color} w-12 h-12 flex items-center justify-center`}>
              {statusConfig.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Testing: {practiceName}
              </h2>
              <p className={`${statusConfig.color} font-medium`}>
                {statusConfig.text}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-semibold">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Waveform Visualization */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Live Audio Visualization</h3>
        <div className="flex items-center gap-1 h-24 justify-center">
          {Array.from({ length: 40 }).map((_, i) => {
            const height = status === 'in-progress'
              ? Math.random() * audioLevel * 100
              : 10;
            return (
              <div
                key={i}
                className="flex-1 bg-primary-500 rounded-sm transition-all duration-100"
                style={{ height: `${height}%`, minHeight: '8px' }}
              />
            );
          })}
        </div>
        <p className="text-sm text-gray-600 text-center mt-3">
          {status === 'in-progress'
            ? 'AI is actively conversing with your receptionist'
            : 'Waiting for conversation to start...'}
        </p>
      </div>

      {/* Live Transcript */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Live Transcript</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transcript.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 italic">Waiting for conversation to start...</p>
              <p className="text-xs text-gray-400 mt-1">
                The AI will begin speaking once your receptionist answers
              </p>
            </div>
          ) : (
            transcript.map((segment, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  segment.speaker === 'ai'
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {segment.speaker === 'ai' ? '🤖 AI Caller' : '👤 Front Desk'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDuration(Math.floor(segment.timestamp))}
                  </span>
                </div>
                <p className="text-gray-800">{segment.text}</p>
                {segment.confidence && (
                  <p className="text-xs text-gray-500 mt-1">
                    Confidence: {(segment.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">ℹ️</div>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">How this works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Our AI caller is speaking with your receptionist using natural voice</li>
              <li>The conversation is being transcribed in real-time</li>
              <li>After the call completes, you'll see a detailed scorecard</li>
              <li>The entire interaction takes about 2-4 minutes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
