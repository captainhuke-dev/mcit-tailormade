<?php
/**
 * P072 — MCIT Print Invoice รับเอง: รายการภายใต้ใบแจ้งหนี้ (สำหรับหน้า Preview)
 * ตาม C# MCIT_FrmPrintInvoiceGetYourselfGUI.cs (detailInvoice + serial) — MAC5 (SQL Server)
 * POST { connectionId, invoiceNo }
 * คืน { ok, items:[{code, name, notes, qty, price, amount}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$invoiceNo = isset($body["invoiceNo"]) ? trim($body["invoiceNo"]) : "";

if ($invoiceNo === "") {
  echo json_encode(array("ok" => false, "error" => "ไม่มีเลขที่ใบแจ้งหนี้"), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

// ทำสุทธิ descT ตาม C# Doc13: ตัด (B)(X)(J)(C)(CL), เปลี่ยน \r\n เป็นวรรคศัพด์, ตัดที่ '@'
function p072_clean_desc($desc) {
  $desc = str_replace(array("(B)", "(X)", "(J)", "(C)", "(CL)"), " ", (string)$desc);
  $desc = str_replace(array("\r\n", "\n"), " ", $desc);
  $pos = strpos($desc, "@");
  if ($pos !== false) {
    $desc = substr($desc, 0, $pos);
  }
  return trim($desc);
}

try {
  // SQL detailInvoice ตาม C# โดยตรง
  $sql = " SELECT MIL.MILstk,CONVERT(nvarchar(255),MIL.MILdesc) as descT,MIL.MILnotes, CONVERT(nvarchar(255),(MIL.MILquan/MIL.MILconv)) + ' ' + CONVERT(nvarchar(255),MIL.MILuname) as quan,MIL.MILuprice,MIL.MILdiscA,MIL.MILsum,MILlistNo FROM MIL INNER JOIN dbo.STK ON dbo.STK.STKcode = dbo.MIL.MILstk WHERE MILvnos = '" . $invoiceNo . "' ORDER BY MILlistNo ";

  $st = $db->query($sql);
  $rows = $st->fetchAll(PDO::FETCH_ASSOC);

  $items = array();
  foreach ($rows as $r) {
    $stk = (string)$r["MILstk"];
    $listNo = (string)$r["MILlistNo"];

    // SQL serial ตาม C# โดยตรง — รวบ MISquan เป็น " q1 ,q2"
    $serialSql = " SELECT MISquan  FROM MIS WHERE MISvnos = '" . $invoiceNo . "' AND MISstk = '" . $stk . "' AND MISline = '" . $listNo . "' ";
    $st2 = $db->query($serialSql);
    $serialRows = $st2->fetchAll(PDO::FETCH_ASSOC);
    $serial = "";
    foreach ($serialRows as $s) {
      $serial .= " " . $s["MISquan"] . " ,";
    }
    if (strlen($serial) > 0) {
      $serial = substr($serial, 0, strlen($serial) - 1);
    }

    $name = p072_clean_desc($r["descT"]);
    if (strlen($serial) > 0) {
      $name .= "(" . $serial . ")";
    }

    $items[] = array(
      "code" => $stk,
      "name" => $name,
      "notes" => (string)$r["MILnotes"],
      "qty" => (string)$r["quan"],
      "price" => (float)$r["MILuprice"],
      "amount" => (float)$r["MILsum"]
    );
  }

  echo json_encode(array("ok" => true, "items" => $items), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
