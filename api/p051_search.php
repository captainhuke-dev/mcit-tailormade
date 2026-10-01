<?php
/**
 * P051 — รายงานการเก็บเงินสด — ค้นหา (ปุ่มค้นหา)
 * POST { connectionId, status, reportType }
 *   status     = "43,44,60" (รหัส MIHstatus แยก comma)
 *   reportType = "all" | "cash"
 * { ok, rows: [ { document, date, customerCode, customerName, salesperson, amount } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$reportType = isset($body["reportType"]) ? trim($body["reportType"]) : "all";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

/* parse รหัสสถานะ "43,44,60" -> [43, 44, 60] */
$statusCodes = [];
if ($status !== "") {
  foreach (explode(",", $status) as $s) {
    $s = trim($s);
    if ($s !== "" && preg_match("/^\d+$/", $s)) {
      $statusCodes[] = (int)$s;
    }
  }
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $sql = "SELECT
\tMIH.MIHvnos,
\tCONVERT ( DATE, STR( MIHday ) + '/' + STR( MIHmonth ) + '/' + STR( MIHyear ), 103 ) MIHdate,
\tDEB.DEBcode,
\tCONVERT ( NVARCHAR ( 255 ), DEB.DEBnameT ) + '  ' + CONVERT ( NVARCHAR ( 100 ), DEB.DEBcontactT ) AS DEBnameT,
\tMIH.MIHper,
\tMIH.MIHnetSUM
\tFROM
\tMIH
\tLEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
\tWHERE
\tMIH.MIHtype LIKE 'IS'";

  $params = [];
  if (!empty($statusCodes)) {
    $sql .= "\n\tAND MIH.MIHstatus IN (" . implode(",", array_fill(0, count($statusCodes), "?")) . ")";
    $params = array_merge($params, $statusCodes);
  }

  /* กรณีเลือก เงินสด */
  if ($reportType === "cash") {
    $sql .= "\n\tAND MIH.MIHdesc LIKE ?";
    $params[] = "%เงินสด%";
  }

  $sql .= "\nORDER BY\n\tMIH.MIHvnos ASC";

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = [
      "document" => isset($r["MIHvnos"]) ? $r["MIHvnos"] : "",
      "date" => isset($r["MIHdate"]) ? $r["MIHdate"] : "",
      "customerCode" => isset($r["DEBcode"]) ? $r["DEBcode"] : "",
      "customerName" => isset($r["DEBnameT"]) ? trim($r["DEBnameT"]) : "",
      "salesperson" => isset($r["MIHper"]) ? $r["MIHper"] : "",
      "amount" => isset($r["MIHnetSUM"]) ? (float)$r["MIHnetSUM"] : 0.0
    ];
  }

  echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
