<?php
/**
 * P083 — search button -> 3 result tables (By Route / SparePart / Battery)
 *   sp = spare parts:  STKgroup IN (tb_GroupSparepart Active) OR STKgroup LIKE '%SP%'
 *   qc = batteries:    STKgroup IN (tb_GroupBattery Active)
 *   same status param (dropdown) for both; colv2 first-char filter; GROUP BY stk
 *   By Route section: pending (next step)
 * POST { connectionId, status }
 * { ok, sp:[{STKcode,STKgroup,STKdescT1,STKdescT2,qty}], qc:[...] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}
if ($status === "" || !ctype_digit($status)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดเลือกสถานะ"], JSON_UNESCAPED_UNICODE);
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
  // colv2 first-char filter (verbatim from request SQL)
  $colv2 = "'','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'";

  $base = "SELECT MILstk AS STKcode,"
    . " STKgroup,"
    . " CONVERT(VARCHAR(255), STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(255), STKdescT2) AS STKdescT2,"
    . " SUM(MILquan / MILconv) AS qty"
    . " FROM MIH"
    . " LEFT JOIN MIL ON MIHvnos = MILvnos"
    . " LEFT JOIN STK ON MILstk = STKcode"
    . " WHERE MIHstatus = ?"
    . " AND MIHtype = 'IS'"
    . " AND MILcut = -1"
    . " AND MIHcancel = 0"
    . " AND LOWER(SUBSTRING(TRIM(CONVERT(nvarchar(100), MILvCol2)), 1, 1)) IN (" . $colv2 . ")"
    . " AND ";

  $tail = " GROUP BY MILstk, STKgroup, CONVERT(VARCHAR(255), STKdescT1), CONVERT(VARCHAR(255), STKdescT2)"
    . " ORDER BY MILstk";

  // spare parts (bail a-lai)
  $sqlSp = $base . "(STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active') OR STKgroup LIKE '%SP%')" . $tail;
  // batteries (bat-ter-i)
  $sqlQc = $base . "STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')" . $tail;

  $st = $db->prepare($sqlSp);
  $st->execute(array($status));
  $sp = $st->fetchAll(PDO::FETCH_ASSOC);

  $st = $db->prepare($sqlQc);
  $st->execute(array($status));
  $qc = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(array(
    "ok" => true,
    "sp" => $sp,
    "qc" => $qc
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
