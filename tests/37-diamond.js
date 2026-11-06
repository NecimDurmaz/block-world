// Madde 37: elmas cevheri (y ≤ 10), yalnızca demir/elmas kazmayla elmas; demir ve elmas aletler
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
let diamond = 0, high = 0;
for (let y = 0; y < 48; y++) for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) {
  if (g.getBlock(x, y, z) === 62) { diamond++; if (y > 10) high++; }
}
const generated = diamond >= 10 && high === 0;
// Tarifler: demir ve elmas aletler aynı desenle
const r = g.recipes;
const has = out => r.some(x => x.out[0] === out);
const recipes = ['iron_pickaxe', 'iron_axe', 'iron_shovel', 'iron_sword', 'diamond_pickaxe', 'diamond_axe', 'diamond_shovel', 'diamond_sword'].every(has);
const I = window.game.items;
const stats = I.iron_sword.damage === 6 && I.diamond_sword.damage === 7 && I.iron_pickaxe.durability === 251 && I.diamond_pickaxe.durability === 1562 && I.diamond_pickaxe.speed === 8;
const canvas = document.querySelector('#game canvas');
const mine = async (x, y, z) => {
  const t0 = performance.now();
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  for (let i = 0; i < 200 && g.getBlock(x, y, z) !== 0; i++) await wait(50);
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  const t = (performance.now() - t0) / 1000;
  for (let i = 0; i < 15; i++) { Object.assign(p, { x: 40.5, z: 43.2 }); await wait(100); }
  Object.assign(p, { x: 40.5, z: 44.5 });
  return t;
};
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
const count = key => g.inventory.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
// Taş kazmayla elmas düşmez
g.inventory[0] = { key: 'stone_pickaxe', count: 1, durability: 132 };
g.setBlock(40, 40, 42, 62); await wait(300);
await mine(40, 40, 42);
const stoneNone = count('diamond') === 0;
// Demir kazmayla 1 elmas
g.inventory[0] = { key: 'iron_pickaxe', count: 1, durability: 251 };
g.setBlock(40, 40, 42, 62); await wait(300);
await mine(40, 40, 42);
const ironDiamond = count('diamond') === 1;
// Elmas kazma taşı hızlı kırar (7,5 / 8 ≈ 0,94 sn)
g.inventory[0] = { key: 'diamond_pickaxe', count: 1, durability: 1562 };
g.setBlock(40, 40, 42, 3); await wait(300);
const fast = await mine(40, 40, 42);
return { ok: generated && recipes && stats && stoneNone && ironDiamond && fast < 1.6,
  inv: g.inventory.filter(Boolean).map(s => s.key), drops: g.drops.map(d => d.key), diamond, high, generated, recipes, stats, stoneNone, ironDiamond, fast: +fast.toFixed(2) };
