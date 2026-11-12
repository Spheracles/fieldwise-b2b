// 產生單一檔案網站：node site/build.mjs [輸出資料夾，預設 docs]
// 內嵌 styles.css、js/*.js 與 assets/ 圖片；public/ 內的圖示與影片複製到輸出資料夾。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(process.argv[2] || path.join(SITE, '..', 'docs'));
const read = (p) => fs.readFileSync(path.join(SITE, p), 'utf8');
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

const assets = {};
(function walk(dir, rel) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name), r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) walk(p, r);
    else if (MIME[path.extname(e.name)]) assets[r] = `data:${MIME[path.extname(e.name)]};base64,${fs.readFileSync(p).toString('base64')}`;
  }
})(path.join(SITE, 'assets'), '');

let html = read('index.html');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${read('styles.css')}\n</style>`);
const block = html.match(/<!--SCRIPTS-->([\s\S]*?)<!--\/SCRIPTS-->/)[1];
const files = [...block.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
const js = `window.ASSETS=${JSON.stringify(assets)};\n` + files.map((f) => `/* ${f} */\n` + read(f)).join('\n');
html = html.replace(/<!--SCRIPTS-->[\s\S]*?<!--\/SCRIPTS-->/, () => `<script>\n${js.replace(/<\/script/gi, '<\\/script')}\n</script>`);

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.cpSync(path.join(SITE, 'public'), OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log(`docs/index.html ${(html.length / 1024).toFixed(0)} KB，內嵌圖片 ${Object.keys(assets).length} 張`);
