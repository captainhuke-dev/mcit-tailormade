<?php
/**
 * P054 — Packing Order — Route per JOBcode
 * POST { connectionId, jobs: ["V061180", ...] }
 * MAC5 (SQL Server) — BI_CUBE.dbo.JOB_TransportRoute (user spec 2026-09-23):
 *   SELECT Route FROM [BI_CUBE].[dbo].[JOB_TransportRoute] WHERE JOBcode = ?JOBcode
 * Response: { ok: true, routes: { "V061180": "Route M2", ... } }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$jobs = isset($input['jobs']) && is_array($input['jobs']) ? $input['jobs'] : array();

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}

// filter: alphabet/digit/dash/underscore only — max 50
$jobs = array_values(array_filter(array_map(function ($j) {
    return is_string($j) ? trim($j) : '';
}, $jobs), function ($j) {
    return $j !== '' && preg_match('/^[A-Za-z0-9\-_]+$/', $j);
}));
if (count($jobs) > 50) {
    $jobs = array_slice($jobs, 0, 50);
}

if (count($jobs) === 0) {
    echo json_encode(array('ok' => true, 'routes' => array()));
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
$in = implode(', ', array_map(function ($j) {
    return "'" . $j . "'";
}, $jobs));

$sql = "SELECT JOBcode, Route FROM [BI_CUBE].[dbo].[JOB_TransportRoute] WHERE JOBcode IN (" . $in . ")";

try {
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}

$routes = array();
foreach ($rows as $r) {
    $routes[$r['JOBcode']] = (string) $r['Route'];
}

echo json_encode(array('ok' => true, 'routes' => $routes));
