<?php
/**
 * P079 - search button -> 1 result table (items)
 * SQL (user 2026-10-23): MIH+MIL+STK, MIHstatus=?, MIHtype='IS', MILcut=-1,
 *   MIL date range via STR(MILday/MILmonth/MILyear), MILcus IN DEB (DEBgroup LIKE 'EC%' or = ?)
 * POST { connectionId, status, dateFrom, dateTo, group }
 * { ok, count, rows:[{STKcode, STKdescT1, STKdescT2, qty, MILuname}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$group = isset($body["group"]) ? trim($body["group"]) : "EC";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($status === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "เรอดแลองืกกสสถานะใบแจ้งหนี้"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($dateFrom === "" || $dateTo === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "เรอดแลองืกกสวันที่"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมตอฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $dateExpr = "CONVERT(DATE, STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear), 103)";
  $params = array($status, $dateFrom, $dateTo);
  if ($group === "EC" || $group === "") {
    $grpClause = "MILcus IN (SELECT DEBcode FROM DEB WHERE DEBgroup LIKE 'EC%')";
  } else {
    $grpClause = "MILcus IN (SELECT DEBcode FROM DEB WHERE DEBgroup = ?)";
    $params[] = $group;
  }

  $sql = "SELECT B.MILstk AS STKcode,"
    . " CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(55), STKdescT2) AS STKdescT2,"
    . " SUM(MILquan) AS qty,"
    . " CONVERT(VARCHAR(55), MILuname) AS MILuname"
    . " FROM MIH A"
    . " LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos"
    . " LEFT JOIN STK C ON B.MILstk = C.STKcode"
    . " WHERE A.MIHstatus = ?"
    . " AND A.MIHtype = 'IS'"
    . " AND " . $dateExpr . " >= ?"
    . " AND " . $dateExpr . " <= ?"
    . " AND " . $grpClause
    . " AND B.MILcut = -1"
    . " GROUP BY B.MILstk, CONVERT(VARCHAR(255), C.STKdescT1), CONVERT(VARCHAR(55), STKdescT2), CONVERT(VARCHAR(55), MILuname)"
    . " ORDER BY STKcode";

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(array(
    "ok" => true,
    "count" => count($rows),
    "rows" => $rows
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
