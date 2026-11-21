<?php
/**
 * P094 — PO Dropship: รายละเอียดสินค้า (ตาม C# getPOjob + getPOdetail + checking + getCRE)
 * POST { connectionId, poNo, cus }
 * คืนค่า { ok, poNo, cus:{code,nameT,add1,tel,fax},
 *        jobs:[{cusCode,cusName,grade,contact,job,jobDescT,jobDescE,
 *               details:[{stk,desc,quan,unit,uprice,sum,discA,check}]}]
 * PHP 7.3-compatible (ห้าม fn())
 */
header("Content-Type: application/json; charset=utf-8");
ini_set("memory_limit", "512M");
require __DIR__ . "/lib/db.php";

$body = json_decode(file_get_contents("php://input"), true);
$connectionId = isset($body["connectionId"]) ? trim($body["connectionId"]) : "c1788406814359";
$poNo = isset($body["poNo"]) ? trim($body["poNo"]) : "";
$cus = isset($body["cus"]) ? trim($body["cus"]) : "";

if ($poNo === "") {
  http_response_code(400);
  echo json_encode(array("ok" => false, "error" => "poNo ต้องมีค่า"), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $db = getDb($connectionId);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  // 1) ข้อมูล CRE (C# getCRE) — สำหรับส่วนหัวเอกสาร
  $cusInfo = array("code" => $cus, "nameT" => "", "add1" => "", "tel" => "", "fax" => "");
  if ($cus !== "") {
    $st = $db->prepare("SELECT CREcode, CREnameT, CREadd1AT, CREtel, CREfax FROM CRE WHERE CREcode = ?");
    $st->execute(array($cus));
    $c = $st->fetch(PDO::FETCH_ASSOC);
    if ($c) {
      $cusInfo = array(
        "code" => (string)$c["CREcode"],
        "nameT" => (string)$c["CREnameT"],
        "add1" => $c["CREadd1AT"] === null ? "" : (string)$c["CREadd1AT"],
        "tel" => $c["CREtel"] === null ? "" : (string)$c["CREtel"],
        "fax" => $c["CREfax"] === null ? "" : (string)$c["CREfax"]
      );
    }
  }

  // 2) Jobs (C# getPOjob) — MIL ⋈ JOB ⋈ DEB
  $st = $db->prepare(
    "SELECT CONVERT(nvarchar(50), MILvCol1) AS MILvCol1," .
    " CONVERT(nvarchar(255), DEBnameT) AS DEBnameT, DEBgrade," .
    " CONVERT(nvarchar(255), DEBcontactT) AS DEBcontactT, MILjob," .
    " CONVERT(nvarchar(255), JOBdescT) AS JOBdescT, CONVERT(nvarchar(255), JOBdescE) AS JOBdescE" .
    " FROM MIL" .
    " LEFT JOIN JOB ON JOBcode = MILjob" .
    " LEFT JOIN DEB ON DEBcode = CONVERT(nvarchar(50), MILvCol1)" .
    " WHERE MILvnos = ?" .
    " GROUP BY CONVERT(nvarchar(50), MILvCol1), CONVERT(nvarchar(255), DEBnameT), DEBgrade," .
    " CONVERT(nvarchar(255), DEBcontactT), MILjob, CONVERT(nvarchar(255), JOBdescT), CONVERT(nvarchar(255), JOBdescE)" .
    " ORDER BY CONVERT(nvarchar(50), MILvCol1)"
  );
  $st->execute(array($poNo));
  $jobRows = $st->fetchAll(PDO::FETCH_ASSOC);

  $jobs = array();
  foreach ($jobRows as $jr) {
    $vCol1 = (string)$jr["MILvCol1"];
    $job = (string)$jr["MILjob"];

    // 3) รายละเอียด (C# getPOdetail) — MIL ⋈ STK
    $st2 = $db->prepare(
      "SELECT MILstk, CONVERT(nvarchar(255), STKdescT1) AS STKdescT1," .
      " (MILquan / MILconv) AS quan, MILuname, MILuprice, MILsum, MILdiscA, MILadisc" .
      " FROM MIL" .
      " LEFT JOIN DEB ON DEBcode = CONVERT(nvarchar(50), MILvCol1)" .
      " LEFT JOIN STK ON STKcode = MILstk" .
      " WHERE MILvnos = ? AND CONVERT(nvarchar(100), MILvCol1) = ? AND MILjob = ?" .
      " ORDER BY CONVERT(nvarchar(100), MILvCol1)"
    );
    $st2->execute(array($poNo, $vCol1, $job));
    $detailRows = $st2->fetchAll(PDO::FETCH_ASSOC);

    $details = array();
    foreach ($detailRows as $dr) {
      $stk = (string)$dr["MILstk"];
      // 4) Check (C# checking) — มีรายการ IS ของลูกค้านั้นหรือไม่
      $st3 = $db->prepare("SELECT MILstk FROM MIL WHERE MILtype = 'IS' AND MILstk = ? AND MILcus = ?");
      $st3->execute(array($stk, $vCol1));
      $chk = $st3->fetch(PDO::FETCH_ASSOC);

      $details[] = array(
        "stk" => $stk,
        "desc" => $dr["STKdescT1"] === null ? "" : (string)$dr["STKdescT1"],
        "quan" => (float)$dr["quan"],
        "unit" => $dr["MILuname"] === null ? "" : (string)$dr["MILuname"],
        "uprice" => (float)$dr["MILuprice"],
        "sum" => (float)$dr["MILsum"],
        "discA" => (float)$dr["MILdiscA"],
        "check" => $chk ? "OK" : "ASK"
      );
    }

    $jobs[] = array(
      "cusCode" => $vCol1,
      "cusName" => $jr["DEBnameT"] === null ? "" : (string)$jr["DEBnameT"],
      "grade" => $jr["DEBgrade"] === null ? "" : (string)$jr["DEBgrade"],
      "contact" => $jr["DEBcontactT"] === null ? "" : (string)$jr["DEBcontactT"],
      "job" => $job,
      "jobDescT" => $jr["JOBdescT"] === null ? "" : (string)$jr["JOBdescT"],
      "jobDescE" => $jr["JOBdescE"] === null ? "" : (string)$jr["JOBdescE"],
      "details" => $details
    );
  }

  echo json_encode(array(
    "ok" => true,
    "poNo" => $poNo,
    "cus" => $cusInfo,
    "jobs" => $jobs
  ), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
}
