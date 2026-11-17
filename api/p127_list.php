<?php
/**
 * P127 — Barcode ห้าง: รายการหลัก
 * SQL ตาม C# frm_configBarcodeStore.loadData() โดยตรง (ไม่เปลี่ยนคำ)
 * POST { connectionId }
 * คืน { ok, count, rows:[{stkCode, stkDescT1, stkId, stkName, stkDimension, stkUnit, stkUse, stkCaution, stkBarcode}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
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
  // SQL คัดมาจาก C# frm_configBarcodeStore.loadData() — ไม่เปลี่ยนคำ
  $sql = " SELECT A.STKcode,STK.STKdescT1,A.STKid,A.STKname,A.STKdimension,A.STKunit,A.STKuse,A.STKcaution, " .
    " A.STKbarcode FROM BI_CUBE.dbo.tb_ConfigBarcodeStore AS A LEFT JOIN [M5CM-AA-01].dbo.STK AS STK " .
    " ON A.STKcode = STK.STKcode ORDER BY STKcode ASC ";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "stkCode" => (string)$r["STKcode"],
      "stkDescT1" => (string)$r["STKdescT1"],
      "stkId" => (string)$r["STKid"],
      "stkName" => (string)$r["STKname"],
      "stkDimension" => (string)$r["STKdimension"],
      "stkUnit" => (string)$r["STKunit"],
      "stkUse" => (string)$r["STKuse"],
      "stkCaution" => (string)$r["STKcaution"],
      "stkBarcode" => (string)$r["STKbarcode"]
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
