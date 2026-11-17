<?php
/**
 * P093 — ใบอนุมัติ PO: query ค้นหาหลัก (loadMaster)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO.loadMaster
 * POST { connectionId, dateFrom, dateTo, vnos, cus, name }
 * คืนค่า { ok, count, rows:[{date, poNo, vendorCode, vendorName, memo}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$vnos = isset($body["vnos"]) ? trim($body["vnos"]) : "";
$cus = isset($body["cus"]) ? trim($body["cus"]) : "";
$name = isset($body["name"]) ? trim($body["name"]) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# loadMaster — เงื่อนไข: CPPclearALL = 0 AND (CPPstkREQ - CPPstkCUT1) > 0
  // วันที่/เลขที่ PO/รหัส/ชื่อ Vendor เป็นเงื่อนไขแบบ LIKE (เพิ่มเฉพาะค่าที่กรอกมา)
  $sql = "SELECT CPPdateID, CPPvnosID, CPPcusID, CONVERT(nvarchar(255), CREnameT) AS CREnameT," .
    " (SELECT TOP 1 MIHdesc FROM MIH WHERE MIHvnos = CPP.CPPvnosID AND MIHcus = CPP.CPPcusID) AS MIHdesc" .
    " FROM CPP LEFT JOIN CRE ON CREcode = CPPcusID" .
    " WHERE CPPclearALL = 0 AND (CPPstkREQ - CPPstkCUT1) > 0";
  $params = array();
  if ($dateFrom !== "") { $sql .= " AND CPPdateID >= ?"; $params[] = $dateFrom; }
  if ($dateTo !== "") { $sql .= " AND CPPdateID <= ?"; $params[] = $dateTo; }
  if ($vnos !== "") { $sql .= " AND CPPvnosID LIKE ?"; $params[] = "%" . $vnos . "%"; }
  if ($cus !== "") { $sql .= " AND CPPcusID LIKE ?"; $params[] = "%" . $cus . "%"; }
  if ($name !== "") { $sql .= " AND CONVERT(nvarchar(255), CREnameT) LIKE ?"; $params[] = "%" . $name . "%"; }
  $sql .= " GROUP BY CPPdateID, CPPvnosID, CPPcusID, CONVERT(nvarchar(255), CREnameT)" .
    " ORDER BY CPPdateID, CPPvnosID";

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $d = new DateTime($r["CPPdateID"]);
    $out[] = array(
      "date" => $d->format("Y-m-d"),
      "poNo" => (string)$r["CPPvnosID"],
      "vendorCode" => (string)$r["CPPcusID"],
      "vendorName" => (string)$r["CREnameT"],
      "memo" => $r["MIHdesc"] === null ? "" : (string)$r["MIHdesc"]
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
