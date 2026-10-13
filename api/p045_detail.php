<?php
/**
 * P045 — รายละเอียดลูกค้า (MAC5) — modal view detail
 * clone C# AppForCheck/frm_CheckBillMorethanOne_GUI.cs — GetVnos + GetListSTK
 * POST { connectionId, date, cus }
 * { ok, count, bills: [ { vnos, date, status, items: [ { listNo, stk, desc, qty, unit } ] } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$date = isset($body["date"]) ? trim($body["date"]) : "";
$cus = isset($body["cus"]) ? trim($body["cus"]) : "";

if ($connectionId === "" || $date === "" || $cus === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "ค่าไม่ครบถ้วน"], JSON_UNESCAPED_UNICODE);
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
  // GetVnos — บิลของลูกค้าในวันนั้น (clone C# — MIHtype='IS' + MIHcancel=0)
  $sql = "SELECT CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) AS dateID,
          MIH.MIHvnos, MIH.MIHstatus
          FROM MIH
          WHERE MIH.MIHtype = 'IS' AND MIH.MIHcancel = 0 AND MIH.MIHcus = ?
          AND CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) = ?
          ORDER BY MIH.MIHvnos";
  $st = $db->prepare($sql);
  $st->execute(array($cus, $date));
  $vnosRows = $st->fetchAll(PDO::FETCH_ASSOC);

  // GetListSTK — สินค้าต่อใบ (clone C# — MILtype='IS' + MILquan/MILconv)
  $sqlItem = "SELECT MIL.MILlistNo, MIL.MILstk, CONVERT(nvarchar(255), MIL.MILdesc) AS MILdesc,
          (MIL.MILquan / MIL.MILconv) AS qty, MIL.MILuname
          FROM MIL
          WHERE MIL.MILvnos = ? AND MIL.MILtype = 'IS'
          ORDER BY MIL.MILlistNo";
  $stItem = $db->prepare($sqlItem);

  $bills = [];
  foreach ($vnosRows as $v) {
    $stItem->execute(array($v["MIHvnos"]));
    $items = [];
    foreach ($stItem->fetchAll(PDO::FETCH_ASSOC) as $i) {
      $items[] = [
        "listNo" => $i["MILlistNo"],
        "stk" => $i["MILstk"],
        "desc" => $i["MILdesc"],
        "qty" => (float) $i["qty"],
        "unit" => $i["MILuname"]
      ];
    }
    $bills[] = [
      "vnos" => $v["MIHvnos"],
      "date" => $v["dateID"],
      "status" => $v["MIHstatus"] === null ? "" : (string) $v["MIHstatus"],
      "items" => $items
    ];
  }
  echo json_encode(["ok" => true, "count" => count($bills), "bills" => $bills], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
