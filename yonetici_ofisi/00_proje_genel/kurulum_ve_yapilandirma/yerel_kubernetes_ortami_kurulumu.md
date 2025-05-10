# ALT_LAS Projesi - Yerel Kubernetes Ortamı Kurulumu ve Yapılandırması

**Tarih:** 10 Mayıs 2025
**Hazırlayan:** Yönetici
**Konu:** Yerel Geliştirme Ortamında Kubernetes Kurulumu ve ALT_LAS Projesinin Yapılandırılması

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin yerel geliştirme ortamında Kubernetes üzerinde çalıştırılması için gerekli adımları ve yapılandırmaları detaylandırmaktadır. Belge, geliştirme ekibinin yerel makinelerinde tutarlı bir Kubernetes ortamı kurmasını ve projeyi bu ortamda çalıştırmasını sağlamak amacıyla hazırlanmıştır.

## 2. Gerekli Araçlar

Yerel Kubernetes ortamı için aşağıdaki araçların kurulması gerekmektedir:

1. **Docker Desktop**: Konteyner çalıştırma ortamı
2. **K3d**: Docker içinde Kubernetes çalıştırmak için hafif bir araç
3. **kubectl**: Kubernetes komut satırı aracı
4. **VS Code**: Geliştirme ortamı
5. **VS Code Eklentileri**:
   - Kubernetes Tools (ms-kubernetes-tools.vscode-kubernetes-tools)
   - K3d (inercia.vscode-k3d)
6. **Kompose**: Docker Compose dosyalarını Kubernetes YAML dosyalarına dönüştürmek için araç

## 3. Kurulum Adımları

### 3.1. Docker Desktop Kurulumu

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) web sitesinden işletim sisteminize uygun sürümü indirin ve kurun.
2. Kurulum tamamlandıktan sonra Docker Desktop'ı başlatın.
3. Docker Desktop'ın başarıyla çalıştığını doğrulamak için komut satırında şu komutu çalıştırın:
   ```
   docker --version
   ```

### 3.2. K3d Kurulumu

Windows için PowerShell kullanarak:

```powershell
# Chocolatey ile kurulum
choco install k3d

# veya

# Doğrudan kurulum scripti
Invoke-WebRequest -Uri https://raw.githubusercontent.com/rancher/k3d/main/install.ps1 -OutFile k3d-install.ps1; ./k3d-install.ps1
```

Kurulumu doğrulamak için:

```
k3d version
```

### 3.3. kubectl Kurulumu

Windows için PowerShell kullanarak:

```powershell
# Chocolatey ile kurulum
choco install kubernetes-cli

# veya

# Doğrudan indirme
curl -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"
# İndirilen dosyayı PATH içindeki bir klasöre taşıyın
```

Kurulumu doğrulamak için:

```
kubectl version --client
```

### 3.4. VS Code Eklentilerinin Kurulumu

1. VS Code'u açın
2. Eklentiler sekmesine tıklayın (veya `Ctrl+Shift+X` tuşlarına basın)
3. Aşağıdaki eklentileri arayın ve kurun:
   - Kubernetes Tools (ms-kubernetes-tools.vscode-kubernetes-tools)
   - K3d (inercia.vscode-k3d)

### 3.5. Kompose Kurulumu

Windows için PowerShell kullanarak:

```powershell
# Chocolatey ile kurulum
choco install kubernetes-kompose

# veya

# Doğrudan indirme
curl -L https://github.com/kubernetes/kompose/releases/download/v1.30.0/kompose-windows-amd64.exe -o kompose.exe
# İndirilen dosyayı PATH içindeki bir klasöre taşıyın
```

Kurulumu doğrulamak için:

```
kompose version
```

## 4. Yerel Kubernetes Kümesi Oluşturma

### 4.1. K3d ile Küme Oluşturma

1. VS Code'u açın
2. K3d eklentisi simgesine tıklayın
3. "Create Cluster" seçeneğine tıklayın
4. Küme adı olarak "alt-las-local" girin
5. Aşağıdaki yapılandırma seçeneklerini belirleyin:
   - Server (Control Plane) Nodes: 1
   - Agent Nodes: 2
   - API Port: 6443
   - Port Mappings:
     - 80:80 (HTTP)
     - 443:443 (HTTPS)
6. "Create" düğmesine tıklayarak kümeyi oluşturun

Alternatif olarak, komut satırından şu komutu kullanabilirsiniz:

```
k3d cluster create alt-las-local --api-port 6443 -p "80:80@loadbalancer" -p "443:443@loadbalancer" --agents 2
```

### 4.2. Küme Bağlantısını Doğrulama

Kümenin başarıyla oluşturulduğunu doğrulamak için:

```
kubectl get nodes
```

Bu komut, 1 control plane ve 2 agent node göstermelidir.

## 5. ALT_LAS Projesini Kubernetes'e Taşıma

### 5.1. Docker Compose Dosyasını Kubernetes YAML Dosyalarına Dönüştürme

1. ALT_LAS projesinin kök dizinine gidin
2. Aşağıdaki komutu çalıştırarak Docker Compose dosyasını Kubernetes YAML dosyalarına dönüştürün:

```
kompose convert -f docker-compose.yml -o kubernetes-manifests
```

Bu komut, `kubernetes-manifests` dizininde her servis için Deployment ve Service YAML dosyaları oluşturacaktır.

### 5.2. Kubernetes YAML Dosyalarını Düzenleme

Oluşturulan YAML dosyalarını gözden geçirin ve gerekli düzenlemeleri yapın:

1. Servisler arası iletişim için doğru servis adlarını kullanın
2. Ortam değişkenlerini ConfigMap ve Secret kaynaklarına taşıyın
3. Kalıcı depolama için PersistentVolumeClaim kaynaklarını düzenleyin
4. Servis bağımlılıklarını yönetmek için Deployment'lara başlatma sırası belirtin

### 5.3. ConfigMap ve Secret Oluşturma

Ortam değişkenlerini yönetmek için ConfigMap ve Secret kaynakları oluşturun:

```yaml
# alt-las-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alt-las-config
data:
  NODE_ENV: "development"
  SEGMENTATION_SERVICE_URL: "http://segmentation-service:8000"
  RUNNER_SERVICE_URL: "http://runner-service:8080"
  ARCHIVE_SERVICE_URL: "http://archive-service:9000"
  AI_ORCHESTRATOR_URL: "http://ai-orchestrator:8001"
  REDIS_URL: "redis://redis:6379"
  PYTHONUNBUFFERED: "1"
  SEGMENTATION_PORT: "8000"
  ARCHIVE_PORT: "9000"
  AI_PORT: "8001"
  RUST_LOG: "info"
  RUNNER_AI_SERVICE_URL: "http://ai-orchestrator:8001"
  NATS_URL: "nats://nats:4222"
```

```yaml
# alt-las-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: alt-las-secrets
type: Opaque
stringData:
  JWT_SECRET: "your-jwt-secret"
  REDIS_PASSWORD: "your-redis-password"
  POSTGRES_USER: "postgres"
  POSTGRES_PASSWORD: "postgres"
  POSTGRES_DB: "altlas"
  DATABASE_URL: "postgresql://postgres:postgres@postgres-db:5432/altlas"
  OPENAI_API_KEY: "your-openai-api-key"
```

### 5.4. Kubernetes Kaynaklarını Uygulama

Oluşturulan ve düzenlenen YAML dosyalarını Kubernetes kümenize uygulayın:

```
kubectl apply -f kubernetes-manifests/
kubectl apply -f alt-las-configmap.yaml
kubectl apply -f alt-las-secrets.yaml
```

### 5.5. Uygulamanın Durumunu Kontrol Etme

Uygulamanın başarıyla dağıtıldığını doğrulamak için:

```
kubectl get pods
kubectl get services
```

## 6. Yerel Geliştirme İş Akışı

### 6.1. Kod Değişikliklerini Test Etme

Yerel geliştirme sırasında kod değişikliklerini test etmek için:

1. Değişiklikleri yapın
2. Docker imajını yeniden oluşturun:
   ```
   docker build -t alt-las/api-gateway:dev ./api-gateway
   ```
3. İmajı K3d kümenize yükleyin:
   ```
   k3d image import alt-las/api-gateway:dev -c alt-las-local
   ```
4. Deployment'ı güncelleyin:
   ```
   kubectl rollout restart deployment/api-gateway
   ```

### 6.2. Logları İzleme

Uygulamanın loglarını izlemek için:

```
kubectl logs -f deployment/api-gateway
```

### 6.3. Port Yönlendirme

Belirli bir servise doğrudan erişmek için port yönlendirme kullanabilirsiniz:

```
kubectl port-forward service/api-gateway 3000:3000
```

Bu komut, api-gateway servisinin 3000 portunu yerel makinenizin 3000 portuna yönlendirir.

## 7. Sorun Giderme

### 7.1. Pod Durumunu Kontrol Etme

Pod'ların durumunu kontrol etmek için:

```
kubectl describe pod <pod-adı>
```

### 7.2. Servis Bağlantılarını Test Etme

Servisler arası bağlantıları test etmek için geçici bir pod oluşturabilirsiniz:

```
kubectl run curl --image=curlimages/curl -i --tty -- sh
```

Bu pod içinden curl komutlarını kullanarak servislere istek gönderebilirsiniz:

```
curl http://api-gateway:3000/health
```

### 7.3. Yaygın Sorunlar ve Çözümleri

1. **ImagePullBackOff Hatası**: Docker imajı bulunamıyor
   - Çözüm: İmajı yerel olarak oluşturun ve K3d kümenize yükleyin

2. **CrashLoopBackOff Hatası**: Konteyner başlatılamıyor
   - Çözüm: Pod loglarını kontrol edin ve uygulamanın hata mesajlarını inceleyin

3. **Servisler Arası İletişim Sorunları**: Servisler birbirine erişemiyor
   - Çözüm: Servis adlarının ve portların doğru yapılandırıldığından emin olun

## 8. Sonraki Adımlar

1. **CI/CD Pipeline Entegrasyonu**: Yerel Kubernetes ortamını CI/CD pipeline'larına entegre edin
2. **Helm Chart Oluşturma**: Projenin dağıtımını kolaylaştırmak için Helm chart'ları oluşturun
3. **Izlenebilirlik Araçları Entegrasyonu**: Prometheus, a suitable metrics visualization tool (Apache 2.0 compatible) ve Jaeger gibi izlenebilirlik araçlarını entegre edin
4. **Otomatik Ölçeklendirme Yapılandırması**: Horizontal Pod Autoscaler (HPA) ile otomatik ölçeklendirme yapılandırın
5. **Güvenlik Taramaları**: Kubernetes kaynaklarında güvenlik taramaları yapın

## 9. Referanslar

- [K3d Dokümantasyonu](https://k3d.io/)
- [Kubernetes Dokümantasyonu](https://kubernetes.io/docs/home/)
- [Kompose Dokümantasyonu](https://kompose.io/)
- [VS Code Kubernetes Tools Eklentisi](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools)
- [VS Code K3d Eklentisi](https://marketplace.visualstudio.com/items?itemName=inercia.vscode-k3d)
