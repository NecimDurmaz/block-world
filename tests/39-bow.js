// Madde 39: yay ve ok tarifi, germe, kavisli uçuş, ineğe hasar, saplanan oku toplama, örümcekten ip
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const has = (out, n) => g.recipes.some(r => r.out[0] === out && r.out[1] === n);
const recipes = has('bow', 1) && has('arrow', 4) && g.items.string?.name === 'İp';
for (let x = 20; x < 60; x++) for (let z = 20; z < 60; z++) { g.setBlock(x, 39, z, 3); for (let y = 40; y < 46; y++) g.setBlock(x, y, z, 0); }
for (let cx = 1; cx <= 3; cx++) for (let cz = 1; cz <= 3; cz++) g.rebuild(cx, cz);
for (const m of [...g.mobs]) m.health = 0, m.dying = 0.01;
await wait(300);
g.inventory.fill(null);
g.inventory[0] = { key: 'bow', count: 1, durability: 385 };
g.inventory[1] = { key: 'arrow', count: 5 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
Object.assign(p, { x: 40.5, y: 40, z: 45.5, yaw: 0, pitch: 0.03, vx: 0, vz: 0 });
const cow = g.spawnMob('cow', 40.5, 40, 37.5);
const canvas = document.querySelector('#game canvas');
const draw = async ms => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
  await wait(ms);
  const charge = g.bowCharge();
  window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
  return charge;
};
const freeze = () => Object.assign(cow, { x: 40.5, y: 40, z: 37.5, vx: 0, vz: 0, kx: 0, kz: 0, walking: false, timer: 30, flee: 0 });
freeze();
const fov0 = g.camera.fov;
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
for (let i = 0; i < 40 && g.bowCharge() < 1; i++) await wait(100);
const fullCharge = g.bowCharge() === 1 && g.camera.fov < fov0 - 5;
const noBlockPlaced = g.getBlock(40, 40, 44) === 0;
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
await wait(50);
const arrow = g.projectiles.find(a => a.fromPlayer);
const usedArrow = g.inventory[1]?.count === 4 && g.inventory[0].durability === 384;
let hits = 1;
for (let i = 0; i < 20 && arrow.life > 0; i++) { freeze(); await wait(50); }
for (let i = 0; i < 3 && cow.health > 0 && cow.dying <= 0; i++) { await wait(600); freeze(); await draw(1100); hits++; for (let k = 0; k < 15; k++) { freeze(); await wait(50); } }
const cowDies = cow.health <= 0 && hits <= 2;
// Kavis: yukarı atılan zayıf ok önce yükselip sonra alçalır ve bloğa saplanır
await wait(600);
p.pitch = 0.5;
await draw(300);
await wait(100);
const weak = g.projectiles.filter(a => a.fromPlayer).at(-1);
let peak = weak.y, rose = false;
for (let i = 0; i < 60 && !weak.stuck; i++) { await wait(50); if (weak.y > peak) { peak = weak.y; rose = true; } }
const arcs = rose && weak.stuck && weak.y < peak - 0.5;
// Saplanan oku yürüyerek topla
const before = g.inventory[1]?.count || 0;
Object.assign(p, { x: weak.x, y: 40, z: weak.z });
await wait(400);
const pickedUp = (g.inventory[1]?.count || 0) === before + 1 && !g.projectiles.includes(weak);
// Örümcekten ip düşebilir (0–2): 10 örümcekte en az bir ip
g.drops.forEach(d => d.age = 1e9);
await wait(100);
for (let i = 0; i < 10; i++) { const s = g.spawnMob('spider', 30.5 + i, 40, 25.5); s.health = 0; s.dying = 0.01; }
await wait(800);
const string = g.drops.some(d => d.key === 'string');
return { ok: recipes && fullCharge && noBlockPlaced && usedArrow && cowDies && arcs && pickedUp && string,
  recipes, fullCharge, noBlockPlaced, usedArrow, hits, cowHealth: cow.health, cowDies, arcs, peak, pickedUp, string };
