<?php
/**
 * P034 — ประวัติทางการเงินลูกหนี้ — ค้นหาลูกหนี้ (autocomplete)
 * POST { connectionId, q }
 * { ok, rows: [ { code, name, groupCode, groupName, grade, since, phone, address, rep, creditDays, curCredit } ] }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$q = isset($body["q"]) ? trim($body["q"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($q === "") {
  echo json_encode(["ok" => true, "rows" => []], JSON_UNESCAPED_UNICODE);
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
  $st = $db->prepare("SELECT TOP 50
	DEBcode,
	DEBgroup,
	DEG.DEGdescT,
	DEBnameT,
	CONVERT ( VARCHAR ( 255 ), DEBcontactT ) AS DEBcontactT,
	CONVERT ( VARCHAR ( 15 ), DEBdate, 101 ) AS DEBdate,
	DEBlimit,
	DEBcreditTerm,
	DEBtel,
	DEBgrade,
	CONVERT ( VARCHAR ( 255 ), DEBadd1AT ) + ' ' + CONVERT ( VARCHAR ( 255 ), DEBadd2AT ) + ' ' + CONVERT ( VARCHAR ( 255 ), DEBadd3AT ) AS address,
	DEBsalesP AS sale 
	FROM
	DEB
	LEFT JOIN DEG ON DEG.DEGcode = DEB.DEBgroup 
	WHERE
	( DEBcode LIKE ? OR DEBnameT LIKE ? OR CONVERT ( VARCHAR ( 255 ), DEBcontactT ) LIKE ? )
	AND DEBhide = 0
	AND DEBlock = 0");
  $st->execute([$q . "%", "%" . $q . "%", "%" . $q . "%"]);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = [];
  foreach ($rows as $r) {
    $district = isset($r["DEBcontactT"]) ? trim($r["DEBcontactT"]) : "";
    $district = trim($district, "() 	");
    $out[] = [
      "code" => isset($r["DEBcode"]) ? $r["DEBcode"] : "",
      "name" => isset($r["DEBnameT"]) ? $r["DEBnameT"] : "",
      "district" => $district,
      "groupCode" => isset($r["DEBgroup"]) ? $r["DEBgroup"] : "",
      "groupName" => isset($r["DEGdescT"]) ? $r["DEGdescT"] : "",
      "grade" => isset($r["DEBgrade"]) ? $r["DEBgrade"] : "",
      "since" => isset($r["DEBdate"]) ? $r["DEBdate"] : "",
      "phone" => isset($r["DEBtel"]) ? $r["DEBtel"] : "",
      "address" => isset($r["address"]) ? trim($r["address"]) : "",
      "rep" => isset($r["sale"]) ? $r["sale"] : "",
      "creditDays" => isset($r["DEBcreditTerm"]) ? (int)$r["DEBcreditTerm"] : 0,
      "curCredit" => isset($r["DEBlimit"]) ? (float)$r["DEBlimit"] : 0.0
    ];
  }

  echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
