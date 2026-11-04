(function () {
  'use strict';

  var CSS = ".p098-scope{\n      --primary: #2563eb;\n      --primary-dark: #1d4ed8;\n      --primary-soft: #eff6ff;\n      --success: #059669;\n      --success-soft: #ecfdf5;\n      --warning: #d97706;\n      --warning-soft: #fffbeb;\n      --danger: #dc2626;\n      --danger-soft: #fef2f2;\n      --purple: #7c3aed;\n      --purple-soft: #f5f3ff;\n      --bg: #f3f6fb;\n      --surface: #ffffff;\n      --surface-soft: #f8fafc;\n      --text: #172033;\n      --muted: #64748b;\n      --border: #dbe3ef;\n      --radius: 16px;\n      --shadow: 0 12px 32px rgba(15, 23, 42, 0.08);\n\n      /* สีตามคำอธิบายในภาพต้นฉบับ */\n      --c-so: #fff7d1;\n      --c-rsv: #bbf7d0;\n      --c-po: #fecdd3;\n      --c-gradex: #fcd34d;\n      --c-negative: #ef4444;\n    }\n.p098-scope *{ box-sizing: border-box; margin: 0; padding: 0; }\n.p098-scope{\n      min-height: 100vh;\n      color: var(--text);\n      background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 30%), var(--bg);\n    }\n.p098-scope button, .p098-scope input, .p098-scope select{ font: inherit; }\n.p098-scope button{ cursor: pointer; }\n.p098-scope button:focus-visible, .p098-scope input:focus-visible{\n      outline: 3px solid rgba(37, 99, 235, 0.2);\n      outline-offset: 2px;\n    }\n.p098-scope svg{\n      display: block;\n      width: 20px;\n      height: 20px;\n      fill: none;\n      stroke: currentColor;\n      stroke-linecap: round;\n      stroke-linejoin: round;\n      stroke-width: 2;\n    }\n.p098-scope .app{ display: flex; min-height: 100vh; flex-direction: column; }\n.p098-scope /* Header */\n    .topbar{\n      position: sticky;\n      top: 0;\n      z-index: 20;\n      display: flex;\n      min-height: 72px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 16px;\n      padding: 12px 22px;\n      border-bottom: 1px solid var(--border);\n      background: rgba(255, 255, 255, 0.95);\n      box-shadow: 0 3px 16px rgba(15, 23, 42, 0.04);\n      backdrop-filter: blur(14px);\n    }\n.p098-scope .brand{ display: flex; min-width: 0; align-items: center; gap: 12px; }\n.p098-scope .brand-icon{\n      display: grid;\n      width: 46px;\n      height: 46px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: #fff;\n      border-radius: 14px;\n      background: linear-gradient(135deg, #fb923c, #dc2626);\n      box-shadow: 0 9px 22px rgba(220, 38, 38, 0.25);\n    }\n.p098-scope .brand h1{ overflow: hidden; font-size: 19px; text-overflow: ellipsis; white-space: nowrap; }\n.p098-scope .brand p{ margin-top: 2px; color: var(--muted); font-size: 12px; }\n.p098-scope .system-status{\n      display: inline-flex;\n      height: 40px;\n      align-items: center;\n      gap: 8px;\n      padding: 0 12px;\n      color: var(--warning);\n      border: 1px solid #fde68a;\n      border-radius: 11px;\n      background: var(--warning-soft);\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p098-scope .status-dot{\n      width: 7px;\n      height: 7px;\n      border-radius: 50%;\n      background: #f59e0b;\n      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.14);\n    }\n.p098-scope .content{\n      display: flex;\n      width: 100%;\n      max-width: 1800px;\n      flex: 1;\n      flex-direction: column;\n      gap: 14px;\n      margin: 0 auto;\n      padding: 18px 22px 24px;\n    }\n.p098-scope /* Launcher */\n    .launcher-card{\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);\n    }\n.p098-scope .launcher-titlebar{\n      display: flex;\n      min-height: 44px;\n      align-items: center;\n      justify-content: space-between;\n      padding: 0 8px 0 16px;\n      background: linear-gradient(90deg, #1e3a8a, #1d4ed8);\n    }\n.p098-scope .launcher-titlebar span{\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      color: #fff;\n      font-size: 14px;\n      font-weight: 700;\n    }\n.p098-scope .launcher-titlebar span svg{ width: 17px; height: 17px; }\n.p098-scope .titlebar-close{\n      display: grid;\n      width: 32px;\n      height: 32px;\n      place-items: center;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: var(--danger);\n    }\n.p098-scope .titlebar-close:hover{ background: #b91c1c; }\n.p098-scope .titlebar-close svg{ width: 15px; height: 15px; }\n.p098-scope .launcher-body{\n      display: grid;\n      grid-template-columns: minmax(0, 1fr) 250px;\n      gap: 18px;\n      padding: 18px 20px 20px;\n      background: linear-gradient(180deg, #e3f7fb, #eefbfd);\n    }\n.p098-scope .search-area{ display: flex; flex-direction: column; gap: 14px; min-width: 0; }\n.p098-scope .search-grid{\n      display: grid;\n      grid-template-columns: minmax(280px, 1.2fr) minmax(190px, 0.7fr) auto;\n      gap: 16px;\n      align-items: start;\n    }\n.p098-scope .fields{ display: flex; flex-direction: column; gap: 11px; }\n.p098-scope .field-row{ display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }\n.p098-scope .search-inline{ display: flex; align-items: flex-end; gap: 11px; }\n.p098-scope .search-inline > .field{ flex: 1; min-width: 0; }\n.p098-scope .field label{\n      display: block;\n      margin-bottom: 6px;\n      color: #334155;\n      font-size: 12px;\n      font-weight: 700;\n    }\n.p098-scope .date-range{\n      display: grid;\n      grid-template-columns: 1fr auto 1fr;\n      gap: 9px;\n      align-items: center;\n    }\n.p098-scope .date-separator{ color: #475569; font-size: 12px; font-weight: 700; }\n.p098-scope .field input[type=\"text\"], .p098-scope .field input[type=\"date\"]{\n      width: 100%;\n      height: 42px;\n      padding: 0 12px;\n      color: var(--text);\n      border: 1px solid var(--border);\n      border-radius: 10px;\n      outline: none;\n      background: #fff;\n      font-size: 13px;\n    }\n.p098-scope .field input:focus{\n      border-color: #60a5fa;\n      box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.14);\n    }\n.p098-scope .warehouse-card{\n      padding: 11px 13px;\n      border: 1px solid #c9d8ec;\n      border-radius: 12px;\n      background: rgba(255, 255, 255, 0.8);\n    }\n.p098-scope .warehouse-card h3{ margin-bottom: 8px; color: #1e3a8a; font-size: 12px; }\n.p098-scope .warehouse-grid{\n      display: grid;\n      grid-template-columns: repeat(2, 1fr);\n      gap: 7px 14px;\n    }\n.p098-scope .check-item{\n      display: flex;\n      align-items: center;\n      gap: 7px;\n      font-size: 13px;\n      font-weight: 600;\n      cursor: pointer;\n    }\n.p098-scope .check-item input{ width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p098-scope .action-buttons{ display: flex; flex-direction: column; gap: 9px; }\n.p098-scope .action-button{\n      display: inline-flex;\n      width: 150px;\n      height: 46px;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      border-radius: 11px;\n      font-size: 14px;\n      font-weight: 700;\n      transition: 0.16s ease;\n    }\n.p098-scope .action-button.search{\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #38bdf8, var(--primary-dark));\n      box-shadow: 0 10px 22px rgba(37, 99, 235, 0.28);\n    }\n.p098-scope .action-button.search.loading{ pointer-events: none; opacity: .85; }\n.p098-scope .action-button.search.loading svg{ display: none; }\n.p098-scope .action-button.search.loading::before{ content: '';\n      width: 18px;\n      height: 18px;\n      border: 3px solid rgba(255, 255, 255, 0.4);\n      border-top-color: #fff;\n      border-radius: 50%;\n      animation: p098spin 0.8s linear infinite;\n    }\n@keyframes p098spin{ to{ transform: rotate(360deg); } }\n.p098-scope .action-button.print{\n      color: #fff;\n      border: none;\n      background: #2563eb;\n    }\n.p098-scope .action-button:hover{ transform: translateY(-1px); filter: brightness(1.04); }\n.p098-scope .flag-filters{\n      display: flex;\n      flex-wrap: wrap;\n      gap: 10px;\n    }\n.p098-scope .flag-chip{\n      display: inline-flex;\n      align-items: center;\n      gap: 8px;\n      padding: 8px 14px;\n      color: #334155;\n      border: 1px solid #c9d8ec;\n      border-radius: 999px;\n      background: rgba(255, 255, 255, 0.85);\n      font-size: 12.5px;\n      font-weight: 700;\n      cursor: pointer;\n      transition: 0.15s ease;\n    }\n.p098-scope .flag-chip:hover{ border-color: #93c5fd; background: var(--primary-soft); }\n.p098-scope .flag-chip input{ width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p098-scope /* Legend */\n    .legend-card{\n      padding: 13px 15px;\n      border: 1px solid #c9d8ec;\n      border-radius: 12px;\n      background: rgba(255, 255, 255, 0.85);\n    }\n.p098-scope .legend-card h3{ margin-bottom: 10px; color: #1e3a8a; font-size: 12px; }\n.p098-scope .legend-list{ display: flex; flex-direction: column; gap: 8px; }\n.p098-scope .legend-item{\n      display: flex;\n      align-items: center;\n      gap: 10px;\n      font-size: 12.5px;\n      font-weight: 700;\n    }\n.p098-scope .legend-swatch{\n      width: 38px;\n      height: 20px;\n      flex: 0 0 auto;\n      border: 1px solid rgba(15, 23, 42, 0.18);\n      border-radius: 5px;\n    }\n.p098-scope /* Summary */\n    .summary-grid{ display: grid; grid-template-columns: repeat(4, minmax(170px, 1fr)); gap: 12px; }\n.p098-scope .summary-card{\n      display: flex;\n      min-width: 0;\n      align-items: center;\n      gap: 12px;\n      padding: 13px 15px;\n      border: 1px solid var(--border);\n      border-radius: 14px;\n      background: var(--surface);\n      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);\n    }\n.p098-scope .summary-icon{\n      display: grid;\n      width: 42px;\n      height: 42px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--primary);\n      border-radius: 12px;\n      background: var(--primary-soft);\n    }\n.p098-scope .summary-card.red .summary-icon{ color: var(--danger); background: var(--danger-soft); }\n.p098-scope .summary-card.pink .summary-icon{ color: #be185d; background: #fce7f3; }\n.p098-scope .summary-card.orange .summary-icon{ color: var(--warning); background: var(--warning-soft); }\n.p098-scope .summary-text{ min-width: 0; }\n.p098-scope .summary-text span{ display: block; color: var(--muted); font-size: 10px; }\n.p098-scope .summary-text strong{\n      display: block;\n      overflow: hidden;\n      margin-top: 2px;\n      font-size: 18px;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    }\n.p098-scope /* Table */\n    .panel{\n      display: flex;\n      min-height: 420px;\n      flex: 1;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: var(--shadow);\n    }\n.p098-scope .panel-header{\n      display: flex;\n      min-height: 60px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 10px 15px;\n      border-bottom: 1px solid var(--border);\n    }\n.p098-scope .panel-heading{ display: flex; min-width: 0; align-items: center; gap: 10px; }\n.p098-scope .panel-icon{\n      display: grid;\n      width: 36px;\n      height: 36px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--primary);\n      border-radius: 10px;\n      background: var(--primary-soft);\n    }\n.p098-scope .panel-title h2{ overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }\n.p098-scope .panel-title p{ margin-top: 1px; color: var(--muted); font-size: 11px; }\n.p098-scope .badge{\n      padding: 5px 12px;\n      color: var(--primary-dark);\n      border-radius: 999px;\n      background: #dbeafe;\n      font-size: 12px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p098-scope .table-container{ min-height: 0; flex: 1; overflow: auto; }\n.p098-scope table.data{\n      width: 100%;\n      min-width: 1350px;\n      border-collapse: separate;\n      border-spacing: 0;\n      white-space: nowrap;\n    }\n.p098-scope table.data th{\n      position: sticky;\n      top: 0;\n      z-index: 2;\n      padding: 11px 12px;\n      color: #475569;\n      border-bottom: 1px solid var(--border);\n      background: var(--surface-soft);\n      box-shadow: inset 0 -1px var(--border);\n      font-size: 12px;\n      font-weight: 700;\n      text-align: left;\n      user-select: none;\n    }\n.p098-scope table.data th.sortable{ cursor: pointer; }\n.p098-scope table.data th.sortable:hover{ color: var(--primary); background: #f1f5f9; }\n.p098-scope table.data th.sorted{ color: var(--primary-dark); background: #e0ecff; }\n.p098-scope table.data th.h-so{ background: var(--c-so); }\n.p098-scope table.data th.h-rsv{ background: var(--c-rsv); }\n.p098-scope table.data th.h-po{ background: var(--c-po); }\n.p098-scope table.data td{\n      max-width: 340px;\n      overflow: hidden;\n      padding: 9px 12px;\n      border-bottom: 1px solid #edf1f6;\n      font-size: 12.5px;\n      text-overflow: ellipsis;\n    }\n.p098-scope th.center, .p098-scope td.center{ text-align: center; }\n.p098-scope th.number, .p098-scope td.number{ text-align: right; font-family: Arial, sans-serif; }\n.p098-scope table.data tbody tr{ cursor: pointer; transition: 0.14s ease; }\n.p098-scope table.data tbody tr:nth-child(even){ background: #fbfdff; }\n.p098-scope table.data tbody tr:hover{ background: #f0f7ff; }\n.p098-scope table.data tbody tr.checked{ background: #eef6ff; }\n.p098-scope table.data tbody tr.current td{ background: #dbeafe; }\n.p098-scope table.data tbody tr.current td:first-child{ box-shadow: inset 4px 0 var(--primary); }\n.p098-scope .check-cell{ width: 42px; text-align: center; }\n.p098-scope .check-cell input{ width: 16px; height: 16px; accent-color: var(--primary); cursor: pointer; }\n.p098-scope .edit-button{\n      display: inline-flex;\n      height: 28px;\n      align-items: center;\n      padding: 0 13px;\n      color: var(--primary-dark);\n      border: 1px solid #bfdbfe;\n      border-radius: 7px;\n      background: var(--primary-soft);\n      font-size: 12px;\n      font-weight: 700;\n    }\n.p098-scope .edit-button:hover{ color: #fff; background: var(--primary); }\n.p098-scope .product-code{ color: var(--primary-dark); font-family: Arial, sans-serif; font-weight: 700; }\n.p098-scope .product-code.gradex{ padding: 3px 9px; color: #78350f; border-radius: 6px; background: var(--c-gradex); }\n.p098-scope .group-code{ color: #334155; font-family: Arial, sans-serif; }\n.p098-scope .plan-tag{\n      display: inline-flex;\n      padding: 2px 9px;\n      color: #6d28d9;\n      border-radius: 6px;\n      background: var(--purple-soft);\n      font-size: 11px;\n      font-weight: 700;\n    }\n.p098-scope td.c-so{ background: rgba(255, 247, 209, 0.55); }\n.p098-scope td.c-rsv{ background: rgba(187, 247, 208, 0.45); }\n.p098-scope td.c-po{ background: rgba(254, 205, 211, 0.45); }\n.p098-scope td.c-neg{ color: #fff; background: var(--c-negative) !important; font-weight: 700; }\n.p098-scope .zero{ color: #94a3b8; }\n.p098-scope .empty-state{\n      display: none;\n      min-height: 260px;\n      flex: 1;\n      align-items: center;\n      justify-content: center;\n      color: var(--muted);\n      text-align: center;\n    }\n.p098-scope .empty-state.show{ display: flex; }\n.p098-scope .table-footer{\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 8px 15px;\n      color: var(--muted);\n      border-top: 1px solid var(--border);\n      background: var(--surface-soft);\n      font-size: 12px;\n    }\n.p098-scope /* Modal */\n    .modal-backdrop{\n      position: fixed;\n      inset: 0;\n      z-index: 100;\n      display: none;\n      padding: 20px;\n      place-items: center;\n      background: rgba(15, 23, 42, 0.52);\n      backdrop-filter: blur(4px);\n    }\n.p098-scope .modal-backdrop.show{ display: grid; }\n.p098-scope .modal{\n      width: min(520px, 100%);\n      overflow: hidden;\n      border-radius: 16px;\n      background: #fff;\n      box-shadow: 0 28px 75px rgba(15, 23, 42, 0.36);\n    }\n.p098-scope .modal-header{\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 14px 18px;\n      color: #fff;\n      background: linear-gradient(90deg, #1e3a8a, #1d4ed8);\n    }\n.p098-scope .modal-header h3{ font-size: 15px; }\n.p098-scope .modal-close{\n      width: 30px;\n      height: 30px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: rgba(255, 255, 255, 0.18);\n      font-size: 18px;\n    }\n.p098-scope .modal-body{ display: flex; flex-direction: column; gap: 12px; padding: 18px; }\n.p098-scope .modal.print-modal{ width: min(1150px, calc(100vw - 40px)); height: calc(100vh - 40px); max-height: calc(100vh - 40px); display: flex; flex-direction: column; }\n.p098-scope .print-toolbar{ display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--surface-soft); }\n.p098-scope .print-brand{ display: inline-flex; align-items: center; gap: 7px; font-weight: 700; color: var(--primary-dark); }\n.p098-scope .print-brand svg{ width: 20px; height: 20px; }\n.p098-scope .print-tools{ display: flex; align-items: center; gap: 8px; }\n.p098-scope .zoom-btn{ width: 30px; height: 30px; border: 1px solid var(--border); background: var(--surface); border-radius: 8px; font-size: 18px; line-height: 1; cursor: pointer; }\n.p098-scope .zoom-label{ min-width: 46px; text-align: center; font-size: 12px; color: var(--muted); }\n.p098-scope .print-go{ display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: var(--primary); color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }\n.p098-scope .print-go svg{ width: 16px; height: 16px; }\n.p098-scope .print-body{ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #eef2f7; padding: 0; }.print-content{ position: absolute; inset: 0; }\n.print-frame{ display: block; width: 100%; height: 100%; border: 0; background: #eef2f7; }\n.p098-scope .print-sheet{ box-sizing: border-box; width: 297mm; height: auto; background-color: #fff; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,.15); padding: 0; color: #000; font-family: \"THSarabunNew\", sans-serif !important; }\n.p098-scope .rep-page{ box-sizing: border-box; width: 297mm; height: 210mm; padding: 20pt; background: #fff; border: 1px solid #c8c8c8; margin: 0 auto 20pt; position: relative; overflow: hidden; }\n.p098-scope .rep-page-num{ position: absolute; right: 20pt; bottom: 2pt; font-size: 14pt; font-family: \"THSarabunNew\", sans-serif; color: #000; white-space: nowrap; }\n.p098-scope .print-sheet h1{ font-size: 16px; text-align: center; }\n.p098-scope .print-sheet .meta{ margin: 6px 0 10px; font-size: 10px; line-height: 1.6; }\n.p098-scope .print-sheet table{ width: auto; margin: 0 auto; border-collapse: collapse; }\n.p098-scope .print-sheet table.rep-t2{ border: 1px solid #000; }\n.p098-scope .print-sheet th, .p098-scope .print-sheet td{ padding: 3px 5px; border: none; font-size: 14pt; }\n.p098-scope .print-sheet tr.bdr > th, .p098-scope .print-sheet tr.bdr > td{ border: 1px solid #555; }\n.p098-scope .print-sheet tr.vline > td:not(:first-child):not(:nth-child(2)){ border-left: 1px solid #555; }\n.p098-scope .print-sheet td.ctr{ text-align: center; }\n.p098-scope .print-sheet .rep-title{ font-size: 22pt; font-weight: 700; text-align: center; }\n.p098-scope .print-sheet .rep-meta{ font-size: 14pt; }\n.p098-scope .print-sheet td.rep-prod{ font-weight: bold; }\n.p098-scope .print-sheet th{ background: #e2e8f0; font-size: 14pt; font-weight: 700; }\n.p098-scope .print-sheet td.num{ text-align: right; }\n.p098-scope .print-sheet td.neg{ background: #fca5a5; font-weight: 700; }\n.p098-scope .modal.detail{ width: min(920px, 100%); }\n.p098-scope .detail-topbar{ display: flex; flex-wrap: wrap; gap: 18px; padding: 11px 13px; border: 1px solid var(--border); border-radius: 11px; background: var(--surface-soft); font-size: 12.5px; }\n.p098-scope .detail-topbar b{ color: var(--primary-dark); }\n.p098-scope .detail-block{ display: flex; flex-direction: column; gap: 6px; }\n.p098-scope .detail-title{ font-size: 13px; font-weight: 700; color: var(--text); }\n.p098-scope .detail-table-scroll{ max-height: 272px; overflow-y: auto; border: 1px solid var(--border); border-radius: 10px; }\n.p098-scope .detail-table{ width: 100%; border-collapse: collapse; font-size: 12px; }\n.p098-scope .detail-table th, .p098-scope .detail-table td{ padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: left; white-space: nowrap; }\n.p098-scope .detail-table thead th{ position: sticky; top: 0; background: var(--surface-soft); color: var(--muted); font-size: 11.5px; }\n.p098-scope .detail-table td.num, .p098-scope .detail-table th.num{ text-align: right; }\n.p098-scope .modal-info{\n      padding: 11px 13px;\n      border: 1px solid var(--border);\n      border-radius: 11px;\n      background: var(--surface-soft);\n      font-size: 12.5px;\n      line-height: 1.7;\n    }\n.p098-scope .modal-info b{ color: var(--primary-dark); }\n.p098-scope .modal-footer{\n      display: flex;\n      justify-content: flex-end;\n      gap: 9px;\n      padding: 12px 18px;\n      border-top: 1px solid var(--border);\n      background: var(--surface-soft);\n    }\n.p098-scope .btn{\n      height: 40px;\n      padding: 0 22px;\n      border-radius: 10px;\n      font-size: 13px;\n      font-weight: 700;\n    }\n.p098-scope .btn.save{ color: #fff; border: 0; background: var(--success); }\n.p098-scope .btn.cancel{ color: var(--muted); border: 1px solid var(--border); background: #fff; }\n.p098-scope .toast{\n      position: fixed;\n      right: 20px;\n      bottom: 20px;\n      z-index: 200;\n      display: flex;\n      visibility: hidden;\n      align-items: center;\n      gap: 8px;\n      padding: 11px 14px;\n      color: #fff;\n      border-radius: 11px;\n      opacity: 0;\n      background: #0f172a;\n      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.28);\n      font-size: 12px;\n      transform: translateY(12px);\n      transition: 0.2s ease;\n    }\n.p098-scope .toast.show{ visibility: visible; opacity: 1; transform: translateY(0); }\n.p098-scope .toast svg{ width: 17px; height: 17px; color: #34d399; }\n.p098-scope #printArea{ display: none; }\n\n@media (max-width: 1150px) {.p098-scope .launcher-body{ grid-template-columns: 1fr; }\n.p098-scope .legend-list{ flex-direction: row; flex-wrap: wrap; gap: 8px 18px; }}\n@media (max-width: 900px) {.p098-scope .search-grid{ grid-template-columns: 1fr; }\n.p098-scope .action-buttons{ flex-direction: row; }\n.p098-scope .summary-grid{ grid-template-columns: repeat(2, 1fr); }}\n@media (max-width: 680px) {.p098-scope .topbar{ min-height: 66px; padding: 10px 13px; }\n.p098-scope .brand h1{ font-size: 15px; }\n.p098-scope .brand p, .p098-scope .system-status{ display: none; }\n.p098-scope .content{ padding: 12px; }\n.p098-scope .field-row, .p098-scope .date-range{ grid-template-columns: 1fr; }\n.p098-scope .date-separator{ display: none; }\n.p098-scope .summary-grid{ grid-template-columns: 1fr; }\n.p098-scope .panel-header, .p098-scope .table-footer{ align-items: flex-start; flex-direction: column; }}\n.p098-scope .panel-tools{ display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }\n.p098-scope .panel-tools .flag-filters{ gap: 8px; }\n.p098-scope .pagination{ display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 14px; flex-wrap: wrap; }\n.p098-scope .pagination button{ min-width: 34px; height: 34px; padding: 0 12px; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 8px; cursor: pointer; font-size: 13px; line-height: 1; transition: all .15s ease; display: inline-flex; align-items: center; justify-content: center; }\n.p098-scope .pagination button:hover:not(:disabled){ border-color: var(--primary); color: var(--primary); background: var(--primary-soft); }\n.p098-scope .pagination button.active{ background: var(--primary); border-color: var(--primary); color: #fff; }\n.p098-scope .pagination button:disabled{ opacity: .45; cursor: not-allowed; }\n.p098-scope .pagination .page-info{ font-size: 12px; color: var(--muted); margin: 0 4px; }\n.p098-scope .action-button.busy{ opacity: .9; cursor: wait; }\n.p098-scope .action-button.busy .p098-spinner{ animation: p098spin .9s linear infinite; transform-origin: 50% 50%; }\n@keyframes p098spin{ to{ transform: rotate(360deg); } }";

  var HTML = "<div class=\"p098-scope\"><div class=\"app\">\n    <main class=\"content\">\n      <section class=\"launcher-card\">\n        <div class=\"launcher-titlebar\">\n          <span>\n            <svg viewBox=\"0 0 24 24\">\n              <path d=\"M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z\"></path>\n              <path d=\"M12 9v4M12 17h.01\"></path>\n            </svg>\n            ระวังหลังจัดซื้อ\n          </span>\n\n          \n        </div>\n\n        <form class=\"launcher-body\" id=\"p098filterForm\">\n          <div class=\"search-area\">\n            <div class=\"search-grid\">\n              <div class=\"fields\">\n                <div class=\"field\">\n                  <label>ช่วงวันที่</label>\n                  <div class=\"date-range\">\n                    <input id=\"p098dateFrom\" type=\"date\" value=\"\">\n                    <span class=\"date-separator\">ถึง</span>\n                    <input id=\"p098dateTo\" type=\"date\" value=\"\">\n                  </div>\n                </div>\n\n                <div class=\"field-row\">\n                  <div class=\"field\">\n                    <label for=\"productCode\">รหัสสินค้า</label>\n                    <input id=\"p098productCode\" type=\"text\" autocomplete=\"off\" placeholder=\"เช่น 10360017\">\n                  </div>\n\n                  <div class=\"field\">\n                    <label for=\"groupCode\">กลุ่ม</label>\n                    <input id=\"p098groupCode\" type=\"text\" autocomplete=\"off\" placeholder=\"เช่น 1036-\">\n                  </div>\n                </div>\n\n                <div class=\"search-inline\">\n                  <div class=\"field\">\n                    <label for=\"productName\">ชื่อสินค้า</label>\n                    <input id=\"p098productName\" type=\"text\" autocomplete=\"off\" placeholder=\"ค้นหาจากชื่อสินค้า\">\n                  </div>\n                  <button class=\"action-button search\" type=\"submit\">\n                    <svg viewBox=\"0 0 24 24\">\n                      <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n                      <path d=\"m21 21-4.35-4.35\"></path>\n                    </svg>\n                    ค้นหา\n                  </button>\n                </div>\n              </div>\n\n              <div class=\"warehouse-card\">\n                <h3>กลุ่มคลัง</h3>\n                <div class=\"warehouse-grid\" id=\"p098warehouseGrid\"></div>\n              </div>\n            </div>\n\n          </div>\n\n          <aside class=\"legend-card\">\n            <h3>คำอธิบายสี</h3>\n            <div class=\"legend-list\">\n              <div class=\"legend-item\"><span class=\"legend-swatch\" style=\"background:var(--c-so)\"></span>SO</div>\n              <div class=\"legend-item\"><span class=\"legend-swatch\" style=\"background:var(--c-rsv)\"></span>RSV</div>\n              <div class=\"legend-item\"><span class=\"legend-swatch\" style=\"background:var(--c-po)\"></span>PO</div>\n              <div class=\"legend-item\"><span class=\"legend-swatch\" style=\"background:var(--c-gradex)\"></span>เกรด X</div>\n              <div class=\"legend-item\"><span class=\"legend-swatch\" style=\"background:var(--c-negative)\"></span>คงเหลือติดลบ (-)</div>\n            </div>\n          </aside>\n        </form>\n      </section>\n\n      \n\n      <section class=\"panel\">\n        <div class=\"panel-header\">\n          <div class=\"panel-heading\">\n            <div class=\"panel-icon\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M3 3h18v18H3z\"></path>\n                <path d=\"M3 9h18M9 3v18\"></path>\n              </svg>\n            </div>\n\n            <div class=\"panel-title\">\n              <h2>รายการสินค้าที่ต้องระวัง</h2>\n              <p>คลิกแถวเพื่อเลือกแถวปัจจุบัน ติ๊กช่องซ้ายเพื่อเลือกพิมพ์เฉพาะรายการ</p>\n            </div>\n          </div>\n\n          <div class=\"panel-tools\">\n            <div class=\"flag-filters\">\n              <label class=\"flag-chip\"><input id=\"p098flagNegative\" type=\"checkbox\">Stock ติดลบ(-)</label>\n              <label class=\"flag-chip\"><input id=\"p098flagOverPO\" type=\"checkbox\">สินค้าเกิน PO</label>\n              <label class=\"flag-chip\"><input id=\"p098flagGradeX\" type=\"checkbox\">ลูกค้าเกรด X</label>\n            </div>\n            <button class=\"action-button print\" id=\"p098printButton\" type=\"button\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M6 9V2h12v7\"></path>\n                <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path>\n                <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n              </svg>\n              Print\n            </button>\n          </div>\n        </div>\n\n        <div class=\"table-container\" id=\"p098tableContainer\">\n          <table class=\"data\">\n            <thead>\n              <tr>\n                <th class=\"check-cell\"><input id=\"p098selectAll\" type=\"checkbox\" aria-label=\"เลือกทั้งหมด\"></th>\n                <th class=\"center\">Edit</th>\n                <th class=\"sortable\" data-sort=\"productCode\">รหัสสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"group\">กลุ่ม <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"mktPlan\">MKTPlan <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"name\">ชื่อสินค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable number h-so\" data-sort=\"so\">SO <span class=\"arrow\"></span></th>\n                <th class=\"sortable number h-so\" data-sort=\"soNet\">SO (สุทธิ) <span class=\"arrow\"></span></th>\n                <th class=\"sortable number h-rsv\" data-sort=\"rsv\">RSV <span class=\"arrow\"></span></th>\n                <th class=\"sortable number h-po\" data-sort=\"po\">PO <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"pr\">PR <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"sbl\">SBL <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"stock\">Stock <span class=\"arrow\"></span></th>\n              </tr>\n            </thead>\n            <tbody id=\"p098resultRows\"></tbody>\n          </table>\n        </div>\n\n        <div class=\"pagination\" id=\"p098pagination\"></div>\n\n        <div class=\"empty-state\" id=\"p098emptyState\">\n          <div>\n            <svg viewBox=\"0 0 24 24\" style=\"width:48px;height:48px;margin:0 auto 10px\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n              <path d=\"m21 21-4.35-4.35M8 11h6\"></path>\n            </svg>\n            <strong>ไม่พบรายการตามเงื่อนไขที่เลือก</strong>\n            <p style=\"margin-top:5px;font-size:11px\">ลองปรับช่วงวันที่ กลุ่มคลัง หรือยกเลิกตัวกรองด้านบน</p>\n          </div>\n        </div>\n\n        <div class=\"table-footer\">\n          <span id=\"p098footerText\">แสดง 0 รายการ</span>\n          <span id=\"p098footerSelected\">เลือกแล้ว 0 รายการ</span>\n        </div>\n      </section>\n    </main>\n  </div>\n\n  <!-- Edit Modal -->\n  <div class=\"modal-backdrop\" id=\"p098editModal\">\n    <section class=\"modal\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"modal-header\">\n        <h3>แก้ไขข้อมูลสินค้า</h3>\n        <button class=\"modal-close\" id=\"p098closeModal\" type=\"button\" aria-label=\"ปิด\">×</button>\n      </div>\n\n      <div class=\"modal-body\">\n        <div class=\"modal-info\" id=\"p098modalInfo\"></div>\n\n        <div class=\"field\">\n          <label for=\"editStkMemo\">STKmemo</label>\n          <input id=\"p098editStkMemo\" type=\"text\" autocomplete=\"off\">\n        </div>\n      </div>\n\n      <div class=\"modal-footer\">\n        <button class=\"btn cancel\" id=\"p098cancelEdit\" type=\"button\">ยกเลิก</button>\n        <button class=\"btn save\" id=\"p098saveEdit\" type=\"button\">บันทึก</button>\n      </div>\n    </section>\n  </div>\n\n  <div class=\"modal-backdrop\" id=\"p098detailModal\">\n    <section class=\"modal detail\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"modal-header\">\n        <h3>รายละเอียงสินค้า</h3>\n        <button class=\"modal-close\" id=\"p098closeDetailModal\" type=\"button\" aria-label=\"ปิด\">×</button>\n      </div>\n      <div class=\"modal-body\">\n        <div class=\"detail-topbar\" id=\"p098detailTopbar\"></div>\n        <div class=\"detail-block\">\n          <h4 class=\"detail-title\">SO/RSV</h4>\n          <div class=\"detail-table-scroll\">\n            <table class=\"detail-table\">\n              <thead>\n                <tr>\n                  <th>วันที่</th>\n                  <th>เลขใบสำคัญ</th>\n                  <th>รหัสลูกค้า</th>\n                  <th>ชื่อลูกค้า</th>\n                  <th>คลัง</th>\n                  <th>ค้างส่ง</th>\n                  <th>RSV</th>\n                  <th>status</th>\n                  <th>MIHdesc</th>\n                </tr>\n              </thead>\n              <tbody id=\"p098sorsvBody\"></tbody>\n            </table>\n          </div>\n        </div>\n        <div class=\"detail-block\">\n          <h4 class=\"detail-title\">PO</h4>\n          <div class=\"detail-table-scroll\">\n            <table class=\"detail-table\">\n              <thead>\n                <tr>\n                  <th>วันที่</th>\n                  <th>เลขใบสำคัญ</th>\n                  <th>รหัสลูกค้า</th>\n                  <th>ชื่อลูกค้า</th>\n                  <th>คลัง</th>\n                  <th>จำนวน</th>\n                </tr>\n              </thead>\n              <tbody id=\"p098poBody\"></tbody>\n            </table>\n          </div>\n        </div>\n      </div>\n    </section>\n  </div>\n\n  <div class=\"modal-backdrop\" id=\"p098printModal\">\n    <section class=\"modal print-modal\" role=\"dialog\" aria-modal=\"true\">\n      <div class=\"print-toolbar\">\n        <span class=\"print-brand\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M19 8H22V16H19zM17 16V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3z\"/><circle cx=\"17\" cy=\"12\" r=\"1\"/></svg> พิมพ์</span>\n        <div class=\"print-tools\">\n          <button class=\"zoom-btn\" id=\"p098zoomOut\" type=\"button\">−</button>\n          <span class=\"zoom-label\" id=\"p098zoomLabel\">100%</span>\n          <button class=\"zoom-btn\" id=\"p098zoomIn\" type=\"button\">+</button>\n          <button class=\"print-go\" id=\"p098printGo\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M19 8H22V16H19zM17 16V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3z\"/><circle cx=\"17\" cy=\"12\" r=\"1\"/></svg> พิมพ์</button>\n          <button class=\"modal-close\" id=\"p098closePrintModal\" type=\"button\" aria-label=\"ปิด\">×</button>\n        </div>\n      </div>\n      <div class=\"print-body\">\n        <div class=\"print-content\" id=\"p098printContent\">\n          <iframe class=\"print-frame\" id=\"p098printFrame\" title=\"\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E23\u0E30\u0E27\u0E31\u0E07\u0E2B\u0E25\u0E31\u0E07\u0E08\u0E31\u0E14\u0E0B\u0E37\u0E49\u0E2D\"></iframe>\n        </div>\n      </div>\n    </section>\n  </div>\n  <div id=\"p098printArea\"></div>\n\n  <div class=\"toast\" id=\"p098toast\">\n    <svg viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"></path></svg>\n    <span id=\"p098toastMessage\">ดำเนินการเรียบร้อยแล้ว</span>\n  </div></div>";

  var items = [{
  id: 1,
  date: "2026-10-31",
  wh: "G01",
  productCode: "10350248",
  group: "1035-0001",
  mktPlan: "",
  name: "ใบมีด-2แฉก-12\" ทรงมะละกอ(KHUN.DU) เหล็กกล้าคา...",
  stkDesc: "@-/J/-",
  so: 10,
  soNet: 10,
  rsv: 0,
  po: 0,
  pr: 0,
  sbl: 0,
  stock: -10,
  gradeX: false
}, {
  id: 2,
  date: "2026-10-31",
  wh: "G01",
  productCode: "10360017",
  group: "1036-0300",
  mktPlan: "Plan3",
  name: "แบตเตอรี่แห้ง(LightingAll) 12V-8Ah [10Ea/CT]",
  stkDesc: "@-/-/-",
  so: 10,
  soNet: 10,
  rsv: 27,
  po: 795,
  pr: 6000,
  sbl: 6970,
  stock: 7755,
  gradeX: false
}, {
  id: 3,
  date: "2026-10-31",
  wh: "G01",
  productCode: "10690035",
  group: "1069-0100",
  mktPlan: "Plan2",
  name: "เชือกไยยักษ์(เรือตังเก) 8mm (29-32Kg/Ea) [4Ea/Bag]",
  stkDesc: "@-/-/-",
  so: 35,
  soNet: 35,
  rsv: 52.80,
  po: 700.20,
  pr: 0,
  sbl: 1203.30,
  stock: 1868.50,
  gradeX: false
}, /* ตัวอย่างเพิ่มเติม (ไม่ได้มาจากภาพ) เพื่อทดสอบตัวกรอง */
{
  id: 4,
  date: "2026-10-31",
  wh: "G02",
  productCode: "10420115",
  group: "1042-0200",
  mktPlan: "Plan1",
  name: "สายยางใยสังเคราะห์ 5/8 นิ้ว [Ea]",
  stkDesc: "@-/-/-",
  so: 20,
  soNet: 20,
  rsv: 5,
  po: 150,
  pr: 0,
  sbl: 40,
  stock: 35,
  gradeX: true
}, {
  id: 5,
  date: "2026-10-30",
  wh: "G04",
  productCode: "10510077",
  group: "1051-0050",
  mktPlan: "",
  name: "ถุงมือผ้า 7 ขีด [12Pair/Dz]",
  stkDesc: "@-/-/-",
  so: 8,
  soNet: 8,
  rsv: 0,
  po: 0,
  pr: 0,
  sbl: 0,
  stock: -3,
  gradeX: false
}];
  var warehouses = [["G01", true], ["G07", true], ["G02", true], ["G09", false], ["G03", true], ["PD", false], ["G04", true], ["RTV", false], ["G06", false]];

  var cssInjected = false;
  function injectCss() {
    if (cssInjected) return;
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    cssInjected = true;
  }

  function mount(el) {
    if (!el) return;
    injectCss();
    el.innerHTML = HTML;
    var _d = new Date();
    var _p = function (n) { return String(n).padStart(2, "0"); };
    var _today = _d.getFullYear() + "-" + _p(_d.getMonth() + 1) + "-" + _p(_d.getDate());
    document.getElementById("p098dateFrom").value = _today;
    document.getElementById("p098dateTo").value = _today;
    init();
  }

  function init() {
function _toConsumableArray(a) { return _arrayWithoutHoles(a) || _iterableToArray(a) || _unsupportedIterableToArray(a) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { var e = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { for (var t, o = [], a = e.call(r); !(t = a.next()).done;) o.push(t.value); return o; } }
function _arrayWithoutHoles(a) { if (Array.isArray(a)) return _arrayLikeToArray(a); }
function _slicedToArray(e, i) { return _iterableToArrayLimit(e, i) || _unsupportedIterableToArray(e, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(t, e) { if (t) { if ("string" == typeof t) return _arrayLikeToArray(t, e); var o = {}.toString.call(t).slice(8, -1); return "Object" === o && t.constructor && (o = t.constructor.name), "Map" === o || "Set" === o ? Array.from(t) : "Arguments" === o || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o) ? _arrayLikeToArray(t, e) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, t) { var e = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (Array.isArray(r) && (null == e || e === ("undefined" != typeof Symbol && [][Symbol.iterator]) || e === []["@@iterator"])) return r; if (null != e) { var l, n, i, a, u = [], o = !0, f = !1; try { if (i = (e = e.call(r)).next, 0 === t) { if (Object(e) !== e) return; o = !1; } else for (; !(o = (l = i.call(e)).done) && (u.push(l.value), u.length !== t); o = !0); } catch (r) { f = !0, n = r; } finally { try { if (!o && null != e.return && (a = e.return(), Object(a) !== a)) return; } finally { if (f) throw n; } } return u; } }
/* ===== ข้อมูลตัวอย่าง (แทนที่ด้วยข้อมูลจริงจาก API/ฐานข้อมูลได้) ===== */


var els = {
  warehouseGrid: document.getElementById("p098warehouseGrid"),
  rows: document.getElementById("p098resultRows"),
  tableContainer: document.getElementById("p098tableContainer"),
  emptyState: document.getElementById("p098emptyState"),
  selectAll: document.getElementById("p098selectAll"),
  modal: document.getElementById("p098editModal"),
  printArea: document.getElementById("p098printArea"),
  pagination: document.getElementById("p098pagination")
};
var currentItems = [];
var appliedFilters = null;
var sortField = "productCode";
var sortDirection = "asc";
var currentId = null;
var editingId = null;
var selectedIds = new Set();
var PAGE_SIZE = 15;
var currentPage = 1;
var toastTimer;

/* ===== Utilities ===== */
var numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
var fmt = function fmt(value) {
  return numberFormatter.format(Number(value || 0));
};
function formatDate(value) {
  var _value$split = value.split("-"),
    _value$split2 = _slicedToArray(_value$split, 3),
    y = _value$split2[0],
    m = _value$split2[1],
    d = _value$split2[2];
  return "".concat(d, "/").concat(m, "/").concat(y);
}
function escapeHTML(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function showToast(message) {
  var toast = document.getElementById("p098toast");
  document.getElementById("p098toastMessage").textContent = message;
  clearTimeout(toastTimer);
  toast.classList.add("show");
  toastTimer = setTimeout(function () {
    return toast.classList.remove("show");
  }, 2000);
}

/* ===== กลุ่มคลัง ===== */
els.warehouseGrid.innerHTML = warehouses.map(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
    code = _ref2[0],
    checked = _ref2[1];
  return "\n      <label class=\"check-item\">\n        <input type=\"checkbox\" class=\"wh-check\" value=\"".concat(code, "\" ").concat(checked ? "checked" : "", ">").concat(code, "\n      </label>\n    ");
}).join("");

/* ===== Filter ===== */
function readFilters() {
  return {
    dateFrom: document.getElementById("p098dateFrom").value,
    dateTo: document.getElementById("p098dateTo").value,
    productCode: document.getElementById("p098productCode").value.trim().toLowerCase(),
    groupCode: document.getElementById("p098groupCode").value.trim().toLowerCase(),
    productName: document.getElementById("p098productName").value.trim().toLowerCase(),
    warehouses: _toConsumableArray(document.querySelectorAll(".wh-check:checked")).map(function (i) {
      return i.value;
    }),
    negative: document.getElementById("p098flagNegative").checked,
    overPO: document.getElementById("p098flagOverPO").checked,
    gradeX: document.getElementById("p098flagGradeX").checked
  };
}

// สินค้าเกิน PO: ยอดสั่งซื้อ (PO) มากกว่ายอดที่ต้องใช้ (SO สุทธิ + RSV)
var isOverPO = function isOverPO(item) {
  return item.po > item.soNet + item.rsv;
};
function applyFilters(filters) {
  return items.filter(function (item) {
    return (!filters.dateFrom || item.date >= filters.dateFrom) && (!filters.dateTo || item.date <= filters.dateTo) && (!filters.productCode || item.productCode.toLowerCase().includes(filters.productCode)) && (!filters.groupCode || item.group.toLowerCase().includes(filters.groupCode)) && (!filters.productName || item.name.toLowerCase().includes(filters.productName)) && filters.warehouses.includes(item.wh) && (!filters.negative || item.stock < 0) && (!filters.overPO || isOverPO(item)) && (!filters.gradeX || item.gradeX);
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
function applyFlagFilters(list) {
  var neg = document.getElementById("p098flagNegative").checked;
  var overPO = document.getElementById("p098flagOverPO").checked;
  var gradeX = document.getElementById("p098flagGradeX").checked;
  return list.filter(function (item) {
    return (!neg || item.stock < 0) && (!overPO || isOverPO(item)) && (!gradeX || item.gradeX);
  });
}

/* ===== Render ===== */
function numCell(value) {
  var cls = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  return "<td class=\"number ".concat(cls, " ").concat(value === 0 ? "zero" : "", "\">").concat(fmt(value), "</td>");
}
function updateSummary(list) {
  var el;
  el = document.getElementById("p098summaryCount");
  if (el) el.textContent = list.length;
  el = document.getElementById("p098summaryNegative");
  if (el) el.textContent = "".concat(list.filter(function (i) {
    return i.stock < 0;
  }).length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  el = document.getElementById("p098summaryOverPO");
  if (el) el.textContent = "".concat(list.filter(isOverPO).length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  el = document.getElementById("p098summaryGradeX");
  if (el) el.textContent = "".concat(list.filter(function (i) {
    return i.gradeX;
  }).length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  el = document.getElementById("p098footerText");
  if (el) el.textContent = "\u0E41\u0E2A\u0E14\u0E07 ".concat(list.length, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
}
function updateSelection() {
  var count = currentItems.filter(function (i) {
    return selectedIds.has(i.id);
  }).length;
  document.getElementById("p098footerSelected").textContent = "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 ".concat(count, " \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23");
  var all = currentItems.length > 0 && count === currentItems.length;
  els.selectAll.checked = all;
  els.selectAll.indeterminate = !all && count > 0;
}
function updateSortIndicators() {
  document.querySelectorAll("th[data-sort]").forEach(function (th) {
    var active = th.dataset.sort === sortField;
    th.classList.toggle("sorted", active);
    th.querySelector(".arrow").textContent = active ? sortDirection === "asc" ? "▲" : "▼" : "";
  });
}
function renderRows() {
  var sorted = sortItems(applyFlagFilters(currentItems));
  els.rows.innerHTML = "";
  updateSummary(sorted);
  updateSortIndicators();
  var totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  if (!sorted.length) {
    els.tableContainer.style.display = "none";
    els.emptyState.classList.add("show");
    if (els.pagination) els.pagination.innerHTML = "";
    updateSelection();
    return;
  }
  els.tableContainer.style.display = "block";
  els.emptyState.classList.remove("show");
  if (!sorted.some(function (i) {
    return i.id === currentId;
  })) currentId = sorted[0].id;
  var pageStart = (currentPage - 1) * PAGE_SIZE;
  var pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE);
  pageItems.forEach(function (item) {
    var tr = document.createElement("tr");
    tr.dataset.id = item.id;
    if (selectedIds.has(item.id)) tr.classList.add("checked");
    if (item.id === currentId) tr.classList.add("current");
    tr.innerHTML = "\n          <td class=\"check-cell\"><input type=\"checkbox\" class=\"row-check\" ".concat(selectedIds.has(item.id) ? "checked" : "", "></td>\n          <td class=\"center\"><button class=\"edit-button\" type=\"button\" data-edit=\"").concat(item.id, "\">Edit</button></td>\n          <td><span class=\"product-code ").concat(item.gradeX ? "gradex" : "", "\">").concat(escapeHTML(item.productCode), "</span></td>\n          <td class=\"group-code\">").concat(escapeHTML(item.group), "</td>\n          <td>").concat(item.mktPlan ? "<span class=\"plan-tag\">".concat(escapeHTML(item.mktPlan), "</span>") : "", "</td>\n          <td title=\"").concat(escapeHTML(item.name), "\">").concat(escapeHTML(item.name), "</td>\n          ").concat(numCell(item.so, "c-so"), "\n          ").concat(numCell(item.soNet, "c-so"), "\n          ").concat(numCell(item.rsv, "c-rsv"), "\n          ").concat(numCell(item.po, "c-po"), "\n          ").concat(numCell(item.pr), "\n          ").concat(numCell(item.sbl), "\n          <td class=\"number ").concat(item.stock < 0 ? "c-neg" : "", "\">").concat(fmt(item.stock), "</td>\n        ");
    els.rows.appendChild(tr);
  });
  renderPagination(totalPages);
  updateSelection();
}
function renderPagination(totalPages) {
  if (!els.pagination) return;
  els.pagination.innerHTML = "";
  if (totalPages <= 0) return;
  var prev = document.createElement("button");
  prev.type = "button";
  prev.textContent = "\u2039";
  prev.disabled = currentPage <= 1;
  prev.addEventListener("click", function () {
    if (currentPage > 1) { currentPage--; renderRows(); }
  });
  els.pagination.appendChild(prev);
  for (var p = 1; p <= totalPages; p++) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = String(p);
    if (p === currentPage) b.classList.add("active");
    (function (pg) {
      b.addEventListener("click", function () {
        currentPage = pg;
        renderRows();
      });
    })(p);
    els.pagination.appendChild(b);
  }
  var next = document.createElement("button");
  next.type = "button";
  next.textContent = "\u203A";
  next.disabled = currentPage >= totalPages;
  next.addEventListener("click", function () {
    if (currentPage < totalPages) { currentPage++; renderRows(); }
  });
  els.pagination.appendChild(next);
  var info = document.createElement("span");
  info.className = "page-info";
  info.textContent = currentPage + " / " + totalPages;
  els.pagination.appendChild(info);
}
function search() {
  var showMessage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  appliedFilters = readFilters();
  currentPage = 1;
  var btn = document.querySelector(".p098-scope .action-button.search");
  if (btn) { btn.classList.add("loading"); btn.disabled = true; }
  var payload = {
    connectionId: "c1788406814359",
    dateFrom: appliedFilters.dateFrom,
    dateTo: appliedFilters.dateTo,
    productCode: appliedFilters.productCode,
    groupCode: appliedFilters.groupCode,
    productName: appliedFilters.productName,
    warehouses: appliedFilters.warehouses
  };
  fetch("api/p098_search.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function (r) {
    return r.json();
  }).then(function (data) {
    if (!data.ok) {
      if (btn) { btn.classList.remove("loading"); btn.disabled = false; }
      currentItems = [];
      renderRows();
      showToast("\u0E2B\u0E38\u0E21\u0E19\u0E37: " + (data.error || ""));
      return;
    }
    if (btn) { btn.classList.remove("loading"); btn.disabled = false; }
    currentItems = data.rows;
    renderRows();
    if (showMessage) showToast("\u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 ".concat(currentItems.length, " \u0E41\u0E16\u0E27"));
  }).catch(function (err) {
    if (btn) { btn.classList.remove("loading"); btn.disabled = false; }
    currentItems = [];
    renderRows();
    showToast("\u0E2B\u0E38\u0E21\u0E19\u0E37: " + err.message);
  });
}

/* ===== Print ===== */
function setBtnBusy(btn, busy) {
  if (!btn) return;
  if (busy) {
    if (!btn.dataset.origHtml) btn.dataset.origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add("busy");
    btn.innerHTML = '<svg class="p098-spinner" viewBox="0 0 24 24" style="width:14px;height:14px;flex:none"><path d="M12 2a10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg>';
  } else {
    btn.disabled = false;
    btn.classList.remove("busy");
    if (btn.dataset.origHtml) { btn.innerHTML = btn.dataset.origHtml; delete btn.dataset.origHtml; }
  }
}
function printReport() {
  var picked = currentItems.filter(function (i) { return selectedIds.has(i.id); });
  if (!picked.length) return;
  var printBtn = document.getElementById("p098printButton");
  setBtnBusy(printBtn, true);
  var list = sortItems(picked);
  var f = appliedFilters;
  var now = new Date();
  var pad = function pad(n) { return String(n).padStart(2, "0"); };
  var stamp = pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear() + " " + pad(now.getHours()) + ":" + pad(now.getMinutes());
  var T_TITLE = "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E23\u0E30\u0E27\u0E31\u0E07\u0E2B\u0E25\u0E31\u0E07\u0E08\u0E31\u0E14\u0E0B\u0E37\u0E49\u0E2D";
  var T_PRINT_WHEN = "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E21\u0E37\u0E48\u0E2D";
  var T_BY = "\u0E42\u0E14\u0E22";
  var T_DATE = "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48";
  var T_DOC_NO = "\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D";
  var T_CUS_CODE = "\u0E23\u0E2B\u0E31\u0E2A\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32";
  var T_CUS_NAME = "\u0E0A\u0E37\u0E48\u0E2D\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32";
  var T_WH = "\u0E04\u0E25\u0E31\u0E07";
  var T_CODE_GROUP_ITEM = "\u0E23\u0E2B\u0E31\u0E2A\u0020\u002B\u0020\u0E01\u0E25\u0E38\u0E48\u0E21\u0020\u002B\u0020\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E2A\u0E34\u0E19\u0E04\u0E49\u0E32";
  var T_ERR = "\u0E42\u0E1A\u0E31\u0E0D\u0E49\u0E32\u0E2D\u0E32\u0E07\u0E31\u0E0D\u0E0A\u0E41\u0E2D\u0E30\u0E1C\u0E39\u0E2B";
  var T_PAGE = "\u0E2B\u0E19\u0E49\u0E32";
  var colgroup = "<colgroup>"
    + "<col style=\"width:30pt\">" + "<col style=\"width:65pt\">" + "<col style=\"width:85pt\">"
    + "<col style=\"width:70pt\">" + "<col style=\"width:270pt\">" + "<col style=\"width:70pt\">"
    + "<col style=\"width:70pt\">" + "<col style=\"width:70pt\">" + "<col style=\"width:70pt\">"
    + "</colgroup>";
  var theadRows = "<tr class=\"h\">"
    + "<th colspan=\"5\">" + T_CODE_GROUP_ITEM + "</th>"
    + "<th rowspan=\"2\">" + T_WH + "</th>"
    + "<th rowspan=\"2\">SO</th>"
    + "<th rowspan=\"2\">RSV</th>"
    + "<th rowspan=\"2\">PO</th>"
    + "</tr>"
    + "<tr class=\"h\">"
    + "<th> </th>"
    + "<th>" + T_DATE + "</th>"
    + "<th>" + T_DOC_NO + "</th>"
    + "<th>" + T_CUS_CODE + "</th>"
    + "<th>" + T_CUS_NAME + "</th>"
    + "</tr>";
  var detailPromises = list.map(function (item) {
    return fetch("api/p098_detail.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: "c1788406814359",
        stkcode: item.productCode,
        dateFrom: f.dateFrom,
        dateTo: f.dateTo,
        warehouses: f.warehouses
      })
    }).then(function (r) { return r.json(); });
  });
  Promise.all(detailPromises).then(function (details) {
    var rowsArr = [];
    list.forEach(function (item, idx) {
      var d = details[idx] || {};
      var sorsv = d.sorsv || [];
      var po = d.po || [];
      rowsArr.push("<tr class=\"bdr\"><td colspan=\"9\" class=\"rep-prod\">" + escapeHTML(item.productCode) + " " + escapeHTML(item.group) + " " + escapeHTML(item.name) + " " + escapeHTML(item.stkDesc || "") + "</td></tr>");
      sorsv.forEach(function (r) {
        rowsArr.push("<tr class=\"vline\">"
          + "<td>&nbsp;</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.date) + "</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.vnos) + "</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.cus) + "</td>"
          + "<td>" + escapeHTML(r.cusName) + "</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.sto) + "</td>"
          + "<td class=\"num\">" + fmt(r.qty) + "</td>"
          + "<td class=\"num\">" + fmt(r.rsv) + "</td>"
          + "<td>&nbsp;</td>"
          + "</tr>");
      });
      po.forEach(function (r) {
        rowsArr.push("<tr class=\"vline\">"
          + "<td>&nbsp;</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.date) + "</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.vnos) + "</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.cus) + "</td>"
          + "<td>" + escapeHTML(r.cusName) + "</td>"
          + "<td class=\"ctr\">" + escapeHTML(r.sto) + "</td>"
          + "<td>&nbsp;</td>"
          + "<td>&nbsp;</td>"
          + "<td class=\"num\">" + fmt(r.qty) + "</td>"
          + "</tr>");
      });
    });
    var hdrTable = "<table class=\"p098tbl p098hdr\">" + colgroup + "<tbody>"
      + "<tr><td colspan=\"9\" class=\"t\">" + T_TITLE + "</td></tr>"
      + "<tr><td colspan=\"9\" class=\"m\">" + T_PRINT_WHEN + " : " + stamp + "  " + T_BY + " : </td></tr>"
      + theadRows + "</tbody></table>";
    var dataTable = "<table class=\"p098tbl p098data\">" + colgroup + "<tbody>" + rowsArr.join("") + "</tbody></table>";
    var inner = "<section class=\"p098-page\"><div class=\"p098-pgno\">" + T_PAGE + " 1</div>" + hdrTable + dataTable + "</section>";
    var frame = document.getElementById("p098printFrame");
    if (!frame) return;
    frame.srcdoc = p098DocHtml(inner, T_TITLE);
    openPrintModal();
    setBtnBusy(printBtn, false);
  }).catch(function (err) {
    setBtnBusy(printBtn, false);
    showToast(T_ERR + ": " + (err && err.message ? err.message : String(err)));
  });
}

/* ===== Print report document (P038 Print V2 pattern: iframe + srcdoc + in-doc paginator) ===== */
function p098DocHtml(inner, title) {
  var css = [
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
    "@page{size:A4 landscape;margin:20pt;@bottom-right{content:\"\u0E2B\u0E19\u0E49\u0E32 \" counter(page);font-family:'THSarabunNew',sans-serif;font-size:14pt}}",
    "html,body{margin:0;padding:0;background:#eef2f7}",
    ".p098-page{box-sizing:border-box;width:297mm;height:210mm;padding:20pt;background:#fff;margin:0 auto;position:relative;overflow:hidden;font-family:'THSarabunNew',sans-serif;color:#000}",
    ".p098-page+.p098-page{margin-top:20pt}",
    ".p098-pgno{position:absolute;right:20pt;bottom:2pt;font-size:14pt;font-family:'THSarabunNew',sans-serif;white-space:nowrap}",
    ".p098tbl{width:800pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
    ".p098tbl td,.p098tbl th{padding:3px 5px;font-size:14pt;border:0;vertical-align:middle;font-family:'THSarabunNew',sans-serif;font-weight:400}",
    ".p098hdr td.t{font-size:22pt;font-weight:700;text-align:center}",
    ".p098hdr td.m{font-size:14pt}",
    ".p098hdr tr.h th{font-weight:700;text-align:center;border:1px solid #555}",
    ".p098hdr tr.h th{background:#f0f0f0}",
    ".p098hdr tr:nth-child(4) th:first-child{border-right:0}",
    ".p098hdr tr:nth-child(4) th:nth-child(2){border-left:0}",
    ".p098data{border:1px solid #000}",
    ".p098data tr.bdr td{border:1px solid #555}",
    ".p098data tr.bdr td.rep-prod{font-weight:700}",
    ".p098data tr.vline td:not(:first-child):not(:nth-child(2)){border-left:1px solid #555}",
    ".p098data td.ctr{text-align:center}",
    ".p098data td.num{text-align:right}",
    "@media print{html,body{background:#fff}.p098-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;page-break-after:always;break-after:page}.p098-page:last-child{page-break-after:auto;break-after:auto}.p098-page+.p098-page{margin-top:0}.p098-pgno{display:none}.p098tbl tr{page-break-inside:avoid}}"
  ].join("\n");
  var js = "function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/1123)}"
    + "window.setZoom=function(z){window.__MAN=z;fit()};"
    + "function rowOver(r){var s=r.closest('section.p098-page');if(!s)return false;var sr=s.getBoundingClientRect(),lr=r.getBoundingClientRect(),pb=parseFloat(getComputedStyle(s).paddingBottom)||0;return lr.bottom>sr.bottom-pb}"
    + "function renumber(){var s=document.querySelectorAll('section.p098-page');for(var i=0;i<s.length;i++){var f=s[i].querySelector('.p098-pgno');if(f)f.textContent='\u0E2B\u0E19\u0E49\u0E32 '+(i+1)}}"
    + "function newSection(cur,t){var s2=document.createElement('section');s2.className='p098-page p098-cont';var first=document.querySelector('section.p098-page');var hd=first?first.querySelector('table.p098hdr'):null;if(hd)s2.appendChild(hd.cloneNode(true));var pn=document.createElement('div');pn.className='p098-pgno';s2.appendChild(pn);var nt=document.createElement('table');nt.className='p098tbl p098data';var cg=t.querySelector('colgroup');if(cg)nt.appendChild(cg.cloneNode(true));nt.appendChild(document.createElement('tbody'));s2.appendChild(nt);cur.parentNode.insertBefore(s2,cur.nextSibling);return{sec:s2,tbl:nt}}"
    + "function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p098-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){if(s.classList.contains('p098-cont'))groups[groups.length-1].push(s);else groups.push([s])});groups.forEach(function(g){var first=g[0];var t=first.querySelector('table.p098data');if(!t)return;for(var i=1;i<g.length;i++){var t2=g[i].querySelector('table.p098data');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);g[i].parentNode.removeChild(g[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);var over=curT.tBodies[0].rows.length>1&&rowOver(row);if(over){curT.tBodies[0].removeChild(row);var moved=null;var last=curT.tBodies[0].rows[curT.tBodies[0].rows.length-1];if(last&&last.className&&last.className.indexOf('bdr')!==-1)moved=curT.tBodies[0].removeChild(last);var ns=newSection(cur,t);cur=ns.sec;curT=ns.tbl;if(moved)curT.tBodies[0].appendChild(moved);curT.tBodies[0].appendChild(row)}})});renumber()}"
    + "if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag();fit()})}else{pag();fit()}window.addEventListener('load',function(){pag();fit()});window.addEventListener('resize',function(){fit()});setTimeout(function(){pag();fit()},250);";
  return '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title><style>' + css + '</style></head><body>' + inner + '<scr' + 'ipt>' + js + '</scr' + 'ipt></body></html>';
}

/* ===== Print modal (iframe preview, P038 V2 pattern) ===== */
var printModal = document.getElementById("p098printModal");
var zoomLabel = document.getElementById("p098zoomLabel");
var printZoom = 100;
function p098Frame() {
  return document.getElementById("p098printFrame");
}
function openPrintModal() {
  printModal.classList.add("show");
  setPrintZoom(printZoom);
}
function closePrintModal() {
  printModal.classList.remove("show");
}
function setPrintZoom(z) {
  printZoom = Math.max(25, Math.min(200, z));
  if (zoomLabel) zoomLabel.textContent = printZoom + "%";
  var f = p098Frame();
  if (!f) return;
  var apply = function () {
    try {
      if (f.contentWindow && f.contentWindow.setZoom) {
        f.contentWindow.setZoom(printZoom / 100);
        return true;
      }
    } catch (e) { /* iframe not ready */ }
    return false;
  };
  if (apply()) return;
  var n = 0;
  var t = setInterval(function () {
    n++;
    if (apply() || n > 40) clearInterval(t);
  }, 100);
}
function printFrameNow() {
  var f = p098Frame();
  if (!f || !f.contentWindow) return;
  try {
    f.contentWindow.focus();
    f.contentWindow.print();
  } catch (e) { /* ignore */ }
}


/* ===== Edit modal ===== */
function openEdit(id) {
  var item = currentItems.find(function (i) {
    return i.id === id;
  });
  if (!item) return;
  editingId = id;
  document.getElementById("p098modalInfo").innerHTML = "<b>".concat(escapeHTML(item.productCode), "</b> \xB7 ").concat(escapeHTML(item.group), "<br>").concat(escapeHTML(item.name));
  document.getElementById("p098editStkMemo").value = item.stkMemo || "";
  els.modal.classList.add("show");
  document.getElementById("p098editStkMemo").focus();
}
function closeEdit() {
  els.modal.classList.remove("show");
  editingId = null;
}
function saveEdit() {
  var item = currentItems.find(function (i) {
    return i.id === editingId;
  });
  if (!item) return;
  item.stkMemo = document.getElementById("p098editStkMemo").value.trim();
  closeEdit();
  renderRows();
  showToast("\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25 ".concat(item.productCode, " \u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27"));
}

/* ===== Detail modal (SO/RSV + PO) ===== */
var detailModal = document.getElementById("p098detailModal");
function openDetail(item) {
  var topbar = document.getElementById("p098detailTopbar");
  topbar.innerHTML = "<span><b>" + escapeHTML(item.productCode) + "</b> " + escapeHTML(item.name) + "</span>"
    + "<span>SO: " + fmt(item.so) + "</span>"
    + "<span>RSV: " + fmt(item.rsv) + "</span>"
    + "<span>PO: " + fmt(item.po) + "</span>";
  var f = appliedFilters || readFilters();
  fetch("api/p098_detail.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      connectionId: "c1788406814359",
      stkcode: item.productCode,
      dateFrom: f.dateFrom,
      dateTo: f.dateTo,
      warehouses: f.warehouses
    })
  }).then(function (r) { return r.json(); })
   .then(function (data) {
     if (!data.ok) { showToast("\u0E42\u0E1A\u0E31\u0E0D\u0E49\u0E32\u0E2D\u0E32\u0E07\u0E31\u0E0D\u0E0A\u0E41\u0E2D\u0E30\u0E1C\u0E39\u0E2B: " + (data.error || "")); return; }
     renderSorsv(data.sorsv);
     renderPo(data.po);
  }).catch(function (err) {
     showToast("\u0E42\u0E1A\u0E31\u0E0D\u0E49\u0E32\u0E2D\u0E32\u0E07\u0E31\u0E0D\u0E0A\u0E41\u0E2D\u0E30\u0E1C\u0E39\u0E2B: " + String(err));
  });
  detailModal.classList.add("show");
}
function closeDetail() {
  detailModal.classList.remove("show");
}
function renderSorsv(rows) {
  var body = document.getElementById("p098sorsvBody");
  body.innerHTML = rows.map(function (r) {
    var soCls = r.qty < 0 ? "num c-neg" : "num c-so";
    return "<tr><td>" + escapeHTML(r.date) + "</td><td>" + escapeHTML(r.vnos) + "</td><td>" + escapeHTML(r.cus) + "</td><td>" + escapeHTML(r.cusName) + "</td><td>" + escapeHTML(r.sto) + "</td><td class='" + soCls + "'>" + fmt(r.qty) + "</td><td class='num c-rsv'>" + fmt(r.rsv) + "</td><td>" + escapeHTML(r.status) + "</td><td>" + escapeHTML(r.mihDesc) + "</td></tr>";
  }).join("");
}
function renderPo(rows) {
  var body = document.getElementById("p098poBody");
  body.innerHTML = rows.map(function (r) {
    return "<tr><td>" + escapeHTML(r.date) + "</td><td>" + escapeHTML(r.vnos) + "</td><td>" + escapeHTML(r.cus) + "</td><td>" + escapeHTML(r.cusName) + "</td><td>" + escapeHTML(r.sto) + "</td><td class='num c-po'>" + fmt(r.qty) + "</td></tr>";
  }).join("");
}

/* ===== Events ===== */
document.getElementById("p098filterForm").addEventListener("submit", function (e) {
  e.preventDefault();
  search(true);
});
els.rows.addEventListener("click", function (e) {
  var editBtn = e.target.closest("[data-edit]");
  if (editBtn) {
    openEdit(Number(editBtn.dataset.edit));
    return;
  }
  var tr = e.target.closest("tr");
  if (!tr) return;
  var id = Number(tr.dataset.id);
  if (e.target.classList.contains("row-check")) {
    e.target.checked ? selectedIds.add(id) : selectedIds.delete(id);
    renderRows();
  } else {
    currentId = id;
    var item = currentItems.find(function (i) { return i.id === id; });
    if (item) openDetail(item);
  }
});
els.selectAll.addEventListener("change", function () {
  currentItems.forEach(function (i) {
    els.selectAll.checked ? selectedIds.add(i.id) : selectedIds.delete(i.id);
  });
  renderRows();
});
document.getElementById("p098flagNegative").addEventListener("change", function () { renderRows(); });
document.getElementById("p098flagOverPO").addEventListener("change", function () { renderRows(); });
document.getElementById("p098flagGradeX").addEventListener("change", function () { renderRows(); });
document.querySelectorAll("th[data-sort]").forEach(function (th) {
  th.addEventListener("click", function () {
    var field = th.dataset.sort;
    if (sortField === field) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortField = field;
      sortDirection = "asc";
    }
    renderRows();
  });
});
document.getElementById("p098printButton").addEventListener("click", printReport);
document.getElementById("p098printGo").addEventListener("click", printFrameNow);
document.getElementById("p098zoomIn").addEventListener("click", function () {
  setPrintZoom(printZoom + 25);
});
document.getElementById("p098zoomOut").addEventListener("click", function () {
  setPrintZoom(printZoom - 25);
});
document.getElementById("p098closePrintModal").addEventListener("click", closePrintModal);
printModal.addEventListener("click", function (e) {
  if (e.target === printModal) closePrintModal();
});
document.getElementById("p098closeModal").addEventListener("click", closeEdit);
document.getElementById("p098cancelEdit").addEventListener("click", closeEdit);
document.getElementById("p098saveEdit").addEventListener("click", saveEdit);

document.getElementById("p098closeDetailModal").addEventListener("click", closeDetail);
detailModal.addEventListener("click", function (e) {
  if (e.target === detailModal) closeDetail();
});els.modal.addEventListener("click", function (e) {
  if (e.target === els.modal) closeEdit();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeEdit();
});
var _tl = document.getElementById("p098toggleLauncher");
if (_tl) _tl.addEventListener("click", function () {
  var form = document.getElementById("p098filterForm");
  if (form) form.style.display = form.style.display === "none" ? "grid" : "none";
});

/* ===== Init ===== */
}

  window.P098StockWatch = { mount: mount };
})();
