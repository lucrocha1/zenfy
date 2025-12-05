export type SoundType = 'bell' | 'gong' | 'nature' | 'silent';

export const SOUND_OPTIONS: { value: SoundType; label: string }[] = [
  { value: 'bell', label: 'Sino' },
  { value: 'gong', label: 'Gongo' },
  { value: 'nature', label: 'Natureza' },
  { value: 'silent', label: 'Silêncio' },
];

const SOUND_STORAGE_KEY = 'meditation_sound';

export const getSavedSound = (): SoundType => {
  const saved = localStorage.getItem(SOUND_STORAGE_KEY);
  return (saved as SoundType) || 'bell';
};

export const saveSound = (sound: SoundType) => {
  localStorage.setItem(SOUND_STORAGE_KEY, sound);
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
  if (type === 'silent') return;
  
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
