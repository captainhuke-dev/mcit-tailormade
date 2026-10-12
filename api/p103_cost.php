<?php
/**
 * P103 — ตรวจสอบต้นทุนปัจจุบัน vs นำเข้า+ค่าขนส่ง (MAC5)
 * clone C# frm_CheckCOST_GUI.cs — getPR (MILtype='PX') / getPO (MILtype='PP') / getRE (MILtype='IP') / getRateBalance (CST)
 * POST { connectionId, stk, groups: ["G01","G06"] }
 * { ok, product, balance, pr, po, re, summary }
 */
header("Content-Type: application/json; charset=utf-8");

require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "";
$stk = isset($body["stk"]) ? trim($body["stk"]) : "";
$groups = isset($body["groups"]) && is_array($body["groups"]) ? $body["groups"] : [];

if ($connectionId === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "connectionId เป็นข้อผิดพลาด"], JSON_UNESCAPED_UNICODE);
  exit;
}
if ($stk === "") {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดเลือกสินค้า"], JSON_UNESCAPED_UNICODE);
  exit;
}

// whitelist กลุ่มคลัง (clone C# checkedListBox2) — ป้องกัน injection
$ALLOWED = ["G01", "G02", "G03", "G04", "G06", "G07", "G09", "PD", "RTV"];
$groups = array_values(array_intersect($ALLOWED, array_map("trim", $groups)));
if (count($groups) === 0) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "โปรดเลือกกลุ่มคลังสินค้า อย่างน้อย 1 ตัวเลือก"], JSON_UNESCAPED_UNICODE);
  exit;
}
$inList = "";
foreach ($groups as $g) {
  $inList .= "'" . $g . "',";
}
$inList = "(" . substr($inList, 0, strlen($inList) - 1) . ")";
// clone C# btn_search_Click — STO filter
$sto = " ( SELECT STOcode FROM STO WHERE STOgroup IN " . $inList . " AND STOlock=0 AND STOhide=0 ) ";

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

function p103_num($s) {
  return (float) str_replace([",", " "], "", (string) $s);
}
function p103_rate($v) {
  return $v === null ? "" : number_format((float) $v, 2);
}

try {
  // ---------- product info (units) ----------
  $st = $db->prepare("SELECT STKcode, STKdescT1,
        CASE STKunit1 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 ELSE '' END AS MainUnit,
        CASE STKunit2 WHEN 1 THEN STKuname1 WHEN 2 THEN STKuname2 WHEN 3 THEN STKuname3 WHEN 4 THEN STKuname4 WHEN 5 THEN STKuname5 ELSE '' END AS SubUnit
        FROM STK WHERE STKcode = ?");
  $st->execute([$stk]);
  $p = $st->fetch(PDO::FETCH_ASSOC);
  $product = $p ? ["code" => $p["STKcode"], "name" => $p["STKdescT1"], "mainUnit" => $p["MainUnit"], "subUnit" => $p["SubUnit"]] : null;

  // ---------- balance (CST) — clone C# getRateBalance ----------
  $sql = "SELECT A.CSTstk, FORMAT (SUM ( A.QTY ), '#,##0.000' ) [QTY], FORMAT (SUM ( A.CSTcostF ), '#,##0.000' ) [CSTcostF],
          FORMAT (CASE SUM (A.QTY) WHEN 0 THEN 0 ELSE SUM ( A.CSTcostF ) / SUM ( A.QTY ) END , '#,##0.000' ) CSTavg
          FROM ( SELECT CSTstk,
            SUM(CASE CSTtype WHEN 'SP' THEN CSTquan WHEN 'IS' THEN -1*CSTquan WHEN 'AS' THEN -1*CSTquan WHEN 'BS' THEN CSTquan WHEN 'IP' THEN CSTquan WHEN 'AP' THEN -1*CSTquan
            WHEN 'BP' THEN -1*CSTquan WHEN 'BF' THEN CSTquan WHEN 'SS' THEN -1*CSTquan WHEN 'JX' THEN (CASE WHEN CSTio = 1 THEN CSTquan WHEN CSTio = 2 THEN -1*CSTquan END)
            WHEN 'MX' THEN (CASE WHEN CSTio = 1 THEN CSTquan WHEN CSTio = 2 THEN -1*CSTquan END) END) [QTY],
            SUM(CASE CSTtype WHEN 'SP' THEN CSTcostF WHEN 'IS' THEN -1*CSTcostF WHEN 'AS' THEN -1*CSTcostF WHEN 'BS' THEN CSTcostF WHEN 'IP' THEN CSTcostF WHEN 'AP' THEN -1*CSTcostF WHEN 'BP' THEN -1*CSTcostF
            WHEN 'BF' THEN CSTcostF WHEN 'SS' THEN -1*CSTcostF WHEN 'JX' THEN (CASE WHEN CSTio = 1 THEN CSTcostF WHEN CSTio = 2 THEN -1*CSTcostF END)
            WHEN 'MX' THEN (CASE WHEN CSTio = 1 THEN CSTcostF WHEN CSTio = 2 THEN -1*CSTcostF END) END) [CSTcostF]
            FROM CST INNER JOIN STK ON STKcode = CSTstk
            WHERE CSTstk = ? AND CSTsto IN " . $sto . "
            AND CSTtype NOT IN ('PP','PS','PX') AND CSTio<=2 AND CSTdate <= GETDATE()
            GROUP BY CSTstk ) A GROUP BY A.CSTstk";
  $st = $db->prepare($sql);
  $st->execute([$stk]);
  $b = $st->fetch(PDO::FETCH_ASSOC);
  $balance = $b ? ["qty" => $b["QTY"], "avgCost" => $b["CSTavg"], "value" => $b["CSTcostF"]] : ["qty" => "0", "avgCost" => "0", "value" => "0"];

  // ---------- PR (MILtype='PX') — clone C# getPR ----------
  $sql = "SELECT TOP 5 CONVERT (DATE,STR( MIL.MILday ) + '/' + STR( MIL.MILmonth ) + '/' + STR( MIL.MILyear ),103 ) dateID,MILvnos,
          CONVERT ( nvarchar ( 50 ), STKuname1 ) MILuname,
          FORMAT ( SUM ( MILsum ), '#,##0.00' ) MILsum, FORMAT ( SUM ( MILquan ), '#,##0.##' ) qty,
          FORMAT ( SUM ( MILsum ) / SUM ( MILquan ), '#,##0.00' ) Uprice,
          CASE SUBSTRING(MILvnos, 1, 4) WHEN 'PRU6' THEN 'USD' WHEN 'PRY6' THEN 'RMB' WHEN 'PRCN' THEN 'RMB' ELSE 'THB' END CCYunitT1
          FROM MIL LEFT JOIN STK ON STK.STKcode = MIL.MILstk
          WHERE MILtype = 'PX' AND MILstk = ? AND MILsto IN " . $sto . "
          GROUP BY CONVERT (DATE,STR( MIL.MILday ) + '/' + STR( MIL.MILmonth ) + '/' + STR( MIL.MILyear ),103 ),MILvnos,CONVERT ( nvarchar ( 50 ), STKuname1 )
          ORDER BY dateID DESC";
  $st = $db->prepare($sql);
  $st->execute([$stk]);
  $pr = [];
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
    $pr[] = ["date" => $r["dateID"], "vnos" => $r["MILvnos"], "unit" => $r["MILuname"], "qty" => $r["qty"], "sum" => $r["MILsum"], "uprice" => $r["Uprice"], "ccy" => $r["CCYunitT1"]];
  }

  // ---------- PO (MILtype='PP') — clone C# getPO ----------
  $sql = "SELECT TOP 5 CONVERT (DATE,STR( MIL.MILday ) + '/' + STR( MIL.MILmonth ) + '/' + STR( MIL.MILyear ),103 ) dateID,MILvnos,
          CONVERT(nvarchar(50),STKuname1) MILuname,
          FORMAT(SUM(MILsum),'#,##0.00') MILsum, FORMAT(SUM(MILquan),'#,##0.##') qty,
          FORMAT(SUM(MILsum)/SUM(MILquan),'#,##0.00') Uprice,MILexchg,
          CASE WHEN CONVERT ( nvarchar ( 50 ),CCYunitT1) IS NOT NULL THEN CONVERT ( nvarchar ( 50 ),CCYunitT1) ELSE 'THB' END CCYunitT1,
          FORMAT (SUM ( MILsum * MILexchg ), '#,##0.00' ) sumTHB,
          FORMAT ( SUM ( MILsum * MILexchg) / SUM ( MILquan ), '#,##0.00' ) UpriceTHB
          FROM MIL LEFT JOIN CCY ON CCY.CCYcode = MIL.MILcurC LEFT JOIN STK ON STK.STKcode = MIL.MILstk
          WHERE MILtype = 'PP' AND MILstk = ? AND MILsto IN " . $sto . "
          GROUP BY CONVERT (DATE,STR( MIL.MILday ) + '/' + STR( MIL.MILmonth ) + '/' + STR( MIL.MILyear ),103 ),MILvnos,CONVERT(nvarchar(50),STKuname1),
          MILexchg, CONVERT ( nvarchar ( 50 ),CCYunitT1)
          ORDER BY dateID DESC";
  $st = $db->prepare($sql);
  $st->execute([$stk]);
  $po = [];
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
    $po[] = ["date" => $r["dateID"], "vnos" => $r["MILvnos"], "unit" => $r["MILuname"], "qty" => $r["qty"], "sum" => $r["MILsum"], "uprice" => $r["Uprice"], "exRate" => p103_rate($r["MILexchg"]), "ccy" => $r["CCYunitT1"], "sumTHB" => $r["sumTHB"], "upriceTHB" => $r["UpriceTHB"]];
  }

  // ---------- RE (MILtype='IP') — clone C# getRE ----------
  $sql = "SELECT TOP 5 CONVERT (DATE,STR( MIL.MILday ) + '/' + STR( MIL.MILmonth ) + '/' + STR( MIL.MILyear ),103 ) dateID,MILvnos,
          CONVERT(nvarchar(50),STKuname1) MILuname,
          FORMAT(SUM(MILquan),'#,##0.##') qty, FORMAT(SUM(MILacost),'#,##0.00') Allcost,
          FORMAT(SUM(MILacost) / SUM(MILquan),'#,##0.000') Ucost,MILexchg,
          CASE WHEN CONVERT ( nvarchar ( 50 ),CCYunitT1) IS NOT NULL THEN CONVERT ( nvarchar ( 50 ),CCYunitT1) ELSE 'THB' END CCYunitT1,
          FORMAT ( SUM ( MILacost * MILexchg ), '#,##0.00' ) costTHB,
          FORMAT ( SUM ( MILacost * MILexchg ) / SUM ( MILquan ), '#,##0.000' ) UcostTHB
          FROM MIL LEFT JOIN CCY ON CCY.CCYcode = MIL.MILcurC
          LEFT JOIN STK ON STK.STKcode = MIL.MILstk
          WHERE MILtype = 'IP' AND MILstk = ? AND MILsto IN " . $sto . "
          GROUP BY CONVERT (DATE,STR( MIL.MILday ) + '/' + STR( MIL.MILmonth ) + '/' + STR( MIL.MILyear ),103 ),MILvnos,CONVERT(nvarchar(50),STKuname1),
          MILexchg,CONVERT ( nvarchar ( 50 ),CCYunitT1)
          ORDER BY dateID DESC";
  $st = $db->prepare($sql);
  $st->execute([$stk]);
  $re = [];
  foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) {
    $re[] = ["date" => $r["dateID"], "vnos" => $r["MILvnos"], "unit" => $r["MILuname"], "qty" => $r["qty"], "cost" => $r["Allcost"], "ucost" => $r["Ucost"], "exRate" => p103_rate($r["MILexchg"]), "ccy" => $r["CCYunitT1"], "costTHB" => $r["costTHB"], "ucostTHB" => $r["UcostTHB"]];
  }

  // ---------- summary (intent demo — updateSummary) ----------
  $summary = [
    "prPrice" => count($pr) > 0 ? p103_num($pr[0]["uprice"]) : null,
    "prCcy" => count($pr) > 0 ? $pr[0]["ccy"] : null,
    "purchasePrice" => count($po) > 0 ? p103_num($po[0]["upriceTHB"]) : null,
    "extraCost" => count($re) > 0 ? p103_num($re[0]["costTHB"]) : null,
    "avgCost" => p103_num($balance["avgCost"])
  ];

  echo json_encode(["ok" => true, "product" => $product, "balance" => $balance, "pr" => $pr, "po" => $po, "re" => $re, "summary" => $summary], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(["ok" => false, "error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
