/**
 * 田序共創 FIELDWISE B2B 版｜預約初談接收程式（Google Apps Script 網頁應用程式）
 *
 * 網站 site/js/contact.js 以 POST（Content-Type: text/plain，內容為 JSON）送到這支程式的 /exec 網址，
 * 程式把資料寫進綁定的試算表「預約初談」工作表，並寄 Email 通知擁有者。
 *
 * 部署方式：試算表 → 擴充功能 → Apps Script → 貼上本檔 → 部署 → 新增部署作業
 *   類型：網頁應用程式；執行身分：我；誰可以存取：所有人
 * 修改程式後要「管理部署作業 → 編輯 → 版本選新版本」，網址才會維持不變。
 */

const SHEET_NAME = '預約初談';
const NOTIFY = true; // 有新詢問時寄 Email 給試算表擁有者

// [網站送來的欄位代碼, 試算表欄名]；新增欄位只能加在最後面，以免和既有資料錯位
const COLUMNS = [
  ['receivedAt', '收到時間'],
  ['identity', '身分'],
  ['name', '稱呼'],
  ['title', '職稱'],
  ['email', 'Email'],
  ['phone', '電話'],
  ['line', 'LINE ID'],
  ['contactPref', '方便聯絡的方式與時段'],
  ['company', '公司名稱'],
  ['taxId', '統一編號'],
  ['channel', '通路類型'],
  ['region', '主要銷售區域'],
  ['products', '有興趣的品項'],
  ['coop', '合作方式'],
  ['scale', '預估採購規模'],
  ['qty', '預估數量與單位'],
  ['timing', '預計需要的時間'],
  ['season', '對應檔期'],
  ['sample', '需要樣品'],
  ['docs', '希望先拿到的資料'],
  ['delivery', '交貨地點或配送方式'],
  ['b2bNotes', '採購補充說明'],
  ['farm', '農場或產地名稱'],
  ['crops', '主要作物'],
  ['farmTopics', '農友想聊的事'],
  ['farmNotes', '目前最想改善的事'],
  ['org', '單位名稱'],
  ['otherNotes', '想聊什麼'],
  ['source', '從哪裡認識我們'],
  ['item', '網站帶入的詢問項目'],
  ['consentAt', '個資同意時間'],
  ['page', '送出頁面'],
  ['status', '處理狀態'],
];
const LABELS = Object.fromEntries(COLUMNS);
const REQUIRED = ['identity', 'name', 'email', 'consentAt'];
const MAX_LEN = 2000;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.website) return json({ ok: true }); // 防機器人欄位有填：假裝成功、不寫入
    const missing = REQUIRED.filter((k) => !String(data[k] || '').trim());
    if (missing.length) return json({ ok: false, error: 'missing', fields: missing });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim())) return json({ ok: false, error: 'email' });

    const row = COLUMNS.map(([key]) => {
      if (key === 'receivedAt') return new Date();
      if (key === 'status') return '未處理';
      return clean(data[key]);
    });

    lock.waitLock(10000);
    const sheet = getSheet();
    // 先把整列設成純文字再寫入，電話、統一編號開頭的 0 才不會被吃掉
    const r = sheet.getLastRow() + 1;
    const range = sheet.getRange(r, 1, 1, COLUMNS.length);
    range.setNumberFormat('@');
    sheet.getRange(r, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    range.setValues([row]);
    SpreadsheetApp.flush();
    lock.releaseLock();

    if (NOTIFY) notify(row);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* 已釋放 */ }
  }
}

// 用瀏覽器打開 /exec 網址時顯示的狀態，方便確認部署成功
function doGet() {
  return json({ ok: true, service: '田序共創預約初談', sheet: SHEET_NAME });
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS.map(([, label]) => label));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold').setBackground('#e0eed3');
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return sheet;
}

function clean(v) {
  let s = String(v == null ? '' : v).trim().slice(0, MAX_LEN);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // 避免被試算表當成公式
  return s;
}

function notify(row) {
  const get = (key) => row[COLUMNS.findIndex(([k]) => k === key)];
  const lines = COLUMNS
    .map(([key, label], i) => [key, label, row[i]])
    .filter(([key, , v]) => key !== 'status' && v !== '' && v != null)
    .map(([, label, v]) => `${label}：${v instanceof Date ? Utilities.formatDate(v, 'Asia/Taipei', 'yyyy-MM-dd HH:mm') : v}`);
  const subject = `田序共創新詢問｜${get('identity')}｜${get('company') || get('farm') || get('org') || get('name')}`;
  const body = lines.join('\n') + '\n\n試算表：' + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  MailApp.sendEmail({ to: Session.getEffectiveUser().getEmail(), subject, body, replyTo: String(get('email') || '') });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 部署前可在編輯器手動執行一次：建立工作表並觸發授權
function setup() {
  getSheet();
}
