# AGENTS.md

Bu depo, tarayıcıda çalışan Minecraft tarzı bir blok oyunudur: **Blok Dünyası**. Oyunun tamamı tek bir dosyadadır: `block-world.html`. Bu dosya, bu depoda çalışan her yapay zekâ ajanı için kuralları ve çalışma düzenini anlatır.

Önce şunları oku:

1. **[SPEC.md](SPEC.md):** Oyunun şu anki hali: mimari, veri modeli, sabitler, kontroller.
2. **[minecraft-feature-list.md](minecraft-feature-list.md):** Yapılacak özelliklerin numaralı listesi. Her maddede kabul ölçütü ve bağımlılıklar var.

---

## Değişmez kurallar

### Teknik

- **Tek dosya.** Oyunun tamamı `block-world.html` içinde kalır. Build adımı, npm, bundler, ayrı JS/CSS dosyası yok.
- **Tek dış kütüphane: Three.js r128,** cdnjs'ten yüklenir: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. Yeni kütüphane ekleme, sürümü değiştirme.
- **Dış dosya yok.** Resim, model ve ses dosyası kullanılmaz. Dokular 16×16 pikselde canvas ile kodla çizilir (mevcut atlas düzenine eklenir). Sesler WebAudio API ile kodla üretilir.
- **Tarayıcı kısıtları.** Oyun hem claude.ai Artifact olarak hem de çift tıklanan yerel dosya (`file://`) olarak çalışmalı.
  - `alert()`, `confirm()` ve `prompt()` Artifact içinde çalışmaz. Onay gereken her adımı sayfanın kendi arayüzüyle yap (örnek: düğmeye ikinci kez basınca onaylanır).
  - Fare kilidi, IndexedDB ve `localStorage` reddedilebilir. Hepsini `try/catch` ile sar, reddedilince oyun yine oynanabilir kalsın.
  - Ses yalnızca kullanıcı bir yere tıkladıktan sonra başlayabilir (`AudioContext` ilk "Oyna" tıklamasında açılır).

### Dil

- **Dosya ve klasör adları İngilizce.**
- **Koddaki bütün adlar İngilizce:** değişken, fonksiyon, sabit, sınıf, CSS sınıfı ve id, IndexedDB veritabanı/depo/anahtar adları, kayıt nesnesindeki alanlar.
- **Oyuncunun gördüğü her yazı Türkçe:** paneller, düğmeler, bildirimler, blok ve eşya adları, ölüm mesajları.
- Kod yorumları ve bölüm başlıkları Türkçe olabilir, mevcut dosya öyle yazılmış.
- Türkçe sayı ve saat biçimi: `4.250`, `%78,3`, `06:30`.

### Görsel

- Arayüz rengi Elektraweb marka renklerinden gelir; dosyanın başındaki CSS değişkenlerini kullan (`--ew-primary`, `--ew-secondary`, `--ew-text` vb.). Yeni sabit renk yazma, gerekiyorsa `:root` bloğuna yeni değişken ekle.
- Oyun dünyasının renkleri (dokular, gökyüzü, canlılar) Minecraft'a benzer doğal renklerdir; marka kuralı yalnızca HUD ve panelleri kapsar.
- Emoji kullanma. Simgeler canvas ile piksel piksel çizilir (kalpler, et simgesi gibi).

### Kod düzeni

- Betik bölümlere ayrılmıştır. Her bölüm `// ---------- Başlık ----------` satırıyla başlar. Yeni kodu ilgili bölüme koy, gerekiyorsa aynı biçimde yeni bölüm aç. Bölümlerin listesi SPEC.md'de.
- Mevcut kodun üslubuna uy: kısa fonksiyonlar, `const` öncelikli, ok fonksiyonları, iki boşluk girinti, noktalı virgül.
- Gereksiz soyutlama ekleme. Bir özellik için gereken en az kodu yaz; ilgisiz kodu düzeltme ya da yeniden düzenleme.
- Yeni bir tuş eklersen başlangıç panelindeki tuş listesine (`.keys`) Türkçe açıklamasıyla ekle.

---

## Bir özellik maddesini yapma düzeni

Her madde ayrı bir iş ve ayrı bir commit'tir. Bir istekte birden çok madde verilse de her biri için bu adımları ayrı ayrı uygula.

1. **Oku.** Maddeyi, bağımlılıklarını ve SPEC.md'nin ilgili bölümünü oku. Bağımlılıklar yapılmamışsa önce onları yap ya da kullanıcıya sor.
2. **Yap.** Yalnızca o maddenin istediğini ekle. Mevcut özellikler bozulmayacak: yürüme, zıplama, koşma (W-W ve Shift), çarpışma, blok kırma/koyma, 1–9 ve tekerlekle blok seçme, V ile üç kamera, Esc ile duraklatma, fare kilitlenemeyince sürükleyerek bakma.
3. **Sözdizimini denetle.** Satır içi betiği ayıklayıp Node ile kontrol et:

   ```bash
   awk '/<script>$/{f=1;next}/<\/script>/{f=0}f' block-world.html > /tmp/block-world.js && node --check /tmp/block-world.js
   ```

4. **Tarayıcıda dene.** Klasörü yerel sunucuyla aç ve kabul ölçütünü tek tek doğrula (bkz. "Test"). Konsolda hata olmamalı.
5. **Belgeleri güncelle.**
   - SPEC.md'de değişen veya eklenen şeyleri yaz: yeni bloklar, sabitler, tuşlar, kayıt alanları, bölümler.
   - SPEC.md'deki "Özellik durumu" tablosunda maddeyi `Yapıldı` olarak işaretle.
6. **Commit at.** Biçim:

   ```
   feat(#5): canlı altyapısı ve inek

   - mobs dizisi, ortak AABB fiziği
   - inek modeli ve dolaşma yapay zekâsı
   ```

   - Başlık: `feat(#<madde no>): <maddenin kısa adı>`. Hata düzeltmesi `fix:`, yalnızca belge `docs:`.
   - Gövdede yapılanları 2–5 madde halinde yaz.
   - Commit mesajına `Co-Authored-By` satırı ekleme.
   - Uzak depoya push yapma; depo yereldir.

Bir maddenin bir kısmını bilerek yapmadıysan (örneğin tarayıcı kısıtı yüzünden), bunu hem commit gövdesine hem SPEC.md'deki tabloya not olarak yaz.

---

## Test

Oyunu yerel bir sunucuyla aç:

```bash
python3 -m http.server 8765
```

Sonra tarayıcıda `http://localhost:8765/block-world.html` adresine git.

Bilinen tuzaklar:

- **Arka plandaki sekme durur.** Tarayıcı paneli gizliyken `requestAnimationFrame` çalışmaz ya da çok yavaşlar. Bu yüzden oyun ilerlemez ve ekran görüntüsü eski kareyi gösterir. Test ederken panelin görünür olduğundan emin ol.
- **WebGL ekran görüntüsü.** Tuvali okumak için `requestAnimationFrame` içinde, oyunun kendi karesi çizildikten hemen sonra `drawImage` ile 2B bir tuvale kopyala; kare bittikten sonra okunan WebGL tuvali boş gelir.
- **Kodla girdi.** Tuşları `window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }))` ile, bakışı tuval üzerinde `mousedown` → `document` üzerinde `mousemove` (`movementX/Y`) → `mouseup` ile verebilirsin. Nişan ışını bir sonraki karede güncellenir; bakışı değiştirdikten sonra tıklamadan önce bir kare bekle.
- **macOS dosya adları büyük/küçük harfe duyarsızdır.** `Block-World.html` ile `block-world.html` aynı dosyadır. Yalnızca harf büyüklüğü farklı bir adla yazarsan asıl dosyanın üzerine yazarsın.

---

## Yayınlama

- **Artifact:** Oyun claude.ai'da bir Artifact olarak yayınlıdır. Güncellerken aynı Artifact adresine yayınla ki link değişmesin.
- **Paylaşılan dosya:** `block-world.html` tek başına çift tıklanarak açılabilen tam bir HTML belgesidir (`<!doctype html>`, `<head>`, `<body>`). Bu yapıyı koru. Three.js internetten yüklendiği için oyun internet bağlantısı ister.
