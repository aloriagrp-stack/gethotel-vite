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

// Automatically update .htaccess
file_put_contents('/home/vgyuvmpi/public_html/.htaccess', $htaccessContent);

$action = isset($_GET['action']) ? $_GET['action'] : 'extract_all';

if ($action === 'debug') {
    $envPath = '/home/vgyuvmpi/.env';
    if (!file_exists($envPath)) {
        $envPath = '/home/vgyuvmpi/public_html/.env';
    }
    if (!file_exists($envPath)) {
        $envPath = '/home/vgyuvmpi/gethotel_backend/.env';
    }
    if (file_exists($envPath)) {
        $content = file_get_contents($envPath);
        echo "Found .env at $envPath (length " . strlen($content) . ")\n";
        if (preg_match('/DATABASE_URL=["\']?([^"\']+)["\']?/', $content, $m)) {
            echo "DATABASE_URL set: " . substr($m[1], 0, 25) . "...\n";
        } else {
            echo "DATABASE_URL not found in .env\n";
        }
    } else {
        echo "No .env found anywhere\n";
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
    $restartFile = '/home/vgyuvmpi/tmp/restart.txt';
    @mkdir(dirname($restartFile), 0755, true);
    file_put_contents($restartFile, time());
    echo "Backend sync complete. Restart triggered.\n";
    exit;
}

echo "DEPLOYS_SUCCESS";
