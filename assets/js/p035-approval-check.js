/* P035 — ตรวจสอบลูกค้าติดอนุมัติ (UI ตาม demo/P035_demo.html — real data MAC5) */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var fmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(v) { return fmt.format(Number(v || 0)); }

  var ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M14 2v6h6M8 13h8M8 17h5"></path></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>',
    lock: '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'
  };

  var CSS = [
    ".p035{--p035-primary:#2563eb;--p035-primary-dark:#1d4ed8;--p035-primary-soft:#eff6ff;--p035-success:#059669;--p035-success-soft:#ecfdf5;--p035-warning:#d97706;--p035-warning-soft:#fffbeb;--p035-danger:#dc2626;--p035-danger-soft:#fef2f2;--p035-text:#172033;--p035-muted:#64748b;--p035-border:#e2e8f0;--p035-surface:#fff;--p035-surface-soft:#f8fafc;font-family:inherit;color:var(--p035-text)}",
    ".p035 svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}",
    /* launcher */
    ".p035-launcher{display:grid;grid-template-columns:minmax(160px,1fr) minmax(160px,1fr) auto auto auto;gap:12px;align-items:end;padding:16px;border:1px solid var(--p035-border);border-radius:16px;background:var(--p035-surface);box-shadow:0 5px 18px rgba(15,23,42,.04)}",
    ".p035-field label{display:block;margin-bottom:6px;color:var(--p035-muted);font-size:11px;font-weight:600}",
    ".p035-input{width:100%;height:44px;padding:0 13px;color:var(--p035-text);border:1px solid var(--p035-border);border-radius:11px;outline:none;background:#fff;font:inherit}",
    ".p035-input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p035-check{display:flex;align-items:center;gap:8px;height:44px;padding:0 4px;color:var(--p035-text);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}",
    ".p035-check input{width:17px;height:17px;accent-color:var(--p035-primary)}",
    ".p035-launchbtn{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 20px;border-radius:11px;font-weight:700;white-space:nowrap;transition:.18s ease;cursor:pointer;font-size:13px;color:#fff;border:0;background:linear-gradient(135deg,#3b82f6,var(--p035-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,.22)}",
    ".p035-launchbtn:hover{filter:brightness(1.06);transform:translateY(-1px)}",
    ".p035-launchbtn:disabled{opacity:.55;cursor:default;transform:none;filter:none}",
    /* panel */
    ".p035-panel{display:flex;min-height:480px;flex-direction:column;margin-top:14px;border:1px solid var(--p035-border);border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08);overflow:hidden}",
    ".p035-panelhd{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid var(--p035-border)}",
    ".p035-panelhead{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p035-panelicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p035-primary);border-radius:11px;background:var(--p035-primary-soft)}",
    ".p035-paneltitle{min-width:0}",
    ".p035-paneltitle h2{overflow:hidden;font-size:15px;text-overflow:ellipsis;white-space:nowrap;margin:0}",
    ".p035-paneltitle p{overflow:hidden;margin:1px 0 0;color:var(--p035-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p035-panelact{display:flex;align-items:center;gap:8px}",
    ".p035-tsearch{position:relative;width:250px}",
    ".p035-tsearch svg{position:absolute;top:50%;left:10px;width:15px;height:15px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p035-tsearch input{width:100%;height:36px;padding:0 10px 0 32px;border:1px solid var(--p035-border);border-radius:9px;outline:none;font-size:12px;font:inherit}",
    ".p035-tsearch input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.12)}",
    ".p035-badge{padding:5px 10px;color:var(--p035-primary-dark);border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    /* table */
    ".p035-twrap{overflow:auto}",
    ".p035-table{width:100%;min-width:1150px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p035-table th{position:sticky;top:0;z-index:2;padding:13px 14px;color:#475569;border-bottom:1px solid var(--p035-border);background:var(--p035-surface-soft);box-shadow:inset 0 -1px var(--p035-border);font-size:14px;font-weight:700;text-align:left;user-select:none}",
    ".p035-table th.sortable{cursor:pointer}",
    ".p035-table th.sortable:hover{color:var(--p035-primary);background:#f1f5f9}",
    ".p035-table td{max-width:330px;overflow:hidden;padding:11px 14px;border-bottom:1px solid #edf1f6;font-size:14px;line-height:1.5;text-overflow:ellipsis}",
    ".p035-table .center{text-align:center}",
    ".p035-table .number{text-align:right}",
    ".p035-table tbody tr{cursor:pointer;transition:.14s ease}",
    ".p035-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p035-table tbody tr:hover{background:#f0f7ff}",
    ".p035-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 var(--p035-primary)}",
    ".p035-selcell{width:38px;padding:0 6px;text-align:center}",
    ".p035-rowselector{display:inline-block;visibility:hidden;width:0;height:0;border-top:7px solid transparent;border-bottom:7px solid transparent;border-left:10px solid var(--p035-primary)}",
    ".p035-table tr.selected .p035-rowselector{visibility:visible}",
    ".p035-code{color:var(--p035-primary-dark);font-weight:700}",
    ".p035-amount{color:#0f172a;font-variant-numeric:tabular-nums;font-weight:700}",
    ".p035-grade{display:inline-flex;min-width:28px;justify-content:center;padding:4px 8px;color:#1d4ed8;border-radius:7px;background:#dbeafe;font-size:12px;font-weight:700}",
    ".p035-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:99px;font-size:11px;font-weight:700}",
    ".p035-chip.pending{color:#b45309;background:#fef3c7}",
    ".p035-chip.locked{color:#b91c1c;background:#fee2e2}",
    ".p035-chip::before{width:6px;height:6px;border-radius:50%;background:currentColor;content:''}",
    /* empty */
    ".p035-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:60px 20px;color:var(--p035-muted)}",
    ".p035-empty svg{width:44px;height:44px;color:#cbd5e1}",
    ".p035-empty strong{font-size:14px;color:var(--p035-text)}",
    ".p035-empty span{font-size:12px}",
    /* footer */
    ".p035-tfoot{display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;border-top:1px solid var(--p035-border);background:var(--p035-surface-soft);font-size:12px;flex-wrap:wrap}",
    ".p035-tfoot>span{color:var(--p035-muted)}",
    ".p035-pager{display:flex;justify-content:center;align-items:center;gap:6px;padding:10px 15px 0}",
    ".p035-pbtn{min-width:32px;height:32px;padding:0 8px;color:var(--p035-muted);border:1px solid var(--p035-border);border-radius:8px;background:#fff;font-size:12px;font-weight:600;cursor:pointer;transition:.15s ease;font-family:inherit}",
    ".p035-pbtn:hover:not(:disabled){color:var(--p035-primary);border-color:#bfdbfe;background:var(--p035-primary-soft)}",
    ".p035-pbtn.act{color:#fff;border-color:var(--p035-primary);background:var(--p035-primary)}",
    ".p035-pbtn:disabled{opacity:.4;cursor:default}",
    /* modal */
    ".p035-modalbd{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.52);backdrop-filter:blur(4px)}",
    ".p035-modalbd.show{display:grid}",
    ".p035-modal{display:flex;width:min(560px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36)}",
    ".p035-modalhd{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--p035-border)}",
    ".p035-mhead{display:flex;align-items:center;gap:10px}",
    ".p035-micon{display:grid;width:38px;height:38px;place-items:center;color:var(--p035-primary);border-radius:11px;background:var(--p035-primary-soft)}",
    ".p035-mhead h3{margin:0;font-size:15px}",
    ".p035-mclose{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;color:var(--p035-muted);border:1px solid var(--p035-border);border-radius:9px;background:#fff;font-size:20px;cursor:pointer;font-family:inherit}",
    ".p035-mclose:hover{color:var(--p035-danger);border-color:#fecaca;background:var(--p035-danger-soft)}",
    ".p035-modalbd .p035-mbody{padding:16px;overflow:auto}",
    ".p035-dgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    ".p035-ditem{border:1px solid var(--p035-border);border-radius:10px;padding:9px 11px;background:var(--p035-surface-soft)}",
    ".p035-ditem.full{grid-column:1 / -1}",
    ".p035-ditem span{display:block;color:var(--p035-muted);font-size:10px;font-weight:600;margin-bottom:3px}",
    ".p035-ditem strong{font-size:13px;word-break:break-word}",
    /* toast */
    ".p035-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
    ".p035-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p035-toast svg{width:17px;height:17px;color:#34d399}",
    "@media (max-width:900px){.p035-launcher{grid-template-columns:1fr 1fr}.p035-check{grid-column:1 / -1}}"
  ].join("\n");

  var MAC5_CONNECTION_ID = "c1788406814359";

  function isLocked(it) { return it.grade === "X"; }
  function statusOf(it) {
    if (isLocked(it)) return { text: "ติด Lock", cls: "locked" };
    return { text: "รออนุมัติ", cls: "pending" };
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

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }
  function monthsAgoFirstISO(months) {
    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - months);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-01";
  }

  function mount(root) {
    var state = {
      rows: [],
      filtered: [],
      searched: false,
      loading: false,
      page: 1,
      selectedVN: null,
      sortField: "date",
      sortDir: "asc",
      toastTimer: null,
      escBound: false
    };

    root.innerHTML =
      '<div class="p035">' +
        '<form class="p035-launcher" id="p035Form">' +
          '<div class="p035-field">' +
            '<label for="p035From">วันที่เอกสาร (เริ่มต้น)</label>' +
            '<input class="p035-input" type="date" id="p035From">' +
          '</div>' +
          '<div class="p035-field">' +
            '<label for="p035To">วันที่เอกสาร (สิ้นสุด)</label>' +
            '<input class="p035-input" type="date" id="p035To">' +
          '</div>' +
          '<label class="p035-check"><input type="checkbox" id="p035LockOnly">ลูกค้าติด Lock (เกรด X)</label>' +
          '<button class="p035-launchbtn" type="submit">' + ICONS.search + 'ค้นหา</button>' +
        '</form>' +

        '<section class="p035-panel">' +
          '<div class="p035-panelhd">' +
            '<div class="p035-panelhead"><div class="p035-panelicon">' + ICONS.grid + '</div>' +
              '<div class="p035-paneltitle"><h2>รายการลูกค้าที่ติดอนุมัติ</h2><p id="p035Sub">ยังไม่มีข้อมูล — ใส่ช่วงวันที่ แล้วกด ปุ่ม ค้นหา</p></div>' +
            '</div>' +
            '<div class="p035-panelact">' +
              '<div class="p035-tsearch">' + ICONS.search + '<input id="p035Quick" type="search" placeholder="ค้นหา เลขที่ / รหัส / ลูกค้า"></div>' +
              '<span class="p035-badge" id="p035Badge">0 รายการ</span>' +
            '</div>' +
          '</div>' +
          '<div class="p035-twrap" id="p035Twrap">' +
            '<table class="p035-table">' +
              '<thead><tr>' +
                '<th class="p035-selcell"></th>' +
                '<th class="sortable" data-sort="date">วันที่</th>' +
                '<th class="sortable" data-sort="vn">เลขใบสำคัญ</th>' +
                '<th class="sortable" data-sort="code">รหัสลูกค้า</th>' +
                '<th class="sortable" data-sort="name">ชื่อลูกค้า</th>' +
                '<th class="center sortable" data-sort="grade">เกรด</th>' +
                '<th>รายละเอียด</th>' +
                '<th class="number sortable" data-sort="amount">ยอดสุทธิ</th>' +
                '<th class="center">สถานะ (20)</th>' +
              '</tr></thead>' +
              '<tbody id="p035Rows"></tbody>' +
            '</table>' +
          '</div>' +
          '<div class="p035-pager" id="p035Pager"></div>' +
          '<div class="p035-tfoot">' +
            '<span id="p035Desc">แสดง 0 รายการ</span>' +
          '</div>' +
        '</section>' +

      '<div class="p035-modalbd" id="p035Modal">' +
        '<section class="p035-modal">' +
          '<div class="p035-modalhd">' +
            '<div class="p035-mhead"><div class="p035-micon">' + ICONS.doc + '</div>' +
              '<h3>รายละเอียดรายการอนุมัติ</h3>' +
            '</div>' +
            '<button class="p035-mclose" id="p035Close" type="button">×</button>' +
          '</div>' +
          '<div class="p035-mbody">' +
            '<div class="p035-dgrid">' +
              '<div class="p035-ditem"><span>วันที่</span><strong id="p035DDate"></strong></div>' +
              '<div class="p035-ditem"><span>เลขที่เอกสาร</span><strong id="p035DVn"></strong></div>' +
              '<div class="p035-ditem"><span>รหัสลูกค้า</span><strong id="p035DCode"></strong></div>' +
              '<div class="p035-ditem"><span>เกรด</span><strong id="p035DGrade"></strong></div>' +
              '<div class="p035-ditem full"><span>ชื่อลูกค้า</span><strong id="p035DName"></strong></div>' +
              '<div class="p035-ditem full"><span>รายละเอียด</span><strong id="p035DDesc"></strong></div>' +
              '<div class="p035-ditem"><span>ยอดเงิน</span><strong id="p035DAmount"></strong></div>' +
              '<div class="p035-ditem"><span>สถานะ</span><strong id="p035DStatus"></strong></div>' +
            '</div>' +
          '</div>' +
        '</section>' +
      '</div>' +

      '<div class="p035-toast" id="p035Toast">' + ICONS.check + '<span id="p035ToastMsg"></span></div>' +
      '</div>';

    var style = document.createElement("style");
    style.textContent = CSS;
    root.appendChild(style);

    var el = {
      form: $("#p035Form", root), dateFrom: $("#p035From", root), dateTo: $("#p035To", root),
      lockOnly: $("#p035LockOnly", root),
      sub: $("#p035Sub", root), quick: $("#p035Quick", root), badge: $("#p035Badge", root),
      rows: $("#p035Rows", root), twrap: $("#p035Twrap", root),
      desc: $("#p035Desc", root),
      pager: $("#p035Pager", root),
      modal: $("#p035Modal", root), close: $("#p035Close", root),
      dDate: $("#p035DDate", root), dVn: $("#p035DVn", root), dCode: $("#p035DCode", root),
      dGrade: $("#p035DGrade", root), dName: $("#p035DName", root), dDesc: $("#p035DDesc", root),
      dAmount: $("#p035DAmount", root), dStatus: $("#p035DStatus", root),
      toast: $("#p035Toast", root), toastMsg: $("#p035ToastMsg", root)
    };

    el.dateFrom.value = monthsAgoFirstISO(2);
    el.dateTo.value = todayISO();

    function toast(msg) {
      el.toastMsg.textContent = msg;
      el.toast.classList.add("show");
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, 1800);
    }

    function emptyHtml() {
      if (!state.searched) {
        return '<tr><td colspan="9"><div class="p035-empty">' + ICONS.search +
          '<strong>ยังไม่มีข้อมูล</strong><span>ใส่ช่วงวันที่เอกสาร แล้วกด ปุ่ม ค้นหา เพื่อโหลดข้อมูล</span></div></td></tr>';
      }
      return '<tr><td colspan="9"><div class="p035-empty">' + ICONS.grid +
        '<strong>ไม่พบรายการที่ติดอนุมัติ</strong><span>ลองเปลี่ยนช่วงวันที่หรือคำค้นหา</span></div></td></tr>';
    }

    var PAGE_SIZE = 15;

    function renderRows() {
      var items = sortRows(state.filtered, state.sortField, state.sortDir);

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
        var sel = it.vn === state.selectedVN ? " selected" : "";
        return '<tr class="' + sel.trim() + '" data-vn="' + escapeHtml(it.vn) + '" data-code="' + escapeHtml(it.code) + '">' +
          '<td class="p035-selcell"><span class="p035-rowselector"></span></td>' +
          '<td>' + escapeHtml(it.date) + '</td>' +
          '<td class="p035-code">' + escapeHtml(it.vn) + '</td>' +
          '<td>' + escapeHtml(it.code) + '</td>' +
          '<td title="' + escapeHtml(it.name) + '">' + escapeHtml(it.name) + '</td>' +
          '<td class="center"><span class="p035-grade">' + escapeHtml(it.grade) + '</span></td>' +
          '<td title="' + escapeHtml(it.desc) + '">' + escapeHtml(it.desc) + '</td>' +
          '<td class="number p035-amount">' + money(it.amount) + '</td>' +
          '<td class="center"><span class="p035-chip ' + st.cls + '">' + st.text + '</span></td>' +
        '</tr>';
      }).join("");

      renderPager(totalPages);
    }

    function renderPager(totalPages) {
      if (totalPages <= 1) { el.pager.innerHTML = ""; return; }
      var html = '<button class="p035-pbtn" data-page="prev" type="button"' + (state.page <= 1 ? " disabled" : "") + '>‹</button>';
      var lo = Math.max(1, state.page - 3), hi = Math.min(totalPages, lo + 6);
      lo = Math.max(1, hi - 6);
      for (var p = lo; p <= hi; p++) {
        html += '<button class="p035-pbtn' + (p === state.page ? " act" : "") + '" data-page="' + p + '" type="button">' + p + '</button>';
      }
      html += '<button class="p035-pbtn" data-page="next" type="button"' + (state.page >= totalPages ? " disabled" : "") + '>›</button>';
      el.pager.innerHTML = html;
    }

    function applyFilters() {
      var kw = el.quick.value.trim().toLowerCase();
      state.filtered = state.rows.filter(function (it) {
        var text = (it.vn + " " + it.code + " " + it.name + " " + it.desc + " " + statusOf(it).text).toLowerCase();
        return !kw || text.indexOf(kw) !== -1;
      });
      state.searched = true;
      state.page = 1;
      renderRows();
    }

    // events
    el.form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state.loading) return;
      var from = el.dateFrom.value;
      var to = el.dateTo.value;
      if (from && to && from > to) { toast("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด"); return; }
      state.loading = true;
      fetch("api/p035_search.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID, from: from, to: to, lockOnly: el.lockOnly.checked })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          state.loading = false;
          if (!data || !data.ok) throw new Error("api");
          state.rows = data.rows || [];
          el.sub.textContent = "ช่วงวันที่ " + (from ? from.split("-").reverse().join("/") : "—") + " ถึง " + (to ? to.split("-").reverse().join("/") : "—");
          applyFilters();
          toast("แสดงรายการ " + state.filtered.length + " รายการแล้ว");
        })
        .catch(function () {
          state.loading = false;
          state.rows = [];
          el.sub.textContent = "ช่วงวันที่ " + (from ? from.split("-").reverse().join("/") : "—") + " ถึง " + (to ? to.split("-").reverse().join("/") : "—");
          applyFilters();
          toast("โหลดข้อมูลล้มเหลว — ลองใหม่อีกครั้ง");
        });
    });

    el.quick.addEventListener("input", function () {
      if (state.searched) applyFilters();
    });

    $$("#p035Twrap th[data-sort]", root).forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-sort");
        if (state.sortField === f) { state.sortDir = state.sortDir === "asc" ? "desc" : "asc"; }
        else { state.sortField = f; state.sortDir = "asc"; }
        state.page = 1;
        renderRows();
      });
    });

    el.pager.addEventListener("click", function (e) {
      var btn = e.target.closest(".p035-pbtn");
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
      var tr = e.target.closest("tr[data-vn]");
      if (!tr) return;
      state.selectedVN = tr.getAttribute("data-vn");
      renderRows();
    });

    el.rows.addEventListener("dblclick", function (e) {
      var tr = e.target.closest("tr[data-vn]");
      if (!tr) return;
      var vn = tr.getAttribute("data-vn");
      var it = state.filtered.filter(function (x) { return x.vn === vn; })[0];
      if (!it) return;
      openDetail(it);
    });

    function openDetail(it) {
      var st = statusOf(it);
      el.dDate.textContent = it.date;
      el.dVn.textContent = it.vn;
      el.dCode.textContent = it.code;
      el.dGrade.textContent = it.grade;
      el.dName.textContent = it.name;
      el.dDesc.textContent = it.desc;
      el.dAmount.textContent = "฿" + money(it.amount);
      el.dStatus.innerHTML = '<span class="p035-chip ' + st.cls + '">' + st.text + '</span>';
      el.modal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closeDetail() {
      el.modal.classList.remove("show");
      document.body.style.overflow = "";
    }

    el.close.addEventListener("click", closeDetail);
    el.modal.addEventListener("click", function (e) { if (e.target === el.modal) closeDetail(); });

    if (!state.escBound) {
      state.escBound = true;
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && el.modal.classList.contains("show")) closeDetail();
      });
    }

    renderRows();
  }

  window.P035ApprovalCheck = { mount: mount };
})();
