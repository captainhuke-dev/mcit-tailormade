<?php
/**
 * P092 — Barcode/สคบ. (autocomplete)
 * POST { connectionId, q }
 * MAC5 (SQL Server) — 3 field: STKcode, STKdescT1, Barcode1 (BI_CUBE.dbo.STKguide):
 *   BI_CUBE.dbo.STKguide A LEFT JOIN STK ON STK.STKcode=A.STKcode
 *   filter: STKcode LIKE 'q%' OR STKdescT1 LIKE '%q%' OR Barcode1 LIKE '%q%' (q = '' → ทั้งหมด)
 * Response: { ok, items: [ { code, name, group, barcode(=Barcode1) } ] } (20 ตัว)
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$q = isset($input['q']) ? trim($input['q']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($q !== '' && !preg_match('/^[A-Za-z0-9\-_]+$/', $q)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid q'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

$where = "WHERE 1=1";
if ($q !== '') {
    $where .= " AND (A.STKcode LIKE " . $pdo->quote($q . '%') . " OR STK.STKdescT1 LIKE " . $pdo->quote('%' . $q . '%') . " OR A.Barcode1 LIKE " . $pdo->quote('%' . $q . '%') . ")";
}

$sql = "SELECT TOP 20 A.STKcode, STK.[STKgroup], A.Barcode1, STK.STKdescT1
FROM BI_CUBE.dbo.STKguide A
LEFT JOIN BI_CUBE.dbo.STK ON STK.STKcode = A.STKcode
" . $where . "
ORDER BY A.STKcode";

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
    $items[] = array(
        'code' => (string)$r['STKcode'],
        'group' => (string)$r['STKgroup'],
        'name' => (string)$r['STKdescT1'],
        'barcode' => (string)$r['Barcode1']
    );
}

echo json_encode(array('ok' => true, 'items' => $items), JSON_UNESCAPED_UNICODE);
