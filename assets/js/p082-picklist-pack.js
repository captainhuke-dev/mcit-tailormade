
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
    searchRows: [], zone01: [], sp: [], qc: [], view: null, searching: false,
    zoom: 100, escBound: false, paperHtml: "", sections: [], products: 0, filters: null
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
  var API = { search: "api/p082_search.php", generate: "api/p082_generate.php", spGroups: "api/p082_sparepart_groups.php", batGroups: "api/p082_battery_groups.php" };

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
          state.zone01 = [];
          state.sp = [];
          state.qc = [];
          el.rows01.innerHTML = "";
          el.rowsSp.innerHTML = "";
          el.rowsQc.innerHTML = "";
          el.count01.textContent = "0";
          el.countSp.textContent = "0";
          el.countQc.textContent = "0";
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
    if (state.searching) return;
    state.searching = true;
    el.genBtn.disabled = true;
    el.genBtn.classList.add("loading");
    apiPost(API.generate, { connectionId: MAC5_CONNECTION_ID, status: el.status.value })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        var titles = { sp: "PickList [To Pack][Zone SparePart]", qc: "PickList [To Pack][Zone QC]", z01: "PickList [To Pack][Zone 01]" };
        var sections = [];
        for (var i = 0; i < d.sections.length; i++) {
          var s = d.sections[i];
          var products = [];
          for (var a = 0; a < s.items.length; a++) {
            var it = s.items[a];
            var customers = [];
            for (var b = 0; b < it.rows.length; b++) {
              var rr = it.rows[b];
              customers.push({ name: rr.name + " " + rr.contact, document: rr.vnos, date: rr.date, qty: rr.qty, unit: rr.unit });
            }
            products.push({ productCode: it.stk, productName: it.desc1, totalQty: it.grand + "     " + it.unit, warehouse: it.sto, customers: customers });
          }
          sections.push({ title: titles[s.key] || ("PickList [To Pack][" + s.key + "]"), products: products });
        }
        state.filters = { status: el.status.value };
        state.sections = sections;
        state.products = d.count;
        var mStatus = statusLabel(el.status.value);
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
        el.genBtn.classList.remove("loading");
      });
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
    ".p082-panel-header{display:flex;min-height:40px;align-items:center;justify-content:space-between;gap:12px;padding:6px 15px;border-bottom:1px solid #dbe3ef}",
    ".p082-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p082-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p082-panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p082-panel-title h2{margin:0;overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
    ".p082-panel-title p{overflow:hidden;margin:1px 0 0;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p082-mode-badge{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p082-header-right{display:flex;align-items:center;gap:10px}",
    ".p082-header-actions{display:flex;align-items:center;gap:8px}",
    ".p082-header-actions .p082-action-button{min-height:34px;width:140px;flex-direction:row;gap:6px;padding:5px 10px;border-radius:9px;font-size:12px}",
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
    "@media (max-width:680px){.p082-panel-header{align-items:flex-start;flex-direction:column}}",
    ".p082-rep-overlay{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,0.55)}",
    ".p082-rep-overlay.show{display:flex}",
    ".p082-rep-modal{display:flex;flex-direction:column;overflow:hidden;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.35)}",
    ".p082-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}",
    ".p082-rep-title{font-size:15px;font-weight:700;color:#0f172a}",
    ".p082-rep-sub{margin-top:2px;color:#64748b;font-size:12px}",
    ".p082-rep-btns{display:flex;gap:8px}",
    ".p082-rep-btn{padding:6px 12px;color:#334155;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer}",
    ".p082-rep-btn:hover{background:#e2e8f0}",
    ".p082-rep-zoomlabel{display:inline-flex;min-width:48px;align-items:center;justify-content:center;color:#334155;font-size:12px;font-weight:600}",
    ".p082-rep-btn-primary{color:#fff;border-color:#0a5bc4;background:#0a5bc4}",
    ".p082-rep-btn-primary:hover{background:#084a9e}",
    ".p082-rep-body{flex:1;min-height:0;overflow:auto;padding:12px;background:#f1f5f9}",
    ".p082-rep-body iframe{width:100%;height:100%;min-height:520px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}",
    ".p082-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-top:1px solid #e2e8f0}",
    ".p082-rep-hint{color:#64748b;font-size:12px}"
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
              "<h2>" + "PickList To Pack" + "</h2>" +
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

  /* ---------- report (clone C# frm_PickListToPack + P083 modal pattern) ---------- */
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
function machineName() {
    if (window.ERP_USER && window.ERP_USER.name) return window.ERP_USER.name;
    return "PORTAL";
  }
function reportDocHtml(paperInner) {
    // C# A4: Document(PageSize.A4, 20f, 20f, 30f, 30f) = left 20pt right 20pt top 30pt bottom 30pt
    var css = [
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
      "@page{size:A4;margin:30pt 20pt}",
      "body{margin:0;background:#f1f5f9}",
      ".p082-page{box-sizing:border-box;display:flex;flex-direction:column;width:210mm;height:297mm;overflow:hidden;margin:0 auto;padding:30pt 20pt;background:#fff;font-family:'THSarabunNew','TH Sarabun New',Arial,sans-serif;color:#000}",
      ".p082-page+.p082-page{margin-top:10px}",
      ".p082-pagefoot{margin-top:auto;text-align:left;font-size:12pt}",
      ".p082-paper-title{text-align:center;font-size:18pt;font-weight:bold;margin:0 0 6px}",
      ".p082-paper-meta{font-size:14pt;margin:0 0 5px}",
      ".p082-table{width:560pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
      ".p082-table th{padding:2px 4px 5px;background:#e6e6e6;text-align:center;font-size:14pt;font-weight:bold}",
      ".p082-table th,.p082-table td{border:1px solid #000}",
      ".p082-table td{padding:2px 4px;font-size:14pt;vertical-align:middle}",
      ".p082-grow td{padding:2px 4px 5px;background:#f8f8f8;font-size:14pt}",
      ".p082-grow .p082-qty{border:1px solid #000;border-right:none;text-align:left}",
      ".p082-grow .p082-whcell{border:1px solid #000;border-left:none;text-align:right;vertical-align:bottom}",
      ".p082-crow td{font-size:14pt}",
      ".p082-crow td.center{text-align:center}",
      ".p082-crow td.right{text-align:right;padding-right:5px}",
      "@media print{body{display:block;background:#fff;zoom:1}.p082-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;background:#fff;box-shadow:none;page-break-after:always}.p082-page:last-child{page-break-after:auto}.p082-table tr{page-break-inside:avoid}}"
    ].join("\n");
    var fit = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};" +
      "function rowOver(row){var s=row.closest('section.p082-page');if(!s)return false;var sr=s.getBoundingClientRect();var lr=row.getBoundingClientRect();var pb=parseFloat(getComputedStyle(s).paddingBottom)||0;return lr.bottom>sr.bottom-pb}" +
      "function renumber(){var s=document.querySelectorAll('section.p082-page');for(var i=0;i<s.length;i++){var f=s[i].querySelector('.p082-pgno');if(f)f.textContent=i+1}}" +
      "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p082-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){if(!s.classList.contains('p082-cont'))groups.push([s]);else groups[groups.length-1].push(s)});groups.forEach(function(g){var first=g[0];var t=first.querySelector('table');for(var i=1;i<g.length;i++){var t2=g[i].querySelector('table');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);g[i].parentNode.removeChild(g[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);if(curT.tBodies[0].rows.length>1&&rowOver(row)){curT.tBodies[0].removeChild(row);var s2=document.createElement('section');s2.className='p082-page p082-cont';var ht=first.querySelector('.p082-paper-title');var mt=first.querySelector('.p082-paper-meta');s2.innerHTML=(ht?'<h1 class=\\\"p082-paper-title\\\">'+ht.textContent+'</h1>':'')+(mt?'<div class=\\\"p082-paper-meta\\\">'+mt.innerHTML+'</div>':'')+'<table class=\\\"p082-table\\\">'+(t.querySelector('colgroup')?t.querySelector('colgroup').outerHTML:'')+'<thead>'+t.tHead.innerHTML+'</thead><tbody></tbody></table>'+'<div class=\\\"p082-pagefoot\\\">'+'หน้่า '+'<span class=\\\"p082-pgno\\\">1</span>'+'</div>';cur.parentNode.insertBefore(s2,cur.nextSibling);cur=s2;curT=s2.querySelector('table');curT.tBodies[0].appendChild(row)}})});renumber()}" +
      "function runPag(){fit();pag()}if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";
    return '<!doctype html><html><head><meta charset="utf-8"><title>PickList To Load</title><style>' + css + "</style></head><body>" + paperInner + fit + "</body></html>";
  }
  function openReport() {
    var overlay = document.getElementById("p082ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p082ReportOverlay";
      overlay.className = "p082-rep-overlay";
      overlay.innerHTML =
        '<div class="p082-rep-modal">' +
          '<div class="p082-rep-head">' +
            "<div>" +
              '<div class="p082-rep-title">' + "อกสาร" + " PickList To Pack" + "</div>" +
              '<div class="p082-rep-sub" id="p082RepSub"></div>' +
            "</div>" +
            '<div class="p082-rep-btns">' +
              '<button class="p082-rep-btn" type="button" id="p082RepZoomOut" title="zoom out">\u2212</button>' +
              '<span class="p082-rep-zoomlabel" id="p082RepZoom">100%</span>' +
              '<button class="p082-rep-btn" type="button" id="p082RepZoomIn" title="zoom in">+</button>' +
              '<button class="p082-rep-btn" type="button" id="p082RepClose" title="close (Esc)">\u2715</button>' +
            "</div>" +
          "</div>" +
          '<div class="p082-rep-body"><iframe id="p082RepFrame" title="PickList To Pack"></iframe></div>' +
          '<div class="p082-rep-foot">' +
            '<div class="p082-rep-hint">' + "อกสาร" + " A4 \u2014 " + "พิมพ์" + "</div>" +
            '<button class="p082-rep-btn p082-rep-btn-primary" type="button" id="p082RepPrint">' + "พิมพ์" + "</button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) { if (e.target === overlay) closeReport(); });
      overlay.querySelector("#p082RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p082RepZoomOut").addEventListener("click", function () { setZoomLevel(state.zoom - 25); });
      overlay.querySelector("#p082RepZoomIn").addEventListener("click", function () { setZoomLevel(state.zoom + 25); });
      overlay.querySelector("#p082RepPrint").addEventListener("click", function () {
        var f = $("p082RepFrame");
        if (f && f.contentWindow) { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (err) { } }
      });
      if (!state.escBound) {
        state.escBound = true;
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeReport(); });
      }
    }
    $("p082RepSub").textContent = statusLabel(state.filters.status) + " \u2014 " + state.products + " " + "จำนวน";
    var zb = overlay.querySelector("#p082RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    var f = overlay.querySelector("#p082RepFrame");
    f.srcdoc = reportDocHtml(state.paperHtml);
    overlay.classList.add("show");
    overlay.style.display = "flex";
    applyZoom();
  }

function setZoomLevel(z) {
    state.zoom = Math.max(50, Math.min(200, z));
    var zb = $("p082RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    applyZoom();
  }

  function applyZoom() {
    var f = $("p082RepFrame");
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
    var overlay = $("p082ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.style.display = "none";
    var f = overlay.querySelector("#p082RepFrame");
    if (f) f.srcdoc = "";
  }
  function sectionTable(products) {
    var w = ["70","220","70","70","60","30","35"];
    var cg = "<colgroup>";
    for (var x = 0; x < w.length; x++) cg += '<col style="width:' + w[x] + 'pt">';
    cg += "</colgroup>";
    var h = "<table class=\"p082-table\">" + cg + "<thead><tr>"
      + "<th>" + "รหัส + ชื่อสินค้า" + "</th>"
      + "<th>" + "ชื่อลูกค้า" + "</th>"
      + "<th>" + "เลขที่ใบสำคัญ" + "</th>"
      + "<th>" + "วันที่" + "</th>"
      + "<th>" + "จำนวน" + "</th>"
      + '<th colspan="2">' + "หน่วย/คลัง" + "</th>"
      + "</tr></thead><tbody>";
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      h +=
        '<tr class="p082-grow">'
        + '<td colspan="4"><b>' + esc(p.productCode) + ", </b>" + esc(p.productName) + "</td>"
        + '<td colspan="2" class="p082-qty"><b>' + p.totalQty + "</b></td>"
        + '<td class="p082-whcell"><b>[' + esc(p.warehouse) + "]</b></td>"
        + "</tr>";
      for (var j = 0; j < p.customers.length; j++) {
        var c = p.customers[j];
        h +=
          '<tr class="p082-crow">'
          + "<td></td>"
          + '<td class="p082-cust">' + esc(c.name) + "</td>"
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
      '<section class="p082-page">'
      + '<h1 class="p082-paper-title">' + esc(sec.title) + "</h1>"
      + '<div class="p082-paper-meta">'
      + "<b>" + "สถานะ" + ' : </b>' + esc(mStatus)
      + "    <b>" + "พิมพ์เมื่อ" + ' : </b>' + esc(mPrinted)
      + "    <b>" + "พิมพ์เมื่อ" + ' : </b>' + esc(mUser)
      + "</div>"
      + sectionTable(sec.products)
      + '<div class="p082-pagefoot">' + "หน้่า" + ' <span class="p082-pgno">1</span></div>'
      + "</section>"
    );
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
    var oldr = document.querySelectorAll("body > .p082-rep-overlay");
    for (var ri = 0; ri < oldr.length; ri++) oldr[ri].parentNode.removeChild(oldr[ri]);
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
