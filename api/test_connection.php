<?php
/**
 * API: ทดสอบการเชื่อมต่อฐานข้อมูล (จากค่าที่กรอกในฟอร์ม)
 * รับ POST JSON: {type: mysql|sqlserver|postgresql, server, database, user, password}
 *   server รองรับ "host" หรือ "host:port"
 * ตอบกลับ JSON: {ok: bool, message: string, driver?: string}
 */
require __DIR__ . '/lib/pdo_test.php';

header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    echo json_encode(array('ok' => false, 'message' => 'ข้อมูลที่ได้รับไม่ถูกต้อง (ต้องเป็น JSON)'), JSON_UNESCAPED_UNICODE);
    exit;
}

$type     = isset($in['type']) ? $in['type'] : '';
$server   = isset($in['server']) ? trim($in['server']) : '';
$database = isset($in['database']) ? trim($in['database']) : '';
$user     = isset($in['user']) ? $in['user'] : '';
$password = isset($in['password']) ? $in['password'] : '';

if ($server === '') {
    echo json_encode(array('ok' => false, 'message' => 'ยังไม่ได้ระบุ Server'), JSON_UNESCAPED_UNICODE);
    exit;
}

$result = pdoTest($type, $server, $database, $user, $password);
echo json_encode($result, JSON_UNESCAPED_UNICODE);
