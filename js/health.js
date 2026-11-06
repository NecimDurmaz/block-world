// ---------- Can ----------
// Can barı, hasar, yenilenme, ölüm ve yeniden doğma.

// Kalp: 7x6 piksellik şekil, 1 piksel koyu çerçeveyle 9x9 tuvale çizilir.
const HEART_SHAPE = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
function heartImage(fill) { // 0 boş, 1 yarım, 2 dolu
  const c = document.createElement('canvas'); c.width = c.height = 9;
  const hg = c.getContext('2d');
  const eachPixel = fn => HEART_SHAPE.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') fn(x, y); }));
  hg.fillStyle = '#1a0a0a';
  eachPixel((x, y) => { for (const [ox, oy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) hg.fillRect(x + ox, y + oy, 1, 1); });
  eachPixel((x, y) => {
    const red = fill === 2 || (fill === 1 && x < 4);
    hg.fillStyle = !red ? '#4a3a3a' : (x === 1 && y === 1 ? '#ff9c9c' : '#d8302d');
    hg.fillRect(x + 1, y + 1, 1, 1);
  });
  return c.toDataURL();
}
const HEART_IMAGES = [0, 1, 2].map(heartImage);
const heartsEl = document.getElementById('hearts');
const hurtEl = document.getElementById('hurt');
const heartEls = Array.from({ length: MAX_HEALTH / 2 }, () => heartsEl.appendChild(document.createElement('i')));
document.getElementById('status').style.width = hotbar.offsetWidth + 'px';
function renderHearts() {
  heartEls.forEach((el, i) => {
    el.style.backgroundImage = `url(${HEART_IMAGES[Math.max(0, Math.min(2, player.health - i * 2))]})`;
  });
}
renderHearts();

let invulnerable = 0, hurtFlash = 0, lastDamageAt = -Infinity, regenTimer = 0;
// Kaynak verilmezse (ör. düşme) geri itme olmaz.
function damagePlayer(amount, sourceX, sourceZ) {
  if (invulnerable > 0 || player.health <= 0) return;
  player.health = Math.max(0, player.health - amount);
  invulnerable = 0.5;
  hurtFlash = 0.2;
  hurtSound();
  lastDamageAt = performance.now();
  regenTimer = 0;
  const dx = player.x - sourceX, dz = player.z - sourceZ, len = Math.hypot(dx, dz);
  if (len > 0) {
    player.kx = dx / len * 4;
    player.kz = dz / len * 4;
    player.vy = 6;
  }
  renderHearts();
  if (player.health <= 0) die();
}
// Konsoldan test için
window.damagePlayer = damagePlayer;
Object.assign(window.game, { player, damagePlayer, clock });

const deathEl = document.getElementById('death');
function die() {
  player.health = 0;
  renderHearts();
  dead = true;
  playing = false;
  deathEl.hidden = false;
  if (document.pointerLockElement) document.exitPointerLock();
}
document.getElementById('respawn').addEventListener('click', () => {
  dead = false;
  deathEl.hidden = true;
  player.health = MAX_HEALTH;
  player.food = MAX_FOOD;
  renderHearts();
  renderFood();
  spawn();
  start();
});
function updateHealth(dt) {
  invulnerable = Math.max(0, invulnerable - dt);
  hurtFlash = Math.max(0, hurtFlash - dt);
  hurtEl.style.opacity = hurtFlash / 0.2;
  if (!playing || player.health >= MAX_HEALTH || player.health <= 0 || player.food < REGEN_FOOD || performance.now() - lastDamageAt < 5000) { regenTimer = 0; return; }
  regenTimer += dt;
  if (regenTimer >= 4) { regenTimer = 0; player.health++; renderHearts(); }
}
