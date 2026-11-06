// ---------- Oklar ----------
// İskelet okları.

// 20 blok/sn, hafif yerçekimi. Oyuncuya değerse 3 hasar; bloğa değerse 3 sn takılı kalıp kaybolur.
const ARROW_SPEED = 20, ARROW_GRAVITY = 6, ARROW_DAMAGE = 3, SKELETON_SHOT_INTERVAL = 2;
const projectiles = [];
const arrowMaterials = {
  shaft: new THREE.MeshBasicMaterial({ color: 0x6b4a2b }),
  tip: new THREE.MeshBasicMaterial({ color: 0x9a9a9a }),
  feather: new THREE.MeshBasicMaterial({ color: 0xf0f0f0 }),
};
function arrowMesh() {
  // Model +z yönünü gösterir; lookAt ile uçuş yönüne çevrilir.
  const g = new THREE.Group();
  const part = (w, h, d, mat, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.z = z; g.add(m); };
  part(0.04, 0.04, 0.5, arrowMaterials.shaft, 0);
  part(0.07, 0.07, 0.08, arrowMaterials.tip, 0.27);
  part(0.12, 0.02, 0.12, arrowMaterials.feather, -0.2);
  scene.add(g);
  return g;
}
function shootArrow(m) {
  const fx = -Math.sin(m.yaw), fz = -Math.cos(m.yaw);
  const x = m.x + fx * 0.5, y = m.y + 1.5, z = m.z + fz * 0.5;
  const dx = player.x - x, dy = player.y + 1.1 - y, dz = player.z - z;
  const flight = Math.hypot(dx, dy, dz) / ARROW_SPEED;
  // Yerçekimini telafi etmek için biraz yukarı nişan
  projectiles.push({ x, y, z, vx: dx / flight, vy: dy / flight + 0.5 * ARROW_GRAVITY * flight, vz: dz / flight, stuck: false, life: 8, mesh: arrowMesh() });
}
function updateProjectiles(dt) {
  for (const a of [...projectiles]) {
    a.life -= dt;
    if (!a.stuck) {
      const steps = 4;
      for (let i = 0; i < steps; i++) {
        a.vy -= ARROW_GRAVITY * dt / steps;
        a.x += a.vx * dt / steps; a.y += a.vy * dt / steps; a.z += a.vz * dt / steps;
        if (isSolid(get(Math.floor(a.x), Math.floor(a.y), Math.floor(a.z)))) { a.stuck = true; a.life = 3; break; }
        const p = player;
        if (!dead && a.x > p.x - p.w && a.x < p.x + p.w && a.y > p.y && a.y < p.y + p.h && a.z > p.z - p.w && a.z < p.z + p.w) {
          damagePlayer(ARROW_DAMAGE, a.x - a.vx, a.z - a.vz);
          a.life = 0;
          break;
        }
      }
      a.mesh.position.set(a.x, a.y, a.z);
      if (!a.stuck) a.mesh.lookAt(a.x + a.vx, a.y + a.vy, a.z + a.vz);
    }
    if (a.life <= 0) {
      scene.remove(a.mesh);
      a.mesh.traverse(o => o.geometry?.dispose());
      projectiles.splice(projectiles.indexOf(a), 1);
    }
  }
}
window.game.mobs = mobs;
window.game.projectiles = projectiles;
window.game.particles = particles;
window.game.spawnMob = spawnMob;
