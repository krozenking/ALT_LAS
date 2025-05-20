# Test çalıştırma scripti
param (
    [string]$TestType = "all",
    [switch]$Watch = $false,
    [switch]$Coverage = $false,
    [string]$TestFile = ""
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
Write-Green "ALT_LAS Chat Arayüzü Test Çalıştırıcı"
Write-Green "====================================="
Write-Yellow "Test Tipi: $TestType"
Write-Yellow "İzleme Modu: $Watch"
Write-Yellow "Kapsam Raporu: $Coverage"
if ($TestFile) {
    Write-Yellow "Test Dosyası: $TestFile"
}
Write-Green "====================================="

# Çalışma dizinini kontrol et
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Cyan "Çalışma dizini: $projectRoot"

# Birim testlerini çalıştır
function Run-UnitTests {
    Write-Cyan "`nBirim testleri çalıştırılıyor..."
    
    $vitestCommand = "npx vitest run"
    
    if ($Watch) {
        $vitestCommand = "npx vitest"
    }
    
    if ($Coverage) {
        $vitestCommand += " --coverage"
    }
    
    if ($TestFile) {
        $vitestCommand += " $TestFile"
    }
    
    Write-Yellow "Komut: $vitestCommand"
    Invoke-Expression $vitestCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Red "Birim testleri başarısız oldu!"
        return $false
    } else {
        Write-Green "Birim testleri başarıyla tamamlandı!"
        return $true
    }
}

# E2E testlerini çalıştır
function Run-E2ETests {
    Write-Cyan "`nE2E testleri çalıştırılıyor..."
    
    $cypressCommand = "npx cypress run"
    
    if ($Watch) {
        $cypressCommand = "npx cypress open"
    }
    
    if ($TestFile) {
        $cypressCommand += " --spec `"$TestFile`""
    }
    
    Write-Yellow "Komut: $cypressCommand"
    Invoke-Expression $cypressCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Red "E2E testleri başarısız oldu!"
        return $false
    } else {
        Write-Green "E2E testleri başarıyla tamamlandı!"
        return $true
    }
}

# Statik analiz çalıştır
function Run-StaticAnalysis {
    Write-Cyan "`nStatik analiz çalıştırılıyor..."
    
    # ESLint
    Write-Yellow "ESLint çalıştırılıyor..."
    npx eslint --ext .ts,.tsx src
    $eslintResult = $LASTEXITCODE
    
    # TypeScript
    Write-Yellow "TypeScript tip kontrolü çalıştırılıyor..."
    npx tsc --noEmit
    $tscResult = $LASTEXITCODE
    
    if ($eslintResult -ne 0 -or $tscResult -ne 0) {
        Write-Red "Statik analiz başarısız oldu!"
        return $false
    } else {
        Write-Green "Statik analiz başarıyla tamamlandı!"
        return $true
    }
}

# Testleri çalıştır
$success = $true

switch ($TestType) {
    "unit" {
        $success = Run-UnitTests
    }
    "e2e" {
        $success = Run-E2ETests
    }
    "static" {
        $success = Run-StaticAnalysis
    }
    "all" {
        $unitSuccess = Run-UnitTests
        $e2eSuccess = Run-E2ETests
        $staticSuccess = Run-StaticAnalysis
        $success = $unitSuccess -and $e2eSuccess -and $staticSuccess
    }
    default {
        Write-Red "Geçersiz test tipi: $TestType"
        Write-Yellow "Geçerli tipler: unit, e2e, static, all"
        exit 1
    }
}

# Sonuç
Write-Green "`n====================================="
if ($success) {
    Write-Green "Tüm testler başarıyla tamamlandı!"
    exit 0
} else {
    Write-Red "Bazı testler başarısız oldu!"
    exit 1
}
