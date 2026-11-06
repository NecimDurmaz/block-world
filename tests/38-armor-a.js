// Madde 38, aşama 1: zırh tarifi, yalnızca kendi yuvasına, hasar azaltma, dayanıklılık, HUD ve model
const g = window.game, p = g.player;
document.getElementById('play').click();
window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyV' }));
for (let i = 0; i < 100 && !p.onGround; i++) await wait(50);
g.clock.time = 0.25;
const has = out => g.recipes.some(r => r.out[0] === out);
const recipes = ['iron_helmet', 'iron_chestplate', 'iron_leggings', 'iron_boots', 'diamond_helmet', 'diamond_chestplate', 'diamond_leggings', 'diamond_boots'].every(has);
const I = g.items;
const points = I.iron_helmet.armor + I.iron_chestplate.armor + I.iron_leggings.armor + I.iron_boots.armor === 15
  && I.diamond_helmet.armor + I.diamond_chestplate.armor + I.diamond_leggings.armor + I.diamond_boots.armor === 20;
// Göğüslük kask yuvasına konamaz, kendi yuvasına konur
g.openInventory();
const slotsShown = !document.getElementById('armor-ui').hidden;
g.inventory.fill(null);
g.inventory[0] = { key: 'iron_chestplate', count: 1, durability: 165 };
g.clickSlot(0); g.clickArmor(0);
const wrongSlot = !g.armor[0];
g.clickArmor(1);
const worn = g.armor[1]?.key === 'iron_chestplate';
g.closeInventory();
document.getElementById('play').click();
await wait(100);
const hud = getComputedStyle(document.getElementById('armor-bar')).visibility === 'visible' && g.armorPoints() === 6;
const model = g.armorMeshes[1].every(m => m.visible) && !g.armorMeshes[0][0].visible;
// Zombi hasarı (3) 6 puanla 3 × 0,76 ≈ 2; düşme hasarı azalmaz
p.health = 20;
g.damagePlayer(3, p.x + 1, p.z);
const reduced = p.health === 18;
await wait(1500);
g.damagePlayer(4);
const fallFull = p.health === 14; const dbg = [p.health, g.armor[1]?.durability];
const wear = g.armor[1].durability === 163;
// Kırılma
g.armor[1].durability = 1;
await wait(1500);
g.damagePlayer(1);
const breaks = !g.armor[1];
g.armor[1] = { key: 'diamond_chestplate', count: 1, durability: 363 };
g.armor[3] = { key: 'iron_boots', count: 1, durability: 100 };
p.health = 20;
g.saveGame();
await wait(400);
return { ok: recipes && points && slotsShown && wrongSlot && worn && hud && model && reduced && fallFull && wear && breaks,
  dbg, recipes, points, slotsShown, wrongSlot, worn, hud, model, reduced, fallFull, wear, breaks, health: p.health };
