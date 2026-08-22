/**
 * Procedural 8-bit audio engine — generates all music & SFX via Web Audio API.
 * Zero external files. Zero copyright. Fully unique chiptune sounds.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicPlaying = false;
let musicTimeout: ReturnType<typeof setTimeout> | null = null;
let _muted = false;

function ctx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.3;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

/** Resume audio context on first user gesture */
export function initAudio() {
  ctx();
}

/** Toggle mute */
export function toggleMute(): boolean {
  _muted = !_muted;
  if (masterGain) masterGain.gain.value = _muted ? 0 : 0.5;
  return _muted;
}

export function isMuted(): boolean {
  return _muted;
}

// ─── Helpers ───

function noteFreq(note: string): number {
  const notes: Record<string, number> = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.0,
    C6: 1046.5,
  };
  return notes[note] || 440;
}

/** Play a square wave note */
function playNote(
  freq: number,
  start: number,
  duration: number,
  gainNode: GainNode | null,
  volume = 0.3,
  type: OscillatorType = "square"
) {
  if (!gainNode) return;
  const c = ctx();
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(volume, start);
  env.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(env);
  env.connect(gainNode);
  osc.start(start);
  osc.stop(start + duration);
}

/** Play a noise burst (for percussion) */
function playNoise(start: number, duration: number, gainNode: GainNode | null, volume = 0.2) {
  if (!gainNode) return;
  const c = ctx();
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const env = c.createGain();
  env.gain.setValueAtTime(volume, start);
  env.gain.exponentialRampToValueAtTime(0.001, start + duration);
  src.connect(env);
  env.connect(gainNode);
  src.start(start);
  src.stop(start + duration);
}

// ─── Sound Effects ───

/** Collect a shawarma — cheerful ascending blip */
export function playCollect() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  const melody = [noteFreq("E5"), noteFreq("G5"), noteFreq("C6")];
  melody.forEach((f, i) => {
    playNote(f, now + i * 0.06, 0.1, sfxGain, 0.25);
  });
}

/** Combo sound — higher pitched rapid blips */
export function playCombo(level: number) {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  const baseFreq = 440 + level * 80;
  for (let i = 0; i < Math.min(level, 6); i++) {
    playNote(baseFreq + i * 120, now + i * 0.04, 0.08, sfxGain, 0.2);
  }
}

/** Hit by CHUB — descending buzz */
export function playHit() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  playNote(400, now, 0.15, sfxGain, 0.35, "sawtooth");
  playNote(200, now + 0.08, 0.2, sfxGain, 0.3, "sawtooth");
  playNoise(now, 0.12, sfxGain, 0.15);
}

/** Round complete — triumphant fanfare */
export function playRoundComplete() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  const fanfare = [
    noteFreq("C4"), noteFreq("E4"), noteFreq("G4"), noteFreq("C5"),
    noteFreq("E5"), noteFreq("G5"), noteFreq("C6"),
  ];
  fanfare.forEach((f, i) => {
    playNote(f, now + i * 0.1, 0.15, sfxGain, 0.25);
  });
  // Shimmer
  playNoise(now + 0.7, 0.3, sfxGain, 0.08);
}

/** Game over — sad descending notes */
export function playGameOver() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  const sad = [noteFreq("E5"), noteFreq("D5"), noteFreq("C5"), noteFreq("A4"), noteFreq("G4")];
  sad.forEach((f, i) => {
    playNote(f, now + i * 0.2, 0.3, sfxGain, 0.25, "triangle");
  });
}

/** Menu button click */
export function playClick() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  playNote(800, now, 0.05, sfxGain, 0.15);
  playNote(1200, now + 0.03, 0.04, sfxGain, 0.1);
}

/** Player step — subtle tick */
export function playStep() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  playNoise(now, 0.03, sfxGain, 0.04);
}

/** Pause toggle — soft tone */
export function playPause() {
  const c = ctx();
  if (!sfxGain) return;
  const now = c.currentTime;
  playNote(600, now, 0.1, sfxGain, 0.15, "triangle");
}

// ─── Background Music ───

/** Chiptune melody patterns — upbeat arcade loop */
const MUSIC_BPM = 140;
const BEAT = 60 / MUSIC_BPM;

const melodyPattern: [string, number][] = [
  ["C4", 1], ["E4", 1], ["G4", 1], ["C5", 1],
  ["B4", 0.5], ["A4", 0.5], ["G4", 1],
  ["A4", 0.5], ["B4", 0.5], ["C5", 1], ["E5", 1],
  ["D5", 0.5], ["C5", 0.5], ["B4", 1],
  ["G4", 0.5], ["A4", 0.5], ["B4", 1], ["G4", 1],
  ["E4", 1], ["F4", 0.5], ["G4", 0.5],
  ["A4", 1], ["G4", 0.5], ["F4", 0.5], ["E4", 1],
  ["D4", 0.5], ["E4", 0.5], ["C4", 2],
];

const bassPattern: [string, number][] = [
  ["C3", 2], ["G3", 2],
  ["A3", 2], ["E3", 2],
  ["F3", 2], ["G3", 2],
  ["A3", 2], ["C3", 2],
];

function playMusicLoop() {
  if (!musicPlaying || !musicGain) return;
  const c = ctx();
  const now = c.currentTime;

  // Melody
  let t = 0;
  for (const [note, beats] of melodyPattern) {
    playNote(noteFreq(note), now + t, beats * BEAT * 0.9, musicGain, 0.12);
    t += beats * BEAT;
  }
  const melodyLen = t;

  // Bass
  let bt = 0;
  for (const [note, beats] of bassPattern) {
    playNote(noteFreq(note), now + bt, beats * BEAT * 0.8, musicGain, 0.08, "triangle");
    bt += beats * BEAT;
  }

  // Percussion — kick on beat, hi-hat on off-beat
  const totalBeats = Math.floor(melodyLen / BEAT);
  for (let i = 0; i < totalBeats; i++) {
    const beatTime = now + i * BEAT;
    if (i % 4 === 0) {
      // Kick
      const osc = c.createOscillator();
      const env = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, beatTime);
      osc.frequency.exponentialRampToValueAtTime(40, beatTime + 0.1);
      env.gain.setValueAtTime(0.2, beatTime);
      env.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.1);
      osc.connect(env);
      env.connect(musicGain);
      osc.start(beatTime);
      osc.stop(beatTime + 0.1);
    }
    if (i % 2 === 1) {
      // Hi-hat
      playNoise(beatTime, 0.04, musicGain, 0.04);
    }
  }

  // Schedule next loop
  musicTimeout = setTimeout(playMusicLoop, melodyLen * 1000);
}

/** Start background music */
export function startMusic() {
  if (musicPlaying) return;
  ctx();
  musicPlaying = true;
  playMusicLoop();
}

/** Stop background music */
export function stopMusic() {
  musicPlaying = false;
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
}
