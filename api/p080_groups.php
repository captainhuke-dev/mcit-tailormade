<?php
/**
 * P080 - ตั้งค่ากลุ่มสินค้าแบตเตอรี
 * ตาราง: BI_CUBE.[dbo].[tb_GroupBattery]
 * POST { connectionId, action:"list" }
 * POST { connectionId, action:"upsert", code, descT, status }
 * POST { connectionId, action:"delete", code }
 * GET  ?connectionId=...  (เทียบเท่า list)
 */
require __DIR__ . "/lib/db.php";

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

$raw = file_get_contents("php://input");
$in = json_decode($raw, true);
if (!is_array($in)) $in = array();

function pick($in, $key, $default) {
  if (isset($in[$key]) && $in[$key] !== "") return $in[$key];
  if (isset($_GET[$key]) && $_GET[$key] !== "") return $_GET[$key];
  return $default;
}

$connectionId = pick($in, "connectionId", "");
$action = pick($in, "action", "list");
$method = isset($_SERVER["REQUEST_METHOD"]) ? $_SERVER["REQUEST_METHOD"] : "GET";

if ($connectionId === "") {
  echo json_encode(array("ok" => false, "error" => "ไม่พบการเชื่อมต่อฐานข้อมูล"), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

/* ---------- list ---------- */
if ($method === "GET" || $action === "list") {
  try {
    $st = $db->query("SELECT STGcode, STGdescT, STGstatus FROM BI_CUBE.[dbo].[tb_GroupBattery] ORDER BY STGcode");
    $rows = array();
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
      $rows[] = array(
        "code"   => (string) $r["STGcode"],
        "descT"  => $r["STGdescT"] !== null ? (string) $r["STGdescT"] : "",
        "status" => (string) $r["STGstatus"],
      );
    }
    echo json_encode(array("ok" => true, "count" => count($rows), "rows" => $rows), JSON_UNESCAPED_UNICODE);
  } catch (Exception $e) {
    echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
  }
  exit;
}

/* ---------- upsert ---------- */
if ($method === "POST" && $action === "upsert") {
  $code   = isset($in["code"]) ? trim((string) $in["code"]) : "";
  $descT  = isset($in["descT"]) ? trim((string) $in["descT"]) : "";
  $status = isset($in["status"]) ? trim((string) $in["status"]) : "Active";

  if ($code === "") {
    echo json_encode(array("ok" => false, "error" => "กรุณาระบุรหัสกลุ่ม"), JSON_UNESCAPED_UNICODE);
    exit;
  }
  if ($status !== "Active" && $status !== "Inactive") {
    echo json_encode(array("ok" => false, "error" => "สถานะไม่ถูกต้อง"), JSON_UNESCAPED_UNICODE);
    exit;
  }

  try {
    $st = $db->prepare("SELECT COUNT(*) AS c FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGcode = ?");
    $st->execute(array($code));
    $found = $st->fetch(PDO::FETCH_ASSOC);
    $exists = ((int) $found["c"]) > 0;

    if ($exists) {
      $st = $db->prepare("UPDATE BI_CUBE.[dbo].[tb_GroupBattery] SET STGdescT = ?, STGstatus = ? WHERE STGcode = ?");
      $st->execute(array($descT, $status, $code));
      $done = "update";
    } else {
      $st = $db->prepare("INSERT INTO BI_CUBE.[dbo].[tb_GroupBattery] (STGcode, STGdescT, STGstatus) VALUES (?, ?, ?)");
      $st->execute(array($code, $descT, $status));
      $done = "insert";
    }
    echo json_encode(array("ok" => true, "action" => $done, "code" => $code), JSON_UNESCAPED_UNICODE);
  } catch (Exception $e) {
    echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
  }
  exit;
}

/* ---------- delete ---------- */
if ($method === "POST" && $action === "delete") {
  $code = isset($in["code"]) ? trim((string) $in["code"]) : "";
  if ($code === "") {
    echo json_encode(array("ok" => false, "error" => "กรุณาระบุรหัสกลุ่ม"), JSON_UNESCAPED_UNICODE);
    exit;
  }
  try {
    $st = $db->prepare("DELETE FROM BI_CUBE.[dbo].[tb_GroupBattery] WHERE STGcode = ?");
    $st->execute(array($code));
    if ($st->rowCount() === 0) {
      echo json_encode(array("ok" => false, "error" => "ไม่พบกลุ่ม " . $code), JSON_UNESCAPED_UNICODE);
    } else {
      echo json_encode(array("ok" => true, "action" => "delete", "code" => $code), JSON_UNESCAPED_UNICODE);
    }
  } catch (Exception $e) {
    echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
  }
  exit;
}

echo json_encode(array("ok" => false, "error" => "ไม่ทราบคำสั่ง: " . $action), JSON_UNESCAPED_UNICODE);
