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
    // 12 綠色拱形波紋
    `<rect width="100" height="100" fill="${C}"/><g fill="none" stroke="${L}" stroke-width="8" stroke-linecap="round">${[26, 54, 82].map((y) => `<path d="M-12 ${y}${Array.from({ length: 5 }, () => 'q12.5-17 25 0').join('')}"/>`).join('')}</g>`,
    // 13 葉片植株
    `<rect width="100" height="100" fill="${C}"/><path d="M50 98V20" stroke="${G}" stroke-width="3.5"/>${[[34, 1], [52, .9], [70, .8]].map(([y, k]) => `<path d="M49 ${y + 14}C40 ${y + 16} 24 ${y + 6} 22 ${y - 6}C36 ${y - 8} 46 ${y} 49 ${y + 14}Z" fill="${L}" transform="scale(1)"/><path d="M51 ${y + 14}C60 ${y + 16} 76 ${y + 6} 78 ${y - 6}C64 ${y - 8} 54 ${y} 51 ${y + 14}Z" fill="${G}"/>`).join('')}<path d="M50 30C42 24 42 12 50 4C58 12 58 24 50 30Z" fill="${L}"/>`,
    // 14 三株嫩芽與土丘
    `<rect width="100" height="100" fill="${C}"/><path d="M-6 100Q10 76 28 100ZM26 100Q50 72 74 100ZM72 100Q90 76 106 100Z" fill="${D}"/>${sproutPath(14, 90, .5, M, M, L)}${sproutPath(50, 86, .55, M, M, L)}${sproutPath(86, 90, .5, M, M, L)}`,
  ];

  /* ---------- 大圖塊 ---------- */
  const lattice = (x0, y0, w, h, step, color) => {
    let d = '';
    for (let k = -h; k < w + h; k += step) d += `M${x0 + k} ${y0}l${h} ${h}M${x0 + k + h} ${y0}l${-h} ${h}`;
    return `<path d="${d}" stroke="${color}" stroke-width="4"/>`;
  };
  /* 玉米：依參考圖，子彈形玉米穗、3 欄方格玉米粒、兩片大葉交疊成 V 字。
   * 圖形畫在 100×264 的座標內，依圖塊高度等比縮放置中，不拉伸。 */
  const corn = (h) => {
    const H = 100 * h, k = Math.min(1, H / 264), ox = (100 - 100 * k) / 2, oy = (H - 264 * k) / 2;
    const cob = 'M27 104C27 52 38 22 50 22C62 22 73 52 73 104V186Q73 204 50 204Q27 204 27 186Z';
    let kernels = '';
    for (let r = 0; r < 13; r++) for (let c = 0; c < 3; c++) kernels += `<rect x="${28.6 + c * 14.6}" y="${23 + r * 15.4}" width="13" height="13.6" rx="3" fill="#f5c62a"/>`;
    return `<svg viewBox="0 0 100 ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="${H}" fill="${D}"/>` +
      `<g transform="translate(${ox} ${oy}) scale(${k})"><clipPath id="corn-cob-${h}"><path d="${cob}"/></clipPath>` +
      `<path d="${cob}" fill="#0a4a31"/><g clip-path="url(#corn-cob-${h})">${kernels}</g>` +
      `<path d="M51 258Q12 204 8 98Q36 128 57 180Z" fill="#6cc24a"/>` +
      `<path d="M51 258Q28 214 20 150Q40 166 55 196Z" fill="#5db642"/>` +
      `<path d="M49 258Q88 204 92 98Q64 128 43 180Z" fill="#3f9f3e"/>` +
      `<path d="M49 258Q72 214 80 150Q60 166 45 196Z" fill="#4aab43"/>` +
      `</g></svg>`;
  };
  const FEATURES = {
    pineapple: { w: 1, h: 2, label: '鳳梨', svg: `<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="200" fill="${C}"/><clipPath id="pine-body"><rect x="0" y="100" width="100" height="100"/></clipPath><rect x="0" y="100" width="100" height="100" fill="${Y}"/><g clip-path="url(#pine-body)">${lattice(0, 100, 100, 100, 20, '#ffffff')}</g>` +
      `<path d="M50 104L2 34L36 66Z" fill="${L}"/><path d="M50 104L98 34L64 66Z" fill="${L}"/><path d="M50 104L16 14L44 58Z" fill="${G}"/><path d="M50 104L84 14L56 58Z" fill="${G}"/><path d="M50 104L38 40L50 4L62 40Z" fill="${L}"/><path d="M50 104L6 76L30 80Z" fill="${M}"/><path d="M50 104L94 76L70 80Z" fill="${M}"/></svg>` },
    corn: { w: 1, h: 2, label: '玉米', svg: corn(2), svg3: corn(3) },
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
    // 桌面版依參考圖「最新首頁方向」：8 欄 5 列，空白格的圖案也照參考圖排列
    8: { rows: 5, items: [
      ['entry', 2, 0, 1, 1, 0], ['feature', 4, 0, 1, 2, 'pineapple'], ['entry', 6, 0, 1, 1, 1],
      ['feature', 5, 1, 1, 3, 'corn'], ['copy', 0, 2, 3, 2], ['feature', 3, 2, 2, 2, 'lychee'],
      ['entry', 7, 2, 1, 2, 2], ['entry', 3, 4, 1, 1, 3],
    ], tiles: [
      [0, 1, -1, 2, -1, 6, -1, 12],
      [3, 4, 5, 6, -1, -1, 2, 13],
      [-1, -1, -1, -1, -1, -1, 7, -1],
      [-1, -1, -1, -1, -1, -1, 10, -1],
      [8, 4, 2, -1, 14, 3, 4, 5],
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

  const COPY_HTML = `<h1 id="hero-title">把土地的美好<br>帶進每一天</h1><p class="sub">認識當季農產　發現產地故事</p><div class="hero-actions"><a class="btn solid" href="#products" data-action="products-season">探索當季農產 <span class="arrow">↗</span></a></div>`;

  const grid = document.getElementById('mosaic');
  let current = '';

  function layoutFor(width) {
    if (width >= 1000) return { base: 8, cols: Math.max(8, Math.round(width / 200)) };
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
      } else {
        const f = FEATURES[extra];
        out.push(`<div class="feature" style="${pos}" role="img" aria-label="${f.label}的幾何插圖">${h === 3 && f.svg3 ? f.svg3 : f.svg}</div>`);
      }
    });
    // 依序挑選圖案，避開左方與上方相同的圖案，讓拼磚分布更均勻
    const pick = Array.from({ length: L.rows }, () => Array(cols).fill(-1));
    let n = 0;
    for (let y = 0; y < L.rows; y++) for (let x = 0; x < cols; x++) {
      if (occupied[y][x]) continue;
      let a = (x * 7 + y * 5 + n * 3) % PATTERNS.length;
      const fixed = L.tiles && L.tiles[y] && L.tiles[y][x];
      if (fixed >= 0) a = fixed;
      else for (let k = 0; k < PATTERNS.length; k++) {
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
