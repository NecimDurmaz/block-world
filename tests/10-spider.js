// Madde 10: örümcek duvara tırmanıp oyuncuya ulaşır ve sıçrayarak vurur
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.75;
// Havada platform; ortasında 3 blok yüksek, oyuncunun önünü kesen duvar
for (let x = 20; x < 50; x++) for (let z = 20; z < 50; z++) g.setBlock(x, 39, z, 3);
for (let x = 20; x < 50; x++) for (let y = 40; y < 43; y++) g.setBlock(x, y, 38, 3);
const keep = () => Object.assign(p, { x: 35.5, y: 40, z: 44.5, vx: 0, vz: 0 });
keep();
// Örümcek oyuncuyu az önce görmüş olsun: duvarın arkasında kalsa da hafızasıyla kovalar
const s = g.spawnMob('spider', 35.5, 40, 31.5);
s.memory = 30;
let maxY = 40, damaged = false;
for (let i = 0; i < 120 && !damaged; i++) {
  keep();
  await wait(100);
  maxY = Math.max(maxY, s.y);
  damaged = p.health < 20;
}
const climbed = maxY >= 42.5;
const reached = Math.hypot(s.x - p.x, s.z - p.z) < 3;
return { ok: climbed && damaged, climbed, maxY: +maxY.toFixed(2), reached, damaged, health: p.health, spider: [s.x.toFixed(1), s.y.toFixed(1), s.z.toFixed(1)] };
