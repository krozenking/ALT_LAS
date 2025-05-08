# Archive Service

Archive Service, ALT_LAS platformunun sonuçları saklama ve erişim bileşenidir. Runner Service'ten gelen `*.last` dosyalarını kabul eder, doğrular, depolar ve gerektiğinde erişim sağlar.

## Temel Özellikler

- `*.last` dosyalarını kabul etme ve doğrulama
- Sonuçları veritabanında saklama
- Sonuçlara API üzerinden erişim sağlama
- `*.atlas` dosyalarını oluşturma
- Arama ve filtreleme yetenekleri

## Teknoloji Yığını

- **Dil**: Go
- **Web Framework**: Gin
- **Veritabanı**: PostgreSQL
- **Mesajlaşma**: NATS
- **Dokümantasyon**: Swagger/OpenAPI

## API Referansı

Archive Service aşağıdaki API endpoint'lerini sunar:

### Sonuç Yönetimi

- `POST /api/results`: Yeni bir sonuç (`*.last` dosyası) yükle
- `GET /api/results`: Tüm sonuçları listele
- `GET /api/results/:id`: Belirli bir sonucu getir
- `DELETE /api/results/:id`: Belirli bir sonucu sil

### Atlas Yönetimi

- `GET /api/atlas`: Tüm atlas dosyalarını listele
- `GET /api/atlas/:id`: Belirli bir atlas dosyasını getir
- `POST /api/atlas/generate`: Başarılı sonuçlardan atlas dosyası oluştur

### Arama ve Analiz

- `GET /api/search`: Sonuçlar içinde arama yap
- `GET /api/analytics`: Sonuç istatistiklerini getir

## Kurulum ve Çalıştırma

### Gereksinimler

- Go 1.18+
- PostgreSQL 14+
- NATS Server

### Yerel Geliştirme

```bash
# Bağımlılıkları yükle
go mod download

# Uygulamayı derle
go build -o archive-service

# Uygulamayı çalıştır
./archive-service
```

### Docker ile Çalıştırma

```bash
# Docker imajını oluştur
docker build -t alt_las/archive-service .

# Docker container'ını çalıştır
docker run -p 9000:9000 alt_las/archive-service
```

### Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan Değer |
|----------|----------|------------------|
| `PORT` | Servisin çalışacağı port | `9000` |
| `DATABASE_URL` | PostgreSQL bağlantı URL'i | `postgres://alt_las_user:alt_las_password@postgres_db:5432/alt_las_archive_db?sslmode=disable` |
| `NATS_URL` | NATS sunucu URL'i | `nats://nats:4222` |
| `LOG_LEVEL` | Log seviyesi (debug, info, warn, error) | `info` |

## Veri Modeli

Archive Service aşağıdaki temel veri modellerini kullanır:

### Result

```go
type Result struct {
    ID          string    `json:"id"`
    TaskID      string    `json:"task_id"`
    Status      string    `json:"status"` // success, failure, partial
    Content     string    `json:"content"`
    Metadata    Metadata  `json:"metadata"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

### Metadata

```go
type Metadata struct {
    ExecutionTime int               `json:"execution_time"`
    SuccessRate   float64           `json:"success_rate"`
    Tags          []string          `json:"tags"`
    Segments      []SegmentResult   `json:"segments"`
    Custom        map[string]string `json:"custom"`
}
```

### Atlas

```go
type Atlas struct {
    ID          string    `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Results     []string  `json:"results"` // Result IDs
    Content     string    `json:"content"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}
```

## Mimari

Archive Service, aşağıdaki katmanlardan oluşan temiz bir mimari yapıya sahiptir:

1. **API Katmanı**: HTTP isteklerini karşılar ve yanıtlar
2. **Servis Katmanı**: İş mantığını içerir
3. **Repository Katmanı**: Veri erişimini sağlar
4. **Model Katmanı**: Veri modellerini tanımlar

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.
