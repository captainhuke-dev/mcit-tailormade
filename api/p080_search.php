<?php
/**
 * P080 — ปุ่มค้นหา → รายการสีนค้า (battery)
 * SQL ตามแบบที่ user กำหนด (verbatim):
 *   MIH+MIL+STK, MILcut=-1, MILsto='01', STKgroup IN tb_GroupBattery(Active)
 *   + SBLqty subquery (SBLsto 01/03/04)
 * POST { connectionId, status }
 * { ok, count, rows:[{STKcode,STKgroup,STKdescT1,STKdescT2,SBLqty}] }
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
  // SQL ตามแบบ — CONVERT(nvarchar) สำหรับ GROUP BY, SBLqty subquery
  $sql = "SELECT"
    . " B.MILstk AS STKcode,"
    . " C.STKgroup,"
    . " CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(255), C.STKdescT2) AS STKdescT2,"
    . " (SELECT SUM(SBLquan) FROM SBL WHERE SBLsto IN ('01','03','04') AND SBLstk = B.MILstk) AS SBLqty"
    . " FROM MIH A"
    . " LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos"
    . " LEFT JOIN STK C ON B.MILstk = C.STKcode"
    . " WHERE A.MIHstatus = ?"
    . " AND A.MIHtype = 'IS'"
    . " AND B.MILsto = '01'"
    . " AND B.MILcut = -1"
    . " AND C.STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')"
    . " GROUP BY B.MILstk, C.STKgroup, CONVERT(VARCHAR(255), C.STKdescT1), CONVERT(VARCHAR(255), C.STKdescT2)"
    . " ORDER BY B.MILstk";

  $st = $db->prepare($sql);
  $st->execute(array($status));
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
