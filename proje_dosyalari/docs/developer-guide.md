# ALT_LAS Geliştirici Kılavuzu (Güncellenmiş)

Bu belge, ALT_LAS projesine katkıda bulunacak geliştiriciler için hazırlanmıştır. Geliştirme ortamının kurulumu, kodlama standartları, dokümantasyon standartları ve geliştirme süreçleri hakkında güncel bilgiler içerir.

## Geliştirme Ortamı Kurulumu

Projenin geliştirme ortamını kurmak için lütfen ana `README.md` dosyasındaki "Kurulum" bölümüne ve her bir servisin kendi `README.md` dosyasındaki kurulum talimatlarına başvurun. Genellikle Git, Docker, Docker Compose ve her servisin kullandığı programlama diline (Node.js, Python, Rust, Go) özgü araçların yüklenmesi gerekmektedir.

## Proje Yapısı

ALT_LAS projesi, her biri belirli bir işlevselliğe odaklanmış mikroservislerden oluşan modüler bir yapıya sahiptir:

```
ALT_LAS/
├── api-gateway/            # API Gateway servisi (Node.js/Express)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── workflow-engine/        # İş Akışı Motoru servisi (Python/FastAPI)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── segmentation-service/   # Segmentation servisi (Python/FastAPI)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── runner-service/         # Runner servisi (Rust)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── archive-service/        # Archive servisi (Go)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── os-integration-service/ # İşletim Sistemi Entegrasyon servisi (Rust)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── ai-orchestrator/        # AI Orkestrasyon servisi (Python/FastAPI)
│   └── README.md           # Servis özeti, kurulum, API detayları, yapılandırma
├── ui/
│   ├── desktop/            # Masaüstü uygulaması (Electron/React)
│   ├── web/                # Web dashboard (React)
│   └── mobile/             # Mobil uygulama (React Native)
├── security/               # Güvenlik katmanı (Geliştirme aşamasında)
├── docs/                   # Genel Proje Dokümantasyonu (Bu kılavuz, kullanıcı kılavuzu vb.)
├── scripts/                # Yardımcı scriptler (örn: kurulum, test)
├── docker-compose.yml      # Geliştirme ve test için Docker Compose yapılandırması
├── architecture.md         # Genel Sistem Mimarisi (Güncellenmiş)
├── roadmap.md              # Genel Geliştirme Yol Haritası (Güncellenmiş)
└── README.md               # Proje Genel Açıklaması (Güncellenmiş)
```

## Kodlama Standartları

Her servis, kendi programlama dilinin yaygın olarak kabul görmüş en iyi pratiklerine ve stil rehberlerine uymalıdır:

-   **Genel**: Anlaşılır değişken ve fonksiyon isimleri kullanılmalı, kod karmaşıklığı düşük tutulmalı ve DRY (Don't Repeat Yourself) prensibine uyulmalıdır.
-   **Node.js (API Gateway)**: Airbnb JavaScript Style Guide veya benzeri yaygın bir standart takip edilebilir. ESLint ve Prettier gibi araçlar kullanılmalıdır.
-   **Python (Workflow Engine, Segmentation, AI Orchestrator)**: PEP 8 stil rehberine uyulmalıdır. Black, Flake8 gibi araçlar kullanılmalıdır. Tip ipuçları (type hints) kullanılmalıdır.
-   **Rust (Runner, OS Integration)**: Rust API Guidelines ve `rustfmt` aracı kullanılmalıdır. `clippy` ile linting yapılmalıdır.
-   **Go (Archive Service)**: Effective Go ve `gofmt` (veya `goimports`) aracı kullanılmalıdır.
-   **Yorumlar**: Kodun anlaşılması zor kısımları için açıklayıcı yorumlar eklenmelidir. Ancak, kodun kendisi mümkün olduğunca kendini açıklamalıdır.

## Dokümantasyon Standartları

Projenin sürdürülebilirliği ve anlaşılabilirliği için tutarlı ve güncel bir dokümantasyon yapısı kritik öneme sahiptir.

### Genel Proje Dokümantasyonu
-   Projenin genelini ilgilendiren belgeler (örn: `architecture.md`, `roadmap.md`, bu `developer-guide.md`, `user-guide.md`) kök dizinde veya `/docs` dizininde bulunur.
-   Bu belgeler, projenin genel vizyonunu, mimarisini, yol haritasını ve geliştirme/kullanım süreçlerini açıklar.

### Servis/Modül Dokümantasyonu
-   **Her servis/modül dizini (`/api-gateway`, `/workflow-engine`, vb.) bir `README.md` dosyası içermelidir.** Bu dosya, servisin/modülün birincil dokümantasyon kaynağıdır ve şunları kapsamalıdır:
    -   Servisin amacı ve temel işlevleri.
    -   Kurulum talimatları (gerekli bağımlılıklar, ortam değişkenleri, veritabanı kurulumu vb.).
    -   Servisin nasıl çalıştırılacağı (geliştirme ve üretim modları).
    -   Temel API endpoint'leri ve kullanım örnekleri (detaylı API referansı için Swagger/OpenAPI dosyasına veya ayrı bir API dokümanına link verilebilir).
    -   Yapılandırma seçenekleri.
    -   Testlerin nasıl çalıştırılacağı.
    -   Katkıda bulunma yönergeleri (varsa).
-   Servise özel çok detaylı teknik bilgiler, tasarım kararları veya derinlemesine açıklamalar için, servis `README.md` dosyasından link verilerek ayrı Markdown dosyaları oluşturulabilir (tercihen servis dizini içinde bir `docs/` alt klasöründe).

### API Dokümantasyonu
-   API sunan servisler (API Gateway, Workflow Engine, Segmentation Service vb.) için Swagger/OpenAPI spesifikasyonları oluşturulmalı ve güncel tutulmalıdır.
-   API Gateway, `/api-docs` endpoint'i üzerinden interaktif Swagger UI sunar.

### Güncellik ve Sorumluluk
-   **Tüm dokümantasyonlar, ilgili kod veya yapı değiştikçe derhal güncel tutulmalıdır.** Bu, geliştiricinin sorumluluğundadır.
-   Bir özelliğin eklenmesi, değiştirilmesi veya kaldırılması durumunda, ilgili tüm dokümanlar (servis README'leri, genel dokümanlar, API spesifikasyonları, kod içi yorumlar) bu değişikliği yansıtacak şekilde güncellenmelidir.

## Git İş Akışı

Proje, genellikle aşağıdaki Git iş akışını takip eder:

1.  **Main Branch**: Her zaman kararlı ve yayınlanabilir sürümü temsil eder.
2.  **Develop Branch (Opsiyonel)**: Bir sonraki sürüm için geliştirme çalışmalarının entegre edildiği ana geliştirme branch'i olabilir. Doğrudan `main`'e de çalışılabilir.
3.  **Feature Branches**: Yeni özellikler veya büyük değişiklikler için `develop` (veya `main`) branch'inden oluşturulur (örn: `feature/new-auth-flow`, `fix/runner-memory-leak`).
4.  **Pull Requests (PRs)**: Bir özellik tamamlandığında veya bir hata düzeltildiğinde, `feature` branch'inden `develop` (veya `main`) branch'ine bir Pull Request açılır.
5.  **Code Review**: PR'lar, diğer ekip üyeleri tarafından incelenir. Geri bildirimler doğrultusunda gerekli düzeltmeler yapılır.
6.  **Merge**: Kod incelemesi onaylandıktan ve CI testleri geçtikten sonra PR, hedef branch'e (genellikle squash merge veya rebase merge ile) birleştirilir.

### Commit Mesajları
-   Anlaşılır ve standart bir formatta commit mesajları yazılmalıdır (örn: Conventional Commits standardı: `<type>[optional scope]: <description>`).
    -   Örnek: `feat(api-gateway): add refresh token endpoint`
    -   Örnek: `fix(runner-service): resolve circular dependency in task parsing`
    -   Örnek: `docs(readme): update installation instructions`

## Test Stratejisi

Kaliteli bir ürün sunmak için kapsamlı testler hayati önem taşır:

-   **Birim Testleri (Unit Tests)**: Her servisteki bireysel fonksiyonların ve modüllerin doğru çalıştığını doğrular. Her geliştirici kendi yazdığı kod için birim testlerini yazmaktan sorumludur.
-   **Entegrasyon Testleri (Integration Tests)**: Bir servis içindeki farklı bileşenlerin veya birden fazla servisin birlikte doğru çalıştığını doğrular (örn: API Gateway'in bir backend servisine istek yönlendirmesi).
-   **Uçtan Uca Testler (End-to-End Tests)**: Tüm sistemin kullanıcı senaryoları üzerinden baştan sona doğru çalıştığını doğrular.
-   **Test Kapsamı**: Yüksek bir test kapsamı hedeflenmelidir (örn: %80+).
-   **CI Entegrasyonu**: Tüm testler, CI (Sürekli Entegrasyon) pipeline'ında her push veya PR'da otomatik olarak çalıştırılmalıdır.

## CI/CD Pipeline

Proje, otomasyonu sağlamak için bir CI/CD pipeline'ı kullanır (veya kullanmalıdır):

-   **Sürekli Entegrasyon (CI)**: Kod değişiklikleri otomatik olarak derlenir, test edilir ve kod kalitesi analizlerinden geçirilir.
-   **Sürekli Dağıtım/Teslimat (CD)**: Başarılı CI süreçlerinden sonra, değişiklikler otomatik olarak test veya üretim ortamlarına dağıtılabilir.
-   Kullanılan araçlar GitHub Actions, GitLab CI, Jenkins vb. olabilir.

## Mevcut Geliştirme Aşaması ve Odak

ALT_LAS projesi şu anda **Stabilizasyon ve Entegrasyon** aşamasına odaklanmıştır. Bu aşamanın temel hedefleri şunlardır:

1.  Mevcut servislerin birbirleriyle **tam entegrasyonunu** sağlamak.
2.  Tespit edilen **hataları gidermek** ve sistemin genel **stabilitesini** artırmak.
3.  Önemli servislerde **performans iyileştirmeleri** yapmak.
4.  **Tüm dokümantasyonun (harici ve kod içi) mevcut kod işlevleriyle %100 uyumlu hale getirilmesini sağlamak.**

### Geliştirme Kuralları (Mevcut Aşama)

1.  **Dokümantasyon Önceliği**: Yapılan her kod değişikliği (yeni özellik, hata düzeltme, refactoring) ile birlikte ilgili tüm dokümanlar (servis README'leri, genel proje dokümanları, API tanımları, kod içi yorumlar) **eş zamanlı olarak güncellenmelidir.** Dokümantasyon, kodun bir parçası olarak kabul edilmelidir.
2.  **GitHub Push Sıklığı**: Anlamlı bir iş birimi tamamlandığında (örn: bir hata düzeltildiğinde, küçük bir özellik eklendiğinde) veya gün sonunda yapılan tüm değişiklikler (kod ve dokümantasyon) GitHub deposuna push edilmelidir. Bu, projenin güncel kalmasını ve ekip içi senkronizasyonu sağlar.
3.  **Pull Request ve Kod İncelemesi**: Tüm önemli değişiklikler Pull Request aracılığıyla yapılmalı ve en az bir başka ekip üyesi tarafından incelenmelidir.

Bu kurallar, projenin düzenli ilerlemesi, kalitesi, şeffaflığı ve ekip içi koordinasyonun sağlanması için kritik öneme sahiptir.
