// ---------- Blaze ----------
// Nether kalesindeki blaze: süzülür, oyuncuyu görünce 3'lü küçük ateş topu atar. Doğurucu, oyuncu yakınken blaze doğurur.

// Küçük ateş topu: 5 hasar ve 3 sn yanma (saniyede 1), bloğa değince patlamaz.
const BLAZE_RANGE = 16, BLAZE_HOVER = 3, BLAZE_SPEED = 1.6, BLAZE_BURST = 3, BLAZE_BURST_GAP = 0.3, BLAZE_RELOAD = 3;
const SPAWNER_RANGE = 16, SPAWNER_INTERVAL = 10, SPAWNER_MAX = 4, SPAWNER_AREA = 8;
ITEMS.blaze_rod = { name: 'Blaze çubuğu', canvas: pixelArt(['......yo', '.....yo.', '....yo..', '...yo...', '..yo....', '.yo.....', 'yo......', '........'], { y: '#ffd23a', o: '#e8801c' }) };
MOB_DROPS.blaze = [['blaze_rod', 0, 1]];

// Sarı-turuncu baş, çevresinde iki halka hâlinde dönen 8 çubuk
function buildBlaze(scale = 1) {
  const head = paint(8, 8, [['#f0b028', 0, 0, 8, 8], ['#c8701a', 0, 0, 8, 2], ['#3a1a08', 1, 4, 2, 1], ['#3a1a08', 5, 4, 2, 1], ['#ffe070', 2, 6, 4, 1]]);
  const side = paint(8, 8, [['#f0b028', 0, 0, 8, 8], ['#c8701a', 0, 0, 8, 2]]);
  const rod = paint(2, 8, [['#ffd23a', 0, 0, 2, 8], ['#e8801c', 0, 6, 2, 2]]);
  const root = new THREE.Group();
  root.add(box(8, 8, 8, [side, side, side, side, side, head], 0, 24, 0));
  const rings = [0, 1].map(level => {
    const ring = new THREE.Group();
    ring.position.y = (14 - level * 8) * P;
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + level * Math.PI / 4;
      ring.add(box(2, 8, 2, rod, Math.cos(a) * 7, 0, Math.sin(a) * 7));
    }
    root.add(ring);
    return ring;
  });
  root.scale.setScalar(scale);
  return { root, legs: [], rings };
}
MOB_TYPES.blaze = { name: 'Blaze', health: 20, w: 0.3, h: 1.8, speed: BLAZE_SPEED, hostile: true, blaze: true, build: () => buildBlaze() };

// Blaze: yerçekimsiz; oyuncuyu görünce ona doğru yaklaşır ve onun 3 blok üstünde süzülür, 3 sn'de bir 3'lü atış yapar.
function updateBlaze(m, dt) {
  const dx = player.x - m.x, dz = player.z - m.z, dist = Math.hypot(dx, dz);
  if (dist > DESPAWN_DISTANCE) { removeMob(m); return; }
  const sees = !dead && !safeMode && dist <= BLAZE_RANGE && canSeePlayer(m);
  let tx = 0, tz = 0, ty = 0;
  if (sees) {
    m.yaw = Math.atan2(-dx, -dz);
    if (dist > 6) { tx = dx / dist; tz = dz / dist; }
    ty = Math.sign(player.y + BLAZE_HOVER - m.y) * (Math.abs(player.y + BLAZE_HOVER - m.y) > 0.5 ? 1 : 0);
    m.attackCooldown -= dt;
    if (m.attackCooldown <= 0) {
      m.burstLeft = BLAZE_BURST;
      m.attackCooldown = BLAZE_RELOAD;
    }
    m.burstTimer = (m.burstTimer || 0) - dt;
    if (m.burstLeft > 0 && m.burstTimer <= 0) { shootSmallFireball(m); m.burstLeft--; m.burstTimer = BLAZE_BURST_GAP; }
  } else {
    m.timer -= dt;
    if (m.timer <= 0) { m.timer = 2 + Math.random() * 3; m.yaw = Math.random() * Math.PI * 2; m.drift = Math.random() < 0.5 ? 0.4 : 0; }
    tx = -Math.sin(m.yaw) * (m.drift || 0); tz = -Math.cos(m.yaw) * (m.drift || 0);
    ty = Math.sin(m.walkPhase) * 0.3;
  }
  m.vx = tx * BLAZE_SPEED + m.kx; m.vz = tz * BLAZE_SPEED + m.kz; m.vy = ty * BLAZE_SPEED;
  const knockDecay = Math.exp(-dt * 6);
  m.kx *= knockDecay; m.kz *= knockDecay;
  stepEntity(m, dt);
  m.walkPhase += dt * 2;
  m.body.rings.forEach((ring, i) => { ring.rotation.y += dt * (i ? -2 : 2); });
}
function shootSmallFireball(m) {
  const x = m.x - Math.sin(m.yaw) * 0.6, y = m.y + 1.4, z = m.z - Math.cos(m.yaw) * 0.6;
  const dx = player.x - x, dy = player.y + 1 - y, dz = player.z - z, len = Math.hypot(dx, dy, dz) || 1;
  const mesh = fireballMesh();
  mesh.scale.setScalar(0.5);
  projectiles.push({ fireball: true, small: true, x, y, z, vx: dx / len * FIREBALL_SPEED * 1.4, vy: dy / len * FIREBALL_SPEED * 1.4, vz: dz / len * FIREBALL_SPEED * 1.4, life: 6, mesh });
}

// Doğurucular: yakındaki kalelerin doğurucusu (kırılmadıysa) oyuncu 16 blok içindeyken her 10 sn'de bir, çevresinde 4'ten az
// blaze varsa 1 blaze doğurur. İçinde küçük bir blaze döner. Kale çevresinde ayrıca domuz adam doğar.
const spawnerModels = new Map(); // "x,y,z" -> küçük blaze modeli
let spawnerTimer = 0, fortressPigmanTimer = 0;
function updateBlazeSpawners(dt) {
  const active = new Set();
  if (dimension === 'nether') {
    const plan = fortressNear(player.x, player.z);
    const s = plan.spawner, key = s.x + ',' + s.y + ',' + s.z;
    if (get(s.x, s.y, s.z) === B.spawner) {
      active.add(key);
      if (!spawnerModels.has(key)) {
        const mini = buildBlaze(0.35);
        mini.root.position.set(s.x + 0.5, s.y + 0.1, s.z + 0.5);
        scene.add(mini.root);
        spawnerModels.set(key, mini);
      }
      const mini = spawnerModels.get(key);
      mini.root.rotation.y += dt * 2;
      mini.rings.forEach((ring, i) => { ring.rotation.y += dt * (i ? -3 : 3); });
      spawnerTimer -= dt;
      const near = Math.hypot(player.x - s.x - 0.5, player.y - s.y, player.z - s.z - 0.5) <= SPAWNER_RANGE;
      if (near && spawnerTimer <= 0) {
        spawnerTimer = SPAWNER_INTERVAL;
        const around = mobs.filter(m => m.kind === 'blaze' && m.dying <= 0 && Math.hypot(m.x - s.x, m.z - s.z) <= SPAWNER_AREA).length;
        if (around < SPAWNER_MAX) spawnMob('blaze', s.x + 0.5 + (Math.random() * 2 - 1) * 2, s.y + 0.5, s.z + 0.5 + (Math.random() * 2 - 1) * 2);
      }
      // Kale köprülerinde domuz adam
      fortressPigmanTimer -= dt;
      if (fortressPigmanTimer <= 0 && Math.hypot(player.x - plan.x, player.z - plan.z) < 64) {
        fortressPigmanTimer = 15;
        const arm = plan.arms[Math.floor(Math.random() * plan.arms.length)], d = 4 + Math.floor(Math.random() * (arm.len - 4));
        const px = plan.x + arm.dir[0] * d, pz = plan.z + arm.dir[1] * d;
        if (countKind('zombie_pigman') < MAX_PIGMEN && Math.hypot(player.x - px, player.z - pz) > 12 && get(px, plan.y + 1, pz) === AIR) spawnMob('zombie_pigman', px + 0.5, plan.y + 1, pz + 0.5);
      }
    }
  }
  for (const [key, mini] of spawnerModels) if (!active.has(key)) { scene.remove(mini.root); spawnerModels.delete(key); }
}
Object.assign(window.game, { fortressPlan, fortressNear, shootSmallFireball, spawnerModels: () => spawnerModels.size });
