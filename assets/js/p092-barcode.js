/* P092 — Barcode/สคบ. (พิมพ์ Barcode/สติกเกอร์) — ตาม C# MCIT_Frm_STKguideGUI + MCIT_Frm_Setprint
   รหัสสินค้า (autocomplete 3 คอลั่น) → modal ตั้งค่า (ประเภท/ขนาด/จำนวน/หน่วย) → sticker sheet → print
   Real data MAC5 — api/p092_search.php + p092_autocomplete.php + p092_running.php (fallback mock)
   Layout (C# — หน้า = pt — 1"=72pt):
     Small (292×76pt ≈103×27mm) — สคบ.: 3 ตัว [92,5,92,5,92] · barcode: 3 ตัว (STKBarcode + EAN13)
     Medium (288×99pt ≈102×35mm) — สคบ.: 2 ตัว [143,145] · barcode: 2 ตัว (+S/N)
     Large (282×282pt = 10×10cm) — barcode layout เสมอ (4 ตัวกลาง + EAN13 + สคบ. + S/N)
     Large 10×7 (282×210pt = 10×7cm) — เหมือน Large (font น้อยกว่า)
   S/N = yyMMdd + running 6 ตัว (BI_CUBE.dbo.STKrunning — save ตอน print เงื่อนไข (size2&&type2) || size3)
   Barcode = EAN13 (font ean13.ttf — assets/fonts) — Barcode{unit} ต้อง >= 12 ตัว */
(function () {
  'use strict';

  var CONNECTION = (window.TAILORMADE_CONNECTION_ID || 'c1788406814359').trim();

  var ICONS = {
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>',
    minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"></path></svg>',
    chevL: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>',
    chevR: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>',
    fit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M16 3h3a2 2 0 0 1 2 2v3"></path><path d="M8 21H5a2 2 0 0 1-2-2v-3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>',
    print: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>',
    reset: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>'
  };

  /* mock fallback (เมื่อ API ล้มเหลว — shape = api/p092_search.php) */
  var MOCK = {
    '10010671': {
      code: '10010671', name: 'กรองแสงสีฟ้า-3เข็ม 50% ดำ 2×3m',
      guide: 'ตึงกรองแสงให้ตึงสม่ำเสมอ ระวังลมแรง', warning: 'ห้ามใช้กับไฟฟ้าแรงสูง',
      stkBarcode: '10010671',
      barcodes: { 1: '8851234567890', 2: '8851234567890', 3: '', 4: '', 5: '' },
      units: { 1: 'ม้วน', 2: 'Box', 3: '', 4: '', 5: '' },
      defaultUnit: 1
    },
    '10010673': {
      code: '10010673', name: 'กรองแสงสีฟ้า-3เข็ม 50% ดำ 2×5m',
      guide: 'ตึงกรองแสงให้ตึงสม่ำเสมอ ระวังลมแรง', warning: 'ห้ามใช้กับไฟฟ้าแรงสูง',
      stkBarcode: '10010673',
      barcodes: { 1: '8851234567892', 2: '8851234567892', 3: '', 4: '', 5: '' },
      units: { 1: 'ม้วน', 2: 'Box', 3: '', 4: '', 5: '' },
      defaultUnit: 1
    },
    '10011159': {
      code: '10011159', name: 'กรองแสงสีฟ้า-3เข็ม (TKS) 50% ดำ 2×10m',
      guide: 'ตึงกรองแสงให้ตึงสม่ำเสมอ', warning: 'เก็บไว้แห้ง',
      stkBarcode: '10011159',
      barcodes: { 1: '8851234567894', 2: '8851234567894', 3: '', 4: '', 5: '' },
      units: { 1: 'ม้วน', 2: 'แพ็ค', 3: 'Box', 4: '', 5: '' },
      defaultUnit: 1
    }
  };

  /* C# dispatch — size/type → handler:
     size1 สคบ.=Small_skb · size1 barcode=Small_Barcode · size2 สคบ.=Middel_skb · size2 barcode=Middel_Barcode
     size3=Large (barcode layout เสมอ) · size4=Large_10x7 */

  var COMPANY = 'บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด\n58/9 หมู่ 6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร';

  var state = {
    zoom: 1.0,
    page: 1,
    product: null,   /* { code, name, guide, warning, stkBarcode, barcodes{1-5}, units{1-5}, defaultUnit } */
    type: 'สคบ',     /* สคบ | barcode (typeDoc 1/2) */
    size: 'small',   /* small|medium|large|large10x7 (sizeDoc 1-4) */
    quantity: 1,     /* decimal (C# num_quantity) */
    unitIdx: 1,      /* 1-5 (unitDoc — STKuname{N} / Barcode{N}) */
    running: 0,      /* S/N running (STKrunning) */
    created: false
  };

  var _el = null;
  var _resizeTimer = null;
  var _toastTimer = null;
  var _acTimer = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(root, msg, isError) {
    var t = _el && _el.toast;
    if (!t) return;
    t.textContent = msg;
    t.className = 'p092-toast show' + (isError ? ' error' : '');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { t.className = 'p092-toast'; }, 2600);
  }

  function api(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  /* ============ EAN13 (JsBarcode — format EAN13 — digits ใช้ font EAN13) ============ */
  /* rebuild ตัวเลข barcode เป็น tspans spacing คงที่ (chid กัน — ตาม font ean13) */
  function compressEanDigits(svg, w) {
    var text = svg.querySelector('text');
    if (!text) return;
    var val = text.textContent || '';
    if (!/^\d{13}$/.test(val)) return;
    var y = text.getAttribute('y') || '0';
    var fs = parseFloat(text.getAttribute('font-size') || '10');
    /* 13 digit — chid กัน (compress สู่ ~0.60w — อยู่กึ่งกลาง) */
    var step = (w * 0.60) / 13;
    var x0 = (w - step * 13) / 2 + step / 2;
    /* clear existing tspans */
    while (text.firstChild) text.removeChild(text.firstChild);
    var NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 13; i++) {
      var ts = document.createElementNS(NS, 'tspan');
      ts.setAttribute('x', (x0 + step * i).toFixed(2));
      ts.setAttribute('y', y);
      ts.textContent = val[i];
      text.appendChild(ts);
    }
    text.setAttribute('font-size', Math.min(fs, step * 0.85).toFixed(2));
    text.setAttribute('text-anchor', 'start');
  }

  function ean13Checksum(d12) {
    var sum = 0, i;
    for (i = 11; i >= 0; i -= 2) sum += parseInt(d12[i], 10);
    sum *= 3;
    for (i = 10; i >= 0; i -= 2) sum += parseInt(d12[i], 10);
    return (10 - sum % 10) % 10;
  }

  function ean13HTML(d12, w, h) {
    if (!d12 || !/^\d{12}$/.test(d12)) {
      return '<div class="p092-ean-fb">' + esc(d12) + '</div>';
    }
    try {
      if (window.JsBarcode) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var mw = Math.max(1, (w * 0.9) / 95); /* 95 modules — bars + digits ชิดตามสัดส่วน */
        window.JsBarcode(svg, d12, {
          format: 'EAN13', width: mw, height: Math.round(h * 0.7),
          fontSize: Math.round(h * 0.2), fontFamily: '"EAN13", Arial, sans-serif',
          displayValue: true, margin: 0, lineColor: '#000',
          text: d12 + ean13Checksum(d12)
        });
        /* constrain กว้างสุด w — ไม่ stretch (รักษาสัดส่วน bars/digits) */
        svg.style.maxWidth = w + 'px';
        svg.style.maxHeight = h + 'px';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
        /* ตัวเลข barcode ชิดกัน — rebuild tspans spacing คงที่ (font EAN13) */
        compressEanDigits(svg, w);
        return svg.outerHTML;
      }
    } catch (e) {
      // fall through
    }
    return '<div class="p092-ean-fb">' + esc(d12) + '</div>';
  }

  /* ============ S/N (yyMMdd + running 6 ตัว) ============ */
  function snCode(running) {
    var d = new Date();
    var yy = String(d.getFullYear()).slice(-2);
    var mm = ('0' + (d.getMonth() + 1)).slice(-2);
    var dd = ('0' + d.getDate()).slice(-2);
    return yy + mm + dd + String(running).padStart(6, '0');
  }

  function code128HTML(value, w, h) {
    try {
      if (window.JsBarcode) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var modules = 24 + 11 * String(value).length;
        var mw = Math.max(0.5, w / modules);
        window.JsBarcode(svg, String(value), {
          format: 'CODE128', width: mw, height: h,
          fontSize: 10, displayValue: true, margin: 0, lineColor: '#000'
        });
        svg.style.maxWidth = w + 'px';
        svg.style.maxHeight = h + 'px';
        return svg.outerHTML;
      }
    } catch (e) {
      // fall through
    }
    return '<div class="p092-ean-fb">' + esc(value) + '</div>';
  }

  /* ============ data ============ */
  function productUnits(p) {
    var out = [];
    for (var i = 1; i <= 5; i++) {
      if (p.units && p.units[i]) out.push({ idx: i, name: p.units[i] });
    }
    return out;
  }

  function getUnitName(p) {
    return (p.units && p.units[state.unitIdx]) || '';
  }

  function getUnitBarcode(p) {
    return (p.barcodes && p.barcodes[state.unitIdx]) || '';
  }

  /* EAN13 value — Barcode{unit} (ต้อง 12+ ตัวเลข) — ถ้าว่าง (DB รหัส Barcode1-5 ไม่มีข้อมูล)
     fallback = รหัสสินค้า pad 0 เป็น 12 ตัว (C# = error — web = fallback ให้พิมพ์ได้) */
  function eanValue(p) {
    var ub = getUnitBarcode(p);
    if (ub && /^\d{12,}$/.test(ub)) return ub.slice(0, 12);
    return String(p.code || '').replace(/\D/g, '').padEnd(12, '0');
  }

  /* ============ sticker HTML (C# layouts) ============ */
  function cols(n) {
    var s = '<colgroup>';
    for (var i = 0; i < n; i++) s += '<col>';
    return s + '</colgroup>';
  }

  function skbText(p, fcls) {
    var b = fcls + '-b';
    return '<span class="' + b + '">ชื่อสินค้า : </span>' + esc(p.name) +
      '<br><span class="' + b + '">หน่วย : </span>' + esc(getUnitName(p)) +
      '<br><span class="' + b + '">วิธีการใช้ : </span>' + esc(p.guide) +
      '<br><span class="' + b + '">ข้อควรระวัง : </span>' + esc(p.warning) +
      '<br><span class="' + b + '">สั่งผลิตและจัดจำหน่ายโดย : </span>' +
      '<br>' + esc(COMPANY).split('\n').join('<br>');
  }

  function stickerHTML(i) {
    var p = state.product;
    var isBarcode = state.type === 'barcode';
    var ub = eanValue(p);
    var sn = snCode(state.running + i + 1);

    /* ---- Small (3 ตัว/หน้า — 5 คอลั่น [92,5,92,5,92]) ---- */
    if (state.size === 'small') {
      if (!isBarcode) {
        /* Small_skb — 1 แถว × 5 คอลั่น — ตั้งแต่ field อยู่ใน cell เดียว (col 1/3/5 — C#) — padding left/top 8pt */
        var cell = '<td class="p092-f6 p092-pad8">' + skbText(p, 'p092-f6') + '</td>';
        return '<article class="p092-sticker p092-st-small">' +
          '<table class="p092-grid p092-g5">' + cols(5) + '<tr>' +
          cell + '<td></td>' +
          cell + '<td></td>' +
          cell +
          '</tr></table></article>';
      }
      /* Small_Barcode — แถว 1 = STKBarcode ×3 (9px) · แถว 2 = EAN13 80×50 ×3 */
      var bc = esc(p.stkBarcode);
      var ean = ean13HTML(ub, 80, 50);
      return '<article class="p092-sticker p092-st-small">' +
        '<table class="p092-grid p092-g5">' + cols(5) +
        '<tr>' +
        '<td class="p092-c p092-f9px">' + bc + '</td><td></td>' +
        '<td class="p092-c p092-f9px">' + bc + '</td><td></td>' +
        '<td class="p092-c p092-f9px">' + bc + '</td>' +
        '</tr>' +
        '<tr>' +
        '<td class="p092-c">' + ean + '</td><td></td>' +
        '<td class="p092-c">' + ean + '</td><td></td>' +
        '<td class="p092-c">' + ean + '</td>' +
        '</tr></table></article>';
    }

    /* ---- Medium (2 ตัว/หน้า — 2 คอลั่น [143,145]) ---- */
    if (state.size === 'medium') {
      if (!isBarcode) {
        /* Middel_skb — 1 แถว × 2 คอลั่น (143/145pt) — ตั้งแต่ field อยู่ใน cell เดียว (C#) */
        var cellM = '<td class="p092-f9 p092-f8px p092-pad6">' + skbText(p, 'p092-f9') + '</td>';
        return '<article class="p092-sticker p092-st-medium">' +
          '<table class="p092-grid p092-g2">' + cols(2) + '<tr>' +
          cellM + cellM +
          '</tr></table></article>';
      }
      /* Middel_Barcode — 3 แถว × 2: STKBarcode · EAN13 (h43) · S/N + CODE128 */
      var eanM = ean13HTML(ub, 120, 40);
      var snM = code128HTML(sn, 100, 30);
      return '<article class="p092-sticker p092-st-medium">' +
        '<table class="p092-grid p092-g2m">' + cols(2) +
        '<tr><td class="p092-c p092-f9">' + esc(p.stkBarcode) + '</td>' +
        '<td class="p092-c p092-f9">' + esc(p.stkBarcode) + '</td></tr>' +
        '<tr><td class="p092-c p092-eanrow">' + eanM + '</td>' +
        '<td class="p092-c p092-eanrow">' + eanM + '</td></tr>' +
        '<tr><td class="p092-snrow"><span class="p092-snlabel p092-f12">S/N</span>' + snM + '</td>' +
        '<td class="p092-snrow"><span class="p092-snlabel p092-f12">S/N</span>' + snM + '</td></tr>' +
        '</table></article>';
    }

    /* ---- Large 10×10 (1 ตัว/หน้า — 2 คอลั่น [100,180]) — barcode layout เสมอ ---- */
    if (state.size === 'large') {
      var eanL = ean13HTML(ub, 160, 60);
      var snL = code128HTML(sn, 90, 30);
      var mid4 = esc(ub.substr(4, 4));
      return '<article class="p092-sticker p092-st-large">' +
        '<table class="p092-grid p092-gl">' + cols(2) +
        '<tr>' +
        '<td class="p092-mid p092-f58" rowspan="2">' + mid4 + '</td>' +
        '<td class="p092-c p092-f12 p092-btbr">' + esc(p.stkBarcode) + '</td>' +
        '</tr>' +
        '<tr><td class="p092-c p092-f12 p092-bbbr">' + eanL + '</td></tr>' +
        '<tr><td class="p092-cell p092-cell-l p092-f17" colspan="2">' + skbText(p, 'p092-f17') + '</td></tr>' +
        '<tr><td class="p092-snrow p092-snrow-l"><span class="p092-snlabel p092-f14">S/N</span>' + snL + '</td>' +
        '<td class="p092-c"></td></tr>' +
        '</table></article>';
    }

    /* ---- Large 10×7 (1 ตัว/หน้า — font น้อยกว่า) ---- */
    var eanL2 = ean13HTML(ub, 160, 50);
    var snL2 = code128HTML(sn, 90, 30);
    var mid4b = esc(ub.substr(4, 4));
    return '<article class="p092-sticker p092-st-large10x7">' +
      '<table class="p092-grid p092-gl">' + cols(2) +
      '<tr>' +
      '<td class="p092-mid p092-f40" rowspan="2">' + mid4b + '</td>' +
      '<td class="p092-c p092-f10 p092-btbr">' + esc(p.stkBarcode) + '</td>' +
      '</tr>' +
      '<tr><td class="p092-c p092-f10 p092-bbbr">' + eanL2 + '</td></tr>' +
      '<tr><td class="p092-cell p092-cell-l7 p092-f12" colspan="2">' + skbText(p, 'p092-f12') + '</td></tr>' +
      '<tr><td class="p092-snrow"><span class="p092-snlabel p092-f12">S/N</span>' + snL2 + '</td>' +
      '<td class="p092-c"></td></tr>' +
      '</table></article>';
  }

  /* ============ sheet / pagination ============ */
  /* 1 iteration = 1 หน้า (292×76pt — mี 3 stickers ในตาราง 5 คอลั่น — C# loop i=1..quanDoc)
     ถึง large (1 sticker/หน้า) — หนึ่ง ๆ = 1 หน้า */
  function perPage() {
    return 1;
  }

  function pagesCount() {
    return Math.max(1, Math.ceil(state.quantity / perPage()));
  }

  function renderPage() {
    if (!_el || !state.created || !state.product) return;
    var pp = perPage();
    var pages = pagesCount();
    if (state.page > pages) state.page = pages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * pp;
    var end = Math.min(start + pp, state.quantity);
    var html = '';
    for (var i = start; i < end; i++) {
      html += stickerHTML(i);
    }
    _el.sheets.innerHTML = '<div class="p092-sheet p092-sheet-' + esc(state.size) + '" id="p092Sheet">' + html + '</div>';
    _el.sheet = _el.sheets.querySelector('#p092Sheet');
    _el.pageLbl.textContent = state.page + ' / ' + pages;
    _el.pagePrev.disabled = state.page <= 1;
    _el.pageNext.disabled = state.page >= pages;
    applyZoom();
  }

  function applyZoom() {
    if (!_el || !_el.sheet) return;
    _el.sheet.style.transform = 'scale(' + state.zoom + ')';
    _el.zoomLbl.textContent = Math.round(state.zoom * 100) + '%';
  }

  function onResize() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(applyZoom, 100);
  }

  /* ============ modal ============ */
  function openModal(root) {
    var code = _el.code.value.trim().toUpperCase();
    if (!code) {
      toast(root, 'กรุณากรอกรหัสสินค้าก่อนสร้างเอกสาร', true);
      _el.code.focus();
      return;
    }
    if (!state.product || state.product.code !== code) {
      toast(root, 'กำลังโหลดข้อมูลสินค้า...');
      loadProduct(code, function (p) {
        if (!p) {
          toast(root, 'ไม่พบสินค้า ' + code, true);
          return;
        }
        state.product = p;
        _el.modalCode.textContent = p.code;
        loadUnits(p);
        applyTypeLock(radioValue('p092Type'));
        _el.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
      });
    } else {
      _el.modalCode.textContent = state.product.code;
      loadUnits(state.product);
      applyTypeLock(radioValue('p092Type'));
      _el.modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  function loadProduct(code, cb) {
    api('api/p092_search.php', { connectionId: CONNECTION, code: code })
      .then(function (d) {
        if (d && d.ok && d.product) { cb(d.product); return; }
        cb(MOCK[code] || null); /* fallback mock */
      })
      .catch(function () {
        cb(MOCK[code] || null);
      });
  }

  function closeModal(root) {
    _el.modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  function radioValue(name) {
    var r = _el.modal.querySelector('input[name="' + name + '"]:checked');
    return r ? r.value : '';
  }

  /* หน่วย — STKuname{1-5} ของสินค้านี้ (C# getSTKUname) — default = DefaultUnit */
  function loadUnits(p) {
    var units = productUnits(p);
    if (!units.length) {
      _el.unitSelect.innerHTML = '<option value="1">-</option>';
      _el.unitSelect.selectedIndex = 0;
      return;
    }
    _el.unitSelect.innerHTML = units.map(function (u) {
      return '<option value="' + u.idx + '">' + esc(u.name) + '</option>';
    }).join('');
    var def = p.defaultUnit || 1;
    var idx = -1;
    for (var i = 0; i < units.length; i++) {
      if (units[i].idx === def) { idx = i; break; }
    }
    _el.unitSelect.selectedIndex = idx < 0 ? 0 : idx;
  }

  /* type → size lock (C#): สคบ. = เล็ก (L/L2 disable + force small) · barcode = ทุก size */
  function applyTypeLock(type) {
    var isSklb = type !== 'barcode';
    var rL = document.getElementById('p092RadioL');
    var rL2 = document.getElementById('p092RadioL2');
    [rL, rL2].forEach(function (lab) {
      if (!lab) return;
      var input = lab.querySelector('input');
      lab.classList.toggle('disabled', isSklb);
      input.disabled = isSklb;
      if (isSklb && input.checked) input.checked = false;
    });
    if (isSklb) {
      var rS = _el.modal.querySelector('input[name="p092Size"][value="small"]');
      if (rS) rS.checked = true;
    }
  }

  /* ============ autocomplete (api/p092_autocomplete.php — 3 คอลั่น) ============ */
  var acIndex = -1;
  var acRows = [];

  function renderAc() {
    if (!_el || !_el.ac) return;
    var q = _el.code.value.trim().toUpperCase();
    acRows = [];
    acIndex = -1;
    _el.ac.innerHTML = '<div class="p092-ac-empty">กำลังค้นหา...</div>';
    _el.ac.classList.add('show');
    clearTimeout(_acTimer);
    _acTimer = setTimeout(function () {
      api('api/p092_autocomplete.php', { connectionId: CONNECTION, q: q })
        .then(function (d) {
          if (d && d.ok && Array.isArray(d.items)) {
            acRows = d.items;
          } else {
            acRows = mockAc(q);
          }
          paintAc();
        })
        .catch(function () {
          acRows = mockAc(q);
          paintAc();
        });
    }, 200);
  }

  function mockAc(q) {
    return Object.keys(MOCK).filter(function (c) { return !q || c.indexOf(q) !== -1; })
      .map(function (c) {
        return { code: c, name: MOCK[c].name, barcode: MOCK[c].stkBarcode };
      });
  }

  function paintAc() {
    if (!_el || !_el.ac) return;
    acIndex = acRows.length ? 0 : -1;
    var html = '<table><thead><tr><th style="width:90px">รหัส</th><th>ชื่อสินค้า</th><th style="width:110px">Barcode</th></tr></thead><tbody>';
    if (!acRows.length) {
      html += '<tr class="p092-ac-emptyrow"><td colspan="3">ไม่พบสินค้า</td></tr>';
    } else {
      acRows.forEach(function (r, i) {
        html += '<tr data-p092-code="' + esc(r.code) + '"' + (i === 0 ? ' class="p092-ac-active"' : '') + '>' +
          '<td class="p092-ac-code">' + esc(r.code) + '</td>' +
          '<td class="p092-ac-name">' + esc(r.name) + '</td>' +
          '<td class="p092-ac-bc">' + esc(r.barcode) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    _el.ac.innerHTML = html;
  }

  function closeAc() {
    if (_el && _el.ac) _el.ac.classList.remove('show');
    acIndex = -1;
  }

  function acSetActive(i) {
    var trs = _el.ac.querySelectorAll('tbody tr[data-p092-code]');
    if (!trs.length) return;
    if (i < 0) i = 0;
    if (i >= trs.length) i = trs.length - 1;
    acIndex = i;
    trs.forEach(function (t, j) { t.classList.toggle('p092-ac-active', j === i); });
    trs[i].scrollIntoView({ block: 'nearest' });
  }

  function acPick(code) {
    _el.code.value = code;
    state.product = null; /* บังคับ reload เมื่อเปิด modal */
    closeAc();
  }

  /* ============ render ============ */
  function renderRoot(root) {
    root.innerHTML =
      '<section class="p092-wrap">' +
      '  <div class="p092-launcher">' +
      '    <form id="p092Form" class="p092-form" autocomplete="off">' +
      '      <div class="p092-field">' +
      '        <label for="p092Code">รหัสสินค้า</label>' +
      '        <div class="p092-inputwrap">' +
      '          <input class="p092-input" id="p092Code" type="text" placeholder="กรอกรหัสสินค้า หรือ type เพื่อค้นหา" autocomplete="off">' +
      '          <div class="p092-ac" id="p092Ac"></div>' +
      '        </div>' +
      '      </div>' +
      '      <div class="p092-formactions">' +
      '        <button type="submit" class="p092-btn p092-btn--primary" id="p092Create">' + ICONS.plus + '<span>สร้างเอกสาร</span></button>' +
      '        <button type="button" class="p092-btn p092-btn--ghost" id="p092Clear">' + ICONS.reset + '<span>ล้างสินค้า</span></button>' +
      '      </div>' +
      '    </form>' +
      '  </div>' +
      '  <section class="p092-preview">' +
      '    <div class="p092-previewhead">' +
      '      <div class="p092-previewtitle">' +
      '        <h2>ตัวอย่าง Barcode / สคบ.</h2>' +
      '        <span class="p092-previewsub" id="p092Sub">กรอกรหัสสินค้า แล้วกด "สร้างเอกสาร"</span>' +
      '      </div>' +
      '      <div class="p092-tools">' +
      '        <div class="p092-seg">' +
      '          <button type="button" class="p092-segbtn" id="p092PagePrev" title="หน้าก่อนหน้า">' + ICONS.chevL + '</button>' +
      '          <span class="p092-pagelbl" id="p092PageLbl"></span>' +
      '          <button type="button" class="p092-segbtn" id="p092PageNext" title="หน้าถัดไป">' + ICONS.chevR + '</button>' +
      '        </div>' +
      '        <div class="p092-seg">' +
      '          <button type="button" class="p092-segbtn" id="p092ZoomOut" title="ย่อ">' + ICONS.minus + '</button>' +
      '          <span class="p092-zoomval" id="p092ZoomLbl"></span>' +
      '          <button type="button" class="p092-segbtn" id="p092ZoomIn" title="ขยาย">' + ICONS.plus + '</button>' +
      '        </div>' +
      '        <button type="button" class="p092-btn p092-btn--ghost" id="p092ZoomFit">' + ICONS.fit + '<span>พอดีจอ</span></button>' +
      '        <button type="button" class="p092-printbtn" id="p092Print">' + ICONS.print + '<span>Print</span></button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="p092-sheetwrap" id="p092SheetWrap">' +
      '      <div class="p092-empty" id="p092Empty">' +
      '        <div class="p092-emptytitle">ยังไม่มีสติกเกอร์</div>' +
      '        <div class="p092-emptysub">กรอกรหัสสินค้า แล้วกด "สร้างเอกสาร" — เลือกประเภท/ขนาด/จำนวน/หน่วย</div>' +
      '      </div>' +
      '      <div class="p092-sheets" id="p092Sheets"></div>' +
      '    </div>' +
      '  </section>' +
      '</section>' +
      '<div class="p092-toast" id="p092Toast" role="status"></div>';
  }

  function css() {
    return [
      ".p092-wrap{--p092-surface:var(--surface,#fff);--p092-surface2:var(--surface-2,#f8fafc);--p092-border:var(--border,#e2e8f0);--p092-muted:var(--muted-foreground,#64748b);--p092-primary:var(--accent,#2563eb);--p092-ink:var(--foreground,#0f172a);color:var(--p092-ink);min-height:100%;padding:22px 24px 0;background:var(--p092-surface2);font-family:'TH Sarabun New',Sarabun,sans-serif}",
      ".p092-launcher{display:flex;flex-wrap:wrap;gap:12px;align-items:end;padding:14px 16px 10px;border:1px solid var(--p092-border);border-radius:16px;background:var(--p092-surface);box-shadow:0 12px 30px rgba(15,23,42,.06)}",
      ".p092-field{display:grid;gap:6px;width:500px;max-width:100%}",
      ".p092-field label{color:#64748b;font-size:11px;font-weight:600}",
      ".p092-input{width:100%;height:44px;padding:0 12px;color:#172033;border:1px solid #e2e8f0;border-radius:11px;background:#fff;outline:0;font-size:13px;transition:.18s ease}",
      ".p092-input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
      ".p092-inputwrap{position:relative;width:100%}",
      ".p092-ac{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:50;display:none;max-height:280px;overflow:auto;border:1px solid var(--p092-border);border-radius:11px;background:#fff;box-shadow:0 18px 40px rgba(15,23,42,.18)}",
      ".p092-ac.show{display:block}",
      ".p092-ac table{width:100%;border-collapse:collapse;font-size:12px}",
      ".p092-ac th{position:sticky;top:0;padding:7px 10px;color:#64748b;border-bottom:1px solid var(--p092-border);background:#f8fafc;font-size:10px;font-weight:700;text-align:left}",
      ".p092-ac td{padding:8px 10px;border-bottom:1px solid #f1f5f9;color:#172033;white-space:nowrap}",
      ".p092-ac tr:last-child td{border-bottom:0}",
      ".p092-ac td.p092-ac-code{font-family:Consolas,monospace;font-weight:600}",
      ".p092-ac td.p092-ac-bc{color:#64748b;font-family:Consolas,monospace;font-size:11px}",
      ".p092-ac td.p092-ac-name{white-space:normal;min-width:120px}",
      ".p092-ac tbody tr[data-p092-code]{cursor:pointer}",
      ".p092-ac tbody tr:hover,.p092-ac tbody tr.p092-ac-active{background:#eff6ff}",
      ".p092-ac .p092-ac-empty,.p092-ac .p092-ac-emptyrow{padding:14px;text-align:center;color:#94a3b8;font-size:11px;cursor:default}",
      ".p092-form{display:flex;flex-wrap:wrap;gap:12px;align-items:end;width:100%}",
      ".p092-formactions{display:flex;gap:8px;align-items:end}",
      ".p092-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:10px 14px;border:1px solid var(--p092-border);border-radius:10px;background:var(--p092-surface);color:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:.15s ease;white-space:nowrap}",
      ".p092-btn:hover{border-color:var(--p092-primary);color:var(--p092-primary)}",
      ".p092-btn:disabled{opacity:.55;cursor:not-allowed}",
      ".p092-btn--primary{background:var(--p092-primary);border-color:var(--p092-primary);color:#fff}",
      ".p092-btn--primary:hover{filter:brightness(1.08);color:#fff}",
      ".p092-btn--ghost{background:transparent}",
      ".p092-preview{margin-top:14px;display:flex;flex-direction:column;min-height:420px;border:1px solid var(--p092-border);border-radius:16px;background:var(--p092-surface);box-shadow:0 12px 30px rgba(15,23,42,.06);overflow:hidden}",
      ".p092-previewhead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--p092-border)}",
      ".p092-previewtitle h2{margin:0;font-size:14px;font-weight:600}",
      ".p092-previewsub{color:var(--p092-muted);font-size:11px}",
      ".p092-tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}",
      ".p092-seg{display:inline-flex;align-items:center;gap:4px;padding:3px;border:1px solid var(--p092-border);border-radius:9px;background:var(--p092-surface2)}",
      ".p092-segbtn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border:0;border-radius:6px;background:transparent;color:var(--p092-ink);cursor:pointer}",
      ".p092-segbtn:hover{background:rgba(37,99,235,.10);color:var(--p092-primary)}",
      ".p092-segbtn:disabled{opacity:.4;cursor:not-allowed}",
      ".p092-pagelbl,.p092-zoomval{min-width:52px;text-align:center;font-size:11px;color:var(--p092-muted)}",
      ".p092-printbtn{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border:0;border-radius:10px;background:var(--p092-primary);color:#fff;font-size:12px;font-weight:600;cursor:pointer}",
      ".p092-printbtn:hover{filter:brightness(1.08)}",
      ".p092-printbtn:disabled{opacity:.5;cursor:not-allowed}",
      ".p092-sheetwrap{position:relative;flex:1;display:grid;place-items:center;overflow:auto;padding:28px;background:#585858}",
      ".p092-empty{display:grid;gap:4px;justify-items:center;color:#e2e8f0;font-size:12px}",
      ".p092-emptytitle{font-size:14px;font-weight:600}",
      ".p092-sheets{display:grid;grid-template-columns:1fr;gap:20px;justify-items:center}",
      /* sheet = กระดาษ A4 (sticker หลายหน้าต่อหนึ่ง A4) */
      ".p092-sheet{display:inline-block;background:#fff;box-shadow:0 22px 48px rgba(0,0,0,.35);transform-origin:center center}",
      /* sticker — ขนาดตาม C# (pt → mm) */
      ".p092-sticker{box-sizing:border-box;background:#fff;color:#000;font-family:'TH Sarabun New',Sarabun,sans-serif}",
      ".p092-st-small{width:292pt;height:76pt}",
      ".p092-st-medium{width:288pt;height:99pt}",
      ".p092-st-large{width:100mm;height:100mm}",
      ".p092-st-large10x7{width:100mm;height:70mm}",
      ".p092-grid{width:100%;height:100%;border-collapse:collapse;table-layout:fixed}",
      ".p092-grid td{vertical-align:top;overflow:hidden}",
      ".p092-border td{border:1px solid #000}",
      ".p092-pad8{padding-left:8pt;padding-top:8pt}",
      ".p092-pad6{padding-left:6pt;padding-top:10pt}",
      ".p092-g5{width:292pt}",
      ".p092-g5 col:nth-child(1),.p092-g5 col:nth-child(3),.p092-g5 col:nth-child(5){width:92pt}",
      ".p092-g5 col:nth-child(2),.p092-g5 col:nth-child(4){width:5pt}",
      ".p092-g2{width:288pt}",
      ".p092-g2 col:nth-child(1){width:143pt}",
      ".p092-g2 col:nth-child(2){width:145pt}",
      ".p092-g2m{width:288pt}",
      ".p092-g2m col:nth-child(1){width:143pt}",
      ".p092-g2m col:nth-child(2){width:145pt}",
      ".p092-gl{width:99mm}",
      ".p092-gl col:nth-child(1){width:33mm}",
      ".p092-gl col:nth-child(2){width:66mm}",
      /* fonts — TH Sarabun (C# font sizes pt) */
      ".p092-f6{font-size:6px}",
      ".p092-f9{font-size:9pt}",
      ".p092-f10{font-size:10pt}",
      ".p092-f12{font-size:12pt}",
      ".p092-f14{font-size:14pt}",
      ".p092-f17{font-size:17pt}",
      ".p092-f40{font-size:40pt}",
      ".p092-f58{font-size:58pt}",
      ".p092-f8px{font-size:8px}",
      ".p092-f9px{font-size:9px}",
      ".p092-f6-b{font-weight:700}",
      ".p092-f9-b{font-weight:700}",
      ".p092-f12-b{font-weight:700}",
      ".p092-f17-b{font-weight:700}",
      /* cells */
      ".p092-cell{padding:2mm 0 0 2.5mm;line-height:1.25}",
      ".p092-cell-m{height:31mm;padding:2mm 0 0 2mm;vertical-align:middle;display:flex;align-items:center}",
      ".p092-cell-l{height:52mm;padding:1.5mm 0 0 3mm;vertical-align:middle;display:flex;align-items:center}",
      ".p092-cell-l7{height:36mm;padding:1mm 0 0 3mm;vertical-align:middle;display:flex;align-items:center}",
      ".p092-c{text-align:center}",
      ".p092-btbr{border-top:1px solid #000;border-left:1px solid #000;border-right:1px solid #000}",
      ".p092-bbbr{border-bottom:1px solid #000;border-left:1px solid #000;border-right:1px solid #000}",
      ".p092-eanrow{height:15mm;display:flex;align-items:center;justify-content:center}",
      ".p092-ean{display:block}",
      ".p092-ean-fb{font-family:Consolas,monospace;font-size:12pt;letter-spacing:2px}",
      ".p092-mid{text-align:center;padding-top:1.5mm}",
      ".p092-snrow{padding:1mm 0 0 2mm;display:flex;align-items:center;justify-content:flex-end;gap:2mm}",
      ".p092-snrow-l{padding-top:2.5mm}",
      ".p092-snlabel{white-space:nowrap}",
      /* modal */
      ".p092-modalbackdrop{position:fixed;inset:0;z-index:100;display:none;padding:18px;place-items:center;background:rgba(15,23,42,.48);backdrop-filter:blur(4px)}",
      ".p092-modalbackdrop.show{display:grid}",
      ".p092-modal{width:min(560px,100%);overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 28px 72px rgba(15,23,42,.35)}",
      ".p092-modalhead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid var(--p092-border)}",
      ".p092-modalhead h2{margin:0;font-size:16px;font-weight:600}",
      ".p092-modalhead p{margin:1px 0 0;color:var(--p092-muted);font-size:10px}",
      ".p092-modalclose{display:grid;width:34px;height:34px;place-items:center;color:var(--p092-muted);border:0;border-radius:9px;background:#f1f5f9;font-size:20px;cursor:pointer}",
      ".p092-modalclose:hover{color:#dc2626;background:#fef2f2}",
      ".p092-modalbody{display:grid;gap:16px;padding:18px}",
      ".p092-setgroup{padding:14px;border:1px solid var(--p092-border);border-radius:13px;background:var(--p092-surface2)}",
      ".p092-setgroup h3{margin:0 0 11px;font-size:13px;font-weight:600}",
      ".p092-optgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}",
      ".p092-radio{display:flex;align-items:center;gap:8px;min-height:44px;padding:10px 11px;border:1px solid var(--p092-border);border-radius:10px;background:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:.15s ease}",
      ".p092-radio:hover{border-color:#93c5fd;background:#eff6ff}",
      ".p092-radio input{width:17px;height:17px;accent-color:var(--p092-primary);cursor:pointer}",
      ".p092-radio.disabled{color:#94a3b8;border-color:#e5e7eb;background:#f8fafc;cursor:not-allowed}",
      ".p092-radio.disabled input{cursor:not-allowed}",
      ".p092-qtygrid{display:grid;grid-template-columns:1fr minmax(150px,.8fr);gap:12px}",
      ".p092-mfield label{display:block;margin-bottom:6px;color:var(--p092-muted);font-size:11px;font-weight:700}",
      ".p092-mfield input,.p092-mfield select{width:100%;height:44px;padding:0 12px;color:#172033;border:1px solid var(--p092-border);border-radius:10px;outline:0;background:#fff;font-size:13px}",
      ".p092-mfield input:focus,.p092-mfield select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
      ".p092-previnfo{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:11px;background:#eff6ff;font-size:11px}",
      ".p092-previnfo strong{font-size:13px}",
      ".p092-modalfoot{display:flex;justify-content:flex-end;gap:8px;padding:13px 18px;border-top:1px solid var(--p092-border);background:var(--p092-surface2)}",
      ".p092-modalfoot .p092-btn{height:41px;font-size:12px}",
      ".p092-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}",
      ".p092-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
      ".p092-toast.error{background:#dc2626}",
      /* print — 1 iteration = 1 หน้า (C# = PDF 1 หน้า/iteration — @page size = ขนาดกระดาษ — set dynamic ใน doPrint) */
      "@media print{" +
      "body{margin:0 !important;padding:0 !important}" +
      "body > *:not(.p092-printroot){display:none !important}" +
      ".p092-printroot{margin:0 !important;padding:0 !important}" +
      ".p092-printroot .p092-sticker{box-shadow:none;page-break-after:always;break-after:page}" +
      ".p092-printroot .p092-sticker:last-child{page-break-after:auto;break-after:auto}" +
      ".p092-printroot .p092-st-small{width:292pt;height:76pt}" +
      ".p092-printroot .p092-st-medium{width:288pt;height:99pt}" +
      ".p092-printroot .p092-st-large{width:282pt;height:282pt}" +
      ".p092-printroot .p092-st-large10x7{width:282pt;height:210pt}" +
      "}"
    ].join('\n');
  }

  window.P092Barcode = {
    mount: function (root) {
      renderRoot(root);
      var style = document.createElement('style');
      style.textContent = css();
      root.appendChild(style);

      _el = {
        root: root,
        form: document.getElementById('p092Form'),
        code: document.getElementById('p092Code'),
        ac: document.getElementById('p092Ac'),
        btnCreate: document.getElementById('p092Create'),
        btnClear: document.getElementById('p092Clear'),
        sub: document.getElementById('p092Sub'),
        empty: document.getElementById('p092Empty'),
        sheets: document.getElementById('p092Sheets'),
        sheetWrap: document.getElementById('p092SheetWrap'),
        sheet: null,
        pageLbl: document.getElementById('p092PageLbl'),
        pagePrev: document.getElementById('p092PagePrev'),
        pageNext: document.getElementById('p092PageNext'),
        zoomLbl: document.getElementById('p092ZoomLbl'),
        zoomIn: document.getElementById('p092ZoomIn'),
        zoomOut: document.getElementById('p092ZoomOut'),
        zoomFit: document.getElementById('p092ZoomFit'),
        printBtn: document.getElementById('p092Print'),
        toast: document.getElementById('p092Toast'),
        modal: null, modalCode: null,
        qtyInput: null, unitSelect: null,
        btnCancel: null, btnConfirm: null, modalClose: null
      };

      /* modal */
      var mhtml =
        '<div class="p092-modalbackdrop" id="p092Modal">' +
        '  <section class="p092-modal" role="dialog" aria-modal="true">' +
        '    <div class="p092-modalhead">' +
        '      <div><h2>ตั้งค่าการพิมพ์ Barcode/สคบ.</h2><p>เลือกประเภทเอกสาร ขนาด จำนวน และหน่วยก่อนสร้าง</p></div>' +
        '      <button type="button" class="p092-modalclose" id="p092ModalClose" aria-label="ปิด">×</button>' +
        '    </div>' +
        '    <div class="p092-modalbody">' +
        '      <section class="p092-setgroup"><h3>ประเภทเอกสาร</h3>' +
        '        <div class="p092-optgrid">' +
        '          <label class="p092-radio"><input type="radio" name="p092Type" value="สคบ" checked>สคบ.</label>' +
        '          <label class="p092-radio"><input type="radio" name="p092Type" value="barcode">Barcode</label>' +
        '        </div>' +
        '      </section>' +
        '      <section class="p092-setgroup"><h3>ขนาดเอกสาร</h3>' +
        '        <div class="p092-optgrid">' +
        '          <label class="p092-radio"><input type="radio" name="p092Size" value="small" checked>เล็ก</label>' +
        '          <label class="p092-radio"><input type="radio" name="p092Size" value="medium">กลาง</label>' +
        '          <label class="p092-radio disabled" id="p092RadioL"><input type="radio" name="p092Size" value="large" disabled>ใหญ่</label>' +
        '          <label class="p092-radio disabled" id="p092RadioL2"><input type="radio" name="p092Size" value="large10x7" disabled>ใหญ่ (10×7)</label>' +
        '        </div>' +
        '      </section>' +
        '      <section class="p092-setgroup"><h3>จำนวน / หน่วย</h3>' +
        '        <div class="p092-qtygrid">' +
        '          <div class="p092-mfield"><label for="p092Qty">จำนวน</label><input id="p092Qty" type="number" min="0.5" step="0.5" value="1"></div>' +
        '          <div class="p092-mfield"><label for="p092Unit">หน่วย</label><select id="p092Unit"></select></div>' +
        '        </div>' +
        '      </section>' +
        '      <div class="p092-previnfo"><span>รหัสสินค้าที่เลือก</span><strong id="p092ModalCode"></strong></div>' +
        '    </div>' +
        '    <div class="p092-modalfoot">' +
        '      <button type="button" class="p092-btn p092-btn--ghost" id="p092Cancel">ยกเลิก</button>' +
        '      <button type="button" class="p092-btn p092-btn--primary" id="p092Confirm">' + ICONS.plus + '<span>สร้างเอกสาร</span></button>' +
        '    </div>' +
        '  </section>' +
        '</div>';
      root.insertAdjacentHTML('beforeend', mhtml);
      _el.modal = document.getElementById('p092Modal');
      _el.modalCode = document.getElementById('p092ModalCode');
      _el.qtyInput = document.getElementById('p092Qty');
      _el.unitSelect = document.getElementById('p092Unit');
      _el.btnCancel = document.getElementById('p092Cancel');
      _el.btnConfirm = document.getElementById('p092Confirm');
      _el.modalClose = document.getElementById('p092ModalClose');

      _el.form.addEventListener('submit', function (e) {
        e.preventDefault();
        closeAc();
        openModal(root);
      });

      /* type radio → size lock (C# CheckedChanged) */
      _el.modal.querySelectorAll('input[name="p092Type"]').forEach(function (r) {
        r.addEventListener('change', function () {
          applyTypeLock(r.value);
        });
      });

      /* autocomplete */
      _el.code.addEventListener('input', function () { renderAc(); });
      _el.code.addEventListener('focus', function () { renderAc(); });
      _el.code.addEventListener('keydown', function (e) {
        if (!_el.ac.classList.contains('show')) return;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          acSetActive(acIndex + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          acSetActive(acIndex - 1);
        } else if (e.key === 'Enter') {
          var tr = _el.ac.querySelector('tbody tr.p092-ac-active');
          if (tr && tr.getAttribute('data-p092-code')) {
            e.preventDefault();
            acPick(tr.getAttribute('data-p092-code'));
          }
        } else if (e.key === 'Escape') {
          closeAc();
        }
      });
      _el.ac.addEventListener('mousedown', function (e) {
        var tr = e.target.closest ? e.target.closest('tbody tr[data-p092-code]') : null;
        if (tr) {
          e.preventDefault();
          acPick(tr.getAttribute('data-p092-code'));
        }
      });
      _el.code.addEventListener('blur', function () {
        setTimeout(closeAc, 150);
      });

      /* confirm — สร้างเอกสาร */
      _el.btnConfirm.addEventListener('click', function () {
        var code = _el.code.value.trim().toUpperCase();
        if (!code) {
          toast(root, 'กรุณากรอกรหัสสินค้า', true);
          return;
        }
        var q = Number(_el.qtyInput.value);
        if (!isFinite(q) || q < 0.5) q = 0.5;
        _el.qtyInput.value = q;

        state.type = radioValue('p092Type') || 'สคบ';
        state.size = radioValue('p092Size') || 'small';
        state.quantity = q;
        state.unitIdx = parseInt(_el.unitSelect.value, 10) || 1;

        function proceed(p) {
          state.product = p;
          /* barcode type — Barcode{unit} ว่าง (DB ไม่มีข้อมูล) = fallback รหัส pad 12 ตัว (ไม่ error) */
          /* S/N running — size2&&type2 || size3 || size4 (C# getRunning — size4 ใช้แต่ไม่ save — web save ทั้งหมด) */
          var needSN = (state.size === 'medium' && state.type === 'barcode') || state.size === 'large' || state.size === 'large10x7';
          if (needSN) {
            api('api/p092_running.php', { connectionId: CONNECTION, code: p.code, save: false })
              .then(function (d) {
                state.running = (d && d.ok) ? (d.running || 0) : 0;
                finishCreate();
              })
              .catch(function () {
                state.running = 0;
                finishCreate();
              });
          } else {
            state.running = 0;
            finishCreate();
          }
        }

        function finishCreate() {
          state.created = true;
          state.page = 1;
          /* สคบ. เล็ก = zoom 200% (กระดาษเล็ก — ดูให้ชัด) */
          state.zoom = (state.type === 'สคบ' && state.size === 'small') ? 2.0 : 1.0;
          _el.empty.style.display = 'none';
          var snLabel = state.running ? ' · S/N #' + (state.running + 1) : '';
          _el.sub.textContent = 'สินค้า ' + state.product.code + ' · ' + state.type + ' · ' + state.size + ' · ' + state.quantity + ' ' + getUnitName(state.product) + snLabel;
          renderPage();
          closeModal(root);
          toast(root, 'สร้าง' + state.type + ' ' + state.quantity + ' ' + getUnitName(state.product) + ' เรียบร้อยแล้ว');
        }

        if (state.product && state.product.code === code) {
          proceed(state.product);
        } else {
          loadProduct(code, function (p) {
            if (!p) {
              toast(root, 'ไม่พบสินค้า ' + code, true);
              return;
            }
            proceed(p);
          });
        }
      });

      _el.modalClose.addEventListener('click', function () { closeModal(root); });
      _el.btnCancel.addEventListener('click', function () { closeModal(root); });
      _el.modal.addEventListener('click', function (e) {
        if (e.target === _el.modal) closeModal(root);
      });

      _el.btnClear.addEventListener('click', function () {
        _el.code.value = '';
        closeAc();
        state.product = null;
        state.created = false;
        _el.sheets.innerHTML = '';
        _el.sheet = null;
        _el.empty.style.display = '';
        _el.sub.textContent = 'กรอกรหัสสินค้า แล้วกด "สร้างเอกสาร"';
        _el.pageLbl.textContent = '';
        _el.code.focus();
        toast(root, 'ล้างข้อมูลสินค้าแล้ว');
      });

      _el.pagePrev.addEventListener('click', function () {
        state.page--;
        renderPage();
      });
      _el.pageNext.addEventListener('click', function () {
        state.page++;
        renderPage();
      });
      _el.zoomIn.addEventListener('click', function () {
        state.zoom = Math.min(2.0, state.zoom + 0.1);
        applyZoom();
      });
      _el.zoomOut.addEventListener('click', function () {
        state.zoom = Math.max(0.25, state.zoom - 0.1);
        applyZoom();
      });
      _el.zoomFit.addEventListener('click', function () {
        state.zoom = 1.0;
        applyZoom();
      });

      _el.sheetWrap.addEventListener('wheel', function (e) {
        if (!state.created) return;
        e.preventDefault();
        if (e.deltaY > 0) {
          if (state.page < pagesCount()) { state.page++; renderPage(); }
        } else if (e.deltaY < 0) {
          if (state.page > 1) { state.page--; renderPage(); }
        }
      }, { passive: false });

      /* print — render ทั้งหมดใน .p092-printroot ระดับ body (C# = PDF → print)
         save S/N running เงื่อนไข (size2&&type2) || size3 (C# — size4 ไม่ save — web save ด้วย) */
      _el.printBtn.addEventListener('click', function () {
        if (!state.created || !state.quantity) {
          toast(root, 'กรุณาสร้างเอกสารก่อนสั่งพิมพ์', true);
          return;
        }
        /* save running = (size2&&type2) || size3 เท่านั้น (C# — 10x7 ใช้ S/N แต่ไม่ save) */
        var saveSN = (state.size === 'medium' && state.type === 'barcode') || state.size === 'large';
        /* @page size = ขนาดกระดาษ (C# — 1 iteration = 1 หน้า PDF — landscape = กว้าง > สูง) */
        var PAGE_SIZES = {
          small: { size: '292pt 76pt', orient: 'landscape' },
          medium: { size: '288pt 99pt', orient: 'landscape' },
          large: { size: '282pt 282pt', orient: 'portrait' },
          large10x7: { size: '282pt 210pt', orient: 'landscape' }
        };
        var ps = PAGE_SIZES[state.size] || { size: 'A4', orient: 'portrait' };
        var pageStyle = document.createElement('style');
        pageStyle.id = 'p092PageSize';
        pageStyle.textContent = '@media print{ @page{ size:' + ps.size + ' ' + ps.orient + '; margin:0 } }';
        document.head.appendChild(pageStyle);
        function doPrint() {
          var html = '';
          var n = Math.ceil(state.quantity);
          for (var i = 0; i < n; i++) {
            html += stickerHTML(i);
          }
          var holder = document.createElement('div');
          holder.className = 'p092-printroot';
          holder.innerHTML = html;
          document.body.appendChild(holder);
          setTimeout(function () {
            window.print();
            document.body.removeChild(holder);
            var old = document.getElementById('p092PageSize');
            if (old) old.parentNode.removeChild(old);
          }, 150);
        }
        if (saveSN) {
          api('api/p092_running.php', { connectionId: CONNECTION, code: state.product.code, save: true })
            .then(function (d) {
              if (d && d.ok) state.running = d.running;
              doPrint();
            })
            .catch(function () {
              doPrint();
            });
        } else {
          doPrint();
        }
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal(root);
      });

      window.addEventListener('resize', onResize);
      _el.code.focus();
    },
    destroy: function () {
      window.removeEventListener('resize', onResize);
      clearTimeout(_resizeTimer);
      clearTimeout(_toastTimer);
      clearTimeout(_acTimer);
      document.body.style.overflow = '';
      _el = null;
    }
  };
})();
