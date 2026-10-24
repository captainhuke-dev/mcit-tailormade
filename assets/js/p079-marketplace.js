
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
  var CLOSE_ICON = '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"></path></svg>';
  var PRINT_ICON = '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';
  var CHEV = '<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>';
  var DOC_ICON = '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"></path></svg>';



  var TABLE_ICON = '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>';

  var GROUP_FILTER_LABELS = {
    EC: "EC-Ecom-ทั้งหมด",
    EC01: "EC-Ecom-(แยม)",
    EC02: "EC-Ecom-(เบียร์)",
    EC03: "EC-Ecom-MKT"
  };


  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { search: "api/p079_search.php", report: "api/p079_report.php" };

  function apiPost(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  var toastTimer = null;
  function showToast(msg, ms) {
    var t = document.getElementById("p079Toast");
    var m = document.getElementById("p079ToastMsg");
    if (!t || !m) return;
    m.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }

  var root = null;
  var el = {};
  var state = { rows: [], searching: false, zoom: 100, escBound: false };

  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var CSS = [
    ".p079-app{display:flex;flex-direction:column;gap:12px}",
    ".p079-app svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p079-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p079-launcher-body{display:grid;grid-template-columns:repeat(3,1fr);gap:10px 12px;align-items:end;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p079-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p079-search-button{width:100%;height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;color:#fff;border:0;border-radius:10px;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 9px 20px rgba(5,150,105,0.26);font-size:13px;font-weight:700;white-space:nowrap;transition:0.16s ease}",
    ".p079-search-button:hover{transform:translateY(-2px);filter:brightness(1.06)}",
    ".p079-search-button svg{width:16px;height:16px}",
    ".p079-input-wrap{position:relative}",
    ".p079-input-wrap > svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
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
    ".p079-badge{padding:5px 10px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p079-document-area{min-height:0;flex:1;overflow:auto;padding:18px;background:#eef2f7}",
    ".p079-res-tables{display:flex;flex-direction:column;gap:12px}",
    ".p079-rt{background:#fff;border:1px solid #dbe3ef;border-radius:12px;overflow:hidden}",
    ".p079-rt-title{display:flex;align-items:center;gap:10px;padding:10px 14px;color:#1d4ed8;border-bottom:1px solid #dbe3ef;background:#eff6ff;font-size:13px;font-weight:700}",
    ".p079-rt-count{color:#475569;background:#fff;border:1px solid #dbe3ef;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:600}",
    ".p079-rt-wrap{max-height:520px;overflow:auto}",
    ".p079-ztable{width:100%;min-width:560px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p079-ztable th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p079-ztable td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
    ".p079-ztable th.center,.p079-ztable td.center{text-align:center}",
    ".p079-ztable td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p079-ztable tbody tr:nth-child(even){background:#fbfdff}",
    ".p079-ztable tbody tr:hover{background:#f0f7ff}",
    "@media (max-width:1000px){.p079-launcher-body{grid-template-columns:1fr 1fr}}",
    "@media (max-width:680px){.p079-launcher-body{grid-template-columns:1fr}.p079-panel-header{align-items:flex-start;flex-direction:column}}",
    ".p079-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p079-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    ".p079-search-button:disabled{opacity:0.7;transform:none}",
    ".p079-generate-button:disabled{opacity:0.5;cursor:not-allowed}",
    ".p079-search-button.loading svg{animation:p079spin 1s linear infinite}",
    "@keyframes p079spin{to{transform:rotate(360deg)}}",
    ".p079-rep-overlay{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,0.55)}",
 
    ".p079-rep-overlay.show{display:flex}",
    ".p079-rep-modal{display:flex;flex-direction:column;overflow:hidden;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.35)}",
    ".p079-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}",
    ".p079-rep-title{font-size:15px;font-weight:700;color:#0f172a}",
    ".p079-rep-sub{margin-top:2px;color:#64748b;font-size:12px}",
    ".p079-rep-btns{display:flex;gap:8px}",
    ".p079-rep-btn{padding:6px 12px;color:#334155;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer}",
    ".p079-rep-btn:hover{background:#e2e8f0}",
    ".p079-rep-zoomlabel{display:inline-flex;min-width:48px;align-items:center;justify-content:center;color:#334155;font-size:12px;font-weight:600}",
    ".p079-rep-btn-primary{color:#fff;border-color:#0a5bc4;background:#0a5bc4}",
    ".p079-rep-btn-primary:hover{background:#084a9e}",
    ".p079-rep-body{flex:1;min-height:0;position:relative;overflow:auto;padding:12px;background:#f1f5f9}",
    ".p079-rep-body iframe{width:100%;height:100%;min-height:520px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}",
    ".p079-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-top:1px solid #e2e8f0}",
    ".p079-rep-hint{color:#64748b;font-size:12px}",
    ".p079-rep-loading{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#475569;font-size:13px;font-weight:600;background:#f1f5f9}",
    ".p079-rep-loading svg{width:34px;height:34px;color:#2563eb;animation:p079spin 1s linear infinite}",
  ].join("\n");


  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmtDate(v) {
    var p = v.split("-");
    return p[2] + "/" + p[1] + "/" + (Number(p[0]) + 543);
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
            "<label for=\"p079HeadDate\">วันที่หัวเอกสาร</label>" +
            "<div class=\"p079-input-wrap\"><input id=\"p079HeadDate\" type=\"date\" value=\"" + isoToday() + "\">" + CAL + "</div>" +
          "</div>" +
          "<div class=\"p079-field\">" +
            "<label for=\"p079Status\">" + "สถานะใบแจ้งหนี้" + "</label>" +
            "<div class=\"p079-input-wrap\"><select id=\"p079Status\"><option value=\"27\" selected>" + "27-Marketplace" + "</option>" +
            "</select>" + CHEV + "</div>" +
          "</div>" +
          "<div class=\"p079-field\">" +
            "<label for=\"p079Group\">" + "กลุ่มลูกค้า" + "</label>" +
            "<div class=\"p079-input-wrap\"><select id=\"p079Group\">" +
              "<option value=\"EC\" selected>" + "EC-Ecom-ทั้งหมด" + "</option>" +
              "<option value=\"EC01\">" + "EC-Ecom-(แยม)" + "</option>" +
              "<option value=\"EC02\">" + "EC-Ecom-(เบียร์)" + "</option>" +
              "<option value=\"EC03\">" + "EC-Ecom-MKT" + "</option>" +
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
              "<h2>" + "PickList Marketplace" + "</h2>" +
              "<p id=\"p079Subtitle\">" + "ยังไม่ได้สร้างเอกสาร" + "</p>" +
            "</div>" +
          "</div>" +
          "<div class=\"p079-panel-actions\">" +
            "<button class=\"p079-generate-button\" id=\"p079Gen\" type=\"button\" disabled>" + DOC_ICON + "สร้างเอกสาร" + "</button>" +
            "<span class=\"p079-badge\" id=\"p079Badge\">0 " + "รายการ" + "</span>" +
          "</div>" +
        "</div>" +
        "<div class=\"p079-document-area\">" +
          "<div class=\"p079-res-tables\" id=\"p079Paper\">" +
            "<div class=\"p079-rt\">" +
              "<div class=\"p079-rt-title\">" + "รายการสินค้า" + " Pick List Marketplace" + "<span class=\"p079-rt-count\" id=\"p079ItemsCount\"></span></div>" +
              "<div class=\"p079-rt-wrap\"><table class=\"p079-ztable\">" +
                "<thead><tr>" +
                  "<th style=\"width:15%\">" + "รหัสสินค้า" + "</th>" +
                  "<th>" + "ชื่อสินค้า" + "</th>" +
                  "<th>" + "ชื่อสินค้า" + "</th>" +
                  "<th class=\"center number\" style=\"width:10%\">" + "จำนวน" + "</th>" +
                  "<th class=\"center\" style=\"width:10%\">" + "หน่วย" + "</th>" +
                "</tr></thead>" +
                "<tbody id=\"p079ItemsBody\"></tbody>" +
              "</table></div>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>" +
      "<div class=\"p079-toast\" id=\"p079Toast\"><span id=\"p079ToastMsg\"></span></div>" +
      "<div class=\"p079-rep-overlay\" id=\"p079ReportOverlay\"><div class=\"p079-rep-modal\"><div class=\"p079-rep-head\"><div><div class=\"p079-rep-title\">Pick List Marketplace</div><div class=\"p079-rep-sub\" id=\"p079RepSub\"></div></div><div class=\"p079-rep-btns\"><button class=\"p079-rep-btn\" type=\"button\" id=\"p079RepZoomOut\" title=\"zoom out\">−</button><span class=\"p079-rep-zoomlabel\" id=\"p079RepZoom\">100%</span><button class=\"p079-rep-btn\" type=\"button\" id=\"p079RepZoomIn\" title=\"zoom in\">+</button><button class=\"p079-rep-btn\" type=\"button\" id=\"p079RepClose\" title=\"close (Esc)\">✕</button></div></div><div class=\"p079-rep-body\"><div class=\"p079-rep-loading\" id=\"p079RepLoading\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M21 12a9 9 0 1 1-6.2-8.56\"></path></svg></div><iframe id=\"p079RepFrame\" title=\"Pick List Marketplace\"></iframe></div><div class=\"p079-rep-foot\"><div class=\"p079-rep-hint\">รายงาน A4 — พิมพ์</div><button class=\"p079-rep-btn p079-rep-btn-primary\" type=\"button\" id=\"p079RepPrint\">พิมพ์</button></div></div></div>" +
    "</div>";
  }

  function doSearch() {
    if (state.searching) return;
    if (!el.docFrom.value || !el.docTo.value || el.docFrom.value > el.docTo.value) return;
    state.searching = true;
    el.search.classList.add("loading");
    el.search.disabled = true;
    apiPost(API.search, { connectionId: MAC5_CONNECTION_ID, status: el.status.value, dateFrom: el.docFrom.value, dateTo: el.docTo.value, group: el.group.value })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        state.rows = d.rows || [];
        if (d.count === 0) {
          el.itemsBody.innerHTML = "";
          el.itemsCount.textContent = "0";
          el.badge.textContent = "0 รายการ";
          el.gen.disabled = true;
          el.subtitle.textContent = "พบ 0 รายการ";
          showToast("ไม่พบรายการตามเงื่อนไขที่ค้นหา");
          return;
        }
        el.itemsCount.textContent = d.count;
        el.badge.textContent = d.count + " รายการ";
        el.gen.disabled = false;
        el.itemsBody.innerHTML = state.rows.map(function (o) {
          return "<tr>" +
            "<td>" + esc(o.STKcode) + "</td>" +
            "<td>" + esc(o.STKdescT1) + "</td>" +
            "<td>" + esc(o.STKdescT2) + "</td>" +
            "<td class=\"center number\">" + o.qty + "</td>" +
            "<td class=\"center\">" + esc(o.MILuname) + "</td>" +
          "</tr>";
        }).join("");
        el.subtitle.textContent = "พบ " + d.count + " รายการ";
        showToast("พบ " + d.count + " รายการ");
      })
      .catch(function (e) {
        showToast("ค้นหาไม่สำเร็จ: " + e.message);
      })
      .then(function () {
        state.searching = false;
        el.search.classList.remove("loading");
        el.search.disabled = false;
      });
  }

  function doGenerate() {
    if (!state.rows.length) {
      showToast("ค้นหาไม่มีข้อมูล - กด ปุ่มค้นหา ก่อน");
      return;
    }
    openReportModal();
  }


  function pad2(v) {
    return (v < 10 ? "0" : "") + v;
  }

  function fmtThaiDate(iso) {
    var p = iso.slice(0, 10).split("-");
    return pad2(Number(p[2])) + "/" + pad2(Number(p[1])) + "/" + (Number(p[0]) + 543);
  }

  function statusLabel() {
    var opt = el.status.options[el.status.selectedIndex];
    return opt ? opt.text : "";
  }
  function fmtAsOf(iso) {
    var p = (iso && iso.length >= 10) ? iso.slice(0, 10).split("-") : null;
    var d = p ? new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])) : new Date();
    var M = ["\u0e21\u0e01\u0e23\u0e32\u0e04\u0e21", "\u0e01\u0e38\u0e21\u0e20\u0e32\u0e1e\u0e31\u0e19\u0e18\u0e4c", "\u0e21\u0e35\u0e19\u0e32\u0e04\u0e21", "\u0e40\u0e21\u0e29\u0e32\u0e22\u0e19", "\u0e1e\u0e24\u0e29\u0e20\u0e32\u0e04\u0e21", "\u0e21\u0e34\u0e16\u0e38\u0e19\u0e32\u0e22\u0e19", "\u0e01\u0e23\u0e01\u0e0e\u0e32\u0e04\u0e21", "\u0e2a\u0e34\u0e07\u0e2b\u0e32\u0e04\u0e21", "\u0e01\u0e31\u0e19\u0e22\u0e32\u0e22\u0e19", "\u0e15\u0e38\u0e25\u0e32\u0e04\u0e21", "\u0e1e\u0e24\u0e28\u0e08\u0e34\u0e01\u0e32\u0e22\u0e19", "\u0e18\u0e31\u0e19\u0e27\u0e32\u0e04\u0e21"];
    return d.getDate() + " " + M[d.getMonth()] + " " + (d.getFullYear() + 543);
  }

  function fmtNum(v) {
    var x = Number(v) || 0;
    return x.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function setZoomLevel(z) {
    state.zoom = Math.max(50, Math.min(200, z));
    el.repZoom.textContent = state.zoom + "%";
    applyZoom();
  }

  function applyZoom() {
    var f = el.frame;
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
    var n = 0;
    var t = setInterval(function () {
      n++;
      if (tryIt() || n > 50) clearInterval(t);
    }, 100);
  }

  function closeReport() {
    el.overlay.classList.remove("show");
    if (el.frame) el.frame.srcdoc = "";
  }

  function reportDocHtml(inner) {
    var css = [
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
      "@page{size:A4;margin:20pt 10pt}",
      "body{margin:0;background:#f1f5f9}",
      ".p079-page{box-sizing:border-box;display:flex;flex-direction:column;width:210mm;height:297mm;overflow:hidden;margin:0 auto;padding:20pt 10pt;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.25);font-family:'THSarabunNew','TH Sarabun New',Arial,sans-serif;color:#000}",
      ".p079-page+.p079-page{margin-top:10px}",
      ".p079-pagefoot{margin-top:auto;padding-top:8px;font-size:12px}",
      ".p079-sheet-title{margin:0 0 2px;text-align:center;font-size:18px;font-weight:700}",
      ".p079-sheet-asof{margin:0 0 4px;text-align:center;font-size:15px;font-weight:700}",
      ".p079-sheet-spacer{height:6px}",
      ".p079-rt2{table-layout:fixed;width:550pt;margin:0 auto;border-collapse:collapse;font-size:14px}",
      ".p079-rt2 td{padding:3px 5px;border:1px solid #000;vertical-align:middle;word-break:break-word}",
      ".p079-rt2 .stline{border:0;font-size:12px;font-weight:400}",
      ".p079-rt2 .cap{font-size:12px;font-weight:400}",
      ".p079-rt2 .h{font-weight:700;text-align:center;background:#fff}",
      ".p079-rt2 .gh{font-weight:700;background:#f0f0f0}",
      ".p079-rt2 .gh .prod{font-weight:400}",
      ".p079-rt2 .c{text-align:center}",
      ".p079-rt2 .r{text-align:right}",
      ".p079-rt2 .tot{font-weight:700}",
      ".p079-rt2 .sto{font-weight:700;text-align:center;vertical-align:middle}",
      ".p079-rt2 .num{font-family:'THSarabunNew','TH Sarabun New',sans-serif}",
      "@media print{body{display:block;background:#fff;zoom:1}.p079-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;background:#fff;box-shadow:none;page-break-after:always}.p079-page:last-child{page-break-after:auto}.p079-rt2 tr{page-break-inside:avoid}}"
    ].join("\n");
    var fit = "<script>var NAA='หน้า';function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}function rowOver(row){var s=row.closest('section.p079-page');if(!s)return false;var sr=s.getBoundingClientRect();var lr=row.getBoundingClientRect();var pb=parseFloat(getComputedStyle(s).paddingBottom)||0;return lr.bottom>sr.bottom-pb}function renumber(){var ss=document.querySelectorAll('section.p079-page');for(var i=0;i<ss.length;i++){var f=ss[i].querySelector('.p079-pgno');if(f)f.textContent=i+1}}function fixSto(tb){var rows=tb.rows;var i=0;while(i<rows.length){var v=rows[i].getAttribute('data-sto');if(!v){i++;continue}var j=i;while(j<rows.length&&rows[j].getAttribute('data-sto')===v)j++;var td=document.createElement('td');td.className='sto';td.textContent=v;if(j-i>1)td.setAttribute('rowspan',String(j-i));rows[i].insertBefore(td,rows[i].firstChild);for(var k=i;k<j;k++)rows[k].removeAttribute('data-sto');i=j}}function newSec(){var first=document.querySelector('section.p079-page');var s2=document.createElement('section');s2.className='p079-page cont';var ht=first.querySelector('.p079-sheet-title');var mt=first.querySelector('.p079-sheet-asof');var t=first.querySelector('table');var cg=t.querySelector('colgroup');var hd=t.tHead;var h1=document.createElement('h1');h1.className='p079-sheet-title';if(ht)h1.textContent=ht.textContent;var p=document.createElement('p');p.className='p079-sheet-asof';if(mt)p.innerHTML=mt.innerHTML;var dv=document.createElement('div');dv.className='p079-sheet-spacer';var tb=document.createElement('table');tb.className='p079-rt2';if(cg)tb.appendChild(cg.cloneNode(true));var th=document.createElement('thead');if(hd)th.innerHTML=hd.innerHTML;tb.appendChild(th);var b=document.createElement('tbody');tb.appendChild(b);var pf=document.createElement('div');pf.className='p079-pagefoot';var spn=document.createElement('span');spn.className='p079-pgno';spn.textContent='1';pf.appendChild(document.createTextNode(NAA+' '));pf.appendChild(spn);s2.appendChild(h1);s2.appendChild(p);s2.appendChild(dv);s2.appendChild(tb);s2.appendChild(pf);return s2}function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p079-page'));if(!secs.length)return;var first=secs[0];var t=first.querySelector('table');for(var i=1;i<secs.length;i++){var t2=secs[i].querySelector('table');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);secs[i].parentNode.removeChild(secs[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);if(curT.tBodies[0].rows.length>1&&rowOver(row)){curT.tBodies[0].removeChild(row);var s3=newSec();cur.parentNode.insertBefore(s3,cur.nextSibling);cur=s3;curT=s3.querySelector('table');curT.tBodies[0].appendChild(row)}});var all=document.querySelectorAll('section.p079-page table');for(var x=0;x<all.length;x++)fixSto(all[x].tBodies[0]);renumber()}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";
    return '<!doctype html><html><head><meta charset="utf-8"><title>Pick List Marketplace</title><style>' + css + "</style></head><body>" + inner + fit + "</body></html>";
  }

  function openReportModal() {
    el.overlay.classList.add("show");
    el.repSub.textContent = el.status.options[el.status.selectedIndex].text + " — " + el.group.options[el.group.selectedIndex].text + " — " + state.rows.length + " " +"รายการ";
    el.repZoom.textContent = state.zoom + "%";
    el.loading.style.display = "flex";
    apiPost(API.report, { connectionId: MAC5_CONNECTION_ID, status: el.status.value, dateFrom: el.docFrom.value, dateTo: el.docTo.value, group: el.group.value })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        el.frame.srcdoc = reportDocHtml(reportSheetHtml(d));
        el.loading.style.display = "none";
        applyZoom();
      })
      .catch(function (e) {
        el.loading.style.display = "none";
        closeReport();
        showToast("ค้นหาไม่สำเร็จ: " + e.message);
      });
  }

  function reportSheetHtml(d) {
    var thead =
      "<tr>" +
      "<td colspan=\"2\" class=\"h\">" + "รหัส" + "</td>" +
      "<td class=\"h\">" + "ชื่อลูกค้า" + "</td>" +
      "<td class=\"h\">" + "เลขที่ใบแจ้งหนี้" + "</td>" +
      "<td class=\"h\">" + "วันที่ใบแจ้งหนี้" + "</td>" +
      "<td class=\"h\">" + "ปริมาณ" + "</td>" +
      "<td class=\"h\">" + "หน่วยนับ" + "</td>" +
    "</tr>";
    var t =
      "<section class=\"p079-page\">" +
      "<h1 class=\"p079-sheet-title\">" + " Pick List Marketplace" + "</h1>" +
      "<p class=\"p079-sheet-asof\">" + " ประจำวันที่ " + fmtAsOf(el.headDate.value) + "</p>" +
      "<div class=\"p079-sheet-spacer\"></div>" +
      "<table class=\"p079-rt2\"><colgroup>" +
        "<col style=\"width:50pt\"><col style=\"width:20pt\"><col style=\"width:250pt\"><col style=\"width:70pt\"><col style=\"width:60pt\"><col style=\"width:50pt\"><col style=\"width:50pt\">" +
      "</colgroup><thead>" + thead + "</thead><tbody>";
    t += "<tr><td colspan=\"7\" class=\"stline\">" + " สถานะ : " + statusLabel() + "  " + " พิมพ์เมื่อ : " + d.printedAt + "</td></tr>";
    d.headers.forEach(function (h) {
      t += "<tr>" +
        "<td colspan=\"4\" class=\"gh\"><span class=\"prod\">" + esc(h.stk) + "  " + esc(h.desc) + " " + esc(h.desc2) + "</span></td>" +
        "<td class=\"gh c tot\">" + " รวม " + "</td>" +
        "<td class=\"gh r tot num\">" + fmtNum(h.total) + "</td>" +
        "<td class=\"gh\"></td>" +
      "</tr>";
      h.rows.forEach(function (r) {
        t += "<tr data-sto=\"" + esc(h.sto) + "\">" +
          "<td colspan=\"2\">" + esc(r.cust) + "</td>" +
          "<td class=\"c\">" + esc(r.doc) + "</td>" +
          "<td class=\"c\">" + fmtThaiDate(r.date) + "</td>" +
          "<td class=\"r num\">" + fmtNum(r.qty) + "</td>" +
          "<td class=\"r\">" + esc(r.unit) + "</td>" +
        "</tr>";
      });
    });
    t += "</tbody></table>" +
      "<div class=\"p079-pagefoot\">" + "หน้า " + "<span class=\"p079-pgno\">1</span></div>" +
    "</section>";
    return t;
  }


  function mount(mountEl) {
    root = mountEl;
    root.innerHTML = "<style>" + CSS + "</style>" + html();
    el = {
      form: document.getElementById("p079Form"),
      docFrom: document.getElementById("p079DocFrom"),
      docTo: document.getElementById("p079DocTo"),
      headDate: document.getElementById("p079HeadDate"),
      status: document.getElementById("p079Status"),
      group: document.getElementById("p079Group"),
      overlay: document.getElementById("p079ReportOverlay"),
      frame: document.getElementById("p079RepFrame"),
      repSub: document.getElementById("p079RepSub"),
      repZoom: document.getElementById("p079RepZoom"),
      repZoomIn: document.getElementById("p079RepZoomIn"),
      repZoomOut: document.getElementById("p079RepZoomOut"),
      repClose: document.getElementById("p079RepClose"),
      repPrint: document.getElementById("p079RepPrint"),
      loading: document.getElementById("p079RepLoading"),
      search: document.getElementById("p079Search"),
      gen: document.getElementById("p079Gen"),
      badge: document.getElementById("p079Badge"),
      subtitle: document.getElementById("p079Subtitle"),
      paper: document.getElementById("p079Paper"),
      itemsCount: document.getElementById("p079ItemsCount"),
      itemsBody: document.getElementById("p079ItemsBody"),
    };
    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });
    el.gen.addEventListener("click", doGenerate);
    el.repClose.addEventListener("click", closeReport);
    el.repZoomIn.addEventListener("click", function () {
      setZoomLevel(state.zoom + 25);
    });
    el.repZoomOut.addEventListener("click", function () {
      setZoomLevel(state.zoom - 25);
    });
    el.repPrint.addEventListener("click", function () {
      var f = el.frame;
      if (f && f.contentWindow) {
        try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { /* ignore */ }
      }
    });
    el.overlay.addEventListener("click", function (e) {
      if (e.target === el.overlay) closeReport();
    });
    if (!state.escBound) {
      state.escBound = true;
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeReport(); });
    }

  }

  window.P079Marketplace = { mount: mount };
})();
