<?php
/**
 * P031 — รายงานเงินโอนประจำวัน
 * POST { connectionId, dateFrom (yyyy-mm-dd), dateTo (yyyy-mm-dd), employee ("" = ทั้งหมด) }
 * MAC5 (SQL Server) — CHQ + DEB + ACC + CQL/MIE (discount)
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p031Error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p031Error('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
$dateFrom = isset($input['dateFrom']) ? trim((string) $input['dateFrom']) : '';
$dateTo = isset($input['dateTo']) ? trim((string) $input['dateTo']) : '';
$employee = isset($input['employee']) ? trim((string) $input['employee']) : '';

if ($connectionId === '') p031Error('ต้องระบุ connectionId');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) p031Error('รูปแบบวันที่เริ่มต้นไม่ถูกต้อง (yyyy-mm-dd)');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) p031Error('รูปแบบวันที่สิ้นสุดไม่ถูกต้อง (yyyy-mm-dd)');
if ($dateFrom > $dateTo) p031Error('วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด');

// รหัสพนักงานที่ได้รับอนุมัติ (IN list) — employee = "" → ทั้งหมด
$ALLOWED_USERS = array('ACC902', 'ACC903', 'ACC302', 'ACC301', 'ACC303', 'ACC201', 'ACC202');
if ($employee !== '' && !in_array($employee, $ALLOWED_USERS, true)) {
    p031Error('รหัสพนักงานไม่ได้รับอนุญาต');
}
$userList = ($employee !== '') ? array($employee) : $ALLOWED_USERS;
$userIn = implode(',', array_map(function ($u) { return "'" . $u . "'"; }, $userList));

$pdo = getDb($connectionId);
if (!$pdo) {
    p031Error('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

// แปลง yyyy-mm-dd → dd-mm-yyyy (CONVERT style 103)
function p031Dmy($ymd) {
    $p = explode('-', $ymd);
    return $p[2] . '-' . $p[1] . '-' . $p[0];
}

try {
    $sql = "SELECT
        CHQ.CHQno,
        CHQ.CHQdateC,
        CHQ.CHQcus,
        DEB.DEBnameT,
        ACC.ACCcode,
        ACC.ACCdescT,
        CHQ.CHQtotal,
        (
            SELECT TOP 1
                CAST((MIE.MIErecDRND + MIE.MIErecDEXG + MIE.MIErecDCSH + MIE.MIErecDOTH) AS DECIMAL(18,2))
            FROM CQL
            LEFT JOIN MIE ON MIE.MIEvnos = CQL.CQLvnos
            WHERE CQL.CQLno = CHQ.CHQno
        ) AS Discount
    FROM CHQ
    LEFT JOIN DEB ON DEB.DEBcode = CHQ.CHQcus
    LEFT JOIN ACC ON ACC.ACCcode = CHQ.CHQacode
    WHERE
        CHQ.CHQstatus = 1
        AND CHQ.CHQstatusN IN (2, 12)
        AND CHQ.CHQtype = 1
        AND (CHQ.CHQno LIKE 'RER%' OR CHQ.CHQno LIKE 'RVA%' OR CHQ.CHQno LIKE 'CER%'
        OR CHQ.CHQno LIKE 'VCV%' OR CHQ.CHQno LIKE 'VCF%' OR CHQ.CHQno LIKE 'VAF%'
        OR CHQ.CHQno LIKE 'VSB%' OR CHQ.CHQno LIKE 'VF1%' OR CHQ.CHQno LIKE 'VF2%'
        OR CHQ.CHQno LIKE 'VF3%' OR CHQ.CHQno LIKE 'PCC1%' OR CHQ.CHQno LIKE 'PCT1%'
        OR CHQ.CHQno LIKE 'PCT2%' OR CHQ.CHQno LIKE 'PCT3%')
        AND CONVERT(DATE, CHQ.CHQkeyDate, 103) >= CONVERT(DATE, ?, 103)
        AND CONVERT(DATE, CHQ.CHQkeyDate, 103) <= CONVERT(DATE, ?, 103)
        AND CHQ.CHQkeyUser IN ($userIn)
    ORDER BY
        ACC.ACCcode,
        CHQ.CHQdateC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(array(p031Dmy($dateFrom), p031Dmy($dateTo)));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p031Error('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p031Date($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('Y-m-d', $ts) : '';
}

$items = array();
foreach ($rows as $row) {
    $items[] = array(
        'no' => (string) ($row['CHQno'] ?? ''),
        'date' => p031Date($row['CHQdateC'] ?? null),
        'cus' => (string) ($row['CHQcus'] ?? ''),
        'name' => (string) ($row['DEBnameT'] ?? ''),
        'accCode' => (string) ($row['ACCcode'] ?? ''),
        'account' => (string) ($row['ACCdescT'] ?? ''),
        'amount' => (float) ($row['CHQtotal'] ?? 0),
        'discount' => (float) ($row['Discount'] ?? 0)
    );
}

echo json_encode(array('ok' => true, 'rows' => $items), JSON_UNESCAPED_UNICODE);
