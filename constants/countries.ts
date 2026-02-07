/**
 * WEST/CENTRAL AFRICAN COUNTRIES
 * 
 * Country data for phone number input with dial codes.
 * Focused on the ECOWAS/WAEMU region where ZemWifi operates,
 * with additional African countries for broader coverage.
 */

export interface Country {
  /** ISO 3166-1 alpha-2 code */
  code: string
  /** Country name in French */
  name: string
  /** International dial code (with +) */
  dialCode: string
  /** Flag emoji */
  flag: string
  /** Expected phone digit length (after dial code) */
  phoneLength: number
  /** Formatting pattern: groups of digit counts, e.g. [2,2,2,2] → "70 12 34 56" */
  formatPattern: number[]
}

export const COUNTRIES: Country[] = [
  // --- WAEMU / UEMOA (primary market) ---
  { code: 'BF', name: 'Burkina Faso',        dialCode: '+226', flag: '🇧🇫', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'CI', name: "Côte d'Ivoire",       dialCode: '+225', flag: '🇨🇮', phoneLength: 10, formatPattern: [2, 2, 2, 2, 2] },
  { code: 'ML', name: 'Mali',                dialCode: '+223', flag: '🇲🇱', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'SN', name: 'Sénégal',             dialCode: '+221', flag: '🇸🇳', phoneLength: 9,  formatPattern: [2, 3, 2, 2] },
  { code: 'TG', name: 'Togo',                dialCode: '+228', flag: '🇹🇬', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'BJ', name: 'Bénin',               dialCode: '+229', flag: '🇧🇯', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'NE', name: 'Niger',               dialCode: '+227', flag: '🇳🇪', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'GW', name: 'Guinée-Bissau',       dialCode: '+245', flag: '🇬🇼', phoneLength: 7,  formatPattern: [3, 4] },

  // --- Other ECOWAS ---
  { code: 'GH', name: 'Ghana',               dialCode: '+233', flag: '🇬🇭', phoneLength: 9,  formatPattern: [2, 3, 4] },
  { code: 'NG', name: 'Nigéria',             dialCode: '+234', flag: '🇳🇬', phoneLength: 10, formatPattern: [3, 3, 4] },
  { code: 'GN', name: 'Guinée',              dialCode: '+224', flag: '🇬🇳', phoneLength: 9,  formatPattern: [3, 2, 2, 2] },
  { code: 'SL', name: 'Sierra Leone',        dialCode: '+232', flag: '🇸🇱', phoneLength: 8,  formatPattern: [2, 6] },
  { code: 'LR', name: 'Libéria',             dialCode: '+231', flag: '🇱🇷', phoneLength: 7,  formatPattern: [3, 4] },
  { code: 'GM', name: 'Gambie',              dialCode: '+220', flag: '🇬🇲', phoneLength: 7,  formatPattern: [3, 4] },
  { code: 'CV', name: 'Cap-Vert',            dialCode: '+238', flag: '🇨🇻', phoneLength: 7,  formatPattern: [3, 2, 2] },

  // --- Central Africa ---
  { code: 'CM', name: 'Cameroun',            dialCode: '+237', flag: '🇨🇲', phoneLength: 9,  formatPattern: [3, 2, 2, 2] },
  { code: 'GA', name: 'Gabon',               dialCode: '+241', flag: '🇬🇦', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'CG', name: 'Congo-Brazzaville',   dialCode: '+242', flag: '🇨🇬', phoneLength: 9,  formatPattern: [2, 3, 4] },
  { code: 'CD', name: 'RD Congo',            dialCode: '+243', flag: '🇨🇩', phoneLength: 9,  formatPattern: [3, 3, 3] },
  { code: 'TD', name: 'Tchad',               dialCode: '+235', flag: '🇹🇩', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },
  { code: 'CF', name: 'Centrafrique',        dialCode: '+236', flag: '🇨🇫', phoneLength: 8,  formatPattern: [2, 2, 2, 2] },

  // --- North / East Africa ---
  { code: 'MA', name: 'Maroc',               dialCode: '+212', flag: '🇲🇦', phoneLength: 9,  formatPattern: [3, 2, 2, 2] },
  { code: 'DZ', name: 'Algérie',             dialCode: '+213', flag: '🇩🇿', phoneLength: 9,  formatPattern: [3, 2, 2, 2] },
  { code: 'TN', name: 'Tunisie',             dialCode: '+216', flag: '🇹🇳', phoneLength: 8,  formatPattern: [2, 3, 3] },

  // --- Europe (diaspora) ---
  { code: 'FR', name: 'France',              dialCode: '+33',  flag: '🇫🇷', phoneLength: 9,  formatPattern: [1, 2, 2, 2, 2] },
  { code: 'BE', name: 'Belgique',            dialCode: '+32',  flag: '🇧🇪', phoneLength: 9,  formatPattern: [3, 2, 2, 2] },
  { code: 'CH', name: 'Suisse',              dialCode: '+41',  flag: '🇨🇭', phoneLength: 9,  formatPattern: [2, 3, 2, 2] },
]

/** Default country (Burkina Faso) */
export const DEFAULT_COUNTRY_CODE = 'BF'

/** Find a country by its ISO code */
export const getCountryByCode = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code === code)

/** Find a country by its dial code */
export const getCountryByDialCode = (dialCode: string): Country | undefined =>
  COUNTRIES.find((c) => c.dialCode === dialCode)

/** Format a phone number based on country formatting pattern */
export const formatPhoneForCountry = (digits: string, country: Country): string => {
  const maxLen = country.phoneLength
  const trimmed = digits.slice(0, maxLen)

  let result = ''
  let pos = 0
  for (const groupSize of country.formatPattern) {
    if (pos >= trimmed.length) break
    if (result) result += ' '
    result += trimmed.slice(pos, pos + groupSize)
    pos += groupSize
  }
  return result
}
