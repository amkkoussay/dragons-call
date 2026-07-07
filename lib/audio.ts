export class AudioManager {
  private ctx: AudioContext | null = null;
  private windNode: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;

  init() {
    if (this.ctx) return; // already initialized
    this.ctx = new AudioContext();
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.05;
    this.windGain.connect(this.ctx.destination);
  }

  private createPinkNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not initialized');

    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    return buffer;
  }

  startWind() {
    if (!this.ctx || !this.windGain) return;
    if (this.windNode) return; // already playing

    const buffer = this.createPinkNoiseBuffer();
    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = buffer;
    this.windNode.loop = true;
    this.windNode.connect(this.windGain);
    this.windNode.start();
  }

  setWindIntensity(intensity: number) {
    if (this.windGain) {
      this.windGain.gain.value = 0.05 + intensity * 0.15;
    }
  }

  stop() {
    if (this.windNode) {
      this.windNode.stop();
      this.windNode.disconnect();
      this.windNode = null;
    }
  }
}

export const audioManager = new AudioManager();
