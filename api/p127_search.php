<?php
/**
 * P127 — Barcode ห้าง: autocomplete รหัสสินค้า MAC5 (โหมดเพิ่มสินค้า)
 * SQL ตามที่ผู้ใช้สั่ง (ไม่เปลี่ยนคำ SQL):
 * SELECT TOP 15 STK.STKcode, STK.STKgroup, STK.STKdescT1
 * FROM STK LEFT JOIN BI_CUBE.dbo.tb_ConfigBarcodeStore AS B ON STK.STKcode = B.STKcode
 * WHERE B.STKcode IS NULL AND STK.STKlock = 0 AND STK.STKhide = 0
 * AND STK.STKcode LIKE '100104%' AND STK.STKdescT1 LIKE '%%' ORDER BY STK.STKcode
 * POST { connectionId, code, name }
 * คืน { ok, count, rows:[{stkCode, stkGroup, stkDescT1}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
// รับแต่ตัวเลข/รหัส — ตัดลักศูล์เพื่อป้องกัน SQL break
$code = isset($body["code"]) ? str_replace("'", "", trim((string)$body["code"])) : "";
$name = isset($body["name"]) ? str_replace("'", "", trim((string)$body["name"])) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL คัดตามคำสั่ง — ไม่เปลี่ยนคำ
  $sql = "SELECT TOP 15 STK.STKcode, STK.STKgroup, STK.STKdescT1 ";
  $sql .= "FROM STK ";
  $sql .= "LEFT JOIN BI_CUBE.dbo.tb_ConfigBarcodeStore AS B ON STK.STKcode = B.STKcode ";
  $sql .= "WHERE B.STKcode IS NULL ";
  $sql .= "AND STK.STKlock = 0 ";
  $sql .= "AND STK.STKhide = 0 ";
  $sql .= "AND STK.STKcode LIKE '" . $code . "%' ";
  $sql .= "AND STK.STKdescT1 LIKE '%" . $name . "%' ";
  $sql .= "ORDER BY STK.STKcode";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "stkCode" => (string)$r["STKcode"],
      "stkGroup" => (string)$r["STKgroup"],
      "stkDescT1" => (string)$r["STKdescT1"]
    );
  }

  echo json_encode(array(
    "ok" => true,
    "count" => count($out),
    "rows" => $out
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
