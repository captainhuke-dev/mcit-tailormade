<?php
/**
 * P050 — ใบวางบิล — รายงานใบวางบิล (รายใบ)
 * POST { connectionId, vnos }
 * { ok, row: { code, nameE, contactT, add1, add2, add3, creditTerm, zone, vnos, date, dueDate, per, perName, discHF1, cog, vatSUM, netSUM } }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$vnos = isset($body["vnos"]) ? trim($body["vnos"]) : "";

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($vnos === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "เลขที่ invoice ไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
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
    ROW_NUMBER() OVER (ORDER BY MIHvnos DESC) AS Row,
    DEB.DEBcode,
    DEB.DEBnameT,
    DEB.DEBnameE,
    DEB.DEBcontactT,
    DEB.DEBadd1AT,
    DEB.DEBadd2AT,
    DEB.DEBadd3AT,
    DEB.DEBcreditTerm,
    DEB.DEBzone,
    MIH.MIHvnos,
    CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103) AS MIHdate,
    DATEADD(DAY, 30, CONVERT(DATE, STR(MIH.MIHday) + '/' + STR(MIH.MIHmonth) + '/' + STR(MIH.MIHyear), 103)) AS Duedate,
    MIH.MIHper,
    PER.PERnameT,
    MIH.MIHdiscHF1,
    MIH.MIHcog,
    MIH.MIHvatSUM,
    MIH.MIHnetSUM
FROM
    MIH
    LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus
    LEFT JOIN PER ON PER.PERcode = MIH.MIHper
WHERE
    MIHvnos = ?");
  $st->execute([$vnos]);
  $r = $st->fetch(PDO::FETCH_ASSOC);

  if (!$r) {
    echo json_encode(["ok" => false, "error" => "ไม่พบใบแจ้งหนี้ " . $vnos], JSON_UNESCAPED_UNICODE);
    exit;
  }

  $fmt = function ($iso) {
    if (!$iso) return "";
    $t = strtotime($iso);
    return $t ? date("d/m/Y", $t) : "";
  };

  echo json_encode([
    "ok" => true,
    "row" => [
      "row" => isset($r["Row"]) ? (int)$r["Row"] : 1,
      "code" => isset($r["DEBcode"]) ? $r["DEBcode"] : "",
      "nameT" => isset($r["DEBnameT"]) ? $r["DEBnameT"] : "",
      "nameE" => isset($r["DEBnameE"]) ? $r["DEBnameE"] : "",
      "contactT" => isset($r["DEBcontactT"]) ? $r["DEBcontactT"] : "",
      "add1" => isset($r["DEBadd1AT"]) ? $r["DEBadd1AT"] : "",
      "add2" => isset($r["DEBadd2AT"]) ? $r["DEBadd2AT"] : "",
      "add3" => isset($r["DEBadd3AT"]) ? $r["DEBadd3AT"] : "",
      "creditTerm" => isset($r["DEBcreditTerm"]) && $r["DEBcreditTerm"] !== null ? (int)$r["DEBcreditTerm"] : 0,
      "zone" => isset($r["DEBzone"]) ? $r["DEBzone"] : "",
      "vnos" => isset($r["MIHvnos"]) ? $r["MIHvnos"] : "",
      "date" => $fmt(isset($r["MIHdate"]) ? $r["MIHdate"] : ""),
      "dueDate" => $fmt(isset($r["Duedate"]) ? $r["Duedate"] : ""),
      "per" => isset($r["MIHper"]) ? $r["MIHper"] : "",
      "perName" => isset($r["PERnameT"]) ? $r["PERnameT"] : "",
      "discHF1" => isset($r["MIHdiscHF1"]) ? (float)$r["MIHdiscHF1"] : 0.0,
      "cog" => isset($r["MIHcog"]) ? (float)$r["MIHcog"] : 0.0,
      "vatSUM" => isset($r["MIHvatSUM"]) ? (float)$r["MIHvatSUM"] : 0.0,
      "netSUM" => isset($r["MIHnetSUM"]) ? (float)$r["MIHnetSUM"] : 0.0
    ]
  ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
