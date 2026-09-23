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
| P053 | สติ๊กเกอร์ 10x7.5 (ใบปะ) | ready (1 หน้า — real data MAC5 + logic A/B + table 280×205px + zoom 100% + หน้าถัด ๆ + พิมพ์ 1 ตั๋ว/หน้า) |
| P036 ฯลฯ | อื่น ๆ | placeholder |

---

## 2. รายงานรายวัน

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

### เสร็จแล้ว (ready): P063, P064, P115, P128, P022, P031, P032, P111, P050, P034, P013, P033, P035, P053

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
