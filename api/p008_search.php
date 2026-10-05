<?php
/**
 * P008 — Search (ใบปะหน้าเก็บบัญชี VAT, No VAT V2)
 * POST {connectionId, province, group, asOf, collector}
 * SQL: clone C# MCIT_FrmAccountServiceGUI_VATversion_V2
 *   - ยอดหนี้ = SUM(CFSsumREQ - CFSsumCUT1) FROM CFS (CFSclearALL=0, CFSclearUSER=0, (req-cut)!=0, date<=asOf, vnos LIKE 40+ prefixes)
 *   - ยอดปรับหนี้ = SUM(CDCnetSUM) FROM CDC (typeID AS/BS, cancel=0, linkVtype2 ว่าง, vnos LIKE DNN/DNR/DNV/CNN/CNV/1DNN/1DN7/1CNN/1CN7)
 *   - FROM DEB LEFT JOIN PER — DEBcode IN (CFS subquery) + province (SUBSTRING DEBzone) + group IN (employee ตัดออก 2026-10-05)
 *   - collector = Odoo res_partner.billing_by (by_agent/by_finance) — PENDING (ถ้าไม่มี OPENQUERY ODOO_DB)
 */
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set("display_errors", "0");

function p008_error($msg) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => $msg]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) p008_error("Invalid JSON");

$connectionId = isset($input["connectionId"]) ? trim($input["connectionId"]) : "";
$province     = isset($input["province"]) ? trim($input["province"]) : "";
$groupText    = isset($input["group"]) ? trim($input["group"]) : "";
$asOf         = isset($input["asOf"]) ? trim($input["asOf"]) : "";
$collector    = isset($input["collector"]) ? trim($input["collector"]) : "";

if ($connectionId === "") p008_error("Missing connectionId");
if ($province === "") p008_error("Missing province");
if ($groupText === "") p008_error("Missing group");
if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $asOf)) p008_error("Invalid asOf (yyyy-mm-dd)");

// ── Parse group: 'CRE-A','CRE-F' → [CRE-A, CRE-F] ──
$groups = [];
foreach (explode(",", $groupText) as $g) {
    $g = trim($g, " '\" \t");
    if ($g !== "") $groups[] = $g;
}
if (count($groups) === 0) p008_error("No group");

// ── Parse date: yyyy-mm-dd → dd-mm-yyyy (C# UsaCulture dd-MM-yyyy + CONVERT 103) ──
$asOfArr = explode("-", $asOf);
$asOf103 = $asOfArr[2] . "-" . $asOfArr[1] . "-" . $asOfArr[0];

// ── CFS vnos prefixes (clone C# — search: 40 prefixes, รวม VAT + no-VAT) ──
$cfsPrefixes = [
    "IVV%", "IVF%", "ICV6%", "CIV%", "AGV6%", "FAV%", "CBV%",
    "IRW%", "IVN%", "IVX%", "ICX%", "AGN%", "AGX%", "FAN%", "FAX%",
    "CBA%", "INV%", "C14%", "C15%", "FAC%", "AGE%", "CBN%", "CBX%", "CBC%",
    "IVV7%", "IVVF%", "ICV7%", "AGV7%", "2CB7%", "DSV7%", "IVVN%",
    "IVSP%", "IVVX%", "AGVN%", "AGVX%", "DSVN%", "DSVX%", "1CB7%", "1CBN%", "2CBN%"
];
// CDC vnos prefixes (clone C# — search: 9 prefixes)
$cdcPrefixes = ["DNN%", "DNR%", "DNV%", "CNN%", "CNV%", "1DNN%", "1DN7%", "1CNN%", "1CN7%"];

function p008_like_list($col, $prefixes) {
    $parts = [];
    foreach ($prefixes as $p) $parts[] = $col . " LIKE ?";
    return "(" . implode(" OR ", $parts) . ")";
}

function p008_params($prefixes) {
    return array_values($prefixes);
}

// ── SQL (clone C#) — params เรียงตามลำดับ placeholder ใน SQL ──
$params = [];

// 1) outer CFS SUM: date + 40 vnos
$params[] = $asOf103;
$params = array_merge($params, p008_params($cfsPrefixes));
$cfsVnosOuter = p008_like_list("CFSvnosID", $cfsPrefixes);

// 2) CASE WHEN CDC: 9 vnos
$params = array_merge($params, p008_params($cdcPrefixes));
$cdcVnosOuter = p008_like_list("CDCvnosID", $cdcPrefixes);

// 3) ELSE CDC: 9 vnos
$params = array_merge($params, p008_params($cdcPrefixes));
$cdcVnosOuter2 = p008_like_list("CDCvnosID", $cdcPrefixes);

// 4) IN subquery CFS: date + 40 vnos
$params[] = $asOf103;
$params = array_merge($params, p008_params($cfsPrefixes));
$cfsVnosInner = p008_like_list("CFSvnosID", $cfsPrefixes);

$sql = "SELECT DEBcode, DEBgroup, DEBnameE, DEBcontactT, DEBadd3AT, DEBzone,
  (SELECT SUM(CFSsumREQ - CFSsumCUT1) FROM CFS
    WHERE CFScusID = A.DEBcode
      AND CFSclearALL = 0 AND CFSclearUSER = 0
      AND (CFSsumREQ - CFSsumCUT1) != 0
      AND CFSdateID <= CONVERT(DATE, ?, 103)
      AND " . $cfsVnosOuter . "
  ) AS Total,
  CASE WHEN (SELECT SUM(CDCnetSUM) FROM CDC
    WHERE CDCcusID = A.DEBcode
      AND (CDCtypeID = 'AS' OR CDCtypeID = 'BS')
      AND " . $cdcVnosOuter . "
      AND CDCcancel = 0
      AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL)
  ) IS NULL THEN 0 ELSE (SELECT SUM(CDCnetSUM) FROM CDC
    WHERE CDCcusID = A.DEBcode
      AND (CDCtypeID = 'AS' OR CDCtypeID = 'BS')
      AND " . $cdcVnosOuter2 . "
      AND CDCcancel = 0
      AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL)
  ) END AS disc,
  PER.PERcode, PER.PERnameT
FROM DEB A
LEFT JOIN PER ON DEBsalesP = PER.PERcode
WHERE DEBcode IN (
  SELECT CFScusID FROM CFS
  WHERE CFSclearALL = 0 AND CFSclearUSER = 0
    AND (CFSsumREQ - CFSsumCUT1) != 0
    AND CFSdateID <= CONVERT(DATE, ?, 103)
    AND " . $cfsVnosInner . "
  GROUP BY CFScusID
)";

// province: SUBSTRING(DEBzone, LEN-1, LEN) LIKE ? (ยกเว้น "00")
if ($province !== "00") {
    $sql .= " AND SUBSTRING(DEBzone, LEN(DEBzone) - 1, LEN(DEBzone)) LIKE ?";
    $params[] = $province;
}

// เก็บเงินโดย: Odoo res_partner.billing_by (clone C# — OPENQUERY ODOO_DB)
//   age = 'by_agent' · fin = 'by_finance'
if ($collector === "age" || $collector === "fin") {
    $billingBy = ($collector === "age") ? "by_agent" : "by_finance";
    $sql .= " AND (SELECT partner.billing_by FROM (SELECT * FROM OPENQUERY(ODOO_DB, 'SELECT company_registry,billing_by FROM res_partner WHERE active = ''t'' AND parent_id is null AND billing_by IS NOT NULL AND company_registry is not null')) AS partner WHERE partner.company_registry = A.DEBcode) = ?";
    $params[] = $billingBy;
}

// group: DEBgroup IN (?, ...)
$in = str_repeat("?,", count($groups) - 1) . "?";
$sql .= " AND DEBgroup IN (" . $in . ")";
foreach ($groups as $g) $params[] = $g;

$sql .= " ORDER BY A.DEBcode ASC";

// ── DB ──
require __DIR__ . "/lib/db.php";
try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "เชื่อมต่อฐานข้อมูลไม่สำเร็จ: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["ok" => false, "error" => "SQL: " . $e->getMessage()]);
    exit;
}

// ── Zone → จังหวัด (ZON) ──
$zoneMap = [];
try {
    $zst = $pdo->query("SELECT ZONcode, ZONdescT FROM ZON");
    while ($z = $zst->fetch(PDO::FETCH_ASSOC)) {
        $zoneMap[$z["ZONcode"]] = $z["ZONdescT"];
    }
} catch (Exception $e) { /* ZON fail = skip */ }

$out = [];
foreach ($rows as $r) {
    $zoneCode = isset($r["DEBzone"]) ? $r["DEBzone"] : "";
    $zoneName = isset($zoneMap[$zoneCode]) ? $zoneMap[$zoneCode] : $zoneCode;
    $out[] = [
        "customerCode"  => isset($r["DEBcode"]) ? $r["DEBcode"] : "",
        "group"         => isset($r["DEBgroup"]) ? $r["DEBgroup"] : "",
        "customerName"  => isset($r["DEBnameE"]) ? $r["DEBnameE"] : "",
        "contact"       => isset($r["DEBcontactT"]) ? $r["DEBcontactT"] : "",
        "address"       => isset($r["DEBadd3AT"]) ? $r["DEBadd3AT"] : "",
        "zone"          => $zoneName,
        "amount"        => isset($r["Total"]) && $r["Total"] !== null ? (float)$r["Total"] : 0,
        "adjust"        => isset($r["disc"]) && $r["disc"] !== null ? (float)$r["disc"] : 0,
        "employeeCode"  => isset($r["PERcode"]) ? $r["PERcode"] : "",
        "employeeName"  => isset($r["PERnameT"]) ? $r["PERnameT"] : ""
    ];
}

echo json_encode(["ok" => true, "rows" => $out], JSON_UNESCAPED_UNICODE);
