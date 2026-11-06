// Esc ile panel kapatma: fare hemen kilitlenmez (tarayıcı aynı Esc ile kilidi bırakıp oyunu duraklatıyordu), ilk tık kilitler
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
// Görünmez Chrome fare kilidi veremediği için kilit isteği sayılır
let locks = 0;
HTMLCanvasElement.prototype.requestPointerLock = function () { locks++; return Promise.resolve(); };
await wait(500);
// Gerçek tuş gibi sayfadan yukarı kabarcıklanır (pencerenin yakalama dinleyicisi önce çalışır)
const key = code => document.body.dispatchEvent(new KeyboardEvent('keydown', { code, key: code === 'Escape' ? 'Escape' : code.replace('Key', '').toLowerCase(), bubbles: true }));
const overlay = document.getElementById('overlay');
// Çalışma masası + Esc: kapanır, oyun duraklamaz, kilit istenmez
g.openInventory(3);
await wait(600);
fallbackLook = false;
key('Escape');
const closedByEsc = document.getElementById('inventory').hidden && overlay.hidden && locks === 0;
// İlk tık yalnızca kilitler, kazmaz
const canvas = document.querySelector('#game canvas');
canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }));
const clickLocks = locks === 1 && !g.mining.key;
// E ile açıp E ile kapatınca hemen kilitlenir
await wait(600);
key('KeyE'); await wait(100); key('KeyE');
const eRelocks = locks === 2;
// Kontrol paneli Esc ile: aynı davranış; sonraki Esc oyunu duraklatır
await wait(600);
key('KeyK'); await wait(100); key('Escape');
const panelEsc = !g.isControlOpen() && overlay.hidden && locks === 2;
await wait(100);
key('Escape');
const secondEscPauses = !overlay.hidden;
return { ok: closedByEsc && clickLocks && eRelocks && panelEsc && secondEscPauses, closedByEsc, clickLocks, eRelocks, panelEsc, secondEscPauses, locks };
