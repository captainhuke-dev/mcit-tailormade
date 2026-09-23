<?php
/**
 * P106 — Print Barcode — ค้นหารายการสินค้า (MAC5)
 * source: product = STKcode LIKE 'r%'
 *        po      = MIL+STK+MIH  MIHtype='PP'  MILvnos LIKE 'r%'
 *        receive = MIL+STK+MIH  MIHtype='IP'  MILvnos LIKE 'r%'
 * POST { connectionId, source, reference }
 * { ok, rows: [{code, name, barcode}], total }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$source = isset($body["source"]) ? trim($body["source"]) : "product";
$reference = isset($body["reference"]) ? trim($body["reference"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($reference === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "กรอกรหัสสินค้า หรือ เลขที่เอกสาร เพื่อค้นหา"], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!in_array($source, ["product", "po", "receive"], true)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "source ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
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
  if ($source === "product") {
    // 1) ค้นหาจากรหัสสินค้า — จำกัด 50 rows
    $sql = "SELECT TOP 50 STKcode, STKdescT1, STKdescE3, STKbarC1 FROM STK WHERE STKcode LIKE ? AND STKlock = 0 AND STKhide = 0";
  } else {
    // 2) PO (MIHtype='PP') / 3) Receive (MIHtype='IP') — จำกัด 50 rows
    // MIHtypeอยู่ในตาราง MIH (ไม่ใช่ MIL) — ต้อง JOIN MIH ON MIHvnos = MILvnos
    $type = ($source === "po") ? "PP" : "IP";
    $sql = "SELECT TOP 50 STK.STKcode, STK.STKdescT1, STK.STKdescE3, STK.STKbarC1
            FROM MIL
            LEFT JOIN STK ON STK.STKcode = MIL.MILstk
            LEFT JOIN MIH ON MIH.MIHvnos = MIL.MILvnos
            WHERE MIH.MIHtype = ? AND MIL.MILvnos LIKE ?";
  }

  $st = $db->prepare($sql);
  if ($source === "product") {
    $st->execute([$reference . "%"]);
  } else {
    $st->execute([($source === "po") ? "PP" : "IP", $reference . "%"]);
  }
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  // dedupe by STKcode (PO/Receive มีหลายแถวต่อรหัสเดียวกันได้)
  $seen = [];
  $out = [];
  foreach ($rows as $r) {
    $code = isset($r["STKcode"]) ? trim($r["STKcode"]) : "";
    if ($code === "" || isset($seen[$code])) continue;
    $seen[$code] = true;
    $out[] = [
      "code" => $code,
      "name" => isset($r["STKdescT1"]) ? $r["STKdescT1"] : "",
      "descE3" => isset($r["STKdescE3"]) ? $r["STKdescE3"] : "",
      "barcode" => isset($r["STKbarC1"]) ? $r["STKbarC1"] : ""
    ];
  }

  echo json_encode([
    "ok" => true,
    "rows" => $out,
    "total" => count($out)
  ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
