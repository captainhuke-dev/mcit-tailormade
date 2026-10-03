<?php
/**
 * P051 — รายงานการเก็บเงินสด — Export CSV
 * POST { connectionId, status, reportType, keyword }
 * Download CSV — **cp874 (TIS-620)** + CRLF — Excel Windows ไทยเปิดเป็นตารางทันที
 */
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";
$reportType = isset($body["reportType"]) ? trim($body["reportType"]) : "all";
$keyword = isset($body["keyword"]) ? trim($body["keyword"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

$statusCodes = [];
if ($status !== "") {
  foreach (explode(",", $status) as $s) {
    $s = trim($s);
    if ($s !== "" && preg_match("/^\d+$/", $s)) {
      $statusCodes[] = (int)$s;
    }
  }
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $sql = "SELECT
\tMIH.MIHvnos,
\tCONVERT ( DATE, STR( MIHday ) + '/' + STR( MIHmonth ) + '/' + STR( MIHyear ), 103 ) MIHdate,
\tDEB.DEBcode,
\tCONVERT ( NVARCHAR ( 255 ), DEB.DEBnameT ) + '  ' + CONVERT ( NVARCHAR ( 100 ), DEB.DEBcontactT ) AS DEBnameT,
\tMIH.MIHper,
\tMIH.MIHnetSUM
\tFROM
\tMIH
\tLEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
\tWHERE
\tMIH.MIHtype LIKE 'IS'";

  $params = [];
  if (!empty($statusCodes)) {
    $sql .= "\n\tAND MIH.MIHstatus IN (" . implode(",", array_fill(0, count($statusCodes), "?")) . ")";
    $params = array_merge($params, $statusCodes);
  }
  if ($reportType === "cash") {
    $sql .= "\n\tAND MIH.MIHdesc LIKE ?";
    $params[] = "%เงินสด%";
  }

  $sql .= "\nORDER BY\n\tMIH.MIHvnos ASC";

  $st = $db->prepare($sql);
  $st->execute($params);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
  http_response_code(500);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

/* quick search (client-side filter เดียวกัน) */
if ($keyword !== "") {
  $kw = mb_strtolower($keyword, "UTF-8");
  $rows = array_values(array_filter($rows, function ($r) use ($kw) {
    $text = mb_strtolower(
      (isset($r["MIHvnos"]) ? $r["MIHvnos"] : "") . " " .
      (isset($r["DEBcode"]) ? $r["DEBcode"] : "") . " " .
      (isset($r["DEBnameT"]) ? $r["DEBnameT"] : "") . " " .
      (isset($r["MIHper"]) ? $r["MIHper"] : ""),
      "UTF-8"
    );
    return strpos($text, $kw) !== false;
  }));
}

/* cp874 — Excel Windows ไทยอ่านเป็นตารางทันที */
function to874($s) {
  $out = @iconv("UTF-8", "TIS-620//TRANSLIT//IGNORE", (string)$s);
  return $out === false ? (string)$s : $out;
}
function csvCell($s) {
  return '"' . str_replace('"', '""', to874($s)) . '"';
}

$dt = new DateTime("now", new DateTimeZone("Asia/Bangkok"));
$lines = [];
$lines[] = implode(",", [csvCell("เลขใบสำคัญ"), csvCell("วันที่"), csvCell("รหัสลูกค้า"), csvCell("ชื่อลูกค้า"), csvCell("ผู้แทน"), csvCell("ยอดเงินสุทธิ")]);
foreach ($rows as $r) {
  $d = isset($r["MIHdate"]) ? substr((string)$r["MIHdate"], 8, 2) . "/" . substr((string)$r["MIHdate"], 5, 2) . "/" . substr((string)$r["MIHdate"], 0, 4) : "";
  $lines[] = implode(",", [
    csvCell(isset($r["MIHvnos"]) ? $r["MIHvnos"] : ""),
    csvCell($d),
    csvCell(isset($r["DEBcode"]) ? $r["DEBcode"] : ""),
    csvCell(isset($r["DEBnameT"]) ? trim((string)$r["DEBnameT"]) : ""),
    csvCell(isset($r["MIHper"]) ? $r["MIHper"] : ""),
    csvCell(number_format((float)(isset($r["MIHnetSUM"]) ? $r["MIHnetSUM"] : 0), 2, ".", ","))
  ]);
}

$filename = "p051-cash-collection-" . $dt->format("Ymd-His") . ".csv";
header("Content-Type: text/csv; charset=windows-874");
header("Content-Disposition: attachment; filename=\"" . $filename . "\"");
header("Cache-Control: no-cache, must-revalidate");
echo implode("\r\n", $lines) . "\r\n";
