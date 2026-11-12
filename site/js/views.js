/* 獨立畫面：#client-demo #admin-demo #privacy #terms #disclaimer；其他 #hash 為首頁區塊 */
(function () {
  const home = $('#home'), view = $('#view');
  const VIEWS = ['client-demo', 'admin-demo', 'privacy', 'terms', 'disclaimer'];
  const TITLES = { 'client-demo': '農友工作台示範', 'admin-demo': '團隊工作台示範', privacy: '隱私權政策（草稿）', terms: '服務條款（草稿）', disclaimer: '免責聲明' };
  const BASE_TITLE = document.title;

  function shell(title, icon, desc, other) {
    return `<div class="wrap">
      <a class="crumb" href="#top">← 回到首頁</a>
      <div class="view-head"><div><h1>${icon ? brandIcon(icon) : ''}${title}</h1><p style="margin-top:6px">${desc}</p></div>${other ? `<a class="btn soft" href="${other[0]}">${other[1]} ↗</a>` : ''}</div>
      ${icon ? '<p class="demo-note">示範資料，非實際農場數值。這個畫面用來說明正式合作後的工作台規劃，所有名稱、數字與文件皆為虛構，操作只改變這個頁面的畫面。</p>' : ''}
      <div id="view-body"></div>
    </div>`;
  }
  const stat = (k, v, s) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div><div class="s">${s}</div></div>`;
  const panel = (title, body, cls, action) => `<section class="panel ${cls || ''}" aria-label="${title}"><div class="panel-head"><h2>${title}</h2>${action || ''}</div>${body}</section>`;

  /* ---------- 農友工作台 ---------- */
  function clientDemo() {
    const d = JSON.parse(JSON.stringify(DEMO.client));
    view.innerHTML = shell('農友工作台', 'portal', `${d.org}・${d.plan}・${d.period}・負責顧問：${d.consultant}`, ['#admin-demo', '切換到團隊工作台示範']);
    const body = $('#view-body');
    let taskFilter = 'all', orderFilter = 'all', pdcaView = d.pdca.current;
    const LABEL = { todo: '待辦', doing: '進行中', done: '已完成' };

    function render() {
      const avg = Math.round(d.goals.reduce((s, g) => s + g[1], 0) / d.goals.length);
      const doing = d.tasks.filter((t) => t[3] === 'doing').length;
      const pending = d.orders.filter((o) => o[5] !== '已出貨').length;
      const short = d.harvest.filter((h) => h[4] < h[3]).length;
      const tasks = d.tasks.map((t, i) => ({ t, i })).filter(({ t }) => taskFilter === 'all' || t[3] === taskFilter);
      const orders = d.orders.map((o, i) => ({ o, i })).filter(({ o }) => orderFilter === 'all' || o[5] === orderFilter);
      const st = d.pdca.steps[pdcaView];
      body.innerHTML = `
        <div class="stats">${stat('本季目標平均完成度', avg + '%', d.goals.length + ' 項季度目標')}${stat('進行中任務', doing, '共 ' + d.tasks.length + ' 項')}${stat('待交付訂單', pending, '待確認＋備貨中')}${stat('下次顧問會議', d.next.date, d.next.time + '・' + d.next.topic)}</div>
        <div class="panels">
          ${panel('本季目標', `<ul class="list">${d.goals.map((g) => `<li><div class="row-between"><span>${g[0]}</span><strong>${g[1]}%</strong></div><div class="bar" role="progressbar" aria-valuenow="${g[1]}" aria-valuemin="0" aria-valuemax="100" aria-label="${g[0]}"><i style="width:${g[1]}%"></i></div></li>`).join('')}</ul>`)}
          ${panel('PDCA 追蹤・' + d.pdca.cycle, `<div class="pdca" role="tablist" aria-label="PDCA 階段">${d.pdca.steps.map((s, i) => `<button type="button" role="tab" data-pdca="${i}" aria-selected="${i === pdcaView}" class="${i < d.pdca.current ? 'done' : ''}">${s[0]}<br>${s[1]}<br><small>${i < d.pdca.current ? '已完成' : i === d.pdca.current ? '進行中' : '未開始'}</small></button>`).join('')}</div><div role="tabpanel" style="margin-top:14px"><strong>${st[0]}・${st[1]}</strong><ul style="margin:6px 0 0;padding-left:22px">${st[2].map((x) => `<li>${x}</li>`).join('')}</ul></div>`, 'span-2',
            `<button class="btn small" type="button" id="pdca-next" ${d.pdca.current >= 3 ? 'disabled' : ''}>${d.pdca.current >= 3 ? '本輪進行到改善' : '完成「' + d.pdca.steps[d.pdca.current][1] + '」'}</button>`)}
          ${panel('任務', `<ul class="list">${tasks.map(({ t, i }) => `<li class="row-between"><span><span style="${t[3] === 'done' ? 'text-decoration:line-through;opacity:.7' : ''}">${t[0]}</span><br><span class="mini">${t[1]}負責・${t[2]} 前</span></span><button class="btn small ${t[3] === 'done' ? '' : 'soft'}" type="button" data-task="${i}" aria-label="切換「${t[0]}」狀態，目前${LABEL[t[3]]}">${LABEL[t[3]]} ↻</button></li>`).join('') || '<li>這個分類目前沒有任務</li>'}</ul>`, 'span-2',
            `<div class="chips">${['all', 'todo', 'doing', 'done'].map((k) => `<button type="button" class="chip" data-tf="${k}" aria-pressed="${taskFilter === k}">${k === 'all' ? '全部' : LABEL[k]}</button>`).join('')}</div>`)}
          ${panel('合作文件', `<ul class="list">${d.docs.map((x, i) => `<li class="row-between"><span>${x[0]}<br><span class="mini">${x[1]}・${x[2]} 更新・${x[3]}</span></span><button class="btn small soft" type="button" data-doc="${i}">開啟</button></li>`).join('')}</ul>`)}
          ${panel('本週採收排程（11/16–11/22）', `<div class="week">${d.harvest.map((h, i) => `<div class="day ${h[4] < h[3] ? 'short' : ''}"><strong>週${h[0]}・${h[1]}</strong><br>${h[2]}${h[3] ? `<br><span class="mini">需 ${h[3]} 人・已排 ${h[4]}</span><div class="ctl"><button type="button" data-h="${i}:-1" aria-label="週${h[0]}減少 1 人" ${h[4] <= 0 ? 'disabled' : ''}>−</button><button type="button" data-h="${i}:1" aria-label="週${h[0]}增加 1 人">＋</button></div>${h[4] < h[3] ? `<span class="mini">⚠ 缺 ${h[3] - h[4]} 人</span>` : ''}` : ''}</div>`).join('')}</div>`, 'span-3',
            `<span class="tag ${short ? 'yellow' : ''}">${short ? '⚠ ' + short + ' 天人力不足' : '✓ 人力已排滿'}</span>`)}
          ${panel('待交付訂單', `<div class="table-scroll"><table style="min-width:560px"><caption class="sr-only">待交付訂單</caption><thead><tr><th>編號</th><th>來源</th><th>品項</th><th>數量</th><th>出貨日</th><th>狀態</th></tr></thead><tbody>${orders.map(({ o, i }) => `<tr><td>${o[0]}</td><td>${o[1]}</td><td>${o[2]}</td><td>${o[3]}</td><td>${o[4]}</td><td><label class="sr-only" for="os-${i}">${o[0]} 狀態</label><select class="inline" id="os-${i}" data-order="${i}">${['待確認', '備貨中', '已出貨'].map((s) => `<option ${s === o[5] ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>`, 'span-2',
            `<div class="chips">${['all', '待確認', '備貨中', '已出貨'].map((k) => `<button type="button" class="chip" data-of="${k}" aria-pressed="${orderFilter === k}">${k === 'all' ? '全部' : k}</button>`).join('')}</div>`)}
          ${panel('預算執行（11 月・未稅）', `<ul class="list">${d.budget.map((b) => { const p = b[2] / b[1] * 100; return `<li><div class="row-between"><span>${b[0]}</span><span class="mini">${nt(b[2])}／${nt(b[1])}</span></div><div class="bar ${p > 100 ? 'over' : ''}"><i style="width:${Math.min(100, p)}%"></i></div>${p > 100 ? `<span class="mini" style="color:var(--danger)">⚠ 超出預算 ${nt(b[2] - b[1])}</span>` : ''}</li>`; }).join('')}</ul>`)}
          ${panel('營運指標（基準值→目標→實際值）', `<div class="table-scroll"><table><caption class="sr-only">營運指標</caption><thead><tr><th>指標</th><th>基準值</th><th>改善目標</th><th>實際值</th><th>資料來源</th></tr></thead><tbody>${d.metrics.map((m) => `<tr><td>${m[0]}<br><span class="mini">${m[1]}</span></td>${[m[2], m[3], m[4]].map((v) => `<td>${v === null ? '<span class="tag">尚無資料</span>' : v}</td>`).join('')}<td class="mini">${m[5]}</td></tr>`).join('')}</tbody></table></div><p class="mini" style="margin-top:10px">指標以可驗證的原始紀錄為前提，尚無資料的項目會清楚標示，不推算減碳量或 ESG 分數。</p>`, 'span-3')}
        </div>`;
      bind();
    }
    function bind() {
      $$('[data-tf]', body).forEach((b) => (b.onclick = () => { taskFilter = b.dataset.tf; render(); }));
      $$('[data-of]', body).forEach((b) => (b.onclick = () => { orderFilter = b.dataset.of; render(); }));
      $$('[data-task]', body).forEach((b) => (b.onclick = () => { const t = d.tasks[+b.dataset.task]; t[3] = t[3] === 'todo' ? 'doing' : t[3] === 'doing' ? 'done' : 'todo'; render(); }));
      $$('[data-pdca]', body).forEach((b) => (b.onclick = () => { pdcaView = +b.dataset.pdca; render(); }));
      const nx = $('#pdca-next'); if (nx) nx.onclick = () => { d.pdca.current = Math.min(3, d.pdca.current + 1); pdcaView = d.pdca.current; toast('已標記完成（示範）'); render(); };
      $$('[data-h]', body).forEach((b) => (b.onclick = () => { const [i, delta] = b.dataset.h.split(':').map(Number); d.harvest[i][4] = Math.max(0, d.harvest[i][4] + delta); render(); }));
      $$('[data-order]', body).forEach((s) => (s.onchange = () => { d.orders[+s.dataset.order][5] = s.value; render(); }));
      $$('[data-doc]', body).forEach((b) => (b.onclick = () => toast('示範模式無法開啟文件；正式版需登入並依權限存取')));
    }
    render();
  }

  /* ---------- 團隊工作台 ---------- */
  function adminDemo() {
    const a = JSON.parse(JSON.stringify(DEMO.admin));
    view.innerHTML = shell('團隊工作台', 'tracking', '洽詢名單、案件階段、任務分派、方案到期提醒與月營收預估。正式版僅限管理員與獲授權顧問登入使用。', ['#client-demo', '切換到農友工作台示範']);
    const body = $('#view-body');
    let source = '全部';
    const days = (iso) => Math.round((Date.parse(iso) - Date.parse(DEMO.today)) / 86400000);
    const eq = (s) => (s[2] === 'month' ? PLANS[s[1]].monthly : PLANS[s[1]].quarter / 3);
    function render() {
      const leads = a.leads.map((l, i) => ({ l, i })).filter(({ l }) => source === '全部' || l[5] === source);
      const active = a.leads.filter((l) => ['新洽詢', '已約初談', '盤點報價'].includes(l[6])).length;
      const expiring = a.subs.map((s) => ({ s, left: days(s[3]) })).filter((x) => x.left >= 0 && x.left <= 30).sort((x, y) => x.left - y.left);
      const mrr = a.subs.reduce((t, s) => t + eq(s), 0);
      const next = a.subs.filter((s) => !(s[4] === '不續約' && days(s[3]) <= 30)).reduce((t, s) => t + eq(s), 0);
      const maxStage = Math.max(1, ...a.stages.map((st) => a.leads.filter((l) => l[6] === st).length));
      body.innerHTML = `
        <div class="stats">${stat('本月洽詢', a.leads.filter((l) => l[1].startsWith('11/')).length, '2026 年 11 月')}${stat('洽談中案件', active, '新洽詢＋初談＋報價')}${stat('30 天內到期方案', expiring.length, '需安排續約聯繫')}${stat('月營收預估（月均）', nt(mrr), '未稅・季繳以 3 個月平均')}</div>
        <div class="panels">
          ${panel('洽詢名單', `<div class="table-scroll"><table style="min-width:820px"><caption class="sr-only">洽詢名單</caption><thead><tr><th>編號</th><th>稱呼・單位</th><th>主題</th><th>來源</th><th>案件階段</th><th>指派顧問</th></tr></thead><tbody>${leads.map(({ l, i }) => `<tr><td>${l[0]}<br><span class="mini">${l[1]}</span></td><td>${l[2]}<br><span class="mini">${l[3]}</span></td><td>${l[4]}</td><td>${l[5]}</td><td><label class="sr-only" for="st-${i}">${l[0]} 階段</label><select class="inline" id="st-${i}" data-stage="${i}">${a.stages.map((s) => `<option ${s === l[6] ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td><label class="sr-only" for="as-${i}">${l[0]} 顧問</label><select class="inline" id="as-${i}" data-assign="${i}"><option value="">未指派</option>${a.consultants.map((c) => `<option ${c === l[7] ? 'selected' : ''}>${c}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div><p class="mini" style="margin-top:10px">名單一律遮罩顯示；正式版依角色控管，顧問只能看到被指派的案件。</p>`, 'span-3',
            `<div class="chips">${['全部', ...a.sources].map((s) => `<button type="button" class="chip" data-src="${s}" aria-pressed="${source === s}">${s}</button>`).join('')}</div>`)}
          ${panel('案件階段分布', `<ul class="list">${a.stages.map((st) => { const n = a.leads.filter((l) => l[6] === st).length; return `<li><div class="row-between"><span>${st}</span><strong>${n} 件</strong></div><div class="bar"><i style="width:${n / maxStage * 100}%"></i></div></li>`; }).join('')}</ul>`)}
          ${panel('月營收預估', `<div class="stats" style="grid-template-columns:1fr 1fr;margin-bottom:12px">${stat('目前月均', nt(mrr), '依方案設定價格')}${stat('扣除不續約後', nt(next), '未稅')}</div><ul class="list">${PLANS.map((p, pi) => { const v = a.subs.filter((s) => s[1] === pi).reduce((t, s) => t + eq(s), 0); return `<li><div class="row-between"><span>${p.name}</span><span class="mini">${nt(v)}</span></div><div class="bar"><i style="width:${mrr ? v / mrr * 100 : 0}%"></i></div></li>`; }).join('')}</ul>`)}
          ${panel('方案到期提醒（30 天內）', `<ul class="list">${expiring.map(({ s, left }) => `<li><div class="row-between"><strong>${s[0]}</strong><span class="tag ${left <= 7 ? 'yellow' : ''}">剩 ${left} 天</span></div><span class="mini">${PLANS[s[1]].name}・${s[2] === 'month' ? '月繳' : '季繳'}・${s[3].slice(5).replace('-', '/')} 到期</span><br><label class="mini">續約狀態 <select class="inline" data-renew="${a.subs.indexOf(s)}">${['待聯繫', '已聯繫', '已續約', '不續約'].map((r) => `<option ${r === s[4] ? 'selected' : ''}>${r}</option>`).join('')}</select></label></li>`).join('')}</ul>`)}
          ${panel('任務分派', `<ul class="list">${a.tasks.map((t, i) => `<li><strong>${t[0]}</strong><br><span class="mini">${t[1]}・${t[3]} 到期</span><br><label class="mini">指派給 <select class="inline" data-task-assign="${i}"><option value="">未指派</option>${a.consultants.map((c) => `<option ${c === t[2] ? 'selected' : ''}>${c}</option>`).join('')}</select></label></li>`).join('')}</ul>`, 'span-2')}
          ${panel('正式版權限規劃', `<ul class="list"><li><strong>訪客</strong>　公開網站內容、送出詢問表單</li><li><strong>農友客戶</strong>　僅限自己組織的進度、任務、訂單與文件</li><li><strong>顧問</strong>　僅限被指派案件</li><li><strong>管理員</strong>　洽詢名單、案件指派、方案訂閱與稽核紀錄</li></ul>`)}
        </div>`;
      $$('[data-src]', body).forEach((b) => (b.onclick = () => { source = b.dataset.src; render(); }));
      $$('[data-stage]', body).forEach((s) => (s.onchange = () => { a.leads[+s.dataset.stage][6] = s.value; render(); }));
      $$('[data-assign]', body).forEach((s) => (s.onchange = () => { a.leads[+s.dataset.assign][7] = s.value; if (s.value) toast('已指派給' + s.value + '（示範，未寄出通知）'); }));
      $$('[data-renew]', body).forEach((s) => (s.onchange = () => { a.subs[+s.dataset.renew][4] = s.value; render(); }));
      $$('[data-task-assign]', body).forEach((s) => (s.onchange = () => { a.tasks[+s.dataset.taskAssign][2] = s.value; if (s.value) toast('已指派給' + s.value + '（示範）'); }));
    }
    render();
  }

  /* ---------- 法律頁 ---------- */
  function legal(key) {
    const d = LEGAL[key];
    const others = Object.keys(LEGAL).filter((k) => k !== key);
    view.innerHTML = `<div class="wrap legal">
      <a class="crumb" href="#top">← 回到首頁</a>
      <h1 style="font-size:clamp(32px,4vw,44px);margin-top:10px">${d.title}</h1>
      <p class="legal-warning"><strong>草稿佔位　正式上線前需由律師等專業人士審閱。</strong>標示「建置中」的內容尚未定案，不構成正式條款。</p>
      <p>${d.intro}</p>
      <ol style="margin-top:22px">${d.sections.map(([h, items], i) => `<li><h2>${i + 1}　${h}</h2><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></li>`).join('')}</ol>
      <div class="tags" style="margin-top:22px">${others.map((k) => `<a class="btn soft" href="#${k}">${LEGAL[k].title} ↗</a>`).join('')}</div>
    </div>`;
  }

  /* ---------- 路由 ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (VIEWS.includes(h)) {
      home.hidden = true; view.hidden = false;
      if (h === 'client-demo') clientDemo();
      else if (h === 'admin-demo') adminDemo();
      else legal(h);
      document.title = TITLES[h] + '｜田序共創 FIELDWISE';
      window.scrollTo(0, 0);
      return;
    }
    const wasHidden = home.hidden;
    home.hidden = false; view.hidden = true; view.innerHTML = '';
    document.title = BASE_TITLE;
    if (wasHidden) {
      if (window.MOSAIC) window.MOSAIC.rebuild();
      requestAnimationFrame(() => {
        const el = h && document.getElementById(h);
        if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
      });
    }
  }
  addEventListener('hashchange', route);
  route();
})();
