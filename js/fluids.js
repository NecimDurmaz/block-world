// ---------- Akan sıvılar ----------
// Su ve lav akışı: seviye 0 kaynak, 1–7 akan. Bütün dünya taranmaz; yalnızca değişen hücrelerin çevresi kuyruğa girer.

// tick: kaç saniyede bir adım; maxLevel: en uzak yayılma (lav ana dünyada 3, Nether'de 7)
const FLUIDS = {
  water: { tick: 0.25, maxLevel: () => 7 },
  lava: { tick: 1.5, maxLevel: () => dimension === 'nether' ? 7 : 3 },
};
// Bir adımda en çok bu kadar hücre işlenir; bir karede en çok 2 chunk yeniden kurulur.
const FLUID_STEP_LIMIT = 4000, FLUID_REBUILDS_PER_FRAME = 2;
const fluidQueues = { water: new Set(), lava: new Set() };
const fluidTimers = { water: 0, lava: 0 };
const dirtyChunks = new Set();
const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]];
const NEIGHBORS = [...SIDES, [0, 1, 0], [0, -1, 0]];
const cellOf = key => key.split(',').map(Number);

function enqueueAround(x, y, z, kinds = ['water', 'lava']) {
  for (const [dx, dy, dz] of [[0, 0, 0], ...NEIGHBORS]) {
    if (!inBounds(x + dx, y + dy, z + dz)) continue;
    for (const kind of kinds) fluidQueues[kind].add((x + dx) + ',' + (y + dy) + ',' + (z + dz));
  }
}
// Oyuncu ya da oyun bir bloğu değiştirince: hücre ya da komşusu sıvıysa çevresi yeniden hesaplanır.
let fluidStepping = false;
function fluidBlockChanged(x, y, z) {
  if (fluidStepping) return;
  const near = [[0, 0, 0], ...NEIGHBORS].some(([dx, dy, dz]) => liquidOf(get(x + dx, y + dy, z + dz)));
  if (near) enqueueAround(x, y, z);
}
// Akan sıvı yan komşulara ancak altı dolu (aşağı akamıyorsa) yayılır.
function spreadsSideways(x, y, z, kind) {
  const below = get(x, y - 1, z);
  return below !== AIR && liquidOf(below) !== kind && !BLOCKS[below].replaceable;
}
// Hücrenin olması gereken hali: o türün bloğu ya da hava. null: bu tür bu hücreye karışmaz.
function desiredLiquid(x, y, z, kind) {
  const cur = get(x, y, z), curKind = liquidOf(cur);
  if (cur !== AIR && curKind !== kind && !BLOCKS[cur].replaceable) return null;
  if (curKind === kind && BLOCKS[cur].level === 0) return cur;
  // Üstünde aynı sıvı varsa aşağı akar
  if (liquidOf(get(x, y + 1, z)) === kind) return liquidBlock(kind, 1);
  let best = Infinity, sources = 0;
  for (const [dx, , dz] of SIDES) {
    const n = get(x + dx, y, z + dz);
    if (liquidOf(n) !== kind) continue;
    if (BLOCKS[n].level === 0) sources++;
    if (spreadsSideways(x + dx, y, z + dz, kind)) best = Math.min(best, BLOCKS[n].level + 1);
  }
  // İki su kaynağına komşu hücre (altı dolu ya da su) yeni kaynak olur
  const below = get(x, y - 1, z);
  if (kind === 'water' && sources >= 2 && (isSolid(below) || below === B.water)) return B.water;
  if (best <= FLUIDS[kind].maxLevel()) return liquidBlock(kind, best);
  return curKind === kind ? AIR : cur;
}
// Su lava değerse: lav kaynağı obsidyen, akan lav kırık taş olur.
function quench(x, y, z) {
  const b = get(x, y, z);
  if (!isLava(b) || !NEIGHBORS.some(([dx, dy, dz]) => isWater(get(x + dx, y + dy, z + dz)))) return false;
  writeCell(x, y, z, BLOCKS[b].level === 0 ? B.obsidian : B.cobble);
  return true;
}
function writeCell(x, y, z, b) {
  set(x, y, z, b);
  const cx = Math.floor(x / CH), cz = Math.floor(z / CH);
  dirtyChunks.add(cx + ',' + cz);
  // Chunk kenarındaki hücre komşu chunk'ın yüzlerini de etkiler
  const lx = x - cx * CH, lz = z - cz * CH;
  if (lx === 0) dirtyChunks.add((cx - 1) + ',' + cz);
  if (lx === CH - 1) dirtyChunks.add((cx + 1) + ',' + cz);
  if (lz === 0) dirtyChunks.add(cx + ',' + (cz - 1));
  if (lz === CH - 1) dirtyChunks.add(cx + ',' + (cz + 1));
}
function stepFluid(kind) {
  const cells = [...fluidQueues[kind]].slice(0, FLUID_STEP_LIMIT);
  cells.forEach(i => fluidQueues[kind].delete(i));
  // Önce bütün kararlar verilir, sonra yazılır: bir adımda sıvı yalnızca bir blok ilerler.
  const changes = [];
  for (const i of cells) {
    const [x, y, z] = cellOf(i);
    const want = desiredLiquid(x, y, z, kind);
    if (want !== null && want !== get(x, y, z)) changes.push([x, y, z, want]);
  }
  fluidStepping = true;
  for (const [x, y, z, want] of changes) {
    writeCell(x, y, z, want);
    enqueueAround(x, y, z, [kind]);
  }
  // Su ile lav buluşması
  for (const i of cells) {
    const [x, y, z] = cellOf(i);
    for (const [dx, dy, dz] of [[0, 0, 0], ...NEIGHBORS]) {
      if (quench(x + dx, y + dy, z + dz)) enqueueAround(x + dx, y + dy, z + dz);
    }
  }
  fluidStepping = false;
}
function updateFluids(dt) {
  for (const kind of ['water', 'lava']) {
    if (!fluidQueues[kind].size) { fluidTimers[kind] = 0; continue; }
    fluidTimers[kind] += dt;
    if (fluidTimers[kind] >= FLUIDS[kind].tick) { fluidTimers[kind] = 0; stepFluid(kind); }
  }
  let n = 0;
  for (const key of dirtyChunks) {
    if (n++ >= FLUID_REBUILDS_PER_FRAME) break;
    dirtyChunks.delete(key);
    rebuildKey(key);
  }
}
// Dünya değişince (portal) kuyruklar boşalır.
function clearFluids() {
  fluidQueues.water.clear(); fluidQueues.lava.clear(); dirtyChunks.clear();
}
// Dünya üretimi bittikten sonra bağlanır.
onBlockSet = fluidBlockChanged;
Object.assign(window.game, { fluidQueues, updateFluids, fluidPending: () => fluidQueues.water.size + fluidQueues.lava.size + dirtyChunks.size });
