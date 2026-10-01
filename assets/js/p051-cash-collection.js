/* P051 — รายงานการเก็บเงินสด (clone demo/P051-demo.html)
 * IIFE — window.P051CashCollection = { mount }
 * Data: MAC5 — API p051_search.php (MIH + DEB)
 * UI: เงื่อนไข (ทั้งหมด/เงินสด + สถานะ) + table (sort + quick search + select row) + footer + Print A4 landscape + Export CSV
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";

  function apiFetch(path, payload) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function formatMoney(v) { return moneyFmt.format(Number(v || 0)); }
  function formatDate(v) {
    var p = String(v || "").split("-");
    if (p.length !== 3) return String(v || "");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var state = {
    allRows: [],
    currentRows: [],
    selectedDocument: "",
    sortField: "index",
    sortDirection: "asc",
    searched: false
  };

  function icon(name, size) {
    var s = size || 20;
    var paths = {
      table: '<path d="M4 4h16v16H4z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>',
      sliders: '<line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>',
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle>',
      download: '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      empty: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path>'
    };
    var p = paths[name] || paths.grid;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">' + p + "</svg>";
  }

  function mount(root) {
    state.currentRows = [];
    state.selectedDocument = "";
    state.sortField = "index";
    state.sortDirection = "asc";
    injectCSS();

    root.innerHTML =
      '<form class="p051-launcher" id="p051Form">' +
        '<section class="p051-filter-card">' +
          "<h2>" + icon("table", 18) + " เงื่อนไขรายงาน</h2>" +
          '<div class="p051-radio-list">' +
            '<label class="p051-radio-option"><input type="radio" name="p051Type" value="all" checked> ทั้งหมด</label>' +
            '<label class="p051-radio-option"><input type="radio" name="p051Type" value="cash"> เงินสด</label>' +
          "</div>" +
        "</section>" +
        '<section class="p051-filter-card">' +
          "<h2>" + icon("sliders", 18) + " สถานะ</h2>" +
          '<div class="p051-field">' +
            '<label for="p051Status">ตัวอย่าง 43,44,60</label>' +
            '<div class="p051-input-wrap">' +
              '<input id="p051Status" type="text" value="43,44,60">' +
            "</div>" +
          "</div>" +
        "</section>" +
        '<div class="p051-actions">' +
          '<button class="p051-btn primary" type="submit">' + icon("search", 16) + " ค้นหา</button>" +
          '<button class="p051-btn secondary" id="p051PreviewBtn" type="button">' + icon("eye", 16) + " ตัวอย่างก่อนพิมพ์</button>" +
          '<button class="p051-btn success" id="p051ExportBtn" type="button">' + icon("download", 16) + " Export CSV</button>" +
        "</div>" +
      "</form>" +

      '<section class="p051-panel">' +
        '<div class="p051-panel-header">' +
          '<div class="p051-panel-heading">' +
            '<div class="p051-panel-icon">' + icon("grid", 20) + "</div>" +
            '<div class="p051-panel-title">' +
              "<h2>รายการเก็บเงินสด</h2>" +
              '<p id="p051Subtitle">แสดงลูกหนี้ตามเงื่อนไขที่เลือก</p>' +
            "</div>" +
          "</div>" +
          '<div class="p051-panel-tools">' +
            '<div class="p051-table-search">' +
              icon("search", 16) +
              '<input id="p051QuickSearch" type="search" placeholder="ค้นหาใบสำคัญ ลูกค้า หรือผู้แทน">' +
            "</div>" +
            '<span class="p051-badge" id="p051Badge">0 รายการ</span>' +
          "</div>" +
        "</div>" +
        '<div class="p051-table-container">' +
          '<table id="p051PrintTable">' +
            "<thead><tr>" +
              '<th class="p051-sortable p051-center" data-sort="index">ลำดับ <span class="p051-sort-mark">↕</span></th>' +
              '<th class="p051-sortable" data-sort="document">เลขใบสำคัญ <span class="p051-sort-mark">↕</span></th>' +
              '<th class="p051-sortable p051-center" data-sort="date">วันที่ <span class="p051-sort-mark">↕</span></th>' +
              '<th class="p051-sortable" data-sort="customerCode">รหัสลูกค้า <span class="p051-sort-mark">↕</span></th>' +
              '<th class="p051-sortable" data-sort="customerName">ชื่อลูกค้า <span class="p051-sort-mark">↕</span></th>' +
              '<th class="p051-sortable p051-center" data-sort="salesperson">ผู้แทน <span class="p051-sort-mark">↕</span></th>' +
              '<th class="p051-sortable p051-number" data-sort="amount">ยอดเงินสุทธิ <span class="p051-sort-mark">↕</span></th>' +
            "</tr></thead>" +
            '<tbody id="p051Rows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p051-empty-state" id="p051Empty">' +
          "<div>" +
            '<div style="margin:0 auto 10px;width:52px;height:52px;color:#94a3b8">' + icon("empty", 52) + "</div>" +
            "<strong>ไม่พบรายการตามเงื่อนไข</strong>" +
            '<p style="margin-top:5px;font-size:11px">ลองเปลี่ยนรหัสสถานะ หรือประเภทรายงาน แล้วค้นหาใหม่</p>' +
          "</div>" +
        "</div>" +
        '<div class="p051-table-footer">' +
          '<span id="p051FooterText">แสดง 0 รายการ</span>' +
          '<div class="p051-footer-total">ยอดรวมทั้งหมด <strong id="p051FooterAmount">฿0.00</strong></div>' +
        "</div>" +
      "</section>" +
      '<div id="p051Toast" class="p051-toast"></div>';

    var form = root.querySelector("#p051Form");
    var quick = root.querySelector("#p051QuickSearch");

    form.addEventListener("submit", function (e) { e.preventDefault(); doSearch(); });
    quick.addEventListener("input", applyFilters);
    root.querySelectorAll('input[name="p051Type"]').forEach(function (inp) {
      inp.addEventListener("change", function () { if (state.searched) doSearch(); });
    });
    root.querySelector("#p051PreviewBtn").addEventListener("click", function () { window.print(); });
    root.querySelector("#p051ExportBtn").addEventListener("click", exportCSV);
    root.querySelectorAll("th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var field = th.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDirection = "asc";
        }
        root.querySelectorAll(".p051-sort-mark").forEach(function (m) { m.textContent = "↕"; });
        th.querySelector(".p051-sort-mark").textContent = state.sortDirection === "asc" ? "↑" : "↓";
        renderRows();
      });
    });

    /* ไม่ค้นหาอัตโนมัติตาม mount — รอรัดปุ่มค้นหา */
    renderRows();
  }

  var toastTimer = null;
  function showToast(msg, ms) {
    var t = _root ? _root.querySelector("#p051Toast") : null;
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }

  function doSearch() {
    var root = _root;
    var status = String(el(root, "#p051Status").value).trim();
    var type = currentReportType();

    el(root, "#p051Badge").textContent = "ค้นหา...";
    apiFetch("p051_search.php", { connectionId: MAC5_CONNECTION_ID, status: status, reportType: type }).then(function (res) {
      if (!res || !res.ok) throw new Error(res && res.error ? res.error : "API error");
      state.allRows = res.rows || [];
      state.searched = true;
      state.selectedDocument = "";
      applyFilters();
      showToast("✓ พบ " + state.currentRows.length + " รายการ");
    }).catch(function (e) {
      state.allRows = [];
      state.searched = true;
      applyFilters();
      showToast("⚠ ค้นหาไม่สำเร็จ: " + (e && e.message ? e.message : ""), 3200);
    });
  }

  function currentReportType() {
    var el = _root.querySelector('input[name="p051Type"]:checked');
    return el ? el.value : "all";
  }

  function sortRows(items) {
    var f = state.sortField;
    var d = state.sortDirection;
    return items.slice().sort(function (a, b) {
      var x = a[f], y = b[f];
      if (typeof x === "string") { x = x.toLocaleLowerCase("th"); y = String(y).toLocaleLowerCase("th"); }
      if (x < y) return d === "asc" ? -1 : 1;
      if (x > y) return d === "asc" ? 1 : -1;
      return 0;
    });
  }

  function el(root, sel) { return root.querySelector(sel); }

  function updateSummary(root, items) {
    var total = 0;
    for (var i = 0; i < items.length; i++) {
      total += Number(items[i].amount || 0);
    }
    el(root, "#p051FooterAmount").textContent = "฿" + formatMoney(total);
  }

  function renderRows() {
    var root = _root;
    var tbody = el(root, "#p051Rows");
    var sorted = sortRows(state.currentRows);

    if (sorted.length && !sorted.some(function (it) { return it.document === state.selectedDocument; })) {
      state.selectedDocument = sorted[0].document;
    }

    var html = "";
    for (var i = 0; i < sorted.length; i++) {
      var it = sorted[i];
      var sel = it.document === state.selectedDocument ? " p051-selected" : "";
      html +=
        '<tr class="' + sel.trim() + '" data-doc="' + esc(it.document) + '">' +
          '<td class="p051-center">' + it.index + "</td>" +
          '<td class="p051-doc">' + esc(it.document) + "</td>" +
          '<td class="p051-center">' + esc(formatDate(it.date)) + "</td>" +
          '<td class="p051-code">' + esc(it.customerCode) + "</td>" +
          '<td title="' + esc(it.customerName) + '">' + esc(it.customerName) + "</td>" +
          '<td class="p051-center p051-code">' + esc(it.salesperson) + "</td>" +
          '<td class="p051-number p051-amount">' + formatMoney(it.amount) + "</td>" +
        "</tr>";
    }
    tbody.innerHTML = html;

    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.addEventListener("click", function () {
        state.selectedDocument = tr.getAttribute("data-doc");
        renderRows();
      });
    });

    var hasRows = sorted.length > 0;
    el(root, ".p051-table-container").style.display = hasRows ? "block" : "none";
    el(root, "#p051Empty").classList.toggle("show", !hasRows);
    el(root, "#p051Badge").textContent = sorted.length + " รายการ";
    el(root, "#p051FooterText").textContent = "แสดง " + sorted.length + " รายการ";
    updateSummary(root, sorted);
  }

  function applyFilters() {
    var root = _root;
    var keyword = el(root, "#p051QuickSearch").value.trim().toLowerCase();
    var type = currentReportType();
    var status = String(el(root, "#p051Status").value).trim();

    state.currentRows = state.allRows.filter(function (it) {
      var text = [it.document, it.customerCode, it.customerName, it.salesperson].join(" ").toLowerCase();
      return !keyword || text.indexOf(keyword) >= 0;
    });

    /* re-index ตามแถวที่แสดง */
    for (var i = 0; i < state.currentRows.length; i++) {
      state.currentRows[i].index = i + 1;
    }

    var typeText = type === "cash" ? "รายการเงินสด" : "รายการทั้งหมด";
    el(root, "#p051Subtitle").textContent = typeText + " · สถานะ " + (status || "ทั้งหมด");
    renderRows();
  }

  function exportCSV() {
    if (!state.currentRows.length) { alert("ไม่พบข้อมูลสำหรับส่งออก"); return; }
    var headers = ["ลำดับ", "เลขใบสำคัญ", "วันที่", "รหัสลูกค้า", "ชื่อลูกค้า", "ผู้แทน", "ยอดเงินสุทธิ"];
    var lines = [headers];
    state.currentRows.forEach(function (it) {
      lines.push([it.index, it.document, formatDate(it.date), it.customerCode, it.customerName, it.salesperson, Number(it.amount).toFixed(2)]);
    });
    var csv = lines.map(function (row) {
      return row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "รายงานเก็บเงินสด.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- CSS (clone demo) ---------- */
  function injectCSS() {
    if (document.getElementById("p051Styles")) return;
    var st = document.createElement("style");
    st.id = "p051Styles";
    st.textContent =
      ".p051-launcher{display:grid;grid-template-columns:minmax(250px,.7fr) minmax(250px,.9fr) auto;gap:13px;align-items:stretch;padding:16px;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}" +
      ".p051-filter-card{padding:13px;border:1px solid #dbe3ef;border-radius:13px;background:#f8fafc}" +
      ".p051-filter-card h2{display:flex;align-items:center;gap:7px;margin-bottom:10px;font-size:13px;color:#172033}" +
      ".p051-filter-card h2 svg{width:18px;height:18px;color:#2563eb;flex:0 0 auto}" +
      ".p051-radio-list{display:flex;gap:16px;align-items:center;min-height:44px}" +
      ".p051-radio-option{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;cursor:pointer;color:#172033}" +
      ".p051-radio-option input{width:17px;height:17px;accent-color:#2563eb}" +
      ".p051-field label{display:block;margin-bottom:7px;color:#64748b;font-size:11px;font-weight:700}" +
      ".p051-input-wrap{position:relative}" +
      ".p051-input-wrap svg{position:absolute;top:50%;left:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}" +
      ".p051-input-wrap input{width:100%;height:44px;padding:0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-weight:600;font-size:13px}" +
      ".p051-input-wrap input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}" +
      ".p051-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}" +
      ".p051-btn{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 17px;border-radius:11px;font-size:12px;font-weight:700;white-space:nowrap;transition:.16s ease;cursor:pointer}" +
      ".p051-btn.primary{color:#fff;border:0;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22)}" +
      ".p051-btn.primary:hover{transform:translateY(-1px);filter:brightness(1.06)}" +
      ".p051-btn.secondary{color:#1d4ed8;border:1px solid #bfdbfe;background:#eff6ff}" +
      ".p051-btn.secondary:hover{color:#fff;border-color:#2563eb;background:#2563eb}" +
      ".p051-btn.success{color:#fff;border:0;background:#059669;box-shadow:0 7px 16px rgba(5,150,105,.18)}" +
      ".p051-btn.success:hover{background:#047857}" +
      ".p051-panel{display:flex;min-height:480px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 30px rgba(15,23,42,.08)}" +
      ".p051-panel-header{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid #dbe3ef}" +
      ".p051-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}" +
      ".p051-panel-icon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:11px;background:#eff6ff}" +
      ".p051-panel-title{min-width:0}" +
      ".p051-panel-title h2{overflow:hidden;font-size:15px;text-overflow:ellipsis;white-space:nowrap;color:#172033}" +
      ".p051-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}" +
      ".p051-panel-tools{display:flex;align-items:center;gap:8px}" +
      ".p051-table-search{position:relative;width:260px}" +
      ".p051-table-search svg{position:absolute;top:50%;left:10px;width:16px;height:16px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}" +
      ".p051-table-search input{width:100%;height:36px;padding:0 10px 0 33px;border:1px solid #dbe3ef;border-radius:9px;outline:none;font-size:12px}" +
      ".p051-table-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.12)}" +
      ".p051-badge{padding:5px 10px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}" +
      ".p051-table-container{min-height:0;flex:1;overflow:auto}" +
      ".p051-table-container table{width:100%;min-width:1080px;border-collapse:separate;border-spacing:0;white-space:nowrap}" +
      ".p051-table-container th{position:sticky;top:0;z-index:2;padding:13px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;font-size:13px;font-weight:700;text-align:left;user-select:none}" +
      ".p051-table-container th.p051-sortable{cursor:pointer}" +
      ".p051-table-container th.p051-sortable:hover{color:#2563eb;background:#f1f5f9}" +
      ".p051-sort-mark{margin-left:3px;color:#94a3b8;font-size:10px}" +
      ".p051-table-container td{max-width:340px;overflow:hidden;padding:11px 14px;border-bottom:1px solid #edf1f6;font-size:13px;line-height:1.45;text-overflow:ellipsis;color:#172033}" +
      ".p051-center{text-align:center}" +
      ".p051-number{text-align:right}" +
      ".p051-table-container tbody tr{cursor:pointer;transition:.14s ease}" +
      ".p051-table-container tbody tr:nth-child(even){background:#fbfdff}" +
      ".p051-table-container tbody tr:hover{background:#f0f7ff}" +
      ".p051-table-container tbody tr.p051-selected{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}" +
      ".p051-doc{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}" +
      ".p051-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}" +
      ".p051-amount{color:#0f172a;font-family:Arial,sans-serif;font-variant-numeric:tabular-nums;font-weight:700}" +
      ".p051-table-footer{display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}" +
      ".p051-footer-total{display:flex;align-items:center;gap:8px;padding:6px 11px;color:#172033;border:1px solid #dbe3ef;border-radius:9px;background:#fff}" +
      ".p051-footer-total strong{color:#1d4ed8}" +
      ".p051-empty-state{display:none;min-height:280px;align-items:center;justify-content:center;color:#64748b;text-align:center}" +
      ".p051-empty-state.show{display:flex}" +
      ".p051-toast{position:fixed;right:20px;bottom:20px;z-index:210;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:12px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:.2s}" +
      ".p051-toast.show{opacity:1;visibility:visible;transform:translateY(0)}" +
      "@media print{" +
        "@page{size:A4 landscape;margin:8mm}" +
        "body *{visibility:hidden !important}" +
        "#p051PrintTable,#p051PrintTable *{visibility:visible !important}" +
        "#p051PrintTable{position:absolute;top:0;left:0;width:281mm;border-collapse:collapse}" +
        "#p051PrintTable th,#p051PrintTable td{padding:4px;border:1px solid #888;font-size:8px}" +
      "}" +
      "@media (max-width:1000px){.p051-launcher{grid-template-columns:repeat(2,1fr)}}";
    document.head.appendChild(st);
  }

  var _root = null;
  var _mount = mount;
  function mountWithRoot(root) {
    _root = root;
    _mount(root);
  }

  window.P051CashCollection = { mount: mountWithRoot };
})();