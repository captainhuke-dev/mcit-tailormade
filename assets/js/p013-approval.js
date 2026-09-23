/* P013 — ใบอนุมัติวงเงินและปรับวงเงิน (UI + mock data — ยังไม่มี SQL) */
(function () {
  "use strict";

  var PAGE_SIZE = 15;

  var CSS = `
.p013{color:#172033;display:flex;flex-direction:column;gap:12px}
.p013 *{box-sizing:border-box}
.p013-tabpanel{display:flex;flex:1;min-height:0;flex-direction:column;gap:12px}
.p013 svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.p013-paper #barcode{width:100%;height:29px;fill:#000;stroke:none}
.p013-cr1b{font-weight:700}
#p013CrBatch{font-size:16pt;line-height:1}
.p013-credit:not(.p013-ar):not(.p013-ch):not(.p013-so):not(.p013-odoo) tr:first-child{height:35px}
.p013-credit:not(.p013-ar):not(.p013-ch):not(.p013-so):not(.p013-odoo) tr:first-child td{vertical-align:middle}
.p013-credit .lbl{font-weight:700;background:transparent}
.p013-c{text-align:center}
.p013-credit .c{text-align:center}
.p013-ar-title{text-align:center;margin-top:8px}
.p013-ar{margin-top:10px;border-collapse:separate;border-spacing:0}
#p013CrDocNo{border-left:none}

/* ===== Tab bar ===== */
.p013-tab.active{color:#fff;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 7px 16px rgba(37,99,235,.22)}
.p013-tab svg{width:17px;height:17px}

/* ===== Launcher ===== */
.p013-launcher{display:grid;grid-template-columns:minmax(300px,1.15fr) minmax(190px,.8fr) minmax(210px,.9fr) auto;gap:12px;padding:16px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}
.p013-field label{display:block;margin-bottom:6px;color:#64748b;font-size:11px;font-weight:600}
.p013-daterange{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}
.p013-datesep{color:#64748b;font-size:12px;font-weight:600}
.p013-inputwrap{position:relative}
.p013-field input{width:100%;height:44px;padding:0 13px;color:#172033;border:1px solid #e2e8f0;border-radius:11px;outline:none;background:#fff;transition:.18s ease}
.p013-field input::placeholder{color:#a6afbd}
.p013-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}
.p013-searchbtn{display:inline-flex;height:44px;align-self:end;align-items:center;justify-content:center;gap:8px;padding:0 20px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-weight:700;white-space:nowrap;transition:.18s ease;cursor:pointer}
.p013-searchbtn:hover{filter:brightness(1.06);transform:translateY(-1px)}
.p013-searchbtn svg{width:18px;height:18px}

/* ===== Action bar ===== */
.p013-actionbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 4px 12px rgba(15,23,42,.04)}
.p013-selinfo{display:flex;min-width:0;align-items:center;gap:10px}
.p013-selicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:11px;background:#eff6ff}
.p013-selicon svg{width:18px;height:18px}
.p013-seltext{min-width:0}
.p013-seltext strong{display:block;font-size:13px}
.p013-seltext span{display:block;color:#64748b;font-size:10px}
.p013-actionbtns{display:flex;flex:0 0 auto;align-items:center;gap:9px}
.p013-ghostbtn{display:inline-flex;height:38px;align-items:center;gap:6px;padding:0 13px;color:#64748b;border:1px solid #e2e8f0;border-radius:10px;background:#fff;font-size:12px;font-weight:600;white-space:nowrap;transition:.16s ease;cursor:pointer}
.p013-ghostbtn:hover{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}
.p013-ghostbtn svg{width:16px;height:16px}
.p013-printbtn{display:inline-flex;height:38px;align-items:center;gap:6px;padding:0 15px;color:#fff;border:0;border-radius:10px;background:#059669;font-size:12px;font-weight:700;transition:.18s ease;white-space:nowrap;cursor:pointer}
.p013-printbtn:hover{background:#047857;transform:translateY(-1px);box-shadow:0 8px 18px rgba(5,150,105,.28)}
.p013-printbtn svg{width:16px;height:16px}
.p013-modalhd .p013-printbtn{height:40px;padding:0 18px;font-size:13px}

/* ===== Panel ===== */
.p013-panel{display:flex;min-height:460px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}
.p013-panelhead{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid #e2e8f0}
.p013-panelhd{display:flex;min-width:0;align-items:center;gap:10px}
.p013-panelicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:11px;background:#eff6ff}
.p013-panelicon svg{width:19px;height:19px}
.p013-paneltitle{min-width:0}
.p013-paneltitle h2{overflow:hidden;font-size:15px;text-overflow:ellipsis;white-space:nowrap;margin:0}
.p013-paneltitle p{overflow:hidden;margin:1px 0 0;color:#64748b;font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.p013-panelacts{display:flex;align-items:center;gap:9px}
.p013-panelbody{flex:1;min-height:400px}
.p013-badge{flex:0 0 auto;padding:5px 10px;color:#1d4ed8;border-radius:999px;background:#dbeafe;font-size:11px;font-weight:700;white-space:nowrap}

/* ===== Table ===== */
.p013-twrap{min-height:0;flex:1;overflow:auto}
.p013-table{width:100%;min-width:1100px;border-collapse:separate;border-spacing:0;white-space:nowrap}
.p013-table th{position:sticky;top:0;z-index:5;padding:13px 14px;color:#475569;border-bottom:1px solid #e2e8f0;background:#f8fafc;box-shadow:inset 0 -1px #e2e8f0;font-size:13px;font-weight:700;text-align:left;user-select:none}
.p013-table th.sortable{cursor:pointer}
.p013-table th.sortable:hover{color:#2563eb;background:#f1f5f9}
.p013-sortmark{margin-left:4px;color:#94a3b8;font-size:10px}
.p013-table td{max-width:360px;overflow:hidden;padding:12px 14px;border-bottom:1px solid #edf1f6;font-size:13px;line-height:1.5;text-overflow:ellipsis}
.p013-table th.center,.p013-table td.center{text-align:center}
.p013-table th.number,.p013-table td.number{text-align:right}
.p013-table tbody tr{min-height:48px;transition:.14s ease}
.p013-table tbody tr:nth-child(even){background:#fbfdff}
.p013-table tbody tr:hover{background:#f0f7ff}
.p013-table tbody tr.selected{background:#eaf3ff;box-shadow:inset 4px 0 #2563eb}
.p013-cbcell{width:48px;text-align:center}
.p013-cb{width:17px;height:17px;accent-color:#2563eb;cursor:pointer}
.p013-docno{color:#1d4ed8;font-weight:700}
.p013-custcode{color:#334155;font-variant-numeric:tabular-nums;font-weight:600}
.p013-amt{color:#0f172a;font-variant-numeric:tabular-nums;font-weight:700}
.p013-note{color:#475569;font-size:12px}
.p013-printn{font-variant-numeric:tabular-nums;font-weight:600;color:#334155}

/* ===== Footer ===== */
.p013-footer{display:flex;min-height:52px;align-items:center;justify-content:space-between;gap:12px;padding:8px 15px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px}
.p013-footer>span{color:#64748b}
/* ===== Pager ===== */
.p013-pager{display:none;align-items:center;gap:6px;padding:9px 15px;border-top:1px solid #e2e8f0;background:#fff}
.p013-pager.show{display:flex}
.p013-pagerbtn{display:grid;width:30px;height:30px;place-items:center;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;background:#fff;transition:.15s;cursor:pointer}
.p013-pagerbtn:hover:not(:disabled){color:#2563eb;border-color:#93c5fd;background:#eff6ff}
.p013-pagerbtn:disabled{opacity:.4;cursor:default}
.p013-pagerbtn svg{width:16px;height:16px}
.p013-pg-pages{display:flex;align-items:center;gap:4px}
.p013-pg-num{min-width:30px;height:30px;padding:0 6px;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:11px;font-weight:600;transition:.15s;cursor:pointer}
.p013-pg-num:hover:not(.active){color:#2563eb;border-color:#93c5fd;background:#eff6ff}
.p013-pg-num.active{color:#fff;border-color:#2563eb;background:#2563eb}
.p013-pg-num.ellipsis{border:0;background:none;cursor:default}

/* ===== Empty ===== */
.p013-empty{display:none;min-height:300px;flex:1;align-items:center;justify-content:center;padding:30px;color:#64748b;text-align:center}
.p013-empty.show{display:flex}
.p013-emptyicon{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 11px;color:#94a3b8;border-radius:18px;background:#f1f5f9}
.p013-emptyicon svg{width:26px;height:26px}
.p013-empty h3{color:#172033;font-size:15px;margin:0}
.p013-empty p{margin:4px 0 0;font-size:11px}

/* ===== Modal ===== */
.p013-modalbd{position:fixed;inset:0;z-index:100;display:none;padding:20px;place-items:center;background:rgba(15,23,42,.52);backdrop-filter:blur(4px)}
.p013-modalbd.show{display:grid}
.p013-modal{display:flex;width:min(1150px,100%);max-height:92vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 28px 75px rgba(15,23,42,.36);animation:p013modalOpen .2s ease}
@keyframes p013modalOpen{from{opacity:0}to{opacity:1}}
.p013-modalhd{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid #e2e8f0}
.p013-modalhdg{display:flex;min-width:0;align-items:center;gap:10px}
.p013-modalicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:11px;background:#eff6ff}
.p013-modalhdg h3{font-size:15px;margin:0}
.p013-modalhdg p{color:#64748b;font-size:10px;margin:0}
.p013-modalbtns{display:flex;align-items:center;gap:6px}
.p013-iconbtn{display:inline-flex;height:36px;align-items:center;justify-content:center;gap:6px;padding:0 11px;color:#64748b;border:1px solid #e2e8f0;border-radius:9px;background:#fff;font-size:11px;font-weight:600;cursor:pointer;transition:.16s ease}
.p013-iconbtn:hover{color:#2563eb;border-color:#bfdbfe;background:#eff6ff}
.p013-iconbtn svg{width:16px;height:16px}
.p013-iconbtn.p013-print{color:#fff;border-color:#2563eb;background:#2563eb}
.p013-iconbtn.p013-print:hover{background:#1d4ed8}
.p013-closebtn{width:36px;padding:0;font-size:20px}
.p013-closebtn:hover{color:#dc2626;border-color:#fecaca;background:#fef2f2}
.p013-zoomlabel{padding:0 8px;color:#64748b;font-size:11px;font-weight:700;white-space:nowrap}
.p013-modalbd-area{position:relative;min-height:0;flex:1;overflow:auto;background-color:#d7dde5;background-image:linear-gradient(45deg,#cdd4dd 25%,transparent 25%),linear-gradient(-45deg,#cdd4dd 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#cdd4dd 75%),linear-gradient(-45deg,transparent 75%,#cdd4dd 75%);background-position:0 0,0 10px,10px -10px,-10px 0;background-size:20px 20px}
.p013-stage{display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100%;padding:42px;gap:28px}
.p013-paperwrap{flex:0 0 auto}

/* ===== Paper (F14 = 612x1009pt — margin 30pt ทั้ง 4 ด้าน) ===== */
.p013-paper{width:612pt;min-height:1009pt;padding:30pt;color:#111827;background:#fff;box-shadow:0 20px 52px rgba(15,23,42,.32);transform-origin:top left;font-family:Tahoma,Arial,sans-serif;display:flex;flex-direction:column}
.p013-body{flex:0 1 auto}
.p013-spacer{flex:1 1 auto}
.p013-repftr{width:100%;font-size:9px;line-height:1.4;color:#111827}
.p013-repftr td{padding:2px 0}
.p013-credit{width:100%;border-collapse:collapse;table-layout:fixed;font-size:10px}
.p013-crlist{margin-top:-1px}
.p013-credit td{border:1px solid #000;padding:3px 4px;vertical-align:top;overflow-wrap:anywhere;line-height:1.45}
.p013-credit .r{text-align:right}
.p013-credit .b{font-weight:700}
.p013-credit .hd{font-weight:700}
.p013-credit .lbl{background:transparent}
.p013-credit.p013-ar td{border-top:none;border-bottom:none;border-left:none}
.p013-credit.p013-ar td:first-child{border-left:1px solid #000}
.p013-credit.p013-ar tr:first-child td{border-top:1px solid #000}
.p013-credit.p013-ar tr:last-child td{border-bottom:1px solid #000;border-top:1px solid #000}
.p013-credit.p013-ar.p013-ch td{border-top:none!important;border-bottom:none!important}
.p013-credit.p013-ar.p013-ch tr.p013-hd td{border-top:1px solid #000!important;border-bottom:1px solid #000!important}
.p013-credit.p013-ar.p013-ch tr:last-child td{border-bottom:1px solid #000!important}
.p013-credit.p013-ar tr.p013-title td{border-top:none;border-bottom:none;border-left:none;border-right:none;text-align:center;font-weight:700;font-size:11px;vertical-align:bottom}
.p013-credit.p013-ar.p013-ch tr.p013-title td{border-top:none!important;border-bottom:none!important;border-left:none!important;border-right:none!important;text-align:center;font-weight:700;font-size:11px;vertical-align:bottom}
.p013-credit.p013-so thead tr:first-child th{font-size:11px;vertical-align:bottom;border:none}
.p013-credit.p013-odoo thead tr:first-child th{font-size:11px;vertical-align:bottom;border:none}
.p013-credit.p013-so{margin-top:10px}
.p013-credit.p013-so th{font-weight:700;text-align:center;border:1px solid #000;padding:3px 4px;vertical-align:middle}
.p013-credit.p013-so td{vertical-align:top}
.p013-credit.p013-so tbody td{border-top:none;border-bottom:none}
.p013-credit.p013-so thead tr:nth-child(2) th{border-top:1px solid #000}
.p013-credit.p013-so thead tr:last-child th{border-bottom:1px solid #000}
.p013-credit.p013-so tbody tr:last-child td{border-bottom:1px solid #000}
.p013-credit.p013-odoo{margin-top:10px}
.p013-credit.p013-odoo th{font-weight:700;text-align:center;border:1px solid #000;padding:3px 4px;vertical-align:middle}
.p013-credit.p013-odoo td{vertical-align:top}
.p013-credit.p013-odoo tbody td{border-top:none;border-bottom:none}
.p013-credit.p013-odoo thead tr th{border-bottom:1px solid #000}
.p013-credit.p013-odoo tbody tr:last-child td{border-bottom:1px solid #000}
.p013-zoomtag{position:absolute;right:15px;bottom:14px;z-index:4;padding:6px 9px;color:#fff;border-radius:8px;background:rgba(15,23,42,.78);font-size:10px;pointer-events:none}

/* ===== Tab 2: Launcher ===== */

/* ===== Tab 2: Panel ===== */

/* ===== Tab 2: Credit modal ===== */

/* ===== SO Modal (scan/enter) ===== */
@media (max-width:640px){
}

/* ===== Toast ===== */
.p013-toast{position:fixed;right:20px;bottom:20px;z-index:200;display:flex;visibility:hidden;align-items:center;gap:8px;padding:11px 14px;color:#fff;border-radius:11px;opacity:0;background:#0f172a;box-shadow:0 16px 36px rgba(15,23,42,.28);font-size:11px;transform:translateY(12px);transition:.2s ease}
.p013-toast.show{visibility:visible;opacity:1;transform:translateY(0)}
.p013-toast svg{width:17px;height:17px;color:#34d399}
.p013-toast.err svg{color:#f87171}

/* ===== Print (F14 = 612x1009pt — margin 30pt) ===== */
@media print{
  @page{size:612pt 1009pt;margin:30pt}
  html,body{width:auto;height:auto;overflow:visible;background:#fff}
  body *{visibility:hidden !important}
  .p013-paper,.p013-paper *{visibility:visible !important}
  .p013-paper{position:relative;top:0;left:0;width:612pt;min-height:0;padding:0;box-shadow:none;transform:none !important;page-break-after:always;break-after:page}
  .p013-paper:last-of-type{page-break-after:auto;break-after:auto}
  .p013-paperwrap{page-break-inside:avoid;break-inside:avoid}
  .p013-repftr{padding:0}
  .p013-credit td{padding:2px 3px;font-size:8px}
}
`;

  var I = {
    doc: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>',
    sliders: '<svg viewBox="0 0 24 24"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"></path><path d="M1 14h6M9 8h6M17 16h6"></path></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"></path></svg>',
    selectall: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 11l3 3 4-5"></path></svg>',
    reset: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>',
    zoomOut: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M8 11h6M21 21l-4.35-4.35"></path></svg>',
    zoomIn: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M8 11h6M11 8v6M21 21l-4.35-4.35"></path></svg>',
    fit: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M16 3h3a2 2 0 0 1 2 2v3"></path><path d="M8 21H5a2 2 0 0 1-2-2v-3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>',
    print: '<svg viewBox="0 24 24"></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"></path></svg>',
    empty: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>',
    chevL: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"></path></svg>',
    chevR: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>',
    user2: '<svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    coins: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
    trendDown: '<svg viewBox="0 0 24 24"><path d="M23 18l-9.5-9.5-5 5L1 6"></path><path d="M17 18h6v-6"></path></svg>',
    toast: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>'
  };
  I.print = '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>';

  // ===== Mock data (จาก demo/P013_demo.html — SCRE6909) =====
  var MOCK = [
    { date: "2026-09-17", doc: "SCRE6909-1963", code: "30270-014", name: "ก.เกษตร เคมีภัณฑ์", amount: 2390.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1964", code: "36180-006", name: "เจริญวัฒนาการเกษตร หจก.", amount: 3240.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1965", code: "73150-016", name: "เจริญวัฒนาค้าไม้", amount: 22350.00, note: "BMVN จิ๋ว (16/9/69)", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1966", code: "40120-009", name: "ชัยวัฒน์", amount: 5900.00, note: "md.ok", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1967", code: "67120-012", name: "สิทธิชัย", amount: 8704.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1968", code: "40220-001", name: "มีโชค 2", amount: 3520.00, note: "", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1969", code: "40170-016", name: "นิยมพานิช", amount: 2000.00, note: "", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1970", code: "92000-067", name: "ทรัพย์อนันต์ เทรดดิ้ง (LM)", amount: 4200.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1971", code: "81160-007", name: "สาม ช.พาณิชย์", amount: 3200.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1972", code: "84250-004", name: "เจริญชัยการไฟฟ้า", amount: 3237.50, note: "", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1973", code: "92160-016", name: "คลังเกษตร (LC)", amount: 2200.00, note: "", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1974", code: "82180-001", name: "11 การเกษตร", amount: 6470.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1975", code: "85110-007", name: "วิชายูการค้า (สาขา 1 หน้าปั๊ม PT)", amount: 2020.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1976", code: "81160-016", name: "ป.เกษตรภัณฑ์", amount: 3480.00, note: "", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1977", code: "81000-054", name: "เต็มพรการเกษตร บจก.", amount: 5250.00, note: "", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1978", code: "81110-017", name: "คลองจั่นการเกษตร", amount: 2500.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1979", code: "81110-011", name: "สามมาตรการค้า", amount: 920.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1980", code: "11130-020", name: "ชวัญตา ค้าวัสดุก่อสร้าง", amount: 4200.00, note: "BOVN MCIT/SO/2609-124347", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1981", code: "10250-053", name: "เคพี ค้าวัสดุ หจก. (อู่ทองแต่งสวน) (LC)", amount: 2184.00, note: "BOVN", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1982", code: "11140-037", name: "เทพพฤกษา (LM)", amount: 590.00, note: "BOVN", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1985", code: "12150-005", name: "รุ่งเรืองกิจ", amount: 4380.00, note: "BOVN", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1986", code: "72140-014", name: "สมฤทธิ์ ฮาร์ดแวร์", amount: 7928.00, note: "TM-จิ๋ว (17/09/69)", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1987", code: "90180-017", name: "ด้วน (ร้าน)", amount: 680.00, note: "", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1988", code: "72140-004", name: "ฮั้วฮวดเส็งค้าวัสดุภัณฑ์ บจก.", amount: 7260.00, note: "TM-จิ๋ว (17/09/69)", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1989", code: "62170-014", name: "อัมพรบริการ", amount: 990.00, note: "VF MCIT/SO/2609-124383 · TM-พลอย (17/09/69)", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1990", code: "55000-026", name: "อ้างกิจเกษตร", amount: 31522.00, note: "TM-พลอย (17/09/69)", creator: "naree" },
    { date: "2026-09-17", doc: "SCRE6909-1991", code: "55150-012", name: "รุ่งภา", amount: 3480.00, note: "TK-พลอย (17/09/69)", creator: "admin" },
    { date: "2026-09-17", doc: "SCRE6909-1992", code: "60150-002", name: "สายฟ้า (เซง) วิบูลย์ภัณฑ์ (เจ๊นก)", amount: 4600.00, note: "TM-พลอย (17/09/69)", creator: "somsak" },
    { date: "2026-09-17", doc: "SCRE6909-1993", code: "60140-009", name: "นิวดีวงกี", amount: 5040.00, note: "TM-พลอย (17/09/69)", creator: "somsak" }
  ];

  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var intFmt = new Intl.NumberFormat("th-TH");
  var PAGE_SIZE = 15;
  var MAC5_CONNECTION_ID = "c1788406814359";
  var ODOO_CONNECTION_ID = "c1788406918263";

  var state = {
    filtered: [],
    selected: {},
    sortField: "doc",
    sortDir: "asc",
    page: 1,
    loading: false,
    searched: false,
    zoom: 100,
    escBound: false,
    toastTimer: null,
    machine: ""
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(v) {
    return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function money(v) { return moneyFmt.format(Number(v || 0)); }
  function fmtDate(iso) {
    if (!iso) return "-";
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function toast(msg, ok) {
    var t = $("#p013Toast");
    if (!t) return;
    $("#p013ToastMsg").textContent = msg;
    t.classList.toggle("err", ok === false);
    t.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(function () { t.classList.remove("show"); }, ok === false ? 3200 : 1800);
  }

  function readFilters() {
    return {
      from: $("#p013From").value,
      to: $("#p013To").value,
      creator: $("#p013Creator").value.trim(),
      customer: $("#p013Customer").value.trim()
    };
  }

  function applyFilters(withMsg) {
    var f = readFilters();
    if (f.from && f.to && f.from > f.to) { toast("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด", false); return; }
    state.loading = true;
    state.searched = true;
    fetch("api/p013_search.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId: MAC5_CONNECTION_ID,
        from: f.from,
        to: f.to,
        creator: f.creator,
        customer: f.customer
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        state.loading = false;
        if (!d.ok) { toast("ค้นหาไม่สำเร็จ: " + (d.error || ""), false); state.filtered = []; state.page = 1; renderRows(); return; }
        state.filtered = d.rows || [];
        state.machine = d.machine || "";
        $("#p013Period").textContent = "ช่วงวันที่ " + fmtDate(f.from) + " ถึง " + fmtDate(f.to);
        state.page = 1;
        renderRows();
        if (withMsg) {
          if (state.filtered.length === 0) toast("⚠ ไม่พบข้อมูล — ไม่มีรายการที่ตรงกับเงื่อนไขค้นหา", false);
          else toast("พบข้อมูล " + intFmt.format(state.filtered.length) + " รายการ");
        }
      })
      .catch(function (e) {
        state.loading = false;
        toast("ค้นหาไม่สำเร็จ: " + e.message, false);
        state.filtered = [];
        state.page = 1;
        renderRows();
      });
  }

  function sortItems(items) {
    var f = state.sortField, d = state.sortDir;
    return items.slice().sort(function (a, b) {
      var x = a[f], y = b[f];
      if (typeof x === "string") { x = x.toLowerCase("th"); y = y.toLowerCase("th"); }
      if (x < y) return d === "asc" ? -1 : 1;
      if (x > y) return d === "asc" ? 1 : -1;
      return 0;
    });
  }

  function selectedItems() {
    return state.filtered.filter(function (it) { return state.selected[it.doc]; });
  }

  function updateSelection() {
    var sel = selectedItems();
    var total = sel.reduce(function (s, it) { return s + it.amount; }, 0);
    $("#p013SelCount").textContent = "เลือกแล้ว " + intFmt.format(sel.length) + " รายการ";
    $("#p013SelAmount").textContent = "ยอดรวมที่เลือก ฿" + money(total);
    var all = state.filtered.length > 0 && state.filtered.every(function (it) { return state.selected[it.doc]; });
    var some = state.filtered.some(function (it) { return state.selected[it.doc]; });
    var sa = $("#p013SelAll");
    sa.checked = all;
    sa.indeterminate = !all && some;
  }

  function renderRows() {
    var items = sortItems(state.filtered);
    var tbody = $("#p013Rows");
    tbody.innerHTML = "";
    $("#p013Badge").textContent = intFmt.format(items.length) + " รายการ";

    var empty = $("#p013Empty");
    var wrap = $("#p013Twrap");
    var foot = $("#p013Footer");
    if (items.length === 0) {
      var eh = empty.querySelector("h3");
      var et = $("#p013EmptyText");
      if (eh) eh.textContent = state.searched ? "ไม่พบเอกสารรออนุมัติ" : "ยังไม่มีข้อมูล";
      if (et) et.textContent = state.searched ? "ลองเปลี่ยนช่วงวันที่ ผู้สร้างเอกสาร หรือชื่อลูกหนี้" : "ตั้งค่าเงื่อนไขค้นหา แล้วกด ปุ่ม ค้นหา เพื่อโหลดข้อมูล";
      wrap.style.display = "none";
      foot.style.display = "none";
      $("#p013Pager").classList.remove("show");
      empty.classList.add("show");
      updateSelection();
      return;
    }
    wrap.style.display = "block";
    foot.style.display = "flex";
    empty.classList.remove("show");

    var totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageRows = items.slice(start, start + PAGE_SIZE);

    $("#p013FootDesc").textContent = "แสดง " + intFmt.format(start + 1) + "–" + intFmt.format(start + pageRows.length) + " จาก " + intFmt.format(items.length) + " รายการ";

    pageRows.forEach(function (it) {
      var tr = document.createElement("tr");
      if (state.selected[it.doc]) tr.classList.add("selected");
      tr.innerHTML =
        '<td class="p013-cbcell"><input class="p013-cb" type="checkbox" data-doc="' + esc(it.doc) + '"' + (state.selected[it.doc] ? " checked" : "") + '></td>' +
        '<td class="center">' + fmtDate(it.date) + "</td>" +
        '<td class="p013-docno">' + esc(it.doc) + "</td>" +
        '<td class="p013-custcode">' + esc(it.code) + "</td>" +
        '<td title="' + esc(it.name) + '">' + esc(it.name) + "</td>" +
        '<td class="number p013-amt">฿' + money(it.amount) + "</td>" +
        '<td class="center p013-printn">' + intFmt.format(it.printN || 0) + "</td>" +
        '<td class="p013-note" title="' + esc(it.note) + '">' + esc(it.note || "-") + "</td>";
      tbody.appendChild(tr);
    });
    // sort marks
    $$("#p013Table th.sortable").forEach(function (th) {
      var m = th.querySelector(".p013-sortmark");
      if (m) m.textContent = th.dataset.sort === state.sortField ? (state.sortDir === "asc" ? "↑" : "↓") : "↕";
    });
    renderPager(items.length, totalPages, start, pageRows.length);
    updateSelection();
  }

  function renderPager(total, pages, start, shown) {
    var pager = $("#p013Pager");
    pager.classList.toggle("show", pages > 1);
    if (pages <= 1) { $("#p013Pages").innerHTML = ""; return; }
    var cur = state.page;
    var nums = [];
    function push(n) { nums.push(n); }
    push(1);
    var lo = Math.max(2, cur - 1), hi = Math.min(pages - 1, cur + 1);
    if (lo > 2) push("…");
    for (var p = lo; p <= hi; p++) push(p);
    if (hi < pages - 1) push("…");
    if (pages > 1) push(pages);
    $("#p013Pages").innerHTML = nums.map(function (n) {
      if (n === "…") return '<span class="p013-pg-num ellipsis">…</span>';
      return '<button class="p013-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p013-page="' + n + '">' + n + "</button>";
    }).join("");
    $("#p013Prev").disabled = cur <= 1;
    $("#p013Next").disabled = cur >= pages;
  }

  function gotoPage(p) {
    state.page = p;
    renderRows();
  }

  async function renderPreview() {
    var sel = sortItems(selectedItems());
    // ===== paper หลายใบ — 1 ใบต่อ 1 row ที่เลือก — fetch cache ตาม รหัสลูกหนี้+doc =====
    var tpl = $("#p013PaperTpl");
    var stage = $("#p013Stage");
    if (!tpl || !stage || !sel.length) return;
    var fetchCache = {};
    var doFetch = function (url, body) {
      var key = url + "::" + JSON.stringify(body);
      if (!fetchCache[key]) {
        fetchCache[key] = fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }).then(function (r) { return r.json(); }).catch(function (e) { console.warn("p013 fetch", e); return null; });
      }
      return fetchCache[key];
    };
    function buildPaper(paper, it) {
      var lineBreak = function (s) { return esc(String(s == null ? "" : s)).replace(/\r\n/g, "<br>").replace(/\n/g, "<br>"); };
      return Promise.all([
        it.code ? doFetch("api/p013_customer.php", { connectionId: MAC5_CONNECTION_ID, code: it.code }) : Promise.resolve(null),
        it.code ? doFetch("api/p013_amounts.php", { connectionId: MAC5_CONNECTION_ID, code: it.code, doc: it.doc || "" }) : Promise.resolve(null),
        it.code ? doFetch("api/p013_lists.php", { connectionId: MAC5_CONNECTION_ID, code: it.code }) : Promise.resolve(null),
        it.code ? doFetch("api/p013_debts.php", { connectionId: MAC5_CONNECTION_ID, code: it.code }) : Promise.resolve(null),
        it.code ? doFetch("api/p013_checks.php", { connectionId: MAC5_CONNECTION_ID, code: it.code }) : Promise.resolve(null),
        it.doc ? doFetch("api/p013_so_items.php", { connectionId: MAC5_CONNECTION_ID, doc: it.doc }) : Promise.resolve(null),
        it.code ? doFetch("api/p013_odoo.php", { connectionId: ODOO_CONNECTION_ID, code: it.code }) : Promise.resolve(null)
      ]).then(function (res) {
        var custR = res[0], amtR = res[1], listR = res[2], arR = res[3], chR = res[4], soR = res[5], odR = res[6];
        var cust = custR && custR.ok ? custR.customer : null;
        var amt = amtR && amtR.ok ? amtR.amounts : null;
        var lists = listR && listR.ok ? listR.lists : null;
        var arRows = arR && arR.ok ? arR.rows : null;
        var chRows = chR && chR.ok ? chR.rows : null;
        var soRows = soR && soR.ok ? soR.rows : null;
        var odooRows = odR && odR.ok ? odR.rows : null;
        // ===== Row 1/2 — ข้อมูลลูกค้า (sql) — fallback mock =====
        if (cust) {
          paper.querySelector("#p013CrTitle").innerHTML = esc(cust.code) + "&nbsp;&nbsp;(" + esc(cust.group) + ") " + esc(cust.name);
          paper.querySelector("#p013CrBatch").textContent = cust.grade || "-";
          paper.querySelector("#p013CrSalesman").textContent = cust.sale || "-";
          var dp = (cust.date || "").split("/");
          if (dp.length === 3) {
            paper.querySelector("#p013CrStartDate").textContent = dp[1] + "/" + dp[0] + "/" + (Number(dp[2]) + 543);
          }
          paper.querySelector("#p013CrAddr").textContent = cust.address || "-";
          paper.querySelector("#p013CrPhone").textContent = cust.tel || "-";
        } else {
          paper.querySelector("#p013CrStartDate").textContent = mock.startDate;
          paper.querySelector("#p013CrAddr").textContent = mock.addr;
          paper.querySelector("#p013CrPhone").textContent = mock.phone;
        }
        // ===== Row 2-4 — ยอดเงิน (sql) — fallback mock =====
        if (amt && cust) {
          var cps = Number(amt.cps || 0), cfs = Number(amt.cfs || 0), so = Number(amt.so || 0);
          var chq = Number(amt.chq || 0), soall = Number(amt.soall || 0), rsv = Number(amt.rsv || 0), chqRet = Number(amt.chqReturn || 0);
          var limit = Number(cust.limit || 0);
          // Row 2 วงเงินปัจจุบัน = DEBlimit
          paper.querySelector("#p013CrCurLimit").textContent = money(limit);
          // Row 3 วงเงินอนุมัติ = (CPS+CFS+CHQ+SO) - limit + limit
          paper.querySelector("#p013CrAppLimit").textContent = money(cps + cfs + chq + so - limit + limit);
          // Row 3 วงเงินสะสม = (CPS+CFS+CHQ+SOall) - limit + limit
          paper.querySelector("#p013CrTotLimit").textContent = money(cps + cfs + chq + soall - limit + limit);
          // Row 4
          paper.querySelector("#p013CrSo").textContent = money(cps);
          paper.querySelector("#p013CrInv").textContent = money(cfs);
          paper.querySelector("#p013CrRsv").textContent = money(rsv);
          paper.querySelector("#p013CrDue").textContent = money(chq);
          paper.querySelector("#p013CrChk").textContent = money(chqRet);
        } else {
          paper.querySelector("#p013CrCurLimit").textContent = money(mock.curLimit);
          paper.querySelector("#p013CrAppLimit").textContent = money(mock.appLimit);
          paper.querySelector("#p013CrTotLimit").textContent = money(mock.totLimit);
          paper.querySelector("#p013CrSo").textContent = money(mock.so);
          paper.querySelector("#p013CrInv").textContent = money(mock.inv);
          paper.querySelector("#p013CrRsv").textContent = money(mock.rsv);
          paper.querySelector("#p013CrDue").textContent = money(mock.due);
          paper.querySelector("#p013CrChk").textContent = money(mock.chk);
        }
        // Row 5/6 — Internal Memo = SO.MIHdesc / หมายเหตุ = SO.MIHnotes (fallback mock) — \r\n → <br>
        paper.querySelector("#p013CrMemo").innerHTML = (amt && amt.soDesc) ? lineBreak(amt.soDesc) : esc(mock.memo);
        paper.querySelector("#p013CrNote").innerHTML = (amt && amt.soNotes) ? lineBreak(amt.soNotes) : esc(mock.note);
        // ===== ตาราง 2 — lists (sql) — fallback mock =====
        var listHtml = function (arr) {
          if (!arr || !arr.length) return "&nbsp;";
          return arr.map(function (x) { return "[ " + esc(x.no) + " ] [ " + esc(x.date) + " ]"; }).join("<br>");
        };
        if (lists) {
          paper.querySelector("#p013CrSoAppr").innerHTML = listHtml(lists.soAppr);
          paper.querySelector("#p013CrSoPend").innerHTML = listHtml(lists.soPend);
          paper.querySelector("#p013CrRsvList").innerHTML = listHtml(lists.rsv);
          paper.querySelector("#p013CrCn").innerHTML = listHtml(lists.cn);
        } else {
          paper.querySelector("#p013CrSoAppr").innerHTML = mock.soAppr;
          paper.querySelector("#p013CrSoPend").innerHTML = mock.soPend;
          paper.querySelector("#p013CrRsvList").innerHTML = mock.rsvList;
          paper.querySelector("#p013CrCn").innerHTML = mock.cn;
        }
        // ตาราง 3: รายการหนี้ค้างชำระ — P034 sql — fallback mock
        var arHtml = "";
        var arTotal = 0;
        var arSrc = (arRows && arRows.length) ? arRows : mock.ar;
        arSrc.forEach(function (x) {
          arTotal += Number(x.amount || 0);
          arHtml += "<tr>" +
            '<td class="p013-c">' + esc(x.type) + "</td>" +
            '<td class="p013-c">' + esc(x.no) + "</td>" +
            '<td class="p013-c">' + esc(x.date) + "</td>" +
            '<td class="p013-c">' + esc(x.due) + "</td>" +
            '<td class="p013-c">' + esc(x.credit) + "</td>" +
            '<td class="p013-c">' + (x.status ? esc(x.status) : "&nbsp;") + "</td>" +
            '<td class="r">' + money(x.amount) + "</td>" +
            "</tr>";
        });
        arHtml += '<tr><td colspan="6" class="b">ยอดรวมทั้งสิ้น</td><td class="r b">' + money(arTotal) + "</td></tr>";
        paper.querySelector("#p013ArRows").innerHTML = arHtml;
        // ตาราง 4: รายการเช็ครอผ่าน — sql — fallback mock
        var chHtml = "";
        var chSrc = (chRows && chRows.length) ? chRows : mock.ch;
        chSrc.forEach(function (x) {
          chHtml += "<tr>" +
            '<td class="p013-c">' + esc(x.no) + "</td>" +
            '<td class="p013-c">' + esc(x.cdate) + "</td>" +
            '<td class="p013-c">' + esc(x.bank) + "</td>" +
            '<td class="p013-c">' + esc(x.rdate) + "</td>" +
            '<td class="p013-c">' + esc(x.status) + "</td>" +
            '<td class="p013-c">' + (x.avg !== undefined ? esc(x.avg) : "&nbsp;") + "</td>" +
            '<td class="r">' + money(x.amount) + "</td>" +
            '<td class="p013-c">' + esc(x.nstatus) + "</td>" +
            "</tr>";
        });
        paper.querySelector("#p013ChRows").innerHTML = chHtml;
        // ตาราง 5: รายการสั่งขายปัจจุบัน — header = SO (เลข + ยอด sql) — fallback mock
        var soTitleNo = (amt && amt.soNo) ? amt.soNo : mock.docNo2;
        var soTitleAmt = (amt && amt.soNo) ? Number(amt.so || 0) : 0;
        if (!soTitleAmt) {
          mock.soItems.forEach(function (x) { soTitleAmt += x.amount; });
        }
        paper.querySelector("#p013SoTitle").innerHTML = "รายการสั่งขายปัจจุบัน&nbsp;&nbsp;" + esc(soTitleNo) + "&nbsp;&nbsp;" + money(soTitleAmt);
        var soHtml = "";
        var soSrc = (soRows && soRows.length) ? soRows : mock.soItems;
        soSrc.forEach(function (x) {
          var qty = Number(x.qty || 0);
          soHtml += "<tr>" +
            '<td>' + esc(x.date) + "</td>" +
            '<td>' + esc(x.code) + "</td>" +
            '<td>' + lineBreak(x.desc) + "</td>" +
            '<td class="r">' + (qty % 1 === 0 ? String(qty) : qty) + "</td>" +
            '<td class="p013-c">' + esc(x.unit) + "</td>" +
            '<td class="r">' + money(x.price) + "</td>" +
            '<td class="r">' + money(x.amount) + "</td>" +
            "</tr>";
        });
        paper.querySelector("#p013SoRows").innerHTML = soHtml;
        // ตาราง 6: รายงานการติดตามทวงหนี้ Odoo — sql — ไม่มีข้อมูล = ว่าง
        var odHtml = "";
        if (odooRows) {
          odooRows.forEach(function (x) {
            odHtml += "<tr>" +
              '<td>' + esc(x.no) + "</td>" +
              '<td>' + esc(x.cdate) + "</td>" +
              '<td>' + esc(x.pdate) + "</td>" +
              '<td class="r">' + money(x.amount) + "</td>" +
              '<td>' + lineBreak(x.opinion) + "</td>" +
              "</tr>";
          });
        }
        paper.querySelector("#p013OdooRows").innerHTML = odHtml;
        // ตาราง 6 — ไม่พบ row = ซ่อนทั้งตาราง
        paper.querySelector(".p013-odoo").style.display = (odooRows && odooRows.length) ? "" : "none";
        // footer — ผู้สร้าง + วันที่สร้าง + ครั้งที่ / พิมพ์โดย + machine + วันปัจจุบัน
        var now = new Date();
        var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
        var nowStr = pad(now.getDate()) + "/" + pad(now.getMonth() + 1) + "/" + now.getFullYear() + " " + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
        var ftrL = esc(it.keyUser || "-") + " " + esc(it.keyDate || "-") + " ครั้งที่ " + (Number(it.printN || 0) + 1);
        var ftrR = "พิมพ์โดย " + esc(state.machine || navigator.appName || "-") + " " + nowStr;
        paper.querySelector("#p013RepFtrL").innerHTML = ftrL;
        paper.querySelector("#p013RepFtrR").innerHTML = ftrR;
        // barcode CODE128 — Row 1 คอลั่น 9-11 — ใช้เลขที่ใบสำคัญ row นั้น
        if (window.JsBarcode) {
          try { JsBarcode(paper.querySelector("#barcode"), it.doc || "SCRE6909-2104", { format: "CODE128", width: 1, height: 29, displayValue: false, margin: 0 }); } catch (e) { console.warn("p013 barcode", e); }
        }
        return paper;
      });
    }
    // ===== Mock data (fallback — ยังไม่มี sql) =====
    var mock = {
      docNo: "74000-189",
      form: "CRE-A",
      group: "พันท้ายรวมวัสดุ",
      startDate: "22/11/2564",
      batch: "A",
      docNo2: "SCRE6909-2100",
      addr: "69/9 ม.5 ต.พันท้ายนรสิงห์ อ.เมืองสมุทรสาคร จ.สมุทรสาคร",
      salesman: "S50 TV-ขนิษฐา",
      phone: "034-872434, 099-4299521",
      curLimit: 1000.00,
      appLimit: 19599.00,
      totLimit: 19599.00,
      so: 1785.00,
      inv: 15370.00,
      rsv: 0.00,
      due: 0.00,
      chk: 0.00,
      memo: "ส่งสินค้าวางบิล หยุดทุกวันจันทร์",
      note: "BOVN จิ๊ฟ(17/9/69)",
      soAppr: "[ SCRE6909-1676 ] [ 15/09/2026 ]",
      soPend: "[ SCRE6909-2100 ] [ 18/9/2026 ]",
      rsvList: "&nbsp;",
      cn: "[ 1CNN6811-0031 ] [ 13/11/2025 ]<br>[ CNN6712-0251 ] [ 24/12/2024 ]<br>[ CNN6703-0113 ] [ 20/3/2024 ]",
      ar: [
        { type: "ใบแจ้งหนี้ขาย", no: "IVVN6909-2279", date: "15/09/2569", due: "14/10/2569", credit: "30", status: "", amount: 13910.00 },
        { type: "ใบแจ้งหนี้ขาย", no: "IVVN6909-2282", date: "15/09/2569", due: "14/10/2569", credit: "30", status: "", amount: 1460.00 }
      ],
      ch: [
        { no: "PCA26901-0097", cdate: "19/01/2569", bank: "BAY", rdate: "19/01/2569", status: "ชำระแล้ว", avg: "71", amount: 10712.00, nstatus: "เก็บสดผู้แทน" },
        { no: "PCA26903-0253", cdate: "23/03/2569", bank: "BAY", rdate: "23/03/2569", status: "ชำระแล้ว", avg: "62", amount: 9700.00, nstatus: "เก็บสดผู้แทน" },
        { no: "PCA26905-0124", cdate: "18/05/2569", bank: "BAY", rdate: "18/05/2569", status: "ชำระแล้ว", avg: "57", amount: 15669.00, nstatus: "เก็บสดผู้แทน" },
        { no: "PCA26906-0099", cdate: "15/06/2569", bank: "KBANK", rdate: "15/06/2569", status: "ชำระแล้ว", avg: "74", amount: 950.00, nstatus: "เก็บสดผู้แทน" },
        { no: "PCA26907-0271", cdate: "27/07/2569", bank: "KBANK", rdate: "27/07/2569", status: "ชำระแล้ว", avg: "72", amount: 7730.00, nstatus: "เก็บสดผู้แทน" },
        { no: "PCA26909-0073", cdate: "15/09/2569", bank: "KBANK", rdate: "15/09/2569", status: "ชำระแล้ว", avg: "51", amount: 13157.00, nstatus: "เก็บสดผู้แทน" }
      ],
      soItems: [
        { date: "18/09/2569", code: "10780033", desc: "สายยางใส-1\"(CCP) 2.4mm 100m [25kg/ม้วน]", qty: 1, unit: "Ea", price: 1352.00, amount: 1352.00 },
        { date: "18/09/2569", code: "10780049", desc: "สายยางใส-1 1/2\"(1.5\") (CCP) 2.4mm 50m [20kg/Ea]", qty: 1, unit: "Ea", price: 1092.00, amount: 1092.00 }
      ],
      odoo: [
        { no: "46221", cdate: "20/08/2569", pdate: "18/09/2569", amount: 11276.00, opinion: "2569/09/16 แจ้งยอดทางไลน์ รอลูกค้าโอน<br>2569/09/12 กำลังติดตามยอดบิลเดือน 6 ทยอยโอน" },
        { no: "46392", cdate: "25/08/2569", pdate: "19/09/2569", amount: 9600.00, opinion: "2569/09/16 ประสานผู้แทนแจ้งยอดทางไลน์ รอลูกค้าโอน" }
      ]
    };
    // ===== clone paper — 1 ใบต่อ 1 row — build ทั้งหมดพร้อมกัน =====
    stage.innerHTML = "";
    var jobs = sel.map(function (it) {
      var clone = tpl.content.cloneNode(true);
      var paper = clone.querySelector(".p013-paper");
      stage.appendChild(clone);
      return buildPaper(paper, it);
    });
    await Promise.all(jobs);
    $("#p013PreviewSub").textContent = "เลือกเอกสาร " + intFmt.format(sel.length) + " รายการ";
  }

  function updateScale() {
    var z = state.zoom / 100;
    $$(".p013-paper").forEach(function (paper) {
      var wrap = paper.closest(".p013-paperwrap");
      paper.style.transform = "scale(" + z + ")";
      if (wrap) {
        wrap.style.width = paper.offsetWidth * z + "px";
        wrap.style.height = paper.offsetHeight * z + "px";
      }
    });
    $("#p013ZoomLabel").textContent = state.zoom + "%";
  }

  function fitPreview() {
    var area = $("#p013Area");
    var papers = $$(".p013-paper");
    if (!papers.length) return;
    var aw = area.clientWidth - 90, ah = area.clientHeight - 90;
    if (aw <= 0 || ah <= 0) return;
    var pw = papers[0].offsetWidth, ph = papers[0].offsetHeight;
    if (pw <= 0 || ph <= 0) return;
    var z = Math.min(aw / pw, ah / ph, 1);
    state.zoom = Math.max(25, Math.round(z * 100));
    updateScale();
  }

  async function openPreview() {
    if (Object.keys(state.selected).length === 0) { toast("กรุณาเลือกรายการอย่างน้อย 1 รายการ", false); return; }
    await renderPreview();
    $("#p013Modal").classList.add("show");
    document.body.style.overflow = "hidden";
    // เปิดรายงานที่ 100% (ไม่ fit)
    state.zoom = 100;
    updateScale();
  }

  function closePreview() {
    var bd = $("#p013Modal");
    if (!bd || !bd.classList.contains("show")) return;
    bd.classList.remove("show");
    document.body.style.overflow = "";
  }

  // ===== HTML =====
  function html() {
    var today = todayISO();
    return '<div class="p013">' +
      '<div id="p013TabApproval" class="p013-tabpanel">' +
      '<form class="p013-launcher" id="p013Form">' +
        '<div class="p013-field"><label>วันที่เอกสาร</label>' +
          '<div class="p013-daterange">' +
            '<div class="p013-inputwrap"><input id="p013From" type="date" value="' + today + '"></div>' +
            '<span class="p013-datesep">ถึง</span>' +
            '<div class="p013-inputwrap"><input id="p013To" type="date" value="' + today + '"></div>' +
          "</div>" +
        "</div>" +
        '<div class="p013-field"><label for="p013Creator">ผู้สร้างเอกสาร</label>' +
          '<div class="p013-inputwrap"><input id="p013Creator" type="text" placeholder="ระบุผู้สร้างเอกสาร" autocomplete="off"></div>' +
        "</div>" +
        '<div class="p013-field"><label for="p013Customer">ชื่อลูกหนี้</label>' +
          '<div class="p013-inputwrap"><input id="p013Customer" type="text" placeholder="ระบุรหัสหรือชื่อลูกหนี้" autocomplete="off"></div>' +
        "</div>" +
        '<button class="p013-searchbtn" type="submit">' + I.search + "ค้นหา</button>" +
      "</form>" +
      '<section class="p013-actionbar">' +
        '<div class="p013-selinfo">' +
          '<div class="p013-selicon">' + I.check + "</div>" +
          '<div class="p013-seltext"><strong id="p013SelCount">เลือกแล้ว 0 รายการ</strong><span id="p013SelAmount">ยอดรวมที่เลือก ฿0.00</span></div>' +
        "</div>" +
        '<div class="p013-actionbtns">' +
          '<button class="p013-ghostbtn" id="p013SelAllBtn" type="button">' + I.selectall + "เลือกทั้งหมด</button>" +
          '<button class="p013-ghostbtn" id="p013ClearBtn" type="button">' + I.reset + "ล้างการเลือก</button>" +
          '<button class="p013-printbtn" id="p013PrintBtn" type="button">' + I.print + "พิมพ์ใบอนุมัติวงเงิน</button>" +
        "</div>" +
      "</section>" +
      '<section class="p013-panel">' +
        '<div class="p013-panelhead">' +
          '<div class="p013-panelhd">' +
            '<div class="p013-panelicon">' + I.grid + "</div>" +
            '<div class="p013-paneltitle"><h2>รายการรออนุมัติสั่งขาย</h2><p id="p013Period"></p></div>' +
          "</div>" +
          '<div class="p013-panelacts">' +
            '<span class="p013-badge" id="p013Badge">0 รายการ</span>' +
          "</div>" +
        "</div>" +
        '<div class="p013-twrap" id="p013Twrap">' +
          '<table class="p013-table" id="p013Table">' +
            "<thead><tr>" +
              '<th class="p013-cbcell"><input id="p013SelAll" class="p013-cb" type="checkbox" aria-label="เลือกทั้งหมด"></th>' +
              '<th class="sortable center" data-sort="date">วันที่<span class="p013-sortmark">↕</span></th>' +
              '<th class="sortable" data-sort="doc">เลขที่ใบสำคัญ<span class="p013-sortmark">↕</span></th>' +
              '<th class="sortable" data-sort="code">รหัสลูกหนี้<span class="p013-sortmark">↕</span></th>' +
              '<th class="sortable" data-sort="name">ชื่อลูกหนี้<span class="p013-sortmark">↕</span></th>' +
              '<th class="sortable number" data-sort="amount">ยอดเงิน<span class="p013-sortmark">↕</span></th>' +
              '<th class="sortable center" data-sort="printN">จำนวนพิมพ์<span class="p013-sortmark">↕</span></th>' +
              "<th>หมายเหตุ</th>" +
            "</tr></thead>" +
            '<tbody id="p013Rows"></tbody>' +
          "</table>" +
        "</div>" +
        '<div class="p013-empty" id="p013Empty"><div><div class="p013-emptyicon">' + I.empty + "</div><h3>ไม่พบเอกสารรออนุมัติ</h3><p id=\"p013EmptyText\">ตั้งค่าเงื่อนไขค้นหา แล้วกด ปุ่ม ค้นหา เพื่อโหลดข้อมูล</p></div></div>" +
        '<div class="p013-footer" id="p013Footer">' +
          '<span id="p013FootDesc">แสดง 0 รายการ</span>' +
        "</div>" +
        '<div class="p013-pager" id="p013Pager">' +
          '<button class="p013-pagerbtn" id="p013Prev" type="button" title="หน้าก่อนหน้า">' + I.chevL + "</button>" +
          '<div class="p013-pg-pages" id="p013Pages"></div>' +
          '<button class="p013-pagerbtn" id="p013Next" type="button" title="หน้าถัดไป">' + I.chevR + "</button>" +
        "</div>" +
      "</section>" +
      "</div>" +
      '<div class="p013-modalbd" id="p013Modal">' +
        '<section class="p013-modal">' +
          '<div class="p013-modalhd">' +
            '<div class="p013-modalhdg">' +
              '<div class="p013-modalicon">' + I.doc + "</div>" +
              '<div><h3>ตัวอย่างใบอนุมัติวงเงิน</h3><p id="p013PreviewSub">เลือกเอกสาร 0 รายการ</p></div>' +
            "</div>" +
            '<div class="p013-modalbtns">' +
              '<button class="p013-iconbtn" id="p013ZoomOut" type="button" title="ลดขนาด">' + I.zoomOut + "</button>" +
              '<span class="p013-zoomlabel" id="p013ZoomLabel">100%</span>' +
              '<button class="p013-iconbtn" id="p013ZoomIn" type="button" title="ขยายขนาด">' + I.zoomIn + "</button>" +
              '<button class="p013-iconbtn" id="p013Fit" type="button" title="พอดีหน้าจอ">' + I.fit + "</button>" +
              '<button class="p013-printbtn" id="p013PrintModal" type="button">' + I.print + "พิมพ์เอกสาร</button>" +
              '<button class="p013-iconbtn p013-closebtn" id="p013Close" type="button" title="ปิด (Esc)">' + I.close + "</button>" +
            "</div>" +
          "</div>" +
          '<div class="p013-modalbd-area" id="p013Area">' +
            '<div class="p013-stage" id="p013Stage"></div>' +
            '<span class="p013-zoomtag" id="p013ZoomTag">100%</span>' +
          "</div>" +
          "<template id=\"p013PaperTpl\">" +
            '<div class="p013-paperwrap">' +
              '<article class="p013-paper">' +
                '<div class="p013-body">' +
                  '<table class="p013-credit">' +
                    "<colgroup><col style=\"width:88px\"><col style=\"width:73px\"><col style=\"width:67px\"><col style=\"width:73px\"><col style=\"width:73px\"><col style=\"width:70px\"><col style=\"width:65px\"><col style=\"width:30px\"><col style=\"width:47px\"><col style=\"width:73px\"><col style=\"width:77px\"></colgroup>" +
                    '<tr>' +
                      '<td class="hd">ใบขออนุมัติวงเงิน</td>' +
                      '<td colspan="4" id="p013CrTitle">74000-189&nbsp;&nbsp;(CRE-A) พันท้ายรวมวัสดุ</td>' +
                      '<td class="p013-cr1b">เริ่มซื้อขาย</td>' +
                      '<td id="p013CrStartDate">-</td>' +
                      '<td id="p013CrBatch" class="p013-cr1b">A</td>' +
                      '<td colspan="3" id="p013CrDocNo"><svg id="barcode"></svg></td>' +
                    "</tr>" +
                    '<tr>' +
                      '<td class="lbl">ที่อยู่</td>' +
                      '<td colspan="5" id="p013CrAddr">-</td>' +
                      '<td class="lbl">ผู้แทน</td>' +
                      '<td colspan="2" id="p013CrSalesman">-</td>' +
                      '<td class="lbl">วงเงินปัจจุบัน</td>' +
                      '<td class="r" id="p013CrCurLimit">0.00</td>' +
                    "</tr>" +
                    '<tr>' +
                      '<td class="lbl">เบอร์โทร.</td>' +
                      '<td colspan="5" id="p013CrPhone">-</td>' +
                      '<td class="lbl">วงเงินอนุมัติ</td>' +
                      '<td colspan="2" class="r" id="p013CrAppLimit">0.00</td>' +
                      '<td class="lbl">วงเงินสะสม</td>' +
                      '<td class="r" id="p013CrTotLimit">0.00</td>' +
                    "</tr>" +
                    '<tr>' +
                      '<td class="lbl">ยอด SO</td>' +
                      '<td class="r" id="p013CrSo">0.00</td>' +
                      '<td class="lbl">ยอด INV</td>' +
                      '<td class="r" id="p013CrInv">0.00</td>' +
                      '<td class="lbl">ยอด RSV</td>' +
                      '<td class="r" id="p013CrRsv">0.00</td>' +
                      '<td class="lbl">ยอด Due</td>' +
                      '<td colspan="2" class="r" id="p013CrDue">0.00</td>' +
                      '<td class="lbl">ยอดเช็คคืน</td>' +
                      '<td class="r" id="p013CrChk">0.00</td>' +
                    "</tr>" +
                    '<tr>' +
                      '<td class="lbl">Internal Memo</td>' +
                      '<td colspan="10" id="p013CrMemo">-</td>' +
                    "</tr>" +
                    '<tr>' +
                      '<td class="lbl">หมายเหตุ</td>' +
                      '<td colspan="10" id="p013CrNote">-</td>' +
                    "</tr>" +
                  "</table>" +
                  '<table class="p013-credit p013-crlist">' +
                    "<colgroup><col style=\"width:25%\"><col style=\"width:25%\"><col style=\"width:25%\"><col style=\"width:25%\"></colgroup>" +
                    '<tr>' +
                      '<td class="hd">รายการ SO ที่อนุมัติแล้ว</td>' +
                      '<td class="hd">รายการ SO ที่รออนุมัติ</td>' +
                      '<td class="hd">รายการ RSV</td>' +
                      '<td class="hd">รายการ CN</td>' +
                    "</tr>" +
                    '<tr valign="top">' +
                      '<td id="p013CrSoAppr">-</td>' +
                      '<td id="p013CrSoPend">-</td>' +
                      '<td id="p013CrRsvList">&nbsp;</td>' +
                      '<td id="p013CrCn">-</td>' +
                    "</tr>" +
                  "</table>" +
                  '<table class="p013-credit p013-ar">' +
                    "<colgroup><col style=\"width:100pt\"><col style=\"width:90pt\"><col style=\"width:70pt\"><col style=\"width:90pt\"><col style=\"width:60pt\"><col style=\"width:60pt\"><col style=\"width:80pt\"></colgroup>" +
                    '<tr class="p013-title"><td colspan="7">รายการหนี้ค้างชำระ</td></tr>' +
                    '<tr>' +
                      '<td class="hd p013-c">ประเภท</td>' +
                      '<td class="hd p013-c">เลขที่ใบสำคัญ</td>' +
                      '<td class="hd p013-c">วันที่</td>' +
                      '<td class="hd p013-c">วันครบกำหนด</td>' +
                      '<td class="hd p013-c">เครดิต</td>' +
                      '<td class="hd p013-c">สถานะ</td>' +
                      '<td class="hd p013-c">มูลค่า</td>' +
                    "</tr>" +
                    '<tbody id="p013ArRows"></tbody>' +
                  "</table>" +
                  '<table class="p013-credit p013-ar p013-ch">' +
                    "<colgroup><col style=\"width:80pt\"><col style=\"width:70pt\"><col style=\"width:70pt\"><col style=\"width:70pt\"><col style=\"width:60pt\"><col style=\"width:60pt\"><col style=\"width:80pt\"><col style=\"width:60pt\"></colgroup>" +
                    '<tr class="p013-title"><td colspan="8">รายการเช็ครอผ่าน</td></tr>' +
                    '<tr class="p013-hd">' +
                      '<td class="hd p013-c">หมายเลขเช็ค</td>' +
                      '<td class="hd p013-c">วันที่เช็ค</td>' +
                      '<td class="hd p013-c">ธนาคาร</td>' +
                      '<td class="hd p013-c">วันรับ/ออกเช็ค</td>' +
                      '<td class="hd p013-c">สถานะ</td>' +
                      '<td class="hd p013-c">เฉลี่ย(วัน)</td>' +
                      '<td class="hd p013-c">มูลค่า</td>' +
                      '<td class="hd p013-c">สถานะ</td>' +
                    "</tr>" +
                    '<tbody id="p013ChRows"></tbody>' +
                  "</table>" +
                  '<table class="p013-credit p013-so">' +
                    "<colgroup><col style=\"width:50pt\"><col style=\"width:50pt\"><col style=\"width:200pt\"><col style=\"width:60pt\"><col style=\"width:60pt\"><col style=\"width:60pt\"><col style=\"width:70pt\"></colgroup>" +
                    '<thead>' +
                    '<tr><th colspan="7" id="p013SoTitle">-</th></tr>' +
                    '<tr>' +
                      '<th>วันที่</th>' +
                      '<th>รหัสสินค้า</th>' +
                      '<th>รายละเอียดสินค้า</th>' +
                      '<th>ปริมาณ</th>' +
                      '<th>หน่วยนับ</th>' +
                      '<th>หน่วยละ</th>' +
                      '<th>มูลค่า</th>' +
                    "</tr>" +
                    "</thead>" +
                    '<tbody id="p013SoRows"></tbody>' +
                  "</table>" +
                  '<table class="p013-credit p013-odoo">' +
                    "<colgroup><col style=\"width:50pt\"><col style=\"width:50pt\"><col style=\"width:50pt\"><col style=\"width:55pt\"><col style=\"width:345pt\"></colgroup>" +
                    '<thead>' +
                    '<tr><th colspan="5">รายงานการติดตามทวงหนี้ Odoo</th></tr>' +
                    '<tr>' +
                      '<th>เลขที่</th>' +
                      '<th>วันที่ Case</th>' +
                      '<th>วันที่นัดชำระ</th>' +
                      '<th>ยอดเงิน</th>' +
                      '<th>ความคิดเห็น</th>' +
                    "</tr>" +
                    "</thead>" +
                    '<tbody id="p013OdooRows"></tbody>' +
                  "</table>" +
                  "</div>" +
                  '<div class="p013-spacer"></div>' +
                  '<table class="p013-repftr">' +
                    '<tr>' +
                      '<td id="p013RepFtrL">-</td>' +
                      '<td align="right" id="p013RepFtrR">-</td>' +
                    "</tr>" +
                  "</table>" +
                "</article>" +
              "</div>" +
            "</template>" +
        "</section>" +
      "</div>" +
      '<div class="p013-toast" id="p013Toast">' + I.toast + '<span id="p013ToastMsg"></span></div>' +
    "</div>";
  }

  function bindEvents() {
    $("#p013Form").addEventListener("submit", function (e) { e.preventDefault(); applyFilters(true); });

    $("#p013Rows").addEventListener("change", function (e) {
      var cb = e.target.closest(".p013-cb");
      if (!cb) return;
      state.selected[cb.dataset.doc] = cb.checked;
      renderRows();
    });
    $("#p013SelAll").addEventListener("change", function (e) {
      var v = e.target.checked;
      state.filtered.forEach(function (it) { state.selected[it.doc] = v; });
      renderRows();
    });
    $("#p013SelAllBtn").addEventListener("click", function () {
      state.filtered.forEach(function (it) { state.selected[it.doc] = true; });
      renderRows();
    });
    $("#p013ClearBtn").addEventListener("click", function () {
      state.selected = {};
      renderRows();
      toast("ล้างการเลือกแล้ว");
    });

    $$("#p013Table th.sortable").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.dataset.sort;
        if (state.sortField === f) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortField = f; state.sortDir = "asc"; }
        state.page = 1;
        renderRows();
      });
    });

    $("#p013Prev").addEventListener("click", function () { if (state.page > 1) gotoPage(state.page - 1); });
    $("#p013Next").addEventListener("click", function () { gotoPage(state.page + 1); });
    $("#p013Pages").addEventListener("click", function (e) {
      var b = e.target.closest("[data-p013-page]");
      if (b) gotoPage(parseInt(b.dataset.p013Page, 10));
    });

    $("#p013PrintBtn").addEventListener("click", function () {
      if (Object.keys(state.selected).length === 0) { toast("กรุณาเลือกรายการอย่างน้อย 1 รายการ", false); return; }
      openPreview();
    });
    $("#p013Close").addEventListener("click", closePreview);
    $("#p013Modal").addEventListener("click", function (e) { if (e.target === e.currentTarget) closePreview(); });
    $("#p013ZoomOut").addEventListener("click", function () { state.zoom = Math.max(25, state.zoom - 10); updateScale(); $("#p013ZoomTag").textContent = state.zoom + "%"; });
    $("#p013ZoomIn").addEventListener("click", function () { state.zoom = Math.min(150, state.zoom + 10); updateScale(); $("#p013ZoomTag").textContent = state.zoom + "%"; });
    $("#p013Fit").addEventListener("click", function () { fitPreview(); $("#p013ZoomTag").textContent = state.zoom + "%"; });
    $("#p013PrintModal").addEventListener("click", function () {
      var sel = selectedItems();
      if (!sel.length) { window.print(); return; }
      var docs = sel.map(function (it) { return it.doc; });
      fetch("api/p013_print.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: MAC5_CONNECTION_ID, docs: docs })
      })
        .then(function (x) { return x.json(); })
        .then(function (r) {
          if (r.ok && r.printN) {
            state.filtered.forEach(function (it) {
              if (Object.prototype.hasOwnProperty.call(r.printN, it.doc)) it.printN = r.printN[it.doc];
            });
            renderRows();
          }
          window.print();
        })
        .catch(function (e) { console.warn("p013 print", e); window.print(); });
    });

    if (!state.escBound) {
      state.escBound = true;
      document.addEventListener("keydown", function (e) {
        if (e.key !== "Escape") return;
        var bd = $("#p013Modal");
        if (bd && bd.classList.contains("show")) closePreview();
      });
    }
    window.addEventListener("resize", function () {
      var bd = $("#p013Modal");
      if (bd && bd.classList.contains("show")) fitPreview();
    });
  }

  window.P013Approval = {
    mount: function (root) {
      root.innerHTML = html();
      // inject CSS once
      if (!document.getElementById("p013css")) {
        var st = document.createElement("style");
        st.id = "p013css";
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      bindEvents();
      renderRows();
    }
  };
})();
