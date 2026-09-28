<?php
/**
 * P037 — ตรวจสอบของจองที่มีการเปิดบิล (search)
 * POST { connectionId, date (yyyy-mm-dd), type (IVV/IVN/'' = IVV), cus, vnos, dep }
 * MAC5 (SQL Server) — ตาม C# FrmINVGUI.button1_Click:
 *   INV = MIH (type IS, vnos LIKE type%) + DEB + IC_S — วัน/เดือน/ปี = วันที่ค้นหา
 *         + filter cus (exact) / vnos (exact) / dep (LIKE)
 *   RSV = MIH (type SS, vnos LIKE RSV%) + DEB + IC_S — cancel=0 + status != 4
 *         + เดือน/ปีเดียวกัน + MIHcus IN (ลูกค้าจาก INV)
 * Response: { ok, inv: [{date,cus,name,vnos,status,dep}], rsv: [...same+desc,notes] }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$date = isset($input['date']) ? trim($input['date']) : '';
$type = isset($input['type']) ? trim($input['type']) : 'IVV';
$cus = isset($input['cus']) ? trim($input['cus']) : '';
$vnos = isset($input['vnos']) ? trim($input['vnos']) : '';
$dep = isset($input['dep']) ? trim($input['dep']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($date === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'date must be yyyy-mm-dd'));
    exit;
}
if ($type !== '' && !preg_match('/^[A-Z]{3}$/', $type)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid type'));
    exit;
}
if ($type === '') {
    $type = 'IVV';
}
// vnos filter — alphanumeric + dash only (C# = exact match)
if ($vnos !== '' && !preg_match('/^[A-Za-z0-9\-]+$/', $vnos)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid vnos'));
    exit;
}
if ($cus !== '' && !preg_match('/^[A-Za-z0-9\-]+$/', $cus)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid cus'));
    exit;
}
if ($dep !== '' && !preg_match('/^[A-Za-z0-9._\-]+$/', $dep)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid dep'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

$parts = explode('-', $date);
$day = (int) $parts[2];
$month = (int) $parts[1];
$year = (int) $parts[0];

try {
    // ---- INV (C# verbatim — LEFT JOIN DEB + IC_S) ----
    $sql = "SELECT MIHday, MIHmonth, MIHyear, MIHcus, DEBnameT, MIHvnos, IC_SnameT, MIHdep
            FROM MIH
            LEFT JOIN DEB ON MIH.MIHcus = DEB.DEBcode
            LEFT JOIN IC_S ON MIH.MIHstatus = IC_S.IC_Scode
            WHERE (MIHvnos LIKE " . $pdo->quote($type . '%') . " AND MIHtype = 'IS')
            AND (MIHday = '" . $day . "' AND MIHmonth = '" . $month . "' AND MIHyear = '" . $year . "')";
    if ($cus !== '') {
        $sql .= " AND MIHcus = '" . $pdo->quote($cus) . "'";
    }
    if ($vnos !== '') {
        $sql .= " AND MIHvnos = '" . $pdo->quote($vnos) . "'";
    }
    if ($dep !== '') {
        $sql .= " AND MIHdep LIKE '" . $pdo->quote($dep) . "'";
    }
    $sql .= " ORDER BY MIHcus ASC";

    $stmt = $pdo->query($sql);
    $inv = array();
    $cusList = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $inv[] = array(
            'date' => sprintf('%02d/%02d/%04d', (int) $r['MIHday'], (int) $r['MIHmonth'], (int) $r['MIHyear']),
            'cus' => $r['MIHcus'],
            'name' => $r['DEBnameT'],
            'vnos' => $r['MIHvnos'],
            'status' => $r['IC_SnameT'],
            'dep' => $r['MIHdep']
        );
        if ($r['MIHcus'] !== '' && !in_array($r['MIHcus'], $cusList)) {
            $cusList[] = $r['MIHcus'];
        }
    }

    // ---- RSV (C# verbatim — cancel=0 + status != 4 + เดือน/ปี + cus IN) ----
    $rsv = array();
    if (count($cusList) > 0) {
        $in = array();
        foreach ($cusList as $c) {
            $in[] = $pdo->quote($c);
        }
        $sql2 = "SELECT MIHday, MIHmonth, MIHyear, MIHcus, DEBnameT, MIHvnos, IC_SnameT, MIHdesc, MIHnotes
                 FROM MIH
                 LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
                 LEFT JOIN IC_S ON IC_S.IC_Scode = MIHstatus
                 WHERE (MIHvnos LIKE 'RSV%' AND MIHtype = 'SS')
                 AND MIHcancel = 0
                 AND MIH.MIHstatus != 4
                 AND (MIHmonth = '" . $month . "' AND MIHyear = '" . $year . "')
                 AND MIHcus IN (" . implode(',', $in) . ")
                 ORDER BY MIHyear, MIHmonth, MIHday, MIHcus ASC";
        $stmt2 = $pdo->query($sql2);
        while ($r = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            $rsv[] = array(
                'date' => sprintf('%02d/%02d/%04d', (int) $r['MIHday'], (int) $r['MIHmonth'], (int) $r['MIHyear']),
                'cus' => $r['MIHcus'],
                'name' => $r['DEBnameT'],
                'vnos' => $r['MIHvnos'],
                'status' => $r['IC_SnameT'],
                'desc' => $r['MIHdesc'],
                'notes' => $r['MIHnotes']
            );
        }
    }

    echo json_encode(array('ok' => true, 'inv' => $inv, 'rsv' => $rsv), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}
