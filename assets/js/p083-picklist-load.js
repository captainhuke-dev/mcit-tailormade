
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
  var state = { sections: [], products: 0, filters: null, paperHtml: "", zoom: 100, escBound: false, searching: false, searchRows: { route: [], sp: [], qc: [] }, view: null };
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
      ".p083-spin{width:16px;height:16px;border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;border-radius:50%;display:none;animation:p083spin 0.7s linear infinite}",
      ".p083-search.searching .p083-spin{display:inline-block}",
      ".p083-search.searching{opacity:0.85;transform:none;cursor:wait}",
      "@keyframes p083spin{to{transform:rotate(360deg)}}",
      ".p083-gen-spin{width:16px;height:16px;border:2px solid rgba(255,255,255,0.35);border-top-color:#fff;border-radius:50%;display:none;animation:p083spin 0.7s linear infinite}",
      ".p083-generate.generating .p083-gen-spin{display:inline-block}",
      ".p083-generate.generating{opacity:0.85;transform:none;cursor:wait}",
      ".p083-panel{display:flex;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
      ".p083-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
      ".p083-panel-title h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
      ".p083-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
      ".p083-stable{width:100%;min-width:720px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
      ".p083-stable th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
      ".p083-res-tables{display:flex;flex-direction:column;gap:16px;padding:14px 15px;background:#f8fafc}",
      ".p083-rt{background:#fff;border:1px solid #dbe3ef;border-radius:12px;overflow:hidden}",
      ".p083-rt-title{display:flex;align-items:center;gap:10px;padding:10px 14px;color:#1d4ed8;border-bottom:1px solid #dbe3ef;background:#eff6ff;font-size:13px;font-weight:700}",
      ".p083-rt-count{color:#475569;background:#fff;border:1px solid #dbe3ef;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:600}",
      ".p083-rt-wrap{max-height:280px;overflow:auto}",
      ".p083-rtable th{font-size:11.5px;padding:9px 12px}",
      ".p083-rtable td{padding:8px 12px;font-size:12.5px;border-bottom:1px solid #f1f5f9}",
      ".p083-rtable td.center{text-align:center}",
      ".p083-rtable td.number{text-align:right;font-family:Arial,sans-serif}",
      ".p083-stable td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
      ".p083-stable th.center,.p083-stable td.center{text-align:center}",
      ".p083-stable td.number{text-align:right;font-family:Arial,sans-serif}",
      ".p083-product-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}",
      ".p083-empty-state{display:flex;min-height:280px;align-items:center;justify-content:center;color:#64748b;text-align:center}",
      ".p083-empty-state svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;margin-bottom:10px}",
      ".p083-empty-state strong{display:block;font-size:14px;color:#334155}",
      ".p083-empty-state p{margin-top:4px;font-size:12px}",

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

  function sectionTable(products, secKey) {
    var isRoute = secKey === "route";
    var w = ["70", "220", "70", "65", "60", "30", "45"];
    var cg = "<colgroup>";
    for (var x = 0; x < w.length; x++) cg += '<col style="width:' + w[x] + 'pt">';
    cg += "</colgroup>";
    var h = "<table class=\"p083-table\">" + cg + "<thead><tr>"
      + '<th>' + "รหัส + ชื่อสินค้า" + "</th>"
      + '<th>' + "ชื่อลูกค้า" + "</th>"
      + '<th>' + "เลขที่ใบสำคัญ" + "</th>"
      + '<th>' + "วันที่" + "</th>"
      + '<th>' + "จำนวน" + "</th>"
      + '<th colspan="2">' + "หน่วย/คลัง" + "</th>"
      + "</tr></thead><tbody>";
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      h +=
        '<tr class="p083-grow">'
        + '<td colspan="4"><b>' + esc(p.productCode) + ", </b>" + esc(p.productName) + "</td>"
        + '<td colspan="2" class="p083-qty"><b>' + p.totalQty + "</b></td>"
        + '<td class="p083-whcell"><b>[' + esc(p.warehouse) + "]</b></td>"
        + "</tr>";
      for (var j = 0; j < p.customers.length; j++) {
        var c = p.customers[j];
        h +=
          '<tr class="p083-crow">'
          + (isRoute ? '<td class="center">' + esc(c.route) + "</td>" : "<td></td>")
          + '<td class="p083-cust">' + esc(c.name) + "</td>"
          + '<td class="center">' + esc(c.document) + "</td>"
          + '<td class="center">' + fmtDate(c.date) + "</td>"
          + '<td class="right">' + c.qty + "</td>"
          + '<td colspan="2">' + esc(c.unit) + "</td>"
          + "</tr>";
      }
    }
    return h + "</tbody></table>";
  }

  function sectionHtml(sec, mStatus, mPrinted, mUser) {
    return (
      '<section class="p083-page">'
      + '<h1 class="p083-paper-title">' + esc(sec.title) + "</h1>"
      + '<div class="p083-paper-meta">'
      + "<b>" + "สถานะ" + ' : </b>' + esc(mStatus)
      + "    <b>" + "พิมพ์เมื่อ" + ' : </b>' + esc(mPrinted)
      + "</div>"
      + sectionTable(sec.products, sec.key)
      + '<div class="p083-pagefoot">' + TH_NAA + ' <span class="p083-pgno">1</span></div>'
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
            '<button class="p083-search" id="p083SearchBtn" type="button">' + icon("search") + '<span class="p083-spin"></span>' + "ค้นหา" + "</button>" +
          "</form>" +
        "</section>" +
        '<section class="p083-panel">' +
          '<div class="p083-panel-header">' +
            '<div class="p083-panel-title">' +
              "<h2>" + "ผลแการค้นหา PickList To Load" + "</h2>" +
              '<p id="p083Sub"></p>' +
            "</div>" +
            '<div class="p083-header-right">' +
                        '<div class="p083-header-actions">' +
            '<button class="p083-generate" id="p083GenBtn" type="submit" form="p083Form">' + icon("pen") + '<span class="p083-gen-spin"></span>' + "สร้างเอกสาร" + "</button>" +
            "</div>" +
            "</div>" +
          "</div>" +
          '<div class="p083-res-tables" id="p083ResTables">' +
            '<div class="p083-rt" id="p083RtRoute">' +
              '<div class="p083-rt-title">' + "รายการสินค้า By Route" + '<span class="p083-rt-count" id="p083RtRouteCount"></span></div>' +
              '<div class="p083-rt-wrap"><table class="p083-stable p083-rtable">' +
              "<thead><tr>" +
              "<th>" + "รหัสสินค้า" + "</th>" + '<th class="center">' + "กลุ่มสินค้า" + "</th>" +
              "<th>" + "ชื่อสินค้า" + "</th>" + "<th>" + "ชื่อสินค้า" + "</th>" +
              '<th class="center number">' + "จำนวน" + "</th>" +
              '<th class="center">' + "Route" + "</th>" +
              "</tr></thead>" +
              '<tbody id="p083RtRouteRows"></tbody></table></div>' +
            "</div>" +
            '<div class="p083-rt" id="p083RtSp">' +
              '<div class="p083-rt-title">' + "รายการสินค้า บาอะห้ล่" + '<span class="p083-rt-count" id="p083RtSpCount"></span></div>' +
              '<div class="p083-rt-wrap"><table class="p083-stable p083-rtable">' +
              "<thead><tr>" +
              "<th>" + "รหัสสินค้า" + "</th>" + '<th class="center">' + "กลุ่มสินค้า" + "</th>" +
              "<th>" + "ชื่อสินค้า" + "</th>" + "<th>" + "ชื่อสินค้า" + "</th>" +
              '<th class="center number">' + "จำนวน" + "</th>" +
              "</tr></thead>" +
              '<tbody id="p083RtSpRows"></tbody></table></div>' +
            "</div>" +
            '<div class="p083-rt" id="p083RtQc">' +
              '<div class="p083-rt-title">' + "รายการสินค้า บาตตเ่อรี" + '<span class="p083-rt-count" id="p083RtQcCount"></span></div>' +
              '<div class="p083-rt-wrap"><table class="p083-stable p083-rtable">' +
              "<thead><tr>" +
              "<th>" + "รหัสสินค้า" + "</th>" + '<th class="center">' + "กลุ่มสินค้า" + "</th>" +
              "<th>" + "ชื่อสินค้า" + "</th>" + "<th>" + "ชื่อสินค้า" + "</th>" +
              '<th class="center number">' + "จำนวน" + "</th>" +
              "</tr></thead>" +
              '<tbody id="p083RtQcRows"></tbody></table></div>' +
            "</div>" +
          "</div>" +
          '<div class="p083-empty-state" id="p083EmptyState">' +
            "<div>" + icon("check") +
            "<strong>" + "ยังไม่มีข้อมูล" + "</strong>" +
            "<p>" + "เลือกสถานะ แล้วกด \"ค้นหา\" หรือ \"สร้างเอกสาร\"" + "</p>" +
            "</div>" +
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
    // C# A4: Document(PageSize.A4, 20f, 20f, 30f, 30f) = left 20pt right 20pt top 30pt bottom 30pt
    var css = [
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
      "@page{size:A4;margin:30pt 20pt}",
      "body{margin:0;background:#f1f5f9}",
      ".p083-page{box-sizing:border-box;display:flex;flex-direction:column;width:210mm;height:297mm;overflow:hidden;margin:0 auto;padding:30pt 20pt;background:#fff;font-family:'THSarabunNew','TH Sarabun New',Arial,sans-serif;color:#000}",
      ".p083-page+.p083-page{margin-top:10px}",
      ".p083-pagefoot{margin-top:auto;text-align:left;font-size:12pt}",
      ".p083-paper-title{text-align:center;font-size:18pt;font-weight:bold;margin:0 0 6px}",
      ".p083-paper-meta{font-size:14pt;margin:0 0 5px}",
      ".p083-table{width:560pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
      ".p083-table th{padding:2px 4px 5px;background:#e6e6e6;text-align:center;font-size:14pt;font-weight:bold}",
      ".p083-table th,.p083-table td{border:1px solid #000}",
      ".p083-table td{padding:2px 4px;font-size:14pt;vertical-align:middle}",
      ".p083-grow td{padding:2px 4px 5px;background:#f8f8f8;font-size:14pt}",
      ".p083-grow .p083-qty{border:1px solid #000;border-right:none;text-align:left}",
      ".p083-grow .p083-whcell{border:1px solid #000;border-left:none;text-align:right;vertical-align:bottom}",
      ".p083-crow td{font-size:14pt}",
      ".p083-crow td.center{text-align:center}",
      ".p083-crow td.right{text-align:right;padding-right:5px}",
      "@media print{body{display:block;background:#fff;zoom:1}.p083-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;background:#fff;box-shadow:none;page-break-after:always}.p083-page:last-child{page-break-after:auto}.p083-table tr{page-break-inside:avoid}}"
    ].join("\n");
    var fit = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};" +
      "function rowOver(row){var s=row.closest('section.p083-page');if(!s)return false;var sr=s.getBoundingClientRect();var lr=row.getBoundingClientRect();var pb=parseFloat(getComputedStyle(s).paddingBottom)||0;return lr.bottom>sr.bottom-pb}" +
      "function renumber(){var s=document.querySelectorAll('section.p083-page');for(var i=0;i<s.length;i++){var f=s[i].querySelector('.p083-pgno');if(f)f.textContent=i+1}}" +
      "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p083-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){if(!s.classList.contains('p083-cont'))groups.push([s]);else groups[groups.length-1].push(s)});groups.forEach(function(g){var first=g[0];var t=first.querySelector('table');for(var i=1;i<g.length;i++){var t2=g[i].querySelector('table');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);g[i].parentNode.removeChild(g[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);if(curT.tBodies[0].rows.length>1&&rowOver(row)){curT.tBodies[0].removeChild(row);var s2=document.createElement('section');s2.className='p083-page p083-cont';var ht=first.querySelector('.p083-paper-title');var mt=first.querySelector('.p083-paper-meta');s2.innerHTML=(ht?'<h1 class=\\\"p083-paper-title\\\">'+ht.textContent+'</h1>':'')+(mt?'<div class=\\\"p083-paper-meta\\\">'+mt.innerHTML+'</div>':'')+'<table class=\\\"p083-table\\\">'+(t.querySelector('colgroup')?t.querySelector('colgroup').outerHTML:'')+'<thead>'+t.tHead.innerHTML+'</thead><tbody></tbody></table>'+'<div class=\\\"p083-pagefoot\\\">'+'หน้่า '+'<span class=\\\"p083-pgno\\\">1</span>'+'</div>';cur.parentNode.insertBefore(s2,cur.nextSibling);cur=s2;curT=s2.querySelector('table');curT.tBodies[0].appendChild(row)}})});renumber()}" +
      "function runPag(){fit();pag()}if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";
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

  /* ---------- search (api/p083_search.php -> 3 result tables) ---------- */
  var TH_CTH = "ค้นหา";
  var TH_PHOB = "พบ ";
  var TH_RIALANG = "รายการ";
  var TH_NOFOUND = "ไม่พบรายการตามเงื่อนไขที่ค้นหา";
  var TH_SANGSHOW = "แสดง";
  var TH_SANAT = "สถานะ";
  var TH_NEEDSEARCH = "ฟรอด ค้นหา ด้ว";
  var TH_NAA = "หน้่า";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { search: "api/p083_search.php", generate: "api/p083_generate.php" };

  function apiPost(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function doSearch() {
    if (state.searching) return;
    state.searching = true;
    el.searchBtn.disabled = true;
    el.searchBtn.classList.add("searching");
    apiPost(API.search, {
      connectionId: MAC5_CONNECTION_ID,
      status: $("p083Status").value,
      route: $("p083Route").value,
      warehouses: selectedWarehouses()
    })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        var sp = d.sp || [];
        var qc = d.qc || [];
        var route = d.route || [];
        state.searchRows = { route: route, sp: sp, qc: qc };
        state.view = (sp.length || qc.length || route.length) ? "search" : null;
        renderResultTables();
        renderSearch();
        if (sp.length || qc.length || route.length) showToast(TH_PHOB + " " + (sp.length + qc.length + route.length) + " " + TH_RIALANG);
        else showToast(TH_NOFOUND);
      })
      .catch(function (e) {
        showToast("ค้นหาไม่สำเร็จ: " + e.message);
      })
      .then(function () {
        state.searching = false;
        el.searchBtn.disabled = false;
        el.searchBtn.classList.remove("searching");
      });
  }

  function renderResultTables() {
    var data = state.searchRows || { route: [], sp: [], qc: [] };
    var map = { route: "p083RtRoute", sp: "p083RtSp", qc: "p083RtQc" };
    for (var key in map) {
      var rows = data[key] || [];
      var h = "";
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        h += "<tr>"
          + "<td>" + esc(r.STKcode) + "</td>"
          + '<td class="center">' + esc(r.STKgroup) + "</td>"
          + "<td>" + esc(r.STKdescT1) + "</td>"
          + "<td>" + esc(r.STKdescT2) + "</td>"
          + '<td class="center number">' + (r.qty == null ? "" : r.qty) + "</td>"
          + (key === "route" ? '<td class="center">' + esc(r.Route) + "</td>" : "")
          + "</tr>";
      }
      $(map[key] + "Rows").innerHTML = h;
      $(map[key] + "Count").textContent = rows.length + " " + TH_RIALANG;
    }
  }

  function renderSearch() {
    var isSearch = state.view === "search";
    el.emptyState.style.display = isSearch ? "none" : "flex";
    if (!isSearch) {
      el.subtitle.textContent = "";
      return;
    }
    el.subtitle.textContent = TH_SANAT + " " + statusLabel($("p083Status").value) + " — " + routeLabel($("p083Route").value);
  }


  /* ---------- generate (api/p083_generate.php -> modal A4, C# clone) ---------- */
  function doGenerate() {
    if (state.searching) return;
    var sr = state.searchRows || { route: [], sp: [], qc: [] };
    if (!sr.route.length && !sr.sp.length && !sr.qc.length) {
      showToast(TH_NEEDSEARCH);
      return;
    }
    var wh = selectedWarehouses();
    if (!wh.length) {
      showToast("ลั่ก กลุ่มคลังสินค้า");
      return;
    }
    state.searching = true;
    el.genBtn.disabled = true;
    el.genBtn.classList.add("generating");
    apiPost(API.generate, {
      connectionId: MAC5_CONNECTION_ID,
      status: $("p083Status").value,
      route: $("p083Route").value,
      groups: wh
    })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        var sections = [];
        for (var i = 0; i < d.sections.length; i++) {
          var s = d.sections[i];
          var title = "PickList [To Load][" + (s.key === "sp" ? "Zone SparePart" : s.key === "qc" ? "Zone QC" : "Route " + routeDisplay(s.route)) + "]";
          var products = [];
          for (var a = 0; a < s.items.length; a++) {
            var it = s.items[a];
            var customers = [];
            for (var b = 0; b < it.rows.length; b++) {
              var rr = it.rows[b];
              customers.push({ name: rr.name + " " + rr.contact, document: rr.vnos, date: rr.date, qty: rr.qty, unit: rr.unit, route: rr.route || "" });
            }
            products.push({ productCode: it.stk, productName: it.desc1, totalQty: it.grand + "     " + it.unit, totalBase: "", warehouse: it.sto, customers: customers });
          }
          sections.push({ title: title, products: products });
        }
        state.filters = { status: $("p083Status").value, route: $("p083Route").value, warehouses: wh };
        state.sections = sections;
        state.products = d.count;
        var mStatus = statusLabel($("p083Status").value);
        var mPrinted = fmtStamp();
        var mUser = machineName();
        var h = "";
        for (var j = 0; j < sections.length; j++) h += sectionHtml(sections[j], mStatus, mPrinted, mUser);
        state.paperHtml = h;
        openReport();
      })
      .catch(function (e) {
        showToast("สร้างเอกสารไม่สำเร็จ: " + e.message);
      })
      .then(function () {
        state.searching = false;
        el.genBtn.disabled = false;
        el.genBtn.classList.remove("generating");
      });
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
    el.genBtn = $("p083GenBtn");
    el.emptyState = $("p083EmptyState");
    el.subtitle = $("p083Sub");
    el.searchBtn.addEventListener("click", doSearch);
    renderResultTables();
    renderSearch();
    $("p083Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doGenerate();
    });
  }

  window.P083PickListLoad = { mount: mount };
})();
