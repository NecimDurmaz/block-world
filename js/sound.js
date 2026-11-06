// ---------- Ses ----------
// Bütün sesler WebAudio ile kodla üretilir: gürültü + filtre (bloklar, adım, hasar) ve osilatör (canlılar, toplama).
// AudioContext ilk "Oyna" tıklamasında açılır (tarayıcılar sesi ancak kullanıcı etkileşiminden sonra başlatır).

let audio = null, soundOn = true;
const SOUND_RANGE = 16;     // canlı sesleri bu uzaklıkta sıfıra iner
const soundLog = [];        // son çalınan seslerin adı ve şiddeti (testler için)

function initAudio() {
  if (audio) return;
  try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (err) { audio = null; }
}
function logSound(name, volume) {
  soundLog.push({ name, volume });
  if (soundLog.length > 50) soundLog.shift();
}
// Bir sesin genel akışı: kaynak -> (filtre) -> ses seviyesi zarfı -> hoparlör
function envelope(volume, duration) {
  const g = audio.createGain(), t = audio.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  g.connect(audio.destination);
  return g;
}
let noiseBuffer = null;
function playNoise(name, { duration, freq, q = 1, volume = 0.25, filter = 'bandpass' }) {
  logSound(name, volume);
  if (!soundOn || !audio) return;
  if (!noiseBuffer) {
    noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer;
  const f = audio.createBiquadFilter();
  f.type = filter; f.frequency.value = freq; f.Q.value = q;
  src.connect(f).connect(envelope(volume, duration));
  src.start(); src.stop(audio.currentTime + duration);
}
// freq -> endFreq kayan ton; vibrato: titreşim sıklığı (Hz)
function playTone(name, { freq, endFreq = freq, duration, type = 'sine', volume = 0.2, vibrato = 0, lowpass = 0 }) {
  logSound(name, volume);
  if (!soundOn || !audio) return;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  if (vibrato) {
    const lfo = audio.createOscillator(), depth = audio.createGain();
    lfo.frequency.value = vibrato; depth.gain.value = freq * 0.06;
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(); lfo.stop(t + duration);
  }
  let out = osc;
  if (lowpass) { const f = audio.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lowpass; out = osc.connect(f); }
  out.connect(envelope(volume, duration));
  osc.start(); osc.stop(t + duration);
}

// Bloğun "malzemesine" göre filtre frekansı: toprak boğuk, taş tiz, ahşap orta, yaprak ve cam çok tiz.
function blockMaterialFreq(block) {
  const def = BLOCKS[block];
  if (!def) return 1500;
  if (block === B.glass) return 5200;
  if (block === B.leaves || def.model === 'cross') return 4200;
  if (def.tool === 'shovel' || block === B.farmland) return 700;
  if (def.tool === 'axe') return 1100;
  if (def.tool === 'pickaxe') return 2600;
  return 1500;
}
// kind: 'break' kırılınca, 'dig' kazarken, 'place' koyunca, 'step' adımda
function blockSound(block, kind) {
  const freq = blockMaterialFreq(block);
  const settings = {
    break: { duration: 0.22, volume: 0.3, q: 0.8 },
    dig: { duration: 0.08, volume: 0.12, q: 1.2 },
    place: { duration: 0.12, volume: 0.25, q: 1 },
    step: { duration: 0.07, volume: 0.08, q: 0.7 },
  }[kind];
  playNoise(kind, { freq: kind === 'step' ? freq * 0.6 : freq, ...settings });
}
const hurtSound = () => playNoise('hurt', { duration: 0.18, freq: 500, q: 0.6, volume: 0.35, filter: 'lowpass' });
const popSound = () => playTone('pop', { freq: 600, endFreq: 1400, duration: 0.08, volume: 0.15 });

// Canlı sesleri: tür başına bir ton tarifi
const MOB_SOUNDS = {
  cow: { freq: 120, endFreq: 95, duration: 0.7, type: 'sawtooth', volume: 0.18, lowpass: 600 },
  pig: { freq: 190, endFreq: 150, duration: 0.25, type: 'sawtooth', volume: 0.15, lowpass: 900 },
  chicken: { freq: 1400, endFreq: 1900, duration: 0.07, type: 'square', volume: 0.08 },
  sheep: { freq: 380, endFreq: 360, duration: 0.55, type: 'triangle', volume: 0.16, vibrato: 9 },
  zombie: { freq: 95, endFreq: 70, duration: 0.9, type: 'sawtooth', volume: 0.16, lowpass: 400 },
};
// Yakındaki (16 blok) canlılar 5–12 sn arayla ses çıkarır; ses uzaklıkla doğrusal azalır.
function updateMobSounds(dt) {
  for (const m of mobs) {
    const recipe = MOB_SOUNDS[m.kind];
    if (!recipe || m.dying > 0) continue;
    m.soundTimer = (m.soundTimer ?? 2 + Math.random() * 8) - dt;
    if (m.soundTimer > 0) continue;
    m.soundTimer = 5 + Math.random() * 7;
    const dist = Math.hypot(m.x - player.x, m.y - player.y, m.z - player.z);
    if (dist >= SOUND_RANGE) continue;
    playTone(m.kind, { ...recipe, volume: recipe.volume * (1 - dist / SOUND_RANGE) });
  }
}

// Adım sesi: yerde yürürken 0,4 sn'de (koşarken 0,3 sn'de) bir, ayağın altındaki bloğa göre
let stepTimer = 0;
function updateSteps(dt, moving, running) {
  if (!moving || !player.onGround) { stepTimer = 0; return; }
  stepTimer -= dt;
  if (stepTimer > 0) return;
  stepTimer = running ? 0.3 : 0.4;
  const below = get(Math.floor(player.x), Math.floor(player.y - 0.05), Math.floor(player.z));
  if (below !== AIR) blockSound(below, 'step');
}

// Duraklatma panelindeki ses düğmesi
// Aç/kapat ayarlardan gelir (settings.js)
function setSound(on) { soundOn = on; }

Object.assign(window.game, { soundLog, setSound, isSoundOn: () => soundOn, audioReady: () => !!audio });
