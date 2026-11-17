<?php
/**
 * P116 — ตรวจสอบลูกค้าที่สั่งสินค้าซ้ำ: query ค้นหา (ปุ่มค้นหา)
 * SQL คัดมาจาก C# frm_checkCUS_STK_duplicate.btn_search_Click โดยตรง (ไม่เปลี่ยนคำ)
 * POST { connectionId, cusCode, stkCode }
 * คืน { ok, count, rows:[{cusCode, cusName, cusContact, stkCode, cnt}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$cusCode = isset($body["cusCode"]) ? trim($body["cusCode"]) : "";
$stkCode = isset($body["stkCode"]) ? trim($body["stkCode"]) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL คัดออกจาก C# frm_checkCUS_STK_duplicate.btn_search_Click — ไม่เปลี่ยนคำ
  $sql = "SELECT A.CPScusID AS MILcus,CONVERT ( nvarchar ( 255 ), DEB.DEBnameT ) DEBnameT,CONVERT ( nvarchar ( 100 ), DEB.DEBcontactT ) DEBcontactT," .
    " A.CPSstkID AS MILstk,COUNT ( A.CPSstkID ) AS cnt FROM ( SELECT CPSvnosID, CPScusID, CPSstkID FROM CPS WHERE CPSclearALL = 0 AND CPSclearSUM != -1" .
    " GROUP BY CPSvnosID, CPScusID, CPSstkID ) AS A LEFT JOIN DEB ON DEB.DEBcode = A.CPScusID WHERE A.CPSstkID LIKE ? " .
    " AND A.CPScusID LIKE ? GROUP BY A.CPScusID,CONVERT ( nvarchar ( 255 ), DEB.DEBnameT )," .
    " CONVERT ( nvarchar ( 100 ), DEB.DEBcontactT ), A.CPSstkID  HAVING COUNT ( A.CPSstkID ) > 1 ORDER BY MILcus";

  $st = $db->prepare($sql);
  $st->execute(array("%" . $stkCode . "%", "%" . $cusCode . "%"));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "cusCode" => (string)$r["MILcus"],
      "cusName" => (string)$r["DEBnameT"],
      "cusContact" => (string)$r["DEBcontactT"],
      "stkCode" => (string)$r["MILstk"],
      "cnt" => (int)$r["cnt"]
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
