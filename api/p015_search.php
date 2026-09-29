<?php
/**
 * P015 — สถานะบิลค้างรับ (search)
 * POST { connectionId, keyword }
 * MAC5 (SQL Server) — ตาม C# Frm_CheckBillReceiptGUI (AppCheckBillReceipt):
 *   CFS (CFSclearALL=0, net != 0) + DEB + BI_CUBE.tb_CFS_bill_status
 *   keyword LIKE: CFSvnosID / CFScusID / DEBnameT (ไม่ว่าง = ทั้งหมด)
 * Response: { ok, rows: [{date, iso, vnos, cus, name, contact, amount, billing, accrued, comment}] }
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$keyword = isset($input['keyword']) ? trim($input['keyword']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

try {
    $where = "CFSclearALL = 0 AND (CFS.CFSsumREQ - CFS.CFSsumCUT1) != 0";
    $params = array();
    if ($keyword !== '') {
        $where .= " AND (CFS.CFSvnosID LIKE ? OR CFS.CFScusID LIKE ? OR DEB.DEBnameT LIKE ?)";
        $kw = $keyword . '%';
        $params = array($kw, $kw, $kw);
    }

    $sql = "SELECT CFS.CFSdateID, CFS.CFSvnosID, CFS.CFScusID, DEB.DEBnameT, DEB.DEBcontactT,
            (CFS.CFSsumREQ - CFS.CFSsumCUT1) AS netPrice,
            B.Billing, B.AccruedBill, B.comment
            FROM CFS
            LEFT JOIN DEB ON DEB.DEBcode = CFS.CFScusID
            LEFT JOIN [BI_CUBE].[dbo].[tb_CFS_bill_status] B ON B.vnos = CFS.CFSvnosID AND B.cus = CFS.CFScusID
            WHERE " . $where . "
            ORDER BY CFS.CFScusID, CONVERT(VARCHAR(255), DEB.DEBnameT)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = array(
            'date' => $r['CFSdateID'] ? date('d/m/Y', strtotime($r['CFSdateID'])) : '',
            'iso' => $r['CFSdateID'] ? date('Y-m-d', strtotime($r['CFSdateID'])) : '',
            'vnos' => $r['CFSvnosID'],
            'cus' => $r['CFScusID'],
            'name' => $r['DEBnameT'],
            'contact' => $r['DEBcontactT'],
            'amount' => round((float) $r['netPrice'], 2),
            'billing' => $r['Billing'] === null ? null : (int) $r['Billing'],
            'accrued' => $r['AccruedBill'] === null ? null : (int) $r['AccruedBill'],
            'comment' => $r['comment'] === null ? '' : $r['comment']
        );
    }
    echo json_encode(array('ok' => true, 'rows' => $rows), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed', 'detail' => $e->getMessage()));
    exit;
}
