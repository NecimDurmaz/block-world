// ---------- Portal ----------
// Obsidyen çerçeve çakmakla yakılınca içi mor portal olur. Portal blokları chunk mesh'inde değil, buradaki
// kayan dokulu düzlemlerle çizilir. İçinde 3 sn duran oyuncu diğer dünyaya geçer (travelThroughPortal, nether.js).

const PORTAL_TIME = 3;
const portalTexture = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const pg = c.getContext('2d'), pr = mulberry32(31);
  for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
    // Dikey dalgalı şeritler: kaydıkça girdap gibi görünür
    const wave = Math.sin((x + Math.sin(y / 5) * 4) / 3) * 0.5 + 0.5;
    const v = 0.55 + wave * 0.35 + pr() * 0.1;
    pg.fillStyle = `rgb(${Math.round(120 * v)}, ${Math.round(40 * v)}, ${Math.round(220 * v)})`;
    pg.fillRect(x, y, 1, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
})();
const portalMaterial = new THREE.MeshBasicMaterial({ map: portalTexture, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });
const portalGeometry = new THREE.PlaneGeometry(1, 1);
const portalMeshes = [];

// Dünyadaki bütün portal blokları için düzlemleri yeniden kurar (yakınca, sönünce, dünya değişince).
function rebuildPortalMeshes() {
  for (const m of portalMeshes) scene.remove(m);
  portalMeshes.length = 0;
  for (let y = 0; y < SY; y++) for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    const b = world[index(x, y, z)];
    if (!isPortal(b)) continue;
    const mesh = new THREE.Mesh(portalGeometry, portalMaterial);
    mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
    if (b === B.portal_z) mesh.rotation.y = Math.PI / 2;
    mesh.renderOrder = 2;
    scene.add(mesh);
    portalMeshes.push(mesh);
  }
}

// İç boşluğu tam 2x3 olan dikey çerçeve: (x, y, z) iç tabandaki iki hücreden biri. Köşeler isteğe bağlı.
// Geçerliyse iç hücreleri döndürür.
function portalInterior(x, y, z, axis) {
  for (const shift of [0, -1]) {
    const cell = (i, dy) => axis === 'x' ? [x + shift + i, y + dy, z] : [x, y + dy, z + shift + i];
    const is = (pos, block) => get(...pos) === block;
    const interior = [];
    for (let i = 0; i < 2; i++) for (let dy = 0; dy < 3; dy++) interior.push(cell(i, dy));
    const frame = [cell(0, -1), cell(1, -1), cell(0, 3), cell(1, 3)];
    for (let dy = 0; dy < 3; dy++) frame.push(cell(-1, dy), cell(2, dy));
    if (interior.every(pos => is(pos, AIR)) && frame.every(pos => is(pos, B.obsidian))) return interior;
  }
  return null;
}
// Çakmakla obsidyen çerçevenin iç tabanına tıklanınca; yandıysa true
function tryLightPortal(x, y, z) {
  for (const axis of ['x', 'z']) {
    const interior = portalInterior(x, y, z, axis);
    if (!interior) continue;
    for (const pos of interior) set(...pos, axis === 'x' ? B.portal_x : B.portal_z);
    rebuildAround(x, z);
    rebuildPortalMeshes();
    return true;
  }
  return false;
}
// Bitişikteki portal bloklarından başlayıp bağlı bütün portalı söndürür.
function extinguishPortalNear(x, y, z) {
  const stack = [[x + 1, y, z], [x - 1, y, z], [x, y + 1, z], [x, y - 1, z], [x, y, z + 1], [x, y, z - 1]];
  let changed = false;
  while (stack.length) {
    const [cx, cy, cz] = stack.pop();
    if (!isPortal(get(cx, cy, cz))) continue;
    set(cx, cy, cz, AIR);
    changed = true;
    rebuildAround(cx, cz);
    stack.push([cx + 1, cy, cz], [cx - 1, cy, cz], [cx, cy + 1, cz], [cx, cy - 1, cz], [cx, cy, cz + 1], [cx, cy, cz - 1]);
  }
  if (changed) rebuildPortalMeshes();
}

// Portalda bekleme: geri sayım, ekran mora dönüp kararır; süre dolunca geçiş. Çıkmadan tekrar tetiklenmez.
const portalFxEl = document.getElementById('portal-fx');
const portalHudEl = document.getElementById('portal-hud');
let portalTimer = 0, portalLocked = false;
function updatePortal(dt) {
  portalTexture.offset.y = (portalTexture.offset.y + dt * 0.25) % 1;
  const inside = overlapsBlock(player, B.portal_x) || overlapsBlock(player, B.portal_z);
  if (!inside) portalLocked = false;
  if (!inside || portalLocked || dead) {
    portalTimer = 0;
    portalFxEl.style.opacity = 0;
    portalHudEl.hidden = true;
    return;
  }
  portalTimer += dt;
  portalFxEl.style.opacity = Math.min(1, portalTimer / PORTAL_TIME);
  portalHudEl.hidden = false;
  portalHudEl.textContent = `Portal: ${Math.max(1, Math.ceil(PORTAL_TIME - portalTimer))}…`;
  if (portalTimer >= PORTAL_TIME) {
    portalLocked = true;
    travelThroughPortal();
  }
}
Object.assign(window.game, { tryLightPortal, rebuildPortalMeshes, portalTimer: () => portalTimer });
