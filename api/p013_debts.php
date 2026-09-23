<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ตาราง 3 รายการหนี้ค้างชำระ
 * POST { connectionId, code }
 * MAC5 (SQL Server) — CFS + CDC + BI_CUBE
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013dError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013dError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013dError('ต้องระบุ connectionId');

$code = isset($input['code']) ? trim((string) $input['code']) : '';
if ($code === '') p013dError('ต้องระบุ code');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013dError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

$sql = "DECLARE @CusID VARCHAR(20) = ?;
SELECT
    CASE WHEN CFStypeID = 'IS' THEN N'ใบแจ้งหนี้ขาย' ELSE NULL END AS CFStypeID,
    CFSvnosID,
    CONVERT(DATE, CFSdateID, 103) AS CFSdateID,
    CONVERT(DATE, DATEADD(DAY, 29, CFSdateID), 103) AS dateL,
    DEBcreditTerm,
    Bill.msg,
    (CFSsumREQ - CFSsumCUT1) AS summary
FROM [dbo].[CFS]
LEFT JOIN DEB ON CFScusID = DEBcode
LEFT JOIN (
    SELECT vnos,
        (CASE WHEN [Billing] = '1' THEN N'วางบิล' WHEN [AccruedBill] = '1' THEN N'ค้างบิล' ELSE '' END) AS msg
    FROM [BI_CUBE].[dbo].[tb_CFS_bill_status]
    WHERE [Billing] LIKE '1' OR [AccruedBill] LIKE '1'
) AS Bill ON Bill.vnos = CFS.CFSvnosID
WHERE CFScusID = @CusID
    AND CFSclearALL = 0
    AND (CFSsumREQ - CFSsumCUT1) > 0
    AND CFSvnosID NOT LIKE 'CIV%'

UNION ALL

SELECT
    CASE WHEN CFStypeID = 'IS' THEN N'ใบแจ้งหนี้ขาย' ELSE NULL END AS CFStypeID,
    CFSvnosID,
    CONVERT(DATE, CFSdateID, 103) AS CFSdateID,
    NULL AS dateL,
    (SELECT DEBchemTerm FROM [BI_CUBE].dbo.DEBterm WHERE DEBcode = CFS.CFScusID) AS DEBcreditTerm,
    bill.msg,
    (CFSsumREQ - CFSsumCUT1) AS summary
FROM [dbo].[CFS]
LEFT JOIN (
    SELECT vnos,
        (CASE WHEN Billing = '1' THEN N'วางบิล' WHEN AccruedBill = '1' THEN N'ค้างบิล' ELSE '' END) AS msg
    FROM BI_CUBE.dbo.tb_CFS_bill_status
    WHERE (Billing = '1' OR AccruedBill = '1')
) bill ON bill.vnos = CFSvnosID
WHERE CFScusID = @CusID
    AND CFSclearALL = 0
    AND (CFSsumREQ - CFSsumCUT1) > 0
    AND CFSvnosID LIKE 'CIV%'

UNION ALL

SELECT
    CASE WHEN CDCtypeID = 'AS' THEN N'ใบเพิ่มหนี้ขาย' WHEN CDCtypeID = 'BS' THEN N'ใบลดหนี้ขาย' ELSE '' END AS CDCtype,
    CDCvnosID,
    CDCdateID,
    NULL AS dateL,
    NULL AS DEBcreditTerm,
    '' AS msg,
    CDCnetSUM AS summary
FROM CDC
WHERE (CDCtypeID = 'AS' OR CDCtypeID = 'BS')
    AND CDCcancel = 0
    AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL)
    AND CDCcusID = @CusID
    AND CDCnetSUM != 0

ORDER BY CFSdateID ASC";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($code));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p013dError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p013dDate($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('d/m/', $ts) . (date('Y', $ts) + 543) : '';
}

$out = array();
foreach ($rows as $r) {
    $out[] = array(
        'type' => (string) ($r['CFStypeID'] !== null ? $r['CFStypeID'] : ($r['CDCtype'] !== null ? $r['CDCtype'] : '')),
        'no' => (string) ($r['CFSvnosID'] !== null ? $r['CFSvnosID'] : ($r['CDCvnosID'] !== null ? $r['CDCvnosID'] : '')),
        'date' => p013dDate($r['CFSdateID'] !== null ? $r['CFSdateID'] : ($r['CDCdateID'] !== null ? $r['CDCdateID'] : '')),
        'due' => p013dDate($r['dateL']),
        'credit' => ($r['DEBcreditTerm'] !== null && $r['DEBcreditTerm'] !== '') ? (int) $r['DEBcreditTerm'] : '',
        'status' => (string) ($r['msg'] !== null ? $r['msg'] : ''),
        'amount' => is_numeric($r['summary']) ? (float) $r['summary'] : 0.0
    );
}

echo json_encode(array('ok' => true, 'rows' => $out), JSON_UNESCAPED_UNICODE);
