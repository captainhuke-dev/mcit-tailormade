
/* P079 - PickList Marketplace (UI only - clone demo/P079_demo.html)
 * IIFE - window.P079Marketplace = { mount }
 * UI clone demo: launcher row (from/to/status/group/search) + generate btn in panel header
 *   + panel paper (meta only, no table)
 * Data = mock from demo (no API yet)
 */
(function () {
  "use strict";


  var CAL = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path></svg>';
  var SEARCH_ICON = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path></svg>';
  var CHEV = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>';
  var DOC_ICON = '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"></path></svg>';



  var PRINT_ICON = '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';
  var INBOX_ICON = '<svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
  var TABLE_ICON = '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>';

  var GROUP_FILTER_LABELS = {
    all: "EC-Ecom-ทั้งหมด",
    jam: "EC-Ecom-(แยม)",
    beer: "EC-Ecom-(เบียร์)",
    mkt: "EC-Ecom-MKT"
  };

  var MOCK_ORDERS = [
      { document: "MKTN6910-0101", date: "2026-10-19", group: "jam", platform: "Shopee", customer: "Shopee - คุณสมชาย ใจดี", productCode: "10360017", productName: "แบตเตอรี่แห้ง(LightingAll) 12V-8Ah [10Ea/CT]", qty: 2, unit: "Ea" },
      { document: "MKTN6910-0102", date: "2026-10-19", group: "jam", platform: "Lazada", customer: "Lazada - คุณมาลี สุขสบาย", productCode: "10360017", productName: "แบตเตอรี่แห้ง(LightingAll) 12V-8Ah [10Ea/CT]", qty: 1, unit: "Ea" },
      { document: "MKTN6910-0108", date: "2026-10-20", group: "beer", platform: "TikTok", customer: "TikTok - คุณวิชัย รักดี", productCode: "10360018", productName: "แบตเตอรี่แห้ง(LightingAll) 12V-12Ah [6Ea/CT]", qty: 3, unit: "Ea" },
      { document: "MKTN6910-0111", date: "2026-10-20", group: "beer", platform: "Shopee", customer: "Shopee - คุณนภา แสงทอง", productCode: "10010246", productName: "กรองแสง-3เข็ม(ไก่ชน-MCT) 80% ดำ 2*90m [Ea]", qty: 5, unit: "Ea" },
      { document: "MKTN6910-0115", date: "2026-10-21", group: "mkt", platform: "Lazada", customer: "Lazada - ร้านพิมพ์ใจ", productCode: "10010246", productName: "กรองแสง-3เข็ม(ไก่ชน-MCT) 80% ดำ 2*90m [Ea]", qty: 10, unit: "Ea" },
      { document: "MKTN6910-0118", date: "2026-10-21", group: "mkt", platform: "Shopee", customer: "Shopee - คุณประเสริฐ มั่งมี", productCode: "10010378", productName: "กรองแสง-1เข็มล็อคตา(No1-MCT) 80% ดำ 2*100m", qty: 4, unit: "Ea" },
      { document: "MKTN6910-0121", date: "2026-10-22", group: "jam", platform: "TikTok", customer: "TikTok - คุณอรทัย ดีเลิศ", productCode: "10010378", productName: "กรองแสง-1เข็มล็อคตา(No1-MCT) 80% ดำ 2*100m", qty: 6, unit: "Ea" },
      { document: "MKTN6910-0124", date: "2026-10-22", group: "beer", platform: "Lazada", customer: "Lazada - คุณธีรพงษ์ ศรีสุข", productCode: "11650095", productName: "รองเท้าบู๊ทตายาว 11(A2900) [12Pair/Carton]", qty: 2, unit: "Carton" },
      { document: "MKTN6910-0126", date: "2026-10-22", group: "mkt", platform: "Shopee", customer: "Shopee - คุณกานดา เพชรงาม", productCode: "11650095", productName: "รองเท้าบู๊ทตายาว 11(A2900) [12Pair/Carton]", qty: 1, unit: "Carton" },
      { document: "MKTN6910-0130", date: "2026-10-23", group: "jam", platform: "Shopee", customer: "Shopee - คุณสุรชัย พัฒนา", productCode: "10360017", productName: "แบตเตอรี่แห้ง(LightingAll) 12V-8Ah [10Ea/CT]", qty: 2, unit: "Ea" }
  ];

  var root = null;
  var el = {};
  var state = { filters: null, rows: [], loading: false };

  var CSS = [
    ".p079-app{display:flex;flex-direction:column;gap:12px}",
    ".p079-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p079-launcher-body{display:grid;grid-template-columns:repeat(6,1fr);gap:10px 12px;align-items:end;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p079-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p079-search-button{width:100%;height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;font-size:13px;font-weight:700;white-space:nowrap}",
    ".p079-search-button:hover{color:#fff;background:#2563eb}",
    ".p079-search-button svg{width:16px;height:16px}",
    ".p079-input-wrap{position:relative}",
    ".p079-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p079-input-wrap input,.p079-input-wrap select{width:100%;height:44px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p079-input-wrap select{cursor:pointer;appearance:none}",
    ".p079-input-wrap select:disabled{color:#475569;background:#eef2f7;cursor:not-allowed}",
    ".p079-input-wrap input:focus,.p079-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p079-generate-button{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:9px;padding:0 24px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,0.26);font-size:14px;font-weight:700;white-space:nowrap;transition:0.16s ease}",
    ".p079-generate-button:hover{transform:translateY(-2px);filter:brightness(1.06)}",
    ".p079-generate-button svg{width:19px;height:19px}",
    ".p079-panel{display:flex;min-height:440px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p079-panel-header{display:flex;min-height:56px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;border-bottom:1px solid #dbe3ef}",
    ".p079-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p079-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p079-panel-title h2{margin:0;overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
    ".p079-panel-title p{overflow:hidden;margin:1px 0 0;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p079-panel-actions{display:flex;align-items:center;gap:8px}",
    ".p079-print-button{display:inline-flex;height:36px;align-items:center;gap:6px;padding:0 14px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9px;background:#eff6ff;font-size:12px;font-weight:700}",
    ".p079-print-button:hover{color:#fff;background:#2563eb}",
    ".p079-print-button svg{width:15px;height:15px}",
    ".p079-badge{padding:5px 10px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p079-document-area{min-height:0;flex:1;overflow:auto;padding:18px;background:#eef2f7}",
    ".p079-paper{width:100%;max-width:1100px;margin:0 auto;padding:26px 30px 34px;background:#fff;box-shadow:0 10px 28px rgba(15,23,42,0.12)}",
    ".p079-paper-meta{display:flex;flex-wrap:wrap;gap:6px 20px;margin:0 0 14px;color:#475569;font-size:12px}",
    ".p079-paper-meta strong{color:#0f172a}",
    ".p079-empty-state{display:flex;min-height:320px;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p079-empty-state svg{width:48px;height:48px;margin:0 auto 10px}",
    "@media (max-width:1000px){.p079-launcher-body{grid-template-columns:1fr 1fr}}",
    "@media (max-width:680px){.p079-launcher-body{grid-template-columns:1fr}.p079-panel-header{align-items:flex-start;flex-direction:column}.p079-paper{padding:16px}}"
  ].join("\n");


  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmtDate(v) {
    var p = v.split("-");
    return p[2] + "/" + p[1] + "/" + (Number(p[0]) + 543);
  }

  function fmtStamp(d) {
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + (d.getFullYear() + 543) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  function isoToday() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function isoDaysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function filterOrders(f) {
    return MOCK_ORDERS.filter(function (o) {
      var md = (!f.docDateFrom || o.date >= f.docDateFrom) && (!f.docDateTo || o.date <= f.docDateTo);
      var mg = f.group === "all" || o.group === f.group;
      return md && mg;
    });
  }


  function html() {
    return "" +
    "<div class=\"p079-app\">" +
      "<section class=\"p079-launcher-card\">" +
        "<form class=\"p079-launcher-body\" id=\"p079Form\">" +
          "<div class=\"p079-field\">" +
            "<label for=\"p079DocFrom\">" + "วันที่เริ่ม" + "</label>" +
            "<div class=\"p079-input-wrap\"><input id=\"p079DocFrom\" type=\"date\" value=\"" + isoDaysAgo(3) + "\">" + CAL + "</div>" +
          "</div>" +
          "<div class=\"p079-field\">" +
            "<label for=\"p079DocTo\">" + "ถึงวันที่" + "</label>" +
            "<div class=\"p079-input-wrap\"><input id=\"p079DocTo\" type=\"date\" value=\"" + isoToday() + "\">" + CAL + "</div>" +
          "</div>" +
          "<div class=\"p079-field\">" +
            "<label for=\"p079Status\">" + "สถานะใบแจ้งหนี้" + "</label>" +
            "<div class=\"p079-input-wrap\"><select id=\"p079Status\" disabled><option value=\"27\" selected>" + "27-Marketplace" + "</option></select>" + CHEV + "</div>" +
          "</div>" +
          "<div class=\"p079-field\">" +
            "<label for=\"p079Group\">" + "กลุ่มลูกค้า" + "</label>" +
            "<div class=\"p079-input-wrap\"><select id=\"p079Group\">" +
              "<option value=\"all\" selected>" + "EC-Ecom-ทั้งหมด" + "</option>" +
              "<option value=\"jam\">" + "EC-Ecom-(แยม)" + "</option>" +
              "<option value=\"beer\">" + "EC-Ecom-(เบียร์)" + "</option>" +
              "<option value=\"mkt\">" + "EC-Ecom-MKT" + "</option>" +
            "</select>" + CHEV + "</div>" +
          "</div>" +
          "<div class=\"p079-field\">" +
            "<div class=\"p079-input-wrap\"><button class=\"p079-search-button\" id=\"p079Search\" type=\"submit\">" + SEARCH_ICON + "ค้นหา" + "</button></div>" +
          "</div>" +
        "</form>" +
      "</section>" +
      "<section class=\"p079-panel\">" +
        "<div class=\"p079-panel-header\">" +
          "<div class=\"p079-panel-heading\">" +
            "<div class=\"p079-panel-icon\">" + TABLE_ICON + "</div>" +
            "<div class=\"p079-panel-title\">" +
              "<h2>" + "เอกสาร PickList Marketplace" + "</h2>" +
              "<p id=\"p079Subtitle\">" + "ยังไม่ได้สร้างเอกสาร" + "</p>" +
            "</div>" +
          "</div>" +
          "<div class=\"p079-panel-actions\">" +
            "<button class=\"p079-generate-button\" id=\"p079Gen\" type=\"button\">" + DOC_ICON + "สร้างเอกสาร" + "</button>" +
            "<button class=\"p079-print-button\" id=\"p079Print\" type=\"button\">" + PRINT_ICON + "พิมพ์เอกสาร" + "</button>" +
            "<span class=\"p079-badge\" id=\"p079Badge\">0 " + "รายการ" + "</span>" +
          "</div>" +
        "</div>" +
        "<div class=\"p079-document-area\">" +
          "<div class=\"p079-empty-state\" id=\"p079Empty\">" +
            "<div>" + INBOX_ICON +
              "<strong id=\"p079EmptyStrong\">" + "ยังไม่มีเอกสารที่สร้าง" + "</strong>" +
              "<p style=\"margin-top:5px;font-size:11px\">" + "กำหนดเงื่อนไขด้านบน แล้วกด \"สร้างเอกสาร\"" + "</p>" +
            "</div>" +
          "</div>" +
          "<article class=\"p079-paper\" id=\"p079Paper\" style=\"display:none\">" +
            "<div class=\"p079-paper-meta\">" +
              "<div>" + "สถานะ" + " : <strong>" + "27-Marketplace" + "</strong></div>" +
              "<div>" + "กลุ่มลูกค้า" + " : <strong id=\"p079MetaGrp\">-</strong></div>" +
              "<div>" + "วันที่เอกสาร" + " : <strong id=\"p079MetaDoc\">-</strong></div>" +
              "<div>" + "วันที่หัวเอกสาร" + " : <strong id=\"p079MetaHead\">-</strong></div>" +
              "<div>" + "พิมพ์เมื่อ" + " : <strong id=\"p079MetaPrint\">-</strong></div>" +
            "</div>" +
          "</article>" +
        "</div>" +
      "</section>" +
    "</div>";
  }

  function renderDocument(filters) {
    var list = filterOrders(filters);

    el.badge.textContent = list.length + " " + "รายการ";
    el.subtitle.textContent = GROUP_FILTER_LABELS[filters.group] + " \u00b7 " + "วันที่เอกสาร" + " " + fmtDate(filters.docDateFrom) + " " + "ถึง" + " " + fmtDate(filters.docDateTo);


    if (!list.length) {
      el.empty.style.display = "flex";
      el.emptyStrong.textContent = "ไม่พบรายการตามเงื่อนไขที่เลือก";
      el.paper.style.display = "none";
      state.rows = [];
      return;
    }

    el.empty.style.display = "none";
    el.paper.style.display = "block";

    el.metaGrp.textContent = GROUP_FILTER_LABELS[filters.group];
    el.metaDoc.textContent = fmtDate(filters.docDateFrom) + " - " + fmtDate(filters.docDateTo);
    el.metaHead.textContent = fmtDate(isoToday());
    el.metaPrint.textContent = fmtStamp(new Date());

    state.rows = list;
  }

  function doGenerate() {
    if (state.loading) return;
    state.loading = true;
    var f = {
      docDateFrom: el.docFrom.value,
      docDateTo: el.docTo.value,
      group: el.group.value
    };
    if (!f.docDateFrom || !f.docDateTo || f.docDateFrom > f.docDateTo) {
      state.loading = false;
      return;
    }
    state.filters = f;
    renderDocument(f);
    state.loading = false;
  }

  function doPrint() {
    if (el.paper.style.display === "none") {
      alert("กรุณาสร้างเอกสารก่อนพิมพ์");
      return;
    }
    window.print();
  }

  function mount(mountEl) {
    root = mountEl;
    root.innerHTML = "<style>" + CSS + "</style>" + html();
    el = {
      form: document.getElementById("p079Form"),
      docFrom: document.getElementById("p079DocFrom"),
      docTo: document.getElementById("p079DocTo"),
      status: document.getElementById("p079Status"),
      group: document.getElementById("p079Group"),
      gen: document.getElementById("p079Gen"),
      print: document.getElementById("p079Print"),
      badge: document.getElementById("p079Badge"),
      subtitle: document.getElementById("p079Subtitle"),
      empty: document.getElementById("p079Empty"),
      emptyStrong: document.getElementById("p079EmptyStrong"),
      paper: document.getElementById("p079Paper"),
      metaGrp: document.getElementById("p079MetaGrp"),
      metaDoc: document.getElementById("p079MetaDoc"),
      metaHead: document.getElementById("p079MetaHead"),
      metaPrint: document.getElementById("p079MetaPrint")
    };
    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      doGenerate();
    });
    el.print.addEventListener("click", doPrint);
    el.gen.addEventListener("click", doGenerate);

    doGenerate();
  }

  window.P079Marketplace = { mount: mount };
})();
