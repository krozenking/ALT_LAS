# ALT_LAS Chat Botu API Dokümantasyonu

Bu dokümantasyon, ALT_LAS Chat Botu arayüzünün kullandığı API'leri açıklar.

## İçindekiler

1. [Genel Bilgiler](#genel-bilgiler)
2. [Kimlik Doğrulama](#kimlik-doğrulama)
3. [Kullanıcı API'leri](#kullanıcı-apileri)
4. [Konuşma API'leri](#konuşma-apileri)
5. [Mesaj API'leri](#mesaj-apileri)
6. [Dosya API'leri](#dosya-apileri)
7. [AI API'leri](#ai-apileri)
8. [Bildirim API'leri](#bildirim-apileri)
9. [Hata Kodları](#hata-kodları)

## Genel Bilgiler

### Temel URL

```
https://api.altlas.com/api
```

### İstek Formatı

Tüm istekler JSON formatında gönderilmelidir:

```
Content-Type: application/json
```

### Yanıt Formatı

Tüm yanıtlar JSON formatında döner:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Hata durumunda:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Kimlik Doğrulama

### Oturum Açma

```
POST /auth/login
```

İstek:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-1",
      "name": "Test User",
      "email": "user@example.com",
      "avatar": null,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "error": null
}
```

### Oturum Kapatma

```
POST /auth/logout
```

Yanıt:

```json
{
  "success": true,
  "data": null,
  "error": null
}
```

### Misafir Kullanıcı Oluşturma

```
POST /auth/guest
```

İstek:

```json
{
  "name": "Guest User"
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "guest-1",
      "name": "Guest User",
      "email": null,
      "avatar": null,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "error": null
}
```

## Kullanıcı API'leri

### Mevcut Kullanıcıyı Al

```
GET /users/me
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "user-1",
    "name": "Test User",
    "email": "user@example.com",
    "avatar": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "error": null
}
```

### Kullanıcı Güncelle

```
PUT /users/me
```

İstek:

```json
{
  "name": "Updated Name",
  "avatar": "data:image/jpeg;base64,..."
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "user-1",
    "name": "Updated Name",
    "email": "user@example.com",
    "avatar": "https://example.com/avatars/user-1.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "error": null
}
```

## Konuşma API'leri

### Konuşmaları Listele

```
GET /conversations
```

Yanıt:

```json
{
  "success": true,
  "data": [
    {
      "id": "conv-1",
      "title": "Türkiye Hakkında Sorular",
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-01T12:01:30.000Z"
    },
    {
      "id": "conv-2",
      "title": "Boş Konuşma",
      "createdAt": "2025-01-02T10:00:00.000Z",
      "updatedAt": "2025-01-02T10:00:00.000Z"
    }
  ],
  "error": null
}
```

### Konuşma Detayı

```
GET /conversations/:id
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "conv-1",
    "title": "Türkiye Hakkında Sorular",
    "messages": [
      {
        "id": "msg-1",
        "content": "Merhaba, nasıl yardımcı olabilirim?",
        "sender": "ai",
        "timestamp": "2025-01-01T12:00:00.000Z",
        "status": "delivered"
      },
      {
        "id": "msg-2",
        "content": "Türkiye'nin başkenti neresidir?",
        "sender": "user",
        "timestamp": "2025-01-01T12:01:00.000Z",
        "status": "delivered"
      },
      {
        "id": "msg-3",
        "content": "Türkiye'nin başkenti Ankara'dır.",
        "sender": "ai",
        "timestamp": "2025-01-01T12:01:30.000Z",
        "status": "delivered"
      }
    ],
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:01:30.000Z"
  },
  "error": null
}
```

### Yeni Konuşma Oluştur

```
POST /conversations
```

İstek:

```json
{
  "title": "Yeni Konuşma"
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "conv-3",
    "title": "Yeni Konuşma",
    "messages": [],
    "createdAt": "2025-01-03T10:00:00.000Z",
    "updatedAt": "2025-01-03T10:00:00.000Z"
  },
  "error": null
}
```

### Konuşma Güncelle

```
PUT /conversations/:id
```

İstek:

```json
{
  "title": "Güncellenmiş Konuşma Başlığı"
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "conv-1",
    "title": "Güncellenmiş Konuşma Başlığı",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-03T15:00:00.000Z"
  },
  "error": null
}
```

### Konuşma Sil

```
DELETE /conversations/:id
```

Yanıt:

```json
{
  "success": true,
  "data": null,
  "error": null
}
```

## Mesaj API'leri

### Mesaj Gönder

```
POST /conversations/:id/messages
```

İstek:

```json
{
  "content": "Merhaba, dünya!",
  "sender": "user"
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "msg-4",
    "content": "Merhaba, dünya!",
    "sender": "user",
    "timestamp": "2025-01-03T16:00:00.000Z",
    "status": "delivered"
  },
  "error": null
}
```

### Dosya ile Mesaj Gönder

```
POST /conversations/:id/messages
```

İstek (multipart/form-data):

```
content: "Dosya gönderiyorum."
sender: "user"
file: [binary data]
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "msg-5",
    "content": "Dosya gönderiyorum.",
    "sender": "user",
    "timestamp": "2025-01-03T16:05:00.000Z",
    "status": "delivered",
    "metadata": {
      "file": {
        "id": "file-1",
        "name": "test.txt",
        "type": "text/plain",
        "size": 1024,
        "url": "https://example.com/files/test.txt"
      }
    }
  },
  "error": null
}
```

### Ses ile Mesaj Gönder

```
POST /conversations/:id/messages
```

İstek (multipart/form-data):

```
content: "Sesli mesaj gönderiyorum."
sender: "user"
audio: [binary data]
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "msg-6",
    "content": "Sesli mesaj gönderiyorum.",
    "sender": "user",
    "timestamp": "2025-01-03T16:10:00.000Z",
    "status": "delivered",
    "metadata": {
      "audio": {
        "id": "audio-1",
        "duration": 5,
        "url": "https://example.com/audio/test.mp3"
      }
    }
  },
  "error": null
}
```

## Dosya API'leri

### Dosya Yükle

```
POST /files
```

İstek (multipart/form-data):

```
file: [binary data]
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "file-2",
    "name": "image.jpg",
    "type": "image/jpeg",
    "size": 102400,
    "url": "https://example.com/files/image.jpg"
  },
  "error": null
}
```

### Dosya İndir

```
GET /files/:id
```

Yanıt: Dosya içeriği

## AI API'leri

### AI Yanıtı Al

```
POST /ai/generate
```

İstek:

```json
{
  "prompt": "Türkiye'nin başkenti neresidir?",
  "model": "openai-gpt4",
  "conversationId": "conv-1",
  "maxTokens": 1000
}
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "response": "Türkiye'nin başkenti Ankara'dır.",
    "model": "openai-gpt4",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 8,
      "totalTokens": 18
    }
  },
  "error": null
}
```

### AI Yanıtı Akışı

```
POST /ai/stream
```

İstek:

```json
{
  "prompt": "Türkiye'nin başkenti neresidir?",
  "model": "openai-gpt4",
  "conversationId": "conv-1",
  "maxTokens": 1000
}
```

Yanıt: Server-Sent Events (SSE) akışı

```
event: token
data: {"token": "Türkiye"}

event: token
data: {"token": "'nin"}

event: token
data: {"token": " başkenti"}

event: token
data: {"token": " Ankara"}

event: token
data: {"token": "'dır."}

event: done
data: {"usage": {"promptTokens": 10, "completionTokens": 8, "totalTokens": 18}}
```

### Kullanılabilir AI Modelleri

```
GET /ai/models
```

Yanıt:

```json
{
  "success": true,
  "data": [
    {
      "id": "openai-gpt4",
      "name": "GPT-4",
      "provider": "OpenAI",
      "maxTokens": 8192,
      "capabilities": ["text", "image", "code"]
    },
    {
      "id": "anthropic-claude",
      "name": "Claude",
      "provider": "Anthropic",
      "maxTokens": 100000,
      "capabilities": ["text", "code"]
    }
  ],
  "error": null
}
```

## Bildirim API'leri

### Bildirimleri Listele

```
GET /notifications
```

Yanıt:

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-1",
      "type": "message",
      "title": "Yeni mesaj",
      "content": "AI'dan yeni bir mesaj aldınız.",
      "read": false,
      "timestamp": "2025-01-03T16:15:00.000Z",
      "metadata": {
        "conversationId": "conv-1",
        "messageId": "msg-7"
      }
    },
    {
      "id": "notif-2",
      "type": "system",
      "title": "Sistem güncellemesi",
      "content": "Sistem başarıyla güncellendi.",
      "read": true,
      "timestamp": "2025-01-03T12:00:00.000Z",
      "metadata": null
    }
  ],
  "error": null
}
```

### Bildirimi Okundu İşaretle

```
PUT /notifications/:id/read
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "id": "notif-1",
    "read": true
  },
  "error": null
}
```

### Tüm Bildirimleri Okundu İşaretle

```
PUT /notifications/read-all
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "count": 5
  },
  "error": null
}
```

### Bildirimi Sil

```
DELETE /notifications/:id
```

Yanıt:

```json
{
  "success": true,
  "data": null,
  "error": null
}
```

### Tüm Bildirimleri Sil

```
DELETE /notifications
```

Yanıt:

```json
{
  "success": true,
  "data": {
    "count": 10
  },
  "error": null
}
```

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `AUTH_REQUIRED` | Kimlik doğrulama gerekli |
| `INVALID_CREDENTIALS` | Geçersiz kimlik bilgileri |
| `TOKEN_EXPIRED` | Token süresi doldu |
| `PERMISSION_DENIED` | İzin reddedildi |
| `RESOURCE_NOT_FOUND` | Kaynak bulunamadı |
| `INVALID_REQUEST` | Geçersiz istek |
| `RATE_LIMIT_EXCEEDED` | Hız sınırı aşıldı |
| `SERVER_ERROR` | Sunucu hatası |
| `FILE_TOO_LARGE` | Dosya çok büyük |
| `UNSUPPORTED_FILE_TYPE` | Desteklenmeyen dosya türü |
| `AI_MODEL_ERROR` | AI modeli hatası |
