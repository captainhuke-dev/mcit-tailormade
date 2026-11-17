<?php
/**
 * P041 — ตรวจสอบสินค้าจ่ายที่ไม่อ้างถึง SO: query หลัก (LoadData)
 * SQL คัดมาจาก C# FrmReserveNotLinkGUI.LoadData / btn_refresh_Click
 * POST { connectionId }
 * คืน { ok, count, rows:[{date, documentNo, customerCode, customerName, itemCount}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# LoadData — เงื่อนไข: MIHtype='SS', MIHvnos LIKE 'RSV%', MIHcancel=0,
  // และ (MILlinkVCno ว่าง/NULL) = สินค้าจ่ายที่ไม่อ้างถึง SO
  $sql = "SELECT MIHday, MIHmonth, MIHyear," .
    "Convert(nvarchar(25),MIHvnos) MIHvnos," .
    "Convert(nvarchar(25),MIHcus) MIHcus," .
    "Convert(varchar(255),DEBnameT) DEBnameT," .
    "COUNT(MIL.MILstk) itemCount" .
    " FROM MIH LEFT JOIN MIL ON MIH.MIHvnos = MIL.MILvnos LEFT JOIN DEB ON MIH.MIHcus = DEB.DEBcode" .
    " WHERE MIHtype = 'SS' AND MIHvnos LIKE 'RSV%' AND MIHcancel = 0 AND (MILlinkVCno = '' OR MILlinkVCno IS NULL)" .
    " GROUP BY MIHday, MIHmonth, MIHyear," .
    " Convert(nvarchar(25),MIHvnos), Convert(nvarchar(25),MIHcus), Convert(varchar(255),DEBnameT)";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "date" => sprintf("%04d-%02d-%02d", (int)$r["MIHyear"], (int)$r["MIHmonth"], (int)$r["MIHday"]),
      "documentNo" => (string)$r["MIHvnos"],
      "customerCode" => (string)$r["MIHcus"],
      "customerName" => (string)$r["DEBnameT"],
      "itemCount" => (int)$r["itemCount"]
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
