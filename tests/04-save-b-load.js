// Madde 4, aşama 2: yeniden yüklenince kayıt geri gelmeli
const g = window.game;
const activeSlot = [...document.querySelectorAll('#hotbar .slot')].findIndex(s => s.classList.contains('active'));
const r = {
  brick: g.getBlock(50, 40, 50) === 8,
  health: g.player.health === 13,
  time: Math.abs(g.clock.time - 0.4) < 0.01,
  slot: activeSlot === 3,
  note: document.getElementById('save-note').textContent,
};
return { ok: r.brick && r.health && r.time && r.slot && r.note.startsWith('Kayıt yüklendi'), ...r, x: g.player.x };
