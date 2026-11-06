// ---------- Eşya seçici ----------
// "/give" adsız yazılınca açılan, aranabilir bütün eşyalar paneli. Envanter panelinin içinde, üretim bölümü yerine görünür.

const pickerGrid = document.getElementById('picker-grid');
const pickerSearch = document.getElementById('picker-search');
const pickerSlots = {}; // eşya anahtarı -> yuva
// Yuvalar ilk açılışta kurulur (bütün eşyalar tanımlandıktan sonra).
function buildPicker() {
  for (const key of Object.keys(ITEMS)) {
    if (ITEMS[key].hidden || BLOCKS[ITEMS[key].block]?.hidden) continue;
    const el = document.createElement('div');
    el.className = 'inv-slot';
    el.innerHTML = '<span class="count"></span><span class="dur"></span>';
    paintSlot(el, { key, count: 1 });
    el.addEventListener('mousedown', e => { e.preventDefault(); clickPicker(key, e.button === 2); });
    el.addEventListener('contextmenu', e => e.preventDefault());
    pickerGrid.appendChild(el);
    pickerSlots[key] = el;
  }
}
function openPicker() {
  if (!pickerGrid.children.length) buildPicker();
  openInventory(2);
  document.getElementById('inv-title').textContent = 'Eşyalar';
  document.getElementById('craft-ui').hidden = true;
  document.getElementById('picker-ui').hidden = false;
  document.getElementById('book-toggle').hidden = true;
  bookEl.hidden = true;
  pickerSearch.value = '';
  filterPicker();
  pickerSearch.focus();
}
// Türkçe ada ya da İngilizce anahtara göre süzer.
function filterPicker() {
  const wanted = normalize(pickerSearch.value);
  for (const [key, el] of Object.entries(pickerSlots)) el.hidden = !!wanted && !normalize(ITEMS[key].name).includes(wanted) && !normalize(key).includes(wanted);
}
// Sol tık: bir yığın (alette bir tane), sağ tık: bir tane envantere.
function clickPicker(key, right) {
  const extra = ITEMS[key].durability ? { durability: ITEMS[key].durability } : {};
  if (addItem(key, right ? 1 : maxStack(key), extra) > 0) toast('Envanter dolu');
}
pickerSearch.addEventListener('input', filterPicker);
pickerSearch.addEventListener('keydown', e => {
  e.stopPropagation(); // E gibi oyun tuşları aramaya yazılsın
  if (e.key === 'Escape') closeInventory();
});
pickerSearch.addEventListener('keyup', e => e.stopPropagation());
Object.assign(window.game, { openPicker, clickPicker, pickerItems: () => Object.keys(pickerSlots).filter(k => !pickerSlots[k].hidden) });
