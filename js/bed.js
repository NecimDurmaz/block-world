// ---------- Yatak ----------
// Yatak: doğma noktası ve uyku.

// Yatağa sağ tık doğma noktasını yatağın yanına taşır. Gece ve yakında düşman yoksa 2 sn uyunur, saat 06:00 olur.
const SLEEP_TIME = 2;
const sleepEl = document.getElementById('sleep');
let sleepTimer = 0;
function setSpawnNearBed(x, y, z) {
  const def = BLOCKS[get(x, y, z)], sign = def.part === 'foot' ? 1 : -1;
  const cells = [[x, z], [x + def.dir[0] * sign, z + def.dir[1] * sign]];
  for (const [cx, cz] of cells) for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const sx = cx + nx, sz = cz + nz;
    if (get(sx, y, sz) === AIR && get(sx, y + 1, sz) === AIR && isSolid(get(sx, y - 1, sz))) {
      spawnPoint = { x: sx + 0.5, y, z: sz + 0.5 };
      return;
    }
  }
  spawnPoint = { x: x + 0.5, y: y + BED_HEIGHT, z: z + 0.5 };
}
function useBed(x, y, z) {
  setSpawnNearBed(x, y, z);
  if (daylight(clock.time) >= 0.5) { toast('Sadece gece uyuyabilirsin'); return; }
  if (mobs.some(m => m.type.hostile && m.dying <= 0 && Math.hypot(m.x - player.x, m.y - player.y, m.z - player.z) <= 8)) {
    toast('Yakınlarda canavar var');
    return;
  }
  sleepTimer = SLEEP_TIME;
  sleepEl.style.opacity = 1;
}
function updateSleep(dt) {
  if (sleepTimer <= 0) return;
  sleepTimer -= dt;
  if (sleepTimer > 0) return;
  // Sabah 06:00: yeni gün
  clock.time = 0;
  clock.day++;
  sleepEl.style.opacity = 0;
  toast('Günaydın');
}
