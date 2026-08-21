<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'sync_backend';

if ($action === 'extract_backend') {
    echo "=== EXTRACTING BACKEND.ZIP ===\n";
    $zipFile = '/home/vgyuvmpi/public_html/backend.zip';
    $targetDir = '/home/vgyuvmpi/gethotel_backend/';
    
    if (file_exists($zipFile)) {
        @mkdir($targetDir, 0755, true);
        if (class_exists('ZipArchive')) {
            $zip = new ZipArchive();
            if ($zip->open($zipFile) === TRUE) {
                $zip->extractTo($targetDir);
                $zip->close();
                echo "Extracted via ZipArchive to $targetDir\n";
            } else {
                echo "Failed to open $zipFile\n";
            }
        } else {
            exec("unzip -o '$zipFile' -d '$targetDir' 2>&1", $out);
            echo implode("\n", $out) . "\n";
        }
    } else {
        echo "Zip file not found: $zipFile\n";
    }
}

if ($action === 'sync_backend' || $action === 'extract_backend' || $action === 'extract_all') {
    echo "=== SYNCING BACKEND TO HOME DIR ===\n";
    $srcDir = '/home/vgyuvmpi/gethotel_backend/';
    $targetDir = '/home/vgyuvmpi/';
    
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
    
    // Touch restart.txt to restart Phusion Passenger
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
