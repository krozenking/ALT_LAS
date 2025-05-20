# ALT_LAS Chat API Dokümantasyonu

## İçindekiler

1. [Giriş](#giriş)
2. [Kimlik Doğrulama](#kimlik-doğrulama)
3. [Kullanıcılar](#kullanıcılar)
4. [Sohbetler](#sohbetler)
5. [Mesajlar](#mesajlar)
6. [Dosyalar](#dosyalar)
7. [Bildirimler](#bildirimler)
8. [WebSocket Olayları](#websocket-olayları)
9. [Hata Kodları](#hata-kodları)
10. [Sınırlamalar](#sınırlamalar)

## Giriş

ALT_LAS Chat API, ALT_LAS Chat uygulamasının backend ile iletişim kurmasını sağlayan RESTful API'dir. API, JSON formatında veri alışverişi yapar ve JWT tabanlı kimlik doğrulama kullanır.

### Temel URL

```
https://api.altlas.com/v1
```

### İstek Formatı

Tüm istekler JSON formatında gönderilmelidir. İstek başlıkları aşağıdaki gibi olmalıdır:

```
Content-Type: application/json
Authorization: Bearer <token>
```

### Yanıt Formatı

Tüm yanıtlar JSON formatında döndürülür. Başarılı yanıtlar aşağıdaki yapıya sahiptir:

```json
{
  "success": true,
  "data": { ... }
}
```

Hata yanıtları aşağıdaki yapıya sahiptir:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Kimlik Doğrulama

### Giriş

```
POST /auth/login
```

#### İstek

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "status": "online"
    }
  }
}
```

### Çıkış

```
POST /auth/logout
```

#### İstek

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Token Yenileme

```
POST /auth/refresh
```

#### İstek

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Kullanıcılar

### Kullanıcı Listesi

```
GET /users
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar1.jpg",
        "status": "online"
      },
      {
        "id": "2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://example.com/avatar2.jpg",
        "status": "offline"
      }
    ]
  }
}
```

### Kullanıcı Detayları

```
GET /users/:id
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar1.jpg",
      "status": "online",
      "lastSeen": "2023-05-15T14:30:00Z"
    }
  }
}
```

### Kullanıcı Güncelleme

```
PUT /users/:id
```

#### İstek

```json
{
  "name": "John Smith",
  "avatar": "https://example.com/new-avatar.jpg",
  "status": "away"
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "John Smith",
      "email": "john@example.com",
      "avatar": "https://example.com/new-avatar.jpg",
      "status": "away"
    }
  }
}
```

### Kullanıcı Arama

```
GET /users/search?query=john
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar1.jpg",
        "status": "online"
      },
      {
        "id": "3",
        "name": "Johnny Walker",
        "email": "johnny@example.com",
        "avatar": "https://example.com/avatar3.jpg",
        "status": "offline"
      }
    ]
  }
}
```

## Sohbetler

### Sohbet Listesi

```
GET /conversations
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "1",
        "type": "direct",
        "participants": ["1", "2"],
        "lastMessage": {
          "id": "101",
          "text": "Hello!",
          "senderId": "2",
          "timestamp": "2023-05-15T14:30:00Z"
        },
        "unreadCount": 0,
        "updatedAt": "2023-05-15T14:30:00Z"
      },
      {
        "id": "2",
        "type": "group",
        "name": "Project Team",
        "participants": ["1", "2", "3"],
        "avatar": "https://example.com/group1.jpg",
        "lastMessage": {
          "id": "201",
          "text": "Meeting tomorrow",
          "senderId": "3",
          "timestamp": "2023-05-15T15:00:00Z"
        },
        "unreadCount": 2,
        "updatedAt": "2023-05-15T15:00:00Z"
      }
    ]
  }
}
```

### Sohbet Detayları

```
GET /conversations/:id
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "1",
      "type": "direct",
      "participants": [
        {
          "id": "1",
          "name": "John Doe",
          "avatar": "https://example.com/avatar1.jpg",
          "status": "online"
        },
        {
          "id": "2",
          "name": "Jane Smith",
          "avatar": "https://example.com/avatar2.jpg",
          "status": "offline"
        }
      ],
      "createdAt": "2023-05-10T10:00:00Z",
      "updatedAt": "2023-05-15T14:30:00Z"
    }
  }
}
```

### Sohbet Oluşturma

```
POST /conversations
```

#### İstek

```json
{
  "type": "direct",
  "participants": ["2"]
}
```

veya

```json
{
  "type": "group",
  "name": "Project Team",
  "participants": ["2", "3", "4"],
  "avatar": "https://example.com/group1.jpg"
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "3",
      "type": "group",
      "name": "Project Team",
      "participants": ["1", "2", "3", "4"],
      "avatar": "https://example.com/group1.jpg",
      "createdAt": "2023-05-16T10:00:00Z",
      "updatedAt": "2023-05-16T10:00:00Z"
    }
  }
}
```

### Sohbet Güncelleme

```
PUT /conversations/:id
```

#### İstek

```json
{
  "name": "New Project Team",
  "avatar": "https://example.com/new-group.jpg"
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "3",
      "type": "group",
      "name": "New Project Team",
      "participants": ["1", "2", "3", "4"],
      "avatar": "https://example.com/new-group.jpg",
      "updatedAt": "2023-05-16T11:00:00Z"
    }
  }
}
```

### Sohbete Katılımcı Ekleme

```
POST /conversations/:id/participants
```

#### İstek

```json
{
  "participants": ["5", "6"]
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "3",
      "type": "group",
      "name": "New Project Team",
      "participants": ["1", "2", "3", "4", "5", "6"],
      "avatar": "https://example.com/new-group.jpg",
      "updatedAt": "2023-05-16T12:00:00Z"
    }
  }
}
```

### Sohbetten Katılımcı Çıkarma

```
DELETE /conversations/:id/participants/:userId
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "3",
      "type": "group",
      "name": "New Project Team",
      "participants": ["1", "2", "3", "4", "5"],
      "avatar": "https://example.com/new-group.jpg",
      "updatedAt": "2023-05-16T13:00:00Z"
    }
  }
}
```

### Sohbetten Ayrılma

```
DELETE /conversations/:id/leave
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "message": "Left conversation successfully"
  }
}
```

## Mesajlar

### Mesaj Listesi

```
GET /conversations/:id/messages?limit=20&before=2023-05-15T14:30:00Z
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "101",
        "text": "Hello!",
        "senderId": "2",
        "conversationId": "1",
        "timestamp": "2023-05-15T14:30:00Z",
        "status": "read",
        "attachments": []
      },
      {
        "id": "100",
        "text": "Hi there!",
        "senderId": "1",
        "conversationId": "1",
        "timestamp": "2023-05-15T14:29:00Z",
        "status": "read",
        "attachments": []
      }
    ],
    "hasMore": true
  }
}
```

### Mesaj Gönderme

```
POST /conversations/:id/messages
```

#### İstek

```json
{
  "text": "Hello, how are you?",
  "attachments": []
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "102",
      "text": "Hello, how are you?",
      "senderId": "1",
      "conversationId": "1",
      "timestamp": "2023-05-16T10:00:00Z",
      "status": "sent",
      "attachments": []
    }
  }
}
```

### Mesaj Düzenleme

```
PUT /conversations/:id/messages/:messageId
```

#### İstek

```json
{
  "text": "Hello, how are you today?"
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "102",
      "text": "Hello, how are you today?",
      "senderId": "1",
      "conversationId": "1",
      "timestamp": "2023-05-16T10:00:00Z",
      "editedAt": "2023-05-16T10:05:00Z",
      "status": "sent",
      "attachments": []
    }
  }
}
```

### Mesaj Silme

```
DELETE /conversations/:id/messages/:messageId
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "message": "Message deleted successfully"
  }
}
```

### Mesaj Arama

```
GET /conversations/:id/messages/search?query=hello
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "102",
        "text": "Hello, how are you today?",
        "senderId": "1",
        "conversationId": "1",
        "timestamp": "2023-05-16T10:00:00Z",
        "editedAt": "2023-05-16T10:05:00Z",
        "status": "sent",
        "attachments": []
      },
      {
        "id": "101",
        "text": "Hello!",
        "senderId": "2",
        "conversationId": "1",
        "timestamp": "2023-05-15T14:30:00Z",
        "status": "read",
        "attachments": []
      }
    ]
  }
}
```

## Dosyalar

### Dosya Yükleme

```
POST /files/upload
```

#### İstek

Multipart form data:

```
file: [binary data]
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "f1",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1024000,
      "url": "https://example.com/files/document.pdf",
      "thumbnailUrl": null,
      "uploadedAt": "2023-05-16T14:00:00Z"
    }
  }
}
```

### Resim Yükleme

```
POST /files/upload/image
```

#### İstek

Multipart form data:

```
file: [binary data]
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "f2",
      "name": "image.jpg",
      "type": "image/jpeg",
      "size": 512000,
      "url": "https://example.com/files/image.jpg",
      "thumbnailUrl": "https://example.com/files/image_thumb.jpg",
      "width": 1920,
      "height": 1080,
      "uploadedAt": "2023-05-16T14:30:00Z"
    }
  }
}
```

## Bildirimler

### Bildirim Listesi

```
GET /notifications
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "n1",
        "type": "message",
        "senderId": "2",
        "conversationId": "1",
        "message": "Jane sent you a message",
        "read": false,
        "timestamp": "2023-05-16T15:00:00Z"
      },
      {
        "id": "n2",
        "type": "group_invite",
        "senderId": "3",
        "conversationId": "3",
        "message": "You were added to New Project Team",
        "read": true,
        "timestamp": "2023-05-16T14:00:00Z"
      }
    ]
  }
}
```

### Bildirimi Okundu Olarak İşaretleme

```
PUT /notifications/:id/read
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "notification": {
      "id": "n1",
      "read": true
    }
  }
}
```

### Tüm Bildirimleri Okundu Olarak İşaretleme

```
PUT /notifications/read-all
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "message": "All notifications marked as read"
  }
}
```

### Bildirim Ayarları

```
GET /notifications/settings
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "settings": {
      "email": true,
      "push": true,
      "sound": true,
      "desktop": true,
      "mentions": true
    }
  }
}
```

### Bildirim Ayarlarını Güncelleme

```
PUT /notifications/settings
```

#### İstek

```json
{
  "email": false,
  "push": true,
  "sound": false,
  "desktop": true,
  "mentions": true
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "settings": {
      "email": false,
      "push": true,
      "sound": false,
      "desktop": true,
      "mentions": true
    }
  }
}
```

## WebSocket Olayları

ALT_LAS Chat, gerçek zamanlı iletişim için WebSocket kullanır. WebSocket bağlantısı aşağıdaki URL üzerinden kurulur:

```
wss://api.altlas.com/v1/ws
```

### Kimlik Doğrulama

WebSocket bağlantısı kurulduktan sonra, kimlik doğrulama için aşağıdaki olayı göndermeniz gerekir:

```json
{
  "event": "auth",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Olaylar

#### Mesaj Alındı

```json
{
  "event": "message",
  "data": {
    "message": {
      "id": "103",
      "text": "How's it going?",
      "senderId": "2",
      "conversationId": "1",
      "timestamp": "2023-05-16T16:00:00Z",
      "status": "sent",
      "attachments": []
    }
  }
}
```

#### Mesaj Durumu Güncellendi

```json
{
  "event": "message_status",
  "data": {
    "messageId": "103",
    "status": "delivered",
    "conversationId": "1"
  }
}
```

#### Kullanıcı Durumu Değişti

```json
{
  "event": "user_status",
  "data": {
    "userId": "2",
    "status": "online",
    "lastSeen": "2023-05-16T16:00:00Z"
  }
}
```

#### Kullanıcı Yazıyor

```json
{
  "event": "typing",
  "data": {
    "userId": "2",
    "conversationId": "1",
    "isTyping": true
  }
}
```

#### Yeni Sohbet

```json
{
  "event": "conversation_created",
  "data": {
    "conversation": {
      "id": "4",
      "type": "direct",
      "participants": ["1", "5"],
      "createdAt": "2023-05-16T17:00:00Z",
      "updatedAt": "2023-05-16T17:00:00Z"
    }
  }
}
```

#### Sohbet Güncellendi

```json
{
  "event": "conversation_updated",
  "data": {
    "conversation": {
      "id": "3",
      "name": "Updated Project Team",
      "avatar": "https://example.com/updated-group.jpg",
      "updatedAt": "2023-05-16T17:30:00Z"
    }
  }
}
```

#### Yeni Bildirim

```json
{
  "event": "notification",
  "data": {
    "notification": {
      "id": "n3",
      "type": "message",
      "senderId": "5",
      "conversationId": "4",
      "message": "Alex sent you a message",
      "read": false,
      "timestamp": "2023-05-16T17:00:00Z"
    }
  }
}
```

### Olaylar Gönderme

#### Yazıyor Bildirimi

```json
{
  "event": "typing",
  "data": {
    "conversationId": "1",
    "isTyping": true
  }
}
```

#### Mesaj Durumu Güncelleme

```json
{
  "event": "message_status",
  "data": {
    "messageId": "103",
    "status": "read",
    "conversationId": "1"
  }
}
```

## Hata Kodları

| Kod | Açıklama |
| --- | --- |
| `AUTH_INVALID_CREDENTIALS` | Geçersiz kimlik bilgileri |
| `AUTH_TOKEN_EXPIRED` | Token süresi doldu |
| `AUTH_TOKEN_INVALID` | Geçersiz token |
| `AUTH_UNAUTHORIZED` | Yetkisiz erişim |
| `RESOURCE_NOT_FOUND` | Kaynak bulunamadı |
| `RESOURCE_ALREADY_EXISTS` | Kaynak zaten mevcut |
| `VALIDATION_ERROR` | Doğrulama hatası |
| `SERVER_ERROR` | Sunucu hatası |
| `RATE_LIMIT_EXCEEDED` | Hız sınırı aşıldı |
| `FILE_TOO_LARGE` | Dosya boyutu çok büyük |
| `FILE_TYPE_NOT_SUPPORTED` | Dosya türü desteklenmiyor |

## Sınırlamalar

- Maksimum mesaj uzunluğu: 4000 karakter
- Maksimum dosya boyutu: 50 MB
- Maksimum resim boyutu: 20 MB
- Desteklenen dosya türleri: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, zip, rar
- Desteklenen resim türleri: jpg, jpeg, png, gif, webp
- Hız sınırı: 100 istek/dakika
- WebSocket bağlantı süresi: 24 saat (sonra yeniden bağlanma gerekir)
