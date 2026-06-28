<?php
// PHP Unzip Helper Script for GetHotelStays deployment

if (isset($_GET['action']) && $_GET['action'] === 'debug') {
    header('Content-Type: text/plain');
    
    echo "=== scandir /home/vgyuvmpi ===\n";
    if (is_dir('/home/vgyuvmpi')) {
        $dirs = scandir('/home/vgyuvmpi');
        foreach ($dirs as $d) {
            if ($d !== '.' && $d !== '..' && is_dir("/home/vgyuvmpi/$d")) {
                echo "Folder: $d\n";
            }
        }
    } else {
        echo "/home/vgyuvmpi is not a directory or is not readable\n";
    }
    
    $file = '/home/vgyuvmpi/gethotel_backend/routes/adminRoutes.js';
    if (file_exists($file)) {
        echo "=== adminRoutes.js ===\n";
        echo file_get_contents($file);
    } else {
        echo "routes/adminRoutes.js not found at: $file\n";
    }
    
    $file2 = '/home/vgyuvmpi/gethotel_backend/controllers/adminController.js';
    if (file_exists($file2)) {
        echo "\n=== adminController.js (first 50 lines) ===\n";
        $lines = file($file2);
        echo implode("", array_slice($lines, 0, 50));
    } else {
        echo "controllers/adminController.js not found\n";
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
