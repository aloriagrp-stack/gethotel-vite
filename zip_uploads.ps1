# PowerShell Script to bundle local upload images for syncing to cPanel/Live server
# Run this script, then upload 'GetHotel_Uploads_Sync.zip' to cPanel File Manager,
# and extract it inside your backend directory (so it merges with your live uploads folder).

$ErrorActionPreference = "Stop"
$projectDir = "D:\shriyansh stock\travell app project"
$uploadsSrc = Join-Path $projectDir "GetHotel backend\uploads"
$zipPath = Join-Path $projectDir "GetHotel_Uploads_Sync.zip"

Write-Host "=== GetHotel Image Synchronization Tool ===" -ForegroundColor Cyan

if (-not (Test-Path $uploadsSrc)) {
    Write-Error "Local uploads directory not found at $uploadsSrc"
    exit
}

# Get list of files
$files = Get-ChildItem -Path $uploadsSrc -File
Write-Host "Found $($files.Count) image file(s) in local uploads directory."

if ($files.Count -eq 0) {
    Write-Host "No files to zip. Exiting." -ForegroundColor Yellow
    exit
}

# Remove existing zip if any
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Write-Host "Creating zip package at: $zipPath ..." -ForegroundColor Yellow

# Use native Compress-Archive
Compress-Archive -Path "$uploadsSrc\*" -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Success! Sync package created." -ForegroundColor Green
Write-Host "Package Path: $zipPath" -ForegroundColor Green
Write-Host "Package Size: $sizeMB MB" -ForegroundColor Green
Write-Host "`nInstructions for deployment:" -ForegroundColor Cyan
Write-Host "1. Log into your cPanel File Manager."
Write-Host "2. Navigate to your live backend directory (e.g., '/home/vgyuvmpi/gethotel_backend/')."
Write-Host "3. Upload the 'GetHotel_Uploads_Sync.zip' file to the 'uploads' folder (or to root and move the files)."
Write-Host "4. Extract the ZIP file. This will add all your local images to the live server without affecting any files."
Write-Host "5. Delete the ZIP file from cPanel once extraction is complete."
