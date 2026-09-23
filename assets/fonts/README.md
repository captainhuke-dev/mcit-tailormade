# Fonts folder

เก็บไฟล์ font ที่ download มาไว้ที่นี่ เช่น:
- `NotoSansThai-Regular.ttf` / `.woff2`
- `Sarabun-Regular.ttf` / `.woff2`

## วิธีใช้ (web font)

1. วางไฟล์ font ในโฟลเดอร์นี้
2. ระบุ `@font-face` ใน `assets/css/fonts.css` (สร้างใหม่) เช่น:

```css
@font-face {
  font-family: 'Noto Sans Thai';
  src: url('../fonts/NotoSansThai-Regular.woff2') format('woff2'),
       url('../fonts/NotoSansThai-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

3. สคริปต์ `<link rel="stylesheet" href="assets/css/fonts.css">` ใน `index.php`

## หมายเหตุ

- **woff2** เร็วกว่า ttf — ใช้ woff2 เป็นหลัก (แปลงที่ https://www.fontsquirrel.com/tools/webfont-generator)
- font ที่ลงไว้ในเครื่อง (System font) ไม่ต้องเก็บที่นี่ — น่าจะใช้ `font-family` ตรงๆ ได้
- font ในโฟลเดอร์นี้ = **web font** — โหลดผ่านเว็บ (ใช้ได้กับทุกเครื่องที่เข้าเว็บ)
- report/*.php (หน้าพิมพ์) ก็สามารถ load fonts.css ได้เช่นกัน — ถ้าต้องการให้ report ใช้ font เดียวกัน
