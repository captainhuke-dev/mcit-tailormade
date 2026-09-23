<?php
/**
 * P013 — พิมพ์เอกสาร: MIHprintN +1 (ราย SO)
 * POST { connectionId, docs: ["SCRE6909-2248", ...] }
 * MAC5 (SQL Server) — MIH
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013pError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013pError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013pError('ต้องระบุ connectionId');

$docs = isset($input['docs']) && is_array($input['docs']) ? $input['docs'] : array();
$docs = array_values(array_filter(array_map(function ($v) { return trim((string) $v); }, $docs), function ($v) { return $v !== ''; }));
if (count($docs) === 0) p013pError('ต้องระบุ docs');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013pError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

try {
    $placeholders = implode(',', array_fill(0, count($docs), '?'));
    $stmt = $pdo->prepare("UPDATE MIH SET MIHprintN = ISNULL(MIHprintN, 0) + 1 WHERE MIHvnos IN ($placeholders)");
    $stmt->execute($docs);
    $updated = $stmt->rowCount();

    // ดึง printN ใหม่กลับ
    $stmt = $pdo->prepare("SELECT MIHvnos, MIHprintN FROM MIH WHERE MIHvnos IN ($placeholders)");
    $stmt->execute($docs);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $printN = array();
    foreach ($rows as $r) {
        $printN[(string) $r['MIHvnos']] = (int) ($r['MIHprintN'] ?? 0);
    }
} catch (PDOException $e) {
    p013pError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

echo json_encode(array('ok' => true, 'updated' => $updated, 'printN' => $printN), JSON_UNESCAPED_UNICODE);
