<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ตาราง 4 รายการเช็ครอผ่าน
 * POST { connectionId, code }
 * MAC5 (SQL Server) — CHQ + CQ_S
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013kError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013kError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013kError('ต้องระบุ connectionId');

$code = isset($input['code']) ? trim((string) $input['code']) : '';
if ($code === '') p013kError('ต้องระบุ code');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013kError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

$sql = "DECLARE @VAR VARCHAR(25) = ?;
DECLARE @D1 INT, @D2 INT, @D3 INT;

SET @D1 = (
    SELECT COUNT(CHQno)
    FROM CHQ
    WHERE CHQstatus = 1
      AND CHQdateC >= DATEADD(MONTH, -6, GETDATE())
      AND CHQcus IN (@VAR)
);

SET @D2 = (CASE WHEN @D1 < 6 THEN 36 ELSE 6 END);
SET @D3 = (CASE WHEN @D1 < 6 THEN 6 ELSE 12 END);

SELECT TOP 5
    CHQno,
    CONVERT(DATE, CHQdateC, 103) AS CHQdateC,
    CHQbank,
    CONVERT(DATE, CHQdateR, 103) AS CHQdateR,
    CASE WHEN CHQstatus = '2' THEN N'เช็คคืน' ELSE NULL END AS CHQstatus,
    CHQtotal,
    CASE WHEN CHQstatusN = '10' THEN N'เช็คคืน' ELSE NULL END AS CHQstatusN
FROM CHQ
WHERE CHQcus = @VAR
  AND CHQstatusN = 10

UNION ALL

SELECT * FROM (
    SELECT TOP (@D3)
        CHQno,
        CONVERT(DATE, CHQdateC, 103) AS CHQdateC,
        CHQbank,
        CONVERT(DATE, CHQdateR, 103) AS CHQdateR,
        CASE WHEN CHQstatus = '1' THEN N'ชำระแล้ว' ELSE NULL END AS CHQstatus,
        CHQtotal,
        CONVERT(NVARCHAR(100), CQ_SnameT) AS CHQstatusN
    FROM CHQ
    LEFT JOIN CQ_S ON CQ_S.CQ_Scode = CHQ.CHQstatusN
    WHERE CHQstatus = 1
      AND CHQdateC >= DATEADD(MONTH, -@D2, GETDATE())
      AND CHQcus IN (@VAR)
    ORDER BY CONVERT(DATE, CHQdateC, 103) DESC
) AS Paid

UNION ALL

SELECT * FROM (
    SELECT
        CHQno,
        CONVERT(DATE, CHQdateC, 103) AS CHQdateC,
        CHQbank,
        CONVERT(DATE, CHQdateR, 103) AS CHQdateR,
        CASE WHEN CHQstatus = '0' THEN N'รอผ่าน' ELSE NULL END AS CHQstatus,
        CHQtotal,
        CONVERT(NVARCHAR(100), CQ_SnameT) AS CHQstatusN
    FROM CHQ
    LEFT JOIN CQ_S ON CQ_S.CQ_Scode = CHQ.CHQstatusN
    WHERE CHQcus = @VAR
      AND CHQstatus = 0
      AND CHQdateC >= DATEADD(MONTH, -3, GETDATE())
      AND CHQstatusN != '2'
) AS Due

ORDER BY CHQdateC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($code));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p013kError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p013kDate($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('d/m/', $ts) . (date('Y', $ts) + 543) : '';
}

// เฉลี่ย(วัน) ต่อหมายเลขเช็ค — MIRbinvDate → วันชำระ/เช็ค
// 1 query เดียว (IN) สำหรับตัวเลขเช็คทั้งหมด — ไม่ loop 1 query/แถว
function p013kAvgMap($pdo, $chqNos) {
    $map = array();
    $chqNos = array_values(array_unique(array_filter($chqNos, function ($v) { return $v !== ''; })));
    if (count($chqNos) === 0) return $map;
    $placeholders = implode(',', array_fill(0, count($chqNos), '?'));
    $sql = "SELECT CHQno, AVG(CHQ_DateDiff) AS CHQ_avgDateDiff FROM (
        SELECT CHQno,
            DATEDIFF(DAY, MIRbinvDate,
                CASE
                    WHEN CHQstatus = 0 THEN (CASE WHEN CHQdateC > CHQdateR THEN CHQdateC ELSE CHQdateR END)
                    ELSE (CASE WHEN CHQdateC > CHQdateP THEN CHQdateC ELSE CHQdateP END)
                END
            ) AS CHQ_DateDiff
        FROM CHQ
        LEFT JOIN CQL ON CQLno = CHQno
        LEFT JOIN (SELECT MIRvnos, MIRbinvType, MIRbinvDate FROM MIR WHERE MIRbinvType NOT IN ('BS')) MIR ON MIRvnos = CQLvnos
        WHERE CHQ.CHQno IN ($placeholders)
    ) A GROUP BY CHQno";
    try {
        $st = $pdo->prepare($sql);
        $st->execute($chqNos);
        foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
            if (is_numeric($r['CHQ_avgDateDiff'])) $map[$r['CHQno']] = (int) round($r['CHQ_avgDateDiff']);
        }
    } catch (PDOException $e) {
        // keep empty map
    }
    return $map;
}

$out = array();
$nos = array();
foreach ($rows as $r) {
    $no = (string) ($r['CHQno'] !== null ? $r['CHQno'] : '');
    $nos[] = $no;
}
$avgMap = p013kAvgMap($pdo, $nos);
foreach ($rows as $r) {
    $no = (string) ($r['CHQno'] !== null ? $r['CHQno'] : '');
    $out[] = array(
        'no' => $no,
        'cdate' => p013kDate($r['CHQdateC']),
        'bank' => (string) ($r['CHQbank'] !== null ? $r['CHQbank'] : ''),
        'rdate' => p013kDate($r['CHQdateR']),
        'status' => (string) ($r['CHQstatus'] !== null ? $r['CHQstatus'] : ''),
        'avg' => isset($avgMap[$no]) ? $avgMap[$no] : '',
        'amount' => is_numeric($r['CHQtotal']) ? (float) $r['CHQtotal'] : 0.0,
        'nstatus' => (string) ($r['CHQstatusN'] !== null ? $r['CHQstatusN'] : '')
    );
}

echo json_encode(array('ok' => true, 'rows' => $out), JSON_UNESCAPED_UNICODE);
