<?php
/**
 * P081 — PickList By Route — รายชือสายส่ง (Route) สำหรับ dropdown (MAC5)
 * clone C# frm_PickListByRouteGUI.FrmPackingListAllGUI_Load (cbb_Route)
 * POST { connectionId }
 * { ok, count, rows: [{route}] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";

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
  // clone C# — SELECT DISTINCT Route FROM BI_CUBE.dbo.JOB_TransportRoute
  $sql = "SELECT DISTINCT CONVERT(nvarchar(100), Route) AS Route
          FROM BI_CUBE.dbo.JOB_TransportRoute
          WHERE Route IS NOT NULL
          ORDER BY CONVERT(nvarchar(100), Route)";
  $st = $db->prepare($sql);
  $st->execute(array());
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = ["route" => $r["Route"]];
  }
  echo json_encode(["ok" => true, "count" => count($out), "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
