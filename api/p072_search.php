<?php
/**
 * P072 — MCIT Print Invoice รับเอง: ปุ่มค้นหา
 * ตาม C# MCIT_FrmPrintInvoiceGetYourselfGUI.cs (MCIT_FrmPrintInvoiceGetYourselfGUI_Click) — MAC5 (SQL Server)
 * POST { connectionId, dateFrom, dateTo, perCode, status }
 * คืน { ok, count, rows:[{id, date, invoiceNo, customerCode, customer, area, amount, copies, createdBy, status, cnt, cnt2}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$dateFrom = isset($body["dateFrom"]) ? trim($body["dateFrom"]) : "";
$dateTo = isset($body["dateTo"]) ? trim($body["dateTo"]) : "";
$perCode = isset($body["perCode"]) ? trim($body["perCode"]) : "";
$status = isset($body["status"]) ? trim($body["status"]) : "";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

// C# ใช้ dt_date.Value.ToString("yyyy/MM/dd") — แปลง yyyy-MM-dd จากฟอร์มเป็น yyyy/MM/dd
function p072_date_lit($d) {
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
  // SQL คัดมาจาก C# MCIT_FrmPrintInvoiceGetYourselfGUI_Click โดยตรง (ไม่เปลี่ยนคำ)
  $sql = " SELECT dbo.MIH.MIHday, dbo.MIH.MIHmonth, dbo.MIH.MIHyear, dbo.MIH.MIHvnos, dbo.MIH.MIHcus, ";
  $sql .= " dbo.DEB.DEBadd1AT, dbo.DEB.DEBadd2AT, dbo.DEB.DEBadd3AT, dbo.DEB.DEBadd3AE, MIH.MIHkeyUser, MIH.MIHkeyDate, ";
  $sql .= " dbo.DEB.DEBtel, dbo.DEB.DEBfax, dbo.MIH.MIHper, dbo.PER.PERnameT, MIH.MIHmemo, MIHdiscHT1, MIHdiscHT2, ";
  $sql .= " dbo.DEB.DEBnameE, dbo.MIH.MIHnetSUM, dbo.MIH.MIHvatSUM, (MIH.MIHcog - MIH.MIHdiscLST) MIHcog, dbo.MIH.MIHnotes, DEB.DEBcreditTerm, DEB.DEBcontactT, ";
  $sql .= " CONVERT(nvarchar(255),JOB.JOBcode) + ' , ' + CONVERT(nvarchar(255),JOB.JOBdescT) + ' , ' + CONVERT(nvarchar(255),JOB.JOBdescE) AS JOBdescT, (MIH.MIHdiscHF1 + MIH.MIHdiscHF2) AS MIHdisc, ";
  $sql .= " (MIHcog - (MIH.MIHdiscHF1 + MIH.MIHdiscHF2 + MIH.MIHdiscLST)) AS AfterDisc, MIH.MIHextraSUM, MIHprintN, MIH.MIHref1, JOB.JOBgroup, ";
  $sql .= " (SELECT COUNT(MIL.MILlistNo) FROM MIL WHERE MIL.MILvnos = MIH.MIHvnos) cnt, ";
  $sql .= " (SELECT COUNT(DISTINCT SUBSTRING(MILlinkVCno, 1, 3)) FROM MIL WHERE MILvnos = MIH.MIHvnos AND SUBSTRING(MILlinkVCno, 1, 3) NOT IN ('RED','SGI','SGC')) cnt2 ";
  $sql .= " FROM dbo.MIH ";
  $sql .= " LEFT JOIN dbo.DEB ON dbo.DEB.DEBcode = dbo.MIH.MIHcus ";
  $sql .= " LEFT JOIN dbo.PER ON dbo.PER.PERcode = dbo.MIH.MIHper ";
  $sql .= " LEFT JOIN dbo.JOB ON dbo.JOB.JOBcode = dbo.MIH.MIHjob ";
  $sql .= " WHERE dbo.MIH.MIHtype = 'IS' ";
  if ($dateFrom !== "") {
    $sql .= " AND CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear),103) >= '" . p072_date_lit($dateFrom) . "' ";
  }
  if ($dateTo !== "") {
    $sql .= " AND CONVERT(DATE,STR(MIH.MIHday)+'/'+STR(MIH.MIHmonth)+'/'+STR(MIH.MIHyear),103) <= '" . p072_date_lit($dateTo) . "' ";
  }
  if ($status !== "") {
    $sql .= " AND dbo.MIH.MIHstatus = " . $status . " ";
  }
  if ($perCode !== "") {
    $sql .= " AND MIH.MIHper like '%". $perCode . "%' ";
  }
  $sql .= " ORDER BY MIH.MIHvnos ";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $out = array();
  $id = 1;
  foreach ($rows as $r) {
    $date = sprintf("%04d-%02d-%02d", (int)$r["MIHyear"], (int)$r["MIHmonth"], (int)$r["MIHday"]);
    $out[] = array(
      "id" => $id++,
      "date" => $date,
      "invoiceNo" => (string)$r["MIHvnos"],
      "customerCode" => (string)$r["MIHcus"],
      "customer" => (string)$r["DEBnameE"],
      "area" => (string)$r["DEBadd3AT"],
      "amount" => (float)$r["MIHnetSUM"],
      "copies" => (int)$r["MIHprintN"],
      "createdBy" => (string)$r["MIHkeyUser"],
      "status" => $status,
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
