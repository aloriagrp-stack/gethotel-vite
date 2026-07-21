<?php
// PHP Unzip Helper Script for GetHotelStays deployment

if (isset($_GET['action']) && $_GET['action'] === 'extract_ai') {
    header('Content-Type: text/plain');
    $aiZipFile = '/home/vgyuvmpi/ai.gethotelstays.com/ai-frontend.zip';
    $aiExtractTo = '/home/vgyuvmpi/ai.gethotelstays.com/';

    if (!file_exists($aiZipFile)) {
        echo 'AI_ZIP_NOT_FOUND';
        exit;
    }

    $zip = new ZipArchive;
    if ($zip->open($aiZipFile) === TRUE) {
        $result = $zip->extractTo($aiExtractTo);
        $zip->close();
        if ($result) {
            unlink($aiZipFile);
            echo 'AI_DEPLOY_SUCCESS';
        } else {
            echo 'AI_EXTRACT_FAILED';
        }
    } else {
        echo 'AI_ZIP_OPEN_FAILED';
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'debug') {
    header('Content-Type: text/plain');
    
    // Include Prisma or database credentials to verify live rooms
    try {
        $envFile = '/home/vgyuvmpi/gethotel_backend/.env';
        if (file_exists($envFile)) {
            $env = parse_ini_file($envFile);
            $dbUrl = isset($env['DATABASE_URL']) ? $env['DATABASE_URL'] : '';
            echo "DATABASE_URL exists (length: " . strlen($dbUrl) . ")\n";
            echo "DATABASE_URL prefix: " . substr($dbUrl, 0, 35) . "\n";
            
            // Connect using simple PDO to check rooms
            // mysql://user:pass@host:port/dbname or mysql://user:pass@host/dbname
            if (preg_match('/mysql:\/\/([^:]+):([^@]*)\@([^:\/]+)(?::(\d+))?\/([^?]+)/', $dbUrl, $matches)) {
                $user = $matches[1];
                $pass = $matches[2];
                $host = $matches[3];
                $port = !empty($matches[4]) ? $matches[4] : '3306';
                $dbname = explode('?', $matches[5])[0];
                
                $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $user, $pass);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                echo "=== PDO Connected successfully ===\n";
                
                // Get Hotel City Star New Delhi ID and Rooms
                $stmt = $pdo->prepare("SELECT id, name FROM hotel WHERE name LIKE '%City Star%' LIMIT 1");
                $stmt->execute();
                $hotel = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($hotel) {
                    echo "Found Hotel: " . $hotel['name'] . " (ID: " . $hotel['id'] . ")\n";
                    
                    $stmt2 = $pdo->prepare("SELECT id, name, status, pricePerNight FROM room WHERE hotelId = ?");
                    $stmt2->execute([$hotel['id']]);
                    $rooms = $stmt2->fetchAll(PDO::FETCH_ASSOC);
                    echo "Total Rooms: " . count($rooms) . "\n";
                    foreach ($rooms as $r) {
                        echo "Room ID: " . $r['id'] . " | Name: " . $r['name'] . " | Status: " . $r['status'] . " | Price: " . $r['pricePerNight'] . "\n";
                    }
                } else {
                    echo "Hotel City Star not found in DB\n";
                }
            } else {
                echo "DATABASE_URL pattern match failed\n";
            }
        } else {
            echo ".env not found at: $envFile\n";
        }
    } catch (Throwable $e) {
        echo "DB Check Error: " . $e->getMessage() . "\n";
    }
    
    try {
        $file = '/home/vgyuvmpi/gethotel_backend/controllers/aiController.js';
        if (file_exists($file)) {
            echo "\n=== aiController.js (lines 950-1080) ===\n";
            $lines = file($file);
            echo implode("", array_slice($lines, 950, 130));
        } else {
            echo "aiController.js not found\n";
        }
    } catch (Throwable $e) {
        echo "Error reading aiController.js: " . $e->getMessage() . "\n";
    }
    
    echo "\n=== scandir /home/vgyuvmpi ===\n";
    if (is_dir('/home/vgyuvmpi')) {
        $files = scandir('/home/vgyuvmpi');
        foreach ($files as $f) {
            echo (is_dir("/home/vgyuvmpi/$f") ? "[DIR] " : "[FILE] ") . "$f\n";
        }
    } else {
        echo "/home/vgyuvmpi is not readable\n";
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'sync_backend') {
    header('Content-Type: text/plain');
    $srcDir = '/home/vgyuvmpi/gethotel_backend';
    $dstDir = '/home/vgyuvmpi';
    $subdirs = ['routes', 'controllers', 'config', 'middleware', 'prisma', 'utils'];
    $rootFiles = ['server.js', 'package.json'];

    if (!is_dir($srcDir)) {
        echo "ERROR: Source dir $srcDir not found\n";
        exit;
    }

    // Copy root-level files
    foreach ($rootFiles as $file) {
        $src = "$srcDir/$file";
        $dst = "$dstDir/$file";
        if (file_exists($src)) {
            copy($src, $dst);
            echo "Copied: $file\n";
        }
    }

    // Copy subdirectories recursively
    foreach ($subdirs as $subdir) {
        $srcSub = "$srcDir/$subdir";
        $dstSub = "$dstDir/$subdir";
        if (!is_dir($srcSub)) continue;
        if (!is_dir($dstSub)) mkdir($dstSub, 0755, true);

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($srcSub, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($iterator as $item) {
            $destPath = $dstSub . '/' . $iterator->getSubPathName();
            if ($item->isDir()) {
                if (!is_dir($destPath)) mkdir($destPath, 0755, true);
            } else {
                copy($item->getRealPath(), $destPath);
            }
        }
        echo "Synced: $subdir/\n";
    }

    // Touch restart.txt to trigger Passenger reload
    $tmpDir = "$dstDir/tmp";
    if (!is_dir($tmpDir)) mkdir($tmpDir, 0755, true);
    touch("$tmpDir/restart.txt");

    echo "Backend sync complete. Restart triggered.\n";
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'cleanup') {
    header('Content-Type: text/plain');
    $dir = '/home/vgyuvmpi/ai.gethotelstays.com/ai.gethotelstays.com';
    if (is_dir($dir)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($files as $fileinfo) {
            $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
            $todo($fileinfo->getRealPath());
        }
        rmdir($dir);
        echo "Cleaned up nested subdomain folder successfully!\n";
    } else {
        echo "Nested subdomain folder not found or already deleted.\n";
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
