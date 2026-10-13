<?php
/**
 * P045 — ตรวจสอบบิลลูกค้าเดียวกัน (MAC5)
 * clone demo/P045-demo.html — ลูกค้าที่มีบิลซ้ำในวันเดียวกัน (MIHtype='IS' + HAVING COUNT(MIHvnos) > 1)
 * POST { connectionId, date, cus }
 * { ok, count, rows: [{date, cus, cusName, district, vnosCount}] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$date = isset($body["date"]) ? trim($body["date"]) : "";
$cus = isset($body["cus"]) ? trim($body["cus"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}
if ($date === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "วันที่เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
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
  // ลูกค้าที่มีบิล (MIHtype='IS') ซ้ำในวันเดียวกัน — group by ลูกค้า + HAVING COUNT > 1
  // DEBadd3AT / DEBnameT เป็น text → ต้อง CONVERT nvarchar ก่อน group/sort
  $sql = "SELECT CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) AS MIHdate,
          MIH.MIHcus, CONVERT(nvarchar(255), DEB.DEBnameT) AS DEBnameT, CONVERT(nvarchar(100), DEB.DEBadd3AT) AS DEBadd3AT, COUNT(MIH.MIHvnos) AS vnosCount
          FROM MIH
          LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
          WHERE MIH.MIHtype = 'IS'
          AND CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) = ?";
  $params = array($date);
  if ($cus !== "") {
    $sql .= " AND MIH.MIHcus LIKE ?";
    $params[] = "%" . $cus . "%";
  }
  $sql .= " GROUP BY CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103),
          MIH.MIHcus, CONVERT(nvarchar(255), DEB.DEBnameT), CONVERT(nvarchar(100), DEB.DEBadd3AT)
          HAVING COUNT(MIH.MIHvnos) > 1
          ORDER BY MIH.MIHcus";
  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = [
      "date" => $r["MIHdate"],
      "cus" => $r["MIHcus"],
      "cusName" => $r["DEBnameT"],
      "district" => $r["DEBadd3AT"],
      "vnosCount" => (int) $r["vnosCount"]
    ];
  }
  echo json_encode(["ok" => true, "count" => count($out), "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
