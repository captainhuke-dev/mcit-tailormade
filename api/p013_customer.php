<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ข้อมูลลูกค้า (ตาราง 1)
 * POST { connectionId, code }
 * MAC5 (SQL Server) — DEB + DEG + PER
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013cError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013cError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013cError('ต้องระบุ connectionId');

$code = isset($input['code']) ? trim((string) $input['code']) : '';
if ($code === '') p013cError('ต้องระบุ code');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013cError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

try {
    $sql = "SELECT
        DEBcode,
        DEBgroup,
        DEBgrade,
        DEG.DEGdescT,
        DEBnameT,
        CONVERT(VARCHAR(15), DEBdate, 101) AS DEBdate,
        DEBlimit,
        DEBcreditTerm,
        DEBtel,
        CONVERT(VARCHAR(255), DEBadd1AT) + ' ' + CONVERT(VARCHAR(255), DEBadd2AT) + ' ' + CONVERT(VARCHAR(255), DEBadd3AT) AS address,
        DEBsalesP AS sale,
        PERnameT
    FROM DEB
    LEFT JOIN DEG ON DEG.DEGcode = DEB.DEBgroup
    LEFT JOIN PER ON PER.PERcode = DEBsalesP
    WHERE DEBcode = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($code));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p013cError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

if (!$row) {
    p013cError('ไม่พบลูกหนี้ ' . $code, 404);
}

echo json_encode(array(
    'ok' => true,
    'customer' => array(
        'code' => (string) ($row['DEBcode'] ?? ''),
        'group' => (string) ($row['DEBgroup'] ?? ''),
        'grade' => (string) ($row['DEBgrade'] ?? ''),
        'groupDesc' => (string) ($row['DEGdescT'] ?? ''),
        'name' => (string) ($row['DEBnameT'] ?? ''),
        'date' => (string) ($row['DEBdate'] ?? ''),
        'limit' => (float) ($row['DEBlimit'] ?? 0),
        'creditTerm' => (int) ($row['DEBcreditTerm'] ?? 0),
        'tel' => (string) ($row['DEBtel'] ?? ''),
        'address' => trim((string) ($row['address'] ?? '')),
        'sale' => (string) ($row['sale'] ?? ''),
        'saleName' => (string) ($row['PERnameT'] ?? '')
    )
), JSON_UNESCAPED_UNICODE);
