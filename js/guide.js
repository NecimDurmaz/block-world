// ---------- Rehber ----------
// Hiç Minecraft oynamamış biri için adım adım rehber: sağ üstte bir görev kartı o anki adımı ve nasıl yapılacağını anlatır.
// Adımlar oyundaki gerçek olaylarla kendiliğinden ilerler. H kartı gizler/gösterir (ayarlar ve kontrol panelinde de var).

// Oyunun başka yerlerinde işaretlenen olaylar (envanter açıldı, yemek yendi, uyunuldu, masa kondu, portal yandı)
const guideFlags = {};
const hasItem = (...keys) => keys.some(key => inventory.some(s => s && s.key === key));
let guideStart = null;
const GUIDE_STEPS = [
  { title: 'Etrafına bak ve yürü', text: 'Fareyi oynatarak etrafına bak. W ileri, S geri, A sola, D sağa yürür. Boşluk zıplatır.', hint: 'Birkaç adım yürü.',
    done: () => Math.hypot(player.x - guideStart.x, player.z - guideStart.z) > 5 },
  { title: 'Bir kütük kır', text: 'Bir ağacın gövdesine bak ve sol tuşu basılı tut. Blok çatlayıp kırılınca düşen kütüğün üstüne yürü.', hint: 'Elle de kırılır, biraz sabır.',
    done: () => hasItem('log', 'spruce_log') },
  { title: 'Envanteri aç', text: 'E tuşuna bas. Alttaki satırlar eşyaların, üstteki küçük ızgara üretim alanı.', hint: 'Kapatmak için yine E ya da Esc.',
    done: () => guideFlags.inventory },
  { title: 'Tahta yap', text: 'Envanterde kütüğe tıkla, sonra üretim ızgarasındaki bir kareye tıkla. Sağda çıkan tahtaya tıklayıp al.', hint: 'Tarifler düğmesi her eşyanın nasıl yapıldığını gösterir.',
    done: () => hasItem('planks') },
  { title: 'Çalışma masası yap ve koy', text: 'Üretim ızgarasının dört karesine birer tahta koy: çalışma masası çıkar. Hotbar\'da seçip yere bakarak sağ tıkla.', hint: '1–9 tuşları ya da tekerlek hotbar\'dan seçer.',
    done: () => guideFlags.table },
  { title: 'Tahta kazma yap', text: 'Masaya sağ tıkla: 3×3 ızgara açılır. Önce 2 tahtayı üst üste koyup çubuk yap. Kazma: üst sıraya 3 tahta, ortaya alt alta 2 çubuk.', hint: 'Takıldıysan Tarifler\'de "Tahta kazma"ya tıkla.',
    done: () => hasItem('wooden_pickaxe') },
  { title: 'Taş kaz', text: 'Kazmayı eline al ve gri taşa sol tıkla basılı tut. Taş kırılınca kırık taş düşer.', hint: 'Taş, toprağın birkaç blok altında ve dağlarda.',
    done: () => hasItem('cobble') },
  { title: 'Taş kazma yap', text: 'Çalışma masasında tahta kazmanın tarifini kırık taşla yap: üstte 3 kırık taş, ortada 2 çubuk.', hint: 'Taş aletler daha hızlı kazar ve dayanır.',
    done: () => hasItem('stone_pickaxe') },
  { title: 'Et bul ve ye', text: 'Bir ineğe, domuza ya da tavuğa vurarak et al. Eti seçip sağ tuşu basılı tut: yersin ve açlık barın dolar.', hint: 'Fırında pişmiş et daha çok doyurur.',
    done: () => guideFlags.ate },
  { title: 'Meşale yap', text: 'Kömürü üste, çubuğu alta koy: 4 meşale. Kömür taşın içindeki siyah benekli cevherden çıkar; odunu fırında yakarak da odun kömürü yapabilirsin.', hint: 'Meşalenin yanında düşman doğmaz.',
    done: () => hasItem('torch') },
  { title: 'Yatak yap ve gece uyu', text: 'Koyundan yün al. Masada üstte 3 yün, altta 3 tahta: yatak. Yatağı koy ve gece sağ tıkla.', hint: 'Uyuyunca sabah olur, doğma noktan yatak olur.',
    done: () => guideFlags.slept },
  { title: 'Kömür ve demir bul', text: 'Mağaralara in. Siyah benekli taş kömür, bej benekli taş demir cevheridir. Demir için taş kazma gerekir.', hint: 'Mağarada meşale koyarak yolunu aydınlat.',
    done: () => hasItem('coal', 'charcoal') && hasItem('iron_ore', 'iron_ingot') },
  { title: 'Fırında demir erit', text: 'Masada 8 kırık taşla (ortası boş) fırın yap ve koy. Sağ tıkla: üste demir cevheri, alta kömür koy. Çıkan külçeyi al.', hint: 'Fırın panel kapalıyken de pişirir.',
    done: () => hasItem('iron_ingot') },
  { title: 'Demir kazma ve çakmak yap', text: 'Demir kazma: üstte 3 demir külçe, ortada 2 çubuk. Çakmak: demir külçe ve kömür yan yana.', hint: 'Obsidyeni yalnızca demir (ya da elmas) kazma kırar.',
    done: () => hasItem('iron_pickaxe', 'diamond_pickaxe') && hasItem('flint_and_steel') },
  { title: 'Portal kur ve yak', text: '10 obsidyenle 4 genişliğinde, 5 yüksekliğinde bir çerçeve kur (ortası boş). Çakmakla çerçevenin içine, tabana sağ tıkla.', hint: 'Obsidyen derin mağaralarda; kovayla suyu lav kaynağına dökerek de yapabilirsin.',
    done: () => guideFlags.portal },
  { title: "Nether'e geç", text: 'Mor portalın içinde birkaç saniye dur. Nether tehlikelidir: lavdan ve ghast ateş toplarından uzak dur.', hint: 'Aynı portaldan geri dönebilirsin.',
    done: () => dimension === 'nether' },
];
let guideStep = 0, guideTimer = 0, guideDoneFlash = 0;
const guideEl = document.getElementById('guide');
function renderGuide() {
  guideEl.hidden = !settings.guide || !playing || guideStep > GUIDE_STEPS.length;
  if (guideEl.hidden) return;
  const finished = guideStep >= GUIDE_STEPS.length, step = GUIDE_STEPS[guideStep];
  document.getElementById('guide-count').textContent = finished ? 'Rehber' : `Rehber · ${guideStep + 1}/${GUIDE_STEPS.length}`;
  document.getElementById('guide-title').textContent = finished ? 'Rehber tamamlandı!' : step.title;
  document.getElementById('guide-text').textContent = finished ? 'Artık kendi maceranı yaşayabilirsin. Kontrol panelinden (K) rehberi kapatabilirsin.' : step.text;
  document.getElementById('guide-hint').textContent = finished ? '' : step.hint;
  guideEl.classList.toggle('done', guideDoneFlash > 0);
}
function updateGuide(dt) {
  guideStart ??= { x: player.x, z: player.z };
  guideDoneFlash = Math.max(0, guideDoneFlash - dt);
  guideTimer -= dt;
  if (guideTimer <= 0) {
    guideTimer = 0.5;
    // Tamamlanan adım küçük bir bildirim ve sesle geçilir (önceden yapılmış adımlar art arda geçer)
    if (guideStep < GUIDE_STEPS.length && GUIDE_STEPS[guideStep].done()) {
      toast('Tamamlandı: ' + GUIDE_STEPS[guideStep].title);
      playTone('guide', { freq: 660, endFreq: 990, duration: 0.35, type: 'triangle', volume: 0.12 });
      guideStep++;
      guideDoneFlash = 1.2;
    }
  }
  renderGuide();
}
function setGuideShown(on) {
  settings.guide = on;
  applySettings();
  saveSettings();
  renderGuide();
  return on ? 'Rehber açık' : 'Rehber kapalı (H ile aç)';
}
window.addEventListener('keydown', e => {
  if (e.code === 'KeyH' && !e.repeat && playing && !chatOpen) toast(setGuideShown(!settings.guide));
});
Object.assign(window.game, { guideSteps: GUIDE_STEPS, guideFlags, guideStep: () => guideStep, setGuideStep: n => { guideStep = n; }, setGuideShown });
