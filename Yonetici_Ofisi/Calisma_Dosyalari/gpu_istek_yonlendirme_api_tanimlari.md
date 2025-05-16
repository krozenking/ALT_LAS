# GPU İstek Yönlendirme Katmanı API Tanımları

**Doküman Bilgileri:**
- **Oluşturan:** Yazılım Mimarı, Kıdemli Backend Geliştirici
- **Oluşturma Tarihi:** 2025-08-22
- **Son Güncelleme:** 2025-08-22
- **Durum:** Taslak
- **İlgili Görev:** KM-2.2 (GPU İstek Yönlendirme Katmanı)
- **Öncelik:** P1

## 1. Giriş

Bu belge, GPU İstek Yönlendirme Katmanı için API tanımlarını ve veri modellerini içermektedir. Bu API'ler, gelen istekleri uygun GPU kaynaklarına yönlendirmek, yük dengelemesi yapmak ve GPU kaynaklarının verimli kullanımını sağlamak amacıyla geliştirilecektir.

## 2. API Tanımları

### 2.1 İstek Yönlendirme API'si

#### 2.1.1 İstek Yönlendirme

**Endpoint:** `/api/v1/route`

**Metod:** `POST`

**İstek Gövdesi:**
```json
{
  "request_id": "string (UUID, optional)",
  "user_id": "string",
  "model_id": "string",
  "priority": "integer (1-5, default: 3)",
  "type": "string (inference, training, fine-tuning, etc.)",
  "resource_requirements": {
    "memory": "integer (MB)",
    "compute_units": "integer",
    "max_batch_size": "integer",
    "expected_duration": "integer (ms)"
  },
  "timeout": "integer (ms, default: 30000)",
  "callback_url": "string (URL, optional)",
  "payload": "object"
}
```

**Yanıt:**
```json
{
  "request_id": "string (UUID)",
  "status": "string (pending, processing, completed, failed)",
  "gpu_id": "string",
  "estimated_start_time": "string (ISO 8601)",
  "estimated_completion_time": "string (ISO 8601)",
  "queue_position": "integer"
}
```

**Durum Kodları:**
- `200 OK`: İstek başarıyla yönlendirildi
- `400 Bad Request`: İstek parametreleri geçersiz
- `401 Unauthorized`: Kimlik doğrulama başarısız
- `403 Forbidden`: Yetkilendirme başarısız
- `429 Too Many Requests`: Kullanıcı kota limiti aşıldı
- `503 Service Unavailable`: Uygun GPU bulunamadı

#### 2.1.2 Toplu İstek Yönlendirme

**Endpoint:** `/api/v1/route/batch`

**Metod:** `POST`

**İstek Gövdesi:**
```json
{
  "batch_id": "string (UUID, optional)",
  "user_id": "string",
  "requests": [
    {
      "model_id": "string",
      "priority": "integer (1-5, default: 3)",
      "type": "string (inference, training, fine-tuning, etc.)",
      "resource_requirements": {
        "memory": "integer (MB)",
        "compute_units": "integer",
        "max_batch_size": "integer",
        "expected_duration": "integer (ms)"
      },
      "payload": "object"
    }
  ],
  "timeout": "integer (ms, default: 60000)",
  "callback_url": "string (URL, optional)"
}
```

**Yanıt:**
```json
{
  "batch_id": "string (UUID)",
  "status": "string (pending, processing, completed, failed)",
  "request_ids": ["string (UUID)"],
  "estimated_start_time": "string (ISO 8601)",
  "estimated_completion_time": "string (ISO 8601)"
}
```

**Durum Kodları:**
- `200 OK`: İstekler başarıyla yönlendirildi
- `400 Bad Request`: İstek parametreleri geçersiz
- `401 Unauthorized`: Kimlik doğrulama başarısız
- `403 Forbidden`: Yetkilendirme başarısız
- `429 Too Many Requests`: Kullanıcı kota limiti aşıldı
- `503 Service Unavailable`: Uygun GPU bulunamadı

### 2.2 İstek Durum API'si

#### 2.2.1 İstek Durumu Sorgulama

**Endpoint:** `/api/v1/requests/{request_id}`

**Metod:** `GET`

**Yanıt:**
```json
{
  "request_id": "string (UUID)",
  "user_id": "string",
  "model_id": "string",
  "status": "string (pending, processing, completed, failed)",
  "gpu_id": "string",
  "submission_time": "string (ISO 8601)",
  "start_time": "string (ISO 8601, optional)",
  "completion_time": "string (ISO 8601, optional)",
  "queue_position": "integer",
  "progress": "float (0-1)",
  "result": "object (optional)",
  "error": "string (optional)"
}
```

**Durum Kodları:**
- `200 OK`: İstek durumu başarıyla alındı
- `404 Not Found`: İstek bulunamadı

#### 2.2.2 İstek İptal Etme

**Endpoint:** `/api/v1/requests/{request_id}`

**Metod:** `DELETE`

**Yanıt:**
```json
{
  "request_id": "string (UUID)",
  "status": "string (cancelled)",
  "message": "string"
}
```

**Durum Kodları:**
- `200 OK`: İstek başarıyla iptal edildi
- `404 Not Found`: İstek bulunamadı
- `409 Conflict`: İstek iptal edilemez (tamamlanmış veya zaten iptal edilmiş)

### 2.3 GPU Durum API'si

#### 2.3.1 Tüm GPU'ların Durumunu Alma

**Endpoint:** `/api/v1/gpus`

**Metod:** `GET`

**Yanıt:**
```json
{
  "gpus": [
    {
      "gpu_id": "string",
      "name": "string",
      "status": "string (available, busy, error, maintenance)",
      "compute_capability": "string",
      "memory_total": "integer (bytes)",
      "memory_used": "integer (bytes)",
      "memory_free": "integer (bytes)",
      "utilization": "float (0-1)",
      "temperature": "float (Celsius)",
      "power_usage": "float (Watts)",
      "power_limit": "float (Watts)",
      "active_requests": "integer",
      "queued_requests": "integer",
      "performance_index": "float (0-1)",
      "error_rate": "float (0-1)",
      "uptime": "integer (seconds)"
    }
  ]
}
```

**Durum Kodları:**
- `200 OK`: GPU durumları başarıyla alındı

#### 2.3.2 Belirli Bir GPU'nun Durumunu Alma

**Endpoint:** `/api/v1/gpus/{gpu_id}`

**Metod:** `GET`

**Yanıt:**
```json
{
  "gpu_id": "string",
  "name": "string",
  "status": "string (available, busy, error, maintenance)",
  "compute_capability": "string",
  "memory_total": "integer (bytes)",
  "memory_used": "integer (bytes)",
  "memory_free": "integer (bytes)",
  "utilization": "float (0-1)",
  "temperature": "float (Celsius)",
  "power_usage": "float (Watts)",
  "power_limit": "float (Watts)",
  "active_requests": [
    {
      "request_id": "string (UUID)",
      "user_id": "string",
      "model_id": "string",
      "start_time": "string (ISO 8601)",
      "progress": "float (0-1)"
    }
  ],
  "queued_requests": "integer",
  "performance_index": "float (0-1)",
  "error_rate": "float (0-1)",
  "uptime": "integer (seconds)",
  "processes": [
    {
      "pid": "integer",
      "name": "string",
      "memory_used": "integer (bytes)"
    }
  ]
}
```

**Durum Kodları:**
- `200 OK`: GPU durumu başarıyla alındı
- `404 Not Found`: GPU bulunamadı

### 2.4 Metrik API'si

#### 2.4.1 Sistem Metriklerini Alma

**Endpoint:** `/api/v1/metrics`

**Metod:** `GET`

**Yanıt:**
```json
{
  "timestamp": "string (ISO 8601)",
  "total_requests": "integer",
  "active_requests": "integer",
  "completed_requests": "integer",
  "failed_requests": "integer",
  "average_response_time": "float (ms)",
  "p95_response_time": "float (ms)",
  "p99_response_time": "float (ms)",
  "gpu_utilization": {
    "gpu_id": {
      "memory_utilization": "float (0-1)",
      "compute_utilization": "float (0-1)",
      "temperature": "float (Celsius)",
      "active_requests": "integer",
      "queued_requests": "integer"
    }
  },
  "user_metrics": {
    "user_id": {
      "total_requests": "integer",
      "active_requests": "integer",
      "completed_requests": "integer",
      "failed_requests": "integer",
      "average_response_time": "float (ms)",
      "gpu_usage": "float (0-1)"
    }
  }
}
```

**Durum Kodları:**
- `200 OK`: Metrikler başarıyla alındı

## 3. Veri Modelleri

### 3.1 İstek (Request)

```json
{
  "request_id": "string (UUID)",
  "user_id": "string",
  "model_id": "string",
  "priority": "integer (1-5)",
  "type": "string (inference, training, fine-tuning, etc.)",
  "resource_requirements": {
    "memory": "integer (MB)",
    "compute_units": "integer",
    "max_batch_size": "integer",
    "expected_duration": "integer (ms)"
  },
  "timeout": "integer (ms)",
  "callback_url": "string (URL, optional)",
  "payload": "object",
  "status": "string (pending, queued, processing, completed, failed, cancelled)",
  "gpu_id": "string (optional)",
  "submission_time": "string (ISO 8601)",
  "start_time": "string (ISO 8601, optional)",
  "completion_time": "string (ISO 8601, optional)",
  "queue_position": "integer",
  "progress": "float (0-1)",
  "result": "object (optional)",
  "error": "string (optional)"
}
```

### 3.2 GPU Durumu (GPU State)

```json
{
  "gpu_id": "string",
  "name": "string",
  "status": "string (available, busy, error, maintenance)",
  "compute_capability": "string",
  "memory_total": "integer (bytes)",
  "memory_used": "integer (bytes)",
  "memory_free": "integer (bytes)",
  "utilization": "float (0-1)",
  "temperature": "float (Celsius)",
  "power_usage": "float (Watts)",
  "power_limit": "float (Watts)",
  "active_requests": [
    {
      "request_id": "string (UUID)",
      "user_id": "string",
      "model_id": "string",
      "start_time": "string (ISO 8601)",
      "progress": "float (0-1)"
    }
  ],
  "queued_requests": "integer",
  "performance_index": "float (0-1)",
  "error_rate": "float (0-1)",
  "uptime": "integer (seconds)",
  "processes": [
    {
      "pid": "integer",
      "name": "string",
      "memory_used": "integer (bytes)"
    }
  ]
}
```

### 3.3 Kullanıcı Kotası (User Quota)

```json
{
  "user_id": "string",
  "gpu_limit": "integer",
  "gpu_usage": "integer",
  "request_limit": "integer",
  "request_count": "integer",
  "priority_limit": "integer (1-5)",
  "expiration_time": "string (ISO 8601, optional)"
}
```

## 4. Entegrasyon Noktaları

### 4.1 AI Orchestrator Entegrasyonu

GPU İstek Yönlendirme Katmanı, AI Orchestrator ile aşağıdaki noktalarda entegre olacaktır:

1. **İstek Alımı:** AI Orchestrator'dan gelen istekleri kabul etme
2. **İstek Yönlendirme:** İstekleri uygun GPU'lara yönlendirme
3. **Durum Bildirimi:** İstek durumlarını AI Orchestrator'a bildirme
4. **Sonuç Döndürme:** İşlem sonuçlarını AI Orchestrator'a döndürme

### 4.2 GPU Monitoring System Entegrasyonu

GPU İstek Yönlendirme Katmanı, GPU Monitoring System ile aşağıdaki noktalarda entegre olacaktır:

1. **GPU Durumu:** GPU'ların durumunu ve kullanım oranlarını alma
2. **Sağlık Metrikleri:** GPU'ların sıcaklık, güç tüketimi gibi sağlık metriklerini alma
3. **Performans Metrikleri:** GPU'ların performans metriklerini alma

### 4.3 Logging and Monitoring System Entegrasyonu

GPU İstek Yönlendirme Katmanı, Logging and Monitoring System ile aşağıdaki noktalarda entegre olacaktır:

1. **Log Gönderimi:** Sistem loglarını gönderme
2. **Metrik Gönderimi:** Performans metriklerini gönderme
3. **Uyarı Gönderimi:** Belirlenen eşik değerleri aşıldığında uyarı gönderme
