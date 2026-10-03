/**
 * Audio Visualizer Engine
 * Real-time Canvas Web Audio API Spectrum and Waveform Visualizer
 */

class AudioVisualizer {
  constructor(canvasId, audioElement) {
    this.canvas = document.getElementById(canvasId);
    this.audio = audioElement;
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.animationId = null;
    this.isRunning = false;
    this.isSimulating = false;
    this.simulationPhase = 0;

    this.initCanvasResolution();
    window.addEventListener('resize', () => this.initCanvasResolution());
  }

  /**
   * Ensure crisp canvas rendering on Retina / HiDPI screens
   */
  initCanvasResolution() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = (rect.width || 600) * dpr;
    this.canvas.height = (rect.height || 140) * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  /**
   * Connect Audio Element to Web Audio Context
   */
  setupAudioContext() {
    if (this.audioContext) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Connect source to analyser and to speakers
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    } catch (err) {
      console.warn('Web Audio API setup notice:', err.message);
    }
  }

  /**
   * Start Visualizer Loop
   */
  start() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.isRunning = true;
    this.isSimulating = false;
    document.getElementById('visualizerIdleOverlay')?.classList.add('hidden');

    const render = () => {
      if (!this.isRunning) return;

      this.draw();
      this.animationId = requestAnimationFrame(render);
    };

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(render);
  }

  /**
   * Start dynamic simulation (used during demo speech or synthesis generation)
   */
  startSimulation() {
    this.isRunning = true;
    this.isSimulating = true;
    document.getElementById('visualizerIdleOverlay')?.classList.add('hidden');

    const render = () => {
      if (!this.isRunning || !this.isSimulating) return;

      this.drawSimulation();
      this.animationId = requestAnimationFrame(render);
    };

    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(render);
  }

  /**
   * Stop Visualizer Loop
   */
  stop() {
    this.isRunning = false;
    this.isSimulating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.clear();
    document.getElementById('visualizerIdleOverlay')?.classList.remove('hidden');
  }

  /**
   * Clear canvas
   */
  clear() {
    if (!this.ctx || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
  }

  /**
   * Render real audio frequency bars
   */
  draw() {
    if (!this.ctx || !this.analyser || !this.dataArray) {
      this.drawSimulation();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.analyser.getByteFrequencyData(this.dataArray);
    this.ctx.clearRect(0, 0, width, height);

    // Number of bars
    const barCount = 48;
    const barWidth = (width / barCount) - 3;
    const step = Math.floor(this.dataArray.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = this.dataArray[i * step] || 0;
      const percent = value / 255;
      const barHeight = Math.max(4, percent * (height - 20));
      const x = i * (barWidth + 3);
      const y = height - barHeight - 10;

      // Dynamic color gradient (violet to cyan)
      const grad = this.ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(0.6, '#6366f1');
      grad.addColorStop(1, '#06b6d4');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
      this.ctx.fill();

      // Glowing peak cap
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y - 3, barWidth, 2, [1, 1, 1, 1]);
      this.ctx.fill();
    }
  }

  /**
   * Render simulated dynamic acoustic wave (for demo speech or pre-buffering)
   */
  drawSimulation() {
    if (!this.ctx || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    this.ctx.clearRect(0, 0, width, height);
    this.simulationPhase += 0.08;

    const barCount = 48;
    const barWidth = (width / barCount) - 3;

    for (let i = 0; i < barCount; i++) {
      // Harmonic wave formula
      const wave1 = Math.sin(i * 0.25 + this.simulationPhase);
      const wave2 = Math.cos(i * 0.15 - this.simulationPhase * 0.8);
      const combined = Math.abs((wave1 + wave2) * 0.5);
      const barHeight = Math.max(6, combined * (height - 24));
      
      const x = i * (barWidth + 3);
      const y = height - barHeight - 10;

      const grad = this.ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, '#7c3aed');
      grad.addColorStop(0.6, '#8b5cf6');
      grad.addColorStop(1, '#38bdf8');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
      this.ctx.fill();

      // Top glowing indicator
      this.ctx.fillStyle = '#e0e7ff';
      this.ctx.beginPath();
      this.ctx.roundRect(x, y - 3, barWidth, 2, [1, 1, 1, 1]);
      this.ctx.fill();
    }
  }
}

window.AudioVisualizer = AudioVisualizer;
