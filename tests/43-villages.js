// Madde 43: köy (evler, kuyu, yollar), köylüler, ticaret, gece zombinin köylüye saldırması
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const v = g.villageNear(48, 48);
g.ensureArea(v.x, v.z, 2);
// Kuyu: ortada su, kenarda kırık taş
const well = g.getBlock(v.x, v.y, v.z) === 17 && g.getBlock(v.x - 1, v.y + 1, v.z) === 9;
// Evler: kapı, duvar, çatı
const houses = v.houses.length >= 3 && v.houses.every(h => {
  const door = g.getBlock(h.x + h.door[0] * 2, h.y + 1, h.z + h.door[1] * 2);
  return door >= 31 && door <= 46 && g.getBlock(h.x, h.y + 4, h.z) === 7 && g.getBlock(h.x - 2, h.y + 1, h.z - 2) === 4;
});
// Köye git: her eve bir köylü doğar
Object.assign(p, { x: v.x + 4.5, y: v.y + 1, z: v.z + 0.5 });
g.ensureArea(p.x, p.z, 1);
let villagers = [];
for (let i = 0; i < 50 && !villagers.length; i++) { await wait(100); villagers = g.mobs.filter(m => m.kind === 'villager'); }
const spawned = villagers.length === v.houses.length;
// Ticaret: buğday → zümrüt, zümrüt → ekmek
const vil = villagers[0];
vil.offers = [0, 2, 3];
g.inventory.fill(null);
g.addItem('wheat', 20);
// Sağ tık köylüye ticareti açar
Object.assign(vil, { x: p.x, y: p.y, z: p.z - 2, vx: 0, vz: 0, walking: false, timer: 30 });
Object.assign(p, { yaw: 0, pitch: -0.1 });
await wait(100);
Object.assign(vil, { x: p.x, z: p.z - 2, walking: false, timer: 30 });
document.querySelector('#game canvas').dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true }));
window.dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
await wait(100);
const opened = !document.getElementById('trade-ui').hidden && document.querySelectorAll('.trade-row').length === 3;
const count = key => g.inventory.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
document.querySelectorAll('.trade-row .mc-btn')[0].click();
const gotEmerald = count('emerald') === 1 && count('wheat') === 0;
document.querySelectorAll('.trade-row .mc-btn')[1].click();
const gotBread = count('bread') === 3 && count('emerald') === 0;
document.querySelectorAll('.trade-row .mc-btn')[1].click();
const refused = count('bread') === 3;
g.closeInventory();
document.getElementById('play').click();
// Gece zombi köylüye saldırır (oyuncu uzakta)
g.clock.time = 0.7;
Object.assign(p, { x: v.x + 40.5, y: 46, z: v.z + 40.5 });
g.openControl(); document.querySelector('[data-toggle="fly"]').click(); g.closeControl();
document.getElementById('play').click();
// Köylü açıkta (evine gitmesin diye evsiz), zombi 3 blok ötede: köyün yanında havada düz bir taş platform
const target = villagers[1] || villagers[0];
const bx = v.x + 24, bz = v.z + 24;
g.ensureArea(bx, bz, 1);
for (let x = bx - 4; x <= bx + 4; x++) for (let zz = bz - 4; zz <= bz + 4; zz++) { g.setBlock(x, 40, zz, 3); for (let y = 41; y < 44; y++) g.setBlock(x, y, zz, 0); }
Object.assign(target, { home: null, health: 20, x: bx + 0.5, y: 41, z: bz + 0.5, walking: false, timer: 30 });
const z = g.spawnMob('zombie', bx + 3.5, 41, bz + 0.5);
for (let i = 0; i < 60 && target.health === 20; i++) { p.y = 46; p.vy = 0; await wait(100); }
const zombieAttacks = target.health < 20;
return { ok: well && houses && spawned && opened && gotEmerald && gotBread && refused && zombieAttacks,
  village: [v.x, v.y, v.z], well, houses, spawned, villagers: villagers.length, opened, gotEmerald, gotBread, refused, zombieAttacks };
