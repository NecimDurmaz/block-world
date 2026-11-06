// Madde 9: iskelet
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
// Gündüz: gece doğan başka düşman karışmasın
g.clock.time = 0.25;
// Havada 30x30 düz platform
for (let x = 20; x < 50; x++) for (let z = 20; z < 50; z++) g.setBlock(x, 39, z, 3);
const keep = () => Object.assign(p, { x: 35.5, y: 40, z: 45.5, vx: 0, vz: 0, health: 20 });
keep();
// 14 blok önde bir iskelet
const s = g.spawnMob('skeleton', 35.5, 40, 31.5);

// Mesafe: 14 bloktan ~8'e yaklaşır
let arrowsSeen = 0, damaged = false;
for (let i = 0; i < 50; i++) {
  keep();
  await wait(100);
  arrowsSeen = Math.max(arrowsSeen, g.projectiles.length);
  if (p.health < 20) damaged = true;
}
const keptDistance = Math.abs(p.z - s.z);
const approached = keptDistance < 10 && keptDistance > 4;

// Yakına gelince geri çekilir
Object.assign(s, { x: 35.5, z: 43, vx: 0, vz: 0 });
for (let i = 0; i < 20; i++) { keep(); await wait(100); }
const retreated = Math.abs(p.z - s.z) > 3.5;

// Arada duvar varsa atış durur
Object.assign(s, { x: 35.5, z: 37.5, vx: 0, vz: 0 });
for (let x = 30; x < 42; x++) for (let y = 40; y < 44; y++) g.setBlock(x, y, 41, 3);
await wait(2500);
let newArrows = 0;
const seen = new Set(g.projectiles);
for (let i = 0; i < 40; i++) {
  keep();
  await wait(100);
  for (const a of g.projectiles) if (!seen.has(a)) { seen.add(a); newArrows++; }
}
return { ok: arrowsSeen > 0 && damaged && approached && retreated && newArrows === 0,
  arrowsSeen, damaged, keptDistance: +keptDistance.toFixed(1), approached, retreated, newArrowsBehindWall: newArrows };
