// Madde 21: su
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
g.clock.time = 0.25;
// Göller: y ≤ 12'deki bütün boşluklar su, üstünde su yok
let water = 0, high = 0, lake = null;
for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) {
  let depth = 0;
  for (let y = 0; y < 48; y++) if (g.getBlock(x, y, z) === 17) { water++; depth++; if (y > 12) high++; }
  if (depth >= 4 && !lake && x > 5 && z > 5 && x < 90 && z < 90) lake = [x, z, depth];
}
const generated = water > 100 && high === 0 && !!lake;
// Göle 6 bloktan düş: suya girince yavaş batar ve düşme hasarı yok
Object.assign(p, { x: lake[0] + 0.5, y: 19, z: lake[1] + 0.5, vx: 0, vy: 0, vz: 0, health: 20, fallPeak: null, yaw: 0, pitch: -1.2 });
let maxSink = 0, sawOverlay = false;
for (let i = 0; i < 30; i++) {
  await wait(100);
  if (g.getBlock(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) === 17) maxSink = Math.max(maxSink, -p.vy);
  sawOverlay ||= !document.getElementById('underwater').hidden;
}
const slowSink = maxSink > 0 && maxSink <= 3.01;
const noFallDamage = p.health === 20;
// Nişan ışını suyun içinden geçer: aşağı bakınca hedef su değil
const hit = g.raycast();
const aimThrough = !hit || g.getBlock(hit.x, hit.y, hit.z) !== 17;
// Boşlukla yukarı yüzülür
const y0 = p.y;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
await wait(800);
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
const swamUp = p.y > y0 + 0.8;
return { ok: generated && slowSink && noFallDamage && sawOverlay && aimThrough && swamUp,
  water, high, lake, maxSink: +maxSink.toFixed(2), slowSink, noFallDamage, sawOverlay, aimThrough, swamUp };
