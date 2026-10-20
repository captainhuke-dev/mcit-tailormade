<?php
/**
 * P083 — PickList To Load V2 — รายงาน 3 section (MAC5)
 * clone C# frm_PickListToLOAD_v2 (getFilter 4-param sp/qc + 5-param byRoute + getTotalStk)
 * POST { connectionId, status, route, groups:[...] }
 * { ok, count, machine, printedAt, status, route,
 *   sections:[{key:"sp"|"qc"|"route", route?, items:[{stk,desc1,sto,grand,unit,rows:[...]}]}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$route = isset($body["route"]) ? trim($body["route"]) : "all";
$groups = isset($body["groups"]) && is_array($body["groups"]) ? $body["groups"] : array();

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
// ตัดค่าว่างออกจากกลุ่มคลัง (clone C# — IN (SELECT STOcode FROM STO WHERE STOgroup IN (...)))
$groupsClean = array();
foreach ($groups as $g) {
  $g = trim((string) $g);
  if ($g !== "") $groupsClean[] = $g;
}
if (count($groupsClean) === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดเลือกกลุ่มคลังสินค้า อย่างน้อย 1 ตัวเลือก"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

// ---------- constants (clone C# verbatim) ----------
$colv2 = "'','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'"; // sp/qc
$toLoadFilter = "'a','b','c','d','e','f','g','h','i','j','k'";              // byRoute
$spGroupSub = "(SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active')";
$qcGroupSub = "(SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')";

$groupPh = array();
foreach ($groupsClean as $g) $groupPh[] = "?";
$stoSub = "(SELECT STOcode FROM STO WHERE STOgroup IN (" . implode(",", $groupPh) . ") AND STOlock=0 AND STOhide=0)";

// route condition (clone C#)
function routeIn($route) {
  if ($route === "Route1") return " AND D.Route IN ('M1','M2','M3')";
  if ($route === "Route2") return " AND D.Route IN ('M4','M5')";
  return " AND D.Route IN ('" . $route . "')";
}

// ---------- getFilter 4-param (sp/qc) — clone C# ----------
function getSpQc($db, $status, $colv2, $spGroupSub, $qcGroupSub, $filter) {
  $cond = "";
  if ($filter === "sp") $cond = " AND ( C.STKgroup IN " . $spGroupSub . " OR C.STKgroup LIKE '%SP%' )";
  if ($filter === "qc") $cond = " AND C.STKgroup IN " . $qcGroupSub;
  $sql = "SELECT B.MILstk AS STKcode, C.STKgroup, CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1,"
    . " MILvnos, CONVERT(nvarchar(50), B.MILsto) AS MILsto, DEB.DEBcode, CONVERT(nvarchar(255), DEBnameT) AS DEBnameT,"
    . " CONVERT(nvarchar(255), DEBcontactT) AS DEBcontactT, (B.MILquan / B.MILconv) AS qty, CONVERT(nvarchar(100), B.MILuname) AS MILuname,"
    . " CONVERT(nvarchar(25), CONVERT(DATE,STR(B.MILday) + '/' + STR(B.MILmonth) + '/' + STR(B.MILyear), 103)) AS MILdate, B.MILquan"
    . " FROM MIH A LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos LEFT JOIN STK C ON B.MILstk = C.STKcode"
    . " LEFT JOIN DEB ON DEB.DEBcode = A.MIHcus"
    . " WHERE A.MIHstatus = ? AND A.MIHtype = 'IS' AND B.MILcut = -1 AND A.MIHcancel = 0"
    . " AND LOWER(SUBSTRING(TRIM(CONVERT(nvarchar(100), B.MILvCol2)), 1, 1)) IN (" . $colv2 . ")"
    . $cond . " ORDER BY B.MILstk, DEB.DEBcode";
  $st = $db->prepare($sql);
  $st->execute(array($status));
  return $st->fetchAll(PDO::FETCH_ASSOC);
}

// ---------- getFilter 5-param (byRoute) — clone C# ----------
function getRoute($db, $status, $toLoadFilter, $route, $stoSub, $groupsClean, $spGroupSub, $qcGroupSub) {
  $cond = routeIn($route);
  $sql = "SELECT C.STKcode, CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1, CONVERT(nvarchar(50), B.MILsto) AS MILsto,"
    . " CONVERT(nvarchar(255), B.MILvnos) AS MILvnos,"
    . " CONVERT(nvarchar(25), CONVERT(DATE,STR(B.MILday) + '/' + STR(B.MILmonth) + '/' + STR(B.MILyear), 103)) AS MILdate,"
    . " CONVERT(nvarchar(255), DEBnameT) AS DEBnameT, CONVERT(nvarchar(255), DEBcontactT) AS DEBcontactT,"
    . " (B.MILquan / B.MILconv) AS qty, CONVERT(nvarchar(100), B.MILuname) AS MILuname, B.MILquan,"
    . " (SELECT STKsortID FROM BI_CUBE.dbo.STK_Properties WHERE STKcode = C.STKcode) AS STKsortID, CONVERT(nvarchar(100), D.Route) AS Route"
    . " FROM MIH A LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos LEFT JOIN STK C ON B.MILstk = C.STKcode"
    . " LEFT JOIN DEB ON A.MIHcus = DEB.DEBcode LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON B.MILjob = D.JOBcode"
    . " WHERE A.MIHstatus = ? AND A.MIHtype = 'IS' AND B.MILcut = -1 AND A.MIHcancel = 0"
    . " AND C.STKcode NOT IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')"
    . " AND B.MILsto IN " . $stoSub
    . " AND LOWER(SUBSTRING(TRIM(CONVERT(nvarchar(100), B.MILvCol2)), 1, 1)) NOT IN (" . $toLoadFilter . ")"
    . " AND C.STKgroup NOT IN " . $spGroupSub . " AND C.STKgroup NOT IN " . $qcGroupSub . " AND C.STKgroup NOT LIKE '%SP%'"
    . $cond . " ORDER BY C.STKcode, STKsortID";
  $params = array($status);
  foreach ($groupsClean as $g) $params[] = $g;
  $st = $db->prepare($sql);
  $st->execute($params);
  return $st->fetchAll(PDO::FETCH_ASSOC);
}

// ---------- getTotalStk (clone C# — single SQL, GrandTotal + "     " + uname) ----------
function grandTotal($db, $stk, $quan) {
  $quanStr = rtrim(rtrim(number_format((float) $quan, 2, ".", ""), "0"), ".");
  if ($quanStr === "" || $quanStr === "-") $quanStr = "0";
  $sql = "SELECT (CASE WHEN STKconv1 = 1 THEN CONVERT(VARCHAR(255), MILquan)"
    . " ELSE CONVERT(VARCHAR(255), CONVERT(INT, ISNULL(MILquan,0)) / CONVERT(INT, STKconv1)) END) + '/' +"
    . " CONVERT(VARCHAR(255), CONVERT(INT, ISNULL(MILquan,0)) % CONVERT(INT, STKconv1)) [GrandTotal], uname"
    . " FROM (SELECT STKconv1, " . $quanStr . " [MILquan],"
    . " (CASE WHEN STKunit1 = 1 THEN CONVERT(nvarchar(100),STKuname1) WHEN STKunit1 = 2 THEN CONVERT(nvarchar(100),STKuname2)"
    . " WHEN STKunit1 = 3 THEN CONVERT(nvarchar(100),STKuname3) WHEN STKunit1 = 4 THEN CONVERT(nvarchar(100),STKuname4)"
    . " WHEN STKunit1 = 5 THEN CONVERT(nvarchar(100),STKuname5) ELSE '' END) + '/' +"
    . " (CASE WHEN STKunit2 = 1 THEN CONVERT(nvarchar(100),STKuname1) WHEN STKunit2 = 2 THEN CONVERT(nvarchar(100),STKuname2)"
    . " WHEN STKunit2 = 3 THEN CONVERT(nvarchar(100),STKuname3) WHEN STKunit2 = 4 THEN CONVERT(nvarchar(100),STKuname4)"
    . " WHEN STKunit2 = 5 THEN CONVERT(nvarchar(100),STKuname5) ELSE '' END) uname FROM STK WHERE STKcode = ?) GRAND_TOTAL";
  $st = $db->prepare($sql);
  $st->execute(array($stk));
  $r = $st->fetch(PDO::FETCH_ASSOC);
  if (!$r) return array("grand" => $quanStr, "unit" => "");
  // C#: read["GrandTotal"].ToString() + "     " + read["uname"].ToString()  (one cell, colspan 2)
  $grand = (string) $r["GrandTotal"];
  $uname = (string) $r["uname"];
  return array("grand" => $grand, "unit" => $uname);
}

// ---------- rows -> items (group by STKcode, clone C# render loop) ----------
function toItems($db, $rows) {
  $items = array();
  $idx = array();
  foreach ($rows as $r) {
    $stk = (string) $r["STKcode"];
    if (!isset($idx[$stk])) {
      $idx[$stk] = count($items);
      $items[] = array("stk" => $stk, "desc1" => (string) $r["STKdescT1"], "sto" => (string) $r["MILsto"], "grand" => "", "unit" => "", "rows" => array(), "_quan" => 0);
    }
    $i = $idx[$stk];
    $items[$i]["_quan"] += (float) $r["MILquan"];
    $qty = is_numeric($r["qty"]) ? rtrim(rtrim(number_format((float) $r["qty"], 2, ".", ","), "0"), ".") : (string) $r["qty"];
    $items[$i]["rows"][] = array(
      "name" => (string) $r["DEBnameT"],
      "contact" => (string) $r["DEBcontactT"],
      "vnos" => (string) $r["MILvnos"],
      "date" => (string) $r["MILdate"],
      "qty" => $qty,
      "unit" => (string) $r["MILuname"]
    );
  }
  foreach ($items as &$it) {
    $g = grandTotal($db, $it["stk"], $it["_quan"]);
    $it["grand"] = $g["grand"];
    $it["unit"] = $g["unit"];
    unset($it["_quan"]);
  }
  unset($it);
  return $items;
}

try {
  $sections = array();
  $total = 0;

  // ---------- tbSP ----------
  $spRows = getSpQc($db, $status, $colv2, $spGroupSub, $qcGroupSub, "sp");
  if (count($spRows) > 0) {
    $items = toItems($db, $spRows);
    $sections[] = array("key" => "sp", "items" => $items);
    $total += count($items);
  }

  // ---------- tbQC ----------
  $qcRows = getSpQc($db, $status, $colv2, $spGroupSub, $qcGroupSub, "qc");
  if (count($qcRows) > 0) {
    $items = toItems($db, $qcRows);
    $sections[] = array("key" => "qc", "items" => $items);
    $total += count($items);
  }

  // ---------- byRoute (route=all → loop dtroute rows 1..n, clone C# — Route1/Route2/M6-M9) ----------
  if ($route === "all") {
    $routes = array("Route1", "Route2", "M6", "M7", "M8", "M9");
  } else {
    $routes = array($route);
  }
  foreach ($routes as $rt) {
    $rows = getRoute($db, $status, $toLoadFilter, $rt, $stoSub, $groupsClean, $spGroupSub, $qcGroupSub);
    if (count($rows) === 0) continue;
    $items = toItems($db, $rows);
    $sections[] = array("key" => "route", "route" => $rt, "items" => $items);
    $total += count($items);
  }

  if ($total === 0) {
    echo json_encode(array("ok" => false, "error" => "ไม่พบข้อมูล"), JSON_UNESCAPED_UNICODE);
    exit;
  }

  echo json_encode(array(
    "ok" => true,
    "count" => $total,
    "machine" => gethostname(),
    "printedAt" => date("Y-m-d H:i:s"),
    "status" => $status,
    "route" => $route,
    "sections" => $sections
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
