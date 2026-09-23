<?php
/**
 * API: จัดการรายการการเชื่อมต่อ (เก็บใน data/connections.json)
 *
 * GET  → {ok:true, connections:[...]}  (ไม่ส่ง password กลับ — มี hasPassword แทน)
 * POST {action:"save", ...fields}      → เพิ่ม (ไม่ส่ง id) หรือ แก้ไข (ส่ง id)
 * POST {action:"delete", id:"c..."}    → ลบ
 *
 * ทุก response: {ok:bool, message?:string, connection?}
 */
require __DIR__ . '/lib/pdo_test.php';
header('Content-Type: application/json; charset=utf-8');

$CONFIG_FILE = __DIR__ . '/../data/connections.json';

function out($ok, $message = null, $extra = array())
{
    $r = array('ok' => $ok);
    if ($message !== null) {
        $r['message'] = $message;
    }
    foreach ($extra as $k => $v) {
        $r[$k] = $v;
    }
    echo json_encode($r, JSON_UNESCAPED_UNICODE);
    exit;
}

// อ่านไฟล์ (สร้างถ้ายังไม่มี)
if (!file_exists($CONFIG_FILE)) {
    file_put_contents($CONFIG_FILE, "[]\n", FILE_APPEND | LOCK_EX);
}
$raw = file_get_contents($CONFIG_FILE);
$list = json_decode($raw === false ? '' : $raw, true);
if (!is_array($list)) {
    $list = array();
}

// เขียนไฟล์แบบ atomic (temp + rename) — กันไฟล์เสียหายขณะเขียน
function writeConfig($path, $list)
{
    $tmp = $path . '.tmp';
    $data = json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    if (file_put_contents($tmp, $data, LOCK_EX) === false) {
        return false;
    }
    return rename($tmp, $path);
}

// ซ่อน password ใน response
function publicConn($conn)
{
    $hasPassword = !empty($conn['password']);
    unset($conn['password']);
    $conn['hasPassword'] = $hasPassword;
    return $conn;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    out(true, null, array('connections' => array_map('publicConn', $list)));
}

if ($method !== 'POST') {
    out(false, 'ใช้ GET หรือ POST เท่านั้น');
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    out(false, 'ข้อมูลที่ได้รับไม่ถูกต้อง (ต้องเป็น JSON)');
}

$action = isset($in['action']) ? $in['action'] : 'save';

// ---------- DELETE ----------
if ($action === 'delete') {
    $id = isset($in['id']) ? $in['id'] : '';
    if ($id === '') {
        out(false, 'ไม่ระบุ id');
    }
    $remaining = array();
    $found = false;
    $deletedName = null;
    foreach ($list as $conn) {
        if ($conn['id'] === $id) {
            $found = true;
            $deletedName = isset($conn['name']) ? $conn['name'] : $id;
        } else {
            $remaining[] = $conn;
        }
    }
    if (!$found) {
        out(false, 'ไม่พบการเชื่อมต่อ id นี้');
    }
    if (!writeConfig($CONFIG_FILE, $remaining)) {
        out(false, 'บันทึกไฟล์ไม่สำเร็จ (ตรวจสอบสิทธิ์เขียน)');
    }
    out(true, 'ลบ "' . $deletedName . '" แล้ว');
}

// ---------- TEST (เซิร์ฟเวอร์ทดสอบเอง — ไม่ต้องส่งรหัสผ่าน network) ----------
if ($action === 'test') {
    $id = isset($in['id']) ? $in['id'] : '';
    if ($id === '') {
        out(false, 'ไม่ระบุ id');
    }
    $target = null;
    foreach ($list as $item) {
        if ($item['id'] === $id) {
            $target = $item;
            break;
        }
    }
    if (!$target) {
        out(false, 'ไม่พบการเชื่อมต่อ id นี้');
    }
    if (empty($target['password'])) {
        out(false, 'รายการนี้ไม่มีรหัสผ่านบันทึกไว้ — กรอกรหัสผ่านในฟอร์มด้านบนแล้วกดบันทึกก่อน');
    }
    $result = pdoTest($target['type'], $target['server'], $target['database'], $target['user'], $target['password']);
    out($result['ok'], $result['message'], $result['driver'] ? array('driver' => $result['driver']) : array());
}

// ---------- SAVE (create / update) ----------
$required = array('name', 'server', 'type');
foreach ($required as $field) {
    if (!isset($in[$field]) || trim($in[$field]) === '') {
        out(false, 'ขาดข้อมูล: ' . $field);
    }
}

// password ว่าง + เป็น update = รับรหัสเดิม (แก้ชื่อ/เซิร์ฟเวอร์โดยไม่งอกรหัสใหม่)
$keepOldPassword = false;
$incomingId = isset($in['id']) ? $in['id'] : '';
$incomingPassword = isset($in['password']) ? $in['password'] : '';

if ($incomingId !== '' && $incomingPassword === '') {
    foreach ($list as $conn) {
        if ($conn['id'] === $incomingId) {
            $keepOldPassword = !empty($conn['password']);
            break;
        }
    }
}

$conn = array(
    'id'       => $incomingId !== '' ? $incomingId : 'c' . (int) (microtime(true) * 1000),
    'name'     => trim($in['name']),
    'type'     => trim($in['type']),
    'server'   => trim($in['server']),
    'database' => isset($in['database']) ? trim($in['database']) : '',
    'user'     => isset($in['user']) ? trim($in['user']) : '',
    'password' => $keepOldPassword ? '' : $incomingPassword,
);
$conn['updatedAt'] = date('c');

$updated = false;
for ($i = 0; $i < count($list); $i++) {
    if ($list[$i]['id'] === $conn['id']) {
        if ($keepOldPassword) {
            $conn['password'] = $list[$i]['password'];
        }
        if (!isset($conn['createdAt']) || $conn['createdAt'] === '') {
            $conn['createdAt'] = isset($list[$i]['createdAt']) ? $list[$i]['createdAt'] : date('c');
        }
        $list[$i] = $conn;
        $updated = true;
        break;
    }
}
if (!$updated) {
    $conn['createdAt'] = date('c');
    $list[] = $conn;
}

if (!writeConfig($CONFIG_FILE, $list)) {
    out(false, 'บันทึกไฟล์ไม่สำเร็จ (ตรวจสอบสิทธิ์เขียนของ data/connections.json)');
}

out(true, $updated ? 'บันทึกแล้ว' : 'สร้างแล้ว', array('connection' => publicConn($conn)));
