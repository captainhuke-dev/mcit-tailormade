/* P103 — ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง
 * IIFE — window.P103CheckCost = { mount }
 * Data: MAC5 — api/p103_stk.php (picker) + api/p103_cost.php (balance + PR/PO/RE TOP 5)
 * clone demo/P103_demo.html + C# frm_CheckCOST_GUI.cs / frm_selectSTK.cs
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = {
    stk: "api/p103_stk.php",
    cost: "api/p103_cost.php"
  };
  // clone C# checkedListBox2 — กลุ่มคลัง 9 ตัว (default ติ๊ก G01 + G06)
  var GROUPS = ["G01", "G02", "G03", "G04", "G06", "G07", "G09", "PD", "RTV"];
  var DEFAULT_CHECKED = ["G01", "G06"];

  var root = null;
  var el = {};
  var state = {
    product: null,   // {code, name, mainUnit, subUnit}
    groups: {},      // {G01: true, ...}
    loaded: false,
    loading: false,
    data: null       // {balance, pr, po, re, summary}
  };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      money: '<path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
      cash: '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle>',
      unit: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
      chart: '<path d="M3 3v18h18"></path><path d="m7 16 4-5 4 3 5-7"></path>',
      pick: '<path d="M9 11H3v10h6zM21 3h-6v18h6zM15 7H9v14h6z"></path>',
      close: '<path d="M18 6 6 18M6 6l12 12"></path>',
      check: '<path d="M20 6 9 17l-5-5"></path>',
      diff: '<path d="M8 3 4 7l4 4"></path><path d="M4 7h16"></path><path d="m16 21 4-4-4-4"></path><path d="M20 17H4"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(d) {
    // "2024-01-29" → "29/01/2024"
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return m[3] + "/" + m[2] + "/" + m[1];
  }

  function num(s) {
    return (parseFloat(String(s == null ? "" : s).replace(/,/g, "")) || 0);
  }

  function money(v) {
    return (v || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function qty(v) {
    return (v || 0).toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  }

  function showToast(msg, ms) {
    var t = $("p103Toast");
    $("p103ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    t.classList.add("show");
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }

  function apiPost(url, payload) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  /* ---------- groups ---------- */
  function renderGroups() {
    el.groups.innerHTML = GROUPS.map(function (g) {
      return '<label class="p103-group-option"><input type="checkbox" value="' + g + '"' + (state.groups[g] ? " checked" : "") + ">" + g + "</label>";
    }).join("");
  }

  function checkedGroups() {
    var out = [];
    el.groups.querySelectorAll("input:checked").forEach(function (c) { out.push(c.value); });
    return out;
  }

  /* ---------- stock cards ---------- */
  function renderStock() {
    var d = state.data;
    if (!d) {
      el.qty.textContent = "0.000";
      el.avgCost.textContent = "0.000";
      el.value.textContent = "0.000";
      el.mainUnit.textContent = state.product ? state.product.mainUnit || "-" : "-";
      el.subUnit.textContent = state.product ? state.product.subUnit || "-" : "-";
      return;
    }
    el.qty.textContent = d.balance.qty;
    el.avgCost.textContent = d.balance.avgCost;
    el.value.textContent = d.balance.value;
    el.mainUnit.textContent = state.product ? (state.product.mainUnit || "-") : "-";
    el.subUnit.textContent = state.product ? (state.product.subUnit || "-") : "-";
  }

  /* ---------- tables ---------- */
  function ccyTag(c) {
    var cls = c === "THB" ? "p103-ccy thb" : "p103-ccy";
    return '<span class="' + cls + '">' + esc(c || "") + "</span>";
  }

  function emptyRow(cols, msg) {
    return '<tr class="p103-empty"><td colspan="' + cols + '">' + esc(msg) + "</td></tr>";
  }

  function renderPR() {
    var rows = state.data ? state.data.pr : [];
    el.prRows.innerHTML = rows.length === 0
      ? emptyRow(7, "ไม่พบประวัติ PR สำหรับสินค้านี้")
      : rows.map(function (r, i) {
          return '<tr' + (i === 0 ? ' class="selected"' : "") + ">" +
            '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
            '<td class="p103-vnos">' + esc(r.vnos) + "</td>" +
            '<td class="center">' + esc(r.unit) + "</td>" +
            '<td class="number">' + esc(qty(r.qty)) + "</td>" +
            '<td class="number">' + esc(money(num(r.sum))) + "</td>" +
            '<td class="number">' + esc((num(r.uprice)).toFixed(2)) + "</td>" +
            '<td class="center">' + ccyTag(r.ccy) + "</td>" +
            "</tr>";
        }).join("");
  }

  function renderPO() {
    var rows = state.data ? state.data.po : [];
    el.poRows.innerHTML = rows.length === 0
      ? emptyRow(10, "ไม่พบประวัติการซื้อสำหรับสินค้านี้")
      : rows.map(function (r, i) {
          return '<tr' + (i === 0 ? ' class="selected"' : "") + ">" +
            '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
            '<td class="p103-vnos">' + esc(r.vnos) + "</td>" +
            '<td class="center">' + esc(r.unit) + "</td>" +
            '<td class="number">' + esc(qty(r.qty)) + "</td>" +
            '<td class="number">' + esc(money(num(r.sum))) + "</td>" +
            '<td class="number">' + esc((num(r.uprice)).toFixed(2)) + "</td>" +
            '<td class="number">' + esc(r.exRate) + "</td>" +
            '<td class="center">' + ccyTag(r.ccy) + "</td>" +
            '<td class="number">' + esc(money(num(r.sumTHB))) + "</td>" +
            '<td class="number">' + esc((num(r.upriceTHB)).toFixed(2)) + "</td>" +
            "</tr>";
        }).join("");
  }

  function renderRE() {
    var rows = state.data ? state.data.re : [];
    el.reRows.innerHTML = rows.length === 0
      ? emptyRow(10, "ไม่พบประวัติค่าใช้จ่ายส่วนเพิ่มสำหรับสินค้านี้")
      : rows.map(function (r, i) {
          return '<tr' + (i === 0 ? ' class="selected"' : "") + ">" +
            '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
            '<td class="p103-vnos">' + esc(r.vnos) + "</td>" +
            '<td class="center">' + esc(r.unit) + "</td>" +
            '<td class="number">' + esc(qty(r.qty)) + "</td>" +
            '<td class="number">' + esc(money(num(r.cost))) + "</td>" +
            '<td class="number">' + esc((num(r.ucost)).toFixed(3)) + "</td>" +
            '<td class="number">' + esc(r.exRate) + "</td>" +
            '<td class="center">' + ccyTag(r.ccy) + "</td>" +
            '<td class="number">' + esc(money(num(r.costTHB))) + "</td>" +
            '<td class="number">' + esc((num(r.ucostTHB)).toFixed(3)) + "</td>" +
            "</tr>";
        }).join("");
  }

  function renderAll() {
    renderStock();
    renderPR();
    renderPO();
    renderRE();
  }

  /* ---------- search ---------- */
  function doSearch() {
    if (!state.product || !state.product.code) {
      showToast("โปรดเลือกสินค้า");
      return;
    }
    var groups = checkedGroups();
    if (groups.length === 0) {
      showToast("โปรดเลือกกลุ่มคลังสินค้า อย่างน้อย 1 ตัวเลือก");
      return;
    }
    if (state.loading) return;
    state.loading = true;
    el.searchBtn.disabled = true;
    el.searchBtn.classList.add("loading");
    el.searchLabel.textContent = "กำลังค้นหา...";

    apiPost(API.cost, { connectionId: MAC5_CONNECTION_ID, stk: state.product.code, groups: groups })
      .then(function (data) {
        state.loading = false;
        el.searchBtn.disabled = false;
        el.searchBtn.classList.remove("loading");
        el.searchLabel.textContent = "ค้นหา";
        if (!data.ok) {
          showToast(data.error || "ค้นหาไม่สำเร็จ");
          return;
        }
        state.data = data;
        renderAll();
        showToast("ค้นหาเสร็จแล้ว — " + (data.product ? data.product.name : state.product.code));
      })
      .catch(function (e) {
        state.loading = false;
        el.searchBtn.disabled = false;
        el.searchBtn.classList.remove("loading");
        el.searchLabel.textContent = "ค้นหา";
        showToast("ค้นหาไม่สำเร็จ: " + e.message);
      });
  }

  /* ---------- picker (clone frm_selectSTK) ---------- */
  var picker = { kw: "", rows: [], idx: -1 };

  function openPicker() {
    picker.kw = "";
    picker.rows = [];
    picker.idx = -1;
    el.pickerKw.value = "";
    el.pickerCount.textContent = "";
    el.pickerList.innerHTML = '<tr><td colspan="4" class="p103-empty">กำลังโหลด...</td></tr>';
    el.pickerBackdrop.classList.add("show");
    el.pickerBackdrop.style.display = "flex";
    setTimeout(function () { el.pickerKw.focus(); }, 60);
    loadPicker("");
  }

  function closePicker() {
    el.pickerBackdrop.classList.remove("show");
    el.pickerBackdrop.style.display = "none";
  }

  function loadPicker(kw) {
    apiPost(API.stk, { connectionId: MAC5_CONNECTION_ID, kw: kw })
      .then(function (data) {
        if (!data.ok) {
          el.pickerList.innerHTML = '<tr><td colspan="4" class="p103-empty">' + esc(data.error || "โหลดไม่สำเร็จ") + "</td></tr>";
          return;
        }
        picker.rows = data.rows;
        picker.idx = -1;
        el.pickerCount.textContent = "จำนวน " + data.count.toLocaleString("th-TH");
        if (data.rows.length === 0) {
          el.pickerList.innerHTML = '<tr><td colspan="4" class="p103-empty">ไม่พบสินค้า</td></tr>';
          return;
        }
        el.pickerList.innerHTML = data.rows.map(function (r, i) {
          return '<tr data-i="' + i + '">' +
            '<td class="p103-vnos">' + esc(r.code) + "</td>" +
            '<td>' + esc(r.name) + "</td>" +
            '<td class="center">' + esc(r.mainUnit) + "</td>" +
            '<td class="center">' + esc(r.subUnit) + "</td>" +
            "</tr>";
        }).join("");
      })
      .catch(function (e) {
        el.pickerList.innerHTML = '<tr><td colspan="4" class="p103-empty">' + esc(e.message) + "</td></tr>";
      });
  }

  function pickProduct(row) {
    state.product = row;
    state.data = null;
    el.codeBox.textContent = row.code;
    el.nameBox.textContent = row.name;
    closePicker();
    renderAll(); // reset cards
  }

  /* ---------- CSS (clone demo — prefix p103-) ---------- */
  var CSS = [
    ".p103-app{--p103-primary:#2563eb;--p103-primary-dark:#1d4ed8;--p103-primary-soft:#eff6ff;--p103-success:#059669;--p103-success-soft:#ecfdf5;--p103-warning:#d97706;--p103-warning-soft:#fffbeb;--p103-purple:#7c3aed;--p103-purple-soft:#f5f3ff;--p103-text:#172033;--p103-muted:#64748b;--p103-border:#dbe3ef;--p103-surface-soft:#f8fafc;--p103-radius:16px;--p103-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p103-app *,.p103-backdrop *{box-sizing:border-box;margin:0;padding:0}",
    ".p103-app button,.p103-backdrop button{cursor:pointer;font:inherit}",
    ".p103-app button:disabled,.p103-backdrop button:disabled{cursor:not-allowed;opacity:0.5}",
    ".p103-app svg,.p103-backdrop svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p103-app{display:flex;flex-direction:column;gap:14px}",
    /* launcher */
    ".p103-launcher{display:grid;grid-template-columns:minmax(300px,1.2fr) minmax(250px,1fr) auto;gap:14px;align-items:stretch;padding:18px;border:1px solid var(--p103-border);border-radius:var(--p103-radius);background:#fff;box-shadow:0 5px 18px rgba(15,23,42,0.04)}",
    ".p103-launcher-label{display:flex;align-items:center;gap:7px;margin-bottom:12px;color:var(--p103-primary-dark);font-size:12px;font-weight:700}",
    ".p103-launcher-label svg{width:16px;height:16px}",
    ".p103-product-section{display:flex;flex-direction:column;gap:11px}",
    ".p103-field label{display:block;margin-bottom:7px;color:var(--p103-muted);font-size:11px;font-weight:700}",
    ".p103-with-button{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}",
    ".p103-code-box{display:flex;align-items:center;height:44px;padding:0 14px;color:var(--p103-text);border:1px solid var(--p103-border);border-radius:11px;background:var(--p103-surface-soft);font-size:14px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".p103-pick-button{height:44px;padding:0 18px;display:inline-flex;align-items:center;gap:7px;color:var(--p103-primary-dark);border:1px solid #bfdbfe;border-radius:11px;background:var(--p103-primary-soft);font-weight:700;white-space:nowrap;transition:0.15s ease}",
    ".p103-pick-button svg{width:16px;height:16px}",
    ".p103-pick-button:hover{color:#fff;border-color:var(--p103-primary);background:var(--p103-primary)}",
    ".p103-name-box{min-height:44px;display:flex;align-items:center;padding:11px 13px;color:var(--p103-text);border:1px solid var(--p103-border);border-radius:11px;background:var(--p103-surface-soft);font-size:13px;font-weight:600;line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".p103-group-section{display:flex;flex-direction:column}",
    ".p103-group-label{display:block;margin-bottom:9px;color:var(--p103-muted);font-size:11px;font-weight:700}",
    ".p103-group-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 14px;align-content:start}",
    ".p103-group-option{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;cursor:pointer}",
    ".p103-group-option input{width:17px;height:17px;accent-color:var(--p103-primary);cursor:pointer}",
    ".p103-search-column{display:flex;align-items:center;justify-content:center}",
    ".p103-search-button{display:inline-flex;height:100%;min-height:90px;width:150px;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#fff;border:0;border-radius:13px;background:linear-gradient(135deg,#3b82f6,var(--p103-primary-dark));box-shadow:0 10px 22px rgba(37,99,235,0.25);font-size:14px;font-weight:700;transition:0.16s ease}",
    ".p103-search-button svg{width:26px;height:26px}",
    ".p103-search-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}",
    ".p103-search-button.loading svg{animation:p103spin 1s linear infinite}",
    "@keyframes p103spin{to{transform:rotate(360deg)}}",
    /* stock panel */
    ".p103-stock-panel{padding:16px 18px;border:1px solid var(--p103-border);border-radius:var(--p103-radius);background:#fff;box-shadow:0 5px 18px rgba(15,23,42,0.04)}",
    ".p103-panel-header{display:flex;align-items:center;gap:9px;margin-bottom:14px}",
    ".p103-panel-icon{display:grid;width:34px;height:34px;flex:0 0 auto;place-items:center;color:var(--p103-success);border-radius:10px;background:var(--p103-success-soft)}",
    ".p103-panel-icon svg{width:18px;height:18px}",
    ".p103-panel-header h2{font-size:14px;color:var(--p103-text)}",
    ".p103-panel-header p{margin-top:1px;color:var(--p103-muted);font-size:11px}",
    ".p103-stock-grid{display:grid;grid-template-columns:repeat(5,minmax(140px,1fr));gap:12px}",
    ".p103-stock-card{display:flex;min-width:0;align-items:center;gap:11px;padding:12px 14px;border:1px solid var(--p103-border);border-radius:13px;background:var(--p103-surface-soft)}",
    ".p103-stock-icon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p103-primary);border-radius:11px;background:var(--p103-primary-soft)}",
    ".p103-stock-icon svg{width:20px;height:20px}",
    ".p103-stock-card.green .p103-stock-icon{color:var(--p103-success);background:var(--p103-success-soft)}",
    ".p103-stock-card.orange .p103-stock-icon{color:var(--p103-warning);background:var(--p103-warning-soft)}",
    ".p103-stock-card.purple .p103-stock-icon{color:var(--p103-purple);background:var(--p103-purple-soft)}",
    ".p103-stock-text{min-width:0}",
    ".p103-stock-text span{display:block;color:var(--p103-muted);font-size:10px}",
    ".p103-stock-text strong{display:block;overflow:hidden;margin-top:2px;font-size:16px;text-overflow:ellipsis;white-space:nowrap;color:var(--p103-text)}",
    /* history panels */
    ".p103-history-panel{overflow:hidden;border:1px solid var(--p103-border);border-radius:var(--p103-radius);background:#fff;box-shadow:var(--p103-shadow)}",
    ".p103-history-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--p103-border);background:linear-gradient(90deg,#e0f2fe,#f0f9ff)}",
    ".p103-history-icon{display:grid;width:32px;height:32px;flex:0 0 auto;place-items:center;color:var(--p103-primary-dark);border-radius:9px;background:rgba(255,255,255,0.7)}",
    ".p103-history-icon svg{width:17px;height:17px}",
    ".p103-history-header h2{font-size:14px;color:var(--p103-text)}",
    ".p103-table-wrap{max-height:230px;overflow:auto}",
    ".p103-table{width:100%;min-width:760px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p103-table th{position:sticky;top:0;z-index:2;padding:10px 12px;color:#475569;border-bottom:1px solid var(--p103-border);background:var(--p103-surface-soft);box-shadow:inset 0 -1px var(--p103-border);font-size:12px;font-weight:700;text-align:left}",
    ".p103-table td{padding:9px 12px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4;color:var(--p103-text)}",
    ".p103-table th.center,.p103-table td.center{text-align:center}",
    ".p103-table th.number,.p103-table td.number{text-align:right}",
    ".p103-table tbody tr{cursor:pointer;transition:0.14s ease}",
    ".p103-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p103-table tbody tr:hover{background:#f0f7ff}",
    ".p103-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 var(--p103-primary)}",
    ".p103-vnos{color:var(--p103-primary-dark);font-weight:700}",
    ".p103-ccy{display:inline-flex;padding:3px 8px;color:#92400e;border-radius:7px;font-size:11px;font-weight:700;background:#fef3c7}",
    ".p103-ccy.thb{color:#047857;background:#d1fae5}",
    ".p103-empty{padding:26px 12px;color:var(--p103-muted);font-size:12px;text-align:center}",
    /* picker modal (clone frm_selectSTK) */
    ".p103-backdrop{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,0.52);backdrop-filter:blur(4px)}",
    ".p103-backdrop.show{display:flex}",
    ".p103-picker{width:min(860px,100%);max-height:90vh;display:flex;flex-direction:column;overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,0.36)}",
    ".p103-picker-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid var(--p103-border);background:linear-gradient(180deg,#334155,#1e293b)}",
    ".p103-picker-head h3{color:#e2e8f0;font-size:14px;font-weight:700}",
    ".p103-picker-close{display:grid;width:32px;height:30px;place-items:center;color:#fff;border:0;border-radius:7px;background:#dc2626;cursor:pointer}",
    ".p103-picker-close svg{width:14px;height:14px;stroke-width:2.5}",
    ".p103-picker-close:hover{background:#b91c1c}",
    ".p103-picker-search{display:flex;gap:10px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--p103-border);background:var(--p103-surface-soft)}",
    ".p103-picker-search input{flex:1;height:40px;padding:0 14px;color:var(--p103-text);border:1px solid var(--p103-border);border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p103-picker-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,0.14)}",
    ".p103-picker-count{color:var(--p103-muted);font-size:12px;white-space:nowrap}",
    ".p103-picker-table{flex:1;overflow:auto;min-height:200px}",
    ".p103-picker-table table{width:100%;border-collapse:separate;border-spacing:0}",
    ".p103-picker-table th{position:sticky;top:0;z-index:2;padding:9px 12px;color:#475569;border-bottom:1px solid var(--p103-border);background:var(--p103-surface-soft);font-size:12px;font-weight:700;text-align:left}",
    ".p103-picker-table td{padding:8px 12px;border-bottom:1px solid #edf1f6;font-size:12px;color:var(--p103-text)}",
    ".p103-picker-table tbody tr{cursor:pointer;transition:0.12s ease}",
    ".p103-picker-table tbody tr:hover{background:#f0f7ff}",
    ".p103-picker-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 var(--p103-primary)}",
    ".p103-picker-foot{padding:10px 16px;border-top:1px solid var(--p103-border);color:var(--p103-muted);font-size:11px;background:var(--p103-surface-soft)}",
    /* toast */
    ".p103-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p103-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    "@media (max-width:1100px){.p103-launcher{grid-template-columns:1fr}.p103-search-button{width:100%;min-height:54px;flex-direction:row}.p103-stock-grid,.p103-summary-grid{grid-template-columns:repeat(2,1fr)}}",
    "@media (max-width:680px){.p103-group-grid{grid-template-columns:1fr 1fr}.p103-stock-grid,.p103-summary-grid{grid-template-columns:1fr}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  var HTML =
    '<div class="p103-app">' +
      // launcher
      '<form class="p103-launcher" id="p103Form">' +
        '<div class="p103-product-section">' +
          '<div class="p103-launcher-label">' + icon("search") + " ค้นหาสินค้า</div>" +
          '<div class="p103-field">' +
            '<label>รหัสสินค้า</label>' +
            '<div class="p103-with-button">' +
              '<div class="p103-code-box" id="p103CodeBox">(เลือกสินค้า)</div>' +
              '<button class="p103-pick-button" id="p103PickBtn" type="button">' + icon("pick") + " เลือก</button>" +
            "</div>" +
          "</div>" +
          '<div class="p103-field">' +
            "<label>ชื่อสินค้า</label>" +
            '<div class="p103-name-box" id="p103NameBox">—</div>' +
          "</div>" +
        "</div>" +
        '<div class="p103-group-section">' +
          '<label class="p103-group-label">กลุ่มคลัง</label>' +
          '<div class="p103-group-grid" id="p103Groups"></div>' +
        "</div>" +
        '<div class="p103-search-column">' +
          '<button class="p103-search-button" id="p103SearchBtn" type="submit">' + icon("search") + '<span id="p103SearchLabel">ค้นหา</span></button>' +
        "</div>" +
      "</form>" +
      // stock panel
      '<section class="p103-stock-panel">' +
        '<div class="p103-panel-header">' +
          '<div class="p103-panel-icon">' + icon("grid") + "</div>" +
          "<div><h2>ข้อมูลสต็อกสินค้า</h2><p>ผลลัพธ์จากกลุ่มคลังที่เลือกไว้ในส่วนค้นหา</p></div>" +
        "</div>" +
        '<div class="p103-stock-grid">' +
          '<div class="p103-stock-card"><div class="p103-stock-icon">' + icon("grid") + '</div><div class="p103-stock-text"><span>จำนวน</span><strong id="p103Qty">0.000</strong></div></div>' +
          '<div class="p103-stock-card green"><div class="p103-stock-icon">' + icon("money") + '</div><div class="p103-stock-text"><span>ต้นทุนเฉลี่ย</span><strong id="p103AvgCost">0.000</strong></div></div>' +
          '<div class="p103-stock-card orange"><div class="p103-stock-icon">' + icon("cash") + '</div><div class="p103-stock-text"><span>มูลค่า</span><strong id="p103Value">0.000</strong></div></div>' +
          '<div class="p103-stock-card purple"><div class="p103-stock-icon">' + icon("unit") + '</div><div class="p103-stock-text"><span>หน่วยหลัก</span><strong id="p103MainUnit">-</strong></div></div>' +
          '<div class="p103-stock-card purple"><div class="p103-stock-icon">' + icon("unit") + '</div><div class="p103-stock-text"><span>หน่วยรอง</span><strong id="p103SubUnit">-</strong></div></div>' +
        "</div>" +
      "</section>" +
      // PR
      '<section class="p103-history-panel">' +
        '<div class="p103-history-header">' +
          '<div class="p103-history-icon">' + icon("doc") + "</div>" +
          "<h2>PR 5 ครั้งหลังสุด</h2>" +
        "</div>" +
        '<div class="p103-table-wrap"><table class="p103-table"><thead><tr>' +
          '<th class="center">วันที่</th><th>เลขใบสำคัญ</th><th class="center">หน่วย</th><th class="number">จำนวน</th><th class="number">ราคา</th><th class="number">ราคา/หน่วย</th><th class="center">สกุล</th>' +
        "</tr></thead><tbody id=\"p103PrRows\">" + emptyRow(7, "เลือกสินค้าแล้วกดค้นหา") + "</tbody></table></div>" +
      "</section>" +
      // PO
      '<section class="p103-history-panel">' +
        '<div class="p103-history-header">' +
          '<div class="p103-history-icon">' + icon("chart") + "</div>" +
          "<h2>ประวัติการซื้อ 5 ครั้งหลังสุด</h2>" +
        "</div>" +
        '<div class="p103-table-wrap"><table class="p103-table"><thead><tr>' +
          '<th class="center">วันที่</th><th>เลขใบสำคัญ</th><th class="center">หน่วย</th><th class="number">จำนวน</th><th class="number">ราคา</th><th class="number">ราคา/หน่วย</th><th class="number">Ex Rate</th><th class="center">สกุล</th><th class="number">ราคา(THB)</th><th class="number">ราคา/หน่วย(THB)</th>' +
        "</tr></thead><tbody id=\"p103PoRows\">" + emptyRow(10, "เลือกสินค้าแล้วกดค้นหา") + "</tbody></table></div>" +
      "</section>" +
      // RE
      '<section class="p103-history-panel">' +
        '<div class="p103-history-header">' +
          '<div class="p103-history-icon">' + icon("money") + "</div>" +
          "<h2>ประวัติค่าใช้จ่ายส่วนเพิ่ม 5 ครั้งหลังสุด</h2>" +
        "</div>" +
        '<div class="p103-table-wrap"><table class="p103-table"><thead><tr>' +
          '<th class="center">วันที่</th><th>เลขใบสำคัญ</th><th class="center">หน่วย</th><th class="number">จำนวน</th><th class="number">ค่าใช้จ่ายเพิ่ม</th><th class="number">ค่าใช้จ่ายเพิ่ม/หน่วย</th><th class="number">Ex Rate</th><th class="center">สกุล</th><th class="number">ค่าใช้จ่ายเพิ่ม(THB)</th><th class="number">ค่าใช้จ่ายเพิ่ม/หน่วย(THB)</th>' +
        "</tr></thead><tbody id=\"p103ReRows\">" + emptyRow(10, "เลือกสินค้าแล้วกดค้นหา") + "</tbody></table></div>" +
      "</section>" +
      // picker modal
      '<div class="p103-backdrop" id="p103PickerBackdrop">' +
        '<div class="p103-picker">' +
          '<div class="p103-picker-head"><h3>เลือกสินค้า</h3><button class="p103-picker-close" id="p103PickerClose" type="button" title="ปิด">' + icon("close") + "</button></div>" +
          '<div class="p103-picker-search">' +
            '<input id="p103PickerKw" type="text" placeholder="ค้นหารหัสสินค้า / ชื่อสินค้า (Enter)" autocomplete="off">' +
            '<span class="p103-picker-count" id="p103PickerCount"></span>' +
          "</div>" +
          '<div class="p103-picker-table"><table><thead><tr><th>รหัสสินค้า</th><th>ชื่อสินค้า</th><th class="center">หน่วยหลัก</th><th class="center">หน่วยรอง</th></tr></thead><tbody id="p103PickerList"></tbody></table></div>' +
          '<div class="p103-picker-foot">คลิกแถวสินค้าเพื่อเลือก — หรือพิมพ์ค้นหาแล้วกด Enter</div>' +
        "</div>" +
      "</div>" +
      // toast
      '<div class="p103-toast" id="p103Toast"><span id="p103ToastMsg"></span></div>' +
    "</div>";

  /* ---------- mount ---------- */
  function mount(target) {
    root = target;
    var style = document.createElement("style");
    style.textContent = CSS;
    target.appendChild(style);
    target.insertAdjacentHTML("beforeend", HTML);

    el.form = $("p103Form");
    el.codeBox = $("p103CodeBox");
    el.nameBox = $("p103NameBox");
    el.groups = $("p103Groups");
    el.searchBtn = $("p103SearchBtn");
    el.searchLabel = $("p103SearchLabel");
    el.qty = $("p103Qty");
    el.avgCost = $("p103AvgCost");
    el.value = $("p103Value");
    el.mainUnit = $("p103MainUnit");
    el.subUnit = $("p103SubUnit");
    el.prRows = $("p103PrRows");
    el.poRows = $("p103PoRows");
    el.reRows = $("p103ReRows");
    el.pickerBackdrop = $("p103PickerBackdrop");
    el.pickerKw = $("p103PickerKw");
    el.pickerCount = $("p103PickerCount");
    el.pickerList = $("p103PickerList");

    // default ติ๊ก G01 + G06 (clone C# frm_Load)
    GROUPS.forEach(function (g) { state.groups[g] = DEFAULT_CHECKED.indexOf(g) >= 0; });
    renderGroups();

    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });

    $("p103PickBtn").addEventListener("click", function () { openPicker(); });

    // picker — search (Enter) + double-click style: click = select (web)
    el.pickerKw.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        loadPicker(el.pickerKw.value.trim());
      } else if (e.key === "Escape") {
        closePicker();
      }
    });
    $("p103PickerClose").addEventListener("click", closePicker);
    el.pickerBackdrop.addEventListener("click", function (e) {
      if (e.target === el.pickerBackdrop) closePicker();
    });
    el.pickerList.addEventListener("click", function (e) {
      var tr = e.target.closest("tr[data-i]");
      if (!tr) return;
      var i = parseInt(tr.getAttribute("data-i"), 10);
      if (picker.rows[i]) pickProduct(picker.rows[i]);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && el.pickerBackdrop.classList.contains("show")) closePicker();
    });
  }

  window.P103CheckCost = { mount: mount };
})();
