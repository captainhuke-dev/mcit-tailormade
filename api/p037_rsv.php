<?php
/**
 * P037 — ตรวจสอบของจองที่มีการเปิดบิล (RSV — ตารางใบจอง)
 * POST { connectionId, date (yyyy-mm-dd), cus }
 * MAC5 (SQL Server) — user spec 2026-09-28:
 *   RSV = MIH (SS, RSV%) + cancel=0 + status != 4 + เดือน/ปีตามวันที่ค้นหา + MIHcus = ลูกค้าที่เลือก (exact)
 * Response: { ok, rsv: [{date, cus, vnos, status, desc, notes}] }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$date = isset($input['date']) ? trim($input['date']) : '';
$cus = isset($input['cus']) ? trim($input['cus']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($date === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'date must be yyyy-mm-dd'));
    exit;
}
if ($cus === '' || !preg_match('/^[A-Za-z0-9\-]+$/', $cus)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'cus required'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

$parts = explode('-', $date);
$month = (int) $parts[1];
$year = (int) $parts[0];

try {
    $sql = "SELECT CONVERT(DATE, STR(MIHday) + '/' + STR(MIHmonth) + '/' + STR(MIHyear), 103) AS MIHdate,
            MIHcus,
            DEBnameT,
            MIHvnos,
            IC_SnameT,
            MIHdesc,
            MIHnotes
            FROM MIH
            LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
            LEFT JOIN IC_S ON IC_S.IC_Scode = MIHstatus
            WHERE (MIHvnos LIKE 'RSV%' AND MIHtype = 'SS')
            AND MIHcancel = 0
            AND MIH.MIHstatus != 4
            AND (MIHmonth = '" . $month . "' AND MIHyear = '" . $year . "')
            AND MIHcus = " . $pdo->quote($cus) . "
            ORDER BY MIHcus ASC";

    $stmt = $pdo->query($sql);
    $rsv = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rsv[] = array(
            'date' => $r['MIHdate'] ? date('d/m/Y', strtotime($r['MIHdate'])) : '',
            'cus' => $r['MIHcus'],
            'name' => $r['DEBnameT'],
            'vnos' => $r['MIHvnos'],
            'status' => $r['IC_SnameT'],
            'desc' => $r['MIHdesc'],
            'notes' => $r['MIHnotes']
        );
    }
    echo json_encode(array('ok' => true, 'rsv' => $rsv), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}
