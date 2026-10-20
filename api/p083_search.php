<?php
/**
 * P083 — search button -> 3 result tables (By Route / SparePart / Battery)
 *   sp = spare parts:  STKgroup IN (tb_GroupSparepart Active) OR STKgroup LIKE '%SP%'
 *   qc = batteries:    STKgroup IN (tb_GroupBattery Active)
 *   same status param (dropdown) for both; colv2 first-char filter; GROUP BY stk
 *   By Route section: pending (next step)
 * POST { connectionId, status }
 * { ok, sp:[{STKcode,STKgroup,STKdescT1,STKdescT2,qty}], qc:[...] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$route = isset($body["route"]) ? trim($body["route"]) : "all";
$warehouses = isset($body["warehouses"]) && is_array($body["warehouses"]) ? $body["warehouses"] : array();

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}
if ($status === "" || !ctype_digit($status)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดเลือกสถานะ"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // colv2 first-char filter (verbatim from request SQL)
  $colv2 = "'','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'";

  $base = "SELECT MILstk AS STKcode,"
    . " STKgroup,"
    . " CONVERT(VARCHAR(255), STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(255), STKdescT2) AS STKdescT2,"
    . " SUM(MILquan / MILconv) AS qty"
    . " FROM MIH"
    . " LEFT JOIN MIL ON MIHvnos = MILvnos"
    . " LEFT JOIN STK ON MILstk = STKcode"
    . " WHERE MIHstatus = ?"
    . " AND MIHtype = 'IS'"
    . " AND MILcut = -1"
    . " AND MIHcancel = 0"
    . " AND LOWER(SUBSTRING(TRIM(CONVERT(nvarchar(100), MILvCol2)), 1, 1)) IN (" . $colv2 . ")"
    . " AND ";

  $tail = " GROUP BY MILstk, STKgroup, CONVERT(VARCHAR(255), STKdescT1), CONVERT(VARCHAR(255), STKdescT2)"
    . " ORDER BY MILstk";

  // spare parts (bail a-lai)
  $sqlSp = $base . "(STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active') OR STKgroup LIKE '%SP%')" . $tail;
  // batteries (bat-ter-i)
  $sqlQc = $base . "STKgroup IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')" . $tail;

  $st = $db->prepare($sqlSp);
  $st->execute(array($status));
  $sp = $st->fetchAll(PDO::FETCH_ASSOC);

  $st = $db->prepare($sqlQc);
  $st->execute(array($status));
  $qc = $st->fetchAll(PDO::FETCH_ASSOC);

  // By Route (user SQL 2026-10-20): route + warehouse filters, exclude spare/battery groups
  $routeMap = array(
    "all" => array(),
    "Route1" => array("M1", "M2", "M3"),
    "Route2" => array("M4", "M5"),
    "M6" => array("M6"),
    "M7" => array("M7"),
    "M8" => array("M8"),
    "M9" => array("M9")
  );
  $routes = isset($routeMap[$route]) ? $routeMap[$route] : array();
  $routeFilter = "";
  if (count($routes) > 0) {
    $routeFilter = " AND D.Route IN ('" . implode("','", $routes) . "')";
  }

  $whGroups = array("G01", "G02", "G03", "G04", "G06", "G07", "G09", "RTV", "BKK");
  $whSel = array();
  foreach ($warehouses as $w) {
    $w = trim((string)$w);
    if (in_array($w, $whGroups)) $whSel[] = $w;
  }
  if (count($whSel) === 0) $whSel = $whGroups;
  $whIn = "'" . implode("','", $whSel) . "'";

  $sqlRoute = "SELECT STKcode, STKgroup,"
    . " CONVERT(VARCHAR(255), STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(255), STKdescT2) AS STKdescT2,"
    . " SUM(MILquan / MILconv) AS qty,"
    . " D.Route AS Route"
    . " FROM MIH"
    . " LEFT JOIN MIL ON MIHvnos = MILvnos"
    . " LEFT JOIN STK ON MILstk = STKcode"
    . " LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON MILjob = D.JOBcode"
    . " WHERE MIHstatus = ?"
    . " AND MIHtype = 'IS'"
    . " AND MILcut = -1"
    . " AND MIHcancel = 0"
    . " AND STK.STKcode NOT IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')"
    . " AND MILsto IN (SELECT STOcode FROM STO WHERE STOgroup IN (" . $whIn . ") AND STOlock = 0 AND STOhide = 0)"
    . " AND LOWER(SUBSTRING(TRIM(CONVERT(nvarchar(100), MILvCol2)), 1, 1)) NOT IN ('a','b','c','d','e','f','g','h','i','j','k')"
    . " AND STKgroup NOT IN (SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active' UNION ALL SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')"
    . " AND STKgroup NOT LIKE '%SP%'"
    . $routeFilter
    . " GROUP BY STKcode, STKgroup, CONVERT(VARCHAR(255), STKdescT1), CONVERT(VARCHAR(255), STKdescT2), D.Route"
    . " ORDER BY STKcode";

  $st = $db->prepare($sqlRoute);
  $st->execute(array($status));
  $routeRows = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(array(
    "ok" => true,
    "sp" => $sp,
    "qc" => $qc,
    "route" => $routeRows
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
