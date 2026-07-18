<?php
// Force restart script for Passenger Node.js backend
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
    echo "Reload triggered successfully!\n";
} catch (Throwable $e) {
    echo "Failed to execute restart: " . $e->getMessage() . "\n";
}
?>
