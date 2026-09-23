<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>รายงานเงินโอนประจำวัน — P031</title>
<style>
  :root { --line: #334155; --text: #0f172a; --muted: #475569; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Noto Sans Thai", "Sarabun", Tahoma, Arial, sans-serif;
    color: var(--text);
    background: #e2e8f0;
  }

  /* ---------- toolbar (ไม่ถูก print) ---------- */
  .toolbar {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; gap: 12px;
    padding: 12px 20px; background: #0f172a; color: #fff;
  }
  .toolbar button {
    padding: 9px 16px; border: 0; border-radius: 8px;
    background: #2563eb; color: #fff; font: inherit; font-weight: 700; cursor: pointer;
  }
  .toolbar button:hover { background: #1d4ed8; }
  .toolbar .toolbar-info { margin-left: auto; font-size: 13px; color: #cbd5e1; }

  /* ---------- A4 landscape page — ขอบกระดาษ บน 20 / ล่าง 15 / ซ้าย 13 / ขวา 13 mm ---------- */
  .report-page {
    width: 297mm; height: 210mm;
    margin: 16px auto; padding: 20mm 13mm 15mm 13mm;
    background: #fff; box-shadow: 0 10px 30px rgba(15,23,42,.18);
    overflow: hidden;
    page-break-after: always;
  }
  .report-page:last-child { page-break-after: auto; }

  .rep-title { text-align: center; font-size: 20px; font-weight: 700; margin: 0 0 10px; }

  .rep-meta {
    display: flex; justify-content: space-between; align-items: flex-start;
    font-size: 14px; margin-bottom: 12px;
  }
  .rep-meta .left { line-height: 1.7; }
  .rep-meta .right { line-height: 1.7; white-space: nowrap; }

  table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
  th, td { border: 1px solid var(--line); padding: 4px 6px; }
  th { white-space: nowrap; }
  td { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  thead th { font-size: 14px; font-weight: 700; background: #f1f5f9; }
  tbody tr { page-break-inside: avoid; }
  td.c, th.c { text-align: center; }
  td.r, th.r { text-align: right; font-variant-numeric: tabular-nums; }
  td.l { text-align: left; }
  tr.total-row td { font-weight: 700; background: #fff; }

  .rep-pageno { margin-top: 12px; text-align: right; font-size: 14px; color: var(--muted); }

  .rep-empty { padding: 40px; text-align: center; color: var(--muted); font-size: 14px; }

  /* ---------- print ---------- */
  @page { size: A4 landscape; margin: 20mm 13mm 15mm 13mm; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .report-page { width: auto; height: auto; margin: 0; padding: 0; box-shadow: none; overflow: visible; }
  }
</style>
</head>
<body>
  <div class="toolbar">
    <button type="button" onclick="window.close()">✕ ปิด</button>
    <button type="button" onclick="window.print()">🖨 พิมพ์</button>
    <span class="toolbar-info" id="toolbarInfo">กำลังโหลดข้อมูล...</span>
  </div>

  <div id="report"></div>

<script>
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var connectionId = params.get("conn") || "c1788406814359"; // MAC5
  var dateFrom = params.get("from") || "";
  var dateTo = params.get("to") || "";
  var employee = params.get("emp") || "";
  var HOSTNAME = "<?= php_uname('n') ?>";

  // จำนวนแถวต่อหน้า — วัดความสูงจริงจาก DOM (ฟอนต์/padding อาจเปลี่ยน)
  // เนื้อร่าง = A4 landscape (210mm) − ขอบบน 20mm − ข้างล่าง 15mm = 175mm
  var PAGE_CONTENT_MM = 175;

  var ALL_EMPLOYEES = "ACC902, ACC903, ACC301, ACC302, ACC303, ACC201, ACC202";
  var EMP_LABELS = {
    ACC902: "ACC902", ACC903: "ACC903", ACC302: "ACC302", ACC301: "ACC301",
    ACC303: "ACC303", ACC201: "ACC201-(จิตร)", ACC202: "ACC202-(แพร)"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }
  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function fmtMoney(v) { return moneyFmt.format(Number(v || 0)); }
  // dd/mm/yyyy (พ.ศ.) — จาก yyyy-mm-dd
  function fmtDateBE(ymd) {
    if (!ymd) return "-";
    var p = ymd.split("-");
    return p[2] + "/" + p[1] + "/" + (Number(p[0]) + 543);
  }
  function fmtDateDash(ymd) {
    if (!ymd) return "-";
    var p = ymd.split("-");
    return p[2] + "-" + p[1] + "-" + p[0];
  }
  function nowStamp() {
    var d = new Date();
    function z(n) { return String(n).padStart(2, "0"); }
    return z(d.getDate()) + "-" + z(d.getMonth() + 1) + "-" + d.getFullYear() + " " + z(d.getHours()) + ":" + z(d.getMinutes());
  }

  var container = document.getElementById("report");
  var info = document.getElementById("toolbarInfo");

  if (!dateFrom || !dateTo) {
    info.textContent = "❌ ไม่มีเงื่อนไขวันที่ — กดพิมพ์จากหน้า P031";
    container.innerHTML = '<div class="report-page"><div class="rep-empty">ไม่มีเงื่อนไขวันที่ — กดปุ่ม "พิมพ์รายงาน" จากหน้า P031</div></div>';
    return;
  }

  fetch("../api/p031_transfers.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId: connectionId, dateFrom: dateFrom, dateTo: dateTo, employee: employee })
  }).then(function (r) { return r.json(); }).then(function (data) {
    if (!data.ok) {
      info.textContent = "❌ " + (data.error || "โหลดข้อมูลไม่สำเร็จ");
      return;
    }
    var rows = data.rows || [];
    info.textContent = rows.length + " รายการ";

    if (rows.length === 0) {
      container.innerHTML = '<div class="report-page"><div class="rep-empty">ไม่มีข้อมูลในช่วงวันที่นี้</div></div>';
      return;
    }

    var total = 0;
    rows.forEach(function (r) { total += r.amount; });
    var empText = employee === "" ? ALL_EMPLOYEES : (EMP_LABELS[employee] || employee);

    // --- วัดความสูงจริงจาก DOM (px → mm: 1mm = 96/25.4 px) ---
    var PX_PER_MM = 96 / 25.4;
    var contentPx = PAGE_CONTENT_MM * PX_PER_MM;

    // ใช้ page ที่ 1 เป็นที่วัด: หัวข้อ + เงื่อนไข + thead + row 1 + pageno
    var probe = document.createElement("div");
    probe.style.cssText = "position:absolute;left:-99999px;top:0;width:271mm;padding:0;";
    var probeRow = document.createElement("tr");
    probeRow.innerHTML =
      '<td class="c">1</td><td class="l">X</td><td class="c">X</td><td class="c">X</td>' +
      '<td class="l">X</td><td class="l">X</td><td class="r">X</td><td class="r">X</td><td></td>';
    probe.innerHTML =
      '<h1 class="rep-title">รายงานเงินโอนประจำวัน</h1>' +
      '<div class="rep-meta">' +
        '<div class="left">วันที่ x ถึง วันที่ x<br>รหัสพนักงาน : ' + esc(empText) + '</div>' +
        '<div class="right">พิมพ์โดย : ' + esc(HOSTNAME) + ' x</div>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
        '<thead><tr>' +
          '<th class="c" style="width:4.39%">ลำดับ</th><th class="l" style="width:9.76%">เลขที่</th>' +
          '<th class="c" style="width:8.78%">วันที่</th><th class="c" style="width:8.78%">รหัสลูกค้า</th>' +
          '<th class="l" style="width:21.46%">ชื่อลูกค้า</th><th class="l" style="width:21.95%">บัญชี</th>' +
          '<th class="r" style="width:11.22%">จำนวนเงิน</th><th class="r" style="width:5.37%">ส่วนลด</th>' +
          '<th class="c" style="width:8.29%">ผู้ตรวจสอบ</th>' +
        '</tr></thead><tbody>' +
        '<tr class="probe-row">' + probeRow.innerHTML + '</tr>' +
        '<tr class="probe-total"><td colspan="6" class="r">รวม</td><td class="r">0</td><td></td><td></td></tr>' +
        '</tbody></table>' +
      '<div class="rep-pageno">หน้า 1/1</div>';
    document.body.appendChild(probe);

    function hOf(sel) {
      var el = probe.querySelector(sel);
      return el ? el.getBoundingClientRect().height : 0;
    }
    var titleH = hOf(".rep-title");
    var metaH = hOf(".rep-meta");
    var theadH = hOf("thead");
    var rowH = hOf(".probe-row");
    var totalH = hOf(".probe-total");
    var pagenoH = hOf(".rep-pageno");
    var headerH = titleH + metaH + theadH + pagenoH; // ส่วนที่ไม่ใช่แถว (รวมแถวสุดท้าย)
    document.body.removeChild(probe);

    // แถวต่อหน้า = (เนื้อร่าง − หัว−หน้า − แถว "รวม" หน้าสุดท้าย) / ความสูงแถว
    var rowsPerPage = Math.floor((contentPx - headerH - totalH) / rowH);
    if (rowsPerPage < 1) rowsPerPage = 1;

    // --- แบ่ง rows เป็นหน้า — หน้าสุดท้าย + แถวรวม ---
    var pages = [];
    for (var i = 0; i < rows.length; i += rowsPerPage) {
      pages.push(rows.slice(i, i + rowsPerPage));
    }
    var totalPages = pages.length;

    var headHtml =
      '<h1 class="rep-title">รายงานเงินโอนประจำวัน</h1>' +
      '<div class="rep-meta">' +
        '<div class="left">' +
          "วันที่ " + fmtDateDash(dateFrom) + " ถึง วันที่ " + fmtDateDash(dateTo) + "<br>" +
          "รหัสพนักงาน : " + esc(empText) +
        "</div>" +
        '<div class="right">พิมพ์โดย : ' + esc(HOSTNAME) + " " + nowStamp() + "</div>" +
      "</div>" +
      "<table>" +
        "<thead><tr>" +
          '<th class="c" style="width:4.39%">ลำดับ</th>' +
          '<th class="l" style="width:9.76%">เลขที่</th>' +
          '<th class="c" style="width:8.78%">วันที่</th>' +
          '<th class="c" style="width:8.78%">รหัสลูกค้า</th>' +
          '<th class="l" style="width:21.46%">ชื่อลูกค้า</th>' +
          '<th class="l" style="width:21.95%">บัญชี</th>' +
          '<th class="r" style="width:11.22%">จำนวนเงิน</th>' +
          '<th class="r" style="width:5.37%">ส่วนลด</th>' +
          '<th class="c" style="width:8.29%">ผู้ตรวจสอบ</th>' +
        "</tr></thead>";

    var html = "";
    pages.forEach(function (pageRows, pIdx) {
      var isLast = (pIdx === totalPages - 1);
      var body = "";
      pageRows.forEach(function (r, i) {
        var seq = pIdx * rowsPerPage + i + 1;
        body += "<tr>" +
          '<td class="c">' + seq + "</td>" +
          '<td class="l">' + esc(r.no) + "</td>" +
          '<td class="c">' + fmtDateBE(r.date) + "</td>" +
          '<td class="c">' + esc(r.cus) + "</td>" +
          '<td class="l">' + esc(r.name) + "</td>" +
          '<td class="l">' + esc(r.account) + "</td>" +
          '<td class="r">' + fmtMoney(r.amount) + "</td>" +
          '<td class="r">' + fmtMoney(r.discount) + "</td>" +
          "<td></td>" +
          "</tr>";
      });
      if (isLast) {
        body += '<tr class="total-row">' +
          '<td colspan="6" class="r">รวม</td>' +
          '<td class="r">' + fmtMoney(total) + "</td>" +
          "<td></td>" +
          "<td></td>" +
          "</tr>";
      }
      html += '<div class="report-page">' +
        headHtml +
        "<tbody>" + body + "</tbody>" +
        "</table>" +
        '<div class="rep-pageno">หน้า ' + (pIdx + 1) + "/" + totalPages + "</div>" +
        "</div>";
    });

    container.innerHTML = html;
  }).catch(function (e) {
    info.textContent = "❌ " + e.message;
  });
})();
</script>
</body>
</html>
