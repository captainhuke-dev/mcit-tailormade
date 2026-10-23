<?php
/**
 * P079 PickList Marketplace - report data (modal PDF preview)
 * Port of demo/file_ref/Tailor_Made/AppPickListMarketplace/frm_PickListMarketplaceGUI.cs
 * POST {connectionId, status, dateFrom, dateTo, group}
 * Returns {ok, printedAt, count, headers:[{stk,desc,desc2,sto,total,rows:[{cust,doc,date,qty,unit}]}]}
 */
require __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p079_rep_error($msg) {
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    p079_rep_error('Request ไม่ถูกต้อง');
}
$connectionId = isset($data['connectionId']) ? trim((string)$data['connectionId']) : '';
$status = isset($data['status']) ? trim((string)$data['status']) : '';
$dateFrom = isset($data['dateFrom']) ? trim((string)$data['dateFrom']) : '';
$dateTo = isset($data['dateTo']) ? trim((string)$data['dateTo']) : '';
$group = isset($data['group']) ? trim((string)$data['group']) : 'EC';

if ($connectionId === '' || $status === '' || $dateFrom === '' || $dateTo === '') {
    p079_rep_error('ข้อมูลไม่ครบ (connectionId/status/dateFrom/dateTo)');
}
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
    p079_rep_error('รูปแบบวันที่ไม่ถูกต้อง (yyyy-MM-dd)');
}
if (!ctype_digit($status)) {
    p079_rep_error('status ไม่ถูกต้อง');
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    p079_rep_error('เชื่อมต่อฐานข้อมูลไม่สำเร็จ');
}

$cond = " AND CONVERT(DATE,STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear),103) >= ?"
     . " AND CONVERT(DATE,STR(MILday) + '/' + STR(MILmonth) + '/' + STR(MILyear),103) <= ?"
     . " AND MILcus IN (SELECT DEBcode FROM DEB WHERE DEBgroup LIKE ?)";

try {
    // dataHeader (C#): grouped by stk+desc+desc2+sto + total per stk+sto (sumSTk)
    $sqlH = "SELECT B.MILstk AS STKcode, CONVERT(VARCHAR(255), C.STKdescT1) AS STKdescT1,"
          . " CONVERT(VARCHAR(255), C.STKdescT2) AS STKdescT2, B.MILsto,"
          . " SUM(B.MILquan / B.MILconv) AS total"
          . " FROM MIH A LEFT JOIN MIL B ON A.MIHvnos = B.MILvnos"
          . " LEFT JOIN STK C ON B.MILstk = C.STKcode"
          . " WHERE A.MIHstatus = ? AND A.MIHtype = 'IS' AND B.MILcut = -1" . $cond
          . " GROUP BY B.MILstk, CONVERT(VARCHAR(255), C.STKdescT1), CONVERT(VARCHAR(255), C.STKdescT2), B.MILsto"
          . " ORDER BY B.MILstk";
    $stmt = $pdo->prepare($sqlH);
    $stmt->execute(array($status, $dateFrom, $dateTo, $group . '%'));
    $headers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // dataDetail (C#): one query for ALL detail rows (per stk+sto in PHP)
    $sqlD = "SELECT MIL.MILstk AS MILstk, MIL.MILsto AS MILsto,"
          . " CONVERT(VARCHAR(255), D.DEBnameT) AS DEBnameT,"
          . " CONVERT(VARCHAR(255), D.DEBcontactT) AS DEBcontactT,"
          . " CONVERT(VARCHAR(255), MIL.MILvnos) AS MILvnos,"
          . " CONVERT(VARCHAR(25), CONVERT(DATE,STR(MIL.MILday) + '/' + STR(MIL.MILmonth) + '/' + STR(MIL.MILyear),103)) AS MILdate,"
          . " SUM(MIL.MILquan / MIL.MILconv) AS qty, CONVERT(VARCHAR(50), MIL.MILuname) AS MILuname"
          . " FROM MIL"
          . " LEFT JOIN STK ON STK.STKcode = MIL.MILstk"
          . " LEFT JOIN DEB D ON D.DEBcode = MIL.MILcus"
          . " LEFT JOIN MIH ON MIH.MIHvnos = MIL.MILvnos"
          . " WHERE MIH.MIHstatus = ? AND MIL.MILcut = -1 AND MIL.MILtype = 'IS'" . $cond
          . " GROUP BY MIL.MILstk, MIL.MILsto, CONVERT(VARCHAR(255), D.DEBnameT), CONVERT(VARCHAR(255), D.DEBcontactT),"
          . " CONVERT(VARCHAR(255), MIL.MILvnos),"
          . " CONVERT(VARCHAR(25), CONVERT(DATE,STR(MIL.MILday) + '/' + STR(MIL.MILmonth) + '/' + STR(MIL.MILyear),103)),"
          . " CONVERT(VARCHAR(50), MIL.MILuname)"
          . " ORDER BY MIL.MILstk, CONVERT(VARCHAR(255), MIL.MILvnos)";
    $stmt = $pdo->prepare($sqlD);
    $stmt->execute(array($status, $dateFrom, $dateTo, $group . '%'));
    $details = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // group detail rows by stk+sto
    $byKey = array();
    foreach ($details as $r) {
        $key = $r['MILstk'] . '|' . $r['MILsto'];
        if (!isset($byKey[$key])) {
            $byKey[$key] = array();
        }
        $byKey[$key][] = array(
            'cust' => trim(((string)$r['DEBnameT']) . ' ' . ((string)$r['DEBcontactT'])),
            'doc' => (string)$r['MILvnos'],
            'date' => (string)$r['MILdate'],
            'qty' => $r['qty'] === null ? '0' : (string)$r['qty'],
            'unit' => (string)$r['MILuname']
        );
    }

    $out = array();
    foreach ($headers as $h) {
        $stk = (string)$h['STKcode'];
        $sto = (string)$h['MILsto'];
        $key = $stk . '|' . $sto;
        $rows = isset($byKey[$key]) ? $byKey[$key] : array();
        // total = sum of detail qty (C# sumSTk per stk+sto)
        $total = 0;
        foreach ($rows as $r) {
            $total += floatval($r['qty']);
        }
        $out[] = array(
            'stk' => $stk,
            'desc' => (string)$h['STKdescT1'],
            'desc2' => (string)$h['STKdescT2'],
            'sto' => $sto,
            'total' => (string)$total,
            'rows' => $rows
        );
    }

    echo json_encode(array(
        'ok' => true,
        'printedAt' => date('d/m/Y H:i:s'),
        'machine' => php_uname('n'),
        'count' => count($out),
        'headers' => $out
    ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    p079_rep_error('ค้นหาไม่สำเร็จ: ' . $e->getMessage());
}
