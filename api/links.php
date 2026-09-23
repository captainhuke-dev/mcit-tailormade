<?php
/**
 * API: จัดการลิงก์/URL ที่ตั้งค่า (เก็บใน data/links.json)
 *
 * GET  → {ok:true, links:[...]}
 * POST {action:"save", name, url, id?}   → เพิ่ม (ไม่ส่ง id) หรือแก้ไข (ส่ง id)
 * POST {action:"delete", id:"l..."}      → ลบ
 *
 * ทุก response: {ok:bool, message?:string, link?}
 */
header('Content-Type: application/json; charset=utf-8');

$CONFIG_FILE = __DIR__ . '/../data/links.json';

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
function writeLinks($path, $list)
{
    $tmp = $path . '.tmp';
    $data = json_encode($list, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    if (file_put_contents($tmp, $data, LOCK_EX) === false) {
        return false;
    }
    return rename($tmp, $path);
}

// ตรวจสอบว่า URL ใช้ได้ (ต้องเป็น http(s))
function validUrl($url)
{
    return filter_var($url, FILTER_VALIDATE_URL) !== false
        && in_array(parse_url($url, PHP_URL_SCHEME), array('http', 'https'), true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    out(true, null, array('links' => $list));
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
    foreach ($list as $item) {
        if ($item['id'] === $id) {
            $found = true;
            $deletedName = isset($item['name']) ? $item['name'] : $id;
        } else {
            $remaining[] = $item;
        }
    }
    if (!$found) {
        out(false, 'ไม่พบลิงก์ id นี้');
    }
    if (!writeLinks($CONFIG_FILE, $remaining)) {
        out(false, 'บันทึกไฟล์ไม่สำเร็จ (ตรวจสอบสิทธิ์เขียน)');
    }
    out(true, 'ลบ "' . $deletedName . '" แล้ว');
}

// ---------- SAVE (create / update) ----------
$name = isset($in['name']) ? trim($in['name']) : '';
$url = isset($in['url']) ? trim($in['url']) : '';
if ($name === '') {
    out(false, 'กรุณาตั้งชื่อลิงก์');
}
if ($url === '') {
    out(false, 'กรุณากรอก URL');
}
if (!validUrl($url)) {
    out(false, 'URL ไม่ถูกต้อง — ต้องเป็น http:// หรือ https://');
}

$incomingId = isset($in['id']) ? $in['id'] : '';

$item = array(
    'id'    => $incomingId !== '' ? $incomingId : 'l' . (int) (microtime(true) * 1000),
    'name'  => $name,
    'url'   => $url,
    'desc'  => isset($in['desc']) ? trim($in['desc']) : '',
);
$item['updatedAt'] = date('c');

$updated = false;
for ($i = 0; $i < count($list); $i++) {
    if ($list[$i]['id'] === $item['id']) {
        if (!isset($item['createdAt']) || $item['createdAt'] === '') {
            $item['createdAt'] = isset($list[$i]['createdAt']) ? $list[$i]['createdAt'] : date('c');
        }
        $list[$i] = $item;
        $updated = true;
        break;
    }
}
if (!$updated) {
    $item['createdAt'] = date('c');
    $list[] = $item;
}

if (!writeLinks($CONFIG_FILE, $list)) {
    out(false, 'บันทึกไฟล์ไม่สำเร็จ (ตรวจสอบสิทธิ์เขียนของ data/links.json)');
}

out(true, $updated ? 'บันทึกแล้ว' : 'สร้างแล้ว', array('link' => $item));
