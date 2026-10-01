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
    query: "",
    found: null
  };

  function fmtBaht(n) {
    return "฿ " + Number(n || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---------- icons (inline SVG — เดียวกัน P034) ---------- */
  function icon(name, size) {
    var s = size || 16;
    var paths = {
      search: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
      clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
      idCard: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="11" r="2"></circle><path d="M15 9h4M15 13h4M6 16h6"></path>',
      mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
      money: '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 12h.01M18 12h.01"></path>'
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
    /* input "CODE NAME" → split on first space = code */
    var q = state.query;
    var codePart = q;
    var sp = q.indexOf(" ");
    if (sp > 0) codePart = q.substring(0, sp);

    state.found = null;
    renderResult();
    apiFetch("p026_creditor.php", { connectionId: MAC5_CONNECTION_ID, code: codePart }).then(function (res) {
      if (!res || !res.ok) throw new Error(res && res.error ? res.error : "API error");
      if (!res.creditor) {
        state.found = null;
        renderResult();
        showToast("⚠ ไม่พบข้อมูล — ไม่มีเจ้าหนี้รหัส " + codePart, 3200);
        return;
      }
      state.found = res.creditor;
      renderResult();
      showToast("✓ พบ " + state.found.name);
    }).catch(function (e) {
      state.found = null;
      renderResult();
      showToast("⚠ ค้นหาไม่สำเร็จ: " + (e && e.message ? e.message : ""), 3200);
    });
  }

  function renderResult() {
    var box = root_el("#p026Result");
    if (!box) return;
    if (!state.found) { box.innerHTML = ""; return; }
    var d = state.found;

    var html = "";
    // 1. creditor panel (clone P034 panel)
    html +=
      '<div class="p026-panel">' +
        '<div class="p026-panel-main">' +
          '<div class="p026-panel-top">' +
            '<span class="p026-code">' + icon("idCard", 14) + " " + esc(d.code) + "</span>" +
            '<span class="p026-name">' + esc(d.name) + "</span>" +
            '<span class="p026-groupcode">(' + esc(d.groupCode) + ")</span>" +
          "</div>" +
        "</div>" +
        '<div class="p026-panel-right">' +
          "<span>" + icon("mapPin", 14) + " " + esc(d.address) + "</span>" +
          '<span class="p026-pr-row">' +
            "<span>" + icon("calendar", 14) + " เริ่มค้าขาย " + esc(d.since) + "</span>" +
            "<span>" + icon("money", 14) + " วงเงิน " + fmtBaht(d.limit) + "</span>" +
          "</span>" +
        "</div>" +
      "</div>";

    box.innerHTML = html;
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
      ".p026-panel{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;background:#fff;border:1px solid #e5eaf2;border-radius:14px;padding:16px 20px;margin-top:14px}" +
      ".p026-panel-main{display:flex;flex-direction:column;gap:8px;min-width:280px}" +
      ".p026-panel-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}" +
      ".p026-groupcode{font-size:13px;font-weight:600;color:#475569}" +
      ".p026-code{display:inline-flex;align-items:center;gap:6px;background:#eef4ff;border:1px solid #d4e2fb;border-radius:20px;padding:7px 14px;font-size:13px;font-weight:600;color:#1e3a8a}" +
      ".p026-name{font-size:18px;font-weight:700;color:#0f172a}" +
      ".p026-panel-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;font-size:12px;color:#475569}" +
      ".p026-panel-right .p026-pr-row{display:flex;gap:20px;flex-wrap:wrap}" +
      ".p026-panel-right span{display:inline-flex;align-items:center;gap:6px}" +
      ".p026-panel-right svg{color:#2563eb}" +
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
