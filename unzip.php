<?php
// PHP Unzip Helper Script for GetHotelStays deployment

if (isset($_GET['action']) && $_GET['action'] === 'debug') {
    header('Content-Type: text/plain');
    
    echo "=== scandir /home/vgyuvmpi ===\n";
    if (is_dir('/home/vgyuvmpi')) {
        $files = scandir('/home/vgyuvmpi');
        foreach ($files as $f) {
            echo (is_dir("/home/vgyuvmpi/$f") ? "[DIR] " : "[FILE] ") . "$f\n";
        }
    } else {
        echo "/home/vgyuvmpi is not readable\n";
    }
    
    echo "\n=== scandir /home/vgyuvmpi/public_html ===\n";
    if (is_dir('/home/vgyuvmpi/public_html')) {
        $files = scandir('/home/vgyuvmpi/public_html');
        foreach ($files as $f) {
            echo (is_dir("/home/vgyuvmpi/public_html/$f") ? "[DIR] " : "[FILE] ") . "$f\n";
        }
    } else {
        echo "/home/vgyuvmpi/public_html is not readable\n";
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'restart') {
    header('Content-Type: text/plain');
    
    $restartPaths = [
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt',
        '../gethotel_backend/tmp/restart.txt'
    ];
    foreach ($restartPaths as $path) {
        if (is_dir(dirname($path))) {
            touch($path);
            echo "Touched restart.txt at: $path\n";
        }
    }

    try {
        $cmds = ["pkill -u vgyuvmpi -f node", "pkill -f node", "killall node"];
        foreach ($cmds as $cmd) {
            if (function_exists('shell_exec')) {
                echo "Executing: $cmd\n";
                $output = @shell_exec($cmd);
                echo "Output: " . ($output ? trim($output) : "No output/Success") . "\n";
            } else if (function_exists('exec')) {
                echo "Executing via exec: $cmd\n";
                $out = [];
                @exec($cmd, $out);
                echo "Output: " . implode("\n", $out) . "\n";
            }
        }
        echo "Backend node processes killed and reload requested successfully!\n";
    } catch (Throwable $e) {
        echo "Failed to execute restart: " . $e->getMessage() . "\n";
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
