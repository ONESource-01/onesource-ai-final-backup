// Global Business Identifier (GBI) Validation System
// Phase 1: English-speaking countries with format validation only

export const BUSINESS_ID_SCHEMES = {
  AU: [
    {
      code: 'ABN',
      name: 'Australian Business Number (ABN)',
      regex: /^\d{11}$/,
      example: '53004085616',
      placeholder: '11 digits',
      checksum: 'abn',
      helpUrl: 'https://www.abn.business.gov.au/'
    },
    {
      code: 'ACN',
      name: 'Australian Company Number (ACN)',
      regex: /^\d{9}$/,
      example: '123456789',
      placeholder: '9 digits',
      checksum: 'mod10',
      helpUrl: 'https://asic.gov.au/'
    }
  ],
  NZ: [
    {
      code: 'NZBN',
      name: 'New Zealand Business Number (NZBN)',
      regex: /^\d{13}$/,
      example: '9429047451781',
      placeholder: '13 digits',
      checksum: 'mod11',
      helpUrl: 'https://www.nzbn.govt.nz/'
    }
  ],
  GB: [
    {
      code: 'CRN',
      name: 'UK Company Registration Number',
      regex: /^(\d{8}|[A-Z]{2}\d{6})$/,
      example: '12345678 or AB123456',
      placeholder: '8 digits or 2 letters + 6 digits',
      checksum: 'none',
      helpUrl: 'https://www.gov.uk/government/organisations/companies-house'
    }
  ],
  US: [
    {
      code: 'EIN',
      name: 'Employer Identification Number (EIN)',
      regex: /^\d{2}-?\d{7}$/,
      example: '12-3456789',
      placeholder: 'XX-XXXXXXX',
      checksum: 'none',
      helpUrl: 'https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers'
    }
  ],
  CA: [
    {
      code: 'BN',
      name: 'Canadian Business Number (BN)',
      regex: /^\d{9}$/,
      example: '123456789',
      placeholder: '9 digits',
      checksum: 'none',
      helpUrl: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/registering-your-business/business-number.html'
    }
  ],
  IE: [
    {
      code: 'CRO',
      name: 'Irish Company Registration Office Number',
      regex: /^\d{6,7}$/,
      example: '123456',
      placeholder: '6-7 digits',
      checksum: 'none',
      helpUrl: 'https://www.cro.ie/'
    }
  ],
  ZA: [
    {
      code: 'CIPC',
      name: 'South African Company Registration Number',
      regex: /^\d{4}\/\d{6}\/\d{2}$/,
      example: '2020/123456/07',
      placeholder: 'YYYY/XXXXXX/XX',
      checksum: 'none',
      helpUrl: 'http://www.cipc.co.za/'
    }
  ]
};

export const COUNTRIES = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' }
];

// Validation functions
export const validateBusinessId = (value, scheme) => {
  if (!value || !scheme) return { valid: false, message: 'Please enter a business number' };
  
  const cleanValue = value.replace(/[-\s]/g, '').toUpperCase();
  
  // Format validation
  if (!scheme.regex.test(cleanValue)) {
    return { 
      valid: false, 
      message: `Invalid format. Expected: ${scheme.example}` 
    };
  }
  
  // Checksum validation where applicable
  if (scheme.checksum === 'abn') {
    return validateABN(cleanValue);
  } else if (scheme.checksum === 'mod10') {
    return validateACN(cleanValue);
  } else if (scheme.checksum === 'mod11') {
    return validateNZBN(cleanValue);
  }
  
  return { 
    valid: true, 
    message: 'Format valid - Pending review' 
  };
};

// ABN checksum validation
const validateABN = (abn) => {
  if (abn.length !== 11) return { valid: false, message: 'ABN must be 11 digits' };
  
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  let sum = 0;
  
  // Subtract 1 from first digit
  const firstDigit = parseInt(abn[0]) - 1;
  if (firstDigit < 0) return { valid: false, message: 'Invalid ABN format' };
  
  sum += firstDigit * weights[0];
  
  for (let i = 1; i < 11; i++) {
    sum += parseInt(abn[i]) * weights[i];
  }
  
  const isValid = sum % 89 === 0;
  return {
    valid: isValid,
    message: isValid ? 'ABN format valid - Pending review' : 'Invalid ABN checksum'
  };
};

// ACN checksum validation (mod 10)
const validateACN = (acn) => {
  if (acn.length !== 9) return { valid: false, message: 'ACN must be 9 digits' };
  
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(acn[i]) * weights[i];
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  const isValid = checkDigit === parseInt(acn[8]);
  
  return {
    valid: isValid,
    message: isValid ? 'ACN format valid - Pending review' : 'Invalid ACN checksum'
  };
};

// NZBN checksum validation (mod 11)
const validateNZBN = (nzbn) => {
  if (nzbn.length !== 13) return { valid: false, message: 'NZBN must be 13 digits' };
  
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(nzbn[i]) * weights[i];
    if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  const isValid = checkDigit === parseInt(nzbn[12]);
  
  return {
    valid: isValid,
    message: isValid ? 'NZBN format valid - Pending review' : 'Invalid NZBN checksum'
  };
};

// Get schemes for a country
export const getSchemesForCountry = (countryCode) => {
  return BUSINESS_ID_SCHEMES[countryCode] || [];
};

// Get country by code
export const getCountryByCode = (code) => {
  return COUNTRIES.find(country => country.code === code);
};