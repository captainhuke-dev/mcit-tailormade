<?php
/**
 * P071 — บันทึกจำนวนพิมพ์ (MIHprintN +1) ของ Invoice พิเศษที่เลือก
 * เรียกเมื่อกดปุ่ม "🖨 พิมพ์ทั้งหมด" ในหน้า report P071
 * คัดลอกจาก api/p069_markprint.php (P071 อย่างไรก็ใช้ไฟล์ของตัวเอง ไม่กระทบ P069)
 *
 * รองรับทั้ง SQL Server (ISNULL) และ MySQL (IFNULL) — เช็ค driver จาก PDO
 */

require __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function markError($message)
{
    echo json_encode(array('ok' => false, 'message' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    markError('request body ต้องเป็น JSON');
}

$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$ids = isset($input['invoiceIds']) ? $input['invoiceIds'] : array();

if ($connectionId === '') {
    markError('กรุณาส่ง connectionId');
}
if (!is_array($ids) || count($ids) === 0) {
    markError('กรุณาส่ง invoiceIds (อย่างน้อย 1 รายการ)');
}
if (count($ids) > 50) {
    markError('บันทึกได้สูงสุด 50 รายการต่อครั้ง');
}

// รับเฉพาะ string — prepared statement กัน injection
$cleanIds = array();
foreach ($ids as $id) {
    if (!is_string($id)) {
        markError('invoiceIds ทุกตัวต้องเป็น string');
    }
    $id = trim($id);
    if ($id !== '') {
        $cleanIds[] = $id;
    }
}
if (count($cleanIds) === 0) {
    markError('invoiceIds ว่างทั้งหมด');
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    markError('เชื่อมต่อฐานข้อมูลไม่สำเร็จ: ' . $e->getMessage());
}

// syntax ตาม driver — SQL Server = ISNULL, MySQL = IFNULL
$driver = strtolower((string) $pdo->getAttribute(PDO::ATTR_DRIVER_NAME));
$coalesce = ($driver === 'mysql') ? 'IFNULL' : 'ISNULL';

$sql = "UPDATE MIH SET MIHprintN = " . $coalesce . "(MIHprintN, 0) + 1 WHERE MIHvnos = ?";

$updated = array();
$notFound = array();
$stmt = $pdo->prepare($sql);
foreach ($cleanIds as $id) {
    $stmt->execute(array($id));
    if ($stmt->rowCount() > 0) {
        $updated[] = $id;
    } else {
        $notFound[] = $id;
    }
}

echo json_encode(array(
    'ok' => true,
    'updated' => $updated,
    'count' => count($updated),
    'notFound' => $notFound
), JSON_UNESCAPED_UNICODE);
