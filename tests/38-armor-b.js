// Madde 38, aşama 2: giyili zırh kayıttan geri gelir
const g = window.game;
const a = g.armor;
return { ok: a[1]?.key === 'diamond_chestplate' && a[3]?.durability === 100 && g.armorPoints() === 10, armor: a };
