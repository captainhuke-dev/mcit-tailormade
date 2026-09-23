/**
 * ERP Portal — frontend logic
 * ข้อมูล modules มาจาก window.ERP_MODULES (PHP inject)
 * ผู้ใช้มาจาก window.ERP_USER
 * favorites/recent เก็บใน localStorage
 * connections เก็บฝั่งเซิร์ฟเวอร์ (data/connections.json ผ่าน api/connections.php)
 */
(function () {
  "use strict";

  const modules = window.ERP_MODULES || [];
  const user = window.ERP_USER || { name: "สมชาย", initial: "ส" };

  let currentPage = { type: "dashboard" };
  let favorites = JSON.parse(localStorage.getItem("erpFavorites") || "[]");
  let recent = JSON.parse(localStorage.getItem("erpRecent") || "[]");
  let connections = [];
  let connectionsLoading = true;
  let connectionsUnavailable = false;
  let editingConnectionId = null;
  let settingsFlash = null;
  let links = [];
  let linksLoading = true;
  let editingLinkId = null;
  let linksFlash = null;

  const TYPE_LABELS = { mysql: "MySQL", sqlserver: "SQL Server", postgresql: "PostgreSQL" };
  const TYPE_ICONS = { mysql: "🗄", sqlserver: "▣", postgresql: "🐘" };

  /* ---------- appearance: theme + UI scale (localStorage) ---------- */

  let theme = localStorage.getItem("erpTheme") || "light";
  if (!["light", "dark", "system"].includes(theme)) theme = "light";
  let uiScale = parseFloat(localStorage.getItem("erpUiScale") || "1");
  if (!(uiScale >= 0.75 && uiScale <= 1.5)) uiScale = 1;
  let systemDarkTimer = null;

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function effectiveTheme() {
    if (theme === "system") return systemPrefersDark() ? "dark" : "light";
    return theme === "dark" ? "dark" : "light";
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", effectiveTheme());
    localStorage.setItem("erpTheme", theme);
  }

  function watchSystemTheme(on) {
    if (systemDarkTimer) {
      clearInterval(systemDarkTimer);
      systemDarkTimer = null;
    }
    if (on && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const sync = () => { if (theme === "system") applyTheme(); };
      if (mq.addEventListener) mq.addEventListener("change", sync);
      systemDarkTimer = setInterval(sync, 10000); // ตรวจซ้ำทุก 10 วิ (Windows บาง version ไม่ยิง change event)
    }
  }

  function applyUiScale() {
    uiScale = Math.min(1.5, Math.max(0.75, uiScale));
    document.documentElement.style.fontSize = Math.round(16 * uiScale) + "px";
    localStorage.setItem("erpUiScale", String(uiScale));
  }

  function setTheme(next) {
    theme = next;
    applyTheme();
    watchSystemTheme(theme === "system");
  }

  function setUiScale(next) {
    uiScale = next;
    applyUiScale();
  }

  function resetAppearance() {
    setTheme("light");
    setUiScale(1);
    if (typeof ErpFontSettings !== "undefined") ErpFontSettings.reset();
  }

  /* ---------- helpers ---------- */

  function allPrograms() {
    return modules.flatMap(module =>
      module.groups.flatMap(group =>
        group.programs.map(program => ({
          ...program,
          moduleId: module.id,
          moduleName: module.name,
          groupId: group.id,
          groupName: group.name
        }))
      )
    );
  }

  function uniqueProgramCount() {
    return new Set(allPrograms().map(item => item.id)).size;
  }

  /* จำนวนโปรแกรม status:"ready" (ไม่นับซ้ำรายการที่ซ้ำกัน) */
  function readyProgramCount() {
    return new Set(allPrograms().filter(item => item.status === "ready").map(item => item.id)).size;
  }

  function isFavorite(id) {
    return favorites.includes(id);
  }

  function toggleFavorite(id, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    favorites = isFavorite(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];

    localStorage.setItem("erpFavorites", JSON.stringify(favorites));
    renderPage();
  }

  function addRecent(id) {
    recent = [id, ...recent.filter(item => item !== id)].slice(0, 12);
    localStorage.setItem("erpRecent", JSON.stringify(recent));
  }

  function getProgram(id, moduleId = null) {
    const programs = allPrograms();
    return programs.find(item => item.id === id && (!moduleId || item.moduleId === moduleId))
      || programs.find(item => item.id === id);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ---------- connections (server: data/connections.json) ---------- */

  async function connectionsApi(payload = null) {
    const opts = payload
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      : {};
    const res = await fetch("api/connections.php", opts);
    return res.json();
  }

  async function loadConnections() {
    try {
      const data = await connectionsApi();
      if (data.ok && Array.isArray(data.connections)) {
        connections = data.connections;
      }
    } catch (err) {
      // API ไม่ถึง (เปิดผ่าน file://) — ใช้ค่าในเครื่องชั่วคราว
      connectionsUnavailable = true;
      connections = JSON.parse(localStorage.getItem("erpConnections") || "[]");
    }
    connectionsLoading = false;
    if (currentPage.type === "settings") renderPage();
  }

  // ย้ายค่าเก่าจาก localStorage → เซิร์ฟเวอร์ (ครั้งเดียว)
  async function migrateLocalConnections() {
    try {
      const data = await connectionsApi();
      const local = JSON.parse(localStorage.getItem("erpConnections") || "[]");
      const alreadyMigrated = localStorage.getItem("erpConnectionsMigrated") === "1";
      if (data.ok && Array.isArray(data.connections) && data.connections.length === 0 && local.length > 0 && !alreadyMigrated) {
        for (const item of local) {
          await connectionsApi({ action: "save", ...item });
        }
        localStorage.setItem("erpConnectionsMigrated", "1");
      }
    } catch (err) {
      // API ไม่ถึง — ข้ามการย้าย
    }
  }

  /* ---------- sidebar nav ---------- */

  function renderModuleNav() {
    const nav = document.getElementById("moduleNav");

    nav.innerHTML = modules.map(module => `
      <button
        class="nav-link ${currentPage.moduleId === module.id ? "active" : ""}"
        data-nav-module="${escapeHtml(module.id)}"
        data-tip="${escapeHtml(module.name)}"
      >
        <span class="nav-icon">${escapeHtml(module.icon)}</span>
        <span class="nav-label">${escapeHtml(module.name)}</span>
      </button>
    `).join("");
  }

  /* ---------- program card ---------- */

  function programCard(program) {
    const selected = isFavorite(program.id);
    // สถานะ: "ready" = พร้อมใช้งาน (สีเขียว) — ไม่มี = อยู่ระหว่างพัฒนา (สีส้ม)
    const ready = program.status === "ready";
    const statusHtml = ready
      ? `<div class="program-status ready">✓ พร้อมใช้งาน ${program.badge ? `<span style="margin-left:auto;background:#eff6ff;color:#2563eb;padding:3px 7px;border-radius:999px">${escapeHtml(program.badge)}</span>` : ""}</div>`
      : `<div class="program-status">🛠 อยู่ระหว่างพัฒนา ${program.badge ? `<span style="margin-left:auto;background:#eff6ff;color:#2563eb;padding:3px 7px;border-radius:999px">${escapeHtml(program.badge)}</span>` : ""}</div>`;

    return `
      <a class="program-card" href="#" data-program="${escapeHtml(program.id)}" data-module="${escapeHtml(program.moduleId)}">
        <div class="program-top">
          <span class="program-id">${escapeHtml(program.id)}${program.type === "link" ? " ↗" : ""}</span>
          <button
            class="favorite-button ${selected ? "selected" : ""}"
            data-favorite="${escapeHtml(program.id)}"
            title="${selected ? "เลิกปักหมุด" : "ปักหมุด"}"
            aria-label="ปักหมุดรายการโปรด"
          >${selected ? "★" : "☆"}</button>
        </div>
        <h3 class="program-name">${escapeHtml(program.name)}</h3>
        <div class="program-context">${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)}</div>
        ${statusHtml}
      </a>
    `;
  }

  /* ---------- pages ---------- */

  function showDashboard() {
    currentPage = { type: "dashboard" };
    renderPage();
    closeSidebarOnMobile();
  }

  function showModule(moduleId) {
    currentPage = { type: "module", moduleId };
    renderPage();
    closeSidebarOnMobile();
  }

  function showGroup(moduleId, groupId) {
    currentPage = { type: "group", moduleId, groupId };
    renderPage();
    closeSidebarOnMobile();
  }

  function showProgram(programId, moduleId) {
    addRecent(programId);
    currentPage = { type: "program", programId, moduleId: moduleId || null };
    renderPage();
    closeSidebarOnMobile();
  }

  function showFavorites() {
    currentPage = { type: "favorites" };
    renderPage();
    closeSidebarOnMobile();
  }

  function showRecent() {
    currentPage = { type: "recent" };
    renderPage();
    closeSidebarOnMobile();
  }

  function showReady() {
    currentPage = { type: "ready", listPage: 1 };
    renderPage();
    closeSidebarOnMobile();
  }

  function showAll() {
    currentPage = { type: "all", listPage: 1 };
    renderPage();
    closeSidebarOnMobile();
  }

  function showDev() {
    currentPage = { type: "dev", listPage: 1 };
    renderPage();
    closeSidebarOnMobile();
  }

  function showSettings() {
    currentPage = { type: "settings" };
    renderPage();
    closeSidebarOnMobile();
  }

  function renderSettings() {
    const editing = connections.find(item => item.id === editingConnectionId);
    const title = editing ? "แก้ไขการเชื่อมต่อ" : "สร้างการเชื่อมต่อใหม่";

    const rows = connections.length
      ? connections.map(conn => `
          <div class="conn-row">
            <div class="conn-row-main">
              <span class="conn-row-icon">${TYPE_ICONS[conn.type] || "▣"}</span>
              <div>
                <div class="conn-row-name">${escapeHtml(conn.name)}</div>
                <div class="conn-row-detail">${escapeHtml(TYPE_LABELS[conn.type] || conn.type)} · ${escapeHtml(conn.server)}${conn.database ? " / " + escapeHtml(conn.database) : ""}</div>
              </div>
            </div>
            <div class="conn-row-actions">
              <button class="conn-row-btn" data-test-conn="${escapeHtml(conn.id)}" data-test-btn="${escapeHtml(conn.id)}">⚡ ทดสอบ</button>
              <button class="conn-row-btn" data-edit-conn="${escapeHtml(conn.id)}">✎ แก้ไข</button>
              <button class="conn-row-btn danger" data-delete-conn="${escapeHtml(conn.id)}">🗑 ลบ</button>
            </div>
          </div>
        `).join("")
      : `<div class="conn-empty">ยังไม่ได้ตั้งค่าการเชื่อมต่อ — สร้างรายการแรกจากฟอร์มด้านบน</div>`;

    const flash = settingsFlash
      ? `<div class="flash ${settingsFlash.kind}">${escapeHtml(settingsFlash.text)}</div>`
      : "";

    const scalePercent = Math.round(uiScale * 100);

    return `
      <div class="breadcrumb">หน้าหลัก › ตั้งค่า</div>
      <h1 class="page-heading">ตั้งค่า</h1>
      <p class="page-description">จัดการการเชื่อมต่อฐานข้อมูลและรูปแบบการแสดงผล — สร้าง connection ได้หลายรายการและตั้งชื่อได้</p>

      <section class="settings-section">
        <div class="section-heading">
          <h2>ธีมและการแสดงผล</h2>
        </div>

        <div class="appearance-grid">
          <div class="appearance-panel">
            <label>ธีม</label>
            <div class="theme-segment" id="themeSegment">
              <button class="theme-option ${theme === "light" ? "selected" : ""}" type="button" data-theme-choice="light">☀ โหมด Light</button>
              <button class="theme-option ${theme === "dark" ? "selected" : ""}" type="button" data-theme-choice="dark">🌙 โหมด Dark</button>
              <button class="theme-option ${theme === "system" ? "selected" : ""}" type="button" data-theme-choice="system">◐ ตามระบบ</button>
            </div>
            <p class="scale-value">โหมด "ตามระบบ" จะสลับตามธีมของ Windows (ตรวจทุก 10 วินาที)</p>
          </div>

          <div class="appearance-panel">
            <label for="uiScaleInput">UI Scale (ขนาดตัวอักษร/องค์ประกอบ)</label>
            <input id="uiScaleInput" class="scale-slider" type="range" min="0.75" max="1.5" step="0.05" value="${uiScale}">
            <div class="scale-value" id="uiScaleLabel">${scalePercent}% (100% = ปกติ)</div>
          </div>

          ${typeof ErpFontSettings !== "undefined" ? ErpFontSettings.renderAppearancePanel() : ""}
        </div>
        <p class="scale-value" style="margin-top:8px"><button class="text-link appearance-reset" type="button" id="appearanceReset">↺ กลับค่าเริ่มต้น (Light, 100%)</button></p>
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <h2>ลิงก์ระบบ (URL)</h2>
          ${editingLinkId ? `<button class="text-link" data-action="links-new">+ สร้างใหม่</button>` : ""}
        </div>
        ${linksFlash ? `<div class="flash ${linksFlash.kind}">${escapeHtml(linksFlash.text)}</div>` : ""}

        <div class="conn-form">
          <div class="form-grid">
            <div class="form-field">
              <label for="linkName">ชื่อลิงก์</label>
              <input id="linkName" class="form-input" type="text" placeholder="เช่น Odoo 17" value="${escapeHtml(editingLinkId ? (links.find(item => item.id === editingLinkId) || {}).name || "" : "")}">
            </div>
            <div class="form-field">
              <label for="linkUrl">URL</label>
              <input id="linkUrl" class="form-input" type="text" placeholder="https://mahachok.cloud" value="${escapeHtml(editingLinkId ? (links.find(item => item.id === editingLinkId) || {}).url || "" : "")}">
            </div>
          </div>
          <div class="form-field" style="margin-top:12px">
            <label for="linkDesc">รายละเอียด (อธิบายว่าลิงก์นี้ใช้ทำอะไร)</label>
            <textarea id="linkDesc" class="form-input" rows="2" placeholder="เช่น Base folder ของภาพเอกสาร TMS — ใช้กับโปรแกรม P115 ดูภาพ" style="resize:vertical;min-height:56px">${escapeHtml(editingLinkId ? (links.find(item => item.id === editingLinkId) || {}).desc || "" : "")}</textarea>
          </div>

          <div class="form-actions">
            <button class="primary-button" id="btnSaveLink" type="button">💾 บันทึก</button>
            ${editingLinkId ? `<button class="secondary-button" type="button" data-action="links-new">ยกเลิกการแก้ไข</button>` : ""}
          </div>
        </div>

        <div class="conn-list">
          ${links.length
            ? links.map(item => `
              <div class="conn-row">
                <div class="conn-row-main">
                  <span class="conn-row-icon">🔗</span>
                  <div>
                    <div class="conn-row-name">${escapeHtml(item.name)}</div>
                    <div class="conn-row-detail">${escapeHtml(item.url)}</div>
                    ${item.desc ? `<div class="conn-row-note">📝 ${escapeHtml(item.desc)}</div>` : ""}
                  </div>
                </div>
                <div class="conn-row-actions">
                  <button class="conn-row-btn" data-edit-link="${escapeHtml(item.id)}">✎ แก้ไข</button>
                  <button class="conn-row-btn danger" data-delete-link="${escapeHtml(item.id)}">🗑 ลบ</button>
                </div>
              </div>
            `).join("")
            : `<div class="conn-empty">ยังไม่ได้ตั้งค่าลิงก์ — สร้างรายการแรกจากฟอร์มด้านบน</div>`}
        </div>
        <p style="margin:10px 0 0;color:#94a3b8;font-size:12px">💾 เก็บที่ <code>data/links.json</code> — ทุกเครื่องที่เข้าเว็บเห็นรายการเดียวกัน</p>
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <h2>${title}</h2>
          ${editing ? `<button class="text-link" data-action="settings-new">+ สร้างใหม่</button>` : ""}
        </div>
        ${flash}

        <div class="conn-form">
          <div class="form-grid">
            <div class="form-field">
              <label for="connName">ชื่อการเชื่อมต่อ</label>
              <input id="connName" class="form-input" type="text" placeholder="เช่น Production DB" value="${escapeHtml(editing ? editing.name : "")}">
            </div>
            <div class="form-field">
              <label>ชนิดฐานข้อมูล</label>
              <div class="type-radio">
                ${Object.keys(TYPE_LABELS).map(type => `
                  <label class="type-radio-item ${editing && editing.type === type ? "selected" : ""}">
                    <input type="radio" name="connType" value="${type}" ${!editing || editing.type === type ? "checked" : ""}>
                    <span>${TYPE_ICONS[type]} ${TYPE_LABELS[type]}</span>
                  </label>
                `).join("")}
              </div>
            </div>
            <div class="form-field">
              <label for="connServer">Server (host หรือ host:port)</label>
              <input id="connServer" class="form-input" type="text" placeholder="localhost หรือ 192.168.1.10:3306" value="${escapeHtml(editing ? editing.server : "")}">
            </div>
            <div class="form-field">
              <label for="connDatabase">Database</label>
              <input id="connDatabase" class="form-input" type="text" placeholder="ชื่อฐานข้อมูล" value="${escapeHtml(editing ? editing.database : "")}">
            </div>
            <div class="form-field">
              <label for="connUser">User</label>
              <input id="connUser" class="form-input" type="text" placeholder="ผู้ใช้งาน" value="${escapeHtml(editing ? editing.user : "")}">
            </div>
            <div class="form-field">
              <label for="connPassword">Password</label>
              <input id="connPassword" class="form-input" type="password" placeholder="${editing && editing.hasPassword ? '•••••••• (รหัสเดิม — เว้นว่างเพื่อรักรหัสเดิม)' : 'รหัสผ่าน'}">
            </div>
          </div>

          <div class="form-actions">
            <button class="primary-button" id="btnTestConn" type="button" onclick="window.ERP.testConnectionFromForm()">⚡ Test Connection</button>
            <button class="primary-button" id="btnSaveConn" type="button" onclick="window.ERP.saveConnectionFromForm()">💾 บันทึก</button>
            ${editing ? `<button class="secondary-button" type="button" data-action="settings-new">ยกเลิกการแก้ไข</button>` : ""}
          </div>
          <div class="form-result" id="connTestResult"></div>
        </div>
      </section>

      <section class="settings-section">
        <div class="section-heading">
          <h2>${connectionsLoading ? "กำลังโหลด..." : "การเชื่อมต่อที่บันทึกไว้ (" + connections.length + ")"}</h2>
        </div>
        ${connectionsUnavailable ? `<div class="flash error">⚠ โหลดจากเซิร์ฟเวอร์ไม่ได้ — แสดงค่าในเครื่อง (ต้องเปิดผ่าน http://localhost)</div>` : ""}
        <div class="conn-list">
          ${rows}
        </div>
        <p style="margin:10px 0 0;color:#94a3b8;font-size:12px">💾 เก็บที่ <code>data/connections.json</code> — ทุกเครื่องที่เข้าเว็บเห็นรายการเดียวกัน</p>
      </section>
    `;
  }

  function getSettingsForm() {
    return {
      name: document.getElementById("connName").value.trim(),
      type: (document.querySelector('input[name="connType"]:checked') || {}).value || "mysql",
      server: document.getElementById("connServer").value.trim(),
      database: document.getElementById("connDatabase").value.trim(),
      user: document.getElementById("connUser").value.trim(),
      password: document.getElementById("connPassword").value,
    };
  }

  async function testConnectionFromForm() {
    const form = getSettingsForm();
    const resultEl = document.getElementById("connTestResult");
    const testBtn = document.getElementById("btnTestConn");

    if (!form.server) {
      resultEl.className = "form-result error";
      resultEl.textContent = "⚠ ยังไม่ได้ระบุ Server";
      return;
    }

    testBtn.disabled = true;
    resultEl.className = "form-result pending";
    resultEl.textContent = "⏳ กำลังทดสอบการเชื่อมต่อ...";

    try {
      const res = await fetch("api/test_connection.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.ok) {
        resultEl.className = "form-result success";
        resultEl.textContent = "✅ เชื่อมต่อสำเร็จ" + (data.message ? " — " + data.message : "");
      } else {
        resultEl.className = "form-result error";
        resultEl.textContent = "❌ เชื่อมต่อไม่สำเร็จ: " + data.message;
      }
    } catch (err) {
      resultEl.className = "form-result error";
      resultEl.textContent = "❌ เรียก API ไม่สำเร็จ: " + err.message + " (ต้องเปิดผ่าน http://localhost)";
    } finally {
      testBtn.disabled = false;
    }
  }

  async function saveConnectionFromForm() {
    const form = getSettingsForm();

    if (!form.name) {
      settingsFlash = { kind: "error", text: "กรุณาตั้งชื่อการเชื่อมต่อ" };
      renderPage();
      return;
    }
    if (!form.server) {
      settingsFlash = { kind: "error", text: "กรุณากรอก Server" };
      renderPage();
      return;
    }

    const saveBtn = document.getElementById("btnSaveConn");
    if (saveBtn) saveBtn.disabled = true;

    try {
      const payload = { action: "save", ...form };
      if (editingConnectionId) payload.id = editingConnectionId;
      const data = await connectionsApi(payload);
      if (data.ok) {
        if (data.connection) {
          const idx = connections.findIndex(item => item.id === data.connection.id);
          if (idx >= 0) connections[idx] = data.connection;
          else connections = [...connections, data.connection];
        } else {
          await loadConnections();
          return;
        }
        settingsFlash = { kind: "success", text: `บันทึก "${form.name}" แล้ว` };
        editingConnectionId = null;
        renderPage();
      } else {
        settingsFlash = { kind: "error", text: "บันทึกไม่สำเร็จ: " + data.message };
        renderPage();
      }
    } catch (err) {
      settingsFlash = { kind: "error", text: "เรียก API ไม่สำเร็จ: " + err.message };
      renderPage();
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  function editConnection(id) {
    editingConnectionId = id;
    settingsFlash = null;
    renderPage();
    document.getElementById("connName")?.focus();
  }

  function newConnection() {
    editingConnectionId = null;
    settingsFlash = null;
    renderPage();
    document.getElementById("connName")?.focus();
  }

  async function deleteConnection(id) {
    const conn = connections.find(item => item.id === id);
    if (!conn) return;
    if (!confirm(`ลบการเชื่อมต่อ "${conn.name}" ใช่หรือไม่?`)) return;
    try {
      const data = await connectionsApi({ action: "delete", id });
      if (data.ok) {
        connections = connections.filter(item => item.id !== id);
        if (editingConnectionId === id) editingConnectionId = null;
        settingsFlash = { kind: "success", text: `ลบ "${conn.name}" แล้ว` };
        renderPage();
      } else {
        settingsFlash = { kind: "error", text: "ลบไม่สำเร็จ: " + data.message };
        renderPage();
      }
    } catch (err) {
      settingsFlash = { kind: "error", text: "เรียก API ไม่สำเร็จ: " + err.message };
      renderPage();
    }
  }

  async function testSavedConnection(id) {
    const conn = connections.find(item => item.id === id);
    if (!conn) return;
    const btn = document.querySelector(`[data-test-btn="${CSS.escape(id)}"]`);
    if (btn) {
      btn.disabled = true;
      btn.textContent = "⏳ ทดสอบ...";
    }

    try {
      // เซิร์ฟเวอร์อ่านรหัสผ่านจากไฟล์เอง — ไม่ส่งรหัสผ่านผ่าน network
      const data = await connectionsApi({ action: "test", id });
      const message = data.ok
        ? "✅ เชื่อมต่อสำเร็จ" + (data.message ? " — " + data.message : "")
        : "❌ " + data.message;
      alert(`ทดสอบ "${conn.name}"\n\n${message}`);
    } catch (err) {
      alert(`ทดสอบ "${conn.name}" ไม่สำเร็จ: ` + err.message);
    } finally {
      const b = document.querySelector(`[data-test-btn="${CSS.escape(id)}"]`);
      if (b) {
        b.disabled = false;
        b.textContent = "⚡ ทดสอบ";
      }
    }
  }

  /* ---------- links (server: data/links.json) ---------- */

  async function linksApi(payload = null) {
    const opts = payload
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      : {};
    const res = await fetch("api/links.php", opts);
    return res.json();
  }

  async function loadLinks() {
    try {
      const data = await linksApi();
      if (data.ok && Array.isArray(data.links)) {
        links = data.links;
      }
    } catch (err) {
      // API ไม่ถึง — โหมด offline
    }
    linksLoading = false;
    if (currentPage.type === "settings") renderPage();
  }

  function getLinksForm() {
    return {
      name: document.getElementById("linkName").value.trim(),
      url: document.getElementById("linkUrl").value.trim(),
      desc: document.getElementById("linkDesc").value.trim(),
    };
  }

  async function saveLinkFromForm() {
    const form = getLinksForm();
    if (!form.name) {
      linksFlash = { kind: "error", text: "กรุณาตั้งชื่อลิงก์" };
      renderPage();
      return;
    }
    if (!form.url) {
      linksFlash = { kind: "error", text: "กรุณากรอก URL" };
      renderPage();
      return;
    }

    const saveBtn = document.getElementById("btnSaveLink");
    if (saveBtn) saveBtn.disabled = true;

    try {
      const payload = { action: "save", ...form };
      if (editingLinkId) payload.id = editingLinkId;
      const data = await linksApi(payload);
      if (data.ok) {
        if (data.link) {
          const idx = links.findIndex(item => item.id === data.link.id);
          if (idx >= 0) links[idx] = data.link;
          else links = [...links, data.link];
        } else {
          await loadLinks();
          return;
        }
        linksFlash = { kind: "success", text: `บันทึก "${form.name}" แล้ว` };
        editingLinkId = null;
        renderPage();
      } else {
        linksFlash = { kind: "error", text: "บันทึกไม่สำเร็จ: " + data.message };
        renderPage();
      }
    } catch (err) {
      linksFlash = { kind: "error", text: "เรียก API ไม่สำเร็จ: " + err.message };
      renderPage();
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  }

  function editLink(id) {
    editingLinkId = id;
    linksFlash = null;
    renderPage();
    document.getElementById("linkName")?.focus();
  }

  function newLink() {
    editingLinkId = null;
    linksFlash = null;
    renderPage();
    document.getElementById("linkName")?.focus();
  }

  async function deleteLink(id) {
    const item = links.find(entry => entry.id === id);
    if (!item) return;
    if (!confirm(`ลบลิงก์ "${item.name}" ใช่หรือไม่?`)) return;
    try {
      const data = await linksApi({ action: "delete", id });
      if (data.ok) {
        links = links.filter(entry => entry.id !== id);
        if (editingLinkId === id) editingLinkId = null;
        linksFlash = { kind: "success", text: `ลบ "${item.name}" แล้ว` };
        renderPage();
      } else {
        linksFlash = { kind: "error", text: "ลบไม่สำเร็จ: " + data.message };
        renderPage();
      }
    } catch (err) {
      linksFlash = { kind: "error", text: "เรียก API ไม่สำเร็จ: " + err.message };
      renderPage();
    }
  }

  function renderDashboard() {
    const recentPrograms = recent.map(id => getProgram(id)).filter(Boolean).slice(0, 3);
    const favoritePrograms = favorites.map(id => getProgram(id)).filter(Boolean).slice(0, 3);
    const fallbackRecent = ["P042", "P110", "P013"].map(id => getProgram(id)).filter(Boolean);

    return `
      <section>
        <p style="margin:0;color:#2563eb;font-size:14px;font-weight:700">หน้าหลัก</p>
      </section>

      <section class="stats-grid">
        <article class="stat-card clickable" data-action="show-favorites" role="button" tabindex="0">
          <div class="stat-icon amber">★</div>
          <p class="stat-label">รายการโปรด</p>
          <p class="stat-value">${favorites.length} รายการ</p>
        </article>
        <article class="stat-card clickable" data-action="show-recent" role="button" tabindex="0">
          <div class="stat-icon blue">◷</div>
          <p class="stat-label">ใช้การล่าสุด</p>
          <p class="stat-value">${recent.length} รายการ</p>
        </article>
        <article class="stat-card clickable" data-action="show-all" role="button" tabindex="0">
          <div class="stat-icon violet">▦</div>
          <p class="stat-label">โปรแกรมทั้งหมด</p>
          <p class="stat-value">${uniqueProgramCount()} รายการ</p>
        </article>
        <article class="stat-card clickable" data-action="show-ready" role="button" tabindex="0">
          <div class="stat-icon green">✓</div>
          <p class="stat-label">พร้อมใช้งาน</p>
          <p class="stat-value">${readyProgramCount()} รายการ</p>
        </article>
        <article class="stat-card clickable" data-action="show-dev" role="button" tabindex="0">
          <div class="stat-icon orange">🛠</div>
          <p class="stat-label">อยู่ระหว่างพัฒนา</p>
          <p class="stat-value">${Math.max(0, uniqueProgramCount() - readyProgramCount())} รายการ</p>
        </article>
      </section>

      <section class="section">
        <div class="section-heading">
          <h2>โปรแกรมล่าสุด</h2>
          <button class="text-link" data-action="show-recent">ดูทั้งหมด →</button>
        </div>
        <div class="card-grid">
          ${(recentPrograms.length ? recentPrograms : fallbackRecent).map(programCard).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-heading">
          <h2>รายการโปรด</h2>
          <button class="text-link" data-action="show-favorites">จัดการรายการ →</button>
        </div>
        <div class="card-grid">
          ${favoritePrograms.length
            ? favoritePrograms.map(programCard).join("")
            : `<div style="grid-column:1/-1;padding:28px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;background:#fff;text-align:center">
                ยังไม่มีรายการโปรด<br>
                <small>กดไอคอนดาวในรายการโปรแกรมเพื่อปักหมุดไว้ใช้งานภายหลัง</small>
              </div>`
          }
        </div>
      </section>
    `;
  }

  function renderModule(moduleId) {
    const module = modules.find(item => item.id === moduleId);
    if (!module) return renderDashboard();

    return `
      <div class="breadcrumb">หน้าหลัก › ${escapeHtml(module.name)}</div>
      <h1 class="page-heading">${escapeHtml(module.name)}</h1>
      <p class="page-description">โปรแกรมและเครื่องมือสำหรับงาน${escapeHtml(module.name)}</p>

      <section class="module-grid">
        ${module.groups.map(group => `
          <article class="group-card" data-group="${escapeHtml(group.id)}" data-module="${escapeHtml(module.id)}" style="cursor:pointer">
            <div class="group-card-icon">▱</div>
            <h2>${escapeHtml(group.name)}</h2>
            <div class="group-count">${group.programs.length} โปรแกรม</div>
            <p class="group-description">${escapeHtml(group.description || "รายการโปรแกรมในกลุ่มนี้")}</p>
            <span class="group-open">เปิดรายการ →</span>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderGroup(moduleId, groupId) {
    const module = modules.find(item => item.id === moduleId);
    const group = module?.groups.find(item => item.id === groupId);

    if (!module || !group) return renderDashboard();

    return `
      <div class="breadcrumb">หน้าหลัก › ${escapeHtml(module.name)} › ${escapeHtml(group.name)}</div>
      <h1 class="page-heading">${escapeHtml(group.name)}</h1>
      <p class="page-description">${escapeHtml(group.description || "รายการโปรแกรมในกลุ่มนี้")} · ${group.programs.length} โปรแกรม</p>

      <div class="filters">
        <input
          class="filter-input"
          id="groupFilter"
          placeholder="ค้นหาในกลุ่ม${escapeHtml(group.name)}..."
        >
      </div>

      <section class="card-grid" id="groupPrograms">
        ${group.programs.map(program => programCard({
          ...program,
          moduleId: module.id,
          moduleName: module.name,
          groupId: group.id,
          groupName: group.name
        })).join("")}
      </section>
    `;
  }

  function filterGroupPrograms(query, moduleId, groupId) {
    const module = modules.find(item => item.id === moduleId);
    const group = module.groups.find(item => item.id === groupId);
    const normalized = query.trim().toLowerCase();

    const programs = group.programs
      .filter(item => `${item.id} ${item.name}`.toLowerCase().includes(normalized))
      .map(program => ({
        ...program,
        moduleId: module.id,
        moduleName: module.name,
        groupId: group.id,
        groupName: group.name
      }));

    document.getElementById("groupPrograms").innerHTML = programs.length
      ? programs.map(programCard).join("")
      : `<p style="color:#64748b">ไม่พบโปรแกรมที่ตรงกับคำค้นหา</p>`;
  }

  function renderProgram(programId, moduleId) {
    const program = getProgram(programId, moduleId);
    if (!program) return renderDashboard();

    // P063: Print Invoice KTV — หน้าแอปจริง (mock data)
    if (programId === "P063") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p063Root" style="margin-top:20px"></div>
      `;
    }

    // P064: Print Invoice MCIT — หน้าแอป (design เหมือน P063)
    if (programId === "P064") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p064Root" style="margin-top:20px"></div>
      `;
    }

    // P115: TMS View Picture V3 — หน้าค้นหา+ดูเอกสาร (skeleton — mock data)
    if (programId === "P115") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p115Root" style="margin-top:20px"></div>
      `;
    }

    // P128: TMS View Picture (จัดส่ง) — clone from P115
    if (programId === "P128") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p128Root" style="margin-top:20px"></div>
      `;
    }

    // P022: View Billing Document
    if (programId === "P022") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p022Root" style="margin-top:20px"></div>
      `;
    }

    // P111: เปลี่ยนสถานะ SO รอโอน (รายงานลูกค้ายอดค้างเกินวงเงิน)
    if (programId === "P111") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p111Root" style="margin-top:20px"></div>
      `;
    }

    // P106: Print Barcode
    if (programId === "P106") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p106Root" style="margin-top:20px"></div>
      `;
    }

    // P050: ใบวางบิล
    if (programId === "P050") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p050Root" style="margin-top:20px"></div>
      `;
    }

    // P033: รายงานลูกค้าที่มียอดค้างเกินวงเงิน
    if (programId === "P033") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p033Root" style="margin-top:20px"></div>
      `;
    }

    // P034: ประวัติทางการเงินลูกหนี้
    if (programId === "P034") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p034Root" style="margin-top:20px"></div>
      `;
    }

    // P053: สติ๊กเกอร์ 10x7.5 (ใบปะ)
    if (programId === "P053") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p053Root" style="margin-top:20px"></div>
      `;
    }

    // P035: ตรวจสอบลูกค้าติดอนุมัติ
    if (programId === "P035") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p035Root" style="margin-top:20px"></div>
      `;
    }

    // P013: ใบอนุมัติวงเงินและปรับวงเงิน
    if (programId === "P013") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p013Root" style="margin-top:20px"></div>
      `;
    }

    // P031: รายงานเงินโอนประจำวัน
    if (programId === "P031") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p031Root" style="margin-top:20px"></div>
      `;
    }

    // P032: รายงานเงินมัดจำประจำวัน
    if (programId === "P032") {
      const backLabel = program.groupName ? `← กลับไป${program.groupName}` : "← กลับหน้ารายการ";
      return `
        <div class="breadcrumb">
          หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
        </div>
        <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
          ${backLabel}
        </button>
        <div id="p032Root" style="margin-top:20px"></div>
      `;
    }

    return `
      <div class="breadcrumb">
        หน้าหลัก › ${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)} › ${escapeHtml(program.id)} ${escapeHtml(program.name)}
      </div>

      <button class="text-link" style="padding:0" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
        ← กลับไป${escapeHtml(program.groupName)}
      </button>

      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-top:20px">
        <div>
          <div class="program-id">${escapeHtml(program.id)}</div>
          <h1 class="page-heading" style="margin-top:5px">${escapeHtml(program.name)}</h1>
          <p class="page-description">${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)}</p>
        </div>
        <button class="favorite-button ${isFavorite(program.id) ? "selected" : ""}" style="font-size:15px;border:1px solid #e2e8f0;padding:8px 11px" data-favorite="${escapeHtml(program.id)}">
          ${isFavorite(program.id) ? "★ ปักหมุดแล้ว" : "☆ ปักหมุด"}
        </button>
      </div>

      <section class="development-box">
        <div>
          <div class="development-icon">🛠</div>
          <h2>อยู่ระหว่างพัฒนา</h2>
          <p>
            โปรแกรมนี้ยังไม่พร้อมใช้งานในขณะนี้<br>
            กรุณาติดต่อผู้ดูแลระบบ หากต้องการข้อมูลเพิ่มเติม
          </p>
          <button class="primary-button" data-back-to-group="${escapeHtml(program.groupId)}" data-module="${escapeHtml(program.moduleId)}">
            กลับไปหน้ารายการ
          </button>
        </div>
      </section>
    `;
  }

  function renderSavedList(type) {
    const ids = type === "favorites" ? favorites : recent;
    const title = type === "favorites" ? "รายการโปรด" : "ใช้งานล่าสุด";
    const programs = ids.map(id => getProgram(id)).filter(Boolean);

    return `
      <div class="breadcrumb">หน้าหลัก › ${title}</div>
      <h1 class="page-heading">${title}</h1>
      <p class="page-description">
        ${type === "favorites"
          ? "โปรแกรมที่คุณปักหมุดไว้เพื่อเข้าถึงได้รวดเร็ว"
          : "ประวัติการเปิดใช้งานโปรแกรมล่าสุด"}
      </p>

      <section class="card-grid" style="margin-top:28px">
        ${programs.length
          ? programs.map(programCard).join("")
          : `<div style="grid-column:1/-1;padding:36px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff;color:#64748b;text-align:center">
              ${type === "favorites" ? "ยังไม่มีรายการโปรด" : "ยังไม่มีประวัติการใช้งาน"}
            </div>`
        }
      </section>
    `;
  }

  /* หน้ารายการโปรแกรมตาม status — จาก stat card (dedup by id — โปรแกรมเดียวกันอาจอยู่หลายกลุ่ม)
     kind: "all" = ทั้งหมด / "ready" = พร้อมใช้งาน / "dev" = อยู่ระหว่างพัฒนา */
  function renderProgramList(kind) {
    const meta = {
      all:   { title: "โปรแกรมทั้งหมด", desc: "โปรแกรมทั้งหมดในระบบ — กดตัวโปรแกรมเพื่อเปิดใช้งาน" },
      ready: { title: "โปรแกรมพร้อมใช้งาน", desc: "โปรแกรมที่ตั้ง status \"ready\" แล้ว — กดตัวโปรแกรมเพื่อเปิดใช้งาน" },
      dev:   { title: "โปรแกรมอยู่ระหว่างพัฒนา", desc: "โปรแกรมที่ยังไม่พร้อมใช้งาน — กดตัวโปรแกรมเพื่อดูรายละเอียด" }
    }[kind] || { title: "โปรแกรม", desc: "" };

    const seen = new Set();
    const readyIds = new Set(allPrograms().filter(item => item.status === "ready").map(item => item.id));
    const programs = allPrograms()
      .filter(item => kind === "ready" ? item.status === "ready" : kind === "dev" ? (item.status !== "ready" && !readyIds.has(item.id)) : true)
      .filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

    // pagination — 9 การ์ด/หน้า (3×3)
    const PAGE_SIZE = 9;
    const total = programs.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    let cur = currentPage.listPage || 1;
    if (cur > totalPages) cur = totalPages;
    const slice = programs.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
    const start = (cur - 1) * PAGE_SIZE + 1;
    const end = Math.min(cur * PAGE_SIZE, total);

    // ปุ่มหน้า — จานี้ 1 … k-1 k k+1 … last
    let pagerHtml = "";
    if (totalPages > 1) {
      const windowSize = 7;
      let first = Math.max(1, cur - 3);
      let last = Math.min(totalPages, first + windowSize - 1);
      if (last - first < windowSize - 1) first = Math.max(1, last - windowSize + 1);
      const pages = [];
      for (let i = first; i <= last; i++) pages.push(i);
      let btns = "";
      if (first > 1) btns += `<button type="button" data-action="plist-page" data-page="1">1</button>`;
      if (first > 2) btns += `<span class="plist-ellipsis">…</span>`;
      pages.forEach(p => {
        btns += `<button type="button" class="${p === cur ? "active" : ""}" data-action="plist-page" data-page="${p}">${p}</button>`;
      });
      if (last < totalPages - 1) btns += `<span class="plist-ellipsis">…</span>`;
      if (last < totalPages) btns += `<button type="button" data-action="plist-page" data-page="${totalPages}">${totalPages}</button>`;
      pagerHtml = `
        <section class="plist-pager">
          <button type="button" data-action="plist-page" data-page="${cur - 1}" ${cur === 1 ? "disabled" : ""}>‹</button>
          ${btns}
          <button type="button" data-action="plist-page" data-page="${cur + 1}" ${cur === totalPages ? "disabled" : ""}>›</button>
          <span class="plist-info">แสดง ${start}–${end} จาก ${total} รายการ</span>
        </section>`;
    }

    return `
      <div class="breadcrumb">หน้าหลัก › ${meta.title}</div>
      <h1 class="page-heading">${meta.title}</h1>
      <p class="page-description">${meta.desc}</p>

      <section class="card-grid" style="margin-top:28px">
        ${slice.length
          ? slice.map(programCard).join("")
          : `<div style="grid-column:1/-1;padding:36px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff;color:#64748b;text-align:center">
              ยังไม่มีโปรแกรม
            </div>`}
      </section>
      ${pagerHtml}
    `;
  }

  /* ---------- render ---------- */

  function renderPage() {
    renderModuleNav();

    const content = document.getElementById("appContent");
    const page = currentPage;

    if (page.type === "dashboard") content.innerHTML = renderDashboard();
    if (page.type === "module") content.innerHTML = renderModule(page.moduleId);
    if (page.type === "group") content.innerHTML = renderGroup(page.moduleId, page.groupId);
    if (page.type === "program") content.innerHTML = renderProgram(page.programId, page.moduleId);
    if (page.type === "favorites") content.innerHTML = renderSavedList("favorites");
    if (page.type === "recent") content.innerHTML = renderSavedList("recent");
    if (page.type === "all") content.innerHTML = renderProgramList("all");
    if (page.type === "ready") content.innerHTML = renderProgramList("ready");
    if (page.type === "dev") content.innerHTML = renderProgramList("dev");
    if (page.type === "settings") content.innerHTML = renderSettings();

    // bind settings form buttons (post-render)
    if (page.type === "settings") {
      const testBtn = document.getElementById("btnTestConn");
      if (testBtn) testBtn.addEventListener("click", testConnectionFromForm);
      const saveBtn = document.getElementById("btnSaveConn");
      if (saveBtn) saveBtn.addEventListener("click", saveConnectionFromForm);
      const saveLinkBtn = document.getElementById("btnSaveLink");
      if (saveLinkBtn) saveLinkBtn.addEventListener("click", saveLinkFromForm);

      // bind appearance controls
      document.querySelectorAll("[data-theme-choice]").forEach(button => {
        button.addEventListener("click", () => {
          setTheme(button.dataset.themeChoice);
          renderPage();
        });
      });
      const scaleInput = document.getElementById("uiScaleInput");
      if (scaleInput) scaleInput.addEventListener("input", event => {
        const value = parseFloat(event.target.value);
        setUiScale(value);
        const label = document.getElementById("uiScaleLabel");
        if (label) label.textContent = Math.round(value * 100) + "% (100% = ปกติ)";
      });
      const resetBtn = document.getElementById("appearanceReset");
      if (resetBtn) resetBtn.addEventListener("click", () => {
        resetAppearance();
        renderPage();
      });

      // bind font settings (ErpFontSettings)
      if (typeof ErpFontSettings !== "undefined") ErpFontSettings.bindSettingsSection();

      // highlight selected type radio
      document.querySelectorAll(".type-radio-item input").forEach(input => {
        input.addEventListener("change", () => {
          document.querySelectorAll(".type-radio-item").forEach(item => item.classList.remove("selected"));
          input.closest(".type-radio-item").classList.add("selected");
        });
      });
    }

    // bind group filter input (post-render)
    const filterInput = document.getElementById("groupFilter");
    if (filterInput && page.type === "group") {
      filterInput.addEventListener("input", event => {
        filterGroupPrograms(event.target.value, page.moduleId, page.groupId);
      });
    }

    // P063: mount Print Invoice KTV app
    if (page.type === "program" && page.programId === "P063" && window.P063InvoiceKTV) {
      const root = document.getElementById("p063Root");
      if (root) window.P063InvoiceKTV.mount(root);
    }

    // P064: mount Print Invoice MCIT app
    if (page.type === "program" && page.programId === "P064" && window.P064InvoiceMCIT) {
      const root = document.getElementById("p064Root");
      if (root) window.P064InvoiceMCIT.mount(root);
    }

    // P115: mount TMS View Picture (ฝ่ายขาย) app
    if (page.type === "program" && page.programId === "P115" && window.P115ViewPicture) {
      const root = document.getElementById("p115Root");
      if (root) window.P115ViewPicture.mount(root);
    }

    // P128: mount TMS View Picture (จัดส่ง) app (clone from P115)
    if (page.type === "program" && page.programId === "P128" && window.P128ViewPicture) {
      const root = document.getElementById("p128Root");
      if (root) window.P128ViewPicture.mount(root);
    }

    // P022: mount View Billing Document app
    if (page.type === "program" && page.programId === "P022" && window.P022BillingDoc) {
      const root = document.getElementById("p022Root");
      if (root) window.P022BillingDoc.mount(root);
    }

    // P111: mount เปลี่ยนสถานะ SO รอโอน (report ลูกค้ายอดค้างเกินวงเงิน)
    if (page.type === "program" && page.programId === "P111" && window.P111Overlimit) {
      const root = document.getElementById("p111Root");
      if (root) window.P111Overlimit.mount(root);
    }

    // P031: mount รายงานเงินโอนประจำวัน app
    if (page.type === "program" && page.programId === "P031" && window.P031TransferReport) {
      const root = document.getElementById("p031Root");
      if (root) window.P031TransferReport.mount(root);
    }

    // P032: mount รายงานเงินมัดจำประจำวัน app
    if (page.type === "program" && page.programId === "P032" && window.P032DepositReport) {
      const root = document.getElementById("p032Root");
      if (root) window.P032DepositReport.mount(root);
    }

    // P050: mount Billing app
    if (page.type === "program" && page.programId === "P050" && window.P050Billing) {
      const root = document.getElementById("p050Root");
      if (root) window.P050Billing.mount(root);
    }

    // P033: mount Credit Report app
    if (page.type === "program" && page.programId === "P033" && window.P033CreditReport) {
      const root = document.getElementById("p033Root");
      if (root) window.P033CreditReport.mount(root);
    }

    // P034: mount Debtor History app
    if (page.type === "program" && page.programId === "P034" && window.P034DebtorHistory) {
      const root = document.getElementById("p034Root");
      if (root) window.P034DebtorHistory.mount(root);
    }

    // P035: mount Approval Check app
    if (page.type === "program" && page.programId === "P035" && window.P035ApprovalCheck) {
      const root = document.getElementById("p035Root");
      if (root) window.P035ApprovalCheck.mount(root);
    }

    // P053: mount Sticker app
    if (page.type === "program" && page.programId === "P053" && window.P053Sticker) {
      const root = document.getElementById("p053Root");
      if (root) window.P053Sticker.mount(root);
    }

    // P013: mount Approval app
    if (page.type === "program" && page.programId === "P013" && window.P013Approval) {
      const root = document.getElementById("p013Root");
      if (root) window.P013Approval.mount(root);
    }

    // P106: mount Print Barcode app
    if (page.type === "program" && page.programId === "P106" && window.P106PrintBarcode) {
      const root = document.getElementById("p106Root");
      if (root) window.P106PrintBarcode.mount(root);
    }
  }

  /* ---------- command palette ---------- */

  function openCommandPalette() {
    const modal = document.getElementById("commandModal");
    const input = document.getElementById("commandInput");

    modal.classList.add("open");
    input.value = "";
    renderSearchResults("");
    setTimeout(() => input.focus(), 50);
  }

  function closeCommandPalette() {
    document.getElementById("commandModal").classList.remove("open");
  }

  function closeIfBackdrop(event) {
    if (event.target.id === "commandModal") closeCommandPalette();
  }

  function renderSearchResults(query) {
    const normalized = query.trim().toLowerCase();
    const results = allPrograms()
      .filter(program => {
        const text = `${program.id} ${program.name} ${program.moduleName} ${program.groupName}`.toLowerCase();
        return !normalized || text.includes(normalized);
      })
      .slice(0, 12);

    document.getElementById("commandResults").innerHTML = results.length
      ? results.map(program => `
          <button class="result-item" data-result="${escapeHtml(program.id)}" data-module="${escapeHtml(program.moduleId)}">
            <span class="result-id">${escapeHtml(program.id)}</span>
            <span class="result-name">${escapeHtml(program.name)}</span>
            <span class="result-context">${escapeHtml(program.moduleName)} › ${escapeHtml(program.groupName)}</span>
          </button>
        `).join("")
      : `<div class="empty-result">ไม่พบโปรแกรมที่ตรงกับคำค้นหา</div>`;
  }

  /* ---------- mobile sidebar ---------- */

  function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("mobile-open");
  }

  function closeSidebarOnMobile() {
    document.getElementById("sidebar").classList.remove("mobile-open");
  }

  /* ---------- global event delegation ---------- */

  document.addEventListener("click", event => {
    const navModule = event.target.closest("[data-nav-module]");
    if (navModule) {
      showModule(navModule.dataset.navModule);
      return;
    }

    const favoriteBtn = event.target.closest("[data-favorite]");
    if (favoriteBtn) {
      toggleFavorite(favoriteBtn.dataset.favorite, event);
      return;
    }

    const programLink = event.target.closest("[data-program]");
    if (programLink) {
      event.preventDefault();
      showProgram(programLink.dataset.program, programLink.dataset.module);
      return;
    }

    const groupCard = event.target.closest("[data-group]");
    if (groupCard) {
      showGroup(groupCard.dataset.module, groupCard.dataset.group);
      return;
    }

    const backToGroup = event.target.closest("[data-back-to-group]");
    if (backToGroup) {
      showGroup(backToGroup.dataset.module, backToGroup.dataset.backToGroup);
      return;
    }

    const resultItem = event.target.closest("[data-result]");
    if (resultItem) {
      closeCommandPalette();
      showProgram(resultItem.dataset.result, resultItem.dataset.module);
      return;
    }

    const action = event.target.closest("[data-action]");
    if (action) {
      const value = action.dataset.action;
      if (value === "open-search") openCommandPalette();
      if (value === "show-dashboard") showDashboard();
      if (value === "show-favorites") showFavorites();
      if (value === "show-recent") showRecent();
      if (value === "show-ready") showReady();
      if (value === "show-all") showAll();
      if (value === "show-dev") showDev();
      if (value === "plist-page") {
        const p = parseInt(action.dataset.page, 10);
        if (p >= 1 && currentPage && (currentPage.type === "all" || currentPage.type === "ready" || currentPage.type === "dev")) {
          currentPage.listPage = p;
          renderPage();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
      if (value === "show-settings") showSettings();
      if (value === "settings-new") newConnection();
      if (value === "links-new") newLink();
      return;
    }

    const editConn = event.target.closest("[data-edit-conn]");
    if (editConn) {
      editConnection(editConn.dataset.editConn);
      return;
    }

    const deleteConn = event.target.closest("[data-delete-conn]");
    if (deleteConn) {
      deleteConnection(deleteConn.dataset.deleteConn);
      return;
    }

    const testConn = event.target.closest("[data-test-conn]");
    if (testConn) {
      testSavedConnection(testConn.dataset.testConn);
      return;
    }

    const editLnk = event.target.closest("[data-edit-link]");
    if (editLnk) {
      editLink(editLnk.dataset.editLink);
      return;
    }

    const deleteLnk = event.target.closest("[data-delete-link]");
    if (deleteLnk) {
      deleteLink(deleteLnk.dataset.deleteLink);
      return;
    }
  });

  document.addEventListener("keydown", event => {
    const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

    if (isSearchShortcut) {
      event.preventDefault();
      openCommandPalette();
    }

    // stat card — Enter/Space (tabindex=0)
    if ((event.key === "Enter" || event.key === " ") && event.target.classList && event.target.classList.contains("stat-card")) {
      event.preventDefault();
      event.target.click();
    }

    if (event.key === "Escape") {
      closeCommandPalette();
      closeSidebarOnMobile();
    }
  });

  // expose for inline handlers / debugging
  window.ERP = { showDashboard, showModule, showGroup, showProgram, showFavorites, showRecent, showReady, showAll, showDev, showSettings, openCommandPalette, closeCommandPalette, testConnectionFromForm, saveConnectionFromForm, editConnection, newConnection, deleteConnection, saveLinkFromForm, editLink, newLink, deleteLink, setTheme, setUiScale, resetAppearance, getAppearance: () => ({ theme, uiScale }) };

  // command palette: live search + backdrop close
  document.getElementById("commandInput").addEventListener("input", event => {
    renderSearchResults(event.target.value);
  });

  document.getElementById("commandModal").addEventListener("click", closeIfBackdrop);

  // deep-link: ?page=settings|favorites|recent|module:<id>|program:<id>
  if (window.ERP_START_PAGE) {
    const page = window.ERP_START_PAGE;
    if (page === "settings") showSettings();
    else if (page === "favorites") showFavorites();
    else if (page === "recent") showRecent();
    else if (page === "ready") showReady();
    else if (page === "all") showAll();
    else if (page === "dev") showDev();
    else if (page.indexOf("module:") === 0) showModule(page.slice(7));
    else if (page.indexOf("program:") === 0) showProgram(page.slice(8));
  }

  // โหลด connections + links จากเซิร์ฟเวอร์ + ย้ายค่าเก่าจาก localStorage (ครั้งเดียว)
  migrateLocalConnections();
  loadConnections();
  loadLinks();

  // apply ธีม + UI scale ที่บันทึกไว้ (กัน FOUC มี inline script ใน <head> ของ index.php)
  applyTheme();
  applyUiScale();
  watchSystemTheme(theme === "system");

  renderPage();
})();
