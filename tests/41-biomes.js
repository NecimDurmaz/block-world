// Madde 41: dört biyom; çölde kum ve altında kumtaşı, kaktüs hasarı; karlıda karlı çimen, ladin, göl buzu; buzda kayma
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const seen = new Set();
let desertOk = true, snowTop = 0, cactus = 0, spruce = 0, ice = 0;
for (let z = 0; z < 96; z += 2) for (let x = 0; x < 96; x += 2) {
  const biome = g.biomeAt(x, z);
  seen.add(biome);
  let y = 47; while (y > 0 && g.getBlock(x, y, z) === 0) y--;
  const top = g.getBlock(x, y, z);
  if (biome === 'snowy' && top === 77) snowTop++;
  // Çöl yüzeyi (göl ve kıyı dışında) kum, 4 blok altı kumtaşı
  if (biome === 'desert' && top === 6 && y > 15 && g.getBlock(x, y - 4, z) !== 12 && g.getBlock(x, y - 4, z) !== 0) desertOk = false;
}
for (let y = 0; y < 48; y++) for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) {
  const b = g.getBlock(x, y, z);
  if (b === 79) cactus++; else if (b === 80) spruce++; else if (b === 78) ice++;
}
const biomes = ['plains', 'forest', 'desert', 'snowy'].every(b => seen.has(b));
// Kaktüse değince can gider
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) { g.setBlock(x, 39, z, 3); for (let y = 40; y < 44; y++) g.setBlock(x, y, z, 0); }
g.setBlock(40, 40, 40, 79);
for (let cx = 1; cx <= 3; cx++) for (let cz = 1; cz <= 3; cz++) g.rebuild(cx, cz);
Object.assign(p, { x: 40.5, y: 40, z: 41.25, vx: 0, vz: 0, health: 20 });
for (let i = 0; i < 30 && p.health === 20; i++) { Object.assign(p, { x: 40.5, z: 41.25 }); await wait(100); }
const cactusHurts = p.health < 20;
p.health = 20;
// Buzda kayma: W bırakıldıktan sonra da ilerler
g.setBlock(40, 40, 40, 0);
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 78);
Object.assign(p, { x: 40.5, y: 40, z: 46.5, yaw: 0, pitch: 0, vx: 0, vz: 0 });
await wait(300);
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
await wait(1500);
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
const zRelease = p.z;
await wait(300);
const slides = zRelease - p.z > 0.4;
return { ok: biomes && desertOk && snowTop > 20 && cactus > 0 && spruce > 0 && ice > 0 && cactusHurts && slides,
  seen: [...seen], desertOk, snowTop, cactus, spruce, ice, cactusHurts, slides, slide: +(zRelease - p.z).toFixed(2) };
