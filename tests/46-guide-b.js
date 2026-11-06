// Madde 46, aşama 2: sayfa yenilenince kaldığı adımdan devam eder
const g = window.game;
document.getElementById('play').click();
await wait(800);
return { ok: g.guideStep() >= 2 && document.getElementById('guide-title').textContent !== 'Etrafına bak ve yürü', step: g.guideStep() };
