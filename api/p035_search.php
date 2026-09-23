<?php
/**
 * P035 — ตรวจสอบลูกค้าติดอนุมัติ (search)
 * POST { connectionId, from, to, lockOnly }
 * MAC5 (SQL Server) — MIH (type LIKE '%PS%', status 20) + DEB
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$from = isset($input['from']) ? trim($input['from']) : '';
$to = isset($input['to']) ? trim($input['to']) : '';
$lockOnly = !empty($input['lockOnly']);

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}

// dates must be yyyy-mm-dd (empty = no bound)
if ($from !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'from must be yyyy-mm-dd'));
    exit;
}
if ($to !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'to must be yyyy-mm-dd'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

// Base query (user verbatim) — MIHdate = CONVERT(DATE, STR(day)+'/'+STR(month)+'/'+STR(year), 103)
$miHdate = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103)";

$sql = "SELECT
        " . $miHdate . " AS MIHdate,
        MIH.MIHvnos,
        MIH.MIHcus,
        DEB.DEBnameT,
        DEB.DEBgrade,
        MIH.MIHdesc,
        MIH.MIHnetSUM,
        CONCAT(MIH.MIHstatus, ' : ', AR_SnameT) AS status
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    LEFT JOIN AR_S ON MIHstatus = AR_Scode
    WHERE MIH.MIHtype LIKE '%PS%'
        AND MIH.MIHstatus = 20";

if ($from !== '') {
    $sql .= " AND " . $miHdate . " >= '" . $from . "'";
}
if ($to !== '') {
    $sql .= " AND " . $miHdate . " <= '" . $to . "'";
}
if ($lockOnly) {
    $sql .= " AND DEB.DEBgrade = 'X'";
}

$sql .= " ORDER BY MIHcus, MIHvnos";

try {
    $stmt = $pdo->query($sql);
    $rows = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = array(
            'date' => $r['MIHdate'] ? date('d/m/Y', strtotime($r['MIHdate'])) : '',
            'vn' => $r['MIHvnos'],
            'code' => $r['MIHcus'],
            'name' => $r['DEBnameT'],
            'grade' => $r['DEBgrade'],
            'desc' => $r['MIHdesc'],
            'amount' => (float) $r['MIHnetSUM'],
            'status' => $r['status']
        );
    }
    echo json_encode(array('ok' => true, 'rows' => $rows));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed'));
}
