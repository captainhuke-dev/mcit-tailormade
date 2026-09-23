<?php
/**
 * P063 — ดึงข้อมูลรายงาน Invoice (สำหรับทำรายงาน A4)
 * POST: { connectionId: "...", invoiceIds: ["IVVN6909-0169", ...] }
 * SQL ตามแบบ user — JOIN DEB/PER/JOB_TransportRoute (BI_CUBE)/JOB/DEP
 *
 * หมายเหตุ: SQL เดิมของ user ใช้ alias "MIHcog" ใน expression AfterDisc
 * ซึ่ง SQL Server ไม่อนุญาต (alias ไม่ valid ใน select list เดียวกัน)
 * — แทนด้วยนิยาม (MIHcog - MIHdiscLST) ตรงๆ หมายเดียวกัน 100%
 */

require __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function reportError($message)
{
    echo json_encode(array('ok' => false, 'message' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    reportError('request body ต้องเป็น JSON');
}

$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$ids = isset($input['invoiceIds']) ? $input['invoiceIds'] : array();

if ($connectionId === '') {
    reportError('กรุณาส่ง connectionId');
}
if (!is_array($ids) || count($ids) === 0) {
    reportError('กรุณาส่ง invoiceIds (อย่างน้อย 1 รายการ)');
}
if (count($ids) > 50) {
    reportError('เลือกพิมพ์ได้สูงสุด 50 รายการต่อครั้ง');
}

// รับเฉพาะ string และตัด whitespace — กัน injection ผ่าน prepared statement
$cleanIds = array();
foreach ($ids as $id) {
    if (!is_string($id)) {
        reportError('invoiceIds ทุกตัวต้องเป็น string');
    }
    $id = trim($id);
    if ($id !== '') {
        $cleanIds[] = $id;
    }
}
if (count($cleanIds) === 0) {
    reportError('invoiceIds ว่างทั้งหมด');
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    reportError('เชื่อมต่อฐานข้อมูลไม่สำเร็จ: ' . $e->getMessage());
}

$marks = array();
foreach ($cleanIds as $id) {
    $marks[] = '?';
}
$inList = implode(', ', $marks);

$sql = "SELECT
        MIH.MIHday,
        MIH.MIHmonth,
        MIH.MIHyear,
        MIH.MIHvnos,
        MIH.MIHcus,
        DEB.DEBadd1AT,
        DEB.DEBadd2AT,
        DEB.DEBadd3AT,
        DEB.DEBadd3AE,
        MIH.MIHkeyUser,
        MIH.MIHkeyDate,
        DEB.DEBtel,
        DEB.DEBfax,
        MIH.MIHper,
        PER.PERnameT,
        MIH.MIHmemo,
        DEB.DEBnameE,
        MIH.MIHnetSUM,
        MIH.MIHvatSUM,
        (MIH.MIHcog - MIH.MIHdiscLST) AS MIHcog,
        MIH.MIHnotes,
        DEB.DEBcreditTerm,
        DEB.DEBcontactT,
        MIH.MIHdiscHT1,
        MIH.MIHdiscHT2,
        J.Route + ' - ' + J.TransferNumber AS RouteDescT,
        CONVERT(nvarchar(255), JOB.JOBcode) + ' , ' + CONVERT(nvarchar(255), JOB.JOBdescT) + ' , ' + CONVERT(nvarchar(255), JOB.JOBdescE) AS JOBdescT,
        (MIH.MIHdiscHF1 + MIH.MIHdiscHF2) AS MIHdisc,
        (MIH.MIHcog - MIH.MIHdiscLST - MIH.MIHdiscHF1 - MIH.MIHdiscHF2) AS AfterDisc,
        MIH.MIHextraSUM,
        MIH.MIHdesc,
        MIH.MIHprintN,
        JOB.JOBgroup,
        MIH.MIHref1,
        MIH.MIHdep AS DEPcode,
        DEP.DEPdescT
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    LEFT JOIN PER ON PER.PERcode = MIH.MIHper
    LEFT JOIN BI_CUBE.dbo.JOB_TransportRoute AS J ON J.JOBcode = MIH.MIHjob
    LEFT JOIN dbo.JOB AS JOB ON JOB.JOBcode = MIH.MIHjob
    LEFT JOIN DEP ON DEP.DEPcode = MIH.MIHdep
    WHERE MIH.MIHvnos IN (" . $inList . ")
    ORDER BY MIH.MIHvnos";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($cleanIds);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    reportError('SQL error: ' . $e->getMessage());
}

// ── Body: รายการสินค้า (MIL + STK) ต่อ invoice — ตาม SQL ของ user ──
// MILsto = คลัง/หน่วยงานเก็บของ (ใช้คอลัม คลัง ของรายงานใบส่งสินค้า)
try {
    $itemsSql = "SELECT
        MIL.MILstk,
        MIL.MILsto,
        CONVERT(nvarchar(255), MIL.MILdesc) AS descT,
        MIL.MILnotes,
        CONVERT(nvarchar(255), (MIL.MILquan / MIL.MILconv)) + ' ' + CONVERT(nvarchar(255), MIL.MILuname) AS quan,
        MIL.MILuprice,
        MIL.MILdiscA,
        MIL.MILsum,
        MIL.MILvCol2,
        MIL.MILtype,
        MIL.MILquan,
        STK.STKconv1,
        STK.STKunit1,
        STK.STKsnsv,
        MILlistNo
    FROM MIL
    INNER JOIN dbo.STK ON dbo.STK.STKcode = dbo.MIL.MILstk
    WHERE MILvnos = ?
    ORDER BY MILlistNo";
    $itemsStmt = $pdo->prepare($itemsSql);
    foreach ($rows as &$row) {
        $itemsStmt->execute(array($row['MIHvnos']));
        $row['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    unset($row);
} catch (Exception $e) {
    reportError('SQL error (MIL items): ' . $e->getMessage());
}

// ── รวมหน่วยบรรจุ: SUM(MILvCol1) — ตาม SQL ของ user
//    (LEFT JOIN STK, ตัด STKgroup='SV', นับเฉพาะ MILvCol1 ที่เป็นตัวเลข) ──
try {
    $unitsSql = "SELECT SUM(CONVERT(INT, CONVERT(NVARCHAR(25), MIL.MILvCol1))) AS TOTAL
    FROM MIL
    LEFT JOIN STK ON STK.STKcode = MIL.MILstk
    WHERE STK.STKgroup != 'SV'
    AND ISNUMERIC(CONVERT(NVARCHAR(25), MIL.MILvCol1)) <> 0
    AND MIL.MILvnos = ?";
    $unitsStmt = $pdo->prepare($unitsSql);
    foreach ($rows as &$row) {
        $unitsStmt->execute(array($row['MIHvnos']));
        $total = $unitsStmt->fetchColumn();
        $row['totalUnits'] = ($total === null || $total === false) ? 0 : $total;
    }
    unset($row);
} catch (Exception $e) {
    // ไม่ fail ทั้งรายงานถ้า query รวมหน่วยบรรจุพลาด — ให้ 0
    foreach ($rows as &$row) {
        $row['totalUnits'] = 0;
    }
    unset($row);
}

// ── อ้างอิงใบสั่งซื้อ: MIL ที่ link ผ่าน MILlinkVCno (MILvnos + MILdate) ต่อ invoice ──
try {
    $refsSql = "SELECT
        CONVERT(DATE, STR(MIL.MILday) + '/' + STR(MIL.MILmonth) + '/' + STR(MIL.MILyear), 103) AS MILdate,
        MIL.MILvnos
    FROM MIL
    WHERE MILvnos IN (
        SELECT MILlinkVCno FROM MIL WHERE MILvnos = ? GROUP BY MILlinkVCno
    )
    GROUP BY
        CONVERT(DATE, STR(MIL.MILday) + '/' + STR(MIL.MILmonth) + '/' + STR(MIL.MILyear), 103),
        MIL.MILvnos";
    $refsStmt = $pdo->prepare($refsSql);
    foreach ($rows as &$row) {
        $refsStmt->execute(array($row['MIHvnos']));
        $row['refs'] = $refsStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    unset($row);
} catch (Exception $e) {
    // ไม่ fail ทั้งรายงานถ้า query อ้างอิงพลาด — ให้ refs ว่าง
    foreach ($rows as &$row) {
        $row['refs'] = array();
    }
    unset($row);
}

// map invoice ที่ไม่พบ
$found = array();
foreach ($rows as $row) {
    $found[] = $row['MIHvnos'];
}
$missing = array_values(array_diff($cleanIds, $found));

echo json_encode(array(
    'ok' => true,
    'count' => count($rows),
    'reports' => $rows,
    'missing' => $missing
), JSON_UNESCAPED_UNICODE);
