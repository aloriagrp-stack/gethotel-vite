$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'
$projectDir = "D:\shriyansh stock\travell app project"
$tempDir = Join-Path $projectDir "deploy_temp"

Write-Host "=== Creating separate Backend & Frontend ZIPs ==="

# Clean temp dir
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }

# ========== BACKEND ZIP ==========
Write-Host "`n--- Backend ZIP ---"
$backendTemp = Join-Path $tempDir "backend"
New-Item -ItemType Directory -Force -Path $backendTemp | Out-Null

$backendSrc = Join-Path $projectDir "GetHotel backend"
robocopy "$backendSrc" "$backendTemp" /E /XD node_modules .git tmp logs uploads /XF .env *.zip | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backendTemp "uploads") | Out-Null
Write-Host "Backend files copied (excluding node_modules, tmp, uploads, logs, .git, .env, and zip files)."

$backendZip = Join-Path $projectDir "GetHotel_Backend_$timestamp.zip"
if (Test-Path $backendZip) { Remove-Item -Force $backendZip }
tar.exe -a -c -f $backendZip -C $backendTemp .

$size1 = (Get-Item $backendZip).Length
$sizeMB1 = [math]::Round($size1 / 1048576, 2)
Write-Host "Backend ZIP: $backendZip ($sizeMB1 MB)"

# ========== FRONTEND ZIP ==========
Write-Host "`n--- Frontend ZIP ---"
$frontendTemp = Join-Path $tempDir "frontend"
New-Item -ItemType Directory -Force -Path $frontendTemp | Out-Null

$distSrc = Join-Path $projectDir "GetHotel-Vite\dist"
Get-ChildItem $distSrc | Copy-Item -Destination $frontendTemp -Recurse -Force
Write-Host "Frontend dist files copied."

$frontendZip = Join-Path $projectDir "GetHotel_Frontend_$timestamp.zip"
if (Test-Path $frontendZip) { Remove-Item -Force $frontendZip }
tar.exe -a -c -f $frontendZip -C $frontendTemp .

$size2 = (Get-Item $frontendZip).Length
$sizeMB2 = [math]::Round($size2 / 1048576, 2)
Write-Host "Frontend ZIP: $frontendZip ($sizeMB2 MB)"

# Cleanup
Remove-Item -Recurse -Force $tempDir

Write-Host "`n=== DONE ==="
Write-Host "Backend:  $backendZip ($sizeMB1 MB)"
Write-Host "Frontend: $frontendZip ($sizeMB2 MB)"
