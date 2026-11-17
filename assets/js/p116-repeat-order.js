/* P116 — ตรวจสอบค้างส่งลูกค้าที่สั่งสินค้าซ้ำ (UI only — ตามตัวอย่าง demo/P116_demo.html)
 * - Launcher "ตรวจสอบค้างส่งลูกค้าที่สั่งสินค้าซ้ำ" + filter (รหัสลูกค้า / รหัสสินค้า) + ปุ่มค้นหา/รีเซต
 * - Summary 4 การ์ด: เอาออกตามคำสั่งผู้ใช้
 * - ตาราง 5 คอลั่น (รหัสลูกค้า | ชื่อลูกค้า | เขต/อำเภอ | รหัสสินค้าที่ซ้ำ | จำนวนที่ซ้ำ) + sort + เลือกแถว
 * - Mock data (ยังไม่มี API/DB)
 */
(function () {
  "use strict";

  /* ---------- CSS (scoped ด้วย .p116-app) ---------- */
  var CSS = [
    ".p116-app{display:flex;flex-direction:column;gap:14px}",
    /* base svg (เทียบ global svg ใน demo) */
    ".p116-app svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* launcher */
    ".p116-app .p116-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p116-app .p116-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p116-app .p116-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px;white-space:nowrap}",
    ".p116-app .p116-launcher-title svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p116-app .p116-launcher-body{padding:19px 22px;background:linear-gradient(180deg,#e5fbfd,#eefbfd)}",
    ".p116-app .p116-filter-grid{display:grid;grid-template-columns:1fr 1fr auto;gap:12px 16px;align-items:end}",
    ".p116-app .p116-field label{display:block;margin-bottom:6px;color:#334155;font-size:12px;font-weight:700}",
    ".p116-app .p116-input-wrap{position:relative}",
    ".p116-app .p116-input-wrap svg{position:absolute;top:50%;left:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p116-app .p116-field input{width:100%;height:42px;padding:0 12px 0 39px;color:#172033;border:1px solid #b6c5d8;border-radius:9px;outline:0;background:#fff;font-size:13px}",
    ".p116-app .p116-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}",
    ".p116-app .p116-search-button{display:inline-flex;min-width:130px;height:42px;align-items:center;justify-content:center;gap:8px;padding:0 20px;color:#fff;border:0;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);box-shadow:0 9px 20px rgba(37,99,235,.24);font-size:13px;font-weight:700;cursor:pointer;transition:.16s ease}",
    ".p116-app .p116-search-button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p116-app .p116-search-button:hover{transform:translateY(-1px);filter:brightness(.98)}",
    ".p116-app .p116-search-button.p116-loading{position:relative;color:transparent;pointer-events:none}",
    ".p116-app .p116-search-button.p116-loading svg{visibility:hidden}",
    ".p116-app .p116-search-button.p116-loading::after{content:'';position:absolute;top:50%;left:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:p116spin .7s linear infinite}",
    "@keyframes p116spin{to{transform:rotate(360deg)}}",
    /* panel */
    ".p116-app .p116-panel{display:flex;min-height:450px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p116-app .p116-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p116-app .p116-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p116-app .p116-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}",
    ".p116-app .p116-panel-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p116-app .p116-panel-title h2{margin:0;font-size:14px}",
    ".p116-app .p116-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p116-app .p116-badge{padding:5px 11px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p116-app .p116-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p116-app .p116-table-wrap table{width:100%;min-width:900px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p116-app .p116-table-wrap th{position:sticky;top:0;z-index:2;padding:10px 13px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p116-app .p116-table-wrap th.p116-sortable{cursor:pointer}",
    ".p116-app .p116-table-wrap th.p116-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p116-app .p116-table-wrap th.p116-sorted{color:#1d4ed8;background:#e0ecff}",
    ".p116-app .p116-table-wrap th.p116-center,.p116-app .p116-table-wrap td.p116-center{text-align:center}",
    ".p116-app .p116-table-wrap td{max-width:360px;overflow:hidden;padding:8px 13px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p116-app .p116-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p116-app .p116-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p116-app .p116-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p116-app .p116-table-wrap tbody tr.p116-active td{color:#fff;background:#0878d1}",
    ".p116-app .p116-customer-code,.p116-app .p116-product-code{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p116-app .p116-repeat-tag{display:inline-flex;min-width:32px;justify-content:center;padding:3px 9px;color:#7c3aed;border-radius:7px;background:#f5f3ff;font-family:Arial,sans-serif;font-weight:700}",
    ".p116-app .p116-table-wrap tbody tr.p116-active .p116-customer-code,.p116-app .p116-table-wrap tbody tr.p116-active .p116-product-code{color:#fff}",
    ".p116-app .p116-table-wrap tbody tr.p116-active .p116-repeat-tag{color:#fff;background:rgba(255,255,255,.22)}",
    ".p116-app .p116-empty-state{display:none;min-height:260px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p116-app .p116-empty-state.p116-show{display:flex}",
    ".p116-app .p116-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p116-app .p116-empty-state strong{font-size:13px}",
    ".p116-app .p116-empty-state p{margin-top:5px;font-size:11px}",
    ".p116-app .p116-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    /* pager */
    ".p116-app .p116-pager{display:none;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border-top:1px solid #dbe3ef;background:#f8fafc}",
    ".p116-app .p116-pager button{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;color:#334155;border:1px solid #dbe3ef;border-radius:8px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.14s ease}",
    ".p116-app .p116-pager button:hover:not(:disabled){color:#2563eb;border-color:#94a3b8}",
    ".p116-app .p116-pager button.p116-page-active{color:#fff;border-color:#2563eb;background:#2563eb}",
    ".p116-app .p116-pager button:disabled{color:#b6c5d8;background:#f1f5f9;cursor:not-allowed}",
    /* modal (append ที่ body — หลีก transform ของ #appContent) */
    ".p116-modal-backdrop{position:fixed;inset:0;z-index:150;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45)}",
    ".p116-modal-backdrop.p116-show{display:flex}",
    ".p116-modal{width:min(720px,92vw);max-height:80vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 60px rgba(15,23,42,.35)}",
    ".p116-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid #dbe3ef}",
    ".p116-modal-header strong{font-size:14px}",
    ".p116-modal-customer{color:#2563eb;font-size:13px;font-weight:600}",
    ".p116-modal-close{display:grid;width:30px;height:30px;place-items:center;color:#64748b;border:0;border-radius:8px;background:#f1f5f9;font-size:18px;cursor:pointer}",
    ".p116-modal-body{padding:16px 18px}",
    ".p116-detail-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}",
    ".p116-detail-table th{padding:8px 10px;color:#172033;background:#eef2f7;font-weight:700;text-align:left}",
    ".p116-detail-table td{max-width:240px;overflow:hidden;padding:8px 10px;text-overflow:ellipsis}",
    ".p116-detail-table th:last-child,.p116-detail-table td:last-child{text-align:right}",
    /* toast (append ที่ body — หลีก transform ของ #appContent) */
    ".p116-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p116-toast.p116-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p116-toast svg{width:16px;height:16px;color:#34d399;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* responsive (ตาม demo) */
    "@media (max-width:850px){.p116-app .p116-panel-header,.p116-app .p116-panel-footer{align-items:flex-start;flex-direction:column}}",
    "@media (max-width:680px){.p116-app .p116-panel-header,.p116-app .p116-panel-footer{align-items:flex-start;flex-direction:column}}"
  ].join("\n");

  /* ---------- API (MAC-5) ---------- */
  var CONNECTION_ID = "c1788406814359"; // MAC5 (sqlserver, M5CM-AA-01)

  function fetchJson(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (!data.ok) throw new Error(data.error || "ข้อผิดพลาดจากเซิร์วอร์");
      return data;
    });
  }

  /* ---------- state ---------- */
  var state = {
    items: [],
    currentId: 1,
    sortField: "customerCode",
    sortDirection: "asc",
    page: 1
  };
  var PAGE_SIZE = 15;
  var toastTimer = null;
  var els = {};

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg) {
    els.toastMessage.textContent = msg;
    els.toast.classList.add("p116-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("p116-show"); }, 1900);
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      var x = a[state.sortField];
      var y = b[state.sortField];
      if (typeof x === "string") { x = x.toLowerCase(); y = String(y).toLowerCase(); }
      if (x < y) return state.sortDirection === "asc" ? -1 : 1;
      if (x > y) return state.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  function updateSortIndicators() {
    Array.prototype.forEach.call(els.root.querySelectorAll("th[data-sort]"), function (th) {
      var active = th.getAttribute("data-sort") === state.sortField;
      th.classList.toggle("p116-sorted", active);
      var arrow = th.querySelector(".p116-arrow");
      if (arrow) arrow.textContent = active ? (state.sortDirection === "asc" ? "▲" : "▼") : "";
    });
  }

  function updateSummary(items) {
    els.badge.textContent = items.length + " รายการ";
    els.footerText.textContent = "แสดง " + items.length + " รายการ";
  }

  function renderRows() {
    var sorted = sortItems(state.items);
    els.rows.innerHTML = "";
    updateSortIndicators();

    if (!sorted.length) {
      els.tableWrap.style.display = "none";
      els.empty.classList.add("p116-show");
      els.pager.style.display = "none";
      els.pager.innerHTML = "";
      updateSummary([]);
      return;
    }
    els.tableWrap.style.display = "block";
    els.empty.classList.remove("p116-show");

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page < 1) state.page = 1;
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(start, start + PAGE_SIZE);

    var found = false;
    for (var i = 0; i < pageItems.length; i++) if (pageItems[i].id === state.currentId) { found = true; break; }
    if (!found) state.currentId = pageItems[0].id;

    pageItems.forEach(function (it) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", it.id);
      if (it.id === state.currentId) tr.classList.add("p116-active");
      tr.innerHTML =
        '<td class="p116-customer-code">' + esc(it.customerCode) + "</td>" +
        '<td title="' + esc(it.customerName) + '">' + esc(it.customerName) + "</td>" +
        '<td class="p116-center">' + esc(it.area) + "</td>" +
        '<td class="p116-product-code">' + esc(it.productCode) + "</td>" +
        '<td class="p116-center"><span class="p116-repeat-tag">' + it.repeatCount + "</span></td>";
      els.rows.appendChild(tr);
    });

    els.pager.style.display = "flex";
    renderPagination(sorted.length);
    updateSummary(sorted);
  }

  function renderPagination(total) {
    var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    els.pager.innerHTML = "";
    function makeBtn(label, page, disabled, active, title) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      if (title) b.title = title;
      b.disabled = !!disabled;
      if (active) b.classList.add("p116-page-active");
      if (!disabled) b.addEventListener("click", function () { gotoPage(page); });
      els.pager.appendChild(b);
      return b;
    }
    makeBtn("«", 1, state.page <= 1, false, "หน้าแรก");
    makeBtn("‹", state.page - 1, state.page <= 1, false, "หน้าก่อนหน้า");
    for (var p = 1; p <= totalPages; p++) makeBtn(String(p), p, false, p === state.page, "หน้า " + p);
    makeBtn("›", state.page + 1, state.page >= totalPages, false, "หน้าถัดไป");
    makeBtn("»", totalPages, state.page >= totalPages, false, "หน้าสุดท้าย");
  }

  function gotoPage(p) {
    var totalPages = Math.max(1, Math.ceil(state.items.length / PAGE_SIZE));
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    state.page = p;
    renderRows();
  }

  function openDetailModal(rec) {
    var cusCode = rec ? rec.customerCode : "";
    var stkCode = rec ? rec.productCode : "";
    var cust = document.getElementById("p116ModalCustomer");
    if (cust) cust.textContent = rec ? (rec.customerCode + " · " + rec.customerName) : "";
    els.detailRows.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b">กำลังโหลดรายละเอียด…</td></tr>';
    els.modal.classList.add("p116-show");
    fetchJson("api/p116_detail.php", { connectionId: CONNECTION_ID, cusCode: cusCode, stkCode: stkCode }).then(function (res) {
      els.detailRows.innerHTML = "";
      (res.rows || []).forEach(function (d) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + esc(d.date) + "</td>" +
          "<td>" + esc(d.listNo) + "</td>" +
          "<td>" + esc(d.vnos) + "</td>" +
          "<td>" + esc(d.stkCode) + "</td>" +
          '<td title="' + esc(d.desc) + '">' + esc(d.desc) + "</td>" +
          "<td>" + esc(d.qty) + "</td>" +
          "<td>" + esc(d.unit) + "</td>";
        els.detailRows.appendChild(tr);
      });
      if (!(res.rows || []).length) {
        els.detailRows.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b">ไม่พบรายละเอียด</td></tr>';
      }
    }).catch(function (err) {
      els.detailRows.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#b91c1c">โหลดไม่สำเร็จ: ' + esc(err.message || err) + "</td></tr>";
    });
  }

  function closeDetailModal() {
    els.modal.classList.remove("p116-show");
  }

  function applyFilters(showMessage) {
    var cc = els.customerCode.value.trim();
    var pc = els.productCode.value.trim();
    els.searchButton.classList.add("p116-loading");
    fetchJson("api/p116_search.php", { connectionId: CONNECTION_ID, cusCode: cc, stkCode: pc }).then(function (res) {
      els.searchButton.classList.remove("p116-loading");
      state.items = (res.rows || []).map(function (r, i) {
        return {
          id: i + 1,
          customerCode: r.cusCode,
          customerName: r.cusName,
          area: r.cusContact,
          productCode: r.stkCode,
          repeatCount: r.cnt
        };
      });
      state.page = 1;
      renderRows();
      els.panelSubtitle.textContent = state.items.length
        ? "คลิกแถวเพื่อเลือกข้อมูลปัจจุบัน และเรียงข้อมูลได้จากหัวตาราง"
        : "ไม่พบข้อมูลตามเงื่อนไขที่เลือก";
      if (showMessage) showToast("พบรายการสินค้าซ้ำ " + state.items.length + " รายการ");
    }).catch(function (err) {
      els.searchButton.classList.remove("p116-loading");
      showToast("ค้นหาไม่สำเร็จ: " + (err.message || err));
    });
  }

  function injectStyle() {
    if (document.getElementById("p116Style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "p116Style";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  function mount(root) {
    injectStyle();
    els.root = root;
    root.innerHTML =
      '<div class="p116-app">' +
      /* launcher */
      '<section class="p116-launcher">' +
      '  <div class="p116-launcher-title">' +
      '    <strong><svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3 6h.01M3 12h.01M3 18h.01"></path></svg>ตรวจสอบค้างส่งลูกค้าที่สั่งสินค้าซ้ำ</strong>' +
      '  </div>' +
      '  <form class="p116-launcher-body" id="p116FilterForm">' +
      '    <div class="p116-filter-grid">' +
      '      <div class="p116-field"><label>รหัสลูกค้า</label>' +
      '        <div class="p116-input-wrap">' +
      '          <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>' +
      '          <input type="text" id="p116CustomerCode" autocomplete="off" placeholder="เช่น 10280-043">' +
      '        </div>' +
      '      </div>' +
      '      <div class="p116-field"><label>รหัสสินค้า</label>' +
      '        <div class="p116-input-wrap">' +
      '          <svg viewBox="0 0 24 24"><path d="M3 5v14M6 5v14M10 5v14M13 5v14M18 5v14M21 5v14"></path></svg>' +
      '          <input type="text" id="p116ProductCode" autocomplete="off" placeholder="เช่น 10011166">' +
      '        </div>' +
      '      </div>' +
      '      <button class="p116-search-button" type="submit"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>ค้นหา</button>' +
      '    </div>' +
      '  </form>' +
      '</section>' +
      /* panel */
      '<section class="p116-panel">' +
      '  <div class="p116-panel-header">' +
      '    <div class="p116-panel-heading">' +
      '      <div class="p116-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
      '      <div class="p116-panel-title">' +
      '        <h2>รายการลูกค้าที่สั่งสินค้าซ้ำ</h2>' +
      '        <p id="p116PanelSubtitle">คลิกแถวเพื่อเลือกข้อมูลปัจจุบัน และเรียงข้อมูลได้จากหัวตาราง</p>' +
      '      </div>' +
      '    </div>' +
      '    <span class="p116-badge" id="p116Badge">0 รายการ</span>' +
      '  </div>' +
      '  <div class="p116-table-wrap" id="p116TableWrap">' +
      '    <table>' +
      '      <thead><tr>' +
      '        <th class="p116-sortable" data-sort="customerCode">รหัสลูกค้า <span class="p116-arrow"></span></th>' +
      '        <th class="p116-sortable" data-sort="customerName">ชื่อลูกค้า <span class="p116-arrow"></span></th>' +
      '        <th class="p116-sortable p116-center" data-sort="area">เขต/อำเภอ <span class="p116-arrow"></span></th>' +
      '        <th class="p116-sortable" data-sort="productCode">รหัสสินค้าที่ซ้ำ <span class="p116-arrow"></span></th>' +
      '        <th class="p116-sortable p116-center" data-sort="repeatCount">จำนวนที่ซ้ำ <span class="p116-arrow"></span></th>' +
      '      </tr></thead>' +
      '      <tbody id="p116Rows"></tbody>' +
      '    </table>' +
      '  </div>' +
      '  <div class="p116-empty-state" id="p116Empty">' +
      '    <div><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>' +
      '    <strong>ไม่พบรายการตามเงื่อนไขที่เลือก</strong>' +
      '    <p>ลองล้างรหัสลูกค้าหรือรหัสสินค้า แล้วค้นหาใหม่</p></div>' +
      '  </div>' +
      '  <div class="p116-pager" id="p116Pager"></div>' +
      '  <div class="p116-panel-footer">' +
      '    <span id="p116FooterText">แสดง 0 รายการ</span>' +
      '  </div>' +
      '</section>' +
      '</div>';

    // toast (append ที่ body — หลีก transform ของ #appContent)
    if (!document.getElementById("p116Toast")) {
      var t = document.createElement("div");
      t.id = "p116Toast";
      t.className = "p116-toast";
      t.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg><span id="p116ToastMessage">ดำเนินการเรียบร้อยแล้ว</span>';
      document.body.appendChild(t);
    }
    // modal (append ที่ body)
    if (!document.getElementById("p116Modal")) {
      var m = document.createElement("div");
      m.id = "p116Modal";
      m.className = "p116-modal-backdrop";
      m.innerHTML =
        '<div class="p116-modal">' +
        '  <div class="p116-modal-header">' +
        '    <strong>รายละเอียดสินค้าที่สั่งซ้ำ</strong> <span id="p116ModalCustomer" class="p116-modal-customer"></span>' +
        '    <button class="p116-modal-close" type="button" title="ปิด">×</button>' +
        '  </div>' +
        '  <div class="p116-modal-body">' +
        '    <table class="p116-detail-table">' +
        '      <thead><tr>' +
        '        <th>วันที่</th><th>ลำดับ</th><th>เลขที่</th><th>รหัส</th><th>รายละเอียด</th><th>จำนวน</th><th>หน่วย</th>' +
        '      </tr></thead>' +
        '      <tbody id="p116DetailRows"></tbody>' +
        '    </table>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(m);
      m.querySelector(".p116-modal-close").addEventListener("click", closeDetailModal);
      m.addEventListener("click", function (e) { if (e.target === m) closeDetailModal(); });
    }

    els.customerCode = root.querySelector("#p116CustomerCode");
    els.productCode = root.querySelector("#p116ProductCode");
    els.searchButton = root.querySelector(".p116-search-button");
    els.rows = root.querySelector("#p116Rows");
    els.tableWrap = root.querySelector("#p116TableWrap");
    els.empty = root.querySelector("#p116Empty");
    els.panelSubtitle = root.querySelector("#p116PanelSubtitle");
    els.badge = root.querySelector("#p116Badge");
    els.footerText = root.querySelector("#p116FooterText");
    els.pager = root.querySelector("#p116Pager");
    els.toast = document.getElementById("p116Toast");
    els.toastMessage = document.getElementById("p116ToastMessage");
    els.modal = document.getElementById("p116Modal");
    els.detailRows = document.getElementById("p116DetailRows");

    // events
    root.querySelector("#p116FilterForm").addEventListener("submit", function (e) {
      e.preventDefault();
      applyFilters(true);
    });
    els.rows.addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (!tr) return;
      var id = Number(tr.getAttribute("data-id"));
      state.currentId = id;
      renderRows();
      var rec = null;
      for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) { rec = state.items[i]; break; }
      openDetailModal(rec);
    });
    Array.prototype.forEach.call(root.querySelectorAll("th[data-sort]"), function (th) {
      th.addEventListener("click", function () {
        var field = th.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDirection = "asc";
        }
        state.page = 1;
        renderRows();
      });
    });

    // เปิดหน้าในสถานะว่าง — ผู้ใช้กรอกรหัสแล้วกด "ค้นหา" เอง
    renderRows();
  }

  window.P116RepeatOrder = { mount: mount };
})();
