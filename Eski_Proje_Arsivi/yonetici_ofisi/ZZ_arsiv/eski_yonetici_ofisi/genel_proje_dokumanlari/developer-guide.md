# ALT_LAS Geliştirici Kılavuzu

Bu belge, ALT_LAS projesine katkıda bulunacak geliştiriciler için hazırlanmıştır. Geliştirme ortamının kurulumu, kodlama standartları, dokümantasyon standartları ve geliştirme süreçleri hakkında bilgiler içerir.

## Geliştirme Ortamı Kurulumu

--snip--

## Proje Yapısı

```
ALT_LAS/
├── api-gateway/            # API Gateway servisi (Node.js/Express)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── segmentation-service/   # Segmentation servisi (Python/FastAPI)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── runner-service/         # Runner servisi (Rust)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── archive-service/        # Archive servisi (Go)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── ui/
│   ├── desktop/            # Masaüstü uygulaması (Electron/React)
│   ├── web/                # Web dashboard (React)
│   └── mobile/             # Mobil uygulama (React Native)
├── os-integration/         # İşletim sistemi entegrasyonu (Rust/C++)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── ai-orchestrator/        # AI orkestrasyon servisi (Python)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── security/               # Güvenlik katmanı (Rust/Go)
│   ├── docs/               # Servise özel detaylı dokümantasyon
│   └── README.md           # Servis özeti, kurulum, temel kullanım
├── docs/                   # Genel Proje Dokümantasyonu (Bu kılavuz, kullanıcı kılavuzu vb.)
├── scripts/                # Yardımcı scriptler
├── docker-compose.yml      # Docker Compose yapılandırması
├── architecture.md         # Genel Sistem Mimarisi
├── roadmap.md              # Genel Geliştirme Yol Haritası
├── worker_tasks.md         # İşçi Görev Dağılımı (Özet)
├── worker_tasks_detailed.md # İşçi Görev Dağılımı (Detaylı)
├── license_analysis.md     # Lisans Analizi
├── license_recommendations.md # Lisans Önerileri
└── README.md               # Proje Genel Açıklaması
```

## Kodlama Standartları

--snip--

## Dokümantasyon Standartları

Projenin sürdürülebilirliği ve anlaşılabilirliği için tutarlı bir dokümantasyon yapısı önemlidir.

### Genel Dokümantasyon
*   Projenin genelini ilgilendiren belgeler (mimari, yol haritası, lisans, genel kılavuzlar) kök dizinde veya `/docs` dizininde bulunur.
*   `/docs` dizini sadece projeye genel bakış sağlayan veya tüm geliştiricileri/kullanıcıları ilgilendiren kılavuzları içermelidir (örn: `developer-guide.md`, `user-guide.md`).

### Çalışan Görevleri
*   Tüm çalışanların görev tanımları merkezi olarak kök dizindeki `worker_tasks.md` (özet) ve `worker_tasks_detailed.md` (detaylı) dosyalarında yönetilir.

### Servis/Modül Dokümantasyonu
*   **Her servis/modül dizini (`/api-gateway`, `/segmentation-service`, vb.) bir `README.md` dosyası içermelidir.** Bu dosya, servisin/modülün amacını, temel kurulumunu, nasıl çalıştırılacağını ve temel kullanımını özetlemelidir.
*   **Servise/modüle özel detaylı teknik bilgiler, tasarım kararları, API detayları, ilerleme notları veya diğer derinlemesine açıklamalar için ilgili servis/modül dizini içinde bir `docs/` alt dizini oluşturulmalı ve belgeler buraya eklenmelidir.**
*   Bu yapı, ilgili bilginin kodun yanında bulunmasını sağlar ve gezinmeyi kolaylaştırır.
*   Kök dizindeki `/worker_documentation_template.md` dosyası, servis/modül dokümantasyonu oluştururken bir başlangıç noktası olarak kullanılabilir.

### Güncellik
*   Tüm dokümantasyonlar, ilgili kod veya yapı değiştikçe güncel tutulmalıdır.
*   Özellikle `README.md` dosyaları ve API dokümantasyonları güncel olmalıdır.

## Git İş Akışı

--snip--

## Test Stratejisi

--snip--

## CI/CD Pipeline

--snip--

## Dağıtım

--snip--

## Sorun Giderme

--snip--

## Kaynaklar

--snip--

## Lisans Uyumluluğu

--snip--




## Pre-Alpha Geliştirme Aşaması ve Mimarisi Görev Sırası

ALT_LAS projesi şu anda **Pre-Alpha** geliştirme aşamasındadır. Bu aşamanın temel amacı, sistemin çekirdek bileşenlerini entegre ederek uçtan uca temel bir işlevselliği hayata geçirmektir. Bu aşamadaki geliştirme çalışmaları, bireysel işçi görevlerinden ziyade, genel sistem mimarisini oluşturan bileşenlerin sıralı ve koordineli bir şekilde geliştirilmesine odaklanacaktır.

### Mimarisi Görev Sırası ve Takibi

Pre-Alpha aşamasındaki tüm geliştirme görevleri, [Pre-Alpha Mimarisi Görev Sırası](./pre_alpha_architecture_tasks.md) belgesinde tanımlanmıştır. Tüm çalışanların bu belgeyi birincil görev kaynağı olarak kullanması ve burada belirtilen mimari görev sırasını takip etmesi beklenmektedir.

**Çalışma Prensibi:**
*   Görevler mimari ve bileşen odaklıdır.
*   Çakışmaları önlemek ve koordinasyonu sağlamak amacıyla, **belirli bir mimari görev veya alt bileşenleri üzerinde aynı anda yalnızca bir çalışan aktif olarak çalışmalıdır.**
*   Proje Yöneticisi, bu mimari görevlerin veya alt parçalarının bireysel çalışanlara atanmasını koordine edecektir.
*   Bu mimari görev listesi Proje Yöneticisi tarafından korunacak ve Pre-Alpha aşaması ilerledikçe güncellenecektir. Çalışanlar mevcut mimari odak için bu belgeye başvurmalıdır.

### Yönetici Rolü

Proje Yöneticisi, Pre-Alpha aşamasında aşağıdaki sorumluluklara sahip olacaktır:
*   Mimarisi görevlerin çalışanlara atanmasını koordine etmek.
*   Çalışanlar arasında koordinasyonu sağlamak ve olası çakışmaları çözmek.
*   [Pre-Alpha Mimarisi Görev Sırası](./pre_alpha_architecture_tasks.md) belgesinin güncelliğini sağlamak.
*   Geliştirme süreçlerinin ve kurallarının takip edildiğinden emin olmak.

### Geliştirme Kuralları (Pre-Alpha Aşaması)

Pre-Alpha aşamasında tüm çalışanların aşağıdaki kurallara uyması zorunludur:

1.  **Öncelikli Görev Listesi:** Çalışanlar, görevlerini öncelikli olarak [Pre-Alpha Mimarisi Görev Sırası](./pre_alpha_architecture_tasks.md) belgesinden takip etmelidir.
2.  **Dokümantasyon Güncelleme:** Her çalışan, kendisine atanan bir mikro veya makro görevi tamamladıktan sonra, ilgili tüm dokümantasyonları (servis README dosyaları, genel proje dokümanları vb.) derhal güncellemelidir. Bu, yapılan değişikliklerin, eklenen özelliklerin veya alınan kararların dokümantasyona yansıtılmasını içerir.
3.  **GitHub Push Sıklığı:** Her çalışan, bir **makro görevi** tamamladıktan sonra yaptığı tüm değişiklikleri (kod ve dokümantasyon) GitHub deposuna push etmelidir. Bu, projenin güncel kalmasını ve diğer çalışanların en son değişikliklere erişebilmesini sağlar.
4.  **Tek Çalışan Prensibi:** Belirli bir mimari görev veya onun doğrudan alt bileşenleri üzerinde aynı anda yalnızca bir çalışan çalışmalıdır. Bu, Proje Yöneticisi tarafından koordine edilecektir.

Bu kurallar, projenin düzenli ilerlemesi, şeffaflığı ve ekip içi koordinasyonun sağlanması için kritik öneme sahiptir.
