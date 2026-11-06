// Madde 29: kırılma parçacıkları
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
g.setBlock(40, 40, 42, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
await wait(300);
// Kazarken küçük parçalar (taş uzun sürer)
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
await wait(1000);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const whileDigging = g.debris.length > 0;
await wait(1000);
const faded = g.debris.length === 0;
// Kırılınca 12 parça, bloğun dokusundan (taş: gri)
g.spawnDebris(3, 40, 40, 40, 12);
const twelve = g.debris.length === 12;
// En çok 200 parça
for (let i = 0; i < 25; i++) g.spawnDebris(1, 40, 40, 40, 12);
const capped = g.debris.length === 200;
return { ok: whileDigging && faded && twelve && capped, whileDigging, faded, twelve, capped };
