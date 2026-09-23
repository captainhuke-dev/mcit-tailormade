<?php
/**
 * ทดสอบการเชื่อมต่อ DB ด้วย PDO (ใช้ร่วมกัน: test_connection.php + connections.php)
 * คืนค่า: array(ok:bool, message:string, driver:?string)
 */
function pdoTest($type, $server, $database, $user, $password)
{
    if ($server === '') {
        return array('ok' => false, 'message' => 'ยังไม่ได้ระบุ Server', 'driver' => null);
    }
    if (!class_exists('PDO')) {
        return array('ok' => false, 'message' => 'PHP ไม่ได้ติดตั้ง PDO', 'driver' => null);
    }

    // แยก host / port (รองรับ host:port และ host,port)
    $host = $server;
    $port = null;
    if (strpos($server, ':') !== false) {
        $parts = explode(':', $server, 2);
        $host = $parts[0];
        $port = $parts[1];
    }
    if ($port !== null && strpos($port, ',') !== false) {
        $port = explode(',', $port, 2)[0];
    }
    $port = ($port === null || $port === '') ? null : (int) $port;
    if ($port === null) {
        $port = ($type === 'mysql') ? 3306 : ($type === 'postgresql' ? 5432 : 1433);
    }

    $drivers = PDO::getAvailableDrivers();
    $dsn = '';
    $label = '';

    switch ($type) {
        case 'mysql':
            if (!in_array('mysql', $drivers)) {
                return array('ok' => false, 'message' => 'PHP ยังไม่ติดตั้ง driver pdo_mysql (PHP ที่ใช้ทดสอบเชื่อมต่อ MySQL ไม่ได้)', 'driver' => null);
            }
            $dsn = 'mysql:host=' . $host . ';port=' . $port . ($database !== '' ? ';dbname=' . $database : '');
            $label = 'pdo_mysql';
            break;

        case 'postgresql':
            if (!in_array('pgsql', $drivers)) {
                return array('ok' => false, 'message' => 'PHP ยังไม่ติดตั้ง driver pdo_pgsql (PHP ที่ใช้ทดสอบเชื่อมต่อ PostgreSQL ไม่ได้)', 'driver' => null);
            }
            $dsn = 'pgsql:host=' . $host . ';port=' . $port . ($database !== '' ? ';dbname=' . $database : '');
            $label = 'pdo_pgsql';
            break;

        case 'sqlserver':
            if (in_array('sqlsrv', $drivers)) {
                $dsn = 'sqlsrv:Server=' . $host . ',' . $port . ($database !== '' ? ';Database=' . $database : '') . ';TrustServerCertificate=true';
                $label = 'pdo_sqlsrv';
            } elseif (in_array('dblib', $drivers)) {
                $dsn = 'dblib:host=' . $host . ',' . $port . ($database !== '' ? ';dbname=' . $database : '');
                $label = 'pdo_dblib';
            } else {
                return array('ok' => false, 'message' => 'PHP ยังไม่ติดตั้ง driver SQL Server (pdo_sqlsrv หรือ pdo_dblib) — ต้องติดตั้ง extension ก่อนจึงทดสอบได้', 'driver' => null);
            }
            break;

        default:
            return array('ok' => false, 'message' => 'ชนิดการเชื่อมต่อไม่ถูกต้อง', 'driver' => null);
    }

    try {
        $opts = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
        // ATTR_TIMEOUT ไม่ support ใน driver sqlsrv — ส่งเฉพาะ mysql/pgsql
        if ($type !== 'sqlserver') {
            $opts[PDO::ATTR_TIMEOUT] = 6;
        }
        $pdo = new PDO($dsn, $user, $password, $opts);
        $version = (string) $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
        $msg = $version !== '' ? 'เวอร์ชัน ' . substr($version, 0, 40) : '';
        return array('ok' => true, 'message' => $msg, 'driver' => $label);
    } catch (PDOException $e) {
        return array('ok' => false, 'message' => $e->getMessage(), 'driver' => $label);
    }
}
