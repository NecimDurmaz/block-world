// Madde 4, aşama 1: dünyayı ve oyuncuyu değiştirip kaydet
const g = window.game;
document.getElementById('play').click();
for (let i = 0; i < 100 && !g.player.onGround; i++) await wait(50);
g.setBlock(50, 40, 50, 8); // havada bir tuğla
g.player.x += 2.25;
g.player.health = 13;
g.clock.time = 0.4;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit4' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Digit4' }));
await wait(100);
g.saveGame();
await wait(500);
return { ok: !document.getElementById('saved').hidden, x: g.player.x };
