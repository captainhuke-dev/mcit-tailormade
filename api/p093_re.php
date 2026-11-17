<?php
/**
 * P093 — ใบอนุมัติ PO: RE sub-detail (getVnosRE)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO.getVnosRE
 * POST { connectionId, stk, vnos, unit } (unit: 0=หน่วยหลัก, 1=หน่วยย่อย, 2=หน่วยรอง)
 * คืนค่า { ok, count, rows:[{sto, date, vnos, desc, re}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$stk = isset($body["stk"]) ? trim($body["stk"]) : "";
$vnos = isset($body["vnos"]) ? trim($body["vnos"]) : "";
$unit = isset($body["unit"]) ? (int)$body["unit"] : 1;
if ($unit !== 0 && $unit !== 1 && $unit !== 2) {
  $unit = 1;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# getVnosRE — MIHtype='IP', MILstk=stk, MILlinkVCno LIKE '%vnos%', MIHcancel=0
  $sql = "DECLARE @n int; SET @n = " . $unit . "\n" .
    "SELECT MILsto," .
    " CONVERT(DATE, STR(MIHday) + '/' + STR(MIHmonth) + '/' + STR(MIHyear), 103) AS MIHdate," .
    " MILvnos," .
    " CONVERT(nvarchar(255), MIHdesc) AS MIHdesc," .
    " SUM(MILquan / (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END)) AS MILquan" .
    " FROM MIH" .
    " LEFT JOIN MIL ON MILvnos = MIHvnos AND MILcus = MIHcus" .
    " LEFT JOIN STK ON STKcode = MILstk" .
    " WHERE MIHtype = 'IP' AND MILstk = ? AND MILlinkVCno LIKE ? AND MIHcancel = 0" .
    " GROUP BY MILsto, CONVERT(DATE, STR(MIHday) + '/' + STR(MIHmonth) + '/' + STR(MIHyear), 103), MILvnos, CONVERT(nvarchar(255), MIHdesc)," .
    " (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END)" .
    " ORDER BY MILvnos";

  $st = $db->prepare($sql);
  $st->execute(array($stk, "%" . $vnos . "%"));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "sto" => (string)$r["MILsto"],
      "date" => (string)$r["MIHdate"],
      "vnos" => (string)$r["MILvnos"],
      "desc" => (string)$r["MIHdesc"],
      "re" => (float)$r["MILquan"]
    );
  }

  echo json_encode(array(
    "ok" => true,
    "count" => count($out),
    "rows" => $out
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
