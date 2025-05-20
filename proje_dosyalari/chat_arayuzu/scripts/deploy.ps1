# ALT_LAS Chat Botu Dağıtım Betiği (PowerShell)
# Bu betik, ALT_LAS Chat Botu'nu belirtilen ortama dağıtır.

# Fonksiyonlar
function Print-Header {
    param([string]$text)
    Write-Host "`n=== $text ===`n" -ForegroundColor Blue
}

function Print-Success {
    param([string]$text)
    Write-Host "✓ $text" -ForegroundColor Green
}

function Print-Error {
    param([string]$text)
    Write-Host "✗ $text" -ForegroundColor Red
}

function Print-Warning {
    param([string]$text)
    Write-Host "! $text" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$text)
    Write-Host "i $text" -ForegroundColor Blue
}

# Kullanım bilgisi
function Show-Usage {
    Write-Host "Kullanım: .\deploy.ps1 [seçenekler]"
    Write-Host ""
    Write-Host "Seçenekler:"
    Write-Host "  -Environment <ortam>   Dağıtım ortamı (development, test, production) (varsayılan: production)"
    Write-Host "  -Tag <etiket>          Docker imaj etiketi (varsayılan: latest)"
    Write-Host "  -Build                 İmajları yeniden oluştur"
    Write-Host "  -Pull                  İmajları çek"
    Write-Host "  -Clean                 Dağıtımdan önce konteynerleri temizle"
    Write-Host "  -Help                  Bu yardım mesajını göster"
    exit 1
}

# Parametreler
param(
    [string]$Environment = "production",
    [string]$Tag = "latest",
    [switch]$Build = $false,
    [switch]$Pull = $false,
    [switch]$Clean = $false,
    [switch]$Help = $false
)

# Yardım göster
if ($Help) {
    Show-Usage
}

# Ortam doğrulama
if ($Environment -ne "development" -and $Environment -ne "test" -and $Environment -ne "production") {
    Print-Error "Geçersiz ortam: $Environment. Geçerli değerler: development, test, production"
    exit 1
}

# Başlık
Print-Header "ALT_LAS Chat Botu Dağıtımı"
Print-Info "Ortam: $Environment"
Print-Info "Etiket: $Tag"

# Proje dizinine git
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath
Set-Location $projectPath
Print-Info "Çalışma dizini: $(Get-Location)"

# Ortam değişkenlerini ayarla
$env:ENVIRONMENT = $Environment
$env:TAG = $Tag

# Temizleme
if ($Clean) {
    Print-Header "Konteynerleri Temizleme"
    docker-compose down -v
    Print-Success "Konteynerler temizlendi"
}

# İmajları çek
if ($Pull) {
    Print-Header "İmajları Çekme"
    docker-compose pull
    Print-Success "İmajlar çekildi"
}

# İmajları oluştur
if ($Build) {
    Print-Header "İmajları Oluşturma"
    docker-compose build --no-cache
    Print-Success "İmajlar oluşturuldu"
}

# Dağıtım
Print-Header "Dağıtım Başlatılıyor"
docker-compose up -d

# Durum kontrolü
Print-Header "Konteyner Durumu"
docker-compose ps

Print-Success "ALT_LAS Chat Botu başarıyla dağıtıldı!"
Print-Info "Frontend: http://localhost:$($env:FRONTEND_PORT ?? 80)"
Print-Info "API: http://localhost:$($env:API_PORT ?? 3000)"
Print-Info "AI Servisi: http://localhost:$($env:AI_PORT ?? 5000)"

exit 0
