# ALT_LAS Detaylı İşçi Görevleri

Bu belge, ALT_LAS projesinin 8 işçisi için güncellenmiş ve daha detaylı görev tanımlarını içermektedir. Her işçi için spesifik sorumluluklar, teknik gereksinimler ve beklenen çıktılar net bir şekilde tanımlanmıştır. Görevler, genel proje yol haritasının ilk aşamalarını kapsayan 12 haftalık bir plana göre düzenlenmiştir.

## İşçi 1: Backend Lider - API Gateway Geliştirme

### Temel Sorumluluklar
- API Gateway mimarisinin tasarımı ve implementasyonu
- Mikroservisler arası iletişim altyapısının kurulması
- Kimlik doğrulama ve yetkilendirme sisteminin geliştirilmesi
- API dokümantasyonu ve standartlarının oluşturulması
- Backend ekibinin teknik liderliği

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 1.1: Temel Altyapı (Hafta 1-2) - Durum: Tamamlandı
- **Mikro Görev 1.1.1:** Express.js/Node.js ile API Gateway projesinin kurulumu - Durum: Tamamlandı
  - Detay: TypeScript yapılandırması, ESLint/Prettier entegrasyonu, Jest test altyapısı, Docker konteyner yapılandırması.
- **Mikro Görev 1.1.2:** Middleware yapılandırması - Durum: Tamamlandı
  - Detay: CORS politikası, Rate limiting, Body parsing/validasyon, Compression.
- **Mikro Görev 1.1.3:** Loglama altyapısının kurulumu - Durum: Tamamlandı
  - Detay: Winston logger, Log seviyeleri/formatları, Log rotasyonu, OpenTelemetry entegrasyonu. (Not: Log rotasyonu ve OpenTelemetry entegrasyonu tarafımca eklendi.)
- **Mikro Görev 1.1.4:** Hata işleme mekanizması - Durum: Tamamlandı
  - Detay: Global hata yakalama, Hata sınıfları, HTTP durum kodları standardizasyonu, Kullanıcı dostu hata mesajları.
- **Mikro Görev 1.1.5:** Swagger/OpenAPI entegrasyonu - Durum: Tamamlandı
  - Detay: API şeması tanımlama, Otomatik dokümantasyon, API test arayüzü, Şema validasyonu.

#### Makro Görev 1.2: Kimlik Doğrulama ve Yetkilendirme (Hafta 3-4) - Durum: Kısmen Tamamlandı
- **Mikro Görev 1.2.1:** JWT tabanlı kimlik doğrulama sistemi - Durum: Tamamlandı
  - Detay: Token oluşturma/doğrulama, Refresh token, JWT imzalama/şifreleme, Token blacklisting. (Not: Token blacklisting, oturum sonlandırma ile dolaylı olarak mevcut).
- **Mikro Görev 1.2.2:** Rol tabanlı yetkilendirme sistemi - Durum: Tamamlandı
  - Detay: Rol/izin modeli, Yetkilendirme middleware, Dinamik izin kontrolü, Rol hiyerarşisi. (Not: Rol/izin modeli, yetkilendirme middleware, dinamik izin kontrolü mevcut).
- **Mikro Görev 1.2.3:** Kullanıcı yönetimi API'leri - Durum: Kısmen Tamamlandı
  - Detay: Kullanıcı CRUD, Profil yönetimi, Şifre sıfırlama/değiştirme, E-posta doğrulama. (Not: E-posta doğrulama özelliği mock/eksik).
- **Mikro Görev 1.2.4:** Oturum yönetimi - Durum: Kısmen Tamamlandı
  - Detay: Oturum oluşturma/sonlandırma, Çoklu cihaz desteği, Oturum süresi/yenileme, Oturum analitikleri. (Not: Temel oturum yönetimi, çoklu cihaz desteği mevcut; oturum analitikleri eksik).
- **Mikro Görev 1.2.5:** Güvenlik testleri - Durum: Beklemede
  - Detay: Penetrasyon testleri, OWASP kontrolü, Token güvenliği, Yetkilendirme bypass testleri. (Not: Kodda belirgin bir kanıt yok).

#### Makro Görev 1.3: Servis Entegrasyonu (Hafta 5-6) - Durum: Kısmen Tamamlandı
- **Mikro Görev 1.3.1:** Segmentation Service ile entegrasyon - Durum: Kısmen Tamamlandı
  - Detay: API endpoint tanımları, İstek/yanıt şemaları, Hata işleme, Performans optimizasyonu. (Not: Temel proxy ve client'lar mevcut; hata işleme, performans optimizasyonu ve circuit breaker (placeholder) detaylandırılmalı).
- **Mikro Görev 1.3.2:** Runner Service ile entegrasyon - Durum: Kısmen Tamamlandı
  - Detay: API endpoint tanımları, İstek/yanıt şemaları, Asenkron işlem yönetimi, İlerleme izleme. (Not: Temel proxy ve client'lar mevcut; hata işleme, performans optimizasyonu ve circuit breaker (placeholder) detaylandırılmalı).
- **Mikro Görev 1.3.3:** Archive Service ile entegrasyon - Durum: Kısmen Tamamlandı
  - Detay: API endpoint tanımları, İstek/yanıt şemaları, Dosya transferi optimizasyonu, Metadata yönetimi. (Not: Temel proxy ve client'lar mevcut; hata işleme, performans optimizasyonu ve circuit breaker (placeholder) detaylandırılmalı).
- **Mikro Görev 1.3.4:** Servis keşif mekanizması - Durum: Kısmen Tamamlandı
  - Detay: Service registry, Dinamik servis keşfi, Load balancing, Circuit breaker pattern. (Not: Temel servis kayıt ve keşfi, sağlık kontrolü mevcut; dinamik load balancing ve gelişmiş circuit breaker eksik).
- **Mikro Görev 1.3.5:** Servis sağlık kontrolü ve izleme - Durum: Kısmen Tamamlandı
  - Detay: Health check endpoint'leri, Servis metrikleri toplama, Alarm mekanizması, Dashboard entegrasyonu. (Not: Health check endpoint'leri ve temel metrik toplama mevcut; alarm mekanizması ve dashboard entegrasyonu eksik).

#### Makro Görev 1.4: API Geliştirme ve Optimizasyon (Hafta 7-8) - Durum: Kısmen Tamamlandı
- **Mikro Görev 1.4.1:** Komut işleme API'leri - Durum: Kısmen Tamamlandı
  - Detay: Komut gönderme, Komut durumu sorgulama, Komut geçmişi, Komut iptal etme. (Not: Route'lar mevcut, detaylı implementasyon durumu incelenmeli).
- **Mikro Görev 1.4.2:** Dosya yönetimi API'leri - Durum: Kısmen Tamamlandı
  - Detay: *.alt/*.last/*.atlas dosya yükleme/indirme, Dosya metadata yönetimi. (Not: Route'lar mevcut, detaylı implementasyon durumu incelenmeli).
- **Mikro Görev 1.4.3:** Performans optimizasyonu ve caching - Durum: Kısmen Tamamlandı
  - Detay: Redis cache, Response caching, Query optimizasyonu, Bulk operasyonlar. (Not: Redis ile response caching mevcut; query optimizasyonu, bulk operasyonlar belirsiz).
- **Mikro Görev 1.4.4:** API versiyonlama stratejisi - Durum: Kısmen Tamamlandı
  - Detay: URL/Header tabanlı versiyonlama, Geriye dönük uyumluluk, Versiyon geçiş planı. (Not: URL ile `/v1/` kullanılıyor; geriye dönük uyumluluk ve geçiş planı dokümantasyonu eksik).
- **Mikro Görev 1.4.5:** Kapsamlı API testleri - Durum: Kısmen Tamamlandı
  - Detay: Birim, Entegrasyon, Yük, Sınır durum testleri. (Not: Birim/entegrasyon testleri bazı modüller için mevcut; yük ve sınır durum testleri eksik).

#### Makro Görev 1.5: İleri Özellikler (Hafta 9-10) - Durum: Kısmen Başlandı
- **Mikro Görev 1.5.1:** WebSocket desteği - Durum: Beklemede
  - Detay: Sunucu implementasyonu, Oturum yönetimi, Mesaj formatı, Ölçeklenebilir mimari.
- **Mikro Görev 1.5.2:** Gerçek zamanlı bildirim sistemi - Durum: Kısmen Başlandı
  - Detay: Bildirim modeli, Push notification, Bildirim tercihleri, Okundu/okunmadı takibi. (Not: `notificationService.ts` mevcut, ancak tam entegrasyon ve push notification eksik).
- **Mikro Görev 1.5.3:** API kullanım analitikleri - Durum: Kısmen Başlandı
  - Detay: Kullanım metrikleri, Analitik raporlama, Anomali tespiti, Kullanım trendleri. (Not: Temel performans metrikleri mevcut; gelişmiş analitik ve raporlama eksik).
- **Mikro Görev 1.5.4:** API dokümantasyonunun genişletilmesi - Durum: Kısmen Tamamlandı
  - Detay: Kullanım örnekleri, Kod parçacıkları, İnteraktif API explorer, SDK oluşturma. (Not: `swagger.yaml` detaylı; kullanım örnekleri, SDK oluşturma eksik).
- **Mikro Görev 1.5.5:** Yük testi ve ölçeklendirme - Durum: Beklemede
  - Detay: Yük testi senaryoları, Performans darboğazı tespiti, Otomatik ölçeklendirme, Yük dengeleme.

#### Makro Görev 1.6: Entegrasyon ve Stabilizasyon (Hafta 11-12) - Durum: Kısmen Başlandı/Devam Ediyor
- **Mikro Görev 1.6.1:** UI entegrasyonu - Durum: Beklemede
  - Detay: Frontend API client, API hata işleme, API kullanım örnekleri, UI-API kontrat testleri. (Not: API Gateway açısından hazır, UI geliştirmesine bağlı).
- **Mikro Görev 1.6.2:** E2E testleri - Durum: Beklemede
  - Detay: Test senaryoları, Test otomasyonu, Test raporlama, Sürekli entegrasyon.
- **Mikro Görev 1.6.3:** Hata ayıklama ve performans iyileştirmeleri - Durum: Devam Ediyor
  - Detay: Profiling, Bellek sızıntısı analizi, CPU/Ağ trafiği optimizasyonu. (Not: Sürekli bir görev, CHANGELOG'da bazı iyileştirmeler mevcut).
- **Mikro Görev 1.6.4:** Dokümantasyon güncellemesi - Durum: Kısmen Tamamlandı
  - Detay: API referansı, Mimari, Deployment, Sorun giderme kılavuzu. (Not: API referansı ve mimari dokümanı genel projede mevcut; API Gateway özelinde detaylı deployment ve sorun giderme kılavuzları eksik olabilir).
- **Mikro Görev 1.6.5:** Dağıtım ve CI/CD entegrasyonu - Durum: Kısmen Tamamlandı
  - Detay: CI/CD pipeline, Deployment stratejisi, Rollback, Monitoring/alerting. (Not: Dockerfile mevcut; CI/CD pipeline entegrasyonu belirsiz).

### Teknik Gereksinimler
- Node.js 18+, TypeScript 5.0+, Express.js 4.18+, JWT 9.0+, Swagger/OpenAPI 3.0+, Jest 29.0+, Winston 3.8+, Redis 7.0+, Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- ESLint uyarısı: 0
- TypeScript strict mode: Aktif
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 2: Segmentation Uzmanı - Segmentation Service Geliştirme

### Temel Sorumluluklar
- Doğal dil komutlarını ayrıştırma ve segmentlere ayırma
- DSL (Domain Specific Language) tasarımı ve implementasyonu
- Mod ve persona sisteminin geliştirilmesi
- NLP (Natural Language Processing) entegrasyonu
- Segmentasyon algoritmaları ve optimizasyonu

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 2.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 2.1.1:** Python/FastAPI ile Segmentation Service projesinin kurulumu
  - Detay: Proje yapısı, Dependency injection, Asenkron destek, Docker yapılandırması.
- **Mikro Görev 2.1.2:** Temel API yapılandırması
  - Detay: RESTful API tasarımı, Endpoint tanımları, Pydantic validasyonu, API versiyonlama.
- **Mikro Görev 2.1.3:** Loglama ve hata işleme
  - Detay: Yapılandırılabilir loglama, Hata yakalama/raporlama, Distributed tracing, Metrik toplama.
- **Mikro Görev 2.1.4:** Veri modelleri (Pydantic)
  - Detay: Komut, Segment, Metadata, DSL şema modelleri.
- **Mikro Görev 2.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Parametrize testler, Kapsam raporlama.

#### Makro Görev 2.2: DSL Tasarımı ve Ayrıştırma (Hafta 3-4)
- **Mikro Görev 2.2.1:** DSL şemasının (YAML/JSON) tasarımı
  - Detay: Komut yapısı, Parametre tipleri, Zorunlu/opsiyonel alanlar, Şema validasyonu.
- **Mikro Görev 2.2.2:** Komut ayrıştırma algoritmasının geliştirilmesi
  - Detay: Tokenizasyon, Sözdizimi/Semantik analiz, Bağlam çözümleme.
- **Mikro Görev 2.2.3:** Metin analizi ve NLP entegrasyonu
  - Detay: spaCy/NLTK entegrasyonu, Varlık tanıma (NER), Bağımlılık ayrıştırma, Duygu analizi.
- **Mikro Görev 2.2.4:** *.alt dosya formatının implementasyonu
  - Detay: Dosya yapısı, Serileştirme/deserileştirme, Şema validasyonu, Versiyon uyumluluğu.
- **Mikro Görev 2.2.5:** Ayrıştırma testleri
  - Detay: Birim, Entegrasyon, Performans, Fuzzing testleri.

#### Makro Görev 2.3: Mod ve Persona Sistemi (Hafta 5-6)
- **Mikro Görev 2.3.1:** Çalışma modlarının implementasyonu
  - Detay: Normal, Dream, Explore, Chaos modları.
- **Mikro Görev 2.3.2:** Chaos level parametrelerinin implementasyonu
  - Detay: Chaos seviye ölçeği, Parametre etki faktörleri, Dinamik ayarlar, Sınırlamalar.
- **Mikro Görev 2.3.3:** Persona sisteminin geliştirilmesi
  - Detay: Persona modeli, Özellikler, Davranış kuralları, Geçişler.
- **Mikro Görev 2.3.4:** Mod ve persona metadata ekleme
  - Detay: Metadata şeması, Enjeksiyon, Analiz, Filtreleme.
- **Mikro Görev 2.3.5:** Mod ve persona testleri
  - Detay: Mod geçiş, Persona davranış, Chaos level, Entegrasyon testleri.

#### Makro Görev 2.4: Segmentasyon ve Metadata (Hafta 7-8)
- **Mikro Görev 2.4.1:** Komut segmentasyon algoritması
  - Detay: Atomik komut ayrıştırma, Bağımlılık analizi, Paralel/sıralı belirleme, Optimum boyut analizi.
- **Mikro Görev 2.4.2:** Metadata ekleme ve etiketleme sistemi
  - Detay: Otomatik metadata çıkarımı, Etiket taksonomisi, Hiyerarşik etiketleme, Metadata zenginleştirme.
- **Mikro Görev 2.4.3:** Bağlam analizi ve anlama
  - Detay: Bağlam penceresi, Devamlılık, Referans çözümleme, Belirsizlik giderme.
- **Mikro Görev 2.4.4:** Değişken çıkarma ve işleme
  - Detay: Değişken tanımlama, Tipler, Kapsam, Bağlama.
- **Mikro Görev 2.4.5:** Segmentasyon testleri
  - Detay: Birim, Entegrasyon, Performans, Karmaşık komut testleri.

#### Makro Görev 2.5: API ve Entegrasyon (Hafta 9-10)
- **Mikro Görev 2.5.1:** API Gateway ile entegrasyon
  - Detay: API endpoint implementasyonu, Kimlik doğrulama, Hata işleme, Rate limiting.
- **Mikro Görev 2.5.2:** Runner Service ile entegrasyon
  - Detay: Segment transfer protokolü, Durum senkronizasyonu, Hata işleme, Performans optimizasyonu.
- **Mikro Görev 2.5.3:** API dokümantasyonu
  - Detay: OpenAPI şeması, Endpoint dokümantasyonu, Örnekler, Kullanım senaryoları.
- **Mikro Görev 2.5.4:** Entegrasyon testleri
  - Detay: API Gateway, Runner Service, E2E, Performans testleri.
- **Mikro Görev 2.5.5:** Performans optimizasyonu
  - Detay: Profiling, Bellek/CPU/Asenkron işlem optimizasyonu.

#### Makro Görev 2.6: İleri Özellikler ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 2.6.1:** Çoklu dil desteği
  - Detay: Dil algılama, Dil spesifik NLP, Çeviri entegrasyonu, Çoklu dil testleri.
- **Mikro Görev 2.6.2:** Öğrenme ve iyileştirme mekanizması
  - Detay: Kullanım verisi toplama, Başarı oranı analizi, Model iyileştirme, A/B testi altyapısı.
- **Mikro Görev 2.6.3:** Hata ayıklama ve performans iyileştirmeleri
  - Detay: Profiling, Bellek sızıntısı analizi, CPU/I/O optimizasyonu.
- **Mikro Görev 2.6.4:** Dokümantasyon güncellemesi
  - Detay: API/DSL referansı, Mimari, Sorun giderme kılavuzu.
- **Mikro Görev 2.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Deployment stratejisi, Rollback, Monitoring/alerting.

### Teknik Gereksinimler
- Python 3.10+, FastAPI 0.95+, Pydantic 2.0+, spaCy 3.5+/NLTK 3.8+, PyYAML 6.0+, pytest 7.3+, Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- flake8/Black uyarısı: 0
- Type hints: Zorunlu
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 3: Runner Geliştirici - Runner Service Geliştirme

**ÖNEMLİ NOT:** Bu göreve başlamadan önce, önceki çalışanın devir notları ve tespit ettiği derleyici uyarıları gibi konuları içeren (artık silinmiş olan) `/ALT_LAS_project/worker3_handover.md` ve `/ALT_LAS_project/runner-service/remaining_warnings.md` dosyalarına referans verildiğini unutmayın. Bu dosyalar silindiği için, mevcut kod tabanını dikkatlice inceleyerek ve olası uyarıları/hataları gidererek başlamanız önerilir.

### Temel Sorumluluklar
- Segmentlerin paralel ve asenkron işlenmesi
- AI servis entegrasyonları ve adaptörleri
- Yüksek performanslı işlem yönetimi
- *.last dosya formatı implementasyonu
- Hata toleransı ve kurtarma mekanizmaları

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 3.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 3.1.1:** Rust/Tokio ile Runner Service projesinin kurulumu
  - Detay: Proje yapısı, Asenkron runtime, Hata işleme, Docker yapılandırması.
- **Mikro Görev 3.1.2:** Temel API yapılandırması
  - Detay: RESTful API, Actix-web router, JSON serileştirme/deserileştirme, API versiyonlama.
- **Mikro Görev 3.1.3:** Loglama ve hata işleme
  - Detay: tracing entegrasyonu, Log seviyeleri, Hata zinciri, Metrik toplama.
- **Mikro Görev 3.1.4:** Veri modelleri (Serde)
  - Detay: Segment, İşlem, Sonuç, Hata modelleri.
- **Mikro Görev 3.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Asenkron test, Kapsam raporlama.

#### Makro Görev 3.2: *.alt Dosya İşleme (Hafta 3-4)
- **Mikro Görev 3.2.1:** *.alt dosya okuma ve ayrıştırma
  - Detay: Dosya formatı parser, Şema validasyonu, Versiyon uyumluluğu, Hata toleransı.
- **Mikro Görev 3.2.2:** Dosya doğrulama ve hata işleme
  - Detay: Bütünlük kontrolü, Şema doğrulama, Hata raporlama, Kurtarma stratejileri.
- **Mikro Görev 3.2.3:** Segment işleme altyapısı
  - Detay: Segment ayrıştırma, Bağımlılık grafiği, İşlem sırası optimizasyonu, Durum izleme.
- **Mikro Görev 3.2.4:** Dosya işleme testleri
  - Detay: Birim, Entegrasyon, Performans, Hata senaryoları testleri.
- **Mikro Görev 3.2.5:** Performans optimizasyonu
  - Detay: Bellek/I/O/CPU optimizasyonu, Profiling/benchmark.

#### Makro Görev 3.3: Paralel İşlem Yönetimi (Hafta 5-6)
- **Mikro Görev 3.3.1:** Asenkron görev yönetim sistemi
  - Detay: Tokio task yönetimi, Future kompozisyonu, Asenkron stream, Backpressure.
- **Mikro Görev 3.3.2:** İş parçacığı havuzu implementasyonu
  - Detay: Dinamik havuz, İş dağıtım algoritması, Yaşam döngüsü, Kaynak izleme.
- **Mikro Görev 3.3.3:** Görev önceliklendirme
  - Detay: Öncelik kuyrukları, Preemptive/Deadline-aware scheduling, Kaynak bazlı önceliklendirme.
- **Mikro Görev 3.3.4:** Hata toleransı ve kurtarma mekanizmaları
  - Detay: Yeniden deneme, Circuit breaker, Graceful degradation, Checkpoint/kurtarma.
- **Mikro Görev 3.3.5:** Paralel işlem testleri
  - Detay: Birim, Entegrasyon, Yük, Hata enjeksiyon testleri.

#### Makro Görev 3.4: AI Servis Entegrasyonu (Hafta 7-8)
- **Mikro Görev 3.4.1:** AI servisleri için çağrı sistemi
  - Detay: HTTP client, Asenkron API çağrıları, Rate limiting/kota, Timeout/retry.
- **Mikro Görev 3.4.2:** Farklı AI modelleri için adaptörler
  - Detay: OpenAI, Anthropic, Mistral AI, Yerel model (llama.cpp) adaptörleri.
- **Mikro Görev 3.4.3:** Yanıt işleme ve birleştirme
  - Detay: Yanıt ayrıştırma, Format dönüştürme, Birleştirme algoritması, Tutarlılık kontrolü.
- **Mikro Görev 3.4.4:** Hata işleme ve yeniden deneme mekanizmaları
  - Detay: Servis hatası işleme, Yeniden deneme, Fallback, Hata raporlama.
- **Mikro Görev 3.4.5:** AI entegrasyon testleri
  - Detay: Birim, Entegrasyon, Performans, Hata senaryoları testleri.

#### Makro Görev 3.5: *.last Dosya Üretimi (Hafta 9-10)
- **Mikro Görev 3.5.1:** *.last dosya formatı implementasyonu
  - Detay: Dosya yapısı, Serileştirme/deserileştirme, Versiyon yönetimi, Geriye dönük uyumluluk.
- **Mikro Görev 3.5.2:** Sonuç değerlendirme ve başarı oranı hesaplama
  - Detay: Başarı metrikleri, Segment başarı, Genel başarı oranı, Başarısızlık analizi.
- **Mikro Görev 3.5.3:** Metadata ekleme
  - Detay: İşlem, Performans, Kaynak kullanımı, Hata/uyarı metadata'sı.
- **Mikro Görev 3.5.4:** Dosya yazma ve doğrulama
  - Detay: Atomik yazma, Bütünlük kontrolü, Şema doğrulama, Sıkıştırma.
- **Mikro Görev 3.5.5:** *.last üretim testleri
  - Detay: Birim, Entegrasyon, Performans, Hata senaryoları testleri.

#### Makro Görev 3.6: Performans ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 3.6.1:** Bellek optimizasyonu
  - Detay: Profiling, Sızıntı analizi, Bellek havuzu, Zero-copy.
- **Mikro Görev 3.6.2:** CPU optimizasyonu
  - Detay: Hot path analizi, Algoritma optimizasyonu, Cache-friendly yapılar, SIMD.
- **Mikro Görev 3.6.3:** Yük testi ve ölçeklendirme
  - Detay: Yük testi senaryoları, Ölçeklendirme limitleri, Darboğaz analizi, Kaynak optimizasyonu.
- **Mikro Görev 3.6.4:** Dokümantasyon güncellemesi
  - Detay: API referansı, *.last formatı, Mimari, Sorun giderme kılavuzu.
- **Mikro Görev 3.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Deployment stratejisi, Rollback, Monitoring/alerting.

### Teknik Gereksinimler
- Rust 1.70+, Tokio 1.28+, Actix-web 4.3+, Serde 1.0+, tracing 0.1+, Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- Clippy uyarısı: 0
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 4: Archive Uzmanı - Archive Service Geliştirme

### Temel Sorumluluklar
- *.last dosyalarının ve metadata'larının arşivlenmesi
- *.atlas dosya formatının implementasyonu
- Arşiv arama ve sorgulama API'leri
- Veri sıkıştırma ve depolama optimizasyonu
- Veri bütünlüğü ve güvenliği

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 4.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 4.1.1:** Go ile Archive Service projesinin kurulumu
  - Detay: Proje yapısı, Gin/Echo framework, Hata işleme, Docker yapılandırması.
- **Mikro Görev 4.1.2:** Temel API yapılandırması
  - Detay: RESTful API, Endpoint tanımları, Veri validasyonu, API versiyonlama.
- **Mikro Görev 4.1.3:** Loglama ve hata işleme
  - Detay: Yapılandırılabilir loglama, Hata yakalama/raporlama, Metrik toplama.
- **Mikro Görev 4.1.4:** Veri modelleri
  - Detay: Arşiv kaydı, Metadata, Sorgu, Sonuç modelleri.
- **Mikro Görev 4.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Kapsam raporlama.

#### Makro Görev 4.2: *.last Dosya Arşivleme (Hafta 3-4)
- **Mikro Görev 4.2.1:** *.last dosya alımı ve validasyonu
  - Detay: Dosya formatı kontrolü, Şema validasyonu, Bütünlük kontrolü, Hata işleme.
- **Mikro Görev 4.2.2:** Metadata çıkarımı ve işleme
  - Detay: Otomatik metadata çıkarımı, Metadata zenginleştirme, İndeksleme.
- **Mikro Görev 4.2.3:** Veri sıkıştırma algoritmaları
  - Detay: Gzip/Brotli, Sıkıştırma seviyeleri, Performans analizi, Kayıp/kayıpsız.
- **Mikro Görev 4.2.4:** Depolama yönetimi
  - Detay: Dosya sistemi/S3 entegrasyonu, Depolama politikaları, Veri yaşam döngüsü.
- **Mikro Görev 4.2.5:** Arşivleme testleri
  - Detay: Birim, Entegrasyon, Performans, Hata senaryoları testleri.

#### Makro Görev 4.3: *.atlas Dosya Üretimi (Hafta 5-6)
- **Mikro Görev 4.3.1:** *.atlas dosya formatı implementasyonu
  - Detay: Dosya yapısı, Serileştirme/deserileştirme, Versiyon yönetimi, Geriye dönük uyumluluk.
- **Mikro Görev 4.3.2:** Arşivlenmiş verilerden *.atlas oluşturma
  - Detay: Veri toplama, Birleştirme, Özetleme, İndeksleme.
- **Mikro Görev 4.3.3:** Metadata ekleme
  - Detay: Arşiv, İstatistik, Kullanım, Kalite metadata'sı.
- **Mikro Görev 4.3.4:** Dosya yazma ve doğrulama
  - Detay: Atomik yazma, Bütünlük kontrolü, Şema doğrulama, Sıkıştırma.
- **Mikro Görev 4.3.5:** *.atlas üretim testleri
  - Detay: Birim, Entegrasyon, Performans, Hata senaryoları testleri.

#### Makro Görev 4.4: Arama ve Sorgulama API'leri (Hafta 7-8)
- **Mikro Görev 4.4.1:** Arama API endpoint'leri
  - Detay: Sorgu dili, Filtreleme, Sıralama, Sayfalama.
- **Mikro Görev 4.4.2:** İndeksleme mekanizması
  - Detay: Elasticsearch/Solr entegrasyonu, İndeks şeması, Sorgu optimizasyonu.
- **Mikro Görev 4.4.3:** Sorgu performansı optimizasyonu
  - Detay: Cache, İndeks optimizasyonu, Sorgu planı analizi, Paralel sorgulama.
- **Mikro Görev 4.4.4:** API yanıt formatları
  - Detay: JSON, CSV, XML, Özel formatlar.
- **Mikro Görev 4.4.5:** Arama API testleri
  - Detay: Birim, Entegrasyon, Performans, Karmaşık sorgu testleri.

#### Makro Görev 4.5: Veri Bütünlüğü ve Güvenliği (Hafta 9-10)
- **Mikro Görev 4.5.1:** Veri bütünlüğü kontrol mekanizmaları
  - Detay: Checksum, Hash, Veri doğrulama, Hata tespiti/düzeltme.
- **Mikro Görev 4.5.2:** Erişim kontrolü ve yetkilendirme
  - Detay: API anahtarları, Rol tabanlı erişim, Veri maskeleme, Denetim kaydı.
- **Mikro Görev 4.5.3:** Veri şifreleme
  - Detay: At-rest/in-transit şifreleme, Anahtar yönetimi, Şifreleme politikaları.
- **Mikro Görev 4.5.4:** Yedekleme ve kurtarma stratejileri
  - Detay: Yedekleme planı, Kurtarma prosedürleri, Felaket kurtarma, Test senaryoları.
- **Mikro Görev 4.5.5:** Güvenlik testleri
  - Detay: Penetrasyon testleri, Veri sızıntısı analizi, Yetkilendirme bypass testleri.

#### Makro Görev 4.6: Entegrasyon ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 4.6.1:** API Gateway ile entegrasyon
  - Detay: API endpoint implementasyonu, Kimlik doğrulama, Hata işleme, Rate limiting.
- **Mikro Görev 4.6.2:** Diğer servislerle entegrasyon
  - Detay: Veri akışı, Senkronizasyon, Hata işleme, Performans optimizasyonu.
- **Mikro Görev 4.6.3:** API dokümantasyonu
  - Detay: OpenAPI şeması, Endpoint dokümantasyonu, Örnekler, Kullanım senaryoları.
- **Mikro Görev 4.6.4:** Hata ayıklama ve performans iyileştirmeleri
  - Detay: Profiling, Bellek/CPU/I/O optimizasyonu.
- **Mikro Görev 4.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Deployment stratejisi, Rollback, Monitoring/alerting.

### Teknik Gereksinimler
- Go 1.20+, Gin/Echo, Elasticsearch/Solr, S3/MinIO, Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- Go lint uyarısı: 0
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 5: Frontend Lider - UI/UX Geliştirme

### Temel Sorumluluklar
- Kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) tasarımı
- React/Next.js ile frontend uygulamasının geliştirilmesi
- API Gateway ile entegrasyon
- Frontend testleri ve performans optimizasyonu
- Frontend ekibinin teknik liderliği

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 5.1: Temel Altyapı ve Tasarım (Hafta 1-2)
- **Mikro Görev 5.1.1:** React/Next.js projesinin kurulumu
  - Detay: TypeScript yapılandırması, ESLint/Prettier, CSS-in-JS/Tailwind CSS, Storybook.
- **Mikro Görev 5.1.2:** UI/UX tasarımının oluşturulması
  - Detay: Wireframe, Mockup, Prototip, Kullanıcı akışları, Figma/Sketch.
- **Mikro Görev 5.1.3:** Temel bileşen kütüphanesinin oluşturulması
  - Detay: Atomik tasarım, Yeniden kullanılabilir bileşenler, Stil rehberi, Erişilebilirlik.
- **Mikro Görev 5.1.4:** Sayfa yönlendirme (routing) ve layout yapısı
  - Detay: Next.js router, Dinamik/statik sayfalar, Ana layout, Hata sayfaları.
- **Mikro Görev 5.1.5:** Temel birim ve bileşen testleri
  - Detay: Jest/React Testing Library, Mock/fixture'lar, Kapsam raporlama.

#### Makro Görev 5.2: Kimlik Doğrulama ve Kullanıcı Yönetimi (Hafta 3-4)
- **Mikro Görev 5.2.1:** Giriş/kayıt sayfaları
  - Detay: Form validasyonu, API entegrasyonu, Hata işleme, Kullanıcı geri bildirimi.
- **Mikro Görev 5.2.2:** Profil yönetimi sayfası
  - Detay: Kullanıcı bilgileri, Şifre değiştirme, E-posta güncelleme, API entegrasyonu.
- **Mikro Görev 5.2.3:** Oturum yönetimi
  - Detay: Token saklama/yenileme, Oturum sonlandırma, Yetkilendirme kontrolü.
- **Mikro Görev 5.2.4:** Rol tabanlı arayüz gösterimi
  - Detay: Dinamik menü/bileşenler, Yetki bazlı özellikler, Kullanıcı deneyimi.
- **Mikro Görev 5.2.5:** Kimlik doğrulama testleri
  - Detay: Birim, Entegrasyon, E2E, Güvenlik testleri.

#### Makro Görev 5.3: Komut Girişi ve Segmentasyon Görüntüleme (Hafta 5-6)
- **Mikro Görev 5.3.1:** Komut giriş arayüzü
  - Detay: Metin alanı, Mod/persona seçimi, Chaos level ayarı, API entegrasyonu.
- **Mikro Görev 5.3.2:** Segmentasyon sonuçlarının görüntülenmesi
  - Detay: *.alt dosya görselleştirme, Segment ağacı, Metadata gösterimi, Hata/uyarı gösterimi.
- **Mikro Görev 5.3.3:** Komut geçmişi ve tekrar çalıştırma
  - Detay: Geçmiş komut listesi, Filtreleme/arama, Tekrar çalıştırma, API entegrasyonu.
- **Mikro Görev 5.3.4:** Gerçek zamanlı ilerleme takibi (WebSocket)
  - Detay: WebSocket bağlantısı, Durum güncellemeleri, Bildirimler, Kullanıcı arayüzü.
- **Mikro Görev 5.3.5:** Komut ve segmentasyon testleri
  - Detay: Birim, Entegrasyon, E2E, Kullanılabilirlik testleri.

#### Makro Görev 5.4: Runner ve Archive Entegrasyonu (Hafta 7-8)
- **Mikro Görev 5.4.1:** Runner sonuçlarının görüntülenmesi
  - Detay: *.last dosya görselleştirme, Başarı oranı, Hata/uyarı gösterimi, API entegrasyonu.
- **Mikro Görev 5.4.2:** Arşiv arama ve görüntüleme arayüzü
  - Detay: Arama formu, Filtreleme/sıralama, Sonuç listesi, *.atlas dosya görselleştirme.
- **Mikro Görev 5.4.3:** Dosya indirme/yükleme arayüzü
  - Detay: *.alt/*.last/*.atlas dosya işlemleri, API entegrasyonu, Kullanıcı geri bildirimi.
- **Mikro Görev 5.4.4:** Veri görselleştirme bileşenleri
  - Detay: Grafikler, Tablolar, Ağaç yapıları, Haritalar.
- **Mikro Görev 5.4.5:** Runner ve arşiv testleri
  - Detay: Birim, Entegrasyon, E2E, Performans testleri.

#### Makro Görev 5.5: İleri Özellikler ve UX İyileştirmeleri (Hafta 9-10)
- **Mikro Görev 5.5.1:** Çoklu dil desteği
  - Detay: i18n entegrasyonu, Dil seçimi, Çeviri yönetimi, RTL desteği.
- **Mikro Görev 5.5.2:** Erişilebilirlik (WCAG) iyileştirmeleri
  - Detay: Klavye navigasyonu, Ekran okuyucu uyumluluğu, Renk kontrastı, ARIA etiketleri.
- **Mikro Görev 5.5.3:** Performans optimizasyonu
  - Detay: Kod bölme, Lazy loading, Bundle boyutu optimizasyonu, Lighthouse skorları.
- **Mikro Görev 5.5.4:** Kullanıcı geri bildirim mekanizması
  - Detay: Geri bildirim formu, Anketler, Hata raporlama, Kullanıcı deneyimi analizi.
- **Mikro Görev 5.5.5:** UX testleri ve A/B testi altyapısı
  - Detay: Kullanılabilirlik testleri, A/B testi senaryoları, Veri toplama, Analiz.

#### Makro Görev 5.6: Stabilizasyon ve Dağıtım (Hafta 11-12)
- **Mikro Görev 5.6.1:** E2E testlerinin tamamlanması
  - Detay: Test senaryoları, Test otomasyonu (Cypress/Playwright), Test raporlama.
- **Mikro Görev 5.6.2:** Hata ayıklama ve performans iyileştirmeleri
  - Detay: Tarayıcı uyumluluğu, Mobil uyumluluk, Hata düzeltmeleri, Son performans ayarları.
- **Mikro Görev 5.6.3:** Dokümantasyon güncellemesi
  - Detay: Bileşen dokümantasyonu, Kullanım kılavuzu, Stil rehberi.
- **Mikro Görev 5.6.4:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline (Vercel/Netlify), Build optimizasyonu, Statik site üretimi.
- **Mikro Görev 5.6.5:** Son kullanıcı kabul testleri (UAT)
  - Detay: UAT senaryoları, Geri bildirim toplama, Son düzeltmeler.

### Teknik Gereksinimler
- React 18+, Next.js 13+, TypeScript 5.0+, Tailwind CSS/Styled Components, Storybook 7.0+, Jest/React Testing Library, Cypress/Playwright, Figma/Sketch, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 85%
- Kod tekrarı: < 5%
- Lighthouse (Performans): ≥ 90
- Lighthouse (Erişilebilirlik): ≥ 95
- ESLint uyarısı: 0
- Dokümantasyon kapsamı: ≥ 75%

---

## İşçi 6: AI Entegrasyon Uzmanı - AI Model Adaptörleri ve Testleri

### Temel Sorumluluklar
- Farklı AI modelleri (OpenAI, Anthropic, Mistral AI, yerel modeller) için adaptörlerin geliştirilmesi
- AI model performansının değerlendirilmesi ve karşılaştırılması
- Prompt engineering ve optimizasyonu
- AI servisleriyle entegrasyon testleri
- Yeni AI modellerinin araştırılması ve entegrasyonu

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 6.1: Temel Altyapı ve Araştırma (Hafta 1-2)
- **Mikro Görev 6.1.1:** Python/Rust ile AI adaptör projesinin kurulumu
  - Detay: Proje yapısı, Kütüphane seçimi, Asenkron destek, Docker yapılandırması.
- **Mikro Görev 6.1.2:** AI model API'lerinin araştırılması ve dokümantasyonu
  - Detay: OpenAI, Anthropic, Mistral AI, Hugging Face API'leri, Yerel model (llama.cpp) arayüzleri.
- **Mikro Görev 6.1.3:** Temel adaptör arayüzünün tasarlanması
  - Detay: Ortak fonksiyonlar (generate, chat, embed), Parametre standardizasyonu, Hata işleme.
- **Mikro Görev 6.1.4:** Performans değerlendirme metriklerinin belirlenmesi
  - Detay: Doğruluk, Hız, Maliyet, Kaynak kullanımı, Kalite metrikleri.
- **Mikro Görev 6.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Kapsam raporlama.

#### Makro Görev 6.2: OpenAI ve Anthropic Adaptörleri (Hafta 3-4)
- **Mikro Görev 6.2.1:** OpenAI API adaptörünün geliştirilmesi
  - Detay: GPT-3.5/4 entegrasyonu, API anahtar yönetimi, Rate limiting, Hata işleme.
- **Mikro Görev 6.2.2:** Anthropic Claude API adaptörünün geliştirilmesi
  - Detay: Claude modelleri entegrasyonu, API anahtar yönetimi, Rate limiting, Hata işleme.
- **Mikro Görev 6.2.3:** Prompt engineering ve optimizasyonu (OpenAI/Anthropic)
  - Detay: Sistem prompt'ları, Kullanıcı prompt'ları, Few-shot/Zero-shot, Parametre ayarları.
- **Mikro Görev 6.2.4:** Performans testleri ve karşılaştırması (OpenAI/Anthropic)
  - Detay: Test senaryoları, Metrik toplama, Sonuç analizi, Raporlama.
- **Mikro Görev 6.2.5:** Adaptör testleri
  - Detay: Birim, Entegrasyon, Hata senaryoları testleri.

#### Makro Görev 6.3: Mistral AI ve Yerel Model Adaptörleri (Hafta 5-6)
- **Mikro Görev 6.3.1:** Mistral AI API adaptörünün geliştirilmesi
  - Detay: Mistral modelleri entegrasyonu, API anahtar yönetimi, Rate limiting, Hata işleme.
- **Mikro Görev 6.3.2:** Yerel model (llama.cpp) adaptörünün geliştirilmesi
  - Detay: llama.cpp entegrasyonu, Model yükleme/yönetimi, Performans optimizasyonu, Kaynak izleme.
- **Mikro Görev 6.3.3:** Prompt engineering ve optimizasyonu (Mistral/Yerel)
  - Detay: Sistem prompt'ları, Kullanıcı prompt'ları, Parametre ayarları, Model spesifik optimizasyonlar.
- **Mikro Görev 6.3.4:** Performans testleri ve karşılaştırması (Mistral/Yerel)
  - Detay: Test senaryoları, Metrik toplama, Sonuç analizi, Raporlama.
- **Mikro Görev 6.3.5:** Adaptör testleri
  - Detay: Birim, Entegrasyon, Hata senaryoları testleri.

#### Makro Görev 6.4: Runner Service Entegrasyonu (Hafta 7-8)
- **Mikro Görev 6.4.1:** Adaptörlerin Runner Service ile entegrasyonu
  - Detay: API endpoint implementasyonu, Model seçimi, Parametre geçişi, Hata işleme.
- **Mikro Görev 6.4.2:** Asenkron model çağrıları ve yanıt işleme
  - Detay: Paralel çağrılar, Yanıt birleştirme, Hata toleransı, Performans optimizasyonu.
- **Mikro Görev 6.4.3:** Model yapılandırma ve yönetim API'leri
  - Detay: Model ekleme/kaldırma, Parametre ayarları, Varsayılan model, API entegrasyonu.
- **Mikro Görev 6.4.4:** Entegrasyon testleri
  - Detay: Runner Service, API Gateway, E2E, Performans testleri.
- **Mikro Görev 6.4.5:** Dokümantasyon
  - Detay: Adaptör API referansı, Model yapılandırma kılavuzu, Performans raporları.

#### Makro Görev 6.5: İleri Özellikler ve Optimizasyon (Hafta 9-10)
- **Mikro Görev 6.5.1:** Model chaining ve orkestrasyonu
  - Detay: Çoklu model kullanımı, Adım adım işleme, Sonuç birleştirme, Hata işleme.
- **Mikro Görev 6.5.2:** Dinamik model seçimi ve A/B testi
  - Detay: Performans/maliyet bazlı seçim, A/B testi altyapısı, Sonuç analizi.
- **Mikro Görev 6.5.3:** Güvenlik ve etik değerlendirme
  - Detay: Veri gizliliği, Yanıt filtreleme, Bias tespiti, Güvenlik açıkları.
- **Mikro Görev 6.5.4:** Yeni AI modellerinin araştırılması ve entegrasyonu
  - Detay: Hugging Face Hub, Yeni çıkan modeller, Performans değerlendirmesi, Adaptör geliştirme.
- **Mikro Görev 6.5.5:** Performans optimizasyonu
  - Detay: Profiling, Bellek/CPU optimizasyonu, Cache, Batch processing.

#### Makro Görev 6.6: Stabilizasyon ve Raporlama (Hafta 11-12)
- **Mikro Görev 6.6.1:** Kapsamlı testlerin tamamlanması
  - Detay: Birim, Entegrasyon, E2E, Yük, Güvenlik testleri.
- **Mikro Görev 6.6.2:** Hata ayıklama ve performans iyileştirmeleri
  - Detay: Son performans ayarları, Hata düzeltmeleri, Kararlılık testleri.
- **Mikro Görev 6.6.3:** Detaylı performans raporlarının hazırlanması
  - Detay: Model karşılaştırması, Maliyet analizi, Öneriler, Sunum.
- **Mikro Görev 6.6.4:** Dokümantasyon güncellemesi
  - Detay: API referansı, Model entegrasyon kılavuzu, Performans raporları, Sorun giderme.
- **Mikro Görev 6.6.5:** Bilgi transferi ve eğitim
  - Detay: Diğer ekiplere eğitim, Dokümantasyon sunumu, Geri bildirim toplama.

### Teknik Gereksinimler
- Python 3.10+/Rust 1.70+, OpenAI SDK, Anthropic SDK, Mistral AI SDK, llama.cpp, Hugging Face Transformers, Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 85%
- Kod tekrarı: < 5%
- Performans metrikleri: Belirlenen hedeflere ulaşım
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 7: DevOps ve Test Uzmanı - CI/CD, Test Otomasyonu ve Altyapı

### Temel Sorumluluklar
- CI/CD pipeline'larının oluşturulması ve yönetimi
- Test otomasyon altyapısının geliştirilmesi
- Altyapı (Docker, Kubernetes) yönetimi ve optimizasyonu
- Performans ve yük testlerinin yapılması
- Güvenlik taramaları ve uyumluluk kontrolleri

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 7.1: Temel Altyapı ve CI/CD (Hafta 1-2)
- **Mikro Görev 7.1.1:** CI/CD platformunun seçimi ve kurulumu
  - Detay: GitHub Actions/GitLab CI/Jenkins, Pipeline tasarımı, Agent yapılandırması.
- **Mikro Görev 7.1.2:** Docker ve Docker Compose yapılandırması
  - Detay: Servis Dockerfile'ları, Docker Compose optimizasyonu, Multi-stage build.
- **Mikro Görev 7.1.3:** Temel CI pipeline'ının oluşturulması (API Gateway)
  - Detay: Build, Lint, Birim testleri, Kod kalite kontrolü.
- **Mikro Görev 7.1.4:** Artifact repository entegrasyonu
  - Detay: Docker Hub/GitHub Packages, Versiyonlama, Erişim kontrolü.
- **Mikro Görev 7.1.5:** Temel altyapı dokümantasyonu
  - Detay: CI/CD akışı, Docker yapılandırması, Artifact yönetimi.

#### Makro Görev 7.2: Test Otomasyon Altyapısı (Hafta 3-4)
- **Mikro Görev 7.2.1:** Test otomasyon framework'ünün seçimi ve kurulumu
  - Detay: Jest/Pytest/Robot Framework, Selenium/Playwright/Cypress, Raporlama araçları.
- **Mikro Görev 7.2.2:** Birim testlerinin CI entegrasyonu (Tüm servisler)
  - Detay: Test çalıştırma, Raporlama, Kapsam analizi, Başarısızlık bildirimi.
- **Mikro Görev 7.2.3:** Entegrasyon testlerinin CI entegrasyonu (API Gateway)
  - Detay: Servisler arası testler, Mock/stub, Test ortamı yönetimi, Raporlama.
- **Mikro Görev 7.2.4:** E2E test altyapısının kurulması (UI)
  - Detay: Test senaryoları, Sayfa nesne modeli, Test verisi yönetimi, Tarayıcı otomasyonu.
- **Mikro Görev 7.2.5:** Test otomasyon dokümantasyonu
  - Detay: Framework kullanımı, Test senaryoları, Raporlama, Sorun giderme.

#### Makro Görev 7.3: Altyapı Yönetimi ve Optimizasyonu (Hafta 5-6)
- **Mikro Görev 7.3.1:** Kubernetes (K8s) kümesinin kurulumu ve yapılandırması
  - Detay: Minikube/Kind/Bulut K8s, Deployment/Service/Ingress, Helm chart'ları.
- **Mikro Görev 7.3.2:** Servislerin K8s'e dağıtımı
  - Detay: Deployment stratejileri, Rolling update/Blue-green, Kaynak yönetimi, Health check.
- **Mikro Görev 7.3.3:** Loglama ve izleme altyapısının K8s entegrasyonu
  - Detay: ELK/EFK stack, Prometheus/Grafana, Distributed tracing, Alarm mekanizması.
- **Mikro Görev 7.3.4:** Altyapı maliyet optimizasyonu
  - Detay: Kaynak kullanımı analizi, Otomatik ölçeklendirme, Spot instance, Rezervasyon.
- **Mikro Görev 7.3.5:** Altyapı dokümantasyonu
  - Detay: K8s mimarisi, Deployment kılavuzu, İzleme/loglama, Sorun giderme.

#### Makro Görev 7.4: Performans ve Yük Testleri (Hafta 7-8)
- **Mikro Görev 7.4.1:** Performans testi araçlarının seçimi ve kurulumu
  - Detay: JMeter/k6/Locust, Test senaryoları, Veri üretimi, Raporlama.
- **Mikro Görev 7.4.2:** API Gateway performans testleri
  - Detay: Endpoint bazlı testler, Yük profili, Darboğaz analizi, Sonuç raporlama.
- **Mikro Görev 7.4.3:** Servis bazlı performans testleri
  - Detay: Segmentation/Runner/Archive servisleri, Kritik senaryolar, Kaynak kullanımı.
- **Mikro Görev 7.4.4:** Yük testi senaryolarının oluşturulması ve yürütülmesi
  - Detay: Gerçekçi yük profili, Ölçeklendirme testleri, Dayanıklılık testleri, Sonuç analizi.
- **Mikro Görev 7.4.5:** Performans testi dokümantasyonu
  - Detay: Test senaryoları, Sonuçlar, Öneriler, Raporlama.

#### Makro Görev 7.5: Güvenlik ve Uyumluluk (Hafta 9-10)
- **Mikro Görev 7.5.1:** Güvenlik tarama araçlarının entegrasyonu
  - Detay: SAST/DAST, Bağımlılık taraması (Snyk/Dependabot), Konteyner taraması (Trivy/Clair).
- **Mikro Görev 7.5.2:** CI pipeline'ına güvenlik taramalarının eklenmesi
  - Detay: Otomatik tarama, Raporlama, Zafiyet yönetimi, Başarısızlık kriterleri.
- **Mikro Görev 7.5.3:** Altyapı güvenlik yapılandırması
  - Detay: Ağ politikaları, RBAC, Secret yönetimi, Güvenlik duvarı.
- **Mikro Görev 7.5.4:** Uyumluluk kontrolleri ve raporlama
  - Detay: GDPR/CCPA, Veri güvenliği politikaları, Denetim kayıtları, Raporlama.
- **Mikro Görev 7.5.5:** Güvenlik dokümantasyonu
  - Detay: Güvenlik politikaları, Zafiyet yönetimi, Uyumluluk raporları, Sorun giderme.

#### Makro Görev 7.6: Sürekli İyileştirme ve Destek (Hafta 11-12)
- **Mikro Görev 7.6.1:** CI/CD pipeline optimizasyonu
  - Detay: Hızlandırma, Paralelleştirme, Cache, Geri bildirim döngüsü.
- **Mikro Görev 7.6.2:** Test otomasyon kapsamının genişletilmesi
  - Detay: Yeni test senaryoları, Kenar durumlar, Negatif testler, Veri odaklı testler.
- **Mikro Görev 7.6.3:** Altyapı izleme ve alarm sisteminin iyileştirilmesi
  - Detay: Yeni metrikler, Akıllı alarmlar, Anomali tespiti, Raporlama.
- **Mikro Görev 7.6.4:** Geliştirici ekiplerine destek ve eğitim
  - Detay: CI/CD kullanımı, Test otomasyonu, Altyapı sorunları, Dokümantasyon.
- **Mikro Görev 7.6.5:** DevOps pratiklerinin yaygınlaştırılması
  - Detay: Kod inceleme, Çift programlama, Bilgi paylaşımı, Sürekli öğrenme.

### Teknik Gereksinimler
- GitHub Actions/GitLab CI, Docker & Docker Compose, Kubernetes/Helm, Jest/Pytest/Cypress, JMeter/k6, ELK/Prometheus/Grafana, Snyk/Trivy, Terraform/Ansible.

### Kod Kalite Metrikleri
- CI/CD başarı oranı: ≥ 98%
- Test otomasyon kapsamı (E2E): ≥ 70%
- Altyapı uptime: ≥ 99.9%
- Güvenlik zafiyeti (Kritik/Yüksek): 0
- Dokümantasyon kapsamı: ≥ 85%

---

## İşçi 8: Dokümantasyon ve Topluluk Yöneticisi - Teknik Yazarlık ve İletişim

### Temel Sorumluluklar
- Proje dokümantasyonunun (API, mimari, kullanım kılavuzları) oluşturulması ve yönetimi
- Geliştirici portalının ve topluluk forumunun yönetimi
- Eğitim materyallerinin (tutorial, video) hazırlanması
- Geri bildirim toplama ve analiz etme
- Proje tanıtımı ve iletişim stratejileri

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 8.1: Dokümantasyon Altyapısı ve Planlama (Hafta 1-2)
- **Mikro Görev 8.1.1:** Dokümantasyon platformunun seçimi ve kurulumu
  - Detay: ReadtheDocs/Docusaurus/GitBook, Markdown/reStructuredText, Versiyonlama.
- **Mikro Görev 8.1.2:** Dokümantasyon yapısının ve stil rehberinin oluşturulması
  - Detay: İçerik hiyerarşisi, Şablonlar, Terminoloji, Görsel stil.
- **Mikro Görev 8.1.3:** API dokümantasyonunun (Swagger/OpenAPI) incelenmesi ve iyileştirilmesi
  - Detay: Açıklamalar, Örnekler, Kullanım senaryoları, Tutarlılık.
- **Mikro Görev 8.1.4:** Mimari dokümantasyonunun taslağının oluşturulması
  - Detay: Servisler, Veri akışı, Teknolojiler, Diyagramlar.
- **Mikro Görev 8.1.5:** Kullanım kılavuzu ve başlangıç rehberinin planlanması
  - Detay: Hedef kitle, İçerik başlıkları, Örnek projeler, Adım adım talimatlar.

#### Makro Görev 8.2: API ve Mimari Dokümantasyonu (Hafta 3-4)
- **Mikro Görev 8.2.1:** API Gateway dokümantasyonunun tamamlanması
  - Detay: Endpoint açıklamaları, İstek/yanıt örnekleri, Kimlik doğrulama, Hata kodları.
- **Mikro Görev 8.2.2:** Segmentation Service API dokümantasyonunun tamamlanması
  - Detay: DSL referansı, Mod/persona açıklamaları, API endpoint'leri, Örnekler.
- **Mikro Görev 8.2.3:** Runner Service API dokümantasyonunun tamamlanması
  - Detay: *.alt/*.last formatları, API endpoint'leri, Asenkron işlem yönetimi, Örnekler.
- **Mikro Görev 8.2.4:** Archive Service API dokümantasyonunun tamamlanması
  - Detay: *.atlas formatı, Arama API'leri, Veri modelleri, Örnekler.
- **Mikro Görev 8.2.5:** Genel mimari dokümantasyonunun yazılması
  - Detay: Servis etkileşimleri, Veritabanı şemaları, Güvenlik mimarisi, Ölçeklenebilirlik.

#### Makro Görev 8.3: Kullanım Kılavuzları ve Eğitim Materyalleri (Hafta 5-6)
- **Mikro Görev 8.3.1:** 
