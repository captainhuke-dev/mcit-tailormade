<?php
/**
 * P038 — ปุ่มค้นหา → รายการสินค้าค้างส่งผลักดัน (UI demo/P038_demo.html)
 * Logic ตาม C# FrmBalanceGUI.cs (Load_DataGrid + btn_refresh_Click):
 *   - master SQL: CPS (CPSclearALL=0, CPSsto IN คลัง, STKgroup<>'MKT', STKsnsv<>'3', REQ-CUT1<>0)
 *     + SBL pivot 7 คลัง + CPXqty + STRsubs + JOIN MIH/MIL (type 'PS')
 *   - RSV SQL: MIH+MIL (MILvnos LIKE 'RSV%', MILtype='SS', MIHcancel=0) → merge
 *   - status where (14/31, MILvCol1) ตามตาราง C# + joinMIH
 *   - filter หลัง merge (search, ค้างส่ง, เบิก/จอง, คงคลัง 01/02)
 * POST { connectionId, searchBy, searchText, warehouse, useDate, dateFrom, dateTo,
 *        pending, reserve, stock01, stock02, statusAll, statusChecks:[{value,checked}] }
 * { ok, count, rows:[{date,groupCode,productCode,name,pending,reserved,pr,s01[3],s03,s04[2],unit,strsubs}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- คลัง (whitelist [0-9A-Za-z-] เพียงช่อง) ---------- */
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

/* ---------- วันที่ ---------- */
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

/* ---------- status (ตาราง C# btn_refresh_Click) ---------- */
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

$where2 = "";
$joinMIH = false;
if ($statusAll) {
  if (!$c14 && !$c31) {
    $where2 = " AND ( MIH.MIHstatus != '14' AND CONVERT(nVARCHAR(200),mil.MILvCol1) = '' ) ";
    $joinMIH = true;
  } elseif ($c14 && !$c31) {
    $where2 = " AND CONVERT(nVARCHAR(200),mil.MILvCol1) = '' ";
  } elseif (!$c14 && $c31) {
    $where2 = " AND MIH.MIHstatus != '14' ";
    $joinMIH = true;
  }
} else {
  if (!$c14 && !$c31) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "โปรดเลือกสถานะ"], JSON_UNESCAPED_UNICODE);
    exit;
  }
  if ($c14 && $c31) {
    $where2 = " AND ( MIH.MIHstatus = '14' OR CONVERT(nVARCHAR(200),mil.MILvCol1) != '' ) ";
    $joinMIH = true;
  } elseif ($c14 && !$c31) {
    $where2 = " AND MIH.MIHstatus = '14' ";
    $joinMIH = true;
  } else {
    $where2 = " AND CONVERT(nVARCHAR(200),mil.MILvCol1) != '' ";
  }
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- SBL pivot (ใช้ร่วมกัน 2 SQL) ---------- */
$sblPivot = " SELECT SBLstk,"
  . " SUM ( CASE SBLsto WHEN '01' THEN SBLquan ELSE 0 END ) [01],"
  . " SUM ( CASE SBLsto WHEN '01-B' THEN SBLquan ELSE 0 END ) [01-B], "
  . " SUM ( CASE SBLsto WHEN '01-CL' THEN SBLquan ELSE 0 END ) [01-CL],"
  . " SUM ( CASE SBLsto WHEN '02' THEN SBLquan ELSE 0 END ) [02],"
  . " SUM ( CASE SBLsto WHEN '03' THEN SBLquan ELSE 0 END ) [03],"
  . " SUM ( CASE SBLsto WHEN '04-1' THEN SBLquan ELSE 0 END ) [04-1],"
  . " SUM ( CASE SBLsto WHEN '04-2' THEN SBLquan ELSE 0 END ) [04-2] "
  . " FROM SBL WHERE SBLsto IN ( '01', '01-CL', '01-B', '02', '03', '04-1', '04-2' ) GROUP BY SBLstk ";

/* ---------- params ---------- */
$stoPh = implode(",", array_fill(0, count($stoList), "?"));
$params = array();

$filDate1 = "";
$filDate2 = "";
$dates = array();
if ($useDate) {
  $filDate1 = " AND (CPSdateID BETWEEN ? AND ?) ";
  $filDate2 = " AND (tb.CPSdateID BETWEEN ? AND ?) ";
  $dates = array($dateFrom, $dateTo);
}
foreach ($stoList as $s) {
  $params[] = $s;
}
/* params ตามลำดับ ? ใน SQL: filDate1 (2) -> sto (n) -> filDate2 (2) */
$stoParams = array_slice($params, 0, count($stoList));
$params = array_merge($dates, $stoParams, $dates);

/* ---------- master SQL (C# Load_DataGrid sql) ---------- */
$sql = " SELECT (SELECT TOP 1 CPSdateID FROM CPS WHERE CPSclearALL = 0 AND CPSstkID = tb.CPSstkID" . $filDate1 . " ORDER BY CPSdateID ASC) dateID,"
  . " STK.STKgroup,tb.CPSstkID,CONVERT(VARCHAR(200),STK.STKdescT1) STKdescT1,CONVERT (VARCHAR(200),STK.STKdescT2) STKdescT2,SUM(tb.CPSstkREQ - tb.CPSstkCUT1) CPSqty, "
  . " 0 RSVqty,"
  . " ISNULL((SELECT SUM(CPXstkREQ - CPXstkCUT) FROM CPX WHERE CPXstkID = tb.CPSstkID AND CPXclearALL = 0 AND CPXstatus = 2 ), 0 ) CPXqty,"
  . " ISNULL( Q.[01], 0 ) [01],ISNULL( Q.[01-B], 0 ) [01-B],ISNULL( Q.[01-CL], 0 ) [01-CL],ISNULL( Q.[02], 0 ) [02],ISNULL( Q.[03], 0 ) [03],"
  . " ISNULL( Q.[04-1], 0 ) [04-1],\tISNULL( Q.[04-2], 0 ) [04-2],"
  . " CONVERT(VARCHAR(50),STK.STKuname1) STKuname1, "
  . " ( SELECT TOP 1 STRsubs FROM STR LEFT JOIN SBL ON SBLstk = STRsubs\tWHERE SBLsto IN ('01','03','04-1','04-2','01-CL','01-B') "
  . " AND SBLquan > 0 AND STRcode = tb.CPSstkID ) AS STRsubs  "
  . " FROM CPS tb "
  . " LEFT JOIN (SELECT STKcode,STKgroup,STKdescT1,STKdescT2,STKsnsv,STKuname1 FROM STK)STK ON STK.STKcode = tb.CPSstkID ";
if ($joinMIH) {
  $sql .= " LEFT JOIN (SELECT MIHvnos,MIHstatus FROM MIH WHERE MIHtype = 'PS') MIH ON MIH.MIHvnos = tb.CPSvnosID  ";
}
$sql .= " LEFT JOIN (SELECT MILvnos,MILstk,MILlistNo,MILvCol1 FROM MIL WHERE MILtype = 'PS')mil ON mil.MILvnos = tb.CPSvnosID AND mil.MILstk = tb.CPSstkID AND mil.MILlistNo = tb.CPSlistNo ";
$sql .= " LEFT JOIN (" . $sblPivot . ") [Q] ON Q.SBLstk = tb.CPSstkID ";
$sql .= " WHERE tb.CPSclearALL = 0 AND tb.CPSsto IN (" . $stoPh . ") AND STK.STKgroup != 'MKT' AND STK.STKsnsv != '3'"
  . "  AND (tb.CPSstkREQ - tb.CPSstkCUT1) != 0 " . $where2 . $filDate2
  . " GROUP BY STK.STKgroup,tb.CPSstkID,CONVERT(VARCHAR(200),STK.STKdescT1), "
  . " CONVERT ( VARCHAR ( 200 ), STK.STKdescT2 ), CONVERT(VARCHAR(50),STK.STKuname1),Q.[01],\tQ.[01-B],\tQ.[01-CL],\tQ.[02],\tQ.[03],\tQ.[04-1], Q.[04-2]";

/* ---------- RSV SQL (C# sql2) ---------- */
$sql2 = " SELECT ( SELECT TOP 1 CONVERT(DATE,STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) FROM MIH LEFT JOIN MIL ON MIH.MIHvnos = MIL.MILvnos"
  . " WHERE MIHvnos LIKE 'RSV%' AND MIHtype = 'SS' AND MIHcancel = 0 AND MILstk = X.MILstk ORDER BY "
  . " CONVERT(DATE,STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) ASC ) dateID,"
  . " STK.STKgroup,X.MILstk AS CPSstkID,CONVERT (VARCHAR(200), STK.STKdescT1) AS STKdescT1,CONVERT (VARCHAR(200),STK.STKdescT2) AS STKdescT2,'0' AS CPSqty,SUM(X.MILquan) AS RSVqty,"
  . " ISNULL((SELECT SUM (CPXstkREQ - CPXstkCUT) FROM CPX  WHERE CPXstkID = X.MILstk AND CPXclearALL = 0 AND CPXstatus = 2 ),0) CPXqty,"
  . " ISNULL( Q.[01], 0 ) [01],\tISNULL( Q.[01-B], 0 ) [01-B],\tISNULL( Q.[01-CL], 0 ) [01-CL],\tISNULL( Q.[02], 0 ) [02],"
  . " ISNULL( Q.[03], 0 ) [03],\tISNULL( Q.[04-1], 0 ) [04-1],\tISNULL( Q.[04-2], 0 ) [04-2],"
  . " CONVERT (VARCHAR(50), STK.STKuname1) AS STKuname1, "
  . " NULL AS STRsubs "
  . " FROM MIH LEFT JOIN MIL X ON MIH.MIHvnos = X.MILvnos LEFT JOIN STK ON X.MILstk = STK.STKcode"
  . " LEFT JOIN (" . $sblPivot . ") [Q] ON Q.SBLstk =  X.MILstk "
  . " WHERE X.MILvnos LIKE 'RSV%' AND X.MILtype = 'SS' AND MIH.MIHcancel = 0 AND STK.STKsnsv != 3 "
  . "  GROUP BY STK.STKgroup,X.MILstk, CONVERT (VARCHAR(200), STK.STKdescT1),CONVERT ( VARCHAR ( 200 ), STK.STKdescT2 ),"
  . " CONVERT (VARCHAR(50), STK.STKuname1) ,Q.[01],\tQ.[01-B],\tQ.[01-CL],\tQ.[02],\tQ.[03],\tQ.[04-1],\tQ.[04-2]";

try {
  $st = $db->prepare($sql);
  $st->execute($params);
  $master = $st->fetchAll(PDO::FETCH_ASSOC);

  $st2 = $db->prepare($sql2);
  $st2->execute();
  $rsv = $st2->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- merge RSV → master (C# Loop RSV to CPS) ---------- */
$merged = array();
foreach ($master as $row) {
  $merged[$row["CPSstkID"]] = $row;
}
foreach ($rsv as $row) {
  $key = $row["CPSstkID"];
  if (isset($merged[$key])) {
    $merged[$key]["RSVqty"] = $row["RSVqty"];
  } else {
    $merged[$key] = $row;
  }
}

/* ---------- filter (C# DataView RowFilter) ---------- */
$searchBy = isset($body["searchBy"]) ? $body["searchBy"] : "group";
$searchText = isset($body["searchText"]) ? trim($body["searchText"]) : "";
$fPending = isset($body["pending"]) ? $body["pending"] : "all";
$fReserve = isset($body["reserve"]) ? $body["reserve"] : "all";
$fStock01 = isset($body["stock01"]) ? $body["stock01"] : "all";
$fStock02 = isset($body["stock02"]) ? $body["stock02"] : "all";

function triPass($mode, $hasValue)
{
  if ($mode === "all") return true;
  return $mode === "has" ? $hasValue : !$hasValue;
}

function fmtDate($v)
{
  if ($v === null || $v === "") return "";
  return substr($v, 0, 10);
}

$out = array();
foreach ($merged as $row) {
  $pending = (float) $row["CPSqty"];
  $reserved = (float) $row["RSVqty"];
  $s01 = array((float) $row["01"], (float) $row["01-CL"], (float) $row["01-B"]);
  $s02 = (float) $row["02"];
  $s03 = (float) $row["03"];
  $s04 = array((float) $row["04-1"], (float) $row["04-2"]);

  /* search (C#: code LIKE '%t%', name LIKE '%t%', group LIKE 't%') */
  if ($searchText !== "") {
    if ($searchBy === "code") {
      if (stripos($row["CPSstkID"], $searchText) === false) continue;
    } elseif ($searchBy === "name") {
      $name = trim($row["STKdescT1"] . " " . $row["STKdescT2"]);
      if (stripos($name, $searchText) === false) continue;
    } else {
      if (stripos($row["STKgroup"], $searchText) !== 0) continue;
    }
  }

  if (!triPass($fPending, $pending > 0)) continue;
  if (!triPass($fReserve, $reserved > 0)) continue;
  if (!triPass($fStock01, $s01[0] > 0 || $s01[1] > 0 || $s01[2] > 0)) continue;
  if (!triPass($fStock02, $s02 > 0)) continue;

  $out[] = array(
    "date" => fmtDate($row["dateID"]),
    "groupCode" => $row["STKgroup"],
    "productCode" => $row["CPSstkID"],
    "name" => trim($row["STKdescT1"] . " " . $row["STKdescT2"]),
    "pending" => $pending,
    "reserved" => $reserved,
    "pr" => (float) $row["CPXqty"],
    "s01" => $s01,
    "s03" => $s03,
    "s04" => $s04,
    "unit" => $row["STKuname1"],
    "strsubs" => $row["STRsubs"]
  );
}

/* sort dateID ASC (C# dv.Sort = "dateID ASC") */
usort($out, function ($a, $b) {
  return strcmp($a["date"], $b["date"]);
});

echo json_encode(array(
  "ok" => true,
  "count" => count($out),
  "rows" => $out
), JSON_UNESCAPED_UNICODE);
