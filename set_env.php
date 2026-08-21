<?php
header('Content-Type: text/plain');

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

$paths = [
    '/home/vgyuvmpi/.env',
    '/home/vgyuvmpi/public_html/.env',
    '/home/vgyuvmpi/gethotel_backend/.env'
];

foreach ($paths as $path) {
    if (file_put_contents($path, $envContent) !== false) {
        echo "Updated env at: $path\n";
    } else {
        echo "Failed to write env at: $path\n";
    }
}

// Copy backend files from gethotel_backend to root app dir
$srcDir = '/home/vgyuvmpi/gethotel_backend/';
$targetDir = '/home/vgyuvmpi/';

$items = ['server.js', 'package.json', 'routes', 'controllers', 'config', 'middleware', 'prisma', 'utils', 'services'];
foreach ($items as $item) {
    $src = $srcDir . $item;
    $dest = $targetDir . $item;
    if (file_exists($src)) {
        if (is_dir($src)) {
            exec("cp -rf '$src' '$targetDir'");
            echo "Synced dir: $item\n";
        } else {
            copy($src, $dest);
            echo "Copied file: $item\n";
        }
    }
}

// Trigger restart
$restartPaths = [
    '/home/vgyuvmpi/tmp/restart.txt',
    '/home/vgyuvmpi/public_html/tmp/restart.txt',
    '/home/vgyuvmpi/gethotel_backend/tmp/restart.txt'
];

foreach ($restartPaths as $rp) {
    @mkdir(dirname($rp), 0755, true);
    file_put_contents($rp, time());
    echo "Restart triggered via $rp\n";
}
