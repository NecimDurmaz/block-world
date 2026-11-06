// ---------- Gün döngüsü ----------
// Gün döngüsü: saat, gökyüzü rengi, parlaklık, güneş ve ay.

// clock.time 0–1: 0–0,5 gündüz (5 dk), 0,5–0,55 akşam (30 sn), 0,55–0,95 gece (4 dk), 0,95–1 şafak (30 sn).
const DAY_LENGTH = 600, DUSK = [0.5, 0.55], DAWN = [0.95, 1];
const SKY_DAY = new THREE.Color(0x9cc8ef), SKY_SUNSET = new THREE.Color(0xe8a36a), SKY_NIGHT = new THREE.Color(0x0b1026);
const NIGHT_BRIGHTNESS = 0.25;
const clock = { time: 0.05, day: 1 };
const smoothstep = t => t * t * (3 - 2 * t);
const progress = (t, [a, b]) => Math.max(0, Math.min(1, (t - a) / (b - a)));

const skyDisc = (size, color) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ color, fog: false }));
  scene.add(m);
  return m;
};
const sunDisc = skyDisc(16, 0xfff1a0), moonDisc = skyDisc(11, 0xd9dee8);

// 0 = gece, 1 = gündüz
function daylight(t) {
  if (t < DUSK[0]) return 1;
  if (t < DUSK[1]) return 1 - smoothstep(progress(t, DUSK));
  if (t < DAWN[0]) return 0;
  return smoothstep(progress(t, DAWN));
}
function clockText() {
  const minutes = Math.floor(((6 + clock.time * 24) % 24) * 60);
  const pad = n => String(n).padStart(2, '0');
  return `Gün ${clock.day} · ${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}
function updateDayCycle(dt) {
  if (playing) {
    clock.time += dt / DAY_LENGTH;
    if (clock.time >= 1) { clock.time -= 1; clock.day++; }
  }
  const t = clock.time, light = daylight(t);
  // Gün batımı ve doğumunda gökyüzü turuncuya kayar
  const twilight = Math.sin(Math.PI * progress(t, DUSK)) + Math.sin(Math.PI * progress(t, DAWN));
  sky.copy(SKY_NIGHT).lerp(SKY_DAY, light).lerp(SKY_SUNSET, twilight * 0.6);
  scene.fog.color.copy(sky);
  const brightness = NIGHT_BRIGHTNESS + (1 - NIGHT_BRIGHTNESS) * light;
  brightnessUniform.value = brightness;
  dropBlockMaterial.color.setScalar(brightness);
  for (const rig of lightRigs) {
    rig.hemi.intensity = HEMI_INTENSITY * brightness;
    rig.sun.intensity = SUN_INTENSITY * brightness;
  }
  // Güneş t = 0'da doğar, 0,25'te tepede, 0,5'te batar; ay tam karşısında.
  const angle = t * Math.PI * 2;
  const sunDir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0.25).normalize();
  sunDisc.position.copy(camera.position).addScaledVector(sunDir, 150);
  moonDisc.position.copy(camera.position).addScaledVector(sunDir, -150);
  sunDisc.lookAt(camera.position);
  moonDisc.lookAt(camera.position);
}
