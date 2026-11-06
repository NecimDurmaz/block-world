// ---------- Yapılar ----------
// Köyler: dünya üretiminin parçası. Her köy, 6×6 chunk'lık bir bölgenin tohumdan belirlenen planıdır; bir chunk üretilirken
// planın o chunk'a düşen kısmı çizilir (chunk sınırında kırpılır). Böylece köy hangi sırayla üretilirse üretilsin aynı çıkar.

const VILLAGE_REGION = 6;
const villagePlans = new Map(); // "rx,rz" -> plan ya da null
// Bölgenin köy planı: ova ya da ormanda, düz ve kuru bir merkez; merkezde kuyu, çevresinde 3–5 ev.
function villagePlan(rx, rz) {
  const key = rx + ',' + rz;
  if (villagePlans.has(key)) return villagePlans.get(key);
  const rnd = mulberry32(Math.floor(hash(rx * 31 + 5, rz * 17 - 3) * 4294967296));
  const cx = rx * VILLAGE_REGION + 1 + Math.floor(rnd() * 4), cz = rz * VILLAGE_REGION + 1 + Math.floor(rnd() * 4);
  const x = cx * CH + 8, z = cz * CH + 8, y = heightAt(x, z);
  let plan = null;
  if (['plains', 'forest'].includes(biomeAt(x, z)) && y > 15 && y < 30) {
    const count = 3 + Math.floor(rnd() * 3);
    const angles = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => rnd() - 0.5).slice(0, count);
    const houses = angles.map(a => {
      const angle = a * Math.PI / 4, d = 10 + Math.floor(rnd() * 2);
      const hx = x + Math.round(Math.cos(angle) * d), hz = z + Math.round(Math.sin(angle) * d);
      // Kapı kuyuya bakan duvarın ortasında
      const tx = x - hx, tz = z - hz;
      const door = Math.abs(tx) > Math.abs(tz) ? [Math.sign(tx), 0] : [0, Math.sign(tz)];
      return { x: hx, z: hz, y: heightAt(hx, hz), door };
    });
    plan = { id: key, x, y, z, houses };
  }
  villagePlans.set(key, plan);
  return plan;
}
// Chunk'a düşen köy parçalarını çizer (generateChunk'ın sonunda).
function placeVillageParts(cx, cz) {
  const plan = villagePlan(Math.floor(cx / VILLAGE_REGION), Math.floor(cz / VILLAGE_REGION));
  if (!plan) return;
  const x0 = cx * CH, z0 = cz * CH;
  const inside = (x, z) => x >= x0 && x < x0 + CH && z >= z0 && z < z0 + CH;
  const put = (x, y, z, b) => { if (inside(x, z)) set(x, y, z, b); };
  // Yollar: kuyudan her evin kapısının önüne, önce x sonra z boyunca toprak
  for (const h of plan.houses) {
    const ex = h.x + h.door[0] * 3, ez = h.z + h.door[1] * 3;
    const path = [];
    for (let x = Math.min(plan.x, ex); x <= Math.max(plan.x, ex); x++) path.push([x, plan.z]);
    for (let z = Math.min(plan.z, ez); z <= Math.max(plan.z, ez); z++) path.push([ex, z]);
    for (const [x, z] of path) {
      if (!inside(x, z)) continue;
      const y = heightAt(x, z);
      if (BLOCKS[get(x, y + 1, z)]?.replaceable) set(x, y + 1, z, AIR);
      if (get(x, y, z) === B.grass) set(x, y, z, B.dirt);
    }
  }
  // Kuyu: 4×4 kırık taş kenar, ortada 2×2 ve 2 derin su, köşelerde kütük direkler, üstte kırık taş çatı
  const { x, y, z } = plan;
  for (let dx = -1; dx <= 2; dx++) for (let dz = -1; dz <= 2; dz++) {
    const wx = x + dx, wz = z + dz, rim = dx === -1 || dx === 2 || dz === -1 || dz === 2;
    for (let wy = y - 3; wy <= y + 5; wy++) put(wx, wy, wz, wy <= y - 3 ? B.cobble : wy <= y ? (rim ? B.cobble : B.water) : AIR);
    if (rim) put(wx, y + 1, wz, B.cobble);
    if (Math.abs(dx - 0.5) === 1.5 && Math.abs(dz - 0.5) === 1.5) { put(wx, y + 2, wz, B.log); put(wx, y + 3, wz, B.log); }
    put(wx, y + 4, wz, B.cobble);
  }
  // Evler: 5×5 taban; kırık taş temel ve zemin, köşelerde kütük, tahta duvarlar, iki yanda cam, tahta çatı, açık kapı, içeride meşale
  for (const h of plan.houses) {
    const doorIndex = BED_DIRS.findIndex(([, d]) => d[0] === h.door[0] && d[1] === h.door[1]);
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) {
      const hx = h.x + dx, hz = h.z + dz;
      if (!inside(hx, hz)) continue;
      const edge = Math.abs(dx) === 2 || Math.abs(dz) === 2, corner = Math.abs(dx) === 2 && Math.abs(dz) === 2;
      for (let wy = Math.min(heightAt(hx, hz), h.y) - 1; wy <= h.y; wy++) set(hx, wy, hz, B.cobble);
      for (let wy = h.y + 1; wy <= h.y + 6; wy++) set(hx, wy, hz, AIR);
      if (edge) for (let wy = h.y + 1; wy <= h.y + 3; wy++) set(hx, wy, hz, corner ? B.log : B.planks);
      set(hx, h.y + 4, hz, B.planks);
      // Pencereler: kapının yanındaki iki duvarın ortası
      const side = h.door[0] ? Math.abs(dz) === 2 && dx === 0 : Math.abs(dx) === 2 && dz === 0;
      if (side) set(hx, h.y + 2, hz, B.glass);
    }
    const dx = h.x + h.door[0] * 2, dz = h.z + h.door[1] * 2;
    put(dx, h.y + 1, dz, doorId(doorIndex, 'lower', true));
    put(dx, h.y + 2, dz, doorId(doorIndex, 'upper', true));
    put(h.x - h.door[0], h.y + 1, h.z - h.door[1], B.torch_floor);
  }
}
// Doğma noktasının yakınındaki ilk köy (testler ve rehber için): r bölge çevresinde
function villageNear(x, z, r = 2) {
  const rx = Math.floor(x / CH / VILLAGE_REGION), rz = Math.floor(z / CH / VILLAGE_REGION);
  let best = null;
  for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    const plan = villagePlan(rx + dx, rz + dz);
    if (plan && (!best || Math.hypot(plan.x - x, plan.z - z) < Math.hypot(best.x - x, best.z - z))) best = plan;
  }
  return best;
}

// Açılışta doğma noktasının çevresi hemen üretilir (başlangıç alanını kapsar); gerisi yürüdükçe (chunk-loader.js).
ensureArea(SPAWN_X, SPAWN_Z, 3);
