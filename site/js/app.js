/* 田序共創 FIELDWISE｜首頁互動 */
(function () {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const nt = (n) => 'NT$ ' + Math.round(n).toLocaleString('zh-TW');
  window.$ = $; window.$$ = $$; window.esc = esc; window.nt = nt;

  /* ---------- 圖片資產：建置後為內嵌資料，轉成 blob 網址避免重複佔用記憶體 ---------- */
  const blobCache = {};
  function asset(path) {
    if (blobCache[path]) return blobCache[path];
    const data = window.ASSETS && window.ASSETS[path];
    if (!data) return (blobCache[path] = 'assets/' + path);
    try {
      const [meta, b64] = data.split(',');
      const mime = meta.slice(5, meta.indexOf(';'));
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      blobCache[path] = URL.createObjectURL(new Blob([bytes], { type: mime }));
    } catch (e) {
      blobCache[path] = data;
    }
    return blobCache[path];
  }
  window.asset = asset;

  /** 六格流程插圖中的單格：0 需求訪談 1 共同規劃 2 數位訂單 3 市集推廣 4 成長回顧 5 產地選物 */
  function scene(i, label, cls) {
    const x = (i % 3) * 512, y = Math.floor((i % 6) / 3) * 512;
    return `<div class="sprite-art ${cls || ''}" role="img" aria-label="${esc(label)}"><svg viewBox="${x} ${y} 512 512" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><image href="${asset('process-sprite.webp')}" width="1536" height="1024"/></svg></div>`;
  }
  window.scene = scene;

  /* ---------- 提示訊息 ---------- */
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('#toasts').append(t);
    setTimeout(() => t.remove(), 5000);
  }
  window.toast = toast;

  /* ---------- Logo、導覽 ---------- */
  $$('[data-logo]').forEach((el) => (el.innerHTML = logoMark()));
  const NAV = [
    ['#services', '農友陪跑', 'services'], ['#plans', '陪跑方案', 'planning'], ['#products', '產地好物', 'home'],
    ['#support', '走進產地', 'about'], ['#resources', '資源專欄', 'resources'], ['#about', '關於我們', 'cases'],
  ];
  const mobileNav = $('#mobile-nav'), menuBtn = $('.menu-btn');
  mobileNav.innerHTML = NAV.map(([h, t, ic]) => `<a href="${h}">${brandIcon(ic)}${t}</a>`).join('') + `<a class="btn solid" href="#contact">預約初談 ↗</a>`;
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '關閉 ✕' : '選單 ☰';
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.onclick = () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  mobileNav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileNav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- 動畫暫停 ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  window.motionPaused = reduced.matches;
  function motionState() {
    document.body.classList.toggle('motion-off', window.motionPaused);
    const b = $('#motion-toggle');
    b.textContent = window.motionPaused ? '開啟動畫 ▷' : '暫停動畫 Ⅱ';
    b.setAttribute('aria-pressed', String(window.motionPaused));
    const v = $('#story-video video');
    if (v && window.motionPaused) v.pause();
  }
  $('#motion-toggle').onclick = () => { window.motionPaused = !window.motionPaused; motionState(); };
  reduced.addEventListener('change', (e) => { window.motionPaused = e.matches; motionState(); });

  /* ---------- 帶入聯絡表單 ---------- */
  // window.prefillContact 由 contact.js 提供
  window.goTo = function (id) {
    if (location.hash === '#' + id) $('#' + id).scrollIntoView({ behavior: window.motionPaused ? 'auto' : 'smooth' });
    else location.hash = id;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-topic],[data-note],[data-item]');
    if (!a) return;
    prefillContact({ topics: a.dataset.topic ? a.dataset.topic.split('、') : undefined, note: a.dataset.note, item: a.dataset.item });
  });

  /* ---------- 首頁拼磚入口 ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'products-season') setProductCat('當季鮮果');
    if (act === 'support-trip') supportView('trip');
  });

  /* ---------- 服務 ---------- */
  $('#services-list').innerHTML = SERVICES.map((s, i) => `
    <button class="service" type="button" id="service-${i}" aria-expanded="${i === 0}" aria-controls="panel-${i}">
      <span class="num">0${i + 1}</span><span class="icon">${brandIcon(s[5])}</span>
      <span><span class="name">${s[0]}</span><span class="desc">${s[1]}</span></span>
      <span class="plus" aria-hidden="true">＋</span>
    </button>
    <div class="service-panel" id="panel-${i}" role="region" aria-labelledby="service-${i}" ${i ? 'hidden' : ''}>
      <p>${s[2]}</p>
      <div class="tags">${s[3].map((t) => `<span class="tag">${t}</span>`).join('')}</div>
      <details><summary>合作範圍與補充說明</summary><p style="margin-top:12px">${s[4]}</p></details>
      <a class="btn" href="#contact" data-topic="農友陪跑" data-item="服務：${s[0]}" data-note="我想了解${s[0]}">詢問這項服務 ↗</a>
    </div>`).join('');
  $$('.service').forEach((b) => (b.onclick = () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    document.getElementById(b.getAttribute('aria-controls')).hidden = open;
  }));

  /* ---------- 需求整理 ---------- */
  $('#diagnosis-options').innerHTML = DIAGNOSTIC.map((d, i) => `<button type="button" class="chip" aria-pressed="false" data-diagnostic="${i}">${d[0]}</button>`).join('');
  $$('[data-diagnostic]').forEach((b) => (b.onclick = () => b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'))));
  $('#diagnose').onclick = () => {
    const picks = $$('[data-diagnostic][aria-pressed="true"]').map((b) => DIAGNOSTIC[+b.dataset.diagnostic]);
    const box = $('#diagnosis-result');
    if (!picks.length) {
      box.innerHTML = '<p class="alert">請先選擇一項目前想改善的事情</p>';
      $('[data-diagnostic]').focus();
      return;
    }
    const dirs = [...new Set(picks.map((p) => p[1]))];
    box.innerHTML = `<div class="result-card"><h3>可以先從這些方向聊起</h3><ul>${dirs.map((d) => `<li>${d}</li>`).join('')}</ul><p>先準備目前的工作方式與最想改善的一件事　初談時再一起確認</p><p class="note" style="margin-top:8px">這是依選項對應的方向，不是正式診斷或報價</p><a href="#contact" class="btn solid" style="margin-top:16px" data-topic="農友陪跑" data-note="目前想改善：${picks.map((p) => p[0]).join('、')}">帶著我的選擇去聊聊 ↗</a></div>`;
  };

  /* ---------- 故事與影片 ---------- */
  $('#story-art').innerHTML = `<img src="${asset('farm-scene.webp')}" alt="農友與團隊在層層田園中規劃品牌、整理訂單與推廣農產的共創場景插畫" width="1536" height="1024" loading="lazy">`;
  (function video() {
    const box = $('#story-video');
    box.innerHTML = `
      <div>
        <p class="video-caption">情境示意影片（AI 生成），非真實客戶或案例</p>
        <div class="video-frame" id="video-frame">
          <video muted playsinline preload="metadata" poster="media/farm-story-poster.jpg" src="media/farm-story.mp4" aria-label="情境示意影片：農友在果園採收鳳梨與荔枝、與親子家庭互動，最後用手機整理商品"></video>
          <div class="video-controls"><button class="btn small" type="button" data-v="play">暫停</button><button class="btn small" type="button" data-v="mute" aria-pressed="false">開啟聲音</button></div>
        </div>
      </div>
      <div>
        <div class="eyebrow">產地的一天</div>
        <h3 style="font-size:clamp(26px,2.6vw,34px)">把力氣留給土地<br>把繁瑣交給制度與工具</h3>
        <p style="margin:16px 0 20px">採收有排程、訂單有入口、體驗有規劃，產地的好東西才能穩穩被看見。實際做法會依每座農場的條件一起討論。</p>
        <a class="btn yellow" href="#products">逛逛產地好物 ↗</a>
      </div>`;
    const v = $('video', box), frame = $('#video-frame'), playBtn = $('[data-v="play"]', box), muteBtn = $('[data-v="mute"]', box);
    let plays = 0, done = false, hideTimer;
    v.addEventListener('error', () => {
      frame.innerHTML = `<img src="${asset('farm-scene.webp')}" alt="農業共創情境插畫（影片無法載入時顯示）">`;
    });
    v.addEventListener('play', () => (playBtn.textContent = '暫停'));
    v.addEventListener('pause', () => (playBtn.textContent = '播放'));
    v.addEventListener('ended', () => {
      plays++;
      if (plays < 2) { v.currentTime = 0; v.play().catch(() => {}); }
      else { done = true; frame.classList.add('show-controls'); }
    });
    playBtn.onclick = () => { if (v.paused) { if (v.ended) v.currentTime = 0; v.play().catch(() => {}); } else v.pause(); };
    muteBtn.onclick = () => { v.muted = !v.muted; muteBtn.textContent = v.muted ? '開啟聲音' : '關閉聲音'; muteBtn.setAttribute('aria-pressed', String(!v.muted)); if (v.paused) v.play().catch(() => {}); };
    frame.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      frame.classList.add('show-controls');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { if (!done) frame.classList.remove('show-controls'); }, 3000);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) { if (!done && !window.motionPaused) v.play().catch(() => {}); }
        else v.pause();
      }, { threshold: 0.35 }).observe(v);
    }
  })();

  /* ---------- 支持小農分頁 ---------- */
  function supportView(mode) {
    $('#support-content').innerHTML = `<div class="grid-3 goods">${SUPPORT[mode].map((g, i) => `
      <article class="good">
        <div class="good-art">${scene(g[0], g[1] + '的情境插畫')}<span class="status">${g[3]}</span></div>
        <h3>${g[1]}</h3><p>${g[2]}</p>
        <button class="btn" type="button" data-support="${mode}:${i}">了解規劃 ↗</button>
      </article>`).join('')}</div>`;
    $('#support-content').setAttribute('aria-labelledby', 'tab-' + mode);
    $$('#support-tabs [role="tab"]').forEach((b) => { const on = b.dataset.mode === mode; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    $$('[data-support]').forEach((b) => (b.onclick = () => {
      const [m, i] = b.dataset.support.split(':');
      const g = SUPPORT[m][+i];
      openDialog({
        kicker: '先認識再出發', title: g[1],
        body: `<p>${g[2]}</p><p>目前為規劃示意，商品供應與體驗場次將於確認後公告。歡迎先在聯絡區留下想法，團隊確認實際供應與合作方式後會與你聯繫。</p>`,
        actions: [{ label: '把想法帶到聯絡區 ↗', cls: 'solid', onClick: () => { prefillContact({ topics: [g[4]], note: '我想了解' + g[1] }); goTo('contact'); } },
          m === 'goods' ? { label: '看商品專區', cls: 'soft', onClick: () => goTo('products') } : null],
      });
    }));
  }
  window.supportView = supportView;
  supportView('goods');
  $$('#support-tabs [role="tab"]').forEach((b, i, all) => {
    b.onclick = () => supportView(b.dataset.mode);
    b.onkeydown = (e) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      const n = e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + all.length) % all.length;
      supportView(all[n].dataset.mode);
      all[n].focus();
    };
  });

  /* ---------- 商品專區 ---------- */
  let productCat = '全部';
  $('#product-filters').innerHTML = PRODUCT_CATEGORIES.map((c) => `<button type="button" class="chip" data-pcat="${c}" aria-pressed="${c === '全部'}">${c}</button>`).join('');
  $$('[data-pcat]').forEach((b) => (b.onclick = () => setProductCat(b.dataset.pcat)));
  const priceHtml = (p) => p.price
    ? `<div class="price-line"><span>建議測試售價</span><strong>${p.price.range}／${p.price.unit}</strong><span>${p.price.spec}・試算區間，非正式售價</span></div>`
    : `<div class="price-line"><span>價格</span><strong>試算中</strong><span>規格與售價確認後公告</span></div>`;
  function renderProducts() {
    const list = PRODUCTS.filter((p) => productCat === '全部' || p.cats.includes(productCat));
    $('#product-grid').innerHTML = list.map((p) => `
      <article class="product">
        <div class="product-photo"><img src="${asset('products/' + p.id + '.webp')}" alt="${esc(p.name)}商品情境示意圖" width="800" height="800" loading="lazy"><span class="status">${p.status}</span></div>
        <div class="product-body">
          <span class="cat">${p.cats.join('・')}</span>
          <h3>${p.name}</h3>
          <p>${p.short}</p>
          ${priceHtml(p)}
          <button class="btn" type="button" data-product="${p.id}">了解商品 ↗</button>
        </div>
      </article>`).join('');
    $('#product-count').textContent = `共 ${list.length} 項`;
    $$('[data-product]').forEach((b) => (b.onclick = () => openProduct(b.dataset.product)));
  }
  function setProductCat(c) {
    productCat = c;
    $$('[data-pcat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pcat === c)));
    renderProducts();
  }
  window.setProductCat = setProductCat;
  function openProduct(id) {
    const p = PRODUCTS.find((x) => x.id === id);
    openDialog({
      kicker: p.cats.join('・') + '｜' + p.status, title: p.name,
      body: `
        <div class="dialog-product"><img src="${asset('products/' + p.id + '.webp')}" alt="${esc(p.name)}商品情境示意圖"><div>
          <h3 style="margin-top:0">這是什麼</h3><p>${p.what}</p>
          ${priceHtml(p)}
        </div></div>
        <h3>來自哪裡</h3><p>規劃使用高雄大樹合作農友的鳳梨，實際來源、品種與農友資訊確認後標示。</p>
        <h3>怎麼製作</h3><ol class="flow-steps" aria-label="製作流程">${p.steps.map((s) => `<li><span>${s}</span></li>`).join('')}</ol>
        <h3>怎麼吃或使用</h3><p>${p.use}</p>
        <h3>保存與配送</h3><p>規格、保存期限、營養標示與配送方式，依實際製程與檢驗結果確認後公告。</p>
        <p class="note">圖片為商品情境示意，非實際上市包裝；製作流程為規劃中的作業步驟。</p>`,
      actions: [{ label: '詢問此商品 ↗', cls: 'solid', onClick: () => { prefillContact({ topics: ['商品詢問'], note: '我想詢問「' + p.name + '」', item: '商品：' + p.name }); goTo('contact'); } }],
    });
  }
  renderProducts();

  /* ---------- 方案 ---------- */
  $('#plan-grid').innerHTML = PLANS.map((p, i) => `
    <article class="plan">
      <div class="plan-art">${scene(p.art, ['農友與顧問一起了解需求', '團隊整理農產與數位訂單', '農友與夥伴一起推廣產地好物'][i], 'scene-drift')}</div>
      <span class="kicker">0${i + 1} ${p.name} ${p.sub}</span>
      <h3>${p.title}</h3><p>${p.fit}</p>
      <div class="price" data-price="${i}"></div><div class="period-note" data-period="${i}"></div>
      <ul>${p.items.map((t) => `<li>${t}</li>`).join('')}</ul>
      <a class="btn" href="#contact" data-topic="農友陪跑" data-item="方案：${p.name}${p.sub}" data-note="我想了解${p.name}${p.sub}方案">聊聊這段陪伴 ↗</a>
      <details class="plan-detail"><summary>合作與費用怎麼討論</summary><p>${p.detail}</p></details>
    </article>`).join('');
  function pricing(period) {
    $$('[data-billing]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.billing === period)));
    PLANS.forEach((p, i) => {
      $(`[data-price="${i}"]`).innerHTML = nt(period === 'month' ? p.monthly : p.quarter) + ` <span>／${period === 'month' ? '月' : '季（3 個月）'}</span>`;
      $(`[data-period="${i}"]`).textContent = period === 'month' ? '每月支付一次　依需求循序展開' : `一次涵蓋 3 個月　比月繳合計省 ${nt(p.monthly * 3 - p.quarter)}`;
    });
  }
  pricing('month');
  $$('[data-billing]').forEach((b) => (b.onclick = () => pricing(b.dataset.billing)));
  $('#compare').innerHTML = `<summary>比較三種方案與另計項目</summary><div class="table-scroll"><table><caption>每月服務內容比較</caption><thead><tr><th>內容</th>${PLANS.map((p) => `<th>${p.name}</th>`).join('')}</tr></thead><tbody>
    <tr><th>月繳</th>${PLANS.map((p) => `<td>${nt(p.monthly)}</td>`).join('')}</tr>
    <tr><th>季繳（3 個月）</th>${PLANS.map((p) => `<td>${nt(p.quarter)}<br><small>省 ${nt(p.monthly * 3 - p.quarter)}</small></td>`).join('')}</tr>
    <tr><th>線上會議或工作坊</th>${PLANS.map((p) => `<td>${p.meet}</td>`).join('')}</tr>
    <tr><th>陪跑時數上限</th>${PLANS.map((p) => `<td>${p.hours}</td>`).join('')}</tr>
    <tr><th>流程與工具協助</th><td>基礎追蹤範本</td><td>1 項 SOP 與 AI 需求設計</td><td>至多 2 條自動化規格與跨領域協作</td></tr>
  </tbody></table></div><p style="margin-top:18px">第三方軟體與 API、設備、正式系統開發、專業檢測、清理工程、法律會計及跨區現場工作，依個案另計。</p>`;

  /* ---------- 模擬案例 ---------- */
  $('#case-grid').innerHTML = CASES.map((c) => `
    <article class="case-card">
      <div class="case-art">${scene(c[3], c[0] + '的情境插畫')}</div>
      <span class="tag" style="align-self:flex-start">模擬情境</span>
      <h3>${c[0]}</h3><p>${c[1]}</p>
      <ol>${c[2].map((t) => `<li>${t}</li>`).join('')}</ol>
    </article>`).join('');

  /* ---------- 合作流程：捲動固定場景，五階段 0 25 50 75 100 ---------- */
  $('#flow-controls').innerHTML = PROCESS.map((s, i) => `<button class="btn" type="button" data-step="${i}" aria-label="第 ${i + 1} 步 ${s[0]}">0${i + 1}</button>`).join('');
  let flowIndex = -1, manualUntil = 0;
  function showFlow(i) {
    if (i === flowIndex) return;
    flowIndex = i;
    const s = PROCESS[i];
    $('#flow-title').textContent = '0' + (i + 1) + ' ' + s[0];
    $('#flow-copy').textContent = s[1];
    $('#flow-output').textContent = s[2];
    $('#flow-percent').textContent = i * 25;
    $('#flow-bar').style.width = i * 25 + '%';
    $('#flow-bar').setAttribute('aria-valuenow', i * 25);
    $$('[data-step]').forEach((b, j) => (i === j ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    $('#flow-art').innerHTML = scene(i, s[0] + '的農友團隊協作插畫', 'scene-drift');
  }
  function flowProgress() {
    if (Date.now() < manualUntil) return;
    const el = $('#process-story'), pin = $('.process-pin', el);
    if (getComputedStyle(pin).position !== 'sticky') return;
    const top = parseFloat(getComputedStyle(pin).top) || 0;
    const span = Math.max(1, el.offsetHeight - pin.offsetHeight);
    const p = Math.max(0, Math.min(1, (top - el.getBoundingClientRect().top) / span));
    showFlow(Math.min(4, Math.floor(p * 5)));
  }
  addEventListener('scroll', () => requestAnimationFrame(flowProgress), { passive: true });
  $$('[data-step]').forEach((b) => (b.onclick = () => { manualUntil = Date.now() + 2000; showFlow(+b.dataset.step); }));
  showFlow(0);

  /* ---------- 最新消息 ---------- */
  $('#news-empty').innerHTML = `${scene(5, '產地選物插圖')}<div><h3>目前還沒有正式發布的消息</h3><p style="margin:10px 0 16px">商品上架、產地體驗場次與合作夥伴，會在確認供應與取得同意後發布。想第一時間知道，可以先留下聯絡方式。</p><a class="btn" href="#contact" data-topic="其他" data-note="有新消息時請通知我">有消息時通知我 ↗</a></div>`;

  /* ---------- 資源專欄 ---------- */
  const CATS = ['全部', '農業經營', 'AI 工具', '申請資訊', '法規提醒'];
  $('#resource-filters').innerHTML = CATS.map((c, i) => `<button type="button" class="chip" data-category="${c}" aria-pressed="${!i}">${c}</button>`).join('');
  function renderArticles(cat) {
    $('#resource-grid').innerHTML = ARTICLES.map((a, i) => ({ a, i })).filter((o) => cat === '全部' || o.a[0] === cat).map(({ a, i }) => `
      <article class="resource-card">
        <div class="resource-art">${scene(i, '農業經營與團隊協作情境插畫')}</div>
        <span class="tag white" style="align-self:flex-start">${a[0]}</span>
        <h3>${a[1]}</h3><p>${a[2]}</p>
        <button class="btn" type="button" data-article="${i}">閱讀內容範例 ↗</button>
      </article>`).join('');
    $$('[data-article]').forEach((b) => (b.onclick = () => {
      const a = ARTICLES[+b.dataset.article];
      openDialog({ kicker: '內容範例｜' + a[0], title: a[1], body: `<p>${a[2]}</p><ul>${a[3].map((t) => `<li>${t}</li>`).join('')}</ul><p class="note" style="margin-top:14px">本文為內容範例，正式發布前由團隊確認與審閱，不構成法律、會計或稅務意見。</p>`,
        actions: [{ label: '把問題帶到聯絡區 ↗', cls: 'solid', onClick: () => { prefillContact({ topics: ['農友陪跑'], note: '我想多了解「' + a[1] + '」' }); goTo('contact'); } }] });
    }));
  }
  renderArticles('全部');
  $$('[data-category]').forEach((b) => (b.onclick = () => { $$('[data-category]').forEach((t) => t.setAttribute('aria-pressed', String(t === b))); renderArticles(b.dataset.category); }));
  $('#official').innerHTML = `<summary>官方參考與資訊入口</summary><p style="margin-top:14px">依實際公告與專業確認為準　以下連結不代表機關合作關係</p><div class="official-links">${SITE.officialLinks.map(([t, u]) => `<a class="btn soft" target="_blank" rel="noopener" href="${u}">${t} ↗</a>`).join('')}</div>`;

  /* ---------- FAQ ---------- */
  $('#faq-list').innerHTML = FAQ.map((f) => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('');
  const syncFaqBtn = () => {
    const all = $$('.faq-list details');
    const open = all.every((d) => d.open);
    $('#all-faq').setAttribute('aria-expanded', String(open));
    $('#all-faq').textContent = open ? '全部收合' : '全部展開';
  };
  $('#all-faq').onclick = () => {
    const open = $('#all-faq').getAttribute('aria-expanded') !== 'true';
    $$('.faq-list details').forEach((d) => (d.open = open));
    syncFaqBtn();
  };
  $$('.faq-list details').forEach((d) => d.addEventListener('toggle', syncFaqBtn));

  /* ---------- 對話框 ---------- */
  const dlg = $('#detail');
  window.openDialog = function ({ kicker, title, body, actions }) {
    $('#detail-kicker').textContent = kicker || '';
    $('#detail-title').textContent = title;
    $('#detail-body').innerHTML = body;
    const box = $('#detail-actions');
    box.innerHTML = '';
    (actions || []).filter(Boolean).forEach((a) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn ' + (a.cls || ''); b.textContent = a.label;
      b.onclick = () => { dlg.close(); a.onClick(); };
      box.append(b);
    });
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
  };
  $('.close', dlg).onclick = () => dlg.close();
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  /* ---------- 聯絡資訊、頁尾 ---------- */
  const ci = SITE.contactTestMode
    ? { test: true, email: SITE.testContact.email, phone: SITE.testContact.phone, line: SITE.testContact.line }
    : { test: false, email: SITE.contact.email || '建置中', phone: SITE.contact.phone || '建置中', line: SITE.contact.lineUrl ? 'LINE 官方帳號' : '建置中' };
  const testTag = ci.test ? '<span class="test-tag">測試資料</span>' : '';
  $('#contact-info').innerHTML = `<strong>其他聯絡方式</strong>${testTag}<dl><dt>Email</dt><dd>${ci.email}</dd><dt>電話</dt><dd>${ci.phone}</dd><dt>LINE</dt><dd>${ci.line}</dd><dt>時間</dt><dd>${SITE.contact.hours}</dd></dl>`;
  $('#contact-art').innerHTML = scene(4, '農友和顧問一起規劃下一季');
  $('#footer').innerHTML = `<div class="wrap">
    <div class="footer-grid">
      <div><div class="footer-brand">${logoMark()}<span>田序共創<small>FIELDWISE</small></span></div><p style="margin-top:14px;font-size:17px">從高雄大樹出發，陪小農整理經營、推廣產地好物，連結產地與生活。</p><p style="margin-top:8px;font-size:16px">品牌名稱暫定　公司名稱與統一編號建置中</p></div>
      <div><h4>逛逛網站</h4><ul><li><a href="#products">產地好物</a></li><li><a href="#support">走進產地</a></li><li><a href="#about">我們的故事</a></li><li><a href="#news">最新消息</a></li></ul></div>
      <div><h4>給農友</h4><ul><li><a href="#services">農友陪跑</a></li><li><a href="#plans">陪跑方案</a></li><li><a href="#resources">資源專欄</a></li><li><a href="#process">合作流程</a></li></ul></div>
      <div><h4>聯絡我們${testTag}</h4><ul style="font-size:17px"><li>Email　${ci.email}</li><li>電話　${ci.phone}</li><li>LINE　${ci.line}</li><li>${SITE.contact.hours}</li></ul><a class="btn yellow small" style="margin-top:14px" href="#contact">預約初談 ↗</a></div>
    </div>
    <div class="footer-bottom"><span>© 2026 田序共創 FIELDWISE（暫定品牌）・案例與商品資訊為模擬情境或規劃示意</span><span><a href="#privacy">隱私權政策</a>　<a href="#terms">服務條款</a>　<a href="#disclaimer">免責聲明</a>　<a href="#top">回到頂端 ↑</a></span></div>
    <p style="margin-top:12px;font-size:15px;opacity:.85">本站不隸屬、也不代表任何政府機關或農會；合作夥伴將於確認並取得同意後刊登。</p>
  </div>`;

  motionState();
})();
