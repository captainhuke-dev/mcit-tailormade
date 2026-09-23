<?php
/**
 * P128 — TMS View Picture V3
 * POST JSON: { date: "2026-09-08", invoiceId: "", truckLicense: "" }
 * ใช้ MySQL connection Nas200 เป็นค่าเริ่มต้น
 */
require __DIR__ . '/lib/db.php';
header('Content-Type: application/json; charset=utf-8');

function p128Error($message, $status = 400)
{
    http_response_code($status);
    echo json_encode(array('ok' => false, 'message' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    p128Error('request body ต้องเป็น JSON');
}

$date = isset($in['date']) ? trim((string) $in['date']) : '';
$invoiceId = isset($in['invoiceId']) ? trim((string) $in['invoiceId']) : '';
$truckLicense = isset($in['truckLicense']) ? trim((string) $in['truckLicense']) : '';
$connId = isset($in['connectionId']) && trim((string) $in['connectionId']) !== ''
    ? trim((string) $in['connectionId'])
    : 'c1788855932701'; // Nas200

if ($date === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    p128Error('กรุณาระบุวันที่ในรูปแบบ YYYY-MM-DD');
}

try {
    $pdo = getDb($connId);
    // เทียบเท่า SQL ที่ผู้ใช้กำหนด (P128 จัดส่ง: tms_receive = 0):
    // SELECT * FROM tms_mobile
    // WHERE tms_date = ? AND tms_invoice_id LIKE ?
    // AND tms_truck_license LIKE ? AND tms_receive = 0
    $sql = "SELECT * FROM tms_mobile
            WHERE tms_date = ?
              AND tms_invoice_id LIKE ?
              AND tms_truck_license LIKE ?
              AND tms_receive = 0
            ORDER BY tms_date, tms_invoice_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(array($date, '%' . $invoiceId . '%', '%' . $truckLicense . '%'));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array(
        'ok' => true,
        'connectionId' => $connId,
        'count' => count($rows),
        'documents' => $rows
    ), JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    p128Error('Query ไม่สำเร็จ: ' . $e->getMessage(), 500);
} catch (RuntimeException $e) {
    p128Error($e->getMessage(), 500);
}
