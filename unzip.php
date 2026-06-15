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
    // Auto-restart the backend application
    $restartPaths = [
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt',
        '../gethotel_backend/tmp/restart.txt'
    ];
    foreach ($restartPaths as $path) {
        if (is_dir(dirname($path))) {
            touch($path);
        }
    }

    // Force-kill existing Node.js processes to guarantee passenger reload
    @shell_exec("pkill -u vgyuvmpi -f node");
    @shell_exec("pkill -f node");

    echo 'DEPLOYS_SUCCESS';
    unlink($zipFile);
    unlink(__FILE__);
} else {
    echo 'DEPLOYS_FAILED';
}
?>
