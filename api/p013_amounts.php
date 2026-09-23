<?php
/**
 * P013 — รายงานใบอนุมัติวงเงิน: ยอดเงิน (Row 2-4 + ตาราง 5 header)
 * POST { connectionId, code, doc }
 * MAC5 (SQL Server) — CPS, CFS, MIH, CHQ
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013aError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013aError('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013aError('ต้องระบุ connectionId');

$code = isset($input['code']) ? trim((string) $input['code']) : '';
$doc = isset($input['doc']) ? trim((string) $input['doc']) : '';
if ($code === '') p013aError('ต้องระบุ code');

$pdo = getDb($connectionId);
if (!$pdo) {
    p013aError('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

function p013aSum($pdo, $sql, $params) {
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $v = $stmt->fetchColumn();
        return is_numeric($v) ? (float) $v : 0.0;
    } catch (PDOException $e) {
        return 0.0;
    }
}

try {
    // 1. CPS — ยอดค้างส่ง
    $cps = p013aSum($pdo, "SELECT SUM(CPSsumREQ - CPSsumCUT1) FROM CPS WHERE CPScusID = ? AND CPSsumREQ > CPSsumCUT1 AND CPSclearALL = '0'", array($code));

    // 2. CFS — หนี้ค้างชำระ
    $cfs = p013aSum($pdo, "SELECT SUM(CFSsumREQ - CFSsumCUT1) FROM [dbo].[CFS] WHERE CFScusID = ? AND CFSclearALL = 0", array($code));

    // 3. SO — ยอดสั่งขายปัจจุบัน (เลขที่ใบสำคัญที่เลือก)
    $so = 0.0;
    $soNo = '';
    $soDesc = '';
    $soNotes = '';
    if ($doc !== '') {
        try {
            $stmt = $pdo->prepare("SELECT MIHvnos, MIHnetSUM, MIHdesc, MIHnotes, MIHprintN, MIHkeyDate, MIHkeyUser FROM MIH WHERE MIHvnos = ?");
            $stmt->execute(array($doc));
            $r = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($r) {
                $soNo = (string) ($r['MIHvnos'] ?? '');
                $so = is_numeric($r['MIHnetSUM']) ? (float) $r['MIHnetSUM'] : 0.0;
                $soDesc = (string) ($r['MIHdesc'] ?? '');
                $soNotes = (string) ($r['MIHnotes'] ?? '');
            }
        } catch (PDOException $e) { /* keep 0 */ }
    }

    // 4. CHQ — เช็ครอชำระ
    $chq = p013aSum($pdo, "SELECT SUM(CHQtotal) FROM CHQ WHERE CHQcus = ? AND CHQstatus = 0 AND CHQstatusN = 1", array($code));

    // 5. SOall — ยอดสั่งขายสะสม
    $soall = p013aSum($pdo, "SELECT SUM(MIHnetSUM) FROM MIH WHERE MIHcus = ? AND MIHstatus = 20", array($code));

    // 6. RSV — ยอด RSV
    $rsv = p013aSum($pdo, "SELECT SUM(MIHnetSUM) FROM MIH WHERE MIHvnos LIKE 'RSV%' AND MIHcancel = 0 AND MIHtype = 'SS' AND MIHcus = ?", array($code));

    // 7. CHQ-Return — ยอดเช็คคืนค้างชำระ
    $chqReturn = p013aSum($pdo, "SELECT SUM(CFSsumREQ - CFSsumCUT1) FROM CFS WHERE CFSclearALL = 0 AND CFSvnosID LIKE 'CBA%' AND CFScusID = ?", array($code));
} catch (PDOException $e) {
    p013aError('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

echo json_encode(array(
    'ok' => true,
    'amounts' => array(
        'cps' => $cps,
        'cfs' => $cfs,
        'so' => $so,
        'soNo' => $soNo,
        'soDesc' => $soDesc,
        'soNotes' => $soNotes,
        'chq' => $chq,
        'soall' => $soall,
        'rsv' => $rsv,
        'chqReturn' => $chqReturn
    )
), JSON_UNESCAPED_UNICODE);
