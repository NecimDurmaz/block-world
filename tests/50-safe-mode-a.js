// Madde 50, aşama 1: /safe on açıkken canavarlar saldırmaz; kayda yazılır
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.6;
const input = document.getElementById('chat-input');
const type = text => { g.openChat(); input.value = text; input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); };
type('/safe on');
const on = g.isSafe() && g.chatLines().at(-1).startsWith('Güvenli mod açık');
for (let x = 30; x < 52; x++) for (let z = 30; z < 52; z++) { g.setBlock(x, 39, z, 3); for (let y = 40; y < 44; y++) g.setBlock(x, y, z, 0); }
for (let cx = 1; cx <= 3; cx++) for (let cz = 1; cz <= 3; cz++) g.rebuild(cx, cz);
Object.assign(p, { x: 40.5, y: 40, z: 40.5, vx: 0, vz: 0, health: 20 });
const zombie = g.spawnMob('zombie', 41.3, 40, 40.5);
const creeper = g.spawnMob('creeper', 40.5, 40, 42.5);
const skeleton = g.spawnMob('skeleton', 46.5, 40, 40.5);
const spider = g.spawnMob('spider', 40.5, 40, 38.5);
await wait(4000);
const exploded = !g.mobs.includes(creeper);
const safe = p.health === 20 && !exploded && !g.projectiles.some(a => !a.fireball);
// Kapatınca saldırırlar
type('/safe off');
const off = !g.isSafe();
Object.assign(zombie, { x: 41.3, y: 40, z: 40.5, memory: 30 });
for (let i = 0; i < 40 && p.health === 20; i++) await wait(100);
const attacks = p.health < 20;
for (const m of [...g.mobs]) m.health = 0, m.dying = 0.01;
p.health = 20;
type('/safe on');
g.saveGame();
await wait(400);
return { ok: on && safe && off && attacks, on, safe, exploded, health: p.health, off, attacks };
