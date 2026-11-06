// Madde 3: sabah / akşam döngüsü
const { clock } = window.game;
document.getElementById('play').click();
await wait(300);
const info = () => document.getElementById('info').textContent;
const skyAt = async time => {
  clock.time = time;
  await wait(400);
  return info();
};
const startText = info();
const startsMorning = /^Gün 1 · 07:/.test(startText);
const t0 = clock.time;
await wait(2000);
const advances = clock.time > t0;
const noonText = await skyAt(0.25);
const nightText = await skyAt(0.75);
// Gün sonu: saat 1'i geçince gün sayısı artar
clock.time = 0.99999;
await wait(400);
const nextDay = clock.day === 2;
return { ok: startsMorning && advances && noonText.startsWith('Gün 1 · 12:0') && nightText.startsWith('Gün 1 · 00:0') && nextDay,
  startText, noonText, nightText, nextDay, advances };
