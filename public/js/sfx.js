// Zenithia — Procedural Sound Effects (Web Audio API)
// No external files needed — all generated via oscillators + noise

let _ctx = null;
function getCtx() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// Master volume
let _masterVol = 0.4;
function setMasterVolume(v) { _masterVol = Math.max(0, Math.min(1, v)); }

// Helper: play a tone
function playTone(freq, duration, type = 'square', vol = 0.3, detune = 0) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(vol * _masterVol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// Helper: noise burst
function playNoise(duration, vol = 0.2, filterFreq = 2000) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol * _masterVol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

// Helper: sweep
function playSweep(startFreq, endFreq, duration, type = 'sawtooth', vol = 0.2) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
  gain.gain.setValueAtTime(vol * _masterVol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

// === GAME SOUNDS ===

function sfxAttack() {
  // Quick swoosh — sweep down + noise
  playSweep(800, 200, 0.12, 'sawtooth', 0.25);
  playNoise(0.08, 0.15, 3000);
}

function sfxHit() {
  // Impact — low thud + noise burst
  playTone(120, 0.1, 'square', 0.35);
  playNoise(0.06, 0.2, 1500);
}

function sfxCrit() {
  // Critical hit — higher pitch impact + extra crunch
  playTone(300, 0.08, 'square', 0.3);
  playTone(200, 0.12, 'sawtooth', 0.25);
  playNoise(0.08, 0.25, 2000);
}

function sfxMonsterDeath() {
  // Descending pitch + noise
  playSweep(400, 80, 0.3, 'square', 0.2);
  playNoise(0.2, 0.15, 1000);
}

function sfxLevelUp() {
  // Ascending arpeggio — celebratory
  const ctx = getCtx();
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.3, 'square', 0.25), i * 100);
  });
  // Sparkle overlay
  setTimeout(() => playTone(1568, 0.5, 'sine', 0.1), 350);
}

function sfxSkillCast() {
  // Whoosh + sparkle
  playSweep(300, 1200, 0.2, 'sine', 0.2);
  playTone(880, 0.15, 'triangle', 0.15);
}

function sfxHeal() {
  // Soft ascending chime
  const notes = [440, 554, 659, 880];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.25, 'sine', 0.15), i * 80);
  });
}

function sfxFootstep() {
  // Subtle tap
  playNoise(0.03, 0.06, 800);
  playTone(60, 0.03, 'square', 0.04);
}

function sfxUIClick() {
  // Soft click
  playTone(800, 0.04, 'sine', 0.1);
}

function sfxNPCInteract() {
  // Friendly chime
  playTone(660, 0.12, 'triangle', 0.15);
  setTimeout(() => playTone(880, 0.15, 'triangle', 0.12), 80);
}

function sfxPickup() {
  // Quick ascending blip
  playSweep(600, 1200, 0.1, 'square', 0.15);
}

function sfxDamageTaken() {
  // Low buzz
  playTone(100, 0.15, 'sawtooth', 0.2);
  playNoise(0.05, 0.1, 1000);
}

function sfxBuff() {
  // Rising sparkle
  playSweep(500, 1500, 0.25, 'sine', 0.12);
  playTone(1200, 0.2, 'triangle', 0.08);
}

function sfxQuestComplete() {
  // Fanfare
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.35, 'square', 0.2), i * 120);
  });
}

function sfxMonsterAggro() {
  // Angry growl — low sweep
  playSweep(150, 80, 0.2, 'sawtooth', 0.2);
  playNoise(0.15, 0.12, 600);
}

// Expose globally
window.ZenSFX = {
  setMasterVolume,
  attack: sfxAttack,
  hit: sfxHit,
  crit: sfxCrit,
  monsterDeath: sfxMonsterDeath,
  levelUp: sfxLevelUp,
  skillCast: sfxSkillCast,
  heal: sfxHeal,
  footstep: sfxFootstep,
  uiClick: sfxUIClick,
  npcInteract: sfxNPCInteract,
  pickup: sfxPickup,
  damageTaken: sfxDamageTaken,
  buff: sfxBuff,
  questComplete: sfxQuestComplete,
  monsterAggro: sfxMonsterAggro,
};
