# Docker ile test çalıştırma scripti
param (
    [string]$TestType = "all",
    [switch]$Watch = $false,
    [switch]$BuildImage = $false
)

# Renkli çıktı için fonksiyonlar
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Green($Message) {
    Write-ColorOutput Green $Message
}

function Write-Yellow($Message) {
    Write-ColorOutput Yellow $Message
}

function Write-Red($Message) {
    Write-ColorOutput Red $Message
}

function Write-Cyan($Message) {
    Write-ColorOutput Cyan $Message
}

# Başlık göster
Write-Green "====================================="
Write-Green "ALT_LAS Chat Arayüzü Docker Test Çalıştırıcı"
Write-Green "====================================="
Write-Yellow "Test Tipi: $TestType"
Write-Yellow "İzleme Modu: $Watch"
Write-Yellow "Image Oluştur: $BuildImage"
Write-Green "====================================="

# Çalışma dizinini kontrol et
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Cyan "Çalışma dizini: $projectRoot"

# Docker Compose servisini belirle
$service = "test"
if ($Watch) {
    $service = "test-watch"
}
elseif ($TestType -eq "e2e") {
    $service = "test-e2e"
}
elseif ($TestType -eq "static") {
    $service = "test-static"
}

# Docker Compose komutu oluştur
$dockerComposeCommand = "docker-compose -f docker-compose.test.yml"

# Eğer image oluşturulacaksa
if ($BuildImage) {
    Write-Cyan "Docker image oluşturuluyor..."
    Invoke-Expression "$dockerComposeCommand build $service"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Red "Docker image oluşturma başarısız oldu!"
        exit 1
    }
}

# Testleri çalıştır
Write-Cyan "Docker ile testler çalıştırılıyor..."
Invoke-Expression "$dockerComposeCommand run --rm $service"

# Sonuç
if ($LASTEXITCODE -ne 0) {
    Write-Red "Testler başarısız oldu!"
    exit 1
} else {
    Write-Green "Testler başarıyla tamamlandı!"
    exit 0
}
