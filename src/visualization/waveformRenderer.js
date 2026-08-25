/**
 * WaveformRenderer — Real-time waveform visualization on HTML5 Canvas
 * Renders an oscilloscope-style display with gradient coloring and glow effects.
 */
export class WaveformRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isRunning = false;
    this.animationId = null;
    this.dataSource = null;

    // Visual settings
    this.lineWidth = 2;
    this.glowBlur = 12;
    this.backgroundColor = 'hsla(240, 15%, 6%, 0.85)';
    this.gridColor = 'hsla(240, 15%, 30%, 0.15)';

    // Colors
    this.primaryColor = 'hsl(38, 92%, 50%)';     // Saffron
    this.secondaryColor = 'hsl(24, 85%, 55%)';   // Amber
    this.glowColor = 'hsla(38, 92%, 50%, 0.3)';

    this._handleResize = this._handleResize.bind(this);
    window.addEventListener('resize', this._handleResize);
    this._handleResize();
  }

  /**
   * Set the data source function (returns Uint8Array of time-domain data)
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
   * Draw a single frame of idle state (flat line)
   */
  drawIdle() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    this._drawGrid();

    // Draw center line
    ctx.beginPath();
    ctx.strokeStyle = 'hsla(38, 92%, 50%, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);
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
   * Draw waveform from data
   */
  _draw(data) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear with background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    // Draw grid
    this._drawGrid();

    if (!data || data.length === 0) {
      this.drawIdle();
      return;
    }

    const bufferLength = data.length;
    const sliceWidth = w / bufferLength;

    // Draw glow (wider, blurred version)
    ctx.save();
    ctx.shadowBlur = this.glowBlur;
    ctx.shadowColor = this.glowColor;
    ctx.lineWidth = this.lineWidth + 3;
    ctx.strokeStyle = this.glowColor;
    ctx.beginPath();

    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = data[i] / 128.0;
      const y = (v * h) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
    ctx.restore();

    // Draw main waveform line with gradient
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, this.primaryColor);
    gradient.addColorStop(0.5, this.secondaryColor);
    gradient.addColorStop(1, this.primaryColor);

    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = gradient;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = data[i] / 128.0;
      const y = (v * h) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();

    // Draw amplitude envelope (subtle fill)
    ctx.beginPath();
    ctx.fillStyle = 'hsla(38, 92%, 50%, 0.04)';
    ctx.moveTo(0, h / 2);
    x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = data[i] / 128.0;
      const y = (v * h) / 2;
      ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(w, h / 2);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw background grid lines
   */
  _drawGrid() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 0.5;

    // Horizontal lines
    const hLines = 4;
    for (let i = 1; i < hLines; i++) {
      const y = (h / hLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vertical lines
    const vLines = 8;
    for (let i = 1; i < vLines; i++) {
      const x = (w / vLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }

  /**
   * Handle canvas resize
   */
  _handleResize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    // Redraw if not running
    if (!this.isRunning) {
      this.drawIdle();
    }
  }

  /**
   * Destroy and clean up
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._handleResize);
  }
}
