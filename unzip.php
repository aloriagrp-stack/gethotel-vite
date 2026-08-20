<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$htaccessContent = '# ═══════════════════════════════════════════════
# SPA ROUTING & API REVERSE PROXY
# ═══════════════════════════════════════════════
RewriteEngine On
RewriteBase /

# Reverse Proxy /api requests to local Node server on port 5000
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]

RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_URI} !^/api [NC]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
';

file_put_contents('/home/vgyuvmpi/public_html/.htaccess', $htaccessContent);

$action = isset($_GET['action']) ? $_GET['action'] : 'extract_all';

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
    
    // Touch restart.txt in all possible app roots
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
