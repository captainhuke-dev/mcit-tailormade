/* P053 — สติ๊กเกอร์ 10x7.5 (ใบปะ) */
(function () {
  'use strict';

  var CONNECTION = (window.TAILORMADE_CONNECTION_ID || 'c1788406814359').trim();

  var ICONS = {
    search: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
    minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"></path></svg>',
    chevL: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>',
    chevR: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>',
    fit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M16 3h3a2 2 0 0 1 2 2v3"></path><path d="M8 21H5a2 2 0 0 1-2-2v-3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>',
    print: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>',
    doc: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><path d="M14 3v6h6"></path></svg>'
  };

  /* mock data (dev — fallback เมื่อ API ล้มเหลว) */
  var MOCK = {
    SCRE69080846: {
      date: '01/09/2569', vn: 'SCRE6908-0846', cus: '000234',
      name: 'บำรุงการเกษตร (LM)<br>(บางม่วง)', contact: '0896575609', tel: '0896575609',
      ref2: '', desc: 'ข้อความตัวอย่าง'
    },
    SCRE69091490: {
      date: '02/09/2569', vn: 'SCRE6909-1490', cus: '000371',
      name: 'ลูกค้าตัวอย่าง', contact: '0812345678', tel: '0812345678',
      ref2: '', desc: 'ข้อความตัวอย่าง'
    },
    SCRE69091965: {
      date: '03/09/2569', vn: 'SCRE6909-1965', cus: '000412',
      name: 'ลูกค้าตัวอย่าง', contact: '0898765432', tel: '0898765432',
      ref2: '', desc: 'ข้อความตัวอย่าง'
    }
  };

  var state = {
    zoom: 1.0,
    userZoom: false,
    page: 1,
    data: null,
    type: null,
    count: 0,
    denom: 0
  };

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderRoot(root) {
    root.innerHTML =
      '<section class="p053-wrap">' +
      '  <div class="p053-launcher">' +
      '    <form id="p053Form" class="p053-form" autocomplete="off">' +
      '      <div class="p053-field">' +
      '        <label for="p053Doc">เลขที่ใบสำคัญ</label>' +
      '        <div class="p053-inputwrap">' +
      '          <input class="p053-input" id="p053Doc" type="text" placeholder="ระบุเลขที่ใบสำคัญ" autocomplete="off">' +
      '        </div>' +
      '      </div>' +
      '      <div class="p053-formactions">' +
      '        <button type="submit" class="p053-btn--search" id="p053Btn">' + ICONS.search + '<span>สร้างสติ๊กเกอร์</span></button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</section>' +
      '<section class="p053-preview" id="p053Preview">' +
      '  <div class="p053-previewhead">' +
      '    <div class="p053-previewtitle">' +
      '      <h2>ตัวอย่างสติ๊กเกอร์</h2>' +
      '      <span class="p053-previewsub" id="p053Sub"></span>' +
      '    </div>' +
      '    <div class="p053-tools">' +
      '      <div class="p053-seg">' +
      '        <button type="button" class="p053-segbtn" id="p053PagePrev" title="หน้าก่อนหน้า">' + ICONS.chevL + '</button>' +
      '        <span class="p053-pagelbl" id="p053PageLbl"></span>' +
      '        <button type="button" class="p053-segbtn" id="p053PageNext" title="หน้าถัดไป">' + ICONS.chevR + '</button>' +
      '      </div>' +
      '      <div class="p053-seg">' +
      '        <button type="button" class="p053-segbtn" id="p053ZoomOut" title="ย่อ">' + ICONS.minus + '</button>' +
      '        <span class="p053-zoomval" id="p053ZoomLbl"></span>' +
      '        <button type="button" class="p053-segbtn" id="p053ZoomIn" title="ขยาย">' + ICONS.plus + '</button>' +
      '      </div>' +
      '      <button type="button" class="p053-btn p053-btn--ghost" id="p053ZoomFit">' + ICONS.fit + '<span>พอดีจอ</span></button>' +
      '      <button type="button" class="p053-printbtn" id="p053Print">' + ICONS.print + '<span>พิมพ์</span></button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p053-sheetwrap" id="p053SheetWrap">' +
      '    <div class="p053-empty" id="p053Empty">' +
      '      <div class="p053-emptytitle">ยังไม่มีสติ๊กเกอร์</div>' +
      '      <div class="p053-emptysub">กรอกเลขที่ใบสำคัญ แล้วกด "สร้างสติ๊กเกอร์"</div>' +
      '    </div>' +
      '    <div class="p053-sheets" id="p053Sheets"></div>' +
      '  </div>' +
      '</section>' +
      '<div class="p053-toast" id="p053Toast" role="status"></div>';
  }

  function css() {
    return [
      ".p053-wrap{--p053-surface:var(--surface,#fff);--p053-surface2:var(--surface-2,#f8fafc);--p053-border:var(--border,#e2e8f0);--p053-muted:var(--muted-foreground,#64748b);--p053-primary:var(--accent,#2563eb);--p053-ink:var(--foreground,#0f172a);color:var(--p053-ink);min-height:100%;padding:22px 24px 0;background:var(--p053-surface2);font-family:inherit}",
      ".p053-launcher{padding:14px 16px 10px;border:1px solid var(--p053-border);border-radius:16px;background:var(--p053-surface);box-shadow:0 12px 30px rgba(15,23,42,.06)}",
      ".p053-field{display:grid;gap:6px;min-width:220px;max-width:340px}",
      ".p053-field label{color:#64748b;font-size:11px;font-weight:600}",
      ".p053-inputwrap{position:relative}",
      ".p053-input{width:100%;height:44px;padding:0 12px;color:#172033;border:1px solid #e2e8f0;border-radius:11px;background:#fff;outline:0;font-size:13px;transition:.18s ease}",
      ".p053-input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
      ".p053-form{display:flex;flex-wrap:wrap;gap:12px;align-items:end;width:100%}",
      ".p053-formactions{display:flex;gap:8px;align-items:end}",
      ".p053-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border:1px solid var(--p053-border);border-radius:10px;background:var(--p053-surface);color:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:.15s ease;white-space:nowrap}",
      ".p053-btn:hover{border-color:var(--p053-primary);color:var(--p053-primary)}",
      ".p053-btn:disabled{opacity:.55;cursor:not-allowed}",
      ".p053-btn--primary{background:var(--p053-primary);border-color:var(--p053-primary);color:#fff}",
      ".p053-btn--primary:hover{filter:brightness(1.08);color:#fff}",
      ".p053-btn--ghost{padding:10px 12px}",
      ".p053-btn--search{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 21px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-weight:700;white-space:nowrap;transition:.18s ease}",
      ".p053-btn--search:hover{filter:brightness(1.06);transform:translateY(-1px);color:#fff}",
      ".p053-btn--search svg{width:18px;height:18px}",
      ".p053-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:p053spin .7s linear infinite}",
      "@keyframes p053spin{to{transform:rotate(360deg)}}",
      /* preview */
      ".p053-preview{margin-top:10px;display:flex;flex-direction:column;height:calc(100vh - 300px);min-height:320px;padding:14px 16px 16px;border:1px solid var(--p053-border);border-radius:18px;background:var(--p053-surface);box-shadow:0 12px 30px rgba(15,23,42,.06)}",
      ".p053-previewhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;flex:none}",
      ".p053-previewtitle{display:grid;gap:3px}",
      ".p053-previewtitle h2{margin:0;font-size:15px;font-weight:700}",
      ".p053-previewsub{font-size:11px;color:var(--p053-muted)}",
      ".p053-tools{display:flex;gap:8px;align-items:center}",
      ".p053-seg{display:flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--p053-border);border-radius:10px;background:var(--p053-surface2)}",
      ".p053-segbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--p053-muted);cursor:pointer;transition:.15s ease}",
      ".p053-segbtn:hover{background:var(--p053-surface);color:var(--p053-primary)}",
      ".p053-segbtn:active{transform:scale(.94)}",
      ".p053-segbtn:disabled{opacity:.35;cursor:not-allowed;background:transparent;color:var(--p053-muted);transform:none}",
      ".p053-segbtn svg{width:15px;height:15px}",
      ".p053-pagelbl{min-width:52px;padding:0 2px;color:var(--p053-ink);font-size:11px;font-weight:700;text-align:center}",
      ".p053-zoomval{min-width:40px;padding:0 2px;color:var(--p053-ink);font-size:11px;font-weight:700;text-align:center}",
      ".p053-printbtn{display:inline-flex;height:38px;align-items:center;justify-content:center;gap:8px;padding:0 20px;color:#fff;border:0;border-radius:10px;background:#16a34a;box-shadow:0 8px 18px rgba(22,163,74,.25);font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.18s ease}",
      ".p053-printbtn:hover{filter:brightness(1.08);transform:translateY(-1px)}",
      ".p053-printbtn:disabled{opacity:.5;cursor:not-allowed;transform:none}",
      ".p053-printbtn svg{width:16px;height:16px}",
      ".p053-empty{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:60px 20px;color:var(--p053-muted)}",
      ".p053-empty[hidden]{display:none}",
      ".p053-emptytitle{font-size:14px;font-weight:600}",
      ".p053-emptysub{font-size:12px}",
      ".p053-sheetwrap{position:relative;flex:1 1 auto;min-height:0;overflow:auto;display:flex;border:1px solid var(--p053-border);border-radius:12px;background:radial-gradient(circle at 1px 1px,rgba(100,116,139,.16) 1px,transparent 0) 0 0/18px 18px,#eef2f7}",
      ".p053-sheets{margin:auto;flex:0 0 auto;transform-origin:top left}",
      /* sheet — กระดาษ 282×210pt (10×7.5cm) ขอบกระดาษ 2pt ทั้ง 4 ด้าน — 1 ตั๋ว/หน้า */
      ".p053-sheet{display:grid;width:282pt;height:210pt;grid-template-columns:1fr;grid-template-rows:1fr;padding:2pt;background:#fff;box-shadow:0 22px 55px rgba(15,23,42,.3);flex:none}",
      ".p053-sticker{display:flex;min-width:0;min-height:0;align-items:center;justify-content:center;flex-direction:column;color:#000;text-align:center;padding:8pt 6pt}",
      ".p053-sticker-customer{font-size:22px;font-weight:500;line-height:1.35}",
      ".p053-sticker-page{margin:8pt 0 4pt;font-family:Arial,sans-serif;font-size:40px;font-weight:700;line-height:1.1}",
      ".p053-sticker-document{display:flex;justify-content:center;gap:28px;font-family:Arial,sans-serif;font-size:14px;line-height:1.5}",
      ".p053-sticker-company{margin-top:4pt;font-family:Arial,sans-serif;font-size:14px;line-height:1.4}",
      /* A — table 280×205px ขอบ 1 ทั้งหมด */
      ".p053-tbl{width:280px;height:205px;border-collapse:collapse;table-layout:fixed;text-align:center;color:#000;border:1px solid #000}",
      ".p053-tbl td{padding:2px 4px;vertical-align:middle;font-family:Arial,sans-serif}",
      ".p053-tc-customer{font-size:18px;font-weight:500;line-height:1.35;text-align:left}",
      ".p053-tc-page{font-size:30px;font-weight:700;line-height:1.1}",
      ".p053-tc-doc{font-size:12px;line-height:1.5;text-align:left}",
      ".p053-tc-fix{font-size:12px;line-height:1.4;text-align:left}",
      /* modal */
      ".p053-modal{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55)}",
      ".p053-modalbox{width:400px;max-width:calc(100vw - 40px);background:#fff;border-radius:14px;box-shadow:0 24px 60px rgba(15,23,42,.35)}",
      ".p053-modalhead{padding:18px 20px 0;font-size:14px;font-weight:700;color:#0f172a}",
      ".p053-modalbody{padding:12px 20px;font-size:12px;color:#475569}",
      ".p053-modalinput{width:100%;margin-top:10px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px;color:#0f172a;outline:0}",
      ".p053-modalinput:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}",
      ".p053-modalfoot{display:flex;justify-content:flex-end;gap:8px;padding:6px 20px 18px}",
      /* toast */
      ".p053-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
      ".p053-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
      ".p053-toast.error{background:#dc2626}",
      /* print — กระดาษ 282×210pt ขอบกระดาษ 2pt ทั้ง 4 ด้าน — 1 ตั๋ว/หน้า
         ตอนพิมพ์ render ทั้งหมดใน .p053-printroot ระดับ body — ตัด layout ของ element อื่นใน body ทั้งหมด
         (visibility:hidden ยังครอบ layout → ผลัก sheet ลงหน้า 2 = หน้าแรกเปล่า) + sheet flow 210pt พอดี + page-break-after */
      "@media print{" +
      "@page{size:282pt 210pt;margin:0}" +
      "body{margin:0 !important;padding:0 !important}" +
      "body > *:not(.p053-printroot){display:none !important}" +
      ".p053-printroot{margin:0 !important;padding:0 !important}" +
      ".p053-sheet{position:static !important;box-sizing:border-box !important;overflow:hidden !important;width:282pt;height:210pt;padding:2pt;margin:0 !important;box-shadow:none !important;transform:none !important;page-break-after:always;break-after:page}" +
      ".p053-sheet:last-child{page-break-after:auto;break-after:auto}" +
      "}"
    ].join('\n');
  }

  /* ---- sticker ---- */

  function createSticker(d, i, denom) {
    var isB = state.type === 'B';
    if (!isB) {
      // A — table 280×205px ขอบ 1 ทั้งหมด
      return '<article class="p053-sticker">' +
        '<table class="p053-tbl">' +
        '<colgroup><col style="width:50%"><col style="width:50%"></colgroup>' +
        '<tbody>' +
        '<tr style="height:90px"><td colspan="2" class="p053-tc-customer">' + esc(d.name || 'ลูกค้าตัวอย่าง') + '<br>' + esc(d.contact || '') + '</td></tr>' +
        '<tr><td colspan="2" class="p053-tc-page">' + i + '/' + denom + '</td></tr>' +
        '<tr><td class="p053-tc-doc">' + esc(d.vn || '') + '</td><td class="p053-tc-doc">' + esc(d.date || '') + '</td></tr>' +
        '<tr><td colspan="2" class="p053-tc-fix">' + esc('จาก บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด') + '</td></tr>' +
        '<tr><td colspan="2" class="p053-tc-fix">' + esc('โทร 034-878366-68 · Line : @m-group') + '</td></tr>' +
        '</tbody>' +
        '</table>' +
        '</article>';
    }
    // B (ส่งต่อ) — table 280×205px — customer = MIHmemo · footer = DEBnameT + DEBcontactT + "Tel : " DEBtel
    return '<article class="p053-sticker">' +
      '<table class="p053-tbl">' +
      '<colgroup><col style="width:50%"><col style="width:50%"></colgroup>' +
      '<tbody>' +
      '<tr style="height:90px"><td colspan="2" class="p053-tc-customer">' + esc(d.memo || '') + '</td></tr>' +
      '<tr><td colspan="2" class="p053-tc-page">' + i + '/' + denom + '</td></tr>' +
      '<tr style="height:20px"><td class="p053-tc-doc">' + esc(d.vn || '') + '</td><td class="p053-tc-doc">' + esc(d.date || '') + '</td></tr>' +
      '<tr><td colspan="2" class="p053-tc-fix">' + esc('จาก ' + (d.name || '') + ' ' + (d.contact || '')) + '</td></tr>' +
      '<tr><td colspan="2" class="p053-tc-fix">Tel : ' + esc(d.tel || '') + '</td></tr>' +
      '</tbody>' +
      '</table>' +
      '</article>';
  }

  function renderPage(el) {
    var d = state.data;
    var html = '<section class="p053-sheet">' + createSticker(d, state.page, state.denom) + '</section>';
    el.sheets.innerHTML = html;
    el.empty.hidden = true;
    el.printBtn.disabled = false;
    el.sub.textContent = 'เอกสาร ' + d.vn + ' · ' + state.count + ' หน้า · ประเภท ' + state.type + (state.type === 'B' ? ' (ส่งต่อ)' : '');
    updateScale(el);
    updatePageLabel(el);
  }

  function updatePageLabel(el) {
    if (state.count > 0) {
      el.pageLbl.textContent = 'หน้า ' + state.page + '/' + state.count;
      el.pagePrev.disabled = state.page <= 1;
      el.pageNext.disabled = state.page >= state.count;
    } else {
      el.pageLbl.textContent = '';
      el.pagePrev.disabled = true;
      el.pageNext.disabled = true;
    }
  }

  function goToPage(el, p) {
    var n = state.count || 1;
    var np = Math.min(n, Math.max(1, p));
    if (np === state.page) return;
    state.page = np;
    renderPage(el);
    el.sheetWrap.scrollTop = 0;
  }

  function updateScale(el) {
    var sheet = el.sheets.firstElementChild;
    if (!sheet) {
      el.zoomLbl.textContent = Math.round(state.zoom * 100) + '%';
      return;
    }
    var z = state.zoom;
    // กรอบ content = ขนาดหลัง scale → กลาง wrap เมื่อเล็กกว่า / scroll เมื่อใหญ่กว่า
    el.sheets.style.width = (sheet.offsetWidth * z) + 'px';
    el.sheets.style.height = (sheet.offsetHeight * z) + 'px';
    el.sheets.style.justifyContent = 'center';
    sheet.style.transform = 'scale(' + z + ')';
    sheet.style.transformOrigin = 'center center';
    el.zoomLbl.textContent = Math.round(z * 100) + '%';
  }

  function setZoom(el, z, byUser) {
    state.zoom = Math.min(2.5, Math.max(0.25, z));
    if (byUser) state.userZoom = true;
    updateScale(el);
  }

  function fitPreview(el) {
    var sheet = el.sheets.firstElementChild;
    if (!sheet) return;
    // fit เต็ม wrap — ขยายให้สวย
    var sheetW = sheet.offsetWidth;
    var sheetH = sheet.offsetHeight;
    var availW = el.sheetWrap.clientWidth - 24;
    var availH = el.sheetWrap.clientHeight - 24;
    var z = Math.min(availW / sheetW, availH / sheetH);
    setZoom(el, z);
  }

  /* ---- modal จำนวนสติ๊กเกอร์ (ประเภท A + count <= 0) ---- */

  function showCountModal(cb) {
    var m = document.createElement('div');
    m.className = 'p053-modal';
    m.innerHTML =
      '<div class="p053-modalbox">' +
      '<div class="p053-modalhead">จำนวนสติ๊กเกอร์</div>' +
      '<div class="p053-modalbody">' +
      '<p style="margin:0">ระบบไม่สามารถนับจำนวนได้ — กรุณาใส่จำนวนสติ๊กเกอร์</p>' +
      '<input class="p053-modalinput" type="number" min="1" max="999" value="1">' +
      '</div>' +
      '<div class="p053-modalfoot">' +
      '<button type="button" class="p053-btn" data-m="cancel">ยกเลิก</button>' +
      '<button type="button" class="p053-btn p053-btn--primary" data-m="ok">ตกลง</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(m);
    var inp = m.querySelector('.p053-modalinput');
    inp.focus();
    inp.select();
    function close() {
      m.remove();
    }
    m.querySelector('[data-m="cancel"]').onclick = close;
    m.querySelector('[data-m="ok"]').onclick = function () {
      var n = parseInt(inp.value, 10);
      if (!isFinite(n) || n < 1) {
        inp.focus();
        return;
      }
      close();
      cb(n);
    };
    m.onclick = function (e) {
      if (e.target === m) close();
    };
    inp.onkeydown = function (e) {
      if (e.key === 'Enter') m.querySelector('[data-m="ok"]').click();
      if (e.key === 'Escape') close();
    };
  }

  /* ---- toast ---- */

  function toast(root, msg, isError) {
    var el = root.querySelector('#p053Toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove('show');
    }, 3200);
  }

  /* ---- search ---- */

  function doSearch(root, el) {
    var vnos = el.doc.value.trim().toUpperCase();
    if (!vnos) {
      toast(root, 'กรุณาใส่เลขที่ใบสำคัญ', true);
      el.doc.focus();
      return;
    }
    el.btn.disabled = true;
    el.btn.innerHTML = '<span class="p053-spin"></span><span>ค้นหา...</span>';

    fetch('api/p053_search.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId: CONNECTION, vnos: vnos })
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error || 'API error');
        if (!d.found) {
          toast(root, 'ไม่พบเอกสาร ' + vnos, true);
          return;
        }
        state.data = d.row;
        state.type = d.type;
        if (d.type === 'B') {
          // ประเภท B (ส่งต่อ) — หน้าปัจจุบัน/จำนวนหน้า (MIHref2)
          if (d.count > 0) {
            state.count = d.count;
            state.denom = d.count;
          } else {
            state.count = 1;
            state.denom = 0;
          }
          showResult(root, el);
        } else if (d.count > 0) {
          // ประเภท A — จำนวน = ผลรวม MILnotes
          state.count = d.count;
          state.denom = d.count;
          showResult(root, el);
        } else {
          // ประเภท A + count <= 0 → modal ใส่จำนวน — ตัวเลขหลัง / = 0 เสมอ
          showCountModal(function (n) {
            state.count = n;
            state.denom = 0;
            showResult(root, el);
          });
        }
      })
      .catch(function (err) {
        // dev: mock fallback
        var key = vnos.replace(/[^A-Za-z0-9]/g, '');
        var mock = MOCK[key];
        if (mock) {
          state.data = mock;
          state.type = 'A';
          state.count = 1;
          state.denom = 1;
          showResult(root, el);
          toast(root, 'ใช้ข้อมูลตัวอย่าง (API: ' + err.message + ')', true);
        } else {
          toast(root, 'ค้นหาไม่สำเร็จ: ' + err.message, true);
        }
      })
      .then(function () {
        el.btn.disabled = false;
        el.btn.innerHTML = ICONS.search + '<span>สร้างสติ๊กเกอร์</span>';
      });
  }

  function showResult(root, el) {
    state.page = 1;
    renderPage(el);
    el.sheetWrap.scrollTop = 0;
  }

  /* ---- mount ---- */

  var _style = null;
  var _resizeTimer = null;
  var _el = null;

  function onResize() {
    if (!_el || !state.data) return;
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(function () {
      updateScale(_el);
    }, 150);
  }

  window.P053Sticker = {
    mount: function (root) {
      if (!root) return;
      if (!_style) {
        _style = document.createElement('style');
        _style.id = 'p053-sticker-style';
        _style.textContent = css();
        document.head.appendChild(_style);
      }
      renderRoot(root);
      _el = {
        form: $('#p053Form', root),
        doc: $('#p053Doc', root),
        btn: $('#p053Btn', root),
        preview: $('#p053Preview', root),
        sub: $('#p053Sub', root),
        empty: $('#p053Empty', root),
        sheets: $('#p053Sheets', root),
        sheetWrap: $('#p053SheetWrap', root),
        zoomLbl: $('#p053ZoomLbl', root),
        zoomIn: $('#p053ZoomIn', root),
        zoomOut: $('#p053ZoomOut', root),
        zoomFit: $('#p053ZoomFit', root),
        printBtn: $('#p053Print', root),
        pageLbl: $('#p053PageLbl', root),
        pagePrev: $('#p053PagePrev', root),
        pageNext: $('#p053PageNext', root)
      };
      _el.printBtn.disabled = true;
      _el.zoomLbl.textContent = Math.round(state.zoom * 100) + '%';
      updatePageLabel(_el);

      _el.form.addEventListener('submit', function (e) {
        e.preventDefault();
        doSearch(root, _el);
      });
      _el.doc.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          doSearch(root, _el);
        }
      });
      _el.zoomOut.addEventListener('click', function () {
        setZoom(_el, state.zoom - 0.1, true);
      });
      _el.zoomIn.addEventListener('click', function () {
        setZoom(_el, state.zoom + 0.1, true);
      });
      _el.zoomFit.addEventListener('click', function () {
        fitPreview(_el);
      });
      _el.pagePrev.addEventListener('click', function () {
        goToPage(_el, state.page - 1);
      });
      _el.pageNext.addEventListener('click', function () {
        goToPage(_el, state.page + 1);
      });
      // wheel = เลื่อนหน้าถัด ๆ ไป
      var _wheelT = 0;
      _el.sheetWrap.addEventListener('wheel', function (e) {
        if (state.count < 2) return;
        e.preventDefault();
        var now = Date.now();
        if (now - _wheelT < 300) return;
        _wheelT = now;
        if (e.deltaY > 0) goToPage(_el, state.page + 1);
        else if (e.deltaY < 0) goToPage(_el, state.page - 1);
      }, { passive: false });
      _el.printBtn.addEventListener('click', function () {
        if (!state.data) return;
        // ก่อนพิมพ์ — render ทั้งหมดใน container ระดับ body (ไม่โดน layout portal → ไม่มีหน้าแรกเปล่า)
        var d = state.data;
        var html = '';
        for (var i = 1; i <= state.count; i++) {
          html += '<section class="p053-sheet">' + createSticker(d, i, state.denom) + '</section>';
        }
        var holder = document.createElement('div');
        holder.className = 'p053-printroot';
        holder.innerHTML = html;
        document.body.appendChild(holder);
        window.print();
        document.body.removeChild(holder);
        // หลังพิมพ์ — กลับไปหน้าปัจจุบัน
        renderPage(_el);
      });

      window.addEventListener('resize', onResize);
    },
    destroy: function () {
      window.removeEventListener('resize', onResize);
      clearTimeout(_resizeTimer);
      _el = null;
    }
  };
})();
