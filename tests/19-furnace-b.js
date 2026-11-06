// Madde 19, aşama 2: fırın içeriği kayıttan geri gelir
const f = window.game.furnaces['overworld:40,40,42'];
return { ok: !!f && f.slots[0]?.key === 'raw_pork' && f.slots[2]?.key === 'cooked_beef', slots: f && f.slots };
