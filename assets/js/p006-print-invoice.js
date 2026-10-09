/* P006 — Print Invoice เช็คคืน (clone demo/P006-demo.html)
 * IIFE — window.P006PrintInvoice = { mount }
 * Data: MOCK 8 รายการ (ตาม demo) — TODO: ต่อ API
 * UI: launcher (วันที่ Invoice + วันที่สร้างเอกสาร + ผู้สร้าง + รหัสผู้แทน + คำนำหน้า + สถานะ)
 *     + table (checkbox select + sort + quick search + footer ยอดที่เลือก/ยอดรวม)
 *     + modal Print Preview (A4 landscape) + toast
 */
(function () {
  "use strict";

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

  /* MOCK — ตาม demo/P006-demo.html (status/creator/salesperson เพิ่มให้ filter ใช้งานได้ — ต่อ API แล้วจะแทน) */
  var invoices = [
    { index: 1, document: "1CBN6910-0001", customerCode: "10150-141", customerName: "", area: "จ.กรุงเทพฯ", amount: 4000.00, note: "ตั๋วหนี้เช็ค เลขที่ 10020066/0921004 ลงวันที่ 29/09/2569", printCount: 0, date: "2026-10-01", createDate: "2026-10-01", status: 25, creator: "S01", salesperson: "S01" },
    { index: 2, document: "1CBN6910-0002", customerCode: "21120-001", customerName: "", area: "จ.ระยอง", amount: 94575.00, note: "ตั๋วหนี้เช็ค เลขที่ 88405348/083113 ลงวันที่ 30/09/2569", printCount: 0, date: "2026-10-01", createDate: "2026-10-01", status: 25, creator: "S01", salesperson: "S01" },
    { index: 3, document: "1CBN6910-0003", customerCode: "80000-091", customerName: "", area: "จ.นครศรีธรรมราช", amount: 46192.00, note: "ตั๋วหนี้เช็ค เลขที่ 26228266/0916003 ลงวันที่ 01/10/2569", printCount: 0, date: "2026-10-01", createDate: "2026-10-01", status: 25, creator: "S01", salesperson: "S01" },
    { index: 4, document: "1CBN6910-0004", customerCode: "80000-091", customerName: "", area: "จ.นครศรีธรรมราช", amount: 50100.00, note: "ตั๋วหนี้เช็ค เลขที่ 26228268/0916004 ลงวันที่ 05/10/2569", printCount: 0, date: "2026-10-02", createDate: "2026-10-02", status: 25, creator: "S01", salesperson: "S01" },
    { index: 5, document: "1CBN6910-0005", customerCode: "48130-011", customerName: "", area: "จ.นครพนม", amount: 12024.00, note: "ตั๋วหนี้เช็ค เลขที่ 00475819/091516 ลงวันที่ 03/10/2569", printCount: 0, date: "2026-10-03", createDate: "2026-10-03", status: 25, creator: "S01", salesperson: "S01" },
    { index: 6, document: "1CBN6910-0006", customerCode: "48140-008", customerName: "", area: "จ.นครพนม", amount: 36733.00, note: "ตั๋วหนี้เช็ค เลขที่ 00258724/091803 ลงวันที่ 03/10/2569", printCount: 0, date: "2026-10-03", createDate: "2026-10-03", status: 25, creator: "S01", salesperson: "S01" },
    { index: 7, document: "1CBN6910-0007", customerCode: "85000-011", customerName: "", area: "จ.ระนอง", amount: 4197.00, note: "ตั๋วหนี้เช็ค เลขที่ 02659458/091107 ลงวันที่ 06/10/2569", printCount: 0, date: "2026-10-06", createDate: "2026-10-06", status: 25, creator: "S01", salesperson: "S01" },
    { index: 8, document: "1CBN6910-0008", customerCode: "62150-004", customerName: "", area: "จ.กำแพงเพชร", amount: 8150.00, note: "ตั๋วหนี้เช็ค เลขที่ 11458812/091209 ลงวันที่ 07/10/2569", printCount: 1, date: "2026-10-07", createDate: "2026-10-07", status: 25, creator: "S01", salesperson: "S01" }
  ];

  var state = {
    filteredItems: [],
    selectedDocs: {},
    sortField: "document",
    sortDirection: "asc",
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
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
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
    state.toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
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
    return invoices.filter(function (item) { return !!state.selectedDocs[item.document]; });
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
    var all = state.filteredItems.length > 0 && state.filteredItems.every(function (i) { return state.selectedDocs[i.document]; });
    selectAll.checked = all;
    selectAll.indeterminate = !all && state.filteredItems.some(function (i) { return state.selectedDocs[i.document]; });
  }

  function renderRows(items) {
    var sorted = sortItems(items);
    var tbody = el("p006Rows");
    if (!tbody) return;
    tbody.innerHTML = "";
    var badge = el("p006ResultBadge");
    if (badge) badge.textContent = sorted.length + " รายการ";
    var footerText = el("p006FooterText");
    if (footerText) footerText.textContent = "แสดง " + sorted.length + " รายการ";
    updateSummary(sorted);

    sorted.forEach(function (item) {
      var checked = !!state.selectedDocs[item.document];
      var tr = document.createElement("tr");
      if (checked) tr.classList.add("selected");
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
    renderRows(state.filteredItems);
  }

  function applyFilters(showMessage) {
    var invoiceFrom = el("p006InvoiceDateFrom").value;
    var invoiceTo = el("p006InvoiceDateTo").value;
    var createFrom = el("p006CreateDateFrom").value;
    var createTo = el("p006CreateDateTo").value;
    var creator = el("p006CreatorInput").value.trim().toLowerCase();
    var salesperson = el("p006SalespersonInput").value.trim().toLowerCase();
    var prefix = el("p006PrefixSelect").value;
    var status = el("p006StatusSelect").value;
    var keyword = el("p006QuickSearch").value.trim().toLowerCase();

    state.filteredItems = invoices.filter(function (item) {
      var matchInvoiceDate = (!invoiceFrom || item.date >= invoiceFrom) && (!invoiceTo || item.date <= invoiceTo);
      var matchCreateDate = (!createFrom || item.createDate >= createFrom) && (!createTo || item.createDate <= createTo);
      var matchPrefix = prefix === "all" || item.document.indexOf(prefix) === 0;
      var matchStatus = status === "all" || String(item.status) === status;
      var matchCreator = !creator || String(item.creator || "").toLowerCase().indexOf(creator) !== -1;
      var matchSales = !salesperson || String(item.salesperson || "").toLowerCase().indexOf(salesperson) !== -1;
      var text = [item.document, item.customerCode, item.area, item.note].join(" ").toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      return matchInvoiceDate && matchCreateDate && matchPrefix && matchStatus && matchCreator && matchSales && matchKeyword;
    });

    var periodText = el("p006PeriodText");
    if (periodText) periodText.textContent = "วันที่ Invoice " + formatDate(invoiceFrom) + " ถึง " + formatDate(invoiceTo);
    renderRows(state.filteredItems);
    if (showMessage) showToast("พบข้อมูล " + state.filteredItems.length + " รายการ");
  }

  function renderPreview() {
    var selected = sortItems(getSelectedItems());
    var rowsHtml = selected.map(function (item, i) {
      return '<tr><td class="center">' + (i + 1) + "</td><td>" + esc(item.document) + "</td><td>" + esc(item.customerCode) + "</td><td>" + esc(item.area) + '</td><td class="number">' + formatMoney(item.amount) + "</td><td>" + esc(item.note) + "</td></tr>";
    }).join("");
    var total = selected.reduce(function (s, i) { return s + Number(i.amount || 0); }, 0);
    rowsHtml += '<tr class="total-row"><td class="center" colspan="4">ยอดรวมทั้งสิ้น</td><td class="number">' + formatMoney(total) + "</td><td></td></tr>";
    el("p006PaperRows").innerHTML = rowsHtml;
    el("p006PreviewSubtitle").textContent = "เลือกเอกสาร " + selected.length + " รายการ";
    el("p006PaperCount").textContent = selected.length + " รายการ";
    var prefixSel = el("p006PrefixSelect");
    el("p006PaperPrefix").textContent = prefixSel.selectedOptions[0].textContent;
    el("p006PaperPeriod").textContent = formatDate(el("p006InvoiceDateFrom").value) + " - " + formatDate(el("p006InvoiceDateTo").value);
    el("p006PaperPrintDate").textContent = new Date().toLocaleDateString("th-TH");
  }

  function openPreview() {
    if (!Object.keys(state.selectedDocs).length) {
      showToast("กรุณาเลือกเอกสารอย่างน้อย 1 รายการ");
      return;
    }
    renderPreview();
    el("p006Modal").classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closePreview() {
    var m = el("p006Modal");
    if (m) m.classList.remove("show");
    document.body.style.overflow = "";
  }

  function markAsPrinted() {
    invoices.forEach(function (item) {
      if (state.selectedDocs[item.document]) item.printCount += 1;
    });
    renderRows(state.filteredItems);
  }

  var escapeBound = false;
  function bindEscape() {
    if (escapeBound) return;
    escapeBound = true;
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closePreview();
    });
  }

  function injectCSS() {
    if (document.getElementById("p006css")) return;
    var style = document.createElement("style");
    style.id = "p006css";
    style.textContent = [
      ".p006-launcher{padding:16px;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}",
      ".p006-launcher-grid{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px}",
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
      ".p006-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.52);backdrop-filter:blur(4px)}",
      ".p006-modal-backdrop.show{display:grid}",
      ".p006-modal{display:flex;width:min(1150px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
      ".p006-modal-header{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #dbe3ef}",
      ".p006-modal-heading{display:flex;align-items:center;gap:10px}",
      ".p006-modal-heading-icon{display:grid;width:38px;height:38px;place-items:center;color:#dc2626;border-radius:11px;background:#fef2f2}",
      ".p006-modal-heading h3{font-size:15px;margin:0}",
      ".p006-modal-heading p{color:#64748b;font-size:10px;margin:0}",
      ".p006-modal-tools{display:flex;align-items:center;gap:6px}",
      ".p006-modal-tool,.p006-modal-close{display:inline-flex;height:36px;align-items:center;justify-content:center;gap:6px;padding:0 11px;color:#64748b;border:1px solid #dbe3ef;border-radius:9px;background:#fff;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}",
      ".p006-modal-tool.print{color:#fff;border-color:#dc2626;background:#dc2626}",
      ".p006-modal-close{width:36px;padding:0;font-size:20px}",
      ".p006-modal-close:hover{color:#dc2626;border-color:#fecaca;background:#fef2f2}",
      ".p006-preview-area{position:relative;min-height:0;flex:1;overflow:auto;background-color:#d7dde5;background-image:linear-gradient(45deg,#cdd4dd 25%,transparent 25%),linear-gradient(-45deg,#cdd4dd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#cdd4dd 75%),linear-gradient(-45deg,transparent 75%,#cdd4dd 75%);background-position:0 0,0 10px,10px -10px,-10px 0;background-size:20px 20px}",
      ".p006-preview-stage{display:grid;min-width:100%;min-height:100%;place-items:center;padding:40px}",
      ".p006-report-paper{width:1000px;min-height:650px;padding:44px 46px;color:#111827;background:#fff;box-shadow:0 20px 52px rgba(15,23,42,.32)}",
      ".p006-paper-company{text-align:center}",
      ".p006-paper-company h2{font-size:19px;margin:0}",
      ".p006-paper-company p{margin:3px 0 0;font-size:10px}",
      ".p006-paper-title{margin:20px 0 14px;font-size:20px;text-align:center}",
      ".p006-paper-meta{display:grid;grid-template-columns:repeat(2,1fr);margin-bottom:14px;border-top:1px solid #334155;border-left:1px solid #334155}",
      ".p006-paper-meta div{min-height:42px;padding:7px 9px;border-right:1px solid #334155;border-bottom:1px solid #334155;font-size:11px}",
      ".p006-paper-meta span{display:block;color:#64748b;font-size:9px}",
      ".p006-paper-meta strong{display:block;margin-top:2px}",
      ".p006-paper-table{width:100%;border-collapse:collapse;table-layout:fixed}",
      ".p006-paper-table th{padding:7px 6px;color:#111827;border:1px solid #475569;background:#e2e8f0;font-size:10px;text-align:left}",
      ".p006-paper-table td{padding:7px 6px;border:1px solid #94a3b8;font-size:10px;vertical-align:top;overflow-wrap:anywhere}",
      ".p006-paper-table .number{text-align:right}",
      ".p006-paper-table .center{text-align:center}",
      ".p006-paper-table tr.total-row td{background:#e2e8f0;font-weight:700}",
      ".p006-paper-signature{display:grid;grid-template-columns:repeat(3,1fr);gap:46px;margin-top:68px}",
      ".p006-signature-box{padding-top:10px;border-top:1px solid #475569;font-size:10px;text-align:center}",
      ".p006-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
      ".p006-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
      ".p006-toast svg{width:17px;height:17px;color:#34d399}",
      "@media (max-width:1100px){.p006-launcher-grid{grid-template-columns:repeat(2,1fr)}}",
      "@media (max-width:680px){.p006-launcher-grid{grid-template-columns:1fr}.p006-date-range{grid-template-columns:1fr}.p006-date-separator{display:none}.p006-launcher-actions{flex-direction:column}.p006-btn{width:100%}}",
      "@media print{@page{size:A4 landscape;margin:8mm}body *{visibility:hidden !important}#p006Paper,#p006Paper *{visibility:visible !important}#p006Paper{position:absolute;top:0;left:0;width:281mm;min-height:0;padding:4mm;box-shadow:none}.p006-paper-table th,.p006-paper-table td{padding:4px;font-size:8px}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function mount(root) {
    if (!root) return;
    state.filteredItems = [];
    state.selectedDocs = {};
    state.sortField = "document";
    state.sortDirection = "asc";
    /* ลบ modal/toast เก่าจาก body (ถ้ามี) */
    document.querySelectorAll(".p006-modal-backdrop").forEach(function (e) { e.remove(); });
    document.querySelectorAll(".p006-toast").forEach(function (e) { e.remove(); });
    injectCSS();

    /* default — clone demo: 1 แห่งเดือนก่อนหน้า → วันนี้ */
    var now = new Date();
    var fromISO = isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    var toISO = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

    var selectArrow = '<svg class="p006-select-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>';

    root.innerHTML =
      '<form class="p006-launcher" id="p006Form">' +
        '<div class="p006-launcher-grid">' +
          '<div class="p006-field">' +
            "<label>วันที่ Invoice</label>" +
            '<div class="p006-date-range">' +
              '<div class="p006-input-wrap">' + icon("calendar", 17) + '<input id="p006InvoiceDateFrom" type="date" value="' + fromISO + '"></div>' +
              '<span class="p006-date-separator">ถึง</span>' +
              '<div class="p006-input-wrap">' + icon("calendar", 17) + '<input id="p006InvoiceDateTo" type="date" value="' + toISO + '"></div>' +
            "</div>" +
          "</div>" +
          '<div class="p006-field">' +
            "<label>วันที่สร้างเอกสาร</label>" +
            '<div class="p006-date-range">' +
              '<div class="p006-input-wrap">' + icon("calendar", 17) + '<input id="p006CreateDateFrom" type="date" value="' + fromISO + '"></div>' +
              '<span class="p006-date-separator">ถึง</span>' +
              '<div class="p006-input-wrap">' + icon("calendar", 17) + '<input id="p006CreateDateTo" type="date" value="' + toISO + '"></div>' +
            "</div>" +
          "</div>" +
          '<div class="p006-field">' +
            '<label for="p006CreatorInput">ผู้สร้างเอกสาร</label>' +
            '<div class="p006-input-wrap">' + icon("user", 17) + '<input id="p006CreatorInput" type="text" placeholder="ระบุผู้สร้างเอกสาร" autocomplete="off"></div>' +
          "</div>" +
          '<div class="p006-field">' +
            '<label for="p006SalespersonInput">รหัสผู้แทน</label>' +
            '<div class="p006-input-wrap">' + icon("user", 17) + '<input id="p006SalespersonInput" type="text" placeholder="ระบุรหัสผู้แทน" autocomplete="off"></div>' +
          "</div>" +
          '<div class="p006-field">' +
            '<label for="p006PrefixSelect">คำนำหน้าใบสำคัญ</label>' +
            '<div class="p006-input-wrap">' + icon("grid", 17) +
              '<select id="p006PrefixSelect">' +
                '<option value="all">ทั้งหมด</option>' +
                '<option value="1CBN" selected>1CBN</option>' +
                '<option value="CODN">CODN</option>' +
                '<option value="IVVN">IVVN</option>' +
              "</select>" +
              selectArrow +
            "</div>" +
          "</div>" +
          '<div class="p006-field">' +
            '<label for="p006StatusSelect">สถานะ Invoice</label>' +
            '<div class="p006-input-wrap">' + icon("chart", 17) +
              '<select id="p006StatusSelect">' +
                '<option value="all">ทั้งหมด</option>' +
                '<option value="25" selected>25 · แจ้งหนี้เช็คคืน</option>' +
                '<option value="26">26 · รอดำเนินการ</option>' +
                '<option value="27">27 · ดำเนินการแล้ว</option>' +
              "</select>" +
              selectArrow +
            "</div>" +
          "</div>" +
        "</div>" +
        '<div class="p006-launcher-actions">' +
          '<button class="p006-btn primary" type="submit">' + icon("search", 16) + " ค้นหา</button>" +
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

    /* modal print preview — append ไป body (position:fixed) */
    var modal = document.createElement("div");
    modal.className = "p006-modal-backdrop";
    modal.id = "p006Modal";
    modal.innerHTML =
      '<section class="p006-modal" role="dialog" aria-modal="true">' +
        '<div class="p006-modal-header">' +
          '<div class="p006-modal-heading">' +
            '<div class="p006-modal-heading-icon">' + icon("file", 18) + "</div>" +
            "<div>" +
              "<h3>ตัวอย่างรายงานเช็คคืน</h3>" +
              '<p id="p006PreviewSubtitle">เลือกเอกสาร 0 รายการ</p>' +
            "</div>" +
          "</div>" +
          '<div class="p006-modal-tools">' +
            '<button class="p006-modal-tool print" id="p006PrintButton" type="button">' + icon("print", 14) + " พิมพ์</button>" +
            '<button class="p006-modal-close" id="p006CloseModal" type="button" aria-label="ปิด">×</button>' +
          "</div>" +
        "</div>" +
        '<div class="p006-preview-area">' +
          '<div class="p006-preview-stage">' +
            '<article class="p006-report-paper" id="p006Paper">' +
              '<header class="p006-paper-company">' +
                "<h2>บริษัท เอ็มซีไอที จำกัด</h2>" +
                "<p>รายงานใบสำคัญ Invoice เช็คคืน</p>" +
              "</header>" +
              '<h1 class="p006-paper-title">รายงาน Print Invoice เช็คคืน</h1>' +
              '<section class="p006-paper-meta">' +
                '<div><span>ช่วงวันที่ Invoice</span><strong id="p006PaperPeriod">-</strong></div>' +
                '<div><span>จำนวนเอกสาร</span><strong id="p006PaperCount">0 รายการ</strong></div>' +
                '<div><span>คำนำหน้าใบสำคัญ</span><strong id="p006PaperPrefix">1CBN</strong></div>' +
                '<div><span>วันที่พิมพ์</span><strong id="p006PaperPrintDate">-</strong></div>' +
              "</section>" +
              '<table class="p006-paper-table">' +
                "<thead><tr>" +
                  '<th class="center" style="width:6%">ลำดับ</th>' +
                  '<th style="width:17%">เลขที่ใบสำคัญ</th>' +
                  '<th style="width:12%">รหัสลูกค้า</th>' +
                  '<th style="width:20%">พื้นที่</th>' +
                  '<th class="number" style="width:13%">ยอดรวม</th>' +
                  '<th style="width:32%">หมายเหตุ</th>' +
                "</tr></thead>" +
                '<tbody id="p006PaperRows"></tbody>' +
              "</table>" +
              '<section class="p006-paper-signature">' +
                '<div class="p006-signature-box">ผู้จัดทำเอกสาร</div>' +
                '<div class="p006-signature-box">ผู้ตรวจสอบ</div>' +
                '<div class="p006-signature-box">ผู้อนุมัติ</div>' +
              "</section>" +
            "</article>" +
          "</div>" +
        "</div>" +
      "</section>";
    document.body.appendChild(modal);

    var toast = document.createElement("div");
    toast.className = "p006-toast";
    toast.id = "p006Toast";
    toast.innerHTML = icon("check", 17) + '<span id="p006ToastMessage"></span>';
    document.body.appendChild(toast);

    /* events */
    el("p006Form").addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilters(true);
    });
    el("p006QuickSearch").addEventListener("input", function () { applyFilters(false); });
    el("p006Rows").addEventListener("change", function (event) {
      var cb = event.target.closest(".p006-row-checkbox");
      if (!cb) return;
      toggleDocument(cb.getAttribute("data-document"), cb.checked);
    });
    el("p006SelectAll").addEventListener("change", function () {
      var checked = el("p006SelectAll").checked;
      state.filteredItems.forEach(function (item) {
        if (checked) state.selectedDocs[item.document] = true;
        else delete state.selectedDocs[item.document];
      });
      renderRows(state.filteredItems);
    });
    root.querySelectorAll("th[data-sort]").forEach(function (header) {
      header.addEventListener("click", function () {
        var field = header.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDirection = "asc";
        }
        renderRows(state.filteredItems);
      });
    });
    el("p006PreviewButton").addEventListener("click", openPreview);
    el("p006CloseModal").addEventListener("click", closePreview);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closePreview();
    });
    el("p006PrintButton").addEventListener("click", function () {
      markAsPrinted();
      window.print();
    });
    bindEscape();

    applyFilters(false);
  }

  window.P006PrintInvoice = { mount: mount };
})();
