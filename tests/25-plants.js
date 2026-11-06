// Madde 25: uzun ot ve çiçekler
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Çimen sütunlarına oranla bitki sayısı
let grass = 0, tall = 0, flowers = 0;
for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) {
  let y = 47;
  while (y > 0 && [0, 47, 48, 49].includes(g.getBlock(x, y - 1, z))) y--;
  if (g.getBlock(x, y - 1, z) !== 1) continue;
  grass++;
  const b = g.getBlock(x, y, z);
  if (b === 47) tall++;
  if (b === 48 || b === 49) flowers++;
}
const ratioOk = tall / grass > 0.08 && tall / grass < 0.16 && flowers / grass > 0.005 && flowers / grass < 0.04;
// İçinden geçilir ve tek tıkla kırılır
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 1);
g.setBlock(40, 40, 42, 47);
for (const [cx, cz] of [[2, 2]]) g.rebuild(cx, cz);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: 0, vx: 0, vz: 0 });
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
for (let i = 0; i < 40 && p.z > 42.3; i++) await wait(100);
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
const walkedThrough = p.z < 42.3;
const zAfterWalk = +p.z.toFixed(2);
g.setBlock(40, 40, 42, 48);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45 });
await wait(400);
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
await wait(300);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const brokeFast = g.getBlock(40, 40, 42) === 0;
return { ok: ratioOk && walkedThrough && brokeFast, zAfterWalk, grass, tall, flowers, ratio: +(tall / grass).toFixed(3), walkedThrough, brokeFast };
