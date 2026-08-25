/**
 * SpeechRecognizer — Web Speech API wrapper for Sanskrit/Hindi/English recognition
 * Uses Hindi (hi-IN) as primary language for Devanagari script, with support for continuous capture.
 */
export class SpeechRecognizer {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.isSupported = false;
    this.listeners = {};
    this.currentLanguage = 'hi-IN';

    // State tracking
    this.interimTranscript = '';
    this.finalTranscript = '';
    this.lastKnownTranscript = '';
    this.latestConfidence = 0.8;
    this.latestAlternatives = [];
    this.shouldKeepListening = false;

    this._init();
  }

  /**
   * Initialize speech recognition
   */
  _init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser.');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();

    // Configuration
    this.recognition.lang = this.currentLanguage;
    this.recognition.continuous = true; // Keep listening continuously until user stops
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 5;

    // Event handlers
    this.recognition.onresult = (event) => {
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        const confidence = result[0].confidence || 0.85;

        if (result.isFinal) {
          currentFinal += (currentFinal ? ' ' : '') + transcript;
          this.finalTranscript = currentFinal;
          this.lastKnownTranscript = currentFinal;
          this.latestConfidence = confidence;

          // Collect all alternatives
          const alternatives = [];
          for (let j = 0; j < result.length; j++) {
            alternatives.push({
              transcript: result[j].transcript.trim(),
              confidence: result[j].confidence || 0.8,
            });
          }
          this.latestAlternatives = alternatives;

          this._emit('result', {
            transcript: currentFinal,
            confidence,
            alternatives,
            isFinal: true,
          });
        } else {
          currentInterim += (currentInterim ? ' ' : '') + transcript;
          this.interimTranscript = currentInterim;
          this.lastKnownTranscript = currentInterim;
          this.latestConfidence = confidence;

          this._emit('interim', {
            transcript: currentInterim,
            confidence,
            isFinal: false,
          });
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition event error:', event.error);
      this._emit('error', {
        error: event.error,
        message: this._getErrorMessage(event.error),
      });

      // On non-fatal errors during active recording, try to recover
      if (event.error === 'no-speech') {
        // Just silent period; keep listening if user intended to
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        this.isListening = false;
        this.shouldKeepListening = false;
      }
    };

    this.recognition.onend = () => {
      // If we are still supposed to be listening (e.g. browser timed out the continuous stream), restart
      if (this.shouldKeepListening && this.isListening) {
        try {
          this.recognition.start();
          return;
        } catch (e) {
          // Ignore restart error
        }
      }
      this.isListening = false;
      this._emit('end', {
        lastTranscript: this.lastKnownTranscript,
      });
    };

    this.recognition.onspeechstart = () => {
      this._emit('speechStart', {});
    };

    this.recognition.onspeechend = () => {
      this._emit('speechEnd', {});
    };

    this.recognition.onaudiostart = () => {
      this._emit('audioStart', {});
    };
  }

  /**
   * Set recognition language
   * @param {string} lang e.g. 'hi-IN', 'en-IN', 'sa-IN'
   */
  setLanguage(lang) {
    this.currentLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Start listening
   */
  start() {
    if (!this.isSupported) {
      this._emit('error', {
        error: 'not-supported',
        message: 'Speech recognition is not supported in this browser. Try Chrome or Edge.',
      });
      return false;
    }

    // Reset session state
    this.interimTranscript = '';
    this.finalTranscript = '';
    this.lastKnownTranscript = '';
    this.latestAlternatives = [];
    this.shouldKeepListening = true;

    try {
      this.recognition.start();
      this.isListening = true;
      this._emit('start', {});
      return true;
    } catch (err) {
      // May throw if already started
      console.warn('Speech recognition start error:', err);
      return false;
    }
  }

  /**
   * Stop listening and return the best collected transcript
   */
  stop() {
    this.shouldKeepListening = false;
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // Ignore
      }
    }

    return this.getLatestTranscript();
  }

  /**
   * Abort listening immediately
   */
  abort() {
    this.shouldKeepListening = false;
    this.isListening = false;
    if (!this.recognition) return;

    try {
      this.recognition.abort();
    } catch (err) {
      // Ignore
    }
  }

  /**
   * Get the most recent recognized transcript
   */
  getLatestTranscript() {
    const transcript = (this.finalTranscript || this.interimTranscript || this.lastKnownTranscript || '').trim();
    return {
      transcript,
      confidence: this.latestConfidence || 0.8,
      alternatives: this.latestAlternatives,
    };
  }

  /**
   * Get human-readable error message
   */
  _getErrorMessage(error) {
    const messages = {
      'no-speech': 'No speech was detected yet. Speak clearly into the microphone.',
      'audio-capture': 'No microphone was found or microphone access was denied.',
      'not-allowed': 'Microphone permission was denied. Please allow microphone access in browser settings.',
      'network': 'Network connection issue with Speech Recognition service.',
      'aborted': 'Speech recognition was stopped.',
      'service-not-allowed': 'Speech recognition service is not allowed in this environment.',
      'language-not-supported': 'The specified language is not supported.',
    };
    return messages[error] || `Recognition notice: ${error}`;
  }

  // --- Event system ---
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
  }

  _emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((cb) => cb(data));
  }

  /**
   * Destroy
   */
  destroy() {
    this.abort();
    this.listeners = {};
  }
}
