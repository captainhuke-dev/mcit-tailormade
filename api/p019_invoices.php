<?php
/**
 * P019 — เช็คสถานะส่ง Invoice — ค้นหา (ปุ่มค้นหา)
 * clone C# frm_CheckStatusInvoiceGUI.cs (AppCheckStatusInvoice)
 *
 * POST { connectionId, dateFrom, dateTo, status }
 *   dateFrom / dateTo = "YYYY-MM-DD"
 *   status = "62,63,65,67,68,70" (รหัส MIHstatus แยก comma — ต้อง >= 1)
 * { ok, rows: [ { date, document, customerCode, customerName, status, employee } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

/* parse รหัสสถานะ "62,63,65" -> [62, 63, 65] */
$statusCodes = [];
if ($status !== "") {
  foreach (explode(",", $status) as $s) {
    $s = trim($s);
    if ($s !== "" && preg_match("/^\d+$/", $s)) {
      $statusCodes[] = (int)$s;
    }
  }
}

if (empty($statusCodes)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "กรุณาเลือก สถานะ อย่างน้อย 1 ค่า"], JSON_UNESCAPED_UNICODE);
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
  /* clone C# L110-115: MIH LEFT JOIN DEB — MIHcancel=0 + MIHtype='IS' + MIHstatus IN (...) + วันที่ range */
  $sql = "SELECT
\tCONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) MIHdate,
\tMIHper,
\tMIHvnos,
\tDEBcode,
\tDEBnameT,
\tMIHstatus
\tFROM
\tMIH
\tLEFT JOIN DEB ON DEB.DEBcode = MIHcus
\tWHERE
\tMIHcancel = 0
\tAND MIHtype = 'IS'
\tAND MIHstatus IN (" . implode(",", array_fill(0, count($statusCodes), "?")) . ")";

  $params = $statusCodes;

  if ($dateFrom !== "") {
    $sql .= "\n\tAND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) >= ?";
    $params[] = $dateFrom;
  }
  if ($dateTo !== "") {
    $sql .= "\n\tAND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) <= ?";
    $params[] = $dateTo;
  }

  $sql .= "\nORDER BY MIHdate";

  $stmt = $db->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $invoices = [];
  foreach ($rows as $row) {
    $invoices[] = [
      "date" => isset($row["MIHdate"]) ? substr($row["MIHdate"], 0, 10) : "",
      "document" => isset($row["MIHvnos"]) ? $row["MIHvnos"] : "",
      "customerCode" => isset($row["DEBcode"]) ? $row["DEBcode"] : "",
      "customerName" => isset($row["DEBnameT"]) ? $row["DEBnameT"] : "",
      "status" => isset($row["MIHstatus"]) ? (string)$row["MIHstatus"] : "",
      "employee" => isset($row["MIHper"]) ? $row["MIHper"] : "",
    ];
  }

  echo json_encode(["ok" => true, "count" => count($invoices), "rows" => $invoices], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "ค้นหาไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
