/* P040 — ตรวจสอบค้างส่งสินค้า LOT (UI เท่านั้น, mock data — ยังไม่เชื่อม API) */
(function () {
  "use strict";

  /* ---------- API (MAC-5) ---------- */
  var CONNECTION_ID = "c1788406814359"; // MAC5 (sqlserver, M5CM-AA-01)

  function apiPost(path, body) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ connectionId: CONNECTION_ID }, body || {}))
    }).then(function (r) { return r.json(); });
  }

  var state = {
    current: [],
    currentId: 1,
    sortField: "document",
    sortDir: "asc",
    selected: new Set(),
    page: 1,
    zoom: 100
  };

  var els = {};
  var toastTimer = null;
  var PAGE_SIZE = 15;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function injectStyle() {
    var css = [
      ".p040-app{font-family:inherit}",
      /* launcher */
      ".p040-app .p040-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
      ".p040-app .p040-launcher-title{display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
      ".p040-app .p040-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px}",
      ".p040-app .p040-launcher-title svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      ".p040-app .p040-close{display:grid;width:31px;height:31px;place-items:center;color:#fff;border:0;border-radius:8px;background:#dc2626;font-size:18px;cursor:pointer}",
      ".p040-app .p040-launcher-body{display:grid;grid-template-columns:minmax(480px,1fr) auto;gap:24px;align-items:center;padding:18px 22px;background:linear-gradient(180deg,#e4fbfd,#eefbfd)}",
      ".p040-app .p040-filter-section{display:grid;grid-template-columns:1fr;gap:12px;padding:14px 16px;border:1px solid #b9ddeb;border-radius:13px;background:rgba(255,255,255,.78)}",
      ".p040-app .p040-filter-row{display:flex;align-items:flex-start;gap:14px}",
      ".p040-app .p040-filter-label{width:78px;padding-top:5px;color:#334155;font-size:12px;font-weight:700}",
      ".p040-app .p040-group-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:5px 2px;flex:1;min-width:0;padding:7px 10px;border:1px solid #b6c5d8;border-radius:8px;background:#fff}",
      ".p040-app .p040-check-option{display:flex;align-items:center;gap:6px;color:#334155;font-size:12px;cursor:pointer}",
      ".p040-app .p040-check-option input{width:15px;height:15px;accent-color:#2563eb;cursor:pointer}",
      ".p040-app .p040-radio-box{display:flex;flex-wrap:wrap;gap:18px;padding:8px 10px;border:1px solid #b6c5d8;border-radius:8px;background:#fff}",
      ".p040-app .p040-radio-option{display:flex;align-items:center;gap:6px;color:#334155;font-size:12px;cursor:pointer}",
      ".p040-app .p040-radio-option input{width:15px;height:15px;accent-color:#2563eb;cursor:pointer}",
      ".p040-app .p040-actions{display:flex;gap:11px}",
      ".p040-app .p040-button{display:flex;min-width:122px;height:48px;align-items:center;justify-content:center;gap:8px;padding:0 16px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:.16s ease}",
      ".p040-app .p040-button:hover{transform:translateY(-1px);filter:brightness(.98)}",
      ".p040-app .p040-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      ".p040-app .p040-button.p040-search{color:#fff;border:0;background:linear-gradient(135deg,#38bdf8,#1e40af);box-shadow:0 8px 18px rgba(37,99,235,.23)}",
      ".p040-app .p040-button.p040-preview{color:#fff;border:0;background:#16a34a;box-shadow:0 8px 18px rgba(22,163,74,.25)}",
      ".p040-app .p040-button.p040-loading{pointer-events:none;opacity:.75}",
      ".p040-app .p040-spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:p040spin .8s linear infinite}",
      "@keyframes p040spin{to{transform:rotate(360deg)}}",
      /* panel */
      ".p040-app .p040-panel{display:flex;min-height:430px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
      ".p040-app .p040-panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:60px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
      ".p040-app .p040-header-actions{display:flex;align-items:center;gap:12px}",
      ".p040-app .p040-panel-header .p040-button{min-width:0;min-height:34px;height:34px;padding:0 12px;font-size:12px}",
      ".p040-app .p040-panel-header .p040-button svg{width:14px;height:14px}",
      ".p040-app .p040-panel-heading{display:flex;align-items:center;gap:10px}",
      ".p040-app .p040-panel-icon{display:grid;width:36px;height:36px;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
      ".p040-app .p040-panel-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      ".p040-app .p040-panel-title h2{font-size:14px}",
      ".p040-app .p040-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
      ".p040-app .p040-badge{padding:5px 11px;color:#1e40af;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700}",
      ".p040-app .p040-table-wrap{min-height:0;flex:1;overflow:auto}",
      ".p040-app .p040-table-wrap table{width:100%;min-width:1080px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
      ".p040-app .p040-table-wrap th{position:sticky;top:0;z-index:2;padding:10px 12px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;font-size:12px;font-weight:700;text-align:left;user-select:none}",
      ".p040-app .p040-table-wrap th.sortable{cursor:pointer}",
      ".p040-app .p040-table-wrap th.sortable:hover{color:#2563eb;background:#eef5ff}",
      ".p040-app .p040-table-wrap th.sorted{color:#1e40af;background:#e0ecff}",
      ".p040-app .p040-table-wrap th.center,.p040-app .p040-table-wrap td.center{text-align:center}",
      ".p040-app .p040-table-wrap th.number,.p040-app .p040-table-wrap td.number{text-align:right;font-family:Arial,sans-serif}",
      ".p040-app .p040-table-wrap td{max-width:390px;overflow:hidden;padding:7px 12px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
      ".p040-app .p040-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
      ".p040-app .p040-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
      ".p040-app .p040-table-wrap tbody tr:hover{background:#f0f7ff}",
      ".p040-app .p040-table-wrap tbody tr.p040-active td{color:#fff;background:#0878d1}",
      ".p040-app .p040-doc-no,.p040-app .p040-product-code{color:#1e40af;font-family:Arial,sans-serif;font-weight:700}",
      ".p040-app .p040-qty{color:#047857;font-family:Arial,sans-serif;font-weight:700}",
      ".p040-app .p040-pending{color:#dc2626;font-family:Arial,sans-serif;font-weight:700}",
      ".p040-app .p040-table-wrap tbody tr.p040-active .p040-doc-no,.p040-app .p040-table-wrap tbody tr.p040-active .p040-product-code,.p040-app .p040-table-wrap tbody tr.p040-active .p040-qty,.p040-app .p040-table-wrap tbody tr.p040-active .p040-pending{color:#fff}",
      ".p040-app .p040-panel-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:50px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
      /* pager */
      ".p040-app .p040-pager{display:none;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border-top:1px solid #dbe3ef;background:#f8fafc}",
      ".p040-app .p040-pager button{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;color:#334155;border:1px solid #dbe3ef;border-radius:8px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.14s ease}",
      ".p040-app .p040-pager button:hover:not(:disabled){color:#2563eb;border-color:#94a3b8}",
      ".p040-app .p040-pager button.p040-page-active{color:#fff;border-color:#2563eb;background:#2563eb}",
      ".p040-app .p040-pager button:disabled{color:#b6c5d8;background:#f1f5f9;cursor:not-allowed}",
      /* modal */
      ".p040-app .p040-modal{position:fixed;inset:0;z-index:1000;display:none;padding:20px;overflow:auto;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}",
      ".p040-app .p040-modal.p040-show{display:flex}",
      ".p040-app .p040-modal-box{display:flex;width:min(1120px,100%);max-height:calc(100vh - 40px);flex-direction:column;overflow:hidden;margin:auto;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
      ".p040-app .p040-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
      ".p040-app .p040-modal-header h3{font-size:15px}",
      ".p040-app .p040-modal-close{width:30px;height:30px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px;cursor:pointer}",
      ".p040-app .p040-preview-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid #dbe3ef;background:#f8fafc}",
      ".p040-app .p040-preview-toolbar span{color:#64748b;font-size:12px}",
      ".p040-app .p040-toolbar-right{display:flex;align-items:center;gap:9px}",
      ".p040-app .p040-zoom-group{display:flex;align-items:center;gap:3px;padding:3px;border:1px solid #cbd5e1;border-radius:9px;background:#fff}",
      ".p040-app .p040-zoom-btn{display:grid;place-items:center;width:28px;height:28px;color:#1e3a8a;border:0;border-radius:7px;background:#eff6ff;font-size:16px;font-weight:700;line-height:1;cursor:pointer}",
      ".p040-app .p040-zoom-btn:hover{background:#dbeafe}",
      ".p040-app .p040-zoom-btn:disabled{color:#94a3b8;background:#f1f5f9;cursor:default}",
      ".p040-app .p040-zoom-val{min-width:46px;text-align:center;color:#334155;font-size:12px;font-weight:700}",
      ".p040-app .p040-zoom-fit{height:28px;padding:0 9px;color:#1e3a8a;border:0;border-radius:7px;background:#e0ecff;font-size:11px;font-weight:700;cursor:pointer}",
      ".p040-app .p040-zoom-fit:hover{background:#c7ddfb}",
      ".p040-app .p040-print-btn{display:flex;height:35px;align-items:center;gap:7px;padding:0 13px;color:#fff;border:0;border-radius:8px;background:#2563eb;font-size:12px;font-weight:700;cursor:pointer}",
      ".p040-app .p040-print-btn svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      ".p040-app .p040-preview-area{min-height:0;flex:1;overflow:auto;padding:25px;background:#94a3b8}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal}",
      ".p040-app .p040-paper-stack{display:flex;flex-direction:column;align-items:center;gap:18px}",
      ".p040-app .p040-paper{position:relative;box-sizing:border-box;width:297mm;height:210mm;padding:30pt 20pt;overflow:hidden;background:#fff;box-shadow:0 16px 35px rgba(15,23,42,.25);font-family:'THSarabunNew',sans-serif;color:#000;transform-origin:top center}",
      ".p040-app .p040-paper-body{height:100%;overflow:hidden}",
      ".p040-app .p040-paper-table{width:780pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
      ".p040-app .p040-paper-table td,.p040-app .p040-paper-table th{padding:1pt 2pt;border:0;font-size:14pt;font-weight:400;line-height:1.15;text-align:left;vertical-align:top;word-break:break-word}",
      ".p040-app .p040-paper-table tr.p040-r-title td{padding:0 0 2pt;font-size:18pt;font-weight:700;text-align:center;line-height:1.15}",
      ".p040-app .p040-paper-table tr.p040-r-meta td{padding:0 0 5pt;font-size:14pt;font-weight:700;line-height:1.15}",
      ".p040-app .p040-paper-table tr.p040-r-head th{border:.5pt solid #000;font-size:14pt;font-weight:700;line-height:1.1;text-align:center}",
      ".p040-app .p040-paper-table .p040-c-center{text-align:center}",
      ".p040-app .p040-paper-table .p040-c-right{padding-right:10pt;text-align:right}",
      ".p040-app .p040-paper-table .p040-c-seq{padding-left:10pt}",
      ".p040-app .p040-paper-page{position:absolute;top:34pt;left:740pt;width:120pt;text-align:center;font-size:12pt;line-height:1.2}",
      /* toast */
      ".p040-app .p040-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
      ".p040-app .p040-toast.p040-show{visibility:visible;opacity:1;transform:translateY(0)}",
      ".p040-app .p040-toast svg{width:16px;height:16px;color:#34d399;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      /* print — พิมพ์จาก #p040PrintRoot (clone วางท้าย body) ทีละหน้า A4 landscape */
      "@media print{@page{size:A4 landscape;margin:0}html,body{margin:0 !important;padding:0 !important;background:#fff !important}body>*{display:none !important}#p040PrintRoot{display:block !important}#p040PrintRoot .p040-paper{width:297mm;height:210mm;margin:0 !important;box-shadow:none;transform:none !important;page-break-after:always;break-after:page;break-inside:avoid}#p040PrintRoot .p040-paper:last-child{page-break-after:auto;break-after:auto}}"
    ];
    var style = document.createElement("style");
    style.textContent = css.join("\n");
    document.head.appendChild(style);
  }

  function loadGroups() {
    return apiPost("p040_groups.php")
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "โหลดกลุ่มสินค้าไม่สำเร็จ");
        var groups = data.groups || [];
        els.groupList.innerHTML = groups.map(function (g, i) {
          return '<label class="p040-check-option"><input type="checkbox" value="' + g + '"' + (i === 0 ? " checked" : "") + ">" + g + "</label>";
        }).join("");
      });
  }

  function getFilters() {
    var groups = Array.prototype.map.call(els.groupList.querySelectorAll("input:checked"), function (el) { return el.value; });
    var receiptEl = els.filterForm.querySelector('input[name="p040Receipt"]:checked');
    return { groups: groups, receipt: receiptEl ? receiptEl.value : "received" };
  }

  function sortRecords(list) {
    return list.slice().sort(function (a, b) {
      var x = a[state.sortField], y = b[state.sortField];
      if (typeof x === "string") {
        x = x.toLowerCase();
        y = y.toLowerCase();
      }
      if (x < y) return state.sortDir === "asc" ? -1 : 1;
      if (x > y) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  function updateSortIndicators() {
    Array.prototype.forEach.call(els.tableWrap.querySelectorAll("th[data-sort]"), function (th) {
      var active = th.getAttribute("data-sort") === state.sortField;
      th.classList.toggle("p040-sorted", active);
      var arrow = th.querySelector(".p040-arrow");
      if (arrow) arrow.textContent = active ? (state.sortDir === "asc" ? "▲" : "▼") : "";
    });
  }

  function updateSummary(list) {
    els.resultBadge.textContent = list.length + " รายการ";
    els.footerText.textContent = "แสดง " + list.length + " รายการ";
  }

  function renderRows() {
    var rows = sortRecords(state.current);
    els.rows.innerHTML = "";
    updateSortIndicators();

    if (!rows.length) {
      els.rows.innerHTML = '<tr><td colspan="9" style="padding:35px;text-align:center;color:#64748b">ไม่พบรายการตามเงื่อนไข</td></tr>';
      if (els.pager) { els.pager.style.display = "none"; els.pager.innerHTML = ""; }
      updateSummary([]);
      return;
    }

    var totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (state.page < 1) state.page = 1;
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageRows = rows.slice(start, start + PAGE_SIZE);

    if (!pageRows.some(function (row) { return row.id === state.currentId; })) state.currentId = pageRows[0].id;

    pageRows.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.dataset.id = row.id;
      if (row.id === state.currentId) tr.classList.add("p040-active");
      tr.innerHTML =
        '<td class="p040-doc-no">' + esc(row.document) + "</td>" +
        '<td class="center">' + row.sequence + "</td>" +
        '<td class="p040-product-code">' + esc(row.productCode) + "</td>" +
        '<td>' + esc(row.group) + "</td>" +
        '<td title="' + esc(row.name) + '">' + esc(row.name) + "</td>" +
        '<td class="number p040-qty">' + row.ordered + "</td>" +
        '<td class="number p040-qty">' + row.received + "</td>" +
        '<td class="number p040-pending">' + row.pending + "</td>" +
        '<td class="center">' + esc(row.unit) + "</td>";
      els.rows.appendChild(tr);
    });

    if (els.pager) {
      els.pager.style.display = "flex";
      renderPagination(rows.length);
    }
    updateSummary(rows);
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
      if (active) b.classList.add("p040-page-active");
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
    var totalPages = Math.max(1, Math.ceil(state.current.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, p), totalPages);
    renderRows();
  }

  function search(showToast) {
    var filters = getFilters();
    state.page = 1;

    if (!filters.groups.length) {
      showToastMsg("กรุณาเลือกกลุ่มสินค้า");
      return Promise.resolve();
    }

    els.panelSubtitle.textContent = "กำลังค้นหา...";
    return apiPost("p040_search.php", { groups: filters.groups, receipt: filters.receipt })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "ค้นหาไม่สำเร็จ");
        state.current = data.rows || [];
        els.panelSubtitle.textContent = "เลือกกลุ่มสินค้า " + filters.groups.length + " กลุ่ม · สถานะรับสินค้า " + (filters.receipt === "received" ? "เสร็จแล้ว" : filters.receipt === "pending" ? "ยังไม่เสร็จ" : "ทั้งหมด");
        renderRows();
        if (showToast) showToastMsg("พบข้อมูล " + state.current.length + " รายการ");
      })
      .catch(function (err) {
        showToastMsg(err.message || String(err));
      });
  }

  var THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  function fmtThaiDate(d) {
    var dd = d.getDate() < 10 ? "0" + d.getDate() : String(d.getDate());
    return dd + " " + THAI_MONTHS[d.getMonth()] + " " + (d.getFullYear() + 543);
  }

  /* ---------- รายงาน — ตาม C# bgWorker_DoWork + _events.OnEndPage ---------- */
  var REPORT_COLS = [80, 40, 65, 70, 345, 60, 60, 60]; // pt ตาม C# tableheaderwidths
  var REPORT_HEADS = ["เลขใบสำคัญ", "ลำดับ", "รหัสสินค้า", "กลุ่ม", "รายละเอียดสินค้า", "ยอดสั่ง<br>ขด/ม้วน", "ยอดส่ง<br>ขด/ม้วน", "หน่วย"];

  // หัวรายงาน + หัวตาราง (C#: title 18B, วันที่/กลุ่ม 14B, หัวคอลั่น 14B มีเส้น)
  function reportHeadRows(dateStr, groupStr) {
    return '<tr class="p040-r-title"><td colspan="8">รายงานค้างส่งสินค้าลอต</td></tr>' +
      '<tr class="p040-r-meta"><td colspan="2">วันที่ ' + dateStr + '</td><td colspan="6"> จากกลุ่ม ' + esc(groupStr) + "</td></tr>" +
      '<tr class="p040-r-head">' + REPORT_HEADS.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr>";
  }

  // แถวข้อมูล 14pt ธรรมดา ไม่มีเส้น (C# bgWorker_DoWork: font14, NO_BORDER)
  function reportRow(row) {
    return "<tr>" +
      '<td class="p040-c-center">' + esc(row.document) + "</td>" +
      '<td class="p040-c-seq">' + row.sequence + "</td>" +
      '<td class="p040-c-center">' + esc(row.productCode) + "</td>" +
      '<td class="p040-c-center">' + esc(row.group) + "</td>" +
      "<td>" + esc(row.name) + "</td>" +
      '<td class="p040-c-right">' + row.ordered + "</td>" +
      '<td class="p040-c-right">' + row.received + "</td>" +
      '<td class="p040-c-center">' + esc(row.unit) + "</td>" +
      "</tr>";
  }

  function newPage(pageNo, dateStr, groupStr) {
    var cols = REPORT_COLS.map(function (w) { return '<col style="width:' + w + 'pt">'; }).join("");
    var art = document.createElement("article");
    art.className = "p040-paper";
    art.innerHTML =
      '<div class="p040-paper-body">' +
      '<table class="p040-paper-table">' +
      "<colgroup>" + cols + "</colgroup>" +
      "<tbody>" + reportHeadRows(dateStr, groupStr) + "</tbody>" +
      "</table>" +
      "</div>" +
      '<div class="p040-paper-page">หน้า ' + pageNo + "</div>";
    els.paper.appendChild(art);
    return {
      art: art,
      body: art.querySelector(".p040-paper-body"),
      tbody: art.querySelector("tbody"),
      rows: 0
    };
  }

  function buildReport(dateStr, groupStr) {
    els.paper.innerHTML = "";
    var page = null;
    var pages = 0;

    function startPage() {
      pages++;
      page = newPage(pages, dateStr, groupStr);
    }

    startPage();

    state.current.forEach(function (row) {
      page.tbody.insertAdjacentHTML("beforeend", reportRow(row));
      page.rows++;

      // เนื้อหาล้นพื้นที่กระดาษ (A4 landscape 460pt) → ยกแถวนี้ไปหน้าใหม่
      if (page.body.scrollHeight > page.body.clientHeight + 1) {
        var tr = page.tbody.lastElementChild;
        tr.remove();
        page.rows--;
        if (page.rows > 0) {
          startPage();
        }
        // แถวเดียวยาวเกินหน้าจะไม่ถูกตัดออก (กันวนซ้ำไม่จบ)
        page.tbody.appendChild(tr);
        page.rows++;
      }
    });

    els.previewText.textContent = "แสดงรายงาน " + state.current.length + " รายการ · " + pages + " หน้า";
    applyZoom();
  }

  /* ---------- ย่อ/ขยายรายงาน ---------- */
  var PAPER_W_PX = 1123; // 297mm @96dpi
  var PAPER_H_PX = 794;  // 210mm @96dpi
  var ZOOM_MIN = 25;
  var ZOOM_MAX = 200;
  var ZOOM_STEP = 10;

  function fitZoom() {
    var area = els.modal.querySelector(".p040-preview-area");
    if (!area) return 100;
    var avail = area.clientWidth - 56;
    return Math.max(ZOOM_MIN, Math.min(100, Math.floor(avail / PAPER_W_PX * 100)));
  }

  function applyZoom() {
    var papers = els.paper.querySelectorAll(".p040-paper");
    var scale = state.zoom / 100;
    Array.prototype.forEach.call(papers, function (paper) {
      paper.style.transform = scale === 1 ? "" : "scale(" + scale + ")";
      // transform ไม่กินพื้นที่ layout → ชดเชยระยะด้านล่างไม่ให้เหลือช่องว่างเกิน
      paper.style.marginBottom = scale === 1 ? "" : Math.round(-PAPER_H_PX * (1 - scale)) + "px";
    });
    if (els.zoomVal) els.zoomVal.textContent = state.zoom + "%";
    if (els.zoomIn) els.zoomIn.disabled = state.zoom >= ZOOM_MAX;
    if (els.zoomOut) els.zoomOut.disabled = state.zoom <= ZOOM_MIN;
  }

  function setZoom(value) {
    state.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(value)));
    applyZoom();
  }

  function openPreview() {
    var filters = getFilters();
    var dateStr = fmtThaiDate(new Date());
    var groupStr = filters.groups.length ? filters.groups.join(", ") : "ทั้งหมด";

    els.paper.innerHTML = "";
    els.previewText.textContent = "กำลังสร้างรายงาน...";
    els.modal.classList.add("p040-show");
    document.body.style.overflow = "hidden";
    state.zoom = fitZoom(); // เปิดมาพอดีหน้าจอ แล้วค่อยย่อ/ขยายเองได้

    // ต้องรอฟอนต์ THSarabunNew พร้อมก่อนวัดความสูง/แบ่งหน้า ไม่งั้นจำนวนแถวต่อหน้าจะเพี้ยน
    var fontReady = (document.fonts && document.fonts.load)
      ? Promise.all([
          document.fonts.load('14pt "THSarabunNew'),
          document.fonts.load('700 14pt "THSarabunNew'),
          document.fonts.load('700 18pt "THSarabunNew')
        ]).catch(function () {})
      : Promise.resolve();

    fontReady.then(function () {
      buildReport(dateStr, groupStr);
    });
  }

  function closePreview() {
    els.modal.classList.remove("p040-show");
    document.body.style.overflow = "";
  }

  // พิมพ์หลายหน้า: clone กระดาษไปไว้ท้าย body (body>* ซ่อนหมด เหลือ #p040PrintRoot)
  function ensurePrintRoot() {
    removePrintRoot();
    if (!els.paper || !els.paper.children.length) return;
    var root = document.createElement("div");
    root.id = "p040PrintRoot";
    root.className = "p040-app";
    root.innerHTML = els.paper.innerHTML;
    document.body.appendChild(root);
  }

  function removePrintRoot() {
    var el = document.getElementById("p040PrintRoot");
    if (el) el.parentNode.removeChild(el);
  }

  function setButtonLoading(btn, on) {
    if (!btn) return;
    var spinner = btn.querySelector(".p040-spinner");
    if (on) {
      if (!spinner) {
        spinner = document.createElement("span");
        spinner.className = "p040-spinner";
        btn.insertBefore(spinner, btn.firstChild);
      }
      btn.classList.add("p040-loading");
    } else {
      if (spinner) spinner.remove();
      btn.classList.remove("p040-loading");
    }
  }

  function showToastMsg(message) {
    els.toastMessage.textContent = message;
    clearTimeout(toastTimer);
    els.toast.classList.add("p040-show");
    toastTimer = setTimeout(function () { els.toast.classList.remove("p040-show"); }, 1900);
  }

  function mount(root) {
    injectStyle();
    state.current = [];
    state.currentId = 1;
    state.sortField = "document";
    state.sortDir = "asc";
    state.selected = new Set();
    state.page = 1;

    root.innerHTML =
      '<div class="p040-app">' +
      '  <section class="p040-launcher">' +
      '    <div class="p040-launcher-title">' +
      '      <strong>' +
      '        <svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>' +
      '        ตรวจสอบค้างส่งสินค้า LOT' +
      '      </strong>' +

      '    </div>' +
      '    <form class="p040-launcher-body" id="p040FilterForm">' +
      '      <div class="p040-filter-section">' +
      '        <div class="p040-filter-row">' +
      '          <span class="p040-filter-label">กลุ่มสินค้า</span>' +
      '          <div class="p040-group-list" id="p040GroupList"></div>' +
      '        </div>' +
      '        <div class="p040-filter-row">' +
      '          <span class="p040-filter-label">รับสินค้า</span>' +
      '          <div class="p040-radio-box">' +
      '            <label class="p040-radio-option"><input type="radio" name="p040Receipt" value="received" checked>เสร็จแล้ว</label>' +
      '            <label class="p040-radio-option"><input type="radio" name="p040Receipt" value="pending">ยังไม่เสร็จ</label>' +
      '            <label class="p040-radio-option"><input type="radio" name="p040Receipt" value="all">ไม่ใช้ Filter</label>' +
      '          </div>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p040-actions">' +
      '        <button class="p040-button p040-search" id="p040SearchButton" type="submit">' +
      '          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>' +
      '          ค้นหา' +
      '        </button>' +
      '      </div>' +
      '    </form>' +
      '  </section>' +
      '  <section class="p040-panel">' +
      '    <div class="p040-panel-header">' +
      '      <div class="p040-panel-heading">' +
      '        <div class="p040-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
      '        <div class="p040-panel-title">' +
      '          <h2>รายการสินค้าค้างส่ง LOT</h2>' +
      '          <p id="p040PanelSubtitle">คลิกแถวเพื่อเลือกข้อมูล และเรียงข้อมูลได้จากหัวตาราง</p>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p040-header-actions">' +
      '        <span class="p040-badge" id="p040ResultBadge">0 รายการ</span>' +
      '        <button class="p040-button p040-preview" id="p040PreviewButton" type="button">' +
      '          <svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>' +
      '          Print Preview' +
      '        </button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="p040-table-wrap" id="p040TableWrap">' +
      '      <table>' +
      '        <thead>' +
      '          <tr>' +
      '            <th class="sortable" data-sort="document">เลขใบสำคัญ <span class="p040-arrow"></span></th>' +
      '            <th class="sortable center" data-sort="sequence">ลำดับ <span class="p040-arrow"></span></th>' +
      '            <th class="sortable" data-sort="productCode">รหัสสินค้า <span class="p040-arrow"></span></th>' +
      '            <th class="sortable" data-sort="group">กลุ่มสินค้า <span class="p040-arrow"></span></th>' +
      '            <th class="sortable" data-sort="name">รายละเอียดสินค้า <span class="p040-arrow"></span></th>' +
      '            <th class="sortable number" data-sort="ordered">ยอดสั่ง<br>ขด/ม้วน <span class="p040-arrow"></span></th>' +
      '            <th class="sortable number" data-sort="received">ยอดส่งแล้ว<br>ขด/ม้วน<span class="p040-arrow"></span></th>' +
      '            <th class="sortable number" data-sort="pending">ค้างส่ง<br>ขด/ม้วน <span class="p040-arrow"></span></th>' +
      '            <th class="sortable center" data-sort="unit">หน่วย <span class="p040-arrow"></span></th>' +
      '          </tr>' +
      '        </thead>' +
      '        <tbody id="p040Rows"></tbody>' +
      '      </table>' +
      '    </div>' +
      '    <div class="p040-pager" id="p040Pager"></div>' +
      '    <div class="p040-panel-footer">' +
      '      <span id="p040FooterText">แสดง 0 รายการ</span>' +
      '    </div>' +
      '  </section>' +
      '  <div class="p040-modal" id="p040Modal">' +
      '    <section class="p040-modal-box">' +
      '      <div class="p040-modal-header">' +
      '        <h3>Print Preview — รายงานค้างส่งสินค้า LOT</h3>' +
      '        <button class="p040-modal-close" id="p040ClosePreview" type="button">×</button>' +
      '      </div>' +
      '      <div class="p040-preview-toolbar">' +
      '        <span id="p040PreviewText">กำลังแสดงรายงาน</span>' +
      '        <div class="p040-toolbar-right">' +
      '          <div class="p040-zoom-group">' +
      '            <button class="p040-zoom-btn" id="p040ZoomOut" type="button" title="ย่อรายงาน" aria-label="ย่อรายงาน">−</button>' +
      '            <span class="p040-zoom-val" id="p040ZoomVal">100%</span>' +
      '            <button class="p040-zoom-btn" id="p040ZoomIn" type="button" title="ขยายรายงาน" aria-label="ขยายรายงาน">+</button>' +
      '            <button class="p040-zoom-fit" id="p040ZoomFit" type="button" title="พอดีหน้าจอ">พอดีหน้า</button>' +
      '          </div>' +
      '          <button class="p040-print-btn" id="p040PrintButton" type="button">' +
      '            <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>' +
      '            พิมพ์เอกสาร' +
      '          </button>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p040-preview-area">' +
      '        <div class="p040-paper-stack" id="p040Paper"></div>' +
      '      </div>' +
      '    </section>' +
      '  </div>' +
      '  <div class="p040-toast" id="p040Toast">' +
      '    <svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>' +
      '    <span id="p040ToastMessage">ดำเนินการเรียบร้อยแล้ว</span>' +
      '  </div>' +
      '</div>';

    els.filterForm = root.querySelector("#p040FilterForm");
    els.searchButton = root.querySelector("#p040SearchButton");
    els.previewButton = root.querySelector("#p040PreviewButton");
    els.groupList = root.querySelector("#p040GroupList");
    els.rows = root.querySelector("#p040Rows");
    els.pager = root.querySelector("#p040Pager");
    els.tableWrap = root.querySelector("#p040TableWrap");
    els.resultBadge = root.querySelector("#p040ResultBadge");
    els.footerText = root.querySelector("#p040FooterText");
    els.panelSubtitle = root.querySelector("#p040PanelSubtitle");
    els.modal = root.querySelector("#p040Modal");
    els.previewText = root.querySelector("#p040PreviewText");
    els.paper = root.querySelector("#p040Paper");
    els.zoomIn = root.querySelector("#p040ZoomIn");
    els.zoomOut = root.querySelector("#p040ZoomOut");
    els.zoomFit = root.querySelector("#p040ZoomFit");
    els.zoomVal = root.querySelector("#p040ZoomVal");
    els.previewArea = root.querySelector(".p040-preview-area");
    els.closePreview = root.querySelector("#p040ClosePreview");
    els.printButton = root.querySelector("#p040PrintButton");
    els.toast = root.querySelector("#p040Toast");
    els.toastMessage = root.querySelector("#p040ToastMessage");

    // ย้าย modal ไปชั้น <body> — ancestor (.content.page-anim) มี transform ทำให้ position:fixed อ้างผิดกรอบ
    // จน modal จมขึ้นไปด้านบนจอ; host ต้องมี class p040-app เพื่อให้ CSS ที่ scope ไว้ยังทำงาน
    var oldHost = document.getElementById("p040ModalHost");
    if (oldHost) oldHost.parentNode.removeChild(oldHost);
    var modalHost = document.createElement("div");
    modalHost.id = "p040ModalHost";
    modalHost.className = "p040-app";
    modalHost.appendChild(els.modal);
    document.body.appendChild(modalHost);

    // ค่าตั้น = ดึงแค่รายชื่อกลุ่มสินค้าจาก MAC-5 (C# FrmCheckCPSproductLotGUI_Load) — ไม่มี auto-search
    loadGroups().catch(function (err) {
      showToastMsg(err.message || String(err));
    });

    els.filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      setButtonLoading(els.searchButton, true);
      search(true).finally(function () {
        setButtonLoading(els.searchButton, false);
      });
    });
    els.previewButton.addEventListener("click", function () {
      setButtonLoading(els.previewButton, true);
      setTimeout(function () {
        openPreview();
        setButtonLoading(els.previewButton, false);
      }, 400);
    });
    els.closePreview.addEventListener("click", closePreview);
    els.zoomIn.addEventListener("click", function () { setZoom(state.zoom + ZOOM_STEP); });
    els.zoomOut.addEventListener("click", function () { setZoom(state.zoom - ZOOM_STEP); });
    els.zoomFit.addEventListener("click", function () { setZoom(fitZoom()); });
    // Ctrl + ล้อเมาส์ ในพื้นที่ preview = ย่อ/ขยาย
    els.previewArea.addEventListener("wheel", function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom(state.zoom + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    }, { passive: false });
    els.printButton.addEventListener("click", function () {
      ensurePrintRoot();
      window.print();
    });
    window.addEventListener("beforeprint", ensurePrintRoot);
    window.addEventListener("afterprint", removePrintRoot);
    root.querySelector("#p040ToggleLauncher").addEventListener("click", function () {
      els.filterForm.style.display = els.filterForm.style.display === "none" ? "grid" : "none";
    });
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closePreview();
    });
    els.tableWrap.addEventListener("click", function (e) {
      var tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      state.currentId = Number(tr.dataset.id);
      renderRows();
    });
    Array.prototype.forEach.call(root.querySelectorAll("th[data-sort]"), function (th) {
      th.addEventListener("click", function () {
        var field = th.getAttribute("data-sort");
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
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePreview();
    });
  }

  window.P040LotPending = { mount: mount };
})();
