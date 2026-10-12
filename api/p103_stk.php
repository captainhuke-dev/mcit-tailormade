<?php
/**
 * P103 — ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง — picker สินค้า (MAC5)
 * clone C# frm_selectSTK.cs
 * POST { connectionId, kw }
 * { ok, count, rows: [{code, name, mainUnit, subUnit}] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$kw = isset($body["kw"]) ? trim($body["kw"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
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
  // clone C# frm_selectSTK.searchDATA — TOP 15 (web picker — user limit)
  $sql = "SELECT TOP 15 STKcode, STKdescT1,
          CASE STKunit1 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 ELSE '' END AS MainUnit,
          CASE STKunit2 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 ELSE '' END AS SubUnit
          FROM STK
          WHERE STKhide = 0 AND STKlock = 0 AND STKsnsv != 3
          AND (STKcode LIKE ? OR STKdescT1 LIKE ?)";
  $st = $db->prepare($sql);
  $like = "%" . $kw . "%";
  $st->execute([$like, $like]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = [
      "code" => $r["STKcode"],
      "name" => $r["STKdescT1"],
      "mainUnit" => $r["MainUnit"],
      "subUnit" => $r["SubUnit"]
    ];
  }
  echo json_encode(["ok" => true, "count" => count($out), "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
