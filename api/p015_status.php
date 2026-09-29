<?php
/**
 * P015 — สถานะบิลค้างรับ (save)
 * POST { connectionId, rows: [{vnos, cus, billing (0/1), accrued (0/1), comment}] }
 * MAC5 (SQL Server) — ตาม C# bgWorker_DoWork:
 *   upsert [BI_CUBE].[dbo].[tb_CFS_bill_status] (vnos+cus — update ถ้ามี / insert ถ้าไม่มี)
 *   Billing / AccruedBill = tinyint 0/1 (exclusive — JS ดูแลแล้ว)
 * Response: { ok, saved: n }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$rows = isset($input['rows']) && is_array($input['rows']) ? $input['rows'] : array();

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if (count($rows) === 0) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'rows required'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

$pdo->beginTransaction();
try {
    $upd = $pdo->prepare("UPDATE [BI_CUBE].[dbo].[tb_CFS_bill_status]
            SET Billing = ?, AccruedBill = ?, comment = ?
            WHERE vnos = ? AND cus = ?");
    $ins = $pdo->prepare("INSERT INTO [BI_CUBE].[dbo].[tb_CFS_bill_status] (vnos, cus, Billing, AccruedBill, comment)
            VALUES (?, ?, ?, ?, ?)");

    $saved = 0;
    foreach ($rows as $r) {
        $vnos = isset($r['vnos']) ? trim($r['vnos']) : '';
        $cus = isset($r['cus']) ? trim($r['cus']) : '';
        if ($vnos === '' || $cus === '') continue;
        $billing = isset($r['billing']) ? (int) $r['billing'] : 0;
        $accrued = isset($r['accrued']) ? (int) $r['accrued'] : 0;
        $comment = isset($r['comment']) ? (string) $r['comment'] : '';

        $upd->execute(array($billing, $accrued, $comment, $vnos, $cus));
        if ($upd->rowCount() === 0) {
            $ins->execute(array($vnos, $cus, $billing, $accrued, $comment));
        }
        $saved++;
    }

    $pdo->commit();
    echo json_encode(array('ok' => true, 'saved' => $saved), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Save failed', 'detail' => $e->getMessage()));
    exit;
}
