<?php
/**
 * P038 — item 2 sub: comment per vnos (C# FrmEditComment.cs)
 *   GET-style: {connectionId, vnos}           -> { ok, desc }
 *   save:      {connectionId, vnos, desc}     -> UPDATE MIH SET MIHdesc = ? WHERE MIHvnos = ?
 * { ok, desc? , error? }
 * PHP 7.3-compatible
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$vnos = isset($body["vnos"]) ? trim($body["vnos"]) : "";

if ($connectionId === "" || $vnos === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "ข้อมูลไม่ครบ"], JSON_UNESCAPED_UNICODE);
  exit;
}
if (!preg_match("/^[A-Za-z0-9\-]+$/", $vnos)) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "เลขที่ใบสำคัญไม่ถูกต้อง"], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

$hasDesc = array_key_exists("desc", $body);
$desc = $hasDesc ? (string) $body["desc"] : "";

try {
  if (!$hasDesc) {
    /* read (FrmEditComment_Load) */
    $st = $db->prepare("SELECT MIHdesc FROM MIH WHERE MIHvnos = ?");
    $st->execute(array($vnos));
    $row = $st->fetch(PDO::FETCH_ASSOC);
    echo json_encode(array(
      "ok" => true,
      "desc" => $row ? (string) $row["MIHdesc"] : ""
    ), JSON_UNESCAPED_UNICODE);
  } else {
    /* save (FrmEditComment btn_save_Click) */
    $st = $db->prepare("UPDATE MIH SET MIHdesc = ? WHERE MIHvnos = ?");
    $st->execute(array($desc, $vnos));
    echo json_encode(array(
      "ok" => true,
      "desc" => $desc
    ), JSON_UNESCAPED_UNICODE);
  }
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}
