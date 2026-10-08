<?php
/**
 * P019 — เช็คสถานะส่ง Invoice — รายการสถานะ
 * clone C# frm_CheckStatusInvoiceGUI.cs getStatus() L68
 *
 * POST { connectionId }
 * { ok, statuses: [ { code, name } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
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
  $sql = "SELECT AR_Scode [code], Cast (AR_Scode AS VARCHAR) +' : ' + CAST(AR_SnameT AS VARCHAR) [name] FROM AR_S" .
         " WHERE AR_SnameT IS NOT NULL AND AR_Scode IN (62,63,65,67,68,70) ORDER BY AR_Scode";

  $stmt = $db->prepare($sql);
  $stmt->execute();
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $statuses = [];
  foreach ($rows as $row) {
    $statuses[] = [
      "code" => (string)$row["code"],
      "name" => $row["name"],
    ];
  }

  echo json_encode(["ok" => true, "statuses" => $statuses], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "โหลดสถานะไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
