'use client';

import { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
  practiceName: string;
}

export default function ConsentModal({
  isOpen,
  onClose,
  onConsent,
  practiceName,
}: ConsentModalProps) {
  const [hasConsented, setHasConsented] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    if (hasConsented) {
      onConsent();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-6 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Call Consent
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-200 font-medium mb-1">
              Initiating mystery-shopper test for:
            </p>
            <p className="text-lg font-bold text-white">
              {practiceName}
            </p>
          </div>

          <div className="space-y-4 text-gray-300">
            <p className="font-medium text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Please confirm the following:
            </p>
            <ul className="space-y-3 ml-1">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  A <strong>simulated mystery-shopper call</strong> will be
                  placed to the phone number you provided.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  The call will play <strong>LIVE through this website</strong>{' '}
                  so you can hear the conversation in real-time.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  The entire call will be{' '}
                  <strong>recorded and transcribed</strong> for analysis.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <span className="text-sm leading-relaxed">
                  You must <strong>own or control</strong> the phone number
                  being tested.
                </span>
              </li>
            </ul>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setHasConsented(!hasConsented)}>
            <label className="flex items-start cursor-pointer pointer-events-none">
              <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${hasConsented ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                {hasConsented && <X className="w-3 h-3 text-white rotate-45" strokeWidth={4} />}
              </div>
              <span className="ml-3 text-sm text-gray-300">
                <strong>I consent to the live simulated call and recording.</strong>
                <br /><span className="text-xs text-gray-500 mt-1 block">I confirm that I own or have authorization to test this phone number, and I understand this call will be recorded for quality evaluation purposes.</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/5 p-6 bg-white/5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!hasConsented}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
