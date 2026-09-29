<?php
require_once __DIR__ . '/lib/db.php';
header('Content-Type: application/json; charset=utf-8');
$pdo = getDb('c1788406814359');
$out = array();
try {
    $st = $pdo->query("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME LIKE '%PRN%' OR TABLE_NAME LIKE '%PRINT%' OR COLUMN_NAME LIKE '%print%' GROUP BY TABLE_NAME, COLUMN_NAME ORDER BY TABLE_NAME");
    $out['print_cols'] = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) { $out['print_err'] = $e->getMessage(); }
echo json_encode($out, JSON_UNESCAPED_UNICODE);
