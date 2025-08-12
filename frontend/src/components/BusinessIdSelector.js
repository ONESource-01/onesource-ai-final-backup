import React, { useState, useEffect } from 'react';
import { 
  COUNTRIES, 
  getSchemesForCountry, 
  validateBusinessId 
} from '../utils/businessIdValidator';

const BusinessIdSelector = ({ 
  value = { country: 'AU', scheme: '', number: '' }, 
  onChange, 
  error,
  required = true 
}) => {
  const [selectedCountry, setSelectedCountry] = useState(value.country || 'AU');
  const [selectedScheme, setSelectedScheme] = useState(value.scheme || '');
  const [businessNumber, setBusinessNumber] = useState(value.number || '');
  const [validation, setValidation] = useState({ valid: false, message: '' });
  const [showOptional, setShowOptional] = useState(false);

  // Get schemes for selected country
  const availableSchemes = getSchemesForCountry(selectedCountry);
  const currentScheme = availableSchemes.find(s => s.code === selectedScheme);

  // Auto-select first scheme when country changes
  useEffect(() => {
    if (availableSchemes.length > 0 && !selectedScheme) {
      const defaultScheme = availableSchemes[0];
      setSelectedScheme(defaultScheme.code);
      onChange?.({
        country: selectedCountry,
        scheme: defaultScheme.code,
        number: businessNumber,
        valid: false
      });
    }
  }, [selectedCountry, availableSchemes]);

  // Validate business number
  useEffect(() => {
    if (businessNumber && currentScheme && !showOptional) {
      const result = validateBusinessId(businessNumber, currentScheme);
      setValidation(result);
      onChange?.({
        country: selectedCountry,
        scheme: selectedScheme,
        number: businessNumber,
        valid: result.valid,
        message: result.message
      });
    } else if (showOptional) {
      setValidation({ valid: true, message: 'Manual verification required' });
      onChange?.({
        country: selectedCountry,
        scheme: selectedScheme || '',
        number: '',
        valid: true,
        unverified: true,
        message: 'Manual verification required'
      });
    } else {
      setValidation({ valid: false, message: '' });
      onChange?.({
        country: selectedCountry,
        scheme: selectedScheme,
        number: businessNumber,
        valid: false
      });
    }
  }, [businessNumber, currentScheme, selectedCountry, selectedScheme, showOptional]);

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedScheme(''); // Reset scheme selection
    setBusinessNumber('');
    setValidation({ valid: false, message: '' });
  };

  const handleSchemeChange = (schemeCode) => {
    setSelectedScheme(schemeCode);
    setBusinessNumber('');
    setValidation({ valid: false, message: '' });
  };

  const handleOptionalToggle = (checked) => {
    setShowOptional(checked);
    if (checked) {
      setBusinessNumber('');
      setSelectedScheme('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Country/Region {required && '*'}
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-onesource-dark focus:border-onesource-dark"
          required={required}
        >
          {COUNTRIES.map(country => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Business ID Type Selection */}
      {availableSchemes.length > 1 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Business Identifier Type {required && '*'}
          </label>
          <select
            value={selectedScheme}
            onChange={(e) => handleSchemeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-onesource-dark focus:border-onesource-dark"
            required={required && !showOptional}
            disabled={showOptional}
          >
            <option value="">Select identifier type...</option>
            {availableSchemes.map(scheme => (
              <option key={scheme.code} value={scheme.code}>
                {scheme.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Optional Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="no-business-id"
          checked={showOptional}
          onChange={(e) => handleOptionalToggle(e.target.checked)}
          className="rounded border-gray-300 text-onesource-dark focus:ring-onesource-dark"
        />
        <label htmlFor="no-business-id" className="text-sm text-gray-600">
          I don't have a business registration number
        </label>
      </div>

      {/* Business Number Input */}
      {!showOptional && currentScheme && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {currentScheme.name} {required && '*'}
          </label>
          <input
            type="text"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            placeholder={currentScheme.placeholder}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-onesource-dark focus:border-onesource-dark ${
              businessNumber && validation.valid 
                ? 'border-green-300 bg-green-50' 
                : businessNumber && !validation.valid 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
            required={required}
          />
          
          {/* Format Example & Help */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Example: {currentScheme.example}</span>
            <a 
              href={currentScheme.helpUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-onesource-dark hover:text-onesource-medium underline"
            >
              Where to find this?
            </a>
          </div>

          {/* Validation Message */}
          {businessNumber && (
            <div className={`text-xs flex items-center gap-1 ${
              validation.valid ? 'text-green-600' : 'text-red-600'
            }`}>
              {validation.valid ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">✗</span>
              )}
              {validation.message}
            </div>
          )}
        </div>
      )}

      {/* Optional State Message */}
      {showOptional && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
          ⚠️ Your application will require manual verification by our team.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default BusinessIdSelector;