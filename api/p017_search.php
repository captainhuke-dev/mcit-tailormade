<?php
/**
 * P017 — cash bills not yet received: search button (loaddata)
 * Based on C# frm_NotReceivedMoney.cs — MAC5 (SQL Server)
 * POST { connectionId, type }
 * Returns { ok, count, rows:[{date, vnos, customerCode, customer, dep, per, amount, status, type, desc}]
 * PHP 7.3-compatible (no fn())
 */
header("Content-Type: application/json; charset=utf-8");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$type = isset($body["type"]) ? trim($body["type"]) : "all";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

// Type condition (per C# loaddata)
if ($type === "net") {
  $condition = " AND MIHdiscHT1 NOT LIKE '3' AND MIHdesc LIKE '%เงินสด%'";
} elseif ($type === "discount") {
  $condition = " AND MIHdiscHT1 LIKE '3' AND MIHdesc LIKE '%เงินสด%'";
} else {
  $type = "all";
  $condition = " AND (MIHdiscHT1 LIKE '3' OR MIHdesc LIKE '%เงินสด%')";
}

try {
  $sql = "SELECT CFSvnosID, CFSdateID, CFScusID, DEBnameT, CFSdep, CFSper, (CFSsumREQ - CFSsumCUT1) Amount, MIHdesc"
    . " FROM CFS"
    . " LEFT JOIN DEB ON DEB.DEBcode = CFS.CFScusID"
    . " LEFT JOIN MIH ON MIHvnos = CFSvnosID"
    . " WHERE CFSclearALL = 0 AND MIHtype = 'IS' AND MIHnetSUM > 0"
    . $condition
    . " ORDER BY CFSdateID";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // status/type ตามประเภทที่เลือก (SQL ไม่มี MIHdiscHT1)
  $statusMap = array("all" => "NET", "net" => "NET", "discount" => "3%");
  $typeMap = array("all" => "net", "net" => "net", "discount" => "discount");
  $status = isset($statusMap[$type]) ? $statusMap[$type] : "NET";
  $typeVal = isset($typeMap[$type]) ? $typeMap[$type] : "net";

  $out = array();
  $id = 1;
  foreach ($rows as $r) {
    $out[] = array(
      "id" => $id++,
      "date" => (string)$r["CFSdateID"],
      "vnos" => (string)$r["CFSvnosID"],
      "customerCode" => (string)$r["CFScusID"],
      "customer" => (string)$r["DEBnameT"],
      "dep" => (string)$r["CFSdep"],
      "per" => (string)$r["CFSper"],
      "amount" => (float)$r["Amount"],
      "status" => $status,
      "type" => $typeVal,
      "desc" => (string)$r["MIHdesc"]
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
