# Güvenlik ve DevOps Dokümantasyonu

Bu dokümantasyon, ALT_LAS projesinin güvenlik ve DevOps bileşenlerini açıklamaktadır.

## CI/CD Pipeline

ALT_LAS projesi için iki GitHub Actions workflow dosyası oluşturulmuştur:

1. **CI Workflow** (`.github/workflows/ci.yml`): Bu workflow, kod kalitesini ve güvenliğini sağlamak için aşağıdaki işlemleri gerçekleştirir:
   - Linting: Tüm servislerin kod kalitesi kontrolü
   - Testing: Birim ve entegrasyon testleri
   - Security Scanning: Trivy ile güvenlik açığı taraması
   - Building: Docker imajlarının oluşturulması

2. **CD Workflow** (`.github/workflows/cd.yml`): Bu workflow, main branch'e veya tag'lere push yapıldığında aşağıdaki işlemleri gerçekleştirir:
   - GitHub Container Registry'ye login
   - Docker imajlarının build edilmesi ve push edilmesi
   - Semantic versiyonlama ile imajların etiketlenmesi

## Docker Yapılandırmaları

Docker Compose dosyası (`docker/docker-compose.yml`) aşağıdaki iyileştirmelerle güncellenmiştir:

- Tüm servisler için healthcheck tanımları
- Restart politikaları (unless-stopped)
- İzleme servisleri:
  - Prometheus: Metrik toplama
  - Chronograf: Metrik görselleştirme (MIT lisanslı Grafana alternatifi)
  - InfluxDB: Zaman serisi veritabanı

## Güvenlik Katmanı

Güvenlik katmanı için aşağıdaki araçlar oluşturulmuştur:

1. **Security Audit Script** (`docker/security_audit.sh`): Bu script, projenin güvenlik durumunu değerlendirmek için aşağıdaki kontrolleri yapar:
   - Hassas bilgilerin taranması
   - Docker güvenlik kontrolü
   - GitHub Actions güvenlik kontrolü
   - Açık portların kontrolü
   - Healthcheck kontrolü

2. **Sandbox Isolation Script** (`docker/setup_sandbox.sh`): Bu script, servislerin izole bir ortamda çalışması için sandbox ortamı oluşturur:
   - Sandbox kullanıcısı oluşturma
   - İzole dizinler oluşturma
   - Güvenlik politikası tanımlama
   - Kaynak sınırlamaları

## İzleme ve Günlük Kaydı

İzleme sistemi için Prometheus yapılandırması (`docker/prometheus/prometheus.yml`) oluşturulmuştur. Bu yapılandırma:

- Tüm servislerin metriklerini toplar
- 15 saniyelik scrape aralığı ile çalışır
- Aşağıdaki hedefleri izler:
  - api-gateway
  - segmentation-service
  - runner-service
  - archive-service
  - postgres
  - nats
  - prometheus

## Kullanım Kılavuzu

### CI/CD Pipeline Kullanımı

1. Kod değişikliklerini bir branch'e push edin
2. Pull request oluşturun
3. CI workflow otomatik olarak çalışacak ve kod kalitesini kontrol edecektir
4. PR onaylandıktan sonra main branch'e merge edildiğinde, CD workflow otomatik olarak çalışacak ve imajları deploy edecektir

### Docker Ortamını Başlatma

```bash
cd docker
docker-compose up -d
```

### Güvenlik Denetimi Çalıştırma

```bash
cd docker
./security_audit.sh
```

### Sandbox Ortamı Kurulumu

```bash
cd docker
sudo ./setup_sandbox.sh
```

## Gelecek İyileştirmeler

1. Kubernetes deployment yapılandırmaları
2. Otomatik yedekleme sistemi
3. Disaster recovery planı
4. Daha kapsamlı güvenlik denetimleri
5. Servis mesh entegrasyonu
