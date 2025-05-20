# Kubernetes ile test çalıştırma scripti
param (
    [string]$Namespace = "default",
    [string]$DockerRegistry = "localhost:5000",
    [string]$ImageTag = "latest",
    [switch]$BuildImage = $false,
    [switch]$PushImage = $false,
    [switch]$Scheduled = $false
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
Write-Green "ALT_LAS Chat Arayüzü Kubernetes Test Çalıştırıcı"
Write-Green "====================================="
Write-Yellow "Namespace: $Namespace"
Write-Yellow "Docker Registry: $DockerRegistry"
Write-Yellow "Image Tag: $ImageTag"
Write-Yellow "Image Oluştur: $BuildImage"
Write-Yellow "Image Push: $PushImage"
Write-Yellow "Zamanlanmış: $Scheduled"
Write-Green "====================================="

# Çalışma dizinini kontrol et
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Cyan "Çalışma dizini: $projectRoot"

# Docker image adı
$imageName = "$DockerRegistry/chat-arayuzu-test:$ImageTag"

# Eğer image oluşturulacaksa
if ($BuildImage) {
    Write-Cyan "Docker image oluşturuluyor: $imageName"
    docker build -t $imageName -f Dockerfile.test .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Red "Docker image oluşturma başarısız oldu!"
        exit 1
    }
    
    # Eğer image push edilecekse
    if ($PushImage) {
        Write-Cyan "Docker image push ediliyor: $imageName"
        docker push $imageName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Red "Docker image push başarısız oldu!"
            exit 1
        }
    }
}

# Kubernetes YAML dosyasını belirle
$k8sFile = "kubernetes/test-job.yaml"
if ($Scheduled) {
    $k8sFile = "kubernetes/test-cronjob.yaml"
}

# Kubernetes YAML dosyasını oku ve değişkenleri değiştir
$k8sYaml = Get-Content $k8sFile -Raw
$k8sYaml = $k8sYaml.Replace('${DOCKER_REGISTRY}', $DockerRegistry).Replace('${IMAGE_TAG}', $ImageTag)

# Geçici YAML dosyası oluştur
$tempFile = [System.IO.Path]::GetTempFileName()
$k8sYaml | Out-File $tempFile -Encoding utf8

# Kubernetes job'ı oluştur
Write-Cyan "Kubernetes job oluşturuluyor..."
kubectl apply -f $tempFile -n $Namespace

if ($LASTEXITCODE -ne 0) {
    Write-Red "Kubernetes job oluşturma başarısız oldu!"
    Remove-Item $tempFile
    exit 1
}

# Geçici dosyayı sil
Remove-Item $tempFile

# Eğer zamanlanmış job değilse, job'ın tamamlanmasını bekle
if (-not $Scheduled) {
    $jobName = "chat-arayuzu-test"
    
    Write-Cyan "Job tamamlanana kadar bekleniyor: $jobName"
    kubectl wait --for=condition=complete job/$jobName -n $Namespace --timeout=300s
    
    # Job başarılı mı kontrol et
    if ($LASTEXITCODE -ne 0) {
        Write-Red "Job başarısız oldu veya zaman aşımına uğradı!"
        
        # Job loglarını göster
        Write-Cyan "Job logları:"
        kubectl logs job/$jobName -n $Namespace
        
        # Job'ı temizle
        kubectl delete job $jobName -n $Namespace
        
        exit 1
    }
    
    # Job loglarını göster
    Write-Cyan "Job logları:"
    kubectl logs job/$jobName -n $Namespace
    
    # Job'ı temizle
    kubectl delete job $jobName -n $Namespace
    
    Write-Green "Testler başarıyla tamamlandı!"
} else {
    Write-Green "Zamanlanmış test job'ı başarıyla oluşturuldu!"
}

exit 0
