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
  const [showIVRAssist, setShowIVRAssist] = useState(false);
  const [ivrOptions, setIVROptions] = useState<string[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/api/call/stream?callId=${callId}`
    );

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    wsRef.current = ws;

    return () => {
      ws.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callId]);

  useEffect(() => {
    // Auto-scroll transcript
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'status':
        setStatus(message.data.status);
        if (message.data.status === 'in-progress' && !timerRef.current) {
          startTimer();
        } else if (message.data.status === 'completed' || message.data.status === 'failed') {
          stopTimer();
          if (message.data.status === 'completed') {
            setTimeout(onCallComplete, 2000);
          }
        }
        break;

      case 'audio':
        // Handle audio streaming
        playAudioChunk(message.data);
        break;

      case 'transcript':
        setTranscript((prev) => [...prev, message.data]);
        break;

      case 'audio_level':
        setAudioLevel(message.data.level);
        break;

      case 'ivr':
        if (message.data.needsAssist) {
          setShowIVRAssist(true);
          setIVROptions(message.data.options || ['1', '2', '3', '4', '5']);
        } else {
          setShowIVRAssist(false);
        }
        break;

      case 'error':
        console.error('Call error:', message.data);
        setStatus('failed');
        break;
    }
  };

  const playAudioChunk = (audioData: any) => {
    // This would handle actual audio streaming
    // For now, we'll simulate it
    if (!isMuted && audioRef.current) {
      // Play audio chunk
    }
  };

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

  const handleIVRSelect = async (option: string) => {
    // Send DTMF digit
    await fetch('/api/call/ivr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callId, digit: option }),
    });
    setShowIVRAssist(false);
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
          text: 'Call in progress',
          color: 'text-green-600',
          bg: 'bg-green-50',
        };
      case 'completed':
        return {
          icon: <CheckCircle />,
          text: 'Call completed',
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
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-lg ${
                isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'
              } hover:opacity-80 transition-opacity`}
            >
              {isMuted ? <VolumeX /> : <Volume2 />}
            </button>
          </div>
        </div>
      </div>

      {/* Audio Waveform Visualization */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Live Audio</h3>
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
      </div>

      {/* IVR Assist Modal */}
      {showIVRAssist && (
        <div className="card bg-yellow-50 border-yellow-300">
          <h3 className="text-lg font-semibold mb-3 text-yellow-900">
            Phone Menu Detected
          </h3>
          <p className="text-sm text-yellow-800 mb-4">
            Your practice uses a phone menu. Click the option that leads to the front
            desk or new patient line:
          </p>
          <div className="flex gap-2">
            {ivrOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleIVRSelect(option)}
                className="btn-primary"
              >
                Press {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Transcript */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Live Transcript</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transcript.length === 0 ? (
            <p className="text-gray-500 italic">Waiting for conversation to start...</p>
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
                    {segment.speaker === 'ai' ? 'AI Caller' : 'Front Desk'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDuration(Math.floor(segment.timestamp))}
                  </span>
                </div>
                <p className="text-gray-800">{segment.text}</p>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}
