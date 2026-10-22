
/* P082 — PickList To Pack (UI only — clone UI from P080)
 * IIFE — window.P082PickListPack = { mount }
 * UI clone P080 - launcher (status + search btn) + panel 5-col table
 * search → api/p082_search.php (clone P080 — ตัดกลุ่ ม SparePart + Battery ออก)
 * สร้างเอกสาร = stub (toast — รอ C# reference)
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

  var root = null;
  var el = {};
  var state = {
    searchRows: [], view: null, searching: false
  };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      check: '<path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>',
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function statusLabel(v) {
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      if (STATUS_OPTIONS[i][0] === v) return STATUS_OPTIONS[i][1];
    }
    return v;
  }

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { search: "api/p082_search.php" };

  function apiPost(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function showToast(msg, ms) {
    $("p082ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  /* ---------- search (UI stub — ยังไม่เชื่ อม API) ---------- */
  function doSearch() {
    if (state.searching) return;
    state.searching = true;
    el.searchBtn.classList.add("loading");
    el.searchBtn.disabled = true;
    apiPost(API.search, { connectionId: MAC5_CONNECTION_ID, status: el.status.value })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        if (d.count === 0) {
          state.view = null;
          render();
          showToast("ไม่พบรายการตามเงื่อนไขที่ค้นหา");
          return;
        }
        state.searchRows = d.rows;
        state.view = "search";
        render();
        showToast("พบ " + d.count + " รายการ");
      })
      .catch(function (e) {
        showToast("ค้นหาไม่สำเร็จ: " + e.message);
      })
      .then(function () {
        state.searching = false;
        el.searchBtn.classList.remove("loading");
        el.searchBtn.disabled = false;
      });
  }

  function doGenerate() {
    showToast("P082 — ปุ่ มสร้างเอกสารกำลังพัฒนา");
  }

  /* ---------- render (ผลค้นหา) ---------- */
  function render() {
    var isSearch = state.view === "search";
    if (!isSearch) {
      el.searchContainer.style.display = "none";
      el.footer.style.display = "none";
      el.modeBadge.style.display = "none";
      el.emptyState.style.display = "flex";
      el.subtitle.textContent = "ยังไม่ได้ค้นหา/สร้างรายงาน";
      return;
    }
    var rows = state.searchRows;
    el.emptyState.style.display = "none";
    el.footer.style.display = "flex";
    el.searchContainer.style.display = "block";
    el.modeBadge.style.display = "inline-flex";
    el.modeBadge.textContent = "ผลค้นหา";
    el.modeBadge.className = "p082-mode-badge search";
    el.subtitle.textContent = "สถานะ " + statusLabel(el.status.value);
    var html = "";
    rows.forEach(function (r) {
      html += "<tr>" +
        '<td class="p082-product-code">' + esc(r.STKcode) + "</td>" +
        '<td class="center">' + esc(r.STKgroup) + "</td>" +
        "<td>" + esc(r.STKdescT1) + "</td>" +
        "<td>" + esc(r.STKdescT2) + "</td>" +
        '<td class="center number">' + (r.SBLqty == null ? "" : esc(r.SBLqty)) + "</td>" +
        "</tr>";
    });
    el.searchRows.innerHTML = html;
    el.footerText.textContent = "แสดง " + rows.length + " รายการ";
  }

  /* ---------- CSS (clone P080) ---------- */
  var CSS = [
    ".p082-app{display:flex;flex-direction:column;gap:14px}",
    ".p082-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p082-launcher-body{display:flex;align-items:end;gap:14px;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p082-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p082-field{width:50%}",
    ".p082-input-wrap{position:relative}",
    ".p082-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p082-input-wrap input,.p082-input-wrap select{width:100%;height:44px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p082-input-wrap select{cursor:pointer;appearance:none}",
    ".p082-input-wrap input:focus,.p082-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p082-action-button{display:flex;min-height:44px;width:165px;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 10px;color:#fff;border:0;border-radius:11px;font-size:13px;font-weight:700;text-align:center;transition:0.16s ease}",
    ".p082-action-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p082-action-button.primary{background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,0.26)}",
    ".p082-action-button.search-btn{width:120px;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 9px 20px rgba(5,150,105,0.26)}",
    ".p082-action-button small{font-size:10px;font-weight:600;opacity:0.92}",
    ".p082-action-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}",
    ".p082-action-button:disabled{opacity:0.7}",
    ".p082-action-button.loading svg{animation:p082spin 1s linear infinite}",
    "@keyframes p082spin{to{transform:rotate(360deg)}}",
    ".p082-panel{display:flex;flex-direction:column;min-height:420px;flex:1;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p082-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p082-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p082-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p082-panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p082-panel-title h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
    ".p082-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p082-mode-badge{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p082-header-right{display:flex;align-items:center;gap:10px}",
    ".p082-header-actions{display:flex;align-items:center;gap:8px}",
    ".p082-header-actions .p082-action-button{min-height:38px;width:140px;padding:6px 8px;border-radius:9px;font-size:12px}",
    ".p082-mode-badge.search{color:#047857;background:#d1fae5}",
    ".p082-table-container{min-height:0;flex:1;overflow:auto}",
    ".p082-table{width:100%;min-width:820px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p082-table th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p082-table td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
    ".p082-table th.center,.p082-table td.center{text-align:center}",
    ".p082-table th.number,.p082-table td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p082-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p082-table tbody tr:hover{background:#f0f7ff}",
    ".p082-product-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}",
    ".p082-empty-state{display:flex;min-height:320px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p082-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p082-empty-state p{margin-top:5px;font-size:11px}",
    ".p082-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p082-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p082-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    "@media (max-width:950px){.p082-launcher-body{flex-wrap:wrap}.p082-field{width:100%}.p082-action-button{width:100%;flex-direction:row}}",
    "@media (max-width:680px){.p082-panel-header{align-items:flex-start;flex-direction:column}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  function html() {
    var statusHtml = "";
    STATUS_OPTIONS.forEach(function (s) {
      statusHtml += '<option value="' + s[0] + '"' + (s[0] === "6" ? " selected" : "") + ">" + esc(s[1]) + "</option>";
    });
    return '<div class="p082-app">' +
      '<section class="p082-launcher-card">' +
        '<form class="p082-launcher-body" id="p082Form">' +
          '<div class="p082-field">' +
            '<label for="p082Status">' + "สถานะใบแจ้งหนี้" + '</label>' +
            '<div class="p082-input-wrap">' + icon("chevron") + '<select id="p082Status">' + statusHtml + "</select></div>" +
          "</div>" +
          '<button class="p082-action-button search-btn" id="p082SearchBtn" type="button">' + icon("search") + "ค้นหา</button>" +
        "</form>" +
      "</section>" +
      '<section class="p082-panel">' +
        '<div class="p082-panel-header">' +
          '<div class="p082-panel-heading">' +
            '<div class="p082-panel-icon">' + icon("grid") + "</div>" +
            '<div class="p082-panel-title">' +
              "<h2>" + "ผลการสร้างเอกสาร PickList To Pack" + "</h2>" +
              '<p id="p082Subtitle">' + "ยังไม่ได้ค้นหา/สร้างรายงาน" + "</p>" +
            "</div>" +
          "</div>" +
          '<div class="p082-header-right">' +
          '<span class="p082-mode-badge search" id="p082ModeBadge" style="display:none">' + "ผลค้นหา" + "</span>" +
          '<div class="p082-header-actions">' +
            '<button class="p082-action-button primary" id="p082Gen" type="button">' + icon("doc") + "สร้างเอกสาร" + "</button>" +
          "</div>" +
          "</div>" +
        "</div>" +
        '<div class="p082-table-container" id="p082SearchContainer" style="display:none">' +
          '<table class="p082-table p082-search-table">' +
            "<thead><tr>" +
            "<th>" + "รหัสสินค้า" + '</th><th class="center">' + "กลุ่ ม" + "</th>" +
            "<th>" + "ชื่อสินค้า (1)" + '</th><th>' + "ชื่อสินค้า (2)" + "</th>" +
            '<th class="center number">' + "คงเหลือ" + "</th>" +
            "</tr></thead>" +
            '<tbody id="p082SearchRows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p082-empty-state" id="p082EmptyState">' +
          "<div>" + icon("check") +
          "<strong>" + "ยังไม่มีข้อมูล" + "</strong>" +
          '<p>' + 'เลือกสถานะ แล้วกด "ค้นหา" หรือ "สร้างเอกสาร"' + "</p>" +
          "</div>" +
        "</div>" +
        '<div class="p082-table-footer" id="p082Footer" style="display:none">' +
          '<span id="p082FooterText">' + "แสดง 0 รายการ" + "</span>" +
        "</div>" +
      "</section>" +
      '<div class="p082-toast" id="p082Toast"><span id="p082ToastMsg"></span></div>' +
      "</div>";
  }

  function mount(mountEl) {
    root = mountEl;
    root.innerHTML = html();
    if (!document.getElementById("p082Style")) {
      var st = document.createElement("style");
      st.id = "p082Style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    el.status = $("p082Status");
    el.genBtn = $("p082Gen");
    el.searchBtn = $("p082SearchBtn");
    el.searchContainer = $("p082SearchContainer");
    el.searchRows = $("p082SearchRows");
    el.subtitle = $("p082Subtitle");
    el.modeBadge = $("p082ModeBadge");
    el.emptyState = $("p082EmptyState");
    el.footer = $("p082Footer");
    el.footerText = $("p082FooterText");
    el.toast = $("p082Toast");

    el.genBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doGenerate();
    });
    el.searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doSearch();
    });
    $("p082Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });
  }

  window.P082PickListPack = { mount: mount };
})();
