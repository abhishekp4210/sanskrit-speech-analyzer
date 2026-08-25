/**
 * RecordButton — Circular record button with pulse animation
 * Manages recording state and timer display.
 */
export class RecordButton {
  constructor() {
    this.button = document.getElementById('btn-record');
    this.micIcon = document.getElementById('mic-icon');
    this.stopIcon = document.getElementById('stop-icon');
    this.label = document.getElementById('record-label');
    this.timer = document.getElementById('record-timer');

    this.isRecording = false;
    this.timerInterval = null;
    this.startTime = 0;
    this.onClick = null;

    this._setupEvents();
  }

  /**
   * Set up click handler
   */
  _setupEvents() {
    this.button.addEventListener('click', () => {
      if (this.onClick) this.onClick();
    });

    // Keyboard accessibility
    this.button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (this.onClick) this.onClick();
      }
    });
  }

  /**
   * Set recording state
   */
  setRecording(recording) {
    this.isRecording = recording;

    if (recording) {
      this.button.classList.add('recording');
      this.micIcon.classList.add('hidden');
      this.stopIcon.classList.remove('hidden');
      this.label.textContent = 'Tap to Stop';
      this.label.style.color = 'var(--danger)';
      this._startTimer();
    } else {
      this.button.classList.remove('recording');
      this.micIcon.classList.remove('hidden');
      this.stopIcon.classList.add('hidden');
      this.label.textContent = 'Tap to Record';
      this.label.style.color = '';
      this._stopTimer();
    }
  }

  /**
   * Set processing state (between recording and results)
   */
  setProcessing() {
    this.button.classList.remove('recording');
    this.label.textContent = 'Processing...';
    this.label.style.color = 'var(--accent-primary)';
    this._stopTimer();
  }

  /**
   * Start the recording timer display
   */
  _startTimer() {
    this.startTime = Date.now();
    this.timer.classList.remove('hidden');
    this.timer.textContent = '00:00';

    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const seconds = Math.floor(elapsed / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      this.timer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 200);
  }

  /**
   * Stop the recording timer
   */
  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timer.classList.add('hidden');
  }

  /**
   * Set the click handler
   */
  setOnClick(fn) {
    this.onClick = fn;
  }

  /**
   * Destroy
   */
  destroy() {
    this._stopTimer();
    this.onClick = null;
  }
}
