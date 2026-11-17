<?php
/**
 * P093 — ใบอนุมัติ PO: ข้อมูลสต็อกเฉลี่ย/ยอดขาย (DWH_InventoryDay)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO.DWH_InventoryDay
 * POST { connectionId, stk }
 * คืนค่า { ok, row:{qty, ivAvg, iv30, iv60, iv90, soAvg, so30, so60, so90}
 * หมายเหตุ: ใช้ OPENQUERY(SERVERBI) — ถ้า linked server ไม่มีจะคืน ok:false
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$stk = isset($body["stk"]) ? trim($body["stk"]) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL ตาม C# DWH_InventoryDay — ดึง DWH_InventoryDay ข้ามเซิร์ฟผ่าน OPENQUERY
  $sql = "SELECT STKcode, SUM(SBLquan) AS qty," .
    " MAX(B.IV_AVG) AS IV_AVG, MAX(B.FC_IV_30) AS FC_IV_30, MAX(B.FC_IV_60) AS FC_IV_60," .
    " MAX(B.FC_IV_90) AS FC_IV_90, MAX(B.SO_AVG) AS SO_AVG, MAX(B.FC_SO_30) AS FC_SO_30," .
    " MAX(B.FC_SO_60) AS FC_SO_60, MAX(B.FC_SO_90) AS FC_SO_90" .
    " FROM STK" .
    " LEFT JOIN SBL ON SBL.SBLstk = STK.STKcode" .
    " LEFT JOIN (SELECT * FROM OPENQUERY(SERVERBI, 'SELECT * FROM [DWH].[dbo].[DWH_InventoryDay]')) AS B" .
    " ON B.MILstk = STK.STKcode" .
    " WHERE STKcode = ?" .
    " AND SBLsto IN ('01','01-CL','03','04-1','04-2','04-3','06','FRE')" .
    " GROUP BY STKcode";

  $st = $db->prepare($sql);
  $st->execute(array($stk));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $row = array(
    "qty" => 0,
    "ivAvg" => null, "iv30" => null, "iv60" => null, "iv90" => null,
    "soAvg" => null, "so30" => null, "so60" => null, "so90" => null
  );
  if (count($rows) > 0) {
    $r = $rows[0];
    $row = array(
      "qty" => (float)$r["qty"],
      "ivAvg" => $r["IV_AVG"] === null ? null : (float)$r["IV_AVG"],
      "iv30" => $r["FC_IV_30"] === null ? null : (float)$r["FC_IV_30"],
      "iv60" => $r["FC_IV_60"] === null ? null : (float)$r["FC_IV_60"],
      "iv90" => $r["FC_IV_90"] === null ? null : (float)$r["FC_IV_90"],
      "soAvg" => $r["SO_AVG"] === null ? null : (float)$r["SO_AVG"],
      "so30" => $r["FC_SO_30"] === null ? null : (float)$r["FC_SO_30"],
      "so60" => $r["FC_SO_60"] === null ? null : (float)$r["FC_SO_60"],
      "so90" => $r["FC_SO_90"] === null ? null : (float)$r["FC_SO_90"]
    );
  }

  echo json_encode(array(
    "ok" => true,
    "row" => $row
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
