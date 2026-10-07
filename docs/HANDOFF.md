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
| P036 ฯลฯ | อื่น ๆ | placeholder |

---

## 2. รายงานรายวัน

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

### เสร็จแล้ว (ready): P063, P064, P115, P128, P022, P031, P032, P111, P050, P034, P013, P033, P035, P053, P054, P092, P037, P047, P015, P052

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
