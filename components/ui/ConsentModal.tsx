'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Important: Call Consent
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium">
              You are about to initiate a mystery-shopper test call to:
            </p>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {practiceName}
            </p>
          </div>

          <div className="space-y-3 text-gray-700">
            <p className="font-semibold text-gray-900">
              Please understand that:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <span className="mr-2 text-primary-600 font-bold">•</span>
                <span>
                  A <strong>simulated mystery-shopper call</strong> will be
                  placed to the phone number you provided
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary-600 font-bold">•</span>
                <span>
                  The call will play <strong>LIVE through this website</strong>{' '}
                  so you can hear the conversation in real-time
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary-600 font-bold">•</span>
                <span>
                  The entire call will be{' '}
                  <strong>recorded and transcribed</strong> for analysis
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary-600 font-bold">•</span>
                <span>
                  You must <strong>own or control</strong> the phone number
                  being tested
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary-600 font-bold">•</span>
                <span>
                  This tool is for <strong>training and quality assurance</strong>{' '}
                  purposes only
                </span>
              </li>
            </ul>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>I consent to the live simulated call and recording.</strong>
                <br />I confirm that I own or have authorization to test this phone
                number, and I understand this call will be recorded for quality
                evaluation purposes.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!hasConsented}
            className="btn-primary"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
}
