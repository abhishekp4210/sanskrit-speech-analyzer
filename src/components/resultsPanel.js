/**
 * ResultsPanel — Displays detection results, articulatory analysis, 
 * confidence scores, and acoustic observations.
 */
import { toIAST } from '../sanskrit/transliterator.js';

export class ResultsPanel {
  constructor() {
    this.welcomeCard = document.getElementById('welcome-card');
    this.wordCard = document.getElementById('word-card');
    this.articulationCard = document.getElementById('articulation-card');
    this.confidenceCard = document.getElementById('confidence-card');
    this.notesCard = document.getElementById('notes-card');
    this.vocalTractCard = document.getElementById('vocal-tract-card');

    this.detectedDevanagari = document.getElementById('detected-devanagari');
    this.detectedIAST = document.getElementById('detected-iast');
    this.wordPhonemes = document.getElementById('word-phonemes');
    this.articulationContent = document.getElementById('articulation-content');
    this.confidenceContent = document.getElementById('confidence-content');
    this.notesContent = document.getElementById('notes-content');

    this.onPhonemeClick = null;
  }

  /**
   * Show analysis results
   * @param {Object} analysis - From PhoneticAnalyzer
   */
  showResults(analysis) {
    // Hide welcome, show result cards
    this.welcomeCard.classList.add('hidden');
    this.wordCard.classList.remove('hidden');
    this.articulationCard.classList.remove('hidden');
    this.confidenceCard.classList.remove('hidden');
    this.notesCard.classList.remove('hidden');
    this.vocalTractCard.classList.remove('hidden');

    // Re-trigger animations
    [this.wordCard, this.articulationCard, this.confidenceCard, this.notesCard, this.vocalTractCard].forEach((card) => {
      card.style.animation = 'none';
      card.offsetHeight; // Force reflow
      card.style.animation = '';
    });

    this._renderWord(analysis);
    this._renderArticulation(analysis);
    this._renderConfidence(analysis);
    this._renderNotes(analysis);
  }

  /**
   * Show interim (in-progress) result
   */
  showInterim(transcript) {
    if (!transcript) return;
    this.welcomeCard.classList.add('hidden');
    this.wordCard.classList.remove('hidden');

    this.detectedDevanagari.textContent = transcript;
    this.detectedDevanagari.style.opacity = '0.7';
    this.detectedIAST.textContent = toIAST(transcript);
    this.detectedIAST.style.opacity = '0.7';
    this.wordPhonemes.innerHTML = '<span class="status-listening-tag">🎧 Listening & Transcribing...</span>';
  }

  /**
   * Show an informative notice / prompt (e.g. if mic silence or help prompt)
   */
  showNotice(message) {
    this.welcomeCard.classList.remove('hidden');
    this.wordCard.classList.add('hidden');
    this.articulationCard.classList.add('hidden');
    this.confidenceCard.classList.add('hidden');
    this.notesCard.classList.add('hidden');
    this.vocalTractCard.classList.add('hidden');

    const noticeEl = document.getElementById('results-notice');
    if (noticeEl) {
      noticeEl.textContent = message;
      noticeEl.classList.remove('hidden');
      setTimeout(() => {
        noticeEl.classList.add('hidden');
      }, 6000);
    }
  }

  /**
   * Reset to welcome state
   */
  reset() {
    this.welcomeCard.classList.remove('hidden');
    this.wordCard.classList.add('hidden');
    this.articulationCard.classList.add('hidden');
    this.confidenceCard.classList.add('hidden');
    this.notesCard.classList.add('hidden');
    this.vocalTractCard.classList.add('hidden');

    const noticeEl = document.getElementById('results-notice');
    if (noticeEl) noticeEl.classList.add('hidden');
  }

  /**
   * Render detected word section
   */
  _renderWord(analysis) {
    this.detectedDevanagari.textContent = analysis.word;
    this.detectedDevanagari.style.opacity = '1';
    this.detectedIAST.textContent = toIAST(analysis.word);
    this.detectedIAST.style.opacity = '1';

    // Phoneme chips
    this.wordPhonemes.innerHTML = '';
    analysis.phonemes.forEach((phoneme, index) => {
      const chip = document.createElement('div');
      chip.className = 'phoneme-chip';
      chip.setAttribute('data-index', index);
      chip.innerHTML = `
        <span class="phoneme-chip-dev">${phoneme.devanagari}</span>
        <span class="phoneme-chip-iast">${phoneme.iast}</span>
        <span class="phoneme-chip-sthana">${phoneme.sthana.english}</span>
      `;

      chip.addEventListener('click', () => {
        // Toggle active state
        document.querySelectorAll('.phoneme-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        if (this.onPhonemeClick) this.onPhonemeClick(phoneme);
      });

      this.wordPhonemes.appendChild(chip);
    });
  }

  /**
   * Render articulatory analysis section
   */
  _renderArticulation(analysis) {
    this.articulationContent.innerHTML = '';

    analysis.phonemes.forEach((phoneme) => {
      const item = document.createElement('div');
      item.className = 'articulation-item';
      item.innerHTML = `
        <div class="articulation-item-header">
          <span class="articulation-phoneme">${phoneme.devanagari} <small style="font-size: var(--fs-sm); color: var(--text-secondary);">(${phoneme.iast})</small></span>
          <span class="articulation-badge ${phoneme.sthana.badgeClass}">${phoneme.sthana.english}</span>
        </div>
        <div class="articulation-details">
          <div class="articulation-row">
            <span class="articulation-label">Sthāna:</span>
            <span class="articulation-value">${phoneme.sthana.sanskrit} — ${phoneme.sthana.english}</span>
          </div>
          <div class="articulation-row">
            <span class="articulation-label">Body Part:</span>
            <span class="articulation-value">${phoneme.sthana.bodyPart}</span>
          </div>
          <div class="articulation-row">
            <span class="articulation-label">Articulation:</span>
            <span class="articulation-value">${phoneme.sthana.articulationPoint}</span>
          </div>
          <div class="articulation-row">
            <span class="articulation-label">Category:</span>
            <span class="articulation-value">${phoneme.typeLabel}</span>
          </div>
          ${phoneme.voicing ? `
          <div class="articulation-row">
            <span class="articulation-label">Voicing:</span>
            <span class="articulation-value">${phoneme.voicing === 'voiced' ? 'Voiced (घोष)' : 'Unvoiced (अघोष)'}</span>
          </div>` : ''}
          ${phoneme.aspiration ? `
          <div class="articulation-row">
            <span class="articulation-label">Aspiration:</span>
            <span class="articulation-value">${phoneme.aspiration === 'aspirated' ? 'Aspirated (महाप्राण)' : 'Unaspirated (अल्पप्राण)'}</span>
          </div>` : ''}
          ${phoneme.nasal ? `
          <div class="articulation-row">
            <span class="articulation-label">Nasality:</span>
            <span class="articulation-value">Nasal — air flows through nasal cavity</span>
          </div>` : ''}
        </div>
        <p class="articulation-desc">${phoneme.description}</p>
      `;
      this.articulationContent.appendChild(item);
    });
  }

  /**
   * Render confidence scores
   */
  _renderConfidence(analysis) {
    const { word, articulation } = analysis.confidence;

    this.confidenceContent.innerHTML = `
      ${this._renderConfidenceBar('Word Detection', word, this._getConfidenceFactors('word', analysis))}
      ${this._renderConfidenceBar('Articulatory Analysis', articulation, this._getConfidenceFactors('articulation', analysis))}
    `;

    // Animate bars after render
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fills = this.confidenceContent.querySelectorAll('.confidence-bar-fill');
        fills.forEach((fill) => {
          fill.style.width = fill.dataset.width;
        });
      }, 100);
    });
  }

  /**
   * Render a single confidence bar
   */
  _renderConfidenceBar(label, value, factors) {
    const level = value >= 80 ? 'high' : value >= 60 ? 'medium' : 'low';
    return `
      <div class="confidence-item">
        <div class="confidence-header">
          <span class="confidence-label">${label}</span>
          <span class="confidence-value ${level}">${value}%</span>
        </div>
        <div class="confidence-bar">
          <div class="confidence-bar-fill ${level}" data-width="${value}%" style="width: 0%"></div>
        </div>
        <p class="confidence-factors">${factors}</p>
      </div>
    `;
  }

  /**
   * Get human-readable confidence factors
   */
  _getConfidenceFactors(type, analysis) {
    if (type === 'word') {
      const factors = [];
      if (analysis.acousticSummary?.voiceActivity?.includes('Voiced')) {
        factors.push('✓ Voice activity detected');
      }
      factors.push(`Signal: ${analysis.acousticSummary?.energy || 'N/A'}`);
      if (analysis.acousticSummary?.pitch !== 'Not detected') {
        factors.push(`Pitch: ${analysis.acousticSummary?.pitch}`);
      }
      factors.push('Speech recognition via Web Speech API (hi-IN)');
      return factors.join(' · ');
    } else {
      const factors = [];
      factors.push('Classification based on Shiksha Shastra knowledge base');
      const avgMatch = analysis.phonemes.length > 0
        ? Math.round(analysis.phonemes.reduce((s, p) => s + p.acousticMatch, 0) / analysis.phonemes.length)
        : 0;
      factors.push(`Avg acoustic match: ${avgMatch}%`);
      factors.push(`${analysis.phonemes.length} phoneme(s) analyzed`);
      return factors.join(' · ');
    }
  }

  /**
   * Render acoustic observation notes
   */
  _renderNotes(analysis) {
    this.notesContent.innerHTML = '';

    if (analysis.notes && analysis.notes.length > 0) {
      analysis.notes.forEach((note) => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.innerHTML = `<span class="note-bullet">▸</span><span>${note}</span>`;
        this.notesContent.appendChild(item);
      });
    }

    // Add acoustic summary
    if (analysis.acousticSummary) {
      const summaryItems = [
        `Formants: ${analysis.acousticSummary.formants}`,
        `Spectral centroid: ${analysis.acousticSummary.spectralCentroid}`,
      ];
      summaryItems.forEach((text) => {
        const item = document.createElement('div');
        item.className = 'note-item';
        item.innerHTML = `<span class="note-bullet">◆</span><span>${text}</span>`;
        this.notesContent.appendChild(item);
      });
    }
  }

  /**
   * Set phoneme click handler
   */
  setOnPhonemeClick(fn) {
    this.onPhonemeClick = fn;
  }
}
