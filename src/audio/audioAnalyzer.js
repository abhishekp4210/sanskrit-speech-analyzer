/**
 * AudioAnalyzer — Acoustic feature extraction
 * Performs pitch detection, formant estimation (LPC), energy analysis,
 * and spectral feature extraction for articulatory mapping.
 */
export class AudioAnalyzer {
  constructor() {
    this.sampleRate = 44100;
    this.sessionFrames = [];
    this.peakRMS = 0;
    this.bestVoicedFeatures = null;
  }

  /**
   * Set the sample rate (call after AudioContext is created)
   */
  setSampleRate(rate) {
    this.sampleRate = rate;
  }

  /**
   * Reset session feature accumulator
   */
  resetSession() {
    this.sessionFrames = [];
    this.peakRMS = 0;
    this.bestVoicedFeatures = null;
  }

  /**
   * Extract all acoustic features from audio data
   * @param {Float32Array} timeDomainData
   * @param {Uint8Array} frequencyData
   * @returns {Object} Acoustic features
   */
  analyze(timeDomainData, frequencyData) {
    const rms = this._calculateRMS(timeDomainData);
    const pitch = this._detectPitch(timeDomainData);
    const formants = this._estimateFormants(timeDomainData);
    const spectralCentroid = this._spectralCentroid(frequencyData);
    const spectralTilt = this._spectralTilt(frequencyData);
    const zeroCrossingRate = this._zeroCrossingRate(timeDomainData);
    const isVoiced = rms > 0.012 && pitch > 60;

    const frame = {
      rms,
      rmsDb: rms > 0 ? 20 * Math.log10(rms) : -Infinity,
      pitch,
      formants,
      spectralCentroid,
      spectralTilt,
      zeroCrossingRate,
      isVoiced,
      timestamp: Date.now(),
    };

    // Track best frame during session
    if (rms > this.peakRMS) {
      this.peakRMS = rms;
    }

    if (isVoiced && (!this.bestVoicedFeatures || rms > this.bestVoicedFeatures.rms)) {
      this.bestVoicedFeatures = { ...frame };
    }

    if (isVoiced || rms > 0.01) {
      this.sessionFrames.push(frame);
      // Keep buffer bounded
      if (this.sessionFrames.length > 200) {
        this.sessionFrames.shift();
      }
    }

    return frame;
  }

  /**
   * Get synthesized summary of features recorded across the entire session
   */
  getSessionSummary() {
    if (this.bestVoicedFeatures) {
      // Calculate average pitch across voiced frames
      const voiced = this.sessionFrames.filter((f) => f.isVoiced && f.pitch > 60);
      let avgPitch = this.bestVoicedFeatures.pitch;
      if (voiced.length > 0) {
        const sumPitch = voiced.reduce((acc, f) => acc + f.pitch, 0);
        avgPitch = sumPitch / voiced.length;
      }

      return {
        ...this.bestVoicedFeatures,
        pitch: avgPitch,
        rms: Math.max(this.peakRMS, this.bestVoicedFeatures.rms),
        rmsDb: 20 * Math.log10(Math.max(this.peakRMS, this.bestVoicedFeatures.rms)),
      };
    }

    if (this.sessionFrames.length > 0) {
      const last = this.sessionFrames[this.sessionFrames.length - 1];
      return {
        ...last,
        rms: Math.max(this.peakRMS, last.rms),
        rmsDb: 20 * Math.log10(Math.max(this.peakRMS, last.rms)),
      };
    }

    return {
      rms: 0.04,
      rmsDb: -28,
      pitch: 140,
      formants: [{ frequency: 550 }, { frequency: 1600 }],
      spectralCentroid: 1100,
      spectralTilt: 25,
      zeroCrossingRate: 0.08,
      isVoiced: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate RMS energy
   */
  _calculateRMS(data) {
    if (!data || data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Pitch detection using autocorrelation method
   * Returns fundamental frequency (F0) in Hz
   */
  _detectPitch(data) {
    if (!data || data.length === 0) return 0;

    const bufferSize = data.length;
    const correlations = new Float32Array(bufferSize);

    // Autocorrelation
    for (let lag = 0; lag < bufferSize; lag++) {
      let sum = 0;
      for (let i = 0; i < bufferSize - lag; i++) {
        sum += data[i] * data[i + lag];
      }
      correlations[lag] = sum;
    }

    // Find the first peak after the initial decline
    // Skip lag=0 (always max) and very small lags (high frequency noise)
    const minLag = Math.floor(this.sampleRate / 500); // Max F0 = 500 Hz
    const maxLag = Math.floor(this.sampleRate / 60);  // Min F0 = 60 Hz

    let maxCorrelation = -Infinity;
    let bestLag = 0;

    // Find the first significant dip
    let foundDip = false;
    for (let lag = 1; lag < maxLag; lag++) {
      if (correlations[lag] < correlations[lag - 1]) {
        foundDip = true;
      }
      if (foundDip && lag >= minLag && correlations[lag] > maxCorrelation) {
        maxCorrelation = correlations[lag];
        bestLag = lag;
      }
    }

    if (bestLag === 0 || maxCorrelation < correlations[0] * 0.3) {
      return 0; // No clear pitch detected
    }

    // Parabolic interpolation for sub-sample accuracy
    const y1 = correlations[bestLag - 1] || 0;
    const y2 = correlations[bestLag];
    const y3 = correlations[bestLag + 1] || 0;
    const refinedLag = bestLag + (y3 - y1) / (2 * (2 * y2 - y1 - y3) || 1);

    return this.sampleRate / refinedLag;
  }

  /**
   * Formant estimation using Linear Predictive Coding (LPC)
   * Uses Levinson-Durbin recursion and root finding
   * @returns {Array} Array of {frequency, bandwidth} objects
   */
  _estimateFormants(data) {
    if (!data || data.length < 64) return [];

    // Pre-emphasis filter (boost high frequencies)
    const preEmphasis = 0.97;
    const emphasized = new Float32Array(data.length);
    emphasized[0] = data[0];
    for (let i = 1; i < data.length; i++) {
      emphasized[i] = data[i] - preEmphasis * data[i - 1];
    }

    // Apply Hamming window
    const windowed = this._hammingWindow(emphasized);

    // LPC analysis (order = 2 + sampleRate/1000)
    const order = Math.min(Math.floor(2 + this.sampleRate / 1000), 16);
    const lpcCoeffs = this._levinsonDurbin(windowed, order);

    if (!lpcCoeffs) return [];

    // Find roots of LPC polynomial
    const roots = this._findLPCRoots(lpcCoeffs);

    // Convert roots to formant frequencies
    const formants = [];
    for (const root of roots) {
      const { re, im } = root;
      // Only consider roots with positive imaginary part (upper half-plane)
      if (im <= 0) continue;

      const frequency = Math.atan2(im, re) * (this.sampleRate / (2 * Math.PI));
      const bandwidth = -Math.log(Math.sqrt(re * re + im * im)) * (this.sampleRate / Math.PI);

      // Filter: valid formant range (200-5000 Hz) and reasonable bandwidth
      if (frequency > 150 && frequency < 5500 && bandwidth < 500 && bandwidth > 10) {
        formants.push({ frequency: Math.round(frequency), bandwidth: Math.round(bandwidth) });
      }
    }

    // Sort by frequency and return first 4 formants
    formants.sort((a, b) => a.frequency - b.frequency);
    return formants.slice(0, 4);
  }

  /**
   * Apply Hamming window to data
   */
  _hammingWindow(data) {
    const windowed = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      windowed[i] = data[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (data.length - 1)));
    }
    return windowed;
  }

  /**
   * Levinson-Durbin recursion for LPC coefficients
   */
  _levinsonDurbin(data, order) {
    const n = data.length;

    // Calculate autocorrelation
    const r = new Float64Array(order + 1);
    for (let lag = 0; lag <= order; lag++) {
      let sum = 0;
      for (let i = 0; i < n - lag; i++) {
        sum += data[i] * data[i + lag];
      }
      r[lag] = sum;
    }

    if (r[0] === 0) return null;

    // Levinson-Durbin algorithm
    const a = new Float64Array(order + 1);
    const aTemp = new Float64Array(order + 1);
    let error = r[0];

    for (let i = 1; i <= order; i++) {
      let lambda = 0;
      for (let j = 1; j < i; j++) {
        lambda += a[j] * r[i - j];
      }
      lambda = (r[i] - lambda) / error;

      // Update coefficients
      for (let j = 1; j < i; j++) {
        aTemp[j] = a[j] - lambda * a[i - j];
      }
      aTemp[i] = lambda;

      for (let j = 1; j <= i; j++) {
        a[j] = aTemp[j];
      }

      error *= 1 - lambda * lambda;
      if (error <= 0) break;
    }

    return Array.from(a);
  }

  /**
   * Find roots of LPC polynomial using companion matrix method
   * Simplified approach: uses Durand-Kerner method for polynomial root finding
   */
  _findLPCRoots(coeffs) {
    const order = coeffs.length - 1;
    if (order < 2) return [];

    // Build polynomial: 1 - a[1]*z^-1 - a[2]*z^-2 - ...
    // We need to find roots of: z^n - a[1]*z^(n-1) - a[2]*z^(n-2) - ... - a[n]
    const poly = new Float64Array(order + 1);
    poly[0] = 1;
    for (let i = 1; i <= order; i++) {
      poly[i] = -coeffs[i];
    }

    // Durand-Kerner method for root finding
    const roots = [];
    const maxIter = 100;

    // Initialize with evenly spaced points on unit circle
    for (let i = 0; i < order; i++) {
      const angle = (2 * Math.PI * i) / order + 0.1;
      const r = 0.9;
      roots.push({ re: r * Math.cos(angle), im: r * Math.sin(angle) });
    }

    for (let iter = 0; iter < maxIter; iter++) {
      let maxDelta = 0;

      for (let i = 0; i < order; i++) {
        // Evaluate polynomial at roots[i]
        const pVal = this._evalPoly(poly, roots[i]);

        // Calculate product of (roots[i] - roots[j]) for j != i
        let prodRe = 1, prodIm = 0;
        for (let j = 0; j < order; j++) {
          if (i === j) continue;
          const diffRe = roots[i].re - roots[j].re;
          const diffIm = roots[i].im - roots[j].im;
          const newRe = prodRe * diffRe - prodIm * diffIm;
          const newIm = prodRe * diffIm + prodIm * diffRe;
          prodRe = newRe;
          prodIm = newIm;
        }

        // Divide pVal by product
        const denom = prodRe * prodRe + prodIm * prodIm;
        if (denom < 1e-30) continue;
        const deltaRe = (pVal.re * prodRe + pVal.im * prodIm) / denom;
        const deltaIm = (pVal.im * prodRe - pVal.re * prodIm) / denom;

        roots[i].re -= deltaRe;
        roots[i].im -= deltaIm;

        const delta = Math.sqrt(deltaRe * deltaRe + deltaIm * deltaIm);
        maxDelta = Math.max(maxDelta, delta);
      }

      if (maxDelta < 1e-8) break;
    }

    return roots;
  }

  /**
   * Evaluate polynomial at complex point z
   */
  _evalPoly(poly, z) {
    let re = 0, im = 0;
    let zPowRe = 1, zPowIm = 0;

    // poly[0] + poly[1]*z + poly[2]*z^2 + ...
    // But our polynomial is: z^n + poly[1]*z^(n-1) + ... + poly[n]
    // Evaluate using Horner's method
    const n = poly.length;
    re = poly[0];
    im = 0;
    for (let i = 1; i < n; i++) {
      const newRe = re * z.re - im * z.im + poly[i];
      const newIm = re * z.im + im * z.re;
      re = newRe;
      im = newIm;
    }

    return { re, im };
  }

  /**
   * Calculate spectral centroid (center of mass of spectrum)
   * Higher centroid → brighter sound (sibilants, unvoiced)
   * Lower centroid → darker sound (vowels, nasals)
   */
  _spectralCentroid(frequencyData) {
    if (!frequencyData || frequencyData.length === 0) return 0;

    let weightedSum = 0;
    let totalEnergy = 0;
    const binWidth = this.sampleRate / (2 * frequencyData.length);

    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = frequencyData[i];
      const frequency = i * binWidth;
      weightedSum += frequency * magnitude;
      totalEnergy += magnitude;
    }

    return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
  }

  /**
   * Calculate spectral tilt (slope of spectrum)
   * Positive tilt → more energy in lower frequencies (voiced sounds)
   * Negative tilt → more energy in higher frequencies (fricatives)
   */
  _spectralTilt(frequencyData) {
    if (!frequencyData || frequencyData.length < 10) return 0;

    const halfPoint = Math.floor(frequencyData.length / 2);
    let lowEnergy = 0;
    let highEnergy = 0;

    for (let i = 0; i < halfPoint; i++) {
      lowEnergy += frequencyData[i];
    }
    for (let i = halfPoint; i < frequencyData.length; i++) {
      highEnergy += frequencyData[i];
    }

    lowEnergy /= halfPoint;
    highEnergy /= (frequencyData.length - halfPoint);

    if (highEnergy === 0) return 100;
    return (lowEnergy - highEnergy) / (lowEnergy + highEnergy) * 100;
  }

  /**
   * Calculate zero-crossing rate
   * High ZCR → unvoiced/fricative sounds
   * Low ZCR → voiced sounds
   */
  _zeroCrossingRate(data) {
    if (!data || data.length < 2) return 0;
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0 && data[i - 1] < 0) || (data[i] < 0 && data[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / data.length;
  }
}
