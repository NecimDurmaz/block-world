// ---------- Envanter paneli ----------
// Yuva çizimi, yuvaya tıklama (al, bırak, birleştir, böl), panelin açılıp kapanması.

const paintSlot = (el, s) => {
  el.style.backgroundImage = s ? `url(${itemIcon(s.key)})` : 'none';
  el.querySelector('.count').textContent = s && s.count > 1 ? s.count : '';
  el.dataset.name = s ? ITEMS[s.key].name : '';
  // Aşınmış aletin dayanıklılık çubuğu: yeşilden kırmızıya
  const bar = el.querySelector('.dur'), max = s && ITEMS[s.key].durability;
  const worn = max && s.durability < max;
  bar.style.display = worn ? 'block' : 'none';
  if (worn) bar.innerHTML = `<i style="width:${s.durability / max * 100}%;background:hsl(${s.durability / max * 120},80%,45%)"></i>`;
};
function renderInventory() {
  for (let i = 0; i < HOTBAR_SIZE; i++) paintSlot(hotbar.children[i], inventory[i]);
  for (let i = 0; i < INVENTORY_SIZE; i++) paintSlot(invSlotEls[i], inventory[i]);
  for (let i = 0; i < 9; i++) paintSlot(craftSlotEls[i], craftGrid[i]);
  const result = craftResult();
  paintSlot(resultEl, result);
  if (result) resultEl.querySelector('.count').textContent = result.count > 1 ? result.count : '';
  renderFurnace();
  updateHeldTool();
  paintSlot(heldEl, held);
  heldEl.hidden = !held;
}
// Sol tık: yığını al / bırak / aynı türse birleştir / farklıysa değiştir. Sağ tık: yarısını al ya da bir tane bırak.
// slots: envanter ya da üretim ızgarası dizisi.
function clickIn(slots, i, right) {
  const s = slots[i];
  if (!held) {
    if (!s) return;
    const n = right ? Math.ceil(s.count / 2) : s.count;
    held = { ...s, count: n };
    s.count -= n;
    if (!s.count) slots[i] = null;
  } else if (!s || s.key === held.key) {
    const n = Math.min(right ? 1 : held.count, maxStack(held.key) - (s ? s.count : 0));
    if (n <= 0) return;
    slots[i] = { ...held, count: (s ? s.count : 0) + n };
    held.count -= n;
    if (!held.count) held = null;
  } else if (!right) {
    slots[i] = held;
    held = s;
  }
  renderInventory();
}
const clickSlot = (i, right) => clickIn(inventory, i, right);
// size: 2 envanterde, 3 çalışma masasında
function openInventory(size = 2) {
  craftSize = size;
  openFurnaceKey = null;
  document.getElementById('furnace-ui').hidden = true;
  document.getElementById('craft-ui').hidden = false;
  document.getElementById('inv-title').textContent = size === 3 ? 'Çalışma masası' : 'Envanter';
  document.getElementById('craft-grid').classList.toggle('small', size === 2);
  craftSlotEls.forEach((el, i) => { el.hidden = i % 3 >= size || i >= size * 3; });
  inventoryOpen = true;
  for (const k in keys) keys[k] = false;
  invEl.hidden = false;
  renderInventory();
  if (document.pointerLockElement) document.exitPointerLock();
}
// Envantere sığmayanı oyuncunun önüne atar.
function giveOrDrop(stack) {
  const left = addItem(stack.key, stack.count, extraOf(stack));
  for (let n = 0; n < left; n++) Object.assign(dropItem(stack.key, player.x, player.y + 1, player.z), { pickupDelay: 1.5, extra: extraOf(stack) });
}
function closeInventory() {
  if (held) { giveOrDrop(held); held = null; }
  // Izgarada kalanlar envantere döner.
  for (let i = 0; i < 9; i++) if (craftGrid[i]) { giveOrDrop(craftGrid[i]); craftGrid[i] = null; }
  inventoryOpen = false;
  openFurnaceKey = null;
  invEl.hidden = true;
  tooltipEl.hidden = true;
  renderInventory();
  if (!fallbackLook) {
    try { canvas.requestPointerLock()?.catch?.(useFallback); } catch (err) { useFallback(); }
  }
}

// Minecraft gibi: fare dolu bir yuvanın üstündeyken eşyanın adı imlecin yanında görünür (elde eşya yokken).
const tooltipEl = document.getElementById('tooltip');
document.addEventListener('mousemove', e => {
  const slot = e.target.closest?.('.inv-slot, .slot');
  const name = slot?.dataset.name;
  tooltipEl.hidden = !name || !!held;
  if (tooltipEl.hidden) return;
  tooltipEl.textContent = name;
  tooltipEl.style.left = e.clientX + 14 + 'px';
  tooltipEl.style.top = e.clientY - 28 + 'px';
});
