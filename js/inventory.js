// ---------- Envanter ----------
// Envanter: yuvalar, ekleme, panel ve yuva tıklamaları.

// 36 yuva: 0–8 hotbar, 9–35 çanta. Yuva: { key, count } ya da null.
const INVENTORY_SIZE = 36;
const inventory = new Array(INVENTORY_SIZE).fill(null);
// Alet ve dayanıklılığı olan eşyalar (çakmak) yığılmaz.
const maxStack = key => ITEMS[key].tool || ITEMS[key].durability ? 1 : 64;
let held = null; // envanter ekranında farenin tuttuğu yığın

// Önce aynı türdeki yuvalara, sonra ilk boş yuvaya koyar. Sığmayan adedi döndürür.
// extra: yığına eklenecek alanlar (ör. aletin dayanıklılığı)
function addItem(key, count, extra = {}) {
  for (let i = 0; i < INVENTORY_SIZE && count > 0; i++) {
    const s = inventory[i];
    if (s && s.key === key && s.count < maxStack(key)) {
      const n = Math.min(count, maxStack(key) - s.count);
      s.count += n; count -= n;
    }
  }
  for (let i = 0; i < INVENTORY_SIZE && count > 0; i++) {
    if (!inventory[i]) {
      const n = Math.min(count, maxStack(key));
      inventory[i] = { key, count: n, ...extra }; count -= n;
    }
  }
  renderInventory();
  return count;
}
function takeFromSlot(i, n) {
  const s = inventory[i];
  s.count -= n;
  if (s.count <= 0) inventory[i] = null;
  renderInventory();
}
// Q: seçili yığından birini bakılan yöne fırlatır; 1,5 sn geri toplanmaz.
function throwSelected() {
  const s = inventory[selected];
  if (!s) return;
  const d = dropItem(s.key, player.x + aim.d.x * 0.6, player.y + EYE - 0.3, player.z + aim.d.z * 0.6);
  d.extra = extraOf(s);
  d.vx = aim.d.x * 5; d.vy = aim.d.y * 5 + 2; d.vz = aim.d.z * 5;
  d.pickupDelay = 1.5;
  takeFromSlot(selected, 1);
}

const invEl = document.getElementById('inventory');
const heldEl = document.getElementById('held');
const invSlotEls = [];
for (let i = 0; i < INVENTORY_SIZE; i++) {
  const el = document.createElement('div');
  el.className = 'inv-slot';
  el.innerHTML = '<span class="count"></span><span class="dur"></span>';
  el.addEventListener('mousedown', e => { e.preventDefault(); clickSlot(i, e.button === 2); });
  el.addEventListener('contextmenu', e => e.preventDefault());
  document.getElementById(i < HOTBAR_SIZE ? 'inv-hotbar' : 'inv-bag').appendChild(el);
  invSlotEls[i] = el;
}
document.addEventListener('mousemove', e => { heldEl.style.left = e.clientX + 'px'; heldEl.style.top = e.clientY + 'px'; });
