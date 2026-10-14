<?php
/**
 * P081 — PickList By Route — สร้างเอกสาร PickList แยกตามสายส่ง (MAC5)
 * clone C# frm_PickListByRouteGUI (CheckListData + getRoute)
 * POST { connectionId, dateFrom, dateTo, status, groups:[...], route }
 * { ok, count, rows: [{route, itemCount, warehouses:[...]}] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$groups = isset($body["groups"]) && is_array($body["groups"]) ? $body["groups"] : array();
$route = isset($body["route"]) ? trim($body["route"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

// ตัดค่าว่างออกจากกลุ่ มคลัง (clone C# — เชื่อมดวยคอมมา)
$groupsClean = array();
foreach ($groups as $g) {
  $g = trim($g);
  if ($g !== "") $groupsClean[] = $g;
}
if (count($groupsClean) === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดยเลือกกลุ่ มคลังสินคา อยางนอย 1 ตัวเลือก"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($dateFrom === "") $dateFrom = date("Y-m-d");
if ($dateTo === "") $dateTo = $dateFrom;

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่ อมตอฐานขอมูลไมสำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // clone C# CheckListData — MIHtype='IS' + MILcut=-1 + กลุ่ มคลังผาน STOgroup + วันที่เอกสาร + Route
  $milDate = "CONVERT(DATE, STR(B.MILday) + '/' + STR(B.MILmonth) + '/' + STR(B.MILyear), 103)";

  $groupPh = array();
  foreach ($groupsClean as $g) $groupPh[] = "?";

  $sql = "SELECT CONVERT(nvarchar(100), ISNULL(D.Route, '-')) AS Route,
          CONVERT(nvarchar(50), ISNULL(B.MILsto, '-')) AS sto,
          COUNT(*) AS itemCount
          FROM MIH A
          LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos
          LEFT JOIN STK C ON B.MILstk = C.STKcode
          LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON B.MILjob = D.JOBcode
          WHERE A.MIHtype = 'IS' AND B.MILcut = -1
          AND B.MILsto IN (SELECT STOcode FROM STO WHERE STOgroup IN (" . implode(",", $groupPh) . ") AND STOlock = 0 AND STOhide = 0)
          AND " . $milDate . " >= ?
          AND " . $milDate . " <= ?
          AND C.STKcode NOT IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')";
  $params = $groupsClean;
  $params[] = $dateFrom;
  $params[] = $dateTo;

  if ($status !== "") {
    $sql .= " AND A.MIHstatus = ?";
    $params[] = $status;
  }
  if ($route !== "" && $route !== "all") {
    $sql .= " AND D.Route = ?";
    $params[] = $route;
  }

  $sql .= " GROUP BY CONVERT(nvarchar(100), ISNULL(D.Route, '-')), CONVERT(nvarchar(50), ISNULL(B.MILsto, '-'))
          ORDER BY CONVERT(nvarchar(100), ISNULL(D.Route, '-')), CONVERT(nvarchar(50), ISNULL(B.MILsto, '-'))";

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // รวมแถวตอ Route → 1 เอกสาร (เลขที่ JS สร้าง PLR{route}-{nnnn})
  $byRoute = array();
  $order = array();
  foreach ($rows as $r) {
    $rt = $r["Route"];
    if (!isset($byRoute[$rt])) {
      $byRoute[$rt] = array("route" => $rt, "itemCount" => 0, "warehouses" => array());
      $order[] = $rt;
    }
    $byRoute[$rt]["itemCount"] += (int) $r["itemCount"];
    if ($r["sto"] !== "-" && !in_array($r["sto"], $byRoute[$rt]["warehouses"], true)) {
      $byRoute[$rt]["warehouses"][] = $r["sto"];
    }
  }
  $out = array();
  foreach ($order as $rt) $out[] = $byRoute[$rt];

  echo json_encode(["ok" => true, "count" => count($out), "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
