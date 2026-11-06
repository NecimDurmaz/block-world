// Madde 51: K ile açılan kontrol paneli; her özellik düğmeyle
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const key = code => window.dispatchEvent(new KeyboardEvent('keydown', { code }));
const q = sel => document.querySelector(sel);
key('KeyK');
const opened = g.isControlOpen() && !q('#control').hidden;
// Panel açıkken yürünmez ve E envanteri açmaz
key('KeyE');
const noInventory = document.getElementById('inventory').hidden;
q('[data-toggle="safe"]').click();
q('[data-toggle="god"]').click();
const toggles = g.isSafe() && g.isGod() && q('[data-toggle="safe"]').classList.contains('on') && q('[data-toggle="safe"] .state').textContent === 'AÇIK';
q('[data-toggle="god"]').click();
q('[data-toggle="sound"]').click();
const soundOff = !g.isSoundOn() && !g.settings.sound;
q('[data-toggle="sound"]').click();
// Görünüm: kamera ve görüş mesafesi
q('[data-view="1"]').click();
q('[data-distance="far"]').click();
const viewOk = q('[data-view="1"]').classList.contains('on') && g.settings.viewDistance === 'far' && q('[data-distance="far"]').classList.contains('on');
q('[data-distance="normal"]').click();
q('[data-time="midnight"]').click();
const midnight = Math.abs(g.clock.time - 0.75) < 0.01;
p.health = 5; p.food = 5;
q('[data-action="heal"]').click(); q('[data-action="feed"]').click();
const healed = p.health === 20 && p.food === 20;
const before = g.mobs.length;
q('[data-mob="cow"]').click();
const summoned = g.mobs.length === before + 1 && g.mobs.at(-1).kind === 'cow';
document.getElementById('tp-x').value = 30; document.getElementById('tp-y').value = 45; document.getElementById('tp-z').value = 31;
q('[data-action="tp"]').click();
const tp = Math.abs(p.x - 30.5) < 0.01 && Math.abs(p.z - 31.5) < 0.01;
// Boşaltma iki basış ister
g.addItem('dirt', 3);
q('[data-action="clear"]').click();
const firstClick = g.inventory.some(Boolean);
q('[data-action="clear"]').click();
const cleared = !g.inventory.some(Boolean);
q('[data-action="items"]').click();
const picker = !g.isControlOpen() && !q('#picker-ui').hidden;
g.closeInventory();
key('KeyK');
key('Escape');
const closed = !g.isControlOpen();
return { ok: viewOk && opened && noInventory && toggles && soundOff && midnight && healed && summoned && tp && firstClick && cleared && picker && closed,
  viewOk, opened, noInventory, toggles, soundOff, midnight, healed, summoned, tp, firstClick, cleared, picker, closed };
