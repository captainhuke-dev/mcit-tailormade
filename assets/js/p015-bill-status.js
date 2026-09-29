/* P015 — สถานะบิลค้างรับ
   ตาม C# Frm_CheckBillReceiptGUI (AppCheckBillReceipt) + demo/P015-demo.html:
     เงื่อนไขค้นหา: รหัสลูกหนี้ (LIKE vnos/cus/name — ค่าว่าง = ทั้งหมด)
     → ตารางบิลค้างรับ (CFS: CFSclearALL=0, net != 0) — วันที่/เลขที่/รหัส/ชื่อ/เขต/ยอดหนี้/วางบิล/ค้างบิล/หมายเหตุ (display)
     → คลิกแถว = modal แก้ไข (checkbox วางบิล/ค้างบิล — exclusive + หมายเหตุ) + บันทึกทีละแถว
     → บันทึก (upsert BI_CUBE.tb_CFS_bill_status — 1 แถวต่อครั้ง)
   Real data MAC5 — api/p015_search.php + api/p015_status.php
   (IIFE — window.P015BillStatus = { mount, destroy })
*/
(function () {
  'use strict';

  var CONNECTION = (window.TAILORMADE_CONNECTION_ID || 'c1788406814359').trim();
  var PER = 15;

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

  var money = (function () {
    try { return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return null; }
  })();

  function fmtMoney(v) {
    var n = Number(v || 0);
    return money ? money.format(n) : n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function mount(root) {
    var state = {
      keyword: '',
      searched: false,
      rows: [],
      selVnos: null,
      sortField: 'date',
      sortDir: 'asc',
      page: 1
    };
    var _el = {};
    var toastT = null;

    function showToast(msg) {
      var el = _el.toast;
      if (!el) return;
      el.querySelector('.p015-toastmsg').textContent = msg;
      el.classList.add('p015-show');
      if (toastT) clearTimeout(toastT);
      toastT = setTimeout(function () { el.classList.remove('p015-show'); }, 2200);
    }

    root.innerHTML =
      '<div class="p015">' +
      '  <section class="p015-card">' +
      '    <div class="p015-cardhead"><div class="p015-cardtitle"><span>⌕</span> เงื่อนไขการค้นหา</div>' +
      '      <span class="p015-hint">ค่าว่าง = ค้นหาบิลค้างรับทั้งหมด · คลิกแถวเพื่อบันทึกสถานะ</span>' +
      '    </div>' +
      '    <div class="p015-cardbody">' +
      '      <form class="p015-filter" id="p015Form">' +
      '        <div class="p015-fg">' +
      '          <label>รหัสลูกหนี้</label>' +
      '          <input type="text" id="p015Cus" placeholder="กรอกรหัสลูกหนี้ เช่น 10100-020 (ว่าง = ทั้งหมด)" autocomplete="off">' +
      '        </div>' +
      '        <div class="p015-btns">' +
      '          <button type="submit" class="p015-btn p015-btn--primary">⌕ ค้นหา</button>' +
      '        </div>' +
      '      </form>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p015-card">' +
      '    <div class="p015-cardhead">' +
      '      <div class="p015-cardtitle"><span>▤</span> รายการบิลค้างรับ</div>' +
      '      <div class="p015-period" id="p015Period">ยังไม่ค้นหา</div>' +
      '      <div class="p015-badge" id="p015Badge">0 รายการ</div>' +
      '    </div>' +
      '    <div class="p015-twrap">' +
      '      <table class="p015-tbl">' +
      '        <thead><tr>' +
      '          <th class="p015-sort p015-c p015-w1" data-f="date">วันที่</th>' +
      '          <th class="p015-sort p015-w2" data-f="vnos">เลขที่ใบสำคัญ</th>' +
      '          <th class="p015-sort p015-w3" data-f="cus">รหัสลูกหนี้</th>' +
      '          <th class="p015-sort p015-w4" data-f="name">ชื่อลูกหนี้</th>' +
      '          <th class="p015-w5">เขต/อำเภอ</th>' +
      '          <th class="p015-sort p015-r p015-w6" data-f="amount">ยอดหนี้</th>' +
      '          <th class="p015-c p015-w7">วางบิล</th>' +
      '          <th class="p015-c p015-w8">ค้างบิล</th>' +
      '          <th class="p015-w9">หมายเหตุ</th>' +
      '        </tr></thead>' +
      '        <tbody id="p015Body"></tbody>' +
      '      </table>' +
      '    </div>' +
      '    <div class="p015-foot">' +
      '      <span id="p015FootCount">ยังไม่ค้นหา</span>' +
      '      <div class="p015-totals">' +
      '        <div class="p015-total"><span>ยอดวางบิล</span><strong id="p015TotPlaced">฿0.00</strong></div>' +
      '        <div class="p015-total"><span>ยอดค้างบิล</span><strong id="p015TotPending">฿0.00</strong></div>' +
      '      </div>' +
      '      <div class="p015-pagerbox" id="p015Pager"></div>' +
      '    </div>' +
      '  </section>' +
      /* ---- modal (แก้ไขต่อแถว) ---- */
      '  <div class="p015-mask" id="p015Mask">' +
      '    <div class="p015-modal" role="dialog" aria-modal="true">' +
      '      <div class="p015-mhead">' +
      '        <div class="p015-mtitle"><span>✎</span> บันทึกสถานะบิล</div>' +
      '        <button type="button" class="p015-mclose" id="p015MClose" aria-label="ปิด">×</button>' +
      '      </div>' +
      '      <div class="p015-mbody">' +
      '        <div class="p015-minfo">' +
      '          <div class="p015-mrow"><span>เลขที่ใบสำคัญ</span><strong id="p015MVno"></strong></div>' +
      '          <div class="p015-mrow"><span>วันที่</span><strong id="p015MDate"></strong></div>' +
      '          <div class="p015-mrow p015-mrow--full"><span>ลูกหนี้</span><strong id="p015MCus"></strong></div>' +
      '          <div class="p015-mrow"><span>ยอดหนี้</span><strong class="p015-mamt" id="p015MAmt"></strong></div>' +
      '        </div>' +
      '        <div class="p015-mchecks">' +
      '          <label class="p015-mcheck"><input type="checkbox" id="p015MBilling"><span class="p015-ck">✓</span> วางบิล</label>' +
      '          <label class="p015-mcheck p015-mcheck--orange"><input type="checkbox" id="p015MAccrued"><span class="p015-ck">✓</span> ค้างบิล</label>' +
      '        </div>' +
      '        <div class="p015-mnote">' +
      '          <label for="p015MNote">หมายเหตุ</label>' +
      '          <textarea id="p015MNote" rows="3" placeholder="เพิ่มหมายเหตุ (ไม่พบบ้างก็ได้)"></textarea>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p015-mfoot">' +
      '        <button type="button" class="p015-btn p015-btn--ghost" id="p015MCancel">ปิด</button>' +
      '        <button type="button" class="p015-btn p015-btn--save" id="p015MSave">✎ บันทึก</button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p015-toast" id="p015Toast"><span class="p015-toastmsg"></span></div>' +
      '</div>';

    _el.cus = root.querySelector('#p015Cus');
    _el.period = root.querySelector('#p015Period');
    _el.badge = root.querySelector('#p015Badge');
    _el.body = root.querySelector('#p015Body');
    _el.footCount = root.querySelector('#p015FootCount');
    _el.totPlaced = root.querySelector('#p015TotPlaced');
    _el.totPending = root.querySelector('#p015TotPending');
    _el.pager = root.querySelector('#p015Pager');
    _el.mask = root.querySelector('#p015Mask');
    _el.mVno = root.querySelector('#p015MVno');
    _el.mDate = root.querySelector('#p015MDate');
    _el.mCus = root.querySelector('#p015MCus');
    _el.mAmt = root.querySelector('#p015MAmt');
    _el.mBilling = root.querySelector('#p015MBilling');
    _el.mAccrued = root.querySelector('#p015MAccrued');
    _el.mNote = root.querySelector('#p015MNote');
    _el.mSave = root.querySelector('#p015MSave');
    _el.toast = root.querySelector('#p015Toast');

    /* ---- display tag ---- */
    function tag(on, cls, label) {
      if (on === 1) return '<span class="p015-tag p015-tag--' + cls + '">✓ ' + label + '</span>';
      return '<span class="p015-tag p015-tag--off">—</span>';
    }

    /* ---- sort ---- */
    function sorted() {
      var f = state.sortField;
      var dir = state.sortDir === 'asc' ? 1 : -1;
      return state.rows.slice().sort(function (a, b) {
        var x = f === 'date' ? a.iso : a[f];
        var y = f === 'date' ? b.iso : b[f];
        if (typeof x === 'string') { x = x.toLowerCase(); y = String(y).toLowerCase(); }
        if (x < y) return -1 * dir;
        if (x > y) return 1 * dir;
        return 0;
      });
    }

    /* ---- totals (ทุก rows) ---- */
    function updateTotals(rows) {
      var placed = 0, pending = 0;
      rows.forEach(function (r) {
        if (r.billing === 1) placed += r.amount;
        if (r.accrued === 1) pending += r.amount;
      });
      _el.totPlaced.textContent = '฿' + fmtMoney(placed);
      _el.totPending.textContent = '฿' + fmtMoney(pending);
    }

    /* ---- pagination (15 ตัว/หน้า) ---- */
    function pagerHTML(total, page) {
      var pages = Math.max(1, Math.ceil(total / PER));
      if (page > pages) page = pages;
      if (pages <= 1) return '';
      var s = '<div class="p015-pbtns">';
      s += '<button type="button" class="p015-pbtn" data-p="prev"' + (page <= 1 ? ' disabled' : '') + ' title="หน้าก่อนหน้า">‹</button>';
      var a = Math.max(1, page - 1);
      var b = Math.min(pages, page + 1);
      for (var n = a; n <= b; n++) {
        s += '<button type="button" class="p015-pbtn p015-pnum' + (n === page ? ' p015-pact' : '') + '" data-p="' + n + '">' + n + '</button>';
      }
      s += '<button type="button" class="p015-pbtn" data-p="next"' + (page >= pages ? ' disabled' : '') + ' title="หน้าหลังหน้า">›</button>';
      s += '</div><span class="p015-pinfo">หน้า ' + page + ' / ' + pages + '</span>';
      return s;
    }

    /* ---- modal ---- */
    function openModal(vnos) {
      var r = state.rows.find(function (x) { return x.vnos === vnos; });
      if (!r) return;
      state.selVnos = vnos;
      _el.mVno.textContent = r.vnos;
      _el.mDate.textContent = r.date || '-';
      _el.mCus.textContent = r.cus + ' · ' + (r.name || '');
      _el.mAmt.textContent = '฿' + fmtMoney(r.amount);
      _el.mBilling.checked = r.billing === 1;
      _el.mAccrued.checked = r.accrued === 1;
      _el.mNote.value = r.comment || '';
      _el.mask.classList.add('p015-open');
      render();
    }

    function closeModal() {
      _el.mask.classList.remove('p015-open');
      state.selVnos = null;
      render();
    }

    /* checkbox exclusive (ตาม C# CellClick) */
    _el.mBilling.addEventListener('change', function () {
      if (_el.mBilling.checked) _el.mAccrued.checked = false;
    });
    _el.mAccrued.addEventListener('change', function () {
      if (_el.mAccrued.checked) _el.mBilling.checked = false;
    });

    root.querySelector('#p015MClose').addEventListener('click', closeModal);
    root.querySelector('#p015MCancel').addEventListener('click', closeModal);
    _el.mask.addEventListener('click', function (e) {
      if (e.target === _el.mask) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _el.mask.classList.contains('p015-open')) closeModal();
    });

    /* ---- save (1 แถว — ตาม modal) ---- */
    _el.mSave.addEventListener('click', function () {
      var r = state.rows.find(function (x) { return x.vnos === state.selVnos; });
      if (!r) return;
      r.billing = _el.mBilling.checked ? 1 : 0;
      r.accrued = _el.mAccrued.checked ? 1 : 0;
      r.comment = _el.mNote.value;
      _el.mSave.disabled = true;
      api('api/p015_status.php', {
        rows: [{ vnos: r.vnos, cus: r.cus, billing: r.billing, accrued: r.accrued, comment: r.comment }]
      }).then(function (d) {
        _el.mSave.disabled = false;
        if (!d || !d.ok) {
          alert('บันทึกไม่ได้: ' + ((d && d.error) || ''));
          return;
        }
        var vno = r.vnos;
        closeModal();
        showToast('บันทึก ' + vno + ' เรียบร้อยแล้ว');
      }).catch(function () {
        _el.mSave.disabled = false;
        alert('บันทึกไม่ได้ (network)');
      });
    });

    /* ---- render ---- */
    function render() {
      if (!state.searched) {
        _el.body.innerHTML = '<tr><td colspan="9" class="p015-empty">กรอกรหัสลูกหนี้แล้วกด ค้นหา</td></tr>';
        _el.period.textContent = 'ยังไม่ค้นหา';
        _el.badge.textContent = '0 รายการ';
        _el.footCount.textContent = 'ยังไม่ค้นหา';
        _el.pager.innerHTML = '';
        updateTotals([]);
        return;
      }
      _el.period.textContent = 'ลูกหนี้ ' + (state.keyword || 'ทั้งหมด');
      var rows = sorted();
      _el.badge.textContent = rows.length + ' รายการ';
      if (rows.length === 0) {
        _el.body.innerHTML = '<tr><td colspan="9" class="p015-empty">ไม่พบข้อมูลบิลค้างรับ — ตรวจสอบรหัสลูกหนี้อีกครั้ง</td></tr>';
        _el.pager.innerHTML = '';
      } else {
        var pages = Math.ceil(rows.length / PER);
        if (state.page > pages) state.page = pages;
        if (state.page < 1) state.page = 1;
        var start = (state.page - 1) * PER;
        var slice = rows.slice(start, start + PER);
        _el.body.innerHTML = slice.map(function (r) {
          var sel = state.selVnos === r.vnos ? ' class="p015-sel"' : '';
          return '<tr data-v="' + esc(r.vnos) + '"' + sel + '>' +
            '<td class="p015-c">' + esc(r.date) + '</td>' +
            '<td class="p015-vno">' + esc(r.vnos) + '</td>' +
            '<td class="p015-cus">' + esc(r.cus) + '</td>' +
            '<td title="' + esc(r.name) + '">' + esc(r.name) + '</td>' +
            '<td>' + esc(r.contact || '') + '</td>' +
            '<td class="p015-r p015-amt">' + fmtMoney(r.amount) + '</td>' +
            '<td class="p015-c">' + tag(r.billing, 'green', 'วางบิล') + '</td>' +
            '<td class="p015-c">' + tag(r.accrued, 'orange', 'ค้างบิล') + '</td>' +
            '<td title="' + esc(r.comment) + '" class="p015-wrap">' + esc(r.comment || '') + '</td>' +
            '</tr>';
        }).join('');
        _el.pager.innerHTML = pagerHTML(rows.length, state.page);
      }
      _el.footCount.textContent = 'แสดง ' + rows.length + ' รายการ';
      updateTotals(rows);
    }

    /* ---- row click = open modal ---- */
    _el.body.addEventListener('click', function (e) {
      var tr = e.target.closest('tr[data-v]');
      if (!tr) return;
      openModal(tr.getAttribute('data-v'));
    });

    /* ---- sort headers ---- */
    root.querySelectorAll('.p015-sort').forEach(function (th) {
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

    /* ---- pager ---- */
    _el.pager.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-p]');
      if (!b || b.disabled) return;
      var v = b.getAttribute('data-p');
      var pages = Math.max(1, Math.ceil(sorted().length / PER));
      if (v === 'prev') state.page = Math.max(1, state.page - 1);
      else if (v === 'next') state.page = Math.min(pages, state.page + 1);
      else state.page = parseInt(v, 10);
      render();
    });

    /* ---- search ---- */
    function doSearch() {
      var kw = _el.cus.value.trim();
      _el.body.innerHTML = '<tr><td colspan="9" class="p015-empty">กำลังค้นหา...</td></tr>';
      api('api/p015_search.php', { keyword: kw }).then(function (d) {
        if (!d || !d.ok) {
          state.rows = [];
          state.searched = true;
          _el.body.innerHTML = '<tr><td colspan="9" class="p015-empty">ค้นหาไม่ได้: ' + esc((d && d.error) || '') + '</td></tr>';
          return;
        }
        state.rows = d.rows || [];
        state.keyword = kw;
        state.searched = true;
        state.selVnos = null;
        state.page = 1;
        render();
        showToast('ค้นหาข้อมูล ' + state.rows.length + ' รายการแล้ว');
      }).catch(function () {
        state.rows = [];
        state.searched = true;
        _el.body.innerHTML = '<tr><td colspan="9" class="p015-empty">ค้นหาไม่ได้ (network)</td></tr>';
      });
    }

    root.querySelector('#p015Form').addEventListener('submit', function (e) {
      e.preventDefault();
      doSearch();
    });

    /* ---- CSS ---- */
    var style = document.createElement('style');
    style.textContent = [
      ".p015{display:grid;gap:16px;color:var(--ink,#1b2b3c);font-size:13px}",
      ".p015-card{border:1px solid #d8e2ee;border-radius:12px;background:#fff;box-shadow:0 10px 30px rgba(30,72,118,.10)}",
      ".p015-cardhead{display:flex;align-items:center;gap:14px;min-height:50px;padding:0 18px;border-bottom:1px solid #d8e2ee;background:linear-gradient(90deg,#fff,#f8fbff)}",
      ".p015-cardtitle{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;color:#17324d}",
      ".p015-cardtitle span{display:grid;width:30px;height:30px;place-items:center;border-radius:8px;background:#eaf4ff;color:#1769c2;font-size:14px}",
      ".p015-hint{margin-left:auto;color:#738397;font-size:11px;font-weight:600}",
      ".p015-cardbody{padding:16px 18px}",
      ".p015-filter{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:end}",
      ".p015-fg{display:flex;flex-direction:column;gap:6px}",
      ".p015-fg label{color:#506579;font-size:12px;font-weight:700}",
      ".p015-fg input{height:38px;padding:0 12px;outline:0;border:1px solid #cbd8e5;border-radius:7px;background:#fff;color:inherit;font-family:inherit;font-size:13px}",
      ".p015-fg input:focus{border-color:#1769c2;box-shadow:0 0 0 3px rgba(23,105,194,.13)}",
      ".p015-btns{display:flex;gap:8px}",
      ".p015-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 20px;cursor:pointer;border:0;border-radius:7px;font-size:13px;font-weight:700;font-family:inherit}",
      ".p015-btn--primary{background:#2563eb !important;color:#fff}",
      ".p015-btn--primary:hover{background:#1d4ed8 !important}",
      ".p015-btn--save{background:#059669 !important;color:#fff}",
      ".p015-btn--save:hover{background:#047857 !important}",
      ".p015-btn--ghost{background:#fff !important;color:#426176;border:1px solid #cbd8e5}",
      ".p015-btn--ghost:hover{background:#f1f5f9 !important}",
      ".p015-btn:disabled{opacity:.5;cursor:default}",
      ".p015-period{color:#53687b;font-size:12px;font-weight:600}",
      ".p015-badge{margin-left:auto;padding:5px 12px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;white-space:nowrap}",
      ".p015-twrap{overflow:hidden}",
      ".p015-tbl{width:100%;table-layout:fixed;border-collapse:collapse;white-space:nowrap}",
      ".p015-tbl thead th{position:sticky;z-index:1;top:0;padding:11px 14px;border-bottom:1px solid #cfdbe7;background:#edf5fc;color:#426176;font-size:12px;font-weight:700;text-align:left;user-select:none}",
      ".p015-tbl th.p015-w1{width:8%}",
      ".p015-tbl th.p015-w2{width:12%}",
      ".p015-tbl th.p015-w3{width:10%}",
      ".p015-tbl th.p015-w4{width:14%}",
      ".p015-tbl th.p015-w5{width:8%}",
      ".p015-tbl th.p015-w6{width:10%}",
      ".p015-tbl th.p015-w7{width:6%}",
      ".p015-tbl th.p015-w8{width:6%}",
      ".p015-tbl th.p015-w9{width:26%}",
      ".p015-tbl thead th.p015-c{text-align:center}",
      ".p015-tbl thead th.p015-r{text-align:right}",
      ".p015-tbl thead th.p015-sort{cursor:pointer}",
      ".p015-tbl thead th.p015-sort:hover{color:#1769c2;background:#e2eefb}",
      ".p015-tbl tbody td{padding:10px 14px;border-bottom:1px solid #e6edf4;color:#2d4052;overflow:hidden;text-overflow:ellipsis}",
      ".p015-tbl td.p015-wrap{white-space:normal;line-height:1.5;word-break:break-word;overflow:visible;text-overflow:clip;padding-top:8px;padding-bottom:8px}",
      ".p015-tbl tbody td.p015-c{text-align:center}",
      ".p015-tbl tbody td.p015-r{text-align:right}",
      ".p015-tbl tbody tr{cursor:pointer;transition:background .15s ease}",
      ".p015-tbl tbody tr:nth-child(even){background:#fbfdff}",
      ".p015-tbl tbody tr:hover{background:#f0f7ff}",
      ".p015-tbl tbody tr.p015-sel{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}",
      ".p015-vno{color:#0c4f9b;font-weight:700}",
      ".p015-cus{color:#334155;font-weight:700;font-family:Arial,sans-serif}",
      ".p015-amt{font-weight:700;font-family:Arial,sans-serif;font-variant-numeric:tabular-nums;color:#0f172a}",
      ".p015-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap}",
      ".p015-tag--green{color:#047857;background:#d1fae5}",
      ".p015-tag--orange{color:#b45309;background:#fef3c7}",
      ".p015-tag--off{color:#94a3b8;background:#f1f5f9}",
      ".p015-empty{padding:32px;color:#738397;text-align:center}",
      ".p015-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:46px;padding:8px 16px;border-top:1px solid #e6edf4;background:#f8fafc;color:#53687b;font-size:12px}",
      ".p015-totals{display:flex;gap:8px}",
      ".p015-total{display:flex;align-items:center;gap:7px;padding:6px 11px;border:1px solid #cbd8e5;border-radius:9px;background:#fff;color:#53687b;font-size:12px}",
      ".p015-total strong{color:#1d4ed8;font-family:Arial,sans-serif;font-variant-numeric:tabular-nums}",
      ".p015-pagerbox{display:flex;align-items:center;gap:14px}",
      ".p015-pinfo{color:#53687b;font-size:12px;font-weight:700}",
      ".p015-pbtns{display:flex;align-items:center;gap:5px}",
      ".p015-pbtn{min-width:32px;height:32px;padding:0 10px;display:inline-grid;place-items:center;border:1px solid #cbd8e5;border-radius:8px;background:#fff;color:#33506b;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;transition:all .15s ease}",
      ".p015-pbtn:hover:not(:disabled){border-color:#2563eb;color:#2563eb;background:#f5f9ff}",
      ".p015-pbtn:disabled{opacity:.35;cursor:default}",
      ".p015-pnum.p015-pact{background:#2563eb !important;border-color:#2563eb !important;color:#fff !important}",
      /* ---- modal ---- */
      ".p015-mask{position:fixed;inset:0;z-index:80;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45);backdrop-filter:blur(2px)}",
      ".p015-mask.p015-open{display:flex}",
      ".p015-modal{width:460px;max-width:calc(100vw - 32px);border-radius:14px;background:#fff;box-shadow:0 24px 60px rgba(15,23,42,.30);animation:p015pop .18s ease}",
      "@keyframes p015pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}",
      ".p015-mhead{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #e6edf4}",
      ".p015-mtitle{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:700;color:#17324d}",
      ".p015-mtitle span{display:grid;width:30px;height:30px;place-items:center;border-radius:8px;background:#eaf4ff;color:#1769c2;font-size:14px}",
      ".p015-mclose{margin-left:auto;width:30px;height:30px;display:grid;place-items:center;border:0;border-radius:8px;background:transparent;color:#738397;font-size:18px;cursor:pointer;line-height:1}",
      ".p015-mclose:hover{background:#f1f5f9;color:#334155}",
      ".p015-mbody{display:grid;gap:14px;padding:16px 18px}",
      ".p015-minfo{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;padding:12px 14px;border:1px solid #e6edf4;border-radius:10px;background:#f8fafc}",
      ".p015-mrow span{display:block;color:#738397;font-size:11px;font-weight:600}",
      ".p015-mrow strong{display:block;margin-top:2px;font-size:13px;color:#172033;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".p015-mrow--full{grid-column:1/-1}",
      ".p015-mamt{color:#1d4ed8 !important;font-family:Arial,sans-serif;font-variant-numeric:tabular-nums}",
      ".p015-mchecks{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
      ".p015-mcheck{display:flex;align-items:center;gap:9px;padding:11px 12px;border:1px solid #cbd8e5;border-radius:10px;cursor:pointer;font-size:13px;font-weight:700;color:#426176;transition:all .15s ease;user-select:none}",
      ".p015-mcheck:hover{border-color:#93c5fd;background:#f8fbff}",
      ".p015-mcheck input{width:17px;height:17px;accent-color:#2563eb;cursor:pointer}",
      ".p015-ck{display:grid;width:24px;height:24px;place-items:center;border-radius:7px;background:#eff6ff;color:#2563eb;font-size:13px}",
      ".p015-mcheck--orange .p015-ck{background:#fffbeb;color:#d97706}",
      ".p015-mcheck--orange input{accent-color:#d97706}",
      ".p015-mnote label{display:block;margin-bottom:6px;color:#506579;font-size:12px;font-weight:700}",
      ".p015-mnote textarea{width:100%;padding:9px 11px;outline:0;border:1px solid #cbd8e5;border-radius:8px;background:#fff;color:inherit;font-family:inherit;font-size:13px;resize:vertical;min-height:70px}",
      ".p015-mnote textarea:focus{border-color:#1769c2;box-shadow:0 0 0 3px rgba(23,105,194,.13)}",
      ".p015-mfoot{display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid #e6edf4;background:#f8fafc;border-radius:0 0 14px 14px}",
      ".p015-toast{position:fixed;right:20px;bottom:20px;z-index:90;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:12px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:all .2s ease}",
      ".p015-toast.p015-show{opacity:1;visibility:visible;transform:translateY(0)}"
    ].join('\n');
    document.head.appendChild(style);
  }

  window.P015BillStatus = { mount: mount };
})();
