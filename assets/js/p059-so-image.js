/**
 * P059 — จัดเก็บเอกสารลูกค้า (SO Image)
 * clone demo/P059-demo.html + C# AppSOimage (frm_SOimageGUI / frm_SOimage_manager / frm_selectData)
 *
 * Real data MAC5 — 5 APIs:
 *   p059_search   — TOP 100 tb_PictureSO (status=0) + vnos LIKE
 *   p059_detail   — fields 4 + file list (view modal)
 *   p059_so_list  — mode=picker (SO ยังไม่มีภาพ TOP 10 + LIKE 'kw%' — autocomplete) / mode=info (query SO แม่นยำ)
 *   p059_save     — multipart upload → FTP NAS /web/PO/ + INSERT/soft delete
 *   p059_image    — image proxy (FTP GET)
 *
 * IIFE window.P059SoImage = { mount }
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var PER_PAGE = 15; // clone P019 — 15 รายการ/หน้า
  var page = 1;
  var API = {
    search: "api/p059_search.php",
    detail: "api/p059_detail.php",
    soList: "api/p059_so_list.php",
    save: "api/p059_save.php",
    image: "api/p059_image.php"
  };

  /* ---------- CSS (clone demo — prefix p059-) ---------- */
  var CSS = [
    ".p059-app{--p059-primary:#2563eb;--p059-primary-dark:#1d4ed8;--p059-primary-soft:#eff6ff;--p059-success:#059669;--p059-success-soft:#ecfdf5;--p059-warning:#d97706;--p059-warning-soft:#fffbeb;--p059-danger:#dc2626;--p059-danger-soft:#fef2f2;--p059-bg:#fff;--p059-text:#172033;--p059-muted:#64748b;--p059-border:#dbe3ef;--p059-radius:16px;--p059-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p059-app *{box-sizing:border-box;margin:0;padding:0}",
    ".p059-app button{cursor:pointer;font:inherit}",
    ".p059-app button:disabled{cursor:not-allowed;opacity:0.5}",
    ".p059-app svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",

    /* launcher */
    ".p059-launcher{display:grid;grid-template-columns:auto minmax(280px,1fr) auto;gap:12px;align-items:end;padding:16px;border:1px solid var(--p059-border);border-radius:var(--p059-radius);background:#fff;box-shadow:0 5px 18px rgba(15,23,42,0.04);margin-bottom:14px}",
    ".p059-new-btn{display:inline-flex;height:46px;align-items:center;gap:9px;padding:0 20px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#34d399,var(--p059-success));box-shadow:0 8px 18px rgba(5,150,105,0.24);font-weight:700;white-space:nowrap;transition:0.16s ease}",
    ".p059-new-btn:hover{transform:translateY(-1px);filter:brightness(1.06)}",
    ".p059-new-btn .p059-new-ic{display:grid;width:22px;height:22px;place-items:center;border-radius:50%;background:rgba(255,255,255,0.25)}",
    ".p059-new-btn .p059-new-ic svg{width:15px;height:15px}",
    ".p059-field label{display:block;margin-bottom:7px;color:var(--p059-muted);font-size:11px;font-weight:700}",
    ".p059-input-wrap{position:relative}",
    ".p059-input-wrap>svg{position:absolute;top:50%;left:13px;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p059-input-wrap input{width:100%;height:46px;padding:0 14px 0 43px;color:var(--p059-text);border:1px solid var(--p059-border);border-radius:11px;outline:none;background:#fff;font-size:14px}",
    ".p059-input-wrap input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p059-search-btn{display:inline-flex;height:46px;align-items:center;justify-content:center;gap:8px;padding:0 20px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,var(--p059-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,0.22);font-weight:700;white-space:nowrap;transition:0.16s ease}",
    ".p059-search-btn:hover{transform:translateY(-1px);filter:brightness(1.06)}",

    /* table panel */
    ".p059-panel{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--p059-border);border-radius:var(--p059-radius);background:#fff;box-shadow:var(--p059-shadow)}",
    ".p059-panel-head{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid var(--p059-border)}",
    ".p059-panel-title h2{font-size:14px;font-weight:700}",
    ".p059-panel-title p{margin-top:1px;color:var(--p059-muted);font-size:11px}",
    ".p059-badge{padding:5px 10px;color:var(--p059-primary-dark);border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p059-table-wrap{overflow:visible}",
    ".p059-table{width:100%;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p059-table th{position:sticky;top:0;z-index:2;padding:12px 14px;color:#475569;border-bottom:1px solid var(--p059-border);background:#f8fafc;box-shadow:inset 0 -1px var(--p059-border);font-size:13px;font-weight:700;text-align:left}",
    ".p059-table td{max-width:300px;overflow:hidden;padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:13px;line-height:1.45;text-overflow:ellipsis}",
    ".p059-table th.center,.p059-table td.center{text-align:center}",
    ".p059-table tbody tr{cursor:pointer;transition:0.14s ease}",
    ".p059-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p059-table tbody tr:hover{background:#f0f7ff}",
    ".p059-so-no{color:var(--p059-primary-dark);font-weight:700}",
    ".p059-cus-code{color:#334155;font-weight:700}",
    ".p059-img-count{display:inline-flex;min-width:26px;align-items:center;justify-content:center;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700}",
    ".p059-img-count.has{color:#047857;background:#d1fae5}",
    ".p059-img-count.none{color:#b45309;background:#fef3c7}",
    ".p059-row-act{display:inline-flex;height:32px;align-items:center;justify-content:center;gap:5px;padding:0 13px;border:1px solid var(--p059-border);border-radius:8px;background:#fff;font-size:12px;font-weight:700;transition:0.15s ease}",
    ".p059-row-act.view{color:var(--p059-primary-dark);border-color:#bfdbfe;background:var(--p059-primary-soft)}",
    ".p059-row-act.view:hover{color:#fff;background:var(--p059-primary)}",
    ".p059-row-act.print{color:#334155;border-color:var(--p059-border);background:#f8fafc}",
    ".p059-row-act.print:hover{color:#fff;border-color:#475569;background:#475569}",
    ".p059-table-foot{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:var(--p059-muted);border-top:1px solid var(--p059-border);background:#f8fafc;font-size:12px}",
    ".p059-pagination{display:flex;align-items:center;gap:6px}",
    ".p059-page-btn{min-width:28px;height:28px;padding:0 6px;border:1px solid var(--p059-border);border-radius:8px;background:#fff;color:var(--p059-text);font:inherit;font-size:13px;cursor:pointer;transition:0.14s ease}",
    ".p059-page-btn:hover:not(:disabled){border-color:#60a5fa;color:var(--p059-primary-dark)}",
    ".p059-page-btn.active{border-color:var(--p059-primary);background:var(--p059-primary);color:#fff}",
    ".p059-page-btn:disabled{opacity:0.4;cursor:not-allowed}",
    ".p059-page-info{font-size:12px;color:var(--p059-muted);margin-left:4px}",
    ".p059-empty{padding:40px;text-align:center;color:var(--p059-muted);font-size:13px}",

    /* modal */
    ".p059-backdrop{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,0.52);backdrop-filter:blur(4px)}",
    ".p059-backdrop.show{display:grid}",
    ".p059-modal{width:min(1280px,100%);max-height:92vh;overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,0.36);animation:p059Open 0.2s ease;display:flex;flex-direction:column}",
    "@keyframes p059Open{from{opacity:0;transform:translateY(12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}",
    ".p059-titlebar{display:flex;min-height:32px;align-items:center;justify-content:space-between;padding:0 4px 0 12px;background:linear-gradient(180deg,#334155,#1e293b)}",
    ".p059-titlebar span{color:#e2e8f0;font-size:12px;font-weight:600}",
    ".p059-tb-close{display:grid;width:32px;height:30px;place-items:center;color:#e2e8f0;border:0;background:#dc2626;cursor:pointer}",
    ".p059-tb-close:hover{background:#b91c1c}",
    ".p059-tb-close svg{width:13px;height:13px}",
    /* doc fields — row 4 คอลั่น (เร็บ) */
    ".p059-mfields{display:grid;grid-template-columns:minmax(240px,1.3fr) 130px 120px 1fr;gap:8px;padding:8px 14px;border-bottom:1px solid var(--p059-border);background:#f8fafc}",
    ".p059-mfield label{display:block;margin-bottom:4px;color:var(--p059-muted);font-size:10px;font-weight:700}",
    ".p059-mfield input{width:100%;height:34px;padding:0 10px;color:var(--p059-text);border:1px solid var(--p059-border);border-radius:8px;outline:none;background:#fff;font-size:13px}",
    ".p059-mfield input:read-only{color:#475569;background:#f1f5f9}",
    ".p059-mfield input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,0.14)}",
    ".p059-mfield input.ac-active{border-color:var(--p059-primary);box-shadow:0 0 0 3px rgba(37,99,235,0.12)}",
    /* autocomplete — TOP 10 */
    ".p059-ac-wrap{position:relative}",
    ".p059-ac-list{position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:40;display:none;max-height:320px;overflow-y:auto;border:1px solid #bfdbfe;border-radius:10px;background:#fff;box-shadow:0 16px 34px rgba(15,23,42,0.18)}",
    ".p059-ac-list.show{display:block}",
    ".p059-ac-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #eef2f7;cursor:pointer;font-size:12px}",
    ".p059-ac-item:last-child{border-bottom:0}",
    ".p059-ac-item:hover,.p059-ac-item.hl{background:var(--p059-primary-soft)}",
    ".p059-ac-item b{color:var(--p059-primary-dark);white-space:nowrap}",
    ".p059-ac-item .ac-cus{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#334155}",
    ".p059-ac-item .ac-date{color:var(--p059-muted);font-size:11px;white-space:nowrap}",
    ".p059-ac-empty{padding:14px;color:var(--p059-muted);font-size:12px;text-align:center}",
    ".p059-ac-hint{display:flex;gap:10px;padding:4px 14px;color:#94a3b8;background:#f8fafc;border-bottom:1px solid var(--p059-border);font-size:10px}",
    /* split — drop zone + list ซ้าย / preview ข้า้ */
    ".p059-msplit{display:grid;grid-template-columns:360px 1fr;min-height:0;flex:1;overflow:auto}",
    ".p059-file-panel{display:flex;flex-direction:column;border-right:1px solid var(--p059-border)}",
    ".p059-dropzone{display:flex;flex-direction:column;align-items:center;gap:4px;margin:8px 10px;padding:10px 10px;border:2px dashed #93c5fd;border-radius:10px;background:#f8faff;color:var(--p059-primary-dark);cursor:pointer;transition:0.15s ease}",
    ".p059-dropzone:hover,.p059-dropzone.drag{border-color:var(--p059-primary);background:var(--p059-primary-soft)}",
    ".p059-dropzone:disabled{opacity:0.5;cursor:not-allowed;background:#f1f5f9;border-color:var(--p059-border)}",
    ".p059-dropzone svg{width:26px;height:26px}",
    ".p059-dropzone .dz-t{font-size:12px;font-weight:700}",
    ".p059-dropzone .dz-s{font-size:10px;color:var(--p059-muted)}",
    ".p059-file-tools{display:flex;gap:7px;padding:0 12px 10px}",
    ".p059-file-tools button{flex:1;height:32px;border:1px solid var(--p059-border);border-radius:8px;background:#fff;font-size:12px;font-weight:700;color:#334155;cursor:pointer}",
    ".p059-file-tools button:hover:not(:disabled){color:#fff;border-color:var(--p059-primary);background:var(--p059-primary)}",
    ".p059-file-tools button.danger:hover:not(:disabled){border-color:var(--p059-danger);background:var(--p059-danger)}",
    ".p059-file-list{flex:1;overflow-y:auto;min-height:120px}",
    ".p059-file-item{display:flex;align-items:center;gap:9px;padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#334155;cursor:pointer}",
    ".p059-file-item:hover{background:var(--p059-primary-soft)}",
    ".p059-file-item.selected{background:var(--p059-primary-soft);box-shadow:inset 3px 0 0 var(--p059-primary)}",
    ".p059-file-item .fi-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
    ".p059-file-item .fi-del{display:grid;place-items:center;width:22px;height:22px;border:0;border-radius:6px;background:transparent;color:#94a3b8;cursor:pointer}",
    ".p059-file-item .fi-del svg{width:13px;height:13px}",
    ".p059-file-item .fi-del:hover{color:#fff;background:var(--p059-danger)}",
    ".p059-file-empty{padding:18px;color:var(--p059-muted);font-size:12px;text-align:center}",
    ".p059-preview-panel{display:flex;flex-direction:column}",
    ".p059-preview-label{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 14px;color:var(--p059-text);border-bottom:1px solid var(--p059-border);background:#f8fafc;font-size:13px;font-weight:700;text-align:center}",
    ".p059-preview-label .pl-count{padding:2px 9px;border-radius:999px;background:#dbeafe;color:var(--p059-primary-dark);font-size:11px}",
    ".p059-zoom{display:flex;align-items:center;gap:4px}",
    ".p059-zoom button{min-width:26px;height:26px;padding:0 6px;border:1px solid var(--p059-border);border-radius:7px;background:#fff;color:var(--p059-text);font:inherit;font-size:12px;font-weight:700;cursor:pointer}",
    ".p059-zoom button:hover:not(:disabled){border-color:#60a5fa;color:var(--p059-primary-dark)}",
    ".p059-zoom button:disabled{opacity:0.4;cursor:not-allowed}",
    ".p059-zoom .z-fit{font-size:11px}",
    ".p059-zoom .z-pct{min-width:46px;text-align:center;color:var(--p059-muted);font-size:11px}",
    ".p059-preview-area{flex:1;min-height:380px;background:#94a3b8;position:relative;overflow:hidden}",
    ".p059-preview-fit{position:absolute;inset:0;overflow:auto}",
    ".p059-preview-inner{display:flex;align-items:center;justify-content:center;min-height:100%;padding:14px;box-sizing:border-box}",
    ".p059-preview-area img{display:block;max-width:none;max-height:none;width:auto;height:auto;box-shadow:0 10px 24px rgba(0,0,0,0.25)}",
    ".p059-preview-ph{display:flex;flex-direction:column;align-items:center;gap:8px;color:#e2e8f0;text-align:center}",
    ".p059-preview-ph svg{width:44px;height:44px}",
    ".p059-preview-ph span{font-size:11px}",
    ".p059-mfoot{display:flex;justify-content:center;gap:10px;padding:8px 14px;border-top:1px solid var(--p059-border);background:#f8fafc}",
    ".p059-save-btn,.p059-cancel-btn{display:inline-flex;height:36px;align-items:center;justify-content:center;gap:7px;padding:0 22px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer}",
    ".p059-save-btn{color:#fff;border:0;background:var(--p059-success);box-shadow:0 8px 18px rgba(5,150,105,0.2)}",
    ".p059-save-btn:hover{background:#047857}",
    ".p059-cancel-btn{color:var(--p059-muted);border:1px solid var(--p059-border);background:#fff}",
    ".p059-cancel-btn:hover{color:var(--p059-danger);border-color:#fecaca;background:var(--p059-danger-soft)}",

    /* toast */
    ".p059-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,0.28);font-size:11px;transform:translateY(12px);transition:0.2s ease}",
    ".p059-toast.show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p059-toast svg{width:17px;height:17px;color:#34d399}"
  ].join("\n");

  /* ---------- icons ---------- */
  function icon(name, size) {
    var s = size || 20;
    var paths = {
      plus: '<path d="M12 5v14M5 12h14"></path>',
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      close: '<path d="M6 6l12 12M18 6 6 18"></path>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-5-5L5 21"></path>',
      check: '<path d="M20 6 9 17l-5-5"></path>'
    };
    return '<svg viewBox="0 0 24 24" style="width:' + s + 'px;height:' + s + 'px">' + (paths[name] || "") + "</svg>";
  }

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function fmtDate(d) {
    // API ส่ง dd/mm/yyyy (SQL 103) หรือ yyyy-mm-dd — ให้ออก dd/mm/BBBB (พ.ศ.)
    if (!d) return "—";
    var s = String(d).trim();
    var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return m[1] + "/" + m[2] + "/" + (parseInt(m[3], 10) + 543);
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543);
    return s;
  }
  function apiPost(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  /* ---------- state ---------- */
  var rows = [];
  var modalMode = "view"; // view | new
  var activeVnos = "";
  var origFiles = []; // ไฟล์เดิมจาก DB (สำหรับคำนวณ soft delete)
  var files = []; // working set — {id, filename, isLocal?, dataUrl?, file?}
  var selectedIdx = -1;
  var acRows = []; // autocomplete results (TOP 10)
  var acIndex = -1; // highlighted item
  var acTimer = null; // debounce
  var acToken = 0; // prevent stale response
  var zoom = 1; // 1 = fit to area
  var editMode = false; // view modal: ถูกกด Edit แล้ว
  var toastTimer = null;
  var escBound = false;
  var el = {}; // cached elements
  var root = null;

  function showToast(msg) {
    el.toastMsg.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, 2200);
  }

  /* ---------- search (server-side) ---------- */
  function doSearch() {
    var kw = el.searchInput.value.trim();
    el.panelSub.textContent = kw ? "ค้นหา \"" + kw + "\"" : "แสดงเอกสารทั้งหมด (TOP 100)";
    el.tableWrap.innerHTML = '<div class="p059-empty">กำลังค้นหา...</div>';
    apiPost(API.search, { connectionId: MAC5_CONNECTION_ID, vnos: kw }).then(function (data) {
      if (!data.ok) {
        el.tableWrap.innerHTML = '<div class="p059-empty">Error: ' + esc(data.error) + "</div>";
        return;
      }
      rows = data.rows || [];
      page = 1;
      renderTable();
    }).catch(function (e) {
      el.tableWrap.innerHTML = '<div class="p059-empty">Error: ' + esc(e.message) + "</div>";
    });
  }

  function renderTable() {
    var totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    if (page > totalPages) page = totalPages;
    var start = (page - 1) * PER_PAGE;
    var pageRows = rows.slice(start, start + PER_PAGE);
    if (rows.length === 0) {
      el.tableWrap.innerHTML = '<div class="p059-empty">ไม่พบข้อมูล</div>';
    } else {
      var trs = pageRows.map(function (r) {
        var cnt = r.cntPic;
        return "<tr data-vnos=\"" + esc(r.vnos) + "\">" +
          '<td class="center">' + esc(fmtDate(r.date)) + "</td>" +
          '<td class="p059-so-no">' + esc(r.vnos) + "</td>" +
          '<td class="p059-cus-code">' + esc(r.customerCode) + "</td>" +
          '<td title="' + esc(r.customerName) + '">' + esc(r.customerName) + "</td>" +
          '<td class="center"><span class="p059-img-count ' + (cnt > 0 ? "has" : "none") + '">' + cnt + "</span></td>" +
          '<td class="center"><button class="p059-row-act view" data-act="view" type="button">View</button></td>' +
          '<td class="center"><button class="p059-row-act print" data-act="print" type="button">Print</button></td>' +
          "</tr>";
      }).join("");
      el.tableWrap.innerHTML =
        '<table class="p059-table"><thead><tr>' +
        '<th class="center">วันที่ SO</th><th>เลขที่ SO</th><th>รหัสลูกค้า</th><th>ชื่อลูกค้า</th>' +
        '<th class="center">จำนวนภาพ</th><th class="center">View</th><th class="center">Print</th>' +
        "</tr></thead><tbody>" + trs + "</tbody></table>";
    }
    el.badge.textContent = rows.length + " รายการ";
    el.footText.textContent = "แสดง " + pageRows.length + " จาก " + rows.length + " รายการ";
    renderPager(totalPages);
  }

  /* ---------- pagination (clone P019 — 15/หน้า — ปุ่ม ‹ 1 2 3 4 5 ›) ---------- */
  function renderPager(totalPages) {
    var pg = el.pager;
    if (!pg) return;
    if (totalPages <= 1) { pg.innerHTML = ""; return; }
    var pages = [];
    var startPage = Math.max(1, page - 2);
    var endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    for (var p = startPage; p <= endPage; p++) {
      pages.push('<button type="button" class="p059-page-btn' + (p === page ? " active" : "") + '" data-page="' + p + '">' + p + "</button>");
    }
    pg.innerHTML =
      '<button type="button" class="p059-page-btn" data-nav="prev"' + (page <= 1 ? " disabled" : "") + ">&lsaquo;</button>" +
      pages.join("") +
      '<button type="button" class="p059-page-btn" data-nav="next"' + (page >= totalPages ? " disabled" : "") + ">&rsaquo;</button>" +
      '<span class="p059-page-info">หน้า ' + page + " / " + totalPages + "</span>";
    pg.querySelectorAll("[data-page]").forEach(function (btn) {
      btn.addEventListener("click", function () { page = parseInt(btn.getAttribute("data-page"), 10); renderTable(); });
    });
    var prev = pg.querySelector('[data-nav="prev"]');
    var next = pg.querySelector('[data-nav="next"]');
    if (prev) prev.addEventListener("click", function () { if (page > 1) { page--; renderTable(); } });
    if (next) next.addEventListener("click", function () { if (page < totalPages) { page++; renderTable(); } });
  }

  /* ---------- modal ---------- */
  function setFields(doc, readOnly) {
    el.fVnos.value = doc.vnos || "";
    el.fVnos.readOnly = !!readOnly;
    el.fCusCode.value = doc.cusCode || doc.customerCode || "";
    el.fDate.value = doc.date ? fmtDate(doc.date) : "";
    el.fCusName.value = doc.cusName || doc.customerName || "";
  }

  function renderFileList() {
    if (files.length === 0) {
      el.fileList.innerHTML = '<div class="p059-file-empty">ไม่มีภาพ — เพิ่มผ่านช่องด้านบน</div>';
    } else {
      el.fileList.innerHTML = files.map(function (f, i) {
        return '<div class="p059-file-item' + (i === selectedIdx ? " selected" : "") + '" data-i="' + i + '" title="' + esc(f.filename) + '">' +
          '<span class="fi-name">' + esc(f.filename) + "</span>" +
          '<button type="button" class="fi-del" data-del="' + i + '" title="ลบภาพนี้">' + icon("close", 13) + "</button>" +
          "</div>";
      }).join("");
    }
    // preview counter
    el.plCount.textContent = files.length > 0 ? (selectedIdx >= 0 ? (selectedIdx + 1) + " / " : "") + files.length + " ภาพ" : "";
    // view: DropZone/แก้ไข/ลบ/บันทึก disabled จนกดแก้ไขภาพ · new: ใช้ได้ทันที
    var canEdit = modalMode === "new" || editMode;
    el.dropZone.style.pointerEvents = canEdit ? "" : "none";
    el.dropZone.style.opacity = canEdit ? "" : "0.5";
    el.btnEdit.disabled = modalMode !== "view" || editMode;
    el.btnDel.disabled = !canEdit || selectedIdx < 0;
    el.btnSave.disabled = !canEdit || (modalMode === "new" && files.filter(function (f) { return f.isLocal; }).length === 0);
  }

  function renderPreview() {
    var f = files[selectedIdx];
    if (!f) {
      el.previewArea.innerHTML = '<div class="p059-preview-fit"><div class="p059-preview-inner"><div class="p059-preview-ph">' + icon("image", 44) + "<span>ยังไม่ได้เลือกภาพ — คลิกภาพด้านซ้าย</span></div></div></div>";
      el.zPct.textContent = "";
      return;
    }
    var src;
    if (f.isLocal && f.dataUrl) {
      src = f.dataUrl;
    } else {
      src = API.image + "?f=" + encodeURIComponent(f.filename);
    }
    el.previewArea.innerHTML = '<div class="p059-preview-fit"><div class="p059-preview-inner"></div></div>';
    var img = document.createElement("img");
    img.alt = f.filename;
    img.onload = function () { applyZoom(); };
    img.onerror = function () {
      el.previewArea.innerHTML = '<div class="p059-preview-fit"><div class="p059-preview-inner"><div class="p059-preview-ph"><span>โหลดภาพไม่ได้</span></div></div></div>';
      el.zPct.textContent = "";
    };
    img.src = src;
    el.previewArea.querySelector(".p059-preview-inner").appendChild(img);
    if (img.complete && img.naturalWidth > 0) applyZoom();
  }

  /* ---------- zoom (−/+/fit + Ctrl+wheel) ---------- */
  function applyZoom() {
    var img = el.previewArea.querySelector("img");
    if (!img || !img.naturalWidth) return;
    // วัดจาก .p059-preview-fit (absolute inset:0 — ขึ้นกับ modal ไม่ใช่ภาพ)
    var fit = el.previewArea.querySelector(".p059-preview-fit");
    var aw = fit.clientWidth - 28, ah = fit.clientHeight - 28;
    if (aw <= 0 || ah <= 0) return;
    var fitScale = Math.min(aw / img.naturalWidth, ah / img.naturalHeight);
    if (!(fitScale > 0)) fitScale = 1;
    var s = fitScale * zoom;
    img.style.width = Math.round(img.naturalWidth * s) + "px";
    el.zPct.textContent = Math.round(s * 100) + "%";
    el.zIn.disabled = s >= 8;
    el.zOut.disabled = s <= 0.05;
  }
  function setZoom(z) {
    zoom = Math.min(Math.max(z, 0.1), 12);
    applyZoom();
  }

  function selectFile(i) {
    selectedIdx = i;
    renderFileList();
    renderPreview();
  }

  function deleteFile(i) {
    if (i < 0 || i >= files.length) return;
    files.splice(i, 1);
    if (selectedIdx >= files.length) selectedIdx = files.length - 1;
    else if (selectedIdx === i) selectedIdx = -1;
    renderFileList();
    renderPreview();
  }

  function openModal(mode, row) {
    modalMode = mode;
    editMode = false;
    selectedIdx = -1;
    files = [];
    origFiles = [];
    acRows = [];
    acIndex = -1;
    zoom = 1;
    el.acList.classList.remove("show");
    el.acList.innerHTML = "";
    el.fVnos.classList.remove("ac-active");

    if (mode === "view" && row) {
      activeVnos = row.vnos;
      el.mTitle.textContent = "SO " + row.vnos;
      setFields(row, true);
      // view — ใช้ได้เมื่อ กดแก้ไขภาพ
      el.fileList.innerHTML = '<div class="p059-file-empty">กำลังโหลดภาพ...</div>';
      el.previewArea.innerHTML = '<div class="p059-preview-ph">' + icon("image", 44) + "<span>กำลังโหลด...</span></div>";
      apiPost(API.detail, { connectionId: MAC5_CONNECTION_ID, vnos: row.vnos }).then(function (data) {
        if (!data.ok) {
          el.fileList.innerHTML = '<div class="p059-file-empty">Error: ' + esc(data.error) + "</div>";
          return;
        }
        origFiles = (data.files || []).map(function (f) { return { id: f.id, filename: f.filename }; });
        files = origFiles.map(function (f) { return { id: f.id, filename: f.filename, isLocal: false }; });
        renderFileList();
        renderPreview();
      }).catch(function (e) {
        el.fileList.innerHTML = '<div class="p059-file-empty">Error: ' + esc(e.message) + "</div>";
      });
    } else {
      // new — autocomplete + dropzone ใช้ได้ทันที
      activeVnos = "";
      el.mTitle.textContent = "เอกสารใหม่";
      setFields({ vnos: "", cusCode: "", date: "", cusName: "" }, false);
      renderFileList();
      renderPreview();
      // fetch autocomplete defaults (TOP 10) — แสดงเมื่อ focus
      fetchAc("");
    }

    el.backdrop.classList.add("show");
    document.body.style.overflow = "hidden";
    resizeModal();
  }

  function closeModal() {
    el.backdrop.classList.remove("show");
    document.body.style.overflow = "";
    el.acList.classList.remove("show");
    el.fVnos.classList.remove("ac-active");
  }

  /* ---------- modal geometry — เต็มจอ + อยู่กลางจอเสมอ (ไม่จม/ไม่ล้น) ---------- */
  function resizeModal() {
    if (!el.modal || !el.backdrop) return;
    var show = el.backdrop.classList.contains("show");
    // ล้างขนาด fix ทั้งหมด — วัด content height จริง
    el.backdrop.style.padding = "";
    el.modal.style.width = "";
    el.modal.style.height = "";
    el.modal.style.maxHeight = "";
    if (!show) return;
    var pad = 16;
    el.backdrop.style.padding = pad + "px";
    el.modal.style.width = "min(1280px, 100%)";
    // modal เต็มความสูงจอ เสมอ — preview area จึงยืดตาม (image ใหญ่)
    el.modal.style.height = (window.innerHeight - pad * 2) + "px";
    el.modal.style.maxHeight = (window.innerHeight - pad * 2) + "px";
  }
  /* ---------- autocomplete SO (TOP 10 — LIKE 'kw%') ---------- */
  function fetchAc(kw) {
    var token = ++acToken;
    apiPost(API.soList, { connectionId: MAC5_CONNECTION_ID, mode: "picker", vnos: kw }).then(function (data) {
      if (token !== acToken) return; // stale
      if (!data.ok) {
        el.acList.innerHTML = '<div class="p059-ac-empty">Error: ' + esc(data.error) + "</div>";
        el.acList.classList.add("show");
        return;
      }
      acRows = data.rows || [];
      acIndex = acRows.length > 0 ? 0 : -1;
      renderAcList();
    }).catch(function () { /* ignore */ });
  }

  function renderAcList() {
    if (acRows.length === 0) {
      el.acList.innerHTML = '<div class="p059-ac-empty">ไม่พบ SO ที่ตรงกับค่าที่ค้นหา</div>';
    } else {
      el.acList.innerHTML = acRows.map(function (r, i) {
        return '<div class="p059-ac-item' + (i === acIndex ? " hl" : "") + '" data-i="' + i + '">' +
          "<b>" + esc(r.vnos) + "</b>" +
          '<span class="ac-cus" title="' + esc(r.cusName) + '">' + esc(r.cusCode) + " · " + esc(r.cusName) + "</span>" +
          '<span class="ac-date">' + esc(fmtDate(r.date)) + "</span>" +
          "</div>";
      }).join("");
      el.acList.querySelectorAll(".p059-ac-item").forEach(function (item) {
        item.addEventListener("mousedown", function (e) {
          e.preventDefault(); // prevent blur
          pickAc(parseInt(item.getAttribute("data-i"), 10));
        });
      });
    }
    el.acList.classList.add("show");
  }

  function hideAc() {
    el.acList.classList.remove("show");
    el.fVnos.classList.remove("ac-active");
    acIndex = -1;
  }

  function pickAc(i) {
    var r = acRows[i];
    if (!r) return;
    // use row data directly (picker returns date/vnos/cusCode/cusName)
    setFields(r, true);
    activeVnos = r.vnos;
    hideAc();
    el.fVnos.value = r.vnos;
    el.fVnos.readOnly = true;
    renderFileList(); // re-evaluate save button
  }

  function onVnosInput() {
    if (modalMode !== "new" || el.fVnos.readOnly) return;
    var kw = el.fVnos.value.trim();
    el.fVnos.classList.add("ac-active");
    clearTimeout(acTimer);
    acTimer = setTimeout(function () { fetchAc(kw); }, 250);
  }

  function onVnosKeydown(e) {
    if (el.fVnos.readOnly) return;
    var open = el.acList.classList.contains("show");
    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      if (acIndex < acRows.length - 1) acIndex++;
      renderAcList();
    } else if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      if (acIndex > 0) acIndex--;
      renderAcList();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && acIndex >= 0) pickAc(acIndex);
    } else if (e.key === "Escape" && open) {
      e.stopPropagation();
      hideAc();
    }
  }

  /* ---------- dropzone (click + drag&drop) ---------- */
  function onBrowseFiles() {
    if (el.dropZone.style.pointerEvents === "none") return;
    el.hiddenInput.click();
  }
  function onFilesChosen(list) {
    if (!list || list.length === 0) return;
    Array.prototype.forEach.call(list, function (f) {
      if (f.type && f.type.indexOf("image/") !== 0) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        files.push({
          id: 0,
          filename: f.name,
          isLocal: true,
          dataUrl: e.target.result,
          file: f
        });
        selectedIdx = files.length - 1;
        renderFileList();
        renderPreview();
      };
      reader.readAsDataURL(f);
    });
  }

  /* ---------- edit mode (view modal — clone C# btn_edit_Click L408-416) ---------- */
  function enterEdit() {
    editMode = true;
    renderFileList();
  }

  /* ---------- save (upload + soft delete — clone C# btn_save_Click L200-302) ---------- */
  var SAVE_BTN_HTML; // set in mount (icon + text)
  function saveBtnReset() { el.btnSave.innerHTML = SAVE_BTN_HTML; }
  function doSave() {
    var v = el.fVnos.value.trim();
    if (!v) {
      showToast("กรุณาเลือกเลขที่ SO ก่อนบันทึก");
      return;
    }
    // clone C# — new: ต้องมีภาพ >= 1 · edit: ลบทั้งหมดได้ (soft delete)
    var newFiles = files.filter(function (f) { return f.isLocal; });
    if (modalMode === "new" && newFiles.length === 0) {
      showToast("กรุณาเพิ่มรูปภาพอย่างน้อย 1 ภาพ");
      return;
    }
    // soft delete — ไฟล์เดิม (origFiles) ที่หายจาก working set (clone C# L244-252: status=-1)
    var keepNames = {};
    files.forEach(function (f) { if (!f.isLocal) keepNames[f.filename] = true; });
    var delIds = origFiles.filter(function (f) { return !keepNames[f.filename]; }).map(function (f) { return f.id; });

    if (newFiles.length === 0 && delIds.length === 0) {
      showToast("ไม่มีการเปลี่ยนแปลง");
      return;
    }
    // new mode + SO ที่พิมพ์เอง (ไม่ได้เลือกจาก autocomplete) — verify SO ก่อน (mode=info)
    var doUpload = function () {
      var fd = new FormData();
      fd.append("connectionId", MAC5_CONNECTION_ID);
      fd.append("vnos", v);
      fd.append("deleteIds", JSON.stringify(delIds));
      newFiles.forEach(function (f) {
        fd.append("files[]", f.file, f.filename);
      });
      el.btnSave.disabled = true;
      el.btnSave.textContent = "กำลังอัปโหลด...";
      fetch(API.save, { method: "POST", body: fd }).then(function (r) { return r.json(); }).then(function (data) {
        saveBtnReset();
        if (!data.ok) {
          showToast("Error: " + data.error);
          renderFileList();
          return;
        }
        var msg = "บันทึก " + v + " เรียบร้อยแล้ว";
        if (data.uploaded) msg += " (อัปโหลด " + data.uploaded + " ไฟล์)";
        if (data.deleted) msg += " (ลบ " + data.deleted + ")";
        showToast(msg);
        closeModal();
        doSearch(); // refresh list
      }).catch(function (e) {
        saveBtnReset();
        renderFileList();
        showToast("Error: " + e.message);
      });
    };
    if (modalMode === "new" && el.fVnos.readOnly) {
      doUpload(); // เลือกจาก autocomplete แล้ว
      return;
    }
    // typed manually — verify SO (mode=info)
    apiPost(API.soList, { connectionId: MAC5_CONNECTION_ID, mode: "info", vnos: v }).then(function (d2) {
      if (!d2.ok) {
        showToast("Error: " + d2.error);
        return;
      }
      activeVnos = d2.doc.vnos;
      doUpload();
    }).catch(function (e) {
      showToast("Error: " + e.message);
    });
  }

  /* ---------- delete file (button ในรายการ / ปุ่มลบภาพนี้) ---------- */
  function deleteSelected() {
    deleteFile(selectedIdx);
  }

  /* ---------- print (report overlay) ---------- */
  function doPrint(vnos) {
    var url = "report/p059_report.html?v=20261010b&vnos=" + encodeURIComponent(vnos) + "&conn=" + MAC5_CONNECTION_ID;
    window.open(url, "_blank");
  }

  /* ---------- mount ---------- */
  function mount(target) {
    root = target;
    // clean old (modal/toast append to body)
    document.querySelectorAll(".p059-backdrop,.p059-toast").forEach(function (n) { n.remove(); });

    var style = document.createElement("style");
    style.setAttribute("data-p059", "1");
    style.textContent = CSS;
    target.appendChild(style);

    target.insertAdjacentHTML("beforeend",
      '<div class="p059-app">' +
        // launcher
        '<section class="p059-launcher">' +
          '<button class="p059-new-btn" id="p059NewBtn" type="button"><span class="p059-new-ic">' + icon("plus", 15) + "</span>New</button>" +
          '<div class="p059-field">' +
            '<label for="p059Search">ค้นหา · เลขที่ SO</label>' +
            '<div class="p059-input-wrap">' + icon("search", 18) +
              '<input id="p059Search" type="text" placeholder="เช่น SCRE6910-0265" autocomplete="off">' +
            "</div>" +
          "</div>" +
          '<button class="p059-search-btn" id="p059SearchBtn" type="button">' + icon("search", 18) + "ค้นหา</button>" +
        "</section>" +
        // table panel
        '<section class="p059-panel">' +
          '<div class="p059-panel-head">' +
            '<div class="p059-panel-title"><h2>รายการใบสั่งขาย (SO)</h2><p id="p059PanelSub">แสดงเอกสารทั้งหมด</p></div>' +
            '<span class="p059-badge" id="p059Badge">0 รายการ</span>' +
          "</div>" +
          '<div class="p059-table-wrap" id="p059TableWrap"><div class="p059-empty">กำลังค้นหา...</div></div>' +
          '<div class="p059-table-foot"><span id="p059Foot">แสดง 0 รายการ</span><div class="p059-pagination" id="p059Pager"></div></div>' +
        "</section>" +
      "</div>"
    );

    // modal + hidden input + toast → append ที่ document.body
    // (position:fixed ถูก break โดย ancestor transform — portal root มี transform)
    var bodyFrag = document.createElement("div");
    bodyFrag.innerHTML =
      // modal
      '<div class="p059-backdrop" id="p059Backdrop">' +
        '<section class="p059-modal">' +
          '<div class="p059-titlebar"><span id="p059MTitle">[]</span>' +
            '<button class="p059-tb-close" id="p059CloseBtn" type="button" title="Close">' + icon("close", 13) + "</button>" +
          "</div>" +
          '<div class="p059-mfields">' +
            '<div class="p059-mfield"><label>เลขที่ SO</label>' +
              '<div class="p059-ac-wrap">' +
                '<input id="p059FVnos" type="text" placeholder="พิมพ์เลขที่ SO เพื่อค้นหา..." autocomplete="off">' +
                '<div class="p059-ac-list" id="p059AcList"></div>' +
              "</div>" +
            "</div>" +
            '<div class="p059-mfield"><label>รหัสลูกค้า</label><input id="p059FCusCode" type="text" readonly placeholder="—"></div>' +
            '<div class="p059-mfield"><label>วันที่ SO</label><input id="p059FDate" type="text" readonly placeholder="—"></div>' +
            '<div class="p059-mfield"><label>ชื่อลูกค้า</label><input id="p059FCusName" type="text" readonly placeholder="—"></div>' +
          "</div>" +
          '<div class="p059-ac-hint"><span>พิมพ์เลขที่ SO เพื่อค้นหา (TOP 10)</span><span>&uarr;&darr; เลือก</span><span>Enter ยืนยัน / Esc ปิด</span></div>' +
          '<div class="p059-msplit">' +
            '<div class="p059-file-panel">' +
              '<div class="p059-dropzone" id="p059DropZone" tabindex="0">' +
                icon("image", 26) +
                '<span class="dz-t">คลิกเลือกหรือดึงรูปมาวาง</span>' +
                '<span class="dz-s">JPG / PNG — เลือกได้หลายภาพทีละครั้ง</span>' +
              "</div>" +
              '<div class="p059-file-tools">' +
                '<button id="p059EditBtn" type="button" disabled>แก้ไขภาพ</button>' +
                '<button id="p059DelBtn" type="button" class="danger" disabled>ลบภาพนี้</button>' +
              "</div>" +
              '<div class="p059-file-list" id="p059FileList"></div>' +
            "</div>" +
            '<div class="p059-preview-panel">' +
              '<div class="p059-preview-label"><span>ภาพ <span class="pl-count" id="p059PlCount"></span></span>' +
                '<div class="p059-zoom">' +
                  '<button type="button" id="p059ZoomOut" title="ย่อ (Ctrl+Wheel)">&#8722;</button>' +
                  '<span class="z-pct" id="p059ZoomPct"></span>' +
                  '<button type="button" id="p059ZoomIn" title="ขยาย (Ctrl+Wheel)">+</button>' +
                  '<button type="button" id="p059ZoomFit" class="z-fit" title="พอดีพื้นที่">fit</button>' +
                "</div>" +
              "</div>" +
              '<div class="p059-preview-area" id="p059Preview"></div>' +
            "</div>" +
          "</div>" +
          '<div class="p059-mfoot">' +
            '<button class="p059-save-btn" id="p059SaveBtn" type="button">' + icon("check", 16) + ' บันทึกภาพ</button>' +
            '<button class="p059-cancel-btn" id="p059CancelBtn" type="button">ปิด</button>' +
          "</div>" +
        "</section>" +
      "</div>" +
      '<input type="file" id="p059Hidden" accept="image/*" multiple style="display:none">' +
      // toast
      '<div class="p059-toast" id="p059Toast">' + icon("check", 17) + '<span id="p059ToastMsg"></span></div>';
    while (bodyFrag.firstChild) {
      document.body.appendChild(bodyFrag.firstChild);
    }

    // cache elements
    el.searchInput = target.querySelector("#p059Search");
    el.panelSub = target.querySelector("#p059PanelSub");
    el.badge = target.querySelector("#p059Badge");
    el.tableWrap = target.querySelector("#p059TableWrap");
    el.footText = target.querySelector("#p059Foot");
    el.pager = target.querySelector("#p059Pager");
    el.backdrop = document.querySelector("#p059Backdrop");
    el.modal = document.querySelector(".p059-modal");
    el.mTitle = document.querySelector("#p059MTitle");
    el.fVnos = document.querySelector("#p059FVnos");
    el.fCusCode = document.querySelector("#p059FCusCode");
    el.fDate = document.querySelector("#p059FDate");
    el.fCusName = document.querySelector("#p059FCusName");
    el.acList = document.querySelector("#p059AcList");
    el.dropZone = document.querySelector("#p059DropZone");
    el.fileList = document.querySelector("#p059FileList");
    el.previewArea = document.querySelector("#p059Preview");
    el.plCount = document.querySelector("#p059PlCount");
    el.zIn = document.querySelector("#p059ZoomIn");
    el.zOut = document.querySelector("#p059ZoomOut");
    el.zFit = document.querySelector("#p059ZoomFit");
    el.zPct = document.querySelector("#p059ZoomPct");
    el.btnEdit = document.querySelector("#p059EditBtn");
    el.btnDel = document.querySelector("#p059DelBtn");
    el.btnSave = document.querySelector("#p059SaveBtn");
    el.hiddenInput = document.querySelector("#p059Hidden");
    el.toast = document.querySelector("#p059Toast");
    el.toastMsg = document.querySelector("#p059ToastMsg");
    SAVE_BTN_HTML = el.btnSave.innerHTML;

    // bind — launcher
    target.querySelector("#p059NewBtn").addEventListener("click", function () { openModal("new", null); });
    target.querySelector("#p059SearchBtn").addEventListener("click", doSearch);
    el.searchInput.addEventListener("keydown", function (e) { if (e.key === "Enter") doSearch(); });

    // bind — table (delegation)
    el.tableWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".p059-row-act");
      if (!btn) return;
      var tr = btn.closest("tr");
      var vnos = tr ? tr.getAttribute("data-vnos") : "";
      var row = rows.find(function (r) { return r.vnos === vnos; });
      if (!row) return;
      if (btn.getAttribute("data-act") === "view") {
        openModal("view", row);
      } else if (btn.getAttribute("data-act") === "print") {
        doPrint(vnos);
      }
    });

    // bind — modal
    document.querySelector("#p059CloseBtn").addEventListener("click", closeModal);
    document.querySelector("#p059CancelBtn").addEventListener("click", closeModal);
    el.backdrop.addEventListener("click", function (e) { if (e.target === el.backdrop) closeModal(); });
    // autocomplete
    el.fVnos.addEventListener("input", onVnosInput);
    el.fVnos.addEventListener("keydown", onVnosKeydown);
    el.fVnos.addEventListener("focus", function () {
      if (modalMode === "new" && !el.fVnos.readOnly && acRows.length > 0 && !el.acList.classList.contains("show")) {
        el.acList.classList.add("show");
        el.fVnos.classList.add("ac-active");
      }
    });
    // dropzone — click + drag&drop
    el.dropZone.addEventListener("click", onBrowseFiles);
    el.dropZone.addEventListener("dragover", function (e) { e.preventDefault(); el.dropZone.classList.add("drag"); });
    el.dropZone.addEventListener("dragleave", function () { el.dropZone.classList.remove("drag"); });
    el.dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      el.dropZone.classList.remove("drag");
      onFilesChosen(e.dataTransfer.files);
    });
    el.hiddenInput.addEventListener("change", function (ev) { onFilesChosen(ev.target.files); ev.target.value = ""; });
    el.btnEdit.addEventListener("click", enterEdit);
    el.btnDel.addEventListener("click", deleteSelected);
    el.btnSave.addEventListener("click", doSave);
    // zoom
    el.zIn.addEventListener("click", function () { setZoom(zoom * 1.25); });
    el.zOut.addEventListener("click", function () { setZoom(zoom / 1.25); });
    el.zFit.addEventListener("click", function () { setZoom(1); });
    el.previewArea.addEventListener("wheel", function (e) {
      if (!e.ctrlKey) return; // scroll ปัจจัย = หนุน/ลากลง
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
    }, { passive: false });
    el.fileList.addEventListener("click", function (e) {
      var del = e.target.closest(".fi-del");
      if (del) {
        e.stopPropagation();
        deleteFile(parseInt(del.getAttribute("data-del"), 10));
        return;
      }
      var item = e.target.closest(".p059-file-item");
      if (item) selectFile(parseInt(item.getAttribute("data-i"), 10));
    });

    // close autocomplete on outside click
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".p059-ac-wrap")) {
        el.acList.classList.remove("show");
        el.fVnos.classList.remove("ac-active");
      }
    });

    // Escape — 1 ครั้งตลอด
    if (!escBound) {
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && el.backdrop && el.backdrop.classList.contains("show")) {
          closeModal();
        }
      });
      window.addEventListener("resize", function () {
        if (el.backdrop && el.backdrop.classList.contains("show")) {
          resizeModal();
          applyZoom();
        }
      });
      escBound = true;
    }

    // initial search
    doSearch();
  }

  window.P059SoImage = { mount: mount };
})();
