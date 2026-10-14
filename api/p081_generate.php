<?php
/**
 * P081 — PickList By Route — รายงาน PickList Summary [By Route_TMS] (MAC5)
 * clone C# frm_PickListByRouteGUI (getRoute + dataHeader + dataDetail + sumSTKNEW)
 * POST { connectionId, dateFrom, dateTo, headDate, status, groups:[...], route }
 * { ok, count, machine, printedAt, headDate, status, pages:[{route, items:[...]}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$headDate = isset($body["headDate"]) ? trim($body["headDate"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$groups = isset($body["groups"]) && is_array($body["groups"]) ? $body["groups"] : array();
$route = isset($body["route"]) ? trim($body["route"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

// ตัดค่าว่างออกจากกลุ่ มคลัง (clone C# — IN (SELECT STOcode FROM STO WHERE STOgroup IN (...)))
$groupsClean = array();
foreach ($groups as $g) {
  $g = trim($g);
  if ($g !== "") $groupsClean[] = $g;
}
if (count($groupsClean) === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดยเลือกกลุ่ มคลังสืนคา อยางนอย 1 ตัวเลือก"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($dateFrom === "") $dateFrom = date("Y-m-d");
if ($dateTo === "") $dateTo = $dateFrom;
if ($headDate === "") $headDate = date("Y-m-d");

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่ อมตอฐานขอมูลไมสำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $groupPh = array();
  foreach ($groupsClean as $g) $groupPh[] = "?";
  $stoSub = "(SELECT STOcode FROM STO WHERE STOgroup IN (" . implode(",", $groupPh) . ") AND STOlock=0 AND STOhide=0)";

  // วันที่เอกสาร (C# condition — MILday/MILmonth/MILyear)
  $milDate = "CONVERT(DATE,STR(B.MILday) + '/' + STR(B.MILmonth) + '/' + STR(B.MILyear), 103)";
  $milDatePlain = "CONVERT(DATE,STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear), 103)";

  $baseWhere = " AND B.MILsto IN " . $stoSub
    . " AND " . $milDate . " >= ? AND " . $milDate . " <= ?"
    . " AND C.STKcode NOT IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')";

  $statusFilter = "";
  if ($status !== "") $statusFilter = " AND A.MIHstatus = ?";

  // ---------- getRoute : DISTINCT Route ----------
  $routeWhere = "";
  $routeParams = array();
  if ($route !== "" && $route !== "all") {
    $routeWhere = " WHERE Route = ?";
    $routeParams[] = $route;
  }
  $st = $db->prepare("SELECT DISTINCT CONVERT(nvarchar(100),Route) AS Route FROM BI_CUBE.dbo.JOB_TransportRoute" . $routeWhere . " ORDER BY Route");
  $st->execute($routeParams);
  $routes = array();
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
    if ($r["Route"] !== null && $r["Route"] !== "") $routes[] = $r["Route"];
  }

  $pages = array();
  foreach ($routes as $rt) {
    // ---------- dataHeader : STK x คลัง ตอ Route ----------
    $sql = "SELECT C.STKcode, CONVERT(nvarchar(255), STKdescT1) AS STKdescT1, CONVERT(nvarchar(255), STKdescT2) AS STKdescT2,"
      . " (SELECT SUM(SBLquan) FROM SBL WHERE SBLsto IN " . $stoSub . " AND SBLstk = C.STKcode) AS SBLqty,"
      . " (SELECT SUM(MIL.MILquan) FROM MIH LEFT JOIN MIL ON MIL.MILvnos = MIH.MIHvnos WHERE MIH.MIHvnos LIKE 'RSV%' AND MIH.MIHtype = 'SS'"
      . " AND MIH.MIHcancel = 0 AND MIL.MILstk = C.STKcode GROUP BY MILstk) AS RSVqty,"
      . " CONVERT(nvarchar(50), B.MILsto) AS MILsto, CONVERT(nvarchar(100), D.Route) AS Route,"
      . " (SELECT STKsortID FROM BI_CUBE.dbo.STK_Properties WHERE STKcode = C.STKcode) AS STKsortID"
      . " FROM MIH A LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos LEFT JOIN STK C ON B.MILstk = C.STKcode"
      . " LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON B.MILjob = D.JOBcode"
      . " WHERE A.MIHtype = 'IS' AND B.MILcut = -1" . $statusFilter . $baseWhere . " AND D.Route = ?"
      . " GROUP BY C.STKcode, CONVERT(nvarchar(255), STKdescT1), CONVERT(nvarchar(255), STKdescT2), B.MILsto, C.STKgroup, D.Route"
      . " ORDER BY C.STKgroup, STKsortID";
    $params = $groupsClean;
    if ($status !== "") $params[] = $status;
    foreach ($groupsClean as $g) $params[] = $g;
    $params[] = $dateFrom;
    $params[] = $dateTo;
    $params[] = $rt;
    $st = $db->prepare($sql);
    $st->execute($params);
    $heads = $st->fetchAll(PDO::FETCH_ASSOC);

    if (count($heads) === 0) continue;

    // ---------- dataDetail : รายละเอยด (DEB name/contact, vnos, date, qty, unit) ----------
    $stks = array();
    foreach ($heads as $h) {
      if (!in_array($h["STKcode"], $stks, true)) $stks[] = $h["STKcode"];
    }
    $stkPh = array();
    foreach ($stks as $s) $stkPh[] = "?";

    $sqlD = "SELECT MIL.MILstk, CONVERT(nvarchar(255), DEBnameT) AS DEBnameT, CONVERT(nvarchar(255), DEBcontactT) AS DEBcontactT,"
      . " CONVERT(nvarchar(255), MILvnos) AS MILvnos,"
      . " CONVERT(nvarchar(25), CONVERT(DATE,STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear), 103)) AS MILdate,"
      . " (MILquan / MILconv) AS qty, CONVERT(nvarchar(50), MIL.MILuname) AS MILuname, CONVERT(nvarchar(50), MIL.MILsto) AS MILsto"
      . " FROM MIL LEFT JOIN STO ON STO.STOcode = MIL.MILsto LEFT JOIN DEB ON DEB.DEBcode = MIL.MILcus"
      . " LEFT JOIN MIH ON MIH.MIHvnos = MIL.MILvnos LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON MIL.MILjob = D.JOBcode"
      . " WHERE MIH.MIHtype = 'IS' AND MIL.MILcut = -1"
      . ($status !== "" ? " AND MIH.MIHstatus = ?" : "")
      . " AND D.Route = ? AND MIL.MILstk IN (" . implode(",", $stkPh) . ")"
      . " AND MIL.MILsto IN " . $stoSub . " AND " . $milDatePlain . " >= ? AND " . $milDatePlain . " <= ?"
      . " ORDER BY MIL.MILstk, MIL.MILvnos";
    $paramsD = array();
    if ($status !== "") $paramsD[] = $status;
    $paramsD[] = $rt;
    foreach ($stks as $s) $paramsD[] = $s;
    foreach ($groupsClean as $g) $paramsD[] = $g;
    $paramsD[] = $dateFrom;
    $paramsD[] = $dateTo;
    $st = $db->prepare($sqlD);
    $st->execute($paramsD);
    $details = $st->fetchAll(PDO::FETCH_ASSOC);

    // ---------- sumSTKNEW : GrandTotal (qty/conv + '/' + remainder) ----------
    $grandCache = array();
    foreach ($heads as $h) {
      $stkCode = $h["STKcode"];
      if (isset($grandCache[$stkCode])) continue;
      $sqlG = "SELECT (CASE WHEN STKconv1 = 1 THEN CONVERT(nvarchar(255), MILquan)"
        . " ELSE CONVERT(nvarchar(255), CONVERT(INT, ISNULL(MILquan, 0)) / CONVERT(INT, STKconv1)) END)"
        . " + '/' + CONVERT(nvarchar(255), CONVERT(INT, ISNULL(MILquan, 0)) % CONVERT(INT, STKconv1)) AS GrandTotal"
        . " FROM ( SELECT STKconv1, SUM(MILquan) AS MILquan FROM MIL"
        . " LEFT JOIN MIH ON MIH.MIHvnos = MIL.MILvnos LEFT JOIN STK ON STK.STKcode = MIL.MILstk"
        . " LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON MIL.MILjob = D.JOBcode"
        . " WHERE MIL.MILtype = 'IS' AND MIL.MILcut = -1"
        . ($status !== "" ? " AND MIH.MIHstatus = ?" : "")
        . " AND D.Route = ? AND MIL.MILstk = ? AND " . $milDatePlain . " >= ? AND " . $milDatePlain . " <= ?"
        . " GROUP BY STKconv1 ) GRAND_TOTAL";
      $paramsG = array();
      if ($status !== "") $paramsG[] = $status;
      $paramsG[] = $rt;
      $paramsG[] = $stkCode;
      $paramsG[] = $dateFrom;
      $paramsG[] = $dateTo;
      $stg = $db->prepare($sqlG);
      $stg->execute($paramsG);
      $gRow = $stg->fetch(PDO::FETCH_ASSOC);
      $grandCache[$stkCode] = ($gRow && $gRow["GrandTotal"] !== null && $gRow["GrandTotal"] !== "") ? $gRow["GrandTotal"] : "0";
    }

    // ---------- ประกอบ items (STK+คลัง) + rows ----------
    $items = array();
    foreach ($heads as $h) {
      $rows = array();
      foreach ($details as $d) {
        if ($d["MILstk"] === $h["STKcode"] && $d["MILsto"] === $h["MILsto"]) {
          $qty = is_numeric($d["qty"]) ? number_format((float) $d["qty"], 2, ".", ",") : $d["qty"];
          $rows[] = array(
            "cusName" => $d["DEBnameT"],
            "contact" => $d["DEBcontactT"],
            "vnos" => $d["MILvnos"],
            "date" => $d["MILdate"],
            "qty" => $qty,
            "unit" => $d["MILuname"]
          );
        }
      }
      // คงเหลือ = SBL + RSV (clone C#)
      $remain = $h["SBLqty"] !== null && $h["SBLqty"] !== "" ? (float) $h["SBLqty"] : 0;
      if ($h["RSVqty"] !== null && $h["RSVqty"] !== "") $remain += (float) $h["RSVqty"];
      $items[] = array(
        "stk" => $h["STKcode"],
        "sto" => $h["MILsto"],
        "desc1" => $h["STKdescT1"],
        "desc2" => $h["STKdescT2"],
        "grand" => $grandCache[$h["STKcode"]],
        "remaining" => rtrim(rtrim(number_format($remain, 2, ".", ","), "0"), "."),
        "rows" => $rows
      );
    }

    $pages[] = array("route" => $rt, "items" => $items);
  }

  echo json_encode(array(
    "ok" => true,
    "count" => count($pages),
    "machine" => gethostname(),
    "printedAt" => date("Y-m-d H:i:s"),
    "headDate" => $headDate,
    "status" => $status,
    "pages" => $pages
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
