// ---------- Elde alet ----------
// Seçili alet: aşınma ve elde görünme.

const selectedTool = () => inventory[selected] && ITEMS[inventory[selected].key].tool ? inventory[selected] : null;
// Alet her kırma ve vuruşta 1 aşınır; bitince kırılır.
function useTool() {
  const s = inventory[selected];
  s.durability--;
  if (s.durability <= 0) { inventory[selected] = null; toast(ITEMS[s.key].name + ' kırıldı'); }
  renderInventory();
}
// Seçili alet gözden görünümde kolun ucunda, 3. şahıs modelde sağ elde düz bir simge olarak görünür.
const toolTextures = {};
const heldToolMaterial = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
const fpTool = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), heldToolMaterial);
fpTool.position.set(0, -0.42, -0.12);
fpTool.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
fpArm.add(fpTool);
const tpTool = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), heldToolMaterial);
tpTool.position.set(0, -0.6, -0.18);
tpTool.rotation.set(-Math.PI / 2, Math.PI / 2, 0);
armR.add(tpTool);
function updateHeldTool() {
  const tool = selectedTool();
  fpTool.visible = tpTool.visible = !!tool;
  if (!tool) return;
  if (!toolTextures[tool.key]) {
    const t = new THREE.CanvasTexture(ITEMS[tool.key].canvas);
    t.magFilter = t.minFilter = THREE.NearestFilter;
    toolTextures[tool.key] = t;
  }
  if (heldToolMaterial.map !== toolTextures[tool.key]) { heldToolMaterial.map = toolTextures[tool.key]; heldToolMaterial.needsUpdate = true; }
}

renderInventory();
selectSlot(0);
Object.assign(window.game, { inventory, addItem, openInventory, closeInventory, clickSlot, clickCraft, clickResult, craftGrid });
Object.assign(window.game, { mining: miningState, crackVisible: () => crackBox.visible });
Object.assign(window.game, { hunger, renderFood });
Object.assign(window.game, { getSpawnPoint: () => spawnPoint, isSleeping: () => sleepTimer > 0 });
Object.assign(window.game, { crops, trySpawnHostile });
Object.assign(window.game, { furnaces, openFurnace, clickFurnace, rebuild: buildChunk, camera, cameraDistance: () => cameraDistance, raycast, torchNearby, torchLight: (x, y, z) => torchLightAt(torchesNear(x - 8, z - 8, x + 8, z + 8), x, y, z) });
