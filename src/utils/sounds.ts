export type SoundType = 'bell' | 'gong' | 'nature';

export type AmbientSoundType = 'silent' | 'rain' | 'ocean' | 'tibetan' | 'zen' | 'pink-noise';

export const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: 'bell', label: 'Sino' },
  { value: 'gong', label: 'Gongo' },
  { value: 'nature', label: 'Natureza' },
];

export const AMBIENT_SOUND_OPTIONS: { value: AmbientSoundType; label: string }[] = [
  { value: 'silent', label: 'Silêncio' },
  { value: 'rain', label: 'Chuva Suave' },
  { value: 'ocean', label: 'Ondas do Mar' },
  { value: 'tibetan', label: 'Tigelas Tibetanas' },
  { value: 'zen', label: 'Ambiente Zen' },
  { value: 'pink-noise', label: 'Ruído Rosa' },
];

const SOUND_STORAGE_KEY = 'meditation_sound';
const AMBIENT_SOUND_STORAGE_KEY = 'meditation_ambient_sound';

export const getSavedSound = (): SoundType => {
  const saved = localStorage.getItem(SOUND_STORAGE_KEY);
  if (saved === 'silent') return 'bell'; // Migrate old "silent" to "bell"
  return (saved as SoundType) || 'bell';
};

export const saveSound = (sound: SoundType) => {
  localStorage.setItem(SOUND_STORAGE_KEY, sound);
};

export const getSavedAmbientSound = (): AmbientSoundType => {
  const saved = localStorage.getItem(AMBIENT_SOUND_STORAGE_KEY);
  return (saved as AmbientSoundType) || 'silent';
};

export const saveAmbientSound = (sound: AmbientSoundType) => {
  localStorage.setItem(AMBIENT_SOUND_STORAGE_KEY, sound);
};

// Bell sound - high frequency, clean tone
const playBellSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(528, audioContext.currentTime);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 2);
};

// Gong sound - low frequency with overtones
const playGongSound = (audioContext: AudioContext) => {
  const frequencies = [110, 220, 330, 440];
  
  frequencies.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    oscillator.type = 'sine';
    
    const volume = 0.25 / (i + 1);
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);
  });
};

// Nature sound - water/wind-like white noise
const playNatureSound = (audioContext: AudioContext) => {
  const bufferSize = audioContext.sampleRate * 2;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = audioContext.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, audioContext.currentTime);
  
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.5);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
  
  whiteNoise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  whiteNoise.start(audioContext.currentTime);
  whiteNoise.stop(audioContext.currentTime + 2);
};

export const playSound = (type: SoundType) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  switch (type) {
    case 'bell':
      playBellSound(audioContext);
      break;
    case 'gong':
      playGongSound(audioContext);
      break;
    case 'nature':
      playNatureSound(audioContext);
      break;
  }
};

// Celebration sound - ascending chimes for goal achievement
export const playCelebrationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Ascending happy chimes
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 - major chord arpeggio
  const delays = [0, 0.12, 0.24, 0.36];
  
  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + delays[i]);
    oscillator.type = 'sine';
    
    // Bell-like envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + delays[i]);
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + delays[i] + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delays[i] + 0.8);
    
    oscillator.start(audioContext.currentTime + delays[i]);
    oscillator.stop(audioContext.currentTime + delays[i] + 0.8);
  });
  
  // Add a subtle shimmer/sparkle effect
  setTimeout(() => {
    const shimmerContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sparkleFreqs = [1318.51, 1567.98, 2093.00]; // E6, G6, C7
    
    sparkleFreqs.forEach((freq, i) => {
      const osc = shimmerContext.createOscillator();
      const gain = shimmerContext.createGain();
      
      osc.connect(gain);
      gain.connect(shimmerContext.destination);
      
      osc.frequency.setValueAtTime(freq, shimmerContext.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.08, shimmerContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, shimmerContext.currentTime + 0.5);
      
      osc.start(shimmerContext.currentTime + i * 0.05);
      osc.stop(shimmerContext.currentTime + 0.5 + i * 0.05);
    });
  }, 400);
};

// ============= AMBIENT SOUNDS =============

class AmbientSoundPlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sourceNodes: AudioBufferSourceNode[] = [];
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private currentType: AmbientSoundType = 'silent';
  private silentAudio: HTMLAudioElement | null = null;

  constructor() {
    // Set up visibility change listener to resume audio when coming back
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isPlaying && this.audioContext) {
          // Resume audio context if it was suspended
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
        }
      });
    }
  }

  // Create a silent audio element to help keep audio alive on mobile
  private createSilentAudio() {
    if (this.silentAudio) return;
    
    // Create a very short silent audio using data URI
    // This helps keep the audio session alive on some mobile browsers
    const silentDataUri = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    this.silentAudio = new Audio(silentDataUri);
    this.silentAudio.loop = true;
    this.silentAudio.volume = 0.01; // Nearly silent
  }

  start(type: AmbientSoundType) {
    if (type === 'silent') return;
    
    this.stop();
    this.currentType = type;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    this.gainNode.connect(this.audioContext.destination);
    this.isPlaying = true;

    // Start silent audio to help keep audio session alive on mobile
    this.createSilentAudio();
    if (this.silentAudio) {
      this.silentAudio.play().catch(() => {
        // Ignore errors - this is just a helper
      });
    }

    switch (type) {
      case 'rain':
        this.playRain();
        break;
      case 'ocean':
        this.playOcean();
        break;
      case 'tibetan':
        this.playTibetan();
        break;
      case 'zen':
        this.playZen();
        break;
      case 'pink-noise':
        this.playPinkNoise();
        break;
    }
  }

  stop() {
    this.isPlaying = false;
    
    // Stop silent audio helper
    if (this.silentAudio) {
      this.silentAudio.pause();
      this.silentAudio.currentTime = 0;
    }
    
    this.sourceNodes.forEach(node => {
      try { node.stop(); } catch {}
    });
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.sourceNodes = [];
    this.oscillators = [];
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // Resume audio if it was interrupted (e.g., by phone call or screen lock)
  resume() {
    if (this.isPlaying && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.silentAudio && this.isPlaying) {
      this.silentAudio.play().catch(() => {});
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  private createNoiseBuffer(duration: number): AudioBuffer {
    const bufferSize = this.audioContext!.sampleRate * duration;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private loopNoise(filterType: BiquadFilterType, filterFreq: number, volume: number) {
    if (!this.isPlaying || !this.audioContext || !this.gainNode) return;

    const buffer = this.createNoiseBuffer(4);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, this.audioContext.currentTime);

    const localGain = this.audioContext.createGain();
    localGain.gain.setValueAtTime(volume, this.audioContext.currentTime);

    source.connect(filter);
    filter.connect(localGain);
    localGain.connect(this.gainNode);
    source.start();
    this.sourceNodes.push(source);
  }

  private playRain() {
    // Multiple layers of filtered noise for realistic rain
    this.loopNoise('lowpass', 1000, 0.4);
    this.loopNoise('bandpass', 3000, 0.2);
    this.loopNoise('highpass', 5000, 0.1);
  }

  private playOcean() {
    if (!this.audioContext || !this.gainNode) return;

    // Base ocean rumble
    this.loopNoise('lowpass', 300, 0.3);

    // Sweeping waves effect using LFO
    const buffer = this.createNoiseBuffer(8);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    
    const lfo = this.audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.setValueAtTime(400, this.audioContext.currentTime);
    
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    filter.frequency.setValueAtTime(600, this.audioContext.currentTime);

    const localGain = this.audioContext.createGain();
    localGain.gain.setValueAtTime(0.35, this.audioContext.currentTime);

    source.connect(filter);
    filter.connect(localGain);
    localGain.connect(this.gainNode);
    
    source.start();
    lfo.start();
    this.sourceNodes.push(source);
    this.oscillators.push(lfo);
  }

  private playTibetan() {
    if (!this.audioContext || !this.gainNode) return;

    // Tibetan singing bowl frequencies with harmonics
    const playBowl = (baseFreq: number, delay: number) => {
      if (!this.audioContext || !this.gainNode) return;

      const harmonics = [1, 2, 2.5, 3, 4];
      harmonics.forEach((mult, i) => {
        const osc = this.audioContext!.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * mult, this.audioContext!.currentTime);

        const oscGain = this.audioContext!.createGain();
        const volume = 0.15 / (i + 1);
        oscGain.gain.setValueAtTime(0, this.audioContext!.currentTime);
        oscGain.gain.linearRampToValueAtTime(volume, this.audioContext!.currentTime + delay + 0.5);
        oscGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + delay + 8);

        osc.connect(oscGain);
        oscGain.connect(this.gainNode!);
        osc.start(this.audioContext!.currentTime + delay);
        osc.stop(this.audioContext!.currentTime + delay + 8);
        this.oscillators.push(osc);
      });
    };

    // Play bowls in sequence, then loop
    const sequence = () => {
      if (!this.isPlaying) return;
      playBowl(220, 0);    // A3
      playBowl(261, 3);    // C4
      playBowl(329, 6);    // E4
      setTimeout(() => sequence(), 10000);
    };
    sequence();
  }

  private playZen() {
    if (!this.audioContext || !this.gainNode) return;

    // Soft pad-like ambient drone
    const frequencies = [110, 165, 220, 330];
    frequencies.forEach((freq) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioContext!.currentTime);

      const oscGain = this.audioContext!.createGain();
      oscGain.gain.setValueAtTime(0.08, this.audioContext!.currentTime);

      // Subtle vibrato
      const lfo = this.audioContext!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.2 + Math.random() * 0.1, this.audioContext!.currentTime);
      const lfoGain = this.audioContext!.createGain();
      lfoGain.gain.setValueAtTime(2, this.audioContext!.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode!);
      osc.start();
      lfo.start();
      this.oscillators.push(osc, lfo);
    });

    // Add subtle nature texture
    this.loopNoise('lowpass', 400, 0.05);
  }

  private playPinkNoise() {
    if (!this.audioContext || !this.gainNode) return;

    // Pink noise has equal energy per octave (more bass than white noise)
    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Pink noise generation using Voss-McCartney algorithm approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const localGain = this.audioContext.createGain();
    localGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);

    source.connect(localGain);
    localGain.connect(this.gainNode);
    source.start();
    this.sourceNodes.push(source);
  }
}

export const ambientPlayer = new AmbientSoundPlayer();
