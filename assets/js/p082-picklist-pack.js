
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
    ["55", "55-PL ด่วน BKK"],
    ["65", "65-Test"]
  ];

  var root = null;
  var el = {};
  var state = {
    searchRows: [], zone01: [], sp: [], qc: [], view: null, searching: false
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
  var API = { search: "api/p082_search.php", spGroups: "api/p082_sparepart_groups.php", batGroups: "api/p082_battery_groups.php" };

  function apiPost(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function showToast(msg, ms) {
    var toast = $("p082Toast");
    var msgEl = $("p082ToastMsg");
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    clearTimeout(toastTimer);
    toast.classList.add("show");
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, ms || 2600);
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
        state.searchRows = d.zone01 || [];
        state.zone01 = d.zone01 || [];
        state.sp = d.sp || [];
        state.qc = d.qc || [];
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

  function zoneRowsHtml(rows) {
    var html = "";
    rows.forEach(function (r) {
      html += "<tr>" +
        '<td class="p082-product-code">' + esc(r.STKcode) + "</td>" +
        '<td class="center">' + esc(r.STKgroup) + "</td>" +
        "<td>" + esc(r.STKdescT1) + "</td>" +
        "<td>" + esc(r.STKdescT2) + "</td>" +
        '<td class="center number">' + (r.qty == null ? "" : esc(r.qty)) + "</td>" +
        "</tr>";
    });
    return html;
  }

  /* ---------- render (ผลค้นหา) ---------- */
  function render() {
    var isSearch = state.view === "search";
    if (!isSearch) {
      el.footer.style.display = "none";
      el.modeBadge.style.display = "none";
      el.emptyState.style.display = "flex";
      el.subtitle.textContent = "ยังไม่ได้ค้นหา/สร้างรายงาน";
      return;
    }
    el.emptyState.style.display = "none";
    el.footer.style.display = "flex";
    el.modeBadge.style.display = "inline-flex";
    el.modeBadge.textContent = "ผลค้นหา";
    el.modeBadge.className = "p082-mode-badge search";
    el.subtitle.textContent = "สถานะ " + statusLabel(el.status.value);
    el.rows01.innerHTML = zoneRowsHtml(state.zone01);
    el.rowsSp.innerHTML = zoneRowsHtml(state.sp);
    el.rowsQc.innerHTML = zoneRowsHtml(state.qc);
    el.count01.textContent = String(state.zone01.length);
    el.countSp.textContent = String(state.sp.length);
    el.countQc.textContent = String(state.qc.length);
    var total = state.zone01.length + state.sp.length + state.qc.length;
    el.footerText.textContent = "แสดง " + total + " รายการ";
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
    ".p082-settings-btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 14px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:10px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,0.10)}",
    ".p082-settings-btn:hover{background:#eff6ff}",
    ".p082-grp-overlay{position:fixed;inset:0;z-index:10000;display:none;background:rgba(15,23,42,0.55)}",
    ".p082-grp-overlay.show{display:block}",
    ".p082-grp-modal{position:relative;margin:4vh auto;width:min(900px,94vw);max-height:92vh;display:flex;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,0.35);overflow:hidden}",
    ".p082-grp-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #dbe3ef;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p082-grp-head h3{margin:0;font-size:15px;font-weight:800;color:#0f172a}",
    ".p082-grp-x{width:32px;height:32px;border:none;border-radius:9px;background:#e2e8f0;color:#475569;font-size:14px;cursor:pointer}",
    ".p082-grp-body{padding:18px 20px;overflow:auto}",
    ".p082-grp-form{display:grid;grid-template-columns:170px 1fr 130px auto;gap:10px;align-items:end;margin-bottom:14px;padding:12px;border:1px solid #dbe3ef;border-radius:12px;background:#f8fafc}",
    ".p082-grp-form label{display:block;margin-bottom:5px;color:#475569;font-size:11px;font-weight:700}",
    ".p082-grp-form input,.p082-grp-form select{width:100%;height:38px;padding:0 10px;color:#172033;border:1px solid #dbe3ef;border-radius:9px;outline:none;background:#fff;font-size:13px}",
    ".p082-grp-btns{display:flex;gap:8px}",
    ".p082-grp-save{height:38px;padding:0 18px;border:none;border-radius:9px;background:linear-gradient(135deg,#34d399,#059669);color:#fff;font-size:13px;font-weight:700;cursor:pointer}",
    ".p082-grp-new{height:38px;padding:0 12px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#334155;font-size:12px;font-weight:700;cursor:pointer}",
    ".p082-grp-table{width:100%;border-collapse:collapse}",
    ".p082-grp-table th{padding:9px 12px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;font-size:12px;font-weight:700;text-align:left}",
    ".p082-grp-table td{padding:9px 12px;border-bottom:1px solid #eef2f7;font-size:13px;color:#0f172a}",
    ".p082-grp-table tr:hover td{background:#f0f7ff}",
    ".p082-grp-act{display:inline-flex;gap:6px}",
    ".p082-grp-mini{padding:4px 10px;border:1px solid #dbe3ef;border-radius:7px;background:#fff;font-size:11px;font-weight:700;cursor:pointer;color:#334155}",
    ".p082-grp-mini.danger{color:#dc2626;border-color:#fecaca}",
    ".p082-grp-on{display:inline-block;padding:2px 8px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:11px;font-weight:700}",
    ".p082-grp-off{display:inline-block;padding:2px 8px;border-radius:999px;background:#f1f5f9;color:#64748b;font-size:11px;font-weight:700}",
    ".p082-grp-empty{padding:28px;text-align:center;color:#94a3b8;font-size:13px}",
    ".p082-grp-mode{display:flex;align-items:center;gap:8px;margin:0 0 8px;color:#1d4ed8;font-size:12px;font-weight:800}",
    ".p082-grp-mode .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 3px rgba(34,197,94,.18)}",
    ".p082-grp-mode small{color:#64748b;font-weight:600}",
    ".p082-grp-form.flash{animation:p082flash .7s ease}",
    "@keyframes p082flash{0%{box-shadow:0 0 0 0 rgba(52,211,153,.65)}100%{box-shadow:0 0 0 12px rgba(52,211,153,0)}}",
    ".p082-res-tables{display:flex;flex-direction:column;gap:16px;padding:14px 15px;background:#f8fafc}",
    ".p082-rt{background:#fff;border:1px solid #dbe3ef;border-radius:12px;overflow:hidden}",
    ".p082-rt-title{display:flex;align-items:center;gap:10px;padding:10px 14px;color:#1d4ed8;border-bottom:1px solid #dbe3ef;background:#eff6ff;font-size:13px;font-weight:700}",
    ".p082-rt-count{color:#475569;background:#fff;border:1px solid #dbe3ef;border-radius:999px;padding:2px 10px;font-size:11px;font-weight:600}",
    ".p082-rt-wrap{max-height:280px;overflow:auto}",
    ".p082-ztable{width:100%;min-width:720px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p082-ztable th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p082-ztable td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
    ".p082-ztable th.center,.p082-ztable td.center{text-align:center}",
    ".p082-ztable td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p082-ztable tbody tr:nth-child(even){background:#fbfdff}",
    ".p082-ztable tbody tr:hover{background:#f0f7ff}",
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
        '<div class="p082-res-tables" id="p082ResTables">' +
          '<div class="p082-rt">' +
            '<div class="p082-rt-title">' + "รายการสินค้า" + ' Zone 01' + '<span class="p082-rt-count" id="p082Count01"></span></div>' +
            '<div class="p082-rt-wrap"><table class="p082-ztable">' +
            "<thead><tr>" +
            "<th>" + "รหัสสินค้า" + "</th><th class=\"center\">" + "กลุ่มสินค้า" + "</th>" +
            "<th>" + "ชื่อสินค้า" + "</th><th>" + "ชื่อสินค้า" + "</th>" +
            '<th class="center number">' + "จำนวน" + "</th>" +
            "</tr></thead>" +
            '<tbody id="p082Rows01"></tbody>' +
            "</table></div>" +
          "</div>" +
          '<div class="p082-rt">' +
            '<div class="p082-rt-title">' + "รายการสินค้า" + ' Zone SparePart' + '<span class="p082-rt-count" id="p082CountSp"></span></div>' +
            '<div class="p082-rt-wrap"><table class="p082-ztable">' +
            "<thead><tr>" +
            "<th>" + "รหัสสินค้า" + "</th><th class=\"center\">" + "กลุ่มสินค้า" + "</th>" +
            "<th>" + "ชื่อสินค้า" + "</th><th>" + "ชื่อสินค้า" + "</th>" +
            '<th class="center number">' + "จำนวน" + "</th>" +
            "</tr></thead>" +
            '<tbody id="p082RowsSp"></tbody>' +
            "</table></div>" +
          "</div>" +
          '<div class="p082-rt">' +
            '<div class="p082-rt-title">' + "รายการสินค้า" + ' Zone QC' + '<span class="p082-rt-count" id="p082CountQc"></span></div>' +
            '<div class="p082-rt-wrap"><table class="p082-ztable">' +
            "<thead><tr>" +
            "<th>" + "รหัสสินค้า" + "</th><th class=\"center\">" + "กลุ่มสินค้า" + "</th>" +
            "<th>" + "ชื่อสินค้า" + "</th><th>" + "ชื่อสินค้า" + "</th>" +
            '<th class="center number">' + "จำนวน" + "</th>" +
            "</tr></thead>" +
            '<tbody id="p082RowsQc"></tbody>' +
            "</table></div>" +
          "</div>" +
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

  /* ---------- group settings modal (clone P080 — Sparepart) ---------- */
  var GRP_STATE = { open: false, rows: [], mode: "sp" };
  var G_CODE = "รหัสกลุ่ม";
  var G_NAME = "ชื่อกลุ่ม";
  var G_STAT = "สถานะ";
  var G_SAVE = "บันทึก";
  var G_CLOSE = "ปิด";
  var G_EDIT = "แก้ไข";
  var G_DEL = "ลบ";
  var G_NEW = "เพิ่มกลุ่มใหม่";
  var G_EMPTY = "ยังไม่มีกลุ่มสินค้า";
  var G_REQ = "กรุณาระบุรหัสกลุ่ม";
  var G_DONE = "บันทึกแล้ว";
  var G_DELOK = "ลบแล้ว";
  var G_CONF = "ยืนยันการลบกลุ่ม";
  var G_ON = "ใช้งาน";
  var G_OFF = "ไม่ใช้งาน";

  var GRP_TITLES = { sp: 'ตั้งค่ากลุ่มสินค้าช่าง (Sparepart)', bat: 'ตั้งค่ากลุ่มสินค้าแบตเตอรี (Battery)' };

  function grpApi() {
    return GRP_STATE.mode === "bat" ? API.batGroups : API.spGroups;
  }

  function grpRowsHtml() {
    if (!GRP_STATE.rows.length) {
      return '<div class="p082-grp-empty">' + G_EMPTY + "</div>";
    }
    var h = '<table class="p082-grp-table"><thead><tr>';
    h += "<th>" + G_CODE + "</th><th>" + G_NAME + "</th><th>" + G_STAT + '</th><th style="width:150px"></th>';
    h += "</tr></thead><tbody>";
    for (var i = 0; i < GRP_STATE.rows.length; i++) {
      var g = GRP_STATE.rows[i];
      h += "<tr>";
      h += "<td><strong>" + esc(g.code) + "</strong></td>";
      h += "<td>" + esc(g.descT) + "</td>";
      h += "<td>" + (g.status === "Active"
        ? '<span class="p082-grp-on">' + G_ON + "</span>"
        : '<span class="p082-grp-off">' + G_OFF + "</span>") + "</td>";
      h += '<td><div class="p082-grp-act">';
      h += '<button class="p082-grp-mini" type="button" data-grp-edit="' + esc(g.code) + '">' + G_EDIT + "</button>";
      h += '<button class="p082-grp-mini danger" type="button" data-grp-del="' + esc(g.code) + '">' + G_DEL + "</button>";
      h += "</div></td></tr>";
    }
    return h + "</tbody></table>";
  }

  function grpLoad() {
    apiPost(grpApi(), { connectionId: MAC5_CONNECTION_ID, action: "list" })
      .then(function (d) {
        if (!d.ok) { showToast(d.error || "error"); return; }
        GRP_STATE.rows = d.rows || [];
        var box = document.getElementById("p082GrpRows");
        if (box) box.innerHTML = grpRowsHtml();
      })
      .catch(function (e) { showToast(e.message); });
  }

  function grpSetMode(text) {
    var t = document.getElementById("p082GrpModeText");
    if (t) t.textContent = text;
  }

  function grpResetForm() {
    var c = document.getElementById("p082GrpCode");
    var n = document.getElementById("p082GrpDesc");
    var t = document.getElementById("p082GrpStatus");
    var f = document.getElementById("p082GrpForm");
    if (c) { c.value = ""; c.readOnly = false; }
    if (n) n.value = "";
    if (t) t.value = "Active";
    grpSetMode(G_NEW);
    if (f) {
      f.classList.remove("flash");
      void f.offsetWidth;
      f.classList.add("flash");
    }
    if (c) c.focus();
  }

  function grpEdit(code) {
    var g = null;
    for (var i = 0; i < GRP_STATE.rows.length; i++) {
      if (GRP_STATE.rows[i].code === code) { g = GRP_STATE.rows[i]; break; }
    }
    if (!g) return;
    var c = document.getElementById("p082GrpCode");
    c.value = g.code;
    c.readOnly = true;
    document.getElementById("p082GrpDesc").value = g.descT;
    document.getElementById("p082GrpStatus").value = g.status;
    grpSetMode(G_EDIT + " " + g.code);
    document.getElementById("p082GrpDesc").focus();
  }

  function grpDel(code) {
    if (!window.confirm(G_CONF + " " + code + " ?")) return;
    apiPost(grpApi(), { connectionId: MAC5_CONNECTION_ID, action: "delete", code: code })
      .then(function (d) {
        if (!d.ok) { showToast(d.error || "error"); return; }
        showToast(G_DELOK + " " + code);
        grpLoad();
      })
      .catch(function (e) { showToast(e.message); });
  }

  function grpSave() {
    var code = (document.getElementById("p082GrpCode").value || "").trim();
    var descT = (document.getElementById("p082GrpDesc").value || "").trim();
    var status = document.getElementById("p082GrpStatus").value;
    if (!code) { showToast(G_REQ); return; }
    apiPost(grpApi(), { connectionId: MAC5_CONNECTION_ID, action: "upsert", code: code, descT: descT, status: status })
      .then(function (d) {
        if (!d.ok) { showToast(d.error || "error"); return; }
        showToast(G_DONE + " " + code);
        grpResetForm();
        grpLoad();
      })
      .catch(function (e) { showToast(e.message); });
  }

  function closeGrpModal() {
    GRP_STATE.open = false;
    var ov = document.getElementById("p082GrpOverlay");
    if (ov) ov.classList.remove("show");
  }

  function openGrpModal(mode) {
    GRP_STATE.mode = mode;
    var ov = document.getElementById("p082GrpOverlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "p082GrpOverlay";
      ov.className = "p082-grp-overlay";
      ov.innerHTML =
        '<div class="p082-grp-modal">' +
          '<div class="p082-grp-head">' +
            "<h3 id=\"p082GrpTitle\"></h3>" +
            '<button class="p082-grp-x" id="p082GrpClose" type="button" title="' + G_CLOSE + '">✕</button>' +
          "</div>" +
          '<div class="p082-grp-body">' +
            '<div class="p082-grp-mode" id="p082GrpMode"><span class="dot"></span><span id="p082GrpModeText"></span><small>(' + G_SAVE + ')</small></div>' +
            '<form class="p082-grp-form" id="p082GrpForm">' +
              "<div><label>" + G_CODE + '</label><input id="p082GrpCode" maxlength="20" placeholder="1036-0300"></div>' +
              "<div><label>" + G_NAME + '</label><input id="p082GrpDesc" maxlength="120" placeholder=""></div>' +
              "<div><label>" + G_STAT + '</label><select id="p082GrpStatus"><option value="Active">' + G_ON + '</option><option value="Inactive">' + G_OFF + "</option></select></div>" +
              '<div class="p082-grp-btns">' +
                '<button class="p082-grp-save" type="submit">' + G_SAVE + "</button>" +
                '<button class="p082-grp-new" id="p082GrpNew" type="button">' + G_NEW + "</button>" +
              "</div>" +
            "</form>" +
            '<div id="p082GrpRows"></div>' +
          "</div>" +
        "</div>";
      document.body.appendChild(ov);

      ov.addEventListener("click", function (e) { if (e.target === ov) closeGrpModal(); });
      document.getElementById("p082GrpClose").addEventListener("click", closeGrpModal);
      document.getElementById("p082GrpNew").addEventListener("click", grpResetForm);
      document.getElementById("p082GrpForm").addEventListener("submit", function (e) {
        e.preventDefault();
        grpSave();
      });
      document.getElementById("p082GrpRows").addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("button[data-grp-edit],button[data-grp-del]") : null;
        if (!b) return;
        var ec = b.getAttribute("data-grp-edit");
        var dc = b.getAttribute("data-grp-del");
        if (ec) grpEdit(ec); else if (dc) grpDel(dc);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && GRP_STATE.open) closeGrpModal();
      });
    }
    document.getElementById("p082GrpTitle").textContent = GRP_TITLES[mode];
    GRP_STATE.open = true;
    GRP_STATE.rows = [];
    ov.classList.add("show");
    grpResetForm();
    grpLoad();
  }

  function addSettingsButtons() {
    var sw = document.getElementById("p082SettingsWrap");
    if (!sw || sw.firstChild) return;
    var b1 = document.createElement("button");
    b1.type = "button";
    b1.className = "p082-settings-btn";
    b1.textContent = "\u2699 " + GRP_TITLES.sp;
    b1.addEventListener("click", function () { openGrpModal("sp"); });
    var b2 = document.createElement("button");
    b2.type = "button";
    b2.className = "p082-settings-btn";
    b2.textContent = "\u2699 " + GRP_TITLES.bat;
    b2.addEventListener("click", function () { openGrpModal("bat"); });
    sw.appendChild(b1);
    sw.appendChild(b2);
  }


  function mount(mountEl) {
    root = mountEl;
    var oldg = document.getElementById("p082GrpOverlay");
    if (oldg) oldg.parentNode.removeChild(oldg);
    root.innerHTML = html();
    addSettingsButtons();
    if (!document.getElementById("p082Style")) {
      var st = document.createElement("style");
      st.id = "p082Style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    el.status = $("p082Status");
    el.genBtn = $("p082Gen");
    el.searchBtn = $("p082SearchBtn");
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
    el.resTables = $("p082ResTables");
    el.rows01 = $("p082Rows01");
    el.rowsSp = $("p082RowsSp");
    el.rowsQc = $("p082RowsQc");
    el.count01 = $("p082Count01");
    el.countSp = $("p082CountSp");
    el.countQc = $("p082CountQc");
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
