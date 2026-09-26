/* P054 — Packing Order / Cartonize / ใบจัดกล่อง (DEV — mock data) */
(function () {
  'use strict';

  var ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect></svg>'
  };

  /* mock data (dev) */
  var ORDERS = [
    { id: 1, date: '22/9/2569', document: 'IVV76909-0125', customerCode: '25150-006', customerName: 'อำนวยสิน โฮมมาร์ท หจก.', district: 'บ้านสร้าง', status: '60' },
    { id: 2, date: '22/9/2569', document: 'IVVN6909-3488', customerCode: '83110-011', customerName: 'ซุปเปอร์ชีป บจก. (สาขาเชิงทะเล)', district: 'กลาง', status: '60' },
    { id: 3, date: '22/9/2569', document: 'IVVN6909-3525', customerCode: '24150-001', customerName: 'ทองสุขเครื่องครัว', district: 'บางน้ำเปรี้ยว', status: '60' },
    { id: 4, date: '22/9/2569', document: 'IVVN6909-3530', customerCode: '80360-007', customerName: 'สามารถนานาภัณฑ์', district: 'บางขัน', status: '60' },
    { id: 5, date: '22/9/2569', document: 'IVVN6909-3542', customerCode: '63110-046', customerName: 'ส.รุ่งเจริญ (LM)', district: 'แม่สอด', status: '60' },
    { id: 6, date: '22/9/2569', document: 'IVVN6909-3593', customerCode: '40150-014', customerName: 'เจริญทรัพย์ฮาร์ดแวร์', district: 'ภูเวียง', status: '60' },
    { id: 7, date: '22/9/2569', document: 'IVVN6909-3596', customerCode: '81160-013', customerName: 'เซน การเกษตร (สาม ช.เคหะภัณฑ์)', district: 'ปลายพระยา', status: '60' },
    { id: 8, date: '22/9/2569', document: 'IVVN6909-3598', customerCode: '54000-031', customerName: 'พัฒน์พงศ์ สวนเขื่อน (LM)', district: 'แพร่', status: '60' }
  ];

  var STATUS_LIST = [
    { code: '32', name: '32-Pack - ปกติ' },
    { code: '33', name: '33-Pack - ด่วน' },
    { code: '34', name: '34-Pack - ปกติ BKK' },
    { code: '35', name: '35-Pack - ด่วน BKK' },
    { code: '42', name: '42-INV - ปกติ' },
    { code: '43', name: '43-INV - ด่วน' },
    { code: '44', name: '44-INV - ปกติ BKK' },
    { code: '45', name: '45-INV - ด่วน BKK' },
    { code: '50', name: '50-PL ปกติ' },
    { code: '51', name: '51-PL ด่วน' },
    { code: '52', name: '52-Picking List ปกติ' },
    { code: '53', name: '53-Picking List ด่วน' },
    { code: '54', name: '54-PL ปกติ BKK' },
    { code: '55', name: '55-PL ด่วน BKK' },
    { code: '60', name: '60-ADS' },
    { code: '61', name: '61-ADS ส่ง WH' },
    { code: '62', name: '62-ADS ส่ง ACC' },
    { code: '65', name: '65-WH' },
    { code: '67', name: '67-Not Ship' }
  ];

  var state = { rows: [], selected: {}, searched: false, loading: false, page: 1, zoom: 1.0, receiverFont: 42 };

  var PAGE_SIZE = 15;

  var CONNECTION = (window.TAILORMADE_CONNECTION_ID || 'c1788406814359').trim();

  var _el = null;
  var _root = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var CSS = `
    :root {
      --p054-text: #172033;
      --p054-text-secondary: #334155;
      --p054-muted: #64748b;
      --p054-border: #e2e8f0;
      --p054-border-hover: #93c5fd;
      --p054-surface: #ffffff;
      --p054-hover: #f8fbff;
      --p054-primary: #2563eb;
      --p054-primary-hover: #1d4ed8;
      --p054-primary-soft: #eff6ff;
      --p054-focus-soft: rgb(37 99 235 / 15%);
    }
    [data-theme="dark"] {
      --p054-text: #e2e8f0;
      --p054-text-secondary: #cbd5e1;
      --p054-muted: #94a3b8;
      --p054-border: #334155;
      --p054-border-hover: #3b82f6;
      --p054-surface: #111c2e;
      --p054-hover: #16233a;
      --p054-primary: #3b82f6;
      --p054-primary-hover: #60a5fa;
      --p054-primary-soft: rgb(59 130 246 / 25%);
      --p054-focus-soft: rgb(96 165 250 / 20%);
    }

    .p054 { color: var(--p054-text); }
    .p054 * { box-sizing: border-box; }
    .p054 button, .p054 input, .p054 select { font: inherit; }
    .p054 button { cursor: pointer; }

    .p054-filter-card, .p054-table-card {
      border: 1px solid var(--p054-border);
      border-radius: 16px;
      background: var(--p054-surface);
      box-shadow: var(--shadow-card);
    }
    .p054-filter-card { padding: 24px; }
    .p054-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .p054-field { display: grid; gap: 7px; }
    .p054-field > label { color: var(--p054-text-secondary); font-size: 13px; font-weight: 700; }
    .p054-field input, .p054-field select {
      width: 100%; height: 42px; padding: 0 12px;
      border: 1px solid var(--p054-border); border-radius: 9px;
      color: var(--p054-text); background: var(--p054-surface);
    }
    .p054-field input:focus, .p054-field select:focus {
      border-color: var(--p054-primary); outline: 3px solid var(--p054-focus-soft);
    }
    .p054-filter-actions { display: flex; align-items: flex-end; gap: 10px; }

    .p054-button {
      display: inline-flex; min-height: 42px; align-items: center; justify-content: center;
      gap: 8px; padding: 0 16px; border: 1px solid transparent; border-radius: 9px;
      font-weight: 700; transition: 0.15s ease;
    }
    .p054-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .p054-button-primary { color: #fff; background: var(--p054-primary); }
    .p054-button-primary:hover { background: var(--p054-primary-hover); }
    .p054-button-secondary { border-color: var(--p054-border); color: var(--p054-text-secondary); background: var(--p054-surface); }
    .p054-button-secondary:hover { border-color: var(--p054-border-hover); color: var(--p054-primary); background: var(--p054-primary-soft); }
    .p054-button:disabled { opacity: 0.6; cursor: wait; }

    .p054-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin: 28px 0 14px; }
    .p054-toolbar h2 { margin: 0; font-size: 19px; color: var(--p054-text); }
    .p054-toolbar p { margin: 8px 0 0; color: var(--p054-muted); }

    .p054-actionbar {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      margin: 0 0 14px; padding: 13px 15px;
      border: 1px solid var(--p054-border); border-radius: 12px;
      background: var(--p054-surface); box-shadow: var(--shadow-card);
    }
    .p054-selinfo { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .p054-selicon {
      display: grid; place-items: center; width: 42px; height: 42px; flex: 0 0 auto;
      color: var(--p054-primary); background: var(--p054-primary-soft); border-radius: 11px;
    }
    .p054-selicon svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .p054-seltext { display: flex; flex-direction: column; min-width: 0; }
    .p054-seltext strong { color: var(--p054-text); font-size: 14px; }
    .p054-seltext span { margin-top: 2px; color: var(--p054-muted); font-size: 11px; }
    .p054-actionbtns { display: flex; gap: 10px; flex: 0 0 auto; align-items: center; }
    .p054-receiverfont { display: flex; flex-direction: row; align-items: center; gap: 8px; }
    .p054-receiverfont label { font-size: 12px; color: var(--p054-muted); font-weight: 600; }
    .p054-receiverfont input { width: 90px; padding: 8px 10px; border: 1px solid var(--p054-border); border-radius: 8px; background: var(--p054-surface); color: var(--p054-text); font-size: 14px; font-weight: 700; }

    .p054-pagination {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 14px 20px; background: var(--p054-hover); border-top: 1px solid var(--p054-border);
      flex-wrap: wrap;
    }
    .p054-page-info { color: var(--p054-muted); font-size: 13px; margin-right: 12px; }
    .p054-page-btn {
      min-width: 36px; min-height: 36px; padding: 0 10px;
      border: 1px solid var(--p054-border); border-radius: 8px; background: var(--p054-surface);
      font-weight: 700; color: var(--p054-text-secondary); cursor: pointer;
    }
    .p054-page-btn:hover { border-color: var(--p054-border-hover); color: var(--p054-primary); background: var(--p054-primary-soft); }
    .p054-page-btn.active { background: var(--p054-primary); border-color: var(--p054-primary); color: #fff; }
    .p054-page-btn:disabled { opacity: 0.4; cursor: default; }

    .p054-table-card { overflow: hidden; }
    .p054-table-responsive { overflow-x: auto; }
    .p054-table { width: 100%; min-width: 900px; border-collapse: collapse; }
    .p054-table thead { background: var(--p054-hover); }
    .p054-table th, .p054-table td { padding: 14px 16px; border-bottom: 1px solid var(--p054-border); text-align: left; white-space: nowrap; }
    .p054-table th { color: var(--p054-text-secondary); font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .p054-table td { font-size: 14px; }
    .p054-table tbody tr { cursor: pointer; }
    .p054-table tbody tr:hover { background: var(--p054-hover); }
    .p054-table tbody tr.p054-selected { background: var(--p054-primary-soft); }
    .p054-check-column { width: 52px; text-align: center; }
    .p054-table input[type="checkbox"] { width: 17px; height: 17px; margin: 0; cursor: pointer; accent-color: var(--p054-primary); }
    .p054-doc-number { color: var(--p054-primary); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; }
    .p054-customer-code { color: var(--p054-muted); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .p054-amount { font-weight: 800; }
    .p054-desc { white-space: normal; min-width: 220px; max-width: 380px; color: var(--p054-text-secondary); }
    .p054-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; background: #ecfdf5; color: #059669; font-size: 12px; font-weight: 700; }
    .p054-empty { padding: 52px 20px; color: var(--p054-muted); text-align: center; white-space: normal; font-size: 15px; }
    .p054-empty .p054-empty-sub { margin-top: 8px; font-size: 13px; color: var(--p054-muted); }

    /* modal + ป้าย (preview) */
    .p054-modal { position: fixed; inset: 0; z-index: 300; display: none; align-items: center; justify-content: center; background: rgba(15,23,42,.55); }
    .p054-modal.open { display: flex; }
    .p054-modalbox { width: 860px; max-width: calc(100vw - 40px); max-height: calc(100vh - 60px); display: flex; flex-direction: column; background: #fff; border-radius: 14px; box-shadow: 0 24px 60px rgba(15,23,42,.35); }
    .p054-modalhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; }
    .p054-modalhead h2 { margin: 0; font-size: 15px; font-weight: 700; color: #0f172a; }
    .p054-modalhead .sub { font-size: 11px; color: #64748b; margin-top: 3px; }
    .p054-modalclose { width: 32px; height: 32px; border: 0; border-radius: 8px; background: #f8fafc; color: #64748b; font-size: 18px; cursor: pointer; }
    .p054-modalclose:hover { background: #fee2e2; color: #dc2626; }
    .p054-modalhead-right { display: flex; align-items: center; gap: 10px; }
    .p054-zoom { display: flex; align-items: center; gap: 4px; }
    .p054-zoom button {
      min-width: 30px; height: 30px; padding: 0 8px;
      border: 1px solid #e2e8f0; border-radius: 7px; background: #fff;
      color: #334155; font-weight: 700; font-size: 13px; cursor: pointer;
    }
    .p054-zoom button:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
    .p054-zoom .p054-zoom-lbl { min-width: 48px; text-align: center; color: #64748b; font-size: 12px; font-weight: 700; }
    .p054-modalbody { padding: 20px; overflow-y: auto; background: #e2e8f0; }
    .p054-modal .p054-button { color: #334155; border-color: #e2e8f0; background: #fff; }
    .p054-modal .p054-button-primary { background: #16a34a; color: #fff; }
    .p054-modal .p054-button-primary:hover { background: #15803d; }

    /* A4 page (794x1123px = A4 @96dpi — margin 15pt = 20px) */
    .p054-page { width: 794px; height: 1123px; padding: 20px; box-sizing: border-box; background: #fff; border: 1px solid #cbd5e1; margin: 0 auto 14px; overflow: hidden; }
    .p054-page:last-child { margin-bottom: 0; }

    /* label = table 205px (15/30/55) */
    .p054-label { margin-bottom: 0; }
    .p054-label:last-child { margin-bottom: 0; }
    .p054-lbl-tbl { width: 550pt; table-layout: fixed; height: 65pt; border-collapse: collapse; margin: 0 auto; border-bottom: 1px solid #000; }
    .p054-lbl-tbl td { padding: 6px 10px; vertical-align: middle; font-size: 14px; color: #000; }
    .p054-lbl-route { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; text-align: center; }
    .p054-lbl-route-cap { font-size: 12px; color: #000; }
    .p054-lbl-route-val { font-size: 18px; font-weight: 700; }
    .p054-lbl-barcode { text-align: center; }
    .p054-lbl-bc-text { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 700; color: #000; margin-bottom: 2px; }
    .p054-lbl-barcode svg { display: block; margin: 0 auto; max-width: 150px; max-height: 50px; }
    td.p054-lbl-name { vertical-align: top; font-weight: 400; }

    /* table 2 = items (20/75/325/70/60pt — กึ่งกลางกระดาษ — ไร้เส้นตาราง) */
    .p054-item-wrap { margin-top: 3px; }
    .p054-item-tbl { width: 550pt; table-layout: fixed; border-collapse: collapse; margin: 0 auto; }
    .p054-item-tbl th, .p054-item-tbl td { border: none; padding: 3px 6px; font-size: 14px; color: #000; }
    .p054-item-tbl tbody td { height: 40px; line-height: 14px; vertical-align: top; }
    .p054-item-tbl thead th { font-size: 15px; font-weight: 700; text-align: center; }
    .p054-item-char { text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .p054-item-code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .p054-item-desc { text-align: left; }
    .p054-item-qty { text-align: right; }
    .p054-item-tbl thead th.p054-item-qty { text-align: right; }
    .p054-item-unit { text-align: center; }
    .p054-item-empty { text-align: center; color: #6b7280; }

    /* table 3 = notes (265/20/265pt — 1 แถวสูง 100px ชิดบน — col 2 ไม่มีเส้น) */
    .p054-notes-wrap { margin-top: 3px; }
    .p054-notes-tbl { width: 550pt; table-layout: fixed; border-collapse: collapse; margin: 0 auto; }
    .p054-notes-tbl td { border: 1px solid #000; padding: 2px 4px; font-size: 12px; color: #000; }
    .p054-notes-tbl td.p054-notes-mid { border: none; }
    .p054-notes-tbl td.p054-notes-cell { height: 100px; vertical-align: top; }
    .p054-notes-cap { font-weight: 700; font-size: 14px; }
    .p054-notes-val { font-size: 12px; }

    /* JOB page — หน้า JOB (1 กลุ่มตัวอักษร = 1 หน้า — ตาม C# Frm_BucketParts_Version2) */
    .p054-jobs { margin-top: 14px; }
    .p054-jobs-head { font-size: 13px; font-weight: 700; color: #334155; margin: 0 0 8px; }
    .p054-job-page { width: 794px; height: 1123px; padding: 20px; box-sizing: border-box; background: #fff; border: 1px solid #cbd5e1; margin: 0 auto 14px; overflow: hidden; position: relative; }
    .p054-job-header { width: 550pt; table-layout: fixed; border-collapse: collapse; margin: 0 auto; }
    .p054-job-header td { border: none; padding: 0 6px 5px; font-size: 18px; text-align: center; color: #000; vertical-align: middle; }
    .p054-job-header tr:last-child td { border-bottom: 1px solid #000; }
    .p054-job-header td.p054-job-hdr-route { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    .p054-job-hdr-route-cap { font-size: 12px; }
    .p054-job-hdr-route-val { font-size: 18px; font-weight: 700; }
    .p054-job-hdr-open { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .p054-job-hdr-bc-text { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; font-weight: 700; color: #000; margin-bottom: 2px; }
    .p054-job-header svg { display: block; margin: 0 auto; max-width: 150px; max-height: 50px; }
    .p054-job-receiver { width: 550pt; table-layout: fixed; border-collapse: collapse; margin: 10px auto 0; }
    .p054-job-receiver td { border: none; padding: 0 6px; color: #000; }
    .p054-job-receiver tr:last-child td { border-bottom: 1px solid #000; }
    .p054-job-receiver-cap { font-size: 30px; font-weight: 700; padding-top: 20px; }
    .p054-job-receiver-body { height: 300px; font-weight: 700; padding: 20px 0 8px; vertical-align: top; white-space: pre-line; }
    .p054-job-items { width: 550pt; table-layout: fixed; border-collapse: collapse; margin: 10px auto 0; }
    .p054-job-items th, .p054-job-items td { border: none; padding: 3px 6px; font-size: 16px; color: #000; }
    .p054-job-items thead th { font-size: 16px; font-weight: 700; text-align: center; }
    .p054-job-items thead th.p054-item-qty { text-align: right; padding-right: 10px; }
    .p054-job-items tbody td { height: 30px; line-height: 14px; vertical-align: top; }
    .p054-job-items .p054-item-qty { text-align: right; padding-right: 10px; }
    .p054-job-items .p054-item-char { text-align: center; }
    .p054-job-items .p054-item-unit { text-align: center; }
    .p054-job-packing { font-size: 20px; text-align: right; padding: 15px 20px 0 0; }
    .p054-job-footer { width: 550pt; table-layout: fixed; border-collapse: collapse; position: absolute; bottom: 170px; left: 0; right: 0; margin: 0 auto; }
    .p054-job-footer td { border: none; padding: 0 6px 5px; font-size: 14px; text-align: center; color: #000; vertical-align: middle; }
    .p054-job-footer svg { display: block; margin: 0 auto; max-width: 150px; max-height: 50px; }

    /* toast */
    .p054-toast { position: fixed; right: 20px; bottom: 20px; z-index: 200; visibility: hidden; align-items: center; gap: 8px; padding: 11px 14px; color: #fff; border-radius: 11px; background: #0f172a; box-shadow: 0 16px 36px rgba(15,23,42,.28); font-size: 12px; opacity: 0; transform: translateY(12px); transition: .2s ease; display: flex; }
    .p054-toast.show { visibility: visible; opacity: 1; transform: translateY(0); }
    .p054-toast.error { background: #dc2626; }

    /* print — A4 — 1 page = 1 หน้าพิมพ์ */
    @page { size: A4; margin: 0; }
    @media print {
      body * { visibility: hidden !important; }
      .p054-printroot, .p054-printroot * { visibility: visible !important; }
      body { margin: 0 !important; padding: 0 !important; }
      body > *:not(.p054-printroot) { display: none !important; }
      .p054-printroot { width: 210mm; }
      .p054-page { width: 210mm; height: 297mm; padding: 15pt; border: 0 !important; margin: 0 !important; page-break-after: always; break-after: page; }
      .p054-page:last-child { page-break-after: auto; break-after: auto; }
      .p054-jobs { margin-top: 0; }
      .p054-job-page { width: 210mm; height: 297mm; padding: 15pt; border: 0 !important; margin: 0 !important; page-break-after: always; break-after: page; }
      .p054-jobs:last-child .p054-job-page:last-child { page-break-after: auto; break-after: auto; }
      .p054-label { margin-bottom: 0; }
    }
  `;

  function formatMoney(amount) {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2
    }).format(amount);
  }

  function renderRoot(root) {
    var statusOpts = STATUS_LIST.map(function (s) {
      return '<option value="' + esc(s.code) + '"' + (s.code === '32' ? ' selected' : '') + '>' + esc(s.name) + '</option>';
    }).join('');
    root.innerHTML =
      '<div class="p054">' +
      '  <section class="p054-filter-card">' +
      '    <div class="p054-filter-grid">' +
      '      <div class="p054-field">' +
      '        <label for="p054Date">วันที่</label>' +
      '        <input id="p054Date" type="date">' +
      '      </div>' +
      '      <div class="p054-field">' +
      '        <label for="p054Status">สถานะ</label>' +
      '        <select id="p054Status">' + statusOpts + '</select>' +
      '      </div>' +
      '      <div class="p054-field">' +
      '        <label for="p054Search">เลขใบสำคัญ</label>' +
      '        <input id="p054Search" type="text" placeholder="ระบุเลขที่ใบสำคัญ" autocomplete="off">' +
      '      </div>' +
      '      <div class="p054-filter-actions">' +
      '        <button class="p054-button p054-button-primary" type="button" id="p054BtnSearch">' + ICONS.search + 'ค้นหา</button>' +
      '        <button class="p054-button p054-button-secondary" type="button" id="p054BtnReset">↻ ล้างค่า</button>' +
      '      </div>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p054-toolbar">' +
      '    <div>' +
      '      <h2>รายการใบสำคัญ</h2>' +
      '      <p id="p054ResultText">ยังไม่ได้ค้นหา — เลือกสถานะ แล้วกด ค้นหา</p>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p054-actionbar">' +
      '    <div class="p054-selinfo">' +
      '      <div class="p054-selicon">' + ICONS.check + '</div>' +
      '      <div class="p054-seltext"><strong id="p054SelCount">เลือกแล้ว 0 รายการ</strong><span>ประเภทเอกสาร: Packing Order</span></div>' +
      '    </div>' +
      '    <div class="p054-actionbtns">' +
      '      <div class="p054-field p054-receiverfont">' +
      '        <label for="p054ReceiverFont">ขนาดอักษรชื่อผู้รับ</label>' +
      '        <input id="p054ReceiverFont" type="number" value="' + (state.receiverFont || 42) + '" min="8" max="120">' +
      '      </div>' +
      '      <button class="p054-button p054-button-secondary" type="button" id="p054BtnSelAll">' + ICONS.check + 'เลือกทั้งหมด</button>' +
      '      <button class="p054-button p054-button-primary" type="button" id="p054BtnPreview">' + ICONS.eye + 'Print Preview</button>' +
      '    </div>' +
      '  </section>' +
      '  <section class="p054-table-card">' +
      '    <div class="p054-table-responsive">' +
      '      <table class="p054-table">' +
      '        <thead>' +
      '          <tr>' +
      '            <th class="p054-check-column"><input id="p054SelectAll" type="checkbox"></th>' +
      '            <th>วันที่</th>' +
      '            <th>เลขที่ใบสำคัญ</th>' +
      '            <th>รหัสลูกค้า</th>' +
      '            <th>ชื่อลูกค้า</th>' +
      '            <th>พื้นที่</th>' +
      '            <th>สถานะ</th>' +
      '          </tr>' +
      '        </thead>' +
      '        <tbody id="p054Body"></tbody>' +
      '      </table>' +
      '    </div>' +
      '    <div class="p054-pagination" id="p054Pagination"></div>' +
      '  </section>' +
      '</div>' +
      '<div class="p054-modal" id="p054Modal">' +
      '  <div class="p054-modalbox">' +
      '    <div class="p054-modalhead">' +
      '      <div>' +
      '        <h2>Packing Order</h2>' +
      '        <div class="sub" id="p054ModalSub"></div>' +
      '      </div>' +
      '      <div class="p054-modalhead-right">' +
      '        <div class="p054-zoom">' +
      '          <button type="button" id="p054ZoomOut" title="ย่อขนาด">−</button>' +
      '          <span class="p054-zoom-lbl" id="p054ZoomLbl">100%</span>' +
      '          <button type="button" id="p054ZoomIn" title="ขยายขนาด">+</button>' +
      '          <button type="button" id="p054ZoomFit" title="พอดีจอ">พอดีจอ</button>' +
      '        </div>' +
      '        <button type="button" class="p054-button p054-button-primary" id="p054BtnPrint">' + ICONS.print + 'พิมพ์</button>' +
      '        <button type="button" class="p054-modalclose" id="p054ModalClose" aria-label="ปิดหน้าต่าง">&times;</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="p054-modalbody" id="p054ModalBody">' +
      '      <div id="p054ZoomWrap"></div>' +
      '    </div>' +
      '  </div>' +
      '</div>' +
      '<div class="p054-toast" id="p054Toast" role="status"></div>';
  }

  function toast(root, msg, isError) {
    var el = document.getElementById('p054Toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.classList.remove('show');
    }, 2300);
  }

  function selCount() {
    var n = 0;
    Object.keys(state.selected).forEach(function (k) {
      if (state.selected[k]) n++;
    });
    return n;
  }

  function statusName(code) {
    for (var i = 0; i < STATUS_LIST.length; i++) {
      if (String(STATUS_LIST[i].code) === String(code)) return STATUS_LIST[i].name;
    }
    return String(code || '');
  }

  function renderTable(root) {
    var el = _el;
    var rows = state.rows;
    var totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;
    var start = (state.page - 1) * PAGE_SIZE;
    var pageRows = rows.slice(start, start + PAGE_SIZE);
    var html = '';
    if (!rows.length) {
      var emptySub = state.searched ? 'ลองเปลี่ยนวันที่ หรือเลขใบสำคัญ' : 'กดค้นหาเพื่อแสดงรายการ';
      html = '<tr><td colspan="7" class="p054-empty">ไม่พบใบสำคัญ<div class="p054-empty-sub">' + emptySub + '</div></td></tr>';
    } else {
      pageRows.forEach(function (o) {
        var sel = state.selected[o.id] ? ' p054-selected' : '';
        var chk = state.selected[o.id] ? ' checked' : '';
        html += '<tr class="' + sel + '" data-p054-row="' + o.id + '">' +
          '<td class="p054-check-column"><input type="checkbox" data-chk="' + o.id + '"' + chk + '></td>' +
          '<td>' + esc(o.date) + '</td>' +
          '<td class="p054-doc-number">' + esc(o.document) + '</td>' +
          '<td class="p054-customer-code">' + esc(o.customerCode) + '</td>' +
          '<td>' + esc(o.customerName) + '</td>' +
          '<td>' + esc(o.district) + '</td>' +
          '<td><span class="p054-badge">' + esc(statusName(o.status)) + '</span></td>' +
          '</tr>';
      });
    }
    el.body.innerHTML = html;
    el.selCount.textContent = 'เลือกแล้ว ' + selCount() + ' รายการ';
    el.selectAll.checked = pageRows.length > 0 && pageRows.every(function (o) {
      return state.selected[o.id];
    });
    el.resultText.textContent = state.searched
      ? 'พบ ' + rows.length + ' รายการ'
      : 'ยังไม่ได้ค้นหา — เลือกสถานะ แล้วกด ค้นหา';
    renderPagination();
  }

  function renderPagination() {
    var el = _el;
    var rows = state.rows;
    var total = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (state.page > total) state.page = total;
    if (rows.length === 0) {
      el.pagination.innerHTML = '';
      return;
    }
    var start = (state.page - 1) * PAGE_SIZE + 1;
    var end = Math.min(state.page * PAGE_SIZE, rows.length);

    // ปุ่มหน้า: ก่อนหน้า / 1..total / หน้าถัดไป (แสดงเลขสูงสุด 7 ตัว)
    var pages = [];
    var windowSize = 7;
    var first = Math.max(1, state.page - 3);
    var last = Math.min(total, first + windowSize - 1);
    if (last - first < windowSize - 1) {
      first = Math.max(1, last - windowSize + 1);
    }
    for (var i = first; i <= last; i++) pages.push(i);

    var html = '<span class="p054-page-info">แสดง ' + start + '-' + end + ' จาก ' + rows.length + ' รายการ · หน้า ' + state.page + '/' + total + '</span>';
    html += '<button class="p054-page-btn" type="button" ' + (state.page === 1 ? 'disabled' : '') + ' data-p054-page="' + (state.page - 1) + '">‹</button>';
    pages.forEach(function (p) {
      html += '<button class="p054-page-btn ' + (p === state.page ? 'active' : '') + '" type="button" data-p054-page="' + p + '">' + p + '</button>';
    });
    html += '<button class="p054-page-btn" type="button" ' + (state.page === total ? 'disabled' : '') + ' data-p054-page="' + (state.page + 1) + '">›</button>';
    el.pagination.innerHTML = html;
  }

  function goPage(page) {
    var total = Math.max(1, Math.ceil(state.rows.length / PAGE_SIZE));
    if (page < 1 || page > total) return;
    state.page = page;
    renderTable(_root);
  }

  function doSearch(root) {
    var el = _el;
    if (state.loading) return;
    state.loading = true;
    el.btnSearch.disabled = true;
    var date = el.date.value;
    var status = el.status.value;
    var vnos = el.search.value.trim();
    fetch('api/p054_search.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId: CONNECTION, date: date, status: status, vnos: vnos })
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        state.loading = false;
        el.btnSearch.disabled = false;
        if (!d.ok) {
          toast(root, d.error || 'ค้นหาไม่สำเร็จ', true);
          return;
        }
        state.rows = (d.rows || []).map(function (r, i) {
          return {
            id: i + 1,
            date: r.date,
            document: r.vn,
            customerCode: r.cus,
            customerName: r.name,
            district: r.contact,
            status: r.status,
            desc: r.desc,
            memo: r.memo,
            notes: r.notes,
            job: r.job,
            amount: r.amount,
            printCount: r.printCount
          };
        });
        state.searched = true;
        state.selected = {};
        state.page = 1;
        renderTable(root);
        if (state.rows.length === 0) {
          toast(root, 'ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา', true);
        }
      })
      .catch(function () {
        state.loading = false;
        el.btnSearch.disabled = false;
        toast(root, 'ค้นหาไม่สำเร็จ — เช็คว่าเซิร์ฟเวอร์ทำงานอยู่หรือไม่', true);
      });
  }

  function barcodeSVG(vn, w, h) {
    // CODE128 — JsBarcode (CDN — อยู่ใน index.php) — เป้า 150x50px (default) — fallback = monospace text
    w = w || 150;
    h = h || 50;
    try {
      if (window.JsBarcode) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        // CODE128 modules = 24 + 11/char — ปรับ module width ให้รวม ~150px
        var modules = 24 + 11 * String(vn).length;
        var mw = Math.max(0.5, w / modules);
        window.JsBarcode(svg, String(vn), {
          format: 'CODE128',
          width: mw,
          height: h,
          fontSize: 12,
          displayValue: false,
          margin: 0
        });
        svg.style.maxWidth = w + 'px';
        svg.style.maxHeight = h + 'px';
        return svg.outerHTML;
      }
    } catch (e) {
      // fall through
    }
    return '<div style="font-family:ui-monospace,monospace;font-weight:700;font-size:14px">' + esc(vn) + '</div>';
  }

  function createLabel(o, fontPt, routes) {
    var route = (routes && o.job && routes[o.job]) ? routes[o.job] : (o.job || '');
    return '<article class="p054-label">' +
      '<table class="p054-lbl-tbl">' +
      '<colgroup><col style="width:55pt"><col style="width:155pt"><col style="width:340pt"></colgroup>' +
      '<tr>' +
      '<td class="p054-lbl-route"><div class="p054-lbl-route-cap">Route</div><div class="p054-lbl-route-val">' + esc(route) + '</div></td>' +
      '<td class="p054-lbl-barcode"><div class="p054-lbl-bc-text">' + esc(o.document) + '</div><div id="p054bc' + o.id + '"></div></td>' +
      '<td class="p054-lbl-name" style="font-size:16px">' + esc('ชื่อลูกค้า : ') + esc(o.customerCode) + ' ' + esc(cleanProductDesc(o.customerName)) + ' ' + esc(o.district) + '</td>' +
      '</tr>' +
      '</table>' +
      '</article>';
  }

  // ตัดคำที่ไม่ต้องการในชื่อสินค้า: (LM) (CTN) (C) (CL) (X) (B)
  function cleanProductDesc(desc) {
    if (!desc) return '';
    var s = String(desc);
    s = s.replace(/\s*\((?:CTN|CL|LM|C|X|B)\)\s*/g, ' ');
    s = s.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    return s;
  }

  // table 2 = items (5 คอลั่น — 20/75/325/70/60pt — กึ่งกลางกระดาษ)
  function createItemTable(vn, items) {
    var html = '<table class="p054-item-tbl">' +
      '<colgroup><col style="width:20pt"><col style="width:75pt"><col style="width:325pt"><col style="width:70pt"><col style="width:60pt"></colgroup>' +
      '<thead><tr>' +
      '<th></th>' +
      '<th>รหัสสินค้า</th>' +
      '<th>รายละเอียด</th>' +
      '<th class="p054-item-qty">จำนวน</th>' +
      '<th>หน่วย</th>' +
      '</tr></thead><tbody>';
    if (!items || items.length === 0) {
      html += '<tr><td colspan="5" class="p054-item-empty">— ไม่มี item —</td></tr>';
    } else {
      items.forEach(function (it) {
        var qty = it.qty === null ? '' : it.qty;
        // rows สูง 40px คงที่ — ชื่อสินค้ายาว wrap ในแถว (ไม่ขยายสูงแถว)
        html += '<tr>' +
          '<td class="p054-item-char">' + esc(it.char || '') + '</td>' +
          '<td class="p054-item-code">' + esc(it.code || '') + '</td>' +
          '<td class="p054-item-desc">' + esc(it.desc || '') + '</td>' +
          '<td class="p054-item-qty">' + esc(qty) + '</td>' +
          '<td class="p054-item-unit">' + esc(it.unit || '') + '</td>' +
          '</tr>';
      });
      // pad แถวว่างจนครบ 12 แถว
      for (var p = items.length; p < 12; p++) {
        html += '<tr><td></td><td></td><td></td><td></td><td></td></tr>';
      }
    }
    html += '</tbody></table>';
    return '<div class="p054-item-wrap" data-p054-item="' + esc(vn) + '">' + html + '</div>';
  }

  function drawItemTables(itemsMap) {
    var el = _el;
    var labels = el.zoomWrap.querySelectorAll('.p054-label');
    labels.forEach(function (lbl) {
      var bcText = lbl.querySelector('.p054-lbl-bc-text');
      if (!bcText) return;
      var vn = bcText.textContent;
      var items = (itemsMap[vn] || []).slice(0, 12);
      var wrap = document.createElement('div');
      wrap.innerHTML = createItemTable(vn, items);
      var itemsEl = wrap.firstChild;
      lbl.parentNode.insertBefore(itemsEl, lbl.nextSibling);
      // table 3 = notes (265/20/265pt — ใต้ table 2)
      var row = null;
      for (var i = 0; i < state.rows.length; i++) {
        if (state.rows[i].document === vn) { row = state.rows[i]; break; }
      }
      var nwrap = document.createElement('div');
      nwrap.innerHTML = createNotesTable(row);
      lbl.parentNode.insertBefore(nwrap.firstChild, itemsEl.nextSibling);
    });
  }

  // table 3 = notes (265/20/265pt — 1 แถว)
  function createNotesTable(row) {
    var notes = row ? (row.notes || '') : '';
    var desc = row ? (row.desc || '') : '';
    return '<div class="p054-notes-wrap">' +
      '<table class="p054-notes-tbl">' +
      '<colgroup><col style="width:265pt"><col style="width:20pt"><col style="width:265pt"></colgroup>' +
      '<tr><td class="p054-notes-cell"><div class="p054-notes-cap">หมายเหตุ</div><div class="p054-notes-val">' + esc(notes) + '</div></td><td class="p054-notes-mid"></td><td class="p054-notes-cell"><div class="p054-notes-cap">หมายเหตุ (ภายใน)</div><div class="p054-notes-val">' + esc(desc) + '</div></td></tr>' +
      '</table>' +
      '</div>';
  }

  // JOB group items — logic qty ตาม C# GenSTKTablePage (4 รูปแบบ)
  function genStkRows(items, cond) {
    var rows = [];
    if (!items) return rows;
    items.forEach(function (it) {
      var v = String(it.vcol2 || '');
      var snsv = String(it.snsv || '');
      if (snsv === '4' && v.indexOf('/') !== -1) {
        // snsv 4 — MIS quantities — แจกตาม lot — desc += (qty1,qty2,...) — qty = total
        var num = v.split('/');
        var loop = parseInt(num[1], 10) || 1;
        var mis = it.mis || [];
        var lot = Math.floor(mis.length / loop);
        var rem = mis.length % loop;
        for (var i = 0; i < loop; i++) {
          var msg = '';
          var width = 0;
          for (var x = lot * i; x < lot * (i + 1); x++) {
            msg += mis[x] + ',';
            width += mis[x];
          }
          if (i === loop - 1) {
            for (var m = 1; m <= rem; m++) {
              var idx = lot * (i + 1) - 1 + m;
              if (mis[idx] !== undefined) {
                msg += mis[idx] + ',';
                width += mis[idx];
              }
            }
          }
          rows.push({
            code: it.code,
            desc: (it.desc || '') + ' (' + msg.replace(/,$/, '') + ')',
            qty: fmtQty(width),
            unit: it.unit || ''
          });
        }
      } else if (v.indexOf('/') !== -1) {
        // A/3 — 3 rows — qty = (quan/3)/conv ต่อ row
        var pages = v.split('/');
        var cnt = parseInt(pages[1], 10) || 1;
        var q = (it.quan || 0) / cnt;
        q = (it.conv ? q / it.conv : q);
        for (var j = 0; j < cnt; j++) {
          rows.push({ code: it.code, desc: it.desc || '', qty: fmtQty(q), unit: it.unit || '' });
        }
      } else if (v.indexOf('=') !== -1) {
        // A=5,B=3 — ตัดเฉพาะส่วนที่ตรงกับ cond — qty = ตัวเลขหลัง =
        var parts = v.split(',');
        for (var k = 0; k < parts.length; k++) {
          if (parts[k].indexOf(cond) !== -1) {
            var eq = parts[k].split('=');
            rows.push({ code: it.code, desc: it.desc || '', qty: fmtQty(parseFloat(eq[1]) || 0), unit: it.unit || '' });
          }
        }
      } else {
        // ปกติ — qty = quan/conv
        rows.push({ code: it.code, desc: it.desc || '', qty: fmtQty(it.conv ? (it.quan || 0) / it.conv : (it.quan || 0)), unit: it.unit || '' });
      }
    });
    return rows;
  }

  function fmtQty(q) {
    var n = Number(q) || 0;
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // JOB page — 1 กลุ่มตัวอักษร = 1 หน้า (ตาม C# ListSTK_OnePage + multi-page block)
  function createJobPage(o, cond, gdata, routes) {
    var route = (routes && o.job && routes[o.job]) ? routes[o.job] : (o.job || '');
    var isForward = (o.desc || '').indexOf('ส่งต่อ') !== -1;
    var memoFlat = String(o.memo || '').split(String.fromCharCode(13, 10)).join(' ');
    var receiverText = isForward
      ? memoFlat
      : (o.customerName || '') + '\n' + (o.district || '');
    // ชื่อผู้รับ — font ตาม input (ขนาดอักษรชื่อผู้รับ — default 42)
    var rf = state.receiverFont || 42;
    var rows = genStkRows(gdata.items, cond);
    var vn = o.document;

    var html = '<div class="p054-job-page" data-p054-cond="' + esc(cond) + '">';
    // header (50/250/250) — Route + barcode รหัส + barcode JOB Open
    html += '<table class="p054-job-header">' +
      '<colgroup><col style="width:50pt"><col style="width:250pt"><col style="width:250pt"></colgroup>' +
      '<tr>' +
      '<td class="p054-job-hdr-route"><div class="p054-job-hdr-route-cap">Route</div><div class="p054-job-hdr-route-val">' + esc(route) + '</div></td>' +
      '<td><div class="p054-job-hdr-bc-text">' + esc(vn) + '</div><div id="p054jbc' + o.id + 'm' + esc(cond) + '"></div></td>' +
      '<td><div class="p054-job-hdr-open">JOB Open</div><div id="p054jbc' + o.id + 'o' + esc(cond) + '"></div></td>' +
      '</tr>' +
      '</table>';
    // receiver — 2 คอลั่น 50/500 — แถว 1 colspan 2 "ผู้รับ" — แถว 2 col1 ว่าง + col2 ชื่อ
    html += '<table class="p054-job-receiver">' +
      '<colgroup><col style="width:50pt"><col style="width:500pt"></colgroup>' +
      '<tr><td class="p054-job-receiver-cap" colspan="2">ผู้รับ</td></tr>' +
      '<tr><td></td><td class="p054-job-receiver-body" style="font-size:' + rf + 'px">' + esc(receiverText) + '</td></tr>' +
      '</table>';
    // items (20/75/325/70/60 — TOP_BORDER)
    html += '<table class="p054-job-items">' +
      '<colgroup><col style="width:20pt"><col style="width:75pt"><col style="width:325pt"><col style="width:70pt"><col style="width:60pt"></colgroup>' +
      '<thead><tr>' +
      '<th></th>' +
      '<th>รหัส</th>' +
      '<th>รายละเอียด</th>' +
      '<th class="p054-item-qty">จำนวน</th>' +
      '<th>หน่วย</th>' +
      '</tr></thead><tbody>';
    if (rows.length === 0) {
      html += '<tr><td colspan="5" class="p054-item-empty">— ไม่มี item —</td></tr>';
    } else {
      rows.forEach(function (r) {
        html += '<tr>' +
          '<td class="p054-item-char"></td>' +
          '<td class="p054-item-code">' + esc(r.code) + '</td>' +
          '<td class="p054-item-desc">' + esc(r.desc) + '</td>' +
          '<td class="p054-item-qty">' + esc(r.qty) + '</td>' +
          '<td class="p054-item-unit">' + esc(r.unit) + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table>';
    // packing (20 — right)
    html += '<div class="p054-job-packing">' + esc(gdata.packing || '') + '</div>';
    // footer (275/275) — vn-cond + JOB Close + 2 barcodes
    html += '<table class="p054-job-footer">' +
      '<colgroup><col style="width:275pt"><col style="width:275pt"></colgroup>' +
      '<tr><td>' + esc(vn + '-' + cond) + '</td><td>JOB Close</td></tr>' +
      '<tr><td><div id="p054jbc' + o.id + 'f' + esc(cond) + '"></div></td><td><div id="p054jbc' + o.id + 'c' + esc(cond) + '"></div></td></tr>' +
      '</table>';
    html += '</div>';
    return html;
  }

  // draw JOB pages — หลังหน้า 1 ของแต่ละ row ที่เลือก
  function drawJobPages(groupsMap, routes) {
    var el = _el;
    var pages = el.zoomWrap.querySelectorAll('.p054-page');
    var jobPages = [];
    pages.forEach(function (pg) {
      var bcText = pg.querySelector('.p054-lbl-bc-text');
      if (!bcText) return;
      var vn = bcText.textContent;
      var g = groupsMap[vn];
      if (!g || !g.conditions || g.conditions.length === 0) return;
      var row = null;
      for (var i = 0; i < state.rows.length; i++) {
        if (state.rows[i].document === vn) { row = state.rows[i]; break; }
      }
      if (!row) return;
      var wrap = document.createElement('div');
      wrap.className = 'p054-jobs';
      var inner = '';
      g.conditions.forEach(function (cond) {
        var gd = g.data[cond] || { items: [], packing: '' };
        inner += createJobPage(row, cond, gd, routes);
      });
      wrap.innerHTML = inner;
      pg.parentNode.insertBefore(wrap, pg.nextSibling);
      // barcodes (4 ตัวต่อหน้า — vn / O-vn-X / vn-X / C-vn-X)
      wrap.querySelectorAll('.p054-job-page').forEach(function (jpage) {
        var cond = jpage.getAttribute('data-p054-cond') || '';
        var hM = jpage.querySelector('#p054jbc' + row.id + 'm' + cond);
        var hO = jpage.querySelector('#p054jbc' + row.id + 'o' + cond);
        var hF = jpage.querySelector('#p054jbc' + row.id + 'f' + cond);
        var hC = jpage.querySelector('#p054jbc' + row.id + 'c' + cond);
        if (hM) hM.innerHTML = barcodeSVG(vn, 150, 50);
        if (hO) hO.innerHTML = barcodeSVG('O-' + vn + '-' + cond, 150, 50);
        if (hF) hF.innerHTML = barcodeSVG(vn + '-' + cond, 150, 50);
        if (hC) hC.innerHTML = barcodeSVG('C-' + vn + '-' + cond, 150, 50);
        jobPages.push(jpage);
      });
    });
    return jobPages.length;
  }

  function renderPreview() {
    var el = _el;
    var sel = state.rows.filter(function (o) {
      return state.selected[o.id];
    });
    var fontPt = 16;

    // fetch Route (BI_CUBE.dbo.JOB_TransportRoute — ตาม JOBcode) → render
    var jobs = [];
    sel.forEach(function (o) {
      if (o.job && jobs.indexOf(o.job) === -1) jobs.push(o.job);
    });

    var draw = function (routes, itemsMap, groupsMap) {
      // 1 แถวที่เลือก = 1 หน้า A4 (label + items + notes) — ขึ้นหน้าใหม่หลังจบตาราง 3
      var html = '';
      sel.forEach(function (o) {
        html += '<div class="p054-page">' + createLabel(o, fontPt, routes) + '</div>';
      });
      el.zoomWrap.innerHTML = html;

      // barcode ส่วนละ (หลัง insert DOM)
      sel.forEach(function (o) {
        var holder = el.zoomWrap.querySelector('#p054bc' + o.id);
        if (holder) holder.innerHTML = barcodeSVG(o.document);
      });

      // table 2 = items (ใต้ label)
      drawItemTables(itemsMap);

      // JOB pages — 1 กลุ่มตัวอักษร = 1 หน้า (หลังหน้า 1 ของแต่ละ row)
      var jobCount = drawJobPages(groupsMap, routes);

      var total = sel.length + jobCount;
      el.modalSub.textContent = sel.length + ' ป้าย · ' + total + ' หน้า A4';
      applyZoom();
      el.modal.classList.add('open');
      el.modalBody.scrollTop = 0;
      document.body.style.overflow = 'hidden';
    };

    var vnList = sel.map(function (o) {
      return o.document;
    });

    var pRoutes = (jobs.length === 0)
      ? Promise.resolve({})
      : fetch('api/p054_routes.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: CONNECTION, jobs: jobs })
      }).then(function (r) {
        return r.json();
      }).then(function (d) {
        return d && d.ok ? (d.routes || {}) : {};
      }).catch(function () {
        return {};
      });

    var pItems = (vnList.length === 0)
      ? Promise.resolve({})
      : fetch('api/p054_items.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: CONNECTION, vnos: vnList })
      }).then(function (r) {
        return r.json();
      }).then(function (d) {
        return d && d.ok ? (d.items || {}) : {};
      }).catch(function () {
        return {};
      });

    var pGroups = (vnList.length === 0)
      ? Promise.resolve({})
      : fetch('api/p054_groups.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId: CONNECTION, vnos: vnList })
      }).then(function (r) {
        return r.json();
      }).then(function (d) {
        return d && d.ok ? (d.groups || {}) : {};
      }).catch(function () {
        return {};
      });

    Promise.all([pRoutes, pItems, pGroups]).then(function (res) {
      draw(res[0], res[1], res[2]);
    });
  }

  function applyZoom() {
    var el = _el;
    if (!el || !el.zoomWrap) return;
    el.zoomWrap.style.zoom = state.zoom;
    el.zoomLbl.textContent = Math.round(state.zoom * 100) + '%';
  }

  function setZoom(z) {
    if (z < 0.25) z = 0.25;
    if (z > 2.5) z = 2.5;
    state.zoom = z;
    applyZoom();
  }

  function fitZoom() {
    var el = _el;
    if (!el || !el.modalBody) return;
    var aw = el.modalBody.clientWidth - 40;
    var ah = el.modalBody.clientHeight - 40;
    if (aw <= 0 || ah <= 0) return;
    var fit = Math.min(aw / 794, ah / 1123);
    setZoom(fit);
  }

  function openPreview(root) {
    var el = _el;
    var sel = state.rows.filter(function (o) {
      return state.selected[o.id];
    });
    if (!sel.length) {
      toast(root, 'กรุณาเลือกรายการอย่างน้อย 1 รายการ', true);
      return;
    }
    renderPreview();
  }

  function closePreview(root) {
    _el.modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.P054Packing = {
    mount: function (root) {
      if (!root) return;
      if (!document.getElementById('p054-packing-style')) {
        var st = document.createElement('style');
        st.id = 'p054-packing-style';
        st.textContent = CSS;
        document.head.appendChild(st);
      }
      renderRoot(root);
      _root = root;
      _el = {
        date: document.getElementById('p054Date'),
        status: document.getElementById('p054Status'),
        search: document.getElementById('p054Search'),
        btnSearch: document.getElementById('p054BtnSearch'),
        btnReset: document.getElementById('p054BtnReset'),
        inputReceiverFont: document.getElementById('p054ReceiverFont'),
        resultText: document.getElementById('p054ResultText'),
        selCount: document.getElementById('p054SelCount'),
        btnSelAll: document.getElementById('p054BtnSelAll'),
        btnPreview: document.getElementById('p054BtnPreview'),
        selectAll: document.getElementById('p054SelectAll'),
        body: document.getElementById('p054Body'),
        pagination: document.getElementById('p054Pagination'),
        modal: document.getElementById('p054Modal'),
        modalBody: document.getElementById('p054ModalBody'),
        zoomWrap: document.getElementById('p054ZoomWrap'),
        zoomLbl: document.getElementById('p054ZoomLbl'),
        zoomIn: document.getElementById('p054ZoomIn'),
        zoomOut: document.getElementById('p054ZoomOut'),
        zoomFit: document.getElementById('p054ZoomFit'),
        modalSub: document.getElementById('p054ModalSub'),
        modalClose: document.getElementById('p054ModalClose'),
        btnPrint: document.getElementById('p054BtnPrint')
      };

      // วันที่ค้นหา = วันปัจจุบัน (yyyy-mm-dd)
      (function () {
        var d = new Date();
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        state.today = d.getFullYear() + '-' + m + '-' + day;
        _el.date.value = state.today;
      })();

      _el.btnSearch.addEventListener('click', function () {
        doSearch(root);
      });
      _el.search.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          doSearch(root);
        }
      });
      _el.inputReceiverFont.addEventListener('change', function () {
        state.receiverFont = parseInt(_el.inputReceiverFont.value, 10) || 42;
      });
      _el.btnReset.addEventListener('click', function () {
        _el.search.value = '';
        _el.status.value = '32';
        _el.date.value = state.today;
        state.rows = [];
        state.searched = false;
        state.selected = {};
        state.page = 1;
        renderTable(root);
      });
      _el.btnSelAll.addEventListener('click', function () {
        var start = (state.page - 1) * PAGE_SIZE;
        var pageRows = state.rows.slice(start, start + PAGE_SIZE);
        var all = pageRows.length > 0 && pageRows.every(function (o) {
          return state.selected[o.id];
        });
        pageRows.forEach(function (o) {
          state.selected[o.id] = !all;
        });
        renderTable(root);
      });
      _el.selectAll.addEventListener('change', function () {
        var start = (state.page - 1) * PAGE_SIZE;
        var pageRows = state.rows.slice(start, start + PAGE_SIZE);
        pageRows.forEach(function (o) {
          state.selected[o.id] = _el.selectAll.checked;
        });
        renderTable(root);
      });
      _el.pagination.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-p054-page]');
        if (!btn || btn.disabled) return;
        goPage(parseInt(btn.getAttribute('data-p054-page'), 10));
      });
      _el.body.addEventListener('click', function (e) {
        var tr = e.target.closest('tr[data-p054-row]');
        if (!tr) return;
        var id = parseInt(tr.getAttribute('data-p054-row'), 10);
        state.selected[id] = !state.selected[id];
        renderTable(root);
      });
      _el.btnPreview.addEventListener('click', function () {
        openPreview(root);
      });
      _el.modalClose.addEventListener('click', function () {
        closePreview(root);
      });
      _el.modal.addEventListener('click', function (e) {
        if (e.target === _el.modal) closePreview(root);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && _el && _el.modal && _el.modal.classList.contains('open')) {
          closePreview(root);
        }
      });
      _el.zoomIn.addEventListener('click', function () {
        setZoom(state.zoom + 0.1);
      });
      _el.zoomOut.addEventListener('click', function () {
        setZoom(state.zoom - 0.1);
      });
      _el.zoomFit.addEventListener('click', function () {
        fitZoom();
      });
      _el.btnPrint.addEventListener('click', function () {
        var holder = document.createElement('div');
        holder.className = 'p054-printroot';
        holder.innerHTML = _el.zoomWrap.innerHTML;
        document.body.appendChild(holder);
        window.print();
        document.body.removeChild(holder);
      });

      renderTable(root);
    },
    destroy: function () {
      _el = null;
    }
  };
})();
