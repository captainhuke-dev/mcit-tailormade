<?php
/**
 * P094 — PO Dropship: query ค้นหาหลัก
 * SQL คัดออกจาก C# frm_POdropship_GUI.btn_search_Click
 * POST { connectionId, dateFrom, dateTo, poNo }
 * คืนค่า { ok, count, rows:[{date, poNo, cusCode, cusName, memo, netSUM, printN, creditTerm}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$poNo = isset($body["poNo"]) ? trim($body["poNo"]) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# btn_search_Click — MIH LEFT JOIN CRE
  // เงื่อนไข: MIHtype='PP', MIHcancel=0, MIHvnos LIKE '<poNo>%' (match ข้างหน้า), วันที่ในช่วง
  $dateExpr = "CONVERT(DATE,STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103)";
  $sql = "SELECT " . $dateExpr . " AS MIHdate, MIHvnos, MIHcus," .
    " CONVERT(nvarchar(255), CREnameT) AS CREnameT, MIHnetSUM, MIHdesc, MIHprintN, CREcreditTerm" .
    " FROM MIH LEFT JOIN CRE ON CREcode = MIHcus" .
    " WHERE MIHtype = 'PP' AND MIHcancel = 0";
  $params = array();
  if ($poNo !== "") { $sql .= " AND MIHvnos LIKE ?"; $params[] = $poNo . "%"; }
  if ($dateFrom !== "") { $sql .= " AND " . $dateExpr . " >= ?"; $params[] = $dateFrom; }
  if ($dateTo !== "") { $sql .= " AND " . $dateExpr . " <= ?"; $params[] = $dateTo; }
  $sql .= " ORDER BY " . $dateExpr . ", MIHvnos";

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  $i = 0;
  foreach ($rows as $r) {
    $out[] = array(
      "id" => ++$i,
      "date" => $r["MIHdate"] === null ? "" : (string)$r["MIHdate"],
      "poNo" => (string)$r["MIHvnos"],
      "cusCode" => (string)$r["MIHcus"],
      "cusName" => $r["CREnameT"] === null ? "" : (string)$r["CREnameT"],
      "memo" => $r["MIHdesc"] === null ? "" : (string)$r["MIHdesc"],
      "netSUM" => (float)$r["MIHnetSUM"],
      "printN" => (int)$r["MIHprintN"],
      "creditTerm" => $r["CREcreditTerm"] === null ? "" : (string)$r["CREcreditTerm"]
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
