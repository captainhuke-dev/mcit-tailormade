<?php
/**
 * P116 — รายละเอียดสินค้า (modal): query รายละเอียด
 * SQL คัดมาจาก C# frm_checkCUS_STK_duplicate.GetSTK() โดยตรง (ไม่เปลี่ยนคำ)
 * POST { connectionId, cusCode, stkCode }
 * คืน { ok, count, rows:[{date, listNo, vnos, stkCode, desc, qty, unit}]
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
  // SQL คัดมาจาก C# frm_checkCUS_STK_duplicate.GetSTK() — ไม่เปลี่ยนคำ
  $sql = "SELECT CONVERT(DATE,STR(MIL.MILday)+'/'+STR(MIL.MILmonth)+'/'+STR(MIL.MILyear),103) MILdate, " .
    "A.CPSlistNo AS MILlistNo,A.CPSvnosID AS MILvnos,A.CPSstkID AS MILstk,MIL.MILdesc,(MIL.MILquan / MIL.MILconv) MILquan,MIL.MILuname " .
    " FROM ( SELECT CPSvnosID, CPScusID, CPSstkID,CPSlistNo FROM CPS WHERE CPSclearALL = 0 AND CPSclearSUM  != -1 GROUP BY " .
    " CPSvnosID, CPScusID, CPSstkID,CPSlistNo ) AS A LEFT JOIN MIL ON MIL.MILstk = A.CPSstkID AND MIL.MILvnos = A.CPSvnosID AND MIL.MILcus = A.CPScusID " .
    " AND MIL.MILlistNo = A.CPSlistNo WHERE A.CPSstkID LIKE ?  AND A.CPScusID LIKE ? " .
    " ORDER BY MILvnos,MILlistNo";

  $st = $db->prepare($sql);
  $st->execute(array("%" . $stkCode . "%", "%" . $cusCode . "%"));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "date" => (string)$r["MILdate"],
      "listNo" => (string)$r["MILlistNo"],
      "vnos" => (string)$r["MILvnos"],
      "stkCode" => (string)$r["MILstk"],
      "desc" => (string)$r["MILdesc"],
      "qty" => (string)$r["MILquan"],
      "unit" => (string)$r["MILuname"]
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
