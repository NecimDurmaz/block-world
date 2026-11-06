// Madde 22: meşale ve basit ışık
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
for (let x = 25; x < 56; x++) for (let z = 25; z < 56; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
g.inventory[0] = { key: 'torch', count: 5 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
const canvas = document.querySelector('#game canvas');
const right = () => { canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); window.dispatchEvent(new MouseEvent('mouseup', { button: 2 })); };
right();
await wait(300);
let torch = null;
for (let z = 38; z < 45; z++) if (g.getBlock(40, 40, z) === 18) torch = [40, 40, z];
const placedFloor = !!torch && g.inventory[0].count === 4;
// Çarpışmasız: üstünden geçilebilir
const noCollide = !!torch;
// Işık: yakında güçlü, 10 blok ötede yok
const near = torch ? g.torchLight(torch[0] + 0.5, 40.5, torch[2] + 1.5) : 0;
const far = torch ? g.torchLight(torch[0] + 10.5, 40.5, torch[2] + 0.5) : 1;
// Duvar meşalesi: bir bloğun yan yüzüne
g.setBlock(46, 40, 41, 3); g.setBlock(46, 41, 41, 3);
g.rebuild(2, 2);
Object.assign(p, { x: 46.5, y: 40, z: 43.5, yaw: 0, pitch: 0.15 });
await wait(400);
right();
await wait(300);
const wallTorch = [19, 20, 21, 22].includes(g.getBlock(46, 41, 42));
// Dayandığı blok kırılınca meşale düşer: yan taraftan alttaki bloğu kaz
g.setBlock(50, 40, 38, 3);
g.rebuild(3, 2);
Object.assign(p, { x: 50.5, y: 40, z: 40.5, yaw: 0, pitch: -0.3 });
await wait(400);
right(); // bloğun üstüne dik meşale
await wait(300);
const topTorch = g.getBlock(50, 41, 38) === 18;
g.inventory[1] = { key: 'stone_pickaxe', count: 1, durability: 132 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit2' }));
Object.assign(p, { x: 52.5, y: 40, z: 38.5, yaw: Math.PI / 2, pitch: -0.2 });
await wait(400);
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
for (let i = 0; i < 60 && g.getBlock(50, 40, 38) !== 0; i++) await wait(100);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
await wait(200);
const torchFell = topTorch && g.getBlock(50, 41, 38) === 0 && g.drops.some(d => d.key === 'torch');
// Meşaleye 8 blok yakınında düşman doğmaz
const safe = torch ? g.torchNearby(torch[0] + 3, 40, torch[2]) && !g.torchNearby(torch[0] + 25, 40, torch[2]) : false;
return { ok: placedFloor && near > 0.7 && far === 0 && wallTorch && torchFell && safe,
  torch, placedFloor, near: +near.toFixed(2), far, wallTorch, topTorch, torchFell, safe };
