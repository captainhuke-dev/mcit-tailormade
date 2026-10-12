/* P039 — ตรวจสอบตัดของเกิน SO
 * IIFE — window.P039CutSO = { mount }
 * Data: MAC5 — api/p039_cutso.php (3 modes: product/amount/complete)
 * clone demo/P039_demo.html + C# FrmCheckCutSOGUI.cs
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { cutso: "api/p039_cutso.php" };

  // clone C# — 3 modes (WHERE ตามปุ่ม)
  var MODES = {
    product: { title: "ผลตรวจสอบจากสินค้า", hint: "CPSstkCUT1 - CPSstkREQ > 0" },
    amount: { title: "ผลตรวจสอบจากยอดเงิน", hint: "CPSsumREQ - CPSsumCUT1 > 0" },
    complete: { title: "ผลตรวจสอบสินค้าส่งครบแต่ค้างส่ง", hint: "CPSstkCUT1 = CPSstkREQ" }
  };

  var root = null;
  var el = {};
  var state = {
    mode: "amount", // default active (clone demo)
    items: [],
    sortField: "index",
    sortDir: "asc",
    loading: false,
    searched: false
  };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      box: '<path d="M20 7 12 3 4 7l8 4 8-4z"></path><path d="M4 7v10l8 4 8-4V7"></path><path d="M12 11v10"></path>',
      money: '<path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
      check: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      rows: '<path d="M3 5h18M3 10h18M3 15h18M3 20h18"></path>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(d) {
    // "2024-01-29" → "29/01/2567" (พ.ศ.)
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543);
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

  function isoDate(d) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function showToast(msg, ms) {
    $("p039ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  function apiPost(url, payload) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function emptyRow(colspan, text) {
    return '<tr><td colspan="' + colspan + '" class="p039-empty">' + esc(text) + "</td></tr>";
  }

  /* ---------- search ---------- */
  function doSearch() {
    if (state.loading) return;
    var from = el.dateFrom.value;
    var to = el.dateTo.value;
    if (!from || !to) {
      showToast("กรอกช่วงวันทีก่อน");
      return;
    }
    state.loading = true;
    apiPost(API.cutso, { connectionId: MAC5_CONNECTION_ID, mode: state.mode, from: from, to: to })
      .then(function (data) {
        state.loading = false;
        if (!data.ok) {
          state.items = [];
          state.searched = true;
          render();
          showToast(data.error || "ค้นหาไม่สำเร็จ");
          return;
        }
        state.items = data.rows;
        state.searched = true;
        render();
        showToast("พบข้อมูล " + data.count.toLocaleString("th-TH") + " รายการ");
      })
      .catch(function (e) {
        state.loading = false;
        showToast(e.message || "ค้นหาไม่สำเร็จ");
      });
  }

  /* ---------- sort + filter ---------- */
  function filtered() {
    var kw = (el.quick.value || "").trim().toLowerCase();
    var items = state.items;
    if (kw) {
      items = items.filter(function (r) {
        return [r.vnos, r.cus, r.cusName, r.stk, r.stkName].join(" ").toLowerCase().indexOf(kw) >= 0;
      });
    }
    var f = state.sortField;
    var dir = state.sortDir === "asc" ? 1 : -1;
    items = items.slice().sort(function (a, b) {
      var x, y;
      if (f === "ordered" || f === "shipped" || f === "qtyOrdered" || f === "qtyShipped") {
        x = f === "ordered" ? num(a.sumREQ) : f === "shipped" ? num(a.sumCUT) : f === "qtyOrdered" ? num(a.stkREQ) : num(a.stkCUT);
        y = f === "ordered" ? num(b.sumREQ) : f === "shipped" ? num(b.sumCUT) : f === "qtyOrdered" ? num(b.stkREQ) : num(b.stkCUT);
      } else if (f === "date") {
        x = a.date; y = b.date;
      } else if (f === "document") {
        x = String(a.vnos); y = String(b.vnos);
      } else if (f === "customerCode") {
        x = String(a.cus); y = String(b.cus);
      } else if (f === "productCode") {
        x = String(a.stk); y = String(b.stk);
      } else {
        x = a._idx; y = b._idx;
      }
      if (x < y) return -1 * dir;
      if (x > y) return 1 * dir;
      return 0;
    });
    return items;
  }

  /* ---------- render ---------- */
  function render() {
    var items = filtered();
    items.forEach(function (r, i) { r._idx = i + 1; });
    var tbody = el.rows;

    var excessTotal = 0;
    state.items.forEach(function (r) {
      excessTotal += Math.max(0, num(r.sumCUT) - num(r.sumREQ));
    });
    el.footerExcess.textContent = money(excessTotal);
    el.badge.textContent = items.length.toLocaleString("th-TH") + " รายการ";
    el.footerText.textContent = "แสดง " + items.length.toLocaleString("th-TH") + " รายการ";
    el.subtitle.textContent = "จำนวน " + items.length.toLocaleString("th-TH") + " แถว";

    if (!state.searched) {
      tbody.innerHTML = emptyRow(11, "กดปุ่มรูปแบบการตรวจสอบเพื่อค้นหา");
      el.emptyState.classList.remove("show");
      el.tableContainer.style.display = "";
      return;
    }
    if (items.length === 0) {
      tbody.innerHTML = "";
      el.tableContainer.style.display = "none";
      el.emptyState.classList.add("show");
      return;
    }
    el.tableContainer.style.display = "";
    el.emptyState.classList.remove("show");

    tbody.innerHTML = items.map(function (r) {
      var isExcess = num(r.sumCUT) > num(r.sumREQ);
      return "<tr>" +
        '<td class="center row-index">' + r._idx + "</td>" +
        '<td class="document-number">' + esc(r.vnos) + "</td>" +
        '<td class="center">' + fmtDate(r.date) + "</td>" +
        '<td class="customer-code">' + esc(r.cus) + "</td>" +
        '<td title="' + esc(r.cusName) + '">' + esc(r.cusName) + "</td>" +
        '<td class="product-code">' + esc(r.stk) + "</td>" +
        '<td title="' + esc(r.stkName) + '">' + esc(r.stkName) + "</td>" +
        '<td class="number amount">' + money(r.sumREQ) + "</td>" +
        '<td class="number amount' + (isExcess ? " excess" : "") + '">' + money(r.sumCUT) + "</td>" +
        '<td class="center"><span class="qty-tag ordered">' + qty(r.stkREQ) + "</span></td>" +
        '<td class="center"><span class="qty-tag shipped">' + qty(r.stkCUT) + "</span></td>" +
        "</tr>";
    }).join("");
  }

  /* ---------- mode (click = search ทันที) ---------- */
  function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll(".p039-mode-button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });
    el.title.textContent = MODES[mode].title;
    doSearch();
  }

  /* ---------- CSS (clone demo — prefix p039-) ---------- */
  var CSS = [
    ".p039-app{--p039-primary:#2563eb;--p039-primary-dark:#1d4ed8;--p039-primary-soft:#eff6ff;--p039-success:#059669;--p039-success-soft:#ecfdf5;--p039-warning:#d97706;--p039-warning-soft:#fffbeb;--p039-danger:#dc2626;--p039-danger-soft:#fef2f2;--p039-purple:#7c3aed;--p039-purple-soft:#f5f3ff;--p039-text:#172033;--p039-muted:#64748b;--p039-border:#dbe3ef;--p039-surface-soft:#f8fafc;--p039-radius:16px;--p039-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p039-app *{box-sizing:border-box;margin:0;padding:0}",
    ".p039-app button,.p039-app input{font:inherit}",
    ".p039-app button{cursor:pointer}",
    ".p039-app button:disabled{cursor:not-allowed;opacity:0.5}",
    ".p039-app svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p039-app{display:flex;flex-direction:column;gap:14px}",
    /* launcher */
    ".p039-launcher{display:grid;grid-template-columns:minmax(260px,0.8fr) minmax(300px,1.4fr);gap:14px;align-items:start;padding:18px;border:1px solid var(--p039-border);border-radius:var(--p039-radius);background:#fff;box-shadow:0 5px 18px rgba(15,23,42,0.04)}",
    ".p039-field label{display:block;margin-bottom:7px;color:var(--p039-muted);font-size:11px;font-weight:700}",
    ".p039-date-group{display:flex;flex-direction:column;gap:11px}",
    ".p039-input-wrap{position:relative}",
    ".p039-input-wrap svg{position:absolute;top:50%;left:13px;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p039-input-wrap input{width:100%;height:44px;padding:0 14px 0 43px;color:var(--p039-text);border:1px solid var(--p039-border);border-radius:11px;outline:none;background:#fff;font-size:14px}",
    ".p039-input-wrap input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p039-mode-section label{display:block;margin-bottom:9px;color:var(--p039-muted);font-size:11px;font-weight:700}",
    ".p039-mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}",
    ".p039-mode-button{display:flex;min-height:68px;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:10px 8px;color:var(--p039-text);border:1px solid var(--p039-border);border-radius:13px;background:var(--p039-surface-soft);font-size:12px;font-weight:700;text-align:center;transition:0.16s ease}",
    ".p039-mode-button svg{width:20px;height:20px;color:var(--p039-primary)}",
    ".p039-mode-button:hover{border-color:#bfdbfe;background:var(--p039-primary-soft)}",
    ".p039-mode-button.active{color:#fff;border-color:var(--p039-primary-dark);background:linear-gradient(135deg,#3b82f6,var(--p039-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,0.25)}",
    ".p039-mode-button.active svg{color:#fff}",
    /* panel */
    ".p039-panel{overflow:hidden;border:1px solid var(--p039-border);border-radius:var(--p039-radius);background:#fff;box-shadow:var(--p039-shadow)}",
    ".p039-panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--p039-border)}",
    ".p039-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p039-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:var(--p039-primary);border-radius:10px;background:var(--p039-primary-soft)}",
    ".p039-panel-icon svg{width:18px;height:18px}",
    ".p039-panel-title h2{overflow:hidden;font-size:14px;color:var(--p039-text);text-overflow:ellipsis;white-space:nowrap}",
    ".p039-panel-title p{overflow:hidden;margin-top:1px;color:var(--p039-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p039-panel-actions{display:flex;align-items:center;gap:8px}",
    ".p039-table-search{position:relative;width:240px}",
    ".p039-table-search svg{position:absolute;top:50%;left:10px;width:15px;height:15px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p039-table-search input{width:100%;height:36px;padding:0 10px 0 32px;border:1px solid var(--p039-border);border-radius:9px;outline:none;font-size:12px}",
    ".p039-table-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,0.12)}",
    ".p039-badge{padding:5px 10px;color:var(--p039-primary-dark);border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p039-table-container{max-height:560px;overflow:auto}",
    ".p039-table{width:100%;min-width:1250px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p039-table th{position:sticky;top:0;z-index:2;padding:12px 14px;color:#475569;border-bottom:1px solid var(--p039-border);background:var(--p039-surface-soft);box-shadow:inset 0 -1px var(--p039-border);font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p039-table th.sortable{cursor:pointer}",
    ".p039-table th.sortable:hover{color:var(--p039-primary);background:#f1f5f9}",
    ".p039-table td{max-width:230px;overflow:hidden;padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:13px;line-height:1.45;color:var(--p039-text);text-overflow:ellipsis}",
    ".p039-table th.center,.p039-table td.center{text-align:center}",
    ".p039-table th.number,.p039-table td.number{text-align:right}",
    ".p039-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p039-table tbody tr:hover{background:#f0f7ff}",
    ".p039-row-index{color:#334155;font-weight:700}",
    ".p039-document-number{color:var(--p039-primary-dark);font-weight:700}",
    ".p039-customer-code,.p039-product-code{color:#334155;font-weight:700}",
    ".p039-amount{color:#0f172a;font-variant-numeric:tabular-nums;font-weight:700}",
    ".p039-amount.excess{color:var(--p039-danger)}",
    ".p039-qty-tag{display:inline-flex;min-width:28px;justify-content:center;padding:3px 8px;border-radius:7px;font-size:12px;font-weight:700}",
    ".p039-qty-tag.ordered{color:#1d4ed8;background:#dbeafe}",
    ".p039-qty-tag.shipped{color:#047857;background:#d1fae5}",
    ".p039-empty{padding:26px 12px;color:var(--p039-muted);font-size:12px;text-align:center}",
    ".p039-table-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px;color:var(--p039-muted);border-top:1px solid var(--p039-border);background:var(--p039-surface-soft);font-size:12px}",
    ".p039-footer-total{display:flex;align-items:center;gap:8px;padding:6px 11px;color:var(--p039-text);border:1px solid var(--p039-border);border-radius:9px;background:#fff}",
    ".p039-footer-total strong{color:var(--p039-danger)}",
    ".p039-empty-state{display:none;min-height:280px;align-items:center;justify-content:center;color:var(--p039-muted);text-align:center}",
    ".p039-empty-state.show{display:flex}",
    ".p039-empty-state svg{width:48px;height:48px;margin:0 auto 10px}",
    ".p039-empty-state p{margin-top:5px;font-size:11px}",
    /* toast */
    ".p039-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p039-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    "@media (max-width:950px){.p039-launcher{grid-template-columns:1fr}}",
    "@media (max-width:680px){.p039-mode-grid{grid-template-columns:1fr}.p039-panel-header{align-items:flex-start;flex-direction:column}.p039-table-search{width:100%}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  var HTML =
    '<div class="p039-app">' +
      // launcher
      '<div class="p039-launcher" id="p039Form">' +
        '<div class="p039-date-group">' +
          '<div class="p039-field">' +
            "<label>ตั้งแต่วันที่</label>" +
            '<div class="p039-input-wrap">' + icon("cal") + '<input id="p039DateFrom" type="date">' + "</div>" +
          "</div>" +
          '<div class="p039-field">' +
            "<label>จนถึงวันที่</label>" +
            '<div class="p039-input-wrap">' + icon("cal") + '<input id="p039DateTo" type="date">' + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="p039-mode-section">' +
          "<label>รูปแบบการตรวจสอบ (กดเพื่อค้นหา)</label>" +
          '<div class="p039-mode-grid">' +
            '<button class="p039-mode-button" id="p039ModeProduct" type="button" data-mode="product">' + icon("box") + " ตรวจสอบจากสินค้า</button>" +
            '<button class="p039-mode-button active" id="p039ModeAmount" type="button" data-mode="amount">' + icon("money") + " ตรวจสอบจากยอดเงิน</button>" +
            '<button class="p039-mode-button" id="p039ModeComplete" type="button" data-mode="complete">' + icon("check") + " ตรวจสอบสินค้าส่งครบแต่ค้างส่ง</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
      // panel
      '<section class="p039-panel">' +
        '<div class="p039-panel-header">' +
          '<div class="p039-panel-heading">' +
            '<div class="p039-panel-icon">' + icon("grid") + "</div>" +
            '<div class="p039-panel-title"><h2 id="p039Title">ผลตรวจสอบจากยอดเงิน</h2><p id="p039Subtitle">จำนวน 0 แถว</p></div>' +
          "</div>" +
          '<div class="p039-panel-actions">' +
            '<div class="p039-table-search">' + icon("search") + '<input id="p039Quick" type="search" placeholder="ค้นหาเลขที่, รหัสลูกค้า หรือสินค้า">' +
            "</div>" +
            '<span class="p039-badge" id="p039Badge">0 รายการ</span>' +
          "</div>" +
        "</div>" +
        '<div class="p039-table-container" id="p039TableContainer"><table class="p039-table"><thead><tr>' +
          '<th class="sortable center" data-sort="index">รายการที่</th>' +
          '<th class="sortable" data-sort="document">เลขที่ใบสั่ง</th>' +
          '<th class="sortable center" data-sort="date">วันที่</th>' +
          '<th class="sortable" data-sort="customerCode">รหัสลูกค้า</th>' +
          "<th>ชื่อลูกค้า</th>" +
          '<th class="sortable" data-sort="productCode">รหัสสินค้า</th>' +
          "<th>ชื่อสินค้า</th>" +
          '<th class="sortable number" data-sort="ordered">ยอดที่สั่ง</th>' +
          '<th class="sortable number" data-sort="shipped">ยอดที่ตัด</th>' +
          '<th class="sortable center" data-sort="qtyOrdered">จำนวนที่สั่ง</th>' +
          '<th class="sortable center" data-sort="qtyShipped">จำนวนที่ตัด</th>' +
        "</tr></thead><tbody id=\"p039Rows\">" + emptyRow(11, "กดปุ่มรูปแบบการตรวจสอบเพื่อค้นหา") + "</tbody></table></div>" +
        '<div class="p039-empty-state" id="p039EmptyState"><div>' + icon("search") + "<strong>ไม่พบรายการในช่วงวันทีนี้</strong><p>ลองเปลี่ยนช่วงวันที่ หรือสลับรูปแบบการตรวจสอบ</p></div></div>" +
        '<div class="p039-table-footer">' +
          '<span id="p039FooterText">แสดง 0 รายการ</span>' +
          '<div class="p039-footer-total">ยอดส่วนเกินรวมทั้งหมด <strong id="p039FooterExcess">0.00</strong></div>' +
        "</div>" +
      "</section>" +
      // toast
      '<div class="p039-toast" id="p039Toast"><span id="p039ToastMsg"></span></div>' +
    "</div>";

  /* ---------- mount ---------- */
  function mount(target) {
    root = target;
    var style = document.createElement("style");
    style.textContent = CSS;
    target.appendChild(style);
    target.insertAdjacentHTML("beforeend", HTML);

    el.dateFrom = $("p039DateFrom");
    el.dateTo = $("p039DateTo");
    el.quick = $("p039Quick");
    el.title = $("p039Title");
    el.subtitle = $("p039Subtitle");
    el.badge = $("p039Badge");
    el.rows = $("p039Rows");
    el.tableContainer = $("p039TableContainer");
    el.emptyState = $("p039EmptyState");
    el.footerText = $("p039FooterText");
    el.footerExcess = $("p039FooterExcess");
    el.toast = $("p039Toast");

    // clone C# FrmCheckCutSOGUI_Load — from = Today.AddDays(-90), to = Today
    var today = new Date();
    var from = new Date();
    from.setDate(from.getDate() - 90);
    el.dateFrom.value = isoDate(from);
    el.dateTo.value = isoDate(today);

    document.querySelectorAll(".p039-mode-button").forEach(function (b) {
      b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
    });

    el.quick.addEventListener("input", function () { render(); });

    document.querySelectorAll(".p039-table th.sortable").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-sort");
        if (state.sortField === f) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortField = f;
          state.sortDir = "asc";
        }
        render();
      });
    });

    render();
  }

  window.P039CutSO = { mount: mount };
})();
