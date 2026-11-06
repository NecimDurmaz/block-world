// Madde 5: canlı altyapısı ve inek
const g = window.game;
document.getElementById('play').click();
const cows = g.mobs.filter(m => m.kind === 'cow');
const onGrass = cows.every(m => g.getBlock(Math.floor(m.x), m.y - 1, Math.floor(m.z)) === 1);
const start = cows.map(m => [m.x, m.z]);

// Basamak çıkma: havada 9x9 taş platform, ortasında 1 blokluk basamak sırası
const [px, py, pz] = [40, 39, 40];
for (let x = px; x < px + 9; x++) for (let z = pz; z < pz + 9; z++) g.setBlock(x, py, z, 3);
for (let x = px; x < px + 9; x++) g.setBlock(x, py + 1, pz + 3, 3);
const climber = cows[0];
Object.assign(climber, { x: px + 4.5, y: py + 1, z: pz + 6.5, vx: 0, vy: 0, vz: 0, yaw: 0, walking: true, timer: 30 });

let maxY = climber.y;
for (let i = 0; i < 60; i++) { maxY = Math.max(maxY, climber.y); await wait(100); }
const moved = cows.slice(1).filter((m, i) => Math.hypot(m.x - start[i + 1][0], m.z - start[i + 1][1]) > 0.5).length;
const insideBlock = cows.some(m => g.getBlock(Math.floor(m.x), Math.floor(m.y + 0.5), Math.floor(m.z)) !== 0);
// Basamağın öbür tarafına geçtiyse üstüne çıkmış demektir
const climbed = maxY >= py + 2 && climber.z < pz + 3;
return { ok: cows.length >= 4 && onGrass && moved > 0 && !insideBlock && climbed,
  cows: cows.length, onGrass, moved, insideBlock, climbed, climber: [climber.x.toFixed(2), climber.y.toFixed(2), climber.z.toFixed(2)] };
