# CI/CD Entegrasyon Planı

## 1. Giriş

Bu belge, ALT_LAS Chat Arayüzü projesi için CI/CD (Sürekli Entegrasyon/Sürekli Dağıtım) entegrasyon planını tanımlar. Bu plan, test otomasyonunun CI/CD süreçlerine entegrasyonunu, otomatik derleme, test ve dağıtım süreçlerini içerir.

## 2. Hedefler

- Test otomasyonunun CI/CD süreçlerine entegrasyonu
- Her commit için otomatik birim testleri ve lint kontrolleri
- Pull request'ler için otomatik entegrasyon ve E2E testleri
- Otomatik derleme ve dağıtım süreçleri
- Test sonuçlarının merkezi bir dashboard'da görüntülenmesi
- Kod kalitesi ve test kapsamı raporları

## 3. CI/CD Araçları

### 3.1. GitHub Actions

GitHub Actions, GitHub üzerinde barındırılan projeler için CI/CD süreçlerini otomatikleştiren bir araçtır. GitHub Actions, GitHub'ın kendi altyapısında çalışır ve GitHub ile tam entegrasyon sağlar.

**Avantajlar:**
- GitHub ile tam entegrasyon
- Kolay yapılandırma (YAML dosyaları)
- Geniş marketplace ve hazır eylemler
- Ücretsiz kullanım (belirli sınırlar dahilinde)

**Dezavantajlar:**
- GitHub'a bağımlılık
- Karmaşık iş akışları için sınırlı esneklik
- Özelleştirme için daha fazla çaba gerektirebilir

### 3.2. Jenkins

Jenkins, açık kaynaklı bir CI/CD aracıdır. Jenkins, kendi sunucunuzda veya bulutta çalıştırılabilir ve geniş bir eklenti ekosistemi sunar.

**Avantajlar:**
- Yüksek özelleştirilebilirlik
- Geniş eklenti ekosistemi
- Dağıtık yapı desteği
- Platform bağımsızlık

**Dezavantajlar:**
- Kurulum ve bakım için daha fazla çaba gerektirir
- Kullanıcı arayüzü daha az modern
- Yapılandırma daha karmaşık olabilir

### 3.3. Seçilen Araç: GitHub Actions

ALT_LAS Chat Arayüzü projesi için GitHub Actions'ı seçiyoruz. Bu seçimin nedenleri:

1. Proje zaten GitHub'da barındırılıyor
2. Yapılandırması daha kolay
3. GitHub ile tam entegrasyon sağlıyor
4. Ekip üyeleri GitHub ile daha aşina

## 4. CI/CD İş Akışları

### 4.1. Sürekli Entegrasyon (CI) İş Akışı

**Tetikleyiciler:**
- Her commit (main ve feature dalları)
- Pull request'ler

**Adımlar:**
1. Kod kontrolü
2. Bağımlılıkların yüklenmesi
3. Lint kontrolleri
4. Birim testleri
5. Kod kapsamı raporu
6. Statik kod analizi
7. Derleme

**Yapılandırma Dosyası:** `.github/workflows/ci.yml`

```yaml
name: Continuous Integration

on:
  push:
    branches: [ main, feature/* ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Lint
      run: npm run lint
    
    - name: Unit tests
      run: npm run test:unit
    
    - name: Build
      run: npm run build
    
    - name: Upload code coverage
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
        directory: ./coverage/
        fail_ci_if_error: true
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build
        path: dist/
```

### 4.2. Entegrasyon Testleri İş Akışı

**Tetikleyiciler:**
- Pull request'ler
- Manuel tetikleme

**Adımlar:**
1. Kod kontrolü
2. Bağımlılıkların yüklenmesi
3. Entegrasyon testleri
4. E2E testleri
5. Test sonuçları raporu

**Yapılandırma Dosyası:** `.github/workflows/integration-tests.yml`

```yaml
name: Integration Tests

on:
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Integration tests
      run: npm run test:integration
    
    - name: E2E tests
      uses: cypress-io/github-action@v5
      with:
        build: npm run build
        start: npm run serve
        wait-on: 'http://localhost:3000'
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          cypress/videos/
          cypress/screenshots/
```

### 4.3. Sürekli Dağıtım (CD) İş Akışı

**Tetikleyiciler:**
- Main dalına merge
- Manuel tetikleme (staging ve production için)

**Adımlar:**
1. Kod kontrolü
2. Bağımlılıkların yüklenmesi
3. Derleme
4. Docker imajı oluşturma
5. Docker imajını kaydetme
6. Kubernetes'e dağıtım

**Yapılandırma Dosyası:** `.github/workflows/cd.yml`

```yaml
name: Continuous Deployment

on:
  push:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy to'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to Docker Hub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKER_HUB_USERNAME }}
        password: ${{ secrets.DOCKER_HUB_TOKEN }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ secrets.DOCKER_HUB_USERNAME }}/alt-las-chat:${{ github.sha }}
    
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
    
    - name: Set Kubernetes context
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy to Kubernetes
      run: |
        envsubst < kubernetes/deployment.yaml | kubectl apply -f -
        kubectl rollout status deployment/alt-las-chat
      env:
        IMAGE_TAG: ${{ github.sha }}
        ENVIRONMENT: ${{ github.event.inputs.environment || 'staging' }}
```

## 5. Test Raporlama

### 5.1. Kod Kapsamı Raporları

Kod kapsamı raporları, Codecov veya GitHub Pages üzerinde yayınlanacaktır. Bu raporlar, birim testleri ve entegrasyon testleri için kod kapsamını gösterecektir.

**Yapılandırma:**
- Codecov entegrasyonu
- GitHub Pages üzerinde HTML raporlar

### 5.2. Test Sonuçları Raporları

Test sonuçları raporları, GitHub Actions üzerinde görüntülenecek ve ayrıca bir dashboard üzerinde yayınlanacaktır. Bu raporlar, test başarı oranını, hata sayısını ve test süresini gösterecektir.

**Yapılandırma:**
- GitHub Actions test özetleri
- Test sonuçları dashboard'u (Allure veya TestQuality)

## 6. Güvenlik Kontrolleri

### 6.1. Bağımlılık Güvenlik Taramaları

Bağımlılık güvenlik taramaları, GitHub Dependabot veya Snyk ile yapılacaktır. Bu taramalar, bağımlılıklardaki güvenlik açıklarını tespit edecek ve otomatik olarak pull request'ler oluşturacaktır.

**Yapılandırma:**
- GitHub Dependabot yapılandırması
- Snyk entegrasyonu

### 6.2. Statik Uygulama Güvenlik Testi (SAST)

Statik uygulama güvenlik testleri, SonarQube veya CodeQL ile yapılacaktır. Bu testler, kod içindeki güvenlik açıklarını tespit edecektir.

**Yapılandırma:**
- SonarQube entegrasyonu
- GitHub CodeQL yapılandırması

## 7. Ortamlar

### 7.1. Geliştirme Ortamı

Geliştirme ortamı, geliştiricilerin yerel makinelerinde çalışır. Bu ortam, geliştirme sırasında kullanılır ve CI/CD süreçlerine dahil değildir.

### 7.2. Test Ortamı

Test ortamı, CI/CD süreçleri tarafından otomatik olarak oluşturulur ve her pull request için kullanılır. Bu ortam, entegrasyon ve E2E testleri için kullanılır.

**Yapılandırma:**
- Docker container'ları
- Kubernetes namespace'i: `alt-las-test`

### 7.3. Staging Ortamı

Staging ortamı, main dalına merge edilen değişiklikler için otomatik olarak güncellenir. Bu ortam, kullanıcı kabul testleri ve performans testleri için kullanılır.

**Yapılandırma:**
- Kubernetes namespace'i: `alt-las-staging`
- Otomatik dağıtım

### 7.4. Üretim Ortamı

Üretim ortamı, manuel onay sonrası güncellenir. Bu ortam, son kullanıcılar tarafından kullanılır.

**Yapılandırma:**
- Kubernetes namespace'i: `alt-las-production`
- Manuel dağıtım onayı

## 8. Uygulama Planı

### 8.1. Aşama 1: CI İş Akışı Kurulumu

**Görevler:**
- CI iş akışı yapılandırma dosyasının oluşturulması
- Birim testleri ve lint kontrollerinin entegrasyonu
- Kod kapsamı raporlarının yapılandırılması

**Tahmini Süre:** 1 gün

### 8.2. Aşama 2: Entegrasyon Testleri İş Akışı Kurulumu

**Görevler:**
- Entegrasyon testleri iş akışı yapılandırma dosyasının oluşturulması
- E2E testlerinin entegrasyonu
- Test sonuçları raporlarının yapılandırılması

**Tahmini Süre:** 1 gün

### 8.3. Aşama 3: CD İş Akışı Kurulumu

**Görevler:**
- CD iş akışı yapılandırma dosyasının oluşturulması
- Docker imajı oluşturma ve kaydetme
- Kubernetes'e dağıtım

**Tahmini Süre:** 1 gün

### 8.4. Aşama 4: Güvenlik Kontrolleri Kurulumu

**Görevler:**
- Bağımlılık güvenlik taramalarının yapılandırılması
- Statik uygulama güvenlik testlerinin yapılandırılması

**Tahmini Süre:** 1 gün

## 9. Sonuç

Bu CI/CD entegrasyon planı, ALT_LAS Chat Arayüzü projesi için otomatik derleme, test ve dağıtım süreçlerini tanımlar. Bu plan, test otomasyonunun CI/CD süreçlerine entegrasyonunu sağlayarak, yazılım kalitesini artıracak ve geliştirme sürecini hızlandıracaktır.

---

Hazırlayan: QA Mühendisi Ayşe Kaya
Tarih: 25.05.2025
Versiyon: 1.0
