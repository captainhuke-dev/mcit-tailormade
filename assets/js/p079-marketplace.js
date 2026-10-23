
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



  var INBOX_ICON = '<svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>';
  var TABLE_ICON = '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>';

  var GROUP_FILTER_LABELS = {
    EC: "EC-Ecom-ทั้งหมด",
    EC01: "EC-Ecom-(แยม)",
    EC02: "EC-Ecom-(เบียร์)",
    EC03: "EC-Ecom-MKT"
  };


  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { search: "api/p079_search.php" };

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
  var state = { rows: [], searching: false };

  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var CSS = [
    ".p079-app{display:flex;flex-direction:column;gap:12px}",
    ".p079-app svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p079-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p079-launcher-body{display:grid;grid-template-columns:repeat(6,1fr);gap:10px 12px;align-items:end;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
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
    ".p079-empty-state{display:flex;min-height:320px;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p079-empty-state svg{width:48px;height:48px;margin:0 auto 10px}",
    "@media (max-width:1000px){.p079-launcher-body{grid-template-columns:1fr 1fr}}",
    "@media (max-width:680px){.p079-launcher-body{grid-template-columns:1fr}.p079-panel-header{align-items:flex-start;flex-direction:column}}",
    ".p079-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p079-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    ".p079-search-button:disabled{opacity:0.7;transform:none}",
    ".p079-search-button.loading svg{animation:p079spin 1s linear infinite}",
    "@keyframes p079spin{to{transform:rotate(360deg)}}",
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
            "<label for=\"p079Status\">" + "สถานะใบแจ้งหนี้" + "</label>" +
            "<div class=\"p079-input-wrap\"><select id=\"p079Status\"><option value=\"27\" selected>" + "27-Marketplace" + "</option>" +
              "<option value=\"77\">77-test</option>" +
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
            "<button class=\"p079-generate-button\" id=\"p079Gen\" type=\"button\">" + DOC_ICON + "สร้างเอกสาร" + "</button>" +
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
          "<div class=\"p079-res-tables\" id=\"p079Paper\" style=\"display:none\">" +
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
          el.paper.style.display = "none";
          el.empty.style.display = "flex";
          el.emptyStrong.textContent = "ไม่พบรายการตามเงื่อนไขที่เลือก";
          el.subtitle.textContent = "ยังไม่ได้ค้นหา/สร้างรายงาน";
          showToast("ไม่พบรายการตามเงื่อนไขที่ค้นหา");
          return;
        }
        el.empty.style.display = "none";
        el.paper.style.display = "flex";
        el.itemsCount.textContent = d.count;
        el.badge.textContent = d.count + " รายการ";
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
    doSearch();
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
      search: document.getElementById("p079Search"),
      gen: document.getElementById("p079Gen"),
      badge: document.getElementById("p079Badge"),
      subtitle: document.getElementById("p079Subtitle"),
      empty: document.getElementById("p079Empty"),
      emptyStrong: document.getElementById("p079EmptyStrong"),
      paper: document.getElementById("p079Paper"),
      itemsCount: document.getElementById("p079ItemsCount"),
      itemsBody: document.getElementById("p079ItemsBody"),
    };
    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });
    el.gen.addEventListener("click", doGenerate);

    doGenerate();
  }

  window.P079Marketplace = { mount: mount };
})();
