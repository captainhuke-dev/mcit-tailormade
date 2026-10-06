/* P008 — ใบปะหน้าเก็บเงิน VAT, No VAT V2 (clone demo/P008-demo.html + C# MCIT_FrmAccountServiceGUI_VATversion_V2)
 * IIFE — window.P008CollectionV2 = { mount }
 * Data: real data MAC5 (api/p008_search.php — clone SQL C#: CFS + CDC + DEB + PER)
 * UI: launcher (ค้นหา rows 4+5 + actions) + table (checkbox select + sort + footer) + Print A4 landscape + Export CSV
 */
(function () {
  "use strict";

  /* ---------- real data MAC5 ---------- */
  var MAC5_CONNECTION_ID = "c1788406814359";

  function apiFetch(path, payload) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  var MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function formatMoney(v) { return moneyFmt.format(Number(v || 0)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var state = {
    currentRows: [],
    selectedCodes: {},
    sortField: "customerCode",
    sortDirection: "asc",
    searched: false,
    groups: [],          /* [{code, desc}] จาก api/p008_groups.php */
    selectedGroups: {},  /* {code: true} */
    report: null,        /* Phase 2 — {header, customers} จาก api/p008_report.php */
    reportParams: null   /* {province, employee, asOf, round, month, year, showQr, showLastSale} */
  };

  function icon(name, size) {
    var s = size || 20;
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      pin: '<path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"></path><circle cx="12" cy="9" r="2.5"></circle>',
      user: '<circle cx="12" cy="7" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>',
      grid: '<path d="M4 4h16v16H4z"></path><path d="M8 8h8M8 12h8M8 16h5"></path>',
      help: '<circle cx="12" cy="12" r="10"></circle><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01"></path>',
      calendar: '<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>',
      refresh: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path>',
      chart: '<path d="M3 3v18h18"></path><path d="m7 16 4-5 4 3 5-7"></path>',
      download: '<path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path>',
      print: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect>',
      table: '<path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path>',
      arrow: '<path d="m6 9 6 6 6-6"></path>'
    };
    var p = paths[name] || paths.grid;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">' + p + "</svg>";
  }

  function mount(root) {
    state.currentRows = [];
    state.selectedCodes = {};
    state.sortField = "customerCode";
    state.sortDirection = "asc";
    state.searched = false;
    state.groups = [];
    state.selectedGroups = {}; /* เริ่มต้นว่าง (user spec) */
    injectCSS();

    /* default = วันนี้ (clone C# _Load: month = current, year = current) */
    var now = new Date();
    var todayISO = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    var thisYear = now.getFullYear();
    var monthOptions = MONTHS.map(function (m, i) {
      return '<option value="' + (i + 1) + '"' + (i === now.getMonth() ? " selected" : "") + ">" + m + "</option>";
    }).join("");

    root.innerHTML =
      '<section class="p008-launcher">' +
        '<form class="p008-filter-card" id="p008Form">' +
          "<h2>" + icon("search", 19) + " ค้นหา</h2>" +
          '<div class="p008-filter-row p008-row-4">' +
            '<div class="p008-field">' +
              '<label for="p008Province">รหัสจังหวัด</label>' +
              '<div class="p008-input-wrap">' + icon("pin", 17) +
                '<input id="p008Province" type="text" value="" maxlength="2" placeholder="เช่น 74">' +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label for="p008Employee">รหัสพนักงานขาย</label>' +
              '<div class="p008-input-wrap">' + icon("user", 17) +
                '<input id="p008Employee" type="text" value="" placeholder="เช่น S50">' +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label for="p008Group">กลุ่มลูกหนี้</label>' +
              '<div class="p008-group-row">' +
                '<div class="p008-input-wrap">' + icon("grid", 17) +
                  '<input id="p008Group" type="text" value="" readonly placeholder="เลือกกลุ่มลูกหนี้">' +
                "</div>" +
                '<button class="p008-inline-btn" id="p008GroupBtn" type="button" title="เลือกกลุ่มลูกหนี้">' + icon("help", 15) + "</button>" +
                '<div class="p008-group-dropdown" id="p008GroupDropdown">' +
                  '<div class="p008-gd-search">' + icon("search", 14) +
                    '<input id="p008GroupFilter" type="text" placeholder="ค้นหา...">' +
                  "</div>" +
                  '<div class="p008-gd-table" id="p008GroupTable"></div>' +
                  '<div class="p008-gd-footer">' +
                    '<span id="p008GroupCount">0 กลุ่ม</span>' +
                    '<div class="p008-gd-btns">' +
                      '<button type="button" class="p008-gd-selectall" id="p008GroupSelectAll">เลือกทั้งหมด</button>' +
                      '<button type="button" class="p008-gd-close" id="p008GroupClose">ปิด</button>' +
                    "</div>" +
                  "</div>" +
                "</div>" +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label for="p008AsOf">อ้างอิงใบแจ้งหนี้ จนถึงวันที่</label>' +
              '<div class="p008-input-wrap">' + icon("calendar", 17) +
                '<input id="p008AsOf" type="date" value="' + todayISO + '">' +
              "</div>" +
            "</div>" +
          "</div>" +
          '<div class="p008-filter-row p008-row-5">' +
            '<div class="p008-field">' +
              '<label for="p008Round">รอบที่/รายงานรอบต่อ</label>' +
              '<div class="p008-input-wrap">' + icon("refresh", 17) +
                '<input id="p008Round" type="number" min="1" value="1">' +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label for="p008Month">เดือน</label>' +
              '<div class="p008-input-wrap">' + icon("calendar", 17) +
                '<select id="p008Month">' + monthOptions + "</select>" + icon("arrow", 15) +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label for="p008Year">ปี</label>' +
              '<div class="p008-input-wrap">' + icon("calendar", 17) +
                '<input id="p008Year" type="number" value="' + thisYear + '">' +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label for="p008Collector">เก็บเงินโดย</label>' +
              '<div class="p008-input-wrap">' + icon("chart", 17) +
                '<select id="p008Collector">' +
                  '<option value="age">AGE-ผู้แทน</option>' +
                  '<option value="fin">FIN-สินเชื่อ</option>' +
                "</select>" + icon("arrow", 15) +
              "</div>" +
            "</div>" +
            '<div class="p008-field">' +
              '<label>&nbsp;</label>' +
              '<button class="p008-search-btn" type="submit">' + icon("search", 16) + " ค้นหา</button>" +
            "</div>" +
          "</div>" +
        "</form>" +

        '<aside class="p008-action-card">' +
          '<button class="p008-action-btn excel" id="p008ExportBtn" type="button">' + icon("download", 17) + " Export To Excel</button>" +
          '<button class="p008-action-btn print" id="p008PrintBtn" type="button">' + icon("print", 17) + " Print</button>" +
          '<div class="p008-option-list">' +
            '<label class="p008-checkbox-option"><input id="p008ShowLastSale" type="checkbox"> แสดง Last Sale</label>' +
            '<label class="p008-checkbox-option"><input id="p008ShowQr" type="checkbox" checked> แสดง QR code Location</label>' +
            '<label class="p008-checkbox-option"><input id="p008SplitCollector" type="checkbox"> แยกบิลตามเดือน (ทดสอบ)</label>' +
          "</div>" +
        "</aside>" +
      "</section>" +

      '<section class="p008-panel">' +
        '<div class="p008-panel-header">' +
          '<div class="p008-panel-heading">' +
            '<div class="p008-panel-icon">' + icon("table", 20) + "</div>" +
            '<div class="p008-panel-title">' +
              "<h2>รายการลูกหนี้</h2>" +
              '<p id="p008Subtitle">จำนวน 0 แถว</p>' +
            "</div>" +
          "</div>" +
          '<span class="p008-badge" id="p008Badge">0 รายการ</span>' +
        "</div>" +
        '<div class="p008-table-container">' +
          '<table id="p008PrintTable">' +
            "<thead><tr>" +
              '<th class="p008-checkbox-cell"><input id="p008SelectAll" type="checkbox" aria-label="เลือกทั้งหมด"></th>' +
              '<th class="p008-sortable" data-sort="customerCode">รหัสลูกหนี้ <span class="p008-sort-mark">↕</span></th>' +
              '<th class="p008-sortable p008-center" data-sort="group">กลุ่มลูกหนี้ <span class="p008-sort-mark">↕</span></th>' +
              '<th class="p008-sortable" data-sort="customerName">ชื่อลูกหนี้ <span class="p008-sort-mark">↕</span></th>' +
              "<th>เขต/จังหวัด</th>" +
              '<th class="p008-sortable p008-number" data-sort="amount">ยอดหนี้ <span class="p008-sort-mark">↕</span></th>' +
              '<th class="p008-sortable p008-number" data-sort="adjust">ยอดปรับหนี้ <span class="p008-sort-mark">↕</span></th>' +
              '<th class="p008-sortable p008-center" data-sort="employeeCode">รหัสพนักงาน <span class="p008-sort-mark">↕</span></th>' +
              "<th>พนักงานขาย</th>" +
            "</tr></thead>" +
            '<tbody id="p008Rows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p008-empty-state" id="p008Empty">' +
          "<div>" +
            '<div style="margin:0 auto 10px;width:52px;height:52px;color:#94a3b8">' + icon("search", 52) + "</div>" +
            "<strong>ไม่พบรายการตามเงื่อนไข</strong>" +
            '<p style="margin-top:5px;font-size:11px">ลองเปลี่ยนรหัสจังหวัด/พนักงานขาย/กลุ่มลูกหนี้ แล้วค้นหาใหม่</p>' +
          "</div>" +
        "</div>" +
        '<div class="p008-table-footer">' +
          '<span id="p008FooterText">แสดง 0 รายการ</span>' +
          '<div class="p008-footer-total">ยอดหนี้รวมทั้งหมด <strong id="p008FooterAmount">฿0.00</strong></div>' +
        "</div>" +
      "</section>" +
      '<div id="p008Toast" class="p008-toast"></div>';

    var form = root.querySelector("#p008Form");
    var selectAll = root.querySelector("#p008SelectAll");

    form.addEventListener("submit", function (e) { e.preventDefault(); doSearch(); });
    root.querySelector("#p008PrintBtn").addEventListener("click", function () { doPrint(); });
    root.querySelector("#p008ExportBtn").addEventListener("click", exportCSV);
    selectAll.addEventListener("change", function () {
      state.currentRows.forEach(function (it) {
        if (selectAll.checked) state.selectedCodes[it.customerCode] = true;
        else delete state.selectedCodes[it.customerCode];
      });
      renderRows();
    });
    root.querySelector("#p008Rows").addEventListener("change", function (e) {
      var cb = e.target.closest(".p008-row-checkbox");
      if (!cb) return;
      if (cb.checked) state.selectedCodes[cb.getAttribute("data-code")] = true;
      else delete state.selectedCodes[cb.getAttribute("data-code")];
      renderRows();
    });
    root.querySelectorAll("th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var field = th.getAttribute("data-sort");
        if (state.sortField === field) {
          state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        } else {
          state.sortField = field;
          state.sortDirection = "asc";
        }
        root.querySelectorAll(".p008-sort-mark").forEach(function (m) { m.textContent = "↕"; });
        th.querySelector(".p008-sort-mark").textContent = state.sortDirection === "asc" ? "↑" : "↓";
        renderRows();
      });
    });

    /* ── กลุ่มลูกหนี้ dropdown (api/p008_groups.php) ── */
    var groupDropdown = root.querySelector("#p008GroupDropdown");
    var groupBtn = root.querySelector("#p008GroupBtn");
    var groupInput = root.querySelector("#p008Group");
    var groupFilter = root.querySelector("#p008GroupFilter");
    var groupTable = root.querySelector("#p008GroupTable");
    var groupCount = root.querySelector("#p008GroupCount");

    function groupValueText() {
      var codes = Object.keys(state.selectedGroups).filter(function (c) { return state.selectedGroups[c]; });
      if (!codes.length) return "";
      return codes.map(function (c) { return "'" + c + "'"; }).join(",");
    }
    function syncGroupInput() {
      groupInput.value = groupValueText();
      var n = Object.keys(state.selectedGroups).filter(function (c) { return state.selectedGroups[c]; }).length;
      groupCount.textContent = n + " กลุ่ม";
    }
    function renderGroupTable(filter) {
      var f = (filter || "").trim().toLowerCase();
      var html = "";
      var shown = 0;
      state.groups.forEach(function (g) {
        if (f && g.code.toLowerCase().indexOf(f) < 0 && g.desc.toLowerCase().indexOf(f) < 0) return;
        shown++;
        var checked = !!state.selectedGroups[g.code];
        html +=
          '<label class="p008-gd-row' + (checked ? " p008-gd-checked" : "") + '">' +
            '<input class="p008-gd-cb" type="checkbox" data-code="' + esc(g.code) + '"' + (checked ? " checked" : "") + ">" +
            '<span class="p008-gd-code">' + esc(g.code) + "</span>" +
            '<span class="p008-gd-desc" title="' + esc(g.desc) + '">' + esc(g.desc) + "</span>" +
          "</label>";
      });
      groupTable.innerHTML = shown ? html : '<div class="p008-gd-empty">ไม่พบกลุ่ม</div>';
    }

    /* load groups from API on mount */
    apiFetch("p008_groups.php", { connectionId: MAC5_CONNECTION_ID }).then(function (res) {
      if (!res || !res.ok) return;
      state.groups = res.groups || [];
      renderGroupTable("");
      syncGroupInput();
    }).catch(function () { /* keep default */ });

    renderGroupTable("");
    syncGroupInput();

    groupBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      groupDropdown.classList.toggle("open");
      if (groupDropdown.classList.contains("open")) {
        groupFilter.value = "";
        renderGroupTable("");
        setTimeout(function () { groupFilter.focus(); }, 30);
      }
    });
    root.querySelector("#p008GroupClose").addEventListener("click", function () {
      groupDropdown.classList.remove("open");
    });
    root.querySelector("#p008GroupSelectAll").addEventListener("click", function () {
      var f = (groupFilter.value || "").trim().toLowerCase();
      var visible = state.groups.filter(function (g) {
        return !f || g.code.toLowerCase().indexOf(f) >= 0 || g.desc.toLowerCase().indexOf(f) >= 0;
      });
      var allSelected = visible.length > 0 && visible.every(function (g) { return !!state.selectedGroups[g.code]; });
      visible.forEach(function (g) {
        if (allSelected) delete state.selectedGroups[g.code];
        else state.selectedGroups[g.code] = true;
      });
      renderGroupTable(groupFilter.value);
      syncGroupInput();
    });
    groupFilter.addEventListener("input", function () { renderGroupTable(groupFilter.value); });
    /* รหัสจังหวัด = ตัวเลข 2 ตัวเท่านั้น */
    root.querySelector("#p008Province").addEventListener("input", function () {
      this.value = this.value.replace(/[^0-9]/g, "").substring(0, 2);
    });
    groupTable.addEventListener("change", function (e) {
      var cb = e.target.closest(".p008-gd-cb");
      if (!cb) return;
      var code = cb.getAttribute("data-code");
      if (cb.checked) state.selectedGroups[code] = true;
      else delete state.selectedGroups[code];
      renderGroupTable(groupFilter.value);
      syncGroupInput();
    });
    /* close on outside click */
    document.addEventListener("click", function (e) {
      if (!groupDropdown.contains(e.target) && e.target !== groupBtn) {
        groupDropdown.classList.remove("open");
      }
    });

    /* ไม่ค้นหาอัตโนมัติตาม mount — รอรัดปุ่มค้นหา */
    renderRows();
  }

  var toastTimer = null;
  function showToast(msg, ms) {
    var t = _root ? _root.querySelector("#p008Toast") : null;
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }

  function el(root, sel) { return root.querySelector(sel); }

  function doSearch() {
    var root = _root;
    var province = String(el(root, "#p008Province").value).trim();
    var employee = String(el(root, "#p008Employee").value).trim();
    var group = Object.keys(state.selectedGroups).filter(function (c) { return state.selectedGroups[c]; })
      .map(function (c) { return "'" + c + "'"; }).join(",");
    var asOf = String(el(root, "#p008AsOf").value).trim();
    var collector = String(el(root, "#p008Collector").value).trim();

    /* validation (clone C#) */
    if (!province) { showToast("⚠ โปรดป้อนรหัสจังหวัดที่ต้องการค้นหา", 3200); return; }
    if (!group) { showToast("⚠ โปรดเลือกกลุ่มลูกหนี้", 3200); return; }
    if (!employee && province !== "00") { showToast("⚠ โปรดป้อนรหัสพนักงาน", 3200); return; }

    el(root, "#p008Badge").textContent = "ค้นหา...";
    apiFetch("p008_search.php", {
      connectionId: MAC5_CONNECTION_ID,
      province: province,
      employee: employee,
      group: group,
      asOf: asOf,
      collector: collector
    }).then(function (res) {
      if (!res || !res.ok) throw new Error(res && res.error ? res.error : "API error");
      state.currentRows = res.rows || [];
      state.selectedCodes = {};
      state.searched = true;
      renderRows();
      showToast("✓ พบ " + state.currentRows.length + " รายการ");
    }).catch(function (err) {
      el(root, "#p008Badge").textContent = "0 รายการ";
      showToast("⚠ " + (err && err.message ? err.message : "Search fail"));
    });
  }

  function sortRows(items) {
    var f = state.sortField;
    var d = state.sortDirection;
    return items.slice().sort(function (a, b) {
      var x = a[f], y = b[f];
      if (typeof x === "string") { x = x.toLocaleLowerCase("th"); y = String(y).toLocaleLowerCase("th"); }
      if (x < y) return d === "asc" ? -1 : 1;
      if (x > y) return d === "asc" ? 1 : -1;
      return 0;
    });
  }

  function renderRows() {
    var root = _root;
    var tbody = el(root, "#p008Rows");
    var sorted = sortRows(state.currentRows);

    var html = "";
    for (var i = 0; i < sorted.length; i++) {
      var it = sorted[i];
      var checked = !!state.selectedCodes[it.customerCode];
      var name = esc(it.customerName) + (it.contact ? " " + esc(it.contact) : "");
      html +=
        '<tr class="' + (checked ? "p008-selected" : "") + '" data-code="' + esc(it.customerCode) + '">' +
          '<td class="p008-checkbox-cell"><input class="p008-row-checkbox" type="checkbox" data-code="' + esc(it.customerCode) + '"' + (checked ? " checked" : "") + "></td>" +
          '<td class="p008-customer-code">' + esc(it.customerCode) + "</td>" +
          '<td class="p008-center"><span class="p008-group-tag">' + esc(it.group) + "</span></td>" +
          '<td title="' + name + '">' + name + "</td>" +
          "<td>" + esc(it.zone) + "</td>" +
          '<td class="p008-number p008-amount">' + formatMoney(it.amount) + "</td>" +
          '<td class="p008-number p008-amount' + (it.adjust < 0 ? " p008-negative" : "") + '">' + formatMoney(it.adjust) + "</td>" +
          '<td class="p008-center p008-employee-code">' + esc(it.employeeCode) + "</td>" +
          "<td>" + esc(it.employeeName) + "</td>" +
        "</tr>";
    }
    tbody.innerHTML = html;

    /* row click = toggle checkbox */
    tbody.querySelectorAll("tr").forEach(function (tr) {
      tr.addEventListener("click", function (e) {
        if (e.target.closest(".p008-row-checkbox")) return;
        var code = tr.getAttribute("data-code");
        if (state.selectedCodes[code]) delete state.selectedCodes[code];
        else state.selectedCodes[code] = true;
        renderRows();
      });
    });

    var hasRows = sorted.length > 0;
    el(root, ".p008-table-container").style.display = hasRows ? "block" : "none";
    el(root, "#p008Empty").classList.toggle("show", !hasRows);
    el(root, "#p008Badge").textContent = sorted.length + " รายการ";
    el(root, "#p008Subtitle").textContent = "จำนวน " + sorted.length + " แถว";
    el(root, "#p008FooterText").textContent = "แสดง " + sorted.length + " รายการ";

    var total = 0;
    for (var j = 0; j < sorted.length; j++) total += Number(sorted[j].amount || 0);
    el(root, "#p008FooterAmount").textContent = "฿" + formatMoney(total);

    /* select all state */
    var sa = el(root, "#p008SelectAll");
    var allSel = sorted.length > 0 && sorted.every(function (it) { return !!state.selectedCodes[it.customerCode]; });
    sa.checked = allSel;
    sa.indeterminate = !allSel && sorted.some(function (it) { return !!state.selectedCodes[it.customerCode]; });
  }

  /* ════════════════════════════════════════════════════════════════
     Phase 2 — รายงานพิมพ์ (clone C# bgWorker_DoWork)
     Page 1: สรุป (8 คอลั่น) — Page 2+: ใบปะหน้า VAT/no-VAT × 2 ฉบับ (14 rows/หน้า)
     + Last Sale page — A4 portrait — font THSarabunNew
     ════════════════════════════════════════════════════════════════ */
  var THAI_MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  function pad2(n) { return String(n).padStart(2, "0"); }
  /* "2026-10-01 00:00:00.000" | "2026-10-01" | "10/01/2026" → "01/10/26" (clone C# dd/MM/yyy) */
  function fmtDate3(s) {
    if (!s) return "";
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + "/" + m[2] + "/" + m[1].substring(2);
    return String(s);
  }
  function fmtDateFull(s) {
    if (!s) return "";
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + "/" + m[2] + "/" + m[1];
    return String(s);
  }
  function addDays30(s) {
    if (!s) return "";
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(s);
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    d.setDate(d.getDate() + 30);
    return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + String(d.getFullYear()).substring(2);
  }
  /* "2026-10-01..." → "01/10/2569" (dd/MM/yyyy พ.ศ. — 2026-10-05 user) */
  function fmtDateBE(s) {
    if (!s) return "";
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[3] + "/" + m[2] + "/" + (Number(m[1]) + 543);
    return String(s);
  }
  /* +30 วัน → dd/MM/yyyy พ.ศ. */
  function addDays30BE(s) {
    if (!s) return "";
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(s);
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    d.setDate(d.getDate() + 30);
    return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + (d.getFullYear() + 543);
  }
  function num(v) { return Number(v || 0); }
  function fmtDateNow() {
    var d = new Date();
    return pad2(d.getDate()) + "/" + pad2(d.getMonth() + 1) + "/" + d.getFullYear() + " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds());
  }
  function fmtDateNowThai() {
    var d = new Date();
    return pad2(d.getDate()) + " " + THAI_MONTHS[d.getMonth()] + " " + (d.getFullYear() + 543);
  }

  function buildReportHTML(rep, params) {
    var h = rep.header;
    var now = new Date();
    var printDate = fmtDateNow();
    var beYear = Number(params.year) + 543;
    var monthName = THAI_MONTHS[Number(params.month) - 1] || "";
    var pages = [];

    /* ── Page 1: สรุป — Table 1 = หัวตาราง 9 คอลั่น · Table 2+ = 1 ตารางต่อ 1 ลูกหนี้ (แถวแรก colspan 9 ไม่มีเส้น) — ห่างกัน 10px
         คอลั่น (f): 60, 80, 20, 80, 65, 65, 70, 60, 50 (รวม 550) ── */
    var sumAllReq = 0, sumAllBal = 0, sumAllDis = 0, sumAllCut = 0;
    var sumCols =
      '<colgroup>' +
        '<col style="width:10.909%"><col style="width:14.545%"><col style="width:3.636%"><col style="width:14.545%">' +
        '<col style="width:11.818%"><col style="width:11.818%"><col style="width:12.727%"><col style="width:10.909%"><col style="width:9.091%">' +
      '</colgroup>';
    var sumHead =
      "<thead><tr>" +
        "<th>วันที่</th><th>เลขที่ใบสำคัญ</th><th class=\"nb\">VK</th><th class=\"nol\">ยอดหนี้</th><th>ยอดปรับหนี้</th><th>ยอดชำระ</th><th>ยอดคงค้าง</th><th>ครบกำหนด</th><th>พนักงาน</th>" +
      "</tr></thead>";
    var sumTables = "";
    sumTables += '<table class="p008r-sum">' + sumCols + sumHead + "</table>";
    for (var i = 0; i < rep.customers.length; i++) {
      var c = rep.customers[i];
      var tReq = 0, tBal = 0, tDis = 0, tCut = 0;
      var rowsHtml = "";
      for (var a = 0; a < c.inv.length; a++) {
        var r = c.inv[a];
        var req = num(r.req), dis = Math.abs(num(r.dis)), cut = num(r.cut), bal = num(r.balance);
        tReq += req; tDis += dis; tCut += cut; tBal += bal;
        if (dis > 0) tBal -= dis;
        rowsHtml +=
          "<tr>" +
            '<td class="c">' + fmtDateBE(r.dates) + "</td>" +
            '<td class="c">' + esc(r.vnos) + "</td>" +
            '<td class="c vk">' + esc(r.vk) + "</td>" +
            '<td class="r nol">' + formatMoney(req) + "</td>" +
            '<td class="r">' + formatMoney(dis) + "</td>" +
            '<td class="r">' + formatMoney(cut) + "</td>" +
            '<td class="r">' + formatMoney(dis > 0 ? -dis : bal) + "</td>" +
            '<td class="c">' + addDays30BE(r.dates) + "</td>" +
            '<td class="c">' + esc(c.perCode) + "</td>" +
          "</tr>";
      }
      sumAllReq += tReq; sumAllBal += tBal; sumAllDis += tDis; sumAllCut += tCut;
      var isLast = i === rep.customers.length - 1;
      sumTables +=
        '<table class="p008r-sum">' + sumCols + "<tbody>" +
          '<tr class="p008r-cust-head"><td colspan="9">' + esc(c.code) + "  " + esc(c.nameE) + "   " + esc(c.contactT) + "</td></tr>" +
          rowsHtml +
          '<tr class="p008r-total">' +
            '<td colspan="2" class="c">รวม</td>' +
            '<td colspan="2" class="r nol">' + formatMoney(tReq) + "</td>" +
            "<td></td><td></td>" +
            '<td class="r">' + formatMoney(tBal) + "</td>" +
            '<td colspan="2"></td>' +
          "</tr>" +
          (isLast
            ? '<tr class="p008r-grand">' +
                '<td colspan="2" class="c">รวมทั้งสิ้น</td>' +
                '<td colspan="2" class="r nol">' + formatMoney(sumAllReq) + "</td>" +
                '<td class="r">' + formatMoney(sumAllDis) + "</td>" +
                '<td class="r">' + formatMoney(sumAllCut) + "</td>" +
                '<td class="r">' + formatMoney(sumAllBal) + "</td>" +
                '<td colspan="2"></td>' +
              "</tr>"
            : "") +
        "</tbody></table>";
    }
    pages.push(
      '<div class="p008r-page">' +
        '<div class="p008r-sum-title">' + esc(h.provinceName) + " - " + esc(h.perCode) + " " + esc(h.perName) + "</div>" +
        '<div class="p008r-sum-line">     จนถึงวันที่  :  ' + fmtDateFull(params.asOf) + "</div>" +
        '<div class="p008r-sum-line">     รอบที่/ประจำเดือน  :  ' + esc(params.round) + " / " + esc(monthName) + " " + beYear + "</div>" +
        '<div class="p008r-sum-line">     วันที่พิมพ์  :  ' + printDate + "</div>" +
        sumTables +
      "</div>"
    );

    /* ── Page 2+: ใบปะหน้า — ต่อลูกค้า × VAT(V=0)/no-VAT(V=1) × ส่งกลับบริษัท(t=0)/สำหรับลูกค้า(t=1) — 14 rows/หน้า
         ถ้า splitMonth (chk_BillBymonth) = rows มาพร้อม MY → 1 จุ้ม MY = 1 รอบ cover (clone C# countMonth loop) ── */
    for (var ci = 0; ci < rep.customers.length; ci++) {
      var cust = rep.customers[ci];
      var types = [[0, cust.vat], [1, cust.novat]];
      for (var V = 0; V < 2; V++) {
        var allRows = types[V][1];
        if (!allRows.length) continue;
        /* group by MY (ถ้ามี) — ลำดับคงตาม API */
        var groupKeys = [];
        var groupMap = {};
        for (var ri = 0; ri < allRows.length; ri++) {
          var my = allRows[ri].MY || "";
          if (!groupMap.hasOwnProperty(my)) { groupMap[my] = []; groupKeys.push(my); }
          groupMap[my].push(allRows[ri]);
        }
        for (var gi = 0; gi < groupKeys.length; gi++) {
          var rows = groupMap[groupKeys[gi]];
          for (var t = 0; t < 2; t++) {
            var totalPages = Math.max(1, Math.ceil(rows.length / 12));
            for (var n = 0; n < totalPages; n++) {
              pages.push(buildCoverPage(cust, rows, V, t, n, totalPages, params, monthName, beYear, printDate, h));
            }
          }
        }
      }
      /* ── Last Sale page ── */
      if (params.showLastSale && cust.lastSale.length) {
        var lsHtml = "";
        for (var li = 0; li < cust.lastSale.length; li++) {
          var ls = cust.lastSale[li];
          lsHtml += "<tr><td>" + esc(ls.STKgroup) + "</td><td>" + esc(ls.stgdescT) + "</td><td class=\"c\">" + fmtDateFull(ls.lastdate) + "</td></tr>";
        }
        pages.push(
          '<div class="p008r-page">' +
            '<table class="p008r-last">' +
              '<tr class="p008r-last-title"><td colspan="3">รายงาน (ROP) Last Sale</td></tr>' +
              "<tr><th>รหัสกลุ่มสินค้า</th><th>ชื่อกลุ่มสินค้า</th><th>Last Date</th></tr>" +
              lsHtml +
            "</table>" +
          "</div>"
        );
      }
    }
    return pages.join("");
  }

  function buildCoverPage(cust, rows, V, t, n, totalPages, params, monthName, beYear, printDate, h) {
    /* header: logo/MCIT + barcode *code* / บริษัท + ส่งกลับบริษัท/สำหรับลูกค้า */
    var headLeft, headMid;
    if (V === 0) {
      headLeft = '<div class="p008r-logo"><img src="assets/images/p008/LOGO_MCIT.png" alt="MCIT"></div>';
    } else {
      headLeft = '<div class="p008r-mcit">MCIT</div>';
    }
    if (t === 0) {
      headMid = '<div class="p008r-barcode" data-code="' + esc(cust.code) + '"></div>';
    } else if (V === 0) {
      headMid = '<div class="p008r-company">บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด เลขผู้เสียภาษี 0745561001837<br>58/9 หมู่ 6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร 74110</div>';
    } else {
      headMid = '<div class="p008r-company">เอ็มซีไอที<br>58/9 หมู่ 6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร 74110</div>';
    }
    var headRight = t === 0 ? '<div class="p008r-copy p008r-copy0">ส่งกลับบริษัท</div>' : '<div class="p008r-copy p008r-copy1">สำหรับลูกค้า</div>';

    /* addr box: DEB (rowspan 2) + QR + PER */
    var addr = cust.code + " (" + cust.grade + ")<br>" + esc(cust.nameE) + "  " + esc(cust.contactT) + "<br>" +
      esc(cust.addr1) + "<br>" + esc(cust.addr2) + "<br>" + esc(cust.addr3) + "  " + esc(cust.addr3E) + "<br>" +
      "โทร. " + esc(cust.tel) + " แฟ็กซ์. " + esc(cust.fax);
    var perBox = "พนักงาน : " + esc(h.perCode) + " " + esc(h.perName) + "<br>โทรศัพท์ : " + esc(h.perTel) + "<br>" + fmtDateNowThai() + "<br><br>เดือน : " + esc(monthName) + "     ปี : " + beYear;
    var qrBox = (t === 1 && cust.qr) ? '<div class="p008r-qr" data-qr="' + esc(cust.qr) + '"><span>Map</span></div>' : "";

    /* body 12 rows/หน้า (2026-10-05 user) */
    var start = n * 12;
    var end = Math.min(start + 12, rows.length);
    var tBal = 0;
    var bodyRows = "";
    for (var y = start; y < end; y++) {
      var r = rows[y];
      var req = num(r.req), dis = Math.abs(num(r.dis)), cut = num(r.cut), bal = num(r.balance);
      tBal += bal;
      if (dis > 0) tBal -= dis;
      var desc = t === 0 ? esc(r.VK) : "";
      bodyRows +=
        "<tr>" +
          '<td class="c">' + fmtDateBE(r.dates) + "</td>" +
          '<td class="c">' + esc(r.vnos) + "</td>" +
          '<td>' + desc + "</td>" +
          '<td class="r">' + formatMoney(req) + "</td>" +
          '<td class="r">' + formatMoney(dis) + "</td>" +
          '<td class="r">' + formatMoney(cut) + "</td>" +
          '<td class="r">' + formatMoney(dis > 0 ? -dis : bal) + "</td>" +
        "</tr>";
    }
    var isLastPage = n === totalPages - 1;
    var totalRow = isLastPage
      ? '<tr class="p008r-cov-total"><td colspan="2"></td><td class="c">รวม</td><td colspan="2"></td><td colspan="2" class="r">' + formatMoney(tBal) + "</td></tr>"
      : "";
    /* หลังรวมยอด — loop แถวว่างให้ครบ 15 แถว (2026-10-05 user) */
    var fillRows = "";
    var fillCount = 15 - (end - start) - (isLastPage ? 1 : 0);
    for (var f2 = 0; f2 < fillCount; f2++) {
      fillRows += "<tr>" + '<td class="c"></td><td class="c"></td><td></td><td class="r"></td><td class="r"></td><td class="r"></td><td class="r"></td>' + "</tr>";
    }

    var html =
      '<div class="p008r-page">' +
        '<table class="p008r-cov-head">' +
          "<tr><td class=\"p008r-h-left\">" + headLeft + "</td>" +
          "<td class=\"p008r-h-mid\">" + headMid + "</td>" +
          "<td class=\"p008r-h-right\">" + headRight + "</td></tr>" +
        "</table>" +
        '<table class="p008r-addr">' +
          "<tr>" +
            '<td class="p008r-addr-deb">' + addr + "</td>" +
            "<td class=\"p008r-addr-qr\">" + qrBox + "</td>" +
            '<td class="p008r-addr-per">' + perBox + "</td>" +
          "</tr>" +
        "</table>" +
        '<table class="p008r-cov">' +
          '<colgroup><col style="width:12.364%"><col style="width:14.909%"><col style="width:29.091%"><col style="width:10.909%"><col style="width:10.909%"><col style="width:10.909%"><col style="width:10.909%"></colgroup>' +
          "<thead><tr><th>วันที่</th><th>เลขที่บิล</th><th>รายละเอียด</th><th>ยอดหนี้</th><th>ยอดปรับหนี้</th><th>ยอดชำระ</th><th>ยอดคงค้าง</th></tr></thead>" +
          "<tbody>" + bodyRows + totalRow + fillRows + "</tbody>" +
        "</table>";

    if (t === 0) {
      /* ตัวข้อ (clone C#) */
      html +=
        '<div class="p008r-cheque">' +
          "<div>เช็คธนาคาร : 1.....................................เลขที่ :......................................วันที่ :.................................จำนวนเงิน.....................................</div>" +
          "<div>เช็คธนาคาร : 2.....................................เลขที่ :......................................วันที่ :.................................จำนวนเงิน.....................................</div>" +
          "<div>เช็คธนาคาร : 3.....................................เลขที่ :......................................วันที่ :.................................จำนวนเงิน.....................................</div>" +
          "<div>เช็คธนาคาร : 4.....................................เลขที่ :......................................วันที่ :.................................จำนวนเงิน.....................................</div>" +
          "<div>เงินสด ......................................................ส่วนลด............................................... [ ] ผิดราคา ..........................................................</div>" +
          "<div>วันที่ส่งมอบ....................................................เวลา.................................................. น. ผู้ส่งมอบ........................................................</div>" +
          "<div>[ ] รับคืนสินค้า......................................................................... [ ] วางบิล.......................................................................................</div>" +
          "<div>[ ] ค้างบิล.......................................................................สาเหตุการค้างบิล.........................................................................................</div>" +
        "</div>" +
        '<div class="p008r-note">กรุณาเรียกใบรับเงินทุกครั้งที่ท่านชำระเงินกับผู้แทนขาย เพื่อเป็นหลักฐานในการชำระเงิน</div>' +
        '<table class="p008r-foot">' +
          '<colgroup><col style="width:36.364%"><col style="width:63.636%"></colgroup>' +
          "<tr>" +
            "<td>[BLV] ใบรายงานเก็บบัญชี</td>" +
            "<td>เอกสารสร้างโดย : system  วันที่ " + printDate + "</td>" +
          "</tr>" +
          "<tr>" +
            "<td>SALE-SYS-EX-15-6201</td>" +
            "<td>พิมพ์โดย : system  วันที่ " + printDate + "</td>" +
          "</tr>" +
        "</table>";
    } else {
      /* ใบเสร็จรับเงิน (clone C#) */
      html +=
        '<table class="p008r-receipt">' +
          '<tr class="p008r-rc-title"><td colspan="3">ใบเสร็จรับเงิน</td><td rowspan="6" class="p008r-rc-img"><img src="assets/images/p008/paymentMCIT_vertical3.jpg" alt="payment"></td></tr>' +
          '<tr class="p008r-rc-hd"><td colspan="2">รายการ</td><td>จำนวนเงิน</td></tr>' +
          '<tr><td colspan="2" class="p008r-rc-lines">.......................................................................<br>.......................................................................<br>.......................................................................<br>.......................................................................<br>.......................................................................<br>.......................................................................</td>' +
          '<td class="p008r-rc-lines">........................<br>........................<br>........................<br>........................<br>........................<br>........................</td></tr>' +
          '<tr><td class="p008r-rc-sign">-----------------------------<br>ผู้รับชำระเงิน</td>' +
          '<td colspan="2" class="p008r-rc-remark"><b>หมายเหตุ </b>..........................................................<br>.....................................................................</td></tr>' +
          '<tr><td></td><td colspan="2" class="c">_____/_____/_____</td></tr>' +
          '<tr><td colspan="3" class="p008r-rc-note">*กรุณาเรียกรับใบเสร็จทุกครั้งเมื่อมีการชำระเงินกับพนักงานขาย</td></tr>' +
        "</table>";
    }
    return html + "</div>";
  }

  function doPrint() {
    var root = _root;
    var codes = Object.keys(state.selectedCodes).filter(function (c) { return state.selectedCodes[c]; });
    if (!codes.length) { showToast("⚠ โปรดเลือกลูกหนี้ (checkbox) ก่อนพิมพ์รายงาน", 3200); return; }
    var params = {
      province: String(el(root, "#p008Province").value).trim(),
      employee: String(el(root, "#p008Employee").value).trim(),
      asOf: String(el(root, "#p008AsOf").value).trim(),
      round: String(el(root, "#p008Round").value).trim(),
      month: String(el(root, "#p008Month").value).trim(),
      year: String(el(root, "#p008Year").value).trim(),
      showQr: !!el(root, "#p008ShowQr").checked,
      showLastSale: !!el(root, "#p008ShowLastSale").checked,
      splitMonth: !!el(root, "#p008SplitCollector").checked
    };
    var btn = el(root, "#p008PrintBtn");
    btn.disabled = true;
    btn.textContent = "สร้างรายงาน...";
    apiFetch("p008_report.php", {
      connectionId: MAC5_CONNECTION_ID,
      codes: codes,
      asOf: params.asOf,
      province: params.province,
      employee: params.employee,
      showQr: params.showQr,
      showLastSale: params.showLastSale,
      splitMonth: params.splitMonth
    }).then(function (res) {
      if (!res || !res.ok) throw new Error(res && res.error ? res.error : "API error");
      if (!res.customers.length) throw new Error("ไม่มีข้อมูลลูกหนี้");
      state.report = res;
      state.reportParams = params;
      renderReport();
    }).catch(function (err) {
      showToast("⚠ " + (err && err.message ? err.message : "Report fail"), 4000);
    }).finally(function () {
      btn.disabled = false;
      btn.innerHTML = icon("print", 17) + " Print";
    });
  }

  function renderReport(noPrint) {
    var wrap = document.getElementById("p008Report");
    if (!wrap) return;
    wrap.innerHTML = buildReportHTML(state.report, state.reportParams);
    /* barcodes (JsBarcode CODE128 — clone C# *code*) */
    wrap.querySelectorAll(".p008r-barcode").forEach(function (el) {
      try {
        if (window.JsBarcode) {
          var canvas = document.createElement("canvas");
          el.appendChild(canvas);
          window.JsBarcode(canvas, el.getAttribute("data-code"), { format: "CODE128", width: 2, height: 40, displayValue: false, fontSize: 14, margin: 0 });
        } else {
          el.textContent = "*" + el.getAttribute("data-code") + "*";
        }
      } catch (e) { el.textContent = "*" + el.getAttribute("data-code") + "*"; }
    });
    /* QR codes (qrcode.min.js) */
    wrap.querySelectorAll(".p008r-qr").forEach(function (el) {
      try {
        if (window.QRCode) new window.QRCode(el, { text: el.getAttribute("data-qr"), width: 50, height: 50, correctLevel: window.QRCode.CorrectLevel.M });
      } catch (e) { /* no QR */ }
    });
    /* wait frame + images (logo/payment) — แล้วเปิด modal ตัวอย่างก่อนพิมพ์ */
    if (!noPrint) {
      var imgs = Array.prototype.slice.call(wrap.querySelectorAll("img"));
      var waitImgs = new Promise(function (resolve) {
        if (!imgs.length) return resolve();
        var left = imgs.length;
        var done = function () { if (--left <= 0) resolve(); };
        imgs.forEach(function (im) {
          if (im.complete) done();
          else { im.addEventListener("load", done); im.addEventListener("error", done); }
        });
        setTimeout(resolve, 5000);
      });
      waitImgs.then(function () {
        requestAnimationFrame(function () {
          setTimeout(function () { openPrintModal(); }, 60);
        });
      });
    }
  }

  function openPrintModal() {
    var m = document.getElementById("p008PrintModal");
    if (!m) { window.print(); return; }
    _zoom = 1;
    applyZoom();
    m.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function closePrintModal() {
    var m = document.getElementById("p008PrintModal");
    if (m) m.style.display = "none";
    document.body.style.overflow = "";
    var rpt = document.getElementById("p008Report");
    if (rpt) rpt.style.zoom = "";
    var pct = document.getElementById("p008ZoomPct");
    if (pct) pct.textContent = "100%";
  }

  function exportCSV() {
    if (!state.currentRows.length) { alert("ไม่พบข้อมูลสำหรับส่งออก"); return; }
    var headers = ["รหัสลูกหนี้", "กลุ่มลูกหนี้", "ชื่อลูกหนี้", "เขต/จังหวัด", "ยอดหนี้", "ยอดปรับหนี้", "รหัสพนักงาน", "พนักงานขาย"];
    var lines = [headers];
    state.currentRows.forEach(function (it) {
      var name = it.customerName + (it.contact ? " " + it.contact : "");
      lines.push([it.customerCode, it.group, name, it.zone, Number(it.amount).toFixed(2), Number(it.adjust).toFixed(2), it.employeeCode, it.employeeName]);
    });
    var csv = lines.map(function (row) {
      return row.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ใบปะหน้าเก็บบัญชี.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ---------- CSS (clone demo) ---------- */
  function injectCSS() {
    if (document.getElementById("p008Styles")) return;
    var st = document.createElement("style");
    st.id = "p008Styles";
    st.textContent =
      ".p008-launcher{display:grid;grid-template-columns:minmax(340px,1.3fr) auto;gap:13px;align-items:start}" +
      ".p008-filter-card{padding:16px;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}" +
      ".p008-filter-card h2{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-size:14px;color:#172033}" +
      ".p008-filter-card h2 svg{width:19px;height:19px;color:#2563eb;flex:0 0 auto}" +
      ".p008-filter-row{display:grid;gap:11px;margin-bottom:11px}" +
      ".p008-filter-row:last-child{margin-bottom:0}" +
      ".p008-row-4{grid-template-columns:repeat(4,1fr)}" +
      ".p008-row-5{grid-template-columns:repeat(4,1fr) auto}" +
      ".p008-field{min-width:0}" +
      ".p008-field label{display:block;margin-bottom:6px;color:#64748b;font-size:11px;font-weight:700}" +
      ".p008-input-wrap{position:relative}" +
      ".p008-input-wrap>svg{position:absolute;top:50%;left:12px;width:17px;height:17px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}" +
      ".p008-input-wrap input,.p008-input-wrap select{width:100%;height:42px;padding:0 12px 0 39px;color:#172033;border:1px solid #dbe3ef;border-radius:10px;outline:none;background:#fff;font-size:13px}" +
      ".p008-input-wrap select{cursor:pointer;appearance:none;padding-right:32px}" +
      ".p008-input-wrap input:focus,.p008-input-wrap select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}" +
      ".p008-input-wrap>svg:last-child{left:auto;right:12px;width:15px;height:15px}" +
      ".p008-group-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:end;position:relative}" +
      ".p008-group-dropdown{display:none;position:absolute;top:100%;left:0;z-index:60;width:360px;max-width:80vw;margin-top:6px;border:1px solid #dbe3ef;border-radius:12px;background:#fff;box-shadow:0 18px 44px rgba(15,23,42,.18);overflow:hidden}" +
      ".p008-group-dropdown.open{display:block}" +
      ".p008-gd-search{position:relative;padding:10px 10px 8px;border-bottom:1px solid #eef2f7}" +
      ".p008-gd-search>svg{position:absolute;top:50%;left:20px;width:14px;height:14px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}" +
      ".p008-gd-search input{width:100%;height:36px;padding:0 12px 0 34px;border:1px solid #dbe3ef;border-radius:9px;outline:none;font-size:12px;color:#172033;background:#f8fafc}" +
      ".p008-gd-search input:focus{border-color:#60a5fa;background:#fff}" +
      ".p008-gd-table{max-height:280px;overflow:auto}" +
      ".p008-gd-row{display:grid;grid-template-columns:26px 92px minmax(0,1fr);align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid #f1f5f9;cursor:pointer;font-size:12px;transition:.12s ease}" +
      ".p008-gd-row:hover{background:#f0f7ff}" +
      ".p008-gd-row.p008-gd-checked{background:#eaf3ff}" +
      ".p008-gd-cb{width:16px;height:16px;accent-color:#2563eb;cursor:pointer;justify-self:center}" +
      ".p008-gd-code{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700;white-space:nowrap}" +
      ".p008-gd-desc{color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
      ".p008-gd-empty{padding:22px 12px;text-align:center;color:#94a3b8;font-size:12px}" +
      ".p008-gd-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;border-top:1px solid #eef2f7;background:#f8fafc}" +
      ".p008-gd-footer span{color:#64748b;font-size:11px;font-weight:700}" +
      ".p008-gd-btns{display:flex;gap:6px}" +
      ".p008-gd-selectall,.p008-gd-close{height:30px;padding:0 12px;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;cursor:pointer}" +
      ".p008-gd-selectall:hover,.p008-gd-close:hover{color:#fff;border-color:#2563eb;background:#2563eb}" +
      ".p008-gd-close{background:#fff}" +
      ".p008-inline-btn{display:grid;width:42px;height:42px;place-items:center;color:#2563eb;border:0;border-radius:10px;background:#eff6ff;cursor:pointer}" +
      ".p008-inline-btn svg{width:15px;height:15px}" +
      ".p008-form-actions{margin-top:14px}" +
      ".p008-search-btn{display:inline-flex;height:42px;align-items:center;justify-content:center;gap:7px;padding:0 18px;color:#fff;border:0;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-size:13px;font-weight:700;white-space:nowrap;transition:.16s ease;cursor:pointer}" +
      ".p008-search-btn:hover{transform:translateY(-1px);filter:brightness(1.06)}" +
      ".p008-action-card{display:flex;flex-direction:column;gap:10px;padding:16px;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}" +
      ".p008-action-btn{display:inline-flex;height:44px;align-items:center;justify-content:center;gap:8px;padding:0 20px;border:1px solid #dbe3ef;border-radius:11px;background:#f8fafc;font-size:13px;font-weight:700;white-space:nowrap;transition:.16s ease;cursor:pointer}" +
      ".p008-action-btn.excel{color:#047857;border-color:#a7f3d0;background:#ecfdf5}" +
      ".p008-action-btn.excel:hover{color:#fff;border-color:#059669;background:#059669}" +
      ".p008-action-btn.print{color:#1d4ed8;border-color:#bfdbfe;background:#eff6ff}" +
      ".p008-action-btn.print:hover{color:#fff;border-color:#2563eb;background:#2563eb}" +
      ".p008-option-list{display:flex;flex-direction:column;gap:9px;margin-top:6px;padding-top:12px;border-top:1px solid #dbe3ef}" +
      ".p008-checkbox-option{display:flex;align-items:center;gap:9px;font-size:12px;font-weight:600;cursor:pointer;color:#172033}" +
      ".p008-checkbox-option input{width:17px;height:17px;accent-color:#2563eb;cursor:pointer}" +
      ".p008-panel{display:flex;min-height:480px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #dbe3ef;border-radius:16px;background:#fff;box-shadow:0 12px 30px rgba(15,23,42,.08)}" +
      ".p008-panel-header{display:flex;min-height:60px;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-bottom:1px solid #dbe3ef}" +
      ".p008-panel-heading{display:flex;min-width:0;align-items:center;gap:10px}" +
      ".p008-panel-icon{display:grid;width:36px;height:36px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:10px;background:#eff6ff}" +
      ".p008-panel-title{min-width:0}" +
      ".p008-panel-title h2{overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap;color:#172033}" +
      ".p008-panel-title p{overflow:hidden;margin-top:1px;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}" +
      ".p008-badge{padding:5px 10px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}" +
      ".p008-table-container{min-height:0;flex:1;overflow:auto}" +
      ".p008-table-container table{width:100%;min-width:1150px;border-collapse:separate;border-spacing:0;white-space:nowrap}" +
      ".p008-table-container th{position:sticky;top:0;z-index:2;padding:11px 12px;color:#475569;border-bottom:1px solid #dbe3ef;background:#f8fafc;font-size:12px;font-weight:700;text-align:left;user-select:none}" +
      ".p008-table-container th.p008-sortable{cursor:pointer}" +
      ".p008-table-container th.p008-sortable:hover{color:#2563eb;background:#f1f5f9}" +
      ".p008-sort-mark{margin-left:3px;color:#94a3b8;font-size:10px}" +
      ".p008-table-container td{max-width:230px;overflow:hidden;padding:9px 12px;border-bottom:1px solid #edf1f6;font-size:12px;line-height:1.4;text-overflow:ellipsis;color:#172033}" +
      ".p008-center{text-align:center}" +
      ".p008-number{text-align:right}" +
      ".p008-table-container tbody tr{cursor:pointer;transition:.14s ease}" +
      ".p008-table-container tbody tr:nth-child(even){background:#fbfdff}" +
      ".p008-table-container tbody tr:hover{background:#f0f7ff}" +
      ".p008-table-container tbody tr.p008-selected{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}" +
      ".p008-checkbox-cell{width:36px;text-align:center}" +
      ".p008-row-checkbox,.p008-select-all{width:16px;height:16px;accent-color:#2563eb;cursor:pointer}" +
      ".p008-customer-code{color:#1d4ed8;font-family:Arial,sans-serif;font-weight:700}" +
      ".p008-group-tag{display:inline-flex;padding:3px 8px;color:#1d4ed8;border-radius:7px;background:#dbeafe;font-size:11px;font-weight:700}" +
      ".p008-amount{color:#0f172a;font-family:Arial,sans-serif;font-variant-numeric:tabular-nums;font-weight:700}" +
      ".p008-amount.p008-negative{color:#dc2626}" +
      ".p008-employee-code{color:#334155;font-family:Arial,sans-serif;font-weight:700}" +
      ".p008-table-footer{display:flex;min-height:50px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;color:#64748b;border-top:1px solid #dbe3ef;background:#f8fafc;font-size:12px}" +
      ".p008-footer-total{display:flex;align-items:center;gap:8px;padding:6px 11px;color:#172033;border:1px solid #dbe3ef;border-radius:9px;background:#fff}" +
      ".p008-footer-total strong{color:#1d4ed8}" +
      ".p008-empty-state{display:none;min-height:280px;align-items:center;justify-content:center;color:#64748b;text-align:center}" +
      ".p008-empty-state.show{display:flex}" +
      ".p008-toast{position:fixed;right:20px;bottom:20px;z-index:210;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:12px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:.2s}" +
      ".p008-toast.show{opacity:1;visibility:visible;transform:translateY(0)}" +
      /* ── Phase 2 report styles ── */
      "#p008Report{display:block}" +
      /* ── Print preview modal ── */
      "#p008PrintModal{position:fixed;inset:0;z-index:300;display:none;align-items:flex-start;justify-content:center}" +
      ".p008p-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.62)}" +
      ".p008p-dialog{position:relative;z-index:1;width:min(1100px,96vw);height:94vh;margin:2vh 0;display:flex;flex-direction:column;background:#e5e7eb;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.45);overflow:hidden}" +
      ".p008p-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:#0f172a;color:#fff;font-size:13px}" +
      ".p008p-actions{display:flex;gap:8px;align-items:center}" +
      ".p008p-zoom{display:flex;align-items:center;gap:2px;background:#1e293b;border-radius:9px;padding:2px 6px}" +
      ".p008p-zoom-btn{width:28px;height:28px;border:none;border-radius:7px;background:#334155;color:#fff;font-size:15px;font-weight:700;cursor:pointer;display:grid;place-items:center;line-height:1}" +
      ".p008p-zoom-btn:hover{background:#475569}" +
      "#p008ZoomPct{min-width:44px;text-align:center;font-size:12px;font-weight:700;color:#e2e8f0}" +
      ".p008p-btn{height:36px;padding:0 18px;border-radius:9px;border:1px solid transparent;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}" +
      ".p008p-btn.go{background:#2563eb;color:#fff}" +
      ".p008p-btn.go:hover{background:#1d4ed8}" +
      ".p008p-btn.close{background:#334155;color:#e2e8f0}" +
      ".p008p-btn.close:hover{background:#475569}" +
      ".p008p-body{flex:1;overflow:auto;padding:18px;background:#e5e7eb}" +
      ".p008p-body .p008r-page{box-shadow:0 4px 18px rgba(15,23,42,.25);background:#fff;margin-bottom:20px}" +
      ".p008p-body .p008r-page:last-child{margin-bottom:0}" +
      ".p008r-page{width:186mm;min-height:277mm;box-sizing:border-box;margin:0 auto;padding:8mm 12mm;font-family:'THSarabunNew','Sarabun',Tahoma,sans-serif;color:#000;page-break-after:always}" +
      ".p008r-page:last-child{page-break-after:auto}" +
      ".p008r-sum-title{text-align:center;font-size:18pt;font-weight:700;margin-bottom:4px}" +
      ".p008r-sum-line{font-size:16pt;margin:2px 0}" +
      ".p008r-sum{width:100%;border-collapse:collapse;margin-bottom:10px;table-layout:fixed}" +
      ".p008r-sum th{border:1px solid #333;font-size:14pt;font-weight:700;padding:4px 3px;text-align:center;background:#f2f2f2}" +
      ".p008r-sum td{border:1px solid #333;font-size:12pt;padding:3px 4px}" +
      ".p008r-sum td.c,.p008r-sum th.c{text-align:center}" +
      ".p008r-sum td.r{text-align:right;font-family:'THSarabunNew','Sarabun',Tahoma,sans-serif;font-variant-numeric:tabular-nums}" +
      ".p008r-sum td.vk{border-left:1px solid #333;border-right:none}" +
      ".p008r-sum td.nol,.p008r-sum th.nol{border-left:none}" +
      ".p008r-sum td.nb,.p008r-sum th.nb{border-right:none}" +
      ".p008r-cust-head td{font-size:14pt;font-weight:700;border:none;background:none;padding:0 4px}" +
      ".p008r-total td{font-size:14pt;font-weight:700;background:#f5f5f5}" +
      ".p008r-grand td{font-size:14pt;font-weight:700;background:#eee}" +
      ".p008r-cov-head{width:100%;border-collapse:collapse;table-layout:fixed}" +
      ".p008r-cov-head td{vertical-align:middle;padding:2px 0;border:1px solid #333}" +
      ".p008r-h-left{width:12.727%;text-align:center}" +
      ".p008r-h-mid{width:auto;text-align:center}" +
      ".p008r-h-right{width:18.182%;text-align:center}" +
      ".p008r-logo img{width:70px;height:40px;object-fit:contain}" +
      ".p008r-mcit{font-size:20pt;font-weight:700}" +
      ".p008r-barcode svg,.p008r-barcode canvas{max-width:220px;height:52px}" +
      ".p008r-company{font-size:15pt;line-height:1.5;text-align:left}" +
      ".p008r-copy{font-size:16pt;font-weight:700;padding-top:8px}" +
      ".p008r-addr{width:100%;border-collapse:collapse;table-layout:fixed;margin-top:6px;margin-bottom:10px}" +
      ".p008r-addr-deb{width:52.727%;border:1px solid #333;border-right:none;font-size:14pt;line-height:1.1;vertical-align:top;padding:5px 7px}" +
      ".p008r-addr-qr{width:10.909%;border-top:1px solid #333;border-bottom:1px solid #333;text-align:center;vertical-align:top;padding-top:3px;font-size:11px}" +
      ".p008r-addr-qr .p008r-qr{display:inline-block}" +
      ".p008r-addr-qr canvas,.p008r-addr-qr img{width:50px;height:50px}" +
      ".p008r-addr-per{width:auto;border:1px solid #333;font-size:14pt;line-height:1.1;vertical-align:top;padding:5px 7px}" +
      ".p008r-cov{width:100%;border-collapse:collapse;margin-top:4px;table-layout:fixed}" +
      ".p008r-cov th{border:1px solid #333;font-size:13pt;font-weight:700;padding:4px 3px;text-align:center;background:#f2f2f2}" +
      ".p008r-cov td{border:1px solid #333;font-size:13pt;padding:2px 4px;line-height:1}" +
      ".p008r-cov tbody td{border-left:none;border-right:none;border-top:none;border-bottom:none}" +
      ".p008r-cov tbody td:first-child{border-left:1px solid #333}" +
      ".p008r-cov tbody td:last-child{border-right:1px solid #333}" +
      ".p008r-cov tbody tr:last-child td{border-bottom:1px solid #333}" +
      ".p008r-cov tbody tr{height:23px}" +
      ".p008r-cov td.c{text-align:center}" +
      ".p008r-cov td.r{text-align:right;font-family:'THSarabunNew','Sarabun',Tahoma,sans-serif;font-variant-numeric:tabular-nums}" +
      ".p008r-cov-total td{font-size:13pt;font-weight:700;padding:2px 4px;line-height:1}" +
      ".p008r-cheque{margin-top:10px;font-size:14pt;line-height:1.9}" +
      ".p008r-note{text-align:center;font-size:14pt;font-weight:700;margin-top:10px}" +
      ".p008r-foot{width:100%;border-collapse:collapse;margin-top:10px;table-layout:fixed}" +
      ".p008r-foot td{font-size:13pt;padding:3px 4px}" +
      ".p008r-receipt{width:100%;border-collapse:collapse;margin-top:10px;table-layout:fixed}" +
      ".p008r-rc-title td{font-size:14px;font-weight:700;text-align:center;padding:4px 0}" +
      ".p008r-rc-img{width:188px;text-align:center;vertical-align:middle}" +
      ".p008r-rc-img img{width:170px;height:auto}" +
      ".p008r-rc-hd td{font-size:12px;text-align:center;background:#f5f5f5;padding:4px 0}" +
      ".p008r-rc-lines{font-size:16px;line-height:1.55}" +
      ".p008r-rc-sign{font-size:12px;text-align:center;vertical-align:bottom;border-top:1px solid #333;border-left:1px solid #333;border-right:1px solid #333;height:44px;padding:3px}" +
      ".p008r-rc-remark{font-size:12px;border-top:1px solid #333;border-left:1px solid #333;border-right:1px solid #333;height:44px;padding:3px 5px}" +
      ".p008r-rc-note{font-size:11px;text-align:center;border-bottom:1px solid #333;border-left:1px solid #333;border-right:1px solid #333;padding:3px}" +
      ".p008r-rc-lines + td,.p008r-receipt tr:nth-child(3) td:last-child{border-left:none}" +
      ".p008r-last{width:100%;border-collapse:collapse;table-layout:fixed}" +
      ".p008r-last-title td{font-size:16px;font-weight:700;text-align:center;padding:8px 0}" +
      ".p008r-last th{border:1px solid #333;font-size:14px;font-weight:700;padding:5px;text-align:center;background:#f2f2f2}" +
      ".p008r-last td{border:1px solid #333;font-size:13px;padding:4px 6px}" +
      ".p008r-last td.c{text-align:center}" +
      "@media print{" +
        "@page{size:A4 portrait;margin:0}" +
        "body *{visibility:hidden !important}" +
        ".p008p-backdrop,.p008p-head{display:none !important}" +
        "#p008PrintModal,.p008p-dialog,.p008p-body{display:block !important;position:static !important;overflow:visible !important;height:auto !important;max-height:none !important;padding:0 !important;margin:0 !important;border:none !important;border-radius:0 !important;background:none !important;box-shadow:none !important}" +
        "#p008Report,#p008Report *{visibility:visible !important}" +
        "#p008Report{display:block !important;position:absolute;top:0;left:0;width:210mm;zoom:1 !important}" +
        ".p008p-body .p008r-page{box-shadow:none !important;margin:0 auto !important}" +
        ".p008-checkbox-cell{display:none}" +
      "}" +
      "@media (max-width:1100px){.p008-launcher{grid-template-columns:1fr}}";
    document.head.appendChild(st);
  }

  var _root = null;
  var _mount = mount;
  function mountWithRoot(root) {
    _root = root;
    _mount(root);
  }

  /* ── Zoom ย่อ/ขยาย (CSS zoom — 50%~150% ขั้น 10%) ── */
  var _zoom = 1;
  function applyZoom() {
    var rpt = document.getElementById("p008Report");
    if (rpt) rpt.style.zoom = String(_zoom);
    var pct = document.getElementById("p008ZoomPct");
    if (pct) pct.textContent = Math.round(_zoom * 100) + "%";
  }
  function zoomIn() { _zoom = Math.min(1.5, _zoom + 0.1); applyZoom(); }
  function zoomOut() { _zoom = Math.max(0.5, _zoom - 0.1); applyZoom(); }

  /* ── Print preview modal (static ใน index.php — bind 1 ครั้ง) ── */
  (function () {
    var m = document.getElementById("p008PrintModal");
    if (!m) return;
    var go = m.querySelector("#p008PrintGoBtn");
    var close = m.querySelector("#p008PrintCloseBtn");
    if (go) go.addEventListener("click", function () { window.print(); });
    if (close) close.addEventListener("click", function () { closePrintModal(); });
    m.querySelector(".p008p-backdrop").addEventListener("click", function () { closePrintModal(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && m.style.display === "flex") closePrintModal();
    });
    var zin = m.querySelector("#p008ZoomIn");
    var zout = m.querySelector("#p008ZoomOut");
    if (zin) zin.addEventListener("click", zoomIn);
    if (zout) zout.addEventListener("click", zoomOut);
  })();

  window.P008CollectionV2 = { mount: mountWithRoot };
})();
