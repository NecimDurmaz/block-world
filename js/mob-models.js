// ---------- Canlı modelleri ----------
// Hayvan ve düşman modelleri: kutulardan kurulur (1 piksel = P). Her çağrı yeni malzemeler üretir.

// Modeller oyuncu gibi kutulardan kurulur (1 piksel = P). Her canlı kendi malzemelerini alır.
const box = (w, h, d, mats, x, y, z) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w * P, h * P, d * P), mats);
  m.position.set(x * P, y * P, z * P);
  return m;
};
const pivot = (x, y, z, ...children) => {
  const g = new THREE.Group();
  g.position.set(x * P, y * P, z * P);
  g.add(...children);
  return g;
};

function buildCow() {
  const brown = '#4a3326', white = '#e9e4dc';
  const hide = paint(8, 8, [[brown, 0, 0, 8, 8], [white, 1, 1, 3, 2], [white, 5, 4, 2, 3], [white, 0, 6, 2, 2], [white, 6, 0, 2, 1]]);
  const legMat = paint(4, 10, [[brown, 0, 0, 4, 10], [white, 0, 5, 4, 3], ['#2a1d16', 0, 9, 4, 1]]);
  const face = paint(8, 8, [[brown, 0, 0, 8, 8], [white, 2, 4, 4, 4], ['#ffffff', 1, 2, 1, 1], ['#111111', 2, 2, 1, 1],
    ['#111111', 5, 2, 1, 1], ['#ffffff', 6, 2, 1, 1], ['#c98c7a', 3, 6, 2, 1]]);
  const horn = paint(1, 1, [['#d8d0b8', 0, 0, 1, 1]]);
  const root = new THREE.Group();
  const legs = [[-3, -6], [3, -6], [-3, 6], [3, 6]].map(([x, z]) => {
    const leg = pivot(x, 10, z, box(4, 10, 4, legMat, 0, -5, 0));
    root.add(leg);
    return leg;
  });
  root.add(box(10, 8, 16, hide, 0, 14, 0));
  // BoxGeometry yüz sırası: +x, -x, +y, -y, +z, -z (ön)
  root.add(pivot(0, 16, -8, box(8, 8, 6, [hide, hide, hide, hide, hide, face], 0, 1, -3),
    box(1, 3, 1, horn, -4.5, 6, -2), box(1, 3, 1, horn, 4.5, 6, -2)));
  return { root, legs };
}
function buildPig() {
  const pink = '#efa3a0', dark = '#d7807d';
  const skin = paint(4, 4, [[pink, 0, 0, 4, 4], [dark, 1, 2, 1, 1]]);
  const face = paint(8, 8, [[pink, 0, 0, 8, 8], ['#ffffff', 1, 3, 1, 1], ['#111111', 2, 3, 1, 1], ['#111111', 5, 3, 1, 1], ['#ffffff', 6, 3, 1, 1]]);
  const snout = paint(4, 3, [[dark, 0, 0, 4, 3], ['#7a3f3d', 0, 1, 1, 1], ['#7a3f3d', 3, 1, 1, 1]]);
  const root = new THREE.Group();
  const legs = [[-3, -5], [3, -5], [-3, 5], [3, 5]].map(([x, z]) => {
    const leg = pivot(x, 6, z, box(4, 6, 4, skin, 0, -3, 0));
    root.add(leg);
    return leg;
  });
  root.add(box(10, 8, 14, skin, 0, 10, 0));
  root.add(pivot(0, 12, -7, box(8, 8, 8, [skin, skin, skin, skin, skin, face], 0, 0, -4), box(4, 3, 1, snout, 0, -1, -8.5)));
  return { root, legs };
}
function buildChicken() {
  const white = '#f4f4f0', yellow = '#e8b82a', red = '#c8302c';
  const feathers = paint(4, 4, [[white, 0, 0, 4, 4], ['#dcdcd6', 1, 2, 1, 1]]);
  const face = paint(4, 6, [[white, 0, 0, 4, 6], ['#111111', 0, 2, 1, 1], ['#111111', 3, 2, 1, 1]]);
  const legMat = paint(1, 1, [[yellow, 0, 0, 1, 1]]);
  const root = new THREE.Group();
  const legs = [-1.5, 1.5].map(x => {
    const leg = pivot(x, 5, 0, box(1, 5, 1, legMat, 0, -2.5, 0));
    root.add(leg);
    return leg;
  });
  root.add(box(6, 6, 8, feathers, 0, 8, 0), box(1, 4, 6, feathers, -3.5, 9, 0), box(1, 4, 6, feathers, 3.5, 9, 0));
  root.add(pivot(0, 11, -4,
    box(4, 6, 3, [feathers, feathers, feathers, feathers, feathers, face], 0, 2, -1.5),
    box(4, 2, 2, legMat, 0, 2, -4),                                     // gaga
    box(2, 2, 1, paint(1, 1, [[red, 0, 0, 1, 1]]), 0, 0, -3.5),         // gıdı
    box(1, 2, 3, paint(1, 1, [[red, 0, 0, 1, 1]]), 0, 6, -1.5)));       // ibik
  return { root, legs };
}
function buildSheep() {
  const wool = '#ececec', gray = '#8f8f8f';
  const fleece = paint(4, 4, [[wool, 0, 0, 4, 4], ['#dedede', 1, 1, 1, 1], ['#dedede', 3, 2, 1, 1]]);
  const legMat = paint(4, 8, [[gray, 0, 0, 4, 8], [wool, 0, 0, 4, 3]]);
  const face = paint(6, 6, [[gray, 0, 0, 6, 6], ['#ffffff', 0, 2, 1, 1], ['#111111', 1, 2, 1, 1], ['#111111', 4, 2, 1, 1], ['#ffffff', 5, 2, 1, 1], ['#6b5b5b', 2, 4, 2, 1]]);
  const grayMat = paint(1, 1, [[gray, 0, 0, 1, 1]]);
  const root = new THREE.Group();
  const legs = [[-3, -5], [3, -5], [-3, 5], [3, 5]].map(([x, z]) => {
    const leg = pivot(x, 8, z, box(4, 8, 4, legMat, 0, -4, 0));
    root.add(leg);
    return leg;
  });
  root.add(box(10, 9, 14, fleece, 0, 12.5, 0));
  root.add(pivot(0, 15, -7, box(6, 6, 7, [grayMat, grayMat, fleece, grayMat, grayMat, face], 0, 0, -3.5)));
  return { root, legs };
}

const ZOMBIE_SKIN = { skin: '#5a8f45', hair: '#3c6b2e', shirt: '#3a8fc0', pants: '#3b3fa0', shoe: '#2b2e6e', eye: '#1b1b1b', iris: '#1b1b1b', mouth: '#2e4f24' };
function buildZombie() {
  const { root, armR, armL, legR, legL } = buildHumanoid(ZOMBIE_SKIN);
  return { root, legs: [legR, legL], arms: [armR, armL] };
}

const SKELETON_SKIN = { skin: '#d6d6d0', hair: '#d6d6d0', shirt: '#c4c4be', pants: '#c4c4be', shoe: '#a8a8a2', eye: '#1f1f1f', iris: '#1f1f1f', mouth: '#7a7a74' };
function buildSkeleton() {
  const { root, armR, armL, legR, legL } = buildHumanoid(SKELETON_SKIN, 2);
  // Yay sol elde; kol öne kalkınca dikey durur.
  armL.add(box(1, 1, 12, paint(1, 1, [['#6b4a2b', 0, 0, 1, 1]]), 0, -10, 0));
  return { root, legs: [legR, legL], bowArms: [armR, armL] };
}

function buildSpider() {
  const black = '#1d1b1b', gray = '#3a3636', red = '#d0201c';
  const hide = paint(4, 4, [[black, 0, 0, 4, 4], [gray, 1, 1, 1, 1], [gray, 3, 2, 1, 1]]);
  const face = paint(8, 8, [[black, 0, 0, 8, 8], [red, 1, 2, 2, 1], [red, 5, 2, 2, 1], [red, 2, 4, 1, 1], [red, 5, 4, 1, 1]]);
  const legMat = paint(1, 1, [[gray, 0, 0, 1, 1]]);
  const root = new THREE.Group();
  root.add(box(12, 9, 12, hide, 0, 10.5, 8));                                  // karın
  root.add(box(6, 6, 6, hide, 0, 9, 0));                                       // göğüs
  root.add(box(8, 8, 8, [hide, hide, hide, hide, hide, face], 0, 9, -6));      // baş
  // 8 bacak: gövdenin iki yanından dışarı ve aşağı açılır; yürürken öne arkaya salınır.
  const spiderLegs = [];
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
    const tilt = new THREE.Group();
    tilt.rotation.z = -side * 0.6;
    tilt.add(box(14, 2, 2, legMat, side * 7, 0, 0));
    const leg = pivot(side * 3, 8, -3 + i * 2.5, tilt);
    leg.userData.baseYaw = side * (i - 1.5) * 0.35;
    leg.rotation.y = leg.userData.baseYaw;
    root.add(leg);
    spiderLegs.push(leg);
  }
  return { root, legs: [], spiderLegs };
}

function buildCreeper() {
  const green = '#4fa83a', light = '#7ccf5e', dark = '#2d6b22', black = '#101010';
  const skin = paint(4, 4, [[green, 0, 0, 4, 4], [light, 0, 0, 1, 1], [dark, 2, 1, 1, 1], [light, 3, 2, 1, 1], [dark, 1, 3, 1, 1]]);
  // Üzgün yüz: iki göz, burun, aşağı inen ağız köşeleri
  const face = paint(8, 8, [[green, 0, 0, 8, 8], [light, 0, 6, 1, 1], [dark, 7, 1, 1, 1],
    [black, 1, 1, 2, 2], [black, 5, 1, 2, 2], [black, 3, 3, 2, 2], [black, 2, 4, 1, 3], [black, 5, 4, 1, 3], [black, 3, 5, 2, 1]]);
  const root = new THREE.Group();
  const legs = [[-2, -4], [2, -4], [-2, 4], [2, 4]].map(([x, z]) => {
    const leg = pivot(x, 6, z, box(4, 6, 4, skin, 0, -3, 0));
    root.add(leg);
    return leg;
  });
  root.add(box(8, 12, 4, skin, 0, 12, 0));
  root.add(box(8, 8, 8, [skin, skin, skin, skin, skin, face], 0, 22, 0));
  return { root, legs };
}
