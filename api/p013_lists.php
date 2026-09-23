<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ตาราง 2 (SO อนุมัติแล้ว / SO รออนุมัติ / RSV / CN)
 * POST { connectionId, code }
 * MAC5 (SQL Server) — MIH + CPS
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013lError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013lError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013lError('ต้องระบุ connectionId');

$code = isset($input['code']) ? trim((string) $input['code']) : '';
if ($code === '') p013lError('ต้องระบุ code');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013lError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

function p013lDate($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('d/m/Y', $ts) : '';
}

function p013lFetch($pdo, $sql, $params) {
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        return array();
    }
}

try {
    // 1. SO ที่อนุมัติแล้ว (SO ที่มียอดค้างส่งใน CPS)
    $soApprRows = p013lFetch($pdo, "SELECT MIHvnos, CONVERT(DATE, STR(MIHday) + '-' + STR(MIHmonth) + '-' + STR(MIHyear), 103) AS MIHdate FROM MIH WHERE MIHvnos IN (SELECT CPSvnosID FROM CPS WHERE CPSclearALL = 0 AND CPScusID = ? GROUP BY CPSvnosID) ORDER BY MIHvnos", array($code));

    // 2. SO รออนุมัติ
    $soPendRows = p013lFetch($pdo, "SELECT MIHvnos, CONVERT(DATE, STR(MIHday) + '-' + STR(MIHmonth) + '-' + STR(MIHyear), 103) AS MIHdate FROM MIH WHERE MIHcus = ? AND MIHstatus = 20 AND MIHtype = 'PS' ORDER BY MIHvnos", array($code));

    // 3. RSV
    $rsvRows = p013lFetch($pdo, "SELECT MIHvnos, CONVERT(DATE, STR(MIHday) + '-' + STR(MIHmonth) + '-' + STR(MIHyear), 103) AS MIHdate FROM MIH WHERE MIHvnos LIKE 'RSV%' AND MIHcancel = 0 AND MIHtype = 'SS' AND MIHcus = ? ORDER BY MIHvnos", array($code));

    // 4. CN — TOP 4 (วันใหม่สุด)
    $cnRows = p013lFetch($pdo, "SELECT TOP 4 CONVERT(DATE, STR(MIHday) + '/' + STR(MIHmonth) + '/' + STR(MIHyear), 103) AS MIHdate, MIHvnos FROM MIH WHERE MIHtype = 'BS' AND MIHcus = ? AND MIHcancel = 0 ORDER BY CONVERT(DATE, STR(MIHday) + '/' + STR(MIHmonth) + '/' + STR(MIHyear), 103) DESC", array($code));
} catch (PDOException $e) {
    p013lError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p013lMap($rows) {
    $out = array();
    foreach ($rows as $r) {
        $out[] = array(
            'no' => (string) ($r['MIHvnos'] ?? ''),
            'date' => p013lDate($r['MIHdate'] ?? null)
        );
    }
    return $out;
}

echo json_encode(array(
    'ok' => true,
    'lists' => array(
        'soAppr' => p013lMap($soApprRows),
        'soPend' => p013lMap($soPendRows),
        'rsv' => p013lMap($rsvRows),
        'cn' => p013lMap($cnRows)
    )
), JSON_UNESCAPED_UNICODE);
