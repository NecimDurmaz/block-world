// ---------- Oyuncu ve fizik ----------
// Oyuncu durumu, doğma noktası ve ortak AABB fiziği.

const W = 0.3, H = 1.8, EYE = 1.62, GRAVITY = 26, JUMP = 8.4, MAX_HEALTH = 20, MAX_FOOD = 20;
// kx/kz: geri itilme hızı, her karede söner. fallPeak: havadayken ulaşılan en yüksek y.
// w/h: çarpışma kutusunun yarı genişliği ve boyu (canlılarla ortak fizik bunları kullanır).
const player = { x: SX / 2 + 0.5, y: 0, z: SZ / 2 + 0.5, w: W, h: H, vx: 0, vy: 0, vz: 0, kx: 0, kz: 0, yaw: 0, pitch: 0, onGround: false, health: MAX_HEALTH, food: MAX_FOOD, fallPeak: null };
// Yatakla belirlenen doğma noktası; yoksa dünyanın ortası.
let spawnPoint = null;
function spawn() {
  if (spawnPoint) {
    Object.assign(player, spawnPoint, { vx: 0, vy: 0, vz: 0, kx: 0, kz: 0, fallPeak: null });
    return;
  }
  const x = Math.floor(SX / 2), z = Math.floor(SZ / 2);
  let y = SY - 1;
  while (y > 0 && passable(get(x, y - 1, z))) y--;
  Object.assign(player, { x: x + 0.5, y: y, z: z + 0.5, vx: 0, vy: 0, vz: 0, kx: 0, kz: 0, fallPeak: null });
}
spawn();

const solid = (x, y, z) => (x < 0 || z < 0 || x >= SX || z >= SZ) ? true : isSolid(get(x, y, z));
// Varlığın kutusu verilen blok türüyle kesişiyor mu (ör. su)
function overlapsBlock(e, block) {
  for (let bx = Math.floor(e.x - e.w); bx <= Math.floor(e.x + e.w); bx++)
    for (let by = Math.floor(e.y); by <= Math.floor(e.y + e.h - 0.001); by++)
      for (let bz = Math.floor(e.z - e.w); bz <= Math.floor(e.z + e.w); bz++)
        if (get(bx, by, bz) === block) return true;
  return false;
}
// Oyuncu ve canlılar için ortak AABB fiziği: e = { x, y, z, w, h, vx, vy, vz, onGround }
// Bloğun hücre içindeki çarpışma kutusu [x0, y0, z0, x1, y1, z1]: kapı levhası (box), alçak blok (height) ya da tam hücre.
const blockBox = b => BLOCKS[b].box || [0, 0, 0, 1, BLOCKS[b].height || 1, 1];
// e kutusu (x, y, z) konumundayken kesiştiği blok kutuları, dünya koordinatında. Dünya kenarı duvardır.
function overlappingBoxes(e, x, y, z) {
  const boxes = [];
  for (let bx = Math.floor(x - e.w); bx <= Math.floor(x + e.w); bx++)
    for (let by = Math.floor(y); by <= Math.floor(y + e.h - 0.001); by++)
      for (let bz = Math.floor(z - e.w); bz <= Math.floor(z + e.w); bz++) {
        if (bx < 0 || bz < 0 || bx >= SX || bz >= SZ) { boxes.push([bx, by, bz, bx + 1, by + 1, bz + 1]); continue; }
        const b = get(bx, by, bz);
        if (!isSolid(b)) continue;
        const [x0, y0, z0, x1, y1, z1] = blockBox(b);
        const box = [bx + x0, by + y0, bz + z0, bx + x1, by + y1, bz + z1];
        if (x - e.w < box[3] && x + e.w > box[0] && y < box[4] && y + e.h > box[1] && z - e.w < box[5] && z + e.w > box[2]) boxes.push(box);
      }
  return boxes;
}
const collides = (e, x, y, z) => overlappingBoxes(e, x, y, z).length > 0;
// Çarpışma olduysa varlığı çarptığı kutunun yüzüne dayar ve true döner.
function moveAxis(e, axis, d) {
  if (!d) return false;
  e[axis] += d;
  const boxes = overlappingBoxes(e, e.x, e.y, e.z);
  if (!boxes.length) return false;
  const i = { x: 0, y: 1, z: 2 }[axis];
  if (axis === 'y') {
    if (d < 0) { e.y = Math.max(...boxes.map(b => b[4])); e.onGround = true; }
    else e.y = Math.min(...boxes.map(b => b[1])) - e.h - 0.001;
    e.vy = 0;
  } else {
    e[axis] = d > 0 ? Math.min(...boxes.map(b => b[i])) - e.w - 0.001 : Math.max(...boxes.map(b => b[i + 3])) + e.w + 0.001;
  }
  return true;
}
// Hızı dt boyunca uygular; adım 0,4 bloktan büyükse alt adımlara böler. Yatayda çarptıysa true döner.
function stepEntity(e, dt) {
  const steps = Math.ceil(Math.max(Math.abs(e.vx), Math.abs(e.vy), Math.abs(e.vz)) * dt / 0.4) || 1;
  let blocked = false;
  for (let i = 0; i < steps; i++) {
    e.onGround = false;
    blocked = moveAxis(e, 'x', e.vx * dt / steps) || blocked;
    blocked = moveAxis(e, 'z', e.vz * dt / steps) || blocked;
    moveAxis(e, 'y', e.vy * dt / steps);
  }
  return blocked;
}
