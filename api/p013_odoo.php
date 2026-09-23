<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ตาราง 6 รายงานการติดตามทวงหนี้ Odoo
 * POST { connectionId, code }
 * Odoo (PostgreSQL) — project_task + res_partner
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013oError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013oError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013oError('ต้องระบุ connectionId');

$code = isset($input['code']) ? trim((string) $input['code']) : '';
if ($code === '') p013oError('ต้องระบุ code');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013oError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

$sql = "SELECT A.ID,
    A.NAME AS task,
    TO_CHAR(A.create_date + INTERVAL '7 Hours', 'YYYY-MM-DD') AS create_date,
    TO_CHAR(A.date_deadline + INTERVAL '7 Hours', 'YYYY-MM-DD') AS date_deadline,
    A.x_studio_billing_debt,
    A.x_studio_remark_finance,
    COALESCE(A.x_studio_remark_finance, '') AS remark
FROM project_task A
LEFT JOIN res_partner B ON A.partner_id = B.ID
WHERE A.active = TRUE
    AND A.stage_id != 68
    AND A.project_id = 4
    AND B.company_registry = ?
ORDER BY A.create_date";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($code));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p013oError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p013oDate($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('d/m/', $ts) . (date('Y', $ts) + 543) : '';
}

$out = array();
foreach ($rows as $r) {
    // PostgreSQL — column names lowercase
    $id = isset($r['id']) ? $r['id'] : (isset($r['ID']) ? $r['ID'] : '');
    $out[] = array(
        'no' => (string) ($id !== null ? $id : ''),
        'cdate' => p013oDate($r['create_date']),
        'pdate' => p013oDate($r['date_deadline']),
        'amount' => is_numeric($r['x_studio_billing_debt']) ? (float) $r['x_studio_billing_debt'] : 0.0,
        'opinion' => (string) ($r['remark'] !== null ? $r['remark'] : '')
    );
}

echo json_encode(array('ok' => true, 'rows' => $out), JSON_UNESCAPED_UNICODE);
