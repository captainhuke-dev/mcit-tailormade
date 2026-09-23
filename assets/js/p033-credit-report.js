/* P033 — รายงานลูกค้าที่มียอดค้างเกินวงเงิน (UI ตาม demo/P033_demo.html — MOCK DATA — TODO: fetch API) */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var fmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(v) { return fmt.format(Number(v || 0)); }

  var ICONS = {
    list: '<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path></svg>',
    chart: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18"></path><path d="m7 16 4-5 4 3 5-7"></path></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>'
  };

  var CSS = [
    ".p033{--p033-primary:#2563eb;--p033-primary-dark:#1d4ed8;--p033-primary-soft:#eff6ff;--p033-success:#059669;--p033-success-soft:#ecfdf5;--p033-warning:#d97706;--p033-warning-soft:#fffbeb;--p033-danger:#dc2626;--p033-danger-soft:#fef2f2;--p033-purple:#7c3aed;--p033-purple-soft:#f5f3ff;--p033-text:#172033;--p033-muted:#64748b;--p033-border:#e2e8f0;--p033-surface:#fff;--p033-surface-soft:#f8fafc;font-family:inherit;color:var(--p033-text)}",
    ".p033 svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    /* launcher */
    ".p033-launcher{display:grid;grid-template-columns:minmax(300px,1fr) auto auto;gap:12px;align-items:end;padding:16px;border:1px solid var(--p033-border);border-radius:16px;background:var(--p033-surface);box-shadow:0 5px 18px rgba(15,23,42,.04)}",
    ".p033-field label{display:block;margin-bottom:6px;color:var(--p033-muted);font-size:11px;font-weight:600}",
    ".p033-inputwrap{position:relative}",
    ".p033-inputwrap>svg{position:absolute;top:50%;left:13px;z-index:1;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p033-inputwrap select{width:100%;height:44px;padding:0 40px 0 42px;color:var(--p033-text);border:1px solid var(--p033-border);border-radius:11px;outline:none;background:#fff;cursor:pointer;appearance:none;font:inherit}",
    ".p033-inputwrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p033-selectarrow{position:absolute;top:50%;right:13px;width:16px;height:16px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p033-launchbtn,.p033-previewbtn{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 20px;border-radius:11px;font-weight:700;white-space:nowrap;transition:.18s ease;cursor:pointer;font-size:13px}",
    ".p033-launchbtn{color:#fff;border:0;background:linear-gradient(135deg,#3b82f6,var(--p033-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,.22)}",
    ".p033-launchbtn:hover{filter:brightness(1.06);transform:translateY(-1px)}",
    ".p033-previewbtn{color:var(--p033-primary-dark);border:1px solid #bfdbfe;background:var(--p033-primary-soft)}",
    ".p033-previewbtn:hover{color:#fff;border-color:var(--p033-primary);background:var(--p033-primary)}",
    /* summary */
    /* panel */
    ".p033-panel{display:flex;min-height:480px;flex-direction:column;margin-top:14px;border:1px solid var(--p033-border);border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08);overflow:hidden}",
    ".p033-panelhd{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid var(--p033-border)}",
    ".p033-panelhead{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p033-panelicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p033-primary);border-radius:11px;background:var(--p033-primary-soft)}",
    ".p033-paneltitle{min-width:0}",
    ".p033-paneltitle h2{overflow:hidden;font-size:15px;text-overflow:ellipsis;white-space:nowrap;margin:0}",
    ".p033-paneltitle p{overflow:hidden;margin:1px 0 0;color:var(--p033-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p033-panelact{display:flex;align-items:center;gap:8px}",
    ".p033-tsearch{position:relative;width:250px}",
    ".p033-tsearch svg{position:absolute;top:50%;left:10px;width:15px;height:15px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p033-tsearch input{width:100%;height:36px;padding:0 10px 0 32px;border:1px solid var(--p033-border);border-radius:9px;outline:none;font-size:12px;font:inherit}",
    ".p033-tsearch input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.12)}",
    ".p033-badge{padding:5px 10px;color:var(--p033-primary-dark);border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    /* table */
    ".p033-twrap{overflow:auto}",
    ".p033-table{width:100%;min-width:1150px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p033-table th{position:sticky;top:0;z-index:2;padding:13px 14px;color:#475569;border-bottom:1px solid var(--p033-border);background:var(--p033-surface-soft);box-shadow:inset 0 -1px var(--p033-border);font-size:14px;font-weight:700;text-align:left;user-select:none}",
    ".p033-table th.sortable{cursor:pointer}",
    ".p033-table th.sortable:hover{color:var(--p033-primary);background:#f1f5f9}",
    ".p033-table td{max-width:330px;overflow:hidden;padding:11px 14px;border-bottom:1px solid #edf1f6;font-size:14px;line-height:1.5;text-overflow:ellipsis}",
    ".p033-table .center{text-align:center}",
    ".p033-table .number{text-align:right}",
    ".p033-table tbody tr{cursor:pointer;transition:.14s ease}",
    ".p033-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p033-table tbody tr:hover{background:#f0f7ff}",
    ".p033-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 var(--p033-primary)}",
    ".p033-selcell{width:38px;padding:0 6px;text-align:center}",
    ".p033-rowselector{display:inline-block;visibility:hidden;width:0;height:0;border-top:7px solid transparent;border-bottom:7px solid transparent;border-left:10px solid var(--p033-primary)}",
    ".p033-table tr.selected .p033-rowselector{visibility:visible}",
    ".p033-code{color:var(--p033-primary-dark);font-weight:700}",
    ".p033-amount{color:#0f172a;font-variant-numeric:tabular-nums;font-weight:700}",
    ".p033-amount.danger{color:var(--p033-danger)}",
    ".p033-grade{display:inline-flex;min-width:28px;justify-content:center;padding:4px 8px;color:#1d4ed8;border-radius:7px;background:#dbeafe;font-size:12px;font-weight:700}",
    ".p033-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:99px;font-size:11px;font-weight:700}",
    ".p033-chip.normal{color:#047857;background:#d1fae5}",
    ".p033-chip.warning{color:#b45309;background:#fef3c7}",
    ".p033-chip.over{color:#b91c1c;background:#fee2e2}",
    ".p033-chip::before{width:6px;height:6px;border-radius:50%;background:currentColor;content:''}",
    /* empty */
    ".p033-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:60px 20px;color:var(--p033-muted)}",
    ".p033-empty svg{width:44px;height:44px;color:#cbd5e1}",
    ".p033-empty strong{font-size:14px;color:var(--p033-text)}",
    ".p033-empty span{font-size:12px}",
    /* footer */
    ".p033-tfoot{display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;border-top:1px solid var(--p033-border);background:var(--p033-surface-soft);font-size:12px}",
    ".p033-tfoot>span{color:var(--p033-muted)}",
    ".p033-pager{display:flex;justify-content:center;align-items:center;gap:6px;padding:10px 15px 0}",
    ".p033-pbtn{min-width:32px;height:32px;padding:0 8px;color:var(--p033-muted);border:1px solid var(--p033-border);border-radius:8px;background:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:.15s ease;font-family:inherit}",
    ".p033-pbtn:hover:not(:disabled){color:var(--p033-primary);border-color:#bfdbfe;background:var(--p033-primary-soft)}",
    ".p033-pbtn.act{color:#fff;border-color:var(--p033-primary);background:var(--p033-primary)}",
    ".p033-pbtn:disabled{opacity:.4;cursor:default}",
    ".p033-ftotals{display:flex;align-items:center;gap:8px}",
    ".p033-ftotal{display:flex;align-items:center;gap:7px;padding:6px 11px;border:1px solid var(--p033-border);border-radius:9px;background:#fff}",
    ".p033-ftotal span{color:var(--p033-muted)}",
    ".p033-ftotal strong{font-size:13px}",
    /* modal */
    ".p033-modalbd{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.52);backdrop-filter:blur(4px)}",
    ".p033-modalbd.show{display:grid}",
    ".p033-modal{display:flex;width:min(1120px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
    ".p033-modalhd{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--p033-border)}",
    ".p033-mhead{display:flex;align-items:center;gap:10px}",
    ".p033-micon{display:grid;width:38px;height:38px;place-items:center;color:var(--p033-primary);border-radius:11px;background:var(--p033-primary-soft)}",
    ".p033-mhead h3{margin:0;font-size:15px}",
    ".p033-mhead p{margin:0;color:var(--p033-muted);font-size:10px}",
    ".p033-mact{display:flex;gap:6px}",
    ".p033-mbtn,.p033-mclose{display:inline-flex;height:36px;align-items:center;justify-content:center;gap:6px;padding:0 11px;color:var(--p033-muted);border:1px solid var(--p033-border);border-radius:9px;background:#fff;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}",
    ".p033-mbtn.print{color:#fff;border-color:var(--p033-primary);background:var(--p033-primary)}",
    ".p033-zoomval{display:flex;align-items:center;justify-content:center;min-width:48px;height:36px;color:var(--p033-muted);font-size:11px;font-weight:700;font-variant-numeric:tabular-nums}",
    ".p033-mbtn{white-space:nowrap}",
    ".p033-mclose{width:36px;padding:0;font-size:20px}",
    ".p033-mclose:hover{color:var(--p033-danger);border-color:#fecaca;background:var(--p033-danger-soft)}",
    ".p033-pvarea{position:relative;min-height:0;flex:1;overflow:auto;background-color:#d7dde5}",
    ".p033-pvstage{display:flex;flex-direction:column;align-items:center;min-width:100%;min-height:100%;padding:42px;gap:28px}",
    /* paper A4 landscape — ขอบกระดาษ 15pt (20px) ทั้ง 4 ด้าน — print: @page margin 15pt + paper padding 0 */
    ".p033-paper{width:1123px;min-height:794px;box-sizing:border-box;padding:33.33px 26.67px;color:#111827;background:#fff;box-shadow:0 20px 52px rgba(15,23,42,.32)}",
    ".p033-phead{position:relative;display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px}",
    ".p033-pprint{flex:1;font-size:11px;text-align:left}",
    ".p033-ptime{position:absolute;left:50%;transform:translateX(-50%);margin:0;font-size:20px;text-align:center;white-space:nowrap}",
    ".p033-ppage{font-size:12px;white-space:nowrap}",
    ".p033-ptable{width:800pt;border-collapse:collapse;table-layout:fixed}",
    ".p033-ptable th{padding:7px 6px;color:#111827;border:1px solid #000;background:#e2e8f0;font-size:10px;text-align:left}",
    ".p033-ptable td{padding:5px 6px;border:1px solid #000;font-size:10px;vertical-align:top;overflow-wrap:anywhere}",
    ".p033-ptable .number{text-align:right}",
    ".p033-ptable .center{text-align:center}",
    ".p033-zoomlbl{position:absolute;right:15px;bottom:14px;padding:6px 9px;color:#fff;border-radius:8px;background:rgba(15,23,42,.78);font-size:10px}",
    /* toast */
    ".p033-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
    ".p033-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p033-toast svg{width:17px;height:17px;color:#34d399}",
    /* print */
    "@media print{" +
    "@page{size:A4 landscape;margin:25pt 20pt}" +
    "body *{visibility:hidden !important}" +
    ".p033-paper,.p033-paper *{visibility:visible !important}" +
    ".p033-pvarea{overflow:visible !important;background:none !important}" +
    ".p033-pvstage{display:block !important;padding:0 !important;min-height:0 !important}" +
    ".p033-paper{width:100% !important;min-height:0 !important;padding:0 !important;box-shadow:none !important;transform:none !important;page-break-after:always;break-after:page}" +
    ".p033-paper:last-of-type{page-break-after:auto;break-after:auto}" +
    ".p033-ptable th,.p033-ptable td{padding:4px;font-size:8px}" +
    "}",
    "@media (max-width:850px){.p033-launcher{grid-template-columns:1fr}}"
  ].join("\n");

  var MAC5_CONNECTION_ID = "c1788406814359";

  var REPORT_TITLE = "รายงานลูกค้าที่มียอดค้างเกินวงเงิน";

  function totalDebt(it) { return (it.outstanding || 0) + (it.orderAmount || 0) + (it.cheque || 0) + (it.pending || 0); }
  function overCredit(it) { return Math.max(0, totalDebt(it) - (it.credit || 0)); }
  function statusOf(it) {
    if (overCredit(it) > 0) return { text: "เกินวงเงิน", cls: "over" };
    if (totalDebt(it) > (it.credit || 0) * 0.8) return { text: "ใกล้เต็มวงเงิน", cls: "warning" };
    return { text: "ปกติ", cls: "normal" };
  }

  function sortRows(items, field, dir) {
    return items.slice().sort(function (a, b) {
      var f = a[field], s = b[field];
      if (typeof f === "string") { f = f.toLocaleLowerCase("th"); s = String(s).toLocaleLowerCase("th"); }
      if (f < s) return dir === "asc" ? -1 : 1;
      if (f > s) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function mount(root) {
    var state = {
      rows: [],
      filtered: [],
      searched: false,
      loading: false,
      page: 1,
      selectedCode: null,
      sortField: "code",
      sortDir: "asc",
      zoom: 90,
      toastTimer: null,
      escBound: false
    };

    root.innerHTML =
      '<div class="p033">' +
        '<form class="p033-launcher" id="p033Form">' +
          '<div class="p033-field">' +
            '<label for="p033Type">เลือกรายการรายงาน</label>' +
            '<div class="p033-inputwrap">' + ICONS.list +
              '<select id="p033Type">' +
                '<option value="all">ทั้งหมด</option>' +
                '<option value="overCredit">ยอดค้าง-เกินวงเงิน</option>' +
                '<option value="inCredit">ยอดค้าง-อยู่ในวงเงิน</option>' +
              '</select>' +
              '<svg class="p033-selectarrow" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>' +
            '</div>' +
          '</div>' +
          '<button class="p033-launchbtn" type="submit">' + ICONS.chart + 'แสดงรายการ</button>' +
          '<button class="p033-previewbtn" id="p033PreviewBtn" type="button">' + ICONS.eye + 'ตัวอย่างก่อนพิมพ์</button>' +
        '</form>' +

        '<section class="p033-panel">' +
          '<div class="p033-panelhd">' +
            '<div class="p033-panelhead"><div class="p033-panelicon">' + ICONS.grid + '</div>' +
              '<div class="p033-paneltitle"><h2 id="p033Title">รายงานลูกหนี้ทั้งหมด</h2><p id="p033Sub">ข้อมูลคงค้างและวงเงินเครดิตปัจจุบัน</p></div>' +
            '</div>' +
            '<div class="p033-panelact">' +
              '<div class="p033-tsearch">' + ICONS.search + '<input id="p033Quick" type="search" placeholder="ค้นหารหัสหรือชื่อลูกหนี้"></div>' +
              '<span class="p033-badge" id="p033Badge">0 รายการ</span>' +
            '</div>' +
          '</div>' +
          '<div class="p033-twrap" id="p033Twrap">' +
            '<table class="p033-table">' +
              '<thead><tr>' +
                '<th class="p033-selcell"></th>' +
                '<th class="sortable" data-sort="code">รหัสลูกหนี้</th>' +
                '<th class="sortable" data-sort="name">ชื่อลูกหนี้</th>' +
                '<th class="center sortable" data-sort="grade">เกรด</th>' +
                '<th class="number sortable" data-sort="outstanding">ค้างชำระ</th>' +
                '<th class="number sortable" data-sort="orderAmount">คำสั่งส่ง</th>' +
                '<th class="number sortable" data-sort="cheque">ค้างเช็ค</th>' +
                '<th class="number sortable" data-sort="pending">รออนุมัติ</th>' +
                '<th class="number sortable" data-sort="credit">วงเงิน</th>' +
                '<th class="center">สถานะ</th>' +
              '</tr></thead>' +
              '<tbody id="p033Rows"></tbody>' +
            '</table>' +
          '</div>' +
          '<div class="p033-pager" id="p033Pager"></div>' +
          '<div class="p033-tfoot">' +
            '<span id="p033Desc">แสดง 0 รายการ</span>' +
            '<div class="p033-ftotals">' +
              '<div class="p033-ftotal"><span>ยอดค้างรวม</span><strong id="p033FtOut">฿0.00</strong></div>' +
              '<div class="p033-ftotal"><span>ยอดเกินวงเงิน</span><strong id="p033FtOver">฿0.00</strong></div>' +
            '</div>' +
          '</div>' +
        '</section>' +

      '<div class="p033-modalbd" id="p033Modal">' +
        '<section class="p033-modal">' +
          '<div class="p033-modalhd">' +
            '<div class="p033-mhead"><div class="p033-micon">' + ICONS.doc + '</div>' +
              '<div><h3>ตัวอย่างรายงานลูกหนี้</h3><p id="p033PvSub">ข้อมูลสำหรับพิมพ์รายงาน</p></div>' +
            '</div>' +
            '<div class="p033-mact">' +
              '<button class="p033-mbtn" id="p033ZoomOut" type="button" title="เล็กลง">−</button>' +
              '<span class="p033-zoomval" id="p033ZoomVal">90%</span>' +
              '<button class="p033-mbtn" id="p033ZoomIn" type="button" title="ขยาย">+</button>' +
              '<button class="p033-mbtn" id="p033Fit" type="button" title="พอดีหน้าจอ">fit</button>' +
              '<button class="p033-mbtn print" id="p033PrintBtn" type="button">' + ICONS.print + '<span>พิมพ์เอกสาร</span></button>' +
              '<button class="p033-mclose" id="p033Close" type="button">×</button>' +
            '</div>' +
          '</div>' +
          '<div class="p033-pvarea"><div class="p033-pvstage" id="p033Stage"></div>' +
          '<span class="p033-zoomlbl">A4 Landscape</span></div>' +
        '</div>' +
      '</div>' +

      '<article class="p033-paper" id="p033PaperTpl" style="display:none">' +
        '<header class="p033-phead">' +
          '<span class="p033-pprint">พิมพ์เมื่อ -</span>' +
          '<h1 class="p033-ptime">รายงานลูกหนี้ทั้งหมด</h1>' +
          '<span class="p033-ppage">หน้า 1 จาก 1</span>' +
        '</header>' +
        '<table class="p033-ptable">' +
          '<colgroup>' +
            '<col style="width:60pt"><col style="width:220pt"><col style="width:30pt">' +
            '<col style="width:70pt"><col style="width:70pt"><col style="width:70pt"><col style="width:70pt">' +
            '<col style="width:70pt"><col style="width:70pt"><col style="width:70pt">' +
          '</colgroup>' +
          '<thead><tr>' +
            '<th>รหัส</th>' +
            '<th>ชื่อลูกหนี้</th>' +
            '<th class="center">เกรด</th>' +
            '<th class="number">ค้างชำระ</th>' +
            '<th class="number">คำสั่งส่ง</th>' +
            '<th class="number">ค้างเช็ค</th>' +
            '<th class="number">รออนุมัติ</th>' +
            '<th class="number">วงเงิน</th>' +
            '<th></th><th></th>' +
          '</tr></thead>' +
          '<tbody class="p033-prows"></tbody>' +
        '</table>' +
      '</article>' +

      '<div class="p033-toast" id="p033Toast">' + ICONS.check + '<span id="p033ToastMsg"></span></div>' +
      '</div>';

    var style = document.createElement("style");
    style.textContent = CSS;
    root.appendChild(style);

    var el = {
      form: $("#p033Form", root), type: $("#p033Type", root),
      previewBtn: $("#p033PreviewBtn", root),
      title: $("#p033Title", root), sub: $("#p033Sub", root),
      quick: $("#p033Quick", root), badge: $("#p033Badge", root),
      rows: $("#p033Rows", root), twrap: $("#p033Twrap", root),
      desc: $("#p033Desc", root), ftOut: $("#p033FtOut", root), ftOver: $("#p033FtOver", root),
      pager: $("#p033Pager", root),
      modal: $("#p033Modal", root), close: $("#p033Close", root), printBtn: $("#p033PrintBtn", root),
      zoomIn: $("#p033ZoomIn", root), zoomOut: $("#p033ZoomOut", root), zoomVal: $("#p033ZoomVal", root), fitBtn: $("#p033Fit", root),
      pvSub: $("#p033PvSub", root),
      stage: $("#p033Stage", root), tpl: $("#p033PaperTpl", root),
      toast: $("#p033Toast", root), toastMsg: $("#p033ToastMsg", root)
    };

    function toast(msg) {
      el.toastMsg.textContent = msg;
      el.toast.classList.add("show");
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, 1800);
    }

    function emptyHtml() {
      if (!state.searched) {
        return '<tr><td colspan="10"><div class="p033-empty">' + ICONS.search +
          '<strong>ยังไม่มีข้อมูล</strong><span>เลือกรายการรายงาน แล้วกด ปุ่ม แสดงรายการ เพื่อโหลดข้อมูล</span></div></td></tr>';
      }
      return '<tr><td colspan="10"><div class="p033-empty">' + ICONS.grid +
        '<strong>ไม่พบลูกหนี้ตามเงื่อนไข</strong><span>ลองเปลี่ยนรายการรายงานหรือคำค้นหา</span></div></td></tr>';
    }

    var PAGE_SIZE = 15;

    function renderRows() {
      var items = sortRows(state.filtered, state.sortField, state.sortDir);

      // footer totals (รวมทั้ง filtered — ไม่ใช่แค่หน้า)
      var out = 0, over = 0;
      items.forEach(function (it) {
        out += it.outstanding || 0;
        over += overCredit(it);
      });
      el.ftOut.textContent = "฿" + money(out);
      el.ftOver.textContent = "฿" + money(over);
      el.badge.textContent = items.length + " รายการ";

      // pagination
      var totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = items.slice(start, start + PAGE_SIZE);

      el.desc.textContent = state.searched && items.length
        ? "แสดง " + (start + 1) + "–" + (start + pageItems.length) + " จาก " + items.length + " รายการ"
        : "แสดง 0 รายการ";

      if (!items.length) { el.rows.innerHTML = emptyHtml(); el.pager.innerHTML = ""; return; }

      el.rows.innerHTML = pageItems.map(function (it) {
        var st = statusOf(it);
        var sel = it.code === state.selectedCode ? " selected" : "";
        return '<tr class="' + sel.trim() + '" data-code="' + escapeHtml(it.code) + '">' +
          '<td class="p033-selcell"><span class="p033-rowselector"></span></td>' +
          '<td class="p033-code">' + escapeHtml(it.code) + '</td>' +
          '<td title="' + escapeHtml(it.name) + '">' + escapeHtml(it.name) + '</td>' +
          '<td class="center"><span class="p033-grade">' + escapeHtml(it.grade) + '</span></td>' +
          '<td class="number p033-amount">' + money(it.outstanding) + '</td>' +
          '<td class="number p033-amount">' + money(it.orderAmount) + '</td>' +
          '<td class="number p033-amount">' + money(it.cheque) + '</td>' +
          '<td class="number p033-amount">' + money(it.pending) + '</td>' +
          '<td class="number p033-amount' + (overCredit(it) > 0 ? " danger" : "") + '">' + money(it.credit) + '</td>' +
          '<td class="center"><span class="p033-chip ' + st.cls + '">' + st.text + '</span></td>' +
        '</tr>';
      }).join("");

      renderPager(totalPages);
    }

    function renderPager(totalPages) {
      if (totalPages <= 1) { el.pager.innerHTML = ""; return; }
      var html = '<button class="p033-pbtn" data-page="prev" type="button"' + (state.page <= 1 ? " disabled" : "") + '>‹</button>';
      var lo = Math.max(1, state.page - 3), hi = Math.min(totalPages, lo + 6);
      lo = Math.max(1, hi - 6);
      for (var p = lo; p <= hi; p++) {
        html += '<button class="p033-pbtn' + (p === state.page ? " act" : "") + '" data-page="' + p + '" type="button">' + p + '</button>';
      }
      html += '<button class="p033-pbtn" data-page="next" type="button"' + (state.page >= totalPages ? " disabled" : "") + '>›</button>';
      el.pager.innerHTML = html;
    }

    function applyFilters() {
      var mode = el.type.value;
      var kw = el.quick.value.trim().toLowerCase();
      state.filtered = state.rows.filter(function (it) {
        var matchKw = !kw || (it.code + " " + it.name).toLowerCase().indexOf(kw) !== -1;
        var matchMode = true;
        if (mode === "overCredit") matchMode = overCredit(it) > 0;
        if (mode === "inCredit") matchMode = totalDebt(it) <= (it.credit || 0);
        return matchKw && matchMode;
      });
      el.title.textContent = REPORT_TITLE;
      state.searched = true;
      state.page = 1;
      renderRows();
    }

    // A4 landscape: 1123×794px — margin 15pt (20px) — content 1083×754px
    var PAPER_W = 1123, PAPER_H = 794, PAPER_MT = 33.33, PAPER_MR = 26.67;

    function rowHtml(it) {
      return '<tr>' +
        '<td>' + escapeHtml(it.code) + '</td>' +
        '<td>' + escapeHtml(it.name) + '</td>' +
        '<td class="center">' + escapeHtml(it.grade) + '</td>' +
        '<td class="number">' + money(it.outstanding) + '</td>' +
        '<td class="number">' + money(it.orderAmount) + '</td>' +
        '<td class="number">' + money(it.cheque) + '</td>' +
        '<td class="number">' + money(it.pending) + '</td>' +
        '<td class="number">' + money(it.credit) + '</td>' +
        '<td></td><td></td>' +
      '</tr>';
    }

    function pad2(n) { return (n < 10 ? "0" : "") + n; }

    function printStamp() {
      var d = new Date();
      return "พิมพ์เมื่อ " + pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + (d.getFullYear() + 543) +
        " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
    }

    function renderPreview() {
      var items = sortRows(state.filtered, state.sortField, state.sortDir);
      var title = REPORT_TITLE;
      var stamp = printStamp();

      // measure ALL row heights (names wrap to 23px or 35px — varies per row)
      // NOTE: modal is display:none when this runs — probe must live in a detached hidden
      // container (visibility:hidden keeps layout) or all offsetHeights = 0
      var probe = el.tpl.cloneNode(true);
      probe.style.display = "block";
      probe.querySelector(".p033-prows").innerHTML = items.map(rowHtml).join("");
      probe.style.position = "absolute";
      probe.style.left = "-99999px";
      probe.style.top = "0";
      probe.style.visibility = "hidden";
      document.body.appendChild(probe);
      var trs = probe.querySelectorAll(".p033-prows tr");
      var rowHs = [];
      for (var k = 0; k < trs.length; k++) rowHs.push(trs[k].offsetHeight || 23);
      var headH = probe.querySelector(".p033-phead").offsetHeight || 40;
      var theadH = probe.querySelector(".p033-ptable thead").offsetHeight || 24;
      document.body.removeChild(probe);
      // paper budget: padding 2×20 + header + header margin 12 + thead + rows ≤ 794
      var budget = PAPER_H - PAPER_MT * 2 - headH - 12 - theadH - 6;

      // chunk pages by cumulative row height
      var pages = [];
      var page = [];
      var cum = 0;
      for (var r = 0; r < items.length; r++) {
        if (page.length && cum + rowHs[r] > budget) {
          pages.push(page);
          page = [];
          cum = 0;
        }
        page.push(items[r]);
        cum += rowHs[r];
      }
      if (page.length) pages.push(page);
      if (!pages.length) pages.push([]);

      var totalPages = pages.length;
      el.stage.innerHTML = "";
      for (var p = 1; p <= totalPages; p++) {
        (function (p) {
          var paper = el.tpl.cloneNode(true);
          paper.style.display = "";
          paper.querySelector(".p033-pprint").textContent = stamp;
          paper.querySelector(".p033-ptime").textContent = title;
          paper.querySelector(".p033-ppage").textContent = "หน้า " + p + " จาก " + totalPages;
          paper.querySelector(".p033-prows").innerHTML = pages[p - 1].map(rowHtml).join("");
          el.stage.appendChild(paper);
        })(p);
      }

      el.pvSub.textContent = items.length + " รายการ — " + title;
    }

    function openPreview() {
      if (!state.searched) { toast("แสดงรายการก่อนแล้วค่อยเปิดตัวอย่างก่อนพิมพ์"); return; }
      if (!state.filtered.length) { toast("ไม่มีรายการสำหรับพิมพ์"); return; }
      renderPreview();
      state.zoom = 90;
      updateScale();
      el.modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closePreview() {
      el.modal.classList.remove("show");
      document.body.style.overflow = "";
    }

    function updateScale() {
      var area = el.modal.querySelector(".p033-pvarea");
      if (!area) return;
      var papers = $$(".p033-paper", el.stage);
      if (!papers.length) return;
      var scale = state.zoom / 100;
      papers.forEach(function (p) {
        p.style.transformOrigin = "top center";
        p.style.transform = "scale(" + scale + ")";
        p.style.marginBottom = "-" + Math.round(PAPER_H * (1 - scale)) + "px";
      });
      if (el.zoomVal) el.zoomVal.textContent = state.zoom + "%";
    }

    function fitScale() {
      var area = el.modal.querySelector(".p033-pvarea");
      if (!area) return 1;
      return Math.max(0.25, (area.clientWidth - 84) / PAPER_W);
    }

    function setZoom(z) {
      state.zoom = Math.max(25, Math.min(200, Math.round(z)));
      updateScale();
    }

    // events
    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state.loading) return;
      state.loading = true;
      var mode = el.type.value;
      fetch("api/p033_search.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID, mode: mode })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          state.loading = false;
          if (!data || !data.ok) throw new Error("api");
          state.rows = data.rows || [];
          applyFilters();
          toast("แสดงรายงาน " + state.filtered.length + " รายการแล้ว");
        })
        .catch(function () {
          state.loading = false;
          state.rows = [];
          applyFilters();
          toast("โหลดข้อมูลล้มเหลว — ลองใหม่อีกครั้ง");
        });
    });

    el.quick.addEventListener("input", function () {
      if (state.searched) applyFilters();
    });

    $$("#p033Twrap th[data-sort]", root).forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-sort");
        if (state.sortField === f) { state.sortDir = state.sortDir === "asc" ? "desc" : "asc"; }
        else { state.sortField = f; state.sortDir = "asc"; }
        state.page = 1;
        renderRows();
      });
    });

    el.pager.addEventListener("click", function (e) {
      var btn = e.target.closest(".p033-pbtn");
      if (!btn || btn.disabled) return;
      var p = btn.getAttribute("data-page");
      var totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
      if (p === "prev") state.page = Math.max(1, state.page - 1);
      else if (p === "next") state.page = Math.min(totalPages, state.page + 1);
      else state.page = parseInt(p, 10) || 1;
      renderRows();
      el.twrap.scrollTop = 0;
    });

    el.rows.addEventListener("click", function (e) {
      var tr = e.target.closest("tr[data-code]");
      if (!tr) return;
      state.selectedCode = tr.getAttribute("data-code");
      renderRows();
    });

    el.previewBtn.addEventListener("click", openPreview);
    el.close.addEventListener("click", closePreview);
    el.modal.addEventListener("click", function (e) { if (e.target === el.modal) closePreview(); });
    el.printBtn.addEventListener("click", function () { window.print(); });
    el.zoomIn.addEventListener("click", function () { setZoom(state.zoom + 10); });
    el.zoomOut.addEventListener("click", function () { setZoom(state.zoom - 10); });
    el.fitBtn.addEventListener("click", function () { setZoom(fitScale() * 100); });

    if (!state.escBound) {
      state.escBound = true;
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && el.modal.classList.contains("show")) closePreview();
      });
    }

    renderRows();
  }

  window.P033CreditReport = { mount: mount };
})();
