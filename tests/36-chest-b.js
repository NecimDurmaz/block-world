// Madde 36, aşama 2: içerik kayıttan geri gelir; kırılınca saçılır
const g = window.game, p = g.player;
const c = g.chests['overworld:40,40,42'];
const persisted = c?.slots[0]?.key === 'coal' && c.slots[0].count === 2 && c.slots[26]?.durability === 20;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
g.inventory.fill(null);
await wait(500);
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
for (let i = 0; i < 80 && g.getBlock(40, 40, 42) === 61; i++) await wait(100);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const broken = g.getBlock(40, 40, 42) === 0;
const keys = g.drops.map(d => d.key);
const scattered = keys.filter(k => k === 'coal').length === 2 && keys.includes('wooden_pickaxe') && keys.includes('chest');
const gone = !g.chests['overworld:40,40,42'];
return { ok: persisted && broken && scattered && gone, persisted, broken, scattered, gone, keys };
