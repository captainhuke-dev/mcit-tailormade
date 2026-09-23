<?php
/**
 * P034 — ประวัติทางการเงินลูกหนี้ — รายการหนี้ค้างชำระ
 * POST { connectionId, code }
 * { ok, rows: [ { type, no, date, due, credit, amount } ] }
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
  $st = $db->prepare("SELECT
    X.DocType,
    X.DocNo,
    X.DocDate,
    X.DateL,
    X.CreditTerm,
    X.Summary
FROM
(
    SELECT
        CASE
            WHEN C.CFStypeID = 'IS' THEN N'ใบแจ้งหนี้ขาย'
            ELSE NULL
        END AS DocType,
        C.CFSvnosID AS DocNo,
        CAST(C.CFSdateID AS DATE) AS DocDate,
        CAST(DATEADD(DAY, 29, C.CFSdateID) AS DATE) AS DateL,
        D.DEBcreditTerm AS CreditTerm,
        C.CFSsumREQ - C.CFSsumCUT1 AS Summary,
        1 AS SortGroup
    FROM dbo.CFS AS C
    LEFT JOIN dbo.DEB AS D
        ON C.CFScusID = D.DEBcode
    WHERE C.CFScusID = ?
      AND C.CFSclearALL = 0
      AND (C.CFSsumREQ - C.CFSsumCUT1) > 0
      AND C.CFSvnosID NOT LIKE 'CIV%'

    UNION ALL

    SELECT
        CASE
            WHEN C.CDCtypeID = 'AS' THEN N'ใบเพิ่มหนี้ขาย'
            WHEN C.CDCtypeID = 'BS' THEN N'ใบลดหนี้ขาย'
            ELSE NULL
        END AS DocType,
        C.CDCvnosID AS DocNo,
        CAST(C.CDCdateID AS DATE) AS DocDate,
        CAST(NULL AS DATE) AS DateL,
        CAST(NULL AS INT) AS CreditTerm,
        C.CDCnetSUM AS Summary,
        2 AS SortGroup
    FROM dbo.CDC AS C
    WHERE C.CDCtypeID IN ('AS', 'BS')
      AND C.CDCcancel = 0
      AND (C.CDClinkVtype2 = '' OR C.CDClinkVtype2 IS NULL)
      AND C.CDCcusID = ?
      AND C.CDCnetSUM <> 0
) AS X
ORDER BY
    X.DocDate ASC,
    X.SortGroup ASC,
    X.DocNo ASC");
  $st->execute([$code, $code]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $fmt = function ($iso) {
      if (!$iso) return "";
      $t = strtotime($iso);
      return date("d/m", $t) . "/" . (date("Y", $t) + 543);
    };
    $out[] = [
      "type" => isset($r["DocType"]) ? $r["DocType"] : "",
      "no" => isset($r["DocNo"]) ? $r["DocNo"] : "",
      "date" => $fmt(isset($r["DocDate"]) ? $r["DocDate"] : ""),
      "due" => $fmt(isset($r["DateL"]) ? $r["DateL"] : ""),
      "credit" => isset($r["CreditTerm"]) && $r["CreditTerm"] !== null ? (int)$r["CreditTerm"] : "",
      "amount" => isset($r["Summary"]) ? (float)$r["Summary"] : 0.0
    ];
  }

  echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
