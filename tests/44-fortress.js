// Madde 44: Nether kalesi (köprüler, odalar, doğurucu), blaze doğması, 3'lü ateş topu + yanma, blaze çubuğu
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.switchDimension('nether');
const f = g.fortressNear(48, 48);
g.ensureArea(f.x, f.z, 3);
// Köprü: merkezden her kolun ortasına nether tuğlası taban, üstü boş
const bridges = f.arms.every(a => g.getBlock(f.x + a.dir[0] * 10, f.y, f.z + a.dir[1] * 10) === 82 && g.getBlock(f.x + a.dir[0] * 10, f.y + 2, f.z + a.dir[1] * 10) === 0);
const rooms = f.arms.filter(a => a.room).every(a => g.getBlock(a.room.x, f.y + 5, a.room.z) === 82 && g.getBlock(a.room.x, f.y + 2, a.room.z + 0) !== undefined);
const s = f.spawner;
const spawnerBlock = g.getBlock(s.x, s.y, s.z) === 83;
// Doğurucunun yanına git (odaya, girişin önüne): blaze doğar, içinde küçük blaze döner
g.godFire = 0;
const room = f.arms[0];
Object.assign(p, { x: room.room.x - room.dir[0] * 2 + 0.5, y: f.y + 1, z: room.room.z - room.dir[1] * 2 + 0.5, vx: 0, vz: 0, health: 20 });
g.rebuild(Math.floor(p.x / 16), Math.floor(p.z / 16));
let blaze = null;
for (let i = 0; i < 40 && !blaze; i++) { await wait(100); blaze = g.mobs.find(m => m.kind === 'blaze'); }
const miniShown = g.spawnerModels() === 1;
// 3'lü atış
let shots = 0;
const seen = new Set();
for (let i = 0; i < 50 && shots < 3; i++) {
  await wait(100);
  for (const a of g.projectiles) if (a.small && !seen.has(a)) { seen.add(a); shots++; }
  if (blaze) Object.assign(blaze, { x: p.x + 4, y: p.y + 1, z: p.z });
}
const burst = shots >= 3;
// Ateş topu: 5 hasar ve sonra yanma
// Önceki atışların yanması bitsin, blaze'ler kaldırılsın
for (const m of [...g.mobs]) m.health = 0, m.dying = 0.01;
for (const a of [...g.projectiles]) a.life = 0;
await wait(3800);
p.health = 20;
g.shootSmallFireball({ x: p.x + 3, y: p.y - 0.4, z: p.z, yaw: Math.atan2(3, 0) });
for (let i = 0; i < 30 && p.health === 20; i++) await wait(50);
const afterHit = p.health;
await wait(2500);
const burns = afterHit <= 15 && p.health < afterHit;
// Blaze çubuğu: birkaç blaze öldürülünce en az biri düşer
g.drops.forEach(d => d.age = 1e9);
await wait(100);
for (let i = 0; i < 8; i++) { const b = g.spawnMob('blaze', p.x + 6, p.y + 2, p.z + i - 4); b.health = 0; b.dying = 0.01; }
await wait(800);
const rod = g.drops.some(d => d.key === 'blaze_rod');
return { ok: bridges && rooms && spawnerBlock && !!blaze && miniShown && burst && burns && rod,
  fortress: [f.x, f.y, f.z], bridges, rooms, spawnerBlock, blaze: !!blaze, miniShown, shots, afterHit, health: p.health, burns, rod };
