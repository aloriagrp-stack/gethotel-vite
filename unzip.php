<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : '';

if (empty($action) || $action === 'diag') {
    echo "=== 1. FINDING ALL HTACCESS FILES ===\n";
    exec("find /home/vgyuvmpi -maxdepth 3 -name '.htaccess*' 2>&1", $out1);
    foreach ($out1 as $f) {
        echo "--- File: $f ---\n";
        echo file_get_contents($f) . "\n\n";
    }

    echo "=== 2. FINDING ALL NODEVENV & NODE BINARIES ===\n";
    exec("find /home/vgyuvmpi -name 'node' -type f 2>&1", $out2);
    foreach ($out2 as $n) {
        echo "Node Binary: $n\n";
    }

    echo "\n=== 3. SCANDIR /home/vgyuvmpi/gethotel_backend ===\n";
    exec("ls -la /home/vgyuvmpi/gethotel_backend 2>&1", $out3);
    echo implode("\n", $out3) . "\n";
    exit;
}

if ($action === 'sync_backend' || $action === 'extract_backend' || $action === 'extract_all') {
    $srcDir = '/home/vgyuvmpi/gethotel_backend/';
    $targetDir = '/home/vgyuvmpi/';
    
    $items = ['server.js', 'package.json', 'routes', 'controllers', 'config', 'middleware', 'prisma', 'utils', 'services'];
    foreach ($items as $item) {
        $src = $srcDir . $item;
        $dest = $targetDir . $item;
        if (file_exists($src)) {
            if (is_dir($src)) {
                exec("cp -rf '$src' '$targetDir'");
            } else {
                copy($src, $dest);
            }
        }
    }
    
    $restartPaths = [
        '/home/vgyuvmpi/tmp/restart.txt',
        '/home/vgyuvmpi/public_html/tmp/restart.txt',
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt'
    ];
    foreach ($restartPaths as $rp) {
        @mkdir(dirname($rp), 0755, true);
        file_put_contents($rp, time());
    }
    echo "SYNC_COMPLETE";
    exit;
}

echo "DEPLOYS_SUCCESS";
