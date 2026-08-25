/**
 * PhoneticAnalyzer — Maps acoustic features to Sanskrit phonemes
 * Uses formant patterns, spectral characteristics, and the Varnamala knowledge base
 * to identify phonemes and their articulatory properties.
 */
import { VARNAMALA, PHONEME_TYPE, findByDevanagari, decomposeWord } from './varnamala.js';
import { ensureBothScripts } from './transliterator.js';

export class PhoneticAnalyzer {
  constructor() {
    this.lastAnalysis = null;
    this.analysisHistory = [];
  }

  /**
   * Analyze a detected word and its acoustic features
   * @param {string} detectedWord - Devanagari or IAST text
   * @param {Object} acousticFeatures - From AudioAnalyzer
   * @returns {Object} Complete analysis result
   */
  analyzeWord(detectedWord, acousticFeatures) {
    const scripts = ensureBothScripts(detectedWord);
    const canonicalDevanagari = scripts.devanagari || detectedWord;
    const phonemes = decomposeWord(canonicalDevanagari);
    const phonemeAnalyses = phonemes.map((phoneme, index) => 
      this._analyzePhoneme(phoneme, acousticFeatures, index, phonemes.length)
    );

    // Calculate overall confidence
    const wordConfidence = this._calculateWordConfidence(canonicalDevanagari, acousticFeatures);
    const articulationConfidence = this._calculateArticulationConfidence(phonemeAnalyses, acousticFeatures);

    const result = {
      word: canonicalDevanagari,
      iast: scripts.iast,
      phonemes: phonemeAnalyses,
      confidence: {
        word: wordConfidence,
        articulation: articulationConfidence,
      },
      acousticSummary: this._generateAcousticSummary(acousticFeatures),
      notes: this._generateNotes(phonemeAnalyses, acousticFeatures),
      timestamp: Date.now(),
    };

    this.lastAnalysis = result;
    this.analysisHistory.push(result);
    return result;
  }

  /**
   * Analyze a single phoneme with its articulatory properties
   */
  _analyzePhoneme(phoneme, acousticFeatures, position, totalPhonemes) {
    const sthana = phoneme.sthana;
    const matchScore = this._calculateAcousticMatch(phoneme, acousticFeatures);

    return {
      devanagari: phoneme.devanagari,
      iast: phoneme.iast,
      ipa: phoneme.ipa,
      type: phoneme.type,
      typeLabel: this._getTypeLabel(phoneme.type),
      varga: phoneme.varga || null,
      sthana: {
        id: sthana.id,
        sanskrit: sthana.sanskrit,
        english: sthana.english,
        bodyPart: sthana.bodyPart,
        articulationPoint: sthana.articulationPoint,
        description: sthana.description,
        color: sthana.color,
        badgeClass: sthana.badgeClass,
      },
      voicing: phoneme.voicing || 'voiced',
      aspiration: phoneme.aspiration || null,
      nasal: phoneme.nasal || false,
      description: phoneme.description,
      acousticMatch: matchScore,
      position,
    };
  }

  /**
   * Calculate how well acoustic features match expected phoneme properties
   */
  _calculateAcousticMatch(phoneme, features) {
    if (!features || !features.isVoiced) return 60; // Base score when no strong signal

    let score = 70; // Base score
    const hints = phoneme.acousticHints;
    if (!hints) return score;

    // Check formant match for vowels
    if (phoneme.type === PHONEME_TYPE.SVARA && features.formants && features.formants.length >= 2) {
      const f1 = features.formants[0]?.frequency;
      const f2 = features.formants[1]?.frequency;

      if (hints.f1 && f1) {
        if (f1 >= hints.f1[0] && f1 <= hints.f1[1]) {
          score += 10;
        } else {
          const dist = Math.min(Math.abs(f1 - hints.f1[0]), Math.abs(f1 - hints.f1[1]));
          score -= Math.min(dist / 50, 10);
        }
      }

      if (hints.f2 && f2) {
        if (f2 >= hints.f2[0] && f2 <= hints.f2[1]) {
          score += 10;
        } else {
          const dist = Math.min(Math.abs(f2 - hints.f2[0]), Math.abs(f2 - hints.f2[1]));
          score -= Math.min(dist / 100, 10);
        }
      }
    }

    // Check voicing match
    if (phoneme.voicing === 'voiced' && features.isVoiced) {
      score += 5;
    } else if (phoneme.voicing === 'unvoiced' && !features.isVoiced) {
      score += 5;
    }

    // Check spectral tilt for consonant type
    if (features.spectralTilt !== undefined) {
      if (hints.spectralTilt === 'steep-positive' && features.spectralTilt > 30) score += 5;
      if (hints.spectralTilt === 'rising' && features.spectralTilt < -10) score += 5;
      if (hints.spectralTilt === 'flat' && Math.abs(features.spectralTilt) < 20) score += 5;
    }

    // Check ZCR for fricatives
    if (hints.zcr === 'high' && features.zeroCrossingRate > 0.3) score += 5;
    if (hints.zcr === 'very-high' && features.zeroCrossingRate > 0.4) score += 5;

    return Math.min(Math.max(Math.round(score), 40), 99);
  }

  /**
   * Calculate word detection confidence
   */
  _calculateWordConfidence(word, features) {
    let confidence = 65; // Base confidence for speech recognition result

    if (!features) return confidence;

    // Higher RMS → clearer signal → higher confidence
    if (features.rms > 0.05) confidence += 10;
    if (features.rms > 0.1) confidence += 5;

    // Voice activity detected
    if (features.isVoiced) confidence += 5;

    // Good pitch detection
    if (features.pitch > 80 && features.pitch < 400) confidence += 5;

    // Formants detected
    if (features.formants && features.formants.length >= 2) confidence += 5;

    // Word length bonus (longer words → more data)
    if (word.length > 2) confidence += 3;
    if (word.length > 4) confidence += 2;

    return Math.min(Math.round(confidence), 95);
  }

  /**
   * Calculate articulatory analysis confidence
   */
  _calculateArticulationConfidence(phonemeAnalyses, features) {
    if (phonemeAnalyses.length === 0) return 50;

    // Articulatory classification is based on the knowledge base, so it's
    // inherently high confidence IF we correctly identified the phoneme
    let baseConfidence = 85; // Knowledge-base classification is reliable

    // Average the acoustic match scores
    const avgMatch = phonemeAnalyses.reduce((sum, p) => sum + p.acousticMatch, 0) / phonemeAnalyses.length;
    
    // Weight: 60% knowledge-base, 40% acoustic match
    let confidence = baseConfidence * 0.6 + avgMatch * 0.4;

    // Signal quality adjustments
    if (features && features.rms > 0.05) confidence += 3;
    if (features && features.isVoiced) confidence += 2;

    return Math.min(Math.round(confidence), 98);
  }

  /**
   * Generate acoustic summary observations
   */
  _generateAcousticSummary(features) {
    if (!features) return {};

    return {
      pitch: features.pitch ? `${Math.round(features.pitch)} Hz` : 'Not detected',
      energy: features.rms ? `${(features.rms * 100).toFixed(1)}% (${features.rmsDb?.toFixed(1)} dB)` : 'Silent',
      spectralCentroid: features.spectralCentroid ? `${Math.round(features.spectralCentroid)} Hz` : 'N/A',
      formants: features.formants
        ? features.formants.map((f, i) => `F${i + 1}: ${f.frequency} Hz`).join(', ')
        : 'Not extracted',
      voiceActivity: features.isVoiced ? 'Voiced signal detected' : 'Unvoiced or silent',
    };
  }

  /**
   * Generate human-readable notes/observations
   */
  _generateNotes(phonemeAnalyses, features) {
    const notes = [];

    if (phonemeAnalyses.length === 0) {
      notes.push('No phonemes could be identified in the detected word.');
      return notes;
    }

    // Count articulation places
    const sthanaCount = {};
    phonemeAnalyses.forEach((p) => {
      const key = p.sthana.english;
      sthanaCount[key] = (sthanaCount[key] || 0) + 1;
    });

    const dominantSthana = Object.entries(sthanaCount).sort((a, b) => b[1] - a[1])[0];
    if (dominantSthana) {
      notes.push(`Dominant articulation region: ${dominantSthana[0]} (${dominantSthana[1]} of ${phonemeAnalyses.length} phonemes)`);
    }

    // Note interesting phonetic features
    const hasRetroflex = phonemeAnalyses.some((p) => p.sthana.id === 'murdhanya');
    if (hasRetroflex) {
      notes.push('Contains retroflex sounds (मूर्धन्य) — a distinctive feature of Sanskrit requiring tongue retroflexion.');
    }

    const hasAspirated = phonemeAnalyses.some((p) => p.aspiration === 'aspirated');
    if (hasAspirated) {
      notes.push('Contains aspirated consonants (महाप्राण) — produced with an additional burst of breath.');
    }

    const hasNasal = phonemeAnalyses.some((p) => p.nasal);
    if (hasNasal) {
      notes.push('Contains nasal sounds — air is channeled through the nasal cavity by lowering the velum.');
    }

    // Acoustic quality notes
    if (features) {
      if (features.rms > 0.1) {
        notes.push('Clear, strong audio signal captured — high acoustic confidence.');
      } else if (features.rms > 0.03) {
        notes.push('Moderate audio signal. Speak closer to the microphone for better analysis.');
      } else if (features.rms > 0) {
        notes.push('Weak audio signal detected. Please speak louder or move closer to the microphone.');
      }

      if (features.pitch > 0) {
        if (features.pitch < 150) {
          notes.push(`Fundamental frequency: ${Math.round(features.pitch)} Hz — typical of a male voice range.`);
        } else if (features.pitch < 250) {
          notes.push(`Fundamental frequency: ${Math.round(features.pitch)} Hz — in the mid-voice range.`);
        } else {
          notes.push(`Fundamental frequency: ${Math.round(features.pitch)} Hz — typical of a female or child voice range.`);
        }
      }
    }

    return notes;
  }

  /**
   * Get human-readable label for phoneme type
   */
  _getTypeLabel(type) {
    const labels = {
      [PHONEME_TYPE.SVARA]: 'Vowel (स्वर)',
      [PHONEME_TYPE.SPARSHA]: 'Stop Consonant (स्पर्श)',
      [PHONEME_TYPE.ANTASTHA]: 'Semivowel (अन्तस्थ)',
      [PHONEME_TYPE.USHMAN]: 'Sibilant/Fricative (ऊष्मन्)',
      [PHONEME_TYPE.AYOGAVAHA]: 'Dependent Sound (अयोगवाह)',
    };
    return labels[type] || type;
  }

  /**
   * Identify the most likely vowel from formant values alone
   * (Used when speech recognition isn't available)
   */
  identifyVowelFromFormants(f1, f2) {
    const vowels = VARNAMALA.filter((p) => p.type === PHONEME_TYPE.SVARA && p.acousticHints?.f1);
    let bestMatch = null;
    let bestScore = Infinity;

    for (const vowel of vowels) {
      const hints = vowel.acousticHints;
      const f1Mid = (hints.f1[0] + hints.f1[1]) / 2;
      const f2Mid = (hints.f2[0] + hints.f2[1]) / 2;
      const dist = Math.sqrt(Math.pow(f1 - f1Mid, 2) + Math.pow(f2 - f2Mid, 2));

      if (dist < bestScore) {
        bestScore = dist;
        bestMatch = vowel;
      }
    }

    return bestMatch;
  }
}
