/* P026 — ประวัติการเงินเจ้าหนี้ (clone UI หน้าค้นหาจาก P034)
 * IIFE — window.P026PayableHistory = { mount }
 * Data: MAC5 — autocomplete API p026_search.php (CRE table)
 * UI: ค้นหาเจ้าหนี้ (รหัส/ชื่อ) — autocomplete + toast — placeholder ผลค้นหา (ยังไม่เชื่อม DB)
 */
(function () {
  "use strict";

  var MAC5_CONNECTION_ID = "c1788406814359";

  /* ---------- helpers ---------- */
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var state = {
    query: ""
  };

  /* ---------- icons (inline SVG — เดียวกัน P034) ---------- */
  function icon(name, size) {
    var s = size || 16;
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
    };
    var p = paths[name] || paths.search;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }

  /* ---------- search (API MAC5 — autocomplete) ---------- */
  function apiFetch(path, payload) {
    return fetch("api/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function suggestCreditor(q) {
    q = String(q || "").trim();
    if (!q) return Promise.resolve([]);
    return apiFetch("p026_search.php", { connectionId: MAC5_CONNECTION_ID, q: q }).then(function (res) {
      return (res && res.ok) ? (res.rows || []) : [];
    }).catch(function () { return []; });
  }

  /* ---------- render (หน้าค้นหา — clone P034) ---------- */
  var _root = null;
  function root_el(id) {
    if (!_root) return null;
    var sel = id.charAt(0) === "#" ? id : "#" + id;
    return _root.querySelector(sel);
  }

  function mount(root) {
    state.query = "";
    _root = root;
    injectCSS();

    root.innerHTML =
      '<div class="p026-launcher">' +
        '<label class="p026-field">' +
          '<span class="p026-label">ค้นหาเจ้าหนี้ <em>*</em></span>' +
          '<div class="p026-acwrap">' +
            '<input id="p026Ref" type="text" class="p026-input" placeholder="รหัสเจ้าหนี้ หรือ ชื่อเจ้าหนี้" autocomplete="off">' +
            '<div id="p026Ac" class="p026-ac"></div>' +
          "</div>" +
        "</label>" +
      "</div>" +
      '<div id="p026Result"></div>' +
      '<div id="p026Toast" class="p026-toast"></div>';

    var ref = root.querySelector("#p026Ref");
    var ac = root.querySelector("#p026Ac");
    var acIdx = -1;
    var acItems = [];

    function closeAc() {
      ac.innerHTML = "";
      ac.classList.remove("p026-ac-open");
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
        suggestCreditor(q).then(function (items) {
          if (seq !== acSeq) return;
          acItems = items || [];
          acIdx = -1;
          if (!acItems.length) { closeAc(); return; }
          var html = "";
          for (var i = 0; i < acItems.length; i++) {
            var d = acItems[i];
            html +=
              '<div class="p026-ac-item" data-i="' + i + '">' +
                '<span class="p026-ac-code">' + esc(d.code) + "</span>" +
                '<span class="p026-ac-name">' + esc(d.name) + "</span>" +
                '<span class="p026-ac-dist">(' + esc(d.groupCode || "") + ")</span>" +
              "</div>";
          }
          ac.innerHTML = html;
          ac.classList.add("p026-ac-open");
          ac.querySelectorAll(".p026-ac-item").forEach(function (el) {
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
      if (!ac.classList.contains("p026-ac-open")) {
        if (e.key === "Enter") doSearch();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var n = acItems.length;
        if (!n) return;
        acIdx = e.key === "ArrowDown" ? (acIdx + 1) % n : (acIdx - 1 + n) % n;
        ac.querySelectorAll(".p026-ac-item").forEach(function (el, i) {
          el.classList.toggle("p026-ac-active", i === acIdx);
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
    var ref = root_el("#p026Ref");
    if (!ref || !String(ref.value).trim()) {
      showToast("⚠ กรอกรหัสเจ้าหนี้ หรือ ชื่อเจ้าหนี้ เพื่อค้นหา");
      return;
    }
    state.query = String(ref.value).trim();
    /* ยังไม่เชื่อม DB — แสดง placeholder */
    var box = root_el("#p026Result");
    if (box) {
      box.innerHTML =
        '<div class="p026-empty-state">' +
          '<div class="p026-empty-ic">' + icon("clock", 28) + "</div>" +
          '<div class="p026-empty-title">อยู่ระหว่างเชื่อมต่อฐานข้อมูล</div>' +
          '<div class="p026-empty-sub">ค้นหา: ' + esc(state.query) + " — หน้าผลค้นหายังไม่ได้เชื่อมต่อฐานข้อมูล</div>" +
        "</div>";
    }
    showToast("✓ ค้นหา: " + state.query + " (ยังไม่เชื่อม DB)");
  }

  var toastTimer = null;
  function showToast(msg, ms) {
    var t = root_el("#p026Toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, ms || 2600);
  }

  /* ---------- CSS (clone P034 — launcher + toast + empty state) ---------- */
  function injectCSS() {
    if (document.getElementById("p026Styles")) return;
    var st = document.createElement("style");
    st.id = "p026Styles";
    st.textContent =
      ".p026-launcher{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap;background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:16px 18px}" +
      ".p026-field{display:flex;flex-direction:column;gap:6px;width:50%;min-width:260px}" +
      ".p026-label{font-size:12px;font-weight:600;color:#475569}" +
      ".p026-label em{color:#dc2626;font-style:normal}" +
      ".p026-input{height:40px;border:1px solid #d7dee9;border-radius:10px;padding:0 14px;font-size:13px;outline:none;background:#fbfcfe}" +
      ".p026-input:focus{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,.12)}" +
      ".p026-acwrap{position:relative}" +
      ".p026-acwrap .p026-input{width:100%;box-sizing:border-box}" +
      ".p026-ac{display:none;position:absolute;top:44px;left:0;right:0;background:#fff;border:1px solid #d7dee9;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.12);max-height:240px;overflow-y:auto;z-index:50}" +
      ".p026-ac.p026-ac-open{display:block}" +
      ".p026-ac-item{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid #f1f5f9;font-size:12.5px}" +
      ".p026-ac-item:last-child{border-bottom:none}" +
      ".p026-ac-item:hover,.p026-ac-item.p026-ac-active{background:#eef4ff}" +
      ".p026-ac-code{font-weight:700;color:#2563eb;min-width:90px}" +
      ".p026-ac-name{color:#0f172a;flex:1}" +
      ".p026-ac-dist{color:#64748b;font-size:11px}" +
      ".p026-empty-state{display:flex;flex-direction:column;align-items:center;gap:10px;background:#fff;border:1px dashed #d7dee9;border-radius:14px;padding:48px 24px;margin-top:14px;color:#64748b}" +
      ".p026-empty-ic{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:#eef4ff;color:#2563eb}" +
      ".p026-empty-title{font-size:15px;font-weight:700;color:#0f172a}" +
      ".p026-empty-sub{font-size:12.5px;color:#64748b}" +
      ".p026-toast{position:fixed;right:20px;bottom:20px;z-index:210;padding:11px 14px;border-radius:11px;background:#0f172a;color:#fff;font-size:12px;box-shadow:0 16px 36px rgba(15,23,42,.28);opacity:0;visibility:hidden;transform:translateY(12px);transition:.2s}" +
      ".p026-toast.show{opacity:1;visibility:visible;transform:translateY(0)}";
    document.head.appendChild(st);
  }

  window.P026PayableHistory = { mount: mount };
})();
