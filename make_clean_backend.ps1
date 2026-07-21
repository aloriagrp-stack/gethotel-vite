$projectDir = "D:\shriyansh stock\travell app project"
$backendSrc = Join-Path $projectDir "GetHotel backend"
$tempDir = Join-Path $projectDir "deploy_backend_temp"
$zipPath = Join-Path $projectDir "GetHotel_Backend_CLEAN.zip"

# Cleanup
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Exclude heavy folders and files
$excludeNames = @("node_modules", "node_modules.zip", "tmp", ".git", "logs", "uploads")

Get-ChildItem -Path $backendSrc | Where-Object {
    $excludeNames -notcontains $_.Name
} | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Creating clean Backend ZIP..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1KB, 2)
Write-Host "Backend ZIP: $zipPath"
Write-Host "Size: $sizeMB KB"

Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "DONE"
