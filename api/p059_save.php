<?php
/**
 * P059 — จัดเก็บเอกสารลูกค้า — save API (upload + soft delete)
 * clone C# frm_SOimage_manager.btn_save_Click (L200-302) + uploadFtp (L304-364):
 *   - new/edit: filename = {vnos}_{i}_{yyyyMMdd_HHmmss}{ext}
 *     INSERT BI_CUBE.tb_PictureSO (vnos, filename, create_on, status='0') + FTP PUT /web/PO/
 *   - delete: UPDATE tb_PictureSO SET status=-1 WHERE id IN (...) AND vnos=?
 * POST multipart: connectionId, vnos, deleteIds (JSON array), files[] (multiple images)
 * Response: { ok, uploaded, deleted, cntPic }
 */
require __DIR__ . '/lib/db.php';

header('Content-Type: application/json; charset=utf-8');

function p059_fail($msg) {
    echo json_encode(array('ok' => false, 'error' => $msg), JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method !== 'POST') {
    p059_fail('POST only');
}

$connId = isset($_POST['connectionId']) ? $_POST['connectionId'] : '';
$vnos = isset($_POST['vnos']) ? trim($_POST['vnos']) : '';
$deleteIdsRaw = isset($_POST['deleteIds']) ? $_POST['deleteIds'] : '[]';

if ($connId === '') {
    p059_fail('connectionId empty');
}
if ($vnos === '') {
    p059_fail('vnos empty');
}

// FTP settings (clone C# uploadFtp L306-309)
$ftpBase = 'ftp://192.168.0.200/web/PO/';
$ftpUser = 'ftp_user';
$ftpPass = '9BLl_ihe';

function p059_ftp_put($local, $remoteName, $ftpBase, $ftpUser, $ftpPass) {
    $ch = curl_init($ftpBase . $remoteName);
    $fh = fopen($local, 'rb');
    curl_setopt_array($ch, array(
        CURLOPT_USERPWD => $ftpUser . ':' . $ftpPass,
        CURLOPT_UPLOAD => true,
        CURLOPT_INFILE => $fh,
        CURLOPT_INFILESIZE => filesize($local),
        CURLOPT_TIMEOUT => 120,
    ));
    $ok = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    fclose($fh);
    return $ok !== false && $code === 226 ? true : false;
}

try {
    $pdo = getDb($connId);
} catch (Exception $e) {
    p059_fail('DB: ' . $e->getMessage());
}

$uploaded = 0;
$deleted = 0;
$now = date('Ymd_His');

// ---------- upload files ----------
if (isset($_FILES['files']) && is_array($_FILES['files'])) {
    $n = count($_FILES['files']['name']);
    $stIns = $pdo->prepare("INSERT INTO [BI_CUBE].[dbo].[tb_PictureSO] ([vnos], [filename], [create_on], [status]) VALUES (?, ?, GETDATE(), '0')");
    for ($i = 0; $i < $n; $i++) {
        if (isset($_FILES['files']['error'][$i]) && $_FILES['files']['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }
        $tmpName = $_FILES['files']['tmp_name'][$i];
        $origName = $_FILES['files']['name'][$i];
        $ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
        $allowed = array('jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp');
        if (!in_array($ext, $allowed, true)) {
            continue;
        }
        // clone C# L221: {vnos}_{i}_{yyyyMMdd_HHmmss}{ext}
        $newFilename = $vnos . '_' . $i . '_' . $now . '.' . $ext;

        // FTP PUT ก่อน (ถ้าล้มเหลว = ไม่ INSERT)
        if (!p059_ftp_put($tmpName, $newFilename, $ftpBase, $ftpUser, $ftpPass)) {
            p059_fail('FTP upload fail: ' . $newFilename);
        }

        $stIns->execute(array($vnos, $newFilename));
        $uploaded++;
    }
}

// ---------- soft delete (clone C# L250-252: status=-1) ----------
$deleteIds = json_decode($deleteIdsRaw, true);
if (is_array($deleteIds) && count($deleteIds) > 0) {
    $ids = array();
    foreach ($deleteIds as $id) {
        $id = (int) $id;
        if ($id > 0) {
            $ids[] = $id;
        }
    }
    if (count($ids) > 0) {
        $in = implode(',', array_fill(0, count($ids), '?'));
        $stDel = $pdo->prepare("UPDATE [BI_CUBE].[dbo].[tb_PictureSO] SET [status] = '-1' WHERE id IN ($in) AND vnos = ? AND [status] = '0'");
        $stDel->execute(array_merge($ids, array($vnos)));
        $deleted = $stDel->rowCount();
    }
}

// ---------- count remaining (status=0) ----------
$stCnt = $pdo->prepare("SELECT COUNT(id) FROM [BI_CUBE].[dbo].[tb_PictureSO] WHERE vnos = ? AND [status] = '0'");
$stCnt->execute(array($vnos));
$cntPic = (int) $stCnt->fetchColumn();

echo json_encode(array('ok' => true, 'uploaded' => $uploaded, 'deleted' => $deleted, 'cntPic' => $cntPic), JSON_UNESCAPED_UNICODE);
