$backendDir = "D:\shriyansh stock\travell app project\GetHotel backend"

# Check size of each top-level item
Get-ChildItem $backendDir | ForEach-Object {
    if ($_.PSIsContainer) {
        $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $mb = [math]::Round($size / 1MB, 2)
        Write-Host "$($_.Name) (folder): $mb MB"
    } else {
        $mb = [math]::Round($_.Length / 1MB, 2)
        Write-Host "$($_.Name) (file): $mb MB"
    }
}
