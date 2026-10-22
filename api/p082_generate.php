<?php
/**
 * P082 - generate button -> 3-section A4 report (Zone SparePart / Zone QC / Zone 01)
 * clone C# frm_PickListToPack (getFilter 4-param sp/qc/"" + getTotalStk, A4 20/20/30/30)
 * POST { connectionId, status }
 * { ok, count, machine, printedAt, status,
 *   sections:[{key:"sp"|"qc"|"z01", items:[{stk,desc1,sto,grand,unit,rows:[{name,contact,vnos,date,qty,unit}]}]}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
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
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ:  " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

// ---------- constants (clone C# frm_PickListToPack) ----------
$colv2 = "'a','b','c','d','e','f','g','h','i','j','k'";
$spGroupSub = "(SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupSparepart] WHERE STGstatus = 'Active')";
$qcGroupSub = "(SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active')";

// ---------- getFilter 4-param (sp/qc/zone01) — clone C# ----------
function getPackFilter($db, $status, $colv2, $spGroupSub, $qcGroupSub, $filter) {
  $cond = "";
  if ($filter === "sp") $cond = " AND (C.STKgroup IN " . $spGroupSub . " OR C.STKgroup LIKE '%SP%')";
  if ($filter === "qc") $cond = " AND C.STKgroup IN " . $qcGroupSub;
  if ($filter === "z01") $cond = " AND C.STKgroup NOT IN (" . $spGroupSub . " UNION ALL " . $qcGroupSub . ") AND C.STKgroup NOT LIKE '%SP%'";
  $sql = "SELECT B.MILstk AS STKcode, C.STKgroup, CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1,"
    . " B.MILvnos, CONVERT(nvarchar(50), B.MILsto) AS MILsto, DEB.DEBcode, CONVERT(nvarchar(255), DEBnameT) AS DEBnameT,"
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

// ---------- getTotalStk (clone C# — GrandTotal + "     " + uname) ----------
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
  return array("grand" => (string) $r["GrandTotal"], "unit" => (string) $r["uname"]);
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
    $row = array(
      "name" => (string) $r["DEBnameT"],
      "contact" => (string) $r["DEBcontactT"],
      "vnos" => (string) $r["MILvnos"],
      "date" => (string) $r["MILdate"],
      "qty" => $qty,
      "unit" => (string) $r["MILuname"]
    );
    $items[$i]["rows"][] = $row;
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

  // ---------- tbSP (page 1) ----------
  $spRows = getPackFilter($db, $status, $colv2, $spGroupSub, $qcGroupSub, "sp");
  if (count($spRows) > 0) {
    $items = toItems($db, $spRows);
    $sections[] = array("key" => "sp", "items" => $items);
    $total += count($items);
  }

  // ---------- tbQC (page 2) ----------
  $qcRows = getPackFilter($db, $status, $colv2, $spGroupSub, $qcGroupSub, "qc");
  if (count($qcRows) > 0) {
    $items = toItems($db, $qcRows);
    $sections[] = array("key" => "qc", "items" => $items);
    $total += count($items);
  }

  // ---------- tbNotAll / Zone 01 (page 3) ----------
  $zRows = getPackFilter($db, $status, $colv2, $spGroupSub, $qcGroupSub, "z01");
  if (count($zRows) > 0) {
    $items = toItems($db, $zRows);
    $sections[] = array("key" => "z01", "items" => $items);
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
    "sections" => $sections
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
