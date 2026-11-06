// ---------- Fırın ----------
// Fırın: pişirme, yakıt ve panel.

// Her fırın kendi yuvalarını tutar: [girdi, yakıt, çıktı]. Panel kapalıyken de pişirir. Kayda yazılır.
const SMELT_TIME = 5;
const SMELTING = { raw_beef: 'cooked_beef', raw_pork: 'cooked_pork', raw_chicken: 'cooked_chicken', sand: 'glass', cobble: 'stone', log: 'charcoal', iron_ore: 'iron_ingot' };
// Yakıt: kaç eşya pişirir
const FUEL = { coal: 8, charcoal: 8, log: 1.5, planks: 1.5 };
const furnaces = {};
let openFurnaceKey = null;
// Fırınlar dünyaya göre ayrılır (ana dünya ve Nether aynı koordinatları kullanır)
const furnaceKey = (x, y, z) => dimension + ':' + x + ',' + y + ',' + z;
const getFurnace = (x, y, z) => furnaces[furnaceKey(x, y, z)] ??= { dim: dimension, x, y, z, slots: [null, null, null], burn: 0, burnMax: 0, progress: 0 };
function openFurnace(x, y, z) {
  openInventory(2);
  openFurnaceKey = furnaceKey(x, y, z);
  getFurnace(x, y, z);
  document.getElementById('inv-title').textContent = 'Fırın';
  document.getElementById('furnace-ui').hidden = false;
  document.getElementById('craft-ui').hidden = true;
  renderFurnace();
}
function removeFurnace(x, y, z) {
  const f = furnaces[furnaceKey(x, y, z)];
  if (!f) return;
  for (const st of f.slots) if (st) for (let n = 0; n < st.count; n++) dropItem(st.key, x + 0.5, y + 0.5, z + 0.5);
  delete furnaces[furnaceKey(x, y, z)];
}
// Girdi (0) ve yakıt (1) envanter gibi tıklanır; çıktıdan (2) yalnızca alınır.
function clickFurnace(i, right) {
  const f = furnaces[openFurnaceKey];
  if (!f) return;
  if (i < 2) return clickIn(f.slots, i, right);
  const out = f.slots[2];
  if (!out || (held && (held.key !== out.key || held.count + out.count > maxStack(out.key)))) return;
  held = held ? { ...held, count: held.count + out.count } : { ...out };
  f.slots[2] = null;
  renderInventory();
}
function updateFurnaces(dt) {
  for (const f of Object.values(furnaces)) {
    if ((f.dim || 'overworld') !== dimension) continue;
    const [input, fuel, output] = f.slots;
    const result = input && SMELTING[input.key];
    const canSmelt = result && (!output || (output.key === result && output.count < maxStack(result)));
    if (f.burn <= 0 && canSmelt && fuel && FUEL[fuel.key]) {
      f.burn = f.burnMax = FUEL[fuel.key] * SMELT_TIME;
      fuel.count--;
      if (!fuel.count) f.slots[1] = null;
    }
    if (f.burn > 0) {
      f.burn = Math.max(0, f.burn - dt);
      f.progress = canSmelt ? f.progress + dt : 0;
      if (f.progress >= SMELT_TIME) {
        f.progress = 0;
        input.count--;
        if (!input.count) f.slots[0] = null;
        f.slots[2] = output ? { ...output, count: output.count + 1 } : { key: result, count: 1 };
      }
    } else f.progress = 0;
    // Yanarken blok ışıklı dokuya geçer.
    const block = get(f.x, f.y, f.z);
    const want = f.burn > 0 ? B.furnace_lit : B.furnace;
    if (block !== B.furnace && block !== B.furnace_lit) { delete furnaces[furnaceKey(f.x, f.y, f.z)]; continue; }
    if (block !== want) { set(f.x, f.y, f.z, want); rebuildAround(f.x, f.z); }
  }
  if (openFurnaceKey) renderFurnace();
}
const furnaceEls = ['furnace-input', 'furnace-fuel', 'furnace-output'].map(id => document.getElementById(id));
furnaceEls.forEach((el, i) => {
  el.addEventListener('mousedown', e => { e.preventDefault(); clickFurnace(i, e.button === 2); });
  el.addEventListener('contextmenu', e => e.preventDefault());
});
function renderFurnace() {
  const f = furnaces[openFurnaceKey];
  if (!f) return;
  furnaceEls.forEach((el, i) => paintSlot(el, f.slots[i]));
  document.getElementById('furnace-progress').style.width = (f.progress / SMELT_TIME * 100) + '%';
  document.getElementById('furnace-flame').style.height = (f.burnMax ? f.burn / f.burnMax * 100 : 0) + '%';
}
