# Blok Dünyası: teknik şartname

Bu belge oyunun **şu anki** halini anlatır. Bir özellik eklendiğinde ya da bir şey değiştiğinde bu belge de aynı commit'te güncellenir. Yapılacaklar [minecraft-feature-list.md](minecraft-feature-list.md) dosyasındadır; çalışma kuralları [AGENTS.md](AGENTS.md) dosyasındadır.

## Özet

| | |
| --- | --- |
| Tür | Tarayıcıda oynanan, Minecraft'tan esinlenen tek oyunculu blok oyunu |
| Dosyalar | `index.html` (sayfa iskeleti), `css/style.css`, `js/*.js` (29 betik, sırayla yüklenir) |
| Teknoloji | Düz HTML + CSS + JavaScript, Three.js r128 (cdnjs) |
| Arayüz dili | Türkçe |
| Kod dili | İngilizce adlar, Türkçe yorumlar |
| Platform | Masaüstü tarayıcı, klavye + fare. Telefon desteklenmiyor. |
| Çalışma biçimi | claude.ai Artifact ya da çift tıklanan yerel dosya. İnternet gerekir (Three.js). |

---

## Dosya yapısı

```
index.html          sayfa iskeleti: HUD ve panel öğeleri, betiklerin yükleme sırası
css/style.css       bütün stiller
js/*.js             oyun betikleri (aşağıdaki sırayla)
tools/              test araçları (oyunun parçası değil)
tests/              otomatik testler
```

- **`css/style.css`:** CSS değişkenleri `:root` bloğundadır. `[hidden] { display: none !important; }` kuralı, `display` verilmiş panellerin `hidden` ile gizlenebilmesi için gereklidir; silme.
- **`index.html`:** `<head>`'de başlık, Roboto (Google Fonts) ve `css/style.css`. `<body>` içinde HUD öğeleri:

   | id | Görevi |
   | --- | --- |
   | `game` | WebGL tuvalinin yerleştiği kap |
   | `crosshair` | Ekran ortasındaki artı işareti (önden kamerada gizlenir) |
   | `info` | Sol üstte gün, saat ve konum: `Gün 1 · 07:12 · X 48 · Y 13 · Z 48` |
   | `blockname` | Hotbar üstünde 1,5 sn görünen bildirim (blok adı, kamera adı) |
   | `hotbar` | 9 yuvalı hotbar: eşya simgesi, sol üstte yuva numarası, sağ altta adet |
   | `status` / `hearts` / `food` | Hotbar'ın üstünde, solda 10 kalp, sağda 10 but (açlık; soldan boşalır). Genişliği hotbar'la aynıdır. |
   | `sleep` | Uyurken ekranı karartan katman |
   | `underwater` | Kamera suyun içindeyken ekranı mavi tonlayan katman |
   | `hurt` | Hasar alınca 0,2 sn yanan kırmızı ekran kenarı |
   | `inventory` | E ile açılan envanter paneli: başlık (`#inv-title`), fırın bölümü (`#furnace-ui`: girdi, alev göstergesi, yakıt, ilerleme çubuğu, çıktı), üretim bölümü (`#craft-ui`: `#craft-grid` ve `#craft-result`), çanta (`#inv-bag`, 27 yuva), hotbar satırı (`#inv-hotbar`) |
   | `held` | Envanterde farenin tuttuğu yığın, imleci izler |
   | `death` | "Öldün!" paneli ve "Yeniden doğ" düğmesi (`#respawn`) |
   | `overlay` | Başlangıç / duraklatma menüsü. `#menu-main`: tuş listesi (`.keys`), "Oyna" / oyun başladıktan sonra "Devam et" (`#play`, kayıt okunana kadar pasif), "Ayarlar" (`#open-settings`), "Kaydet" (`#save-now`, oyun başladıktan sonra), "Yeni dünya" (`#reset`, kırmızı), kayıt durumu (`#save-note`). `#menu-settings`: ayar denetimleri ve "Geri" |
   | `saved` | Kayıttan sonra sağ üstte 1 sn görünen "Kaydedildi" yazısı |

- **Betikler:** `<body>` sonunda önce Three.js r128, sonra `js/` altındaki oyun betikleri bu sırayla yüklenir. Bunlar ES modülü değil, klasik betiklerdir: her dosyanın üst düzey `const`/`let`/`function` tanımları bütün betiklerin paylaştığı genel kapsamdadır. Bu sayede oyun `file://` üzerinden (çift tıklayarak) da açılır.

   | Dosya | İçerik |
   | --- | --- |
   | `textures.js` | 16×16 piksellik doku atlası, `TILE` sabitleri, `tileImage()` |
   | `blocks.js` | `BLOCKS` tanımları, `B` kısaltmaları |
   | `world-gen.js` | Dünya dizisi, `get/set`, gürültü fonksiyonları, arazi ve ağaçlar |
   | `renderer.js` | Renderer, sahne, kamera, ışıklar (`lightRigs`), kol sahnesi, chunk mesh'leri, seçim çerçevesi |
   | `day-cycle.js` | `clock`, `daylight()`, `clockText()`, `updateDayCycle()`, güneş ve ay |
   | `player-model.js` | `paint()`, `buildHumanoid()` (oyuncu, zombi, iskelet ortak), oyuncu modeli ve gözden görünümdeki kol |
   | `physics.js` | Oyuncu durumu, `spawn()`, ortak AABB fiziği: `collides()`, `moveAxis()`, `stepEntity()` |
   | `input.js` | Klavye, fare, fare kilidi, kamera değiştirme, koşma |
   | `block-interaction.js` | Nişan ışını (`aim`), `raycast()`, `targetedMob()`, `attackMob()`, `breakBlockAt()`, çatlak dokuları, `updateMining()`, `placeBlock()` |
   | `hud.js` | Hotbar yuvaları (`HOTBAR_SIZE = 9`), `toast()`, `selectSlot()` |
   | `health.js` | Kalp çizimi, `renderHearts()`, `damagePlayer()`, `updateHealth()`, `die()`, yeniden doğma |
   | `crops.js` | `crops`, `plantCrop()`, `scanCrops()`, `updateCrops()` |
   | `doors.js` | `toggleDoor()` |
   | `bed.js` | `setSpawnNearBed()`, `useBed()`, `updateSleep()` |
   | `hunger.js` | `FOOD_SHAPE`, `renderFood()`, `hunger`, `heldFood()`, `updateHunger()` (azalma, açlıktan hasar, yemek yeme) |
   | `mob-models.js` | `box()`/`pivot()` model yardımcıları; hayvan, zombi, iskelet, örümcek ve creeper modelleri |
   | `mobs.js` | `MOB_TYPES`, `mobs`, `spawnMob()`, `removeMob()`, `rayMob()`, `hurtMob()`, hayvan ve düşman doğurma, `canSeePlayer()`, `skyAbove()`, yanma parçacıkları (`particles`), `explode()`, `updateMob()`, `renderMob()` |
   | `arrows.js` | `projectiles`, `arrowMesh()`, `shootArrow()`, `updateProjectiles()` |
   | `items.js` | `ITEMS`, `BLOCK_ITEM`, eşya simgeleri (`ITEM_ART`, `itemIcon()`), `MOB_DROPS`, yerdeki eşyalar (`drops`, `dropItem()`, `updateDrops()`), toplama |
   | `debris.js` | Kırılma parçacıkları: `debris`, `spawnDebris()`, `updateDebris()` |
   | `inventory.js` | `inventory`, `maxStack()`, `addItem()`, `takeFromSlot()`, `throwSelected()`, envanter yuva öğeleri |
   | `crafting.js` | `craftGrid`, `craftSize`, `RECIPES`, `craftResult()`, üretim ızgarası yuvaları, `clickCraft()`, `clickResult()` |
   | `inventory-panel.js` | `paintSlot()`, `renderInventory()`, `clickIn()`/`clickSlot()`, `openInventory()`, `giveOrDrop()`, `closeInventory()` |
   | `furnace.js` | `furnaces`, `SMELTING`, `FUEL`, `openFurnace()`, `clickFurnace()`, `updateFurnaces()`, `removeFurnace()`, `renderFurnace()` |
   | `held-tool.js` | `selectedTool()`, `useTool()`, gözden ve 3. şahıs görünümde eldeki alet (`fpTool`, `tpTool`, `updateHeldTool()`) |
   | `save.js` | IndexedDB: `openDb()`, `saveGame()`, `loadGame()`, `applySave()`, "Yeni dünya" |
   | `sound.js` | `initAudio()`, `playNoise()`, `playTone()`, `blockSound()`, `hurtSound()`, `popSound()`, `MOB_SOUNDS`, `updateMobSounds()`, `updateSteps()`, `setSound()` |
   | `settings.js` | `settings`, `VIEW_DISTANCES`, `applySettings()`, `loadSettings()`, `saveSettings()`, `showSettings()` |
   | `main.js` | `frame()`: hareket, fizik, kamera, animasyon, çizim |

---

## Dünya

- **Boyut:** `SX × SY × SZ = 96 × 48 × 96` blok. Sınırlı dünya; kenarlar görünmez duvardır (oyuncu dışarı çıkamaz).
- **Veri:** `world = Uint8Array(SX * SY * SZ)`, indeks `(y * SZ + z) * SX + x`. Değer blok kimliğidir, `0` hava.
- **Erişim:** `get(x, y, z)` dünya dışında hava döndürür, `y < 0` için taş döndürür (altta delik görünmesin diye). `set(x, y, z, id)` dünya dışını yok sayar.
- **Tohum:** `SEED = 20261106`, sabit. Her açılışta aynı dünya üretilir.
- **Arazi:** 4 oktavlı değer gürültüsü (`fbm`) ile yükseklik haritası, `h = 6 + fbm^1.4 * 34`.
  - `h ≤ 14`: üstte 3 blok kum, altı taş.
  - Diğerleri: üstte çimen, altında 3 blok toprak, en altta taş.
- **Mağaralar:** Arazi kurulduktan hemen sonra, her sütunda `y = 2` ile yüzeyin 4 altı arasında iki 3B değer gürültüsünün (`valueNoise3`) aynı anda 0,5'e yakın olduğu hücreler (`a² + b² < CAVE_RADIUS²`, `CAVE_RADIUS = 0.075`) oyulur; kıvrımlı tüneller çıkar (yer altının ~%8'i). Tüneller yamaçlarda alçak komşu sütunlara ağız açar. Mağaralar aydınlıktır (ışık hesabı yok).
- **Göller:** `y ≤ WATER_LEVEL = 12`'de arazi yüzeyinin üstünde kalan boşluklar suyla dolar (alçak kumlu bölgeler göl olur); mağaralar kuru kalır. Akan su yok.
- **Bitkiler:** Ağaçlardan sonra, üstü boş her çimen sütununun %12'sine uzun ot, %2'sine çiçek (yarı yarıya gelincik ve karahindiba) konur (`mulberry32(SEED + 11)`).
- **Cevherler:** Arazi kurulduktan sonra chunk başına ~8 kömür damarı (y 1–30) ve ~4 demir damarı (y 1–20), her biri 3–8 blokluk rastgele yürüyüş; yalnızca taşın yerini alır (`mulberry32(SEED + 7)`). Yalnızca yeni üretilen dünyada; kayıttan yüklenen dünya değişmez.
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
| 10 | `crafting_table` | Çalışma masası | `craftingTop` / `craftingSide` / `planks` |
| 11 | `furnace` | Fırın | `furnaceTop` / `furnaceFront` / `furnaceTop` (blok yön tutmadığı için ağız dört yanda) |
| 12 | `sandstone` | Kumtaşı | `sandstoneTop` / `sandstoneSide` / `sandstoneTop` |
| 13 | `furnace_lit` | Fırın (yanan) | `furnaceTop` / `furnaceLit` / `furnaceTop`; yalnızca dünyada, kırılınca fırın düşer |
| 14 | `glass` | Cam | `glass`; çerçeve opak, içi saydam (`transparent`, `cutout`) |
| 15 | `coal_ore` | Kömür cevheri | `coalOre` (taş + siyah benekler) |
| 16 | `iron_ore` | Demir cevheri | `ironOre` (taş + bej benekler) |
| 17 | `water` | Su | `water`; `fluid`, `transparent`, `hidden` (eşya olarak alınamaz, kırılamaz) |
| 47 | `tall_grass` | Uzun ot | `tallGrass`; `model: 'cross'`, `noCollide`, `cutout`, `replaceable`, `noDrop` (%12 buğday tohumu) |
| 48 | `poppy` | Gelincik | `poppy`; uzun ot gibi, eşya düşürmez |
| 49 | `dandelion` | Karahindiba | `dandelion`; uzun ot gibi, eşya düşürmez |
| 50 | `farmland` | Tarla | `farmland` / `dirt` / `dirt`; kırılınca toprak düşer |
| 51–54 | `wheat_0` … `wheat_3` | Buğday | `wheat0` … `wheat3`; `model: 'cross'`, `crop` (aşama 0–3) |
| 31–46 | `door_<yön>_<lower\|upper>_<closed\|open>` | Kapı | `doorLower` / `doorUpper`; `model: 'box'`, `box` (3/16 kalınlığında levha), `part`, `dir`, `open`, kırılınca `door` eşyası (bir kez) |
| 23–30 | `bed_foot_<yön>`, `bed_head_<yön>` (yön: `east`, `west`, `south`, `north`) | Yatak | `bedHeadTop` / `bedFootTop` / `bedSide`; `model: 'bed'`, `part`, `dir` (baş tarafı), `height: 9/16`, kırılınca `bed` eşyası (bir kez) |
| 18–22 | `torch_floor`, `torch_east`, `torch_west`, `torch_south`, `torch_north` | Meşale | `torch`; `model: 'torch'`, `lean` (eğilme yönü), `noCollide`, `transparent`, kırılınca `torch` eşyası |

Su dışındaki bütün bloklar katı ve opaktır. `isSolid(b)`: hava, `fluid` ve `noCollide` bloklar dışındakiler; çarpışma, görüş (`canSeePlayer`), gün ışığı (`skyAbove`), oklar ve kamera mesafesi bunu kullanır. `isTargetable(b)`: hava ve `fluid` dışındakiler; nişan ışını bunlarda durur (meşale kırılabilir). `y = 0` katmanı kırılamaz. Bloklar envanterden harcanır (bkz. Envanter).

**Dayanak:** Bir blok kırılınca üstündeki bitki kalkar, üstündeki yer meşalesi ve yan yüzlerine yaslanan duvar meşaleleri düşer. `passable(b)` (hava ya da `noCollide`): doğma noktası ve canlı doğurma için zemin aranırken bu hücreler atlanır. `replaceable` bloğun (bitki) yerine blok konabilir.

**Kırma:** Her blokta `breakTime` (elle kırma süresi), `tool` (hızlı kıran alet türü), gerekiyorsa `needsTool` (yalnızca o alet türüyle kırılınca düşer) ve `drop` (kendisi yerine düşen eşya) vardır. Seçili alet bloğun `tool` türündeyse süre aletin `speed` çarpanına bölünür (bkz. Aletler).

| Grup | Bloklar | Elle süre | `tool` | Elle kırınca düşer mi |
| --- | --- | --- | --- | --- |
| Yaprak | Yaprak | 0,3 sn | — | %10 |
| Toprak | Çimen, Toprak, Kum | 0,75 sn | `shovel` | Evet |
| Ahşap | Kütük, Tahta, Çalışma masası | 3 sn | `axe` | Evet |
| Taş | Taş (kırık taş düşürür, `drop`), Kırık taş, Tuğla, Fırın | 7,5 sn | `pickaxe` (`needsTool`) | Hayır |
| Cam | Cam | 0,5 sn | — | Evet |
| Cevher | Kömür cevheri (kömür düşürür), Demir cevheri (kendisi; `minTier: 2`, en az taş kazma) | 7,5 sn | `pickaxe` (`needsTool`) | Hayır |
| Kumtaşı | Kumtaşı | 4 sn | `pickaxe` (`needsTool`) | Hayır |

### Dokular

- Tek satırlık atlas: `T = 16` piksel kare, `N_TILES = 36` doku, atlas `576 × 16` piksel.
- `TILE` sırası: `grassTop, grassSide, dirt, stone, logSide, logTop, leaves, sand, planks, brick, cobble, craftingTop, craftingSide, furnaceFront, furnaceTop, sandstoneTop, sandstoneSide, furnaceLit, glass, coalOre, ironOre, water, torch, bedHeadTop, bedFootTop, bedSide, doorLower, doorUpper, tallGrass, poppy, dandelion, farmland, wheat0, wheat1, wheat2, wheat3`.
- Yeni doku eklerken `N_TILES` artırılır, `TILE`'a eklenir, çizim kodu aynı bölüme yazılır.
- Dokular `mulberry32(1337)` ile her açılışta aynı üretilir. Filtre `NearestFilter`, mipmap yok.

---

## Çizim

- **Chunk:** `16 × SY × 16` blokluk dilimler (`CH = 16`); her chunk iki mesh'tir: opak bloklar (`material`) ve saydam bloklar (`waterMaterial`: %60 opak, derinliğe yazmaz, opaklardan sonra çizilir). Bir yüz, komşusu hava ise ya da komşusu kendisinden farklı saydam bir blok ise çizilir (`faceVisible`); böylece su altındaki zemin görünür, su–su yüzleri çizilmez.
- **Yüz gölgesi:** Işık hesabı yok, köşe rengiyle sabit gölge: üst 1,0, doğu/batı 0,8, kuzey/güney 0,65, alt 0,5.
- **Malzeme:** `MeshBasicMaterial`, atlas dokusu + köşe renkleri. `withTorchLight()` shader'a bir ek yapar: her köşede `torchLight` niteliği (0–1) vardır ve son renk `doku × köşe rengi × max(uBrightness, torchLight × (1, 0,85, 0,6))` olur. `uBrightness` (`brightnessUniform`) gün döngüsünün parlaklığıdır; böylece meşale ışığı gece karartmasından etkilenmez.
- **Meşale ışığı:** Chunk kurulurken çevresindeki (±8 blok) meşaleler toplanır (`torchesNear`); her yüzün merkezinin en yakın meşaleye uzaklığına göre `torchLight = max(0, 1 − d / TORCH_RANGE)`, `TORCH_RANGE = 7.5`. Duvarlar ışığı kesmez. Meşale konunca ya da kaldırılınca ışığın ulaştığı bütün chunk'lar yeniden kurulur (`rebuildArea`).
- **Çapraz model:** `addCrossModel` bitkileri hücrenin köşegenlerinde iki düzlem olarak çizer; arka yüzler ayrı üçgenlerle. Doku saydam arka planlıdır (alphaTest ile kesilir).
- **Kutu modeli:** `addBoxModel` hücre içindeki bir kutuyu (kapı levhası) çizer; doku yüzün ekseninde hücre koordinatından okunur. Hücre kenarındaki bir yüz, komşusu opak katı bir bloksa çizilmez.
- **Cam:** Atlas dokusunda camın içi saydamdır; dünya malzemesindeki `alphaTest: 0.5` bu pikselleri keser. Cam `cutout` olduğu için opak mesh'te çizilir ama `transparent` sayıldığından arkasındaki yüzler çizilir; cam–cam yüzleri çizilmez.
- **Yatak modeli:** `addBedModel` yarım blok yüksekliğinde bir kutu çizer; iki yarı arasındaki yüz ve alt yüz çizilmez. Üst dokuların "yukarısı" her iki yarıda da baş tarafına döner (yastık baş hücresinin uzak kenarında).
- **Meşale modeli:** Tam blok değil; 2×10 piksellik çubuk (`addTorchModel`), dokunun ortadaki iki sütunu (alt kısım tahta, üst 3 satır alev). Yerdeki meşale dik durur; duvar meşalesi duvara yakın başlar ve dışa eğilir. Meşalenin kendi yüzleri her zaman tam aydınlıktır.
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

- **Blok kutuları:** Her katı bloğun hücre içinde bir çarpışma kutusu vardır (`blockBox`): `box` (kapı levhası), `height` (yatak 9/16) ya da tam hücre. `overlappingBoxes` varlığın kesiştiği kutuları bulur; `moveAxis` çarpışınca varlığı kutunun yüzüne dayar (yere iner, tavana değer, duvara yaslanır).
- Çarpışma eksen eksen yapılır (`moveAxis(e, axis, d)`): önce x, sonra z, sonra y. `stepEntity(e, dt)` adım 0,4 bloktan büyükse alt adımlara böler ve yatayda çarpıp çarpmadığını döndürür. Aynı kod canlılar için de kullanılır; her varlık `{ x, y, z, w, h, vx, vy, vz, onGround }` taşır (`w` yarı genişlik). Kare süresi 0 ile 0,05 sn arasına sıkıştırılır.
- **Su:** Oyuncunun kutusu suya değiyorsa yürüme hızı %50, yerçekimi 1/4, batma hızı en çok `SINK_SPEED = 3`; Boşluk basılıyken `SWIM_UP_SPEED = 3` ile yukarı yüzer. Suya düşen düşme hasarı almaz. Kamera suyun içindeyse ekran mavi tonlanır (`#underwater`) ve sis 0–8 bloğa iner. Hayvanlar suya girmez; düşmanlar suya doğmaz.
- **Geri itilme:** `player.kx`, `player.kz` hıza eklenir ve her karede `e^(-6·dt)` ile söner.

### Can

- `player.health`, en fazla `MAX_HEALTH = 20`. HUD'da 10 kalp; her kalp 2 puan (dolu, yarım, boş). Kalpler 9×9 piksellik canvas görselleridir.
- `damagePlayer(amount, sourceX, sourceZ)`: canı düşürür, 0,5 sn hasarsızlık verir, ekran kenarını 0,2 sn kırmızı yakar. Kaynak verilirse oyuncuyu kaynaktan uzağa 4 blok/sn iter ve 6 blok/sn yukarı zıplatır; kaynak verilmezse (düşme gibi) itmez. Konsoldan test için `window.damagePlayer` olarak da açıktır.
- **Yenilenme:** Can 20'den azsa, açlık en az `REGEN_FOOD = 18` ise ve son 5 sn hasar alınmadıysa, oyun duraklatılmamışken her 4 sn'de 1 puan geri gelir.

### Tarım

- **Çapa** (`wooden_hoe`, `tool: 'hoe'`, dayanıklılık 60): üstü boş çimen ya da toprağa sağ tık onu tarlaya çevirir ve çapa 1 aşınır.
- **Ekme:** Elde buğday tohumu varken tarlanın üstüne sağ tık `wheat_0` eker.
- **Büyüme:** `crops` haritası (`"x,y,z"` → kalan sn) her olgunlaşmamış ekini tutar; her aşama `CROP_STAGE_TIME = 60` sn'nin 0,6–1,4 katı sürer ve yalnızca oyun oynanırken ilerler. Aşamalar dünya dizisinde durduğu için kayda girer; kayıt yüklenince `scanCrops()` sayaçları yeniden kurar.
- **Hasat:** Olgun buğday (`wheat_3`) kırılınca 1 buğday + 1–3 tohum, olgunlaşmamışsa 1 tohum düşer. Tarla kırılınca üstündeki ekin kalkar.
- **Ekmek:** 3 yatay buğday (çalışma masasında) → ekmek, açlığa 5.

### Kapı

- Elde kapı varken bir bloğun üstüne sağ tık: alt ve üst hücreye kapalı kapı konur (iki hücre de boş olmalı); kapı oyuncunun baktığı yöne kapanır (levha hücrenin o kenarında). Kapıya sağ tık iki yarıyı birlikte açar/kapar; açıkken levha sol kenara döner ve geçilir. Bir yarı kırılınca diğeri de kalkar. Canlılar kapı açamaz (yapay zekâ kapıyı duvar sayar).

### Yatak ve doğma noktası

- **Koyma:** Elde yatak varken sağ tık: ayak bakılan hücreye, baş oyuncunun baktığı ana eksende bir sonraki hücreye konur; iki hücre de boş, altları katı olmalı. Bir yarı kırılınca diğeri de kalkar.
- **Kullanma (sağ tık):** Doğma noktası (`spawnPoint`) yatağın yanındaki, ayak basılabilen ilk hücreye taşınır (yoksa yatağın üstü). Gündüz (`daylight ≥ 0,5`) "Sadece gece uyuyabilirsin", 8 blok içinde canlı bir düşman varsa "Yakınlarda canavar var" yazar. Aksi halde ekran `SLEEP_TIME = 2` sn kararır (`#sleep`), oyuncu hareket edemez; sonra saat 06:00 (`clock.time = 0`) olur, gün sayısı artar ve "Günaydın" yazar.
- `spawn()` önce `spawnPoint`'i kullanır; yoksa dünyanın ortası. Ölünce oraya doğulur. `spawnPoint` kayda yazılır.

### Açlık

- `player.food`, en fazla `MAX_FOOD = 20`. HUD'da can barının sağında 10 but (dolu, yarım, boş; 9×9 canvas).
- `hunger.timer` her saniye 1, koşarken (hareket ederek) 2 artar; `HUNGER_INTERVAL = 30`'a ulaşınca açlık 1 azalır.
- Açlık `SPRINT_FOOD = 6` ve altındaysa koşulamaz. Açlık 0 iken her `STARVE_INTERVAL = 4` sn'de 1 hasar; can 1'in altına inmez.
- **Yemek:** Seçili yuvada `food` değeri olan bir eşya varken sağ tuş `EAT_TIME = 1.6` sn basılı tutulursa 1 tane yenir, açlık `food` kadar artar (en çok 20), kol vurur. Yemek elindeyken sağ tık blok koymaz. Ölüp yeniden doğunca açlık 20 olur.

  | Eşya | `food` |
  | --- | --- |
  | Çiğ biftek, Çiğ domuz eti | 3 |
  | Çiğ tavuk, Çürük et | 2 |
  | Elma | 4 |
  | Ekmek | 5 |
  | Pişmiş biftek, Pişmiş domuz eti | 8 |
  | Pişmiş tavuk | 6 |

- **Elma:** Kırılan yaprak %5 olasılıkla elma düşürür.
- **Düşme hasarı:** Havadayken ulaşılan en yüksek y `player.fallPeak` içinde tutulur. Yere değince düşülen yükseklik 3,5 bloğu aşıyorsa `round(yükseklik - 3)` hasar verilir: 4 blok 1 can, 10 blok 7 can.
- **Ölüm:** Can 0 olunca ya da `y < -20` olunca `die()` çalışır: oyun durur, fare kilidi bırakılır, "Öldün!" paneli açılır (başlangıç paneli gizli kalır). "Yeniden doğ" oyuncuyu `spawn()` noktasında 20 canla başlatır.

### Kontroller

| Tuş | İş |
| --- | --- |
| W A S D | Yürü |
| Fare | Bak (fare kilidiyle). Kilit reddedilirse sol tuşla sürükleyerek bak. |
| Boşluk | Zıpla |
| W-W (300 ms içinde iki kez) / Shift | Koş. W bırakılınca koşma biter. Koşarken görüş alanı 75° → 85°. |
| Sol tık (basılı tut) | Basınca bakılan canlıya vurur; basılı tutuldukça bakılan bloğu kazar (yedek modda 6 pikselden fazla sürüklemek bakıştır, kazmayı keser) |
| Sağ tık | Seçili yuvadaki bloğu koy; meşale bir bloğun üstüne dik, yan yüzüne eğik konur (tavana konmaz) (canlıların ya da oyuncunun içine konmaz); çalışma masasına bakılıyorsa 3×3 üretimi açar; elde yemek varsa basılı tutunca yer |
| 1–9 / tekerlek | Hotbar yuvası seç |
| E | Envanteri aç / kapat (Esc de kapatır) |
| Q | Seçili yığından 1 tanesini bakılan yöne at |
| V | Kamera: arkadan → gözden → önden |
| Esc | Duraklat (fare kilidi bırakılınca panel açılır) |

### Kamera

- **Arkadan (varsayılan), omuz üstü:** Kamera, gözün `SHOULDER_OFFSET = 0.6` blok sağında ve `SHOULDER_RISE = 0.25` blok üstündeki omuz noktasından bakış yönünün tersine `CAMERA_DISTANCE = 3.5` blok geride durur; karakter ekranın solunda kalır, nişangâh boştur. Omuz noktası ya da kamera bir bloğa 0,25'ten fazla yaklaşacaksa öne alınır (`cameraClearance`): engel gelince hemen yaklaşır, açılınca yumuşakça (≈0,2 sn) geri çekilir (`cameraDistance`). Kamera 0,8 bloktan yakına gelirse karakter modeli gizlenir. Nişan ışını kameradan başlar; blok menzili `6 + cameraDistance`, canlı menzili `cameraDistance + MOB_REACH`.
- **Gözden:** Göz hizasında, sağ altta oyuncunun kolu. Nişan ışını gözden başlar, menzil 6.
- **Önden:** Gözün 3,5 blok önünde (engelde yaklaşır), oyuncuya bakar. Artı işareti gizlenir; nişan ışını gözden başlar.

### Model

- Bloklu insan: 1 piksel = `P = 0.05625` blok, toplam 32 piksel = 1,8 blok. Baş 8×8×8, gövde 8×12×4, kollar ve bacaklar 4×12×4.
- Renkler: ten `#c99a76`, saç `#4a3222`, tişört `#40598e`, pantolon `#393f4f`, ayakkabı `#212121`.
- Animasyon: yürürken kollar ve bacaklar ters fazda sallanır, baş bakışla eğilir, kırma/koymada sağ kol vurur (0,25 sn).

---

## Canlılar

- `mobs` dizisindeki her canlı: konum, hız, geri itilme (`kx`, `kz`), `yaw`, `health`, kutu (`w`, `h`), yapay zekâ durumu (`walking`, `timer`) ve modeli (`body = { root, legs }`).
- Fizik oyuncuyla aynıdır (`stepEntity`). Canlılar yalnızca oyun oynanırken güncellenir, kaydedilmez: her açılışta dünya (ya da kayıt) yüklendikten sonra yeniden doğarlar.
- **Dolaşma:** 2–5 sn rastgele bir yöne yürür, 2–4 sn durur. Önündeki hücrede 1 blokluk basamak varsa zıplar; 2 blok duvar, dünya kenarı ya da 3 bloktan derin uçurum varsa döner.
- Hayvan sınırı `MAX_ANIMALS = 16` (`ANIMAL_KINDS` türlerinin toplamı).
- **Doğma:** Açılışta her türden 4'lük bir sürü (`spawnHerd`): ilk hayvan rastgele bir çimen sütununda, diğerleri onun 8 blok çevresindeki çimenlerde. Gündüz (`daylight ≥ 0,5`) ve sınırın altındaysa her 30 sn'de oyuncudan en az 24 blok uzaktaki bir çimene rastgele türden 1 hayvan doğar.
- **`slowFall`:** düşerken (`vy < 0`) yerçekimi 1/4'e iner.
- **Kazma:** Sol tuş basılıyken (`mining`) her karede bakılan bloğun ilerlemesi `dt / breakTime` kadar artar (`miningState`). Hedef blok değişir, bir canlıya bakılır ya da tuş bırakılırsa ilerleme sıfırlanır. İlerleme 1'e ulaşınca `breakBlockAt()`. Bu sırada bloğun üstünde 0,002 büyük bir kutu, 10 aşamalı koyu çatlak dokusunu gösterir (dokular kodla, ortadan dışa yürüyen rastgele piksellerle çizilir) ve kol sürekli vurur.
- **Vurma:** Sol tuşa basıldığı anda `raycast()` (bloğun giriş uzaklığı `t`) ve `rayMob()` (canlı kutularına slab testi, menzil `aim.start + MOB_REACH`, `MOB_REACH = 3.5`) karşılaştırılır; canlı daha yakınsa blok yerine canlı vurulur. İmleç bir canlının üstündeyken blok çerçevesi gizlenir.
- **`hurtMob(m, amount, dirX, dirZ)`:** elle vuruş `FIST_DAMAGE = 1`. 0,5 sn hasarsızlık, 0,3 sn kırmızı (`emissive`), vuruş yönünde 5 blok/sn geri itilme (yerdeyse 4 blok/sn hoplama), 4 sn boyunca oyuncudan 2 kat hızla kaçma (`flee`).
- **Ölüm:** Can 0 olunca `dying = 0.5`: canlı 0,5 sn'de yana 90° devrilir, kırmızı kalır, sonra `removeMob()` ile sahneden ve diziden silinir (geometri ve malzemeler serbest bırakılır).
- **Düşmanlar (`hostile`):** Her 10 sn'de, sınır `MAX_HOSTILES = 8` dolmadıysa oyuncudan 16–32 blok uzakta doğmaya çalışır (`trySpawnHostile`): gece yarı yarıya bir sütunun en üstüne (açık hava; yaprak ya da su üstü olmaz, `surfaceSpot`), aksi halde (gündüz her zaman) o sütundaki üstü kapalı, iki blok boş, altı katı bir mağara hücresine (`caveSpot`); bir meşaleye `TORCH_SAFE = 8` bloktan yakın yerde doğmaz (`torchNearby`). `CHASE_DISTANCE = 16` blok içinde oyuncuyu görürse (`canSeePlayer`: gözden göze 0,25 blok adımlı ışın) ona yürür. Görüş kesilse de `CHASE_MEMORY = 5` sn kovalamayı sürdürür (`memory`); sonra dolaşır. Oyuncudan `DESPAWN_DISTANCE = 64` bloktan uzaklaşan düşman silinir. Düşmanlar vurulunca kaçmaz.
- **Bacak animasyonu:** çapraz bacaklar (0 ile 3, 1 ile 2) birlikte sallanır; iki bacaklılarda 0 ileri, 1 geri.

| Tür (`kind`) | Ad | Can | Kutu (`w` × `h`) | Hız | Model | Doğma |
| --- | --- | --- | --- | --- | --- | --- |
| `cow` | İnek | 10 | 0,45 × 1,2 | 1,2 | Gövde 10×8×16, baş 8×8×6, boynuz, 4 bacak 4×10×4 (P birimi); kahverengi-beyaz lekeli | Sürü, 4 |
| `pig` | Domuz | 10 | 0,4 × 0,9 | 1,1 | Gövde 10×8×14, baş 8×8×8, burun 4×3×1, kısa bacaklar 4×6×4; pembe | Sürü, 4 |
| `chicken` | Tavuk | 4 | 0,25 × 0,8 | 1,0 | Gövde 6×6×8, kanatlar, baş 4×6×3, sarı gaga, kırmızı gıdı ve ibik, 2 sarı bacak; beyaz. `slowFall` | Sürü, 4 |
| `sheep` | Koyun | 8 | 0,45 × 1,1 | 1,1 | Yünlü gövde 10×9×14, gri yüz 6×6×7, bacaklar 4×8×4 | Sürü, 4 |
| `zombie` | Zombi | 20 | 0,3 × 1,8 | 2,3 | `buildHumanoid`: yeşil ten, mavi gömlek; kollar öne uzanık (1,45 rad), vururken savrulur | Gece düşmanlarının %25'i |
| `creeper` | Creeper | 20 | 0,3 × 1,5 | 2,0 | Gövde 8×12×4, baş 8×8×8 (üzgün yüz), 4 kısa bacak 4×6×4 (önde ve arkada); yeşil benekli. `explodes` | Gece düşmanlarının %15'i |
| `spider` | Örümcek | 16 | 0,7 × 0,9 | 2,6 | Karın 12×9×12, göğüs 6×6×6, baş 8×8×8 (4 kırmızı göz), iki yanda 4'er ince bacak 14×2×2 (dışa ve aşağı açılı, yürürken salınır); siyah-koyu gri. `climbs`, `leaps` | Gece düşmanlarının %20'si |
| `skeleton` | İskelet | 20 | 0,3 × 1,8 | 2,3 | `buildHumanoid(…, 2)`: kemik beyazı, kol ve bacaklar 2 piksel; sol elde kahverengi yay; nişan alırken iki kol öne (1,4 rad). `ranged` | Gece düşmanlarının %40'ı |

**İskelet saldırısı:** Kovalarken oyuncuya döner; 8,5 bloktan uzaktaysa yaklaşır, 4 bloktan yakınsa geri geri çekilir, arada durur. Her `SKELETON_SHOT_INTERVAL = 2` sn'de bir ok atar; yalnızca oyuncuyu o an görüyorsa.

**Oklar:** `projectiles` dizisinde `{ x, y, z, vx, vy, vz, stuck, life, mesh }`. Hız `ARROW_SPEED = 20` blok/sn, yerçekimi `ARROW_GRAVITY = 6`; atış, uçuş süresine göre yerçekimini telafi edecek kadar yukarı nişan alır. Her karede 4 alt adımla ilerler. Oyuncunun kutusuna girerse `ARROW_DAMAGE = 3` hasar verir ve uçuş yönünde iter; bloğa değerse takılı kalır ve 3 sn sonra silinir. Model: kahverengi gövde, gri uç, beyaz tüy; `lookAt` ile uçuş yönüne döner. Oklar kaydedilmez.

**Creeper:** Kovalarken oyuncuya `CREEPER_TRIGGER = 3` blok kalınca durur ve fitil (`fuse`) yanar: beyaz yanıp söner, 1,25 katına kadar şişer. Oyuncu `CREEPER_CANCEL = 5` bloktan uzaklaşırsa fitil sıfırlanır. `CREEPER_FUSE = 1.5` sn dolunca `explode()`: merkezin `EXPLOSION_RADIUS = 3` blok yarıçaplı küresindeki bütün bloklar silinir (`y = 0` hariç), etkilenen chunk'lar yeniden kurulur, oyuncuya `round(12 × (1 − uzaklık / 6))` hasar verilir ve creeper kaybolur.

**Gün ışığı:** Gündüz (`daylight ≥ 0,5`) `burns` türleri (zombi, iskelet) başlarının üstündeki sütunda hiç blok yoksa (`skyAbove`; yaprak da gölge sayılır) saniyede 1 hasar alır, her yanışta 0,3 sn kırmızılaşır ve üstlerinden turuncu-kırmızı-sarı küçük küpler (0,12 blok) yükselir (saniyede ~10, 0,6 sn ömür, 1,5 blok/sn yükselir ve küçülür). `passiveByDay` türü (örümcek) gündüz saldırmaz, hayvan gibi dolaşır. Creeper etkilenmez.

**Renk:** Canlının malzemelerinin `emissive` rengi `tint` ile yönetilir: vurulunca ya da ölürken kırmızı, fitil yanarken beyaz yanıp söner.

**Örümcek saldırısı:** Önündeki hücrede blok varsa dönmek yerine `SPIDER_CLIMB_SPEED = 2` blok/sn ile dikey tırmanır (tırmanırken yerçekimi yok). Oyuncuya `SPIDER_LEAP_RANGE = 3` blok kalınca ona doğru sıçrar (6 blok/sn yukarı ve ileri, 1,5 sn bekleme); sıçrayışın 0,8 sn'lik süresinde oyuncuya değerse `SPIDER_DAMAGE = 2` hasar verir.

**Zombi saldırısı:** Oyuncuya yatayda `ZOMBIE_REACH = 1.2` blok içinde ve dikeyde 1,5 bloktan yakınsa saniyede bir `ZOMBIE_DAMAGE = 3` hasar verir ve oyuncuyu geri iter (`damagePlayer`). 0,9 bloktan yakına girmez.

## Eşyalar

- **Anahtarlar:** Her eşyanın İngilizce bir anahtarı vardır. Blok eşyalarının anahtarı `B` sabitindeki adıyla aynıdır (`dirt`, `stone` …); `ITEMS[key] = { name, block }`. `BLOCK_ITEM[blokKimliği]` bloğun eşya anahtarını verir.
- **Blok olmayan eşyalar** (`ITEM_ART`): 8×8 piksellik desenden 16×16 canvas'a çizilir; `ITEMS[key] = { name, canvas }`.

  | Anahtar | Ad |
  | --- | --- |
  | `raw_beef` | Çiğ biftek |
  | `raw_pork` | Çiğ domuz eti |
  | `raw_chicken` | Çiğ tavuk |
  | `feather` | Tüy |
  | `wool` | Yün |
  | `rotten_flesh` | Çürük et |
  | `bone` | Kemik |
  | `arrow` | Ok |
  | `stick` | Çubuk |
  | `torch` | Meşale (konulabilir, bkz. Bloklar) |
  | `coal` | Kömür (kömür cevherinden) |
  | `apple` | Elma |
  | `bed` | Yatak (konulabilir) |
  | `door` | Kapı (konulabilir) |
  | `wheat_seeds` | Buğday tohumu (uzun ottan) |
  | `wheat` | Buğday |
  | `bread` | Ekmek |
  | `wooden_hoe` | Tahta çapa (alet) |
  | `cooked_beef` | Pişmiş biftek |
  | `cooked_pork` | Pişmiş domuz eti |
  | `cooked_chicken` | Pişmiş tavuk |
  | `charcoal` | Odun kömürü |
  | `iron_ingot` | Demir külçe |

- **`itemIcon(key)`:** HUD için data URL (bloklarda yan doku).
- **Düşme:** Kırılan blok kendisini düşürür; yaprak yalnızca %10 olasılıkla. Ölen canlı devrilme bittikten sonra `MOB_DROPS` tablosuna göre düşürür: inek 1–3 çiğ biftek, domuz 1–3 çiğ domuz eti, tavuk 1 çiğ tavuk + 0–2 tüy, koyun 1 yün, zombi 0–2 çürük et, iskelet 0–2 kemik + 0–2 ok. Creeper patlayınca bir şey düşmez.
- **Yerdeki eşya** (`drops`): `{ key, x, y, z, w: 0.125, h: 0.25, vx, vy, vz, age, mesh }`. Bloklar 0,25'lik küp (atlas dokusuyla, gece kararır), diğerleri 0,4'lük çift yüzlü düz simge. Hafif bir sıçrayışla düşer, yerde sürtünmeyle durur, döner ve hafifçe inip kalkar. `ITEM_LIFETIME = 300` sn sonra kaybolur. Kaydedilmez.
- **Toplama:** Oyuncunun gövde merkezine `PICKUP_RANGE = 1.5` bloktan yakınsa ona doğru 6 blok/sn çekilir, 0,6 bloktan yakında envantere eklenir (`addItem`) ve "+1 Ad" bildirimi çıkar. Envantere sığmazsa yerde kalır. `pickupDelay` dolmadan toplanmaz (Q ile atılan ya da envanter kapanınca sığmayan eşyalar için 1,5 sn).

## Envanter

- `inventory`: 36 yuva; 0–8 hotbar, 9–35 çanta. Yuva `{ key, count }` ya da `null`. Yığın sınırı `maxStack(key)`: aletler (`ITEMS[key].tool`) 1, diğerleri 64.
- Yeni oyuncu boş envanterle başlar; blok koymak için önce kazmak gerekir.
- **`addItem(key, count)`:** önce aynı türdeki dolmamış yuvalara, sonra ilk boş yuvaya koyar (hotbar önce); sığmayan adedi döndürür.
- **Blok koyma:** seçili yuvada blok eşyası varsa konur ve adet 1 azalır; 0 olunca yuva boşalır.
- **Envanter paneli (E):** Fare kilidi bırakılır ama oyun durmaz (dünya, canlılar ve zaman işler); oyuncu yürümez, dünyaya tıklanamaz. Sol tık: boş elde yığını alır; elde yığın varken boş yuvaya bırakır, aynı türse sığdığı kadar birleştirir, farklı türse yer değiştirir. Sağ tık: boş elde yığının yarısını (yukarı yuvarlayarak) alır; elde yığın varken boş ya da aynı türdeki yuvaya 1 tane bırakır. Kapanınca eldeki yığın envantere döner, sığmayan yere atılır; fare yeniden kilitlenir.
- **Q:** seçili yığından 1 tanesini bakış yönünde 5 blok/sn fırlatır.

## Fırın

- Fırına sağ tıklayınca envanter paneli "Fırın" başlığıyla açılır; üretim bölümü yerine fırın bölümü görünür. Her fırının durumu `furnaces["x,y,z"] = { x, y, z, slots: [girdi, yakıt, çıktı], burn, burnMax, progress }`; ilk açılışta oluşturulur.
- Girdi ve yakıt yuvalarına envanter gibi tıklanır; çıktıdan yalnızca alınır.
- **Pişirme** (`SMELT_TIME = 5` sn her eşya): çiğ biftek → pişmiş biftek, çiğ domuz eti → pişmiş domuz eti, çiğ tavuk → pişmiş tavuk, kum → cam, kırık taş → taş, kütük → odun kömürü, demir cevheri → demir külçe.
- **Yakıt** (`FUEL`, kaç eşya pişirir): kömür ve odun kömürü 8, kütük ve tahta 1,5. Yanma bitince ve pişecek bir şey varsa yeni yakıt tüketilir; yanma süresi `FUEL × 5` sn.
- Fırınlar oyun oynanırken her karede güncellenir (panel kapalıyken de). Yanarken blok `furnace_lit` olur (ağzında alev dokusu), sönünce `furnace`'a döner.
- Fırın kırılınca içindekiler yere düşer. Bütün fırınlar kayda yazılır.

## Aletler

- 2 seviye × 4 tür = 8 alet; anahtar `<seviye>_<tür>`: `wooden_pickaxe`, `stone_sword` … Adlar Türkçe: "Tahta kazma", "Taş kılıç" vb. `ITEMS[key]` alanları: `tool` (tür), `speed`, `durability` (en yüksek), `damage`, `canvas` (8×8 desenden simge).

  | Seviye | `tier` | Malzeme | `speed` | `durability` |
  | --- | --- | --- | --- | --- |
  | `wooden` (Tahta) | 1 | tahta | ×2 | 60 |
  | `stone` (Taş) | 2 | kırık taş | ×4 | 132 |

  Bir bloğun `minTier` değeri varsa, düşmesi için kazmanın `tier` değeri en az o kadar olmalıdır.

  | Tür | Hızlandırdığı bloklar | Hasar (tahta / taş) | Tarif (M malzeme, S çubuk) |
  | --- | --- | --- | --- |
  | `pickaxe` (kazma) | taş grubu, kumtaşı; taş grubu yalnızca kazmayla düşer | 2 / 3 | `MMM` / `.S.` / `.S.` |
  | `axe` (balta) | kütük, tahta, çalışma masası | 3 / 3 | `MM` / `MS` / `.S` |
  | `shovel` (kürek) | toprak, çimen, kum | 2 / 2 | `M` / `S` / `S` |
  | `sword` (kılıç) | — | 4 / 5 | `M` / `M` / `S` |

- Elle vuruş `FIST_DAMAGE = 1`; seçili yuvada alet varsa onun `damage` değeri kullanılır.
- **Dayanıklılık:** Alet yığını `{ key, count: 1, durability }` taşır. Her blok kırışta ve her canlıya vuruşta 1 azalır; 0 olunca alet kaybolur ve "… kırıldı" bildirimi çıkar. Aşınmış aletin yuvasında altta yeşilden kırmızıya giden bir çubuk görünür. Yığınlar taşınırken, atılırken (`drop.extra`) ve kaydedilirken `durability` korunur (`extraOf`).
- **Elde görünüm:** Seçili yuvada alet varsa simgesi düz, çift yüzlü bir düzlem olarak gözden görünümde kolun ucunda (`fpTool`), 3. şahıs modelde sağ elde (`tpTool`) görünür.

## Üretim

- Envanter panelinde 2×2, çalışma masasına sağ tıklanınca 3×3 üretim ızgarası (`openInventory(size)`). `craftGrid` her zaman 9 hücrelik dizidir (indeks `satır × 3 + sütun`); 2×2'de yalnızca sol üst dört hücre görünür ve kullanılır.
- Izgara hücrelerine envanterdeki gibi tıklanır (`clickIn`). **Sonuç yuvası:** elde ürün yoksa ya da aynı üründen yığına sığacak kadar yer varsa ürün ele gelir ve ızgaradaki her dolu hücre 1 azalır.
- Panel kapanınca ızgaradakiler ve eldeki yığın envantere döner; sığmayan oyuncunun önüne atılır (`giveOrDrop`).
- **Tarifler** (`RECIPES`, şekilli; dolu hücrelerin sınır kutusu desenle birebir eşleşmeli, ızgarada kaydırılabilir, aynalanmaz):

  | Desen | Malzeme | Ürün |
  | --- | --- | --- |
  | `L` | kütük | 4 tahta |
  | `P` / `P` (dikey) | tahta | 4 çubuk |
  | `PP` / `PP` | tahta | çalışma masası |
  | `C` / `S` | kömür ya da odun kömürü üstte, çubuk altta | 4 meşale |
  | `CCC` / `C.C` / `CCC` | kırık taş | fırın |
  | `SS` / `SS` | kum | kumtaşı |
  | `WWW` / `PPP` | yün üstte, tahta altta | yatak |
  | `PP` / `PP` / `PP` | tahta | 3 kapı |
  | `PP` / `.S` / `.S` | tahta + çubuk | tahta çapa |
  | `WWW` | buğday | ekmek |
  | (Aletler tablosu) | tahta ya da kırık taş + çubuk | 8 alet |

## Kırılma parçacıkları

- Blok kırılınca 12, kazarken 0,2 sn'de bir 2 parça (`spawnDebris`). Parça 0,1 blokluk bir küptür ve bloğun yan dokusundan rastgele 4×4 piksellik bir kesit taşır (gece kararır).
- Rastgele hızla saçılır, yerçekimiyle düşer, katı bir bloğa değince yerde kalır, son 0,3 sn'de küçülür ve `DEBRIS_LIFE = 0.8` sn'de kaybolur. Aynı anda en çok `MAX_DEBRIS = 200` parça; fazlası en eskiden silinir.

## Ayarlar

- Duraklatma menüsündeki "Ayarlar" düğmesi ayar görünümünü açar. Her değişiklik hemen uygulanır ve kaydedilir.

  | Ayar (`settings.`) | Denetim | Varsayılan | Etkisi |
  | --- | --- | --- | --- |
  | `sensitivity` | kaydırıcı 0,001–0,006 (yüzde olarak gösterilir) | 0,0025 (%100) | Fare hareketinin bakışa çarpanı |
  | `fov` | kaydırıcı 60–100 | 75 | Kamera görüş alanı; koşarken +10 |
  | `viewDistance` | `short` / `normal` / `far` | `normal` | Sisin uzak sınırı 40 / 70 / 120 blok, yakın sınırı bunun 0,43 katı |
  | `sound` | onay kutusu | açık | Ses açık/kapalı |
  | `invertY` | onay kutusu | kapalı | Fareyi yukarı itince aşağı bakılır |

- Ayarlar dünya kaydından ayrı, aynı IndexedDB deposunda `settings` anahtarıyla saklanır; "Yeni dünya" bunları silmez. Bilinmeyen alanlar yok sayılır, eksik alanlar varsayılanda kalır.

## Ses

- Tek `AudioContext`, ilk "Oyna" tıklamasında açılır (`initAudio`). Bütün sesler kodla üretilir; dosya yok.
- **Gürültü sesleri** (`playNoise`: beyaz gürültü → filtre → zarf): blok kırılınca (`break`), kazarken 0,25 sn'de bir (`dig`), koyunca (`place`), yürürken adım (`step`, 0,4 sn'de bir, koşarken 0,3; yalnızca yerde ve suyun dışında), hasar (`hurt`). Filtre frekansı bloğun malzemesine göre değişir (`blockMaterialFreq`): toprak 700 Hz, ahşap 1100, taş 2600, yaprak ve bitki 4200, cam 5200.
- **Ton sesleri** (`playTone`: osilatör, frekans kayması, isteğe bağlı vibrato ve alçak geçiren filtre): eşya toplama (`pop`), canlılar (`MOB_SOUNDS`): inek alçak "mö", domuz kısa hırıltı, tavuk tiz "gıt", koyun titreşimli "mee", zombi inleme.
- **Canlı sesleri:** her canlı 5–12 sn arayla; oyuncuya `SOUND_RANGE = 16` bloktan yakınsa çalar, ses seviyesi uzaklıkla doğrusal azalır.
- **Aç/kapat:** Ayarlardaki "Ses" kutusu (`setSound`).
- `soundLog`: son 50 sesin adı ve şiddeti (ses kapalıyken de tutulur; testler için).

## Test kancası

Konsoldan ve testlerden erişim için `window.game` açıktır: `player`, `damagePlayer`, `clock`, `getBlock`, `setBlock`, `saveGame`, `mobs`, `projectiles`, `particles`, `spawnMob`, `drops`, `dropItem`, `inventory`, `addItem`, `openInventory`, `closeInventory`, `clickSlot`, `clickCraft`, `clickResult`, `craftGrid`, `mining`, `hunger`, `renderFood`, `getSpawnPoint()`, `isSleeping()`, `crops`, `trySpawnHostile(night)`, `settings`, `fogFar()`, `showSettings`, `soundLog`, `setSound`, `isSoundOn()`, `audioReady()`, `debris`, `spawnDebris`, `furnaces`, `openFurnace`, `clickFurnace`, `rebuild` (`buildChunk`), `camera`, `cameraDistance()`, `raycast`, `torchNearby`, `torchLight(x, y, z)` (kazma ilerlemesi), `crackVisible()` ve kayıt okunduktan sonra `true` olan `ready`. Yeni sistemler test gerektiriyorsa buraya eklenir.

## Kayıt

- Tarayıcının IndexedDB'si: veritabanı `block-world`, depo `saves`, tek kayıt anahtarı `world1`. Veri yalnızca o tarayıcıda ve o adreste durur (Artifact ile yerel dosyanın kayıtları ayrıdır).
- **Kayıt nesnesi** (`SAVE_VERSION = 1`):

  | Alan | İçerik |
  | --- | --- |
  | `version` | `1` |
  | `world` | Tüm dünya dizisi (`Uint8Array`, 442.368 bayt) |
  | `player` | `{ x, y, z, yaw, pitch }` |
  | `health` | Can (0 kaydedildiyse 20 yüklenir) |
  | `food` | Açlık (yoksa 20) |
  | `spawnPoint` | Yatakla belirlenen doğma noktası `{ x, y, z }` ya da `null` |
  | `furnaces` | Fırınların dizisi: `{ x, y, z, slots, burn, burnMax, progress }` |
  | `selected` | Seçili hotbar yuvası (0–8) |
  | `inventory` | 36 yuva: `{ key, count }` (aletlerde `durability` da) ya da `null`; bilinmeyen anahtarlar yüklenirken atlanır |
  | `time`, `day` | `clock.time`, `clock.day` |

  Yeni özellikler kendi alanlarını bu nesneye ekler ve bu tabloya yazar. Alanların anlamı değişirse `SAVE_VERSION` artırılır; sürümü uymayan kayıt yok sayılır.
- **Ne zaman kaydedilir:** her 30 sn'de bir (oyun oynanırken), duraklatınca (`pause()`), sayfa arka plana geçince (`visibilitychange`) ve kapanırken (`pagehide`).
- **Açılış:** Kayıt, bütün betikler yüklendikten sonra `main.js`'in sonunda okunur (`loadGame()`); ardından ayarlar okunur. "Oyna" düğmesi bunlar bitene kadar pasiftir. Kayıt varsa dünya ondan yüklenir, bütün chunk'lar yeniden kurulur, oyuncu, can, hotbar ve saat geri gelir. IndexedDB açılamazsa (3 sn zaman aşımı dahil) oyun kayıtsız çalışır, panelde "Kayıt yapılamıyor" notu çıkar ve "Yeni dünya" düğmesi gizlenir.
- **Yeni dünya:** İlk basışta düğme "Emin misin? Tekrar bas" olur, ikinci basışta kayıt silinir ve sayfa yeniden yüklenir. (`confirm()` Artifact içinde çalışmadığı için onay sayfanın kendisindedir.)

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
| 4 | İlerlemeyi IndexedDB'ye kaydetme | Yapıldı |
| 5 | Canlı altyapısı ve inek | Yapıldı |
| 6 | Domuz, tavuk ve koyun | Yapıldı |
| 7 | Canlılara vurma | Yapıldı |
| 8 | Zombi | Yapıldı |
| 9 | İskelet | Yapıldı |
| 10 | Örümcek | Yapıldı |
| 11 | Creeper | Yapıldı |
| 12 | Düşmanların gün ışığında yanması | Yapıldı |
| 13 | Eşya düşmesi ve toplama | Yapıldı |
| 14 | Sınırlı hotbar ve envanter ekranı | Yapıldı |
| 15 | Blok kırma süresi ve çatlama | Yapıldı |
| 16 | Üretim ve çalışma masası | Yapıldı |
| 17 | Aletler | Yapıldı |
| 18 | Açlık barı ve yemek | Yapıldı |
| 19 | Fırın ve pişirme | Yapıldı |
| 20 | Maden cevherleri | Yapıldı |
| 21 | Su | Yapıldı |
| 22 | Meşale ve basit ışık | Yapıldı |
| 23 | Yatak | Yapıldı |
| 24 | Kapı ve cam | Yapıldı |
| 25 | Çiçek, uzun ot ve süs bitkileri | Yapıldı |
| 26 | Buğday tarımı ve ekmek | Yapıldı |
| 27 | Mağaralar | Yapıldı |
| 28 | Ses efektleri | Yapıldı |
| 29 | Kırılma parçacıkları | Yapıldı |
| 30 | Duraklat menüsü ve ayarlar | Yapıldı |
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
