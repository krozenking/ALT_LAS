# CI/CD Pipeline Yapılandırması Raporu

**Tarih:** 10 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - CI/CD Pipeline Yapılandırması

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan CI/CD pipeline yapılandırması hakkında bilgi vermektedir. Rapor, GitHub Actions workflow yapılandırması, dağıtım betikleri ve CI/CD süreçleri hakkında detayları içermektedir.

## 2. GitHub Actions Workflow Yapılandırması

ALT_LAS projesi için oluşturulan GitHub Actions workflow yapılandırması (`.github/workflows/ci-cd.yaml`), aşağıdaki aşamaları içermektedir:

```yaml
name: ALT_LAS CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, segmentation-service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Build ${{ matrix.service }} image
      uses: docker/build-push-action@v4
      with:
        context: ./${{ matrix.service }}
        push: false
        load: true
        tags: alt-las/${{ matrix.service }}:test
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Run tests for ${{ matrix.service }}
      run: |
        if [ "${{ matrix.service }}" == "api-gateway" ]; then
          cd api-gateway
          npm install
          npm test
        elif [ "${{ matrix.service }}" == "segmentation-service" ]; then
          cd segmentation-service
          pip install -r requirements.txt
          pytest
        fi
  
  build-and-push:
    needs: build-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [api-gateway, segmentation-service]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to GitHub Container Registry
      uses: docker/login-action@v2
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Build and push ${{ matrix.service }} image
      uses: docker/build-push-action@v4
      with:
        context: ./${{ matrix.service }}
        push: true
        tags: |
          ghcr.io/${{ github.repository_owner }}/alt-las-${{ matrix.service }}:latest
          ghcr.io/${{ github.repository_owner }}/alt-las-${{ matrix.service }}:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
  
  deploy:
    needs: build-and-push
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
    
    - name: Set up kubeconfig
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBE_CONFIG }}" > $HOME/.kube/config
        chmod 600 $HOME/.kube/config
    
    - name: Update image tags in Kubernetes manifests
      run: |
        for service in api-gateway segmentation-service; do
          sed -i "s|alt-las/${service}:latest|ghcr.io/${{ github.repository_owner }}/alt-las-${service}:${{ github.sha }}|g" kubernetes-manifests/${service}/deployment.yaml
        done
    
    - name: Deploy to Kubernetes
      run: |
        kubectl apply -f kubernetes-manifests/infrastructure/
        kubectl apply -f kubernetes-manifests/api-gateway/
        kubectl apply -f kubernetes-manifests/segmentation-service/
        kubectl apply -f kubernetes-manifests/ingress.yaml
    
    - name: Verify deployment
      run: |
        kubectl rollout status deployment/api-gateway
        kubectl rollout status deployment/segmentation-service
```

## 3. CI/CD Pipeline Aşamaları

### 3.1. Build ve Test Aşaması

Bu aşamada, her servis için Docker image'ları oluşturulur ve testler çalıştırılır:

1. Docker Buildx kurulumu
2. Servis image'ının oluşturulması
3. Servis testlerinin çalıştırılması

Şu anda, yalnızca aşağıdaki servisler için test yapılandırması bulunmaktadır:
- API Gateway
- Segmentation Service

### 3.2. Build ve Push Aşaması

Bu aşama, yalnızca `main` branch'ine push yapıldığında çalışır ve her servis için Docker image'larını oluşturup GitHub Container Registry'ye gönderir:

1. Docker Buildx kurulumu
2. GitHub Container Registry'ye giriş
3. Servis image'ının oluşturulması ve gönderilmesi

Her servis için iki tag oluşturulur:
- `latest`: En son sürüm
- `<commit-sha>`: Belirli bir commit'e ait sürüm

### 3.3. Dağıtım Aşaması

Bu aşama, yalnızca `main` branch'ine push yapıldığında çalışır ve servisleri Kubernetes kümesine dağıtır:

1. kubectl kurulumu
2. kubeconfig yapılandırması
3. Kubernetes manifest dosyalarında image tag'lerinin güncellenmesi
4. Kubernetes kaynaklarının uygulanması
5. Dağıtımın doğrulanması

## 4. Dağıtım Betikleri

ALT_LAS projesi için oluşturulan dağıtım betik dosyası (`deploy.ps1`), aşağıdaki adımları içermektedir:

1. Kubernetes kümesi bağlantısının kontrol edilmesi
2. Namespace'in oluşturulması (eğer yoksa)
3. Altyapı bileşenlerinin uygulanması
4. Altyapı bileşenlerinin hazır olmasının beklenmesi
5. Servis bileşenlerinin uygulanması
6. İzleme bileşenlerinin uygulanması
7. Ingress'in uygulanması
8. Servislerin hazır olmasının beklenmesi
9. Dağıtım durumunun gösterilmesi

## 5. Gerekli Sırlar (Secrets)

CI/CD pipeline'ının çalışması için aşağıdaki sırların GitHub repository'sine eklenmesi gerekmektedir:

1. `KUBE_CONFIG`: Kubernetes kümesine erişim için kubeconfig dosyası

## 6. Eksiklikler ve Sonraki Adımlar

### 6.1. Eksiklikler

1. **Runner Service, Archive Service ve AI Orchestrator için CI/CD Yapılandırması**: Bu servisler için CI/CD yapılandırması henüz oluşturulmadı.

2. **Test Kapsamı**: Mevcut test yapılandırması temel seviyede olup, kapsamlı test senaryoları içermiyor.

3. **Güvenlik Taraması**: Docker image'ları ve Kubernetes kaynakları için güvenlik taraması yapılandırması bulunmuyor.

4. **Canary Dağıtım**: Canary dağıtım stratejisi henüz uygulanmadı.

5. **Rollback Stratejisi**: Dağıtım başarısız olduğunda otomatik rollback stratejisi henüz uygulanmadı.

### 6.2. Sonraki Adımlar

1. **Eksik Servisler için CI/CD Yapılandırması**: Runner Service, Archive Service ve AI Orchestrator için CI/CD yapılandırmasının oluşturulması.

2. **Test Kapsamının Genişletilmesi**: Daha kapsamlı test senaryolarının eklenmesi ve test kapsamının artırılması.

3. **Güvenlik Taraması Eklenmesi**: Docker image'ları ve Kubernetes kaynakları için güvenlik taraması yapılandırmasının eklenmesi.

4. **Canary Dağıtım Stratejisinin Uygulanması**: Canary dağıtım stratejisinin uygulanması.

5. **Rollback Stratejisinin Uygulanması**: Dağıtım başarısız olduğunda otomatik rollback stratejisinin uygulanması.

6. **Dağıtım Onayı**: Dağıtım öncesi manuel onay adımının eklenmesi.

7. **Metrik Toplama**: CI/CD pipeline metrikleri toplama ve raporlama mekanizmasının eklenmesi.

## 7. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli CI/CD pipeline yapılandırması temel seviyede tamamlandı. Eksiklikler ve sonraki adımlar belirlendi. Backend Geliştirici (Ahmet Çelik) ve diğer ekip üyeleri ile koordineli çalışarak, eksik servislerin CI/CD yapılandırmasının oluşturulması ve diğer eksikliklerin giderilmesi planlanmaktadır.
