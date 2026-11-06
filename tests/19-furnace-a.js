// Madde 19, aşama 1: kum + kömür -> cam; çiğ et -> pişmiş et; panel kapalıyken de pişer; kaydet
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
g.setBlock(40, 40, 42, 11);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
await wait(400);
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
await wait(200);
const opened = !document.getElementById('furnace-ui').hidden && document.getElementById('inv-title').textContent === 'Fırın';
g.addItem('sand', 1); g.addItem('coal', 1); g.addItem('raw_beef', 1);
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);
g.clickSlot(slotOf('sand')); g.clickFurnace(0);
g.clickSlot(slotOf('coal')); g.clickFurnace(1);
await wait(300);
const lit = g.getBlock(40, 40, 42) === 13;
await wait(5300);
const f = g.furnaces['40,40,42'];
const glass = f.slots[2]?.key === 'glass';
g.clickFurnace(2); g.clickSlot(30);
const tookGlass = g.inventory[30]?.key === 'glass';
// Et koy, paneli kapat, beklerken pişsin
g.clickSlot(slotOf('raw_beef')); g.clickFurnace(0);
g.closeInventory();
await wait(5500);
const cooked = f.slots[2]?.key === 'cooked_beef';
// Kalıcılık için bir et daha koy ve kaydet
f.slots[0] = { key: 'raw_pork', count: 3 };
g.saveGame();
await wait(400);
return { ok: opened && lit && glass && tookGlass && cooked, opened, lit, glass, tookGlass, cooked };
