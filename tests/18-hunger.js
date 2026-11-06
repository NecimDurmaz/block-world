// Madde 18: açlık barı ve yemek
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const icons = document.querySelectorAll('#food i').length;
// 30 sn'de bir azalır (sayaç ileri alınır)
g.hunger.timer = 29.7;
await wait(800);
const decreased = p.food === 19;
// Koşarken iki kat hızlı: 1 sn koşu sayacı ~2 sn ilerletir
for (let x = 20; x < 70; x++) for (let z = 20; z < 70; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 45.5, y: 40, z: 60.5, yaw: 0, pitch: 0 });
await wait(300);
g.hunger.timer = 0;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
await wait(1000);
const sprintTimer = g.hunger.timer;
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }));
const sprintsFaster = sprintTimer > 1.5;
// Yemek: çiğ biftek +3
p.food = 10; g.renderFood();
g.inventory[0] = { key: 'raw_beef', count: 2 };
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
await wait(1000);
const notYet = p.food === 10;
await wait(1000);
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
const ate = p.food === 13 && g.inventory[0]?.count === 1;
// Açlık 18'in altında can yenilenmez
p.food = 17; p.health = 15;
await wait(6000);
const noRegen = p.health === 15;
// Açlık 0'da can 4 sn'de bir azalır, 1'in altına inmez
p.food = 0; g.renderFood(); p.health = 2;
await wait(4500);
const starved = p.health === 1;
await wait(4500);
const floor = p.health === 1;
return { ok: icons === 10 && decreased && sprintsFaster && notYet && ate && noRegen && starved && floor,
  icons, decreased, sprintTimer: +sprintTimer.toFixed(2), notYet, ate, noRegen, starved, floor };
