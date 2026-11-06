// ---------- Girdi ----------
// Klavye, fare, fare kilidi, duraklatma.

const keys = {};
const VIEWS = ['Arkadan', 'Gözden', 'Önden'];
let selected = 0, playing = false, dead = false, inventoryOpen = false, fallbackLook = false, view = 0, sprinting = false, lastWTap = 0, lastSpaceTap = 0;
const overlay = document.getElementById('overlay');
const canvas = renderer.domElement;

window.addEventListener('keydown', e => {
  // Sohbet: T boş, "/" komut için açar (harfin kutuya yazılmaması için varsayılan engellenir)
  if (playing && !inventoryOpen && !chatOpen && !controlOpen && (e.code === 'KeyT' || e.key === '/')) {
    e.preventDefault();
    openChat(e.key === '/' ? '/' : '');
    return;
  }
  if (e.code === 'KeyW' && !e.repeat) {
    const now = performance.now();
    if (now - lastWTap < 300) sprinting = true;
    lastWTap = now;
  }
  // Uçma açıkken boşluğa 300 ms içinde iki kez basmak uçuşu açar/kapatır.
  if (e.code === 'Space' && !e.repeat && flyAllowed && playing) {
    const now = performance.now();
    if (now - lastSpaceTap < 300) { flying = !flying; lastSpaceTap = 0; } else lastSpaceTap = now;
  }
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
  if (/^Digit[1-9]$/.test(e.code)) selectSlot(+e.code.slice(5) - 1);
  if (e.code === 'KeyV' && !e.repeat) { view = (view + 1) % VIEWS.length; toast('Kamera: ' + VIEWS[view]); }
  if (e.code === 'KeyK' && !e.repeat && playing && !chatOpen) controlOpen ? closeControl() : openControl();
  if (e.code === 'KeyE' && !e.repeat && playing && !controlOpen) inventoryOpen ? closeInventory() : openInventory();
  if (e.code === 'KeyQ' && !e.repeat && playing && !inventoryOpen && !controlOpen) throwSelected();
  if (e.code === 'Escape' && controlOpen) closeControl();
  else if (e.code === 'Escape' && inventoryOpen) closeInventory();
  else if (e.code === 'Escape' && fallbackLook) pause();
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
  if (e.code === 'KeyW') sprinting = false;
});
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

function look(dx, dy) {
  player.yaw -= dx * settings.sensitivity;
  player.pitch = Math.max(-1.55, Math.min(1.55, player.pitch - dy * settings.sensitivity * (settings.invertY ? -1 : 1)));
}

function start() {
  initAudio();
  overlay.hidden = true;
  // Oyun başladıktan sonra menü "Devam et" ve "Kaydet" gösterir.
  document.getElementById('play').textContent = 'Devam et';
  document.getElementById('save-now').hidden = false;
  showSettings(false);
  playing = true;
  fallbackLook = false;
  let req;
  try { req = canvas.requestPointerLock(); } catch (err) { useFallback(); return; }
  if (req && req.catch) req.catch(useFallback);
}
function useFallback() {
  fallbackLook = true;
  overlay.hidden = true;
  showSettings(false);
  playing = true;
}
function pause() {
  playing = false;
  overlay.hidden = dead;
  for (const k in keys) keys[k] = false;
  saveGame();
}
document.getElementById('play').addEventListener('click', start);
document.addEventListener('pointerlockerror', useFallback);
document.addEventListener('pointerlockchange', () => {
  // Envanter, sohbet ya da kontrol paneli açılırken fare kilidi bilerek bırakılır; oyun durmaz.
  // Panel açılırken gecikerek gelen kilit hemen bırakılır.
  if (document.pointerLockElement === canvas && (inventoryOpen || controlOpen)) document.exitPointerLock();
  else if (document.pointerLockElement !== canvas && !fallbackLook && !inventoryOpen && !chatOpen && !controlOpen) pause();
});

let drag = null;
document.addEventListener('mousemove', e => {
  if (!playing) return;
  if (document.pointerLockElement === canvas) look(e.movementX, e.movementY);
  else if (fallbackLook && drag) {
    look(e.movementX, e.movementY);
    drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
    if (drag.moved >= 6) mining = false;
  }
});
// Sol tuş basılı tutuldukça kazılır (mining). Yedek modda sürükleme bakıştır, kazmayı keser.
let mining = false, using = false; // using: sağ tuş basılı (yemek yeme)
canvas.addEventListener('mousedown', e => {
  if (!playing || inventoryOpen || chatOpen || controlOpen) return;
  if (document.pointerLockElement !== canvas) { fallbackLook = true; if (e.button === 0) drag = { moved: 0 }; }
  if (e.button === 0) { mining = true; attackMob(); }
  else if (e.button === 2) { using = true; if (tryOpenTrade()) return; startBowDraw(); if (!heldFood() && !heldBow()) placeBlock(); }
});
window.addEventListener('mouseup', e => {
  if (e.button === 0) mining = false;
  if (e.button === 2) using = false;
  drag = null;
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('wheel', e => {
  if (!playing || inventoryOpen || chatOpen || controlOpen) return;
  selectSlot((selected + (e.deltaY > 0 ? 1 : -1) + HOTBAR_SIZE) % HOTBAR_SIZE);
}, { passive: true });
