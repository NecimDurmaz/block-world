// Madde 17: tahta kazmayla taş kırılır ve kırık taş gelir; taş kılıçla zombi 4 vuruşta ölür; dayanıklılık azalır
const g = window.game, p = g.player;
document.getElementById('play').click();
// Gözden görünüm: nişan tam oyuncunun önüne (arkadan kamerada omuz kayması var)
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const canvas = document.querySelector('#game canvas');
const down = () => canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
const up = () => window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);

// Tahta kazma üret: üstte 3 tahta, ortada 2 çubuk
g.addItem('planks', 3); g.addItem('stick', 2);
g.openInventory(3);
g.clickSlot(slotOf('planks')); for (const i of [0, 1, 2]) g.clickCraft(i, true);
g.clickSlot(slotOf('stick')); for (const i of [4, 7]) g.clickCraft(i, true);
g.clickResult();
g.clickSlot(0); // hotbar 1
g.closeInventory();
const crafted = g.inventory[0]?.key === 'wooden_pickaxe' && g.inventory[0].durability === 60;

// Taşı kır
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
g.setBlock(40, 40, 42, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
const t0 = performance.now();
down();
while (g.getBlock(40, 40, 42) !== 0 && performance.now() - t0 < 8000) await wait(50);
up();
const mineTime = (performance.now() - t0) / 1000;
for (let i = 0; i < 20 && slotOf('cobble') < 0; i++) { Object.assign(p, { x: 40.5, z: 43.2 }); await wait(100); }
const gotCobble = slotOf('cobble') >= 0;
const worn = g.inventory[0]?.durability === 59;
const barShown = getComputedStyle(document.querySelector('#hotbar .slot .dur')).display === 'block';

// Taş kılıçla zombi 4 vuruşta ölür
g.inventory[1] = { key: 'stone_sword', count: 1, durability: 132 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2' }));
const z = g.spawnMob('zombie', 40.5, 40, 42.5);
let hits = 0;
while (z.health > 0 && hits < 8) {
  Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.3 });
  Object.assign(z, { x: 40.5, y: 40, z: 42.5, vx: 0, vz: 0, kx: 0, kz: 0 });
  await wait(150);
  down(); up();
  hits++;
  await wait(500);
}
return { ok: crafted && mineTime < 5 && gotCobble && worn && barShown && hits === 4,
  crafted, mineTime: +mineTime.toFixed(2), gotCobble, worn, barShown, hits };
