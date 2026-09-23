<?php
/**
 * สร้าง placeholder ภาพสำหรับระบบ (รันครั้งเดียวแล้วลบได้)
 * - assets/images/banner/default.png — banner หัวเอกสาร (1200x160)
 * - assets/images/logo/default.png   — โลโก้เอกสาร (240x120)
 *
 * รัน: php tools/generate_placeholders.php
 */

$base = dirname(__DIR__) . '/assets/images';
@mkdir($base . '/banner', 0755, true);
@mkdir($base . '/logo', 0755, true);

// banner หัวเอกสาร
$w = imagecreatetruecolor(1200, 160);
$bg = imagecolorallocate($w, 37, 99, 235);
$dark = imagecolorallocate($w, 29, 78, 216);
$white = imagecolorallocate($w, 255, 255, 255);
imagefill($w, 0, 0, $bg);
imagerectangle($w, 0, 120, 1199, 159, $dark);
imagestring($w, 5, 20, 40, 'ERP PORTAL', $white);
imagestring($w, 3, 20, 70, 'BANNER PLACEHOLDER', $white);
imagestring($w, 3, 20, 135, 'Replace: assets/images/banner/default.png', $white);
imagepng($w, $base . '/banner/default.png');
imagedestroy($w);
echo "banner: assets/images/banner/default.png\n";

// โลโก้
$l = imagecreatetruecolor(240, 120);
$bg2 = imagecolorallocate($l, 241, 245, 249);
$blue = imagecolorallocate($l, 37, 99, 235);
$txt = imagecolorallocate($l, 71, 85, 105);
imagefill($l, 0, 0, $bg2);
imagefilledellipse($l, 60, 60, 80, 80, $blue);
imagestring($l, 5, 110, 45, 'LOGO', $blue);
imagestring($l, 3, 110, 75, 'Replace: logo/default.png', $txt);
imagepng($l, $base . '/logo/default.png');
imagedestroy($l);
echo "logo: assets/images/logo/default.png\n";
echo "done\n";
