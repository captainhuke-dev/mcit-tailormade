<?php
/**
 * P038 — item 3: Print V2 (C# bgWorker_DoWorkV2) — report data per selected products
 *   header row: SumPriceCPS(stk, sto) + product info
 *   detail rows: CPS_detailReport(stk, sto) — CPS UNION RSV (reportRSV31)
 * POST { connectionId, products:[stkcode...], warehouse, useDate, dateFrom, dateTo, statusAll, statusChecks }
 * { ok, rows:[{group,stkcode,name,unit,sumstk,rsv,pending,balance,balance03,balance04,sumvalue,
 *              details:[{date,vnos,cus,msg,dep,order,rsv,balance,value,price,isRsv}]}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"), JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- products (whitelist [0-9A-Za-z-]) ---------- */
$products = array();
if (isset($body["products"]) && is_array($body["products"])) {
  foreach ($body["products"] as $p) {
    $p = trim((string) $p);
    if ($p === "") continue;
    if (!preg_match("/^[0-9A-Za-z\-]+$/", $p)) {
      http_response_code(400);
      echo json_encode(array("ok" => false, "error" => "รหัสสินค้าไม่ถูกต้อง: " . $p), JSON_UNESCAPED_UNICODE);
      exit;
    }
    if (!in_array($p, $products, true)) $products[] = $p;
  }
}
if (count($products) === 0) {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "โปรดเลือกรายการที่ต้องการ"), JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- คลัง (same as p038_search.php) ---------- */
$warehouse = isset($body["warehouse"]) ? trim($body["warehouse"]) : "";
$stoList = array();
foreach (explode(",", $warehouse) as $s) {
  $s = trim($s);
  if ($s === "") continue;
  if (!preg_match("/^[0-9A-Za-z\-]+$/", $s)) {
    http_response_code(400);
    echo json_encode(array("ok" => false, "error" => "รหัสคลังสินค้าไม่ถูกต้อง: " . $s), JSON_UNESCAPED_UNICODE);
    exit;
  }
  $stoList[] = $s;
}
if (count($stoList) === 0) {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "โปรดระบุคลังสินค้า"), JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- วันที่ ---------- */
$useDate = !empty($body["useDate"]);
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
if ($useDate) {
  foreach (array($dateFrom, $dateTo) as $dv) {
    if (!preg_match("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/", $dv)) {
      http_response_code(400);
      echo json_encode(array("ok" => false, "error" => "ช่วงวันที่ไม่ถูกต้อง"), JSON_UNESCAPED_UNICODE);
      exit;
    }
  }
}

/* ---------- status (same table as p038_search.php) ---------- */
$statusAll = !empty($body["statusAll"]);
$checks = array("14" => false, "31" => false);
if (isset($body["statusChecks"]) && is_array($body["statusChecks"])) {
  foreach ($body["statusChecks"] as $sc) {
    $v = isset($sc["value"]) ? $sc["value"] : "";
    if ($v === "14" || $v === "31") $checks[$v] = !empty($sc["checked"]);
  }
}
$c14 = $checks["14"];
$c31 = $checks["31"];
$reportRSV31 = false;
$where2 = "";
if ($statusAll) {
  if (!$c14 && !$c31) {
    $where2 = " AND ( MIH.MIHstatus != '14' AND CONVERT(nVARCHAR(200),mil.MILvCol1) = '' ) ";
  } elseif ($c14 && !$c31) {
    $where2 = " AND CONVERT(nVARCHAR(200),mil.MILvCol1) = '' ";
  } elseif (!$c14 && $c31) {
    $where2 = " AND MIH.MIHstatus != '14' ";
  }
} else {
  if (!$c14 && !$c31) {
    http_response_code(400);
    echo json_encode(array("ok" => false, "error" => "โปรดเลือกสถานะ"), JSON_UNESCAPED_UNICODE);
    exit;
  }
  if ($c14 && $c31) {
    $where2 = " AND ( MIH.MIHstatus = '14' OR CONVERT(nVARCHAR(200),mil.MILvCol1) != '' ) ";
  } elseif ($c14 && !$c31) {
    $where2 = " AND MIH.MIHstatus = '14' ";
  } else {
    $where2 = " AND CONVERT(nVARCHAR(200),mil.MILvCol1) != '' ";
    $reportRSV31 = true;
  }
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

$stoPh = implode(",", array_fill(0, count($stoList), "?"));
$stkPh = implode(",", array_fill(0, count($products), "?"));

$filDate1 = "";
$filDate2 = "";
$dates = array();
if ($useDate) {
  $filDate1 = " AND (CPSdateID BETWEEN ? AND ?) ";
  $filDate2 = " AND (CPS.CPSdateID BETWEEN ? AND ?) ";
  $dates = array($dateFrom, $dateTo);
}
$stoParams = array_values($stoList);
$stkParams = array_values($products);

/* params ตามลำดับ ? ใน SQL: header = (sto,dates) x3 (sumvalue,sumstk,pending) -> distinct (sto,stk); detail = sto,stk,dates(,stk) */
$paramsSum = array();
for ($i = 0; $i < 3; $i++) {
  $paramsSum = array_merge($paramsSum, $stoParams);
  if ($useDate) $paramsSum = array_merge($paramsSum, $dates);
}
$paramsSum = array_merge($paramsSum, $stoParams, $stkParams, $stkParams);

/* ---------- product header + summary (C# SumPriceCPS + master grid cols) ---------- */
$sql = " SELECT STK.STKgroup, tb.CPSstkID, CONVERT(VARCHAR(200), STK.STKdescT1) AS STKdescT1,"
  . " CONVERT(VARCHAR(200), STK.STKdescT2) AS STKdescT2, CONVERT(VARCHAR(20), STK.STKuname1) AS STKuname1,"
  . " (SELECT ROUND(SUM(CPS2.CPSsumREQ),2) FROM CPS CPS2 WHERE CPS2.CPSclearALL = 0 AND CPS2.CPSclearSTK = 0 AND CPS2.CPSsto IN (" . $stoPh . ") AND CPS2.CPSstkID = tb.CPSstkID" . $filDate1 . ") AS sumvalue,"
  . " (SELECT SUM(CPS3.CPSstkREQ) FROM CPS CPS3 WHERE CPS3.CPSclearALL = 0 AND CPS3.CPSclearSTK = 0 AND CPS3.CPSsto IN (" . $stoPh . ") AND CPS3.CPSstkID = tb.CPSstkID" . $filDate1 . ") AS sumstk,"
  . " (SELECT SUM(CASE WHEN CPS4.CPSvnosID LIKE 'RSV%' THEN 0 ELSE (CPS4.CPSstkREQ - CPS4.CPSstkCUT1) END) FROM CPS CPS4 WHERE CPS4.CPSclearALL = 0 AND CPS4.CPSsto IN (" . $stoPh . ") AND CPS4.CPSstkID = tb.CPSstkID" . $filDate1 . ") AS pending,"
  . " (SELECT SUM(X.MILquan) FROM MIH LEFT JOIN MIL X ON MIH.MIHvnos = X.MILvnos WHERE X.MILvnos LIKE 'RSV%' AND X.MILtype = 'SS' AND MIH.MIHcancel = 0 AND X.MILstk = tb.CPSstkID) AS rsv,"
  . " (SELECT SUM(SBL.SBLquan) FROM SBL WHERE SBL.SBLstk = tb.CPSstkID AND SBL.SBLsto IN ('01','01-CL','01-B')) AS sbl01,"
  . " (SELECT SUM(SBL2.SBLquan) FROM SBL SBL2 WHERE SBL2.SBLstk = tb.CPSstkID AND SBL2.SBLsto IN ('03')) AS sbl03,"
  . " (SELECT SUM(SBL3.SBLquan) FROM SBL SBL3 WHERE SBL3.SBLstk = tb.CPSstkID AND SBL3.SBLsto IN ('04-1','04-2')) AS sbl04";
$sql .= " FROM ( SELECT DISTINCT CPSstkID FROM CPS WHERE CPSclearALL = 0 AND CPSsto IN (" . $stoPh . ") AND CPSstkID IN (" . $stkPh . ")";
$sql .= " UNION SELECT DISTINCT X2.MILstk FROM MIH LEFT JOIN MIL X2 ON MIH.MIHvnos = X2.MILvnos WHERE X2.MILvnos LIKE 'RSV%' AND X2.MILtype = 'SS' AND MIH.MIHcancel = 0 AND X2.MILstk IN (" . $stkPh . ") ) tb";
$sql .= " LEFT JOIN STK ON STK.STKcode = tb.CPSstkID ORDER BY STK.STKgroup, tb.CPSstkID";

try {
  $st = $db->prepare($sql);
  $st->execute($paramsSum);
  $sumRows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- detail per product (C# CPS_detailReport) ---------- */
$sqlD = " SELECT MILlistNo AS listno, '1' AS vnostype, CPSdateID, DATEDIFF(DAY,CPSdateID,GETDATE()) AS datediff, CPSvnosID, CPScusID, CONVERT(VARCHAR(200),DEBnameT) AS DEBnameT, DEBgrade,"
  . " CONVERT(VARCHAR(100),DEBcontactT) AS DEBcontactT, ROUND((CPSstkREQ - CPSstkCUT1),2) AS total, CONVERT(VARCHAR(255),MIHdesc) AS MIHdesc,"
  . " CONVERT(VARCHAR(25),CPSper) AS CPSper, CONVERT(VARCHAR(100),DEP.DEPdescT) AS DEPdescT, '' AS RSVqty, CPSstkREQ, CPSstkCUT1, CPSsumREQ, mil.MILvCol1 FROM CPS";
$sqlD .= " LEFT JOIN MIH ON MIH.MIHvnos = CPS.CPSvnosID AND MIH.MIHcus = CPS.CPScusID";
$sqlD .= " LEFT JOIN DEB ON DEB.DEBcode = CPS.CPScusID";
$sqlD .= " LEFT JOIN DEP ON CONVERT(VARCHAR(20), CPS.CPSdep) = CONVERT(VARCHAR(20), DEP.DEPcode)";
$sqlD .= " LEFT JOIN (SELECT MILvnos,MILstk,MILlistNo,MILvCol1 FROM MIL WHERE MILtype = 'PS') AS mil ON mil.MILvnos = CPS.CPSvnosID AND mil.MILlistNo = CPS.CPSlistNo AND mil.MILstk = CPS.CPSstkID";
$sqlD .= " WHERE CPSclearALL = 0 AND CPSsto IN (" . $stoPh . ") AND CPSstkID = ?" . $where2 . $filDate2;

if (!$reportRSV31) {
  $sqlD .= " UNION ALL SELECT '2' AS vnostype, MIL.MILlistNo AS listno, CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear),103) AS CPSdateID, DATEDIFF(DAY,CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear),103),GETDATE()) AS datediff, MIH.MIHvnos AS CPSvnosID, MIH.MIHcus AS CPScusID,"
    . " CONVERT(VARCHAR(200),DEB.DEBnameT) AS DEBnameT, DEB.DEBgrade AS DEBgrade, CONVERT(VARCHAR(100),DEB.DEBcontactT) AS DEBcontactT, '' AS total, CONVERT(VARCHAR(255),MIH.MIHdesc) AS MIHdesc,"
    . " CONVERT(VARCHAR(25),MIH.MIHper) AS CPSper, CONVERT(VARCHAR(100),DEP.DEPdescT) AS DEPdescT, MIL.MILquan AS RSVqty, '' AS CPSstkREQ, '' AS CPSstkCUT1, MIL.MILcog AS CPSsumREQ, '' AS MILvCol1";
  $sqlD .= " FROM MIH LEFT JOIN MIL ON MIH.MIHvnos = MIL.MILvnos AND MIH.MIHcus = MIL.MILcus";
  $sqlD .= " LEFT JOIN DEB ON MIH.MIHcus = DEB.DEBcode LEFT JOIN DEP ON MIH.MIHdep = DEP.DEPcode";
  $sqlD .= " WHERE MIHvnos LIKE 'RSV%' AND MIL.MILtype = 'SS' AND MIH.MIHcancel = 0 AND MIL.MILstk = ?";
}
$sqlD .= " ORDER BY vnostype, CPSdateID";

function p038v2_num($v)
{
  if ($v === null || $v === "") return 0;
  return (float) $v;
}
function p038v2_date($v)
{
  if ($v === null || $v === "") return "";
  return substr($v, 0, 10);
}
function p038v2_cost($db, $vnos, $stk, $line)
{
  $st = $db->prepare("SELECT ROUND((CSTcostF/CSTquan),2) AS cost FROM CST WHERE CSTvnos = ? AND CSTstk = ? AND CSTlist = ?");
  $st->execute(array($vnos, $stk, $line));
  $r = $st->fetch(PDO::FETCH_ASSOC);
  return $r && $r["cost"] !== null ? (float) $r["cost"] : 0;
}

$detailCache = array();
foreach ($products as $stk) {
  $paramsD = array_merge($stoParams, array($stk));
  if ($useDate) $paramsD = array_merge($paramsD, $dates);
  if (!$reportRSV31) $paramsD[] = $stk;
  try {
    $st = $db->prepare($sqlD);
    $st->execute($paramsD);
    $dRows = $st->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
    exit;
  }
  $details = array();
  foreach ($dRows as $d) {
    $vnos = (string) $d["CPSvnosID"];
    $isRsv = (substr($vnos, 0, 3) === "RSV");
    $msg = $d["CPScusID"] . " (" . $d["DEBgrade"] . ") " . $d["DEBnameT"] . " " . $d["DEBcontactT"] . " " . $d["CPSper"];
    if ($d["MILvCol1"] !== "" && $d["MILvCol1"] !== null) $msg .= "\n@" . $d["MILvCol1"];
    if ($d["MIHdesc"] !== "" && $d["MIHdesc"] !== null) $msg .= "\n#" . $d["MIHdesc"];
    $order = p038v2_num($d["CPSstkREQ"]);
    $rsv = p038v2_num($d["RSVqty"]);
    $value = p038v2_num($d["CPSsumREQ"]);
    $qtyForPrice = $isRsv ? $rsv : $order;
    $price = $qtyForPrice != 0 ? round($value / $qtyForPrice, 2) : 0;
    if ($isRsv) $price = p038v2_cost($db, $vnos, $stk, (string) $d["listno"]);
    $details[] = array(
      "date" => p038v2_date($d["CPSdateID"]),
      "datediff" => p038v2_num($d["datediff"]),
      "vnos" => $vnos,
      "listno" => (string) $d["listno"],
      "cus" => (string) $d["CPScusID"],
      "msg" => (string) $msg,
      "dep" => (string) $d["DEPdescT"],
      "order" => $order,
      "rsv" => $rsv,
      "balance" => p038v2_num($d["total"]),
      "value" => $value,
      "price" => $price,
      "isRsv" => $isRsv
    );
  }
  $detailCache[$stk] = $details;
}

/* ---------- assemble ---------- */
$out = array();
foreach ($sumRows as $r) {
  $stk = (string) $r["CPSstkID"];
  $s01 = p038v2_num($r["sbl01"]);
  $s03 = p038v2_num($r["sbl03"]);
  $s04 = p038v2_num($r["sbl04"]);
  $out[] = array(
    "group" => (string) $r["STKgroup"],
    "stkcode" => $stk,
    "name" => trim(((string) $r["STKdescT1"]) . " " . ((string) $r["STKdescT2"])),
    "unit" => (string) $r["STKuname1"],
    "sumstk" => p038v2_num($r["sumstk"]),
    "rsv" => p038v2_num($r["rsv"]),
    "pending" => p038v2_num($r["pending"]),
    "balance" => $s01,
    "balance03" => $s03,
    "balance04" => $s04,
    "sumvalue" => p038v2_num($r["sumvalue"]),
    "details" => isset($detailCache[$stk]) ? $detailCache[$stk] : array()
  );
}

echo json_encode(array("ok" => true, "count" => count($out), "rows" => $out), JSON_UNESCAPED_UNICODE);
