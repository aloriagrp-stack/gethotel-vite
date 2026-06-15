<?php
// PHP Script to securely update live .env file on cPanel with Gemini & Groq keys
$envPath = '/home/vgyuvmpi/gethotel_backend/.env';

if (!file_exists($envPath)) {
    echo 'ERROR: env file not found';
    exit;
}

$content = file_get_contents($envPath);

$geminiKey = 'AQ.Ab8RN6LcARtDikQY87qrJPGiVtpHpCuaYsl40nPmZTrj-Vm-PA';
$groqKey = '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';

// Function to set or replace key in .env content
function setEnvValue(&$content, $key, $value) {
    $pattern = "/^" . preg_quote($key) . "=(.*)$/m";
    $newLine = $key . '="' . $value . '"';
    if (preg_match($pattern, $content)) {
        $content = preg_replace($pattern, $newLine, $content);
    } else {
        $content .= "\n" . $newLine . "\n";
    }
}

setEnvValue($content, 'GEMINI_API_KEY', $geminiKey);
setEnvValue($content, 'GROQ_API_KEY', $groqKey);

if (file_put_contents($envPath, $content) !== false) {
    echo 'ENV_UPDATE_SUCCESS';
} else {
    echo 'ENV_UPDATE_FAILED';
}

// Safely delete this script so it is not accessible anymore
unlink(__FILE__);
?>
