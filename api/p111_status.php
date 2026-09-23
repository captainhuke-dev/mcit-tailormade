<?php
/**
 * P111 — เปลี่ยนสถานะ (save)
 * POST { connectionId, vnos (เลขใบสำคัญ) }
 * MAC5 (SQL Server) — UPDATE MIH SET MIHstatus = '14' WHERE MIHvnos = ?
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p111SaveError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p111SaveError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
$vnos = isset($input['vnos']) ? trim((string) $input['vnos']) : '';

if ($connectionId === '') p111SaveError('ต้องระบุ connectionId');
if ($vnos === '') p111SaveError('ต้องระบุเลขใบสำคัญ');
// ไขว้เช็ก: เลขที่ใบสำคัญต้องเริ่มต้นด้วย SDEP/SOCD (ตรงกับเงื่อนไขค้นหา)
if (!preg_match('/^(SDEP|SOCD)/', $vnos)) p111SaveError('เลขใบสำคัญไม่ถูกต้อง');

$pdo = getDb($connectionId);
if (!$pdo) {
    p111SaveError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

try {
    $sql = "UPDATE MIH SET MIHstatus = '14' WHERE MIHvnos = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($vnos));
    $affected = $stmt->rowCount();
} catch (PDOException $e) {
    p111SaveError('save ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

if ($affected == 0) {
    p111SaveError('ไม่พบรายการ ' . $vnos . ' — อาจถูกเปลี่ยนสถานะไปแล้ว', 404);
}

echo json_encode(array('ok' => true, 'updated' => (int) $affected, 'vnos' => $vnos), JSON_UNESCAPED_UNICODE);
