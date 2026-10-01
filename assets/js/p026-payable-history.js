/* P026 — ประวัติการเงินเจ้าหนี้ (หน้าเปล่า — รอพัฒนา)
 * IIFE — window.P026PayableHistory = { mount }
 * UI: placeholder "รอการพัฒนา"
 */
(function () {
  "use strict";

  /* ---------- icons (inline SVG) ---------- */
  function icon(name, size) {
    var s = size || 16;
    var paths = {
      clock: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>'
    };
    var p = paths[name] || paths.clock;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  }

  function mount(root) {
    injectCSS();
    root.innerHTML =
      '<div class="p026-empty-state">' +
        '<div class="p026-empty-ic">' + icon("clock", 28) + "</div>" +
        '<div class="p026-empty-title">หน้าจออยู่ระหว่างพัฒนา</div>' +
        '<div class="p026-empty-sub">P026 ประวัติการเงินเจ้าหนี้ — รอการพัฒนา</div>' +
      "</div>";
  }

  /* ---------- CSS ---------- */
  function injectCSS() {
    if (document.getElementById("p026Styles")) return;
    var st = document.createElement("style");
    st.id = "p026Styles";
    st.textContent =
      ".p026-empty-state{display:flex;flex-direction:column;align-items:center;gap:10px;background:#fff;border:1px dashed #d7dee9;border-radius:14px;padding:48px 24px;margin-top:14px;color:#64748b}" +
      ".p026-empty-ic{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:#eef4ff;color:#2563eb}" +
      ".p026-empty-title{font-size:15px;font-weight:700;color:#0f172a}" +
      ".p026-empty-sub{font-size:12.5px;color:#64748b}";
    document.head.appendChild(st);
  }

  window.P026PayableHistory = { mount: mount };
})();
