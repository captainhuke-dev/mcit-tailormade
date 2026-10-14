/* P081 — PickList By Route
 * IIFE — window.P081PickListRoute = { mount }
 * Data: MAC5 — api/p081_routes.php (สายส่ง) + api/p081_generate.php (ผลสร้างเอกสาร)
 * clone demo/P081_demo.html + C# AppPickListByRoute/frm_PickListByRouteGUI
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { routes: "api/p081_routes.php", generate: "api/p081_generate.php" };

  var GROUPS = ["G01", "G04", "G09", "G02", "G06", "RTV", "G03", "G07", "BKK"];
  var GROUPS_CHECKED = ["G01", "G04", "G02", "RTV", "G03", "BKK"];

  var STATUS_OPTIONS = [
    ["6", "6-ลูกค้ารบัเอง"],
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
    ["68", "68-test DEV"]
  ];

  var MONTHS_TH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  var root = null;
  var el = {};
  var state = { pages: [], meta: null, searched: false, loading: false, escBound: false };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      grid: '<path d="M3 3h18v18H3z"></path><path d="M9 3v18M3 9h18"></path>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(d) {
    // "2026-10-13" → "13/10/2569" (พ.ศ.)
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543);
  }

  function fmtDateLong(d) {
    // "2026-10-13" → "13 ตุลาคม 2569" (พ.ศ. — คล้าย C# th-TH "d MMMM yyyy")
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return parseInt(m[3], 10) + " " + MONTHS_TH[parseInt(m[2], 10) - 1] + " " + (parseInt(m[1], 10) + 543);
  }

  function fmtStamp(ts) {
    // "2026-10-14 09:30:00" → "14/10/2569 09:30:00" (พ.ศ.)
    var m = String(ts || "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2}:\d{2})/);
    if (!m) return String(ts || "");
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543) + " " + m[4];
  }

  function isoDate(d) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function showToast(msg, ms) {
    $("p081ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  function apiPost(url, payload) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function selectedWarehouses() {
    var out = [];
    document.querySelectorAll("#p081Groups input:checked").forEach(function (inp) {
      out.push(inp.value);
    });
    return out;
  }

  /* ---------- load routes ---------- */
  function loadRoutes() {
    apiPost(API.routes, { connectionId: MAC5_CONNECTION_ID })
      .then(function (data) {
        if (!data.ok || !data.rows || !data.rows.length) return;
        var sel = el.route;
        var cur = sel.value;
        var html = '<option value="all">All-ทั้ งหมด</option>';
        data.rows.forEach(function (r) {
          html += '<option value="' + esc(r.route) + '">' + esc(r.route) + "</option>";
        });
        sel.innerHTML = html;
        if (cur) sel.value = cur;
      })
      .catch(function () { /* อยูกั บ default ใน fallback */ });
  }

  /* ---------- generate ---------- */
  function doGenerate() {
    if (state.loading) return;
    var warehouses = selectedWarehouses();
    if (!warehouses.length) {
      showToast("โปรดยเลือกกลุ่ มคลังสินคา อยางนอย 1 ตัวเลือก");
      return;
    }
    state.loading = true;
    el.genBtn.classList.add("loading");
    el.genBtn.disabled = true;

    apiPost(API.generate, {
      connectionId: MAC5_CONNECTION_ID,
      dateFrom: el.dateFrom.value,
      dateTo: el.dateTo.value,
      status: el.status.value,
      groups: warehouses,
      route: el.route.value
    })
      .then(function (data) {
        state.loading = false;
        el.genBtn.classList.remove("loading");
        el.genBtn.disabled = false;
        if (!data.ok) {
          state.pages = [];
          state.meta = null;
          state.searched = true;
          render();
          showToast(data.error || "สร้างเอกสารไม่สำเร็จ");
          return;
        }
        state.pages = data.pages || [];
        state.meta = data;
        state.searched = true;
        render();
        openReport();
        showToast("สร้างเอกสาร " + data.count.toLocaleString("th-TH") + " สายส่ ง");
      })
      .catch(function (e) {
        state.loading = false;
        el.genBtn.classList.remove("loading");
        el.genBtn.disabled = false;
        showToast(e.message || "สร้างเอกสารไม่สำเร็จ");
      });
  }

  /* ---------- render ---------- */
  function render() {
    var pages = state.pages;
    var badge = pages.length.toLocaleString("th-TH") + " สายส่ ง";
    el.badge.textContent = badge;

    if (!state.searched) {
      el.tableContainer.style.display = "none";
      el.tableFooter.style.display = "none";
      el.emptyState.style.display = "flex";
      el.subtitle.textContent = "ยั งไมไ่ ด้สรางเอกสาร";
      return;
    }

    if (pages.length === 0) {
      el.tableContainer.style.display = "none";
      el.tableFooter.style.display = "none";
      el.emptyState.style.display = "flex";
      el.subtitle.textContent = "ไมพบ่ ้อมูลตามเงื่ ่อนไขทลี่ ือก";
      return;
    }

    el.tableContainer.style.display = "block";
    el.tableFooter.style.display = "flex";
    el.emptyState.style.display = "none";

    var routeLabel = el.route.value === "all" ? "All-ทั้ งหมด" : el.route.value;
    el.subtitle.textContent = "Route: " + routeLabel + " · วันที่เอกสาร " + fmtDate(el.dateFrom.value) + " ถึง " + fmtDate(el.dateTo.value);

    var html = "";
    pages.forEach(function (p, idx) {
      var padded = String(idx + 1);
      while (padded.length < 4) padded = "0" + padded;
      var doc = "PLR" + p.route + "-" + padded;
      var whMap = {};
      var wh = [];
      var itemCount = 0;
      p.items.forEach(function (it) {
        itemCount += it.rows.length;
        if (!whMap[it.sto]) { whMap[it.sto] = true; wh.push(it.sto); }
      });
      var whHtml = wh.map(function (w) { return '<span class="warehouse-tag">' + esc(w) + "</span>"; }).join("");
      html += "<tr>" +
        '<td class="center">' + (idx + 1) + "</td>" +
        '<td class="doc-number">' + esc(doc) + "</td>" +
        '<td class="center"><span class="route-tag">' + esc(p.route) + "</span></td>" +
        '<td class="center">' + fmtDate(el.dateTo.value) + "</td>" +
        "<td>" + whHtml + "</td>" +
        '<td class="center number">' + itemCount.toLocaleString("th-TH") + "</td>" +
        '<td><span class="status-tag">' + esc(statusLabel(el.status.value)) + "</span></td>" +
        "</tr>";
    });
    el.rows.innerHTML = html;

    el.footerText.textContent = "แสดง " + pages.length.toLocaleString("th-TH") + " สายส่ ง";
  }

  /* ---------- รายงาน A4 (clone C# bgWorker_DoWork) ---------- */
  function pageHtml(p, idx, total) {
    var html = '<section class="p081-page">';
    html += '<div class="p081-r-title"> PickList Summary [By Route_TMS] </div>';
    html += '<div class="p081-r-date"> ประจำวันที่ ' + esc(fmtDateLong(state.meta.headDate)) + "</div>";
    html += '<div class="p081-r-caption">พิมพ์เมื่ อ ' + esc(fmtStamp(state.meta.printedAt)) +
      ", โดย : " + esc(state.meta.machine) +
      ", สถานะ : " + esc(statusLabel(state.meta.status)) +
      ", Route : " + esc(p.route) + "</div>";

    html += '<table class="p081-r-table"><thead><tr>' +
      "<th>รหสั ,ชื่ อสินค้ า, <br>Route</th>" +
      "<th>ชื่ .olูกค้ า</th>" +
      "<th>เลขที่ ใบแจ้ งหนี้</th>" +
      "<th>วันที่ ใบแจ้ งหนี้</th>" +
      "<th>ปริมาน</th>" +
      "<th>คงเหลือ /<br>หนว่ ยนบั</th>" +
      "</tr></thead><tbody>";

    p.items.forEach(function (it) {
      // แถบหวั กลุ่ ม: รหสั +{คลัง}+ชื่ อ (colspan 3) | รวม | จำนวนรวม | คงเหลือ
      html += '<tr class="p081-r-group">' +
        '<td colspan="3">' + esc(it.stk) +
        ' <b>{' + esc(it.sto) + "}</b> " + esc(it.desc1) + " " + esc(it.desc2) + "</td>" +
        '<td class="p081-r-sumlabel"> รวม </td>' +
        '<td class="num">' + esc(it.grand) + "</td>" +
        '<td class="num">' + esc(it.remaining) + "</td>" +
        "</tr>";
      // คอลมั น์สายส่ ง (rowspan = จำนวนรายการ+1) + รายละเอยี ด
      var span = it.rows.length + 1;
      it.rows.forEach(function (r, n) {
        html += "<tr>";
        if (n === 0) html += '<td class="p081-r-route" rowspan="' + span + '">' + esc(p.route) + "</td>";
        html += "<td>" + esc(r.cusName) + " " + esc(r.contact) + "</td>" +
          '<td class="center">' + esc(r.vnos) + "</td>" +
          '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
          '<td class="num">' + esc(r.qty) + "</td>" +
          "<td>" + esc(r.unit) + "</td>" +
          "</tr>";
      });
      if (it.rows.length === 0) {
        html += '<tr><td class="p081-r-route">' + esc(p.route) + "</td>" +
          '<td class="p081-r-insum" colspan="5"> รวม ' + esc(it.grand) + "</td></tr>";
      }
    });

    html += "</tbody></table>";
    html += '<div class="p081-r-foot">Page ' + (idx + 1) + " of " + total + "</div>";
    html += "</section>";
    return html;
  }

  function reportDocHtml() {
    var css = [
      "@page{size:A4;margin:10mm}",
      ".p081-page{width:100%;font-family:'THSarabunNew','TH Sarabun New',sans-serif;color:#000}",
      ".p081-r-title{text-align:center;font-size:18px;font-weight:bold;margin:0 0 2px}",
      ".p081-r-date{text-align:center;font-size:15px;font-weight:bold;margin:0 0 4px}",
      ".p081-r-caption{font-size:12px;margin:0 0 6px}",
      ".p081-r-table{width:100%;border-collapse:collapse;table-layout:fixed}",
      ".p081-r-table th,.p081-r-table td{border:1px solid #000;padding:2px 4px;font-size:14px;vertical-align:middle}",
      ".p081-r-table th{background:#f0f0f0;text-align:center;font-weight:bold;font-size:14px}",
      ".p081-r-table th:nth-child(1),.p081-r-table td.p081-r-route{width:12.7%}",
      ".p081-r-table th:nth-child(2){width:40%}",
      ".p081-r-table th:nth-child(3),.p081-r-table th:nth-child(4){width:12.7%}",
      ".p081-r-table th:nth-child(5),.p081-r-table th:nth-child(6){width:10.9%}",
      ".p081-r-group td{background:#f0f0f0;font-weight:bold}",
      ".p081-r-group td.p081-r-sumlabel{text-align:center}",
      ".p081-r-table td.num{text-align:right}",
      ".p081-r-table td.center{text-align:center}",
      ".p081-r-route{text-align:center;font-weight:bold}",
      ".p081-r-insum{font-weight:bold}",
      ".p081-r-foot{text-align:right;font-size:12px;margin-top:4px}",
      "@media print{.p081-page{page-break-after:always}.p081-page:last-child{page-break-after:auto}}"
    ].join("\n");
    var inner = "";
    state.pages.forEach(function (p, i) { inner += pageHtml(p, i, state.pages.length); });
    return '<!doctype html><html><head><meta charset="utf-8"><title>PickList Summary</title><style>' + css + "</style></head><body>" + inner + "</body></html>";
  }

  /* ---------- modal แสดงรายงาน (แพทเทิรน์ ์เีดียวกับ P063) ---------- */
  function openReport() {
    var overlay = document.getElementById("p081ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p081ReportOverlay";
      overlay.className = "p081-rep-overlay";
      overlay.innerHTML =
        '<div class="p081-rep-modal">' +
          '<div class="p081-rep-head">' +
            '<div class="p081-rep-headtxt">' +
              '<div class="p081-rep-title">รายงาน PickList Summary [By Route_TMS]</div>' +
              '<div class="p081-rep-sub" id="p081RepSub"></div>' +
            "</div>" +
            '<div class="p081-rep-btns">' +
              '<button class="p081-rep-btn" type="button" id="p081RepNewWin" title="เปิ ดหน้ าต่างใหม้">↗</button>' +
              '<button class="p081-rep-btn" type="button" id="p081RepClose" title="ปิ ด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p081-rep-body"><iframe id="p081RepFrame" title="รายงาน PickList"></iframe></div>' +
          '<div class="p081-rep-foot">' +
            '<div class="p081-rep-hint">รายงาน A4 แยกหน้ าตอ่ สายส่ ง — พิมพ์จากหน้ านี้ไดโ้ ดยตรง (หรื อกด ↗ เพื่ อเปิ ดหน้ าต่างใหม้)</div>' +
            '<button class="p081-rep-btn p081-rep-btn-primary" type="button" id="p081RepPrint">พิมพ์</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p081RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p081RepNewWin").addEventListener("click", function () {
        var f = document.getElementById("p081RepFrame");
        var w = window.open("", "_blank", "width=900,height=1200");
        if (w && f) {
          try {
            w.document.open();
            w.document.write(f.contentDocument.documentElement.outerHTML);
            w.document.close();
          } catch (err) { /* ignore */ }
        }
      });
      overlay.querySelector("#p081RepPrint").addEventListener("click", function () {
        var f = document.getElementById("p081RepFrame");
        if (f && f.contentWindow) {
          try {
            f.contentWindow.focus();
            f.contentWindow.print();
            return;
          } catch (err) { /* ignore */ }
        }
        showToast("พิมพ์จาก iframe ไมไ่ ด้ — กด ↗ เพื่ อเปิ ดหน้ าต่างใหม้แลว้ พิมพ์จากนั่ น");
      });
      if (!state.escBound) {
        state.escBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    $("p081RepSub").textContent =
      state.pages.length + " สายส่ ง — " + fmtDateLong(state.meta.headDate) + " · " + statusLabel(state.meta.status);
    var f = overlay.querySelector("#p081RepFrame");
    f.srcdoc = reportDocHtml();
    overlay.classList.add("show");
  }

  function closeReport() {
    var overlay = document.getElementById("p081ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    var f = overlay.querySelector("#p081RepFrame");
    if (f) f.srcdoc = "";
  }

  function statusLabel(v) {
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      if (STATUS_OPTIONS[i][0] === v) return STATUS_OPTIONS[i][1];
    }
    return v;
  }

  /* ---------- CSS ---------- */
  var CSS = [
    ".p081-app{display:flex;flex-direction:column;gap:14px}",
    /* launcher */
    ".p081-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p081-launcher-titlebar{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;background:linear-gradient(90deg,#1e3a8a,#1d4ed8)}",
    ".p081-launcher-titlebar span{display:flex;align-items:center;gap:8px;color:#fff;font-size:14px;font-weight:700}",
    ".p081-launcher-titlebar svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p081-launcher-body{display:grid;grid-template-columns:1.3fr 1fr auto;gap:18px;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p081-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}",
    ".p081-field{display:block}",
    ".p081-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p081-input-wrap{position:relative}",
    ".p081-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p081-input-wrap input,.p081-input-wrap select{width:100%;height:42px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p081-input-wrap select{cursor:pointer;appearance:none}",
    ".p081-input-wrap input:focus,.p081-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p081-group-section{min-width:0}",
    ".p081-group-section label.group-title{display:block;margin-bottom:9px;color:#334155;font-size:12px;font-weight:700}",
    ".p081-group-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 10px}",
    ".p081-group-option{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;cursor:pointer}",
    ".p081-group-option input{width:16px;height:16px;accent-color:#2563eb;cursor:pointer}",
    ".p081-action-column{display:flex;align-items:center;justify-content:center}",
    ".p081-generate-button{display:flex;width:150px;min-height:86px;flex-direction:column;align-items:center;justify-content:center;gap:9px;color:#fff;border:0;border-radius:13px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 10px 22px rgba(37,99,235,0.28);font-size:14px;font-weight:700;transition:0.16s ease}",
    ".p081-generate-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}",
    ".p081-generate-button:disabled{opacity:0.7}",
    ".p081-generate-button svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p081-generate-button.loading svg{animation:p081spin 1s linear infinite}",
    "@keyframes p081spin{to{transform:rotate(360deg)}}",
    /* panel */
    ".p081-panel{display:flex;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p081-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p081-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p081-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p081-panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p081-panel-title h2{overflow:hidden;font-size:14px;color:#172033;text-overflow:ellipsis;white-space:nowrap}",
    ".p081-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p081-badge{padding:5px 10px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p081-table-container{min-height:0;flex:1;overflow:auto}",
    ".p081-table{width:100%;min-width:980px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p081-table th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p081-table td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4;color:#172033}",
    ".p081-table th.center,.p081-table td.center{text-align:center}",
    ".p081-table th.number,.p081-table td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p081-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p081-table tbody tr:hover{background:#f0f7ff}",
    ".route-tag{display:inline-flex;min-width:32px;justify-content:center;padding:3px 9px;color:#1d4ed8;border-radius:7px;background:#dbeafe;font-family:Arial,sans-serif;font-size:11px;font-weight:700}",
    ".doc-number{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".warehouse-tag{display:inline-flex;padding:3px 8px;margin:1px;color:#047857;border-radius:6px;background:#d1fae5;font-family:Arial,sans-serif;font-size:10px;font-weight:700}",
    ".status-tag{display:inline-flex;padding:3px 9px;color:#92400e;border-radius:7px;background:#fef3c7;font-size:11px;font-weight:700;white-space:normal}",
    ".p081-empty-state{display:flex;min-height:320px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p081-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p081-empty-state p{margin-top:5px;font-size:11px}",
    ".p081-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    /* toast */
    ".p081-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p081-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    /* report overlay */
    ".p081-rep-overlay{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,0.55)}",
    ".p081-rep-overlay.show{display:flex}",
    ".p081-rep-modal{display:flex;flex-direction:column;overflow:hidden;width:100%;max-width:960px;max-height:92vh;border-radius:14px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.35)}",
    ".p081-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}",
    ".p081-rep-title{font-size:15px;font-weight:700;color:#0f172a}",
    ".p081-rep-sub{margin-top:2px;color:#64748b;font-size:12px}",
    ".p081-rep-btns{display:flex;gap:8px}",
    ".p081-rep-btn{padding:6px 12px;color:#334155;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer}",
    ".p081-rep-btn:hover{background:#e2e8f0}",
    ".p081-rep-btn-primary{color:#fff;border-color:#0a5bc4;background:#0a5bc4}",
    ".p081-rep-btn-primary:hover{background:#084a9e}",
    ".p081-rep-body{flex:1;min-height:0;overflow:hidden;padding:12px;background:#f1f5f9}",
    ".p081-rep-body iframe{width:100%;height:100%;min-height:520px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}",
    ".p081-rep-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-top:1px solid #e2e8f0}",
    ".p081-rep-hint{color:#64748b;font-size:12px}",
    "@media (max-width:1000px){.p081-launcher-body{grid-template-columns:1fr}.p081-action-column{justify-content:stretch}.p081-generate-button{width:100%;min-height:54px;flex-direction:row}.p081-field-grid{grid-template-columns:1fr}.p081-group-grid{grid-template-columns:repeat(2,1fr)}}",
    "@media (max-width:680px){.p081-panel-header{align-items:flex-start;flex-direction:column}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  function groupOptionsHtml() {
    var html = "";
    GROUPS.forEach(function (g) {
      var checked = GROUPS_CHECKED.indexOf(g) >= 0 ? " checked" : "";
      html += '<label class="p081-group-option"><input type="checkbox" value="' + esc(g) + '"' + checked + ">" + esc(g) + "</label>";
    });
    return html;
  }

  function statusOptionsHtml() {
    var html = "";
    STATUS_OPTIONS.forEach(function (s) {
      var sel = s[0] === "6" ? " selected" : "";
      html += '<option value="' + esc(s[0]) + '"' + sel + ">" + esc(s[1]) + "</option>";
    });
    return html;
  }

  function buildHtml() {
    return '<div class="p081-app">' +
      // launcher card
      '<section class="p081-launcher-card">' +
        '<div class="p081-launcher-titlebar"><span>' + icon("grid") + "PickList By Route</span></div>" +
        '<form class="p081-launcher-body" id="p081Form">' +
          '<div class="p081-field-grid">' +
            '<div class="p081-field"><label for="p081DateFrom">วันที่เอกสาร</label>' +
              '<div class="p081-input-wrap">' + icon("cal") + '<input id="p081DateFrom" type="date"></div></div>' +
            '<div class="p081-field"><label for="p081DateTo">จนถึ ง</label>' +
              '<div class="p081-input-wrap">' + icon("cal") + '<input id="p081DateTo" type="date"></div></div>' +
            '<div class="p081-field"><label for="p081HeadDate">วันที่หวัเอกสาร</label>' +
              '<div class="p081-input-wrap">' + icon("cal") + '<input id="p081HeadDate" type="date"></div></div>' +
            '<div class="p081-field"><label for="p081Route">Route</label>' +
              '<div class="p081-input-wrap">' + icon("chevron") + '<select id="p081Route"><option value="all" selected>All-ทั้ งหมด</option></select></div></div>' +
            '<div class="p081-field" style="grid-column:1 / -1"><label for="p081Status">สถานะใบแจ้ งหนี้</label>' +
              '<div class="p081-input-wrap">' + icon("chevron") + '<select id="p081Status">' + statusOptionsHtml() + "</select></div></div>" +
          "</div>" +
          '<div class="p081-group-section">' +
            '<label class="group-title">กลุ่ มคลังสืนคา</label>' +
            '<div class="p081-group-grid" id="p081Groups">' + groupOptionsHtml() + "</div>" +
          "</div>" +
          '<div class="p081-action-column">' +
            '<button class="p081-generate-button" id="p081GenBtn" type="submit">' + icon("plus") + "สรา้ งเอกสาร</button>" +
          "</div>" +
        "</form>" +
      "</section>" +
      // results panel
      '<section class="p081-panel">' +
        '<div class="p081-panel-header">' +
          '<div class="p081-panel-heading">' +
            '<div class="p081-panel-icon">' + icon("grid") + "</div>" +
            '<div class="p081-panel-title"><h2>ผลสรา้ งเอกสาร PickList</h2><p id="p081Subtitle">ยังไมไดสรางเอกสาร</p></div>' +
          "</div>" +
          '<span class="p081-badge" id="p081Badge">0 รายการ</span>' +
        "</div>" +
        '<div class="p081-table-container" id="p081TableContainer" style="display:none"><table class="p081-table"><thead><tr>' +
          '<th class="center">ลำดบั</th>' +
          "<th>เลขที่เอกสาร</th>" +
          '<th class="center">Route</th>' +
          '<th class="center">วันที่</th>' +
          "<th>กลุ่ มคลัง</th>" +
          '<th class="center number">จำนวนรายการ</th>' +
          "<th>สถานะ</th>" +
        '</tr></thead><tbody id="p081Rows"></tbody></table></div>' +
        '<div class="p081-empty-state" id="p081EmptyState"><div>' + icon("grid") +
          "<strong>ยังไมมีเอกสารที่สราง</strong><p>กำหนดเงื่ อนไขดำนบน แลว้ กด \"สรา้ งเอกสาร\"</p></div></div>" +
        '<div class="p081-table-footer" id="p081TableFooter" style="display:none"><span id="p081FooterText">แสดง 0 รายการ</span></div>' +
      "</section>" +
      // toast
      '<div class="p081-toast" id="p081Toast"><span id="p081ToastMsg"></span></div>' +
    "</div>";
  }

  /* ---------- mount ---------- */
  function mount(target) {
    root = target;
    var style = document.createElement("style");
    style.textContent = CSS;
    target.appendChild(style);
    target.insertAdjacentHTML("beforeend", buildHtml());

    el.dateFrom = $("p081DateFrom");
    el.dateTo = $("p081DateTo");
    el.headDate = $("p081HeadDate");
    el.route = $("p081Route");
    el.status = $("p081Status");
    el.genBtn = $("p081GenBtn");
    el.badge = $("p081Badge");
    el.rows = $("p081Rows");
    el.tableContainer = $("p081TableContainer");
    el.emptyState = $("p081EmptyState");
    el.tableFooter = $("p081TableFooter");
    el.footerText = $("p081FooterText");
    el.subtitle = $("p081Subtitle");
    el.toast = $("p081Toast");

    // default: from = วันนี้-1, to/หวั = วันนี้ (clone C# DateTime.Today.AddDays(-1))
    var today = new Date();
    var yesterday = new Date(today.getTime());
    yesterday.setDate(yesterday.getDate() - 1);
    el.dateFrom.value = isoDate(yesterday);
    el.dateTo.value = isoDate(today);
    el.headDate.value = isoDate(today);

    loadRoutes();

    $("p081Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doGenerate();
    });

    render();
  }

  window.P081PickListRoute = { mount: mount };
})();
