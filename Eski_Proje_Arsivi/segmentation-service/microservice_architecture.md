# Segmentation Service Mikroservis Mimarisi Dokümantasyonu

## 1. Genel Bakış

Bu doküman, ALT_LAS projesinin Segmentation Service bileşeni için mikroservis mimarisini detaylandırmaktadır. Segmentation Service, metin segmentasyonu ve ALT dosyası işleme yetenekleri sağlayan, yüksek performanslı ve dayanıklı bir mikroservistir.

## 2. Mimari Diyagramı

```
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|   API Gateway     |<---->| Segmentation Svc  |<---->|  AI Orchestrator  |
|                   |      |                   |      |                   |
+-------------------+      +-------------------+      +-------------------+
         ^                         ^                          ^
         |                         |                          |
         v                         v                          v
+-------------------+      +-------------------+      +-------------------+
|                   |      |                   |      |                   |
|   Runner Service  |<---->|  Archive Service  |<---->| OS Integration Svc|
|                   |      |                   |      |                   |
+-------------------+      +-------------------+      +-------------------+
```

## 3. Bileşenler

### 3.1. Servis İletişim Protokolü

Segmentation Service, diğer mikroservislerle iletişim kurmak için üç farklı iletişim modeli kullanır:

#### 3.1.1. Senkron İletişim (REST API)

REST API, servisler arası senkron iletişim için kullanılır. Temel endpoint'ler şunlardır:

- `/api/v1/health`: Servis sağlık durumu
- `/api/v1/info`: Servis bilgileri ve yetenekleri
- `/api/v1/metrics`: Servis metrikleri (Prometheus formatında)
- `/api/v1/segment`: Metin segmentasyonu
- `/api/v1/segment/batch`: Toplu metin segmentasyonu
- `/api/v1/segment/analyze`: Metin segmentasyonu ve analizi
- `/api/v1/segment/alt`: ALT dosyası segmentasyonu

İstek ve yanıt formatları JSON tabanlıdır ve standart bir yapı izler. Örnek bir yanıt:

```json
{
  "request_id": "uuid-string",
  "status": "success",
  "segments": [
    {
      "id": "segment-1",
      "text": "Segment metni",
      "task_type": "search",
      "parameters": {
        "key1": "value1"
      },
      "dependencies": ["segment-2"],
      "metadata": {
        "confidence": 0.95,
        "processing_time_ms": 120
      }
    }
  ],
  "metadata": {
    "total_segments": 1,
    "processing_time_ms": 150,
    "language": "tr"
  }
}
```

#### 3.1.2. Asenkron İletişim (gRPC)

gRPC, yüksek performanslı ve düşük gecikmeli iletişim için kullanılır. Segmentation Service, aşağıdaki gRPC hizmetlerini sağlar:

- `Segment`: Tek bir metin segmentasyonu
- `SegmentStream`: Akış tabanlı segmentasyon
- `BatchSegment`: Toplu segmentasyon
- `HealthCheck`: Servis sağlık kontrolü

#### 3.1.3. Olay Tabanlı İletişim (Event Bus)

Olay tabanlı iletişim, servisler arası asenkron bildirimler için kullanılır. Segmentation Service, aşağıdaki olayları yayınlar ve dinler:

**Yayınlanan Olaylar:**
- `segmentation.completed`: Segmentasyon tamamlandı
- `segmentation.failed`: Segmentasyon başarısız oldu
- `segmentation.status_changed`: Servis durumu değişti

**Dinlenen Olaylar:**
- `runner.task_created`: Runner Service'ten yeni görev
- `ai_orchestrator.model_updated`: AI Orchestrator'dan model güncelleme
- `archive.alt_file_created`: Archive Service'ten yeni ALT dosyası

### 3.2. Servis Keşif Mekanizması

Segmentation Service, diğer mikroservisleri keşfetmek ve kendisini kaydetmek için bir servis keşif mekanizması kullanır. Bu mekanizma, aşağıdaki bileşenlerden oluşur:

#### 3.2.1. ServiceRegistry

`ServiceRegistry` sınıfı, servis kaydı ve keşfi için temel işlevselliği sağlar:

- `register_service()`: Servisi kayıt sistemine kaydeder
- `deregister_service()`: Servisi kayıt sisteminden kaldırır
- `discover_service()`: İsme göre servis keşfeder
- `discover_all_services()`: Tüm servisleri keşfeder
- `get_service_endpoint()`: Servis endpoint'ini alır

Servis kaydı, aşağıdaki bilgileri içerir:

```json
{
  "service_id": "segmentation-service-1",
  "service_name": "segmentation-service",
  "version": "1.0.0",
  "endpoints": {
    "http": "http://segmentation-service:8080",
    "grpc": "grpc://segmentation-service:9090"
  },
  "health_check": {
    "http": "/api/v1/health",
    "interval_seconds": 30,
    "timeout_seconds": 5
  },
  "metadata": {
    "capabilities": ["text-segmentation", "alt-file-processing"],
    "supported_languages": ["en", "tr"]
  }
}
```

#### 3.2.2. Servis İstemcileri

Segmentation Service, diğer servislerle iletişim kurmak için özel istemci sınıfları kullanır:

- `AIOrchestrator`: AI Orchestrator ile iletişim
- `RunnerService`: Runner Service ile iletişim
- `ArchiveService`: Archive Service ile iletişim

Bu istemciler, servis keşif mekanizmasını kullanarak hedef servislerin endpoint'lerini dinamik olarak bulur ve iletişim kurar.

### 3.3. Hata İşleme ve Dayanıklılık

Segmentation Service, hata durumlarına karşı dayanıklı olmak için çeşitli desenler kullanır:

#### 3.3.1. Circuit Breaker

Circuit Breaker deseni, başarısız servis çağrılarını izler ve belirli bir eşiğe ulaşıldığında devreyi açarak daha fazla çağrıyı engeller. Bu, hatalı servislerin aşırı yüklenmesini önler ve sistemin geri kalanının etkilenmesini engeller.

`CircuitBreaker` sınıfı, üç durumda çalışır:
- `CLOSED`: Normal çalışma, istekler geçirilir
- `OPEN`: Devre açık, istekler engellenir
- `HALF_OPEN`: Test aşaması, sınırlı sayıda istek geçirilir

#### 3.3.2. Retry Mekanizması

Retry mekanizması, geçici hatalarda istekleri otomatik olarak yeniden dener. `RetryConfig` sınıfı, aşağıdaki parametreleri yapılandırır:

- `max_retries`: Maksimum yeniden deneme sayısı
- `initial_delay`: İlk deneme için gecikme süresi
- `max_delay`: Maksimum gecikme süresi
- `backoff_factor`: Üstel geri çekilme faktörü
- `jitter`: Rastgele gecikme eklemek için kullanılır

#### 3.3.3. Fallback Stratejisi

Fallback stratejisi, bir işlem başarısız olduğunda alternatif bir sonuç sağlar. `FallbackStrategy` sınıfı, statik bir değer veya dinamik bir fonksiyon kullanabilir.

#### 3.3.4. Bulkhead Deseni

Bulkhead deseni, eşzamanlı istek sayısını sınırlar ve aşırı yüklenmeyi önler. `BulkheadConfig` sınıfı, aşağıdaki parametreleri yapılandırır:

- `max_concurrent_calls`: Maksimum eşzamanlı çağrı sayısı
- `max_queue_size`: Maksimum kuyruk boyutu

#### 3.3.5. Timeout Yönetimi

Timeout yönetimi, uzun süren işlemleri belirli bir süre sonra iptal eder. `TimeoutConfig` sınıfı, timeout süresini yapılandırır.

#### 3.3.6. Birleşik Dayanıklılık Desenleri

Segmentation Service, yukarıdaki desenleri birleştirerek kapsamlı bir dayanıklılık stratejisi uygular. `ResilienceDecorator` sınıfı, bu desenleri tek bir dekoratörde birleştirir.

Örnek kullanım:

```python
@with_resilience(
    circuit_breaker_name="ai-orchestrator",
    max_retries=3,
    timeout_seconds=5.0,
    max_concurrent_calls=10,
    fallback_value={"status": "error", "message": "Service unavailable"}
)
async def process_with_ai_orchestrator(text, parameters):
    # İşlem kodu
    pass
```

## 4. Veri Akışı

### 4.1. Metin Segmentasyonu İş Akışı

1. İstemci, `/api/v1/segment` endpoint'ine bir POST isteği gönderir
2. Segmentation Service, metni ve parametreleri doğrular
3. Dil algılama işlemi gerçekleştirilir
4. Metin, NLP işlemcisi tarafından segmentlere ayrılır
5. Gerekirse, AI Orchestrator'dan ek bilgi alınır
6. Segmentler, bağımlılıklar ve metadata ile birlikte döndürülür

### 4.2. ALT Dosyası İşleme İş Akışı

1. İstemci, `/api/v1/segment/alt` endpoint'ine bir POST isteği gönderir
2. Segmentation Service, ALT dosyasını parse eder
3. Dosyadaki komutlar segmentlere ayrılır
4. Segmentler, Runner Service'e gönderilmek üzere hazırlanır
5. İşlem sonuçları, Archive Service'e kaydedilir

## 5. Ölçeklenebilirlik ve Performans

### 5.1. Yatay Ölçeklendirme

Segmentation Service, stateless tasarımı sayesinde yatay olarak ölçeklenebilir. Birden fazla örnek, bir yük dengeleyici arkasında çalıştırılabilir.

### 5.2. Önbellek Stratejisi

Servis, sık kullanılan istekler için önbellek kullanır:

- İstek önbelleği: Aynı metin için tekrarlanan istekler
- Sonuç önbelleği: Hesaplama yoğun işlemler
- Servis keşif önbelleği: Servis endpoint'leri

### 5.3. Asenkron İşleme

Uzun süren işlemler için asenkron işleme kullanılır:

- Toplu işlemler için kuyruk sistemi
- Akış tabanlı yanıtlar için gRPC streaming
- Olay tabanlı bildirimler için event bus

## 6. Güvenlik

### 6.1. Kimlik Doğrulama ve Yetkilendirme

Segmentation Service, aşağıdaki kimlik doğrulama yöntemlerini destekler:

- JWT Token: API Gateway tarafından sağlanan token'lar
- API Anahtarı: Servisler arası iletişim için
- mTLS: Güvenli servisler arası iletişim için

### 6.2. Veri Güvenliği

- Tüm iletişim HTTPS/TLS üzerinden şifrelenir
- Hassas veriler loglanmaz
- Kişisel veriler işlenmeden önce anonimleştirilir

## 7. İzleme ve Loglama

### 7.1. Metrikler

Segmentation Service, aşağıdaki metrikleri Prometheus formatında sağlar:

- `segmentation_requests_total`: Toplam istek sayısı
- `segmentation_request_duration_seconds`: İstek işleme süresi
- `segmentation_errors_total`: Toplam hata sayısı
- `segmentation_segments_total`: Oluşturulan toplam segment sayısı
- `segmentation_cache_hit_ratio`: Önbellek isabet oranı

### 7.2. Dağıtık İzleme

OpenTelemetry ile dağıtık izleme desteği:

- İstek izleme (tracing)
- Servisler arası bağlam yayılımı
- Performans darboğazı analizi

### 7.3. Yapılandırılmış Loglama

JSON formatında yapılandırılmış loglar:

```json
{
  "timestamp": "2025-04-24T19:20:00Z",
  "level": "INFO",
  "service": "segmentation-service",
  "instance": "segmentation-service-1",
  "request_id": "uuid-string",
  "message": "Segmentation request processed successfully",
  "details": {
    "segments_count": 5,
    "processing_time_ms": 350,
    "language": "tr"
  }
}
```

## 8. Dağıtım ve Operasyon

### 8.1. Konteynerizasyon

Segmentation Service, Docker konteynerinde çalışacak şekilde paketlenmiştir:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080 9090

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 8.2. Kubernetes Dağıtımı

Kubernetes manifest'leri, servisin dağıtımını ve yapılandırmasını tanımlar:

- Deployment: Servis örneklerinin yönetimi
- Service: Servis keşfi ve yük dengeleme
- ConfigMap: Yapılandırma ayarları
- Secret: Hassas bilgiler
- HorizontalPodAutoscaler: Otomatik ölçeklendirme

### 8.3. Yapılandırma Yönetimi

Segmentation Service, aşağıdaki yapılandırma kaynaklarını destekler:

- Çevresel değişkenler
- Yapılandırma dosyaları (YAML/JSON)
- Kubernetes ConfigMap ve Secret'lar
- Dinamik yapılandırma (çalışma zamanında güncellenebilir)

## 9. Geliştirme ve Test

### 9.1. Geliştirme Ortamı

Geliştirme ortamı kurulumu:

```bash
# Bağımlılıkları yükle
pip install -r requirements.txt

# Geliştirme sunucusunu başlat
uvicorn app:app --reload --host 0.0.0.0 --port 8080
```

### 9.2. Test Stratejisi

Segmentation Service için kapsamlı test stratejisi:

- Birim Testleri: Bileşenlerin izole testleri
- Entegrasyon Testleri: Bileşenler arası etkileşim testleri
- Uçtan Uca Testleri: Tam iş akışı testleri
- Performans Testleri: Yük ve stres testleri
- Dayanıklılık Testleri: Hata senaryoları testleri

### 9.3. CI/CD Pipeline

Sürekli entegrasyon ve dağıtım pipeline'ı:

1. Kod değişikliklerini kontrol et
2. Bağımlılıkları yükle
3. Statik kod analizi yap
4. Birim ve entegrasyon testlerini çalıştır
5. Docker imajı oluştur
6. İmajı kayıt defterine gönder
7. Test ortamına dağıt
8. Uçtan uca testleri çalıştır
9. Üretim ortamına dağıt

## 10. Gelecek Geliştirmeler

### 10.1. Planlanan İyileştirmeler

- Daha gelişmiş NLP yetenekleri
- Daha fazla dil desteği
- Gerçek zamanlı işleme yetenekleri
- Daha gelişmiş AI Orchestrator entegrasyonu
- GraphQL API desteği

### 10.2. Teknik Borç

- Kapsamlı bellek yönetimi optimizasyonu
- Daha iyi hata işleme ve raporlama
- Daha kapsamlı test kapsamı
- Daha iyi dokümantasyon

## 11. Sonuç

Segmentation Service, ALT_LAS projesinin önemli bir bileşenidir ve metin segmentasyonu ve ALT dosyası işleme yetenekleri sağlar. Mikroservis mimarisi, servisin ölçeklenebilir, dayanıklı ve bakımı kolay olmasını sağlar. Bu doküman, servisin mimarisini, bileşenlerini ve iş akışlarını detaylandırmaktadır.
