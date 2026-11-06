// Madde 11: creeper yaklaşır, yanıp söner, patlar; krater açar ve can gider
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25; // başka düşman doğmasın
// Havada kalın bir platform (3 kat), krater görülebilsin
for (let x = 20; x < 50; x++) for (let z = 20; z < 50; z++) for (let y = 36; y < 40; y++) g.setBlock(x, y, z, 3);
const keep = () => Object.assign(p, { x: 35.5, y: 40, z: 44.5, vx: 0, vz: 0 });
keep();

// Uzaklaşınca vazgeçer
const c1 = g.spawnMob('creeper', 35.5, 40, 36.5);
c1.memory = 30;
let fused = false;
for (let i = 0; i < 60 && !fused; i++) { keep(); await wait(100); fused = c1.fuse > 0; }
const flashing = fused;
Object.assign(p, { z: 30.5 }); // creeper'ın arkasına, 6 blok uzağa
c1.x = 35.5; c1.z = 36.5;
await wait(300);
const cancelled = c1.fuse === 0 && g.mobs.includes(c1);
g.mobs.includes(c1) && (c1.health = 0, c1.dying = 0.01);
await wait(300);

// Kaçılmazsa patlar
keep();
const c2 = g.spawnMob('creeper', 35.5, 40, 40.5);
c2.memory = 30;
let swollen = 1;
for (let i = 0; i < 60 && g.mobs.includes(c2); i++) { keep(); await wait(100); swollen = Math.max(swollen, c2.body.root.scale.x); }
const exploded = !g.mobs.includes(c2);
const crater = g.getBlock(35, 39, 40) === 0 && g.getBlock(35, 38, 40) === 0;
const damaged = p.health < 20;
return { ok: flashing && cancelled && exploded && crater && damaged && swollen > 1.1,
  flashing, cancelled, exploded, crater, damaged, health: p.health, swollen: +swollen.toFixed(2) };
