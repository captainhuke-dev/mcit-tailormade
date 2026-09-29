<?php
/**
 * P047 — probe (temp) — statuses AR_S + MIH status codes ใน range
 */
require_once __DIR__ . '/lib/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb('c1788406814359');
$out = array();

try {
    $st = $pdo->query("SELECT AR_Scode, AR_SnameT FROM AR_S WHERE AR_SnameT IS NOT NULL AND AR_Scode IN (62,63,65,67,68,70) ORDER BY AR_Scode");
    $out['ar_s'] = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { $out['ar_s_err'] = $e->getMessage(); }

try {
    $st = $pdo->query("SELECT MIHstatus, COUNT(*) c FROM MIH WHERE MIHcancel = 0 AND MIHtype = 'IS'
        AND CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) >= '2026-08-01'
        AND CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) <= '2026-09-26'
        GROUP BY MIHstatus ORDER BY MIHstatus");
    $out['mih_status_dist'] = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { $out['mih_status_err'] = $e->getMessage(); }

try {
    $st = $pdo->query("SELECT COUNT(*) c FROM MIH WHERE MIHcancel = 0 AND MIHtype = 'IS'
        AND MIHstatus IN (62,63,65,67,68,70)
        AND CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) >= '2026-08-01'
        AND CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) <= '2026-09-26'");
    $out['count_range'] = $st->fetchColumn();
} catch (Exception $e) { $out['count_err'] = $e->getMessage(); }

try {
    $st = $pdo->query("SELECT TOP 5 CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) d, MIHper, MIHvnos, DEB.DEBcode, DEBnameT, MIHstatus
        FROM MIH LEFT JOIN DEB ON DEB.DEBcode = MIHcus
        WHERE MIHcancel = 0 AND MIHtype = 'IS' AND MIHstatus IN (62,63,65,67,68,70)
        AND CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) >= '2026-08-01'
        AND CONVERT(DATE, STR(MIHday)+'/'+STR(MIHmonth)+'/'+STR(MIHyear),103) <= '2026-09-26'
        ORDER BY d");
    $out['sample'] = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { $out['sample_err'] = $e->getMessage(); }

echo json_encode($out, JSON_UNESCAPED_UNICODE);
