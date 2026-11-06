// Madde 30, aşama 2: ayarlar yenilemeden sonra korunur; "Yeni dünya" ile silinmez
const s = window.game.settings;
const kept = s.sensitivity === 0.005 && s.fov === 90 && s.viewDistance === 'far' && s.invertY === true;
const reset = document.getElementById('reset');
reset.click(); reset.click();
await wait(5000);
return { ok: false, kept, reason: 'sayfa yeniden yüklenmedi' };
