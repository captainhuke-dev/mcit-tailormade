<?php
/**
 * P098 — ระวังหลังจัดซื้อ: ปุ่มค้นหา (btn_search_Click + searchData)
 * ตาม C# frm_PUR_CPS_PR_X_GUI.cs — MAC5 (SQL Server)
 * POST { connectionId, dateFrom, dateTo, productCode, groupCode, productName, warehouses[] }
 * คืน { ok, count, rows:[{productCode, group, mktPlan, name, stkDesc, so, soNet, rsv, po, pr, sbl, stock, gradeX}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$productCode = isset($body["productCode"]) ? trim($body["productCode"]) : "";
$groupCode = isset($body["groupCode"]) ? trim($body["groupCode"]) : "";
$productName = isset($body["productName"]) ? trim($body["productName"]) : "";
$warehouses = isset($body["warehouses"]) ? (array)$body["warehouses"] : array();

if (count($warehouses) === 0) {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "โปรดเลือกกลุ่มคลังสินค้า อย่างน้อย 1 ตัวเลือก"), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

function esc($v) { return str_replace("'", "''", (string)$v); }

// กลุ่มคลังที่เลือก → STOgroup IN (...)
$whList = "";
$first = true;
foreach ($warehouses as $w) {
  $whList .= ($first ? "" : ",") . "'" . esc($w) . "'";
  $first = false;
}

// sto subquery: STOcode ของกลุ่มที่เลือก (STOlock=0, STOhide=0)
$stoIn = "CPSsto IN (SELECT STOcode FROM STO WHERE STOgroup IN (" . $whList . ") AND STOlock = 0 AND STOhide = 0)";

// condition (ตาม btn_search_Click): WHERE STK.STKsnsv != 3 + ขอบเขตเวลา + กรองรหัส/ชื่อ/กลุ่ม
$condition = " WHERE STK.STKsnsv != 3";
if ($dateFrom !== "") $condition .= " AND CS.CPSdateID >= '" . esc($dateFrom) . "'";
if ($dateTo !== "") $condition .= " AND CS.CPSdateID <= '" . esc($dateTo) . "'";
if ($productCode !== "") $condition .= " AND CPSstkID LIKE '" . esc($productCode) . "%'";
if ($productName !== "") $condition .= " AND STKdescT1 LIKE '%" . esc($productName) . "%'";
if ($groupCode !== "") $condition .= " AND STKgroup LIKE '" . esc($groupCode) . "%'";

try {
  $sql = "SELECT * ,((CASE WHEN A.sumcpp IS NULL THEN 0 ELSE A.sumcpp END) + (CASE WHEN A.SBLquan IS NULL THEN 0 ELSE A.SBLquan END)) - A.cpsQty AS stockAll FROM ("
    . " SELECT CS.CPSstkID, STK.STKgroup,"
    . " (SELECT F_MKTIMPlan FROM BI_CUBE.dbo.STK_Properties WHERE STKcode = CS.CPSstkID) F_MKTIMPlan,"
    . " CONVERT(nvarchar(255), STK.STKdescT1) STKdescT1,"
    . " CONVERT(nvarchar(50), STK.STKdescT2) STKdescT2,"
    . " (SELECT STKmemo FROM STK WHERE STKcode = CS.CPSstkID) STKmemo,"
    . " (SELECT SUM(CPSstkREQ - CPSstkCUT1) FROM CPS WHERE CPSclearALL = 0 AND CPSstkID = CS.CPSstkID AND " . $stoIn . " AND CPSdateID >= '" . esc($dateFrom) . "' AND CPSdateID <= '" . esc($dateTo) . "' GROUP BY CPSstkID) sumcpsAll,"
    . " SUM(CS.CPSstkREQ - CS.CPSstkCUT1) cpsQty,"
    . " (SELECT SUM(MIL.MILquan) FROM MIH LEFT JOIN MIL ON MIL.MILvnos = MIH.MIHvnos AND MIL.MILtype = MIH.MIHtype AND MIL.MILday = MIH.MIHday AND MIL.MILmonth = MIH.MIHmonth AND MIL.MILyear = MIH.MIHyear WHERE MIH.MIHcancel = 0 AND MIHvnos LIKE 'RSV%' AND MIHtype = 'SS' AND MIL.MILstk = CS.CPSstkID GROUP BY MIL.MILstk) sumRSV,"
    . " PO.sumcpp sumcpp,"
    . " (SELECT SUM(CPXstkREQ) FROM CPX WHERE CPXclearALL = 0 AND CPXstkID = CS.CPSstkID GROUP BY CPXstkID) sumcpx,"
    . " (SELECT SUM(SBLquan) SBLquan FROM SBL WHERE SBLstk = CS.CPSstkID GROUP BY SBLstk) SBLquan,"
    . " (CASE WHEN EXISTS (SELECT 1 FROM CPS A LEFT JOIN DEB B ON A.CPScusID = B.DEBcode WHERE A.CPSclearALL = 0 AND A.CPSclearSTK = 0 AND B.DEBgrade = 'X' AND A.CPSstkID = CS.CPSstkID) THEN 1 ELSE 0 END) gradeX"
    . " FROM ("
    . " SELECT CPS.CPSdateID, CPS.CPSstkID, CPS.CPScusID, CPS.CPSstkREQ, CPS.CPSstkCUT1"
    . " FROM CPS LEFT JOIN DEB ON DEB.DEBcode = CPS.CPScusID"
    . " WHERE CPS.CPSclearALL = 0 AND ((CPSstkREQ - CPSstkCUT1) > 0) AND DEB.DEBgrade != 'X' AND " . $stoIn
    . " ) [CS]"
    . " LEFT JOIN STK ON STK.STKcode = CS.CPSstkID"
    . " LEFT JOIN (SELECT CPPstkID, SUM(CPPstkREQ - CPPstkCUT1) sumcpp FROM CPP WHERE (CPPstkREQ - CPPstkCUT1) > 0 AND CPPclearALL = 0 AND CPPclearUSER = 0 GROUP BY CPPstkID) PO ON PO.CPPstkID = CS.CPSstkID"
    . $condition
    . " GROUP BY CS.CPSstkID, STK.STKgroup, CONVERT(nvarchar(255), STK.STKdescT1), CONVERT(nvarchar(50), STK.STKdescT2), PO.sumcpp"
    . " ) A";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // map ไปตาม shape item ของ module
  $out = array();
  $id = 1;
  foreach ($rows as $r) {
    $out[] = array(
      "id" => $id++,
      "date" => $dateTo,
      "wh" => "",
      "productCode" => (string)$r["CPSstkID"],
      "group" => (string)$r["STKgroup"],
      "mktPlan" => (string)$r["F_MKTIMPlan"],
      "name" => (string)$r["STKdescT1"],
      "stkDesc" => (string)$r["STKdescT2"],
      "stkMemo" => (string)$r["STKmemo"],
      "so" => (float)$r["sumcpsAll"],
      "soNet" => (float)$r["cpsQty"],
      "rsv" => (float)$r["sumRSV"],
      "po" => (float)$r["sumcpp"],
      "pr" => (float)$r["sumcpx"],
      "sbl" => (float)$r["SBLquan"],
      "stock" => (float)$r["stockAll"],
      "gradeX" => ((int)$r["gradeX"] === 1)
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
