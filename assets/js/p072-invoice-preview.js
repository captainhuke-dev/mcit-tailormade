/* P072 Invoice Preview — UI clone of demo/P072_demo.html */
(function () {
  "use strict";

  var CSS = ".p072-scope {\n      --primary: #2563eb;\n      --primary-dark: #1d4ed8;\n      --primary-soft: #eff6ff;\n      --success: #059669;\n      --success-soft: #ecfdf5;\n      --warning: #d97706;\n      --warning-soft: #fffbeb;\n      --danger: #dc2626;\n      --danger-soft: #fef2f2;\n      --bg: #f3f6fb;\n      --surface: #ffffff;\n      --soft: #f8fafc;\n      --text: #172033;\n      --muted: #64748b;\n      --border: #dbe3ef;\n      --radius: 16px;\n      --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);\n    }\n\n.p072-scope * {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0;\n    }\n\n.p072-scope {\n      min-height: 100vh;\n      color: var(--text);\n      background:\n        radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30%),\n        var(--bg);\n      font-family: \"Noto Sans Thai\", sans-serif;\n    }\n\n.p072-scope button, .p072-scope input {\n      font: inherit;\n    }\n\n.p072-scope button {\n      cursor: pointer;\n    }\n\n.p072-scope button:focus-visible, .p072-scope input:focus-visible {\n      outline: 3px solid rgba(37, 99, 235, 0.2);\n      outline-offset: 2px;\n    }\n\n.p072-scope svg {\n      display: block;\n      width: 20px;\n      height: 20px;\n      fill: none;\n      stroke: currentColor;\n      stroke-linecap: round;\n      stroke-linejoin: round;\n      stroke-width: 2;\n    }\n\n.p072-scope .app {\n      min-height: 100vh;\n    }\n\n.p072-scope .topbar {\n      position: sticky;\n      top: 0;\n      z-index: 20;\n      display: flex;\n      min-height: 72px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 16px;\n      padding: 12px 22px;\n      border-bottom: 1px solid var(--border);\n      background: rgba(255, 255, 255, 0.94);\n      box-shadow: 0 3px 16px rgba(15, 23, 42, 0.04);\n      backdrop-filter: blur(14px);\n    }\n\n.p072-scope .brand {\n      display: flex;\n      min-width: 0;\n      align-items: center;\n      gap: 12px;\n    }\n\n.p072-scope .brand-icon {\n      display: grid;\n      width: 46px;\n      height: 46px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: #fff;\n      border-radius: 14px;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 9px 22px rgba(37, 99, 235, 0.25);\n    }\n\n.p072-scope .brand h1 {\n      overflow: hidden;\n      font-size: 19px;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n\n.p072-scope .brand p {\n      margin-top: 2px;\n      color: var(--muted);\n      font-size: 12px;\n    }\n\n.p072-scope .system-status {\n      display: inline-flex;\n      height: 40px;\n      align-items: center;\n      gap: 8px;\n      padding: 0 12px;\n      color: var(--success);\n      border: 1px solid #a7f3d0;\n      border-radius: 11px;\n      background: var(--success-soft);\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n\n.p072-scope .status-dot {\n      width: 7px;\n      height: 7px;\n      border-radius: 50%;\n      background: #10b981;\n      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.14);\n    }\n\n.p072-scope .content {\n      display: flex;\n      width: 100%;\n      max-width: 1500px;\n      min-height: calc(100vh - 72px);\n      flex-direction: column;\n      gap: 14px;\n      margin: 0 auto;\n      padding: 18px 22px 24px;\n    }\n\n.p072-scope /* Launcher */\n\n    .launcher {\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: var(--shadow);\n    }\n\n.p072-scope .launcher-title {\n      display: flex;\n      min-height: 44px;\n      align-items: center;\n      justify-content: space-between;\n      padding: 0 8px 0 16px;\n      color: #fff;\n      background: linear-gradient(90deg, #1e3a8a, #2563eb);\n    }\n\n.p072-scope .launcher-title strong {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      font-size: 14px;\n    }\n\n.p072-scope .close-button {\n      display: grid;\n      width: 31px;\n      height: 31px;\n      place-items: center;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--danger);\n      font-size: 18px;\n    }\n\n.p072-scope .launcher-body {\n      display: block;\n      padding: 19px 22px;\n      background: linear-gradient(180deg, #eefbfd, #e4f9fb);\n    }\n\n.p072-scope .filter-grid {\n      display: grid;\n      grid-template-columns: 1fr;\n      gap: 12px;\n    }\n\n.p072-scope .filter-row {\n      display: flex;\n      flex-wrap: wrap;\n      gap: 12px;\n      align-items: flex-end;\n    }\n\n.p072-scope .filter-row .field:nth-child(2) {\n      width: calc((50% - 9px) / 2);\n    }\n\n.p072-scope .filter-row .field:first-child {\n      width: calc((50% - 9px) / 2);\n    }\n\n.p072-scope .filter-buttons {\n      display: flex;\n      gap: 12px;\n    }\n\n.p072-scope .field label {\n      display: block;\n      margin-bottom: 6px;\n      color: #334155;\n      font-size: 12px;\n      font-weight: 700;\n    }\n\n.p072-scope .field input {\n      width: 100%;\n      height: 41px;\n      padding: 0 11px;\n      color: var(--text);\n      border: 1px solid #b6c5d8;\n      border-radius: 9px;\n      outline: none;\n      background: #fff;\n      font-size: 13px;\n    }\n\n.p072-scope .field input:focus {\n      border-color: #60a5fa;\n      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);\n    }\n\n.p072-scope .date-range {\n      display: grid;\n      max-width: 50%;\n      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);\n      gap: 9px;\n      align-items: start;\n    }\n\n.p072-scope .action-button {\n      display: inline-flex;\n      height: 49px;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      padding: 0 16px;\n      border-radius: 10px;\n      font-size: 13px;\n      font-weight: 700;\n      transition: 0.16s ease;\n    }\n\n.p072-scope .action-button.search {\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22);\n    }\n\n.p072-scope .action-button .btn-spinner {\n      display: none;\n      width: 14px;\n      height: 14px;\n      flex: none;\n      border: 2px solid rgba(255, 255, 255, 0.4);\n      border-top-color: #fff;\n      border-radius: 50%;\n    }\n\n.p072-scope .action-button.loading .btn-spinner {\n      display: inline-block;\n      animation: p072-spin 0.8s linear infinite;\n    }\n\n.p072-scope .action-button.loading {\n      opacity: 0.75;\n      pointer-events: none;\n    }\n\n@keyframes p072-spin {\n      from { transform: rotate(0deg); }\n      to { transform: rotate(360deg); }\n    }\n\n.p072-scope .action-button.preview {\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #10b981, var(--success));\n      box-shadow: 0 8px 18px rgba(5, 150, 105, 0.22);\n    }\n\n.p072-scope .action-button:hover {\n      transform: translateY(-1px);\n      filter: brightness(0.98);\n    }\n\n.p072-scope /* Result Panel */\n\n    .panel {\n      display: flex;\n      min-height: 430px;\n      flex: 1;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: #fff;\n      box-shadow: var(--shadow);\n    }\n\n.p072-scope .panel-header {\n      display: flex;\n      min-height: 60px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 10px 15px;\n      border-bottom: 1px solid var(--border);\n    }\n\n.p072-scope .panel-heading {\n      display: flex;\n      min-width: 0;\n      align-items: center;\n      gap: 10px;\n    }\n\n.p072-scope .panel-icon {\n      display: grid;\n      width: 36px;\n      height: 36px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--primary);\n      border-radius: 10px;\n      background: var(--primary-soft);\n    }\n\n.p072-scope .panel-title h2 {\n      font-size: 14px;\n    }\n\n.p072-scope .panel-title p {\n      margin-top: 1px;\n      color: var(--muted);\n      font-size: 11px;\n    }\n\n.p072-scope .badge {\n      padding: 5px 11px;\n      color: var(--primary-dark);\n      border-radius: 999px;\n      background: #dbeafe;\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n\n.p072-scope .badge-line {\n      padding: 8px 12px;\n      color: var(--primary-dark);\n      background: var(--soft);\n      border-bottom: 1px solid var(--border);\n      font-size: 11px;\n      font-weight: 700;\n    }\n\n.p072-scope .table-wrap {\n      min-height: 0;\n      flex: 1;\n      overflow: auto;\n    }\n\n.p072-scope table {\n      width: 100%;\n      min-width: 940px;\n      border-collapse: separate;\n      border-spacing: 0;\n      white-space: nowrap;\n    }\n\n.p072-scope th {\n      position: sticky;\n      top: 0;\n      z-index: 2;\n      padding: 10px 12px;\n      color: #334155;\n      border-bottom: 1px solid var(--border);\n      background: var(--soft);\n      box-shadow: inset 0 -1px var(--border);\n      font-size: 12px;\n      font-weight: 700;\n      text-align: left;\n      user-select: none;\n    }\n\n.p072-scope th.sortable {\n      cursor: pointer;\n    }\n\n.p072-scope th.sortable:hover {\n      color: var(--primary);\n      background: #eef5ff;\n    }\n\n.p072-scope th.sorted {\n      color: var(--primary-dark);\n      background: #e0ecff;\n    }\n\n.p072-scope td {\n      max-width: 350px;\n      overflow: hidden;\n      padding: 8px 12px;\n      border-bottom: 1px solid #e5ebf3;\n      font-size: 12px;\n      text-overflow: ellipsis;\n    }\n\n.p072-scope th.center, .p072-scope td.center {\n      text-align: center;\n    }\n\n.p072-scope th.number, .p072-scope td.number {\n      text-align: right;\n      font-family: Arial, sans-serif;\n    }\n\n.p072-scope tbody tr {\n      cursor: pointer;\n      transition: 0.12s ease;\n    }\n\n.p072-scope tbody tr:nth-child(even) {\n      background: #fbfdff;\n    }\n\n.p072-scope tbody tr:hover {\n      background: #f0f7ff;\n    }\n\n.p072-scope tbody tr.active td {\n      color: #fff;\n      background: #0878d1;\n    }\n\n.p072-scope .check-cell {\n      width: 40px;\n      text-align: center;\n    }\n\n.p072-scope .check-cell input {\n      width: 16px;\n      height: 16px;\n      accent-color: var(--primary);\n      cursor: pointer;\n    }\n\n.p072-scope .invoice-no {\n      color: var(--primary-dark);\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    }\n\n.p072-scope .customer-code {\n      color: #334155;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    }\n\n.p072-scope .amount {\n      color: #047857;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    }\n\n.p072-scope .copies {\n      display: inline-flex;\n      min-width: 26px;\n      justify-content: center;\n      padding: 3px 8px;\n      color: #7c3aed;\n      border-radius: 7px;\n      background: #f5f3ff;\n      font-family: Arial, sans-serif;\n      font-weight: 700;\n    }\n\n.p072-scope tbody tr.active .invoice-no, .p072-scope tbody tr.active .customer-code, .p072-scope tbody tr.active .amount {\n      color: #fff;\n    }\n\n.p072-scope tbody tr.active .copies {\n      color: #fff;\n      background: rgba(255, 255, 255, 0.22);\n    }\n\n.p072-scope .empty-state {\n      display: none;\n      min-height: 260px;\n      flex: 1;\n      align-items: center;\n      justify-content: center;\n      color: var(--muted);\n      text-align: center;\n    }\n\n.p072-scope .empty-state.show {\n      display: flex;\n    }\n\n.p072-scope .panel-footer {\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 8px 15px;\n      color: var(--muted);\n      border-top: 1px solid var(--border);\n      background: var(--soft);\n      font-size: 12px;\n    }\n\n.p072-scope .selected-chip {\n      padding: 5px 11px;\n      color: #1d4ed8;\n      border: 1px solid #bfdbfe;\n      border-radius: 9px;\n      background: var(--primary-soft);\n      font-weight: 700;\n    }\n\n.p072-scope .pagination {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n    }\n\n.p072-scope .page-btn {\n      width: 30px;\n      height: 30px;\n      display: inline-flex;\n      align-items: center;\n      justify-content: center;\n      border: 1px solid var(--border);\n      border-radius: 8px;\n      background: #fff;\n      color: #1e293b;\n      font-size: 15px;\n      font-weight: 700;\n      cursor: pointer;\n      transition: all 0.15s ease;\n    }\n\n.p072-scope .page-btn:hover:not(:disabled) {\n      border-color: var(--primary);\n      color: var(--primary-dark);\n      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.18);\n      transform: translateY(-1px);\n    }\n\n.p072-scope .page-btn:disabled {\n      opacity: 0.4;\n      cursor: not-allowed;\n    }\n\n.p072-scope .page-info {\n      min-width: 52px;\n      text-align: center;\n      color: var(--primary-dark);\n      font-weight: 700;\n      font-size: 12px;\n    }\n\n.p072-scope .page-numbers {\n      display: flex;\n      gap: 6px;\n    }\n\n.p072-scope .page-num {\n      min-width: 30px;\n      height: 30px;\n      display: inline-flex;\n      align-items: center;\n      justify-content: center;\n      padding: 0 8px;\n      border: 1px solid var(--border);\n      border-radius: 8px;\n      background: #fff;\n      color: #1e293b;\n      font-size: 12px;\n      font-weight: 700;\n      cursor: pointer;\n      transition: all 0.15s ease;\n    }\n\n.p072-scope .page-num:hover {\n      border-color: var(--primary);\n      color: var(--primary-dark);\n    }\n\n.p072-scope .page-num.active {\n      color: #fff;\n      border-color: var(--primary-dark);\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n    }\n\n.p072-scope /* Preview Modal */\n\n    .modal-backdrop {\n      position: fixed;\n      inset: 0;\n      z-index: 100;\n      display: none;\n      padding: 20px;\n      place-items: center;\n      grid-template-columns: minmax(0, 1fr);\n      background: rgba(15, 23, 42, 0.55);\n      backdrop-filter: blur(4px);\n    }\n\n.p072-scope .modal-backdrop.show {\n      display: grid;\n    }\n\n.p072-scope .preview-modal {\n      display: flex;\n      width: min(1080px, 100%);\n      height: 92vh;\n      max-height: 92vh;\n      flex-direction: column;\n      overflow: hidden;\n      border-radius: 16px;\n      background: #fff;\n      box-shadow: 0 28px 75px rgba(15, 23, 42, 0.36);\n    }\n\n.p072-scope .modal-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 13px 17px;\n      color: #fff;\n      background: linear-gradient(90deg, #1e3a8a, #2563eb);\n    }\n\n.p072-scope .modal-header h3 {\n      font-size: 15px;\n    }\n\n.p072-scope .modal-close {\n      width: 30px;\n      height: 30px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: rgba(255, 255, 255, 0.18);\n      font-size: 18px;\n    }\n\n.p072-scope .preview-toolbar {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      gap: 10px;\n      padding: 10px 16px;\n      border-bottom: 1px solid var(--border);\n      background: var(--soft);\n    }\n\n.p072-scope .preview-toolbar span {\n      color: var(--muted);\n      font-size: 12px;\n    }\n\n.p072-scope .print-button {\n      display: inline-flex;\n      height: 35px;\n      align-items: center;\n      gap: 7px;\n      padding: 0 13px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--primary);\n      font-size: 12px;\n      font-weight: 700;\n    }\n\n.p072-scope .preview-area {\n      display: flex;\n      flex: 1 1 auto;\n      min-height: 0;\n      overflow: auto;\n      padding: 0;\n      background: #e2e8f0;\n    }\n\n.p072-scope .preview-frame {\n      display: block;\n      flex: 1 1 auto;\n      width: 100%;\n      height: 100%;\n      min-height: 0;\n      border: 0;\n      background: #e2e8f0;\n    }\n\n.p072-scope .toolbar-right {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    }\n\n.p072-scope .zoom-control {\n      display: inline-flex;\n      align-items: center;\n      gap: 6px;\n    }\n\n.p072-scope .zoom-btn {\n      display: inline-flex;\n      width: 28px;\n      height: 28px;\n      align-items: center;\n      justify-content: center;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 7px;\n      background: #fff;\n      font-size: 16px;\n      font-weight: 700;\n      cursor: pointer;\n    }\n\n.p072-scope .zoom-btn:hover {\n      background: var(--soft);\n    }\n\n.p072-scope .zoom-label {\n      min-width: 44px;\n      color: var(--muted);\n      font-size: 12px;\n      text-align: center;\n    }\n\n.p072-scope .print-now {\n      display: inline-flex;\n      height: 35px;\n      align-items: center;\n      gap: 7px;\n      padding: 0 13px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--primary);\n      font-size: 12px;\n      font-weight: 700;\n      cursor: pointer;\n    }\n\n.p072-scope .paper {\n      width: min(820px, 100%);\n      min-height: 880px;\n      margin: 0 auto;\n      padding: 34px 38px;\n      background: #fff;\n      box-shadow: 0 16px 35px rgba(15, 23, 42, 0.25);\n    }\n\n.p072-scope .paper-head {\n      display: flex;\n      align-items: flex-start;\n      justify-content: space-between;\n      gap: 20px;\n      padding-bottom: 18px;\n      border-bottom: 2px solid #1d4ed8;\n    }\n\n.p072-scope .paper-title h1 {\n      color: #1e3a8a;\n      font-size: 23px;\n    }\n\n.p072-scope .paper-title p {\n      margin-top: 3px;\n      color: #64748b;\n      font-size: 12px;\n    }\n\n.p072-scope .invoice-label {\n      padding: 8px 12px;\n      color: #1d4ed8;\n      border: 1px solid #bfdbfe;\n      border-radius: 10px;\n      background: #eff6ff;\n      font-family: Arial, sans-serif;\n      font-size: 16px;\n      font-weight: 700;\n    }\n\n.p072-scope .invoice-info {\n      display: grid;\n      grid-template-columns: 1fr 1fr;\n      gap: 10px 25px;\n      margin: 20px 0;\n      font-size: 13px;\n    }\n\n.p072-scope .invoice-info strong {\n      color: #1e3a8a;\n    }\n\n.p072-scope .paper table {\n      min-width: 0;\n      border-collapse: collapse;\n      white-space: normal;\n    }\n\n.p072-scope .paper th, .p072-scope .paper td {\n      position: static;\n      padding: 8px;\n      color: #172033;\n      border: 1px solid #cbd5e1;\n      background: #fff;\n      box-shadow: none;\n      font-size: 12px;\n    }\n\n.p072-scope .paper th {\n      color: #1e3a8a;\n      background: #eff6ff;\n    }\n\n.p072-scope .paper-total {\n      margin-top: 12px;\n      color: #1e3a8a;\n      font-size: 15px;\n      font-weight: 700;\n      text-align: right;\n    }\n\n.p072-scope .customer-copy {\n      margin-top: 22px;\n      padding: 13px;\n      border: 1px dashed #94a3b8;\n      border-radius: 8px;\n      color: #475569;\n      font-size: 12px;\n    }\n\n.p072-scope .report-page {\n      width: 760px;\n      min-height: 1000px;\n      margin: 0 auto;\n      padding: 34px 38px;\n      background: #fff;\n      box-shadow: 0 16px 35px rgba(15, 23, 42, 0.25);\n    }\n\n.p072-scope .report-page + .report-page {\n      margin-top: 24px;\n    }\n\n.p072-scope .report-head {\n      display: flex;\n      align-items: flex-start;\n      justify-content: space-between;\n      gap: 20px;\n      padding-bottom: 18px;\n      border-bottom: 2px solid #1d4ed8;\n    }\n\n.p072-scope .report-head h1 {\n      color: #1e3a8a;\n      font-size: 23px;\n    }\n\n.p072-scope .info-grid {\n      display: grid;\n      grid-template-columns: 1fr 1fr;\n      gap: 10px 25px;\n      margin: 20px 0;\n      font-size: 13px;\n    }\n\n.p072-scope .info-grid strong {\n      color: #1e3a8a;\n    }\n\n.p072-scope .line-table {\n      width: 100%;\n      border-collapse: collapse;\n    }\n\n.p072-scope .line-table th, .p072-scope .line-table td {\n      padding: 8px;\n      color: #172033;\n      border: 1px solid #cbd5e1;\n      font-size: 12px;\n    }\n\n.p072-scope .line-table th {\n      color: #1e3a8a;\n      background: #eff6ff;\n    }\n\n.p072-scope .report-total {\n      margin-top: 12px;\n      color: #1e3a8a;\n      font-size: 15px;\n      font-weight: 700;\n      text-align: right;\n    }\n\n.p072-scope .toast {\n      position: fixed;\n      right: 20px;\n      bottom: 20px;\n      z-index: 200;\n      display: flex;\n      visibility: hidden;\n      align-items: center;\n      gap: 8px;\n      padding: 11px 14px;\n      color: #fff;\n      border-radius: 11px;\n      opacity: 0;\n      background: #0f172a;\n      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.28);\n      font-size: 12px;\n      transform: translateY(12px);\n      transition: 0.2s ease;\n    }\n\n.p072-scope .toast.show {\n      visibility: visible !important;\n      opacity: 1 !important;\n      transform: translateY(0) !important;\n    }\n\n.p072-scope .toast svg {\n      color: #34d399;\n    }\n\n@media print {\n@page {\n        size: A4 portrait;\n        margin: 10mm;\n      }\n\n.p072-scope * {\n        visibility: hidden !important;\n      }\n\n.p072-scope .preview-modal, .p072-scope .preview-modal * {\n        visibility: visible !important;\n      }\n\n.p072-scope .preview-modal {\n        position: static;\n        width: auto;\n        max-width: none;\n        height: auto;\n        padding: 0;\n        border: 0;\n        border-radius: 0;\n        background: #fff;\n        box-shadow: none;\n      }\n\n.p072-scope .modal-header, .p072-scope .preview-toolbar {\n        display: none !important;\n      }\n\n.p072-scope .preview-area {\n        display: block;\n        padding: 0;\n        overflow: visible;\n        background: #fff;\n      }\n\n.p072-scope .report-page {\n        width: auto;\n        min-height: 0;\n        margin: 0;\n        padding: 0;\n        box-shadow: none;\n        page-break-after: always;\n      }\n\n.p072-scope .report-page:last-child {\n        page-break-after: auto;\n      }\n}\n\n@media (max-width: 900px) {\n.p072-scope .launcher-body {\n        grid-template-columns: 1fr;\n      }\n}\n\n@media (max-width: 680px) {\n.p072-scope .topbar {\n        min-height: 66px;\n        padding: 10px 13px;\n      }\n\n.p072-scope .brand h1 {\n        font-size: 15px;\n      }\n\n.p072-scope .brand p, .p072-scope .system-status {\n        display: none;\n      }\n\n.p072-scope .content {\n        padding: 12px;\n      }\n\n.p072-scope .filter-grid {\n        grid-template-columns: 1fr;\n      }\n\n.p072-scope .date-range {\n        grid-template-columns: 1fr;\n      }\n\n.p072-scope .panel-header, .p072-scope .panel-footer {\n        align-items: flex-start;\n        flex-direction: column;\n      }\n\n.p072-scope .modal-backdrop {\n        padding: 8px;\n      }\n\n.p072-scope .preview-area {\n        padding: 12px;\n      }\n\n.p072-scope .paper {\n        padding: 20px;\n      }\n\n.p072-scope .invoice-info {\n        grid-template-columns: 1fr;\n      }\n}";

  var HTML = "<div class=\"p072-scope\"><div class=\"app\">\n    <main class=\"content\">\n      <section class=\"launcher\">\n        <div class=\"launcher-title\">\n          <strong>\n            <svg viewBox=\"0 0 24 24\">\n              <path d=\"M6 9V2h12v7\"></path>\n              <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path>\n              <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n            </svg>\n            Invoice รับเอง\n          </strong>\n        </div>\n\n        <form class=\"launcher-body\" id=\"p072filterForm\">\n  <div class=\"filter-grid\">\n    <div class=\"field\">\n              <div class=\"date-range\">\n                <div class=\"date-col\">\n                  <label>วันที่ Invoice</label>\n                  <input id=\"p072dateFrom\" type=\"date\" value=\"2026-11-10\">\n                </div>\n                <div class=\"date-col\">\n                  <label>ถึง</label>\n                  <input id=\"p072dateTo\" type=\"date\" value=\"2026-11-10\">\n                </div>\n              </div>\n            </div>\n    <div class=\"filter-row\">\n      <div class=\"field\">\n              <label for=\"createdBy\">รหัสพนักงาน</label>\n              <input id=\"p072createdBy\" type=\"text\" autocomplete=\"off\" placeholder=\"เช่น ADS901\">\n            </div>\n      <div class=\"field\">\n              <label for=\"invoiceStatus\">สถานะ</label>\n              <input id=\"p072invoiceStatus\" type=\"text\" value=\"6\" autocomplete=\"off\">\n            </div>\n      <div class=\"filter-buttons\">\n        <button class=\"action-button search\" type=\"submit\">\n              <span class=\"btn-spinner\" aria-hidden=\"true\"></span>\n              <svg viewBox=\"0 0 24 24\">\n                <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n                <path d=\"m21 21-4.35-4.35\"></path>\n              </svg>\n              ค้นหา\n            </button>\n      </div>\n    </div>\n  </div>\n</form>\n      </section>\n\n      \n      <section class=\"panel\">\n        <div class=\"panel-header\">\n          <div class=\"panel-heading\">\n            <div class=\"panel-icon\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M3 3h18v18H3z\"></path>\n                <path d=\"M3 9h18M9 3v18\"></path>\n              </svg>\n            </div>\n\n            <div class=\"panel-title\">\n              <h2>รายการ Invoice</h2>\n              <p id=\"p072panelSubtitle\">ติ๊กเลือก Invoice ก่อนกด Preview</p>\n            </div>\n          </div>\n\n          <button class=\"action-button preview\" id=\"p072previewButton\" type=\"button\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z\"></path>\n                <circle cx=\"12\" cy=\"12\" r=\"3\"></circle>\n              </svg>\n              Print Preview\n            </button>\n        </div>\n\n        <div class=\"table-wrap\" id=\"p072tableWrap\">\n          <div class=\"badge-line\"><span class=\"badge\" id=\"p072resultBadge\">0 รายการ</span></div>\n          <table>\n            <thead>\n              <tr>\n                <th class=\"check-cell\"><input id=\"p072selectAll\" type=\"checkbox\" aria-label=\"เลือกทั้งหมด\"></th>\n                <th class=\"sortable\" data-sort=\"invoiceNo\">เลขที่ใบสำคัญ <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"customerCode\">รหัสลูกค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"customer\">ชื่อลูกค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable center\" data-sort=\"area\">พื้นที่ <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"amount\">ยอดรวม <span class=\"arrow\"></span></th>\n                <th class=\"sortable center\" data-sort=\"copies\">จำนวนที่พิมพ์ <span class=\"arrow\"></span></th>\n              </tr>\n            </thead>\n            <tbody id=\"p072resultRows\"></tbody>\n          </table>\n        </div>\n\n        <div class=\"empty-state\" id=\"p072emptyState\">\n          <div>\n            <svg viewBox=\"0 0 24 24\" style=\"width:48px;height:48px;margin:0 auto 10px\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n              <path d=\"m21 21-4.35-4.35M8 11h6\"></path>\n            </svg>\n            <strong>ไม่พบรายการ Invoice ตามเงื่อนไข</strong>\n            <p style=\"margin-top:5px;font-size:11px\">ลองตรวจสอบวันที่ รหัสพนักงาน หรือสถานะ</p>\n          </div>\n        </div>\n\n        <div class=\"panel-footer\">\n          <span id=\"p072footerText\">แสดง 0 รายการ</span>\n                    <div class=\"pagination\">\n            <button class=\"page-btn\" id=\"p072prevPage\" type=\"button\">←</button>\n            <div class=\"page-numbers\" id=\"p072pageNumbers\"></div>\n            <button class=\"page-btn\" id=\"p072nextPage\" type=\"button\">→</button>\n          </div>\n<span class=\"selected-chip\" id=\"p072footerSelected\">เลือกแล้ว 0 รายการ</span>\n        </div>\n      </section>\n    </main>\n  </div></div>";

  var MODAL = "<div class=\"modal-backdrop\" id=\"p072previewModal\">\n    <section class=\"preview-modal\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"modal-header\">\n        <h3>Print Preview - Invoice รับเอง</h3>\n        <button class=\"modal-close\" id=\"p072closePreview\" type=\"button\">×</button>\n      </div>\n\n      <div class=\"preview-toolbar\">\n        <span id=\"p072previewText\">เอกสารที่เลือก 0 ใบ</span>\n        <div class=\"toolbar-right\">\n          <div class=\"zoom-control\">\n            <button class=\"zoom-btn\" id=\"p072zoomOut\" type=\"button\" title=\"ย่อ\">−</button>\n            <span class=\"zoom-label\" id=\"p072zoomLabel\">100%</span>\n            <button class=\"zoom-btn\" id=\"p072zoomIn\" type=\"button\" title=\"ขยาย\">+</button>\n          </div>\n          <button class=\"print-now\" id=\"p072printNow\" type=\"button\">\n            <svg viewBox=\"0 0 24 24\">\n              <path d=\"M6 9V2h12v7\"></path>\n              <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16\"></path>\n              <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n            </svg>\n            พิมพ์เอกสาร\n          </button>\n        </div>\n      </div>\n\n      <div class=\"preview-area\">\n        <iframe class=\"preview-frame\" id=\"p072previewFrame\" title=\"รายงาน P072\"></iframe>\n      </div>\n    </section>\n  </div>";
  var TOAST = "<div class=\"toast\" id=\"p072toast\">\n    <svg viewBox=\"0 0 24\"><path d=\"M20 6 9 17l-5-5\"></path></svg>\n    <span id=\"p072toastMessage\">ดำเนินการเรียบร้อยแล้ว</span>\n  </div>";

"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var r, e, o = "function" == typeof Symbol ? Symbol : {}, n = o.iterator || "@@iterator", a = o.toStringTag || "@@toStringTag"; function i(o, n, a, i) { var u = n && n.prototype instanceof Generator ? n : Generator, f = Object.create(u.prototype); return _regeneratorDefine2(f, "_invoke", function (t, o, n) { var a, i, u, f = 0, p = n || [], y = !1, G = { p: 0, n: 0, v: r, a: l, f: l.bind(r, 4), d: function d(t, e) { return a = t, i = 0, u = r, G.n = e, c; } }; function l(t, o) { for (i = t, u = o, e = 0; !y && f && !n && e < p.length; e++) { var n, a = p[e], l = G.p, F = a[2]; t > 3 ? (n = F === o) && (u = a[(i = a[4]) ? 5 : (i = 3, 3)], a[4] = a[5] = r) : a[0] <= l && ((n = t < 2 && l < a[1]) ? (i = 0, G.v = o, G.n = a[1]) : l < F && (n = t < 3 || a[0] > o || o > F) && (a[4] = t, a[5] = o, G.n = F, i = 0)); } if (n || t > 1) return c; throw y = !0, o; } return function (n, p, F) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && l(p, F), i = p, u = F; (e = i < 2 ? r : u) || !y;) { a || (i ? i < 3 ? (i > 1 && (G.n = -1), l(i, u)) : G.n = u : G.v = u); try { if (f = 2, a) { if (i || (n = "next"), e = a[n]) { if (!(e = e.call(a, u))) throw TypeError("iterator result is not an object"); if (!e.done) return e; u = e.value, i < 2 && (i = 0); } else 1 === i && (e = a.return) && e.call(a), i < 2 && (u = TypeError("The iterator does not provide a '" + n + "' method"), i = 1); a = r; } else if ((e = (y = G.n < 0) ? u : t.call(o, G)) !== c) break; } catch (t) { a = r, i = 1, u = t; } finally { f = 1; } } return { value: e, done: y }; }; }(o, a, i), !0), f; } var c = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} e = Object.getPrototypeOf; var u = [][n] ? e(e([][n]())) : (_regeneratorDefine2(e = {}, n, function () { return this; }), e), f = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(u); function p(r) { return Object.setPrototypeOf ? Object.setPrototypeOf(r, GeneratorFunctionPrototype) : (r.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(r, a, "GeneratorFunction")), r.prototype = Object.create(f), r; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(f, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, a, "GeneratorFunction"), _regeneratorDefine2(f), _regeneratorDefine2(f, a, "Generator"), _regeneratorDefine2(f, n, function () { return this; }), _regeneratorDefine2(f, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: p }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(a) { return _arrayWithoutHoles(a) || _iterableToArray(a) || _unsupportedIterableToArray(a) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(a) { if (Array.isArray(a)) return _arrayLikeToArray(a); }
function _slicedToArray(e, i) { return _iterableToArrayLimit(e, i) || _unsupportedIterableToArray(e, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(t, e) { if (t) { if ("string" == typeof t) return _arrayLikeToArray(t, e); var o = {}.toString.call(t).slice(8, -1); return "Object" === o && t.constructor && (o = t.constructor.name), "Map" === o || "Set" === o ? Array.from(t) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? _arrayLikeToArray(t, e) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, t) { var e = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { var l, n, i, a, u = [], o = !0, f = !1; try { if (i = (e = e.call(r)).next, 0 === t) { if (Object(e) !== e) return; o = !1; } else for (; !(o = (l = i.call(e)).done) && (u.push(l.value), u.length !== t); o = !0); } catch (r) { f = !0, n = r; } finally { try { if (!o && null != e.return && (a = e.return(), Object(a) !== a)) return; } finally { if (f) throw n; } } return u; } }
var selectedIds = new Set();
var currentItems = [];
var currentId = 1;
var sortField = "invoiceNo";
var sortDirection = "asc";
var PAGE_SIZE = 15;
var currentPage = 1;
var totalPages = 1;
var toastTimer;

  function init() {
var els = {
  rows: document.getElementById("p072resultRows"),
  tableWrap: document.getElementById("p072tableWrap"),
  empty: document.getElementById("p072emptyState"),
  selectAll: document.getElementById("p072selectAll"),
  modal: document.getElementById("p072previewModal"),
  prevPage: document.getElementById("p072prevPage"),
  nextPage: document.getElementById("p072nextPage"),
  pageNumbers: document.getElementById("p072pageNumbers")
};

// ตั้งฟิลด์ "วันที่ Invoice เริ่ม-ถึง" เป็นวันที่ปัจจุบัน (ไม่ใช่ hardcoded)
(function () {
  var now = new Date();
  var pad = function pad(n) {
    return (n < 10 ? "0" : "") + n;
  };
  var today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  var dFrom = document.getElementById("p072dateFrom");
  var dTo = document.getElementById("p072dateTo");
  if (dFrom) dFrom.value = today;
  if (dTo) dTo.value = today;
})();
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
  var toast = document.getElementById("p072toast");
  document.getElementById("p072toastMessage").textContent = message;
  clearTimeout(toastTimer);
  toast.classList.add("show");
  toast.style.visibility = "visible";
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
    toast.style.visibility = "hidden";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
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
  document.getElementById("p072resultBadge").textContent = "".concat(items.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  document.getElementById("p072footerText").textContent = "\u0E41\u0E2A\u0E14\u0E07 ".concat(items.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  document.getElementById("p072footerSelected").textContent = "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 ".concat(selectedCount, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  var allSelected = items.length > 0 && selectedCount === items.length;
  els.selectAll.checked = allSelected;
  els.selectAll.indeterminate = !allSelected && selectedCount > 0;
}
function renderRows() {
  var sorted = sortItems(currentItems);
  els.rows.innerHTML = "";
  totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  updateSortIndicators();
  updateSummary(sorted);
  if (!sorted.length) {
    els.tableWrap.style.display = "none";
    els.empty.classList.add("show");
    return;
  }
  els.tableWrap.style.display = "block";
  els.empty.classList.remove("show");
  if (!sorted.some(function (item) {
    return item.id === currentId;
  })) {
    currentId = sorted[0].id;
  }
  var start = (currentPage - 1) * PAGE_SIZE;
  var pageItems = sorted.slice(start, start + PAGE_SIZE);
  pageItems.forEach(function (item) {
    var tr = document.createElement("tr");
    tr.dataset.id = item.id;
    if (item.id === currentId) {
      tr.classList.add("active");
    }
    tr.innerHTML = "\n          <td class=\"check-cell\">\n            <input type=\"checkbox\" class=\"row-check\" ".concat(selectedIds.has(item.id) ? "checked" : "", ">\n          </td>\n          <td class=\"invoice-no\">").concat(escapeHTML(item.invoiceNo), "</td>\n          <td class=\"customer-code\">").concat(escapeHTML(item.customerCode), "</td>\n          <td title=\"").concat(escapeHTML(item.customer), "\">").concat(escapeHTML(item.customer), "</td>\n          <td class=\"center\">").concat(escapeHTML(item.area), "</td>\n          <td class=\"number amount\">").concat(fmtMoney(item.amount), "</td>\n          <td class=\"center\"><span class=\"copies\">").concat(item.copies, "</span></td>\n        ");
    els.rows.appendChild(tr);
  });
  updatePaginationUI(pageItems.length);
}
function renderPageButtons() {
  var container = els.pageNumbers;
  container.innerHTML = "";
  var windowSize = 5;
  var start = Math.max(1, currentPage - 2);
  var end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1);
  }
  var _loop = function _loop(p) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "page-num" + (p === currentPage ? " active" : "");
    btn.textContent = String(p);
    btn.addEventListener("click", function () {
      currentPage = p;
      renderRows();
    });
    container.appendChild(btn);
  };
  for (var p = start; p <= end; p++) {
    _loop(p);
  }
}
function updatePaginationUI(pageCount) {
  renderPageButtons();
  els.prevPage.disabled = currentPage <= 1;
  els.nextPage.disabled = currentPage >= totalPages;
  document.getElementById("p072footerText").textContent = แสดง + " " + pageCount + " " + รายการ;
}
function applyFilters() {
  return _applyFilters.apply(this, arguments);
}
function _applyFilters() {
  _applyFilters = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var showMessage,
      dateFrom,
      dateTo,
      perCode,
      status,
      searchBtn,
      data,
      resp,
      _args = arguments,
      _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          showMessage = _args.length > 0 && _args[0] !== undefined ? _args[0] : false;
          dateFrom = document.getElementById("p072dateFrom").value;
          dateTo = document.getElementById("p072dateTo").value;
          perCode = document.getElementById("p072createdBy").value.trim();
          status = document.getElementById("p072invoiceStatus").value.trim();
          searchBtn = document.querySelector(".action-button.search");
          if (searchBtn) {
            searchBtn.classList.add("loading");
            searchBtn.disabled = true;
          }
          _context.p = 1;
          _context.n = 2;
          return fetch("api/p072_search.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              connectionId: "c1788406814359",
              dateFrom: dateFrom,
              dateTo: dateTo,
              perCode: perCode,
              status: status
            })
          });
        case 2:
          resp = _context.v;
          _context.n = 3;
          return resp.json();
        case 3:
          data = _context.v;
          _context.n = 5;
          break;
        case 4:
          _context.p = 4;
          _t = _context.v;
          if (searchBtn) {
            searchBtn.classList.remove("loading");
            searchBtn.disabled = false;
          }
          showToast("ไม่พบรายการ Invoice ตามเงื่อนไข");
          return _context.a(2);
        case 5:
          if (data.ok) {
            _context.n = 6;
            break;
          }
          if (searchBtn) {
            searchBtn.classList.remove("loading");
            searchBtn.disabled = false;
          }
          showToast(data.error);
          return _context.a(2);
        case 6:
          if (searchBtn) {
            searchBtn.classList.remove("loading");
            searchBtn.disabled = false;
          }
          currentPage = 1;
          currentItems = data.rows.map(function (row) {
            return {
              id: row.id,
              date: row.date,
              invoiceNo: row.invoiceNo,
              customerCode: row.customerCode,
              customer: row.customer,
              area: row.area,
              amount: row.amount,
              copies: row.copies,
              createdBy: row.createdBy,
              status: row.status,
              items: []
            };
          });
          renderRows();
          document.getElementById("p072panelSubtitle").textContent = "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48 Invoice ".concat(fmtDate(dateFrom), " \u0E16\u0E36\u0E07 ").concat(fmtDate(dateTo), " \xB7 \u0E2A\u0E16\u0E32\u0E19\u0E30 ").concat(status || "ทั้งหมด");
          if (showMessage) {
            showToast("\u0E1E\u0E1A Invoice ".concat(currentItems.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"));
          }
        case 7:
          return _context.a(2);
      }
    }, _callee, null, [[1, 4]]);
  }));
  return _applyFilters.apply(this, arguments);
}
function getSelectedInvoices() {
  var selected = currentItems.filter(function (item) {
    return selectedIds.has(item.id);
  });
  if (selected.length) {
    return selected;
  }
  var current = currentItems.find(function (item) {
    return item.id === currentId;
  });
  return current ? [current] : [];
}
function openPreview() {
  var selected = getSelectedInvoices();
  if (!selected.length) {
    showToast("กรุณาเลือกเอกสารก่อน Print Preview");
    return;
  }
  var ids = selected.map(function (item) {
    return item.invoiceNo;
  }).join(",");
  var frame = document.getElementById("p072previewFrame");
  var url = "report/p069_report.html?ids=" + encodeURIComponent(ids) + "&conn=" + encodeURIComponent("c1788406814359") + "&docs=p072&src=" + encodeURIComponent("P072") + "&_t=" + Date.now();
  els.modal.classList.add("show");
  document.body.style.overflow = "hidden";
  document.getElementById("p072previewText").textContent = "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E2D\u0E01\u0E2A\u0E32\u0E23 ".concat(selected.length, " \u0E43\u0E1A");
  frame.onload = function () {
    try {
      var doc = frame.contentDocument;
      var tb = doc.querySelector(".toolbar");
      if (tb) tb.style.display = "none";
      doc.body.style.background = "#e2e8f0";
    } catch (e) {}
  };
  frame.src = url;
}
var previewZoom = 1;
var ZOOM_MIN = 0.5;
var ZOOM_MAX = 2;
var ZOOM_STEP = 0.25;
function applyZoom() {
  var frame = document.getElementById("p072previewFrame");
  if (!frame) return;
  frame.style.transformOrigin = "top left";
  frame.style.transform = "scale(".concat(previewZoom, ")");
  var label = document.getElementById("p072zoomLabel");
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
document.getElementById("p072zoomIn").addEventListener("click", zoomIn);
document.getElementById("p072zoomOut").addEventListener("click", zoomOut);
function closePreview() {
  els.modal.classList.remove("show");
  document.body.style.overflow = "";
}
document.getElementById("p072filterForm").addEventListener("submit", function (event) {
  event.preventDefault();
  applyFilters(true);
});
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
    if (els.selectAll.checked) {
      selectedIds.add(item.id);
    } else {
      selectedIds.delete(item.id);
    }
  });
  renderRows();
});
els.prevPage.addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    renderRows();
  }
});
els.nextPage.addEventListener("click", function () {
  if (currentPage < totalPages) {
    currentPage++;
    renderRows();
  }
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
    currentPage = 1;
    renderRows();
  });
});
document.getElementById("p072previewButton").addEventListener("click", openPreview);
document.getElementById("p072closePreview").addEventListener("click", closePreview);
document.getElementById("p072printNow").addEventListener("click", function () {
  var frame = document.getElementById("p072previewFrame");
  try {
    if (frame && frame.contentWindow) {
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
els.modal.addEventListener("click", function (event) {
  if (event.target === els.modal) {
    closePreview();
  }
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closePreview();
  }
});
(function () { var _tl = document.getElementById("p072toggleLauncher"); if (_tl) { _tl.addEventListener("click", function () {
  var form = document.getElementById("p072filterForm");
  form.style.display = form.style.display === "none" ? "grid" : "none";
}); } }());  }

  window.P072InvoicePreview = {
    mount: function (root, programId) {
      if (!root) return;
      var styleEl = document.getElementById("p072style");
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "p072style";
        styleEl.textContent = CSS;
        document.head.appendChild(styleEl);
      }
      root.innerHTML = HTML;
      var wrap = document.createElement("div");
      wrap.innerHTML = MODAL + TOAST;
      var modal = wrap.querySelector("#p072previewModal");
      if (modal) {
        var oldWrap = document.getElementById("p072modalWrap");
        if (oldWrap) oldWrap.remove();
        var modalWrap = document.createElement("div");
        modalWrap.id = "p072modalWrap";
        modalWrap.className = "p072-scope";
        modalWrap.style.display = "contents";
        modalWrap.appendChild(modal);
        document.body.appendChild(modalWrap);
      }
      var toast = wrap.querySelector("#p072toast");
      if (toast) {
        var oldToast = document.getElementById("p072toast");
        if (oldToast) oldToast.remove();
        var oldWrap2 = document.getElementById("p072toastWrap");
        if (oldWrap2) oldWrap2.remove();
        document.body.appendChild(toast);
        toast.style.position = "fixed";
        toast.style.right = "20px";
        toast.style.bottom = "20px";
        toast.style.zIndex = "200";
        toast.style.display = "flex";
        toast.style.alignItems = "center";
        toast.style.gap = "8px";
        toast.style.padding = "11px 14px";
        toast.style.color = "#fff";
        toast.style.borderRadius = "11px";
        toast.style.background = "#0f172a";
        toast.style.boxShadow = "0 16px 36px rgba(15, 23, 42, 0.28)";
        toast.style.fontSize = "12px";
        toast.style.visibility = "hidden";
        toast.style.opacity = "0";
        toast.style.transform = "translateY(12px)";
        toast.style.transition = "0.2s ease";
        var svg = toast.querySelector("svg");
        if (svg) {
          svg.style.width = "16px";
          svg.style.height = "16px";
          svg.style.flexShrink = "0";
        }
        var msg = toast.querySelector("span");
        if (msg) {
          msg.style.whiteSpace = "nowrap";
        }
      }
      init();
    }
  };
})();
