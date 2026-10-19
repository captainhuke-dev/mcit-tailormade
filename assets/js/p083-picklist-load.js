
/* P083 — PickList To LOAD V2
 * IIFE — window.P083PickListLoad = { mount }
 * clone demo/P083-demo.html + C# AppPickList/frm_PickListToLOAD_v2
 *   - Launcher: สถานะ (12) + Route (7) + กลุ่มคลังสินค้า checkbox (9) + สร้างเอกสาร
 *   - Preview: paper "PickList [To Load][Zone QC]" — 6 คอลั่น
 *   - UI stage: sample data ตาม demo — API ต่อใน phase ถัดไป
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

  var ROUTE_OPTIONS = [
    ["all", "All-ทั้งหมด"],
    ["Route1", "M1-M2-M3"],
    ["Route2", "M4-M5"],
    ["M6", "M6"],
    ["M7", "M7"],
    ["M8", "M8"],
    ["M9", "M9"]
  ];

  var WAREHOUSE_GROUPS = [
    { code: "G01", checked: true },
    { code: "G02", checked: true },
    { code: "G03", checked: true },
    { code: "G04", checked: true },
    { code: "G06", checked: false },
    { code: "G07", checked: false },
    { code: "G09", checked: false },
    { code: "RTV", checked: true },
    { code: "BKK", checked: true }
  ];

  var SAMPLE_DATA = {
    "17": {
      "M9": [
        {
          productCode: "10360017",
          productName: "แบตเตอรี่แห้ง(LightingAll) 12V-8Ah [10Ea/CT]",
          unit: "Ea/Ea",
          warehouse: "01",
          totalQty: 2,
          totalBase: 0,
          customers: [
            { name: "วรรณ (LC*) (กำแพงแสน)", document: "IVVN6904-3905", date: "2026-04-29", qty: 2, unit: "Ea" }
          ]
        },
        {
          productCode: "10360018",
          productName: "แบตเตอรี่แห้ง(LightingAll) 12V-12Ah [6Ea/CT]",
          unit: "Ea/Ea",
          warehouse: "01",
          totalQty: 2,
          totalBase: 0,
          customers: [
            { name: "วรรณ (LC*) (กำแพงแสน)", document: "IVVN6904-3905", date: "2026-04-29", qty: 2, unit: "Ea" }
          ]
        }
      ]
    }
  };

  var root = null;
  var el = {};
  var state = { products: [], filters: null };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>',
      pen: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
      eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle>',
      print: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect>',
      expand: '<path d="M16 3h5v5"></path><path d="M8 21H3v-5"></path><path d="M21 3 14 10"></path><path d="M3 21l7-7"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(value) {
    var m = String(value || "").split("-");
    if (m.length !== 3) return String(value || "");
    return m[2] + "/" + m[1] + "/" + (parseInt(m[0], 10) + 543);
  }

  function fmtStamp() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return p(d.getDate()) + "/" + p(d.getMonth() + 1) + "/" + (d.getFullYear() + 543) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  function statusLabel(v) {
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      if (STATUS_OPTIONS[i][0] === v) return STATUS_OPTIONS[i][1];
    }
    return String(v);
  }

  function selectedWarehouses() {
    var out = [];
    for (var i = 0; i < WAREHOUSE_GROUPS.length; i++) {
      var c = $("p083wh_" + WAREHOUSE_GROUPS[i].code);
      if (c && c.checked) out.push(WAREHOUSE_GROUPS[i].code);
    }
    return out;
  }

  function getProducts(status, route) {
    var byStatus = SAMPLE_DATA[status];
    if (!byStatus) return [];
    if (route === "all") {
      var out = [];
      for (var k in byStatus) { if (byStatus.hasOwnProperty(k)) out = out.concat(byStatus[k]); }
      return out;
    }
    return byStatus[route] || [];
  }

  function machineName() {
    if (window.ERP_USER && window.ERP_USER.name) return window.ERP_USER.name;
    return "PORTAL";
  }

  var CSS = [
    ".p083-app{display:flex;flex-direction:column;gap:14px}",
    ".p083-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p083-launcher-body{display:grid;grid-template-columns:minmax(170px,0.6fr) minmax(130px,0.4fr) minmax(220px,0.8fr) auto;gap:18px;align-items:center;padding:20px;background:linear-gradient(180deg,#e3f7fb,#eefbfd)}",
    ".p083-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p083-input-wrap{position:relative}",
    ".p083-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p083-input-wrap select{width:100%;height:42px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px;cursor:pointer;appearance:none}",
    ".p083-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p083-group-section{min-width:0;padding:12px 14px;border:1px solid #cbd9ec;border-radius:12px;background:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 1px 3px rgba(15,23,42,0.05)}",
    ".p083-group-section label.p083-group-title{display:block;margin-bottom:9px;color:#1d4ed8;font-size:12px;font-weight:700}",
    ".p083-group-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 10px}",
    ".p083-group-option{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;cursor:pointer}",
    ".p083-group-option input{width:16px;height:16px;accent-color:#2563eb;cursor:pointer}",
    ".p083-generate{display:inline-flex;height:50px;align-items:center;gap:10px;padding:0 24px;color:#fff;border:0;border-radius:12px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 10px 22px rgba(37,99,235,0.28);font-size:14px;font-weight:700;white-space:nowrap;cursor:pointer;transition:0.16s ease}",
    ".p083-generate:hover{transform:translateY(-2px);filter:brightness(1.06)}",
    ".p083-generate svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p083-preview{display:flex;min-height:480px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#94a3b8;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p083-preview-toolbar{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;border-bottom:1px solid #475569;background:#334155}",
    ".p083-preview-title{display:flex;align-items:center;gap:9px;color:#e2e8f0;font-size:13px;font-weight:700}",
    ".p083-preview-title svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p083-print{display:inline-flex;height:34px;align-items:center;gap:6px;padding:0 14px;color:#1e293b;border:0;border-radius:8px;background:#e2e8f0;font-size:12px;font-weight:700;cursor:pointer}",
    ".p083-print:hover{background:#fff}",
    ".p083-print svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p083-scroll{display:flex;flex:1;justify-content:center;overflow:auto;padding:28px 20px;background:repeating-linear-gradient(45deg,#9aa5b1 0 2px,transparent 2px 10px)}",
    ".p083-paper{width:900px;min-height:100%;padding:28px 32px 40px;background:#fff;box-shadow:0 18px 44px rgba(15,23,42,0.32)}",
    ".p083-paper-title{font-size:20px;text-align:center;color:#0f172a;font-weight:800}",
    ".p083-paper-meta{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:10px;color:#1d4ed8;font-size:12px;font-weight:700}",
    ".p083-paper-meta span{color:#475569;font-weight:600}",
    ".p083-table{width:100%;margin-top:16px;border-collapse:collapse}",
    ".p083-table thead th{padding:8px 10px;color:#1d4ed8;border-top:2px solid #1d4ed8;border-bottom:2px solid #1d4ed8;background:#eff6ff;font-size:12px;font-weight:700;text-align:left}",
    ".p083-table thead th.center{text-align:center}",
    ".p083-grow td{padding:9px 10px 6px;border-bottom:1px solid #cbd5e1;background:#f1f5f9;font-size:13px;font-weight:700}",
    ".p083-grow .p083-prod{color:#0f172a}",
    ".p083-grow td.center{text-align:center}",
    ".p083-crow td{padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:12.5px}",
    ".p083-crow td.center{text-align:center}",
    ".p083-crow td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p083-cust{color:#334155}",
    ".p083-doc{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p083-qty{font-family:Arial,sans-serif;font-weight:700}",
    ".p083-wh{display:inline-flex;min-width:28px;justify-content:center;padding:1px 7px;color:#047857;border-radius:6px;background:#d1fae5;font-family:Arial,sans-serif;font-size:11px;font-weight:700}",
    ".p083-empty{display:flex;flex:1;align-items:center;justify-content:center;color:#e2e8f0;text-align:center;padding:40px}",
    ".p083-empty svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p083-empty p{margin-top:6px;font-size:12px}",
    ".p083-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:10001;padding:10px 18px;color:#fff;border-radius:10px;background:#0f172a;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p083-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    "@media (max-width:1050px){.p083-launcher-body{grid-template-columns:1fr 1fr}.p083-generate{grid-column:1/-1;width:100%;justify-content:center}.p083-group-grid{grid-template-columns:repeat(2,1fr)}.p083-paper{width:100%}}",
    "@media (max-width:680px){.p083-launcher-body{grid-template-columns:1fr}.p083-group-grid{grid-template-columns:repeat(2,1fr)}.p083-scroll{padding:14px}}",
    "@media print{body{background:#fff}.p083-app > *:not(.p083-preview){display:none}.p083-preview{border:none;border-radius:0;background:#fff;box-shadow:none;min-height:0}.p083-preview-toolbar{display:none}.p083-scroll{padding:0;background:#fff;overflow:visible;display:block}.p083-paper{width:100%;box-shadow:none;padding:0}}"
  ];

  function groupOptionsHtml() {
    var h = "";
    for (var i = 0; i < WAREHOUSE_GROUPS.length; i++) {
      var g = WAREHOUSE_GROUPS[i];
      h += '<label class="p083-group-option"><input type="checkbox" id="p083wh_' + g.code + '" value="' + g.code + '"' + (g.checked ? " checked" : "") + ">" + g.code + "</label>";
    }
    return h;
  }

  function statusOptionsHtml() {
    var h = "";
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      h += '<option value="' + STATUS_OPTIONS[i][0] + '"' + (STATUS_OPTIONS[i][0] === "17" ? " selected" : "") + ">" + esc(STATUS_OPTIONS[i][1]) + "</option>";
    }
    return h;
  }

  function routeOptionsHtml() {
    var h = "";
    for (var i = 0; i < ROUTE_OPTIONS.length; i++) {
      h += '<option value="' + ROUTE_OPTIONS[i][0] + '"' + (ROUTE_OPTIONS[i][0] === "all" ? " selected" : "") + ">" + esc(ROUTE_OPTIONS[i][1]) + "</option>";
    }
    return h;
  }

  function emptyHtml() {
    return '<div class="p083-empty"><div>' + icon("expand") +
      "<strong>" + "ยังไม่มีเอกสารที่สร้าง" + "</strong>" +
      "<p>" + "กำหนดเงื่อนไขด้านบน แล้วกด \"สร้างเอกสาร\"" + "</p>" +
      "</div></div>";
  }

  function paperHtml(bodyHtml) {
    return (
      '<article class="p083-paper" id="p083Paper">' +
        '<h1 class="p083-paper-title">"PickList [To Load][Zone QC]"</h1>' +
        '<div class="p083-paper-meta">' +
          "<div>" + "สถานะ" + ': <span id="p083MetaStatus">-</span></div>' +
          "<div>" + "พิมพ์เมื่อ" + ': <span id="p083MetaPrinted">-</span></div>' +
          "<div>" + "โดย" + ': <span id="p083MetaUser">-</span></div>' +
        "</div>" +
        '<table class="p083-table">' +
          "<thead><tr>" +
            '<th style="width:20%">"รหัส + ชื่อสินค้า"</th>' +
            '<th style="width:28%">"ชื่อลูกค้า"</th>' +
            '<th style="width:15%">"เลขที่ใบสำคัญ"</th>' +
            '<th class="center" style="width:11%">"วันที่"</th>' +
            '<th class="center" style="width:10%">"จำนวน"</th>' +
            '<th class="center" style="width:8%">"หน่วย/คลัง"</th>' +
          "</tr></thead>" +
          '<tbody id="p083PaperBody">' + bodyHtml + "</tbody>" +
        "</table>" +
      "</article>"
    );
  }

  function html() {
    return (
      '<div class="p083-app">' +
        '<section class="p083-launcher-card">' +
          '<form class="p083-launcher-body" id="p083Form">' +
            '<div class="p083-field">' +
              '<label for="p083Status">' + "สถานะ (MIHstatus)" + "</label>" +
              '<div class="p083-input-wrap">' + icon("chevron") + '<select id="p083Status">' + statusOptionsHtml() + "</select></div>" +
            "</div>" +
            '<div class="p083-field">' +
              '<label for="p083Route">' + "Route" + "</label>" +
              '<div class="p083-input-wrap">' + icon("chevron") + '<select id="p083Route">' + routeOptionsHtml() + "</select></div>" +
            "</div>" +
            '<div class="p083-group-section">' +
              '<label class="p083-group-title">' + "กลุ่มคลังสินค้า" + "</label>" +
              '<div class="p083-group-grid">' + groupOptionsHtml() + "</div>" +
            "</div>" +
            '<button class="p083-generate" id="p083GenBtn" type="submit">' + icon("pen") + "สร้างเอกสาร" + "</button>" +
          "</form>" +
        "</section>" +
        '<section class="p083-preview">' +
          '<div class="p083-preview-toolbar">' +
            '<div class="p083-preview-title">' + icon("eye") + "ตัวอย่างก่อนพิมพ์" + "</div>" +
            '<button class="p083-print" id="p083PrintBtn" type="button">' + icon("print") + "พิมพ์เอกสาร" + "</button>" +
          "</div>" +
          '<div class="p083-scroll" id="p083Scroll"></div>' +
        "</section>" +
        '<div class="p083-toast" id="p083Toast"><span id="p083ToastMsg"></span></div>' +
      "</div>"
    );
  }

  function showToast(msg, ms) {
    $("p083ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  function renderDocument(filters) {
    var products = getProducts(filters.status, filters.route);
    state.filters = filters;
    state.products = products;
    var scroll = $("p083Scroll");
    if (!products.length) {
      scroll.innerHTML = emptyHtml();
      return;
    }
    var h = "";
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      h +=
        '<tr class="p083-grow">' +
          '<td colspan="2" class="p083-prod">' + esc(p.productCode) + ", " + esc(p.productName) + "</td>" +
          "<td></td>" +
          "<td></td>" +
          '<td class="center p083-qty">' + p.totalQty + "/" + p.totalBase + "</td>" +
          '<td class="center">' + esc(p.unit) + ' <span class="p083-wh">[' + esc(p.warehouse) + "]</span></td>" +
        "</tr>";
      for (var j = 0; j < p.customers.length; j++) {
        var c = p.customers[j];
        h +=
          '<tr class="p083-crow">' +
            "<td></td>" +
            '<td class="p083-cust">' + esc(c.name) + "</td>" +
            '<td class="p083-doc">' + esc(c.document) + "</td>" +
            '<td class="center">' + fmtDate(c.date) + "</td>" +
            '<td class="center number">' + c.qty + "</td>" +
            '<td class="center">' + esc(c.unit) + "</td>" +
          "</tr>";
      }
    }
    scroll.innerHTML = paperHtml(h);
    // meta spans exist only after paperHtml is inserted — set them now
    $("p083MetaStatus").textContent = statusLabel(filters.status);
    $("p083MetaPrinted").textContent = fmtStamp();
    $("p083MetaUser").textContent = machineName();
  }

  function mount(mountEl) {
    root = mountEl;
    root.innerHTML = html();
    if (!document.getElementById("p083Style")) {
      var st = document.createElement("style");
      st.id = "p083Style";
      st.textContent = CSS.join("\n");
      document.head.appendChild(st);
    }
    el.toast = $("p083Toast");
    $("p083Scroll").innerHTML = emptyHtml();
    $("p083Form").addEventListener("submit", function (e) {
      e.preventDefault();
      var wh = selectedWarehouses();
      if (!wh.length) {
        showToast("ลื่ก กลุ่มคลังสินค้า");
        return;
      }
      renderDocument({
        status: $("p083Status").value,
        route: $("p083Route").value,
        warehouses: wh
      });
    });
    $("p083PrintBtn").addEventListener("click", function () {
      if (!state.products.length) {
        showToast("ไม่มีเอกสาร");
        return;
      }
      window.print();
    });
  }

  window.P083PickListLoad = { mount: mount };
})();
