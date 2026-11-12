/* 首頁幾何拼磚：依容器寬度計算欄數與格高（基礎格永遠為正方形），
 * 大圖塊以整數格合併，少量圖塊定期翻轉。文字與入口都是可操作的 HTML。 */
(function () {
  /* 配色取自參考圖「最新首頁方向」 */
  const D = '#045c36', G = '#0b7a3d', L = '#2ea64f', M = '#7cbf2c', M2 = '#94c83a', P = '#e0eed3', C = '#f8fbf2', Y = '#fbca25', R = '#de3f3a', PK = '#ffc8b8';

  /* ---------- 單格圖案（viewBox 0 0 100 100），逐格依參考圖繪製 ---------- */
  // 田野：綠色山坡＋白色弧線（cx、cy 為弧線圓心，rs 為半徑）
  const fields = (top, cx, cy, rs, color) =>
    `<clipPath id="f${top}${cx}${cy}"><path d="${top}"/></clipPath><path d="${top}" fill="${color}"/><g clip-path="url(#f${top}${cx}${cy})" fill="none" stroke="${C}" stroke-width="5">${rs.map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('')}</g>`;
  // 拱形波紋：每列一串半圓弧（線條）
  const arches = (ys, period, color, width, bg) =>
    `<rect width="100" height="100" fill="${bg}"/><g fill="none" stroke="${color}" stroke-width="${width}">${ys.map((y) => `<path d="M${-period / 2} ${y}${Array.from({ length: Math.ceil(100 / period) + 2 }, () => `a${period / 2} ${period * .42} 0 0 1 ${period} 0`).join('')}"/>`).join('')}</g>`;
  // 半月形小葉（基點 x,y，朝左或右）
  const budL = (x, y, w, h, c) => `<path d="M${x} ${y}C${x - w * .45} ${y + h * .08} ${x - w} ${y - h * .3} ${x - w} ${y - h}C${x - w * .4} ${y - h * 1.02} ${x - w * .02} ${y - h * .6} ${x} ${y}Z" fill="${c}"/>`;
  const budR = (x, y, w, h, c) => `<path d="M${x} ${y}C${x + w * .02} ${y - h * .6} ${x + w * .4} ${y - h * 1.02} ${x + w} ${y - h}C${x + w} ${y - h * .3} ${x + w * .45} ${y + h * .08} ${x} ${y}Z" fill="${c}"/>`;
  const oval = (cx, cy, rx, ry, rot, c) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="${c}"/>`;
  // 尖葉：基點 x,y，長 len、寬 w、角度 deg（0 為向右，負值往上）
  const leaf = (x, y, len, w, deg, c) => `<path d="M0 0C${len * .3} ${-w} ${len * .72} ${-w * .8} ${len} 0C${len * .72} ${w * .8} ${len * .3} ${w} 0 0Z" transform="translate(${x} ${y}) rotate(${deg})" fill="${c}"/>`;
  const wheat = (x) => `<path d="M${x} 100V26" stroke="#5fae4c" stroke-width="1.6"/>` + oval(x, 22, 5.4, 10, 0, '#6cb939') +
    [46, 62, 78].map((y) => leaf(x, y, 18, 5.8, -136, '#4fa84a') + leaf(x, y, 18, 5.8, -44, '#6cb939')).join('');

  const PATTERNS = [
    // 0 深綠底嫩芽與白雲
    `<rect width="100" height="100" fill="${D}"/><rect x="47.6" y="48" width="3.6" height="40" fill="${C}"/>${budL(49, 60, 34, 27, M)}${budR(50, 52, 37, 37, M2)}<g fill="${C}"><circle cx="15" cy="102" r="18"/><circle cx="50" cy="100" r="19"/><circle cx="85" cy="102" r="18"/><rect y="94" width="100" height="6"/></g>`,
    // 1 三株麥穗
    `<rect width="100" height="100" fill="${C}"/>${wheat(20)}${wheat(50)}${wheat(80)}`,
    // 2 朝陽與田野
    `<rect width="100" height="100" fill="${C}"/><circle cx="52" cy="50" r="30" fill="${Y}"/>${fields('M0 100V50Q50 44 100 56V100Z', 30, 190, [140, 125, 110, 95], '#1f9a4a')}`,
    // 3 嫩綠與深綠雙葉（杯形）
    `<rect width="100" height="100" fill="${C}"/><path d="M50 90C22 90 8 66 8 26C34 24 50 46 50 90Z" fill="#6cb939"/><path d="M50 90C50 50 66 26 94 26C94 66 78 90 50 90Z" fill="${D}"/>`,
    // 4 綠色拱形波紋
    arches([30, 62, 94], 50, L, 8.5, C),
    // 5 大葉與葉脈
    `<rect width="100" height="100" fill="${C}"/><path d="M0 12C44 8 86 28 96 62C100 78 98 92 94 100H34C20 94 6 80 0 60Z" fill="#4aa83c"/><g stroke="${C}" stroke-width="3.2" fill="none"><path d="M0 12L94 100"/><path d="M30 10V40M48 14V57M66 22V74M0 38H28M0 56H47M6 75H67"/></g>`,
    // 6 深綠底白色拱紋
    arches([28, 60, 92], 33.4, C, 6.5, G),
    // 7 淺綠底雙苗與土丘
    `<rect width="100" height="100" fill="${P}"/><ellipse cx="25" cy="100" rx="27" ry="30" fill="${G}"/><ellipse cx="74" cy="100" rx="27" ry="30" fill="${G}"/><rect x="26.6" y="34" width="2.8" height="40" fill="${G}"/><rect x="71.6" y="34" width="2.8" height="40" fill="${G}"/>${budL(28, 36, 20, 15, G)}${budR(28, 36, 20, 15, G)}${budL(73, 36, 20, 15, G)}${budR(73, 36, 20, 15, G)}`,
    // 8 深綠小葉與綠色高葉
    `<rect width="100" height="100" fill="${C}"/><path d="M50 92C26 92 12 74 12 36C36 36 50 54 50 92Z" fill="${D}"/><path d="M50 92C50 40 64 6 96 6C96 58 80 90 50 92Z" fill="#31a856"/>`,
    // 9 右上朝陽與田野
    `<rect width="100" height="100" fill="${C}"/><circle cx="62" cy="32" r="28" fill="${Y}"/>${fields('M0 100V48Q50 38 100 44V100Z', 72, 172, [124, 108, 92, 76], '#1f9a4a')}`,
    // 10 葉片植株
    `<rect width="100" height="100" fill="${C}"/><path d="M50 100V16" stroke="#b7d99c" stroke-width="1.6"/>${leaf(50, 34, 28, 8.5, -90, '#3fa548')}${[44, 64, 84].map((y, i) => leaf(50, y, 33, 10.5, -158, '#2e9a43') + leaf(50, y, 33, 10.5, -22, i === 1 ? '#6cbc2c' : '#46a93f')).join('')}`,
    // 11 四葉
    `<rect width="100" height="100" fill="${C}"/><path d="M48 47C44 24 26 14 6 16C8 38 26 50 48 47Z" fill="${M}"/><path d="M52 47C56 24 74 14 94 16C92 38 74 50 52 47Z" fill="${G}"/><path d="M48 53C44 76 26 86 6 84C8 62 26 50 48 53Z" fill="${G}"/><path d="M52 53C56 76 74 86 94 84C92 62 74 50 52 53Z" fill="${M}"/>`,
    // 12 大弧田畦
    `<rect width="100" height="100" fill="${C}"/><circle cx="-4" cy="132" r="128" fill="#1d9548"/><g fill="none" stroke="${C}" stroke-width="7"><circle cx="-4" cy="132" r="104"/><circle cx="-4" cy="132" r="78"/></g>`,
    // 13 大朝陽與山坡
    `<rect width="100" height="100" fill="${C}"/><circle cx="50" cy="42" r="32" fill="${Y}"/>${fields('M0 100V58Q50 50 100 54V100Z', 84, 178, [126, 111, 96, 81], '#1f9a4a')}<path d="M0 60Q26 56 44 64Q22 72 0 84Z" fill="#6cb939"/>`,
    // 14 三株嫩芽與土丘
    `<rect width="100" height="100" fill="${C}"/>${[17, 50, 83].map((x) => `<ellipse cx="${x}" cy="102" rx="18" ry="26" fill="${G}"/><rect x="${x - 1.4}" y="30" width="2.8" height="48" fill="${M}"/>${budL(x, 34, 15, 13, M2)}${budR(x, 34, 15, 13, M)}`).join('')}`,
    // 15 斜向大葉與葉脈
    `<rect width="100" height="100" fill="${C}"/><path d="M8 100C2 66 10 38 32 20C52 6 78 4 96 4C100 34 96 72 84 100Z" fill="#1e9a47"/><g stroke="${C}" stroke-width="3.2" fill="none"><path d="M26 100L96 6"/><path d="M30 94V30M44 76V16M58 57V8M72 38V5M44 76H94M58 57H98M72 38H98M84 22H98"/></g>`,
    // 16 淺綠底嫩芽與土丘
    `<rect width="100" height="100" fill="${P}"/><ellipse cx="24" cy="104" rx="31" ry="28" fill="${G}"/><ellipse cx="78" cy="104" rx="31" ry="28" fill="${G}"/><rect x="48.6" y="44" width="3" height="56" fill="${D}"/>${budL(50, 60, 32, 34, '#6cb939')}${budR(50, 54, 36, 38, '#0b6a38')}`,
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
    const H = 100 * h, k = Math.min(1, H / 264), ox = (100 - 100 * k) / 2, oy = H >= 264 ? -8 : (H - 264 * k) / 2, ky = H >= 264 ? (H + 8) / 262 : k;
    const cob = 'M27 104C27 52 38 22 50 22C62 22 73 52 73 104V186Q73 204 50 204Q27 204 27 186Z';
    let kernels = '';
    for (let r = 0; r < 13; r++) for (let c = 0; c < 3; c++) kernels += `<rect x="${28.6 + c * 14.6}" y="${23 + r * 15.4}" width="13" height="13.6" rx="3" fill="#f5c62a"/>`;
    return `<svg viewBox="0 0 100 ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="${H}" fill="${D}"/>` +
      `<g transform="translate(${ox} ${oy}) scale(${k} ${ky})"><clipPath id="corn-cob-${h}"><path d="${cob}"/></clipPath>` +
      `<path d="${cob}" fill="#0a4a31"/><g clip-path="url(#corn-cob-${h})">${kernels}</g>` +
      `<path d="M51 258Q12 204 8 98Q36 128 57 180Z" fill="#6cc24a"/>` +
      `<path d="M51 258Q28 214 20 150Q40 166 55 196Z" fill="#5db642"/>` +
      `<path d="M49 258Q88 204 92 98Q64 128 43 180Z" fill="#3f9f3e"/>` +
      `<path d="M49 258Q72 214 80 150Q60 166 45 196Z" fill="#4aab43"/>` +
      `</g></svg>`;
  };
  // 荔枝表皮的小白點
  const dots = (cx, cy, r) => {
    let d = '';
    let row = 0;
    for (let y = -r + 10; y < r - 4; y += 11, row++) for (let x = -r + 8 + (row % 2 ? 5.5 : 0); x < r - 4; x += 11) if (x * x + y * y < (r - 7) * (r - 7)) d += `M${cx + x - 3.4} ${cy + y}a3.4 3.4 0 0 1 6.8 0z`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${R}"/><path d="${d}" fill="${PK}"/>`;
  };
  const FEATURES = {
    pineapple: { w: 1, h: 2, label: '鳳梨', svg: `<svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="200" fill="${C}"/><clipPath id="pine-body"><path d="M0 116Q0 100 16 100H84Q100 100 100 116V200H0Z"/></clipPath><path d="M0 116Q0 100 16 100H84Q100 100 100 116V200H0Z" fill="#ffc525"/><g clip-path="url(#pine-body)">${lattice(0, 100, 100, 100, 24, C)}</g>` +
      `<path d="M0 54L52 102H12Z" fill="${G}"/><path d="M100 54L48 102H88Z" fill="${G}"/><path d="M14 24L58 102H26Z" fill="#4fae3a"/><path d="M86 24L42 102H74Z" fill="${L}"/><path d="M50 4L29 102H50Z" fill="#4fa938"/><path d="M50 4L71 102H50Z" fill="#076739"/></svg>` },
    corn: { w: 1, h: 2, label: '玉米', svg: corn(2), svg3: corn(3) },
    lychee: { w: 2, h: 2, label: '荔枝', svg: `<svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="${C}"/>` +
      `<path d="M78 0L104 62M84 14C110 26 140 40 150 62" stroke="#5a321a" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
      `<path d="M10 70Q40 18 84 22Q60 56 10 70Z" fill="#066734"/><path d="M10 70Q50 50 84 22Q66 62 10 70Z" fill="#2da951"/>` +
      `<path d="M108 38Q140 14 180 30Q150 50 108 38Z" fill="#2da951"/><path d="M108 38Q146 36 180 30Q150 52 108 38Z" fill="#066734"/>` +
      `${dots(104, 92, 33)}${dots(168, 100, 31)}${dots(44, 150, 33)}${dots(104, 168, 30)}` +
      `<circle cx="140" cy="132" r="31" fill="${R}"/><circle cx="137" cy="129" r="27" fill="#fcf7f1"/><ellipse cx="136" cy="124" rx="8" ry="12" transform="rotate(8 136 124)" fill="#5e341c"/></svg>` },
  };

  /* ---------- 版型：依欄數切換（每個項目：類型、欄、列、寬、高） ---------- */
  const LAYOUTS = {
    // 依參考圖「最新首頁方向」：桌面 8 欄 5 列；平板與手機沿用同一組圖案，tiles 固定每格圖案
    8: { rows: 5, items: [
      ['entry', 2, 0, 1, 1, 0], ['feature', 4, 0, 1, 2, 'pineapple'], ['entry', 6, 0, 1, 1, 1],
      ['feature', 5, 1, 1, 3, 'corn'], ['copy', 0, 2, 3, 2], ['feature', 3, 2, 2, 2, 'lychee'],
      ['entry', 7, 2, 1, 2, 2], ['entry', 3, 4, 1, 1, 3],
    ], tiles: [
      [0, 1, -1, 2, -1, 3, -1, 4],
      [5, 6, 7, 8, -1, -1, 9, 10],
      [-1, -1, -1, -1, -1, -1, 11, -1],
      [-1, -1, -1, -1, -1, -1, 7, -1],
      [12, 6, 13, -1, 14, 15, 6, 16],
    ] },
    7: { rows: 6, items: [
      ['entry', 1, 0, 1, 1, 0], ['feature', 3, 0, 1, 2, 'pineapple'], ['entry', 5, 0, 1, 1, 1],
      ['feature', 5, 1, 1, 2, 'corn'], ['copy', 0, 2, 4, 3], ['feature', 4, 3, 2, 2, 'lychee'],
      ['entry', 6, 2, 1, 1, 2], ['entry', 2, 5, 1, 1, 3],
    ], tiles: [
      [0, -1, 1, -1, 3, -1, 4],
      [5, 6, 7, -1, 8, -1, 10],
      [-1, -1, -1, -1, 2, -1, -1],
      [-1, -1, -1, -1, -1, -1, 11],
      [-1, -1, -1, -1, -1, -1, 9],
      [12, 13, -1, 14, 15, 6, 16],
    ] },
    4: { rows: 7, items: [
      ['entry', 0, 0, 1, 1, 0], ['entry', 2, 0, 1, 1, 1], ['copy', 0, 1, 4, 3],
      ['feature', 0, 4, 2, 2, 'lychee'], ['feature', 2, 4, 1, 2, 'pineapple'], ['feature', 3, 4, 1, 2, 'corn'],
      ['entry', 0, 6, 1, 1, 2], ['entry', 2, 6, 1, 1, 3],
    ], tiles: [[-1, 1, -1, 4], [], [], [], [], [], [-1, 11, -1, 13]] },
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
      const b = a; // 翻面仍是同一圖案，畫面維持參考圖構圖
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
