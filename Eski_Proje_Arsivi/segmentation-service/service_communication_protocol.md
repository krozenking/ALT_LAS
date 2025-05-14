# Segmentation Service İletişim Protokolü Tasarımı

## 1. Genel Bakış

Bu belge, Segmentation Service'in diğer mikroservislerle iletişim kurması için standart bir protokol tanımlamaktadır. Bu protokol, servisler arası tutarlı, güvenilir ve verimli iletişimi sağlamak amacıyla tasarlanmıştır.

## 2. İletişim Modelleri

### 2.1. Senkron İletişim (REST API)

Segmentation Service, aşağıdaki REST API endpoint'lerini sağlayacaktır:

#### 2.1.1. Temel Endpoint'ler

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/v1/health` | GET | Servis sağlık durumu |
| `/api/v1/info` | GET | Servis bilgileri ve yetenekleri |
| `/api/v1/metrics` | GET | Servis metrikleri (Prometheus formatında) |

#### 2.1.2. Segmentasyon Endpoint'leri

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/v1/segment` | POST | Metin segmentasyonu |
| `/api/v1/segment/batch` | POST | Toplu metin segmentasyonu |
| `/api/v1/segment/analyze` | POST | Metin segmentasyonu ve analizi |
| `/api/v1/segment/alt` | POST | ALT dosyası segmentasyonu |

#### 2.1.3. İstek ve Yanıt Formatları

**Segment İsteği:**
```json
{
  "text": "Metin içeriği",
  "parameters": {
    "language": "tr",
    "mode": "normal",
    "persona": "researcher",
    "chaos_level": 0.5,
    "variables": {
      "key1": "value1",
      "key2": "value2"
    }
  }
}
```

**Segment Yanıtı:**
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

### 2.2. Asenkron İletişim (gRPC)

Segmentation Service, yüksek performanslı ve düşük gecikmeli iletişim için gRPC hizmetleri sağlayacaktır.

#### 2.2.1. Proto Tanımı

```protobuf
syntax = "proto3";

package segmentation;

service SegmentationService {
  rpc Segment(SegmentRequest) returns (SegmentResponse);
  rpc SegmentStream(SegmentRequest) returns (stream SegmentResponse);
  rpc BatchSegment(BatchSegmentRequest) returns (BatchSegmentResponse);
  rpc HealthCheck(HealthCheckRequest) returns (HealthCheckResponse);
}

message SegmentRequest {
  string text = 1;
  Parameters parameters = 2;
}

message Parameters {
  string language = 1;
  string mode = 2;
  string persona = 3;
  float chaos_level = 4;
  map<string, string> variables = 5;
}

message SegmentResponse {
  string request_id = 1;
  string status = 2;
  repeated Segment segments = 3;
  Metadata metadata = 4;
}

message Segment {
  string id = 1;
  string text = 2;
  string task_type = 3;
  map<string, string> parameters = 4;
  repeated string dependencies = 5;
  map<string, float> metadata = 6;
}

message Metadata {
  int32 total_segments = 1;
  int32 processing_time_ms = 2;
  string language = 3;
}

message BatchSegmentRequest {
  repeated SegmentRequest requests = 1;
}

message BatchSegmentResponse {
  repeated SegmentResponse responses = 1;
}

message HealthCheckRequest {
  bool include_details = 1;
}

message HealthCheckResponse {
  enum Status {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;
  }
  Status status = 1;
  map<string, string> details = 2;
}
```

### 2.3. Olay Tabanlı İletişim (Event Bus)

Segmentation Service, olay tabanlı iletişim için aşağıdaki olayları yayınlayacak ve dinleyecektir:

#### 2.3.1. Yayınlanan Olaylar

| Olay | Açıklama |
|------|----------|
| `segmentation.completed` | Segmentasyon tamamlandı |
| `segmentation.failed` | Segmentasyon başarısız oldu |
| `segmentation.status_changed` | Servis durumu değişti |

#### 2.3.2. Dinlenen Olaylar

| Olay | Açıklama |
|------|----------|
| `runner.task_created` | Runner Service'ten yeni görev |
| `ai_orchestrator.model_updated` | AI Orchestrator'dan model güncelleme |
| `archive.alt_file_created` | Archive Service'ten yeni ALT dosyası |

#### 2.3.3. Olay Formatı

```json
{
  "event_id": "uuid-string",
  "event_type": "segmentation.completed",
  "timestamp": "2025-04-24T19:20:00Z",
  "source": "segmentation-service",
  "data": {
    "request_id": "uuid-string",
    "status": "success",
    "segments_count": 5,
    "processing_time_ms": 350
  },
  "metadata": {
    "version": "1.0.0",
    "correlation_id": "uuid-string"
  }
}
```

## 3. Hata İşleme

### 3.1. HTTP Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek |
| 401 | Kimlik doğrulama gerekli |
| 403 | Yetkisiz erişim |
| 404 | Kaynak bulunamadı |
| 429 | Çok fazla istek |
| 500 | Sunucu hatası |
| 503 | Servis kullanılamıyor |

### 3.2. Hata Yanıt Formatı

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Geçersiz parametre: language",
    "details": {
      "parameter": "language",
      "allowed_values": ["en", "tr"]
    },
    "request_id": "uuid-string"
  }
}
```

### 3.3. gRPC Hata Kodları

| Kod | Açıklama |
|-----|----------|
| INVALID_ARGUMENT | Geçersiz istek parametresi |
| UNAUTHENTICATED | Kimlik doğrulama gerekli |
| PERMISSION_DENIED | Yetkisiz erişim |
| NOT_FOUND | Kaynak bulunamadı |
| RESOURCE_EXHAUSTED | Kaynak tükendi (rate limit) |
| INTERNAL | Sunucu hatası |
| UNAVAILABLE | Servis kullanılamıyor |

## 4. Güvenlik

### 4.1. Kimlik Doğrulama

Segmentation Service, aşağıdaki kimlik doğrulama yöntemlerini destekleyecektir:

- **JWT Token**: API Gateway tarafından sağlanan JWT token'ları
- **API Anahtarı**: Servisler arası iletişim için API anahtarları
- **mTLS**: Servisler arası güvenli iletişim için karşılıklı TLS

### 4.2. Yetkilendirme

Segmentation Service, rol tabanlı erişim kontrolü (RBAC) uygulayacaktır:

- **admin**: Tüm endpoint'lere tam erişim
- **service**: Servisler arası iletişim için sınırlı erişim
- **user**: Kullanıcı tarafından başlatılan istekler için sınırlı erişim

### 4.3. Veri Güvenliği

- Tüm iletişim HTTPS/TLS üzerinden şifrelenecektir
- Hassas veriler loglanmayacaktır
- Kişisel veriler işlenmeden önce anonimleştirilecektir

## 5. Servis Keşfi ve Kayıt

### 5.1. Servis Kaydı

Segmentation Service, başlatıldığında aşağıdaki bilgilerle kendisini servis kayıt sistemine kaydedecektir:

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

### 5.2. Servis Keşfi

Segmentation Service, diğer servisleri keşfetmek için aşağıdaki yöntemleri kullanacaktır:

- **Doğrudan Keşif**: Servis kayıt sisteminden sorgu
- **DNS Tabanlı Keşif**: Servis adı çözümleme
- **Yapılandırma Tabanlı**: Statik yapılandırma

## 6. Performans ve Ölçeklenebilirlik

### 6.1. Önbellek (Cache)

- İstek önbelleği: Sık yapılan istekler için
- Sonuç önbelleği: Hesaplama yoğun işlemler için
- Dağıtık önbellek: Çoklu örnek dağıtımları için

### 6.2. Hız Sınırlama (Rate Limiting)

- IP tabanlı hız sınırlama
- Kullanıcı tabanlı hız sınırlama
- Servis tabanlı hız sınırlama

### 6.3. Yük Dengeleme

- Servis keşfi ile entegre yük dengeleme
- Sağlık durumuna dayalı yönlendirme
- Akıllı yönlendirme (en düşük gecikme, en az yük)

## 7. İzleme ve Loglama

### 7.1. Metrikler

Segmentation Service, aşağıdaki metrikleri Prometheus formatında sağlayacaktır:

- `segmentation_requests_total`: Toplam istek sayısı
- `segmentation_request_duration_seconds`: İstek işleme süresi
- `segmentation_errors_total`: Toplam hata sayısı
- `segmentation_segments_total`: Oluşturulan toplam segment sayısı
- `segmentation_cache_hit_ratio`: Önbellek isabet oranı

### 7.2. Loglama

Segmentation Service, yapılandırılabilir log seviyeleriyle aşağıdaki formatta loglar üretecektir:

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

### 7.3. Dağıtık İzleme

Segmentation Service, OpenTelemetry ile dağıtık izleme desteği sağlayacaktır:

- İstek izleme (tracing)
- Servisler arası bağlam yayılımı
- Performans darboğazı analizi

## 8. Versiyonlama

### 8.1. API Versiyonlama

- URL yolu versiyonlama: `/api/v1/segment`
- Header tabanlı versiyonlama: `Accept: application/vnd.segmentation.v1+json`
- Parametre tabanlı versiyonlama: `?api-version=1.0`

### 8.2. Geriye Dönük Uyumluluk

- Eski API versiyonları en az 6 ay desteklenecektir
- Yeni alanlar isteğe bağlı olacaktır
- Kaldırılan alanlar için varsayılan değerler sağlanacaktır

## 9. Uygulama Planı

1. REST API implementasyonu
2. gRPC hizmet implementasyonu
3. Olay tabanlı iletişim implementasyonu
4. Güvenlik entegrasyonu
5. Servis keşfi entegrasyonu
6. İzleme ve loglama entegrasyonu
7. Performans optimizasyonu
8. Kapsamlı test ve dokümantasyon
