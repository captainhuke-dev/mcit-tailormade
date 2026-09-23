/* P106 — Print Barcode
 * IIFE — window.P106PrintBarcode = { mount }
 * Data: MAC5 — รอ SQL จาก user (mock data ชั่วคราว)
 * UI: launcher (รหัสสินค้า/PO/Receive + เลขที่ + ขนาด) + ตารางสินค้า + preview ฉลาก (S/M/L/A4) + print
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";
  var PAGE_SIZE = 15;

  /* ---------- EAN-13 (จาก demo) ---------- */
  var EAN_L = { 0: "0001101", 1: "0011001", 2: "0010011", 3: "0111101", 4: "0100011", 5: "0110001", 6: "0101111", 7: "0111011", 8: "0110111", 9: "0001011" };
  var EAN_G = { 0: "0100111", 1: "0110011", 2: "0011011", 3: "0100001", 4: "0011101", 5: "0111001", 6: "0000101", 7: "0010001", 8: "0001001", 9: "0010111" };
  var EAN_R = { 0: "1110010", 1: "1100110", 2: "1101100", 3: "1000010", 4: "1011100", 5: "1001110", 6: "1010000", 7: "1000100", 8: "1001000", 9: "1110100" };
  var EAN_PARITY = { 0: "LLLLLL", 1: "LLGLGG", 2: "LLGGLG", 3: "LLGGGL", 4: "LGLLGG", 5: "LGGLLG", 6: "LGGGLL", 7: "LGLGLG", 8: "LGLGGL", 9: "LGGLGL" };

  function calcCheckDigit(value) {
    var digits = value.split("").map(Number);
    var sum = 0;
    digits.forEach(function (d, i) { sum += d * (i % 2 === 0 ? 1 : 3); });
    return String((10 - (sum % 10)) % 10);
  }

  function normalizeEAN13(value) {
    var digits = String(value).replace(/\D/g, "");
    if (digits.length < 12) digits = digits.padStart(12, "0");
    if (digits.length === 12) return digits + calcCheckDigit(digits);
    if (digits.length >= 13) { var t = digits.slice(0, 12); return t + calcCheckDigit(t); }
    return digits;
  }

  function encodeEAN13(value) {
    var ean = normalizeEAN13(value);
    var parity = EAN_PARITY[Number(ean[0])];
    var pattern = "101";
    for (var i = 1; i <= 6; i++) {
      var d = Number(ean[i]);
      pattern += parity[i - 1] === "L" ? EAN_L[d] : EAN_G[d];
    }
    pattern += "01010";
    for (var j = 7; j <= 12; j++) pattern += EAN_R[Number(ean[j])];
    pattern += "101";
    return { ean: ean, pattern: pattern };
  }

  function createBarcodeSVG(value) {
    var enc = encodeEAN13(value);
    var ean = enc.ean, pattern = enc.pattern;
    var quiet = 10, normH = 70, guardH = 82;
    var fullW = pattern.length + quiet * 2;
    var guards = { 0: 1, 1: 1, 2: 1, 45: 1, 46: 1, 47: 1, 48: 1, 49: 1, 92: 1, 93: 1, 94: 1 };
    var bars = "";
    for (var i = 0; i < pattern.length; i++) {
      if (pattern[i] !== "1") continue;
      var h = guards[i] ? guardH : normH;
      bars += '<rect x="' + (quiet + i) + '" y="0" width="1" height="' + h + '" fill="#000"></rect>';
    }
    return '<svg class="p106-barcode-svg" viewBox="0 0 ' + fullW + ' ' + guardH + '" preserveAspectRatio="none" role="img" aria-label="EAN-13 ' + esc(ean) + '">' + bars + "</svg>";
  }

  function formatEAN13(value) {
    var ean = normalizeEAN13(value);
    return ean.slice(0, 1) + " " + ean.slice(1, 7) + " " + ean.slice(7);
  }

  /* ---------- size settings ---------- */
  // S: 1 ดวงเล็ก (ขนาดพิมพ์รอ user ยืนยัน)
  var SIZE_SETTINGS = {
    s: { className: "size-s", quantity: 3, width: 387, height: 101, zoom: 1.0, message: "S · ฉลาก 3 ดวง (102.3×26.8mm)" },
    m: { className: "size-m", quantity: 2, width: 387, height: 133, zoom: 1.0, message: "M · ฉลาก 2 ดวง (102.3×35.3mm)" },
    l: { className: "size-l", quantity: 1, width: 376, height: 376, zoom: 1.0, message: "L · ฉลาก 1 ดวง (99.4×99.4mm)" },
    a4: { className: "size-a4", quantity: 8, width: 794, height: 1123, zoom: 0.75, message: "A4 · ฉลาก 2 คอลัมน์ × 4 แถว (210×297mm)" }
  };

  function esc(v) {
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  /* ---------- icons ---------- */
  function icon(name) {
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path>',
      box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path>',
      barcode: '<path d="M3 5v14M6 5v14M10 5v14M13 5v14M18 5v14M21 5v14"></path><path d="M8 5v14M15.5 5v14"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>',
      zoomin: '<circle cx="11" cy="11" r="8"></circle><path d="M8 11h6M11 8v6M21 21l-4.35-4.35"></path>',
      zoomout: '<circle cx="11" cy="11" r="8"></circle><path d="M8 11h6M21 21l-4.35-4.35"></path>',
      fit: '<path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M16 3h3a2 2 0 0 1 2 2v3"></path><path d="M8 21H5a2 2 0 0 1-2-2v-3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>',
      print: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>',
      check: '<path d="M20 6 9 17l-5-5"></path>',
      doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6M16 13H8M16 17H8"></path>',
      tag: '<path d="M12 2H2v10l9.3 9.3a1 1 0 0 0 1.4 0l8.6-8.6a1 1 0 0 0 0-1.4z"></path><circle cx="7" cy="7" r="1.5"></circle>',
      cart: '<circle cx="9" cy="21" r="1.5"></circle><circle cx="19" cy="21" r="1.5"></circle><path d="M2 2h3l2.6 13.4a1 1 0 0 0 1 .6h9.7a1 1 0 0 0 1-.7L22 7H6"></path>',
      spin: '<path d="M21 12a9 9 0 1 1-3-6.7"></path><path d="M21 3v6h-6"></path>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || "") + "</svg>";
  }

  /* ---------- state ---------- */
  var root = null;
  var state = {
    source: "product",
    reference: "",
    products: [],
    loaded: false,
    selected: null,
    size: "m",
    zoom: 1,
    loading: false,
    page: 1
  };
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }

  function showToast(msg, ms) {
    var t = $("p106Toast");
    $("p106ToastMsg").textContent = msg;
    clearTimeout(toastTimer);
    t.classList.add("show");
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2200);
  }

  /* ---------- search (API — MAC5) ---------- */
  function doSearch() {
    if (state.loading) return;
    var ref = $("p106RefInput").value.trim();
    if (ref === "") {
      showToast("⚠ กรอกรหัสสินค้า หรือ เลขที่เอกสาร เพื่อค้นหา", 3200);
      $("p106RefInput").focus();
      return;
    }
    state.source = $("p106SourceSelect").value;
    state.reference = ref;

    state.loading = true;
    var btn = $("p106LaunchBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="p106-spin">' + icon("spin") + "</span> กำลังค้นหา...";

    fetch("api/p106_products.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID, source: state.source, reference: ref })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "ค้นหาไม่สำเร็จ");
        state.products = data.rows || [];
        state.loaded = true;
        state.page = 1;
        state.selected = state.products.length ? state.products[0] : null;

        var srcName = { product: "รหัสสินค้า", po: "PO", receive: "Receive" }[state.source] || "";
        $("p106DocText").textContent = ref ? ("ค้นหาจาก " + srcName + " · " + ref) : ("ค้นหาจาก " + srcName + " — ทั้งหมด");

        renderProducts();
        if (state.products.length === 0) {
          $("p106PrintArea").innerHTML = "";
          $("p106Empty").classList.add("show");
          $("p106PaperWrap").style.display = "none";
          updateHeadings();
          showToast("⚠ ไม่พบข้อมูล — ไม่มีเอกสารที่ตรงกับเงื่อนไขค้นหา", 3200);
        } else {
          renderLabels(false);
          state.zoom = SIZE_SETTINGS[state.size].zoom;
          if (state.selected) {
            var selCode = state.selected.code;
            loadDetails(selCode).then(function (details) {
              if (state.selected && state.selected.code === selCode) {
                state.selected.details = details;
                renderLabels(false);
              }
            }).catch(function () {});
          }
          showToast("✓ พบข้อมูล " + state.products.length + " รายการ");
        }
      })
      .catch(function (e) {
        showToast("❌ " + e.message, 4000);
      })
      .then(function () {
        state.loading = false;
        btn.disabled = false;
        btn.innerHTML = icon("search") + " ค้นหา";
      });
  }

  /* ---------- table ---------- */
  function renderProducts() {
    var rows = $("p106Rows");
    var total = state.products.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PAGE_SIZE;
    var slice = state.products.slice(start, start + PAGE_SIZE);

    if (!total) {
      rows.innerHTML = '<tr><td colspan="4" class="p106-empty-cell">ยังไม่มีข้อมูล</td></tr>';
      $("p106Count").textContent = "0 รายการ";
      renderPager();
      return;
    }
    var html = "";
    slice.forEach(function (p) {
      var sel = state.selected && state.selected.code === p.code ? " selected" : "";
      html += '<tr class="p106-row' + sel + '" data-p106-code="' + esc(p.code) + '">' +
        '<td class="p106-code">' + esc(p.code) + "</td>" +
        '<td title="' + esc(p.name) + '">' + esc(p.name) + "</td>" +
        '<td class="p106-barcode-num">' + esc(p.barcode) + "</td>" +
        '<td class="center"><button class="p106-create-btn" type="button" title="สร้างฉลาก" data-p106-create="' + esc(p.code) + '">' + icon("plus") + "</button></td>" +
        "</tr>";
    });
    rows.innerHTML = html;
    $("p106Count").textContent = total + " รายการ (หน้า " + state.page + "/" + pages + ")";
    renderPager();
    updateHeadings();
  }

  function renderPager() {
    var pager = $("p106Pager");
    if (!pager) return;
    var total = state.products.length;
    var pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (pages <= 1) {
      pager.classList.remove("show");
      pager.innerHTML = "";
      return;
    }
    var html = '<button type="button" class="p106-page-btn" data-p106-page="' + (state.page - 1) + '" ' + (state.page <= 1 ? "disabled" : "") + ">&#8249;</button>";
    var win = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) win.push(i);
    }
    var last = 0;
    win.forEach(function (i) {
      if (last && i - last > 1) html += '<span class="p106-page-ellipsis">…</span>';
      html += '<button type="button" class="p106-page-btn' + (i === state.page ? " active" : "") + '" data-p106-page="' + i + '">' + i + "</button>";
      last = i;
    });
    html += '<button type="button" class="p106-page-btn" data-p106-page="' + (state.page + 1) + '" ' + (state.page >= pages ? "disabled" : "") + ">&#8250;</button>";
    var start = (state.page - 1) * PAGE_SIZE + 1;
    var end = Math.min(total, state.page * PAGE_SIZE);
    html += '<span class="p106-page-info">แสดง ' + start + "–" + end + " จาก " + total + " รายการ</span>";
    pager.innerHTML = html;
    pager.classList.add("show");
  }

  function updateHeadings() {
    var p = state.selected;
    if (!p) {
      $("p106PrevTitle").textContent = "ตัวอย่างฉลาก";
      $("p106PrevSub").textContent = "เลือกสินค้าเพื่อสร้างตัวอย่าง";
      $("p106SelText").textContent = "-";
      return;
    }
    $("p106PrevTitle").textContent = p.code + " · " + p.name;
    $("p106PrevSub").textContent = normalizeEAN13(p.barcode) + " · " + SIZE_SETTINGS[state.size].message;
    $("p106SelText").textContent = "เลือกสินค้า " + p.code;
  }

  /* ---------- label ---------- */
  function createLabel(p) {
    var el = document.createElement("article");
    el.className = "p106-label";
    // ชื่อข้างบน barcode = STKdescE3 (fallback STKdescT1)
    var labelName = (p.descE3 && String(p.descE3).trim()) ? p.descE3 : p.name;
    var html =
      '<div class="p106-label-name">' + esc(labelName) + "</div>" +
      createBarcodeSVG(p.barcode) +
      '<div class="p106-label-text">' + esc(formatEAN13(p.barcode)) + "</div>";
    // รายละเอียดด้านล่าง (L/A4 — S/M ซ่อนด้วย CSS) — ค่าจาก api/p106_details.php (BI_CUBE.STKguide)
    var d = p.details || {};
    html +=
      '<div class="p106-label-details">' +
        "<div><strong>ชื่อสินค้า :</strong> " + esc(d.name || "") + "</div>" +
        "<div><strong>หน่วย :</strong> " + esc(d.unit || "") + "</div>" +
        "<div><strong>วิธีการใช้ :</strong> " + esc(d.guide || "") + "</div>" +
        "<div><strong>ข้อควรระวัง :</strong> " + esc(d.warning || "") + "</div>" +
        "<div><strong>สั่งผลิตและจัดจำหน่ายโดย :</strong></div>" +
        "<div>บริษัท มหาโชค มหาชัย อินเตอร์เทรด จำกัด</div>" +
        "<div>58/9 หมู่ 6 ต.คลองมะเดื่อ อ.กระทุ่มแบน จ.สมุทรสาคร</div>" +
      "</div>";
    el.innerHTML = html;
    return el;
  }

  /* ---------- label details (L/A4 — BI_CUBE.STKguide) ---------- */
  function loadDetails(code) {
    return fetch("api/p106_details.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID, code: code })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "โหลดรายละเอียดไม่สำเร็จ");
        return data.details;
      });
  }

  function renderLabels(showMsg) {
    var area = $("p106PrintArea");
    var p = state.selected;
    if (!p) {
      area.innerHTML = "";
      area.className = "p106-paper";
      $("p106Empty").classList.add("show");
      $("p106PaperWrap").style.display = "none";
      updateHeadings();
      return;
    }
    var qty = Number($("p106QtyInput").value);
    if (!isFinite(qty) || qty < 1) qty = 1;
    qty = Math.min(100, Math.floor(qty));
    if (state.size === "s") qty = 3;
    if (state.size === "m") qty = Math.min(qty, 2);
    if (state.size === "l") qty = 1;
    if (state.size === "a4") qty = Math.min(qty, 8);
    $("p106QtyInput").value = qty;

    area.innerHTML = "";
    for (var i = 0; i < qty; i++) area.appendChild(createLabel(p));
    if (state.size === "a4") {
      for (var j = qty; j < 8; j++) {
        var blank = document.createElement("article");
        blank.className = "p106-label";
        area.appendChild(blank);
      }
    }
    $("p106Empty").classList.remove("show");
    $("p106PaperWrap").style.display = "block";
    updateHeadings();
    updateScale();
    if (showMsg) showToast("สร้างฉลากขนาด " + state.size.toUpperCase() + " จำนวน " + qty + " ดวงแล้ว");
  }

  function setSize(size, resetQty) {
    if (!SIZE_SETTINGS[size]) size = "m";
    state.size = size;
    $("p106SizeSelect").value = size;
    $("p106PrintArea").className = "p106-paper " + SIZE_SETTINGS[size].className;
    if (resetQty) $("p106QtyInput").value = SIZE_SETTINGS[size].quantity;
    // zoom default ตามขนาด (S/M/L = 100%, A4 = 75%)
    state.zoom = SIZE_SETTINGS[size].zoom;
    renderLabels(false);
  }

  function updateScale() {
    var s = SIZE_SETTINGS[state.size];
    $("p106PrintArea").style.transform = "scale(" + state.zoom + ")";
    $("p106PaperWrap").style.width = Math.round(s.width * state.zoom) + "px";
    $("p106PaperWrap").style.height = Math.round(s.height * state.zoom) + "px";
    $("p106ZoomLabel").textContent = Math.round(state.zoom * 100) + "%";
  }

  function fitPreview() {
    var s = SIZE_SETTINGS[state.size];
    var area = $("p106PreviewArea");
    var aw = area.clientWidth - 80;
    var ah = area.clientHeight - 80;
    if (aw <= 0 || ah <= 0) return;
    var z = Math.min(aw / s.width, ah / s.height, 1);
    state.zoom = Math.max(0.2, z * 0.7);
    updateScale();
  }

  /* ---------- print page size ---------- */
  var PRINT_MM = { s: [102.3, 26.8], m: [102.3, 35.3], l: [99.4, 99.4], a4: [210, 297] };

  function applyPrintPage() {
    var mm = PRINT_MM[state.size] || PRINT_MM.s;
    var st = document.getElementById("p106PrintPage");
    if (!st) {
      st = document.createElement("style");
      st.id = "p106PrintPage";
      document.head.appendChild(st);
    }
    st.textContent = "@page{size:" + mm[0] + "mm " + mm[1] + "mm; margin:0}";
  }
  function mount(el) {
    root = el;
    root.innerHTML =
      '<form class="p106-launcher" id="p106Launcher">' +
        '<div class="p106-field">' +
          "<label for=\"p106SourceSelect\">ค้นหาจาก</label>" +
          '<div class="p106-inputwrap">' +
            '<svg class="p106-input-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + icon("tag").replace(/^<svg[^>]*>|<\/svg>$/g, "") + "</svg>" +
            '<select id="p106SourceSelect">' +
              '<option value="product">รหัสสินค้า</option>' +
              '<option value="po">PO</option>' +
              '<option value="receive">Receive</option>' +
            "</select>" +
            '<svg class="p106-select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"></path></svg>' +
          "</div>" +
        "</div>" +
        '<div class="p106-field p106-field-ref">' +
          "<label for=\"p106RefInput\">เลขที่เอกสาร / รหัสสินค้า <span class=\"p106-req\">*</span></label>" +
          '<div class="p106-inputwrap">' +
            '<svg class="p106-input-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + icon("doc").replace(/^<svg[^>]*>|<\/svg>$/g, "") + "</svg>" +
            '<input id="p106RefInput" type="text" placeholder="ระบุเลขที่เอกสาร หรือ รหัสสินค้า" autocomplete="off">' +
          "</div>" +
        "</div>" +
        '<button class="p106-launch-btn" id="p106LaunchBtn" type="submit">' + icon("search") + " ค้นหา</button>" +
      "</form>" +

      '<div class="p106-workspace">' +
        '<article class="p106-panel">' +
          '<div class="p106-panel-head">' +
            '<div class="p106-panel-ic">' + icon("box") + "</div>" +
            "<div>" +
              "<h2>รายการสินค้า</h2>" +
              '<p id="p106DocText">ยังไม่ได้ค้นหา</p>' +
            "</div>" +
            '<span class="p106-badge" id="p106Count">0 รายการ</span>' +
          "</div>" +
          '<div class="p106-tablewrap">' +
            "<table class=\"p106-table\">" +
              "<thead><tr><th>รหัสสินค้า</th><th>ชื่อสินค้า</th><th>Barcode</th><th class=\"center\">สร้าง</th></tr></thead>" +
              '<tbody id="p106Rows">' +
                '<tr><td colspan="4" class="p106-empty-cell">กด "เลือกรายการ" เพื่อค้นหา</td></tr>' +
              "</tbody>" +
            "</table>" +
          "</div>" +
          '<div class="p106-table-foot">' +
            "<span>คลิกแถวเพื่อเลือก หรือดับเบิลคลิกเพื่อสร้างฉลาก</span>" +
            '<strong id="p106SelText">-</strong>' +
          "</div>" +
          '<div class="p106-pager" id="p106Pager"></div>' +
        "</article>" +

        '<article class="p106-panel">' +
          '<div class="p106-panel-head">' +
            '<div class="p106-panel-ic">' + icon("barcode") + "</div>" +
            "<div>" +
              '<h2 id="p106PrevTitle">ตัวอย่างฉลาก</h2>' +
              '<p id="p106PrevSub">เลือกสินค้าเพื่อสร้างตัวอย่าง</p>' +
            "</div>" +
            '<div class="p106-tools">' +
              '<div class="p106-tool-field"><label for="p106SizeSelect">ขนาด</label>' +
                '<select id="p106SizeSelect">' +
                  '<option value="s">S</option>' +
                  '<option value="m" selected>M</option>' +
                  '<option value="l">L</option>' +
                  '<option value="a4">A4</option>' +
                "</select>" +
              "</div>" +
              '<input id="p106QtyInput" type="number" min="1" max="100" value="2" style="display:none">' +
            "</div>" +
          "</div>" +
          '<div class="p106-preview" id="p106PreviewArea">' +
            '<div class="p106-stage">' +
              '<div class="p106-empty show" id="p106Empty">' +
                '<div class="p106-empty-ic">' + icon("barcode") + "</div>" +
                "<strong>ยังไม่มีตัวอย่างฉลาก</strong>" +
                "<p>เลือกสินค้าแล้วกดปุ่มสร้างฉลาก</p>" +
              "</div>" +
              '<div class="p106-paperwrap" id="p106PaperWrap" style="display:none">' +
                '<div class="p106-paper size-m" id="p106PrintArea"></div>' +
              "</div>" +
            "</div>" +
            '<span class="p106-zoomlabel" id="p106ZoomLabel">100%</span>' +
          "</div>" +
          '<div class="p106-toolbar">' +
            '<button class="p106-tool-btn" id="p106ZoomOut" type="button" title="ย่อ">' + icon("zoomout") + "</button>" +
            '<button class="p106-tool-btn" id="p106ZoomIn" type="button" title="ขยาย">' + icon("zoomin") + "</button>" +
            '<button class="p106-tool-btn" id="p106FitBtn" type="button" title="พอดีหน้าจอ">' + icon("fit") + "</button>" +
            '<button class="p106-tool-btn primary" id="p106PrintBtn" type="button">' + icon("print") + " พิมพ์</button>" +
          "</div>" +
        "</article>" +
      "</div>" +

      '<div class="p106-toast" id="p106Toast">' + icon("check") + '<span id="p106ToastMsg"></span></div>';

    /* CSS */
    if (!document.getElementById("p106Style")) {
      var st = document.createElement("style");
      st.id = "p106Style";
      st.textContent =
        '.p106-launcher{display:grid;grid-template-columns:minmax(180px,0.75fr) minmax(260px,1.2fr) auto;gap:13px;padding:15px;border:1px solid var(--border,#e2e8f0);border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04);margin-bottom:14px}' +
        '.p106-req{color:#dc2626}' +
        '.p106-field label{display:block;margin-bottom:6px;color:var(--muted,#64748b);font-size:11px;font-weight:600}' +
        '.p106-inputwrap{position:relative}' +
        '.p106-input-ic{position:absolute;top:50%;left:13px;z-index:1;width:18px;height:18px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}' +
        '.p106-select-arrow{position:absolute;top:50%;right:13px;width:16px;height:16px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}' +
        '.p106-field select,.p106-field input{width:100%;height:44px;padding:0 40px 0 42px;color:var(--text,#172033);border:1px solid var(--border,#e2e8f0);border-radius:11px;outline:none;background:#fff;transition:.18s;font-size:13px}' +
        '.p106-field select{cursor:pointer;appearance:none}' +
        '.p106-field select:focus,.p106-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}' +
        '.p106-launch-btn{display:inline-flex;height:44px;align-self:end;align-items:center;justify-content:center;gap:8px;padding:0 20px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-weight:600;font-size:13px;white-space:nowrap;transition:.18s;cursor:pointer}' +
        '.p106-launch-btn:hover{filter:brightness(1.06);transform:translateY(-1px)}' +
        '.p106-launch-btn svg{width:18px;height:18px}' +
        '.p106-workspace{display:grid;grid-template-columns:45fr 55fr;gap:14px}' +
        '.p106-panel{display:flex;min-width:0;flex-direction:column;overflow:hidden;border:1px solid var(--border,#e2e8f0);border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}' +
        '.p106-panel-head{display:flex;align-items:center;gap:10px;padding:11px 15px;border-bottom:1px solid var(--border,#e2e8f0);background:#fff;min-height:64px}' +
        '.p106-panel-ic{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;border-radius:11px;color:#2563eb;background:#eff6ff}' +
        '.p106-panel-ic svg{width:19px;height:19px}' +
        '.p106-panel-head h2{font-size:14px;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.p106-panel-head p{margin:1px 0 0;font-size:10px;color:var(--muted,#64748b);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '.p106-badge{margin-left:auto;padding:5px 10px;border-radius:99px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700;white-space:nowrap}' +
        '.p106-tablewrap{overflow-x:auto}' +
        '.p106-table{width:100%;border-collapse:separate;border-spacing:0;white-space:nowrap;table-layout:fixed}' +
        '.p106-table th:nth-child(1){width:90px}' +
        '.p106-table th:nth-child(3){width:110px}' +
        '.p106-table th:nth-child(4){width:75px}' +
        '.p106-table th{position:sticky;top:0;z-index:3;padding:11px 13px;font-size:11px;font-weight:600;color:var(--muted,#64748b);background:#f8fafc;border-bottom:1px solid var(--border,#e2e8f0);text-align:left}' +
        '.p106-table td{padding:10px 13px;border-bottom:1px solid #edf1f6;font-size:12px;max-width:310px;overflow:hidden;text-overflow:ellipsis}' +
        '.p106-table th.center,.p106-table td.center{text-align:center}' +
        '.p106-row{cursor:pointer;transition:.14s}' +
        '.p106-row:nth-child(even){background:#fbfdff}' +
        '.p106-row:hover{background:#f0f7ff}' +
        '.p106-row.selected{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}' +
        '.p106-code{color:#1d4ed8;font-weight:700}' +
        '.p106-barcode-num{color:#475569;font-family:Arial,sans-serif;font-variant-numeric:tabular-nums}' +
        '.p106-empty-cell{color:var(--muted,#64748b);text-align:center;padding:30px 13px}' +
        '.p106-create-btn{display:inline-flex;height:30px;width:30px;align-items:center;justify-content:center;gap:5px;padding:0;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:8px;background:#eff6ff;font-size:12px;font-weight:600;transition:.15s;cursor:pointer}' +
        '.p106-create-btn:hover{color:#fff;border-color:#2563eb;background:#2563eb}' +
        '.p106-create-btn svg{width:14px;height:14px}' +
        '.p106-table-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 14px;color:var(--muted,#64748b);border-top:1px solid var(--border,#e2e8f0);background:#f8fafc;font-size:10px;min-height:40px}' +
        '.p106-table-foot strong{color:var(--text,#172033)}' +
        '.p106-pager{display:none;align-items:center;gap:5px;padding:8px 14px;border-top:1px solid var(--border,#e2e8f0);background:#fff}' +
        '.p106-pager.show{display:flex}' +
        '.p106-page-btn{min-width:28px;height:28px;padding:0 7px;border:1px solid var(--border,#e2e8f0);border-radius:7px;background:#fff;color:var(--muted,#64748b);font-size:11px;font-weight:600;cursor:pointer;transition:.15s}' +
        '.p106-page-btn:hover:not(:disabled){color:#2563eb;border-color:#bfdbfe;background:#eff6ff}' +
        '.p106-page-btn.active{color:#fff;border-color:#2563eb;background:#2563eb}' +
        '.p106-page-btn:disabled{opacity:.4;cursor:default}' +
        '.p106-page-ellipsis{color:var(--muted,#94a3b8);font-size:11px;padding:0 2px}' +
        '.p106-page-info{margin-left:auto;color:var(--muted,#64748b);font-size:10px;white-space:nowrap}' +
        '.p106-spin{display:inline-block;width:15px;height:15px;animation:p106spin .8s linear infinite}' +
        '@keyframes p106spin{to{transform:rotate(360deg)}}' +
        '.p106-toolbar{display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:9px 14px;border-top:1px solid var(--border,#e2e8f0);background:#fff}' +
        '.p106-tools{display:flex;align-items:center;gap:7px;margin-left:auto;flex-wrap:wrap;justify-content:flex-end}' +
        '.p106-tool-field{display:flex;align-items:center;gap:6px}' +
        '.p106-tool-field label{color:var(--muted,#64748b);font-size:11px;font-weight:600}' +
        '.p106-tool-field select,.p106-tool-field input{height:34px;color:var(--text,#172033);border:1px solid var(--border,#e2e8f0);border-radius:9px;outline:none;background:#fff;font-size:12px}' +
        '.p106-tool-field select{width:74px;padding:0 9px;cursor:pointer}' +
        '.p106-tool-field input{width:60px;padding:0 8px;text-align:center}' +
        '.p106-tool-btn{display:inline-flex;height:34px;align-items:center;justify-content:center;gap:6px;padding:0 11px;color:var(--muted,#64748b);border:1px solid var(--border,#e2e8f0);border-radius:9px;background:#fff;font-size:11px;font-weight:600;white-space:nowrap;transition:.15s;cursor:pointer}' +
        '.p106-tool-btn:hover{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}' +
        '.p106-tool-btn.primary{color:#fff;border-color:#2563eb;background:#2563eb}' +
        '.p106-tool-btn.primary:hover{background:#1d4ed8}' +
        '.p106-tool-btn svg{width:15px;height:15px}' +
        '.p106-preview{position:relative;min-height:480px;overflow:auto;background-color:#d5dbe3;background-image:linear-gradient(45deg,#cbd2dc 25%,transparent 25%),linear-gradient(-45deg,#cbd2dc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#cbd2dc 75%),linear-gradient(-45deg,transparent 75%,#cbd2dc 75%);background-position:0 0,0 10px,10px -10px,-10px 0;background-size:20px 20px}' +
        '.p106-stage{display:grid;min-width:100%;min-height:100%;place-items:center;padding:40px}' +
        '.p106-paperwrap{flex:0 0 auto;transition:width .2s,height .2s}' +
        '.p106-paper{color:#000;background:#fff;box-shadow:0 20px 48px rgba(15,23,42,.3);transform-origin:top left;transition:transform .2s ease}' +
        /* S: 3 labels — 102.3×26.8mm, margin 0 */
        '.p106-paper.size-s{display:grid;width:387px;height:101px;grid-template-columns:repeat(3,1fr);padding:0}' +
        '.p106-paper.size-s .p106-label{display:flex;min-width:0;align-items:center;flex-direction:column;padding:6px 4px;border-right:1px dashed #cbd5e1}' +
        '.p106-paper.size-s .p106-label:last-child{border-right:0}' +
        '.p106-paper.size-s .p106-label-name{width:100%;min-height:16px;margin-bottom:3px;padding:10px 0 0 0;font-size:8px;font-weight:600;line-height:1.2;text-align:center;overflow:hidden}' +
        '.p106-paper.size-s .p106-barcode-svg{width:105px;height:30px}' +
        '.p106-paper.size-s .p106-label-text{font-size:9px;letter-spacing:1px}' +
        '.p106-paper.size-s .p106-label-details{display:none}' +
        /* M: 2 labels — 102.3×35.3mm, margin 0 */
        '.p106-paper.size-m{display:grid;width:387px;height:133px;grid-template-columns:repeat(2,1fr);padding:0}' +
        '.p106-paper.size-m .p106-label{display:flex;min-width:0;align-items:center;justify-content:center;flex-direction:column;padding:10px 6px;border-right:1px dashed #cbd5e1}' +
        '.p106-paper.size-m .p106-label:last-child{border-right:0}' +
        '.p106-paper.size-m .p106-label-name{max-width:170px;min-height:22px;margin-bottom:5px;font-size:10px;font-weight:600;line-height:1.3;text-align:center}' +
        '.p106-paper.size-m .p106-barcode-svg{width:160px;height:48px}' +
        '.p106-paper.size-m .p106-label-text{font-size:12px;letter-spacing:2px}' +
        '.p106-paper.size-m .p106-label-details{display:none}' +
        /* L: 1 large — 99.4×99.4mm, margin 15px ทั้ง 4 ด้าน */
        '.p106-paper.size-l{display:grid;width:376px;min-height:376px;grid-template-columns:1fr;padding:15px}' +
        '.p106-paper.size-l .p106-label{display:flex;align-items:center;flex-direction:column}' +
        '.p106-paper.size-l .p106-label-name{width:100%;margin-top:15px;margin-bottom:10px;padding-top:0;font-size:13px;font-weight:600;line-height:1.4;text-align:center}' +
        '.p106-paper.size-l .p106-barcode-svg{width:250px;height:90px}' +
        '.p106-paper.size-l .p106-label-text{margin-top:2px;font-size:22px;letter-spacing:4px}' +
        '.p106-paper.size-l .p106-label-details{width:100%;margin-top:14px;font-size:12px;line-height:1.4}' +
        '.p106-paper.size-l .p106-label-details strong{font-weight:700}' +
        /* A4: 2x4 — 1 ช่อง = 272f × 205f (96.22×72.15mm), margin 0 ทั้ง 4 ด้าน, จัดกลาง */
        '.p106-paper.size-a4{display:grid;width:794px;height:1123px;grid-template-columns:repeat(2,362.67px);grid-template-rows:repeat(4,273.33px);justify-content:center;align-content:center;padding:0;background:#fff}' +
        '.p106-paper.size-a4 .p106-label{display:flex;min-width:0;min-height:0;align-items:center;flex-direction:column;padding:18px 17px 12px;border-right:1px solid #111;border-bottom:1px solid #111}' +
        '.p106-paper.size-a4 .p106-label:nth-child(odd){border-left:1px solid #111}' +
        '.p106-paper.size-a4 .p106-label:nth-child(-n+2){border-top:1px solid #111}' +
        '.p106-paper.size-a4 .p106-label-name{width:100%;height:25px;overflow:hidden;margin-bottom:0;font-size:11px;font-weight:600;line-height:1.35;text-align:center}' +
        '.p106-paper.size-a4 .p106-barcode-svg{width:215px;height:70px}' +
        '.p106-paper.size-a4 .p106-label-text{margin-top:0;font-size:20px;letter-spacing:3px}' +
        '.p106-paper.size-a4 .p106-label-details{width:100%;margin-top:9px;overflow:hidden;font-size:10px;line-height:1.35}' +
        '.p106-paper.size-a4 .p106-label-details strong{font-weight:700}' +
        '.p106-barcode-svg{display:block;overflow:visible;shape-rendering:crispEdges}' +
        '.p106-label-text{font-family:Arial,Helvetica,sans-serif;line-height:1;text-align:center;white-space:nowrap}' +
        '.p106-empty{display:none;align-items:center;flex-direction:column;color:var(--muted,#64748b);text-align:center}' +
        '.p106-empty.show{display:flex}' +
        '.p106-empty-ic{display:grid;width:66px;height:66px;place-items:center;margin-bottom:12px;border-radius:20px;color:#2563eb;border:1px solid #bfdbfe;background:rgba(239,246,255,.94)}' +
        '.p106-empty-ic svg{width:30px;height:30px}' +
        '.p106-empty strong{color:#334155;font-size:14px}' +
        '.p106-empty p{margin-top:4px;font-size:11px}' +
        '.p106-zoomlabel{position:absolute;right:15px;bottom:14px;z-index:5;padding:6px 9px;border-radius:8px;background:rgba(15,23,42,.78);color:#fff;font-size:10px;pointer-events:none}' +
        '.p106-toast{position:fixed;right:20px;bottom:20px;z-index:210;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:11px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:.2s}' +
        '.p106-toast.show{opacity:1;visibility:visible;transform:translateY(0)}' +
        '.p106-toast svg{width:17px;height:17px;color:#34d399}' +
        "@media print{body *{visibility:hidden !important}.p106-preview,.p106-preview *{visibility:visible !important}.p106-preview{position:absolute;top:0;left:0;width:auto;height:auto;min-height:0;padding:0;overflow:visible;background:#fff}.p106-paperwrap{width:auto !important;height:auto !important}.p106-paper{transform:none !important;box-shadow:none}.p106-paper.size-s{width:102.3mm;height:26.8mm;padding:0}.p106-paper.size-m{width:102.3mm;height:35.3mm;padding:0}.p106-paper.size-l{width:99.4mm;height:99.4mm;padding:3.969mm}.p106-paper.size-a4{width:210mm;height:297mm;padding:0;grid-template-columns:repeat(2,96.22mm);grid-template-rows:repeat(4,72.15mm);justify-content:center;align-content:center}.p106-zoomlabel{display:none !important}}" +
        "@media (max-width:1180px){.p106-launcher{grid-template-columns:repeat(2,minmax(200px,1fr))}.p106-workspace{grid-template-columns:1fr}.p106-preview{min-height:520px}}";
      document.head.appendChild(st);
    }

    /* events */
    $("p106Launcher").addEventListener("submit", function (e) {
      e.preventDefault();
      doSearch();
    });

    $("p106Rows").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p106-create]");
      var tr = e.target.closest("[data-p106-code]");
      if (!tr) return;
      var code = tr.getAttribute("data-p106-code");
      var p = null;
      for (var i = 0; i < state.products.length; i++) {
        if (state.products[i].code === code) { p = state.products[i]; break; }
      }
      if (!p) return;
      state.selected = p;
      renderProducts();
      loadDetails(code).then(function (details) {
        if (state.selected && state.selected.code === code) {
          p.details = details;
          renderLabels(false);
        }
      }).catch(function () {});
      if (btn) renderLabels(true);
    });

    $("p106Rows").addEventListener("dblclick", function (e) {
      var tr = e.target.closest("[data-p106-code]");
      if (!tr) return;
      var code = tr.getAttribute("data-p106-code");
      for (var i = 0; i < state.products.length; i++) {
        if (state.products[i].code === code) { state.selected = state.products[i]; break; }
      }
      renderProducts();
      loadDetails(code).then(function (details) {
        if (state.selected && state.selected.code === code) {
          state.selected.details = details;
          renderLabels(true);
        }
      }).catch(function () { renderLabels(true); });
    });

    $("p106Pager").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p106-page]");
      if (!btn || btn.disabled) return;
      var p = Number(btn.getAttribute("data-p106-page"));
      var pages = Math.max(1, Math.ceil(state.products.length / PAGE_SIZE));
      if (p < 1 || p > pages || p === state.page) return;
      state.page = p;
      renderProducts();
    });

    $("p106SizeSelect").addEventListener("change", function () {
      setSize(this.value, true);
      applyPrintPage();
      showToast("เปลี่ยนรูปแบบเป็น " + this.value.toUpperCase());
    });

    $("p106QtyInput").addEventListener("change", function () { renderLabels(false); });

    $("p106ZoomIn").addEventListener("click", function () {
      state.zoom = Math.min(1.8, state.zoom + 0.1);
      updateScale();
    });

    $("p106ZoomOut").addEventListener("click", function () {
      state.zoom = Math.max(0.2, state.zoom - 0.1);
      updateScale();
    });

    $("p106FitBtn").addEventListener("click", function () {
      fitPreview();
      showToast("ปรับขนาดตัวอย่างให้พอดีหน้าจอแล้ว");
    });

    $("p106PrintBtn").addEventListener("click", function () {
      var area = $("p106PrintArea");
      if (!area.children.length) {
        showToast("⚠ กรุณาสร้างฉลากก่อนพิมพ์");
        return;
      }
      applyPrintPage();
      window.print();
    });
  }

  window.P106PrintBarcode = { mount: mount };
})();
