// Arkadan kamera: omuz üstü, karakter ekranın solunda; engelde kamera blok içine girmez
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Açık alan: havada geniş platform
for (let x = 20; x < 60; x++) for (let z = 20; z < 60; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 40.5, yaw: 0, pitch: 0, vx: 0, vz: 0 });
await wait(1500);
const openDistance = g.cameraDistance();
// Karakterin göğsü ekranda merkezin solunda olmalı
const chest = new THREE.Vector3(p.x, p.y + 1.2, p.z).project(g.camera);
const leftOfCenter = chest.x < -0.05;
const solidAt = v => g.getBlock(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z)) !== 0;
// Arkası duvar olan dar koridor
for (let z = 30; z < 50; z++) for (let y = 40; y < 43; y++) { g.setBlock(39, y, z, 8); g.setBlock(41, y, z, 8); }
for (let y = 40; y < 43; y++) g.setBlock(40, y, 47, 8);
Object.assign(p, { x: 40.5, z: 46.5, yaw: 0, pitch: 0.4 });
let insideBlock = false;
for (let i = 0; i < 20; i++) { await wait(100); insideBlock ||= solidAt(g.camera.position); }
const closeDistance = g.cameraDistance();
return { ok: openDistance > 3.3 && leftOfCenter && !insideBlock && closeDistance < 1.5,
  openDistance: +openDistance.toFixed(2), chestX: +chest.x.toFixed(2), leftOfCenter, insideBlock, closeDistance: +closeDistance.toFixed(2) };
