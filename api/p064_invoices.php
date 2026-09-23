<?php
/**
 * API: รายการ Invoice MCIT (P064) — SQL Server M5CM-AA-01
 *
 * รับ POST JSON:
 * {
 *   "connectionId": "c1788406814359",  // จากหน้าตั้งค่า (connections.json)
 *   "dateFrom": "2026-09-06",          // ISO (แปลงเป็น YYYY/MM/DD ใน query)
 *   "dateTo": "2026-09-07",
 *   "doctype": "IVV7",                 // Doctype — ว่าง = ทั้งหมด
 *   "salesCode": "A001",               // รหัสผู้แทน — ว่าง = ทั้งหมด
 *   "status": "6",                     // Status Invoice — ว่าง = ทั้งหมด
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

// SQL ตามสเปก P064 — ทับเทียกับสเปกที่กำหนด (แก้ 2 ข้อผิด: CONVERT(J.Route), expression เต็มของ AfterDisc)
$sql = "
SELECT
	dbo.MIH.MIHday,
	dbo.MIH.MIHmonth,
	dbo.MIH.MIHyear,
	dbo.MIH.MIHvnos,
	dbo.MIH.MIHcus,
	dbo.DEB.DEBadd1AT,
	dbo.DEB.DEBadd2AT,
	dbo.DEB.DEBadd3AT,
	dbo.DEB.DEBadd3AE,
	MIH.MIHkeyUser,
	MIH.MIHkeyDate,
	dbo.DEB.DEBtel,
	dbo.DEB.DEBfax,
	dbo.MIH.MIHper,
	dbo.PER.PERnameT,
	MIH.MIHmemo,
	MIH.MIHdiscHT1,
	MIH.MIHdiscHT2,
	dbo.DEB.DEBnameE,
	dbo.MIH.MIHnetSUM,
	dbo.MIH.MIHvatSUM,
	( MIH.MIHcog - MIH.MIHdiscLST ) AS MIHcog,
	dbo.MIH.MIHnotes,
	DEB.DEBcreditTerm,
	DEB.DEBcontactT,
	CONVERT ( nvarchar ( 255 ), JOB.JOBcode ) + ' , ' + CONVERT ( nvarchar ( 255 ), JOB.JOBdescT ) + ' , ' + CONVERT ( nvarchar ( 255 ), JOB.JOBdescE ) AS JOBdescT,
	( MIH.MIHdiscHF1 + MIH.MIHdiscHF2 ) AS MIHdisc,
	( ( MIH.MIHcog - MIH.MIHdiscLST ) - ( MIH.MIHdiscHF1 + MIH.MIHdiscHF2 + MIH.MIHdiscLST ) ) AS AfterDisc,
	MIH.MIHextraSUM,
	MIH.MIHprintN,
	MIH.MIHref1,
	JOB.JOBgroup,
	CONVERT ( nvarchar ( 255 ), J.Route ) + ' - ' + CONVERT ( nvarchar ( 255 ), J.TransferNumber ) AS RouteDescT,
	dbo.MIH.MIHstatus,
	( SELECT COUNT ( MIL.MILlistNo ) FROM MIL WHERE MIL.MILvnos = MIH.MIHvnos ) AS cnt,
	(
		SELECT COUNT
			( DISTINCT SUBSTRING ( MIL.MILlinkVCno, 1, 3 ) )
		FROM
			MIL
		WHERE
			MIL.MILvnos = MIH.MIHvnos
			AND SUBSTRING ( MIL.MILlinkVCno, 1, 3 ) NOT IN ( 'RED', 'SGI', 'SGC' )
	) AS cnt2
FROM
	dbo.MIH
	LEFT JOIN dbo.DEB ON dbo.DEB.DEBcode = dbo.MIH.MIHcus
	LEFT JOIN dbo.PER ON dbo.PER.PERcode = dbo.MIH.MIHper
	LEFT JOIN dbo.JOB ON dbo.JOB.JOBcode = dbo.MIH.MIHjob
	LEFT JOIN BI_CUBE.dbo.JOB_TransportRoute AS J ON J.JOBcode = MIH.MIHjob
WHERE
	dbo.MIH.MIHtype = 'IS'
	AND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) >= ?
	AND CONVERT ( DATE, STR( MIH.MIHday ) + '/' + STR( MIH.MIHmonth ) + '/' + STR( MIH.MIHyear ), 103 ) <= ?";

$params = array($dateFrom, $dateTo);

if ($doctype !== '') {
    $sql .= " AND dbo.MIH.MIHvnos LIKE ?";
    $params[] = $doctype . '%';
}
if ($salesCode !== '') {
    $sql .= " AND MIH.MIHper LIKE ?";
    $params[] = '%' . $salesCode . '%';
}
if ($status !== '') {
    $sql .= " AND dbo.MIH.MIHstatus = ?";
    $params[] = $status;
}
$sql .= " AND MIHcancel = 0";
$sql .= "
ORDER BY
	MIH.MIHvnos";

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
            'address2' => $row['DEBadd2AT'],
            'address3AE' => $row['DEBadd3AE'],
            'contact' => $row['DEBcontactT'],
            'phone' => $row['DEBtel'],
            'fax' => $row['DEBfax'],
            'creator' => $row['MIHkeyUser'],
            'creatorDate' => $row['MIHkeyDate'],
            'salesCode' => $row['MIHper'],
            'salesName' => $row['PERnameT'],
            'memo' => $row['MIHmemo'],
            'discHT1' => $row['MIHdiscHT1'],
            'discHT2' => $row['MIHdiscHT2'],
            'vatSum' => (float) $row['MIHvatSUM'],
            'cog' => (float) $row['MIHcog'],
            'notes' => $row['MIHnotes'],
            'creditTerm' => $row['DEBcreditTerm'],
            'jobDescT' => $row['JOBdescT'],
            'disc' => (float) $row['MIHdisc'],
            'afterDisc' => (float) $row['AfterDisc'],
            'extraSum' => (float) $row['MIHextraSUM'],
            'ref1' => $row['MIHref1'],
            'jobGroup' => $row['JOBgroup'],
            'routeDesc' => $row['RouteDescT'],
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
