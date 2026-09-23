<?php
/**
 * P022 — View Billing Document: ค้นหาลูกค้า (Nas199 mct_mobile)
 *
 * POST JSON: { connectionId: <Nas199>, code: "12150", name: "" }
 *
 * ตอบ: { ok:true, customers:[{code, name, district, link1, link2}] }
 *   link1/link2 = "folder_name/file_name" (อาจเป็น null)
 */
require __DIR__ . '/lib/db.php';
header('Content-Type: application/json; charset=utf-8');

function p022Error($message, $status = 400)
{
    http_response_code($status);
    echo json_encode(array('ok' => false, 'message' => $message), JSON_UNESCAPED_UNICODE);
    exit;
}

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) {
    p022Error('request body ต้องเป็น JSON');
}

$connectionId = isset($in['connectionId']) ? trim((string) $in['connectionId']) : '';
$code = isset($in['code']) ? trim((string) $in['code']) : '';
$name = isset($in['name']) ? trim((string) $in['name']) : '';

if ($connectionId === '') {
    p022Error('ไม่มีข้อมูลฐานข้อมูล — ตรวจสอบการตั้งค่า connection');
}

try {
    $pdo = getDb($connectionId);

    // คำนวณภาพ 2 ล่าสุดต่อลูกค้าด้วย window function (เร็วกว่า correlated subquery มาก)
    // ผลลัพธ์เดียวกับ SQL เดิม: link1 = ภาพใหม่สุด, link2 = ภาพล่าสุดที่ 2
    $sql = "WITH ranked AS (
        SELECT cusID, CONCAT(folder_name, '/', file_name) link,
               ROW_NUMBER() OVER (PARTITION BY cusID ORDER BY CREATE_ON DESC) rn
        FROM BillDocument
    ),
    top2 AS (
        SELECT cusID,
               MAX(CASE WHEN rn = 1 THEN link END) link1,
               MAX(CASE WHEN rn = 2 THEN link END) link2
        FROM ranked
        GROUP BY cusID
    )
    SELECT
        t.cusID,
        MC.DEBnameT,
        MC.DEBcontactT,
        t.link1,
        t.link2
    FROM
        top2 AS t
        LEFT JOIN MasterCustomer MC ON t.cusID = MC.DEBcode
    WHERE
        t.cusID LIKE ?
        AND MC.DEBnameT LIKE ?
    ORDER BY
        t.cusID
    LIMIT 50";

    $stmt = $pdo->prepare($sql);
    // รหัสลูกค้า = begins with (prefix) — เร็วกว่า contains; ชื่อลูกค้า = contains
    $stmt->execute(array($code . '%', '%' . $name . '%'));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $customers = array();
    foreach ($rows as $row) {
        $customers[] = array(
            'code' => (string) ($row['cusID'] ?? ''),
            'name' => (string) ($row['DEBnameT'] ?? ''),
            'district' => (string) ($row['DEBcontactT'] ?? ''),
            'link1' => $row['link1'] === null ? null : (string) $row['link1'],
            'link2' => $row['link2'] === null ? null : (string) $row['link2']
        );
    }

    echo json_encode(array('ok' => true, 'customers' => $customers), JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    p022Error('ค้นหาข้อมูลไม่สำเร็จ: ' . $e->getMessage(), 500);
} catch (RuntimeException $e) {
    p022Error($e->getMessage(), 500);
}
