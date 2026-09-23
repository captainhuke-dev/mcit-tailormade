<?php
/**
 * P033 — รายงานลูกค้าที่มียอดค้างเกินวงเงิน (search)
 * POST { connectionId, mode }  mode = all | overCredit | inCredit
 * MAC5 (SQL Server) — DEB + 4 subquery (CFS/CPS/CHQ/MIH)
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$mode = isset($input['mode']) ? $input['mode'] : 'all';

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

// Base query (user verbatim) — wrapper + mode filter
$sql = "SELECT * FROM (
    SELECT
        DEB.DEBcode AS CFScusID,
        CONVERT(nvarchar(255), DEB.DEBnameT) + '  [' + CONVERT(nvarchar(50), DEB.DEBadd3AT) + ']' AS DEBnameT,
        DEB.DEBgrade,
        ISNULL((
            SELECT SUM(CFSsumREQ - CFSsumCUT1)
            FROM CFS
            WHERE CFScusID = DEB.DEBcode
                AND CFSsumREQ > CFSsumCUT1
                AND CFSclearALL = '0'
        ), 0) AS sumCFS,
        ISNULL((
            SELECT SUM(CPSsumREQ - CPSsumCUT1)
            FROM CPS
            WHERE CPScusID = DEB.DEBcode
                AND CPSsumREQ > CPSsumCUT1
                AND CPSclearALL = '0'
        ), 0) AS sumCPS,
        ISNULL((
            SELECT SUM(CHQtotal)
            FROM CHQ
            WHERE CHQcus = DEB.DEBcode
                AND CHQstatus = 0
                AND CHQstatusN = 1
        ), 0) AS sumCHQ,
        DEB.DEBlimit,
        ISNULL((
            SELECT SUM(MIHnetSUM)
            FROM MIH
            WHERE MIHtype = 'PS'
                AND MIHstatus = 20
                AND MIHcus = DEB.DEBcode
        ), 0) AS SO
    FROM DEB
    WHERE DEB.DEBgrade NOT IN ('X', 'Z')
        AND DEB.DEBnameT LIKE '%(LM)%'
) Overlimits";

// mode filter
if ($mode === 'overCredit') {
    $sql .= " WHERE ((sumCFS + sumCPS + sumCHQ + SO) - DEBlimit) > 0";
} elseif ($mode === 'inCredit') {
    $sql .= " WHERE ((sumCFS + sumCPS + sumCHQ + SO) - DEBlimit) <= 0";
}

$sql .= " ORDER BY CFScusID";

try {
    $stmt = $pdo->query($sql);
    $rows = array();
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = array(
            'code' => $r['CFScusID'],
            'name' => $r['DEBnameT'],
            'grade' => $r['DEBgrade'],
            'outstanding' => (float) $r['sumCFS'],
            'orderAmount' => (float) $r['sumCPS'],
            'cheque' => (float) $r['sumCHQ'],
            'pending' => (float) $r['SO'],
            'credit' => (float) $r['DEBlimit']
        );
    }
    echo json_encode(array('ok' => true, 'rows' => $rows));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed'));
}
