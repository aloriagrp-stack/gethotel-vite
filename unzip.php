<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'diag';

if ($action === 'diag') {
    echo "=== 1. CHECK LOCAL PORT 5000 FROM PHP ===\n";
    $ch = curl_init('http://127.0.0.1:5000/api/homepage/config');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    $res5000 = curl_exec($ch);
    $info5000 = curl_getinfo($ch);
    curl_close($ch);
    echo "Port 5000 HTTP Code: " . $info5000['http_code'] . "\n";
    echo "Port 5000 Output Preview: " . substr($res5000, 0, 200) . "\n\n";

    echo "=== 2. CHECK HTACCESS FILES ===\n";
    $htaccessPaths = [
        '/home/vgyuvmpi/.htaccess',
        '/home/vgyuvmpi/public_html/.htaccess',
        '/home/vgyuvmpi/gethotel_backend/.htaccess'
    ];
    foreach ($htaccessPaths as $hp) {
        if (file_exists($hp)) {
            echo "--- $hp ---\n" . file_get_contents($hp) . "\n";
        } else {
            echo "Not found: $hp\n";
        }
    }

    echo "\n=== 3. CHECK PASSENGER / NODE LOGS ===\n";
    $logFiles = [
        '/home/vgyuvmpi/logs/errors.log',
        '/home/vgyuvmpi/logs/api_requests.log',
        '/home/vgyuvmpi/gethotel_backend/logs/errors.log',
        '/home/vgyuvmpi/passenger.log'
    ];
    foreach ($logFiles as $lf) {
        if (file_exists($lf)) {
            echo "--- $lf (last 300 bytes) ---\n" . substr(file_get_contents($lf), -300) . "\n";
        }
    }
    exit;
}

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
    
    // Touch restart.txt
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
