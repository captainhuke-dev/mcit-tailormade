<?php
/**
 * P128 — บันทึกรับเอกสาร (TMS View Picture จัดส่ง)
 *
 * POST JSON:
 *   { action: "get",  connectionId: <MAC5>, invoiceId: "IVN..." }
 *       → SELECT MIHmemo FROM MIH WHERE MIHvnos = ?
 *         ตอบ: { ok, memo, found }
 *
 *   { action: "save", connectionId: <MAC5>, nasConnectionId: <Nas200>,
 *     invoiceId: "IVN...", id: <int>, memo: "<= 255 chars>" }
 *       → UPDATE MIH SET MIHmemo=?, MIHstatus='70', MIHkeyUser='SYS',
 *                      MIHkeyDate=NOW() WHERE MIHvnos=?
 *         + UPDATE tms_mobile SET tms_receive=1 WHERE id=?
 *         ตอบ: { ok, received: true }
 */
require __DIR__ . '/lib/db.php';
header('Content-Type: application/json; charset=utf-8');

function p128ReceiveError($message, $status = 400)
{
    http_response_code($status);
    echo json_encode(array('ok' => false, 'message' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    p128ReceiveError('request body ต้องเป็น JSON');
}

$action = isset($in['action']) ? trim((string) $in['action']) : '';
$macConnId = isset($in['connectionId']) ? trim((string) $in['connectionId']) : '';
$invoiceId = isset($in['invoiceId']) ? trim((string) $in['invoiceId']) : '';

if ($macConnId === '') {
    p128ReceiveError('ไม่มีข้อมูลฐานข้อมูล MAC5 — ตรวจสอบการตั้งค่า connection');
}
if ($invoiceId === '') {
    p128ReceiveError('ไม่มีเลขใบสำคัญ');
}

if ($action === 'get') {
    try {
        $pdo = getDb($macConnId);
        $stmt = $pdo->prepare('SELECT MIHmemo FROM MIH WHERE MIHvnos = ?');
        $stmt->execute(array($invoiceId));
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row === false) {
            echo json_encode(array(
                'ok' => true,
                'found' => false,
                'message' => 'ไม่พบเลขใบสำคัญ "' . $invoiceId . '" ในฐานข้อมูล MAC5'
            ), JSON_UNESCAPED_UNICODE);
            exit;
        }
        echo json_encode(array(
            'ok' => true,
            'found' => true,
            'memo' => $row['MIHmemo'] === null ? '' : (string) $row['MIHmemo']
        ), JSON_UNESCAPED_UNICODE);
    } catch (PDOException $e) {
        p128ReceiveError('ค้นหาข้อมูลไม่สำเร็จ: ' . $e->getMessage(), 500);
    } catch (RuntimeException $e) {
        p128ReceiveError($e->getMessage(), 500);
    }
    exit;
}

if ($action !== 'save') {
    p128ReceiveError('action ต้องเป็น "get" หรือ "save"');
}

$nasConnId = isset($in['nasConnectionId']) ? trim((string) $in['nasConnectionId']) : 'c1788855932701'; // Nas200
$id = isset($in['id']) ? (int) $in['id'] : 0;
$memo = isset($in['memo']) ? (string) $in['memo'] : '';

if ($id <= 0) {
    p128ReceiveError('id ไม่ถูกต้อง');
}
if (mb_strlen($memo) > 255) {
    p128ReceiveError('ข้อความยาวเกิน 255 ตัวอักษร');
}

try {
    // 1) MAC5 — UPDATE MIH
    $mac = getDb($macConnId);
    $stmt = $mac->prepare(
        "UPDATE MIH
         SET MIHmemo = ?, MIHstatus = '70', MIHkeyUser = 'SYS', MIHkeyDate = GETDATE()
         WHERE MIHvnos = ?"
    );
    $stmt->execute(array($memo, $invoiceId));
    if ($stmt->rowCount() === 0) {
        p128ReceiveError('ไม่พบเลขใบสำคัญ "' . $invoiceId . '" ในฐานข้อมูล MAC5', 404);
    }

    // 2) Nas200 — UPDATE tms_mobile (tms_receive = 1)
    $nas = getDb($nasConnId);
    $stmt = $nas->prepare('UPDATE tms_mobile SET tms_receive = 1 WHERE id = ?');
    $stmt->execute(array($id));
    if ($stmt->rowCount() === 0) {
        p128ReceiveError('ข้อมูล MAC5 บันทึกแล้ว แต่จัดการสถานะ Nas200 ไม่สำเร็จ — ตรวจสอบอีกครั้ง', 500);
    }

    echo json_encode(array('ok' => true, 'received' => true, 'id' => $id), JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    p128ReceiveError('บันทึกไม่สำเร็จ: ' . $e->getMessage(), 500);
} catch (RuntimeException $e) {
    p128ReceiveError($e->getMessage(), 500);
}
