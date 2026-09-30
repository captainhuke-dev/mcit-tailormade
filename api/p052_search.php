<?php
/**
 * P052 — สติ๊กเกอร์ 10x10 (ใบปะ) (search) — ตาม C# MCIT_Frm_FaceSheetProductV2
 * POST { connectionId, vnos }
 * MAC5 (SQL Server)
 *
 * Logic (C# GeneratePdf):
 * 1. MIH + DEB โดย MIHvnos
 * 2. MIHdesc LIKE '%ส่งต่อ%' → type B (count = MIHref2) — ไม่ check company
 *    ไม่ → type A:
 *      count = CountCopyPrint: รวมตัวเลข MILnotes (MILstk NOT IN tb_FaceSheetSTK STKnotCount='1')
 *      count <= 0 → UI ให้ใส่จำนวน (modal)
 *      company = typeReport: MIHcus IN BI_CUBE.tb_FaceSheetDEB → NotCompany
 *              หรือ MILstk IN tb_FaceSheetSTK STKnotCompany='1' → NotCompany — ไม่ → Company
 * 3. total = totalCopy: รวมตัวเลข MILnotes ทั้งหมด (ไม่ filter) — แสดง "i/total"
 */
require_once __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$connectionId = isset($input['connectionId']) ? trim($input['connectionId']) : '';
$vnos = isset($input['vnos']) ? trim($input['vnos']) : '';

if ($connectionId === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'connectionId required'));
    exit;
}
if ($vnos === '') {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'vnos required'));
    exit;
}
if (!preg_match('/^[A-Za-z0-9\-_]+$/', $vnos)) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'invalid vnos'));
    exit;
}

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'DB connection failed'));
    exit;
}

// Query 1 (C# verbatim) — main document
$miHdate = "CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103)";
$sql = "SELECT
        " . $miHdate . " AS MIHdate,
        MIH.MIHvnos,
        MIH.MIHcus,
        MIH.MIHmemo,
        DEB.DEBnameT,
        DEB.DEBcontactT,
        DEB.DEBtel,
        MIH.MIHref2,
        MIH.MIHdesc
    FROM MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    WHERE MIH.MIHvnos = '" . $vnos . "'";

try {
    $stmt = $pdo->query($sql);
    $r = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('ok' => false, 'error' => 'Query failed'));
    exit;
}

if (!$r) {
    echo json_encode(array('ok' => true, 'found' => false));
    exit;
}

$desc = (string) $r['MIHdesc'];
$type = (strpos($desc, 'ส่งต่อ') !== false) ? 'B' : 'A';

// sum digits from MILnotes (with optional NOT IN filter)
function sumMilNotes($pdo, $vnos, $exclude) {
    $sql = "SELECT MILnotes FROM MIL WHERE MILvnos = '" . $vnos . "'";
    if ($exclude) {
        $sql .= " AND MILstk NOT IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCount = '1')";
    }
    $stmt = $pdo->query($sql);
    $sum = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (preg_match_all('/\d+/', (string) $row['MILnotes'], $m)) {
            foreach ($m[0] as $n) {
                $sum += (int) $n;
            }
        }
    }
    return $sum;
}

$count = 0;
$countSource = null;
$company = 'Company';

if ($type === 'B') {
    // B: count = MIHref2 (C# Convert.ToInt16)
    if (preg_match('/\d+/', (string) $r['MIHref2'], $m)) {
        $count = (int) $m[0];
    }
    $countSource = 'ref2';
} else {
    // A: CountCopyPrint + typeReport
    try {
        $count = sumMilNotes($pdo, $vnos, true);
        $countSource = 'milnotes';
    } catch (Exception $e) {
        $count = 0;
        $countSource = 'milnotes-error';
    }
    try {
        $st = $pdo->query("SELECT MIHcus FROM MIH WHERE MIHvnos = '" . $vnos . "' AND MIHcus IN (SELECT DEBcode FROM BI_CUBE.dbo.tb_FaceSheetDEB)");
        if ($st->fetch()) {
            $company = 'NotCompany';
        } else {
            $st2 = $pdo->query("SELECT MILstk FROM MIL WHERE MILvnos = '" . $vnos . "' AND MILstk IN (SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCompany = '1')");
            if ($st2->fetch()) {
                $company = 'NotCompany';
            }
        }
    } catch (Exception $e) {
        $company = 'Company'; // BI_CUBE ข้าม DB อาจไม่อยู่ — default Company (show address)
    }
}

// total = totalCopy (ทั้งหมด — ไม่ filter) — แสดง "i/total"
$total = 0;
try {
    $total = sumMilNotes($pdo, $vnos, false);
} catch (Exception $e) {
    $total = 0;
}

// date → d/m/พ.ศ. (ค.ศ. + 543)
$dateStr = '';
if ($r['MIHdate']) {
    $ts = strtotime($r['MIHdate']);
    if ($ts) {
        $dateStr = date('d/m/', $ts) . (date('Y', $ts) + 543);
    }
}

echo json_encode(array(
    'ok' => true,
    'found' => true,
    'type' => $type,
    'count' => $count,
    'countSource' => $countSource,
    'total' => $total,
    'company' => $company,
    'row' => array(
        'date' => $dateStr,
        'vn' => $r['MIHvnos'],
        'cus' => $r['MIHcus'],
        'memo' => $r['MIHmemo'],
        'name' => $r['DEBnameT'],
        'contact' => $r['DEBcontactT'],
        'tel' => $r['DEBtel'],
        'ref2' => $r['MIHref2'],
        'desc' => $r['MIHdesc']
    )
));
