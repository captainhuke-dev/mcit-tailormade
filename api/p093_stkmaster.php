<?php
/**
 * P093 — ใบอนุมัติ PO: STK master + price (get_STKmaster + priceperUnit)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO
 * POST { connectionId, stk, cus, unit } (unit: 0=หน่วยหลัก, 1=หน่วยย่อย, 2=หน่วยรอง)
 * คืนค่า { ok, row:{...}, prices:[...] }
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$stk = isset($body["stk"]) ? trim($body["stk"]) : "";
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
  // SQL ตาม C# get_STKmaster — PR (CPX), PO (CPP cut=-1), RSV (SS/RSV%), SO (CPS),
  // CPS_true / Transfer_money / Delivery_stk / cusLock / ITEMNONMOVE / F_MKTIMPlan
  $sql = "DECLARE @n int; SET @n = " . $unit . "\n" .
    "SELECT tb.STKcode," .
    " (SELECT STKdescT1 FROM STK WHERE STKcode = tb.STKcode) AS STKdescT1," .
    " (SELECT TOP 1 MILdesc FROM MIL WHERE MILstk = tb.STKcode AND MILcus = ? AND MILtype = 'PP' ORDER BY MILvnos DESC) AS MILdesc," .
    " (SELECT (CASE WHEN @n = 0 THEN STKuname1" .
    " WHEN @n = 1 THEN (CASE STKunit1 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 END)" .
    " WHEN @n = 2 THEN (CASE STKunit2 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 END)" .
    " END) FROM STK WHERE STKcode = tb.STKcode) AS UnitName," .
    " (SELECT CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END FROM STK WHERE STKcode = tb.STKcode) AS Conv," .
    " SUM(tb.PR_QTY) AS PR_QTY, SUM(tb.PO_QTY) AS PO_QTY, SUM(tb.RSV_QTY) AS RSV_QTY, SUM(tb.SO_QTY) AS SO_QTY," .
    " SUM(tb.CPS_true) AS CPS_true, SUM(tb.Transfer_money) AS Transfer_money, SUM(tb.Delivery_stk) AS Delivery_stk," .
    " SUM(tb.cusLock) AS cusLock, SUM(tb.Other) AS Other," .
    " dt.ITEMNONMOVE, dt.F_MKTIMPlan" .
    " FROM (" .
    " SELECT STK.STKcode, '' AS CPS_true, '' AS Transfer_money, '' AS Delivery_stk, '' AS cusLock, '' AS Other, '' AS SO_QTY," .
    " ISNULL((SELECT SUM(CPPstkREQ - CPPstkCUT1) AS CPP_QTY FROM [M5CM-AA-01].[dbo].[CPP] WHERE CPPclearALL = 0 AND CPPcut = -1 AND CPPstkID = STK.STKcode GROUP BY CPPstkID), 0) AS PO_QTY," .
    " ISNULL((SELECT SUM(CPXstkREQ) - SUM(CPXstkCUT) FROM [M5CM-AA-01].[DBO].[CPX] WHERE CPXclearALL = 0 AND CPXstatus = 2 AND CPXstkID = STK.STKcode GROUP BY CPXstkID), 0) AS PR_QTY," .
    " ISNULL((SELECT SUM(MIL.MILquan) FROM [M5CM-AA-01].[dbo].MIH [MIH] LEFT JOIN [M5CM-AA-01].[dbo].MIL [MIL] ON MIH.MIHtype = MIL.MILtype AND MIH.MIHvnos = MIL.MILvnos AND MIH.MIHcus = MIL.MILcus WHERE MIH.MIHtype = 'SS' AND MIH.MIHcancel = 0 AND MIH.MIHVNOS LIKE 'RSV%' AND MIL.MILstk = STK.STKcode GROUP BY MIL.MILstk), 0) AS RSV_QTY" .
    " FROM STK [STK]" .
    " UNION ALL" .
    " SELECT A.CPSstkID AS STKcode," .
    " ISNULL(SUM(CASE A.[CaseStatus] WHEN 1 THEN A.Amount END), 0) AS CPS_true," .
    " ISNULL(SUM(CASE A.[CaseStatus] WHEN 2 THEN A.Amount END), 0) AS Transfer_money," .
    " ISNULL(SUM(CASE A.[CaseStatus] WHEN 3 THEN A.Amount END), 0) AS Delivery_stk," .
    " ISNULL(SUM(CASE A.[CaseStatus] WHEN 4 THEN A.Amount END), 0) AS cusLock," .
    " ISNULL(SUM(CASE A.[CaseStatus] WHEN 5 THEN A.Amount END), 0) AS Other," .
    " SUM(A.Amount) AS SO_QTY, '' AS PO_QTY, '' AS PR_QTY, '' AS RSV_QTY" .
    " FROM (SELECT CPSstkID," .
    " CASE WHEN MIHstatus != 14 AND CONVERT(NVARCHAR(MAX), MILvCol1) = '' AND DEBGRADE != 'X' THEN 1" .
    " WHEN MIHstatus = 14 THEN 2" .
    " WHEN CONVERT(NVARCHAR(MAX), MILvCol1) != '' THEN 3" .
    " WHEN DEBGRADE = 'X' THEN 4 ELSE 5 END AS [CaseStatus]," .
    " CPSstkREQ - CPSstkCUT1 AS Amount" .
    " FROM [CPS]" .
    " LEFT JOIN MIH ON MIHyear = YEAR(CPSDATEID) AND MIHmonth = MONTH(CPSDATEID) AND MIHday = DAY(CPSDATEID) AND MIHvnos = CPSvnosID AND MIHcus = CPScusID" .
    " LEFT JOIN MIL ON MILyear = YEAR(CPSDATEID) AND MILmonth = MONTH(CPSDATEID) AND MILday = DAY(CPSDATEID) AND MILvnos = CPSvnosID AND MILcus = CPScusID AND MILstk = CPSstkID AND MILlistNo = CPSlistNo" .
    " LEFT JOIN DEB ON DEBcode = CPScusID" .
    " WHERE CPSclearALL = 0 AND CPSclearSTK = 0) A" .
    " GROUP BY A.CPSstkID)" .
    " tb" .
    " LEFT JOIN (SELECT ISNULL(SBLSTK, 0) AS SBLSTK, ISNULL(ITEMNONMOVE, 0) AS ITEMNONMOVE, ISNULL(F_MKTIMPlan, 0) AS F_MKTIMPlan FROM [vw_stkAVGday]) dt" .
    " ON dt.SBLSTK = tb.STKcode" .
    " WHERE tb.STKcode = ?" .
    " GROUP BY tb.STKcode, dt.ITEMNONMOVE, dt.F_MKTIMPlan";

  $st = $db->prepare($sql);
  $st->execute(array($cus, $stk));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $row = array(
    "stkCode" => "", "desc" => "", "milDesc" => "", "unitName" => "", "conv" => 1,
    "prQty" => 0, "poQty" => 0, "rsvQty" => 0, "soQty" => 0,
    "cpsTrue" => 0, "transferMoney" => 0, "deliveryStk" => 0, "cusLock" => 0,
    "nonMove" => 0, "imPlan" => 0
  );
  if (count($rows) > 0) {
    $r = $rows[0];
    $row = array(
      "stkCode" => (string)$r["STKcode"],
      "desc" => $r["STKdescT1"] === null ? "" : (string)$r["STKdescT1"],
      "milDesc" => $r["MILdesc"] === null ? "" : (string)$r["MILdesc"],
      "unitName" => $r["UnitName"] === null ? "" : (string)$r["UnitName"],
      "conv" => (float)$r["Conv"],
      "prQty" => (float)$r["PR_QTY"],
      "poQty" => (float)$r["PO_QTY"],
      "rsvQty" => (float)$r["RSV_QTY"],
      "soQty" => (float)$r["SO_QTY"],
      "cpsTrue" => (float)$r["CPS_true"],
      "transferMoney" => (float)$r["Transfer_money"],
      "deliveryStk" => (float)$r["Delivery_stk"],
      "cusLock" => (float)$r["cusLock"],
      "nonMove" => $r["ITEMNONMOVE"] === null ? 0 : (float)$r["ITEMNONMOVE"],
      "imPlan" => $r["F_MKTIMPlan"] === null ? 0 : (float)$r["F_MKTIMPlan"]
    );
  }

  // Price 1-5 ตาม C# priceperUnit — TOP 5 (MILcog - MILdiscA)/conv * MIHexchg
  $sqlPrice = "DECLARE @n int; SET @n = " . $unit . "\n" .
    "SELECT TOP 5 MILyear, MILmonth, MILday, MILstk," .
    " ((MILcog - MILdiscA) / (MILquan / (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END)) * (SELECT TOP 1 MIHexchg FROM MIH WHERE MIHvnos = MILvnos)) AS PricePerUnit," .
    " (CASE WHEN @n = 0 THEN STKuname1" .
    " WHEN @n = 1 THEN (CASE STKunit1 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 END)" .
    " WHEN @n = 2 THEN (CASE STKunit2 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 END)" .
    " END) AS STKuname" .
    " FROM MIL" .
    " LEFT JOIN STK ON STKcode = MILstk" .
    " WHERE MILtype = 'IP' AND (MILquan / (CASE WHEN @n = 0 THEN 1 WHEN @n = 1 THEN STKconv1 WHEN @n = 2 THEN STKconv2 END)) != 0 AND MILstk = ?" .
    " ORDER BY MILyear DESC, MILmonth DESC, MILday DESC";

  $st2 = $db->prepare($sqlPrice);
  $st2->execute(array($stk));
  $priceRows = $st2->fetchAll(PDO::FETCH_ASSOC);
  $prices = array();
  foreach ($priceRows as $pr) {
    $prices[] = array(
      "price" => (float)$pr["PricePerUnit"],
      "unit" => $pr["STKuname"] === null ? "" : (string)$pr["STKuname"]
    );
  }

  echo json_encode(array(
    "ok" => true,
    "row" => $row,
    "prices" => $prices
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
