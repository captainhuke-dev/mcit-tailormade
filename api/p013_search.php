<?php
/**
 * P013 — Tab 1 รายการรออนุมัติสั่งขาย (ปุ่มค้นหา)
 * POST { connectionId, from, to, creator, customer }
 * MAC5 (SQL Server) — DEB + MIH (MIHstatus=20, MIHtype='PS')
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p013Error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) p013Error('request ไม่ถูกต้อง');

$connectionId = isset($input['connectionId']) ? trim((string) $input['connectionId']) : '';
if ($connectionId === '') p013Error('ต้องระบุ connectionId');

$from = isset($input['from']) ? trim((string) $input['from']) : '';
$to = isset($input['to']) ? trim((string) $input['to']) : '';
$creator = isset($input['creator']) ? trim((string) $input['creator']) : '';
$customer = isset($input['customer']) ? trim((string) $input['customer']) : '';

// แปลง YYYY-MM-DD → YYYY/MM/DD (format 103)
function p013Date103($v) {
    if ($v === '') return '';
    $ts = strtotime($v);
    return $ts ? date('Y/m/d', $ts) : '';
}

$from103 = p013Date103($from);
$to103 = p013Date103($to);

$pdo = getDb($connectionId);
if (!$pdo) {
    p013Error('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection', 500);
}

try {
    $params = array();
    $wheres = array(
        "MIH.MIHstatus = 20",
        "MIH.MIHtype = 'PS'"
    );

    if ($from103 !== '' && $to103 !== '') {
        $params[] = $from103;
        $params[] = $to103;
        $wheres[] = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) BETWEEN ? AND ?";
    } elseif ($from103 !== '') {
        $params[] = $from103;
        $wheres[] = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) >= ?";
    } elseif ($to103 !== '') {
        $params[] = $to103;
        $wheres[] = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) <= ?";
    }

    if ($creator !== '') {
        $params[] = '%' . $creator . '%';
        $wheres[] = "MIH.MIHkeyUser LIKE ?";
    }
    if ($customer !== '') {
        $params[] = '%' . $customer . '%';
        $wheres[] = "DEB.DEBnameT LIKE ?";
    }

    $sql = "SELECT
        CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) AS MIHdate,
        MIH.MIHvnos,
        DEB.DEBcode,
        DEB.DEBnameT,
        MIH.MIHnotes,
        MIH.MIHnetSUM,
        MIH.MIHprintN,
        MIH.MIHkeyUser,
        MIH.MIHkeyDate
    FROM DEB
    INNER JOIN MIH ON MIH.MIHcus = DEB.DEBcode
    WHERE " . implode(" AND ", $wheres) . "
    ORDER BY MIHvnos";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    p013Error('query ไม่สำเร็จ: ' . $e->getMessage(), 500);
}

function p013Date($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('Y-m-d', $ts) : '';
}

function p013DateTime($v) {
    if (!$v) return '';
    $ts = strtotime($v);
    return $ts ? date('d/m/Y H:i:s', $ts) : '';
}

$items = array();
foreach ($rows as $row) {
    $items[] = array(
        'date' => p013Date($row['MIHdate'] ?? null),
        'doc' => (string) ($row['MIHvnos'] ?? ''),
        'code' => (string) ($row['DEBcode'] ?? ''),
        'name' => (string) ($row['DEBnameT'] ?? ''),
        'note' => (string) ($row['MIHnotes'] ?? ''),
        'amount' => (float) ($row['MIHnetSUM'] ?? 0),
        'printN' => (int) ($row['MIHprintN'] ?? 0),
        'keyUser' => (string) ($row['MIHkeyUser'] ?? ''),
        'keyDate' => p013DateTime($row['MIHkeyDate'] ?? null)
    );
}

echo json_encode(array('ok' => true, 'rows' => $items, 'machine' => php_uname('n')), JSON_UNESCAPED_UNICODE);
