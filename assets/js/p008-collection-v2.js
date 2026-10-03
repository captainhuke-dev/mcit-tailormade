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
    selectedGroups: {}   /* {code: true} */
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
                  '<option value="age">AGE-งวนเทน</option>' +
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
            '<label class="p008-checkbox-option"><input id="p008SplitCollector" type="checkbox"> แยกบิลตามเก็บ (ทดสอบ)</label>' +
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
    root.querySelector("#p008PrintBtn").addEventListener("click", function () { window.print(); });
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
      "@media print{" +
        "@page{size:A4 landscape;margin:8mm}" +
        "body *{visibility:hidden !important}" +
        "#p008PrintTable,#p008PrintTable *{visibility:visible !important}" +
        "#p008PrintTable{position:absolute;top:0;left:0;width:281mm;border-collapse:collapse}" +
        "#p008PrintTable th,#p008PrintTable td{padding:4px;border:1px solid #888;font-size:8px}" +
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

  window.P008CollectionV2 = { mount: mountWithRoot };
})();
