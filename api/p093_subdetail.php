<?php
/**
 * P093 — ใบอนุมัติ PO: sub-detail ราย PO ของแต่ละสินค้า (getVnosPO)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO.getVnosPO
 * POST { connectionId, stk, unit } (unit: 0=หน่วยหลัก, 1=หน่วยย่อย, 2=หน่วยรอง)
 * คืนค่า { ok, count, rows:[{sto, date, vnos, desc, unit, req, cut, diff, status, delivDate}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$stk = isset($body["stk"]) ? trim($body["stk"]) : "";
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
  // SQL ตาม C# getVnosPO — วิ่งตาม CPPstkID = stk (ทุก vendor),
  //(delivDate ดึงจาก BI_CUBE.dbo.tb_Supplier_Delivery ข้ามฐานข้อมูล)
  $sql = "DECLARE @n int; SET @n = " . $unit . "\n" .
    "SELECT CPPsto," .
    " CPPdateID," .
    " CPPvnosID," .
    " CONVERT(nvarchar(255), MIHdesc) AS MIHdesc," .
    " (CASE WHEN @n = 0 THEN CONVERT(nvarchar(20), STKuname1)" .
    " WHEN @n = 1 THEN (CASE STKunit1 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " WHEN @n = 2 THEN (CASE STKunit2 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " END) AS STKuname," .
    " SUM(CPPstkREQ) AS CPPstkREQ," .
    " SUM(CPPstkCUT1) AS CPPstkCUT1," .
    " (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END) AS Conv," .
    " MIHstatus," .
    " (SELECT TOP 1 D.Delivery_Date FROM BI_CUBE.dbo.tb_Supplier_Delivery D WHERE D.CPPvnosID = CPP.CPPvnosID AND D.STKcode = ?) AS delvDate," .
    " CREcode," .
    " CONVERT(nvarchar(255), CREnameT) AS CREnameT" .
    " FROM CPP" .
    " LEFT JOIN STK ON STKcode = CPPstkID" .
    " LEFT JOIN MIH ON MIHvnos = CPPvnosID" .
    " LEFT JOIN CRE ON CREcode = CPPcusID" .
    " WHERE CPPclearALL = 0 AND (CPPstkREQ - CPPstkCUT1) != 0 AND CPPstkID = ?" .
    " GROUP BY CPPsto, CPPdateID, CPPvnosID, CONVERT(nvarchar(255), MIHdesc)," .
    " (CASE WHEN @n = 0 THEN CONVERT(nvarchar(20), STKuname1)" .
    " WHEN @n = 1 THEN (CASE STKunit1 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " WHEN @n = 2 THEN (CASE STKunit2 WHEN 1 THEN CONVERT(nvarchar(20), STKuname1) WHEN 2 THEN CONVERT(nvarchar(20), STKuname2) WHEN 3 THEN CONVERT(nvarchar(20), STKuname3) WHEN 4 THEN CONVERT(nvarchar(20), STKuname4) WHEN 5 THEN CONVERT(nvarchar(20), STKuname5) END)" .
    " END)," .
    " (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END)," .
    " MIHstatus, CREcode, CONVERT(nvarchar(255), CREnameT)" .
    " ORDER BY CPPvnosID";

  $st = $db->prepare($sql);
  $st->execute(array($stk, $stk));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $d = new DateTime($r["CPPdateID"]);
    $delv = $r["delvDate"];
    $out[] = array(
      "sto" => (string)$r["CPPsto"],
      "date" => $d->format("d/m/Y"),
      "vnos" => (string)$r["CPPvnosID"],
      "desc" => (string)$r["MIHdesc"],
      "unit" => $r["STKuname"] === null ? "" : (string)$r["STKuname"],
      "req" => (float)$r["CPPstkREQ"],
      "cut" => (float)$r["CPPstkCUT1"],
      "conv" => (float)$r["Conv"],
      "status" => $r["MIHstatus"] === null ? "" : (string)$r["MIHstatus"],
      "delivDate" => $delv === null ? "" : $delv
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
