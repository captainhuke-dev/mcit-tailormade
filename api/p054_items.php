<?php
/**
 * P054 — Packing Order — Items per document (table 2)
 * POST { connectionId, vnos: ["IVVN6909-3581", ...] }
 * MAC5 (SQL Server) — MIL + STK (user spec 2026-09-23):
 *   SELECT MILlistNo, SUBSTRING(MILvCol2,1,1) MILchar, STKcode, STKdescT1,
 *          (MILquan/MILconv) MILquan, MILuname, MILvCol1, MILvCol2, STKsnsv
 *   FROM MIL LEFT JOIN STK ON MILstk = STKcode
 *   WHERE MILvnos = ? AND ISNUMERIC(MILvCol2)=0 AND MILvCol2 != ''
 *   ORDER BY MILlistNo
 * Response: { ok: true, items: { "IVVN6909-3581": [ {listNo, char, code, desc, qty, unit, vcol1, vcol2, snsv}, ... ], ... } }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$vnos = isset($input['vnos']) && is_array($input['vnos']) ? $input['vnos'] : array();

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}

// filter: alphabet/digit/dash/underscore only — max 50
$vnos = array_values(array_filter(array_map(function ($v) {
    return is_string($v) ? trim($v) : '';
}, $vnos), function ($v) {
    return $v !== '' && preg_match('/^[A-Za-z0-9\-_]+$/', $v);
}));
if (count($vnos) > 50) {
    $vnos = array_slice($vnos, 0, 50);
}

if (count($vnos) === 0) {
    echo json_encode(array('ok' => true, 'items' => array()));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Connection failed', 'detail' => $e->getMessage()));
    exit;
}

// IN list (whitelist — ปลอด injection)
$in = implode(', ', array_map(function ($v) {
    return "'" . $v . "'";
}, $vnos));

$sql = "SELECT
    MILvnos,
    MILlistNo,
    SUBSTRING(CONVERT(nvarchar(255), MILvCol2), 1, 1) AS MILchar,
    STKcode,
    STKdescT1,
    (MILquan / MILconv) AS MILquan,
    MILuname,
    MILvCol1,
    MILvCol2,
    STKsnsv
FROM
    MIL
    LEFT JOIN STK ON MILstk = STKcode
WHERE
    MILvnos IN (" . $in . ")
    AND ISNUMERIC(CONVERT(nvarchar(255), MILvCol2)) = 0
    AND CONVERT(nvarchar(255), MILvCol2) != ''
ORDER BY
    MILvnos,
    MILlistNo";

try {
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}

$items = array();
foreach ($rows as $r) {
    $vn = $r['MILvnos'];
    if (!isset($items[$vn])) {
        $items[$vn] = array();
    }
    $items[$vn][] = array(
        'listNo' => $r['MILlistNo'],
        'char' => $r['MILchar'],
        'code' => $r['STKcode'],
        'desc' => $r['STKdescT1'],
        'qty' => $r['MILquan'] !== null ? (float) $r['MILquan'] : null,
        'unit' => $r['MILuname'],
        'vcol1' => $r['MILvCol1'],
        'vcol2' => $r['MILvCol2'],
        'snsv' => $r['STKsnsv']
    );
}

echo json_encode(array('ok' => true, 'items' => $items));
