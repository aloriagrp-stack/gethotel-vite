<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'extract_all';

if ($action === 'check_modules') {
    $paths = [
        '/home/vgyuvmpi/node_modules',
        '/home/vgyuvmpi/public_html/node_modules',
        '/home/vgyuvmpi/gethotel_backend/node_modules'
    ];
    foreach ($paths as $p) {
        if (file_exists($p)) {
            echo "Found node_modules at $p\n";
        } else {
            echo "NOT found: $p\n";
        }
    }
    exit;
}

if ($action === 'sync_backend' || $action === 'extract_backend' || $action === 'extract_all') {
    $srcDir = '/home/vgyuvmpi/gethotel_backend/';
    $targetDir = '/home/vgyuvmpi/';
    
    // Copy updated backend files to app root
    $items = ['server.js', 'package.json', 'routes', 'controllers', 'config', 'middleware', 'prisma', 'utils', 'services', 'node_modules'];
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
    
    // Touch restart.txt
    $restartFile = '/home/vgyuvmpi/tmp/restart.txt';
    @mkdir(dirname($restartFile), 0755, true);
    file_put_contents($restartFile, time());
    echo "Backend sync complete. Restart triggered.\n";
    exit;
}

echo "DEPLOYS_SUCCESS";
