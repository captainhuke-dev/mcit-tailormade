<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ตาราง 5 รายการสั่งขายปัจจุบัน (MIL)
 * POST { connectionId, doc }
 * MAC5 (SQL Server) — MIL
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013sError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013sError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013sError('ต้องระบุ connectionId');

$doc = isset($input['doc']) ? trim((string) $input['doc']) : '';
if ($doc === '') p013sError('ต้องระบุ doc');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013sError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

$sql = "SELECT
    CONVERT(DATE, STR(MIL.MILday) + '/' + STR(MIL.MILmonth) + '/' + STR(MIL.MILyear), 103) AS MILdate,
    MIL.MILstk,
    MIL.MILdesc,
    (MIL.MILquan / MIL.MILconv) AS MILquan,
    MIL.MILuname,
    MIL.MILuprice,
    MIL.MILcog
FROM MIL
WHERE MILvnos = ?
ORDER BY MILlistNo";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($doc));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p013sError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p013sDate($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('d/m/', $ts) . (date('Y', $ts) + 543) : '';
}

$out = array();
foreach ($rows as $r) {
    $out[] = array(
        'date' => p013sDate($r['MILdate']),
        'code' => (string) ($r['MILstk'] !== null ? $r['MILstk'] : ''),
        'desc' => (string) ($r['MILdesc'] !== null ? $r['MILdesc'] : ''),
        'qty' => is_numeric($r['MILquan']) ? (float) $r['MILquan'] : 0.0,
        'unit' => (string) ($r['MILuname'] !== null ? $r['MILuname'] : ''),
        'price' => is_numeric($r['MILuprice']) ? (float) $r['MILuprice'] : 0.0,
        'amount' => is_numeric($r['MILcog']) ? (float) $r['MILcog'] : 0.0
    );
}

echo json_encode(array('ok' => true, 'rows' => $out), JSON_UNESCAPED_UNICODE);
