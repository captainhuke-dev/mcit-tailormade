<?php
/**
 * P025 — ตรวจสอบบิลเกิน due: ปุ่มค้นหา
 * ตาม C# frm_CheckDebtDue.cs (btn_check_Click) — MAC-5 (SQL Server)
 * POST { connectionId, province, employee, days }
 * คืน { ok, count, rows:[{salesP, cusID, cusNameT, grade, billDate, billNo, amount}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
// สุดรับแต่ตัวเลข/รหัส — ตัด ลักศูล์เพื่อป้องกัน SQL break
$province = isset($body["province"]) ? str_replace("'", "", trim((string)$body["province"])) : "";
$employee = isset($body["employee"]) ? str_replace("'", "", trim((string)$body["employee"])) : "";
$days = isset($body["days"]) ? (int)$body["days"] : 0;

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // SQL คัดมาจาก C# frm_CheckDebtDue.cs btn_check_Click โดยตรง (ไม่เปลี่ยนคำ)
  $sql = "SELECT DEBsalesP,CFScusID,CONVERT(nvarchar(200), DEBnameT) DEBnameT,DEBgrade, ";
  $sql .= "FORMAT(CFSdateID, 'yyyy-MM-dd') CFSdateID, CFSvnosID, (CFSsumREQ - CFSsumCUT1) amout ";
  $sql .= "FROM CFS LEFT JOIN DEB ON DEBcode = CFScusID ";
  $sql .= "WHERE CFSclearALL = 0 AND CFScusID LIKE '" . $province . "%' ";
  $sql .= "AND DEBsalesP LIKE '%" . $employee . "%' ";
  $sql .= "AND DATEDIFF(DAY, CFSdateID, GETDATE()) >= " . $days . " ";
  $sql .= "AND CFSvnosID NOT LIKE 'DEP%' AND (CFSsumREQ - CFSsumCUT1) > 0 ORDER BY CFScusID";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  foreach ($rows as $r) {
    $out[] = array(
      "salesP" => (string)$r["DEBsalesP"],
      "cusID" => (string)$r["CFScusID"],
      "cusNameT" => (string)$r["DEBnameT"],
      "grade" => (string)$r["DEBgrade"],
      "billDate" => (string)$r["CFSdateID"],
      "billNo" => (string)$r["CFSvnosID"],
      "amount" => $r["amout"]
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
