<?php
/**
 * P006 — Print Invoice เช็คคืน — ดึงข้อมูลรายงาน (2 หน้า/ใบ: สำหรับลูกค้า + Invoice)
 * clone C# MCIT_FrmPrintChqueReturnGUI.cs (MCIT/PrintChqueReturn)
 *
 * POST { connectionId, invoiceIds: ["1CBN6909-0001", ...] }
 *
 * หัวใจ clone C#:
 *  - headerANDfooter (L1383-1397): MIH + DEB + PER + JOB — DEBgrade + JOBgroup + MIHdiscHF1/HF2
 *  - ChekSTK (L638-651): มีสินค้าใน BI_CUBE.tb_FaceSheetSTK (STKnotCompany='1')?
 *      → chkHeaderReportType = false → หัว "พาราเทค" + table 6 คอลั่น (ไม่มีรหัสสินค้า)
 *      → ไม่มี → "MCIT" + 7 คอลั่น (มีรหัสสินค้า) + [รหัสลูกค้า] + ผู้ขาย + SALE-SYS-EX-14-5601
 *  - detailInvoice (L1365-1372): MIL + STK — descT + serial (MIS) + quan + uprice + discA + sum
 *  - serial (L1399-1418): MISquan จาก MIS (MISvnos + MISstk + MISline)
 *  - countUnit (L1335-1363): SUM(MILvCol1) ตัด STKgroup='SV' + นับ MILvCol1 ไม่เป็นตัวเลข
 *  - get_refSO (L1434-1460): MILvnos + MILdate ผ่าน MILlinkVCno
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

// ── headerANDfooter (clone C# L1383-1397) ──
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
        MIH.MIHcog,
        MIH.MIHnotes,
        DEB.DEBcreditTerm,
        DEB.DEBcontactT,
        MIH.MIHdiscHT1,
        MIH.MIHdiscHT2,
        CONVERT(nvarchar(255), JOB.JOBcode) + ' , ' + CONVERT(nvarchar(255), JOB.JOBdescT) + ' , ' + CONVERT(nvarchar(255), JOB.JOBdescE) AS JOBdescT,
        (MIH.MIHdiscHF1 + MIH.MIHdiscHF2) AS MIHdisc,
        (MIH.MIHcog - (MIH.MIHdiscHF1 + MIH.MIHdiscHF2)) AS AfterDisc,
        MIH.MIHextraSUM,
        MIH.MIHdesc,
        MIH.MIHprintN,
        JOB.JOBgroup,
        MIH.MIHref1,
        DEB.DEBgrade
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    LEFT JOIN PER ON PER.PERcode = MIH.MIHper
    LEFT JOIN JOB ON JOB.JOBcode = MIH.MIHjob
    WHERE MIH.MIHvnos IN (" . $inList . ")
    ORDER BY MIH.MIHvnos";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($cleanIds);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    reportError('SQL error: ' . $e->getMessage());
}

// ── detailInvoice (clone C# L1365-1372) — MIL + STK ต่อ invoice ──
try {
    $itemsSql = "SELECT
        MIL.MILstk,
        CONVERT(nvarchar(255), MIL.MILdesc) AS descT,
        MIL.MILnotes,
        CONVERT(nvarchar(255), (MIL.MILquan / MIL.MILconv)) + ' ' + CONVERT(nvarchar(255), MIL.MILuname) AS quan,
        MIL.MILuprice,
        MIL.MILdiscA,
        MIL.MILsum,
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

// ── ChekSTK (clone C# L638-651) — มีสินค้า FaceSheetSTK? ──
try {
    $stkSql = "SELECT COUNT(*) AS cnt
    FROM MIL
    WHERE MILvnos = ?
    AND MILstk IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')";
    $stkStmt = $pdo->prepare($stkSql);
    foreach ($rows as &$row) {
        $stkStmt->execute(array($row['MIHvnos']));
        $cnt = (int) $stkStmt->fetchColumn();
        $row['chkHeaderReportType'] = ($cnt === 0);
    }
    unset($row);
} catch (Exception $e) {
    // BI_CUBE ไม่ถึง — ถือว่าไม่มี FaceSheetSTK (เช่น MCIT)
    foreach ($rows as &$row) {
        $row['chkHeaderReportType'] = true;
    }
    unset($row);
}

// ── serial (clone C# L1399-1418) — MISquan ทั้งหมดใน 1 query แล้วจัดตาม vnos+stk+line ──
try {
    $serialSql = "SELECT MISvnos, MISstk, MISline, MISquan FROM MIS WHERE MISvnos IN (" . $inList . ")";
    $serialStmt = $pdo->prepare($serialSql);
    $serialStmt->execute($cleanIds);
    $serialMap = array();
    foreach ($serialStmt->fetchAll(PDO::FETCH_ASSOC) as $s) {
        $key = $s['MISvnos'] . '|' . $s['MISstk'] . '|' . $s['MISline'];
        if (!isset($serialMap[$key])) {
            $serialMap[$key] = array();
        }
        $serialMap[$key][] = $s['MISquan'];
    }
    foreach ($rows as &$row) {
        foreach ($row['items'] as &$item) {
            $key = $row['MIHvnos'] . '|' . $item['MILstk'] . '|' . $item['MILlistNo'];
            $quans = isset($serialMap[$key]) ? $serialMap[$key] : array();
            $item['serial'] = implode(' , ', $quans);
        }
        unset($item);
    }
    unset($row);
} catch (Exception $e) {
    // MIS ไม่มี — serial ว่าง
    foreach ($rows as &$row) {
        foreach ($row['items'] as &$item) {
            $item['serial'] = '';
        }
        unset($item);
    }
    unset($row);
}

// ── countUnit (clone C# L1335-1363) — รวมหน่วยบรรจุ ──
try {
    $unitsSql = "SELECT SUM(CONVERT(INT, CONVERT(NVARCHAR(255), MILvCol1))) AS TOTAL
    FROM MIL
    LEFT JOIN STK ON STK.STKcode = MIL.MILstk
    WHERE STK.STKgroup != 'SV'
    AND ISNUMERIC(CONVERT(NVARCHAR(255), MILvCol1)) <> 0
    AND MILvnos = ?";
    $unitsSql2 = "SELECT CONVERT(NVARCHAR(255), MILvCol1)
    FROM MIL
    LEFT JOIN STK ON STK.STKcode = MIL.MILstk
    WHERE STK.STKgroup != 'SV'
    AND MILvnos = ?
    AND ISNUMERIC(CONVERT(NVARCHAR(255), MILvCol1)) <> 1
    AND CONVERT(VARCHAR(20), MILvCol1) != ''
    GROUP BY CONVERT(NVARCHAR(255), MILvCol1)";
    $unitsStmt = $pdo->prepare($unitsSql);
    $unitsStmt2 = $pdo->prepare($unitsSql2);
    foreach ($rows as &$row) {
        $unitsStmt->execute(array($row['MIHvnos']));
        $total = $unitsStmt->fetchColumn();
        $unit = ($total === null || $total === false || $total === '') ? 0 : $total;
        $unitsStmt2->execute(array($row['MIHvnos']));
        $extra = $unitsStmt2->rowCount();
        $row['totalUnits'] = (int) $unit + (int) $extra;
    }
    unset($row);
} catch (Exception $e) {
    foreach ($rows as &$row) {
        $row['totalUnits'] = 0;
    }
    unset($row);
}

// ── get_refSO (clone C# L1434-1460) — อ้างอิงใบสั่งซื้อ ──
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
    foreach ($rows as &$row) {
        $row['refs'] = array();
    }
    unset($row);
}

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
