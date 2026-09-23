/**
 * P063 — Print Invoice MCIT (หน้าแอปใน ERP Portal)
 * ข้อมูลจริงจาก API: api/p064_invoices.php (SQL Server M5CM-AA-01)
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

  var STYLE_ID = "p064-invoice-mcit-style";
  var PAGE_SIZE = 10;

  // ธีม: light/dark — variables p064-* (กำหนดตาม data-theme ของ <html>)
  var CSS_VARS = `
    :root {
      --p064-text: #172033;
      --p064-text-secondary: #334155;
      --p064-muted: #64748b;
      --p064-border: #e2e8f0;
      --p064-border-hover: #93c5fd;
      --p064-surface: #ffffff;
      --p064-hover: #f8fbff;
      --p064-primary: #2563eb;
      --p064-primary-hover: #1d4ed8;
      --p064-primary-soft: #eff6ff;
      --p064-focus-soft: rgb(37 99 235 / 15%);
    }
    [data-theme="dark"] {
      --p064-text: #e2e8f0;
      --p064-text-secondary: #cbd5e1;
      --p064-muted: #94a3b8;
      --p064-border: #334155;
      --p064-border-hover: #3b82f6;
      --p064-surface: #111c2e;
      --p064-hover: #16233a;
      --p064-primary: #3b82f6;
      --p064-primary-hover: #60a5fa;
      --p064-primary-soft: rgb(59 130 246 / 25%);
      --p064-focus-soft: rgb(96 165 250 / 20%);
    }
  `;

  var DOCTYPE_LIST = ["IVV7", "IVVX", "IMV7", "IMVN", "COD7", "CODF", "IVVF"];

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
    .p064 { color: var(--p064-text); }
    .p064 * { box-sizing: border-box; }
    .p064 button, .p064 input, .p064 select { font: inherit; }
    .p064 button { cursor: pointer; }

    .p064-filter-card, .p064-table-card, .p064-hint-card {
      border: 1px solid var(--p064-border);
      border-radius: 16px;
      background: var(--p064-surface);
      box-shadow: var(--shadow-card);
    }
    .p064-filter-card { padding: 24px; }
    .p064-filter-title { margin: 0 0 20px; font-size: 17px; }
    .p064-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .p064-field { display: grid; gap: 7px; }
    .p064-field > label { color: var(--p064-text-secondary); font-size: 13px; font-weight: 700; }
    .p064-field input, .p064-field select {
      width: 100%; height: 42px; padding: 0 12px;
      border: 1px solid var(--p064-border); border-radius: 9px;
      color: var(--p064-text); background: var(--p064-surface);
    }
    .p064-field input:focus, .p064-field select:focus {
      border-color: var(--p064-primary); outline: 3px solid var(--p064-focus-soft);
    }
    .p064-filter-actions { display: flex; align-items: flex-end; gap: 10px; }

    .p064-button {
      display: inline-flex; min-height: 42px; align-items: center; justify-content: center;
      gap: 8px; padding: 0 16px; border: 1px solid transparent; border-radius: 9px;
      font-weight: 700; transition: 0.15s ease;
    }
    .p064-button-primary { color: #fff; background: var(--p064-primary); }
    .p064-button-primary:hover { background: var(--p064-primary-hover); }
    .p064-button-secondary { border-color: var(--p064-border); color: var(--p064-text-secondary); background: var(--p064-surface); }
    .p064-button-secondary:hover { border-color: var(--p064-border-hover); color: var(--p064-primary); background: var(--p064-primary-soft); }
    .p064-button:disabled { opacity: 0.6; cursor: wait; }

    .p064-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin: 28px 0 14px; }
    .p064-toolbar h2 { margin: 0; font-size: 19px; }
    .p064-toolbar p { margin: 8px 0 0; color: var(--p064-muted); }
    .p064-toolbar-actions { display: flex; gap: 10px; }

    .p064-actionbar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      margin: 0 0 14px; padding: 13px 15px;
      border: 1px solid var(--p064-border); border-radius: 12px;
      background: var(--p064-surface); box-shadow: var(--shadow-card);
    }
    .p064-selinfo { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .p064-selicon {
      display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto;
      color: var(--p064-primary); background: var(--p064-primary-soft); border-radius: 11px;
    }
    .p064-selicon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .p064-seltext { display: flex; flex-direction: column; min-width: 0; }
    .p064-seltext strong { color: var(--p064-text); font-size: 14px; }
    .p064-seltext span { margin-top: 2px; color: var(--p064-muted); font-size: 11px; }
    .p064-actionbtns { display: flex; gap: 10px; flex: 0 0 auto; }
    .p064-actionbtns svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

    .p064-table-card { overflow: hidden; }
    .p064-table-responsive { overflow-x: auto; }
    .p064-table { width: 100%; min-width: 1150px; border-collapse: collapse; }
    .p064-table thead { background: var(--p064-hover); }
    .p064-table th, .p064-table td { padding: 14px 16px; border-bottom: 1px solid var(--p064-border); text-align: left; white-space: nowrap; }
    .p064-table th { color: var(--p064-text-secondary); font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .p064-table td { font-size: 14px; }
    .p064-table tbody tr:hover { background: var(--p064-hover); }
    .p064-table tbody tr.p064-selected { background: var(--p064-primary-soft); }

    .p064-check-column { width: 52px; text-align: center; }
    .p064-table input[type="checkbox"] { width: 17px; height: 17px; margin: 0; cursor: pointer; accent-color: var(--p064-primary); }

    .p064-invoice-number { color: var(--p064-primary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; }
    .p064-amount { font-weight: 800; }
    .p064-desc { white-space: normal; min-width: 220px; max-width: 380px; color: var(--p064-text-secondary); }

    .p064-pagination {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 14px 20px; background: var(--p064-hover); border-top: 1px solid var(--p064-border);
      flex-wrap: wrap;
    }
    .p064-page-info { color: var(--p064-muted); font-size: 13px; margin-right: 12px; }
    .p064-page-btn {
      min-width: 36px; min-height: 36px; padding: 0 10px;
      border: 1px solid var(--p064-border); border-radius: 8px; background: var(--p064-surface);
      font-weight: 700; color: var(--p064-text-secondary); cursor: pointer;
    }
    .p064-page-btn:hover { border-color: var(--p064-border-hover); color: var(--p064-primary); background: var(--p064-primary-soft); }
    .p064-page-btn.active { background: var(--p064-primary); border-color: var(--p064-primary); color: #fff; }
    .p064-page-btn:disabled { opacity: 0.4; cursor: default; }

    .p064-empty { padding: 52px 20px; color: var(--p064-muted); text-align: center; white-space: normal; }
    .p064-empty .p064-empty-sub { margin-top: 8px; font-size: 13px; color: var(--p064-muted); }
    .p064-hint-card { margin-top: 22px; padding: 18px 20px; color: var(--p064-muted); font-size: 14px; }
    .p064-hint-card strong { color: var(--p064-text); }

    @media (max-width: 1050px) {
      .p064-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .p064-toolbar { align-items: flex-start; flex-direction: column; }
      .p064-filter-card { padding: 18px; }
      .p064-filter-grid { grid-template-columns: 1fr; }
      .p064-filter-actions { width: 100%; }
      .p064-filter-actions .p064-button { flex: 1; }
    }

    /* toast — แจ้งเตือน (เช่น ไม่พบข้อมูล) */
    .p064-toast {
      position: fixed; right: 22px; bottom: 22px; z-index: 9999;
      display: flex; align-items: center; gap: 9px;
      max-width: 420px; padding: 12px 16px; border-radius: 10px;
      background: var(--p064-surface); color: var(--p064-text);
      border: 1px solid var(--p064-border);
      box-shadow: 0 10px 30px rgb(15 23 42 / 18%);
      font-size: 13px; line-height: 1.5;
      visibility: hidden; opacity: 0; transform: translateY(10px);
      transition: opacity .22s ease, transform .22s ease, visibility .22s;
      pointer-events: none;
    }
    .p064-toast.show { visibility: visible; opacity: 1; transform: translateY(0); }
  `;

  /* ---------- toast ---------- */
  var toastTimer = null;
  function showToast(msg, duration) {
    var el = document.getElementById("p064Toast");
    if (!el) return;
    document.getElementById("p064ToastMsg").textContent = msg;
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
    var body = document.getElementById("p064Body");
    var slice = pageSlice();

    if (filteredInvoices.length === 0) {
      var emptySub = Object.keys(selectedIds).length === 0
        ? "กรอกเงื่อนไขด้านบนแล้วกด ⌕ ค้นหา"
        : "ไม่พบรายการ — ลองเปลี่ยนเงื่อนไขแล้วค้นหาใหม่";
      body.innerHTML = `
        <tr>
          <td colspan="9" class="p064-empty">
            ยังไม่มีรายการแสดง
            <div class="p064-empty-sub">${emptySub}</div>
          </td>
        </tr>
      `;
    } else {
      body.innerHTML = slice.map(invoice => `
        <tr class="${selectedIds[invoice.id] ? "p064-selected" : ""}">
          <td class="p064-check-column">
            <input type="checkbox" ${selectedIds[invoice.id] ? "checked" : ""}
              data-p064-row="${invoice.id}">
          </td>
          <td><span class="p064-invoice-number">${invoice.id}</span></td>
          <td>${invoice.dateDisplay || "—"}</td>
          <td>${invoice.customerCode}</td>
          <td>${invoice.customer}</td>
          <td>${invoice.address || "—"}</td>
          <td class="p064-amount">${formatMoney(invoice.amount)}</td>
          <td><span class="p064-desc">${invoice.desc || "—"}</span></td>
          <td>${invoice.printCount} ครั้ง</td>
        </tr>
      `).join("");
    }

    updateSummary();
    renderPagination();
  }

  function updateSummary() {
    var selectedCount = Object.keys(selectedIds).length;
    var el = document.getElementById("p064SelCount");
    if (el) el.textContent = "เลือกแล้ว " + selectedCount + " รายการ";

    var slice = pageSlice();
    var allEl = document.getElementById("p064SelectAll");
    allEl.checked = slice.length > 0 &&
      slice.every(item => selectedIds[item.id]);
  }

  function renderPagination() {
    var el = document.getElementById("p064Pagination");
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

    var html = `<span class="p064-page-info">แสดง ${start}-${end} จาก ${filteredInvoices.length} รายการ · หน้า ${currentPage}/${total}</span>`;
    html += `<button class="p064-page-btn" type="button" ${currentPage === 1 ? "disabled" : ""} data-p064-page="${currentPage - 1}">‹</button>`;
    pages.forEach(p => {
      html += `<button class="p064-page-btn ${p === currentPage ? "active" : ""}" type="button" data-p064-page="${p}">${p}</button>`;
    });
    html += `<button class="p064-page-btn" type="button" ${currentPage === total ? "disabled" : ""} data-p064-page="${currentPage + 1}">›</button>`;
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
      dateFrom: document.getElementById("p064DateFrom").value,
      dateTo: document.getElementById("p064DateTo").value,
      salesCode: document.getElementById("p064SalesCode").value.trim(),
      doctype: document.getElementById("p064Doctype").value,
      status: document.getElementById("p064Status").value
    };
  }

  async function searchInvoices() {
    var filter = currentFilter();

    if (!filter.doctype || !filter.status) {
      document.getElementById("p064ResultText").textContent = "⚠ ต้องเลือก Doctype และ Status Invoice ก่อน";
      return;
    }

    if (!mac5Id) {
      document.getElementById("p064ResultText").textContent = "⚠ ไม่พบฐานข้อมูล MAC5 — ตรวจสอบการตั้งค่า connection";
      return;
    }

    var resultText = document.getElementById("p064ResultText");
    var btnSearch = document.getElementById("p064BtnSearch");
    resultText.textContent = "⏳ กำลังค้นหา...";
    if (btnSearch) btnSearch.disabled = true;

    try {
      const res = await fetch("api/p064_invoices.php", {
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
    document.getElementById("p064DateFrom").value = today;
    document.getElementById("p064DateTo").value = today;
    document.getElementById("p064SalesCode").value = "";
    document.getElementById("p064Doctype").value = DOCTYPE_LIST[0];
    document.getElementById("p064Status").value = Object.keys(STATUS_LIST)[0];
  }

  /* ---------- รายงานจากที่เลือก (modal + iframe: report/p064_report.html) ---------- */

  var p064ReportUrl = "";
  var p064EscBound = false;

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
    p064ReportUrl = "report/p064_report.html?ids=" + ids.join(",") + "&conn=" + encodeURIComponent(mac5Id);

    var overlay = document.getElementById("p064ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p064ReportOverlay";
      overlay.className = "p064-rep-overlay";
      overlay.innerHTML =
        '<div class="p064-rep-modal">' +
          '<div class="p064-rep-head">' +
            '<div class="p064-rep-headtxt">' +
              '<div class="p064-rep-title">▤ รายงาน Invoice</div>' +
              '<div class="p064-rep-sub" id="p064RepSub"></div>' +
            "</div>" +
            '<div class="p064-rep-btns">' +
              '<button class="p064-rep-btn" type="button" id="p064RepNewWin" title="เปิดหน้าต่างใหม่">↗</button>' +
              '<button class="p064-rep-btn" type="button" id="p064RepClose" title="ปิด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p064-rep-body"><iframe id="p064RepFrame" title="รายงาน Invoice"></iframe></div>' +
          '<div class="p064-rep-foot">' +
            '<div class="p064-rep-hint">รายงาน A4 — พิมพ์จากหน้านี้ได้โดยตรง (หรือกด ↗ เพื่อเปิดหน้าต่างใหม่)</div>' +
            '<button class="p064-rep-btn p064-rep-btn-primary" type="button" id="p064RepPrint">พิมพ์</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p064RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p064RepNewWin").addEventListener("click", function () {
        if (p064ReportUrl) window.open(p064ReportUrl, "_blank", "width=900,height=1200");
      });
      overlay.querySelector("#p064RepPrint").addEventListener("click", function () {
        var f = document.getElementById("p064RepFrame");
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
      if (!p064EscBound) {
        p064EscBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    overlay.querySelector("#p064RepSub").textContent =
      "เลือกเอกสาร " + items.length + " รายการ — " + new Date().toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
    var f = overlay.querySelector("#p064RepFrame");
    f.src = p064ReportUrl;
    overlay.classList.add("show");
  }

  function closeReport() {
    var overlay = document.getElementById("p064ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    var f = overlay.querySelector("#p064RepFrame");
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
    .p064-rep-overlay{display:none;position:fixed;inset:0;z-index:900;align-items:center;justify-content:center;background:rgba(2,6,23,.8);padding:18px}
    .p064-rep-overlay.show{display:flex}
    .p064-rep-modal{display:flex;width:min(1100px,100%);height:94vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.35)}
    .p064-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid var(--p064-border)}
    .p064-rep-headtxt{display:flex;flex-direction:column;gap:2px;min-width:0}
    .p064-rep-title{font-size:15px;font-weight:700;color:var(--p064-text)}
    .p064-rep-sub{font-size:12px;color:var(--p064-muted)}
    .p064-rep-btns{display:flex;gap:8px;flex-shrink:0}
    .p064-rep-btn{display:grid;width:34px;height:34px;place-items:center;color:var(--p064-muted);border:1px solid var(--p064-border);border-radius:9px;background:transparent;transition:.15s}
    .p064-rep-btn:hover{color:var(--p064-text);border-color:var(--p064-primary)}
    .p064-rep-body{flex:1;min-height:0;background:#e2e8f0;display:flex;justify-content:center;overflow:auto;padding:18px}
    .p064-rep-body iframe{width:100%;height:100%;border:1px solid var(--p064-border);border-radius:10px;background:#fff}
    .p064-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px;border-top:1px solid var(--p064-border)}
    .p064-rep-hint{font-size:12px;color:var(--p064-muted)}
    .p064-rep-btn-primary{width:auto;padding:0 18px;height:38px;background:var(--p064-primary);color:#fff;border-color:var(--p064-primary);font-weight:700;font-size:13px}
    .p064-rep-btn-primary:hover{filter:brightness(1.08);color:#fff}
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
      <div class="p064">
        <section class="p064-filter-card">
          <h2 class="p064-filter-title">⌕ ค้นหารายการ Invoice</h2>

          <div class="p064-filter-grid">
            <div class="p064-field">
              <label for="p064DateFrom">วันที่ Invoice ระหว่างวันที่</label>
              <input id="p064DateFrom" type="date" value="${today}">
            </div>

            <div class="p064-field">
              <label for="p064DateTo">ถึงวันที่</label>
              <input id="p064DateTo" type="date" value="${today}">
            </div>

            <div class="p064-field">
              <label for="p064SalesCode">รหัสผู้แทน</label>
              <input id="p064SalesCode" type="text" placeholder="ระบุรหัสผู้แทน">
            </div>

            <div class="p064-field">
              <label for="p064Doctype">Doctype <span style="color:#dc2626">*</span></label>
              <select id="p064Doctype">${doctypeOptions}</select>
            </div>

            <div class="p064-field">
              <label for="p064Status">Status Invoice <span style="color:#dc2626">*</span></label>
              <select id="p064Status">${statusOptions}</select>
            </div>

            <div class="p064-filter-actions">
              <button class="p064-button p064-button-primary" type="button" id="p064BtnSearch">⌕ ค้นหา</button>
              <button class="p064-button p064-button-secondary" type="button" id="p064BtnReset">↻ ล้างค่า</button>
            </div>
          </div>
        </section>

        <section class="p064-toolbar">
          <div>
            <h2>รายการ Invoice</h2>
            <p id="p064ResultText">ยังไม่ได้ค้นหา — เลือก Doctype / Status แล้วกด ⌕ ค้นหา</p>
          </div>
        </section>

        <section class="p064-actionbar">
          <div class="p064-selinfo">
            <div class="p064-selicon"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg></div>
            <div class="p064-seltext"><strong id="p064SelCount">เลือกแล้ว 0 รายการ</strong><span>ประเภทเอกสาร: ใบแจ้งหนี้</span></div>
          </div>
          <div class="p064-actionbtns">
            <button class="p064-button p064-button-secondary" type="button" id="p064BtnSelAll"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 11l3 3 4-5"></path></svg>เลือกทั้งหมด</button>
            <button class="p064-button p064-button-primary" type="button" id="p064BtnPreview"><svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>Print Preview</button>
          </div>
        </section>

        <section class="p064-table-card">
          <div class="p064-table-responsive">
            <table class="p064-table">
              <thead>
                <tr>
                  <th class="p064-check-column"><input id="p064SelectAll" type="checkbox"></th>
                  <th>เลขที่ Invoice</th>
                  <th>วันที่ Invoice</th>
                  <th>รหัสลูกค้า</th>
                  <th>ชื่อลูกค้า</th>
                  <th>พื้นที่</th>
                  <th>ยอดรวม</th>
                  <th>หมายเหตุ</th>
                  <th>จำนวนพิมพ์</th>
                </tr>
              </thead>
              <tbody id="p064Body"></tbody>
            </table>
          </div>

          <div class="p064-pagination" id="p064Pagination"></div>
        </section>

        <section class="p064-hint-card">
          <strong>คำแนะนำ:</strong> Doctype และ Status เป็น<strong>บังคับ</strong> (default = ตัวเลือกแรกสุด)
          · วันที่ default = วันนี้ · checkbox เลือกได้ข้ามหน้า, หัวตาราง = เลือกเฉพาะหน้า
          · กด <strong>▤ Print Preview</strong> เพื่อเปิดรายงานในหน้า preview
        </section>
      </div>
      <div class="p064-toast" id="p064Toast"><span id="p064ToastMsg"></span></div>
    `;

    renderTable();
    resolveConnection();

    // event delegation — bind หนึ่งครั้งตอน mount (ไม่พึ่ง inline onclick)
    root.addEventListener("click", event => {
      const t = event.target;
      if (t.id === "p064BtnSearch") return searchInvoices();
      if (t.id === "p064BtnReset") return resetFilters();
      if (t.id === "p064BtnSelAll") {
        var all = document.getElementById("p064SelectAll");
        all.checked = !all.checked;
        setAllRows(all.checked, true);
        return;
      }
      if (t.id === "p064BtnPreview") return createReport();
      if (t.dataset && t.dataset.p064Page !== undefined && !t.disabled) return goPage(parseInt(t.dataset.p064Page, 10));
    });
    root.addEventListener("change", event => {
      const t = event.target;
      if (t.id === "p064SelectAll") return setAllRows(t.checked);
      if (t.dataset && t.dataset.p064Row !== undefined) return toggleRow(t.dataset.p064Row, t.checked);
    });
  }

  window.P064InvoiceMCIT = {
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
