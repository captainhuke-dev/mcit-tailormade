/* P127 — Barcode ห้าง (UI only — ตามตัวอย่าง demo/P127_demo.html)
 * - Launcher "Barcode Store" + ปุ่ม เพิ่มสินค้า/Refresh + ค้นหา (รหัสสินค้า MAC5 / ชื่อสินค้า MAC5)
 * - Summary 4 การ์ด + ตาราง 8 คอลั่น (สอร์ตได้) + ปุ่ม Edit/Print แต่ละแถว
 * - Modal แก้ไข (ทุกฟิลด์ + barcode preview) + toast + พิมพ์ label 80mm
 * - Mock data (ยังไม่มี API/DB)
 */
(function () {
  "use strict";

  /* ---------- CSS (scoped ด้วย .p127-app) ---------- */
  var CSS = [
    ".p127-app{display:block}",
    /* launcher */
    ".p127-app .p127-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p127-app .p127-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p127-app .p127-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px;white-space:nowrap}",
    ".p127-app .p127-launcher-title svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-launcher-body{display:grid;grid-template-columns:1fr;gap:20px;padding:18px 20px;background:linear-gradient(180deg,#e4fbfd,#edfafd)}",
    ".p127-app .p127-action-menu{display:flex;flex-wrap:wrap;gap:10px}",
    ".p127-app .p127-main-action{display:inline-flex;min-height:49px;align-items:center;justify-content:center;gap:8px;padding:0 12px;border:1px solid #b6c5d8;border-radius:10px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.16s ease}",
    ".p127-app .p127-main-action svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-main-action.p127-add{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}",
    ".p127-app .p127-main-action.p127-refresh{color:#047857;border-color:#a7f3d0;background:#ecfdf5}",
    ".p127-app .p127-main-action:hover{transform:translateY(-1px);filter:brightness(.98)}",
    /* panel */
    ".p127-app .p127-panel{display:flex;min-height:470px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p127-app .p127-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p127-app .p127-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p127-app .p127-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p127-app .p127-panel-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-panel-title h2{font-size:14px;margin:0}",
    ".p127-app .p127-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p127-app .p127-badge{padding:5px 11px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p127-app .p127-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p127-app .p127-table-wrap table{width:100%;min-width:1160px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p127-app .p127-table-wrap th{position:sticky;top:0;z-index:2;padding:10px 12px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p127-app .p127-table-wrap th.p127-sortable{cursor:pointer}",
    ".p127-app .p127-table-wrap th.p127-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p127-app .p127-table-wrap th.p127-sorted{color:#1d4ed8;background:#e0ecff}",
    ".p127-app .p127-table-wrap td{max-width:320px;overflow:hidden;padding:7px 12px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p127-app .p127-table-wrap th.p127-center,.p127-app .p127-table-wrap td.p127-center{text-align:center}",
    ".p127-app .p127-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p127-app .p127-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p127-app .p127-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p127-app .p127-table-wrap tbody tr.p127-active td{color:#fff;background:#0878d1}",
    ".p127-app .p127-row-button{height:27px;min-width:49px;padding:0 9px;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:6px;background:#eff6ff;font-size:11px;font-weight:700;cursor:pointer}",
    ".p127-app .p127-row-button.p127-print{color:#047857;border-color:#a7f3d0;background:#ecfdf5}",
    ".p127-app .p127-row-button:hover{color:#fff;background:#2563eb}",
    ".p127-app .p127-row-button.p127-print:hover{background:#059669}",
    ".p127-app .p127-product-code{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p127-app .p127-new-code{color:#7c3aed;font-family:Arial,sans-serif;font-weight:700}",
    ".p127-app .p127-unit-tag{display:inline-flex;padding:3px 8px;color:#334155;border-radius:6px;background:#e2e8f0;font-family:Arial,sans-serif;font-size:11px;font-weight:700}",
    ".p127-app .p127-table-wrap tbody tr.p127-active .p127-product-code,.p127-app .p127-table-wrap tbody tr.p127-active .p127-new-code{color:#fff}",
    ".p127-app .p127-table-wrap tbody tr.p127-active .p127-unit-tag{color:#fff;background:rgba(255,255,255,.22)}",
    ".p127-app .p127-empty-state{display:none;min-height:270px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p127-app .p127-empty-state.p127-show{display:flex}",
    ".p127-app .p127-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-empty-state strong{font-size:13px}",
    ".p127-app .p127-empty-state p{margin-top:5px;font-size:11px}",
    ".p127-app .p127-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    /* quick search */
    ".p127-app .p127-quick-search{display:flex;align-items:center;gap:6px;margin:0 auto}",
    ".p127-app .p127-quick-search svg{width:16px;height:16px;fill:none;stroke:#64748b;stroke-linecap:round;stroke-linejoin:round;stroke-width:2;flex:0 0 auto}",
    ".p127-app .p127-quick-search input{width:240px;height:34px;padding:0 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p127-app .p127-quick-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    /* pagination */
    ".p127-app .p127-pagination{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 12px;border-top:1px solid #dbe3ef;background:#f8fafc}",
    ".p127-app .p127-page-btn{min-width:34px;height:34px;padding:0 8px;color:#334155;border:1px solid #b6c5d8;border-radius:8px;background:#fff;font-size:12px;font-weight:700;cursor:pointer;transition:.16s ease}",
    ".p127-app .p127-page-btn:hover{border-color:#60a5fa}",
    ".p127-app .p127-page-btn.p127-active{color:#fff;border-color:#1d4ed8;background:#1d4ed8}",
    ".p127-app .p127-page-btn:disabled{color:#b6c5d8;border-color:#dbe3ef;background:#f1f5f9;cursor:not-allowed}",
    /* modal */
    ".p127-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.54);backdrop-filter:blur(4px)}",
    ".p127-modal-backdrop.p127-show{display:grid}",
    ".p127-modal{display:flex;width:min(880px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.35);animation:p127-modal-open .18s ease}",
    "@keyframes p127-modal-open{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}",
    ".p127-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p127-modal-header h2{font-size:15px;margin:0}",
    ".p127-modal-close{width:31px;height:31px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px;cursor:pointer}",
    ".p127-modal-close:hover{background:#dc2626}",
    ".p127-modal-body{overflow-y:auto;padding:20px;background:#f8fafc}",
    ".p127-modal-grid{display:grid;grid-template-columns:1fr;gap:12px}",
    ".p127-modal-field{display:grid;grid-template-columns:150px 1fr;column-gap:12px;align-items:center}",
    ".p127-pick-wrap{position:relative;display:flex;align-items:center;gap:8px}",
    ".p127-suggest{display:none;position:absolute;top:100%;left:0;z-index:10;min-width:100%;margin-top:4px;max-height:220px;overflow-y:auto;border:1px solid #b6c5d8;border-radius:8px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.18)}",
    ".p127-suggest.p127-show{display:block}",
    ".p127-suggest-item{display:flex;gap:10px;padding:8px 12px;border-bottom:1px solid #e5ebf3;font-size:12px;cursor:pointer}",
    ".p127-suggest-item:hover{background:#eff6ff}",
    ".p127-suggest-item .p127-suggest-code{font-family:Arial,sans-serif;font-weight:700;color:#1d4ed8;min-width:70px}",
    ".p127-suggest-item .p127-suggest-group{color:#64748b}",
    ".p127-suggest-empty{padding:10px 12px;color:#64748b;font-size:12px}",
    ".p127-modal-field label{color:#7c2d12;font-size:12px;font-weight:700;text-align:right}",
    ".p127-modal-field label.p127-optional{color:#334155}",
    ".p127-modal-field input{width:100%;height:38px;padding:0 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p127-modal-field textarea{width:100%;min-height:67px;padding:9px 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px;resize:vertical}",
    ".p127-modal-field input:focus,.p127-modal-field textarea:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p127-modal-field input[readonly],.p127-modal-field textarea[readonly]{background:#e8edf3;color:#64748b}",
    ".p127-modal-divider{grid-column:1/-1;height:1px;margin:3px 0;background:#dbe3ef}",
    ".p127-modal-footer{display:flex;justify-content:center;gap:10px;padding:13px 20px;border-top:1px solid #dbe3ef;background:#fff}",
    ".p127-modal-button{display:inline-flex;height:41px;align-items:center;gap:7px;padding:0 18px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer}",
    ".p127-modal-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-modal-button.p127-save{color:#fff;border:0;background:#059669}",
    ".p127-modal-button.p127-cancel{color:#475569;border:1px solid #dbe3ef;background:#fff}",
    /* toast */
    ".p127-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p127-toast.p127-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p127-toast svg{width:16px;height:16px;color:#34d399;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* print preview modal */
    ".p127-modal.p127-print-modal{width:min(440px,100%)}",
    ".p127-print-body{display:grid;place-items:center;padding:24px;background:#e3eaf3}",
    "#p127PrintPreview>div{border:1px solid #c7d2e0;box-shadow:0 10px 30px rgba(15,23,42,.22);border-radius:2px}",
    /* font THSarabunNew (ตาม C# createPdf — font/THSarabunNew.ttf) */
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Italic.ttf') format('truetype');font-weight:400;font-style:italic}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew BoldItalic.ttf') format('truetype');font-weight:700;font-style:italic}",
    /* font EAN13 (ตาม C# BaseFont.CreateFont(@"font/ean13.ttf")) */
    "@font-face{font-family:'EAN13';src:url('assets/fonts/ean13.ttf') format('truetype')}",
    /* ขนาดกระดาษตาม C# Document(new Rectangle(282f, 210f), 1f, 1f, 1f, 1f) — หน้ากระดาษ 1f ทั้ง 4 ด้าน */
    "@page{size:282pt 210pt;margin:1pt}",
    /* print (label 80mm) */
    ".p127-app #p127PrintArea{display:none}",
    "@media print{",
    "  body *{visibility:hidden !important}",
    "  #p127PrintArea,#p127PrintArea *{visibility:visible !important}",
    "  #p127PrintArea{position:absolute;top:0;left:0;display:block;width:100%}",
    "}",
    /* responsive */
    "@media (max-width:900px){",
    "  .p127-app .p127-launcher-body{grid-template-columns:1fr}",
    "  .p127-app .p127-action-menu{display:flex;flex-wrap:wrap}",
    "}",
    "@media (max-width:680px){",
    "  .p127-modal-grid{grid-template-columns:1fr}",
    "  .p127-modal-divider{grid-column:auto}",
    "  .p127-app .p127-panel-header,.p127-app .p127-panel-footer{align-items:flex-start;flex-direction:column}",
    "  .p127-modal-backdrop{padding:8px}",
    "}"
  ];

  /* ---------- mock data (UI only) ---------- */
  var products = [
    {
      id: 1,
      mac5Code: "10010415",
      mac5Name: "(1137193)กรองแสง-1เข็มล็อคตา(การ์เดน-V1) 50% สีดำ 2×100m [Ea]",
      newCode: "1137193",
      newName: "สแลนผ้า 50% ไข่ม สีดำ",
      size: "2×100 หลา",
      unit: "1 Ea",
      usage: "ตาข่ายกรองแสง เหมาะสำหรับใช้ทำหลังคา/เรือนเพาะชำ/คลุมแปลงเกษตร/ย้อมสี/กันลม/บังทาง",
      storage: "เดือน/ปี มีจุดบ่ง",
      warning: "ห้ามวางใกล้แหล่งกำเนิดความร้อน",
      manufacturer: "บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด\n58/9 ม.6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร",
      barcode: "240000147621"
    },
    {
      id: 2,
      mac5Code: "10010416",
      mac5Name: "(1137222)กรองแสง-1เข็มล็อคตา(การ์เดน-V1) 60% ดำ 2×90m [Ea]",
      newCode: "1137222",
      newName: "สแลนผ้า 60% ไข่ม สีดำ",
      size: "2×100 หลา",
      unit: "1 Ea",
      usage: "ใช้สำหรับกรองแสง คลุมโรงเรือนเกษตร และป้องกันแสงแดด",
      storage: "เดือน/ปี มีจุดบ่ง",
      warning: "ห้ามวางใกล้แหล่งกำเนิดความร้อน",
      manufacturer: "บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด\n58/9 ม.6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร",
      barcode: "240000147622"
    },
    {
      id: 3,
      mac5Code: "10230031",
      mac5Name: "255316 แผ่นไพลี่ลูกฟูก(Aurora) 5mm F",
      newCode: "255316",
      newName: "แผ่นไพลี่ สีรุ้ง เกรด F R12",
      size: "122×244×0.6 cm.",
      unit: "1 Ea",
      usage: "ใช้สำหรับงานบรรจุภัณฑ์และงานอเนกประสงค์",
      storage: "เก็บในที่แห้ง",
      warning: "หลีกเลี่ยงความชื้นและของมีคม",
      manufacturer: "บริษัทตัวอย่าง จำกัด",
      barcode: "240000255316"
    },
    {
      id: 4,
      mac5Code: "10230033",
      mac5Name: "279187-(ET-กึ่งสว่าง) ชุดน้ำ-HD(PVC) ขนาด",
      newCode: "279187",
      newName: "ตัวถัง H พลาสติกนูนระบบ UPVC",
      size: "250 cm.",
      unit: "70 Ea/กล่อง",
      usage: "ใช้กับระบบท่อและอุปกรณ์ PVC",
      storage: "เก็บให้ห่างจากแสงแดดโดยตรง",
      warning: "ตรวจสอบขนาดก่อนติดตั้ง",
      manufacturer: "บริษัทตัวอย่าง จำกัด",
      barcode: "240000279187"
    },
    {
      id: 5,
      mac5Code: "10010246",
      mac5Name: "กรองแสง-3เข็ม(ไก่ชน-MCT) 80% ดำ 2×90m [Ea]",
      newCode: "10010246",
      newName: "สแลนผ้า 80% สีดำ",
      size: "2×10 เมตร",
      unit: "1 Ea",
      usage: "ใช้บังแดดและควบคุมแสงในพื้นที่เกษตร",
      storage: "เดือน/ปี มีจุดบ่ง",
      warning: "เก็บให้ห่างจากเปลวไฟ",
      manufacturer: "บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด",
      barcode: "240000100246"
    }
  ];

  var PAGE_SIZE = 15;

  var state = {
    items: [],
    currentId: null,
    editingId: null,
    page: 1,
    sortField: "mac5Code",
    sortDirection: "asc"
  };

  var els = {};
  var toastTimer = null;

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    els.toastMessage.textContent = msg;
    els.toast.classList.add("p127-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("p127-show"); }, 1900);
  }

  function sortItems(items) {
    var arr = items.slice();
    arr.sort(function (a, b) {
      var f = String(a[state.sortField] || "").toLocaleLowerCase("th");
      var s = String(b[state.sortField] || "").toLocaleLowerCase("th");
      if (f < s) return state.sortDirection === "asc" ? -1 : 1;
      if (f > s) return state.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }

  function updateSortIndicators() {
    var headers = els.app.querySelectorAll("th[data-sort]");
    for (var i = 0; i < headers.length; i++) {
      var h = headers[i];
      var active = h.getAttribute("data-sort") === state.sortField;
      h.classList.toggle("p127-sorted", active);
      var arrow = h.querySelector(".p127-arrow");
      if (arrow) arrow.textContent = active ? (state.sortDirection === "asc" ? "▲" : "▼") : "";
    }
  }

  function findProduct(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function updateSummary(items) {
    var current = findProduct(state.currentId);
    els.resultBadge.textContent = items.length + " รายการ";
    els.footerText.textContent = "แสดง " + items.length + " รายการ";
    els.selectedText.textContent = current
      ? "เลือก: " + current.mac5Code + " · " + current.newCode
      : "ยังไม่ได้เลือกแถว";
  }

  function renderRows() {
    var sorted = sortItems(state.items);
    els.rows.innerHTML = "";
    updateSortIndicators();
    updateSummary(sorted);

    // pagination: 15 รายการ/หน้า + ปุ่มหน้าอย่างน้อย 5 ปุ่ม (sliding window)
    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var startIdx = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(startIdx, startIdx + PAGE_SIZE);

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.emptyState.classList.add("p127-show");
      els.pagination.innerHTML = "";
      return;
    }
    els.tableWrap.style.display = "block";
    els.emptyState.classList.remove("p127-show");

    var found = false;
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].id === state.currentId) { found = true; break; }
    }
    if (!found) state.currentId = sorted[0].id;

    for (var j = 0; j < pageItems.length; j++) {
      var item = pageItems[j];
      var row = document.createElement("tr");
      row.setAttribute("data-id", item.id);
      if (item.id === state.currentId) row.classList.add("p127-active");
      row.innerHTML =
        '<td class="p127-center"><button class="p127-row-button" data-edit="' + item.id + '" type="button">Edit</button></td>' +
        '<td class="p127-center"><button class="p127-row-button p127-print" data-print="' + item.id + '" type="button">Print</button></td>' +
        '<td class="p127-product-code">' + esc(item.mac5Code) + "</td>" +
        '<td title="' + esc(item.mac5Name) + '">' + esc(item.mac5Name) + "</td>" +
        '<td class="p127-new-code">' + esc(item.newCode) + "</td>" +
        '<td title="' + esc(item.newName) + '">' + esc(item.newName) + "</td>" +
        "<td>" + esc(item.size) + "</td>" +
        '<td class="p127-center"><span class="p127-unit-tag">' + esc(item.unit) + "</span></td>";
      els.rows.appendChild(row);
    }
    renderPagination(totalPages);
  }

  // ปุ่มหน้า: prev + 5 ปุ่มเลข (sliding window) + next
  function renderPagination(totalPages) {
    els.pagination.innerHTML = "";
    if (totalPages <= 1) return;

    var prev = document.createElement("button");
    prev.className = "p127-page-btn";
    prev.type = "button";
    prev.textContent = "‹";
    prev.disabled = state.page === 1;
    prev.addEventListener("click", function () {
      if (state.page > 1) { state.page--; renderRows(); }
    });
    els.pagination.appendChild(prev);

    var start;
    if (totalPages <= 5) {
      start = 1;
    } else {
      start = Math.max(1, Math.min(state.page - 2, totalPages - 4));
    }
    for (var p = start; p < start + 5; p++) {
      (function (pageNum) {
        var b = document.createElement("button");
        b.className = "p127-page-btn" + (pageNum === state.page ? " p127-active" : "");
        b.type = "button";
        b.textContent = String(pageNum);
        b.addEventListener("click", function () {
          state.page = pageNum;
          renderRows();
        });
        els.pagination.appendChild(b);
      })(p);
    }

    var next = document.createElement("button");
    next.className = "p127-page-btn";
    next.type = "button";
    next.textContent = "›";
    next.disabled = state.page === totalPages;
    next.addEventListener("click", function () {
      if (state.page < totalPages) { state.page++; renderRows(); }
    });
    els.pagination.appendChild(next);
  }

  // Quick search: กรองในหน่วยความจำ (ตาม C# DataView.RowFilter — STKcode/STKdescT1 LIKE)
  var quickTimer = null;
  function applyQuickSearch() {
    var q = els.quickSearch.value.trim().toLocaleLowerCase("th");
    if (!q) {
      state.items = products.slice();
    } else {
      state.items = products.filter(function (item) {
        return String(item.mac5Code || "").toLocaleLowerCase("th").indexOf(q) !== -1 ||
          String(item.mac5Name || "").toLocaleLowerCase("th").indexOf(q) !== -1;
      });
    }
    state.page = 1;
    renderRows();
  }

  function applySearch(showMessage) {
    state.items = products.slice();
    renderRows();
    if (showMessage) showToast("พบสินค้า " + state.items.length + " รายการ");
  }

  // โหลดรายการหลักจาก API (ตาม C# frm_configBarcodeStore.loadData)
  function loadList() {
    fetch("api/p127_list.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: "c1788406814359" })
    }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) { showToast("โหลดข้อมูลไม่สำเร็จ: " + (data.error || "error")); return; }
      products.length = 0;
      for (var i = 0; i < data.rows.length; i++) {
        var r = data.rows[i];
        products.push({
          id: r.stkCode,
          mac5Code: r.stkCode,
          mac5Name: r.stkDescT1,
          newCode: r.stkId,
          newName: r.stkName,
          size: r.stkDimension,
          unit: r.stkUnit,
          usage: r.stkUse,
          warning: r.stkCaution,
          barcode: r.stkBarcode
        });
      }
      state.currentId = products.length ? products[0].id : null;
      applySearch(false);
    })
    .catch(function () {
      showToast("โหลดข้อมูลไม่สำเร็จ");
    });
  }

  // เดือน/ปี ปัจจุบัน MM/พศ (ปีแสดงเป็น พ.ศ. = ค.ศ. + 543)
  function currentMonthYear() {
    var now = new Date();
    return (now.getMonth() + 1) + "/" + (now.getFullYear() + 543);
  }

  // ตาม C# EAN13() — แปลงรหัส 12 ตัวเป็นรูปแบบอักษร A-Z / a-z สำหรับ barcode font
  function ean13(code) {
    var s = String(code || "");
    var i, checksum = 0, first, out;
    if (s.length !== 12) return "";
    for (i = 0; i < 12; i++) {
      var l1 = s.charCodeAt(i);
      if (l1 < 48 || l1 > 57) return "";
    }
    for (i = 11; i >= 0; i -= 2) checksum += parseInt(s[i], 10);
    checksum *= 3;
    for (i = 10; i >= 0; i -= 2) checksum += parseInt(s[i], 10);
    s = s + ((10 - checksum % 10) % 10);
    out = s[0] + String.fromCharCode(65 + parseInt(s[1], 10));
    first = parseInt(s[0], 10);
    for (i = 2; i <= 6; i++) {
      var useUpper;
      if (i === 2) useUpper = (first === 0 || first === 1 || first === 2 || first === 3);
      else if (i === 3) useUpper = (first === 0 || first === 4 || first === 7 || first === 8);
      else if (i === 4) useUpper = (first === 0 || first === 1 || first === 4 || first === 5 || first === 9);
      else if (i === 5) useUpper = (first === 0 || first === 2 || first === 5 || first === 6 || first === 7);
      else useUpper = (first === 0 || first === 3 || first === 6 || first === 8 || first === 9);
      out += useUpper ? String.fromCharCode(65 + parseInt(s[i], 10)) : String.fromCharCode(75 + parseInt(s[i], 10));
    }
    out += "*";
    for (i = 7; i <= 12; i++) out += String.fromCharCode(97 + parseInt(s[i], 10));
    out += "+";
    return out;
  }

  function openModal(id) {
    var isNew = id === null || id === undefined;
    var item = isNew ? {
      id: null, mac5Code: "", mac5Name: "", newCode: "", newName: "",
      size: "", unit: "1 Ea", usage: "", storage: "เดือน/ปี ปัจจุบัน", warning: "", manufacturer: "บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด\n58/9 ม.6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร", barcode: ""
    } : findProduct(id);
    if (!item) return;

    state.editingId = item.id;
    els.modalTitle.textContent = isNew ? "เพิ่มสินค้า Barcode Store" : "แก้ไขข้อมูล Barcode Store";
    els.editMac5Code.value = item.mac5Code;
    els.editMac5Name.value = item.mac5Name;
    els.editNewCode.value = item.newCode;
    els.editNewName.value = item.newName;
    els.editSize.value = item.size;
    els.editUnit.value = item.unit;
    els.editUsage.value = item.usage;
    els.editStorage.value = item.storage;
    els.editWarning.value = item.warning;
    els.editManufacturer.value = item.manufacturer;
    els.editBarcode.value = item.barcode;

    // รหัสสินค้า MAC5: โหมดแก้ไข = readonly (สีเข้ม) / โหมดเพิ่มสินค้า = ใช้งาน + autocomplete
    // ชื่อสินค้า MAC5: readonly เสมอ (สีเข้ม)
    els.editMac5Name.setAttribute("readonly", "");
    if (isNew) {
      els.editMac5Code.removeAttribute("readonly");
      els.mac5Suggest.innerHTML = "";
      els.mac5Suggest.classList.remove("p127-show");
    } else {
      els.editMac5Code.setAttribute("readonly", "");
      // โหมดแก้ไข: เดือน/ปี ที่ผลิต = วันที่ปัจจุบัน MM/yyyy (ตาม C# DateTime.Now.ToString("MM/yyyy", ThaiCulture))
      els.editStorage.value = currentMonthYear();
      // ผู้ผลิต: ค่าคงที ตาม C# createPdf
      els.editManufacturer.value = "บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด\n58/9 ม.6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร";
    }

    els.modal.classList.add("p127-show");
    document.body.style.overflow = "hidden";
    els.editMac5Code.focus();
  }

  var suggestTimer = null, suggestSeq = 0;

  function doSuggest() {
    var code = els.editMac5Code.value.trim();
    if (!code) { hideSuggest(); return; }
    var seq = ++suggestSeq;
    fetch("api/p127_search.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: "c1788406814359", code: code, name: "" })
    }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (seq !== suggestSeq) return;
      if (!data.ok) { showToast("ค้นหาไม่สำเร็จ: " + (data.error || "error")); hideSuggest(); return; }
      renderSuggest(data.rows || []);
    })
    .catch(function () {
      if (seq !== suggestSeq) return;
      showToast("ค้นหาไม่สำเร็จ");
      hideSuggest();
    });
  }

  function renderSuggest(rows) {
    els.mac5Suggest.innerHTML = "";
    if (!rows.length) {
      els.mac5Suggest.innerHTML = '<div class="p127-suggest-empty">ไม่พบสินค้าที่ตรงกับเงื่อนไข</div>';
      els.mac5Suggest.classList.add("p127-show");
      return;
    }
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var div = document.createElement("div");
      div.className = "p127-suggest-item";
      div.innerHTML =
        '<span class="p127-suggest-code">' + esc(r.stkCode) + "</span>" +
        '<span class="p127-suggest-group">' + esc(r.stkGroup || "") + "</span>" +
        "<span>" + esc(r.stkDescT1) + "</span>";
      div.addEventListener("click", (function (row) {
        return function () {
          els.editMac5Code.value = row.stkCode;
          els.editMac5Name.value = row.stkDescT1; // readonly — set ด้วยโปรแกรม
          hideSuggest();
        };
      })(r));
      els.mac5Suggest.appendChild(div);
    }
    els.mac5Suggest.classList.add("p127-show");
  }

  function hideSuggest() {
    els.mac5Suggest.classList.remove("p127-show");
  }

  function closeModal() {
    els.modal.classList.remove("p127-show");
    document.body.style.overflow = "";
    state.editingId = null;
  }

  function saveProduct(e) {
    e.preventDefault();
    // วาลิเดชัน: รหัสสินค้า MAC5 ต้องมีค่า (toast แทน browser validation)
    if (!els.editMac5Code.value.trim()) {
      showToast("กรุณากรอกรหัสสินค้า MAC5");
      els.editMac5Code.focus();
      return;
    }
    var updated = {
      id: state.editingId || els.editMac5Code.value.trim(),
      mac5Code: els.editMac5Code.value.trim(),
      mac5Name: els.editMac5Name.value.trim(),
      newCode: els.editNewCode.value.trim(),
      newName: els.editNewName.value.trim(),
      size: els.editSize.value.trim(),
      unit: els.editUnit.value.trim(),
      usage: els.editUsage.value.trim(),
      storage: els.editStorage.value.trim(),
      warning: els.editWarning.value.trim(),
      manufacturer: els.editManufacturer.value.trim(),
      barcode: els.editBarcode.value.trim()
    };

    // โหมดแก้ไข: บันทึกถึงฐานข้อมูล (BI_CUBE.dbo.tb_ConfigBarcodeStore)
    if (state.editingId) {
      fetch("api/p127_update.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionId: "c1788406814359",
          mac5Code: updated.mac5Code,
          newCode: updated.newCode,
          newName: updated.newName,
          size: updated.size,
          unit: updated.unit,
          usage: updated.usage,
          warning: updated.warning,
          barcode: updated.barcode
        })
      }).then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) {
          showToast("บันทึกไม่สำเร็จ: " + (data.error || "error"));
          return;
        }
        var index = -1;
        for (var i = 0; i < products.length; i++) {
          if (products[i].id === state.editingId) { index = i; break; }
        }
        if (index >= 0) products[index] = updated;
        state.currentId = updated.id;
        showToast("แก้ไขสินค้า " + updated.mac5Code + " เรียบร้อยแล้ว");
        closeModal();
        applySearch(false);
      })
      .catch(function () {
        showToast("บันทึกไม่สำเร็จ — ตรวจการเชื่อมต่อ");
      });
      return;
    }

    // โหมดเพิ่มสินค้า: วาลิเดทฟิลด์ที่ต้องกรอก (toast แทน browser validation)
    if (!els.editNewCode.value.trim()) {
      showToast("กรุณากรอกรหัสสินค้า (ห้าง)");
      els.editNewCode.focus();
      return;
    }
    if (!els.editSize.value.trim()) {
      showToast("กรุณากรอกขนาด");
      els.editSize.focus();
      return;
    }
    if (!els.editUnit.value.trim()) {
      showToast("กรุณากรอกหน่วย");
      els.editUnit.focus();
      return;
    }
    if (!els.editBarcode.value.trim()) {
      showToast("กรุณากรอกรหัสบาร์โค้ด");
      els.editBarcode.focus();
      return;
    }
    // โหมดเพิ่มสินค้า: บันทึกถึงฐานข้อมูล (BI_CUBE.dbo.tb_ConfigBarcodeStore)
    fetch("api/p127_save.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: "c1788406814359",
        mac5Code: updated.mac5Code,
        newCode: updated.newCode,
        newName: updated.newName,
        size: updated.size,
        unit: updated.unit,
        usage: updated.usage,
        warning: updated.warning,
        barcode: updated.barcode
      })
    }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.ok) {
        showToast("บันทึกไม่สำเร็จ: " + (data.error || "error"));
        return;
      }
      products.unshift(updated);
      state.currentId = updated.id;
      showToast("เพิ่มสินค้า " + updated.mac5Code + " ถึงฐานข้อมูลแล้ว");
      closeModal();
      applySearch(false);
    })
    .catch(function () {
      showToast("บันทึกไม่สำเร็จ — ตรวจการเชื่อมต่อ");
    });
  }

  function printBarcode(id) {
    var item = findProduct(id);
    if (!item) return;
    // layout ตาม C# createPdf — label 282x210pt, ลำดับ: รหัสสินค้า (STKid), ชื่อ, ขนาด, หน่วย, วิธีใช้,
    // เดือน/ปี ปัจจุบัน, ข้อควรระวัง, ผู้ผลิต, ราคา, barcode (EAN13 ชิดขวาล่าง)
    // label (ตัวอักษร) 12pt bold / value 12pt / ข้อควรระวัง 14pt bold / barcode 30pt ฟอนต์ EAN13 / ช่องระหว่างบรรทัด 1px
    var labelHtml =
      '<div style="width:99.7mm;padding:6mm 8mm;background:#fff;position:relative;font-family:\'THSarabunNew\',Arial,sans-serif;text-align:left">' +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">รหัสสินค้า : </b><span style="font-size:12pt">' + esc(item.newCode) + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">ชื่อสินค้า : </b><span style="font-size:12pt">' + esc(item.newName) + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">ขนาด : </b><span style="font-size:12pt">' + esc(item.size) + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">หน่วย : </b><span style="font-size:12pt">' + esc(item.unit) + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">วิธีใช้ : </b><span style="font-size:12pt">' + esc(item.usage) + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">เดือน/ปี ที่ผลิต : </b><span style="font-size:12pt">' + currentMonthYear() + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:14pt">ข้อควรระวัง : </b><span style="font-size:14pt;font-weight:bold">' + esc(item.warning) + "</span></div>" +
        '<div style="margin-bottom:1px"><b style="font-size:12pt">ผู้ผลิต : </b><span style="font-size:12pt">บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด<br>58/9 ม.6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร</span></div>' +
        '<div style="margin-bottom:2px"><b style="font-size:12pt">ราคา : </b><span style="font-size:12pt">ระบุ ณ จุดขาย (บาท)</span></div>' +
        '<div style="position:absolute;right:5pt;bottom:10pt;font-family:\'EAN13\',monospace;font-size:30pt">' + esc(ean13(item.barcode)) + "</div>" +
      "</div>";
    // #p127PrintArea = สื่องให้ @media print / #p127PrintPreview = แสดงใน modal
    els.printArea.innerHTML = labelHtml;
    els.printPreview.innerHTML = labelHtml;
    // เปิด modal preview (ตาม C# createPdf → frm_printPreview.ShowDialog())
    els.printModal.classList.add("p127-show");
    document.body.style.overflow = "hidden";
  }

  function closePrintModal() {
    els.printModal.classList.remove("p127-show");
    document.body.style.overflow = "";
  }

  /* ---------- build DOM ---------- */
  function build(root) {
    root.innerHTML =
      '<div class="p127-app">' +
        '<section class="p127-launcher">' +
          '<div class="p127-launcher-title"><strong>' +
            '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 8v8M10 8v8M14 8v8M17 8v8"></path></svg>' +
            "Barcode Store</strong></div>" +
          '<div class="p127-launcher-body" id="p127LauncherBody">' +
            '<div class="p127-action-menu">' +
              '<button class="p127-main-action p127-add" id="p127AddButton" type="button">' +
                '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v8M8 12h8"></path></svg>เพิ่มสินค้า</button>' +
              '<button class="p127-main-action p127-refresh" id="p127RefreshButton" type="button">' +
                '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>Refresh</button>' +
            "</div>" +
          "</div>" +
        "</section>" +
        '<section class="p127-panel">' +
          '<div class="p127-panel-header">' +
            '<div class="p127-panel-heading">' +
              '<div class="p127-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
              '<div class="p127-panel-title"><h2>รายการสินค้า Barcode Store</h2>' +
                '<p>คลิกแถวเพื่อดูข้อมูลสินค้า หรือใช้ปุ่ม Edit / Print</p></div>' +
            "</div>" +
            '<div class="p127-quick-search">' +
              '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>' +
              '<input id="p127QuickSearch" type="text" autocomplete="off" placeholder="ค้นหาสินค้า (รหัส/ชื่อ)">' +
            "</div>" +
            '<span class="p127-badge" id="p127ResultBadge">0 รายการ</span>' +
          "</div>" +
          '<div class="p127-table-wrap" id="p127TableWrap">' +
            "<table>" +
              "<thead><tr>" +
                '<th class="p127-center">Edit</th>' +
                '<th class="p127-center">Print</th>' +
                '<th class="p127-sortable" data-sort="mac5Code">รหัสสินค้า MAC5 <span class="p127-arrow"></span></th>' +
                '<th class="p127-sortable" data-sort="mac5Name">ชื่อสินค้า MAC5 <span class="p127-arrow"></span></th>' +
                '<th class="p127-sortable" data-sort="newCode">รหัสสินค้า (ห้าง) <span class="p127-arrow"></span></th>' +
                '<th class="p127-sortable" data-sort="newName">ชื่อสินค้า (ห้าง) <span class="p127-arrow"></span></th>' +
                '<th class="p127-sortable" data-sort="size">ขนาด <span class="p127-arrow"></span></th>' +
                '<th class="p127-sortable p127-center" data-sort="unit">หน่วย <span class="p127-arrow"></span></th>' +
              "</tr></thead>" +
              '<tbody id="p127ProductRows"></tbody>' +
            "</table>" +
          "</div>" +
          '<div class="p127-pagination" id="p127Pagination"></div>' +
          '<div class="p127-empty-state" id="p127EmptyState">' +
            "<div>" +
              '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>' +
              "<strong>ไม่พบรายการสินค้าตามเงื่อนไข</strong>" +
              '<p>ลองค้นหาด้วยรหัสสินค้า หรือชื่อสินค้า MAC5</p>' +
            "</div>" +
          "</div>" +
          '<div class="p127-panel-footer">' +
            '<span id="p127FooterText">แสดง 0 รายการ</span>' +
            '<span id="p127SelectedText">ยังไม่ได้เลือกแถว</span>' +
          "</div>" +
        "</section>" +
        '<div class="p127-modal-backdrop" id="p127EditModal">' +
          '<section class="p127-modal" role="dialog" aria-modal="true">' +
            '<div class="p127-modal-header">' +
              '<h2 id="p127ModalTitle">แก้ไขข้อมูล Barcode Store</h2>' +
              '<button class="p127-modal-close" id="p127ModalClose" type="button">×</button>' +
            "</div>" +
            '<form class="p127-modal-body" id="p127EditForm">' +
              '<div class="p127-modal-grid">' +
                '<div class="p127-modal-field"><label for="p127EditMac5Code">รหัสสินค้า MAC5</label>' +
                  '<div class="p127-pick-wrap">' +
                    '<input id="p127EditMac5Code" type="text">' +
                    '<div class="p127-suggest" id="p127Mac5Suggest"></div>' +
                  '</div></div>' +
                '<div class="p127-modal-field"><label for="p127EditMac5Name">ชื่อสินค้า MAC5</label>' +
                  '<input id="p127EditMac5Name" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditNewCode">รหัสสินค้า (ห้าง)</label>' +
                  '<input id="p127EditNewCode" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditNewName">ชื่อสินค้า (ห้าง)</label>' +
                  '<input id="p127EditNewName" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditSize">ขนาด</label>' +
                  '<input id="p127EditSize" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditUnit">หน่วย</label>' +
                  '<input id="p127EditUnit" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditUsage">วิธีใช้</label>' +
                  '<input id="p127EditUsage" type="text"></div>' +
                '<div class="p127-modal-field"><label for="p127EditWarning">ข้อควรระวัง</label>' +
                  '<input id="p127EditWarning" type="text"></div>' +
                '<div class="p127-modal-field"><label for="p127EditStorage">เดือน/ปี ที่ผลิต</label>' +
                  '<input id="p127EditStorage" type="text" readonly></div>' +
                '<div class="p127-modal-field"><label for="p127EditManufacturer">ผู้ผลิต</label>' +
                  '<textarea id="p127EditManufacturer" readonly></textarea></div>' +
                '<div class="p127-modal-field"><label for="p127EditBarcode">รหัสบาร์โค้ด</label>' +
                  '<input id="p127EditBarcode" type="text"></div>' +
                "</div>" +
            "</form>" +
            '<div class="p127-modal-footer">' +
              '<button class="p127-modal-button p127-cancel" id="p127CancelButton" type="button">' +
                '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6m0-6-6 6"></path></svg>ยกเลิก</button>' +
              '<button class="p127-modal-button p127-save" id="p127SaveButton" type="button">' +
                '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>บันทึก</button>' +
            "</div>" +
          "</section>" +
        "</div>" +
        '<div id="p127PrintArea"></div>' +
        '<div class="p127-modal-backdrop" id="p127PrintModal">' +
          '<section class="p127-modal p127-print-modal" role="dialog" aria-modal="true">' +
            '<div class="p127-modal-header">' +
              '<h2>Preview Barcode Label</h2>' +
              '<button class="p127-modal-close" id="p127PrintClose" type="button">×</button>' +
            '</div>' +
            '<div class="p127-modal-body p127-print-body">' +
              '<div id="p127PrintPreview"></div>' +
            '</div>' +
            '<div class="p127-modal-footer">' +
              '<button class="p127-modal-button p127-cancel" id="p127PrintCancel" type="button">' +
                '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6m0-6-6 6"></svg>ปิด</button>' +
              '<button class="p127-modal-button p127-save" id="p127DoPrint" type="button">' +
                '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>พิมพ์</button>' +
            '</div>' +
          '</section>' +
        '</div>' +
        '<div class="p127-toast" id="p127Toast">' +
          '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>' +
          '<span id="p127ToastMessage"></span>' +
        "</div>" +
      "</div>";

    els.app = root.querySelector(".p127-app");
    els.rows = root.querySelector("#p127ProductRows");
    els.tableWrap = root.querySelector("#p127TableWrap");
    els.emptyState = root.querySelector("#p127EmptyState");
    els.modal = root.querySelector("#p127EditModal");
    els.printArea = root.querySelector("#p127PrintArea");
    els.toast = root.querySelector("#p127Toast");
    els.toastMessage = root.querySelector("#p127ToastMessage");
    els.resultBadge = root.querySelector("#p127ResultBadge");
    els.footerText = root.querySelector("#p127FooterText");
    els.selectedText = root.querySelector("#p127SelectedText");
    els.pagination = root.querySelector("#p127Pagination");
    els.quickSearch = root.querySelector("#p127QuickSearch");
    els.modalTitle = root.querySelector("#p127ModalTitle");
    els.modalClose = root.querySelector("#p127ModalClose");
    els.editMac5Code = root.querySelector("#p127EditMac5Code");
    els.mac5Suggest = root.querySelector("#p127Mac5Suggest");
    els.editMac5Name = root.querySelector("#p127EditMac5Name");
    els.editNewCode = root.querySelector("#p127EditNewCode");
    els.editNewName = root.querySelector("#p127EditNewName");
    els.editSize = root.querySelector("#p127EditSize");
    els.editUnit = root.querySelector("#p127EditUnit");
    els.editUsage = root.querySelector("#p127EditUsage");
    els.editStorage = root.querySelector("#p127EditStorage");
    els.editWarning = root.querySelector("#p127EditWarning");
    els.editManufacturer = root.querySelector("#p127EditManufacturer");
    els.editBarcode = root.querySelector("#p127EditBarcode");
    els.cancelButton = root.querySelector("#p127CancelButton");
    els.saveButton = root.querySelector("#p127SaveButton");
    els.printModal = root.querySelector("#p127PrintModal");
    els.printPreview = root.querySelector("#p127PrintPreview");
    els.doPrintBtn = root.querySelector("#p127DoPrint");
    els.printClose = root.querySelector("#p127PrintClose");
    els.printCancel = root.querySelector("#p127PrintCancel");

    // ตัด modal เก่าที่เหลืออยู่ใน body (จากการ mount ครั้งก่อน) แล้วย้าย modal ใหม่ไปยัง body:
    // #appContent มี transform ทำให้ position:fixed ของ backdrop จมหายไปในจอสด้านล่าง
    var oldModals = document.querySelectorAll("#p127EditModal");
    for (var oi = 0; oi < oldModals.length; oi++) {
      if (oldModals[oi] !== els.modal) oldModals[oi].remove();
    }
    if (els.modal && els.modal.parentElement !== document.body) {
      document.body.appendChild(els.modal);
    }
    // ย้าย print modal ไปยัง body (เดียวกับ edit modal)
    var oldPrintModals = document.querySelectorAll("#p127PrintModal");
    for (var pm = 0; pm < oldPrintModals.length; pm++) {
      if (oldPrintModals[pm] !== els.printModal) oldPrintModals[pm].remove();
    }
    if (els.printModal && els.printModal.parentElement !== document.body) {
      document.body.appendChild(els.printModal);
    }
    // ย้าย toast ไปยัง body ด้วย — ถ้ายังอยู่ใน #appContent (มี transform) จะจมอยู่เบื้องหลัง modal
    var oldToasts = document.querySelectorAll("#p127Toast");
    for (var ot = 0; ot < oldToasts.length; ot++) {
      if (oldToasts[ot] !== els.toast) oldToasts[ot].remove();
    }
    if (els.toast && els.toast.parentElement !== document.body) {
      document.body.appendChild(els.toast);
    }

    /* ---------- events ---------- */
    root.querySelector("#p127RefreshButton").addEventListener("click", function () {
      els.quickSearch.value = "";
      state.page = 1;
      state.currentId = null;
      loadList();
      showToast("รีเฟรชข้อมูลเรียบร้อยแล้ว");
    });

    els.quickSearch.addEventListener("input", function () {
      clearTimeout(quickTimer);
      quickTimer = setTimeout(applyQuickSearch, 300);
    });

    root.querySelector("#p127AddButton").addEventListener("click", function () {
      openModal(null);
    });

    // print preview modal: พิมพ์ (window.print — @media print แสดงแค่ #p127PrintArea) + ปิด
    els.doPrintBtn.addEventListener("click", function () {
      window.print();
    });
    els.printClose.addEventListener("click", closePrintModal);
    els.printCancel.addEventListener("click", closePrintModal);

    els.rows.addEventListener("click", function (e) {
      var editBtn = e.target.closest("[data-edit]");
      var printBtn = e.target.closest("[data-print]");
      if (editBtn) {
        openModal(editBtn.getAttribute("data-edit"));
        return;
      }
      if (printBtn) {
        printBarcode(printBtn.getAttribute("data-print"));
        return;
      }
      var row = e.target.closest("tr");
      if (!row) return;
      state.currentId = row.getAttribute("data-id");
      renderRows();
    });

    var headers = els.app.querySelectorAll("th[data-sort]");
    for (var i = 0; i < headers.length; i++) {
      (function (header) {
        header.addEventListener("click", function () {
          var field = header.getAttribute("data-sort");
          if (state.sortField === field) {
            state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
          } else {
            state.sortField = field;
            state.sortDirection = "asc";
          }
          renderRows();
        });
      })(headers[i]);
    }

    els.saveButton.addEventListener("click", function () {
      saveProduct({ preventDefault: function () {} });
    });
    els.modalClose.addEventListener("click", closeModal);
    els.cancelButton.addEventListener("click", closeModal);
    els.editMac5Code.addEventListener("input", function () {
      if (els.editMac5Code.hasAttribute("readonly")) return;
      clearTimeout(suggestTimer);
      suggestTimer = setTimeout(doSuggest, 300);
    });
    document.addEventListener("click", function (e) {
      var wrap = document.querySelector(".p127-pick-wrap");
      if (wrap && !wrap.contains(e.target) && els.mac5Suggest.classList.contains("p127-show")) hideSuggest();
    });
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.modal.classList.contains("p127-show")) closeModal();
    });

    // โหลดรายการจาก API (ตาม C# frm_configBarcodeStore_Load)
    loadList();
  }

  function injectStyle() {
    if (document.getElementById("p127Style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "p127Style";
    styleEl.textContent = CSS.join("\n");
    document.head.appendChild(styleEl);
  }

  window.P127BarcodeStore = {
    mount: function (root) {
      injectStyle();
      build(root);
    }
  };
})();
