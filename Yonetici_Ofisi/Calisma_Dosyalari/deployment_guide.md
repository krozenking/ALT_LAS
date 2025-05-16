# GPU İstek Yönlendirme Katmanı Dağıtım Kılavuzu

**Doküman Bilgileri:**
- **Oluşturan:** Yazılım Mimarı, Kıdemli Backend Geliştirici
- **Oluşturma Tarihi:** 2025-09-05
- **Son Güncelleme:** 2025-09-05
- **Durum:** Taslak
- **İlgili Görev:** KM-2.2 (GPU İstek Yönlendirme Katmanı)
- **Öncelik:** P1

## 1. Giriş

Bu belge, GPU İstek Yönlendirme Katmanı'nın dağıtımı için adım adım talimatları içermektedir. Bu kılavuz, geliştirme, test ve üretim ortamlarında dağıtım için gerekli adımları detaylandırmaktadır.

## 2. Gereksinimler

### 2.1 Donanım Gereksinimleri

- **Sunucu:** En az 4 çekirdekli CPU, 8 GB RAM
- **GPU:** En az 1 adet NVIDIA GPU (CUDA 11.0 veya üzeri destekli)
- **Depolama:** En az 20 GB boş disk alanı

### 2.2 Yazılım Gereksinimleri

- **İşletim Sistemi:** Ubuntu 20.04 LTS veya üzeri
- **Docker:** Docker 20.10 veya üzeri
- **Docker Compose:** Docker Compose 2.0 veya üzeri
- **NVIDIA Container Toolkit:** NVIDIA Docker 2.0 veya üzeri
- **CUDA Toolkit:** CUDA 11.0 veya üzeri

### 2.3 Ağ Gereksinimleri

- **Portlar:** 8000 (API), 8080 (GPU Monitoring Service), 9090 (Logging Service)
- **Ağ:** ALT_LAS ağına erişim

## 3. Dağıtım Adımları

### 3.1 Geliştirme Ortamı Dağıtımı

1. **Kaynak Kodunu Klonla:**
   ```bash
   git clone https://github.com/alt_las/gpu-request-router.git
   cd gpu-request-router
   ```

2. **Sanal Ortam Oluştur ve Bağımlılıkları Yükle:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Yapılandırma Dosyasını Oluştur:**
   ```bash
   cp config.example.yaml config.yaml
   # config.yaml dosyasını düzenle
   ```

4. **Uygulamayı Başlat:**
   ```bash
   uvicorn api_app:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **API Dokümantasyonuna Eriş:**
   ```
   http://localhost:8000/docs
   ```

### 3.2 Test Ortamı Dağıtımı

1. **Docker İmajını Oluştur:**
   ```bash
   docker build -t gpu-request-router:test .
   ```

2. **Docker Compose ile Başlat:**
   ```bash
   docker-compose -f docker-compose.test.yml up -d
   ```

3. **Entegrasyon Testlerini Çalıştır:**
   ```bash
   pytest test_integration.py -v
   ```

4. **Performans Testlerini Çalıştır:**
   ```bash
   pytest test_performance.py -v
   ```

5. **Servisleri Durdur:**
   ```bash
   docker-compose -f docker-compose.test.yml down
   ```

### 3.3 Üretim Ortamı Dağıtımı

1. **Üretim Yapılandırmasını Oluştur:**
   ```bash
   cp config.example.yaml config.prod.yaml
   # config.prod.yaml dosyasını düzenle
   ```

2. **Docker İmajını Oluştur:**
   ```bash
   docker build -t gpu-request-router:prod .
   ```

3. **Docker İmajını Kaydet (Opsiyonel):**
   ```bash
   docker save gpu-request-router:prod | gzip > gpu-request-router-prod.tar.gz
   ```

4. **Docker İmajını Yükle (Opsiyonel):**
   ```bash
   gunzip -c gpu-request-router-prod.tar.gz | docker load
   ```

5. **Docker Compose ile Başlat:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. **Servisleri Kontrol Et:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

7. **Logları İzle:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## 4. Yapılandırma

### 4.1 Yapılandırma Dosyası

GPU İstek Yönlendirme Katmanı, `config.yaml` dosyası ile yapılandırılır. Örnek bir yapılandırma dosyası aşağıdaki gibidir:

```yaml
api:
  host: "0.0.0.0"
  port: 8000
  debug: false

gpu_monitoring:
  url: "http://gpu-monitoring-service:8080"
  update_interval: 5
  health_check_interval: 60
  max_temperature: 85.0

load_balancer:
  strategy: "hybrid"
  weights:
    usage: 0.4
    priority: 0.3
    performance: 0.2
    health: 0.1

request_router:
  max_retries: 3
  retry_delay: 1.0
  request_timeout: 30.0

error_handler:
  max_retries: 3
  retry_delay: 1.0
  error_threshold: 0.1
  gpu_cooldown_period: 300

user_quota_manager:
  default_gpu_limit: 2
  default_request_limit: 100
  default_priority_limit: 3
  quota_check_interval: 60
```

### 4.2 Ortam Değişkenleri

GPU İstek Yönlendirme Katmanı, aşağıdaki ortam değişkenlerini destekler:

- `CONFIG_PATH`: Yapılandırma dosyasının yolu (varsayılan: `config.yaml`)
- `GPU_MONITORING_URL`: GPU Monitoring Service URL'si
- `LOGGING_URL`: Logging Service URL'si
- `API_HOST`: API sunucu adresi
- `API_PORT`: API sunucu portu
- `API_DEBUG`: API hata ayıklama modu (true/false)

## 5. İzleme ve Bakım

### 5.1 İzleme

GPU İstek Yönlendirme Katmanı, aşağıdaki endpoint'ler aracılığıyla izlenebilir:

- **Metrikler:** `http://<host>:8000/api/v1/metrics`
- **GPU Durumları:** `http://<host>:8000/api/v1/gpus`
- **Sağlık Kontrolü:** `http://<host>:8000/health`

### 5.2 Loglar

GPU İstek Yönlendirme Katmanı, loglarını standart çıktıya ve Logging Service'e gönderir. Docker Compose ile çalıştırıldığında, loglar aşağıdaki komutla görüntülenebilir:

```bash
docker-compose logs -f gpu-request-router
```

### 5.3 Yedekleme ve Kurtarma

GPU İstek Yönlendirme Katmanı, durumu veritabanında saklamaz, bu nedenle özel bir yedekleme prosedürü gerektirmez. Ancak, yapılandırma dosyasının yedeklenmesi önerilir.

## 6. Sorun Giderme

### 6.1 Yaygın Sorunlar ve Çözümleri

1. **API Başlatılamıyor:**
   - Port çakışması olup olmadığını kontrol edin
   - Yapılandırma dosyasının doğru olup olmadığını kontrol edin
   - Logları kontrol edin

2. **GPU Durumları Alınamıyor:**
   - GPU Monitoring Service'in çalışıp çalışmadığını kontrol edin
   - GPU Monitoring Service URL'sinin doğru olup olmadığını kontrol edin
   - NVIDIA Container Toolkit'in doğru yapılandırıldığını kontrol edin

3. **İstekler Yönlendirilemiyor:**
   - GPU'ların kullanılabilir olup olmadığını kontrol edin
   - İstek parametrelerinin doğru olup olmadığını kontrol edin
   - Kullanıcı kotalarını kontrol edin

### 6.2 Destek

Sorunlar ve destek için aşağıdaki kanalları kullanabilirsiniz:

- **GitHub Issues:** https://github.com/alt_las/gpu-request-router/issues
- **E-posta:** support@alt_las.com
- **Slack:** #gpu-request-router kanalı

## 7. Güvenlik

### 7.1 Kimlik Doğrulama ve Yetkilendirme

GPU İstek Yönlendirme Katmanı, API isteklerini doğrulamak için API anahtarları kullanır. API anahtarları, `Authorization` başlığında `Bearer <api_key>` formatında gönderilmelidir.

### 7.2 Ağ Güvenliği

GPU İstek Yönlendirme Katmanı, yalnızca ALT_LAS ağından gelen istekleri kabul edecek şekilde yapılandırılmalıdır. Firewall kuralları, yalnızca gerekli portların açık olmasını sağlamalıdır.

## 8. Sonuç

Bu dağıtım kılavuzu, GPU İstek Yönlendirme Katmanı'nın geliştirme, test ve üretim ortamlarında dağıtımı için gerekli adımları içermektedir. Herhangi bir sorun veya öneri için lütfen destek kanallarını kullanın.
