/**
 * VocalTractDiagram — SVG-based vocal tract cross-section
 * Highlights the active articulation point based on detected phoneme.
 */
export class VocalTractDiagram {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeRegion = null;
    this._render();
  }

  /**
   * Highlight a specific articulation region
   * @param {string} sthanaId — e.g., 'kanthya', 'talavya', etc.
   * @param {string} color — highlight color
   */
  highlight(sthanaId, color = 'hsl(38, 92%, 50%)') {
    // Reset all regions
    this._resetHighlights();

    this.activeRegion = sthanaId;

    // Map sthana IDs to SVG element IDs
    const regionMap = {
      'kanthya': ['region-throat'],
      'talavya': ['region-hard-palate'],
      'murdhanya': ['region-alveolar'],
      'dantya': ['region-teeth'],
      'oshthya': ['region-lips'],
      'nasikya': ['region-nasal'],
      'kantha-talu': ['region-throat', 'region-hard-palate'],
      'kantha-oshtha': ['region-throat', 'region-lips'],
      'danta-oshtha': ['region-teeth', 'region-lips'],
    };

    const regions = regionMap[sthanaId] || [];
    regions.forEach((id) => {
      const el = this.container.querySelector(`#${id}`);
      if (el) {
        el.style.fill = color;
        el.style.opacity = '0.7';
        el.style.filter = `drop-shadow(0 0 8px ${color})`;
        el.style.transition = 'all 0.4s ease';
      }
    });

    // Update label
    const label = this.container.querySelector('#active-label');
    if (label) {
      const names = {
        'kanthya': 'Throat (कण्ठ)',
        'talavya': 'Hard Palate (तालु)',
        'murdhanya': 'Roof of Mouth (मूर्धन्)',
        'dantya': 'Teeth (दन्त)',
        'oshthya': 'Lips (ओष्ठ)',
        'nasikya': 'Nasal Cavity (नासिका)',
        'kantha-talu': 'Throat + Palate',
        'kantha-oshtha': 'Throat + Lips',
        'danta-oshtha': 'Teeth + Lips',
      };
      label.textContent = names[sthanaId] || '';
    }
  }

  /**
   * Reset all highlights
   */
  _resetHighlights() {
    const regions = this.container.querySelectorAll('.tract-region');
    regions.forEach((el) => {
      el.style.fill = '';
      el.style.opacity = '';
      el.style.filter = '';
    });
    this.activeRegion = null;
  }

  /**
   * Render the SVG vocal tract diagram
   */
  _render() {
    this.container.innerHTML = `
      <svg viewBox="0 0 320 280" xmlns="http://www.w3.org/2000/svg" style="max-width: 320px; width: 100%;">
        <defs>
          <linearGradient id="skin-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="hsl(30, 30%, 25%)"/>
            <stop offset="100%" stop-color="hsl(30, 25%, 18%)"/>
          </linearGradient>
          <linearGradient id="cavity-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="hsl(350, 40%, 22%)"/>
            <stop offset="100%" stop-color="hsl(350, 35%, 15%)"/>
          </linearGradient>
        </defs>

        <!-- Head outline (simplified sagittal cross-section) -->
        <path d="M60,20 Q40,20 35,50 Q30,80 30,120 Q30,160 40,190 Q50,220 70,240 L130,260 Q160,260 200,250 Q230,240 250,210 Q270,180 275,140 Q280,100 270,70 Q260,40 240,25 Q220,15 180,12 Q140,10 100,12 Q80,15 60,20 Z" 
              fill="url(#skin-gradient)" stroke="hsl(30, 20%, 30%)" stroke-width="1.5"/>

        <!-- Nasal cavity -->
        <path id="region-nasal" class="tract-region" 
              d="M90,40 Q120,35 160,38 Q180,40 190,50 Q195,60 190,70 L160,72 Q130,70 100,68 Q85,65 82,55 Q80,45 90,40 Z"
              fill="hsla(320, 40%, 30%, 0.3)" stroke="hsl(320, 30%, 40%)" stroke-width="1" 
              style="cursor: pointer; transition: all 0.3s ease;"/>

        <!-- Oral cavity / Throat region -->
        <path id="region-throat" class="tract-region"
              d="M100,160 Q95,180 100,200 Q110,220 130,230 Q120,210 115,190 Q110,170 100,160 Z"
              fill="hsla(0, 50%, 30%, 0.3)" stroke="hsl(0, 40%, 40%)" stroke-width="1"
              style="cursor: pointer; transition: all 0.3s ease;"/>

        <!-- Soft palate (velum) -->
        <path d="M150,78 Q170,75 185,80 Q195,88 188,98 Q180,105 165,102 Q150,98 148,88 Q146,82 150,78 Z"
              fill="hsl(350, 30%, 28%)" stroke="hsl(350, 25%, 35%)" stroke-width="0.8"/>

        <!-- Hard palate -->
        <path id="region-hard-palate" class="tract-region"
              d="M110,72 Q130,62 155,65 Q145,75 130,78 Q115,80 110,72 Z"
              fill="hsla(270, 40%, 35%, 0.3)" stroke="hsl(270, 30%, 45%)" stroke-width="1"
              style="cursor: pointer; transition: all 0.3s ease;"/>

        <!-- Alveolar ridge (retroflex zone) -->
        <path id="region-alveolar" class="tract-region"
              d="M92,78 Q100,68 112,72 Q108,82 98,86 Q90,85 92,78 Z"
              fill="hsla(200, 50%, 35%, 0.3)" stroke="hsl(200, 40%, 45%)" stroke-width="1"
              style="cursor: pointer; transition: all 0.3s ease;"/>

        <!-- Teeth -->
        <path id="region-teeth" class="tract-region"
              d="M78,92 Q82,82 90,80 Q88,90 82,98 Q76,100 78,92 Z"
              fill="hsla(160, 50%, 35%, 0.3)" stroke="hsl(160, 40%, 45%)" stroke-width="1"
              style="cursor: pointer; transition: all 0.3s ease;"/>

        <!-- Upper teeth marks -->
        <line x1="80" y1="86" x2="88" y2="82" stroke="hsl(40, 10%, 70%)" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="78" y1="92" x2="84" y2="88" stroke="hsl(40, 10%, 70%)" stroke-width="1.5" stroke-linecap="round"/>

        <!-- Lips -->
        <path id="region-lips" class="tract-region"
              d="M62,100 Q56,95 55,104 Q54,115 60,120 Q66,115 68,108 Q70,100 62,100 Z"
              fill="hsla(38, 70%, 40%, 0.3)" stroke="hsl(38, 60%, 50%)" stroke-width="1"
              style="cursor: pointer; transition: all 0.3s ease;"/>

        <!-- Tongue body -->
        <path d="M100,145 Q120,120 145,110 Q165,105 180,115 Q190,125 185,140 Q175,155 155,160 Q130,162 110,158 Q100,155 100,145 Z"
              fill="hsl(350, 35%, 35%)" stroke="hsl(350, 30%, 45%)" stroke-width="1"/>

        <!-- Tongue tip (can move) -->
        <path d="M100,145 Q95,135 88,125 Q82,118 80,115 Q78,112 82,110"
              fill="none" stroke="hsl(350, 30%, 45%)" stroke-width="2" stroke-linecap="round"/>

        <!-- Epiglottis hint -->
        <path d="M180,160 Q185,170 182,180 Q178,185 175,178 Q172,170 175,162"
              fill="hsl(350, 30%, 30%)" stroke="hsl(350, 25%, 40%)" stroke-width="0.8"/>

        <!-- Labels -->
        <g font-family="Inter, sans-serif" font-size="8" fill="hsla(40, 20%, 70%, 0.7)">
          <text x="130" y="52" text-anchor="middle">Nasal Cavity</text>
          <text x="125" y="70" text-anchor="middle" font-size="7">Hard Palate</text>
          <text x="95" y="75" text-anchor="middle" font-size="7">Alveolar</text>
          <text x="68" y="88" text-anchor="end" font-size="7">Teeth</text>
          <text x="48" y="110" text-anchor="end" font-size="7">Lips</text>
          <text x="98" y="215" text-anchor="middle" font-size="7">Throat</text>
          <text x="150" y="140" text-anchor="middle" font-size="7" fill="hsla(40, 20%, 60%, 0.5)">Tongue</text>
        </g>

        <!-- Active region label (dynamic) -->
        <text id="active-label" x="160" y="265" text-anchor="middle" 
              font-family="'Noto Sans Devanagari', Inter, sans-serif" font-size="11" 
              fill="hsl(38, 92%, 60%)" font-weight="600"></text>

        <!-- Airflow arrows (subtle) -->
        <g stroke="hsla(200, 60%, 50%, 0.2)" fill="none" stroke-width="0.8">
          <path d="M130,230 Q120,210 115,190" marker-end="url(#arrowhead)"/>
        </g>

        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="hsla(200, 60%, 50%, 0.3)"/>
          </marker>
        </defs>
      </svg>
    `;

    // Add click handlers to regions
    const regions = this.container.querySelectorAll('.tract-region');
    regions.forEach((region) => {
      region.addEventListener('click', () => {
        const idToSthana = {
          'region-throat': 'kanthya',
          'region-hard-palate': 'talavya',
          'region-alveolar': 'murdhanya',
          'region-teeth': 'dantya',
          'region-lips': 'oshthya',
          'region-nasal': 'nasikya',
        };
        const sthana = idToSthana[region.id];
        if (sthana) this.highlight(sthana);
      });
    });
  }

  /**
   * Highlight for a specific phoneme analysis result
   */
  highlightForPhoneme(phonemeAnalysis) {
    if (!phonemeAnalysis || !phonemeAnalysis.sthana) return;
    this.highlight(phonemeAnalysis.sthana.id, phonemeAnalysis.sthana.color);
  }
}
