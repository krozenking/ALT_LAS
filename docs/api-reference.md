# ALT_LAS API Referansı

Bu belge, ALT_LAS sisteminin API'lerini detaylandırmaktadır. Tüm servisler arasındaki iletişim bu API'ler üzerinden gerçekleşir.

## API Gateway Endpoints

### Kimlik Doğrulama

#### POST /api/auth/login

Kullanıcı girişi yapar ve JWT token döndürür.

**İstek:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Yanıt:**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "role": "string"
  }
}
```

#### POST /api/auth/refresh

Token yenileme.

**İstek:**
```json
{
  "refresh_token": "string"
}
```

**Yanıt:**
```json
{
  "token": "string"
}
```

### Komut İşleme

#### POST /api/command

Yeni bir komut gönderir.

**İstek:**
```json
{
  "task": "string",
  "mode": "normal|dream|explore|chaos",
  "chaos_level": 0-4,
  "persona": "string",
  "variables": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Yanıt:**
```json
{
  "command_id": "string",
  "status": "processing",
  "alt_file_id": "string"
}
```

#### GET /api/command/{command_id}

Komut durumunu sorgular.

**Yanıt:**
```json
{
  "command_id": "string",
  "status": "processing|completed|failed",
  "alt_file_id": "string",
  "last_file_id": "string",
  "result": {
    "success": true,
    "data": {}
  }
}
```

### Alt Dosya Yönetimi

#### GET /api/alt/{alt_id}

Alt dosyasını getirir.

**Yanıt:**
```json
{
  "id": "string",
  "task": "string",
  "mode": "string",
  "chaos_level": 0,
  "persona": "string",
  "variables": {},
  "created_at": "string"
}
```

#### GET /api/alt/list

Alt dosyalarını listeler.

**Yanıt:**
```json
{
  "items": [
    {
      "id": "string",
      "task": "string",
      "created_at": "string"
    }
  ],
  "total": 0,
  "page": 0,
  "page_size": 0
}
```

### Last Dosya Yönetimi

#### GET /api/last/{last_id}

Last dosyasını getirir.

**Yanıt:**
```json
{
  "id": "string",
  "alt_id": "string",
  "result": {},
  "success_rate": 0,
  "created_at": "string"
}
```

#### GET /api/last/list

Last dosyalarını listeler.

**Yanıt:**
```json
{
  "items": [
    {
      "id": "string",
      "alt_id": "string",
      "success_rate": 0,
      "created_at": "string"
    }
  ],
  "total": 0,
  "page": 0,
  "page_size": 0
}
```

### Atlas Arşiv Yönetimi

#### GET /api/atlas/{atlas_id}

Atlas kaydını getirir.

**Yanıt:**
```json
{
  "id": "string",
  "last_id": "string",
  "alt_id": "string",
  "metadata": {},
  "created_at": "string"
}
```

#### GET /api/atlas/list

Atlas kayıtlarını listeler.

**Yanıt:**
```json
{
  "items": [
    {
      "id": "string",
      "last_id": "string",
      "alt_id": "string",
      "created_at": "string"
    }
  ],
  "total": 0,
  "page": 0,
  "page_size": 0
}
```

#### GET /api/atlas/search

Atlas kayıtlarında arama yapar.

**İstek Parametreleri:**
- `query`: Arama sorgusu
- `page`: Sayfa numarası
- `page_size`: Sayfa boyutu

**Yanıt:**
```json
{
  "items": [
    {
      "id": "string",
      "last_id": "string",
      "alt_id": "string",
      "relevance": 0,
      "created_at": "string"
    }
  ],
  "total": 0,
  "page": 0,
  "page_size": 0
}
```

## Segmentation Service API

### POST /segment

Komutu segmentlere ayırır ve alt dosyası oluşturur.

**İstek:**
```json
{
  "task": "string",
  "mode": "normal|dream|explore|chaos",
  "chaos_level": 0-4,
  "persona": "string",
  "variables": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Yanıt:**
```json
{
  "alt_id": "string",
  "segments": [
    {
      "id": "string",
      "type": "string",
      "content": "string",
      "metadata": {}
    }
  ]
}
```

## Runner Service API

### POST /run

Alt dosyasını işler ve last dosyası oluşturur.

**İstek:**
```json
{
  "alt_id": "string",
  "segments": [
    {
      "id": "string",
      "type": "string",
      "content": "string",
      "metadata": {}
    }
  ]
}
```

**Yanıt:**
```json
{
  "last_id": "string",
  "results": [
    {
      "segment_id": "string",
      "success": true,
      "output": "string",
      "error": "string"
    }
  ],
  "success_rate": 0
}
```

## Archive Service API

### POST /archive

Last dosyasını arşivler ve atlas kaydı oluşturur.

**İstek:**
```json
{
  "last_id": "string",
  "alt_id": "string",
  "results": [
    {
      "segment_id": "string",
      "success": true,
      "output": "string",
      "error": "string"
    }
  ],
  "success_rate": 0
}
```

**Yanıt:**
```json
{
  "atlas_id": "string",
  "archived": true
}
```

## OS Integration API

### POST /os/execute

İşletim sistemi komutunu çalıştırır.

**İstek:**
```json
{
  "command": "string",
  "args": ["string"],
  "timeout": 0
}
```

**Yanıt:**
```json
{
  "success": true,
  "output": "string",
  "error": "string",
  "exit_code": 0
}
```

### GET /os/info

İşletim sistemi bilgilerini getirir.

**Yanıt:**
```json
{
  "os_type": "string",
  "os_version": "string",
  "hostname": "string",
  "username": "string",
  "cpu_usage": 0,
  "memory_usage": 0,
  "disk_usage": 0
}
```

### POST /os/file/read

Dosya okur.

**İstek:**
```json
{
  "path": "string",
  "encoding": "string"
}
```

**Yanıt:**
```json
{
  "success": true,
  "content": "string",
  "error": "string"
}
```

### POST /os/file/write

Dosya yazar.

**İstek:**
```json
{
  "path": "string",
  "content": "string",
  "encoding": "string",
  "append": false
}
```

**Yanıt:**
```json
{
  "success": true,
  "error": "string"
}
```

## AI Orchestrator API

### POST /ai/process

Metni işler ve AI yanıtı döndürür.

**İstek:**
```json
{
  "text": "string",
  "model": "string",
  "parameters": {
    "temperature": 0,
    "max_tokens": 0
  }
}
```

**Yanıt:**
```json
{
  "response": "string",
  "model_used": "string",
  "tokens": 0,
  "processing_time": 0
}
```

### POST /ai/vision

Görüntüyü işler ve analiz sonuçlarını döndürür.

**İstek:**
```json
{
  "image_data": "base64 string",
  "tasks": ["object_detection", "ocr", "classification"],
  "parameters": {}
}
```

**Yanıt:**
```json
{
  "results": {
    "object_detection": [],
    "ocr": "",
    "classification": []
  },
  "processing_time": 0
}
```

### POST /ai/speech

Ses dosyasını işler ve metin döndürür.

**İstek:**
```json
{
  "audio_data": "base64 string",
  "parameters": {
    "language": "string"
  }
}
```

**Yanıt:**
```json
{
  "text": "string",
  "confidence": 0,
  "processing_time": 0
}
```

## Veri Formatları

### Alt Dosya Formatı

```yaml
dosya_tipi: "alt"
id: "alt-uuid"
task: "string"
mode: "normal|dream|explore|chaos"
chaos_level: 0-4
persona: "string"
variables:
  key1: "value1"
  key2: "value2"
segments:
  - id: "segment-uuid"
    type: "string"
    content: "string"
    metadata: {}
created_at: "ISO datetime"
```

### Last Dosya Formatı

```yaml
dosya_tipi: "last"
id: "last-uuid"
alt_id: "alt-uuid"
results:
  - segment_id: "segment-uuid"
    success: true
    output: "string"
    error: "string"
success_rate: 0.95
created_at: "ISO datetime"
```

### Atlas Dosya Formatı

```yaml
dosya_tipi: "atlas"
id: "atlas-uuid"
last_id: "last-uuid"
alt_id: "alt-uuid"
task: "string"
mode: "string"
results:
  - segment_id: "segment-uuid"
    success: true
    output: "string"
metadata:
  tags: []
  categories: []
  performance_metrics: {}
created_at: "ISO datetime"
```

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek |
| 401 | Kimlik doğrulama hatası |
| 403 | Yetkisiz erişim |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası |
| 503 | Servis kullanılamıyor |

## Sürüm Bilgisi

Bu API dokümantasyonu ALT_LAS v1.0 için hazırlanmıştır.
