// Madde 7: canlılara vurma
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const canvas = document.querySelector('#game canvas');
const click = () => {
  canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
  window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
};
// Oyuncuyu havada bir platforma koy, ineği tam önüne yerleştir (oyuncu -z yönüne bakar)
for (let x = 40; x < 49; x++) for (let z = 40; z < 49; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 44.5, y: 40, z: 46.5, yaw: 0, pitch: -0.25, vx: 0, vy: 0, vz: 0 });
const cow = g.mobs.find(m => m.kind === 'cow');
const placeCow = () => Object.assign(cow, { x: 44.5, y: 40, z: 44.5, vx: 0, vy: 0, vz: 0, kx: 0, kz: 0, walking: false, timer: 30 });
placeCow();
await wait(500);
click();
const afterFirst = cow.health;
await wait(100);
const red = cow.materials[0].emissive.r > 0;
const fleeing = cow.flee > 0;
const pushed = cow.z < 44.4 || Math.abs(cow.kz) > 0;
// Hasarsızlık süresi içinde ikinci vuruş sayılmaz
click();
const invulnerable = cow.health === afterFirst;
let hits = 1;
while (cow.health > 0 && hits < 15) {
  await wait(600);
  placeCow();
  await wait(150);
  click();
  hits++;
}
const tipping = cow.dying > 0;
await wait(1500);
const removed = !g.mobs.includes(cow);
return { ok: afterFirst === 9 && red && fleeing && pushed && invulnerable && hits === 10 && tipping && removed,
  afterFirst, red, fleeing, pushed, invulnerable, hits, tipping, removed };
