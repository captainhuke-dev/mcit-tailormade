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
    ".p127-app .p127-launcher-body{display:grid;grid-template-columns:150px minmax(380px,1fr);gap:20px;padding:18px 20px;background:linear-gradient(180deg,#e4fbfd,#edfafd)}",
    ".p127-app .p127-action-menu{display:flex;flex-direction:column;gap:10px}",
    ".p127-app .p127-main-action{display:inline-flex;min-height:49px;align-items:center;justify-content:center;gap:8px;padding:0 12px;border:1px solid #b6c5d8;border-radius:10px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.16s ease}",
    ".p127-app .p127-main-action svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-main-action.p127-add{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}",
    ".p127-app .p127-main-action.p127-refresh{color:#047857;border-color:#a7f3d0;background:#ecfdf5}",
    ".p127-app .p127-main-action:hover{transform:translateY(-1px);filter:brightness(.98)}",
    ".p127-app .p127-search-box{display:flex;align-items:center;padding:14px 16px;border:1px solid #b9ddeb;border-radius:13px;background:rgba(255,255,255,.76)}",
    ".p127-app .p127-search-grid{display:grid;grid-template-columns:minmax(200px,1fr) minmax(260px,1.4fr) auto;gap:14px;align-items:end;width:100%}",
    ".p127-app .p127-search-title{grid-column:1/-1;color:#1e3a8a;font-size:13px;font-weight:700}",
    ".p127-app .p127-field label{display:block;margin-bottom:6px;color:#334155;font-size:12px;font-weight:700}",
    ".p127-app .p127-field input{width:100%;height:41px;padding:0 11px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p127-app .p127-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p127-app .p127-search-button{display:inline-flex;height:41px;align-items:center;justify-content:center;gap:8px;padding:0 24px;color:#fff;border:0;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-size:13px;font-weight:700;cursor:pointer;transition:.16s ease}",
    ".p127-app .p127-search-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-search-button:hover{transform:translateY(-1px);filter:brightness(1.05)}",
    /* summary */
    ".p127-app .p127-summary-grid{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:12px}",
    ".p127-app .p127-summary-card{display:flex;min-width:0;align-items:center;gap:12px;padding:13px 15px;border:1px solid #dbe3ef;border-radius:14px;background:#fff;box-shadow:0 4px 14px rgba(15,23,42,.04)}",
    ".p127-app .p127-summary-icon{display:grid;width:42px;height:42px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:12px;background:#eff6ff}",
    ".p127-app .p127-summary-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-summary-card.p127-green .p127-summary-icon{color:#059669;background:#ecfdf5}",
    ".p127-app .p127-summary-card.p127-orange .p127-summary-icon{color:#d97706;background:#fffbeb}",
    ".p127-app .p127-summary-card.p127-red .p127-summary-icon{color:#dc2626;background:#fef2f2}",
    ".p127-app .p127-summary-text{min-width:0}",
    ".p127-app .p127-summary-text span{display:block;color:#64748b;font-size:10px}",
    ".p127-app .p127-summary-text strong{display:block;overflow:hidden;margin-top:2px;font-size:17px;text-overflow:ellipsis;white-space:nowrap}",
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
    /* modal */
    ".p127-app .p127-modal-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.54);backdrop-filter:blur(4px)}",
    ".p127-app .p127-modal-backdrop.p127-show{display:grid}",
    ".p127-app .p127-modal{display:flex;width:min(880px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.35);animation:p127-modal-open .18s ease}",
    "@keyframes p127-modal-open{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}",
    ".p127-app .p127-modal-header{display:flex;align-items:center;justify-content:space-between;padding:13px 17px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p127-app .p127-modal-header h2{font-size:15px;margin:0}",
    ".p127-app .p127-modal-close{width:31px;height:31px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:18px;cursor:pointer}",
    ".p127-app .p127-modal-close:hover{background:#dc2626}",
    ".p127-app .p127-modal-body{overflow-y:auto;padding:20px;background:#f8fafc}",
    ".p127-app .p127-modal-grid{display:grid;grid-template-columns:1fr;gap:12px}",
    ".p127-app .p127-modal-field{display:grid;grid-template-columns:150px 1fr;column-gap:12px;align-items:center}",
    ".p127-app .p127-modal-field.p127-block{display:block}",
    ".p127-app .p127-pick-wrap{display:flex;align-items:center;gap:8px}",
    ".p127-app .p127-pick-button{height:38px;min-width:72px;padding:0 12px;color:#64748b;border:1px solid #dbe3ef;border-radius:8px;background:#f1f5f9;font-size:12px;font-weight:700;cursor:not-allowed}",
    ".p127-app .p127-modal-field label{color:#7c2d12;font-size:12px;font-weight:700;text-align:right}",
    ".p127-app .p127-modal-field.p127-block label{display:block;margin-bottom:5px;text-align:left}",
    ".p127-app .p127-modal-field label.p127-optional{color:#334155}",
    ".p127-app .p127-modal-field input{width:100%;height:38px;padding:0 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p127-app .p127-modal-field textarea{width:100%;min-height:67px;padding:9px 10px;color:#172033;border:1px solid #b6c5d8;border-radius:8px;outline:none;background:#fff;font-size:13px;resize:vertical}",
    ".p127-app .p127-modal-field input:focus,.p127-app .p127-modal-field textarea:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p127-app .p127-modal-field input[readonly],.p127-app .p127-modal-field textarea[readonly]{background:#e8edf3;color:#64748b}",
    ".p127-app .p127-modal-divider{grid-column:1/-1;height:1px;margin:3px 0;background:#dbe3ef}",
    ".p127-app .p127-modal-footer{display:flex;justify-content:center;gap:10px;padding:13px 20px;border-top:1px solid #dbe3ef;background:#fff}",
    ".p127-app .p127-modal-button{display:inline-flex;height:41px;align-items:center;gap:7px;padding:0 18px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer}",
    ".p127-app .p127-modal-button svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p127-app .p127-modal-button.p127-save{color:#fff;border:0;background:#059669}",
    ".p127-app .p127-modal-button.p127-cancel{color:#475569;border:1px solid #dbe3ef;background:#fff}",
    ".p127-app .p127-barcode-preview{display:flex;min-height:78px;align-items:center;justify-content:center;margin-top:4px;overflow:hidden;padding:10px;border:1px dashed #94a3b8;border-radius:8px;background:#fff}",
    ".p127-app .p127-barcode-lines{width:250px;height:42px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 5px,transparent 5px 8px,#111 8px 12px,transparent 12px 14px,#111 14px 15px,transparent 15px 19px,#111 19px 23px,transparent 23px 25px)}",
    ".p127-app .p127-barcode-text{margin-top:5px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-align:center}",
    /* toast */
    ".p127-app .p127-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p127-app .p127-toast.p127-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p127-app .p127-toast svg{width:16px;height:16px;color:#34d399;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
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
    "  .p127-app .p127-action-menu{display:grid;grid-template-columns:1fr 1fr}",
    "  .p127-app .p127-summary-grid{grid-template-columns:repeat(2,1fr)}",
    "}",
    "@media (max-width:680px){",
    "  .p127-app .p127-search-grid,.p127-app .p127-summary-grid,.p127-app .p127-modal-grid{grid-template-columns:1fr}",
    "  .p127-app .p127-search-title,.p127-app .p127-modal-divider{grid-column:auto}",
    "  .p127-app .p127-summary-grid{grid-template-columns:1fr}",
    "  .p127-app .p127-panel-header,.p127-app .p127-panel-footer{align-items:flex-start;flex-direction:column}",
    "  .p127-app .p127-modal-backdrop{padding:8px}",
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

  var state = {
    items: [],
    currentId: 2,
    editingId: null,
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
    var newCodeCount = 0, barcodeCount = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].newCode) newCodeCount++;
      if (items[i].barcode) barcodeCount++;
    }
    var current = findProduct(state.currentId);
    els.summaryTotal.textContent = items.length + " รายการ";
    els.summaryNewCode.textContent = newCodeCount + " รายการ";
    els.summaryBarcode.textContent = barcodeCount + " รายการ";
    els.summarySelected.textContent = current ? current.mac5Code : "-";
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

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.emptyState.classList.add("p127-show");
      return;
    }
    els.tableWrap.style.display = "block";
    els.emptyState.classList.remove("p127-show");

    var found = false;
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].id === state.currentId) { found = true; break; }
    }
    if (!found) state.currentId = sorted[0].id;

    for (var j = 0; j < sorted.length; j++) {
      var item = sorted[j];
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
  }

  function applySearch(showMessage) {
    var code = els.mac5Code.value.trim().toLowerCase();
    var name = els.mac5Name.value.trim().toLowerCase();
    state.items = products.filter(function (item) {
      return (!code || String(item.mac5Code).toLowerCase().indexOf(code) !== -1) &&
        (!name || String(item.mac5Name).toLowerCase().indexOf(name) !== -1);
    });
    renderRows();
    if (showMessage) showToast("พบสินค้า " + state.items.length + " รายการ");
  }

  function openModal(id) {
    var isNew = id === null || id === undefined;
    var item = isNew ? {
      id: null, mac5Code: "", mac5Name: "", newCode: "", newName: "",
      size: "", unit: "1 Ea", usage: "", storage: "", warning: "", manufacturer: "", barcode: ""
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
    els.barcodePreviewText.textContent = item.barcode || "BARCODE";

    els.modal.classList.add("p127-show");
    document.body.style.overflow = "hidden";
    els.editMac5Code.focus();
  }

  function closeModal() {
    els.modal.classList.remove("p127-show");
    document.body.style.overflow = "";
    state.editingId = null;
  }

  function saveProduct(e) {
    e.preventDefault();
    var updated = {
      id: state.editingId || Date.now(),
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

    var index = -1;
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === state.editingId) { index = i; break; }
    }
    if (index >= 0) {
      products[index] = updated;
      showToast("บันทึกข้อมูล " + updated.mac5Code + " เรียบร้อยแล้ว");
    } else {
      products.unshift(updated);
      state.currentId = updated.id;
      showToast("เพิ่มสินค้า " + updated.mac5Code + " เรียบร้อยแล้ว");
    }
    closeModal();
    applySearch(false);
  }

  function printBarcode(id) {
    var item = findProduct(id);
    if (!item) return;
    els.printArea.innerHTML =
      '<div style="width:80mm;padding:8mm;font-family:Arial,sans-serif;text-align:center">' +
        '<div style="font-size:13px;font-weight:bold;margin-bottom:4px">' + esc(item.newName) + "</div>" +
        '<div style="font-size:11px;margin-bottom:8px">' + esc(item.size) + " · " + esc(item.unit) + "</div>" +
        '<div style="height:42px;background:repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 5px,transparent 5px 8px,#111 8px 12px,transparent 12px 14px,#111 14px 15px,transparent 15px 19px,#111 19px 23px,transparent 23px 25px)"></div>' +
        '<div style="margin-top:6px;font-size:14px;font-weight:bold;letter-spacing:2px">' + esc(item.barcode || item.newCode) + "</div>" +
        '<div style="margin-top:4px;font-size:10px">' + esc(item.mac5Code) + "</div>" +
      "</div>";
    window.print();
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
            '<form class="p127-search-box" id="p127SearchForm">' +
              '<div class="p127-search-grid">' +
                '<div class="p127-search-title">ค้นหา</div>' +
                '<div class="p127-field"><label for="p127Mac5Code">รหัสสินค้า MAC5</label>' +
                  '<input id="p127Mac5Code" type="text" autocomplete="off" placeholder="เช่น 10010415"></div>' +
                '<div class="p127-field"><label for="p127Mac5Name">ชื่อสินค้า MAC5</label>' +
                  '<input id="p127Mac5Name" type="text" autocomplete="off" placeholder="ค้นหาจากชื่อสินค้า"></div>' +
                '<button class="p127-search-button" type="submit">' +
                  '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>ค้นหา</button>' +
              "</div>" +
            "</form>" +
          "</div>" +
        "</section>" +
        '<section class="p127-summary-grid">' +
          '<article class="p127-summary-card">' +
            '<div class="p127-summary-icon"><svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path></svg></div>' +
            '<div class="p127-summary-text"><span>รายการสินค้าทั้งหมด</span><strong id="p127SummaryTotal">0 รายการ</strong></div>' +
          "</article>" +
          '<article class="p127-summary-card p127-green">' +
            '<div class="p127-summary-icon"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"></path></svg></div>' +
            '<div class="p127-summary-text"><span>สินค้าที่มีรหัสใหม่</span><strong id="p127SummaryNewCode">0 รายการ</strong></div>' +
          "</article>" +
          '<article class="p127-summary-card p127-orange">' +
            '<div class="p127-summary-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 8v8M10 8v8M14 8v8M17 8v8"></path></svg></div>' +
            '<div class="p127-summary-text"><span>Barcode พร้อมพิมพ์</span><strong id="p127SummaryBarcode">0 รายการ</strong></div>' +
          "</article>" +
          '<article class="p127-summary-card p127-red">' +
            '<div class="p127-summary-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></div>' +
            '<div class="p127-summary-text"><span>แถวที่เลือก</span><strong id="p127SummarySelected">-</strong></div>' +
          "</article>" +
        "</section>" +
        '<section class="p127-panel">' +
          '<div class="p127-panel-header">' +
            '<div class="p127-panel-heading">' +
              '<div class="p127-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
              '<div class="p127-panel-title"><h2>รายการสินค้า Barcode Store</h2>' +
                '<p>คลิกแถวเพื่อดูข้อมูลสินค้า หรือใช้ปุ่ม Edit / Print</p></div>' +
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
                    '<input id="p127EditMac5Code" type="text" required>' +
                    '<button class="p127-pick-button" type="button" disabled>เลือก...</button>' +
                  '</div></div>' +
                '<div class="p127-modal-field"><label for="p127EditNewCode">รหัสสินค้า (ห้าง)</label>' +
                  '<input id="p127EditNewCode" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditMac5Name">ชื่อสินค้า MAC5</label>' +
                  '<input id="p127EditMac5Name" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditNewName">ชื่อสินค้า (ห้าง)</label>' +
                  '<input id="p127EditNewName" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditSize">ขนาด</label>' +
                  '<input id="p127EditSize" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditUnit">หน่วย</label>' +
                  '<input id="p127EditUnit" type="text" required></div>' +
                '<div class="p127-modal-field"><label for="p127EditUsage">วิธีใช้</label>' +
                  '<input id="p127EditUsage" type="text"></div>' +
                '<div class="p127-modal-field"><label for="p127EditStorage">เดือน/ปี ที่ผลิต</label>' +
                  '<input id="p127EditStorage" type="text" readonly></div>' +
                '<div class="p127-modal-field"><label for="p127EditBarcode">รหัสบาร์โค้ด</label>' +
                  '<input id="p127EditBarcode" type="text"></div>' +
                '<div class="p127-modal-field"><label for="p127EditWarning">ข้อควรระวัง</label>' +
                  '<input id="p127EditWarning" type="text"></div>' +
                '<div class="p127-modal-field"><label for="p127EditManufacturer">ผู้ผลิต</label>' +
                  '<textarea id="p127EditManufacturer" readonly></textarea></div>' +
                '<div class="p127-modal-divider"></div>' +
                '<div class="p127-modal-field p127-block">' +
                  '<label class="p127-optional">ตัวอย่าง Barcode</label>' +
                  '<div class="p127-barcode-preview"><div>' +
                    '<div class="p127-barcode-lines"></div>' +
                    '<div class="p127-barcode-text" id="p127BarcodePreviewText">-</div>' +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</form>" +
            '<div class="p127-modal-footer">' +
              '<button class="p127-modal-button p127-cancel" id="p127CancelButton" type="button">' +
                '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="m9 9 6 6m0-6-6 6"></path></svg>ยกเลิก</button>' +
              '<button class="p127-modal-button p127-save" id="p127SaveButton" type="submit" form="p127EditForm">' +
                '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>บันทึก</button>' +
            "</div>" +
          "</section>" +
        "</div>" +
        '<div id="p127PrintArea"></div>' +
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
    els.mac5Code = root.querySelector("#p127Mac5Code");
    els.mac5Name = root.querySelector("#p127Mac5Name");
    els.summaryTotal = root.querySelector("#p127SummaryTotal");
    els.summaryNewCode = root.querySelector("#p127SummaryNewCode");
    els.summaryBarcode = root.querySelector("#p127SummaryBarcode");
    els.summarySelected = root.querySelector("#p127SummarySelected");
    els.resultBadge = root.querySelector("#p127ResultBadge");
    els.footerText = root.querySelector("#p127FooterText");
    els.selectedText = root.querySelector("#p127SelectedText");
    els.modalTitle = root.querySelector("#p127ModalTitle");
    els.modalClose = root.querySelector("#p127ModalClose");
    els.editMac5Code = root.querySelector("#p127EditMac5Code");
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
    els.barcodePreviewText = root.querySelector("#p127BarcodePreviewText");
    els.cancelButton = root.querySelector("#p127CancelButton");

    /* ---------- events ---------- */
    root.querySelector("#p127SearchForm").addEventListener("submit", function (e) {
      e.preventDefault();
      applySearch(true);
    });

    root.querySelector("#p127RefreshButton").addEventListener("click", function () {
      els.mac5Code.value = "";
      els.mac5Name.value = "";
      state.currentId = 2;
      applySearch(false);
      showToast("รีเฟรชข้อมูลเรียบร้อยแล้ว");
    });

    root.querySelector("#p127AddButton").addEventListener("click", function () {
      openModal(null);
    });

    els.rows.addEventListener("click", function (e) {
      var editBtn = e.target.closest("[data-edit]");
      var printBtn = e.target.closest("[data-print]");
      if (editBtn) {
        openModal(Number(editBtn.getAttribute("data-edit")));
        return;
      }
      if (printBtn) {
        printBarcode(Number(printBtn.getAttribute("data-print")));
        return;
      }
      var row = e.target.closest("tr");
      if (!row) return;
      state.currentId = Number(row.getAttribute("data-id"));
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

    root.querySelector("#p127EditForm").addEventListener("submit", saveProduct);
    els.modalClose.addEventListener("click", closeModal);
    els.cancelButton.addEventListener("click", closeModal);
    els.editBarcode.addEventListener("input", function (e) {
      els.barcodePreviewText.textContent = e.target.value || "BARCODE";
    });
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.modal.classList.contains("p127-show")) closeModal();
    });

    applySearch(false);
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
