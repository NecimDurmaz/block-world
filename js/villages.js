// ---------- Köylüler ----------
// Köylü canlısı, gündüz köyde dolaşma ve gece eve dönme, ticaret paneli. Köylerin kendisi structures.js'te üretilir.

ITEMS.emerald = { name: 'Zümrüt', canvas: pixelArt(['...gg...', '..gllg..', '.gllggg.', 'glggggdg', '.gggggd.', '..gggd..', '...gd...', '........'], { g: '#2fb85a', l: '#9dfabc', d: '#167a36' }) };
// Teklif tablosu: her köylü bunlardan rastgele (köy ve ev numarasından belirlenen) 3 tanesini sunar.
const TRADES = [
  { cost: ['wheat', 20], out: ['emerald', 1] },
  { cost: ['coal', 15], out: ['emerald', 1] },
  { cost: ['emerald', 1], out: ['bread', 3] },
  { cost: ['emerald', 1], out: ['arrow', 8] },
  { cost: ['emerald', 3], out: ['iron_pickaxe', 1] },
  { cost: ['emerald', 5], out: ['iron_chestplate', 1] },
];
// Kahverengi cüppe, büyük burun
const VILLAGER_SKIN = { skin: '#b5876a', hair: '#5a3e28', shirt: '#6b4a2b', pants: '#5c3f24', shoe: '#3e2a18', eye: '#ffffff', iris: '#2f7a3a', mouth: '#7a5040' };
function buildVillager() {
  const { root, head, legR, legL } = buildHumanoid(VILLAGER_SKIN);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(2 * P, 4 * P, 2 * P), new THREE.MeshLambertMaterial({ color: 0xa47a5e }));
  nose.position.set(0, 2.5 * P, -5 * P);
  head.add(nose);
  return { root, legs: [legR, legL] };
}
MOB_TYPES.villager = { name: 'Köylü', health: 20, w: 0.3, h: 1.9, speed: 1.0, villager: true, build: buildVillager };

// Köy yakına gelince (64 blok) her eve bir köylü doğar; oturum boyunca bir kez (canlılar kaydedilmez).
const VILLAGE_SPAWN_RANGE = 64;
const spawnedVillages = new Set();
let villageTimer = 0;
function updateVillages(dt) {
  villageTimer -= dt;
  if (villageTimer > 0 || dimension !== 'overworld') return;
  villageTimer = 2;
  const plan = villageNear(player.x, player.z, 1);
  if (!plan || spawnedVillages.has(plan.id) || Math.hypot(plan.x - player.x, plan.z - player.z) > VILLAGE_SPAWN_RANGE) return;
  if (!plan.houses.every(h => inBounds(h.x, h.y, h.z))) return;
  spawnedVillages.add(plan.id);
  plan.houses.forEach((h, i) => {
    const m = spawnMob('villager', h.x + 0.5, h.y + 1, h.z + 0.5);
    const rnd = mulberry32(Math.floor(hash(plan.x + i * 13, plan.z - i * 7) * 4294967296));
    Object.assign(m, { village: plan, home: h, offers: TRADES.map((_, k) => k).sort(() => rnd() - 0.5).slice(0, 3) });
  });
}
// Köylü yönlendirmesi: gece önce kapının önüne, sonra evin ortasına yürür; gündüz köy merkezinden 14 bloktan uzaklaşmaz.
// Yön verdiyse true (dolaşma atlanır).
function steerVillager(m, day) {
  const walkTo = (x, z, near) => {
    const dx = x - m.x, dz = z - m.z;
    m.walking = Math.hypot(dx, dz) > near;
    m.yaw = Math.atan2(-dx, -dz);
  };
  const h = m.home;
  if (!day) {
    // Kapının önüne varınca (goingIn) içeri, evin ortasına
    const doorX = h.x + 0.5 + h.door[0] * 3, doorZ = h.z + 0.5 + h.door[1] * 3;
    if (Math.hypot(doorX - m.x, doorZ - m.z) < 0.7) m.goingIn = true;
    if (m.goingIn) walkTo(h.x + 0.5, h.z + 0.5, 0.6); else walkTo(doorX, doorZ, 0.3);
    return true;
  }
  m.goingIn = false;
  if (Math.hypot(m.village.x - m.x, m.village.z - m.z) > 14) { walkTo(m.village.x + 0.5, m.village.z + 0.5, 1); return true; }
  return false;
}
// Zombinin 16 blok içindeki en yakın köylüsü
function villagerTarget(m) {
  let best = null, bestDist = CHASE_DISTANCE;
  for (const v of mobs) {
    if (v.kind !== 'villager' || v.dying > 0) continue;
    const d = Math.hypot(v.x - m.x, v.z - m.z);
    if (d < bestDist) { best = v; bestDist = d; }
  }
  return best;
}

// Ticaret paneli: envanter panelinde, üretim bölümü yerine 3 teklif satırı.
const tradeList = document.getElementById('trade-list');
let tradingWith = null;
const countItem = key => inventory.reduce((n, s) => n + (s && s.key === key ? s.count : 0), 0);
function removeItems(key, count) {
  for (let i = 0; i < INVENTORY_SIZE && count > 0; i++) {
    const s = inventory[i];
    if (!s || s.key !== key) continue;
    const n = Math.min(count, s.count);
    s.count -= n; count -= n;
    if (!s.count) inventory[i] = null;
  }
}
// Sağ tık bir köylüye denk geliyorsa ticaret paneli açılır.
function tryOpenTrade() {
  const target = rayMob(), hit = raycast();
  if (!target || target.mob.kind !== 'villager' || (hit && hit.t < target.t)) return false;
  openTrade(target.mob);
  return true;
}
function openTrade(m) {
  // Köysüz (çağrılmış) köylünün teklifleri ilk açılışta rastgele seçilir
  m.offers ??= TRADES.map((_, k) => k).sort(() => Math.random() - 0.5).slice(0, 3);
  openInventory(2);
  tradingWith = m;
  document.getElementById('inv-title').textContent = 'Köylü';
  document.getElementById('craft-ui').hidden = true;
  document.getElementById('trade-ui').hidden = false;
  document.getElementById('book-toggle').hidden = true;
  bookEl.hidden = true;
  tradeList.innerHTML = '';
  m.offers.forEach(k => {
    const { cost, out } = TRADES[k];
    const row = document.createElement('div');
    row.className = 'trade-row';
    row.innerHTML = '<div class="inv-slot"><span class="count"></span><span class="dur"></span></div><span class="craft-arrow">→</span><div class="inv-slot"><span class="count"></span><span class="dur"></span></div><button class="mc-btn" type="button">Takas et</button>';
    const [costEl, outEl] = row.querySelectorAll('.inv-slot');
    paintSlot(costEl, { key: cost[0], count: cost[1] });
    paintSlot(outEl, { key: out[0], count: out[1] });
    row.querySelector('button').addEventListener('click', () => trade(k));
    tradeList.appendChild(row);
  });
  renderTrade();
}
function trade(k) {
  const { cost, out } = TRADES[k];
  if (countItem(cost[0]) < cost[1]) return toast('Yeterli ' + ITEMS[cost[0]].name + ' yok');
  removeItems(cost[0], cost[1]);
  const extra = ITEMS[out[0]].durability ? { durability: ITEMS[out[0]].durability } : {};
  for (let n = out[1]; n > 0;) { const c = Math.min(n, maxStack(out[0])); giveOrDrop({ key: out[0], count: c, ...extra }); n -= c; }
  toast(out[1] + ' × ' + ITEMS[out[0]].name + ' aldın');
  renderInventory();
}
// Malzemesi yetmeyen teklifin düğmesi soluk görünür.
function renderTrade() {
  if (!tradingWith) return;
  [...tradeList.children].forEach((row, i) => row.classList.toggle('poor', countItem(TRADES[tradingWith.offers[i]].cost[0]) < TRADES[tradingWith.offers[i]].cost[1]));
}
Object.assign(window.game, { trades: TRADES, openTrade, trade, tryOpenTrade, villagerTarget });
