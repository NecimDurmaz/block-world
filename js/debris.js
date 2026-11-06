// ---------- Kırılma parçacıkları ----------
// Blok kırılınca ve kazılırken bloğun dokusundan küçük parçalar saçılır, yerçekimiyle düşer ve kaybolur.

const DEBRIS_SIZE = 0.1, DEBRIS_LIFE = 0.8, MAX_DEBRIS = 200;
const debris = [];

// Parça, bloğun yan dokusundan rastgele 4x4 piksellik bir kesit taşır.
function debrisMesh(block) {
  const def = BLOCKS[block];
  const tile = def.side, u0 = Math.floor(Math.random() * 12) / 16, v0 = Math.floor(Math.random() * 12) / 16;
  const geo = new THREE.BoxGeometry(DEBRIS_SIZE, DEBRIS_SIZE, DEBRIS_SIZE);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (tile + u0 + uv.getX(i) * 0.25) / N_TILES, v0 + uv.getY(i) * 0.25);
  return new THREE.Mesh(geo, dropBlockMaterial);
}
// count parça, (x, y, z) bloğunun içinden; spread: saçılma hızı
function spawnDebris(block, x, y, z, count, spread = 3) {
  if (block === AIR || BLOCKS[block].fluid) return;
  for (let i = 0; i < count; i++) {
    const mesh = debrisMesh(block);
    mesh.position.set(x + 0.2 + Math.random() * 0.6, y + 0.2 + Math.random() * 0.6, z + 0.2 + Math.random() * 0.6);
    scene.add(mesh);
    debris.push({ mesh, vx: (Math.random() - 0.5) * spread, vy: Math.random() * spread, vz: (Math.random() - 0.5) * spread, life: DEBRIS_LIFE });
  }
  // En eski parçalar silinir
  while (debris.length > MAX_DEBRIS) removeDebris(debris[0]);
}
function removeDebris(d) {
  scene.remove(d.mesh);
  d.mesh.geometry.dispose();
  debris.splice(debris.indexOf(d), 1);
}
function updateDebris(dt) {
  for (const d of [...debris]) {
    d.life -= dt;
    if (d.life <= 0) { removeDebris(d); continue; }
    d.vy -= GRAVITY * dt;
    const pos = d.mesh.position;
    const below = get(Math.floor(pos.x), Math.floor(pos.y + d.vy * dt - DEBRIS_SIZE / 2), Math.floor(pos.z));
    // Katı bir bloğa değince yerde kalır
    if (isSolid(below) && d.vy < 0) { d.vy = 0; d.vx *= 0.5; d.vz *= 0.5; }
    pos.x += d.vx * dt; pos.y += d.vy * dt; pos.z += d.vz * dt;
    d.mesh.scale.setScalar(Math.min(1, d.life / 0.3));
  }
}

Object.assign(window.game, { debris, spawnDebris });
