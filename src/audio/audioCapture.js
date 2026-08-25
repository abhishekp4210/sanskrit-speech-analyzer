/**
 * AudioCapture — Microphone capture via Web Audio API
 * Manages AudioContext, MediaStreamSource, and AnalyserNode
 */
export class AudioCapture {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.isRecording = false;
    this.listeners = {};
    this.fftSize = 2048;
  }

  /**
   * Initialize audio context (must be called from user gesture)
   */
  async init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.8;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
  }

  /**
   * Start recording from microphone
   */
  async start() {
    try {
      await this.init();

      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      // Note: NOT connecting to destination — no audio playback needed

      this.isRecording = true;
      this._emit('stateChange', { recording: true });
      return true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      this._emit('error', { type: 'mic_denied', message: err.message });
      return false;
    }
  }

  /**
   * Stop recording
   */
  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.isRecording = false;
    this._emit('stateChange', { recording: false });
  }

  /**
   * Get time-domain data (waveform)
   * @returns {Uint8Array}
   */
  getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  /**
   * Get frequency data (spectrum)
   * @returns {Uint8Array}
   */
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Get float time-domain data (higher precision)
   * @returns {Float32Array}
   */
  getFloatTimeDomainData() {
    if (!this.analyser) return new Float32Array(0);
    const data = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatTimeDomainData(data);
    return data;
  }

  /**
   * Get float frequency data
   * @returns {Float32Array}
   */
  getFloatFrequencyData() {
    if (!this.analyser) return new Float32Array(0);
    const data = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(data);
    return data;
  }

  /**
   * Get the sample rate
   */
  get sampleRate() {
    return this.audioContext ? this.audioContext.sampleRate : 44100;
  }

  /**
   * Get frequency bin count
   */
  get frequencyBinCount() {
    return this.analyser ? this.analyser.frequencyBinCount : 0;
  }

  /**
   * Calculate RMS (root mean square) energy
   */
  getRMSEnergy() {
    const data = this.getFloatTimeDomainData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Check if there's significant audio signal (voice activity)
   */
  hasVoiceActivity(threshold = 0.02) {
    return this.getRMSEnergy() > threshold;
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
   * Destroy and clean up
   */
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.listeners = {};
  }
}
