// Madde 53, aşama 1: panelden uçma; iki kez boşlukla uç, boşluk/Shift ile yüksel/alçal, yere değince in
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const key = (code, down = true) => window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code }));
const doubleSpace = async () => { key('Space'); await wait(60); key('Space', false); await wait(60); key('Space'); await wait(60); key('Space', false); };
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) { g.setBlock(x, 39, z, 3); for (let y = 40; y < 47; y++) g.setBlock(x, y, z, 0); }
for (let cx = 1; cx <= 3; cx++) for (let cz = 1; cz <= 3; cz++) g.rebuild(cx, cz);
Object.assign(p, { x: 40.5, y: 40, z: 40.5, vx: 0, vy: 0, vz: 0, health: 20 });
await wait(300);
// İzin yokken iki kez boşluk sadece zıplatır
await doubleSpace();
await wait(1200);
const noFlyWithout = !g.isFlying() && p.onGround;
// Panelden aç
g.openControl();
document.querySelector('[data-toggle="fly"]').click();
const toggleOn = g.isFlyAllowed() && document.querySelector('[data-toggle="fly"]').classList.contains('on');
g.closeControl();
document.getElementById('play').click();
await wait(200);
await doubleSpace();
await wait(100);
const flyingNow = g.isFlying();
key('Space'); await wait(800); key('Space', false);
const rose = p.y > 44;
const y1 = p.y;
await wait(800);
const hovers = Math.abs(p.y - y1) < 0.2 && g.isFlying();
// Shift ile alçal, yere değince uçuş biter, hasar yok
key('ShiftLeft');
for (let i = 0; i < 40 && g.isFlying(); i++) await wait(100);
key('ShiftLeft', false);
const landed = !g.isFlying() && p.onGround;
// Havada uçuşu kapatıp düşmek hasar vermez (uçma açıkken)
Object.assign(p, { y: 46 });
await doubleSpace(); await wait(100);
const flew = g.isFlying();
await doubleSpace();
for (let i = 0; i < 30 && !p.onGround; i++) await wait(100);
const noFallDamage = p.health === 20;
g.saveGame();
await wait(400);
return { ok: noFlyWithout && toggleOn && flyingNow && rose && hovers && landed && flew && noFallDamage,
  noFlyWithout, toggleOn, flyingNow, rose, hovers, landed, flew, noFallDamage, y: p.y, health: p.health };
