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
    
    if (is_dir('./client')) {
        echo "\n=== Scandir client/ ===\n";
        $cfiles = scandir('./client');
        foreach ($cfiles as $cf) {
            if ($cf !== '.' && $cf !== '..') {
                $isDir = is_dir("./client/$cf") ? "[DIR]" : "[FILE]";
                $mtime = date("Y-m-d H:i:s", filemtime("./client/$cf"));
                echo "$isDir $cf - $mtime\n";
            }
        }
    } else {
        echo "\nclient/ directory NOT found!\n";
    }
    
    if (is_dir('./client/assets')) {
        echo "\n=== Scandir client/assets/ ===\n";
        $cassets = scandir('./client/assets');
        foreach ($cassets as $ca) {
            if ($ca !== '.' && $ca !== '..') {
                if (strpos($ca, 'index-') === 0 || strpos($ca, 'PartnerLayout-') === 0 || strpos($ca, 'Dashboard-') === 0) {
                    $mtime = date("Y-m-d H:i:s", filemtime("./client/assets/$ca"));
                    echo "[FILE] $ca - $mtime (" . filesize("./client/assets/$ca") . " bytes)\n";
                }
            }
        }
    } else {
        echo "\nclient/assets/ directory NOT found!\n";
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
    $extractResult = $zip->extractTo($extractTo);
    $zip->close();
    
    if ($extractResult !== TRUE) {
        echo 'ERROR: Zip extraction failed. Please check folder permissions.';
        $user = function_exists('posix_getpwuid') && function_exists('posix_geteuid') ? posix_getpwuid(posix_geteuid())['name'] : 'unknown';
        echo " PHP User: $user";
        exit;
    }
    
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
