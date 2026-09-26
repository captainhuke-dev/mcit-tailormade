<?php
/**
 * P092 — Barcode/สคบ. (search)
 * POST { connectionId, code }
 * MAC5 (SQL Server) — ตาม C# MCIT_Frm_STKguideGUI.Get_search_data:
 *   BI_CUBE.dbo.STKguide A LEFT JOIN dbo.STK B ON B.STKcode=A.STKcode
 *   WHERE B.STKhide=0 AND B.STKcode=code
 * Response: { ok, product: { code, name, guide, warning, barcodes:{1-5}, units:{1-5}, defaultUnit, stkBarcode } }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$code = isset($input['code']) ? trim($input['code']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($code === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'code required'));
    exit;
}
if (!preg_match('/^[A-Za-z0-9\-_]+$/', $code)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid code'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

$sql = "SELECT A.STKcode, A.STKname, A.STKguide, A.STKwarning, A.Barcode1, A.Barcode2, A.Barcode3, A.Barcode4, A.Barcode5,
        B.STKuname1, B.STKuname2, B.STKuname3, B.STKuname4, B.STKuname5, A.DefaultUnit, A.STKBarcode
FROM BI_CUBE.dbo.STKguide AS A
LEFT JOIN dbo.STK B ON B.STKcode = A.STKcode
WHERE B.STKhide = 0 AND B.STKcode = " . $pdo->quote($code);

try {
    $stmt = $pdo->query($sql);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}

if (!$row) {
    echo json_encode(array('ok' => true, 'product' => null));
    exit;
}

$product = array(
    'code' => (string)$row['STKcode'],
    'name' => (string)$row['STKname'],
    'guide' => (string)$row['STKguide'],
    'warning' => (string)$row['STKwarning'],
    'stkBarcode' => (string)$row['STKBarcode'],
    'barcodes' => array(),
    'units' => array(),
    'defaultUnit' => (int)$row['DefaultUnit']
);
for ($i = 1; $i <= 5; $i++) {
    $product['barcodes'][$i] = (string)$row['Barcode' . $i];
    $product['units'][$i] = (string)$row['STKuname' . $i];
}

echo json_encode(array('ok' => true, 'product' => $product), JSON_UNESCAPED_UNICODE);
