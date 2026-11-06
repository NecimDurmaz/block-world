// Madde 47: tarif kitabı; bütün üretilebilir eşyalar, demir kazma tarifi, tek tıkla ızgaraya dizme, fırın sekmesi, arama
const g = window.game, p = g.player;
document.getElementById('play').click();
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.openInventory(3);
document.getElementById('book-toggle').click();
const opened = !document.getElementById('recipe-book').hidden;
const outputs = [...new Set(g.recipes.map(r => r.out[0]))].length;
const all = g.bookItems().length === outputs;
// Demir kazma: üstte 3 demir külçe, ortada 2 çubuk
g.selectRecipe('iron_pickaxe');
const cells = [...document.querySelectorAll('#book-pattern .inv-slot')].map(el => el.dataset.name);
const pattern = cells.slice(0, 3).every(n => n === 'Demir külçe') && cells[4] === 'Çubuk' && cells[7] === 'Çubuk' && !cells[3] && !cells[5];
const noteMissing = document.getElementById('book-note').textContent.includes('Eksik');
// Malzemeler varken tek tıkla ızgaraya
g.inventory.fill(null);
g.addItem('iron_ingot', 3); g.addItem('stick', 5);
g.selectRecipe('iron_pickaxe');
document.getElementById('book-fill').click();
const grid = g.craftGrid.map(s => s && s.key);
const filled = grid[0] === 'iron_ingot' && grid[1] === 'iron_ingot' && grid[2] === 'iron_ingot' && grid[4] === 'stick' && grid[7] === 'stick';
const resultName = document.querySelector('#craft-result').dataset.name === 'Demir kazma';
const leftover = g.inventory.some(s => s && s.key === 'stick' && s.count === 3);
// 2×2 envanterde 3×3 tarif dizilmez
g.closeInventory();
g.openInventory(2);
g.selectRecipe('iron_pickaxe');
const refused = !g.fillRecipe();
// Fırın sekmesi ve arama
g.setBookTab('smelt');
const smelt = g.bookItems().includes('Cam') && g.bookItems().includes('Demir külçe');
g.setBookTab('craft');
const search = document.getElementById('book-search');
search.value = 'kazma'; search.dispatchEvent(new Event('input'));
const found = g.bookItems();
const searched = found.length >= 4 && found.every(n => n.toLocaleLowerCase('tr').includes('kazma'));
g.closeInventory();
return { ok: opened && all && pattern && noteMissing && filled && resultName && leftover && refused && smelt && searched,
  opened, all, outputs, pattern, noteMissing, filled, resultName, leftover, refused, smelt, searched };
