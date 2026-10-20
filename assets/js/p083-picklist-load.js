
/* P083 — PickList To LOAD V2
 * IIFE — window.P083PickListLoad = { mount }
 * clone demo/P083-demo.html + C# AppPickList/frm_PickListToLOAD_v2
 *   - Launcher: สถานะ (12) + Route (7) + กลุ่มคลังสินค้า checkbox (9) + สร้างเอกสาร
 *   - Preview: paper "PickList [To Load][Zone QC]" — modal (P081 pattern) — 6 คอลั่น
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

  var SECTIONS = [
    {
      key: "sp",
      title: "PickList [To Load][Zone SparePart]",
      products: [
        { productCode: "20110045", productName: "ถังพ่นยาไฟฟ้า", unit: "Ea", warehouse: "01", totalQty: 1, totalBase: 0,
          customers: [ { name: "วรรณ (LC*) (กำแพงแสน)", document: "IVVN6904-3910", date: "2026-04-29", qty: 1, unit: "Ea" } ] },
        { productCode: "20120088", productName: "สายยางใส", unit: "Ea", warehouse: "01", totalQty: 2, totalBase: 0,
          customers: [ { name: "วรรณ (LC*) (กำแพงแสน)", document: "IVVN6904-3910", date: "2026-04-29", qty: 2, unit: "Ea" } ] }
      ]
    },
    {
      key: "qc",
      title: "PickList [To Load][Zone QC]",
      products: [
        { productCode: "10360017", productName: "แบตเตอรี่แห้ง(LightingAll) 12V-8Ah [10Ea/CT]", unit: "Ea", warehouse: "01", totalQty: 2, totalBase: 0,
          customers: [ { name: "วรรณ (LC*) (กำแพงแสน)", document: "IVVN6904-3905", date: "2026-04-29", qty: 2, unit: "Ea" } ] }
      ]
    },
    {
      key: "route",
      title: null,
      products: [
        { productCode: "30210034", productName: "สีทาอาคารภายนอก 5 แกลลอน", unit: "Can", warehouse: "01", totalQty: 2, totalBase: 0,
          customers: [ { name: "วรรณ (LC*) (กำแพงแสน)", document: "IVVN6904-3912", date: "2026-04-30", qty: 2, unit: "Can" } ] }
      ]
    }
  ];

  var root = null;
  var el = {};
  var state = { sections: [], products: 0, filters: null, paperHtml: "", zoom: 100, escBound: false, searchRows: [], view: null };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>',
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path>',
      check: '<path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
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

  function routeDisplay(v) {
    if (v === "Route1") return "M1/M2/M3";
    if (v === "Route2") return "M4/M5";
    return routeLabel(v);
  }

  function getSections(status, route) {
    var out = [];
    if (status !== "17") return out; // UI stage: sample data for status 17 (demo)
    for (var i = 0; i < SECTIONS.length; i++) {
      var sec = SECTIONS[i];
      if (sec.key === "route") {
        if (route !== "all" && route !== "M9") continue; // UI stage: sample route = M9
      }
      if (!sec.products.length) continue;
      var title = sec.title;
      if (sec.key === "route") title = "PickList [To Load][Route " + routeDisplay(route) + "]";
      out.push({ title: title, products: sec.products });
    }
    return out;
  }

  function machineName() {
    if (window.ERP_USER && window.ERP_USER.name) return window.ERP_USER.name;
    return "PORTAL";
  }

  var CSS = [
    ".p083-app{display:flex;flex-direction:column;gap:14px}",
    ".p083-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p083-launcher-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1.6fr) auto;gap:18px;align-items:center;padding:20px;background:linear-gradient(180deg,#e3f7fb,#eefbfd)}",
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
    ".p083-generate{display:inline-flex;height:44px;align-items:center;gap:8px;padding:0 18px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,0.26);font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer;transition:0.16s ease}",
    ".p083-generate:hover{transform:translateY(-2px);filter:brightness(1.06)}",
    ".p083-generate svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      ".p083-header-right{display:flex;align-items:center;gap:10px}",
      ".p083-header-actions{display:flex;align-items:center;gap:8px}",
      ".p083-search{display:inline-flex;height:44px;align-items:center;gap:8px;padding:0 18px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 9px 20px rgba(5,150,105,0.26);font-size:13px;font-weight:700;white-space:nowrap;cursor:pointer;transition:0.16s ease}",
      ".p083-search:hover{transform:translateY(-2px);filter:brightness(1.06)}",
      ".p083-search svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
      ".p083-panel{display:flex;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
      ".p083-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
      ".p083-panel-title h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
      ".p083-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
      ".p083-mode-badge{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;color:#047857;background:#d1fae5}",
      ".p083-table-container{min-height:0;max-height:420px;overflow:auto}",
      ".p083-stable{width:100%;min-width:720px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
      ".p083-stable th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
      ".p083-stable td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
      ".p083-stable th.center,.p083-stable td.center{text-align:center}",
      ".p083-stable td.number{text-align:right;font-family:Arial,sans-serif}",
      ".p083-product-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}",
      ".p083-empty-state{display:flex;min-height:280px;align-items:center;justify-content:center;color:#64748b;text-align:center}",
      ".p083-empty-state svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;margin-bottom:10px}",
      ".p083-empty-state strong{display:block;font-size:14px;color:#334155}",
      ".p083-empty-state p{margin-top:4px;font-size:12px}",
      ".p083-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",

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
    ".p083-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:10001;padding:10px 18px;color:#fff;border-radius:10px;background:#0f172a;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p083-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    ".p083-rep-overlay{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,0.55)}",
    ".p083-rep-overlay.show{display:flex}",
    ".p083-rep-modal{display:flex;flex-direction:column;overflow:hidden;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.35)}",
    ".p083-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}",
    ".p083-rep-title{font-size:15px;font-weight:700;color:#0f172a}",
    ".p083-rep-sub{margin-top:2px;color:#64748b;font-size:12px}",
    ".p083-rep-btns{display:flex;gap:8px}",
    ".p083-rep-btn{padding:6px 12px;color:#334155;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer}",
    ".p083-rep-btn:hover{background:#e2e8f0}",
    ".p083-rep-zoomlabel{display:inline-flex;min-width:48px;align-items:center;justify-content:center;color:#334155;font-size:12px;font-weight:600}",
    ".p083-rep-btn-primary{color:#fff;border-color:#0a5bc4;background:#0a5bc4}",
    ".p083-rep-btn-primary:hover{background:#084a9e}",
    ".p083-rep-body{flex:1;min-height:0;overflow:auto;padding:12px;background:#f1f5f9}",
    ".p083-rep-body iframe{width:100%;height:100%;min-height:520px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}",
    ".p083-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-top:1px solid #e2e8f0}",
    ".p083-rep-hint{color:#64748b;font-size:12px}",
    "@media (max-width:1050px){.p083-launcher-body{grid-template-columns:1fr}.p083-search{grid-column:1/-1;width:100%;justify-content:center}.p083-group-grid{grid-template-columns:repeat(2,1fr)}}",
    "@media (max-width:680px){.p083-launcher-body{grid-template-columns:1fr}.p083-group-grid{grid-template-columns:repeat(2,1fr)}}"
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

  function sectionTable(products) {
    var h = "<table class=\"p083-table\"><thead><tr>"
      + '<th style="width:12.7%">' + "รหัส + ชื่อสินค้า" + "</th>"
      + '<th style="width:40%">' + "ชื่อลูกค้า" + "</th>"
      + '<th style="width:12.7%">' + "เลขที่ใบสำคัญ" + "</th>"
      + '<th class="center" style="width:11.8%">' + "วันที่" + "</th>"
      + '<th class="center" style="width:10.9%">' + "จำนวน" + "</th>"
      + '<th class="center" colspan="2" style="width:11.9%">' + "หน่วย/คลัง" + "</th>"
      + "</tr></thead><tbody>";
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      h +=
        '<tr class="p083-grow">'
        + '<td colspan="4" class="p083-prod">' + esc(p.productCode) + ", " + esc(p.productName) + "</td>"
        + '<td colspan="2" class="center p083-qty">' + p.totalQty + "/" + p.totalBase + "</td>"
        + '<td class="right"><span class="p083-wh">[' + esc(p.warehouse) + "]</span></td>"
        + "</tr>";
      for (var j = 0; j < p.customers.length; j++) {
        var c = p.customers[j];
        h +=
          '<tr class="p083-crow">'
          + "<td></td>"
          + '<td class="p083-cust">' + esc(c.name) + "</td>"
          + '<td class="p083-doc">' + esc(c.document) + "</td>"
          + '<td class="center">' + fmtDate(c.date) + "</td>"
          + '<td class="number">' + c.qty + "</td>"
          + '<td colspan="2" class="center">' + esc(c.unit) + "</td>"
          + "</tr>";
      }
    }
    return h + "</tbody></table>";
  }

  function sectionHtml(sec, mStatus, mPrinted, mUser) {
    return (
      '<section class="p083-sec">'
      + '<h1 class="p083-paper-title">' + esc(sec.title) + "</h1>"
      + '<div class="p083-paper-meta">'
      + "<div>" + "สถานะ" + ': <span>' + esc(mStatus) + "</span></div>"
      + "<div>" + "พิมพ์เมื่อ" + ': <span>' + esc(mPrinted) + "</span></div>"
      + "<div>" + "โดย" + ': <span>' + esc(mUser) + "</span></div>"
      + "</div>"
      + sectionTable(sec.products)
      + "</section>"
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
            '<button class="p083-search" id="p083SearchBtn" type="button">' + icon("search") + "ค้นหา" + "</button>" +
          "</form>" +
        "</section>" +
        '<section class="p083-panel">' +
          '<div class="p083-panel-header">' +
            '<div class="p083-panel-title">' +
              "<h2>" + "ผลการสร้างเอกสาร ค้นหา PickList To Load" + "</h2>" +
              '<p id="p083Sub"></p>' +
            "</div>" +
            '<div class="p083-header-right">' +
            '<span class="p083-mode-badge" id="p083ModeBadge" style="display:none">' + "ผลค้นหา" + "</span>" +
            '<div class="p083-header-actions">' +
            '<button class="p083-generate" id="p083GenBtn" type="submit" form="p083Form">' + icon("pen") + "สร้างเอกสาร" + "</button>" +
            "</div>" +
            "</div>" +
          "</div>" +
          '<div class="p083-table-container" id="p083SearchContainer" style="display:none">' +
            '<table class="p083-stable">' +
              "<thead><tr>" +
              "<th>" + "รหัสสินค้า" + "</th>" + '<th class="center">' + "กลุ่ม" + "</th>" +
              "<th>" + "ชื่อสินค้า (1)" + "</th>" + "<th>" + "ชื่อสินค้า (2)" + "</th>" +
              '<th class="center number">' + "คงเหลือ" + "</th>" +
              "</tr></thead>" +
              '<tbody id="p083SearchRows"></tbody>' +
            "</table>" +
          "</div>" +
          '<div class="p083-empty-state" id="p083EmptyState">' +
            "<div>" + icon("check") +
            "<strong>" + "ยังไม่มีข้อมูล" + "</strong>" +
            "<p>" + "เลือกสถานะ แล้วกด \"ค้นหา\" หรือ \"สร้างเอกสาร\"" + "</p>" +
            "</div>" +
          "</div>" +
          '<div class="p083-table-footer" id="p083Footer" style="display:none">' +
            '<span id="p083FooterText">' + "แสดง 0 รายการ" + "</span>" +
          "</div>" +
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
    var sections = getSections(filters.status, filters.route);
    state.filters = filters;
    state.sections = sections;
    var total = 0;
    for (var i = 0; i < sections.length; i++) total += sections[i].products.length;
    state.products = total;
    if (!sections.length) {
      state.paperHtml = "";
      return null;
    }
    var mStatus = statusLabel(filters.status);
    var mPrinted = fmtStamp();
    var mUser = machineName();
    var h = "";
    for (var j = 0; j < sections.length; j++) h += sectionHtml(sections[j], mStatus, mPrinted, mUser);
    state.paperHtml = h;
    return state.paperHtml;
  }

  function routeLabel(v) {
    for (var i = 0; i < ROUTE_OPTIONS.length; i++) {
      if (ROUTE_OPTIONS[i][0] === v) return ROUTE_OPTIONS[i][1];
    }
    return String(v);
  }

  /* ---------- modal report (P081 pattern: overlay + iframe srcdoc + zoom) ---------- */
  function reportDocHtml(paperInner) {
    var css = [
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
      "@page{size:A4;margin:20mm 15mm}",
      "body{margin:0;background:#f1f5f9}",
      ".p083-paper{width:210mm;margin:0 auto;padding:20mm 15mm;box-sizing:border-box;background:#fff;font-family:'THSarabunNew','TH Sarabun New',Arial,sans-serif;color:#000}",
      ".p083-sec{margin-bottom:26px}",
      ".p083-sec:last-child{margin-bottom:0}",
      ".p083-paper-title{font-size:20px;text-align:center;color:#0f172a;font-weight:800}",
      ".p083-paper-meta{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:10px;color:#1d4ed8;font-size:12px;font-weight:700}",
      ".p083-paper-meta span{color:#475569;font-weight:600}",
      ".p083-table{width:100%;margin-top:10px;border-collapse:collapse;table-layout:fixed}",
      ".p083-grow td.right{text-align:right}",
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
      "@media print{body{display:block;background:#fff;zoom:1}.p083-paper{width:100%;margin:0;padding:0;background:#fff;box-shadow:none}}"
    ].join("\n");
    var fit = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',fit);window.setZoom=function(z){document.body.style.zoom=z};</scr" + "ipt>";
    return '<!doctype html><html><head><meta charset="utf-8"><title>PickList To Load</title><style>' + css + "</style></head><body>" + paperInner + fit + "</body></html>";
  }

  function openReport() {
    var overlay = document.getElementById("p083ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p083ReportOverlay";
      overlay.className = "p083-rep-overlay";
      overlay.innerHTML =
        '<div class="p083-rep-modal">' +
          '<div class="p083-rep-head">' +
            '<div>' +
              '<div class="p083-rep-title">"PickList [To Load][Zone QC]"</div>' +
              '<div class="p083-rep-sub" id="p083RepSub"></div>' +
            "</div>" +
            '<div class="p083-rep-btns">' +
              '<button class="p083-rep-btn" type="button" id="p083RepZoomOut" title="zoom out">\u2212</button>' +
              '<span class="p083-rep-zoomlabel" id="p083RepZoom">100%</span>' +
              '<button class="p083-rep-btn" type="button" id="p083RepZoomIn" title="zoom in">+</button>' +
              '<button class="p083-rep-btn" type="button" id="p083RepClose" title="close (Esc)">\u2715</button>' +
            "</div>" +
          "</div>" +
          '<div class="p083-rep-body"><iframe id="p083RepFrame" title="PickList To Load"></iframe></div>' +
          '<div class="p083-rep-foot">' +
            '<div class="p083-rep-hint">' + "รายงาน A4 — พิมพ์ซำ้หั้าฌสด้อบยยว" + "</div>" +
            '<button class="p083-rep-btn p083-rep-btn-primary" type="button" id="p083RepPrint">' + "พิมพ์" + "</button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) closeReport(); });
      overlay.querySelector("#p083RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p083RepZoomOut").addEventListener("click", function () { setZoomLevel(state.zoom - 25); });
      overlay.querySelector("#p083RepZoomIn").addEventListener("click", function () { setZoomLevel(state.zoom + 25); });
      overlay.querySelector("#p083RepPrint").addEventListener("click", function () {
        var f = $("p083RepFrame");
        if (f && f.contentWindow) {
          try { f.contentWindow.focus(); f.contentWindow.print(); return; } catch (err) { /* ignore */ }
        }
      });
      if (!state.escBound) {
        state.escBound = true;
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeReport(); });
      }
    }
    $("p083RepSub").textContent =
      statusLabel(state.filters.status) + " \u2014 " + routeLabel(state.filters.route) + " \u2014 " + state.products + " " + "จำนวน";
    var zb = overlay.querySelector("#p083RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    var f = overlay.querySelector("#p083RepFrame");
    f.srcdoc = reportDocHtml(state.paperHtml);
    overlay.classList.add("show");
    overlay.style.display = "flex";
    applyZoom();
  }

  function setZoomLevel(z) {
    state.zoom = Math.max(50, Math.min(200, z));
    var zb = $("p083RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    applyZoom();
  }

  function applyZoom() {
    var f = $("p083RepFrame");
    if (!f) return;
    var tryIt = function () {
      try {
        if (f.contentWindow && f.contentWindow.setZoom) {
          f.contentWindow.setZoom(state.zoom / 100);
          return true;
        }
      } catch (e) { /* iframe not ready */ }
      return false;
    };
    if (tryIt()) return;
    var n2 = 0;
    var t = setInterval(function () {
      n2++;
      if (tryIt() || n2 > 50) clearInterval(t);
    }, 100);
  }

  function closeReport() {
    var overlay = $("p083ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.style.display = "none";
    var f = overlay.querySelector("#p083RepFrame");
    if (f) f.srcdoc = "";
  }

  /* ---------- search (UI stage: sample data, status 17 only) ---------- */
  var TH_CTH = "ค้นหา";
  var TH_PHOB = "พบ ";
  var TH_RIALANG = "รายการ";
  var TH_NOFOUND = "ไม่พบรายการตามเงื่อนไขที่ค้นหา";
  var TH_SANGSHOW = "แสดง";
  var TH_SANAT = "สถานะ";

  function searchSampleRows(status, warehouses) {
    var out = [];
    if (status !== "17") return out;
    var whMap = {};
    for (var w = 0; w < warehouses.length; w++) whMap[warehouses[w].replace(/^G/, "")] = 1;
    for (var i = 0; i < SECTIONS.length; i++) {
      var prods = SECTIONS[i].products;
      for (var j = 0; j < prods.length; j++) {
        var p = prods[j];
        if (!whMap[p.warehouse]) continue;
        out.push({ STKcode: p.productCode, STKgroup: "G" + p.warehouse, STKdescT1: p.productName, STKdescT2: p.unit, SBLqty: p.totalQty });
      }
    }
    return out;
  }

  function doSearch() {
    var wh = selectedWarehouses();
    if (!wh.length) {
      showToast("ลื่ก กลุ่มคลังสินค้า");
      return;
    }
    var rows = searchSampleRows($("p083Status").value, wh);
    state.searchRows = rows;
    state.view = rows.length ? "search" : null;
    renderSearch();
    if (rows.length) showToast(TH_PHOB + " " + rows.length + " " + TH_RIALANG);
    else showToast(TH_NOFOUND);
  }

  function renderSearch() {
    var isSearch = state.view === "search";
    el.searchContainer.style.display = isSearch ? "block" : "none";
    el.footer.style.display = isSearch ? "flex" : "none";
    el.modeBadge.style.display = isSearch ? "inline-flex" : "none";
    el.emptyState.style.display = isSearch ? "none" : "flex";
    if (!isSearch) {
      el.subtitle.textContent = "";
      return;
    }
    var rows = state.searchRows;
    var h = "";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      h += "<tr>"
        + '<td class="p083-product-code">' + esc(r.STKcode) + "</td>"
        + '<td class="center">' + esc(r.STKgroup) + "</td>"
        + "<td>" + esc(r.STKdescT1) + "</td>"
        + "<td>" + esc(r.STKdescT2) + "</td>"
        + '<td class="number">' + (r.SBLqty == null ? "" : r.SBLqty) + "</td>"
        + "</tr>";
    }
    el.searchRows.innerHTML = h;
    el.subtitle.textContent = TH_SANAT + " " + statusLabel($("p083Status").value) + " \u00b7 " + routeLabel($("p083Route").value);
    el.footerText.textContent = TH_SANGSHOW + " " + rows.length + " " + TH_RIALANG;
  }

  function mount(mountEl) {
    root = mountEl;
    var olds = document.querySelectorAll("body > .p083-rep-overlay");
    for (var oi = 0; oi < olds.length; oi++) olds[oi].parentNode.removeChild(olds[oi]);
    root.innerHTML = html();
    if (!document.getElementById("p083Style")) {
      var st = document.createElement("style");
      st.id = "p083Style";
      st.textContent = CSS.join("\n");
      document.head.appendChild(st);
    }
    el.toast = $("p083Toast");
    el.searchBtn = $("p083SearchBtn");
    el.searchContainer = $("p083SearchContainer");
    el.searchRows = $("p083SearchRows");
    el.emptyState = $("p083EmptyState");
    el.footer = $("p083Footer");
    el.footerText = $("p083FooterText");
    el.modeBadge = $("p083ModeBadge");
    el.subtitle = $("p083Sub");
    el.searchBtn.addEventListener("click", doSearch);
    $("p083Form").addEventListener("submit", function (e) {
      e.preventDefault();
      var wh = selectedWarehouses();
      if (!wh.length) {
        showToast("ลื่ก กลุ่มคลังสินค้า");
        return;
      }
      var paper = renderDocument({
        status: $("p083Status").value,
        route: $("p083Route").value,
        warehouses: wh
      });
      if (!paper) {
        showToast("ไม่มีเอกสาร");
        return;
      }
      openReport();
    });
  }

  window.P083PickListLoad = { mount: mount };
})();
