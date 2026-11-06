// ---------- Ekinler ----------
// Ekinlerin büyümesi.

// Her ekin, ortalama 60 sn'de bir sonraki aşamaya geçer (oyun oynanırken). Aşama dünya dizisinde durur, kayda girer.
const CROP_STAGE_TIME = 60;
const crops = new Map(); // "x,y,z" -> sonraki aşamaya kalan sn
const nextStageTime = () => CROP_STAGE_TIME * (0.6 + Math.random() * 0.8);
function plantCrop(x, y, z) { crops.set(x + ',' + y + ',' + z, nextStageTime()); }
// Yüklenen dünyadaki olgunlaşmamış ekinleri bulur
function scanCrops() {
  crops.clear();
  for (let y = 0; y < SY; y++) for (let z = 0; z < SZ; z++) for (let x = 0; x < SX; x++) {
    const b = world[index(x, y, z)];
    if (isCrop(b) && b !== B.wheat_3) plantCrop(x, y, z);
  }
}
function updateCrops(dt) {
  for (const [key, left] of crops) {
    if (left - dt > 0) { crops.set(key, left - dt); continue; }
    const [x, y, z] = key.split(',').map(Number);
    const b = get(x, y, z);
    if (!isCrop(b) || b === B.wheat_3) { crops.delete(key); continue; }
    set(x, y, z, b + 1);
    rebuildAround(x, z);
    if (b + 1 === B.wheat_3) crops.delete(key); else crops.set(key, nextStageTime());
  }
}
