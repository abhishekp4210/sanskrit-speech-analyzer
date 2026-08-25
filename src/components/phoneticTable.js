/**
 * PhoneticTable — Interactive Varṇamālā grid
 * Organized by varga (rows) and voicing/aspiration (columns).
 * Color-coded by Sthāna. Highlights detected phonemes.
 */
import { VARNAMALA, PHONEME_TYPE, getVowels, getByVarga } from '../sanskrit/varnamala.js';

export class PhoneticTable {
  constructor(containerId, detailId) {
    this.container = document.getElementById(containerId);
    this.detailContainer = document.getElementById(detailId);
    this.highlightedPhonemes = new Set();
    this.onPhonemeSelect = null;

    this._render();
  }

  /**
   * Highlight specific phonemes (from detected word)
   * @param {Array} phonemes — Array of phoneme objects
   */
  highlightPhonemes(phonemes) {
    // Clear previous highlights
    this.container.querySelectorAll('.varnamala-cell.highlighted').forEach((el) => {
      el.classList.remove('highlighted');
    });

    this.highlightedPhonemes = new Set(phonemes.map((p) => p.devanagari));

    // Apply highlights
    this.highlightedPhonemes.forEach((char) => {
      const cell = this.container.querySelector(`[data-char="${char}"]`);
      if (cell) {
        cell.classList.add('highlighted');
      }
    });
  }

  /**
   * Show detail panel for a phoneme
   */
  showDetail(phoneme) {
    this.detailContainer.classList.remove('hidden');
    this.detailContainer.innerHTML = `
      <div class="phoneme-detail-header">
        <span class="phoneme-detail-char">${phoneme.devanagari}</span>
        <div>
          <div class="phoneme-detail-name">${phoneme.iast} ${phoneme.ipa ? `[${phoneme.ipa}]` : ''}</div>
          <span class="articulation-badge ${phoneme.sthana.badgeClass}" style="font-size: 0.65rem;">${phoneme.sthana.english}</span>
        </div>
      </div>
      <div class="phoneme-detail-grid">
        <div class="phoneme-detail-field">
          <div class="phoneme-detail-field-label">Sthāna (Place)</div>
          <div class="phoneme-detail-field-value">${phoneme.sthana.sanskrit} — ${phoneme.sthana.english}</div>
        </div>
        <div class="phoneme-detail-field">
          <div class="phoneme-detail-field-label">Body Part</div>
          <div class="phoneme-detail-field-value">${phoneme.sthana.bodyPart}</div>
        </div>
        <div class="phoneme-detail-field">
          <div class="phoneme-detail-field-label">Articulation</div>
          <div class="phoneme-detail-field-value">${phoneme.sthana.articulationPoint}</div>
        </div>
        <div class="phoneme-detail-field">
          <div class="phoneme-detail-field-label">Type</div>
          <div class="phoneme-detail-field-value">${this._getTypeLabel(phoneme.type)}</div>
        </div>
        ${phoneme.voicing ? `
        <div class="phoneme-detail-field">
          <div class="phoneme-detail-field-label">Voicing</div>
          <div class="phoneme-detail-field-value">${phoneme.voicing === 'voiced' ? 'Voiced (घोष)' : 'Unvoiced (अघोष)'}</div>
        </div>` : ''}
        ${phoneme.aspiration ? `
        <div class="phoneme-detail-field">
          <div class="phoneme-detail-field-label">Aspiration</div>
          <div class="phoneme-detail-field-value">${phoneme.aspiration === 'aspirated' ? 'Aspirated (महाप्राण)' : 'Unaspirated (अल्पप्राण)'}</div>
        </div>` : ''}
      </div>
      <p class="articulation-desc" style="margin-top: var(--space-md);">${phoneme.description}</p>
    `;
  }

  /**
   * Render the complete Varnamala table
   */
  _render() {
    const html = [];

    // === Vowels Section ===
    html.push('<div class="varnamala-section-label">स्वर — Vowels (Svara)</div>');
    html.push('<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: var(--space-md);">');
    getVowels().forEach((v) => {
      html.push(this._renderCell(v));
    });
    html.push('</div>');

    // === Consonants Section ===
    html.push('<div class="varnamala-section-label">स्पर्श व्यञ्जन — Stop Consonants (Sparsha)</div>');

    // Table for sparsha consonants (5 vargas × 5)
    html.push('<table class="varnamala-table"><thead><tr>');
    html.push('<th></th><th>Unv.</th><th>Unv. Asp.</th><th>Vcd.</th><th>Vcd. Asp.</th><th>Nasal</th>');
    html.push('</tr></thead><tbody>');

    const vargas = [
      { id: 'ka', label: 'कवर्ग (Velar)', sthana: 'kanthya' },
      { id: 'ca', label: 'चवर्ग (Palatal)', sthana: 'talavya' },
      { id: 'Ta', label: 'टवर्ग (Retroflex)', sthana: 'murdhanya' },
      { id: 'ta', label: 'तवर्ग (Dental)', sthana: 'dantya' },
      { id: 'pa', label: 'पवर्ग (Labial)', sthana: 'oshthya' },
    ];

    vargas.forEach((varga) => {
      const members = getByVarga(varga.id);
      html.push(`<tr>`);
      html.push(`<th style="text-align: left; font-size: 0.65rem; padding-right: 8px; white-space: nowrap;">${varga.label}</th>`);
      members.forEach((m) => {
        html.push(`<td>${this._renderCell(m)}</td>`);
      });
      // Fill remaining columns if less than 5
      for (let i = members.length; i < 5; i++) {
        html.push('<td></td>');
      }
      html.push('</tr>');
    });

    html.push('</tbody></table>');

    // === Semivowels ===
    html.push('<div class="varnamala-section-label">अन्तस्थ — Semivowels (Antastha)</div>');
    html.push('<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: var(--space-md);">');
    VARNAMALA.filter((p) => p.type === PHONEME_TYPE.ANTASTHA).forEach((v) => {
      html.push(this._renderCell(v));
    });
    html.push('</div>');

    // === Sibilants ===
    html.push('<div class="varnamala-section-label">ऊष्मन् — Sibilants & Fricatives (Ushman)</div>');
    html.push('<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: var(--space-md);">');
    VARNAMALA.filter((p) => p.type === PHONEME_TYPE.USHMAN).forEach((v) => {
      html.push(this._renderCell(v));
    });
    html.push('</div>');

    // === Ayogavaha ===
    html.push('<div class="varnamala-section-label">अयोगवाह — Special Sounds</div>');
    html.push('<div style="display: flex; flex-wrap: wrap; gap: 4px;">');
    VARNAMALA.filter((p) => p.type === PHONEME_TYPE.AYOGAVAHA).forEach((v) => {
      html.push(this._renderCell(v));
    });
    html.push('</div>');

    this.container.innerHTML = html.join('');

    // Add click handlers
    this.container.querySelectorAll('.varnamala-cell').forEach((cell) => {
      cell.addEventListener('click', () => {
        const char = cell.dataset.char;
        const phoneme = VARNAMALA.find((p) => p.devanagari === char);
        if (phoneme) {
          this.showDetail(phoneme);
          if (this.onPhonemeSelect) this.onPhonemeSelect(phoneme);
        }
      });
    });
  }

  /**
   * Render a single phoneme cell
   */
  _renderCell(phoneme) {
    const sthanaClass = `sthana-${phoneme.sthana.id.replace(/-/g, '')}`;
    const highlighted = this.highlightedPhonemes.has(phoneme.devanagari) ? ' highlighted' : '';

    return `
      <div class="varnamala-cell ${sthanaClass}${highlighted}" 
           data-char="${phoneme.devanagari}" 
           title="${phoneme.iast} — ${phoneme.sthana.english}">
        <span class="varnamala-cell-dev">${phoneme.devanagari}</span>
        <span class="varnamala-cell-iast">${phoneme.iast}</span>
      </div>
    `;
  }

  /**
   * Get type label
   */
  _getTypeLabel(type) {
    const labels = {
      [PHONEME_TYPE.SVARA]: 'Vowel (स्वर)',
      [PHONEME_TYPE.SPARSHA]: 'Stop (स्पर्श)',
      [PHONEME_TYPE.ANTASTHA]: 'Semivowel (अन्तस्थ)',
      [PHONEME_TYPE.USHMAN]: 'Sibilant (ऊष्मन्)',
      [PHONEME_TYPE.AYOGAVAHA]: 'Special (अयोगवाह)',
    };
    return labels[type] || type;
  }

  /**
   * Set phoneme select handler
   */
  setOnPhonemeSelect(fn) {
    this.onPhonemeSelect = fn;
  }
}
