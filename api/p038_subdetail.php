<?php
/**
 * P038 — item 5: sub-detail per customer (C# FrmBalanceGUI.cs dtSubDetail + dt_DEB)
 *   rows: CPS pending (CPSclearALL=0, sto IN, STKgroup != 'MKT', STKsnsv != '3', qty != 0)
 *         UNION ALL RSV (MIHvnos LIKE 'RSV%', MILtype='SS', MIHcancel=0) — ORDER BY CPSvnosID,CPSlistNo
 * POST { connectionId, cusid, warehouse }
 * { ok, cus:{code,name,contact,group,grade}, count, rows:[{vnos,date,listNo,stkcode,group,desc,qty,rsv,balance,unit}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$cusid = isset($body["cusid"]) ? trim($body["cusid"]) : "";

if ($connectionId === "" || $cusid === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "ข้อมูลไม่ครบ"], JSON_UNESCAPED_UNICODE);
  exit;
}
if (!preg_match("/^[0-9A-Za-z\-\s]+$/", $cusid)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "รหัสลูกค้าไม่ถูกต้อง: " . $cusid], JSON_UNESCAPED_UNICODE);
  exit;
}

/* warehouse whitelist (same as p038_detail.php) */
$warehouse = isset($body["warehouse"]) ? trim($body["warehouse"]) : "";
$stoList = array();
foreach (explode(",", $warehouse) as $s) {
  $s = trim($s);
  if ($s === "") continue;
  if (!preg_match("/^[0-9A-Za-z\-]+$/", $s)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "รหัสคลังสินค้าไม่ถูกต้อง: " . $s], JSON_UNESCAPED_UNICODE);
    exit;
  }
  $stoList[] = $s;
}
if (count($stoList) === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดระบุคลังสินค้า"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

/* customer (C# dt_DEB) */
try {
  $st = $db->prepare("SELECT DEBcode, DEBnameT, DEBcontactT, DEBgroup, DEBgrade FROM DEB WHERE DEBcode = ?");
  $st->execute(array($cusid));
  $cus = $st->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}
if (!$cus) {
  echo json_encode(["ok" => false, "error" => "ไม่พบข้อมูลลูกค้า: " . $cusid], JSON_UNESCAPED_UNICODE);
  exit;
}

/* sub-detail (C# dtSubDetail) */
$stoPh = implode(",", array_fill(0, count($stoList), "?"));
$sql = " SELECT tb.CPScusID, CONVERT(VARCHAR(100), DEB.DEBnameT) AS DEBnameT, tb.CPSvnosID, tb.CPSdateID, tb.CPSlistNo, tb.CPSstkID, STK.STKgroup,";
$sql .= " CONVERT(VARCHAR(200), STK.STKdescT1) AS STKdescT1, (tb.CPSstkREQ - tb.CPSstkCUT1) AS CPSqty, '0' AS RSVqty,";
$sql .= " (SELECT SUM(SBL.SBLquan) FROM SBL WHERE SBL.SBLstk = tb.CPSstkID AND SBL.SBLsto = '01') AS SBLqty, CONVERT(VARCHAR(20), STK.STKuname1) AS STKuname1";
$sql .= " FROM CPS tb LEFT JOIN STK ON STK.STKcode = tb.CPSstkID LEFT JOIN DEB ON DEB.DEBcode = tb.CPScusID";
$sql .= " WHERE tb.CPSclearALL = 0 AND tb.CPSsto IN (" . $stoPh . ") AND STK.STKgroup != 'MKT' AND STK.STKsnsv != '3' AND (tb.CPSstkREQ - tb.CPSstkCUT1) != 0 AND tb.CPScusID = ?";
$sql .= " UNION ALL SELECT MIH.MIHcus AS CPScusID, CONVERT(VARCHAR(100), DEB.DEBnameT) AS DEBnameT, MIH.MIHvnos AS CPSvnosID,";
$sql .= " CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) AS CPSdateID, MIL.MILlistNo AS CPSlistNo, MIL.MILstk AS CPSstkID, STK.STKgroup,";
$sql .= " CONVERT(VARCHAR(200), STK.STKdescT1) AS STKdescT1, '0' AS CPSqty, MIL.MILquan AS RSVqty,";
$sql .= " (SELECT SUM(SBL.SBLquan) FROM SBL WHERE SBL.SBLstk = MIL.MILstk AND SBL.SBLsto = '01') AS SBLqty, CONVERT(VARCHAR(20), STK.STKuname1) AS STKuname1";
$sql .= " FROM MIH LEFT JOIN MIL ON MIH.MIHvnos = MIL.MILvnos AND MIH.MIHcus = MIL.MILcus LEFT JOIN DEB ON MIH.MIHcus = DEB.DEBcode LEFT JOIN STK ON MIL.MILstk = STK.STKcode";
$sql .= " WHERE MIHvnos LIKE 'RSV%' AND MIL.MILtype = 'SS' AND MIH.MIHcancel = 0 AND MIL.MILcus = ? ORDER BY CPSvnosID, CPSlistNo";

$params = array_merge($stoList, array($cusid, $cusid));
try {
  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

function p038s_date($v)
{
  if ($v === null || $v === "") return "";
  return substr($v, 0, 10);
}

$out = array();
foreach ($rows as $r) {
  $out[] = array(
    "vnos" => (string) $r["CPSvnosID"],
    "date" => p038s_date($r["CPSdateID"]),
    "listNo" => (string) $r["CPSlistNo"],
    "stkcode" => (string) $r["CPSstkID"],
    "group" => (string) $r["STKgroup"],
    "desc" => (string) $r["STKdescT1"],
    "qty" => (float) $r["CPSqty"],
    "rsv" => (float) $r["RSVqty"],
    "balance" => (float) $r["SBLqty"],
    "unit" => (string) $r["STKuname1"]
  );
}

echo json_encode(array(
  "ok" => true,
  "cus" => array(
    "code" => (string) $cus["DEBcode"],
    "name" => (string) $cus["DEBnameT"],
    "contact" => (string) $cus["DEBcontactT"],
    "group" => (string) $cus["DEBgroup"],
    "grade" => (string) $cus["DEBgrade"]
  ),
  "count" => count($out),
  "rows" => $out
), JSON_UNESCAPED_UNICODE);
