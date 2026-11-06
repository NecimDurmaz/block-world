// Madde 6: domuz, tavuk ve koyun
const g = window.game;
document.getElementById('play').click();
const kinds = ['cow', 'pig', 'chicken', 'sheep'];
const counts = Object.fromEntries(kinds.map(k => [k, g.mobs.filter(m => m.kind === k).length]));
const allKinds = kinds.every(k => counts[k] >= 1);
const total = g.mobs.length;
// Sürü: aynı türün hayvanları ilk hayvanın 8 blok çevresinde (köşegen dahil en çok ~11,4 blok)
const herded = kinds.every(k => {
  const herd = g.mobs.filter(m => m.kind === k);
  return herd.every(m => Math.hypot(m.x - herd[0].x, m.z - herd[0].z) <= 12);
});
// Tavuk süzülerek düşer: aynı yükseklikten bırakılan domuzdan yavaş iner
const chicken = g.mobs.find(m => m.kind === 'chicken'), pig = g.mobs.find(m => m.kind === 'pig');
const top = 45;
Object.assign(chicken, { x: 20.5, y: top, z: 20.5, vy: 0, walking: false, timer: 30 });
Object.assign(pig, { x: 24.5, y: top, z: 20.5, vy: 0, walking: false, timer: 30 });
await wait(1000);
const chickenDrop = top - chicken.y, pigDrop = top - pig.y;
const glides = chickenDrop < pigDrop / 2;
return { ok: allKinds && total <= 16 && herded && glides, counts, total, herded, chickenDrop: +chickenDrop.toFixed(2), pigDrop: +pigDrop.toFixed(2) };
