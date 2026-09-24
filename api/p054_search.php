<?php
/**
 * P054 — Packing Order/Cartonize/ใบจัดกล่อง (search)
 * POST { connectionId, date, status, vnos }
 * MAC5 (SQL Server) — MIH + DEB + MIL
 *
 * เงื่อนไข (user spec 2026-09-23):
 * - วันที่ = CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) = date
 * - MIHstatus = status (เช่น 65)
 * - MIHvnos LIKE '%vnos%'
 * - เฉพาะใบที่มี MILtype = 'IS' และ MILvCol2 ไม่เป็นตัวเลข/ไม่ว่าง (MILvnos IN subquery)
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$date = isset($input['date']) ? trim($input['date']) : '';
$status = isset($input['status']) ? trim($input['status']) : '';
$vnos = isset($input['vnos']) ? trim($input['vnos']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid date (yyyy-mm-dd)'));
    exit;
}
if (!preg_match('/^\d{1,4}$/', $status)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid status'));
    exit;
}
// doc number: alphabet/digit/dash/underscore only
if ($vnos !== '' && !preg_match('/^[A-Za-z0-9\-_]+$/', $vnos)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid vnos'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

// Query (user verbatim 2026-09-23)
$miHdate = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103)";
$sql = "SELECT
        " . $miHdate . " AS MIHdate,
        MIH.MIHvnos,
        DEB.DEBcode,
        DEB.DEBnameT,
        DEB.DEBcontactT,
        MIH.MIHstatus,
        MIH.MIHdesc,
        MIH.MIHmemo,
        MIH.MIHnetSUM,
        MIH.MIHprintN,
        MIH.MIHnotes,
        MIHjob
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    WHERE MIHvnos IN (
        SELECT MIL.MILvnos
        FROM MIL
        WHERE ISNUMERIC(CONVERT(nvarchar(255), MIL.MILvCol2)) = 0
            AND CONVERT(nvarchar(255), MIL.MILvCol2) != ''
            AND MILtype = 'IS'
        GROUP BY MIL.MILvnos
    )
    AND " . $miHdate . " = '" . $date . "'
    AND MIH.MIHstatus = " . $status . "
    AND MIH.MIHvnos LIKE '%" . $vnos . "%'
    ORDER BY MIH.MIHvnos";

try {
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}

$out = array();
foreach ($rows as $r) {
    // date → d/m/พ.ศ. (ค.ศ. + 543)
    $dateStr = '';
    if ($r['MIHdate']) {
        $ts = strtotime($r['MIHdate']);
        if ($ts) {
            $dateStr = date('d/m/', $ts) . (date('Y', $ts) + 543);
        }
    }
    $out[] = array(
        'date' => $dateStr,
        'vn' => $r['MIHvnos'],
        'cus' => $r['DEBcode'],
        'name' => $r['DEBnameT'],
        'contact' => $r['DEBcontactT'],
        'status' => $r['MIHstatus'],
        'desc' => $r['MIHdesc'],
        'memo' => $r['MIHmemo'],
        'amount' => (float) ($r['MIHnetSUM'] ?? 0),
        'printCount' => (int) ($r['MIHprintN'] ?? 0),
        'notes' => $r['MIHnotes'],
        'job' => $r['MIHjob']
    );
}

echo json_encode(array('ok' => true, 'count' => count($out), 'rows' => $out));
