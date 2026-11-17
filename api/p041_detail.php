<?php
/**
 * P041 — รายละเอียดสินค้า (เมื่อคลิกแถว)
 * SQL คัดมาจาก C# FrmReserveNotLinkGUI.dtMIL
 * POST { connectionId, vnos }
 * คืน { ok, count, rows:[{code, name, qty, unit, value}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$vnos = isset($body["vnos"]) ? trim($body["vnos"]) : "";

if ($vnos === "") {
  echo json_encode(array("ok" => false, "error" => "ขาดเลขที่ใบ (vnos)"), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# dtMIL — ไม่เปลี่ยนคำ
  $sql = "SELECT MILstk, MILdesc, (MILquan / MILconv) MILquan, MILuname, MILsum FROM MIL WHERE MILvnos = ?";
  $st = $db->prepare($sql);
  $st->execute(array($vnos));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "code" => (string)$r["MILstk"],
      "name" => (string)$r["MILdesc"],
      "qty" => $r["MILquan"],
      "unit" => (string)$r["MILuname"],
      "value" => $r["MILsum"]
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
