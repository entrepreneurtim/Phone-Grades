'use client';

import { useState } from 'react';
import { Phone, MapPin, DollarSign, Shield } from 'lucide-react';
import { PracticeInfo } from '@/lib/types';

interface PracticeFormProps {
  onSubmit: (info: PracticeInfo) => void;
  isLoading?: boolean;
}

export default function PracticeForm({ onSubmit, isLoading }: PracticeFormProps) {
  const [formData, setFormData] = useState<PracticeInfo>({
    practiceName: '',
    phoneNumber: '',
    city: '',
    state: '',
    primaryOffer: '',
    insuranceType: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PracticeInfo, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PracticeInfo, string>> = {};

    if (!formData.practiceName.trim()) {
      newErrors.practiceName = 'Practice name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof PracticeInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClasses = "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Practice Name */}
      <div>
        <label htmlFor="practiceName" className={labelClasses}>
          Practice Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="practiceName"
          value={formData.practiceName}
          onChange={(e) => handleChange('practiceName', e.target.value)}
          className={`${inputClasses} ${errors.practiceName ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
          placeholder="e.g., Bright Smile Dental"
          disabled={isLoading}
        />
        {errors.practiceName && (
          <p className="mt-1 text-sm text-red-400">{errors.practiceName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className={labelClasses}>
          <Phone className="inline w-4 h-4 mr-1 text-blue-400" />
          Practice Phone Number <span className="text-red-400">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          className={`${inputClasses} ${errors.phoneNumber ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
          placeholder="e.g., (555) 123-4567"
          disabled={isLoading}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-400">{errors.phoneNumber}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The number that will receive the mystery-shopper call
        </p>
      </div>

      {/* Location (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className={labelClasses}>
            <MapPin className="inline w-4 h-4 mr-1 text-purple-400" />
            City <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClasses}
            placeholder="e.g., Austin"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="state" className={labelClasses}>
            State <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={inputClasses}
            placeholder="e.g., TX"
            maxLength={2}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Primary Offer (Optional) */}
      <div>
        <label htmlFor="primaryOffer" className={labelClasses}>
          <DollarSign className="inline w-4 h-4 mr-1 text-emerald-400" />
          Primary New Patient Offer <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="text"
          id="primaryOffer"
          value={formData.primaryOffer}
          onChange={(e) => handleChange('primaryOffer', e.target.value)}
          className={inputClasses}
          placeholder="e.g., $99 New Patient Special"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Help us evaluate if your staff mentions this offer
        </p>
      </div>

      {/* Insurance Type (Optional) */}
      <div>
        <label htmlFor="insuranceType" className={labelClasses}>
          <Shield className="inline w-4 h-4 mr-1 text-indigo-400" />
          Insurance to Test <span className="text-gray-500">(optional)</span>
        </label>
        <select
          id="insuranceType"
          value={formData.insuranceType}
          onChange={(e) => handleChange('insuranceType', e.target.value)}
          className={`${inputClasses} appearance-none bg-black/20`}
          disabled={isLoading}
        >
          <option value="" className="bg-gray-900 text-gray-400">Select an insurance...</option>
          <option value="Delta Dental" className="bg-gray-900">Delta Dental</option>
          <option value="Cigna" className="bg-gray-900">Cigna</option>
          <option value="Aetna" className="bg-gray-900">Aetna</option>
          <option value="MetLife" className="bg-gray-900">MetLife</option>
          <option value="UnitedHealthcare" className="bg-gray-900">UnitedHealthcare</option>
          <option value="Guardian" className="bg-gray-900">Guardian</option>
          <option value="Humana" className="bg-gray-900">Humana</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Our AI caller will ask about this insurance
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          'Run My Phone Scorecard'
        )}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        By clicking the button above, you agree that you own or have authorization
        to test this phone number.
      </p>
    </form>
  );
}
