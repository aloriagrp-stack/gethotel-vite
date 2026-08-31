<?php
header('Content-Type: text/plain');

echo "=== 1. SYNCING BACKEND USING PURE PHP ===\n";

function recurseCopy($src, $dst) {
    $dir = @opendir($src);
    @mkdir($dst, 0755, true);
    while (false !== ($file = @readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                recurseCopy($src . '/' . $file, $dst . '/' . $file);
            } else {
                @copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    @closedir($dir);
}

$srcDir = '/home/vgyuvmpi/gethotel_backend/';
$targetDir = '/home/vgyuvmpi/';
$items = ['server.js', 'package.json', 'routes', 'controllers', 'config', 'middleware', 'prisma', 'utils', 'services'];
foreach ($items as $item) {
    $src = $srcDir . $item;
    $dest = $targetDir . $item;
    if (file_exists($src)) {
        if (is_dir($src)) {
            recurseCopy($src, $dest);
            echo "Synced directory: $item\n";
        } else {
            @copy($src, $dest);
            echo "Copied file: $item\n";
        }
    }
}

echo "\n=== 2. TOUCHING RESTART FILES FOR NODE/PASSENGER ===\n";
$restartPaths = [
    '/home/vgyuvmpi/tmp/restart.txt',
    '/home/vgyuvmpi/public_html/tmp/restart.txt',
    '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt',
    '/home/vgyuvmpi/tmp/restart.txt'
];
foreach ($restartPaths as $rp) {
    @mkdir(dirname($rp), 0755, true);
    @file_put_contents($rp, time());
    echo "Restart touch written to: $rp\n";
}

echo "\nSYNC AND RESTART FINISHED SUCCESSFULLY.\n";
