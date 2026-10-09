/* P006 — Print Invoice เช็คคืน (clone demo/P006-demo.html + C# MCIT_FrmPrintChqueReturnGUI.cs)
 * IIFE — window.P006PrintInvoice = { mount }
 * Data: API p006_search.php (SQL clone C# L112-122 — MIH LEFT JOIN DEB, MIHtype='IS')
 * UI: launcher (วันที่ Invoice + ผู้สร้าง + คำนำหน้า + สถานะ)
 *     + table (checkbox select + sort + quick search + footer ยอดที่เลือก/ยอดรวม + row แดง cnt>=11)
 *     + report overlay (iframe report/p006_report.html — 2 หน้า/ใบ A4 portrait — clone P130 pattern)
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";

  /* clone C# cb_status (L62-75) — 14 สถานะ hardcoded */
  var STATUS_LIST = [
    { code: "0", name: "0" },
    { code: "2", name: "2-ค่าขนส่งสินค้า" },
    { code: "3", name: "3-VAT" },
    { code: "6", name: "6-รายได้อื่นๆ" },
    { code: "8", name: "8-ด่วน" },
    { code: "9", name: "9-ติดท้ายรถ" },
    { code: "12", name: "12-รอทำ Packing List" },
    { code: "13", name: "13-ออก Packing แล้ว-รอส่ง" },
    { code: "14", name: "14-รอระบุเลขขนส่ง" },
    { code: "16", name: "16-นัดโอน" },
    { code: "18", name: "18-ใส่ Packing แล้ว" },
    { code: "19", name: "19-ใส่ Packing ด่วน" },
    { code: "22", name: "22-ใส่ Packing กทม" },
    { code: "25", name: "25-แจ้งหนี้เช็คคืน" }
  ];

  /* clone C# cbb_FristVnos (Designer L128-148) — คำนำหน้า 18 ค่า */
  var PREFIX_LIST = ["IVN", "IVV", "FAN", "AGN", "FAV", "AGV", "CIV", "CBN", "CBV", "CBX", "IVVN", "IVV7", "DSVN", "AGVN", "DSV7", "AGV7", "1CBN", "2CB7"];

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function formatMoney(v) { return moneyFmt.format(Number(v || 0)); }
  function formatDate(value) {
    var p = String(value || "").split("-");
    if (p.length !== 3) return String(value || "");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function el(id) { return document.getElementById(id); }

  function apiFetch(file, body) {
    return fetch("api/" + file, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  var state = {
    items: [],
    selectedDocs: {},
    sortField: "document",
    sortDirection: "asc",
    searching: false,
    reportUrl: "",
    escBound: false,
    toastTimer: null
  };

  function icon(name, size) {
    var s = size || 20;
    var paths = {
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      user: '<circle cx="12" cy="7" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
      grid: '<path d="M4 4h16v16H4z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>',
      chart: '<path d="M3 3v18h18"></path><path d="m7 16 4-5 4 3 5-7"></path>',
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle>',
      refresh: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path>',
      print: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect>',
      check: '<path d="M20 6 9 17l-5-5"></path>'
    };
    var p = paths[name] || paths.grid;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">' + p + "</svg>";
  }

  function showToast(message) {
    var toast = el("p006Toast");
    if (!toast) return;
    el("p006ToastMessage").textContent = message;
    clearTimeout(state.toastTimer);
    toast.classList.add("show");
    state.toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2200);
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      var first = a[state.sortField];
      var second = b[state.sortField];
      if (typeof first === "string") {
        first = first.toLocaleLowerCase("th");
        second = String(second == null ? "" : second).toLocaleLowerCase("th");
      }
      if (first < second) return state.sortDirection === "asc" ? -1 : 1;
      if (first > second) return state.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  function getSelectedItems() {
    return state.items.filter(function (item) { return !!state.selectedDocs[item.document]; });
  }

  function visibleItems() {
    var qs = el("p006QuickSearch");
    var keyword = qs ? qs.value.trim().toLowerCase() : "";
    if (!keyword) return state.items;
    return state.items.filter(function (item) {
      var text = [item.document, item.customerCode, item.customerName, item.area, item.note].join(" ").toLowerCase();
      return text.indexOf(keyword) !== -1;
    });
  }

  function updateSummary(items) {
    var total = items.reduce(function (s, i) { return s + Number(i.amount || 0); }, 0);
    var t = el("p006FooterTotalAmount");
    if (t) t.textContent = "฿" + formatMoney(total);
  }

  function updateSelectionInfo() {
    var selected = getSelectedItems();
    var amount = selected.reduce(function (s, i) { return s + Number(i.amount || 0); }, 0);
    var t = el("p006FooterSelectedAmount");
    if (t) t.textContent = "฿" + formatMoney(amount);
    var selectAll = el("p006SelectAll");
    if (!selectAll) return;
    var visible = visibleItems();
    var all = visible.length > 0 && visible.every(function (i) { return state.selectedDocs[i.document]; });
    selectAll.checked = all;
    selectAll.indeterminate = !all && visible.some(function (i) { return state.selectedDocs[i.document]; });
  }

  function renderRows() {
    var items = visibleItems();
    var sorted = sortItems(items);
    var tbody = el("p006Rows");
    if (!tbody) return;
    tbody.innerHTML = "";
    var badge = el("p006ResultBadge");
    if (badge) badge.textContent = sorted.length + " รายการ";
    var footerText = el("p006FooterText");
    if (footerText) footerText.textContent = "แสดง " + sorted.length + " รายการ";
    updateSummary(sorted);

    if (sorted.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#64748b;padding:32px">' +
        (state.items.length === 0 ? "ยังไม่มีข้อมูล — กดปุ่ม \"ค้นหา\" เพื่อค้นหาใบสำคัญ" : "ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา") +
        "</td></tr>";
      updateSelectionInfo();
      return;
    }

    sorted.forEach(function (item) {
      var checked = !!state.selectedDocs[item.document];
      /* clone C# Grid1_DataBindingComplete (L1534-1549): cnt >= 11 → LightCoral */
      var tr = document.createElement("tr");
      if (checked) tr.classList.add("selected");
      if (Number(item.cnt || 0) >= 11) tr.classList.add("p006-row-warn");
      tr.innerHTML =
        '<td class="p006-checkbox-cell"><input class="p006-row-checkbox" type="checkbox" data-document="' + esc(item.document) + '"' + (checked ? " checked" : "") + '></td>' +
        '<td class="center">' + esc(item.index) + '</td>' +
        '<td class="p006-document-number">' + esc(item.document) + '</td>' +
        '<td class="p006-customer-code">' + esc(item.customerCode) + '</td>' +
        '<td>' + esc(item.customerName || "-") + '</td>' +
        '<td>' + esc(item.area) + '</td>' +
        '<td class="number p006-amount">฿' + formatMoney(item.amount) + '</td>' +
        '<td class="p006-note" title="' + esc(item.note) + '">' + esc(item.note) + '</td>' +
        '<td class="center"><span class="p006-print-count ' + (item.printCount > 0 ? "printed" : "zero") + '">' + esc(item.printCount) + "</span></td>";
      tr.addEventListener("click", function (event) {
        if (event.target.closest(".p006-row-checkbox")) return;
        var cb = tr.querySelector(".p006-row-checkbox");
        cb.checked = !cb.checked;
        toggleDocument(item.document, cb.checked);
      });
      tbody.appendChild(tr);
    });
    updateSelectionInfo();
  }

  function toggleDocument(documentNumber, checked) {
    if (checked) state.selectedDocs[documentNumber] = true;
    else delete state.selectedDocs[documentNumber];
    renderRows();
  }

  /* ---------- ค้นหา (clone C# bt_search_Click L106-142) ---------- */
  function search(showMessage) {
    if (state.searching) return;
    var dateFrom = el("p006InvoiceDateFrom").value;
    var dateTo = el("p006InvoiceDateTo").value;
    if (!dateFrom || !dateTo) {
      showToast("กรุณาระบุช่วงวันที่ Invoice");
      return;
    }
    var body = {
      connectionId: MAC5_CONNECTION_ID,
      dateFrom: dateFrom,
      dateTo: dateTo,
      prefix: el("p006PrefixSelect").value,
      status: el("p006StatusSelect").value,
      keyUser: el("p006CreatorInput").value.trim()
    };
    state.searching = true;
    var btn = el("p006BtnSearch");
    if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; }
    var periodText = el("p006PeriodText");
    if (periodText) periodText.textContent = "กำลังค้นหา...";

    apiFetch("p006_search.php", body).then(function (data) {
      if (!data.ok) throw new Error(data.error || "ค้นหาไม่สำเร็จ");
      state.items = data.rows.map(function (r, i) {
        r.index = i + 1;
        return r;
      });
      state.selectedDocs = {};
      if (periodText) periodText.textContent = "วันที่ Invoice " + formatDate(dateFrom) + " ถึง " + formatDate(dateTo);
      renderRows();
      if (showMessage) showToast("พบข้อมูล " + data.count + " รายการ");
    }).catch(function (err) {
      state.items = [];
      renderRows();
      showToast("ค้นหาไม่สำเร็จ: " + err.message);
    }).then(function () {
      state.searching = false;
      if (btn) { btn.disabled = false; btn.style.opacity = ""; }
    });
  }

  /* ---------- รายงาน (clone P130 pattern — overlay + iframe report/p006_report.html) ---------- */
  function createReport() {
    var items = getSelectedItems();
    if (items.length === 0) {
      showToast("กรุณาเลือกเอกสารอย่างน้อย 1 รายการ");
      return;
    }
    if (items.length > 50) {
      showToast("เลือกพิมพ์ได้สูงสุด 50 รายการต่อครั้ง");
      return;
    }
    var ids = items.map(function (item) { return item.document; });
    state.reportUrl = "report/p006_report.html?ids=" + ids.join(",") + "&conn=" + encodeURIComponent(MAC5_CONNECTION_ID);

    var overlay = el("p006ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p006ReportOverlay";
      overlay.className = "p006-rep-overlay";
      overlay.innerHTML =
        '<div class="p006-rep-modal">' +
          '<div class="p006-rep-head">' +
            '<div class="p006-rep-headtxt">' +
              '<div class="p006-rep-title">▤ รายงาน Invoice เช็คคืน (MCIT)</div>' +
              '<div class="p006-rep-sub" id="p006RepSub"></div>' +
            "</div>" +
            '<div class="p006-rep-btns">' +
              '<button class="p006-rep-btn" type="button" id="p006RepNewWin" title="เปิดหน้าต่างใหม่">↗</button>' +
              '<button class="p006-rep-btn" type="button" id="p006RepClose" title="ปิด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p006-rep-body"><iframe id="p006RepFrame" title="รายงาน Invoice เช็คคืน"></iframe></div>' +
          '<div class="p006-rep-foot">' +
            '<div class="p006-rep-hint">รายงาน A4 — 2 หน้าต่อ 1 ใบ (สำหรับลูกค้า + Invoice) — พิมพ์จากหน้านี้ได้โดยตรง</div>' +
            '<button class="p006-rep-btn p006-rep-btn-primary" type="button" id="p006RepPrint">' + icon("print", 14) + " พิมพ์</button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p006RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p006RepNewWin").addEventListener("click", function () {
        if (state.reportUrl) window.open(state.reportUrl, "_blank", "width=900,height=1200");
      });
      overlay.querySelector("#p006RepPrint").addEventListener("click", function () {
        var f = el("p006RepFrame");
        if (f && f.contentWindow) {
          try {
            f.contentWindow.focus();
            if (typeof f.contentWindow.onPrintClick === "function") {
              f.contentWindow.onPrintClick();
              return;
            }
            f.contentWindow.print();
            return;
          } catch (err) { /* ignore */ }
        }
        showToast("พิมพ์จาก iframe ไม่ได้ — กด ↗ เพื่อเปิดหน้าต่างใหม่แล้วพิมพ์จากนั้น");
      });
      if (!state.escBound) {
        state.escBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    overlay.querySelector("#p006RepSub").textContent =
      "เลือกเอกสาร " + items.length + " รายการ — " + new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    var f = overlay.querySelector("#p006RepFrame");
    f.src = state.reportUrl;
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeReport() {
    var overlay = el("p006ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    var f = overlay.querySelector("#p006RepFrame");
    if (f) f.src = "about:blank";
    document.body.style.overflow = "";
    /* refresh จำนวนที่พิมพ์ (MIHprintN +1 จากหน้า report) */
    if (state.items.length > 0) search(false);
  }

  function bindEvents() {
    el("p006Form").addEventListener("submit", function (event) {
      event.preventDefault();
      search(true);
    });
    el("p006QuickSearch").addEventListener("input", function () { renderRows(); });
    el("p006Rows").addEventListener("change", function (event) {
      var cb = event.target.closest(".p006-row-checkbox");
      if (!cb) return;
      toggleDocument(cb.getAttribute("data-document"), cb.checked);
    });
    el("p006SelectAll").addEventListener("change", function () {
      var checked = el("p006SelectAll").checked;
      visibleItems().forEach(function (item) {
        if (checked) state.selectedDocs[item.document] = true;
        else delete state.selectedDocs[item.document];
      });
      renderRows();
    });
    document.querySelectorAll("#p006Root th[data-sort]").forEach(function (header) {
      header.addEventListener("click", function () {
        var field = header.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDirection = "asc";
        }
        renderRows();
      });
    });
    el("p006PreviewButton").addEventListener("click", createReport);
  }

  function injectCSS() {
    if (el("p006css")) return;
    var style = document.createElement("style");
    style.id = "p006css";
    style.textContent = [
      ".p006-launcher{padding:16px;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}",
      ".p006-launcher-grid{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px}",
      ".p006-field.span2{grid-column:span 2}",
      ".p006-field label{display:block;margin-bottom:7px;color:#64748b;font-size:11px;font-weight:700}",
      ".p006-date-range{display:grid;grid-template-columns:1fr auto 1fr;gap:7px;align-items:center}",
      ".p006-date-separator{color:#64748b;font-size:12px;font-weight:700}",
      ".p006-input-wrap{position:relative}",
      ".p006-input-wrap>svg{position:absolute;top:50%;left:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
      ".p006-input-wrap input,.p006-input-wrap select{width:100%;height:43px;padding:0 12px 0 39px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px;font-family:inherit}",
      ".p006-input-wrap select{cursor:pointer;appearance:none;padding-right:32px}",
      ".p006-input-wrap input:focus,.p006-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
      ".p006-select-arrow{position:absolute;top:50%;right:12px;width:15px;height:15px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
      ".p006-launcher-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:14px;padding-top:14px;border-top:1px solid #dbe3ef}",
      ".p006-btn{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 20px;border-radius:11px;font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer;transition:.16s ease;border:0;font-family:inherit}",
      ".p006-btn.primary{color:#fff;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22)}",
      ".p006-btn.primary:hover{transform:translateY(-1px);filter:brightness(1.06)}",
      ".p006-btn.secondary{color:#1d4ed8;border:1px solid #bfdbfe;background:#eff6ff}",
      ".p006-btn.secondary:hover{color:#fff;border-color:#2563eb;background:#2563eb}",
      ".p006-panel{display:flex;min-height:480px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08);margin-top:14px}",
      ".p006-panel-header{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid #dbe3ef}",
      ".p006-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
      ".p006-panel-icon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#dc2626;border-radius:11px;background:#fef2f2}",
      ".p006-panel-title h2{overflow:hidden;font-size:15px;text-overflow:ellipsis;white-space:nowrap;margin:0}",
      ".p006-panel-title p{overflow:hidden;margin:1px 0 0;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
      ".p006-panel-actions{display:flex;align-items:center;gap:8px}",
      ".p006-table-search{position:relative;width:250px}",
      ".p006-table-search svg{position:absolute;top:50%;left:10px;width:15px;height:15px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
      ".p006-table-search input{width:100%;height:36px;padding:0 10px 0 32px;border:1px solid #dbe3ef;border-radius:9px;outline:none;font-size:12px;font-family:inherit}",
      ".p006-table-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.12)}",
      ".p006-badge{padding:5px 10px;color:#dc2626;border-radius:999px;background:#fee2e2;font-size:11px;font-weight:700;white-space:nowrap}",
      ".p006-table-container{min-height:0;flex:1;overflow:auto}",
      ".p006-table{width:100%;min-width:1180px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
      ".p006-table th{position:sticky;top:0;z-index:2;padding:12px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:13px;font-weight:700;text-align:left;user-select:none}",
      ".p006-table th.sortable{cursor:pointer}",
      ".p006-table th.sortable:hover{color:#2563eb;background:#f1f5f9}",
      ".p006-table td{max-width:320px;overflow:hidden;padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:13px;line-height:1.45;text-overflow:ellipsis}",
      ".p006-table th.center,.p006-table td.center{text-align:center}",
      ".p006-table th.number,.p006-table td.number{text-align:right}",
      ".p006-table tbody tr{cursor:pointer;transition:.14s ease}",
      ".p006-table tbody tr:nth-child(even){background:#fbfdff}",
      ".p006-table tbody tr:hover{background:#fef2f2}",
      ".p006-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}",
      ".p006-table tbody tr.p006-row-warn{background:#fca5a5 !important}",
      ".p006-table tbody tr.p006-row-warn:hover{background:#fca5a5 !important}",
      ".p006-table tbody tr.p006-row-warn.selected{background:#fdba74 !important;box-shadow:inset 4px 0 #2563eb}",
      ".p006-checkbox-cell{width:40px;text-align:center}",
      ".p006-row-checkbox,.p006-select-all{width:17px;height:17px;accent-color:#2563eb;cursor:pointer}",
      ".p006-document-number{color:#1d4ed8;font-weight:700}",
      ".p006-customer-code{color:#334155;font-weight:700}",
      ".p006-amount{color:#b91c1c;font-variant-numeric:tabular-nums;font-weight:700}",
      ".p006-note{color:#475569;font-size:12px}",
      ".p006-print-count{display:inline-flex;min-width:26px;align-items:center;justify-content:center;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700}",
      ".p006-print-count.zero{color:#b45309;background:#fef3c7}",
      ".p006-print-count.printed{color:#047857;background:#d1fae5}",
      ".p006-table-footer{display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
      ".p006-footer-totals{display:flex;gap:8px}",
      ".p006-footer-total{display:flex;align-items:center;gap:7px;padding:6px 11px;color:#172033;border:1px solid #dbe3ef;border-radius:9px;background:#fff}",
      ".p006-footer-total strong{color:#dc2626}",
      ".p006-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
      ".p006-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
      ".p006-toast svg{width:17px;height:17px;color:#34d399}",
      ".p006-rep-overlay{display:none;position:fixed;inset:0;z-index:900;align-items:center;justify-content:center;background:rgba(2,6,23,.8);padding:18px}",
      ".p006-rep-overlay.show{display:flex}",
      ".p006-rep-modal{display:flex;width:min(1100px,100%);height:94vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.35)}",
      ".p006-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid #dbe3ef}",
      ".p006-rep-headtxt{display:flex;flex-direction:column;gap:2px;min-width:0}",
      ".p006-rep-title{font-size:15px;font-weight:700;color:#172033}",
      ".p006-rep-sub{font-size:12px;color:#64748b}",
      ".p006-rep-btns{display:flex;gap:8px;flex-shrink:0}",
      ".p006-rep-btn{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;gap:6px;color:#64748b;border:1px solid #dbe3ef;border-radius:9px;background:transparent;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:.15s}",
      ".p006-rep-btn:hover{color:#172033;border-color:#2563eb}",
      ".p006-rep-body{flex:1;min-height:0;background:#e2e8f0;display:flex;justify-content:center;overflow:auto;padding:18px}",
      ".p006-rep-body iframe{width:100%;height:100%;border:1px solid #dbe3ef;border-radius:10px;background:#fff}",
      ".p006-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;border-top:1px solid #dbe3ef}",
      ".p006-rep-hint{font-size:12px;color:#64748b}",
      ".p006-rep-btn-primary{height:38px;padding:0 18px;background:#2563eb;color:#fff;border-color:#2563eb;font-weight:700;font-size:13px}",
      ".p006-rep-btn-primary:hover{filter:brightness(1.08);color:#fff}",
      "@media (max-width:1100px){.p006-launcher-grid{grid-template-columns:repeat(2,1fr)}}",
      "@media (max-width:680px){.p006-launcher-grid{grid-template-columns:1fr}.p006-date-range{grid-template-columns:1fr}.p006-date-separator{display:none}.p006-launcher-actions{flex-direction:column}.p006-btn{width:100%}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function mount(root) {
    if (!root) return;
    state.items = [];
    state.selectedDocs = {};
    state.sortField = "document";
    state.sortDirection = "asc";
    document.querySelectorAll(".p006-rep-overlay").forEach(function (e) { e.remove(); });
    document.querySelectorAll(".p006-toast").forEach(function (e) { e.remove(); });
    injectCSS();

    /* default — วันปัจจุบัน (pattern P019) + 1CBN + 25 (clone demo) */
    var todayISO = isoDate(new Date());

    var selectArrow = '<svg class="p006-select-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>';

    var prefixOptions = PREFIX_LIST.map(function (p) {
      return '<option value="' + esc(p) + '"' + (p === "1CBN" ? " selected" : "") + ">" + esc(p) + "</option>";
    }).join("");

    var statusOptions = STATUS_LIST.map(function (s) {
      return '<option value="' + esc(s.code) + '"' + (s.code === "25" ? " selected" : "") + ">" + esc(s.name) + "</option>";
    }).join("");

    root.innerHTML =
      '<form class="p006-launcher" id="p006Form">' +
        '<div class="p006-launcher-grid">' +
          '<div class="p006-field span2">' +
            "<label>วันที่ Invoice</label>" +
            '<div class="p006-date-range">' +
              '<div class="p006-input-wrap">' + icon("calendar", 17) + '<input id="p006InvoiceDateFrom" type="date" value="' + todayISO + '"></div>' +
              '<span class="p006-date-separator">ถึง</span>' +
              '<div class="p006-input-wrap">' + icon("calendar", 17) + '<input id="p006InvoiceDateTo" type="date" value="' + todayISO + '"></div>' +
            "</div>" +
          "</div>" +
          '<div class="p006-field span2">' +
            '<label for="p006CreatorInput">ผู้สร้างเอกสาร</label>' +
            '<div class="p006-input-wrap">' + icon("user", 17) + '<input id="p006CreatorInput" type="text" placeholder="ระบุผู้สร้างเอกสาร" autocomplete="off"></div>' +
          "</div>" +
          '<div class="p006-field span2">' +
            '<label for="p006PrefixSelect">คำนำหน้าใบสำคัญ</label>' +
            '<div class="p006-input-wrap">' + icon("grid", 17) +
              '<select id="p006PrefixSelect">' + prefixOptions + "</select>" +
              selectArrow +
            "</div>" +
          "</div>" +
          '<div class="p006-field span2">' +
            '<label for="p006StatusSelect">สถานะ Invoice</label>' +
            '<div class="p006-input-wrap">' + icon("chart", 17) +
              '<select id="p006StatusSelect">' + statusOptions + "</select>" +
              selectArrow +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="p006-launcher-actions">' +
          '<button class="p006-btn primary" type="submit" id="p006BtnSearch">' + icon("search", 16) + " ค้นหา</button>" +
          '<button class="p006-btn secondary" id="p006PreviewButton" type="button">' + icon("eye", 16) + " Print Preview</button>" +
        "</div>" +
      "</form>" +

      '<section class="p006-panel">' +
        '<div class="p006-panel-header">' +
          '<div class="p006-panel-heading">' +
            '<div class="p006-panel-icon">' + icon("refresh", 18) + "</div>" +
            '<div class="p006-panel-title">' +
              "<h2>รายการใบสำคัญเช็คคืน</h2>" +
              '<p id="p006PeriodText"></p>' +
            "</div>" +
          "</div>" +
          '<div class="p006-panel-actions">' +
            '<div class="p006-table-search">' + icon("search", 15) + '<input id="p006QuickSearch" type="search" placeholder="ค้นหาเลขที่, รหัสลูกค้า หรือพื้นที่"></div>' +
            '<span class="p006-badge" id="p006ResultBadge">0 รายการ</span>' +
          "</div>" +
        "</div>" +
        '<div class="p006-table-container">' +
          '<table class="p006-table">' +
            "<thead><tr>" +
              '<th class="p006-checkbox-cell"><input id="p006SelectAll" class="p006-select-all" type="checkbox" aria-label="เลือกทั้งหมด"></th>' +
              '<th class="sortable center" data-sort="index">ลำดับ</th>' +
              '<th class="sortable" data-sort="document">เลขที่ใบสำคัญ</th>' +
              '<th class="sortable" data-sort="customerCode">รหัสลูกค้า</th>' +
              "<th>ชื่อลูกค้า</th>" +
              '<th class="sortable" data-sort="area">พื้นที่</th>' +
              '<th class="sortable number" data-sort="amount">ยอดรวม</th>' +
              "<th>หมายเหตุ</th>" +
              '<th class="sortable center" data-sort="printCount">จำนวนที่พิมพ์</th>' +
            "</tr></thead>" +
            '<tbody id="p006Rows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p006-table-footer">' +
          '<span id="p006FooterText">แสดง 0 รายการ</span>' +
          '<div class="p006-footer-totals">' +
            '<div class="p006-footer-total"><span>ยอดที่เลือก</span><strong id="p006FooterSelectedAmount">฿0.00</strong></div>' +
            '<div class="p006-footer-total"><span>ยอดรวมทั้งหมด</span><strong id="p006FooterTotalAmount">฿0.00</strong></div>' +
          "</div>" +
        "</div>" +
      "</section>";

    var toast = document.createElement("div");
    toast.className = "p006-toast";
    toast.id = "p006Toast";
    toast.innerHTML = icon("check", 17) + '<span id="p006ToastMessage"></span>';
    document.body.appendChild(toast);

    bindEvents();
    renderRows();
  }

  window.P006PrintInvoice = { mount: mount };
})();
