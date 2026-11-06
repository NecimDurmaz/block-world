// Madde 34: Nether boyutu
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Nether üretimi: kızıl taş taban/tavan, altta lav, ışıltı taşı var
const nether = g.worlds.nether, at = (x, y, z) => nether[x + z * 96 + y * 96 * 96];
let netherrack = 0, lava = 0, glowstone = 0, lavaHigh = 0;
for (let i = 0; i < nether.length; i++) {
  const b = nether[i];
  if (b === 58) netherrack++;
  else if (b === 59) { lava++; if (Math.floor(i / (96 * 96)) > 10) lavaHigh++; }
  else if (b === 60) glowstone++;
}
const generated = netherrack > 100000 && lava > 500 && lavaHigh === 0 && glowstone >= 20 && at(10, 0, 10) === 58;
// Portal kur, içinde dur → Nether'e geç
const fx = 39, fy = 40, fz = 36;
for (let x = 34; x < 46; x++) for (let z = 32; z < 42; z++) { g.setBlock(x, fy, z, 3); for (let y = fy + 1; y < fy + 7; y++) g.setBlock(x, y, z, 0); }
for (let i = 0; i < 4; i++) { g.setBlock(fx + i, fy, fz, 55); g.setBlock(fx + i, fy + 4, fz, 55); }
for (let dy = 1; dy <= 3; dy++) { g.setBlock(fx, fy + dy, fz, 55); g.setBlock(fx + 3, fy + dy, fz, 55); }
g.tryLightPortal(fx + 1, fy + 1, fz);
const lit = g.getBlock(fx + 1, fy + 1, fz) === 56;
Object.assign(p, { x: fx + 2, y: fy + 1, z: fz + 0.5, vx: 0, vz: 0 });
for (let i = 0; i < 60 && g.getDimension() !== 'nether'; i++) await wait(100);
const inNether = g.getDimension() === 'nether';
const link = g.portalLinks.nether;
const netherPortal = !!link && g.getBlock(link.x, link.y, link.z) === 56 && g.getBlock(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) !== 58;
const toastOk = document.getElementById('blockname').textContent === "Nether'e geçtin";
await wait(300);
const env = g.clouds.visible === false && g.fogFar() <= 40;
const mobsCleared = g.mobs.every(m => !['cow', 'pig', 'sheep', 'chicken'].includes(m.kind));
// Nether'de yatak: uyunmaz, 6 hasar
p.health = 20;
g.useBed(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
const bedHurts = p.health === 14 && document.getElementById('blockname').textContent === 'Burada uyuyamazsın';
// Lav: içine girince hasar ve yanma
p.health = 20;
const lx = Math.floor(p.x), ly = Math.floor(p.y), lz = Math.floor(p.z);
g.setBlock(lx, ly, lz, 59);
await wait(1200);
g.setBlock(lx, ly, lz, 0);
const lavaHurts = p.health <= 16;
p.health = 20;
// Geri dön: bağlı portalın içine gir
const back = g.portalLinks.nether;
Object.assign(p, { x: back.x + 1, y: back.y, z: back.z + 0.5, vx: 0, vz: 0 });
for (let i = 0; i < 60 && g.getDimension() !== 'overworld'; i++) { await wait(100); if (g.getDimension() === 'nether') Object.assign(p, { x: back.x + 1, y: back.y, z: back.z + 0.5, vx: 0, vz: 0 }); }
const returned = g.getDimension() === 'overworld' && Math.abs(p.x - (fx + 2)) < 3 && Math.abs(p.z - fz) < 3;
const recipe = g.recipes.some(r => r.out[0] === 'glowstone' && r.keys.D === 'glowstone_dust');
return { ok: generated && lit && inNether && netherPortal && toastOk && env && mobsCleared && bedHurts && lavaHurts && returned && recipe,
  netherrack, lava, lavaHigh, glowstone, generated, lit, inNether, netherPortal, toastOk, env, mobsCleared, bedHurts, lavaHurts, returned, recipe, pos: [p.x, p.y, p.z].map(v => +v.toFixed(1)) };
