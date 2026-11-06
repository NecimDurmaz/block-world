// Madde 15: kırma süresi ve çatlama
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const canvas = document.querySelector('#game canvas');
const down = () => canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
const up = () => window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
const time = async (x, y, z, limit) => {
  const t0 = performance.now();
  down();
  while (g.getBlock(x, y, z) !== 0 && performance.now() - t0 < limit) await wait(50);
  up();
  return (performance.now() - t0) / 1000;
};
// Toprak ~0,75 sn
g.setBlock(40, 40, 42, 2);
await wait(300);
const dirtTime = await time(40, 40, 42, 3000);
await wait(500);
// Taş: 2 sn sonra hâlâ yerinde, çatlak görünür ve büyür; bırakınca sıfırlanır
g.setBlock(40, 40, 42, 3);
await wait(300);
down();
await wait(1000);
const crackEarly = g.mining.progress;
await wait(1000);
const crackLater = g.mining.progress;
const crackVisible = g.crackVisible();
const stillThere = g.getBlock(40, 40, 42) === 3;
up();
await wait(200);
const reset = g.mining.progress === 0 && !g.crackVisible();
// Taşı elle sonuna kadar kır: eşya düşmez
const before = g.inventory.filter(Boolean).length;
const stoneTime = await time(40, 40, 42, 12000);
await wait(1500);
const noDrop = !g.drops.some(d => d.key === 'stone') && g.inventory.filter(Boolean).length === before;
return { ok: dirtTime > 0.5 && dirtTime < 1.6 && crackLater > crackEarly && crackVisible && stillThere && reset && stoneTime > 6.5 && noDrop,
  dirtTime: +dirtTime.toFixed(2), crackEarly: +crackEarly.toFixed(2), crackLater: +crackLater.toFixed(2), crackVisible, stillThere, reset, stoneTime: +stoneTime.toFixed(2), noDrop };
