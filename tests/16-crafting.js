// Madde 16: kütükten tahta, tahtadan çalışma masası; masaya sağ tıkla 3x3 ızgara
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const slotOf = key => g.inventory.findIndex(s => s && s.key === key);
g.addItem('log', 1);
g.openInventory();
const smallGrid = document.querySelectorAll('#craft-grid .inv-slot:not([hidden])').length;
g.clickSlot(slotOf('log'));   // kütüğü al
g.clickCraft(0);              // ızgaraya koy
const resultShown = getComputedStyle(document.getElementById('craft-result')).backgroundImage.includes('url');
g.clickResult();              // 4 tahta ele gelir
g.clickSlot(20);              // çantaya bırak
const planks = g.inventory[20]?.key === 'planks' && g.inventory[20].count === 4 && !g.craftGrid[0];
// 2x2 tahta -> çalışma masası (sağ tıkla birer birer dağıt)
g.clickSlot(20);
for (const i of [0, 1, 3, 4]) g.clickCraft(i, true);
g.clickResult();
g.clickSlot(0);               // hotbar 1. yuvaya
const table = g.inventory[0]?.key === 'crafting_table';
// Tek tahta 2 dikey -> çubuk (yanlış desen sonuç vermez)
g.addItem('planks', 2);
g.clickSlot(slotOf('planks'));
g.clickCraft(0, true);
g.clickCraft(1, true);        // yatay: tarif yok
const noRecipe = !document.getElementById('craft-result').style.backgroundImage.includes('url');
g.closeInventory();
const returned = g.craftGrid.every(c => !c) && g.inventory.some(s => s && s.key === 'planks' && s.count === 2);

// Masayı yere koy ve sağ tıkla
for (let x = 30; x < 50; x++) for (let z = 30; z < 50; z++) g.setBlock(x, 39, z, 3);
Object.assign(p, { x: 40.5, y: 40, z: 44.5, yaw: 0, pitch: -0.45, vx: 0, vz: 0 });
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1' }));
await wait(400);
const canvas = document.querySelector('#game canvas');
const right = () => { canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); window.dispatchEvent(new MouseEvent('mouseup', { button: 2 })); };
right();
await wait(300);
let placed = false;
for (let z = 38; z < 45; z++) for (let y = 40; y < 42; y++) if (g.getBlock(40, y, z) === 10) placed = true;
right();
await wait(200);
const bigGrid = !document.getElementById('inventory').hidden && document.getElementById('inv-title').textContent === 'Çalışma masası'
  && document.querySelectorAll('#craft-grid .inv-slot:not([hidden])').length === 9;
return { ok: smallGrid === 4 && resultShown && planks && table && noRecipe && returned && placed && bigGrid,
  smallGrid, resultShown, planks, table, noRecipe, returned, placed, bigGrid };
