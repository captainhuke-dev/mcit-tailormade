<?php
/**
 * P034 — ประวัติทางการเงินลูกหนี้ — รายงานการติดตามทวงหนี้ Odoo
 * POST { connectionId, code }  (connectionId = Odoo 17 — PostgreSQL)
 * { ok, rows: [ { caseNo, caseDate, payDate, amount, note } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$code = isset($body["code"]) ? trim($body["code"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($code === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "รหัสลูกหนี้ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
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
  $st = $db->prepare("SELECT A
	.ID, -- เลขที่ case
	TO_CHAR( A.create_date + INTERVAL '7 Hours', 'YYYY-MM-DD' ) create_date, --วันที่ case
	TO_CHAR( A.date_deadline + INTERVAL '7 Hours', 'YYYY-MM-DD' ) date_deadline, --วันที่นัดชำระ
	A.x_studio_billing_debt, --ยอดเงิน
	A.x_studio_remark_finance --ความคิดเห็น
FROM
	project_task
	A LEFT JOIN res_partner B ON A.partner_id = B.ID 
WHERE
	A.active = TRUE 
	AND A.stage_id != 68 
	AND A.project_id = 4 
	AND B.company_registry = ?
ORDER BY
	A.create_date");
  $st->execute([$code]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // YYYY-MM-DD -> dd/mm/พ.ศ.
  $fmt = function ($iso) {
    if (!$iso) return "";
    $t = strtotime($iso);
    if (!$t) return $iso;
    return date("d/m", $t) . "/" . (date("Y", $t) + 543);
  };

  $out = [];
  foreach ($rows as $r) {
    $note = isset($r["x_studio_remark_finance"]) ? (string)$r["x_studio_remark_finance"] : "";
    $out[] = [
      "caseNo" => isset($r["id"]) ? (string)$r["id"] : (isset($r["ID"]) ? (string)$r["ID"] : ""),
      "caseDate" => $fmt(isset($r["create_date"]) ? $r["create_date"] : ""),
      "payDate" => $fmt(isset($r["date_deadline"]) ? $r["date_deadline"] : ""),
      "amount" => isset($r["x_studio_billing_debt"]) ? (float)$r["x_studio_billing_debt"] : 0.0,
      "note" => $note
    ];
  }

  echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
