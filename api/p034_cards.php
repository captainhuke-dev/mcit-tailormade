<?php
/**
 * P034 — ประวัติทางการเงินลูกหนี้ — สรุป cards
 * POST { connectionId, code }
 * { ok, cards: { soTotal, invTotal, dueTotal, bouncedCheck } }
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
  // ยอด SO
  $st = $db->prepare("SELECT SUM
	( CPSsumREQ - CPSsumCUT1 ) AS result_SO
	FROM
	CPS 
	WHERE
	CPScusID = ?
	AND CPSsumREQ > CPSsumCUT1 
	AND CPSclearALL = '0'");
  $st->execute([$code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);
  $soTotal = $r && isset($r["result_SO"]) ? (float)$r["result_SO"] : 0.0;

  // ยอด INV
  $st = $db->prepare("SELECT
    X.sumCPS + Y.balance AS result
FROM
(
    SELECT COALESCE(SUM(CFSsumREQ - CFSsumCUT1), 0) AS sumCPS
    FROM dbo.CFS
    WHERE CFScusID = ?
      AND CFSclearALL = 0
) AS X
CROSS JOIN
(
    SELECT COALESCE(
        SUM(
            CASE
                WHEN CDCnetSUM > 0 THEN CDCnetSUM * -1
                ELSE CDCnetSUM
            END
        ), 0
    ) AS balance
    FROM dbo.CDC
    WHERE CDCtypeID IN ('AS', 'BS')
      AND CDCcancel = 0
      AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL)
      AND CDCcusID = ?
) AS Y");
  $st->execute([$code, $code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);
  $invTotal = $r && isset($r["result"]) ? (float)$r["result"] : 0.0;

  // ยอด Due
  $st = $db->prepare("SELECT SUM
	( CHQtotal ) AS sumChqDue 
	FROM
	CHQ 
	WHERE
	CHQcus = ?
	AND CHQstatus = 0 
	AND ( CHQstatusN = 1 )");
  $st->execute([$code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);
  $dueTotal = $r && isset($r["sumChqDue"]) ? (float)$r["sumChqDue"] : 0.0;

  // ยอดเช็คคืนค้างชำระ
  $st = $db->prepare("SELECT SUM
	( CFSsumREQ - CFSsumCUT1 ) chq 
	FROM
	[M5CM-AA-01].dbo.CFS 
	WHERE
	CFSclearALL = 0 
	AND CFSvnosID LIKE 'CBA%' 
	AND 
	 CFScusID = ?
GROUP BY
	CFScusID");
  $st->execute([$code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);
  $bouncedCheck = $r && isset($r["chq"]) ? (float)$r["chq"] : 0.0;

  echo json_encode([
    "ok" => true,
    "cards" => [
      "soTotal" => $soTotal,
      "invTotal" => $invTotal,
      "dueTotal" => $dueTotal,
      "bouncedCheck" => $bouncedCheck
    ]
  ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
