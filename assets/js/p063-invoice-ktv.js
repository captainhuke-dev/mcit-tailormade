/**
 * P063 — Print Invoice KTV (หน้าแอปใน ERP Portal)
 * ข้อมูลจริงจาก API: api/p063_invoices.php (SQL Server M5CM-AA-01)
 * - ฐานข้อมูลใช้ MAC5 เสมอ (ไม่แสดง dropdown — resolve id ภายใน)
 * - ไม่ auto search — กดปุ่ม "⌕ ค้นหา" เอง
 * - Doctype + Status = required (ไม่มีตัวเลือก "ทั้งหมด") default = ตัวเลือกแรกสุด
 * - วันที่ default = วันที่ปัจจุบัน
 * - แบ่งหน้า 10 รายการ/หน้า, checkbox เลือกแถว (หัวตาราง = หน้าปัจจุบัน)
 * - การเลือกคงอยู่ข้ามหน้า — นับจำนวนที่เลือกด้านล่าง (ไม่มียอดรวม)
 * - รองรับธีม Dark / UI Scale (ใช้ CSS variables ของ portal)
 */
(function () {
  "use strict";

  var STYLE_ID = "p063-invoice-ktv-style";
  var PAGE_SIZE = 10;

  // ธีม: light/dark — variables p063-* (กำหนดตาม data-theme ของ <html>)
  var CSS_VARS = `
    :root {
      --p063-text: #172033;
      --p063-text-secondary: #334155;
      --p063-muted: #64748b;
      --p063-border: #e2e8f0;
      --p063-border-hover: #93c5fd;
      --p063-surface: #ffffff;
      --p063-hover: #f8fbff;
      --p063-primary: #2563eb;
      --p063-primary-hover: #1d4ed8;
      --p063-primary-soft: #eff6ff;
      --p063-focus-soft: rgb(37 99 235 / 15%);
    }
    [data-theme="dark"] {
      --p063-text: #e2e8f0;
      --p063-text-secondary: #cbd5e1;
      --p063-muted: #94a3b8;
      --p063-border: #334155;
      --p063-border-hover: #3b82f6;
      --p063-surface: #111c2e;
      --p063-hover: #16233a;
      --p063-primary: #3b82f6;
      --p063-primary-hover: #60a5fa;
      --p063-primary-soft: rgb(59 130 246 / 25%);
      --p063-focus-soft: rgb(96 165 250 / 20%);
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
    .p063 { color: var(--p063-text); }
    .p063 * { box-sizing: border-box; }
    .p063 button, .p063 input, .p063 select { font: inherit; }
    .p063 button { cursor: pointer; }

    .p063-filter-card, .p063-table-card, .p063-hint-card {
      border: 1px solid var(--p063-border);
      border-radius: 16px;
      background: var(--p063-surface);
      box-shadow: var(--shadow-card);
    }
    .p063-filter-card { padding: 24px; }
    .p063-filter-title { margin: 0 0 20px; font-size: 17px; }
    .p063-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .p063-field { display: grid; gap: 7px; }
    .p063-field > label { color: var(--p063-text-secondary); font-size: 13px; font-weight: 700; }
    .p063-field input, .p063-field select {
      width: 100%; height: 42px; padding: 0 12px;
      border: 1px solid var(--p063-border); border-radius: 9px;
      color: var(--p063-text); background: var(--p063-surface);
    }
    .p063-field input:focus, .p063-field select:focus {
      border-color: var(--p063-primary); outline: 3px solid var(--p063-focus-soft);
    }
    .p063-filter-actions { display: flex; align-items: flex-end; gap: 10px; }

    .p063-button {
      display: inline-flex; min-height: 42px; align-items: center; justify-content: center;
      gap: 8px; padding: 0 16px; border: 1px solid transparent; border-radius: 9px;
      font-weight: 700; transition: 0.15s ease;
    }
    .p063-button-primary { color: #fff; background: var(--p063-primary); }
    .p063-button-primary:hover { background: var(--p063-primary-hover); }
    .p063-button-secondary { border-color: var(--p063-border); color: var(--p063-text-secondary); background: var(--p063-surface); }
    .p063-button-secondary:hover { border-color: var(--p063-border-hover); color: var(--p063-primary); background: var(--p063-primary-soft); }
    .p063-button:disabled { opacity: 0.6; cursor: wait; }

    .p063-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin: 28px 0 14px; }
    .p063-toolbar h2 { margin: 0; font-size: 19px; }
    .p063-toolbar p { margin: 8px 0 0; color: var(--p063-muted); }
    .p063-toolbar-actions { display: flex; gap: 10px; }

    .p063-actionbar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      margin: 0 0 14px; padding: 13px 15px;
      border: 1px solid var(--p063-border); border-radius: 12px;
      background: var(--p063-surface); box-shadow: var(--shadow-card);
    }
    .p063-selinfo { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .p063-selicon {
      display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto;
      color: var(--p063-primary); background: var(--p063-primary-soft); border-radius: 11px;
    }
    .p063-selicon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .p063-seltext { display: flex; flex-direction: column; min-width: 0; }
    .p063-seltext strong { color: var(--p063-text); font-size: 14px; }
    .p063-seltext span { margin-top: 2px; color: var(--p063-muted); font-size: 11px; }
    .p063-actionbtns { display: flex; gap: 10px; flex: 0 0 auto; }
    .p063-actionbtns svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .p063-table-card { overflow: hidden; }
    .p063-table-responsive { overflow-x: auto; }
    .p063-table { width: 100%; min-width: 1150px; border-collapse: collapse; }
    .p063-table thead { background: var(--p063-hover); }
    .p063-table th, .p063-table td { padding: 14px 16px; border-bottom: 1px solid var(--p063-border); text-align: left; white-space: nowrap; }
    .p063-table th { color: var(--p063-text-secondary); font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .p063-table td { font-size: 14px; }
    .p063-table tbody tr:hover { background: var(--p063-hover); }
    .p063-table tbody tr.p063-selected { background: var(--p063-primary-soft); }

    .p063-check-column { width: 52px; text-align: center; }
    .p063-table input[type="checkbox"] { width: 17px; height: 17px; margin: 0; cursor: pointer; accent-color: var(--p063-primary); }

    .p063-invoice-number { color: var(--p063-primary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; }
    .p063-amount { font-weight: 800; }
    .p063-desc { white-space: normal; min-width: 220px; max-width: 380px; color: var(--p063-text-secondary); }

    .p063-summary-bar {
      display: grid; grid-template-columns: 1fr auto; gap: 24px;
      align-items: center; padding: 16px 20px; background: var(--p063-hover);
    }
    .p063-summary-label { color: var(--p063-muted); font-size: 13px; }
    .p063-summary-value { margin-top: 3px; font-size: 18px; font-weight: 800; }

    .p063-pagination {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 14px 20px; background: var(--p063-hover); border-top: 1px solid var(--p063-border);
      flex-wrap: wrap;
    }
    .p063-page-info { color: var(--p063-muted); font-size: 13px; margin-right: 12px; }
    .p063-page-btn {
      min-width: 36px; min-height: 36px; padding: 0 10px;
      border: 1px solid var(--p063-border); border-radius: 8px; background: var(--p063-surface);
      font-weight: 700; color: var(--p063-text-secondary); cursor: pointer;
    }
    .p063-page-btn:hover { border-color: var(--p063-border-hover); color: var(--p063-primary); background: var(--p063-primary-soft); }
    .p063-page-btn.active { background: var(--p063-primary); border-color: var(--p063-primary); color: #fff; }
    .p063-page-btn:disabled { opacity: 0.4; cursor: default; }

    .p063-empty { padding: 52px 20px; color: var(--p063-muted); text-align: center; white-space: normal; }
    .p063-empty .p063-empty-sub { margin-top: 8px; font-size: 13px; color: var(--p063-muted); }
    .p063-hint-card { margin-top: 22px; padding: 18px 20px; color: var(--p063-muted); font-size: 14px; }
    .p063-hint-card strong { color: var(--p063-text); }

    @media (max-width: 1050px) {
      .p063-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .p063-toolbar { align-items: flex-start; flex-direction: column; }
      .p063-filter-card { padding: 18px; }
      .p063-filter-grid { grid-template-columns: 1fr; }
      .p063-filter-actions { width: 100%; }
      .p063-filter-actions .p063-button { flex: 1; }
      .p063-summary-bar { grid-template-columns: 1fr; }
    }

    /* toast — แจ้งเตือน (เช่น ไม่พบข้อมูล) */
    .p063-toast {
      position: fixed; right: 22px; bottom: 22px; z-index: 9999;
      display: flex; align-items: center; gap: 9px;
      max-width: 420px; padding: 12px 16px; border-radius: 10px;
      background: var(--p063-surface); color: var(--p063-text);
      border: 1px solid var(--p063-border);
      box-shadow: 0 10px 30px rgb(15 23 42 / 18%);
      font-size: 13px; line-height: 1.5;
      visibility: hidden; opacity: 0; transform: translateY(10px);
      transition: opacity .22s ease, transform .22s ease, visibility .22s;
      pointer-events: none;
    }
    .p063-toast.show { visibility: visible; opacity: 1; transform: translateY(0); }
  `;

  /* ---------- toast ---------- */
  var toastTimer = null;
  function showToast(msg, duration) {
    var el = document.getElementById("p063Toast");
    if (!el) return;
    document.getElementById("p063ToastMsg").textContent = msg;
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
    var body = document.getElementById("p063Body");
    var slice = pageSlice();

    if (filteredInvoices.length === 0) {
      var emptySub = Object.keys(selectedIds).length === 0
        ? "กรอกเงื่อนไขด้านบนแล้วกด ⌕ ค้นหา"
        : "ไม่พบรายการ — ลองเปลี่ยนเงื่อนไขแล้วค้นหาใหม่";
      body.innerHTML = `
        <tr>
          <td colspan="8" class="p063-empty">
            ยังไม่มีรายการแสดง
            <div class="p063-empty-sub">${emptySub}</div>
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = slice.map(invoice => `
        <tr class="${selectedIds[invoice.id] ? "p063-selected" : ""}">
          <td class="p063-check-column">
            <input type="checkbox" ${selectedIds[invoice.id] ? "checked" : ""}
              data-p063-row="${invoice.id}">
          </td>
          <td><span class="p063-invoice-number">${invoice.id}</span></td>
          <td>${invoice.customerCode}</td>
          <td>${invoice.customer}</td>
          <td>${invoice.address || "—"}</td>
          <td class="p063-amount">${formatMoney(invoice.amount)}</td>
          <td><span class="p063-desc">${invoice.desc || "—"}</span></td>
          <td>${invoice.printCount} ครั้ง</td>
        </tr>
      `).join("");
    }

    updateSummary();
    renderPagination();
  }

  function updateSummary() {
    var selectedCount = Object.keys(selectedIds).length;
    var el = document.getElementById("p063SelCount");
    if (el) el.textContent = "เลือกแล้ว " + selectedCount + " รายการ";

    var slice = pageSlice();
    var allEl = document.getElementById("p063SelectAll");
    allEl.checked = slice.length > 0 &&
      slice.every(item => selectedIds[item.id]);
  }

  function renderPagination() {
    var el = document.getElementById("p063Pagination");
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

    var html = `<span class="p063-page-info">แสดง ${start}-${end} จาก ${filteredInvoices.length} รายการ · หน้า ${currentPage}/${total}</span>`;
    html += `<button class="p063-page-btn" type="button" ${currentPage === 1 ? "disabled" : ""} data-p063-page="${currentPage - 1}">‹</button>`;
    pages.forEach(p => {
      html += `<button class="p063-page-btn ${p === currentPage ? "active" : ""}" type="button" data-p063-page="${p}">${p}</button>`;
    });
    html += `<button class="p063-page-btn" type="button" ${currentPage === total ? "disabled" : ""} data-p063-page="${currentPage + 1}">›</button>`;
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
      dateFrom: document.getElementById("p063DateFrom").value,
      dateTo: document.getElementById("p063DateTo").value,
      creator: document.getElementById("p063Creator").value.trim(),
      salesCode: document.getElementById("p063SalesCode").value.trim(),
      doctype: document.getElementById("p063Doctype").value,
      status: document.getElementById("p063Status").value
    };
  }

  async function searchInvoices() {
    var filter = currentFilter();

    if (!filter.doctype || !filter.status) {
      document.getElementById("p063ResultText").textContent = "⚠ ต้องเลือก Doctype และ Status Invoice ก่อน";
      return;
    }

    if (!mac5Id) {
      document.getElementById("p063ResultText").textContent = "⚠ ไม่พบฐานข้อมูล MAC5 — ตรวจสอบการตั้งค่า connection";
      return;
    }

    var resultText = document.getElementById("p063ResultText");
    var btnSearch = document.getElementById("p063BtnSearch");
    resultText.textContent = "⏳ กำลังค้นหา...";
    if (btnSearch) btnSearch.disabled = true;

    try {
      const res = await fetch("api/p063_invoices.php", {
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
    document.getElementById("p063DateFrom").value = today;
    document.getElementById("p063DateTo").value = today;
    document.getElementById("p063Creator").value = "";
    document.getElementById("p063SalesCode").value = "";
    document.getElementById("p063Doctype").value = DOCTYPE_LIST[0];
    document.getElementById("p063Status").value = Object.keys(STATUS_LIST)[0];
  }

  /* ---------- รายงานจากที่เลือก (modal + iframe: report/p063_report.html) ---------- */

  var p063ReportUrl = "";
  var p063EscBound = false;

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
    p063ReportUrl = "report/p063_report.html?ids=" + ids.join(",") + "&conn=" + encodeURIComponent(mac5Id);

    var overlay = document.getElementById("p063ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p063ReportOverlay";
      overlay.className = "p063-rep-overlay";
      overlay.innerHTML =
        '<div class="p063-rep-modal">' +
          '<div class="p063-rep-head">' +
            '<div class="p063-rep-headtxt">' +
              '<div class="p063-rep-title">▤ รายงาน Invoice</div>' +
              '<div class="p063-rep-sub" id="p063RepSub"></div>' +
            "</div>" +
            '<div class="p063-rep-btns">' +
              '<button class="p063-rep-btn" type="button" id="p063RepNewWin" title="เปิดหน้าต่างใหม่">↗</button>' +
              '<button class="p063-rep-btn" type="button" id="p063RepClose" title="ปิด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p063-rep-body"><iframe id="p063RepFrame" title="รายงาน Invoice"></iframe></div>' +
          '<div class="p063-rep-foot">' +
            '<div class="p063-rep-hint">รายงาน A4 — พิมพ์จากหน้านี้ได้โดยตรง (หรือกด ↗ เพื่อเปิดหน้าต่างใหม่)</div>' +
            '<button class="p063-rep-btn p063-rep-btn-primary" type="button" id="p063RepPrint">พิมพ์</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p063RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p063RepNewWin").addEventListener("click", function () {
        if (p063ReportUrl) window.open(p063ReportUrl, "_blank", "width=900,height=1200");
      });
      overlay.querySelector("#p063RepPrint").addEventListener("click", function () {
        var f = document.getElementById("p063RepFrame");
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
      if (!p063EscBound) {
        p063EscBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    overlay.querySelector("#p063RepSub").textContent =
      "เลือกเอกสาร " + items.length + " รายการ — " + new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    var f = overlay.querySelector("#p063RepFrame");
    f.src = p063ReportUrl;
    overlay.classList.add("show");
  }

  function closeReport() {
    var overlay = document.getElementById("p063ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    var f = overlay.querySelector("#p063RepFrame");
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
    .p063-rep-overlay{display:none;position:fixed;inset:0;z-index:900;align-items:center;justify-content:center;background:rgba(2,6,23,.8);padding:18px}
    .p063-rep-overlay.show{display:flex}
    .p063-rep-modal{display:flex;width:min(1100px,100%);height:94vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.35)}
    .p063-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--p063-border)}
    .p063-rep-headtxt{display:flex;flex-direction:column;gap:2px;min-width:0}
    .p063-rep-title{font-size:15px;font-weight:700;color:var(--p063-text)}
    .p063-rep-sub{font-size:12px;color:var(--p063-muted)}
    .p063-rep-btns{display:flex;gap:8px;flex-shrink:0}
    .p063-rep-btn{display:grid;width:34px;height:34px;place-items:center;color:var(--p063-muted);border:1px solid var(--p063-border);border-radius:9px;background:transparent;transition:.15s}
    .p063-rep-btn:hover{color:var(--p063-text);border-color:var(--p063-primary)}
    .p063-rep-body{flex:1;min-height:0;background:#e2e8f0;display:flex;justify-content:center;overflow:auto;padding:18px}
    .p063-rep-body iframe{width:100%;height:100%;border:1px solid var(--p063-border);border-radius:10px;background:#fff}
    .p063-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;border-top:1px solid var(--p063-border)}
    .p063-rep-hint{font-size:12px;color:var(--p063-muted)}
    .p063-rep-hint a{color:var(--p063-primary);text-decoration:underline;cursor:pointer}
    .p063-rep-btn-primary{width:auto;padding:0 18px;height:38px;background:var(--p063-primary);color:#fff;border-color:var(--p063-primary);font-weight:700;font-size:13px}
    .p063-rep-btn-primary:hover{filter:brightness(1.08);color:#fff}
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
      <div class="p063">
        <section class="p063-filter-card">
          <h2 class="p063-filter-title">⌕ ค้นหารายการ Invoice</h2>

          <div class="p063-filter-grid">
            <div class="p063-field">
              <label for="p063DateFrom">วันที่ Invoice ระหว่างวันที่</label>
              <input id="p063DateFrom" type="date" value="${today}">
            </div>

            <div class="p063-field">
              <label for="p063DateTo">ถึงวันที่</label>
              <input id="p063DateTo" type="date" value="${today}">
            </div>

            <div class="p063-field">
              <label for="p063Creator">ผู้สร้างเอกสาร</label>
              <input id="p063Creator" type="text" placeholder="ชื่อ หรือ รหัสผู้สร้างเอกสาร">
            </div>

            <div class="p063-field">
              <label for="p063SalesCode">รหัสผู้แทน</label>
              <input id="p063SalesCode" type="text" placeholder="ระบุรหัสผู้แทน">
            </div>

            <div class="p063-field">
              <label for="p063Doctype">Doctype <span style="color:#dc2626">*</span></label>
              <select id="p063Doctype">${doctypeOptions}</select>
            </div>

            <div class="p063-field">
              <label for="p063Status">Status Invoice <span style="color:#dc2626">*</span></label>
              <select id="p063Status">${statusOptions}</select>
            </div>

            <div class="p063-filter-actions">
              <button class="p063-button p063-button-primary" type="button" id="p063BtnSearch">⌕ ค้นหา</button>
              <button class="p063-button p063-button-secondary" type="button" id="p063BtnReset">↻ ล้างค่า</button>
            </div>
          </div>
        </section>

        <section class="p063-toolbar">
          <div>
            <h2>รายการ Invoice</h2>
            <p id="p063ResultText">ยังไม่ได้ค้นหา — เลือก Doctype / Status แล้วกด ⌕ ค้นหา</p>
          </div>
        </section>

        <section class="p063-actionbar">
          <div class="p063-selinfo">
            <div class="p063-selicon"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>
            <div class="p063-seltext"><strong id="p063SelCount">เลือกแล้ว 0 รายการ</strong><span>ประเภทเอกสาร: ใบแจ้งหนี้</span></div>
          </div>
          <div class="p063-actionbtns">
            <button class="p063-button p063-button-secondary" type="button" id="p063BtnSelAll"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 11l3 3 4-5"></path></svg>เลือกทั้งหมด</button>
            <button class="p063-button p063-button-primary" type="button" id="p063BtnPreview"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>Print Preview</button>
          </div>
        </section>

        <section class="p063-table-card">
          <div class="p063-table-responsive">
            <table class="p063-table">
              <thead>
                <tr>
                  <th class="p063-check-column"><input id="p063SelectAll" type="checkbox"></th>
                  <th>เลขที่ Invoice</th>
                  <th>รหัสลูกค้า</th>
                  <th>ชื่อลูกค้า</th>
                  <th>พื้นที่</th>
                  <th>ยอดรวม</th>
                  <th>หมายเหตุ</th>
                  <th>จำนวนพิมพ์</th>
                </tr>
              </thead>
              <tbody id="p063Body"></tbody>
            </table>
          </div>

          <div class="p063-pagination" id="p063Pagination"></div>
        </section>

        <section class="p063-hint-card">
          <strong>คำแนะนำ:</strong> Doctype และ Status เป็น<strong>บังคับ</strong> (default = ตัวเลือกแรกสุด)
          · วันที่ default = วันนี้ · checkbox เลือกได้ข้ามหน้า, หัวตาราง = เลือกเฉพาะหน้า
          · กด <strong>▤ Print Preview</strong> เพื่อเปิดรายงานในหน้า preview
        </section>
      </div>
      <div class="p063-toast" id="p063Toast"><span id="p063ToastMsg"></span></div>
    `;

    renderTable();
    resolveConnection();

    // event delegation — bind หนึ่งครั้งตอน mount (ไม่พึ่ง inline onclick)
    root.addEventListener("click", event => {
      const t = event.target;
      if (t.id === "p063BtnSearch") return searchInvoices();
      if (t.id === "p063BtnReset") return resetFilters();
      if (t.id === "p063BtnSelAll") {
        var all = document.getElementById("p063SelectAll");
        all.checked = !all.checked;
        setAllRows(all.checked, true);
        return;
      }
      if (t.id === "p063BtnPreview") return createReport();
      if (t.dataset && t.dataset.p063Page !== undefined && !t.disabled) return goPage(parseInt(t.dataset.p063Page, 10));
    });
    root.addEventListener("change", event => {
      const t = event.target;
      if (t.id === "p063SelectAll") return setAllRows(t.checked);
      if (t.dataset && t.dataset.p063Row !== undefined) return toggleRow(t.dataset.p063Row, t.checked);
    });
  }

  window.P063InvoiceKTV = {
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