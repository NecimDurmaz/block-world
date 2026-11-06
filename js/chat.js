// ---------- Sohbet ve komutlar ----------
// T sohbeti, "/" sohbeti "/" ile açar; Enter gönderir, Esc kapatır. "/" ile başlayan yazılar komuttur.
// Sohbet açıkken dünya durmaz ama oyuncu hareket etmez ve dünyaya tıklanamaz.

const CHAT_FADE = 10000, CHAT_MAX_LINES = 50;
const chatEl = document.getElementById('chat');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
// safeMode: güvenli mod (/safe), canavarlar saldırmaz; kayda yazılır.
let chatOpen = false, godMode = false, safeMode = false;

// kind: '' oyuncu mesajı, 'info' sistem (sarı), 'error' hata (kırmızı)
function chatLine(text, kind = '') {
  const line = document.createElement('div');
  line.className = 'chat-line ' + kind;
  line.textContent = text;
  chatLog.appendChild(line);
  while (chatLog.children.length > CHAT_MAX_LINES) chatLog.firstChild.remove();
  setTimeout(() => line.classList.add('faded'), CHAT_FADE);
}
function openChat(prefill = '') {
  chatOpen = true;
  for (const k in keys) keys[k] = false;
  mining = false;
  chatEl.classList.add('open');
  chatInput.hidden = false;
  chatInput.value = prefill;
  chatInput.focus();
  if (document.pointerLockElement) document.exitPointerLock();
}
function closeChat() {
  chatOpen = false;
  chatEl.classList.remove('open');
  chatInput.hidden = true;
  chatInput.blur();
  if (!fallbackLook && playing && !inventoryOpen) {
    try { canvas.requestPointerLock()?.catch?.(useFallback); } catch (err) { useFallback(); }
  }
}
chatInput.addEventListener('keydown', e => {
  e.stopPropagation(); // oyun tuşları sohbet yazarken çalışmasın
  if (e.key === 'Enter') {
    // Önce komut çalışır: bir panel açtıysa sohbet kapanırken fare kilitlenmez.
    const text = chatInput.value.trim();
    if (text) submitChat(text);
    closeChat();
  } else if (e.key === 'Escape') closeChat();
});
chatInput.addEventListener('keyup', e => e.stopPropagation());

// Eşya ya da canlıyı İngilizce anahtarla ya da Türkçe adla bulur ("taş_kazma", "Taş kazma", "stone_pickaxe").
const normalize = text => text.toLocaleLowerCase('tr').replace(/_/g, ' ').trim();
function findItem(name) {
  const wanted = normalize(name);
  return Object.keys(ITEMS).find(key => !ITEMS[key].hidden && !BLOCKS[ITEMS[key].block]?.hidden &&
    (normalize(key) === wanted || normalize(ITEMS[key].name) === wanted));
}
const findMob = name => Object.keys(MOB_TYPES).find(kind => normalize(kind) === normalize(name) || normalize(MOB_TYPES[kind].name) === normalize(name));
// "~" göreli koordinat: "~", "~3", "~-2"
const coordinate = (text, current) => text.startsWith('~') ? current + (Number(text.slice(1)) || 0) : Number(text);

const COMMANDS = {
  help: { usage: '/help', about: 'Komutları listeler', run: () => {
    for (const cmd of Object.values(COMMANDS)) chatLine(`${cmd.usage} — ${cmd.about}`, 'info');
  } },
  give: { usage: '/give [eşya] [adet]', about: 'Envanterine eşya verir; adsız yazılırsa eşya panelini açar', run: args => {
    if (!args.length) return openPicker();
    const last = args[args.length - 1], hasCount = /^\d+$/.test(last) && args.length > 1;
    const count = hasCount ? Math.min(64 * INVENTORY_SIZE, Number(last)) : 1;
    const key = findItem((hasCount ? args.slice(0, -1) : args).join(' '));
    if (!key) return chatLine(`Böyle bir eşya yok: ${args.join(' ')}`, 'error');
    if (count < 1) return chatLine('Adet en az 1 olmalı', 'error');
    const extra = ITEMS[key].durability ? { durability: ITEMS[key].durability } : {};
    let left = count;
    // Yığılmayan eşyalar (alet) tek tek eklenir
    while (left > 0) {
      const n = Math.min(left, maxStack(key));
      if (addItem(key, n, extra) > 0) { chatLine('Envanter dolu', 'error'); break; }
      left -= n;
    }
    chatLine(`Sana ${count - Math.max(0, left)} × ${ITEMS[key].name} verildi`, 'info');
  } },
  god: { usage: '/god', about: 'Ölümsüzlük: hasar ve açlık yok (aç/kapat)', run: () => {
    godMode = !godMode;
    chatLine(godMode ? 'Ölümsüzlük açık' : 'Ölümsüzlük kapalı', 'info');
  } },
  safe: { usage: '/safe on|off', about: 'Güvenli mod: canavarlar dolaşır ama saldırmaz', run: args => {
    const value = normalize(args.join(' '));
    if (value === 'on' || value === 'aç') setSafeMode(true);
    else if (value === 'off' || value === 'kapat') setSafeMode(false);
    else if (value) return chatLine('Kullanım: /safe on | off', 'error');
    chatLine(safeMode ? 'Güvenli mod açık: canavarlar saldırmaz' : 'Güvenli mod kapalı', 'info');
  } },
  heal: { usage: '/heal', about: 'Canı doldurur', run: () => {
    player.health = MAX_HEALTH;
    renderHearts();
    chatLine('Canın doldu', 'info');
  } },
  feed: { usage: '/feed', about: 'Açlığı doldurur', run: () => {
    player.food = MAX_FOOD;
    renderFood();
    chatLine('Karnın doydu', 'info');
  } },
  time: { usage: '/time set <day|noon|night|midnight|saat>', about: 'Saati değiştirir', run: args => {
    const named = { day: 0.02, noon: 0.25, night: 0.6, midnight: 0.75, gündüz: 0.02, öğle: 0.25, gece: 0.6, 'gece yarısı': 0.75 };
    const value = normalize(args.slice(1).join(' '));
    const hour = Number(value);
    if (args[0] !== 'set' || (!(value in named) && !(value !== '' && hour >= 0 && hour < 24))) return chatLine('Kullanım: /time set day | noon | night | midnight | 0–23', 'error');
    clock.time = value in named ? named[value] : ((hour - 6 + 24) % 24) / 24;
    chatLine(`Saat ${clockText().split(' · ')[1]} oldu`, 'info');
  } },
  tp: { usage: '/tp <x> <y> <z>', about: 'Işınlar (~ ile göreli)', run: args => {
    const [x, y, z] = [coordinate(args[0] ?? '', player.x), coordinate(args[1] ?? '', player.y), coordinate(args[2] ?? '', player.z)];
    if (args.length !== 3 || [x, y, z].some(Number.isNaN)) return chatLine('Kullanım: /tp <x> <y> <z>', 'error');
    Object.assign(player, { x: Math.min(SX - 0.5, Math.max(0.5, x)), y: Math.min(SY + 10, Math.max(1, y)), z: Math.min(SZ - 0.5, Math.max(0.5, z)), vx: 0, vy: 0, vz: 0, fallPeak: null });
    chatLine(`Işınlandın: ${player.x.toFixed(1)} ${player.y.toFixed(1)} ${player.z.toFixed(1)}`, 'info');
  } },
  clear: { usage: '/clear', about: 'Envanteri boşaltır', run: () => {
    inventory.fill(null);
    renderInventory();
    chatLine('Envanter boşaltıldı', 'info');
  } },
  summon: { usage: '/summon <canlı>', about: 'Önüne bir canlı çağırır', run: args => {
    const kind = findMob(args.join(' '));
    if (!kind) return chatLine(`Böyle bir canlı yok. Seçenekler: ${Object.values(MOB_TYPES).map(t => t.name).join(', ')}`, 'error');
    spawnMob(kind, player.x - Math.sin(player.yaw) * 3, player.y + 0.5, player.z - Math.cos(player.yaw) * 3);
    chatLine(`${MOB_TYPES[kind].name} çağrıldı`, 'info');
  } },
  spawnpoint: { usage: '/spawnpoint', about: 'Doğma noktasını buraya taşır', run: () => {
    spawnPoint = { x: player.x, y: player.y, z: player.z };
    chatLine('Doğma noktası buraya taşındı', 'info');
  } },
};
function setSafeMode(on) {
  safeMode = on;
  document.getElementById('safe-note').hidden = !on;
}
function submitChat(text) {
  if (!text.startsWith('/')) { chatLine(`<Oyuncu> ${text}`); return; }
  const [name, ...args] = text.slice(1).split(/\s+/);
  const command = COMMANDS[name.toLocaleLowerCase('tr')];
  if (!command) { chatLine(`Bilinmeyen komut: /${name}. Komutlar için /help yaz.`, 'error'); return; }
  command.run(args);
}

Object.assign(window.game, { openChat, closeChat, submitChat, isGod: () => godMode, isSafe: () => safeMode, chatLines: () => [...chatLog.children].map(l => l.textContent) });
