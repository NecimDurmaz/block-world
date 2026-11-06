// Madde 26: buğday tarımı ve ekmek
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);
const count = key => g.inventory.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
// Çapa üret: 2 tahta + 2 çubuk
g.addItem('planks', 2); g.addItem('stick', 2);
g.openInventory(3);
g.clickSlot(slotOf('planks')); g.clickCraft(0, true); g.clickCraft(1, true);
g.clickSlot(slotOf('stick')); g.clickCraft(4, true); g.clickCraft(7, true);
g.clickResult(); g.clickSlot(0);
g.closeInventory();
const hoe = g.inventory[0]?.key === 'wooden_hoe';
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 1);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.62, vx: 0, vz: 0 });
const canvas = document.querySelector('#game canvas');
const right = () => { canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); window.dispatchEvent(new MouseEvent('mouseup', { button: 2 })); };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
right();
await wait(200);
let fz = null;
for (let z = 40; z < 45; z++) if (g.getBlock(40, 39, z) === 50) fz = z;
const tilled = fz !== null;
// Tohum ek
g.inventory[1] = { key: 'wheat_seeds', count: 3 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2' }));
await wait(200);
right();
await wait(200);
const planted = g.getBlock(40, 40, fz) === 51 && g.crops.size === 1;
// Büyümeyi hızlandır: her aşamada sayacı sıfırla
for (let i = 0; i < 6 && g.getBlock(40, 40, fz) !== 54; i++) {
  for (const k of g.crops.keys()) g.crops.set(k, 0);
  await wait(200);
}
const mature = g.getBlock(40, 40, fz) === 54;
// Hasat: buğday + tohum
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
await wait(300);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
for (let i = 0; i < 20 && count('wheat') < 1; i++) { Object.assign(p, { x: 40.5, z: fz + 1.2 }); await wait(100); }
const harvested = count('wheat') === 1 && count('wheat_seeds') >= 3;
// 3 buğday -> ekmek, ye
g.addItem('wheat', 2);
g.openInventory();
g.clickSlot(slotOf('wheat'));
g.clickCraft(0, true); g.clickCraft(1, true);
// 2x2'de 3 yatay olmaz: masada yap
g.closeInventory();
g.openInventory(3);
g.clickSlot(slotOf('wheat'));
for (const i of [0, 1, 2]) g.clickCraft(i, true);
g.clickResult();
g.clickSlot(5);
g.closeInventory();
const bread = g.inventory[5]?.key === 'bread';
p.food = 10;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit6' }));
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
await wait(2000);
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
const ate = p.food === 15;
return { ok: hoe && tilled && planted && mature && harvested && bread && ate, hoe, tilled, planted, mature, harvested, wheat: count('wheat'), seeds: count('wheat_seeds'), bread, ate, food: p.food };
