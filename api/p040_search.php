<?php
/**
 * P040 — ตรวจสอบค้างส่งสินค้า LOT: ค้นหาหลัก
 * SQL คัดออกจาก C# FrmCheckCPSproductLotGUI.btn_search_Click
 * POST { connectionId, groups:[...], receipt:"received|pending|all" }
 * คืนค่า { ok, count, rows:[{id, document, sequence, productCode, group, name, ordered, received, pending, unit}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$groups = (isset($body["groups"]) && is_array($body["groups"])) ? $body["groups"] : array();
$receipt = isset($body["receipt"]) ? $body["receipt"] : "all";

if (count($groups) === 0) {
  echo json_encode(array("ok" => false, "error" => "กรุณาเลือกกลุ่มสินค้า"), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // เงื่อนไขสถานะตาม C#: rdo_done -> unit - unit2 = 0, rdo_undone -> unit - unit2 > 0, rdo_NoFilter -> ไม่มี
  $cond = "";
  if ($receipt === "received") {
    $cond = " WHERE tableA.unit - tableA.unit2 = 0";
  } elseif ($receipt === "pending") {
    $cond = " WHERE tableA.unit - tableA.unit2 > 0";
  }

  // กลุ่มที่เลือก -> IN ('g1','g2',...)
  $in = array();
  foreach ($groups as $g) {
    $in[] = "'" . str_replace("'", "''", (string)$g) . "'";
  }

  // SQL ตาม C# btn_search_Click — CPS LEFT JOIN STK + MIL, subquery จำนวนรับ (MIL type IS ไม่ใช่ RSV)
  $sql = "SELECT *, (tableA.unit - tableA.unit2) AS sumUnit FROM (" .
    "SELECT CPS.CPSvnosID, CPS.CPSlistNo, CPS.CPSstkID," .
    " STK.STKgroup, STK.STKdescT1, MIL.MILuname," .
    " (CPS.CPSstkREQ / MIL.MILconv) AS [unit]," .
    " (SELECT COUNT(*) FROM MIS JOIN (SELECT MILvnos, MILstk, MILlistNo FROM MIL" .
    " WHERE MILlinkVCno = CPS.CPSvnosID AND MILstk = CPS.CPSstkID AND MILtype = 'IS' AND MILvnos NOT LIKE 'RSV%') B" .
    " ON B.MILvnos = MIS.MISvnos AND B.MILstk = MIS.MISstk AND B.MILlistNo = MIS.MISline) AS [unit2]" .
    " FROM CPS" .
    " LEFT JOIN STK ON STK.STKcode = CPS.CPSstkID" .
    " LEFT JOIN MIL ON MIL.MILvnos = CPS.CPSvnosID AND MIL.MILstk = CPS.CPSstkID AND MIL.MILlistNo = CPS.CPSlistNo" .
    " WHERE CPS.CPSclearALL = 0 AND LEFT(STK.STKgroup,4) IN (" . implode(",", $in) . ")) AS tableA" .
    $cond;

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // สอร์ตใน PHP (SQL Server+ODBC หมดเร็วเมื่อ ORDER BY ใน derived table) — เรียงตาม CPSvnosID, CPSlistNo
  usort($rows, function ($a, $b) {
    $c = strcmp((string)$a["CPSvnosID"], (string)$b["CPSvnosID"]);
    if ($c !== 0) return $c;
    return (int)$a["CPSlistNo"] - (int)$b["CPSlistNo"];
  });

  $out = array();
  $i = 0;
  foreach ($rows as $r) {
    $unit = $r["unit"] === null ? 0 : (float)$r["unit"];
    $unit2 = $r["unit2"] === null ? 0 : (int)$r["unit2"];
    $out[] = array(
      "id" => ++$i,
      "document" => (string)$r["CPSvnosID"],
      "sequence" => (int)$r["CPSlistNo"],
      "productCode" => (string)$r["CPSstkID"],
      "group" => $r["STKgroup"] === null ? "" : (string)$r["STKgroup"],
      "name" => $r["STKdescT1"] === null ? "" : (string)$r["STKdescT1"],
      "ordered" => $unit,
      "received" => $unit2,
      "pending" => $unit - $unit2,
      "unit" => $r["MILuname"] === null ? "" : (string)$r["MILuname"]
    );
  }

  echo json_encode(array(
    "ok" => true,
    "count" => count($out),
    "rows" => $out
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
