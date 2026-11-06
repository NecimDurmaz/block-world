// Madde 48: "/give" adsız yazılınca aranabilir eşya paneli açılır; tıklanan eşya envantere gelir
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
const input = document.getElementById('chat-input');
g.openChat('/give');
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
await wait(100);
const opened = !document.getElementById('picker-ui').hidden && document.getElementById('inv-title').textContent === 'Eşyalar';
const search = document.getElementById('picker-search');
const focused = document.activeElement === search;
const all = g.pickerItems().length;
// "e" yazmak paneli kapatmamalı (E envanter tuşu)
search.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', bubbles: true }));
search.value = 'elmas';
search.dispatchEvent(new Event('input'));
const found = g.pickerItems();
const filtered = found.includes('diamond') && found.includes('diamond_pickaxe') && !found.includes('stone') && found.length < all;
// Tıklama ile envantere
const slot = [...document.querySelectorAll('#picker-grid .inv-slot')].find(el => el.dataset.name === 'Elmas kazma');
slot.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }));
const pick = g.inventory.find(s => s && s.key === 'diamond_pickaxe');
const gotPick = pick?.count === 1 && pick.durability === 1562;
g.clickPicker('diamond');
g.clickPicker('cobble', true);
const gotStack = g.inventory.some(s => s && s.key === 'diamond' && s.count === 64) && g.inventory.some(s => s && s.key === 'cobble' && s.count === 1);
const stillOpen = !document.getElementById('inventory').hidden;
search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
const closed = document.getElementById('inventory').hidden;
// Adlı /give eskisi gibi
g.openChat('/give torch 5');
input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
const named = g.inventory.some(s => s && s.key === 'torch' && s.count === 5);
return { ok: opened && focused && filtered && gotPick && gotStack && stillOpen && closed && named,
  opened, focused, all, filtered, found, gotPick, gotStack, stillOpen, closed, named };
