<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain');

$action = isset($_GET['action']) ? $_GET['action'] : 'run_node_check';

if (empty($action) || $action === 'run_node_check') {
    echo "=== TESTING SERVER.JS LOAD WITH NODE 20 ===\n";
    $nodeBin = '/home/vgyuvmpi/nodevenv/gethotel_backend/20/bin/node';
    
    // Ensure production .env exists in /home/vgyuvmpi/.env
    $envContent = 'PORT=5000
DATABASE_URL="mysql://vgyuvmpi_gethotel_db:shriyanshking@103.108.220.145:3306/vgyuvmpi_gethotel_db?connection_limit=20&pool_timeout=30&connect_timeout=30"
JWT_SECRET="G7h!sT@yS_2024_S3cur3_K3y_#99_fX_zQ_pL_88_wK_22_mN_11_vB_00_xZ_99_pQ_77"
NODE_ENV="production"
FIREBASE_PROJECT_ID="gethotel-ec956"
RAZORPAY_KEY_ID="rzp_live_T16NuPtvvs9cRV"
RAZORPAY_KEY_SECRET="BzQHn3KOCxAX2HbXgLUme0dZ"
FRONTEND_URL="https://gethotelstays.com"
RAZORPAY_WEBHOOK_SECRET="gethotelstayssecret2026"
EMAIL_HOST="mail.gethotelstays.com"
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER="reservation@gethotelstays.com"
EMAIL_PASS="shriyanshking"
GEMINI_API_KEY="AQ.Ab8RN6LcARtDikQY87qrJPGiVtpHpCuaYsl40nPmZTrj-Vm-PA"
GROQ_API_KEY="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"
OPENROUTER_API_KEY="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"
';
    file_put_contents('/home/vgyuvmpi/.env', $envContent);
    file_put_contents('/home/vgyuvmpi/gethotel_backend/.env', $envContent);

    $cmd = "cd /home/vgyuvmpi && $nodeBin -e \"
      try {
        process.env.DATABASE_URL = 'mysql://vgyuvmpi_gethotel_db:shriyanshking@103.108.220.145:3306/vgyuvmpi_gethotel_db?connection_limit=20&pool_timeout=30&connect_timeout=30';
        require('./server.js');
        console.log('SUCCESS: Server.js loaded without errors!');
      } catch(e) {
        console.error('CRASH ERROR:', e.stack);
      }
    \" 2>&1";
    
    echo shell_exec($cmd) . "\n";
    exit;
}

if ($action === 'sync_backend' || $action === 'extract_backend' || $action === 'extract_all') {
    $srcDir = '/home/vgyuvmpi/gethotel_backend/';
    $targetDir = '/home/vgyuvmpi/';
    
    $items = ['server.js', 'package.json', 'routes', 'controllers', 'config', 'middleware', 'prisma', 'utils', 'services'];
    foreach ($items as $item) {
        $src = $srcDir . $item;
        $dest = $targetDir . $item;
        if (file_exists($src)) {
            if (is_dir($src)) {
                exec("cp -rf '$src' '$targetDir'");
            } else {
                copy($src, $dest);
            }
        }
    }
    
    $restartPaths = [
        '/home/vgyuvmpi/tmp/restart.txt',
        '/home/vgyuvmpi/public_html/tmp/restart.txt',
        '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt'
    ];
    foreach ($restartPaths as $rp) {
        @mkdir(dirname($rp), 0755, true);
        file_put_contents($rp, time());
    }
    echo "SYNC_COMPLETE";
    exit;
}

echo "DEPLOYS_SUCCESS";
