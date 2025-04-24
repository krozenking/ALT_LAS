# ALT_LAS Kod Kalite Metrikleri ve Standartları

Bu belge, ALT_LAS projesinde uygulanacak kod kalite metriklerini ve geliştirme standartlarını tanımlar. Tüm işçiler bu standartlara uygun kod geliştirmelidir.

## 1. Kod Kalite Metrikleri

### 1.1 Test Kapsamı
- **Hedef**: ≥ 90% test kapsamı
- **Ölçüm Aracı**: Jest (JavaScript/TypeScript), pytest (Python), cargo test (Rust), go test (Go)
- **Doğrulama**: CI/CD pipeline'ında otomatik kontrol
- **Gereksinim**: Her PR için test kapsamı raporlanmalıdır

### 1.2 Siklomat Karmaşıklığı
- **Hedef**: ≤ 10 (fonksiyon başına)
- **Ölçüm Aracı**: ESLint (JavaScript/TypeScript), radon (Python), clippy (Rust), gocyclo (Go)
- **Doğrulama**: CI/CD pipeline'ında otomatik kontrol
- **Gereksinim**: Karmaşık fonksiyonlar daha küçük, yönetilebilir parçalara bölünmelidir

### 1.3 Kod Tekrarı
- **Hedef**: < 3% kod tekrarı
- **Ölçüm Aracı**: jscpd (JavaScript/TypeScript), CPD (Python), clippy (Rust), gocognit (Go)
- **Doğrulama**: CI/CD pipeline'ında otomatik kontrol
- **Gereksinim**: Tekrarlanan kod parçaları ortak fonksiyonlara çıkarılmalıdır

### 1.4 Kod Stili
- **Hedef**: Sıfır lint uyarısı
- **Ölçüm Aracı**: ESLint/Prettier (JavaScript/TypeScript), Black/isort/flake8 (Python), rustfmt/clippy (Rust), gofmt/golint (Go)
- **Doğrulama**: CI/CD pipeline'ında otomatik kontrol
- **Gereksinim**: Tüm kod ilgili dil için standart stil kurallarına uygun olmalıdır

### 1.5 Bakım Edilebilirlik İndeksi
- **Hedef**: ≥ 85
- **Ölçüm Aracı**: ESLint (JavaScript/TypeScript), radon (Python), cargo-modules (Rust), goreportcard (Go)
- **Doğrulama**: CI/CD pipeline'ında otomatik kontrol
- **Gereksinim**: Kod okunabilir ve bakımı kolay olmalıdır

### 1.6 Bellek Kullanımı
- **Hedef**: Belirlenmiş sınırlar içinde
- **Ölçüm Aracı**: Chrome DevTools (JavaScript/TypeScript), memory_profiler (Python), valgrind (Rust), pprof (Go)
- **Doğrulama**: Performans testleri sırasında ölçüm
- **Gereksinim**: Bellek sızıntıları olmamalı ve bellek kullanımı optimize edilmelidir

### 1.7 Performans Metrikleri
- **Hedef**: Belirlenen eşik değerlerin altında yanıt süresi
- **Ölçüm Aracı**: Lighthouse (Web), pytest-benchmark (Python), criterion (Rust), benchstat (Go)
- **Doğrulama**: Performans testleri sırasında ölçüm
- **Gereksinim**: Kritik işlemler için performans testleri yazılmalıdır

## 2. Kod Standartları

### 2.1 SOLID Prensipleri

#### 2.1.1 Tek Sorumluluk Prensibi (Single Responsibility Principle)
- Her modül, sınıf veya fonksiyon yalnızca bir sorumluluğa sahip olmalıdır
- Örnek: `ScreenCaptureService` sadece ekran yakalama ile ilgili işlevleri içermelidir

#### 2.1.2 Açık/Kapalı Prensibi (Open/Closed Principle)
- Yazılım varlıkları genişletmeye açık, değiştirmeye kapalı olmalıdır
- Örnek: Yeni bir tema eklemek için mevcut kodu değiştirmek yerine tema sistemi genişletilmelidir

#### 2.1.3 Liskov Yerine Geçme Prensibi (Liskov Substitution Principle)
- Alt türler, üst türlerin yerine geçebilmelidir
- Örnek: Farklı AI modelleri aynı arayüzü implemente etmeli ve birbirinin yerine kullanılabilmelidir

#### 2.1.4 Arayüz Ayrımı Prensibi (Interface Segregation Principle)
- İstemciler kullanmadıkları arayüzlere bağımlı olmamalıdır
- Örnek: Ekran yakalama ve OCR için ayrı arayüzler tanımlanmalıdır

#### 2.1.5 Bağımlılık Tersine Çevirme Prensibi (Dependency Inversion Principle)
- Yüksek seviyeli modüller düşük seviyeli modüllere bağımlı olmamalıdır
- Örnek: UI katmanı doğrudan AI modellerine değil, AI servis arayüzüne bağımlı olmalıdır

### 2.2 Dil Özelinde Standartlar

#### 2.2.1 JavaScript/TypeScript (API Gateway, UI)
- TypeScript tercih edilmelidir
- Airbnb stil kılavuzu takip edilmelidir
- React bileşenleri için fonksiyonel bileşenler ve hooks kullanılmalıdır
- Prop-types veya TypeScript arayüzleri ile tip kontrolü yapılmalıdır
- Redux veya Context API ile durum yönetimi yapılmalıdır
- Asenkron işlemler için async/await kullanılmalıdır
- ESLint ve Prettier ile kod formatlanmalıdır
- Jest ile test yazılmalıdır

#### 2.2.2 Python (Segmentation Service, AI Orchestrator)
- Python 3.10+ kullanılmalıdır
- PEP 8 stil kılavuzu takip edilmelidir
- Type hints kullanılmalıdır
- Docstrings ile fonksiyonlar belgelenmelidir
- Asenkron işlemler için asyncio kullanılmalıdır
- Black ve isort ile kod formatlanmalıdır
- pytest ile test yazılmalıdır
- Veri işleme için NumPy ve Pandas kullanılmalıdır
- AI modelleri için ONNX Runtime veya PyTorch kullanılmalıdır

#### 2.2.3 Rust (Runner Service, OS Integration)
- Rust 1.70+ kullanılmalıdır
- Rust API Guidelines takip edilmelidir
- Kapsamlı hata işleme yapılmalıdır
- Result ve Option türleri uygun şekilde kullanılmalıdır
- Belgelendirme yorumları eklenmelidir
- rustfmt ve clippy kullanılmalıdır
- cargo test ile test yazılmalıdır
- Güvensiz kod (`unsafe`) sadece kesinlikle gerektiğinde kullanılmalıdır
- Asenkron işlemler için tokio kullanılmalıdır

#### 2.2.4 Go (Archive Service, Security)
- Go 1.20+ kullanılmalıdır
- Go Code Review Comments takip edilmelidir
- Hata işleme için idiomatic Go yaklaşımı kullanılmalıdır
- Belgelendirme yorumları eklenmelidir
- gofmt ve golint kullanılmalıdır
- go test ile test yazılmalıdır
- Context kullanımı ile iptal edilebilir işlemler yapılmalıdır
- Goroutine'ler ve kanallar uygun şekilde kullanılmalıdır

### 2.3 İsimlendirme Kuralları

#### 2.3.1 Genel İsimlendirme
- Tüm kod İngilizce yazılmalıdır
- Kısaltmalar yerine tam kelimeler kullanılmalıdır
- Değişken ve fonksiyon isimleri açıklayıcı olmalıdır
- Boolean değişkenler için `is`, `has`, `can` gibi ön ekler kullanılmalıdır

#### 2.3.2 JavaScript/TypeScript
- Değişkenler ve fonksiyonlar: `camelCase`
- Sınıflar ve bileşenler: `PascalCase`
- Sabitler: `UPPER_SNAKE_CASE`
- Dosya isimleri: `kebab-case.ts` veya bileşenler için `PascalCase.tsx`

#### 2.3.3 Python
- Değişkenler ve fonksiyonlar: `snake_case`
- Sınıflar: `PascalCase`
- Sabitler: `UPPER_SNAKE_CASE`
- Modüller: `snake_case.py`

#### 2.3.4 Rust
- Değişkenler ve fonksiyonlar: `snake_case`
- Türler (struct, enum, trait): `PascalCase`
- Sabitler: `UPPER_SNAKE_CASE`
- Modüller: `snake_case`

#### 2.3.5 Go
- Değişkenler ve fonksiyonlar: `camelCase` (özel durumlar hariç)
- Dışa açık fonksiyonlar ve türler: `PascalCase`
- Sabitler: `camelCase` veya `PascalCase`
- Dosya isimleri: `snake_case.go`

### 2.4 Dokümantasyon Standartları

#### 2.4.1 Kod İçi Dokümantasyon
- Tüm public API'ler belgelenmelidir
- Karmaşık algoritmaların açıklamaları eklenmelidir
- Fonksiyon parametreleri ve dönüş değerleri belgelenmelidir
- Örnekler ve kullanım senaryoları belgelenmelidir

#### 2.4.2 API Dokümantasyonu
- RESTful API'ler için OpenAPI/Swagger kullanılmalıdır
- gRPC API'ler için Protocol Buffers kullanılmalıdır
- API değişiklikleri için sürüm kontrolü yapılmalıdır

#### 2.4.3 Mimari Dokümantasyonu
- Sistem mimarisi diyagramlarla belgelenmelidir
- Bileşenler arası ilişkiler açıklanmalıdır
- Veri akışı belgelenmelidir
- Tasarım kararları ve gerekçeleri belgelenmelidir

### 2.5 Test Standartları

#### 2.5.1 Birim Testleri
- Her modül için birim testleri yazılmalıdır
- Test kapsamı en az %90 olmalıdır
- Mocking ve stub'lar kullanılarak bağımlılıklar izole edilmelidir
- Sınır durumları test edilmelidir

#### 2.5.2 Entegrasyon Testleri
- Bileşenler arası etkileşimler test edilmelidir
- API'ler için entegrasyon testleri yazılmalıdır
- Veritabanı etkileşimleri test edilmelidir

#### 2.5.3 E2E Testleri
- Kritik kullanıcı senaryoları için E2E testleri yazılmalıdır
- UI için Cypress (web) ve Detox (mobil) kullanılmalıdır
- Test ortamları gerçek ortamlara benzer olmalıdır

#### 2.5.4 Performans Testleri
- Kritik işlemler için performans testleri yazılmalıdır
- Yük testleri ile sistem sınırları belirlenmelidir
- Bellek kullanımı ve sızıntıları test edilmelidir

### 2.6 Güvenlik Standartları

#### 2.6.1 Kod Güvenliği
- Güvenlik açıkları için statik kod analizi yapılmalıdır
- Dependency scanning ile bağımlılıklar kontrol edilmelidir
- Hassas veriler şifrelenerek saklanmalıdır
- Input validation ile kullanıcı girdileri doğrulanmalıdır

#### 2.6.2 Kimlik Doğrulama ve Yetkilendirme
- JWT veya OAuth 2.0 ile kimlik doğrulama yapılmalıdır
- Role-based access control ile yetkilendirme yapılmalıdır
- Hassas işlemler için çok faktörlü kimlik doğrulama kullanılmalıdır

#### 2.6.3 Veri Güvenliği
- Kişisel veriler GDPR uyumlu şekilde işlenmelidir
- Veri şifreleme ve anonimleştirme teknikleri kullanılmalıdır
- Veri saklama ve silme politikaları uygulanmalıdır

## 3. Pull Request ve Kod İnceleme Süreci

### 3.1 PR Oluşturma
- Her PR bir GitHub issue'ya bağlı olmalıdır
- PR açıklaması yapılan değişiklikleri detaylandırmalıdır
- PR boyutu yönetilebilir olmalıdır (ideal olarak <400 satır)
- PR başlığı conventional commits formatında olmalıdır

### 3.2 Kod İnceleme
- Her PR en az bir onay almalıdır
- Kod incelemeleri 24 saat içinde yapılmalıdır
- Kod inceleme yorumları yapıcı ve açıklayıcı olmalıdır
- Otomatik kontroller (CI/CD) başarılı olmalıdır

### 3.3 Merge Kriterleri
- Tüm otomatik kontroller başarılı olmalıdır
- En az bir onay alınmalıdır
- Tüm inceleme yorumları çözülmelidir
- Çakışmalar çözülmelidir

## 4. Sürekli İyileştirme

### 4.1 Kod Kalitesi İzleme
- SonarQube veya benzeri araçlarla kod kalitesi izlenmelidir
- Teknik borç takibi yapılmalıdır
- Kod kalitesi metrikleri düzenli olarak raporlanmalıdır

### 4.2 Refactoring
- Her sprint'in %20'si teknik borç azaltmaya ayrılmalıdır
- Kod kokuları tespit edilmeli ve giderilmelidir
- Performans darboğazları tespit edilmeli ve optimize edilmelidir

### 4.3 Bilgi Paylaşımı
- Kod incelemeleri sırasında bilgi paylaşımı yapılmalıdır
- Düzenli teknik sunumlar düzenlenmelidir
- Dokümantasyon güncel tutulmalıdır

Bu standartlara uyulması, ALT_LAS projesinin yüksek kaliteli, bakımı kolay ve performanslı bir kod tabanına sahip olmasını sağlayacaktır. Tüm işçiler bu standartlara uymakla yükümlüdür ve kod incelemeleri sırasında bu standartlar kontrol edilecektir.
