<?php
/**
 * P106 — Print Barcode — รายละเอียดฉลาก (L/A4)
 * POST { connectionId, code }
 * { ok, details: { name, guide, warning, nameE, unit } }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$code = isset($body["code"]) ? trim($body["code"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($code === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "รหัสสินค้าไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $st = $db->prepare("SELECT
    A.STKcode,
    A.STKname,
    A.STKguide,
    A.STKwarning,
    A.STKnameE,
    CASE A.DefaultUnit
      WHEN 1 THEN STKuname1
      WHEN 2 THEN STKuname2
      WHEN 3 THEN STKuname3
      WHEN 4 THEN STKuname4
      WHEN 5 THEN STKuname5 ELSE STKuname1
    END DefaultUname,
    A.STKBarcode
    FROM BI_CUBE.dbo.STKguide AS A
    LEFT JOIN dbo.STK B ON B.STKcode = A.STKcode
    WHERE B.STKhide = 0 AND B.STKcode = ?");
  $st->execute([$code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);

  if (!$r) {
    echo json_encode(["ok" => true, "details" => null], JSON_UNESCAPED_UNICODE);
    exit;
  }

  echo json_encode([
    "ok" => true,
    "details" => [
      "name" => isset($r["STKname"]) ? $r["STKname"] : "",
      "guide" => isset($r["STKguide"]) ? $r["STKguide"] : "",
      "warning" => isset($r["STKwarning"]) ? $r["STKwarning"] : "",
      "nameE" => isset($r["STKnameE"]) ? $r["STKnameE"] : "",
      "unit" => isset($r["DefaultUname"]) ? $r["DefaultUname"] : ""
    ]
  ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
