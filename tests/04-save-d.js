// Madde 4, aşama 4: sıfırlamadan sonra dünya yeni üretilmiş olmalı
const g = window.game;
return { ok: g.getBlock(50, 40, 50) === 0 && g.player.health === 20, note: document.getElementById('save-note').textContent };
