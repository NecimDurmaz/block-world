// Madde 36, aşama 1: tarif, sağ tıkla açılır, eşya konur, kaydedilir
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Tarif: 8 tahta halka
g.openInventory(3);
g.addItem('planks', 8);
const pl = g.inventory.findIndex(s => s && s.key === 'planks');
g.clickSlot(pl);
for (const i of [0, 1, 2, 3, 5, 6, 7, 8]) g.clickCraft(i, true);
g.clickSlot(pl);
const recipe = document.querySelector('#craft-result').dataset.name === 'Sandık';
g.closeInventory();
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
g.setBlock(40, 40, 42, 61);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
await wait(800);
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
await wait(200);
const opened = !document.getElementById('chest-ui').hidden && document.getElementById('inv-title').textContent === 'Sandık';
g.addItem('coal', 5); g.addItem('wooden_pickaxe', 1, { durability: 20 });
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);
g.clickSlot(slotOf('coal')); g.clickChest(0);
g.clickSlot(slotOf('wooden_pickaxe')); g.clickChest(26);
// Sağ tık: yarısını geri al
g.clickChest(0, true); g.clickSlot(35);
const c = g.chests['overworld:40,40,42'];
const moved = c.slots[0]?.count === 2 && c.slots[26]?.key === 'wooden_pickaxe' && g.inventory[35]?.count === 3;
g.closeInventory();
g.saveGame();
await wait(400);
return { ok: recipe && opened && moved, recipe, opened, moved, slots: c.slots.filter(Boolean) };
