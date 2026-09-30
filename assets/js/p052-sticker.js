/* P052 — สติ๊กเกอร์ 10x10 (ใบปะ) — layout ตาม C# MCIT_Frm_FaceSheetProductV2 */
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
    print: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>'
  };

  /* mock data (dev — fallback เมื่อ API ล้มเหลว) */
  var MOCK = {
    SCRE69080846: {
      date: '01/09/2569', vn: 'SCRE6908-0846', cus: '000234',
      name: 'บำรุงการเกษตร (LM)<br>(บางม่วง)', contact: '0896575609', tel: '0896575609',
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
    denom: 0,
    company: 'Company'
  };

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---- barcode SVG (JsBarcode — CODE128 / CODE93) ---- */

  function barcodeSVG(value, w, h) {
    try {
      if (window.JsBarcode) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        // NOTE: C# ใช้ CODE93 (type B) แต่ JsBarcode ไม่สนับสนุน — ใช้ CODE128 ทั้งหมด (scan ได้ — value เดียวกัน)
        var modules = 24 + 11 * String(value).length;
        var mw = Math.max(0.5, w / modules);
        window.JsBarcode(svg, String(value), {
          format: 'CODE128', width: mw, height: h,
          displayValue: false, margin: 0, lineColor: '#000'
        });
        svg.style.maxWidth = w + 'px';
        svg.style.maxHeight = h + 'px';
        return svg.outerHTML;
      }
    } catch (e) { /* fallback below */ }
    return '<div class="p052-bcfb">' + esc(value) + '</div>';
  }

  /* ---- sticker (layout ตาม C# MCIT_Frm_FaceSheetProductV2) ----
     Sheet 282×282pt — table กว้าง 280pt (373px) 3 คอลั่น — 1 ตั๋ว/หน้า
     A: กรณีส่ง(30B) + customer(26B h120) + CODE128 130×25 + i/total(40B rowspan2) + vnos date(14) + address(14 ถ้า Company)
     B: กรณีส่ง(30B) + MIHmemo(22B h125) + CODE93(30) + i/total(40B/35B rowspan2) + vnos date(14) + จาก name contact + Tel(16) */

  function createSticker(d, i, denom) {
    var vn = d.vn || '';
    var date = d.date || '';
    var pageFont = denom > 99 ? 'p052-sm' : '';
    if (state.type === 'B') {
      // B (ส่งต่อ)
      return '<article class="p052-sticker">' +
        '<table class="p052-tbl">' +
        '<colgroup><col style="width:10.7%"><col style="width:50%"><col style="width:39.3%"></colgroup>' +
        '<tbody>' +
        '<tr><td colspan="3" class="p052-tc-send">กรุณาส่ง</td></tr>' +
        '<tr style="height:130px"><td></td><td colspan="2" class="p052-tc-memo">' + esc((d.memo || '').replace(/\r\n/g, ' ')) + '</td></tr>' +
        '<tr><td colspan="2" class="p052-tc-bc">' + barcodeSVG(vn, 170, 45) + '</td>' +
        '<td rowspan="2" class="p052-tc-page ' + pageFont + '">' + i + '/' + denom + '</td></tr>' +
        '<tr><td colspan="2" class="p052-tc-doc">' + esc(vn) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + esc(date) + '</td></tr>' +
        '<tr><td colspan="3" class="p052-tc-from">จาก&nbsp;&nbsp;' + esc(d.name || '') + ' ' + esc(d.contact || '') + '<br>Tel : ' + esc(d.tel || '') + '</td></tr>' +
        '</tbody>' +
        '</table>' +
        '</article>';
    }
    // A (ทั่วไป)
    var addr = '';
    if (state.company === 'Company') {
      addr = '<tr><td colspan="3" class="p052-tc-addr">จาก บจก.มหาโชค มหาชัย อินเตอร์เทรด<br>58/9 ม.6 ถ.เศรษฐกิจ1 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร 74110<br>โทร. 034-878366-68 &nbsp;แฟกซ์ 034-878369 &nbsp;Line : @m-group</td></tr>';
    }
    return '<article class="p052-sticker">' +
      '<table class="p052-tbl">' +
      '<colgroup><col style="width:10.7%"><col style="width:50%"><col style="width:39.3%"></colgroup>' +
      '<tbody>' +
      '<tr><td colspan="3" class="p052-tc-send">กรุณาส่ง</td></tr>' +
      '<tr style="height:130px"><td></td><td colspan="2" class="p052-tc-customer">' + esc(d.name || '') + '<br>' + esc(d.contact || '') + '</td></tr>' +
      '<tr><td colspan="2" class="p052-tc-bc">' + barcodeSVG(vn, 170, 45) + '</td>' +
      '<td rowspan="2" class="p052-tc-page ' + pageFont + '">' + i + '/' + denom + '</td></tr>' +
      '<tr><td colspan="2" class="p052-tc-doc">' + esc(vn) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + esc(date) + '</td></tr>' +
      addr +
      '</tbody>' +
      '</table>' +
      '</article>';
  }

  function renderRoot(root) {
    root.innerHTML =
      '<section class="p052-wrap">' +
      '  <div class="p052-launcher">' +
      '    <form id="p052Form" class="p052-form" autocomplete="off">' +
      '      <div class="p052-field">' +
      '        <label for="p052Doc">เลขที่ใบสำคัญ</label>' +
      '        <div class="p052-inputwrap">' +
      '          <input class="p052-input" id="p052Doc" type="text" placeholder="ระบุเลขที่ใบสำคัญ" autocomplete="off">' +
      '        </div>' +
      '      </div>' +
      '      <div class="p052-formactions">' +
      '        <button type="submit" class="p052-btn--search" id="p052Btn">' + ICONS.search + '<span>สร้างสติ๊กเกอร์</span></button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '</section>' +
      '<section class="p052-preview" id="p052Preview">' +
      '  <div class="p052-previewhead">' +
      '    <div class="p052-previewtitle">' +
      '      <h2>ตัวอย่างสติ๊กเกอร์</h2>' +
      '      <span class="p052-previewsub" id="p052Sub"></span>' +
      '    </div>' +
      '    <div class="p052-tools">' +
      '      <div class="p052-seg">' +
      '        <button type="button" class="p052-segbtn" id="p052PagePrev" title="หน้าก่อนหน้า">' + ICONS.chevL + '</button>' +
      '        <span class="p052-pagelbl" id="p052PageLbl"></span>' +
      '        <button type="button" class="p052-segbtn" id="p052PageNext" title="หน้าถัดไป">' + ICONS.chevR + '</button>' +
      '      </div>' +
      '      <div class="p052-seg">' +
      '        <button type="button" class="p052-segbtn" id="p052ZoomOut" title="ย่อ">' + ICONS.minus + '</button>' +
      '        <span class="p052-zoomval" id="p052ZoomLbl"></span>' +
      '        <button type="button" class="p052-segbtn" id="p052ZoomIn" title="ขยาย">' + ICONS.plus + '</button>' +
      '      </div>' +
      '      <button type="button" class="p052-btn p052-btn--ghost" id="p052ZoomFit">' + ICONS.fit + '<span>พอดีจอ</span></button>' +
      '      <button type="button" class="p052-printbtn" id="p052Print">' + ICONS.print + '<span>พิมพ์</span></button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p052-sheetwrap" id="p052SheetWrap">' +
      '    <div class="p052-empty" id="p052Empty">' +
      '      <div class="p052-emptytitle">ยังไม่มีสติ๊กเกอร์</div>' +
      '      <div class="p052-emptysub">กรอกเลขที่ใบสำคัญ แล้วกด "สร้างสติ๊กเกอร์"</div>' +
      '    </div>' +
      '    <div class="p052-sheets" id="p052Sheets"></div>' +
      '  </div>' +
      '</section>' +
      '<div class="p052-toast" id="p052Toast" role="status"></div>';
  }

  function css() {
    return [
      ".p052-wrap{--p052-surface:var(--surface,#fff);--p052-surface2:var(--surface-2,#f8fafc);--p052-border:var(--border,#e2e8f0);--p052-muted:var(--muted-foreground,#64748b);--p052-primary:var(--accent,#2563eb);--p052-ink:var(--foreground,#0f172a);color:var(--p052-ink);min-height:100%;padding:22px 24px 0;background:var(--p052-surface2);font-family:inherit}",
      ".p052-launcher{padding:14px 16px 10px;border:1px solid var(--p052-border);border-radius:16px;background:var(--p052-surface);box-shadow:0 12px 30px rgba(15,23,42,.06)}",
      ".p052-field{display:grid;gap:6px;min-width:220px;max-width:340px}",
      ".p052-field label{color:#64748b;font-size:11px;font-weight:600}",
      ".p052-inputwrap{position:relative}",
      ".p052-input{width:100%;height:44px;padding:0 12px;color:#172033;border:1px solid #e2e8f0;border-radius:11px;background:#fff;outline:0;font-size:13px;transition:.18s ease}",
      ".p052-input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
      ".p052-form{display:flex;flex-wrap:wrap;gap:12px;align-items:end;width:100%}",
      ".p052-formactions{display:flex;gap:8px;align-items:end}",
      ".p052-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border:1px solid var(--p052-border);border-radius:10px;background:var(--p052-surface);color:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:.15s ease;white-space:nowrap}",
      ".p052-btn:hover{border-color:var(--p052-primary);color:var(--p052-primary)}",
      ".p052-btn:disabled{opacity:.55;cursor:not-allowed}",
      ".p052-btn--primary{background:var(--p052-primary);border-color:var(--p052-primary);color:#fff}",
      ".p052-btn--primary:hover{filter:brightness(1.08);color:#fff}",
      ".p052-btn--ghost{padding:10px 12px}",
      ".p052-btn--search{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 21px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-weight:700;white-space:nowrap;transition:.18s ease}",
      ".p052-btn--search:hover{filter:brightness(1.06);transform:translateY(-1px);color:#fff}",
      ".p052-btn--search svg{width:18px;height:18px}",
      ".p052-spin{width:12px;height:12px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:p052spin .7s linear infinite}",
      "@keyframes p052spin{to{transform:rotate(360deg)}}",
      /* preview */
      ".p052-preview{margin-top:10px;display:flex;flex-direction:column;height:calc(100vh - 300px);min-height:320px;padding:14px 16px 16px;border:1px solid var(--p052-border);border-radius:18px;background:var(--p052-surface);box-shadow:0 12px 30px rgba(15,23,42,.06)}",
      ".p052-previewhead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;flex:none}",
      ".p052-previewtitle{display:grid;gap:3px}",
      ".p052-previewtitle h2{margin:0;font-size:15px;font-weight:700}",
      ".p052-previewsub{font-size:11px;color:var(--p052-muted)}",
      ".p052-tools{display:flex;gap:8px;align-items:center}",
      ".p052-seg{display:flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--p052-border);border-radius:10px;background:var(--p052-surface2)}",
      ".p052-segbtn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:28px;border:0;border-radius:7px;background:transparent;color:var(--p052-muted);cursor:pointer;transition:.15s ease}",
      ".p052-segbtn:hover{background:var(--p052-surface);color:var(--p052-primary)}",
      ".p052-segbtn:active{transform:scale(.94)}",
      ".p052-segbtn:disabled{opacity:.35;cursor:not-allowed;background:transparent;color:var(--p052-muted);transform:none}",
      ".p052-segbtn svg{width:15px;height:15px}",
      ".p052-pagelbl{min-width:52px;padding:0 2px;color:var(--p052-ink);font-size:11px;font-weight:700;text-align:center}",
      ".p052-zoomval{min-width:40px;padding:0 2px;color:var(--p052-ink);font-size:11px;font-weight:700;text-align:center}",
      ".p052-printbtn{display:inline-flex;height:38px;align-items:center;justify-content:center;gap:8px;padding:0 20px;color:#fff;border:0;border-radius:10px;background:#16a34a;box-shadow:0 8px 18px rgba(22,163,74,.25);font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:.18s ease}",
      ".p052-printbtn:hover{filter:brightness(1.08);transform:translateY(-1px)}",
      ".p052-printbtn:disabled{opacity:.5;cursor:not-allowed;transform:none}",
      ".p052-printbtn svg{width:16px;height:16px}",
      ".p052-empty{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:60px 20px;color:var(--p052-muted)}",
      ".p052-empty[hidden]{display:none}",
      ".p052-emptytitle{font-size:14px;font-weight:600}",
      ".p052-emptysub{font-size:12px}",
      ".p052-sheetwrap{position:relative;flex:1 1 auto;min-height:0;overflow:auto;display:flex;border:1px solid var(--p052-border);border-radius:12px;background:radial-gradient(circle at 1px 1px,rgba(100,116,139,.16) 1px,transparent 0) 0 0/18px 18px,#eef2f7}",
      ".p052-sheets{margin:auto;flex:0 0 auto;transform-origin:top left}",
      /* sheet — กระดาษ 282×282pt (10×10cm) ขอบกระดาษ 2pt ทั้ง 4 ด้าน — 1 ตั๋ว/หน้า */
      ".p052-sheet{display:grid;width:282pt;height:282pt;grid-template-columns:1fr;grid-template-rows:1fr;padding:0;background:#fff;box-shadow:0 22px 55px rgba(15,23,42,.3);flex:none}",
      ".p052-sticker{display:flex;min-width:0;min-height:0;align-items:center;justify-content:flex-start;flex-direction:column;color:#000;padding:4pt}",
      /* table กว้าง 280pt (373px) — 3 คอลั่น — font pt×1.333 = px */
      ".p052-tbl{width:373px;border-collapse:collapse;table-layout:fixed;color:#000;border:1px solid #000}",
      ".p052-tbl td{border:1px solid #000;padding:0;vertical-align:top;font-family:'THSarabunNew',Arial,sans-serif}",
      ".p052-tbl td.p052-tc-send{font-size:30pt;font-weight:700;line-height:1.1;padding-top:10px;padding-left:10px;text-align:left}",
      ".p052-tbl td.p052-tc-customer{font-size:26pt;font-weight:700;line-height:1.25;padding-top:10px;text-align:left;word-break:break-word}",
      ".p052-tbl td.p052-tc-memo{font-size:26pt;font-weight:700;line-height:1.3;padding-top:10px;text-align:left;word-break:break-word}",
      ".p052-tbl td.p052-tc-bc{padding-top:7px;padding-bottom:7px;text-align:center}",
      ".p052-tc-bc svg{display:block;margin:0 auto}",
      ".p052-bcfb{font-family:Arial,sans-serif;font-size:14px;color:#000}",
      ".p052-tbl td.p052-tc-page{font-size:40pt;font-weight:700;line-height:1.1;text-align:center;vertical-align:middle}",
      ".p052-tbl td.p052-tc-page.p052-sm{font-size:36pt}",
      ".p052-tbl td.p052-tc-doc{font-size:14pt;text-align:center;padding-top:0px}",
      ".p052-tbl td.p052-tc-addr{font-size:17px;line-height:1.4;text-align:left;padding-top:0px;padding-left:2px}",
      ".p052-tbl td.p052-tc-from{font-size:17px;line-height:1.4;text-align:left;padding-top:0px;padding-left:2px}",
      /* modal */
      ".p052-modal{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;background:rgba(15,23,42,.55)}",
      ".p052-modalbox{width:400px;max-width:calc(100vw - 40px);background:#fff;border-radius:14px;box-shadow:0 24px 60px rgba(15,23,42,.35)}",
      ".p052-modalhead{padding:18px 20px 0;font-size:14px;font-weight:700;color:#0f172a}",
      ".p052-modalbody{padding:12px 20px;font-size:12px;color:#475569}",
      ".p052-modalinput{width:100%;margin-top:10px;padding:10px 12px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px;color:#0f172a;outline:0}",
      ".p052-modalinput:focus{border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.12)}",
      ".p052-modalfoot{display:flex;justify-content:flex-end;gap:8px;padding:6px 20px 18px}",
      /* toast */
      ".p052-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
      ".p052-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
      ".p052-toast.error{background:#dc2626}",
      /* print — กระดาษ 282×282pt ขอบกระดาษ 2pt ทั้ง 4 ด้าน — 1 ตั๋ว/หน้า
         ตอนพิมพ์ render ทั้งหมดใน .p052-printroot ระดับ body — ตัด layout ของ element อื่นใน body ทั้งหมด
         (visibility:hidden ยังครอบ layout → ผลัก sheet ลงหน้า 2 = หน้าแรกเปล่า) + sheet flow 282pt พอดี + page-break-after */
      "@media print{" +
      "@page{size:282pt 282pt;margin:0}" +
      "body{margin:0 !important;padding:0 !important}" +
      "body > *:not(.p052-printroot){display:none !important}" +
      ".p052-printroot{margin:0 !important;padding:0 !important}" +
      ".p052-sheet{position:static !important;box-sizing:border-box !important;overflow:hidden !important;width:282pt;height:282pt;padding:0;margin:0 !important;box-shadow:none !important;transform:none !important;page-break-after:always;break-after:page}" +
      ".p052-sheet:last-child{page-break-after:auto;break-after:auto}" +
      "}"
    ].join('\n');
  }

  function renderPage(el) {
    var d = state.data;
    var html = '<section class="p052-sheet">' + createSticker(d, state.page, state.denom) + '</section>';
    el.sheets.innerHTML = html;
    el.empty.hidden = true;
    el.printBtn.disabled = false;
    el.sub.textContent = 'เอกสาร ' + d.vn + ' · ' + state.count + ' หน้า · ประเภท ' + state.type + (state.type === 'B' ? ' (ส่งต่อ)' : (state.company === 'Company' ? ' (Company)' : ' (NotCompany)'));
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
    m.className = 'p052-modal';
    m.innerHTML =
      '<div class="p052-modalbox">' +
      '<div class="p052-modalhead">จำนวนสติ๊กเกอร์</div>' +
      '<div class="p052-modalbody">' +
      '<p style="margin:0">ระบบไม่สามารถนับจำนวนได้ — กรุณาใส่จำนวนสติ๊กเกอร์</p>' +
      '<input class="p052-modalinput" type="number" min="1" max="999" value="1">' +
      '</div>' +
      '<div class="p052-modalfoot">' +
      '<button type="button" class="p052-btn" data-m="cancel">ยกเลิก</button>' +
      '<button type="button" class="p052-btn p052-btn--primary" data-m="ok">ตกลง</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(m);
    var inp = m.querySelector('.p052-modalinput');
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
    var el = root.querySelector('#p052Toast');
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
    el.btn.innerHTML = '<span class="p052-spin"></span><span>ค้นหา...</span>';

    fetch('api/p052_search.php', {
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
        state.company = d.company || 'Company';
        if (d.type === 'B') {
          // ประเภท B (ส่งต่อ) — count = MIHref2 — ตัวเลขหลัง / = total (totalCopy)
          if (d.count > 0) {
            state.count = d.count;
          } else {
            state.count = 1;
          }
          state.denom = d.total || 0;
          showResult(root, el);
        } else if (d.count > 0) {
          // ประเภท A — จำนวน = ผลรวม MILnotes (filter)
          state.count = d.count;
          state.denom = d.total || d.count;
          showResult(root, el);
        } else {
          // ประเภท A + count <= 0 → modal ใส่จำนวน
          showCountModal(function (n) {
            state.count = n;
            state.denom = d.total || 0;
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
          state.company = 'Company';
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

  window.P052Sticker = {
    mount: function (root) {
      if (!root) return;
      if (!_style) {
        _style = document.createElement('style');
        _style.id = 'p052-sticker-style';
        _style.textContent = css();
        document.head.appendChild(_style);
      }
      renderRoot(root);
      _el = {
        form: $('#p052Form', root),
        doc: $('#p052Doc', root),
        btn: $('#p052Btn', root),
        preview: $('#p052Preview', root),
        sub: $('#p052Sub', root),
        empty: $('#p052Empty', root),
        sheets: $('#p052Sheets', root),
        sheetWrap: $('#p052SheetWrap', root),
        zoomLbl: $('#p052ZoomLbl', root),
        zoomIn: $('#p052ZoomIn', root),
        zoomOut: $('#p052ZoomOut', root),
        zoomFit: $('#p052ZoomFit', root),
        printBtn: $('#p052Print', root),
        pageLbl: $('#p052PageLbl', root),
        pagePrev: $('#p052PagePrev', root),
        pageNext: $('#p052PageNext', root)
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
        var d = state.data;
        var html = '';
        for (var i = 1; i <= state.count; i++) {
          html += '<section class="p052-sheet">' + createSticker(d, i, state.denom) + '</section>';
        }
        var holder = document.createElement('div');
        holder.className = 'p052-printroot';
        holder.innerHTML = html;
        document.body.appendChild(holder);
        window.print();
        document.body.removeChild(holder);
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
