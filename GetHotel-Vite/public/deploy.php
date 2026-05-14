<?php
/**
 * GetHotel Auto-Deployment Hook
 * This script pulls the latest changes from GitHub and restarts the app.
 */

// Secret token for security (Add this to your GitHub Webhook)
$secret = 'gethotel_secret_token_2026';

// Get the signature from GitHub
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE'] ?? '';

if (!$signature) {
    die('No signature provided');
}

// Verify the signature
$payload = file_get_contents('php://input');
$expected_signature = 'sha1=' . hash_hmac('sha1', $payload, $secret);

if (!hash_equals($expected_signature, $signature)) {
    header('HTTP/1.1 403 Forbidden');
    die('Invalid signature');
}

echo "Deployment started...\n";

// Run deployment commands
$commands = [
    'cd /home/vgyuvmpi/gethotel_frontend && git pull origin main 2>&1',
    'cd /home/vgyuvmpi/gethotel_frontend && npm install --production 2>&1',
    'cd /home/vgyuvmpi/gethotel_frontend && touch tmp/restart.txt 2>&1'
];

foreach ($commands as $cmd) {
    echo "Running: $cmd\n";
    $output = shell_exec($cmd);
    echo "$output\n";
}

echo "Deployment finished!";
?>
