
/* P084 — PickList[IRW][Zone QC]
 * IIFE — window.P084PickListIrw = { mount }
 * clone demo/P080_demo.html + C# AppPackingListBucketParts/FrmPackingListBatteryGUI:
 *   - ปุ่มค้นหา → api/p084_search.php (ตาราง 5 คอลั่ม)
 *   - ปุ่มสร้างรายงาน → api/p084_generate.php → modal รายงาน A4 "Pick List[IRW][Zone QC]" (หัวกลุ่ม)
 *   - ปุ่มสร้างรายงาน (ซ่อนชื่อสินค้า) → modal รายงาน A4 "Packing List ช่าง" (flat + หน้า barcode)
 * รายงาน modal clone pattern P081 (srcdoc iframe + paginate + zoom + print)
 */
(function () {
  "use strict";

  var STATUS_OPTIONS = [
    ["18", "18-PickList[IRW][Zone QC]/PD"],
    ["26", "26-PD/QC"]
  ];

  var MONTHS_TH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  var root = null;
  var el = {};
  var state = {
    searchRows: [], view: null, searching: false, page: 1,
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
  var API = { search: "api/p084_search.php", generate: "api/p084_generate.php" };

  function apiPost(url, data) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function showToast(msg, ms) {
    $("p084ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  /* ---------- ค้นหา (api/p084_search.php) ---------- */
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
        state.page = 1;
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

  /* ---------- สร้างรายงาน (ปกติ / ซ่อนชื่อสินค้า) — api/p084_generate.php ---------- */
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
    var PER_PAGE = 15;

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
    el.modeBadge.className = "p084-mode-badge search";
    el.subtitle.textContent = "สถานะ " + statusLabel(el.status.value) + " \u00b7 " + fmtDate(el.headDate.value);
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / PER_PAGE));
    if (state.page < 1) state.page = 1;
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PER_PAGE;
    var pageRows = rows.slice(start, start + PER_PAGE);
    var html = "";
    pageRows.forEach(function (r) {
      html += "<tr>" +
        '<td class="p084-product-code">' + esc(r.STKcode) + "</td>" +
        '<td class="center">' + esc(r.STKgroup) + "</td>" +
        "<td>" + esc(r.STKdescT1) + "</td>" +
        "<td>" + esc(r.STKdescT2) + "</td>" +
        '<td class="center number">' + (r.SBLqty == null ? "" : esc(r.SBLqty)) + "</td>" +
        "</tr>";
    });
    el.searchRows.innerHTML = html;
    el.footerText.textContent = "แสดง " + (total ? (start + 1) : 0) + " - " + (start + pageRows.length) + " \u00b7 " + total + " " + " รายการ";
    renderPager(pages);
  }

  function renderPager(pages) {
    if (!el.pager) return;
    if (pages <= 1) { el.pager.innerHTML = ""; return; }
    var cur = state.page;
    var h = "";
    h += '<button type="button" class="p084-pg" data-pg="prev"' + (cur <= 1 ? " disabled" : "") + ">&lsaquo;</button>";
    var nums = [];
    if (pages <= 7) {
      for (var i = 1; i <= pages; i++) nums.push(i);
    } else {
      nums.push(1);
      if (cur > 3) nums.push("...");
      for (var j = Math.max(2, cur - 1); j <= Math.min(pages - 1, cur + 1); j++) nums.push(j);
      if (cur < pages - 2) nums.push("...");
      nums.push(pages);
    }
    nums.forEach(function (n) {
      if (n === "...") { h += '<span class="p084-pg ell">&hellip;</span>'; return; }
      h += '<button type="button" class="p084-pg' + (n === cur ? " active" : "") + '" data-pg="' + n + '">' + n + "</button>";
    });
    h += '<button type="button" class="p084-pg" data-pg="next"' + (cur >= pages ? " disabled" : "") + ">&rsaquo;</button>";
    el.pager.innerHTML = h;
  }

  /* ---------- รายงาน A4 (clone C# bgWorker_DoWork / bgWorker_DoWork_TEST + pattern P081) ----------
     mode "qc"   = "Pick List[IRW][Zone QC]" — หัวกลุ่ม (STGcode : STGdescT) + ชื่อสินค้า T1+T2
     mode "tech" = "Packing List ช่าง" — flat (ไม่มี หัวกลุ่ม, ชื่อ T1) + หน้า barcode */
  function itemRowsHtml(items, hideNames) {
    var body = "";
    items.forEach(function (it) {
      var desc = hideNames ? esc(it.stk) + "  " + esc(it.desc1)
        : esc(it.stk) + "  " + esc(it.desc1) + " " + esc(it.desc2);
      body += '<tr class="p084-r-item">' +
        '<td colspan="3">' + desc + "</td>" +
        '<td class="p084-r-sumlabel"> รวม </td>' +
        '<td class="num">' + esc(it.grand) + "</td>" +
        '<td class="num">' + esc(it.remaining) + "</td>" +
        "</tr>";
      var span = it.rows.length;
      it.rows.forEach(function (r, n) {
        body += "<tr>";
        if (n === 0) body += '<td class="p084-r-blank" rowspan="' + span + '">&nbsp;</td>';
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
    return '<section class="p084-page" data-rgrp="' + rgrp + '">' +
      '<div class="p084-r-foot">Page ' + (idx + 1) + " of " + total + "</div>" +
      inner +
      "</section>";
  }

  function reportDocHtml() {
    var d = state.report;
    var isTech = state.reportMode === "tech";
    var title = isTech ? " Packing List ช่าง" : " Pick List[IRW][Zone QC]";
    var lastCol = isTech ? "คงเหลือ /<br>หน่วยนับ" : "คงเหลือ<br>( 01,03,04 )";

    var css = [
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
      "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
      "@page{size:A4;margin:25pt 20pt}",
      "body{margin:0;background:#f1f5f9}",
      ".p084-page{box-sizing:border-box;display:flex;flex-direction:column;width:210mm;height:297mm;overflow:hidden;margin:0 auto;padding:25pt 20pt;background:#fff;font-family:'THSarabunNew','TH Sarabun New',sans-serif;color:#000}",
      ".p084-r-title{text-align:center;font-size:16pt;font-weight:bold;margin:0 0 2px}",
      ".p084-r-date{text-align:center;font-size:14pt;font-weight:bold;margin:0 0 4px}",
      ".p084-r-caption{font-size:12pt;margin:0 0 6px}",
      ".p084-r-table{width:100%;border-collapse:collapse;table-layout:fixed}",
      ".p084-r-table th,.p084-r-table td{border:1px solid #000;padding:2px 4px;font-size:12pt;vertical-align:middle}",
      ".p084-r-table th{background:#f0f0f0;text-align:center;font-weight:bold;font-size:12pt;white-space:normal}",
      ".p084-r-item td{background:#f0f0f0;font-weight:bold}",
      ".p084-r-item td.p084-r-sumlabel{text-align:center}",
      ".p084-r-table td.num{text-align:right}",
      ".p084-r-table td.center{text-align:center}",
      ".p084-r-blank{text-align:center}",
      ".p084-r-group td{font-size:12pt;padding:3px 4px}",
      ".p084-r-spacer td{border:0;height:6pt;padding:0}",
      ".p084-r-foot{text-align:right;font-size:10pt;margin:0 0 4px}",
      ".p084-r-barcode{height:340pt;text-align:center;vertical-align:middle;font-size:72pt;font-weight:bold;font-family:Arial,sans-serif}",
      ".p084-r-bartable{width:100%}",
      ".p084-page+.p084-page{margin-top:10px}",
      "@media print{body{display:block;background:#fff;zoom:1}.p084-page{width:100%;height:auto;min-height:0;overflow:visible;padding:0;background:#fff;page-break-after:always}.p084-page:last-child{page-break-after:auto;margin-top:0}.p084-r-table tr{page-break-inside:auto}}"
    ].join("\n");

    var thead = "<thead><tr>" +
      "<th>รหัส,ชื่อสินค้า</th>" +
      "<th>ชื่อลูกค้า</th>" +
      "<th>เลขที่ใบแจ้งหนี้</th>" +
      "<th>วันที่ใบแจ้งหนี้</th>" +
      "<th>ปริมาณ</th>" +
      "<th>" + lastCol + "</th>" +
      "</tr></thead>";

    var cg = "<colgroup><col style=\"width:70pt\"><col style=\"width:220pt\"><col style=\"width:70pt\"><col style=\"width:70pt\"><col style=\"width:60pt\"><col style=\"width:60pt\"></colgroup>";

    var head = '<div class="p084-r-title">' + esc(title) + "</div>" +
      '<div class="p084-r-date"> ประจำวันที่ ' + esc(fmtDateLong(d.headDate)) + "</div>" +
      '<div class="p084-r-caption">พิมพ์เมื่อ ' + esc(fmtStamp(d.printedAt)) +
      "  โดย : " + esc(d.machine) + "</div>";

    var body = "";
    if (isTech) {
      body = itemRowsHtml(d.items, true);
    } else {
      d.groups.forEach(function (g, gi) {
        if (g.label) {
          body += '<tr class="p084-r-group"><td colspan="6">' + esc(g.label) + "</td></tr>";
        }
        body += itemRowsHtml(g.items, false);
        if (gi < d.groups.length - 1) {
          body += '<tr class="p084-r-spacer"><td colspan="6">&nbsp;</td></tr>';
        }
      });
    }

    var mainInner = head + '<table class="p084-r-table">' + cg + thead + "<tbody>" + body + "</tbody></table>";

    var barInner = "";
    if (isTech && d.barcodes && d.barcodes.length) {
      var barRows = "";
      d.barcodes.forEach(function (code) {
        barRows += "<tr><td class=\"p084-r-barcode\">" + esc(code) + "</td></tr>";
      });
      barInner = '<table class="p084-r-table p084-r-bartable"><colgroup><col style="width:100%"></colgroup><tbody>' + barRows + "</tbody></table>";
    }

    var inner = reportSectionHtml(mainInner, 0, 1, "main");
    if (barInner) inner += reportSectionHtml(barInner, 0, 1, "bar");

    var fit = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};" +
      "function sheetOver(sec){var t=sec.querySelector('table');if(!t)return false;var tb=t.tBodies[0];var last=tb.rows[tb.rows.length-1];if(!last)return false;var sr=sec.getBoundingClientRect();var lr=last.getBoundingClientRect();var pb=parseFloat(getComputedStyle(sec).paddingBottom)||0;return lr.bottom>sr.bottom-pb}" +
      "function renumber(){var byG={};var s=document.querySelectorAll('section.p084-page');for(var i=0;i<s.length;i++){var g=s[i].getAttribute('data-rgrp')||'main';byG[g]=(byG[g]||0)+1}var n={};for(var i=0;i<s.length;i++){var g=s[i].getAttribute('data-rgrp')||'main';n[g]=(n[g]||0)+1;s[i].querySelector('.p084-r-foot').textContent='Page '+n[g]+' of '+byG[g]}}" +
      "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p084-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){var g=s.getAttribute('data-rgrp')||'main';var last=groups[groups.length-1];if(last&&last.g===g)last.secs.push(s);else groups.push({g:g,secs:[s]})});groups.forEach(function(grp){var first=grp.secs[0];var t=first.querySelector('table');if(!t)return;for(var i=1;i<grp.secs.length;i++){var g2=grp.secs[i].querySelector('table');while(g2.tBodies[0].rows.length)t.tBodies[0].appendChild(g2.tBodies[0].rows[0]);grp.secs[i].parentNode.removeChild(grp.secs[i])}var thead=t.querySelector('thead');var theadHtml=thead?thead.outerHTML:'';var cgEl=t.querySelector('colgroup');var cgHtml=cgEl?cgEl.outerHTML:'';var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){var had=curT.tBodies[0].rows.length;curT.tBodies[0].appendChild(row);if(had&&sheetOver(cur)){curT.tBodies[0].removeChild(row);var s2=document.createElement('section');s2.className='p084-page p084-cont';s2.setAttribute('data-rgrp',grp.g);s2.innerHTML='<div class=\\\"p084-r-foot\\\"></div><table class=\\\"p084-r-table\\\">'+cgHtml+theadHtml+'<tbody></tbody></table>';cur.parentNode.insertBefore(s2,cur.nextSibling);cur=s2;curT=s2.querySelector('table');curT.tBodies[0].appendChild(row)}})});renumber()}" +
      "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";

    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + "</title><style>" + css + "</style></head><body>" + inner + fit + "</body></html>";
  }

  /* ---------- modal แสดงรายงาน (pattern P081) ---------- */
  function openReport() {
    var d = state.report;
    var isTech = state.reportMode === "tech";
    var title = isTech ? "รายงาน Packing List ช่าง" : "รายงาน Pick List[IRW][Zone QC]";
    var overlay = document.getElementById("p084ReportOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "p084ReportOverlay";
      overlay.className = "p084-rep-overlay";
      overlay.innerHTML =
        '<div class="p084-rep-modal">' +
          '<div class="p084-rep-head">' +
            '<div class="p084-rep-headtxt">' +
              '<div class="p084-rep-title" id="p084RepTitle"></div>' +
              '<div class="p084-rep-sub" id="p084RepSub"></div>' +
            "</div>" +
            '<div class="p084-rep-btns">' +
              '<button class="p084-rep-btn" type="button" id="p084RepNewWin" title="เปิดหน้าช่างใหม้">↗</button>' +
              '<button class="p084-rep-btn" type="button" id="p084RepZoomOut" title="ยอ่ลง">−</button>' +
              '<span class="p084-rep-zoomlabel" id="p084RepZoom">100%</span>' +
              '<button class="p084-rep-btn" type="button" id="p084RepZoomIn" title="ขยายขึ้น">+</button>' +
              '<button class="p084-rep-btn" type="button" id="p084RepClose" title="ปิด (Esc)">✕</button>' +
            "</div>" +
          "</div>" +
          '<div class="p084-rep-body"><iframe id="p084RepFrame" title="รายงาน"></iframe></div>' +
          '<div class="p084-rep-foot">' +
            '<div class="p084-rep-hint">รายงาน A4 — พิมพ์จากหน้านี้ไดโ้ดยตรง (หรือกด ↗ เพื่อเปิดหน้าช่างใหม้)</div>' +
            '<button class="p084-rep-btn p084-rep-btn-primary" type="button" id="p084RepPrint">พิมพ์</button>' +
          "</div>" +
        "</div>";
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeReport();
      });
      overlay.querySelector("#p084RepClose").addEventListener("click", closeReport);
      overlay.querySelector("#p084RepZoomOut").addEventListener("click", function () {
        setZoomLevel(state.zoom - 25);
      });
      overlay.querySelector("#p084RepZoomIn").addEventListener("click", function () {
        setZoomLevel(state.zoom + 25);
      });
      overlay.querySelector("#p084RepNewWin").addEventListener("click", function () {
        var f = document.getElementById("p084RepFrame");
        var w = window.open("", "_blank", "width=900,height=1200");
        if (w && f) {
          try {
            w.document.open();
            w.document.write(f.contentDocument.documentElement.outerHTML);
            w.document.close();
          } catch (err) { /* ignore */ }
        }
      });
      overlay.querySelector("#p084RepPrint").addEventListener("click", function () {
        var f = document.getElementById("p084RepFrame");
        if (f && f.contentWindow) {
          try {
            f.contentWindow.focus();
            f.contentWindow.print();
            return;
          } catch (err) { /* ignore */ }
        }
        showToast("พิมพ์จาก iframe ไมไ่ด้ — กด ↗ เพื่อเปิดหน้าช่างใหม้แล้วพิมพ์จากนั่น");
      });
      if (!state.escBound) {
        state.escBound = true;
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape") closeReport();
        });
      }
    }
    $("p084RepTitle").textContent = title;
    $("p084RepSub").textContent =
      d.count + " รายการ — " + fmtDateLong(d.headDate) + " · " + statusLabel(d.status);
    var zb = overlay.querySelector("#p084RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    var f = overlay.querySelector("#p084RepFrame");
    f.srcdoc = reportDocHtml();
    overlay.classList.add("show");
    overlay.style.display = "flex";
    applyZoom();
  }

  function setZoomLevel(z) {
    state.zoom = Math.max(50, Math.min(200, z));
    var zb = document.getElementById("p084RepZoom");
    if (zb) zb.textContent = state.zoom + "%";
    applyZoom();
  }

  function applyZoom() {
    var f = document.getElementById("p084RepFrame");
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
    var overlay = document.getElementById("p084ReportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.style.display = "none";
    var f = overlay.querySelector("#p084RepFrame");
    if (f) f.srcdoc = "";
  }

  /* ---------- CSS ---------- */
  var CSS = [
    ".p084-app{display:flex;flex-direction:column;gap:14px}",
    ".p084-launcher-card{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,0.08)}",
    ".p084-launcher-body{display:grid;grid-template-columns:1fr 1fr auto;gap:14px;align-items:end;padding:20px;background:linear-gradient(180deg,#eaf2ff,#f3f8ff)}",
    ".p084-field label{display:block;margin-bottom:7px;color:#334155;font-size:12px;font-weight:700}",
    ".p084-input-wrap{position:relative}",
    ".p084-input-wrap svg{position:absolute;top:50%;right:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p084-input-wrap input,.p084-input-wrap select{width:100%;height:44px;padding:0 36px 0 12px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}",
    ".p084-input-wrap select{cursor:pointer;appearance:none}",
    ".p084-input-wrap input:focus,.p084-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p084-action-button{display:flex;min-height:44px;width:165px;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 10px;color:#fff;border:0;border-radius:11px;font-size:13px;font-weight:700;text-align:center;transition:0.16s ease}",
    ".p084-action-button svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p084-action-button.primary{background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,0.26)}",
    ".p084-action-button.secondary{background:linear-gradient(135deg,#a78bfa,#7c3aed);box-shadow:0 9px 20px rgba(124,58,237,0.26)}",
    ".p084-action-button.search-btn{width:120px;background:linear-gradient(135deg,#34d399,#059669);box-shadow:0 9px 20px rgba(5,150,105,0.26)}",
    ".p084-action-button small{font-size:10px;font-weight:600;opacity:0.92}",
    ".p084-action-button:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.06)}",
    ".p084-action-button:disabled{opacity:0.7}",
    ".p084-action-button.loading svg{animation:p084spin 1s linear infinite}",
    "@keyframes p084spin{to{transform:rotate(360deg)}}",
    ".p084-panel{display:flex;flex-direction:column;min-height:420px;flex:1;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p084-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p084-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p084-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p084-panel-icon svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p084-panel-title h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}",
    ".p084-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p084-mode-badge{padding:5px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p084-header-right{display:flex;align-items:center;gap:10px}",
    ".p084-header-actions{display:flex;align-items:center;gap:8px}",
    ".p084-header-actions .p084-action-button{min-height:38px;width:140px;padding:6px 8px;border-radius:9px;font-size:12px}",
    ".p084-mode-badge.normal{color:#1d4ed8;background:#dbeafe}",
    ".p084-mode-badge.search{color:#047857;background:#d1fae5}",
    ".p084-mode-badge.hidden{color:#7c3aed;background:#f5f3ff}",
    ".p084-table-container{min-height:0;flex:1;overflow:auto}",
    ".p084-table{width:100%;min-width:820px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p084-table th{position:sticky;top:0;z-index:2;padding:11px 14px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left}",
    ".p084-table td{padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4}",
    ".p084-table th.center,.p084-table td.center{text-align:center}",
    ".p084-table th.number,.p084-table td.number{text-align:right;font-family:Arial,sans-serif}",
    ".p084-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p084-table tbody tr:hover{background:#f0f7ff}",
    ".p084-doc-number{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p084-product-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}",
    ".p084-search-table{table-layout:fixed;min-width:0}",
    ".p084-search-table col.c-code{width:100px}",
    ".p084-search-table col.c-grp{width:100px}",
    ".p084-search-table col.c-qty{width:100px}",
    ".p084-search-table th,.p084-search-table td{overflow:hidden;text-overflow:ellipsis}",
    ".p084-status-tag{display:inline-flex;padding:3px 9px;color:#92400e;border-radius:7px;background:#fef3c7;font-size:11px;font-weight:700;white-space:normal}",
    ".p084-empty-state{display:flex;min-height:320px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p084-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    ".p084-empty-state p{margin-top:5px;font-size:11px}",
    ".p084-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    ".p084-pager{display:flex;align-items:center;gap:5px}",
    ".p084-pg{min-width:32px;height:32px;padding:0 9px;border:1px solid #dbe3ef;border-radius:9px;background:#fff;color:#334155;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s ease}",
    ".p084-pg:hover:not(:disabled):not(.active){background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}",
    ".p084-pg.active{background:#1d4ed8;border-color:#1d4ed8;color:#fff;box-shadow:0 4px 10px rgba(29,78,216,0.25)}",
    ".p084-pg:disabled{opacity:.4;cursor:default}",
    ".p084-pg.ell{border:0;background:transparent;cursor:default;color:#94a3b8}",
    ".p084-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p084-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    ".p084-rep-overlay{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:10px;background:rgba(15,23,42,0.55)}",
    ".p084-rep-overlay.show{display:flex}",
    ".p084-rep-modal{display:flex;flex-direction:column;overflow:hidden;width:100%;height:100%;max-width:100%;max-height:100%;border-radius:10px;background:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.35)}",
    ".p084-rep-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}",
    ".p084-rep-title{font-size:15px;font-weight:700;color:#0f172a}",
    ".p084-rep-sub{margin-top:2px;color:#64748b;font-size:12px}",
    ".p084-rep-btns{display:flex;gap:8px}",
    ".p084-rep-btn{padding:6px 12px;color:#334155;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;font-size:13px;cursor:pointer}",
    ".p084-rep-btn:hover{background:#e2e8f0}",
    ".p084-rep-zoomlabel{display:inline-flex;min-width:48px;align-items:center;justify-content:center;color:#334155;font-size:12px;font-weight:600}",
    ".p084-rep-btn-primary{color:#fff;border-color:#0a5bc4;background:#0a5bc4}",
    ".p084-rep-btn-primary:hover{background:#084a9e}",
    ".p084-rep-body{flex:1;min-height:0;overflow:hidden;padding:12px;background:#f1f5f9}",
    ".p084-rep-body iframe{width:100%;height:100%;min-height:520px;border:1px solid #e2e8f0;border-radius:8px;background:#fff}",
    ".p084-rep-hint{color:#64748b;font-size:12px}",
    "@media (max-width:950px){.p084-launcher-body{grid-template-columns:1fr}.p084-action-button{width:100%;flex-direction:row}}",
    "@media (max-width:680px){.p084-panel-header{align-items:flex-start;flex-direction:column}}",
    "@keyframes p084flash{0%{box-shadow:0 0 0 0 rgba(52,211,153,.65)}100%{box-shadow:0 0 0 12px rgba(52,211,153,0)}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  function html() {
    var statusHtml = "";
    STATUS_OPTIONS.forEach(function (s) {
      statusHtml += '<option value="' + s[0] + '"' + (s[0] === "18" ? " selected" : "") + ">" + esc(s[1]) + "</option>";
    });
    var today = new Date();
    return '<div class="p084-app">' +
      '<section class="p084-launcher-card">' +
        '<form class="p084-launcher-body" id="p084Form">' +
          '<div class="p084-field">' +
            '<label for="p084HeadDate">วันที่หัวเอกสาร</label>' +
            '<div class="p084-input-wrap">' + icon("cal") + '<input id="p084HeadDate" type="date" value="' + isoDate(today) + '"></div>' +
          "</div>" +
          '<div class="p084-field">' +
            '<label for="p084Status">สถานะใบแจ้งหนี้</label>' +
            '<div class="p084-input-wrap">' + icon("chevron") + '<select id="p084Status">' + statusHtml + "</select></div>" +
          "</div>" +
          '<button class="p084-action-button search-btn" id="p084SearchBtn" type="button">' + icon("search") + "ค้นหา</button>" +
        "</form>" +
      "</section>" +
      '<section class="p084-panel">' +
        '<div class="p084-panel-header">' +
          '<div class="p084-panel-heading">' +
            '<div class="p084-panel-icon">' + icon("grid") + "</div>" +
            '<div class="p084-panel-title">' +
              "<h2>PickList[IRW][Zone QC]</h2>" +
              '<p id="p084Subtitle">ยังไม่ได้ค้นหา/สร้างรายงาน</p>' +
            "</div>" +
          "</div>" +
          '<div class="p084-header-right">' +
          '<span class="p084-mode-badge search" id="p084ModeBadge" style="display:none">ผลค้นหา</span>' +
          '<div class="p084-header-actions">' +
            '<button class="p084-action-button primary" id="p084GenNormal" type="button">' + icon("doc") + "สร้างรายงาน</button>" +
          "</div>" +
          "</div>" +
        "</div>" +
        '<div class="p084-table-container" id="p084SearchContainer" style="display:none">' +
          '<table class="p084-table p084-search-table">' +
            "<colgroup><col class=\"c-code\"><col class=\"c-grp\"><col><col><col class=\"c-qty\"></colgroup>" +
            "<thead><tr>" +
            "<th>รหัสสินค้า</th><th class=\"center\">กลุ่ม</th>" +
            "<th>ชื่อสินค้า (1)</th><th>ชื่อสินค้า (2)</th>" +
            '<th class="center number">คงเหลือ</th>' +
            "</tr></thead>" +
            '<tbody id="p084SearchRows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p084-empty-state" id="p084EmptyState">' +
          "<div>" + icon("check") +
          "<strong>ยังไม่มีข้อมูล</strong>" +
          '<p>เลือกสถานะ แล้วกด "ค้นหา" หรือ "สร้างรายงาน"</p>' +
          "</div>" +
        "</div>" +
        '<div class="p084-table-footer" id="p084Footer" style="display:none">' +
          '<span id=\"p084FooterText\">แสดง 0 รายการ</span><div class=\"p084-pager\" id=\"p084Pager\"></div>' +
        "</div>" +
      "</section>" +
      '<div class="p084-toast" id="p084Toast"><span id="p084ToastMsg"></span></div>' +
      "</div>";
  }


  
  function mount(mountEl) {
    root = mountEl;
    var olds = document.querySelectorAll("body > .p084-rep-overlay");
    for (var oi = 0; oi < olds.length; oi++) olds[oi].parentNode.removeChild(olds[oi]);
    var oldg = document.getElementById("p084GrpOverlay");
    if (oldg) oldg.parentNode.removeChild(oldg);
    root.innerHTML = html();
    if (!document.getElementById("p084Style")) {
      var st = document.createElement("style");
      st.id = "p084Style";
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    el.headDate = $("p084HeadDate");
    el.status = $("p084Status");
    el.genNormalBtn = $("p084GenNormal");
    el.searchBtn = $("p084SearchBtn");
    el.searchContainer = $("p084SearchContainer");
    el.searchRows = $("p084SearchRows");
    el.subtitle = $("p084Subtitle");
    el.modeBadge = $("p084ModeBadge");
    el.emptyState = $("p084EmptyState");
    el.footer = $("p084Footer");
    el.footerText = $("p084FooterText");
    el.pager = $("p084Pager");
    el.toast = $("p084Toast");

    if (el.pager) {
      el.pager.addEventListener("click", function (e) {
        var b = e.target.closest ? e.target.closest("button[data-pg]") : null;
        if (!b || b.disabled) return;
        var pg = b.getAttribute("data-pg");
        if (pg === "prev") state.page = Math.max(1, state.page - 1);
        else if (pg === "next") state.page = state.page + 1;
        else state.page = parseInt(pg, 10);
        render();
      });
    }

    el.genNormalBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doGenerate(false);
    });
    el.searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      doSearch();
    });
    $("p084Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });

  }

  window.P084PickListIrw = { mount: mount };
})();
