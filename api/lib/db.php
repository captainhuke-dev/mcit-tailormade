<?php
/**
 * เปิดการเชื่อมต่อฐานข้อมูลจาก data/connections.json (ใช้ร่วมกัน)
 * การใช้งาน: $pdo = getDb('c1788406814359');
 */

$CONFIG_FILE = dirname(dirname(__DIR__)) . '/data/connections.json';

function getDbConfig($connId)
{
    global $CONFIG_FILE;
    if (!file_exists($CONFIG_FILE)) {
        return null;
    }
    $list = json_decode(file_get_contents($CONFIG_FILE), true);
    if (!is_array($list)) {
        return null;
    }
    foreach ($list as $conn) {
        if (isset($conn['id']) && $conn['id'] === $connId) {
            return $conn;
        }
    }
    return null;
}

function getDb($connId)
{
    $conn = getDbConfig($connId);
    if (!$conn) {
        throw new RuntimeException('ไม่พบการเชื่อมต่อ "' . $connId . '" ใน data/connections.json');
    }
    if (!class_exists('PDO')) {
        throw new RuntimeException('PHP ไม่ได้ติดตั้ง PDO');
    }

    // แยก host / port (รองรับ host:port และ host,port)
    $host = $conn['server'];
    $port = null;
    if (strpos($host, ':') !== false) {
        $parts = explode(':', $host, 2);
        $host = $parts[0];
        $port = $parts[1];
    }
    if ($port !== null && strpos($port, ',') !== false) {
        $port = explode(',', $port, 2)[0];
    }
    $port = ($port === null || $port === '') ? null : (int) $port;
    if ($port === null) {
        $type = isset($conn['type']) ? $conn['type'] : '';
        $port = ($type === 'mysql') ? 3306 : ($type === 'postgresql' ? 5432 : 1433);
    }

    $type = isset($conn['type']) ? $conn['type'] : 'sqlserver';
    $database = isset($conn['database']) ? $conn['database'] : '';

    if ($type === 'mysql') {
        $dsn = 'mysql:host=' . $host . ';port=' . $port . ($database !== '' ? ';dbname=' . $database : '');
    } elseif ($type === 'postgresql') {
        $dsn = 'pgsql:host=' . $host . ';port=' . $port . ($database !== '' ? ';dbname=' . $database : '');
    } else { // sqlserver
        $dsn = 'sqlsrv:Server=' . $host . ',' . $port . ($database !== '' ? ';Database=' . $database : '') . ';TrustServerCertificate=true';
    }

    $opts = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
    // ATTR_TIMEOUT ไม่ support ใน driver sqlsrv — ส่งเฉพาะ mysql/pgsql
    if ($type !== 'sqlserver') {
        $opts[PDO::ATTR_TIMEOUT] = 10;
    }
    return new PDO($dsn, $conn['user'], $conn['password'], $opts);
}
