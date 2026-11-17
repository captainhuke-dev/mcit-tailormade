<?php
/**
 * P093 — ใบอนุมัติ PO: สตอร์ก์คงเหลือ (getSTKBalance)
 * SQL คัดออกจาก C# frm_ApprovePO_GUI._ApprovePO.getSTKBalance
 * POST { connectionId, stk }
 * คืนค่า { ok, row:{stk, b01, b01B, b01CL, b02, b03, b04, b04B, b06, bFRE, bRTV}
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
  // SQL ตาม C# getSTKBalance — SBL แยกตาม SBLsto (04-1/04-2/04-3 → 04, HWH/RSV → 02,
  // 11/12/50/51/CFR/CLAIM/RW/XC → RTV) แสดง "จำนวน/conv" ในรูป "N/M"
  $sql = "SELECT tb.SBLstk, STK.STKconv1, tb.[01], tb.[01-B], tb.[01-CL], tb.[02], tb.[03], tb.[04], tb.[04-B], tb.[06], tb.[FRE], tb.[RTV]" .
    " FROM (" .
    " SELECT A.SBLstk," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '01' THEN A.SBLquan END, 0)) AS [01]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '01-B' THEN A.SBLquan END, 0)) AS [01-B]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '01-CL' THEN A.SBLquan END, 0)) AS [01-CL]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '02' THEN A.SBLquan END, 0)) AS [02]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '03' THEN A.SBLquan END, 0)) AS [03]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '04' THEN A.SBLquan END, 0)) AS [04]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '04-B' THEN A.SBLquan END, 0)) AS [04-B]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN '06' THEN A.SBLquan END, 0)) AS [06]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN 'FRE' THEN A.SBLquan END, 0)) AS [FRE]," .
    " SUM(ISNULL(CASE A.SBLsto WHEN 'RTV' THEN A.SBLquan END, 0)) AS [RTV]" .
    " FROM (SELECT SBLstk," .
    " (CASE SBLsto WHEN '04-1' THEN '04' WHEN '04-2' THEN '04' WHEN '04-3' THEN '04' WHEN '04-B' THEN '04-B' WHEN 'HWH' THEN '02' WHEN 'RSV' THEN '02' WHEN '11' THEN 'RTV' WHEN '12' THEN 'RTV' WHEN '50' THEN 'RTV' WHEN '51' THEN 'RTV' WHEN 'CFR' THEN 'RTV' WHEN 'CLAIM' THEN 'RTV' WHEN 'RW' THEN 'RTV' WHEN 'XC' THEN 'RTV' ELSE SBLsto END) AS [SBLsto]," .
    " SUM(SBLquan) AS SBLquan" .
    " FROM [M5CM-AA-01].[dbo].[SBL]" .
    " WHERE SBLsto IN ('01','01-B','01-CL','02','HWH','RSV','03','04-1','04-2','04-3','04-B','05','06','FRE','11','12','50','51','CFR','CLAIM','RW','XC','FRE')" .
    " AND SBLstk = ?" .
    " GROUP BY SBLstk, CASE SBLsto WHEN '04-1' THEN '04' WHEN '04-2' THEN '04' WHEN '04-3' THEN '04' WHEN '04-B' THEN '04-B' WHEN 'HWH' THEN '02' WHEN 'RSV' THEN '02' WHEN '11' THEN 'RTV' WHEN '12' THEN 'RTV' WHEN '50' THEN 'RTV' WHEN '51' THEN 'RTV' WHEN 'CFR' THEN 'RTV' WHEN 'CLAIM' THEN 'RTV' WHEN 'RW' THEN 'RTV' WHEN 'XC' THEN 'RTV' ELSE SBLsto END) [A]" .
    " GROUP BY A.SBLstk) [tb]" .
    " LEFT JOIN STK ON STKcode = tb.SBLstk";

  $st = $db->prepare($sql);
  $st->execute(array($stk));
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  function p093_fmtNm($q, $conv) {
    $q = (int)$q;
    $conv = (int)$conv;
    if ($conv <= 0) {
      return (string)$q;
    }
    return intdiv($q, $conv) . "/" . ($q % $conv);
  }

  $row = array(
    "stk" => $stk,
    "b01" => "0/0", "b01B" => "0/0", "b01CL" => "0/0",
    "b02" => "0/0", "b03" => "0/0", "b04" => "0/0", "b04B" => "0/0",
    "b06" => "0/0", "bFRE" => "0/0", "bRTV" => "0/0"
  );
  if (count($rows) > 0) {
    $r = $rows[0];
    $conv = $r["STKconv1"] === null ? 0 : (int)$r["STKconv1"];
    $row = array(
      "stk" => (string)$r["SBLstk"],
      "b01" => p093_fmtNm($r["01"], $conv),
      "b01B" => p093_fmtNm($r["01-B"], $conv),
      "b01CL" => p093_fmtNm($r["01-CL"], $conv),
      "b02" => p093_fmtNm($r["02"], $conv),
      "b03" => p093_fmtNm($r["03"], $conv),
      "b04" => p093_fmtNm($r["04"], $conv),
      "b04B" => p093_fmtNm($r["04-B"], $conv),
      "b06" => p093_fmtNm($r["06"], $conv),
      "bFRE" => p093_fmtNm($r["FRE"], $conv),
      "bRTV" => p093_fmtNm($r["RTV"], $conv)
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
