<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'test_node';

if ($action === 'test_node') {
    echo "=== FINDING NODE BINARY ===\n";
    $nodePath = shell_exec("which node 2>&1 || find /home/vgyuvmpi/nodevenv/ -name node 2>&1");
    echo "Node Path: " . trim($nodePath) . "\n\n";

    echo "=== TESTING SERVER.JS LOAD WITH NODE ===\n";
    $cmd = "cd /home/vgyuvmpi && " . trim($nodePath) . " -e \"
      try {
        require('./server.js');
        console.log('Server.js loaded OK!');
      } catch(e) {
        console.error('SERVER INIT ERROR:', e.stack);
      }
    \" 2>&1";
    echo shell_exec($cmd) . "\n";
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
