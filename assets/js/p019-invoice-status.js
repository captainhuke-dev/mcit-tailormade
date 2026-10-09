/* P019 — เช็คสถานะส่ง Invoice (clone demo/P019-demo.html)
 * IIFE — window.P019InvoiceStatus = { mount }
 * Data: MAC5 — API p019_invoices.php (search) + p019_status.php (status list จาก AR_S)
 * clone C# frm_CheckStatusInvoiceGUI.cs (AppCheckStatusInvoice)
 * UI: เงื่อนไข (วันที่ from–to + สถานะ multi-select dropdown) + table 6 คอลั่น (sort + quick search + row select) + footer
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var PER_PAGE = 15;

  function apiFetch(path, payload) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function formatDate(v) {
    var p = String(v || "").split("-");
    if (p.length !== 3) return String(v || "");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* สถานะ badge — สีตาม demo (fallback เมื่อ load AR_S ผิดพลาด) */
  var STATUS_FALLBACK = {
    "62": { label: "ADS ส่ง ACC", cls: "purple" },
    "63": { label: "รับเอง", cls: "gray" },
    "65": { label: "WH", cls: "orange" },
    "67": { label: "NOT SHIP", cls: "red" },
    "68": { label: "SHIP", cls: "green" },
    "70": { label: "LOG", cls: "blue" }
  };

  var state = {
    statuses: [],        /* [{ code, name }] จาก AR_S */
    allRows: [],
    currentRows: [],
    selectedDocument: "",
    sortField: "date",
    sortDirection: "asc",
    page: 1,
    searched: false
  };

  function icon(name, size) {
    var s = size || 20;
    var paths = {
      table: '<path d="M4 4h16v16H4z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      empty: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path>',
      check: '<path d="M20 6 9 17l-5-5"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>'
    };
    var p = paths[name] || paths.grid;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">' + p + "</svg>";
  }

  function statusDetail(code) {
    var c = String(code);
    for (var i = 0; i < state.statuses.length; i++) {
      if (state.statuses[i].code === c) {
        /* name จาก AR_S = "62 : ADS ส่ง ACC" — ตัด prefix "62 : " ออก */
        var parts = state.statuses[i].name.split(":");
        var label = parts.length > 1 ? parts.slice(1).join(":").trim() : state.statuses[i].name;
        var fb = STATUS_FALLBACK[c] || { label: label, cls: "blue" };
        return { text: c, label: label, cls: fb.cls };
      }
    }
    return STATUS_FALLBACK[c] || { text: c, label: "", cls: "blue" };
  }

  function selectedStatuses() {
    var out = [];
    var checks = document.querySelectorAll("#p019Root .p019-status-option input:checked");
    checks.forEach(function (i) { out.push(i.value); });
    return out;
  }

  function updateStatusSummary() {
    var n = selectedStatuses().length;
    var el = document.getElementById("p019StatusSummary");
    if (el) el.innerHTML = "เลือก <strong>" + n + " สถานะ</strong>";
    var f = document.getElementById("p019FooterStatus");
    if (f) f.textContent = n + " สถานะ";
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
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
  }

  function renderRows() {
    var tbody = document.getElementById("p019Rows");
    if (!tbody) return;
    var sorted = sortItems(state.currentRows);

    if (state.currentRows.length && !state.currentRows.some(function (i) { return i.document === state.selectedDocument; })) {
      state.selectedDocument = sorted[0] ? sorted[0].document : "";
    }

    var totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PER_PAGE;
    var pageRows = sorted.slice(start, start + PER_PAGE);

    if (pageRows.length === 0) {
      tbody.innerHTML = '<tr class="p019-empty-row"><td colspan="6">' + icon("empty", 26) + "<div>" +
        (state.searched ? "ไม่พบข้อมูลตามเงื่อนไขที่เลือก" : "ยังไม่มีรายการแสดง — กรอกเงื่อนไขด้านบนแล้วกด ค้นหา") + "</div></td></tr>";
    } else {
      tbody.innerHTML = pageRows.map(function (item) {
        var d = statusDetail(item.status);
        return '<tr class="' + (item.document === state.selectedDocument ? "p019-selected" : "") + '" data-doc="' + esc(item.document) + '">' +
          '<td class="p019-center">' + esc(formatDate(item.date)) + "</td>" +
          '<td class="p019-doc">' + esc(item.document) + "</td>" +
          '<td class="p019-code">' + esc(item.customerCode) + "</td>" +
          "<td>" + esc(item.customerName) + "</td>" +
          '<td class="p019-center"><span class="p019-badge ' + d.cls + '" title="' + esc(d.label) + '">' + esc(d.text) + "</span></td>" +
          '<td class="p019-center p019-emp">' + esc(item.employee) + "</td>" +
        "</tr>";
      }).join("");
    }

    var ft = document.getElementById("p019FooterText");
    if (ft) ft.textContent = "แสดง " + sorted.length + " รายการ";

    /* pagination */
    var pg = document.getElementById("p019Pagination");
    if (pg) {
      if (totalPages <= 1) {
        pg.innerHTML = "";
      } else {
        var pages = [];
        var startPage = Math.max(1, state.page - 2);
        var endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
          startPage = Math.max(1, endPage - 4);
        }
        for (var p = startPage; p <= endPage; p++) {
          pages.push('<button type="button" class="p019-page-btn ' + (p === state.page ? 'active' : '') + '" data-page="' + p + '">' + p + '</button>');
        }
        pg.innerHTML =
          '<button type="button" class="p019-page-btn" id="p019Prev" ' + (state.page <= 1 ? "disabled" : "") + '>&lsaquo;</button>' +
          pages.join("") +
          '<button type="button" class="p019-page-btn" id="p019Next" ' + (state.page >= totalPages ? "disabled" : "") + '>&rsaquo;</button>';
        var prev = document.getElementById("p019Prev");
        var next = document.getElementById("p019Next");
        if (prev) prev.addEventListener("click", function () { if (state.page > 1) { state.page--; renderRows(); } });
        if (next) next.addEventListener("click", function () { if (state.page < totalPages) { state.page++; renderRows(); } });
        pg.querySelectorAll("[data-page]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            state.page = Number(btn.getAttribute("data-page"));
            renderRows();
          });
        });
      }
    }

    /* row select */
    tbody.querySelectorAll("tr[data-doc]").forEach(function (tr) {
      tr.addEventListener("click", function () {
        state.selectedDocument = tr.getAttribute("data-doc");
        renderRows();
      });
    });
  }

  function quickFilter() {
    var q = (document.getElementById("p019QuickSearch").value || "").trim().toLowerCase();
    state.currentRows = state.allRows.filter(function (item) {
      if (!q) return true;
      var text = (item.document + " " + item.customerCode + " " + item.customerName + " " + item.employee).toLowerCase();
      return text.indexOf(q) !== -1;
    });
    state.page = 1;
    renderRows();
  }

  function searchInvoices() {
    var dateFrom = document.getElementById("p019DateFrom").value;
    var dateTo = document.getElementById("p019DateTo").value;
    var statuses = selectedStatuses();

    if (!statuses.length) {
      document.getElementById("p019ResultText").textContent = "⚠ กรุณาเลือก สถานะ อย่างน้อย 1 ค่า";
      return;
    }

    var resultText = document.getElementById("p019ResultText");
    var btn = document.getElementById("p019BtnSearch");
    resultText.textContent = "⏳ กำลังค้นหา...";
    if (btn) btn.disabled = true;

    apiFetch("p019_invoices.php", {
      connectionId: MAC5_CONNECTION_ID,
      dateFrom: dateFrom,
      dateTo: dateTo,
      status: statuses.join(",")
    }).then(function (data) {
      if (btn) btn.disabled = false;
      if (!data.ok) {
        resultText.textContent = "⚠ " + (data.error || "ค้นหาไม่สำเร็จ");
        return;
      }
      state.allRows = data.rows || [];
      state.searched = true;
      state.page = 1;
      resultText.textContent = "✓ พบ Invoice " + state.allRows.length + " รายการ";
      var sub = document.getElementById("p019Subtitle");
      if (sub) sub.textContent = "วันที่ " + formatDate(dateFrom) + " ถึง " + formatDate(dateTo);
      quickFilter();
    }).catch(function (err) {
      if (btn) btn.disabled = false;
      resultText.textContent = "⚠ เชื่อมต่อไม่สำเร็จ: " + err.message;
    });
  }

  function loadStatuses() {
    apiFetch("p019_status.php", { connectionId: MAC5_CONNECTION_ID }).then(function (data) {
      if (data.ok && data.statuses && data.statuses.length) {
        state.statuses = data.statuses;
        var box = document.getElementById("p019StatusOptions");
        if (box) {
          box.innerHTML = state.statuses.map(function (s) {
            var code = s.code;
            var parts = s.name.split(":");
            var label = parts.length > 1 ? parts.slice(1).join(":").trim() : s.name;
            return '<label class="p019-status-option"><input type="checkbox" value="' + esc(code) + '" checked><span class="p019-code-mark">' + esc(code) + "</span> : " + esc(label) + "</label>";
          }).join("");
          box.querySelectorAll("input").forEach(function (i) {
            i.addEventListener("change", function () { updateStatusSummary(); quickFilter(); });
          });
        }
        updateStatusSummary();
      }
    }).catch(function () {
      /* fallback — ใช้ STATUS_FALLBACK */
      var box = document.getElementById("p019StatusOptions");
      if (box) {
        box.innerHTML = Object.keys(STATUS_FALLBACK).map(function (c) {
          return '<label class="p019-status-option"><input type="checkbox" value="' + c + '" checked><span class="p019-code-mark">' + c + "</span> : " + STATUS_FALLBACK[c].label + "</label>";
        }).join("");
        box.querySelectorAll("input").forEach(function (i) {
          i.addEventListener("change", function () { updateStatusSummary(); quickFilter(); });
        });
      }
      updateStatusSummary();
    });
  }

  function injectCSS() {
    if (document.getElementById("p019css")) return;
    var style = document.createElement("style");
    style.id = "p019css";
    style.textContent = [
      ".p019-launcher{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;padding:16px 18px;margin-bottom:16px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,.05)}",
      ".p019-field{display:flex;flex-direction:column;gap:6px}",
      ".p019-label{font-size:12px;font-weight:600;color:#64748b}",
      ".p019-date-range{display:flex;align-items:center;gap:8px}",
      ".p019-input-wrap{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px}",
      ".p019-input-wrap svg{width:18px;height:18px;color:#94a3b8;flex:0 0 auto}",
      ".p019-input-wrap input{border:0;outline:0;background:transparent;font:inherit;font-size:14px;width:150px}",
      ".p019-date-sep{color:#64748b;font-size:13px}",
      ".p019-status-sel{position:relative}",
      ".p019-status-btn{display:flex;align-items:center;gap:8px;min-width:220px;padding:8px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;font:inherit;font-size:14px;cursor:pointer}",
      ".p019-status-btn svg{width:16px;height:16px;color:#94a3b8}",
      ".p019-status-menu{position:absolute;top:calc(100% + 6px);left:0;z-index:30;width:280px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 16px 40px rgba(15,23,42,.15);padding:10px;display:none}",
      ".p019-status-menu.show{display:block}",
      ".p019-status-menu-head{display:flex;align-items:center;justify-content:space-between;padding:4px 6px 8px;border-bottom:1px solid #f1f5f9;margin-bottom:6px;font-size:12px;color:#64748b}",
      ".p019-text-link{border:0;background:none;color:#2563eb;font:inherit;font-size:12px;font-weight:600;cursor:pointer;padding:0}",
      ".p019-status-option{display:flex;align-items:center;gap:8px;padding:6px;font-size:13px;cursor:pointer;border-radius:8px}",
      ".p019-status-option:hover{background:#f8fafc}",
      ".p019-status-option input{width:16px;height:16px;accent-color:#2563eb}",
      ".p019-code-mark{display:inline-block;min-width:24px;text-align:center;padding:1px 4px;background:#eff6ff;color:#1d4ed8;border-radius:6px;font-size:12px;font-weight:700}",
      ".p019-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border:0;border-radius:10px;font:inherit;font-size:14px;font-weight:600;cursor:pointer}",
      ".p019-btn svg{width:16px;height:16px}",
      ".p019-btn.primary{background:#2563eb;color:#fff}",
      ".p019-btn.primary:hover{background:#1d4ed8}",
      ".p019-btn:disabled{opacity:.6;cursor:not-allowed}",
      ".p019-result{margin-left:auto;align-self:center;font-size:13px;color:#64748b}",
      ".p019-panel{background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,.05);overflow:hidden}",
      ".p019-panel-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid #f1f5f9}",
      ".p019-panel-heading{display:flex;align-items:center;gap:12px}",
      ".p019-panel-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#eff6ff;color:#2563eb}",
      ".p019-panel-icon svg{width:20px;height:20px}",
      ".p019-panel-title h2{font-size:16px;font-weight:700;margin:0}",
      ".p019-panel-title p{margin:2px 0 0;font-size:12px;color:#64748b}",
      ".p019-table-search{display:flex;align-items:center;gap:8px;padding:7px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px}",
      ".p019-table-search svg{width:16px;height:16px;color:#94a3b8}",
      ".p019-table-search input{border:0;outline:0;background:transparent;font:inherit;font-size:13px;width:220px}",
      ".p019-table-container{overflow-x:auto}",
      ".p019-table-container table{width:100%;border-collapse:collapse;font-size:13px}",
      ".p019-table-container thead th{position:sticky;top:0;background:#f8fafc;padding:10px 14px;text-align:left;font-size:12px;font-weight:700;color:#475569;border-bottom:1px solid #e2e8f0;white-space:nowrap;cursor:pointer;user-select:none}",
      ".p019-table-container thead th .p019-sort-mark{color:#cbd5e1;font-size:11px}",
      ".p019-table-container tbody td{padding:10px 14px;border-bottom:1px solid #f1f5f9}",
      ".p019-table-container tbody tr{cursor:pointer}",
      ".p019-table-container tbody tr:hover{background:#f8fafc}",
      ".p019-table-container tbody tr.p019-selected{background:#eff6ff}",
      ".p019-center{text-align:center}",
      ".p019-doc{font-weight:700;color:#1d4ed8}",
      ".p019-code,.p019-emp{color:#64748b;font-size:12px}",
      ".p019-badge{display:inline-block;min-width:34px;text-align:center;padding:3px 8px;border-radius:999px;font-size:12px;font-weight:700}",
      ".p019-badge.green{background:#ecfdf5;color:#059669}",
      ".p019-badge.orange{background:#fffbeb;color:#d97706}",
      ".p019-badge.red{background:#fef2f2;color:#dc2626}",
      ".p019-badge.blue{background:#eff6ff;color:#2563eb}",
      ".p019-badge.purple{background:#f5f3ff;color:#7c3aed}",
      ".p019-badge.gray{background:#f1f5f9;color:#64748b}",
      ".p019-empty-row td{padding:36px 14px;text-align:center;color:#94a3b8}",
      ".p019-empty-row svg{margin:0 auto 8px}",
      ".p019-table-footer{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;padding:12px 18px;border-top:1px solid #f1f5f9;font-size:12px;color:#64748b}",
      ".p019-pagination{display:flex;align-items:center;gap:8px}",
      ".p019-page-btn{width:28px;height:28px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font:inherit;font-size:14px;cursor:pointer}",
      ".p019-page-btn:disabled{opacity:.4;cursor:not-allowed}",
      ".p019-page-info{font-size:12px;color:#64748b}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function mount(root) {
    state.allRows = [];
    state.currentRows = [];
    state.selectedDocument = "";
    state.sortField = "date";
    state.sortDirection = "asc";
    state.page = 1;
    state.searched = false;
    injectCSS();

    /* วันที่ default — เริ่มต้นค้นหาเป็นวันปัจจุบัน */
    var now = new Date();
    var from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var to = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    root.innerHTML =
      '<form class="p019-launcher" id="p019Form">' +
        '<div class="p019-field">' +
          '<span class="p019-label">วันที่</span>' +
          '<div class="p019-date-range">' +
            '<div class="p019-input-wrap">' + icon("calendar", 18) + '<input id="p019DateFrom" type="date" value="' + isoDate(from) + '"></div>' +
            '<span class="p019-date-sep">ถึง</span>' +
            '<div class="p019-input-wrap">' + icon("calendar", 18) + '<input id="p019DateTo" type="date" value="' + isoDate(to) + '"></div>' +
          "</div>" +
        "</div>" +
        '<div class="p019-field">' +
          '<span class="p019-label">สถานะ</span>' +
          '<div class="p019-status-sel" id="p019StatusSel">' +
            '<button class="p019-status-btn" type="button" id="p019StatusBtn">' +
              '<span id="p019StatusSummary">เลือก <strong>0 สถานะ</strong></span>' + icon("chevron", 16) +
            "</button>" +
            '<div class="p019-status-menu" id="p019StatusMenu">' +
              '<div class="p019-status-menu-head"><span>เลือกทั้งหมด / ไม่เลือกทั้งหมด</span><button class="p019-text-link" type="button" id="p019ToggleAll">สลับทั้งหมด</button></div>' +
              '<div id="p019StatusOptions"></div>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<button class="p019-btn primary" type="submit" id="p019BtnSearch">' + icon("search", 16) + " ค้นหา</button>" +
        '<span class="p019-result" id="p019ResultText"></span>' +
      "</form>" +

      '<section class="p019-panel">' +
        '<div class="p019-panel-header">' +
          '<div class="p019-panel-heading">' +
            '<div class="p019-panel-icon">' + icon("grid", 20) + "</div>" +
            '<div class="p019-panel-title">' +
              "<h2>รายการ Invoice</h2>" +
              '<p id="p019Subtitle">แสดงสถานะส่ง Invoice ตามเงื่อนไขที่เลือก</p>' +
            "</div>" +
          "</div>" +
          '<div class="p019-table-search">' + icon("search", 16) + '<input id="p019QuickSearch" type="search" placeholder="ค้นหา Invoice, รหัส หรือชื่อลูกค้า">' +
          "</div>" +
        "</div>" +
        '<div class="p019-table-container">' +
          '<table>' +
            "<thead><tr>" +
              '<th class="p019-center" data-sort="date">วันที่ <span class="p019-sort-mark">↕</span></th>' +
              '<th data-sort="document">เลขใบสำคัญ <span class="p019-sort-mark">↕</span></th>' +
              '<th data-sort="customerCode">รหัสลูกค้า <span class="p019-sort-mark">↕</span></th>' +
              '<th data-sort="customerName">ชื่อลูกค้า <span class="p019-sort-mark">↕</span></th>' +
              '<th class="p019-center" data-sort="status">สถานะ <span class="p019-sort-mark">↕</span></th>' +
              '<th class="p019-center" data-sort="employee">พนักงาน <span class="p019-sort-mark">↕</span></th>' +
            "</tr></thead>" +
            '<tbody id="p019Rows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p019-table-footer">' +
          '<span id="p019FooterText">แสดง 0 รายการ</span>' +
          '<div class="p019-pagination" id="p019Pagination"></div>' +
          '<div>สถานะที่เลือก <strong id="p019FooterStatus">0 สถานะ</strong></div>' +
        "</div>" +
      "</section>";

    renderRows();

    /* status dropdown */
    var statusSel = document.getElementById("p019StatusSel");
    var statusMenu = document.getElementById("p019StatusMenu");
    document.getElementById("p019StatusBtn").addEventListener("click", function () {
      statusMenu.classList.toggle("show");
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("#p019StatusSel")) statusMenu.classList.remove("show");
    });
    document.getElementById("p019ToggleAll").addEventListener("click", function () {
      var checks = statusMenu.querySelectorAll("input");
      var all = Array.prototype.every.call(checks, function (i) { return i.checked; });
      checks.forEach(function (i) { i.checked = !all; });
      updateStatusSummary();
      quickFilter();
    });

    loadStatuses();

    /* search */
    document.getElementById("p019Form").addEventListener("submit", function (e) {
      e.preventDefault();
      statusMenu.classList.remove("show");
      searchInvoices();
    });

    /* quick search */
    document.getElementById("p019QuickSearch").addEventListener("input", quickFilter);

    /* sort */
    document.querySelectorAll("#p019Root th[data-sort], .p019-panel th[data-sort]").forEach(function (th) {
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
  }

  window.P019InvoiceStatus = { mount: mount };
})();
