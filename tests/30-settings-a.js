// Madde 30, aşama 1: menü düğmeleri, ayarların hemen etkili olması
const g = window.game, p = g.player;
const playText0 = document.getElementById('play').textContent;
const saveHiddenBefore = document.getElementById('save-now').hidden;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const resumeShown = document.getElementById('play').textContent === 'Devam et' && !document.getElementById('save-now').hidden;
// Ayarlar görünümü
document.getElementById('open-settings').click();
const settingsOpen = !document.getElementById('menu-settings').hidden && document.getElementById('menu-main').hidden;
const set = (id, value) => {
  const el = document.getElementById(id);
  if (el.type === 'checkbox') { el.checked = value; el.dispatchEvent(new Event('change')); }
  else { el.value = value; el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input')); }
};
// Fare hassasiyeti: iki katı -> aynı fare hareketi iki kat döndürür
const canvas = document.querySelector('#game canvas');
const turn = () => {
  const y0 = p.yaw;
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  document.dispatchEvent(new MouseEvent('mousemove', { movementX: 100, movementY: 0, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  return y0 - p.yaw;
};
const before = turn();
set('set-sensitivity', 0.005);
const after = turn();
const sensitivityOk = Math.abs(after / before - 2) < 0.01;
// Görüş alanı ve görüş mesafesi
set('set-fov', 90);
set('set-view', 'far');
await wait(1500);
const fovOk = Math.abs(g.camera.fov - 90) < 1;
const fogOk = g.camera && Math.abs(window.game.fogFar() - 120) < 0.01;
// Y ekseni ters
set('set-invert', true);
const pitch0 = p.pitch;
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
document.dispatchEvent(new MouseEvent('mousemove', { movementX: 0, movementY: 40, bubbles: true }));
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const invertOk = p.pitch > pitch0;
document.getElementById('settings-back').click();
const backOk = !document.getElementById('menu-main').hidden;
await wait(400);
return { ok: playText0 === 'Oyna' && saveHiddenBefore && resumeShown && settingsOpen && sensitivityOk && fovOk && fogOk && invertOk && backOk,
  playText0, saveHiddenBefore, resumeShown, settingsOpen, sensitivityOk, fovOk, fogOk, invertOk, backOk };
