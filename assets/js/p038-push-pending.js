/* P038 — ตรวจสอบค้างส่งผลักดันสินค้า
   UI clone demo/P038_demo.html (mock data — รอ API)
   (IIFE — window.P038PushPending = { mount })
*/
(function () {
  "use strict";

  var CSS = ".p038-scope {\n      --primary: #2563eb;\n      --primary-dark: #1d4ed8;\n      --primary-soft: #eff6ff;\n      --success: #059669;\n      --success-soft: #ecfdf5;\n      --warning: #d97706;\n      --warning-soft: #fffbeb;\n      --danger: #dc2626;\n      --danger-soft: #fef2f2;\n      --purple: #7c3aed;\n      --purple-soft: #f5f3ff;\n      --bg: #f3f6fb;\n      --surface: #ffffff;\n      --surface-soft: #f8fafc;\n      --text: #172033;\n      --muted: #64748b;\n      --border: #dbe3ef;\n      --radius: 16px;\n      --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);\n    }\n.p038-scope * { box-sizing: border-box; margin: 0; padding: 0; }\n.p038-scope {\n      min-height: 100vh;\n      color: var(--text);\n      background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30%), var(--bg);\n      font-family: \"Noto Sans Thai\", sans-serif;\n    }\n.p038-scope button, .p038-scope input, .p038-scope select { font: inherit; }\n.p038-scope button { cursor: pointer; }\n.p038-scope button:focus-visible, .p038-scope input:focus-visible, .p038-scope select:focus-visible {\n      outline: 3px solid rgba(37, 99, 235, 0.2);\n      outline-offset: 2px;\n    }\n.p038-scope svg {\n      display: block;\n      width: 20px;\n      height: 20px;\n      fill: none;\n      stroke: currentColor;\n      stroke-linecap: round;\n      stroke-linejoin: round;\n      stroke-width: 2;\n    }\n.p038-scope .app { display: flex; min-height: 100vh; flex-direction: column; }\n.p038-scope .topbar {\n      position: sticky;\n      top: 0;\n      z-index: 20;\n      display: flex;\n      min-height: 72px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 16px;\n      padding: 12px 22px;\n      border-bottom: 1px solid var(--border);\n      background: rgba(255, 255, 255, 0.95);\n      box-shadow: 0 3px 16px rgba(15, 23, 42, 0.04);\n      backdrop-filter: blur(14px);\n    }\n.p038-scope .brand { display: flex; min-width: 0; align-items: center; gap: 12px; }\n.p038-scope .brand-icon {\n      display: grid;\n      width: 46px;\n      height: 46px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: #fff;\n      border-radius: 14px;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 9px 22px rgba(37, 99, 235, 0.25);\n    }\n.p038-scope .brand h1 { overflow: hidden; font-size: 19px; text-overflow: ellipsis; white-space: nowrap; }\n.p038-scope .brand p { margin-top: 2px; color: var(--muted); font-size: 12px; }\n.p038-scope .system-status {\n      display: inline-flex;\n      height: 40px;\n      align-items: center;\n      gap: 8px;\n      padding: 0 12px;\n      color: var(--success);\n      border: 1px solid #a7f3d0;\n      border-radius: 11px;\n      background: var(--success-soft);\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p038-scope .status-dot {\n      width: 7px;\n      height: 7px;\n      border-radius: 50%;\n      background: #10b981;\n      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);\n    }\n.p038-scope .content {\n      display: flex;\n      width: 100%;\n      max-width: 1800px;\n      flex: 1;\n      flex-direction: column;\n      gap: 14px;\n      margin: 0 auto;\n      padding: 18px 22px 24px;\n    }\n.p038-scope .launcher-card {\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);\n    }\n.p038-scope .launcher-titlebar {\n      display: flex;\n      min-height: 44px;\n      align-items: center;\n      justify-content: space-between;\n      padding: 0 8px 0 16px;\n      background: linear-gradient(90deg, #1e3a8a, #1d4ed8);\n    }\n.p038-scope .launcher-titlebar span {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      color: #fff;\n      font-size: 14px;\n      font-weight: 700;\n    }\n.p038-scope .launcher-titlebar span svg { width: 17px; height: 17px; }\n.p038-scope .titlebar-close {\n      display: grid;\n      width: 32px;\n      height: 32px;\n      place-items: center;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--danger);\n    }\n.p038-scope .titlebar-close:hover { background: #b91c1c; }\n.p038-scope .titlebar-close svg { width: 15px; height: 15px; }\n.p038-scope .launcher-body {\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) 264px;\n      gap: 18px;\n      padding: 18px 20px 20px;\n      background: linear-gradient(180deg, #eaf2ff, #f3f8ff);\n    }\n.p038-scope .left-column { display: flex; flex-direction: column; gap: 14px; min-width: 0; }\n.p038-scope .row-fields {\n      display: grid;\n      grid-template-columns: 190px minmax(0, 1fr);\n      gap: 12px;\n      align-items: end;\n    }\n.p038-scope .row-fields.second { grid-template-columns: minmax(200px, 1fr) minmax(0, 1.4fr); }\n.p038-scope .field label.field-label {\n      display: block;\n      margin-bottom: 7px;\n      color: #334155;\n      font-size: 12px;\n      font-weight: 700;\n    }\n.p038-scope .input-wrap { position: relative; }\n.p038-scope .input-wrap svg {\n      position: absolute;\n      top: 50%;\n      right: 12px;\n      width: 17px;\n      height: 17px;\n      color: #94a3b8;\n      transform: translateY(-50%);\n      pointer-events: none;\n    }\n.p038-scope .input-wrap input, .p038-scope .input-wrap select {\n      width: 100%;\n      height: 42px;\n      padding: 0 12px;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 10px;\n      outline: none;\n      background: #fff;\n      font-size: 13px;\n    }\n.p038-scope .input-wrap select { cursor: pointer; appearance: none; padding-right: 36px; }\n.p038-scope .input-wrap input:focus, .p038-scope .input-wrap select:focus {\n      border-color: #60a5fa;\n      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);\n    }\n.p038-scope .input-wrap input:disabled { color: #94a3b8; background: #eef2f7; cursor: not-allowed; }\n.p038-scope .date-row {\n      display: grid;\n      grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);\n      gap: 9px;\n      align-items: center;\n    }\n.p038-scope .date-check {\n      display: flex;\n      align-items: center;\n      gap: 7px;\n      color: #334155;\n      font-size: 13px;\n      font-weight: 700;\n      white-space: nowrap;\n      cursor: pointer;\n    }\n.p038-scope .date-check input { width: 17px; height: 17px; accent-color: var(--primary); }\n.p038-scope .date-separator { color: #475569; font-size: 12px; font-weight: 700; }\n.p038-scope .option-groups {\n      display: grid;\n      grid-template-columns: repeat(5, minmax(150px, 1fr));\n      gap: 10px;\n    }\n.p038-scope .option-card {\n      padding: 11px 13px;\n      border: 1px solid #c9d8ec;\n      border-radius: 12px;\n      background: rgba(255, 255, 255, 0.8);\n    }\n.p038-scope .option-card h3 { margin-bottom: 8px; color: #1e3a8a; font-size: 12px; }\n.p038-scope .option-list { display: flex; flex-direction: column; gap: 6px; }\n.p038-scope .option-item {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      font-size: 12.5px;\n      font-weight: 600;\n      cursor: pointer;\n    }\n.p038-scope .option-item input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p038-scope .right-column { display: flex; flex-direction: column; gap: 12px; }\n.p038-scope .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }\n.p038-scope .action-button {\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      color: #1e293b;\n      border: 1px solid var(--border);\n      border-radius: 11px;\n      background: #fff;\n      font-size: 13px;\n      font-weight: 700;\n      transition: 0.16s ease;\n    }\n.p038-scope .action-button:hover { transform: translateY(-1px); border-color: #93c5fd; background: var(--primary-soft); }\n.p038-scope .action-button.search {\n      grid-column: 1 / -1;\n      min-height: 52px;\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 10px 22px rgba(37, 99, 235, 0.28);\n      font-size: 14px;\n    }\n.p038-scope .action-button.search:hover { filter: brightness(1.06); }\n.p038-scope .condition-box {\n      flex: 1;\n      padding: 12px 14px;\n      border: 1px solid #c9d8ec;\n      border-radius: 12px;\n      background: rgba(255, 255, 255, 0.85);\n      color: #334155;\n      font-size: 12px;\n      line-height: 1.75;\n    }\n.p038-scope .condition-box h3 {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      margin-bottom: 4px;\n      color: #1e3a8a;\n      font-size: 12px;\n    }\n.p038-scope .condition-box h3 svg { width: 14px; height: 14px; }\n.p038-scope .condition-box b { color: var(--primary-dark); }\n.p038-scope .panel {\n      display: flex;\n      min-height: 460px;\n      flex: 1;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: var(--shadow);\n    }\n.p038-scope .panel-header {\n      display: flex;\n      min-height: 60px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 10px 15px;\n      border-bottom: 1px solid var(--border);\n    }\n.p038-scope .panel-heading { display: flex; min-width: 0; align-items: center; gap: 10px; }\n.p038-scope .panel-icon {\n      display: grid;\n      width: 36px;\n      height: 36px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--primary);\n      border-radius: 10px;\n      background: var(--primary-soft);\n    }\n.p038-scope .panel-title h2 { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }\n.p038-scope .panel-title p {\n      overflow: hidden;\n      margin-top: 1px;\n      color: var(--muted);\n      font-size: 11px;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n.p038-scope .badge {\n      padding: 5px 10px;\n      color: var(--primary-dark);\n      border-radius: 999px;\n      background: #dbeafe;\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p038-scope .table-container { min-height: 0; flex: 1; overflow: auto; }\n.p038-scope table.data {\n      width: 100%;\n      min-width: 1380px;\n      border-collapse: separate;\n      border-spacing: 0;\n      white-space: nowrap;\n    }\n.p038-scope table.data th {\n      position: sticky;\n      top: 0;\n      z-index: 2;\n      padding: 11px 12px;\n      color: #475569;\n      border-bottom: 1px solid var(--border);\n      background: var(--surface-soft);\n      box-shadow: inset 0 -1px var(--border);\n      font-size: 12px;\n      font-weight: 700;\n      text-align: left;\n      user-select: none;\n    }\n.p038-scope table.data th.sortable { cursor: pointer; }\n.p038-scope table.data th.sortable:hover { color: var(--primary); background: #f1f5f9; }\n.p038-scope table.data th.sorted { color: var(--primary-dark); background: #e0ecff; }\n.p038-scope table.data td {\n      max-width: 360px;\n      overflow: hidden;\n      padding: 9px 12px;\n      border-bottom: 1px solid #edf1f6;\n      font-size: 12.5px;\n      text-overflow: ellipsis;\n    }\n.p038-scope th.center, .p038-scope td.center { text-align: center; }\n.p038-scope th.number, .p038-scope td.number { text-align: right; font-family: Arial, sans-serif; }\n.p038-scope table.data tbody tr { cursor: pointer; transition: 0.14s ease; }\n.p038-scope table.data tbody tr:nth-child(even) { background: #fbfdff; }\n.p038-scope table.data tbody tr:hover { background: #f0f7ff; }\n.p038-scope table.data tbody tr.checked { background: #eef6ff; }\n.p038-scope table.data tbody tr.current { background: #dbeafe; box-shadow: inset 4px 0 var(--primary); }\n.p038-scope .check-cell { width: 42px; text-align: center; }\n.p038-scope .check-cell input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p038-scope .group-code { color: #334155; font-family: Arial, sans-serif; font-weight: 700; }\n.p038-scope .product-code { color: var(--primary-dark); font-family: Arial, sans-serif; font-weight: 700; }\n.p038-scope .qty-tag {\n      display: inline-flex;\n      min-width: 56px;\n      justify-content: flex-end;\n      padding: 2px 8px;\n      border-radius: 7px;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    }\n.p038-scope .qty-tag.pending { color: #b91c1c; background: #fee2e2; }\n.p038-scope .qty-tag.reserve { color: #1d4ed8; background: #dbeafe; }\n.p038-scope .zero { color: #94a3b8; }\n.p038-scope .stock-ok { color: #047857; font-weight: 700; }\n.p038-scope .unit-tag {\n      display: inline-flex;\n      padding: 2px 9px;\n      color: #475569;\n      border-radius: 6px;\n      background: #e2e8f0;\n      font-size: 11px;\n      font-weight: 700;\n    }\n.p038-scope .empty-state {\n      display: none;\n      min-height: 280px;\n      flex: 1;\n      align-items: center;\n      justify-content: center;\n      color: var(--muted);\n      text-align: center;\n    }\n.p038-scope .empty-state.show { display: flex; }\n.p038-scope .table-footer {\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 8px 15px;\n      color: var(--muted);\n      border-top: 1px solid var(--border);\n      background: var(--surface-soft);\n      font-size: 12px;\n    }\n.p038-scope .footer-totals { display: flex; flex-wrap: wrap; gap: 8px; }\n.p038-scope .footer-total {\n      display: flex;\n      align-items: center;\n      gap: 7px;\n      padding: 6px 11px;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 9px;\n      background: #fff;\n    }\n.p038-scope .footer-total strong { color: var(--primary-dark); font-family: Arial, sans-serif; }\n.p038-scope .toast {\n      position: fixed;\n      right: 20px;\n      bottom: 20px;\n      z-index: 50;\n      display: flex;\n      visibility: hidden;\n      align-items: center;\n      gap: 8px;\n      padding: 11px 14px;\n      color: #fff;\n      border-radius: 11px;\n      opacity: 0;\n      background: #0f172a;\n      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.28);\n      font-size: 12px;\n      transform: translateY(12px);\n      transition: 0.2s ease;\n    }\n.p038-scope .toast.show { visibility: visible; opacity: 1; transform: translateY(0); }\n.p038-scope .toast svg { width: 17px; height: 17px; color: #34d399; }\n.p038-scope #p038printArea { display: none; }\n@media print {@page { size: A4 landscape; margin: 8mm; }\n.p038-scope { background: #fff; }\n.p038-scope .app, .p038-scope .toast { display: none !important; }\n.p038-scope #p038printArea { display: block; color: #000; font-family: \"Noto Sans Thai\", sans-serif; }\n.p038-scope #p038printArea h1 { font-size: 16px; text-align: center; }\n.p038-scope #p038printArea .meta { margin: 6px 0 10px; font-size: 10px; line-height: 1.6; }\n.p038-scope #p038printArea table { width: 100%; border-collapse: collapse; }\n.p038-scope #p038printArea th, .p038-scope #p038printArea td {\n        padding: 3px 5px;\n        border: 1px solid #555;\n        font-size: 9px;\n      }\n.p038-scope #p038printArea th { background: #e2e8f0; }\n.p038-scope #p038printArea td.num { text-align: right; }\n.p038-scope #p038printArea tr.group-row td { background: #f1f5f9; font-weight: 700; }\n.p038-scope #p038printArea tr.subtotal td { background: #e2e8f0; font-weight: 700; text-align: right; }\n}\n@media (max-width: 1250px) {.p038-scope .launcher-body { grid-template-columns: 1fr; }\n.p038-scope .option-groups { grid-template-columns: repeat(3, 1fr); }\n}\n@media (max-width: 950px) {\n.p038-scope .row-fields, .p038-scope .row-fields.second { grid-template-columns: 1fr; }\n.p038-scope .date-row { grid-template-columns: 1fr 1fr; }\n.p038-scope .date-check { grid-column: 1 / -1; }\n.p038-scope .date-separator { display: none; }\n}\n@media (max-width: 680px) {.p038-scope .topbar { min-height: 66px; padding: 10px 13px; }\n.p038-scope .brand h1 { font-size: 15px; }\n.p038-scope .brand p, .p038-scope .system-status { display: none; }\n.p038-scope .content { padding: 12px; }\n.p038-scope .option-groups { grid-template-columns: 1fr; }\n.p038-scope .panel-header, .p038-scope .table-footer { align-items: flex-start; flex-direction: column; }\n}\n\n.p038-scope .panel-header .action-buttons { display: flex; gap: 8px; }\n.p038-scope .panel-header .action-button { min-height: 38px; padding: 0 12px; border-radius: 9px; font-size: 12px; }\n.p038-scope .panel-header .action-button svg { width: 16px; height: 16px; }\n";

  var HTML = "<div class=\"p038-scope\">\n<div class=\"app\" style=\"min-height:0\">\n    <main class=\"content\">\n      <section class=\"launcher-card\">\n\n        <form class=\"launcher-body\" id=\"p038filterForm\">\n          <div class=\"left-column\">\n            <div class=\"row-fields\">\n              <div class=\"field\">\n                <label class=\"field-label\" for=\"searchBy\">ค้นหาจาก</label>\n                <div class=\"input-wrap\">\n                  <select id=\"p038searchBy\">\n                    <option value=\"group\" selected>กลุ่มสินค้า</option>\n                    <option value=\"code\">รหัสสินค้า</option>\n                    <option value=\"name\">ชื่อสินค้า</option>\n                  </select>\n                  <svg viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"></path></svg>\n                </div>\n              </div>\n\n              <div class=\"field\">\n                <label class=\"field-label\" for=\"searchText\">คำค้นหา</label>\n                <div class=\"input-wrap\">\n                  <input id=\"p038searchText\" type=\"text\" value=\"1001-\" autocomplete=\"off\">\n                </div>\n              </div>\n            </div>\n\n            <div class=\"row-fields second\">\n              <div class=\"field\">\n                <label class=\"field-label\" for=\"warehouseInput\">คลังสินค้า</label>\n                <div class=\"input-wrap\">\n                  <input id=\"p038warehouseInput\" type=\"text\" value=\"01,01-B,01-CL,03,04-1\" autocomplete=\"off\">\n                </div>\n              </div>\n\n              <div class=\"field\">\n                <label class=\"field-label\">ช่วงวันที่ซื้อขาย</label>\n                <div class=\"date-row\">\n                  <label class=\"date-check\">\n                    <input id=\"p038useDate\" type=\"checkbox\">\n                    วันที่\n                  </label>\n\n                  <div class=\"input-wrap\">\n                    <input id=\"p038dateFrom\" type=\"date\" value=\"2026-10-26\" disabled>\n                  </div>\n\n                  <span class=\"date-separator\">ถึง</span>\n\n                  <div class=\"input-wrap\">\n                    <input id=\"p038dateTo\" type=\"date\" value=\"2026-10-26\" disabled>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"option-groups\" id=\"p038optionGroups\"></div>\n          </div>\n\n          <div class=\"right-column\">\n            <div class=\"action-buttons\">\n              <button class=\"action-button search\" type=\"submit\">\n                <svg viewBox=\"0 0 24 24\">\n                  <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n                  <path d=\"m21 21-4.35-4.35\"></path>\n                </svg>\n                ค้นหา\n              </button>\n            </div>\n\n            \n\n            <div class=\"condition-box\">\n              <h3>\n                <svg viewBox=\"0 0 24 24\">\n                  <path d=\"M22 3H2l8 9.46V19l4 2v-8.54L22 3z\"></path>\n                </svg>\n                เงื่อนไขที่ใช้ค้นหา\n              </h3>\n              <div id=\"p038conditionText\"></div>\n            </div>\n          </div>\n        </form>\n      </section>\n\n      <section class=\"panel\">\n        <div class=\"panel-header\">\n          <div class=\"panel-heading\">\n            <div class=\"panel-icon\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M3 3h18v18H3z\"></path>\n                <path d=\"M3 9h18M9 3v18\"></path>\n              </svg>\n            </div>\n\n            <div class=\"panel-title\">\n              <h2>รายการสินค้าค้างส่ง / จอง</h2>\n              <p id=\"p038panelSubtitle\">คลิกแถวเพื่อเลือกแถวปัจจุบัน ติ๊กช่องซ้ายเพื่อเลือกพิมพ์</p>\n            </div>\n          </div>\n\n          <span class=\"badge\" id=\"p038resultBadge\">0 รายการ</span>\n        \n            <div class=\"action-buttons\">\n              <button class=\"action-button\" id=\"p038printButton\" type=\"button\">\n                <svg viewBox=\"0 0 24 24\">\n                  <path d=\"M6 9V2h12v7\"></path>\n                  <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path>\n                  <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n                </svg>\n                Print\n              </button>\n\n              <button class=\"action-button\" id=\"p038printNewButton\" type=\"button\">\n                <svg viewBox=\"0 0 24 24\">\n                  <path d=\"M6 9V2h12v7\"></path>\n                  <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path>\n                  <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n                </svg>\n                Print ใหม่\n              </button>\n            </div></div>\n\n        <div class=\"table-container\" id=\"p038tableContainer\">\n          <table class=\"data\">\n            <thead>\n              <tr>\n                <th class=\"check-cell\"><input id=\"p038selectAll\" type=\"checkbox\" aria-label=\"เลือกทั้งหมด\"></th>\n                <th class=\"sortable center\" data-sort=\"date\">วันที่ซื้อขาย <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"groupCode\">รหัสกลุ่มสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"productCode\">รหัสสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"name\">ชื่อสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"pending\">จำนวนค้างส่ง <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"reserved\">จำนวนที่จอง <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"pr\">PR <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock01Total\">คงเหลือ[01]+[01-CL]+[01-B] <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock03\">คงเหลือ [03] <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock04Total\">คงเหลือ [04-1]+[04-2] <span class=\"arrow\"></span></th>\n                <th class=\"center\">หน่วยนับ</th>\n              </tr>\n            </thead>\n            <tbody id=\"p038resultRows\"></tbody>\n          </table>\n        </div>\n\n        <div class=\"empty-state\" id=\"p038emptyState\">\n          <div>\n            <svg viewBox=\"0 0 24 24\" style=\"width:48px;height:48px;margin:0 auto 10px\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n              <path d=\"m21 21-4.35-4.35M8 11h6\"></path>\n            </svg>\n            <strong>ไม่พบรายการตามเงื่อนไขที่เลือก</strong>\n            <p style=\"margin-top:5px;font-size:11px\">ลองปรับเงื่อนไขการค้นหา หรือเลือกตัวเลือก \"ทั้งหมด\"</p>\n          </div>\n        </div>\n\n        <div class=\"table-footer\">\n          <span id=\"p038footerText\">แสดง 0 รายการ</span>\n\n          <div class=\"footer-totals\">\n            <div class=\"footer-total\">ค้างส่งรวม <strong id=\"p038footerPending\">0.00</strong></div>\n            <div class=\"footer-total\">จองรวม <strong id=\"p038footerReserve\">0.00</strong></div>\n          </div>\n        </div>\n      </section>\n    </main>\n</div>\n<div id=\"p038printArea\"></div>\n<div class=\"toast\" id=\"p038toast\">\n    <svg viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"></path></svg>\n    <span id=\"p038toastMessage\">ดำเนินการเรียบร้อยแล้ว</span>\n  </div>\n</div>\n";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, t) { var e = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { var l, n, i, a, u = [], o = !0, f = !1; try { if (i = (e = e.call(r)).next, 0 === t) { if (Object(e) !== e) return; o = !1; } else for (; !(o = (l = i.call(e)).done) && (u.push(l.value), u.length !== t); o = !0); } catch (r) { f = !0, n = r; } finally { try { if (!o && null != e.return && (a = e.return(), Object(a) !== a)) return; } finally { if (f) throw n; } } return u; } }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
/* ===== ข้อมูลตัวอย่าง (แทนที่ด้วยข้อมูลจริงจาก API/ฐานข้อมูลได้) ===== */
var rawItems = [{
  date: "2026-10-01",
  groupCode: "1001-0312",
  productCode: "10010249",
  name: "กรองแสง-3เข็ม(ไก่ชน-MCT) 70% เขียว 2*90m [Ea]",
  pending: 0,
  reserved: 1,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-02",
  groupCode: "1001-0312",
  productCode: "10010247",
  name: "กรองแสง-3เข็ม(ไก่ชน-MCT) 50% เขียว 2*90m [2Ea/มัด]",
  pending: 0,
  reserved: 10,
  pr: 0,
  s01: [37, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-13",
  groupCode: "1001-0970",
  productCode: "10011186",
  name: "กรองแสงผ่น-6เข็ม-เจาะตาไก่ 90% ดำ 2*5m [Ea]",
  pending: 0,
  reserved: 10,
  pr: 0,
  s01: [18, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-17",
  groupCode: "1001-0415",
  productCode: "10010472",
  name: "กรองแสง-1เข็มล็อคตา(No1-MCT) 80% เขียว 2*50m [2Ea/มัด]",
  pending: 0,
  reserved: 2,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-17",
  groupCode: "1001-0415",
  productCode: "10010468",
  name: "กรองแสง-1เข็มล็อคตา(No1-MCT) 80% ดำ 2*50m [2Ea/มัด]",
  pending: 0,
  reserved: 2,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-23",
  groupCode: "1001-0905",
  productCode: "10010562",
  name: "กรองแสงผ่น-1เข็มล็อคตา(No1-MCT) 80% ดำ 2*10m [5Ea/Bag]",
  pending: 0,
  reserved: 22,
  pr: 0,
  s01: [144, 1, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-24",
  groupCode: "1001-0414",
  productCode: "10010462",
  name: "กรองแสง-1เข็มล็อคตา(No1-MCT) 80% เขียว 2*70m [Ea]",
  pending: 0,
  reserved: 7,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-24",
  groupCode: "1001-0303",
  productCode: "10011241",
  name: "กรองแสง-3เข็ม(ไก่แจ้-MCT) 60% เขียว 1*80m [2Ea/มัด]",
  pending: 0,
  reserved: 2,
  pr: 0,
  s01: [18, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-26",
  groupCode: "1001-0905",
  productCode: "10010566",
  name: "กรองแสงผ่น-1เข็มล็อคตา(No1-MCT) 80% ดำ 2*10m [5Ea/Bag]",
  pending: 5,
  reserved: 27,
  pr: 0,
  s01: [2, 0, 0],
  s03: 14,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-26",
  groupCode: "1001-0932",
  productCode: "10011361",
  name: "กรองแสงผ่น-3เข็ม(แรด) 60% ดำ 2*10m [5Ea/Bag]",
  pending: 0,
  reserved: 300,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-26",
  groupCode: "1001-0931",
  productCode: "10011359",
  name: "กรองแสงผ่น-3เข็ม(แรด) 80% เขียว 2*5m [10Ea/Bag]",
  pending: 0,
  reserved: 900,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-26",
  groupCode: "1001-0934",
  productCode: "10011380",
  name: "กรองแสงผ่น-3เข็ม(แรด) 50% เขียว 2*20m [5Ea/Bag]",
  pending: 0,
  reserved: 200,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, {
  date: "2026-10-26",
  groupCode: "1001-0932",
  productCode: "10011367",
  name: "กรองแสงผ่น-3เข็ม(แรด) 80% ดำ 2*10m [5Ea/Bag]",
  pending: 0,
  reserved: 450,
  pr: 0,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "31"
}, /* ตัวอย่างเพิ่มเติมสถานะ 14 (รอโอน) เพื่อทดสอบการยกเว้นสถานะ และรายการไม่มีเบิก/จอง */
{
  date: "2026-10-20",
  groupCode: "1001-0210",
  productCode: "10010901",
  name: "กรองแสงผ่น-3เข็ม(แรด) 70% ดำ 2*30m [5Ea/Bag]",
  pending: 12,
  reserved: 40,
  pr: 0,
  s01: [0, 0, 0],
  s03: 6,
  s04: [4, 0],
  unit: "Ea",
  status: "14"
}, {
  date: "2026-10-21",
  groupCode: "1001-0210",
  productCode: "10010903",
  name: "กรองแสงผ่น-3เข็ม(แรด) 70% เขียว 2*30m [5Ea/Bag]",
  pending: 0,
  reserved: 15,
  pr: 0,
  s01: [8, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "14"
}, {
  date: "2026-10-22",
  groupCode: "1001-0150",
  productCode: "10010120",
  name: "กรองแสง-1เข็มล็อคตา(No1-MCT) 50% ดำ 2*100m [Ea]",
  pending: 3,
  reserved: 0,
  pr: 20,
  s01: [0, 0, 0],
  s03: 0,
  s04: [0, 0],
  unit: "Ea",
  status: "00"
}];
var items = rawItems.map(function (item, index) {
  return _objectSpread(_objectSpread({}, item), {}, {
    id: index + 1,
    stock01Total: item.s01.reduce(function (a, b) {
      return a + b;
    }, 0),
    stock04Total: item.s04.reduce(function (a, b) {
      return a + b;
    }, 0)
  });
});

/* ===== ตัวเลือก Radio ===== */
var radioGroups = [{
  key: "pending",
  title: "ค้างส่ง",
  options: [["has", "มีค้างส่ง"], ["none", "ไม่มีค้างส่ง"], ["all", "ทั้งหมด"]],
  def: "all"
}, {
  key: "reserve",
  title: "เบิก/จอง",
  options: [["has", "มีเบิก/จอง"], ["none", "ไม่มีเบิก/จอง"], ["all", "ทั้งหมด"]],
  def: "has"
}, {
  key: "stock01",
  title: "สินค้าคงคลัง [01]",
  options: [["has", "มีสินค้า"], ["none", "ไม่มีสินค้า"], ["all", "ทั้งหมด"]],
  def: "all"
}, {
  key: "stock02",
  title: "สินค้าคงคลัง [02]",
  options: [["has", "มีสินค้า"], ["none", "ไม่มีสินค้า"], ["all", "ทั้งหมด"]],
  def: "all"
}];
var statusOptions = [{
  value: "14",
  label: "14 : รอโอน",
  checked: false
}, {
  value: "31",
  label: "31 : รอแจ้งส่ง",
  checked: true
}];
var els;;
var currentItems = [];
var appliedFilters = null;
var sortField = "date";
var sortDirection = "asc";
var currentId = null;
var selectedIds = new Set();
var toastTimer;

/* ===== Utilities ===== */
var numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
var formatNumber = function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
};
function formatDate(value) {
  var _value$split = value.split("-"),
    _value$split2 = _slicedToArray(_value$split, 3),
    year = _value$split2[0],
    month = _value$split2[1],
    day = _value$split2[2];
  return "".concat(day, "/").concat(month, "/").concat(year);
}
function escapeHTML(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function showToast(message) {
  var toast = document.getElementById("p038toast");
  document.getElementById("p038toastMessage").textContent = message;
  clearTimeout(toastTimer);
  toast.classList.add("show");
  toastTimer = setTimeout(function () {
    return toast.classList.remove("show");
  }, 2000);
}

/* ===== สร้างกลุ่มตัวเลือก ===== */
function buildOptionGroups() {
  var radioHTML = radioGroups.map(function (group) {
    return "\n        <div class=\"option-card\">\n          <h3>".concat(group.title, "</h3>\n          <div class=\"option-list\">\n            ").concat(group.options.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        value = _ref2[0],
        label = _ref2[1];
      return "\n              <label class=\"option-item\">\n                <input type=\"radio\" name=\"".concat(group.key, "\" value=\"").concat(value, "\" ").concat(value === group.def ? "checked" : "", ">\n                ").concat(label, "\n              </label>\n            ");
    }).join(""), "\n          </div>\n        </div>\n      ");
  }).join("");
  var statusHTML = "\n        <div class=\"option-card\">\n          <h3>\u0E2A\u0E16\u0E32\u0E19\u0E30</h3>\n          <div class=\"option-list\">\n            <label class=\"option-item\">\n              <input type=\"checkbox\" id=\"p038statusAll\" checked>\n              \u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14\n            </label>\n            ".concat(statusOptions.map(function (option) {
    return "\n              <label class=\"option-item\">\n                <input type=\"checkbox\" class=\"status-item\" value=\"".concat(option.value, "\" ").concat(option.checked ? "checked" : "", ">\n                ").concat(option.label, "\n              </label>\n            ");
  }).join(""), "\n          </div>\n        </div>\n      ");
  els.optionGroups.innerHTML = radioHTML + statusHTML;
}
function readFilters() {
  var radios = {};
  radioGroups.forEach(function (group) {
    radios[group.key] = document.querySelector("input[name=\"".concat(group.key, "\"]:checked")).value;
  });
  var statusAll = document.getElementById("p038statusAll").checked;
  var statusChecks = _toConsumableArray(document.querySelectorAll(".status-item")).map(function (input) {
    return {
      value: input.value,
      checked: input.checked
    };
  });
  return _objectSpread(_objectSpread({
    searchBy: document.getElementById("p038searchBy").value,
    searchText: document.getElementById("p038searchText").value.trim().toLowerCase(),
    warehouse: document.getElementById("p038warehouseInput").value.trim(),
    useDate: els.useDate.checked,
    dateFrom: els.dateFrom.value,
    dateTo: els.dateTo.value
  }, radios), {}, {
    statusAll: statusAll,
    statusChecks: statusChecks
  });
}

/* ===== Filter logic ===== */
function matchTri(mode, hasValue) {
  if (mode === "all") return true;
  return mode === "has" ? hasValue : !hasValue;
}
function matchStatus(item, filters) {
  var checkedValues = filters.statusChecks.filter(function (s) {
    return s.checked;
  }).map(function (s) {
    return s.value;
  });
  var uncheckedValues = filters.statusChecks.filter(function (s) {
    return !s.checked;
  }).map(function (s) {
    return s.value;
  });

  // "ทั้งหมด" = แสดงทุกสถานะ ยกเว้นสถานะที่ไม่ได้ติ๊ก
  if (filters.statusAll) return !uncheckedValues.includes(item.status);
  return checkedValues.includes(item.status);
}
function matchSearch(item, filters) {
  if (!filters.searchText) return true;
  var target = {
    group: item.groupCode,
    code: item.productCode,
    name: item.name
  }[filters.searchBy].toLowerCase();
  return filters.searchBy === "name" ? target.includes(filters.searchText) : target.startsWith(filters.searchText) || target.includes(filters.searchText);
}
function filterItems(filters) {
  return items.filter(function (item) {
    var matchDate = !filters.useDate || (!filters.dateFrom || item.date >= filters.dateFrom) && (!filters.dateTo || item.date <= filters.dateTo);
    return matchDate && matchSearch(item, filters) && matchTri(filters.pending, item.pending > 0) && matchTri(filters.reserve, item.reserved > 0) && matchTri(filters.stock01, item.stock01Total > 0) && matchTri(filters.stock02, item.s03 + item.stock04Total > 0) && matchStatus(item, filters);
  });
}
function sortItems(list) {
  return _toConsumableArray(list).sort(function (a, b) {
    var first = a[sortField];
    var second = b[sortField];
    if (typeof first === "string") {
      first = first.toLocaleLowerCase("th");
      second = second.toLocaleLowerCase("th");
    }
    if (first < second) return sortDirection === "asc" ? -1 : 1;
    if (first > second) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

/* ===== Render ===== */
function conditionLabel(group, value) {
  return group.options.find(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 1),
      key = _ref4[0];
    return key === value;
  })[1];
}
function renderConditions(filters) {
  var lines = radioGroups.map(function (group) {
    return "".concat(group.title, " : <b>").concat(conditionLabel(group, filters[group.key]), "</b>");
  });
  var excluded = filters.statusChecks.filter(function (s) {
    return !s.checked;
  }).map(function (s) {
    return s.value;
  });
  var included = filters.statusChecks.filter(function (s) {
    return s.checked;
  }).map(function (s) {
    return s.value;
  });
  var statusText = filters.statusAll ? "\u0E17\u0E31\u0E49\u0E07\u0E2B\u0E21\u0E14".concat(excluded.length ? " , \u0E22\u0E01\u0E40\u0E27\u0E49\u0E19 ".concat(excluded.join(", ")) : "") : included.length ? included.join(", ") : "ไม่เลือก";
  lines.push("\u0E2A\u0E16\u0E32\u0E19\u0E30 : <b>".concat(statusText, "</b>"));
  if (filters.warehouse) lines.push("\u0E04\u0E25\u0E31\u0E07 : <b>".concat(escapeHTML(filters.warehouse), "</b>"));
  if (filters.useDate) lines.push("\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 : <b>".concat(formatDate(filters.dateFrom), " - ").concat(formatDate(filters.dateTo), "</b>"));
  document.getElementById("p038conditionText").innerHTML = lines.join("<br>");
}
function qtyCell(value, cls) {
  return value > 0 ? "<span class=\"qty-tag ".concat(cls, "\">").concat(formatNumber(value), "</span>") : "<span class=\"zero\">".concat(formatNumber(value), "</span>");
}
function updateSummary(list) {
  var pending = list.reduce(function (sum, item) {
    return sum + item.pending;
  }, 0);
  var reserved = list.reduce(function (sum, item) {
    return sum + item.reserved;
  }, 0);
  document.getElementById("p038footerPending").textContent = formatNumber(pending);
  document.getElementById("p038footerReserve").textContent = formatNumber(reserved);
  document.getElementById("p038resultBadge").textContent = "".concat(list.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  document.getElementById("p038footerText").textContent = "\u0E41\u0E2A\u0E14\u0E07 ".concat(list.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
}
function updateSelection() {
  var visibleSelected = currentItems.filter(function (item) {
    return selectedIds.has(item.id);
  }).length;
  var allSelected = currentItems.length > 0 && visibleSelected === currentItems.length;
  els.selectAll.checked = allSelected;
  els.selectAll.indeterminate = !allSelected && visibleSelected > 0;
}
function updateSortIndicators() {
  document.querySelectorAll("th[data-sort]").forEach(function (header) {
    var isActive = header.dataset.sort === sortField;
    header.classList.toggle("sorted", isActive);
    header.querySelector(".arrow").textContent = isActive ? sortDirection === "asc" ? "▲" : "▼" : "";
  });
}
function renderRows() {
  var sorted = sortItems(currentItems);
  els.rows.innerHTML = "";
  updateSummary(sorted);
  updateSortIndicators();
  if (!sorted.length) {
    els.tableContainer.style.display = "none";
    els.emptyState.classList.add("show");
    updateSelection();
    return;
  }
  els.tableContainer.style.display = "block";
  els.emptyState.classList.remove("show");
  if (!sorted.some(function (item) {
    return item.id === currentId;
  })) currentId = sorted[0].id;
  sorted.forEach(function (item) {
    var tr = document.createElement("tr");
    tr.dataset.id = item.id;
    if (selectedIds.has(item.id)) tr.classList.add("checked");
    if (item.id === currentId) tr.classList.add("current");
    tr.innerHTML = "\n          <td class=\"check-cell\">\n            <input type=\"checkbox\" class=\"row-check\" ".concat(selectedIds.has(item.id) ? "checked" : "", ">\n          </td>\n          <td class=\"center\">").concat(formatDate(item.date), "</td>\n          <td class=\"group-code\">").concat(escapeHTML(item.groupCode), "</td>\n          <td class=\"product-code\">").concat(escapeHTML(item.productCode), "</td>\n          <td title=\"").concat(escapeHTML(item.name), "\">").concat(escapeHTML(item.name), "</td>\n          <td class=\"number\">").concat(qtyCell(item.pending, "pending"), "</td>\n          <td class=\"number\">").concat(qtyCell(item.reserved, "reserve"), "</td>\n          <td class=\"number ").concat(item.pr > 0 ? "" : "zero", "\">").concat(formatNumber(item.pr), "</td>\n          <td class=\"number ").concat(item.stock01Total > 0 ? "stock-ok" : "zero", "\">").concat(item.s01.join("+"), "</td>\n          <td class=\"number ").concat(item.s03 > 0 ? "stock-ok" : "zero", "\">").concat(formatNumber(item.s03), "</td>\n          <td class=\"number ").concat(item.stock04Total > 0 ? "stock-ok" : "zero", "\">").concat(item.s04.join("+"), "</td>\n          <td class=\"center\"><span class=\"unit-tag\">").concat(escapeHTML(item.unit), "</span></td>\n        ");
    els.rows.appendChild(tr);
  });
  updateSelection();
}
function search() {
  var showMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  appliedFilters = readFilters();
  currentItems = filterItems(appliedFilters);
  renderConditions(appliedFilters);
  renderRows();
  if (showMessage) showToast("\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 ".concat(currentItems.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"));
}

/* ===== Print ===== */
function printMeta() {
  var now = new Date();
  var pad = function pad(n) {
    return String(n).padStart(2, "0");
  };
  var stamp = "".concat(pad(now.getDate()), "/").concat(pad(now.getMonth() + 1), "/").concat(now.getFullYear(), " ").concat(pad(now.getHours()), ":").concat(pad(now.getMinutes()));
  return "\u0E40\u0E07\u0E37\u0E48\u0E2D\u0E19\u0E44\u0E02: ".concat(document.getElementById("p038conditionText").innerHTML.replaceAll("<br>", " | "), "<br>\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E21\u0E37\u0E48\u0E2D: ").concat(stamp);
}
var printHead = "\n      <thead>\n        <tr>\n          <th>\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E0B\u0E37\u0E49\u0E2D\u0E02\u0E32\u0E22</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E01\u0E25\u0E38\u0E48\u0E21\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th><th>\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th>\n          <th>\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07</th><th>\u0E08\u0E2D\u0E07</th><th>PR</th>\n          <th>[01]+[01-CL]+[01-B]</th><th>[03]</th><th>[04-1]+[04-2]</th><th>\u0E2B\u0E19\u0E48\u0E27\u0E22</th>\n        </tr>\n      </thead>";
function printRow(item) {
  return "\n        <tr>\n          <td>".concat(formatDate(item.date), "</td>\n          <td>").concat(escapeHTML(item.groupCode), "</td>\n          <td>").concat(escapeHTML(item.productCode), "</td>\n          <td>").concat(escapeHTML(item.name), "</td>\n          <td class=\"num\">").concat(formatNumber(item.pending), "</td>\n          <td class=\"num\">").concat(formatNumber(item.reserved), "</td>\n          <td class=\"num\">").concat(formatNumber(item.pr), "</td>\n          <td class=\"num\">").concat(item.s01.join("+"), "</td>\n          <td class=\"num\">").concat(formatNumber(item.s03), "</td>\n          <td class=\"num\">").concat(item.s04.join("+"), "</td>\n          <td>").concat(escapeHTML(item.unit), "</td>\n        </tr>");
}

// Print: พิมพ์รายการที่แสดงอยู่ทั้งหมด
function printAll() {
  var list = sortItems(currentItems);
  if (!list.length) return showToast("ไม่มีข้อมูลสำหรับพิมพ์");
  els.printArea.innerHTML = "\n        <h1>\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</h1>\n        <div class=\"meta\">".concat(printMeta(), "</div>\n        <table>").concat(printHead, "<tbody>").concat(list.map(printRow).join(""), "</tbody></table>");
  window.print();
}

// Print ใหม่: พิมพ์เฉพาะแถวที่ติ๊กเลือก จัดกลุ่มตามรหัสกลุ่มสินค้า พร้อมยอดรวมย่อย
function printNew() {
  var list = sortItems(currentItems.filter(function (item) {
    return selectedIds.has(item.id);
  }));
  if (!list.length) return showToast("กรุณาติ๊กเลือกรายการที่ต้องการพิมพ์ก่อน");
  var groups = new Map();
  list.forEach(function (item) {
    if (!groups.has(item.groupCode)) groups.set(item.groupCode, []);
    groups.get(item.groupCode).push(item);
  });
  var body = _toConsumableArray(groups.entries()).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      code = _ref6[0],
      rows = _ref6[1];
    var pending = rows.reduce(function (s, r) {
      return s + r.pending;
    }, 0);
    var reserved = rows.reduce(function (s, r) {
      return s + r.reserved;
    }, 0);
    return "\n          <tr class=\"group-row\"><td colspan=\"11\">\u0E01\u0E25\u0E38\u0E48\u0E21\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 ".concat(escapeHTML(code), " (").concat(rows.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23)</td></tr>\n          ").concat(rows.map(printRow).join(""), "\n          <tr class=\"subtotal\">\n            <td colspan=\"4\">\u0E23\u0E27\u0E21\u0E01\u0E25\u0E38\u0E48\u0E21 ").concat(escapeHTML(code), "</td>\n            <td>").concat(formatNumber(pending), "</td><td>").concat(formatNumber(reserved), "</td><td colspan=\"5\"></td>\n          </tr>");
  }).join("");
  els.printArea.innerHTML = "\n        <h1>\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 (\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01)</h1>\n        <div class=\"meta\">".concat(printMeta(), "</div>\n        <table>").concat(printHead, "<tbody>").concat(body, "</tbody></table>");
  window.print();
}


function init() {
  els = {
  optionGroups: document.getElementById("p038optionGroups"),
  rows: document.getElementById("p038resultRows"),
  tableContainer: document.getElementById("p038tableContainer"),
  emptyState: document.getElementById("p038emptyState"),
  selectAll: document.getElementById("p038selectAll"),
  useDate: document.getElementById("p038useDate"),
  dateFrom: document.getElementById("p038dateFrom"),
  dateTo: document.getElementById("p038dateTo"),
  printArea: document.getElementById("p038printArea")
};
/* ===== Events ===== */
document.getElementById("p038filterForm").addEventListener("submit", function (event) {
  event.preventDefault();
  search(true);
});
els.useDate.addEventListener("change", function () {
  els.dateFrom.disabled = !els.useDate.checked;
  els.dateTo.disabled = !els.useDate.checked;
});

// สถานะ: "ทั้งหมด" ติ๊ก/ไม่ติ๊ก ทุกตัว, ติ๊กย่อยไม่ครบจะยังคง "ทั้งหมด" ไว้ (ใช้แบบยกเว้น)
els.optionGroups.addEventListener("change", function (event) {
  if (event.target.id === "p038statusAll") {
    document.querySelectorAll(".status-item").forEach(function (input) {
      input.checked = event.target.checked;
    });
  }
});
els.rows.addEventListener("click", function (event) {
  var tr = event.target.closest("tr");
  if (!tr) return;
  var id = Number(tr.dataset.id);
  if (event.target.classList.contains("row-check")) {
    event.target.checked ? selectedIds.add(id) : selectedIds.delete(id);
  } else {
    currentId = id;
  }
  renderRows();
});
els.selectAll.addEventListener("change", function () {
  currentItems.forEach(function (item) {
    els.selectAll.checked ? selectedIds.add(item.id) : selectedIds.delete(item.id);
  });
  renderRows();
});
document.querySelectorAll("th[data-sort]").forEach(function (header) {
  header.addEventListener("click", function () {
    var field = header.dataset.sort;
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "asc";
    }
    renderRows();
  });
});
document.getElementById("p038printButton").addEventListener("click", printAll);
document.getElementById("p038printNewButton").addEventListener("click", printNew);

/* ===== Init ===== */
buildOptionGroups();
search(false);
}

  function mount(mountEl) {
    var old = document.getElementById("p038Style");
    if (!old) { old = document.createElement("style"); old.id = "p038Style"; document.head.appendChild(old); }
    old.textContent = CSS;
    mountEl.innerHTML = HTML;
    init();
  }

  window.P038PushPending = { mount: mount };
})();
