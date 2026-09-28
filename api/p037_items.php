<?php
/**
 * P037 — ตรวจสอบของจองที่มีการเปิดบิล (items — modal ผลิตผล)
 * POST { connectionId, inv: ["IVVN6909-4436"], rsv: ["RSV16909-0082", ...] }
 * MAC5 (SQL Server) — ตาม C# INVResult.Result_Load:
 *   INV items = MIH (IS, cancel=0) + MIL + STK — (MILquan/MILconv) as qty
 *   RSV items = MIH (SS, RSV%, cancel=0) + MIL + STK — (MILquan/MILconv) as qty
 * Response: { ok, inv: [{vnos,stk,desc,qty,unit,linkVCno}], rsv: [...] }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$inv = isset($input['inv']) && is_array($input['inv']) ? $input['inv'] : array();
$rsv = isset($input['rsv']) && is_array($input['rsv']) ? $input['rsv'] : array();

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}

function p037_clean_list($list) {
    $out = array();
    foreach ($list as $v) {
        $v = trim((string) $v);
        if ($v !== '' && preg_match('/^[A-Za-z0-9\-]+$/', $v)) {
            $out[] = $v;
        }
    }
    return $out;
}

$inv = p037_clean_list($inv);
$rsv = p037_clean_list($rsv);
if (count($inv) === 0 && count($rsv) === 0) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'inv or rsv required'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

function p037_items($pdo, $list, $type, $likePrefix) {
    if (count($list) === 0) {
        return array();
    }
    $in = array();
    foreach ($list as $v) {
        $in[] = $pdo->quote($v);
    }
    $sql = "SELECT MIH.MIHvnos, MILstk, STKdescT1, (MILquan / MILconv) AS qty, MILuname, MILlinkVCno
            FROM MIH
            LEFT JOIN MIL ON MIL.MILvnos = MIH.MIHvnos
            LEFT JOIN STK ON STK.STKcode = MIL.MILstk
            WHERE MIHtype = '" . $type . "'";
    if ($likePrefix !== '') {
        $sql .= " AND MIH.MIHvnos LIKE '" . $likePrefix . "%'";
    }
    $sql .= " AND MIHcancel = 0 AND MIH.MIHvnos IN (" . implode(',', $in) . ")
            ORDER BY MIH.MIHvnos, MILlistNo ASC";
    $stmt = $pdo->query($sql);
    $rows = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = array(
            'vnos' => $r['MIHvnos'],
            'stk' => $r['MILstk'],
            'desc' => $r['STKdescT1'],
            'qty' => $r['qty'] !== null ? (float) $r['qty'] : 0,
            'unit' => $r['MILuname'],
            'link' => $r['MILlinkVCno']
        );
    }
    return $rows;
}

try {
    $out = array(
        'ok' => true,
        'inv' => p037_items($pdo, $inv, 'IS', ''),
        'rsv' => p037_items($pdo, $rsv, 'SS', 'RSV')
    );
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}
