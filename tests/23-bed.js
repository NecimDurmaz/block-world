// Madde 23: yatak
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Üret: 3 yün + 3 tahta
g.addItem('wool', 3); g.addItem('planks', 3);
g.openInventory(3);
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);
g.clickSlot(slotOf('wool')); for (const i of [0, 1, 2]) g.clickCraft(i, true);
g.clickSlot(slotOf('planks')); for (const i of [3, 4, 5]) g.clickCraft(i, true);
g.clickResult(); g.clickSlot(0);
g.closeInventory();
const crafted = g.inventory[0]?.key === 'bed';
// Koy: oyuncu -z'ye bakıyor; ayak bakılan hücrede, baş bir ötede
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
const canvas = document.querySelector('#game canvas');
const right = () => { canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); window.dispatchEvent(new MouseEvent('mouseup', { button: 2 })); };
right();
await wait(300);
let foot = null;
for (let z = 38; z < 45; z++) if (g.getBlock(40, 40, z) === 29) foot = z;
const placed = foot !== null && g.getBlock(40, 40, foot - 1) === 30;
// Gündüz uyunamaz
Object.assign(p, { x: 40.5, y: 40, z: foot + 2.2, pitch: -0.6 });
await wait(400);
right();
await wait(100);
const dayMessage = document.getElementById('blockname').textContent;
const spawnSet = !!g.getSpawnPoint();
// Gece, yakında düşman varken uyunamaz
g.clock.time = 0.75;
const z = g.spawnMob('zombie', 44.5, 40, foot + 0.5);
z.memory = 0;
await wait(100);
right();
await wait(100);
const monsterMessage = document.getElementById('blockname').textContent;
z.health = 0; z.dying = 0.01;
await wait(300);
// Gece, düşman yokken: 2 sn sonra 06:00 ve yeni gün
const day0 = g.clock.day;
right();
await wait(2600);
const morning = g.clock.time < 0.01 && g.clock.day === day0 + 1;
// Ölünce yatağın yanında doğar
p.health = 1;
g.damagePlayer(5);
await wait(200);
document.getElementById('respawn').click();
await wait(300);
const nearBed = Math.hypot(p.x - 40.5, p.z - (foot + 0.5)) < 3 && Math.abs(p.y - 40) < 1;
// Yatağın üstüne çıkınca yarım blok yüksekte durur
Object.assign(p, { x: 40.5, y: 41.5, z: foot + 0.5, vx: 0, vy: 0, vz: 0, onGround: false });
await wait(1200);
const onBedTop = Math.abs(p.y - (40 + 9 / 16)) < 0.01;
return { ok: crafted && placed && dayMessage === 'Sadece gece uyuyabilirsin' && spawnSet && monsterMessage === 'Yakınlarda canavar var' && morning && nearBed && onBedTop,
  crafted, placed, foot, dayMessage, spawnSet, monsterMessage, morning, nearBed, onBedTop, py: +p.y.toFixed(3) };
