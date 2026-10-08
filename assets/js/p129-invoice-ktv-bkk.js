/**
 * P129 — Print Invoice KTV (หน้าแอปใน ERP Portal)
 * ข้อมูลจริงจาก API: api/p129_invoices.php (SQL Server M5CM-AA-01)
 * - ฐานข้อมูลใช้ MAC5 เสมอ (ไม่แสดง dropdown — resolve id ภายใน)
 * - ไม่ auto search — กดปุ่ม "⌕ ค้นหา" เอง
 * - Doctype + Status = required (ไม่มีตัวเลือก "ทั้งหมด") default = ตัวเลือกแรกสุด
 * - วันที่ default = วันที่ปัจจุบัน
 * - แบ่งหน้า 15 รายการ/หน้า, checkbox เลือกแถว (หัวตาราง = หน้าปัจจุบัน)
 * - การเลือกคงอยู่ข้ามหน้า — นับจำนวนที่เลือกด้านล่าง (ไม่มียอดรวม)
 * - รองรับธีม Dark / UI Scale (ใช้ CSS variables ของ portal)
 */
(function () {
  "use strict";

  var STYLE_ID = "p129-invoice-ktv-bkk-style";
  var PAGE_SIZE = 15;

  // ธีม: light/dark — variables p129-* (กำหนดตาม data-theme ของ <html>)
  var CSS_VARS = `
    :root {
      --p129-text: #172033;
      --p129-text-secondary: #334155;
      --p129-muted: #64748b;
      --p129-border: #e2e8f0;
      --p129-border-hover: #93c5fd;
      --p129-surface: #ffffff;
      --p129-hover: #f8fbff;
      --p129-primary: #2563eb;
      --p129-primary-hover: #1d4ed8;
      --p129-primary-soft: #eff6ff;
      --p129-focus-soft: rgb(37 99 235 / 15%);
    }
    [data-theme="dark"] {
      --p129-text: #e2e8f0;
      --p129-text-secondary: #cbd5e1;
      --p129-muted: #94a3b8;
      --p129-border: #334155;
      --p129-border-hover: #3b82f6;
      --p129-surface: #111c2e;
      --p129-hover: #16233a;
      --p129-primary: #3b82f6;
      --p129-primary-hover: #60a5fa;
      --p129-primary-soft: rgb(59 130 246 / 25%);
      --p129-focus-soft: rgb(96 165 250 / 20%);
    }
  `;

  var DOCTYPE_LIST = ["IVVN", "ICVN", "IMV7", "IMVN", "IVSP", "CODN"];

  var STATUS_LIST = {
    "3": "3 - ด่วน",
    "4": "4 - ปกติ - BKK",
    "5": "5 - ด่วน - BKK",
    "6": "6 - ลูกค้ารับเอง",
    "17": "17 - ติดท้ายรถ",
    "18": "18 - PickList QC/PD",
    "23": "23 - ค่าขนส่ง",
    "24": "24 - รายได้อื่น",
    "25": "25 - เช็คคืน",
    "32": "32 - Pack - ปกติ",
    "33": "33 - Pack - ด่วน",
    "34": "34 - Pack - ปกติ BKK",
    "35": "35 - Pack - ด่วน BKK",
    "42": "42 - INV - ปกติ",
    "43": "43 - INV - ด่วน",
    "44": "44 - INV - ปกติ BKK",
    "45": "45 - INV - ด่วน BKK",
    "50": "50 - PL ปกติ",
    "51": "51 - PL ด่วน",
    "52": "52 - Picking List ปกติ",
    "53": "53 - Picking List ด่วน",
    "54": "54 - PL ปกติ BKK",
    "55": "55 - PL ด่วน BKK",
    "60": "60 - ADS",
    "61": "61 - ADS ส่ง WH",
    "62": "62 - ADS ส่ง ACC",
    "65": "65 - WH",
    "67": "67 - Not Ship"
  };

  // รายการ invoice จาก API
  var filteredInvoices = [];
  var selectedIds = {}; // id → true (คงอยู่ข้ามหน้า/ข้ามการค้น)
  var currentPage = 1;

  // ฐานข้อมูล MAC5 (resolve id ภายใน — ไม่แสดง dropdown)
  var mac5Id = "";
  var mac5Name = "MAC5";

  var CSS = `
    .p129 { color: var(--p129-text); }
    .p129 * { box-sizing: border-box; }
    .p129 button, .p129 input, .p129 select { font: inherit; }
    .p129 button { cursor: pointer; }

    .p129-filter-card, .p129-table-card, .p129-hint-card {
      border: 1px solid var(--p129-border);
      border-radius: 16px;
      background: var(--p129-surface);
      box-shadow: var(--shadow-card);
    }
    .p129-filter-card { padding: 24px; }
    .p129-filter-title { margin: 0 0 20px; font-size: 17px; }
    .p129-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .p129-field { display: grid; gap: 7px; }
    .p129-field > label { color: var(--p129-text-secondary); font-size: 13px; font-weight: 700; }
    .p129-field input, .p129-field select {
      width: 100%; height: 42px; padding: 0 12px;
      border: 1px solid var(--p129-border); border-radius: 9px;
      color: var(--p129-text); background: var(--p129-surface);
    }
    .p129-field input:focus, .p129-field select:focus {
      border-color: var(--p129-primary); outline: 3px solid var(--p129-focus-soft);
    }
    .p129-filter-actions { display: flex; align-items: flex-end; gap: 10px; }

    .p129-button {
      display: inline-flex; min-height: 42px; align-items: center; justify-content: center;
      gap: 8px; padding: 0 16px; border: 1px solid transparent; border-radius: 9px;
      font-weight: 700; transition: 0.15s ease;
    }
    .p129-button-primary { color: #fff; background: var(--p129-primary); }
    .p129-button-primary:hover { background: var(--p129-primary-hover); }
    .p129-button-secondary { border-color: var(--p129-border); color: var(--p129-text-secondary); background: var(--p129-surface); }
    .p129-button-secondary:hover { border-color: var(--p129-border-hover); color: var(--p129-primary); background: var(--p129-primary-soft); }
    .p129-button:disabled { opacity: 0.6; cursor: wait; }

    .p129-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin: 28px 0 14px; }
    .p129-toolbar h2 { margin: 0; font-size: 19px; }
    .p129-toolbar p { margin: 8px 0 0; color: var(--p129-muted); }
    .p129-toolbar-actions { display: flex; gap: 10px; }

    .p129-actionbar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      margin: 0 0 14px; padding: 13px 15px;
      border: 1px solid var(--p129-border); border-radius: 12px;
      background: var(--p129-surface); box-shadow: var(--shadow-card);
    }
    .p129-selinfo { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .p129-selicon {
      display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto;
      color: var(--p129-primary); background: var(--p129-primary-soft); border-radius: 11px;
    }
    .p129-selicon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .p129-seltext { display: flex; flex-direction: column; min-width: 0; }
    .p129-seltext strong { color: var(--p129-text); font-size: 14px; }
    .p129-seltext span { margin-top: 2px; color: var(--p129-muted); font-size: 11px; }
    .p129-actionbtns { display: flex; gap: 10px; flex: 0 0 auto; }
    .p129-actionbtns svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .p129-table-card { overflow: hidden; }
    .p129-table-responsive { overflow-x: auto; }
    .p129-table { width: 100%; min-width: 1150px; border-collapse: collapse; }
    .p129-table thead { background: var(--p129-hover); }
    .p129-table th, .p129-table td { padding: 14px 16px; border-bottom: 1px solid var(--p129-border); text-align: left; white-space: nowrap; }
    .p129-table th { color: var(--p129-text-secondary); font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .p129-table td { font-size: 14px; }
    .p129-table tbody tr:hover { background: var(--p129-hover); }
    .p129-table tbody tr.p129-selected { background: var(--p129-primary-soft); }

    .p129-check-column { width: 52px; text-align: center; }
    .p129-table input[type="checkbox"] { width: 17px; height: 17px; margin: 0; cursor: pointer; accent-color: var(--p129-primary); }

    .p129-invoice-number { color: var(--p129-primary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; }
    .p129-amount { font-weight: 800; }
    .p129-desc { white-space: normal; min-width: 220px; max-width: 380px; color: var(--p129-text-secondary); }

    .p129-summary-bar {
      display: grid; grid-template-columns: 1fr auto; gap: 24px;
      align-items: center; padding: 16px 20px; background: var(--p129-hover);
    }
    .p129-summary-label { color: var(--p129-muted); font-size: 13px; }
    .p129-summary-value { margin-top: 3px; font-size: 18px; font-weight: 800; }

    .p129-pagination {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 14px 20px; background: var(--p129-hover); border-top: 1px solid var(--p129-border);
      flex-wrap: wrap;
    }
    .p129-page-info { color: var(--p129-muted); font-size: 13px; margin-right: 12px; }
    .p129-page-btn {
      min-width: 36px; min-height: 36px; padding: 0 10px;
      border: 1px solid var(--p129-border); border-radius: 8px; background: var(--p129-surface);
      font-weight: 700; color: var(--p129-text-secondary); cursor: pointer;
    }
    .p129-page-btn:hover { border-color: var(--p129-border-hover); color: var(--p129-primary); background: var(--p129-primary-soft); }
    .p129-page-btn.active { background: var(--p129-primary); border-color: var(--p129-primary); color: #fff; }
    .p129-page-btn:disabled { opacity: 0.4; cursor: default; }

    .p129-empty { padding: 52px 20px; color: var(--p129-muted); text-align: center; white-space: normal; }
    .p129-empty .p129-empty-sub { margin-top: 8px; font-size: 13px; color: var(--p129-muted); }
    .p129-hint-card { margin-top: 22px; padding: 18px 20px; color: var(--p129-muted); font-size: 14px; }
    .p129-hint-card strong { color: var(--p129-text); }

    @media (max-width: 1050px) {
      .p129-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .p129-toolbar { align-items: flex-start; flex-direction: column; }
      .p129-filter-card { padding: 18px; }
      .p129-filter-grid { grid-template-columns: 1fr; }
      .p129-filter-actions { width: 100%; }
      .p129-filter-actions .p129-button { flex: 1; }
      .p129-summary-bar { grid-template-columns: 1fr; }
    }

    /* toast — แจ้งเตือน (เช่น ไม่พบข้อมูล) */
    .p129-toast {
      position: fixed; right: 22px; bottom: 22px; z-index: 9999;
      display: flex; align-items: center; gap: 9px;
      max-width: 420px; padding: 12px 16px; border-radius: 10px;
      background: var(--p129-surface); color: var(--p129-text);
      border: 1px solid var(--p129-border);
      box-shadow: 0 10px 30px rgb(15 23 42 / 18%);
      font-size: 13px; line-height: 1.5;
      visibility: hidden; opacity: 0; transform: translateY(10px);
      transition: opacity .22s ease, transform .22s ease, visibility .22s;
      pointer-events: none;
    }
    .p129-toast.show { visibility: visible; opacity: 1; transform: translateY(0); }
  `;

  /* ---------- toast ---------- */
  var toastTimer = null;
  function showToast(msg, duration) {
    var el = document.getElementById("p129Toast");
    if (!el) return;
    document.getElementById("p129ToastMsg").textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, duration || 1800);
  }

  /* ---------- utility ---------- */

  function formatMoney(amount) {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2
    }).format(amount);
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  /* ---------- ตาราง (เฉพาะหน้าปัจจุบัน) ---------- */

  function pageSlice() {
    var start = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(start, start + PAGE_SIZE);
  }

  function totalPages() {
    return Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  }

  function renderTable() {
    var body = document.getElementById("p129Body");
    var slice = pageSlice();

    if (filteredInvoices.length === 0) {
      var emptySub = Object.keys(selectedIds).length === 0
        ? "กรอกเงื่อนไขด้านบนแล้วกด ⌕ ค้นหา"
        : "ไม่พบรายการ — ลองเปลี่ยนเงื่อนไขแล้วค้นหาใหม่";
      body.innerHTML = `
        <tr>
          <td colspan="8" class="p129-empty">
            ยังไม่มีรายการแสดง
            <div class="p129-empty-sub">${emptySub}</div>
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = slice.map(invoice => `
        <tr class="${selectedIds[invoice.id] ? "p129-selected" : ""}">
          <td class="p129-check-column">
            <input type="checkbox" ${selectedIds[invoice.id] ? "checked" : ""}
              data-p129-row="${invoice.id}">
          </td>
          <td><span class="p129-invoice-number">${invoice.id}</span></td>
          <td>${invoice.customerCode}</td>
          <td>${invoice.customer}</td>
          <td>${invoice.address || "—"}</td>
          <td class="p129-amount">${formatMoney(invoice.amount)}</td>
          <td><span class="p129-desc">${invoice.desc || "—"}</span></td>
          <td>${invoice.printCount} ครั้ง</td>
        </tr>
      `).join("");
    }

    updateSummary();
    renderPagination();
  }

  function updateSummary() {
    var selectedCount = Object.keys(selectedIds).length;
    var el = document.getElementById("p129SelCount");
    if (el) el.textContent = "เลือกแล้ว " + selectedCount + " รายการ";

    var slice = pageSlice();
    var allEl = document.getElementById("p129SelectAll");
    allEl.checked = slice.length > 0 &&
      slice.every(item => selectedIds[item.id]);
  }

  function renderPagination() {
    var el = document.getElementById("p129Pagination");
    var total = totalPages();

    if (currentPage > total) currentPage = total;

    if (filteredInvoices.length === 0) {
      el.innerHTML = "";
      return;
    }

    var start = (currentPage - 1) * PAGE_SIZE + 1;
    var end = Math.min(currentPage * PAGE_SIZE, filteredInvoices.length);

    // ปุ่มหน้า: ก่อนหน้า / 1..total / หน้าถัดไป (แสดงเลขสูงสุด 7 ตัว)
    var pages = [];
    var windowSize = 7;
    var first = Math.max(1, currentPage - 3);
    var last = Math.min(total, first + windowSize - 1);
    if (last - first < windowSize - 1) {
      first = Math.max(1, last - windowSize + 1);
    }
    for (var i = first; i <= last; i++) pages.push(i);

    var html = `<span class="p129-page-info">แสดง ${start}-${end} จาก ${filteredInvoices.length} รายการ · หน้า ${currentPage}/${total}</span>`;
    html += `<button class="p129-page-btn" type="button" ${currentPage === 1 ? "disabled" : ""} data-p129-page="${currentPage - 1}">‹</button>`;
    pages.forEach(p => {
      html += `<button class="p129-page-btn ${p === currentPage ? "active" : ""}" type="button" data-p129-page="${p}">${p}</button>`;
    });
    html += `<button class="p129-page-btn" type="button" ${currentPage === total ? "disabled" : ""} data-p129-page="${currentPage + 1}">›</button>`;
    el.innerHTML = html;
  }

  function goPage(page) {
    var total = totalPages();
    if (page < 1 || page > total) return;
    currentPage = page;
    renderTable();
  }

  /* ---------- เลือกแถว ---------- */

  function toggleRow(id, checked) {
    if (checked) selectedIds[id] = true;
    else delete selectedIds[id];
    renderTable();
  }

  // checkbox ในหัวตาราง = เลือก/取消其หน้าปัจจุบัน
  function setAllRows(checked) {
    pageSlice().forEach(item => {
      if (checked) selectedIds[item.id] = true;
      else delete selectedIds[item.id];
    });
    renderTable();
  }

  // รายการที่เลือก — สำหรับนำไปสร้างรายงาน
  function getSelected() {
    return filteredInvoices.filter(item => selectedIds[item.id]);
  }

  /* ---------- ค้นหา (ไม่ auto — กดปุ่มเอง) ---------- */

  function currentFilter() {
    return {
      dateFrom: document.getElementById("p129DateFrom").value,
      dateTo: document.getElementById("p129DateTo").value,
      creator: document.getElementById("p129Creator").value.trim(),
      salesCode: document.getElementById("p129SalesCode").value.trim(),
      doctype: document.getElementById("p129Doctype").value,
      status: document.getElementById("p129Status").value
    };
  }

  async function searchInvoices() {
    var filter = currentFilter();

    if (!filter.doctype || !filter.status) {
      document.getElementById("p129ResultText").textContent = "⚠ ต้องเลือก Doctype และ Status Invoice ก่อน";
      return;
    }

    if (!mac5Id) {
      document.getElementById("p129ResultText").textContent = "⚠ ไม่พบฐานข้อมูล MAC5 — ตรวจสอบการตั้งค่า connection";
      return;
    }

    var resultText = document.getElementById("p129ResultText");
    var btnSearch = document.getElementById("p129BtnSearch");
    resultText.textContent = "⏳ กำลังค้นหา...";
    if (btnSearch) btnSearch.disabled = true;

    try {
      const res = await fetch("api/p129_invoices.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ connectionId: mac5Id }, filter))
      });
      const data = await res.json();

      if (data.ok) {
        filteredInvoices = data.invoices || [];
        currentPage = 1; // ค้นหาใหม่ = กลับหน้า 1
        resultText.textContent = `พบ ${data.count} รายการ (ฐานข้อมูล: ${mac5Name})`;
        if (filteredInvoices.length === 0) {
          showToast("⚠ ไม่พบข้อมูล — ไม่มีเอกสารที่ตรงกับเงื่อนไขค้นหา", 3200);
        }
        renderTable();
      } else {
        filteredInvoices = [];
        resultText.textContent = "❌ " + data.message;
        renderTable();
      }
    } catch (err) {
      filteredInvoices = [];
      resultText.textContent = "❌ เรียก API ไม่สำเร็จ: " + err.message;
      renderTable();
    } finally {
      if (btnSearch) btnSearch.disabled = false;
    }
  }

  // ล้างค่า = กลับ default เดิม: วันที่ปัจจุบัน, Doctype/Status = ตัวเลือกแรกสุด
  function resetFilters() {
    var today = todayISO();
    document.getElementById("p129DateFrom").value = today;
    document.getElementById("p129DateTo").value = today;
    document.getElementById("p129Creator").value = "";
    document.getElementById("p129SalesCode").value = "";
    document.getElementById("p129Doctype").value = DOCTYPE_LIST[0];
    document.getElementById("p129Status").value = Object.keys(STATUS_LIST)[0];
  }

  /* ---------- รายงานจากที่เลือก (modal + iframe: report/p129_report.html) ---------- */

  var p129ReportUrl = "";
  var p129EscBound = false;

  function createReport() {
    var items = getSelected();
    if (items.length === 0) {
      alert("ยังไม่ได้เลือกรายการ — กด checkbox ในตารางก่อน");
      return;
    }
    if (items.length > 50) {
      alert("เลือกพิมพ์ได้สูงสุด 50 รายการต่อครั้ง — ลดจำนวนลงก่อน");
      return;
    }
    var ids = items.map(item => item.id);
    p129ReportUrl = "report/p129_report.html?ids=" + ids.join(",") + "&conn=" + encodeURIComponent(mac5Id);

    var overlay = document.getElementById("p129ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p129ReportOverlay";
      overlay.className = "p129-rep-overlay";
      overlay.innerHTML =
        '<div class="p129-rep-modal">' +
          '<div class="p129-rep-head">' +
            '<div class="p129-rep-headtxt">' +
              '<div class="p129-rep-title">▤ รายงาน Invoice (KTV-BKK)</div>' +
              '<div class="p129-rep-sub" id="p129RepSub"></div>' +
            "</div>" +
            '<div class="p129-rep-btns">' +
              '<button class="p129-rep-btn" type="button" id="p129RepNewWin" title="เปิดหน้าต่างใหม่">↗</button>' +
              '<button class="p129-rep-btn" type="button" id="p129RepClose" title="ปิด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p129-rep-body"><iframe id="p129RepFrame" title="รายงาน Invoice"></iframe></div>' +
          '<div class="p129-rep-foot">' +
            '<div class="p129-rep-hint">รายงาน A4 — พิมพ์จากหน้านี้ได้โดยตรง (หรือกด ↗ เพื่อเปิดหน้าต่างใหม่)</div>' +
            '<button class="p129-rep-btn p129-rep-btn-primary" type="button" id="p129RepPrint">พิมพ์</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p129RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p129RepNewWin").addEventListener("click", function () {
        if (p129ReportUrl) window.open(p129ReportUrl, "_blank", "width=900,height=1200");
      });
      overlay.querySelector("#p129RepPrint").addEventListener("click", function () {
        var f = document.getElementById("p129RepFrame");
        if (f && f.contentWindow) {
          try {
            f.contentWindow.focus();
            if (typeof f.contentWindow.onPrintClick === "function") {
              f.contentWindow.onPrintClick(); // บันทึกจำนวนพิมพ์ + print dialog
              return;
            }
            f.contentWindow.print();
            return;
          } catch (err) { /* ignore */ }
        }
        alert("พิมพ์จาก iframe ไม่ได้ — กด ↗ เพื่อเปิดหน้าต่างใหม่แล้วพิมพ์จากนั้น");
      });
      if (!p129EscBound) {
        p129EscBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    overlay.querySelector("#p129RepSub").textContent =
      "เลือกเอกสาร " + items.length + " รายการ — " + new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    var f = overlay.querySelector("#p129RepFrame");
    f.src = p129ReportUrl;
    overlay.classList.add("show");
  }

  function closeReport() {
    var overlay = document.getElementById("p129ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    var f = overlay.querySelector("#p129RepFrame");
    if (f) f.src = "about:blank";
  }

  /* ---------- mount ---------- */

  // หา id connection ของ MAC5 (ใช้ค้นหา — ไม่แสดง dropdown)
  async function resolveConnection() {
    try {
      const res = await fetch("api/connections.php");
      const data = await res.json();
      if (!data.ok) return;
      const sqlServers = data.connections.filter(c => c.type === "sqlserver");
      const pick = sqlServers.find(c => c.name === "MAC5") || sqlServers[0];
      if (pick) {
        mac5Id = pick.id;
        mac5Name = pick.name;
      }
    } catch (err) {
      // ไม่พบบัญชี connection — แสดง error ตอนกดค้นหา
    }
  }



  var CSS_REPORT = `
    .p129-rep-overlay{display:none;position:fixed;inset:0;z-index:900;align-items:center;justify-content:center;background:rgba(2,6,23,.8);padding:18px}
    .p129-rep-overlay.show{display:flex}
    .p129-rep-modal{display:flex;width:min(1100px,100%);height:94vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.35)}
    .p129-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--p129-border)}
    .p129-rep-headtxt{display:flex;flex-direction:column;gap:2px;min-width:0}
    .p129-rep-title{font-size:15px;font-weight:700;color:var(--p129-text)}
    .p129-rep-sub{font-size:12px;color:var(--p129-muted)}
    .p129-rep-btns{display:flex;gap:8px;flex-shrink:0}
    .p129-rep-btn{display:grid;width:34px;height:34px;place-items:center;color:var(--p129-muted);border:1px solid var(--p129-border);border-radius:9px;background:transparent;transition:.15s}
    .p129-rep-btn:hover{color:var(--p129-text);border-color:var(--p129-primary)}
    .p129-rep-body{flex:1;min-height:0;background:#e2e8f0;display:flex;justify-content:center;overflow:auto;padding:18px}
    .p129-rep-body iframe{width:100%;height:100%;border:1px solid var(--p129-border);border-radius:10px;background:#fff}
    .p129-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;border-top:1px solid var(--p129-border)}
    .p129-rep-hint{font-size:12px;color:var(--p129-muted)}
    .p129-rep-hint a{color:var(--p129-primary);text-decoration:underline;cursor:pointer}
    .p129-rep-btn-primary{width:auto;padding:0 18px;height:38px;background:var(--p129-primary);color:#fff;border-color:var(--p129-primary);font-weight:700;font-size:13px}
    .p129-rep-btn-primary:hover{filter:brightness(1.08);color:#fff}
  `;



  function mount(root) {
    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS_VARS + CSS + CSS_REPORT;
      document.head.appendChild(style);
    }

    var doctypeOptions = DOCTYPE_LIST
      .map(code => `<option value="${code}">${code}</option>`)
      .join("");

    var statusOptions = Object.keys(STATUS_LIST)
      .map(key => `<option value="${key}">${STATUS_LIST[key]}</option>`)
      .join("");

    var today = todayISO();

    root.innerHTML = `
      <div class="p129">
        <section class="p129-filter-card">
          <h2 class="p129-filter-title">⌕ ค้นหารายการ Invoice</h2>

          <div class="p129-filter-grid">
            <div class="p129-field">
              <label for="p129DateFrom">วันที่ Invoice ระหว่างวันที่</label>
              <input id="p129DateFrom" type="date" value="${today}">
            </div>

            <div class="p129-field">
              <label for="p129DateTo">ถึงวันที่</label>
              <input id="p129DateTo" type="date" value="${today}">
            </div>

            <div class="p129-field">
              <label for="p129Creator">ผู้สร้างเอกสาร</label>
              <input id="p129Creator" type="text" placeholder="ชื่อ หรือ รหัสผู้สร้างเอกสาร">
            </div>

            <div class="p129-field">
              <label for="p129SalesCode">รหัสผู้แทน</label>
              <input id="p129SalesCode" type="text" placeholder="ระบุรหัสผู้แทน">
            </div>

            <div class="p129-field">
              <label for="p129Doctype">Doctype <span style="color:#dc2626">*</span></label>
              <select id="p129Doctype">${doctypeOptions}</select>
            </div>

            <div class="p129-field">
              <label for="p129Status">Status Invoice <span style="color:#dc2626">*</span></label>
              <select id="p129Status">${statusOptions}</select>
            </div>

            <div class="p129-filter-actions">
              <button class="p129-button p129-button-primary" type="button" id="p129BtnSearch">⌕ ค้นหา</button>
              <button class="p129-button p129-button-secondary" type="button" id="p129BtnReset">↻ ล้างค่า</button>
            </div>
          </div>
        </section>

        <section class="p129-toolbar">
          <div>
            <h2>รายการ Invoice</h2>
            <p id="p129ResultText">ยังไม่ได้ค้นหา — เลือก Doctype / Status แล้วกด ⌕ ค้นหา</p>
          </div>
        </section>

        <section class="p129-actionbar">
          <div class="p129-selinfo">
            <div class="p129-selicon"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>
            <div class="p129-seltext"><strong id="p129SelCount">เลือกแล้ว 0 รายการ</strong><span>ประเภทเอกสาร: ใบแจ้งหนี้</span></div>
          </div>
          <div class="p129-actionbtns">
            <button class="p129-button p129-button-secondary" type="button" id="p129BtnSelAll"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 11l3 3 4-5"></path></svg>เลือกทั้งหมด</button>
            <button class="p129-button p129-button-primary" type="button" id="p129BtnPreview"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>Print Preview</button>
          </div>
        </section>

        <section class="p129-table-card">
          <div class="p129-table-responsive">
            <table class="p129-table">
              <thead>
                <tr>
                  <th class="p129-check-column"><input id="p129SelectAll" type="checkbox"></th>
                  <th>เลขที่ Invoice</th>
                  <th>รหัสลูกค้า</th>
                  <th>ชื่อลูกค้า</th>
                  <th>พื้นที่</th>
                  <th>ยอดรวม</th>
                  <th>หมายเหตุ</th>
                  <th>จำนวนพิมพ์</th>
                </tr>
              </thead>
              <tbody id="p129Body"></tbody>
            </table>
          </div>

          <div class="p129-pagination" id="p129Pagination"></div>
        </section>

        <section class="p129-hint-card">
          <strong>คำแนะนำ:</strong> Doctype และ Status เป็น<strong>บังคับ</strong> (default = ตัวเลือกแรกสุด)
          · วันที่ default = วันนี้ · checkbox เลือกได้ข้ามหน้า, หัวตาราง = เลือกเฉพาะหน้า
          · กด <strong>▤ Print Preview</strong> เพื่อเปิดรายงานในหน้า preview
        </section>
      </div>
      <div class="p129-toast" id="p129Toast"><span id="p129ToastMsg"></span></div>
    `;

    renderTable();
    resolveConnection();

    // event delegation — bind หนึ่งครั้งตอน mount (ไม่พึ่ง inline onclick)
    root.addEventListener("click", event => {
      const t = event.target;
      if (t.id === "p129BtnSearch") return searchInvoices();
      if (t.id === "p129BtnReset") return resetFilters();
      if (t.id === "p129BtnSelAll") {
        var all = document.getElementById("p129SelectAll");
        all.checked = !all.checked;
        setAllRows(all.checked, true);
        return;
      }
      if (t.id === "p129BtnPreview") return createReport();
      if (t.dataset && t.dataset.p129Page !== undefined && !t.disabled) return goPage(parseInt(t.dataset.p129Page, 10));
    });
    root.addEventListener("change", event => {
      const t = event.target;
      if (t.id === "p129SelectAll") return setAllRows(t.checked);
      if (t.dataset && t.dataset.p129Row !== undefined) return toggleRow(t.dataset.p129Row, t.checked);
    });
  }

  window.P129InvoiceKTVBKK = {
    mount,
    search: searchInvoices,
    reset: resetFilters,
    toggleRow,
    setAllRows,
    createReport,
    getSelected,
    goPage
  };
})();