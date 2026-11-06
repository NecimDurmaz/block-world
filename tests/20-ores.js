// Madde 20: kömür ve demir cevherleri
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Dünyadaki cevherleri say
let coal = 0, iron = 0, ironHigh = 0, coalHigh = 0;
for (let y = 0; y < 48; y++) for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) {
  const b = g.getBlock(x, y, z);
  if (b === 15) { coal++; if (y > 30) coalHigh++; }
  if (b === 16) { iron++; if (y > 20) ironHigh++; }
}
const generated = coal > 100 && iron > 30 && coalHigh === 0 && ironHigh === 0;
const canvas = document.querySelector('#game canvas');
const mine = async (x, y, z) => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  for (let i = 0; i < 100 && g.getBlock(x, y, z) !== 0; i++) await wait(100);
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  for (let i = 0; i < 15; i++) { Object.assign(p, { x: 40.5, z: 43.2 }); await wait(100); }
  Object.assign(p, { x: 40.5, z: 44.5 });
};
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
const count = key => g.inventory.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
// Tahta kazmayla kömür cevheri -> kömür
g.inventory[0] = { key: 'wooden_pickaxe', count: 1, durability: 60 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
g.setBlock(40, 40, 42, 15);
await wait(300);
await mine(40, 40, 42);
const gotCoal = count('coal') === 1;
// Tahta kazmayla demir düşmez, taş kazmayla düşer
g.setBlock(40, 40, 42, 16);
await wait(300);
await mine(40, 40, 42);
const woodNoIron = count('iron_ore') === 0;
g.inventory[0] = { key: 'stone_pickaxe', count: 1, durability: 132 };
g.setBlock(40, 40, 42, 16);
await wait(300);
await mine(40, 40, 42);
const stoneIron = count('iron_ore') === 1;
return { ok: generated && gotCoal && woodNoIron && stoneIron, coal, iron, coalHigh, ironHigh, gotCoal, woodNoIron, stoneIron };
