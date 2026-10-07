/**
 * Utility functions for real-time validation and formatting of Email & Phone fields.
 * Tailored for Haitian educational systems (Haiti +509 & International Diaspora).
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  suggestion?: string | null;
  carrier?: string | null;
  formatted?: string;
}

// Common typo corrections for domains
const DOMAIN_TYPOS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.fr': 'yahoo.fr',
  'hotmial.com': 'hotmail.com',
  'hotmale.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloook.com': 'outlook.com',
  'iclud.com': 'icloud.com',
  'icloude.com': 'icloud.com',
};

/**
 * Validate and inspect an email address in real-time.
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = (email || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Adresse e-mail requise pour recevoir la convocation.',
    };
  }

  // Spaces or disallowed characters
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      error: 'L\'adresse e-mail ne doit pas contenir d\'espaces.',
    };
  }

  // Must contain an @
  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      error: 'Il manque le symbole "@" (ex: nom@domaine.com).',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length > 2) {
    return {
      isValid: false,
      error: 'L\'adresse ne peut contenir qu\'un seul symbole "@".',
    };
  }

  const [localPart, domainPart] = parts;

  if (!localPart || localPart.length < 1) {
    return {
      isValid: false,
      error: 'Veuillez saisir votre identifiant avant l\'arobase "@".',
    };
  }

  if (!domainPart || domainPart.length < 1) {
    return {
      isValid: false,
      error: 'Veuillez préciser le nom de domaine (ex: @gmail.com ou @yahoo.com).',
    };
  }

  // Check domain has at least one dot
  if (!domainPart.includes('.')) {
    return {
      isValid: false,
      error: 'Le domaine doit comporter une extension (ex: .com, .ht, .fr).',
    };
  }

  const domainPieces = domainPart.split('.');
  const tld = domainPieces[domainPieces.length - 1];

  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      error: 'L\'extension de domaine est trop courte (ex: .com ou .ht).',
    };
  }

  // Check for common domain typos
  const lowerDomain = domainPart.toLowerCase();
  let suggestion: string | null = null;
  if (DOMAIN_TYPOS[lowerDomain]) {
    const fixedDomain = DOMAIN_TYPOS[lowerDomain];
    suggestion = `${localPart}@${fixedDomain}`;
  }

  // Full RFC-compliant regex
  const fullEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!fullEmailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Format d\'adresse e-mail invalide (ex: parent@exemple.com).',
      suggestion,
    };
  }

  return {
    isValid: true,
    error: null,
    suggestion,
  };
}

/**
 * Identify carrier in Haiti based on the local 8-digit mobile/fixed prefix.
 */
function identifyHaitiCarrier(local8: string): string {
  if (!local8 || local8.length < 1) return 'Haïti (+509)';
  const first = local8.charAt(0);
  const prefix2 = local8.substring(0, 2);

  // Digicel Haiti typically starts with 3 (e.g. 34, 36, 37, 38, 39, 31, 32...)
  if (first === '3') return 'Haïti · Digicel (+509)';
  // Natcom mobile starts with 4 (e.g. 40, 41, 42, 43, 44, 46, 47, 48, 49) or 22/28 fixed/mobile
  if (first === '4' || first === '2') return 'Haïti · Natcom (+509)';

  return 'Haïti (+509)';
}

/**
 * Format a phone string cleanly as user types:
 * - If starting with 509 or +509: +509 XXXX-XXXX
 * - If local 8 digits: +509 XXXX-XXXX (or XXXX-XXXX)
 * - If North America (+1): +1 (XXX) XXX-XXXX
 */
export function formatPhoneNumber(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');

  // Case 1: Haiti with country code (starts with 509)
  if (digits.startsWith('509')) {
    const rest = digits.slice(3);
    if (rest.length <= 4) {
      return `+509 ${rest}`;
    }
    return `+509 ${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
  }

  // Case 2: User started typing '+' for international number
  if (trimmed.startsWith('+')) {
    if (digits.startsWith('1')) {
      // North America
      const rest = digits.slice(1);
      if (rest.length <= 3) return `+1 (${rest}`;
      if (rest.length <= 6) return `+1 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
      return `+1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 10)}`;
    }
    // General international: preserve '+' and chunk digits
    return `+${digits.slice(0, 15)}`;
  }

  // Case 3: Local Haitian 8-digit number (starts with 2, 3, or 4)
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  // Fallback
  return trimmed;
}

/**
 * Validate phone number in real-time.
 */
export function validatePhone(phone: string): ValidationResult {
  const trimmed = (phone || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Numéro de téléphone joignable requis.',
    };
  }

  const digits = trimmed.replace(/\D/g, '');

  // Check for invalid letters or disallowed symbols
  if (/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Le numéro de téléphone ne doit contenir que des chiffres.',
    };
  }

  // Minimum overall digits
  if (digits.length < 8) {
    const remaining = 8 - digits.length;
    return {
      isValid: false,
      error: `Numéro incomplet : encore ${remaining} chiffre${remaining > 1 ? 's' : ''} attendu${remaining > 1 ? 's' : ''} (ex : +509 3700-0000).`,
    };
  }

  // Check for Haiti country code (+509)
  if (digits.startsWith('509') || trimmed.startsWith('+509')) {
    const haitiDigits = digits.startsWith('509') ? digits.slice(3) : digits;
    const carrier = identifyHaitiCarrier(haitiDigits);

    if (haitiDigits.length < 8) {
      const needed = 8 - haitiDigits.length;
      return {
        isValid: false,
        error: `Numéro haïtien incomplet : ${haitiDigits.length}/8 chiffres (il manque ${needed} chiffre${needed > 1 ? 's' : ''}).`,
        carrier,
      };
    }
    if (haitiDigits.length > 8) {
      return {
        isValid: false,
        error: `Numéro haïtien trop long : 8 chiffres attendus après l'indicatif +509 (actuellement ${haitiDigits.length}).`,
        carrier,
      };
    }

    return {
      isValid: true,
      error: null,
      carrier,
      formatted: `+509 ${haitiDigits.slice(0, 4)}-${haitiDigits.slice(4)}`,
    };
  }

  // Check for North America (+1)
  if (trimmed.startsWith('+1') || (digits.startsWith('1') && digits.length === 11)) {
    const usDigits = digits.startsWith('1') ? digits.slice(1) : digits;
    if (usDigits.length === 10) {
      return {
        isValid: true,
        error: null,
        carrier: 'USA / Canada (+1)',
        formatted: `+1 (${usDigits.slice(0, 3)}) ${usDigits.slice(3, 6)}-${usDigits.slice(6)}`,
      };
    }
    if (usDigits.length < 10) {
      return {
        isValid: false,
        error: `Numéro nord-américain incomplet : ${usDigits.length}/10 chiffres requis.`,
        carrier: 'USA / Canada (+1)',
      };
    }
  }

  // Local 8-digit Haitian number without country code prefix
  if (digits.length === 8) {
    const carrier = identifyHaitiCarrier(digits);
    return {
      isValid: true,
      error: null,
      carrier,
      formatted: `+509 ${digits.slice(0, 4)}-${digits.slice(4)}`,
    };
  }

  // General International number starting with +
  if (trimmed.startsWith('+')) {
    if (digits.length >= 8 && digits.length <= 15) {
      return {
        isValid: true,
        error: null,
        carrier: 'Numéro International',
        formatted: trimmed,
      };
    }
    return {
      isValid: false,
      error: 'Le format international doit comporter entre 8 et 15 chiffres.',
      carrier: 'International',
    };
  }

  // More than 8 digits without '+' prefix
  if (digits.length > 8 && digits.length <= 15) {
    return {
      isValid: true,
      error: null,
      carrier: 'Numéro Joignable',
      formatted: trimmed,
    };
  }

  return {
    isValid: false,
    error: 'Format non reconnu. Exemple attendu : +509 3700-0000 ou 3700-0000.',
  };
}
