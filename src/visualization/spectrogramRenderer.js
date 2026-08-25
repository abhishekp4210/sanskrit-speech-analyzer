/**
 * SpectrogramRenderer — Waterfall spectrogram visualization on HTML5 Canvas
 * Renders a scrolling heat-mapped frequency display.
 */
export class SpectrogramRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isRunning = false;
    this.animationId = null;
    this.dataSource = null;

    // Visual settings
    this.backgroundColor = 'hsl(240, 15%, 6%)';
    this.scrollSpeed = 2; // pixels per frame

    // Offscreen canvas for scrolling
    this.offCanvas = document.createElement('canvas');
    this.offCtx = this.offCanvas.getContext('2d');

    this._handleResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._handleResize);
    this._handleResize();
  }

  /**
   * Set the data source function (returns Uint8Array of frequency data)
   */
  setDataSource(fn) {
    this.dataSource = fn;
  }

  /**
   * Start the render loop
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._render();
  }

  /**
   * Stop the render loop
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Draw idle state
   */
  drawIdle() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    // Draw frequency axis labels
    this._drawAxisLabels();

    // "Waiting" text
    ctx.fillStyle = 'hsla(240, 10%, 40%, 0.5)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Awaiting audio input...', w / 2, h / 2);
  }

  /**
   * Main render loop
   */
  _render() {
    if (!this.isRunning) return;

    const data = this.dataSource ? this.dataSource() : null;
    this._draw(data);

    this.animationId = requestAnimationFrame(() => this._render());
  }

  /**
   * Draw spectrogram from frequency data
   */
  _draw(data) {
    const { ctx, canvas, offCtx, offCanvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    if (!data || data.length === 0) {
      this.drawIdle();
      return;
    }

    // Shift existing content to the left on offscreen canvas
    offCtx.drawImage(
      offCanvas,
      this.scrollSpeed, 0, w - this.scrollSpeed, h,
      0, 0, w - this.scrollSpeed, h
    );

    // Draw new column on the right edge
    const colWidth = this.scrollSpeed;
    const binCount = data.length;
    // Only display lower half of spectrum (more relevant frequencies)
    const displayBins = Math.floor(binCount * 0.75);

    for (let i = 0; i < displayBins; i++) {
      const magnitude = data[i];
      const color = this._magnitudeToColor(magnitude);

      // Map bin to y-coordinate (invert: low freq at bottom)
      const y = h - (i / displayBins) * h;
      const binHeight = Math.max(h / displayBins, 1);

      offCtx.fillStyle = color;
      offCtx.fillRect(w - colWidth, y - binHeight, colWidth, binHeight);
    }

    // Copy offscreen to main canvas
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(offCanvas, 0, 0);

    // Draw axis labels on top
    this._drawAxisLabels();
  }

  /**
   * Map frequency magnitude (0-255) to a heat color
   */
  _magnitudeToColor(magnitude) {
    const norm = magnitude / 255;

    if (norm < 0.05) {
      // Very quiet: dark blue/black
      return `hsl(240, 60%, ${norm * 100 + 3}%)`;
    } else if (norm < 0.25) {
      // Quiet: deep blue to cyan
      const t = (norm - 0.05) / 0.2;
      const h = 240 - t * 40; // 240→200
      const l = 10 + t * 25;
      return `hsl(${h}, 70%, ${l}%)`;
    } else if (norm < 0.5) {
      // Medium: cyan to green
      const t = (norm - 0.25) / 0.25;
      const h = 200 - t * 80; // 200→120
      const l = 35 + t * 15;
      return `hsl(${h}, 80%, ${l}%)`;
    } else if (norm < 0.75) {
      // Loud: green to yellow
      const t = (norm - 0.5) / 0.25;
      const h = 120 - t * 60; // 120→60
      const l = 50 + t * 10;
      return `hsl(${h}, 85%, ${l}%)`;
    } else {
      // Very loud: yellow to red/white
      const t = (norm - 0.75) / 0.25;
      const h = 60 - t * 60; // 60→0
      const l = 60 + t * 25;
      return `hsl(${h}, 90%, ${l}%)`;
    }
  }

  /**
   * Draw frequency axis labels
   */
  _drawAxisLabels() {
    const { ctx, canvas } = this;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.fillStyle = 'hsla(240, 10%, 50%, 0.5)';
    ctx.font = `${9 * dpr}px Inter, sans-serif`;
    ctx.textAlign = 'left';

    // Frequency labels on left side
    const freqLabels = ['8kHz', '6kHz', '4kHz', '2kHz', '0Hz'];
    freqLabels.forEach((label, i) => {
      const y = (i / (freqLabels.length - 1)) * h;
      ctx.fillText(label, 4 * dpr, y + 10 * dpr);
    });

    ctx.restore();
  }

  /**
   * Handle canvas resize
   */
  _handleResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width * dpr;
    const h = rect.height * dpr;

    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.offCanvas.width = w;
    this.offCanvas.height = h;

    // Fill offscreen with background
    this.offCtx.fillStyle = this.backgroundColor;
    this.offCtx.fillRect(0, 0, w, h);

    if (!this.isRunning) {
      this.drawIdle();
    }
  }

  /**
   * Clear the spectrogram
   */
  clear() {
    const w = this.offCanvas.width;
    const h = this.offCanvas.height;
    this.offCtx.fillStyle = this.backgroundColor;
    this.offCtx.fillRect(0, 0, w, h);

    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Destroy and clean up
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._handleResize);
  }
}
