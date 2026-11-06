// Madde 45: sohbet ve komutlar
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const input = document.getElementById('chat-input');
const type = text => {
  input.value = text;
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
};
const last = () => g.chatLines().at(-1);
// T sohbeti, / komutla açar
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyT', key: 't' }));
const opened = !input.hidden;
type('merhaba');
const message = last() === '<Oyuncu> merhaba' && input.hidden;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Slash', key: '/' }));
const slash = !input.hidden && input.value === '/';
type('/give stone_pickaxe');
const gavePick = g.inventory.some(s => s && s.key === 'stone_pickaxe' && s.durability === 132);
g.openChat(); type('/give taş 10');
const gaveStone = g.inventory.some(s => s && s.key === 'stone' && s.count === 10);
g.openChat(); type('/give elmas');
const unknownItem = last().startsWith('Böyle bir eşya yok');
g.openChat(); type('/zıpla');
const unknownCommand = last().startsWith('Bilinmeyen komut');
// /god: zombi vursa da can gitmez
g.openChat(); type('/god');
const z = g.spawnMob('zombie', p.x + 0.8, p.y, p.z);
z.memory = 30;
await wait(2500);
const godOk = g.isGod() && p.health === 20;
g.openChat(); type('/god');
// /time, /tp, /heal, /feed, /clear, /summon
g.openChat(); type('/time set night');
const night = Math.abs(g.clock.time - 0.6) < 0.01;
g.openChat(); type('/tp 30 45 30');
const tp = Math.abs(p.x - 30) < 0.01 && Math.abs(p.z - 30) < 0.01;
p.health = 5; p.food = 5;
g.openChat(); type('/heal');
g.openChat(); type('/feed');
const healed = p.health === 20 && p.food === 20;
const mobs0 = g.mobs.length;
g.openChat(); type('/summon inek');
const summoned = g.mobs.length === mobs0 + 1 && g.mobs.at(-1).kind === 'cow';
g.openChat(); type('/clear');
const cleared = g.inventory.every(s => !s);
return { ok: opened && message && slash && gavePick && gaveStone && unknownItem && unknownCommand && godOk && night && tp && healed && summoned && cleared,
  opened, message, slash, gavePick, gaveStone, unknownItem, unknownCommand, godOk, night, tp, healed, summoned, cleared };
