<?php
/**
 * P080 — PickList QC — รายงาน (MAC5)
 * clone C# AppPackingListBucketParts/FrmPackingListBatteryGUI:
 *   groupSpare + dataHeader + groupDesc + dataDetail + sumSTk
 * POST { connectionId, status, headDate }
 * { ok, count, machine, printedAt, headDate, status,
 *   groups:[{code, label, items:[...]}],  // รายงาน "Pick List QC" (หัวกลุ่ม)
 *   items:[...],                          // รายงาน "Packing List ช่าง" (flat)
 *   barcodes:[stkcode] }                  // หน้า barcode
 * item = { stk, desc1, desc2, grand, remaining, rows:[{cusName,contact,vnos,date,qty,unit}] }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$headDate = isset($body["headDate"]) ? trim($body["headDate"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($status === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดยเลือกสถานะใบแจ้งหนี้"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($headDate === "") $headDate = date("Y-m-d");

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมตอฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // ---------- groupSpare : กลุ่ม battery Active ----------
  $st = $db->query("SELECT STGcode FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGstatus = 'Active'");
  $grp = array();
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
    if ($r["STGcode"] !== null && $r["STGcode"] !== "") $grp[] = $r["STGcode"];
  }
  if (count($grp) === 0) {
    echo json_encode(array(
      "ok" => true, "count" => 0,
      "machine" => gethostname(), "printedAt" => date("Y-m-d H:i:s"),
      "headDate" => $headDate, "status" => $status,
      "groups" => array(), "items" => array(), "barcodes" => array()
    ), JSON_UNESCAPED_UNICODE);
    exit;
  }
  $grpPh = array();
  foreach ($grp as $g) $grpPh[] = "?";
  $grpIn = implode(",", $grpPh);

  // ---------- dataHeader (SQL ตามแบบ — หนึ่ง query) ----------
  $sql = "SELECT"
    . " B.MILstk AS STKcode,"
    . " C.STKgroup,"
    . " CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1,"
    . " CONVERT(VARCHAR(255), C.STKdescT2) AS STKdescT2,"
    . " (SELECT SUM(SBLquan) FROM SBL WHERE SBLsto IN ('01','03','04') AND SBLstk = B.MILstk) AS SBLqty"
    . " FROM MIH A"
    . " LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos"
    . " LEFT JOIN STK C ON B.MILstk = C.STKcode"
    . " WHERE A.MIHstatus = ?"
    . " AND A.MIHtype = 'IS'"
    . " AND B.MILsto = '01'"
    . " AND B.MILcut = -1"
    . " AND C.STKgroup IN (" . $grpIn . ")"
    . " GROUP BY B.MILstk, C.STKgroup, CONVERT(VARCHAR(255), C.STKdescT1), CONVERT(VARCHAR(255), C.STKdescT2)"
    . " ORDER BY B.MILstk";

  $params = array($status);
  foreach ($grp as $g) $params[] = $g;
  $st = $db->prepare($sql);
  $st->execute($params);
  $heads = $st->fetchAll(PDO::FETCH_ASSOC);

  if (count($heads) === 0) {
    echo json_encode(array(
      "ok" => true, "count" => 0,
      "machine" => gethostname(), "printedAt" => date("Y-m-d H:i:s"),
      "headDate" => $headDate, "status" => $status,
      "groups" => array(), "items" => array(), "barcodes" => array()
    ), JSON_UNESCAPED_UNICODE);
    exit;
  }

  // ---------- dataDetail : รายละเอียดตาม STKcode (หนึ่ง query — IN) ----------
  $stks = array();
  foreach ($heads as $h) {
    if (!in_array($h["STKcode"], $stks, true)) $stks[] = $h["STKcode"];
  }
  $stkPh = array();
  foreach ($stks as $s) $stkPh[] = "?";

  $sqlD = "SELECT MIL.MILstk,"
    . " CONVERT(VARCHAR(255), DEBnameT) AS DEBnameT,"
    . " CONVERT(VARCHAR(255), DEBcontactT) AS DEBcontactT,"
    . " CONVERT(VARCHAR(255), MILvnos) AS MILvnos,"
    . " CONVERT(VARCHAR(25), CONVERT(DATE, STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear), 103)) AS MILdate,"
    . " MILquan AS qty,"
    . " STK.STKuname1 AS MILuname"
    . " FROM MIL"
    . " LEFT JOIN STK ON STK.STKcode = MIL.MILstk"
    . " LEFT JOIN DEB ON DEB.DEBcode = MIL.MILcus"
    . " LEFT JOIN MIH ON MIH.MIHvnos = MIL.MILvnos"
    . " WHERE MIH.MIHstatus = ? AND MIL.MILtype = 'IS' AND MIL.MILcut = -1"
    . " AND MIL.MILsto = '01' AND MIL.MILstk IN (" . implode(",", $stkPh) . ")";
  $paramsD = array($status);
  foreach ($stks as $s) $paramsD[] = $s;
  $st = $db->prepare($sqlD);
  $st->execute($paramsD);
  $details = $st->fetchAll(PDO::FETCH_ASSOC);

  // ---------- sumSTk : SUM(MILquan) ตาม STKcode (หนึ่ง query — IN) ----------
  $sqlS = "SELECT MILstk, SUM(MILquan) AS sumqty"
    . " FROM MIL"
    . " LEFT JOIN MIH ON MIH.MIHvnos = MIL.MILvnos"
    . " WHERE MIH.MIHstatus = ? AND MIL.MILtype = 'IS' AND MIL.MILcut = -1"
    . " AND MILstk IN (" . implode(",", $stkPh) . ")"
    . " GROUP BY MILstk";
  $paramsS = array($status);
  foreach ($stks as $s) $paramsS[] = $s;
  $st = $db->prepare($sqlS);
  $st->execute($paramsS);
  $sums = array();
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
    $sums[$r["MILstk"]] = $r["sumqty"];
  }

  // ---------- groupDesc : "กลุ่มสินค้า XXX : คำอธิบาย" ----------
  $groupOrder = array();
  foreach ($heads as $h) {
    $c = (string) $h["STKgroup"];
    if (!in_array($c, $groupOrder, true)) $groupOrder[] = $c;
  }
  $st = $db->prepare("SELECT STGcode, STGdescT FROM STG WHERE STGcode = ?");
  $groupLabels = array();
  foreach ($groupOrder as $c) {
    $st->execute(array($c));
    $g = $st->fetch(PDO::FETCH_ASSOC);
    $groupLabels[$c] = ($g && $g["STGdescT"] !== null) ? "กลุ่มสืนค้า " . $g["STGcode"] . " : " . $g["STGdescT"] : "";
  }

  // ---------- ประกอบ items ----------
  $detailMap = array();
  foreach ($details as $d) {
    if (!isset($detailMap[$d["MILstk"]])) $detailMap[$d["MILstk"]] = array();
    $detailMap[$d["MILstk"]][] = $d;
  }

  $items = array();
  foreach ($heads as $h) {
    $stkCode = $h["STKcode"];
    $rows = array();
    if (isset($detailMap[$stkCode])) {
      foreach ($detailMap[$stkCode] as $d) {
        $rows[] = array(
          "cusName" => $d["DEBnameT"],
          "contact" => $d["DEBcontactT"],
          "vnos" => $d["MILvnos"],
          "date" => $d["MILdate"],
          "qty" => $d["qty"],
          "unit" => $d["MILuname"]
        );
      }
    }
    $remain = $h["SBLqty"] !== null && $h["SBLqty"] !== "" ? (float) $h["SBLqty"] : 0;
    $items[] = array(
      "stk" => $stkCode,
      "group" => (string) $h["STKgroup"],
      "desc1" => $h["STKdescT1"],
      "desc2" => $h["STKdescT2"],
      "grand" => isset($sums[$stkCode]) && $sums[$stkCode] !== null ? $sums[$stkCode] : "0",
      "remaining" => rtrim(rtrim(number_format($remain, 2, ".", ","), "0"), "."),
      "rows" => $rows
    );
  }

  // groups (ตามลำดับ first-appearance)
  $groups = array();
  foreach ($groupOrder as $c) {
    $gItems = array();
    foreach ($items as $it) {
      if ($it["group"] === $c) $gItems[] = $it;
    }
    $groups[] = array(
      "code" => $c,
      "label" => $groupLabels[$c],
      "items" => $gItems
    );
  }

  // barcodes = STKcode (ตามลำดับ)
  $barcodes = array();
  foreach ($items as $it) $barcodes[] = $it["stk"];

  echo json_encode(array(
    "ok" => true,
    "count" => count($items),
    "machine" => gethostname(),
    "printedAt" => date("Y-m-d H:i:s"),
    "headDate" => $headDate,
    "status" => $status,
    "groups" => $groups,
    "items" => $items,
    "barcodes" => $barcodes
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
