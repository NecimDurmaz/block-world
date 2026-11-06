# Blok Dünyası: teknik şartname

Bu belge oyunun **şu anki** halini anlatır. Bir özellik eklendiğinde ya da bir şey değiştiğinde bu belge de aynı commit'te güncellenir. Yapılacaklar [minecraft-feature-list.md](minecraft-feature-list.md) dosyasındadır; çalışma kuralları [AGENTS.md](AGENTS.md) dosyasındadır.

## Özet

| | |
| --- | --- |
| Tür | Tarayıcıda oynanan, Minecraft'tan esinlenen tek oyunculu blok oyunu |
| Dosya | `block-world.html` (tek dosya) |
| Teknoloji | Düz HTML + CSS + JavaScript, Three.js r128 (cdnjs) |
| Arayüz dili | Türkçe |
| Kod dili | İngilizce adlar, Türkçe yorumlar |
| Platform | Masaüstü tarayıcı, klavye + fare. Telefon desteklenmiyor. |
| Çalışma biçimi | claude.ai Artifact ya da çift tıklanan yerel dosya. İnternet gerekir (Three.js). |

---

## Dosya yapısı

`block-world.html` sırasıyla şunları içerir:

1. `<head>`: başlık, Roboto (Google Fonts), tüm CSS. CSS değişkenleri `:root` bloğundadır. `[hidden] { display: none !important; }` kuralı, `display` verilmiş panellerin `hidden` ile gizlenebilmesi için gereklidir; silme.
2. `<body>` içinde HUD öğeleri:

   | id | Görevi |
   | --- | --- |
   | `game` | WebGL tuvalinin yerleştiği kap |
   | `crosshair` | Ekran ortasındaki artı işareti (önden kamerada gizlenir) |
   | `info` | Sol üstte gün, saat ve konum: `Gün 1 · 07:12 · X 48 · Y 13 · Z 48` |
   | `blockname` | Hotbar üstünde 1,5 sn görünen bildirim (blok adı, kamera adı) |
   | `hotbar` | 9 yuvalı blok çubuğu |
   | `status` / `hearts` | Hotbar'ın üstünde, solda 10 kalp. Genişliği hotbar'la aynıdır. |
   | `hurt` | Hasar alınca 0,2 sn yanan kırmızı ekran kenarı |
   | `death` | "Öldün!" paneli ve "Yeniden doğ" düğmesi (`#respawn`) |
   | `overlay` | Başlangıç / duraklatma paneli, tuş listesi (`.keys`) ve "Oyna" düğmesi (`#play`) |

3. Three.js r128 betiği.
4. Oyunun betiği: tek bir kendini çağıran fonksiyon `(() => { ... })()`. Bölümleri:

   | Bölüm başlığı | İçerik |
   | --- | --- |
   | Dokular | 16×16 piksellik doku atlası, `TILE` sabitleri, `tileImage()` |
   | Bloklar | `BLOCKS` tanımları, `B` kısaltmaları, `HOTBAR` sırası |
   | Dünya üretimi | Dünya dizisi, `get/set`, gürültü fonksiyonları, arazi ve ağaçlar |
   | Three.js sahnesi | Renderer, sahne, kamera, ışıklar (`lightRigs`), kol sahnesi, chunk mesh'leri, seçim çerçevesi |
   | Gün döngüsü | `clock`, `daylight()`, `clockText()`, `updateDayCycle()`, güneş ve ay |
   | Oyuncu modeli | Bloklu insan modeli ve gözden görünümdeki kol |
   | Oyuncu ve fizik | Oyuncu durumu, `spawn()`, AABB çarpışma |
   | Girdi | Klavye, fare, fare kilidi, kamera değiştirme, koşma |
   | Blok kırma / koyma | Nişan ışını (`aim`), `raycast()`, `breakBlock()`, `placeBlock()` |
   | HUD | Hotbar yuvaları, `toast()`, `selectSlot()` |
   | Can | Kalp çizimi, `renderHearts()`, `damagePlayer()`, `updateHealth()`, `die()`, yeniden doğma |
   | Oyun döngüsü | `frame()`: hareket, fizik, kamera, animasyon, çizim |

---

## Dünya

- **Boyut:** `SX × SY × SZ = 96 × 48 × 96` blok. Sınırlı dünya; kenarlar görünmez duvardır (oyuncu dışarı çıkamaz).
- **Veri:** `world = Uint8Array(SX * SY * SZ)`, indeks `(y * SZ + z) * SX + x`. Değer blok kimliğidir, `0` hava.
- **Erişim:** `get(x, y, z)` dünya dışında hava döndürür, `y < 0` için taş döndürür (altta delik görünmesin diye). `set(x, y, z, id)` dünya dışını yok sayar.
- **Tohum:** `SEED = 20261106`, sabit. Her açılışta aynı dünya üretilir.
- **Arazi:** 4 oktavlı değer gürültüsü (`fbm`) ile yükseklik haritası, `h = 6 + fbm^1.4 * 34`.
  - `h ≤ 14`: üstte 3 blok kum, altı taş.
  - Diğerleri: üstte çimen, altında 3 blok toprak, en altta taş.
- **Ağaçlar:** 160 deneme; yalnızca çimen üstüne. 4–5 blok kütük, üstünde yaprak kümesi.
- **Doğma noktası:** Dünyanın ortası, sütunun en üstü. (Bilinen sorun: ortada bir çukura denk gelebiliyor.)

### Bloklar

| Kimlik | Sabit (`B.`) | Ad (arayüz) | Üst / yan / alt doku |
| --- | --- | --- | --- |
| 0 | — | Hava | — |
| 1 | `grass` | Çimen | `grassTop` / `grassSide` / `dirt` |
| 2 | `dirt` | Toprak | `dirt` |
| 3 | `stone` | Taş | `stone` |
| 4 | `log` | Kütük | `logTop` / `logSide` / `logTop` |
| 5 | `leaves` | Yaprak | `leaves` |
| 6 | `sand` | Kum | `sand` |
| 7 | `planks` | Tahta | `planks` |
| 8 | `brick` | Tuğla | `brick` |
| 9 | `cobble` | Kırık taş | `cobble` |

Bütün bloklar katı ve opaktır. `y = 0` katmanı kırılamaz.

**Hotbar sırası (1–9):** Çimen, Toprak, Taş, Kırık taş, Tahta, Kütük, Tuğla, Kum, Yaprak. Bloklar sınırsızdır.

### Dokular

- Tek satırlık atlas: `T = 16` piksel kare, `N_TILES = 11` doku, atlas `176 × 16` piksel.
- `TILE` sırası: `grassTop, grassSide, dirt, stone, logSide, logTop, leaves, sand, planks, brick, cobble`.
- Yeni doku eklerken `N_TILES` artırılır, `TILE`'a eklenir, çizim kodu aynı bölüme yazılır.
- Dokular `mulberry32(1337)` ile her açılışta aynı üretilir. Filtre `NearestFilter`, mipmap yok.

---

## Çizim

- **Chunk:** `16 × SY × 16` blokluk dilimler (`CH = 16`), toplam 36 mesh. Her mesh yalnızca havaya bakan yüzleri içerir.
- **Yüz gölgesi:** Işık hesabı yok, köşe rengiyle sabit gölge: üst 1,0, doğu/batı 0,8, kuzey/güney 0,65, alt 0,5.
- **Malzeme:** `MeshBasicMaterial`, atlas dokusu + köşe renkleri.
- **Yeniden kurma:** Blok değişince `rebuildAround(x, z)` o chunk'ı ve gerekiyorsa komşusunu yeniden kurar.
- **Gökyüzü:** Rengi gün döngüsüne göre değişir (aşağıda); sis aynı renktedir (30–70 blok).
- **İki geçişli çizim:** `renderer.autoClear = false`. Önce dünya sahnesi, sonra gözden görünümde derinlik temizlenip kol sahnesi (`fpScene`, `fpCam`) çizilir; böylece kol duvarın içine girmez.
- **Işıklar:** Dünya ışıksızdır. Oyuncu modeli ve kol için `HemisphereLight` (`HEMI_INTENSITY = 0.8`) + `DirectionalLight` (`SUN_INTENSITY = 0.5`), `addLights()` ile iki sahneye de eklenir ve `lightRigs` dizisinde tutulur.

### Gün döngüsü

- Bir gün `DAY_LENGTH = 600` sn. `clock.time` 0–1 arasıdır ve yalnızca oyun oynanırken ilerler; 1'i geçince `clock.day` bir artar. Oyun `clock.time = 0.05` (07:12) ile başlar.

  | `clock.time` | Evre | Süre |
  | --- | --- | --- |
  | 0–0,5 | Gündüz | 5 dk |
  | 0,5–0,55 | Akşam geçişi (`DUSK`) | 30 sn |
  | 0,55–0,95 | Gece | 4 dk |
  | 0,95–1 | Şafak geçişi (`DAWN`) | 30 sn |

- **Saat:** `(6 + time × 24) mod 24`; 0 → 06:00, 0,25 → 12:00, 0,5 → 18:00, 0,75 → 00:00.
- **`daylight(t)`:** gündüz 1, gece 0, geçişlerde yumuşak (smoothstep).
- **Gökyüzü ve sis rengi:** gece `#0b1026` ile gündüz `#9cc8ef` arasında `daylight` oranında karışır; geçişlerin ortasında `#e8a36a` turuncusuna doğru %60'a kadar kayar.
- **Parlaklık:** `0.25 + 0.75 × daylight`. Blok malzemesinin rengi (`material.color`) ve iki sahnedeki ışık şiddetleri bu çarpanla ölçeklenir.
- **Güneş ve ay:** Sisten etkilenmeyen kare düzlemler (güneş 16, ay 11 birim), kameradan 150 blok uzakta ve her zaman kameraya dönük. Güneş `t = 0`'da doğuda (+x) doğar, 0,25'te tepede, 0,5'te batıda batar; ay tam karşısındadır.

---

## Oyuncu

### Fizik

| Sabit | Değer | Anlamı |
| --- | --- | --- |
| `W` | 0,3 | AABB yarı genişliği (blok) |
| `H` | 1,8 | Boy |
| `EYE` | 1,62 | Göz yüksekliği |
| `GRAVITY` | 26 | Yerçekimi (blok/sn²) |
| `JUMP` | 8,4 | Zıplama hızı (yaklaşık 1,3 blok) |
| Yürüme | 4,3 | blok/sn |
| Koşma | 6,2 | blok/sn |

- Çarpışma eksen eksen yapılır (`moveAxis`): önce x, sonra z, sonra y. Adım 0,4 bloktan büyükse alt adımlara bölünür. Kare süresi 0 ile 0,05 sn arasına sıkıştırılır.
- **Geri itilme:** `player.kx`, `player.kz` hıza eklenir ve her karede `e^(-6·dt)` ile söner.

### Can

- `player.health`, en fazla `MAX_HEALTH = 20`. HUD'da 10 kalp; her kalp 2 puan (dolu, yarım, boş). Kalpler 9×9 piksellik canvas görselleridir.
- `damagePlayer(amount, sourceX, sourceZ)`: canı düşürür, 0,5 sn hasarsızlık verir, ekran kenarını 0,2 sn kırmızı yakar. Kaynak verilirse oyuncuyu kaynaktan uzağa 4 blok/sn iter ve 6 blok/sn yukarı zıplatır; kaynak verilmezse (düşme gibi) itmez. Konsoldan test için `window.damagePlayer` olarak da açıktır.
- **Yenilenme:** Can 20'den azsa ve son 5 sn hasar alınmadıysa, oyun duraklatılmamışken her 4 sn'de 1 puan geri gelir.
- **Düşme hasarı:** Havadayken ulaşılan en yüksek y `player.fallPeak` içinde tutulur. Yere değince düşülen yükseklik 3,5 bloğu aşıyorsa `round(yükseklik - 3)` hasar verilir: 4 blok 1 can, 10 blok 7 can.
- **Ölüm:** Can 0 olunca ya da `y < -20` olunca `die()` çalışır: oyun durur, fare kilidi bırakılır, "Öldün!" paneli açılır (başlangıç paneli gizli kalır). "Yeniden doğ" oyuncuyu `spawn()` noktasında 20 canla başlatır.

### Kontroller

| Tuş | İş |
| --- | --- |
| W A S D | Yürü |
| Fare | Bak (fare kilidiyle). Kilit reddedilirse sol tuşla sürükleyerek bak. |
| Boşluk | Zıpla |
| W-W (300 ms içinde iki kez) / Shift | Koş. W bırakılınca koşma biter. Koşarken görüş alanı 75° → 85°. |
| Sol tık | Bloğu kır (yedek modda: sürüklemeden kısa tık) |
| Sağ tık | Blok koy |
| 1–9 / tekerlek | Blok seç |
| V | Kamera: arkadan → gözden → önden |
| Esc | Duraklat (fare kilidi bırakılınca panel açılır) |

### Kamera

- **Arkadan (varsayılan):** Gözden 4 blok geride, bakış doğrultusunda. Arada blok varsa yaklaşır (en az 0,3 blok). Nişan ışını kameradan başlar, menzil `6 + uzaklık`.
- **Gözden:** Göz hizasında, sağ altta oyuncunun kolu. Nişan ışını gözden başlar, menzil 6.
- **Önden:** Oyuncunun önünde, oyuncuya bakar. Artı işareti gizlenir; nişan ışını gözden başlar.

### Model

- Bloklu insan: 1 piksel = `P = 0.05625` blok, toplam 32 piksel = 1,8 blok. Baş 8×8×8, gövde 8×12×4, kollar ve bacaklar 4×12×4.
- Renkler: ten `#c99a76`, saç `#4a3222`, tişört `#40598e`, pantolon `#393f4f`, ayakkabı `#212121`.
- Animasyon: yürürken kollar ve bacaklar ters fazda sallanır, baş bakışla eğilir, kırma/koymada sağ kol vurur (0,25 sn).

---

## Test kancası

Konsoldan ve testlerden erişim için `window.game = { player, damagePlayer, clock }` açıktır. Yeni sistemler test gerektiriyorsa buraya eklenir.

## Kayıt

Henüz yok. Sayfa yenilenince dünya baştan üretilir.

---

## Özellik durumu

Numaralar [minecraft-feature-list.md](minecraft-feature-list.md) ile aynıdır.

| # | Özellik | Durum |
| --- | --- | --- |
| — | Temel oyun: arazi, ağaçlar, yürüme, kırma/koyma, hotbar | Yapıldı |
| — | Oyuncu modeli, üç kamera, gözden kol, W-W koşma | Yapıldı |
| 1 | Can barı | Yapıldı |
| 2 | Düşme hasarı, ölüm ve yeniden doğma | Yapıldı |
| 3 | Sabah / akşam döngüsü | Yapıldı |
| 4 | İlerlemeyi IndexedDB'ye kaydetme | Yapılmadı |
| 5 | Canlı altyapısı ve inek | Yapılmadı |
| 6 | Domuz, tavuk ve koyun | Yapılmadı |
| 7 | Canlılara vurma | Yapılmadı |
| 8 | Zombi | Yapılmadı |
| 9 | İskelet | Yapılmadı |
| 10 | Örümcek | Yapılmadı |
| 11 | Creeper | Yapılmadı |
| 12 | Düşmanların gün ışığında yanması | Yapılmadı |
| 13 | Eşya düşmesi ve toplama | Yapılmadı |
| 14 | Sınırlı hotbar ve envanter ekranı | Yapılmadı |
| 15 | Blok kırma süresi ve çatlama | Yapılmadı |
| 16 | Üretim ve çalışma masası | Yapılmadı |
| 17 | Aletler | Yapılmadı |
| 18 | Açlık barı ve yemek | Yapılmadı |
| 19 | Fırın ve pişirme | Yapılmadı |
| 20 | Maden cevherleri | Yapılmadı |
| 21 | Su | Yapılmadı |
| 22 | Meşale ve basit ışık | Yapılmadı |
| 23 | Yatak | Yapılmadı |
| 24 | Kapı ve cam | Yapılmadı |
| 25 | Çiçek, uzun ot ve süs bitkileri | Yapılmadı |
| 26 | Buğday tarımı ve ekmek | Yapılmadı |
| 27 | Mağaralar | Yapılmadı |
| 28 | Ses efektleri | Yapılmadı |
| 29 | Kırılma parçacıkları | Yapılmadı |
| 30 | Duraklat menüsü ve ayarlar | Yapılmadı |
| 31 | Bulutlar ve yıldızlar | Yapılmadı |
| 32 | Hasar ve ölüm geri bildirimleri | Yapılmadı |
| 33 | Obsidyen ve Nether portalı | Yapılmadı |
| 34 | Nether boyutu | Yapılmadı |
| 35 | Nether yaratıkları | Yapılmadı |
| 36 | Sandık | Yapılmadı |
| 37 | Elmas, demir ve elmas aletler | Yapılmadı |
| 38 | Zırh | Yapılmadı |
| 39 | Yay ve ok | Yapılmadı |
| 40 | Kova, akan su ve lav | Yapılmadı |
| 41 | Biyomlar | Yapılmadı |
| 42 | Sonsuz dünya | Yapılmadı |
| 43 | Köyler ve köylü ticareti | Yapılmadı |
| 44 | Nether kalesi ve blaze | Yapılmadı |
