// ---------- Kapı ----------
// Kapı açma/kapama.

// Sağ tık kapıyı açar/kapar: iki yarı birlikte döner. Canlılar kapı açamaz.
function toggleDoor(x, y, z) {
  const def = BLOCKS[get(x, y, z)];
  const lowerY = def.part === 'lower' ? y : y - 1;
  const i = BED_DIRS.findIndex(([, d]) => d[0] === def.dir[0] && d[1] === def.dir[1]);
  for (const [cy, part] of [[lowerY, 'lower'], [lowerY + 1, 'upper']]) if (isDoor(get(x, cy, z))) set(x, cy, z, doorId(i, part, !def.open));
  rebuildAround(x, z);
}
