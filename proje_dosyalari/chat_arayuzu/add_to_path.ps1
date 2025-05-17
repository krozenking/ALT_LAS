$npmPath = "C:\Users\ozy\AppData\Roaming\npm"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

if (-not $currentPath.Contains($npmPath)) {
    $newPath = "$currentPath;$npmPath"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "Added $npmPath to PATH"
} else {
    Write-Host "$npmPath is already in PATH"
}

# Yeni bir PowerShell oturumu başlatarak PATH değişikliğini test et
Start-Process powershell -ArgumentList "-Command cd '$PWD'; Write-Host 'PATH updated. Trying npx...'; npx tailwindcss init -p; Read-Host 'Press Enter to continue'"
