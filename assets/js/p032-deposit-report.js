/* P032 — รายงานเงินมัดจำประจำวัน
 * IIFE — window.P032DepositReport = { mount }
 * Data: MAC5 (api/p032_deposits.php)
 */
(function () {
  "use strict";

  var API_URL = "api/p032_deposits.php";
  var MAC5_CONNECTION_ID = "c1788406814359";
  var PAGE_SIZE = 15;

  // รหัสพนักงาน (id → label) — ตาม SQL CHQkeyUser IN (...)
  var EMPLOYEES = [
    { id: "ACC902", label: "ACC902" },
    { id: "ACC903", label: "ACC903" },
    { id: "ACC302", label: "ACC302" },
    { id: "ACC301", label: "ACC301" },
    { id: "ACC303", label: "ACC303" },
    { id: "ACC201", label: "ACC201-(จิตร)" },
    { id: "ACC202", label: "ACC202-(แพร)" }
  ];

  var ICON_PATHS = {
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    card: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 9h.01M18 15h.01"/>',
    percent: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    grid: '<path d="M3 3h18v18H3z"/><path d="M3 9h18M9 3v18"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    spinner: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    chevdown: '<path d="m6 9 6 6 6-6"/>',
    chevleft: '<path d="m15 18-6-6 6-6"/>',
    chevright: '<path d="m9 18 6-6-6-6"/>'
  };

  function icon(name) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON_PATHS[name] || "") + "</svg>";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c];
    });
  }

  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function fmtMoney(v) { return moneyFmt.format(Number(v || 0)); }
  function fmtDate(ymd) {
    if (!ymd) return "-";
    var p = ymd.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function todayYmd() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  var CSS = [
    ".p032{--p032-primary:#2563eb;--p032-primary-dark:#1d4ed8;--p032-primary-soft:#eff6ff;--p032-success:#059669;--p032-success-soft:#ecfdf5;",
    "  --p032-warning:#d97706;--p032-warning-soft:#fffbeb;--p032-surface:#fff;--p032-surface-soft:#f8fafc;--p032-text:#172033;--p032-muted:#64748b;--p032-border:#e2e8f0;--p032-radius:16px;}",
    ".p032 *{box-sizing:border-box;}",
    ".p032 svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}",
    ".p032 button,.p032 input,.p032 select{font:inherit;}",
    ".p032 button{cursor:pointer;}",

    /* filter */
    ".p032-filter{display:grid;grid-template-columns:minmax(180px,.85fr) minmax(180px,.85fr) minmax(220px,1.1fr) auto auto;gap:13px;",
    "  padding:16px;border:1px solid var(--p032-border);border-radius:var(--p032-radius);background:var(--p032-surface);box-shadow:0 5px 18px rgba(15,23,42,.04);}",
    ".p032-field label{display:block;margin-bottom:6px;color:var(--p032-muted);font-size:11px;font-weight:600;}",
    ".p032-inputwrap{position:relative;}",
    ".p032-inputwrap>svg:first-child{position:absolute;top:50%;left:13px;z-index:1;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;}",
    ".p032-field input,.p032-field select{width:100%;height:43px;padding:0 40px 0 41px;color:var(--p032-text);border:1px solid var(--p032-border);border-radius:11px;outline:none;background:#fff;transition:.18s;}",
    ".p032-field select{cursor:pointer;appearance:none;}",
    ".p032-field input:focus,.p032-field select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14);}",
    ".p032-selectarrow{position:absolute;top:50%;right:13px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;}",
    ".p032-btn{display:inline-flex;height:43px;align-self:end;align-items:center;justify-content:center;gap:7px;padding:0 20px;border-radius:11px;font-weight:600;white-space:nowrap;transition:.18s;}",
    ".p032-btn-primary{color:#fff;border:0;background:linear-gradient(135deg,#3b82f6,var(--p032-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,.22);}",
    ".p032-btn-primary:hover{filter:brightness(1.06);transform:translateY(-1px);}",
    ".p032-btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;filter:none;}",
    ".p032-btn-secondary{color:var(--p032-text);border:1px solid var(--p032-border);background:#fff;}",
    ".p032-btn-secondary:hover{color:var(--p032-primary);border-color:#bfdbfe;background:var(--p032-primary-soft);}",
    ".p032-spin{animation:p032rot .8s linear infinite;}",
    "@keyframes p032rot{to{transform:rotate(360deg);}}",

    /* summary */
    ".p032-summary{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px;margin-top:14px;}",
    ".p032-sumcard{display:flex;min-width:0;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--p032-border);border-radius:14px;background:var(--p032-surface);box-shadow:0 4px 14px rgba(15,23,42,.04);}",
    ".p032-sumic{display:grid;width:42px;height:42px;flex:0 0 auto;place-items:center;color:var(--p032-primary);border-radius:12px;background:var(--p032-primary-soft);}",
    ".p032-sumcard.green .p032-sumic{color:var(--p032-success);background:var(--p032-success-soft);}",
    ".p032-sumcard.orange .p032-sumic{color:var(--p032-warning);background:var(--p032-warning-soft);}",
    ".p032-sumcard.purple .p032-sumic{color:#7c3aed;background:#f5f3ff;}",
    ".p032-sumtx{min-width:0;}",
    ".p032-sumtx span{display:block;color:var(--p032-muted);font-size:10px;}",
    ".p032-sumtx strong{display:block;overflow:hidden;margin-top:2px;font-size:18px;text-overflow:ellipsis;white-space:nowrap;}",

    /* panel */
    ".p032-panel{display:flex;min-height:470px;flex:1;flex-direction:column;overflow:hidden;margin-top:14px;",
    "  border:1px solid var(--p032-border);border-radius:var(--p032-radius);background:var(--p032-surface);box-shadow:0 12px 30px rgba(15,23,42,.08);}",
    ".p032-panel-hdr{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid var(--p032-border);}",
    ".p032-panel-hd{display:flex;min-width:0;align-items:center;gap:10px;}",
    ".p032-panel-ic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p032-primary);border-radius:11px;background:var(--p032-primary-soft);}",
    ".p032-panel-tx{min-width:0;}",
    ".p032-panel-tx h2{font-size:14px;margin:0;}",
    ".p032-panel-tx p{overflow:hidden;margin:1px 0 0;color:var(--p032-muted);font-size:10px;text-overflow:ellipsis;white-space:nowrap;}",
    ".p032-panel-actions{display:flex;align-items:center;gap:7px;}",
    ".p032-badge{padding:5px 10px;color:var(--p032-primary-dark);border-radius:99px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap;}",

    /* table */
    ".p032-tablewrap{min-height:0;flex:1;overflow:auto;}",
    ".p032-table{width:100%;min-width:1050px;border-collapse:separate;border-spacing:0;white-space:nowrap;}",
    ".p032-table th{position:sticky;top:0;z-index:5;padding:11px 12px;color:var(--p032-muted);border-bottom:1px solid var(--p032-border);",
    "  background:var(--p032-surface-soft);box-shadow:inset 0 -1px var(--p032-border);font-size:11px;font-weight:600;text-align:left;user-select:none;}",
    ".p032-table th.sortable{cursor:pointer;}",
    ".p032-table th.sortable:hover{color:var(--p032-primary);background:#f1f5f9;}",
    ".p032-sorticon{display:inline-block;margin-left:4px;color:#94a3b8;font-size:9px;}",
    ".p032-table td{max-width:320px;overflow:hidden;padding:10px 12px;border-bottom:1px solid #edf1f6;font-size:11px;text-overflow:ellipsis;}",
    ".p032-table .center{text-align:center;}",
    ".p032-table .number{text-align:right;}",
    ".p032-table tbody tr{cursor:pointer;transition:.14s ease;}",
    ".p032-table tbody tr:nth-child(even){background:#fbfdff;}",
    ".p032-table tbody tr:hover{background:#f0f7ff;}",
    ".p032-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 var(--p032-primary);}",
    ".p032-checkno{color:var(--p032-primary-dark);font-weight:700;}",
    ".p032-cuscode{color:#334155;font-variant-numeric:tabular-nums;font-weight:600;}",
    ".p032-account{color:#475569;}",
    ".p032-amount{color:#0f172a;font-variant-numeric:tabular-nums;font-weight:700;}",
    ".p032-discount{color:var(--p032-success);font-variant-numeric:tabular-nums;font-weight:700;}",
    ".p032-rowact{display:grid;width:29px;height:29px;margin:0 auto;place-items:center;color:var(--p032-muted);",
    "  border:1px solid var(--p032-border);border-radius:8px;background:#fff;transition:.15s;}",
    ".p032-rowact:hover{color:var(--p032-primary);border-color:#bfdbfe;background:var(--p032-primary-soft);}",
    ".p032-rowact svg{width:14px;height:14px;}",

    /* pager */
    ".p032-pager{display:none;align-items:center;gap:6px;padding:9px 12px;border-top:1px solid var(--p032-border);background:#fff;}",
    ".p032-pager.show{display:flex;}",
    ".p032-pagerbtn{display:grid;width:30px;height:30px;place-items:center;color:var(--p032-muted);border:1px solid var(--p032-border);border-radius:8px;background:#fff;transition:.15s;}",
    ".p032-pagerbtn:hover:not(:disabled){color:var(--p032-primary);border-color:#93c5fd;background:var(--p032-primary-soft);}",
    ".p032-pagerbtn:disabled{opacity:.4;cursor:default;}",
    ".p032-pagerbtn svg{width:16px;height:16px;}",
    ".p032-pg-pages{display:flex;align-items:center;gap:4px;}",
    ".p032-pg-num{min-width:30px;height:30px;padding:0 6px;color:var(--p032-muted);border:1px solid var(--p032-border);border-radius:8px;background:#fff;font-size:11px;font-weight:600;transition:.15s;}",
    ".p032-pg-num:hover:not(.active){color:var(--p032-primary);border-color:#93c5fd;background:var(--p032-primary-soft);}",
    ".p032-pg-num.active{color:#fff;border-color:var(--p032-primary);background:var(--p032-primary);}",
    ".p032-pg-num.ellipsis{border:0;background:none;cursor:default;}",
    ".p032-pg-info{margin-left:auto;color:var(--p032-muted);font-size:11px;white-space:nowrap;}",

    /* empty */
    ".p032-empty{display:none;min-height:300px;flex:1;align-items:center;justify-content:center;padding:30px;color:var(--p032-muted);text-align:center;}",
    ".p032-empty.show{display:flex;}",
    ".p032-empty-ic{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 11px;color:#94a3b8;border-radius:18px;background:#f1f5f9;}",
    ".p032-empty h3{color:var(--p032-text);font-size:15px;margin:0;}",
    ".p032-empty p{margin-top:4px;font-size:11px;}",

    /* dialog */
    ".p032-dialog-bd{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);}",
    ".p032-dialog-bd.show{display:grid;}",
    ".p032-dialog{width:min(560px,100%);overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 24px 65px rgba(15,23,42,.3);}",
    ".p032-dialog-hdr{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--p032-border);}",
    ".p032-dialog-hdr h3{font-size:15px;margin:0;}",
    ".p032-dialog-close{display:grid;width:32px;height:32px;place-items:center;color:var(--p032-muted);border:0;border-radius:8px;background:#f1f5f9;}",
    ".p032-dialog-close:hover{color:#dc2626;background:#fef2f2;}",
    ".p032-dialog-body{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:18px;}",
    ".p032-ditem{min-width:0;padding:11px 12px;border:1px solid var(--p032-border);border-radius:10px;background:var(--p032-surface-soft);}",
    ".p032-ditem.full{grid-column:1/-1;}",
    ".p032-ditem span{display:block;color:var(--p032-muted);font-size:10px;}",
    ".p032-ditem strong{display:block;overflow-wrap:anywhere;margin-top:3px;font-size:12px;}",

    /* toast */
    ".p032-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;",
    "  color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s;}",
    ".p032-toast.show{visibility:visible;opacity:1;transform:translateY(0);}",
    ".p032-toast svg{width:17px;height:17px;color:#34d399;}",

    /* responsive */
    "@media (max-width:1050px){.p032-filter{grid-template-columns:repeat(3,minmax(180px,1fr));}.p032-summary{grid-template-columns:repeat(2,minmax(180px,1fr));}}",
    "@media (max-width:720px){.p032-filter,.p032-summary{grid-template-columns:1fr;}.p032-btn{width:100%;}",
    "  .p032-panel-hdr{align-items:flex-start;flex-direction:column;}.p032-panel-actions{width:100%;}",
    "  .p032-dialog-body{grid-template-columns:1fr;}.p032-ditem.full{grid-column:auto;}}"
  ].join("\n");

  function slotEmployeeOptions() {
    var opts = '<option value="">All-ทั้งหมด</option>';
    EMPLOYEES.forEach(function (e) {
      opts += '<option value="' + esc(e.id) + '">' + esc(e.label) + "</option>";
    });
    return opts;
  }

  function buildHtml() {
    return `
    <div class="p032">
      <form class="p032-filter" id="p032Form" autocomplete="off">
        <div class="p032-field">
          <label for="p032DateFrom">ตั้งแต่วันที่</label>
          <div class="p032-inputwrap">${icon("calendar")}
            <input id="p032DateFrom" type="date" value="${todayYmd()}">
          </div>
        </div>
        <div class="p032-field">
          <label for="p032DateTo">จนถึงวันที่</label>
          <div class="p032-inputwrap">${icon("calendar")}
            <input id="p032DateTo" type="date" value="${todayYmd()}">
          </div>
        </div>
        <div class="p032-field">
          <label for="p032Employee">รหัสพนักงาน</label>
          <div class="p032-inputwrap">${icon("user")}
            <select id="p032Employee">${slotEmployeeOptions()}</select>
            <span class="p032-selectarrow">${icon("chevdown")}</span>
          </div>
        </div>
        <button class="p032-btn p032-btn-primary" id="p032SearchBtn" type="submit">${icon("search")} ค้นหา</button>
        <button class="p032-btn p032-btn-secondary" id="p032PrintBtn" type="button">${icon("print")} พิมพ์รายงาน</button>
      </form>

      <section class="p032-summary">
        <article class="p032-sumcard">
          <div class="p032-sumic">${icon("list")}</div>
          <div class="p032-sumtx"><span>จำนวนรายการ</span><strong id="p032SumCount">0</strong></div>
        </article>
        <article class="p032-sumcard green">
          <div class="p032-sumic">${icon("card")}</div>
          <div class="p032-sumtx"><span>ยอดเงินรวม</span><strong id="p032SumAmount">฿0.00</strong></div>
        </article>
        <article class="p032-sumcard orange">
          <div class="p032-sumic">${icon("percent")}</div>
          <div class="p032-sumtx"><span>ส่วนลดรวม</span><strong id="p032SumDiscount">฿0.00</strong></div>
        </article>
        <article class="p032-sumcard purple">
          <div class="p032-sumic">${icon("chart")}</div>
          <div class="p032-sumtx"><span>ยอดสุทธิ</span><strong id="p032SumNet">฿0.00</strong></div>
        </article>
      </section>

      <section class="p032-panel">
        <div class="p032-panel-hdr">
          <div class="p032-panel-hd">
            <div class="p032-panel-ic">${icon("grid")}</div>
            <div class="p032-panel-tx">
              <h2>รายละเอียดรายการเช็ค</h2>
              <p id="p032Period">—</p>
            </div>
          </div>
          <div class="p032-panel-actions">
            <span class="p032-badge" id="p032Badge">0 รายการ</span>
          </div>
        </div>

        <div class="p032-tablewrap" id="p032TableWrap">
          <table class="p032-table">
            <thead>
              <tr>
                <th class="sortable center" data-p032-sort="no">เลขที่เช็ค <span class="p032-sorticon">↕</span></th>
                <th class="sortable center" data-p032-sort="date">วันที่เช็ค <span class="p032-sorticon">↕</span></th>
                <th class="sortable" data-p032-sort="cus">รหัสลูกค้า <span class="p032-sorticon">↕</span></th>
                <th class="sortable" data-p032-sort="name">ชื่อลูกค้า <span class="p032-sorticon">↕</span></th>
                <th class="sortable" data-p032-sort="account">บัญชี <span class="p032-sorticon">↕</span></th>
                <th class="sortable number" data-p032-sort="amount">จำนวนเงิน <span class="p032-sorticon">↕</span></th>
                <th class="sortable number" data-p032-sort="discount">ส่วนลด <span class="p032-sorticon">↕</span></th>
                <th class="center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody id="p032Rows"></tbody>
          </table>
        </div>

        <div class="p032-pager" id="p032Pager">
          <button class="p032-pagerbtn" id="p032Prev" type="button" title="หน้าก่อนหน้า">${icon("chevleft")}</button>
          <div class="p032-pg-pages" id="p032Pages"></div>
          <button class="p032-pagerbtn" id="p032Next" type="button" title="หน้าถัดไป">${icon("chevright")}</button>
          <span class="p032-pg-info" id="p032PgInfo"></span>
        </div>

        <div class="p032-empty" id="p032Empty">
          <div>
            <div class="p032-empty-ic">${icon("search")}</div>
            <h3>ไม่พบข้อมูลรายงาน</h3>
            <p>ลองเปลี่ยนวันที่หรือพนักงานแล้วค้นหาอีกครั้ง</p>
          </div>
        </div>
      </section>

      <div class="p032-dialog-bd" id="p032DialogBd">
        <section class="p032-dialog" role="dialog" aria-modal="true">
          <div class="p032-dialog-hdr">
            <h3>รายละเอียดรายการเช็ค</h3>
            <button class="p032-dialog-close" id="p032DialogClose" type="button" aria-label="ปิด">${icon("close")}</button>
          </div>
          <div class="p032-dialog-body">
            <div class="p032-ditem"><span>เลขที่เช็ค</span><strong id="p032DNo">-</strong></div>
            <div class="p032-ditem"><span>วันที่เช็ค</span><strong id="p032DDate">-</strong></div>
            <div class="p032-ditem"><span>รหัสลูกค้า</span><strong id="p032DCus">-</strong></div>
            <div class="p032-ditem"><span>ชื่อลูกค้า</span><strong id="p032DName">-</strong></div>
            <div class="p032-ditem full"><span>บัญชี</span><strong id="p032DAccount">-</strong></div>
            <div class="p032-ditem"><span>จำนวนเงิน</span><strong id="p032DAmount">-</strong></div>
            <div class="p032-ditem"><span>ส่วนลด</span><strong id="p032DDiscount">-</strong></div>
          </div>
        </section>
      </div>

      <div class="p032-toast" id="p032Toast">${icon("check")}<span id="p032ToastMsg"></span></div>
    </div>`;
  }

  function mount(root) {
    if (!document.getElementById("p032Style")) {
      var style = document.createElement("style");
      style.id = "p032Style";
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    root.innerHTML = buildHtml();
    var $ = function (id) { return root.querySelector("#" + id); };

    var state = {
      all: [],          // rows จาก API
      filtered: [],     // หลัง quick search
      sortField: "date",
      sortDir: "asc",
      page: 1,
      selectedNo: null,
      period: "",
      toastTimer: null,
      escHandler: null
    };

    function showToast(msg, ms) {
      var t = $("p032Toast");
      $("p032ToastMsg").textContent = msg;
      t.classList.add("show");
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 1800);
    }

    /* ---------- API ---------- */
    function apiSearch(dateFrom, dateTo, employee) {
      return fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: MAC5_CONNECTION_ID,
          dateFrom: dateFrom,
          dateTo: dateTo,
          employee: employee
        })
      }).then(function (r) {
        return r.json().then(function (d) {
          if (!r.ok || !d.ok) throw new Error(d.error || ("HTTP " + r.status));
          return d;
        });
      });
    }

    /* ---------- render ---------- */
    function sortRows(items) {
      var f = state.sortField, dir = state.sortDir === "asc" ? 1 : -1;
      return items.slice().sort(function (a, b) {
        var x = a[f], y = b[f];
        if (typeof x === "string") { x = x.toLowerCase(); y = y.toLowerCase(); }
        if (x < y) return -1 * dir;
        if (x > y) return 1 * dir;
        return 0;
      });
    }

    function updateSummary(items) {
      var amount = 0, discount = 0;
      items.forEach(function (r) { amount += r.amount; discount += r.discount; });
      var net = amount - discount;
      $("p032SumCount").textContent = String(items.length);
      $("p032SumAmount").textContent = "฿" + fmtMoney(amount);
      $("p032SumDiscount").textContent = "฿" + fmtMoney(discount);
      $("p032SumNet").textContent = "฿" + fmtMoney(net);
    }

    function renderRows() {
      var items = state.all;
      state.filtered = items;
      var sorted = sortRows(items);

      $("p032Badge").textContent = sorted.length + " รายการ";
      updateSummary(sorted);

      if (sorted.length === 0) {
        $("p032TableWrap").style.display = "none";
        $("p032Pager").classList.remove("show");
        $("p032Empty").classList.add("show");
        return;
      }
      $("p032TableWrap").style.display = "block";
      $("p032Empty").classList.remove("show");

      var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;
      if (state.page < 1) state.page = 1;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageRows = sorted.slice(start, start + PAGE_SIZE);

      if (!sorted.some(function (r) { return r.no === state.selectedNo; })) {
        state.selectedNo = sorted[0].no;
      }

      var html = "";
      pageRows.forEach(function (r) {
        var sel = r.no === state.selectedNo ? " selected" : "";
        html += "<tr class=\"" + sel + "\" data-p032-no=\"" + esc(r.no) + "\">" +
          "<td class=\"p032-checkno\">" + esc(r.no) + "</td>" +
          "<td class=\"center\">" + fmtDate(r.date) + "</td>" +
          "<td class=\"p032-cuscode\">" + esc(r.cus) + "</td>" +
          "<td title=\"" + esc(r.name) + "\">" + esc(r.name) + "</td>" +
          "<td class=\"p032-account\" title=\"" + esc(r.account) + "\">" + esc(r.account) + "</td>" +
          "<td class=\"number p032-amount\">" + fmtMoney(r.amount) + "</td>" +
          "<td class=\"number p032-discount\">" + fmtMoney(r.discount) + "</td>" +
          "<td class=\"center\"><button class=\"p032-rowact\" type=\"button\" data-p032-detail=\"" + esc(r.no) + "\" title=\"ดูรายละเอียด\">" + icon("eye") + "</button></td>" +
          "</tr>";
      });
      $("p032Rows").innerHTML = html;

      renderPager(sorted.length, totalPages, start, pageRows.length);
    }

    function renderPager(total, pages, start, shown) {
      var pager = $("p032Pager");
      pager.classList.toggle("show", pages > 1);
      if (pages <= 1) return;
      var cur = state.page;
      var nums = [];
      function push(n) { nums.push(n); }
      // แสดง 1 ... k-1 k k+1 ... pages
      push(1);
      var lo = Math.max(2, cur - 1), hi = Math.min(pages - 1, cur + 1);
      if (lo > 2) push("…");
      for (var p = lo; p <= hi; p++) push(p);
      if (hi < pages - 1) push("…");
      if (pages > 1) push(pages);
      $("p032Pages").innerHTML = nums.map(function (n) {
        if (n === "…") return '<span class="p032-pg-num ellipsis">…</span>';
        return '<button class="p032-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p032-page="' + n + '">' + n + "</button>";
      }).join("");
      $("p032Prev").disabled = cur <= 1;
      $("p032Next").disabled = cur >= pages;
      $("p032PgInfo").textContent = "แสดง " + (start + 1) + "–" + (start + shown) + " จาก " + total + " รายการ";
    }

    function gotoPage(p) {
      state.page = p;
      renderRows();
    }

    function updateSortIcons() {
      root.querySelectorAll("[data-p032-sort]").forEach(function (th) {
        var ic = th.querySelector(".p032-sorticon");
        if (!ic) return;
        ic.textContent = th.getAttribute("data-p032-sort") === state.sortField
          ? (state.sortDir === "asc" ? "↑" : "↓") : "↕";
      });
    }

    /* ---------- dialog ---------- */
    function openDialog(no) {
      var r = state.all.find(function (x) { return x.no === no; });
      if (!r) return;
      $("p032DNo").textContent = r.no;
      $("p032DDate").textContent = fmtDate(r.date);
      $("p032DCus").textContent = r.cus;
      $("p032DName").textContent = r.name;
      $("p032DAccount").textContent = r.account;
      $("p032DAmount").textContent = "฿" + fmtMoney(r.amount);
      $("p032DDiscount").textContent = "฿" + fmtMoney(r.discount);
      $("p032DialogBd").classList.add("show");
    }
    function closeDialog() { $("p032DialogBd").classList.remove("show"); }

    /* ---------- events ---------- */
    var SEARCH_BTN_HTML = icon("search") + " ค้นหา";
    var SEARCH_BUSY_HTML = icon("spinner") + " กำลังประมวลผล...";

    $("p032Form").addEventListener("submit", function (e) {
      e.preventDefault();
      var from = $("p032DateFrom").value;
      var to = $("p032DateTo").value;
      var emp = $("p032Employee").value;
      if (!from || !to) {
        showToast("⚠ กรอกวันที่เริ่มต้นและสิ้นสุด", 3200);
        return;
      }
      if (from > to) {
        showToast("⚠ วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด", 3200);
        return;
      }
      var btn = $("p032SearchBtn");
      btn.disabled = true;
      btn.innerHTML = SEARCH_BUSY_HTML;
      apiSearch(from, to, emp)
        .then(function (d) {
          state.all = d.rows || [];
          state.selectedNo = null;
          state.page = 1;
          state.period = "ช่วงวันที่ " + fmtDate(from) + " ถึง " + fmtDate(to);
          $("p032Period").textContent = state.period;
          renderRows();
          if (state.all.length === 0) {
            showToast("⚠ ไม่พบข้อมูล — ไม่มีรายการที่ตรงกับเงื่อนไขค้นหา", 3200);
          }
        })
        .catch(function (err) {
          showToast("❌ " + (err.message || "ค้นหาข้อมูลไม่สำเร็จ"), 3500);
        })
        .then(function () {
          btn.disabled = false;
          btn.innerHTML = SEARCH_BTN_HTML;
        });
    });

    $("p032Prev").addEventListener("click", function () {
      if (state.page > 1) gotoPage(state.page - 1);
    });
    $("p032Next").addEventListener("click", function () {
      gotoPage(state.page + 1);
    });
    $("p032Pages").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p032-page]");
      if (btn) gotoPage(parseInt(btn.getAttribute("data-p032-page"), 10));
    });

    $("p032PrintBtn").addEventListener("click", function () {
      if (state.all.length === 0) {
        showToast("⚠ ยังไม่มีข้อมูล — ค้นหาให้ดีก่อนพิมพ์รายงาน", 3200);
        return;
      }
      var from = $("p032DateFrom").value;
      var to = $("p032DateTo").value;
      var emp = $("p032Employee").value;
      var url = "report/p032_report.php?conn=" + encodeURIComponent(MAC5_CONNECTION_ID) +
        "&from=" + encodeURIComponent(from) +
        "&to=" + encodeURIComponent(to) +
        "&emp=" + encodeURIComponent(emp);
      window.open(url, "_blank", "width=1100,height=900");
    });

    $("p032Rows").addEventListener("click", function (e) {
      var dBtn = e.target.closest("[data-p032-detail]");
      if (dBtn) {
        openDialog(dBtn.getAttribute("data-p032-detail"));
        return;
      }
      var tr = e.target.closest("tr[data-p032-no]");
      if (tr) {
        state.selectedNo = tr.getAttribute("data-p032-no");
        root.querySelectorAll("#p032Rows tr").forEach(function (r) { r.classList.remove("selected"); });
        tr.classList.add("selected");
      }
    });

    $("p032Rows").addEventListener("dblclick", function (e) {
      var tr = e.target.closest("tr[data-p032-no]");
      if (tr) openDialog(tr.getAttribute("data-p032-no"));
    });

    root.querySelectorAll("[data-p032-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-p032-sort");
        if (state.sortField === f) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortField = f;
          state.sortDir = "asc";
        }
        updateSortIcons();
        state.page = 1;
        renderRows();
      });
    });

    $("p032DialogClose").addEventListener("click", closeDialog);
    $("p032DialogBd").addEventListener("click", function (e) {
      if (e.target === this) closeDialog();
    });

    if (state.escHandler) document.removeEventListener("keydown", state.escHandler);
    state.escHandler = function (e) {
      if (e.key === "Escape") closeDialog();
    };
    document.addEventListener("keydown", state.escHandler);

    updateSortIcons();
    renderRows();
  }

  window.P032DepositReport = { mount: mount };
})();
