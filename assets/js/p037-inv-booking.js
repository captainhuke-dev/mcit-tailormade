/* P037 — ตรวจสอบของจองที่มีการเปิดบิล
   ตาม C# FrmINVGUI + INVResult (AppINV) + demo/P037-demo.html:
     เงื่อนไขค้นหา (วันที่/ดำเนินหน้าใบ/รหัสลูกค้า/เลขที่ใบสำคัญ)
     → ตารางใบแจ้งหนี้ (INV — type IS, IVV%/IVN%) — คลิกแถว = filter ใบจองตามลูกค้า
     → ตารางใบจอง (RSV — type SS, cancel=0, status != 4, เดือน/ปีเดียวกัน, คus IN)
     → double-click แถว INV = modal items (INV items vs RSV items — MIL+STK)
   Real data MAC5 — api/p037_search.php + api/p037_items.php
   (IIFE — window.P037InvBooking = { mount, destroy })
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

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
    var dd = String(d.getDate()); if (dd.length < 2) dd = '0' + dd;
    return d.getFullYear() + '-' + m + '-' + dd;
  }

  function fmtDate(y, m, d) {
    return String(d).padStart(2, '0') + '/' + String(m).padStart(2, '0') + '/' + y;
  }

  function statusBadge(status) {
    var s = status || '';
    var cls = s === 'PACKING' ? 'p037-st--ready' : 'p037-st--waiting';
    return '<span class="p037-st ' + cls + '">' + (esc(s) || '-') + '</span>';
  }

  function mount(root) {
    var state = {
      date: todayStr(),
      type: 'IVV',
      cus: '',
      vnos: '',
      dep: '',
      searched: false,
      inv: [],
      rsv: [],
      selCus: null,
      selVnos: null
    };
    var _el = {};
    var _modal = null;

    root.innerHTML =
      '<div class="p037">' +
      '  <section class="p037-card">' +
      '    <div class="p037-cardhead"><div class="p037-cardtitle"><span>⌕</span> เงื่อนไขการค้นหา</div></div>' +
      '    <div class="p037-cardbody">' +
      '      <form class="p037-filter" id="p037Form">' +
      '        <div class="p037-fg"><label>วันที่</label><input type="date" id="p037Date"></div>' +
      '        <div class="p037-fg"><label>เลขที่ใบสำคัญ</label><input type="text" id="p037Type" value=""></div>' +
      '        <div class="p037-fg"><label>รหัสลูกค้า</label><input type="text" id="p037Cus" placeholder="ระบุรหัสลูกค้า"></div>' +
      '        <div class="p037-btns">' +
      '          <button type="submit" class="p037-btn p037-btn--primary">⌕ ค้นหา</button>' +
      '          <button type="button" class="p037-btn p037-btn--ghost" id="p037Clear">↺ ล้างข้อมูล</button>' +
      '        </div>' +
      '      </form>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p037-card">' +
      '    <div class="p037-cardhead">' +
      '      <div class="p037-cardtitle"><span>▤</span> ใบแจ้งหนี้</div>' +
      '      <div class="p037-summary" id="p037InvSum">ยังไม่ค้นหา</div>' +
      '    </div>' +
      '    <div class="p037-twrap">' +
      '      <table class="p037-tbl">' +
      '        <thead><tr><th class="p037-no">No.</th><th>วันที่</th><th>รหัสลูกค้า</th><th>ชื่อลูกค้า</th><th>ใบสำคัญ</th><th>สถานะ</th><th>โทรขาย</th></tr></thead>' +
      '        <tbody id="p037InvBody"></tbody>' +
      '      </table>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p037-card">' +
      '    <div class="p037-cardhead">' +
      '      <div class="p037-cardtitle"><span>▤</span> ใบจอง</div>' +
      '      <div class="p037-summary" id="p037RsvSum">กรุณาเลือกใบแจ้งหนี้</div>' +
      '    </div>' +
      '    <div class="p037-twrap">' +
      '      <table class="p037-tbl">' +
      '        <thead><tr><th>วันที่</th><th>รหัสลูกค้า</th><th>ชื่อลูกค้า</th><th>ใบสำคัญ</th><th>สถานะ(ใบเบิก)</th><th>บันทึกภายใน</th><th>หมายเหตุ</th></tr></thead>' +
      '        <tbody id="p037RsvBody"></tbody>' +
      '      </table>' +
      '    </div>' +
      '  </section>' +
      '  <div class="p037-footnote">คลิกแถวใบแจ้งหนี้เพื่อดูใบจองของลูกค้านั้น · double-click แถวใบแจ้งหนี้เพื่อดูรายละเอียดสินค้า (INV vs RSV)</div>' +
      '</div>';

    _el.date = root.querySelector('#p037Date');
    _el.type = root.querySelector('#p037Type');
    _el.cus = root.querySelector('#p037Cus');
    _el.invSum = root.querySelector('#p037InvSum');
    _el.rsvSum = root.querySelector('#p037RsvSum');
    _el.invBody = root.querySelector('#p037InvBody');
    _el.rsvBody = root.querySelector('#p037RsvBody');

    _el.date.value = state.date;

    /* ---- render ---- */
    function renderInv() {
      if (!state.searched) {
        _el.invSum.textContent = 'ยังไม่ค้นหา';
        _el.invBody.innerHTML = '<tr><td colspan="7" class="p037-empty">กรุณาเลือกเงื่อนไขแล้วกด ค้นหา</td></tr>';
        return;
      }
      _el.invSum.innerHTML = 'พบทั้งหมด <span class="p037-count">' + state.inv.length + '</span> รายการ';
      if (state.inv.length === 0) {
        _el.invBody.innerHTML = '<tr><td colspan="7" class="p037-empty">ไม่พบข้อมูลใบแจ้งหนี้ตามเงื่อนไขที่ระบุ</td></tr>';
        return;
      }
      _el.invBody.innerHTML = state.inv.map(function (r, i) {
        var sel = state.selVnos === r.vnos ? ' class="p037-sel"' : '';
        return '<tr data-i="' + i + '"' + sel + '>' +
          '<td class="p037-no">' + (i + 1) + '</td>' +
          '<td>' + esc(r.date) + '</td>' +
          '<td>' + esc(r.cus) + '</td>' +
          '<td>' + esc(r.name) + '</td>' +
          '<td class="p037-vno">' + esc(r.vnos) + '</td>' +
          '<td>' + statusBadge(r.status) + '</td>' +
          '<td>' + (esc(r.dep) || '-') + '</td>' +
          '</tr>';
      }).join('');
    }

    function rsvFiltered() {
      return state.rsv;
    }

    function renderRsv() {
      if (!state.searched || state.selCus === null) {
        _el.rsvSum.textContent = state.searched ? (state.inv.length === 0 ? 'ไม่มีใบแจ้งหนี้' : 'กรุณาเลือกใบแจ้งหนี้') : 'กรุณาเลือกใบแจ้งหนี้';
        _el.rsvBody.innerHTML = '<tr><td colspan="7" class="p037-empty">' + (state.searched && state.inv.length === 0 ? 'ไม่มีข้อมูล' : 'เลือกใบแจ้งหนี้จากตารางด้านบนเพื่อแสดงรายการใบจอง') + '</td></tr>';
        return;
      }
      var rows = rsvFiltered();
      _el.rsvSum.innerHTML = 'พบรายการใบจอง <span class="p037-count">' + rows.length + '</span> รายการ · ลูกค้า ' + esc(state.selCus);
      if (rows.length === 0) {
        _el.rsvBody.innerHTML = '<tr><td colspan="7" class="p037-empty">ไม่พบรายการใบจองที่เชื่อมโยงกับใบแจ้งหนี้นี้</td></tr>';
        return;
      }
      _el.rsvBody.innerHTML = rows.map(function (r) {
        return '<tr>' +
          '<td>' + esc(r.date) + '</td>' +
          '<td>' + esc(r.cus) + '</td>' +
          '<td>' + esc(r.name) + '</td>' +
          '<td class="p037-vno">' + esc(r.vnos) + '</td>' +
          '<td>' + statusBadge(r.status) + '</td>' +
          '<td>' + (esc(r.desc) || '-') + '</td>' +
          '<td>' + (esc(r.notes) || '-') + '</td>' +
          '</tr>';
      }).join('');
    }

    /* RSV — fetch ตามลูกค้าที่เลือก (api/p037_rsv.php — user spec 2026-09-28) */
    function loadRsv(done) {
      if (!state.selCus) return;
      _el.rsvSum.textContent = 'กำลังโหลดใบจอง...';
      _el.rsvBody.innerHTML = '<tr><td colspan="7" class="p037-empty">กำลังโหลด...</td></tr>';
      api('api/p037_rsv.php', { date: state.date, cus: state.selCus }).then(function (d) {
        if (!d || !d.ok) {
          state.rsv = [];
          _el.rsvSum.textContent = 'โหลดใบจองไม่ได้: ' + ((d && d.error) || '');
          renderRsv();
          return;
        }
        state.rsv = d.rsv || [];
        renderRsv();
        if (typeof done === 'function') done();
      }).catch(function () {
        state.rsv = [];
        _el.rsvSum.textContent = 'โหลดใบจองไม่ได้ (network)';
        renderRsv();
      });
    }

    /* ---- items modal (C# INVResult — double-click แถว INV) ---- */
    function closeItems() {
      if (_modal) {
        _modal.parentNode.removeChild(_modal);
        _modal = null;
      }
    }

    function itemsTable(rows, emptyMsg) {
      if (!rows || rows.length === 0) {
        return '<div class="p037-empty" style="padding:18px">' + emptyMsg + '</div>';
      }
      return '<div class="p037-itwrap"><table class="p037-tbl">' +
        '<thead><tr><th>รหัสสินค้า</th><th>ชื่อสินค้า</th><th class="p037-r">ปริมาณ</th><th>หน่วย</th><th>ใบสั่ง (VC)</th></tr></thead>' +
        '<tbody>' + rows.map(function (r) {
          return '<tr><td>' + esc(r.stk) + '</td><td>' + esc(r.desc) + '</td><td class="p037-r">' + esc(r.qty) + '</td><td>' + esc(r.unit) + '</td><td>' + (esc(r.link) || '-') + '</td></tr>';
        }).join('') + '</tbody></table></div>';
    }

    function openItems() {
      if (!state.selVnos) return;
      closeItems();
      var rows = rsvFiltered();
      var rsvNos = rows.map(function (r) { return r.vnos; });
      _modal = document.createElement('div');
      _modal.className = 'p037-mback';
      _modal.innerHTML =
        '<div class="p037-mbox">' +
        '  <div class="p037-mhead">' +
        '    <div><h2>รายละเอียดสินค้า — ' + esc(state.selVnos) + '</h2><p>INV items เทียบกับ RSV items ของลูกค้านี้</p></div>' +
        '    <button type="button" class="p037-mclose">✕</button>' +
        '  </div>' +
        '  <div class="p037-mbody" id="p037ItemsBody"><div class="p037-empty" style="padding:24px">กำลังโหลด...</div></div>' +
        '</div>';
      document.body.appendChild(_modal);
      _modal.querySelector('.p037-mclose').addEventListener('click', closeItems);
      _modal.addEventListener('click', function (e) { if (e.target === _modal) closeItems(); });

      api('api/p037_items.php', { inv: [state.selVnos], rsv: rsvNos }).then(function (d) {
        if (!d || !d.ok) {
          _modal.querySelector('#p037ItemsBody').innerHTML = '<div class="p037-empty" style="padding:24px">' + esc((d && d.error) || 'โหลดข้อมูลไม่ได้') + '</div>';
          return;
        }
        _modal.querySelector('#p037ItemsBody').innerHTML =
          '<div class="p037-imcols">' +
          '  <div><div class="p037-imtitle">ใบแจ้งหนี้ (INV)</div>' + itemsTable(d.inv, 'ไม่มีรายการสินค้า') + '</div>' +
          '  <div><div class="p037-imtitle">ใบเบิกจอง (RSV)</div>' + itemsTable(d.rsv, 'ไม่มีรายการสินค้า') + '</div>' +
          '</div>';
      }).catch(function () {
        _modal.querySelector('#p037ItemsBody').innerHTML = '<div class="p037-empty" style="padding:24px">โหลดข้อมูลไม่ได้</div>';
      });
    }

    /* ---- events ---- */
    root.querySelector('#p037Form').addEventListener('submit', function (e) {
      e.preventDefault();
      state.date = _el.date.value || todayStr();
      state.type = _el.type.value.trim().toUpperCase();
      state.cus = _el.cus.value.trim();
      state.searched = false;
      state.selCus = null;
      state.selVnos = null;
      renderInv();
      renderRsv();
      api('api/p037_search.php', { date: state.date, type: state.type, cus: state.cus }).then(function (d) {
        if (!d || !d.ok) {
          _el.invSum.textContent = 'ค้นหาไม่ได้: ' + ((d && d.error) || '');
          return;
        }
        state.searched = true;
        state.inv = d.inv || [];
        state.rsv = [];
        renderInv();
        renderRsv();
      }).catch(function () {
        _el.invSum.textContent = 'ค้นหาไม่ได้ (network)';
      });
    });

    root.querySelector('#p037Clear').addEventListener('click', function () {
      state.date = todayStr();
      state.type = '';
      state.cus = '';
      state.searched = false;
      state.inv = [];
      state.rsv = [];
      state.selCus = null;
      state.selVnos = null;
      _el.date.value = state.date;
      _el.type.value = state.type;
      _el.cus.value = '';
      renderInv();
      renderRsv();
    });

    _el.invBody.addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-i]');
      if (!tr) return;
      var row = state.inv[parseInt(tr.getAttribute('data-i'), 10)];
      if (!row) return;
      state.selCus = row.cus;
      state.selVnos = row.vnos;
      renderInv();
      loadRsv();
    });

    _el.invBody.addEventListener('dblclick', function (e) {
      var tr = e.target.closest('tr[data-i]');
      if (!tr) return;
      var row = state.inv[parseInt(tr.getAttribute('data-i'), 10)];
      if (!row) return;
      state.selCus = row.cus;
      state.selVnos = row.vnos;
      renderInv();
      loadRsv(openItems);
    });

    /* ---- CSS ---- */
    var style = document.createElement('style');
    style.textContent = [
      ".p037{display:grid;gap:16px;color:var(--ink,#1b2b3c);font-size:13px}",
      ".p037-card{overflow:hidden;border:1px solid var(--border,#d8e2ee);border-radius:12px;background:#fff;box-shadow:0 10px 30px rgba(30,72,118,.10)}",
      ".p037-cardhead{display:flex;align-items:center;justify-content:space-between;min-height:50px;padding:0 18px;border-bottom:1px solid var(--border,#d8e2ee);background:linear-gradient(90deg,#fff,#f8fbff)}",
      ".p037-cardtitle{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:700}",
      ".p037-cardtitle>span{color:#1769c2}",
      ".p037-cardbody{padding:16px 18px}",
      ".p037-filter{display:grid;grid-template-columns:200px 200px 220px auto;gap:14px;align-items:end}",
      ".p037-fg{display:flex;flex-direction:column;gap:6px}",
      ".p037-fg label{color:#506579;font-size:12px;font-weight:700}",
      ".p037-fg input,.p037-fg select{width:100%;height:36px;padding:0 10px;outline:0;border:1px solid #cbd8e5;border-radius:7px;background:#fff;color:inherit;font-family:inherit;font-size:13px}",
      ".p037-fg input:focus,.p037-fg select:focus{border-color:#1769c2;box-shadow:0 0 0 3px rgba(23,105,194,.13)}",
      ".p037-btns{display:flex;gap:8px}",
      ".p037-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:36px;padding:0 16px;cursor:pointer;border:0;border-radius:7px;font-size:13px;font-weight:700;font-family:inherit}",
      ".p037-btn--primary{background:#2563eb !important;color:#fff}",
      ".p037-btn--primary:hover{background:#1d4ed8 !important}",
      ".p037-btn--ghost{border:1px solid #cbd8e5;background:#fff;color:#53687b}",
      ".p037-btn--ghost:hover{background:#f0f6fc}",
      ".p037-summary{display:flex;align-items:center;gap:8px;color:var(--muted,#738397);font-size:12px}",
      ".p037-count{display:inline-grid;width:25px;height:25px;place-items:center;border-radius:50%;background:#eaf4ff;color:#1769c2;font-weight:700}",
      ".p037-twrap{overflow:auto;max-height:380px}",
      ".p037-tbl{width:100%;border-collapse:collapse;white-space:nowrap}",
      ".p037-tbl thead th{position:sticky;z-index:1;top:0;padding:11px 12px;border-bottom:1px solid #cfdbe7;background:#edf5fc;color:#426176;font-size:12px;font-weight:700;text-align:center}",
      ".p037-tbl tbody td{padding:10px 12px;border-bottom:1px solid #e6edf4;color:#2d4052}",
      ".p037-tbl tbody tr{cursor:pointer;transition:background .15s ease}",
      ".p037-tbl tbody tr:hover{background:#f0f7ff}",
      ".p037-tbl tbody tr.p037-sel{background:#1769c2 !important}",
      ".p037-tbl tbody tr.p037-sel td{color:#fff;border-bottom-color:rgba(255,255,255,.2)}",
      ".p037-no{width:54px;text-align:center;color:var(--muted,#738397)}",
      ".p037-tbl tbody tr.p037-sel .p037-no{color:rgba(255,255,255,.8)}",
      ".p037-vno{color:#0c4f9b;font-weight:700}",
      ".p037-tbl tbody tr.p037-sel .p037-vno{color:#fff}",
      ".p037-r{text-align:right}",
      ".p037-st{display:inline-flex;align-items:center;min-width:75px;justify-content:center;padding:4px 8px;border-radius:20px;font-size:11px;font-weight:700}",
      ".p037-st--ready{background:#dcf6ea;color:#11845b}",
      ".p037-st--waiting{background:#fff1d8;color:#c98213}",
      ".p037-tbl tbody tr.p037-sel .p037-st{background:rgba(255,255,255,.22);color:#fff}",
      ".p037-empty{padding:32px;color:var(--muted,#738397);text-align:center}",
      ".p037-footnote{color:var(--muted,#738397);font-size:11px;text-align:right}",
      /* items modal */
      ".p037-mback{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(15,30,50,.55);padding:20px}",
      ".p037-mbox{display:flex;flex-direction:column;width:min(1100px,100%);max-height:calc(100vh - 40px);overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 30px 70px rgba(0,0,0,.35)}",
      ".p037-mhead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border,#d8e2ee)}",
      ".p037-mhead h2{margin:0;font-size:16px;font-weight:700}",
      ".p037-mhead p{margin:2px 0 0;color:var(--muted,#738397);font-size:11px}",
      ".p037-mclose{display:grid;width:34px;height:34px;place-items:center;color:var(--muted,#738397);border:0;border-radius:9px;background:#f1f5f9;font-size:16px;cursor:pointer}",
      ".p037-mclose:hover{color:#dc2626;background:#fef2f2}",
      ".p037-mbody{overflow:auto;padding:16px 20px}",
      ".p037-imcols{display:grid;grid-template-columns:1fr 1fr;gap:18px}",
      ".p037-imtitle{margin-bottom:8px;color:#0c4f9b;font-size:13px;font-weight:700}",
      ".p037-itwrap{overflow:auto;max-height:55vh;border:1px solid var(--border,#d8e2ee);border-radius:10px}"
    ].join('\n');
    root.appendChild(style);

    renderInv();
    renderRsv();

    return {
      destroy: function () {
        closeItems();
        root.innerHTML = '';
      }
    };
  }

  window.P037InvBooking = { mount: mount };
})();
