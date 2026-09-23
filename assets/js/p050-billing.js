/* P050 — ใบวางบิล (real API — api/p050_search.php) */
(function () {
  "use strict";

  var CONN_ID = "c1788406814359";
  var PAGE_SIZE = 15;

  var CSS = `
.p050{color:#172033;display:flex;flex-direction:column;gap:12px}
.p050 *{box-sizing:border-box}
.p050 svg{display:block;width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

/* ===== Filter bar ===== */
.p050-filterbar{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:16px;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 5px 18px rgba(15,23,42,.04)}
.p050-field label{display:block;margin-bottom:6px;color:#64748b;font-size:11px;font-weight:600}
.p050-daterange{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}
.p050-datesep{color:#64748b;font-size:12px;font-weight:600}
.p050-inputwrap{position:relative}
.p050-selectarrow{position:absolute;top:50%;right:12px;z-index:1;width:16px;height:16px;color:#94a3b8;transform:translateY(-50%);pointer-events:none}
.p050-field input,.p050-field select{width:100%;height:44px;padding:0 12px;color:#172033;border:1px solid #e2e8f0;border-radius:11px;outline:none;background:#fff;transition:.18s ease}
.p050-field select{cursor:pointer;appearance:none;padding-right:38px}
.p050-field input:focus,.p050-field select:focus{border-color:#60a5fa;box-shadow:0 0 0 4px rgba(96,165,250,.14)}
.p050-searchbtn{display:inline-flex;height:44px;align-self:end;align-items:center;justify-content:center;gap:8px;padding:0 21px;color:#fff;border:0;border-radius:11px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);box-shadow:0 8px 18px rgba(37,99,235,.22);font-weight:700;white-space:nowrap;transition:.18s ease;justify-self:end}
.p050-searchbtn:hover{filter:brightness(1.06);transform:translateY(-1px)}
.p050-searchbtn svg{width:18px;height:18px}

/* ===== Action bar ===== */
.p050-actionbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 4px 12px rgba(15,23,42,.04)}
.p050-selinfo{display:flex;min-width:0;align-items:center;gap:10px}
.p050-selicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#2563eb;border-radius:11px;background:#eff6ff}
.p050-selicon svg{width:18px;height:18px}
.p050-seltext{min-width:0}
.p050-seltext strong{display:block;font-size:13px}
.p050-seltext span{display:block;color:#64748b;font-size:10px}
.p050-actionbtns{display:flex;flex:0 0 auto;align-items:center;gap:9px}
.p050-radiobox{display:flex;align-items:center;gap:9px;padding:8px 12px;border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc}
.p050-radioopt{display:flex;align-items:center;gap:5px;color:#334155;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap}
.p050-radioopt input{width:13px;height:13px;accent-color:#059669}
.p050-ghostbtn{display:inline-flex;height:38px;align-items:center;gap:6px;padding:0 13px;color:#2563eb;border:1px solid #bfdbfe;border-radius:10px;background:#eff6ff;font-size:12px;font-weight:700;transition:.18s ease;white-space:nowrap}
.p050-ghostbtn:hover{background:#dbeafe}
.p050-printbtn{display:inline-flex;height:38px;align-items:center;gap:6px;padding:0 15px;color:#fff;border:0;border-radius:10px;background:#059669;font-size:12px;font-weight:700;transition:.18s ease;white-space:nowrap}
.p050-printbtn:hover{background:#047857;transform:translateY(-1px)}
.p050-ghostbtn svg,.p050-printbtn svg{width:16px;height:16px}

/* ===== Panel ===== */
.p050-panel{display:flex;min-height:430px;flex:1;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0;border-radius:16px;background:#fff;box-shadow:0 12px 32px rgba(15,23,42,.08)}
.p050-panelhead{display:flex;min-height:64px;align-items:center;justify-content:space-between;gap:12px;padding:11px 15px;border-bottom:1px solid #e2e8f0}
.p050-panelheading{display:flex;min-width:0;align-items:center;gap:10px}
.p050-panelicon{display:grid;width:38px;height:38px;flex:0 0 auto;place-items:center;color:#1d4ed8;border-radius:11px;background:#dbeafe}
.p050-panelicon svg{width:18px;height:18px}
.p050-paneltitle h2{margin:0;font-size:15px}
.p050-paneltitle p{margin:2px 0 0;color:#64748b;font-size:10px}
.p050-badge{flex:0 0 auto;padding:6px 12px;color:#1d4ed8;border-radius:999px;background:#eff6ff;font-size:11px;font-weight:700;white-space:nowrap}
.p050-tablewrap{flex:1;overflow:auto}
.p050-table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed}
.p050-table th{position:sticky;top:0;z-index:2;color:#64748b;border-bottom:1px solid #e2e8f0;background:#f8fafc;padding:10px 10px;text-align:left;font-size:10px;font-weight:700;white-space:nowrap}
.p050-table th.sortable{cursor:pointer;user-select:none}
.p050-table th.sortable:hover{color:#2563eb}
.p050-sortmark{color:#94a3b8;font-size:10px}
.p050-table td{border-bottom:1px solid #eef2f7;padding:10px;font-size:12px}
.p050-table tbody tr:nth-child(even){background:#fafcff}
.p050-table tbody tr:hover{background:#eff6ff}
.p050-table tbody tr.selected{background:#dbeafe}
.p050-cbcell{width:38px}
.p050-cb{width:15px;height:15px;cursor:pointer;accent-color:#2563eb}
.p050-docno{font-weight:700;color:#1d4ed8}
.p050-amount{font-variant-numeric:tabular-nums;font-weight:700}
.p050-note{color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.p050-table .number{text-align:right}
.p050-table .center{text-align:center}
.p050-printstate{display:inline-grid;min-width:24px;height:22px;place-items:center;border-radius:7px;font-size:11px;font-weight:700}
.p050-printstate.yes{color:#047857;background:#d1fae5}
.p050-printstate.no{color:#94a3b8;background:#f1f5f9}
.p050-tablefoot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 15px;border-top:1px solid #e2e8f0}
.p050-tablefoot span{color:#64748b;font-size:11px}
.p050-totals{display:flex;gap:18px}
.p050-total span{display:block;color:#64748b;font-size:9px}
.p050-total strong{font-size:13px;font-variant-numeric:tabular-nums}

/* ===== Pager ===== */
.p050-pager{display:none;align-items:center;gap:6px;padding:9px 12px;border-top:1px solid #e2e8f0;background:#fff}
.p050-pager.show{display:flex}
.p050-pagerbtn{display:grid;width:30px;height:30px;place-items:center;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;background:#fff;transition:.15s}
.p050-pagerbtn:hover:not(:disabled){color:#2563eb;border-color:#93c5fd;background:#eff6ff}
.p050-pagerbtn:disabled{opacity:.4;cursor:default}
.p050-pagerbtn svg{width:16px;height:16px}
.p050-pg-pages{display:flex;align-items:center;gap:4px}
.p050-pg-num{min-width:30px;height:30px;padding:0 6px;color:#64748b;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:11px;font-weight:600;transition:.15s;cursor:pointer}
.p050-pg-num:hover:not(.active){color:#2563eb;border-color:#93c5fd;background:#eff6ff}
.p050-pg-num.active{color:#fff;border-color:#2563eb;background:#2563eb}
.p050-pg-num.ellipsis{border:0;background:none;cursor:default}
.p050-pg-info{margin-left:auto;color:#64748b;font-size:11px;white-space:nowrap}

/* ===== Empty ===== */
.p050-empty{display:none;min-height:300px;flex:1;align-items:center;justify-content:center;padding:30px;color:#64748b;text-align:center}
.p050-empty.show{display:flex}
.p050-emptyicon{display:grid;width:58px;height:58px;place-items:center;margin:0 auto 11px;color:#94a3b8;border-radius:18px;background:#f1f5f9}
.p050-emptyicon svg{width:26px;height:26px}
.p050-empty h3{color:#172033;font-size:15px;margin:0}
.p050-empty p{margin-top:4px;font-size:11px}

/* ===== Preview modal ===== */
.p050-modalbd{position:fixed;inset:0;z-index:1200;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.55)}
.p050-modalbd.show{display:flex}
.p050-modal{display:flex;width:min(1080px,100%);height:94vh;flex-direction:column;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.35)}
.p050-modalhead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;border-bottom:1px solid #e2e8f0}
.p050-modalhead h2{margin:0;font-size:15px}
.p050-modalhead p{margin:2px 0 0;color:#64748b;font-size:11px}
.p050-modalbtns{display:flex;align-items:center;gap:7px}
.p050-iconbtn{display:grid;width:34px;height:34px;place-items:center;color:#475569;border:1px solid #e2e8f0;border-radius:9px;background:#fff;transition:.15s}
.p050-iconbtn:disabled{opacity:.35;pointer-events:none}
.p050-iconbtn:hover{color:#2563eb;border-color:#93c5fd;background:#eff6ff}
.p050-iconbtn svg{width:16px;height:16px}
.p050-zoomlabel{min-width:44px;color:#64748b;font-size:11px;font-weight:700;text-align:center}
.p050-closebtn{color:#dc2626}
.p050-closebtn:hover{color:#fff;border-color:#dc2626;background:#dc2626}
.p050-previewarea{flex:1;overflow:auto;padding:24px;background:#cbd5e1}
.p050-paperwrap{margin:0 auto}
.p050-paper{position:relative;width:794px;min-height:1123px;padding:34px 40px;background:#fff;box-shadow:0 12px 40px rgba(15,23,42,.25);transform-origin:top left}
.p050-paperhead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding-bottom:12px;border-bottom:2px solid #0f172a}
.p050-company{font-size:15px;font-weight:800}
.p050-company span{display:block;margin-top:2px;color:#475569;font-size:10px;font-weight:400}
.p050-doctype{text-align:right}
.p050-doctype h3{margin:0;font-size:17px}
.p050-doctype p{margin:3px 0 0;color:#475569;font-size:10px}
.p050-papermeta{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:12px 0;border-bottom:1px solid #e2e8f0}
.p050-papermeta span{display:block;color:#64748b;font-size:9px}
.p050-papermeta strong{font-size:11px}
.p050-papertable{width:100%;border-collapse:collapse;table-layout:fixed}
.p050-papertable th{padding:8px 6px;border:1px solid #94a3b8;background:#f1f5f9;font-size:10px}
.p050-papertable td{padding:7px 6px;border:1px solid #cbd5e1;font-size:10px}
.p050-papertable .number{text-align:right;font-variant-numeric:tabular-nums}
.p050-paperfoot{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding-top:12px}
.p050-papersum{min-width:240px}
.p050-papersum div{display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:11px}
.p050-papersum .grand{font-weight:800;background:#e2e8f0}
.p050-papersign{display:grid;grid-template-columns:repeat(2,140px);gap:18px}
.p050-signbox{height:56px;padding-top:8px;border-top:1px solid #0f172a;color:#475569;font-size:9px;text-align:center}

/* ===== Billing page (ใบวางบิล) ===== */
.p050-paperwrap{display:flex;flex-direction:column;gap:24px}
.p050-bp{width:816px;min-height:520px;padding:12px 18px;border:1px solid #94a3b8}
.p050-bp-head{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 12px 10px;position:relative}
.p050-bp-logo{font-size:20px;font-weight:800;letter-spacing:1px;text-align:center}
.p050-bp-title{font-size:18px;font-weight:800;text-align:center}
.p050-bp-checked{position:absolute;top:8px;right:12px;padding:4px 12px;font-size:32px;font-weight:800;color:#dc2626}
.p050-bp-info{width:100%;border-collapse:collapse;table-layout:fixed;margin:8px 0}
.p050-bp-info td{padding:5px 8px;font-size:12px;vertical-align:top;white-space:nowrap}
.p050-bp-info .lbl{color:#475569;font-weight:700}
.p050-rp-head{width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 8px}
.p050-rp-head th{padding:6px 8px;border:none;font-size:20px;font-weight:800;background:none;text-align:center}
.p050-rp-head td{padding:5px 8px;border:none;font-size:12px;vertical-align:top;white-space:nowrap}
.p050-rp-head tr{height:50px}
.p050-rp-head tr:nth-child(n+3){height:40px}
.p050-rp-head tr:nth-child(5){height:50px}
.p050-rp-head tr:nth-child(6){height:30px}
.p050-rp-head tr:nth-child(6) td{vertical-align:bottom}
.p050-rp-head tr:nth-child(2) td{vertical-align:middle}
.p050-rp-head tr:first-child th{border-bottom:1px solid #000}
.p050-rp-head .p050-rp-lbl{font-weight:700}
.p050-rp-head .p050-rp-wrap{white-space:normal;word-break:break-word}
.p050-rp-head .p050-rp-doctype{font-size:18px;font-weight:800;text-align:center}
/* ===== Receipt A4 (ใบเสร็จรับเงิน — 210×297mm margin 15mm) ===== */
.p050-rcp{width:794px;min-height:1123px;padding:56.69px;border:1px solid #94a3b8;page-break-after:always}
.p050-rcp:last-child{page-break-after:auto}
.p050-rcp-table{border-collapse:collapse;width:100%;font-family:Tahoma,Arial,sans-serif;font-size:13px}
.p050-rcp-table td,.p050-rcp-table th{border:1px solid #000;padding:2px 4px;vertical-align:top}
.p050-rcp-table th{text-align:center;font-weight:700}
.p050-rcp-table .r{text-align:right}
.p050-rcp-table .c{text-align:center}
.p050-rcp-table .mid{vertical-align:middle}
.p050-rcp-table .p050-rcp-cond{border-left:none;border-bottom:none;font-size:11px}
.p050-rcp-table tr:nth-child(2) td{padding-top:10px}
/* ===== Receipt cheque table (9 คอลั่น) ===== */
.p050-rcp-chq{border-collapse:collapse;width:100%;font-family:Tahoma,Arial,sans-serif;font-size:11px;margin-top:0}
.p050-rcp-chq td{border:none;padding:3px;vertical-align:top}
.p050-rcp-chq td.p050-rcp-b{border:1px solid #000;font-size:12px}
.p050-rcp-chq .r{text-align:right}
.p050-rcp-chq .u{display:inline-block;height:10px;border-bottom:1px solid #000;vertical-align:bottom}
.p050-rcp-chq .u1{width:calc(100% - 78px)}
.p050-rcp-chq .u2{width:calc(100% - 62px)}
.p050-rcp-chq .u3{width:calc(100% - 52px)}
/* ===== Receipt amount-in-words table (4) + signatures ===== */
.p050-rcp-wd{border-collapse:collapse;width:100%;font-family:Tahoma,Arial,sans-serif;font-size:13px;margin-top:30px}
.p050-rcp-wd td{border:1px solid #000;padding:2px 4px;vertical-align:top}
.p050-rcp-wd tr td:nth-child(2){vertical-align:middle}
.p050-rcp-wd tr td:nth-child(1),.p050-rcp-wd tr td:nth-child(3){border:none}
.p050-rcp-wd .c{text-align:center}
.p050-rcp-sign{display:grid;grid-template-columns:repeat(2,160px);justify-content:space-between;padding:0 100px;margin-top:100px}
.p050-rcp-sign .p050-signbox{font-size:12px}
.p050-bp-table{width:100%;border-collapse:collapse;table-layout:fixed}
.p050-bp-table th{padding:8px 6px;border:1px solid #94a3b8;background:#f1f5f9;font-size:12px}
.p050-bp-table td{padding:7px 6px;border:1px solid #cbd5e1;font-size:12px}
.p050-bp-table .number{text-align:right;font-variant-numeric:tabular-nums}
.p050-bp-table .center{text-align:center}
.p050-bp-inv{height:80px;vertical-align:top}
.p050-bp-total td{font-weight:700;border:none}
.p050-bp-total td.p050-bp-thai{border:1px solid #cbd5e1;text-align:center}
.p050-bp-total td.p050-bp-amt{border-left:1px solid #cbd5e1;border-right:1px solid #cbd5e1;border-bottom:1px solid #cbd5e1}
.p050-bp-due{margin:6px 0 12px;font-size:12px;font-weight:700;text-align:right}
.p050-bp-note{margin:6px 0;font-size:12px;color:#475569}
.p050-bp-blank{height:30px}
.p050-bp-sign{display:grid;grid-template-columns:repeat(2,160px);justify-content:space-between;padding:0 100px}
.p050-bp-sign .p050-signbox{font-size:12px}

/* ===== Toast ===== */
.p050-toast{position:fixed;bottom:18px;left:50%;z-index:1300;display:flex;align-items:center;gap:8px;padding:10px 16px;color:#fff;border-radius:11px;background:#16a34a;box-shadow:0 12px 30px rgba(15,23,42,.3);font-size:12px;font-weight:600;transform:translate(-50%,80px);opacity:0;transition:.25s ease;pointer-events:none}
.p050-toast.show{transform:translate(-50%,0);opacity:1}
.p050-toast svg{width:16px;height:16px}
.p050-toastmsg{min-width:0}

/* ===== Print ===== */
.p050-bp{page-break-after:always}
.p050-bp:last-child{page-break-after:auto}
@media print{
  body *{visibility:hidden}
  .p050-modalbd,.p050-modalbd *{visibility:visible}
  .p050-modalbd{position:absolute;inset:0;display:block;padding:0;background:#fff}
  .p050-modal{width:100%;max-height:none;overflow:visible;border-radius:0;box-shadow:none}
  .p050-modalhead,.p050-modalbtns{display:none!important}
  .p050-previewarea{display:block;overflow:visible;padding:0;background:#fff}
  .p050-paperwrap{margin:0;display:block;gap:0}
  .p050-paper{width:100%;min-height:0;padding:0;box-shadow:none;transform:none!important}
}
@media (max-width:1450px){
  .p050-filterbar{grid-template-columns:repeat(3,minmax(190px,1fr))}
}
`;

  var I = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    selectAll: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M9 11l3 3 4-5"></path></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    table: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3z"></path><path d="M3 9h18M9 3v18"></path></svg>',
    empty: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35M8 11h6"></path></svg>',
    toast: '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>',
    arrow: '<svg class="p050-selectarrow" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg>',
    chevL: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"></path></svg>',
    chevR: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"></path></svg>',
    zoomIn: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M8 11h6M11 8v6M21 21l-4.35-4.35"></path></svg>',
    zoomOut: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M8 11h6M21 21l-4.35-4.35"></path></svg>',
    fit: '<svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M16 3h3a2 2 0 0 1 2 2v3"></path><path d="M8 21H5a2 2 0 0 1-2-2v-3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"></path></svg>'
  };

  var I2 = null;

  var PREFIXES = ["IVN", "IVV", "FAN", "AGN", "FAV", "AGV", "CIV", "IVX", "IVF", "ICN", "IVVN", "IVV7", "DSVN", "AGVN", "DSV7", "AGV7", "IVVX", "IVVF", "ICVN"];
  var STATUSES = [
    { id: "5", text: "5-ด่วน - BKK" },
    { id: "6", text: "6-ลูกค้ารับเอง" },
    { id: "17", text: "17-ติดท้ายรถ" },
    { id: "22", text: "22-VAT" },
    { id: "23", text: "23-ค่าขนส่ง" },
    { id: "24", text: "24-รายได้อื่น" },
    { id: "34", text: "34-Pack - ปกติ BKK" },
    { id: "35", text: "35-Pack - ด่วน BKK" },
    { id: "44", text: "44-INV - ปกติ BKK" },
    { id: "60", text: "60-ADS" },
    { id: "65", text: "65-WH" },
    { id: "70", text: "70-LOG" }
  ];

  var moneyFmt = new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var intFmt = new Intl.NumberFormat("th-TH");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(v) { return moneyFmt.format(Number(v || 0)); }
  function fmtDate(v) {
    if (!v) return "-";
    var p = v.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function mount(root) {
    if (!root) return;

    var state = {
      rows: [],
      total: 0,
      page: 1,
      selected: {},
      sortField: "no",
      sortDir: "asc",
      zoom: 0.72,
      toastTimer: null,
      escBound: false,
      loading: false,
      billPages: [],
      billIdx: 0
    };

    function $(sel) { return root.querySelector(sel); }
    function $$(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

    function printType() {
      var r = $('input[name="p050PrintType"]:checked');
      return r ? r.value : "receipt";
    }
    function printTypeName() { return printType() === "billing" ? "ใบวางบิล" : "ใบเสร็จรับเงิน"; }

    function toast(msg, ok) {
      var t = $(".p050-toast");
      $(".p050-toastmsg").textContent = msg;
      t.style.background = ok === false ? "#dc2626" : "#16a34a";
      clearTimeout(state.toastTimer);
      t.classList.add("show");
      state.toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
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

    function selectedInvoices() {
      return state.rows.filter(function (i) { return state.selected[i.no]; });
    }

    function updateSelectionSummary() {
      var sel = selectedInvoices();
      var amt = sel.reduce(function (s, i) { return s + i.amount; }, 0);
      $("#p050SelCount").textContent = "เลือกแล้ว " + sel.length + " รายการ";
      $("#p050SelAmount").textContent = "฿" + money(amt);
      $("#p050DocType").textContent = "ประเภทเอกสาร: " + printTypeName();
      var all = state.rows.length > 0 && state.rows.every(function (i) { return state.selected[i.no]; });
      var some = state.rows.some(function (i) { return state.selected[i.no]; });
      var sa = $("#p050SelectAll");
      sa.checked = all;
      sa.indeterminate = !all && some;
    }

    function renderPager() {
      var pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
      var pager = $("#p050Pager");
      pager.classList.toggle("show", pages > 1);
      if (pages <= 1) return;
      var cur = state.page;
      var nums = [];
      function push(n) { nums.push(n); }
      push(1);
      var lo = Math.max(2, cur - 1), hi = Math.min(pages - 1, cur + 1);
      if (lo > 2) push("…");
      for (var n = lo; n <= hi; n++) push(n);
      if (hi < pages - 1) push("…");
      if (pages > 1) push(pages);
      $("#p050Pages").innerHTML = nums.map(function (n) {
        if (n === "…") return '<span class="p050-pg-num ellipsis">…</span>';
        return '<button class="p050-pg-num' + (n === cur ? " active" : "") + '" type="button" data-p050-page="' + n + '">' + n + "</button>";
      }).join("");
      $("#p050Prev").disabled = cur <= 1;
      $("#p050Next").disabled = cur >= pages;
      $("#p050PgInfo").textContent = "หน้า " + cur + " / " + pages + " — " + intFmt.format(state.total) + " รายการ";
    }

    function renderRows() {
      var items = sortItems(state.rows);
      var tbody = $("#p050Rows");
      tbody.innerHTML = "";
      $("#p050Badge").textContent = intFmt.format(state.total) + " รายการ";
      var start = (state.page - 1) * PAGE_SIZE;
      $("#p050FootDesc").textContent = "แสดง " + items.length + " ใน " + intFmt.format(state.total) + " รายการ (หน้า " + state.page + ")";
      $("#p050FootAmount").textContent = "฿" + money(items.reduce(function (s, i) { return s + i.amount; }, 0));

      var wrap = $(".p050-tablewrap");
      var foot = $(".p050-tablefoot");
      var empty = $(".p050-empty");
      if (!items.length) {
        wrap.style.display = "none";
        foot.style.display = "none";
        empty.classList.add("show");
        updateSelectionSummary();
        renderPager();
        return;
      }
      wrap.style.display = "block";
      foot.style.display = "flex";
      empty.classList.remove("show");

      items.forEach(function (item) {
        var tr = document.createElement("tr");
        if (state.selected[item.no]) tr.classList.add("selected");
        tr.innerHTML =
          '<td class="p050-cbcell"><input class="p050-cb" type="checkbox" data-doc="' + esc(item.no) + '"' + (state.selected[item.no] ? " checked" : "") + ' aria-label="เลือก ' + esc(item.no) + '"></td>' +
          '<td class="p050-docno">' + esc(item.no) + '</td>' +
          '<td class="p050-custcode">' + esc(item.customerCode) + '</td>' +
          '<td title="' + esc(item.customerName) + '">' + esc(item.customerName) + '</td>' +
          '<td>' + esc(item.province) + '</td>' +
          '<td class="number p050-amount">' + money(item.amount) + '</td>' +
          '<td class="p050-note" title="' + esc(item.note) + '">' + esc(item.note) + '</td>' +
          '<td class="center"><span class="p050-printstate ' + (item.cntBill > 0 ? "yes" : "no") + '">' + item.cntBill + '</span></td>' +
          '<td class="center"><span class="p050-printstate ' + (item.cntReceipt > 0 ? "yes" : "no") + '">' + item.cntReceipt + '</span></td>';
        tbody.appendChild(tr);
      });
      updateSelectionSummary();
      renderPager();
    }

    function readFilters() {
      return {
        connectionId: CONN_ID,
        from: $("#p050From").value,
        to: $("#p050To").value,
        creator: $("#p050Creator").value.trim(),
        dept: $("#p050Dept").value.trim(),
        prefix: $("#p050Prefix").value,
        status: $("#p050Status").value,
        page: state.page,
        perPage: PAGE_SIZE
      };
    }

    function applyFilters(withMsg) {
      var f = readFilters();
      if (f.from && f.to && f.from > f.to) { toast("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด", false); return; }
      state.page = 1;
      loadPage(f);
      $("#p050Period").textContent = "ช่วงวันที่ " + fmtDate(f.from) + " ถึง " + fmtDate(f.to);
      if (withMsg) state._msgAfter = true;
    }

    function loadPage(f) {
      if (state.loading) return;
      state.loading = true;
      fetch("api/p050_search.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f)
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          state.loading = false;
          if (!d.ok) { toast(d.error || "ค้นหาไม่สำเร็จ", false); state.rows = []; state.total = 0; renderRows(); return; }
          state.rows = d.rows || [];
          state.total = d.total || 0;
          state.page = d.page || 1;
          renderRows();
          if (state._msgAfter) {
            state._msgAfter = false;
            if (state.total === 0) toast("⚠ ไม่พบข้อมูล", false);
            else toast("พบข้อมูล " + intFmt.format(state.total) + " รายการ");
          }
        })
        .catch(function (e) {
          state.loading = false;
          toast("เชื่อมต่อไม่สำเร็จ: " + e.message, false);
        });
    }

    function gotoPage(p) {
      var pages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
      if (p < 1 || p > pages || p === state.page) return;
      state.page = p;
      loadPage(readFilters());
      $(".p050-tablewrap").scrollTop = 0;
    }

    function renderPreview() {
      var sel = selectedInvoices();
      var wrap = $("#p050PaperWrap");
      $("#p050ModalSub").textContent = "เลือกเอกสาร " + sel.length + " รายการ";
      if (printType() === "billing") {
        // ใบวางบิล — 1 หน้า/ใบ — fetch p050_billing.php ต่อใบ — โชว์ 1 หน้า/ครั้ง
        $("#p050ModalTitle").textContent = "ตัวอย่างใบวางบิล";
        state.billPages = [];
        state.billIdx = 0;
        var jobs = sel.map(function (i) {
          return fetch("api/p050_billing.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionId: CONN_ID, vnos: i.no })
          }).then(function (r) { return r.json(); });
        });
        Promise.all(jobs).then(function (results) {
          var pages = [];
          results.forEach(function (d, n) {
            if (!d.ok) { toast("โหลด " + sel[n].no + " ไม่สำเร็จ: " + (d.error || ""), false); return; }
            pages.push(renderBillingPage(d.row));
          });
          if (!pages.length) { toast("ไม่พบข้อมูลใบวางบิล", false); return; }
          state.billPages = pages;
          state.billIdx = 0;
          showBillPage();
        }).catch(function (e) { toast("โหลดข้อมูลไม่สำเร็จ: " + e.message, false); });
        return;
      }
      // ใบเสร็จรับเงิน — 1 หน้า/ใบ — fetch p050_billing.php ต่อใบ — โชว์ 1 หน้า/ครั้ง
      $("#p050ModalTitle").textContent = "ตัวอย่างใบเสร็จรับเงิน";
      state.billPages = [];
      state.billIdx = 0;
      var jobsR = sel.map(function (i) {
        return fetch("api/p050_billing.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId: CONN_ID, vnos: i.no })
        }).then(function (r) { return r.json(); });
      });
      Promise.all(jobsR).then(function (results) {
        var pages = [];
        results.forEach(function (d, n) {
          if (!d.ok) { toast("โหลด " + sel[n].no + " ไม่สำเร็จ: " + (d.error || ""), false); return; }
          pages.push(renderReceiptPage(d.row));
        });
        if (!pages.length) { toast("ไม่พบข้อมูลใบเสร็จรับเงิน", false); return; }
        state.billPages = pages;
        state.billIdx = 0;
        showBillPage();
      }).catch(function (e) { toast("โหลดข้อมูลไม่สำเร็จ: " + e.message, false); });
    }

    function thaiBaht(n) {
      var d = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
      function small(x) {
        if (x < 10) return d[x];
        if (x < 20) return x === 10 ? "สิบ" : "สิบ" + d[x - 10];
        if (x < 30) return "ยี่สิบ" + d[x - 20];
        return d[Math.floor(x / 10)] + "สิบ" + d[x % 10];
      }
      function part(x) {
        var s = "";
        var h = Math.floor(x / 100), r = x % 100;
        if (h) s += d[h] + "ร้อย";
        if (r) s += small(r);
        return s;
      }
      function num(x) {
        if (x === 0) return "";
        var s = "";
        var man = Math.floor(x / 1000000);
        if (man) s += part(man) + "ล้าน";
        x = x % 1000000;
        var saen = Math.floor(x / 100000);
        if (saen) { s += d[saen] + "แสน"; x = x % 100000; }
        var wan = Math.floor(x / 10000);
        if (wan) {
          s += (wan < 10 ? d[wan] : small(wan)) + "หมื่น";
          x = x % 10000;
          if (x > 0 && x < 1000) s += "สิบ";
        }
        var pan = Math.floor(x / 1000);
        if (pan) { s += d[pan] + "พัน"; x = x % 1000; }
        if (x) s += part(x);
        return s;
      }
      var intPart = Math.floor(n), sat = Math.round((n - intPart) * 100);
      if (intPart === 0 && sat === 0) return "สตังกลมกลม";
      var s = intPart ? num(intPart) + "บาท" : "";
      if (sat) s += (intPart ? "" : "สตัง") + part(sat) + "สตัง";
      return s + "ถ้วน";
    }

    function renderBillingPage(r) {
      var addr = [r.add1, r.add2, r.add3].filter(function (x) { return x; }).join(" ");
      return '<article class="p050-paper p050-bp">' +
        '<div class="p050-bp-head">' +
          '<div class="p050-bp-checked">ตรวจแล้ว</div>' +
          '<div class="p050-bp-logo">MCIT</div>' +
          '<div class="p050-bp-title">ใบวางบิล (BILLING)</div>' +
        "</div>" +
        '<table class="p050-bp-info">' +
          '<colgroup><col style="width:508px"><col style="width:120px"><col style="width:150px"></colgroup>' +
          "<tbody>" +
          "<tr><td><span class=\"lbl\">ชื่อ :</span> " + esc(r.code) + " " + esc(r.nameE) + " " + esc(r.contactT) + "</td><td><span class=\"lbl\">No./เลขที่</span></td><td>" + esc(r.vnos) + "</td></tr>" +
          "<tr><td rowspan=\"2\"><span class=\"lbl\">ที่อยู่ :</span> " + esc(addr) + "</td><td><span class=\"lbl\">Date/วันที่</span></td><td>" + esc(r.date) + "</td></tr>" +
          "<tr><td><span class=\"lbl\">Credit/เครดิต</span></td><td>" + esc(r.creditTerm) + " วัน</td></tr>" +
          "<tr><td><span class=\"lbl\">Sale/พนักงานขาย :</span> " + esc(r.perName) + "</td><td><span class=\"lbl\">Due/ครบกำหนด</span></td><td>" + esc(r.dueDate) + "</td></tr>" +
          "</tbody>" +
        "</table>" +
        '<table class="p050-bp-table">' +
          "<colgroup><col style=\"width:60px\"><col style=\"width:448px\"><col style=\"width:120px\"><col style=\"width:150px\"></colgroup>" +
          "<thead><tr><th class=\"center\">ลำดับ</th><th>เลขที่เอกสาร</th><th>ลงวันที่</th><th class=\"number\">ยอดรวม</th></tr></thead>" +
          "<tbody><tr class=\"p050-bp-inv\"><td class=\"center\">1</td><td>" + esc(r.vnos) + "</td><td class=\"center\">" + esc(r.date) + "</td><td class=\"number\">" + money(r.netSUM) + "</td></tr>" +
          "<tr class=\"p050-bp-total\"><td colspan=\"2\" class=\"p050-bp-thai\">" + thaiBaht(r.netSUM) + "</td><td class=\"number\">รวมเป็นเงิน</td><td class=\"number p050-bp-amt\">" + money(r.netSUM) + "</td></tr>" +
          "</tbody>" +
        "</table>" +
        '<p class="p050-bp-note">หมายเหตุ: กรณีมีข้อสงสัยในการบริการ กรุณาโทรสอบถามผู้ขายของคุณทุกคน</p>' +
        '<p class="p050-bp-due">กำหนดชำระเงินภายในวันที่ ___/___/___</p>' +
        '<div class="p050-bp-blank"></div>' +
        '<div class="p050-bp-blank"></div>' +
        '<div class="p050-bp-sign">' +
          '<div class="p050-signbox">Delivery By/ผู้ส่งของ</div>' +
          '<div class="p050-signbox">Received By/ผู้รับของ</div>' +
        "</div>" +
      "</article>";
    }

    function renderReceiptPage(r) {
      var addr = [r.add1, r.add2, r.add3].filter(function (x) { return x; }).join(" ");
      var d = r.date ? r.date.split("/") : ["", "", ""];
      var dateBuddhist = d[0] && d[2] ? d[0].replace(/^0/, "") + "/" + d[1].replace(/^0/, "") + "/" + (parseInt(d[2], 10) + 543) : "-";
      var dateYMD = d[0] && d[2] ? d[0] + "/" + d[1] + "/" + d[2] : "-";
      var amt = money(r.netSUM);
      return '<article class="p050-paper p050-rcp">' +
        '<table class="p050-rp-head">' +
          '<colgroup><col style="width:66.7%"><col style="width:15.3%"><col style="width:18%"></colgroup>' +
          "<tbody>" +
          '<tr><th colspan="3">KTV</th></tr>' +
          '<tr><td colspan="3" class="p050-rp-doctype">ใบเสร็จรับเงิน</td></tr>' +
          '<tr><td>ได้รับเงินจาก</td><td class="p050-rp-lbl">เลขที่ใบสำคัญ</td><td>' + esc(r.vnos) + "</td></tr>" +
          '<tr><td class="p050-rp-wrap"><span class="p050-rp-lbl">ชื่อลูกค้า :</span> ' + esc(r.nameT) + " " + esc(r.contactT) + "</td><td class='p050-rp-lbl'>รหัสลูกค้า</td><td>" + esc(r.code) + "</td></tr>" +
          '<tr><td class="p050-rp-wrap"><span class="p050-rp-lbl">ที่อยู่ :</span> ' + esc(addr) + "</td><td class='p050-rp-lbl'>วันที่</td><td>" + esc(dateYMD) + "</td></tr>" +
          '<tr><td colspan="3">เพื่อชำระค่าสินค้าตามใบกำกับภาษี (TAX INVOICE) ต่อไปนี้</td></tr>' +
          "</tbody>" +
        "</table>" +
        '<table class="p050-rcp-table">' +
          "<colgroup>" +
          '<col style="width:25%"><col style="width:25%"><col style="width:25%"><col style="width:11.11%"><col style="width:13.89%">' +
          "</colgroup>" +
          "<tr>" +
            "<th>เลขที่ D/O</th>" +
            "<th>ลงวันที่</th>" +
            "<th>วันครบกำหนด</th>" +
            '<th colspan="2">จำนวนเงิน</th>' +
          "</tr>" +
          "<tr>" +
            '<td class="c" style="height:300px">' + esc(r.vnos) + "</td>" +
            '<td class="c">' + esc(dateYMD) + "</td>" +
            '<td class="c"></td>' +
            '<td class="r" colspan="2">' + amt + "</td>" +
          "</tr>" +
          "<tr>" +
            '<td colspan="3" class="p050-rcp-cond">ใบเสร็จรับเงินนี้ถือว่าสมบูรณ์และถูกต้อง ต่อเมื่อมีลายเซ็นของผู้รับเงิน<br>เจ้าหน้าที่ผู้รับมอบอำนาจ,ประทับตราบริษัท,และบริษัทได้รับเงินตามเช็คถูกต้องแล้ว</td>' +
            '<td class="mid">ยอดรวม</td>' +
            '<td class="r mid">' + amt + "</td>" +
          "</tr>" +
        "</table>" +
        '<table class="p050-rcp-chq">' +
          "<colgroup>" +
          '<col style="width:27.78%"><col style="width:22.22%"><col style="width:19.44%"><col style="width:5.56%"><col style="width:11.11%"><col style="width:13.89%">' +
          "</colgroup>" +
          "<tr>" +
            '<td>เป็นเช็คธนาคาร<br>Cheque/Bank<span class="u u1"></span></td>' +
            '<td>เลขที่<br>Branch No<span class="u u2"></span></td>' +
            '<td>ลงวันที่<br>Dated<span class="u u3"></span></td>' +
            "<td>เงิน<br>Tcs.</td>" +
            '<td class="p050-rcp-b">หักส่วนลด</td>' +
            '<td class="r p050-rcp-b">0.00</td>' +
          "</tr>" +
          "<tr>" +
            '<td>เป็นเช็คธนาคาร<br>Cheque/Bank<span class="u u1"></span></td>' +
            '<td>เลขที่<br>Branch No<span class="u u2"></span></td>' +
            '<td>ลงวันที่<br>Dated<span class="u u3"></span></td>' +
            "<td>เงิน<br>Tcs.</td>" +
            '<td class="p050-rcp-b">รวมเงิน<br>Total Ticals</td>' +
            '<td class="r p050-rcp-b">' + amt + "</td>" +
          "</tr>" +
        "</table>" +
        '<table class="p050-rcp-wd">' +
          '<colgroup><col style="width:11.76%"><col style="width:54.76%"><col style="width:21.43%"></colgroup>' +
          "<tr>" +
            '<td class="c">จำนวนเงิน<br>ตัวอักษร</td>' +
            "<td>" + thaiBaht(parseFloat(String(r.netSUM).replace(/,/g, ""))) + "</td>" +
            "<td></td>" +
          "</tr>" +
        "</table>" +
        '<div class="p050-rcp-sign">' +
          '<div class="p050-signbox">ผู้รับเงิน / Collector</div>' +
          '<div class="p050-signbox">เจ้าหน้าที่ผู้รับมอบอำนาจ / Authorized Signature</div>' +
        "</div>" +
      "</article>";
    }

    var PRINT_MM = { billing: [215.9, 137.5], receipt: [210, 297] };

    function showBillPage() {
      var wrap = $("#p050PaperWrap");
      var pages = state.billPages;
      if (!pages.length) return;
      var idx = state.billIdx;
      wrap.innerHTML = pages[idx];
      var label = $("#p050PageLabel");
      if (label) label.textContent = (idx + 1) + "/" + pages.length;
      var prev = $("#p050PrevPage"), next = $("#p050NextPage");
      if (prev) prev.disabled = idx === 0;
      if (next) next.disabled = idx === pages.length - 1;
      requestAnimationFrame(fitPreview);
    }

    function navBillPage(d) {
      var pages = state.billPages;
      if (!pages.length) return;
      var idx = state.billIdx + d;
      if (idx < 0 || idx >= pages.length) return;
      state.billIdx = idx;
      showBillPage();
    }

    function setNavVisible(on) {
      var prev = $("#p050PrevPage"), next = $("#p050NextPage"), label = $("#p050PageLabel");
      if (prev) prev.style.display = on ? "" : "none";
      if (next) next.style.display = on ? "" : "none";
      if (label) label.style.display = on ? "" : "none";
    }

    function applyPrintPage() {
      var mm = PRINT_MM[printType()] || PRINT_MM.receipt;
      var margin = printType() === "receipt" ? "15mm" : "0";
      var tag = document.getElementById("p050PrintPage");
      if (!tag) {
        tag = document.createElement("style");
        tag.id = "p050PrintPage";
        document.head.appendChild(tag);
      }
      tag.textContent = "@page{size:" + mm[0] + "mm " + mm[1] + "mm;margin:" + margin + "}";
    }

    function updateScale() {
      var wrap = $("#p050PaperWrap");
      var papers = $$(".p050-paper");
      var totalW = 0, totalH = 0;
      papers.forEach(function (paper) {
        var w = paper.offsetWidth, h = paper.offsetHeight;
        paper.style.transform = "scale(" + state.zoom + ")";
        totalW += w;
        totalH += h;
      });
      if (totalW) {
        wrap.style.width = totalW * state.zoom + "px";
        wrap.style.height = totalH * state.zoom + "px";
      }
      $("#p050ZoomLabel").textContent = Math.round(state.zoom * 100) + "%";
    }

    function fitPreview() {
      var area = $(".p050-previewarea");
      var papers = $$(".p050-paper");
      if (!papers.length) return;
      var totalW = 0, totalH = 0;
      papers.forEach(function (p) { totalW += p.offsetWidth; totalH += p.offsetHeight; });
      if (!state.areaW) {
        state.areaW = area.offsetWidth - 90;
        state.areaH = area.offsetHeight - 90;
      }
      var aw = state.areaW, ah = state.areaH;
      if (aw <= 0 || ah <= 0 || totalW <= 0 || totalH <= 0) return;
      state.zoom = Math.max(0.3, Math.min(aw / totalW, ah / totalH, 1));
      updateScale();
    }

    function openPreview() {
      if (!selectedInvoices().length) { toast("กรณุเลือกรายการอย่างน้อย 1 รายการ", false); return; }
      state.areaW = 0;
      setNavVisible(true);
      renderPreview();
      applyPrintPage();
      $(".p050-modalbd").classList.add("show");
      document.body.style.overflow = "hidden";
    }

    function closePreview() {
      var bd = $(".p050-modalbd");
      if (!bd || !bd.classList.contains("show")) return;
      bd.classList.remove("show");
      document.body.style.overflow = "";
    }

    var prefixOpts = PREFIXES.map(function (p, i) {
      return '<option value="' + p + '"' + (i === 0 ? " selected" : "") + ">" + p + "</option>";
    }).join("");
    var statusOpts = STATUSES.map(function (s, i) {
      return '<option value="' + s.id + '"' + (i === 0 ? " selected" : "") + ">" + s.text + "</option>";
    }).join("");

    function todayStr() {
      var d = new Date();
      var p = function (n) { return (n < 10 ? "0" : "") + n; };
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    }
    var today = todayStr();

    var style = document.createElement("style");
    style.textContent = CSS;

    root.innerHTML =
      '<div class="p050">' +
        '<form class="p050-filterbar" id="p050Form">' +
          '<div class="p050-field">' +
            "<label>วันที่ Invoice</label>" +
            '<div class="p050-daterange">' +
              '<div class="p050-inputwrap"><input id="p050From" type="date" value="' + today + '"></div>' +
              '<span class="p050-datesep">ถึง</span>' +
              '<div class="p050-inputwrap"><input id="p050To" type="date" value="' + today + '"></div>' +
            "</div>" +
          "</div>" +
          '<div class="p050-field">' +
            '<label for="p050Creator">ผู้สร้างเอกสาร</label>' +
            '<div class="p050-inputwrap"><input id="p050Creator" type="text" placeholder="ระบุผู้สร้างเอกสาร" autocomplete="off"></div>' +
          "</div>" +
          '<div class="p050-field">' +
            '<label for="p050Dept">รหัสผู้แทน</label>' +
            '<div class="p050-inputwrap"><input id="p050Dept" type="text" placeholder="ระบุรหัสผู้แทน" autocomplete="off"></div>' +
          "</div>" +
          '<div class="p050-field">' +
            '<label for="p050Prefix">คำนำหน้าใบสำคัญ</label>' +
            '<div class="p050-inputwrap"><select id="p050Prefix">' + prefixOpts + "</select>" + I.arrow + "</div>" +
          "</div>" +
          '<div class="p050-field">' +
            '<label for="p050Status">สถานะ Invoice</label>' +
            '<div class="p050-inputwrap"><select id="p050Status">' + statusOpts + "</select>" + I.arrow + "</div>" +
          "</div>" +
          '<button class="p050-searchbtn" type="submit">' + I.search + "ค้นหา</button>" +
        "</form>" +

        '<section class="p050-actionbar">' +
          '<div class="p050-selinfo">' +
            '<div class="p050-selicon">' + I.check + "</div>" +
            '<div class="p050-seltext"><strong id="p050SelCount">เลือกแล้ว 0 รายการ</strong><span id="p050DocType">ประเภทเอกสาร: ใบเสร็จรับเงิน</span></div>' +
          "</div>" +
          '<div class="p050-actionbtns">' +
            '<div class="p050-radiobox">' +
              '<label class="p050-radioopt"><input type="radio" name="p050PrintType" value="billing" checked>ใบวางบิล</label>' +
              '<label class="p050-radioopt"><input type="radio" name="p050PrintType" value="receipt">ใบเสร็จรับเงิน</label>' +
            "</div>" +
            '<button class="p050-ghostbtn" id="p050SelAllBtn" type="button">' + I.selectAll + "เลือกทั้งหมด</button>" +
            '<button class="p050-printbtn" id="p050PreviewBtn" type="button">' + I.eye + "Print Preview</button>" +
          "</div>" +
        "</section>" +

        '<section class="p050-panel">' +
          '<div class="p050-panelhead">' +
            '<div class="p050-panelheading">' +
              '<div class="p050-panelicon">' + I.table + "</div>" +
              '<div class="p050-paneltitle"><h2>รายการใบแจ้งหนี้</h2><p id="p050Period"></p></div>' +
            "</div>" +
            '<span class="p050-badge" id="p050Badge">0 รายการ</span>' +
          "</div>" +
          '<div class="p050-tablewrap">' +
            '<table class="p050-table">' +
              "<thead><tr>" +
                '<th class="p050-cbcell"><input id="p050SelectAll" class="p050-cb" type="checkbox" aria-label="เลือกทั้งหมด"></th>' +
                '<th class="sortable" data-sort="no">เลขใบสำคัญ <span class="p050-sortmark">↕</span></th>' +
                '<th class="sortable" data-sort="customerCode">รหัสลูกค้า <span class="p050-sortmark">↕</span></th>' +
                '<th class="sortable" data-sort="customerName">ชื่อลูกค้า <span class="p050-sortmark">↕</span></th>' +
                '<th class="sortable" data-sort="province">เขต/พื้นที่ <span class="p050-sortmark">↕</span></th>' +
                '<th class="sortable number" data-sort="amount">ยอดเงิน <span class="p050-sortmark">↕</span></th>' +
                "<th>หมายเหตุ</th>" +
                '<th class="center">พิมพ์ใบวางบิล</th>' +
                '<th class="center">พิมพ์ใบเสร็จ</th>' +
              "</tr></thead>" +
              '<tbody id="p050Rows"></tbody>' +
            "</table>" +
          "</div>" +
          '<div class="p050-empty" id="p050Empty">' +
            '<div><div class="p050-emptyicon">' + I.empty + "</div><h3>ไม่พบรายการ Invoice</h3><p>ลองเปลี่ยนช่วงวันที่ คำนำหน้า หรือสถานะเอกสาร</p></div>" +
          "</div>" +
          '<div class="p050-tablefoot">' +
            '<span id="p050FootDesc">แสดง 0 รายการ</span>' +
            '<div class="p050-totals">' +
              '<div class="p050-total"><span>ยอดที่เลือก</span><strong id="p050SelAmount">฿0.00</strong></div>' +
              '<div class="p050-total"><span>ยอดรวม (หน้านี้)</span><strong id="p050FootAmount">฿0.00</strong></div>' +
            "</div>" +
          "</div>" +
          '<div class="p050-pager" id="p050Pager">' +
            '<button class="p050-pagerbtn" id="p050Prev" type="button" title="หน้าก่อนหน้า">' + I.chevL + "</button>" +
            '<div class="p050-pg-pages" id="p050Pages"></div>' +
            '<button class="p050-pagerbtn" id="p050Next" type="button" title="หน้าถัดไป">' + I.chevR + "</button>" +
            '<span class="p050-pg-info" id="p050PgInfo"></span>' +
          "</div>" +
        "</section>" +

        '<div class="p050-modalbd" id="p050ModalBd">' +
          '<div class="p050-modal">' +
            '<div class="p050-modalhead">' +
              "<div><h2 id=\"p050ModalTitle\">ตัวอย่างใบเสร็จรับเงิน</h2><p id=\"p050ModalSub\"></p></div>" +
              '<div class="p050-modalbtns">' +
                '<button class="p050-iconbtn" id="p050PrevPage" type="button" title="หน้าก่อนหน้า">' + I.chevL + "</button>" +
                '<span class="p050-zoomlabel" id="p050PageLabel">1/1</span>' +
                '<button class="p050-iconbtn" id="p050NextPage" type="button" title="หน้าถัดไป">' + I.chevR + "</button>" +
                '<button class="p050-iconbtn" id="p050ZoomOut" type="button" title="ลดขนาด">' + I.zoomOut + "</button>" +
                '<button class="p050-iconbtn" id="p050Fit" type="button" title="พอดีหน้าจอ">' + I.fit + "</button>" +
                '<button class="p050-iconbtn" id="p050ZoomIn" type="button" title="ขยายขนาด">' + I.zoomIn + "</button>" +
                '<span class="p050-zoomlabel" id="p050ZoomLabel">100%</span>' +
                '<button class="p050-iconbtn" id="p050Print" type="button" title="พิมพ์">' + I.print + "</button>" +
                '<button class="p050-iconbtn p050-closebtn" id="p050Close" type="button" title="ปิด (Esc)">' + I.close + "</button>" +
              "</div>" +
            "</div>" +
            '<div class="p050-previewarea">' +
              '<div class="p050-paperwrap" id="p050PaperWrap">' +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +

        '<div class="p050-toast">' + I.toast + '<span class="p050-toastmsg"></span></div>';

    root.appendChild(style);

    // ===== events =====
    $("#p050Form").addEventListener("submit", function (e) {
      e.preventDefault();
      applyFilters(true);
    });
    $("#p050Rows").addEventListener("change", function (e) {
      var cb = e.target.closest(".p050-cb");
      if (!cb) return;
      state.selected[cb.dataset.doc] = cb.checked;
      renderRows();
    });
    $("#p050SelectAll").addEventListener("change", function (e) {
      var v = e.target.checked;
      state.rows.forEach(function (i) { state.selected[i.no] = v; });
      renderRows();
    });
    $("#p050SelAllBtn").addEventListener("click", function () {
      state.rows.forEach(function (i) { state.selected[i.no] = true; });
      renderRows();
      toast("เลือก " + state.rows.length + " รายการ (หน้านี้)");
    });
    $$("th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var f = th.dataset.sort;
        if (state.sortField === f) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortField = f; state.sortDir = "asc"; }
        $$(".p050-sortmark").forEach(function (m) { m.textContent = "↕"; });
        th.querySelector(".p050-sortmark").textContent = state.sortDir === "asc" ? "↑" : "↓";
        renderRows();
      });
    });
    $("#p050Prev").addEventListener("click", function () { gotoPage(state.page - 1); });
    $("#p050Next").addEventListener("click", function () { gotoPage(state.page + 1); });
    $("#p050Pages").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-p050-page]");
      if (btn) gotoPage(parseInt(btn.getAttribute("data-p050-page"), 10));
    });
    $$('input[name="p050PrintType"]').forEach(function (r) {
      r.addEventListener("change", function () {
        updateSelectionSummary();
        applyPrintPage();
      });
    });
    $("#p050PreviewBtn").addEventListener("click", openPreview);
    $("#p050Close").addEventListener("click", closePreview);
    $("#p050ModalBd").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) closePreview();
    });
    $("#p050PrevPage").addEventListener("click", function () { navBillPage(-1); });
    $("#p050NextPage").addEventListener("click", function () { navBillPage(1); });
    $("#p050ZoomIn").addEventListener("click", function () {
      state.zoom = Math.min(1.5, state.zoom + 0.1);
      updateScale();
    });
    $("#p050ZoomOut").addEventListener("click", function () {
      state.zoom = Math.max(0.3, state.zoom - 0.1);
      updateScale();
    });
    $("#p050Fit").addEventListener("click", function () {
      fitPreview();
      toast("ปรับเอกสารให้พอดีหน้าจอแล้ว");
    });
    $("#p050Print").addEventListener("click", function () {
      applyPrintPage();
      var wrap = $("#p050PaperWrap");
      var pages = state.billPages;
      if (pages.length > 1) {
        wrap.innerHTML = pages.join("");
        $$(".p050-paper").forEach(function (p) { p.style.transform = "none"; });
        window.print();
        showBillPage();
        return;
      }
      window.print();
    });
    if (!state.escBound) {
      state.escBound = true;
      document.addEventListener("keydown", function (e) {
        var bd = $(".p050-modalbd");
        if (!bd || !bd.classList.contains("show")) return;
        if (e.key === "Escape") closePreview();
        if (e.key === "ArrowLeft") navBillPage(-1);
        if (e.key === "ArrowRight") navBillPage(1);
      });
    }
    window.addEventListener("resize", function () {
      var bd = $(".p050-modalbd");
      if (bd && bd.classList.contains("show")) { state.areaW = 0; fitPreview(); }
    });

    // initial load
    $("#p050Period").textContent = "ช่วงวันที่ " + fmtDate(today) + " ถึง " + fmtDate(today);
    loadPage(readFilters());
  }

  window.P050Billing = { mount: mount };
})();