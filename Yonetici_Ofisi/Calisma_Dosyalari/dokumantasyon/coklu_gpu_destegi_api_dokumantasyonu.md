# Çoklu GPU Desteği API Dokümantasyonu

**Doküman No:** ALT_LAS-API-001  
**Versiyon:** 0.1 (Taslak)  
**Tarih:** 2025-08-05  
**Hazırlayan:** Kıdemli Backend Geliştirici (Mehmet Yılmaz)  
**İlgili Görev:** KM-2.1 - Çoklu GPU Desteği

## 1. Giriş

Bu doküman, ALT_LAS sisteminde çoklu GPU desteği için genişletilen API'yi tanımlamaktadır. Bu API, sistemin birden fazla GPU üzerinde çalışabilmesini sağlayarak, performansı ve ölçeklenebilirliği artırmayı hedeflemektedir.

### 1.1 Kapsam

Bu doküman, aşağıdaki API endpoint'lerini kapsamaktadır:

- Tahmin API'si (`/api/v1/predict`)
- Batch Tahmin API'si (`/api/v1/batch_predict`)
- Görev Durumu API'si (`/api/v1/task/<task_id>`)
- Tüm Görevler API'si (`/api/v1/tasks`)
- GPU Durumu API'si (`/api/v1/gpus`)

### 1.2 Hedef Kitle

Bu doküman, ALT_LAS API'sini kullanan geliştiriciler, sistem entegratörleri ve diğer teknik personel için hazırlanmıştır.

### 1.3 Ön Koşullar

Bu dokümandaki API'leri kullanmak için aşağıdaki ön koşulların sağlanması gerekmektedir:

- ALT_LAS sisteminin çoklu GPU desteği ile kurulmuş olması
- API erişim yetkilerine sahip olunması
- JSON formatında istek gönderebilen ve yanıt alabilecek bir HTTP istemcisi

## 2. API Genel Bakış

### 2.1 Temel URL

Tüm API endpoint'leri aşağıdaki temel URL'ye göre tanımlanmıştır:

```
https://<host>:<port>/api/v1/
```

### 2.2 Kimlik Doğrulama

API istekleri, HTTP Basic Authentication veya API anahtarı kullanılarak yetkilendirilmelidir. API anahtarı, HTTP isteğinin `Authorization` başlığında aşağıdaki formatta gönderilmelidir:

```
Authorization: Bearer <api_key>
```

### 2.3 İstek ve Yanıt Formatı

Tüm API istekleri ve yanıtları JSON formatındadır. İstek gönderirken `Content-Type` başlığı `application/json` olarak ayarlanmalıdır.

### 2.4 Hata Kodları

API, aşağıdaki HTTP durum kodlarını kullanarak hataları bildirir:

- `200 OK`: İstek başarıyla tamamlandı
- `400 Bad Request`: İstek formatı geçersiz veya eksik parametreler
- `401 Unauthorized`: Kimlik doğrulama başarısız
- `403 Forbidden`: Yetkilendirme başarısız
- `404 Not Found`: İstenen kaynak bulunamadı
- `500 Internal Server Error`: Sunucu hatası

Hata durumunda, yanıt gövdesi aşağıdaki formatta bir hata mesajı içerir:

```json
{
  "error": "Hata açıklaması"
}
```

## 3. API Endpoint'leri

### 3.1 Tahmin API'si

#### 3.1.1 Endpoint

```
POST /api/v1/predict
```

#### 3.1.2 Açıklama

Bu endpoint, metin girişi alır ve model çıktısını döndürür. Çoklu GPU desteği için genişletilmiş parametreler içerir.

#### 3.1.3 İstek Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| text | string | Evet | İşlenecek giriş metni |
| max_length | integer | Hayır | Üretilecek maksimum token sayısı (varsayılan: 128) |
| temperature | float | Hayır | Sıcaklık parametresi (0.0-1.0 arası, varsayılan: 0.7) |
| gpu_options | object | Hayır | GPU seçenekleri |

`gpu_options` nesnesi aşağıdaki alanları içerebilir:

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| strategy | string | Hayır | GPU seçim stratejisi ("round_robin", "least_loaded", "memory_optimized", "task_specific", "random") |
| specific_gpu_id | integer | Hayır | Belirli bir GPU ID'si (null ise strateji kullanılır) |
| batch_split | boolean | Hayır | Batch işlemleri bölme seçeneği (varsayılan: true) |

#### 3.1.4 Örnek İstek

```json
POST /api/v1/predict
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "text": "Sample input text",
  "max_length": 128,
  "temperature": 0.7,
  "gpu_options": {
    "strategy": "least_loaded",
    "specific_gpu_id": null,
    "batch_split": true
  }
}
```

#### 3.1.5 Yanıt

| Alan | Tip | Açıklama |
|------|-----|----------|
| task_id | string | Görev ID'si |
| gpu_id | integer | Görevi işleyen GPU ID'si |
| status | string | Görev durumu ("running", "completed", "failed", "canceled") |

#### 3.1.6 Örnek Yanıt

```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "gpu_id": 0,
  "status": "running"
}
```

### 3.2 Batch Tahmin API'si

#### 3.2.1 Endpoint

```
POST /api/v1/batch_predict
```

#### 3.2.2 Açıklama

Bu endpoint, birden fazla metin girişi alır ve model çıktılarını döndürür. Çoklu GPU desteği için genişletilmiş parametreler içerir.

#### 3.2.3 İstek Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| batch | array | Evet | İşlenecek giriş metinleri dizisi |
| gpu_options | object | Hayır | GPU seçenekleri |

`batch` dizisindeki her öğe aşağıdaki alanları içerebilir:

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| text | string | Evet | İşlenecek giriş metni |
| max_length | integer | Hayır | Üretilecek maksimum token sayısı (varsayılan: 128) |
| temperature | float | Hayır | Sıcaklık parametresi (0.0-1.0 arası, varsayılan: 0.7) |

`gpu_options` nesnesi aşağıdaki alanları içerebilir:

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| strategy | string | Hayır | GPU seçim stratejisi ("round_robin", "least_loaded", "memory_optimized", "task_specific", "random") |
| batch_split | boolean | Hayır | Batch işlemleri bölme seçeneği (varsayılan: true) |

#### 3.2.4 Örnek İstek

```json
POST /api/v1/batch_predict
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "batch": [
    {
      "text": "Sample input text 1",
      "max_length": 128,
      "temperature": 0.7
    },
    {
      "text": "Sample input text 2",
      "max_length": 256,
      "temperature": 0.5
    }
  ],
  "gpu_options": {
    "strategy": "round_robin",
    "batch_split": true
  }
}
```

#### 3.2.5 Yanıt

| Alan | Tip | Açıklama |
|------|-----|----------|
| status | string | Batch durumu ("running", "queued", "mixed", "all_distributed", "all_queued") |
| tasks | array | Görev bilgileri dizisi |

`tasks` dizisindeki her öğe aşağıdaki alanları içerir:

| Alan | Tip | Açıklama |
|------|-----|----------|
| task_id | string | Görev ID'si |
| gpu_id | integer | Görevi işleyen GPU ID'si |
| status | string | Görev durumu ("running", "completed", "failed", "canceled", "queued") |

#### 3.2.6 Örnek Yanıt

```json
{
  "status": "running",
  "tasks": [
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "gpu_id": 0,
      "status": "running"
    },
    {
      "task_id": "223e4567-e89b-12d3-a456-426614174000",
      "gpu_id": 1,
      "status": "running"
    }
  ]
}
```

### 3.3 Görev Durumu API'si

#### 3.3.1 Endpoint

```
GET /api/v1/task/<task_id>
```

#### 3.3.2 Açıklama

Bu endpoint, belirli bir görevin durumunu ve sonucunu döndürür.

#### 3.3.3 URL Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| task_id | string | Evet | Görev ID'si |

#### 3.3.4 Örnek İstek

```
GET /api/v1/task/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <api_key>
```

#### 3.3.5 Yanıt

| Alan | Tip | Açıklama |
|------|-----|----------|
| task_id | string | Görev ID'si |
| gpu_id | integer | Görevi işleyen GPU ID'si |
| status | string | Görev durumu ("running", "completed", "failed", "canceled", "queued") |
| result | object | Görev sonucu (tamamlanmış görevler için) |

`result` nesnesi aşağıdaki alanları içerebilir:

| Alan | Tip | Açıklama |
|------|-----|----------|
| text | string | Üretilen metin |
| execution_time | float | Yürütme süresi (saniye) |
| timestamp | string | Tamamlanma zamanı (ISO 8601 formatında) |

#### 3.3.6 Örnek Yanıt

```json
{
  "task_id": "123e4567-e89b-12d3-a456-426614174000",
  "gpu_id": 0,
  "status": "completed",
  "result": {
    "text": "Generated text response",
    "execution_time": 0.5,
    "timestamp": "2025-08-10T12:34:56.789Z"
  }
}
```

### 3.4 Tüm Görevler API'si

#### 3.4.1 Endpoint

```
GET /api/v1/tasks
```

#### 3.4.2 Açıklama

Bu endpoint, tüm görevlerin durumunu ve sonuçlarını döndürür.

#### 3.4.3 Sorgu Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| status | string | Hayır | Filtrelenecek görev durumu ("running", "completed", "failed", "canceled", "queued") |
| limit | integer | Hayır | Döndürülecek maksimum görev sayısı (varsayılan: 100) |
| offset | integer | Hayır | Atlanacak görev sayısı (sayfalama için, varsayılan: 0) |

#### 3.4.4 Örnek İstek

```
GET /api/v1/tasks?status=completed&limit=10
Authorization: Bearer <api_key>
```

#### 3.4.5 Yanıt

| Alan | Tip | Açıklama |
|------|-----|----------|
| tasks | object | Görev ID'lerini anahtar, görev bilgilerini değer olarak içeren nesne |

#### 3.4.6 Örnek Yanıt

```json
{
  "tasks": {
    "123e4567-e89b-12d3-a456-426614174000": {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "gpu_id": 0,
      "status": "completed",
      "result": {
        "text": "Generated text response 1",
        "execution_time": 0.5,
        "timestamp": "2025-08-10T12:34:56.789Z"
      }
    },
    "223e4567-e89b-12d3-a456-426614174000": {
      "task_id": "223e4567-e89b-12d3-a456-426614174000",
      "gpu_id": 1,
      "status": "running"
    }
  }
}
```

### 3.5 GPU Durumu API'si

#### 3.5.1 Endpoint

```
GET /api/v1/gpus
```

#### 3.5.2 Açıklama

Bu endpoint, sistemdeki tüm GPU'ların durumunu döndürür.

#### 3.5.3 Örnek İstek

```
GET /api/v1/gpus
Authorization: Bearer <api_key>
```

#### 3.5.4 Yanıt

| Alan | Tip | Açıklama |
|------|-----|----------|
| gpus | array | GPU bilgileri dizisi |

`gpus` dizisindeki her öğe aşağıdaki alanları içerir:

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | integer | GPU ID'si |
| name | string | GPU adı |
| utilization | float | GPU kullanım oranı (%) |
| memory_used | integer | Kullanılan bellek miktarı (byte) |
| memory_total | integer | Toplam bellek miktarı (byte) |
| task_count | integer | GPU üzerinde çalışan görev sayısı |

#### 3.5.5 Örnek Yanıt

```json
{
  "gpus": [
    {
      "id": 0,
      "name": "NVIDIA A100",
      "utilization": 30,
      "memory_used": 4000000000,
      "memory_total": 16000000000,
      "task_count": 2
    },
    {
      "id": 1,
      "name": "NVIDIA A100",
      "utilization": 70,
      "memory_used": 8000000000,
      "memory_total": 16000000000,
      "task_count": 3
    }
  ]
}
```

## 4. GPU Seçim Stratejileri

### 4.1 Round Robin

Round Robin stratejisi, görevleri sırayla her GPU'ya dağıtır. Bu strateji, iş yükünün GPU'lar arasında eşit dağıtılmasını sağlar.

### 4.2 En Az Yüklü

En Az Yüklü stratejisi, en düşük kullanım oranına sahip GPU'yu seçer. Bu strateji, iş yükünün GPU'lar arasında dengeli dağıtılmasını sağlar.

### 4.3 Bellek Optimizasyonlu

Bellek Optimizasyonlu strateji, görevin bellek gereksinimlerine göre en uygun GPU'yu seçer. Bu strateji, bellek yoğun görevler için uygundur.

### 4.4 Görev Tipine Özgü

Görev Tipine Özgü strateji, görev tipine göre önceden tanımlanmış GPU'ları seçer. Bu strateji, belirli görev tipleri için optimize edilmiş GPU'ları kullanmak için uygundur.

### 4.5 Rastgele

Rastgele strateji, kullanılabilir GPU'lar arasından rastgele seçim yapar. Bu strateji, basit ve hızlı bir seçim algoritması sağlar.

## 5. Konfigürasyon

Çoklu GPU desteği, sistem konfigürasyon dosyasında aşağıdaki parametrelerle yapılandırılabilir:

```yaml
gpu:
  enabled: true
  multi_gpu:
    enabled: true
    default_strategy: "least_loaded"
    strategies:
      - "round_robin"
      - "least_loaded"
      - "memory_optimized"
      - "task_specific"
      - "random"
    batch_split: true
    min_batch_size_per_gpu: 4
    max_concurrent_tasks_per_gpu: 8
    memory_threshold: 0.9
    utilization_threshold: 0.95
    task_specific_mappings:
      image_segmentation: "gpu_0"
      text_generation: "gpu_1"
```

## 6. Örnek Kullanım

### 6.1 Python İstemcisi

```python
import requests
import json

# API URL
api_url = "https://api.example.com/api/v1"

# API anahtarı
api_key = "your_api_key"

# Başlıklar
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

# Tahmin isteği
def predict(text, max_length=128, temperature=0.7, gpu_options=None):
    data = {
        "text": text,
        "max_length": max_length,
        "temperature": temperature
    }
    
    if gpu_options:
        data["gpu_options"] = gpu_options
        
    response = requests.post(f"{api_url}/predict", headers=headers, json=data)
    return response.json()

# Batch tahmin isteği
def batch_predict(batch, gpu_options=None):
    data = {
        "batch": batch
    }
    
    if gpu_options:
        data["gpu_options"] = gpu_options
        
    response = requests.post(f"{api_url}/batch_predict", headers=headers, json=data)
    return response.json()

# Görev durumu sorgulama
def get_task_status(task_id):
    response = requests.get(f"{api_url}/task/{task_id}", headers=headers)
    return response.json()

# GPU durumu sorgulama
def get_gpu_status():
    response = requests.get(f"{api_url}/gpus", headers=headers)
    return response.json()

# Örnek kullanım
if __name__ == "__main__":
    # Tahmin isteği
    result = predict(
        "Sample input text",
        max_length=128,
        temperature=0.7,
        gpu_options={
            "strategy": "least_loaded"
        }
    )
    
    print(f"Task ID: {result['task_id']}")
    print(f"GPU ID: {result['gpu_id']}")
    print(f"Status: {result['status']}")
    
    # Görev durumu sorgulama
    task_id = result['task_id']
    status = get_task_status(task_id)
    
    print(f"\nTask Status: {status['status']}")
    
    if 'result' in status:
        print(f"Result: {status['result']['text']}")
        print(f"Execution Time: {status['result']['execution_time']} seconds")
        
    # GPU durumu sorgulama
    gpu_status = get_gpu_status()
    
    print("\nGPU Status:")
    for gpu in gpu_status['gpus']:
        print(f"GPU {gpu['id']} ({gpu['name']}): {gpu['utilization']}% utilization, {gpu['task_count']} tasks")
```
