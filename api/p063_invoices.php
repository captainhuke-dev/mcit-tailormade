<?php
/**
 * API: รายการ Invoice KTV (P063) — SQL Server M5CM-AA-01
 *
 * รับ POST JSON:
 * {
 *   "connectionId": "c1788406814359",  // จากหน้าตั้งค่า (connections.json)
 *   "dateFrom": "2026-09-02",          // ISO (แปลงเป็น YYYY/MM/DD ใน query)
 *   "dateTo": "2026-09-03",
 *   "doctype": "IVVN",                 // Doctype — ว่าง = ทั้งหมด
 *   "salesCode": "A001",               // รหัสผู้แทน — ว่าง = ทั้งหมด
 *   "status": "65",                    // Status Invoice — ว่าง = ทั้งหมด
 *   "creator": "SOMCHAI"               // ผู้สร้างเอกสาร — ว่าง = ทั้งหมด
 * }
 *
 * ตอบกลับ JSON: {ok:bool, message?:string, count?:int, invoices?:[...]}
 */
require __DIR__ . '/lib/db.php';
header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    echo json_encode(array('ok' => false, 'message' => 'ข้อมูลที่ได้รับไม่ถูกต้อง (ต้องเป็น JSON)'), JSON_UNESCAPED_UNICODE);
    exit;
}

$connId = isset($in['connectionId']) ? $in['connectionId'] : '';
if ($connId === '') {
    echo json_encode(array('ok' => false, 'message' => 'ไม่ระบุ connectionId — เลือกการเชื่อมต่อจากหน้าตั้งค่าก่อน'), JSON_UNESCAPED_UNICODE);
    exit;
}

// แปลงวันที่ ISO (YYYY-MM-DD) → รูปแบบ YYYY/MM/DD ตาม CONVERT(...,103)
function isoToDateParam($iso)
{
    if ($iso === '' || $iso === null) {
        return '';
    }
    $parts = explode('-', $iso);
    if (count($parts) !== 3) {
        return '';
    }
    return $parts[0] . '/' . $parts[1] . '/' . $parts[2];
}

$dateFrom = isoToDateParam(isset($in['dateFrom']) ? $in['dateFrom'] : '');
$dateTo   = isoToDateParam(isset($in['dateTo']) ? $in['dateTo'] : '');
$doctype  = isset($in['doctype']) ? trim($in['doctype']) : '';
$salesCode = isset($in['salesCode']) ? trim($in['salesCode']) : '';
$status   = isset($in['status']) ? trim($in['status']) : '';
$creator  = isset($in['creator']) ? trim($in['creator']) : '';

$sql = "
SELECT
	MIH.MIHvnos,
	MIH.MIHcus,
	DEB.DEBadd3AT,
	DEB.DEBnameE,
	DEB.DEBcontactT,
	MIH.MIHnetSUM,
	MIH.MIHdesc,
	MIH.MIHper,
	MIH.MIHkeyUser,
	MIH.MIHstatus,
	MIH.MIHday,
	MIH.MIHmonth,
	MIH.MIHyear,
	MIH.MIHprintN,
	( SELECT MAX ( MILlistNo ) FROM MIL WHERE MILvnos = MIH.MIHvnos ) cnt,
	(
		SELECT COUNT
			( DISTINCT SUBSTRING ( MILlinkVCno, 1, 3 ) )
		FROM
			MIL
		WHERE
			MILvnos = MIH.MIHvnos
			AND SUBSTRING ( MILlinkVCno, 1, 3 ) NOT IN ( 'RED', 'SGI', 'SGC' )
	) cnt2
FROM
	MIH
	LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
WHERE
	MIH.MIHtype = 'IS'
	AND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) >= ?
	AND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) <= ?";

$params = array($dateFrom, $dateTo);

if ($doctype !== '') {
    $sql .= " AND MIH.MIHvnos LIKE ?";
    $params[] = $doctype . '%';
}
if ($salesCode !== '') {
    $sql .= " AND MIH.MIHper LIKE ?";
    $params[] = '%' . $salesCode . '%';
}
if ($status !== '') {
    $sql .= " AND MIH.MIHstatus = ?";
    $params[] = $status;
}
if ($creator !== '') {
    $sql .= " AND MIH.MIHkeyUser LIKE ?";
    $params[] = '%' . $creator . '%';
}
$sql .= " ORDER BY MIH.MIHvnos";

try {
    $pdo = getDb($connId);
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $invoices = array();
    foreach ($rows as $row) {
        $day = str_pad($row['MIHday'], 2, '0', STR_PAD_LEFT);
        $month = str_pad($row['MIHmonth'], 2, '0', STR_PAD_LEFT);
        $invoices[] = array(
            'id' => $row['MIHvnos'],
            'doctype' => substr($row['MIHvnos'], 0, 4),
            'customerCode' => $row['MIHcus'],
            'customer' => $row['DEBnameE'],
            'address' => $row['DEBadd3AT'],
            'contact' => $row['DEBcontactT'],
            'desc' => $row['MIHdesc'],
            'creator' => $row['MIHkeyUser'],
            'salesCode' => $row['MIHper'],
            'dateISO' => $row['MIHyear'] . '-' . $month . '-' . $day,
            'dateDisplay' => $day . '/' . $month . '/' . $row['MIHyear'],
            'amount' => (float) $row['MIHnetSUM'],
            'statusId' => (string) $row['MIHstatus'],
            'printCount' => (int) $row['MIHprintN'],
            'listNo' => $row['cnt'],
            'vcCount' => $row['cnt2'],
        );
    }

    echo json_encode(array('ok' => true, 'count' => count($invoices), 'invoices' => $invoices), JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode(array('ok' => false, 'message' => 'Query ไม่สำเร็จ: ' . $e->getMessage()), JSON_UNESCAPED_UNICODE);
} catch (RuntimeException $e) {
    echo json_encode(array('ok' => false, 'message' => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
