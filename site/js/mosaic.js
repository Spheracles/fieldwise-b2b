/* 首頁幾何拼磚：依容器寬度計算欄數與格高（基礎格永遠為正方形），
 * 大圖塊以整數格合併，少量圖塊定期翻轉。文字與入口都是可操作的 HTML。 */
(function () {
  const D = '#07533e', G = '#087a4d', L = '#2e9e4f', M = '#9fcd45', P = '#e6f1d6', C = '#fbfaf3', Y = '#f6d62e', R = '#e5484d';

  /* ---------- 單格圖案（viewBox 0 0 100 100） ---------- */
  const sproutPath = (x, y, s, stem, a, b) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-30" stroke="${stem}" stroke-width="5" stroke-linecap="round"/><path d="M0-20C-14-20-25-30-25-44C-11-44 0-35 0-20Z" fill="${a}"/><path d="M0-25C0-41 12-51 28-51C26-35 15-26 0-25Z" fill="${b}"/></g>`;
  const stalk = (x) =>
    `<path d="M${x} 96V22" stroke="${L}" stroke-width="3"/>` +
    [30, 44, 58, 72].map((y, i) => `<ellipse cx="${x + (i % 2 ? 7 : -7)}" cy="${y}" rx="7" ry="3.4" transform="rotate(${i % 2 ? -35 : 35} ${x + (i % 2 ? 7 : -7)} ${y})" fill="${L}"/><ellipse cx="${x + (i % 2 ? -7 : 7)}" cy="${y + 5}" rx="7" ry="3.4" transform="rotate(${i % 2 ? 35 : -35} ${x + (i % 2 ? -7 : 7)} ${y + 5})" fill="${L}"/>`).join('') +
    `<ellipse cx="${x}" cy="18" rx="3.6" ry="7" fill="${L}"/>`;
  const scallops = (y, color) => Array.from({ length: 5 }, (_, i) => `<path d="M${i * 25 - 12.5} ${y}a12.5 12.5 0 0 1 25 0z" fill="${color}"/>`).join('');

  const PATTERNS = [
    // 0 嫩芽與土丘
    `<rect width="100" height="100" fill="${D}"/><path d="M0 100V80q12-15 25-5q12-17 25 0q13-17 25 0q13-12 25 5V100Z" fill="${C}"/>${sproutPath(50, 78, .9, M, L, M)}`,
    // 1 三株麥穗
    `<rect width="100" height="100" fill="${C}"/>${stalk(26)}${stalk(50)}${stalk(74)}`,
    // 2 朝陽與田埂
    `<rect width="100" height="100" fill="${C}"/><circle cx="50" cy="46" r="24" fill="${Y}"/><path d="M0 100V62Q50 26 100 62V100Z" fill="${L}"/><g fill="none" stroke="${C}" stroke-width="5"><path d="M-6 80Q50 44 106 80"/><path d="M-6 98Q50 62 106 98"/></g>`,
    // 3 大葉片
    `<rect width="100" height="100" fill="${C}"/><path d="M6 96C6 40 40 6 96 6C96 62 62 96 6 96Z" fill="${L}"/><g stroke="${C}" stroke-width="3" fill="none"><path d="M8 94L92 10"/><path d="M28 74L24 52M44 58L40 34M60 42L58 22M28 74L50 78M44 58L68 62M60 42L80 46"/></g>`,
    // 4 波浪
    `<rect width="100" height="100" fill="${D}"/>${scallops(30, C)}${scallops(62, C)}${scallops(94, C)}`,
    // 5 雙苗土丘
    `<rect width="100" height="100" fill="${P}"/><path d="M-5 100Q25 62 52 100ZM44 100Q72 66 106 100Z" fill="${D}"/>${sproutPath(25, 84, .7, L, L, L)}${sproutPath(73, 86, .7, L, L, L)}`,
    // 6 雙葉
    `<rect width="100" height="100" fill="${C}"/><path d="M48 92C18 92 6 66 10 40C34 38 50 60 48 92Z" fill="${D}"/><path d="M52 88C52 52 70 26 94 18C98 52 82 82 52 88Z" fill="${L}"/>`,
    // 7 四葉
    `<rect width="100" height="100" fill="${C}"/><g transform="translate(50 50)"><path d="M0 0C-4-22-22-34-40-30-36-12-22 2 0 0Z" fill="${L}"/><path d="M0 0C22-4 34-22 30-40 12-36-2-22 0 0Z" fill="${M}"/><path d="M0 0C4 22 22 34 40 30 36 12 22-2 0 0Z" fill="${L}"/><path d="M0 0C-22 4-34 22-30 40-12 36 2 22 0 0Z" fill="${M}"/></g>`,
    // 8 田畦條紋
    `<rect width="100" height="100" fill="${G}"/><g fill="none" stroke="${C}" stroke-width="6"><path d="M-10 40Q50 0 110 40"/><path d="M-10 64Q50 24 110 64"/><path d="M-10 88Q50 48 110 88"/></g>`,
    // 9 日出田野
    `<rect width="100" height="100" fill="${P}"/><circle cx="72" cy="30" r="16" fill="${Y}"/><path d="M0 100V58Q40 40 100 66V100Z" fill="${M}"/><path d="M0 100V76Q50 56 100 84V100Z" fill="${L}"/>`,
    // 10 嫩綠單苗
    `<rect width="100" height="100" fill="${M}"/>${sproutPath(50, 86, 1.1, D, D, G)}`,
    // 11 黃色斜紋
    `<rect width="100" height="100" fill="${Y}"/><g stroke="${C}" stroke-width="4"><path d="M-10 30L30-10M-10 60L60-10M-10 90L90-10M10 110L110 10M40 110L110 40M70 110L110 70"/></g>`,
  ];

  /* ---------- 大圖塊 ---------- */
  const lattice = (x0, y0, w, h, step, color) => {
    let d = '';
    for (let k = -h; k < w + h; k += step) d += `M${x0 + k} ${y0}l${h} ${h}M${x0 + k + h} ${y0}l${-h} ${h}`;
    return `<path d="${d}" stroke="${color}" stroke-width="3"/>`;
  };
  const FEATURES = {
    pineapple: { w: 1, h: 2, label: '鳳梨', svg: `<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="200" fill="${C}"/><path d="M50 92L30 34L46 62L44 8L56 60L66 22L62 70L86 40L62 94Z" fill="${L}"/><path d="M50 92L18 58L40 76L50 30L58 78L80 60Z" fill="${G}"/><clipPath id="pine-body"><rect x="16" y="84" width="68" height="110" rx="32"/></clipPath><rect x="16" y="84" width="68" height="110" rx="32" fill="${Y}"/><g clip-path="url(#pine-body)">${lattice(16, 84, 68, 110, 17, '#ffffffcc')}</g></svg>` },
    corn: { w: 1, h: 2, label: '玉米', svg: (() => {
      let kernels = '';
      for (let r = 0; r < 13; r++) for (let c = 0; c < 4; c++) kernels += `<rect x="${33 + c * 8.6}" y="${28 + r * 9.2}" width="7.4" height="8" rx="2.4" fill="#f9e35a"/>`;
      return `<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="200" fill="${D}"/><rect x="30" y="22" width="40" height="132" rx="20" fill="${Y}"/>${kernels}<path d="M50 196C20 170 14 120 26 84C30 118 38 150 52 170Z" fill="${L}"/><path d="M50 196C80 170 86 120 74 84C70 118 62 150 48 170Z" fill="${M}"/><path d="M50 196C40 176 38 160 44 140C48 160 52 176 56 196Z" fill="${G}"/></svg>`;
    })() },
    lychee: { w: 2, h: 2, label: '荔枝', svg: (() => {
      const fruit = (cx, cy, r) => {
        let bumps = '';
        for (let y = -r + 8; y < r; y += 11) for (let x = -r + 8; x < r; x += 12) if (x * x + y * y < (r - 5) * (r - 5)) bumps += `<path d="M${cx + x - 4} ${cy + y + 2}a4 4 0 0 1 8 0" stroke="#ffffffaa" stroke-width="2" fill="none"/>`;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${R}"/>${bumps}`;
      };
      return `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="${C}"/><path d="M98 12C96 40 80 60 66 92M98 12C104 44 118 66 132 86M98 12C100 50 100 80 104 120" stroke="#6b3d1f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M98 30C70 22 40 32 26 56C56 64 82 54 98 30Z" fill="${L}"/><path d="M104 34C128 18 164 20 182 42C156 58 124 56 104 34Z" fill="${G}"/>${fruit(64, 112, 34)}${fruit(132, 110, 34)}${fruit(80, 158, 32)}<circle cx="142" cy="160" r="30" fill="${R}"/><circle cx="142" cy="160" r="23" fill="#ffffff"/><ellipse cx="143" cy="161" rx="9" ry="12" fill="#6b3d1f"/></svg>`;
    })() },
  };

  /* ---------- 版型：依欄數切換（每個項目：類型、欄、列、寬、高） ---------- */
  const LAYOUTS = {
    10: { rows: 5, items: [
      ['entry', 2, 0, 1, 1, 0], ['feature', 4, 0, 1, 2, 'pineapple'], ['entry', 7, 0, 1, 1, 1],
      ['feature', 6, 1, 1, 3, 'corn'], ['copy', 0, 2, 4, 2], ['feature', 4, 2, 2, 2, 'lychee'],
      ['entry', 8, 2, 1, 2, 2], ['entry', 4, 4, 1, 1, 3],
    ] },
    7: { rows: 6, items: [
      ['entry', 1, 0, 1, 1, 0], ['feature', 3, 0, 1, 2, 'pineapple'], ['entry', 5, 0, 1, 1, 1],
      ['feature', 5, 1, 1, 2, 'corn'], ['copy', 0, 2, 4, 3], ['feature', 4, 3, 2, 2, 'lychee'],
      ['entry', 6, 2, 1, 1, 2], ['entry', 2, 5, 1, 1, 3],
    ] },
    4: { rows: 7, items: [
      ['entry', 0, 0, 1, 1, 0], ['entry', 2, 0, 1, 1, 1], ['copy', 0, 1, 4, 3],
      ['feature', 0, 4, 2, 2, 'lychee'], ['feature', 2, 4, 1, 2, 'pineapple'], ['feature', 3, 4, 1, 2, 'corn'],
      ['entry', 0, 6, 1, 1, 2], ['entry', 2, 6, 1, 1, 3],
    ] },
  };

  const ENTRIES = [
    ['01', '當季農產', '#products', 'products-season'],
    ['02', '產地故事', '#about', 'story'],
    ['03', '食農體驗', '#support', 'support-trip'],
    ['04', '最新消息', '#news', 'news'],
  ];

  const COPY_HTML = `<h1 id="hero-title">把土地的美好<br>帶進每一天</h1><p class="sub">認識當季農產　發現產地故事</p><div class="hero-actions"><a class="btn solid" href="#services">我是小農 <span class="arrow">↗</span></a><a class="btn yellow" href="#support">我要支持小農 <span class="arrow">↗</span></a></div>`;

  const grid = document.getElementById('mosaic');
  let current = '';

  function layoutFor(width) {
    if (width >= 1200) return { base: 10, cols: Math.max(10, Math.round(width / 150)) };
    if (width >= 760) return { base: 7, cols: 7 };
    return { base: 4, cols: 4 };
  }

  function build() {
    const width = grid.parentElement.clientWidth;
    const { base, cols } = layoutFor(width);
    const cell = width / cols;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--cell', cell + 'px');
    const key = base + ':' + cols;
    if (key === current) return;
    current = key;
    const L = LAYOUTS[base];
    const occupied = Array.from({ length: L.rows }, () => Array(cols).fill(false));
    const out = [];
    L.items.forEach(([type, c, r, w, h, extra]) => {
      for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) occupied[y][x] = true;
      const pos = `grid-column:${c + 1}/span ${w};grid-row:${r + 1}/span ${h}`;
      if (type === 'copy') out.push(`<div class="hero-copy" style="${pos}">${COPY_HTML}</div>`);
      else if (type === 'entry') {
        const [num, label, href, action] = ENTRIES[extra];
        out.push(`<a class="entry" style="${pos}" href="${href}" data-action="${action}"><span><span class="num">${num}</span><span class="label">${label}</span></span><span class="go" aria-hidden="true">↗</span></a>`);
      } else out.push(`<div class="feature" style="${pos}" role="img" aria-label="${FEATURES[extra].label}的幾何插圖">${FEATURES[extra].svg}</div>`);
    });
    // 依序挑選圖案，避開左方與上方相同的圖案，讓拼磚分布更均勻
    const pick = Array.from({ length: L.rows }, () => Array(cols).fill(-1));
    let n = 0;
    for (let y = 0; y < L.rows; y++) for (let x = 0; x < cols; x++) {
      if (occupied[y][x]) continue;
      let a = (x * 7 + y * 5 + n * 3) % PATTERNS.length;
      for (let k = 0; k < PATTERNS.length; k++) {
        const c = (a + k) % PATTERNS.length;
        if (c !== (x > 0 ? pick[y][x - 1] : -1) && c !== (y > 0 ? pick[y - 1][x] : -1) && c !== (x > 0 && y > 0 ? pick[y - 1][x - 1] : -1)) { a = c; break; }
      }
      pick[y][x] = a;
      const b = (a + 5 + (n % 4)) % PATTERNS.length;
      n++;
      out.push(`<div class="tile" style="grid-column:${x + 1};grid-row:${y + 1}" aria-hidden="true"><div class="tile-inner"><div class="face"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${PATTERNS[a]}</svg></div><div class="face back"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${PATTERNS[b]}</svg></div></div></div>`);
    }
    grid.style.gridTemplateRows = `repeat(${L.rows}, var(--cell))`;
    grid.innerHTML = out.join('');
  }

  const ro = new ResizeObserver(() => requestAnimationFrame(build));
  ro.observe(grid.parentElement);
  build();

  /* 定期翻轉一格；暫停動畫、減少動態或頁面隱藏時停止 */
  setInterval(() => {
    if (window.motionPaused || document.hidden) return;
    const tiles = grid.querySelectorAll('.tile');
    if (!tiles.length) return;
    tiles[Math.floor(Math.random() * tiles.length)].classList.toggle('flipped');
  }, 1500);

  window.MOSAIC = { rebuild: () => { current = ''; build(); } };
})();
