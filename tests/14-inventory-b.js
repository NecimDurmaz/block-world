// Madde 14, aşama 2: sayfa yenilenince envanter yerinde
const g = window.game;
const kept = g.inventory[12]?.key === 'dirt' && g.inventory[12].count === 2 && g.inventory[13]?.count === 2;
return { ok: kept, slot12: g.inventory[12], slot13: g.inventory[13] };
