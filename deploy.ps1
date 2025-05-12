# ALT_LAS Kubernetes Deployment Script

Write-Host "ALT_LAS Kubernetes Deployment Script" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Green

# Kubernetes kümesine bağlantıyı kontrol et
Write-Host "Kubernetes kümesi bağlantısı kontrol ediliyor..." -ForegroundColor Yellow
kubectl cluster-info
if ($LASTEXITCODE -ne 0) {
    Write-Host "Kubernetes kümesine bağlanılamadı. Lütfen kümenin çalıştığından emin olun." -ForegroundColor Red
    exit 1
}

# Namespace oluştur (eğer yoksa)
Write-Host "Namespace kontrol ediliyor..." -ForegroundColor Yellow
$namespaceExists = kubectl get namespace alt-las 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "alt-las namespace'i oluşturuluyor..." -ForegroundColor Yellow
    kubectl create namespace alt-las
} else {
    Write-Host "alt-las namespace'i zaten mevcut." -ForegroundColor Green
}

# Altyapı bileşenlerini uygula
Write-Host "Altyapı bileşenleri uygulanıyor..." -ForegroundColor Yellow
kubectl apply -f kubernetes-manifests/infrastructure/ -n alt-las
if ($LASTEXITCODE -ne 0) {
    Write-Host "Altyapı bileşenleri uygulanırken hata oluştu." -ForegroundColor Red
    exit 1
}

# Altyapı bileşenlerinin hazır olmasını bekle
Write-Host "Altyapı bileşenlerinin hazır olması bekleniyor..." -ForegroundColor Yellow
kubectl rollout status deployment/postgres-db -n alt-las --timeout=120s
kubectl rollout status deployment/redis -n alt-las --timeout=60s
kubectl rollout status deployment/nats -n alt-las --timeout=60s

# Servis bileşenlerini uygula
Write-Host "Servis bileşenleri uygulanıyor..." -ForegroundColor Yellow
kubectl apply -f kubernetes-manifests/api-gateway/ -n alt-las
kubectl apply -f kubernetes-manifests/segmentation-service/ -n alt-las
if ($LASTEXITCODE -ne 0) {
    Write-Host "Servis bileşenleri uygulanırken hata oluştu." -ForegroundColor Red
    exit 1
}

# İzleme bileşenlerini uygula
Write-Host "İzleme bileşenleri uygulanıyor..." -ForegroundColor Yellow
kubectl apply -f kubernetes-manifests/monitoring/ -n alt-las
if ($LASTEXITCODE -ne 0) {
    Write-Host "İzleme bileşenleri uygulanırken hata oluştu." -ForegroundColor Red
    exit 1
}

# Ingress'i uygula
Write-Host "Ingress uygulanıyor..." -ForegroundColor Yellow
kubectl apply -f kubernetes-manifests/ingress.yaml -n alt-las
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ingress uygulanırken hata oluştu." -ForegroundColor Red
    exit 1
}

# Servislerin hazır olmasını bekle
Write-Host "Servislerin hazır olması bekleniyor..." -ForegroundColor Yellow
kubectl rollout status deployment/api-gateway -n alt-las --timeout=120s
kubectl rollout status deployment/segmentation-service -n alt-las --timeout=120s

# Dağıtım durumunu göster
Write-Host "Dağıtım tamamlandı. Servis durumları:" -ForegroundColor Green
kubectl get pods -n alt-las
kubectl get services -n alt-las
kubectl get ingress -n alt-las

Write-Host "ALT_LAS başarıyla dağıtıldı!" -ForegroundColor Green
Write-Host "API Gateway'e erişmek için: http://alt-las.local/api" -ForegroundColor Cyan
Write-Host "Grafana'ya erişmek için: http://alt-las.local/grafana (kullanıcı adı: admin, şifre: admin)" -ForegroundColor Cyan
