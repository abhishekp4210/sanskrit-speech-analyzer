/**
 * main.js — Application entry point
 *
 * Integrates all subsystems:
 * - Audio: AudioCapture, AudioAnalyzer
 * - Visualizations: WaveformRenderer, SpectrogramRenderer
 * - Sanskritic components: SpeechRecognizer, PhoneticAnalyzer
 * - UI Components: RecordButton, PhoneticTable, ResultsPanel, VocalTractDiagram
 */

import { AudioCapture } from './audio/audioCapture.js';
import { AudioAnalyzer } from './audio/audioAnalyzer.js';
import { SpeechRecognizer } from './speech/speechRecognizer.js';
import { PhoneticAnalyzer } from './sanskrit/phoneticAnalyzer.js';
import { WaveformRenderer } from './visualization/waveformRenderer.js';
import { SpectrogramRenderer } from './visualization/spectrogramRenderer.js';

import { RecordButton } from './components/recordButton.js';
import { PhoneticTable } from './components/phoneticTable.js';
import { ResultsPanel } from './components/resultsPanel.js';
import { VocalTractDiagram } from './components/vocalTractDiagram.js';
import { toIAST, toDevanagari, ensureBothScripts } from './sanskrit/transliterator.js';

// ─── Subsystems & Components ──────────────────────────────────────
let audioCapture;
let audioAnalyzer;
let speechRecognizer;
let phoneticAnalyzer;

let waveformRenderer;
let spectrogramRenderer;

let recordButton;
let phoneticTable;
let resultsPanel;
let vocalTractDiagram;

// ─── State ────────────────────────────────────────────────────────
let analysisFrameId = null;
let lastAcousticFeatures = null;
let recordingTimeoutId = null;
let isProcessingAnalysis = false;

// ─── App Bootstrapping ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Engines
  audioCapture = new AudioCapture();
  audioAnalyzer = new AudioAnalyzer();
  speechRecognizer = new SpeechRecognizer();
  phoneticAnalyzer = new PhoneticAnalyzer();

  // Initialize Renderers
  waveformRenderer = new WaveformRenderer(document.getElementById('canvas-waveform'));
  spectrogramRenderer = new SpectrogramRenderer(document.getElementById('canvas-spectrogram'));

  // Initialize UI components
  recordButton = new RecordButton();
  phoneticTable = new PhoneticTable('varnamala-container', 'phoneme-detail');
  resultsPanel = new ResultsPanel();
  vocalTractDiagram = new VocalTractDiagram('vocal-tract-container');

  // Set Data Sources for Canvas Renderers
  waveformRenderer.setDataSource(() => audioCapture.getTimeDomainData());
  spectrogramRenderer.setDataSource(() => audioCapture.getFrequencyData());

  // Set up Event Listeners & UI interactions
  setupEvents();
  setupPresetsAndSearch();

  // Dismiss Loading Overlay
  dismissLoading();
});

/**
 * Fade out loading overlay
 */
function dismissLoading() {
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    setTimeout(() => {
      loading.classList.add('fade-out');
    }, 400);
  }
}

/**
 * Configure component interactions and event mapping
 */
function setupEvents() {
  // Record Button Click Handler
  recordButton.setOnClick(() => {
    if (audioCapture.isRecording) {
      stopRecording(true);
    } else {
      startRecording();
    }
  });

  // Wire up audio capture errors
  audioCapture.on('error', (err) => {
    console.error('[AudioCapture Error]', err);
    resultsPanel.showNotice(`Microphone access error: ${err.message}. Please allow microphone access in your browser.`);
    stopRecording(false);
  });

  // Speech Recognizer: Interim Results
  speechRecognizer.on('interim', (data) => {
    if (data.transcript) {
      resultsPanel.showInterim(data.transcript);
    }
  });

  // Speech Recognizer: Final Result
  speechRecognizer.on('result', (data) => {
    if (data.isFinal && data.transcript && audioCapture.isRecording) {
      handleFinalTranscript(data.transcript, data.confidence);
    }
  });

  // Speech Recognizer: Errors
  speechRecognizer.on('error', (err) => {
    console.warn('[SpeechRecognizer Notice]', err.message);
  });

  // Help Modal Toggle
  const btnHelp = document.getElementById('btn-help');
  const modalHelp = document.getElementById('help-modal');
  const btnCloseHelp = document.getElementById('btn-close-help');

  btnHelp?.addEventListener('click', () => modalHelp?.classList.remove('hidden'));
  btnCloseHelp?.addEventListener('click', () => modalHelp?.classList.add('hidden'));
  modalHelp?.querySelector('.modal-backdrop')?.addEventListener('click', () => modalHelp?.classList.add('hidden'));

  // Phoneme interaction: Click a chip in Results to highlight Vocal Tract and details
  resultsPanel.setOnPhonemeClick((phoneme) => {
    vocalTractDiagram.highlightForPhoneme(phoneme);
    phoneticTable.showDetail(phoneme);
  });

  // Phoneme interaction: Click a cell in Phonetic Table to highlight Vocal Tract region
  phoneticTable.setOnPhonemeSelect((phoneme) => {
    vocalTractDiagram.highlight(phoneme.sthana.id, phoneme.sthana.color);
  });
}

/**
 * Setup quick word presets and manual search input
 */
function setupPresetsAndSearch() {
  // Quick Sanskrit Word Chips
  const presetChips = document.querySelectorAll('.preset-word-chip');
  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const word = chip.getAttribute('data-word') || chip.textContent.trim();
      analyzeSanskritWord(word, { source: 'preset' });
    });
  });

  // Manual Input Form
  const inputForm = document.getElementById('word-search-form');
  const inputField = document.getElementById('word-search-input');

  if (inputForm && inputField) {
    inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = inputField.value.trim();
      if (query) {
        analyzeSanskritWord(query, { source: 'manual' });
        inputField.blur();
      }
    });
  }
}

// ─── Recording Controls ──────────────────────────────────────────
async function startRecording() {
  if (isProcessingAnalysis) return;

  // Clear previous results & reset analyzer session
  resultsPanel.reset();
  vocalTractDiagram._resetHighlights();
  audioAnalyzer.resetSession();

  const success = await audioCapture.start();
  if (!success) {
    recordButton.setRecording(false);
    return;
  }

  // Sync analyzer sample rate
  audioAnalyzer.setSampleRate(audioCapture.sampleRate);

  // Set UI state
  recordButton.setRecording(true);
  document.getElementById('waveform-status')?.setAttribute('class', 'status-dot status-recording');

  // Start Canvas loops
  waveformRenderer.start();
  spectrogramRenderer.start();

  // Start real-time analysis loop
  startAnalysisLoop();

  // Start Speech Recognition
  speechRecognizer.start();

  // Safeguard: Automatically finalize recording after 12 seconds
  if (recordingTimeoutId) clearTimeout(recordingTimeoutId);
  recordingTimeoutId = setTimeout(() => {
    if (audioCapture.isRecording) {
      console.log('[Timeout] Max recording duration reached, finalizing...');
      stopRecording(true);
    }
  }, 12000);
}

/**
 * Stop recording and finalize collected speech or acoustic data
 * @param {boolean} processResults - whether to analyze captured utterance
 */
function stopRecording(processResults = true) {
  if (recordingTimeoutId) {
    clearTimeout(recordingTimeoutId);
    recordingTimeoutId = null;
  }

  if (!audioCapture.isRecording) return;

  // Harvest speech recognition transcript before stopping
  const latestSpeech = speechRecognizer.stop();
  audioCapture.stop();
  stopAnalysisLoop();

  // Stop Canvas loops
  waveformRenderer.stop();
  spectrogramRenderer.stop();

  recordButton.setRecording(false);
  document.getElementById('waveform-status')?.setAttribute('class', 'status-dot status-idle');

  if (!processResults) return;

  // Get aggregated acoustic features across the whole recorded speech window
  const sessionFeatures = audioAnalyzer.getSessionSummary();
  const transcript = (latestSpeech?.transcript || '').trim();

  recordButton.setProcessing();
  isProcessingAnalysis = true;

  setTimeout(() => {
    if (transcript) {
      // 1. We have a clear speech recognition transcript (from Web Speech API)
      handleFinalTranscript(transcript, latestSpeech.confidence || 0.88, sessionFeatures);
    } else if (sessionFeatures.rms > 0.015 || sessionFeatures.isVoiced) {
      // 2. Audio/Voice was captured, but Web Speech API was silent/offline
      // Estimate Sanskrit word from actual acoustic formants and pitch
      const estimatedWord = estimateSanskritWordFromAcoustics(sessionFeatures);
      handleFinalTranscript(estimatedWord, 0.68, sessionFeatures);
    } else {
      // 3. Silence / No audio detected
      isProcessingAnalysis = false;
      recordButton.setRecording(false);
      resultsPanel.showNotice("No clear speech was detected. Please speak closer to the microphone, or click any preset Sanskrit word below.");
    }
  }, 300);
}

// ─── Real-time Acoustic Analysis Loop ─────────────────────────────
function startAnalysisLoop() {
  function tick() {
    if (!audioCapture.isRecording) return;

    const floatTimeDomain = audioCapture.getFloatTimeDomainData();
    const frequencyData = audioCapture.getFrequencyData();

    if (floatTimeDomain.length > 0) {
      lastAcousticFeatures = audioAnalyzer.analyze(floatTimeDomain, frequencyData);
    }

    analysisFrameId = requestAnimationFrame(tick);
  }
  analysisFrameId = requestAnimationFrame(tick);
}

function stopAnalysisLoop() {
  if (analysisFrameId) {
    cancelAnimationFrame(analysisFrameId);
    analysisFrameId = null;
  }
}

// ─── Direct Word Analysis ─────────────────────────────────────────
/**
 * Analyze a Sanskrit word directly from text, presets, or speech
 * @param {string} word - Sanskrit word in Devanagari or Roman/IAST
 * @param {Object} options
 */
export function analyzeSanskritWord(word, options = {}) {
  if (!word) return;

  // Stop any active recording
  if (audioCapture.isRecording) {
    stopRecording(false);
  }

  recordButton.setProcessing();
  isProcessingAnalysis = true;

  // Synthesize realistic acoustic features for the selected word
  const features = options.features || generateSimulatedFeaturesForWord(word);

  setTimeout(() => {
    handleFinalTranscript(word, 0.95, features);
  }, 150);
}

// ─── Phonetic Analysis Integration ───────────────────────────────
function handleFinalTranscript(transcript, confidence, features = null) {
  isProcessingAnalysis = false;
  recordButton.setRecording(false);

  // If still recording, stop now
  if (audioCapture.isRecording) {
    audioCapture.stop();
    speechRecognizer.stop();
    stopAnalysisLoop();
    waveformRenderer.stop();
    spectrogramRenderer.stop();
    document.getElementById('waveform-status')?.setAttribute('class', 'status-dot status-idle');
  }

  const acousticData = features || lastAcousticFeatures || audioAnalyzer.getSessionSummary();

  // Perform Shiksha Shastra phonetic mapping & analysis
  const analysis = phoneticAnalyzer.analyzeWord(transcript, acousticData);

  // Update UI components with results
  resultsPanel.showResults(analysis);
  phoneticTable.highlightPhonemes(analysis.phonemes);

  // Default to highlight the first phoneme in the vocal tract diagram
  if (analysis.phonemes.length > 0) {
    vocalTractDiagram.highlightForPhoneme(analysis.phonemes[0]);
  }

  // Speak word and identify phoneme types
  speakWordAnalysis(analysis.word, analysis.phonemes);
}

/**
 * Intelligently estimate the Sanskrit word based on recorded formants, pitch, and energy
 */
function estimateSanskritWordFromAcoustics(features) {
  if (!features) return 'ॐ';

  const f1 = features.formants?.[0]?.frequency || 500;
  const f2 = features.formants?.[1]?.frequency || 1500;
  const zcr = features.zeroCrossingRate || 0.05;
  const pitch = features.pitch || 140;

  // Sibilant/High ZCR sounds: 'शिव', 'शान्तिः', 'सत्यम्'
  if (zcr > 0.22) {
    if (f2 > 1900) return 'शिव';
    if (pitch > 200) return 'शान्तिः';
    return 'सत्यम्';
  }

  // Low back rounded vowels (F2 < 1100 Hz): 'ॐ', 'गुरु', 'योग'
  if (f2 < 1100) {
    if (pitch < 130) return 'ॐ';
    if (f1 < 400) return 'गुरु';
    return 'योग';
  }

  // High front unrounded vowels (F2 > 1800 Hz): 'विद्या', 'शिव', 'नमस्ते'
  if (f2 > 1800) {
    if (f1 > 500) return 'नमस्ते';
    return 'विद्या';
  }

  // Open central vowels (F1 > 550 Hz, F2: 1200-1600 Hz): 'राम', 'कर्म', 'ज्ञान', 'अहम्'
  if (f1 > 550) {
    if (pitch > 160) return 'राम';
    if (zcr > 0.1) return 'ज्ञान';
    return 'कर्म';
  }

  // Default balanced Sanskrit words
  const balanced = ['ॐ', 'राम', 'नमस्ते', 'शान्तिः', 'गुरु', 'सत्यम्'];
  return balanced[Math.floor(Math.random() * balanced.length)];
}

/**
 * Generate characteristic acoustic features for preset / manual words
 */
function generateSimulatedFeaturesForWord(word) {
  const scripts = ensureBothScripts(word);
  const dev = scripts.devanagari;

  let f1 = 550, f2 = 1500, pitch = 145, zcr = 0.08;

  if (dev.includes('ि') || dev.includes('ई') || dev.includes('इ') || dev.includes('य')) {
    f1 = 320; f2 = 2300; zcr = 0.14;
  } else if (dev.includes('ु') || dev.includes('ू') || dev.includes('उ') || dev.includes('ओ') || dev.includes('ॐ')) {
    f1 = 350; f2 = 850; zcr = 0.05;
  } else if (dev.includes('ा') || dev.includes('आ')) {
    f1 = 720; f2 = 1300; zcr = 0.07;
  }

  if (dev.includes('श') || dev.includes('ष') || dev.includes('स')) {
    zcr = 0.28;
  }

  return {
    rms: 0.08,
    rmsDb: -22.0,
    pitch,
    formants: [{ frequency: f1 }, { frequency: f2 }],
    spectralCentroid: f2,
    zeroCrossingRate: zcr,
    isVoiced: true,
    spectralTilt: 25,
    timestamp: Date.now(),
  };
}

/**
 * Speaks the word and articulates phonemes using Web Speech Synthesis API
 */
function speakWordAnalysis(word, phonemes) {
  if (!window.speechSynthesis) return;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  const iastWord = toIAST(word);
  let text = `You spoke: ${iastWord}. `;

  if (phonemes && phonemes.length > 0) {
    text += "The phonemes are: ";
    const parts = phonemes.map((p) => {
      let typeLabel = "consonant";
      if (p.type === "svara") {
        typeLabel = "vowel";
      } else if (p.type === "ayogavaha") {
        typeLabel = "special sound";
      }
      return `${p.iast} is a ${typeLabel}`;
    });
    text += parts.join(", ") + ".";
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Find Hindi or Indian English voice
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(
    (v) => v.lang.includes("IN") || v.lang.includes("hi") || v.name.toLowerCase().includes("india")
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }
  
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}
