// Madde 30, aşama 3: yeni dünyadan sonra ayarlar duruyor
const s = window.game.settings;
return { ok: s.sensitivity === 0.005 && s.fov === 90 && s.viewDistance === 'far' && s.invertY === true, settings: { ...s } };
