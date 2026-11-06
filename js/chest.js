// ---------- Sandık ----------
// Sandık: 27 yuvalı depo, panel ve kırılınca saçılma.

const CHEST_SIZE = 27;
// Her sandık kendi yuvalarını tutar; anahtar fırınlarla aynı (dünya + konum). Kayda yazılır.
const chests = {};
let openChestKey = null;
const getChest = (x, y, z) => chests[furnaceKey(x, y, z)] ??= { dim: dimension, x, y, z, slots: new Array(CHEST_SIZE).fill(null) };
function openChest(x, y, z) {
  openInventory(2);
  openChestKey = furnaceKey(x, y, z);
  getChest(x, y, z);
  document.getElementById('inv-title').textContent = 'Sandık';
  document.getElementById('chest-ui').hidden = false;
  document.getElementById('craft-ui').hidden = true;
  renderChest();
}
function removeChest(x, y, z) {
  const c = chests[furnaceKey(x, y, z)];
  if (!c) return;
  for (const st of c.slots) if (st) for (let n = 0; n < st.count; n++) Object.assign(dropItem(st.key, x + 0.5, y + 0.5, z + 0.5), { extra: extraOf(st) });
  delete chests[furnaceKey(x, y, z)];
}
// Envanterle aynı tıklama kuralları
function clickChest(i, right) {
  const c = chests[openChestKey];
  if (c) clickIn(c.slots, i, right);
}
const chestSlotEls = [];
for (let i = 0; i < CHEST_SIZE; i++) {
  const el = document.createElement('div');
  el.className = 'inv-slot';
  el.innerHTML = '<span class="count"></span><span class="dur"></span>';
  el.addEventListener('mousedown', e => { e.preventDefault(); clickChest(i, e.button === 2); });
  el.addEventListener('contextmenu', e => e.preventDefault());
  document.getElementById('chest-grid').appendChild(el);
  chestSlotEls[i] = el;
}
function renderChest() {
  const c = chests[openChestKey];
  if (c) chestSlotEls.forEach((el, i) => paintSlot(el, c.slots[i]));
}
Object.assign(window.game, { chests, openChest, clickChest });
