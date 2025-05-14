# ALT_LAS API Dokümantasyonu

**Versiyon:** 2.0.0  
**Son Güncelleme:** 16 Haziran 2025  
**Hazırlayan:** Mehmet Kaya (Yazılım Mühendisi)

## 1. Genel Bakış

Bu dokümantasyon, ALT_LAS projesinin API'sini açıklamaktadır. API, RESTful prensiplere göre tasarlanmıştır ve JSON formatında veri alışverişi yapar.

## 2. API Versiyonlama

ALT_LAS API'si, URL yolu ile versiyonlanmaktadır. Mevcut API versiyonu v2'dir.

```
https://api.alt-las.com/v2
```

Önceki API versiyonları (v1) hala desteklenmektedir, ancak yeni özellikler sadece v2'de mevcuttur. v1 API'si, 31 Aralık 2025 tarihinde kullanımdan kaldırılacaktır.

## 3. Kimlik Doğrulama ve Yetkilendirme

ALT_LAS API'si, JWT (JSON Web Token) tabanlı kimlik doğrulama kullanmaktadır. API'ye erişmek için aşağıdaki adımları izleyin:

1. `/auth/login` endpoint'ine kullanıcı adı ve parola ile POST isteği gönderin.
2. Yanıtta dönen `accessToken` ve `refreshToken` değerlerini saklayın.
3. Diğer API isteklerinde, `Authorization` başlığında `Bearer {accessToken}` formatında token gönderin.
4. `accessToken` süresi dolduğunda, `/auth/refresh` endpoint'ine `refreshToken` ile POST isteği göndererek yeni bir `accessToken` alın.

Örnek istek:

```http
POST /auth/login HTTP/1.1
Host: api.alt-las.com
Content-Type: application/json

{
  "username": "johndoe",
  "password": "P@ssw0rd"
}
```

Örnek yanıt:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

## 4. Hız Sınırlama

API istekleri, aşağıdaki hız sınırlamalarına tabidir:

- Anonim istekler: 60 istek/dakika
- Kimlik doğrulamalı istekler: 1000 istek/dakika

Hız sınırı aşıldığında, API 429 Too Many Requests yanıtı döndürür. Yanıtta, hız sınırı bilgileri aşağıdaki başlıklarla sağlanır:

- `X-RateLimit-Limit`: Dakika başına izin verilen istek sayısı
- `X-RateLimit-Remaining`: Mevcut dakika içinde kalan istek sayısı
- `X-RateLimit-Reset`: Hız sınırının sıfırlanacağı zaman (Unix timestamp)

## 5. Hata İşleme

API hataları, aşağıdaki formatta döndürülür:

```json
{
  "timestamp": "2025-01-01T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "path": "/api/v2/users"
}
```

Genel hata kodları:

- `400 Bad Request`: İstek parametreleri geçersiz
- `401 Unauthorized`: Kimlik doğrulama hatası
- `403 Forbidden`: Yetkisiz erişim
- `404 Not Found`: Kaynak bulunamadı
- `429 Too Many Requests`: Hız sınırı aşıldı
- `500 Internal Server Error`: Sunucu hatası

## 6. Sayfalama, Sıralama ve Filtreleme

Listeleme endpoint'leri, sayfalama, sıralama ve filtreleme parametrelerini destekler:

- `page`: Sayfa numarası (1'den başlar)
- `size`: Sayfa başına öğe sayısı (1-100 arası)
- `sort`: Sıralama alanı
- `order`: Sıralama yönü (`asc` veya `desc`)
- `filter`: Filtreleme parametreleri (alan adı ve değeri)

Örnek:

```
GET /users?page=2&size=20&sort=createdAt&order=desc&filter=role:ADMIN
```

## 7. API Endpoint'leri

### 7.1. Kimlik Doğrulama ve Yetkilendirme

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/auth/login` | POST | Kullanıcı girişi |
| `/auth/refresh` | POST | Token yenileme |
| `/auth/logout` | POST | Kullanıcı çıkışı |

### 7.2. Kullanıcı Yönetimi

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/users` | GET | Kullanıcıları listeleme |
| `/users/{id}` | GET | Kullanıcı detaylarını getirme |
| `/users` | POST | Yeni kullanıcı oluşturma |
| `/users/{id}` | PUT | Kullanıcı bilgilerini güncelleme |
| `/users/{id}` | DELETE | Kullanıcı silme |

### 7.3. Segmentasyon

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/segmentation/jobs` | POST | Segmentasyon işi oluşturma |
| `/segmentation/jobs` | GET | Segmentasyon işlerini listeleme |
| `/segmentation/jobs/{id}` | GET | Segmentasyon işi detaylarını getirme |
| `/segmentation/jobs/{id}` | DELETE | Segmentasyon işi silme |
| `/segmentation/algorithms` | GET | Segmentasyon algoritmalarını listeleme |

### 7.4. Runner

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/runner/jobs` | GET | İşleri listeleme |
| `/runner/jobs/{id}` | GET | İş detaylarını getirme |
| `/runner/jobs/{id}/cancel` | POST | İşi iptal etme |
| `/runner/jobs/{id}/restart` | POST | İşi yeniden başlatma |
| `/runner/jobs/{id}/priority` | PUT | İş önceliğini güncelleme |

### 7.5. Arşiv

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/archive/files` | GET | Arşiv dosyalarını listeleme |
| `/archive/files/{id}` | GET | Arşiv dosyası detaylarını getirme |
| `/archive/files` | POST | Arşiv dosyası yükleme |
| `/archive/files/{id}` | DELETE | Arşiv dosyası silme |
| `/archive/files/{id}/download` | GET | Arşiv dosyası indirme |

### 7.6. AI

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/ai/models` | GET | AI modellerini listeleme |
| `/ai/models/{id}` | GET | AI model detaylarını getirme |
| `/ai/models` | POST | Yeni AI model oluşturma |
| `/ai/models/{id}` | PUT | AI model bilgilerini güncelleme |
| `/ai/models/{id}` | DELETE | AI model silme |
| `/ai/models/{id}/deploy` | POST | AI modeli dağıtma |
| `/ai/models/{id}/undeploy` | POST | AI model dağıtımını kaldırma |

## 8. Swagger/OpenAPI Dokümantasyonu

API'nin tam Swagger/OpenAPI dokümantasyonu, aşağıdaki URL'lerde mevcuttur:

- Swagger UI: https://api.alt-las.com/swagger-ui.html
- OpenAPI JSON: https://api.alt-las.com/v2/api-docs
- OpenAPI YAML: https://api.alt-las.com/v2/api-docs.yaml

## 9. Örnek Kullanım Senaryoları

### 9.1. Segmentasyon İşi Oluşturma ve Sonuçları Alma

1. Kullanıcı girişi yapın ve token alın:

```http
POST /auth/login HTTP/1.1
Host: api.alt-las.com
Content-Type: application/json

{
  "username": "johndoe",
  "password": "P@ssw0rd"
}
```

2. Segmentasyon işi oluşturun:

```http
POST /segmentation/jobs HTTP/1.1
Host: api.alt-las.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "imageUrl": "https://storage.alt-las.com/images/sample.jpg",
  "algorithm": "unet",
  "parameters": {
    "threshold": 0.5,
    "classes": ["person", "car", "building"]
  },
  "priority": 5
}
```

3. İş durumunu kontrol edin:

```http
GET /segmentation/jobs/123e4567-e89b-12d3-a456-426614174000 HTTP/1.1
Host: api.alt-las.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. İş tamamlandığında sonuçları alın:

```http
GET /segmentation/jobs/123e4567-e89b-12d3-a456-426614174000/results HTTP/1.1
Host: api.alt-las.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 10. API Değişiklikleri

### v2.0.0 (15 Haziran 2025)

- API versiyonlama desteği eklendi
- Tüm endpoint'ler için Swagger/OpenAPI dokümantasyonu eklendi
- Kimlik doğrulama ve yetkilendirme mekanizması JWT tabanlı olarak yenilendi
- Hız sınırlama mekanizması iyileştirildi
- Sayfalama, sıralama ve filtreleme parametreleri standardize edildi
- Yeni segmentasyon algoritmaları eklendi
- İş önceliklendirme desteği eklendi
- Toplu segmentasyon desteği eklendi
- AI model dağıtım yönetimi eklendi

### v1.0.0 (1 Ocak 2025)

- İlk sürüm
