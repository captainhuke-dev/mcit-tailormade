(function () {
  'use strict';

  var CSS = ".p017-scope{\n      --blue: #2563eb;\n      --blue-dark: #1d4ed8;\n      --blue-soft: #eff6ff;\n      --green: #059669;\n      --green-soft: #ecfdf5;\n      --orange: #d97706;\n      --orange-soft: #fffbeb;\n      --red: #dc2626;\n      --red-soft: #fef2f2;\n      --purple: #7c3aed;\n      --purple-soft: #f5f3ff;\n      --bg: #f3f6fb;\n      --surface: #ffffff;\n      --soft: #f8fafc;\n      --text: #172033;\n      --muted: #64748b;\n      --border: #dbe3ef;\n      --radius: 16px;\n      --shadow: 0 12px 32px rgba(15,23,42,.08);\n    }\n.p017-scope *{ box-sizing: border-box; margin: 0; padding: 0; }\n.p017-scope{\n      min-height: 100vh;\n      color: var(--text);\n      background: radial-gradient(circle at top left, rgba(37,99,235,.10), transparent 30%), var(--bg);\n    }\n.p017-scope button, .p017-scope input{ font: inherit; cursor: pointer; }\n.p017-scope input{ cursor: text; }\n.p017-scope button:focus-visible, .p017-scope input:focus-visible{\n      outline: 3px solid rgba(37,99,235,.20);\n      outline-offset: 2px;\n    }\n.p017-scope svg{\n      display: block;\n      width: 20px;\n      height: 20px;\n      fill: none;\n      stroke: currentColor;\n      stroke-width: 2;\n      stroke-linecap: round;\n      stroke-linejoin: round;\n    }\n.p017-scope .p017-app{ display: flex; min-height: 100vh; flex-direction: column; }\n.p017-scope .content{\n      display: flex;\n      width: 100%;\n      max-width: 1800px;\n      min-height: calc(100vh - 72px);\n      flex-direction: column;\n      gap: 14px;\n      margin: 0 auto;\n      padding: 18px 22px 24px;\n    }\n.p017-scope .launcher{\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: var(--surface);\n      box-shadow: var(--shadow);\n    }\n.p017-scope .launcher-title{\n      display: flex;\n      min-height: 43px;\n      align-items: center;\n      justify-content: space-between;\n      padding: 0 8px 0 16px;\n      color: #fff;\n      background: linear-gradient(90deg, #1e3a8a, #2563eb);\n    }\n.p017-scope .launcher-title strong{\n      display: flex;\n      align-items: center;\n      gap: 8px;\n      font-size: 14px;\n    }\n.p017-scope .launcher-body{\n      display: grid;\n      grid-template-columns: 1fr;\n      gap: 18px;\n      align-items: stretch;\n      padding: 18px;\n      background: linear-gradient(180deg, #e4fbfd, #edfafd);\n    }\n.p017-scope .refresh-button{\n      display: inline-flex;\n      min-height: 70px;\n      align-items: center;\n      justify-content: center;\n      gap: 9px;\n      padding: 0 18px;\n      color: #166534;\n      border: 1px solid #86efac;\n      border-radius: 12px;\n      background: linear-gradient(135deg, #f0fdf4, #dcfce7);\n      font-size: 14px;\n      font-weight: 700;\n      transition: .16s ease;\n    }\n.p017-scope .refresh-button:hover{ transform: translateY(-1px); filter: brightness(.98); }\n.p017-scope .refresh-button svg{ color: #16a34a; }\n.p017-scope .filters{\n      display: grid;\n      grid-template-columns: 220px max-content;\n      gap: 12px;\n      align-items: start;\n    }\n.p017-scope .quick-search{\n      width: 180px;\n      height: 34px;\n      padding: 0 10px;\n      border: 1px solid var(--border);\n      border-radius: 8px;\n      background: #fff;\n      font-size: 12px;\n      outline: none;\n    }\n.p017-scope .quick-search:focus{ border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37,99,235,.15); }\n.p017-scope .tool-btn.green{ background: #047857; }\n.p017-scope .action.search .spinner{ display: none; }\n.p017-scope .action.search.busy .spinner{ display: inline-block; }\n.p017-scope .action.search.busy{ pointer-events: none; opacity: .85; }\n.p017-scope .action.search .spinner svg{ width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; animation: p017spin .8s linear infinite; }\n@keyframes p017spin{ from{ transform: rotate(0deg); } to{ transform: rotate(360deg); } }\n.p017-scope .filters .action{ width: auto; height: 34px; align-self: start; }\n.p017-scope .filters .type-box{ align-self: start; }\n.p017-scope .tool-btn{\n      display: inline-flex;\n      height: 34px;\n      align-items: center;\n      gap: 6px;\n      padding: 0 14px;\n      color: #fff;\n      border: 0;\n      border-radius: 8px;\n      background: #2563eb;\n      font-size: 12px;\n      font-weight: 700;\n      cursor: pointer;\n    }\n.p017-scope .tool-btn svg{ width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-width: 2; }\n.p017-scope .tool-btn:hover{ filter: brightness(1.08); }\n\n\n.p017-scope .field label{\n      display: block;\n      margin-bottom: 5px;\n      color: #334155;\n      font-size: 11px;\n      font-weight: 700;\n    }\n.p017-scope .field input{\n      width: 100%;\n      height: 34px;\n      padding: 0 9px;\n      border: 1px solid #94a3b8;\n      border-radius: 7px;\n      outline: none;\n      background: #fff;\n      font-size: 12px;\n    }\n.p017-scope .field input:focus{\n      border-color: #60a5fa;\n      box-shadow: 0 0 0 3px rgba(96,165,250,.14);\n    }\n.p017-scope .type-box{\n      padding: 11px 13px;\n      border: 1px solid #b9ddeb;\n      border-radius: 12px;\n      background: rgba(255,255,255,.72);\n    }\n.p017-scope .type-box h2{\n      margin-bottom: 8px;\n      color: #1e3a8a;\n      font-size: 12px;\n    }\n.p017-scope .type-option{\n      display: flex;\n      align-items: center;\n      gap: 7px;\n      margin: 7px 0;\n      color: #334155;\n      font-size: 12px;\n      font-weight: 600;\n      cursor: pointer;\n    }\n.p017-scope .type-option input{\n      width: 16px;\n      height: 16px;\n      accent-color: var(--blue);\n      cursor: pointer;\n    }\n\n.p017-scope .action{\n      display: inline-flex;\n      height: 42px;\n      align-items: center;\n      justify-content: center;\n      gap: 8px;\n      padding: 0 13px;\n      border-radius: 9px;\n      font-size: 12px;\n      font-weight: 700;\n      transition: .16s ease;\n    }\n.p017-scope .action.search{\n      color: #fff;\n      border: 0;\n      background: linear-gradient(135deg, #38bdf8, var(--blue-dark));\n      box-shadow: 0 8px 18px rgba(37,99,235,.22);\n    }\n\n.p017-scope .action.export{ color: #047857; border: 1px solid #a7f3d0; background: var(--green-soft); }\n.p017-scope .action:hover{ transform: translateY(-1px); filter: brightness(.98); }\n.p017-scope .panel{\n      display: flex;\n      min-height: 460px;\n      flex: 1;\n      flex-direction: column;\n      overflow: hidden;\n      border: 1px solid var(--border);\n      border-radius: var(--radius);\n      background: #fff;\n      box-shadow: var(--shadow);\n    }\n.p017-scope .panel-header{\n      display: flex;\n      min-height: 60px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 10px 15px;\n      border-bottom: 1px solid var(--border);\n    }\n.p017-scope .panel-heading{ display: flex; min-width: 0; align-items: center; gap: 10px; }\n.p017-scope .panel-icon{\n      display: grid;\n      width: 36px;\n      height: 36px;\n      flex: 0 0 auto;\n      place-items: center;\n      color: var(--orange);\n      border-radius: 10px;\n      background: var(--orange-soft);\n    }\n.p017-scope .panel-title h2{ font-size: 14px; }\n.p017-scope .panel-title p{ margin-top: 1px; color: var(--muted); font-size: 11px; }\n.p017-scope .badge{\n      padding: 5px 11px;\n      color: #b45309;\n      border-radius: 999px;\n      background: #fef3c7;\n      font-size: 11px;\n      font-weight: 700;\n      white-space: nowrap;\n    }\n.p017-scope .table-wrap{ min-height: 0; flex: 1; overflow: auto; }\n.p017-scope table{\n      width: 100%;\n      min-width: 1240px;\n      border-collapse: separate;\n      border-spacing: 0;\n      white-space: nowrap;\n    }\n.p017-scope th{\n      position: sticky;\n      top: 0;\n      z-index: 2;\n      padding: 10px 12px;\n      color: #334155;\n      border-bottom: 1px solid var(--border);\n      background: var(--soft);\n      box-shadow: inset 0 -1px var(--border);\n      font-size: 12px;\n      font-weight: 700;\n      text-align: left;\n      user-select: none;\n    }\n.p017-scope th.sortable{ cursor: pointer; }\n.p017-scope th.sortable:hover{ color: var(--blue); background: #eef5ff; }\n.p017-scope th.sorted{ color: var(--blue-dark); background: #e0ecff; }\n.p017-scope td{\n      max-width: 360px;\n      overflow: hidden;\n      padding: 8px 12px;\n      border-bottom: 1px solid #e5ebf3;\n      font-size: 12px;\n      text-overflow: ellipsis;\n    }\n.p017-scope td.center, .p017-scope th.center{ text-align: center; }\n.p017-scope td.number, .p017-scope th.number{ text-align: right; font-family: Arial, sans-serif; }\n.p017-scope tbody tr{ cursor: pointer; transition: .12s ease; }\n.p017-scope tbody tr:nth-child(even){ background: #fbfdff; }\n.p017-scope tbody tr:hover{ background: #f0f7ff; }\n.p017-scope tbody tr.active td{ color: #fff; background: #0878d1; }\n.p017-scope tbody tr.active .p017-doc-no{ color: #fff; }\n.p017-scope .p017-doc-no{ color: var(--blue-dark); font-family: Arial, sans-serif; font-weight: 700; }\n.p017-scope .p017-cust-code{ color: #334155; font-family: Arial, sans-serif; font-weight: 700; }\n.p017-scope .p017-amount{ color: #b45309; font-family: Arial, sans-serif; font-weight: 700; }\n.p017-scope .empty{\n      display: none;\n      min-height: 270px;\n      flex: 1;\n      align-items: center;\n      justify-content: center;\n      color: var(--muted);\n      text-align: center;\n    }\n.p017-scope .empty.show{ display: flex; }\n.p017-scope .panel-footer{\n      display: flex;\n      min-height: 50px;\n      align-items: center;\n      justify-content: space-between;\n      gap: 12px;\n      padding: 8px 15px;\n      color: var(--muted);\n      border-top: 1px solid var(--border);\n      background: var(--soft);\n      font-size: 12px;\n    }\n.p017-scope .toast{\n      position: fixed;\n      right: 20px;\n      bottom: 20px;\n      z-index: 50;\n      display: flex;\n      visibility: hidden;\n      align-items: center;\n      gap: 8px;\n      padding: 11px 14px;\n      color: #fff;\n      border-radius: 11px;\n      opacity: 0;\n      background: #0f172a;\n      box-shadow: 0 16px 36px rgba(15,23,42,.28);\n      font-size: 12px;\n      transform: translateY(12px);\n      transition: .2s ease;\n    }\n.p017-scope .toast.show{ visibility: visible; opacity: 1; transform: translateY(0); }\n.p017-scope .toast svg{ color: #34d399; }\n.p017-scope .modal-backdrop{ position: fixed; inset: 0; z-index: 100; display: none; padding: 20px; place-items: center; background: rgba(15, 23, 42, 0.52); backdrop-filter: blur(4px); }\n.p017-scope .modal-backdrop.show{ display: grid; }\n.p017-scope .modal.print-modal{ width: min(1150px, calc(100vw - 40px)); height: calc(100vh - 40px); max-height: calc(100vh - 40px); display: flex; flex-direction: column; overflow: hidden; border-radius: 16px; background: #fff; box-shadow: 0 28px 75px rgba(15, 23, 42, 0.36); }\n.p017-scope .print-toolbar{ display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--border); background: var(--soft); }\n.p017-scope .print-tools{ display: flex; align-items: center; gap: 8px; }\n.p017-scope .zoom-btn{ width: 30px; height: 30px; border: 1px solid var(--border); background: #fff; border-radius: 8px; font-size: 18px; line-height: 1; cursor: pointer; }\n.p017-scope .zoom-label{ min-width: 46px; text-align: center; font-size: 12px; color: var(--muted); }\n.p017-scope .print-go{ display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }\n.p017-scope .print-go svg{ width: 16px; height: 16px; }\n.p017-scope .modal-close{ width: 30px; height: 30px; color: #334155; border: 1px solid var(--border); border-radius: 8px; background: #fff; font-size: 18px; }\n.p017-scope .print-body{ position: relative; flex: 1 1 auto; min-height: 0; overflow: hidden; background: #eef2f7; }\n.p017-scope .print-content{ position: absolute; inset: 0; }\n.p017-scope .print-frame{ display: block; width: 100%; height: 100%; border: 0; background: #eef2f7; }\n.p017-scope .p017-pager{ display: none;\n      justify-content: center;\n      gap: 8px;\n      padding: 12px 15px;\n      border-top: 1px solid var(--border);\n      background: var(--soft);\n    }\n.p017-scope .pager-btn{ display: inline-flex;\n      width: 34px;\n      height: 34px;\n      align-items: center;\n      justify-content: center;\n      color: #334155;\n      border: 1px solid var(--border);\n      border-radius: 9px;\n      background: #fff;\n      font-size: 13px;\n      font-weight: 700;\n      cursor: pointer;\n      transition: .15s ease;\n    }\n.p017-scope .pager-btn:hover:not(:disabled){ color: var(--blue-dark); border-color: var(--blue); background: var(--blue-soft); }\n.p017-scope .pager-btn.active{ color: #fff; border-color: var(--blue); background: var(--blue); }\n.p017-scope .pager-btn:disabled{ opacity: .4; cursor: default; }\n.p017-scope .pager-btn svg{ width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }\n@media (max-width: 1050px){\n      .p017-scope .launcher-body{ grid-template-columns: 1fr; }\n      .p017-scope .action{ min-width: 140px; }\n      .p017-scope .filters{ grid-template-columns: 1fr 1fr; }\n      .p017-scope .filters .action.export{ grid-column: auto; }\n    }\n@media (max-width: 680px){\n      .p017-scope .content{ padding: 12px; }\n      .p017-scope .filters{ grid-template-columns: 1fr; }\n      .p017-scope .filters .action, .p017-scope .filters .action.export{ grid-column: auto; }\n      .p017-scope .panel-header, .p017-scope .panel-footer{ align-items: flex-start; flex-direction: column; }\n    }";

  var HTML = "<div class=\"p017-scope\"><div class=\"p017-app\">\n    <main class=\"content\">\n      <section class=\"launcher\">\n        <div class=\"launcher-title\">\n          <strong>\n            <svg viewBox=\"0 0 24 24\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n              <path d=\"m21 21-4.35-4.35\"></path>\n            </svg>\n            บิลเงินสดที่ยังไม่ได้รับเงิน\n          </strong>\n        </div>\n\n        <form class=\"launcher-body\" id=\"p017filterForm\">\n                    <div class=\"filters\">\n            <div class=\"type-box\">\n              <h2>ประเภท</h2>\n              <label class=\"type-option\"><input type=\"radio\" name=\"p017type\" value=\"all\" checked>ทั้งหมด</label>\n              <label class=\"type-option\"><input type=\"radio\" name=\"p017type\" value=\"net\">เงินสด (NET)</label>\n              <label class=\"type-option\"><input type=\"radio\" name=\"p017type\" value=\"discount\">ลด 3%</label>\n            </div>\n            <button class=\"action search\" type=\"submit\"><span class=\"spinner\"><svg viewBox=\"0 0 24 24\"><path d=\"M12 3a9 9 0 1 1-9 9\"></path></svg></span>\n                <svg viewBox=\"0 0 24 24\">\n                  <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n                  <path d=\"m21 21-4.35-4.35\"></path>\n                </svg>\n                ค้นหา\n              </button>\n                      </div>\n        </form>\n      </section>\n\n      \n\n      <section class=\"panel\">\n        <div class=\"panel-header\">\n          <div class=\"panel-heading\">\n            <div class=\"panel-icon\">\n              <svg viewBox=\"0 0 24 24\">\n                <path d=\"M3 3h18v18H3z\"></path>\n                <path d=\"M3 9h18M9 3v18\"></path>\n              </svg>\n            </div>\n            <div class=\"panel-title\">\n              <h2>รายการบิลเงินสดที่ยังไม่ได้รับเงิน</h2>\n              <p id=\"p017panelSubtitle\">คลิกแถวเพื่อเลือกข้อมูลปัจจุบัน</p>\n            </div>\n          </div>\n\n          <span class=\"badge\" id=\"p017resultBadge\">0 รายการ</span>\n          <input type=\"text\" id=\"p017quickSearch\" class=\"quick-search\" placeholder=\"ค้นหา...\" autocomplete=\"off\"><button class=\"tool-btn\" id=\"p017printButton\" type=\"button\">\n            <svg viewBox=\"0 0 24 24\">\n              <path d=\"M6 9V2h12v7\"></path>\n              <path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16\"></path>\n              <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"></rect>\n            </svg>\n            Print\n          </button>\n          <button class=\"tool-btn green\" id=\"p017exportButton\" type=\"button\">\n            <svg viewBox=\"0 0 24 24\">\n              <path d=\"M12 3v12\"></path>\n              <path d=\"m7 10 5 5 5-5\"></path>\n              <path d=\"M5 21h14\"></path>\n            </svg>\n            Export Excel\n          </button>\n        </div>\n\n        <div class=\"table-wrap\" id=\"p017tableWrap\">\n          <table>\n            <thead>\n              <tr>\n                <th class=\"sortable center\" data-sort=\"date\">วันที่ <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"vnos\">เลขใบสำคัญ <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"customerCode\">รหัสลูกค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable\" data-sort=\"customer\">ชื่อลูกค้า <span class=\"arrow\"></span></th>\n                <th class=\"sortable center\" data-sort=\"dep\">DEP <span class=\"arrow\"></span></th>\n                <th class=\"sortable center\" data-sort=\"per\">PER <span class=\"arrow\"></span></th>\n                <th class=\"sortable number\" data-sort=\"amount\">จำนวน <span class=\"arrow\"></span></th>\n                <th>MIHdesc</th>\n              </tr>\n            </thead>\n            <tbody id=\"p017resultRows\"></tbody>\n          </table>\n        </div>\n\n        <div class=\"empty\" id=\"p017emptyState\">\n          <div>\n            <svg viewBox=\"0 0 24 24\" style=\"width:48px;height:48px;margin:0 auto 10px\">\n              <circle cx=\"11\" cy=\"11\" r=\"8\"></circle>\n              <path d=\"m21 21-4.35-4.35M8 11h6\"></path>\n            </svg>\n            <strong>ไม่พบข้อมูลตามเงื่อนไขที่เลือก</strong>\n            <p style=\"margin-top:5px;font-size:11px\">ลองเปลี่ยนคำค้นหา หรือเลือกประเภทบิลอื่น</p>\n          </div>\n        </div>\n        <div class=\"p017-pager\" id=\"p017pager\"></div>\n        <div class=\"panel-footer\">\n          <span id=\"p017footerText\">แสดง 0 รายการ</span>\n        </div>\n      </section>\n    </main>\n  </div>\n\n  <div class=\"modal-backdrop\" id=\"p017printModal\">\n  <section class=\"modal print-modal\" role=\"dialog\" aria-modal=\"true\">\n    <div class=\"print-toolbar\">\n      <div class=\"print-tools\">\n        <button class=\"zoom-btn\" id=\"p017zoomOut\" type=\"button\">−</button>\n        <span class=\"zoom-label\" id=\"p017zoomLabel\">100%</span>\n        <button class=\"zoom-btn\" id=\"p017zoomIn\" type=\"button\">+</button>\n        <button class=\"print-go\" id=\"p017printGo\" type=\"button\"><svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M19 8H22V16H19zM17 16V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3z\"/><circle cx=\"17\" cy=\"12\" r=\"1\"/></svg> Print</button>\n        <button class=\"modal-close\" id=\"p017closePrintModal\" type=\"button\" aria-label=\"บิด\">×</button>\n      </div>\n    </div>\n    <div class=\"print-body\">\n      <div class=\"print-content\" id=\"p017printContent\">\n        <iframe class=\"print-frame\" id=\"p017printFrame\" title=\"พลแพรายงาง\"></iframe>\n      </div>\n    </div>\n  </section>\n</div>\n\n  <div class=\"toast\" id=\"p017toast\">\n    <svg viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"></path></svg>\n    <span id=\"p017toastMessage\">ดำเนินการเรียบร้อยแล้ว</span>\n  </div>\n</div>";

  /* ===== Mock data (จาก demo/P017-demo.html) ===== */
  var bills = [
    { id: 1, date: "2026-09-29", vnos: "IVVN6909-4691", customerCode: "99999-010", customer: "ลูกหนี้พนักงาน", dep: "", per: "G03-C", amount: 370.00, status: "NET", type: "net", desc: "คุณเมีย e-com จ่ายเงินสดคืนเดือน 10/69" },
    { id: 2, date: "2026-10-01", vnos: "IVVN6910-0143", customerCode: "99999-010", customer: "ลูกหนี้พนักงาน", dep: "", per: "G03-C", amount: 960.00, status: "NET", type: "net", desc: "คุณเมีย e-com จ่ายเงินสดคืนเดือน 10/69" },
    { id: 3, date: "2026-10-05", vnos: "IVVN6910-0708", customerCode: "701000-003", customer: "ธนชัยพานิชย์", dep: "DIV1.TEL3", per: "S38.DIV1.TEL3", amount: 1047.60, status: "3%", type: "discount", desc: "ขายสินค้ารายการเงินสด ลูกค้าจ่ายเงินล่วงหน้า มีหลักฐานชำระ จัดทำ CN" },
    { id: 4, date: "2026-10-09", vnos: "IVVN6910-1494", customerCode: "12110-013", customer: "ดุงเสินการ์เด้น", dep: "DIV2.TEL2", per: "S51", amount: 7.80, status: "NET", type: "net", desc: "เงินมัดจำโอนKBANK-MCIT (ส่งหน้าร้าน)" },
    { id: 5, date: "2026-10-20", vnos: "COD76910-0027", customerCode: "74000-110", customer: "อมรชัยเกษตรเพชร บจก.", dep: "DIV2.TEL2", per: "S50", amount: 6628.65, status: "NET", type: "net", desc: "001272 จัดส่งไม่เกิน 21/10/2569 สินค้าเป็นราคานำเสนอ NET รับ VAT 7%" },
    { id: 6, date: "2026-10-21", vnos: "IVVF6910-0256", customerCode: "74110-129", customer: "พร้อมอุดม (LM)", dep: "DIV2.TEL2", per: "G01-BK01", amount: 2405.60, status: "3%", type: "discount", desc: "001345 ห้ามขายบิลเงินสดเกิน 3% สินค้าเป็นรายการเงินสดลด 3%" },
    { id: 7, date: "2026-10-23", vnos: "COD76910-0033", customerCode: "73170-009", customer: "ชำระพิชยมงคลอง บจก. (สำนักงานใหญ่)", dep: "DIV2.TEL2", per: "G01-BK01", amount: 1992.77, status: "NET", type: "net", desc: "001656 สินค้าเป็นรายการเงินสดลด 3% รับ VAT 7%" },
    { id: 8, date: "2026-10-23", vnos: "CODN6910-0187", customerCode: "10270-006", customer: "ท เจริญชัย บจก.", dep: "", per: "S51", amount: 4316.50, status: "3%", type: "discount", desc: "สินค้าเป็นรายการเงินสดลด 3% โดยพลาด ยัง พน ให้เหมือน เฉลี่ย 2.5%" },
    { id: 9, date: "2026-10-26", vnos: "CODN6910-0210", customerCode: "75000-018", customer: "จงเจริญพาณิชย์", dep: "DIV2.TEL2", per: "S50", amount: 183.33, status: "NET", type: "net", desc: "สินค้าเป็นรายการเงินสด 3% ลูกค้าโอนตามภายใน 7 วัน" },
    { id: 10, date: "2026-10-26", vnos: "CODN6910-0207", customerCode: "74130-035", customer: "น้องเมลซ่อม (20 บ.)", dep: "DIV2.TEL2", per: "S50", amount: 1047.60, status: "3%", type: "discount", desc: "สินค้าเป็นรายการเงินสดลด 3% โอนเงินภายใน 7 วัน" }
  ];

  var cssInjected = false;
  var currentItems = [];
  var currentId = null;
  var quickTerm = "";
  var loadedData = [];
var sortField = "date";
  var sortDirection = "asc";
  var page = 1;
  var pageSize = 15;
  var toastTimer;

  var els = {};
  var money = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function fmtMoney(value) { return money.format(Number(value || 0)); }
  function fmtDate(value) {
    var p = String(value || "").substring(0, 10).split("-");
    return Number(p[2]) + "/" + Number(p[1]) + "/" + p[0];
  }
  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function showToast(message) {
    var toast = document.getElementById("p017toast");
    document.getElementById("p017toastMessage").textContent = message;
    clearTimeout(toastTimer);
    toast.classList.add("show");
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1900);
  }
  function readType() {
    var r = document.querySelector('input[name="p017type"]:checked');
    return r ? r.value : "all";
  }
  function sortItems(items) {
    return items.slice().sort(function (a, b) {
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
    document.querySelectorAll(".p017-scope th[data-sort]").forEach(function (header) {
      var active = header.dataset.sort === sortField;
      header.classList.toggle("sorted", active);
      var arrow = header.querySelector(".arrow");
      if (arrow) arrow.textContent = active ? (sortDirection === "asc" ? "▲" : "▼") : "";
    });
  }
  function updateSummary(items) {
    document.getElementById("p017resultBadge").textContent = items.length + " รายการ";
    document.getElementById("p017footerText").textContent = "แสดง " + items.length + " รายการ";
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

    if (!sorted.some(function (item) { return item.id === currentId; })) currentId = sorted[0].id;

    var totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    if (page > totalPages) page = totalPages;
    var startIdx = (page - 1) * pageSize;
    var pageItems = sorted.slice(startIdx, startIdx + pageSize);

    pageItems.forEach(function (item) {
      var row = document.createElement("tr");
      row.dataset.id = item.id;
      if (item.id === currentId) row.classList.add("active");
      row.innerHTML =
        '<td class="center">' + fmtDate(item.date) + "</td>" +
        '<td class="p017-doc-no">' + escapeHTML(item.vnos) + "</td>" +
        '<td class="p017-cust-code">' + escapeHTML(item.customerCode) + "</td>" +
        '<td title="' + escapeHTML(item.customer) + '">' + escapeHTML(item.customer) + "</td>" +
        '<td class="center">' + escapeHTML(item.dep) + "</td>" +
        '<td class="center">' + escapeHTML(item.per) + "</td>" +
        '<td class="number p017-amount">฿' + fmtMoney(item.amount) + "</td>" +
        '<td title="' + escapeHTML(item.desc) + '">' + escapeHTML(item.desc) + "</td>";
      els.rows.appendChild(row);
    });
    renderPager(sorted.length, totalPages);
  }
  function renderPager(total, totalPages) {
    var pager = document.getElementById("p017pager");
    if (!pager) return;
    if (totalPages <= 1) {
      pager.innerHTML = "";
      pager.style.display = "none";
      return;
    }
    pager.style.display = "flex";
    var html = '<button type="button" class="pager-btn" data-page="prev" ' + (page <= 1 ? "disabled" : "") + '>' +
      '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"></path></svg></button>';
    for (var p = 1; p <= totalPages; p++) {
      html += '<button type="button" class="pager-btn num' + (p === page ? " active" : "") + '" data-page="' + p + '">' + p + "</button>";
    }
    html += '<button type="button" class="pager-btn" data-page="next" ' + (page >= totalPages ? "disabled" : "") + '>' +
      '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg></button>';
    pager.innerHTML = html;
  }
  function applyFilters(showMessage) {
    page = 1;
    var vnosEl = document.getElementById("p017vnosInput");
    var vnos = vnosEl ? vnosEl.value.trim().toLowerCase() : "";
    var cuscodeEl = document.getElementById("p017customerCodeInput");
    var customerCode = cuscodeEl ? cuscodeEl.value.trim().toLowerCase() : "";
    var cusnameEl = document.getElementById("p017customerNameInput");
    var customerName = cusnameEl ? cusnameEl.value.trim().toLowerCase() : "";
    var depEl = document.getElementById("p017depInput");
    var dep = depEl ? depEl.value.trim().toLowerCase() : "";
    var perEl = document.getElementById("p017perInput");
    var per = perEl ? perEl.value.trim().toLowerCase() : "";
    var type = readType();

    currentItems = loadedData.filter(function (item) {
      var q = quickTerm;
      var qHit = !q ||
        item.vnos.toLowerCase().indexOf(q) !== -1 ||
        item.customerCode.toLowerCase().indexOf(q) !== -1 ||
        item.customer.toLowerCase().indexOf(q) !== -1 ||
        item.dep.toLowerCase().indexOf(q) !== -1 ||
        item.per.toLowerCase().indexOf(q) !== -1 ||
        item.desc.toLowerCase().indexOf(q) !== -1;
      return qHit &&
        (!vnos || item.vnos.toLowerCase().indexOf(vnos) !== -1) &&
        (!customerCode || item.customerCode.toLowerCase().indexOf(customerCode) !== -1) &&
        (!customerName || item.customer.toLowerCase().indexOf(customerName) !== -1) &&
        (!dep || item.dep.toLowerCase().indexOf(dep) !== -1) &&
        (!per || item.per.toLowerCase().indexOf(per) !== -1) &&
        (type === "all" || item.type === type);
    });

    renderRows();

    var typeLabel = { all: "ทุกประเภท", net: "เงินสด (NET)", discount: "ลด 3%" }[type];
    document.getElementById("p017panelSubtitle").textContent = "กำลังแสดงรายการประเภท: " + typeLabel;

    if (showMessage) showToast("พบข้อมูล " + currentItems.length + " รายการ");
  }
  // C# loaddata() — รัน SQL ปุ่มค้นหากับ MAC5 ผ่าน api/p017_search.php
  function loaddata() {
    var type = readType();
    fetch("api/p017_search.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: "c1788406814359", type: type })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "ไม่สามารถโหลดข้อมูลได้");
        loadedData = data.rows || [];
        applyFilters(true);
      })
      .catch(function (err) {
        showToast("ไม่สามารถโหลดข้อมูลได้: " + err.message);
      });
  }
      var T_TITLE = "\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E1A\u0E34\u0E25\u0E40\u0E07\u0E34\u0E19\u0E2A\u0E14\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E40\u0E07\u0E34\u0E19";
  var T_PRINT_WHEN = "\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E21\u0E37\u0E48\u0E2D";
  var T_BY = "\u0E42\u0E14\u0E22";
  var T_PAGE = "\u0E2B\u0E19\u0E49\u0E32";
  var T_DATE = "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48";
  //var T_VNOS = "\u0E25\u0E40\u0E02\u0E17\u0E38\u0E1A\u0E32\u0E39\u0E28\u0E33\u0E04\u0E38\u0E39\u0E35";
  var T_VNOS = "\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E43\u0E1A\u0E2A\u0E33\u0E04\u0E31\u0E0D";
  var T_CUSCODE = "\u0E23\u0E2B\u0E31\u0E2A\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32";
  var T_CUSNAME = "\u0E0A\u0E37\u0E48\u0E2D\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32";
  var T_QTY = "\u0E08\u0E33\u0E19\u0E27\u0E19";
  var T_MEMO = "\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38";
  var printModal, zoomLabel;
  var printZoom = 100;
  function p017Frame() {
    return document.getElementById("p017printFrame");
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
    var f = p017Frame();
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
    var f = p017Frame();
    if (!f || !f.contentWindow) return;
    try {
      f.contentWindow.focus();
      f.contentWindow.print();
    } catch (e) { /* ignore */ }
  }
  function p017DocHtml(inner, title) {
  var css = [
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew.ttf') format('truetype');font-weight:400;font-style:normal;font-display:block}",
    "@font-face{font-family:'THSarabunNew';src:url('assets/fonts/THSarabunNew Bold.ttf') format('truetype');font-weight:700;font-style:normal;font-display:block}",
    ,
    "html,body{margin:0;padding:0;background:#eef2f7}",
    ".p017-page{box-sizing:border-box;width:297mm;height:210mm;padding:25pt;background:#fff;margin:0 auto;position:relative;overflow:hidden;font-family:'THSarabunNew',sans-serif;color:#000}",
    ".p017-page+.p017-page{margin-top:25pt}",
    ".p017-pgno{position:absolute;right:15pt;bottom:8pt;font-size:14pt;font-family:'THSarabunNew',sans-serif;white-space:nowrap}",
    ".p017tbl{width:780pt;margin:0 auto;border-collapse:collapse;table-layout:fixed}",
    ".p017tbl td,.p017tbl th{padding:3px 5px;font-size:14pt;border:0;vertical-align:middle;font-family:'THSarabunNew',sans-serif;font-weight:400}",
    ".p017hdr td.t{font-size:22pt;font-weight:700;text-align:center}",
    ".p017hdr td.m{font-size:14pt}",
    ".p017hdr tr.h th{font-weight:700;text-align:center;border:1px solid #555;background:#f0f0f0}",
    ".p017data{border:1px solid #000}",
    ".p017data td{border:1px solid #555;vertical-align:top}",
    ".p017data td.ctr{text-align:center}",
    ".p017data td.num{text-align:right}",
    "@page{size:A4 landscape;margin:25pt 25pt 30pt 25pt}",
    "@media print{html,body{background:#fff}.p017-page{width:100%;height:auto;min-height:0;overflow:visible;margin:0;padding:0;page-break-after:always;break-after:page}.p017-page:last-child{page-break-after:auto;break-after:auto}.p017-page+.p017-page{margin-top:0}.p017tbl tr{page-break-inside:avoid}}",
  ].join("\n");
    var js = "function fit(){if(!window.matchMedia('screen').matches)return;var m=window.__MAN;if(m){document.body.style.zoom=m;return}var w=window.innerWidth||document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,w/1123)}window.setZoom=function(z){window.__MAN=z;fit()};function rowOver(r){var s=r.closest('section.p017-page');if(!s)return false;var lr=r.getBoundingClientRect();var sr=s.getBoundingClientRect();return lr.bottom>sr.bottom-36}function renumber(){var s=document.querySelectorAll('section.p017-page');for(var i=0;i<s.length;i++){var f=s[i].querySelector('.p017-pgno');if(f)f.textContent='\u0E2B\u0E19\u0E49\u0E32 '+(i+1)}}function newSection(cur,t){var s2=document.createElement('section');s2.className='p017-page p017-cont';var first=document.querySelector('section.p017-page');var hd=first?first.querySelector('table.p017hdr'):null;if(hd)s2.appendChild(hd.cloneNode(true));var pn=document.createElement('div');pn.className='p017-pgno';s2.appendChild(pn);var nt=document.createElement('table');nt.className='p017tbl p017data';var cg=t.querySelector('colgroup');if(cg)nt.appendChild(cg.cloneNode(true));nt.appendChild(document.createElement('tbody'));s2.appendChild(nt);cur.parentNode.insertBefore(s2,cur.nextSibling);return{sec:s2,tbl:nt}}function pag(){var secs=Array.prototype.slice.call(document.querySelectorAll('section.p017-page'));if(!secs.length)return;var groups=[];secs.forEach(function(s){if(s.classList.contains('p017-cont'))groups[groups.length-1].push(s);else groups.push([s])});groups.forEach(function(g){var first=g[0];var t=first.querySelector('table.p017data');if(!t)return;for(var i=1;i<g.length;i++){var t2=g[i].querySelector('table.p017data');while(t2.tBodies[0].rows.length)t.tBodies[0].appendChild(t2.tBodies[0].rows[0]);g[i].parentNode.removeChild(g[i])}var rows=Array.prototype.slice.call(t.tBodies[0].rows);t.tBodies[0].innerHTML='';var cur=first,curT=t;rows.forEach(function(row){curT.tBodies[0].appendChild(row);var over=curT.tBodies[0].rows.length>1&&rowOver(row);if(over){curT.tBodies[0].removeChild(row);var ns=newSection(cur,t);cur=ns.sec;curT=ns.tbl;curT.tBodies[0].appendChild(row)}})});renumber()}if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){pag();fit()})}else{pag();fit()}window.addEventListener('load',function(){pag();fit()});window.addEventListener('resize',function(){fit()});setTimeout(function(){pag();fit()},250);";
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title><style>' + css + '</style></head><body>' + inner + '<scr' + 'ipt>' + js + '</scr' + 'ipt></body></html>';
  }
  function printReport() {
      var list = sortItems(currentItems);
      if (!list.length) {
        showToast("ไม่มีข้อมูลสำหรับพิมพ์");
        return;
      }
      var now = new Date().toLocaleString("th-TH");
      var colgroup = "<colgroup>" +
        "<col style=\"width:55pt\"><col style=\"width:80pt\"><col style=\"width:60pt\">" +
        "<col style=\"width:150pt\"><col style=\"width:60pt\"><col style=\"width:55pt\"><col style=\"width:55pt\">" +
        "<col style=\"width:220pt\"><col style=\"width:65pt\"></colgroup>";
      var rowsHtml = list.map(function (item) {
        return "<tr class=\"bdr\">" +
          "<td class=\"ctr\">" + fmtDate(item.date) + "</td>" +
          "<td class=\"ctr\">" + escapeHTML(item.vnos) + "</td>" +
          "<td class=\"ctr\">" + escapeHTML(item.customerCode) + "</td>" +
          "<td>" + escapeHTML(item.customer) + "</td>" +
          "<td class=\"ctr\">" + escapeHTML(item.dep) + "</td>" +
          "<td class=\"ctr\">" + escapeHTML(item.per) + "</td>" +
          '<td class="num">' + fmtMoney(item.amount) + "</td>" +
          "<td>" + escapeHTML(item.desc) + "</td>" +
          "<td>&nbsp;</td>" +
          "</tr>";
      }).join("");
      var hdrTable = "<table class=\"p017tbl p017hdr\">" + colgroup + "<tbody>" +
        "<tr><td colspan=\"9\" class=\"t\">" + T_TITLE + "</td></tr>" +
        "<tr><td colspan=\"9\" class=\"m\">" + T_PRINT_WHEN + " : " + now + "  " + T_BY + " : </td></tr>" +
        "<tr class=\"h\"><th>" + T_DATE + "</th><th>" + T_VNOS + "</th><th>" + T_CUSCODE + "</th><th>" + T_CUSNAME + "</th><th>DEP</th><th>PER</th><th>" + T_QTY + "</th><th>" + T_MEMO + "</th><th></th></tr>" +
        "</tbody></table>";
      var dataTable = "<table class=\"p017tbl p017data\">" + colgroup + "<tbody>" + rowsHtml + "</tbody></table>";
      var inner = "<section class=\"p017-page\"><div class=\"p017-pgno\">" + T_PAGE + " 1</div>" + hdrTable + dataTable + "</section>";
      var frame = p017Frame();
      if (!frame) return;
      frame.srcdoc = p017DocHtml(inner, T_TITLE);
      openPrintModal();
    }
  function toCp874(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var cp = str.charCodeAt(i);
      if (cp >= 0x0E00 && cp <= 0x0E7B) {
        bytes.push(0xA0 + (cp - 0x0E00));
      } else if (cp < 0x80) {
        bytes.push(cp);
      } else {
        bytes.push(0x3F);
      }
    }
    return bytes;
  }
  function exportCSV() {
    var list = sortItems(currentItems);
    if (!list.length) {
      showToast("ไม่มีข้อมูลสำหรับ Export");
      return;
    }
    var header = ["วันที่", "เลขใบสำคัญ", "รหัสลูกค้า", "ชื่อลูกค้า", "DEP", "PER", "จำนวน", "MIHdesc"];
    var rows = list.map(function (item) {
      return [item.date, item.vnos, item.customerCode, item.customer, item.dep, item.per, item.amount, item.desc];
    });
    var csv = [header].concat(rows).map(function (row) {
      return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");

    var blob = new Blob([new Uint8Array(toCp874(csv))], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "cash-bill-unreceived.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Export ไฟล์สำหรับเปิดใน Excel เรียบร้อยแล้ว");
  }

  function bindEvents() {
    document.getElementById("p017filterForm").addEventListener("submit", function (event) {
      event.preventDefault();
      var btn = document.querySelector(".filters .action.search");
      if (btn) {
        btn.classList.add("busy");
        btn.disabled = true;
        loaddata();
        setTimeout(function () {
          btn.classList.remove("busy");
          btn.disabled = false;
        }, 400);
      } else {
        loaddata();
      }
    });
    els.rows.addEventListener("click", function (event) {
      var row = event.target.closest("tr");
      if (!row) return;
      currentId = Number(row.dataset.id);
      renderRows();
    });
    document.querySelectorAll(".p017-scope th[data-sort]").forEach(function (header) {
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
    document.getElementById("p017quickSearch").addEventListener("input", function (event) {
      quickTerm = event.target.value.trim().toLowerCase();
      applyFilters(false);
    });
    var pagerEl = document.getElementById("p017pager");
    pagerEl.addEventListener("click", function (event) {
      var btn = event.target.closest("button.pager-btn");
      if (!btn || btn.disabled) return;
      var p = btn.dataset.page;
      var totalPages = Math.max(1, Math.ceil(currentItems.length / pageSize));
      if (p === "prev") {
        if (page > 1) { page--; renderRows(); }
      } else if (p === "next") {
        if (page < totalPages) { page++; renderRows(); }
      } else {
        page = Number(p);
        renderRows();
      }
    });
    document.getElementById("p017printButton").addEventListener("click", printReport);
    printModal = document.getElementById("p017printModal");
    zoomLabel = document.getElementById("p017zoomLabel");
    document.getElementById("p017printGo").addEventListener("click", printFrameNow);
    document.getElementById("p017zoomIn").addEventListener("click", function () { setPrintZoom(printZoom + 25); });
    document.getElementById("p017zoomOut").addEventListener("click", function () { setPrintZoom(printZoom - 25); });
    document.getElementById("p017closePrintModal").addEventListener("click", closePrintModal);
    printModal.addEventListener("click", function (e) { if (e.target === printModal) closePrintModal(); });
    document.getElementById("p017exportButton").addEventListener("click", exportCSV);
  }

  function mount(el) {
    if (!el) return;
    if (!cssInjected) {
      var style = document.createElement("style");
      style.textContent = CSS;
      document.head.appendChild(style);
      cssInjected = true;
    }
    el.innerHTML = HTML;
    els.rows = document.getElementById("p017resultRows");
    els.tableWrap = document.getElementById("p017tableWrap");
    els.empty = document.getElementById("p017emptyState");
    bindEvents();
  }

  window.P017CashBill = { mount: mount };
})();
