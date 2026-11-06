// Madde 12: gün ışığında açıktaki zombi ve iskelet yanar; gölgedeki yaşar; örümcek gündüz saldırmaz
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.1;
for (let x = 20; x < 50; x++) for (let z = 20; z < 50; z++) g.setBlock(x, 39, z, 3);
// Gölge: iskeletin üstüne çatı
for (let x = 22; x < 27; x++) for (let z = 22; z < 27; z++) g.setBlock(x, 43, z, 7);
Object.assign(p, { x: 45.5, y: 40, z: 45.5 });
const zombie = g.spawnMob('zombie', 30.5, 40, 30.5);
const shaded = g.spawnMob('skeleton', 24.5, 40, 24.5);
const freeze = () => { for (const m of [zombie, shaded]) Object.assign(m, { walking: false, timer: 60, memory: 0 }); };
zombie.health = 3;
let flames = 0;
for (let i = 0; i < 50 && g.mobs.includes(zombie); i++) {
  freeze();
  Object.assign(shaded, { x: 24.5, z: 24.5 });
  await wait(100);
  flames = Math.max(flames, g.particles.length);
}
const zombieBurned = !g.mobs.includes(zombie);
const skeletonAlive = shaded.health === 20;

// Örümcek gündüz oyuncuyu kovalamaz
const spider = g.spawnMob('spider', 45.5, 40, 40.5);
await wait(1500);
const spiderCalm = spider.memory === 0;
return { ok: zombieBurned && flames > 0 && skeletonAlive && spiderCalm, zombieBurned, flames, skeletonAlive, skeletonHealth: shaded.health, spiderCalm };
