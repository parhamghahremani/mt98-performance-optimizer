$source = 'D:\Desktop\project\scripts\mt98-performance-optimizer'
$dest = 'D:\Desktop\project\scripts\mt98-performance-optimizer\backups\full-snapshots\mt98-performance-optimizer-20261117-initial-v2.0.2.zip'
$excludePatterns = @('backups\*', 'node_modules\*', 'dist\*', 'versions\*', 'test-results\*', 'playwright-report\*', '.git\*', '*.log', '.env*')

$files = Get-ChildItem -Path $source -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($source.Length + 1)
    $excluded = $false
    foreach ($pattern in $excludePatterns) {
        if ($rel -like $pattern) {
            $excluded = $true
            break
        }
    }
    -not $excluded
}

$files | Compress-Archive -DestinationPath $dest -Force
Write-Host "Created: $dest"
Write-Host "Files: $($files.Count)"