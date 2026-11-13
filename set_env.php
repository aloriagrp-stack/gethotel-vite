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

echo "\n=== 3. CHECKING HTACCESS ROUTING FOR HOTELS-DIRECTORY ===\n";
$htaccessFile = '/home/vgyuvmpi/public_html/.htaccess';
if (file_exists($htaccessFile)) {
    $content = file_get_contents($htaccessFile);
    if (strpos($content, 'hotels-directory/[^/]+/[^/]+') === false) {
        $rule = "\nRewriteRule ^hotels-directory/[^/]+/[^/]+/?$ /hotels-directory/delhi/stay/index.html [L,QSA]\nRewriteRule ^hotels-directory/?$ /hotels-directory/index.html [L,QSA]\n";
        $content = str_replace('RewriteRule ^hotel/.*$ /hotel/1/index.html [L,QSA]', "RewriteRule ^hotel/.*$ /hotel/1/index.html [L,QSA]" . $rule, $content);
        file_put_contents($htaccessFile, $content);
        echo "Injected hotels-directory rewrite rules into .htaccess\n";
    } else {
        echo "hotels-directory rewrite rules already present in .htaccess\n";
    }
}

echo "\nSYNC AND RESTART FINISHED SUCCESSFULLY.\n";
