// ---------- Kayıt ----------
// IndexedDB kaydı: kaydetme, yükleme, yeni dünya.

// Tarayıcının IndexedDB'sine tek bir kayıt yazılır. Açılamazsa oyun kayıtsız çalışır.
const DB_NAME = 'block-world', DB_STORE = 'saves', SAVE_KEY = 'world1', SAVE_VERSION = 2, AUTOSAVE_MS = 30000;
const playButton = document.getElementById('play');
const resetButton = document.getElementById('reset');
const saveNote = document.getElementById('save-note');
const savedEl = document.getElementById('saved');
let db = null, resetting = false, confirmReset = false, savedTimer;

function openDb() {
  const open = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  // Bazı ortamlarda istek hiç yanıt vermez; oyunu bekletme.
  return Promise.race([open, new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))]);
}
function readSave() {
  return new Promise((resolve, reject) => {
    const req = db.transaction(DB_STORE).objectStore(DB_STORE).get(SAVE_KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function saveGame() {
  if (!db || resetting) return;
  try {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put({
      version: SAVE_VERSION,
      world: worlds.overworld,
      nether: worlds.nether,
      dimension,
      portalLinks,
      player: { x: player.x, y: player.y, z: player.z, yaw: player.yaw, pitch: player.pitch },
      health: player.health,
      food: player.food,
      furnaces: Object.values(furnaces).map(f => ({ ...f, slots: f.slots.map(st => st && { ...st }) })),
      chests: Object.values(chests).map(c => ({ ...c, slots: c.slots.map(st => st && { ...st }) })),
      spawnPoint,
      safeMode,
      selected,
      inventory: inventory.map(s => s && { key: s.key, count: s.count, ...extraOf(s) }),
      armor: armor.map(s => s && { key: s.key, count: 1, ...extraOf(s) }),
      time: clock.time,
      day: clock.day,
    }, SAVE_KEY);
    tx.oncomplete = () => {
      savedEl.hidden = false;
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => { savedEl.hidden = true; }, 1000);
    };
  } catch (err) { /* kayıt yapılamazsa oyun sürer */ }
}
function applySave(save) {
  worlds.overworld.set(save.world);
  // Sürüm 1 kayıtlarında Nether yok: yeni üretilen Nether kalır
  if (save.nether?.length === worlds.nether.length) worlds.nether.set(save.nether);
  dimension = save.dimension === 'nether' ? 'nether' : 'overworld';
  world = worlds[dimension];
  Object.assign(portalLinks, save.portalLinks || {});
  for (let cz = 0; cz < SZ / CH; cz++) for (let cx = 0; cx < SX / CH; cx++) buildChunk(cx, cz);
  Object.assign(player, save.player, { vx: 0, vy: 0, vz: 0, kx: 0, kz: 0, fallPeak: null });
  player.health = save.health > 0 ? save.health : MAX_HEALTH;
  player.food = save.food ?? MAX_FOOD;
  for (const f of save.furnaces || []) furnaces[(f.dim || 'overworld') + ':' + f.x + ',' + f.y + ',' + f.z] = { dim: 'overworld', ...f };
  // Bilinmeyen eşya anahtarları (eski kayıt) atlanır.
  for (const c of save.chests || []) chests[c.dim + ':' + c.x + ',' + c.y + ',' + c.z] = { ...c, slots: c.slots.map(st => st && ITEMS[st.key] ? st : null) };
  spawnPoint = save.spawnPoint || null;
  setSafeMode(!!save.safeMode);
  scanCrops();
  rebuildPortalMeshes();
  renderHearts();
  renderFood();
  // Bilinmeyen eşya anahtarları (eski kayıt) atlanır.
  (save.inventory || []).forEach((s, i) => { inventory[i] = s && ITEMS[s.key] ? { key: s.key, count: s.count, ...extraOf(s) } : null; });
  (save.armor || []).forEach((s, i) => { armor[i] = s && ITEMS[s.key] ? { ...s } : null; });
  renderInventory();
  selectSlot(save.selected);
  clock.time = save.time;
  clock.day = save.day;
}
async function loadGame() {
  try {
    db = await openDb();
    const save = await readSave();
    const valid = save && (save.version === 1 || save.version === SAVE_VERSION) && save.world?.length === world.length;
    if (valid) applySave(save);
    saveNote.textContent = valid ? 'Kayıt yüklendi. Oyun otomatik kaydedilir.' : 'Oyun otomatik kaydedilir.';
  } catch (err) {
    db = null;
    saveNote.textContent = 'Kayıt yapılamıyor: bu tarayıcı veri saklamaya izin vermiyor.';
    resetButton.hidden = true;
  }
  // Canlılar kaydedilmez; dünya yüklendikten sonra yeniden doğar.
  if (dimension === 'overworld') spawnInitialAnimals();
  if (db) await loadSettings();
  applySettings();
  playButton.disabled = false;
  window.game.ready = true;
}

resetButton.addEventListener('click', () => {
  if (!confirmReset) {
    confirmReset = true;
    resetButton.textContent = 'Emin misin? Tekrar bas';
    return;
  }
  resetting = true;
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).delete(SAVE_KEY);
  tx.oncomplete = tx.onerror = () => location.reload();
});
setInterval(() => { if (playing) saveGame(); }, AUTOSAVE_MS);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
window.addEventListener('pagehide', saveGame);
Object.assign(window.game, { getBlock: get, setBlock: set, saveGame });
