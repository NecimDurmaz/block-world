// Madde 52: Shift ile eğilince yavaşlar, kamera alçalır, blok kenarından düşmez
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const key = (code, down = true) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
// Havada 3x3 platform (y 39), altı 10 blok boş
for (let x = 34; x < 47; x++) for (let z = 34; z < 47; z++) for (let y = 28; y < 45; y++) g.setBlock(x, y, z, 0);
for (let x = 39; x < 42; x++) for (let z = 39; z < 42; z++) g.setBlock(x, 39, z, 3);
for (let cx = 2; cx <= 2; cx++) for (let cz = 2; cz <= 2; cz++) g.rebuild(cx, cz);
Object.assign(p, { x: 40.5, y: 40, z: 40.5, yaw: 0, pitch: 0, vx: 0, vy: 0, vz: 0 });
await wait(400);
const eyeStand = g.camera.position.y;
key('ShiftLeft');
key('KeyW');
await wait(2500);
const stillOn = p.y >= 39.99 && p.z > 38.6;
const eyeLow = g.camera.position.y < eyeStand - 0.2;
// Kenarda sarkıyor: ayakların ortası bloğun dışında ama düşmüyor
const hanging = p.z < 39;
key('KeyW', false);
// Eğilme yavaş: 1 sn'de 1,5 bloktan az
Object.assign(p, { x: 40.5, z: 41.6 });
await wait(200);
const z0 = p.z;
key('KeyW');
await wait(1000);
key('KeyW', false);
const slow = z0 - p.z < 1.5;
// Shift bırakılınca kenardan düşer
key('ShiftLeft', false);
key('KeyW');
await wait(1500);
key('KeyW', false);
const falls = p.y < 39;
return { ok: stillOn && eyeLow && hanging && slow && falls, stillOn, eyeLow, hanging, slow, falls, y: p.y, z: p.z };
