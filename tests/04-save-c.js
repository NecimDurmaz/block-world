// Madde 4, aşama 3: "Yeni dünya" iki basışta kaydı siler ve sayfayı yeniden yükler
const reset = document.getElementById('reset');
reset.click();
if (reset.textContent !== 'Emin misin? Tekrar bas') return { ok: false, text: reset.textContent };
reset.click();
await wait(5000);
return { ok: false, reason: 'sayfa yeniden yüklenmedi' };
