<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'sync_backend';

if ($action === 'sync_backend' || $action === 'extract_backend' || $action === 'extract_all') {
    $srcDir = '/home/vgyuvmpi/gethotel_backend/';
    $targetDir = '/home/vgyuvmpi/';
    
    // Copy updated backend files to app root
    $items = ['server.js', 'package.json', 'routes', 'controllers', 'config', 'middleware', 'prisma', 'utils', 'services'];
    foreach ($items as $item) {
        $src = $srcDir . $item;
        $dest = $targetDir . $item;
        if (file_exists($src)) {
            if (is_dir($src)) {
                exec("cp -rf '$src' '$targetDir'");
                echo "Synced dir: $item\n";
            } else {
                copy($src, $dest);
                echo "Copied file: $item\n";
            }
        }
    }
    
    // Touch restart.txt in all possible app roots to trigger Passenger reload
    $restartPaths = [
        '/home/vgyuvmpi/tmp/restart.txt',
        '/home/vgyuvmpi/public_html/tmp/restart.txt',
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt'
    ];
    foreach ($restartPaths as $rp) {
        @mkdir(dirname($rp), 0755, true);
        file_put_contents($rp, time());
        echo "Restart triggered via $rp\n";
    }
    exit;
}

echo "DEPLOYS_SUCCESS";
