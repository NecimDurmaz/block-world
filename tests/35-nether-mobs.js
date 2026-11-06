// Madde 35: Nether yaratıkları
const g = window.game, p = g.player;
document.getElementById('play').click();
// Gözden görünüm: nişan tam oyuncunun önüne
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.switchDimension('nether');
// Oyuncu için kapalı, düz bir oda: kızıl taş zemin, 20x20, 10 blok yüksek
for (let x = 30; x < 62; x++) for (let z = 30; z < 62; z++) {
  g.setBlock(x, 19, z, 58);
  for (let y = 20; y < 32; y++) g.setBlock(x, y, z, 0);
}
for (let cx = 1; cx <= 3; cx++) for (let cz = 1; cz <= 3; cz++) g.rebuild(cx, cz);
Object.assign(p, { x: 40.5, y: 20, z: 40.5, yaw: 0, pitch: 0, vx: 0, vz: 0, health: 20 });
await wait(300);
const canvas = document.querySelector('#game canvas');
const hit = async () => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  await wait(100);
};

// Doğma: yalnızca Nether'de, oyuncudan 24+ blok uzakta
const pig1 = g.trySpawnNether('zombie_pigman');
const spawnFar = !!pig1 && Math.hypot(pig1.x - p.x, pig1.z - p.z) >= 23;
for (const m of [...g.mobs]) m.health = 0, m.dying = 0.01;
await wait(300);

// Domuz adam nötr: yakında dolaşır, vurmaz
const pig = g.spawnMob('zombie_pigman', 40.5, 20, 37.5);
const friend = g.spawnMob('zombie_pigman', 46.5, 20, 46.5);
await wait(2500);
const neutral = p.health === 20 && !(pig.angry > 0);
// Vurulunca o ve yakındakiler kızar, saldırır
p.yaw = Math.atan2(-(pig.x - p.x), -(pig.z - p.z));
p.pitch = -0.2;
Object.assign(pig, { x: 40.5, y: 20, z: 38.5, vx: 0, vz: 0, kx: 0, kz: 0, walking: false, timer: 30 });
await wait(200);
await hit();
const angered = pig.angry > 25 && friend.angry > 25;
for (let i = 0; i < 60 && p.health === 20; i++) await wait(100);
const attacks = p.health < 20;
for (const m of [...g.mobs]) m.health = 0, m.dying = 0.01;
await wait(300);
p.health = 20;

// Ghast: uçar (düşmez), oyuncuyu görünce ateş topu atar; ateş topu 5 hasar
const ghast = g.spawnMob('ghast', 40.5, 24, 52.5);
const y0 = ghast.y;
let fired = false;
for (let i = 0; i < 50 && !fired; i++) { await wait(100); fired = g.projectiles.some(a => a.fireball); }
const flies = Math.abs(ghast.y - y0) < 4 && ghast.y > 20.5;
for (let i = 0; i < 50 && p.health === 20; i++) await wait(100);
const fireballHurts = p.health === 15;
p.health = 20;

// Geri çevirme: ateş topuna vurulunca ghast'a döner ve onu öldürür
for (const a of [...g.projectiles]) a.life = 0;
await wait(100);
g.shootFireball(ghast);
const ball = g.projectiles.find(a => a.fireball);
ghast.attackCooldown = 99;
let reflected = false;
for (let i = 0; i < 60 && !reflected; i++) {
  await wait(30);
  const dist = Math.hypot(ball.x - p.x, ball.y - (p.y + 1.6), ball.z - p.z);
  if (dist < 4) {
    p.yaw = Math.atan2(-(ball.x - p.x), -(ball.z - p.z));
    p.pitch = Math.atan2(ball.y - (p.y + 1.6), Math.hypot(ball.x - p.x, ball.z - p.z));
    await wait(20);
    await hit();
    reflected = !!ball.reflected;
  }
}
let ghastDead = false;
for (let i = 0; i < 40 && !ghastDead; i++) { await wait(100); ghastDead = ghast.dying > 0 || !g.mobs.includes(ghast); }

// Ateş topu bloğa çarpınca küçük patlama: duvarı deler
g.setBlock(40, 21, 34, 58);
const wall = { fireball: true, x: 40.5, y: 21.5, z: 36.5, vx: 0, vy: 0, vz: -8, life: 5, mesh: new (window.THREE.Group)() };
g.projectiles.push(wall);
await wait(800);
const blasted = g.getBlock(40, 21, 34) === 0;

return { ok: spawnFar && neutral && angered && attacks && fired && flies && fireballHurts && reflected && ghastDead && blasted,
  spawnFar, neutral, angered, attacks, fired, flies, fireballHurts, reflected, ghastDead, blasted, health: p.health };
