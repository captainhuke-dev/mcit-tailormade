# TailorMade_web ERP Portal — เอกสารองค์ความรู้ (Handoff)

> สรุปงานทั้งหมดรายวัน เพื่อให้ AI อื่น (เช่น ChatGPT) เข้ามาทำงานต่อได้
> วันที่สรุป: 11/09/2026 (พ.ศ. 2569)

---

## 1. ภาพรวมโปรเจกต์

- **Project:** `C:\AppServ\www\TailorMade_web` — รันที่ `http://localhost:8080/TailorMade_web`
- **Stack:** HTML5 + PHP 8.3 (AppServ 9.3.0 — `C:\AppServ\php8`) + Vanilla JS SPA (ไม่มี framework) + Bootstrap 5 บางหน้า
  - หมายเหตุ: `php` ใน git-bash = CLI PHP 7.3 (`C:\AppServ\php7` — ไม่มี pdo_sqlsrv) — Apache ใช้ PHP 8.3
- **โครงสร้างหลัก:**
  - `index.php` — shell: ใส่ `window.ERP_MODULES` (จาก `data/modules.php`), `window.ERP_USER`, `window.ERP_START_PAGE` (จาก `?page=`), โหลด script ทุกโมดูล + `portal.js`
  - `data/modules.php` — menu: modules → groups → programs; item: `["id"=>"P111","name"=>"...","status"=>"ready"]` (status ready = "✓ พร้อมใช้งาน" / ไม่มี = "🛠 อยู่ระหว่างพัฒนา")
  - `data/connections.json` — DB connections (รหัสผ่านอยู่ในไฟล์นี้ — **อย่า leak ไปภายนอก**)
  - `api/lib/db.php` — `getDb($connId)` เชื่อม 3 ประเภท (SQL Server/MySQL/PostgreSQL)
  - `api/*.php` — PDO endpoints
  - `assets/js/portal.js` — SPA: dashboard, module/group page, program page, settings, command palette
  - `assets/js/p<id>-*.js` — IIFE program apps — ทุกตัวต้อง expose `window.P<id>Name = { mount }` ไม่งั้น mount เงียบ
  - `assets/css/portal.css` — theme vars (light/dark)
  - `demo/` — prototype HTML ของแต่ละโมดูล (P032_demo.html, P033_demo.html ฯลฯ)

- **Deep link:** `?page=program:P111` (ไม่ใช่ `?page=P111`)

### DB Connections (id จาก connections.json)
| id | ระบบ | รายละเอียด |
|---|---|---|
| `c1788405276741` | local | MySQL ท้องที่ |
| `c1788406814359` | **MAC5** | SQL Server 192.168.0.10 / M5CM-AA-01 — ใช้กับ P063/P064/P031/P032/P111 |
| `c1788855932701` | Nas200 | MySQL 192.168.0.200 / db `tms_mobile` user `mct` — P115/P128 |
| `c1789008966784` | Nas199 | MySQL 192.168.0.199 / db `mct_mobile` — P022 |

### Status โมดูลทั้งหมด ( ณ 11/09/2026)
| ID | ชื่อ | Status |
|---|---|---|
| P063 | KTV (พิมพ์ใบกำกับภาษี) | ready |
| P064 | MCIT (พิมพ์ใบกำกับภาษี) | ready |
| P115 | TMS View Picture (ฝ่ายขาย) | ready |
| P128 | TMS View Picture (จัดส่ง) | ready |
| P022 | View Billing Document | ready |
| P031 | รายงานเงินโอนประจำวัน | ready |
| P032 | รายงานเงินมัดจำประจำวัน | ready |
| P111 | เปลี่ยนสถานะ SO รอโอน | ready |
| P050 | ใบวางบิล (search + ใบวางบิล + ใบเสร็จรับเงิน) | ready |
| P013 | ใบอนุมัติสั่งขายและปรับวงเงิน | ready (1 หน้า — รายงานใบอนุมัติวงเงิน real data ทั้ง 6 ตาราง + พิมพ์ multi-paper + printN+1) |
| P033 | รายงานลูกค้าที่มียอดค้างเกินวงเงิน | ready (1 หน้า — real data MAC5 3 modes + preview A4 Landscape multi-page + zoom + พิมพ์เอกสาร) |
| P035 | ตรวจสอบลูกค้าติดอนุมัติ | ready (1 หน้า — real data MAC5 + checkbox เกรด X + pager 15/หน้า + detail modal) |
| P053 | สติ๊กเกอร์ 10x7.5 (ใบปะ) | ready (rewrite ตาม C# MCIT_Frm_FaceSheetProduct_10x7 — real data MAC5 + logic A/B + totalCopy + company + table 280pt 4 คอลั่น border 0 + THSarabunNew web font + zoom 100% + หน้าถัด ๆ + พิมพ์ 1 ตั๋ว/หน้า 282×210pt) |
| P052 | สติ๊กเกอร์ 10x10 (ใบปะ) | ready (1 หน้า — real data MAC5 ตาม C# MCIT_Frm_FaceSheetProductV2 + logic A/B + table 280pt 3 คอลั่น + THSarabunNew web font + font pt + zoom 100% + พิมพ์ 1 ตั๋ว/หน้า 282×282pt) |
| P054 | Packing Order/Cartonize/ใบจัดกล่อง | ready (1 หน้า label+items+notes + หน้า JOB 1 กลุ่มตัวอักษรต้น MILvCol2 = 1 หน้า A4 — real data MAC5 — สไตล์ P063 + preview A4 + barcode + พิมพ์) |
| P092 | พิมพ์ Barcode/สคบ. | ready (1 หน้า — real data MAC5 3 APIs + modal ตั้งค่า 3 blocks + layouts small/medium/large/large10x7 ตาม C# + EAN13 JsBarcode SVG + S/N running + พิมพ์ตามขนาดกระดาษ) |
| P037 | ตรวจสอบของจองที่มีการเปิดบิล | ready (1 หน้า — real data MAC5 3 APIs + search วันที่/เลขที่ใบสำคัญ (คำนำหน้า LIKE)/รหัสลูกค้า (LIKE) + **ตาราง INV = เฉพาะใบแจ้งหนี้ที่มี RSV เชื่อมโยง** (LEFT JOIN subquery + RSVvnos IS NOT NULL) + **ตาราง RSV = API แยก `p037_rsv.php` ตามลูกค้าที่เลือก (exact)** — fetch ตอนคลิกแถว + **pagination 10 รายการ/หน้า (ทั้ง 2 ตาราง — pager กป๋านหัวหน้า ‹ 1 2 3 › + "หน้า X / Y" ซ้าย)** + **RSV ตัด column ชื่อลูกค้าออก + INV ตัด column No. ออก** + **ตารางเต็มกว้าง (10 แถวพอดี — ไม่มี scroll)** + click row = select 1 แถว + dblclick = modal items INV vs RSV) |
| P047 | เช็คสถานะ Invoice | ready (1 หน้า — real data MAC5 `p047_search` — range วันที่ (default วันปัจจุบัน~วันปัจจุบัน) + สถานะ dropdown (AR_S < 63 + NOT IN — 32 สถานะ) + ตาราง Invoice (MIH IS + cancel=0 + status IN + range — วันที่/เลขที่/รหัส/ชื่อ/สถานะ badge/จำนวนพิมพ์ — เฉพาะอ่าน) + **pagination 15 รายการ/หน้า** + quick search + sort column + select row) |
| P015 | สถานะบิลค้างรับ | ready (1 หน้า — real data MAC5 2 APIs `p015_search`/`p015_status` — ค้นหารหัสลูกหนี้ (LIKE vnos/cus/name — **ต้องมีค่า >= 1 ตัวอักษร**) + ตารางบิลค้างรับ (CFS CFSclearALL=0 + net != 0 — วันที่/เลขที่/รหัส/ชื่อ/เขต/ยอดหนี้/วางบิล/ค้างบิล/หมายเหตุ — display — หมายเหตุ 26% + wrap) + **pagination 15 รายการ/หน้า** + sort column + **ดับเบิลคลิกแถว = modal แก้ไข (checkbox วางบิล/ค้างบิล exclusive + หมายเหตุ) + บันทึกทีละแถว** (upsert `BI_CUBE.tb_CFS_bill_status`)) |
| P051 | รายงานการเก็บเงินสด | ready (1 หน้า — real data MAC5 `p051_search` — เงื่อนไข ทั้งหมด/เงินสด (MIHdesc) + สถานะ (MIHstatus IN — ตัวอย่าง 43,44,60) + ตาราง 6 คอลั่น (เลขใบสำคัญ/วันที่/รหัสลูกค้า/ชื่อลูกค้า/ผู้แทน/ยอดเงินสุทธิ) + **pagination 15/หน้า** (ปุ่ม ‹ น.หน้า ›) + quick search + sort + row select + **export CSV = server-side `p051_export` (cp874 — Excel ไทยเป็นตาราง)** + พิมพ์ A4 landscape = ทั้งหมด) |
| P008 | ใบปะหน้าเก็บบัญชี VAT, No VAT V2 | ready (2 phases — real data MAC5 3 APIs `p008_search`/`p008_groups`/`p008_report` — clone C# MCIT_FrmAccountServiceGUI_VATversion_V2 — หน้า 1 สรุป (JS pagination A4 + ชื่อลูกหนี้บนตาราง + spacer 15px) + หน้า 2 ส่งกลับบริษัท + หน้า 3 สำหรับลูกค้า (T4 ใบเสร็จรับเงิน) + modal ตัวอย่างก่อนพิมพ์ + zoom + แยกบิลตามเดือน — cache v=20261006g) |
| P129 | Print Invoice KTV (BKK) | ready (clone P063 + flag BKK — 3 APIs `p129_invoices`/`p129_report`/`p129_markprint` — หน้าค้นหา 15/หน้า + รายงาน 3 หน้า (ใบแจ้งหนี้ สำหรับลูกค้า / ใบส่งสินค้า / Invoice copy) — font THSarabunNew — T4 + ช่องทางชำระเงิน + QR TTB 90×90 — cache v=20261007c) |
| P019 | เช็คสถานะส่ง Invoice | ready (clone demo/P019-demo + C# frm_CheckStatusInvoiceGUI — 2 APIs `p019_invoices`/`p019_status` (AR_S) — วันที่ from–to (default วันนี้) + สถานะ dropdown 62/63/65/67/68/70 + table 6 คอลั่น sort/quick/row select + pagination 15 (เลข 5 ปุ่ม) — cache v=20261008a) |
| P006 | Print Invoice เช็คคืน | ready (clone demo/P006-demo + C# MCIT_FrmPrintChqueReturnGUI — 3 APIs `p006_search`/`p006_report`/`p006_markprint` — launcher 4 field 2×2 (วันที่ Invoice/ผู้สร้าง/คำนำหน้า 18/สถานะ 14) + table 9 คอลั่น (row แดง cnt>=11) + report 2 หน้า/ใบ A4 portrait (T1 12pt ยกเว้น DEBgrade 18pt ชิดขวาบรรทัดกำหนดส่งของ · T2 MCIT 50/250/50/50/50/40/60 พาราเทค 300/50/50/50/40/60 · T3 250/110/110/80 12pt แถว 26px) — cache v=20261009h) |
| P130 | Print Invoice MCIT (BKK) | ready (clone P064 + flag BKK — 3 APIs `p130_invoices`/`p130_report`/`p130_markprint` — รายงาน 3 หน้า — font THSarabunNew — T4 7 แถว + ช่องทางชำระเงิน + QR TTB 90×90 (หน้า 1+3) + COD blank payterm — หน้า 2 thead 28px + แถว 40px — cache v=20261008a) |
| P059 | จัดเก็บเอกสารลูกค้า (SO Image) | ready (clone demo/P059-demo + C# AppSOimage — 5 APIs `p059_search`/`p059_detail`/`p059_image`/`p059_save`/`p059_so_list` — launcher New+search + table 7 คอลั่น TOP 100 + **pagination 15/หน้า** + view modal (แก้ไขภาพ→dropzone/ลบ/บันทึก + zoom −/+/fit/Ctrl+Wheel) + new modal (**SO autocomplete TOP 10** LIKE kw% + dropzone) + soft delete + upload FTP NAS + report A4 1 ภาพ/หน้า — user ยืนยัน 2026-10-12 — cache v=20261010k) |
| P103 | ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง | ready (clone demo/P103_demo + C# frm_CheckCOST_GUI/frm_selectSTK — 2 APIs `p103_stk`/`p103_cost` — launcher (รหัส/ชื่อ + ปุ่มเลือก picker **limit 15** + **ปุ่มค้นหาต่อชื่อสินค้า** + กลุ่มคลัง 9 default G01+G06 **กรอบ border+bg อ่อน**) + **stock cards 5** + **tables 3** (PR/PO/RE TOP 5 — **เต็มพื้นไม่มี scrollbar**) — **4 กาด summary ตัดออก** — user ยืนยัน 2026-10-12 — cache v=20261012d) |
| P045 | ตรวจสอบบิลลูกค้าเดียวกัน | ready (clone demo/P045-demo + C# **AppForCheck/frm_CheckBillMorethanOne_GUI** (user ยืนยัน 2026-10-13) — 2 APIs `p045_samebill`/`p045_detail` — launcher (วันที่ default วันนี้ + รหัสลูกค้า + ปุ่มค้นหา) + table 5 คอลั่น (badge สี 2=ฟ้า 3=เหลือง >=4=แดง) + sort + quick search + footer — **modal view detail (คลิกลูกค้า): ตาราง 3 คอลั่น (วันที่/เลขที่ + สถานะ/จำนวน + รายการสินค้า) — item-row (ลำดับ+รหัส | qty หน่วย | ชื่อ) — expand ทั้งหมดตั้งแต่เปิด — ตัด modal search — appendChild body + min-height:0 = centered + scroll** — user ยืนยัน 2026-10-13 — cache v=20261013g) |
| P039 | ตรวจสอบตัดของเกิน SO | ready (clone demo/P039_demo + C# FrmCheckCutSOGUI — 1 API `p039_cutso` (3 modes: **product** stkCUT>stkREQ / **amount** sumREQ>sumCUT1 + STKgroup≠SV / **complete** stkCUT=stkREQ + STKgroup≠SV — CPS LEFT JOIN DEB/STK + CPSclearUSER=0/CPSclearALL=0 + date range) — launcher (date from-to default -90d + **mode 3 ปุ่ม = กดค้นหาทันที** — ตัดปุ่มค้นหา) + table 11 คอลั่น (sort + quick search + excess highlight) — **4 กาด summary ตัดออก** — user ยืนยัน 2026-10-12 — cache v=20261012b) |
| P036 ฯลฯ | อื่น ๆ | placeholder |

---

## 2. รายงานรายวัน

### 15/10 — P081 พร้อมใชงาน (READY)
- หมาย status `ready` ใน `data/modules.php` (commit นี้)
- สรุปงาน P081: หนาจอเลือกวันที่/Route/สถานะ/กลุ่ มคลัง + ปุ่ มค้นหา (flat list, 15 รายการ/หน้า, pager, animation) + ปุ่ มสรางเอกสาร (ตองมมีราย การค้นหากอน) + modal รายงาน A4 (THSarabunNew, ขอบ 25/20pt, 6 คอลั่ ม 70/220/70/70/60/60pt, font 16/14/12/12/10pt, header ซ้ำทุกหน้า, Page N of N ดานบนชิดขวา, ตัดหน้าอัติโนมัติ, zoom −/+ 25%)
- สถานะ dropdown: 12 ตัวเลือก (6,17,42–45,50–55), ตัด 68-test ออก
- Cache `v=20261014ff`

### 15/10 — P081 ขอบ 20pt ทัง 4 ด้าน + footer Page N of N ทุกหน้า (commit `56b37c0`)
- `@page{margin:20pt}` + `.p081-page` padding `20pt` (ตังเดยีวกกันทังบนจอ/พิมพ)
- `.p081-page` เป็น flex column + `.p081-r-foot{margin-top:auto}` → footer ติดท้ ายกระดาษทุกหน้า; หน้า cont มี `<div class="p081-r-foot">` ของตวัเอ ง
- rerun `pag()` on load + fonts.ready + resize
- CDP pass: footMissing=0, lastInside=0 (over=0), `Page 1 of 3`...`Page 3 of 3` — cache `v=20261014x`

### 15/10 — P081 ตัดหน้า A4 อัติโนมั ติเมือรายการล้น (commit `f16d87f`)
- `.p081-page` เป็น `height:297mm;overflow:hidden` (กระดาษ A4 คงทิสองดา้น)
- สคริปตใน iframe (`pag()`): แถวที่ล้นความสูงกระดาษ (วดด้วย `sheetOver` เทียบกบ Footer) จะถูกย้ายไปหน้าใหมอัติโนมั ติ พรอมทำ `thead` + `Page N of N` ใหมทุกหน้า
- รัน `pag()` หลัง `document.fonts.ready` (ฟอนตกวามสูงเซตแลว) + หลัง `fit()`; ปุ่ ม ⤡ ยอ่/ขยายจะเรินวด `pag()` ใหเอง
- ตอนพิมพ: `@page A4` + `page-break` ของ browser จัดหน้าเอง (สคริปตไมก่ ีจริงเพราะ `@media print` ปลด `overflow`)
- CDP pass: 3 หน้า 37/40/17 แถว ทุกหน้ามี thead, `lastInside:true` (ล้นเป็น 0), `Page 1 of 3`...`Page 3 of 3` — cache `v=20261014v`

### 14/10 — P081 หัวเอกสารออกนอกตาราง (commit `08ab96d`)
- ย้าย `PickList Summary [By Route_TMS]` + ประจำวันที่ + พิมพเมื่อ จากใน `<table>` (tr colspan=6) ออกมาเป็น div บนสุดของ `.p081-page`
- `<thead>` เหลแคแถวหัวคอลั่ ม 6 คอลั่ ม (ยังซ้ำทุกหน้าตอนพิมพ)
- CDP: titleInTable=false, theadRows=1 — cache `v=20261014t`

### 14/10 — P081 ตารางรายงาน 6 คอลั่ ม 70/220/70/70/60/60pt (commit `789fb87`)
- เพิ่ ม `<colgroup><col style="width:70pt">...` ข้างใน `<table>` (หน้ า thead) เพราะ `nth-child` บน th ลวมกบคอลั่ ม `colspan=3` ของแถบบกลุ่ ม
- CDP: คอลั่ ม 82/259/82/82/71/71px ตอนย่ อ = สัดส่วย 70/220/70/70/60/60 ครบ — cache `v=20261014s`

### 14/10 — P081 รายงานตองประกาศ @font-face ใน srcdoc (commit `a63a812`)
- srcdoc iframe = เอกสารอิสระ, ไม่ได้รบั `fonts.css` จาก parent → ตองประกาศ `@font-face` THSarabunNew (400 + Bold 700) ใน css ของ `reportDocHtml()` เอง (src สมั พทั ธ์ `assets/fonts/...` เทียบกบั base URL ของหน้ าพาหนะแลวได้เอง)
- CDP pass: `d.fonts` = 400 loaded + 700 loaded, computed family = THSarabunNew — cache `v=20261014r`

### 14/10 — P081 ขนาด font รายงาน (commit `9668483`)
- หัวเรื่ อง 16pt B, ประจำวันที่ 14pt B, พิมพ์เมื่อ 12pt, th/td 12pt, Page N of N 10pt
- CDP pass: 21.33/18.67/16/16/16/13.33px = 16/14/12/12/12/10pt — cache `v=20261014q`

### 14/10 — P081 preview เป็นกระดาษ A4 ใน modal (commit `42c562a`)
- สาเหตุกอนหนานี้ไม่เเป็นกระดาษ: iframe doc `width:100%` ฉายเเน่นกรอบ, ไมมีขอบกระดาษ
- ภายใน iframe: `body` ทาเทา `#f1f5f9`, `.p081-page` = กระดาษขาว `210mm x 297mm` (min-height) center ด้วย `margin:0 auto` + padding 10pt/20pt ตาม margin A4 จริง
- สคริปต์ `zoom` ใน iframe: สเกลกระดาษ 794px ใหพอดีกวามกวางกรอบ (เฉพาะ screen; `@media print` รีเซ็ต `zoom:1` + `width:100%` เพื่ อ A4 จริงจาก `@page`)
- CDP: frame 697px → sheet 695px (พอดี, ไมลนั ง) + vision pass: กระดาษขาวคร่อมเทา, 6 คอลั่ มครบ, ปุ่ ม ⤢ อยหูวั modal — cache `v=20261014p`

### 14/10 — P081 modal รายงานเต็ มหน้ า + ปุ่ มยอ่ /ขยาย (commit `977c2cb`)
- modal กลายเป็นเต็ มหน้ า (width/height 100%, overlay padding 10px) — เดิม `max-width:960px`
- ปุ่ ม `⤢` (id `p081RepZoom`) สลับ `.compact`: กรอบแคบ 660px (≈คอลั่ ม A4) ↔ เต็ มหน้ า; ไอคอนสลับ `⤢`/`⤡` + title "ยอ่"/"ขยายเต็ มหน้ า"
- CDP pass: FULL 721px (vw 756) → compact 660px → กลบั 721px ✓ — cache `v=20261014n`

### 14/10 — P081 รายงาน A4 ตัดหน้าใหมอัติโนมัติเมือรายการล้น (commit `e7b2d41`)
- ย้ายหัว (title+date+caption) เข้าระดานหวัใน `thead` (colspan 6) + คอลั่ มหัวใน `thead` เดยีวกั น → ตอนดูลบนจอ/พิมพ์ แสดงหัวซ้ำทุกหน้า, แถวรายการล้นตัดไปหน้าใหมเอง
- `@media print` ใช้ `page-break-after:always` ระหว่างสายส่ ง + `page-break-inside:auto` ให แถวแตกหน้าได
- Verified: 60-row doc → printToPDF 3 A4 หน้า, หัว (title+คอลั่ ม) ซ้ำทุกหน้า, 24/24/12 แถว; M4 จริง 5 กลุ่ ม = 1 หน้า — cache `v=20261014m`

### 14/10 — P081 รายงาน: Route col1 rowspan ตามจำนวนรายการจริง (commit `b96ba2d`)
- `span = it.rows.length` (เดิม `+1`) — 1 รายการ 1 แถวรายละเอยี ด = rowspan 1 ตามแบบ
- CDP fresh tab: routeCells `["1","1","1","1","1"]` (5 items, 10 tbody rows) — cache `v=20261014l`
- Pitfall: tab เกา่ ค้างใน Edge CDP ทำให้อ่าน JS เวอร์ชน์ เกา่ — ปิ ด tab เกา่ ใหหมดกอนวัด

### 14/10 — P081 แก้ไขรายงาน A4 ตามสเปค (commit `206eedf`)
- `@page A4 margin:10pt 20pt` (บน-ลาง 10pt, ซ้าย-ขวา 20pt), หน้ากระดาษ `body{margin:0}`; ระวัง้ `@page` ของ Chrome ไม่รอบั 4-tuple ครบทุกเคส — ใช้ 2-tuple
- ระยะห่างระหว่างหน้า 10px (`.p081-page+.p081-page{margin-top:10px}` — ใชง้านบนจอ, `@media print` กลบัต่า 0)
- Font: หัวเรื่ อง 18pt B, ประจำวันที่ 15pt B, แถบ caption 12pt (หัว - 15 = ตรงตอ่ `ประจำวันที่ 15 ตุลาคม 2569`)
- ตาราง 6 คอลั่ ม 70pt/220pt/70pt/70pt/60pt/60pt (table-layout:fixed; col2 ชื่ อลูกค้ากว้างสุด)
- หัวคอลั่ มไม่ มีวรรคเกิน: `รหัส,ชื่ อสืนค้า`<br>`Route`, `เลขที่ ใบแจ้งหนี้`, `วันที่ ใบแจ้งหนี้`, `คงเหลือ`<br>`หน่วยนั บ`
- CDP measure (filter 14→15/10/2026, M4, 68): titleFs 24px(=18pt), dateFs 20px(=15pt), capFs 16px(=12pt), cols 102/302/102/102/89/89px, caption ตรงตำม, 1 หน้า, 0 errors — cache `v=20261014k`

### 14/10 — P081 ตารางรายการสืนค้าแบ่งหน้า 15 รายการ (commit `43dfba1`)
- แบ่งหน้า 15 รายการต่อหน้า, ปุ่ มเลื่ อนหน้าเป็น window 3–5 ปุ่ มตามจำนวณหน้า (window = min(5, total), อย่าน้อย 3 เมือ total >= 3) + ปุ่ ม 1/หน้าสุดท้ายกั บ `…` เมือหน้าไกล + prev/next Chevrons
- Footer: `แสดง A–B จาก N รายการสืนค้า`; หน้าแรก highlight = `.active`; 97 rows → ปุ่ ม `[1][2][3][4][5]…[7]` (cur 1) → `[1]…[3][4][5][6][7]` (cur 5)
- CDP pass: 19 rows → 2 หน้า (15+4), 97 rows → 7 หน้า, เลื่ อนถูกตอง, 0 errors — cache `v=20261014j`

### 14/10 — P081 หัวตาราง + แยกปุ่ มสร้างเอกสาร (commit `9a1d6e2`)
- หัวตาราง: `ผลการสร้างเอกสาร PickList` → `รายการสืนค้า PickList By Route`
- ปุ่ มสร้างเอกสาร: ทำตาม C# btnGenerate_Click — fetch แล้วเปิ ดรายงาน A4 อยา่ งเดี ยว, ไม่ re-render ตารางรายการสืนค้า (ตารางคังเดิ ม)
- CDP pass: H2 ตรงตามตัง, search → 97 rows คังอยูหลังเปิ ด overlay (iframe 1) — cache `v=20261014i`

### 14/10 — P081 ปุ่ มค้นหา animชั้ น wait (commit `7a377e6`)
- ระหว่าง fetch: ปุ่ มสลับเป็น "กำลังค้นหา..." + spinner (ใช้ `p081spin` เดิ ม, `.loading` class) + disabled — หลังสำเร็จกลบั เป็น "ค้นหา"
- CDP pass: LOADING state (text "กำลังค้นหา..." + cls loading + disabled) → DONE state (text "ค้นหา" + enabled + 19 rows) — cache `v=20261014h`

### 14/10 — P081 ปุ่ มค้นหา = flat-list API (commit `1472d05`)
- API ใหม่ `api/p081_search.php` — SQL ตามแบบของ user แบบ verbatim: MIH+MIL+STK+JOB_TransportRoute + SBLqty/RSVqty scalar subquery + STKsortID + Route, MIHtype='IS' + MILcut=-1 + NOT IN tb_FaceSheetSTK, วันที่จาก MILday/MILmonth/MILyear style 103, สถานะ = MIHstatus = ?, Route = ? เฉพาะเลือก (All = ไม่ มีบรรทัด), GROUP BY bare cols + ORDER BY STKgroup/STKsortID
- ปุ่ มค้นหาเรียกอAPIน้ีตรง ๆ (ไม่ผาน generate) → `state.mode="items"` → ตาราง 8 คอลั่ น (ลำดบั /Route/คลัง/รหสั สืนค้า/ชื่ อสืนค้า/คงเหลือ (SBL)/RSV/กลุ่ มสืนค้า) — 8 col = ตาม SQL output จริง
- Pitfall: GROUP BY ตองเป็น bare col (STKcode) — ไม่ ฉะนั้ น scalar subquery อาง C.STKcode ไม่ ได้ (ODBC "Column not contained in GROUP BY")
- curl test: status 68 + route M1 + 13..14/10 → ok 16 rows (~7s); first row 10010246 SBL=13 RSV=- — CDP pass: 16 rows / 8 cols / footer "แสดง 16 รายการสืนค้า" / badge "16 รายการ" / 0 errors — cache `v=20261014g`

### 14/10 — P081 กลุ่ มคลังเป็น box + ตัด titlebar (commit `e497539`)
- ตัดแถบหัว "PickList By Route" ออกจาก launcher card (breadcrumb แสดงชื่ ออยู่ แล้ว)
- box กลุ่ มคลัง: ขาว + border 1px #cbd9ec + radius 12px + padding, หััวชื่ อในกลุ่ มเป็น น้ ำเงิ น #1d4ed8 — cache `v=20261014f` — CDP + vision pass (titlebar gone, box ครบ, 0 errors)

### 14/10 — P081 กลุ่ มคลัง + ปุ่ มสร้างเอกสาร (commit `306f9a6`)
- กลุ่ มคลังเรี ยงลำดบั G01-G09,RTV,BKK (grid 5 คอลั่ น = 2 แถว), default checked = G01-G04 + RTV + BKK (ชุดเดิ่ ม)
- `All-ทั้ งหมด` + `กลุ่ มคลังสืนค้ า` + `สร้างเอกสาร` ตรง demo byte-exact (ตรวจด้วย compare script)
- ปุ่ ม "สร้างเอกสาร" ย้ายจากข้าง launcher → หัั ว panel ผลลัพท์ (`.p081-panel-actions` = badge + ปุ่ ม) อยู่ตอรายการสืนคาที่จะแสดง — ปุ่ มอยู่นอก form → ผูก click handler ตรง, สไตล์กระชั บ 42px, launcher-body 2-col — cache `v=20261014e` — CDP pass: groups sorted, checked 6, genBtn in panel-header, route option ตรง demo, 0 errors; vision OK

### 14/10 — P045 modal residue fix (commit `9d760a4`)
- modal P045 คางในหน้า index ด้านลางเมนู (เหมือนไม่ได้ถูกซ่อน) — สาเหตเวิ่่งเดี ยวกั บ P081: `<style>` append ใน `#p045Root` (ถููก ลบโดย `content.innerHTML` re-render) แต overlay ย้ายไป `document.body` (รอด) → หลังปิด/ออกหน้า = block ไม่มี CSS คาง
- แก: style → `document.head` (id `p045Style`, รอดทุก re-render), portal.js cleanup selector ขยายเป็น `body > .p081-rep-overlay, body > .p045-modal-overlay` — cache p045 `v=20261014e`, portal `v=20261014b`
- CDP pass (`cdp_p045_overlay.js`): mount styleInHead/overlay display none, open modal shown flex, close → none, leave page → overlays 0, return → 1 overlay + app mounted, 0 errors
- **Pitfall (generalizing):** modal/overlay ใดก่ ็ ติ่ มที่ appendChild ใน `document.body` ต้อง (1) สอด style ใน `document.head` (2) เพิ่ ม selector ของมันใน cleanup ของ `portal.js renderPage` — ไม่ฉะนั้ นจะคางทุกครั้ งที่อออกแบบโมดูล

### 14/10 — P081 PickList By Route — **DEV** (clone demo/P081_demo.html + C# AppPickListByRoute/frm_PickListByRouteGUI — commit `c6d625b`)
- API 2: `p081_routes.php` (DISTINCT Route จาก BI_CUBE.dbo.JOB_TransportRoute) + `p081_generate.php` (MIH+MIL+STK+JOB_TransportRoute, MIHtype='IS' + MILcut=-1 + กลุ่ มคลังผาน STOgroup + watis range + Route → group per Route)
- JS `p081-picklist-route.js` — `window.P081PickListRoute` — launcher (วันที่เอกสาร from-to default = เมื่อวาน→วันนี้, วันที่หัวเอกสาร, Route dropdown from DB, สถานะ 13 ตัว, กลุ่ มคลัง 9 checkbox default checked = G01,G04,G02,G03,RTV,BKK) + ปุ่ มสร้างเอกสาร + ตาราง 7 คอลั่ น (ลำดับ/เลขที่ PLR{route}-NNNN/Route/วันที่/กลุ่ มคลัง tag/จำนวนรายการ/สถานะ tag) + toast
- Pitfall: `selectedWarehouses()` ตอง selector `#p081Groups input:checked` (คลาสมี prefix p081- แลว) — v2
- CDP verify: mount ครบ, dropdown Route 9 ตัวจาก DB จิง (M1-M9), generate = 7 เอกสาร (status 68), filter M2 = 1 แถว, 0 errors — cache `v=20261013b` (portal `v=20261013a`)
- **Modal residue fix (commit `69aae65`):** ปิ ด modal แล้วยังคางในหน้ า index ด้างลาง — สาเหต: style append ใน `#p081Root` แต overlay อยู่ ใน body → portal.js re-render (`content.innerHTML`) ลบ style ทิง overlay ไว้ = block ไมมี CSS - แก: style → `document.head` (id `p081Style`), show/hide ใช inline display, portal.js renderPage + mount ล้าง `body > .p081-rep-overlay` — cache v=20261014b, portal v=20261014a — CDP pass: mount/open/close/leave/back ครบ
- **PDF report (commit `807b803`):** ปุ่ ม "สรา้ งเอกสาร" → เปิ ด modal รายงาน A4 `PickList Summary [By Route_TMS]` (clone C# bgWorker_DoWork) — API `p081_generate.php` เขียนใหม่กลับ `pages:[{route,items:[{stk,sto,desc1,desc2,grand,remaining,rows:[...]}]}]` (grand = sumSTKNEW "4/0" = qty/conv+Mod, remaining = SBL+RSV) + JS `openReport()` overlay + iframe srcdoc (font THSarabunNew, 6 คอลั่ น, route col rowspan, แถบกลุ่ ม colspan3+รวม+grand+คงเหลือ, ปุ่ มพมิ พ์/เปิ ดหน้ าต่าใหม้/ปิ ด Esc) — พิ มพ์จาก iframe โดยตรง — cache `v=20261014a` — CDP pass: overlay กลางจอ (top 122/bottom 779 ใน 900), iframe 1 หน้ า M2, 19 group bar, 0 errors
- **Thai spelling + search button (commit `984cd83`):** (1) ตรวจคำไทย/คำเว้นวรรค/คำสะกดทังหมดใหต้อตรงตาม `demo/P081_demo.html` แบบ verbatim (เทียบด้วย script grep text nodes + option labels ของ demo — แลวแพตช์คำที่เหลื่อม: สถานะใบแจงหนี้, ผลการสรางเอกสาร, ยงั ไมไ่ ดสราง, กลุมคลังสืนคา, 6-ลูกรบเอง, ปกติ/ดวน, เดือนไทย, หัวตารางรายงาน) (2) เพิ่ มปุ่ มค้นหา (ไofn magnifier + "ค้นหา") ต่อด้านหลัง dropdown สถานะในแถวเดียวกัน `.p081-search-row` — ใช `fetchPages()` ตัวเดี ยวกั นแต `state.mode="items"` → render ตาราง 9 คอลั่ น (ลำดบั /สายส่ ง/คลัง/รหัสสืนค้า/ชื่ อสืนค้า/เลขที่/วันที่/ปริมาณ/หนว่ ย) แทนตารางสายส่ ง + footer "แสดง N รายการสืนค้า" + badge N สายส่ ง — cache `v=20261014d` — CDP pass (`cdp_p081_search.js`): searchBtn=true, status 68 + route M2 → 19 rows / 9 head cols / footer "แสดง 19 รายการสืนค้า" / badge "1 สายส่ ง" / 0 errors, vision OK กลมกลืนไม่ล่ นตะกอน

### 13/10 — P045 ตรวจสอบบิลลูกค้าเดี ยวกั น — **READY** (user ยืนยัน 2026-10-13 — 31 modules ready)
- modules.php P045 → `status: ready`
- สรุปงาน P045: 2 APIs (`p045_samebill` + `p045_detail` clone C# GetVnos/GetListSTK) + launcher + table 5 คอลั่น + **modal view detail** (3 คอลั่น สถานะ/จำนวน + item-row qty — expand ทั้งหมดตั้งแต่เปิด — ตัด search — appendChild body + min-height:0 = centered + scroll ในจอ) — cache v=20261013g — commits `089c281` → `9c1da2b`

### 13/10 — P045 ตรวจสอบบิลลูกค้าเดียวกัน — **DEV** (clone demo/P045-demo + C# **AppForCheck/frm_CheckBillMorethanOne_GUI** — 2 APIs + modal + CDP verify — commit `089c281` + `964c741`)
- `assets/js/p045-same-bill.js` (IIFE `window.P045SameBill`) — **clone demo/P045-demo.html + demo/P045-demo_viewdetail.html** — real data MAC5 — **cache v=20261013a** (portal v=20261012c)
- **API:** `p045_samebill` — POST `{connectionId, date, cus}` → ลูกค้าที่มีบิล **MIHtype='IS'** ซ้ำในวันเดียวกัน (GROUP BY ลูกค้า + **HAVING COUNT(MIHvnos)>1** — clone intent demo/C#) + filter รหัสลูกค้า LIKE — **DEBnameT/DEBadd3AT เป็น text → CONVERT nvarchar ก่อน group/sort** (ไม่ทำ = error text cannot be sorted)
- **API:** `p045_detail` — POST `{connectionId, date, cus}` → bills[{vnos, date, status, items[{listNo, stk, desc, qty, unit}]}] — **clone C# GetVnos (MIHtype='IS' + MIHcancel=0) + GetListSTK (MILtype='IS' + MILquan/MILconv)**
- **UI:** launcher (วันที่ default วันนี้ + รหัสลูกค้า + ปุ่มค้นหา) + table 5 คอลั่น (วันที่(พ.ศ.)/รหัสลูกค้า/ชื่อลูกค้า/เขต-อำเภอ/จำนวนบิล — badge สี: 2=ฟ้า 3=เหลือง >=4=แดง) + sort column + quick search + footer รวมจำนวนบิล + empty state + toast
- **Modal view detail (user 2026-10-13):** คลิกแถวลูกค้า → modal รายละเอียดลูกค้า + **ตาราง 3 คอลั่น** (วันที่/เลขใบสำคัญ + **สถานะ/จำนวน** (status tag + N รายการ ซ้อนกัน) + รายการสินค้า — **col จำนวนรายการ + สรุปสินค้า ตัดออก (user)**) + item-row (col1 = ลำดับ+รหัสสินค้า · col สถานะ/จำนวน = qty หน่วย · col3 = ชื่อสินค้า) — **expand ทั้งหมดตั้งแต่เปิด (user)** + ปุ่มขยาย/ยุบทั้งหมด — **modal search ตัดออก (user)** — Escape/overlay ปิด — **modal appendChild body (MAIN.content มี transform → fixed ผิด ref) + body min-height:0/flex:1 = centered + scroll ในจอ** — `9c1da2b` — cache v=20261013g
- **CDP verify:** 2026-10-12 = 27 rows/62 บิล / 10-10 = 13 / quick filter "บจก." = 7 / sort vnos desc = 6 / **modal 10150-159 = 4 ใบ/13 รายการ — collapse 0 — expand 13 — search "รองเท้า" = 2 ใบ** / 0 errors
- **C# (user ยืนยัน path 2026-10-13):** `AppForCheck/frm_CheckBillMorethanOne_GUI.cs` — query ตารางหลักตรงกัน แต่ C# +`MIHcancel=0` + คอลั่นผู้สัมพันธ์ (DEBcontactT) — P045 ทำตาม **demo** — **รอ user ตัดสินใจ** ว่าจะ clone C# เต็ม ๆ หรือไม่

### 12/10 — P039 ตรวจสอบตัดของเกิน SO — **READY** (user ยืนยัน 2026-10-12 — 30 modules ready)
- modules.php P039 → `status: ready` (L125)
- งานล่าสุดก่อน ready: ตัดปุ่มค้นหา (กด mode = ค้นหาทันที) + ตัด 4 กาด summary (`ceff93d`) — cache v=20261012b

### 12/10 — P039 ตรวจสอบตัดของเกิน SO — **DEV** (clone demo/P039_demo + C# FrmCheckCutSOGUI — 1 API + CDP verify — commit `dfd35ab`)
- `assets/js/p039-cut-so.js` (IIFE `window.P039CutSO`) — **clone demo/P039_demo.html (1,087 บรรทัด) + C# `FrmCheckCutSOGUI.cs`** — real data MAC5 — **cache v=20261012a** (portal v=20261012b)
- **API 1 ไฟล์:** `p039_cutso` — **3 modes ตามปุ่ม C#** (clone WHERE ตรง ๆ + prepared statement): `product` = (CPSstkCUT1-CPSstkREQ)>0 · `amount` = (CPSsumREQ-CPSsumCUT1)>0 + (CPSstkCUT1-CPSstkREQ)=0 + STKgroup≠'SV' · `complete` = CPSstkCUT1=CPSstkREQ + STKgroup≠'SV' — ทั้ง 3: CPSclearUSER=0 + CPSclearALL=0 + CPSdateID between + ORDER BY CPSvnosID,CPSlistNo
- **UI:** launcher (date from-to **default -90d→today** clone C# _Load + **mode 3 ปุ่ม** (ตรวจสอบจากสินค้า/จากยอดเงิน/สินค้าส่งครบแต่ค้างส่ง — **default active = amount** clone demo — **กด mode = ค้นหาทันที** — ตัดปุ่มค้นหา user 2026-10-12)) + **table 11 คอลั่น** (รายการที่/เลขที่/วันที่(พ.ศ.)/รหัส-ชื่อลูกค้า/รหัส-ชื่อสินค้า/ยอดที่สั่ง/ยอดที่ตัด (แดงถ้าเกิน)/จำนวนที่สั่ง/จำนวนที่ตัด (qty-tag)) + sort column + quick search + empty state + toast
- **4 กาด summary ตัดออก (user 2026-10-12)** — เดิม clone demo (จำนวนแถว/ยอดส่วนเกินรวม/จำนวนใบสั่ง/จำนวนลูกค้า) — ตัด HTML+CSS+render — `ceff93d` — cache v=20261012b
- **CDP verify:** 3 modes real data (amount 2 rows/product 0/complete 2) + sort shipped desc + quick search + 0 JS errors
- **status: dev** — รอ user ยืนยัน (ยังไม่ mark ready)

### 12/10 — P103 ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง — **READY** (user ยืนยัน 2026-10-12 — 29 modules ready)
- modules.php P103 → `status: ready` (L281)
- งานล่าสุดก่อน ready: **picker limit 15** (`bede2ca`) + **3 ตารางเต็มพื้นไม่มี scrollbar** (`e1f6e62`) — cache v=20261012d

### 12/10 — P103 ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง — **DEV** (clone demo/P103_demo + C# frm_CheckCOST_GUI/frm_selectSTK — 2 APIs + CDP verify — commit `4ef3c1e` + `7304d18`)
- `assets/js/p103-check-cost.js` (IIFE `window.P103CheckCost`) — **clone demo/P103_demo.html (1,133 บรรทัด) + C# `frm_CheckCOST_GUI.cs`/`frm_selectSTK.cs`** — real data MAC5 — **cache v=20261012b**
- **API 2 ไฟล์:** `p103_stk` (picker สินค้า — clone frm_selectSTK: STKhide=0/STKlock=0/STKsnsv!=3 + kw LIKE code/desc — **TOP 15 (user limit** — เดิม 200) + `p103_cost` (balance จาก **CST** clone getRateBalance — SP/IS/AS/BS/IP/AP/BP/BF/SS/JX/MX ไม่รวม PP/PS/PX + **PR** MILtype='PX' (สกุลจากข้อหน้าเลขที่: PRU6→USD/PRY6+PRCN→RMB/อื่น→THB) + **PO** MILtype='PP' + **RE** MILtype='IP' — ทั้ง 3 = TOP 5 + STO filter (STOgroup whitelist 9 + STOlock=0/STOhide=0))
- **UI:** launcher (รหัส/ชื่อสินค้า + **ปุ่มเลือก → picker modal** (search Enter + click เลือก + Esc) + **กลุ่มคลัง 9 checkbox** (G01 G02 G03 G04 G06 G07 G09 PD RTV — default ติ๊ก G01+G06 clone C# frm_Load) + ปุ่มค้นหา) + **stock cards 5** (จำนวน/ต้นทุนเฉลี่ย/มูลค่า (จาก CST) + หน่วยหลัก/รอง (จาก STK)) + **tables 3** (PR 7 คอลั่น / ประวัติซื้อ 10 คอลั่น + Ex Rate + THB / ค่าใช้จ่ายส่วนเพิ่ม 10 คอลั่น + Ex Rate + THB — row แรก highlight)
- **4 กาด summary ตัดออก (user 2026-10-12)** — เดิมตาม intent demo (ราคาล่าสุด PR/ค่าซื้อล่าสุด THB/ความแตกต่าง/ค่าใช้จ่ายเพิ่มล่าสุด) — ตัดทั้ง HTML+CSS+renderSummary+API summary field — `7304d18`
- **UI launcher (user 2026-10-12)** — ย้าย **ปุ่มค้นหา** จาก column แยก → **ต่อช่องชื่อสินค้า (แถวเดียวกัน** `.p103-name-row` grid 1fr+auto — ปุ่ม h44) + **กรอบกลุ่มคลัง** (border + bg gradient อ่อน + radius 12 + label สีฟ้า) — `9f3e609` — cache v=20261012c
- **3 ตารางแสดงเต็ม (user 2026-10-12)** — ตัด scrollbar: `.p103-table-wrap` max-height 230+overflow auto → visible + `.p103-table` ตัด min-width 760 — `e1f6e62` — cache v=20261012d
- **CDP verify:** real data 10299059 — qty 668.000/avg 3.410/value 2,277.850 (ตรง demo) + PR 2/PO 2/RE 5 rows + picker 200 rows + search filter + pick → fields — 0 JS errors
- **status: dev** — รอ user ยืนยัน (ยังไม่ mark ready)

### 12/10 — P059 จัดเก็บเอกสารลูกค้า (SO Image) — **READY** (user ยืนยัน 2026-10-12 — 28 modules ready)
- modules.php P059 → `status: ready` (L161)
- งานล่าสุดก่อน ready: modal 1280px เต็มจอ + zoom −/+/fit/Ctrl+Wheel (`3ad95c0`) + compact + UI clarity + ตัดปุ่มลบ (X) ท้ายแถว + แก้ icon ปุ่ม X modal (`92ed985`/`40dcb50`/`3d04900`/`5fc0ad6`) — cache v=20261010k

### 10/10 — P059 จัดเก็บเอกสารลูกค้า (SO Image) — **DEV** (clone demo/P059-demo + C# AppSOimage — 5 APIs + report A4 — CDP verify ครบ — commit `5262a4c`)
- `assets/js/p059-so-image.js` (IIFE `window.P059SoImage`) — **clone demo/P059-demo.html (1,542 หน้า) + C# `frm_SOimageGUI.cs`/`frm_SOimage_manager.cs`/`frm_selectData.cs`** — real data MAC5 5 APIs — **cache v=20261010j**
- **API 5 ไฟล์:** `p059_search` (TOP 100 `tb_PictureSO` LEFT JOIN MIH/DEB — status=0 + vnos LIKE) + `p059_detail` (fields 4 + file list) + `p059_image` (image proxy — **curl FTP** NAS `192.168.0.200/web/PO/` — 226 verified) + `p059_save` (multipart upload → FTP + INSERT/soft delete status=-1) + `p059_so_list` (mode=picker TOP 50 SO ไม่มีภาพ / mode=info query SO แม่นยำ)
- **UI:** launcher **New + search** (ค้นหาเลขที่ SO) + **table 7 คอลั่น** (วันที่ SO/เลขที่ SO/รหัสลูกค้า/ชื่อลูกค้า/จำนวนภาพ/View/Print) + **pagination 15/หน้า** (clone P019 — ปุ่ม ‹ 1 2 3 4 5 › + "หน้า X / Y" — commit `d2c7421`) + **view modal** (fields 4 + file list + preview — **Edit→browse/ลบ/save** clone C# btn_edit_Click) + **new modal** (SO picker TOP 50 + browse + save) + **soft delete** (ไฟล์เดิมที่ลบจาก working set → status=-1) + toast
- **10/10 (encore) — new modal redesign** (commit `2fdb217` — cache v=20261010d): ตัดปุ่มเลือก → **autocomplete SO TOP 10** (พิมพ์เลขที่ → dropdown `MIHvnos LIKE 'kw%'` — debounce 250ms + ↑↓/Enter/Esc + stale token) — `p059_so_list` picker เปลี่ยน TOP 50 → **TOP 10** (SQL ตาม user) + modal: fields 4 คอลั่น 1 บรรทัด + hint bar + **dropzone** (click + drag&drop — multiple) + file list (ปุ่มลบต่อภาพ) + preview counter + ปุ่มภาษาไทย — save: typed SO → verify `mode=info` ก่อน upload · AC pick → upload ตรง — view modal: dropzone/บันทึก disabled จนกด "แก้ไขภาพ"
- **10/10 (encore 2) — table + modal fix** (commit `7d028f9` + `170ab35` — cache v=20261010f): table **เต็มความกว้าง ไม่มี scrollbar** (ตัด max-height:65vh/min-width) + **modal อยู่กลางจอ** — root cause: portal root มี transform → position:fixed offset จาก viewport — **แก้: modal/toast append ที่ document.body** + `resizeModal()` (maxHeight = innerHeight-32 · ขยายเต็มจอเมื่อ content สูงกว่า — msplit scroll ภายใน) — CDP: centered 171/171 (1568×897) + fits 22/22 (1024×600)
- **10/10 (encore 3) — modal ใหญ่ขึ้น + zoom** (commit `3ad95c0` — cache v=20261010g): modal 1000→**1280px + เต็มความสูงจอ** (innerHeight-32 — preview area ยืดตาม) + **image zoom** — ปุ่ม **−/+/fit + %** + **Ctrl+Wheel** (passive:false — scroll ปัจจัยยังหนุนได้) — fit = พอดีพื้นที่ (clamp 10%-1200%) — preview: `.p059-preview-fit` (absolute inset:0 — **วัดขนาดจาก modal ไม่ใช่ภาพ** — ไม่เป็น) + scroll ภายในเมื่อขยาย — CDP: fit 66% (h-constrained) + in/out/fit สม่ำเสมอ — 0 errors
- **10/10 (encore 4) — modal compact + UI clarity** (commit `92ed985` + `40dcb50` + `3d04900` — cache v=20261010j): preview area สูงขึ้น 7% (titlebar 38→32 · mfields 78→66 · hint 28→20 · mfoot 70→52) + **row เลือก** (bg #dbeafe + accent bar + file name bold เขียวคราม) + **ปุ่ม X** ขาวบนแดง + **ปุ่มบันทึก** เขียว #059669 (disabled opacity 0.45 — มองเห็น) + **ปุ่มแก้ไขภาพ/ลบภาพนี้** soft blue/soft red เมื่อไม่กด + **ตัดปุ่มลบ (X) ท้ายแถว file list** (ใช้ ปุ่ม "ลบภาพนี้" เหนือรายการเพียงจุดเดียว) + **แก้ icon ปุ่ม X modal** (svg ไม่ได้รับ stroke เพราะ rule อยู่ใน .p059-app — modal อยู่นอก → ขยาย selector `.p059-backdrop svg` — commit `5fc0ad6`) — **root cause**: modal append ที่ document.body → CSS var/reset ใน .p059-app ไม่ถูก — ขยาย selector เป็น `.p059-backdrop` — CDP verify ครบ — 0 errors
- **report** `p059_report.html` — A4 portrait 1 ภาพ/หน้า (530×770 clone C# previewSOimage) + THSarabunNew + toolbar (ปิด/พิมพ์) — **fix relative path `../api/`** (report/ → ../api/)
- **modules.php:** ตัด P059 ซ้ำออกจาก ฝ่ายขาย›รายการระดับฝ่ายขาย (เหลือเฉพาะ บัญชี›กำหนดค่า L161)
- **CDP verify:** 100 rows + search (SCRE6910-1206 → 1 row) + view modal (2 files + image proxy 955×853) + edit mode (browse/save enable) + new modal (SO picker 50 items + select → fields) + report 2 imgs loaded — 0 JS errors
- **FTP:** NAS `192.168.0.200` — curl FTP download/upload working (nlist /web/PO/ FAIL — permission — ไม่กีดกัน) — php.ini `extension=ftp` + `sockets` (Apache restart โดย user)
- **status: dev** — รอ user ยืนยัน (ยังไม่ mark ready)

### 09/10 — P006 Print Invoice เช็คคืน — **READY** (ต่อ API จริงจาก C# + user ยืนยันพร้อม 2026-10-09 — 27 modules ready)
- `assets/js/p006-print-invoice.js` (IIFE `window.P006PrintInvoice`) — **clone demo/P006-demo.html + C# `MCIT_FrmPrintChqueReturnGUI.cs` (MCIT/PrintChqueReturn)** — real data MAC5 3 APIs — **cache v=20261009h** — commit `77684f7` (UI mock) + `cfda997` (API) + `8e04a3a`/`cbbbf93`/`c67c311` (UI) + `26f0564`/`e9339f7` (report)
- **API:** `p006_search` (search — SQL clone C# L112-122: `MIH LEFT JOIN DEB ON DEBcode=MIHcus` + `MIHtype='IS'` + วันที่ range (invoice จาก `MIHday/month/year`, key จาก `MIHkeyDate`) + `MIHvnos LIKE 'prefix%'` + `MIHper LIKE` + `MIHstatus=` + `MIHkeyUser LIKE` — ORDER BY MIHvnos) + `p006_report` (report — clone C# `headerANDfooter`/`ChekSTK`/`detailInvoice`/`serial`/`countUnit`/`get_refSO` — **2 หน้า/ใบ** A4 portrait: หน้า 1 "ใบแจ้งหนี้ (สำหรับลูกค้า)" + หน้า 2 "ใบแจ้งหนี้ (Invoice)" — header type: มีสินค้า `STKnotCompany='1'` → พาราเทค 6 คอลั่น / ไม่มี → MCIT 7 คอลั่น + รหัสลูกค้า + ผู้ขาย + SALE-SYS-EX-14-5601) + `p006_markprint` (clone P130 — `MIHprintN +1`, max 50)
- **UI clone demo:** launcher **4 field 2×2** (วันที่ Invoice / ผู้สร้างเอกสาร / **คำนำหน้า 18 ค่า clone C# Designer** (default 1CBN) / **สถานะ 14 ค่า clone C# cb_status** (default 25-แจ้งหนี้เช็คคืน)) + ปุ่มค้นหา + Print Preview — default วันที่ = วันนี้ (pattern P019) — **ตัด วันที่สร้างเอกสาร + รหัสผู้แทน ออก (user 2026-10-09)** — layout 2×2 สมมาตร (span2 — row 1: วันที่ Invoice + ผู้สร้าง / row 2: คำนำหน้า + สถานะ)
- **ตาราง 9 คอลั่น:** checkbox select (select all + row click toggle) / ลำดับ / เลขที่ใบสำคัญ / รหัสลูกค้า / ชื่อลูกค้า / พื้นที่ / ยอดรวม / หมายเหตุ / จำนวนที่พิมพ์ (badge zero/printed) — sortable + quick search + footer (แสดง N รายการ + ยอดที่เลือก + ยอดรวมทั้งหมด) — **row แดง (LightCoral) ถ้า `cnt >= 11`** clone C# `Grid1_DataBindingComplete` L1534-1549
- **Report:** overlay + iframe `report/p006_report.html` (clone P130 pattern) — A4 portrait 2 หน้า/ใบ — font THSarabunNew — toolbar (ปิด/พิมพ์/↗ หน้าต่างใหม่) — ปิด overlay → refresh จำนวนที่พิมพ์
- **Report spec (user 2026-10-09 — วัด CDP):** **T1** (ชื่อลูกค้า→ขนส่ง) font 12pt ทั้งหมด **ยกเว้น DEBgrade 18pt** (ย้ายจากตรงกลางข้างล่าง MCIT → **ชิดขวาบรรทัด "กำหนดส่งของ"** — flex space-between — sameRow+gap 9px ✓) · **T2** คอลั่น MCIT **50/250/50/50/50/40/60** (7 คอลั่น) / พาราเทค **300/50/50/50/40/60** (6 คอลั่น) · **T3** (หมายเหตุ→ยอดชำระ) คอลั่น **250/110/110/80** + font 12pt + **แถวสูง 26px** (line-height 1) — **CSS specificity fix:** `table.rep-header`/`table.rep-totalsbox` (0,1,1) ไม่งั้นถูก `table.rep-table` (0,1,1) ครอบงำ font 12px (9pt)
- **CDP:** 20 rows (01/09–08/10, status 25, 1CBN) · "20 รายการ" · ฿559,486.00 · report overlay ✓ (MCIT header, หน้า 1 สำหรับลูกค้า) · 0 JS errors ✓

### 09/10 — P006 Print Invoice เช็คคืน — **ENCORE** (UI mock — ถูกแทนที่ด้วย READY ข้างบน)
- `assets/js/p006-print-invoice.js` (IIFE `window.P006PrintInvoice`) — **clone demo/P006-demo.html** — **cache v=20261009a** — commit `77684f7`
- **UI ครบตาม demo:** launcher 6 field (วันที่ Invoice / วันที่สร้างเอกสาร / ผู้สร้างเอกสาร / รหัสผู้แทน / คำนำหน้า 1CBN·CODN·IVVN / สถานะ 25·26·27) + ปุ่มค้นหา + Print Preview
- **ตาราง 9 คอลั่น:** checkbox select (select all + row click toggle) / ลำดับ / เลขที่ใบสำคัญ / รหัสลูกค้า / ชื่อลูกค้า / พื้นที่ / ยอดรวม / หมายเหตุ / จำนวนที่พิมพ์ (badge zero/printed) — sortable 6 คอลั่น + quick search + footer (แสดง N รายการ + ยอดที่เลือก + ยอดรวมทั้งหมด)
- **Modal Print Preview:** กระดาษ A4 landscape (บริษัท เอ็มซีไอที จำกัด + meta 4 cell + table 6 คอลั่น + total row + ลายเซ็น 3 แถว) — ปุ่มพิมพ์ (markAsPrinted + window.print) + ปิด + Escape + click backdrop — `@media print` = พิมพ์เฉพาะ #p006Paper
- **Mock data 8 rows** (ตาม demo — status/creator/salesperson เพิ่มสำหรับ filter) — **TODO: ต่อ API (SQL ตาม C#)**
- **C# source: ยังไม่มี** — ต้องหา `frm` ของ P006 ก่อนต่อ API
- **CDP:** 8 rows · "8 รายการ" · "แสดง 8 รายการ" · ฿255,971.00 · modal ✓ · 0 JS errors ✓

### 08/10 — P019 เช็คสถานะส่ง Invoice — **READY** (user ยืนยัน 2026-10-09 — **26 modules ready**)
- `assets/js/p019-invoice-status.js` (IIFE `window.P019InvoiceStatus`) — **clone demo/P019-demo.html + C# `frm_CheckStatusInvoiceGUI.cs` (AppCheckStatusInvoice)** — real data MAC5 2 APIs — **cache v=20261008a**
- **API:** `p019_invoices` (search — SQL clone C# L110-115: `MIH LEFT JOIN DEB ON DEBcode=MIHcus` + `MIHcancel=0 AND MIHtype='IS' AND MIHstatus IN (...)` + วันที่ range — ORDER BY MIHdate) + `p019_status` (สถานะจาก `AR_S` — `AR_Scode IN (62,63,65,67,68,70)` — clone C# L68)
- **UI ตาม demo:** วันที่ from–to (default 1 แห่งเดือนก่อน → วันนี้-3 — clone C# L48-51) + **สถานะ = dropdown multi-select** (checkbox 62 ADS ส่ง ACC / 63 รับเอง / 65 WH / 67 NOT SHIP / 68 SHIP / 70 LOG — check ทั้งหมดด้วย + ปุ่ม "สลับทั้งหมด") + ปุ่มค้นหา + quick search
- **ตาราง 6 คอลั่น:** วันที่ / เลขใบสำคัญ / รหัสลูกค้า / ชื่อลูกค้า / สถานะ (badge สี: green=68, orange=65, red=67, blue=70, purple=62, gray=63) / พนักงาน — sortable + row select + **pagination 15 รายการ/หน้า** + footer "แสดง X รายการ" + "สถานะที่เลือก N"
- **Test data:** 01/09–08/10/2026 = **74 rows** (API = 483 rows — range กว้าง) — CDP: rows 15 (page 1) · foot "แสดง 74 รายการ" · sum "เลือก 6 สถานะ" ✓

### 08/10 — P130 Print Invoice MCIT (BKK) — **READY**
- `assets/js/p130-invoice-mcit-bkk.js` (IIFE `window.P130InvoiceMCITBKK`) — **clone P064 + flag BKK** — 3 APIs `p130_invoices`/`p130_report`/`p130_markprint` — C# `MCIT_FrmPrintInvoiceMCTGUI.cs` — **cache v=20261008a** — menu แยกจาก P064 (กลุ่ม Print Invoice BKK)
- **Flag BKK (3 จุด):** T4 = 7 แถว (หน้า 1+3 — หมายเหตุ/รวมหน่วยบรรจุ rowspan 3 + จำนวนเงิน/ส่วนลดท้ายบิล x% `discHt`/ยอดหลังหัก + ช่องทางชำระเงิน rowspan 4 ไม่มีเส้นตาราง + QR TTB 90×90 ชิดซ้ายบน rowspan 4 + ยอดมัดจำ/ยอดชำระ/ว่าง 2 แถว) · COD → การชำระเงิน = ว่าง · ค่ายอดคง P064 (จำนวนเงิน = `MIHcog` · ยอดชำระ = `MIHnetSUM`)
- **Font THSarabunNew ทั้งหมด** (fonts.css + ตัด monospace — pattern P129) — CDP: fonts loaded 4 weights · body/td.code = THSarabunNew ✓
- **รายงาน 3 หน้า/ใบ:** 1 ใบแจ้งหนี้ (สำหรับลูกค้า — `.rep-inv`) · 2 ใบส่งสินค้า (`.rep-del-page`) · 3 Invoice copy (`.rep-inv` + QR Invoice)
- **Font size clone P129 spec:** T1 MCIT 32B/หน้า N 14/เลขที่-วันที่ 14/ชื่อ 18B/ย่อย 14/ลูกค้า 14 800/ที่อยู่-Tel 14/อ้างอิง-ขนส่ง 12 · T2 หน้า 1+3 หัว 12B/รายการ 12 (normal 12B) แถว 26px ไม่มีเส้นแถว · T4 12pt + paytitle 14B · ช่องลงนาม+footer 12pt (margin-top auto — ดันลงสุดหน้า)
- **หน้า 2 (delivery):** T2 font 12pt · thead 28px middle · แถว 40px ไม่มีเส้นแถว · T3 12pt · ช่องลงนาม+footer 12pt (margin-top auto)
- **Test data:** IVV7 + status 65 = 7 rows · status BKK (4/5/44/45) = 0 rows · IVVN = 0 (SQL `MIHtype='IS'` — IVVN ใช้กับ P129 เท่านั้น) — CDP flow PASS: 3 pages · payText 2 · qrImg 2 · t4rows 7

### 07/10 — P129 Print Invoice KTV (BKK) — **READY**
- `assets/js/p129-invoice-ktv-bkk.js` (IIFE `window.P129InvoiceKTVBKK`) — **clone P063 + flag BKK** — real data MAC5 3 APIs (`p129_invoices`/`p129_report`/`p129_markprint`) — C# `MCIT_FrmPrintInvoiceKTVGUI.cs` — **cache v=20261007c**
- **Flag BKK (3 จุด):** ช่องทางชำระเงิน + QR TTB 90×90 ใน T4 (หน้า 1+3) · footer rowspan 3 · COD → การชำระเงิน = ว่าง — QR Location ตัดออกแล้ว
- **หน้าค้นหา:** 6 filter fields · **pagination 15 รายการ/หน้า** · row select ข้ามหน้า · สร้างรายงาน = modal
- **รายงาน 3 หน้า/ใบ:** 1 ใบแจ้งหนี้ (สำหรับลูกค้า) · 2 ใบส่งสินค้า (Delivery Order) · 3 copy ใบแจ้งหนี้ (Invoice + QR)
- **Font THSarabunNew ทั้งหมด** (fonts.css + ตัด monospace) — หน้า 1+3: T1 MCIT 32B/หน้า N 14/เลขที่-วันที่ 14/ชื่อ 18B/ย่อย 14/ลูกค้า 14 800/ที่อยู่-Tel 14/อ้างอิง-ขนส่ง 12 · T2 หัว 12B/รายการ 12 (normal 12B) แถว 26px ไม่มีเส้นแถว · T4 12pt แถว 28px padding-top 10 (ช่องทางชำระเงิน+QR row 4-7 ไม่มีเส้นตาราง) · paytitle 14B · ช่องลงนาม+footer 12pt (margin-top:auto — ดันลงสุดหน้า)
- **หน้า 2 (delivery):** class `rep-del-page` — T2 font 12pt · thead 28px middle · แถว 43px ไม่มีเส้นแถว · T3 12pt · ช่องลงนาม+footer 12pt (margin-top:auto)
- **T4 = 7 แถว (หน้า 1+3):** หมายเหตุ/รวมหน่วยบรรจุ rowspan 3 + จำนวนเงิน/ส่วนลดท้ายบิล x% (discHt = MIHdiscHT1+MIHdiscHT2)/ยอดหลังหัก · ช่องทางชำระเงิน (rowspan 4 ไม่มีเส้นตาราง) + QR TTB 90×90 ชิดซ้ายบน (rowspan 4 ไม่มีเส้นตาราง) + ยอดมัดจำ/ยอดชำระ/ว่าง 2 แถว — T4 margin-top -1px ชิด T2
- **MCIT ชิด T1** (margin-bottom 0) — test CDP: ทุกค่า computed ตรง spec ✓ — modules.php status **ready** — **24 modules ready** (unique)

### 05-06/10 — P008 ใบปะหน้าเก็บบัญชี VAT, No VAT V2 — **READY**
- `assets/js/p008-collection-v2.js` (IIFE `window.P008CollectionV2`) — **real data MAC5 3 APIs** (`p008_search`/`p008_groups` 30 กลุ่ม/`p008_report`) — clone C# `MCIT_FrmAccountServiceGUI_VATversion_V2.cs` — **cache v=20261006g**
- **Phase 1:** search (จังหวัด/พนักงานขาย/กลุ่ม/วันที่) + checkbox ลูกหนี้ · **Phase 2:** report 3 หน้า
- **หน้า 1 (สรุป):** A4 margin 20mm — ตาราง 170mm (557f — 60/85/20/80/70/70/80/60/52f) — **ชื่อลูกหนี้ (cust-head) = แถวแรกบนตาราง** — แถว "รวม" ต่อลูกหนี้ + "รวมทั้งสิ้น" (grand) — **ระยะห่างตาราง loop = 15px (spacer row)** — **JS pagination:** clone วัด row height จริง → pack 974px/A4 → แตกหลาย `.p008r-page` (Chrome ไม่แตก absolute — print CSS `#p008Report` = static) — **Pitfall: table หน้าใหม่ต้องก๊อป colgroup + thead**
- **หน้า 2 (ส่งกลับบริษัท):** T1 80/397/100f · T2 317/60/200f · T3 70/90/157/70/60/60/70f (12 แถว/หน้า) · T4 200/377f — footer absolute bottom 15mm (note + T4) — **แถวรวม = บวก rows ทั้งหมด (ไม่ใช่แค่หน้าสุดท้าย)**
- **หน้า 3 (สำหรับลูกค้า):** T1-T3 เหมือนหน้า 2 + **T4 ใบเสร็จรับเงิน 107/160/90/220f** — ภาพ rowspan 9 เต็มช่อง (object-fit:contain) — row 3-8 สูง 26px — row สุดท้าย padding-top 30px
- **Font:** THSarabunNew ทั้งหมด — หน้า 1: title 18B/line 16/th 14B/td 12/รวม 14B pt · หน้า 2: T1 20B/15/16B · T3 th 13B/td 13 · cheque 14 · note 14B
- **Flow:** Print → POST → render → **modal ตัวอย่าง** (zoom) → ปุ่ม "พิมพ์" = window.print() — test CDP: 74110-176 = สรุป 2 หน้า + cover 6 หน้า · PDF ทุกหน้า 1123px ✓ — **22 modules ready**

### 01-03/10 — P051 รายงานการเก็บเงินสด — **READY**
- `assets/js/p051-cash-collection.js` (IIFE `window.P051CashCollection`) — **real data MAC5** (`api/p051_search.php`) — clone demo/P051-demo.html → เชื่อม DB
- **API search:** POST {connectionId, status, reportType} — `MIH LEFT JOIN DEB ON DEBcode=MIHcus` — `MIHtype LIKE 'IS'` + `MIHstatus IN (?)` (status = "43,44,60" parse comma — whitelist digits) + `MIHdesc LIKE '%เงินสด%'` (reportType=cash) — `ORDER BY MIHvnos ASC` — rows: document/date/customerCode/customerName (DEBnameT+DEBcontactT)/salesperson (MIHper)/amount (MIHnetSUM)
- **UI:** เงื่อนไข (radio ทั้งหมด/เงินสด + **สถานะ input text** = รหัสสถานะ — ไม่ใช่ยอดขั้นต่ำ!) + ปุ่มค้นหา (ไม่ค้นหาอัตโนมัติ) + **table 6 คอลั่น** (user ตัด "ลำดับ" ออก) + **pagination 15/หน้า** (ปุ่ม ‹ 1 2 … N › — active blue gradient — reset page=1 เมื่อ search/filter/sort) + quick search (client) + sort (default document) + row select + **พิมพ์ A4 landscape = ทั้งหมด** (beforeprint/afterprint _printAll)
- **Export CSV = server-side `api/p051_export.php`** — POST {connectionId, status, reportType, keyword} — **cp874 (TIS-620) + CRLF** — Excel Windows ไทยเปิดเป็นตาราง + ไทยถูก — JS: fetch + **arrayBuffer** (ห้าม r.text()) → Blob — **3 rounds:** UTF-8 BOM (ไทยเละ) → UTF-16 LE (ไทยได้แต่ 1 คอลั่น) → cp874 ✓ — `iconv("UTF-8","TIS-620//TRANSLIT//IGNORE")` (mb_convert_encoding ไม่รับ //IGNORE)
- test CDP: search 43,44,60 + ทั้งหมด = 24 rows · หน้า 1 = 15 rows "แสดง 1–15 จาก 24" · หน้า 2 = 9 rows · CSV cp874 decode ✓ — cache `p051-cash-collection.js?v=20261003c` — modules.php status **ready** — **21 modules ready**

### 30/09 — P053 สติ๊กเกอร์ 10x7.5 — rewrite ตาม C# `MCIT_Frm_FaceSheetProduct_10x7`
- `api/p053_search.php` — pattern เดียวกัน P052: **total = totalCopy** (รวม MILnotes ทั้งหมด → denom = total ทั้ง A+B) + **company** (typeReport — Company/NotCompany) — test: A `IVVN6909-0001` = 21/21 Company · B `TOUB6908-0008` = count 0 (ref2 ว่าง) → modal
- `assets/js/p053-sticker.js` — layout ตาม C#: sheet 282×210pt pad **2pt 1pt** · table **280pt (373px) 4 คอลั่น 30/65/90/95pt border 0** · font **THSarabunNew web font** — A: r1 DEBnameT+DEBcontactT 22pt B 90pt padL15 · r2 i/total 40pt B **right padR140** (C# ColumnText x=140 y=85) · r3 vnos+วันที่ 14pt padL20 · r4 address บริษัท 14pt padL15 **เฉพาะ type=Company** (NotCompany = แถวว่าง) — B: r1 MIHmemo 22pt B · r4 "จาก name contact / Tel" 16pt padL15
- CDP วัด: table 373×273px · cols 40/87/120/127 · font 29.3/53.3/18.7/21.3px ✓ — cache `?v=20260930b` — commit `fe877f2`

### 29-30/09 — P052 สติ๊กเกอร์ 10x10 (ใบปะ) — **READY**
- `assets/js/p052-sticker.js` (IIFE `window.P052Sticker`) — **real data MAC5** (`api/p052_search.php`) — **ตาม C# `MCIT_Frm_FaceSheetProductV2`** — clone P053 → rewrite
- **API:** POST {connectionId, vnos} — MIH + DEB by MIHvnos — **type B** = `MIHdesc LIKE '%ส่งต่อ%'` → count = MIHref2 (ไม่ check company) · **type A** = count = รวมตัวเลข MILnotes (MILstk NOT IN BI_CUBE.tb_FaceSheetSTK STKnotCount='1') — count <= 0 → modal ใส่จำนวน — **company** = MIHcus IN BI_CUBE.tb_FaceSheetDEB หรือ MILstk IN STKnotCompany='1' → NotCompany — ไม่ → Company — **total** = รวมตัวเลข MILnotes ทั้งหมด (ไม่ filter) → แสดง "i/total" — test: A `IVVN6909-0001` count 21/total 21/Company · B `TOUB6908-0008` count 0/total 0
- **ตั๋ว = กระดาษ 282×282pt (10×10cm) ขอบกระดาษ 0 — ตาราง 280pt (373px) 3 คอลั่น (10.7/50/39.3%) — ชิดบนกระดาษ — font THSarabunNew web font (@font-face 4 weights — จาก C# — fonts.css ?v=20260929a)**
- **Layout (user spec — วัด CDP):** r1 "กรุณาส่ง" 30pt B (pad 10/10) · r2 **130px** (pad-top 10) = DEBnameT + DEBcontactT (26pt B — **ทั้ง A + B**) · r3 barcode **170×45 CODE128** + i/total **40pt B valign middle rowspan 2** · r4 vnos + วันที่ 14pt (pad-top 0) · r5 **17px pad-top 0 pad-left 2 word-break** = A: ที่อยู่บริษัท 3 บรรทัด (br ×2) / B: "จาก DEBnameT DEBcontactT Tel : DEBtel" — **ไม่มีเส้นตาราง** (border 0 — user ตัดออก)
- **Preview:** zoom 100% (range 0.25–2.5) + พอดีจอ + wheel เลื่อนหน้า — **พิมพ์:** `.p052-printroot` + `@page{size:282pt 282pt;margin:0}` + sheet static + page-break-after — 1 ตั๋ว/หน้า
- test CDP: A `IVVN6909-0001` (21 หน้า) + B `TOUB6908-0008` — sheet 376×376px + table 373px + font sizes + padding + r5 wrap ไม่ล้น — cache `p052-sticker.js?v=20260929u` — modules.php status **ready** — **20 modules ready**

### 29/09 — P015 สถานะบิลค้างรับ — **READY**
- `assets/js/p015-bill-status.js` (IIFE `window.P015BillStatus`) — **real data MAC5 2 APIs** (`p015_search` / `p015_status`) — ตาม C# `Frm_CheckBillReceiptGUI` (AppCheckBillReceipt) + demo/P015-demo.html
- **search:** `api/p015_search.php` — POST {connectionId, keyword} — CFS (CFSclearALL=0 + net != 0) + DEB (ชื่อ/เขต) + `BI_CUBE.tb_CFS_bill_status` (Billing/AccruedBill/comment) — keyword LIKE 3 ช่อง (CFSvnosID/CFScusID/DEBnameT) — **ต้องมีค่า >= 1 ตัวอักษร** (block ว่าง — border แดง + toast) — ORDER BY CFScusID, DEBnameT — test: 10100-020 = 7 rows · IVVF6908 = ค้นหาโดยเลขที่ ✓
- **save:** `api/p015_status.php` — POST {connectionId, rows[]} — **upsert** `BI_CUBE.tb_CFS_bill_status` (key vnos+cus — UPDATE ถ้ามี / INSERT ถ้าไม่มี — transaction) — test round-trip: save → verify DB → revert ✓
- **UI 2 cards:** เงื่อนไขค้นหา (รหัสลูกหนี้ + ปุ่มค้นหา) + ตารางบิลค้างรับ (วันที่/เลขที่/รหัส/ชื่อ/เขต/ยอดหนี้/วางบิล tag/ค้างบิล tag/หมายเหตุ — **display เท่านั้น — table-layout:fixed — หมายเหตุ 26% กว้างที่สุด + wrap** — user iterated 5%→16%→26%) + **pagination 15 รายการ/หน้า** (pager กป๋านหัวหน้า) + sort column + **ยอดรวมฟุตเตอร์** (ยอดวางบิล/ยอดค้างบิล)
- **modal ต่อแถว (user spec 2026-09-29):** **ดับเบิลคลิกแถว = modal "บันทึกสถานะบิล"** (user เปลี่ยน click → dblclick) — info (เลขที่/วันที่/ลูกหนี้/ยอดหนี้) + checkbox **วางบิล/ค้างบิล exclusive** (ตาม C# CellClick — check หนึ่งอัน = อีกอัน uncheck) + หมายเหตุ textarea + ปุ่ม **✎ บันทึก = save 1 แถว** (toast "บันทึก XXX เรียบร้อยแล้ว") — ปิด = × / ปิด / mask click / Escape
- test CDP: mount ✓ · search 10100-020 = 7 rows ✓ · **empty search = block (border แดง + toast) ✓** · **dblclick row = modal ✓ (single click = ไม่เปิด)** · exclusive (billing on → accrued off) ✓ · **save round-trip: modal → DB (Billing=1, comment) → แถว = "✓ วางบิล" + ยอดรวม ฿3,960.00 → revert DB** ✓ — cache `p015-bill-status.js?v=20260929g` — modules.php status **ready** — **19 modules ready**

### 29/09 — P047 เช็คสถานะ Invoice — **READY**
- `assets/js/p047-invoice-status.js` (IIFE `window.P047InvoiceStatus`) — **real data MAC5** (`api/p047_search.php`) — ตาม C# `frm_CheckStatusInvoiceGUI` (AppCheckStatusInvoice) + demo/P047-demo.html
- **search:** range วันที่ (default **วันปัจจุบัน → วันปัจจุบัน** — user spec 2026-09-29) + สถานะ = dropdown checkbox (**user spec SQL 2026-09-29:** `AR_S WHERE AR_SnameT IS NOT NULL AND AR_Scode < 63 AND AR_Scode NOT IN (0,1,5,7,9,10,11,12,13,14,15,18,20,21,22,25,26,27,28,41)` — **32 สถานะ** — name = `code : nameT` เช่น "2 : ปกติ-ส่งขนส่ง" — check ทั้งหมด + ปุ่มเลือกทั้งหมด) — **rows** = MIH (IS, cancel=0, status IN, range วันที่) + DEB + `ISNULL(MIHprintN,0)`
- **UI 2 cards:** เงื่อนไขค้นหา (range + status dropdown) + ตาราง Invoice (วันที่/เลขที่/รหัส/ชื่อ/สถานะ badge (title = ชื่อ status)/จำนวนพิมพ์ — **table-layout:fixed + column width 11/17/14/30/14/14%**) + **pagination 15 รายการ/หน้า** (pager กป๋านหัวหน้า ‹ 1 2 3 › + "หน้า X / Y") + **quick search** (client) + **sort column** (วันที่ sort ใช้ iso) + **click row = select**
- test CDP: default = วันนี้~วันนี้ ✓ · dropdown h=268 ✓ · range 01/07-29/09 = 95 rows → 15 แถว/หน้า ‹1 2› หน้า 1/7 → หน้า 2 = ‹1 2 3› ✓ — cache `p047-invoice-status.js?v=20260929d` + `portal.js?v=20260929a` — modules.php status **ready** — **18 modules ready**

### 28/09 — P037 ตรวจสอบของจองที่มีการเปิดบิล — **READY**
- `assets/js/p037-inv-booking.js` (IIFE `window.P037InvBooking`) — **real data MAC5 2 APIs** (`p037_search` / `p037_items`) — ตาม C# `FrmINVGUI` + `INVResult` (AppINV) + demo/P037-demo.html
- **search:** วันที่ (default วันนี้) + ดำเนินหน้าใบ (IVV/IVN) + รหัสลูกค้า (exact) + เลขที่ใบสำคัญ (exact) + โทรขาย (LIKE) — **INV** = MIH (IS, vnos LIKE type%) + DEB + IC_S — วัน/เดือน/ปี = วันที่ค้นหา · **RSV** = MIH (SS, RSV%) + cancel=0 + status != 4 + เดือน/ปีเดียวกัน + `MIHcus IN (ลูกค้าจาก INV)`
- **UI 3 cards:** เงื่อนไขค้นหา + ตารางใบแจ้งหนี้ (No./วันที่/คus/ชื่อ/ใบสำคัญ/สถานะ badge/โทรขาย) + ตารางใบจอง (วันที่/คus/ชื่อ/ใบสำคัญ/สถานะ(ใบเบิก)/บันทึกภายใน/หมายเหตุ) — **click แถว INV = filter RSV ตามลูกค้า** (ไฮไลต์แถว) · **dblclick = modal items** (INV items vs RSV items — MIL+STK — รหัส/ชื่อ/qty=quan÷conv/หน่วย/VC)
- **สถานะ = IC_S** (1=Draft · 2=Verify+รอ Approve · 3=Approve · 4=Void รอแก้ไข (RSV ตัดออก) · 5=PACKING · 6=ติดท้ายรถ · 7=นัดส่ง · 8=รอโอนเงิน · 10=ยกเลิก) — status 32/42/60+ = ว่างใน IC_S → แสดง '-'
- test CDP: 28/09/2569 IVV = 185 INV + click row = RSV filter ✓ · items API IVVN6909-4436 + RSV16909-0082 ✓ — modules.php status **ready** — cache `p037-inv-booking.js?v=20260928a` + `portal.js?v=20260928a` — **17 modules ready**

### 26/09 — P092 Barcode/สคบ. (พิมพ์ Barcode/สติกเกอร์) — **READY**
- `assets/js/p092-barcode.js` (IIFE `window.P092Barcode`) — **real data MAC5 3 APIs** (`p092_search` / `p092_autocomplete` TOP20 / `p092_running` get+save STKrunning)
- รหัสสินค้า (autocomplete) → modal ตั้งค่า 3 blocks (① ประเภท สคบ./Barcode ② ขนาด เล็ก/กลาง/ใหญ่/ใหญ่ 10×7 — สคบ. = เล็กเสมอ ③ จำนวน int + หน่วย) → sticker sheet 1 ตัว/หน้า → print `@page size` ตามกระดาษ margin 0
- **Layouts ตาม C#:** สคบ. เล็ก 292×76pt (5 คอลั่น 92pt 6px) / กลาง 290×100pt (2 คอลั่น 143/145pt 8px) · Barcode เล็ก 289pt (93/5/93/5/93 — แถว 1 STKBarcode 30px · แถว 2 EAN13 110×60) / กลาง 269pt (20/122/5/20/122 — 3 แถว + S/N 2 ตัว/หน้า) / ใหญ่ 282×282pt (2 คอลั่น 100/180 — แถว 100/200/60px — border แถว 1) / ใหญ่ 10×7 282×210pt (โครงเดียวกัน — แถว 85/140/45px — font 12px label หนา)
- **EAN13 = JsBarcode SVG** (canvas เดิมผิด spec ตัด — ean13.ttf PUA only) + `compressEanDigits` (13 tspans spacing 0.60w) · `eanValue` = Barcode{unit} ≥12 ตัว — ว่าง = fallback รหัส pad 0 เป็น 12 ตัว · **S/N** = yyMMdd+running 6 ตัว (CODE128) — save = ceil(qty)×stickersPerPage + พิมพ้ก่อน save
- modules.php status **ready** (2 menus: การตลาด + คลังสินค้า) — cache `?v=20260926i` — **16 modules ready**

### 25/09 — P054 JOB pages (หน้าต่อไป — จาก C# Frm_BucketParts_Version2) — **READY**
- **1 กลุ่มตัวอักษรต้น MILvCol2 = 1 หน้า A4** — แทรกหลังหน้า 1 ของแต่ละ row ที่เลือก — renderPreview fetch 3 APIs (routes + items + **groups**)
- **API `api/p054_groups.php`** (POST `{connectionId, vnos[]}`) — conditions = ตัวอักษรแรกของแต่ละส่วนใน MILvCol2 (split `,` — หมดซ้ำ — เรียง A→Z) · items กลุ่ม = `MILtype='IS' AND MILvCol2 LIKE '%X%' AND STKsnsv != 3` · MIS (snsv=4) = `MIS WHERE MISvnos=? AND MISstk=? AND MISline=?` · packing = `TOP 1 BI_CUBE.dbo.tb_MILPacking.unitpacking` — **test: IVVN6909-3855 → l,m,n** ✓
- **`genStkRows`** (4 รูปแบบ — C# GenSTKTablePage): snsv=4 `A/2` = MIS แจก lot + desc `(q1,q2,...)` · `A/3` = 3 แถว qty=(quan/3)/conv · `A=5,B=3` = ตัดส่วนที่ตรงกับ cond · ปกติ = quan/conv
- **`createJobPage` — spec สุดท้าย (rounds 20260925b→w):**
  - **ตาราง 1 (header 550pt — 50/250/250pt):** col1 = Route (12px) + **ค่า route lookup** (18px 700 mono — เหมือนตาราง 1 หน้า 1) · col2 = **เลขที่ใบสำคัญ (14px mono 700) + barcode 150×50** · col3 = **JOB Open (14px mono 700) + barcode `O-เลขที่-กลุ่ม` 150×50**
  - **ตาราง 2 (ผู้รับ 550pt — 2 คอลั่น 50/500pt):** แถว 1 = colspan 2 "ผู้รับ" (30px 700 + padding-top 20px) · แถว 2 = col1 ว่าง + col2 = **DEBnameT \n DEBcontactT** (ตั้งตรง — ไม่ cleanProductDesc — **font ตาม input ขนาดอักษรชื่อผู้รับ — default 42** — 700 — padding-top 20px — แถวสูง 300px — `white-space: pre-line`) — **ถ้า MIHdesc มี "ส่งต่อ" → MIHmemo แทน**
  - **ตาราง 3 (items 550pt — 20/75/325/70/60pt):** หัวคอลั่น (16px 700) + items (16px — **แถว 30px** — **ไม่ pad**) + packing (20px right)
  - **ตาราง 4 (footer 550pt — 275/275pt):** **position absolute — ขยับขึ้นจากขอบล่าง 150px (bottom 170px) — กึ่งกลางหน้า** — แถว 1 = รหัส-กลุ่ม + JOB Close (14px) · แถว 2 = barcode `รหัส-กลุ่ม` / `C-รหัส-กลุ่ม` (**150×50**)
  - **เส้นตาราง:** ตาราง 1+2 = **เส้นออก ยกเว้นเส้น bottom (แถวสุดท้าย)** · ตาราง 3+4 = **ไร้เส้น** — **ระยะห่างระหว่างตาราง = 10px** (margin-top)
  - **barcode 4 ตัว/หน้า:** header `vn` + `O-vn-X` (150×50) · footer `vn-X` + `C-vn-X` (150×50)
- **หน้า P054 (rounds 20260925j→w):** **input "ขนาดอักษรชื่อผู้รับ"** (type number — value 42 — min 8 max 120 — label ข้างหน้า input ในบรรทัดเดียวกัน — actionbar **ก่อนปุ่ม Print Preview**) — `state.receiverFont` (save ข้าม re-render) — ควบคุม font ชื่อผู้รับตาราง 2 ทุกหน้า JOB · **วันที่ค้นหา = วันปัจจุบัน** (set อัตโนมัติ — reset = วันนี้) · **modal: ปุ่ม "พิมพ์" (primary) ข้างบน (head — ข้าง zoom) — ปุ่มปิด (p054BtnClose + modalfoot) ตัดแล้ว** (ปิด = × หรือ click backdrop)
- **test CDP mock fetch**: 1 ป้าย + 3 JOB pages = "1 ป้าย · 4 หน้า A4" · 12 barcodes · receiver = memo ✓ · items l: 10300158 qty=1 (จาก `l=1,m=1`) ✓
- **modules.php: P054 status ready** (user ยืนยัน 2026-09-25) — cache: `p054-packing.js?v=20260925w`

### 23/09 — P054 Packing Order/Cartonize/ใบจัดกล่อง — **DEV**
- **1 หน้า (ไม่มี tab)** — `assets/js/p054-packing.js` (IIFE `window.P054Packing`) — **real data MAC5** (`api/p054_search.php`)
- **SQL (user verbatim)**: MIH LEFT JOIN DEB — `WHERE MIHvnos IN (SELECT MILvnos FROM MIL WHERE ISNUMERIC(CONVERT(nvarchar(255),MILvCol2))=0 AND CONVERT(nvarchar(255),MILvCol2)!='' AND MILtype='IS' GROUP BY MILvnos)` + วันที่ (CONVERT DATE 103) + MIHstatus + MIHvnos LIKE — ORDER BY MIHvnos — SELECT: date/vnos/DEBcode/DEBnameT/DEBcontactT/status/desc/memo/notes/MIHjob — **test: 2026-09-22 + status 65 = 43 rows** ✓
- **สไตล์ลอก P063 รายการ Invoice** — CSS vars `--p054-*` (light/dark) — filter card (grid 3) + toolbar (h2 "รายการใบสำคัญ" + result text) + actionbar (selicon + "เลือกแล้ว N รายการ" + ปุ่มเลือกทั้งหมด/Print Preview) + table card (th uppercase / td 14px / row hover+selected / doc number = primary monospace)
- **Filter**: วันที่ + **สถานะ** (19 values — 32-Pack ปกติ (default) → 67-Not Ship) + **เลขใบสำคัญ** (search = document เท่านั้น) + ปุ่มค้นหา/ล้างค่า — **doSearch = fetch API** (loading + btn disabled)
- **ตาราง 7 คอลั่น** (checkbox | วันที่ | เลขที่ใบสำคัญ | รหัสลูกค้า | ชื่อลูกค้า | พื้นที่(=DEBcontactT) | สถานะ) — row click = toggle — 0 rows = empty row — **pagination 15/หน้า** (สไตล์ P063: "แสดง X-Y จาก N รายการ · หน้า i/total" + ‹ + ปุ่มเลข (สูงสุด 7, active) + › — เลือกทั้งหมด = รายหน้า — select คร่อมหน้า)
- **Actionbar**: ปุ่มเลือกทั้งหมด + Print Preview (route/font input ตัดแล้ว)
- **Preview modal (A4)** — title "Packing Order" — **zoom − / % / + / พอดีจอ** (25-250%) — 1 หน้า A4 = 794×1123px (padding **15pt** ทั้ง 4 ด้าน) — **4 ป้าย/หน้า** — **ป้าย = table 550pt × 65pt ขอบ 1px — colgroup 55pt/155pt/340pt — กึ่งกลางกระดาษ** (table-layout fixed): col1 **"Route" (12px) + [Route] (18px ตัวหนา)** (จาก BI_CUBE.dbo.JOB_TransportRoute ตาม JOBcode — fallback JOBcode — monospace) · col2 **text (12px monospace ตัวหนา — ข้างบน) + barcode CODE128 150×50px** (displayValue=false) · col3 "**ชื่อลูกค้า : DEBcode DEBnameT DEBcontactT**" (**16px ปกติ weight 400 — ชิดบน valign top**)
- **พิมพ์** — `.p054-printroot` ระดับ body (pattern P053) + `@page{size:A4;margin:0}` + `.p054-page` 210×297mm + page-break-after — **test: 9 ป้าย = 3 หน้า A4** ✓
- modules.php: P054 status **dev** — **ต่อไป: status ready (ถ้า user ยืนยัน) + test print จริง**

### 22-23/09 — P053 สติ๊กเกอร์ 10x7.5 (ใบปะ) — **READY**
- **1 หน้า (ไม่มี tab)** — `assets/js/p053-sticker.js` (IIFE `window.P053Sticker`) — real data MAC5 — form = เลขที่ใบสำคัญ (44px radius 11px + ปุ่ม gradient + search icon — แบบ P050) + ปุ่มสร้างชิด textbox
- **API `api/p053_search.php`** (POST `{connectionId, vnos}`) — Query 1: MIH LEFT JOIN DEB by MIHvnos — Query 2 (A): MILnotes ยกเว้น BI_CUBE.tb_FaceSheetSTK STKnotCount='1' — วันที่ = **พ.ศ.** (+543)
- **Logic A/B** (user spec): **B** = `MIHdesc LIKE '%ส่งต่อ%'` → count = ตัวเลข **MIHref2** (ถ้า ว่าง/0 → 1 หน้า "1/0" — ไม่มี modal) · **A** = ผลรวม MILnotes (ถ้า ≤0 → modal ใส่จำนวน — ตัวหลัง / = 0)
- **ตั๋ว = table 280×205px ขอบรอบตาราง 1px (ไม่มีเส้นภายใน)** — A: row1 DEBnameT+DEBcontactT 18px ซ้าย (h90) / row2 i/N 30px กลาง / row3 MIHvnos+MIHdate 12px ซ้าย / row4-5 fix text 12px ซ้าย — B: row1 MIHmemo / row3 h20 / row4 "จาก DEBnameT DEBcontactT" / row5 "Tel : DEBtel"
- **Preview = panel เต็มหน้า** (calc(100vh-300px)) — แสดงตลอด (empty state ก่อนสร้าง) — render **1 หน้า** + fit 1 หน้า (margin:auto กลาง wrap) — **zoom เริ่ม 100%** (range 0.25–2.5) — **toolbar ปุ่มกลุ่ม segmented**: [‹]`หน้า i/N`[›] + [−]`%`[+] + พอดีจอ + ปุ่มพิมพ์เขียว — wheel = เลื่อนหน้าถัด ๆ (throttle 300ms)
- **กระดาษ 282×210pt ขอบ 2pt — 1 ตั๋ว/หน้า** — print: render ทั้งหมดใน `.p053-printroot` ระดับ body + `body > *:not(.p053-printroot){display:none}` + `@page{size:282pt 210pt;margin:0}` + sheet static 210pt + page-break-after — วัด printToPDF: 20 sheets = 20 หน้า ✓ (PITFALL: visibility:hidden ยังครอบ layout → หน้าแรกเปล่า)
- test docs: A `IVVN6909-0001` (21 หน้า "1/21") · B `TOUB6908-0008` (ref2 ว่าง → "1/0") · B `IVVN6909-3467` (ref2=20 → "1/20")
- modules.php: P053 status **ready** — **14 modules ready**

### 21/09 — P033 รายงานลูกค้าที่มียอดค้างเกินวงเงิน — **READY**
- **1 หน้า (ไม่มี tab)** — `assets/js/p033-credit-report.js` (IIFE `window.P033CreditReport`) — real data MAC5 — ไม่ load ตอนเปิด (กด "แสดงรายการ" ก่อน) — 0 rows = ว่าง (ไม่มี mock) — **ไม่มี 4 summary cards** (user ตัดออก)
- **Form**: 3 modes (all / overCredit / inCredit) — **ตาราง 10 คอลั่น** (row click | รหัส | ชื่อ | เกรด | ค้างชำระ | คำสั่งส่ง | ค้างเช็ค | รออนุมัติ | วงเงิน | สถานะ) — sortable + quick search + **pagination 15/หน้า** — footer = ยอดค้างรวม + ยอดเกินวงเงิน (filtered ทั้งหมด)
- **API `api/p033_search.php`** (POST `{connectionId, mode}`) — DEB (grade NOT IN X,Z + nameT LIKE %(LM)%) + 4 subquery (sumCFS/sumCPS/sumCHQ/SO) + DEBlimit — mode filter: overCredit = (sum) − limit > 0 · inCredit = ≤ 0
- **Preview modal (A4 Landscape 1123×794px)** — ขอบกระดาษ บน 25pt / ล่าง 25pt / ซ้าย 20pt / ขวา 20pt (print `@page margin:25pt 20pt`) — header 3 จุด: ซ้าย "พิมพ์เมื่อ dd/mm/พ.ศ. HH:MM:SS" · กลาง "รายงานลูกค้าที่มียอดค้างเกินวงเงิน" (absolute center) · ขวา "หน้า X จาก Y" — **ตาราง 10 คอลั่น fixed 800pt** (60/220/30/70×7 — border #000 — font th/td 10px) — **multi-page**: วัด row height ทุกแถว (probe visibility:hidden ที่ body — ชื่อ wrap 23/35px) + chunk ตาม cumulative height — zoom − / % / + / fit (เริ่ม **90%**) + ปุ่ม "พิมพ์เอกสาร" — **ไม่มี printN** (report ไม่ใช่เอกสาร)
- modules.php: P033 status **ready** — **13 modules ready**

### 21/09 — P013 ใบอนุมัติวงเงิน — **READY**
- **1 หน้า (ไม่มี tab)** — Tab 2 ถูกตัดออกทั้งหมด (search/quick search/pager/credit modal/SO modal/mock/API p013_a2 + p013_so_detail) — เหลือแค่ "เอกสารใบอนุมัติวงเงินรออนุมัติ"
- **Tab 1 = real data MAC5** — ค้นหา `api/p013_search.php` (DEB⋈MIH, status=20, type=PS) — 8 คอลั่น + checkbox + sort + pager 15 — ไม่ load ตอนเปิดหน้า
- **รายงานใบอนุมัติวงเงิน (preview modal) = real data ทั้ง 6 ตาราง** — paper F14 612×1009pt margin 30pt — multi-paper (1 ใบ/row ที่เลือก — clone template `#p013PaperTpl` + fetch cache per customer + Promise.all + `page-break-after:always`)
  - T1 ข้อมูล (11×6) — `p013_customer.php` + `p013_amounts.php` — barcode CODE128 (JsBarcode CDN — `first.doc`)
  - T2 รายการ SO/RSV/CN — `p013_lists.php` — T3 หนี้ค้างชำระ — `p013_debts.php` — T4 เช็ครอผ่าน + เฉลี่ย(วัน) — `p013_checks.php` (3 UNION + AVG per CHQno)
  - T5 รายการสั่งขายปัจจุบัน — `p013_so_items.php` (MIL) — T6 ติดตามทวงหนี้ Odoo — `p013_odoo.php` (PostgreSQL `c1788406918263` — **hide ทั้งตารางถ้า 0 rows**)
  - Footer: MIHkeyUser/keyDate/ครั้งที่(MIHprintN+1) + พิมพ์โดย machine + เวลาปัจจุบัน
- **ปุ่ม "พิมพ์เอกสาร" ใน modal** (ปุ่ม label เขียว 40px) — กด = `api/p013_print.php` (**UPDATE MIH SET MIHprintN=ISNULL(MIHprintN,0)+1** ราย doc ที่เลือก) → refresh ตาราง "จำนวนพิมพ์" → `window.print()`
- วงเงินเมื่ออนุมัติแล้ว = (CPS+CFS+CHQ+SO) − วงเงินปัจจุบัน + วงเงินปัจจุบัน (สูตร Row 3 รายงาน)
- modules.php: P013 status **ready** (2 menus — ลูกหนี้ + พิมพ์เอกสาร link) — 12 modules ready + P033 placeholder

### 📅 08/09/2026 — P064 + Docker
- **P064 (clone P063 KTV → MCIT)** — clone ครบทั้ง 8 ขั้นตอน (JS/API×3/report/portal/index/modules)
- P064 final state (หลัง user ปรับหลายรอบ):
  - List table: เพิ่มคอลัมน์ "วันที่ Invoice" (dateDisplay dd/MM/yyyy)
  - Report 3 หน้า: items row height p1/p3=41px, p2=51px; shipping-row 46px; footer margin-top 8px ทุกหน้า; MIN_ROWS=10
  - Items table 7 คอลัมน์ width 70/328/65/65/65/45/80px (col 3 = hidden MILnotes)
  - Totals: จำนวนเงิน=MIHcog, ส่วนลดท้ายบิล=MIHdisc, ยอดเงินหลังหัก=AfterDisc, VAT=MIHvatSUM, ยอดมัดจำ=MIHextraSUM, ยอดชำระ=MIHnetSUM
  - **11/09 ยืนยัน: IVV76909-0052 MIHnetSUM=0 เป็นข้อมูลถูกต้อง — render ตามนั้น อย่า fallback**
- **Docker package** — `C:\AppServ\www\TailorMade_web_docker\` + zip (web:8888 php:8.3-apache, mysql:8:3307) — caveat: image ไม่มี pdo_sqlsrv (P063/P064 report ใช้ไม่ได้ใน docker)

### 📅 09/09/2026 — P115 / P128 / Links / Toast
- **P115 TMS View Picture (ฝ่ายขาย)** — จาก demo: search (วันที่/เลขใบสำคัญ/ทะเบียนรถ) + ตาราง 5 คอลัมน์ + preview ภาพ (zoom 100% default, หมุน 90°, เต็มจอ overlay)
  - Data = Nas200, `tms_receive=1` — **row identity = DB `id`** (ไม่ใช่ tms_invoice_id — หนึ่งเลขที่มีหลายภาพ)
  - ปุ่ม "📄 คัดลอกลิงก์" (P115 เท่านั้น) — copy URL ภาพ
  - Image base = ลิงก์ระบบชื่อ `TMS` ใน settings
- **P128 (clone P115)** — `tms_receive=0` (จัดส่ง) — **ไม่มี** ปุ่มคัดลอกลิงก์ (user: "ใช้ไม่ได้" = หมายถึงเอาออก) — คอลัมน์ "คำสั่ง" = ปุ่ม "บันทึกรับเอกสาร" (save จริง: MAC5 + Nas200 คู่ — **user ทดสอบ save จริงผ่าน 11/09**)
- **No-data toast ทุกหน้า** — "⚠ ไม่พบข้อมูล — ไม่มีรายการที่ตรงกับเงื่อนไขค้นหา" (3200ms) เมื่อ search ได้ 0 — ใช้ใน P063/P064/P115/P128/P022/P031/P032/P111
- **System links (URL) settings** — `api/links.php` + `data/links.json` — section ใน settings (name+url+desc, CRUD) — ใช้กับ P115 (TMS) / P022 (BILLING)
- **P115 rename** — เดิม "TMS View Package V3" → "TMS View Picture (ฝ่ายขาย)"; delivery entry = P128

### 📅 10/09/2026 — P022 / P032
- **P022 View Billing Document** — Nas199: `BillDocument` + `MasterCustomer` — search (รหัส=prefix `code%`, ชื่อ=contains) — **ต้องกรอกรหัสหรือชื่อย่างน้อย 1 ช่อง** ไม่ก่อน toast
  - **SQL = window function** (ROW_NUMBER PARTITION BY cusID) — SQL เดิมของ user (correlated subquery) timeout 60s+ → rewrite = 2.3s broad / 70ms prefix
  - 2 ช่องภาพ (zoom/rotate/เต็มจอ ต่อช่อง) — base = ลิงก์ระบบชื่อ `BILLING` — ไม่มี URL ใต้ภาพ
  - ตาราง 3 คอลัมน์ (รหัส/ชื่อ/เขต) — pager 15/หน้า
- **P032 รายงานเงินมัดจำประจำวัน** — MAC5: CHQ+DEB+ACC — `CHQstatusN IN (5,6)`, CHQno LIKE DEP%/SOC%/SDEP%
  - Filter: ตั้งแต่/จนถึง (default = วันนี้) + รหัสพนักงาน (whitelist 7 ACC codes — server-side)
  - UI: 4 summary cards, ตาราง 8 คอลัมน์ sortable, pager 15/หน้า, dialog รายละเอียด, **ไม่มี** quick search / footer totals (user เอาออก)
  - **Print report** `report/p032_report.php` (.php ไม่ใช่ .html — `php_uname('n')`): A4 landscape ขอบ 20/15/13/13mm, ขาวดำ, 9 คอลัมน์, วันที่ พ.ศ., แถว "รวม" = จำนวนเงินเท่านั้น, "หน้า x/y" วัดจาก DOM probe (rowsPerPage=22 @12px), column widths 50/120/98/99/210/210/95/65/100px
  - **Date binding (SQL Server):** JS `yyyy-mm-dd` → PHP convert → `CONVERT(DATE, ?, 103)` (dd-mm-yyyy) — อย่า bind yyyy-mm-dd ตรง ๆ

### 📅 11/09/2026 — Font / P031 / P111 (วันใหญ่)
- **Font settings (final)** — `assets/js/font-settings.js` — **font family เท่านั้น** (ไม่ใช่ size — ซ้ำกับ UI Scale) — web fonts 4 ตัว (Chakra Petch, K2D, Prompt, Google Sans) ใน `assets/fonts/` + `assets/css/fonts.css` — dropdown ในกลุ่ม "ธีมและการแสดงผล" ข้าง UI Scale — localStorage `erp_font_family` — `.app,.app *{font-family:...!important}` — **report (tab แยก) ไม่ได้รับผลกระทบ**
- **P031 รายงานเงินโอนประจำวัน** — clone P032 — SQL ต่าง: `CHQstatusN IN (2,12)`, 14 LIKE patterns (RER/RVA/CER/VCV/VCF/VAF/VSB/VF1/VF2/VF3/PCC1/PCT1/PCT2/PCT3), `ACC.ACCcode` ใน SELECT + mapping แต่ไม่แสดง
  - Report column widths (user set): **45/100/90/90/220/225/115/55/85px** (ต่างจาก P032!)
  - **P031 ช้า ~6.8s** (96 rows × discount subquery) — ไม่ใช่ bug — CDP test ต้อง wait 10-15s
  - Test: 10–11/09 All = 96 rows ฿1,134,552.31; ACC202 = 70 rows
- **P111 เปลี่ยนสถานะ SO รอโอน** (เริ่มชื่อ P033 — user ย้าย menu → rename ไฟล์ตาม) — **launch-button page** (ไม่ใช่ filter page):
  - **SQL ค้นหา (MAC5 — user ให้ verbatim):**
    ```sql
    SELECT
      CONVERT(DATE, STR(MIH.MIHday)+'-'+STR(MIH.MIHmonth)+'-'+STR(MIH.MIHyear),103) MIHdate,
      MIH.MIHtype, MIH.MIHvnos, MIH.MIHcus, DEB.DEBnameT, MIH.MIHdesc,
      MIH.MIHnetSUM, MIH.MIHextraSUM,
      CONVERT(VARCHAR(10),MIH.MIHstatus)+' : '+CONVERT(VARCHAR(100),AR_S.AR_SnameT) MIHstatus,
      MIH.MIHstatus [status]
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    LEFT JOIN AR_S ON AR_S.AR_Scode = MIH.MIHstatus
    WHERE (MIH.MIHvnos LIKE 'SDEP%' OR MIH.MIHvnos LIKE 'SOCD%')
      AND MIH.MIHtype = 'PS'
      AND MIH.MIHstatus != 14
      AND (MIH.MIHnetSUM - MIH.MIHextraSUM) > 0
      AND MIH.MIHvnos IN (
        SELECT CPSvnosID FROM CPS
        WHERE (CPSvnosID LIKE 'SDEP%' OR CPSvnosID LIKE 'SOCD%')
          AND (CPSstkREQ - CPSstkCUT1) > 0
          AND CPSclearALL = 0
        GROUP BY CPSvnosID
      )
    ORDER BY MIHdate
    ```
  - **SQL เปลี่ยนสถานะ:** `UPDATE MIH SET MIHstatus = '14' WHERE MIHvnos = ?` (14 = รอโอน) — `api/p111_status.php` — whitelist prefix SDEP/SOCD (400), 404 ถ้า 0 rows
  - **UI (final 11/09):** launch bar = ปุ่ม "เริ่มตรวจสอบ" เท่านั้น (checkbox "Test ระบบ" เคยมี — ตัดเงื่อนไข status != 14 ตอน test — **ถูกเอาออกสุดท้าย**) + 3 summary cards (จำนวน/ยอดสุทธิรวม/ยอดมัดจำรวม — ใช้กับ ALL rows) + panel หัว "รายการ SO รอเปลี่ยนสถานะรอโอน" + ตาราง 9 คอลัมน์ (วันที่/เลขใบสำคัญ/รหัสลูกค้า/ชื่อลูกค้า/รายละเอียด/ยอดสุทธิ/ยอดมัดจำ/สถานะ badge/เปลี่ยนสถานะ ปุ่ม) + **footer = "แสดง x–y จาก N" + pager 15/หน้าเท่านั้น** (ไม่มียอดรวมด้านล่าง — user เอาออก) + **table ไม่มี max-height** (ไม่มี scrollbar แนวตั้ง — 15 rows เต็มหน้า)
  - **Status badge:** 14=รอโอน(blue) 15=กำลังตรวจสอบ(amber) 20=เสร็จสิ้น(green) 99=ยกเลิก(red) อื่น=gray (status 21 "อนุมัติสั่งขายได้" = gray)
  - **Dialog เปลี่ยนสถานะ:** 4 ช่อง (เลขใบสำคัญ/ลูกค้า "code - name"/ยอดสุทธิ/สถานะปัจจุบัน) + msg "ยืนยันการเปลี่ยนสถานะรายการ X ?" + footer: status box เขียว "สถานะเปลี่ยนเป็น / 14 : รอโอน" + ปุ่ม ยกเลิก/ยืนยัน — ยืนยัน = save + toast ✓ + refresh — ยกเลิก/esc/คลิกนอก = ปิด
  - **ไฟล์ (rename สุดท้าย):** `api/p111_SO_PendingTransfer.php`, `api/p111_status.php`, `assets/js/p111-SO_PendingTransfer.js` → `window.P111Overlimit`, DOM ids `p111-*`, root `p111Root`
  - **user ทดสอบ save จริงผ่าน — status ready**
- **ข้อยืนยันอื่น ๆ:** P128 real save ผ่าน (user ทำเอง), P064 MIHnetSUM=0 ถูกต้อง

---

## 3. Patterns ที่ใช้ทั่วไป (สำคัญมากสำหรับงานต่อ)

### 3.1 สร้าง program app ใหม่ (pattern มาตรฐาน)
1. `assets/js/p<id>-<name>.js` — IIFE: CSS string (classes ข้างหน้า `p<id>-` ทุกตัว — หลีกเลี่ยงชนกับ portal.css), inline SVG icons (ไม่ใช้ CDN — รัน offline), `window.P<id>Name = { mount }` — **ต้อง inject CSS สู่ DOM ใน mount** (สร้าง `<style>` append to head)
2. `portal.js` — 2 จุด: branch ใน `renderProgramPage` (breadcrumb + back button + `<div id="p<id>Root">`) + mount ใน `bindPageEvents` (`window.P<id>Name.mount(root)`)
3. `index.php` — `<script src="..."></script>` **ก่อน** `portal.js`
4. `data/modules.php` — program อยู่แล้ว (grep ก่อน) — เพิ่ม `"status" => "ready"` เมื่อ user ยืนยัน (program อาจอยู่ใน 2 groups — แก้ทุก occurrence)
5. API — `api/p<id>_*.php` — `require lib/db.php`, `getDb($connId)`, JSON out, **ป้องกัน PHP warning รั่ว** (รีด row key ที่ไม่อยู่ใน SELECT = warning → JSON พัง — ใช้ `?? ''` / `?? 0`)

### 3.2 Clone โมดูล (Python replace — token ยาวก่อนสั้น)
`p115-view-picture` → `p128-view-picture` ก่อน, `P115ViewPicture` → `P128ViewPicture`, แล้ว `p115` → `p128` — verify: `grep -c "p115\|P115"` ในไฟล์ใหม่ = 0

### 3.3 Pager pattern (user-final — ใช้ทุกหน้า)
- pager = แถวส่วนตัวด้านล่างตาราง (border-top, white bg) — `‹ [1][2][3] › ... "แสดง x–y จาก N รายการ"`
- numbered buttons (window `1 … k-1 k k+1 … last`, active = solid primary)
- **hide เมื่อ pages ≤ 1** — client-side pagination 15/หน้า (PAGE_SIZE=15)

### 3.4 Fullscreen overlay pattern
fixed inset:0, z-index 10000, dark bg — top bar (title + url + img) — ปิด: X / backdrop click (`e.target === this`) / Esc (module-level handler — removeEventListener ก่อน add ซ้ำ) — body overflow hidden ขณะเปิด

### 3.5 Print report pattern (P031/P032)
- **ต้องเป็น .php** (.html ไม่ execute `<?= ?>`) — `window.open` ด้วย filter ที่ใช้ค้นหา — refetch API เอง
- A4 landscape ขาวดำ — `@page` margin — "หน้า x/y" = วัด rowsPerPage จาก DOM probe (ไม่ใช่ hardcode) — วันที่ พ.ศ. — content width = (297 − L − R)mm × 96/25.4 — **ตรวจ total px ที่ user ให้ vs content width**

### 3.6 CDP test (เครื่องนี้)
- `browser_exec` **block localhost** — ใช้ CDP node script: spawn `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` (ไม่อยู่ PATH) + `--remote-debugging-port=94xx` + `--user-data-dir=<dedicated>` + `--window-size=1500,1000`
- ws module: `C:/Users/IT.DIV1/AppData/Local/Temp/node_modules/ws`
- `Runtime.evaluate` ต้อง `returnByValue: true` + IIFE `(function(){...})()` + `awaitPromise: true` ถ้ารีturn Promise
- Expression ใน page = ASCII เท่านั้น (Thai string ใน expression พังได้ — select by index)
- Cache-bust: append `&bust=<ts>` เมื่อ verify ซ้ำ (AppServ ไม่มี no-cache header)
- P031/P111 ช้า — wait 10-15s ก่อนอ่าน rows
- `vision_analyze` timeout กับภาพ >1000px — resize ก่อน
- **git-bash + Thai:** `python -c` / heredoc พัง — ใช้ `write_file` + `node script.js`

### 3.7 Pitfalls สำคัญ
- **patch tool กับ Thai text:** tone mark (่/้) พังได้ — verify codepoint + rewrite ทั้งบรรทัดด้วย Python (execute_code)
- **patch tool กับ multi-line:** บางครั้งแปลง quotes ผิด — ถ้าพัง patch ซ้ำหรือใช้ Python
- **ถ้าลบบรรทัด CSS สุดท้ายของ string concat:** ต้องเปลี่ยน `+' +` สุดท้ายเป็น `;` (ไม่ใช่ตัดเฉย ๆ)
- **curl exit 23** แม้ HTTP 200 — ใช้ Python `urllib.request`
- **Sibling subagent corruption:** ถ้า patch warn "modified by sibling" — RE-GREP ไฟล์
- **User language:** "ใช้ไม่ได้" / "ไม่ได้ใช้" = มักหมายถึง **เอาออก** (ไม่ใช่แก้) — ยืนยันก่อน debug
- **User pastes HTML/SQL:** implement verbatim — ถ้าไม่ตรง user บอก "เอาใหม่นะ"
- **User workflow:** ชอบ Q&A + plan ก่อนเริ่ม — "แค่ถาม" = อย่าทำ — "เพิ่มเลย"/"มาเริ่มเลย" = ทำ — progress update ทีละขั้นตอน — UI fix หน่อย ๆ ครั้งละครับ (3-4 rounds)
- **Date user-facing = พ.ศ.** (+543) — folder/label อย่างไรก็ตาม SQL Server date = ค.ศ.

---

## 4. สถานะปัจจุบัน + สิ่งที่ทำต่อได้

### เสร็จแล้ว (ready): P006, P008, P013, P015, P019, P022, P031, P032, P033, P034, P035, P037, P047, P050, P051, P052, P053, P054, P063, P064, P092, P106, P111, P115, P128, P129, P130

### ทำต่อได้
- P036+ (บัญชี), P112, P113-P119 ฯลฯ — placeholders
- **P111 API `testMode` param** — API ยังรับอยู่ (harmless) — ลบได้ถ้าต้องการความสะอาด
- **P031 เร็วขึ้น** — ถ้า user ร้องเรียน: batch-join CQL/MIE ครั้งเดียวแทน per-row TOP 1 subquery

### ข้อมูล test ( ณ 11/09/2026)
- P111: search ปกติ (status != 14) = 0 rows; testMode = ~66-69 rows (status 14)
- P031: 10–11/09 All = 96 rows ฿1,134,552.31; ACC202 = 70 rows
- P032: 09–10/09 = 28 rows ฿652,770.06; ACC202 = 12 rows
- P115: ~200+ docs/วัน; P128: ~32 docs (08/09)

---

## 5. Reference files
- `demo/P032_demo.html`, `demo/P033_demo.html`, `demo/P115_Launcher_Pattern.html` — prototypes
- `docs/HANDOFF.md` — ไฟล์นี้
- Skill `thaimade-portal` (Hermes) — รายละเอียดเพิ่มเติม + references (p064-report-spec.md, tms-table.md, deb-table.md, edge_cdp_probe.js)
### 17/09 — P013 ใบอนุมัติสั่งขายและปรับวงเงิน — **DEV (Tab1 real data MAC5 / Tab2 mock — ยังไม่เสร็จ)**
- `assets/js/p013-approval.js` — IIFE `window.P013Approval` mount `#p013Root` + `api/p013_search.php` (MAC5 `c1788406814359`)
- **Tab 1 "รายการรออนุมัติสั่งขาย" = real data** — ปุ่มค้นหา = `fetch('api/p013_search.php')` — SQL: `DEB INNER JOIN MIH ON MIHcus=DEBcode`, `MIHstatus=20`, `MIHtype='PS'`, date `BETWEEN`(103) + `MIHkeyUser LIKE ?` + `DEBnameT LIKE ?` (prepared, wrap `%...%`) — returns date/doc/code/name/note/amount/printN
- **ไม่ load ตอนเปิดหน้า** — กดค้นหาก่อนถึง fetch — empty state 2 แบบ (ยังไม่ค้นหา / ค้นหาแล้วไม่พบ)
- ตาราง **8 คอลั่น** (☐|วันที่|เลขที่|รหัส|ชื่อ|ยอดเงิน|**จำนวนพิมพ์**|หมายเหตุ) — sort — **ไม่ click/double-click แถว** (เลือก = checkbox, พิมพ์ = ปุ่มพิมพ์) — pagination 15/หน้า
- Tab 2 "อนุมัติสั่งขายและปรับวงเงิน" = **mock** (ยังไม่มี SQL) — launcher 2 cards + ตารางดู (sort — ไม่เลือก — ไม่มี checkbox/preview) + credit modal **ปรับทั้งหมดตาม filter** (in-memory)
- ตัด: summary cards (Tab1 3 ใบ / Tab2 4 ใบ), ปุ่มตัวอย่างก่อนพิมพ์, Odoo, qsearch
- Tab animation `p013TabIn` 0.26s fade+slide
- modules.php: P013 status **dev** (ไม่ได้ ready — Tab2 ยัง mock) — 11 modules ready + P013 dev — P033 placeholder
- **CDP pitfall:** `awaitPromise:true` กับ expression สิ้นสุด (ไม่ใช่ promise) = **hang ตลอด** — ใช้ `returnByValue:true` + `await wait()` ข้าง Node สำหรับ sync steps
- **Next:** Tab 2 SQL (รอรหัสตาราง/condition) — credit modal API (ปัจจุบัน in-memory)

### 17/09 — P050 ใบวางบิล + ใบเสร็จรับเงิน — **READY**
- **Search** — `api/p050_search.php` — MAC5 (`c1788406814359`) — MIH+DEB — prefix select (19 ตัว) + status + วันที่ — **status default = "5" (ไม่ใช่ all)** — test: status ว่าง = 8,803 rows (status=5 = 0 rows — อย่าลืม set status ว่างตอน test)
- **ใบวางบิล** — paper 816×520px / 215.9×137.5mm — `@page margin 0` — 1 หน้า/ใบ + prev/next + keyboard + print ทุกหน้า
- **ใบเสร็จรับเงิน** — `api/p050_billing.php` (SQL เดียวกันกับใบวางบิล — MIH+DEB+PER, Duedate=MIHdate+30) — A4 794×1123px padding 56.69px — `@page{size:210mm 297mm;margin:15mm}` — 4 ตาราง + ลงนาม — layout สุดท้ายใน skill `thaimade-portal` → `references/p050-receipt-report.md`
  - T1: 3 คอลั่น 66.7/15.3/18% — rows 50/50/40/40/50/30px — ไร้ขอบ ไร้ bg — เส้นดำ 1px ใต้ KTV เท่านั้น — labels ตัวหนา — ชื่อ/ที่อยู่ wrap — วันที่ dd/MM/yyyy — แถว 2 (ใบเสร็จรับเงิน 18px) middle
  - T2: 5 คอลั่น 25/25/25/11.11/13.89% — 4 คอลั่น (เลขที่ D/O|ลงวันที่|วันครบกำหนด|จำนวนเงิน colspan=2) — header ตัวหนา — แถว 2 padding-top 10px + item 300px — วันครบกำหนด = blank — ข้อความแถว 3 = 11px
  - T3: 6 คอลั่น 27.78/22.22/19.44/5.56/11.11/13.89% — 11px (cols 5-6 = 12px) — underline inline — ชิด T2 — cols 5-6 มีขอบ
  - T4: 3 คอลั่น 11.76/54.76/21.43% — margin-top 30px — cols 1,3 ไร้ขอบ — col 2 middle — thaiBaht
  - ลงนาม: 2 box 160px h56 — margin-top 100px — font 12px
- **Preview** — 1 หน้า/ครั้ง — zoom localStorage `p050_preview_zoom` — default radio = billing
- modules.php: P050 status ready (11 modules ready — P033 placeholder)

### 14/09 — P034 ประวัติทางการเงินลูกหนี้ — **READY**
- **Data = MAC5 + Odoo 17 (PostgreSQL)** — customer detail page (ไม่ใช่ launcher)
- **ค้นหา = autocomplete** — `api/p034_search.php` — `DEB ⋈ DEG` (TOP 50, DEBhide=0, DEBlock=0) — `DEBcode LIKE ?% OR DEBnameT LIKE ? OR CONVERT(VARCHAR,DEBcontactT) LIKE ?` — item = code + ชื่อ + (อำเภอ) — textbox 50% ไม่มีปุ่มค้นหา — debounce 200ms + sequence guard (race condition)
- **7 cards** — `api/p034_cards.php` — ผู้แทน=DEBsalesP, เครดิต=DEBcreditTerm, วงเงิน=DEBlimit, **ยอด SO**=CPS (sumREQ-sumCUT1, clearALL=0), **ยอด INV**=CFS+CDC (CROSS JOIN), **ยอด Due**=CHQ (status=0, statusN=1), **ยอดเช็คคืนค้างชำระ**=CFS (CBA%)
- **หนี้ค้างชำระ** — `api/p034_debts.php` — CFS (IS, ไม่ใช่ CIV%) + CDC (AS/BS) UNION ALL — 6 col + total row (ยอดรวม = ยอด INV) — วันที่ พ.ศ.
- **เช็ครอผ่าน** — `api/p034_checks.php` — 3 CTE (Paid/ReturnedCheque/Pending) — **2 steps** (PDO ไม่ prepare TOP(@D3) — คำนวณ D1/D2/D3 ก่อน) — 8 col — **เฉลี่ย(วัน)** = AVG(DATEDIFF(MIRbinvDate...)) 1 query ใช้ IN
- **Odoo followup** — `api/p034_followups.php` — conn `c1788406918263` (MERP_live) — project_task ⋈ res_partner (active, stage≠68, project=4, company_registry) — 5 col — ความคิดเห็นกว้าง (table-layout:fixed) — **PostgreSQL lowercases ID → id**
- **Tables:** zebra + column separators + center (ยกเว้นมูลค่า/ยอดรวม right) — followup vertical-align:top — pager 15 ทุกตัว
- Test: 31260-009 (Due 22,587 + เช็ค avg 65), 24000-010 (INV=ยอดรวม 14,140), 34130-009 (Odoo 3 rows)
- **2 เมนู — หน้าเดียวกัน** (type `link`): บัญชี › สินเชื่อ + **ธุรการ › พิมพ์เอกสาร** (modules.php line ~145) — branch `programId === "P034"` — TEST 2026-09-14: ทั้ง 2 เมนูคลิกเปิด p034Ref + breadcrumb ถูกต้อง — **user ยืนยันแล้วทั้ง 2 เมนู**
### 12/09 — P106 Print Barcode — **READY**
- **Data = MAC5** — `api/p106_products.php` 3 SQL (TOP 50, require reference): product = `STK` (STKlock=0, STKhide=0), PO = `MIL⋈STK⋈MIH` MIHtype='PP', Receive = MIHtype='IP' — return STKcode/STKdescT1/STKdescE3/STKbarC1
- **รายละเอียดฉลาก (L/A4)** — `api/p106_details.php` — `BI_CUBE.dbo.STKguide ⋈ STK` (STKhide=0) → STKname/STKguide/STKwarning/CASE DefaultUnit 1-5→STKuname (หน่วย) — บริษัท/ที่อยู่ hardcode (มหาโชค มหาชัย)
- **ฉลาก 4 ขนาด (จาก C# iTextSharp user):** S=387×101px 3 ดวง 102.3×26.8mm margin 0 (name pad-top 10px); M=387×133px 2 ดวง 102.3×35.3mm margin 0; L=376×376px 1 ดวง 99.4×99.4mm margin 15px (name mt15 mb10); A4=794×1123px 8 ดวง (2×4) 210×297mm margin 0 — **1 ช่อง = 272f×205f = 96.22×72.15mm** จัดกลาง
- **Zoom default:** S/M/L = 100%, A4 = 75% (@page size ตามขนาดที่เลือก)
- **Label name = STKdescE3** (fallback STKdescT1) — table column แสดง STKdescT1
- Workspace 45:55, table 4-col (90/auto/110/75px), pager 15, toolbar ล่างชิดขวา
- Test: 10010671 = กรองแสง (descE3) + details ครบ (guide/warning/unit=Ea) — 4 ขนาดวัดจริงผ่าน

### 12/09 — P034 ประวัติทางการเงินลูกหนี้ (mock UI — รอ SQL)
- `assets/js/p034-debtor-history.js` (IIFE P034DebtorHistory) — design จาก demo/P034_demo.html — mock 3 ลูกหนี้ (C-1024/C-2048/C-3072)
- ค้นหารหัส (prefix) / ชื่อ (substring) + require * + toast ไม่พบข้อมูล
- Layout: panel ลูกหนี้ (รหัส+ชื่อ/ที่อยู่/โทร/เริ่มค้าขาย) + 6 cards (วงเงินเครดิต/INV/Due/ค้างชำระ/SO/ผู้แทน) + table หนี้ค้าง 6-col (badge เกินกำหนด=red/amber, รอชำระ=yellow) + table เช็ค/เงินโอน 6-col (ผ่านแล้ว/สำเร็จ=green, รอ clearing=yellow) + timeline ทวงหนี้ — tables pagination 15
- **รอ user:** SQL MAC5 (ค้นหาลูกหนี้, 6 cards, หนี้ค้าง, เช็ค/เงินโอน, ประวัติทวงหนี้ — table timeline มีใน DB ไหม?) → status ready
