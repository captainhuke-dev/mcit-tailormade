<?php
/**
 * P008 — Report data (Phase 2 — clone C# bgWorker_DoWork + getDetailINV + getDetailINVBody_VAT/noVAT
 *       + getDetailDEB + GetDetailPER + GetProvince + GetPerName + getQR + getLastOrder)
 * POST {connectionId, codes: [DEBcode...], asOf, province, employee, round, month, year,
 *       showQr, showLastSale}
 * Return:
 *   {ok, header: {provinceName, perCode, perName}, customers: [{
 *       code, nameE, contactT, grade, addr1..3, tel, fax, perCode,
 *       qr: "https://..."|"" ,
 *       inv: [{dates, vnos, vk, req, dis, cut, balance}],   // getDetailINV (สรุป)
 *       vat:   [{dates, vnos, vk, descT, req, dis, cut, balance}],  // getDetailINVBody_VAT
 *       novat: [...],                                             // getDetailINVBody_noVAT
 *       lastSale: [{stkgroup, stgdescT, lastdate}]                 // getLastOrder
 *   }]}
 */
header("Content-Type: application/json; charset=utf-8");
error_reporting(E_ALL);
ini_set("display_errors", "0");

function p008r_error($msg) {
    http_response_code(400);
    echo json_encode(["ok" => false, "error" => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

require __DIR__ . "/lib/db.php";

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) p008r_error("Invalid JSON");

$connectionId = isset($input["connectionId"]) ? trim($input["connectionId"]) : "";
$codes        = isset($input["codes"]) ? $input["codes"] : [];
$asOf         = isset($input["asOf"]) ? trim($input["asOf"]) : "";
$province     = isset($input["province"]) ? trim($input["province"]) : "";
$employee     = isset($input["employee"]) ? trim($input["employee"]) : "";
$showQr       = !empty($input["showQr"]);
$showLastSale = !empty($input["showLastSale"]);
$splitMonth   = !empty($input["splitMonth"]); // chk_BillBymonth — แยกบิลตามเดือน

if ($connectionId === "") p008r_error("Missing connectionId");
if (!is_array($codes) || count($codes) === 0) p008r_error("No codes");
if (!preg_match("/^\d{4}-\d{2}-\d{2}$/", $asOf)) p008r_error("Invalid asOf (yyyy-mm-dd)");

$asOfArr = explode("-", $asOf);
$asOf103 = $asOfArr[2] . "-" . $asOfArr[1] . "-" . $asOfArr[0]; // dd-mm-yyyy (CONVERT 103)

try {
    $pdo = getDb($connectionId);
} catch (Exception $e) {
    p008r_error("DB connect fail: " . $e->getMessage());
}

// ── CFS prefixes (clone C# — getDetailINV = 33, VAT body = 14, noVAT body = 32) ──
$cfsAll = [
    "IVV6%", "IVF%", "ICV6%", "CIV%", "AGV6%", "FAV%", "CBV%",
    "ICS%", "IVN%", "IVX%", "ICX%", "AGN%", "AGX%", "FAN%", "FAX%",
    "CBA%", "INV%", "C14%", "C15%", "FAC%", "AGE%", "CBN%", "CBX%", "CBC%",
    "IVV7%", "IVVF%", "ICV7%", "AGV7%", "2CB7%", "DSV7%", "IVVN%",
    "IVSP%", "IVVX%", "AGVN%", "AGVX%", "DSVN%", "DSVX%", "DSVF%", "1CB7%", "1CBN%", "2CBN%"
];
$cfsVat = ["IVV6%", "IVF%", "ICV6%", "CIV%", "AGV6%", "CBV%", "FAV%",
           "IVV7%", "IVVF%", "ICV7%", "AGV7%", "2CB7%", "DSVF%", "DSV7%"];
$cfsNoVat = ["IVN%", "ICS%", "IVX%", "ICX%", "AGN%", "AGX%", "FAN%", "FAX%",
             "CBA%", "INV%", "C14%", "C15%", "FAC%", "AGE%", "CBN%", "CBX%", "CBC%",
             "IVVN%", "IVSP%", "IVVX%", "AGVN%", "AGVX%", "DSVN%", "DSVX%", "1CB7%", "1CBN%", "2CBN%"];
$cdcVat   = ["DNV%", "CNV%", "1DNV%", "1CN7%"];
$cdcNoVat = ["DNN%", "CNN%", "DNR%", "1DNN%", "1CNN%"];
$cdcAll   = ["DNN%", "DNV%", "CNN%", "CNV%", "DNR%", "1DNN%", "1DN7%", "1CNN%", "1CN7%"];

function p008r_like($col, $prefixes) {
    $parts = [];
    foreach ($prefixes as $p) $parts[] = $col . " LIKE ?";
    return "(" . implode(" OR ", $parts) . ")";
}

// ── countMonth (clone C# countMonth_VAT/noVAT — UNION = dedup MY) ──
function p008r_count_months($pdo, $code, $asOf103, $cfsPrefixes, $cdcPrefixes) {
    $sql = "SELECT CONCAT(MONTH(CFSdateID),YEAR(CFSdateID)) MY FROM CFS
        WHERE CFSclearALL = 0 AND CFSclearUSER = 0 AND CFScusID = ? AND (CFSsumREQ - CFSsumCUT1) > 0
          AND CFSdateID <= CONVERT(DATE, ?, 103)
          AND " . p008r_like("CFSvnosID", $cfsPrefixes) . "
        UNION
        SELECT CONCAT(MONTH(CDCdateID),YEAR(CDCdateID)) MY FROM CDC
        WHERE (CDCtypeID = 'AS' OR CDCtypeID = 'BS') AND CDCcancel = 0
          AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL) AND CDCcusID = ?
          AND CDCdateID <= CONVERT(DATE, ?, 103)
          AND " . p008r_like("CDCvnosID", $cdcPrefixes) . "
        ORDER BY MY";
    $params = [$code, $asOf103];
    foreach ($cfsPrefixes as $p) $params[] = $p;
    $params[] = $code;
    $params[] = $asOf103;
    foreach ($cdcPrefixes as $p) $params[] = $p;
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $out = [];
    foreach ($st->fetchAll(PDO::FETCH_ASSOC) as $r) $out[] = $r["MY"];
    return $out;
}

// ── getDetailINVBody (clone C# — $month = MY เช่น "102026" | "" = ไม่ filter) ──
function p008r_body($pdo, $code, $asOf103, $cfsPrefixes, $cdcPrefixes, $month) {
    $mCfs = $month ? " AND CONCAT(MONTH(CFSdateID),YEAR(CFSdateID)) = ?" : "";
    $mCdc = $month ? " AND CONCAT(MONTH(CDCdateID),YEAR(CDCdateID)) = ?" : "";
    $sql = "SELECT CFSdateID AS dates, CFSvnosID AS vnos, bill.VK, CONVERT(VARCHAR(255), MIH.MIHdesc) AS descT,
        CFSsumREQ AS req, CFSsumCUT1 AS cut, '' AS dis, (CFSsumREQ - CFSsumCUT1) AS balance
        FROM CFS
        LEFT JOIN MIH ON MIH.MIHvnos = CFS.CFSvnosID AND MIH.MIHcus = CFS.CFScusID
        LEFT JOIN (SELECT cus, vnos, CASE WHEN Billing = 1 THEN 'V' WHEN AccruedBill = 1 THEN 'K' ELSE '' END VK
            FROM BI_CUBE.dbo.tb_CFS_bill_status) AS bill ON CFS.CFScusID = bill.cus AND CFS.CFSvnosID = bill.vnos
        WHERE CFSclearALL = 0 AND CFSclearUSER = 0 AND CFScusID = ? AND (CFSsumREQ - CFSsumCUT1) > 0
          AND CFSdateID <= CONVERT(DATE, ?, 103)" . $mCfs . "
          AND " . p008r_like("CFSvnosID", $cfsPrefixes) . "
        UNION
        SELECT CDCdateID AS dates, CDCvnosID AS vnos, b.VK, CONVERT(VARCHAR(255), MIH.MIHref1) AS descT,
          '0' AS req, '0' AS cut, CDCnetSUM AS dis, '0' AS balance
        FROM CDC
        LEFT JOIN MIH ON MIH.MIHvnos = CDC.CDCvnosID
        LEFT JOIN (SELECT cus, vnos, CASE WHEN Billing = 1 THEN 'V' WHEN AccruedBill = 1 THEN 'K' ELSE '' END VK
            FROM BI_CUBE.dbo.tb_CFS_bill_status) AS b ON CDC.CDCcusID = b.cus AND CDC.CDCvnosID = b.vnos
        WHERE (CDCtypeID = 'AS' OR CDCtypeID = 'BS') AND CDCcancel = 0 AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL)
          AND CDCcusID = ? AND CDCdateID <= CONVERT(DATE, ?, 103)" . $mCdc . "
          AND " . p008r_like("CDCvnosID", $cdcPrefixes) . "
        ORDER BY dates, vnos ASC";
    $params = [$code, $asOf103];
    if ($month) $params[] = $month;
    foreach ($cfsPrefixes as $p) $params[] = $p;
    $params[] = $code;
    $params[] = $asOf103;
    if ($month) $params[] = $month;
    foreach ($cdcPrefixes as $p) $params[] = $p;
    $st = $pdo->prepare($sql);
    $st->execute($params);
    return $st->fetchAll(PDO::FETCH_ASSOC);
}

// ── Header: province + PER ──
$provinceName = $province;
if ($province !== "" && $province !== "00") {
    $st = $pdo->prepare("SELECT ZONdescT FROM ZON WHERE ZONcode = ?");
    $st->execute(["THA-" . $province]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if ($row) $provinceName = $row["ZONdescT"] . " (" . $province . ")";
}
$perCode = $employee;
$perName = "";
$perTel  = "";
if ($perCode !== "") {
    $st = $pdo->prepare("SELECT PERnameT, PERtel FROM PER WHERE PERcode = ?");
    $st->execute([$perCode]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if ($row) { $perName = $row["PERnameT"]; $perTel = $row["PERtel"]; }
}

$customers = [];
$codesIn = implode(",", array_fill(0, count($codes), "?"));

foreach ($codes as $code) {
    $code = trim($code);
    if ($code === "") continue;

    // ── DEB (getDetailDEB) ──
    $st = $pdo->prepare("SELECT DEBcode, DEBnameE, DEBadd1AT, DEBadd2AT, DEBadd3AT, DEBadd3AE, DEBcontactT, DEBgrade, DEBtel, DEBfax FROM DEB WHERE DEBcode = ?");
    $st->execute([$code]);
    $deb = $st->fetch(PDO::FETCH_ASSOC);
    if (!$deb) continue;

    $cust = [
        "code" => $deb["DEBcode"],
        "nameE" => $deb["DEBnameE"],
        "contactT" => $deb["DEBcontactT"],
        "grade" => $deb["DEBgrade"],
        "addr1" => $deb["DEBadd1AT"],
        "addr2" => $deb["DEBadd2AT"],
        "addr3" => $deb["DEBadd3AT"],
        "addr3E" => $deb["DEBadd3AE"],
        "tel" => $deb["DEBtel"],
        "fax" => $deb["DEBfax"],
        "perCode" => $perCode,
        "qr" => "",
        "inv" => [],
        "vat" => [],
        "novat" => [],
        "lastSale" => []
    ];

    // ── QR (getQR — Odoo lat/lng via OPENQUERY) ──
    if ($showQr) {
        try {
            $sql = "SELECT partner_latitude, partner_longitude FROM OPENQUERY(ODOO_DB,
                'SELECT company_registry, partner_latitude, partner_longitude FROM res_partner WHERE company_registry IS NOT NULL')
                WHERE company_registry = ?";
            $st = $pdo->prepare($sql);
            $st->execute([$code]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $lat = (float)str_replace(".000000", "", $row["partner_latitude"]);
                $lng = (float)str_replace(".000000", "", $row["partner_longitude"]);
                if ($lat > 0 && $lng > 0) $cust["qr"] = "https://www.google.com/maps/search/?api=1&query=" . $lat . "," . $lng;
            }
        } catch (Exception $e) { /* no QR */ }
    }

    // ── getDetailINV (สรุป — CFS UNION CDC + VK from BI_CUBE) ──
    $sql = "SELECT tb.dates, tb.vnos, tb.req, tb.cut, tb.dis, tb.balance,
        (CASE WHEN B.Billing = 1 THEN 'V' WHEN B.AccruedBill = 1 THEN 'K' ELSE '' END) vk
        FROM (
          SELECT CFSdateID AS dates, CFSvnosID AS vnos, CFSsumREQ AS req, CFSsumCUT1 AS cut, '' AS dis, (CFSsumREQ - CFSsumCUT1) AS balance
          FROM CFS
          WHERE CFSclearALL = 0 AND CFSclearUSER = 0 AND CFScusID = ? AND (CFSsumREQ - CFSsumCUT1) > 0
            AND CFSdateID <= CONVERT(DATE, ?, 103)
            AND " . p008r_like("CFSvnosID", $cfsAll) . "
          UNION
          SELECT CDCdateID AS dates, CDCvnosID AS vnos, '0' AS req, '0' AS cut, CDCnetSUM AS dis, '0' AS balance
          FROM CDC
          WHERE (CDCtypeID = 'AS' OR CDCtypeID = 'BS') AND CDCcancel = 0
            AND (CDClinkVtype2 = '' OR CDClinkVtype2 IS NULL) AND CDCcusID = ?
            AND CDCdateID <= CONVERT(DATE, ?, 103)
            AND " . p008r_like("CDCvnosID", $cdcAll) . "
        ) tb
        LEFT JOIN BI_CUBE.dbo.tb_CFS_bill_status B ON tb.vnos = B.vnos
        ORDER BY tb.dates ASC";
    $params = [$code, $asOf103];
    foreach ($cfsAll as $p) $params[] = $p;
    $params[] = $code;
    $params[] = $asOf103;
    foreach ($cdcAll as $p) $params[] = $p;
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $cust["inv"] = $st->fetchAll(PDO::FETCH_ASSOC);

    // ── getDetailINVBody_VAT / noVAT (clone C# — ถ้า splitMonth = countMonth → ต่อ MY) ──
    if ($splitMonth) {
        // chk_BillBymonth: cntRound = countMonth → ต่อ MY (ถ้าไม่มี = "" = ทั้งหมด)
        $vatMonths = p008r_count_months($pdo, $code, $asOf103, $cfsVat, $cdcVat);
        $noVatMonths = p008r_count_months($pdo, $code, $asOf103, $cfsNoVat, $cdcNoVat);
        $cust["vat"] = [];
        foreach ($vatMonths as $my) {
            $rows = p008r_body($pdo, $code, $asOf103, $cfsVat, $cdcVat, $my);
            foreach ($rows as $r) { $r["MY"] = $my; $cust["vat"][] = $r; }
        }
        $cust["novat"] = [];
        foreach ($noVatMonths as $my) {
            $rows = p008r_body($pdo, $code, $asOf103, $cfsNoVat, $cdcNoVat, $my);
            foreach ($rows as $r) { $r["MY"] = $my; $cust["novat"][] = $r; }
        }
    } else {
        $cust["vat"] = p008r_body($pdo, $code, $asOf103, $cfsVat, $cdcVat, "");
        $cust["novat"] = p008r_body($pdo, $code, $asOf103, $cfsNoVat, $cdcNoVat, "");
    }

    // ── getLastOrder (Last Sale — MIL + STK + STG) ──
    if ($showLastSale) {
        $sql = "SELECT S.STKgroup, CONVERT(NVARCHAR(MAX), G.STGdescT) AS stgdescT,
            MAX(CONVERT(DATE, STR(MILyear * 10000 + MILmonth * 100 + MILday))) AS lastdate
            FROM MIL M
            LEFT JOIN STK S ON STKcode = MILstk
            LEFT JOIN STG G ON G.STGcode = S.STKgroup
            WHERE MILtype IN ('IS') AND STKgroup != '' AND MILyear >= YEAR(GETDATE()) - 5 AND S.STKhide = 0
              AND CONVERT(DATE, STR(MILyear * 10000 + MILmonth * 100 + MILday)) < CONVERT(DATE, GETDATE() - 90)
              AND STKgroup NOT LIKE '%X%' AND MILcus = ?
            GROUP BY S.STKgroup, CONVERT(NVARCHAR(MAX), G.STGdescT)
            ORDER BY STKgroup";
        $st = $pdo->prepare($sql);
        $st->execute([$code]);
        $cust["lastSale"] = $st->fetchAll(PDO::FETCH_ASSOC);
    }

    $customers[] = $cust;
}

echo json_encode([
    "ok" => true,
    "header" => [
        "provinceName" => $provinceName,
        "perCode" => $perCode,
        "perName" => $perName,
        "perTel" => $perTel
    ],
    "customers" => $customers
], JSON_UNESCAPED_UNICODE);
