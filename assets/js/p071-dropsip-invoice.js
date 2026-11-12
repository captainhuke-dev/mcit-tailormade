(function () {
  var CSS = '.p071-scope {\n\n      --primary: #2563eb;\n      --primary-dark: #1d4ed8;\n      --primary-soft: #eff6ff;\n      --success: #059669;\n      --success-soft: #ecfdf5;\n      --warning: #d97706;\n      --warning-soft: #fffbeb;\n      --danger: #dc2626;\n      --bg: #f3f6fb;\n      --surface: #ffffff;\n      --soft: #f8fafc;\n      --text: #172033;\n      --muted: #64748b;\n      --border: #dbe3ef;\n      --radius: 16px;\n      --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);\n    \n}\n.p071-scope * {\n\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0;\n    \n}\n.p071-scope {\n\n      color: var(--text);\n      background:\n        radial-gradient(circle at top left, rgba(37, 99, 235, 0.10), transparent 30%),\n        var(--bg);\n    \n}\n.p071-scope button, .p071-scope input, .p071-scope select {\n\n      font: inherit;\n    \n}\n.p071-scope button {\n\n      cursor: pointer;\n    \n}\n.p071-scope button:focus-visible, .p071-scope input:focus-visible, .p071-scope select:focus-visible {\n\n      outline: 3px solid rgba(37, 99, 235, 0.20);\n      outline-offset: 2px;\n    \n}\n.p071-scope svg {\n\n      display: block;\n      width: 20px;\n      height: 20px;\n      fill: none;\n      stroke: currentColor;\n      stroke-linecap: round;\n      stroke-linejoin: round;\n      stroke-width: 2;\n    \n}\n.p071-scope .app {\n\n      min-height: 0;\n    \n}\n.p071-scope .topbar {\n\n      position: sticky;\n      top: 0;\n      z-index: 20;\n      display: flex;\n      min-height: 72px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 16px;\n      padding: 12px 22px;\n      border-bottom: 1px solid var(--border);\n      background: rgba(255, 255, 255, 0.94);\n      box-shadow: 0 3px 16px rgba(15, 23, 42, 0.04);\n      backdrop-filter: blur(14px);\n    \n}\n.p071-scope .brand {\n\n      display: flex;\n      min-width: 0;\n      align-items: center;\n      gap: 12px;\n    \n}\n.p071-scope .brand-icon {\n\n      display: grid;\n      width: 46px;\n      height: 46px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: #fff;\n      border-radius: 14px;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 9px 22px rgba(37, 99, 235, 0.25);\n    \n}\n.p071-scope .brand h1 {\n\n      overflow: hidden;\n      font-size: 19px;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    \n}\n.p071-scope .brand p {\n\n      margin-top: 2px;\n      color: var(--muted);\n      font-size: 12px;\n    \n}\n.p071-scope .system-status {\n\n      display: inline-flex;\n      height: 40px;\n      align-items: center;\n      gap: 8px;\n      padding: 0 12px;\n      color: var(--success);\n      border: 1px solid #a7f3d0;\n      border-radius: 11px;\n      background: var(--success-soft);\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    \n}\n.p071-scope .status-dot {\n\n      width: 7px;\n      height: 7px;\n      border-radius: 50%;\n      background: #10b981;\n      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);\n    \n}\n.p071-scope .content {\n\n      display: flex;\n      width: 100%;\n      max-width: 1600px;\n      flex-direction: column;\n      gap: 30px;\n      margin: 0 auto;\n      padding: 18px 22px 24px;\n    \n}\n.p071-scope /* Launcher */\n\n    .launcher {\n\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: var(--shadow);\n    \n}\n.p071-scope .launcher-title {\n\n      display: flex;\n      min-height: 44px;\n      align-items: center;\n      justify-content: space-between;\n      padding: 0 8px 0 16px;\n      color: #fff;\n      background: linear-gradient(90deg, #1e3a8a, #2563eb);\n    \n}\n.p071-scope .launcher-title strong {\n\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      font-size: 14px;\n    \n}\n.p071-scope .close-button {\n\n      display: grid;\n      width: 31px;\n      height: 31px;\n      place-items: center;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--danger);\n      font-size: 18px;\n    \n}\n.p071-scope .launcher-body {\n\n      display: grid;\n      grid-template-columns: 1fr;\n      gap: 18px;\n      align-items: start;\n      padding: 18px 20px;\n      background: linear-gradient(180deg, #e4fbfd, #edfafd);\n    \n}\n.p071-scope .field-grid {\n\n      display: grid;\n      grid-template-columns: 1fr 1fr 1fr;\n      gap: 11px 14px;\n    \n}\n.p071-scope .field.span-2 {\n\n      grid-column: span 2;\n    \n}\n.p071-scope .field.search-field {\n\n      display: flex;\n      align-items: flex-end;\n    \n}\n.p071-scope .field.search-field .action-button {\n\n      width: 100%;\n    \n}\n.p071-scope .field label {\n\n      display: block;\n      margin-bottom: 6px;\n      color: #334155;\n      font-size: 12px;\n      font-weight: 700;\n    \n}\n.p071-scope .date-range {\n\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);\n      gap: 8px;\n      align-items: center;\n    \n}\n.p071-scope .date-separator {\n\n      color: #475569;\n      font-size: 12px;\n      font-weight: 700;\n    \n}\n.p071-scope .field input, .p071-scope .field select {\n\n      width: 100%;\n      height: 41px;\n      padding: 0 11px;\n      color: var(--text);\n      border: 1px solid #b6c5d8;\n      border-radius: 9px;\n      outline: none;\n      background: #fff;\n      font-size: 13px;\n    \n}\n.p071-scope .field select {\n\n      cursor: pointer;\n    \n}\n.p071-scope .field input:focus, .p071-scope .field select:focus {\n\n      border-color: #60a5fa;\n      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);\n    \n}\n.p071-scope .document-options {\n\n      padding: 13px 15px;\n      border: 1px solid #b9ddeb;\n      border-radius: 12px;\n      background: rgba(255,255,255,0.75);\n    \n}\n.p071-scope .document-options h2 {\n\n      margin-bottom: 9px;\n      color: #1e3a8a;\n      font-size: 12px;\n    \n}\n.p071-scope .document-option {\n\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      margin: 0;\n      color: #334155;\n      font-size: 13px;\n      font-weight: 700;\n      cursor: pointer;\n    \n}\n.p071-scope .options-row {\n\n      display: flex;\n      align-items: center;\n      gap: 18px;\n    \n}\n.p071-scope .document-option input {\n\n      width: 16px;\n      height: 16px;\n      accent-color: var(--primary);\n      cursor: pointer;\n    \n}\n.p071-scope .action-button {\n\n      display: inline-flex;\n      height: 43px;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      padding: 0 17px;\n      border-radius: 10px;\n      font-size: 12px;\n      font-weight: 700;\n      transition: 0.16s ease;\n    \n}\n.p071-scope .action-button.search {\n\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #2563eb, #1d4ed8);\n      box-shadow: 0 8px 18px rgba(37,99,235,0.35);\n    \n}\n.p071-scope .action-button .spinner {\n\n      display: none;\n      flex: none;\n      width: 14px;\n      height: 14px;\n      border: 2px solid rgba(255,255,255,0.4);\n      border-top-color: #fff;\n      border-radius: 50%;\n      animation: p071-spin 0.8s linear infinite;\n    \n}\n.p071-scope .action-button.loading .spinner {\n\n      display: inline-block;\n    \n}\n.p071-scope .action-button.loading {\n\n      pointer-events: none;\n      opacity: 0.9;\n    \n}\n@keyframes p071-spin  {\n\n      to {\n        transform: rotate(360deg);\n      }\n    \n}\n.p071-scope .action-button.preview {\n\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #059669, #047857);\n      box-shadow: 0 8px 18px rgba(5,150,105,0.35);\n    \n}\n.p071-scope .action-button:hover {\n\n      transform: translateY(-1px);\n      filter: brightness(0.98);\n    \n}\n.p071-scope /* Table */\n\n    .panel {\n\n      display: flex;\n      min-height: 420px;\n      margin-top: 6px;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: #fff;\n      box-shadow: var(--shadow);\n    \n}\n.p071-scope .panel-header {\n\n      display: flex;\n      min-height: 60px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 10px 15px;\n      border-bottom: 1px solid var(--border);\n    \n}\n.p071-scope .panel-heading {\n\n      display: flex;\n      min-width: 0;\n      align-items: center;\n      gap: 10px;\n    \n}\n.p071-scope .panel-icon {\n\n      display: grid;\n      width: 36px;\n      height: 36px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--primary);\n      border-radius: 10px;\n      background: var(--primary-soft);\n    \n}\n.p071-scope .panel-title h2 {\n\n      font-size: 14px;\n    \n}\n.p071-scope .panel-title p {\n\n      margin-top: 1px;\n      color: var(--muted);\n      font-size: 11px;\n    \n}\n.p071-scope .badge {\n\n      padding: 5px 11px;\n      color: var(--primary-dark);\n      border-radius: 999px;\n      background: #dbeafe;\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    \n}\n.p071-scope .panel-actions {\n\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    \n}\n.p071-scope .table-wrap {\n\n      min-height: 0;\n      flex: 1;\n      overflow: auto;\n    \n}\n.p071-scope table {\n\n      width: 100%;\n      min-width: 1120px;\n      border-collapse: separate;\n      border-spacing: 0;\n      white-space: nowrap;\n    \n}\n.p071-scope th {\n\n      position: sticky;\n      top: 0;\n      z-index: 2;\n      padding: 10px 12px;\n      color: #334155;\n      border-bottom: 1px solid var(--border);\n      background: var(--soft);\n      box-shadow: inset 0 -1px var(--border);\n      font-size: 12px;\n      font-weight: 700;\n      text-align: left;\n      user-select: none;\n    \n}\n.p071-scope th.sortable {\n\n      cursor: pointer;\n    \n}\n.p071-scope th.sortable:hover {\n\n      color: var(--primary);\n      background: #eef5ff;\n    \n}\n.p071-scope th.sorted {\n\n      color: var(--primary-dark);\n      background: #e0ecff;\n    \n}\n.p071-scope td {\n\n      max-width: 320px;\n      overflow: hidden;\n      padding: 8px 12px;\n      border-bottom: 1px solid #e5ebf3;\n      font-size: 12px;\n      text-overflow: ellipsis;\n    \n}\n.p071-scope th.center, .p071-scope td.center {\n\n      text-align: center;\n    \n}\n.p071-scope th.number, .p071-scope td.number {\n\n      text-align: right;\n      font-family: Arial, sans-serif;\n    \n}\n.p071-scope tbody tr {\n\n      cursor: pointer;\n      transition: 0.12s ease;\n    \n}\n.p071-scope tbody tr:nth-child(even) {\n\n      background: #fbfdff;\n    \n}\n.p071-scope tbody tr:hover {\n\n      background: #f0f7ff;\n    \n}\n.p071-scope tbody tr.active td {\n\n      color: #fff;\n      background: #0878d1;\n    \n}\n.p071-scope tbody tr.active .invoice-no, .p071-scope tbody tr.active .customer-code, .p071-scope tbody tr.active .amount {\n\n      color: #fff;\n    \n}\n.p071-scope .check-cell {\n\n      width: 40px;\n      text-align: center;\n    \n}\n.p071-scope th.col-notes, .p071-scope td.col-notes { width: 90px; }\n.p071-scope .check-cell input {\n\n      width: 16px;\n      height: 16px;\n      accent-color: var(--primary);\n      cursor: pointer;\n    \n}\n.p071-scope .invoice-no {\n\n      color: var(--primary-dark);\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    \n}\n.p071-scope .customer-code {\n\n      color: #334155;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    \n}\n.p071-scope .amount {\n\n      color: #047857;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    \n}\n.p071-scope .copies {\n\n      display: inline-flex;\n      min-width: 25px;\n      justify-content: center;\n      padding: 3px 8px;\n      color: #7c3aed;\n      border-radius: 7px;\n      background: #f5f3ff;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    \n}\n.p071-scope .active .copies {\n\n      color: #fff;\n      background: rgba(255,255,255,0.22);\n    \n}\n.p071-scope .empty-state {\n\n      display: none;\n      min-height: 260px;\n      flex: 1;\n      align-items: center;\n      justify-content: center;\n      color: var(--muted);\n      text-align: center;\n    \n}\n.p071-scope .empty-state.show {\n\n      display: flex;\n    \n}\n.p071-scope .panel-footer {\n\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 8px 15px;\n      color: var(--muted);\n      border-top: 1px solid var(--border);\n      background: var(--soft);\n      font-size: 12px;\n    \n}\n.p071-scope .selected-chip {\n\n      padding: 5px 11px;\n      color: #1d4ed8;\n      border: 1px solid #bfdbfe;\n      border-radius: 9px;\n      background: var(--primary-soft);\n      font-weight: 700;\n    \n}\n.p071-scope .pagination {\n\n      display: flex;\n      align-items: center;\n      gap: 6px;\n    \n}\n.p071-scope .pagination button {\n\n      min-width: 30px;\n      height: 30px;\n      padding: 0 9px;\n      border: 1px solid var(--border);\n      border-radius: 8px;\n      background: #fff;\n      color: var(--text);\n      font-size: 12px;\n      font-weight: 700;\n      cursor: pointer;\n      transition: 0.15s ease;\n    \n}\n.p071-scope .pagination button:hover:not(:disabled):not(.active) {\n\n      border-color: var(--primary);\n      color: var(--primary);\n      background: var(--primary-soft);\n    \n}\n.p071-scope .pagination button.active {\n\n      color: #fff;\n      border-color: var(--primary);\n      background: var(--primary);\n      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);\n    \n}\n.p071-scope .pagination button:disabled {\n\n      color: var(--muted);\n      border-color: var(--border);\n      background: var(--soft);\n      cursor: not-allowed;\n      opacity: 0.6;\n    \n}\n.p071-scope /* Preview modal */\n\n    .modal-backdrop {\n\n      position: fixed;\n      inset: 0;\n      z-index: 100;\n      display: none;\n      padding: 20px;\n      place-items: center;\n      grid-template-columns: minmax(0, 1fr);\n      background: rgba(15,23,42,0.55);\n      backdrop-filter: blur(4px);\n    \n}\n.p071-scope .modal-backdrop.show {\n\n      display: grid;\n    \n}\n.p071-scope .preview-modal {\n\n      display: flex;\n      width: min(1080px, 100%);\n      height: 92vh;\n      max-height: 92vh;\n      flex-direction: column;\n      overflow: hidden;\n      border-radius: 16px;\n      background: #fff;\n      box-shadow: 0 28px 75px rgba(15,23,42,0.36);\n    \n}\n.p071-scope .modal-header {\n\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 13px 17px;\n      color: #fff;\n      background: linear-gradient(90deg, #1e3a8a, #2563eb);\n    \n}\n.p071-scope .modal-header h3 {\n\n      font-size: 15px;\n    \n}\n.p071-scope .modal-close {\n\n      width: 30px;\n      height: 30px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: rgba(255,255,255,0.18);\n      font-size: 18px;\n    \n}\n.p071-scope .preview-toolbar {\n\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      gap: 10px;\n      padding: 10px 16px;\n      border-bottom: 1px solid var(--border);\n      background: var(--soft);\n    \n}\n.p071-scope .preview-toolbar span {\n\n      color: var(--muted);\n      font-size: 12px;\n    \n}\n.p071-scope .print-now {\n\n      display: inline-flex;\n      height: 35px;\n      align-items: center;\n      gap: 7px;\n      padding: 0 13px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--primary);\n      font-size: 12px;\n      font-weight: 700;\n    \n}\n.p071-scope .preview-area {\n\n      display: flex;\n      flex: 1 1 auto;\n      min-height: 0;\n      overflow: auto;\n      padding: 0;\n      background: #e2e8f0;\n    \n}\n.p071-scope .preview-frame {\n\n      display: block;\n      flex: 1 1 auto;\n      width: 100%;\n      height: 100%;\n      min-height: 0;\n      border: 0;\n      background: #e2e8f0;\n    \n}\n.p071-scope .toolbar-right {\n\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    \n}\n.p071-scope .zoom-control {\n\n      display: inline-flex;\n      align-items: center;\n      gap: 6px;\n    \n}\n.p071-scope .zoom-btn {\n\n      display: inline-flex;\n      width: 28px;\n      height: 28px;\n      align-items: center;\n      justify-content: center;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 7px;\n      background: #fff;\n      font-size: 16px;\n      font-weight: 700;\n      cursor: pointer;\n    \n}\n.p071-scope .zoom-btn:hover {\n\n      background: var(--soft);\n    \n}\n.p071-scope .zoom-label {\n\n      min-width: 44px;\n      color: var(--muted);\n      font-size: 12px;\n      text-align: center;\n    \n}\n.p071-scope .toast {\n\n      position: fixed;\n      right: 20px;\n      bottom: 20px;\n      z-index: 200;\n      display: flex;\n      visibility: hidden;\n      align-items: center;\n      gap: 8px;\n      padding: 11px 14px;\n      color: #fff;\n      border-radius: 11px;\n      opacity: 0;\n      background: #0f172a;\n      box-shadow: 0 16px 36px rgba(15,23,42,0.28);\n      font-size: 12px;\n      transform: translateY(12px);\n      transition: 0.2s ease;\n    \n}\n.p071-scope .toast.show {\n\n      visibility: visible;\n      opacity: 1;\n      transform: translateY(0);\n    \n}\n.p071-scope .toast svg {\n\n      color: #34d399;\n    \n}\n@media (max-width: 1000px)  {\n.p071-scope .launcher-body {\n\n        grid-template-columns: 1fr;\n      \n}\n.p071-scope .action-button {\n\n        flex: 1;\n      \n}\n}\n@media (max-width: 680px)  {\n.p071-scope .topbar {\n\n        min-height: 66px;\n        padding: 10px 13px;\n      \n}\n.p071-scope .brand h1 {\n\n        font-size: 15px;\n      \n}\n.p071-scope .brand p, .p071-scope .system-status {\n\n        display: none;\n      \n}\n.p071-scope .content {\n\n        padding: 12px;\n      \n}\n.p071-scope .field-grid {\n\n        grid-template-columns: 1fr;\n      \n}\n.p071-scope .field.span-2 {\n\n        grid-column: span 1;\n      \n}\n.p071-scope .date-range {\n\n        grid-template-columns: 1fr;\n      \n}\n.p071-scope .date-separator {\n\n        display: none;\n      \n}\n.p071-scope .panel-header, .p071-scope .panel-footer {\n\n        align-items: flex-start;\n        flex-direction: column;\n      \n}\n.p071-scope .modal-backdrop {\n\n        padding: 8px;\n      \n}\n.p071-scope .preview-area {\n\n        padding: 12px;\n      \n}\n}';
  var HTML = '<div class="p071-scope">\n<div class="app">\n\n    <main class="content">\n      <section class="launcher">\n        <div class="launcher-title">\n          <strong>\n            <svg viewBox="0 0 24 24">\n              <path d="M6 9V2h12v7"></path>\n              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>\n              <rect x="6" y="14" width="12" height="8"></rect>\n            </svg>\n            MCIT Print Invoice พิเศษ\n          </strong>\n\n        </div>\n\n        <form class="launcher-body" id="p071-filterForm">\n          <div class="field-grid">\n            <div class="field">\n              <label>วันที่ Invoice</label>\n              <div class="date-range">\n                <input id="p071-dateFrom" type="date" value="2026-11-02">\n                <span class="date-separator">ถึง</span>\n                <input id="p071-dateTo" type="date" value="2026-11-04">\n              </div>\n            </div>\n\n            <div class="field">\n              <label for="createdBy">ผู้สร้างเอกสาร</label>\n              <input id="p071-createdBy" type="text" autocomplete="off">\n            </div>\n\n            <div class="field">\n              <label for="customerCode">รหัสลูกค้า</label>\n              <input id="p071-customerCode" type="text" autocomplete="off">\n            </div>\n\n            <div class="field">\n              <label for="invoiceNo">Doctype</label>\n              <select id="p071-invoiceNo">\n                <option value="IVN" selected>IVN</option>\n                <option value="CBA">CBA</option>\n                <option value="CBC">CBC</option>\n                <option value="ICN">ICN</option>\n                <option value="IMV">IMV</option>\n                <option value="IMN">IMN</option>\n                <option value="ICS">ICS</option>\n                <option value="IVVN">IVVN</option>\n                <option value="1CB7">1CB7</option>\n                <option value="2CBN">2CBN</option>\n                <option value="ICVN">ICVN</option>\n                <option value="IMV7">IMV7</option>\n                <option value="IMVN">IMVN</option>\n                <option value="IVSP">IVSP</option>\n              </select>\n            </div>\n\n            <div class="field">\n              <label for="invoiceStatus">สถานะ Invoice</label>\n              <select id="p071-invoiceStatus">\n                <option value="3" selected>3-ด่วน</option>\n                <option value="4">4-ปกติ - BKK</option>\n                <option value="5">5-ด่วน - BKK</option>\n                <option value="6">6-ลูกค้ารับเอง</option>\n                <option value="17">17-ติดท้ายรถ</option>\n                <option value="18">18-PickList QC/PD</option>\n                <option value="23">23-ค่าขนส่ง</option>\n                <option value="24">24-รายได้อื่น</option>\n                <option value="25">25-เช็คคืน</option>\n                <option value="32">32-Pack - ปกติ</option>\n                <option value="33">33-Pack - ด่วน</option>\n                <option value="34">34-Pack - ปกติ BKK</option>\n                <option value="35">35-Pack - ด่วน BKK</option>\n                <option value="42">42-INV - ปกติ</option>\n                <option value="43">43-INV - ด่วน</option>\n                <option value="44">44-INV - ปกติ BKK</option>\n                <option value="45">45-INV - ด่วน BKK</option>\n                <option value="50">50-PL ปกติ</option>\n                <option value="51">51-PL ด่วน</option>\n                <option value="52">52-Picking List ปกติ</option>\n                <option value="53">53-Picking List ด่วน</option>\n                <option value="54">54-PL ปกติ BKK</option>\n                <option value="55">55-PL ด่วน BKK</option>\n                <option value="60">60-ADS</option>\n                <option value="61">61-ADS ส่ง WH</option>\n                <option value="62">62-ADS ส่ง ACC</option>\n                <option value="65">65-WH</option>\n                <option value="67">67-Not Ship</option>\n              </select>\n            </div>\n            <div class="field search-field">\n              <button class="action-button search" id="p071-searchBtn" type="submit">\n                <span class="spinner" hidden></span>\n                <svg viewBox="0 0 24 24">\n                  <circle cx="11" cy="11" r="8"></circle>\n                  <path d="m21 21-4.35-4.35"></path>\n                </svg>\n                <span class="btn-text">ค้นหา</span>\n              </button>\n            </div>\n          </div>\n        </form>\n      </section>\n\n      <section class="panel">\n        <div class="panel-header">\n          <div class="panel-heading">\n            <div class="panel-icon">\n              <svg viewBox="0 0 24 24">\n                <path d="M3 3h18v18H3z"></path>\n                <path d="M3 9h18M9 3v18"></path>\n              </svg>\n            </div>\n\n            <div class="panel-title">\n              <h2>รายการ Print Invoice พิเศษ</h2>\n              <p id="p071-panelSubtitle">ติ๊กเลือกเอกสารก่อนกด Print Preview</p>\n              <span class="badge" id="p071-resultBadge">0 รายการ</span>\n            </div>\n          </div>\n\n          <div class="panel-actions">\n            <button class="action-button preview" id="p071-previewButton" type="button">\n              <span class="spinner" hidden></span>\n              <svg viewBox="0 0 24 24">\n                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>\n                <circle cx="12" cy="12" r="3"></circle>\n              </svg>\n              <span class="btn-text">Print Preview</span>\n            </button>\n          </div>\n        </div>\n\n        <div class="table-wrap" id="p071-tableWrap">\n          <table>\n            <thead>\n              <tr>\n                <th class="check-cell"><input id="p071-selectAll" type="checkbox" aria-label="เลือกทั้งหมด"></th>\n                <th class="sortable" data-sort="invoiceNo">เลขที่ใบสำคัญ <span class="arrow"></span></th>\n                <th class="sortable" data-sort="customerCode">รหัสลูกค้า <span class="arrow"></span></th>\n                <th class="sortable" data-sort="customer">ชื่อลูกค้า <span class="arrow"></span></th>\n                <th class="sortable center" data-sort="area">พื้นที่ <span class="arrow"></span></th>\n                <th class="sortable number" data-sort="amount">ยอดรวม <span class="arrow"></span></th>\n                <th class="col-notes">หมายเหตุ</th>\n                <th class="sortable center" data-sort="copies">จำนวนที่พิมพ์ <span class="arrow"></span></th>\n                <th class="sortable center" data-sort="createdBy">ผู้สร้างเอกสาร <span class="arrow"></span></th>\n              </tr>\n            </thead>\n            <tbody id="p071-resultRows"></tbody>\n          </table>\n        </div>\n\n        <div class="empty-state" id="p071-emptyState">\n          <div>\n            <svg viewBox="0 0 24 24" style="width:48px;height:48px;margin:0 auto 10px">\n              <circle cx="11" cy="11" r="8"></circle>\n              <path d="m21 21-4.35-4.35M8 11h6"></path>\n            </svg>\n            <strong>ไม่พบรายการ Invoice ตามเงื่อนไข</strong>\n            <p style="margin-top:5px;font-size:11px">ลองเปลี่ยนช่วงวันที่หรือเงื่อนไขการค้นหา</p>\n          </div>\n        </div>\n\n        <div class="panel-footer">\n          <span id="p071-footerText">แสดง 0 รายการ</span>\n          <div class="pagination" id="p071-pagination"></div>\n          <span class="selected-chip" id="p071-footerSelected">เลือกแล้ว 0 รายการ</span>\n        </div>\n      </section>\n    </main>\n  </div>\n<div class="modal-backdrop" id="p071-previewModal">\n    <section class="preview-modal" role="dialog" aria-modal="true">\n      <div class="modal-header">\n        <h3>Print Preview - Invoice พิเศษ</h3>\n        <button class="modal-close" id="p071-closePreview" type="button">×</button>\n      </div>\n\n      <div class="preview-toolbar">\n        <span id="p071-previewText">เอกสารที่เลือก 0 ใบ</span>\n        <div class="toolbar-right">\n          <div class="zoom-control">\n            <button class="zoom-btn" id="p071-zoomOut" type="button" title="ย่อ">−</button>\n            <span class="zoom-label" id="p071-zoomLabel">100%</span>\n            <button class="zoom-btn" id="p071-zoomIn" type="button" title="ขยาย">+</button>\n          </div>\n          <button class="print-now" id="p071-printNow" type="button">\n            <svg viewBox="0 0 24 24">\n              <path d="M6 9V2h12v7"></path>\n              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path>\n              <rect x="6" y="14" width="12" height="8"></rect>\n            </svg>\n            พิมพ์เอกสาร\n          </button>\n        </div>\n      </div>\n\n      <div class="preview-area">\n        <iframe class="preview-frame" id="p071-previewFrame" title="รายงาน P071"></iframe>\n      </div>\n    </section>\n  </div>\n<div class="toast" id="p071-toast">\n    <svg viewBox="0 0 24"><path d="M20 6 9 17l-5-5"></path></svg>\n    <span id="p071-toastMessage">ดำเนินการเรียบร้อยแล้ว</span>\n  </div>\n</div>'
function _toConsumableArray(a) { return _arrayWithoutHoles(a) || _iterableToArray(a) || _unsupportedIterableToArray(a) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(a) { if (Array.isArray(a)) return _arrayLikeToArray(a); }
function _slicedToArray(e, i) { return _iterableToArrayLimit(e, i) || _unsupportedIterableToArray(e, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(t, e) { if (t) { if ("string" == typeof t) return _arrayLikeToArray(t, e); var o = {}.toString.call(t).slice(8, -1); return "Object" === o && t.constructor && (o = t.constructor.name), "Map" === o || "Set" === o ? Array.from(t) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? _arrayLikeToArray(t, e) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, t) { var e = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { var l, n, i, a, u = [], o = !0, f = !1; try { if (i = (e = e.call(r)).next, 0 === t) { if (Object(e) !== e) return; o = !1; } else for (; !(o = (l = i.call(e)).done) && (u.push(l.value), u.length !== t); o = !0); } catch (r) { f = !0, n = r; } finally { try { if (!o && null != e.return && (a = e.return(), Object(a) !== a)) return; } finally { if (f) throw n; } } return u; } }
var selectedIds = new Set([1]);
var currentItems = [];
var currentId = 1;
var sortField = "invoiceNo";
var sortDirection = "asc";
var currentPage = 1;
var PAGE_SIZE = 15;
var toastTimer;
var els;
var moneyFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function fmtMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}
function fmtDate(value) {
  var _value$split = value.split("-"),
    _value$split2 = _slicedToArray(_value$split, 3),
    year = _value$split2[0],
    month = _value$split2[1],
    day = _value$split2[2];
  return "".concat(day, "/").concat(month, "/").concat(year);
}
function escapeHTML(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function showToast(message) {
  var toast = document.getElementById("p071-toast");
  document.getElementById("p071-toastMessage").textContent = message;
  clearTimeout(toastTimer);
  toast.classList.add("show");
  toastTimer = setTimeout(function () {
    return toast.classList.remove("show");
  }, 1900);
}
function sortItems(items) {
  return _toConsumableArray(items).sort(function (a, b) {
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
function updateSortIndicators() {
  document.querySelectorAll("th[data-sort]").forEach(function (header) {
    var active = header.dataset.sort === sortField;
    header.classList.toggle("sorted", active);
    header.querySelector(".arrow").textContent = active ? sortDirection === "asc" ? "▲" : "▼" : "";
  });
}
function updateSummary(items) {
  var selectedCount = items.filter(function (item) {
    return selectedIds.has(item.id);
  }).length;
  document.getElementById("p071-resultBadge").textContent = "".concat(items.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  document.getElementById("p071-footerText").textContent = "\u0E41\u0E2A\u0E14\u0E07 ".concat(items.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  document.getElementById("p071-footerSelected").textContent = "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 ".concat(selectedCount, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  var allSelected = items.length > 0 && selectedCount === items.length;
  els.selectAll.checked = allSelected;
  els.selectAll.indeterminate = !allSelected && selectedCount > 0;
}
function renderRows() {
  var sorted = sortItems(currentItems);
  els.rows.innerHTML = "";
  updateSortIndicators();
  updateSummary(sorted);
  if (!sorted.length) {
    els.tableWrap.style.display = "none";
    els.empty.classList.add("show");
    return;
  }
  els.tableWrap.style.display = "block";
  els.empty.classList.remove("show");
  var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  var start = (currentPage - 1) * PAGE_SIZE;
  var pageItems = sorted.slice(start, start + PAGE_SIZE);
  var hasCurrent = pageItems.some(function (item) {
    return item.id === currentId;
  });
  if (!hasCurrent) {
    currentId = pageItems[0].id;
  }
  pageItems.forEach(function (item) {
    var tr = document.createElement("tr");
    tr.dataset.id = item.id;
    if (item.id === currentId) tr.classList.add("active");
    tr.innerHTML = "\n          <td class=\"check-cell\">\n            <input type=\"checkbox\" class=\"row-check\" ".concat(selectedIds.has(item.id) ? "checked" : "", ">\n          </td>\n          <td class=\"invoice-no\">").concat(escapeHTML(item.invoiceNo), "</td>\n          <td class=\"customer-code\">").concat(escapeHTML(item.customerCode), "</td>\n          <td title=\"").concat(escapeHTML(item.customer), "\">").concat(escapeHTML(item.customer), "</td>\n          <td class=\"center\">").concat(escapeHTML(item.area), "</td>\n          <td class=\"number amount\">").concat(fmtMoney(item.amount), "</td>\n          <td class=\"col-notes\" title=\"").concat(escapeHTML(item.remark), "\">").concat(escapeHTML(item.remark), "</td>\n          <td class=\"center\"><span class=\"copies\">").concat(item.copies, "</span></td>\n          <td class=\"center\">").concat(escapeHTML(item.createdBy), "</td>\n        ");
    els.rows.appendChild(tr);
  });
  renderPagination(totalPages);
}
function renderPagination(totalPages) {
  var el = document.getElementById("p071-pagination");
  el.innerHTML = "";
  if (!totalPages || totalPages <= 1) return;
  var makeBtn = function makeBtn(label, page, disabled, active) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    if (disabled) b.disabled = true;
    if (active) b.classList.add("active");
    b.addEventListener("click", function () {
      if (disabled) return;
      currentPage = page;
      renderRows();
    });
    return b;
  };
  el.appendChild(makeBtn("‹", currentPage - 1, currentPage === 1, false));
  for (var p = 1; p <= totalPages; p++) {
    el.appendChild(makeBtn(String(p), p, false, p === currentPage));
  }
  el.appendChild(makeBtn("›", currentPage + 1, currentPage === totalPages, false));
}
function getSelectedInvoices() {
  return currentItems.filter(function (item) {
    return selectedIds.has(item.id);
  });
}
function openPreview() {
  var selected = getSelectedInvoices();
  if (!selected.length) {
    showToast("กรุณาเลือกใบ Invoice ก่อน");
    return;
  }
  var btn = document.getElementById("p071-previewButton");
  var spinner = btn.querySelector(".spinner");
  var label = btn.querySelector(".btn-text");
  btn.classList.add("loading");
  btn.disabled = true;
  label.textContent = "กำลังสร้าง Preview...";
  spinner.hidden = false;

  // P071: แสดงเฉพาะหน้า Invoice 1,2 (ไม่ใช้ DO) — ส่ง docs=inv
  var ids = selected.map(function (item) {
    return item.invoiceNo;
  }).join(",");
  var docs = "inv";
  var frame = document.getElementById("p071-previewFrame");
  var url = "report/p071_report.html?ids=" + encodeURIComponent(ids) + "&conn=" + encodeURIComponent("c1788406814359") + "&docs=" + encodeURIComponent(docs) + "&src=" + encodeURIComponent(curProgramId) + "&_t=" + Date.now();

  // เปิด modal ก่อน แล้วโหลดหน้าจอรายงานของ P071 เอง เข้า iframe
  els.modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("p071-previewText").textContent = "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 ".concat(selected.length, " \u0E43\u0E1A \xB7 \u0E23\u0E32\u0E22\u0E07\u0E32\u0E19 P071 \xB7 ").concat(docs);
  var settled = false;
  var finish = function finish() {
    if (settled) return;
    settled = true;
    btn.classList.remove("loading");
    btn.disabled = false;
    label.textContent = "Print Preview";
    spinner.hidden = true;
  };
  frame.onload = function () {
    try {
      var doc = frame.contentDocument;
      // ซ่อน toolbar ของ P071 (ปุ่มปิด/พิมพ์) — ให้เหลือเฉพาะรายงาน
      var tb = doc.querySelector(".toolbar");
      if (tb) tb.style.display = "none";
      doc.body.style.background = "#e2e8f0";
    } catch (e) {}
    finish();
  };
  frame.src = url;
  setTimeout(finish, 4000);
}
function closePreview() {
  els.modal.classList.remove("show");
  document.body.style.overflow = "";
}

  function init() {
els = {
  rows: document.getElementById("p071-resultRows"),
  tableWrap: document.getElementById("p071-tableWrap"),
  empty: document.getElementById("p071-emptyState"),
  selectAll: document.getElementById("p071-selectAll"),
  modal: document.getElementById("p071-previewModal")
};
document.getElementById("p071-filterForm").addEventListener("submit", function (event) {
  event.preventDefault();
  loaddata(true);
});

// C# bt_search_Click — รัน SQL ปุ่มค้นหากับ MAC5 ผ่าน api/p071_search.php
function loaddata() {
  var showMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var btn = document.getElementById("p071-searchBtn");
  var spinner = btn.querySelector(".spinner");
  var label = btn.querySelector(".btn-text");
  btn.classList.add("loading");
  btn.disabled = true;
  label.textContent = "กำลังค้นหา...";
  spinner.hidden = false;
  var payload = {
    connectionId: "c1788406814359",
    dateFrom: document.getElementById("p071-dateFrom").value,
    dateTo: document.getElementById("p071-dateTo").value,
    prefix: document.getElementById("p071-invoiceNo").value,
    customerCode: document.getElementById("p071-customerCode").value.trim(),
    createdBy: document.getElementById("p071-createdBy").value.trim(),
    status: document.getElementById("p071-invoiceStatus").value
  };
  fetch("api/p071_search.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).then(function (res) {
    return res.json();
  }).then(function (data) {
    if (!data.ok) throw new Error(data.error || "ไม่สามารถโหลดข้อมูลได้");
    currentItems = data.rows || [];
    currentPage = 1;
    selectedIds.clear();
    currentId = currentItems.length ? currentItems[0].id : 0;
    renderRows();
    if (showMessage) showToast("\u0E1E\u0E1A Invoice ".concat(currentItems.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"));
  }).catch(function (err) {
    showToast("ค้นหาไม่สำเร็จ: " + err.message);
  }).finally(function () {
    btn.classList.remove("loading");
    btn.disabled = false;
    label.textContent = "ค้นหา";
    spinner.hidden = true;
  });
}
els.rows.addEventListener("click", function (event) {
  var row = event.target.closest("tr");
  if (!row) return;
  var id = Number(row.dataset.id);
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
document.getElementById("p071-previewButton").addEventListener("click", openPreview);
document.getElementById("p071-closePreview").addEventListener("click", closePreview);
document.getElementById("p071-printNow").addEventListener("click", function () {
  var frame = document.getElementById("p071-previewFrame");
  try {
    if (frame && frame.contentWindow) {
      // ใช้ onPrintClick ของ P071 (บันทึกจำนวนพิมพ์ + เปิด print dialog)
      if (typeof frame.contentWindow.onPrintClick === "function") {
        frame.contentWindow.onPrintClick();
        return;
      }
      frame.contentWindow.focus();
      frame.contentWindow.print();
      return;
    }
  } catch (e) {}
  window.print();
});

// Zoom ย่อ/ขยายรายงาน — scale iframe ด้วย transform
var previewZoom = 1;
var ZOOM_MIN = 0.5,
  ZOOM_MAX = 2,
  ZOOM_STEP = 0.25;
function applyZoom() {
  var frame = document.getElementById("p071-previewFrame");
  if (!frame) return;
  frame.style.transformOrigin = "top left";
  frame.style.transform = "scale(" + previewZoom + ")";
  var label = document.getElementById("p071-zoomLabel");
  if (label) label.textContent = Math.round(previewZoom * 100) + "%";
}
function zoomIn() {
  if (previewZoom < ZOOM_MAX) {
    previewZoom = Math.min(ZOOM_MAX, previewZoom + ZOOM_STEP);
    applyZoom();
  }
}
function zoomOut() {
  if (previewZoom > ZOOM_MIN) {
    previewZoom = Math.max(ZOOM_MIN, previewZoom - ZOOM_STEP);
    applyZoom();
  }
}
document.getElementById("p071-zoomIn").addEventListener("click", zoomIn);
document.getElementById("p071-zoomOut").addEventListener("click", zoomOut);
els.modal.addEventListener("click", function (event) {
  if (event.target === els.modal) closePreview();
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") closePreview();
});
var _p071tl = document.getElementById("p071-toggleLauncher");
if (_p071tl) _p071tl.addEventListener("click", function () {
  var form = document.getElementById("p071-filterForm");
  form.style.display = form.style.display === "none" ? "grid" : "none";
});

// วันที่ Invoice — ใช้วันปัจจุบันเป็นค่าเริ่มต้นทั้ง from และ to (ไม่ออโต้ค้นหา ให้ผู้ใช้กดปุ่มเอง)
(function () {
  var d = new Date();
  var iso = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  var from = document.getElementById("p071-dateFrom");
  var to = document.getElementById("p071-dateTo");
  if (from) from.value = iso;
  if (to) to.value = iso;
})();
  }

  var curProgramId = "P071";
  function mount(root, programId) {
    curProgramId = programId || "P071";
    root.innerHTML = "<style>" + CSS + "</style>" + HTML;
    init();
  }

  window.P071DropShip = { mount: mount };
})();
