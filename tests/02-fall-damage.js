// Madde 2: düşme hasarı, ölüm ve yeniden doğma
const { player: p } = window.game;
document.getElementById('play').click();
const settle = async () => { for (let i = 0; i < 100 && !p.onGround; i++) await wait(50); };
await settle();
const ground = p.y;
const dropFrom = async height => {
  p.health = 20;
  p.y = ground + height; p.vy = 0; p.fallPeak = null;
  await wait(300);
  await settle();
  await wait(100);
  return p.health;
};
const after4 = await dropFrom(4);
await wait(600);
const after10 = await dropFrom(10);
await wait(600);
await dropFrom(40);
const deathShown = !document.getElementById('death').hidden;
document.getElementById('respawn').click();
await wait(300);
const respawned = p.health === 20 && document.getElementById('death').hidden;
return { ok: after4 === 19 && after10 === 13 && deathShown && respawned, after4, after10, deathShown, respawned };
