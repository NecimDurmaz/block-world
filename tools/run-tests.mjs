// Bütün testleri sırayla görünmez Chrome'da çalıştırır ve özet yazar.
// Aşamalı testler (adı -a.js, -b.js … ile biten) aynı önekle gruplanıp birlikte verilir.
// Kullanım: node tools/run-tests.mjs [ad-filtresi]
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const filter = process.argv[2] || '';
const files = readdirSync(join(root, 'tests')).filter(f => f.endsWith('.js') && f.includes(filter)).sort();
const groups = new Map();
for (const f of files) {
  const stage = f.match(/^(.*)-[a-z]\.js$/);
  const key = stage ? stage[1] : f;
  groups.set(key, [...(groups.get(key) || []), join('tests', f)]);
}
let failed = 0;
for (const [name, group] of groups) {
  const run = spawnSync('node', [join(root, 'tools/browser-test.mjs'), ...group], { cwd: root, encoding: 'utf8' });
  const ok = run.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'GEÇTİ ' : 'KALDI '} ${name}`);
  if (!ok) console.log((run.stdout || run.stderr).split('\n').map(l => '        ' + l).join('\n'));
}
console.log(`\n${groups.size - failed}/${groups.size} test grubu geçti`);
process.exit(failed ? 1 : 0);
