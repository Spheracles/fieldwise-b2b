/* 預約初談表單：先選身分，再依身分顯示「採購需求」「農場與想聊的事」或「想聊的事」。
 * 題目與選項在 data.js 的 INQUIRY；必填檢查由網站處理，Apps Script 再檢查一次。
 * 流程：整理摘要 → 確認送出（Apps Script 寫入試算表並回傳結果）→ 成功畫面。 */
(function () {
  const wrap = $('#contact-form-wrap');
  const live = !!(SITE.inquiry && SITE.inquiry.enabled && SITE.inquiry.endpoint);
  const Q = INQUIRY;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const req = '　<span class="req">必填</span>';

  /* ---------- 產生欄位 ---------- */
  function chipGroup(f, type) {
    const opts = f.options.concat(f.other ? ['其他'] : []);
    const hint = type === 'checkbox' ? '　可複選' : '';
    return `<fieldset class="topic-field" data-key="${f.key}" aria-describedby="${f.key}-err">
      <legend>${esc(f.label)}${hint}${f.required ? req : ''}</legend>
      <div class="topic-options">${opts.map((o) => `<label class="topic-option${type === 'radio' ? ' radio' : ''}"><input type="${type}" name="${f.key}" value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>
      ${f.other ? `<input type="text" class="other-input" id="${f.key}-other" maxlength="100" placeholder="選了其他　可以在這裡說明" hidden aria-label="${esc(f.label)}的其他說明">` : ''}
      <p class="field-error" id="${f.key}-err" role="alert"></p>
    </fieldset>`;
  }
  function field(f) {
    if (f.type === 'checkbox' || f.type === 'chips') return chipGroup(f, 'checkbox');
    if (f.type === 'radio') return chipGroup(f, 'radio');
    const attrs = `id="f-${f.key}" ${f.autocomplete ? `autocomplete="${f.autocomplete}"` : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${f.inputmode ? `inputmode="${f.inputmode}"` : ''} maxlength="${f.maxlength || (f.type === 'textarea' ? 1000 : 160)}" aria-describedby="${f.help ? `${f.key}-help ` : ''}${f.key}-err"`;
    const input = f.type === 'textarea' ? `<textarea ${attrs}></textarea>` : `<input type="${f.type}" ${attrs}>`;
    return `<div class="field${f.type === 'textarea' || f.full ? ' full' : ''}">
      <label for="f-${f.key}">${esc(f.label)}${f.required ? req : '　選填'}</label>${input}
      ${f.help ? `<p class="field-help" id="${f.key}-help">${esc(f.help)}</p>` : ''}
      <p class="field-error" id="${f.key}-err" hidden></p>
    </div>`;
  }
  const identityField = { key: 'identity', label: Q.identity.label, options: Q.identity.options, other: true, required: true };

  wrap.innerHTML = `
  <form class="form" id="inquiry" novalidate>
    <p class="tag yellow" id="form-banner" hidden style="margin-bottom:16px"></p>
    <div class="hp" aria-hidden="true"><label>請勿填寫此欄<input type="text" id="website" tabindex="-1" autocomplete="off"></label></div>
    <input type="hidden" id="item" value="">
    <div class="form-grid">${chipGroup(identityField, 'radio')}</div>
    ${Q.sections.map((s, i) => `<section class="form-section" data-group="${s.group}" ${s.group === 'all' ? '' : 'hidden'} aria-labelledby="fs-${i}">
      <h3 class="form-section-title" id="fs-${i}">${esc(s.title)}</h3>
      <div class="form-grid">${s.fields.map(field).join('')}</div>
    </section>`).join('')}
    <div class="consent">
      <label><input type="checkbox" id="consent" aria-describedby="consent-err"><span>我已閱讀並同意下方個人資料蒐集告知，同意田序共創為回覆詢問與後續聯繫，蒐集、處理及利用我填寫的資料。<span class="req">必填</span></span></label>
      <p class="field-error" id="consent-err" hidden></p>
      <details><summary>個人資料蒐集告知（草稿）</summary><ul>
        <li>蒐集者：田序共創（公司名稱建置中）。</li>
        <li>目的：回覆你的詢問、提供報價與樣品、安排初談與後續聯繫。</li>
        <li>類別：稱呼、職稱、公司或農場名稱、統一編號、聯絡方式與你填寫的需求內容。</li>
        <li>儲存：資料儲存於 Google 試算表（Google LLC 雲端服務），伺服器可能位於臺灣以外地區，僅團隊授權人員可以查看。</li>
        <li>權利：你可以依個人資料保護法第 3 條請求查詢、閱覽、製給複製本、補充或更正、停止蒐集處理利用或刪除。</li>
        <li>不提供必填資料時，我們將無法回覆你的詢問。</li>
      </ul><p style="margin-top:8px">正式上線前將由律師審閱，完整說明見<a href="#privacy" style="text-decoration:underline">隱私權政策</a>。</p></details>
    </div>
    <div class="form-actions"><button class="btn solid" type="submit">整理我的需求 ↗</button></div>
    <div class="summary" id="summary" hidden>
      <pre id="summary-text"></pre>
      <div class="row">
        ${live ? '<button class="btn solid" type="button" id="send">確認送出 ↗</button>' : ''}
        <button class="btn soft" type="button" id="copy">複製需求摘要</button>
        <button class="btn soft" type="button" id="edit">返回修改</button>
      </div>
      <p class="feedback" id="feedback" role="status" aria-live="polite"></p>
    </div>
  </form>`;

  const form = $('#inquiry');
  const allFields = Q.sections.flatMap((s) => s.fields.map((f) => Object.assign({ group: s.group }, f)));
  const isChip = (f) => ['checkbox', 'chips', 'radio'].includes(f.type);
  const checked = (key) => $$(`[name="${key}"]:checked`).map((e) => e.value);
  const otherText = (key) => { const o = $(`#${key}-other`); return o ? o.value.trim() : ''; };
  const identity = () => checked('identity')[0] || '';
  const group = () => Q.identity.groups[identity()] || '';
  const visible = (f) => f.group === 'all' || f.group === group();
  let summary = '';

  /* 選身分後顯示對應區塊；選「其他」時顯示自填欄 */
  function refresh() {
    $$('.form-section').forEach((s) => { s.hidden = !(s.dataset.group === 'all' || s.dataset.group === group()); });
    $$('.other-input').forEach((o) => {
      const key = o.id.replace(/-other$/, '');
      o.hidden = !checked(key).includes('其他');
    });
  }
  form.addEventListener('change', (e) => {
    if (e.target.name) { refresh(); const err = $(`#${e.target.name}-err`); if (err && checked(e.target.name).length) err.textContent = ''; }
  });
  refresh();

  function setError(input, errEl, msg) {
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errEl.hidden = !msg;
    errEl.textContent = msg || '';
  }

  /* ---------- 檢查 ---------- */
  function validate() {
    const errs = [];
    const idErr = $('#identity-err');
    idErr.textContent = identity() ? '' : '請先選擇你的身分';
    if (!identity()) errs.push($('[name="identity"]'));
    allFields.filter(visible).forEach((f) => {
      if (isChip(f)) {
        const miss = f.required && !checked(f.key).length;
        $(`#${f.key}-err`).textContent = miss ? `請選擇${f.label}` : '';
        if (miss) errs.push($(`[name="${f.key}"]`));
        return;
      }
      const el = $(`#f-${f.key}`), v = el.value.trim();
      let msg = '';
      if (f.required && !v) msg = `請填寫${f.label}`;
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Email 格式看起來不正確';
      else if (f.type === 'tel' && v && v.replace(/\D/g, '').length < 8) msg = '電話號碼好像少了幾碼';
      else if (f.key === 'taxId' && v && !/^\d{8}$/.test(v)) msg = '統一編號是 8 碼數字';
      setError(el, $(`#${f.key}-err`), msg);
      if (msg) errs.push(el);
    });
    const c = $('#consent');
    setError(c, $('#consent-err'), c.checked ? '' : '請勾選同意個人資料蒐集告知');
    if (!c.checked) errs.push(c);
    return errs;
  }
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') validate(); });

  /* ---------- 摘要 ---------- */
  const display = (f) => {
    if (!isChip(f)) return $(`#f-${f.key}`).value.trim();
    return checked(f.key).map((v) => (v === '其他' && otherText(f.key) ? `其他（${otherText(f.key)}）` : v)).join('、');
  };
  form.onsubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { errs[0].focus(); return; }
    const idText = identity() === '其他' && otherText('identity') ? `其他（${otherText('identity')}）` : identity();
    const lines = ['田序共創預約初談', '身分：' + idText];
    allFields.filter(visible).forEach((f) => { const v = display(f); if (v) lines.push(`${f.label}：${v}`); });
    if ($('#item').value) lines.push('詢問項目：' + $('#item').value);
    summary = lines.join('\n');
    $('#summary-text').textContent = summary;
    $('#summary').hidden = false;
    $('#feedback').className = 'feedback';
    $('#feedback').textContent = live ? '請確認摘要內容，按「確認送出」後才會傳給團隊' : '摘要已整理完成　尚未傳送給團隊';
    $('#summary').scrollIntoView({ behavior: window.motionPaused ? 'auto' : 'smooth', block: 'nearest' });
  };

  $('#edit').onclick = () => { $('#summary').hidden = true; $('[name="identity"]').focus(); };
  $('#copy').onclick = async () => {
    try { await navigator.clipboard.writeText(summary); $('#feedback').textContent = '已複製　你可以貼到與團隊的對話中'; }
    catch (err) { $('#feedback').textContent = '瀏覽器未允許自動複製　請選取上方摘要文字手動複製'; }
  };

  /* ---------- 送出資料 ---------- */
  function buildPayload() {
    const now = new Date(), pad = (n) => String(n).padStart(2, '0');
    const data = {
      identity: identity() === '其他' && otherText('identity') ? `其他（${otherText('identity')}）` : identity(),
      item: $('#item').value,
      consentAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      page: location.origin + location.pathname,
      website: $('#website').value,
    };
    allFields.filter(visible).forEach((f) => { const v = display(f); if (v) data[f.key] = v; });
    return data;
  }
  window.buildInquiryPayload = buildPayload; // 測試用

  const LAST = 'fieldwise:lastSubmit';
  const recently = () => { try { return Date.now() - Number(sessionStorage.getItem(LAST) || 0) < 60000; } catch (e) { return false; } };

  if (live) {
    $('#send').onclick = async () => {
      const fb = $('#feedback');
      if (validate().length) return;
      if ($('#website').value) { showSuccess(); return; } // 機器人
      if (recently()) { fb.className = 'feedback err'; fb.textContent = '你剛剛已經送出過一次了，請稍候一分鐘再試'; return; }
      const btn = $('#send');
      btn.disabled = true; btn.textContent = '送出中…';
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        // text/plain 不會觸發預檢請求；Apps Script 回傳 JSON，可以確認是否真的寫入
        const res = await fetch(SITE.inquiry.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(buildPayload()), signal: ctrl.signal });
        const out = await res.json();
        if (!out.ok) throw new Error(out.error || 'rejected');
        try { sessionStorage.setItem(LAST, String(Date.now())); } catch (e) { /* ignore */ }
        showSuccess();
      } catch (err) {
        fb.className = 'feedback err';
        fb.textContent = '送出沒有成功，資料還沒有送到。請稍後再按一次「確認送出」，或先複製摘要傳給我們。';
        btn.disabled = false; btn.textContent = '確認送出 ↗';
      } finally {
        clearTimeout(timer);
      }
    };
  }

  function showSuccess() {
    $('#summary').innerHTML = `<div class="success" role="status"><h3>已送出，謝謝你</h3><p>我們收到後會依你留下的聯絡方式回覆。若幾個工作天內沒有收到消息，歡迎再留言一次。</p><div class="row" style="justify-content:center;margin-top:16px"><button class="btn soft" type="button" id="again">再填一份</button></div></div>`;
    $('#again').onclick = () => location.reload();
  }

  /* ---------- 從網站其他區塊帶入（詢問此商品／方案／服務） ---------- */
  window.prefillContact = function ({ topics, note, item } = {}) {
    const product = item && item.startsWith('商品：') ? item.slice(3) : '';
    if (product) $$('[name="products"]').forEach((c) => { if (c.value === product) c.checked = true; });
    if (topics) $$('[name="farmTopics"]').forEach((c) => { if (topics.includes(c.value)) c.checked = true; });
    if (note) ['b2bNotes', 'farmNotes', 'otherNotes'].forEach((k) => { const el = $(`#f-${k}`); if (el && !el.value.trim()) el.value = note; });
    if (item !== undefined || note) $('#item').value = item || note;
    $('#form-banner').hidden = !(note || item);
    if (note || item) $('#form-banner').textContent = `已帶入：${item || note}　選好身分後可以再補充或修改`;
    refresh();
  };
})();
