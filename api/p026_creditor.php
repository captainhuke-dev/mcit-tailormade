<?php
/**
 * P026 — ประวัติการเงินเจ้าหนี้ — ข้อมูลเบื้องต้นเจ้าหนี้
 * POST { connectionId, code }
 * { ok, creditor: { code, groupCode, name, since, address, limit } }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$code = isset($body["code"]) ? trim($body["code"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($code === "") {
  echo json_encode(["ok" => false, "error" => "code ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $st = $db->prepare("SELECT
\tCRE.CREcode,
\tCRE.CREgroup,
\tCRE.CREnameT,
\tCONVERT ( DATE, CRE.CREdate, 103 ) CREdate,
\tCAST ( CRE.CREadd1AT AS VARCHAR ) + ' ' + CAST ( CRE.CREadd2AT AS VARCHAR ) + ' ' + CAST ( CRE.CREadd3AT AS VARCHAR ) address,
\tCRE.CRElimit
\tFROM
\tCRE
\tWHERE
\tCRE.CREcode = ?");
  $st->execute([$code]);
  $r = $st->fetch(PDO::FETCH_ASSOC);

  if (!$r) {
    echo json_encode(["ok" => true, "creditor" => null], JSON_UNESCAPED_UNICODE);
    exit;
  }

  echo json_encode([
    "ok" => true,
    "creditor" => [
      "code" => isset($r["CREcode"]) ? $r["CREcode"] : "",
      "groupCode" => isset($r["CREgroup"]) ? $r["CREgroup"] : "",
      "name" => isset($r["CREnameT"]) ? $r["CREnameT"] : "",
      "since" => isset($r["CREdate"]) ? $r["CREdate"] : "",
      "address" => isset($r["address"]) ? trim($r["address"]) : "",
      "limit" => isset($r["CRElimit"]) ? (float)$r["CRElimit"] : 0.0
    ]
  ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
