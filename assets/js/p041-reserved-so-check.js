/* P041 — ตรวจสอบสินค้าจ่ายที่ไม่อ้างถึง SO
 * UI เท่านั้น (mock data) — ตาม demo/P041-demo.html
 * window.P041ReservedSoCheck = { mount }
 */
(function () {
  "use strict";

  var CSS = [
    ".p041-app{display:flex;flex-direction:column;gap:14px;font-family:inherit}",
    ".p041-app *{box-sizing:border-box}",
    /* launcher */
    ".p041-app .p041-launcher{overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p041-app .p041-launcher-title{display:flex;min-height:44px;align-items:center;justify-content:space-between;padding:0 8px 0 16px;color:#fff;background:linear-gradient(90deg,#1e3a8a,#2563eb)}",
    ".p041-app .p041-launcher-title strong{display:flex;align-items:center;gap:8px;font-size:14px}",
    ".p041-app .p041-launcher-title svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p041-app .p041-launcher-body{display:grid;grid-template-columns:auto minmax(260px,1fr);gap:20px;align-items:center;padding:19px 22px;background:linear-gradient(180deg,#e5fbfd,#eefbfd)}",
    ".p041-app .p041-refresh-button{display:inline-flex;min-width:145px;height:56px;align-items:center;justify-content:center;gap:9px;color:#166534;border:1px solid #86efac;border-radius:11px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);font-size:14px;font-weight:700;cursor:pointer;transition:.16s ease}",
    ".p041-app .p041-refresh-button:hover{transform:translateY(-1px);filter:brightness(.98)}",
    ".p041-app .p041-refresh-button svg{width:20px;height:20px;color:#16a34a;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* panel */
    ".p041-app .p041-panel{display:flex;min-height:450px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}",
    ".p041-app .p041-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}",
    ".p041-app .p041-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p041-app .p041-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#d97706;border-radius:10px;background:#fffbeb}",
    ".p041-app .p041-panel-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p041-app .p041-panel-title h2{font-size:14px}",
    ".p041-app .p041-panel-title p{margin-top:1px;color:#64748b;font-size:11px}",
    ".p041-app .p041-badge{padding:5px 11px;color:#92400e;border-radius:999px;background:#fef3c7;font-size:11px;font-weight:700;white-space:nowrap}",
    ".p041-app .p041-table-wrap{min-height:0;flex:1;overflow:auto}",
    ".p041-app .p041-table-wrap table{width:100%;min-width:900px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p041-app .p041-table-wrap th{position:sticky;top:0;z-index:2;padding:10px 13px;color:#334155;border-bottom:1px solid #dbe3ef;background:#f8fafc;box-shadow:inset 0 -1px #dbe3ef;font-size:12px;font-weight:700;text-align:left;user-select:none}",
    ".p041-app .p041-table-wrap th.p041-sortable{cursor:pointer}",
    ".p041-app .p041-table-wrap th.p041-sortable:hover{color:#2563eb;background:#eef5ff}",
    ".p041-app .p041-table-wrap th.p041-sorted{color:#1d4ed8;background:#e0ecff}",
    ".p041-app .p041-table-wrap th.p041-center,.p041-app .p041-table-wrap td.p041-center{text-align:center}",
    ".p041-app .p041-table-wrap td{max-width:390px;overflow:hidden;padding:8px 13px;border-bottom:1px solid #e5ebf3;font-size:12px;text-overflow:ellipsis}",
    ".p041-app .p041-table-wrap tbody tr{cursor:pointer;transition:.12s ease}",
    ".p041-app .p041-table-wrap tbody tr:nth-child(even){background:#fbfdff}",
    ".p041-app .p041-table-wrap tbody tr:hover{background:#f0f7ff}",
    ".p041-app .p041-table-wrap tbody tr.p041-active td{color:#fff;background:#0878d1}",
    ".p041-app .p041-document-code,.p041-app .p041-customer-code{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}",
    ".p041-app .p041-count-tag{display:inline-flex;min-width:32px;justify-content:center;padding:3px 9px;color:#7c3aed;border-radius:7px;background:#f5f3ff;font-family:Arial,sans-serif;font-weight:700}",
    ".p041-app .p041-table-wrap tbody tr.p041-active .p041-document-code,.p041-app .p041-table-wrap tbody tr.p041-active .p041-customer-code{color:#fff}",
    ".p041-app .p041-table-wrap tbody tr.p041-active .p041-count-tag{color:#fff;background:rgba(255,255,255,.22)}",
    ".p041-app .p041-empty-state{display:none;min-height:260px;flex:1;align-items:center;justify-content:center;color:#64748b;text-align:center}",
    ".p041-app .p041-empty-state.p041-show{display:flex}",
    ".p041-app .p041-empty-state svg{width:48px;height:48px;margin:0 auto 10px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p041-app .p041-empty-state strong{font-size:13px}",
    ".p041-app .p041-empty-state p{margin-top:5px;font-size:11px}",
    ".p041-app .p041-panel-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}",
    /* pager */
    ".p041-app .p041-pager{display:none;align-items:center;justify-content:center;gap:6px;padding:10px 15px;border-top:1px solid #dbe3ef;background:#f8fafc}",
    ".p041-app .p041-pager button{display:inline-flex;min-width:34px;height:34px;align-items:center;justify-content:center;color:#334155;border:1px solid #dbe3ef;border-radius:8px;background:#fff;font-size:13px;font-weight:700;cursor:pointer;transition:.14s ease}",
    ".p041-app .p041-pager button:hover:not(:disabled){color:#2563eb;border-color:#94a3b8}",
    ".p041-app .p041-pager button.p041-page-active{color:#fff;border-color:#2563eb;background:#2563eb}",
    ".p041-app .p041-pager button:disabled{color:#b6c5d8;background:#f1f5f9;cursor:not-allowed}",
    /* toast */
    ".p041-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:12px;transform:translateY(12px);transition:.2s ease}",
    ".p041-toast.p041-show{visibility:visible;opacity:1;transform:translateY(0)}",
    ".p041-toast svg{width:18px;height:18px;color:#34d399;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    /* detail modal */
    ".p041-modal-backdrop{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(15,23,42,.45)}",
    ".p041-modal-backdrop.p041-modal-open{display:flex}",
    ".p041-modal{width:min(760px,92vw);max-height:84vh;display:flex;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 24px 60px rgba(15,23,42,.28)}",
    ".p041-modal-header{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:13px 18px;border-bottom:1px solid #dbe3ef}",
    ".p041-modal-title h3{margin:0;font-size:15px;color:#0f172a}",
    ".p041-modal-customer{margin:3px 0 0;font-size:12px;color:#64748b}",
    ".p041-modal-document{margin:2px 0 0;font-size:12px;color:#1d4ed8;font-weight:700}",
    ".p041-modal-close{display:grid;width:32px;height:32px;flex:0 0 auto;place-items:center;color:#64748b;border:1px solid #dbe3ef;border-radius:9px;background:#f8fafc;font-size:18px;line-height:1;cursor:pointer;transition:.15s ease}",
    ".p041-modal-close:hover{color:#0f172a;background:#eef2f7}",
    ".p041-modal-body{overflow:auto;padding:14px 18px}",
    ".p041-modal-body table{width:100%;border-collapse:collapse;font-size:13px}",
    ".p041-modal-body th{padding:9px 10px;color:#64748b;border-bottom:1px solid #dbe3ef;background:#f8fafc;font-size:12px;font-weight:700;text-align:left}",
    ".p041-modal-body th.p041-center{text-align:center}",
    ".p041-modal-body td{padding:9px 10px;color:#172033;border-bottom:1px solid #eef2f7}",
    ".p041-modal-body td.p041-center{text-align:center}",
    ".p041-modal-empty{padding:26px 10px;color:#64748b;font-size:13px;text-align:center}",
    /* responsive (ตาม demo) */
    "@media (max-width:850px){.p041-app .p041-launcher-body{grid-template-columns:1fr}}",
    "@media (max-width:680px){.p041-app .p041-panel-header,.p041-app .p041-panel-footer{align-items:flex-start;flex-direction:column}}"
  ].join("\n");

  /* ---------- API (MAC-5) ---------- */
  var CONNECTION_ID = "c1788406814359"; // MAC5 (sqlserver, M5CM-AA-01)

  function fetchJson(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  function loadData(showMessage) {
    fetchJson("api/p041_search.php", { connectionId: CONNECTION_ID }).then(function (res) {
      state.items = (res.rows || []).map(function (r, i) {
        return {
          id: i,
          date: r.date,
          documentNo: r.documentNo,
          customerCode: r.customerCode,
          customerName: r.customerName,
          itemCount: r.itemCount
        };
      });
      state.page = 1;
      renderRows();
      if (showMessage) showToast("โหลดข้อมูลแล้ว พบ " + state.items.length + " รายการ");
    }).catch(function (err) {
      console.error("P041 load failed:", err);
      showToast("โหลดข้อมูลไม่สำเร็จ");
    });
  }

  var state = {
    items: [],
    currentId: 2,
    sortField: "date",
    sortDirection: "asc",
    page: 1
  };
  var PAGE_SIZE = 15;
  var els = {};
  var toastTimer = null;

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(value) {
    var p = String(value || "").split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : value;
  }

  function showToast(message) {
    els.toastMessage.textContent = message;
    clearTimeout(toastTimer);
    els.toast.classList.add("p041-show");
    toastTimer = setTimeout(function () { els.toast.classList.remove("p041-show"); }, 1900);
  }

  function sortItems(items) {
    return items.slice().sort(function (a, b) {
      var first = a[state.sortField];
      var second = b[state.sortField];
      if (typeof first === "string") {
        first = first.toLowerCase();
        second = second.toLowerCase();
      }
      if (first < second) return state.sortDirection === "asc" ? -1 : 1;
      if (first > second) return state.sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  function updateSortIndicators() {
    Array.prototype.forEach.call(els.root.querySelectorAll("th[data-sort]"), function (th) {
      var active = th.getAttribute("data-sort") === state.sortField;
      th.classList.toggle("p041-sorted", active);
      var arrow = th.querySelector(".p041-arrow");
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
      els.empty.classList.add("p041-show");
      els.pager.style.display = "none";
      els.pager.innerHTML = "";
      updateSummary([]);
      return;
    }
    els.tableWrap.style.display = "block";
    els.empty.classList.remove("p041-show");

    var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    if (state.page < 1) state.page = 1;
    if (state.page > totalPages) state.page = totalPages;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageItems = sorted.slice(start, start + PAGE_SIZE);

    if (!pageItems.some(function (it) { return it.id === state.currentId; })) {
      state.currentId = pageItems[0].id;
    }

    pageItems.forEach(function (item) {
      var tr = document.createElement("tr");
      tr.setAttribute("data-id", item.id);
      if (item.id === state.currentId) tr.classList.add("p041-active");
      tr.innerHTML =
        '<td class="p041-center">' + formatDate(item.date) + "</td>" +
        '<td class="p041-document-code">' + esc(item.documentNo) + "</td>" +
        '<td class="p041-customer-code">' + esc(item.customerCode) + "</td>" +
        '<td title="' + esc(item.customerName) + '">' + esc(item.customerName) + "</td>" +
        '<td class="p041-center"><span class="p041-count-tag">' + item.itemCount + "</span></td>";
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
      if (active) b.classList.add("p041-page-active");
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

  function findRecord(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }

  function openDetailModal(record) {
    if (!record) return;
    els.modalCustomer.textContent = record.customerCode + " · " + record.customerName;
    els.modalDocument.textContent = "เลขที่ใบสำคัญ " + record.documentNo;
    els.modalRows.innerHTML = '<tr><td colspan="5" class="p041-modal-empty">กำลังโหลดรายละเอียด…</td></tr>';
    els.modal.classList.add("p041-modal-open");
    fetchJson("api/p041_detail.php", { connectionId: CONNECTION_ID, vnos: record.documentNo }).then(function (res) {
      var rows = res.rows || [];
      if (!rows.length) {
        els.modalRows.innerHTML = '<tr><td colspan="5" class="p041-modal-empty">ไม่มีรายละเอียดสินค้า</td></tr>';
        return;
      }
      els.modalRows.innerHTML = rows.map(function (p) {
        return '<tr>' +
          '<td>' + esc(p.code) + '</td>' +
          '<td title="' + esc(p.name) + '">' + esc(p.name) + '</td>' +
          '<td class="p041-center">' + Number(p.qty).toFixed(2) + '</td>' +
          '<td class="p041-center">' + esc(p.unit) + '</td>' +
          '<td class="p041-center">' + Number(p.value).toFixed(2) + '</td>' +
          '</tr>';
      }).join("");
    }).catch(function (err) {
      console.error("P041 detail failed:", err);
      els.modalRows.innerHTML = '<tr><td colspan="5" class="p041-modal-empty">โหลดรายละเอียดไม่สำเร็จ</td></tr>';
    });
  }

  function closeDetailModal() {
    els.modal.classList.remove("p041-modal-open");
  }

  function injectStyle() {
    if (document.getElementById("p041Style")) return;
    var styleEl = document.createElement("style");
    styleEl.id = "p041Style";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);
  }

  function mount(root) {
    injectStyle();
    els.root = root;
    root.innerHTML =
      '<div class="p041-app">' +
      /* launcher */
      '<section class="p041-launcher">' +
      '  <div class="p041-launcher-title">' +
      '    <strong><svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path></svg>ตรวจสอบสินค้าจ่ายที่ไม่อ้างถึง SO</strong>' +
      '  </div>' +
      '  <div class="p041-launcher-body">' +
      '    <button class="p041-refresh-button" id="p041RefreshButton" type="button">' +
      '      <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>Refresh' +
      '    </button>' +
      '  </div>' +
      '</section>' +
      /* panel */
      '<section class="p041-panel">' +
      '  <div class="p041-panel-header">' +
      '    <div class="p041-panel-heading">' +
      '      <div class="p041-panel-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg></div>' +
      '      <div class="p041-panel-title">' +
      '        <h2>รายการสินค้าจ่ายที่ไม่อ้างถึง SO</h2>' +
      '        <p id="p041PanelSubtitle">คลิกแถวเพื่อเลือกข้อมูล และเรียงข้อมูลได้จากหัวตาราง</p>' +
      '      </div>' +
      '    </div>' +
      '    <span class="p041-badge" id="p041Badge">0 รายการ</span>' +
      '  </div>' +
      '  <div class="p041-table-wrap" id="p041TableWrap">' +
      '    <table>' +
      '      <thead><tr>' +
      '        <th class="p041-sortable p041-center" data-sort="date">วันที่ <span class="p041-arrow"></span></th>' +
      '        <th class="p041-sortable" data-sort="documentNo">เลขที่ใบสำคัญ <span class="p041-arrow"></span></th>' +
      '        <th class="p041-sortable" data-sort="customerCode">รหัสลูกค้า <span class="p041-arrow"></span></th>' +
      '        <th class="p041-sortable" data-sort="customerName">ชื่อลูกค้า <span class="p041-arrow"></span></th>' +
      '        <th class="p041-sortable p041-center" data-sort="itemCount">จำนวนสินค้า <span class="p041-arrow"></span></th>' +
      '      </tr></thead>' +
      '      <tbody id="p041Rows"></tbody>' +
      '    </table>' +
      '  </div>' +
      '  <div class="p041-empty-state" id="p041Empty">' +
      '    <div>' +
      '      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>' +
      '      <strong>ไม่พบรายการตามคำค้นหา</strong>' +
      '      <p>ลองล้างคำค้นหา หรือกด Refresh เพื่อโหลดข้อมูลใหม่</p>' +
      '    </div>' +
      '  </div>' +
      '  <div class="p041-pager" id="p041Pager"></div>' +
      '  <div class="p041-panel-footer">' +
      '    <span id="p041FooterText">แสดง 0 รายการ</span>' +
      '  </div>' +
      '</section>' +
      '</div>';

    // toast (append ที่ body — หลีก transform ของ #appContent)
    if (!document.getElementById("p041Toast")) {
      var t = document.createElement("div");
      t.id = "p041Toast";
      t.className = "p041-toast";
      t.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg><span id="p041ToastMessage">ดำเนินการเรียบร้อยแล้ว</span>';
      document.body.appendChild(t);
    }

    // detail modal (append ที่ body)
    if (!document.getElementById("p041DetailModal")) {
      var m = document.createElement("div");
      m.id = "p041DetailModal";
      m.className = "p041-modal-backdrop";
      m.innerHTML =
        '<div class="p041-modal">' +
        '  <div class="p041-modal-header">' +
        '    <div class="p041-modal-title">' +
        '      <h3>รายการสินค้าจ่ายที่ไม่อ้างถึง SO</h3>' +
        '      <p class="p041-modal-customer" id="p041ModalCustomer"></p>' +
        '      <p class="p041-modal-document" id="p041ModalDocument"></p>' +
        '    </div>' +
        '    <button class="p041-modal-close" id="p041ModalClose" type="button" aria-label="ปิด">×</button>' +
        '  </div>' +
        '  <div class="p041-modal-body">' +
        '    <table>' +
        '      <thead><tr>' +
        '        <th>รหัสสินค้า</th>' +
        '        <th>ชื่อสินค้า</th>' +
        '        <th class="p041-center">จำนวน</th>' +
        '        <th class="p041-center">หน่วย</th>' +
        '        <th class="p041-center">มูลค่า</th>' +
        '      </tr></thead>' +
        '      <tbody id="p041ModalRows"></tbody>' +
        '    </table>' +
        '  </div>' +
        '</div>';
      document.body.appendChild(m);
    }

    els.refreshButton = root.querySelector("#p041RefreshButton");
    els.rows = root.querySelector("#p041Rows");
    els.tableWrap = root.querySelector("#p041TableWrap");
    els.empty = root.querySelector("#p041Empty");
    els.badge = root.querySelector("#p041Badge");
    els.footerText = root.querySelector("#p041FooterText");
    els.pager = root.querySelector("#p041Pager");
    els.toast = document.getElementById("p041Toast");
    els.toastMessage = document.getElementById("p041ToastMessage");
    els.modal = document.getElementById("p041DetailModal");
    els.modalCustomer = document.getElementById("p041ModalCustomer");
    els.modalDocument = document.getElementById("p041ModalDocument");
    els.modalRows = document.getElementById("p041ModalRows");
    els.modalClose = document.getElementById("p041ModalClose");

    // events
    els.refreshButton.addEventListener("click", function () {
      loadData(true);
    });
    els.rows.addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (!tr) return;
      state.currentId = Number(tr.getAttribute("data-id"));
      renderRows();
      openDetailModal(findRecord(state.currentId));
    });
    els.modalClose.addEventListener("click", closeDetailModal);
    els.modal.addEventListener("click", function (e) {
      if (e.target === els.modal) closeDetailModal();
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
        renderRows();
      });
    });

    // ค่าเริ่มต้น — โหลดข้อมูลจาก MAC-5 เมื่อเปิดหน้า (เหมือน C# _Load → LoadData)
    loadData();
  }

  window.P041ReservedSoCheck = { mount: mount };
})();
