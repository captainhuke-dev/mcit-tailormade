/* P047 — เช็คสถานะ Invoice
   ตาม C# frm_CheckStatusInvoiceGUI (AppCheckStatusInvoice) + demo/P047-demo.html:
     เงื่อนไขค้นหา: range วันที่ (1 ค่าเดือนก่อน → วันนี้-3 ตาม C#) + สถานะ (AR_S IN 62,63,65,67,68,70 — checkbox ทั้งหมด)
     → ตาราง Invoice (MIH IS, cancel=0, status IN, range วันที่) — วันที่/เลขที่/รหัส/ชื่อ/สถานะ/จำนวนพิมพ์
     → quick search + sort column + คลิกแถว = select
   Real data MAC5 — api/p047_search.php
   (IIFE — window.P047InvoiceStatus = { mount, destroy })
*/
(function () {
  'use strict';

  var CONNECTION = (window.TAILORMADE_CONNECTION_ID || 'c1788406814359').trim();

  function api(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ connectionId: CONNECTION }, body || {}))
    }).then(function (r) { return r.json(); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function iso(d) {
    var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var dd = String(d.getDate()); if (dd.length < 2) dd = '0' + dd;
    return d.getFullYear() + '-' + m + '-' + dd;
  }

  function thDate(isoStr) {
    if (!isoStr) return '-';
    var p = isoStr.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  var STATUS_CLS = { 62: 'blue', 63: 'orange', 65: 'green', 67: 'red', 68: 'green', 70: 'blue' };

  function statusBadge(code, nameMap) {
    var cls = STATUS_CLS[code] || 'blue';
    var nm = nameMap[code] || '';
    return '<span class="p047-st p047-st--' + cls + '" title="' + esc(nm) + '">' + esc(code) + '</span>';
  }

  function mount(root) {
    // C# default: 1 ค่าเดือนก่อน → วันนี้ - 3
    var now = new Date();
    var from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var to = new Date(now); to.setDate(to.getDate() - 3);

    var state = {
      dateFrom: iso(from),
      dateTo: iso(to),
      statuses: {},
      allStatuses: [],
      searched: false,
      rows: [],
      selVnos: null,
      sortField: 'date',
      sortDir: 'asc',
      quick: ''
    };
    var _el = {};

    root.innerHTML =
      '<div class="p047">' +
      '  <section class="p047-card">' +
      '    <div class="p047-cardhead"><div class="p047-cardtitle"><span>⌕</span> เงื่อนไขการค้นหา</div></div>' +
      '    <div class="p047-cardbody">' +
      '      <form class="p047-filter" id="p047Form">' +
      '        <div class="p047-fg">' +
      '          <label>วันที่เอกสาร</label>' +
      '          <div class="p047-daterange">' +
      '            <input type="date" id="p047DateFrom">' +
      '            <span class="p047-darsep">ถึง</span>' +
      '            <input type="date" id="p047DateTo">' +
      '          </div>' +
      '        </div>' +
      '        <div class="p047-fg">' +
      '          <label>สถานะ Invoice</label>' +
      '          <div class="p047-selwrap" id="p047SelWrap">' +
      '            <button type="button" class="p047-selbtn" id="p047SelBtn"><span class="p047-selval" id="p047SelVal">โหลดสถานะ...</span><span class="p047-caret">▾</span></button>' +
      '            <div class="p047-menu" id="p047Menu">' +
      '              <div class="p047-menuhead"><span>เลือกสถานะที่ต้องการค้นหา</span><button type="button" class="p047-tlink" id="p047ToggleAll">เลือกทั้งหมด</button></div>' +
      '              <div class="p047-opts" id="p047Opts"></div>' +
      '            </div>' +
      '          </div>' +
      '        </div>' +
      '        <div class="p047-btns">' +
      '          <button type="submit" class="p047-btn p047-btn--primary">⌕ ค้นหา</button>' +
      '        </div>' +
      '      </form>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p047-card">' +
      '    <div class="p047-cardhead">' +
      '      <div class="p047-cardtitle"><span>▤</span> รายการ Invoice</div>' +
      '      <div class="p047-period" id="p047Period">ยังไม่ค้นหา</div>' +
      '      <div class="p047-quick">' +
      '        <input type="search" id="p047Quick" placeholder="ค้นหา Invoice, รหัส หรือชื่อลูกค้า">' +
      '      </div>' +
      '    </div>' +
      '    <div class="p047-twrap">' +
      '      <table class="p047-tbl">' +
      '        <thead><tr>' +
      '          <th class="p047-sort p047-c" data-f="date">วันที่</th>' +
      '          <th class="p047-sort" data-f="vnos">เลขที่ใบสำคัญ</th>' +
      '          <th class="p047-sort" data-f="cus">รหัสลูกค้า</th>' +
      '          <th class="p047-sort" data-f="name">ชื่อลูกค้า</th>' +
      '          <th class="p047-sort p047-c" data-f="status">สถานะ</th>' +
      '          <th class="p047-sort p047-c" data-f="printN">จำนวนพิมพ์</th>' +
      '        </tr></thead>' +
      '        <tbody id="p047Body"></tbody>' +
      '      </table>' +
      '    </div>' +
      '    <div class="p047-foot">' +
      '      <span id="p047FootCount">ยังไม่ค้นหา</span>' +
      '      <span class="p047-footst" id="p047FootSt"></span>' +
      '    </div>' +
      '  </section>' +
      '</div>';

    _el.dateFrom = root.querySelector('#p047DateFrom');
    _el.dateTo = root.querySelector('#p047DateTo');
    _el.selBtn = root.querySelector('#p047SelBtn');
    _el.selVal = root.querySelector('#p047SelVal');
    _el.menu = root.querySelector('#p047Menu');
    _el.opts = root.querySelector('#p047Opts');
    _el.period = root.querySelector('#p047Period');
    _el.quick = root.querySelector('#p047Quick');
    _el.body = root.querySelector('#p047Body');
    _el.footCount = root.querySelector('#p047FootCount');
    _el.footSt = root.querySelector('#p047FootSt');

    _el.dateFrom.value = state.dateFrom;
    _el.dateTo.value = state.dateTo;

    /* ---- statuses dropdown (AR_S — จาก API) ---- */
    function checkedList() {
      return state.allStatuses.filter(function (s) { return state.statuses[s.code]; });
    }

    function updateSelLabel() {
      var n = checkedList().length;
      _el.selVal.innerHTML = n === 0 ? 'เลือกสถานะ' : 'เลือก <strong>' + n + '</strong> สถานะ';
      _el.footSt.textContent = n > 0 ? 'สถานะที่เลือก ' + n + ' สถานะ' : '';
    }

    function renderOpts() {
      _el.opts.innerHTML = state.allStatuses.map(function (s) {
        return '<label class="p047-opt"><input type="checkbox" value="' + s.code + '"' + (state.statuses[s.code] ? ' checked' : '') + '> ' + esc(s.code) + ' · ' + esc(s.name) + '</label>';
      }).join('');
    }

    api('api/p047_search.php', { dateFrom: state.dateFrom, dateTo: state.dateTo, statuses: [62] }).then(function (d) {
      if (d && d.ok && d.statuses) {
        state.allStatuses = d.statuses;
        state.allStatuses.forEach(function (s) { state.statuses[s.code] = true; });
        renderOpts();
        updateSelLabel();
      }
    }).catch(function () {});

    _el.selBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      _el.menu.classList.toggle('p047-open');
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#p047SelWrap')) _el.menu.classList.remove('p047-open');
    });
    root.querySelector('#p047ToggleAll').addEventListener('click', function () {
      var all = state.allStatuses.length > 0 && state.allStatuses.every(function (s) { return state.statuses[s.code]; });
      state.allStatuses.forEach(function (s) { state.statuses[s.code] = !all; });
      renderOpts();
      updateSelLabel();
      if (state.searched) doSearch(false);
    });
    _el.opts.addEventListener('change', function () {
      state.allStatuses.forEach(function (s) {
        var cb = _el.opts.querySelector('input[value="' + s.code + '"]');
        state.statuses[s.code] = cb ? cb.checked : false;
      });
      updateSelLabel();
      if (state.searched) doSearch(false);
    });

    /* ---- search ---- */
    function doSearch(notify) {
      var sel = checkedList();
      if (sel.length === 0) {
        alert('กรุณาเลือก สถานะ อย่างน้อย 1 ค่า');
        return;
      }
      _el.body.innerHTML = '<tr><td colspan="6" class="p047-empty">กำลังค้นหา...</td></tr>';
      api('api/p047_search.php', {
        dateFrom: _el.dateFrom.value,
        dateTo: _el.dateTo.value,
        statuses: sel.map(function (s) { return s.code; })
      }).then(function (d) {
        if (!d || !d.ok) {
          state.rows = [];
          _el.body.innerHTML = '<tr><td colspan="6" class="p047-empty">ค้นหาไม่ได้: ' + esc((d && d.error) || '') + '</td></tr>';
          _el.footCount.textContent = '';
          return;
        }
        state.rows = d.rows || [];
        state.searched = true;
        state.dateFrom = _el.dateFrom.value;
        state.dateTo = _el.dateTo.value;
        state.selVnos = null;
        render();
      }).catch(function () {
        state.rows = [];
        _el.body.innerHTML = '<tr><td colspan="6" class="p047-empty">ค้นหาไม่ได้ (network)</td></tr>';
      });
    }

    root.querySelector('#p047Form').addEventListener('submit', function (e) {
      e.preventDefault();
      _el.menu.classList.remove('p047-open');
      doSearch(true);
    });

    /* ---- render (quick search + sort — client-side) ---- */
    function nameMap() {
      var m = {};
      state.allStatuses.forEach(function (s) { m[s.code] = s.name; });
      return m;
    }

    function filtered() {
      var q = state.quick.trim().toLowerCase();
      var rows = state.rows;
      if (q) {
        rows = rows.filter(function (r) {
          return (r.vnos + ' ' + r.cus + ' ' + r.name + ' ' + r.status).toLowerCase().indexOf(q) > -1;
        });
      }
      var f = state.sortField;
      var dir = state.sortDir === 'asc' ? 1 : -1;
      rows = rows.slice().sort(function (a, b) {
        var x = f === 'date' ? a.iso : a[f];
        var y = f === 'date' ? b.iso : b[f];
        if (typeof x === 'string') { x = x.toLowerCase(); y = String(y).toLowerCase(); }
        if (x < y) return -1 * dir;
        if (x > y) return 1 * dir;
        return 0;
      });
      return rows;
    }

    function render() {
      if (!state.searched) {
        _el.body.innerHTML = '<tr><td colspan="6" class="p047-empty">เลือกเงื่อนไขแล้วกด ค้นหา</td></tr>';
        _el.period.textContent = 'ยังไม่ค้นหา';
        _el.footCount.textContent = 'ยังไม่ค้นหา';
        return;
      }
      _el.period.textContent = 'วันที่ ' + thDate(state.dateFrom) + ' ถึง ' + thDate(state.dateTo);
      var rows = filtered();
      var nm = nameMap();
      if (rows.length === 0) {
        _el.body.innerHTML = '<tr><td colspan="6" class="p047-empty">' + (state.rows.length === 0 ? 'ไม่พบข้อมูล' : 'ไม่พบรายการตามคำค้นหา') + '</td></tr>';
      } else {
        _el.body.innerHTML = rows.map(function (r) {
          var sel = state.selVnos === r.vnos ? ' class="p047-sel"' : '';
          return '<tr data-v="' + esc(r.vnos) + '"' + sel + '>' +
            '<td class="p047-c">' + esc(r.date) + '</td>' +
            '<td class="p047-vno">' + esc(r.vnos) + '</td>' +
            '<td class="p047-cus">' + esc(r.cus) + '</td>' +
            '<td>' + esc(r.name) + '</td>' +
            '<td class="p047-c">' + statusBadge(r.status, nm) + '</td>' +
            '<td class="p047-c p047-print">' + esc(r.printN) + '</td>' +
            '</tr>';
        }).join('');
      }
      _el.footCount.textContent = 'แสดง ' + rows.length + ' รายการ';
      updateSelLabel();
    }

    _el.quick.addEventListener('input', function () {
      state.quick = _el.quick.value;
      render();
    });

    root.querySelectorAll('.p047-sort').forEach(function (th) {
      th.addEventListener('click', function () {
        var f = th.getAttribute('data-f');
        if (state.sortField === f) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortField = f;
          state.sortDir = 'asc';
        }
        render();
      });
    });

    _el.body.addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-v]');
      if (!tr) return;
      state.selVnos = tr.getAttribute('data-v');
      render();
    });

    /* ---- CSS ---- */
    var style = document.createElement('style');
    style.textContent = [
      ".p047{display:grid;gap:16px;color:var(--ink,#1b2b3c);font-size:13px}",
      ".p047-card{overflow:hidden;border:1px solid #d8e2ee;border-radius:12px;background:#fff;box-shadow:0 10px 30px rgba(30,72,118,.10)}",
      ".p047-cardhead{display:flex;align-items:center;gap:14px;min-height:50px;padding:0 18px;border-bottom:1px solid #d8e2ee;background:linear-gradient(90deg,#fff,#f8fbff)}",
      ".p047-cardtitle{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;color:#17324d}",
      ".p047-cardtitle span{display:grid;width:30px;height:30px;place-items:center;border-radius:8px;background:#eaf4ff;color:#1769c2;font-size:14px}",
      ".p047-cardbody{padding:16px 18px}",
      ".p047-filter{display:grid;grid-template-columns:1.2fr 1.2fr auto;gap:14px;align-items:end}",
      ".p047-fg{display:flex;flex-direction:column;gap:6px}",
      ".p047-fg label{color:#506579;font-size:12px;font-weight:700}",
      ".p047-daterange{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}",
      ".p047-darsep{color:#506579;font-size:12px;font-weight:700}",
      ".p047-fg input,.p047-quick input{height:36px;padding:0 10px;outline:0;border:1px solid #cbd8e5;border-radius:7px;background:#fff;color:inherit;font-family:inherit;font-size:13px}",
      ".p047-fg input:focus,.p047-quick input:focus{border-color:#1769c2;box-shadow:0 0 0 3px rgba(23,105,194,.13)}",
      ".p047-btns{display:flex;gap:8px}",
      ".p047-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:36px;padding:0 18px;cursor:pointer;border:0;border-radius:7px;font-size:13px;font-weight:700;font-family:inherit}",
      ".p047-btn--primary{background:#2563eb !important;color:#fff}",
      ".p047-btn--primary:hover{background:#1d4ed8 !important}",
      ".p047-selwrap{position:relative}",
      ".p047-selbtn{display:flex;width:100%;align-items:center;justify-content:space-between;gap:10px;min-height:36px;padding:0 12px;border:1px solid #cbd8e5;border-radius:7px;background:#fff;color:inherit;font-size:13px;font-weight:600;cursor:pointer;text-align:left}",
      ".p047-selbtn:hover{border-color:#93c5fd;background:#f8fbff}",
      ".p047-selval strong{color:#1769c2}",
      ".p047-caret{color:#738397;font-size:11px}",
      ".p047-menu{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:30;display:none;border:1px solid #bfdbfe;border-radius:10px;background:#fff;box-shadow:0 18px 38px rgba(15,23,42,.18)}",
      ".p047-menu.p047-open{display:block}",
      ".p047-menuhead{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:11px;font-weight:700;color:#475569}",
      ".p047-tlink{border:0;background:transparent;color:#2563eb;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit}",
      ".p047-opts{display:grid;grid-template-columns:repeat(2,1fr);gap:2px;max-height:230px;overflow-y:auto;padding:8px}",
      ".p047-opt{display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:7px;font-size:12px;cursor:pointer}",
      ".p047-opt:hover{background:#eff6ff}",
      ".p047-opt input{width:15px;height:15px;accent-color:#2563eb}",
      ".p047-period{color:#53687b;font-size:12px;font-weight:600}",
      ".p047-quick{margin-left:auto}",
      ".p047-quick input{width:260px;height:32px;font-size:12px}",
      ".p047-twrap{overflow:auto;max-height:560px}",
      ".p047-tbl{width:100%;border-collapse:collapse;white-space:nowrap}",
      ".p047-tbl thead th{position:sticky;z-index:1;top:0;padding:11px 14px;border-bottom:1px solid #cfdbe7;background:#edf5fc;color:#426176;font-size:12px;font-weight:700;text-align:left;user-select:none}",
      ".p047-tbl thead th.p047-c{text-align:center}",
      ".p047-tbl thead th.p047-sort{cursor:pointer}",
      ".p047-tbl thead th.p047-sort:hover{color:#1769c2;background:#e2eefb}",
      ".p047-tbl tbody td{padding:10px 14px;border-bottom:1px solid #e6edf4;color:#2d4052}",
      ".p047-tbl tbody td.p047-c{text-align:center}",
      ".p047-tbl tbody tr{cursor:pointer;transition:background .15s ease}",
      ".p047-tbl tbody tr:nth-child(even){background:#fbfdff}",
      ".p047-tbl tbody tr:hover{background:#f0f7ff}",
      ".p047-tbl tbody tr.p047-sel{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}",
      ".p047-vno{color:#0c4f9b;font-weight:700}",
      ".p047-cus{color:#334155;font-weight:700;font-family:Arial,sans-serif}",
      ".p047-print{font-weight:700;font-family:Arial,sans-serif}",
      ".p047-st{display:inline-flex;min-width:40px;align-items:center;justify-content:center;padding:4px 9px;border-radius:7px;font-size:11px;font-weight:700}",
      ".p047-st--blue{color:#1d4ed8;background:#dbeafe}",
      ".p047-st--orange{color:#b45309;background:#fef3c7}",
      ".p047-st--green{color:#047857;background:#d1fae5}",
      ".p047-st--red{color:#b91c1c;background:#fee2e2}",
      ".p047-empty{padding:32px;color:#738397;text-align:center}",
      ".p047-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:46px;padding:8px 16px;border-top:1px solid #e6edf4;background:#f8fafc;color:#53687b;font-size:12px}"
    ].join('\n');
    document.head.appendChild(style);
  }

  window.P047InvoiceStatus = { mount: mount };
})();
