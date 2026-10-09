<?php
/**
 * P006 — Print Invoice เช็คคืน — ค้นหา (ปุ่มค้นหา)
 * clone C# MCIT_FrmPrintChqueReturnGUI.cs (MCIT/PrintChqueReturn)
 *
 * POST { connectionId, dateFrom, dateTo, keyFrom, keyTo, prefix, perCode, status, keyUser }
 *   dateFrom / dateTo   = วันที่ invoice (MIHday/month/year) "YYYY-MM-DD"
 *   keyFrom / keyTo     = วันที่สร้างเอกสาร (MIHkeyDate) "YYYY-MM-DD"
 *   prefix              = คำนำหน้าใบสำคัญ (MIHvnos like 'prefix%') — ว่าง = ทั้งหมด
 *   perCode             = รหัสผู้แทน (MIHper like '%..%')
 *   status              = MIHstatus (ต้อง >= 1 — clone C# cb_status)
 *   keyUser             = ผู้สร้างเอกสาร (MIHkeyUser like '%..%')
 * { ok, count, rows: [ { document, customerCode, customerName, area, amount, note, printCount, cnt } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$keyFrom = isset($body["keyFrom"]) ? trim($body["keyFrom"]) : "";
$keyTo = isset($body["keyTo"]) ? trim($body["keyTo"]) : "";
$prefix = isset($body["prefix"]) ? trim($body["prefix"]) : "";
$perCode = isset($body["perCode"]) ? trim($body["perCode"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$keyUser = isset($body["keyUser"]) ? trim($body["keyUser"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($status === "" || !preg_match("/^\d+$/", $status)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "กรุณาเลือก สถานะ Invoice"], JSON_UNESCAPED_UNICODE);
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
  /* clone C# L112-122: MIH LEFT JOIN DEB — MIHtype='IS' + วันที่ invoice + วันที่สร้าง + prefix + per + status + keyUser */
  $sql = "SELECT
\tMIH.MIHvnos,
\tMIH.MIHcus,
\tDEB.DEBadd3AT,
\tDEB.DEBnameT,
\tDEB.DEBnameE,
\tDEB.DEBcontactT,
\tMIH.MIHnetSUM,
\tMIH.MIHdesc,
\tMIHprintN,
\t( SELECT COUNT( MIL.MILlistNo ) FROM MIL WHERE MIL.MILvnos = MIH.MIHvnos ) cnt
\tFROM
\tMIH
\tLEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
\tWHERE
\tMIH.MIHtype = 'IS'";

  $params = [];

  if ($dateFrom !== "") {
    $sql .= "\n\tAND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) >= ?";
    $params[] = $dateFrom;
  }
  if ($dateTo !== "") {
    $sql .= "\n\tAND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) <= ?";
    $params[] = $dateTo;
  }
  if ($keyFrom !== "") {
    $sql .= "\n\tAND CONVERT ( DATE, MIH.MIHkeyDate ) >= ?";
    $params[] = $keyFrom;
  }
  if ($keyTo !== "") {
    $sql .= "\n\tAND CONVERT ( DATE, MIH.MIHkeyDate ) <= ?";
    $params[] = $keyTo;
  }
  if ($prefix !== "") {
    $sql .= "\n\tAND MIH.MIHvnos LIKE ?";
    $params[] = $prefix . "%";
  }
  if ($perCode !== "") {
    $sql .= "\n\tAND MIH.MIHper LIKE ?";
    $params[] = "%" . $perCode . "%";
  }
  $sql .= "\n\tAND MIH.MIHstatus = ?";
  $params[] = (int)$status;
  if ($keyUser !== "") {
    $sql .= "\n\tAND MIH.MIHkeyUser LIKE ?";
    $params[] = "%" . $keyUser . "%";
  }

  $sql .= "\nORDER BY MIH.MIHvnos";

  $stmt = $db->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $invoices = [];
  foreach ($rows as $row) {
    $invoices[] = [
      "document" => isset($row["MIHvnos"]) ? $row["MIHvnos"] : "",
      "customerCode" => isset($row["MIHcus"]) ? $row["MIHcus"] : "",
      "customerName" => isset($row["DEBnameT"]) ? $row["DEBnameT"] : "",
      "area" => isset($row["DEBadd3AT"]) ? $row["DEBadd3AT"] : "",
      "amount" => isset($row["MIHnetSUM"]) ? (float)$row["MIHnetSUM"] : 0,
      "note" => isset($row["MIHdesc"]) ? $row["MIHdesc"] : "",
      "printCount" => isset($row["MIHprintN"]) ? (int)$row["MIHprintN"] : 0,
      "cnt" => isset($row["cnt"]) ? (int)$row["cnt"] : 0,
    ];
  }

  echo json_encode(["ok" => true, "count" => count($invoices), "rows" => $invoices], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "ค้นหาไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
