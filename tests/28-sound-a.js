// Madde 28, aşama 1: ses efektleri (çalınan sesler soundLog'dan izlenir)
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const audioReady = g.audioReady();
const names = () => g.soundLog.map(s => s.name);
for (let x = 20; x < 60; x++) for (let z = 20; z < 60; z++) g.setBlock(x, 39, z, 1);
// Yürürken adım sesi
Object.assign(p, { x: 40.5, y: 40, z: 50.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
g.soundLog.length = 0;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
for (let i = 0; i < 30 && !names().includes('step'); i++) await wait(100);
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
const steps = names().includes('step');
// Kazarken çıtırtı, kırılınca kırılma sesi
g.setBlock(40, 40, Math.floor(p.z) - 2, 2);
await wait(300);
g.soundLog.length = 0;
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
await wait(1500);
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const dig = names().includes('dig') && names().includes('break');
// Hasar sesi
g.soundLog.length = 0;
g.damagePlayer(1);
const hurt = names().includes('hurt');
// İnek: yakında böğürür, uzaklaştıkça ses kısılır, 16 bloktan ötede duyulmaz
const cow = g.spawnMob('cow', p.x + 2, p.y, p.z);
const moo = async distance => {
  g.soundLog.length = 0;
  Object.assign(cow, { x: p.x + distance, y: p.y, z: p.z, walking: false, timer: 60, soundTimer: 0 });
  await wait(300);
  return g.soundLog.find(s => s.name === 'cow');
};
const near = await moo(2), far = await moo(12), out = await moo(20);
const cowOk = !!near && !!far && !out && near.volume > far.volume;
// Ayarlardan ses kapatılır
const box = document.getElementById('set-sound');
box.checked = false;
box.dispatchEvent(new Event('change'));
const toggled = !g.isSoundOn();
await wait(500); // ayar kaydı
return { ok: steps && dig && hurt && cowOk && toggled, audioReady, steps, dig, hurt, cowOk, nearVol: near?.volume, farVol: far?.volume, toggled };
