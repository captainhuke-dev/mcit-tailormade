/* P093 — ใบอนุมัติ PO
 * UI เท่านั้น (mock data ตาม demo/P093-demo.html) — ไม่มี API/DB
 * window.P093PoApproval = { mount }
 */
(function () {
  "use strict";

  var CSS = [
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Italic.ttf') format('truetype');font-weight:400;font-style:italic}",
    ".p093-app{display:flex;flex-direction:column;gap:14px;font-family:inherit}",
    ".p093-app *{box-sizing:border-box}",
    /* launcher */
    ".p093-app .p093-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p093-app .p093-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p093-app .p093-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px}",
    ".p093-app .p093-launcher-title svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p093-app .p093-launcher-body{display:grid;grid-template-columns:1fr 1fr minmax(220px,auto);gap:14px 18px;padding:18px 22px;background:linear-gradient(180deg,#e4fbfd,#eefbfd)}",
    ".p093-app .p093-launcher-body > :nth-child(1){grid-column:1;grid-row:1}",
    ".p093-app .p093-launcher-body > :nth-child(2){grid-column:2;grid-row:1}",
    ".p093-app .p093-launcher-body > :nth-child(3){grid-column:3;grid-row:1}",
    ".p093-app .p093-launcher-body > :nth-child(4){grid-column:1;grid-row:2}",
    ".p093-app .p093-launcher-body > :nth-child(5){grid-column:2;grid-row:2}",
    ".p093-app .p093-launcher-body > :nth-child(6){grid-column:3;grid-row:2}",
    ".p093-app .p093-field label{display:block;margin-bottom:5px;color:#334155;font-size:12px;font-weight:700}",
    ".p093-app .p093-field input,.p093-app .p093-field select{width:100%;height:40px;padding:0 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p093-app .p093-field input:focus,.p093-app .p093-field select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p093-app .p093-unit-field{display:flex;align-items:center;gap:8px}",
    ".p093-app .p093-unit-field label{color:#334155;font-size:12px;font-weight:700;white-space:nowrap}",
    ".p093-app .p093-unit-field select{height:40px;min-width:150px;padding:0 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p093-app .p093-actions{display:flex;flex-direction:column;justify-content:flex-end;gap:10px}",
    ".p093-app .p093-button{display:flex;min-height:44px;align-items:center;justify-content:center;gap:8px;padding:0 15px;border-radius:10px;font-size:13px;font-weight:700;transition:.16s ease}",
    ".p093-app .p093-button:hover{transform:translateY(-1px);filter:brightness(.98)}",
    ".p093-app .p093-button.p093-search{color:#fff;border:0;background:linear-gradient(135deg,#38bdf8,#1e40af);box-shadow:0 8px 18px rgba(37,99,235,.23)}",
    ".p093-app .p093-actions .p093-search{height:40px;min-height:40px}",
    ".p093-app .p093-button.p093-preview{color:#fff;border:0;background:linear-gradient(135deg,#2563eb,#1e3a8a);box-shadow:0 8px 18px rgba(37,99,235,.23)}",
    ".p093-app .p093-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* panel */
    ".p093-app .p093-panel{display:flex;min-height:440px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p093-app .p093-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p093-app .p093-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p093-app .p093-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p093-app .p093-panel-title h2{font-size:14px}",
    ".p093-app .p093-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p093-app .p093-preview-group{display:flex;align-items:center;gap:10px}",
    ".p093-app .p093-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p093-app .p093-table-wrap table{width:100%;min-width:1040px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p093-app .p093-table-wrap th{position:sticky;top:0;z-index:2;padding:10px 12px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p093-app .p093-table-wrap th.p093-sortable{cursor:pointer}",
    ".p093-app .p093-table-wrap th.p093-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p093-app .p093-table-wrap th.p093-sorted{color:#1e40af;background:#e0ecff}",
    ".p093-app .p093-table-wrap th.p093-center,.p093-app .p093-table-wrap td.p093-center{text-align:center}",
    ".p093-app .p093-table-wrap th.p093-number,.p093-app .p093-table-wrap td.p093-number{text-align:right;font-family:Arial,sans-serif}",
    ".p093-app .p093-table-wrap td{max-width:370px;overflow:hidden;padding:7px 12px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p093-app .p093-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p093-app .p093-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p093-app .p093-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p093-app .p093-table-wrap tbody tr.p093-active td{color:#fff;background:#0878d1}",
    ".p093-app .p093-check-cell{width:42px;text-align:center}",
    ".p093-app .p093-check-cell input{width:16px;height:16px;accent-color:#2563eb;cursor:pointer}",
    ".p093-app .p093-po-no,.p093-app .p093-vendor-code{color:#1e40af;font-family:Arial,sans-serif;font-weight:700}",
    ".p093-app .p093-table-wrap tbody tr.p093-active .p093-po-no,.p093-app .p093-table-wrap tbody tr.p093-active .p093-vendor-code{color:#fff}",
    ".p093-app .p093-empty-state{display:none;min-height:250px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p093-app .p093-empty-state.p093-show{display:flex}",
    ".p093-app .p093-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p093-app .p093-empty-state strong{font-size:13px}",
    ".p093-app .p093-empty-state p{margin-top:5px;font-size:11px}",
    ".p093-app .p093-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p093-app .p093-selected{padding:5px 11px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-weight:700}",
    /* pager */
    ".p093-app .p093-pager{display:none;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border-top:1px solid #dbe3ef;background:#f8fafc}",
    ".p093-app .p093-pager button{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;color:#334155;border:1px solid #dbe3ef;border-radius:8px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.14s ease}",
    ".p093-app .p093-pager button:hover:not(:disabled){color:#2563eb;border-color:#94a3b8}",
    ".p093-app .p093-pager button.p093-page-active{color:#fff;border-color:#2563eb;background:#2563eb}",
    ".p093-app .p093-pager button:disabled{color:#b6c5d8;background:#f1f5f9;cursor:not-allowed}",
    /* search button loading */
    ".p093-app .p093-button.p093-loading{pointer-events:none;filter:saturate(.75)}",
    ".p093-app .p093-spinner{width:14px;height:14px;flex:0 0 auto;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:p093spin .8s linear infinite}",
    "@keyframes p093spin{to{transform:rotate(360deg)}}",
    /* toast (append ที่ body — หลีก transform ของ #appContent) */
    ".p093-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p093-toast.p093-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p093-toast svg{width:18px;height:18px;color:#34d399;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* preview modal (append ที่ body) */
    ".p093-modal-backdrop{position:fixed;inset:0;z-index:150;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}",
    ".p093-modal-backdrop.p093-show{display:grid}",
    ".p093-modal{display:flex;width:min(1000px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
    ".p093-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p093-modal-header h3{font-size:15px}",
    ".p093-modal-close{width:30px;height:30px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.2);font-size:18px}",
    ".p093-modal-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid #dbe3ef;background:#f8fafc}",
    ".p093-modal-toolbar span{color:#64748b;font-size:12px}",
    ".p093-print-btn{display:flex;height:35px;align-items:center;gap:7px;padding:0 13px;color:#fff;border:0;border-radius:8px;background:#2563eb;font-size:12px;font-weight:700}",
    ".p093-print-btn svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p093-preview-area{flex:1;overflow:auto;padding:24px;background:#94a3b8}",
    ".p093-paper{width:min(800px,100%);min-height:900px;margin:auto;padding:34px 38px;background:#fff;box-shadow:0 16px 35px rgba(15,23,42,.25);font-family:\"THSarabunNew\",sans-serif;font-size:12pt}",
    ".p093-paper-head{display:flex;justify-content:space-between;gap:20px;padding-bottom:16px;border-bottom:2px solid #2563eb}",
    ".p093-paper-head h1{color:#1e3a8a;font-size:22px}",
    ".p093-paper-head p{margin-top:3px;color:#64748b;font-size:12px}",
    ".p093-paper-no{height:max-content;padding:8px 12px;color:#1e40af;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-family:Arial,sans-serif;font-size:15px;font-weight:700}",
    ".p093-paper-info{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;margin:20px 0;font-size:13px}",
    ".p093-paper-info strong{color:#1e3a8a}",
    ".p093-paper table{min-width:0;border-collapse:collapse;white-space:normal}",
    ".p093-paper th,.p093-paper td{position:static;padding:8px;color:#172033;border:1px solid #cbd5e1;background:#fff;box-shadow:none;font-size:12pt}",
    ".p093-paper th{color:#1e3a8a;background:#eff6ff}",
    ".p093-paper td.p093-number{text-align:right;font-family:Arial,sans-serif}",
    ".p093-paper-total{margin-top:14px;color:#1e3a8a;font-size:15px;font-weight:700;text-align:right}",
    ".p093-report-body{margin-top:4px}",
    ".p093-report-table{width:auto;margin-bottom:14px}",
    ".p093-po-page{page-break-before:always;break-before:page}",
    ".p093-po-page:first-child{page-break-before:auto;break-before:auto}",
    ".p093-paper td.p093-title{font-size:14pt;font-weight:700;text-align:center}",
    ".p093-paper td.p093-status-cell{text-align:center}",
    ".p093-table-stk,.p093-table-stk th,.p093-table-stk td{font-family:\"THSarabunNew\",sans-serif;font-size:11pt}",
    ".p093-table-stk{border:0;border-bottom:1px solid #cbd5e1}",
    ".p093-table-stk th{border:1px solid #cbd5e1;background:transparent}",
    ".p093-table-stk td.p093-number{font-family:\"THSarabunNew\",sans-serif}",
    ".p093-table-stk td{border:0}",
    ".p093-report-body tr.p093-row-highlight td{background:transparent}",
    ".p093-report-body tr.p093-row-highlight td:nth-child(n+2){background:#f0f0f0}",
    ".p093-report-body tr.p093-row-sub td{color:#475569}",
    ".p093-report-loading{padding:24px;text-align:center;color:#64748b;font-size:13px}",
    ".p093-report-total{margin:6px 0 14px;color:#1e3a8a;font-size:14px;font-weight:700;text-align:right}",
    ".p093-price{display:inline-block;margin-right:14px;white-space:nowrap}",
    ".p093-approval-box{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:34px}",
    ".p093-approval-box div{min-height:85px;padding:10px;border:1px dashed #94a3b8;color:#64748b;font-size:11px;text-align:center}",
    /* print — พิมพ์เฉพาะ paper */
    "@media print{@page{size:A4 portrait;margin:10mm}body>*:not(#p093Modal){display:none}#p093Modal{position:static;padding:0;background:none}#p093Modal .p093-modal{display:block;width:100%;max-width:none;max-height:none;overflow:visible;box-shadow:none}#p093Modal .p093-modal-header,#p093Modal .p093-modal-toolbar{display:none}#p093Modal .p093-preview-area{overflow:visible;padding:0;background:none}#p093Paper{width:100%;min-height:0;padding:0;box-shadow:none}}",
    /* screen — แสดงขีดแบ่งหน้ากระดาษาใน modal */
    "@media screen{.p093-report-body .p093-po-page + .p093-po-page{margin-top:28px;padding-top:20px;border-top:2px dashed #94a3b8}}",
    /* responsive (ตาม demo) */
    "@media (max-width:900px){.p093-app .p093-launcher-body{grid-template-columns:1fr}.p093-app .p093-launcher-body > *{grid-column:auto;grid-row:auto}.p093-app .p093-actions{flex-direction:row}.p093-app .p093-actions .p093-button{flex:1}}",
    "@media (max-width:680px){.p093-modal-backdrop{padding:8px}.p093-preview-area{padding:12px}.p093-paper{padding:20px}.p093-paper-info{grid-template-columns:1fr}}"
  ].join("\n");

  /* ---------- API (MAC-5) ---------- */
  var CONNECTION_ID = "c1788406814359"; // MAC5 (sqlserver, M5CM-AA-01)

  function fetchJson(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ connectionId: CONNECTION_ID }, body))
    }).then(function (r) { return r.json(); });
  }


  var state = {
    items: [],
    selected: null,
    currentId: null,
    sortField: "date",
    sortDirection: "asc",
    page: 1
  };
  var PAGE_SIZE = 15;
  var els = {};
  var toastTimer = null;
  var money = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function fmt(v) {
    return money.format(Number(v || 0));
  }
  function fmtQty(v) {
    var s = (Number(v) || 0).toFixed(2);
    if (s.indexOf(".") !== -1) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s;
  }
  function dateTH(v) {
    var p = String(v || "").split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : v;
  }
  function showToast(message) {
    els.toastMessage.textContent = message;
    clearTimeout(toastTimer);
    els.toast.classList.add("p093-show");
    toastTimer = setTimeout(function () { els.toast.classList.remove("p093-show"); }, 1900);
  }

  function sortItems(list) {
    return list.slice().sort(function (a, b) {
      var first = a[state.sortField];
      var second = b[state.sortField];
      if (typeof first === "string") {
        first = first.toLowerCase();
        second = second.toLowerCase();
      }
      if (first < second) return state.sortDirection === "asc" ? -1 : 1;
      if (first > second) return state.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  function updateSortIndicators() {
    Array.prototype.forEach.call(els.root.querySelectorAll("th[data-sort]"), function (th) {
      var active = th.getAttribute("data-sort") === state.sortField;
      th.classList.toggle("p093-sorted", active);
      var arrow = th.querySelector(".p093-arrow");
      if (arrow) arrow.textContent = active ? (state.sortDirection === "asc" ? "▲" : "▼") : "";
    });
  }

  function updateSummary(list) {
    var chosen = list.filter(function (x) { return state.selected.has(x.id); }).length;
    els.footerText.textContent = "แสดง " + list.length + " รายการ";
    els.footerSelected.textContent = "เลือกแล้ว " + chosen + " รายการ";
    els.selectAll.checked = list.length > 0 && chosen === list.length;
    els.selectAll.indeterminate = chosen > 0 && chosen < list.length;
  }

  function renderRows() {
    var sorted = sortItems(state.items);
    els.rows.innerHTML = "";
    updateSortIndicators();

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.empty.classList.add("p093-show");
      els.pager.style.display = "none";
      updateSummary([]);
      return;
    }
    els.tableWrap.style.display = "block";
    els.empty.classList.remove("p093-show");

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page < 1) state.page = 1;
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(start, start + PAGE_SIZE);

    if (!pageItems.some(function (it) { return it.id === state.currentId; })) {
      state.currentId = pageItems[0].id;
    }

    pageItems.forEach(function (item) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", item.id);
      if (item.id === state.currentId) tr.classList.add("p093-active");
      var checked = state.selected.has(item.id) ? "checked" : "";
      tr.innerHTML =
        '<td class="p093-check-cell"><input class="p093-row-check" type="checkbox" ' + checked + '></td>' +
        '<td class="p093-center">' + dateTH(item.date) + "</td>" +
        '<td class="p093-po-no">' + esc(item.poNo) + "</td>" +
        '<td class="p093-vendor-code">' + esc(item.vendorCode) + "</td>" +
        '<td title="' + esc(item.vendorName) + '">' + esc(item.vendorName) + "</td>" +
        '<td title="' + esc(item.memo) + '">' + esc(item.memo) + "</td>";
      els.rows.appendChild(tr);
    });

    els.pager.style.display = "flex";
    renderPagination(sorted.length);
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
      if (active) b.classList.add("p093-page-active");
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
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    state.page = p;
    renderRows();
  }

  var SEARCH_BTN_HTML = "";
  function setSearching(on) {
    var btn = els.searchButton;
    if (!btn) return;
    if (on) {
      if (!SEARCH_BTN_HTML) SEARCH_BTN_HTML = btn.innerHTML;
      btn.classList.add("p093-loading");
      btn.innerHTML = '<span class="p093-spinner"></span>กำลังค้นหา...';
    } else {
      btn.classList.remove("p093-loading");
      if (SEARCH_BTN_HTML) btn.innerHTML = SEARCH_BTN_HTML;
    }
  }

  function loadData(showMessage) {
    setSearching(true);
    state.page = 1;
    fetchJson("api/p093_search.php", {
      dateFrom: els.dateFrom.value,
      dateTo: els.dateTo.value,
      vnos: els.poNo.value.trim(),
      cus: els.vendorCode.value.trim(),
      name: els.vendorName.value.trim()
    }).then(function (res) {
      setSearching(false);
      if (!res.ok) {
        showToast("โหลดข้อมูลไม่สำเร็จ: " + (res.error || "ข้อผิดพลาด"));
        return;
      }
      state.items = (res.rows || []).map(function (r, i) {
        return {
          id: i,
          date: r.date,
          poNo: r.poNo,
          vendorCode: r.vendorCode,
          vendorName: r.vendorName,
          memo: r.memo || ""
        };
      });
      state.currentId = null;
      renderRows();
      if (showMessage) showToast("พบ PO " + state.items.length + " รายการ");
    }).catch(function (e) {
      setSearching(false);
      showToast("เกิดข้อผิดพลาด: " + e.message);
    });
  }

  var UNIT_CODE = { "หน่วยหลัก": 0, "หน่วยย่อย": 1, "หน่วยรอง": 2 };

  function openPreview() {
    // ขั้นตอน 1 (C# btn_preview_Click): ตรวจว่ามีการเลือกข้อมูลไหม
    if (state.selected.size === 0) {
      showToast("โปรดเลือกข้อมูล");
      return;
    }
    // แสดงทุก PO ที่เลือกมาในรายงานเดียว
    var list = state.items.filter(function (x) { return state.selected.has(x.id); });
    els.previewText.textContent = "เลือกเอกสาร " + list.length + " ใบ · แสดง " + list.map(function (p) { return p.poNo; }).join(" / ");
    els.modal.classList.add("p093-show");
    document.body.style.overflow = "hidden";

    // โหลดฟอนต์ THSarabunNew (จาก assets/fonts) ก่อน render รายงาน
    if (document.fonts && document.fonts.load) {
      document.fonts.load('12pt "THSarabunNew').catch(function () {});
    }

    var unitCode = UNIT_CODE[els.unitSelect.value];
    if (unitCode === undefined) unitCode = 1;

    els.reportBody.innerHTML = '<div class="p093-report-loading">กำลังสร้างรายงาน...</div>';

    // ทุก PO ที่เลือก: ดึงรายละเอียด + sub-detail แล้ว render รวมในรายงานเดียว
    var poJobs = list.map(function (po) {
      var pDetail = fetchJson("api/p093_detail.php", { vnos: po.poNo, cus: po.vendorCode, unit: unitCode })
        .then(function (res) {
          if (!res.ok) return { po: po, ok: false, error: res.error || "ข้อผิดพลาด" };
          var rows = res.rows || [];
          if (!rows.length) return { po: po, ok: true, rows: [], subs: [] };
          var subJobs = rows.map(function (r) {
            var pSub = fetchJson("api/p093_subdetail.php", { stk: r.stkCode, unit: unitCode });
            var cSub = pSub.catch(function () { return { ok: false, error: "ดึง sub-detail ล้มเหลว" }; });
            var pRe = fetchJson("api/p093_re.php", { stk: r.stkCode, vnos: po.poNo, unit: unitCode });
            var cRe = pRe.catch(function () { return { ok: false, error: "ดึง RE ล้มเหลว" }; });
            return Promise.all([cSub, cRe]).then(function (rr) {
              return { sub: rr[0], re: rr[1] };
            });
          });
          return Promise.all(subJobs).then(function (subs) {
            return { po: po, ok: true, rows: rows, subs: subs };
          });
        })
        .catch(function (e) { return { po: po, ok: false, error: e.message }; });
      return pDetail;
    });
    Promise.all(poJobs).then(function (dataList) {
      var parts = [];
      dataList.forEach(function (d) {
        if (!d.ok) {
          parts.push('<div class="p093-report-loading">' + esc(d.error) + '</div>');
          return;
        }
        if (!d.rows.length) {
          parts.push('<div class="p093-report-loading">ไม่มีรายละเอียดสินค้า</div>');
          return;
        }
        renderReport(d.po, d.rows, d.subs, unitCode, parts);
      });
      els.reportBody.innerHTML = parts.join('');
    });
  }

  function renderReport(po, rows, results, unitCode, out) {

    // วันที่เอกสาร (dd/MM/yyyy)
    var d = new Date(po.date + "T00:00:00");
    var dateStr = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

    // หน้ากระดาษาใหม่ต่อ PO (page-break)
    out.push('<div class="p093-po-page">');
    // (1) ตาราง 1 — vendor (4 คอลั่น: 80f, 100f, 185f, 185f)
    out.push('<table class="p093-report-table p093-table-vendor">');
    out.push('<colgroup><col style="width:80pt"><col style="width:100pt"><col style="width:185pt"><col style="width:185pt"></colgroup>');
    out.push('<tbody>');
    out.push('<tr><td colspan="2">วันที่เอกสาร : ' + dateStr + '</td><td class="p093-title">ใบอนุมัติ PO</td><td>เลขที่เอกสาร : ' + esc(po.poNo) + '</td></tr>');
    out.push('<tr><td>Vendor</td><td colspan="3">' + esc(po.vendorCode) + ' : ' + esc(po.vendorName) + '</td></tr>');
    out.push('<tr><td>Internal Memo<br>Remark</td><td colspan="3">' + esc(po.memo || '') + '</td></tr>');
    out.push('</tbody></table>');

    // (2) ตาราง 2 — stk (11 คอลั่น: 35, 25, 50, 70, 155, 40, 30, 30, 35, 30, 50 pt)
    out.push('<table class="p093-report-table p093-table-stk">');
    out.push('<colgroup><col style="width:35pt"><col style="width:25pt"><col style="width:50pt"><col style="width:70pt"><col style="width:155pt"><col style="width:40pt"><col style="width:30pt"><col style="width:30pt"><col style="width:35pt"><col style="width:30pt"><col style="width:50pt"></colgroup>');
    out.push('<thead><tr><th>รหัสสินค้า</th><th>สโตร์</th><th>วันที่</th><th>เลขที่ใบสำคัญ</th><th>รายละเอียด</th><th>หน่วย</th><th>PO</th><th>RE</th><th>คงค้าง</th><th>สถานะ</th><th>กำหนดส่ง</th></tr></thead>');
    out.push('<tbody>');
    rows.forEach(function (r, i) {
      var pair = results[i] || {};
      var sub = pair.sub || { ok: false };
      var re = pair.re || { ok: false };
      var conv = Number(r.conv) || 1;
      var req = (Number(r.req) || 0) / conv;
      var cut = (Number(r.cut) || 0) / conv;
      var diff = req - cut;
      // แถวหลัก
      out.push('<tr><td>' + esc(r.stkCode) + '</td>' +
        '<td colspan="4">' + esc(r.desc) + '</td>' +
        '<td>' + esc(r.unit) + '</td>' +
        '<td class="p093-number">' + fmtQty(req) + '</td>' +
        '<td class="p093-number">' + fmtQty(cut) + '</td>' +
        '<td class="p093-number">' + fmtQty(diff) + '</td>' +
        '<td class="p093-status-cell">&nbsp;</td><td>&nbsp;</td></tr>');
      // แถว PO (loop) — ไฮไลต์แถวที่เป็น PO ปัจจุบัน
      if (sub.ok) {
        (sub.rows || []).filter(function (s) { return s.vnos === po.poNo; }).forEach(function (s) {
          var sconv = Number(s.conv) || 1;
          var sreq = (Number(s.req) || 0) / sconv;
          var scut = (Number(s.cut) || 0) / sconv;
          var sdiff = sreq - scut;
          var isCur = s.vnos === po.poNo;
          out.push('<tr class="p093-row-sub' + (isCur ? ' p093-row-highlight' : '') + '">' +
            '<td>&nbsp;</td>' +
            '<td>' + esc(s.sto) + '</td>' +
            '<td>' + esc(s.date) + '</td>' +
            '<td>' + esc(s.vnos) + '</td>' +
            '<td>' + esc(s.desc) + '</td>' +
            '<td>' + esc(s.unit) + '</td>' +
            '<td class="p093-number">' + fmtQty(sreq) + '</td>' +
            '<td class="p093-number">' + fmtQty(scut) + '</td>' +
            '<td class="p093-number">' + fmtQty(sdiff) + '</td>' +
            '<td class="p093-status-cell">' + esc(s.status) + '</td>' +
            '<td>' + esc(s.delivDate) + '</td></tr>');
        });
      }
      // แถว RE (loop) — ต่อจาก PO loop ตาม C# (getVnosRE)
      if (re.ok) {
        (re.rows || []).forEach(function (x) {
          out.push('<tr class="p093-row-sub">' +
            '<td>&nbsp;</td>' +
            '<td>' + esc(x.sto) + '</td>' +
            '<td>' + esc(dateTH(x.date)) + '</td>' +
            '<td>' + esc(x.vnos) + '</td>' +
            '<td>' + esc(x.desc) + '</td>' +
            '<td>&nbsp;</td>' +
            '<td class="p093-number">&nbsp;</td>' +
            '<td class="p093-number">' + fmtQty(x.re) + '</td>' +
            '<td class="p093-number">&nbsp;</td>' +
            '<td class="p093-status-cell">&nbsp;</td>' +
            '<td>&nbsp;</td></tr>');
        });
      }
    });
    out.push('</tbody></table>');
    out.push('</div>');
  }

  function closePreview() {
    els.modal.classList.remove("p093-show");
    document.body.style.overflow = "";
  }

  function injectStyle() {
    if (document.getElementById("p093Style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "p093Style";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  function mount(root) {
    injectStyle();
    els.root = root;
    state.selected = new Set();
    state.items = [];
    state.currentId = null;
    root.innerHTML =
      '<div class="p093-app">' +
      /* launcher */
      '<section class="p093-launcher">' +
      '  <div class="p093-launcher-title">' +
      '    <strong><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg>ใบอนุมัติ PO</strong>' +
      '  </div>' +
      '  <form class="p093-launcher-body" id="p093FilterForm">' +
      '    <div class="p093-field">' +
      '      <label>วันที่ PO</label>' +
      '      <input id="p093DateFrom" type="date">' +
      '    </div>' +
      '    <div class="p093-field">' +
      '      <label>ถึง</label>' +
      '      <input id="p093DateTo" type="date">' +
      '    </div>' +
      '    <div class="p093-field">' +
      '      <label>เลขที่ PO</label>' +
      '      <input id="p093PoNo" type="text" placeholder="เช่น PO016911-0368">' +
      '    </div>' +
      '    <div class="p093-field">' +
      '      <label>รหัส Vendor</label>' +
      '      <input id="p093VendorCode" type="text" placeholder="เช่น V0100461">' +
      '    </div>' +
      '    <div class="p093-field">' +
      '      <label>ชื่อ Vendor</label>' +
      '      <input id="p093VendorName" type="text" placeholder="ค้นหาชื่อผู้ขาย">' +
      '    </div>' +
      '    <div class="p093-actions">' +
      '      <button class="p093-button p093-search" id="p093SearchButton" type="submit"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>ค้นหา</button>' +
      '    </div>' +
      '  </form>' +
      '</section>' +
      /* panel */
      '<section class="p093-panel">' +
      '  <div class="p093-panel-header">' +
      '    <div class="p093-panel-heading">' +
      '      <div class="p093-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
      '      <div class="p093-panel-title">' +
      '        <h2>รายการใบสั่งซื้อ PO</h2>' +
      '        <p id="p093PanelSubtitle">ติ๊กเลือก PO ที่ต้องการแสดงตัวอย่าง</p>' +
      '      </div>' +
      '    </div>' +
      '    <div class="p093-preview-group">' +
      '      <div class="p093-unit-field">' +
      '        <label>เลือกหน่วย</label>' +
      '        <select id="p093UnitSelect">' +
      '          <option value="หน่วยย่อย" selected>หน่วยย่อย</option>' +
      '          <option value="หน่วยหลัก">หน่วยหลัก</option>' +
      '          <option value="หน่วยรอง">หน่วยรอง</option>' +
      '        </select>' +
      '      </div>' +
      '      <button class="p093-button p093-preview" id="p093PreviewButton" type="button"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>Preview</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p093-table-wrap" id="p093TableWrap">' +
      '    <table>' +
      '      <thead><tr>' +
      '        <th class="p093-check-cell"><input id="p093SelectAll" type="checkbox"></th>' +
      '        <th class="p093-sortable p093-center" data-sort="date">วันที่ PO <span class="p093-arrow"></span></th>' +
      '        <th class="p093-sortable" data-sort="poNo">เลขที่ PO <span class="p093-arrow"></span></th>' +
      '        <th class="p093-sortable" data-sort="vendorCode">รหัส Vendor <span class="p093-arrow"></span></th>' +
      '        <th class="p093-sortable" data-sort="vendorName">ชื่อ Vendor <span class="p093-arrow"></span></th>' +
      '        <th>Memo</th>' +
      '      </tr></thead>' +
      '      <tbody id="p093Rows"></tbody>' +
      '    </table>' +
      '  </div>' +
      '  <div class="p093-pager" id="p093Pager"></div>' +
      '  <div class="p093-empty-state" id="p093Empty">' +
      '    <div>' +
      '      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>' +
      '      <strong>ไม่พบรายการ PO ตามเงื่อนไข</strong>' +
      '      <p>ลองปรับวันที่ เลขที่ PO หรือข้อมูล Vendor</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p093-panel-footer">' +
      '    <span id="p093FooterText">แสดง 0 รายการ</span>' +
      '    <span class="p093-selected" id="p093FooterSelected">เลือกแล้ว 0 รายการ</span>' +
      '  </div>' +
      '</section>' +
      '</div>';

    // toast (append ที่ body — หลีก transform ของ #appContent)
    if (!document.getElementById("p093Toast")) {
      var t = document.createElement("div");
      t.id = "p093Toast";
      t.className = "p093-toast";
      t.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg><span id="p093ToastMessage">ดำเนินการเรียบร้อยแล้ว</span>';
      document.body.appendChild(t);
    }

    // preview modal (append ที่ body)
    if (!document.getElementById("p093Modal")) {
      var m = document.createElement("div");
      m.id = "p093Modal";
      m.className = "p093-modal-backdrop";
      m.innerHTML =
        '<section class="p093-modal">' +
        '  <div class="p093-modal-header">' +
        '    <h3>Preview ใบอนุมัติ PO</h3>' +
        '    <button class="p093-modal-close" id="p093ClosePreview" type="button">×</button>' +
        '  </div>' +
        '  <div class="p093-modal-toolbar">' +
        '    <span id="p093PreviewText">เลือกเอกสาร 0 ใบ</span>' +
        '    <button class="p093-print-btn" id="p093PrintButton" type="button">' +
        '      <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>พิมพ์เอกสาร' +
        '    </button>' +
        '  </div>' +
        '  <div class="p093-preview-area">' +
        '    <article class="p093-paper" id="p093Paper">' +
        '      <div class="p093-report-body" id="p093ReportBody"></div>' +
        '    </article>' +
        '  </div>' +
        '</section>';
      document.body.appendChild(m);
    }

    els.filterForm = root.querySelector("#p093FilterForm");
    els.searchButton = root.querySelector("#p093SearchButton");
    els.pager = root.querySelector("#p093Pager");
    els.dateFrom = root.querySelector("#p093DateFrom");
    els.dateTo = root.querySelector("#p093DateTo");
    els.poNo = root.querySelector("#p093PoNo");
    els.vendorCode = root.querySelector("#p093VendorCode");
    els.vendorName = root.querySelector("#p093VendorName");
    els.unitSelect = root.querySelector("#p093UnitSelect");
    els.previewButton = root.querySelector("#p093PreviewButton");
    els.rows = root.querySelector("#p093Rows");
    els.tableWrap = root.querySelector("#p093TableWrap");
    els.empty = root.querySelector("#p093Empty");
    els.footerText = root.querySelector("#p093FooterText");
    els.footerSelected = root.querySelector("#p093FooterSelected");
    els.selectAll = root.querySelector("#p093SelectAll");
    els.toast = document.getElementById("p093Toast");
    els.toastMessage = document.getElementById("p093ToastMessage");
    els.modal = document.getElementById("p093Modal");
    els.previewText = document.getElementById("p093PreviewText");
    els.closePreview = document.getElementById("p093ClosePreview");
    els.printButton = document.getElementById("p093PrintButton");
    els.reportBody = document.getElementById("p093ReportBody");

    // events
    els.filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      loadData(true);
    });
    els.rows.addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (!tr) return;
      var id = Number(tr.getAttribute("data-id"));
      if (e.target.classList.contains("p093-row-check")) {
        if (e.target.checked) state.selected.add(id);
        else state.selected.delete(id);
      } else {
        state.currentId = id;
      }
      renderRows();
    });
    els.selectAll.addEventListener("change", function () {
      if (els.selectAll.checked) {
        state.items.forEach(function (x) { state.selected.add(x.id); });
      } else {
        state.items.forEach(function (x) { state.selected.delete(x.id); });
      }
      renderRows();
    });
    Array.prototype.forEach.call(root.querySelectorAll("th[data-sort]"), function (th) {
      th.addEventListener("click", function () {
        var field = th.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDirection = "asc";
        }
        renderRows();
      });
    });
    els.previewButton.addEventListener("click", openPreview);
    els.closePreview.addEventListener("click", closePreview);
    els.printButton.addEventListener("click", function () { window.print(); });
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closePreview();
    });
    var escHandler = function (e) { if (e.key === "Escape") closePreview(); };
    document.addEventListener("keydown", escHandler);

    // ค่าเริ่มต้น — วันที่เริ่ม = วันที่ปัจจุบัน - 1, วันที่สุดท้าย = วันที่ปัจจุบัน
    var now = new Date();
    var from = new Date(now.getTime() - 86400000);
    function iso(d) {
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
    els.dateFrom.value = iso(from);
    els.dateTo.value = iso(now);
    // เปิดหน้ามาไม่มีข้อมูล — ผู้ใช้กดปุ่มค้นหาเอง
  }

  window.P093PoApproval = { mount: mount };
})();
