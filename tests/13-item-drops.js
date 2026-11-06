// Madde 13: kırılan blok yere küçük küp olarak düşer, üstünden geçince toplanır; ölen inekten biftek düşer
const g = window.game, p = g.player;
document.getElementById('play').click();
// Gözden görünüm: nişan tam oyuncunun önüne (arkadan kamerada omuz kayması var)
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const canvas = document.querySelector('#game canvas');
const click = () => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
};
// Sol tuşu blok kırılana kadar basılı tut
const mine = async (x, y, z) => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  for (let i = 0; i < 40 && g.getBlock(x, y, z) !== 0; i++) await wait(100);
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
};
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
// Önde bir toprak blok
g.setBlock(40, 40, 42, 2);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
await wait(400);
await mine(40, 40, 42);
await wait(300);
const drop = g.drops.find(d => d.key === 'dirt');
const isSmallCube = !!drop && drop.mesh.geometry.parameters.width === 0.25;
// Biraz bekle: döner ve yerde durur
await wait(1000);
const spinning = !!drop && drop.mesh.rotation.y > 0.5;
// Üstüne yürü
Object.assign(p, { x: 40.5, z: 42.5 });
await wait(800);
const picked = !g.drops.includes(drop) && g.inventory.some(slot => slot && slot.key === 'dirt' && slot.count === 1);

// İneği öldür: biftek düşer
const cow = g.mobs.find(m => m.kind === 'cow');
Object.assign(cow, { x: 44.5, y: 40, z: 34.5, health: 1, walking: false, timer: 60 });
Object.assign(p, { x: 44.5, y: 40, z: 36.5, yaw: 0, pitch: -0.25 });
await wait(400);
click();
await wait(1200);
const beef = g.drops.filter(d => d.key === 'raw_beef').length;
return { ok: isSmallCube && spinning && picked && beef >= 1 && beef <= 3, isSmallCube, spinning, picked, beef };
