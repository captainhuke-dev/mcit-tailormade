<?php
/**
 * ERP Portal — หน้าหลัก
 * ข้อมูล modules อ่านจาก data/modules.php
 * (อนาคต: เปลี่ยนเป็นอ่านจาก MySQL ได้โดยแก้เพียงไฟล์เดียว)
 */

$modules = require __DIR__ . '/data/modules.php';

// ผู้ใช้ปัจจุบัน — ต่อจาก session/auth ในอนาคต
$user = ['name' => 'สมชาย', 'initial' => 'ส'];
?>
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TailorMade</title>
  <script>
    // apply ธีม + UI scale ก่อน render (กันธีมกระพริบ / FOUC)
    (function () {
      var theme = localStorage.getItem("erpTheme") || "light";
      var scale = parseFloat(localStorage.getItem("erpUiScale") || "1");
      if (!(scale >= 0.75 && scale <= 1.5)) scale = 1;
      var effective = theme;
      if (theme === "system") {
        effective = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", effective === "dark" ? "dark" : "light");
      document.documentElement.style.fontSize = Math.round(16 * scale) + "px";
    })();
  </script>
  <link rel="stylesheet" href="assets/css/portal.css">
  <link rel="stylesheet" href="assets/css/fonts.css">
</head>

<body>
  <div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <span class="brand-icon">◈</span>
        <span>TailorMade</span>
        <button class="sidebar-toggle" id="sidebarToggle" aria-label="ซ่อน/ขยายเมนู" title="ซ่อน/ขยายเมนู">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 L5 8 L10 13"/></svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <button class="nav-link active" data-action="show-dashboard" data-tip="หน้าหลัก">
          <span class="nav-icon">⌂</span>
          <span class="nav-label">หน้าหลัก</span>
        </button>

        <p class="nav-title">โมดูลระบบ</p>
        <div id="moduleNav"></div>

        <p class="nav-title">ส่วนบุคคล</p>
        <button class="nav-link" data-action="show-favorites" data-tip="รายการโปรด">
          <span class="nav-icon">★</span>
          <span class="nav-label">รายการโปรด</span>
        </button>
        <button class="nav-link" data-action="show-recent" data-tip="ใช้งานล่าสุด">
          <span class="nav-icon">◷</span>
          <span class="nav-label">ใช้งานล่าสุด</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-link" data-action="show-settings" data-tip="ตั้งค่า">
          <span class="nav-icon">⚙</span>
          <span class="nav-label">ตั้งค่า</span>
        </button>
      </div>
    </aside>
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

    <div class="main-wrap">
      <header class="header">
        <button class="icon-button mobile-menu" id="mobileMenu" aria-label="เปิดเมนู">
          ☰
        </button>

        <button class="search-trigger" data-action="open-search">
          <span>⌕</span>
          <span>ค้นหาโปรแกรม, รหัส Pxxx หรือชื่อเมนู...</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div class="header-actions">
          <button class="icon-button" aria-label="การแจ้งเตือน">🔔</button>
          <button class="icon-button" aria-label="ช่วยเหลือ">?</button>
        </div>
      </header>

      <main class="content" id="appContent"></main>
    </div>
  </div>

  <div class="modal-backdrop" id="commandModal">
    <section class="command-modal" role="dialog" aria-modal="true" aria-label="ค้นหาโปรแกรม">
      <div class="command-input-wrap">
        <span>⌕</span>
        <input
          id="commandInput"
          class="command-input"
          type="text"
          placeholder="ค้นหาโปรแกรม, รหัส Pxxx หรือชื่อเมนู..."
        />
        <kbd>Esc</kbd>
      </div>
      <div class="command-results" id="commandResults"></div>
      <div class="modal-footer">พิมพ์เพื่อค้นหา · กด Esc เพื่อปิดหน้าต่าง</div>
    </section>
  </div>

  <script>
    // ข้อมูลจาก PHP (แก้ที่ data/modules.php ได้)
    window.ERP_MODULES = <?= json_encode($modules, JSON_UNESCAPED_UNICODE) ?>;
    window.ERP_USER = <?= json_encode($user, JSON_UNESCAPED_UNICODE) ?>;
    <?php if (isset($_GET['page'])): ?>
    window.ERP_START_PAGE = <?= json_encode($_GET['page'], JSON_UNESCAPED_UNICODE) ?>;
    <?php endif; ?>

    // ปุ่ม ซ่อน/ขยายเมนูฝ่ายซ้าย — ซึมสถานะใน localStorage
    (function () {
      var app = document.querySelector('.app');
      var btn = document.getElementById('sidebarToggle');
      if (!app || !btn) return;
      if (localStorage.getItem('erp_sidebar_collapsed') === '1') {
        app.classList.add('sidebar-collapsed');
      }
      btn.addEventListener('click', function () {
        var collapsed = app.classList.toggle('sidebar-collapsed');
        try { localStorage.setItem('erp_sidebar_collapsed', collapsed ? '1' : '0'); } catch (e) {}
      });
    })();

    // เมนู mobile — ปุ่ม ☰ + ปั้นฉากกัน (backdrop)
    (function () {
      var sidebar = document.getElementById('sidebar');
      var menuBtn = document.getElementById('mobileMenu');
      var backdrop = document.getElementById('sidebarBackdrop');
      if (!sidebar || !menuBtn || !backdrop) return;
      function closeMobile() {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('visible');
      }
      menuBtn.addEventListener('click', function () {
        var open = sidebar.classList.toggle('mobile-open');
        backdrop.classList.toggle('visible', open);
      });
      backdrop.addEventListener('click', closeMobile);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobile();
      });
    })();
  </script>
  <script src="assets/js/p063-invoice-ktv.js"></script>
  <script src="assets/js/p064-invoice-mcit.js"></script>
  <script src="assets/js/p115-view-picture.js"></script>
  <script src="assets/js/p128-view-picture.js"></script>
  <script src="assets/js/p022-billing-doc.js"></script>
  <script src="assets/js/p111-SO_PendingTransfer.js"></script>
  <script src="assets/js/p031-transfer-report.js"></script>
  <script src="assets/js/p106-print-barcode.js"></script>
  <script src="assets/js/p050-billing.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <script src="assets/js/p013-approval.js?v=20260918eb"></script>
  <script src="assets/js/p033-credit-report.js?v=20260921u"></script>
  <script src="assets/js/p035-approval-check.js?v=20260921i"></script>
  <script src="assets/js/p053-sticker.js?v=20260922ar"></script>
  <script src="assets/js/p054-packing.js?v=20260923u"></script>
  <script src="assets/js/p034-debtor-history.js"></script>
  <script src="assets/js/p032-deposit-report.js"></script>
  <script src="assets/js/font-settings.js"></script>
  <script src="assets/js/portal.js?v=20260923a"></script>
</body>
</html>
