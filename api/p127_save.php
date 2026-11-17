<?php
/**
 * P127 — Barcode ห้าง: บันทึกสินค้าใหม่ (โหมดเพิ่มสินค้า)
 * INSERT สู่ BI_CUBE.dbo.tb_ConfigBarcodeStore (คอลั่นตาม SQL loadData ของ C#)
 * POST { connectionId, mac5Code, newCode, newName, size, unit, usage, warning, barcode }
 * คืน { ok, inserted }
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";

$code     = isset($body["mac5Code"]) ? trim((string)$body["mac5Code"]) : "";
$newCode  = isset($body["newCode"]) ? trim((string)$body["newCode"]) : "";
$newName  = isset($body["newName"]) ? trim((string)$body["newName"]) : "";
$size     = isset($body["size"]) ? trim((string)$body["size"]) : "";
$unit     = isset($body["unit"]) ? trim((string)$body["unit"]) : "";
$usage    = isset($body["usage"]) ? trim((string)$body["usage"]) : "";
$warning   = isset($body["warning"]) ? trim((string)$body["warning"]) : "";
$barcode   = isset($body["barcode"]) ? trim((string)$body["barcode"]) : "";

if ($code === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "กรุณากรอกรหัสสินค้า MAC5"), JSON_UNESCAPED_UNICODE);
  exit;
}
if ($newCode === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "กรุณากรอกรหัสสินค้า (ห้าง)"), JSON_UNESCAPED_UNICODE);
  exit;
}
if ($size === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "กรุณากรอกขนาด"), JSON_UNESCAPED_UNICODE);
  exit;
}
if ($unit === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "กรุณากรอกหน่วย"), JSON_UNESCAPED_UNICODE);
  exit;
}
if ($barcode === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "กรุณากรอกรหัสบาร์โค้ด"), JSON_UNESCAPED_UNICODE);
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
  // คอลั่นตาม LOAD DATA ของ C# frm_configBarcodeStore:
  // A.STKcode, A.STKid, A.STKname, A.STKdimension, A.STKunit, A.STKuse, A.STKcaution, A.STKbarcode
  $sql = "INSERT INTO BI_CUBE.dbo.tb_ConfigBarcodeStore " .
    "([STKcode], [STKid], [STKname], [STKdimension], [STKunit], [STKuse], [STKcaution], [STKbarcode]) " .
    "VALUES (:code, :id, :name, :dim, :unit, :use, :caution, :barcode)";
  $st = $db->prepare($sql);
  $st->execute(array(
    ":code" => $code,
    ":id" => $newCode,
    ":name" => $newName,
    ":dim" => $size,
    ":unit" => $unit,
    ":use" => $usage,
    ":caution" => $warning,
    ":barcode" => $barcode
  ));

  echo json_encode(array("ok" => true, "inserted" => $st->rowCount()), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
