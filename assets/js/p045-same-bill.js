/* P045 — ตรวจสอบบิลลูกค้าเดียวกัน
 * IIFE — window.P045SameBill = { mount }
 * Data: MAC5 — api/p045_samebill.php (ลูกค้าที่มีบิลซ้ำในวันเดียวกัน — MIHtype='IS' + HAVING COUNT > 1)
 * clone demo/P045-demo.html
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var API = { samebill: "api/p045_samebill.php", detail: "api/p045_detail.php" };

  var root = null;
  var el = {};
  var state = {
    items: [],
    sortField: "customerCode",
    sortDir: "asc",
    loading: false,
    searched: false
  };
  var modalState = { open: false, bills: [], expanded: {} };
  var escapeBound = false;
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function icon(name) {
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      cal: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      user: '<circle cx="12" cy="7" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
      warn: '<path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>',
      grid: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      close: '<path d="M18 6 6 18M6 6l12 12"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>',
      minus: '<path d="M5 12h14"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  function fmtDate(d) {
    // "2024-01-29" → "29/01/2567" (พ.ศ.)
    if (!d) return "";
    var m = String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(d);
    return m[3] + "/" + m[2] + "/" + (parseInt(m[1], 10) + 543);
  }

  function isoDate(d) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function vnosClass(count) {
    if (count >= 4) return "high";
    if (count === 3) return "medium";
    return "low";
  }

  function showToast(msg, ms) {
    $("p045ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    el.toast.classList.add("show");
    toastTimer = setTimeout(function () { el.toast.classList.remove("show"); }, ms || 2600);
  }

  function apiPost(url, payload) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function emptyRow(colspan, text) {
    return '<tr><td colspan="' + colspan + '" class="p045-empty">' + esc(text) + "</td></tr>";
  }

  /* ---------- search ---------- */
  function doSearch() {
    if (state.loading) return;
    var date = el.date.value;
    if (!date) {
      showToast("เลือกวันทีก่อน");
      return;
    }
    state.loading = true;
    el.searchBtn.classList.add("loading");
    el.searchBtn.disabled = true;
    apiPost(API.samebill, { connectionId: MAC5_CONNECTION_ID, date: date, cus: el.cus.value.trim() })
      .then(function (data) {
        state.loading = false;
        el.searchBtn.classList.remove("loading");
        el.searchBtn.disabled = false;
        if (!data.ok) {
          state.items = [];
          state.searched = true;
          render();
          showToast(data.error || "ค้นหาไม่สำเร็จ");
          return;
        }
        state.items = data.rows;
        state.searched = true;
        render();
        showToast("พบข้อมูล " + data.count.toLocaleString("th-TH") + " รายการ");
      })
      .catch(function (e) {
        state.loading = false;
        el.searchBtn.classList.remove("loading");
        el.searchBtn.disabled = false;
        showToast(e.message || "ค้นหาไม่สำเร็จ");
      });
  }

  /* ---------- sort + filter ---------- */
  function filtered() {
    var kw = (el.quick.value || "").trim().toLowerCase();
    var items = state.items;
    if (kw) {
      items = items.filter(function (r) {
        return [r.cus, r.cusName, r.district].join(" ").toLowerCase().indexOf(kw) >= 0;
      });
    }
    var f = state.sortField;
    var dir = state.sortDir === "asc" ? 1 : -1;
    items = items.slice().sort(function (a, b) {
      var x, y;
      if (f === "date") { x = a.date; y = b.date; }
      else if (f === "customerCode") { x = String(a.cus); y = String(b.cus); }
      else if (f === "customerName") { x = String(a.cusName); y = String(b.cusName); }
      else if (f === "vnosCount") { x = a.vnosCount; y = b.vnosCount; }
      else { x = String(a.cus); y = String(b.cus); }
      if (x < y) return -1 * dir;
      if (x > y) return 1 * dir;
      return 0;
    });
    return items;
  }

  /* ---------- render ---------- */
  function render() {
    var items = filtered();
    var tbody = el.rows;

    var totalVnos = 0;
    state.items.forEach(function (r) { totalVnos += r.vnosCount; });
    el.footerVnos.textContent = totalVnos.toLocaleString("th-TH");
    el.badge.textContent = items.length.toLocaleString("th-TH") + " รายการ";
    el.footerText.textContent = "แสดง " + items.length.toLocaleString("th-TH") + " รายการ";
    el.subtitle.textContent = "วันที่ " + fmtDate(el.date.value);

    if (!state.searched) {
      tbody.innerHTML = emptyRow(5, "เลือกวันที่แล้วกดค้นหา");
      el.emptyState.classList.remove("show");
      el.tableContainer.style.display = "";
      return;
    }
    if (items.length === 0) {
      tbody.innerHTML = "";
      el.tableContainer.style.display = "none";
      el.emptyState.classList.add("show");
      return;
    }
    el.tableContainer.style.display = "";
    el.emptyState.classList.remove("show");

    tbody.innerHTML = items.map(function (r) {
      return "<tr>" +
        '<td class="center">' + fmtDate(r.date) + "</td>" +
        '<td class="p045-customer-code">' + esc(r.cus) + "</td>" +
        '<td title="' + esc(r.cusName) + '">' + esc(r.cusName) + "</td>" +
        '<td class="p045-district">' + esc(r.district) + "</td>" +
        '<td class="center"><span class="p045-vnos-count ' + vnosClass(r.vnosCount) + '">' + r.vnosCount + "</span></td>" +
        "</tr>";
    }).join("");
  }

  /* ---------- modal view detail (clone demo/P045-demo_viewdetail.html) ---------- */
  function fmtQty(v) {
    return Number(v || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function cleanDesc(d) {
    return String(d || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function renderDetail() {
    var bills = modalState.bills;
    var body = el.modalBody;
    var totalItems = 0;
    bills.forEach(function (b) { totalItems += b.items.length; });
    el.modalBadge.textContent = bills.length.toLocaleString("th-TH") + " ใบ";
    el.modalFooterText.textContent = "แสดง " + bills.length.toLocaleString("th-TH") + " ใบสำคัญ";
    el.modalFooterItems.textContent = totalItems.toLocaleString("th-TH") + " รายการสินค้า";

    if (bills.length === 0) {
      body.innerHTML = '<div class="p045-detail-empty">ไม่พบข้อมูลตามเงื่อนไข</div>';
      return;
    }

    var html = '<table class="p045-detail-table"><thead><tr>' +
      '<th style="width:26%">วันที่ / เลขใบสำคัญ</th>' +
      '<th class="center" style="width:14%">สถานะ/จำนวน</th>' +
      '<th>รายการสินค้า</th>' +
      "</tr></thead><tbody>";

    bills.forEach(function (b) {
      var isExp = modalState.expanded[b.vnos] === true;
      html += '<tr class="p045-doc-row' + (isExp ? " expanded" : "") + '" data-vnos="' + esc(b.vnos) + '">' +
        '<td><div class="p045-expand-cell"><span class="p045-expand-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg></span>' +
        '<div><div class="p045-doc-number">' + esc(b.vnos) + "</div>" +
        '<div style="color:#64748b;font-size:11px;margin-top:2px">' + fmtDate(b.date) + "</div></div></div></td>" +
        '<td class="center"><span class="p045-status-tag">' + esc(b.status) + "</span>" +
        '<div style="color:#64748b;font-size:11px;margin-top:4px">' + b.items.length + " รายการ</div></td>" +
        '<td></td>' +
        "</tr>";
      b.items.forEach(function (i, idx) {
        html += '<tr class="p045-item-row' + (isExp ? "" : " hidden-row") + '" data-parent="' + esc(b.vnos) + '">' +
          '<td><div class="p045-item-indent"><span class="p045-item-connector"></span>' +
          '<span class="p045-item-order">' + (idx + 1) + "</span>" +
          '<span class="p045-item-product-code">' + esc(i.stk) + "</span></div></td>" +
          '<td class="center"><span class="p045-item-qty">' + fmtQty(i.qty) + " " + esc(i.unit) + "</span></td>" +
          '<td class="item-detail-cell" title="' + esc(cleanDesc(i.desc)) + '">' +
          esc(cleanDesc(i.desc)) + "</td>" +
          "</tr>";
      });
    });
    html += "</tbody></table>";
    body.innerHTML = html;
  }

  function openDetail(cus, cusName, date) {
    modalState = { open: true, bills: [], expanded: {} };
    el.modalTitle.textContent = "รายละเอียดลูกค้า " + cus;
    el.modalSub.textContent = cusName + " — วันที่ " + fmtDate(date);
    el.modalBody.innerHTML = '<div class="p045-detail-empty">กำลังโหลดข้อมูล...</div>';
    el.modalOverlay.classList.add("show");
    apiPost(API.detail, { connectionId: MAC5_CONNECTION_ID, date: date, cus: cus })
      .then(function (data) {
        if (!data.ok) {
          el.modalBody.innerHTML = '<div class="p045-detail-empty">' + esc(data.error || "โหลดข้อมูลไม่สำเร็จ") + "</div>";
          return;
        }
        modalState.bills = data.bills;
        // expand ทั้งหมดตั้งแต่เปิด (user 2026-10-13)
        data.bills.forEach(function (b) { modalState.expanded[b.vnos] = true; });
        renderDetail();
      })
      .catch(function (e) {
        el.modalBody.innerHTML = '<div class="p045-detail-empty">' + esc(e.message || "โหลดข้อมูลไม่สำเร็จ") + "</div>";
      });
  }

  function closeDetail() {
    modalState.open = false;
    el.modalOverlay.classList.remove("show");
  }

  /* ---------- CSS (clone demo — prefix p045-) ---------- */
  var CSS = [
    ".p045-app{--p045-primary:#2563eb;--p045-primary-dark:#1d4ed8;--p045-primary-soft:#eff6ff;--p045-success:#059669;--p045-success-soft:#ecfdf5;--p045-warning:#d97706;--p045-warning-soft:#fffbeb;--p045-danger:#dc2626;--p045-danger-soft:#fef2f2;--p045-text:#172033;--p045-muted:#64748b;--p045-border:#dbe3ef;--p045-surface-soft:#f8fafc;--p045-radius:16px;--p045-shadow:0 12px 32px rgba(15,23,42,0.08)}",
    ".p045-app *{box-sizing:border-box;margin:0;padding:0}",
    ".p045-app button,.p045-app input{font:inherit}",
    ".p045-app button{cursor:pointer}",
    ".p045-app button:disabled{cursor:not-allowed;opacity:0.5}",
    ".p045-app svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}",
    ".p045-app{display:flex;flex-direction:column;gap:14px}",
    /* launcher */
    ".p045-launcher{display:grid;grid-template-columns:minmax(170px,0.7fr) minmax(220px,1fr) auto;gap:12px;align-items:end;padding:16px;border:1px solid var(--p045-border);border-radius:var(--p045-radius);background:#fff;box-shadow:0 5px 18px rgba(15,23,42,0.04)}",
    ".p045-field label{display:block;margin-bottom:7px;color:var(--p045-muted);font-size:11px;font-weight:700}",
    ".p045-input-wrap{position:relative}",
    ".p045-input-wrap svg{position:absolute;top:50%;left:13px;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p045-input-wrap input{width:100%;height:46px;padding:0 14px 0 43px;color:var(--p045-text);border:1px solid var(--p045-border);border-radius:11px;outline:none;background:#fff;font-size:14px}",
    ".p045-input-wrap input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,0.14)}",
    ".p045-search-button{display:inline-flex;height:46px;align-items:center;justify-content:center;gap:8px;padding:0 24px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,var(--p045-primary-dark));box-shadow:0 8px 18px rgba(37,99,235,0.22);font-weight:700;white-space:nowrap;transition:0.16s ease}",
    ".p045-search-button svg{width:18px;height:18px}",
    ".p045-search-button:hover:not(:disabled){transform:translateY(-1px);filter:brightness(1.06)}",
    ".p045-search-button.loading svg{animation:p045spin 1s linear infinite}",
    "@keyframes p045spin{to{transform:rotate(360deg)}}",
    /* panel */
    ".p045-panel{overflow:hidden;border:1px solid var(--p045-border);border-radius:var(--p045-radius);background:#fff;box-shadow:var(--p045-shadow)}",
    ".p045-panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid var(--p045-border)}",
    ".p045-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}",
    ".p045-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:var(--p045-warning);border-radius:10px;background:var(--p045-warning-soft)}",
    ".p045-panel-icon svg{width:18px;height:18px}",
    ".p045-panel-title h2{overflow:hidden;font-size:14px;color:var(--p045-text);text-overflow:ellipsis;white-space:nowrap}",
    ".p045-panel-title p{overflow:hidden;margin-top:1px;color:var(--p045-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p045-panel-actions{display:flex;align-items:center;gap:8px}",
    ".p045-table-search{position:relative;width:260px}",
    ".p045-table-search svg{position:absolute;top:50%;left:10px;width:15px;height:15px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}",
    ".p045-table-search input{width:100%;height:36px;padding:0 10px 0 32px;border:1px solid var(--p045-border);border-radius:9px;outline:none;font-size:12px}",
    ".p045-table-search input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,0.12)}",
    ".p045-badge{padding:5px 10px;color:var(--p045-warning);border-radius:999px;background:var(--p045-warning-soft);font-size:11px;font-weight:700;white-space:nowrap}",
    ".p045-table-container{max-height:560px;overflow:auto}",
    ".p045-table{width:100%;min-width:950px;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p045-table th{position:sticky;top:0;z-index:2;padding:12px 14px;color:#475569;border-bottom:1px solid var(--p045-border);background:var(--p045-surface-soft);box-shadow:inset 0 -1px var(--p045-border);font-size:13px;font-weight:700;text-align:left;user-select:none}",
    ".p045-table th.sortable{cursor:pointer}",
    ".p045-table th.sortable:hover{color:var(--p045-primary);background:#f1f5f9}",
    ".p045-table td{max-width:300px;overflow:hidden;padding:10px 14px;border-bottom:1px solid #edf1f6;font-size:13px;line-height:1.45;color:var(--p045-text);text-overflow:ellipsis}",
    ".p045-table th.center,.p045-table td.center{text-align:center}",
    ".p045-table tbody tr{cursor:pointer;transition:0.14s ease}",
    ".p045-table tbody tr:nth-child(even){background:#fbfdff}",
    ".p045-table tbody tr:hover{background:#fff7ed}",
    ".p045-table tbody tr.selected{background:#dbeafe;box-shadow:inset 4px 0 var(--p045-primary)}",
    ".p045-customer-code{color:var(--p045-primary-dark);font-weight:700}",
    ".p045-district{color:#475569}",
    ".p045-vnos-count{display:inline-flex;min-width:32px;align-items:center;justify-content:center;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:700}",
    ".p045-vnos-count.high{color:#b91c1c;background:#fee2e2}",
    ".p045-vnos-count.medium{color:#b45309;background:#fef3c7}",
    ".p045-vnos-count.low{color:#1d4ed8;background:#dbeafe}",
    ".p045-empty{padding:26px 12px;color:var(--p045-muted);font-size:12px;text-align:center}",
    ".p045-table-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:var(--p045-muted);border-top:1px solid var(--p045-border);background:var(--p045-surface-soft);font-size:12px}",
    ".p045-footer-total{display:flex;align-items:center;gap:8px;padding:6px 11px;color:var(--p045-text);border:1px solid var(--p045-border);border-radius:9px;background:#fff}",
    ".p045-footer-total strong{color:var(--p045-warning)}",
    ".p045-empty-state{display:none;min-height:280px;align-items:center;justify-content:center;color:var(--p045-muted);text-align:center}",
    ".p045-empty-state.show{display:flex}",
    ".p045-empty-state svg{width:48px;height:48px;margin:0 auto 10px}",
    ".p045-empty-state p{margin-top:5px;font-size:11px}",
    /* modal view detail */
    ".p045-modal-overlay{--p045-primary:#2563eb;--p045-primary-dark:#1d4ed8;--p045-primary-soft:#eff6ff;--p045-success:#059669;--p045-success-soft:#ecfdf5;--p045-warning:#d97706;--p045-warning-soft:#fffbeb;--p045-danger:#dc2626;--p045-danger-soft:#fef2f2;--p045-text:#172033;--p045-muted:#64748b;--p045-border:#dbe3ef;--p045-surface-soft:#f8fafc;--p045-radius:16px;--p045-shadow:0 12px 32px rgba(15,23,42,0.08);position:fixed;inset:0;z-index:150;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(15,23,42,0.5);backdrop-filter:blur(3px)}",
    ".p045-modal-overlay.show{display:flex}",
    ".p045-modal{display:flex;flex-direction:column;width:100%;max-width:980px;max-height:88vh;overflow:hidden;border:1px solid var(--p045-border);border-radius:var(--p045-radius);background:#fff;box-shadow:0 24px 64px rgba(15,23,42,0.3)}",
    ".p045-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 18px;border-bottom:1px solid var(--p045-border)}",
    ".p045-modal-heading{display:flex;min-width:0;align-items:center;gap:11px}",
    ".p045-modal-icon{display:grid;width:40px;height:40px;flex:0 0 auto;place-items:center;color:var(--p045-primary);border-radius:11px;background:var(--p045-primary-soft)}",
    ".p045-modal-icon svg{width:19px;height:19px}",
    ".p045-modal-title h3{overflow:hidden;font-size:15px;color:var(--p045-text);text-overflow:ellipsis;white-space:nowrap}",
    ".p045-modal-title p{overflow:hidden;margin-top:2px;color:var(--p045-muted);font-size:11px;text-overflow:ellipsis;white-space:nowrap}",
    ".p045-modal-close{display:grid;width:34px;height:34px;flex:0 0 auto;place-items:center;color:var(--p045-muted);border:1px solid var(--p045-border);border-radius:9px;background:#fff;transition:0.15s ease}",
    ".p045-modal-close:hover{color:#fff;border-color:var(--p045-danger);background:var(--p045-danger)}",
    ".p045-modal-close svg{width:16px;height:16px}",
    ".p045-modal-actions{display:flex;align-items:center;gap:8px;padding:10px 18px;border-bottom:1px solid var(--p045-border);background:var(--p045-surface-soft)}",
    ".p045-toggle-button{display:inline-flex;height:34px;align-items:center;gap:6px;padding:0 12px;color:var(--p045-primary-dark);border:1px solid #bfdbfe;border-radius:9px;background:var(--p045-primary-soft);font-size:12px;font-weight:700;white-space:nowrap;transition:0.15s ease}",
    ".p045-toggle-button:hover{color:#fff;background:var(--p045-primary)}",
    ".p045-toggle-button svg{width:14px;height:14px}",
    ".p045-modal-search{display:none}",
    ".p045-modal-body{min-height:0;flex:1;overflow:auto;padding:0}",
    ".p045-detail-table{width:100%;border-collapse:separate;border-spacing:0;white-space:nowrap}",
    ".p045-detail-table th{padding:10px 14px;color:#475569;border-bottom:1px solid var(--p045-border);background:var(--p045-surface-soft);box-shadow:inset 0 -1px var(--p045-border);font-size:12px;font-weight:700;text-align:left}",
    ".p045-detail-table th.center{text-align:center}",
    "tr.p045-doc-row{cursor:pointer;transition:0.14s ease;background:linear-gradient(90deg,#eff6ff,#f8fafc)}",
    "tr.p045-doc-row:hover{background:linear-gradient(90deg,#dbeafe,#eff6ff)}",
    "tr.p045-doc-row.expanded{background:linear-gradient(90deg,#dbeafe,#e0f2fe)}",
    "tr.p045-doc-row td{padding:12px 14px;border-bottom:1px solid var(--p045-border);font-size:13px}",
    ".p045-expand-cell{display:flex;align-items:center;gap:10px}",
    ".p045-expand-icon{display:grid;width:24px;height:24px;flex:0 0 auto;place-items:center;color:var(--p045-primary-dark);border:1px solid #bfdbfe;border-radius:7px;background:#fff;transition:transform 0.18s ease}",
    "tr.p045-doc-row.expanded .p045-expand-icon{color:#fff;background:var(--p045-primary);transform:rotate(90deg)}",
    ".p045-expand-icon svg{width:14px;height:14px}",
    ".p045-doc-number{color:var(--p045-primary-dark);font-weight:700}",
    ".p045-status-tag{display:inline-flex;min-width:34px;align-items:center;justify-content:center;padding:4px 9px;color:#047857;border-radius:7px;background:#d1fae5;font-size:12px;font-weight:700}",
    ".p045-item-count-tag{display:none}",
    "tr.p045-item-row{background:#fff}",
    "tr.p045-item-row:hover td{background:#f8fafc}",
    "tr.p045-item-row.hidden-row{display:none}",
    "tr.p045-item-row td{padding:8px 14px;border-bottom:1px solid #f1f5f9;font-size:12px;line-height:1.4}",
    ".p045-item-indent{display:flex;align-items:center;gap:9px;padding-left:46px}",
    ".p045-item-connector{position:relative;width:16px;height:16px;flex:0 0 auto;border-bottom:2px solid #bfdbfe;border-left:2px solid #bfdbfe;border-bottom-left-radius:6px}",
    ".p045-item-order{display:inline-flex;min-width:22px;justify-content:center;color:#64748b;font-size:11px;font-weight:700}",
    ".p045-item-product-code{color:#1d4ed8;font-weight:700}",
    ".p045-item-qty{display:inline-flex;min-width:46px;justify-content:center;padding:3px 9px;color:#047857;border-radius:7px;background:#d1fae5;font-weight:700}",
    ".p045-detail-empty{padding:30px 14px;color:var(--p045-muted);font-size:12px;text-align:center}",
    ".p045-modal-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 18px;color:var(--p045-muted);border-top:1px solid var(--p045-border);background:var(--p045-surface-soft);font-size:12px}",
    /* toast */
    ".p045-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);z-index:200;display:flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;background:#0f172a;color:#fff;font-size:13px;font-weight:600;box-shadow:0 12px 32px rgba(15,23,42,0.3);opacity:0;pointer-events:none;transition:0.2s ease}",
    ".p045-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}",
    "@media (max-width:950px){.p045-launcher{grid-template-columns:1fr}}",
    "@media (max-width:680px){.p045-panel-header{align-items:flex-start;flex-direction:column}.p045-table-search{width:100%}}"
  ].join("\n");

  /* ---------- HTML ---------- */
  var HTML =
    '<div class="p045-app">' +
      // launcher
      '<form class="p045-launcher" id="p045Form">' +
        '<div class="p045-field">' +
          "<label>วันที่</label>" +
          '<div class="p045-input-wrap">' + icon("cal") + '<input id="p045Date" type="date">' + "</div>" +
        "</div>" +
        '<div class="p045-field">' +
          "<label>รหัสลูกค้า</label>" +
          '<div class="p045-input-wrap">' + icon("user") + '<input id="p045Cus" type="text" placeholder="เว้นว่างเพื่อแสดงทั้งหมด" autocomplete="off">' + "</div>" +
        "</div>" +
        '<button class="p045-search-button" id="p045SearchBtn" type="submit">' + icon("search") + " ค้นหา</button>" +
      "</form>" +
      // panel
      '<section class="p045-panel">' +
        '<div class="p045-panel-header">' +
          '<div class="p045-panel-heading">' +
            '<div class="p045-panel-icon">' + icon("warn") + "</div>" +
            '<div class="p045-panel-title"><h2>ลูกค้าที่มีบิลซ้ำในวันเดียวกัน</h2><p id="p045Subtitle">เลือกวันที่แล้วกดค้นหา</p></div>' +
          "</div>" +
          '<div class="p045-panel-actions">' +
            '<div class="p045-table-search">' + icon("search") + '<input id="p045Quick" type="search" placeholder="ค้นหารหัส, ชื่อลูกค้า หรือเขต">' +
            "</div>" +
            '<span class="p045-badge" id="p045Badge">0 รายการ</span>' +
          "</div>" +
        "</div>" +
        '<div class="p045-table-container" id="p045TableContainer"><table class="p045-table"><thead><tr>' +
          '<th class="sortable center" data-sort="date">วันที่</th>' +
          '<th class="sortable" data-sort="customerCode">รหัสลูกค้า</th>' +
          '<th class="sortable" data-sort="customerName">ชื่อลูกค้า</th>' +
          "<th>เขต/อำเภอ</th>" +
          '<th class="sortable center" data-sort="vnosCount">จำนวนบิล</th>' +
        "</tr></thead><tbody id=\"p045Rows\">" + emptyRow(5, "เลือกวันที่แล้วกดค้นหา") + "</tbody></table></div>" +
        '<div class="p045-empty-state" id="p045EmptyState"><div>' + icon("search") + "<strong>ไม่พบลูกค้าที่มีบิลซ้ำ</strong><p>ลองเปลี่ยนวันที่ หรือรหัสลูกค้า</p></div></div>" +
        '<div class="p045-table-footer">' +
          '<span id="p045FooterText">แสดง 0 รายการ</span>' +
          '<div class="p045-footer-total">รวมจำนวนบิลทั้งหมด <strong id="p045FooterVnos">0</strong></div>' +
        "</div>" +
      "</section>" +
      // modal view detail
      '<div class="p045-modal-overlay" id="p045ModalOverlay">' +
        '<div class="p045-modal" role="dialog" aria-modal="true">' +
          '<div class="p045-modal-header">' +
            '<div class="p045-modal-heading">' +
              '<div class="p045-modal-icon">' + icon("grid") + "</div>" +
              '<div class="p045-modal-title"><h3 id="p045ModalTitle">รายละเอียดลูกค้า</h3><p id="p045ModalSub"></p></div>' +
            "</div>" +
            '<button class="p045-modal-close" id="p045ModalClose" type="button">' + icon("close") + "</button>" +
          "</div>" +
          '<div class="p045-modal-actions">' +
            '<button class="p045-toggle-button" id="p045ExpandAll" type="button">' + icon("plus") + " ขยายทั้งหมด</button>" +
            '<button class="p045-toggle-button" id="p045CollapseAll" type="button">' + icon("minus") + " ยุบทั้งหมด</button>" +
            '<span class="p045-badge" id="p045ModalBadge">0 ใบ</span>' +
          "</div>" +
          '<div class="p045-modal-body" id="p045ModalBody"></div>' +
          '<div class="p045-modal-footer">' +
            '<span id="p045ModalFooterText">แสดง 0 ใบสำคัญ</span>' +
            '<span id="p045ModalFooterItems">0 รายการสินค้า</span>' +
          "</div>" +
        "</div>" +
      "</div>" +
      // toast
      '<div class="p045-toast" id="p045Toast"><span id="p045ToastMsg"></span></div>' +
    "</div>";

  /* ---------- mount ---------- */
  function mount(target) {
    root = target;
    var style = document.createElement("style");
    style.textContent = CSS;
    target.appendChild(style);
    target.insertAdjacentHTML("beforeend", HTML);

    el.date = $("p045Date");
    el.cus = $("p045Cus");
    el.searchBtn = $("p045SearchBtn");
    el.quick = $("p045Quick");
    el.subtitle = $("p045Subtitle");
    el.badge = $("p045Badge");
    el.rows = $("p045Rows");
    el.tableContainer = $("p045TableContainer");
    el.emptyState = $("p045EmptyState");
    el.footerText = $("p045FooterText");
    el.footerVnos = $("p045FooterVnos");
    el.toast = $("p045Toast");
    el.modalOverlay = $("p045ModalOverlay");
    el.modalTitle = $("p045ModalTitle");
    el.modalSub = $("p045ModalSub");
    el.modalBadge = $("p045ModalBadge");
    el.modalBody = $("p045ModalBody");
    el.modalFooterText = $("p045ModalFooterText");
    el.modalFooterItems = $("p045ModalFooterItems");

    // default = วันนี้ (clone demo)
    el.date.value = isoDate(new Date());

    // modal → document.body (portal) — MAIN.content มี transform → position:fixed จะผิด reference
    // (เคลียร์ overlay เก่าจาก mount หน้า — portal อาจ mount 2 ครั้ง)
    document.querySelectorAll("body > .p045-modal-overlay").forEach(function (o) { o.remove(); });
    document.body.appendChild(el.modalOverlay);

    $("p045Form").addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });

    el.quick.addEventListener("input", function () { render(); });

    // modal — row click = show detail (clone demo viewdetail)
    el.rows.addEventListener("click", function (e) {
      var tr = e.target.closest("tr");
      if (!tr || tr.classList.contains("p045-empty")) return;
      var cells = tr.querySelectorAll("td");
      if (cells.length < 3) return;
      var cus = cells[1] ? cells[1].textContent.trim() : "";
      var cusName = cells[2] ? cells[2].textContent.trim() : "";
      if (cus) openDetail(cus, cusName, el.date.value);
    });

    $("p045ModalClose").addEventListener("click", closeDetail);
    el.modalOverlay.addEventListener("click", function (e) {
      if (e.target === el.modalOverlay) closeDetail();
    });
    if (!escapeBound) {
      escapeBound = true;
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modalState.open) closeDetail();
      });
    }

    el.modalBody.addEventListener("click", function (e) {
      var docRow = e.target.closest(".p045-doc-row");
      if (!docRow) return;
      var vnos = docRow.getAttribute("data-vnos");
      modalState.expanded[vnos] = modalState.expanded[vnos] !== true;
      renderDetail();
    });

    $("p045ExpandAll").addEventListener("click", function () {
      modalState.bills.forEach(function (b) { modalState.expanded[b.vnos] = true; });
      renderDetail();
    });
    $("p045CollapseAll").addEventListener("click", function () {
      modalState.expanded = {};
      renderDetail();
    });

    document.querySelectorAll(".p045-table th.sortable").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.getAttribute("data-sort");
        if (state.sortField === f) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortField = f;
          state.sortDir = "asc";
        }
        render();
      });
    });

    render();
  }

  window.P045SameBill = { mount: mount };
})();
