// ---------- Kova ----------
// Boş kova su ya da lav kaynağını alır; dolu kova bakılan yüzün önüne kaynak koyar.

const bucketArt = c => pixelArt(['........', 'g......g', 'gccccccg', 'gccccccg', '.gccccg.', '.gccccg.', '..gggg..', '........'], { g: '#c8c8c8', c });
ITEMS.bucket = { name: 'Kova', maxStack: 16, canvas: bucketArt('#4a4a4a') };
ITEMS.water_bucket = { name: 'Su kovası', maxStack: 1, canvas: bucketArt('#3a6fd8'), fills: 'water' };
ITEMS.lava_bucket = { name: 'Lav kovası', maxStack: 1, canvas: bucketArt('#e8601c'), fills: 'lava' };
RECIPES.push({ pattern: ['I.I', '.I.'], keys: { I: 'iron_ingot' }, out: ['bucket', 1] });
const heldBucket = () => ['bucket', 'water_bucket', 'lava_bucket'].includes(inventory[selected]?.key) ? inventory[selected] : null;

// Bakış ışını üzerindeki ilk sıvı kaynağı (araya katı blok girerse yok)
function sourceInSight() {
  const q = new THREE.Vector3();
  for (let t = aim.start; t <= aim.max; t += 0.05) {
    q.copy(aim.o).addScaledVector(aim.d, t);
    const x = Math.floor(q.x), y = Math.floor(q.y), z = Math.floor(q.z), b = get(x, y, z);
    if (liquidOf(b) && BLOCKS[b].level === 0) return { x, y, z, kind: liquidOf(b) };
    if (isTargetable(b)) return null;
  }
  return null;
}
// Seçili kova yığınından birini verilen eşyaya çevirir.
function swapBucket(key) {
  const s = inventory[selected];
  if (s.count > 1) { s.count--; giveOrDrop({ key, count: 1 }); } else inventory[selected] = { key, count: 1 };
  renderInventory();
}
function useBucket() {
  const s = heldBucket();
  if (s.key === 'bucket') {
    const src = sourceInSight();
    if (!src) return;
    set(src.x, src.y, src.z, AIR);
    rebuildAround(src.x, src.z);
    swapBucket(src.kind + '_bucket');
    return;
  }
  const hit = raycast();
  if (!hit) return;
  const { px: x, py: y, pz: z } = hit;
  const cur = get(x, y, z);
  if (!inBounds(x, y, z) || (cur !== AIR && !liquidOf(cur) && !BLOCKS[cur].replaceable)) return;
  // Nether'de su buharlaşır
  if (ITEMS[s.key].fills === 'water' && dimension === 'nether') toast('Su buharlaştı');
  else set(x, y, z, B[ITEMS[s.key].fills]);
  enqueueAround(x, y, z);
  rebuildAround(x, z);
  swapBucket('bucket');
}
