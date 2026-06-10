$ErrorActionPreference = "Stop"
$projectDir = "D:\shriyansh stock\travell app project"
$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmm'

# --- Frontend Dist ZIP ---
$frontendDistSrc = Join-Path $projectDir "GetHotel-Vite\dist"
$frontendZip = Join-Path $projectDir "GetHotel_Frontend_$timestamp.zip"

Write-Host "Creating Frontend dist ZIP..."
if (Test-Path $frontendZip) { Remove-Item $frontendZip -Force }
tar.exe -a -c -f $frontendZip -C $frontendDistSrc .
$fSize = [math]::Round((Get-Item $frontendZip).Length / 1MB, 2)
Write-Host "Frontend ZIP created: $frontendZip ($fSize MB)"

# --- Backend ZIP (exclude node_modules, tmp, .git) ---
$backendSrc = Join-Path $projectDir "GetHotel backend"
$backendZip = Join-Path $projectDir "GetHotel_Backend_$timestamp.zip"
$tempBackend = Join-Path $projectDir "deploy_backend_temp"

Write-Host "Preparing Backend files (excluding node_modules, tmp, .git)..."
if (Test-Path $tempBackend) { Remove-Item $tempBackend -Recurse -Force }
New-Item -ItemType Directory -Path $tempBackend -Force | Out-Null

# Copy backend excluding heavy folders
$excludeDirs = @("node_modules", "tmp", ".git", "logs")
Get-ChildItem -Path $backendSrc | Where-Object {
    $excludeDirs -notcontains $_.Name
} | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName -Destination (Join-Path $tempBackend $_.Name) -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Copy-Item $_.FullName -Destination (Join-Path $tempBackend $_.Name) -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Creating Backend ZIP..."
if (Test-Path $backendZip) { Remove-Item $backendZip -Force }
tar.exe -a -c -f $backendZip -C $tempBackend .
$bSize = [math]::Round((Get-Item $backendZip).Length / 1MB, 2)
Write-Host "Backend ZIP created: $backendZip ($bSize MB)"

# Cleanup
Remove-Item $tempBackend -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "===== DONE ====="
Write-Host "Frontend: $frontendZip ($fSize MB)"
Write-Host "Backend:  $backendZip ($bSize MB)"
