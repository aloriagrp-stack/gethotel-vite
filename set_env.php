<?php
header('Content-Type: text/plain');

echo "=== 1. SEARCHING FOR SERVER.JS AND REPOS ON CPANEL ===\n";
exec("find /home/vgyuvmpi -name 'server.js' 2>&1", $out1);
foreach ($out1 as $f) {
    echo "Found server.js: $f\n";
}

echo "\n=== 2. SEARCHING FOR PASSENGER LOGS OR CPANEL LOGS ===\n";
exec("find /home/vgyuvmpi -name '*.log' -maxdepth 3 2>&1", $out2);
foreach ($out2 as $l) {
    echo "Found log: $l\n";
}
