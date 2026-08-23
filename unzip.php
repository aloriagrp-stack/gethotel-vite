<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'all';

function extractZip($zipPath, $destDir) {
    if (!file_exists($zipPath)) {
        echo "Zip file not found: $zipPath\n";
        return false;
    }
    @mkdir($destDir, 0755, true);
    if (class_exists('ZipArchive')) {
        $zip = new ZipArchive();
        if ($zip->open($zipPath) === TRUE) {
            $zip->extractTo($destDir);
            $zip->close();
            echo "Extracted $zipPath via ZipArchive to $destDir\n";
            return true;
        }
    }
    exec("unzip -o '$zipPath' -d '$destDir' 2>&1", $out);
    echo "Unzipped to $destDir: " . implode("\n", (array)$out) . "\n";
    return true;
}

// 1. EXTRACT MAIN FRONTEND
if ($action === 'all' || $action === 'extract_frontend' || $action === 'extract_all') {
    echo "=== 1. EXTRACTING FRONTEND.ZIP TO PUBLIC_HTML ===\n";
    $frontendZip = '/home/vgyuvmpi/public_html/frontend.zip';
    if (file_exists($frontendZip)) {
        extractZip($frontendZip, '/home/vgyuvmpi/public_html/');
    } else {
        echo "Frontend zip not found at $frontendZip\n";
    }
}

// 2. EXTRACT AI FRONTEND
if ($action === 'all' || $action === 'extract_ai' || $action === 'extract_all') {
    echo "\n=== 2. EXTRACTING AI FRONTEND ===\n";
    $aiZips = [
        '/home/vgyuvmpi/ai.gethotelstays.com/ai-frontend.zip',
        '/home/vgyuvmpi/public_html/ai-frontend.zip'
    ];
    $aiDest = '/home/vgyuvmpi/ai.gethotelstays.com/';
    foreach ($aiZips as $az) {
        if (file_exists($az)) {
            extractZip($az, $aiDest);
            break;
        }
    }
}

// 3. EXTRACT BACKEND
if ($action === 'all' || $action === 'extract_backend' || $action === 'extract_all') {
    echo "\n=== 3. EXTRACTING BACKEND.ZIP ===\n";
    $backendZip = '/home/vgyuvmpi/public_html/backend.zip';
    if (file_exists($backendZip)) {
        $targets = ['/home/vgyuvmpi/', '/home/vgyuvmpi/gethotel_backend/'];
        foreach ($targets as $t) {
            extractZip($backendZip, $t);
        }
    } else {
        echo "Backend zip not found at $backendZip\n";
    }
}

// 4. SYNC BACKEND TO HOME DIR
if ($action === 'all' || $action === 'sync_backend' || $action === 'extract_all') {
    echo "\n=== 4. SYNCING BACKEND TO HOME DIR ===\n";
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
}

// 5. RESTART PASSENGER
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

