/**
 * Transliterator — Bidirectional Devanagari ↔ IAST & Roman conversion
 * Handles vowel signs (matras), conjuncts, virama, English phonetic spellings, and special characters.
 */

// Devanagari consonants → IAST base (without inherent 'a')
const CONSONANT_MAP = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
  'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
  'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h',
};

// Devanagari independent vowels → IAST
const VOWEL_MAP = {
  'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī',
  'उ': 'u', 'ऊ': 'ū', 'ऋ': 'ṛ', 'ॠ': 'ṝ',
  'ऌ': 'ḷ', 'ॡ': 'ḹ',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
};

// Devanagari vowel signs (matras) → IAST
const MATRA_MAP = {
  '\u093E': 'ā',   // ा
  '\u093F': 'i',   // ि
  '\u0940': 'ī',   // ी
  '\u0941': 'u',   // ु
  '\u0942': 'ū',   // ू
  '\u0943': 'ṛ',   // ृ
  '\u0944': 'ṝ',   // ॄ
  '\u0962': 'ḷ',   // ॢ
  '\u0963': 'ḹ',   // ॣ
  '\u0947': 'e',   // े
  '\u0948': 'ai',  // ै
  '\u094B': 'o',   // ो
  '\u094C': 'au',  // ौ
};

// Special characters
const SPECIAL_MAP = {
  'ं': 'ṁ',     // Anusvara
  'ः': 'ḥ',     // Visarga
  'ँ': 'm̐',    // Chandrabindu
  '।': '|',     // Danda
  '॥': '||',    // Double danda
  'ॐ': 'oṁ',   // Om
};

const VIRAMA = '\u094D'; // ्

// Common English words, single phonemes & romanized presets dictionary
const COMMON_ROMAN_DICT = {
  // --- Single Vowels (स्वर) ---
  'a': 'अ',
  'aa': 'आ',
  'i': 'इ',
  'ee': 'ई',
  'ii': 'ई',
  'u': 'उ',
  'oo': 'ऊ',
  'uu': 'ऊ',
  'ri': 'ऋ',
  'ru': 'ऋ',
  'e': 'ए',
  'ai': 'ऐ',
  'o': 'ओ',
  'au': 'औ',
  'am': 'अं',
  'ah': 'अः',

  // --- Single Consonants (व्यञ्जन) ---
  'ka': 'क',
  'k': 'क्',
  'kha': 'ख',
  'kh': 'ख्',
  'ga': 'ग',
  'g': 'ग्',
  'gha': 'घ',
  'gh': 'घ्',
  'nga': 'ङ',
  'cha': 'च',
  'ch': 'च्',
  'chha': 'छ',
  'chh': 'छ्',
  'ja': 'ज',
  'j': 'ज्',
  'jha': 'झ',
  'jh': 'झ्',
  'nya': 'ञ',
  'ta': 'त',
  't': 'त्',
  'tha': 'थ',
  'th': 'थ्',
  'da': 'द',
  'd': 'द्',
  'dha': 'ध',
  'dh': 'ध्',
  'na': 'न',
  'n': 'न्',
  'pa': 'प',
  'p': 'प्',
  'pha': 'फ',
  'ph': 'फ्',
  'ba': 'ब',
  'b': 'ब्',
  'bha': 'भ',
  'bh': 'भ्',
  'ma': 'म',
  'm': 'म्',
  'ya': 'य',
  'y': 'य्',
  'ra': 'र',
  'r': 'र्',
  'la': 'ल',
  'l': 'ल्',
  'va': 'व',
  'v': 'व्',
  'wa': 'व',
  'w': 'व्',
  'sha': 'श',
  'sh': 'श्',
  'shha': 'ष',
  'shh': 'ष्',
  'sa': 'स',
  's': 'स्',
  'ha': 'ह',
  'h': 'ह्',
  'ksha': 'क्ष',
  'tra': 'त्र',
  'gya': 'ज्ञ',

  // --- Common Sanskrit Words ---
  'om': 'ॐ',
  'aum': 'ॐ',
  'shiva': 'शिव',
  'shiv': 'शिव',
  'siva': 'शिव',
  'rama': 'राम',
  'ram': 'राम',
  'raam': 'राम',
  'namaste': 'नमस्ते',
  'namaskar': 'नमस्कार',
  'shanti': 'शान्तिः',
  'shantih': 'शान्तिः',
  'santi': 'शान्तिः',
  'guru': 'गुरु',
  'satyam': 'सत्यम्',
  'satya': 'सत्य',
  'karma': 'कर्म',
  'yoga': 'योग',
  'yog': 'योग',
  'aham': 'अहम्',
  'veda': 'वेद',
  'mantra': 'मन्त्र',
  'krishna': 'कृष्ण',
  'brahman': 'ब्रह्मन्',
  'brahma': 'ब्रह्म',
  'atma': 'आत्मन्',
  'atman': 'आत्मन्',
  'moksha': 'मोक्ष',
  'dharma': 'धर्म',
  'vidya': 'विद्या',
  'ananda': 'आनन्द',
  'gyan': 'ज्ञान',
  'gyaan': 'ज्ञान',
  'jnana': 'ज्ञान',
  'shri': 'श्री',
  'shree': 'श्री',
  'sri': 'श्री',
  'hari': 'हरि',
  'deva': 'देव',
  'devi': 'देवी',
  'agni': 'अग्निः',
  'surya': 'सूर्य',
  'vayu': 'वायु',
  'prana': 'प्राण',
};

// Common Devanagari ASR variant normalizations (ASR often produces Hindi colloquial forms)
const COMMON_DEVANAGARI_NORM = {
  'शांति': 'शान्तिः',
  'शान्ति': 'शान्तिः',
  'ओम': 'ॐ',
  'ओम्': 'ॐ',
  'सत्यम': 'सत्यम्',
  'अहम': 'अहम्',
  'रामा': 'राम',
  'गुरू': 'गुरु',
  'कृष्णा': 'कृष्ण',
  'मोक्ष': 'मोक्ष',
  'धर्म': 'धर्म',
  'कर्म': 'कर्म',
  'ज्ञान': 'ज्ञान',
  'नमस्ते': 'नमस्ते',
};

// Multi-character consonant matches (longest first)
const ROMAN_CONSONANTS = [
  ['ksh', 'क्ष'], ['kṣ', 'क्ष'],
  ['gy', 'ज्ञ'], ['jñ', 'ज्ञ'], ['jn', 'ज्ञ'],
  ['tr', 'त्र'],
  ['kh', 'ख'], ['gh', 'घ'], ['ṅ', 'ङ'],
  ['chh', 'छ'], ['ch', 'च'], ['jh', 'झ'], ['ñ', 'ञ'],
  ['ṭh', 'ठ'], ['th', 'थ'], ['ḍh', 'ढ'], ['dh', 'ध'],
  ['ṭ', 'ट'], ['ḍ', 'ड'], ['ṇ', 'ण'],
  ['ph', 'फ'], ['bh', 'भ'],
  ['shh', 'ष'], ['sh', 'श'], ['ś', 'श'], ['ṣ', 'ष'],
  ['k', 'क'], ['g', 'ग'], ['c', 'च'], ['j', 'ज'],
  ['t', 'त'], ['d', 'द'], ['n', 'न'],
  ['p', 'प'], ['b', 'ब'], ['m', 'म'],
  ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'],
  ['s', 'स'], ['h', 'ह']
];

// Multi-character vowel matches (longest first)
const ROMAN_VOWELS = [
  ['aum', 'ॐ', 'ॐ'],
  ['aai', 'आई', 'ाई'],
  ['ai', 'ऐ', 'ै'],
  ['au', 'औ', 'ौ'],
  ['aa', 'आ', 'ा'],
  ['ā', 'आ', 'ा'],
  ['ee', 'ई', 'ी'],
  ['ī', 'ई', 'ी'],
  ['oo', 'ऊ', 'ू'],
  ['ū', 'ऊ', 'ू'],
  ['ri', 'ऋ', 'ृ'],
  ['ṛ', 'ऋ', 'ृ'],
  ['ṝ', 'ॠ', 'ॄ'],
  ['ḷ', 'ऌ', 'ॢ'],
  ['i', 'इ', 'ि'],
  ['u', 'उ', 'ु'],
  ['e', 'ए', 'े'],
  ['o', 'ओ', 'ो'],
  ['a', 'अ', ''] // inherent or independent 'a'
];

/**
 * Convert Devanagari text to IAST romanization
 * @param {string} devanagari
 * @returns {string} IAST romanized text
 */
export function toIAST(devanagari) {
  if (!devanagari) return '';
  
  let result = '';
  const chars = [...devanagari];
  let i = 0;

  while (i < chars.length) {
    const char = chars[i];

    if (SPECIAL_MAP[char]) {
      result += SPECIAL_MAP[char];
      i++;
      continue;
    }

    if (VOWEL_MAP[char]) {
      result += VOWEL_MAP[char];
      i++;
      continue;
    }

    if (CONSONANT_MAP[char]) {
      result += CONSONANT_MAP[char];
      i++;

      if (i < chars.length) {
        const next = chars[i];

        if (next === VIRAMA) {
          i++; // suppress inherent 'a'
        } else if (MATRA_MAP[next]) {
          result += MATRA_MAP[next];
          i++;
        } else {
          result += 'a';
        }
      } else {
        result += 'a';
      }
      continue;
    }

    if (char === VIRAMA) {
      i++;
      continue;
    }

    if (MATRA_MAP[char]) {
      result += MATRA_MAP[char];
      i++;
      continue;
    }

    const digitCode = char.codePointAt(0);
    if (digitCode >= 0x0966 && digitCode <= 0x096F) {
      result += String(digitCode - 0x0966);
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

/**
 * Convert IAST / Roman English transliteration to Devanagari
 * @param {string} input
 * @returns {string} Devanagari text
 */
export function toDevanagari(input) {
  if (!input) return '';
  const cleanInput = input.trim();
  const lower = cleanInput.toLowerCase();

  // Check common dictionary first
  if (COMMON_ROMAN_DICT[lower]) {
    return COMMON_ROMAN_DICT[lower];
  }

  // If already Devanagari, return directly
  if (/[\u0900-\u097F]/.test(cleanInput)) {
    return cleanInput;
  }

  let result = '';
  let i = 0;
  let prevWasConsonant = false;

  while (i < lower.length) {
    const char = lower[i];

    // Special symbols / punctuation
    if (char === ' ' || char === '\n' || char === '\t') {
      prevWasConsonant = false;
      result += char;
      i++;
      continue;
    }
    if (char === 'ṁ' || char === 'm' && i === lower.length - 1 && prevWasConsonant) {
      if (prevWasConsonant) {
        result += 'म्';
      } else {
        result += 'ं';
      }
      prevWasConsonant = false;
      i++;
      continue;
    }
    if (char === 'ḥ' || char === ':') {
      result += 'ः';
      prevWasConsonant = false;
      i++;
      continue;
    }

    // Match consonants
    let matchedConsonant = false;
    for (const [seq, dev] of ROMAN_CONSONANTS) {
      if (lower.startsWith(seq, i)) {
        if (prevWasConsonant) {
          result += VIRAMA;
        }
        result += dev;
        prevWasConsonant = true;
        i += seq.length;
        matchedConsonant = true;
        break;
      }
    }
    if (matchedConsonant) continue;

    // Match vowels
    let matchedVowel = false;
    for (const [seq, indVowel, matra] of ROMAN_VOWELS) {
      if (lower.startsWith(seq, i)) {
        if (prevWasConsonant) {
          // Attach matra (if 'a', it's inherent so matra is '')
          result += matra;
        } else {
          result += indVowel;
        }
        prevWasConsonant = false;
        i += seq.length;
        matchedVowel = true;
        break;
      }
    }
    if (matchedVowel) continue;

    // Pass through any other character
    result += lower[i];
    prevWasConsonant = false;
    i++;
  }

  return result;
}

/**
 * Normalize and ensure text has both Devanagari and IAST forms
 * @param {string} text - Input in either script
 * @returns {{ devanagari: string, iast: string }}
 */
export function ensureBothScripts(text) {
  if (!text) return { devanagari: '', iast: '' };

  // Remove common punctuation from speech transcripts
  const cleaned = text.replace(/[.,?!:;\-_"'\(\)]/g, '').trim();
  if (!cleaned) return { devanagari: '', iast: '' };

  const hasDevanagari = /[\u0900-\u097F]/.test(cleaned);

  if (hasDevanagari) {
    let dev = cleaned;
    // Check if whole word or normalized form exists in map
    if (COMMON_DEVANAGARI_NORM[dev]) {
      dev = COMMON_DEVANAGARI_NORM[dev];
    }
    return {
      devanagari: dev,
      iast: toIAST(dev),
    };
  } else {
    const dev = toDevanagari(cleaned);
    const normalizedDev = COMMON_DEVANAGARI_NORM[dev] || dev;
    return {
      devanagari: normalizedDev,
      iast: toIAST(normalizedDev) || cleaned.toLowerCase(),
    };
  }
}

