/* P115 — TMS View Picture V3 (skeleton)
 * Layout ตาม demo/P115_Launcher_Pattern.html:
 * - แถบค้นหา: วันที่เอกสาร / เลขใบสำคัญ / ทะเบียนรถ + ปุ่มค้นหา/ล้างค่า
 * - แผงซ้าย: ผลค้นหา (วันที่ | เวลา | ทะเบียนรถ | เลขใบสำคัญ | คัดลอกลิงก์) — แบ่งหน้า 15 รายการ
 * - แผงขวา: ดูภาพเอกสาร (zoom in/out, หมุน, เต็มจอ, reset + zoom label)
 * ค้นหาข้อมูลจริงจาก Nas200 ผ่าน api/p115_documents.php
 */
(function () {
  "use strict";

  var API_URL = "api/p115_documents.php";
  var NAS200_CONNECTION_ID = "c1788855932701";
  var PAGE_SIZE = 15;
  var ZOOM_MIN = 0.4, ZOOM_MAX = 1.4, ZOOM_STEP = 0.1, ZOOM_DEFAULT = 1.0;

  /* ---------- icons (inline SVG — ไม่ขึ้นอยู่กับ CDN) ---------- */
  var escHandler = null; // document keydown สำหรับปิดเต็มจอ — ถอนออกก่อนเมื่อ mount ซ้ำ
  var ICON_PATHS = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    car: '<path d="M5 17h14l-1.5-5.5a2 2 0 0 0-1.9-1.5H8.4a2 2 0 0 0-1.9 1.5L5 17z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
    zoomout: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="8" y1="11" x2="14" y2="11"/>',
    zoomin: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>',
    filesearch: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="11" cy="14" r="3"/><line x1="16" y1="19" x2="13" y2="16"/>',
    check: '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
    chevleft: '<polyline points="15 18 9 12 15 6"/>',
    chevright: '<polyline points="9 18 15 12 9 6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    fullscreen: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
  };

  function icon(name) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON_PATHS[name] || "") + "</svg>";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function normalizeDocument(row) {
    var date = String(row.tms_date || "").slice(0, 10);
    var dateParts = date.split("-");
    var displayDate = dateParts.length === 3
      ? dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0]
      : date;
    return {
      id: row.id,
      date: displayDate,
      dateISO: date,
      time: String(row.tms_time || "").slice(0, 8),
      vehicle: String(row.tms_truck_license || ""),
      number: String(row.tms_invoice_id || ""),
      fileName: String(row.tms_file_name || ""),
      folderName: String(row.tms_folder_name || ""),
      receive: Number(row.tms_receive) === 1,
      remark: row.tms_remark2 == null ? "" : String(row.tms_remark2)
    };
  }

  function apiSearch(payload) {
    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: NAS200_CONNECTION_ID,
        date: payload.date,
        invoiceId: payload.invoiceId,
        truckLicense: payload.truckLicense
      })
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok || !data.ok) {
          throw new Error(data.message || "ค้นหาข้อมูลไม่สำเร็จ");
        }
        return data;
      });
    });
  }

  /* ---------- TMS image link (settings: ลิงก์ชื่อ [TMS] หรือ TMS) ---------- */
  function loadTmsBase() {
    return fetch("api/links.php")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.ok && Array.isArray(data.links)) {
          var found = data.links.filter(function (l) {
            var n = String(l.name || "").trim();
            return n === "[TMS]" || n === "TMS";
          })[0];
          return found ? String(found.url || "") : "";
        }
        return "";
      })
      .catch(function () { return ""; });
  }

  function buildImageUrl(base, doc) {
    if (!base || !doc.folderName || !doc.fileName) return "";
    var b = String(base).replace(/[/\\]+$/, "");
    return b + "/" + encodeURIComponent(doc.folderName) + "/" + encodeURIComponent(doc.fileName);
  }

  /* ---------- CSS ---------- */
  var CSS = [
    ".p115{--p115-primary:#2563eb;--p115-primary-dark:#1d4ed8;--p115-primary-light:#eff6ff;",
    "  --p115-surface:#fff;--p115-text:#172033;--p115-muted:#64748b;--p115-border:#e2e8f0;",
    "  --p115-success:#10b981;--p115-danger:#ef4444;--p115-radius:16px;}",
    ".p115 *,.p115 *::before,.p115 *::after{box-sizing:border-box;}",
    ".p115{color:var(--p115-text);font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif;}",
    ".p115 button,.p115 input{font:inherit;}",
    ".p115 button{cursor:pointer;}",
    ".p115 button:disabled{cursor:not-allowed;opacity:.55;}",

    /* search filter */
    ".p115-filter{display:grid;grid-template-columns:minmax(180px,.9fr) minmax(210px,1fr) minmax(200px,1fr) auto auto;",
    "  gap:13px;padding:15px;border:1px solid rgba(226,232,240,.95);border-radius:var(--p115-radius);",
    "  background:var(--p115-surface);box-shadow:0 5px 18px rgba(15,23,42,.04);}",
    ".p115-field label{display:block;margin-bottom:6px;color:var(--p115-muted);font-size:12px;font-weight:600;}",
    ".p115-inputwrap{position:relative;}",
    ".p115-inputwrap svg{position:absolute;top:50%;left:13px;width:18px;height:18px;color:#94a3b8;",
    "  transform:translateY(-50%);pointer-events:none;}",
    ".p115-field input{width:100%;height:43px;padding:0 13px 0 41px;color:var(--p115-text);",
    "  border:1px solid var(--p115-border);border-radius:11px;outline:none;background:#fff;transition:.18s ease;}",
    ".p115-field input::placeholder{color:#a1acba;}",
    ".p115-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14);}",
    ".p115-btn-search,.p115-btn-clear{display:inline-flex;height:43px;align-self:end;align-items:center;justify-content:center;",
    "  gap:7px;padding:0 20px;border-radius:11px;transition:.18s ease;white-space:nowrap;}",
    ".p115-btn-search{color:#fff;border:0;background:linear-gradient(135deg,var(--p115-primary),var(--p115-primary-dark));",
    "  box-shadow:0 8px 18px rgba(37,99,235,.22);}",
    ".p115-btn-search:hover{filter:brightness(1.05);transform:translateY(-1px);}",
    ".p115-btn-clear{color:var(--p115-muted);border:1px solid var(--p115-border);background:#fff;}",
    ".p115-btn-clear:hover{color:var(--p115-danger);border-color:#fecaca;background:#fef2f2;}",

    /* workspace */
    ".p115-workspace{display:grid;min-height:0;flex:1;grid-template-columns:minmax(560px,.9fr) minmax(500px,1.3fr);",
    "  gap:16px;margin-top:16px;}",
    ".p115-panel{display:flex;min-width:0;min-height:520px;flex-direction:column;overflow:hidden;",
    "  border:1px solid var(--p115-border);border-radius:var(--p115-radius);background:var(--p115-surface);",
    "  box-shadow:0 12px 30px rgba(15,23,42,.08);}",
    ".p115-panel-hdr{display:flex;min-height:62px;align-items:center;justify-content:space-between;gap:12px;",
    "  padding:11px 15px;border-bottom:1px solid var(--p115-border);background:#fff;}",
    ".p115-panel-title{display:flex;min-width:0;align-items:center;gap:10px;}",
    ".p115-panel-ic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p115-primary);",
    "  border-radius:11px;background:var(--p115-primary-light);}",
    ".p115-panel-tx{min-width:0;}",
    ".p115-panel-tx h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap;margin:0;}",
    ".p115-panel-tx p{overflow:hidden;color:var(--p115-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap;margin:0;}",
    ".p115-badge{flex:0 0 auto;padding:5px 9px;color:var(--p115-primary-dark);border-radius:99px;background:#dbeafe;",
    "  font-size:11px;font-weight:700;}",

    /* table */
    ".p115-tablewrap{min-height:0;flex:1;overflow:auto;}",
    ".p115-table{width:100%;border-collapse:collapse;white-space:nowrap;}",
    ".p115-table th{position:sticky;top:0;z-index:2;padding:10px 12px;color:var(--p115-muted);",
    "  border-bottom:1px solid var(--p115-border);background:#f8fafc;font-size:11px;font-weight:600;text-align:left;}",
    ".p115-table td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:12px;}",
    ".p115-table tbody tr{cursor:pointer;transition:.15s ease;}",
    ".p115-table tbody tr:hover{background:#f8fbff;}",
    ".p115-table tbody tr.selected{background:#eff6ff;box-shadow:inset 4px 0 var(--p115-primary);}",
    ".p115-docno{color:var(--p115-primary-dark);font-weight:600;}",
    ".p115-btn-view{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;color:var(--p115-muted);",
    "  border:1px solid var(--p115-border);border-radius:8px;background:#fff;font-size:11px;transition:.15s ease;}",
    ".p115-btn-view:hover{color:var(--p115-primary);border-color:#93c5fd;background:var(--p115-primary-light);}",
    ".p115-empty{display:none;min-height:300px;flex:1;align-items:center;justify-content:center;padding:30px;",
    "  color:var(--p115-muted);text-align:center;}",
    ".p115-empty.show{display:flex;}",
    ".p115-empty-ic{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 12px;color:#94a3b8;",
    "  border-radius:18px;background:#f1f5f9;}",
    ".p115-empty h3{color:var(--p115-text);font-size:15px;margin:0;}",
    ".p115-empty p{margin-top:4px;font-size:12px;}",
    ".p115-pager{display:none;align-items:center;gap:6px;padding:9px 12px;border-top:1px solid var(--p115-border);background:#fff;}",
    ".p115-pager.show{display:flex;}",
    ".p115-pg-btn{display:grid;width:30px;height:30px;place-items:center;color:var(--p115-muted);border:1px solid var(--p115-border);border-radius:8px;background:#fff;cursor:pointer;transition:.15s ease;}",
    ".p115-pg-btn svg{width:16px;height:16px;}",
    ".p115-pg-btn:hover:not(:disabled){color:var(--p115-primary);border-color:#93c5fd;background:var(--p115-primary-light);}",
    ".p115-pg-btn:disabled{opacity:.4;cursor:not-allowed;}",
    ".p115-pg-pages{display:flex;gap:4px;}",
    ".p115-pg-num{display:grid;min-width:30px;height:30px;place-items:center;color:var(--p115-muted);border:1px solid transparent;border-radius:8px;background:transparent;cursor:pointer;font-size:12px;transition:.15s ease;}",
    ".p115-pg-num:hover{color:var(--p115-primary);background:var(--p115-primary-light);}",
    ".p115-pg-num.active{color:#fff;background:var(--p115-primary);font-weight:700;}",
    ".p115-pg-num.ellipsis{cursor:default;background:transparent;color:#94a3b8;}",
    ".p115-pg-info{margin-left:auto;color:var(--p115-muted);font-size:11px;}",

    /* preview */
    ".p115-preview-actions{display:flex;gap:6px;}",
    ".p115-sm-btn{display:grid;width:34px;height:34px;place-items:center;color:var(--p115-muted);",
    "  border:1px solid var(--p115-border);border-radius:9px;background:#fff;transition:.15s ease;}",
    ".p115-sm-btn:hover{color:var(--p115-primary);border-color:#bfdbfe;background:var(--p115-primary-light);}",
    ".p115-preview-area{position:relative;display:grid;min-height:0;flex:1;place-items:center;overflow:auto;padding:36px;",
    "  background-color:#e8edf3;",
    "  background-image:linear-gradient(45deg,#dde4ec 25%,transparent 25%),linear-gradient(-45deg,#dde4ec 25%,transparent 25%),",
    "    linear-gradient(45deg,transparent 75%,#dde4ec 75%),linear-gradient(-45deg,transparent 75%,#dde4ec 75%);",
    "  background-position:0 0,0 10px,10px -10px,-10px 0;background-size:20px 20px;}",
    ".p115-docpage{position:relative;width:min(520px,78%);aspect-ratio:1/1.414;flex:0 0 auto;padding:38px;overflow:hidden;",
    "  color:#475569;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.25);",
    "  transform:rotate(0deg) scale(.82);transform-origin:center;transition:transform .25s ease;}",
    ".p115-mocklogo{display:grid;width:48px;height:48px;place-items:center;margin:0 auto 13px;color:var(--p115-primary);",
    "  border:2px solid var(--p115-primary);border-radius:50%;font-weight:700;}",
    ".p115-docpage h3{color:#1e293b;text-align:center;font-size:17px;margin:0;}",
    ".p115-docpage .subtitle{margin:5px 0 26px;text-align:center;font-size:10px;}",
    ".p115-line{height:9px;margin:10px 0;border-radius:5px;background:#e2e8f0;}",
    ".p115-line.short{width:58%;}",
    ".p115-line.medium{width:78%;}",
    ".p115-doctable{display:grid;grid-template-columns:1fr 1fr;margin:25px 0;border-top:1px solid #94a3b8;border-left:1px solid #94a3b8;}",
    ".p115-doctable div{min-height:44px;padding:10px;border-right:1px solid #94a3b8;border-bottom:1px solid #94a3b8;font-size:10px;}",
    ".p115-signature{position:absolute;right:45px;bottom:75px;color:#2563eb;font-family:cursive;font-size:32px;",
    "  font-style:italic;transform:rotate(-10deg);}",
    ".p115-imgwrap{max-width:92%;max-height:100%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;overflow:hidden;transform:rotate(0deg) scale(1);transform-origin:center;transition:transform .25s ease;}",
    ".p115-imgwrap img{max-width:100%;max-height:calc(100vh - 260px);border-radius:6px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.25);}",
    ".p115-img-error{display:none;flex-direction:column;align-items:center;justify-content:center;max-width:380px;color:var(--p115-muted);text-align:center;}",
    ".p115-img-error.show{display:flex;}",
    ".p115-img-error-ic{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 12px;color:#94a3b8;border-radius:18px;background:#f1f5f9;}",
    ".p115-img-error h3{color:var(--p115-text);font-size:15px;margin:0;}",
    ".p115-img-error p{margin-top:6px;font-size:12px;word-break:break-all;}",
    ".p115-zoomlabel{position:absolute;right:17px;bottom:15px;padding:6px 10px;color:#fff;border-radius:8px;",
    "  background:rgba(15,23,42,.74);font-size:11px;pointer-events:none;}",
    ".p115-fullscreen{display:none;position:fixed;inset:0;z-index:10000;flex-direction:column;background:rgba(10,15,26,.94);}",
    ".p115-fullscreen.show{display:flex;}",
    ".p115-fs-bar{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.12);}",
    ".p115-fs-title{color:#fff;font-size:14px;font-weight:700;white-space:nowrap;}",
    ".p115-fs-url{color:#94a3b8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".p115-fs-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;}",
    ".p115-fs-stage img{max-width:100%;max-height:100%;border-radius:6px;background:#fff;box-shadow:0 25px 70px rgba(0,0,0,.5);}",
    ".p115-fs-close{position:absolute;top:14px;right:16px;z-index:1;display:grid;width:40px;height:40px;place-items:center;color:#fff;",
    "  border:1px solid rgba(255,255,255,.25);border-radius:10px;background:rgba(255,255,255,.08);cursor:pointer;transition:.15s ease;}",
    ".p115-fs-close:hover{background:rgba(239,68,68,.85);border-color:transparent;}",
    ".p115-toast{position:fixed;right:22px;bottom:22px;z-index:9999;display:flex;visibility:hidden;align-items:center;",
    "  gap:9px;padding:11px 15px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;",
    "  box-shadow:0 15px 35px rgba(15,23,42,.25);font-size:12px;transform:translateY(12px);transition:.2s ease;}",
    ".p115-toast.show{visibility:visible;opacity:1;transform:translateY(0);}",

    /* responsive */
    "@media (max-width:1180px){",
    "  .p115-filter{grid-template-columns:repeat(3,minmax(180px,1fr));}",
    "  .p115-workspace{grid-template-columns:1fr;}",
    "  .p115-preview-area{min-height:650px;}",
    "}",
    "@media (max-width:760px){",
    "  .p115-filter{grid-template-columns:1fr;}",
    "  .p115-btn-search,.p115-btn-clear{width:100%;}",
    "  .p115-tablewrap{overflow-x:auto;}",
    "  .p115-table{min-width:560px;}",
    "  .p115-preview-actions{display:grid;grid-template-columns:repeat(2,34px);}",
    "}"
  ].join("\n");

  /* ---------- template ---------- */
  function buildHtml() {
    return `
    <div class="p115">
      <form class="p115-filter" id="p115Form" autocomplete="off">
        <div class="p115-field">
          <label for="p115Date">วันที่เอกสาร</label>
          <div class="p115-inputwrap">${icon("calendar")}
            <input id="p115Date" type="date" value="${todayISO()}">
          </div>
        </div>
        <div class="p115-field">
          <label for="p115DocNo">เลขใบสำคัญ</label>
          <div class="p115-inputwrap">${icon("hash")}
            <input id="p115DocNo" type="text" placeholder="เช่น IVN6909-0019">
          </div>
        </div>
        <div class="p115-field">
          <label for="p115Vehicle">ทะเบียนรถ</label>
          <div class="p115-inputwrap">${icon("car")}
            <input id="p115Vehicle" type="text" placeholder="เช่น 3ฒฆ-2666">
          </div>
        </div>
        <button class="p115-btn-search" type="submit">${icon("search")} ค้นหา</button>
        <button class="p115-btn-clear" type="button" id="p115Clear">${icon("reset")} ล้างค่า</button>
      </form>

      <div class="p115-workspace">
        <section class="p115-panel">
          <div class="p115-panel-hdr">
            <div class="p115-panel-title">
              <div class="p115-panel-ic">${icon("list")}</div>
              <div class="p115-panel-tx">
                <h2>ผลการค้นหา</h2>
                <p>เลือกเอกสารเพื่อเปิดดูรายละเอียด</p>
              </div>
            </div>
            <span class="p115-badge" id="p115Count">0 รายการ</span>
          </div>
          <div class="p115-tablewrap" id="p115TableWrap">
            <table class="p115-table">
              <thead>
                <tr>
                  <th>วันที่</th><th>เวลา</th><th>ทะเบียนรถ</th>
                  <th>เลขใบสำคัญ</th><th>คำสั่ง</th>
                </tr>
              </thead>
              <tbody id="p115Rows"></tbody>
            </table>
          </div>
          <div class="p115-empty" id="p115Empty">
            <div>
              <div class="p115-empty-ic">${icon("filesearch")}</div>
              <h3 id="p115EmptyTitle">ยังไม่ได้ค้นหา</h3>
              <p id="p115EmptySub">กรอกเงื่อนไขด้านบนแล้วกด ค้นหา</p>
            </div>
          </div>
          <div class="p115-pager" id="p115Pager">
            <button class="p115-pg-btn" id="p115Prev" type="button" title="หน้าก่อนหน้า">${icon("chevleft")}</button>
            <div class="p115-pg-pages" id="p115Pages"></div>
            <button class="p115-pg-btn" id="p115Next" type="button" title="หน้าถัดไป">${icon("chevright")}</button>
            <span class="p115-pg-info" id="p115PgInfo"></span>
          </div>
        </section>

        <section class="p115-panel">
          <div class="p115-panel-hdr">
            <div class="p115-panel-title">
              <div class="p115-panel-ic">${icon("scan")}</div>
              <div class="p115-panel-tx">
                <h2 id="p115PrevTitle">—</h2>
                <p id="p115PrevMeta">ยังไม่เลือกเอกสาร</p>
              </div>
            </div>
            <div class="p115-preview-actions">
              <button class="p115-sm-btn" type="button" id="p115ZoomOut" title="ย่อเอกสาร">${icon("zoomout")}</button>
              <button class="p115-sm-btn" type="button" id="p115ZoomIn" title="ขยายเอกสาร">${icon("zoomin")}</button>
              <button class="p115-sm-btn" type="button" id="p115Rotate" title="หมุนเอกสาร">${icon("rotate")}</button>
              <button class="p115-sm-btn" type="button" id="p115FullBtn" title="ขยายภาพเต็มจอ (Esc เพื่อปิด)">${icon("fullscreen")}</button>
            </div>
          </div>
          <div class="p115-preview-area">
            <article class="p115-docpage" id="p115DocPage">
              <div class="p115-mocklogo">MCT</div>
              <h3>ใบรับรองการตรวจสอบเอกสาร</h3>
              <p class="subtitle">Document Verification Form</p>
              <div class="p115-line medium"></div>
              <div class="p115-line"></div>
              <div class="p115-line short"></div>
              <div class="p115-doctable">
                <div><strong>เลขที่เอกสาร</strong><br><span id="p115PageNo">—</span></div>
                <div><strong>วันที่</strong><br><span id="p115PageDate">—</span></div>
                <div><strong>ทะเบียนรถ</strong><br><span id="p115PageVehicle">—</span></div>
                <div><strong>สถานะ</strong><br>ตรวจสอบแล้ว</div>
              </div>
              <div class="p115-line"></div>
              <div class="p115-line"></div>
              <div class="p115-line medium"></div>
              <div class="p115-line short"></div>
              <div class="p115-signature">Approved</div>
            </article>
            <div class="p115-imgwrap" id="p115ImgWrap" style="display:none">
              <img id="p115Img" alt="เอกสาร" draggable="false">
            </div>
            <div class="p115-img-error" id="p115ImgError" style="display:none">
              <div class="p115-img-error-ic">${icon("filesearch")}</div>
              <h3>ไม่สามารถเปิดภาพได้</h3>
              <p id="p115ImgErrorMsg"></p>
            </div>
            <span class="p115-zoomlabel" id="p115ZoomLabel">100%</span>
          </div>
        </section>
      </div>

      <div class="p115-fullscreen" id="p115Fullscreen">
        <button class="p115-fs-close" id="p115FullClose" type="button" title="ปิด (Esc)">${icon("close")}</button>
        <div class="p115-fs-bar">
          <span class="p115-fs-title" id="p115FsTitle"></span>
          <span class="p115-fs-url" id="p115FsUrl"></span>
        </div>
        <div class="p115-fs-stage">
          <img id="p115FsImg" alt="เอกสารเต็มจอ" draggable="false">
        </div>
      </div>

      <div class="p115-toast" id="p115Toast">${icon("check")}<span id="p115ToastMsg"></span></div>
    </div>`;
  }

  function rowHtml(d, selected) {
    return `<tr class="${selected ? "selected" : ""}" data-p115-id="${esc(d.id)}">` +
      "<td>" + esc(d.date) + "</td>" +
      "<td>" + esc(d.time) + "</td>" +
      "<td>" + esc(d.vehicle) + "</td>" +
      '<td class="p115-docno">' + esc(d.number) + "</td>" +
      `<td><button class="p115-btn-view" type="button" data-p115-copy="${esc(d.id)}" title="คัดลอกลิงก์ภาพ">${icon("copy")} คัดลอกลิงก์</button></td>` +
      "</tr>";
  }

  /* ---------- mount ---------- */
  function mount(root) {
    // style ซับเพียงครั้งเดียวต่อ document
    if (!document.getElementById("p115Style")) {
      var style = document.createElement("style");
      style.id = "p115Style";
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    root.innerHTML = buildHtml();
    var $ = function (id) { return root.querySelector("#" + id); };

    var state = {
      filtered: null,        // null = ยังไม่ค้นหา
      selected: null,        // id ของแถวที่เลือก
      currentDoc: null,      // doc ที่กำลังแสดงในช่องขวา
      page: 1,               // หน้าปัจจุบัน (PAGE_SIZE = 15 รายการ/หน้า)
      zoom: ZOOM_DEFAULT,
      rotation: 0,
      tmsBase: "",           // URL base จาก settings ลิงก์ TMS
      toastTimer: null
    };

    // โหลด base URL จาก settings (ลิงก์ชื่อ [TMS])
    loadTmsBase().then(function (base) {
      state.tmsBase = base;
      // ถ้ากำลังดูภาพอยู่ ให้ load อีกครั้งด้วย base ที่ถูกต้อง
      var doc = currentList().find(function (d) { return d.id === state.selected; });
      if (doc) showImage(doc);
    });

    /* ---------- helpers ---------- */
    function currentList() {
      return state.filtered || [];
    }

    function showToast(msg, duration) {
      $("p115ToastMsg").textContent = msg;
      $("p115Toast").classList.add("show");
      clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(function () { $("p115Toast").classList.remove("show"); }, duration || 1800);
    }

    function updateTransform() {
      var t = "rotate(" + state.rotation + "deg) scale(" + state.zoom + ")";
      $("p115DocPage").style.transform = t;
      var wrap = $("p115ImgWrap");
      if (wrap) wrap.style.transform = t;
      $("p115ZoomLabel").textContent = Math.round(state.zoom * 100) + "%";
    }

    function showImage(doc, notify) {
      var wrap = $("p115ImgWrap");
      var errBox = $("p115ImgError");
      var img = $("p115Img");
      var url = buildImageUrl(state.tmsBase, doc);
      if (!url) {
        wrap.style.display = "none";
        errBox.style.display = "flex";
        $("p115ImgErrorMsg").textContent = state.tmsBase
          ? "ไม่พบภาพ: " + doc.folderName + "/" + doc.fileName
          : "ยังไม่ได้ตั้งค่าลิงก์ [TMS] ในหน้า ตั้งค่า › ลิงก์ระบบ (URL)";
        if (notify) showToast("⚠ " + $("p115ImgErrorMsg").textContent, 3200);
        return;
      }
      errBox.style.display = "none";
      wrap.style.display = "block";
      img.style.transform = "";
      img.onerror = function () {
        wrap.style.display = "none";
        errBox.style.display = "flex";
        $("p115ImgErrorMsg").textContent = "โหลดภาพไม่สำเร็จ: " + url;
        showToast("❌ " + $("p115ImgErrorMsg").textContent, 4200);
      };
      img.src = url;
      updateTransform();
    }

    function setPreview(doc, notify) {
      var docPage = $("p115DocPage");
      var wrap = $("p115ImgWrap");
      var errBox = $("p115ImgError");
      if (!doc) {
        state.selected = null;
        state.currentDoc = null;
        $("p115PrevTitle").textContent = "—";
        $("p115PrevMeta").textContent = "ยังไม่เลือกเอกสาร";
        $("p115PageNo").textContent = "—";
        $("p115PageDate").textContent = "—";
        $("p115PageVehicle").textContent = "—";
        docPage.style.display = "";
        wrap.style.display = "none";
        errBox.style.display = "none";
        return;
      }
      state.selected = doc.id;
      state.currentDoc = doc;
      $("p115PrevTitle").textContent = doc.number;
      $("p115PrevMeta").textContent = doc.date + " · " + doc.time + " น.";
      $("p115PageNo").textContent = doc.number;
      $("p115PageDate").textContent = doc.date;
      $("p115PageVehicle").textContent = doc.vehicle;
      docPage.style.display = "none";
      showImage(doc, notify);
    }

    function renderRows() {
      var list = currentList();
      var total = list.length;
      var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (state.page > pages) state.page = pages;
      if (state.page < 1) state.page = 1;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = list.slice(start, start + PAGE_SIZE);

      if (total > 0) {
        $( "p115Count").textContent = total + " รายการ (หน้า " + state.page + "/" + pages + ")";
      } else {
        $( "p115Count").textContent = "0 รายการ";
      }

      if (total === 0) {
        $( "p115TableWrap").style.display = "none";
        $( "p115Empty").classList.add("show");
        $( "p115Pager").classList.remove("show");
        if (state.filtered === null) {
          $( "p115EmptyTitle").textContent = "ยังไม่ได้ค้นหา";
          $( "p115EmptySub").textContent = "กรอกเงื่อนไขด้านบนแล้วกด ค้นหา";
        } else {
          $( "p115EmptyTitle").textContent = "ไม่พบเอกสาร";
          $( "p115EmptySub").textContent = "ลองเปลี่ยนเลขใบสำคัญหรือทะเบียนรถแล้วค้นหาอีกครั้ง";
        }
        return;
      }
      $( "p115TableWrap").style.display = "block";
      $( "p115Empty").classList.remove("show");
      $( "p115Rows").innerHTML = pageItems.map(function (d) {
        return rowHtml(d, d.id === state.selected);
      }).join("");
      renderPager(total, pages, start, pageItems.length);
    }

    function renderPager(total, pages, start, shown) {
      var pager = $( "p115Pager");
      pager.classList.toggle("show", pages > 1);
      if (pages <= 1) return;
      var cur = state.page;
      var nums = [];
      function push(n) { nums.push(n); }
      // แสดง 1 ... k-1 k k+1 ... pages
      push(1);
      var lo = Math.max(2, cur - 1), hi = Math.min(pages - 1, cur + 1);
      if (lo > 2) push("…");
      for (var p = lo; p <= hi; p++) push(p);
      if (hi < pages - 1) push("…");
      if (pages > 1) push(pages);
      $( "p115Pages").innerHTML = nums.map(function (n) {
        if (n === "…") return '<span class="p115-pg-num ellipsis">…</span>';
        return '<button class="p115-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p115-page="' + n + '">' + n + "</button>";
      }).join("");
      $( "p115Prev").disabled = cur <= 1;
      $( "p115Next").disabled = cur >= pages;
      $( "p115PgInfo").textContent = "แสดง " + (start + 1) + "–" + (start + shown) + " จาก " + total + " รายการ";
    }

    function gotoPage(n) {
      var pages = Math.max(1, Math.ceil(currentList().length / PAGE_SIZE));
      var target = Math.min(pages, Math.max(1, n));
      if (target === state.page) return;
      state.page = target;
      renderRows();
    }

    /* ---------- search / clear ---------- */
    function doSearch() {
      var date = $("p115Date").value;
      var no = $("p115DocNo").value.trim();
      var veh = $("p115Vehicle").value.trim();
      var button = root.querySelector(".p115-btn-search");
      if (!date) {
        showToast("กรุณาระบุวันที่เอกสาร");
        return;
      }
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.lastChild.textContent = " กำลังค้นหา...";
      apiSearch({ date: date, invoiceId: no, truckLicense: veh })
        .then(function (data) {
          state.filtered = data.documents.map(normalizeDocument);
          state.page = 1;
          if (state.filtered.length > 0) {
            var keep = state.filtered.find(function (d) { return d.id === state.selected; });
            setPreview(keep || state.filtered[0]);
          } else {
            setPreview(null);
            showToast("⚠ ไม่พบข้อมูล — ไม่มีเอกสารที่ตรงกับเงื่อนไขค้นหา", 3200);
          }
          renderRows();
        })
        .catch(function (error) {
          state.filtered = [];
          state.page = 1;
          setPreview(null);
          renderRows();
          showToast(error.message || "ค้นหาข้อมูลไม่สำเร็จ");
        })
        .then(function () {
          button.disabled = false;
          button.removeAttribute("aria-busy");
          button.lastChild.textContent = " ค้นหา";
        });
    }

    function doClear() {
      $( "p115Date").value = todayISO();
      $( "p115DocNo").value = "";
      $( "p115Vehicle").value = "";
      state.filtered = null;
      state.page = 1;
      setPreview(null);
      renderRows();
      showToast("ล้างเงื่อนไขการค้นหาแล้ว");
    }

    /* ---------- events ---------- */
    $( "p115Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });
    $( "p115Clear").addEventListener("click", doClear);

    // pagination
    $( "p115Prev").addEventListener("click", function () { gotoPage(state.page - 1); });
    $( "p115Next").addEventListener("click", function () { gotoPage(state.page + 1); });
    $( "p115Pages").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p115-page]");
      if (btn) gotoPage(parseInt(btn.getAttribute("data-p115-page"), 10));
    });

    // ปุ่ม "คัดลอกลิงก์" — copy URL ภาพเข้า clipboard
    function copyLink(doc) {
      var url = buildImageUrl(state.tmsBase, doc);
      if (!url) {
        showToast("⚠ ยังไม่ได้ตั้งค่าลิงก์ TMS ในหน้า ตั้งค่า › ลิงก์ระบบ (URL)", 3200);
        return;
      }
      function done() { showToast("📋 คัดลอกลิงก์ภาพแล้ว", 2200); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch (err) {
          showToast("❌ คัดลอกไม่สำเร็จ — คัดลอก URL ได้จากช่องดูภาพ", 3500);
        }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, fallback);
      } else {
        fallback();
      }
    }

    // เต็มจอ — แสดงภาพใน overlay ทั้งจอ (Esc / ปุ่ม X ปิด)
    function openFullscreen() {
      var doc = state.currentDoc;
      if (!doc) {
        showToast("⚠ ยังไม่ได้เลือกเอกสาร — คลิกแถวแล้วกดเต็มจอได้", 2600);
        return;
      }
      var url = buildImageUrl(state.tmsBase, doc);
      if (!url) {
        showToast("⚠ ยังไม่ได้ตั้งค่าลิงก์ TMS ในหน้า ตั้งค่า › ลิงก์ระบบ (URL)", 3200);
        return;
      }
      $("p115FsTitle").textContent = doc.number;
      $("p115FsUrl").textContent = url;
      var fsImg = $("p115FsImg");
      fsImg.onerror = function () {
        fsImg.removeAttribute("src");
        showToast("❌ โหลดภาพไม่สำเร็จ: " + url, 4200);
      };
      fsImg.src = url;
      $("p115Fullscreen").classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closeFullscreen() {
      $("p115Fullscreen").classList.remove("show");
      $("p115FsImg").removeAttribute("src");
      document.body.style.overflow = "";
    }

    // คลิกแถว — เลือกเอกสาร / ปุ่ม "คัดลอกลิงก์" — copy URL
    $("p115Rows").addEventListener("click", function (e) {
      var copyBtn = e.target.closest("[data-p115-copy]");
      if (copyBtn) {
        e.stopPropagation();
        var copyId = Number(copyBtn.getAttribute("data-p115-copy"));
        var copyDoc = currentList().find(function (d) { return d.id === copyId; });
        if (copyDoc) copyLink(copyDoc);
        return;
      }
      var tr = e.target.closest("tr[data-p115-id]");
      if (!tr) return;
      var rowId = Number(tr.getAttribute("data-p115-id"));
      var doc = currentList().find(function (d) { return d.id === rowId; });
      if (doc) {
        setPreview(doc, true);
        renderRows();
      }
    });

    $("p115ZoomIn").addEventListener("click", function () {
      state.zoom = Math.min(ZOOM_MAX, state.zoom + ZOOM_STEP);
      updateTransform();
    });
    $("p115ZoomOut").addEventListener("click", function () {
      state.zoom = Math.max(ZOOM_MIN, state.zoom - ZOOM_STEP);
      updateTransform();
    });
    $("p115Rotate").addEventListener("click", function () {
      state.rotation = (state.rotation + 90) % 360;
      updateTransform();
    });

    // เต็มจอ
    $("p115FullBtn").addEventListener("click", openFullscreen);
    $("p115FullClose").addEventListener("click", closeFullscreen);
    $("p115Fullscreen").addEventListener("click", function (e) {
      if (e.target === this) closeFullscreen();
    });
    if (escHandler) document.removeEventListener("keydown", escHandler);
    escHandler = function (e) {
      if (e.key === "Escape" && root.querySelector("#p115Fullscreen.show")) {
        closeFullscreen();
      }
    };
    document.addEventListener("keydown", escHandler);

    updateTransform();
    renderRows();
  }

  window.P115ViewPicture = { mount: mount };
})();
