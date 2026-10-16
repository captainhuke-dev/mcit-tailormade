/* P080 — PickList QC
 * IIFE — window.P080PickListQC = { mount }
 * clone demo/P080_demo.html — UI ก่อน (mock data ตาม demo, ยังไม่เชื่อม API)
 */
(function () {
  "use strict";

  var STATUS_OPTIONS = [
    ["6", "6-ลูกค้ารับเอง"],
    ["17", "17-ตัดท้ายรถ"],
    ["42", "42-INV - ปกติ"],
    ["43", "43-INV - ด่วน"],
    ["44", "44-INV - ปกติ BKK"],
    ["45", "45-INV - ด่วน BKK"],
    ["50", "50-PL ปกติ"],
    ["51", "51-PL ด่วน"],
    ["52", "52-Picking List ปกติ"],
    ["53", "53-Picking List ด่วน"],
    ["54", "54-PL ปกติ BKK"],
    ["55", "55-PL ด่วน BKK"]
  ];

  var MONTHS_TH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  var SAMPLE_PRODUCTS = [
    { code: "11650095", name: "รองเท้าบู๊ทตายาว 11(A2900) [12Pair/Carton]", unit: "Carton" },
    { code: "11650099", name: "รองเท้าบู๊ทตายาว 10.5(A3000) [12Pair/Carton]", unit: "Carton" },
    { code: "11650100", name: "รองเท้าบู๊ทตายาว 11(A3000) [12Pair/Carton]", unit: "Carton" },
    { code: "10010243", name: "กรองแสง-3เข็ม(ไก่ชน-MCT) 50% ดำ 2*90m", unit: "Ea" },
    { code: "10010246", name: "กรองแสง-3เข็ม(ไก่ชน-MCT) 80% ดำ 2*90m", unit: "Ea" },
    { code: "10010378", name: "กรองแสง-1เข็มล็อคตา(No1-MCT) 80% ดำ 2*100m", unit: "Ea" },
    { code: "10010546", name: "กรองแสงพัน-1ซิบเข็มล็อคตา(No1-MCT) 80% ดำ 2*5m", unit: "Ea" },
    { code: "11650101", name: "รองเท้าบู๊ทตายาว 11.5(A3000) [12Pair/Carton]", unit: "Carton" }
  ];

  var root = null;
  var el = {};
  var state = { rows: [], generated: false, loading: false, hideNames: false };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
      eyeoff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><path d="M1 1l22 22"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      check: '<path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(d) {
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543);
  }

  function isoDate(d) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function statusLabel(v) {
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      if (STATUS_OPTIONS[i][0] === v) return STATUS_OPTIONS[i][1];
    }
    return v;
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function showToast(msg, ms) {
    $("p080ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  /* ---------- mock: สร้างเอกสาร (ตาม demo — ข้อมูลตัวอย่าง) ---------- */
  function generatePicklist(hideNames) {
    var docCount = randomBetween(2, 4);
    var results = [];
    var runningIndex = 1;
    for (var d = 0; d < docCount; d++) {
      var docNumber = (hideNames ? "PQCH" : "PQCN") + "6910-" + String(runningIndex).padStart(4, "0");
      var itemCount = randomBetween(2, 5);
      for (var i = 0; i < itemCount; i++) {
        var product = SAMPLE_PRODUCTS[randomBetween(0, SAMPLE_PRODUCTS.length - 1)];
        results.push({
          index: results.length + 1,
          document: docNumber,
          date: el.headDate.value,
          productCode: product.code,
          productName: product.name,
          quantity: randomBetween(1, 20),
          unit: product.unit,
          status: el.status.value
        });
      }
      runningIndex++;
    }
    return results;
  }

  /* ---------- render ผลลัพธ์ ---------- */
  function render() {
    var rows = state.rows;
    if (!state.generated || !rows.length) {
      el.tableContainer.style.display = "none";
      el.footer.style.display = "none";
      el.modeBadge.style.display = "none";
      el.emptyState.style.display = "flex";
      el.subtitle.textContent = "ยังไม่ได้สร้างเอกสาร";
      return;
    }
    el.tableContainer.style.display = "block";
    el.footer.style.display = "flex";
    el.modeBadge.style.display = "inline-flex";
    el.emptyState.style.display = "none";
    el.modeBadge.textContent = state.hideNames ? "โหมดซ่อนชื่อสินค้า" : "โหมดปกติ";
    el.modeBadge.className = "p080-mode-badge " + (state.hideNames ? "hidden" : "normal");
    el.subtitle.textContent = "วันที่หัวเอกสาร " + fmtDate(el.headDate.value) + " · สถานะ " + statusLabel(el.status.value);

    var html = "";
    rows.forEach(function (r) {
      html += "<tr>" +
        '<td class="center">' + r.index + "</td>" +
        '<td class="p080-doc-number">' + esc(r.document) + "</td>" +
        '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
        '<td class="p080-product-code">' + esc(r.productCode) + "</td>" +
        '<td class="p080-product-name' + (state.hideNames ? " masked" : "") + '">' +
          (state.hideNames ? "••••••••••••••••" : esc(r.productName)) + "</td>" +
        '<td class="center number">' + esc(r.quantity) + "</td>" +
        '<td class="center">' + esc(r.unit) + "</td>" +
        '<td><span class="p080-status-tag">' + esc(statusLabel(r.status)) + "</span></td>" +
        '<td class="center"><span class="p080-qc-check"></span></td>' +
        "</tr>";
    });
    el.rows.innerHTML = html;
    el.footerText.textContent = "แสดง " + rows.length + " รายการ";
  }

  /* ---------- สร้างเอกสาร (ปกติ / ซ่อนชื่อสินค้า) ---------- */
  function doGenerate(hideNames) {
    if (state.loading) return;
    state.loading = true;
    state.hideNames = hideNames;
    var btn = hideNames ? el.genHiddenBtn : el.genNormalBtn;
    btn.classList.add("loading");
    btn.disabled = true;
    (hideNames ? el.genHiddenBtn : el.genNormalBtn).disabled = true;
    (hideNames ? el.genNormalBtn : el.genHiddenBtn).disabled = true;

    // mock — ต่อ APIจริงขึ้ น
    setTimeout(function () {
      state.rows = generatePicklist(hideNames);
      state.generated = true;
      state.loading = false;
      el.genNormalBtn.classList.remove("loading");
      el.genHiddenBtn.classList.remove("loading");
      el.genNormalBtn.disabled = false;
      el.genHiddenBtn.disabled = false;
      render();
      showToast("สร้างเอกสาร " + statusLabel(el.status.value) + (hideNames ? " (ซ่อนชื่อสินค้า)" : ""));
    }, 900);
  }

  /* ---------- CSS ---------- */
  var CSS = [
    ".p080-app{display:flex;flex-direction:column;gap:14px}",
    /* launcher */
    ".p080-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p080-launcher-body{display:grid;grid-template-columns:minmax(220px,0.8fr) minmax(220px,0.9fr) auto auto;gap:14px;align-items:end;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p080-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p080-input-wrap{position:relative}",
    ".p080-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-input-wrap input,.p080-input-wrap select{width:100%;height:44px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p080-input-wrap select{cursor:pointer;appearance:none}",
    ".p080-input-wrap input:focus,.p080-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p080-action-button{display:flex;min-height:44px;width:165px;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 10px;color:#fff;border:0;border-radius:11px;font-size:13px;font-weight:700;text-align:center;transition:0.16s ease}",
    ".p080-action-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-action-button.primary{background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,0.26)}",
    ".p080-action-button.secondary{background:linear-gradient(135deg,#a78bfa,#7c3aed);box-shadow:0 9px 20px rgba(124,58,237,0.26)}",
    ".p080-action-button small{font-size:10px;font-weight:600;opacity:0.92}",
    ".p080-action-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}",
    ".p080-action-button:disabled{opacity:0.7}",
    ".p080-action-button.loading svg{animation:p080spin 1s linear infinite}",
    "@keyframes p080spin{to{transform:rotate(360deg)}}",
    /* panel */
    ".p080-panel{display:flex;flex-direction:column;min-height:420px;flex:1;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p080-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p080-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p080-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p080-panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-panel-title h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
    ".p080-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p080-mode-badge{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p080-mode-badge.normal{color:#1d4ed8;background:#dbeafe}",
    ".p080-mode-badge.hidden{color:#7c3aed;background:#f5f3ff}",
    ".p080-table-container{min-height:0;flex:1;overflow:auto}",
    ".p080-table{width:100%;min-width:820px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p080-table th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p080-table td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
    ".p080-table th.center,.p080-table td.center{text-align:center}",
    ".p080-table th.number,.p080-table td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p080-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p080-table tbody tr:hover{background:#f0f7ff}",
    ".p080-doc-number{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p080-product-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}",
    ".p080-product-name.masked{color:#94a3b8;font-style:italic;letter-spacing:1px}",
    ".p080-status-tag{display:inline-flex;padding:3px 9px;color:#92400e;border-radius:7px;background:#fef3c7;font-size:11px;font-weight:700;white-space:normal}",
    ".p080-qc-check{display:inline-flex;width:20px;height:20px;align-items:center;justify-content:center;border:2px solid #cbd5e1;border-radius:5px;background:#fff}",
    ".p080-empty-state{display:flex;min-height:320px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p080-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-empty-state p{margin-top:5px;font-size:11px}",
    ".p080-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    /* toast */
    ".p080-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p080-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    "@media (max-width:950px){.p080-launcher-body{grid-template-columns:1fr}.p080-action-button{width:100%;flex-direction:row}}",
    "@media (max-width:680px){.p080-panel-header{align-items:flex-start;flex-direction:column}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  function html() {
    var statusHtml = "";
    STATUS_OPTIONS.forEach(function (s) {
      statusHtml += '<option value="' + s[0] + '"' + (s[0] === "6" ? " selected" : "") + ">" + esc(s[1]) + "</option>";
    });
    var today = new Date();
    return '<div class="p080-app">' +
      '<section class="p080-launcher-card">' +
        '<form class="p080-launcher-body" id="p080Form">' +
          '<div class="p080-field">' +
            '<label for="p080HeadDate">วันที่หัวเอกสาร</label>' +
            '<div class="p080-input-wrap">' + icon("cal") + '<input id="p080HeadDate" type="date" value="' + isoDate(today) + '"></div>' +
          "</div>" +
          '<div class="p080-field">' +
            '<label for="p080Status">สถานะใบแจ้งหนี้</label>' +
            '<div class="p080-input-wrap">' + icon("chevron") + '<select id="p080Status">' + statusHtml + "</select></div>" +
          "</div>" +
          '<button class="p080-action-button primary" id="p080GenNormal" type="submit">' + icon("doc") + "สร้างเอกสาร</button>" +
          '<button class="p080-action-button secondary" id="p080GenHidden" type="button">' + icon("eyeoff") + "สร้างเอกสาร<small>(ซ่อนชื่อสินค้า)</small></button>" +
        "</form>" +
      "</section>" +
      '<section class="p080-panel">' +
        '<div class="p080-panel-header">' +
          '<div class="p080-panel-heading">' +
            '<div class="p080-panel-icon">' + icon("grid") + "</div>" +
            '<div class="p080-panel-title">' +
              "<h2>ผลการสร้างเอกสาร PickList QC</h2>" +
              '<p id="p080Subtitle">ยังไม่ได้สร้างเอกสาร</p>' +
            "</div>" +
          "</div>" +
          '<span class="p080-mode-badge normal" id="p080ModeBadge" style="display:none">โหมดปกติ</span>' +
        "</div>" +
        '<div class="p080-table-container" id="p080TableContainer" style="display:none">' +
          '<table class="p080-table">' +
            "<thead><tr>" +
            '<th class="center">ลำดับ</th><th>เลขที่เอกสาร</th><th class="center">วันที่</th>' +
            "<th>รหัสสินค้า</th><th>ชื่อสินค้า</th>" +
            '<th class="center number">จำนวน</th><th class="center">หน่วย</th><th>สถานะ</th>' +
            '<th class="center">QC</th>' +
            "</tr></thead>" +
            '<tbody id="p080Rows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p080-empty-state" id="p080EmptyState">' +
          "<div>" + icon("check") +
          "<strong>ยังไม่มีเอกสารที่สร้าง</strong>" +
          '<p>กำหนดเงื่อนไขด้านบน แล้วกด "สร้างเอกสาร" หรือ "สร้างเอกสาร (ซ่อนชื่อสินค้า)"</p>' +
          "</div>" +
        "</div>" +
        '<div class="p080-table-footer" id="p080Footer" style="display:none">' +
          '<span id="p080FooterText">แสดง 0 รายการ</span>' +
        "</div>" +
      "</section>" +
      '<div class="p080-toast" id="p080Toast"><span id="p080ToastMsg"></span></div>' +
      "</div>";
  }

  function mount(mountEl) {
    root = mountEl;
    root.innerHTML = html();
    if (!document.getElementById("p080Style")) {
      var st = document.createElement("style");
      st.id = "p080Style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    el.headDate = $("p080HeadDate");
    el.status = $("p080Status");
    el.genNormalBtn = $("p080GenNormal");
    el.genHiddenBtn = $("p080GenHidden");
    el.subtitle = $("p080Subtitle");
    el.modeBadge = $("p080ModeBadge");
    el.tableContainer = $("p080TableContainer");
    el.rows = $("p080Rows");
    el.emptyState = $("p080EmptyState");
    el.footer = $("p080Footer");
    el.footerText = $("p080FooterText");
    el.toast = $("p080Toast");

    $("p080Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doGenerate(false);
    });
    el.genHiddenBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doGenerate(true);
    });
  }

  window.P080PickListQC = { mount: mount };
})();
