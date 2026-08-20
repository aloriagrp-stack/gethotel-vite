<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'extract_all';

if ($action === 'check_processes') {
    echo "=== PS AUX (NODE) ===\n";
    echo shell_exec("ps aux | grep node") . "\n";
    
    echo "=== NETSTAT / LISTENING PORTS ===\n";
    echo shell_exec("netstat -tlpn 2>&1 || ss -tlpn 2>&1") . "\n";

    echo "=== PM2 STATUS ===\n";
    echo shell_exec("pm2 status 2>&1") . "\n";
    exit;
}

if ($action === 'restart_pm2') {
    echo "=== RESTARTING PM2 / NODE ===\n";
    echo shell_exec("pm2 restart all 2>&1 || pm2 start server.js --name gethotel-backend 2>&1") . "\n";
    exit;
}

echo "DEPLOYS_SUCCESS";
