/* 聯絡表單：姓名必填、公司選填、聯絡方式必填、五個可複選主題、補充需求必填；
 * 先整理成摘要讓使用者確認，再送到 Google 表單。 */
(function () {
  const wrap = $('#contact-form-wrap');
  const live = SITE.googleForm && SITE.googleForm.enabled;

  wrap.innerHTML = `
  <form class="form" id="inquiry" novalidate>
    <p class="tag yellow" id="form-banner" hidden style="margin-bottom:16px"></p>
    <div class="hp" aria-hidden="true"><label>請勿填寫此欄<input type="text" id="website" tabindex="-1" autocomplete="off"></label></div>
    <input type="hidden" id="item" value="">
    <div class="form-grid">
      <div class="field">
        <label for="name">怎麼稱呼你　<span class="req">必填</span></label>
        <input type="text" id="name" required maxlength="60" autocomplete="name" placeholder="姓名或稱呼" aria-describedby="name-err">
        <p class="field-error" id="name-err" hidden></p>
      </div>
      <div class="field">
        <label for="company">公司或農場名稱　選填</label>
        <input type="text" id="company" maxlength="120" autocomplete="organization" placeholder="公司、農場或團隊名稱">
      </div>
      <div class="field full">
        <label for="contact-info-input">你的聯絡方式　<span class="req">必填</span></label>
        <input type="text" id="contact-info-input" required maxlength="160" autocomplete="email" placeholder="Email、電話或 LINE ID" aria-describedby="contact-help contact-err">
        <p class="field-help" id="contact-help">請留下團隊可以回覆你的聯絡方式</p>
        <p class="field-error" id="contact-err" hidden></p>
      </div>
      <fieldset class="topic-field" aria-describedby="topic-error">
        <legend>想聊哪件事　可複選　<span class="req">至少選一項</span></legend>
        <div class="topic-options">${TOPICS.map((t) => `<label class="topic-option"><input type="checkbox" name="topics" value="${t}"><span>${t}</span></label>`).join('')}</div>
        <p class="field-error" id="topic-error" role="alert"></p>
      </fieldset>
      <div class="field full">
        <label for="notes">說說你的想法　<span class="req">必填</span></label>
        <textarea id="notes" required maxlength="1000" placeholder="例如我種鳳梨　想讓更多人認識我們的產品" aria-describedby="notes-err"></textarea>
        <p class="field-error" id="notes-err" hidden></p>
      </div>
      <div class="consent">
        <label><input type="checkbox" id="consent" aria-describedby="consent-err"><span>我已閱讀並同意下方個人資料蒐集告知，同意田序共創為回覆詢問與後續聯繫，蒐集、處理及利用我填寫的資料。<span class="req">必填</span></span></label>
        <p class="field-error" id="consent-err" hidden></p>
        <details><summary>個人資料蒐集告知（草稿）</summary><ul>
          <li>蒐集者：田序共創（公司名稱建置中）。</li>
          <li>目的：回覆你的詢問、安排初談與後續聯繫。</li>
          <li>類別：稱呼、公司或農場名稱、聯絡方式與你填寫的內容。</li>
          <li>儲存：資料透過 Google 表單送出並儲存於 Google 雲端服務（Google LLC），伺服器可能位於臺灣以外地區，僅團隊授權人員可以查看。</li>
          <li>權利：你可以依個人資料保護法第 3 條請求查詢、閱覽、製給複製本、補充或更正、停止蒐集處理利用或刪除。</li>
          <li>不提供必填資料時，我們將無法回覆你的詢問。</li>
        </ul><p style="margin-top:8px">正式上線前將由律師審閱，完整說明見<a href="#privacy" style="text-decoration:underline">隱私權政策</a>。</p></details>
      </div>
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
  const fields = {
    name: $('#name'), company: $('#company'), contact: $('#contact-info-input'), notes: $('#notes'), consent: $('#consent'),
  };
  const checkedTopics = () => $$('[name="topics"]:checked').map((e) => e.value);
  let summary = '';

  function setError(input, errEl, msg) {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errEl.hidden = !msg;
    errEl.textContent = msg || '';
  }

  function validate() {
    const errs = [];
    const name = fields.name.value.trim();
    const contact = fields.contact.value.trim();
    const notes = fields.notes.value.trim();
    setError(fields.name, $('#name-err'), name ? '' : '請留下你的姓名或稱呼');
    if (!name) errs.push(fields.name);
    let cMsg = '';
    if (!contact) cMsg = '請留下 Email、電話或 LINE ID';
    else if (contact.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact)) cMsg = 'Email 格式看起來不正確';
    else if (/^[\d\s\-+()]+$/.test(contact) && contact.replace(/\D/g, '').length < 8) cMsg = '電話號碼好像少了幾碼';
    else if (contact.length < 4) cMsg = '聯絡方式太短了，請再確認';
    setError(fields.contact, $('#contact-err'), cMsg);
    if (cMsg) errs.push(fields.contact);
    const topics = checkedTopics();
    $('#topic-error').textContent = topics.length ? '' : '請至少選擇一個想聊的主題';
    if (!topics.length) errs.push($('[name="topics"]'));
    setError(fields.notes, $('#notes-err'), notes ? '' : '請簡單說說你的想法');
    if (!notes) errs.push(fields.notes);
    setError(fields.consent, $('#consent-err'), fields.consent.checked ? '' : '請勾選同意個人資料蒐集告知');
    if (!fields.consent.checked) errs.push(fields.consent);
    return errs;
  }

  $$('[name="topics"]').forEach((el) => (el.onchange = () => { if (checkedTopics().length) $('#topic-error').textContent = ''; }));
  Object.values(fields).forEach((el) => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(); }));

  form.onsubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { errs[0].focus(); return; }
    const item = $('#item').value;
    summary = '田序共創需求摘要\n' +
      '稱呼：' + fields.name.value.trim() + '\n' +
      '公司或農場：' + (fields.company.value.trim() || '未填寫') + '\n' +
      '聯絡方式：' + fields.contact.value.trim() + '\n' +
      '詢問主題：' + checkedTopics().join('、') + '\n' +
      (item ? '詢問項目：' + item + '\n' : '') +
      '想法：' + fields.notes.value.trim();
    $('#summary-text').textContent = summary;
    $('#summary').hidden = false;
    $('#feedback').className = 'feedback';
    $('#feedback').textContent = live ? '請確認摘要內容，按「確認送出」後才會傳給團隊' : '摘要已整理完成　尚未傳送給團隊';
    $('#summary').scrollIntoView({ behavior: window.motionPaused ? 'auto' : 'smooth', block: 'nearest' });
  };

  $('#edit').onclick = () => { $('#summary').hidden = true; fields.name.focus(); };

  $('#copy').onclick = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      $('#feedback').textContent = '已複製　你可以貼到與團隊的對話中';
    } catch (err) {
      $('#feedback').textContent = '瀏覽器未允許自動複製　請選取上方摘要文字手動複製';
    }
  };

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
      const now = new Date(), pad = (n) => String(n).padStart(2, '0');
      const values = {
        name: fields.name.value.trim(),
        company: fields.company.value.trim(),
        contact: fields.contact.value.trim(),
        topics: checkedTopics().join('、'),
        item: $('#item').value,
        notes: fields.notes.value.trim(),
        consentAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}（已同意個資蒐集告知）`,
      };
      const body = new URLSearchParams();
      Object.entries(SITE.googleForm.fields).forEach(([k, entry]) => body.append(entry, values[k] || ''));
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15000);
      try {
        await fetch(SITE.googleForm.action, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: body.toString(), signal: ctrl.signal });
        try { sessionStorage.setItem(LAST, String(Date.now())); } catch (e) { /* ignore */ }
        showSuccess();
      } catch (err) {
        fb.className = 'feedback err';
        fb.textContent = '送出時連線失敗，資料還沒有送到。請確認網路後再按一次「確認送出」，或先複製摘要。';
        btn.disabled = false; btn.textContent = '確認送出 ↗';
      } finally {
        clearTimeout(timer);
      }
    };
  }

  function showSuccess() {
    $('#summary').innerHTML = `<div class="success" role="status"><h3>已送出，謝謝你</h3><p>我們收到後會依你留下的聯絡方式回覆。若幾個工作天內沒有收到消息，歡迎再留言一次。</p><div class="row" style="justify-content:center;margin-top:16px"><button class="btn soft" type="button" id="again">再填一份</button></div></div>`;
    $('#again').onclick = () => {
      form.reset();
      $('#item').value = '';
      $('#form-banner').hidden = true;
      location.reload();
    };
  }
})();
