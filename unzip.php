<?php
// PHP Unzip Helper Script for GetHotelStays deployment
$zipFile = 'frontend.zip';
$extractTo = './';

if (!file_exists($zipFile)) {
    echo 'ERROR: ZIP file not found';
    exit;
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
    echo 'DEPLOYS_SUCCESS';
    unlink($zipFile);
    unlink(__FILE__);
} else {
    echo 'DEPLOYS_FAILED';
}
?>
