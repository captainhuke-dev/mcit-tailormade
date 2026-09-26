<?php
/**
 * P092 — Barcode/สคบ. (S/N running)
 * POST { connectionId, code, save?: bool }
 * MAC5 (SQL Server) — ตาม C# MCIT_Frm_STKguideGUI.getRunning / btn_print_Click:
 *   BI_CUBE.dbo.[STKrunning] (STKcode, Running)
 * - save=true → upsert Running = running + copy (MERGE) — C# save เงื่อนไข (size2&&type2) || size3
 * - save=false → read เท่านั้น (C# size4 ใช้ S/N แต่ไม่ save — bug ใน C# — web ตัดสินใจผ่าน flag)
 * Response: { ok, running }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$code = isset($input['code']) ? trim($input['code']) : '';
$save = !empty($input['save']);
$copy = isset($input['copy']) ? (int)$input['copy'] : 1;

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($code === '' || !preg_match('/^[A-Za-z0-9\-_]+$/', $code)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid code'));
    exit;
}
if ($copy < 1) {
    $copy = 1;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

try {
    if ($save) {
        // upsert — read current + add copy ในคำสั่งเดียว (atomic)
        $sql = "MERGE BI_CUBE.dbo.[STKrunning] AS t
USING (SELECT " . $pdo->quote($code) . " AS STKcode) AS s ON t.STKcode = s.STKcode
WHEN MATCHED THEN UPDATE SET Running = ISNULL(Running, 0) + " . $copy . "
WHEN NOT MATCHED THEN INSERT (STKcode, Running) VALUES (s.STKcode, " . $copy . ");";
        $pdo->exec($sql);
    }
    $stmt = $pdo->query("SELECT Running FROM BI_CUBE.dbo.[STKrunning] WHERE STKcode = " . $pdo->quote($code));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $running = $row ? (int)$row['Running'] : 0;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}

echo json_encode(array('ok' => true, 'running' => $running), JSON_UNESCAPED_UNICODE);
