<?php
/**
 * P059 — จัดเก็บเอกสารลูกค้า — SO list API (SO picker ใน modal new)
 * clone C# frm_selectData.loadData (L51-58):
 *   TOP 50 — MIH LEFT JOIN DEB WHERE MIHtype='PS'
 *   AND MIHvnos NOT IN (SELECT vnos FROM tb_PictureSO GROUP BY vnos)
 *   (+ MIHvnos LIKE 'keyword%')
 * POST {connectionId, vnos?, mode?}
 *   mode=picker (default) — SO ยังไม่มีภาพ (NOT IN tb_PictureSO) TOP 10 + MIHvnos LIKE 'kw%' (autocomplete)
 *   mode=info — query SO แม่นยำ (clone C# loadSO L97-118: MIHtype='PS' AND MIHvnos=?)
 */
require __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p059_fail($msg) {
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$connId = isset($input['connectionId']) ? $input['connectionId'] : '';
$vnos = isset($input['vnos']) ? trim($input['vnos']) : '';
$mode = isset($input['mode']) ? $input['mode'] : 'picker';

if ($connId === '') {
    p059_fail('connectionId empty');
}

try {
    $pdo = getDb($connId);
} catch (Exception $e) {
    p059_fail('DB: ' . $e->getMessage());
}

// ---------- mode=info — query SO แม่นยำ (clone C# loadSO L102-104) ----------
if ($mode === 'info') {
    if ($vnos === '') {
        p059_fail('vnos empty');
    }
    $sqlInfo = "SELECT TOP 1
                  CONVERT(DATE, STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear), 103) AS MIHdate,
                  MIH.MIHvnos,
                  DEB.DEBcode,
                  DEB.DEBnameT
                FROM [M5CM-AA-01].[dbo].[MIH] MIH
                LEFT JOIN [M5CM-AA-01].[dbo].[DEB] DEB ON DEB.DEBcode = MIH.MIHcus
                WHERE MIH.MIHtype = 'PS' AND MIH.MIHvnos = ?";
    try {
        $st = $pdo->prepare($sqlInfo);
        $st->execute(array($vnos));
        $r = $st->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        p059_fail('SQL: ' . $e->getMessage());
    }
    if (!$r) {
        p059_fail('ไม่พบ SO ' . $vnos . ' (ต้องเป็น MIHtype=PS)');
    }
    echo json_encode(array(
        'ok' => true,
        'doc' => array(
            'date' => isset($r['MIHdate']) ? $r['MIHdate'] : '',
            'vnos' => isset($r['MIHvnos']) ? $r['MIHvnos'] : '',
            'cusCode' => isset($r['DEBcode']) ? $r['DEBcode'] : '',
            'cusName' => isset($r['DEBnameT']) ? $r['DEBnameT'] : ''
        )
    ), JSON_UNESCAPED_UNICODE);
    exit;
}

// ---------- mode=picker — SO ยังไม่มีภาพ (autocomplete TOP 10 — LIKE 'kw%') ----------
$where = "MIH.MIHtype = 'PS' AND MIH.MIHvnos NOT IN (SELECT vnos FROM [BI_CUBE].[dbo].[tb_PictureSO] GROUP BY vnos)";
$params = array();
if ($vnos !== '') {
    $where .= " AND MIH.MIHvnos LIKE ?";
    $params[] = $vnos . '%';
}

$sql = "SELECT TOP 10
          CONVERT(DATE, STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear), 103) AS MIHdate,
          MIH.MIHvnos,
          DEB.DEBcode,
          DEB.DEBnameT
        FROM [M5CM-AA-01].[dbo].[MIH] MIH
        LEFT JOIN [M5CM-AA-01].[dbo].[DEB] DEB ON DEB.DEBcode = MIH.MIHcus
        WHERE $where
        ORDER BY MIHdate DESC";

try {
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    p059_fail('SQL: ' . $e->getMessage());
}

$out = array();
foreach ($rows as $r) {
    $out[] = array(
        'date' => isset($r['MIHdate']) ? $r['MIHdate'] : '',
        'vnos' => isset($r['MIHvnos']) ? $r['MIHvnos'] : '',
        'cusCode' => isset($r['DEBcode']) ? $r['DEBcode'] : '',
        'cusName' => isset($r['DEBnameT']) ? $r['DEBnameT'] : ''
    );
}

echo json_encode(array('ok' => true, 'count' => count($out), 'rows' => $out), JSON_UNESCAPED_UNICODE);
