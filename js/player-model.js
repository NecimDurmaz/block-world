// ---------- Oyuncu modeli ----------
// İnsan biçimli model (oyuncu, zombi, iskelet) ve gözden görünümdeki kol.

const P = 0.05625;
function paint(w, h, rects) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const cg = c.getContext('2d');
  for (const [color, x, y, rw, rh] of rects) { cg.fillStyle = color; cg.fillRect(x, y, rw, rh); }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return new THREE.MeshLambertMaterial({ map: t });
}
// İnsan biçimli model: oyuncu, zombi ve iskelet bunu kullanır. limb: kol/bacak kalınlığı (piksel).
function buildHumanoid(c, limb = 4) {
  const headFront = paint(8, 8, [[c.skin, 0, 0, 8, 8], [c.hair, 0, 0, 8, 2], [c.hair, 0, 2, 1, 1], [c.hair, 7, 2, 1, 1],
    [c.eye, 1, 4, 1, 1], [c.iris, 2, 4, 1, 1], [c.iris, 5, 4, 1, 1], [c.eye, 6, 4, 1, 1], [c.mouth, 3, 6, 2, 1]]);
  const headSide = paint(8, 8, [[c.skin, 0, 0, 8, 8], [c.hair, 0, 0, 8, 3], [c.hair, 0, 3, 2, 2]]);
  const headBack = paint(8, 8, [[c.hair, 0, 0, 8, 6], [c.skin, 0, 6, 8, 2]]);
  const hairTop = paint(4, 4, [[c.hair, 0, 0, 4, 4]]);
  const skin = paint(4, 4, [[c.skin, 0, 0, 4, 4]]);
  const shirt = paint(4, 4, [[c.shirt, 0, 0, 4, 4]]);
  const shoe = paint(4, 4, [[c.shoe, 0, 0, 4, 4]]);
  const pants = paint(4, 4, [[c.pants, 0, 0, 4, 4]]);
  const armSide = paint(limb, 12, [[c.skin, 0, 0, limb, 12], [c.shirt, 0, 0, limb, 4]]);
  const legSide = paint(limb, 12, [[c.pants, 0, 0, limb, 12], [c.shoe, 0, 10, limb, 2]]);
  // BoxGeometry yüz sırası: +x, -x, +y, -y, +z (arka), -z (ön)
  const headMats = [headSide, headSide, hairTop, skin, headBack, headFront];
  const armMats = [armSide, armSide, shirt, skin, armSide, armSide];
  const legMats = [legSide, legSide, pants, shoe, legSide, legSide];

  const part = (w, h, d, mats, oy) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w * P, h * P, d * P), mats);
    m.position.y = oy * P;
    return m;
  };
  const joint = (x, y, child) => { const j = new THREE.Group(); j.position.set(x * P, y * P, 0); j.add(child); return j; };
  const root = new THREE.Group();
  const head = joint(0, 24, part(8, 8, 8, headMats, 4));
  const armR = joint(4 + limb / 2, 22, part(limb, 12, limb, armMats, -4));
  const armL = joint(-4 - limb / 2, 22, part(limb, 12, limb, armMats, -4));
  const legR = joint(2, 12, part(limb, 12, limb, legMats, -6));
  const legL = joint(-2, 12, part(limb, 12, limb, legMats, -6));
  root.add(head, part(8, 12, 4, shirt, 18), armR, armL, legR, legL);
  return { root, head, armR, armL, legR, legL, armMats };
}
const PLAYER_SKIN = { skin: '#c99a76', hair: '#4a3222', shirt: '#40598e', pants: '#393f4f', shoe: '#212121', eye: '#ffffff', iris: '#2a3e71', mouth: '#8a5a44' };
const { root: model, head, armR, armL, legR, legL, armMats } = buildHumanoid(PLAYER_SKIN);
scene.add(model);

const fpArm = new THREE.Mesh(new THREE.BoxGeometry(4 * P, 12 * P, 4 * P), armMats);
fpArm.rotation.order = 'YXZ';
fpScene.add(fpArm);
