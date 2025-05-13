# ALT_LAS

ALT_LAS, bilgisayar sistemlerini yapay zeka ile yönetmek için tasarlanmış, modüler bir mikroservis mimarisi kullanan, açık kaynaklı ve ticari kullanıma uygun bir platformdur.

## Proje Genel Bakış

ALT_LAS, kullanıcı komutlarını alıp bunları işlenebilir görevlere dönüştüren, bu görevleri yürüten, sonuçları analiz eden ve öğrenme döngüleri için değerli verileri arşivleyen kapsamlı bir sistemdir. Platform, esnekliği ve genişletilebilirliği sağlamak için mikroservis mimarisine dayanmaktadır.

## Temel Özellikler

- **Modüler Mikroservis Mimarisi**: Her biri belirli bir işlevselliğe odaklanmış bağımsız servisler (API Gateway, Segmentation, Workflow, Runner, Archive, OS Integration, AI Orchestrator).
- **Dosya Tabanlı İş Akışı**: Görev tanımları için `*.alt`, yürütme sonuçları için `*.last` ve bilgi birikimi için `*.atlas` dosyalarını kullanır.
- **Çoklu Çalışma Modları**: Komut yorumlama ve yürütme davranışını değiştirmek için "Normal", "Dream", "Explore" ve "Chaos" gibi modları destekler.
- **Persona Sistemi**: Yapay zeka etkileşimlerini kişiselleştirmek için "technical_expert", "creative_writer" gibi farklı personalar sunar.
- **Gelişmiş API Gateway**: Kapsamlı kimlik doğrulama (JWT, token yenileme, çıkış), rol tabanlı erişim kontrolü (RBAC), dinamik servis keşfi (sağlık kontrolleri ile), istek yönlendirme, rate limiting, performans izleme (OpenTelemetry entegrasyonu ile), detaylı loglama (Winston) ve yanıt önbellekleme (Redis) gibi özellikler sunar.
- **Workflow Engine**: Kullanıcıların karmaşık iş akışları tanımlamasını, zamanlamasını ve izlemesini sağlayan bir iş akışı motoru içerir. Çeşitli tetikleyiciler (manuel, zamanlanmış, webhook) ve eylemler (kod yürütme, HTTP istekleri) sunar.
- **Detaylı Görev Yürütme (Runner Service)**: `*.alt` dosyalarındaki görevleri asenkron olarak yürütür, bağımlılıkları yönetir, AI servisleriyle entegre olur ve yürütme sonuçlarını içeren `*.last` dosyaları (görselleştirilmiş görev grafikleri ve HTML raporları dahil) oluşturur.
- **Kapsamlı İşletim Sistemi Entegrasyonu (OS Integration Service)**: Windows, macOS ve Linux üzerinde dosya sistemi işlemleri, süreç yönetimi, sistem bilgisi toplama ve CUDA hızlandırmalı ekran görüntüsü alma gibi yetenekler sunar.
- **Merkezi Arşivleme (Archive Service)**: `*.last` dosyalarını kabul eder, doğrular, PostgreSQL veritabanında saklar, NATS üzerinden mesajlaşma ile entegre olur ve `*.atlas` dosyaları oluşturarak bilgi birikimini sağlar.
- **Yapay Zeka Orkestrasyonu (AI Orchestrator)**: Farklı yapay zeka modellerinin yönetimini, dağıtımını ve entegrasyonunu koordine eder.
- **Güvenlik Katmanı**: Platform genelinde güvenlik ve izolasyon mekanizmaları sağlar.
- **Çoklu Arayüz Desteği**: Masaüstü (Electron/React), web (React) ve mobil (React Native) arayüzler için altyapı sunar.

## Mimari Yapı

ALT_LAS, aşağıdaki ana bileşenlerden oluşmaktadır:

- **API Gateway**: Tüm dış istekler için merkezi giriş noktası. Kimlik doğrulama, yetkilendirme, yönlendirme, yük dengeleme, önbellekleme ve güvenlik politikalarını uygular. (Node.js/Express tabanlı)
- **Workflow Engine**: Kullanıcıların iş akışlarını tanımlamasını, zamanlamasını ve yürütmesini sağlar. Çeşitli "parçaları" (tetikleyiciler, eylemler, entegrasyonlar) bir araya getirerek karmaşık otomasyonlar oluşturur. (Python/FastAPI tabanlı)
- **Segmentation Service**: Kullanıcıdan gelen doğal dil komutlarını alır, analiz eder ve Workflow Engine veya Runner Service tarafından işlenebilecek yapılandırılmış görev segmentlerine (`*.alt` dosyaları) dönüştürür. Mod ve Persona sistemlerini destekler. (Python/FastAPI tabanlı)
- **Runner Service**: `*.alt` dosyalarında tanımlanan görevleri yürütür, AI servisleriyle etkileşime girer ve sonuçları (`*.last` dosyaları, HTML raporları, görev grafikleri) üretir. (Rust tabanlı)
- **Archive Service**: Yürütme sonuçlarını (`*.last` dosyaları) ve bunlardan türetilen bilgi birikimlerini (`*.atlas` dosyaları) kalıcı olarak saklar, aranabilir ve analiz edilebilir hale getirir. (Go tabanlı)
- **OS Integration Service**: Farklı işletim sistemleriyle (Windows, macOS, Linux) düşük seviyeli etkileşimler sağlar; dosya yönetimi, süreç kontrolü, ekran görüntüsü alma gibi. (Rust tabanlı)
- **AI Orchestrator**: Çeşitli yerel ve bulut tabanlı yapay zeka modellerinin yönetimini, dağıtımını ve kullanımını koordine eder. (Python tabanlı)
- **UI Bileşenleri**: Kullanıcıların platformla etkileşime girmesi için masaüstü, web ve mobil arayüzler sunar.
- **Security Layer**: Platformun genel güvenliğini sağlamak için çeşitli mekanizmalar içerir.

## Başlarken

### Gereksinimler

- Git
- Docker ve Docker Compose
- Node.js (API Gateway için, sürüm için `api-gateway/README.md` kontrol edin)
- Python (Segmentation Service, Workflow Engine, AI Orchestrator için, sürüm için ilgili servislerin README dosyalarını kontrol edin)
- Rust (Runner Service, OS Integration Service için, sürüm için ilgili servislerin README dosyalarını kontrol edin)
- Go (Archive Service için, sürüm için `archive-service/README.md` kontrol edin)

### Kurulum

Projenin hızlı bir şekilde ayağa kaldırılması için Docker Compose kullanılması önerilir:

```bash
# Repoyu klonlayın
git clone https://github.com/krozenking/ALT_LAS.git
cd ALT_LAS

# Ortam değişkenlerini ayarlayın:
# Her servisin kendi dizininde `.env.example` dosyası bulunabilir.
# Bu dosyaları `.env` olarak kopyalayın ve kendi yapılandırmanıza göre düzenleyin.
# Özellikle API Gateway için JWT_SECRET, REDIS_URL gibi kritik değişkenler ayarlanmalıdır.
# Örneğin API Gateway için:
# cd api-gateway
# cp .env.example .env
# nano .env # .env dosyasını düzenleyin
# cd ..

# Docker imajlarını oluşturun ve servisleri başlatın
docker-compose up --build -d
```

Servislerin manuel kurulumu ve çalıştırılması için lütfen her servisin kendi `README.md` dosyasına başvurun.

## Geliştirme

Her bileşen kendi dizininde bulunur ve bağımsız olarak geliştirilebilir. Detaylı bilgi ve geliştirme süreçleri için ilgili servisin `README.md` dosyasına bakınız:

- `api-gateway/`: API Gateway servisi (Node.js/Express).
- `workflow-engine/`: İş Akışı Motoru servisi (Python/FastAPI).
- `segmentation-service/`: Segmentation servisi (Python/FastAPI).
- `runner-service/`: Runner servisi (Rust).
- `archive-service/`: Archive servisi (Go).
- `os-integration-service/`: İşletim Sistemi Entegrasyon servisi (Rust).
- `ai-orchestrator/`: AI Orkestrasyon servisi (Python).
- `ui/desktop/`: Masaüstü uygulaması (Electron/React).
- `ui/web/`: Web dashboard (React).
- `ui/mobile/`: Mobil uygulama (React Native).
- `security/`: Güvenlik katmanı.
- `docs/`: Genel proje dokümantasyonu.

## Dokümantasyon

**Proje Durumu:** Proje aktif geliştirme aşamasındadır ve Beta sürümüne doğru ilerlemektedir. Geliştirme ve iyileştirmeler devam etmektedir.

Detaylı dokümantasyon için aşağıdaki belgelere bakın:

- [Mimari Tasarım](architecture.md) (Güncellenmeli)
- [Geliştirme Yol Haritası](roadmap.md) (Gözden geçirilmeli)
- [API Referansı](api-gateway/swagger.yaml) (API Gateway çalışırken `/api-docs` adresinden erişilebilir.)
- Her servisin kendi klasöründeki `README.md` dosyaları (örn: `api-gateway/README.md`, `runner-service/README.md`)
- [Geliştirici Kılavuzu](docs/developer-guide.md) (Güncellenmeli)
- [Kullanıcı Kılavuzu](docs/user-guide.md) (Güncellenmeli)

## Lisans

Bu proje, ticari kullanıma uygun çeşitli açık kaynak lisansları altında geliştirilmiştir. Ana lisanslar MIT ve Apache 2.0 olmakla birlikte, kullanılan kütüphanelere göre farklılıklar olabilir. Detaylar için her bileşenin kendi lisans bilgilerine ve projenin ana `LICENSE` dosyasına (eğer varsa) bakınız.

## Katkıda Bulunma

Katkıda bulunmak istiyorsanız, lütfen GitHub Issues üzerinden açık görevleri inceleyin veya yeni önerilerde bulunun. Geliştirme sürecinde aşağıdaki genel adımları izleyebilirsiniz:

1. İlgilendiğiniz konuyu (issue) belirleyin veya oluşturun.
2. Projeyi fork'layın ve kendi branch'inizi oluşturun (`git checkout -b feature/your-feature-name`).
3. Değişikliklerinizi yapın ve test edin.
4. Değişikliklerinizi commit'leyin (`git commit -m "Açıklayıcı commit mesajı"`).
5. Branch'inizi ana repoya push'layın (`git push origin feature/your-feature-name`).
6. Pull request oluşturun ve kod incelemesi sürecini takip edin.

## İletişim

Proje ile ilgili sorularınız, önerileriniz veya tartışmalarınız için GitHub Issues platformunu kullanabilirsiniz.
