$ErrorActionPreference = "SilentlyContinue"
$projectDir = "D:\shriyansh stock\travell app project"
$timestamp = "2026-06-09_1907"

# Cleanup old temp
$tempDir = Join-Path $projectDir "deploy_backend_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

# Copy backend files excluding heavy stuff
$backendSrc = Join-Path $projectDir "GetHotel backend"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

$excludeNames = @("node_modules", "tmp", ".git", "logs", "node_modules.zip")
Get-ChildItem -Path $backendSrc | Where-Object {
    $excludeNames -notcontains $_.Name
} | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Recurse -Force
    } else {
        Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Force
    }
}

Write-Host "Files copied. Creating Backend ZIP..."

$zipPath = Join-Path $projectDir "GetHotel_Backend_$timestamp.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host "Backend ZIP created: $zipPath"
Write-Host "Size: $sizeMB MB"

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host "DONE"
