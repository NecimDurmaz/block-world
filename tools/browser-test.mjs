// Oyunu görünmez (headless) Chrome'da açar, verilen test dosyasını sayfada çalıştırır ve sonucu yazdırır.
// Kullanım: node tools/browser-test.mjs tests/02-fall-damage.js [ekran.png]
// Test dosyası, async bir fonksiyonun gövdesidir: `wait(ms)` ve `window.game` kullanılabilir,
// sonunda `{ ok: true/false, ... }` döndürür.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join, extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const [testFile, shotFile] = process.argv.slice(2);
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
    const { result } = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/block-world.html` });
  for (let i = 0; i < 100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.game').catch(() => false)) break;
    await sleep(100);
  }

  let value = { ok: true };
  if (testFile) {
    const code = await readFile(testFile, 'utf8');
    value = await evaluate(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms));\n${code}\n})()`);
  }
  if (shotFile) {
    const { result } = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(shotFile, Buffer.from(result.data, 'base64'));
  }
  console.log(JSON.stringify({ ...value, errors }, null, 2));
  await cleanup(value?.ok === false || errors.length ? 1 : 0);
} catch (err) {
  console.error(err);
  await cleanup(2);
}
