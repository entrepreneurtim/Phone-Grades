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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Practice Name */}
      <div>
        <label htmlFor="practiceName" className="block text-sm font-semibold text-gray-700 mb-2">
          Practice Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="practiceName"
          value={formData.practiceName}
          onChange={(e) => handleChange('practiceName', e.target.value)}
          className={`input-field ${errors.practiceName ? 'border-red-500' : ''}`}
          placeholder="e.g., Bright Smile Dental"
          disabled={isLoading}
        />
        {errors.practiceName && (
          <p className="mt-1 text-sm text-red-600">{errors.practiceName}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
          <Phone className="inline w-4 h-4 mr-1" />
          Practice Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => handleChange('phoneNumber', e.target.value)}
          className={`input-field ${errors.phoneNumber ? 'border-red-500' : ''}`}
          placeholder="e.g., (555) 123-4567"
          disabled={isLoading}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          The number that will receive the mystery-shopper call
        </p>
      </div>

      {/* Location (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
            City <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field"
            placeholder="e.g., Austin"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="input-field"
            placeholder="e.g., TX"
            maxLength={2}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Primary Offer (Optional) */}
      <div>
        <label htmlFor="primaryOffer" className="block text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="inline w-4 h-4 mr-1" />
          Primary New Patient Offer <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          id="primaryOffer"
          value={formData.primaryOffer}
          onChange={(e) => handleChange('primaryOffer', e.target.value)}
          className="input-field"
          placeholder="e.g., $99 New Patient Special"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Help us evaluate if your staff mentions this offer
        </p>
      </div>

      {/* Insurance Type (Optional) */}
      <div>
        <label htmlFor="insuranceType" className="block text-sm font-medium text-gray-700 mb-2">
          <Shield className="inline w-4 h-4 mr-1" />
          Insurance to Test <span className="text-gray-400">(optional)</span>
        </label>
        <select
          id="insuranceType"
          value={formData.insuranceType}
          onChange={(e) => handleChange('insuranceType', e.target.value)}
          className="input-field"
          disabled={isLoading}
        >
          <option value="">Select an insurance...</option>
          <option value="Delta Dental">Delta Dental</option>
          <option value="Cigna">Cigna</option>
          <option value="Aetna">Aetna</option>
          <option value="MetLife">MetLife</option>
          <option value="UnitedHealthcare">UnitedHealthcare</option>
          <option value="Guardian">Guardian</option>
          <option value="Humana">Humana</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Our AI caller will ask about this insurance
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full text-lg py-4"
      >
        {isLoading ? 'Processing...' : 'Run My Phone Scorecard'}
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center">
        By clicking the button above, you agree that you own or have authorization
        to test this phone number.
      </p>
    </form>
  );
}
