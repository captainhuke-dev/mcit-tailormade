<?php
/**
 * P039 — ตรวจสอบตัดของเกิน SO (MAC5)
 * clone C# FrmCheckCutSOGUI.cs — 3 modes (product/amount/complete)
 * POST { connectionId, mode, from, to }
 * { ok, count, rows: [{listNo, vnos, date, cus, cusName, stk, stkName, sumREQ, sumCUT, stkREQ, stkCUT}] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$mode = isset($body["mode"]) ? trim($body["mode"]) : "";
$from = isset($body["from"]) ? trim($body["from"]) : "";
$to = isset($body["to"]) ? trim($body["to"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}
if (!in_array($mode, array("product", "amount", "complete"), true)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "mode เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}
if ($from === "" || $to === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "ช่วงวันที่เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
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
  // clone C# — 3 modes (WHERE แยกตามปุ่ม) + CPS LEFT JOIN DEB/STK + date range + ORDER BY CPSvnosID,CPSlistNo
  $sql = "SELECT CPSlistNo, CPSvnosID, CPSdateID, CPScusID, DEBnameT, CPSstkID, STKdescT1, CPSsumREQ, CPSsumCUT1, CPSstkREQ, CPSstkCUT1
          FROM CPS
          LEFT JOIN DEB ON DEBcode = CPScusID
          LEFT JOIN STK ON STKcode = CPSstkID
          WHERE ";
  if ($mode === "product") {
    // btn_search — ตรวจสอบจากสินค้า
    $sql .= "(CPSstkCUT1 - CPSstkREQ) > 0 AND CPSclearUSER = 0 AND CPSclearALL = 0";
  } elseif ($mode === "amount") {
    // btn_searchAmount — ตรวจสอบจากยอดเงิน
    $sql .= "(CPSsumREQ - CPSsumCUT1) > 0 AND CPSclearUSER = 0 AND CPSclearALL = 0 AND (CPSstkCUT1 - CPSstkREQ) = 0 AND STKgroup != 'SV'";
  } else {
    // button1 — ตรวจสอบสินค้าส่งครบแต่ค้างส่ง
    $sql .= "CPSstkCUT1 = CPSstkREQ AND CPSclearALL = 0 AND CPSclearUSER = 0 AND STKgroup != 'SV'";
  }
  $sql .= " AND CPSdateID >= ? AND CPSdateID <= ?
          ORDER BY CPSvnosID, CPSlistNo";
  $st = $db->prepare($sql);
  $st->execute([$from, $to]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = [
      "listNo" => $r["CPSlistNo"],
      "vnos" => $r["CPSvnosID"],
      "date" => $r["CPSdateID"],
      "cus" => $r["CPScusID"],
      "cusName" => $r["DEBnameT"],
      "stk" => $r["CPSstkID"],
      "stkName" => $r["STKdescT1"],
      "sumREQ" => $r["CPSsumREQ"],
      "sumCUT" => $r["CPSsumCUT1"],
      "stkREQ" => $r["CPSstkREQ"],
      "stkCUT" => $r["CPSstkCUT1"]
    ];
  }
  echo json_encode(["ok" => true, "count" => count($out), "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
