<?php
/**
 * P111 — รายงานลูกค้าที่มียอดค้างเกินวงเงิน
 * POST { connectionId }
 * MAC5 (SQL Server) — MIH + DEB + AR_S + CPS (ของไม่ครบ)
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p111Error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p111Error('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p111Error('ต้องระบุ connectionId');

// testMode = true → ไม่กั้น MIHstatus != 14 (เช็ค Test ระบบ)
$testMode = !empty($input['testMode']);

$pdo = getDb($connectionId);
if (!$pdo) {
    p111Error('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

try {
    // testMode = true → ตัดเงื่อนไข MIHstatus != 14 ออก
    $statusCond = $testMode ? '' : "AND MIH.MIHstatus != 14\n        ";
    $sql = "SELECT
        CONVERT(DATE, STR(MIH.MIHday) + '-' + STR(MIH.MIHmonth) + '-' + STR(MIH.MIHyear), 103) AS MIHdate,
        MIH.MIHtype,
        MIH.MIHvnos,
        MIH.MIHcus,
        DEB.DEBnameT,
        MIH.MIHdesc,
        MIH.MIHnetSUM,
        MIH.MIHextraSUM,
        CONVERT(VARCHAR(10), MIH.MIHstatus) + ' : ' + CONVERT(VARCHAR(100), AR_S.AR_SnameT) AS MIHstatus,
        MIH.MIHstatus AS [status]
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    LEFT JOIN AR_S ON AR_S.AR_Scode = MIH.MIHstatus
    WHERE
        (MIH.MIHvnos LIKE 'SDEP%' OR MIH.MIHvnos LIKE 'SOCD%')
        AND MIH.MIHtype = 'PS'
        $statusCond
        AND (MIH.MIHnetSUM - MIH.MIHextraSUM) > 0
        AND MIH.MIHvnos IN (
            SELECT CPSvnosID
            FROM CPS
            WHERE (CPSvnosID LIKE 'SDEP%' OR CPSvnosID LIKE 'SOCD%')
                AND (CPSstkREQ - CPSstkCUT1) > 0
                AND CPSclearALL = 0
            GROUP BY CPSvnosID
        )
    ORDER BY MIHdate";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p111Error('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p111Date($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('Y-m-d', $ts) : '';
}

$items = array();
foreach ($rows as $row) {
    $items[] = array(
        'date' => p111Date($row['MIHdate'] ?? null),
        'doc' => (string) ($row['MIHvnos'] ?? ''),
        'cus' => (string) ($row['MIHcus'] ?? ''),
        'name' => (string) ($row['DEBnameT'] ?? ''),
        'desc' => (string) ($row['MIHdesc'] ?? ''),
        'net' => (float) ($row['MIHnetSUM'] ?? 0),
        'deposit' => (float) ($row['MIHextraSUM'] ?? 0),
        'status' => (string) ($row['status'] ?? ''),
        'statusLabel' => (string) ($row['MIHstatus'] ?? '')
    );
}

echo json_encode(array('ok' => true, 'rows' => $items), JSON_UNESCAPED_UNICODE);
