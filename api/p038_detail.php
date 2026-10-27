<?php
/**
 * P038 — item 2: detail per product (C# FrmBalanceGUI.cs CPS(string stkcodes, string sto))
 *   part1: CPS rows via MIH LEFT JOIN CPS + DEB + AR_S + mil(PS)  (status where applies)
 *   part2: RSV rows via MIH+MIL (RSV%, SS, cancel=0) + DEB + IC_S
 *   ORDER BY CPScusID
 * POST { connectionId, productCode, warehouse, useDate, dateFrom, dateTo, statusAll, statusChecks }
 * { ok, count, rows:[{vnos,cusid,debname,debgrade,date,stkcode,req,cut,total,status,desc}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$productCode = isset($body["productCode"]) ? trim($body["productCode"]) : "";

if ($connectionId === "" || $productCode === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "ข้อมูลไม่ครบ"], JSON_UNESCAPED_UNICODE);
  exit;
}

/* warehouse whitelist */
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

/* date (C# filDate1 — applies to CPS part only) */
$useDate = !empty($body["useDate"]);
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
if ($useDate) {
  foreach (array($dateFrom, $dateTo) as $dv) {
    if (!preg_match("/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/", $dv)) {
      http_response_code(400);
      echo json_encode(["ok" => false, "error" => "ช่วงวันที่ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
      exit;
    }
  }
}

/* status (same table as p038_search.php — C# btn_refresh_Click) */
$statusAll = !empty($body["statusAll"]);
$checks = array("14" => false, "31" => false);
if (isset($body["statusChecks"]) && is_array($body["statusChecks"])) {
  foreach ($body["statusChecks"] as $sc) {
    $v = isset($sc["value"]) ? $sc["value"] : "";
    if ($v === "14" || $v === "31") {
      $checks[$v] = !empty($sc["checked"]);
    }
  }
}
$c14 = $checks["14"];
$c31 = $checks["31"];

$where = "";
$joinMIH = false;
if ($statusAll) {
  if (!$c14 && !$c31) {
    $where = " AND ( MIH.MIHstatus != '14' and CONVERT(nVARCHAR(200),mil.MILvCol1) = '' ) ";
    $joinMIH = true;
  } elseif ($c14 && !$c31) {
    $where = " AND CONVERT(nVARCHAR(200),mil.MILvCol1) = '' ";
  } elseif (!$c14 && $c31) {
    $where = " AND MIH.MIHstatus != '14' ";
    $joinMIH = true;
  }
} else {
  if (!$c14 && !$c31) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "โปรดเลือกสถานะ"], JSON_UNESCAPED_UNICODE);
    exit;
  }
  if ($c14 && $c31) {
    $where = " AND ( MIH.MIHstatus = '14' OR CONVERT(nVARCHAR(200),mil.MILvCol1) != '' ) ";
    $joinMIH = true;
  } elseif ($c14 && !$c31) {
    $where = " AND MIH.MIHstatus = '14' ";
    $joinMIH = true;
  } else {
    $where = " AND CONVERT(nVARCHAR(200),mil.MILvCol1) != '' ";
  }
}

$filDate1 = "";
if ($useDate) {
  $filDate1 = " AND (CPSdateID BETWEEN ? AND ?) ";
}

$stoPh = implode(",", array_fill(0, count($stoList), "?"));
$stoSql = "(" . $stoPh . ")";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

/* part 1: CPS (C# CPS() sql — base MIH LEFT JOIN CPS) */
$sql = " SELECT CPSdateID,CPSvnosID,CPScusID,CONVERT (VARCHAR(100),DEBnameT) AS DEBnameT,DEBgrade,CPSstkID,CPSstkREQ,";
$sql .= " CPSstkCUT1,(CPSstkREQ - CPSstkCUT1) AS total,(CONVERT (VARCHAR(10), AR_Scode) + ' : ' + CONVERT (VARCHAR(100), AR_SnameT)) AS MihStatus,";
$sql .= " CONVERT (VARCHAR(200),MIHdesc) AS MIHdesc FROM MIH LEFT JOIN CPS ON MIH.MIHvnos = CPS.CPSvnosID LEFT JOIN DEB ON DEB.DEBcode = CPS.CPScusID";
$sql .= " LEFT JOIN AR_S ON AR_S.AR_Scode = MIH.MIHstatus ";
$sql .= " LEFT JOIN ( SELECT MILvnos,MILstk, MILlistNo, MILvCol1 FROM MIL WHERE MILtype = 'PS' ) AS mil ON mil.MILvnos = CPS.CPSvnosID AND mil.MILstk = CPS.CPSstkID AND mil.MILlistNo = CPS.CPSlistNo ";
$sql .= " WHERE CPSclearALL = 0 AND CPSsto IN " . $stoSql . " AND CPSstkID = ? " . $where . $filDate1;

/* part 2: RSV (C# CPS() sql UNION ALL) */
$sql .= " UNION ALL SELECT CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear) ,103) AS CPSdateID,MIH.MIHvnos AS CPSvnosID,";
$sql .= " MIH.MIHcus AS CPScusID,CONVERT (VARCHAR(100),DEB.DEBnameT) AS DEBnameT,DEB.DEBgrade AS DEBgrade,MIL.MILstk AS CPSstkID,MIL.MILquan AS CPSstkREQ,";
$sql .= " '0' AS CPSstkCUT1,'0' AS total,(CONVERT (VARCHAR(10), IC_S.IC_Scode) + ' : ' + CONVERT (VARCHAR(100), IC_S.IC_SnameT)) AS MihStatus,";
$sql .= " CONVERT (VARCHAR(200),MIHdesc) AS MIHdesc FROM MIH LEFT JOIN MIL ON MIH.MIHvnos = MIL.MILvnos AND MIH.MIHcus = MIL.MILcus ";
$sql .= " LEFT JOIN DEB ON MIH.MIHcus = DEB.DEBcode LEFT JOIN IC_S ON MIH.MIHstatus = IC_S.IC_Scode WHERE MIHvnos LIKE 'RSV%' AND MIL.MILtype = 'SS'";
$sql .= " AND MIH.MIHcancel = 0 AND MIL.MILstk = ? ORDER BY CPScusID";

$params = array_merge($stoList, array($productCode));
if ($useDate) {
  $params[] = $dateFrom;
  $params[] = $dateTo;
}
$params[] = $productCode;

try {
  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

function p038d_date($v)
{
  if ($v === null || $v === "") return "";
  return substr($v, 0, 10);
}

$out = array();
foreach ($rows as $r) {
  $out[] = array(
    "vnos" => (string) $r["CPSvnosID"],
    "cusid" => (string) $r["CPScusID"],
    "debname" => (string) $r["DEBnameT"],
    "debgrade" => (string) $r["DEBgrade"],
    "date" => p038d_date($r["CPSdateID"]),
    "stkcode" => (string) $r["CPSstkID"],
    "req" => (float) $r["CPSstkREQ"],
    "cut" => (float) $r["CPSstkCUT1"],
    "total" => (float) $r["total"],
    "status" => (string) $r["MihStatus"],
    "desc" => (string) $r["MIHdesc"]
  );
}

echo json_encode(array(
  "ok" => true,
  "count" => count($out),
  "rows" => $out
), JSON_UNESCAPED_UNICODE);
