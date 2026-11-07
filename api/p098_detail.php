<?php
/**
 * P098 — Detail modal: SO/RSV + PO tables of a selected product
 * Based on C# getSORSV + getPO (frm_PUR_CPS_PR_X_GUI.cs) — MAC5 (SQL Server)
 * POST { connectionId, stkcode, dateFrom, dateTo, warehouses[] }
 * Returns { ok, sorsv:[{date, vnos, cus, cusName, sto, qty, rsv, status, mihDesc}], po:[{date, vnos, cus, cusName, sto, qty}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$stkcode = isset($body["stkcode"]) ? trim($body["stkcode"]) : "";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$warehouses = isset($body["warehouses"]) ? (array)$body["warehouses"] : array();

if ($stkcode === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "ไม่มีรหัสสินค้า"), JSON_UNESCAPED_UNICODE);
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

// Warehouse groups → STO condition (same as p098_search.php)
$stoIn = "";
if (count($warehouses) > 0) {
  $whList = "";
  $first = true;
  foreach ($warehouses as $w) {
    $whList .= ($first ? "" : ",") . "'" . esc($w) . "'";
    $first = false;
  }
  $stoIn = "CPSsto IN (SELECT STOcode FROM STO WHERE STOgroup IN (" . $whList . ") AND STOlock = 0 AND STOhide = 0)";
}

// ---- SO/RSV (getSORSV): 9 columns ----
$sorsvSql = "SELECT tb.date, tb.vnos, tb.cus, DEB.DEBnameT, tb.status, tb.sto, tb.qty, tb.RSV, tb.type, B.MIHdesc FROM ("
  . " SELECT FORMAT(CPS.CPSdateID,'yyyy/MM/dd') [date], 'SO' [type], CPSvnosID [vnos], CPSlistNo [line], CPSsto [sto], CPScusID [cus], CPSstkREQ [req], CPSstkCUT1 [cut], (CPSstkREQ - CPSstkCUT1) [qty], 0 RSV, (SELECT CONVERT(nvarchar(100),MIHstatus) + ' : ' + CONVERT(nvarchar(100),AR_SnameT) FROM MIH LEFT JOIN AR_S ON AR_S.AR_Scode = MIHstatus WHERE MIHvnos = CPSvnosID) status FROM CPS WHERE CPSclearALL = 0 AND CPSstkID = '" . esc($stkcode) . "'"
  . ($dateFrom !== "" ? " AND CPSdateID >= '" . esc($dateFrom) . "'" : "")
  . ($dateTo !== "" ? " AND CPSdateID <= '" . esc($dateTo) . "'" : "")
  . (count($warehouses) > 0 ? " AND " . $stoIn : "")
  . " UNION ALL "
  . " SELECT FORMAT(CONVERT(DATE, STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear), 103), 'yyyy/MM/dd') [date], 'SS' [type], MILvnos [vnos], MILlistNo [line], MILsto [sto], MILcus [cus], 0 [req], 0 [cut], 0 [qty], MILquan [RSV], '' status FROM MIH LEFT JOIN MIL ON MIL.MILvnos = MIH.MIHvnos AND MIL.MILtype = MIH.MIHtype AND MIL.MILday = MIH.MIHday AND MIL.MILmonth = MIH.MIHmonth AND MIL.MILyear = MIH.MIHyear WHERE MIH.MIHcancel = 0 AND MIHvnos LIKE 'RSV%' AND MIHtype = 'SS' AND MIL.MILstk = '" . esc($stkcode) . "'"
  . ") [tb] LEFT JOIN (SELECT MIHvnos, MIHcus, MIHdesc FROM MIH) [B] ON B.MIHvnos = tb.vnos AND B.MIHcus = tb.cus LEFT JOIN DEB ON DEB.DEBcode = tb.cus ORDER BY tb.[date], tb.qty";

// ---- PO (getPO): 6 columns ----
$poSql = "SELECT FORMAT(CPP.CPPdateID,'yyyy/MM/dd') [date], CPPvnosID [vnos], CPPsto [sto], (CPPstkREQ - CPPstkCUT1) [qty], CONVERT(nvarchar(50),MIL.MILvCol1) [cusID], DEB.DEBnameT FROM CPP LEFT JOIN MIL ON MIL.MILvnos = CPP.CPPvnosID AND MILstk = CPPstkID AND MILlistNo = CPP.CPPlistNo LEFT JOIN DEB ON DEB.DEBcode = CONVERT(nvarchar(50),MIL.MILvCol1) WHERE CPPclearALL = 0 AND CPPstkID = '" . esc($stkcode) . "' ORDER BY FORMAT(CPP.CPPdateID,'yyyy/MM/dd'), (CPPstkREQ - CPPstkCUT1)";

try {
  $sorsv = $db->query($sorsvSql)->fetchAll(PDO::FETCH_ASSOC);
  $po = $db->query($poSql)->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

// Map to module shape
$sorsvOut = array();
foreach ($sorsv as $r) {
  $sorsvOut[] = array(
    "date" => (string)$r["date"],
    "vnos" => (string)$r["vnos"],
    "cus" => (string)$r["cus"],
    "cusName" => (string)($r["DEBnameT"] ?? ""),
    "sto" => (string)$r["sto"],
    "qty" => (float)$r["qty"],
    "rsv" => (float)$r["RSV"],
    "status" => (string)$r["status"],
    "mihDesc" => (string)($r["MIHdesc"] ?? "")
  );
}
$poOut = array();
foreach ($po as $r) {
  $poOut[] = array(
    "date" => (string)$r["date"],
    "vnos" => (string)$r["vnos"],
    "cus" => (string)($r["cusID"] ?? ""),
    "cusName" => (string)($r["DEBnameT"] ?? ""),
    "sto" => (string)$r["sto"],
    "qty" => (float)$r["qty"]
  );
}

echo json_encode(array(
  "ok" => true,
  "sorsv" => $sorsvOut,
  "po" => $poOut
), JSON_UNESCAPED_UNICODE);
