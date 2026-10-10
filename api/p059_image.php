<?php
/**
 * P059 — จัดเก็บเอกสารลูกค้า — image proxy
 * ดึงภาพจาก FTP NAS 192.168.0.200/web/PO/{filename} (clone C# NAS_IP/PO + ftp uploadFtp)
 * GET ?f={filename} — filename = basename เท่านั้น (ป้องกัน path traversal)
 * ใช้ curl (ftp://) — PHP ftp extension ไม่ load ใน web
 */

$filename = isset($_GET['f']) ? $_GET['f'] : '';
// อนุญาตเฉพาะ basename — ห้าม / \ ..
if ($filename === '' || strpos($filename, '/') !== false || strpos($filename, '\\') !== false || strpos($filename, '..') !== false) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'filename invalid';
    exit;
}

$ftpUrl = 'ftp://192.168.0.200/web/PO/' . $filename;

$ch = curl_init($ftpUrl);
curl_setopt_array($ch, array(
    CURLOPT_USERPWD => 'ftp_user:9BLl_ihe',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
));
$data = curl_exec($ch);
$err = curl_error($ch);
$code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);

if ($data === false || $code !== 226) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'image not found: ' . htmlspecialchars($filename);
    exit;
}

// content-type ตาม extension
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
$types = array(
    'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
    'png' => 'image/png', 'gif' => 'image/gif', 'bmp' => 'image/bmp', 'webp' => 'image/webp'
);
$ct = isset($types[$ext]) ? $types[$ext] : 'application/octet-stream';

header('Content-Type: ' . $ct);
header('Content-Length: ' . strlen($data));
header('Cache-Control: private, max-age=86400');
echo $data;
