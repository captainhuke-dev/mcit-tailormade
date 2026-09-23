<?php
/**
 * P050 — ใบวางบิล — ค้นหารายการ Invoice
 * POST { connectionId, from, to, creator, dept, prefix, status, page, perPage }
 * { ok, total, page, perPage, rows: [ { no, customerCode, customerName, province, contactT, amount, note, printN, cntBill, cntReceipt } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$from = isset($body["from"]) ? trim($body["from"]) : "";
$to = isset($body["to"]) ? trim($body["to"]) : "";
$creator = isset($body["creator"]) ? trim($body["creator"]) : "";
$dept = isset($body["dept"]) ? trim($body["dept"]) : "";
$prefix = isset($body["prefix"]) ? trim($body["prefix"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$page = isset($body["page"]) ? max(1, (int)$body["page"]) : 1;
$perPage = isset($body["perPage"]) ? max(1, (int)$body["perPage"]) : 15;

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($from === "" || $to === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "วันที่เริ่มต้น/สิ้นสุดไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

// UI ส่ง yyyy-mm-dd — ส่งตรง (ISO) — ODBC Driver 18 conversion fail ถ้า d/m/Y
$from103 = $from;
$to103 = $to;

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

// WHERE ฐาน (คงที่เสมอ)
$dc = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103)";
$where = "MIH.MIHtype = 'IS'
  AND MIH.MIHdesc LIKE N'%ส่งสินค้าวางบิล%'
  AND $dc >= ?
  AND $dc <= ?";
$params = [$from103, $to103];

if ($prefix !== "") {
  $where .= " AND MIH.MIHvnos LIKE ?";
  $params[] = $prefix . "%";
}
if ($dept !== "") {
  $where .= " AND MIH.MIHper LIKE ?";
  $params[] = $dept . "%";
}
if ($creator !== "") {
  $where .= " AND MIH.MIHkeyUser LIKE ?";
  $params[] = "%" . $creator . "%";
}
if ($status !== "") {
  $where .= " AND MIH.MIHstatus = ?";
  $params[] = $status;
}

$join = "MIH LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus";

try {
  // total
  $st = $db->prepare("SELECT COUNT(*) AS c FROM $join WHERE $where");
  $st->execute($params);
  $total = (int)$st->fetchColumn();

  // rows (ROW_NUMBER pagination — ORDER BY MIHvnos)
  $st = $db->prepare("SELECT * FROM (
    SELECT
      MIH.MIHvnos,
      MIH.MIHcus,
      DEB.DEBadd3AT,
      DEB.DEBnameE,
      DEB.DEBcontactT,
      MIH.MIHnetSUM,
      MIH.MIHdesc,
      MIH.MIHprintN,
      ( SELECT cntBilling FROM BI_CUBE.dbo.tb_countBilling WHERE vnosID = MIH.MIHvnos ) cntBill,
      ( SELECT cntReceipt FROM BI_CUBE.dbo.tb_countBilling WHERE vnosID = MIH.MIHvnos ) cntReceipt,
      ROW_NUMBER() OVER (ORDER BY MIH.MIHvnos) AS rn
    FROM $join
    WHERE $where
  ) X WHERE X.rn BETWEEN ? AND ? ORDER BY X.rn");
  $params[] = ($page - 1) * $perPage + 1;
  $params[] = $page * $perPage;
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $out[] = [
      "no" => isset($r["MIHvnos"]) ? $r["MIHvnos"] : "",
      "customerCode" => isset($r["MIHcus"]) ? $r["MIHcus"] : "",
      "customerName" => isset($r["DEBnameE"]) ? $r["DEBnameE"] : "",
      "province" => isset($r["DEBadd3AT"]) ? $r["DEBadd3AT"] : "",
      "contactT" => isset($r["DEBcontactT"]) ? $r["DEBcontactT"] : "",
      "amount" => isset($r["MIHnetSUM"]) ? (float)$r["MIHnetSUM"] : 0.0,
      "note" => isset($r["MIHdesc"]) ? $r["MIHdesc"] : "",
      "printN" => isset($r["MIHprintN"]) ? $r["MIHprintN"] : "",
      "cntBill" => isset($r["cntBill"]) && $r["cntBill"] !== null ? (int)$r["cntBill"] : 0,
      "cntReceipt" => isset($r["cntReceipt"]) && $r["cntReceipt"] !== null ? (int)$r["cntReceipt"] : 0
    ];
  }

  echo json_encode(["ok" => true, "total" => $total, "page" => $page, "perPage" => $perPage, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
