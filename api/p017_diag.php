<?php
// TEMP diagnostic — P017 type=all SQL investigation
header("Content-Type: application/json; charset=utf-8");
require __DIR__ . "/lib/db.php";
try {
  $db = getDb("c1788406814359");
} catch (Exception $e) {
  echo json_encode(array("ok" => false, "error" => $e->getMessage()), JSON_UNESCAPED_UNICODE);
  exit;
}

// "cash" from codepoints (avoid typing Thai)
$cash = chr(0x0E0B) . chr(0x0E38) . chr(0x0E19) . chr(0x0E30) . chr(0x0E1E);

$base = "FROM CFS LEFT JOIN DEB ON DEB.DEBcode = CFS.CFScusID LEFT JOIN MIH ON MIHvnos = CFSvnosID WHERE CFSclearALL = 0 AND MIHtype = 'IS' AND MIHnetSUM > 0";

function cnt($db, $where, $cash) {
  $st = $db->query("SELECT COUNT(*) c " . $GLOBALS["base"] . $where);
  $r = $st->fetch(PDO::FETCH_ASSOC);
  return (int)$r["c"];
}

$out = array();
$out["base_total"] = cnt($db, "", $cash);
$out["all_or"] = cnt($db, " AND (MIHdiscHT1 LIKE '3' OR MIHdesc LIKE '%" . $cash . "%')", $cash);
$out["net"] = cnt($db, " AND MIHdiscHT1 NOT LIKE '3' AND MIHdesc LIKE '%" . $cash . "%'", $cash);
$out["discount"] = cnt($db, " AND MIHdiscHT1 LIKE '3' AND MIHdesc LIKE '%" . $cash . "%'", $cash);
$out["discHT1_like3"] = cnt($db, " AND MIHdiscHT1 LIKE '3'", $cash);
$out["desc_like_cash"] = cnt($db, " AND MIHdesc LIKE '%" . $cash . "%'", $cash);

echo json_encode(array("ok" => true) + $out, JSON_UNESCAPED_UNICODE);
