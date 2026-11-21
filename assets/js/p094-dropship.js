/* P094 — PO Dropship
 * UI เท่านั้น (mock data ตาม demo/P094-demo.html) — ไม่มี API/DB
 * window.P094Dropship = { mount }
 */
(function () {
  "use strict";

  var CSS = [
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal}",
    ".p094-app{display:flex;flex-direction:column;gap:14px;font-family:inherit}",
    ".p094-app *{box-sizing:border-box}",
    /* launcher */
    ".p094-app .p094-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p094-app .p094-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p094-app .p094-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px}",
    ".p094-app .p094-launcher-title svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2.2}",
    ".p094-app .p094-launcher-body{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px;padding:18px 22px;background:linear-gradient(180deg,#e4fbfd,#eefbfd)}",
    ".p094-app .p094-field label{display:block;margin-bottom:6px;color:#334155;font-size:12px;font-weight:700}",
    ".p094-app .p094-field input{height:41px;padding:0 11px;color:#172033;border:1px solid #b6c5d8;border-radius:9px;outline:none;background:#fff;font-size:13px}",
    ".p094-app .p094-field.p094-po-field input{width:160px}",
    ".p094-app .p094-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p094-app .p094-date-field input{width:150px}",
    ".p094-app .p094-panel-header-right{display:flex;align-items:center;gap:10px}",
    ".p094-app .p094-actions{display:flex;align-items:center;gap:11px}",
    ".p094-app .p094-button{display:inline-flex;min-width:110px;min-height:48px;align-items:center;justify-content:center;gap:8px;padding:0 16px;border-radius:10px;font-size:13px;font-weight:700;transition:.16s ease}",
    ".p094-app .p094-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p094-app .p094-button.p094-search{color:#fff;border:0;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.23)}",
    ".p094-app .p094-button.p094-preview{color:#fff;border:0;background:#16a34a;box-shadow:0 8px 18px rgba(22,163,74,.25)}",
    ".p094-app .p094-button:hover{filter:brightness(.98);transform:translateY(-1px)}",
    ".p094-app .p094-button.p094-search.p094-loading{pointer-events:none;opacity:.75}",
    ".p094-app .p094-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:p094spin .8s linear infinite}",
    "@keyframes p094spin{to{transform:rotate(360deg)}}",
    /* panel */
    ".p094-app .p094-panel{display:flex;min-height:450px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p094-app .p094-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p094-app .p094-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p094-app .p094-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p094-app .p094-panel-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p094-app .p094-panel-title h2{font-size:14px}",
    ".p094-app .p094-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p094-app .p094-badge{padding:5px 11px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p094-app .p094-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p094-app .p094-table-wrap table{width:100%;min-width:1110px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p094-app .p094-table-wrap th{position:sticky;top:0;z-index:2;padding:10px 12px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p094-app .p094-table-wrap th.p094-sortable{cursor:pointer}",
    ".p094-app .p094-table-wrap th.p094-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p094-app .p094-table-wrap th.p094-sorted{color:#1d4ed8;background:#e0ecff}",
    ".p094-app .p094-table-wrap th.p094-center,.p094-app .p094-table-wrap td.p094-center{text-align:center}",
    ".p094-app .p094-table-wrap th.p094-number,.p094-app .p094-table-wrap td.p094-number{text-align:right;font-family:Arial,sans-serif}",
    ".p094-app .p094-table-wrap td{max-width:340px;overflow:hidden;padding:7px 12px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p094-app .p094-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p094-app .p094-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p094-app .p094-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p094-app .p094-table-wrap tbody tr.p094-active td{color:#fff;background:#0878d1}",
    ".p094-app .p094-check-cell{width:42px;text-align:center}",
    ".p094-app .p094-check-cell input{width:16px;height:16px;accent-color:#2563eb;cursor:pointer}",
    ".p094-app .p094-po-no,.p094-app .p094-vendor-code{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p094-app .p094-amount{color:#047857;font-family:Arial,sans-serif;font-weight:700}",
    ".p094-app .p094-copies{display:inline-flex;min-width:30px;justify-content:center;padding:3px 8px;color:#7c3aed;border-radius:7px;background:#f5f3ff;font-family:Arial,sans-serif;font-weight:700}",
    ".p094-app .p094-table-wrap tbody tr.p094-active .p094-po-no,.p094-app .p094-table-wrap tbody tr.p094-active .p094-vendor-code,.p094-app .p094-table-wrap tbody tr.p094-active .p094-amount{color:#fff}",
    ".p094-app .p094-table-wrap tbody tr.p094-active .p094-copies{color:#fff;background:rgba(255,255,255,.22)}",
    ".p094-app .p094-empty{display:none;min-height:260px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p094-app .p094-empty.p094-show{display:flex}",
    ".p094-app .p094-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p094-app .p094-selected-chip{padding:5px 11px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-weight:700}",
    /* pager */
    ".p094-app .p094-pager{display:none;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border-top:1px solid #dbe3ef;background:#f8fafc}",
    ".p094-app .p094-pager button{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;color:#334155;border:1px solid #dbe3ef;border-radius:8px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.14s ease}",
    ".p094-app .p094-pager button:hover:not(:disabled){color:#2563eb;border-color:#94a3b8}",
    ".p094-app .p094-pager button.p094-page-active{color:#fff;border-color:#2563eb;background:#2563eb}",
    ".p094-app .p094-pager button:disabled{color:#b6c5d8;background:#f1f5f9;cursor:not-allowed}",
    /* modal */
    ".p094-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}",
    ".p094-modal-backdrop.p094-show{display:grid}",
    ".p094-modal{display:flex;width:min(1050px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
    ".p094-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p094-modal-header h3{font-size:15px}",
    ".p094-modal-close{width:30px;height:30px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px}",
    ".p094-modal-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid #dbe3ef;background:#f8fafc}",
    ".p094-modal-toolbar span{color:#64748b;font-size:12px}",
    ".p094-print-btn{display:inline-flex;height:35px;align-items:center;gap:7px;padding:0 13px;color:#fff;border:0;border-radius:8px;background:#2563eb;font-size:12px;font-weight:700}",
    ".p094-print-btn svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p094-preview-area{flex:1;overflow:auto;padding:24px;background:#94a3b8}",
    ".p094-paper{width:794px;min-height:1123px;margin:0 auto;padding:28px 30px;position:relative;background:#fff;box-shadow:0 16px 35px rgba(15,23,42,.25);font-family:'THSarabunNew',sans-serif}",
    ".p094-paper-footer{position:absolute;left:30px;right:30px;bottom:20px}",
    ".p094-head-table{width:550pt;margin:0 auto;border-collapse:collapse;border-bottom:1pt solid #000}",
    ".p094-head-table td{padding:2px 0}",
    ".p094-head-logo img{width:78pt;height:50pt}",
    ".p094-head-text{text-align:center;padding-left:10pt;vertical-align:bottom}",
    ".p094-head-text .p094-head-company{font-size:20pt;font-weight:700}",
    ".p094-head-text .p094-head-address{font-size:14pt;font-weight:700}",
    ".p094-info-table{width:550pt;margin:12px auto 0;border-collapse:collapse}",
    ".p094-info-table td{font-size:14pt;padding:2px 0}",
    ".p094-info-table .p094-label{font-size:13pt;font-weight:700}",
    ".p094-info-table td.p094-top{vertical-align:top}",
    ".p094-detail-table{width:550pt;margin:14px auto 0;border-collapse:collapse}",
    ".p094-detail-table th{font-size:12pt;font-weight:700;text-align:center;background:#d3d3d3;padding:4px 2px;border:1pt solid #000}",
    ".p094-detail-table td{font-size:12pt;padding:3px 4px;border:1pt solid #000}",
    ".p094-detail-table td.p094-center{text-align:center}",
    ".p094-detail-table td.p094-right{text-align:right}",
    ".p094-detail-table td.p094-bold,.p094-detail-table tr.p094-total td,.p094-detail-table tr.p094-grand td{font-weight:700}",
    ".p094-notes-table{width:550pt;margin:14px auto 0;border-collapse:collapse}",
    ".p094-notes-table td{font-size:12pt;padding:2px 0}",
    ".p094-sign-table{width:550pt;margin:14px auto 0;border-collapse:collapse}",
    ".p094-sign-table td{font-size:12pt;text-align:center;padding-top:40px}",
    ".p094-form-code{font-size:14pt;text-align:right;margin-top:10px}",
    /* toast */
    ".p094-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p094-toast.p094-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p094-toast svg{color:#34d399}",
    ".p094-paper-loading{min-height:200px;color:#64748b;text-align:center;line-height:200px}",
    ".p094-paper-placeholder{min-height:420px;color:#64748b;text-align:center;line-height:420px;font-size:13px}",
    ".p094-pages{display:flex;flex-direction:column;align-items:center;gap:18px}",
    /* print */
    "@media print{@page{size:A4 portrait;margin:8mm}body>*:not(#p094Modal){display:none !important}#p094Modal.p094-show{position:static !important;display:block !important;padding:0 !important;background:none !important;backdrop-filter:none !important}#p094Modal .p094-modal{display:block !important;width:auto !important;max-width:none !important;max-height:none !important;overflow:visible !important;border-radius:0 !important;box-shadow:none !important}#p094Modal .p094-modal-header,#p094Modal .p094-modal-toolbar{display:none !important}#p094Modal .p094-preview-area{display:block !important;overflow:visible !important;padding:0 !important;background:none !important}#p094Modal .p094-pages{display:block !important}#p094Modal .p094-paper{width:194mm !important;min-height:280mm !important;margin:0 !important;padding:0 !important;box-shadow:none !important;page-break-after:always;break-after:page}#p094Modal .p094-paper:last-child{page-break-after:auto;break-after:auto}}",
    /* responsive */
    "@media (max-width:900px){.p094-app .p094-field{width:100%}.p094-app .p094-date-field input{width:100%}.p094-app .p094-field.p094-po-field input{width:100%}}",
    "@media (max-width:680px){.p094-app .p094-actions{flex-direction:column}.p094-app .p094-button{width:100%}.p094-app .p094-panel-header,.p094-app .p094-panel-footer{align-items:flex-start;flex-direction:column}.p094-preview-area{padding:12px}.p094-paper{padding:20px}}"
  ];

  /* ---------- API (MAC-5) ---------- */
  var CONNECTION_ID = "c1788406814359"; // MAC5 (sqlserver, M5CM-AA-01)

  function apiPost(path, body) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ connectionId: CONNECTION_ID }, body))
    }).then(function (r) { return r.json(); });
  }


  var state = { items: [], selected: new Set(), currentId: null, sortField: "date", sortDir: "asc", page: 1 };
  var els = {};
  var toastTimer = null;
  var PAGE_SIZE = 15;
  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function injectStyle() {
    if (document.getElementById("p094-style")) return;
    var style = document.createElement("style");
    style.id = "p094-style";
    style.textContent = CSS.join("\n");
    document.head.appendChild(style);
  }

  function esc(value) {
    return String(value === null || value === undefined ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtMoney(value) {
    return moneyFmt.format(Number(value || 0));
  }

  function fmtDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "-";
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function showToast(message) {
    var t = els.toast;
    if (!t) return;
    els.toastMsg.textContent = message;
    t.classList.add("p094-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("p094-show"); }, 1900);
  }

  function sortItems(items) {
    var field = state.sortField;
    var dir = state.sortDir === "asc" ? 1 : -1;
    return items.slice().sort(function (a, b) {
      var x = a[field];
      var y = b[field];
      if (typeof x === "string") { x = x.toLocaleLowerCase("th"); y = String(y).toLocaleLowerCase("th"); }
      if (x < y) return -1 * dir;
      if (x > y) return 1 * dir;
      return 0;
    });
  }

  function updateSortIndicators() {
    var headers = els.root.querySelectorAll("th[data-sort]");
    Array.prototype.forEach.call(headers, function (h) {
      var active = h.getAttribute("data-sort") === state.sortField;
      h.classList.toggle("p094-sorted", active);
      var arrow = h.querySelector(".p094-arrow");
      if (arrow) arrow.textContent = active ? (state.sortDir === "asc" ? "▲" : "▼") : "";
    });
  }

  function updateSummary(items) {
    var vendorSet = {};
    var totalAmount = 0;
    var selectedCount = 0;
    items.forEach(function (it) {
      vendorSet[it.cusCode] = true;
      totalAmount += Number(it.netSUM) || 0;
      if (state.selected.has(it.id)) selectedCount++;
    });
    var vendorCount = Object.keys(vendorSet).length;

    els.badge.textContent = items.length + " รายการ";
    els.footerText.textContent = "แสดง " + items.length + " รายการ";
    els.footerSelected.textContent = "เลือกแล้ว " + selectedCount + " รายการ";

    var all = items.length > 0 && selectedCount === items.length;
    els.selectAll.checked = all;
    els.selectAll.indeterminate = !all && selectedCount > 0;
  }

  function renderRows() {
    var sorted = sortItems(state.items);
    els.rows.innerHTML = "";
    updateSortIndicators();

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.empty.classList.add("p094-show");
      if (els.pager) { els.pager.style.display = "none"; els.pager.innerHTML = ""; }
      updateSummary([]);
      return;
    }
    els.tableWrap.style.display = "block";
    els.empty.classList.remove("p094-show");

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page < 1) state.page = 1;
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(start, start + PAGE_SIZE);

    if (!pageItems.some(function (it) { return it.id === state.currentId; })) {
      state.currentId = pageItems[0].id;
    }

    pageItems.forEach(function (it) {
      var tr = document.createElement("tr");
      tr.dataset.id = it.id;
      if (it.id === state.currentId) tr.classList.add("p094-active");
      tr.innerHTML =
        '<td class="p094-check-cell"><input class="p094-row-check" type="checkbox"' + (state.selected.has(it.id) ? " checked" : "") + "></td>" +
        '<td class="p094-center">' + fmtDate(it.date) + "</td>" +
        '<td class="p094-po-no">' + esc(it.poNo) + "</td>" +
        '<td class="p094-vendor-code">' + esc(it.cusCode) + "</td>" +
        '<td title="' + esc(it.cusName) + '">' + esc(it.cusName) + "</td>" +
        '<td class="p094-number p094-amount">฿' + fmtMoney(it.netSUM) + "</td>" +
        '<td title="' + esc(it.memo) + '">' + esc(it.memo) + "</td>" +
        '<td class="p094-center"><span class="p094-copies">' + it.printN + "</span></td>" +
        '<td>' + esc(it.creditTerm) + "</td>";
      els.rows.appendChild(tr);
    });

    if (els.pager) {
      els.pager.style.display = "flex";
      renderPagination(sorted.length);
    }
    updateSummary(sorted);
  }

  function renderPagination(total) {
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    els.pager.innerHTML = "";
    function makeBtn(label, page, disabled, active, title) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      if (title) b.title = title;
      b.disabled = !!disabled;
      if (active) b.classList.add("p094-page-active");
      if (!disabled) b.addEventListener("click", function () { gotoPage(page); });
      els.pager.appendChild(b);
      return b;
    }
    makeBtn("«", 1, state.page <= 1, false, "หน้าแรก");
    makeBtn("‹", state.page - 1, state.page <= 1, false, "หน้าก่อนหน้า");
    for (var p = 1; p <= totalPages; p++) makeBtn(String(p), p, false, p === state.page, "หน้า " + p);
    makeBtn("›", state.page + 1, state.page >= totalPages, false, "หน้าถัดไป");
    makeBtn("»", totalPages, state.page >= totalPages, false, "หน้าสุดท้าย");
  }

  function gotoPage(p) {
    var totalPages = Math.max(1, Math.ceil(state.items.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, p), totalPages);
    renderRows();
  }

  function applyFilters(showMessage) {
    var dateFrom = els.dateFrom.value;
    var dateTo = els.dateTo.value;
    var poNo = els.poNo.value.trim();

    // ดึงข้อมูล MAC-5 จริง (C# btn_search_Click — MIH LEFT JOIN CRE)
    return apiPost("p094_search.php", { dateFrom: dateFrom, dateTo: dateTo, poNo: poNo })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "ค้นหาไม่สำเร็จ");
        state.items = data.rows;
        state.selected = new Set();
        state.page = 1;
        renderRows();
        els.panelSubtitle.textContent = "วันที่ PO " + fmtDate(dateFrom) + " ถึง " + fmtDate(dateTo) + " · ติ๊กเลือกข้อมูลก่อน Print Preview";
        if (showMessage) {
          showToast("พบ PO Dropship " + state.items.length + " รายการ");
        }
      })
      .catch(function (err) {
        showToast("ค้นหาไม่สำเร็จ: " + (err.message || err));
      });
  }

  function getSelectedPOs() {
    var selected = state.items.filter(function (it) { return state.selected.has(it.id); });
    if (selected.length) return selected;
    var active = null;
    state.items.forEach(function (it) { if (it.id === state.currentId) active = it; });
    return active ? [active] : [];
  }

  var THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กันยายน", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  function fmtThaiDate(iso) {
    var p = String(iso || "").split("-");
    if (p.length !== 3) return iso || "-";
    var m = Number(p[1]) - 1;
    return p[2] + " " + (THAI_MONTHS[m] || "") + " " + p[0];
  }

  function buildPaperHTML(po, data) {
    var cus = data.cus || {};
    var jobs = data.jobs || [];

    var html = [];
    // ตาราง 1: 3 คอลั่น (80,390,80pt) — logo + หัวเอกสาร (C# OnEndPage)
    html.push(
      '<table class="p094-head-table">' +
      '<colgroup><col style="width:80pt"><col style="width:390pt"><col style="width:80pt"></colgroup>' +
      '<tr>' +
      '<td class="p094-head-logo"><img src="assets/images/LOGO_MCIT.png" alt=""></td>' +
      '<td class="p094-head-text" colspan="2"><span class="p094-head-company">บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด</span><br><span class="p094-head-address">58/9 หมู่ 6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร 74110 โทร 034-878366-8 แฟกซ์ 034-878369</span></td>' +
      '</tr>' +
      '</table>'
    );
    // ตาราง 2: 5 คอลั่น (50,100,250,50,100pt) — ข้อมูลลูกค้า (C# getCRE)
    html.push(
      '<table class="p094-info-table">' +
      '<colgroup><col style="width:50pt"><col style="width:100pt"><col style="width:250pt"><col style="width:50pt"><col style="width:100pt"></colgroup>' +
      '<tr>' +
      '<td class="p094-label">ชื่อ</td>' +
      '<td colspan="2">' + esc(cus.nameT || po.cusName) + '</td>' +
      '<td class="p094-label">เลขที่</td>' +
      '<td>' + esc(data.poNo) + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="p094-label p094-top" rowspan="2">ที่อยู่</td>' +
      '<td class="p094-top" colspan="2" rowspan="2">' + esc(cus.add1 || "") + '</td>' +
      '<td class="p094-label">วันที่</td>' +
      '<td>' + fmtThaiDate(po.date) + '</td>' +
      '</tr>' +
      '<tr>' +
      '<td colspan="2">กำหนดการชำระเงิน ' + esc(po.creditTerm) + ' วัน</td>' +
      '</tr>' +
      '<tr>' +
      '<td class="p094-label">โทร/แฟกซ์.</td>' +
      '<td colspan="4">' + esc(cus.tel || "") + '/' + esc(cus.fax || "") + '</td>' +
      '</tr>' +
      '</table>'
    );

    // ตารางรายละเอียด 7 คอลั่น (30,285,40,50,50,40,55) — C# bgWorker_DoWork
    var grandTotal = 0;
    var no = 1;
    html.push(
      '<table class="p094-detail-table">' +
      '<colgroup><col style="width:30pt"><col style="width:285pt"><col style="width:40pt"><col style="width:50pt"><col style="width:50pt"><col style="width:40pt"><col style="width:55pt"></colgroup>' +
      '<thead>' +
      '<tr>' +
      '<th rowspan="2">No.</th>' +
      '<th>ลูกค้า+ขนส่ง</th>' +
      '<th rowspan="2">Check</th>' +
      '<th rowspan="2">จำนวน</th>' +
      '<th rowspan="2">ราคา</th>' +
      '<th rowspan="2">ส่วนลด</th>' +
      '<th rowspan="2">มูลค่า</th>' +
      '</tr>' +
      '<tr><th>รายการสินค้า</th></tr>' +
      '</thead>' +
      '<tbody>'
    );
    jobs.forEach(function (jb) {
      var jobTotal = 0;
      // แถวลูกค้า+ขนส่ง (C#: "No." ตัวหนา + phrase colspan 6)
      html.push(
        '<tr>' +
        '<td class="p094-bold">' + no + '.</td>' +
        '<td colspan="6"><strong>ลูกค้า :</strong> ' + esc(jb.cusName) + ' ' + esc(jb.contact) + (jb.grade ? ' [' + esc(jb.grade) + ']' : '') + '<br>' +
        '<strong>ขนส่ง :</strong> ' + esc(jb.jobDescT) + ' ' + esc(jb.jobDescE) + '</td>' +
        '</tr>'
      );
      var no2 = 1;
      jb.details.forEach(function (d) {
        jobTotal += Number(d.sum) || 0;
        html.push(
          '<tr>' +
          '<td>' + no + '.' + no2 + '</td>' +
          '<td>' + esc(d.stk) + ' : ' + esc(d.desc) + '</td>' +
          '<td class="p094-center">' + esc(d.check) + '</td>' +
          '<td class="p094-center">' + d.quan + ' ' + esc(d.unit) + '</td>' +
          '<td class="p094-right">' + fmtMoney(d.uprice) + '</td>' +
          '<td class="p094-right">' + fmtMoney(d.discA) + '</td>' +
          '<td class="p094-right">' + fmtMoney(d.sum) + '</td>' +
          '</tr>'
        );
        no2++;
      });
      // แถว "รวม" ต่อ job (C#: colspan 6 ขวา + total ตัวหนา)
      html.push(
        '<tr class="p094-total">' +
        '<td colspan="6" class="p094-right">รวม</td>' +
        '<td class="p094-right">' + fmtMoney(jobTotal) + '</td>' +
        '</tr>'
      );
      grandTotal += jobTotal;
      no++;
    });
    // แถว "รวมทั้งสิ้น" (C# ท้ายตารางเดียวกัน)
    html.push(
      '<tr class="p094-grand">' +
      '<td colspan="6" class="p094-right">รวมทั้งสิ้น</td>' +
      '<td class="p094-right">' + fmtMoney(grandTotal) + '</td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );

    // หมายเหตุ (ตาราง 4: 2 คอลั่น 60,490pt) + ชื่อรองเท็จ + รหัสแบบฟอร์ม — เป็น footer ของกระดาษ (C# OnEndPage)
    html.push(
      '<div class="p094-paper-footer">' +
      '<table class="p094-notes-table">' +
      '<colgroup><col style="width:60pt"><col style="width:490pt"></colgroup>' +
      '<tr>' +
      '<td>*หมายเหตุ :</td>' +
      '<td>- หากต้องการแก้ไขรายการ จำนวน และราคา กรุณาติดต่อกลับภายใน 1 วัน นับจากวันที่ได้รับเอกสาร</td>' +
      '</tr>' +
      '<tr>' +
      '<td>&nbsp;</td>' +
      '<td>- กรุณาส่งของตามชื่อขนส่งที่เราแจ้ง หากมีการเปลี่ยนแปลง กรุณาโทร 034-878366-68 (แผนกจัดซื้อ)</td>' +
      '</tr>' +
      '</table>' +
      '<table class="p094-sign-table">' +
      '<colgroup><col style="width:183pt"><col style="width:184pt"><col style="width:183pt"></colgroup>' +
      '<tr>' +
      '<td>___________________________<br>ผู้สั่งซื้อ</td>' +
      '<td>___________________________<br>ผู้ตรวจสอบ</td>' +
      '<td>___________________________<br>ผู้อนุมัติสั่งซื้อ</td>' +
      '</tr>' +
      '</table>' +
      '<div class="p094-form-code">FM-PS-00-02</div>' +
      '</div>'
    );

    return html.join("");
  }

  function openPreview() {
    var selected = getSelectedPOs();
    if (!selected.length) {
      showToast("โปรดเลือกข้อมูล");
      return;
    }

    els.previewText.textContent = "เลือกเอกสาร " + selected.length + " ใบ · กำลังดึงรายละเอียด...";
    els.paper.innerHTML = '<article class="p094-paper"><div class="p094-paper-loading">กำลังดึงรายละเอียด...</div></article>';
    els.modal.classList.add("p094-show");
    document.body.style.overflow = "hidden";

    // โหลดฟอนต์ THSarabunNew ก่อน render รายงาน (P093 pattern)
    if (document.fonts && document.fonts.load) {
      document.fonts.load('12pt "THSarabunNew').catch(function () {});
      document.fonts.load('700 12pt "THSarabunNew').catch(function () {});
      document.fonts.load('14pt "THSarabunNew').catch(function () {});
      document.fonts.load('700 14pt "THSarabunNew').catch(function () {});
      document.fonts.load('700 20pt "THSarabunNew').catch(function () {});
    }

    // ดึงรายละเอียดจริงทีละใบ (C# getPOjob + getPOdetail + checking + getCRE)
    var tasks = selected.map(function (po) {
      return apiPost("p094_detail.php", { poNo: po.poNo, cus: po.cusCode })
        .then(function (data) {
          if (!data.ok) throw new Error(data.error || "โหลดรายละเอียดไม่สำเร็จ");
          return { po: po, data: data, ok: true };
        })
        .catch(function (err) {
          return { po: po, ok: false, error: err.message || String(err) };
        });
    });

    Promise.all(tasks).then(function (results) {
      // 1 รายการที่เลือก = 1 หน้า A4
      var pages = results.map(function (r) {
        if (!r.ok) {
          return '<article class="p094-paper"><div class="p094-paper-loading">' +
            esc(r.po.poNo) + ' — โหลดไม่สำเร็จ: ' + esc(r.error) + '</div></article>';
        }
        return '<article class="p094-paper">' + buildPaperHTML(r.po, r.data) + '</article>';
      });
      els.paper.innerHTML = pages.join("");
      els.previewText.textContent = "เลือกเอกสาร " + selected.length + " ใบ · " + pages.length + " หน้า (A4)";
    });
  }

  function closePreview() {
    els.modal.classList.remove("p094-show");
    document.body.style.overflow = "";
  }

  function mount(root) {
    injectStyle();
    els.root = root;
    state.items = [];
    state.selected = new Set();
    state.currentId = null;
    state.sortField = "date";
    state.sortDir = "asc";
    state.page = 1;

    root.innerHTML =
      '<div class="p094-app">' +
      /* launcher */
      '<section class="p094-launcher">' +
      '  <div class="p094-launcher-title">' +
      '    <strong><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg>PO Dropship</strong>' +
      '  </div>' +
      '  <form class="p094-launcher-body" id="p094FilterForm">' +
      '    <div class="p094-field p094-date-field">' +
      '      <label>วันที่ PO</label>' +
      '      <input id="p094DateFrom" type="date">' +
      '    </div>' +
      '    <div class="p094-field p094-date-field">' +
      '      <label>ถึง</label>' +
      '      <input id="p094DateTo" type="date">' +
      '    </div>' +
      '    <div class="p094-field p094-po-field">' +
      '      <label for="p094PoNo">เลขใบสำคัญ</label>' +
      '      <input id="p094PoNo" type="text" autocomplete="off" placeholder="เช่น PO016911-0001">' +
      '    </div>' +
      '    <div class="p094-actions">' +
      '      <button class="p094-button p094-search" id="p094SearchButton" type="submit"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>ค้นหา</button>' +
      '    </div>' +
      '  </form>' +
      '</section>' +
      /* panel */
      '<section class="p094-panel">' +
      '  <div class="p094-panel-header">' +
      '    <div class="p094-panel-heading">' +
      '      <div class="p094-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
      '      <div class="p094-panel-title">' +
      '        <h2>รายการ PO Dropship</h2>' +
      '        <p id="p094PanelSubtitle">ติ๊กเลือกข้อมูลที่ต้องการก่อนกด Print Preview</p>' +
      '      </div>' +
      '    </div>' +
      '    <div class="p094-panel-header-right">' +
      '      <span class="p094-badge" id="p094Badge">0 รายการ</span>' +
      '      <button class="p094-button p094-preview" id="p094PreviewButton" type="button"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>Print Preview</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p094-table-wrap" id="p094TableWrap">' +
      '    <table>' +
      '      <thead><tr>' +
      '        <th class="p094-check-cell"><input id="p094SelectAll" type="checkbox"></th>' +
      '        <th class="p094-sortable p094-center" data-sort="date">วันที่ PO <span class="p094-arrow"></span></th>' +
      '        <th class="p094-sortable" data-sort="poNo">เลขใบสำคัญ <span class="p094-arrow"></span></th>' +
      '        <th class="p094-sortable" data-sort="cusCode">รหัสลูกค้า <span class="p094-arrow"></span></th>' +
      '        <th class="p094-sortable" data-sort="cusName">ชื่อลูกค้า <span class="p094-arrow"></span></th>' +
      '        <th class="p094-sortable p094-number" data-sort="netSUM">มูลค่า <span class="p094-arrow"></span></th>' +
      '        <th>รายการสินค้า</th>' +
      '        <th class="p094-sortable p094-center" data-sort="printN">จำนวนพิมพ์ <span class="p094-arrow"></span></th>' +
      '        <th class="p094-sortable" data-sort="creditTerm">เงื่อนไขการชำระเงิน <span class="p094-arrow"></span></th>' +
      '      </tr></thead>' +
      '      <tbody id="p094Rows"></tbody>' +
      '    </table>' +
      '  </div>' +
      '  <div class="p094-pager" id="p094Pager"></div>' +
      '  <div class="p094-empty" id="p094Empty">' +
      '    <div>' +
      '      <svg viewBox="0 0 24 24" style="width:48px;height:48px;margin:0 auto 10px"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>' +
      '      <strong>ไม่พบรายการ PO ตามเงื่อนไข</strong>' +
      '      <p style="margin-top:5px;font-size:11px">ลองเปลี่ยนวันที่ หรือค้นหาด้วยเลขที่ใบสำคัญ</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p094-panel-footer">' +
      '    <span id="p094FooterText">แสดง 0 รายการ</span>' +
      '    <span class="p094-selected-chip" id="p094FooterSelected">เลือกแล้ว 0 รายการ</span>' +
      '  </div>' +
      '</section>' +
      '</div>';

    /* modal */
    if (!document.getElementById("p094Modal")) {
      var m = document.createElement("div");
      m.id = "p094Modal";
      m.className = "p094-modal-backdrop";
      m.innerHTML =
        '<section class="p094-modal">' +
        '  <div class="p094-modal-header">' +
        '    <h3>PO Dropship Print Preview</h3>' +
        '    <button class="p094-modal-close" id="p094ClosePreview" type="button">×</button>' +
        '  </div>' +
        '  <div class="p094-modal-toolbar">' +
        '    <span id="p094PreviewText">เลือกเอกสาร 0 ใบ</span>' +
        '    <button class="p094-print-btn" id="p094PrintButton" type="button">' +
        '      <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>พิมพ์เอกสาร' +
        '    </button>' +
        '  </div>' +
        '  <div class="p094-preview-area">' +
        '    <div class="p094-pages" id="p094Paper">' +
        '      <article class="p094-paper"><div class="p094-paper-placeholder">ยังไม่มีข้อมูล — กดค้นหาก่อน แล้วติ๊กรายการเพื่อดูรายละเอียด</div></article>' +
        '    </div>' +
        '  </div>' +
        '</section>';
      document.body.appendChild(m);
    }

    /* toast */
    if (!document.getElementById("p094Toast")) {
      var t = document.createElement("div");
      t.id = "p094Toast";
      t.className = "p094-toast";
      t.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg><span id="p094ToastMessage">ดำเนิการเรียบร้อยแล้ว</span>';
      document.body.appendChild(t);
    }

    /* refs */
    els.filterForm = root.querySelector("#p094FilterForm");
    els.searchButton = root.querySelector("#p094SearchButton");
    els.dateFrom = root.querySelector("#p094DateFrom");
    els.dateTo = root.querySelector("#p094DateTo");
    els.poNo = root.querySelector("#p094PoNo");
    els.previewButton = root.querySelector("#p094PreviewButton");
    // วันที่ PO เริ่มต้นเป็นวันที่ปัจจุบัน ทั้ง 2 ช่อง
    var now = new Date();
    function pad2(n) { return n < 10 ? "0" + n : "" + n; }
    var todayStr = now.getFullYear() + "-" + pad2(now.getMonth() + 1) + "-" + pad2(now.getDate());
    els.dateFrom.value = todayStr;
    els.dateTo.value = todayStr;
    els.rows = root.querySelector("#p094Rows");
    els.pager = root.querySelector("#p094Pager");
    els.tableWrap = root.querySelector("#p094TableWrap");
    els.empty = root.querySelector("#p094Empty");
    els.selectAll = root.querySelector("#p094SelectAll");
    els.panelSubtitle = root.querySelector("#p094PanelSubtitle");
    els.badge = root.querySelector("#p094Badge");
    els.footerText = root.querySelector("#p094FooterText");
    els.footerSelected = root.querySelector("#p094FooterSelected");
    els.modal = document.getElementById("p094Modal");
    els.paper = document.getElementById("p094Paper");
    els.previewText = document.getElementById("p094PreviewText");
    els.toast = document.getElementById("p094Toast");
    els.toastMsg = document.getElementById("p094ToastMessage");

    /* events */
    els.filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      // loading animation
      els.searchButton.classList.add("p094-loading");
      els.searchButton.innerHTML = '<span class="p094-spinner"></span>กำลังค้นหา...';
      setTimeout(function () {
        applyFilters(true).then(function () {
          els.searchButton.classList.remove("p094-loading");
          els.searchButton.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>ค้นหา';
        });
      }, 400);
    });

    els.rows.addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (!tr) return;
      var id = Number(tr.dataset.id);
      if (e.target.classList.contains("p094-row-check")) {
        // ไม่ re-render ตารางทั้งชุด — ติ๊กหลายรายการต่อเนื่องได้ (renderRows จะทำให้ checkbox หลุดจาก DOM)
        if (e.target.checked) state.selected.add(id);
        else state.selected.delete(id);
        updateSummary(sortItems(state.items));
        return;
      }
      state.currentId = id;
      renderRows();
    });

    els.selectAll.addEventListener("change", function () {
      state.items.forEach(function (it) {
        if (els.selectAll.checked) state.selected.add(it.id);
        else state.selected.delete(it.id);
      });
      renderRows();
    });

    Array.prototype.forEach.call(root.querySelectorAll("th[data-sort]"), function (h) {
      h.addEventListener("click", function () {
        var field = h.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDir = "asc";
        }
        state.page = 1;
        renderRows();
      });
    });

    els.previewButton.addEventListener("click", openPreview);
    document.getElementById("p094ClosePreview").addEventListener("click", closePreview);
    document.getElementById("p094PrintButton").addEventListener("click", function () { window.print(); });
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closePreview();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePreview();
    });

    // เปิดหน้ามาไม่มีข้อมูล — ผู้ใช้กดปุ่มค้นหาเอง
  }

  window.P094Dropship = { mount: mount };
})();
