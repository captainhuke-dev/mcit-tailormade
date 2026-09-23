/* P022 — View Billing Document (UI skeleton — ยังไม่มีข้อมูล)
 * Layout ตาม demo/P022_demo.html:
 * - แถบค้นหา: รหัสลูกค้า / ชื่อลูกค้า + ปุ่มค้นหา/ล้างค่า
 * - แผงซ้าย: รายชื่อลูกค้า (รหัส | ชื่อ | (อำเภอ/เขต) | คัดลอก) — ยังไม่มีข้อมูล
 * - แผงขวา: เอกสารลูกค้า 2 ช่อง (zoom/rotate/คืนค่า — placeholder "ยังไม่มีภาพ")
 */
(function () {
  "use strict";

  var ZOOM_MIN = 0.3, ZOOM_MAX = 2.5, ZOOM_STEP = 0.1, ZOOM_DEFAULT = 1.0;
  var PAGE_SIZE = 15;
  var API_URL = "api/p022_customers.php";
  var NAS199_CONNECTION_ID = "c1789008966784";

  /* ---------- icons (inline SVG — ไม่ขึ้นอยู่กับ CDN) ---------- */
  var ICON_PATHS = {
    hash: '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
    user: '<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><polyline points="3 3 3 8 8 8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    zoomout: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="8" y1="11" x2="14" y2="11"/>',
    zoomin: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>',
    rotate: '<path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    chevleft: '<polyline points="15 18 9 12 15 6"/>',
    chevright: '<polyline points="9 18 15 12 9 6"/>',
    check: '<circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/>',
    fullscreen: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    spinner: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>'
  };

  function icon(name) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON_PATHS[name] || "") + "</svg>";
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- API (Nas199 mct_mobile) ---------- */
  function apiSearch(code, name) {
    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: NAS199_CONNECTION_ID,
        code: code,
        name: name
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

  // ลิงก์ระบบชื่อ BILLING — base URL ของภาพเอกสาร
  function loadBillingBase() {
    return fetch("api/links.php")
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.ok && Array.isArray(data.links)) {
          var found = data.links.filter(function (l) {
            var n = String(l.name || "").trim();
            return n === "BILLING" || n === "[BILLING]";
          })[0];
          return found ? String(found.url || "") : "";
        }
        return "";
      })
      .catch(function () { return ""; });
  }

  // link = "folder_name/file_name" → base + "/" + folder + "/" + file
  function buildImageUrl(base, link) {
    if (!base || !link) return "";
    var b = String(base).replace(/[/\\]+$/, "");
    return b + "/" + link.split("/").map(encodeURIComponent).join("/");
  }

  /* ---------- CSS ---------- */
  var CSS = [
    ".p022{--p022-primary:#2563eb;--p022-primary-dark:#1d4ed8;--p022-primary-light:#eff6ff;",
    "  --p022-surface:#fff;--p022-text:#172033;--p022-muted:#64748b;--p022-border:#e2e8f0;",
    "  --p022-success:#10b981;--p022-danger:#ef4444;--p022-radius:16px;}",
    ".p022{color:var(--p022-text);font-family:'Noto Sans Thai','Sarabun',system-ui,sans-serif;}",
    ".p022 svg{display:block;width:20px;height:20px;}",

    /* search bar */
    ".p022-filter{display:grid;grid-template-columns:minmax(180px,.8fr) minmax(250px,1.4fr) auto auto;",
    "  gap:13px;padding:15px;border:1px solid rgba(226,232,240,.95);border-radius:var(--p022-radius);",
    "  background:var(--p022-surface);box-shadow:0 5px 18px rgba(15,23,42,.04);}",
    ".p022-field label{display:block;margin-bottom:6px;color:var(--p022-muted);font-size:12px;font-weight:600;}",
    ".p022-inputwrap{position:relative;}",
    ".p022-inputwrap>svg{position:absolute;top:50%;left:13px;width:18px;height:18px;color:#94a3b8;",
    "  transform:translateY(-50%);pointer-events:none;}",
    ".p022-field input{width:100%;height:43px;padding:0 13px 0 41px;color:var(--p022-text);",
    "  border:1px solid var(--p022-border);border-radius:11px;outline:none;background:#fff;transition:.18s ease;}",
    ".p022-field input::placeholder{color:#a1acba;}",
    ".p022-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14);}",
    ".p022-btn-search,.p022-btn-clear{display:inline-flex;height:43px;align-self:end;align-items:center;justify-content:center;",
    "  gap:7px;padding:0 20px;border-radius:11px;transition:.18s ease;white-space:nowrap;}",
    ".p022-btn-search{color:#fff;border:0;background:linear-gradient(135deg,var(--p022-primary),var(--p022-primary-dark));",
    "  box-shadow:0 8px 18px rgba(37,99,235,.22);}",
    ".p022-btn-search:hover{filter:brightness(1.05);transform:translateY(-1px);}",
    ".p022-btn-search:disabled{opacity:.7;cursor:wait;transform:none;}",
    ".p022-btn-search .p022-spin{animation:p022spin .8s linear infinite;}",
    "@keyframes p022spin{to{transform:rotate(360deg);}}",
    ".p022-busy{display:none;align-items:center;gap:7px;color:var(--p022-primary);font-size:11px;font-weight:600;}",
    ".p022-busy.show{display:inline-flex;}",
    ".p022-busy svg{width:14px;height:14px;animation:p022spin .8s linear infinite;}",
    ".p022-btn-clear{color:var(--p022-muted);border:1px solid var(--p022-border);background:#fff;}",
    ".p022-btn-clear:hover{color:var(--p022-danger);border-color:#fecaca;background:#fef2f2;}",

    /* workspace */
    ".p022-workspace{display:grid;min-height:0;grid-template-columns:minmax(460px,.82fr) minmax(620px,1.5fr);",
    "  gap:16px;margin-top:16px;}",
    ".p022-panel{display:flex;min-width:0;min-height:520px;flex-direction:column;overflow:hidden;",
    "  border:1px solid var(--p022-border);border-radius:var(--p022-radius);background:var(--p022-surface);",
    "  box-shadow:0 12px 30px rgba(15,23,42,.08);}",
    ".p022-panel-hdr{display:flex;min-height:62px;align-items:center;justify-content:space-between;gap:12px;",
    "  padding:11px 15px;border-bottom:1px solid var(--p022-border);background:#fff;}",
    ".p022-panel-title{display:flex;min-width:0;align-items:center;gap:10px;}",
    ".p022-panel-ic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:var(--p022-primary);",
    "  border-radius:11px;background:var(--p022-primary-light);}",
    ".p022-panel-ic svg{width:19px;height:19px;}",
    ".p022-panel-tx{min-width:0;}",
    ".p022-panel-tx h2{overflow:hidden;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap;margin:0;}",
    ".p022-panel-tx p{overflow:hidden;color:var(--p022-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap;margin:0;}",
    ".p022-badge{flex:0 0 auto;padding:5px 9px;color:var(--p022-primary-dark);border-radius:99px;background:#dbeafe;",
    "  font-size:11px;font-weight:700;}",

    /* customer table */
    ".p022-tablewrap{min-height:0;flex:1;overflow:auto;}",
    ".p022-table{width:100%;border-collapse:collapse;white-space:nowrap;}",
    ".p022-table th{position:sticky;top:0;z-index:2;padding:10px 12px;color:var(--p022-muted);",
    "  border-bottom:1px solid var(--p022-border);background:#f8fafc;font-size:11px;font-weight:600;text-align:left;}",
    ".p022-table td{max-width:250px;overflow:hidden;padding:10px 12px;border-bottom:1px solid #f1f5f9;",
    "  font-size:12px;text-overflow:ellipsis;}",
    ".p022-table tbody tr{cursor:pointer;transition:.15s ease;}",
    ".p022-table tbody tr:hover{background:#f8fbff;}",
    ".p022-table tbody tr.selected{background:#eff6ff;box-shadow:inset 4px 0 var(--p022-primary);}",
    ".p022-code{color:var(--p022-primary-dark);font-weight:700;}",
    ".p022-district{color:var(--p022-muted);}",
    ".p022 .req{color:#dc2626;}",
    ".p022-pager{display:none;align-items:center;gap:6px;padding:9px 12px;border-top:1px solid var(--p022-border);background:#fff;}",
    ".p022-pager.show{display:flex;}",
    ".p022-pg-btn{display:grid;width:30px;height:30px;place-items:center;color:var(--p022-muted);border:1px solid var(--p022-border);border-radius:8px;background:#fff;cursor:pointer;transition:.15s ease;}",
    ".p022-pg-btn svg{width:16px;height:16px;}",
    ".p022-pg-btn:hover:not(:disabled){color:var(--p022-primary);border-color:#93c5fd;background:var(--p022-primary-light);}",
    ".p022-pg-btn:disabled{opacity:.4;cursor:default;}",
    ".p022-pg-pages{display:flex;align-items:center;gap:4px;}",
    ".p022-pg-num{min-width:30px;height:30px;padding:0 6px;display:grid;place-items:center;color:var(--p022-muted);",
    "  border:1px solid var(--p022-border);border-radius:8px;background:#fff;font-size:12px;cursor:pointer;transition:.15s ease;}",
    ".p022-pg-num:hover:not(.active){color:var(--p022-primary);border-color:#93c5fd;background:var(--p022-primary-light);}",
    ".p022-pg-num.active{color:#fff;border-color:var(--p022-primary);background:var(--p022-primary);}",
    ".p022-pg-num.ellipsis{border:0;background:transparent;cursor:default;}",
    ".p022-pg-info{margin-left:auto;color:var(--p022-muted);font-size:11px;white-space:nowrap;}",
    ".p022-empty{display:none;min-height:300px;flex:1;align-items:center;justify-content:center;padding:30px;",
    "  color:var(--p022-muted);text-align:center;}",
    ".p022-empty.show{display:flex;}",
    ".p022-empty-ic{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 12px;color:#94a3b8;",
    "  border-radius:18px;background:#f1f5f9;}",
    ".p022-empty h3{color:var(--p022-text);font-size:15px;margin:0;}",
    ".p022-empty p{margin-top:4px;font-size:12px;}",

    /* preview */
    ".p022-preview-actions{display:flex;align-items:center;gap:6px;}",
    ".p022-toolbtn{display:grid;width:34px;height:34px;place-items:center;color:var(--p022-muted);",
    "  border:1px solid var(--p022-border);border-radius:9px;background:#fff;cursor:pointer;transition:.15s ease;}",
    ".p022-toolbtn svg{width:16px;height:16px;}",
    ".p022-toolbtn:hover{color:var(--p022-primary);border-color:#93c5fd;background:var(--p022-primary-light);}",
    ".p022-grid{display:grid;min-height:0;flex:1;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;",
    "  padding:12px;background:#edf1f6;}",
    ".p022-card{display:flex;min-width:0;min-height:0;flex-direction:column;overflow:hidden;",
    "  border:1px solid #d7dee8;border-radius:13px;background:#fff;}",
    ".p022-card-hdr{display:flex;min-height:45px;align-items:center;justify-content:space-between;gap:10px;",
    "  padding:8px 11px;border-bottom:1px solid var(--p022-border);background:#fff;}",
    ".p022-card-info{min-width:0;}",
    ".p022-card-info strong{display:block;overflow:hidden;font-size:11px;text-overflow:ellipsis;white-space:nowrap;}",
    ".p022-card-info span{display:block;overflow:hidden;margin-top:1px;color:var(--p022-muted);font-size:9px;",
    "  text-overflow:ellipsis;white-space:nowrap;}",
    ".p022-card-num{display:grid;width:25px;height:25px;flex:0 0 auto;place-items:center;color:var(--p022-primary-dark);",
    "  border-radius:8px;background:#dbeafe;font-size:10px;font-weight:700;}",
    ".p022-viewer{position:relative;display:grid;min-height:0;flex:1;place-items:center;overflow:auto;padding:18px;",
    "  background-color:#d5dbe3;background-image:",
    "  linear-gradient(45deg,#cbd2dc 25%,transparent 25%),linear-gradient(-45deg,#cbd2dc 25%,transparent 25%),",
    "  linear-gradient(45deg,transparent 75%,#cbd2dc 75%),linear-gradient(-45deg,transparent 75%,#cbd2dc 75%);",
    "  background-position:0 0,0 10px,10px -10px,-10px 0;background-size:20px 20px;}",
    ".p022-viewer img{display:none;max-width:92%;max-height:92%;object-fit:contain;background:#fff;",
    "  box-shadow:0 15px 35px rgba(15,23,42,.3);transform-origin:center;transition:transform .2s ease;user-select:none;}",
    ".p022-viewer img.visible{display:block;}",
    ".p022-placeholder{display:flex;max-width:290px;align-items:center;flex-direction:column;color:#64748b;text-align:center;}",
    ".p022-placeholder.hidden{display:none;}",
    ".p022-placeholder-ic{display:grid;width:65px;height:65px;place-items:center;margin-bottom:12px;color:var(--p022-primary);",
    "  border:1px solid #93c5fd;border-radius:20px;background:rgba(239,246,255,.92);}",
    ".p022-placeholder-ic svg{width:29px;height:29px;}",
    ".p022-placeholder strong{color:#334155;font-size:13px;}",
    ".p022-placeholder p{margin:4px 0 0;font-size:10px;line-height:1.6;}",
    ".p022-zoomlabel{position:absolute;right:9px;bottom:9px;padding:5px 8px;color:#fff;border-radius:7px;",
    "  background:rgba(15,23,42,.75);font-size:9px;pointer-events:none;}",
    ".p022-card-ftr{display:flex;min-height:42px;align-items:center;justify-content:space-between;gap:8px;",
    "  padding:6px 9px;border-top:1px solid var(--p022-border);background:#fff;}",
    ".p022-filestatus{display:flex;min-width:0;align-items:center;gap:6px;color:var(--p022-muted);font-size:10px;}",
    ".p022-filestatus svg{width:14px;height:14px;flex:0 0 auto;color:var(--p022-success);}",
    ".p022-filestatus span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".p022-mini{display:grid;width:28px;height:28px;place-items:center;color:var(--p022-muted);",
    "  border:1px solid var(--p022-border);border-radius:7px;background:#fff;cursor:pointer;transition:.15s ease;}",
    ".p022-mini svg{width:13px;height:13px;}",
    ".p022-mini:hover{color:var(--p022-primary);border-color:#93c5fd;background:var(--p022-primary-light);}",

    /* fullscreen */
    ".p022-fullscreen{display:none;position:fixed;inset:0;z-index:10000;flex-direction:column;background:rgba(10,15,26,.94);}",
    ".p022-fullscreen.show{display:flex;}",
    ".p022-fs-bar{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.12);}",
    ".p022-fs-title{color:#fff;font-size:14px;font-weight:700;white-space:nowrap;}",
    ".p022-fs-url{color:#94a3b8;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".p022-fs-stage{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;}",
    ".p022-fs-stage img{max-width:100%;max-height:100%;border-radius:6px;background:#fff;box-shadow:0 25px 70px rgba(0,0,0,.5);}",
    ".p022-fs-close{position:absolute;top:14px;right:16px;z-index:1;display:grid;width:40px;height:40px;place-items:center;color:#fff;",
    "  border:1px solid rgba(255,255,255,.25);border-radius:10px;background:rgba(255,255,255,.1);cursor:pointer;transition:.15s ease;}",
    ".p022-fs-close svg{width:18px;height:18px;}",
    ".p022-fs-close:hover{background:rgba(239,68,68,.85);border-color:transparent;}",

    /* toast */
    ".p022-toast{position:fixed;right:22px;bottom:22px;z-index:9999;display:flex;visibility:hidden;align-items:center;",
    "  gap:9px;padding:11px 15px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;",
    "  box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease;}",
    ".p022-toast.show{visibility:visible;opacity:1;transform:translateY(0);}",
    ".p022-toast svg{width:17px;height:17px;color:#34d399;}",

    /* responsive */
    "@media (max-width:1180px){.p022-workspace{grid-template-columns:1fr;}.p022-grid{min-height:500px;}}",
    "@media (max-width:760px){.p022-filter{grid-template-columns:1fr;}.p022-btn-search,.p022-btn-clear{width:100%;}",
    "  .p022-grid{grid-template-columns:1fr;}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  function slotHtml(n) {
    var num = n === 1 ? "01" : "02";
    return `
      <section class="p022-card">
        <div class="p022-card-hdr">
          <div class="p022-card-info">
            <strong>เอกสารช่องที่ ${n}</strong>
            <span>ยังไม่ได้เลือกเอกสาร</span>
          </div>
          <span class="p022-card-num">${num}</span>
        </div>
        <div class="p022-viewer">
          <div class="p022-placeholder" id="p022Placeholder${n}">
            <div class="p022-placeholder-ic">${icon("image")}</div>
            <strong>เอกสารรูปที่ ${n}</strong>
            <p>ยังไม่มีภาพ</p>
          </div>
          <img id="p022Img${n}" alt="เอกสารช่องที่ ${n}" draggable="false">
          <span class="p022-zoomlabel" id="p022Zoom${n}">100%</span>
        </div>
        <div class="p022-card-ftr">
          <div class="p022-filestatus">${icon("check")}<span id="p022FileStatus${n}">พร้อมแสดงภาพ</span></div>
          <div style="display:flex;gap:4px">
            <button class="p022-mini" type="button" data-p022-zoomout="${n}" title="ย่อ">${icon("zoomout")}</button>
            <button class="p022-mini" type="button" data-p022-zoomin="${n}" title="ขยาย">${icon("zoomin")}</button>
            <button class="p022-mini" type="button" data-p022-rotate="${n}" title="หมุน">${icon("rotate")}</button>
            <button class="p022-mini" type="button" data-p022-full="${n}" title="ขยายภาพเต็มจอ (Esc เพื่อปิด)">${icon("fullscreen")}</button>
          </div>
        </div>
      </section>`;
  }

  function buildHtml() {
    return `
    <div class="p022">
      <form class="p022-filter" id="p022Form" autocomplete="off">
        <div class="p022-field">
          <label for="p022Code">รหัสลูกค้า <span class="req">*</span></label>
          <div class="p022-inputwrap">${icon("hash")}
            <input id="p022Code" type="text" placeholder="กรอกรหัสลูกค้า">
          </div>
        </div>
        <div class="p022-field">
          <label for="p022Name">ชื่อลูกค้า <span class="req">*</span></label>
          <div class="p022-inputwrap">${icon("user")}
            <input id="p022Name" type="text" placeholder="กรอกชื่อลูกค้า">
          </div>
        </div>
        <button class="p022-btn-search" id="p022SearchBtn" type="submit">${icon("search")} ค้นหา</button>
        <button class="p022-btn-clear" id="p022Clear" type="button">${icon("reset")} ล้างค่า</button>
      </form>

      <section class="p022-workspace">
        <article class="p022-panel">
          <div class="p022-panel-hdr">
            <div class="p022-panel-title">
              <div class="p022-panel-ic">${icon("users")}</div>
              <div class="p022-panel-tx">
                <h2>รายชื่อลูกค้า</h2>
                <p>เลือกข้อมูลลูกค้าเพื่อแสดงเอกสาร</p>
              </div>
            </div>
            <span class="p022-badge" id="p022Count">0 รายการ</span>
          </div>
          <div class="p022-tablewrap" id="p022TableWrap">
            <table class="p022-table">
              <thead>
                <tr>
                  <th>รหัสลูกค้า</th>
                  <th>ชื่อลูกค้า</th>
                  <th>อำเภอ/เขต</th>
                </tr>
              </thead>
              <tbody id="p022Rows"></tbody>
            </table>
          </div>
          <div class="p022-pager" id="p022Pager">
            <button class="p022-pg-btn" id="p022Prev" type="button" title="หน้าก่อนหน้า">${icon("chevleft")}</button>
            <div class="p022-pg-pages" id="p022Pages"></div>
            <button class="p022-pg-btn" id="p022Next" type="button" title="หน้าถัดไป">${icon("chevright")}</button>
            <span class="p022-pg-info" id="p022PgInfo"></span>
          </div>
          <div class="p022-empty show" id="p022Empty">
            <div>
              <div class="p022-empty-ic">${icon("search")}</div>
              <h3>ไม่พบข้อมูลลูกค้า</h3>
              <p>ลองเปลี่ยนรหัสหรือชื่อลูกค้าแล้วค้นหาอีกครั้ง</p>
            </div>
          </div>
        </article>

        <article class="p022-panel">
          <div class="p022-panel-hdr">
            <div class="p022-panel-title">
              <div class="p022-panel-ic">${icon("image")}</div>
              <div class="p022-panel-tx">
                <h2 id="p022PreviewTitle">เอกสารลูกค้า</h2>
                <p id="p022PreviewSub">เลือกลูกค้าเพื่อแสดงเอกสาร</p>
              </div>
            </div>
            <div class="p022-preview-actions">
              <button class="p022-toolbtn" id="p022ZoomOutAll" type="button" title="ย่อรูปทั้งหมด">${icon("zoomout")}</button>
              <button class="p022-toolbtn" id="p022ZoomInAll" type="button" title="ขยายรูปทั้งหมด">${icon("zoomin")}</button>
              <button class="p022-toolbtn" id="p022ResetAll" type="button" title="คืนค่ารูปทั้งหมด">${icon("reset")}</button>
            </div>
          </div>
          <div class="p022-grid">
            ${slotHtml(1)}
            ${slotHtml(2)}
          </div>
        </article>
      </section>

      <div class="p022-toast" id="p022Toast">${icon("check")}<span id="p022ToastMsg"></span></div>

      <div class="p022-fullscreen" id="p022Fullscreen">
        <button class="p022-fs-close" id="p022FullClose" type="button" title="ปิด (Esc)">${icon("close")}</button>
        <div class="p022-fs-bar">
          <span class="p022-fs-title" id="p022FsTitle"></span>
          <span class="p022-fs-url" id="p022FsUrl"></span>
        </div>
        <div class="p022-fs-stage">
          <img id="p022FsImg" alt="ขยายภาพเต็มจอ" draggable="false">
        </div>
      </div>
    </div>`;
  }

  /* ---------- mount ---------- */
  function mount(root) {
    if (!document.getElementById("p022Style")) {
      var style = document.createElement("style");
      style.id = "p022Style";
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    root.innerHTML = buildHtml();
    var $ = function (id) { return root.querySelector("#" + id); };

    var state = {
      customers: null,   // null = ยังไม่ค้นหา
      selected: null,    // code ของลูกค้าที่เลือก
      page: 1,           // หน้าปัจจุบัน (PAGE_SIZE = 15 รายการ/หน้า)
      billingBase: "",   // base URL จากลิงก์ระบบ BILLING
      slots: {
        1: { zoom: ZOOM_DEFAULT, rotation: 0, url: "" },
        2: { zoom: ZOOM_DEFAULT, rotation: 0, url: "" }
      },
      toastTimer: null
    };

    // โหลด base URL จาก settings (ลิงก์ชื่อ BILLING)
    loadBillingBase().then(function (base) {
      state.billingBase = base;
      // ถ้ามีลูกค้าเลือกอยู่แล้ว ให้ load ภาพอีกครั้ง
      if (state.selected) {
        var c = (state.customers || []).find(function (x) { return x.code === state.selected; });
        if (c) showCustomerImages(c);
      }
    });

    function showToast(msg, duration) {
      $("p022ToastMsg").textContent = msg;
      var toast = $("p022Toast");
      toast.classList.add("show");
      if (state.toastTimer) clearTimeout(state.toastTimer);
      state.toastTimer = setTimeout(function () { toast.classList.remove("show"); }, duration || 2200);
    }

    /* ---------- rows (pagination 10 รายการ/หน้า) ---------- */
    function renderRows() {
      var list = state.customers || [];
      var total = list.length;
      var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (state.page > pages) state.page = pages;
      if (state.page < 1) state.page = 1;
      var start = (state.page - 1) * PAGE_SIZE;
      var pageItems = list.slice(start, start + PAGE_SIZE);

      if (total > 0) {
        $("p022Count").textContent = total + " รายการ (หน้า " + state.page + "/" + pages + ")";
      } else {
        $("p022Count").textContent = "0 รายการ";
      }

      if (total === 0) {
        $("p022TableWrap").style.display = "none";
        $("p022Empty").classList.add("show");
        $("p022Pager").classList.remove("show");
        return;
      }
      $("p022TableWrap").style.display = "block";
      $("p022Empty").classList.remove("show");

      var tbody = $("p022Rows");
      tbody.innerHTML = "";
      pageItems.forEach(function (c) {
        var tr = document.createElement("tr");
        if (state.selected === c.code) tr.classList.add("selected");
        tr.innerHTML =
          '<td class="p022-code">' + esc(c.code) + "</td>" +
          '<td title="' + esc(c.name) + '">' + esc(c.name) + "</td>" +
          '<td class="p022-district">' + esc(c.district) + "</td>";
        tr.addEventListener("click", function () {
          selectCustomer(c);
        });
        tbody.appendChild(tr);
      });
      renderPager(total, pages, start, pageItems.length);
    }

    function renderPager(total, pages, start, shown) {
      var pager = $("p022Pager");
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
      $("p022Pages").innerHTML = nums.map(function (n) {
        if (n === "…") return '<span class="p022-pg-num ellipsis">…</span>';
        return '<button class="p022-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p022-page="' + n + '">' + n + "</button>";
      }).join("");
      $("p022Prev").disabled = cur <= 1;
      $("p022Next").disabled = cur >= pages;
      $("p022PgInfo").textContent = "แสดง " + (start + 1) + "–" + (start + shown) + " จาก " + total + " รายการ";
    }

    function gotoPage(n) {
      var pages = Math.max(1, Math.ceil((state.customers || []).length / PAGE_SIZE));
      var target = Math.min(pages, Math.max(1, n));
      if (target === state.page) return;
      state.page = target;
      renderRows();
    }

    function selectCustomer(c) {
      state.selected = c.code;
      $("p022PreviewTitle").textContent = "เอกสารลูกค้า " + c.code + " · " + c.name;
      var nDocs = (c.link1 ? 1 : 0) + (c.link2 ? 1 : 0);
      $("p022PreviewSub").textContent = nDocs > 0 ? ("แสดงเอกสาร " + nDocs + " รายการ") : "ไม่มีภาพเอกสาร";
      showCustomerImages(c);
      renderRows();
    }

    // load ภาพลง 2 ช่อง — link1 → ช่อง 1, link2 → ช่อง 2 (ไม่มีค่า = placeholder "ยังไม่มีภาพ")
    function showCustomerImages(c) {
      showSlot(1, c.link1);
      showSlot(2, c.link2);
    }

    function showSlot(n, link) {
      var img = $("p022Img" + n);
      var ph = $("p022Placeholder" + n);
      var status = $("p022FileStatus" + n);
      var s = state.slots[n];
      s.zoom = ZOOM_DEFAULT;
      s.rotation = 0;
      s.url = "";

      if (!link) {
        // ไม่มีค่า / null → ไม่แสดงภาพ
        img.classList.remove("visible");
        img.removeAttribute("src");
        ph.classList.remove("hidden");
        status.textContent = "ยังไม่มีภาพ";
        status.title = "";
        updateSlot(n);
        return;
      }

      var url = buildImageUrl(state.billingBase, link);
      if (!url) {
        img.classList.remove("visible");
        ph.classList.remove("hidden");
        status.textContent = "ยังไม่มีลิงก์ระบบ BILLING";
        status.title = "";
        updateSlot(n);
        return;
      }

      s.url = url;
      img.onerror = function () {
        s.url = "";
        img.classList.remove("visible");
        ph.classList.remove("hidden");
        status.textContent = "โหลดภาพไม่สำเร็จ";
        status.title = "";
      };
      img.onload = function () {
        ph.classList.add("hidden");
        status.textContent = "แสดงภาพแล้ว";
        status.title = "";
      };
      img.src = url;
      img.classList.add("visible");
      status.textContent = "แสดงภาพแล้ว";
      status.title = "";
      updateSlot(n);
    }

    /* ---------- zoom / rotate ---------- */
    function updateSlot(n) {
      var s = state.slots[n];
      var img = $("p022Img" + n);
      img.style.transform = "rotate(" + s.rotation + "deg) scale(" + s.zoom + ")";
      $("p022Zoom" + n).textContent = Math.round(s.zoom * 100) + "%";
    }

    function zoomAll(dir) {
      [1, 2].forEach(function (n) {
        var s = state.slots[n];
        s.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, s.zoom + dir * ZOOM_STEP));
        updateSlot(n);
      });
    }

    function resetAll() {
      [1, 2].forEach(function (n) {
        state.slots[n].zoom = ZOOM_DEFAULT;
        state.slots[n].rotation = 0;
        updateSlot(n);
      });
      showToast("คืนค่ามุมมองรูปทั้งหมดแล้ว");
    }

    /* ---------- เต็มจอ (overlay ทั้งจอ — Esc / ปุ่ม X ปิด) ---------- */
    function openFullscreen(n) {
      var s = state.slots[n];
      if (!s.url) {
        showToast("⚠ ช่องภาพที่ " + n + " ยังไม่มีภาพ", 2600);
        return;
      }
      var cust = (state.customers || []).find(function (x) { return x.code === state.selected; });
      $("p022FsTitle").textContent = "เอกสารช่องที่ " + n + (cust ? " · " + cust.code : "");
      $("p022FsUrl").textContent = s.url;
      var fsImg = $("p022FsImg");
      fsImg.onerror = function () {
        fsImg.removeAttribute("src");
        showToast("❌ โหลดภาพไม่สำเร็จ", 4200);
      };
      fsImg.src = s.url;
      $("p022Fullscreen").classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closeFullscreen() {
      $("p022Fullscreen").classList.remove("show");
      $("p022FsImg").removeAttribute("src");
      document.body.style.overflow = "";
    }

    /* ---------- events ---------- */
    var SEARCH_BTN_HTML = icon("search") + " ค้นหา";
    var SEARCH_BUSY_HTML = icon("spinner") + " กำลังประมวลผล...";

    $("p022Form").addEventListener("submit", function (e) {
      e.preventDefault();
      var code = $("p022Code").value.trim();
      var name = $("p022Name").value.trim();
      if (!code && !name) {
        showToast("⚠ กรอกรหัสลูกค้า หรือ ชื่อลูกค้า อย่างน้อย 1 ช่อง เพื่อค้นหา", 3200);
        return;
      }
      var btn = $("p022SearchBtn");
      btn.disabled = true;
      btn.innerHTML = SEARCH_BUSY_HTML;
      apiSearch(code, name)
        .then(function (data) {
          state.customers = data.customers || [];
          state.selected = null;
          state.page = 1;
          if (state.customers.length === 0) {
            showToast("⚠ ไม่พบข้อมูล — ไม่มีลูกค้าที่ตรงกับเงื่อนไขค้นหา", 3200);
          }
          $("p022PreviewTitle").textContent = "เอกสารลูกค้า";
          $("p022PreviewSub").textContent = "เลือกลูกค้าเพื่อแสดงเอกสาร";
          showSlot(1, null);
          showSlot(2, null);
          renderRows();
        })
        .catch(function (error) {
          showToast("❌ " + (error.message || "ค้นหาข้อมูลไม่สำเร็จ"), 3500);
        })
        .then(function () {
          btn.disabled = false;
          btn.innerHTML = SEARCH_BTN_HTML;
        });
    });

    $("p022Clear").addEventListener("click", function () {
      $("p022Code").value = "";
      $("p022Name").value = "";
      state.customers = [];
      state.selected = null;
      state.page = 1;
      $("p022PreviewTitle").textContent = "เอกสารลูกค้า";
      $("p022PreviewSub").textContent = "เลือกลูกค้าเพื่อแสดงเอกสาร";
      showSlot(1, null);
      showSlot(2, null);
      renderRows();
      showToast("ล้างเงื่อนไขการค้นหาแล้ว");
    });

    root.addEventListener("click", function (e) {
      var zin = e.target.closest("[data-p022-zoomin]");
      if (zin) {
        var n = Number(zin.getAttribute("data-p022-zoomin"));
        state.slots[n].zoom = Math.min(ZOOM_MAX, state.slots[n].zoom + ZOOM_STEP);
        updateSlot(n);
        return;
      }
      var zout = e.target.closest("[data-p022-zoomout]");
      if (zout) {
        var m = Number(zout.getAttribute("data-p022-zoomout"));
        state.slots[m].zoom = Math.max(ZOOM_MIN, state.slots[m].zoom - ZOOM_STEP);
        updateSlot(m);
        return;
      }
      var rot = e.target.closest("[data-p022-rotate]");
      if (rot) {
        var k = Number(rot.getAttribute("data-p022-rotate"));
        state.slots[k].rotation = (state.slots[k].rotation + 90) % 360;
        updateSlot(k);
        return;
      }
      var full = e.target.closest("[data-p022-full]");
      if (full) {
        openFullscreen(Number(full.getAttribute("data-p022-full")));
        return;
      }
      var pg = e.target.closest("[data-p022-page]");
      if (pg) {
        gotoPage(Number(pg.getAttribute("data-p022-page")));
      }
    });

    $("p022FullClose").addEventListener("click", closeFullscreen);
    $("p022Fullscreen").addEventListener("click", function (e) {
      if (e.target === this) closeFullscreen();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && $("p022Fullscreen").classList.contains("show")) {
        closeFullscreen();
      }
    });

    $("p022Prev").addEventListener("click", function () { gotoPage(state.page - 1); });
    $("p022Next").addEventListener("click", function () { gotoPage(state.page + 1); });

    $("p022ZoomInAll").addEventListener("click", function () { zoomAll(1); });
    $("p022ZoomOutAll").addEventListener("click", function () { zoomAll(-1); });
    $("p022ResetAll").addEventListener("click", resetAll);

    renderRows();
    updateSlot(1);
    updateSlot(2);
  }

  window.P022BillingDoc = { mount: mount };
})();
