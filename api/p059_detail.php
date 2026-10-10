<?php
/**
 * P059 — จัดเก็บเอกสารลูกค้า — detail API (view modal)
 * clone C# frm_SOimage_manager.loadDataView (L68-95):
 *   MIH INNER JOIN tb_PictureSO ON vnos + LEFT JOIN DEB WHERE MIHvnos=? AND status=0
 * POST {connectionId, vnos}
 * Response: { ok, doc:{date,vnos,cusCode,cusName}, files:[{id,filename}] }
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
if ($vnos === '') {
    p059_fail('vnos empty');
}

try {
    $pdo = getDb($connId);
} catch (Exception $e) {
    p059_fail('DB: ' . $e->getMessage());
}

// clone C# loadDataView L73-75
$sql = "SELECT SO.id,
          CONVERT(DATE, STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear), 103) AS MIHdate,
          MIH.MIHvnos,
          DEB.DEBcode,
          DEB.DEBnameT,
          SO.filename
        FROM [M5CM-AA-01].[dbo].[MIH] MIH
        INNER JOIN [BI_CUBE].[dbo].[tb_PictureSO] SO ON SO.vnos = MIH.MIHvnos
        LEFT JOIN [M5CM-AA-01].[dbo].[DEB] DEB ON DEB.DEBcode = MIH.MIHcus
        WHERE MIH.MIHvnos = ? AND SO.[status] = 0
        ORDER BY SO.id";

try {
    $st = $pdo->prepare($sql);
    $st->execute(array($vnos));
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    p059_fail('SQL: ' . $e->getMessage());
}

if (count($rows) === 0) {
    p059_fail('ไม่พบข้อมูลใบ ' . $vnos);
}

$first = $rows[0];
$doc = array(
    'date' => isset($first['MIHdate']) ? $first['MIHdate'] : '',
    'vnos' => isset($first['MIHvnos']) ? $first['MIHvnos'] : $vnos,
    'cusCode' => isset($first['DEBcode']) ? $first['DEBcode'] : '',
    'cusName' => isset($first['DEBnameT']) ? $first['DEBnameT'] : ''
);
$files = array();
foreach ($rows as $r) {
    $files[] = array(
        'id' => (int) (isset($r['id']) ? $r['id'] : 0),
        'filename' => isset($r['filename']) ? $r['filename'] : ''
    );
}

echo json_encode(array('ok' => true, 'doc' => $doc, 'files' => $files), JSON_UNESCAPED_UNICODE);
