# ALT_LAS

ALT_LAS, bilgisayar sistemlerini yapay zeka ile yönetmek için tasarlanmış, modüler bir mikroservis mimarisi kullanan, açık kaynaklı ve ticari kullanıma uygun bir platformdur.

## Proje Genel Bakış

ALT_LAS, UI-TARS-desktop'ın kullanıcı arayüzü yetenekleri ile alt_last'ın bilgisayar yönetim özelliklerini birleştirerek daha güçlü bir çözüm sunmayı hedeflemektedir. Sistem, komutları alt görevlere bölen, sonuçları işleyen ve başarılı sonuçları arşivleyen bir yapıya sahiptir.

## Temel Özellikler

- Modüler mikroservis mimarisi
- Dosya tabanlı iş akışı (*.alt, *.last, *.atlas)
- Çoklu çalışma modları (Normal, Dream, Explore, Chaos)
- Persona sistemi ile kişiselleştirilmiş deneyim
- Masaüstü, web ve mobil arayüzler
- İşletim sistemi entegrasyonu
- Yerel AI modelleri ile düşük gecikme süresi
- Güvenli sandbox izolasyonu

## Mimari Yapı

ALT_LAS, aşağıdaki ana bileşenlerden oluşmaktadır:

- **API Gateway**: Tüm istekleri karşılar, kimlik doğrulama/yetkilendirme yapar, servis keşfi ve yönlendirme sağlar, performansı izler.
- **Segmentation Service**: Komutları alt görevlere böler
- **Runner Service**: Alt görevleri işler ve sonuçları üretir
- **Archive Service**: Başarılı sonuçları arşivler
- **UI Bileşenleri**: Masaüstü, web ve mobil arayüzler
- **OS Integration**: İşletim sistemi entegrasyonu
- **AI Orchestrator**: Yapay zeka modellerini koordine eder
- **Security Layer**: Güvenlik ve izolasyon sağlar

## Başlarken

### Gereksinimler

- Git
- Docker ve Docker Compose
- Node.js 18+
- Python 3.10+
- Rust 1.70+
- Go 1.20+

### Kurulum

```bash
# Repoyu klonlayın
git clone https://github.com/krozenking/ALT_LAS.git
cd ALT_LAS

# Geliştirme ortamını kurun
./scripts/setup.sh

# Servisleri başlatın
docker-compose up -d
```

## Geliştirme

Her bileşen kendi dizininde bulunur ve bağımsız olarak geliştirilebilir:

- `api-gateway/`: API Gateway servisi (Node.js/Express). **Worker 1 tarafından geliştirildi:** JWT token yenileme, çıkış, rol tabanlı erişim kontrolü (RBAC), gelişmiş servis keşfi (sağlık kontrolleri ile), performans izleme ve güncellenmiş Swagger dokümantasyonu eklendi. Detaylar için `api-gateway/CHANGELOG.md` dosyasına bakın.
- `segmentation-service/`: Segmentation servisi (Python/FastAPI)
- `runner-service/`: Runner servisi (Rust)
- `archive-service/`: Archive servisi (Go)
- `ui/desktop/`: Masaüstü uygulaması (Electron/React)
- `ui/web/`: Web dashboard (React)
- `ui/mobile/`: Mobil uygulama (React Native)
- `os-integration/`: İşletim sistemi entegrasyonu (Rust/C++)
- `ai-orchestrator/`: AI orkestrasyon servisi (Python)
- `security/`: Güvenlik katmanı (Rust/Go)
- `docs/`: Dokümantasyon

## Dokümantasyon

Detaylı dokümantasyon için aşağıdaki belgelere bakın:

- [Mimari Tasarım](architecture.md)
- [Geliştirme Yol Haritası](roadmap.md)
- [İşçi Görev Dağılımı](worker_tasks.md)
- [API Referansı](docs/api-reference.md) (Güncellenmiş API Gateway dokümantasyonu için `api-gateway/swagger.yaml` dosyasına bakın)
- [Geliştirici Kılavuzu](docs/developer-guide.md)
- [Kullanıcı Kılavuzu](docs/user-guide.md)

## Lisans

Bu proje ticari kullanıma uygun ücretsiz lisanslar kullanılarak geliştirilmiştir:

- MIT Lisansı (çoğu bileşen)
- Apache 2.0 Lisansı (bazı kütüphaneler)
- BSD-3-Clause Lisansı (Go bileşenleri)
- PostgreSQL Lisansı (veritabanı)

## Katkıda Bulunma

Katkıda bulunmak için lütfen [İşçi Görev Dağılımı](worker_tasks.md) belgesini inceleyin ve size atanan görevlere odaklanın. Geliştirme sürecinde aşağıdaki adımları izleyin:

1. Görevinizi GitHub Issues'dan alın
2. Yeni bir branch oluşturun
3. Değişikliklerinizi yapın ve test edin
4. Pull request oluşturun
5. Kod incelemesi sonrası birleştirme yapılacaktır

## İletişim

Proje ile ilgili sorularınız için GitHub Issues kullanın veya ekip iletişim kanallarına başvurun.

