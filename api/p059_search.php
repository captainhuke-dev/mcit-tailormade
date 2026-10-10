<?php
/**
 * P059 — จัดเก็บเอกสารลูกค้า — search API
 * clone C# frm_SOimageGUI.Loaddata (L51-62):
 *   TOP 100 — tb_PictureSO LEFT JOIN MIH LEFT JOIN DEB WHERE status=0
 *   + vnos LIKE 'keyword%' — ORDER BY MIHdate DESC
 * POST {connectionId, vnos?}
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

if ($connId === '') {
    p059_fail('connectionId empty');
}

try {
    $pdo = getDb($connId);
} catch (Exception $e) {
    p059_fail('DB: ' . $e->getMessage());
}

$where = "SO.status = 0";
$vnosParam = null;
if ($vnos !== '') {
    $where .= " AND SO.vnos LIKE ?";
    $vnosParam = $vnos . '%';
}

// clone C# L57-62 — TOP 100 + GROUP BY (1 แถว/ใบ SO)
$sql = "SELECT TOP 100
          CONVERT(DATE, STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear), 103) AS MIHdate,
          SO.vnos,
          CONVERT(nvarchar(255), DEB.DEBcode) AS DEBcode,
          CONVERT(nvarchar(255), DEB.DEBnameT) AS DEBnameT,
          COUNT(SO.id) AS cntPic
        FROM BI_CUBE.dbo.tb_PictureSO SO
        LEFT JOIN [M5CM-AA-01].[dbo].[MIH] AS MIH ON MIH.MIHvnos = SO.vnos
        LEFT JOIN [M5CM-AA-01].[dbo].[DEB] AS DEB ON DEB.DEBcode = MIH.MIHcus
        WHERE $where
        GROUP BY CONVERT(DATE, STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear), 103),
                 SO.vnos, DEB.DEBcode, CONVERT(nvarchar(255), DEB.DEBnameT)
        ORDER BY MIHdate DESC";

try {
    $st = $pdo->prepare($sql);
    $st->execute($vnosParam === null ? array() : array($vnosParam));
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    p059_fail('SQL: ' . $e->getMessage());
}

$out = array();
foreach ($rows as $r) {
    $out[] = array(
        'date' => isset($r['MIHdate']) ? $r['MIHdate'] : '',
        'vnos' => isset($r['vnos']) ? $r['vnos'] : '',
        'customerCode' => isset($r['DEBcode']) ? $r['DEBcode'] : '',
        'customerName' => isset($r['DEBnameT']) ? $r['DEBnameT'] : '',
        'cntPic' => (int) (isset($r['cntPic']) ? $r['cntPic'] : 0)
    );
}

echo json_encode(array('ok' => true, 'count' => count($out), 'rows' => $out), JSON_UNESCAPED_UNICODE);
