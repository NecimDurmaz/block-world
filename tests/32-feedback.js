// Madde 32: hasar ve ölüm geri bildirimleri
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
// Hasar alınca kamera yana yatar, sonra düzelir
g.damagePlayer(2, p.x + 1, p.z);
let rolled = 0;
for (let i = 0; i < 10; i++) { await wait(20); rolled = Math.max(rolled, Math.abs(g.camera.rotation.z)); }
await wait(600);
const settled = Math.abs(g.camera.rotation.z) < 0.001;
// Can 4 ve altında: ekran kenarı kararır, kalpler titrer
p.health = 3;
let shook = false;
for (let i = 0; i < 30 && !shook; i++) { await wait(50); shook = document.querySelector('#hearts i.shake') !== null; }
const vignette = getComputedStyle(document.getElementById('low-health')).opacity !== '0' || document.getElementById('low-health').style.opacity === '1';
p.health = 20;
await wait(600);
const vignetteOff = document.getElementById('low-health').style.opacity === '0';
// Ölen canlıdan duman çıkar
const cow = g.spawnMob('cow', p.x + 3, p.y, p.z);
cow.health = 0; cow.dying = 0.05;
let smoke = 0;
for (let i = 0; i < 20 && !smoke; i++) { await wait(50); smoke = g.particles.filter(pt => pt.smoke).length; }
return { ok: rolled > 0.03 && rolled <= 0.1001 && settled && shook && vignette && vignetteOff && smoke === 8,
  rolled: +rolled.toFixed(3), settled, shook, vignette, vignetteOff, smoke };
