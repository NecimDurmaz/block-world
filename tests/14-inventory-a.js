// Madde 14, aşama 1: boş envanterle başla, kaz, koy, envanterde taşı, kaydet
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const canvas = document.querySelector('#game canvas');
const mouse = button => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { button }));
};
const startsEmpty = g.inventory.every(s => s === null);
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
// 5 kez toprak kaz
for (let i = 0; i < 5; i++) {
  g.setBlock(40, 40, 42, 2);
  await wait(250);
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  for (let k = 0; k < 40 && g.getBlock(40, 40, 42) !== 0; k++) await wait(100);
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
  for (let k = 0; k < 30 && g.drops.length; k++) { Object.assign(p, { x: 40.5, z: 43.2 }); await wait(100); }
  Object.assign(p, { x: 40.5, z: 44.5 });
}
const hotbarText = document.querySelector('#hotbar .slot .count').textContent;
const dug = g.inventory[0]?.key === 'dirt' && g.inventory[0].count === 5 && hotbarText === '5';
// Koy: 1 azalır
await wait(300);
mouse(2);
await wait(100);
const placed = g.inventory[0]?.count === 4;
// Envanter: E ile aç, yığını çantaya taşı, yarısını ayır
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' }));
const opened = !document.getElementById('inventory').hidden;
g.clickSlot(0);        // 4 toprağı al
g.clickSlot(12);       // çantaya bırak
g.clickSlot(12, true); // yarısını al (2)
g.clickSlot(13);       // yan yuvaya bırak
const moved = !g.inventory[0] && g.inventory[12]?.count === 2 && g.inventory[13]?.count === 2;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyE' }));
const closed = document.getElementById('inventory').hidden;
g.saveGame();
await wait(500);
return { ok: startsEmpty && dug && placed && opened && moved && closed, startsEmpty, dug, hotbarText, placed, opened, moved, closed };
