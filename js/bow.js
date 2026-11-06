// ---------- Yay ----------
// Yay ve ip eşyaları, yayı germe, oyuncu okları (canlıya hasar, saplanma, geri toplama).

// Germe en çok 1 sn; ok hızı gerilmeye göre 10–30 blok/sn, yerçekimi 20. Hasar hıza göre 2–9.
const BOW_DRAW_TIME = 1, BOW_MIN_SPEED = 10, BOW_MAX_SPEED = 30, PLAYER_ARROW_GRAVITY = 20, STUCK_ARROW_LIFE = 60;
ITEMS.bow = { name: 'Yay', durability: 385, canvas: pixelArt(['..bbbbb.', '.b...s..', 'b...s...', 'b..s....', 'b.s.....', 'bs......', 'b.......', '........'], { b: '#8a5a2b', s: '#e8e8e8' }) };
RECIPES.push(
  { pattern: ['.SX', 'S.X', '.SX'], keys: { S: 'stick', X: 'string' }, out: ['bow', 1] },
  // Minecraft'taki çakmaktaşı yerine kırık taş
  { pattern: ['C', 'S', 'F'], keys: { C: 'cobble', S: 'stick', F: 'feather' }, out: ['arrow', 4] },
);
MOB_DROPS.spider = [['string', 0, 2]];

let bowCharge = 0; // 0–1 arası gerilme
const heldBow = () => inventory[selected]?.key === 'bow' ? inventory[selected] : null;
// Sağ tuş basılıyken gerilir; bırakılınca ok varsa atılır.
function updateBow(dt) {
  const bow = heldBow();
  if (using && bow && !inventoryOpen && !chatOpen && !controlOpen) {
    bowCharge = Math.min(1, bowCharge + dt / BOW_DRAW_TIME);
    return;
  }
  if (bowCharge > 0.1 && bow) shootPlayerArrow(bowCharge);
  bowCharge = 0;
}
function shootPlayerArrow(charge) {
  const slot = inventory.findIndex(s => s && s.key === 'arrow');
  if (slot < 0) { toast('Okun yok'); return; }
  takeFromSlot(slot, 1);
  const speed = BOW_MIN_SPEED + (BOW_MAX_SPEED - BOW_MIN_SPEED) * charge;
  const d = aim.d;
  projectiles.push({ fromPlayer: true, gravity: PLAYER_ARROW_GRAVITY, speed, x: player.x + d.x * 0.5, y: player.y + EYE - 0.1 + d.y * 0.5, z: player.z + d.z * 0.5,
    vx: d.x * speed, vy: d.y * speed, vz: d.z * speed, stuck: false, life: 10, mesh: arrowMesh() });
  useTool();
}
// Hıza göre 2–9 hasar
const arrowDamage = a => Math.round(2 + 7 * Math.max(0, Math.min(1, (a.speed - BOW_MIN_SPEED) / (BOW_MAX_SPEED - BOW_MIN_SPEED))));
// Oyuncu oku canlıya değdi mi; değdiyse hasar verir ve oku yok eder.
function arrowHitsMob(a) {
  const m = mobs.find(m => m.dying <= 0 && a.x > m.x - m.w && a.x < m.x + m.w && a.y > m.y && a.y < m.y + m.h && a.z > m.z - m.w && a.z < m.z + m.w);
  if (!m) return false;
  hurtMob(m, arrowDamage(a), a.vx, a.vz);
  a.life = 0;
  return true;
}
// Saplanmış oyuncu oku üstüne yürüyünce envantere döner.
function pickUpArrow(a) {
  if (Math.hypot(player.x - a.x, player.y + 0.5 - a.y, player.z - a.z) > 1.3 || addItem('arrow', 1) > 0) return;
  toast('+1 Ok');
  popSound();
  a.life = 0;
}
Object.assign(window.game, { bowCharge: () => bowCharge, shootPlayerArrow });
