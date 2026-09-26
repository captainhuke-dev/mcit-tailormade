<?php
/**
 * P054 — Packing Order — JOB group pages (หน้า JOB — 1 กลุ่มตัวอักษร = 1 หน้า)
 * POST { connectionId, vnos: ["IVVN6909-3855", ...] }
 * MAC5 (SQL Server) — ตาม C# Frm_BucketParts_Version2:
 *   - conditions = ตัวอักษรแรกของแต่ละส่วนใน MILvCol2 (split ',') — หมดซ้ำ — เรียง A→Z (dtfilter)
 *   - items กลุ่ม = MILtype='IS' AND MILvCol2 LIKE '%X%' AND STKsnsv != 3 (ListSTK)
 *   - MIS (snsv=4) = SELECT MISquan FROM MIS WHERE MISvnos=? AND MISstk=? AND MISline=? (getMIS)
 *   - packing = SELECT TOP 1 P.unitpacking FROM MIL LEFT JOIN BI_CUBE.dbo.tb_MILPacking P ... (getPack)
 * Response: { ok: true, groups: { vn: { conditions: ["A","B"], data: { A: { items: [...], packing: "..." } } } } }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$vnos = isset($input['vnos']) && is_array($input['vnos']) ? $input['vnos'] : array();

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}

// filter: alphabet/digit/dash/underscore only — max 50
$vnos = array_values(array_filter(array_map(function ($v) {
    return is_string($v) ? trim($v) : '';
}, $vnos), function ($v) {
    return $v !== '' && preg_match('/^[A-Za-z0-9\-_]+$/', $v);
}));
if (count($vnos) > 50) {
    $vnos = array_slice($vnos, 0, 50);
}

if (count($vnos) === 0) {
    echo json_encode(array('ok' => true, 'groups' => array()));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Connection failed', 'detail' => $e->getMessage()));
    exit;
}

// IN list (whitelist — ปลอด injection)
$in = implode(', ', array_map(function ($v) {
    return "'" . $v . "'";
}, $vnos));

$sql = "SELECT
    MILvnos,
    MILlistNo,
    STKcode,
    STKdescT1,
    MILquan,
    MILconv,
    MILuname,
    MILvCol1,
    MILvCol2,
    STKsnsv
FROM
    MIL
    LEFT JOIN STK ON MILstk = STKcode
WHERE
    MILtype = 'IS'
    AND MILvnos IN (" . $in . ")
    AND CONVERT(nvarchar(255), MILvCol2) != ''
    AND ISNUMERIC(CONVERT(nvarchar(255), MILvCol2)) = 0
    AND STKsnsv != 3
ORDER BY
    MILvnos,
    MILlistNo";

try {
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}

// group by vn
$byVn = array();
foreach ($rows as $r) {
    $vn = $r['MILvnos'];
    if (!isset($byVn[$vn])) {
        $byVn[$vn] = array();
    }
    $byVn[$vn][] = $r;
}

$groups = array();
foreach ($byVn as $vn => $vrows) {
    // conditions — ตัวอักษรแรกของแต่ละส่วนใน MILvCol2 (split ',') — หมดซ้ำ — เรียง A→Z
    $conds = array();
    foreach ($vrows as $r) {
        $parts = explode(',', (string) $r['MILvCol2']);
        foreach ($parts as $pp) {
            $c = substr(trim($pp), 0, 1);
            if ($c !== '' && !in_array($c, $conds)) {
                $conds[] = $c;
            }
        }
    }
    sort($conds);

    $data = array();
    foreach ($conds as $cond) {
        // items ของกลุ่ม (MILvCol2 LIKE '%X%')
        $items = array();
        foreach ($vrows as $r) {
            if (strpos((string) $r['MILvCol2'], $cond) !== false) {
                $item = array(
                    'listNo' => $r['MILlistNo'],
                    'code' => $r['STKcode'],
                    'desc' => $r['STKdescT1'],
                    'quan' => $r['MILquan'] !== null ? (float) $r['MILquan'] : null,
                    'conv' => $r['MILconv'] !== null ? (float) $r['MILconv'] : null,
                    'unit' => $r['MILuname'],
                    'vcol2' => $r['MILvCol2'],
                    'snsv' => $r['STKsnsv'],
                    'mis' => array()
                );
                // MIS quantities (snsv = 4)
                if ((string) $r['STKsnsv'] === '4') {
                    $mstmt = $pdo->prepare("SELECT MISquan FROM MIS WHERE MISvnos = ? AND MISstk = ? AND MISline = ? ORDER BY MISline");
                    $mstmt->execute(array($vn, $r['STKcode'], $r['MILlistNo']));
                    foreach ($mstmt->fetchAll(PDO::FETCH_ASSOC) as $m) {
                        $item['mis'][] = $m['MISquan'] !== null ? (float) $m['MISquan'] : 0;
                    }
                }
                $items[] = $item;
            }
        }

        // packing (BI_CUBE.dbo.tb_MILPacking — TOP 1)
        $packing = '';
        $pstmt = $pdo->prepare("SELECT TOP 1 P.unitpacking
            FROM MIL
            LEFT JOIN [BI_CUBE].[dbo].[tb_MILPacking] P ON P.vnos = MIL.MILvnos AND P.stk = MILstk
            WHERE MILtype = 'IS' AND MILvnos = ? AND CONVERT(nvarchar(255), MILvCol2) LIKE ?
            ORDER BY MILlistNo DESC");
        $pstmt->execute(array($vn, '%' . $cond . '%'));
        $prow = $pstmt->fetch(PDO::FETCH_ASSOC);
        if ($prow && $prow['unitpacking'] !== null) {
            $packing = (string) $prow['unitpacking'];
        }

        $data[$cond] = array(
            'items' => $items,
            'packing' => $packing
        );
    }

    $groups[$vn] = array(
        'conditions' => $conds,
        'data' => $data
    );
}

echo json_encode(array('ok' => true, 'groups' => $groups));
