// ---------- Oyun döngüsü ----------
// Oyun döngüsü: her karede hareket, fizik, kamera, animasyon ve çizim.

let last = performance.now(), walkPhase = 0, walkAmp = 0;
// Su: yukarı yüzme hızı ve en yüksek batma hızı (blok/sn)
const SWIM_UP_SPEED = 3, SINK_SPEED = 3;
const underwaterEl = document.getElementById('underwater');
// Arkadan kamera: omuz kayması, uzaklık ve engellere göre yumuşatılmış anlık uzaklık
const CAMERA_DISTANCE = 3.5, SHOULDER_OFFSET = 0.6, SHOULDER_RISE = 0.25;
let cameraDistance = CAMERA_DISTANCE;
// from noktasından dir yönünde, bloğa 0,25'ten fazla yaklaşmadan gidilebilecek en uzak mesafe (en çok max).
function cameraClearance(from, dir, max) {
  const q = new THREE.Vector3();
  for (let d = 0.05; d <= max; d += 0.05) {
    q.copy(from).addScaledVector(dir, d);
    const blocked = [[0, 0, 0], [0.25, 0, 0], [-0.25, 0, 0], [0, 0.25, 0], [0, -0.25, 0], [0, 0, 0.25], [0, 0, -0.25]]
      .some(([ox, oy, oz]) => isSolid(get(Math.floor(q.x + ox), Math.floor(q.y + oy), Math.floor(q.z + oz))));
    if (blocked) return Math.max(0, d - 0.05);
  }
  return max;
}
function frame(now) {
  // rAF zaman damgası, betiğin başladığı andan önce olabilir; negatif dt fiziği ters çevirir.
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
  last = now;
  const p = player;

  const inWater = overlapsBlock(p, B.water);
  if (playing) updateSleep(dt);
  if (playing && !inventoryOpen && sleepTimer <= 0) {
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    const rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    let mx = 0, mz = 0;
    if (keys.KeyW) { mx += fx; mz += fz; }
    if (keys.KeyS) { mx -= fx; mz -= fz; }
    if (keys.KeyD) { mx += rx; mz += rz; }
    if (keys.KeyA) { mx -= rx; mz -= rz; }
    const len = Math.hypot(mx, mz);
    if (!keys.KeyW) sprinting = false;
    if (p.food <= SPRINT_FOOD) sprinting = false;
    const sprintNow = (sprinting || keys.ShiftLeft || keys.ShiftRight) && p.food > SPRINT_FOOD;
    const speed = (sprintNow ? 6.2 : 4.3) * (inWater ? 0.5 : 1);
    updateHunger(dt, sprintNow && len > 0);
    p.vx = (len ? mx / len * speed : 0) + p.kx;
    p.vz = (len ? mz / len * speed : 0) + p.kz;
    if (keys.Space && inWater) p.vy = SWIM_UP_SPEED;
    else if (keys.Space && p.onGround) { p.vy = JUMP; p.onGround = false; }
  } else { p.vx = p.vz = 0; }
  const knockDecay = Math.exp(-dt * 6);
  p.kx *= knockDecay; p.kz *= knockDecay;
  updateHealth(dt);

  // Suda yerçekimi 1/4, batma hızı sınırlı
  p.vy = inWater ? Math.max(p.vy - GRAVITY / 4 * dt, -SINK_SPEED) : Math.max(p.vy - GRAVITY * dt, -40);
  stepEntity(p, dt);
  if (playing) {
    for (const m of mobs) updateMob(m, dt);
    updateAnimalSpawning(dt);
    updateHostileSpawning(dt);
    updateProjectiles(dt);
    updateParticles(dt);
    updateDrops(dt);
    updateFurnaces(dt);
    updateCrops(dt);
  }
  for (const m of mobs) renderMob(m);
  renderDrops();
  // Düşme hasarı: 3 bloğun üstündeki her blok 1 can
  if (playing) {
    if (inWater) p.fallPeak = null; // suya düşen hasar almaz
    else if (!p.onGround) p.fallPeak = Math.max(p.fallPeak ?? p.y, p.y);
    else if (p.fallPeak !== null) {
      const fall = p.fallPeak - p.y;
      p.fallPeak = null;
      if (fall > 3.5) damagePlayer(Math.round(fall - 3));
    }
    if (p.y < -20) die();
  }

  // Kamera: 0 arkadan, 1 gözden, 2 önden. Arkada/önde duvar varsa kamera yaklaşır.
  const eye = new THREE.Vector3(p.x, p.y + EYE, p.z);
  const dir = new THREE.Vector3(-Math.sin(p.yaw) * Math.cos(p.pitch), Math.sin(p.pitch), -Math.cos(p.yaw) * Math.cos(p.pitch));
  aim.o.copy(eye); aim.d.copy(dir); aim.max = 6; aim.start = 0;
  if (view === 1) {
    camera.position.copy(eye);
    camera.rotation.set(p.pitch, p.yaw, 0);
  } else if (view === 0) {
    // Omuz üstü: kamera sağ omzun üstündeki noktadan geriye çekilir; karakter ekranın solunda kalır, nişangâh boş kalır.
    const right = new THREE.Vector3(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
    const shoulderDir = right.multiplyScalar(SHOULDER_OFFSET).add(new THREE.Vector3(0, SHOULDER_RISE, 0));
    const shoulderLen = shoulderDir.length();
    shoulderDir.normalize();
    const shoulder = eye.clone().addScaledVector(shoulderDir, cameraClearance(eye, shoulderDir, shoulderLen));
    const back = dir.clone().negate();
    const target = cameraClearance(shoulder, back, CAMERA_DISTANCE);
    // Engel yaklaşınca hemen öne gelir, açılınca yumuşakça geri çekilir.
    cameraDistance = target < cameraDistance ? target : cameraDistance + (target - cameraDistance) * Math.min(1, dt * 5);
    camera.position.copy(shoulder).addScaledVector(back, cameraDistance);
    camera.rotation.set(p.pitch, p.yaw, 0);
    aim.o.copy(camera.position); aim.max = 6 + cameraDistance; aim.start = cameraDistance;
  } else {
    const dist = cameraClearance(eye, dir, CAMERA_DISTANCE);
    camera.position.copy(eye).addScaledVector(dir, dist);
    camera.lookAt(eye);
  }
  const fov = (sprinting && playing && Math.hypot(p.vx, p.vz) > 0.1) ? 85 : 75;
  if (Math.abs(camera.fov - fov) > 0.1) { camera.fov += (fov - camera.fov) * Math.min(1, dt * 10); camera.updateProjectionMatrix(); }

  // Model ve yürüme animasyonu
  const speedH = Math.hypot(p.vx, p.vz);
  walkAmp += ((speedH > 0.1 ? Math.min(1, speedH / 4.3) : 0) - walkAmp) * Math.min(1, dt * 10);
  walkPhase += dt * speedH * 2.4;
  const swing = Math.sin(walkPhase) * 0.8 * walkAmp;
  punch = Math.max(0, punch - dt);
  const pk = Math.sin(punch / 0.25 * Math.PI);
  // Kamera karakterin içine girecek kadar yaklaşınca model gizlenir.
  model.visible = view === 2 || (view === 0 && cameraDistance > 0.8);
  model.position.set(p.x, p.y, p.z);
  model.rotation.y = p.yaw;
  head.rotation.x = p.pitch;
  legR.rotation.x = swing; legL.rotation.x = -swing;
  armL.rotation.x = swing; armR.rotation.x = -swing + pk * 1.4;

  fpArm.position.set(0.45 + Math.sin(walkPhase) * 0.03 * walkAmp, -0.42 + Math.abs(Math.cos(walkPhase)) * 0.03 * walkAmp + pk * 0.12, -0.75 - pk * 0.25);
  fpArm.rotation.set(1.75 + pk * 0.4, 0.35, 0);

  document.getElementById('crosshair').hidden = view === 2;
  const hit = playing ? raycast() : null;
  const mobHit = playing ? rayMob() : null;
  updateMining(playing && !inventoryOpen ? dt : 0, playing && !inventoryOpen ? hit : null);
  // İmleç bir canlının üstündeyse blok çerçevesi gizlenir.
  highlight.visible = !!hit && !(mobHit && mobHit.t < hit.t);
  if (hit) highlight.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);

  updateDayCycle(dt);
  // Kamera suyun içindeyse ekran mavi tonlanır, sis 8 bloğa iner.
  const cameraInWater = get(Math.floor(camera.position.x), Math.floor(camera.position.y), Math.floor(camera.position.z)) === B.water;
  underwaterEl.hidden = !cameraInWater;
  scene.fog.near = cameraInWater ? 0 : 30;
  scene.fog.far = cameraInWater ? 8 : 70;
  if (cameraInWater) scene.fog.color.setRGB(0.1, 0.25, 0.5).multiplyScalar(brightnessUniform.value);
  info.textContent = `${clockText()} · X ${Math.floor(p.x)} · Y ${Math.floor(p.y)} · Z ${Math.floor(p.z)}`;
  renderer.clear();
  renderer.render(scene, camera);
  if (view === 1) { renderer.clearDepth(); renderer.render(fpScene, fpCam); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
