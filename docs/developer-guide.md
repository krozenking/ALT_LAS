# ALT_LAS Geliştirici Kılavuzu

Bu belge, ALT_LAS projesine katkıda bulunacak geliştiriciler için hazırlanmıştır. Geliştirme ortamının kurulumu, kodlama standartları ve geliştirme süreçleri hakkında bilgiler içerir.

## Geliştirme Ortamı Kurulumu

### Gereksinimler

- Git
- Docker ve Docker Compose
- Node.js 18+
- Python 3.10+
- Rust 1.70+
- Go 1.20+
- Visual Studio Code veya tercih ettiğiniz IDE

### Kurulum Adımları

1. Repoyu klonlayın:
```bash
git clone https://github.com/krozenking/ALT_LAS.git
cd ALT_LAS
```

2. Geliştirme ortamını kurun:
```bash
# Kurulum scriptini çalıştırın
./scripts/setup.sh
```

3. Servisleri başlatın:
```bash
# Docker Compose ile tüm servisleri başlatın
docker-compose up -d
```

4. Geliştirme sunucusunu başlatın:
```bash
# API Gateway geliştirme sunucusu
cd api-gateway
npm run dev

# Segmentation Service geliştirme sunucusu
cd segmentation-service
python -m uvicorn main:app --reload

# Runner Service geliştirme sunucusu
cd runner-service
cargo run

# Archive Service geliştirme sunucusu
cd archive-service
go run main.go
```

## Proje Yapısı

```
ALT_LAS/
├── api-gateway/            # API Gateway servisi (Node.js/Express)
├── segmentation-service/   # Segmentation servisi (Python/FastAPI)
├── runner-service/         # Runner servisi (Rust)
├── archive-service/        # Archive servisi (Go)
├── ui/
│   ├── desktop/            # Masaüstü uygulaması (Electron/React)
│   ├── web/                # Web dashboard (React)
│   └── mobile/             # Mobil uygulama (React Native)
├── os-integration/         # İşletim sistemi entegrasyonu (Rust/C++)
├── ai-orchestrator/        # AI orkestrasyon servisi (Python)
├── security/               # Güvenlik katmanı (Rust/Go)
├── docs/                   # Dokümantasyon
├── scripts/                # Yardımcı scriptler
├── docker-compose.yml      # Docker Compose yapılandırması
└── README.md               # Proje açıklaması
```

## Kodlama Standartları

### Genel Kurallar

- Tüm kod İngilizce yazılmalıdır
- Anlamlı değişken ve fonksiyon isimleri kullanılmalıdır
- Kod, açıklayıcı yorumlarla belgelenmelidir
- Her modül için birim testleri yazılmalıdır
- Kod, ilgili linter'lar ile kontrol edilmelidir

### JavaScript/TypeScript (API Gateway, UI)

- ESLint ve Prettier kullanılmalıdır
- Airbnb stil kılavuzu takip edilmelidir
- TypeScript tercih edilmelidir
- React bileşenleri için fonksiyonel bileşenler ve hooks kullanılmalıdır
- Jest ile test yazılmalıdır

```typescript
// Örnek TypeScript kodu
interface User {
  id: string;
  username: string;
  role: string;
}

function authenticateUser(username: string, password: string): Promise<User> {
  // Implementation
}
```

### Python (Segmentation Service, AI Orchestrator)

- Black ve isort ile kod formatlanmalıdır
- PEP 8 stil kılavuzu takip edilmelidir
- Type hints kullanılmalıdır
- Docstrings ile fonksiyonlar belgelenmelidir
- pytest ile test yazılmalıdır

```python
from typing import Dict, Any, Optional

def segment_command(
    task: str,
    mode: str,
    chaos_level: int = 0,
    persona: Optional[str] = None,
    variables: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Segment a command into subtasks.
    
    Args:
        task: The main task description
        mode: Operation mode (normal, dream, explore, chaos)
        chaos_level: Chaos level (0-4)
        persona: Persona to use
        variables: Additional variables
        
    Returns:
        Dictionary containing the segmented command
    """
    # Implementation
```

### Rust (Runner Service, OS Integration)

- rustfmt ve clippy kullanılmalıdır
- Rust API Guidelines takip edilmelidir
- Kapsamlı hata işleme yapılmalıdır
- Belgelendirme yorumları eklenmelidir
- cargo test ile test yazılmalıdır

```rust
/// Represents a task to be executed
#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    /// Unique identifier
    pub id: String,
    /// Task type
    pub task_type: String,
    /// Task content
    pub content: String,
    /// Additional metadata
    pub metadata: HashMap<String, Value>,
}

/// Run a task and return the result
pub fn run_task(task: &Task) -> Result<TaskResult, TaskError> {
    // Implementation
}
```

### Go (Archive Service, Security)

- gofmt ve golint kullanılmalıdır
- Go Code Review Comments takip edilmelidir
- Hata işleme için idiomatic Go yaklaşımı kullanılmalıdır
- Belgelendirme yorumları eklenmelidir
- go test ile test yazılmalıdır

```go
// ArchiveResult represents the result of an archive operation
type ArchiveResult struct {
    AtlasID  string `json:"atlas_id"`
    Archived bool   `json:"archived"`
}

// ArchiveLastFile archives a last file and creates an atlas record
func ArchiveLastFile(lastID string, results []TaskResult) (ArchiveResult, error) {
    // Implementation
}
```

## Git İş Akışı

### Branch Stratejisi

- `main`: Kararlı sürüm, üretim ortamı
- `develop`: Geliştirme dalı, entegrasyon
- `feature/*`: Yeni özellikler
- `bugfix/*`: Hata düzeltmeleri
- `release/*`: Sürüm hazırlıkları

### Commit Mesajları

Commit mesajları aşağıdaki formatta olmalıdır:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Örnek:
```
feat(api-gateway): add authentication middleware

Implement JWT-based authentication for API endpoints.

Closes #123
```

Tip türleri:
- `feat`: Yeni özellik
- `fix`: Hata düzeltmesi
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod stili değişiklikleri
- `refactor`: Kod yeniden düzenleme
- `test`: Test ekleme veya düzenleme
- `chore`: Yapılandırma, derleme vb. değişiklikler

### Pull Request Süreci

1. Yeni bir branch oluşturun
2. Değişikliklerinizi yapın ve test edin
3. Değişikliklerinizi commit edin
4. Branch'inizi uzak sunucuya push edin
5. GitHub üzerinden pull request oluşturun
6. Kod incelemesi bekleyin
7. Geri bildirimlere göre düzeltmeler yapın
8. Onay aldıktan sonra merge işlemi yapılacaktır

## Test Stratejisi

### Birim Testleri

Her modül için birim testleri yazılmalıdır. Test kapsamı en az %80 olmalıdır.

### Entegrasyon Testleri

Servisler arası entegrasyon testleri yazılmalıdır. Docker Compose ile test ortamı kurulabilir.

### E2E Testleri

Uçtan uca testler için Cypress (web) ve Detox (mobil) kullanılabilir.

### Performans Testleri

k6 ile performans testleri yapılabilir.

## CI/CD Pipeline

GitHub Actions ile aşağıdaki işlemler otomatikleştirilmiştir:

1. Kod linting ve formatlama kontrolü
2. Birim testleri çalıştırma
3. Docker imajları oluşturma
4. Entegrasyon testleri çalıştırma
5. Dokümantasyon oluşturma
6. Sürüm oluşturma

## Dağıtım

### Docker Compose ile Dağıtım

Geliştirme ortamı için:

```bash
docker-compose up -d
```

### Kubernetes ile Dağıtım

Üretim ortamı için:

```bash
kubectl apply -f kubernetes/
```

## Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### API Gateway Bağlantı Hatası

```
Error: ECONNREFUSED
```

Çözüm: API Gateway servisinin çalıştığından emin olun:

```bash
docker-compose ps api-gateway
```

#### Segmentation Service Hatası

```
Error: Cannot connect to segmentation service
```

Çözüm: Segmentation Service'in çalıştığından emin olun ve logları kontrol edin:

```bash
docker-compose logs segmentation-service
```

#### Runner Service Bellek Hatası

```
Error: Memory allocation failed
```

Çözüm: Docker kaynaklarını artırın veya bellek sınırlarını kontrol edin.

## Kaynaklar

- [Express.js Dokümantasyonu](https://expressjs.com/)
- [FastAPI Dokümantasyonu](https://fastapi.tiangolo.com/)
- [Rust Dokümantasyonu](https://doc.rust-lang.org/)
- [Go Dokümantasyonu](https://golang.org/doc/)
- [React Dokümantasyonu](https://reactjs.org/docs/getting-started.html)
- [Electron Dokümantasyonu](https://www.electronjs.org/docs)
- [React Native Dokümantasyonu](https://reactnative.dev/docs/getting-started)

## Lisans Uyumluluğu

Tüm bağımlılıklar, ticari kullanıma uygun ücretsiz lisanslara sahip olmalıdır:

- MIT Lisansı
- Apache 2.0 Lisansı
- BSD-3-Clause Lisansı

Yeni bir bağımlılık eklemeden önce lisans uyumluluğunu kontrol edin.
