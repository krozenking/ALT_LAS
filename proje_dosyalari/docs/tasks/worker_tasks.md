# ALT_LAS İşçi Görev Dağılımı (Özet)

Bu belge, ALT_LAS projesinde yer alan 8 farklı işçinin temel sorumluluk alanlarını özetlemektedir. Her işçi, projenin belirli bir alanından sorumlu olacak ve kendi uzmanlık alanına göre geliştirme yapacaktır.

**Detaylı görev tanımları, haftalık planlar ve teknik gereksinimler için lütfen [İşçi Detaylı Görevler (worker_tasks_detailed.md)](worker_tasks_detailed.md) belgesine bakın.**

## İşçi Listesi ve Temel Sorumluluk Alanları

1.  **İşçi 1: Backend Lider**
    *   **Sorumluluk Alanları:** API Gateway geliştirme ve yönetimi, mikroservis mimarisinin koordinasyonu, backend servisler arası iletişim protokolleri, performans optimizasyonu ve ölçeklendirme.

2.  **İşçi 2: Segmentation Uzmanı**
    *   **Sorumluluk Alanları:** Segmentation Service geliştirme, DSL (Domain Specific Language) tasarımı ve implementasyonu, *.alt dosya formatı ve işleme, NLP (Doğal Dil İşleme) entegrasyonu.

3.  **İşçi 3: Runner Geliştirici**
    *   **Sorumluluk Alanları:** Runner Service geliştirme, segmentlerin paralel ve asenkron işlenmesi, AI servis entegrasyonları ve adaptörleri, *.last dosya üretimi, hata toleransı.

4.  **İşçi 4: Archive ve Veri Yönetimi Uzmanı**
    *   **Sorumluluk Alanları:** Archive Service geliştirme, veritabanı tasarımı ve yönetimi (PostgreSQL), mesaj kuyruğu entegrasyonu (NATS), *.atlas arşiv sistemi.

5.  **İşçi 5: UI/UX Geliştirici**
    *   **Sorumluluk Alanları:** Desktop UI geliştirme (Electron/React), Web Dashboard geliştirme, UI/UX tasarım sistemi, kullanıcı deneyimi optimizasyonu.

6.  **İşçi 6: OS Entegrasyon Uzmanı**
    *   **Sorumluluk Alanları:** OS Integration Service geliştirme, işletim sistemi API'leri ile entegrasyon (Windows, macOS, Linux), dosya sistemi erişimi, uygulama kontrolü.

7.  **İşçi 7: AI Uzmanı**
    *   **Sorumluluk Alanları:** AI Orchestrator geliştirme, Local LLM entegrasyonu, Computer Vision ve ses işleme servisleri, model yönetimi ve optimizasyonu.

8.  **İşçi 8: Güvenlik ve DevOps Uzmanı**
    *   **Sorumluluk Alanları:** Güvenlik katmanı geliştirme, CI/CD pipeline kurulumu ve yönetimi, konteyner orkestrasyon ve dağıtım (Docker, Kubernetes), izleme ve günlük kaydı sistemleri (Prometheus, Grafana), sandbox yönetimi.

## Görev Bağımlılıkları ve İş Birliği

### Kritik Bağımlılıklar
1. API Gateway (İşçi 1) → Tüm servisler için giriş noktası
2. Segmentation Service (İşçi 2) → Runner Service için girdi sağlar
3. Runner Service (İşçi 3) → Archive Service için girdi sağlar
4. OS Integration (İşçi 6) → AI Orchestrator (İşçi 7) için sistem erişimi sağlar

### İş Birliği Gerektiren Alanlar
1. API Tasarımı: İşçi 1, 2, 3, 4 arasında koordinasyon
2. Veri Formatları: İşçi 2, 3, 4 arasında standardizasyon
3. UI-Backend Entegrasyonu: İşçi 1 ve 5 arasında iş birliği
4. Güvenlik Uygulamaları: Tüm işçiler ve İşçi 8 arasında koordinasyon

## İlerleme Takibi ve Raporlama

Her işçi, aşağıdaki şekilde ilerleme raporlaması yapacaktır:

1. Günlük commit'ler ve pull request'ler
2. Haftalık ilerleme raporları (GitHub Issues üzerinden)
3. İki haftalık sprint değerlendirmeleri
4. Kilometre taşı tamamlama raporları
5. **Detaylı dokümantasyon**: Her işçi, kendi servisinin/modülünün dizinindeki `docs/` klasöründe veya merkezi bir `/docs/workers/` klasöründe (kararlaştırılacak) çalışmalarını belgeleyecektir. Detaylar için [İşçi Dokümantasyon Şablonu](worker_documentation_template.md) ve ilgili dokümantasyon kılavuzuna bakın. *(Not: Dokümantasyon yapısı netleştirilecektir.)*

## Dokümantasyon Gereksinimleri

*(Not: Bu bölüm, dokümantasyon yapısı netleştirildikten sonra güncellenecektir. Şimdilik [İşçi Dokümantasyon Şablonu](worker_documentation_template.md) kullanılacaktır.)*

1.  **Dokümantasyon Şablonu**: Projenin kök dizininde bulunan `worker_documentation_template.md` şablonunu kullanarak kendi dokümantasyonunuzu oluşturun.
2.  **Düzenli Güncelleme**: Dokümantasyonunuzu en az haftada bir güncelleyin.
3.  **İçerik Gereksinimleri**: Tamamlanan görevler, devam eden görevler, teknik detaylar, API dokümantasyonu ve diğer işçilerle iş birliği bilgilerini içermelidir.
4.  **Dokümantasyon Kılavuzu**: Detaylı dokümantasyon gereksinimleri için ilgili kılavuz dosyasına bakın (yeri belirlenecek).

## Başlangıç Kılavuzu

Her işçi için başlangıç adımları:

1. GitHub reposunu klonlayın: `git clone https://github.com/krozenking/ALT_LAS.git`
2. Kendi sorumlu olduğunuz modül dizinine gidin.
3. İlgili README.md dosyasını okuyun ve kurulum adımlarını takip edin.
4. İlk görevlerinizi GitHub Issues'dan alın.
5. Geliştirme ortamınızı kurun ve ilk commit'inizi yapın.
6. Dokümantasyon şablonunu kullanarak kendi dokümantasyonunuzu oluşturmaya başlayın.
7. Git LFS'i kurun ve yapılandırın (detaylar için `GIT_LFS_NOTICE.md` dosyasını inceleyin).

## İletişim ve İş Birliği

- Günlük stand-up toplantıları (15 dakika)
- Haftalık teknik tartışma oturumları (1 saat)
- GitHub Issues üzerinden görev takibi
- Slack/Discord üzerinden anlık iletişim
- Kod incelemeleri için pull request'ler
- Dokümantasyon incelemeleri ve geri bildirimler

