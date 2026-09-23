<?php
/**
 * P053 — สติ๊กเกอร์ 10x7.5 (ใบปะ) (search)
 * POST { connectionId, vnos }
 * MAC5 (SQL Server) — MIH + DEB (+ MIL + BI_CUBE สำหรับประเภท A)
 *
 * เงื่อนไข (user spec 2026-09-22):
 * 1. MIHdesc LIKE '%ส่งต่อ%' → ประเภท B (จำนวน = MIHref2)
 *    ไม่มี → ประเภท A
 * 2. ประเภท A: รวมตัวเลขจาก MILnotes (MIL โดย MILvnos — ยกเว้น
 *    MILstk ที่อยู่ใน BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCount = '1')
 * 3. ประเภท A รวม <= 0 → count = 0 (UI เปิด modal ให้ใส่จำนวน)
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
// doc number: alphabet/digit/dash/underscore only
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

// Query 1 (user verbatim) — main document
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

// Type: MIHdesc LIKE '%ส่งต่อ%' → B, else A
$desc = (string) $r['MIHdesc'];
$type = (strpos($desc, 'ส่งต่อ') !== false) ? 'B' : 'A';

$count = 0;
$countSource = null;

if ($type === 'B') {
    // B: จำนวนจาก MIHref2 (ตัวเลข)
    if (preg_match_all('/\d+/', (string) $r['MIHref2'], $m)) {
        foreach ($m[0] as $n) {
            $count += (int) $n;
        }
    }
    $countSource = 'ref2';
} else {
    // A: รวมตัวเลขจาก MILnotes (ยกเว้น MILstk ที่ STKnotCount = '1')
    $sql2 = "SELECT MIL.MILnotes
        FROM MIL
        WHERE MIL.MILvnos = '" . $vnos . "'
            AND MIL.MILstk NOT IN (
                SELECT STKcode FROM BI_CUBE.dbo.tb_FaceSheetSTK WHERE STKnotCount = '1'
            )";
    try {
        $stmt2 = $pdo->query($sql2);
        while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
            if (preg_match_all('/\d+/', (string) $row['MILnotes'], $m)) {
                foreach ($m[0] as $n) {
                    $count += (int) $n;
                }
            }
        }
        $countSource = 'milnotes';
    } catch (Exception $e) {
        // BI_CUBE ข้าม DB อาจไม่อยู่ — ให้ count = 0 (UI ให้ใส่จำนวนเอง)
        $count = 0;
        $countSource = 'milnotes-error';
    }
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
