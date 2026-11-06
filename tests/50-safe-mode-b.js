// Madde 50, aşama 2: güvenli mod kayıttan geri gelir ve menüde yazar
const g = window.game;
const note = document.getElementById('safe-note');
return { ok: g.isSafe() && !note.hidden, safe: g.isSafe(), note: !note.hidden };
