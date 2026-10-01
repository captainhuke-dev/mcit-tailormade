<?php
/**
 * P026 — ประวัติการเงินเจ้าหนี้ — ค้นหาเจ้าหนี้ (autocomplete)
 * POST { connectionId, q }
 * { ok, rows: [ { code, name, groupCode } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$q = isset($body["q"]) ? trim($body["q"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($q === "") {
  echo json_encode(["ok" => true, "rows" => []], JSON_UNESCAPED_UNICODE);
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
  $st = $db->prepare("SELECT TOP 10
\tCREcode,
\tCREgroup,
\tCREnameT
\tFROM
\tCRE
\tWHERE
\t CREhide = 0
\t AND CRElock = 0
\t AND ( CREcode LIKE ? OR CREnameT LIKE ? )");
  $like = "%" . $q . "%";
  $st->execute([$like, $like]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = [
      "code" => isset($r["CREcode"]) ? $r["CREcode"] : "",
      "name" => isset($r["CREnameT"]) ? $r["CREnameT"] : "",
      "groupCode" => isset($r["CREgroup"]) ? $r["CREgroup"] : ""
    ];
  }

  echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
