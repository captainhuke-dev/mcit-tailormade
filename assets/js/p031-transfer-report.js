/* P031 — รายงานเงินโอนประจำวัน
 * IIFE — window.P031TransferReport = { mount }
 * Data: MAC5 (api/p031_transfers.php)
 */
(function () {
  "use strict";

  var API_URL = "api/p031_transfers.php";
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
    ".p031{--p031-primary:#2563eb;--p031-primary-dark:#1d4ed8;--p031-primary-soft:#eff6ff;--p031-success:#059669;--p031-success-soft:#ecfdf5;",
    "  --p031-warning:#d97706;--p031-warning-soft:#fffbeb;--p031-surface:#fff;--p031-surface-soft:#f8fafc;--p031-text:#172033;--p031-muted:#64748b;--p031-border:#e2e8f0;--p031-radius:16px;}",
    ".p031 *{box-sizing:border-box;}",
    ".p031 svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}",
    ".p031 button,.p031 input,.p031 select{font:inherit;}",
    ".p031 button{cursor:pointer;}",

    /* filter */
    ".p031-filter{display:grid;grid-template-columns:minmax(180px,.85fr) minmax(180px,.85fr) minmax(220px,1.1fr) auto auto;gap:13px;",
    "  padding:16px;border:1px solid var(--p031-border);border-radius:var(--p031-radius);background:var(--p031-surface);box-shadow:0 5px 18px rgba(15,23,42,.04);}",
    ".p031-field label{display:block;margin-bottom:6px;color:var(--p031-muted);font-size:11px;font-weight:600;}",
    ".p031-inputwrap{position:relative;}",
    ".p031-inputwrap>svg:first-child{position:absolute;top:50%;left:13px;z-index:1;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;}",
    ".p031-field input,.p031-field select{width:100%;height:43px;padding:0 40px 0 41px;color:var(--p031-text);border:1px solid var(--p031-border);border-radius:11px;outline:none;background:#fff;transition:.18s;}",
    ".p031-field select{cursor:pointer;appearance:none;}",
    ".p031-field input:focus,.p031-field select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14);}",
    ".p031-selectarrow{position:absolute;top:50%;right:13px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;}",
    ".p031-btn{display:inline-flex;height:43px;align-self:end;align-items:center;justify-content:center;gap:7px;padding:0 20px;border-radius:11px;font-weight:600;white-space:nowrap;transition:.18s;}",
    ".p031-btn-primary{color:#fff;border:0;background:linear-gradient(135deg,#3b82f6,var(--p031-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,.22);}",
    ".p031-btn-primary:hover{filter:brightness(1.06);transform:translateY(-1px);}",
    ".p031-btn-primary:disabled{opacity:.6;cursor:not-allowed;transform:none;filter:none;}",
    ".p031-btn-secondary{color:var(--p031-text);border:1px solid var(--p031-border);background:#fff;}",
    ".p031-btn-secondary:hover{color:var(--p031-primary);border-color:#bfdbfe;background:var(--p031-primary-soft);}",
    ".p031-spin{animation:p031rot .8s linear infinite;}",
    "@keyframes p031rot{to{transform:rotate(360deg);}}",

    /* summary */
    ".p031-summary{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px;margin-top:14px;}",
    ".p031-sumcard{display:flex;min-width:0;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--p031-border);border-radius:14px;background:var(--p031-surface);box-shadow:0 4px 14px rgba(15,23,42,.04);}",
    ".p031-sumic{display:grid;width:42px;height:42px;flex:0 0 auto;place-items:center;color:var(--p031-primary);border-radius:12px;background:var(--p031-primary-soft);}",
    ".p031-sumcard.green .p031-sumic{color:var(--p031-success);background:var(--p031-success-soft);}",
    ".p031-sumcard.orange .p031-sumic{color:var(--p031-warning);background:var(--p031-warning-soft);}",
    ".p031-sumcard.purple .p031-sumic{color:#7c3aed;background:#f5f3ff;}",
    ".p031-sumtx{min-width:0;}",
    ".p031-sumtx span{display:block;color:var(--p031-muted);font-size:10px;}",
    ".p031-sumtx strong{display:block;overflow:hidden;margin-top:2px;font-size:18px;text-overflow:ellipsis;white-space:nowrap;}",

    /* panel */
    ".p031-panel{display:flex;min-height:470px;flex:1;flex-direction:column;overflow:hidden;margin-top:14px;",
    "  border:1px solid var(--p031-border);border-radius:var(--p031-radius);background:var(--p031-surface);box-shadow:0 12px 30px rgba(15,23,42,.08);}",
    ".p031-panel-hdr{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid var(--p031-border);}",
    ".p031-panel-hd{display:flex;min-width:0;align-items:center;gap:10px;}",
    ".p031-panel-ic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p031-primary);border-radius:11px;background:var(--p031-primary-soft);}",
    ".p031-panel-tx{min-width:0;}",
    ".p031-panel-tx h2{font-size:14px;margin:0;}",
    ".p031-panel-tx p{overflow:hidden;margin:1px 0 0;color:var(--p031-muted);font-size:10px;text-overflow:ellipsis;white-space:nowrap;}",
    ".p031-panel-actions{display:flex;align-items:center;gap:7px;}",
    ".p031-badge{padding:5px 10px;color:var(--p031-primary-dark);border-radius:99px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap;}",

    /* table */
    ".p031-tablewrap{min-height:0;flex:1;overflow:auto;}",
    ".p031-table{width:100%;min-width:1050px;border-collapse:separate;border-spacing:0;white-space:nowrap;}",
    ".p031-table th{position:sticky;top:0;z-index:5;padding:11px 12px;color:var(--p031-muted);border-bottom:1px solid var(--p031-border);",
    "  background:var(--p031-surface-soft);box-shadow:inset 0 -1px var(--p031-border);font-size:11px;font-weight:600;text-align:left;user-select:none;}",
    ".p031-table th.sortable{cursor:pointer;}",
    ".p031-table th.sortable:hover{color:var(--p031-primary);background:#f1f5f9;}",
    ".p031-sorticon{display:inline-block;margin-left:4px;color:#94a3b8;font-size:9px;}",
    ".p031-table td{max-width:320px;overflow:hidden;padding:10px 12px;border-bottom:1px solid #edf1f6;font-size:11px;text-overflow:ellipsis;}",
    ".p031-table .center{text-align:center;}",
    ".p031-table .number{text-align:right;}",
    ".p031-table tbody tr{cursor:pointer;transition:.14s ease;}",
    ".p031-table tbody tr:nth-child(even){background:#fbfdff;}",
    ".p031-table tbody tr:hover{background:#f0f7ff;}",
    ".p031-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 var(--p031-primary);}",
    ".p031-checkno{color:var(--p031-primary-dark);font-weight:700;}",
    ".p031-cuscode{color:#334155;font-variant-numeric:tabular-nums;font-weight:600;}",
    ".p031-account{color:#475569;}",
    ".p031-amount{color:#0f172a;font-variant-numeric:tabular-nums;font-weight:700;}",
    ".p031-discount{color:var(--p031-success);font-variant-numeric:tabular-nums;font-weight:700;}",
    ".p031-rowact{display:grid;width:29px;height:29px;margin:0 auto;place-items:center;color:var(--p031-muted);",
    "  border:1px solid var(--p031-border);border-radius:8px;background:#fff;transition:.15s;}",
    ".p031-rowact:hover{color:var(--p031-primary);border-color:#bfdbfe;background:var(--p031-primary-soft);}",
    ".p031-rowact svg{width:14px;height:14px;}",

    /* pager */
    ".p031-pager{display:none;align-items:center;gap:6px;padding:9px 12px;border-top:1px solid var(--p031-border);background:#fff;}",
    ".p031-pager.show{display:flex;}",
    ".p031-pagerbtn{display:grid;width:30px;height:30px;place-items:center;color:var(--p031-muted);border:1px solid var(--p031-border);border-radius:8px;background:#fff;transition:.15s;}",
    ".p031-pagerbtn:hover:not(:disabled){color:var(--p031-primary);border-color:#93c5fd;background:var(--p031-primary-soft);}",
    ".p031-pagerbtn:disabled{opacity:.4;cursor:default;}",
    ".p031-pagerbtn svg{width:16px;height:16px;}",
    ".p031-pg-pages{display:flex;align-items:center;gap:4px;}",
    ".p031-pg-num{min-width:30px;height:30px;padding:0 6px;color:var(--p031-muted);border:1px solid var(--p031-border);border-radius:8px;background:#fff;font-size:11px;font-weight:600;transition:.15s;}",
    ".p031-pg-num:hover:not(.active){color:var(--p031-primary);border-color:#93c5fd;background:var(--p031-primary-soft);}",
    ".p031-pg-num.active{color:#fff;border-color:var(--p031-primary);background:var(--p031-primary);}",
    ".p031-pg-num.ellipsis{border:0;background:none;cursor:default;}",
    ".p031-pg-info{margin-left:auto;color:var(--p031-muted);font-size:11px;white-space:nowrap;}",

    /* empty */
    ".p031-empty{display:none;min-height:300px;flex:1;align-items:center;justify-content:center;padding:30px;color:var(--p031-muted);text-align:center;}",
    ".p031-empty.show{display:flex;}",
    ".p031-empty-ic{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 11px;color:#94a3b8;border-radius:18px;background:#f1f5f9;}",
    ".p031-empty h3{color:var(--p031-text);font-size:15px;margin:0;}",
    ".p031-empty p{margin-top:4px;font-size:11px;}",

    /* dialog */
    ".p031-dialog-bd{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);}",
    ".p031-dialog-bd.show{display:grid;}",
    ".p031-dialog{width:min(560px,100%);overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 24px 65px rgba(15,23,42,.3);}",
    ".p031-dialog-hdr{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--p031-border);}",
    ".p031-dialog-hdr h3{font-size:15px;margin:0;}",
    ".p031-dialog-close{display:grid;width:32px;height:32px;place-items:center;color:var(--p031-muted);border:0;border-radius:8px;background:#f1f5f9;}",
    ".p031-dialog-close:hover{color:#dc2626;background:#fef2f2;}",
    ".p031-dialog-body{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:18px;}",
    ".p031-ditem{min-width:0;padding:11px 12px;border:1px solid var(--p031-border);border-radius:10px;background:var(--p031-surface-soft);}",
    ".p031-ditem.full{grid-column:1/-1;}",
    ".p031-ditem span{display:block;color:var(--p031-muted);font-size:10px;}",
    ".p031-ditem strong{display:block;overflow-wrap:anywhere;margin-top:3px;font-size:12px;}",

    /* toast */
    ".p031-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;",
    "  color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s;}",
    ".p031-toast.show{visibility:visible;opacity:1;transform:translateY(0);}",
    ".p031-toast svg{width:17px;height:17px;color:#34d399;}",

    /* responsive */
    "@media (max-width:1050px){.p031-filter{grid-template-columns:repeat(3,minmax(180px,1fr));}.p031-summary{grid-template-columns:repeat(2,minmax(180px,1fr));}}",
    "@media (max-width:720px){.p031-filter,.p031-summary{grid-template-columns:1fr;}.p031-btn{width:100%;}",
    "  .p031-panel-hdr{align-items:flex-start;flex-direction:column;}.p031-panel-actions{width:100%;}",
    "  .p031-dialog-body{grid-template-columns:1fr;}.p031-ditem.full{grid-column:auto;}}"
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
    <div class="p031">
      <form class="p031-filter" id="p031Form" autocomplete="off">
        <div class="p031-field">
          <label for="p031DateFrom">ตั้งแต่วันที่</label>
          <div class="p031-inputwrap">${icon("calendar")}
            <input id="p031DateFrom" type="date" value="${todayYmd()}">
          </div>
        </div>
        <div class="p031-field">
          <label for="p031DateTo">จนถึงวันที่</label>
          <div class="p031-inputwrap">${icon("calendar")}
            <input id="p031DateTo" type="date" value="${todayYmd()}">
          </div>
        </div>
        <div class="p031-field">
          <label for="p031Employee">รหัสพนักงาน</label>
          <div class="p031-inputwrap">${icon("user")}
            <select id="p031Employee">${slotEmployeeOptions()}</select>
            <span class="p031-selectarrow">${icon("chevdown")}</span>
          </div>
        </div>
        <button class="p031-btn p031-btn-primary" id="p031SearchBtn" type="submit">${icon("search")} ค้นหา</button>
        <button class="p031-btn p031-btn-secondary" id="p031PrintBtn" type="button">${icon("print")} พิมพ์รายงาน</button>
      </form>

      <section class="p031-summary">
        <article class="p031-sumcard">
          <div class="p031-sumic">${icon("list")}</div>
          <div class="p031-sumtx"><span>จำนวนรายการ</span><strong id="p031SumCount">0</strong></div>
        </article>
        <article class="p031-sumcard green">
          <div class="p031-sumic">${icon("card")}</div>
          <div class="p031-sumtx"><span>ยอดเงินรวม</span><strong id="p031SumAmount">฿0.00</strong></div>
        </article>
        <article class="p031-sumcard orange">
          <div class="p031-sumic">${icon("percent")}</div>
          <div class="p031-sumtx"><span>ส่วนลดรวม</span><strong id="p031SumDiscount">฿0.00</strong></div>
        </article>
        <article class="p031-sumcard purple">
          <div class="p031-sumic">${icon("chart")}</div>
          <div class="p031-sumtx"><span>ยอดสุทธิ</span><strong id="p031SumNet">฿0.00</strong></div>
        </article>
      </section>

      <section class="p031-panel">
        <div class="p031-panel-hdr">
          <div class="p031-panel-hd">
            <div class="p031-panel-ic">${icon("grid")}</div>
            <div class="p031-panel-tx">
              <h2>รายละเอียดรายการโอน</h2>
              <p id="p031Period">—</p>
            </div>
          </div>
          <div class="p031-panel-actions">
            <span class="p031-badge" id="p031Badge">0 รายการ</span>
          </div>
        </div>

        <div class="p031-tablewrap" id="p031TableWrap">
          <table class="p031-table">
            <thead>
              <tr>
                <th class="sortable center" data-p031-sort="no">เลขที่ <span class="p031-sorticon">↕</span></th>
                <th class="sortable center" data-p031-sort="date">วันที่ <span class="p031-sorticon">↕</span></th>
                <th class="sortable" data-p031-sort="cus">รหัสลูกค้า <span class="p031-sorticon">↕</span></th>
                <th class="sortable" data-p031-sort="name">ชื่อลูกค้า <span class="p031-sorticon">↕</span></th>
                <th class="sortable" data-p031-sort="account">บัญชี <span class="p031-sorticon">↕</span></th>
                <th class="sortable number" data-p031-sort="amount">จำนวนเงิน <span class="p031-sorticon">↕</span></th>
                <th class="sortable number" data-p031-sort="discount">ส่วนลด <span class="p031-sorticon">↕</span></th>
                <th class="center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody id="p031Rows"></tbody>
          </table>
        </div>

        <div class="p031-pager" id="p031Pager">
          <button class="p031-pagerbtn" id="p031Prev" type="button" title="หน้าก่อนหน้า">${icon("chevleft")}</button>
          <div class="p031-pg-pages" id="p031Pages"></div>
          <button class="p031-pagerbtn" id="p031Next" type="button" title="หน้าถัดไป">${icon("chevright")}</button>
          <span class="p031-pg-info" id="p031PgInfo"></span>
        </div>

        <div class="p031-empty" id="p031Empty">
          <div>
            <div class="p031-empty-ic">${icon("search")}</div>
            <h3>ไม่พบข้อมูลรายงาน</h3>
            <p>ลองเปลี่ยนวันที่หรือพนักงานแล้วค้นหาอีกครั้ง</p>
          </div>
        </div>
      </section>

      <div class="p031-dialog-bd" id="p031DialogBd">
        <section class="p031-dialog" role="dialog" aria-modal="true">
          <div class="p031-dialog-hdr">
            <h3>รายละเอียดรายการโอน</h3>
            <button class="p031-dialog-close" id="p031DialogClose" type="button" aria-label="ปิด">${icon("close")}</button>
          </div>
          <div class="p031-dialog-body">
            <div class="p031-ditem"><span>เลขที่</span><strong id="p031DNo">-</strong></div>
            <div class="p031-ditem"><span>วันที่</span><strong id="p031DDate">-</strong></div>
            <div class="p031-ditem"><span>รหัสลูกค้า</span><strong id="p031DCus">-</strong></div>
            <div class="p031-ditem"><span>ชื่อลูกค้า</span><strong id="p031DName">-</strong></div>
            <div class="p031-ditem full"><span>บัญชี</span><strong id="p031DAccount">-</strong></div>
            <div class="p031-ditem"><span>จำนวนเงิน</span><strong id="p031DAmount">-</strong></div>
            <div class="p031-ditem"><span>ส่วนลด</span><strong id="p031DDiscount">-</strong></div>
          </div>
        </section>
      </div>

      <div class="p031-toast" id="p031Toast">${icon("check")}<span id="p031ToastMsg"></span></div>
    </div>`;
  }

  function mount(root) {
    if (!document.getElementById("p031Style")) {
      var style = document.createElement("style");
      style.id = "p031Style";
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
      var t = $("p031Toast");
      $("p031ToastMsg").textContent = msg;
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
      $("p031SumCount").textContent = String(items.length);
      $("p031SumAmount").textContent = "฿" + fmtMoney(amount);
      $("p031SumDiscount").textContent = "฿" + fmtMoney(discount);
      $("p031SumNet").textContent = "฿" + fmtMoney(net);
    }

    function renderRows() {
      var items = state.all;
      state.filtered = items;
      var sorted = sortRows(items);

      $("p031Badge").textContent = sorted.length + " รายการ";
      updateSummary(sorted);

      if (sorted.length === 0) {
        $("p031TableWrap").style.display = "none";
        $("p031Pager").classList.remove("show");
        $("p031Empty").classList.add("show");
        return;
      }
      $("p031TableWrap").style.display = "block";
      $("p031Empty").classList.remove("show");

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
        html += "<tr class=\"" + sel + "\" data-p031-no=\"" + esc(r.no) + "\">" +
          "<td class=\"p031-checkno\">" + esc(r.no) + "</td>" +
          "<td class=\"center\">" + fmtDate(r.date) + "</td>" +
          "<td class=\"p031-cuscode\">" + esc(r.cus) + "</td>" +
          "<td title=\"" + esc(r.name) + "\">" + esc(r.name) + "</td>" +
          "<td class=\"p031-account\" title=\"" + esc(r.account) + "\">" + esc(r.account) + "</td>" +
          "<td class=\"number p031-amount\">" + fmtMoney(r.amount) + "</td>" +
          "<td class=\"number p031-discount\">" + fmtMoney(r.discount) + "</td>" +
          "<td class=\"center\"><button class=\"p031-rowact\" type=\"button\" data-p031-detail=\"" + esc(r.no) + "\" title=\"ดูรายละเอียด\">" + icon("eye") + "</button></td>" +
          "</tr>";
      });
      $("p031Rows").innerHTML = html;

      renderPager(sorted.length, totalPages, start, pageRows.length);
    }

    function renderPager(total, pages, start, shown) {
      var pager = $("p031Pager");
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
      $("p031Pages").innerHTML = nums.map(function (n) {
        if (n === "…") return '<span class="p031-pg-num ellipsis">…</span>';
        return '<button class="p031-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p031-page="' + n + '">' + n + "</button>";
      }).join("");
      $("p031Prev").disabled = cur <= 1;
      $("p031Next").disabled = cur >= pages;
      $("p031PgInfo").textContent = "แสดง " + (start + 1) + "–" + (start + shown) + " จาก " + total + " รายการ";
    }

    function gotoPage(p) {
      state.page = p;
      renderRows();
    }

    function updateSortIcons() {
      root.querySelectorAll("[data-p031-sort]").forEach(function (th) {
        var ic = th.querySelector(".p031-sorticon");
        if (!ic) return;
        ic.textContent = th.getAttribute("data-p031-sort") === state.sortField
          ? (state.sortDir === "asc" ? "↑" : "↓") : "↕";
      });
    }

    /* ---------- dialog ---------- */
    function openDialog(no) {
      var r = state.all.find(function (x) { return x.no === no; });
      if (!r) return;
      $("p031DNo").textContent = r.no;
      $("p031DDate").textContent = fmtDate(r.date);
      $("p031DCus").textContent = r.cus;
      $("p031DName").textContent = r.name;
      $("p031DAccount").textContent = r.account;
      $("p031DAmount").textContent = "฿" + fmtMoney(r.amount);
      $("p031DDiscount").textContent = "฿" + fmtMoney(r.discount);
      $("p031DialogBd").classList.add("show");
    }
    function closeDialog() { $("p031DialogBd").classList.remove("show"); }

    /* ---------- events ---------- */
    var SEARCH_BTN_HTML = icon("search") + " ค้นหา";
    var SEARCH_BUSY_HTML = icon("spinner") + " กำลังประมวลผล...";

    $("p031Form").addEventListener("submit", function (e) {
      e.preventDefault();
      var from = $("p031DateFrom").value;
      var to = $("p031DateTo").value;
      var emp = $("p031Employee").value;
      if (!from || !to) {
        showToast("⚠ กรอกวันที่เริ่มต้นและสิ้นสุด", 3200);
        return;
      }
      if (from > to) {
        showToast("⚠ วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด", 3200);
        return;
      }
      var btn = $("p031SearchBtn");
      btn.disabled = true;
      btn.innerHTML = SEARCH_BUSY_HTML;
      apiSearch(from, to, emp)
        .then(function (d) {
          state.all = d.rows || [];
          state.selectedNo = null;
          state.page = 1;
          state.period = "ช่วงวันที่ " + fmtDate(from) + " ถึง " + fmtDate(to);
          $("p031Period").textContent = state.period;
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

    $("p031Prev").addEventListener("click", function () {
      if (state.page > 1) gotoPage(state.page - 1);
    });
    $("p031Next").addEventListener("click", function () {
      gotoPage(state.page + 1);
    });
    $("p031Pages").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p031-page]");
      if (btn) gotoPage(parseInt(btn.getAttribute("data-p031-page"), 10));
    });

    $("p031PrintBtn").addEventListener("click", function () {
      if (state.all.length === 0) {
        showToast("⚠ ยังไม่มีข้อมูล — ค้นหาให้ดีก่อนพิมพ์รายงาน", 3200);
        return;
      }
      var from = $("p031DateFrom").value;
      var to = $("p031DateTo").value;
      var emp = $("p031Employee").value;
      var url = "report/p031_report.php?conn=" + encodeURIComponent(MAC5_CONNECTION_ID) +
        "&from=" + encodeURIComponent(from) +
        "&to=" + encodeURIComponent(to) +
        "&emp=" + encodeURIComponent(emp);
      window.open(url, "_blank", "width=1100,height=900");
    });

    $("p031Rows").addEventListener("click", function (e) {
      var dBtn = e.target.closest("[data-p031-detail]");
      if (dBtn) {
        openDialog(dBtn.getAttribute("data-p031-detail"));
        return;
      }
      var tr = e.target.closest("tr[data-p031-no]");
      if (tr) {
        state.selectedNo = tr.getAttribute("data-p031-no");
        root.querySelectorAll("#p031Rows tr").forEach(function (r) { r.classList.remove("selected"); });
        tr.classList.add("selected");
      }
    });

    $("p031Rows").addEventListener("dblclick", function (e) {
      var tr = e.target.closest("tr[data-p031-no]");
      if (tr) openDialog(tr.getAttribute("data-p031-no"));
    });

    root.querySelectorAll("[data-p031-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-p031-sort");
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

    $("p031DialogClose").addEventListener("click", closeDialog);
    $("p031DialogBd").addEventListener("click", function (e) {
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

  window.P031TransferReport = { mount: mount };
})();
