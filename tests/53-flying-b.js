// Madde 53, aşama 2: uçma izni kayıttan geri gelir
const g = window.game;
return { ok: g.isFlyAllowed() && !g.isFlying(), allowed: g.isFlyAllowed() };
