// ---------- Zırh ----------
// Zırh eşyaları, 4 zırh yuvası, hasar azaltma, HUD zırh barı ve oyuncu modelindeki parçalar.

// Yuva sırası: kask, göğüslük, pantolon, bot. points: [demir, elmas] zırh puanı.
const ARMOR_PIECES = [
  { key: 'helmet', name: 'kask', points: [2, 3], pattern: ['MMM', 'M.M'],
    art: ['........', '.mmmmmm.', 'mllllllm', 'ml....lm', 'm......m', '........', '........', '........'] },
  { key: 'chestplate', name: 'göğüslük', points: [6, 8], pattern: ['M.M', 'MMM', 'MMM'],
    art: ['.mm..mm.', 'mllmmllm', 'mllllllm', '.mllllm.', '.mllllm.', '.mllllm.', '.mmmmmm.', '........'] },
  { key: 'leggings', name: 'pantolon', points: [5, 6], pattern: ['MMM', 'M.M', 'M.M'],
    art: ['.mmmmmm.', '.mllllm.', '.mlmmlm.', '.ml..lm.', '.ml..lm.', '.ml..lm.', '.mm..mm.', '........'] },
  { key: 'boots', name: 'bot', points: [2, 3], pattern: ['M.M', 'M.M'],
    art: ['........', '........', '.ml..lm.', '.ml..lm.', '.ml..lm.', 'mll..llm', 'mmm..mmm', '........'] },
];
const ARMOR_TIERS = [
  { key: 'iron', name: 'Demir', material: 'iron_ingot', durability: 165, light: '#e6e6e6', dark: '#9a9a9a', color: 0xd8d8d8 },
  { key: 'diamond', name: 'Elmas', material: 'diamond', durability: 363, light: '#7ff4e6', dark: '#2bb5a8', color: 0x5fe0d2 },
];
ARMOR_TIERS.forEach((tier, t) => ARMOR_PIECES.forEach((piece, slot) => {
  const key = `${tier.key}_${piece.key}`;
  ITEMS[key] = { name: `${tier.name} ${piece.name}`, canvas: pixelArt(piece.art, { m: tier.dark, l: tier.light }),
    armorSlot: slot, armor: piece.points[t], durability: tier.durability, color: tier.color };
  RECIPES.push({ pattern: piece.pattern, keys: { M: tier.material }, out: [key, 1] });
}));
const armor = [null, null, null, null];
const armorPoints = () => armor.reduce((n, s) => n + (s ? ITEMS[s.key].armor : 0), 0);
// Canlılardan gelen hasar (kaynağı olan) zırh puanına göre azalır; düşme, lav, açlık azalmaz.
// Her hasarda giyili parçaların dayanıklılığı 1 azalır, biten parça kırılır.
function armorReduce(amount, fromMob) {
  if (fromMob) amount = Math.max(1, Math.round(amount * (1 - armorPoints() * 0.04)));
  armor.forEach((s, i) => {
    if (!s) return;
    s.durability--;
    if (s.durability <= 0) { armor[i] = null; toast(ITEMS[s.key].name + ' kırıldı'); }
  });
  renderArmor();
  return amount;
}
// Zırh yalnızca kendi yuvasına konur.
function clickArmor(i, right) {
  if (held && ITEMS[held.key].armorSlot !== i) return;
  clickIn(armor, i, right);
}
const armorSlotEls = [...document.querySelectorAll('#armor-ui .inv-slot')];
armorSlotEls.forEach((el, i) => {
  el.addEventListener('mousedown', e => { e.preventDefault(); clickArmor(i, e.button === 2); });
  el.addEventListener('contextmenu', e => e.preventDefault());
});

// HUD: kalplerin üstünde 10 zırh simgesi (her biri 2 puan); zırh yokken gizli.
const ARMOR_SHAPE = ['##...##', '#######', '#######', '.#####.', '.#####.', '..###..'];
function armorIconImage(fill) { // 0 boş, 1 yarım, 2 dolu
  const c = document.createElement('canvas'); c.width = c.height = 9;
  const ag = c.getContext('2d');
  ARMOR_SHAPE.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '#') return;
    const lit = fill === 2 || (fill === 1 && x < 4);
    ag.fillStyle = lit ? (y === 1 && x < 3 ? '#ffffff' : '#c8c8c8') : '#3c3c3c';
    ag.fillRect(x + 1, y + 1, 1, 1);
  }));
  return c.toDataURL();
}
const ARMOR_IMAGES = [0, 1, 2].map(armorIconImage);
const armorBarEl = document.getElementById('armor-bar');
const armorIconEls = Array.from({ length: 10 }, () => armorBarEl.appendChild(document.createElement('i')));
function renderArmor() {
  const points = armorPoints();
  armorBarEl.style.visibility = points ? 'visible' : 'hidden';
  armorIconEls.forEach((el, i) => { el.style.backgroundImage = `url(${ARMOR_IMAGES[Math.max(0, Math.min(2, points - i * 2))]})`; });
  armorSlotEls.forEach((el, i) => paintSlot(el, armor[i]));
  updateArmorModel();
}

// Oyuncu modelinde parçalar: ilgili vücut kutusundan 1 piksel büyük renkli kutular.
// open: ön yüz açık (kaskta yüz görünsün). Yüz sırası +x, -x, +y, -y, +z (arka), -z (ön)
const armorBox = (parent, w, h, d, oy, open = false) => {
  const mat = new THREE.MeshLambertMaterial();
  const m = new THREE.Mesh(new THREE.BoxGeometry((w + 1) * P, (h + 1) * P, (d + 1) * P), open ? [mat, mat, mat, mat, mat, new THREE.MeshBasicMaterial({ visible: false })] : mat);
  m.userData.mat = mat;
  m.position.y = oy * P;
  m.visible = false;
  parent.add(m);
  return m;
};
const armorMeshes = [
  [armorBox(head, 8, 8, 8, 4, true)],
  [armorBox(model, 8, 12, 4, 18), armorBox(armR, 4, 12, 4, -4), armorBox(armL, 4, 12, 4, -4)],
  [armorBox(legR, 4, 9, 4, -4.5), armorBox(legL, 4, 9, 4, -4.5)],
  [armorBox(legR, 4.4, 3, 4.4, -10.5), armorBox(legL, 4.4, 3, 4.4, -10.5)],
];
function updateArmorModel() {
  armorMeshes.forEach((meshes, i) => meshes.forEach(m => {
    m.visible = !!armor[i];
    if (armor[i]) m.userData.mat.color.setHex(ITEMS[armor[i].key].color);
  }));
}
renderArmor();
Object.assign(window.game, { armor, clickArmor, armorPoints, armorMeshes, renderArmor });
