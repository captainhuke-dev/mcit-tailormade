<?php
/**
 * P093 — ใบอนุมัติ PO: query รายละเอียดสินค้า (getStkPo)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO.getStkPo
 * POST { connectionId, vnos, cus, unit } (unit: 0=หน่วยหลัก, 1=หน่วยย่อย, 2=หน่วยรอง)
 * คืนค่า { ok, count, rows:[{listNo, stkCode, desc, unit, status, req, cut, conv}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$vnos = isset($body["vnos"]) ? trim($body["vnos"]) : "";
$cus = isset($body["cus"]) ? trim($body["cus"]) : "";
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
  // SQL ตาม C# getStkPo — @n: 0=หน่วยหลัก (conv=1, STKuname1)
  // 1=หน่วยย่อย (STKunit1 ชี้หน่วย), 2=หน่วยรอง (STKunit2 ชี้หน่วย)
  $sql = "DECLARE @n int; SET @n = " . $unit . "\n" .
    "SELECT B.CPPstkID," .
    " CONVERT(nvarchar(255), STKdescT1) AS STKdescT1," .
    " (CASE WHEN @n = 0 THEN CONVERT(nvarchar(20), STKuname1)" .
    " WHEN @n = 1 THEN (CASE STKunit1 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " WHEN @n = 2 THEN (CASE STKunit2 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " END) AS STKuname," .
    " MIHstatus," .
    " SUM(B.CPPstkREQ) AS CPPstkREQ, SUM(B.CPPstkCUT1) AS CPPstkCUT1," .
    " (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END) AS Conv," .
    " (SELECT TOP 1 CPPlistNo FROM CPP WHERE CPPvnosID = B.CPPvnosID AND CPPstkID = B.CPPstkID AND CPPclearALL = 0) AS listNo" .
    " FROM CPP B" .
    " LEFT JOIN STK ON STKcode = CPPstkID" .
    " LEFT JOIN MIH ON MIHvnos = CPPvnosID" .
    " WHERE B.CPPclearALL = 0 AND (B.CPPstkREQ - B.CPPstkCUT1) != 0" .
    " AND B.CPPcusID = ? AND B.CPPvnosID = ?" .
    " GROUP BY B.CPPvnosID, B.CPPstkID," .
    " CONVERT(nvarchar(255), STKdescT1)," .
    " (CASE WHEN @n = 0 THEN CONVERT(nvarchar(20), STKuname1)" .
    " WHEN @n = 1 THEN (CASE STKunit1 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " WHEN @n = 2 THEN (CASE STKunit2 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " END), MIHstatus," .
    " (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END)" .
    " ORDER BY listNo";

  $st = $db->prepare($sql);
  $st->execute(array($cus, $vnos));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "listNo" => $r["listNo"] === null ? "" : (string)$r["listNo"],
      "stkCode" => (string)$r["CPPstkID"],
      "desc" => (string)$r["STKdescT1"],
      "unit" => $r["STKuname"] === null ? "" : (string)$r["STKuname"],
      "status" => $r["MIHstatus"] === null ? "" : (string)$r["MIHstatus"],
      "req" => (float)$r["CPPstkREQ"],
      "cut" => (float)$r["CPPstkCUT1"],
      "conv" => (float)$r["Conv"]
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
