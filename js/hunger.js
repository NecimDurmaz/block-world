// ---------- Açlık ----------
// Açlık barı ve yemek yeme.

// Her 30 sn'de 1 (koşarken 15 sn'de 1) azalır. 18 ve üstünde can yenilenir, 0'da 4 sn'de 1 can gider (1'in altına inmez).
// 6 ve altında koşulamaz. Eldeki yemek sağ tuş 1,6 sn basılı tutulunca yenir.
const HUNGER_INTERVAL = 30, REGEN_FOOD = 18, SPRINT_FOOD = 6, STARVE_INTERVAL = 4, EAT_TIME = 1.6;
const FOOD_SHAPE = ['....##.', '...####', '..#####', '..####.', '.o###..', 'oo.....', '.o.....'];
function foodImage(fill) { // 0 boş, 1 yarım, 2 dolu
  const c = document.createElement('canvas'); c.width = c.height = 9;
  const fg = c.getContext('2d');
  const eachPixel = fn => FOOD_SHAPE.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') fn(x, y, ch); }));
  fg.fillStyle = '#1a0f08';
  eachPixel((x, y) => { for (const [ox, oy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) fg.fillRect(x + ox, y + oy, 1, 1); });
  eachPixel((x, y, ch) => {
    const filled = fill === 2 || (fill === 1 && x >= 3);
    fg.fillStyle = !filled ? '#4a3a32' : ch === 'o' ? '#ece6d6' : (x === 4 && y === 1 ? '#e0a070' : '#b5653a');
    fg.fillRect(x + 1, y + 1, 1, 1);
  });
  return c.toDataURL();
}
const FOOD_IMAGES = [0, 1, 2].map(foodImage);
const foodEls = Array.from({ length: MAX_FOOD / 2 }, () => document.getElementById('food').appendChild(document.createElement('i')));
function renderFood() {
  foodEls.forEach((el, i) => { el.style.backgroundImage = `url(${FOOD_IMAGES[Math.max(0, Math.min(2, player.food - i * 2))]})`; });
}
renderFood();
const hunger = { timer: 0, starve: 0, eating: 0 };
const heldFood = () => inventory[selected] && ITEMS[inventory[selected].key].food ? inventory[selected] : null;
function updateHunger(dt, sprintingNow) {
  // Ölümsüzlükte (/god) açlık azalmaz
  if (!godMode) hunger.timer += dt * (sprintingNow ? 2 : 1);
  if (hunger.timer >= HUNGER_INTERVAL) {
    hunger.timer = 0;
    if (player.food > 0) { player.food--; renderFood(); }
  }
  if (player.food === 0) {
    hunger.starve += dt;
    if (hunger.starve >= STARVE_INTERVAL) {
      hunger.starve = 0;
      if (player.health > 1) damagePlayer(1);
    }
  } else hunger.starve = 0;
  // Yemek yeme
  const food = heldFood();
  if (using && food && player.food < MAX_FOOD && !inventoryOpen) {
    hunger.eating += dt;
    if (punch <= 0) punch = 0.2;
    if (hunger.eating >= EAT_TIME) {
      hunger.eating = 0;
      player.food = Math.min(MAX_FOOD, player.food + ITEMS[food.key].food);
      toast(ITEMS[food.key].name + ' yendi');
      guideFlags.ate = true;
      takeFromSlot(selected, 1);
      renderFood();
    }
  } else hunger.eating = 0;
}
