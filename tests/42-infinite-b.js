// Madde 42, aşama 2: sayfa yenilenince uzaktaki değişiklik korunuyor; kayıt yalnızca değişen chunk'ları tutuyor
const g = window.game;
const { fy } = JSON.parse(localStorage.getItem('test42'));
const kept = g.modifiedChunks.overworld.has('27,3') && g.getBlock(440, fy, 50) === 0;
// Değişmeyen uzak chunk kayıtta yok: açılışta bellekte değil
const notSaved = !g.worlds.overworld.has('28,3');
return { ok: kept && notSaved, kept, notSaved, modified: g.modifiedChunks.overworld.size };
