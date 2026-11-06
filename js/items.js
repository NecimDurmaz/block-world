// ---------- Eşyalar ----------
// Eşya tablosu (ITEMS), simgeler, aletler, yemekler, yerdeki eşyalar ve toplama.

// Eşya anahtarları İngilizcedir. Blok eşyalarının anahtarı B'deki adıyla aynıdır.
const ITEMS = {};
const BLOCK_ITEM = {};
for (const [key, id] of Object.entries(B)) { ITEMS[key] = { name: BLOCKS[id].name, block: id }; BLOCK_ITEM[id] = key; }
// Blok olmayan eşyalar: 8x8 piksel desen, 2 kat büyütülerek 16x16 çizilir.
const ITEM_ART = {
  raw_beef: ['Çiğ biftek', { r: '#c4302b', w: '#f0d0c8' }, ['..rrrr..', '.rrwrrr.', 'rrrrrwrr', 'rrwrrrrr', 'rrrrrrwr', '.rrrwrr.', '..rrrr..', '........']],
  raw_pork: ['Çiğ domuz eti', { r: '#f19a9a', w: '#ffd6d0' }, ['..rrrr..', '.rrwrrr.', 'rrrrrwrr', 'rrwrrrrr', 'rrrrrrwr', '.rrrwrr.', '..rrrr..', '........']],
  raw_chicken: ['Çiğ tavuk', { p: '#f3c7b4', w: '#f4f4f0' }, ['....pppp', '...ppppp', '..pppppp', '.ppppp..', '.pppp...', 'wpp.....', 'ww......', 'w.......']],
  feather: ['Tüy', { w: '#f4f4f0', g: '#9a9a9a' }, ['......ww', '.....www', '....www.', '...www..', '..www...', '.www....', 'gw......', 'g.......']],
  wool: ['Yün', { w: '#ececec', g: '#d6d6d6' }, ['wwwwwwww', 'wwgwwwww', 'wwwwwgww', 'wgwwwwww', 'wwwwgwww', 'wwwwwwgw', 'wwgwwwww', 'wwwwwwww']],
  rotten_flesh: ['Çürük et', { g: '#6f8a3a', b: '#8a5a3a' }, ['..gggg..', '.ggbggg.', 'gggggbgg', 'ggbggggg', 'gggggbgg', '.ggbggg.', '..gggg..', '........']],
  bone: ['Kemik', { w: '#ecebe2' }, ['......ww', '.....www', '....ww..', '...ww...', '..ww....', 'www.....', 'ww......', '........']],
  arrow: ['Ok', { b: '#6b4a2b', g: '#9a9a9a', w: '#f4f4f0' }, ['......gg', '.....ggg', '....bg..', '...b....', '..b.....', 'wb......', 'ww......', 'w.......']],
  door: ['Kapı', { b: '#96693c', d: '#5c4024', g: '#a9cbe0' }, ['..dddd..', '..dggd..', '..dggd..', '..dbbd..', '..dbbd..', '..dbbd..', '..dbbd..', '..dddd..']],
  wheat: ['Buğday', { y: '#d6b44a', d: '#a8842a' }, ['......yy', '.....yd.', '....yy..', '...yd...', '..yy....', '.d......', 'd.......', '........']],
  bread: ['Ekmek', { b: '#c8883e', d: '#8a5a24', l: '#e8b870' }, ['........', '..bbbb..', '.blblbb.', 'bbbbbbbd', 'bbbbbbbd', '.dddddd.', '........', '........']],
  wooden_hoe: ['Tahta çapa', { h: '#b08a52', d: '#7a5a32', s: '#6b4a2b' }, ['..hhhh..', '..d..s..', '....s...', '...s....', '..s.....', '.s......', 's.......', '........']],
  wheat_seeds: ['Buğday tohumu', { g: '#5f9a3a', d: '#3f6a22' }, ['........', '..g..d..', '....g...', '.d....g.', '...g....', '.g...d..', '....g...', '........']],
  bed: ['Yatak', { w: '#ececec', r: '#a8282a', b: '#7a5a32' }, ['........', '........', 'wwrrrrrr', 'wwrrrrrr', 'bbbbbbbb', 'b......b', '........', '........']],
  stick: ['Çubuk', { b: '#6b4a2b', l: '#8f6a40' }, ['......lb', '.....lb.', '....lb..', '...lb...', '..lb....', '.lb.....', 'lb......', '........']],
  torch: ['Meşale', { b: '#6b4a2b', y: '#ffd23a', o: '#ff8a1f' }, ['...yy...', '..yooy..', '...oo...', '...bb...', '...bb...', '...bb...', '...bb...', '........']],
  cooked_beef: ['Pişmiş biftek', { r: '#7a3e22', w: '#c08a5a' }, ['..rrrr..', '.rrwrrr.', 'rrrrrwrr', 'rrwrrrrr', 'rrrrrrwr', '.rrrwrr.', '..rrrr..', '........']],
  cooked_pork: ['Pişmiş domuz eti', { r: '#b8704a', w: '#e8b88a' }, ['..rrrr..', '.rrwrrr.', 'rrrrrwrr', 'rrwrrrrr', 'rrrrrrwr', '.rrrwrr.', '..rrrr..', '........']],
  cooked_chicken: ['Pişmiş tavuk', { p: '#c8823e', w: '#f4f4f0' }, ['....pppp', '...ppppp', '..pppppp', '.ppppp..', '.pppp...', 'wpp.....', 'ww......', 'w.......']],
  iron_ingot: ['Demir külçe', { w: '#e6e6e6', g: '#b8b8b8', d: '#8a8a8a' }, ['........', '........', '..wwwww.', '.wwwwwgd', 'wggggggd', 'dddddddd', '........', '........']],
  charcoal: ['Odun kömürü', { k: '#2a2219', g: '#4a3a2a' }, ['........', '..kkkk..', '.kkgkkk.', '.kkkkgk.', '.kgkkkk.', '.kkkkkk.', '..kkkk..', '........']],
  apple: ['Elma', { r: '#d0302c', d: '#9a1f1c', g: '#4f8a2a', b: '#6b4a2b' }, ['....b...', '...bg...', '.rrrrrr.', 'rrrrrrdr', 'rrrrrrdr', 'rrrrrddr', '.rrrrdd.', '..rrrr..']],
  coal: ['Kömür', { k: '#1e1e1e', g: '#3c3c3c' }, ['........', '..kkkk..', '.kkgkkk.', '.kkkkgk.', '.kgkkkk.', '.kkkkkk.', '..kkkk..', '........']],
};
for (const [key, [name, palette, rows]] of Object.entries(ITEM_ART)) {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ic = c.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (palette[ch]) { ic.fillStyle = palette[ch]; ic.fillRect(x * 2, y * 2, 2, 2); } }));
  ITEMS[key] = { name, canvas: c };
}
// Aletler: 2 seviye x 4 tür. tool: tür, speed: doğru blokta hız çarpanı, durability: kullanım hakkı, damage: vuruş hasarı.
const TOOL_TIERS = {
  wooden: { name: 'Tahta', tier: 1, head: '#b08a52', dark: '#7a5a32', speed: 2, durability: 60, material: 'planks' },
  stone: { name: 'Taş', tier: 2, head: '#9a9a9a', dark: '#626262', speed: 4, durability: 132, material: 'cobble' },
};
// damage: [tahta, taş]. Desen: M malzeme, S çubuk.
const TOOL_KINDS = {
  pickaxe: { name: 'kazma', damage: [2, 3], pattern: ['MMM', '.S.', '.S.'],
    art: ['.hhhhh..', 'd...sd..', '...s.h..', '..s..d..', '.s......', 's.......', '........', '........'] },
  axe: { name: 'balta', damage: [3, 3], pattern: ['MM', 'MS', '.S'],
    art: ['...hh...', '..hhhh..', '..hdsh..', '...sd...', '..s.....', '.s......', 's.......', '........'] },
  shovel: { name: 'kürek', damage: [2, 2], pattern: ['M', 'S', 'S'],
    art: ['.....hh.', '....hhhh', '.....hdh', '....s.h.', '...s....', '..s.....', '.s......', 's.......'] },
  sword: { name: 'kılıç', damage: [4, 5], pattern: ['M', 'M', 'S'],
    art: ['.......h', '......hd', '.....hd.', '....hd..', '.s.hd...', '..sd....', '.s.s....', 's.......'] },
};
for (const [tierKey, tier] of Object.entries(TOOL_TIERS)) Object.entries(TOOL_KINDS).forEach(([kindKey, kind]) => {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ic = c.getContext('2d');
  const palette = { h: tier.head, d: tier.dark, s: '#6b4a2b' };
  kind.art.forEach((row, y) => [...row].forEach((ch, x) => { if (palette[ch]) { ic.fillStyle = palette[ch]; ic.fillRect(x * 2, y * 2, 2, 2); } }));
  ITEMS[`${tierKey}_${kindKey}`] = {
    name: `${tier.name} ${kind.name}`, canvas: c, tool: kindKey, speed: tier.speed,
    durability: tier.durability, damage: kind.damage[tierKey === 'wooden' ? 0 : 1], tier: tier.tier,
  };
});
// Yemekler: doldurduğu açlık puanı
Object.assign(ITEMS.raw_beef, { food: 3 });
Object.assign(ITEMS.raw_pork, { food: 3 });
Object.assign(ITEMS.raw_chicken, { food: 2 });
Object.assign(ITEMS.cooked_beef, { food: 8 });
Object.assign(ITEMS.cooked_pork, { food: 8 });
Object.assign(ITEMS.cooked_chicken, { food: 6 });
Object.assign(ITEMS.rotten_flesh, { food: 2 });
Object.assign(ITEMS.apple, { food: 4 });
Object.assign(ITEMS.bread, { food: 5 });
Object.assign(ITEMS.wooden_hoe, { tool: 'hoe', tier: 1, speed: 1, durability: 60, damage: 1 });
ITEMS.furnace_lit.hidden = true; // yalnızca dünyada; kırılınca fırın düşer
const extraOf = s => s.durability !== undefined ? { durability: s.durability } : {};

// HUD'da kullanılacak simge (data URL)
const iconCache = {};
function itemIcon(key) {
  if (!iconCache[key]) iconCache[key] = ITEMS[key].block ? tileImage(BLOCKS[ITEMS[key].block].side) : ITEMS[key].canvas.toDataURL();
  return iconCache[key];
}

// Ölen canlının düşürdükleri: [eşya, en az, en çok]
const MOB_DROPS = {
  cow: [['raw_beef', 1, 3]], pig: [['raw_pork', 1, 3]], chicken: [['raw_chicken', 1, 1], ['feather', 0, 2]],
  sheep: [['wool', 1, 1]], zombie: [['rotten_flesh', 0, 2]], skeleton: [['bone', 0, 2], ['arrow', 0, 2]],
};
function dropLoot(m) {
  for (const [key, min, max] of MOB_DROPS[m.kind] || []) {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    for (let i = 0; i < count; i++) dropItem(key, m.x, m.y + 0.5, m.z);
  }
}

// Yerdeki eşyalar: 0,25'lik küp (blok) ya da düz simge; döner, hafifçe inip kalkar, 5 dk sonra kaybolur.
const ITEM_LIFETIME = 300, PICKUP_RANGE = 1.5;
const drops = [];
const dropBlockMaterial = new THREE.MeshBasicMaterial({ map: texture });
const dropFlatMaterials = {};
function dropMesh(key) {
  const item = ITEMS[key];
  if (item.block) {
    const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const def = BLOCKS[item.block], uv = geo.attributes.uv;
    // BoxGeometry yüzleri: +x, -x, +y, -y, +z, -z; her yüzde 4 köşe
    for (let f = 0; f < 6; f++) {
      const tile = f === 2 ? def.top : f === 3 ? def.bottom : def.side;
      for (let v = f * 4; v < f * 4 + 4; v++) uv.setX(v, (tile + uv.getX(v)) / N_TILES);
    }
    return new THREE.Mesh(geo, dropBlockMaterial);
  }
  if (!dropFlatMaterials[key]) {
    const t = new THREE.CanvasTexture(item.canvas);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    dropFlatMaterials[key] = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
  }
  return new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), dropFlatMaterials[key]);
}
function dropItem(key, x, y, z) {
  const mesh = dropMesh(key);
  scene.add(mesh);
  const d = { key, x, y, z, w: 0.125, h: 0.25, vx: (Math.random() - 0.5) * 2, vy: 3, vz: (Math.random() - 0.5) * 2, onGround: false, age: 0, pickupDelay: 0, mesh };
  drops.push(d);
  return d;
}
function removeDrop(d) {
  scene.remove(d.mesh);
  d.mesh.geometry.dispose();
  drops.splice(drops.indexOf(d), 1);
}
// Envantere sığarsa toplanır; sığmazsa yerde kalır.
const collectItem = d => addItem(d.key, 1, d.extra) === 0;
function updateDrops(dt) {
  for (const d of [...drops]) {
    d.age += dt;
    if (d.age > ITEM_LIFETIME) { removeDrop(d); continue; }
    const dx = player.x - d.x, dy = player.y + 0.9 - d.y, dz = player.z - d.z, dist = Math.hypot(dx, dy, dz);
    d.pickupDelay = Math.max(0, (d.pickupDelay || 0) - dt);
    if (!dead && dist < PICKUP_RANGE && !d.pickupDelay) {
      // Oyuncuya doğru çekilir; yeterince yaklaşınca toplanır.
      if (dist < 0.6 && collectItem(d)) { toast('+1 ' + ITEMS[d.key].name); removeDrop(d); continue; }
      d.x += dx / dist * 6 * dt; d.y += dy / dist * 6 * dt; d.z += dz / dist * 6 * dt;
    } else {
      const friction = d.onGround ? Math.exp(-dt * 8) : 1;
      d.vx *= friction; d.vz *= friction;
      d.vy = Math.max(d.vy - GRAVITY * dt, -20);
      stepEntity(d, dt);
    }
  }
}
function renderDrops() {
  for (const d of drops) {
    d.mesh.position.set(d.x, d.y + 0.15 + Math.sin(d.age * 3) * 0.05, d.z);
    d.mesh.rotation.y = d.age * 2;
  }
}
Object.assign(window.game, { drops, dropItem });
