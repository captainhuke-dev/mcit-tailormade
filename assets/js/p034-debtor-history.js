/* P034 — ประวัติทางการเงินลูกหนี้
 * IIFE — window.P034DebtorHistory = { mount }
 * Data: MAC5 — รอ SQL จาก user (mock data ชั่วคราว)
 * UI: ค้นหาลูกหนี้ (รหัส/ชื่อ) + ข้อมูลลูกหนี้ + 6 สรุป cards + 2 tables (pagination 15) + timeline ทวงหนี้
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var PAGE_SIZE = 15;



  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtBaht(n) {
    return "฿ " + Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  var state = {
    query: "",
    found: null,
    debtPage: 1,
    payPage: 1,
    fuPage: 1
  };

  /* ---------- icons (inline SVG) ---------- */
  function icon(name, size) {
    var s = size || 16;
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      idCard: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="11" r="2"></circle><path d="M15 9h4M15 13h4M6 16h6"></path>',
      mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
      phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
      chartPie: '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path>',
      invoice: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>',
      clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
      alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
      cart: '<circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>',
      userTie: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
      money: '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 12h.01M18 12h.01"></path>',
      headset: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',
      envelope: '<rect x="2" y="4" width="20" height="16" rx="2"></rect><polyline points="22,6 12,13 2,6"></polyline>',
      handshake: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><path d="M23 11h-6l-2-2h-4l-2 2H3"></path><path d="M18 11l3 3-3 3"></path>',
      flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line>'
    };
    var p = paths[name] || paths.flag;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }

  /* ---------- search (API MAC5) ---------- */
  var CONN_ID = "c1788406814359";
  var ODOO_CONN_ID = "c1788406918263";

  function apiFetch(path, payload) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function suggestDebtor(q) {
    q = String(q || "").trim();
    if (!q) return Promise.resolve([]);
    return apiFetch("p034_search.php", { connectionId: CONN_ID, q: q }).then(function (res) {
      return (res && res.ok) ? (res.rows || []) : [];
    }).catch(function () { return []; });
  }

  function buildDebtor(r) {
    return {
      code: r.code,
      name: r.name,
      groupCode: r.groupCode,
      grade: r.grade,
      groupName: r.groupName,
      address: r.address,
      phone: r.phone,
      since: r.since,
      rep: r.rep,
      creditDays: r.creditDays,
      curCredit: r.curCredit,
      soTotal: 0,
      invTotal: 0,
      dueTotal: 0,
      bouncedCheck: 0,
      debts: [],
      payments: [],
      followups: []
    };
  }

  function searchDebtor(ref) {
    var q = String(ref || "").trim().toLowerCase();
    var codePart = q;
    var namePart = "";
    var sp = q.indexOf(" ");
    if (sp > 0) { codePart = q.substring(0, sp); namePart = q.substring(sp + 1); }
    return apiFetch("p034_search.php", { connectionId: CONN_ID, q: codePart }).then(function (res) {
      if (!res || !res.ok) throw new Error(res && res.error ? res.error : "API error");
      var rows = res.rows || [];
      var hit = null;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].code.toLowerCase() === codePart) { hit = rows[i]; break; }
      }
      if (!hit && namePart) {
        for (var j = 0; j < rows.length; j++) {
          if (rows[j].name.toLowerCase().indexOf(namePart) >= 0) { hit = rows[j]; break; }
        }
      }
      if (!hit && rows.length) hit = rows[0];
      if (!hit) return null;
      var d = buildDebtor(hit);
      return apiFetch("p034_cards.php", { connectionId: CONN_ID, code: d.code }).then(function (res) {
        if (res && res.ok && res.cards) {
          d.soTotal = res.cards.soTotal || 0;
          d.invTotal = res.cards.invTotal || 0;
          d.dueTotal = res.cards.dueTotal || 0;
          d.bouncedCheck = res.cards.bouncedCheck || 0;
        }
        return d;
      }).then(function (d) {
        return apiFetch("p034_debts.php", { connectionId: CONN_ID, code: d.code }).then(function (res) {
          if (res && res.ok) d.debts = res.rows || [];
          return d;
        });
      }).then(function (d) {
        return apiFetch("p034_checks.php", { connectionId: CONN_ID, code: d.code }).then(function (res) {
          if (res && res.ok) d.payments = res.rows || [];
          return d;
        });
      }).then(function (d) {
        return apiFetch("p034_followups.php", { connectionId: ODOO_CONN_ID, code: d.code }).then(function (res) {
          if (res && res.ok) d.followups = res.rows || [];
          return d;
        });
      });
    });
  }

  /* ---------- render ---------- */
  function mount(root) {
    state.query = "";
    state.found = null;
    state.debtPage = 1;
    state.payPage = 1;
    state.fuPage = 1;
    root.innerHTML =
      '<div class="p034-launcher">' +
        '<label class="p034-field">' +
          '<span class="p034-label">ค้นหาลูกหนี้ <em>*</em></span>' +
          '<div class="p034-acwrap">' +
            '<input id="p034Ref" type="text" class="p034-input" placeholder="รหัสลูกหนี้ หรือ ชื่อลูกหนี้" autocomplete="off">' +
            '<div id="p034Ac" class="p034-ac"></div>' +
          "</div>" +
        "</label>" +
      "</div>" +
      '<div id="p034Result"></div>' +
      '<div id="p034Toast" class="p034-toast"></div>';

    var ref = root.querySelector("#p034Ref");
    var ac = root.querySelector("#p034Ac");
    var acIdx = -1;
    var acItems = [];

    function closeAc() {
      ac.innerHTML = "";
      ac.classList.remove("p034-ac-open");
      acIdx = -1;
      acItems = [];
    }

    var acTimer = null;
    var acSeq = 0;
    function renderAc() {
      var q = ref.value;
      if (acTimer) clearTimeout(acTimer);
      acTimer = setTimeout(function () {
        var seq = ++acSeq;
        suggestDebtor(q).then(function (items) {
          if (seq !== acSeq) return;
          acItems = items || [];
          acIdx = -1;
          if (!acItems.length) { closeAc(); return; }
          var html = "";
          for (var i = 0; i < acItems.length; i++) {
            var d = acItems[i];
            html +=
              '<div class="p034-ac-item" data-i="' + i + '">' +
                '<span class="p034-ac-code">' + esc(d.code) + "</span>" +
                '<span class="p034-ac-name">' + esc(d.name) + "</span>" +
                '<span class="p034-ac-dist">(' + esc(d.district || d.groupName || "") + ")</span>" +
              "</div>";
          }
          ac.innerHTML = html;
          ac.classList.add("p034-ac-open");
          ac.querySelectorAll(".p034-ac-item").forEach(function (el) {
            el.addEventListener("mousedown", function (e) {
              e.preventDefault();
              var it = acItems[Number(el.getAttribute("data-i"))];
              if (it) { ref.value = it.code + " " + it.name; closeAc(); doSearch(); }
            });
          });
        });
      }, 200);
    }

    ref.addEventListener("input", renderAc);
    ref.addEventListener("focus", renderAc);
    ref.addEventListener("blur", function () { setTimeout(closeAc, 150); });
    ref.addEventListener("keydown", function (e) {
      if (!ac.classList.contains("p034-ac-open")) {
        if (e.key === "Enter") doSearch();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var n = acItems.length;
        if (!n) return;
        acIdx = e.key === "ArrowDown" ? (acIdx + 1) % n : (acIdx - 1 + n) % n;
        ac.querySelectorAll(".p034-ac-item").forEach(function (el, i) {
          el.classList.toggle("p034-ac-active", i === acIdx);
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (acIdx >= 0 && acItems[acIdx]) {
          ref.value = acItems[acIdx].code + " " + acItems[acIdx].name;
          closeAc();
          doSearch();
        }
      } else if (e.key === "Escape") {
        closeAc();
      }
    });

  }

  function doSearch() {
    var ref = (root_el("#p034Ref") || {}).value;
    if (!ref || !String(ref).trim()) {
      showToast("⚠ กรอกรหัสลูกหนี้ หรือ ชื่อลูกหนี้ เพื่อค้นหา");
      return;
    }
    state.debtPage = 1;
    state.payPage = 1;
    state.fuPage = 1;
    searchDebtor(ref).then(function (hit) {
      if (!hit) {
        state.found = null;
        renderResult();
        showToast("⚠ ไม่พบข้อมูล — ไม่มีลูกหนี้ที่ตรงกับเงื่อนไขค้นหา", 3200);
      } else {
        state.found = hit;
        renderResult();
        showToast("✓ พบ " + hit.name);
      }
    }).catch(function (e) {
      showToast("⚠ ค้นหาไม่สำเร็จ: " + (e && e.message ? e.message : ""), 3200);
    });
  }

  var _root = null;
  function root_el(id) {
    if (!_root) return null;
    var sel = id.charAt(0) === "#" ? id : "#" + id;
    return _root.querySelector(sel);
  }

  function renderResult() {
    var box = root_el("#p034Result");
    if (!box) return;
    if (!state.found) { box.innerHTML = ""; return; }
    var d = state.found;

    var html = "";

    // 1. debtor panel
    var gradeCls = "p034-grade-" + String(d.grade || "").toLowerCase();
    html +=
      '<div class="p034-panel">' +
        '<div class="p034-panel-main">' +
          '<div class="p034-panel-top">' +
            '<span class="p034-code">' + icon("idCard", 14) + " " + esc(d.code) + "</span>" +
            '<span class="p034-name">' + esc(d.name) + "</span>" +
            '<span class="p034-groupcode">(' + esc(d.groupCode) + ")</span>" +
            '<span class="p034-grade ' + gradeCls + '">' + esc(d.grade) + "</span>" +
            '<span class="p034-groupname">' + icon("users", 13) + " " + esc(d.groupName) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="p034-panel-right">' +
          "<span>" + icon("mapPin", 14) + " " + esc(d.address) + "</span>" +
          '<span class="p034-pr-row">' +
            "<span>" + icon("phone", 14) + " " + esc(d.phone) + "</span>" +
            "<span>" + icon("calendar", 14) + " เริ่มค้าขาย " + esc(d.since) + "</span>" +
          "</span>" +
        "</div>" +
      "</div>";

    // 2. summary cards
    html += '<div class="p034-cards">';
    html += card("userTie", "ผู้แทน", '<span class="p034-card-sm">' + esc(d.rep) + "</span>", "");
    html += card("clock", "เครดิต", d.creditDays + " วัน", "");
    html += card("chartPie", "วงเงินปัจจุบัน", fmtBaht(d.curCredit), "");
    html += card("cart", "ยอด SO", fmtBaht(d.soTotal), "");
    html += card("invoice", "ยอด INV", fmtBaht(d.invTotal), "");
    html += card("clock", "ยอด Due", fmtBaht(d.dueTotal), "");
    html += card("alert", "ยอดเช็คคืนค้างชำระ", fmtBaht(d.bouncedCheck), d.bouncedCheck > 0 ? '<span class="p034-sub-err">● มียอดค้าง</span>' : '<span class="p034-sub-ok">' + iconCheck(12) + " ไม่มียอดค้าง</span>");
    html += "</div>";

    // 3. debts table
    html += sectionTitle("invoice", "รายการหนี้ค้างชำระ");
    html += tableWrap(debtsTable(d), "p034DebtPager");

    // 4. payments table
    html += sectionTitle("money", "รายการเช็ครอผ่าน");
    html += tableWrap(paymentsTable(d), "p034PayPager");

    // 5. followup report
    html += sectionTitle("headset", "รายงานการติดตามทวงหนี้ Odoo");
    html += tableWrap(followupsTable(d), "p034FuPager");

    box.innerHTML = html;

    // pager events
    bindPager("p034DebtPager", state.debtPage, d.debts.length, function (p) { state.debtPage = p; renderResult(); });
    bindPager("p034PayPager", state.payPage, d.payments.length, function (p) { state.payPage = p; renderResult(); });
    bindPager("p034FuPager", state.fuPage, d.followups.length, function (p) { state.fuPage = p; renderResult(); });
  }

  function iconCheck(s) { return '<svg width="' + (s || 14) + '" height="' + (s || 14) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'; }

  function card(ic, label, value, sub) {
    return (
      '<div class="p034-card">' +
        '<span class="p034-card-label">' + icon(ic, 14) + " " + esc(label) + "</span>" +
        '<span class="p034-card-value">' + value + "</span>" +
        '<span class="p034-card-sub">' + sub + "</span>" +
      "</div>"
    );
  }

  function sectionTitle(ic, title) {
    return '<div class="p034-section">' + '<span class="p034-section-ic">' + icon(ic, 16) + "</span>" + esc(title) + "</div>";
  }

  function tableWrap(inner, pagerId) {
    return '<div class="p034-tablewrap">' + inner + "</div><div id=\"" + pagerId + "\" class=\"p034-pager\"></div>";
  }

  function debtsTable(d) {
    var rows = d.debts;
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    var pg = Math.min(state.debtPage, pages);
    var start = (pg - 1) * PAGE_SIZE;
    var slice = rows.slice(start, start + PAGE_SIZE);
    // ยอดรวม = ทั้งหมด (ไม่ใช้เฉพาะหน้า)
    var sum = 0;
    for (var s = 0; s < rows.length; s++) sum += Number(rows[s].amount || 0);

    var html =
      '<table class="p034-table p034-zebra p034-cols"><thead><tr>' +
        "<th>ประเภท</th><th>เลขที่ใบสำคัญ</th><th>วันที่</th><th>วันครบกำหนด</th><th>เครดิต</th><th>มูลค่า</th>" +
      "</tr></thead><tbody>";
    if (!slice.length) {
      html += '<tr><td colspan="6" class="p034-empty">ไม่มีรายการ</td></tr>';
    } else {
      for (var i = 0; i < slice.length; i++) {
        var r = slice[i];
        html +=
          "<tr>" +
            "<td>" + esc(r.type) + "</td>" +
            "<td>" + esc(r.no) + "</td>" +
            "<td>" + esc(r.date) + "</td>" +
            "<td>" + esc(r.due) + "</td>" +
            "<td>" + r.credit + "</td>" +
            '<td class="p034-num">' + Number(r.amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>" +
          "</tr>";
      }
    }
    html +=
      '<tr class="p034-totalrow">' +
        '<td colspan="5" class="p034-total-label">ยอดรวม</td>' +
        '<td class="p034-num">' + sum.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>" +
      "</tr>";
    html += "</tbody></table>";
    return html;
  }

  function paymentsTable(d) {
    var rows = d.payments;
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    var pg = Math.min(state.payPage, pages);
    var start = (pg - 1) * PAGE_SIZE;
    var slice = rows.slice(start, start + PAGE_SIZE);

    var html =
      '<table class="p034-table p034-zebra p034-cols"><thead><tr>' +
        "<th>หมายเลขเช็ค</th><th>วันที่เช็ค</th><th>ธนาคาร</th><th>วันรับ/ออกเช็ค</th><th>สถานะ (ชำระเงิน)</th><th>เฉลี่ย(วัน)</th><th>มูลค่า</th><th>สถานะ (วิธีชำระ)</th>" +
      "</tr></thead><tbody>";
    if (!slice.length) {
      html += '<tr><td colspan="8" class="p034-empty">ไม่มีรายการ</td></tr>';
    } else {
      for (var i = 0; i < slice.length; i++) {
        var r = slice[i];
        var stCls = r.status === "เช็คคืน" ? "p034-badge-overdue" : (r.status === "ชำระแล้ว" ? "p034-badge-cleared" : "p034-badge-pending");
        var actCls = r.action === "เช็คคืน" ? "p034-badge-overdue" : (r.action === "เก็บสด" ? "p034-badge-cleared" : "p034-badge-pending");
        html +=
          "<tr>" +
            "<td>" + esc(r.no) + "</td>" +
            "<td>" + esc(r.cdate) + "</td>" +
            "<td>" + esc(r.bank) + "</td>" +
            "<td>" + esc(r.rdate) + "</td>" +
            '<td><span class="p034-badge ' + stCls + '">' + esc(r.status) + "</span></td>" +
            "<td>" + esc(r.avg) + "</td>" +
            '<td class="p034-num">' + Number(r.amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>" +
            '<td>' + (r.action ? '<span class="p034-badge ' + actCls + '">' + esc(r.action) + "</span>" : "") + "</td>" +
          "</tr>";
      }
    }
    html += "</tbody></table>";
    return html;
  }

  function followupsTable(d) {
    var rows = d.followups;
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    var pg = Math.min(state.fuPage, pages);
    var start = (pg - 1) * PAGE_SIZE;
    var slice = rows.slice(start, start + PAGE_SIZE);

    var html =
      '<table class="p034-table p034-zebra p034-cols p034-fu"><thead><tr>' +
        "<th>เลขที่ case</th><th>วันที่ case</th><th>วันที่นัดชำระ</th><th>ยอดเงิน</th><th>ความคิดเห็น</th>" +
      "</tr></thead><tbody>";
    if (!slice.length) {
      html += '<tr><td colspan="5" class="p034-empty">ไม่มีรายการ</td></tr>';
    } else {
      for (var i = 0; i < slice.length; i++) {
        var r = slice[i];
        var note = esc(r.note).split("\n").join("<br>");
        html +=
          "<tr>" +
            "<td>" + esc(r.caseNo) + "</td>" +
            "<td>" + esc(r.caseDate) + "</td>" +
            "<td>" + esc(r.payDate) + "</td>" +
            '<td class="p034-num">' + Number(r.amount).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td>" +
            '<td class="p034-note">' + note + "</td>" +
          "</tr>";
      }
    }
    html += "</tbody></table>";
    return html;
  }

  function bindPager(pagerId, page, total, cb) {
    var el = root_el(pagerId);
    if (!el) return;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (pages <= 1) { el.innerHTML = ""; return; }
    var html =
      '<button class="p034-pg-btn" data-pg="prev" ' + (page <= 1 ? "disabled" : "") + ">‹</button>" +
      '<span class="p034-pg-info">' + page + " / " + pages + "</span>" +
      '<button class="p034-pg-btn" data-pg="next" ' + (page >= pages ? "disabled" : "") + ">›</button>";
    el.innerHTML = html;
    el.querySelectorAll(".p034-pg-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var dir = b.getAttribute("data-pg") === "next" ? 1 : -1;
        var np = page + dir;
        if (np >= 1 && np <= pages) cb(np);
      });
    });
  }

  var toastTimer = null;
  function showToast(msg, ms) {
    var t = root_el("#p034Toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById("p034Styles")) return;
    var st = document.createElement("style");
    st.id = "p034Styles";
    st.textContent =
      ".p034-launcher{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:16px 18px}" +
      ".p034-field{display:flex;flex-direction:column;gap:6px;width:50%;min-width:260px}" +
      ".p034-label{font-size:12px;font-weight:600;color:#475569}" +
      ".p034-label em{color:#dc2626;font-style:normal}" +
      ".p034-input{height:40px;border:1px solid #d7dee9;border-radius:10px;padding:0 14px;font-size:13px;outline:none;background:#fbfcfe}" +
      ".p034-input:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.12)}" +
      ".p034-acwrap{position:relative}" +
      ".p034-acwrap .p034-input{width:100%;box-sizing:border-box}" +
      ".p034-ac{display:none;position:absolute;top:44px;left:0;right:0;background:#fff;border:1px solid #d7dee9;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.12);max-height:240px;overflow-y:auto;z-index:50}" +
      ".p034-ac.p034-ac-open{display:block}" +
      ".p034-ac-item{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #f1f5f9;font-size:12.5px}" +
      ".p034-ac-item:last-child{border-bottom:none}" +
      ".p034-ac-item:hover,.p034-ac-item.p034-ac-active{background:#eef4ff}" +
      ".p034-ac-code{font-weight:700;color:#2563eb;min-width:90px}" +
      ".p034-ac-name{color:#0f172a;flex:1}" +
      ".p034-ac-dist{color:#64748b;font-size:11px}" +
      ".p034-btn-primary{display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 20px;border:none;border-radius:10px;background:#2563eb;color:#fff;font-size:13px;font-weight:600;cursor:pointer}" +
      ".p034-btn-primary:hover{background:#1d4ed8}" +
      ".p034-panel{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:16px 20px;margin-top:14px}" +
      ".p034-panel-main{display:flex;flex-direction:column;gap:8px;min-width:280px}" +
      ".p034-panel-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}" +
      ".p034-groupcode{font-size:13px;font-weight:600;color:#475569}" +
      ".p034-grade{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;border-radius:8px;font-size:13px;font-weight:700;padding:0 8px;background:#f8fafc;color:#475569;border:1px solid #e5eaf2}" +
      ".p034-grade-a{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}" +
      ".p034-grade-b{background:#eef4ff;color:#1d4ed8;border:1px solid #bfdbfe}" +
      ".p034-grade-c{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}" +
      ".p034-groupname{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:#475569;background:#f8fafc;border:1px solid #e5eaf2;border-radius:20px;padding:4px 12px}" +
      ".p034-groupname svg{color:#2563eb}" +
      ".p034-code{display:inline-flex;align-items:center;gap:6px;background:#eef4ff;border:1px solid #d4e2fb;border-radius:20px;padding:7px 14px;font-size:13px;font-weight:600;color:#1e3a8a}" +
      ".p034-name{font-size:18px;font-weight:700;color:#0f172a}" +
      ".p034-panel-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;font-size:12px;color:#475569}" +
      ".p034-panel-right .p034-pr-row{display:flex;gap:20px;flex-wrap:wrap}" +
      ".p034-panel-right span{display:inline-flex;align-items:center;gap:6px}" +
      ".p034-panel-right svg{color:#2563eb}" +
      ".p034-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}" +
      ".p034-card{background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:8px}" +
      ".p034-card-label{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.03em}" +
      ".p034-card-label svg{color:#2563eb}" +
      ".p034-card-value{font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-.01em}" +
      ".p034-card-sm{font-size:15px}" +
      ".p034-card-sub{font-size:12px;color:#475569;display:inline-flex;align-items:center;gap:5px}" +
      ".p034-sub-ok{color:#15803d}" +
      ".p034-sub-err{color:#dc2626}" +
      ".p034-section{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:600;color:#0f172a;margin:22px 0 10px}" +
      ".p034-section-ic{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;background:#eef4ff;color:#2563eb}" +
      ".p034-tablewrap{background:#fff;border:1px solid #e5eaf2;border-radius:14px;overflow-x:auto}" +
      ".p034-table{width:100%;border-collapse:collapse;font-size:12.5px}" +
      ".p034-table th{text-align:center;padding:11px 16px;background:#f8fafc;font-weight:600;color:#334155;font-size:11px;text-transform:uppercase;letter-spacing:.03em;border-bottom:1px solid #e5eaf2;white-space:nowrap}" +
      ".p034-table td{padding:11px 16px;border-bottom:1px solid #f1f5f9;color:#1e293b;white-space:nowrap;text-align:center}" +
      ".p034-table tr:last-child td{border-bottom:none}" +
      ".p034-table tr:hover td{background:#fafcff}" +
      ".p034-table.p034-zebra tbody tr:nth-child(even):not(.p034-totalrow) td{background:#f8fafc}" +
      ".p034-table.p034-zebra tbody tr:nth-child(even):not(.p034-totalrow):hover td{background:#f1f5fb}" +
      ".p034-table.p034-cols th:not(:first-child),.p034-table.p034-cols td:not(:first-child){border-left:1px solid #e5eaf2}" +
      ".p034-table tr.p034-totalrow td{background:#f8fafc;font-weight:700;color:#0f172a;border-top:2px solid #e5eaf2}" +
      ".p034-table tr.p034-totalrow:hover td{background:#f8fafc}" +
      ".p034-num{text-align:right;font-variant-numeric:tabular-nums}" +
      ".p034-table td.p034-num{text-align:right;font-variant-numeric:tabular-nums}" +
      ".p034-table tr.p034-totalrow td.p034-num{text-align:right}" +
      ".p034-table tr.p034-totalrow td.p034-total-label{text-align:right}" +
      ".p034-table.p034-fu{table-layout:fixed}" +
      ".p034-table.p034-fu th:nth-child(1),.p034-table.p034-fu td:nth-child(1){width:110px}" +
      ".p034-table.p034-fu th:nth-child(2),.p034-table.p034-fu td:nth-child(2){width:120px}" +
      ".p034-table.p034-fu th:nth-child(3),.p034-table.p034-fu td:nth-child(3){width:130px}" +
      ".p034-table.p034-fu th:nth-child(4),.p034-table.p034-fu td:nth-child(4){width:120px}" +
      ".p034-table.p034-fu td.p034-note{white-space:normal;text-align:left;line-height:1.6;word-break:break-word}" +
      ".p034-table.p034-fu td{vertical-align:top}" +
      ".p034-empty{text-align:center;color:#94a3b8;padding:24px 0}" +
      ".p034-badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}" +
      ".p034-badge-overdue{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}" +
      ".p034-badge-warning{background:#fff7ed;color:#c2410c;border:1px solid #fed7aa}" +
      ".p034-badge-pending{background:#fefce8;color:#a16207;border:1px solid #fde68a}" +
      ".p034-badge-cleared{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}" +
      ".p034-pager{display:flex;justify-content:center;align-items:center;gap:10px;margin-top:10px}" +
      ".p034-pg-btn{width:30px;height:30px;border:1px solid #d7dee9;border-radius:8px;background:#fff;color:#334155;font-size:15px;cursor:pointer;line-height:1}" +
      ".p034-pg-btn:hover:not(:disabled){border-color:#2563eb;color:#2563eb}" +
      ".p034-pg-btn:disabled{opacity:.4;cursor:default}" +
      ".p034-pg-info{font-size:12px;color:#64748b}" +
      ".p034-timeline{display:flex;flex-direction:column;gap:14px;background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:18px 20px}" +
      ".p034-tl-item{display:flex;align-items:flex-start;gap:14px}" +
      ".p034-tl-icon{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;background:#eef4ff;color:#1e3a8a;border:1px solid #d4e2fb;flex-shrink:0}" +
      ".p034-tl-body{flex:1;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding-top:2px}" +
      ".p034-tl-date{font-weight:600;color:#0f172a;font-size:12px;min-width:90px}" +
      ".p034-tl-text{color:#334155;font-size:13px;flex:1;min-width:200px}" +
      ".p034-tl-status{font-size:11px;color:#475569;background:#f8fafc;border:1px solid #e5eaf2;border-radius:20px;padding:3px 12px}" +
      ".p034-toast{position:fixed;right:20px;bottom:20px;z-index:210;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:12px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:.2s}" +
      ".p034-toast.show{opacity:1;visibility:visible;transform:translateY(0)}";
    document.head.appendChild(st);
  }

  // wrap mount to track root
  var _mount = mount;
  function mountWithRoot(root) {
    _root = root;
    injectCSS();
    _mount(root);
  }

  window.P034DebtorHistory = { mount: mountWithRoot };
})();
