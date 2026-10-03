<?php
/**
 * P008 — รายการกลุ่มลูกหนี้ (dropdown)
 * POST { connectionId }
 * { ok, groups: [ { code, desc } ] }
 * SQL: SELECT DEGcode, DEGdescT FROM DEG
 */
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set("display_errors", "0");

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";

if ($connectionId === "") {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
    exit;
}

require __DIR__ . "/lib/db.php";
try {
    $db = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $st = $db->query("SELECT DEGcode, DEGdescT FROM DEG WHERE DEGcode IS NOT NULL AND DEGcode != '' ORDER BY DEGcode ASC");
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$out = [];
foreach ($rows as $r) {
    $out[] = [
        "code" => isset($r["DEGcode"]) ? $r["DEGcode"] : "",
        "desc" => isset($r["DEGdescT"]) ? $r["DEGdescT"] : ""
    ];
}

echo json_encode(["ok" => true, "groups" => $out], JSON_UNESCAPED_UNICODE);
