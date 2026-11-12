/* P025 — ตรวจสอบบิลเกิน due (real data ผ่าน api/p025_search.php — SQL จาก C# frm_CheckDebtDue.cs)
 * UI copy จาก p024-credit-check.js:
 * - แถบค้นหา: รหัสจังหวัด (2 ตัวเลข) / รหัสพนักงาน / จำนวนวัน + ปุ่มค้นหา (loading)
 * - ตาราง 7 คอลั่น (สอร์ตได้, default sort = รหัสลูกค้า asc) + เลือกแถว + pagination 15/หน้า + toast + Print Preview modal (A4 หลายหน้า)
 * - Search: POST api/p025_search.php {connectionId, province, employee, days} — ไม่ออโตค้นหาเมื่อเปิดหน้า
 */
(function () {
  "use strict";


  /* ---------- CSS (scoped ด้วย .p025-app) ---------- */
  var CSS = [
    ".p025-app{display:block}",
    ".p025-app .p025-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p025-app .p025-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p025-app .p025-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px;white-space:nowrap}",
    ".p025-app .p025-launcher-body{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:18px 20px;background:linear-gradient(180deg,#eefbfd,#e4f9fb)}",
    ".p025-app .p025-form-grid{display:flex;flex:1;gap:14px;flex-wrap:wrap}",
    ".p025-app .p025-field{flex:1;min-width:170px}",
    ".p025-app .p025-field label{display:block;margin-bottom:6px;color:#334155;font-size:12px;font-weight:700}",
    ".p025-app .p025-input-wrap{position:relative}",
    ".p025-app .p025-input-wrap svg{position:absolute;top:50%;left:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p025-app .p025-field input{width:100%;height:42px;padding:0 12px 0 39px;color:#172033;border:1px solid #b6c5d8;border-radius:9px;outline:none;background:#fff;font-size:13px}",
    ".p025-app .p025-field input[type=number]{padding-left:12px;font-weight:700;text-align:right}",
    ".p025-app .p025-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p025-app .p025-field small{display:block;margin-top:4px;color:#64748b;font-size:10px}",
    ".p025-app .p025-action-group{display:flex;align-items:center;gap:12px}",
    ".p025-app .p025-action-button{display:inline-flex;min-width:122px;height:48px;align-items:center;justify-content:center;gap:8px;padding:0 18px;border-radius:10px;font-size:13px;font-weight:700;transition:.16s ease}",
    ".p025-app .p025-action-button svg{width:16px;height:16px;flex:0 0 auto}",
    ".p025-app .p025-action-button.p025-check{color:#fff;border:0;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,.24)}",
    ".p025-app .p025-action-button.p025-print{color:#fff;border:0;white-space:nowrap;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 9px 20px rgba(16,185,129,.24)}",
    ".p025-app .p025-action-button:hover{filter:brightness(.98);transform:translateY(-1px)}",
    ".p025-app .p025-action-button .p025-spinner{display:none;width:14px;height:14px;flex:0 0 auto;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%}",
    ".p025-app .p025-action-button.p025-loading{opacity:.85;pointer-events:none}",
    ".p025-app .p025-action-button.p025-loading .p025-spinner{display:inline-block;animation:p025-spin .8s linear infinite}",
    "@keyframes p025-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
    ".p025-app .p025-panel{display:flex;min-height:420px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p025-app .p025-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p025-app .p025-panel-count{display:flex;align-items:center;padding:8px 15px;background:#f8fafc;border-bottom:1px solid #e2e8f0}",
    ".p025-app .p025-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p025-app .p025-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p025-app .p025-panel-title h2{font-size:14px}",
    ".p025-app .p025-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p025-app .p025-panel-actions{display:flex;align-items:center;gap:10px}",
    ".p025-app .p025-badge{padding:5px 11px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p025-app .p025-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p025-app .p025-pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 15px;background:#f8fafc;border-top:1px solid #e2e8f0}",
    ".p025-app .p025-page-btn{min-width:34px;height:34px;padding:0 10px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#334155;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}",
    ".p025-app .p025-page-btn:hover{border-color:#2563eb;color:#2563eb;background:#eef5ff}",
    ".p025-app .p025-page-btn.p025-active{border-color:#2563eb;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:0 4px 12px rgba(37,99,235,.3)}",
    ".p025-app .p025-page-btn:disabled{opacity:.45;cursor:not-allowed}",
    ".p025-app .p025-page-btn.p025-prev,.p025-app .p025-page-btn.p025-next{font-size:14px}",
    ".p025-app .p025-table-wrap table{width:100%;min-width:920px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p025-app .p025-table-wrap th{position:sticky;top:0;z-index:2;padding:11px 13px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p025-app .p025-table-wrap th.p025-sortable{cursor:pointer}",
    ".p025-app .p025-table-wrap th.p025-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p025-app .p025-table-wrap th.p025-sorted{color:#1d4ed8;background:#e0ecff}",
    ".p025-app .p025-table-wrap td{max-width:340px;overflow:hidden;padding:9px 13px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p025-app .p025-table-wrap th.p025-center,.p025-app .p025-table-wrap td.p025-center{text-align:center}",
    ".p025-app .p025-table-wrap th.p025-number,.p025-app .p025-table-wrap td.p025-number{text-align:right}",
    ".p025-app .p025-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p025-app .p025-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p025-app .p025-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p025-app .p025-table-wrap tbody tr.p025-active td{color:#fff;background:#0878d1}",
    ".p025-app .p025-employee-code,.p025-app .p025-customer-code{color:#1d4ed8;font-weight:700}",
    ".p025-app .p025-amount{color:#047857;font-weight:700}",
    ".p025-app .p025-amount.p025-over{color:#dc2626}",
    ".p025-app .p025-grade{display:inline-flex;min-width:46px;justify-content:center;padding:3px 8px;border-radius:7px;font-size:11px;font-weight:700}",
    ".p025-app .p025-grade.p025-a{color:#047857;background:#d1fae5}",
    ".p025-app .p025-grade.p025-b{color:#1d4ed8;background:#dbeafe}",
    ".p025-app .p025-grade.p025-x{color:#92400e;background:#fef3c7}",
    ".p025-app .p025-table-wrap tbody tr.p025-active .p025-employee-code,.p025-app .p025-table-wrap tbody tr.p025-active .p025-customer-code,.p025-app .p025-table-wrap tbody tr.p025-active .p025-amount,.p025-app .p025-table-wrap tbody tr.p025-active .p025-amount.p025-over{color:#fff}",
    ".p025-app .p025-table-wrap tbody tr.p025-active .p025-grade{color:#fff;background:rgba(255,255,255,.22)}",
    ".p025-app .p025-empty-state{display:none;min-height:260px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p025-app .p025-empty-state.p025-show{display:flex}",
    ".p025-app .p025-empty-state svg{width:48px;height:48px;margin:0 auto 10px}",
    ".p025-app .p025-empty-state strong{font-size:13px}",
    ".p025-app .p025-empty-state p{margin-top:5px;font-size:11px}",
    ".p025-app .p025-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p025-app .p025-total-box{padding:5px 11px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-weight:700}",
    ".p025-app .p025-toast{position:fixed;right:20px;bottom:20px;z-index:50;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p025-app .p025-toast.p025-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p025-app .p025-toast svg{width:20px;height:20px;color:#34d399}",
    ".p025-app .p025-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}",
    ".p025-app .p025-modal-backdrop.p025-show{display:grid}",
    ".p025-app .p025-preview-modal{display:flex;width:min(1080px,100%);height:92vh;max-height:92vh;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
    ".p025-app .p025-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p025-app .p025-modal-header h3{font-size:15px}",
    ".p025-app .p025-modal-close{width:30px;height:30px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px}",
    ".p025-app .p025-preview-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-bottom:1px solid #dbe3ef;background:#f8fafc}",
    ".p025-app .p025-preview-toolbar>span{color:#64748b;font-size:12px}",
    ".p025-app .p025-toolbar-right{display:flex;align-items:center;gap:12px}",
    ".p025-app .p025-zoom-control{display:inline-flex;align-items:center;gap:6px}",
    ".p025-app .p025-zoom-btn{display:inline-flex;width:28px;height:28px;align-items:center;justify-content:center;color:#1e293b;border:1px solid #dbe3ef;border-radius:7px;background:#fff;font-size:16px;font-weight:700;cursor:pointer}",
    ".p025-app .p025-zoom-btn:hover{background:#f8fafc}",
    ".p025-app .p025-zoom-label{min-width:44px;color:#64748b;font-size:12px;text-align:center}",
    ".p025-app .p025-print-now{display:inline-flex;height:35px;align-items:center;gap:7px;padding:0 13px;color:#fff;border:0;border-radius:8px;background:#2563eb;font-size:12px;font-weight:700}",
    ".p025-app .p025-preview-area{flex:1;min-height:0;overflow:auto;padding:24px;background:#e2e8f0}",
    ".p025-app .p025-paper{width:794px;min-height:1123px;margin:0 auto;padding:34px 38px;background:#fff;box-shadow:0 16px 35px rgba(15,23,42,.25)}",
    ".p025-app .p025-paper,.p025-app .p025-paper *{font-family:'THSarabunNew','Noto Sans Thai',Tahoma,sans-serif !important}",
    ".p025-app .p025-paper h1{color:#1e3a8a;font-size:20pt;font-weight:700;text-align:center}",
    ".p025-app .p025-paper .p025-meta{margin:8px 0 14px;color:#64748b;font-size:12pt;text-align:left}",
    ".p025-app .p025-paper table{width:100%;table-layout:fixed;border-collapse:collapse}",
    ".p025-app .p025-paper th,.p025-app .p025-paper td{padding:3px 9px;color:#172033;border:1px solid #cbd5e1}",
    ".p025-app .p025-paper th{color:#1e3a8a;background:#eff6ff;font-size:12pt;font-weight:700}",
    ".p025-app .p025-paper td{font-size:12pt}",
    ".p025-app .p025-paper td.p025-num{text-align:right}",
    ".p025-app .p025-page-no{margin-top:14px;color:#64748b;font-size:11pt;text-align:left}",
    ".p025-app .p025-paper + .p025-paper{margin-top:24px}",
    "@media print{",
    "  @page{size:A4;margin:10mm}",
    "  body *{visibility:hidden}",
    "  .p025-app .p025-preview-modal,.p025-app .p025-preview-modal *{visibility:visible}",
    "  .p025-app .p025-preview-modal{position:static;width:auto;max-width:none;height:auto;padding:0;border:0;border-radius:0;background:#fff;box-shadow:none}",
    "  .p025-app .p025-modal-header,.p025-app .p025-preview-toolbar{display:none !important}",
    "  .p025-app .p025-preview-area{display:block;padding:0;overflow:visible;background:#fff}",
    "  .p025-app .p025-paper{width:auto;min-height:0;margin:0;padding:0;box-shadow:none;page-break-after:always}",
    "  .p025-app .p025-paper:last-child{page-break-after:auto}",
    "}",
    "@media (max-width:850px){",
    "  .p025-app .p025-field{min-width:100%}",
    "  .p025-app .p025-action-group{justify-content:stretch}",
    "  .p025-app .p025-action-button{flex:1}",
    "}",
    "@media (max-width:680px){",
    "  .p025-app .p025-field{min-width:100%}",
    "  .p025-app .p025-panel-header,.p025-app .p025-panel-footer{align-items:flex-start;flex-direction:column}",
    "}"
  ].join("\n");

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }

  var moneyFormatter = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function formatMoney(v) { return moneyFormatter.format(Number(v || 0)); }

  var ICONS = {
    clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 8v4l3 2"></path>',
    pin: '<path d="M12 21s7-5.33 7-12A7 7 0 0 0 5 9c0 6.67 7 12 7 12z"></path><circle cx="12" cy="9" r="2"></circle>',
    user: '<circle cx="12" cy="7" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
    search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
    print: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect>',
    users: '<circle cx="9" cy="7" r="4"></circle><path d="M2 21a7 7 0 0 1 14 0"></path>',
    baht: '<path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    warning: '<path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>',
    grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
    searchempty: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  function svgAttrs() { return 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'; }

  var PAGE_SIZE = 15;
  var state = { items: [], currentId: null, sortField: "customerCode", sortDirection: "asc", toastTimer: null, page: 1 };
  var els = {};

  function sortItems(items) {
    var arr = items.slice();
    arr.sort(function (a, b) {
      var first = a[state.sortField];
      var second = b[state.sortField];
      if (typeof first === "string") {
        first = first.toLocaleLowerCase("th");
        second = second.toLocaleLowerCase("th");
      }
      if (first < second) return state.sortDirection === "asc" ? -1 : 1;
      if (first > second) return state.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }

  function updateSortIndicators() {
    var headers = els.app.querySelectorAll("th[data-sort]");
    for (var i = 0; i < headers.length; i++) {
      var isActive = headers[i].getAttribute("data-sort") === state.sortField;
      if (isActive) {
        headers[i].classList.add("p025-sorted");
        var arrow = headers[i].querySelector(".p025-arrow");
        if (arrow) arrow.textContent = state.sortDirection === "asc" ? "▲" : "▼";
      } else {
        headers[i].classList.remove("p025-sorted");
        var arrow2 = headers[i].querySelector(".p025-arrow");
        if (arrow2) arrow2.textContent = "";
      }
    }
  }

  function updateSummary(items) {
    var total = 0;
    for (var i = 0; i < items.length; i++) total += items[i].totalAmount;
    els.resultBadge.textContent = items.length + " รายการ";
    els.footerText.textContent = "แสดง " + items.length + " รายการ";
    els.footerTotal.textContent = "฿" + formatMoney(total);
  }

  function renderRows(days) {
    var sorted = sortItems(state.items);
    els.rows.innerHTML = "";
    updateSortIndicators();
    updateSummary(sorted);

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.empty.classList.add("p025-show");
      if (els.pagination) els.pagination.innerHTML = "";
      return;
    }
    els.tableWrap.style.display = "block";
    els.empty.classList.remove("p025-show");

    var found = false;
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].id === state.currentId) { found = true; break; }
    }
    if (!found) state.currentId = sorted[0].id;

    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(start, start + PAGE_SIZE);
    for (var j = 0; j < pageItems.length; j++) {
      var item = pageItems[j];
      var row = document.createElement("tr");
      row.setAttribute("data-id", item.id);
      if (item.id === state.currentId) row.classList.add("p025-active");

      var gradeCls = "p025-" + String(item.grade).toLowerCase();
      row.innerHTML =
        '<td class="p025-employee-code">' + esc(item.employeeCode) + "</td>" +
        '<td class="p025-customer-code">' + esc(item.customerCode) + "</td>" +
        '<td title="' + esc(item.customer) + '">' + esc(item.customer) + "</td>" +
        '<td class="p025-center"><span class="p025-grade ' + gradeCls + '">' + esc(item.grade) + "</span></td>" +
        "<td>" + esc(item.billDate) + "</td>" +
        "<td>" + esc(item.billNo) + "</td>" +
        '<td class="p025-number p025-amount">' + formatMoney(item.totalAmount) + "</td>";
      els.rows.appendChild(row);
    }
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!els.pagination) return;
    if (!totalPages || totalPages <= 0) { els.pagination.innerHTML = ""; return; }
    var WIN = 5;
    var start, end;
    if (totalPages <= WIN) {
      start = 1;
      end = totalPages;
    } else {
      start = state.page - 2;
      if (start < 1) start = 1;
      end = start + WIN - 1;
      if (end > totalPages) { end = totalPages; start = totalPages - WIN + 1; }
      if (start < 1) start = 1;
    }
    var html = "";
    html += '<button class="p025-page-btn p025-prev" data-page="' + (state.page - 1) + '"' + (state.page <= 1 ? " disabled" : "") + ">>&#8249;</button>";
    for (var p = start; p <= end; p++) {
      html += '<button class="p025-page-btn' + (p === state.page ? " p025-active" : "") + '" data-page="' + p + '">' + p + "</button>";
    }
    html += '<button class="p025-page-btn p025-next" data-page="' + (state.page + 1) + '"' + (state.page >= totalPages ? " disabled" : "") + ">>&#8250;</button>";
    els.pagination.innerHTML = html;
  }

  function showToast(message) {
    els.toastMessage.textContent = message;
    clearTimeout(state.toastTimer);
    els.toast.classList.add("p025-show");
    state.toastTimer = setTimeout(function () { els.toast.classList.remove("p025-show"); }, 1900);
  }

  function applyFilters(showMessage) {
    var province = els.provinceCode.value.trim();
    var employee = els.employeeCode.value.trim();
    var days = Number(els.dueDays.value || 0);
    state.page = 1;

    els.panelSubtitle.textContent = "จำนวนวันตั้งแต่ " + days + " วันขึ้นไป";

    els.searchButton.classList.add("p025-loading");
    els.searchButton.disabled = true;

    fetch("api/p025_search.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: "c1788406814359",
        province: province,
        employee: employee,
        days: days
      })
    }).then(function (resp) { return resp.json(); })
    .then(function (data) {
      els.searchButton.classList.remove("p025-loading");
      els.searchButton.disabled = false;
      if (!data.ok) {
        showToast(data.error || "ค้นหาไม่สำเร็จ");
        return;
      }
      state.items = (data.rows || []).map(function (row, i) {
        var cusID = String(row.cusID || "");
        return {
          id: i + 1,
          province: cusID.substring(0, 2),
          employeeCode: row.salesP,
          customerCode: cusID,
          customer: row.cusNameT,
          grade: row.grade,
          billDate: row.billDate,
          billNo: row.billNo,
          totalAmount: Number(row.amount) || 0
        };
      });
      renderRows(days);
      if (showMessage) {
        showToast("พบข้อมูล " + state.items.length + " รายการ");
      }
    })
    .catch(function (err) {
      els.searchButton.classList.remove("p025-loading");
      els.searchButton.disabled = false;
      showToast("ค้นหาไม่สำเร็จ: " + (err && err.message ? err.message : String(err)));
    });
  }

  var zoomLevel = 1;
  function setZoom(level) {
    zoomLevel = Math.min(2, Math.max(0.5, level));
    var papers = els.previewArea.querySelectorAll(".p025-paper");
    for (var i = 0; i < papers.length; i++) papers[i].style.zoom = String(zoomLevel);
    els.zoomLabel.textContent = Math.round(zoomLevel * 100) + "%";
  }
  function zoomIn() { setZoom(zoomLevel + 0.1); }
  function zoomOut() { setZoom(zoomLevel - 0.1); }

  function openPrintPreview() {
    if (!state.items.length) {
      showToast("No data to print");
      return;
    }
    var list = sortItems(state.items);
    var work = function () {
    var now = new Date();
    function p2(n) { return (n < 10 ? "0" : "") + n; }
    var stamp = now.getFullYear() + "/" + p2(now.getMonth() + 1) + "/" + p2(now.getDate()) +
      " " + p2(now.getHours()) + ":" + p2(now.getMinutes()) + ":" + p2(now.getSeconds());

    var days = Number(els.dueDays.value || 0);
    function paperHead(s) {
      return "<h1>รายงานตรวจสอบบิลเกิน due ( " + days + " วัน )</h1>" +
        '<div class="p025-meta">พิมพ์โดย : P025 Web   พิมพ์เมื่อ : ' + s + "</div>";
    }
    function paperTableOpen() {
      return "<table><colgroup>" +
        '<col style="width:9.66%"><col style="width:11.03%"><col style="width:42.07%"><col style="width:11.72%"><col style="width:14.48%"><col style="width:11.03%">' +
        "</colgroup><thead><tr>" +
        "<th>รหัสพนักงาน</th><th>รหัสลูกหนี้</th><th>ชื่อลูกค้า (เกรด)</th><th>วันที่บิล</th><th>เลขที่ Invoice</th><th>ยอดหนี้</th>" +
        "</tr></thead><tbody>";
    }
    function rowHtml(it) {
      return "<tr>" +
        "<td>" + esc(it.employeeCode) + "</td>" +
        "<td>" + esc(it.customerCode) + "</td>" +
        "<td>" + esc(it.customer) + " (" + esc(it.grade) + ")</td>" +
        "<td>" + esc(it.billDate) + "</td>" +
        "<td>" + esc(it.billNo) + "</td>" +
        '<td class="p025-num">' + formatMoney(it.totalAmount) + "</td>" +
        "</tr>";
    }

    // 1a) Measure the FIXED content height (h1 + meta + thead + page-no, including margins)
    //      Render an EMPTY paper with min-height disabled to get its natural height
    els.previewArea.innerHTML =
      '<div class="p025-paper">' + paperHead(stamp) + paperTableOpen() + "</tbody></table>" +
      '<div class="p025-page-no">หน้า 1</div></div>';
    els.modal.classList.add("p025-show");
    var mp = els.previewArea.querySelector(".p025-paper");
    if (mp) mp.style.minHeight = "0";
    var naturalH = mp ? mp.getBoundingClientRect().height : 0;
    var PAPER_CONTENT_H = 1055; // A4 portrait 1123px - padding 68px
    var fixedContentH = naturalH - 68; // natural content height (incl. margins)
    var contentBudget = PAPER_CONTENT_H - fixedContentH;

    // 1b) Render all rows on one paper and measure EVERY row height
    var allHtml = "";
    for (var ai = 0; ai < list.length; ai++) allHtml += rowHtml(list[ai]);
    els.previewArea.innerHTML =
      '<div class="p025-paper">' + paperHead(stamp) + paperTableOpen() + allHtml + "</tbody></table>" +
      '<div class="p025-page-no">หน้า 1</div></div>';
    var mp2 = els.previewArea.querySelector(".p025-paper");
    var mrows = mp2 ? mp2.querySelectorAll("tbody tr") : [];
    var rowHeights = [];
    for (var mi = 0; mi < mrows.length; mi++) rowHeights.push(mrows[mi].getBoundingClientRect().height);

    // 2) Fill each page to the budget — no leftover space
    var pages = [];
    var pageStart = [];
    var cur = [];
    var curH = 0;
    var pageStartIdx = 0;
    for (var i = 0; i < list.length; i++) {
      var h = rowHeights[i];
      if (cur.length > 0 && curH + h > contentBudget) {
        pages.push(cur);
        pageStart.push(pageStartIdx);
        cur = [];
        curH = 0;
        pageStartIdx = i;
      }
      cur.push(list[i]);
      curH += h;
    }
    if (cur.length) {
      pages.push(cur);
      pageStart.push(pageStartIdx);
    }

    // Last page must keep room for the "รวม" row
    var lastPage = pages[pages.length - 1];
    var lastStart = pageStart[pageStart.length - 1];
    var origLen = lastPage.length;
    var lastEnd = lastStart + origLen;
    var lastH = 0;
    for (var k = lastStart; k < lastEnd; k++) lastH += rowHeights[k];
    var TOTAL_ROW_H = 32; // "รวม" row ≈ one data row height
    while (lastH + TOTAL_ROW_H > contentBudget && lastPage.length > 1) {
      lastPage.pop();
      lastH -= rowHeights[lastEnd - 1];
      lastEnd--;
    }
    if (lastPage.length < origLen) {
      pages.push(list.slice(lastEnd));
      pageStart.push(lastEnd);
    }

    // 3) Render each page
    var pageCount = pages.length;
    var html = "";
    for (var p = 0; p < pageCount; p++) {
      var chunk = pages[p];
      var rowsHtml = "";
      for (var r = 0; r < chunk.length; r++) rowsHtml += rowHtml(chunk[r]);
      html += '<div class="p025-paper">' + paperHead(stamp) + paperTableOpen() + rowsHtml + "</tbody></table>" +
        '<div class="p025-page-no">หน้า ' + (p + 1) + "</div></div>";
    }
    els.previewArea.innerHTML = html;

    // แถว "รวม" (C# bgWorker_DoWork) — ผลรวมยอดหนี้ ท้ายกระดาษสุดท้าย
    var totalMoney = 0;
    for (var ti = 0; ti < list.length; ti++) totalMoney += list[ti].totalAmount;
    var allPapers = els.previewArea.querySelectorAll(".p025-paper");
    var lastPaper = allPapers[allPapers.length - 1];
    var lastTbody = lastPaper ? lastPaper.querySelector("tbody") : null;
    if (lastTbody) {
      var totalRow = document.createElement("tr");
      totalRow.innerHTML =
        '<td colspan="5" style="text-align:right;font-weight:bold">รวม</td>' +
        '<td class="p025-num">' + formatMoney(totalMoney) + "</td>";
      lastTbody.appendChild(totalRow);
    }

    els.previewText.textContent = list.length + " items · " + pageCount + " pages";
    setZoom(1);
    };
    if (document.fonts && document.fonts.load) {
      document.fonts.load("12px 'THSarabunNew'").then(work, work);
    } else {
      work();
    }
  }

  function closePrintPreview() {
    els.modal.classList.remove("p025-show");
  }

  /* ---------- build DOM ---------- */
  function build(root) {
    root.innerHTML =
      '<div class="p025-app">' +
        '<section class="p025-launcher">' +
          '<div class="p025-launcher-title"><strong>' + icon("clock") + " ตรวจสอบบิลเกิน due</strong></div>" +
          '<form class="p025-launcher-body" id="p025FilterForm">' +
            '<div class="p025-form-grid">' +
              '<div class="p025-field">' +
                '<label for="p025ProvinceCode">รหัสจังหวัด (2 ตัวเลข)</label>' +
                '<div class="p025-input-wrap">' +
                  '<svg ' + svgAttrs() + '>' + ICONS.pin + '</svg>' +
                  '<input id="p025ProvinceCode" type="text" maxlength="2" inputmode="numeric" placeholder="เช่น 10">' +
                '</div>' +
                '<small>เว้นว่างเพื่อแสดงทุกจังหวัด</small>' +
              '</div>' +
              '<div class="p025-field">' +
                '<label for="p025EmployeeCode">รหัสพนักงาน</label>' +
                '<div class="p025-input-wrap">' +
                  '<svg ' + svgAttrs() + '>' + ICONS.user + '</svg>' +
                  '<input id="p025EmployeeCode" type="text" placeholder="เช่น S30" autocomplete="off">' +
                '</div>' +
              '</div>' +
              '<div class="p025-field">' +
                '<label for="p025DueDays">จำนวนวัน</label>' +
                '<input id="p025DueDays" type="number" min="0" step="1" value="65">' +
                '<small>แสดงบิลที่ล่วงวันมากกว่าหรือเท่ากับจำนวนวันนี้</small>' +
              '</div>' +
            '</div>' +
            '<div class="p025-action-group">' +
              '<button class="p025-action-button p025-check" id="p025SearchButton" type="submit">' + icon("search") + " ค้นหา" + '<span class="p025-spinner"></span>' + '</button>' +
            '</div>' +
          '</form>' +
        '</section>' +
        '<section class="p025-panel">' +
          '<div class="p025-panel-header">' +
            '<div class="p025-panel-heading">' +
              '<div class="p025-panel-icon">' + icon("grid") + '</div>' +
              '<div class="p025-panel-title"><h2>รายการตรวจสอบบิลเกิน due</h2><p id="p025PanelSubtitle">ระบุเงื่อนไขด้านบน แล้วกดปุ่มค้นหา</p></div>' +
            '</div>' +
            '<div class="p025-panel-actions">' +
              '<button class="p025-action-button p025-print" id="p025PrintButton" type="button">' + icon("eye") + " Print Preview</button>" +
            '</div>' +
          '</div>' +
          '<div class="p025-panel-count">' +
            '<span class="p025-badge" id="p025ResultBadge">0 รายการ</span>' +
          '</div>' +
          '<div class="p025-table-wrap" id="p025TableWrap">' +
            '<table>' +
              '<thead><tr>' +
                '<th class="p025-sortable" data-sort="employeeCode">รหัสพนักงาน <span class="p025-arrow"></span></th>' +
                '<th class="p025-sortable" data-sort="customerCode">รหัสลูกค้า <span class="p025-arrow"></span></th>' +
                '<th class="p025-sortable" data-sort="customer">ชื่อลูกค้า <span class="p025-arrow"></span></th>' +
                '<th class="p025-sortable p025-center" data-sort="grade">เกรด <span class="p025-arrow"></span></th>' +
                '<th class="p025-sortable" data-sort="billDate">วันที่บิล <span class="p025-arrow"></span></th>' +
                '<th class="p025-sortable" data-sort="billNo">เลขที่บิล <span class="p025-arrow"></span></th>' +
                '<th class="p025-sortable p025-number" data-sort="totalAmount">ยอดหนี้ <span class="p025-arrow"></span></th>' +
              '</tr></thead>' +
              '<tbody id="p025Rows"></tbody>' +
            '</table>' +
          '</div>' +
          '<div class="p025-pagination" id="p025Pagination"></div>' +
          '<div class="p025-empty-state" id="p025EmptyState">' +
            '<div>' +
              '<svg ' + svgAttrs() + ' style="width:48px;height:48px;margin:0 auto 10px">' + ICONS.searchempty + '</svg>' +
              '<strong>ไม่พบข้อมูลตามเงื่อนไขที่เลือก</strong>' +
              '<p>ลองปรับจำนวนวัน รหัสจังหวัด หรือรหัสพนักงาน</p>' +
            '</div>' +
          '</div>' +
          '<div class="p025-panel-footer">' +
            '<span id="p025FooterText">แสดง 0 รายการ</span>' +
            '<span class="p025-total-box" id="p025FooterTotal">฿0.00</span>' +
          '</div>' +
        '</section>' +
        '<div class="p025-toast" id="p025Toast">' +
          '<svg ' + svgAttrs() + '>' + ICONS.check + '</svg>' +
          '<span id="p025ToastMessage">ดำเนินการเรียบร้อยแล้ว</span>' +
        '</div>' +
        '<div class="p025-modal-backdrop" id="p025Modal">' +
          '<section class="p025-preview-modal" role="dialog" aria-modal="true">' +
            '<div class="p025-modal-header">' +
              '<h3>Print Preview - ตรวจสอบบิลเกิน due</h3>' +
              '<button class="p025-modal-close" id="p025ModalClose" type="button">×</button>' +
            '</div>' +
            '<div class="p025-preview-toolbar">' +
              '<span id="p025PreviewText">0 รายการ</span>' +
              '<div class="p025-toolbar-right">' +
                '<div class="p025-zoom-control">' +
                  '<button class="p025-zoom-btn" id="p025ZoomOut" type="button" title="ย่อ">−</button>' +
                  '<span class="p025-zoom-label" id="p025ZoomLabel">100%</span>' +
                  '<button class="p025-zoom-btn" id="p025ZoomIn" type="button" title="ขยาย">+</button>' +
                '</div>' +
                '<button class="p025-print-now" id="p025PrintNow" type="button">' + icon("print") + ' พิมพ์รายงาน</button>' +
              '</div>' +
            '</div>' +
            '<div class="p025-preview-area" id="p025PreviewArea"></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    var app = root.querySelector(".p025-app");
    els.app = app;
    els.filterForm = root.querySelector("#p025FilterForm");
    els.provinceCode = root.querySelector("#p025ProvinceCode");
    els.employeeCode = root.querySelector("#p025EmployeeCode");
    els.dueDays = root.querySelector("#p025DueDays");
    els.printButton = root.querySelector("#p025PrintButton");
    els.searchButton = root.querySelector("#p025SearchButton");
    els.resultBadge = root.querySelector("#p025ResultBadge");
    els.panelSubtitle = root.querySelector("#p025PanelSubtitle");
    els.tableWrap = root.querySelector("#p025TableWrap");
    els.rows = root.querySelector("#p025Rows");
    els.empty = root.querySelector("#p025EmptyState");
    els.footerText = root.querySelector("#p025FooterText");
    els.footerTotal = root.querySelector("#p025FooterTotal");
    els.toast = root.querySelector("#p025Toast");
    els.toastMessage = root.querySelector("#p025ToastMessage");
    els.modal = root.querySelector("#p025Modal");
    els.modalClose = root.querySelector("#p025ModalClose");
    els.previewArea = root.querySelector("#p025PreviewArea");
    els.previewText = root.querySelector("#p025PreviewText");
    els.zoomIn = root.querySelector("#p025ZoomIn");
    els.zoomOut = root.querySelector("#p025ZoomOut");
    els.zoomLabel = root.querySelector("#p025ZoomLabel");
    els.printNow = root.querySelector("#p025PrintNow");
    els.pagination = root.querySelector("#p025Pagination");

    /* events */
    els.filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      applyFilters(true);
    });

    els.provinceCode.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 2);
    });

    els.rows.addEventListener("click", function (e) {
      var row = e.target.closest("tr");
      if (!row) return;
      state.currentId = Number(row.getAttribute("data-id"));
      renderRows(Number(els.dueDays.value || 0));
    });

    var headers = app.querySelectorAll("th[data-sort]");
    for (var i = 0; i < headers.length; i++) {
      (function (header) {
        header.addEventListener("click", function () {
          var field = header.getAttribute("data-sort");
          if (state.sortField === field) {
            state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
          } else {
            state.sortField = field;
            state.sortDirection = "asc";
          }
          renderRows(Number(els.dueDays.value || 0));
        });
      })(headers[i]);
    }

    els.pagination.addEventListener("click", function (e) {
      var btn = e.target.closest("button.p025-page-btn");
      if (!btn || btn.disabled) return;
      var p = Number(btn.getAttribute("data-page"));
      if (!p || p < 1) return;
      state.page = p;
      renderRows(Number(els.dueDays.value || 0));
    });

    els.printButton.addEventListener("click", openPrintPreview);
    els.modalClose.addEventListener("click", closePrintPreview);
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closePrintPreview();
    });
    els.zoomIn.addEventListener("click", zoomIn);
    els.zoomOut.addEventListener("click", zoomOut);
    els.printNow.addEventListener("click", function () { window.print(); });
  }

  function injectStyle() {
    if (document.getElementById("p025Style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "p025Style";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  window.P025DueBillCheck = {
    mount: function (root) {
      injectStyle();
      build(root);
    }
  };
})();
