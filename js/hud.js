// ---------- HUD ----------
// Hotbar yuvaları, bildirim (toast) ve yuva seçimi.

const hotbar = document.getElementById('hotbar');
const blockName = document.getElementById('blockname');
const info = document.getElementById('info');
const HOTBAR_SIZE = 9;
for (let i = 0; i < HOTBAR_SIZE; i++) {
  const s = document.createElement('div');
  s.className = 'slot';
  s.innerHTML = `<span class="num">${i + 1}</span><span class="count"></span><span class="dur"></span>`;
  s.addEventListener('click', () => selectSlot(i));
  hotbar.appendChild(s);
}
let nameTimer;
function toast(text) {
  blockName.textContent = text;
  blockName.hidden = false;
  clearTimeout(nameTimer);
  nameTimer = setTimeout(() => { blockName.hidden = true; }, 1500);
}
function selectSlot(i) {
  selected = i;
  [...hotbar.children].forEach((s, j) => s.classList.toggle('active', j === i));
  if (inventory[i]) toast(ITEMS[inventory[i].key].name);
  updateHeldTool();
}
