
/* P080 — PickList QC
 * IIFE — window.P080PickListQC = { mount }
 * clone demo/P080_demo.html + C# AppPackingListBucketParts/FrmPackingListBatteryGUI:
 *   - ปุ่ มค้นหา → api/p080_search.php (ตาราง 5 คอลั่ ม)
 *   - ปุ่ มสร้างรายงาน → api/p080_generate.php → modal รายงาน A4 "Pick List QC" (หัวกลุ่ ม)
 *   - ปุ่ มสร้างรายงาน (ซ่อนชื่อสินค้า) → modal รายงาน A4 "Packing List ช่าง" (flat + หน้า barcode)
 * รายงาน modal clone pattern P081 (srcdoc iframe + paginate + zoom + print)
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

  var MONTHS_TH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  var root = null;
  var el = {};
  var state = {
    searchRows: [], view: null, searching: false,
    loading: false, report: null, reportMode: "qc", zoom: 100, escBound: false
  };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path>',
      eyeoff: '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.4 10.4 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><path d="M1 1l22 22"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      check: '<path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      chevron: '<path d="m6 9 6 6 6-6"></path>',
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(d) {
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543);
  }

  function fmtDateLong(d) {
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return parseInt(m[3], 10) + " " + MONTHS_TH[parseInt(m[2], 10) - 1] + " " + (parseInt(m[1], 10) + 543);
  }

  function fmtStamp(ts) {
    var m = String(ts || "").match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2}:\d{2})/);
    if (!m) return String(ts || "");
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543) + " " + m[4];
  }

  function isoDate(d) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function statusLabel(v) {
    for (var i = 0; i < STATUS_OPTIONS.length; i++) {
      if (STATUS_OPTIONS[i][0] === v) return STATUS_OPTIONS[i][1];
    }
    return v;
  }

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { search: "api/p080_search.php", generate: "api/p080_generate.php" };

  function apiPost(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function showToast(msg, ms) {
    $("p080ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  /* ---------- ค้นหา (api/p080_search.php) ---------- */
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
          showToast("ไม่พบรายการตามเงื่ อนไขที่ค้ นหา");
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

  /* ---------- สร้างรายงาน (ปกติ / ซ่อนชื่อสินค้า) — api/p080_generate.php ---------- */
  function doGenerate(hideNames) {
    if (state.loading) return;
    state.loading = true;
    el.genNormalBtn.disabled = true;
    el.genNormalBtn.classList.add("loading");

    apiPost(API.generate, {
      connectionId: MAC5_CONNECTION_ID,
      status: el.status.value,
      headDate: el.headDate.value
    })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error);
        if (d.count === 0) {
          showToast("ไม่พบรายการสินค้า Packing List");
          return;
        }
        state.report = d;
        state.reportMode = hideNames ? "tech" : "qc";
        openReport();
        showToast("สร้างรายงาน " + d.count + " รายการ" + (hideNames ? " (ซ่อนชื่อสินค้า)" : ""));
      })
      .catch(function (e) {
        showToast("สร้างรายงานไม่สำเร็จ: " + e.message);
      })
      .then(function () {
        state.loading = false;
        el.genNormalBtn.disabled = false;
        el.genNormalBtn.classList.remove("loading");
      });
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
    el.modeBadge.className = "p080-mode-badge search";
    el.subtitle.textContent = "สถานะ " + statusLabel(el.status.value) + " · " + fmtDate(el.headDate.value);
    var html = "";
    rows.forEach(function (r) {
      html += "<tr>" +
        '<td class="p080-product-code">' + esc(r.STKcode) + "</td>" +
        '<td class="center">' + esc(r.STKgroup) + "</td>" +
        "<td>" + esc(r.STKdescT1) + "</td>" +
        "<td>" + esc(r.STKdescT2) + "</td>" +
        '<td class="center number">' + (r.SBLqty == null ? "" : esc(r.SBLqty)) + "</td>" +
        "</tr>";
    });
    el.searchRows.innerHTML = html;
    el.footerText.textContent = "แสดง " + rows.length + " รายการ";
  }

  /* ---------- รายงาน A4 (clone C# bgWorker_DoWork / bgWorker_DoWork_TEST + pattern P081) ----------
     mode "qc"   = "Pick List QC" — หัวกลุ่ ม (STGcode : STGdescT) + ชื่อสินค้า T1+T2
     mode "tech" = "Packing List ช่าง" — flat (ไม่มี หัวกลุ่ ม, ชื่ อ T1) + หน้า barcode */
  function itemRowsHtml(items, hideNames) {
    var body = "";
    items.forEach(function (it) {
      var desc = hideNames ? esc(it.stk) + "  " + esc(it.desc1)
        : esc(it.stk) + "  " + esc(it.desc1) + " " + esc(it.desc2);
      body += '<tr class="p080-r-item">' +
        '<td colspan="3">' + desc + "</td>" +
        '<td class="p080-r-sumlabel"> รวม </td>' +
        '<td class="num">' + esc(it.grand) + "</td>" +
        '<td class="num">' + esc(it.remaining) + "</td>" +
        "</tr>";
      var span = it.rows.length;
      it.rows.forEach(function (r, n) {
        body += "<tr>";
        if (n === 0) body += '<td class="p080-r-blank" rowspan="' + span + '">&nbsp;</td>';
        body += "<td>" + esc(r.cusName) + " " + esc(r.contact) + "</td>" +
          '<td class="center">' + esc(r.vnos) + "</td>" +
          '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
          '<td class="num">' + esc(r.qty) + "</td>" +
          "<td>" + esc(r.unit) + "</td>" +
          "</tr>";
      });
    });
    return body;
  }

  function reportSectionHtml(inner, idx, total, rgrp) {
    return '<section class="p080-page" data-rgrp="' + rgrp + '">' +
      '<div class="p080-r-foot">Page ' + (idx + 1) + " of " + total + "</div>" +
      inner +
      "</section>";
  }

  function reportDocHtml() {
    var d = state.report;
    var isTech = state.reportMode === "tech";
    var title = isTech ? " Packing List ช่าง" : " Pick List QC";
    var lastCol = isTech ? "คงเหลือ /\nหน่วยนับ" : "คงเหลือ\n( 01,03,04 )";

    var css = [
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
      "@page{size:A4;margin:25pt 20pt}",
      "body{margin:0;background:#f1f5f9}",
      ".p080-page{box-sizing:border-box;display:flex;flex-direction:column;width:210mm;height:297mm;overflow:hidden;margin:0 auto;padding:25pt 20pt;background:#fff;font-family:'THSarabunNew','TH Sarabun New',sans-serif;color:#000}",
      ".p080-r-title{text-align:center;font-size:16pt;font-weight:bold;margin:0 0 2px}",
      ".p080-r-date{text-align:center;font-size:14pt;font-weight:bold;margin:0 0 4px}",
      ".p080-r-caption{font-size:12pt;margin:0 0 6px}",
      ".p080-r-table{width:100%;border-collapse:collapse;table-layout:fixed}",
      ".p080-r-table th,.p080-r-table td{border:1px solid #000;padding:2px 4px;font-size:12pt;vertical-align:middle}",
      ".p080-r-table th{background:#f0f0f0;text-align:center;font-weight:bold;font-size:12pt;white-space:normal}",
      ".p080-r-item td{background:#f0f0f0;font-weight:bold}",
      ".p080-r-item td.p080-r-sumlabel{text-align:center}",
      ".p080-r-table td.num{text-align:right}",
      ".p080-r-table td.center{text-align:center}",
      ".p080-r-blank{text-align:center}",
      ".p080-r-group td{font-size:12pt;padding:3px 4px}",
      ".p080-r-spacer td{border:0;height:6pt;padding:0}",
      ".p080-r-foot{text-align:right;font-size:10pt;margin:0 0 4px}",
      ".p080-r-barcode{height:340pt;text-align:center;vertical-align:middle;font-size:72pt;font-weight:bold;font-family:Arial,sans-serif}",
      ".p080-r-bartable{width:100%}",
      ".p080-page+.p080-page{margin-top:10px}",
      "@media print{body{display:block;background:#fff;zoom:1}.p080-page{width:100%;height:auto;min-height:0;overflow:visible;padding:0;background:#fff;page-break-after:always}.p080-page:last-child{page-break-after:auto;margin-top:0}.p080-r-table tr{page-break-inside:auto}}"
    ].join("\n");

    var thead = "<thead><tr>" +
      "<th>รหัส,ชื่อสินค้า</th>" +
      "<th>ชื่อลูกค้า</th>" +
      "<th>เลขที่ใบแจ้งหนี้</th>" +
      "<th>วันที่ใบแจ้งหนี้</th>" +
      "<th>ปริมาณ</th>" +
      "<th>" + esc(lastCol) + "</th>" +
      "</tr></thead>";

    var cg = "<colgroup><col style=\"width:70pt\"><col style=\"width:220pt\"><col style=\"width:70pt\"><col style=\"width:70pt\"><col style=\"width:60pt\"><col style=\"width:60pt\"></colgroup>";

    var head = '<div class="p080-r-title">' + esc(title) + "</div>" +
      '<div class="p080-r-date"> ประจำวันที่ ' + esc(fmtDateLong(d.headDate)) + "</div>" +
      '<div class="p080-r-caption">พิมพ์เมื่อ ' + esc(fmtStamp(d.printedAt)) +
      "  โดย : " + esc(d.machine) + "</div>";

    var body = "";
    if (isTech) {
      body = itemRowsHtml(d.items, true);
    } else {
      d.groups.forEach(function (g, gi) {
        if (g.label) {
          body += '<tr class="p080-r-group"><td colspan="6">' + esc(g.label) + "</td></tr>";
        }
        body += itemRowsHtml(g.items, false);
        if (gi < d.groups.length - 1) {
          body += '<tr class="p080-r-spacer"><td colspan="6">&nbsp;</td></tr>';
        }
      });
    }

    var mainInner = head + '<table class="p080-r-table">' + cg + thead + "<tbody>" + body + "</tbody></table>";

    var barInner = "";
    if (isTech && d.barcodes && d.barcodes.length) {
      var barRows = "";
      d.barcodes.forEach(function (code) {
        barRows += "<tr><td class=\"p080-r-barcode\">" + esc(code) + "</td></tr>";
      });
      barInner = '<table class="p080-r-table p080-r-bartable"><colgroup><col style="width:100%"></colgroup><tbody>' + barRows + "</tbody></table>";
    }

    var inner = reportSectionHtml(mainInner, 0, 1, "main");
    if (barInner) inner += reportSectionHtml(barInner, 0, 1, "bar");

    var fit = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};" +
      "function sheetOver(sec){var t=sec.querySelector('table');if(!t)return false;var tb=t.tBodies[0];var last=tb.rows[tb.rows.length-1];if(!last)return false;var sr=sec.getBoundingClientRect();var lr=last.getBoundingClientRect();var pb=parseFloat(getComputedStyle(sec).paddingBottom)||0;return lr.bottom>sr.bottom-pb}" +
      "function renumber(){var byG={};var s=document.querySelectorAll('section.p080-page');for(var i=0;i<s.length;i++){var g=s[i].getAttribute('data-rgrp')||'main';byG[g]=(byG[g]||0)+1}var n={};for(var i=0;i<s.length;i++){var g=s[i].getAttribute('data-rgrp')||'main';n[g]=(n[g]||0)+1;s[i].querySelector('.p080-r-foot').textContent='Page '+n[g]+' of '+byG[g]}}" +
      "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p080-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){var g=s.getAttribute('data-rgrp')||'main';var last=groups[groups.length-1];if(last&&last.g===g)last.secs.push(s);else groups.push({g:g,secs:[s]})});groups.forEach(function(grp){var first=grp.secs[0];var t=first.querySelector('table');if(!t)return;for(var i=1;i<grp.secs.length;i++){var g2=grp.secs[i].querySelector('table');while(g2.tBodies[0].rows.length)t.tBodies[0].appendChild(g2.tBodies[0].rows[0]);grp.secs[i].parentNode.removeChild(grp.secs[i])}var thead=t.querySelector('thead');var theadHtml=thead?thead.outerHTML:'';var cgEl=t.querySelector('colgroup');var cgHtml=cgEl?cgEl.outerHTML:'';var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){var had=curT.tBodies[0].rows.length;curT.tBodies[0].appendChild(row);if(had&&sheetOver(cur)){curT.tBodies[0].removeChild(row);var s2=document.createElement('section');s2.className='p080-page p080-cont';s2.setAttribute('data-rgrp',grp.g);s2.innerHTML='<div class=\\\"p080-r-foot\\\"></div><table class=\\\"p080-r-table\\\">'+cgHtml+theadHtml+'<tbody></tbody></table>';cur.parentNode.insertBefore(s2,cur.nextSibling);cur=s2;curT=s2.querySelector('table');curT.tBodies[0].appendChild(row)}})});renumber()}" +
      "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";

    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + "</title><style>" + css + "</style></head><body>" + inner + fit + "</body></html>";
  }

  /* ---------- modal แสดงรายงาน (pattern P081) ---------- */
  function openReport() {
    var d = state.report;
    var isTech = state.reportMode === "tech";
    var title = isTech ? "รายงาน Packing List ช่าง" : "รายงาน Pick List QC";
    var overlay = document.getElementById("p080ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p080ReportOverlay";
      overlay.className = "p080-rep-overlay";
      overlay.innerHTML =
        '<div class="p080-rep-modal">' +
          '<div class="p080-rep-head">' +
            '<div class="p080-rep-headtxt">' +
              '<div class="p080-rep-title" id="p080RepTitle"></div>' +
              '<div class="p080-rep-sub" id="p080RepSub"></div>' +
            "</div>" +
            '<div class="p080-rep-btns">' +
              '<button class="p080-rep-btn" type="button" id="p080RepNewWin" title="เปิ ดหน้ าช่างใหม้">↗</button>' +
              '<button class="p080-rep-btn" type="button" id="p080RepZoomOut" title="ยอ่ ลง">−</button>' +
              '<span class="p080-rep-zoomlabel" id="p080RepZoom">100%</span>' +
              '<button class="p080-rep-btn" type="button" id="p080RepZoomIn" title="ขยายขึ้ น">+</button>' +
              '<button class="p080-rep-btn" type="button" id="p080RepClose" title="ปิ ด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p080-rep-body"><iframe id="p080RepFrame" title="รายงาน"></iframe></div>' +
          '<div class="p080-rep-foot">' +
            '<div class="p080-rep-hint">รายงาน A4 — พิมพ์จากหน้ านี้ไดโ้ ดยตรง (หรื อกด ↗ เพื่ อเปิ ดหน้ าช่างใหม้)</div>' +
            '<button class="p080-rep-btn p080-rep-btn-primary" type="button" id="p080RepPrint">พิมพ์</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p080RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p080RepZoomOut").addEventListener("click", function () {
        setZoomLevel(state.zoom - 25);
      });
      overlay.querySelector("#p080RepZoomIn").addEventListener("click", function () {
        setZoomLevel(state.zoom + 25);
      });
      overlay.querySelector("#p080RepNewWin").addEventListener("click", function () {
        var f = document.getElementById("p080RepFrame");
        var w = window.open("", "_blank", "width=900,height=1200");
        if (w && f) {
          try {
            w.document.open();
            w.document.write(f.contentDocument.documentElement.outerHTML);
            w.document.close();
          } catch (err) { /* ignore */ }
        }
      });
      overlay.querySelector("#p080RepPrint").addEventListener("click", function () {
        var f = document.getElementById("p080RepFrame");
        if (f && f.contentWindow) {
          try {
            f.contentWindow.focus();
            f.contentWindow.print();
            return;
          } catch (err) { /* ignore */ }
        }
        showToast("พิมพ์จาก iframe ไมไ่ ด้ — กด ↗ เพื่ อเปิ ดหน้ าช่างใหม้แล้วพิมพ์จากนั่ น");
      });
      if (!state.escBound) {
        state.escBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    $("p080RepTitle").textContent = title;
    $("p080RepSub").textContent =
      d.count + " รายการ — " + fmtDateLong(d.headDate) + " · " + statusLabel(d.status);
    var zb = overlay.querySelector("#p080RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    var f = overlay.querySelector("#p080RepFrame");
    f.srcdoc = reportDocHtml();
    overlay.classList.add("show");
    overlay.style.display = "flex";
    applyZoom();
  }

  function setZoomLevel(z) {
    state.zoom = Math.max(50, Math.min(200, z));
    var zb = document.getElementById("p080RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    applyZoom();
  }

  function applyZoom() {
    var f = document.getElementById("p080RepFrame");
    if (!f) return;
    var tryIt = function () {
      try {
        if (f.contentWindow && f.contentWindow.setZoom) {
          f.contentWindow.setZoom(state.zoom / 100);
          return true;
        }
      } catch (e) { /* iframe ยังไม่พร้อม */ }
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
    var overlay = document.getElementById("p080ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.style.display = "none";
    var f = overlay.querySelector("#p080RepFrame");
    if (f) f.srcdoc = "";
  }

  /* ---------- CSS ---------- */
  var CSS = [
    ".p080-app{display:flex;flex-direction:column;gap:14px}",
    ".p080-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p080-launcher-body{display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:end;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p080-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p080-input-wrap{position:relative}",
    ".p080-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-input-wrap input,.p080-input-wrap select{width:100%;height:44px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p080-input-wrap select{cursor:pointer;appearance:none}",
    ".p080-input-wrap input:focus,.p080-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p080-action-button{display:flex;min-height:44px;width:165px;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 10px;color:#fff;border:0;border-radius:11px;font-size:13px;font-weight:700;text-align:center;transition:0.16s ease}",
    ".p080-action-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-action-button.primary{background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,0.26)}",
    ".p080-action-button.secondary{background:linear-gradient(135deg,#a78bfa,#7c3aed);box-shadow:0 9px 20px rgba(124,58,237,0.26)}",
    ".p080-action-button.search-btn{width:120px;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 9px 20px rgba(5,150,105,0.26)}",
    ".p080-action-button small{font-size:10px;font-weight:600;opacity:0.92}",
    ".p080-action-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}",
    ".p080-action-button:disabled{opacity:0.7}",
    ".p080-action-button.loading svg{animation:p080spin 1s linear infinite}",
    "@keyframes p080spin{to{transform:rotate(360deg)}}",
    ".p080-panel{display:flex;flex-direction:column;min-height:420px;flex:1;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p080-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p080-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p080-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p080-panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-panel-title h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
    ".p080-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p080-mode-badge{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p080-header-right{display:flex;align-items:center;gap:10px}",
    ".p080-header-actions{display:flex;align-items:center;gap:8px}",
    ".p080-header-actions .p080-action-button{min-height:38px;width:140px;padding:6px 8px;border-radius:9px;font-size:12px}",
    ".p080-mode-badge.normal{color:#1d4ed8;background:#dbeafe}",
    ".p080-mode-badge.search{color:#047857;background:#d1fae5}",
    ".p080-mode-badge.hidden{color:#7c3aed;background:#f5f3ff}",
    ".p080-table-container{min-height:0;flex:1;overflow:auto}",
    ".p080-table{width:100%;min-width:820px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p080-table th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p080-table td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
    ".p080-table th.center,.p080-table td.center{text-align:center}",
    ".p080-table th.number,.p080-table td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p080-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p080-table tbody tr:hover{background:#f0f7ff}",
    ".p080-doc-number{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p080-product-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}",
    ".p080-status-tag{display:inline-flex;padding:3px 9px;color:#92400e;border-radius:7px;background:#fef3c7;font-size:11px;font-weight:700;white-space:normal}",
    ".p080-empty-state{display:flex;min-height:320px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p080-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p080-empty-state p{margin-top:5px;font-size:11px}",
    ".p080-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p080-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p080-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    ".p080-rep-overlay{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,0.55)}",
    ".p080-rep-overlay.show{display:flex}",
    ".p080-rep-modal{display:flex;flex-direction:column;overflow:hidden;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.35)}",
    ".p080-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}",
    ".p080-rep-title{font-size:15px;font-weight:700;color:#0f172a}",
    ".p080-rep-sub{margin-top:2px;color:#64748b;font-size:12px}",
    ".p080-rep-btns{display:flex;gap:8px}",
    ".p080-rep-btn{padding:6px 12px;color:#334155;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer}",
    ".p080-rep-btn:hover{background:#e2e8f0}",
    ".p080-rep-zoomlabel{display:inline-flex;min-width:48px;align-items:center;justify-content:center;color:#334155;font-size:12px;font-weight:600}",
    ".p080-rep-btn-primary{color:#fff;border-color:#0a5bc4;background:#0a5bc4}",
    ".p080-rep-btn-primary:hover{background:#084a9e}",
    ".p080-rep-body{flex:1;min-height:0;overflow:hidden;padding:12px;background:#f1f5f9}",
    ".p080-rep-body iframe{width:100%;height:100%;min-height:520px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}",
    ".p080-rep-hint{color:#64748b;font-size:12px}",
    "@media (max-width:950px){.p080-launcher-body{grid-template-columns:1fr}.p080-action-button{width:100%;flex-direction:row}}",
    "@media (max-width:680px){.p080-panel-header{align-items:flex-start;flex-direction:column}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  function html() {
    var statusHtml = "";
    STATUS_OPTIONS.forEach(function (s) {
      statusHtml += '<option value="' + s[0] + '"' + (s[0] === "6" ? " selected" : "") + ">" + esc(s[1]) + "</option>";
    });
    var today = new Date();
    return '<div class="p080-app">' +
      '<section class="p080-launcher-card">' +
        '<form class="p080-launcher-body" id="p080Form">' +
          '<div class="p080-field">' +
            '<label for="p080HeadDate">วันที่หัวเอกสาร</label>' +
            '<div class="p080-input-wrap">' + icon("cal") + '<input id="p080HeadDate" type="date" value="' + isoDate(today) + '"></div>' +
          "</div>" +
          '<div class="p080-field">' +
            '<label for="p080Status">สถานะใบแจ้งหนี้</label>' +
            '<div class="p080-input-wrap">' + icon("chevron") + '<select id="p080Status">' + statusHtml + "</select></div>" +
          "</div>" +
          '<button class="p080-action-button search-btn" id="p080SearchBtn" type="button">' + icon("search") + "ค้นหา</button>" +
        "</form>" +
      "</section>" +
      '<section class="p080-panel">' +
        '<div class="p080-panel-header">' +
          '<div class="p080-panel-heading">' +
            '<div class="p080-panel-icon">' + icon("grid") + "</div>" +
            '<div class="p080-panel-title">' +
              "<h2>ผลการสร้างเอกสาร PickList QC</h2>" +
              '<p id="p080Subtitle">ยังไม่ได้ค้นหา/สร้างรายงาน</p>' +
            "</div>" +
          "</div>" +
          '<div class="p080-header-right">' +
          '<span class="p080-mode-badge search" id="p080ModeBadge" style="display:none">ผลค้นหา</span>' +
          '<div class="p080-header-actions">' +
            '<button class="p080-action-button primary" id="p080GenNormal" type="button">' + icon("doc") + "สร้างรายงาน</button>" +
          "</div>" +
          "</div>" +
        "</div>" +
        '<div class="p080-table-container" id="p080SearchContainer" style="display:none">' +
          '<table class="p080-table p080-search-table">' +
            "<thead><tr>" +
            "<th>รหัสสินค้า</th><th class=\"center\">กลุ่ ม</th>" +
            "<th>ชื่อสินค้า (1)</th><th>ชื่อสินค้า (2)</th>" +
            '<th class="center number">คงเหลือ</th>' +
            "</tr></thead>" +
            '<tbody id="p080SearchRows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p080-empty-state" id="p080EmptyState">' +
          "<div>" + icon("check") +
          "<strong>ยังไม่มีข้อมูล</strong>" +
          '<p>เลือกสถานะ แล้วกด "ค้นหา" หรือ "สร้างรายงาน"</p>' +
          "</div>" +
        "</div>" +
        '<div class="p080-table-footer" id="p080Footer" style="display:none">' +
          '<span id="p080FooterText">แสดง 0 รายการ</span>' +
        "</div>" +
      "</section>" +
      '<div class="p080-toast" id="p080Toast"><span id="p080ToastMsg"></span></div>' +
      "</div>";
  }

  function mount(mountEl) {
    root = mountEl;
    var olds = document.querySelectorAll("body > .p080-rep-overlay");
    for (var oi = 0; oi < olds.length; oi++) olds[oi].parentNode.removeChild(olds[oi]);
    root.innerHTML = html();
    if (!document.getElementById("p080Style")) {
      var st = document.createElement("style");
      st.id = "p080Style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    el.headDate = $("p080HeadDate");
    el.status = $("p080Status");
    el.genNormalBtn = $("p080GenNormal");
    el.searchBtn = $("p080SearchBtn");
    el.searchContainer = $("p080SearchContainer");
    el.searchRows = $("p080SearchRows");
    el.subtitle = $("p080Subtitle");
    el.modeBadge = $("p080ModeBadge");
    el.emptyState = $("p080EmptyState");
    el.footer = $("p080Footer");
    el.footerText = $("p080FooterText");
    el.toast = $("p080Toast");

    el.genNormalBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doGenerate(false);
    });
    el.searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doSearch();
    });
    $("p080Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });
  }

  window.P080PickListQC = { mount: mount };
})();
