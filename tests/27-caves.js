// Madde 27: mağaralar
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
// Arazi yüzeyi: hava, su ve bitkiler atlanır (göl suyu mağara sayılmasın)
const surface = (x, z) => { let y = 47; while (y > 0 && [0, 17, 47, 48, 49].includes(g.getBlock(x, y, z))) y--; return y; };
const tops = [];
for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) tops.push(surface(x, z));
let carved = 0, under = 0, openings = 0, oreWalls = 0, floodedCave = 0;
for (let z = 1; z < 95; z++) for (let x = 1; x < 95; x++) {
  const t = tops[z * 96 + x];
  for (let y = 2; y < t - 1; y++) {
    under++;
    const b = g.getBlock(x, y, z);
    if (b === 17) floodedCave++;
    if (b !== 0) continue;
    carved++;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (y > tops[(z + dz) * 96 + x + dx]) openings++;
      const n = g.getBlock(x + dx, y, z + dz);
      if (n === 15 || n === 16) oreWalls++;
    }
  }
}
const frac = carved / under;
// Gündüz de mağaraya düşman doğar (üstü kapalı yere)
g.clock.time = 0.25;
let caveMob = null;
for (let i = 0; i < 10 && !caveMob; i++) caveMob = g.trySpawnHostile(false);
let covered = false;
if (caveMob) for (let y = Math.floor(caveMob.y + 2); y < 48; y++) if (![0, 17, 47, 48, 49].includes(g.getBlock(Math.floor(caveMob.x), y, Math.floor(caveMob.z)))) covered = true;
return { ok: frac > 0.03 && frac < 0.15 && openings > 50 && oreWalls > 10 && floodedCave === 0 && !!caveMob && covered,
  frac: +frac.toFixed(3), openings, oreWalls, floodedCave, caveMob: !!caveMob, covered };
