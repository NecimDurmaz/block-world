// ---------- Dünya üretimi ----------
// Dünya dizisi, gürültü fonksiyonları ve dünya üretimi (arazi, mağara, göl, cevher, ağaç, bitki).

const SX = 96, SY = 48, SZ = 96, CH = 16, SEED = 20261106;
// Etkin dünya (world) ana dünya ya da Nether dizisini gösterir; portaldan geçince değişir (nether.js).
let world = new Uint8Array(SX * SY * SZ);
const worlds = { overworld: world, nether: new Uint8Array(SX * SY * SZ) };
const inBounds = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < SX && y < SY && z < SZ;
const index = (x, y, z) => (y * SZ + z) * SX + x;
function get(x, y, z) {
  if (y < 0) return B.stone;
  return inBounds(x, y, z) ? world[index(x, y, z)] : AIR;
}
const set = (x, y, z, v) => { if (inBounds(x, y, z)) world[index(x, y, z)] = v; };

function hash(x, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263) + SEED) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function valueNoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi;
  const sx = fx * fx * (3 - 2 * fx), sz = fz * fz * (3 - 2 * fz);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz;
}
// 3B değer gürültüsü (mağaralar için): köşe değerleri arasında yumuşak üç doğrusal karışım
function hash3(x, y, z) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 1442695041) + Math.imul(z, 668265263) + SEED) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function valueNoise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const s = t => t * t * (3 - 2 * t);
  const fx = s(x - xi), fy = s(y - yi), fz = s(z - zi);
  const lerp = (a, b, t) => a + (b - a) * t;
  const corner = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  const plane = dy => lerp(lerp(corner(0, dy, 0), corner(1, dy, 0), fx), lerp(corner(0, dy, 1), corner(1, dy, 1), fx), fz);
  return lerp(plane(0), plane(1), fy);
}
function fbm(x, z) {
  let sum = 0, amp = 0.5, freq = 1;
  for (let o = 0; o < 4; o++) { sum += valueNoise(x * freq, z * freq) * amp; amp *= 0.5; freq *= 2; }
  return sum / 0.9375;
}

const heights = new Int16Array(SX * SZ);
for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
  const h = Math.floor(6 + Math.pow(fbm(x / 36, z / 36), 1.4) * 34);
  heights[z * SX + x] = h;
  for (let y = 0; y <= h; y++) {
    let b = B.stone;
    if (h <= 14) b = y > h - 3 ? B.sand : B.stone;
    else if (y === h) b = B.grass;
    else if (y > h - 4) b = B.dirt;
    set(x, y, z, b);
  }
}
// Mağaralar: iki 3B gürültünün aynı anda 0,5'e yakın olduğu yerler kıvrımlı tüneller oluşturur.
// y = 2 ile yüzeyin 4 altı arasında oyulur; yamaçlarda alçak komşu sütunlara ağız açar.
const CAVE_RADIUS = 0.075;
for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
  const top = heights[z * SX + x] - 4;
  for (let y = 2; y <= top; y++) {
    const a = valueNoise3(x / 14, y / 9, z / 14) - 0.5, b = valueNoise3(x / 14 + 57, y / 9 + 31, z / 14 + 83) - 0.5;
    if (a * a + b * b < CAVE_RADIUS * CAVE_RADIUS) set(x, y, z, AIR);
  }
}
// Obsidyen: chunk başına ~1 öbek, y ≤ 8'deki mağara tabanlarında 2–4 blok
const obsidianRnd = mulberry32(SEED + 13);
for (let cz = 0; cz < SZ / CH; cz++) for (let cx = 0; cx < SX / CH; cx++) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const x = cx * CH + Math.floor(obsidianRnd() * CH), z = cz * CH + Math.floor(obsidianRnd() * CH);
    const y = 2 + Math.floor(obsidianRnd() * 7);
    if (get(x, y, z) !== AIR || get(x, y - 1, z) !== B.stone) continue;
    const size = 2 + Math.floor(obsidianRnd() * 3);
    for (let i = 0, ox = x, oz = z; i < size; i++) {
      if (get(ox, y - 1, oz) === B.stone && get(ox, y, oz) === AIR) set(ox, y - 1, oz, B.obsidian);
      if (obsidianRnd() < 0.5) ox += obsidianRnd() < 0.5 ? 1 : -1; else oz += obsidianRnd() < 0.5 ? 1 : -1;
    }
    break;
  }
}
// Göller: y ≤ 12'de, arazi yüzeyinin üstünde kalan boşluklar suyla dolar (mağaralar kuru kalır).
const WATER_LEVEL = 12;
for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
  for (let y = heights[z * SX + x] + 1; y <= WATER_LEVEL; y++) if (get(x, y, z) === AIR) set(x, y, z, B.water);
}

// Cevher damarları: chunk başına kömür ~8 (y ≤ 30), demir ~4 (y ≤ 20), 3–8 blokluk; elmas ~1 (y ≤ 10), 1–4 blokluk. Yalnızca taşın içinde.
const oreRnd = mulberry32(SEED + 7);
function placeVein(ore, maxY, minSize = 3, maxSize = 8) {
  let x = Math.floor(oreRnd() * SX), y = 1 + Math.floor(oreRnd() * maxY), z = Math.floor(oreRnd() * SZ);
  const size = minSize + Math.floor(oreRnd() * (maxSize - minSize + 1));
  for (let i = 0; i < size; i++) {
    if (get(x, y, z) === B.stone) set(x, y, z, ore);
    const axis = Math.floor(oreRnd() * 3), step = oreRnd() < 0.5 ? -1 : 1;
    if (axis === 0) x += step; else if (axis === 1) y = Math.max(1, Math.min(maxY, y + step)); else z += step;
  }
}
const chunkCount = (SX / CH) * (SZ / CH);
for (let i = 0; i < chunkCount * 8; i++) placeVein(B.coal_ore, 30);
for (let i = 0; i < chunkCount * 4; i++) placeVein(B.iron_ore, 20);
for (let i = 0; i < chunkCount; i++) placeVein(B.diamond_ore, 10, 1, 4);

const treeRnd = mulberry32(SEED);
for (let i = 0; i < 160; i++) {
  const x = 3 + Math.floor(treeRnd() * (SX - 6)), z = 3 + Math.floor(treeRnd() * (SZ - 6));
  const h = heights[z * SX + x];
  if (get(x, h, z) !== B.grass || h > SY - 9) continue;
  const trunk = 4 + Math.floor(treeRnd() * 2);
  for (let y = 1; y <= trunk; y++) set(x, h + y, z, B.log);
  const top = h + trunk;
  for (let dy = -2; dy <= 1; dy++) {
    const r = dy >= 0 ? 1 : 2;
    for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) {
      if (Math.abs(dx) === r && Math.abs(dz) === r && treeRnd() < 0.5) continue;
      if (get(x + dx, top + dy, z + dz) === AIR) set(x + dx, top + dy, z + dz, B.leaves);
    }
  }
  set(x, top + 2, z, B.leaves);
}
// Çimenlerin %12'sine uzun ot, %2'sine çiçek (gelincik ya da karahindiba)
const plantRnd = mulberry32(SEED + 11);
for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
  let y = SY - 1;
  while (y > 0 && get(x, y - 1, z) === AIR) y--;
  if (get(x, y - 1, z) !== B.grass || get(x, y, z) !== AIR) continue;
  const r = plantRnd();
  if (r < 0.12) set(x, y, z, B.tall_grass);
  else if (r < 0.14) set(x, y, z, plantRnd() < 0.5 ? B.poppy : B.dandelion);
}
