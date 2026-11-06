// ---------- Tarif kitabı ----------
// Envanter panelinin solunda açılan kitap: üretilebilen bütün eşyalar ve fırında pişenler. Bir eşyaya tıklayınca tarifi
// 3×3 ızgarada gösterilir; malzemeler yetiyorsa "Izgaraya yerleştir" malzemeleri üretim ızgarasına dizer.

const bookEl = document.getElementById('recipe-book');
const bookGrid = document.getElementById('book-grid');
const bookSearch = document.getElementById('book-search');
const bookPatternEls = [], bookOutEl = document.getElementById('book-out');
let bookOpen = false, bookTab = 'craft', bookKey = null, bookVariant = 0;
for (let i = 0; i < 9; i++) {
  const el = document.createElement('div');
  el.className = 'inv-slot';
  el.innerHTML = '<span class="count"></span><span class="dur"></span>';
  document.getElementById('book-pattern').appendChild(el);
  bookPatternEls.push(el);
}
// Sekmeye göre listelenen eşyalar: üretimde tariflerin çıktıları (tekrarsız), fırında pişen ürünler
const craftOutputs = () => [...new Set(RECIPES.map(r => r.out[0]))];
const smeltOutputs = () => [...new Set(Object.values(SMELTING))];
const recipesFor = key => RECIPES.filter(r => r.out[0] === key);
const smeltInputsFor = key => Object.keys(SMELTING).filter(k => SMELTING[k] === key);

function renderBookList() {
  const wanted = normalize(bookSearch.value);
  bookGrid.innerHTML = '';
  for (const key of bookTab === 'craft' ? craftOutputs() : smeltOutputs()) {
    if (wanted && !normalize(ITEMS[key].name).includes(wanted)) continue;
    const el = document.createElement('div');
    el.className = 'inv-slot' + (key === bookKey ? ' selected' : '');
    el.innerHTML = '<span class="count"></span><span class="dur"></span>';
    paintSlot(el, { key, count: 1 });
    el.addEventListener('mousedown', e => { e.preventDefault(); selectRecipe(key); });
    bookGrid.appendChild(el);
  }
}
function selectRecipe(key) {
  if (bookKey !== key) bookVariant = 0;
  bookKey = key;
  renderBookList();
  renderBookDetail();
}
// Tarifin malzemeleri: anahtar -> adet
function ingredients(recipe) {
  const need = {};
  for (const row of recipe.pattern) for (const ch of row) if (ch !== '.') need[recipe.keys[ch]] = (need[recipe.keys[ch]] || 0) + 1;
  return need;
}
// Izgaraya dizilemiyorsa nedeni, dizilebiliyorsa null
function fillProblem(recipe) {
  const size = Math.max(recipe.pattern.length, recipe.pattern[0].length);
  if (size > craftSize) return '3×3 tarif: çalışma masasında yap';
  // Izgaradakiler envantere döneceği için onlar da sayılır
  const have = key => countItem(key) + craftGrid.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
  const missing = Object.entries(ingredients(recipe)).filter(([key, n]) => have(key) < n);
  return missing.length ? 'Eksik: ' + missing.map(([key, n]) => `${n - have(key)} × ${ITEMS[key].name}`).join(', ') : null;
}
function renderBookDetail() {
  const detail = document.getElementById('book-detail');
  detail.hidden = !bookKey;
  if (!bookKey) return;
  document.getElementById('book-name').textContent = ITEMS[bookKey].name;
  const fill = document.getElementById('book-fill'), next = document.getElementById('book-next'), note = document.getElementById('book-note');
  bookPatternEls.forEach(el => { paintSlot(el, null); el.hidden = false; });
  if (bookTab === 'smelt') {
    // Fırın: ortadaki yuvada girdi
    const inputs = smeltInputsFor(bookKey);
    bookVariant %= inputs.length;
    bookPatternEls.forEach((el, i) => { el.hidden = i !== 4; });
    paintSlot(bookPatternEls[4], { key: inputs[bookVariant], count: 1 });
    paintSlot(bookOutEl, { key: bookKey, count: 1 });
    note.textContent = 'Fırında pişir. Yakıt: kömür, odun kömürü, kütük ya da tahta.';
    fill.hidden = true;
    next.hidden = inputs.length < 2;
    return;
  }
  const recipes = recipesFor(bookKey);
  bookVariant %= recipes.length;
  const recipe = recipes[bookVariant];
  recipe.pattern.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') paintSlot(bookPatternEls[r * 3 + c], { key: recipe.keys[ch], count: 1 }); }));
  paintSlot(bookOutEl, { key: recipe.out[0], count: recipe.out[1] });
  const fits2 = recipe.pattern.length <= 2 && recipe.pattern[0].length <= 2;
  const problem = fillProblem(recipe);
  note.textContent = (fits2 ? 'Envanterin 2×2 ızgarasına sığar.' : 'Çalışma masası (3×3) gerekir.') + (problem ? ' ' + problem + '.' : '');
  fill.hidden = false;
  fill.classList.toggle('poor', !!problem);
  next.hidden = recipes.length < 2;
}
// Izgaradakileri envantere geri koyar, tarifin malzemelerini envanterden alıp ızgaranın sol üstüne dizer.
function fillRecipe() {
  if (bookTab !== 'craft' || !bookKey) return false;
  const recipe = recipesFor(bookKey)[bookVariant];
  const problem = fillProblem(recipe);
  if (problem) { toast(problem); return false; }
  for (let i = 0; i < 9; i++) if (craftGrid[i]) { giveOrDrop(craftGrid[i]); craftGrid[i] = null; }
  recipe.pattern.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '.') return;
    removeItems(recipe.keys[ch], 1);
    craftGrid[r * 3 + c] = { key: recipe.keys[ch], count: 1 };
  }));
  renderInventory();
  return true;
}
function setBookOpen(on) {
  bookOpen = on;
  bookEl.hidden = !on;
  document.getElementById('book-toggle').classList.toggle('on', on);
  if (on) { renderBookList(); renderBookDetail(); }
}
document.getElementById('book-toggle').addEventListener('click', () => setBookOpen(!bookOpen));
document.querySelectorAll('#recipe-book [data-tab]').forEach(b => b.addEventListener('click', () => {
  bookTab = b.dataset.tab;
  bookKey = null;
  document.querySelectorAll('#recipe-book [data-tab]').forEach(t => t.classList.toggle('on', t === b));
  renderBookList(); renderBookDetail();
}));
document.getElementById('book-fill').addEventListener('click', fillRecipe);
document.getElementById('book-next').addEventListener('click', () => { bookVariant++; renderBookDetail(); });
bookSearch.addEventListener('input', renderBookList);
bookSearch.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') closeInventory(); });
bookSearch.addEventListener('keyup', e => e.stopPropagation());
Object.assign(window.game, { setBookOpen, selectRecipe, fillRecipe, bookItems: () => [...bookGrid.children].map(el => el.dataset.name), setBookTab: tab => document.querySelector(`#recipe-book [data-tab="${tab}"]`).click() });
