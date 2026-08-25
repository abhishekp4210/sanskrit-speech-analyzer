/**
 * Varnamala — Complete Sanskrit Phonetics Knowledge Base
 * Based on classical Shiksha Shastra (शिक्षा शास्त्र)
 *
 * Every phoneme is classified by:
 *   - Sthāna (स्थान) — Place of articulation
 *   - Prayatna (प्रयत्न) — Manner of articulation
 *   - Ghosha (घोष) — Voicing
 *   - Prāṇa (प्राण) — Aspiration
 */

// ── Sthāna (Places of Articulation) ──────────────────────
export const STHANA = {
  KANTHYA: {
    id: 'kanthya',
    sanskrit: 'कण्ठ्य',
    english: 'Velar / Guttural',
    bodyPart: 'Throat (Kaṇṭha)',
    articulationPoint: 'Back of tongue against the soft palate (velum)',
    description: 'Sound produced deep in the throat where the base of the tongue contacts or approaches the soft palate (velum). The throat cavity acts as the primary resonator.',
    color: 'hsl(0, 70%, 65%)',
    badgeClass: 'badge-kanthya',
  },
  TALAVYA: {
    id: 'talavya',
    sanskrit: 'तालव्य',
    english: 'Palatal',
    bodyPart: 'Hard Palate (Tālu)',
    articulationPoint: 'Blade of tongue raised toward the hard palate',
    description: 'Sound produced when the blade or middle of the tongue rises toward the hard palate. The tongue body creates a narrow channel or complete closure at the palatal region.',
    color: 'hsl(270, 70%, 70%)',
    badgeClass: 'badge-talavya',
  },
  MURDHANYA: {
    id: 'murdhanya',
    sanskrit: 'मूर्धन्य',
    english: 'Retroflex / Cerebral',
    bodyPart: 'Roof of Mouth (Mūrdhan)',
    articulationPoint: 'Tip of tongue curled back to touch the roof of mouth',
    description: 'Sound produced by curling the tongue tip backward (retroflexion) so it contacts the alveolar ridge or the area just behind it. Unique to Sanskrit and Indian languages.',
    color: 'hsl(200, 70%, 65%)',
    badgeClass: 'badge-murdhanya',
  },
  DANTYA: {
    id: 'dantya',
    sanskrit: 'दन्त्य',
    english: 'Dental',
    bodyPart: 'Teeth (Danta)',
    articulationPoint: 'Tongue tip touching or approaching the upper front teeth',
    description: 'Sound produced when the tongue tip makes contact with the back surface of the upper front teeth. More forward than English alveolar sounds.',
    color: 'hsl(160, 70%, 55%)',
    badgeClass: 'badge-dantya',
  },
  OSHTHYA: {
    id: 'oshthya',
    sanskrit: 'ओष्ठ्य',
    english: 'Labial',
    bodyPart: 'Lips (Oṣṭha)',
    articulationPoint: 'Both lips coming together or rounding',
    description: 'Sound produced by bringing both lips together (bilabial closure) or rounding them. The lip position shapes the oral cavity to produce distinctive resonance.',
    color: 'hsl(38, 92%, 60%)',
    badgeClass: 'badge-oshthya',
  },
  NASIKYA: {
    id: 'nasikya',
    sanskrit: 'नासिक्य',
    english: 'Nasal',
    bodyPart: 'Nasal Cavity (Nāsikā)',
    articulationPoint: 'Airflow directed through the nasal passage',
    description: 'Sound produced with the velum (soft palate) lowered, allowing air to flow through the nasal cavity. Each varga nasal also has its own oral place of articulation.',
    color: 'hsl(320, 60%, 65%)',
    badgeClass: 'badge-nasikya',
  },
  KANTHA_TALU: {
    id: 'kantha-talu',
    sanskrit: 'कण्ठतालव्य',
    english: 'Velar-Palatal',
    bodyPart: 'Throat & Palate (Kaṇṭha-Tālu)',
    articulationPoint: 'Dual articulation: throat resonance with palatal tongue position',
    description: 'Compound sound originating from both the throat and the hard palate. The tongue body rises toward the palate while the throat contributes resonance — producing the diphthongal vowels ए and ऐ.',
    color: 'hsl(330, 50%, 65%)',
    badgeClass: 'badge-kantha-talu',
  },
  KANTHA_OSHTHA: {
    id: 'kantha-oshtha',
    sanskrit: 'कण्ठोष्ठ्य',
    english: 'Velar-Labial',
    bodyPart: 'Throat & Lips (Kaṇṭha-Oṣṭha)',
    articulationPoint: 'Dual articulation: throat resonance with lip rounding',
    description: 'Compound sound originating from both the throat and the lips. The lips round while the throat provides back resonance — producing the diphthongal vowels ओ and औ.',
    color: 'hsl(20, 80%, 60%)',
    badgeClass: 'badge-kantha-oshtha',
  },
  DANTA_OSHTHA: {
    id: 'danta-oshtha',
    sanskrit: 'दन्तोष्ठ्य',
    english: 'Labio-dental',
    bodyPart: 'Teeth & Lips (Danta-Oṣṭha)',
    articulationPoint: 'Lower lip approaches upper teeth',
    description: 'Sound produced with the lower lip approaching or lightly touching the upper teeth, combined with airflow — specifically the semivowel व (va).',
    color: 'hsl(50, 80%, 55%)',
    badgeClass: 'badge-danta-oshtha',
  },
};

// ── Phoneme Types ─────────────────────────────────────────
export const PHONEME_TYPE = {
  SVARA: 'svara',           // Vowels
  SPARSHA: 'sparsha',       // Stop consonants
  ANTASTHA: 'antastha',     // Semivowels
  USHMAN: 'ushman',         // Sibilants/Fricatives
  AYOGAVAHA: 'ayogavaha',   // Anusvara, Visarga
};

// ── Complete Varnamala Database ────────────────────────────
export const VARNAMALA = [
  // ═══════════════════════════════════════════════════════
  // SVARAS (Vowels / स्वर)
  // ═══════════════════════════════════════════════════════
  {
    devanagari: 'अ', iast: 'a', ipa: 'ə',
    type: PHONEME_TYPE.SVARA,
    subtype: 'hrasva', // short
    sthana: STHANA.KANTHYA,
    voicing: 'voiced',
    description: 'Short open central/back vowel. The most fundamental vowel in Sanskrit — the default inherent vowel of every consonant.',
    acousticHints: { f1: [500, 700], f2: [1000, 1500], spectralTilt: 'steep-positive' },
  },
  {
    devanagari: 'आ', iast: 'ā', ipa: 'aː',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha', // long
    sthana: STHANA.KANTHYA,
    voicing: 'voiced',
    description: 'Long open central vowel. Lengthened version of अ with the jaw fully lowered and the throat wide open.',
    acousticHints: { f1: [600, 800], f2: [1000, 1500], spectralTilt: 'steep-positive' },
  },
  {
    devanagari: 'इ', iast: 'i', ipa: 'i',
    type: PHONEME_TYPE.SVARA,
    subtype: 'hrasva',
    sthana: STHANA.TALAVYA,
    voicing: 'voiced',
    description: 'Short close front unrounded vowel. Tongue blade raised high toward the hard palate with spread lips.',
    acousticHints: { f1: [250, 350], f2: [2000, 2800], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ई', iast: 'ī', ipa: 'iː',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.TALAVYA,
    voicing: 'voiced',
    description: 'Long close front unrounded vowel. Extended duration version of इ with sustained high tongue position.',
    acousticHints: { f1: [250, 350], f2: [2000, 2800], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'उ', iast: 'u', ipa: 'u',
    type: PHONEME_TYPE.SVARA,
    subtype: 'hrasva',
    sthana: STHANA.OSHTHYA,
    voicing: 'voiced',
    description: 'Short close back rounded vowel. Lips are rounded and protruded, tongue body is pulled back and raised toward the velum.',
    acousticHints: { f1: [250, 350], f2: [600, 1000], spectralTilt: 'steep-positive' },
  },
  {
    devanagari: 'ऊ', iast: 'ū', ipa: 'uː',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.OSHTHYA,
    voicing: 'voiced',
    description: 'Long close back rounded vowel. Extended duration version of उ with sustained lip rounding.',
    acousticHints: { f1: [250, 350], f2: [600, 1000], spectralTilt: 'steep-positive' },
  },
  {
    devanagari: 'ऋ', iast: 'ṛ', ipa: 'ɻ̩',
    type: PHONEME_TYPE.SVARA,
    subtype: 'hrasva',
    sthana: STHANA.MURDHANYA,
    voicing: 'voiced',
    description: 'Short vocalic r. Tongue tip curled back (retroflex) functioning as a syllabic vowel. Unique to Sanskrit phonology.',
    acousticHints: { f1: [350, 500], f2: [1200, 1800], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ॠ', iast: 'ṝ', ipa: 'ɻ̩ː',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.MURDHANYA,
    voicing: 'voiced',
    description: 'Long vocalic r. Extended version of ऋ. Extremely rare in actual usage.',
    acousticHints: { f1: [350, 500], f2: [1200, 1800], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ए', iast: 'e', ipa: 'eː',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.KANTHA_TALU,
    voicing: 'voiced',
    description: 'Long close-mid front vowel (diphthongal origin: a+i). Produced with combined throat and palatal articulation.',
    acousticHints: { f1: [350, 500], f2: [1800, 2400], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ऐ', iast: 'ai', ipa: 'əi',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.KANTHA_TALU,
    voicing: 'voiced',
    description: 'Diphthong (a+i glide). Begins at an open throat position and glides toward a palatal position. Longer than ए.',
    acousticHints: { f1: [400, 600], f2: [1600, 2400], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ओ', iast: 'o', ipa: 'oː',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.KANTHA_OSHTHA,
    voicing: 'voiced',
    description: 'Long close-mid back rounded vowel (diphthongal origin: a+u). Produced with combined throat resonance and lip rounding.',
    acousticHints: { f1: [350, 500], f2: [700, 1100], spectralTilt: 'steep-positive' },
  },
  {
    devanagari: 'औ', iast: 'au', ipa: 'əu',
    type: PHONEME_TYPE.SVARA,
    subtype: 'dirgha',
    sthana: STHANA.KANTHA_OSHTHA,
    voicing: 'voiced',
    description: 'Diphthong (a+u glide). Begins at an open throat position and glides toward a labial (rounded) position.',
    acousticHints: { f1: [400, 600], f2: [700, 1200], spectralTilt: 'steep-positive' },
  },

  // ═══════════════════════════════════════════════════════
  // SPARSHA VYANJANA (Stop Consonants / स्पर्श व्यञ्जन)
  // ═══════════════════════════════════════════════════════

  // ── Ka-varga (कवर्ग) — Velar ──
  {
    devanagari: 'क', iast: 'ka', ipa: 'k',
    type: PHONEME_TYPE.SPARSHA, varga: 'ka',
    sthana: STHANA.KANTHYA,
    voicing: 'unvoiced', aspiration: 'unaspirated',
    description: 'Voiceless unaspirated velar stop. Back of tongue presses firmly against the soft palate, fully blocking airflow, then releases.',
    acousticHints: { burstFreq: [1500, 3500], vot: [10, 30], spectralTilt: 'flat' },
  },
  {
    devanagari: 'ख', iast: 'kha', ipa: 'kʰ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ka',
    sthana: STHANA.KANTHYA,
    voicing: 'unvoiced', aspiration: 'aspirated',
    description: 'Voiceless aspirated velar stop. Same closure as क but with a strong burst of breath (aspiration) upon release.',
    acousticHints: { burstFreq: [1500, 3500], vot: [40, 80], spectralTilt: 'flat' },
  },
  {
    devanagari: 'ग', iast: 'ga', ipa: 'ɡ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ka',
    sthana: STHANA.KANTHYA,
    voicing: 'voiced', aspiration: 'unaspirated',
    description: 'Voiced unaspirated velar stop. Vocal cords vibrate as the back of tongue contacts the velum.',
    acousticHints: { burstFreq: [1000, 3000], vot: [-80, 0], spectralTilt: 'positive' },
  },
  {
    devanagari: 'घ', iast: 'gha', ipa: 'ɡʱ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ka',
    sthana: STHANA.KANTHYA,
    voicing: 'voiced', aspiration: 'aspirated',
    description: 'Voiced aspirated velar stop. Voiced with added breathy release — a challenging sound unique to Indo-Aryan languages.',
    acousticHints: { burstFreq: [1000, 3000], vot: [-80, 20], spectralTilt: 'positive' },
  },
  {
    devanagari: 'ङ', iast: 'ṅa', ipa: 'ŋ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ka',
    sthana: STHANA.KANTHYA,
    voicing: 'voiced', aspiration: 'unaspirated', nasal: true,
    description: 'Velar nasal. Same tongue position as क/ग but with the velum lowered so air escapes through the nose. Similar to "ng" in English "sing".',
    acousticHints: { f1: [250, 350], nasalFormant: [250, 300], spectralTilt: 'steep-positive' },
  },

  // ── Ca-varga (चवर्ग) — Palatal ──
  {
    devanagari: 'च', iast: 'ca', ipa: 'tʃ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ca',
    sthana: STHANA.TALAVYA,
    voicing: 'unvoiced', aspiration: 'unaspirated',
    description: 'Voiceless unaspirated palatal affricate. Blade of tongue contacts the hard palate with a brief fricative release.',
    acousticHints: { burstFreq: [3000, 5000], vot: [15, 35], spectralTilt: 'rising' },
  },
  {
    devanagari: 'छ', iast: 'cha', ipa: 'tʃʰ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ca',
    sthana: STHANA.TALAVYA,
    voicing: 'unvoiced', aspiration: 'aspirated',
    description: 'Voiceless aspirated palatal affricate. Same as च with a strong burst of breath on release.',
    acousticHints: { burstFreq: [3000, 5000], vot: [50, 90], spectralTilt: 'rising' },
  },
  {
    devanagari: 'ज', iast: 'ja', ipa: 'dʒ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ca',
    sthana: STHANA.TALAVYA,
    voicing: 'voiced', aspiration: 'unaspirated',
    description: 'Voiced unaspirated palatal affricate. Vocal cords vibrate as the tongue blade contacts the hard palate.',
    acousticHints: { burstFreq: [2500, 4500], vot: [-80, 0], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'झ', iast: 'jha', ipa: 'dʒʱ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ca',
    sthana: STHANA.TALAVYA,
    voicing: 'voiced', aspiration: 'aspirated',
    description: 'Voiced aspirated palatal affricate. Voiced palatal closure with breathy release.',
    acousticHints: { burstFreq: [2500, 4500], vot: [-80, 20], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ञ', iast: 'ña', ipa: 'ɲ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ca',
    sthana: STHANA.TALAVYA,
    voicing: 'voiced', aspiration: 'unaspirated', nasal: true,
    description: 'Palatal nasal. Tongue blade contacts hard palate with velum lowered for nasal airflow. Like "ny" in "canyon".',
    acousticHints: { f1: [250, 350], nasalFormant: [250, 300], spectralTilt: 'steep-positive' },
  },

  // ── Ṭa-varga (टवर्ग) — Retroflex ──
  {
    devanagari: 'ट', iast: 'ṭa', ipa: 'ʈ',
    type: PHONEME_TYPE.SPARSHA, varga: 'Ta',
    sthana: STHANA.MURDHANYA,
    voicing: 'unvoiced', aspiration: 'unaspirated',
    description: 'Voiceless unaspirated retroflex stop. Tongue tip curls backward to touch the alveolar ridge or hard palate roof.',
    acousticHints: { burstFreq: [2500, 4000], vot: [10, 30], spectralTilt: 'moderate-flat' },
  },
  {
    devanagari: 'ठ', iast: 'ṭha', ipa: 'ʈʰ',
    type: PHONEME_TYPE.SPARSHA, varga: 'Ta',
    sthana: STHANA.MURDHANYA,
    voicing: 'unvoiced', aspiration: 'aspirated',
    description: 'Voiceless aspirated retroflex stop. Retroflex closure with a strong aspirated release.',
    acousticHints: { burstFreq: [2500, 4000], vot: [50, 90], spectralTilt: 'moderate-flat' },
  },
  {
    devanagari: 'ड', iast: 'ḍa', ipa: 'ɖ',
    type: PHONEME_TYPE.SPARSHA, varga: 'Ta',
    sthana: STHANA.MURDHANYA,
    voicing: 'voiced', aspiration: 'unaspirated',
    description: 'Voiced unaspirated retroflex stop. Voiced counterpart of ट with vocal cord vibration.',
    acousticHints: { burstFreq: [2000, 3500], vot: [-80, 0], spectralTilt: 'positive' },
  },
  {
    devanagari: 'ढ', iast: 'ḍha', ipa: 'ɖʱ',
    type: PHONEME_TYPE.SPARSHA, varga: 'Ta',
    sthana: STHANA.MURDHANYA,
    voicing: 'voiced', aspiration: 'aspirated',
    description: 'Voiced aspirated retroflex stop. Voiced retroflex with breathy release.',
    acousticHints: { burstFreq: [2000, 3500], vot: [-80, 20], spectralTilt: 'positive' },
  },
  {
    devanagari: 'ण', iast: 'ṇa', ipa: 'ɳ',
    type: PHONEME_TYPE.SPARSHA, varga: 'Ta',
    sthana: STHANA.MURDHANYA,
    voicing: 'voiced', aspiration: 'unaspirated', nasal: true,
    description: 'Retroflex nasal. Tongue tip curled back with nasal airflow. Important in Sanskrit due to the ṇatva (retroflexion) rules.',
    acousticHints: { f1: [250, 350], nasalFormant: [250, 300], spectralTilt: 'steep-positive' },
  },

  // ── Ta-varga (तवर्ग) — Dental ──
  {
    devanagari: 'त', iast: 'ta', ipa: 't̪',
    type: PHONEME_TYPE.SPARSHA, varga: 'ta',
    sthana: STHANA.DANTYA,
    voicing: 'unvoiced', aspiration: 'unaspirated',
    description: 'Voiceless unaspirated dental stop. Tongue tip firmly touches the back of the upper front teeth. More dental than English "t".',
    acousticHints: { burstFreq: [3500, 5500], vot: [10, 25], spectralTilt: 'flat' },
  },
  {
    devanagari: 'थ', iast: 'tha', ipa: 't̪ʰ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ta',
    sthana: STHANA.DANTYA,
    voicing: 'unvoiced', aspiration: 'aspirated',
    description: 'Voiceless aspirated dental stop. Dental closure with a clear burst of breath upon release.',
    acousticHints: { burstFreq: [3500, 5500], vot: [50, 80], spectralTilt: 'flat' },
  },
  {
    devanagari: 'द', iast: 'da', ipa: 'd̪',
    type: PHONEME_TYPE.SPARSHA, varga: 'ta',
    sthana: STHANA.DANTYA,
    voicing: 'voiced', aspiration: 'unaspirated',
    description: 'Voiced unaspirated dental stop. Vocal cords vibrate as tongue tip contacts upper teeth.',
    acousticHints: { burstFreq: [3000, 5000], vot: [-80, 0], spectralTilt: 'positive' },
  },
  {
    devanagari: 'ध', iast: 'dha', ipa: 'd̪ʱ',
    type: PHONEME_TYPE.SPARSHA, varga: 'ta',
    sthana: STHANA.DANTYA,
    voicing: 'voiced', aspiration: 'aspirated',
    description: 'Voiced aspirated dental stop. Voiced dental closure with breathy release.',
    acousticHints: { burstFreq: [3000, 5000], vot: [-80, 20], spectralTilt: 'positive' },
  },
  {
    devanagari: 'न', iast: 'na', ipa: 'n̪',
    type: PHONEME_TYPE.SPARSHA, varga: 'ta',
    sthana: STHANA.DANTYA,
    voicing: 'voiced', aspiration: 'unaspirated', nasal: true,
    description: 'Dental nasal. Tongue tip at upper teeth with nasal airflow. The most common nasal in Sanskrit.',
    acousticHints: { f1: [250, 350], nasalFormant: [250, 300], spectralTilt: 'steep-positive' },
  },

  // ── Pa-varga (पवर्ग) — Labial ──
  {
    devanagari: 'प', iast: 'pa', ipa: 'p',
    type: PHONEME_TYPE.SPARSHA, varga: 'pa',
    sthana: STHANA.OSHTHYA,
    voicing: 'unvoiced', aspiration: 'unaspirated',
    description: 'Voiceless unaspirated bilabial stop. Both lips press together to block airflow, then release cleanly.',
    acousticHints: { burstFreq: [500, 1500], vot: [5, 25], spectralTilt: 'falling' },
  },
  {
    devanagari: 'फ', iast: 'pha', ipa: 'pʰ',
    type: PHONEME_TYPE.SPARSHA, varga: 'pa',
    sthana: STHANA.OSHTHYA,
    voicing: 'unvoiced', aspiration: 'aspirated',
    description: 'Voiceless aspirated bilabial stop. Bilabial closure with a strong puff of air on release.',
    acousticHints: { burstFreq: [500, 1500], vot: [40, 80], spectralTilt: 'falling' },
  },
  {
    devanagari: 'ब', iast: 'ba', ipa: 'b',
    type: PHONEME_TYPE.SPARSHA, varga: 'pa',
    sthana: STHANA.OSHTHYA,
    voicing: 'voiced', aspiration: 'unaspirated',
    description: 'Voiced unaspirated bilabial stop. Vocal cords vibrate as both lips close and release.',
    acousticHints: { burstFreq: [500, 1500], vot: [-80, 0], spectralTilt: 'positive' },
  },
  {
    devanagari: 'भ', iast: 'bha', ipa: 'bʱ',
    type: PHONEME_TYPE.SPARSHA, varga: 'pa',
    sthana: STHANA.OSHTHYA,
    voicing: 'voiced', aspiration: 'aspirated',
    description: 'Voiced aspirated bilabial stop. Voiced bilabial closure with breathy release.',
    acousticHints: { burstFreq: [500, 1500], vot: [-80, 20], spectralTilt: 'positive' },
  },
  {
    devanagari: 'म', iast: 'ma', ipa: 'm',
    type: PHONEME_TYPE.SPARSHA, varga: 'pa',
    sthana: STHANA.OSHTHYA,
    voicing: 'voiced', aspiration: 'unaspirated', nasal: true,
    description: 'Bilabial nasal. Both lips close while air is directed through the nasal cavity. The most basic nasal sound.',
    acousticHints: { f1: [250, 350], nasalFormant: [250, 300], spectralTilt: 'steep-positive' },
  },

  // ═══════════════════════════════════════════════════════
  // ANTASTHA (Semivowels / अन्तस्थ)
  // ═══════════════════════════════════════════════════════
  {
    devanagari: 'य', iast: 'ya', ipa: 'j',
    type: PHONEME_TYPE.ANTASTHA,
    sthana: STHANA.TALAVYA,
    voicing: 'voiced',
    description: 'Palatal semivowel (approximant). Tongue position similar to इ but with less constriction, allowing continuous airflow. Like English "y" in "yes".',
    acousticHints: { f1: [250, 350], f2: [2000, 2600], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'र', iast: 'ra', ipa: 'r',
    type: PHONEME_TYPE.ANTASTHA,
    sthana: STHANA.MURDHANYA,
    voicing: 'voiced',
    description: 'Retroflex approximant or trill. Tongue tip vibrates against or approaches the alveolar ridge. May be a single tap or multiple trill depending on context.',
    acousticHints: { f1: [300, 500], f2: [1200, 1800], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'ल', iast: 'la', ipa: 'l̪',
    type: PHONEME_TYPE.ANTASTHA,
    sthana: STHANA.DANTYA,
    voicing: 'voiced',
    description: 'Dental lateral approximant. Tongue tip contacts upper teeth while air flows around the sides of the tongue.',
    acousticHints: { f1: [300, 450], f2: [900, 1400], spectralTilt: 'moderate-positive' },
  },
  {
    devanagari: 'व', iast: 'va', ipa: 'ʋ',
    type: PHONEME_TYPE.ANTASTHA,
    sthana: STHANA.DANTA_OSHTHA,
    voicing: 'voiced',
    description: 'Labio-dental approximant. Lower lip approaches upper teeth with slight rounding. Between English "v" and "w".',
    acousticHints: { f1: [250, 400], f2: [700, 1200], spectralTilt: 'moderate-positive' },
  },

  // ═══════════════════════════════════════════════════════
  // USHMAN (Sibilants & Fricatives / ऊष्मन्)
  // ═══════════════════════════════════════════════════════
  {
    devanagari: 'श', iast: 'śa', ipa: 'ʃ',
    type: PHONEME_TYPE.USHMAN,
    sthana: STHANA.TALAVYA,
    voicing: 'unvoiced',
    description: 'Voiceless palatal sibilant. Tongue blade creates a narrow channel near the hard palate, producing turbulent high-frequency noise. Like English "sh".',
    acousticHints: { spectralPeak: [3000, 6000], spectralTilt: 'rising', zcr: 'high' },
  },
  {
    devanagari: 'ष', iast: 'ṣa', ipa: 'ʂ',
    type: PHONEME_TYPE.USHMAN,
    sthana: STHANA.MURDHANYA,
    voicing: 'unvoiced',
    description: 'Voiceless retroflex sibilant. Tongue tip curled back creating turbulence at the palatal roof. Slightly lower frequency than श.',
    acousticHints: { spectralPeak: [2500, 5000], spectralTilt: 'moderate-rising', zcr: 'high' },
  },
  {
    devanagari: 'स', iast: 'sa', ipa: 's',
    type: PHONEME_TYPE.USHMAN,
    sthana: STHANA.DANTYA,
    voicing: 'unvoiced',
    description: 'Voiceless dental sibilant. Tongue tip near upper teeth creating a high-frequency hissing turbulence. Like English "s".',
    acousticHints: { spectralPeak: [4000, 8000], spectralTilt: 'strongly-rising', zcr: 'very-high' },
  },
  {
    devanagari: 'ह', iast: 'ha', ipa: 'ɦ',
    type: PHONEME_TYPE.USHMAN,
    sthana: STHANA.KANTHYA,
    voicing: 'voiced',
    description: 'Voiced glottal fricative. Air passes through a narrowed glottis with slight vocal cord vibration. A breathy sound from the throat.',
    acousticHints: { spectralPeak: [500, 2000], spectralTilt: 'flat', zcr: 'moderate' },
  },

  // ═══════════════════════════════════════════════════════
  // AYOGAVAHA (Dependent Sounds / अयोगवाह)
  // ═══════════════════════════════════════════════════════
  {
    devanagari: 'ं', iast: 'ṁ', ipa: 'ŋ~m',
    type: PHONEME_TYPE.AYOGAVAHA,
    subtype: 'anusvara',
    sthana: STHANA.NASIKYA,
    voicing: 'voiced',
    description: 'Anusvāra — a nasal sound that assimilates to the place of the following consonant. Represented as a dot above the vowel. Resonates through the nasal cavity.',
    acousticHints: { f1: [250, 350], nasalFormant: [250, 300], spectralTilt: 'steep-positive' },
  },
  {
    devanagari: 'ः', iast: 'ḥ', ipa: 'h',
    type: PHONEME_TYPE.AYOGAVAHA,
    subtype: 'visarga',
    sthana: STHANA.KANTHYA,
    voicing: 'unvoiced',
    description: 'Visarga — a voiceless glottal or post-vocalic aspiration. Appears as two dots after a vowel. An echo-like aspiration of the preceding vowel.',
    acousticHints: { spectralPeak: [500, 2000], spectralTilt: 'flat', zcr: 'moderate' },
  },
];

// ── Matra to Independent Vowel Mapping ───────────────────
const MATRA_TO_VOWEL = {
  '\u093E': 'आ',   // ा
  '\u093F': 'इ',   // ि
  '\u0940': 'ई',   // ी
  '\u0941': 'उ',   // ु
  '\u0942': 'ऊ',   // ू
  '\u0943': 'ऋ',   // ृ
  '\u0944': 'ॠ',   // ॄ
  '\u0962': 'ऌ',   // ॢ
  '\u0963': 'ॡ',   // ॣ
  '\u0947': 'ए',   // े
  '\u0948': 'ऐ',   // ै
  '\u094B': 'ओ',   // ो
  '\u094C': 'औ',   // ौ
};

const VIRAMA = '\u094D'; // ्
const ANUSVARA = '\u0902'; // ं
const VISARGA = '\u0903'; // ः
const CHANDRABINDU = '\u0901'; // ँ

// ── Lookup Helpers ───────────────────────────────────────

/**
 * Find phoneme by Devanagari character
 */
export function findByDevanagari(char) {
  if (!char) return null;
  // Strip matras if needed and find base character
  const stripped = char.replace(/[\u093E-\u094D\u0962\u0963]/g, '');
  return VARNAMALA.find((p) => p.devanagari === char || p.devanagari === stripped);
}

/**
 * Find phoneme by IAST romanization
 */
export function findByIAST(iast) {
  if (!iast) return null;
  const lower = iast.toLowerCase();
  return VARNAMALA.find((p) => p.iast === lower || p.iast === lower + 'a');
}

/**
 * Get all phonemes of a given type
 */
export function getByType(type) {
  return VARNAMALA.filter((p) => p.type === type);
}

/**
 * Get all phonemes at a given Sthana
 */
export function getBySthana(sthanaId) {
  return VARNAMALA.filter((p) => p.sthana.id === sthanaId);
}

/**
 * Get all phonemes in a given varga
 */
export function getByVarga(varga) {
  return VARNAMALA.filter((p) => p.varga === varga);
}

/**
 * Get all vowels
 */
export function getVowels() {
  return VARNAMALA.filter((p) => p.type === PHONEME_TYPE.SVARA);
}

/**
 * Get all consonants
 */
export function getConsonants() {
  return VARNAMALA.filter((p) => p.type !== PHONEME_TYPE.SVARA && p.type !== PHONEME_TYPE.AYOGAVAHA);
}

/**
 * Break a Devanagari string into individual phonemes according to Shiksha Shastra
 * Correctly decomposes matras (vowel signs), virama (halant), anusvara, and inherent 'a' vowels.
 * @param {string} word - Sanskrit word in Devanagari or IAST
 * @returns {Array} Array of phoneme objects
 */
export function decomposeWord(word) {
  if (!word || typeof word !== 'string') return [];

  let devanagariWord = word.trim();
  if (!devanagariWord) return [];

  // Direct check: If input is a single phoneme directly from VARNAMALA
  const exactMatch = VARNAMALA.find((p) => p.devanagari === devanagariWord);
  if (exactMatch) {
    return [exactMatch];
  }

  const phonemes = [];
  const chars = [...devanagariWord];
  const aVowel = VARNAMALA.find((p) => p.devanagari === 'अ');

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // Special: OM (ॐ)
    if (char === 'ॐ') {
      const oVowel = VARNAMALA.find((p) => p.devanagari === 'ओ');
      const anusvara = VARNAMALA.find((p) => p.devanagari === 'ं');
      if (oVowel) phonemes.push(oVowel);
      if (anusvara) phonemes.push(anusvara);
      continue;
    }

    // Anusvara or Visarga or Chandrabindu
    if (char === ANUSVARA || char === VISARGA || char === CHANDRABINDU) {
      const p = VARNAMALA.find((v) => v.devanagari === char || (char === CHANDRABINDU && v.devanagari === 'ं'));
      if (p) phonemes.push(p);
      continue;
    }

    // Direct independent vowel (स्वर)
    const directVowel = VARNAMALA.find((p) => p.type === PHONEME_TYPE.SVARA && p.devanagari === char);
    if (directVowel) {
      phonemes.push(directVowel);
      continue;
    }

    // Consonant (व्यञ्जन)
    const consonant = VARNAMALA.find((p) => p.type !== PHONEME_TYPE.SVARA && p.type !== PHONEME_TYPE.AYOGAVAHA && p.devanagari === char);
    if (consonant) {
      phonemes.push(consonant);

      const nextChar = chars[i + 1];
      if (nextChar === VIRAMA) {
        // Consonant followed by virama (halant) - no vowel attached
        i++; // skip virama
      } else if (nextChar && MATRA_TO_VOWEL[nextChar]) {
        // Consonant followed by matra - add corresponding vowel
        const vowelChar = MATRA_TO_VOWEL[nextChar];
        const attachedVowel = VARNAMALA.find((p) => p.devanagari === vowelChar);
        if (attachedVowel) {
          phonemes.push(attachedVowel);
        }
        i++; // skip matra
      } else {
        // Inherent 'a' (अ) vowel in Sanskrit
        if (aVowel) {
          phonemes.push(aVowel);
        }
      }
      continue;
    }

    // Direct Matra standalone
    if (MATRA_TO_VOWEL[char]) {
      const attachedVowel = VARNAMALA.find((p) => p.devanagari === MATRA_TO_VOWEL[char]);
      if (attachedVowel) {
        phonemes.push(attachedVowel);
      }
      continue;
    }

    // General fallback
    const fallback = findByDevanagari(char);
    if (fallback && !phonemes.includes(fallback)) {
      phonemes.push(fallback);
    }
  }

  return phonemes;
}
