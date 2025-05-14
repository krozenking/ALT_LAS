# ALT_LAS Entegrasyon Testleri Çalıştırma Scripti

# Gerekli ortam değişkenlerini ayarla
$env:API_GATEWAY_URL = "http://localhost:3000"
$env:TEST_USERNAME = "test@example.com"
$env:TEST_PASSWORD = "password123"

Write-Host "ALT_LAS Entegrasyon Testleri Başlatılıyor..." -ForegroundColor Cyan

# Docker Compose ile servisleri başlat
Write-Host "Docker Compose ile servisleri başlatma..." -ForegroundColor Yellow
docker-compose up -d

# Servislerin başlaması için bekle
Write-Host "Servislerin başlaması bekleniyor (30 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Entegrasyon testlerini çalıştır
Write-Host "Entegrasyon testleri çalıştırılıyor..." -ForegroundColor Yellow
Set-Location -Path "integration"
npm install
npm test

# Test sonucunu kaydet
$testResult = $LASTEXITCODE

# Docker Compose ile servisleri durdur
Write-Host "Docker Compose ile servisleri durdurma..." -ForegroundColor Yellow
Set-Location -Path "../.."
docker-compose down

# Test sonucuna göre çıkış
if ($testResult -eq 0) {
    Write-Host "Entegrasyon testleri başarıyla tamamlandı!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Entegrasyon testleri başarısız oldu!" -ForegroundColor Red
    exit 1
}
