<?php
/**
 * P034 — ประวัติทางการเงินลูกหนี้ — รายการเช็ครอผ่าน
 * POST { connectionId, code }
 * { ok, rows: [ { no, cdate, bank, rdate, status, avg, amount, action } ] }
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
  // Step 1 — คำนวณ @D1/@D2/@D3
  $st = $db->prepare("SELECT COUNT(CHQno) AS c FROM CHQ WHERE CHQstatus = 1 AND CHQdateC >= DATEADD(MONTH, -6, GETDATE()) AND CHQcus = ?");
  $st->execute([$code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);
  $d1 = $r && isset($r["c"]) ? (int)$r["c"] : 0;
  $d2 = $d1 < 6 ? 36 : 6;
  $d3 = $d1 < 6 ? 6 : 12;

  // Step 2 — UNION 3 CTE (D2/D3 เป็น int ที่คำนวณแล้ว ปลอดภัย)
  $st = $db->prepare("
;WITH Paid AS
(
    SELECT TOP ($d3)
        CHQcus,
        CHQno,
        CAST(CHQdateC AS DATE) AS CHQdateC,
        CHQbank,
        CAST(CHQdateR AS DATE) AS CHQdateR,
        N'ชำระแล้ว' AS CHQstatus,
        CHQtotal,
        CASE CHQstatusN
            WHEN 1 THEN N'เช็ค'
            WHEN 2 THEN N'โอนเงิน'
            WHEN 3 THEN N'เก็บสด'
        END AS CHQstatusN
    FROM CHQ
    WHERE CHQstatus = 1
      AND CHQdateC >= DATEADD(MONTH, -$d2, GETDATE())
      AND CHQcus = ?
    ORDER BY CHQdateC DESC
),
ReturnedCheque AS
(
    SELECT TOP (5)
        CHQcus,
        CHQno,
        CAST(CHQdateC AS DATE) AS CHQdateC,
        CHQbank,
        CAST(CHQdateR AS DATE) AS CHQdateR,
        CASE
            WHEN CHQstatus = 2 THEN N'เช็คคืน'
        END AS CHQstatus,
        CHQtotal,
        N'เช็คคืน' AS CHQstatusN
    FROM CHQ
    WHERE CHQcus = ?
      AND CHQstatusN = 10
    ORDER BY CHQdateC DESC
),
Pending AS
(
    SELECT
        CHQcus,
        CHQno,
        CAST(CHQdateC AS DATE) AS CHQdateC,
        CHQbank,
        CAST(CHQdateR AS DATE) AS CHQdateR,
        N'รอผ่าน' AS CHQstatus,
        CHQtotal,
        CASE CHQstatusN
            WHEN 1 THEN N'เช็ค'
            WHEN 2 THEN N'โอนเงิน'
        END AS CHQstatusN
    FROM CHQ
    WHERE CHQcus = ?
      AND CHQstatus = 0
      AND CHQdateC >= DATEADD(MONTH, -3, GETDATE())
      AND CHQstatusN <> 2
)
SELECT
    CHQcus,
    CHQno,
    CHQdateC,
    CHQbank,
    CHQdateR,
    CHQstatus,
    CHQtotal,
    CHQstatusN
FROM
(
    SELECT * FROM Paid
    UNION ALL
    SELECT * FROM ReturnedCheque
    UNION ALL
    SELECT * FROM Pending
) AS R
ORDER BY
    CHQdateC,CHQno ASC");
  $st->execute([$code, $code, $code]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // เฉลี่ย(วัน) — คำนวณรวม 1 query ใช้ IN (SQL เดียวกัน ติดตามหมายเลขเช็คในแต่ละแถว)
  $avgMap = [];
  $nos = [];
  foreach ($rows as $r) {
    $no = isset($r["CHQno"]) ? $r["CHQno"] : "";
    if ($no !== "" && !in_array($no, $nos)) $nos[] = $no;
  }
  if (count($nos) > 0) {
    $placeholders = implode(",", array_fill(0, count($nos), "?"));
    $st = $db->prepare("SELECT
	CHQno,
	AVG ( CHQ_DateDiff ) [CHQ_avgDateDiff] 
FROM
	(
	SELECT
		CHQno,
		DATEDIFF(
			DAY,
			MIRbinvDate,
		CASE
				
				WHEN CHQstatus = 0 THEN
				( CASE WHEN CHQdateC > CHQdateR THEN CHQdateC ELSE CHQdateR END ) ELSE ( CASE WHEN CHQdateC > CHQdateP THEN CHQdateC ELSE CHQdateP END ) 
				END 
				) [CHQ_DateDiff] 
			FROM
				CHQ
				LEFT JOIN CQL ON CQLno = CHQno
				LEFT JOIN ( SELECT MIRvnos, MIRbinvType, MIRbinvDate FROM MIR WHERE MIRbinvType NOT IN ( 'BS' ) ) MIR ON MIRvnos = CQLvnos 
			WHERE
				CHQ.CHQno IN ($placeholders)
			) A 
	GROUP BY
	CHQno");
    $st->execute($nos);
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
      if (isset($r["CHQno"]) && $r["CHQ_avgDateDiff"] !== null) {
        $avgMap[$r["CHQno"]] = (string)(int)round((float)$r["CHQ_avgDateDiff"]);
      }
    }
  }

  $fmt = function ($iso) {
    if (!$iso) return "";
    $t = strtotime($iso);
    return date("d/m", $t) . "/" . (date("Y", $t) + 543);
  };

  $out = [];
  foreach ($rows as $r) {
    $no = isset($r["CHQno"]) ? $r["CHQno"] : "";
    $out[] = [
      "no" => $no,
      "cdate" => $fmt(isset($r["CHQdateC"]) ? $r["CHQdateC"] : ""),
      "bank" => isset($r["CHQbank"]) ? $r["CHQbank"] : "",
      "rdate" => $fmt(isset($r["CHQdateR"]) ? $r["CHQdateR"] : ""),
      "status" => isset($r["CHQstatus"]) ? $r["CHQstatus"] : "",
      "avg" => isset($avgMap[$no]) ? $avgMap[$no] : "",
      "amount" => isset($r["CHQtotal"]) ? (float)$r["CHQtotal"] : 0.0,
      "action" => isset($r["CHQstatusN"]) ? $r["CHQstatusN"] : ""
    ];
  }

  echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
