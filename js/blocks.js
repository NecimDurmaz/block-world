// ---------- Bloklar ----------
// Blok tanımları (BLOCKS), kimlikler (B) ve blok sınıflandırma yardımcıları.

const AIR = 0;
const BED_DIRS = [['east', [1, 0]], ['west', [-1, 0]], ['south', [0, 1]], ['north', [0, -1]]], BED_HEIGHT = 9 / 16;
// breakTime: elle kırma süresi (sn). tool: bloğu hızlı kıran alet. needsTool: o alet olmadan kırılınca eşya düşmez.
// drop: kırılınca kendisi yerine düşen eşya.
const BLOCKS = [
  null,
  { name: 'Çimen', top: TILE.grassTop, side: TILE.grassSide, bottom: TILE.dirt, breakTime: 0.75, tool: 'shovel' },
  { name: 'Toprak', top: TILE.dirt, side: TILE.dirt, bottom: TILE.dirt, breakTime: 0.75, tool: 'shovel' },
  { name: 'Taş', top: TILE.stone, side: TILE.stone, bottom: TILE.stone, breakTime: 7.5, tool: 'pickaxe', needsTool: true, drop: 'cobble' },
  { name: 'Kütük', top: TILE.logTop, side: TILE.logSide, bottom: TILE.logTop, breakTime: 3, tool: 'axe' },
  { name: 'Yaprak', top: TILE.leaves, side: TILE.leaves, bottom: TILE.leaves, breakTime: 0.3 },
  { name: 'Kum', top: TILE.sand, side: TILE.sand, bottom: TILE.sand, breakTime: 0.75, tool: 'shovel' },
  { name: 'Tahta', top: TILE.planks, side: TILE.planks, bottom: TILE.planks, breakTime: 3, tool: 'axe' },
  { name: 'Tuğla', top: TILE.brick, side: TILE.brick, bottom: TILE.brick, breakTime: 7.5, tool: 'pickaxe', needsTool: true },
  { name: 'Kırık taş', top: TILE.cobble, side: TILE.cobble, bottom: TILE.cobble, breakTime: 7.5, tool: 'pickaxe', needsTool: true },
  { name: 'Çalışma masası', top: TILE.craftingTop, side: TILE.craftingSide, bottom: TILE.planks, breakTime: 3, tool: 'axe' },
  // Fırının her yanında ağız var (bloklar yön tutmuyor).
  { name: 'Fırın', top: TILE.furnaceTop, side: TILE.furnaceFront, bottom: TILE.furnaceTop, breakTime: 7.5, tool: 'pickaxe', needsTool: true },
  { name: 'Kumtaşı', top: TILE.sandstoneTop, side: TILE.sandstoneSide, bottom: TILE.sandstoneTop, breakTime: 4, tool: 'pickaxe', needsTool: true },
  { name: 'Fırın', top: TILE.furnaceTop, side: TILE.furnaceLit, bottom: TILE.furnaceTop, breakTime: 7.5, tool: 'pickaxe', needsTool: true, drop: 'furnace' },
  // cutout: saydam pikseller kesilir (opak mesh'te çizilir), arkasındaki yüzler görünür.
  { name: 'Cam', top: TILE.glass, side: TILE.glass, bottom: TILE.glass, breakTime: 0.5, transparent: true, cutout: true },
  // minTier: düşmesi için gereken en düşük alet seviyesi (1 tahta, 2 taş)
  { name: 'Kömür cevheri', top: TILE.coalOre, side: TILE.coalOre, bottom: TILE.coalOre, breakTime: 7.5, tool: 'pickaxe', needsTool: true, drop: 'coal' },
  { name: 'Demir cevheri', top: TILE.ironOre, side: TILE.ironOre, bottom: TILE.ironOre, breakTime: 7.5, tool: 'pickaxe', needsTool: true, minTier: 2 },
  // fluid: katı değil, nişan ışını geçer. transparent: arkasındaki yüzler çizilir, ayrı saydam mesh'te çizilir.
  { name: 'Su', top: TILE.water, side: TILE.water, bottom: TILE.water, breakTime: Infinity, fluid: true, transparent: true, hidden: true },
  // Meşaleler: tam blok değil (model: 'torch'), çarpışmasız (noCollide). lean: duvardan uzağa eğilme yönü [dx, dz].
  ...[[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(lean => ({
    name: 'Meşale', top: TILE.torch, side: TILE.torch, bottom: TILE.torch, breakTime: 0.05,
    model: 'torch', lean, noCollide: true, transparent: true, hidden: true, drop: 'torch',
  })),
  // Yatak: iki hücre (ayak ve baş), dir baş tarafının yönü. Yarım blok yüksekliğinde (height).
  ...BED_DIRS.flatMap(([, dir]) => ['foot', 'head'].map(part => ({
    name: 'Yatak', top: part === 'head' ? TILE.bedHeadTop : TILE.bedFootTop, side: TILE.bedSide, bottom: TILE.planks,
    breakTime: 0.3, tool: 'axe', model: 'bed', part, dir, height: BED_HEIGHT, transparent: true, hidden: true, drop: 'bed',
  }))),
  // Kapı: 3/16 kalınlığında levha (box). Kapalıyken baktığı yönün kenarında, açıkken sol kenarda.
  ...BED_DIRS.flatMap(([, dir]) => ['lower', 'upper'].flatMap(part => [false, true].map(open => {
    const [sx, sz] = open ? [dir[1], -dir[0]] : dir, t = 3 / 16;
    const box = sx === 1 ? [1 - t, 0, 0, 1, 1, 1] : sx === -1 ? [0, 0, 0, t, 1, 1] : sz === 1 ? [0, 0, 1 - t, 1, 1, 1] : [0, 0, 0, 1, 1, t];
    const tile = part === 'lower' ? TILE.doorLower : TILE.doorUpper;
    return { name: 'Kapı', top: tile, side: tile, bottom: tile, breakTime: 3, tool: 'axe', model: 'box', box, part, dir, open, transparent: true, hidden: true, drop: 'door' };
  }))),
  // Bitkiler: çapraz iki düzlem (model: 'cross'), çarpışmasız, anında kırılır, yerine blok konabilir (replaceable).
  ...[['Uzun ot', TILE.tallGrass], ['Gelincik', TILE.poppy], ['Karahindiba', TILE.dandelion]].map(([name, tile]) => ({
    name, top: tile, side: tile, bottom: tile, breakTime: 0.05, model: 'cross', noCollide: true, transparent: true, cutout: true,
    replaceable: true, hidden: true, noDrop: true,
  })),
  // Tarla: çapayla sürülmüş toprak; kırılınca toprak düşer
  { name: 'Tarla', top: TILE.farmland, side: TILE.dirt, bottom: TILE.dirt, breakTime: 0.75, tool: 'shovel', drop: 'dirt' },
  // Buğday 4 aşama (crop: aşama)
  ...[0, 1, 2, 3].map(stage => ({
    name: 'Buğday', top: TILE.wheat0 + stage, side: TILE.wheat0 + stage, bottom: TILE.wheat0 + stage, breakTime: 0.05,
    model: 'cross', noCollide: true, transparent: true, cutout: true, hidden: true, crop: stage,
  })),
  // Obsidyen: yalnızca demir kazmayla (tier 3) düşer; demir kazmayla 6 sn (36 / 6)
  { name: 'Obsidyen', top: TILE.obsidian, side: TILE.obsidian, bottom: TILE.obsidian, breakTime: 36, tool: 'pickaxe', needsTool: true, minTier: 3 },
  // Portal: çarpışmasız, nişan ışını geçer (fluid), chunk mesh'inde değil portal.js'teki ayrı düzlemlerle çizilir.
  // axis: düzlemin uzandığı yatay eksen
  ...['x', 'z'].map(axis => ({ name: 'Portal', top: TILE.obsidian, side: TILE.obsidian, bottom: TILE.obsidian, breakTime: Infinity, model: 'portal', axis, fluid: true, transparent: true, hidden: true, noDrop: true })),
];
const B = { grass: 1, dirt: 2, stone: 3, log: 4, leaves: 5, sand: 6, planks: 7, brick: 8, cobble: 9, crafting_table: 10, furnace: 11, sandstone: 12, furnace_lit: 13, glass: 14, coal_ore: 15, iron_ore: 16, water: 17,
  torch_floor: 18, torch_east: 19, torch_west: 20, torch_south: 21, torch_north: 22 };
// Yatak kimlikleri 23–30: her yön için ayak ve baş
BED_DIRS.forEach(([name], i) => { B['bed_foot_' + name] = 23 + i * 2; B['bed_head_' + name] = 24 + i * 2; });
const isBed = b => b >= 23 && b <= 30;
// Kapı kimlikleri 31–46: yön × (alt, üst) × (kapalı, açık)
const DOOR_FIRST = 31;
const isDoor = b => b >= DOOR_FIRST && b < DOOR_FIRST + 16;
const doorId = (dirIndex, part, open) => DOOR_FIRST + dirIndex * 4 + (part === 'upper' ? 2 : 0) + (open ? 1 : 0);
Object.assign(B, { tall_grass: 47, poppy: 48, dandelion: 49, farmland: 50, wheat_0: 51, wheat_1: 52, wheat_2: 53, wheat_3: 54, obsidian: 55, portal_x: 56, portal_z: 57 });
const isPortal = b => b === B.portal_x || b === B.portal_z;
const isCrop = b => b >= B.wheat_0 && b <= B.wheat_3;
const isPlant = b => BLOCKS[b]?.model === 'cross';
// Üstünden geçilebilen, zemin sayılmayan hücre (hava ya da bitki/meşale)
const passable = b => b === AIR || !!BLOCKS[b].noCollide;
BED_DIRS.forEach(([name], i) => ['lower', 'upper'].forEach(part => [false, true].forEach(open => {
  B[`door_${name}_${part}_${open ? 'open' : 'closed'}`] = doorId(i, part, open);
})));
const isTorch = b => b >= B.torch_floor && b <= B.torch_north;
// Katı blok: çarpışır, görüşü ve okları keser.
const isSolid = b => b !== AIR && !BLOCKS[b].fluid && !BLOCKS[b].noCollide;
// Nişan ışınının durduğu blok: su dışındaki her şey (meşale dahil).
const isTargetable = b => b !== AIR && !BLOCKS[b].fluid;
