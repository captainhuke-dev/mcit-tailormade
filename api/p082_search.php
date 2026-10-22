<?php
/**
 * P082 - search button -> 3 result tables (Zone 01 / Zone SparePart / Zone QC)
 * SQL (user 2026-10-22): MIH+MIL+STK, MIHstatus=?, MIHtype='IS', MILcut=-1, MIHcancel=0,
 *   MILvCol2 first-char IN ('a'..'k') for all 3 tables
 *   Zone 01        = + JOIN JOB_TransportRoute, NOT IN (sp UNION bat), NOT LIKE '%SP%'
 *   Zone SparePart = IN tb_GroupSparepart(Active) OR LIKE '%SP%'
 *   Zone QC        = IN tb_GroupBattery(Active)
 * POST { connectionId, status }
 * { ok, count, zone01:[...], sp:[...], qc:[...], rows:[...] }
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

if ($status === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดยเลือกสถานะใบแจ้งหนี้"], JSON_UNESCAPED_UNICODE);
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
  $colv2 = "'a','b','c','d','e','f','g','h','i','j','k'";

  // Zone 01
  $sql01 = "SELECT STKcode, STKgroup,"
    . " CONVERT(VARCHAR(255), STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(255), STKdescT2) AS STKdescT2,"
    . " SUM(MILquan / MILconv) AS qty"
    . " FROM MIH"
    . " LEFT JOIN MIL ON MIHvnos = MILvnos"
    . " LEFT JOIN STK ON MILstk = STKcode"
    . " LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON MILjob = D.JOBcode"
    . " WHERE MIHstatus = ?"
    . " AND MIHtype = 'IS'"
    . " AND MILcut = -1"
    . " AND MIHcancel = 0"
    . " AND LOWER(SUBSTRING(TRIM(CONVERT(nvarchar(100), MILvCol2)), 1, 1)) IN (" . $colv2 . ")"
    . " AND STKgroup NOT IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active' UNION ALL SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')"
    . " AND STKgroup NOT LIKE '%SP%'"
    . " GROUP BY STKcode, STKgroup, CONVERT(VARCHAR(255), STKdescT1), CONVERT(VARCHAR(255), STKdescT2)"
    . " ORDER BY STKcode";

  // Zone SparePart
  $sqlSp = "SELECT MILstk AS STKcode, STKgroup,"
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
    . " AND (STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active') OR STKgroup LIKE '%SP%')"
    . " GROUP BY MILstk, STKgroup, CONVERT(VARCHAR(255), STKdescT1), CONVERT(VARCHAR(255), STKdescT2)"
    . " ORDER BY MILstk";

  // Zone QC
  $sqlQc = "SELECT MILstk AS STKcode, STKgroup,"
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
    . " AND STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')"
    . " GROUP BY MILstk, STKgroup, CONVERT(VARCHAR(255), STKdescT1), CONVERT(VARCHAR(255), STKdescT2)"
    . " ORDER BY MILstk";

  $st = $db->prepare($sql01);
  $st->execute(array($status));
  $zone01 = $st->fetchAll(PDO::FETCH_ASSOC);

  $st = $db->prepare($sqlSp);
  $st->execute(array($status));
  $sp = $st->fetchAll(PDO::FETCH_ASSOC);

  $st = $db->prepare($sqlQc);
  $st->execute(array($status));
  $qc = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(array(
    "ok" => true,
    "count" => count($zone01) + count($sp) + count($qc),
    "zone01" => $zone01,
    "sp" => $sp,
    "qc" => $qc,
    "rows" => $zone01
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
