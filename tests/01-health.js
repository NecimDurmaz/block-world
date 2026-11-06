// Madde 1: can barı
const { player: p, damagePlayer } = window.game;
document.getElementById('play').click();
await wait(300);
const hearts = document.querySelectorAll('#hearts i').length;
damagePlayer(5, p.x + 1, p.z);
const afterHit = p.health;
await wait(50);
const flashed = Number(document.getElementById('hurt').style.opacity) > 0;
damagePlayer(5, p.x + 1, p.z);
const invulnerable = p.health === afterHit;
await wait(9500);
const regenerated = p.health > afterHit;
return { ok: hearts === 10 && afterHit === 15 && flashed && invulnerable && regenerated, hearts, afterHit, flashed, invulnerable, healthAfterWait: p.health };
