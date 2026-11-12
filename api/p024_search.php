<?php
/**
 * P024 — ตรวจสอบมูลหนี้เฝ้าระวัง: ปุ่มค้นหา
 * ตาม C# frm_CheckDebt.cs (btn_check_Click) — MAC-5 (SQL Server)
 * POST { connectionId, province, employee, amount }
 * คืน { ok, count, rows:[{salesP, cusID, cusNameT, grade, maxNetSum, netSum}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
// สุดรับแต่ตัวเลข/รหัส — ตัด ลูกศีล์เพื่อป้องกัน SQL break
$province = isset($body["province"]) ? str_replace("'", "", trim((string)$body["province"])) : "";
$employee = isset($body["employee"]) ? str_replace("'", "", trim((string)$body["employee"])) : "";
$amount = isset($body["amount"]) ? (int)$body["amount"] : 0;

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL คัดมาจาก C# frm_CheckDebt.cs btn_check_Click โดยตรง (ไม่เปลี่ยนคำ)
  $sql = "SELECT * FROM ( SELECT DEBsalesP, CFScusID,CONVERT(nvarchar(200), DEBnameT) DEBnameT,DEBgrade, ";
  $sql .= "( SELECT MAX(MIHnetSUM) FROM MIH WHERE MIHcus = CFScusID AND MIHtype = 'RS' ) MaxNetsum, ";
  $sql .= "SUM(CFSsumREQ - CFSsumCUT1) CFSsum FROM CFS LEFT JOIN DEB ON DEBcode = CFScusID ";
  $sql .= "WHERE CFScusID LIKE '" . $province . "%' AND DEBsalesP LIKE '%" . $employee . "%' ";
  $sql .= "AND CFSclearALL = 0 GROUP BY DEBsalesP,CFScusID,CONVERT(nvarchar(200), DEBnameT),DEBgrade) A ";
  $sql .= "WHERE A.CFSsum > " . $amount . " ORDER BY A.CFScusID";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "salesP" => (string)$r["DEBsalesP"],
      "cusID" => (string)$r["CFScusID"],
      "cusNameT" => (string)$r["DEBnameT"],
      "grade" => (string)$r["DEBgrade"],
      "maxNetSum" => $r["MaxNetsum"],
      "netSum" => $r["CFSsum"]
    );
  }

  echo json_encode(array(
    "ok" => true,
    "count" => count($out),
    "rows" => $out
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
