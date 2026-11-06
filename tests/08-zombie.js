// Madde 8: zombi
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const hostiles = () => g.mobs.filter(m => m.type.hostile);

// Gece olunca 10 sn içinde, oyuncudan 16–32 blok uzakta bir düşman doğar
g.clock.time = 0.75;
for (let i = 0; i < 130 && !hostiles().length; i++) await wait(100);
const spawned = hostiles()[0];
const spawnDistance = spawned ? Math.hypot(spawned.x - p.x, spawned.z - p.z) : null;
const spawnOk = !!spawned && spawnDistance >= 15 && spawnDistance <= 33;

// Havada düz bir platform: zombi 6 blok önde, oyuncuya yürüyüp vurmalı
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 45.5, yaw: 0, pitch: -0.2, vx: 0, vy: 0, vz: 0, health: 20 });
g.clock.time = 0.25; // başka düşman doğmasın
const z = g.spawnMob('zombie', 40.5, 40, 39.5);
let approached = false, minDist = 99;
for (let i = 0; i < 80 && p.health === 20; i++) {
  await wait(100);
  minDist = Math.min(minDist, Math.hypot(z.x - p.x, z.z - p.z));
}
approached = minDist < 1.5;
const damaged = p.health < 20;

// Vurularak öldürülebilir
const canvas = document.querySelector('#game canvas');
z.health = 2;
let hits = 0;
while (z.health > 0 && hits < 6) {
  Object.assign(p, { x: 40.5, y: 40, z: 45.5, yaw: 0, pitch: -0.3 });
  Object.assign(z, { x: 40.5, y: 40, z: 43.5, vx: 0, vz: 0, kx: 0, kz: 0 });
  await wait(200);
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  hits++;
  await wait(500);
}
const killed = z.health <= 0;

// 64 bloktan uzaklaşan düşman silinir
await wait(800);
const other = g.mobs.find(m => m.type.hostile && m.dying <= 0);
let despawned = true;
if (other) {
  Object.assign(other, { x: 1.5, z: 1.5 });
  Object.assign(p, { x: 94.5, z: 94.5, y: 45 });
  await wait(500);
  despawned = !g.mobs.includes(other);
}
return { ok: spawnOk && approached && damaged && killed && despawned,
  spawnOk, spawnDistance: spawnDistance && +spawnDistance.toFixed(1), approached, minDist: +minDist.toFixed(2), damaged, health: p.health, killed, hits, despawned };
