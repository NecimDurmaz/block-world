// Madde 42, aşama 1: aynı yöne uzağa gidince dünya bitmiyor; uzak değişiklik kalır; üretim deterministik; bellek sınırlı
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
g.openControl(); document.querySelector('[data-toggle="fly"]').click(); g.closeControl();
document.getElementById('play').click();
const column = (x, z) => { const out = []; for (let y = 0; y < 48; y++) out.push(g.getBlock(x, y, z)); return out.join(','); };
const top = (x, z) => { let y = 47; while (y > 0 && g.getBlock(x, y, z) === 0) y--; return y; };
// 400 blok doğuya uç: her adımda ayağın altındaki chunk üretilmiş olmalı
let groundEverywhere = true, maxChunks = 0;
for (let x = 48; x <= 448; x += 8) {
  Object.assign(p, { x: x + 0.5, y: 46, z: 48.5, vx: 0, vy: 0, vz: 0 });
  await wait(60);
  if (g.getBlock(x, 0, 48) === 0) groundEverywhere = false;
  maxChunks = Math.max(maxChunks, g.chunkCount());
}
await wait(1500);
const meshes = g.meshCount();
// Uzakta bir blok kır (chunk "27,3")
const fx = 440, fz = 50, fy = top(fx, fz);
const before = g.getBlock(fx, fy, fz);
g.setBlock(fx, fy, fz, 0);
const farModified = g.modifiedChunks.overworld.has('27,3');
// Deterministik: bir chunk silinip yeniden üretilince aynı çıkar
const sig = column(452, 40);
g.worlds.overworld.delete('28,2');
g.ensureArea(452, 40, 0);
const deterministic = column(452, 40) === sig;
// Eve dön: uzak, değişmemiş chunk'lar bellekten silinir; değişen kalır
Object.assign(p, { x: 48.5, y: 46, z: 48.5 });
for (let i = 0; i < 40 && g.worlds.overworld.has('26,3'); i++) await wait(100);
const unloaded = !g.worlds.overworld.has('26,3') && g.worlds.overworld.has('27,3');
const removedBlock = g.getBlock(fx, fy, fz) === 0;
localStorage.setItem('test42', JSON.stringify({ fy, before }));
g.saveGame();
await wait(500);
return { ok: groundEverywhere && maxChunks < 700 && meshes > 20 && before !== 0 && farModified && deterministic && unloaded && removedBlock,
  groundEverywhere, maxChunks, meshes, before, farModified, deterministic, unloaded, removedBlock, fy };
