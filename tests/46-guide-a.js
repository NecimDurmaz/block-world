// Madde 46, aşama 1: yeni dünyada ilk adım; yürüyünce ve kütük alınca ilerler; H gizler; ilerleme kayda yazılır
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
await wait(300);
const card = document.getElementById('guide');
const first = !card.hidden && document.getElementById('guide-title').textContent === 'Etrafına bak ve yürü' && g.guideStep() === 0;
const steps = g.guideSteps.length >= 15;
// Yürü
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
for (let i = 0; i < 40 && g.guideStep() === 0; i++) await wait(100);
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
const walked = g.guideStep() === 1 && document.getElementById('guide-title').textContent === 'Bir kütük kır';
// Kütük envantere girince sonraki adım
g.addItem('log', 1);
for (let i = 0; i < 20 && g.guideStep() === 1; i++) await wait(100);
const log = g.guideStep() === 2;
// H gizler ve gösterir
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' }));
await wait(100);
const hidden = card.hidden && !g.settings.guide;
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyH' }));
await wait(700);
const shown = !card.hidden;
g.saveGame();
await wait(400);
return { ok: first && steps && walked && log && hidden && shown, first, steps, walked, log, hidden, shown, step: g.guideStep() };
