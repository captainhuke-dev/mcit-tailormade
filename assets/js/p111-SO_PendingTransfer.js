/* P111 — รายงานลูกค้าที่มียอดค้างเกินวงเงิน
 * IIFE — window.P111Overlimit = { mount }
 * Data: MAC5 (api/p111_SO_PendingTransfer.php) — รัน query เมื่อกด "เริ่มตรวจสอบ"
 * ไม่มี filter / save / print — pagination 15/หน้า
 */
(function () {
  "use strict";

  var API_URL = "api/p111_SO_PendingTransfer.php";
  var MAC5_CONNECTION_ID = "c1788406814359";
  var PAGE_SIZE = 15;

  var STATUS_CLASS = {
    "14": "transfer",
    "15": "pending",
    "20": "completed",
    "99": "cancelled"
  };

  var state = {
    all: [],
    sortField: "date",
    sortDir: "asc",
    page: 1,
    loading: false,
    toastTimer: null,
    escHandler: null
  };

  var root = null;

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function fmtMoney(v) { return moneyFmt.format(Number(v) || 0); }

  function fmtDate(ymd) {
    if (!ymd) return "-";
    var p = String(ymd).split("-");
    if (p.length !== 3) return ymd;
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function icon(name) {
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      spinner: '<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>',
      list: '<path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path>',
      cash: '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle>',
      deposit: '<rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4M14 12h4"></path>',
      check: '<path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"></path>',
      table: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      play: '<circle cx="12" cy="12" r="9"></circle><path d="m10 8 6 4-6 4z"></path>',
      pencil: '<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  function showToast(msg, ms) {
    var t = $("p111Toast");
    $("p111ToastMsg").textContent = msg;
    t.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2200);
  }

  /* ---------- API ---------- */
  function apiSearch() {
    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID })
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
    var net = 0, deposit = 0;
    items.forEach(function (r) {
      net += r.net;
      deposit += r.deposit;
    });
    $("p111SumCount").textContent = String(items.length);
    $("p111SumNet").textContent = "฿" + fmtMoney(net);
    $("p111SumDeposit").textContent = "฿" + fmtMoney(deposit);
  }

  function renderRows() {
    var items = state.all;
    var sorted = sortRows(items);

    $("p111Badge").textContent = sorted.length + " รายการ";
    updateSummary(sorted);

    if (sorted.length === 0) {
      $("p111TableWrap").style.display = "none";
      $("p111FootWrap").style.display = "none";
      $("p111Pager").classList.remove("show");
      $("p111Empty").classList.add("show");
      return;
    }
    $("p111TableWrap").style.display = "block";
    $("p111FootWrap").style.display = "flex";
    $("p111Empty").classList.remove("show");

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageRows = sorted.slice(start, start + PAGE_SIZE);

    var html = "";
    pageRows.forEach(function (r) {
      var cls = STATUS_CLASS[r.status] || "other";
      html += "<tr data-p111-doc=\"" + esc(r.doc) + "\">" +
        "<td>" + fmtDate(r.date) + "</td>" +
        "<td class=\"p111-docno\">" + esc(r.doc) + "</td>" +
        "<td class=\"p111-cuscode\">" + esc(r.cus) + "</td>" +
        "<td title=\"" + esc(r.name) + "\">" + esc(r.name) + "</td>" +
        "<td class=\"p111-desc\" title=\"" + esc(r.desc) + "\">" + esc(r.desc) + "</td>" +
        "<td class=\"number p111-net\">" + fmtMoney(r.net) + "</td>" +
        "<td class=\"number p111-deposit\">" + fmtMoney(r.deposit) + "</td>" +
        "<td><span class=\"p111-status " + cls + "\">" + esc(r.statusLabel) + "</span></td>" +
        "<td class=\"center\"><button class=\"p111-changebtn\" type=\"button\" data-p111-change=\"" + esc(r.doc) + "\">" + icon("pencil") + " เปลี่ยน</button></td>" +
        "</tr>";
    });
    $("p111Rows").innerHTML = html;

    $("p111FootDesc").textContent = "แสดง " + (start + 1) + "–" + (start + pageRows.length) + " จาก " + sorted.length + " รายการ";
    renderPager(sorted.length, totalPages, start, pageRows.length);
  }

  function renderPager(total, pages, start, shown) {
    var pager = $("p111Pager");
    pager.classList.toggle("show", pages > 1);
    if (pages <= 1) return;
    var cur = state.page;
    var nums = [];
    function push(n) { nums.push(n); }
    push(1);
    var lo = Math.max(2, cur - 1), hi = Math.min(pages - 1, cur + 1);
    if (lo > 2) push("…");
    for (var p = lo; p <= hi; p++) push(p);
    if (hi < pages - 1) push("…");
    if (pages > 1) push(pages);
    $("p111Pages").innerHTML = nums.map(function (n) {
      if (n === "…") return '<span class="p111-pg-num ellipsis">…</span>';
      return '<button class="p111-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p111-page="' + n + '">' + n + "</button>";
    }).join("");
    $("p111Prev").disabled = cur <= 1;
    $("p111Next").disabled = cur >= pages;
  }

  function gotoPage(p) {
    state.page = p;
    renderRows();
  }

  function updateSortIcons() {
    root.querySelectorAll("[data-p111-sort]").forEach(function (th) {
      var ic = th.querySelector(".p111-sorticon");
      if (!ic) return;
      ic.textContent = th.getAttribute("data-p111-sort") === state.sortField
        ? (state.sortDir === "asc" ? "↑" : "↓") : "↕";
    });
  }

  /* ---------- launch ---------- */
  var LAUNCH_HTML = icon("play") + " เริ่มตรวจสอบ";
  var LAUNCH_BUSY_HTML = icon("spinner") + " กำลังตรวจสอบ...";

  function doSearch() {
    if (state.loading) return;
    var btn = $("p111LaunchBtn");
    state.loading = true;
    btn.disabled = true;
    btn.innerHTML = LAUNCH_BUSY_HTML;
    apiSearch()
      .then(function (d) {
        state.all = d.rows || [];
        state.page = 1;
        var now = new Date();
        var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
        $("p111Period").textContent = "ตรวจสอบเมื่อ " + p2(now.getDate()) + "/" + p2(now.getMonth() + 1) + "/" + (now.getFullYear() + 543) + " " + p2(now.getHours()) + ":" + p2(now.getMinutes());
        renderRows();
        if (state.all.length === 0) {
          showToast("⚠ ไม่พบข้อมูล — ไม่มีรายการที่ตรงกับเงื่อนไข", 3200);
        } else {
          showToast("✓ พบข้อมูล " + state.all.length + " รายการ");
        }
      })
      .catch(function (err) {
        showToast("❌ " + (err.message || "ค้นหาข้อมูลไม่สำเร็จ"), 3500);
      })
      .then(function () {
        state.loading = false;
        btn.disabled = false;
        btn.innerHTML = LAUNCH_HTML;
      });
  }

  /* ---------- status change dialog ---------- */
  function openChangeDialog(doc) {
    var r = null;
    for (var i = 0; i < state.all.length; i++) {
      if (state.all[i].doc === doc) { r = state.all[i]; break; }
    }
    if (!r) return;
    state.editingDoc = r.doc;
    $("p111CfDoc").textContent = r.doc;
    $("p111CfCus").textContent = r.cus + " - " + r.name;
    $("p111CfNet").textContent = "฿" + fmtMoney(r.net);
    $("p111CfStatus").textContent = r.statusLabel;
    $("p111CfMsg").textContent = "ยืนยันการเปลี่ยนสถานะรายการ " + r.doc + " ?";
    $("p111CfBd").classList.add("show");
  }

  function closeChangeDialog() {
    $("p111CfBd").classList.remove("show");
  }

  /* ---------- save status ---------- */
  var SAVE_API_URL = "api/p111_status.php";

  function saveStatus(doc) {
    return fetch(SAVE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID, vnos: doc })
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok || !d.ok) throw new Error(d.error || ("HTTP " + r.status));
        return d;
      });
    });
  }

  /* ---------- mount ---------- */
  function mount(el) {
    root = el;
    root.innerHTML =
      '<div class="p111-launch">' +
        '<button class="p111-launch-btn" id="p111LaunchBtn" type="button">' + LAUNCH_HTML + '</button>' +
      '</div>' +

      '<div class="p111-summary">' +
        '<div class="p111-card">' +
          '<div class="p111-card-ic">' + icon("list") + '</div>' +
          '<div class="p111-card-tx"><span>จำนวนรายการ</span><strong id="p111SumCount">0</strong></div>' +
        '</div>' +
        '<div class="p111-card green">' +
          '<div class="p111-card-ic">' + icon("cash") + '</div>' +
          '<div class="p111-card-tx"><span>ยอดสุทธิรวม</span><strong id="p111SumNet">฿0.00</strong></div>' +
        '</div>' +
        '<div class="p111-card orange">' +
          '<div class="p111-card-ic">' + icon("deposit") + '</div>' +
          '<div class="p111-card-tx"><span>ยอดมัดจำรวม</span><strong id="p111SumDeposit">฿0.00</strong></div>' +
        '</div>' +
      '</div>' +

      '<div class="p111-panel">' +
        '<div class="p111-panel-head">' +
          '<div class="p111-panel-ic">' + icon("table") + '</div>' +
          '<div>' +
            '<h2>รายการ SO รอเปลี่ยนสถานะรอโอน</h2>' +
            '<p id="p111Period">ยังไม่มีข้อมูล — กด "เริ่มตรวจสอบ" เพื่อรันการค้นหา</p>' +
          '</div>' +
          '<span class="p111-badge" id="p111Badge">0 รายการ</span>' +
        '</div>' +
        '<div class="p111-tablewrap" id="p111TableWrap" style="display:none">' +
          '<table class="p111-table">' +
            '<thead><tr>' +
              '<th class="sortable" data-p111-sort="date">วันที่ <span class="p111-sorticon">↕</span></th>' +
              '<th class="sortable" data-p111-sort="doc">เลขใบสำคัญ <span class="p111-sorticon">↕</span></th>' +
              '<th class="sortable" data-p111-sort="cus">รหัสลูกค้า <span class="p111-sorticon">↕</span></th>' +
              '<th class="sortable" data-p111-sort="name">ชื่อลูกค้า <span class="p111-sorticon">↕</span></th>' +
              '<th>รายละเอียด</th>' +
              '<th class="sortable number" data-p111-sort="net">ยอดสุทธิ <span class="p111-sorticon">↕</span></th>' +
              '<th class="sortable number" data-p111-sort="deposit">ยอดมัดจำ <span class="p111-sorticon">↕</span></th>' +
              '<th>สถานะ</th>' +
              '<th class="center">เปลี่ยนสถานะ</th>' +
            '</tr></thead>' +
            '<tbody id="p111Rows"></tbody>' +
          '</table>' +
        '</div>' +
        '<div class="p111-empty" id="p111Empty">' +
          '<div class="p111-empty-ic">' + icon("search") + '</div>' +
          '<h3>พร้อมตรวจสอบ</h3>' +
          '<p>กดปุ่ม "เริ่มตรวจสอบ" ข้างบนเพื่อค้นหารายการ</p>' +
        '</div>' +
        '<div class="p111-footer" id="p111FootWrap" style="display:none">' +
          '<span id="p111FootDesc">แสดง 0 รายการ</span>' +
        '</div>' +
        '<div class="p111-pager" id="p111Pager">' +
          '<button class="p111-pg-nav" id="p111Prev" type="button">‹</button>' +
          '<div class="p111-pg-nums" id="p111Pages"></div>' +
          '<button class="p111-pg-nav" id="p111Next" type="button">›</button>' +
        '</div>' +
      '</div>' +

      '<div class="p111-toast" id="p111Toast">' + icon("check") + '<span id="p111ToastMsg"></span></div>' +

      '<div class="p111-cfbd" id="p111CfBd">' +
        '<div class="p111-cfbox">' +
          '<div class="p111-cfhead">' +
            '<div class="p111-cfic">' + icon("pencil") + '</div>' +
            '<div>' +
              '<h3>เปลี่ยนสถานะ</h3>' +
              '<p>ตรวจสอบข้อมูลก่อนยืนยันการเปลี่ยนแปลง</p>' +
            '</div>' +
          '</div>' +
          '<div class="p111-cfdoc">' +
            '<div class="p111-cfitem"><span>เลขใบสำคัญ</span><strong id="p111CfDoc">-</strong></div>' +
            '<div class="p111-cfitem"><span>ลูกค้า</span><strong id="p111CfCus">-</strong></div>' +
            '<div class="p111-cfitem"><span>ยอดสุทธิ</span><strong id="p111CfNet">-</strong></div>' +
            '<div class="p111-cfitem"><span>สถานะปัจจุบัน</span><strong id="p111CfStatus">-</strong></div>' +
          '</div>' +
          '<div class="p111-cfmsg" id="p111CfMsg">ยืนยันการเปลี่ยนสถานะรายการนี้ไหม?</div>' +
          '<div class="p111-cffoot">' +
            '<div class="p111-cfnew"><span>สถานะเปลี่ยนเป็น</span><strong>14 : รอโอน</strong></div>' +
            '<div class="p111-cfbtns">' +
              '<button class="p111-cfbt cancel" id="p111CfCancel" type="button">ยกเลิก</button>' +
              '<button class="p111-cfbt ok" id="p111CfOk" type="button">ยืนยัน</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    /* CSS */
    if (!document.getElementById("p111Style")) {
      var st = document.createElement("style");
      st.id = "p111Style";
      st.textContent =
        '.p111-launch{display:flex;align-items:center;gap:18px;margin-bottom:14px}' +
        '.p111-launch-btn{display:inline-flex;height:46px;align-items:center;justify-content:center;gap:8px;padding:0 24px;border:0;border-radius:12px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-weight:700;font-size:14px;box-shadow:0 8px 18px rgba(37,99,235,.22);cursor:pointer;transition:.18s;white-space:nowrap}' +
        '.p111-launch-btn:hover{transform:translateY(-2px)}' +
        '.p111-launch-btn:disabled{opacity:.7;transform:none}' +
        '.p111-launch-btn svg{width:20px;height:20px}' +
        '.p111-summary{display:grid;grid-template-columns:repeat(3,minmax(170px,1fr));gap:12px;margin-bottom:14px}' +
        '.p111-card{display:flex;align-items:center;gap:12px;padding:13px 15px;border:1px solid var(--border,#e2e8f0);border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,.04);min-width:0}' +
        '.p111-card-ic{display:grid;width:42px;height:42px;flex:0 0 auto;place-items:center;border-radius:12px;color:#2563eb;background:#eff6ff}' +
        '.p111-card-ic svg{width:20px;height:20px}' +
        '.p111-card.green .p111-card-ic{color:#059669;background:#ecfdf5}' +
        '.p111-card.orange .p111-card-ic{color:#d97706;background:#fffbeb}' +
        '.p111-card.purple .p111-card-ic{color:#7c3aed;background:#f5f3ff}' +
        '.p111-card-tx span{display:block;font-size:10px;color:var(--muted,#64748b)}' +
        '.p111-card-tx strong{display:block;margin-top:2px;font-size:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
        '.p111-panel{border:1px solid var(--border,#e2e8f0);border-radius:16px;background:#fff;box-shadow:0 12px 30px rgba(15,23,42,.08);overflow:hidden}' +
        '.p111-panel-head{display:flex;align-items:center;gap:10px;padding:11px 15px;border-bottom:1px solid var(--border,#e2e8f0);min-height:64px}' +
        '.p111-panel-ic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;border-radius:11px;color:#2563eb;background:#eff6ff}' +
        '.p111-panel-ic svg{width:19px;height:19px}' +
        '.p111-panel-head h2{font-size:14px;margin:0}' +
        '.p111-panel-head p{margin:1px 0 0;font-size:10px;color:var(--muted,#64748b)}' +
        '.p111-badge{margin-left:auto;padding:5px 10px;border-radius:99px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;white-space:nowrap}' +
        '.p111-tablewrap{overflow-x:auto}' +
        '.p111-table{width:100%;min-width:1080px;border-collapse:separate;border-spacing:0;white-space:nowrap}' +
        '.p111-table th{position:sticky;top:0;z-index:5;padding:11px 12px;font-size:11px;font-weight:600;color:var(--muted,#64748b);background:#f8fafc;border-bottom:1px solid var(--border,#e2e8f0);text-align:left;user-select:none}' +
        '.p111-table th.sortable{cursor:pointer}' +
        '.p111-table th.sortable:hover{color:#2563eb;background:#f1f5f9}' +
        '.p111-sorticon{margin-left:3px;font-size:9px;color:#94a3b8}' +
        '.p111-table th.number,.p111-table td.number{text-align:right}' +
        '.p111-table td{padding:9px 12px;border-bottom:1px solid #edf1f6;font-size:11px;max-width:330px;overflow:hidden;text-overflow:ellipsis}' +
        '.p111-table tbody tr{transition:.14s;cursor:pointer}' +
        '.p111-table tbody tr:nth-child(even){background:#fbfdff}' +
        '.p111-table tbody tr:hover{background:#f0f7ff}' +
        '.p111-docno{color:#1d4ed8;font-weight:700}' +
        '.p111-cuscode{font-weight:600;font-variant-numeric:tabular-nums;color:#334155}' +
        '.p111-net{font-weight:700;font-variant-numeric:tabular-nums}' +
        '.p111-deposit{color:#059669;font-weight:700;font-variant-numeric:tabular-nums}' +
        '.p111-status{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:99px;font-size:10px;font-weight:600}' +
        '.p111-status::before{content:"";width:6px;height:6px;border-radius:50%}' +
        '.p111-status.transfer{color:#1d4ed8;background:#dbeafe}.p111-status.transfer::before{background:#3b82f6}' +
        '.p111-status.pending{color:#b45309;background:#fef3c7}.p111-status.pending::before{background:#f59e0b}' +
        '.p111-status.completed{color:#047857;background:#d1fae5}.p111-status.completed::before{background:#10b981}' +
        '.p111-status.cancelled{color:#b91c1c;background:#fee2e2}.p111-status.cancelled::before{background:#ef4444}' +
        '.p111-status.other{color:#475569;background:#f1f5f9}.p111-status.other::before{background:#94a3b8}' +
        '.p111-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;border-top:1px solid var(--border,#e2e8f0);background:#f8fafc;font-size:10px;min-height:50px}' +
        '.p111-footer span{color:var(--muted,#64748b)}' +
        '.p111-pager{display:none;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border-top:1px solid var(--border,#e2e8f0)}' +
        '.p111-pager.show{display:flex}' +
        '.p111-pg-nav,.p111-pg-num{min-width:32px;height:32px;padding:0 8px;border:1px solid var(--border,#e2e8f0);border-radius:8px;background:#fff;color:var(--muted,#64748b);font-size:12px;font-weight:600;cursor:pointer;transition:.15s}' +
        '.p111-pg-nav:disabled{opacity:.4;cursor:default}' +
        '.p111-pg-num:hover:not(.active),.p111-pg-nav:hover:not(:disabled){color:#2563eb;border-color:#bfdbfe;background:#eff6ff}' +
        '.p111-pg-num.active{color:#fff;background:#2563eb;border-color:#2563eb}' +
        '.p111-pg-num.ellipsis{border:0;background:transparent;cursor:default}' +
        '.p111-empty{display:none;flex-direction:column;align-items:center;justify-content:center;min-height:300px;padding:30px;text-align:center;color:var(--muted,#64748b)}' +
        '.p111-empty.show{display:flex}' +
        '.p111-empty-ic{display:grid;width:58px;height:58px;place-items:center;margin-bottom:11px;border-radius:18px;background:#f1f5f9;color:#94a3b8}' +
        '.p111-empty-ic svg{width:26px;height:26px}' +
        '.p111-empty h3{margin:0;font-size:15px;color:var(--text,#172033)}' +
        '.p111-empty p{margin:4px 0 0;font-size:11px}' +
        '.p111-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:11px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:.2s}' +
        '.p111-toast.show{opacity:1;visibility:visible;transform:translateY(0)}' +
        '.p111-toast svg{width:17px;height:17px;color:#34d399}' +
        '.p111-changebtn{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#1d4ed8;font-size:10px;font-weight:600;cursor:pointer;transition:.15s;white-space:nowrap}' +
        '.p111-changebtn svg{width:13px;height:13px}' +
        '.p111-changebtn:hover{color:#fff;border-color:#2563eb;background:#2563eb}' +
        '.p111-cfbd{position:fixed;inset:0;z-index:210;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.48);backdrop-filter:blur(3px)}' +
        '.p111-cfbd.show{display:grid}' +
        '.p111-cfbox{width:min(500px,100%);overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 70px rgba(15,23,42,.35);animation:p111cfIn .2s ease}' +
        '@keyframes p111cfIn{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}' +
        '.p111-cfhead{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid #e2e8f0}' +
        '.p111-cfic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;border-radius:11px;background:#eff6ff;color:#2563eb}' +
        '.p111-cfic svg{width:19px;height:19px}' +
        '.p111-cfhead h3{margin:0;font-size:15px}' +
        '.p111-cfhead p{margin:1px 0 0;font-size:10px;color:#64748b}' +
        '.p111-cfdoc{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 18px 0}' +
        '.p111-cfitem{padding:11px 13px;border:1px solid #bfdbfe;border-radius:11px;background:#eff6ff}' +
        '.p111-cfitem span{display:block;font-size:9px;color:#64748b}' +
        '.p111-cfitem strong{display:block;margin-top:2px;font-size:12px;overflow-wrap:anywhere}' +
        '.p111-cfmsg{padding:14px 18px 0;font-size:12px;color:#172033}' +
        '.p111-cffoot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-top:1px solid #e2e8f0;background:#f8fafc;margin-top:14px}' +
        '.p111-cfnew{padding:9px 14px;border-radius:11px;background:#d1fae5;border:1px solid #a7f3d0}' +
        '.p111-cfnew span{display:block;font-size:10px;color:#047857}' +
        '.p111-cfnew strong{display:block;margin-top:2px;font-size:14px;color:#065f46}' +
        '.p111-cfbtns{display:flex;gap:8px}' +
        '.p111-cfbt{display:inline-flex;align-items:center;justify-content:center;height:39px;padding:0 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:.15s}' +
        '.p111-cfbt.cancel{border:1px solid #e2e8f0;background:#fff;color:#64748b}' +
        '.p111-cfbt.cancel:hover{border-color:#fca5a5;background:#fef2f2;color:#dc2626}' +
        '.p111-cfbt.ok{border:0;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.22)}' +
        '.p111-cfbt.ok:hover{filter:brightness(1.05)}' +
        '@media (max-width:1150px){.p111-summary{grid-template-columns:repeat(2,minmax(180px,1fr))}}' +
        '@media (max-width:720px){.p111-summary{grid-template-columns:1fr}}';
      document.head.appendChild(st);
    }

    /* events */
    $("p111LaunchBtn").addEventListener("click", doSearch);

    $("p111Prev").addEventListener("click", function () {
      if (state.page > 1) gotoPage(state.page - 1);
    });
    $("p111Next").addEventListener("click", function () {
      gotoPage(state.page + 1);
    });
    $("p111Pages").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p111-page]");
      if (btn) gotoPage(parseInt(btn.getAttribute("data-p111-page"), 10));
    });

    root.querySelectorAll("[data-p111-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-p111-sort");
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

    /* ปุ่ม "เปลี่ยน" — delegated (rows render ใหม่ทุกครั้ง) */
    $("p111Rows").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p111-change]");
      if (btn) {
        e.stopPropagation();
        openChangeDialog(btn.getAttribute("data-p111-change"));
      }
    });

    /* confirm dialog */
    $("p111CfCancel").addEventListener("click", closeChangeDialog);
    $("p111CfOk").addEventListener("click", function () {
      var doc = state.editingDoc;
      if (!doc) { closeChangeDialog(); return; }
      var okBtn = $("p111CfOk");
      okBtn.disabled = true;
      closeChangeDialog();
      saveStatus(doc)
        .then(function (d) {
          showToast("✓ บันทึกสถานะ " + doc + " เป็น 14 : รอโอน เรียบร้อย", 3000);
          // ดึงข้อมูลใหม่ (รายการที่ save ไปแล้ว status=14 จะไม่แสดงในช่วง test mode เปิด)
          return doSearch();
        })
        .catch(function (err) {
          showToast("❌ " + (err.message || "บันทึกสถานะไม่สำเร็จ"), 3500);
        })
        .then(function () {
          okBtn.disabled = false;
        });
    });
    $("p111CfBd").addEventListener("click", function (e) {
      if (e.target === this) closeChangeDialog();
    });
    if (state.escHandler) document.removeEventListener("keydown", state.escHandler);
    state.escHandler = function (e) {
      if (e.key === "Escape") closeChangeDialog();
    };
    document.addEventListener("keydown", state.escHandler);

    updateSortIcons();
    renderRows();
  }

  window.P111Overlimit = { mount: mount };
})();
