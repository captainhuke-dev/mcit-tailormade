<?php
/**
 * P069 — MCIT Print Invoice Drop Ship: ปุ่มค้นหา
 * ตาม C# MCIT_frmPrintInvoiceDropShipped_GUI.cs (bt_search_Click) — MAC5 (SQL Server)
 * POST { connectionId, dateFrom, dateTo, prefix, customerCode, createdBy, status }
 * คืน { ok, count, rows:[{invoiceNo, customerCode, customer, area, amount, remark, copies, createdBy, cnt, cnt2}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$prefix = isset($body["prefix"]) ? trim($body["prefix"]) : "";
$customerCode = isset($body["customerCode"]) ? trim($body["customerCode"]) : "";
$createdBy = isset($body["createdBy"]) ? trim($body["createdBy"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

// C# ใช้ dt_date.Value.ToString("yyyy/MM/dd") — แปลง yyyy-MM-dd จากฟอร์มเป็น yyyy/MM/dd
function p069_date_lit($d) {
  $d = trim((string)$d);
  if ($d === "") {
    return "";
  }
  $p = explode("-", $d);
  if (count($p) !== 3) {
    return $d;
  }
  return $p[0] . "/" . $p[1] . "/" . $p[2];
}

try {
  // SQL ตาม bt_search_Click โดยตรง (LIKE '%ผู้รับ%' / '%ส่งต่อ%' คงไว้ตามที่ผู้ใช้เขียน)
  $sql = " SELECT MIH.MIHvnos,MIH.MIHcus,DEB.DEBadd3AT,DEB.DEBnameT,DEB.DEBcontactT,MIH.MIHnetSUM,MIH.MIHdesc,MIH.MIHprintN, ";
  $sql .= " (SELECT COUNT(MIL.MILlistNo) FROM MIL WHERE MIL.MILvnos = MIH.MIHvnos) cnt,";
  $sql .= " (SELECT COUNT(DISTINCT SUBSTRING(MIL.MILlinkVCno, 1, 3)) FROM MIL WHERE MIL.MILvnos = MIH.MIHvnos AND SUBSTRING(MIL.MILlinkVCno, 1, 3) NOT IN ('RED','SGI','SGC'))  cnt2,";
  $sql .= "  MIH.MIHkeyUser FROM MIH ";
  $sql .= " LEFT JOIN DEB ON DEB.DEBcode = MIH.MIHcus WHERE MIH.MIHtype = 'IS' ";
  if ($dateFrom !== "") {
    $sql .= " AND CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear),103) >= '" . p069_date_lit($dateFrom) . "' ";
  }
  if ($dateTo !== "") {
    $sql .= " AND CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear),103) <= '" . p069_date_lit($dateTo) . "' ";
  }
  if ($prefix !== "") {
    $sql .= " AND MIH.MIHvnos like '" . $prefix . "%' ";
  }
  if ($customerCode !== "") {
    $sql .= " AND MIH.MIHcus like '%" . $customerCode . "%' ";
  }
  if ($createdBy !== "") {
    $sql .= " AND MIH.MIHkeyUser like '%" . $createdBy . "%' ";
  }
  if ($status !== "") {
    $sql .= " AND MIH.MIHstatus = " . $status;
  }
  $sql .= " AND (MIH.MIHdesc LIKE '%ผู้รับ%' OR MIH.MIHdesc LIKE '%ส่งต่อ%') ";
  $sql .= " ORDER BY MIH.MIHvnos ";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  $id = 1;
  foreach ($rows as $r) {
    $out[] = array(
      "id" => $id++,
      "invoiceNo" => (string)$r["MIHvnos"],
      "customerCode" => (string)$r["MIHcus"],
      "customer" => (string)$r["DEBnameT"],
      "area" => (string)$r["DEBadd3AT"],
      "amount" => (float)$r["MIHnetSUM"],
      "remark" => (string)$r["MIHdesc"],
      "copies" => (int)$r["MIHprintN"],
      "createdBy" => (string)$r["MIHkeyUser"],
      "cnt" => (int)$r["cnt"],
      "cnt2" => (int)$r["cnt2"]
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
