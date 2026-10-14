<?php
/**
 * P081 — ปุ่ มค้ นหา → ตารางรายการสืนค้ า (flat list)
 * SQL ตามแบบที่ user กำหนด (verbatim) — MIH+MIL+STK+JOB_TransportRoute
 *   + SBLqty / RSVqty subquery + STKsortID + Route
 * POST { connectionId, dateFrom, dateTo, status, groups:[...], route }
 * { ok, count, rows:[{STKcode,STKdescT1,STKdescT2,SBLqty,RSVqty,MILsto,STKgroup,STKsortID,Route}] }
 * PHP 7.3-compatible
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
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้ อผิ ดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

$groupsClean = array();
foreach ($groups as $g) {
  $g = trim($g);
  if ($g !== "") $groupsClean[] = $g;
}
if (count($groupsClean) === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดยเลือกกลุ่ มคลังสืนค้ า อย່ างน้ อย 1 ตั วเลือก"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($dateFrom === "") $dateFrom = date("Y-m-d");
if ($dateTo === "") $dateTo = $dateFrom;

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่ อมตอ่ ฐานข้ อมู ลไม่สำเร้ จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $groupPh = array();
  foreach ($groupsClean as $g) $groupPh[] = "?";
  $inList = implode(",", $groupPh);

  // vandi MILday/MILmonth/MILyear → DATE (style 103 = dd/mm/yyyy)
  $milDate = "CONVERT(DATE,STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear), 103)";

  // -- สถานะใบแจ้ งหนี้ (ถ้ ามี ค่ า)
  $statusCond = $status !== "" ? " AND MIHstatus = ?" : "";

  // -- Route: ถ้ า All ไม่ ต้ องมบี รรทัดน้ ี ไม่ ฉะนั้ นตามที่เลือก
  $routeCond = ($route !== "" && $route !== "all") ? " AND D.Route = ?" : "";

  // SQL ตามแบบ — GROUP BY คอลั่ มดบิ (bare) เพื่ อ scalar subquery อาง C.STKcode ได้;
  // CONVERT nvarchar เฉพาะ col ที่ ตอง sort/group (text col sort ตรง ๆ ไม่ ได้)
  $sql = "SELECT"
    . " C.STKcode,"
    . " CONVERT(nvarchar(255), STKdescT1) AS STKdescT1,"
    . " CONVERT(nvarchar(255), STKdescT2) AS STKdescT2,"
    . " (SELECT SUM(SBLquan) FROM SBL WHERE SBLsto IN"
    . " (SELECT STOcode FROM STO WHERE STOgroup IN ($inList) AND STOlock = 0 AND STOhide = 0)"
    . " AND SBLstk = C.STKcode) AS SBLqty,"
    . " (SELECT SUM(MIL.MILquan) FROM MIH LEFT JOIN MIL ON MIL.MILvnos = MIH.MIHvnos"
    . " WHERE MIH.MIHvnos LIKE 'RSV%' AND MIH.MIHtype = 'SS' AND MIH.MIHcancel = 0"
    . " AND MIL.MILstk = C.STKcode GROUP BY MILstk) AS RSVqty,"
    . " CONVERT(nvarchar(50), B.MILsto) AS MILsto,"
    . " CONVERT(nvarchar(50), C.STKgroup) AS STKgroup,"
    . " (SELECT STKsortID FROM BI_CUBE.dbo.STK_Properties WHERE STKcode = C.STKcode) AS STKsortID,"
    . " CONVERT(nvarchar(100), D.Route) AS Route"
    . " FROM MIH A"
    . " LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos"
    . " LEFT JOIN STK C ON B.MILstk = C.STKcode"
    . " LEFT JOIN BI_CUBE.dbo.[JOB_TransportRoute] D ON B.MILjob = D.JOBcode"
    . " WHERE A.MIHtype = 'IS' AND B.MILcut = -1"
    . $statusCond
    . " AND B.MILsto IN (SELECT STOcode FROM STO WHERE STOgroup IN ($inList) AND STOlock = 0 AND STOhide = 0)"
    . " AND C.STKcode NOT IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')"
    . " AND $milDate >= ? AND $milDate <= ?"
    . $routeCond
    . " GROUP BY STKcode, CONVERT(nvarchar(255), STKdescT1), CONVERT(nvarchar(255), STKdescT2),"
    . " B.MILsto, C.STKgroup, D.Route"
    . " ORDER BY C.STKgroup, STKsortID";

  // param order = ลำดบั ที่ ปรากฏใน SQL: SBL-inList, status, sto-inList, dates, route
  $params = $groupsClean;
  if ($status !== "") $params[] = $status;
  foreach ($groupsClean as $g) $params[] = $g;
  $params[] = $dateFrom;
  $params[] = $dateTo;
  if ($route !== "" && $route !== "all") $params[] = $route;

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode(array(
    "ok" => true,
    "count" => count($rows),
    "rows" => $rows
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
