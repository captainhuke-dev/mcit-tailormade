/* Font settings — รูปแบบตัวอักษร (font) หน้าเว็บทั้งระบบ (ไม่กระทบ report/หน้าพิมพ์)
 * ขนาดตัวอักษร = ใช้ UI Scale ในกลุ่ม "ธีมและการแสดงผล" (ไม่ทำแยก)
 * localStorage: erp_font_family
 */
(function () {
  "use strict";

  var FAMILIES = [
    { id: "default", label: "ปกติ (Noto Sans Thai)", value: "" },
    { id: "prompt", label: "Prompt", value: "'Prompt', 'Noto Sans Thai', Tahoma, sans-serif" },
    { id: "k2d", label: "K2D", value: "'K2D', 'Noto Sans Thai', Tahoma, sans-serif" },
    { id: "chakrapetch", label: "Chakra Petch", value: "'Chakra Petch', 'Noto Sans Thai', Tahoma, sans-serif" },
    { id: "googlesans", label: "Google Sans", value: "'Google Sans', 'Noto Sans Thai', Tahoma, sans-serif" },
    { id: "noto", label: "Noto Sans Thai", value: "'Noto Sans Thai', 'Sarabun', Tahoma, Arial, sans-serif" },
    { id: "sarabun", label: "Sarabun", value: "'Sarabun', 'Noto Sans Thai', Tahoma, Arial, sans-serif" },
    { id: "tahoma", label: "Tahoma", value: "Tahoma, 'Noto Sans Thai', Arial, sans-serif" },
    { id: "arial", label: "Arial", value: "Arial, 'Noto Sans Thai', sans-serif" },
    { id: "monospace", label: "Monospace", value: "Consolas, 'Courier New', monospace" }
  ];
  var LS_FAMILY = "erp_font_family";
  var STYLE_ID = "erpFontSettingsStyle";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function getFamilyId() {
    var v = lsGet(LS_FAMILY);
    for (var i = 0; i < FAMILIES.length; i++) if (FAMILIES[i].id === v) return v;
    return "default";
  }
  function familyValue() {
    var id = getFamilyId();
    for (var i = 0; i < FAMILIES.length; i++) if (FAMILIES[i].id === id) return FAMILIES[i].value;
    return "";
  }

  function apply() {
    var fam = familyValue();
    var css = fam ? ".app,.app *{font-family:" + fam + " !important;}\n" : "";
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement("style");
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = css;
  }

  function familyOptions(selected) {
    return FAMILIES.map(function (f) {
      return '<option value="' + f.id + '"' + (f.id === selected ? " selected" : "") + ">" + f.label + "</option>";
    }).join("");
  }

  /* ---------- ปุ่ม "A" ใน header ---------- */
  function buildControl() {
    var app = document.querySelector(".app");
    if (!app) return;
    var header = app.querySelector(".header");
    if (!header) return;
    var actions = header.querySelector(".header-actions");
    if (!actions || actions.querySelector("#erpFontBtn")) return;

    var btn = document.createElement("button");
    btn.className = "icon-button";
    btn.id = "erpFontBtn";
    btn.setAttribute("aria-label", "ตั้งค่ารูปแบบตัวอักษร");
    btn.title = "ตั้งค่ารูปแบบตัวอักษร";
    btn.textContent = "A";
    btn.style.fontWeight = "700";
    btn.addEventListener("click", openModal);
    actions.insertBefore(btn, actions.firstChild);
  }

  function openModal() {
    if (document.getElementById("erpFontModal")) return;
    var famId = getFamilyId();

    var bd = document.createElement("div");
    bd.id = "erpFontModal";
    bd.style.cssText = "position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.45);backdrop-filter:blur(3px);";
    bd.innerHTML =
      '<section style="width:min(440px,100%);overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 24px 65px rgba(15,23,42,.3);">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid #e2e8f0;">' +
          '<h3 style="font-size:15px;margin:0;">ตั้งค่ารูปแบบตัวอักษร</h3>' +
          '<button id="erpFontClose" type="button" style="display:grid;width:32px;height:32px;place-items:center;color:#64748b;border:0;border-radius:8px;background:#f1f5f9;cursor:pointer;">✕</button>' +
        "</div>" +
        '<div style="display:grid;gap:14px;padding:18px;">' +
          '<label style="display:grid;gap:6px;font-size:12px;color:#64748b;font-weight:600;">' +
            "รูปแบบตัวอักษร (font)" +
            '<select id="erpFontFamily" style="width:100%;height:40px;padding:0 12px;border:1px solid #e2e8f0;border-radius:10px;outline:none;font:inherit;color:#172033;">' + familyOptions(famId) + "</select>" +
          "</label>" +
          '<p style="margin:0;font-size:11px;color:#94a3b8;">ใช้แค่หน้าเว็บทั้งระบบ (ไม่มีผลต่อรายงานพิมพ์) — จำในเครื่องนี้</p>' +
        "</div>" +
        '<div style="display:flex;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid #e2e8f0;background:#f8fafc;">' +
          '<button id="erpFontReset" type="button" style="height:38px;padding:0 16px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:#172033;font:inherit;font-weight:600;cursor:pointer;">คืนค่าดั้งเดิม</button>' +
          '<button id="erpFontDone" type="button" style="height:38px;padding:0 18px;border:0;border-radius:10px;background:#2563eb;color:#fff;font:inherit;font-weight:700;cursor:pointer;">เสร็จสิ้น</button>' +
        "</div>" +
      "</section>";
    var host = document.querySelector(".app") || document.body;
    host.appendChild(bd);

    function close() {
      bd.remove();
      document.removeEventListener("keydown", onKey);
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);

    bd.addEventListener("click", function (e) { if (e.target === bd) close(); });
    document.getElementById("erpFontClose").addEventListener("click", close);
    document.getElementById("erpFontDone").addEventListener("click", close);
    document.getElementById("erpFontReset").addEventListener("click", function () {
      lsDel(LS_FAMILY);
      document.getElementById("erpFontFamily").value = "default";
      apply();
    });
    document.getElementById("erpFontFamily").addEventListener("change", function (e) {
      lsSet(LS_FAMILY, e.target.value);
      apply();
    });
  }

  /* ---------- panel ในหน้า ตั้งค่า (กลุ่ม ธีมและการแสดงผล) ---------- */
  function renderAppearancePanel() {
    return (
      '<div class="appearance-panel">' +
        '<label for="erpFontFamilySet">รูปแบบตัวอักษร (font)</label>' +
        '<select id="erpFontFamilySet" class="form-input">' + familyOptions(getFamilyId()) + "</select>" +
        '<p class="scale-value">ใช้แค่หน้าเว็บทั้งระบบ (ไม่มีผลต่อรายงานพิมพ์) — จำในเครื่องนี้</p>' +
      "</div>"
    );
  }
  function bindSettingsSection() {
    var fm = document.getElementById("erpFontFamilySet");
    if (fm) fm.addEventListener("change", function (e) { lsSet(LS_FAMILY, e.target.value); apply(); });
  }

  function init() {
    apply();
    buildControl();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.ErpFontSettings = {
    apply: apply,
    reset: function () { lsDel(LS_FAMILY); apply(); },
    renderAppearancePanel: renderAppearancePanel,
    bindSettingsSection: bindSettingsSection
  };
})();
