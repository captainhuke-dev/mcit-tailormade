<?php
/**
 * P047 — เช็คสถานะ Invoice
 * POST { connectionId, dateFrom (yyyy-mm-dd), dateTo (yyyy-mm-dd), statuses (int[]) }
 * MAC5 (SQL Server) — ตาม C# frm_CheckStatusInvoiceGUI:
 *   MIH (IS, cancel=0) + status IN (62,63,65,67,68,70) + range วันที่
 * Response: { ok, statuses: [{code, name}], rows: [{date, per, vnos, cus, name, status, printN}] }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$dateFrom = isset($input['dateFrom']) ? trim($input['dateFrom']) : '';
$dateTo = isset($input['dateTo']) ? trim($input['dateTo']) : '';
$statuses = isset($input['statuses']) && is_array($input['statuses']) ? $input['statuses'] : array();

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($dateFrom === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'dateFrom must be yyyy-mm-dd'));
    exit;
}
if ($dateTo === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'dateTo must be yyyy-mm-dd'));
    exit;
}
$statuses = array_values(array_unique(array_filter(array_map('intval', $statuses), function ($v) { return $v > 0; })));
if (count($statuses) === 0) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'statuses required'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

try {
    // statuses (user spec 2026-09-29 — AR_Scode < 63 + NOT IN)
    $st = $pdo->query("SELECT AR_Scode,
            CAST(AR_Scode AS VARCHAR) + ' : ' + CAST(AR_SnameT AS VARCHAR) AS AR_SnameT
            FROM AR_S
            WHERE AR_SnameT IS NOT NULL
            AND AR_Scode < 63
            AND AR_Scode NOT IN (0,1,5,7,9,10,11,12,13,14,15,18,20,21,22,25,26,27,28,41)
            ORDER BY AR_Scode");
    $statusList = array();
    while ($r = $st->fetch(PDO::FETCH_ASSOC)) {
        $statusList[] = array('code' => (int) $r['AR_Scode'], 'name' => $r['AR_SnameT']);
    }

    // rows (C# button1_Click — MIH IS + cancel=0 + status IN + range)
    $in = array();
    foreach ($statuses as $s) {
        $in[] = $s;
    }
    $sql = "SELECT CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) AS MIHdate,
            MIHper,
            MIHvnos,
            DEB.DEBcode,
            DEBnameT,
            MIHstatus,
            ISNULL(MIHprintN, 0) AS MIHprintN
            FROM MIH
            LEFT JOIN DEB ON DEB.DEBcode = MIHcus
            WHERE MIHcancel = 0
            AND MIHtype = 'IS'
            AND MIHstatus IN (" . implode(',', $in) . ")
            AND CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) <= '" . $dateTo . "'
            AND CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) >= '" . $dateFrom . "'
            ORDER BY MIHdate";

    $stmt = $pdo->query($sql);
    $rows = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = array(
            'date' => $r['MIHdate'] ? date('d/m/Y', strtotime($r['MIHdate'])) : '',
            'iso' => $r['MIHdate'],
            'per' => $r['MIHper'],
            'vnos' => $r['MIHvnos'],
            'cus' => $r['DEBcode'],
            'name' => $r['DEBnameT'],
            'status' => (int) $r['MIHstatus'],
            'printN' => (int) $r['MIHprintN']
        );
    }
    echo json_encode(array('ok' => true, 'statuses' => $statusList, 'rows' => $rows), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}
