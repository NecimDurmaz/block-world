// Madde 28, aşama 2: ses kapalı ayarı kayıttan geri gelir
const g = window.game;
return { ok: !g.isSoundOn() && document.getElementById('sound-toggle').textContent === 'Ses: kapalı' };
