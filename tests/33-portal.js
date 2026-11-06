// Madde 33: obsidyen ve Nether portalı
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Dünyada mağara tabanlarında obsidyen öbekleri (y ≤ 8)
let obsidian = 0, high = 0;
for (let y = 0; y < 48; y++) for (let z = 0; z < 96; z++) for (let x = 0; x < 96; x++) if (g.getBlock(x, y, z) === 55) { obsidian++; if (y > 8) high++; }
const generated = obsidian >= 20 && high === 0;
const canvas = document.querySelector('#game canvas');
const count = key => g.inventory.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
const mine = async (x, y, z, limit) => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  const t0 = performance.now();
  while (g.getBlock(x, y, z) !== 0 && performance.now() - t0 < limit) await wait(100);
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  const seconds = (performance.now() - t0) / 1000;
  for (let i = 0; i < 15; i++) { Object.assign(p, { x: 40.5, z: 43.2 }); await wait(100); }
  Object.assign(p, { x: 40.5, z: 44.5 });
  return seconds;
};
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
// Demir kazma tarifi: 3 demir külçe + 2 çubuk
g.addItem('iron_ingot', 3); g.addItem('stick', 2);
g.openInventory(3);
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);
g.clickSlot(slotOf('iron_ingot')); for (const i of [0, 1, 2]) g.clickCraft(i, true);
g.clickSlot(slotOf('stick')); for (const i of [4, 7]) g.clickCraft(i, true);
g.clickResult(); g.clickSlot(0);
g.closeInventory();
const ironPick = g.inventory[0]?.key === 'iron_pickaxe';
// Taş kazmayla obsidyen düşmez; demir kazmayla ~6 sn'de kırılır ve düşer
g.inventory[1] = { key: 'stone_pickaxe', count: 1, durability: 132 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2' }));
g.setBlock(40, 40, 42, 55);
await wait(300);
await mine(40, 40, 42, 15000);
const stoneNoDrop = count('obsidian') === 0;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
g.setBlock(40, 40, 42, 55);
await wait(300);
const ironTime = await mine(40, 40, 42, 10000);
const ironDrop = count('obsidian') === 1;
// Çerçeve: 4x5, köşesiz; x ekseninde, z = 36
const fx = 39, fy = 40, fz = 36;
for (let i = 0; i < 2; i++) { g.setBlock(fx + 1 + i, fy, fz, 55); g.setBlock(fx + 1 + i, fy + 4, fz, 55); }
for (let dy = 1; dy <= 3; dy++) { g.setBlock(fx, fy + dy, fz, 55); g.setBlock(fx + 3, fy + dy, fz, 55); }
// Çakmak tarifi ve yakma
g.addItem('iron_ingot', 1); g.addItem('coal', 1);
g.openInventory();
g.clickSlot(slotOf('iron_ingot')); g.clickCraft(0);
g.clickSlot(slotOf('coal')); g.clickCraft(1);
g.clickResult(); g.clickSlot(2);
g.closeInventory();
const lighter = g.inventory[2]?.key === 'flint_and_steel' && g.inventory[2].durability === 64;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit3' }));
Object.assign(p, { x: 41.5, y: 40, z: 38.5, yaw: 0, pitch: -0.3 });
await wait(400);
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
await wait(200);
let portals = 0;
for (let i = 1; i <= 2; i++) for (let dy = 1; dy <= 3; dy++) if (g.getBlock(fx + i, fy + dy, fz) === 56) portals++;
const lit = portals === 6 && g.inventory[2]?.durability === 63;
// İçinde 3 sn dur: geri sayım ve kararma, sonra geçiş
Object.assign(p, { x: fx + 2, y: fy + 1, z: fz + 0.5, vx: 0, vz: 0 });
await wait(800);
const countdown = !document.getElementById('portal-hud').hidden && /^Portal: \d…$/.test(document.getElementById('portal-hud').textContent);
const darkening = Number(document.getElementById('portal-fx').style.opacity) > 0.1;
let traveled = false;
for (let i = 0; i < 50 && !traveled; i++) { await wait(100); traveled = window.game.portalTraveled?.() || document.getElementById('blockname').textContent === 'Portal etkinleşti'; }
// Çerçeveden obsidyen kırılınca portal söner
Object.assign(p, { x: 40.5, y: 40, z: 39.5, yaw: 0, pitch: 0.69 });
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
const target = g.raycast();
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
for (let i = 0; i < 100 && target && g.getBlock(target.x, target.y, target.z) !== 0; i++) await wait(100);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
let left = 0;
for (let i = 1; i <= 2; i++) for (let dy = 1; dy <= 3; dy++) if (g.getBlock(fx + i, fy + dy, fz) === 56) left++;
return { ok: generated && ironPick && stoneNoDrop && ironTime > 4.5 && ironTime < 8 && ironDrop && lighter && lit && countdown && darkening && traveled && left === 0,
  obsidian, high, ironPick, stoneNoDrop, ironTime: +ironTime.toFixed(1), ironDrop, lighter, lit, countdown, darkening, traveled, target: target && [target.x, target.y, target.z], left };
