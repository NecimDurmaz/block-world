// Oyunu görünmez (headless) Chrome'da açar, verilen test dosyasını sayfada çalıştırır ve sonucu yazdırır.
// Kullanım: node tools/browser-test.mjs tests/02-fall-damage.js [ikinci-asama.js ...] [ekran.png]
// Test dosyası, async bir fonksiyonun gövdesidir: `wait(ms)` ve `window.game` kullanılabilir,
// sonunda `{ ok: true/false, ... }` döndürür. Birden çok dosya verilirse her biri sayfa yeniden
// yüklendikten sonra sırayla çalışır; tarayıcı profili (IndexedDB) aşamalar arasında korunur.
// Bir aşama sayfayı kendisi yeniden yüklerse (ör. "Yeni dünya") sonucu `{ ok: true, reloaded: true }` sayılır.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const testFiles = args.filter(a => a.endsWith('.js'));
const shotFile = args.find(a => a.endsWith('.png'));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.md': 'text/plain; charset=utf-8' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const profile = await mkdtemp(join(tmpdir(), 'block-world-chrome-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1280,800',
  '--no-first-run', '--no-default-browser-check', 'about:blank',
], { stdio: 'ignore' });

async function cleanup(code) {
  chrome.kill();
  server.close();
  await sleep(300);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  process.exit(code);
}

try {
  // Chrome, açtığı hata ayıklama portunu profil klasörüne yazar.
  let devtoolsPort;
  for (let i = 0; i < 100 && !devtoolsPort; i++) {
    devtoolsPort = await readFile(join(profile, 'DevToolsActivePort'), 'utf8').then(t => t.split('\n')[0]).catch(() => null);
    if (!devtoolsPort) await sleep(100);
  }
  const targets = await (await fetch(`http://127.0.0.1:${devtoolsPort}/json/list`)).json();
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

  let nextId = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map(a => a.value ?? a.description).join(' '));
  };
  const send = (method, params = {}) => new Promise(r => {
    const id = ++nextId;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const { result, error } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (error) throw new Error(error.message);
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  const openGame = async () => {
    await send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    for (let i = 0; i < 100; i++) {
      if (await evaluate('document.readyState === "complete" && !!window.game?.ready').catch(() => false)) return;
      await sleep(100);
    }
    throw new Error('Oyun 10 sn içinde hazır olmadı');
  };

  const results = [];
  for (const file of testFiles.length ? testFiles : [null]) {
    await openGame();
    if (!file) { results.push({ ok: true }); continue; }
    const code = await readFile(file, 'utf8');
    try {
      results.push(await evaluate(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms));\n${code}\n})()`));
    } catch (err) {
      if (!/context was destroyed|navigated|Cannot find context/i.test(err.message)) throw err;
      results.push({ ok: true, reloaded: true });
      await sleep(1000);
    }
  }
  if (shotFile) {
    const { result } = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(shotFile, Buffer.from(result.data, 'base64'));
  }
  const ok = results.every(r => r?.ok !== false) && !errors.length;
  console.log(JSON.stringify(results.length === 1 ? { ...results[0], errors } : { ok, results, errors }, null, 2));
  await cleanup(ok ? 0 : 1);
} catch (err) {
  console.error(err);
  await cleanup(2);
}
