/* P024 — ตรวจสอบวงเงินลูกคIา (UI only — ยังไม่ต่อ API/DB)
 * UI ตาม demo/P024-demo.html:
 * - แถบค้นหา: รหัสจังหวัด (2 ตัวเลข) / รหัสพนักงาน / มูลค่ารวม + ปุ่มตรวจสอบ/พิมพ์
 * - 4 กาดรวม: จำนวนลูกค้าที่พบ / ยอดขายรวมทั้งหมด / เกินมูลค่าที่กำหนด / ยอดสูงสุด
 * - ตาราง 6 คอลั่น (สอร์ตได้) + เลือกแถว + empty state + footer + toast + print area
 */
(function () {
  "use strict";

  /* ---------- Mock data (UI only — ตาม demo) ---------- */
  var CUSTOMER_RECORDS = [
    { id: 1, province: "10", employeeCode: "ADS901", customerCode: "10270-006", customer: "ท เจริญชัย บจก.", grade: "A", maxAmount: 100000, totalAmount: 182450 },
    { id: 2, province: "10", employeeCode: "ADS901", customerCode: "10360-017", customer: "สหชัยพาณิชย์", grade: "B", maxAmount: 100000, totalAmount: 124800 },
    { id: 3, province: "73", employeeCode: "ADS902", customerCode: "73170-009", customer: "ธนทรัพย์", grade: "A", maxAmount: 150000, totalAmount: 196720 },
    { id: 4, province: "74", employeeCode: "DIV2.TEL2", customerCode: "74110-129", customer: "พร้อมอุดม (LM)", grade: "X", maxAmount: 100000, totalAmount: 105450 },
    { id: 5, province: "63", employeeCode: "ADS901", customerCode: "63110-041", customer: "สุริยาการเกษตร", grade: "B", maxAmount: 200000, totalAmount: 86400 },
    { id: 6, province: "30", employeeCode: "DIV2.TEL2", customerCode: "30270-024", customer: "คิริโยคอากรณ์", grade: "A", maxAmount: 120000, totalAmount: 173220 }
  ];

  /* ---------- CSS (scoped ด้วย .p024-app) ---------- */
  var CSS = [
    ".p024-app{display:block}",
    ".p024-app .p024-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p024-app .p024-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p024-app .p024-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px;white-space:nowrap}",
    ".p024-app .p024-launcher-body{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:18px 20px;background:linear-gradient(180deg,#eefbfd,#e4f9fb)}",
    ".p024-app .p024-form-grid{display:flex;flex:1;gap:14px;flex-wrap:wrap}",
    ".p024-app .p024-field{flex:1;min-width:170px}",
    ".p024-app .p024-field label{display:block;margin-bottom:6px;color:#334155;font-size:12px;font-weight:700}",
    ".p024-app .p024-input-wrap{position:relative}",
    ".p024-app .p024-input-wrap svg{position:absolute;top:50%;left:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p024-app .p024-field input{width:100%;height:42px;padding:0 12px 0 39px;color:#172033;border:1px solid #b6c5d8;border-radius:9px;outline:none;background:#fff;font-size:13px}",
    ".p024-app .p024-field input[type=number]{padding-left:12px;font-weight:700;text-align:right}",
    ".p024-app .p024-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p024-app .p024-field small{display:block;margin-top:4px;color:#64748b;font-size:10px}",
    ".p024-app .p024-action-group{display:flex;align-items:center;gap:12px}",
    ".p024-app .p024-action-button{display:inline-flex;min-width:122px;height:48px;align-items:center;justify-content:center;gap:8px;padding:0 18px;border-radius:10px;font-size:13px;font-weight:700;transition:.16s ease}",
    ".p024-app .p024-action-button svg{width:16px;height:16px;flex:0 0 auto}",
    ".p024-app .p024-action-button.p024-check{color:#fff;border:0;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,.24)}",
    ".p024-app .p024-action-button.p024-print{color:#fff;border:0;white-space:nowrap;background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 9px 20px rgba(16,185,129,.24)}",
    ".p024-app .p024-action-button:hover{filter:brightness(.98);transform:translateY(-1px)}",
    ".p024-app .p024-action-button .p024-spinner{display:none;width:14px;height:14px;flex:0 0 auto;border:2px solid rgba(255,255,255,.45);border-top-color:#fff;border-radius:50%}",
    ".p024-app .p024-action-button.p024-loading{opacity:.85;pointer-events:none}",
    ".p024-app .p024-action-button.p024-loading .p024-spinner{display:inline-block;animation:p024-spin .8s linear infinite}",
    "@keyframes p024-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}",
    ".p024-app .p024-panel{display:flex;min-height:420px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p024-app .p024-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p024-app .p024-panel-count{display:flex;align-items:center;padding:8px 15px;background:#f8fafc;border-bottom:1px solid #e2e8f0}",
    ".p024-app .p024-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p024-app .p024-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p024-app .p024-panel-title h2{font-size:14px}",
    ".p024-app .p024-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p024-app .p024-panel-actions{display:flex;align-items:center;gap:10px}",
    ".p024-app .p024-badge{padding:5px 11px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p024-app .p024-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p024-app .p024-pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 15px;background:#f8fafc;border-top:1px solid #e2e8f0}",
    ".p024-app .p024-page-btn{min-width:34px;height:34px;padding:0 10px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#334155;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s}",
    ".p024-app .p024-page-btn:hover{border-color:#2563eb;color:#2563eb;background:#eef5ff}",
    ".p024-app .p024-page-btn.p024-active{border-color:#2563eb;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:0 4px 12px rgba(37,99,235,.3)}",
    ".p024-app .p024-page-btn:disabled{opacity:.45;cursor:not-allowed}",
    ".p024-app .p024-page-btn.p024-prev,.p024-app .p024-page-btn.p024-next{font-size:14px}",
    ".p024-app .p024-table-wrap table{width:100%;min-width:920px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p024-app .p024-table-wrap th{position:sticky;top:0;z-index:2;padding:11px 13px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p024-app .p024-table-wrap th.p024-sortable{cursor:pointer}",
    ".p024-app .p024-table-wrap th.p024-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p024-app .p024-table-wrap th.p024-sorted{color:#1d4ed8;background:#e0ecff}",
    ".p024-app .p024-table-wrap td{max-width:340px;overflow:hidden;padding:9px 13px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p024-app .p024-table-wrap th.p024-center,.p024-app .p024-table-wrap td.p024-center{text-align:center}",
    ".p024-app .p024-table-wrap th.p024-number,.p024-app .p024-table-wrap td.p024-number{text-align:right}",
    ".p024-app .p024-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p024-app .p024-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p024-app .p024-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p024-app .p024-table-wrap tbody tr.p024-active td{color:#fff;background:#0878d1}",
    ".p024-app .p024-employee-code,.p024-app .p024-customer-code{color:#1d4ed8;font-weight:700}",
    ".p024-app .p024-amount{color:#047857;font-weight:700}",
    ".p024-app .p024-amount.p024-over{color:#dc2626}",
    ".p024-app .p024-grade{display:inline-flex;min-width:46px;justify-content:center;padding:3px 8px;border-radius:7px;font-size:11px;font-weight:700}",
    ".p024-app .p024-grade.p024-a{color:#047857;background:#d1fae5}",
    ".p024-app .p024-grade.p024-b{color:#1d4ed8;background:#dbeafe}",
    ".p024-app .p024-grade.p024-x{color:#92400e;background:#fef3c7}",
    ".p024-app .p024-table-wrap tbody tr.p024-active .p024-employee-code,.p024-app .p024-table-wrap tbody tr.p024-active .p024-customer-code,.p024-app .p024-table-wrap tbody tr.p024-active .p024-amount,.p024-app .p024-table-wrap tbody tr.p024-active .p024-amount.p024-over{color:#fff}",
    ".p024-app .p024-table-wrap tbody tr.p024-active .p024-grade{color:#fff;background:rgba(255,255,255,.22)}",
    ".p024-app .p024-empty-state{display:none;min-height:260px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p024-app .p024-empty-state.p024-show{display:flex}",
    ".p024-app .p024-empty-state svg{width:48px;height:48px;margin:0 auto 10px}",
    ".p024-app .p024-empty-state strong{font-size:13px}",
    ".p024-app .p024-empty-state p{margin-top:5px;font-size:11px}",
    ".p024-app .p024-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p024-app .p024-total-box{padding:5px 11px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-weight:700}",
    ".p024-app .p024-toast{position:fixed;right:20px;bottom:20px;z-index:50;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p024-app .p024-toast.p024-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p024-app .p024-toast svg{width:20px;height:20px;color:#34d399}",
    ".p024-app .p024-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}",
    ".p024-app .p024-modal-backdrop.p024-show{display:grid}",
    ".p024-app .p024-preview-modal{display:flex;width:min(1080px,100%);height:92vh;max-height:92vh;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
    ".p024-app .p024-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p024-app .p024-modal-header h3{font-size:15px}",
    ".p024-app .p024-modal-close{width:30px;height:30px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px}",
    ".p024-app .p024-preview-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px;border-bottom:1px solid #dbe3ef;background:#f8fafc}",
    ".p024-app .p024-preview-toolbar>span{color:#64748b;font-size:12px}",
    ".p024-app .p024-toolbar-right{display:flex;align-items:center;gap:12px}",
    ".p024-app .p024-zoom-control{display:inline-flex;align-items:center;gap:6px}",
    ".p024-app .p024-zoom-btn{display:inline-flex;width:28px;height:28px;align-items:center;justify-content:center;color:#1e293b;border:1px solid #dbe3ef;border-radius:7px;background:#fff;font-size:16px;font-weight:700;cursor:pointer}",
    ".p024-app .p024-zoom-btn:hover{background:#f8fafc}",
    ".p024-app .p024-zoom-label{min-width:44px;color:#64748b;font-size:12px;text-align:center}",
    ".p024-app .p024-print-now{display:inline-flex;height:35px;align-items:center;gap:7px;padding:0 13px;color:#fff;border:0;border-radius:8px;background:#2563eb;font-size:12px;font-weight:700}",
    ".p024-app .p024-preview-area{flex:1;min-height:0;overflow:auto;padding:24px;background:#e2e8f0}",
    ".p024-app .p024-paper{width:794px;min-height:1123px;margin:0 auto;padding:34px 38px;background:#fff;box-shadow:0 16px 35px rgba(15,23,42,.25)}",
    ".p024-app .p024-paper h1{color:#1e3a8a;font-size:20px;text-align:center}",
    ".p024-app .p024-paper .p024-meta{margin:8px 0 14px;color:#64748b;font-size:11px;text-align:left}",
    ".p024-app .p024-paper table{width:100%;border-collapse:collapse}",
    ".p024-app .p024-paper th,.p024-app .p024-paper td{padding:7px 9px;color:#172033;border:1px solid #cbd5e1;font-size:11px}",
    ".p024-app .p024-paper th{color:#1e3a8a;background:#eff6ff}",
    ".p024-app .p024-paper td.p024-num{text-align:right;font-family:Arial,sans-serif}",
    ".p024-app .p024-page-no{margin-top:14px;color:#64748b;font-size:11px;text-align:left}",
    ".p024-app .p024-paper + .p024-paper{margin-top:24px}",
    "@media print{",
    "  @page{size:A4;margin:10mm}",
    "  body *{visibility:hidden}",
    "  .p024-app .p024-preview-modal,.p024-app .p024-preview-modal *{visibility:visible}",
    "  .p024-app .p024-preview-modal{position:static;width:auto;max-width:none;height:auto;padding:0;border:0;border-radius:0;background:#fff;box-shadow:none}",
    "  .p024-app .p024-modal-header,.p024-app .p024-preview-toolbar{display:none !important}",
    "  .p024-app .p024-preview-area{display:block;padding:0;overflow:visible;background:#fff}",
    "  .p024-app .p024-paper{width:auto;min-height:0;margin:0;padding:0;box-shadow:none;page-break-after:always}",
    "  .p024-app .p024-paper:last-child{page-break-after:auto}",
    "}",
    "@media (max-width:850px){",
    "  .p024-app .p024-field{min-width:100%}",
    "  .p024-app .p024-action-group{justify-content:stretch}",
    "  .p024-app .p024-action-button{flex:1}",
    "}",
    "@media (max-width:680px){",
    "  .p024-app .p024-field{min-width:100%}",
    "  .p024-app .p024-panel-header,.p024-app .p024-panel-footer{align-items:flex-start;flex-direction:column}",
    "}"
  ].join("\n");

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
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
        headers[i].classList.add("p024-sorted");
        var arrow = headers[i].querySelector(".p024-arrow");
        if (arrow) arrow.textContent = state.sortDirection === "asc" ? "▲" : "▼";
      } else {
        headers[i].classList.remove("p024-sorted");
        var arrow2 = headers[i].querySelector(".p024-arrow");
        if (arrow2) arrow2.textContent = "";
      }
    }
  }

  function updateSummary(items, limit) {
    var total = 0, highest = 0, over = 0;
    for (var i = 0; i < items.length; i++) {
      total += items[i].totalAmount;
      if (items[i].totalAmount > highest) highest = items[i].totalAmount;
      if (items[i].totalAmount >= limit) over++;
    }
    els.resultBadge.textContent = items.length + " รายการ";
    els.footerText.textContent = "แสดง " + items.length + " รายการ";
    els.footerTotal.textContent = "฿" + formatMoney(total);
  }

  function renderRows(limit) {
    var sorted = sortItems(state.items);
    els.rows.innerHTML = "";
    updateSortIndicators();
    updateSummary(sorted, limit);

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.empty.classList.add("p024-show");
      if (els.pagination) els.pagination.innerHTML = "";
      return;
    }
    els.tableWrap.style.display = "block";
    els.empty.classList.remove("p024-show");

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
      if (item.id === state.currentId) row.classList.add("p024-active");

      var isOver = item.totalAmount > item.maxAmount;
      var gradeCls = "p024-" + String(item.grade).toLowerCase();
      row.innerHTML =
        '<td class="p024-employee-code">' + esc(item.employeeCode) + "</td>" +
        '<td class="p024-customer-code">' + esc(item.customerCode) + "</td>" +
        '<td title="' + esc(item.customer) + '">' + esc(item.customer) + "</td>" +
        '<td class="p024-center"><span class="p024-grade ' + gradeCls + '">' + esc(item.grade) + "</span></td>" +
        '<td class="p024-number p024-amount">' + formatMoney(item.maxAmount) + "</td>" +
        '<td class="p024-number p024-amount' + (isOver ? " p024-over" : "") + '">' + formatMoney(item.totalAmount) + "</td>";
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
    html += '<button class="p024-page-btn p024-prev" data-page="' + (state.page - 1) + '"' + (state.page <= 1 ? " disabled" : "") + ">&#8249;</button>";
    for (var p = start; p <= end; p++) {
      html += '<button class="p024-page-btn' + (p === state.page ? " p024-active" : "") + '" data-page="' + p + '">' + p + "</button>";
    }
    html += '<button class="p024-page-btn p024-next" data-page="' + (state.page + 1) + '"' + (state.page >= totalPages ? " disabled" : "") + ">&#8250;</button>";
    els.pagination.innerHTML = html;
  }

  function showToast(message) {
    els.toastMessage.textContent = message;
    clearTimeout(state.toastTimer);
    els.toast.classList.add("p024-show");
    state.toastTimer = setTimeout(function () { els.toast.classList.remove("p024-show"); }, 1900);
  }

  /* ผิดพลาดค้นหา (สร้างจาก codepoints — ไม่พิมพ์คำไทยตรงๆ) */
  var ERR_SEARCH_FAILED = String.fromCharCode(0xE04,0xE49,0xE19,0xE2B,0xE32,0xE21,0xE43,0xE48,0xE0A,0xE30,0xE21,0xE40,0xE23,0xE35,0xE08);

  function applyFilters(showMessage) {
    var province = els.provinceCode.value.trim();
    var employee = els.employeeCode.value.trim();
    var limit = Number(els.creditLimit.value || 0);
    state.page = 1;

    els.panelSubtitle.textContent = "มูลค่ารวมตั้งแต่ ฿" + formatMoney(limit) + " ขึ้นไป";

    els.searchButton.classList.add("p024-loading");
    els.searchButton.disabled = true;

    fetch("api/p024_search.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: "c1788406814359",
        province: province,
        employee: employee,
        amount: limit
      })
    }).then(function (resp) { return resp.json(); })
    .then(function (data) {
      els.searchButton.classList.remove("p024-loading");
      els.searchButton.disabled = false;
      if (!data.ok) {
        showToast(data.error || ERR_SEARCH_FAILED);
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
          maxAmount: Number(row.maxNetSum) || 0,
          totalAmount: Number(row.netSum) || 0
        };
      });
      renderRows(limit);
      if (showMessage) {
        showToast("พบข้อมูล " + state.items.length + " รายการ");
      }
    })
    .catch(function (err) {
      els.searchButton.classList.remove("p024-loading");
      els.searchButton.disabled = false;
      showToast(ERR_SEARCH_FAILED + ": " + (err && err.message ? err.message : String(err)));
    });
  }

  var zoomLevel = 1;
  function setZoom(level) {
    zoomLevel = Math.min(2, Math.max(0.5, level));
    var papers = els.previewArea.querySelectorAll(".p024-paper");
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

    var now = new Date();
    function p2(n) { return (n < 10 ? "0" : "") + n; }
    var stamp = now.getFullYear() + "/" + p2(now.getMonth() + 1) + "/" + p2(now.getDate()) +
      " " + p2(now.getHours()) + ":" + p2(now.getMinutes()) + ":" + p2(now.getSeconds());

    function paperHead(s) {
      return "<h1>รายงานตรวจสอบข้อมูลหนี้เฝ้าระวัง</h1>" +
        '<div class="p024-meta">พิมพ์โดย : P024 Web   พิมพ์เมื่อ : ' + s + "</div>";
    }
    function paperTableOpen() {
      return "<table><colgroup>" +
        '<col style="width:12.7%"><col style="width:12.7%"><col style="width:45.5%"><col style="width:12.7%"><col style="width:12.7%">' +
        "</colgroup><thead><tr>" +
        "<th>รหัสพนักงาน</th><th>รหัสลูกหนี้</th><th>ชื่อลูกค้า (เกรด)</th><th>ยอดชำระสูงสุด</th><th>ยอดหนี้รวม</th>" +
        "</tr></thead><tbody>";
    }
    function rowHtml(it) {
      return "<tr>" +
        "<td>" + esc(it.employeeCode) + "</td>" +
        "<td>" + esc(it.customerCode) + "</td>" +
        "<td>" + esc(it.customer) + " (" + esc(it.grade) + ")</td>" +
        '<td class="p024-num">' + formatMoney(it.maxAmount) + "</td>" +
        '<td class="p024-num">' + formatMoney(it.totalAmount) + "</td>" +
        "</tr>";
    }

    // 1) Render a single row and measure the height (must be done while the modal is shown)
    els.previewArea.innerHTML =
      '<div class="p024-paper">' + paperHead(stamp) + paperTableOpen() + rowHtml(list[0]) + "</tbody></table>" +
      '<div class="p024-page-no">หน้า 1</div></div>';
    els.modal.classList.add("p024-show");

    var mp = els.previewArea.querySelector(".p024-paper");
    var sampleRow = mp ? mp.querySelector("tbody tr") : null;
    var rowH = sampleRow ? sampleRow.getBoundingClientRect().height : 28;
    var h1 = mp ? mp.querySelector("h1") : null;
    var meta = mp ? mp.querySelector(".p024-meta") : null;
    var thead = mp ? mp.querySelector("thead") : null;
    var pageNoDiv = mp ? mp.querySelector(".p024-page-no") : null;
    var headerH = (h1 ? h1.getBoundingClientRect().height : 0) +
      (meta ? meta.getBoundingClientRect().height : 0) +
      (thead ? thead.getBoundingClientRect().height : 0);
    var pageNoH = pageNoDiv ? pageNoDiv.getBoundingClientRect().height : 20;
    var PAPER_CONTENT_H = 1055; // A4 portrait 1123px - padding 68px
    // -2 rows safety margin (subpixel / font settle)
    var rowsPerPage = Math.max(1, Math.floor((PAPER_CONTENT_H - headerH - pageNoH) / rowH) - 2);

    // 2) Split into pages and render each page
    var pageCount = Math.ceil(list.length / rowsPerPage);
    var html = "";
    for (var p = 0; p < pageCount; p++) {
      var chunk = list.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
      var rowsHtml = "";
      for (var r = 0; r < chunk.length; r++) rowsHtml += rowHtml(chunk[r]);
      html += '<div class="p024-paper">' + paperHead(stamp) + paperTableOpen() + rowsHtml + "</tbody></table>" +
        '<div class="p024-page-no">หน้า ' + (p + 1) + "</div></div>";
    }
    els.previewArea.innerHTML = html;

    els.previewText.textContent = list.length + " items · " + pageCount + " pages";
    setZoom(1);
  }

  function closePrintPreview() {
    els.modal.classList.remove("p024-show");
  }

  /* ---------- build DOM ---------- */
  function build(root) {
    root.innerHTML =
      '<div class="p024-app">' +
        '<section class="p024-launcher">' +
          '<div class="p024-launcher-title"><strong>' + icon("clock") + " ตรวจสอบข้อมูลหนี้เฝ้าระวัง</strong></div>" +
          '<form class="p024-launcher-body" id="p024FilterForm">' +
            '<div class="p024-form-grid">' +
              '<div class="p024-field">' +
                '<label for="p024ProvinceCode">รหัสจังหวัด (2 ตัวเลข)</label>' +
                '<div class="p024-input-wrap">' +
                  '<svg ' + svgAttrs() + '>' + ICONS.pin + '</svg>' +
                  '<input id="p024ProvinceCode" type="text" maxlength="2" inputmode="numeric" placeholder="เช่น 10">' +
                '</div>' +
                '<small>เว้นว่างเพื่อแสดงทุกจังหวัด</small>' +
              '</div>' +
              '<div class="p024-field">' +
                '<label for="p024EmployeeCode">รหัสพนักงาน</label>' +
                '<div class="p024-input-wrap">' +
                  '<svg ' + svgAttrs() + '>' + ICONS.user + '</svg>' +
                  '<input id="p024EmployeeCode" type="text" placeholder="เช่น S30" autocomplete="off">' +
                '</div>' +
              '</div>' +
              '<div class="p024-field">' +
                '<label for="p024CreditLimit">มูลค่ารวม</label>' +
                '<input id="p024CreditLimit" type="number" min="0" step="1000" value="100000">' +
                '<small>แสดงลูกค้าที่มียอดขายรวมมากกว่าหรือเท่ากับจำนวนนี้</small>' +
              '</div>' +
            '</div>' +
            '<div class="p024-action-group">' +
              '<button class="p024-action-button p024-check" id="p024SearchButton" type="submit">' + icon("search") + " ค้นหา" + '<span class="p024-spinner"></span>' + '</button>' +
            '</div>' +
          '</form>' +
        '</section>' +
        '<section class="p024-panel">' +
          '<div class="p024-panel-header">' +
            '<div class="p024-panel-heading">' +
              '<div class="p024-panel-icon">' + icon("grid") + '</div>' +
              '<div class="p024-panel-title"><h2>รายการตรวจสอบข้อมูลหนี้เฝ้าระวัง</h2><p id="p024PanelSubtitle">ระบุเงื่อนไขด้านบน แล้วกดปุ่มค้นหา</p></div>' +
            '</div>' +
            '<div class="p024-panel-actions">' +
              '<button class="p024-action-button p024-print" id="p024PrintButton" type="button">' + icon("eye") + " Print Preview</button>" +
            '</div>' +
          '</div>' +
          '<div class="p024-panel-count">' +
            '<span class="p024-badge" id="p024ResultBadge">0 รายการ</span>' +
          '</div>' +
          '<div class="p024-table-wrap" id="p024TableWrap">' +
            '<table>' +
              '<thead><tr>' +
                '<th class="p024-sortable" data-sort="employeeCode">รหัสพนักงาน <span class="p024-arrow"></span></th>' +
                '<th class="p024-sortable" data-sort="customerCode">รหัสลูกค้า <span class="p024-arrow"></span></th>' +
                '<th class="p024-sortable" data-sort="customer">ชื่อลูกค้า <span class="p024-arrow"></span></th>' +
                '<th class="p024-sortable p024-center" data-sort="grade">DEBGrade <span class="p024-arrow"></span></th>' +
                '<th class="p024-sortable p024-number" data-sort="maxAmount">ยอดชำระสูงสุด <span class="p024-arrow"></span></th>' +
                '<th class="p024-sortable p024-number" data-sort="totalAmount">ยอดหนี้รวม <span class="p024-arrow"></span></th>' +
              '</tr></thead>' +
              '<tbody id="p024Rows"></tbody>' +
            '</table>' +
          '</div>' +
          '<div class="p024-pagination" id="p024Pagination"></div>' +
          '<div class="p024-empty-state" id="p024EmptyState">' +
            '<div>' +
              '<svg ' + svgAttrs() + ' style="width:48px;height:48px;margin:0 auto 10px">' + ICONS.searchempty + '</svg>' +
              '<strong>ไม่พบข้อมูลตามเงื่อนไขที่เลือก</strong>' +
              '<p>ลองปรับมูลค่ารวม รหัสจังหวัด หรือรหัสพนักงาน</p>' +
            '</div>' +
          '</div>' +
          '<div class="p024-panel-footer">' +
            '<span id="p024FooterText">แสดง 0 รายการ</span>' +
            '<span class="p024-total-box" id="p024FooterTotal">฿0.00</span>' +
          '</div>' +
        '</section>' +
        '<div class="p024-toast" id="p024Toast">' +
          '<svg ' + svgAttrs() + '>' + ICONS.check + '</svg>' +
          '<span id="p024ToastMessage">ดำเนินการเรียบร้อยแล้ว</span>' +
        '</div>' +
        '<div class="p024-modal-backdrop" id="p024Modal">' +
          '<section class="p024-preview-modal" role="dialog" aria-modal="true">' +
            '<div class="p024-modal-header">' +
              '<h3>Print Preview - ตรวจสอบข้อมูลหนี้เฝ้าระวัง</h3>' +
              '<button class="p024-modal-close" id="p024ModalClose" type="button">×</button>' +
            '</div>' +
            '<div class="p024-preview-toolbar">' +
              '<span id="p024PreviewText">0 รายการ</span>' +
              '<div class="p024-toolbar-right">' +
                '<div class="p024-zoom-control">' +
                  '<button class="p024-zoom-btn" id="p024ZoomOut" type="button" title="ย่อ">−</button>' +
                  '<span class="p024-zoom-label" id="p024ZoomLabel">100%</span>' +
                  '<button class="p024-zoom-btn" id="p024ZoomIn" type="button" title="ขยาย">+</button>' +
                '</div>' +
                '<button class="p024-print-now" id="p024PrintNow" type="button">' + icon("print") + ' พิมพ์รายงาน</button>' +
              '</div>' +
            '</div>' +
            '<div class="p024-preview-area" id="p024PreviewArea"></div>' +
          '</section>' +
        '</div>' +
      '</div>';

    var app = root.querySelector(".p024-app");
    els.app = app;
    els.filterForm = root.querySelector("#p024FilterForm");
    els.provinceCode = root.querySelector("#p024ProvinceCode");
    els.employeeCode = root.querySelector("#p024EmployeeCode");
    els.creditLimit = root.querySelector("#p024CreditLimit");
    els.printButton = root.querySelector("#p024PrintButton");
    els.searchButton = root.querySelector("#p024SearchButton");
    els.resultBadge = root.querySelector("#p024ResultBadge");
    els.panelSubtitle = root.querySelector("#p024PanelSubtitle");
    els.tableWrap = root.querySelector("#p024TableWrap");
    els.rows = root.querySelector("#p024Rows");
    els.empty = root.querySelector("#p024EmptyState");
    els.footerText = root.querySelector("#p024FooterText");
    els.footerTotal = root.querySelector("#p024FooterTotal");
    els.toast = root.querySelector("#p024Toast");
    els.toastMessage = root.querySelector("#p024ToastMessage");
    els.modal = root.querySelector("#p024Modal");
    els.modalClose = root.querySelector("#p024ModalClose");
    els.previewArea = root.querySelector("#p024PreviewArea");
    els.previewText = root.querySelector("#p024PreviewText");
    els.zoomIn = root.querySelector("#p024ZoomIn");
    els.zoomOut = root.querySelector("#p024ZoomOut");
    els.zoomLabel = root.querySelector("#p024ZoomLabel");
    els.printNow = root.querySelector("#p024PrintNow");
    els.pagination = root.querySelector("#p024Pagination");

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
      renderRows(Number(els.creditLimit.value || 0));
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
          renderRows(Number(els.creditLimit.value || 0));
        });
      })(headers[i]);
    }

    els.pagination.addEventListener("click", function (e) {
      var btn = e.target.closest("button.p024-page-btn");
      if (!btn || btn.disabled) return;
      var p = Number(btn.getAttribute("data-page"));
      if (!p || p < 1) return;
      state.page = p;
      renderRows(Number(els.creditLimit.value || 0));
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
    if (document.getElementById("p024Style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "p024Style";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  window.P024CreditCheck = {
    mount: function (root) {
      injectStyle();
      build(root);
    }
  };
})();
