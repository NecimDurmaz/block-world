// Madde 24: kapı ve cam
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// 6 tahta -> 3 kapı
g.addItem('planks', 6);
g.openInventory(3);
g.clickSlot(g.inventory.findIndex(s => s && s.key === 'planks'));
for (const i of [0, 1, 3, 4, 6, 7]) g.clickCraft(i, true);
g.clickResult(); g.clickSlot(0);
g.closeInventory();
const crafted = g.inventory[0]?.key === 'door' && g.inventory[0].count === 3;
// Duvar ve kapı: x = 36..44 boyunca z = 40'ta 3 blok yüksek duvar, ortada kapı
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
for (let x = 36; x < 45; x++) for (let y = 40; y < 43; y++) if (x !== 40 || y > 41) g.setBlock(x, y, 40, 8);
Object.assign(p, { x: 40.5, y: 40, z: 42.5, yaw: 0, pitch: -0.75, vx: 0, vz: 0 });
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
const canvas = document.querySelector('#game canvas');
const right = () => { canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); window.dispatchEvent(new MouseEvent('mouseup', { button: 2 })); };
// Kapı yere, duvar boşluğunun önündeki zemine (40,39,40 üstü)
Object.assign(p, { x: 40.5, z: 42.5, pitch: -0.62 });
await wait(300);
right();
await wait(300);
const lower = g.getBlock(40, 40, 40), upper = g.getBlock(40, 41, 40);
const placed = lower >= 31 && lower <= 46 && upper >= 31 && upper <= 46;
// Kapalı kapıdan geçilemez
const walk = async ms => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
  await wait(ms);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
};
Object.assign(p, { x: 40.5, z: 42.5, yaw: 0, pitch: 0 });
await walk(1500);
const blockedClosed = p.z > 40.2;
// Aç ve geç
Object.assign(p, { x: 40.5, z: 42.0, pitch: -0.2 });
await wait(300);
right();
await wait(300);
const opened = g.getBlock(40, 40, 40) === lower + 1;
Object.assign(p, { x: 40.5, z: 42.0, yaw: 0, pitch: 0 });
await walk(1500);
const passedOpen = p.z < 39.8;
return { ok: crafted && placed && blockedClosed && opened && passedOpen, crafted, placed, lower, upper, blockedClosed, z1: +p.z.toFixed(2), opened, passedOpen };
