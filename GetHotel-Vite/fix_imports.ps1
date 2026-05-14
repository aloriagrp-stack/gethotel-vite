$srcPath = "src"

Get-ChildItem -Path $srcPath -Include *.tsx,*.ts -Recurse | ForEach-Object {
    $filePath = $_.FullName
    $content = [System.IO.File]::ReadAllLines($filePath)
    $newContent = @()
    $foundImports = @{}
    
    foreach ($line in $content) {
        if ($line -match 'import .* from ["'']react-router-dom["'']') {
            # Normalize and check for duplicates
            # This is a bit simplified but should work for the duplicates I added
            $normalized = $line.Trim()
            if ($foundImports.ContainsKey($normalized)) {
                continue
            }
            $foundImports[$normalized] = $true
        }
        $newContent += $line
    }
    
    [System.IO.File]::WriteAllLines($filePath, $newContent)
}
