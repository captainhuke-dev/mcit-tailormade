/* P038 — ตรวจสอบค้างส่งผลักดันสินค้า
   UI clone demo/P038_demo.html (mock data — รอ API)
   (IIFE — window.P038PushPending = { mount })
*/
(function () {
  "use strict";

  var CSS = ".p038-scope {\n      --primary: #2563eb;\n      --primary-dark: #1d4ed8;\n      --primary-soft: #eff6ff;\n      --success: #059669;\n      --success-soft: #ecfdf5;\n      --warning: #d97706;\n      --warning-soft: #fffbeb;\n      --danger: #dc2626;\n      --danger-soft: #fef2f2;\n      --purple: #7c3aed;\n      --purple-soft: #f5f3ff;\n      --bg: #f3f6fb;\n      --surface: #ffffff;\n      --surface-soft: #f8fafc;\n      --text: #172033;\n      --muted: #64748b;\n      --border: #dbe3ef;\n      --radius: 16px;\n      --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);\n    }\n.p038-scope * { box-sizing: border-box; margin: 0; padding: 0; }\n.p038-scope {\n      min-height: 100vh;\n      color: var(--text);\n      background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30%), var(--bg);\n      font-family: \"Noto Sans Thai\", sans-serif;\n    }\n.p038-scope button, .p038-scope input, .p038-scope select { font: inherit; }\n.p038-scope button { cursor: pointer; }\n.p038-scope button:focus-visible, .p038-scope input:focus-visible, .p038-scope select:focus-visible {\n      outline: 3px solid rgba(37, 99, 235, 0.2);\n      outline-offset: 2px;\n    }\n.p038-scope svg {\n      display: block;\n      width: 20px;\n      height: 20px;\n      fill: none;\n      stroke: currentColor;\n      stroke-linecap: round;\n      stroke-linejoin: round;\n      stroke-width: 2;\n    }\n.p038-scope .app { display: flex; min-height: 100vh; flex-direction: column; }\n.p038-scope .topbar {\n      position: sticky;\n      top: 0;\n      z-index: 20;\n      display: flex;\n      min-height: 72px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 16px;\n      padding: 12px 22px;\n      border-bottom: 1px solid var(--border);\n      background: rgba(255, 255, 255, 0.95);\n      box-shadow: 0 3px 16px rgba(15, 23, 42, 0.04);\n      backdrop-filter: blur(14px);\n    }\n.p038-scope .brand { display: flex; min-width: 0; align-items: center; gap: 12px; }\n.p038-scope .brand-icon {\n      display: grid;\n      width: 46px;\n      height: 46px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: #fff;\n      border-radius: 14px;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 9px 22px rgba(37, 99, 235, 0.25);\n    }\n.p038-scope .brand h1 { overflow: hidden; font-size: 19px; text-overflow: ellipsis; white-space: nowrap; }\n.p038-scope .brand p { margin-top: 2px; color: var(--muted); font-size: 12px; }\n.p038-scope .system-status {\n      display: inline-flex;\n      height: 40px;\n      align-items: center;\n      gap: 8px;\n      padding: 0 12px;\n      color: var(--success);\n      border: 1px solid #a7f3d0;\n      border-radius: 11px;\n      background: var(--success-soft);\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p038-scope .status-dot {\n      width: 7px;\n      height: 7px;\n      border-radius: 50%;\n      background: #10b981;\n      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);\n    }\n.p038-scope .content {\n      display: flex;\n      width: 100%;\n      max-width: 1800px;\n      flex: 1;\n      flex-direction: column;\n      gap: 14px;\n      margin: 0 auto;\n      padding: 18px 22px 24px;\n    }\n.p038-scope .launcher-card {\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);\n    }\n.p038-scope .launcher-titlebar {\n      display: flex;\n      min-height: 44px;\n      align-items: center;\n      justify-content: space-between;\n      padding: 0 8px 0 16px;\n      background: linear-gradient(90deg, #1e3a8a, #1d4ed8);\n    }\n.p038-scope .launcher-titlebar span {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      color: #fff;\n      font-size: 14px;\n      font-weight: 700;\n    }\n.p038-scope .launcher-titlebar span svg { width: 17px; height: 17px; }\n.p038-scope .titlebar-close {\n      display: grid;\n      width: 32px;\n      height: 32px;\n      place-items: center;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--danger);\n    }\n.p038-scope .titlebar-close:hover { background: #b91c1c; }\n.p038-scope .titlebar-close svg { width: 15px; height: 15px; }\n.p038-scope .launcher-body {\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) 264px;\n      gap: 18px;\n      padding: 18px 20px 20px;\n      background: linear-gradient(180deg, #eaf2ff, #f3f8ff);\n    }\n.p038-scope .left-column { display: flex; flex-direction: column; gap: 14px; min-width: 0; }\n.p038-scope .row-fields {\n      display: grid;\n      grid-template-columns: 190px minmax(0, 1fr);\n      gap: 12px;\n      align-items: end;\n    }\n.p038-scope .row-fields.second { grid-template-columns: minmax(200px, 1fr) minmax(0, 1.4fr); }\n.p038-scope .field label.field-label {\n      display: block;\n      margin-bottom: 7px;\n      color: #334155;\n      font-size: 12px;\n      font-weight: 700;\n    }\n.p038-scope .input-wrap { position: relative; }\n.p038-scope .input-wrap svg {\n      position: absolute;\n      top: 50%;\n      right: 12px;\n      width: 17px;\n      height: 17px;\n      color: #94a3b8;\n      transform: translateY(-50%);\n      pointer-events: none;\n    }\n.p038-scope .input-wrap input, .p038-scope .input-wrap select {\n      width: 100%;\n      height: 42px;\n      padding: 0 12px;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 10px;\n      outline: none;\n      background: #fff;\n      font-size: 13px;\n    }\n.p038-scope .input-wrap select { cursor: pointer; appearance: none; padding-right: 36px; }\n.p038-scope .input-wrap input:focus, .p038-scope .input-wrap select:focus {\n      border-color: #60a5fa;\n      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);\n    }\n.p038-scope .input-wrap input:disabled { color: #94a3b8; background: #eef2f7; cursor: not-allowed; }\n.p038-scope .date-row {\n      display: grid;\n      grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);\n      gap: 9px;\n      align-items: center;\n    }\n.p038-scope .date-check {\n      display: flex;\n      align-items: center;\n      gap: 7px;\n      color: #334155;\n      font-size: 13px;\n      font-weight: 700;\n      white-space: nowrap;\n      cursor: pointer;\n    }\n.p038-scope .date-check input { width: 17px; height: 17px; accent-color: var(--primary); }\n.p038-scope .date-separator { color: #475569; font-size: 12px; font-weight: 700; }\n.p038-scope .option-groups {\n      display: grid;\n      grid-template-columns: repeat(5, minmax(150px, 1fr));\n      gap: 10px;\n    }\n.p038-scope .option-card {\n      padding: 11px 13px;\n      border: 1px solid #c9d8ec;\n      border-radius: 12px;\n      background: rgba(255, 255, 255, 0.8);\n    }\n.p038-scope .option-card h3 { margin-bottom: 8px; color: #1e3a8a; font-size: 12px; }\n.p038-scope .option-list { display: flex; flex-direction: column; gap: 6px; }\n.p038-scope .option-item {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      font-size: 12.5px;\n      font-weight: 600;\n      cursor: pointer;\n    }\n.p038-scope .option-item input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p038-scope .right-column { display: flex; flex-direction: column; gap: 12px; }\n.p038-scope .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }\n.p038-scope .action-button {\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      color: #1e293b;\n      border: 1px solid var(--border);\n      border-radius: 11px;\n      background: #fff;\n      font-size: 13px;\n      font-weight: 700;\n      transition: 0.16s ease;\n    }\n.p038-scope .action-button:hover { transform: translateY(-1px); border-color: #93c5fd; background: var(--primary-soft); }\n.p038-scope .action-button.search {\n      grid-column: 1 / -1;\n      min-height: 52px;\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 10px 22px rgba(37, 99, 235, 0.28);\n      font-size: 14px;\n    }\n.p038-scope .action-button.search:hover { filter: brightness(1.06); }\n.p038-scope .condition-box {\n      flex: 1;\n      padding: 12px 14px;\n      border: 1px solid #c9d8ec;\n      border-radius: 12px;\n      background: rgba(255, 255, 255, 0.85);\n      color: #334155;\n      font-size: 12px;\n      line-height: 1.75;\n    }\n.p038-scope .condition-box h3 {\n      display: flex;\n      align-items: center;\n      gap: 6px;\n      margin-bottom: 4px;\n      color: #1e3a8a;\n      font-size: 12px;\n    }\n.p038-scope .condition-box h3 svg { width: 14px; height: 14px; }\n.p038-scope .condition-box b { color: var(--primary-dark); }\n.p038-scope .panel {\n      display: flex;\n      min-height: 460px;\n      flex: 1;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: var(--shadow);\n    }\n.p038-scope .panel-header {\n      display: flex;\n      min-height: 60px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 10px 15px;\n      border-bottom: 1px solid var(--border);\n    }\n.p038-scope .panel-heading { display: flex; min-width: 0; align-items: center; gap: 10px; }\n.p038-scope .panel-icon {\n      display: grid;\n      width: 36px;\n      height: 36px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--primary);\n      border-radius: 10px;\n      background: var(--primary-soft);\n    }\n.p038-scope .panel-title h2 { overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }\n.p038-scope .panel-title p {\n      overflow: hidden;\n      margin-top: 1px;\n      color: var(--muted);\n      font-size: 11px;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n.p038-scope .badge {\n      padding: 5px 10px;\n      color: var(--primary-dark);\n      border-radius: 999px;\n      background: #dbeafe;\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p038-scope .table-container { min-height: 0; flex: 1; overflow: auto; }\n.p038-scope table.data {\n      width: 100%;\n      min-width: 1380px;\n      border-collapse: separate;\n      border-spacing: 0;\n      white-space: nowrap;\n    }\n.p038-scope table.data th {\n      position: sticky;\n      top: 0;\n      z-index: 2;\n      padding: 11px 12px;\n      color: #475569;\n      border-bottom: 1px solid var(--border);\n      background: var(--surface-soft);\n      box-shadow: inset 0 -1px var(--border);\n      font-size: 12px;\n      font-weight: 700;\n      text-align: left;\n      user-select: none;\n    }\n.p038-scope table.data th.sortable { cursor: pointer; }\n.p038-scope table.data th.sortable:hover { color: var(--primary); background: #f1f5f9; }\n.p038-scope table.data th.sorted { color: var(--primary-dark); background: #e0ecff; }\n.p038-scope table.data td {\n      max-width: 360px;\n      overflow: hidden;\n      padding: 9px 12px;\n      border-bottom: 1px solid #edf1f6;\n      font-size: 12.5px;\n      text-overflow: ellipsis;\n    }\n.p038-scope th.center, .p038-scope td.center { text-align: center; }\n.p038-scope th.number, .p038-scope td.number { text-align: right; font-family: Arial, sans-serif; }\n.p038-scope table.data tbody tr { cursor: pointer; transition: 0.14s ease; }\n.p038-scope table.data tbody tr:nth-child(even) { background: #fbfdff; }\n.p038-scope table.data tbody tr:hover { background: #f0f7ff; }\n.p038-scope table.data tbody tr.checked { background: #eef6ff; }\n.p038-scope table.data tbody tr.current { background: #dbeafe; box-shadow: inset 4px 0 var(--primary); }\n.p038-scope .check-cell { width: 42px; text-align: center; }\n.p038-scope .check-cell input { width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p038-scope .group-code { color: #334155; font-family: Arial, sans-serif; font-weight: 700; }\n.p038-scope .product-code { color: var(--primary-dark); font-family: Arial, sans-serif; font-weight: 700; }\n.p038-scope .qty-tag {\n      display: inline-flex;\n      min-width: 56px;\n      justify-content: flex-end;\n      padding: 2px 8px;\n      border-radius: 7px;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    }\n.p038-scope .qty-tag.pending { color: #b91c1c; background: #fee2e2; }\n.p038-scope .qty-tag.reserve { color: #1d4ed8; background: #dbeafe; }\n.p038-scope .zero { color: #94a3b8; }\n.p038-scope .stock-ok { color: #047857; font-weight: 700; }\n.p038-scope .unit-tag {\n      display: inline-flex;\n      padding: 2px 9px;\n      color: #475569;\n      border-radius: 6px;\n      background: #e2e8f0;\n      font-size: 11px;\n      font-weight: 700;\n    }\n.p038-scope .empty-state {\n      display: none;\n      min-height: 280px;\n      flex: 1;\n      align-items: center;\n      justify-content: center;\n      color: var(--muted);\n      text-align: center;\n    }\n.p038-scope .empty-state.show { display: flex; }\n.p038-scope .table-footer {\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 8px 15px;\n      color: var(--muted);\n      border-top: 1px solid var(--border);\n      background: var(--surface-soft);\n      font-size: 12px;\n    }\n.p038-scope .footer-totals { display: flex; flex-wrap: wrap; gap: 8px; }\n.p038-scope .footer-total {\n      display: flex;\n      align-items: center;\n      gap: 7px;\n      padding: 6px 11px;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 9px;\n      background: #fff;\n    }\n.p038-scope .footer-total strong { color: var(--primary-dark); font-family: Arial, sans-serif; }\n.p038-scope .toast {\n      position: fixed;\n      right: 20px;\n      bottom: 20px;\n      z-index: 50;\n      display: flex;\n      visibility: hidden;\n      align-items: center;\n      gap: 8px;\n      padding: 11px 14px;\n      color: #fff;\n      border-radius: 11px;\n      opacity: 0;\n      background: #0f172a;\n      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.28);\n      font-size: 12px;\n      transform: translateY(12px);\n      transition: 0.2s ease;\n    }\n.p038-scope .toast.show { visibility: visible; opacity: 1; transform: translateY(0); }\n.p038-scope .toast svg { width: 17px; height: 17px; color: #34d399; }\n.p038-scope #p038printArea { display: none; }\n@media print {@page { size: A4 landscape; margin: 8mm; }\n.p038-scope { background: #fff; }\n.p038-scope .app, .p038-scope .toast { display: none !important; }\n.p038-scope #p038printArea { display: block; color: #000; font-family: \"Noto Sans Thai\", sans-serif; }\n.p038-scope #p038printArea h1 { font-size: 16px; text-align: center; }\n.p038-scope #p038printArea .meta { margin: 6px 0 10px; font-size: 10px; line-height: 1.6; }\n.p038-scope #p038printArea table { width: 100%; border-collapse: collapse; }\n.p038-scope #p038printArea th, .p038-scope #p038printArea td {\n        padding: 3px 5px;\n        border: 1px solid #555;\n        font-size: 9px;\n      }\n.p038-scope #p038printArea th { background: #e2e8f0; }\n.p038-scope #p038printArea td.num { text-align: right; }\n.p038-scope #p038printArea tr.group-row td { background: #f1f5f9; font-weight: 700; }\n.p038-scope #p038printArea tr.subtotal td { background: #e2e8f0; font-weight: 700; text-align: right; }\n}\n.p038v3-overlay{display:none;position:fixed;inset:0;z-index:120;align-items:center;justify-content:center;background:rgba(15,23,42,.6);backdrop-filter:blur(2px)}\n.p038v3-overlay.show{display:flex}\n.p038v3-modal{display:flex;flex-direction:column;width:calc(100vw - 24px);max-width:1400px;height:calc(100vh - 16px);max-height:calc(100vh - 16px);border:1px solid #dbe3ef;border-radius:14px;background:#fff;box-shadow:0 24px 64px rgba(15,23,42,.4)}\n.p038v3-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:14px 14px 0 0;border-bottom:1px solid #dbe3ef;background:linear-gradient(90deg,#1e3a8a,#1d4ed8)}\n.p038v3-title{overflow:hidden;color:#fff;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}\n.p038v3-btns{display:flex;flex:0 0 auto;align-items:center;gap:6px}\n.p038v3-btn{display:grid;min-width:30px;height:30px;padding:0 8px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:14px;font-weight:700;cursor:pointer}\n.p038v3-btn:hover{background:rgba(255,255,255,.32)}\n.p038v3-zoomlabel{min-width:44px;color:#fff;text-align:center;font-size:12px;font-weight:700}\n.p038v3-body{flex:1;min-height:200px;background:#f1f5f9}\n.p038v3-body iframe{display:block;width:100%;height:100%;border:0}\n.p038v3-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid #dbe3ef;background:#f8fafc;border-radius:0 0 14px 14px}\n.p038v3-hint{color:#64748b;font-size:12px}\n.p038v3-print{padding:8px 18px;color:#fff;border:0;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);font-size:13px;font-weight:700;cursor:pointer}.p038v2-overlay{display:none;position:fixed;inset:0;z-index:120;align-items:center;justify-content:center;background:rgba(15,23,42,.6);backdrop-filter:blur(2px)}\n.p038v2-overlay.show{display:flex}\n.p038v2-modal{display:flex;flex-direction:column;width:1150px;max-width:calc(100vw - 24px);height:auto;max-height:calc(100vh - 16px);overflow:auto;border:1px solid #dbe3ef;border-radius:14px;background:#fff;box-shadow:0 24px 64px rgba(15,23,42,.4)}\n.p038v2-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-radius:14px 14px 0 0;border-bottom:1px solid #dbe3ef;background:linear-gradient(90deg,#1e3a8a,#1d4ed8)}\n.p038v2-title{overflow:hidden;color:#fff;font-size:14px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}\n.p038v2-btns{display:flex;flex:0 0 auto;align-items:center;gap:6px}\n.p038v2-btn{display:grid;min-width:30px;height:30px;padding:0 8px;color:#fff;border:0;border-radius:8px;background:rgba(255,255,255,.18);font-size:14px;font-weight:700;cursor:pointer}\n.p038v2-btn:hover{background:rgba(255,255,255,.32)}\n.p038v2-zoomlabel{min-width:44px;color:#fff;text-align:center;font-size:12px;font-weight:700}\n.p038v2-body{flex:1;min-height:200px;background:#f1f5f9}\n.p038v2-body iframe{display:block;width:100%;height:794px;border:0}\n.p038v2-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-top:1px solid #dbe3ef;background:#f8fafc;border-radius:0 0 14px 14px}\n.p038v2-hint{color:#64748b;font-size:12px}\n.p038v2-print{padding:8px 18px;color:#fff;border:0;border-radius:9px;background:linear-gradient(135deg,#38bdf8,#1d4ed8);font-size:13px;font-weight:700;cursor:pointer}\n\n.p038-scope #p038printArea table.v2 { table-layout: fixed; }\n.p038-scope #p038printArea table.v2 th:nth-child(1), .p038-scope #p038printArea table.v2 td:nth-child(1) { width: 6.9%; }\n.p038-scope #p038printArea table.v2 th:nth-child(2), .p038-scope #p038printArea table.v2 td:nth-child(2) { width: 8.8%; }\n.p038-scope #p038printArea table.v2 th:nth-child(3), .p038-scope #p038printArea table.v2 td:nth-child(3) { width: 36%; }\n.p038-scope #p038printArea table.v2 th:nth-child(4), .p038-scope #p038printArea table.v2 td:nth-child(4) { width: 6.9%; }\n.p038-scope #p038printArea table.v2 th:nth-child(5), .p038-scope #p038printArea table.v2 td:nth-child(5) { width: 6.9%; }\n.p038-scope #p038printArea table.v2 th:nth-child(6), .p038-scope #p038printArea table.v2 td:nth-child(6) { width: 6.9%; }\n.p038-scope #p038printArea table.v2 th:nth-child(7), .p038-scope #p038printArea table.v2 td:nth-child(7) { width: 6.3%; }\n.p038-scope #p038printArea table.v2 th:nth-child(8), .p038-scope #p038printArea table.v2 td:nth-child(8) { width: 8.8%; }\n.p038-scope #p038printArea table.v2 th:nth-child(9), .p038-scope #p038printArea table.v2 td:nth-child(9) { width: 6.3%; }\n.p038-scope #p038printArea table.v2 th:nth-child(10), .p038-scope #p038printArea table.v2 td:nth-child(10) { width: 6.3%; }\n.p038-scope #p038printArea table.v2 th.c, .p038-scope #p038printArea table.v2 td.c { text-align: center; }\n.p038-scope #p038printArea table.v2 td.msg { white-space: pre-line; overflow: hidden; }\n.p038-scope #p038printArea table.v2 th .sub { font-size: 7px; font-weight: 400; }\n.p038-scope #p038printArea tr.prow td { background: #dbeafe; font-weight: 700; }\n.p038-scope #p038printArea .meta span { margin-right: 16px; }\n@media (max-width: 1250px) {.p038-scope .launcher-body { grid-template-columns: 1fr; }\n.p038-scope .option-groups { grid-template-columns: repeat(3, 1fr); }\n}\n@media (max-width: 950px) {\n.p038-scope .row-fields, .p038-scope .row-fields.second { grid-template-columns: 1fr; }\n.p038-scope .date-row { grid-template-columns: 1fr 1fr; }\n.p038-scope .date-check { grid-column: 1 / -1; }\n.p038-scope .date-separator { display: none; }\n}\n@media (max-width: 680px) {.p038-scope .topbar { min-height: 66px; padding: 10px 13px; }\n.p038-scope .brand h1 { font-size: 15px; }\n.p038-scope .brand p, .p038-scope .system-status { display: none; }\n.p038-scope .content { padding: 12px; }\n.p038-scope .option-groups { grid-template-columns: 1fr; }\n.p038-scope .panel-header, .p038-scope .table-footer { align-items: flex-start; flex-direction: column; }\n}\n\n.p038-scope .panel-header .action-buttons { display: flex; gap: 8px; }\n.p038-scope .panel-header .action-button { min-height: 38px; padding: 0 12px; border-radius: 9px; font-size: 12px; }\n.p038-scope .panel-header .action-button svg { width: 16px; height: 16px; }\n.p038-scope .pager {\n  display: none;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  padding: 10px 15px;\n  border-top: 1px solid var(--border);\n  background: #fff;\n}\n.p038-scope .pg-btn {\n  min-width: 34px;\n  height: 34px;\n  padding: 0 8px;\n  color: #334155;\n  border: 1px solid var(--border);\n  border-radius: 9px;\n  background: #fff;\n  font-size: 13px;\n  font-weight: 700;\n  transition: 0.15s ease;\n}\n.p038-scope .pg-btn:hover:not(:disabled) { border-color: #93c5fd; background: var(--primary-soft); transform: translateY(-1px); }\n.p038-scope .pg-btn.active {\n  color: #fff;\n  border: 0;\n  background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.25);\n}\n.p038-scope .pg-btn:disabled { color: #cbd5e1; background: #f1f5f9; cursor: not-allowed; }\n.p038-scope .pg-ellipsis { color: #94a3b8; font-size: 13px; font-weight: 700; padding: 0 2px; }\n.p038-scope.p038-modal-overlay { display: none; position: fixed; inset: 0; z-index: 100; overflow: auto; padding: 24px 16px; background: rgba(15, 23, 42, 0.55); backdrop-filter: blur(2px); }\n.p038-scope.p038-modal-overlay.show { display: flex; align-items: center; justify-content: center; }\n.p038-scope .p038-modal { display: flex; flex-direction: column; width: 100%; max-width: 1150px; border: 1px solid var(--border); border-radius: 14px; background: #fff; box-shadow: 0 24px 64px rgba(15, 23, 42, 0.35); }\n.p038-scope .p038-modal.small { max-width: 480px; }\n.p038-scope .p038-modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; border-radius: 14px 14px 0 0; border-bottom: 1px solid var(--border); background: linear-gradient(90deg, #1e3a8a, #1d4ed8); }\n.p038-scope .p038-modal-head h3 { overflow: hidden; color: #fff; font-size: 14px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }\n.p038-scope .p038-modal-x { display: grid; width: 30px; height: 30px; flex: 0 0 auto; place-items: center; color: #fff; border: 0; border-radius: 8px; background: rgba(255, 255, 255, 0.18); }\n.p038-scope .p038-modal-x:hover { background: var(--danger); }\n.p038-scope .p038-modal-x svg { width: 15px; height: 15px; }\n.p038-scope .p038-modal { max-height: calc(100vh - 48px); }\n.p038-scope .p038-modal-body { padding: 14px 16px; overflow: visible; }\n.p038-scope .p038-modal { max-width: 1360px; }\n.p038-scope #p038detailBody { flex: 1 1 auto; min-height: 96px; overflow: auto; }.p038-scope #p038detailBody tr.selected td { background: #dbeafe; }\n.p038-scope #p038detailBody tr.selected td:first-child { box-shadow: inset 4px 0 var(--primary); }\n\n.p038-scope .p038-sub { display: flex; flex: 1 1 auto; flex-direction: column; min-height: 120px; overflow: hidden; margin-top: 14px; border-top: 2px solid #c9d8ec; padding-top: 10px; }\n.p038-scope .p038-sub-head { flex: 0 0 auto; }\n.p038-scope #p038subBody { flex: 1 1 auto; min-height: 48px; overflow: auto; }\n.p038-scope .p038-sub-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; }\n.p038-scope .p038-sub-head h4 { overflow: hidden; color: #1e3a8a; font-size: 12.5px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }\n.p038-scope .p038-sub table { width: 100%; border-collapse: collapse; white-space: nowrap; }\n.p038-scope .p038-sub th { position: sticky; top: 0; z-index: 1; padding: 6px 8px; color: #1e3a8a; border-bottom: 2px solid #c9d8ec; background: #f1f6ff; font-size: 11.5px; font-weight: 700; text-align: left; }\n.p038-scope .p038-sub td { padding: 5px 8px; border-bottom: 1px solid #edf1f6; font-size: 12px; }\n.p038-scope .p038-sub th.num, .p038-scope .p038-sub td.num { text-align: right; font-family: Arial, sans-serif; }\n.p038-scope .p038-sub th.center, .p038-scope .p038-sub td.center { text-align: center; }\n.p038-scope .p038-sub tr.rsv td { background: #fde8ef; }\n.p038-scope .p038-sub-msg { padding: 14px 8px; color: var(--muted); font-size: 12px; text-align: center; }\n.p038-scope .p038-modal-body table { width: 100%; border-collapse: collapse; white-space: nowrap; }\n.p038-scope .p038-modal-body th { position: sticky; top: 0; z-index: 1; padding: 8px 10px; color: #1e3a8a; border-bottom: 2px solid #c9d8ec; background: #eaf2ff; font-size: 12px; font-weight: 700; text-align: left; }\n.p038-scope .p038-modal-body td { padding: 7px 10px; border-bottom: 1px solid #edf1f6; font-size: 12.5px; }\n.p038-scope .p038-modal-body tbody tr:hover td { background: #f0f7ff; }\n.p038-scope .p038-modal-body th.num, .p038-scope .p038-modal-body td.num { text-align: right; font-family: Arial, sans-serif; }\n.p038-scope .p038-modal-body th.center, .p038-scope .p038-modal-body td.center { text-align: center; }\n.p038-scope .p038-edit-btn { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; color: #1d4ed8; border: 1px solid #93c5fd; border-radius: 7px; background: #eff6ff; font-size: 11px; font-weight: 700; }\n.p038-scope .p038-edit-btn:hover { background: #dbeafe; }\n.p038-scope .p038-edit-btn svg { width: 12px; height: 12px; }\n.p038-scope .p038-modal-msg { padding: 34px 16px; color: var(--muted); font-size: 13px; text-align: center; }\n.p038-scope .p038-comment-box { width: 100%; min-height: 90px; padding: 10px 12px; color: var(--text); border: 1px solid var(--border); border-radius: 10px; background: #fff; font-size: 13px; outline: none; resize: vertical; }\n.p038-scope .p038-comment-box:focus { border-color: #60a5fa; box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14); }\n.p038-scope .p038-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); border-radius: 0 0 14px 14px; background: #f8fafc; }\n.p038-scope .p038-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; color: #334155; border: 1px solid var(--border); border-radius: 9px; background: #fff; font-size: 13px; font-weight: 700; }\n.p038-scope .p038-btn.primary { color: #fff; border: 0; background: linear-gradient(135deg, #38bdf8, var(--primary-dark)); }\n.p038-scope .p038-btn:disabled { opacity: 0.6; cursor: not-allowed; }\n.p038-scope .action-button.search.loading { pointer-events: none; }\n.p038-scope .action-button.search.loading > svg { display: none; }\n.p038-scope .action-button.search.loading::before { content: ''; width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.4); border-top-color: #fff; border-radius: 50%; animation: p038spin 0.7s linear infinite; }\n.p038-scope #p038printV3Button.loading { pointer-events: none; }\n.p038-scope #p038printV3Button.loading > svg { display: none; }\n.p038-scope #p038printV3Button.loading::before { content: ''; width: 16px; height: 16px; border: 2px solid rgba(29, 78, 216, 0.3); border-top-color: #1d4ed8; border-radius: 50%; animation: p038spin 0.7s linear infinite; }\n.p038-scope #p038printV2Button.loading { pointer-events: none; }\n.p038-scope #p038printV2Button.loading > svg { display: none; }\n.p038-scope #p038printV2Button.loading::before { content: ''; width: 16px; height: 16px; border: 2px solid rgba(29, 78, 216, 0.3); border-top-color: #1d4ed8; border-radius: 50%; animation: p038spin 0.7s linear infinite; }\n@keyframes p038spin { to { transform: rotate(360deg); } }\n@media print { .p038-scope.p038-modal-overlay { display: none !important; } }\n";

  var HTML = "<div class=\"p038-scope\">\n<div class=\"app\" style=\"min-height:0\">\n    <main class=\"content\">\n      <section class=\"launcher-card\">\n\n        <form class=\"launcher-body\" id=\"p038filterForm\">\n          <div class=\"left-column\">\n            <div class=\"row-fields\">\n              <div class=\"field\">\n                <label class=\"field-label\" for=\"searchBy\">ค้นหาจาก</label>\n                <div class=\"input-wrap\">\n                  <select id=\"p038searchBy\">\n                    <option value=\"group\">กลุ่มสินค้า</option>\n                    <option value=\"code\" selected>รหัสสินค้า</option>\n                    <option value=\"name\">ชื่อสินค้า</option>\n                  </select>\n                  <svg viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"></path></svg>\n                </div>\n              </div>\n\n              <div class=\"field\">\n                <label class=\"field-label\" for=\"searchText\">คำค้นหา</label>\n                <div class=\"input-wrap\">\n                  <input id=\"p038searchText\" type=\"text\" value=\"\" autocomplete=\"off\">\n                </div>\n              </div>\n            </div>\n\n            <div class=\"row-fields second\">\n              <div class=\"field\">\n                <label class=\"field-label\" for=\"warehouseInput\">คลังสินค้า</label>\n                <div class=\"input-wrap\">\n                  <input id=\"p038warehouseInput\" type=\"text\" value=\"01,01-B,01-CL,03,04-1\" autocomplete=\"off\">\n                </div>\n              </div>\n\n              <div class=\"field\">\n                <label class=\"field-label\">ช่วงวันที่ซื้อขาย</label>\n                <div class=\"date-row\">\n                  <label class=\"date-check\">\n                    <input id=\"p038useDate\" type=\"checkbox\">\n                    วันที่\n                  </label>\n\n                  <div class=\"input-wrap\">\n                    <input id=\"p038dateFrom\" type=\"date\" value=\"2026-10-26\" disabled>\n                  </div>\n\n                  <span class=\"date-separator\">ถึง</span>\n\n                  <div class=\"input-wrap\">\n                    <input id=\"p038dateTo\" type=\"date\" value=\"2026-10-26\" disabled>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"option-groups\" id=\"p038optionGroups\"></div>\n          </div>\n\n          <div class=\"right-column\">\n            <div class=\"action-buttons\">\n              <button class=\"action-button search\" type=\"submit\">\n                <svg viewBox=\"0 0 24 24\">\n                  <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n                  <path d=\"m21 21-4.35-4.35\"></path>\n                </svg>\n                ค้นหา\n              </button>\n            </div>\n\n            \n\n            <div class=\"condition-box\">\n              <h3>\n                <svg viewBox=\"0 0 24 24\">\n                  <path d=\"M22 3H2l8 9.46V19l4 2v-8.54L22 3z\"></path>\n                </svg>\n                เงื่อนไขที่ใช้ค้นหา\n              </h3>\n              <div id=\"p038conditionText\"></div>\n            </div>\n          </div>\n        </form>\n      </section>\n\n      <section class=\"panel\">\n        <div class=\"panel-header\">\n          <div class=\"panel-heading\">\n            <div class=\"panel-icon\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M3 3h18v18H3z\"></path>\n                <path d=\"M3 9h18M9 3v18\"></path>\n              </svg>\n            </div>\n\n            <div class=\"panel-title\">\n              <h2>รายการสินค้าค้างส่ง / จอง</h2>\n              <p id=\"p038panelSubtitle\">คลิกแถวเพื่อเลือกแถวปัจจุบัน ติ๊กช่องซ้ายเพื่อเลือกพิมพ์</p>\n            </div>\n          </div>\n\n          <span class=\"badge\" id=\"p038resultBadge\">0 รายการ</span>\n        \n            <div class=\"action-buttons\">\n              \n              <button class=\"action-button\" id=\"p038printV2Button\" type=\"button\">\n                <svg viewBox=\"0 0 24 24\">\n                  <path d=\"M6 9V2h12v7\"></path>\n                  <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path>\n                  <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n                </svg>\n                Print V2\n              </button>\n              <button class=\"action-button\" id=\"p038printV3Button\" type=\"button\">\n                <svg viewBox=\"0 0 24 24\">\n                  <path d=\"M6 9V2h12v7\"></path>\n                  <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path>\n                  <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n                </svg>\n                Print V3\n              </button>\n            </div></div>\n\n        <div class=\"table-container\" id=\"p038tableContainer\">\n          <table class=\"data\">\n            <thead>\n              <tr>\n                <th class=\"check-cell\"><input id=\"p038selectAll\" type=\"checkbox\" aria-label=\"เลือกทั้งหมด\"></th>\n                <th class=\"sortable center\" data-sort=\"date\">วันที่ซื้อขาย <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"groupCode\">รหัสกลุ่มสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"productCode\">รหัสสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"name\">ชื่อสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"pending\">จำนวนค้างส่ง <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"reserved\">จำนวนที่จอง <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"pr\">PR <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock01Total\">คงเหลือ[01]+[01-CL]+[01-B] <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock03\">คงเหลือ [03] <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock04Total\">คงเหลือ [04-1]+[04-2] <span class=\"arrow\"></span></th>\n                <th class=\"center\">หน่วยนับ</th>\n              </tr>\n            </thead>\n            <tbody id=\"p038resultRows\"></tbody>\n          </table>\n        </div>\n\n        <div class=\"empty-state\" id=\"p038emptyState\">\n          <div>\n            <svg viewBox=\"0 0 24 24\" style=\"width:48px;height:48px;margin:0 auto 10px\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n              <path d=\"m21 21-4.35-4.35M8 11h6\"></path>\n            </svg>\n            <strong>ไม่พบรายการตามเงื่อนไขที่เลือก</strong>\n            <p style=\"margin-top:5px;font-size:11px\">ลองปรับเงื่อนไขการค้นหา หรือเลือกตัวเลือก \"ทั้งหมด\"</p>\n          </div>\n        </div>\n\n        <div class=\"pager\" id=\"p038pager\"></div>\n        <div class=\"table-footer\">\n          <span id=\"p038footerText\">แสดง 0 รายการ</span>\n\n          <div class=\"footer-totals\">\n            <div class=\"footer-total\">ค้างส่งรวม <strong id=\"p038footerPending\">0.00</strong></div>\n            <div class=\"footer-total\">จองรวม <strong id=\"p038footerReserve\">0.00</strong></div>\n          </div>\n        </div>\n      </section>\n    </main>\n</div>\n<div class=\"p038-modal-overlay\" id=\"p038detailOverlay\">\n  <div class=\"p038-modal\">\n    <div class=\"p038-modal-head\">\n      <h3 id=\"p038detailTitle\"></h3>\n      <button type=\"button\" class=\"p038-modal-x\" id=\"p038detailClose\"><svg viewBox=\"0 0 24 24\"><path d=\"M18 6 6 18M6 6l12 12\"></path></svg></button>\n    </div>\n    <div class=\"p038-modal-body\" id=\"p038detailBody\"></div>\n    <div class=\"p038-modal-body p038-sub\" id=\"p038subSection\">\n      <div class=\"p038-sub-head\">\n        <h4 id=\"p038subTitle\"></h4>\n        <button type=\"button\" class=\"p038-btn primary\" id=\"p038subPrintButton\">\n          <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>\n          Print Preview\n        </button>\n      </div>\n      <div id=\"p038subBody\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"p038-modal-overlay\" id=\"p038commentOverlay\">\n  <div class=\"p038-modal small\">\n    <div class=\"p038-modal-head\">\n      <h3 id=\"p038commentTitle\"></h3>\n      <button type=\"button\" class=\"p038-modal-x\" id=\"p038commentClose\"><svg viewBox=\"0 0 24 24\"><path d=\"M18 6 6 18M6 6l12 12\"></path></svg></button>\n    </div>\n    <div class=\"p038-modal-body\">\n      <textarea class=\"p038-comment-box\" id=\"p038commentText\"></textarea>\n    </div>\n    <div class=\"p038-modal-foot\">\n      <button type=\"button\" class=\"p038-btn\" id=\"p038commentCancel\"></button>\n      <button type=\"button\" class=\"p038-btn primary\" id=\"p038commentSave\"></button>\n    </div>\n  </div>\n</div>\n<div id=\"p038printArea\"></div>\n<div class=\"toast\" id=\"p038toast\">\n    <svg viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"></path></svg>\n    <span id=\"p038toastMessage\">ดำเนินการเรียบร้อยแล้ว</span>\n  </div>\n</div>\n";

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
var items = [];

var radioGroups = [{
  key: "pending",
  title: "ค้างส่ง",
  options: [["has", "มีค้างส่ง"], ["none", "ไม่มีค้างส่ง"], ["all", "ทั้งหมด"]],
  def: "all"
}, {
  key: "reserve",
  title: "เบิก/จอง",
  options: [["has", "มีเบิก/จอง"], ["none", "ไม่มีเบิก/จอง"], ["all", "ทั้งหมด"]],
  def: "all"
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
  checked: true
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
var API_SEARCH = "api/p038_search.php";
var API_DETAIL = "api/p038_detail.php";
var API_COMMENT = "api/p038_comment.php";
var API_SUBDETAIL = "api/p038_subdetail.php";
var API_CONNECTION_ID = "c1788406814359";
var apiRows = [];
var apiSearching = false;
var searchSeq = 0;
var PAGE_SIZE = 15;
var pageNum = 1;
var pageItems = [];

function apiPost(url, data) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(function (r) { return r.json(); });
}

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
  var total = list.length;
  var from = total === 0 ? 0 : (pageNum - 1) * PAGE_SIZE + 1;
  var to = Math.min(total, pageNum * PAGE_SIZE);
  document.getElementById("p038footerText").textContent = "".concat("\u0E41\u0E2A\u0E14\u0E07 ", from, " \u2013 ", to, " \u0E08\u0E32\u0E01 ", total, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
}
function updateSelection() {
  var visibleSelected = pageItems.filter(function (item) {
    return selectedIds.has(item.id);
  }).length;
  var allSelected = pageItems.length > 0 && visibleSelected === pageItems.length;
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
function maxPage(total) {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
function pageNumbers(pages, cur) {
  if (pages <= 7) {
    var a = [];
    for (var i = 1; i <= pages; i++) a.push(i);
    return a;
  }
  var set = {};
  set[1] = 1;
  set[pages] = 1;
  for (var j = cur - 1; j <= cur + 1; j++) if (j >= 1 && j <= pages) set[j] = 1;
  var arr = Object.keys(set).map(Number).sort(function (x, y) { return x - y; });
  var out = [];
  var prev = 0;
  for (var k = 0; k < arr.length; k++) {
    if (arr[k] - prev > 1) out.push("\u2026");
    out.push(arr[k]);
    prev = arr[k];
  }
  return out;
}
function renderPager(total) {
  var pager = els.pager;
  if (!pager) return;
  var pages = maxPage(total);
  if (pages <= 1) { pager.style.display = "none"; pager.innerHTML = ""; return; }
  pager.style.display = "flex";
  var html = "";
  html += '<button type="button" class="pg-btn" data-pg="first" ' + (pageNum <= 1 ? "disabled" : "") + '>&laquo;</button>';
  html += '<button type="button" class="pg-btn" data-pg="prev" ' + (pageNum <= 1 ? "disabled" : "") + '>&lsaquo;</button>';
  var nums = pageNumbers(pages, pageNum);
  for (var i = 0; i < nums.length; i++) {
    if (nums[i] === "\u2026") html += '<span class="pg-ellipsis">\u2026</span>';
    else html += '<button type="button" class="pg-btn' + (nums[i] === pageNum ? " active" : "") + '" data-pg="' + nums[i] + '">' + nums[i] + "</button>";
  }
  html += '<button type="button" class="pg-btn" data-pg="next" ' + (pageNum >= pages ? "disabled" : "") + '>&rsaquo;</button>';
  html += '<button type="button" class="pg-btn" data-pg="last" ' + (pageNum >= pages ? "disabled" : "") + '>&raquo;</button>';
  pager.innerHTML = html;
}
function renderRows() {
  var sorted = sortItems(currentItems);
  if (pageNum > maxPage(sorted.length)) pageNum = maxPage(sorted.length);
  if (pageNum < 1) pageNum = 1;
  pageItems = sorted.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);
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
  pageItems.forEach(function (item) {
    var tr = document.createElement("tr");
    tr.dataset.id = item.id;
    if (selectedIds.has(item.id)) tr.classList.add("checked");
    if (item.id === currentId) tr.classList.add("current");
    if (item.strsubs) tr.style.backgroundColor = "#d1f0d1";
    tr.innerHTML = "\n          <td class=\"check-cell\">\n            <input type=\"checkbox\" class=\"row-check\" ".concat(selectedIds.has(item.id) ? "checked" : "", ">\n          </td>\n          <td class=\"center\">").concat(formatDate(item.date), "</td>\n          <td class=\"group-code\">").concat(escapeHTML(item.groupCode), "</td>\n          <td class=\"product-code\">").concat(escapeHTML(item.productCode), "</td>\n          <td title=\"").concat(escapeHTML(item.name), "\">").concat(escapeHTML(item.name), "</td>\n          <td class=\"number\">").concat(qtyCell(item.pending, "pending"), "</td>\n          <td class=\"number\">").concat(qtyCell(item.reserved, "reserve"), "</td>\n          <td class=\"number ").concat(item.pr > 0 ? "" : "zero", "\">").concat(formatNumber(item.pr), "</td>\n          <td class=\"number ").concat(item.stock01Total > 0 ? "stock-ok" : "zero", "\">").concat(item.s01.join("+"), "</td>\n          <td class=\"number ").concat(item.s03 > 0 ? "stock-ok" : "zero", "\">").concat(formatNumber(item.s03), "</td>\n          <td class=\"number ").concat(item.stock04Total > 0 ? "stock-ok" : "zero", "\">").concat(item.s04.join("+"), "</td>\n          <td class=\"center\"><span class=\"unit-tag\">").concat(escapeHTML(item.unit), "</span></td>\n        ");
    els.rows.appendChild(tr);
  });
  renderPager(sorted.length);
  updateSelection();
}
function search() {
  var showMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  searchSeq += 1;
  var seq = searchSeq;
  apiSearching = true;
  var btn = document.querySelector(".action-button.search");
  if (btn) { btn.disabled = true; btn.classList.add("loading"); }
  pageNum = 1;
  appliedFilters = readFilters();
  renderConditions(appliedFilters);
  var payload = {
    connectionId: API_CONNECTION_ID,
    searchBy: appliedFilters.searchBy,
    searchText: appliedFilters.searchText,
    warehouse: appliedFilters.warehouse,
    useDate: appliedFilters.useDate,
    dateFrom: appliedFilters.dateFrom,
    dateTo: appliedFilters.dateTo,
    pending: appliedFilters.pending,
    reserve: appliedFilters.reserve,
    stock01: appliedFilters.stock01,
    stock02: appliedFilters.stock02,
    statusAll: appliedFilters.statusAll,
    statusChecks: appliedFilters.statusChecks
  };
  apiPost(API_SEARCH, payload).then(function (d) {
    if (!d.ok) throw new Error(d.error);
    apiRows = d.rows;
    items.length = 0;
    for (var i = 0; i < apiRows.length; i++) {
      var item = apiRows[i];
      item.id = i + 1;
      item.stock01Total = item.s01.reduce(function (a, b) { return a + b; }, 0);
      item.stock04Total = item.s04.reduce(function (a, b) { return a + b; }, 0);
      items.push(item);
    }
    if (seq !== searchSeq) return;
    currentItems = items.slice();
    renderRows();
    if (showMessage) {
      if (currentItems.length) showToast("\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 ".concat(currentItems.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"));
      else showToast("\u0E44\u0E1B\u0E23\u0E01\u0E2D\u0E1B\u0E39\u0E40\u0E02\u0E47\u0E21");
    }
  }).catch(function (e) {
    if (seq !== searchSeq) return;
    showToast("\u0E40\u0E04\u0E78\u0E32\u0E22\u0E27\u0E48\u0E32\u0E07: ".concat(e.message));
  }).then(function () {
    if (seq !== searchSeq) return;
    apiSearching = false;
    if (btn) { btn.disabled = false; btn.classList.remove("loading"); }
  });
}


var detailRows = [];
var commentVnos = null;

function openDetailModal(item) {
  detailRows = [];
  subCusid = null;
  subRows = [];
  subCus = null;
  document.getElementById("p038subTitle").textContent = "";
  document.getElementById("p038subBody").innerHTML = "";
  document.getElementById("p038subPrintButton").disabled = true;
  document.getElementById("p038detailTitle").textContent = "".concat("\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14", " \u2014 ").concat(escapeHTML(item.productCode), " ", escapeHTML(item.name));
  document.getElementById("p038detailBody").innerHTML = '<div class="p038-modal-msg">' + "\u0E42\u0E2B\u0E25\u0E14" + '...</div>';
  document.getElementById("p038detailOverlay").classList.add("show");
  var payload = {
    connectionId: API_CONNECTION_ID,
    productCode: item.productCode,
    warehouse: appliedFilters ? appliedFilters.warehouse : "",
    useDate: appliedFilters ? appliedFilters.useDate : false,
    dateFrom: appliedFilters ? appliedFilters.dateFrom : "",
    dateTo: appliedFilters ? appliedFilters.dateTo : "",
    statusAll: appliedFilters ? appliedFilters.statusAll : true,
    statusChecks: appliedFilters ? appliedFilters.statusChecks : []
  };
  apiPost(API_DETAIL, payload).then(function (d) {
    if (!d.ok) throw new Error(d.error);
    detailRows = d.rows;
    renderDetailRows();
  }).catch(function (e) {
    document.getElementById("p038detailBody").innerHTML = '<div class="p038-modal-msg">' + "\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14" + ': ' + escapeHTML(e.message) + '</div>';
  });
}
function renderDetailRows() {
  var body = document.getElementById("p038detailBody");
  if (!detailRows.length) {
    body.innerHTML = '<div class="p038-modal-msg">' + "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25" + '</div>';
    return;
  }
  var h = "<table><thead><tr>";
  h += '<th class="center">Edit</th>';
  h += '<th>' + "\u0E23\u0E2B\u0E31\u0E2A\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32" + '</th><th>' + "\u0E0A\u0E37\u0E48\u0E2D\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32" + '</th><th>' + "\u0E40\u0E01\u0E23\u0E14" + '</th>';
  h += '<th class="center">' + "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48" + '</th><th>' + "\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D" + '</th><th>' + "\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32" + '</th>';
  h += '<th class="num">' + "\u0E08\u0E33\u0E19\u0E27\u0E19\u0020\u0E02\u0E32\u0E22\u002F\u0E08\u0E2D\u0E07" + '</th><th class="num">' + "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07" + '</th><th class="num">' + "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07" + '</th>';
  h += '<th>' + "\u0E2A\u0E16\u0E32\u0E19\u0E30" + '</th><th>' + "\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38" + '</th></tr></thead><tbody>';
  detailRows.forEach(function (r) {
    h += "<tr>";
    h += '<td class="center"><button type="button" class="p038-edit-btn" data-vnos="' + escapeHTML(r.vnos) + '"><svg viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>Edit</button></td>';
    h += "<td>" + escapeHTML(r.cusid) + "</td>";
    h += "<td>" + escapeHTML(r.debname) + "</td>";
    h += "<td>" + escapeHTML(r.debgrade) + "</td>";
    h += '<td class="center">' + (r.date ? formatDate(r.date) : "") + "</td>";
    h += "<td>" + escapeHTML(r.vnos) + "</td>";
    h += "<td>" + escapeHTML(r.stkcode) + "</td>";
    h += '<td class="num">' + formatNumber(r.req) + "</td>";
    h += '<td class="num">' + formatNumber(r.cut) + "</td>";
    h += '<td class="num">' + formatNumber(r.total) + "</td>";
    h += "<td>" + escapeHTML(r.status) + "</td>";
    h += "<td>" + escapeHTML(r.desc) + "</td>";
    h += "</tr>";
  });
  h += "</tbody></table>";
  body.innerHTML = h;
}
function closeDetailModal() {
  document.getElementById("p038detailOverlay").classList.remove("show");
}
function openCommentModal(vnos) {
  commentVnos = vnos;
  document.getElementById("p038commentTitle").textContent = "Comment \u2014 " + vnos;
  document.getElementById("p038commentText").value = "";
  document.getElementById("p038commentSave").disabled = true;
  document.getElementById("p038commentCancel").textContent = "\u0E1B\u0E34\u0E14";
  document.getElementById("p038commentSave").textContent = "SAVE";
  document.getElementById("p038commentOverlay").classList.add("show");
  apiPost(API_COMMENT, { connectionId: API_CONNECTION_ID, vnos: vnos }).then(function (d) {
    if (!d.ok) throw new Error(d.error);
    document.getElementById("p038commentText").value = d.desc || "";
    document.getElementById("p038commentSave").disabled = false;
  }).catch(function (e) {
    showToast("".concat("\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14", " : ").concat(e.message));
  });
}
function closeCommentModal() {
  document.getElementById("p038commentOverlay").classList.remove("show");
}
function saveComment() {
  var vnos = commentVnos;
  var desc = document.getElementById("p038commentText").value;
  var btn = document.getElementById("p038commentSave");
  btn.disabled = true;
  apiPost(API_COMMENT, { connectionId: API_CONNECTION_ID, vnos: vnos, desc: desc }).then(function (d) {
    if (!d.ok) throw new Error(d.error);
    for (var i = 0; i < detailRows.length; i++) {
      if (detailRows[i].vnos === vnos) detailRows[i].desc = desc;
    }
    renderDetailRows();
    closeCommentModal();
    showToast("".concat("\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27"));
  }).catch(function (e) {
    btn.disabled = false;
    showToast("".concat("\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14", " : ").concat(e.message));
  });
}
var subRows = [];
var subCus = null;
var subCusid = null;

function openSubDetail(cusid) {
  if (subCusid === cusid) return;
  subCusid = cusid;
  subRows = [];
  subCus = null;
  document.getElementById("p038subTitle").textContent = "\u0E42\u0E2B\u0E25\u0E14...";
  document.getElementById("p038subBody").innerHTML = "";
  document.getElementById("p038subPrintButton").disabled = true;
  var payload = {
    connectionId: API_CONNECTION_ID,
    cusid: cusid,
    warehouse: appliedFilters ? appliedFilters.warehouse : ""
  };
  apiPost(API_SUBDETAIL, payload).then(function (d) {
    if (!d.ok) throw new Error(d.error);
    if (subCusid !== cusid) return;
    subRows = d.rows;
    subCus = d.cus;
    renderSubRows();
  }).catch(function (e) {
    if (subCusid !== cusid) return;
    document.getElementById("p038subTitle").textContent = "";
    document.getElementById("p038subBody").innerHTML = '<div class="p038-sub-msg">\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14 : ' + escapeHTML(e.message) + "</div>";
  });
}
function renderSubRows() {
  var title = document.getElementById("p038subTitle");
  var body = document.getElementById("p038subBody");
  var btn = document.getElementById("p038subPrintButton");
  if (!subCus) return;
  title.textContent = "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E41\u0E25\u0E30\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E2D\u0E07 ".concat(escapeHTML(subCus.code), " ").concat(escapeHTML(subCus.name));
  btn.disabled = !subRows.length;
  if (!subRows.length) {
    body.innerHTML = '<div class="p038-sub-msg">\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25</div>';
    return;
  }
  var h = "<table><thead><tr>";
  h += "<th>\u0E23\u0E2B\u0E31\u0E2A\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32</th><th>\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48</th><th class=\"center\">\u0E40\u0E25\u0E02\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D</th><th class=\"center\">\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th><th>\u0E01\u0E25\u0E38\u0E48\u0E21\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th><th>\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th>";
  h += '<th class="num">\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07</th><th class="num">\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E2D\u0E07</th><th class="num">\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D</th><th class="center">\u0E2B\u0E19\u0E48\u0E27\u0E22</th></tr></thead><tbody>';
  subRows.forEach(function (r) {
    var isRsv = r.vnos.indexOf("RSV") === 0;
    h += '<tr' + (isRsv ? ' class="rsv"' : "") + ">";
    h += "<td>" + escapeHTML(subCus.code) + "</td>";
    h += "<td>" + (r.date ? formatDate(r.date) : "") + "</td>";
    h += '<td class="center">' + escapeHTML(r.vnos) + "</td>";
    h += '<td class="center">' + escapeHTML(r.listNo) + "</td>";
    h += "<td>" + escapeHTML(r.stkcode) + "</td>";
    h += "<td>" + escapeHTML(r.group) + "</td>";
    h += "<td>" + escapeHTML(r.desc) + "</td>";
    h += '<td class="num">' + formatNumber(r.qty) + "</td>";
    h += '<td class="num">' + formatNumber(r.rsv) + "</td>";
    h += '<td class="num">' + formatNumber(r.balance) + "</td>";
    h += '<td class="center">' + escapeHTML(r.unit) + "</td>";
    h += "</tr>";
  });
  h += "</tbody></table>";
  body.innerHTML = h;
}
function buildCPSRSVHtml() {
  if (!subCus || !subRows.length) return '';
  var now = new Date();
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var stamp = pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear() + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  var h = [];
  h.push('<!DOCTYPE html><html><head><meta charset="utf-8"><title>\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E41\u0E25\u0E30\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E2D\u0E07</title>');
  h.push('<style>');
  h.push("@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}");
  h.push("@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}");
  h.push('@page{size:A4 landscape;margin:20pt 20pt 20pt 25pt}');
  h.push("body{margin:0;background:#e9eef5;font-family:'THSarabunNew',Arial,sans-serif;color:#000}");
  h.push('.p038sub-toolbar{position:fixed;top:0;left:0;right:0;z-index:20;background:#1d4ed8;color:#fff;padding:6px 12px;display:flex;align-items:center;gap:10px}');
  h.push('.p038sub-toolbar button{background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.5);color:#fff;border-radius:6px;padding:3px 14px;font-size:14pt;cursor:pointer}');
  h.push('.p038sub-toolbar button:hover{background:rgba(255,255,255,0.35)}');
  h.push('.p038sub-toolbar .zl{font-size:14pt;min-width:60px;text-align:center}');
  h.push('#p038subContent{margin-top:44px}');
  h.push('.p038sub-page{box-sizing:border-box;width:297mm;height:210mm;margin:0 auto;padding:20pt;background:#fff}');
  h.push('table{border-collapse:collapse;margin:0 auto}');
  h.push('table.deb{width:800pt}');
  h.push('table.main{width:800pt;border:1px solid #000}');
  h.push('td{padding:2px 4px}');
  h.push('table.deb td{border:0;font-size:14pt}');
  h.push('table.deb td.title{font-size:22pt;font-weight:bold;text-align:center}');
  h.push('table.deb td.lbl{font-weight:bold}');
  h.push('table.main td{border:0;font-size:14pt}');
  h.push('table.main th{border:1px solid #000;font-size:14pt;font-weight:bold;text-align:center;vertical-align:middle}');
  h.push('td.num{text-align:right;padding-right:5pt}');
  h.push('@media print{.p038sub-toolbar{display:none}#p038subContent{margin-top:0}body{background:#fff;zoom:1}.p038sub-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;background:#fff}table tr{page-break-inside:avoid}');
  h.push('</style></head><body>');
  h.push('<div class="p038sub-toolbar">');
  h.push('<button type="button" id="p038subZoomOut" title="zoom out">\u2212</button>');
  h.push('<span class="zl" id="p038subZoom">100%</span>');
  h.push('<button type="button" id="p038subZoomIn" title="zoom in">+</button>');
  h.push('<button type="button" id="p038subPrint"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:5px"><polyline points="6 9 6 20 18 20 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="2" width="12" height="8"></rect><line x1="6" y1="14" x2="18" y2="14"></line></svg> Print</button>');
  h.push('</div>');
  h.push('<div id="p038subContent">');
  h.push('<div class="p038sub-page">');
  h.push('<table class="deb"><colgroup><col style="width:70pt"><col style="width:300pt"><col style="width:70pt"><col style="width:360pt"></colgroup>');
  h.push('<tr><td colspan="4" class="title">\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E41\u0E25\u0E30\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E2D\u0E07</td></tr>');
  h.push('<tr><td class="lbl">\u0E23\u0E2B\u0E31\u0E2A\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32</td><td style="vertical-align:top">' + escapeHTML(subCus.code) + '</td><td class="lbl">\u0E40\u0E02\u0E15/\u0E2D\u0E33\u0E40\u0E20\u0E2D</td><td>' + escapeHTML(subCus.contact) + '</td></tr>');
  h.push('<tr><td class="lbl">\u0E0A\u0E37\u0E48\u0E2D\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32</td><td rowspan="2" style="vertical-align:top">' + escapeHTML(subCus.name) + '</td><td class="lbl">\u0E01\u0E25\u0E38\u0E48\u0E21</td><td>' + escapeHTML(subCus.group) + '</td></tr>');
  h.push('<tr><td> </td><td class="lbl">\u0E40\u0E01\u0E23\u0E14</td><td>' + escapeHTML(subCus.grade) + '</td></tr>');
  h.push('<tr><td colspan="4">\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E21\u0E37\u0E48\u0E2D ' + stamp + '</td></tr>');
  h.push('</table>');
  h.push('<table class="main"><colgroup><col style="width:80pt"><col style="width:70pt"><col style="width:410pt"><col style="width:60pt"><col style="width:60pt"><col style="width:60pt"><col style="width:60pt"></colgroup>');
  h.push('<tr><th>\u0E40\u0E25\u0E02\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th><th>\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</th><th>\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07</th><th>\u0E40\u0E1A\u0E34\u0E01\u0E08\u0E2D\u0E07</th><th>\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D</th><th>\u0E2B\u0E19\u0E48\u0E27\u0E22</th></tr>');
  subRows.forEach(function (r) {
    var isRsv = r.vnos.indexOf("RSV") === 0;
    h.push('<tr' + (isRsv ? ' class="rsv"' : '') + '>');
    h.push('<td>' + escapeHTML(r.vnos) + '</td>');
    h.push('<td>' + escapeHTML(r.stkcode) + '</td>');
    h.push('<td>' + escapeHTML(r.desc) + '</td>');
    h.push('<td class="num">' + formatNumber(r.qty) + '</td>');
    h.push('<td class="num">' + formatNumber(r.rsv) + '</td>');
    h.push('<td class="num">' + formatNumber(r.balance) + '</td>');
    h.push('<td>' + escapeHTML(r.unit) + '</td>');
    h.push('</tr>');
  });
  for (var bi = subRows.length; bi < 15; bi++) {
    h.push('<tr><td> </td><td> </td><td>&nbsp;</td><td> </td><td> </td><td> </td><td> </td></tr>');
  }
  h.push('</table>');
  h.push('</div>');
  h.push('</div>');
  h.push('<script>var _z=100;var _c=document.getElementById("p038subContent");function _sz(){_c.style.zoom=(_z/100);var l=document.getElementById("p038subZoom");if(l)l.textContent=_z+"%"}document.getElementById("p038subZoomIn").onclick=function(){_z=Math.min(200,_z+25);_sz()};document.getElementById("p038subZoomOut").onclick=function(){_z=Math.max(50,_z-25);_sz()};document.getElementById("p038subPrint").onclick=function(){window.print()};</scr' + 'ipt>');
  h.push('</body></html>');
  return h.join('');
}













function printCustomerCPSRSV() {
  var html = buildCPSRSVHtml();
  if (!html) return;
  var w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
  } else {
    document.getElementById("p038printArea").innerHTML = html;
    window.print();
  }
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


/* ===== Print V2 (C# bgWorker_DoWorkV2) ===== */
var API_V2 = "api/p038_v2.php";
function printV2() {
  var list = currentItems.filter(function (item) {
    return selectedIds.has(item.id);
  });
  if (!list.length) return showToast("\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23");
  v2InjectModal();
  var payload = {
    connectionId: API_CONNECTION_ID,
    products: list.map(function (item) {
      return item.productCode;
    }),
    warehouse: appliedFilters ? appliedFilters.warehouse : "",
    useDate: appliedFilters ? appliedFilters.useDate : false,
    dateFrom: appliedFilters ? appliedFilters.dateFrom : "",
    dateTo: appliedFilters ? appliedFilters.dateTo : "",
    statusAll: appliedFilters ? appliedFilters.statusAll : true,
    statusChecks: appliedFilters ? appliedFilters.statusChecks : []
  };
  var v2btn = document.getElementById("p038printV2Button");
  if (v2btn) { v2btn.disabled = true; v2btn.classList.add("loading"); }
  var apiSeq = ++v2Seq;
  apiPost(API_V2, payload).then(function (d) {
    if (apiSeq !== v2Seq) return;
    if (!d.ok) throw new Error(d.error);
    var f = document.getElementById("p038v2Frame");
    f.srcdoc = v2DocHtml(v2ReportHtml(d));
    var overlay = document.getElementById("p038v2Overlay");
    overlay.classList.add("show");
    v2SetZoom(100);
    if (v2btn) { v2btn.disabled = false; v2btn.classList.remove("loading"); }
  }).catch(function (e) {
    if (apiSeq !== v2Seq) return;
    if (v2btn) { v2btn.disabled = false; v2btn.classList.remove("loading"); }
    showToast("หูจบดาว่: " + e.message);
  });
}
var V3_HTML = [
  '<div class="p038v3-overlay" id="p038v3Overlay">',
  '  <div class="p038v3-modal">',
  '    <div class="p038v3-head">',
  '      <div class="p038v3-title">\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 (V3)</div>',
  '      <div class="p038v3-btns">',
  '        <button class="p038v3-btn" type="button" id="p038v3ZoomOut" title="zoom out">\u2212</button>',
  '        <span class="p038v3-zoomlabel" id="p038v3Zoom">100%</span>',
  '        <button class="p038v3-btn" type="button" id="p038v3ZoomIn" title="zoom in">+</button>',
  '        <button class="p038v3-btn" type="button" id="p038v3Close" title="close">\u2715</button>',
  '      </div>',
  '    </div>',
  '    <div class="p038v3-body" id="p038v3Body"><iframe id="p038v3Frame" title="\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32"></iframe></div>',
  '    <div class="p038v3-foot">',
  '      <div class="p038v3-hint">A4 portrait — margins 20pt</div>',
  '      <button class="p038v3-print" type="button" id="p038v3Print">Print</button>',
  '    </div>',
  '  </div>',
  '</div>'
].join('\n');
var v3Seq = 0;
var v3Zoom = 100;
function v3Esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function v3ReportHtml(d) {
  var now = new Date();
  var pad = function (n) {
    return String(n).padStart(2, "0");
  };
  var stamp = pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear() + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  var cols = '<colgroup><col style="width:55pt"><col style="width:70pt"><col style="width:255pt"><col style="width:55pt"><col style="width:55pt"><col style="width:55pt"></colgroup>';
  var h = '<section class="p038v3-page">\n<div class="p038v3-pgno">\u0e2b\u0e19\u0e49\u0e32 1</div>\n';
  h += '<table class="p038v3-tbl p038v3-hdr">' + cols + '<tbody>';
  h += '<tr><td colspan="6" class="t">\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</td></tr>';
  h += '<tr><td colspan="6">\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E21\u0E37\u0E48\u0E2D : ' + stamp + '</td></tr>';
  h += '<tr class="h"><th>\u0E01\u0E25\u0E38\u0E48\u0E21\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32<br>\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32<br>\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D</th><th>\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32<br>\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14</th><th>\u0E2B\u0E19\u0E48\u0E27\u0E22<br>\u0E1D\u0E48\u0E32\u0E22\u0E02\u0E32\u0E22</th><th>\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D</th><th>\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07</th></tr>';
  h += '</tbody></table>\n';
  h += '<table class="p038v3-tbl p038v3-data">' + cols + '<tbody>';
  d.rows.forEach(function (p) {
    h += '<tr class="prow">';
    h += '<td class="c">' + v3Esc(p.group) + '</td><td class="c">' + v3Esc(p.stkcode) + '</td><td>' + v3Esc(p.name) + '</td><td class="c">' + v3Esc(p.unit) + '</td><td class="r">' + formatNumber(p.sumstk) + '</td><td class="r">' + formatNumber(p.pending) + '</td></tr>';
    var dateup15 = true;
    var datedown15 = true;
    p.details.forEach(function (r) {
      if (r.datediff > 15 && dateup15) {
        dateup15 = false;
        h += '<tr class="sec"><td> </td><td colspan="2" class="sectxt">\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32\u0020\u0031\u0035\u0020\u0E27\u0E31\u0E19</td><td colspan="3"> </td></tr>';
      }
      if (r.datediff <= 15 && datedown15) {
        datedown15 = false;
        h += '<tr class="sec"><td> </td><td colspan="2" class="sectxt">\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0020\u0031\u0035\u0020\u0E27\u0E31\u0E19</td><td colspan="3"> </td></tr>';
      }
      h += '<tr><td class="r">' + (r.date ? formatDate(r.date) : "") + '</td><td class="c">' + v3Esc(r.vnos) + '</td><td class="msg">' + v3Esc(r.msg) + '</td><td class="c">' + v3Esc(r.dep) + '</td><td class="r">' + formatNumber(r.order) + '</td><td class="r">' + formatNumber(r.balance) + '</td></tr>';
    });
  });
  h += '</tbody></table>\n</section>\n';
  return h;
}
function v3DocHtml(paperInner) {
  // C# A4: Document(PageSize.A4, 20f, 20f, 20f, 20f) = margins 20pt all sides
  var css = [
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
    "@page{size:A4;margin:20pt}",
    "body{margin:0;background:#f1f5f9}",
    ".p038v3-page{box-sizing:border-box;width:210mm;height:297mm;overflow:hidden;margin:0 auto;padding:20pt;background:#fff;font-family:'THSarabunNew','TH Sarabun New',Arial,sans-serif;color:#000;position:relative}",
    ".p038v3-pgno{position:absolute;top:10pt;right:10pt;background:#fff;padding:1px 4px;font-size:10pt;font-weight:bold;color:#000}",
    ".p038v3-page+.p038v3-page{margin-top:10px}",
    ".p038v3-tbl{width:550pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
    ".p038v3-tbl th,.p038v3-tbl td{border:1px solid #000;padding:2px 4px;font-size:12pt;vertical-align:middle}",
    ".p038v3-hdr td{font-size:14pt}",
    ".p038v3-hdr td.t{font-size:18pt;font-weight:bold;text-align:center;padding:4px}",
    ".p038v3-hdr tr.h th{background:#dcdcdc;font-size:12pt;font-weight:bold;text-align:center;vertical-align:middle;padding:2px 4px 5px}",
    ".p038v3-hdr tr:nth-of-type(1) td,.p038v3-hdr tr:nth-of-type(2) td{border:0;background:transparent}",
    ".p038v3-data td.msg{white-space:pre-line}",
    ".p038v3-data td.c{text-align:center}",
    ".p038v3-data td.r{text-align:right;padding-right:5px}",
    ".p038v3-data td{border:0}",
    ".p038v3-data tr.prow td{font-weight:bold;background:transparent;color:#1d4ed8;border:0;border-top:1px solid #000;border-bottom:1px solid #000}",
    ".p038v3-data tr.sec td{border:0;background:#fff}",
    ".p038v3-data tr.sec td.sectxt{border-bottom:1px solid #000;font-weight:bold}",
    "@media print{body{background:#fff;zoom:1}.p038v3-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;box-shadow:none;page-break-after:always}.p038v3-page:last-child{page-break-after:auto}.p038v3-tbl tr{page-break-inside:avoid}}"
  ].join("\n");
  var pag = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};" +
    "function rowOver(row){var s=row.closest('section.p038v3-page');if(!s)return false;var sr=s.getBoundingClientRect();var lr=row.getBoundingClientRect();var pb=parseFloat(getComputedStyle(s).paddingBottom)||0;return lr.bottom>sr.bottom-pb}" +
    "function renumber(){var s=document.querySelectorAll('section.p038v3-page');for(var i=0;i<s.length;i++){var f=s[i].querySelector('.p038v3-pgno');if(f)f.textContent='\u0e2b\u0e19\u0e49\u0e32 '+(i+1)}}" +
    "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p038v3-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){if(!s.classList.contains('p038v3-cont'))groups.push([s]);else groups[groups.length-1].push(s)});groups.forEach(function(g){var first=g[0];var t=first.querySelector('table.p038v3-data');if(!t)return;for(var i=1;i<g.length;i++){var t2=g[i].querySelector('table.p038v3-data');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);g[i].parentNode.removeChild(g[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);if(curT.tBodies[0].rows.length>1&&rowOver(row)){curT.tBodies[0].removeChild(row);var s2=document.createElement('section');s2.className='p038v3-page p038v3-cont';var hd=first.querySelector('table.p038v3-hdr');if(hd)s2.appendChild(hd.cloneNode(true));var pn=document.createElement('div');pn.className='p038v3-pgno';s2.appendChild(pn);var nt=document.createElement('table');nt.className='p038v3-tbl p038v3-data';var cg=t.querySelector('colgroup');if(cg)nt.appendChild(cg.cloneNode(true));nt.appendChild(document.createElement('tbody'));s2.appendChild(nt);cur.parentNode.insertBefore(s2,cur.nextSibling);cur=s2;curT=nt;curT.tBodies[0].appendChild(row)}})});renumber()}" +
    "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";
  return '<!doctype html><html><head><meta charset="utf-8"><title>\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</title><style>' + css + "</style></head><body>" + paperInner + pag + "</body></html>";
}
function v3InjectModal() {
  if (document.getElementById("p038v3Overlay")) return;
  var wrap = document.createElement("div");
  wrap.className = "p038-scope";
  wrap.innerHTML = V3_HTML;
  document.body.appendChild(wrap);
  var overlay = wrap.firstChild;
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) v3Close();
  });
  document.getElementById("p038v3Close").addEventListener("click", v3Close);
  document.getElementById("p038v3ZoomOut").addEventListener("click", function () {
    v3SetZoom(Math.round(v3Zoom / 25) * 25 - 25);
  });
  document.getElementById("p038v3ZoomIn").addEventListener("click", function () {
    v3SetZoom(Math.round(v3Zoom / 25) * 25 + 25);
  });
  document.getElementById("p038v3Print").addEventListener("click", function () {
    var f = document.getElementById("p038v3Frame");
    if (f && f.contentWindow) {
      try {
        f.contentWindow.focus();
        f.contentWindow.print();
      } catch (e) { /* ignore */ }
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.getElementById("p038v3Overlay").classList.contains("show")) v3Close();
  });
}
function v3Fit() {
  var body = document.getElementById("p038v3Body");
  var f = document.getElementById("p038v3Frame");
  if (!body || !f) return;
  var apply = function () {
    var doc = f.contentDocument;
    if (!doc) return false;
    var pages = doc.querySelectorAll(".p038v3-page").length;
    if (!pages) return false;
    var pw = 794;
    var ph = pages * 1123 + (pages - 1) * 10;
    var z = Math.min((body.clientWidth - 20) / pw, (body.clientHeight - 20) / ph) * 100;
    v3SetZoom(Math.round(z));
    return true;
  };
  if (apply()) return;
  var n = 0;
  var t = setInterval(function () {
    n++;
    if (apply() || n > 50) clearInterval(t);
  }, 100);
}
function v3SetZoom(z) {
  v3Zoom = Math.max(25, Math.min(200, z));
  var zb = document.getElementById("p038v3Zoom");
  if (zb) zb.textContent = v3Zoom + "%";
  var f = document.getElementById("p038v3Frame");
  if (!f) return;
  var tryIt = function () {
    try {
      if (f.contentWindow && f.contentWindow.setZoom) {
        f.contentWindow.setZoom(v3Zoom / 100);
        return true;
      }
    } catch (e) { /* iframe not ready */ }
    return false;
  };
  if (tryIt()) return;
  var n = 0;
  var t = setInterval(function () {
    n++;
    if (tryIt() || n > 50) clearInterval(t);
  }, 100);
}
function v3Close() {
  var overlay = document.getElementById("p038v3Overlay");
  if (!overlay) return;
  overlay.classList.remove("show");
  var f = document.getElementById("p038v3Frame");
  if (f) f.srcdoc = "";
}
function printV3() {
  var list = currentItems.filter(function (item) {
    return selectedIds.has(item.id);
  });
  if (!list.length) return showToast("\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23");
  v3InjectModal();
  var payload = {
    connectionId: API_CONNECTION_ID,
    products: list.map(function (item) {
      return item.productCode;
    }),
    warehouse: appliedFilters ? appliedFilters.warehouse : "",
    useDate: appliedFilters ? appliedFilters.useDate : false,
    dateFrom: appliedFilters ? appliedFilters.dateFrom : "",
    dateTo: appliedFilters ? appliedFilters.dateTo : "",
    statusAll: appliedFilters ? appliedFilters.statusAll : true,
    statusChecks: appliedFilters ? appliedFilters.statusChecks : []
  };
  var v3btn = document.getElementById("p038printV3Button");
  if (v3btn) { v3btn.disabled = true; v3btn.classList.add("loading"); }
  var apiSeq = ++v3Seq;
  apiPost(API_V2, payload).then(function (d) {
    if (apiSeq !== v3Seq) return;
    if (!d.ok) throw new Error(d.error);
    var f = document.getElementById("p038v3Frame");
    f.srcdoc = v3DocHtml(v3ReportHtml(d));
    var overlay = document.getElementById("p038v3Overlay");
    overlay.classList.add("show");
    v3SetZoom(100);
    if (v3btn) { v3btn.disabled = false; v3btn.classList.remove("loading"); }
  }).catch(function (e) {
    if (apiSeq !== v3Seq) return;
    if (v3btn) { v3btn.disabled = false; v3btn.classList.remove("loading"); }
    showToast("ผิดพลาด: " + e.message);
  });
}

/* ===== Print V2 (A4 portrait modal, 10 cols) ===== */
var V2_HTML = [
  '<div class="p038v2-overlay" id="p038v2Overlay">',
  '  <div class="p038v2-modal">',
  '    <div class="p038v2-head">',
  '      <div class="p038v2-title">\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32 (V2)</div>',
  '      <div class="p038v2-btns">',
  '        <button class="p038v2-btn" type="button" id="p038v2ZoomOut" title="zoom out">\u2212</button>',
  '        <span class="p038v2-zoomlabel" id="p038v2Zoom">100%</span>',
  '        <button class="p038v2-btn" type="button" id="p038v2ZoomIn" title="zoom in">+</button>',
  '        <button class="p038v2-btn" type="button" id="p038v2Close" title="close">\u2715</button>',
  '      </div>',
  '    </div>',
  '    <div class="p038v2-body" id="p038v2Body"><iframe id="p038v2Frame" title="\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32"></iframe></div>',
  '    <div class="p038v2-foot">',
  '      <div class="p038v2-hint">A4 portrait — margins 20pt</div>',
  '      <button class="p038v2-print" type="button" id="p038v2Print">Print</button>',
  '    </div>',
  '  </div>',
  '</div>'
].join('\n');
var v2Seq = 0;
var v2Zoom = 100;
function v2Esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function v2ReportHtml(d) {
  var now = new Date();
  var pad = function (n) {
    return String(n).padStart(2, "0");
  };
  var stamp = pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear() + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  var cols = '<colgroup><col style="width:55pt"><col style="width:70pt"><col style="width:290pt"><col style="width:55pt"><col style="width:55pt"><col style="width:55pt"><col style="width:50pt"><col style="width:70pt"><col style="width:50pt"><col style="width:50pt"></colgroup>';
  var h = '<section class="p038v2-page">\n<div class="p038v2-pgno">\u0e2b\u0e19\u0e49\u0e32 1</div>\n';
  h += '<table class="p038v2-tbl p038v2-hdr">' + cols + '<tbody>';
  h += '<tr><td colspan="10" class="t">\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</td></tr>';
  h += '<tr><td colspan="10">\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E21\u0E37\u0E48\u0E2D : ' + stamp + '</td></tr>';
  h += '<tr class="h"><th>\u0E01\u0E25\u0E38\u0E48\u0E21\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32<br>\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48</th><th>\u0E23\u0E2B\u0E31\u0E2A\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32<br>\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D</th><th>\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32<br>\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14</th><th>\u0E2B\u0E19\u0E48\u0E27\u0E22<br>\u0E1D\u0E48\u0E32\u0E22\u0E02\u0E32\u0E22</th><th>\u0E2A\u0E31\u0E48\u0E07\u0E0B\u0E37\u0E49\u0E2D</th><th>\u0E08\u0E2D\u0E07</th><th>\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07</th><th>\u0E04\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D<br>[01,01-CL] + [03,04-1,04-2]</th><th>ยอดเงิน</th><th>ราคา/หน่วย<br>ทุน/หน่วย</th></tr>';
  h += '</tbody></table>\n';
  h += '<table class="p038v2-tbl p038v2-data">' + cols + '<tbody>';
  d.rows.forEach(function (p) {
    h += '<tr class="prow">';
    h += '<td class="c">' + v2Esc(p.group) + '</td>';
    h += '<td class="c">' + v2Esc(p.stkcode) + '</td>';
    h += '<td>' + v2Esc(p.name) + '</td>';
    h += '<td class="c">' + v2Esc(p.unit) + '</td>';
    h += '<td class="r">' + formatNumber(p.sumstk) + '</td>';
    h += '<td class="r">' + formatNumber(p.rsv) + '</td>';
    h += '<td class="r">' + formatNumber(p.pending) + '</td>';
    h += '<td class="r">' + formatNumber(p.balance) + ' + ' + formatNumber((p.balance03 || 0) + (p.balance04 || 0)) + '</td>';
    h += '<td class="r">' + formatNumber(p.sumvalue) + '</td>';
    h += '<td> </td>';
    h += '</tr>';
    (p.details || []).forEach(function (r) {
      h += '<tr>';
      h += '<td class="r">' + (r.date ? formatDate(r.date) : "") + '</td>';
      h += '<td class="c">' + v2Esc(r.vnos) + '</td>';
      h += '<td class="msg">' + v2Esc(r.msg) + '</td>';
      h += '<td class="c">' + v2Esc(r.dep) + '</td>';
      h += '<td class="r">' + formatNumber(r.order) + '</td>';
      h += '<td class="r">' + formatNumber(r.rsv) + '</td>';
      h += '<td class="r">' + formatNumber(r.balance) + '</td>';
      h += '<td> </td>';
      h += '<td class="r">' + formatNumber(r.value) + '</td>';
      h += '<td class="r">' + formatNumber(r.price) + '</td>';
      h += '</tr>';
    });
  });
  h += '</tbody></table>\n</section>\n';
  return h;
}
function v2DocHtml(paperInner) {
  var css = [
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
    "@page{size:A4 landscape;margin:20pt}",
    "body{margin:0;background:#f1f5f9}",
    ".p038v2-page{box-sizing:border-box;width:297mm;height:210mm;overflow:hidden;margin:0 auto;padding:20pt;background:#fff;font-family:'THSarabunNew','TH Sarabun New',Arial,sans-serif;color:#000;position:relative}",
    ".p038v2-pgno{position:absolute;top:10pt;right:10pt;background:#fff;padding:1px 4px;font-size:10pt;font-weight:bold;color:#000}",
    ".p038v2-page+.p038v2-page{margin-top:10px}",
    ".p038v2-tbl{width:750pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
    ".p038v2-tbl th,.p038v2-tbl td{border:1px solid #000;padding:2px 4px;font-size:10pt;vertical-align:middle}",
    ".p038v2-hdr td{font-size:12pt}",
    ".p038v2-hdr td.t{font-size:16pt;font-weight:bold;text-align:center;padding:4px}",
    ".p038v2-hdr tr.h th{background:#dcdcdc;font-size:10pt;font-weight:bold;text-align:center;vertical-align:middle;padding:2px 4px 5px}",
    ".p038v2-hdr tr:nth-of-type(1) td,.p038v2-hdr tr:nth-of-type(2) td{border:0;background:transparent}",
    ".p038v2-data td.msg{white-space:pre-line}",
    ".p038v2-data td.c{text-align:center}",
    ".p038v2-data td.r{text-align:right;padding-right:5px}",
    ".p038v2-data td{border:0}",
    ".p038v2-data tr.prow td{font-weight:bold;background:transparent;color:#1d4ed8;border:0;border-top:1px solid #000;border-bottom:1px solid #000}",
    "@media print{body{background:#fff;zoom:1}.p038v2-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;box-shadow:none;page-break-after:always}.p038v2-page:last-child{page-break-after:auto}.p038v2-tbl tr{page-break-inside:avoid}}"
  ].join("\n");
  var pag = "<script>function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/794)}fit();window.addEventListener('resize',function(){fit();pag()});window.setZoom=function(z){window.__MAN=z;fit();pag()};" +
    "function rowOver(row){var s=row.closest('section.p038v2-page');if(!s)return false;var sr=s.getBoundingClientRect();var lr=row.getBoundingClientRect();var pb=parseFloat(getComputedStyle(s).paddingBottom)||0;return lr.bottom>sr.bottom-pb}" +
    "function renumber(){var s=document.querySelectorAll('section.p038v2-page');for(var i=0;i<s.length;i++){var f=s[i].querySelector('.p038v2-pgno');if(f)f.textContent='\u0e2b\u0e19\u0e49\u0e32 '+(i+1)}}" +
    "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p038v2-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){if(!s.classList.contains('p038v2-cont'))groups.push([s]);else groups[groups.length-1].push(s)});groups.forEach(function(g){var first=g[0];var t=first.querySelector('table.p038v2-data');if(!t)return;for(var i=1;i<g.length;i++){var t2=g[i].querySelector('table.p038v2-data');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);g[i].parentNode.removeChild(g[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);if(curT.tBodies[0].rows.length>1&&rowOver(row)){curT.tBodies[0].removeChild(row);var s2=document.createElement('section');s2.className='p038v2-page p038v2-cont';var hd=first.querySelector('table.p038v2-hdr');if(hd)s2.appendChild(hd.cloneNode(true));var pn=document.createElement('div');pn.className='p038v2-pgno';s2.appendChild(pn);var nt=document.createElement('table');nt.className='p038v2-tbl p038v2-data';var cg=t.querySelector('colgroup');if(cg)nt.appendChild(cg.cloneNode(true));nt.appendChild(document.createElement('tbody'));s2.appendChild(nt);cur.parentNode.insertBefore(s2,cur.nextSibling);cur=s2;curT=nt;curT.tBodies[0].appendChild(row)}})});renumber()}" +
    "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag()})}else{pag()}window.addEventListener('load',function(){pag()});setTimeout(pag,300);</scr" + "ipt>";
  return '<!doctype html><html><head><meta charset="utf-8"><title>\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E04\u0E49\u0E32\u0E07\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E14\u0E31\u0E19\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32</title><style>' + css + "</style></head><body>" + paperInner + pag + "</body></html>";
}
function v2InjectModal() {
  if (document.getElementById("p038v2Overlay")) return;
  var wrap = document.createElement("div");
  wrap.className = "p038-scope";
  wrap.innerHTML = V2_HTML;
  document.body.appendChild(wrap);
  var overlay = wrap.firstChild;
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) v2Close();
  });
  document.getElementById("p038v2Close").addEventListener("click", v2Close);
  document.getElementById("p038v2ZoomOut").addEventListener("click", function () {
    v2SetZoom(Math.round(v2Zoom / 25) * 25 - 25);
  });
  document.getElementById("p038v2ZoomIn").addEventListener("click", function () {
    v2SetZoom(Math.round(v2Zoom / 25) * 25 + 25);
  });
  document.getElementById("p038v2Print").addEventListener("click", function () {
    var f = document.getElementById("p038v2Frame");
    if (f && f.contentWindow) {
      try {
        f.contentWindow.focus();
        f.contentWindow.print();
      } catch (e) { /* ignore */ }
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.getElementById("p038v2Overlay").classList.contains("show")) v2Close();
  });
}
function v2Fit() {
  var body = document.getElementById("p038v2Body");
  var f = document.getElementById("p038v2Frame");
  if (!body || !f) return;
  var apply = function () {
    var doc = f.contentDocument;
    if (!doc) return false;
    var pages = doc.querySelectorAll(".p038v2-page").length;
    if (!pages) return false;
    var pw = 794;
    var ph = pages * 1123 + (pages - 1) * 10;
    var z = Math.min((body.clientWidth - 20) / pw, (body.clientHeight - 20) / ph) * 100;
    v2SetZoom(Math.round(z));
    return true;
  };
  if (apply()) return;
  var n = 0;
  var t = setInterval(function () {
    n++;
    if (apply() || n > 50) clearInterval(t);
  }, 100);
}
function v2SetZoom(z) {
  v2Zoom = Math.max(25, Math.min(200, z));
  var zb = document.getElementById("p038v2Zoom");
  if (zb) zb.textContent = v2Zoom + "%";
  var f = document.getElementById("p038v2Frame");
  if (!f) return;
  var tryIt = function () {
    try {
      if (f.contentWindow && f.contentWindow.setZoom) {
        f.contentWindow.setZoom(v2Zoom / 100);
        return true;
      }
    } catch (e) { /* iframe not ready */ }
    return false;
  };
  if (tryIt()) return;
  var n = 0;
  var t = setInterval(function () {
    n++;
    if (tryIt() || n > 50) clearInterval(t);
  }, 100);
}
function v2Close() {
  var overlay = document.getElementById("p038v2Overlay");
  if (!overlay) return;
  overlay.classList.remove("show");
  var f = document.getElementById("p038v2Frame");
  if (f) f.srcdoc = "";
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
  pager: document.getElementById("p038pager"),
  printArea: document.getElementById("p038printArea")
};
/* ===== Events ===== */
document.getElementById("p038filterForm").addEventListener("submit", function (event) {
  event.preventDefault();
  search(true);
});
document.getElementById("p038searchText").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    search(true);
  }
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
    var it = null;
    for (var di = 0; di < currentItems.length; di++) {
      if (currentItems[di].id === id) { it = currentItems[di]; break; }
    }
    if (it) openDetailModal(it);
  }
  renderRows();
});
document.getElementById("p038detailClose").addEventListener("click", closeDetailModal);
document.getElementById("p038commentClose").addEventListener("click", closeCommentModal);
document.getElementById("p038commentCancel").addEventListener("click", closeCommentModal);
document.getElementById("p038commentSave").addEventListener("click", saveComment);
document.getElementById("p038detailBody").addEventListener("click", function (event) {
  var btn = event.target.closest("button.p038-edit-btn");
  if (btn) {
    event.stopPropagation();
    openCommentModal(btn.dataset.vnos);
    return;
  }
  var tr = event.target.closest("tr");
  if (!tr) return;
  document.querySelectorAll("#p038detailBody tr").forEach(function (r) { r.classList.remove("selected"); });
  tr.classList.add("selected");
  var tds = tr.querySelectorAll("td");
  if (tds.length > 1) openSubDetail(tds[1].textContent);
});
document.getElementById("p038subPrintButton").addEventListener("click", function () {
  printCustomerCPSRSV();
});
document.getElementById("p038detailOverlay").addEventListener("click", function (event) {
  if (event.target === this) closeDetailModal();
});
document.getElementById("p038commentOverlay").addEventListener("click", function (event) {
  if (event.target === this) closeCommentModal();
});
els.selectAll.addEventListener("change", function () {
  pageItems.forEach(function (item) {
    els.selectAll.checked ? selectedIds.add(item.id) : selectedIds.delete(item.id);
  });
  renderRows();
});
els.pager.addEventListener("click", function (event) {
  var btn = event.target.closest("button[data-pg]");
  if (!btn || btn.disabled) return;
  var pg = btn.dataset.pg;
  var pages = maxPage(currentItems.length);
  if (pg === "first") pageNum = 1;
  else if (pg === "prev") pageNum = Math.max(1, pageNum - 1);
  else if (pg === "next") pageNum = Math.min(pages, pageNum + 1);
  else if (pg === "last") pageNum = pages;
  else pageNum = parseInt(pg, 10) || 1;
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
    pageNum = 1;
    renderRows();
  });
});
document.getElementById("p038printV2Button").addEventListener("click", printV2);
document.getElementById("p038printV3Button").addEventListener("click", printV3);

/* ===== Init ===== */
buildOptionGroups();
}

  function mount(mountEl) {
    var old = document.getElementById("p038Style");
    if (!old) { old = document.createElement("style"); old.id = "p038Style"; document.head.appendChild(old); }
    old.textContent = CSS;
    var stale1 = document.getElementById("p038detailOverlay");
    if (stale1 && stale1.parentNode) stale1.parentNode.removeChild(stale1);
    var stale2 = document.getElementById("p038commentOverlay");
    if (stale2 && stale2.parentNode) stale2.parentNode.removeChild(stale2);
    mountEl.innerHTML = HTML;
    /* move modal overlays to <body>: #appContent has a CSS transform which breaks position:fixed */
    var ov1 = document.getElementById("p038detailOverlay");
    ov1.classList.add("p038-scope");
    document.body.appendChild(ov1);
    var ov2 = document.getElementById("p038commentOverlay");
    ov2.classList.add("p038-scope");
    document.body.appendChild(ov2);
    init();
  }

  window.P038PushPending = { mount: mount, buildCPSRSVHtml: buildCPSRSVHtml };
})();
