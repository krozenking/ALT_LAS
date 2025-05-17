Start-Process powershell -Verb RunAs -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Running as Administrator'; npx tailwindcss init -p; Read-Host 'Press Enter to continue'"
