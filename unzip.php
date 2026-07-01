<?php
// PHP Unzip Helper Script for GetHotelStays deployment

if (isset($_GET['action']) && $_GET['action'] === 'debug') {
    header('Content-Type: text/plain');
    
    echo "Current Directory: " . __DIR__ . "\n\n";
    
    echo "=== Scandir Current Dir ===\n";
    $files = scandir('.');
    foreach ($files as $f) {
        if ($f !== '.' && $f !== '..') {
            $isDir = is_dir($f) ? "[DIR]" : "[FILE]";
            $mtime = date("Y-m-d H:i:s", filemtime($f));
            $size = is_dir($f) ? "" : " (" . filesize($f) . " bytes)";
            echo "$isDir $f - $mtime$size\n";
        }
    }
    
    if (is_dir('./assets')) {
        echo "\n=== Scandir assets/ ===\n";
        $assets = scandir('./assets');
        foreach ($assets as $a) {
            if ($a !== '.' && $a !== '..') {
                if (strpos($a, 'index-') === 0 || strpos($a, 'PartnerLayout-') === 0 || strpos($a, 'Dashboard-') === 0) {
                    $mtime = date("Y-m-d H:i:s", filemtime("./assets/$a"));
                    echo "[FILE] $a - $mtime (" . filesize("./assets/$a") . " bytes)\n";
                }
            }
        }
    } else {
        echo "\nassets/ directory NOT found!\n";
    }
    
    if (file_exists('.htaccess')) {
        echo "\n=== .htaccess ===\n";
        echo file_get_contents('.htaccess');
    } else {
        echo "\n.htaccess NOT found!\n";
    }
    exit;
}

$zipFile = 'frontend.zip';
$extractTo = './';

if (!file_exists($zipFile)) {
    echo 'ERROR: ZIP file not found';
    exit;
}

$zip = new ZipArchive;
if ($zip->open($zipFile) === TRUE) {
    $zip->extractTo($extractTo);
    $zip->close();
    // Auto-restart the backend application
    $restartPaths = [
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt',
        '../gethotel_backend/tmp/restart.txt'
    ];
    foreach ($restartPaths as $path) {
        if (is_dir(dirname($path))) {
            touch($path);
        }
    }

    // Force-kill existing Node.js processes to guarantee passenger reload
    try {
        $cmds = ["pkill -u vgyuvmpi -f node", "pkill -f node", "killall node"];
        foreach ($cmds as $cmd) {
            if (function_exists('shell_exec')) { 
                @shell_exec($cmd); 
            } else if (function_exists('exec')) { 
                $out = []; 
                @exec($cmd, $out); 
            } else if (function_exists('system')) { 
                ob_start(); 
                @system($cmd); 
                ob_end_clean(); 
            } else if (function_exists('passthru')) { 
                ob_start(); 
                @passthru($cmd); 
                ob_end_clean(); 
            }
        }
    } catch (Throwable $e) {
        // Ignore if disabled or disallowed
    }

    echo 'DEPLOYS_SUCCESS';
    unlink($zipFile);
    // unlink(__FILE__);
} else {
    echo 'DEPLOYS_FAILED';
}
?>
