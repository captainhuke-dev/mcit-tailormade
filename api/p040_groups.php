<?php
/**
 * P040 — ตรวจสอบค้างส่งสินค้า LOT: รายการกลุ่มสินค้า
 * SQL คัดออกจาก C# FrmCheckCPSproductLotGUI.getSTKgroup
 * POST { connectionId }
 * คืนค่า { ok, count, groups:[...] }
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# getSTKgroup — กลุ่มสินค้าจาก STK (STKsnsv=4, ไม่ใช้เรียล/ไม่ใช้ซ่อน)
  $sql = "SELECT DISTINCT LEFT(STKgroup,4) AS STKgroup" .
    " FROM STK" .
    " WHERE STKsnsv = 4 AND (STKlock = 0 OR STKhide = 0)" .
    " ORDER BY STKgroup";
  $st = $db->query($sql);
  $groups = $st->fetchAll(PDO::FETCH_COLUMN);
  echo json_encode(array(
    "ok" => true,
    "count" => count($groups),
    "groups" => $groups
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
