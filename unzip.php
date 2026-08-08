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

if (isset($_GET['action']) && $_GET['action'] === 'find_apps') {
    header('Content-Type: text/plain');
    echo "=== nodevenv contents ===\n";
    if (is_dir('/home/vgyuvmpi/nodevenv')) {
        foreach (scandir('/home/vgyuvmpi/nodevenv') as $f) {
            if ($f === '.' || $f === '..') continue;
            $p = '/home/vgyuvmpi/nodevenv/' . $f;
            echo (is_dir($p) ? '[DIR] ' : '[FILE] ') . "$f\n";
        }
    } else {
        echo "nodevenv not found\n";
    }

    echo "\n=== .cpanel/apps* configs ===\n";
    if (is_dir('/home/vgyuvmpi/.cpanel')) {
        foreach (scandir('/home/vgyuvmpi/.cpanel') as $f) {
            if (strpos($f, 'app') !== false || strpos($f, 'node') !== false || strpos($f, 'passenger') !== false) {
                echo "[.cpanel] $f\n";
            }
        }
    }

    echo "\n=== otel_backend (possible old app dir) ===\n";
    if (is_dir('/home/vgyuvmpi/otel_backend')) {
        foreach (scandir('/home/vgyuvmpi/otel_backend') as $f) {
            if ($f === '.' || $f === '..' || $f === 'node_modules') continue;
            echo "$f\n";
        }
    } else {
        echo "otel_backend not found\n";
    }

    echo "\n=== gethotel_backend top-level ===\n";
    if (is_dir('/home/vgyuvmpi/gethotel_backend')) {
        foreach (scandir('/home/vgyuvmpi/gethotel_backend') as $f) {
            if ($f === '.' || $f === '..' || $f === 'node_modules' || $f === 'uploads' || $f === 'logs') continue;
            echo (is_dir("/home/vgyuvmpi/gethotel_backend/$f") ? '[DIR] ' : '[FILE] ') . "$f\n";
        }
    }

    echo "\n=== account root server.js size ===\n";
    echo "root: " . (file_exists('/home/vgyuvmpi/server.js') ? filesize('/home/vgyuvmpi/server.js') : 'MISSING') . "\n";
    echo "otel_backend: " . (file_exists('/home/vgyuvmpi/otel_backend/server.js') ? filesize('/home/vgyuvmpi/otel_backend/server.js') : 'MISSING') . "\n";
    echo "gethotel_backend: " . (file_exists('/home/vgyuvmpi/gethotel_backend/server.js') ? filesize('/home/vgyuvmpi/gethotel_backend/server.js') : 'MISSING') . "\n";

    echo "\n=== tmp/restart.txt files ===\n";
    $checks = [
        '/home/vgyuvmpi/tmp/restart.txt',
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt',
        '/home/vgyuvmpi/otel_backend/tmp/restart.txt',
        '/home/vgyuvmpi/restart.txt',
        '/home/vgyuvmpi/gethotel_backend/restart.txt'
    ];
    foreach ($checks as $p) {
        echo (file_exists($p) ? 'EXISTS mtime=' . date('Y-m-d H:i:s', filemtime($p)) : 'MISSING') . " : $p\n";
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'extract_backend') {
    header('Content-Type: text/plain');
    $backendZip = '/home/vgyuvmpi/public_html/backend.zip';
    $extractTo = '/home/vgyuvmpi/gethotel_backend';
    $staging = '/home/vgyuvmpi/public_html/backend_staging';

    if (!file_exists($backendZip)) {
        echo 'BACKEND_ZIP_NOT_FOUND';
        exit;
    }

    // Clear staging dir first
    if (is_dir($staging)) {
        $it = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($staging, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        foreach ($it as $f) {
            $f->isDir() ? @rmdir($f->getRealPath()) : @unlink($f->getRealPath());
        }
    }
    if (!is_dir($staging)) mkdir($staging, 0755, true);

    $zip = new ZipArchive;
    if ($zip->open($backendZip) === TRUE) {
        $result = $zip->extractTo($staging);
        $zip->close();
        if ($result) {
            @unlink($backendZip);
            // Recursive copy from staging -> gethotel_backend using copy()
            if (!is_dir($extractTo)) mkdir($extractTo, 0755, true);
            $copied = 0;
            $fail = [];
            $it2 = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($staging, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($it2 as $item) {
                $rel = $it2->getSubPathName();
                $dest = $extractTo . '/' . $rel;
                if ($item->isDir()) {
                    if (!is_dir($dest)) mkdir($dest, 0755, true);
                } else {
                    if (copy($item->getRealPath(), $dest)) {
                        $copied++;
                    } else {
                        $fail[] = $rel;
                    }
                }
            }
            echo "copied_files=$copied\n";
            if (count($fail) > 0) echo "failed=[" . implode(',', $fail) . "]\n";
            $szNow = file_exists("$extractTo/server.js") ? filesize("$extractTo/server.js") : 0;
            echo "server.js_size=$szNow\n";

            // Touch restart.txt to trigger Passenger reload
            $tmpDir = "$extractTo/tmp";
            if (!is_dir($tmpDir)) mkdir($tmpDir, 0755, true);
            touch("$tmpDir/restart.txt");
            try {
                $cmds = ["pkill -u vgyuvmpi -f node", "pkill -f node", "killall node"];
                foreach ($cmds as $cmd) {
                    if (function_exists('shell_exec')) { @shell_exec($cmd); }
                    else if (function_exists('exec')) { $out = []; @exec($cmd, $out); }
                }
            } catch (Throwable $e) {}
            echo 'BACKEND_DEPLOY_SUCCESS';
        } else {
            echo 'BACKEND_EXTRACT_FAILED';
        }
    } else {
        echo 'BACKEND_ZIP_OPEN_FAILED';
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

if (isset($_GET['action']) && $_GET['action'] === 'check_package') {
    header('Content-Type: text/plain');
    $paths = [
        '/home/vgyuvmpi/package.json',
        '/home/vgyuvmpi/gethotel_backend/package.json'
    ];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            echo "=== $path ===\n";
            $content = json_decode(file_get_contents($path), true);
            echo "main: " . ($content['main'] ?? 'not set') . "\n";
            echo "start: " . ($content['scripts']['start'] ?? 'not set') . "\n";
            echo "server: " . ($content['scripts']['server'] ?? 'not set') . "\n";
        }
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'read_serverjs') {
    header('Content-Type: text/plain');
    $paths = [
        '/home/vgyuvmpi/server.js',
        '/home/vgyuvmpi/gethotel_backend/server.js'
    ];
    foreach ($paths as $path) {
        if (file_exists($path)) {
            echo "=== $path ===\n";
            $size = filesize($path);
            echo "Size: $size bytes\n";
            $content = file_get_contents($path);
            // Look for our inline routes
            if (strpos($content, 'debug-hotels') !== false) {
                echo "CONTAINS debug-hotels route: YES\n";
            } else {
                echo "CONTAINS debug-hotels route: NO\n";
            }
            if (strpos($content, '/api/ai/rooms') !== false) {
                echo "CONTAINS /api/ai/rooms route: YES\n";
            } else {
                echo "CONTAINS /api/ai/rooms route: NO\n";
            }
            if (strpos($content, 'mountAiRoutes') !== false) {
                echo "CONTAINS mountAiRoutes function: YES\n";
            } else {
                echo "CONTAINS mountAiRoutes function: NO\n";
            }
            if (strpos($content, 'prefix}/ai/') !== false) {
                echo "CONTAINS template literal prefix route: YES\n";
            } else {
                echo "CONTAINS template literal prefix route: NO\n";
            }
            echo "First 100 chars: " . substr($content, 0, 100) . "\n";
            // Show lines containing debug-hotels or mountAiRoutes
            $lines = file($path);
            foreach ($lines as $i => $line) {
                if (strpos($line, 'debug-hotels') !== false || strpos($line, 'mountAiRoutes') !== false) {
                    echo "L" . ($i+1) . ": " . $line;
                }
            }
        } else {
            echo "=== $path === NOT FOUND\n";
        }
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'verify_routes') {
    header('Content-Type: text/plain');
    $paths = [
        '/home/vgyuvmpi/server.js',
        '/home/vgyuvmpi/gethotel_backend/server.js'
    ];
    if (function_exists('shell_exec')) {
        echo "=== node processes ===\n";
        echo @shell_exec('ps aux | grep -i node 2>/dev/null | head -20');
        echo "\n=== node version ===\n" . @shell_exec('node -v 2>/dev/null') . "\n";
    }
    foreach ($paths as $path) {
        if (file_exists($path)) {
            echo "\n=== $path ===\n";
            echo "Size: " . filesize($path) . " bytes | mtime: " . date('Y-m-d H:i:s', filemtime($path)) . "\n";
            $content = file_get_contents($path);
            $checks = ['unblock-me', 'v2-update-hotel', 'v2-update-room', 'hotel-update', 'room-update', 'reload-app', 'mountAiRoutes', 'hotels/trending', 'debug-hotels', 'csrfExcludedPaths'];
            foreach ($checks as $ck) {
                echo str_pad($ck, 22) . ": " . (strpos($content, $ck) !== false ? 'PRESENT' : 'MISSING') . "\n";
            }
            $lines = file($path);
            echo "Total lines: " . count($lines) . "\n";
            foreach ($lines as $i => $line) {
                if (strpos($line, 'unblock-me') !== false || strpos($line, 'v2-update-hotel') !== false) {
                    echo "L" . ($i+1) . ": " . trim($line) . "\n";
                }
            }
        } else {
            echo "\n=== $path === NOT FOUND\n";
        }
    }
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

if (isset($_GET['action']) && $_GET['action'] === 'curl_test') {
    header('Content-Type: text/plain');
    if (function_exists('shell_exec')) {
        echo "=== curl test: /api/ai/debug-hotels ===\n";
        echo @shell_exec('curl -s -o /dev/null -w "HTTP_CODE: %{http_code}\n" "http://localhost:5000/api/ai/debug-hotels" 2>/dev/null || echo "curl failed"') . "\n";
        echo @shell_exec('curl -s "http://localhost:5000/api/ai/debug-hotels" 2>/dev/null || echo "curl failed"') . "\n";
        echo "\n=== curl test: /api/ai/rooms (POST) ===\n";
        echo @shell_exec('curl -s -o /dev/null -w "HTTP_CODE: %{http_code}\n" -X POST -H "Content-Type: application/json" -d \'{"hotelId":1}\' "http://localhost:5000/api/ai/rooms" 2>/dev/null || echo "curl failed"') . "\n";
        echo @shell_exec('curl -s -X POST -H "Content-Type: application/json" -d \'{"hotelId":1}\' "http://localhost:5000/api/ai/rooms" 2>/dev/null || echo "curl failed"') . "\n";
        echo "\n=== curl test: /api/ai/chat (POST) ===\n";
        echo @shell_exec('curl -s -o /dev/null -w "HTTP_CODE: %{http_code}\n" -X POST -H "Content-Type: application/json" -d \'{"messages":[{"role":"user","content":"delhi hotels"}]}\' "http://localhost:5000/api/ai/chat" 2>/dev/null || echo "curl failed"') . "\n";
    } else {
        echo "shell_exec disabled\n";
    }
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'restart') {
    header('Content-Type: text/plain');

    // Show running node processes before killing
    if (isset($_GET['ps'])) {
        echo "=== Node processes BEFORE restart ===\n";
        if (function_exists('shell_exec')) {
            echo @shell_exec('ps aux | grep -i node 2>/dev/null || echo "ps not available"') . "\n";
        }
        echo "=== gethotel_backend server.js size ===\n";
        echo "Size: " . filesize('/home/vgyuvmpi/gethotel_backend/server.js') . " bytes\n";
        echo "=== root server.js size ===\n";
        echo "Size: " . filesize('/home/vgyuvmpi/server.js') . " bytes\n";
    }
    
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

        // Show running node processes after killing
        if (isset($_GET['ps'])) {
            sleep(2);
            echo "\n=== Node processes AFTER restart ===\n";
            if (function_exists('shell_exec')) {
                echo @shell_exec('ps aux | grep -i node 2>/dev/null || echo "ps not available"') . "\n";
            }
        }
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
