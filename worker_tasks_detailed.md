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

#### Makro Görev 1.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 1.1.1:** Express.js/Node.js ile API Gateway projesinin kurulumu
  - Detay: TypeScript yapılandırması, ESLint/Prettier entegrasyonu, Jest test altyapısı, Docker konteyner yapılandırması.
- **Mikro Görev 1.1.2:** Middleware yapılandırması
  - Detay: CORS politikası, Rate limiting, Body parsing/validasyon, Compression.
- **Mikro Görev 1.1.3:** Loglama altyapısının kurulumu
  - Detay: Winston logger, Log seviyeleri/formatları, Log rotasyonu, OpenTelemetry entegrasyonu.
- **Mikro Görev 1.1.4:** Hata işleme mekanizması
  - Detay: Global hata yakalama, Hata sınıfları, HTTP durum kodları standardizasyonu, Kullanıcı dostu hata mesajları.
- **Mikro Görev 1.1.5:** Swagger/OpenAPI entegrasyonu
  - Detay: API şeması tanımlama, Otomatik dokümantasyon, API test arayüzü, Şema validasyonu.

#### Makro Görev 1.2: Kimlik Doğrulama ve Yetkilendirme (Hafta 3-4)
- **Mikro Görev 1.2.1:** JWT tabanlı kimlik doğrulama sistemi
  - Detay: Token oluşturma/doğrulama, Refresh token, JWT imzalama/şifreleme, Token blacklisting.
- **Mikro Görev 1.2.2:** Rol tabanlı yetkilendirme sistemi
  - Detay: Rol/izin modeli, Yetkilendirme middleware, Dinamik izin kontrolü, Rol hiyerarşisi.
- **Mikro Görev 1.2.3:** Kullanıcı yönetimi API'leri
  - Detay: Kullanıcı CRUD, Profil yönetimi, Şifre sıfırlama/değiştirme, E-posta doğrulama.
- **Mikro Görev 1.2.4:** Oturum yönetimi
  - Detay: Oturum oluşturma/sonlandırma, Çoklu cihaz desteği, Oturum süresi/yenileme, Oturum analitikleri.
- **Mikro Görev 1.2.5:** Güvenlik testleri
  - Detay: Penetrasyon testleri, OWASP kontrolü, Token güvenliği, Yetkilendirme bypass testleri.

#### Makro Görev 1.3: Servis Entegrasyonu (Hafta 5-6)
- **Mikro Görev 1.3.1:** Segmentation Service ile entegrasyon
  - Detay: API endpoint tanımları, İstek/yanıt şemaları, Hata işleme, Performans optimizasyonu.
- **Mikro Görev 1.3.2:** Runner Service ile entegrasyon
  - Detay: API endpoint tanımları, İstek/yanıt şemaları, Asenkron işlem yönetimi, İlerleme izleme.
- **Mikro Görev 1.3.3:** Archive Service ile entegrasyon
  - Detay: API endpoint tanımları, İstek/yanıt şemaları, Dosya transferi optimizasyonu, Metadata yönetimi.
- **Mikro Görev 1.3.4:** Servis keşif mekanizması
  - Detay: Service registry, Dinamik servis keşfi, Load balancing, Circuit breaker pattern.
- **Mikro Görev 1.3.5:** Servis sağlık kontrolü ve izleme
  - Detay: Health check endpoint'leri, Servis metrikleri toplama, Alarm mekanizması, Dashboard entegrasyonu.

#### Makro Görev 1.4: API Geliştirme ve Optimizasyon (Hafta 7-8)
- **Mikro Görev 1.4.1:** Komut işleme API'leri
  - Detay: Komut gönderme, Komut durumu sorgulama, Komut geçmişi, Komut iptal etme.
- **Mikro Görev 1.4.2:** Dosya yönetimi API'leri
  - Detay: *.alt/*.last/*.atlas dosya yükleme/indirme, Dosya metadata yönetimi.
- **Mikro Görev 1.4.3:** Performans optimizasyonu ve caching
  - Detay: Redis cache, Response caching, Query optimizasyonu, Bulk operasyonlar.
- **Mikro Görev 1.4.4:** API versiyonlama stratejisi
  - Detay: URL/Header tabanlı versiyonlama, Geriye dönük uyumluluk, Versiyon geçiş planı.
- **Mikro Görev 1.4.5:** Kapsamlı API testleri
  - Detay: Birim, Entegrasyon, Yük, Sınır durum testleri.

#### Makro Görev 1.5: İleri Özellikler (Hafta 9-10)
- **Mikro Görev 1.5.1:** WebSocket desteği
  - Detay: Sunucu implementasyonu, Oturum yönetimi, Mesaj formatı, Ölçeklenebilir mimari.
- **Mikro Görev 1.5.2:** Gerçek zamanlı bildirim sistemi
  - Detay: Bildirim modeli, Push notification, Bildirim tercihleri, Okundu/okunmadı takibi.
- **Mikro Görev 1.5.3:** API kullanım analitikleri
  - Detay: Kullanım metrikleri, Analitik raporlama, Anomali tespiti, Kullanım trendleri.
- **Mikro Görev 1.5.4:** API dokümantasyonunun genişletilmesi
  - Detay: Kullanım örnekleri, Kod parçacıkları, İnteraktif API explorer, SDK oluşturma.
- **Mikro Görev 1.5.5:** Yük testi ve ölçeklendirme
  - Detay: Yük testi senaryoları, Performans darboğazı tespiti, Otomatik ölçeklendirme, Yük dengeleme.

#### Makro Görev 1.6: Entegrasyon ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 1.6.1:** UI entegrasyonu
  - Detay: Frontend API client, API hata işleme, API kullanım örnekleri, UI-API kontrat testleri.
- **Mikro Görev 1.6.2:** E2E testleri
  - Detay: Test senaryoları, Test otomasyonu, Test raporlama, Sürekli entegrasyon.
- **Mikro Görev 1.6.3:** Hata ayıklama ve performans iyileştirmeleri
  - Detay: Profiling, Bellek sızıntısı analizi, CPU/Ağ trafiği optimizasyonu.
- **Mikro Görev 1.6.4:** Dokümantasyon güncellemesi
  - Detay: API referansı, Mimari, Deployment, Sorun giderme kılavuzu.
- **Mikro Görev 1.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Deployment stratejisi, Rollback, Monitoring/alerting.

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

**ÖNEMLİ NOT:** Bu göreve başlamadan önce, önceki çalışanın devir notları ve tespit ettiği derleyici uyarıları gibi konuları içeren (artık silinmiş olan) `/home/ubuntu/ALT_LAS_project/worker3_handover.md` ve `/home/ubuntu/ALT_LAS_project/runner-service/remaining_warnings.md` dosyalarına referans verildiğini unutmayın. Bu dosyalar silindiği için, mevcut kod tabanını dikkatlice inceleyerek ve olası uyarıları/hataları gidererek başlamanız önerilir.

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
- Rust 1.70+, Tokio 1.28+, Actix-web 4.3+, Serde 1.0.160+, reqwest 0.11+, tracing 0.1.37+, criterion 0.4+ (benchmark), Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- clippy uyarısı: 0
- Belgelendirme yorumları: Zorunlu
- Unsafe kod: Minimum ve tam belgelenmiş

---

## İşçi 4: Archive ve Veri Yönetimi Uzmanı - Archive Service Geliştirme

### Temel Sorumluluklar
- *.atlas arşiv sistemi tasarımı ve implementasyonu
- Veritabanı şema tasarımı ve optimizasyonu
- Mesaj kuyruğu entegrasyonu
- Arama ve analitik altyapısı
- Veri yedekleme ve kurtarma stratejileri

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 4.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 4.1.1:** Go ile Archive Service projesinin kurulumu
  - Detay: Proje yapısı, Dependency injection, Konfigürasyon yönetimi, Docker yapılandırması.
- **Mikro Görev 4.1.2:** Temel API yapılandırması
  - Detay: RESTful API, Gin router, Middleware, API versiyonlama.
- **Mikro Görev 4.1.3:** Loglama ve hata işleme
  - Detay: Yapılandırılabilir loglama, Hata yakalama/raporlama, Distributed tracing, Metrik toplama.
- **Mikro Görev 4.1.4:** Veri modelleri
  - Detay: Arşiv, Metadata, Arama, Analitik modelleri.
- **Mikro Görev 4.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Table-driven testler, Kapsam raporlama.

#### Makro Görev 4.2: Veritabanı Tasarımı (Hafta 3-4)
- **Mikro Görev 4.2.1:** PostgreSQL veritabanı şemasının tasarımı
  - Detay: Tablo yapısı, İlişkiler, İndeksler, Kısıtlamalar.
- **Mikro Görev 4.2.2:** Veritabanı migrasyonları
  - Detay: Migration framework, Versiyon kontrolü, Rollback, Seed data.
- **Mikro Görev 4.2.3:** Veritabanı erişim katmanı
  - Detay: Repository pattern, ORM/Query builder, Connection pooling, Transaction yönetimi.
- **Mikro Görev 4.2.4:** Sorgu optimizasyonu
  - Detay: Explain plan, İndeks optimizasyonu, Query caching, N+1 önleme.
- **Mikro Görev 4.2.5:** Veritabanı testleri
  - Detay: Birim, Entegrasyon, Performans, Veri bütünlüğü testleri.

#### Makro Görev 4.3: Mesaj Kuyruğu Entegrasyonu (Hafta 5-6)
- **Mikro Görev 4.3.1:** NATS mesaj kuyruğu entegrasyonu
  - Detay: NATS client, Konu (subject) tasarımı, QoS, Cluster yapılandırması.
- **Mikro Görev 4.3.2:** *.last dinleme mekanizması
  - Detay: Abonelik yönetimi, Mesaj filtreleme/doğrulama, İşleme pipeline.
- **Mikro Görev 4.3.3:** Mesaj işleme ve hata yönetimi
  - Detay: Deserializasyon, İşlem idempotency, Hata işleme, Dead letter queue.
- **Mikro Görev 4.3.4:** Yeniden deneme mekanizması
  - Detay: Backoff, Yeniden deneme limitleri, Kalıcı hata işleme, Manuel müdahale.
- **Mikro Görev 4.3.5:** Mesaj kuyruğu testleri
  - Detay: Birim, Entegrasyon, Performans, Hata senaryoları testleri.

#### Makro Görev 4.4: *.atlas Arşiv Sistemi (Hafta 7-8)
- **Mikro Görev 4.4.1:** *.atlas dosya formatı implementasyonu
  - Detay: Dosya yapısı, Serileştirme/deserileştirme, Versiyon yönetimi, Geriye dönük uyumluluk.
- **Mikro Görev 4.4.2:** Başarı oranı değerlendirme algoritması
  - Detay: Değerlendirme metrikleri, Tarihsel analiz, Trend analizi, Anomali tespiti.
- **Mikro Görev 4.4.3:** Arşivleme ve indeksleme
  - Detay: Arşiv stratejisi, İndeksleme algoritması, Tam metin/Metadata indeksleme.
- **Mikro Görev 4.4.4:** Metadata yönetimi
  - Detay: Metadata şeması, Çıkarım, Zenginleştirme, Arama.
- **Mikro Görev 4.4.5:** Arşiv sistemi testleri
  - Detay: Birim, Entegrasyon, Performans, Veri bütünlüğü testleri.

#### Makro Görev 4.5: Arama ve Analitik (Hafta 9-10)
- **Mikro Görev 4.5.1:** Elasticsearch entegrasyonu
  - Detay: Elasticsearch client, İndeks tasarımı, Mapping/Analiz yapılandırması.
- **Mikro Görev 4.5.2:** Tam metin arama implementasyonu
  - Detay: Arama DSL, Filtreleme, Sıralama, Facet/aggregation.
- **Mikro Görev 4.5.3:** Analitik sorgular ve raporlama
  - Detay: Aggregation pipeline, Zaman serisi/İstatistiksel analiz, Rapor şablonları.
- **Mikro Görev 4.5.4:** Veri görselleştirme API'leri
  - Detay: Grafik veri formatları, Zaman serisi/Aggregation/Dashboard API'leri.
- **Mikro Görev 4.5.5:** Arama ve analitik testleri
  - Detay: Birim, Entegrasyon, Performans, Doğruluk testleri.

#### Makro Görev 4.6: Veri Yönetimi ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 4.6.1:** Veri yedekleme ve kurtarma
  - Detay: Yedekleme stratejisi, Otomatik yedekleme, Point-in-time recovery, Disaster recovery.
- **Mikro Görev 4.6.2:** Veri saklama politikaları
  - Detay: Yaşam döngüsü yönetimi, Otomatik arşivleme/silme, Uyumluluk kontrolü.
- **Mikro Görev 4.6.3:** Performans optimizasyonu
  - Detay: Profiling, Bellek/CPU/I/O optimizasyonu.
- **Mikro Görev 4.6.4:** Dokümantasyon güncellemesi
  - Detay: API referansı, *.atlas formatı, Mimari, Sorun giderme kılavuzu.
- **Mikro Görev 4.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Deployment stratejisi, Rollback, Monitoring/alerting.

### Teknik Gereksinimler
- Go 1.20+, Gin 1.9+, PostgreSQL 14+, NATS 2.9+, Elasticsearch 8.0+, Docker & Docker Compose, Prometheus (izleme), GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- golint/gofmt uyarısı: 0
- Belgelendirme yorumları: Zorunlu
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 5: UI/UX Geliştirici - Kullanıcı Arayüzü Geliştirme

### Temel Sorumluluklar
- Masaüstü, web ve mobil arayüzlerin tasarımı ve implementasyonu
- Tema sistemi ve özelleştirilebilir arayüz
- Komut ve sohbet arayüzleri
- Kullanıcı deneyimi optimizasyonu
- Erişilebilirlik standartlarına uyumluluk

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 5.1: UI Altyapısı (Hafta 1-2)
- **Mikro Görev 5.1.1:** Electron/React ile Desktop UI projesinin kurulumu
  - Detay: Proje yapısı, TypeScript, Electron süreç mimarisi, Geliştirme ortamı.
- **Mikro Görev 5.1.2:** React ile Web Dashboard projesinin kurulumu
  - Detay: Proje yapısı, TypeScript, Routing, Responsive tasarım altyapısı.
- **Mikro Görev 5.1.3:** Temel bileşen kütüphanesi
  - Detay: Atomik tasarım, Bileşen hiyerarşisi, Storybook, Bileşen dokümantasyonu.
- **Mikro Görev 5.1.4:** Stil sistemi ve CSS mimarisi
  - Detay: CSS-in-JS, Tema değişkenleri, Responsive kurallar, Animasyon sistemi.
- **Mikro Görev 5.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Bileşen/Snapshot/Erişilebilirlik testleri.

#### Makro Görev 5.2: Tema Sistemi (Hafta 3-4)
- **Mikro Görev 5.2.1:** Tema altyapısının tasarımı
  - Detay: Tema provider, Değişkenler, Geçiş mekanizması, Persistance.
- **Mikro Görev 5.2.2:** Açık/koyu tema implementasyonu
  - Detay: Renk paleti, Kontrast kontrolü, Sistem teması entegrasyonu, Otomatik geçiş.
- **Mikro Görev 5.2.3:** Özelleştirilebilir tema sistemi
  - Detay: Tema editörü, Renk/Yazı tipi seçici, Önizleme.
- **Mikro Görev 5.2.4:** Tema değiştirme ve kaydetme
  - Detay: Kaydetme, İçe/Dışa aktarma, Paylaşım, Sıfırlama.
- **Mikro Görev 5.2.5:** Tema sistemi testleri
  - Detay: Birim, Entegrasyon, Görsel regresyon, Erişilebilirlik testleri.

#### Makro Görev 5.3: Ana Ekran ve Komut Arayüzü (Hafta 5-6)
- **Mikro Görev 5.3.1:** Ana ekran tasarımı ve implementasyonu
  - Detay: Layout, Responsive grid, Panel sistemi, Düzen kaydetme.
- **Mikro Görev 5.3.2:** Komut çubuğu implementasyonu
  - Detay: Otomatik tamamlama, Geçmiş, Öneriler, Kısayollar.
- **Mikro Görev 5.3.3:** Görev paneli implementasyonu
  - Detay: Görev listesi/detayları, Filtreleme, Gruplandırma.
- **Mikro Görev 5.3.4:** Sonuç alanı implementasyonu
  - Detay: Markdown render, Kod vurgulama, Medya gömme, İnteraktif sonuçlar.
- **Mikro Görev 5.3.5:** Ana ekran testleri
  - Detay: Birim, Entegrasyon, Kullanılabilirlik, Performans testleri.

#### Makro Görev 5.4: Sohbet ve Etkileşim (Hafta 7-8)
- **Mikro Görev 5.4.1:** Sohbet arayüzü implementasyonu
  - Detay: Mesaj listesi/girişi, Gruplandırma, Sohbet geçmişi.
- **Mikro Görev 5.4.2:** Mesaj görüntüleme ve biçimlendirme
  - Detay: Mesaj tipleri, Markdown/Kod bloğu/Emoji desteği.
- **Mikro Görev 5.4.3:** Dosya ve medya paylaşımı
  - Detay: Yükleme, Önizleme, Oynatıcı, İndirme.
- **Mikro Görev 5.4.4:** Etkileşimli yanıtlar
  - Detay: Buton/Form/Seçim yanıtları, Özel bileşenler.
- **Mikro Görev 5.4.5:** Sohbet arayüzü testleri
  - Detay: Birim, Entegrasyon, Kullanılabilirlik, Performans testleri.

#### Makro Görev 5.5: Ayarlar ve Yapılandırma (Hafta 9-10)
- **Mikro Görev 5.5.1:** Ayarlar sayfası implementasyonu
  - Detay: Kategoriler, Form bileşenleri, Validasyon, Persistance.
- **Mikro Görev 5.5.2:** Kullanıcı profili yönetimi
  - Detay: Profil düzenleme, Avatar, Tercihler, Oturum yönetimi.
- **Mikro Görev 5.5.3:** AI model yapılandırması
  - Detay: Model seçimi/parametreleri, API anahtarı, Model testi.
- **Mikro Görev 5.5.4:** Tema ve görünüm ayarları
  - Detay: Tema seçimi/özelleştirme, Yazı tipi, Görünüm tercihleri.
- **Mikro Görev 5.5.5:** Ayarlar testleri
  - Detay: Birim, Entegrasyon, Kullanılabilirlik, Veri persistance testleri.

#### Makro Görev 5.6: Mobil Uyumluluk ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 5.6.1:** Responsive tasarım iyileştirmeleri
  - Detay: Breakpoint, Mobil-öncelikli, Adaptive layout, Viewport optimizasyonu.
- **Mikro Görev 5.6.2:** Mobil cihaz optimizasyonu
  - Detay: Dokunmatik etkileşim, Gesture, Ekran yönü, Klavye optimizasyonu.
- **Mikro Görev 5.6.3:** Erişilebilirlik iyileştirmeleri
  - Detay: WCAG 2.1 AA, Ekran okuyucu, Klavye navigasyonu, Renk kontrastı.
- **Mikro Görev 5.6.4:** Performans optimizasyonu
  - Detay: Bundle size, Render performansı, Bellek kullanımı, Lazy loading.
- **Mikro Görev 5.6.5:** E2E testleri
  - Detay: Cypress, Mobil E2E, Performans, Erişilebilirlik testleri.

### Teknik Gereksinimler
- React 18+, TypeScript 5.0+, Electron 25+, Styled Components/Emotion, Redux Toolkit/Zustand, React Testing Library, Cypress, Storybook, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 90%
- Kod tekrarı: < 3%
- Siklomat karmaşıklığı: ≤ 10
- ESLint uyarısı: 0
- TypeScript strict mode: Aktif
- Erişilebilirlik: WCAG 2.1 AA uyumlu

---

## İşçi 6: OS Entegrasyon Uzmanı - OS Integration Service Geliştirme

### Temel Sorumluluklar
- Çoklu platform (Windows, macOS, Linux) entegrasyonu
- CUDA hızlandırmalı ekran yakalama
- Sistem seviyesi kontrol ve otomasyon
- Donanım hızlandırma optimizasyonu
- Güvenlik sertleştirmesi

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 6.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 6.1.1:** Rust/C++ ile OS Integration Service projesinin kurulumu
  - Detay: Proje yapısı, FFI altyapısı, Hata işleme, Docker yapılandırması.
- **Mikro Görev 6.1.2:** Temel API yapılandırması
  - Detay: RESTful API, Actix-web router, JSON serileştirme/deserileştirme, API versiyonlama.
- **Mikro Görev 6.1.3:** Loglama ve hata işleme
  - Detay: tracing entegrasyonu, Log seviyeleri, Hata zinciri, Metrik toplama.
- **Mikro Görev 6.1.4:** Platform algılama mekanizması
  - Detay: İşletim sistemi/Donanım/Özellik algılama, Fallback mekanizması.
- **Mikro Görev 6.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Platform-spesifik test, Kapsam raporlama.

#### Makro Görev 6.2: Windows Entegrasyonu (Hafta 3-4)
- **Mikro Görev 6.2.1:** Windows API entegrasyonu
  - Detay: Win32 API wrapper, COM/WinRT entegrasyonu, UAC yönetimi.
- **Mikro Görev 6.2.2:** Dosya sistemi erişimi
  - Detay: Dosya okuma/yazma/izleme, Metadata yönetimi, İzin yönetimi.
- **Mikro Görev 6.2.3:** Uygulama kontrolü
  - Detay: Uygulama başlatma/durdurma, Pencere yönetimi, Proses yönetimi.
- **Mikro Görev 6.2.4:** Sistem bilgisi toplama
  - Detay: CPU/Bellek/Disk kullanımı, Ağ bilgisi, Yüklü uygulamalar.
- **Mikro Görev 6.2.5:** Windows testleri
  - Detay: Birim, Entegrasyon, Platform-spesifik testler.

#### Makro Görev 6.3: macOS Entegrasyonu (Hafta 5-6)
- **Mikro Görev 6.3.1:** macOS API entegrasyonu
  - Detay: Cocoa/AppKit wrapper, Objective-C/Swift entegrasyonu, İzin yönetimi.
- **Mikro Görev 6.3.2:** Dosya sistemi erişimi
  - Detay: Dosya okuma/yazma/izleme, Metadata yönetimi, Sandbox uyumluluğu.
- **Mikro Görev 6.3.3:** Uygulama kontrolü
  - Detay: Uygulama başlatma/durdurma, Pencere yönetimi, Proses yönetimi.
- **Mikro Görev 6.3.4:** Sistem bilgisi toplama
  - Detay: CPU/Bellek/Disk kullanımı, Ağ bilgisi, Yüklü uygulamalar.
- **Mikro Görev 6.3.5:** macOS testleri
  - Detay: Birim, Entegrasyon, Platform-spesifik testler.

#### Makro Görev 6.4: Linux Entegrasyonu (Hafta 7-8)
- **Mikro Görev 6.4.1:** Linux API entegrasyonu
  - Detay: POSIX API, D-Bus entegrasyonu, X11/Wayland entegrasyonu.
- **Mikro Görev 6.4.2:** Dosya sistemi erişimi
  - Detay: Dosya okuma/yazma/izleme, Metadata yönetimi, İzin yönetimi.
- **Mikro Görev 6.4.3:** Uygulama kontrolü
  - Detay: Uygulama başlatma/durdurma, Pencere yönetimi, Proses yönetimi.
- **Mikro Görev 6.4.4:** Sistem bilgisi toplama
  - Detay: /proc, /sys, systemd entegrasyonu, Ağ bilgisi.
- **Mikro Görev 6.4.5:** Linux testleri
  - Detay: Birim, Entegrasyon, Platform-spesifik testler.

#### Makro Görev 6.5: Ekran Yakalama (Hafta 9-10)
- **Mikro Görev 6.5.1:** Platforma özel ekran yakalama API'leri
  - Detay: Windows (DXGI), macOS (ScreenCaptureKit), Linux (X11/Wayland).
- **Mikro Görev 6.5.2:** CUDA/GPU hızlandırma entegrasyonu
  - Detay: CUDA/NVENC/NVDEC entegrasyonu, Donanım kodlama/kod çözme.
- **Mikro Görev 6.5.3:** Görüntü işleme ve formatlama
  - Detay: Renk uzayı dönüşümü, Boyutlandırma, Sıkıştırma.
- **Mikro Görev 6.5.4:** Performans optimizasyonu
  - Detay: Sıfır kopya, Bellek yönetimi, Gecikme optimizasyonu.
- **Mikro Görev 6.5.5:** Ekran yakalama testleri
  - Detay: Birim, Entegrasyon, Performans, Kalite testleri.

#### Makro Görev 6.6: Güvenlik ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 6.6.1:** Güvenlik sertleştirmesi
  - Detay: İzin minimizasyonu, Sandbox entegrasyonu, Kod imzalama.
- **Mikro Görev 6.6.2:** Hata işleme ve kurtarma
  - Detay: Platform hataları, Donanım hataları, Kurtarma mekanizmaları.
- **Mikro Görev 6.6.3:** Performans ve kaynak optimizasyonu
  - Detay: CPU/Bellek optimizasyonu, Enerji verimliliği.
- **Mikro Görev 6.6.4:** Dokümantasyon güncellemesi
  - Detay: API referansı, Platform uyumluluğu, Mimari, Sorun giderme.
- **Mikro Görev 6.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Platforma özel derleme, Dağıtım, Monitoring.

### Teknik Gereksinimler
- Rust 1.70+, C++17+, Windows SDK, macOS SDK, Linux Headers, CUDA Toolkit, Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 85% (Platform farklılıkları nedeniyle)
- Kod tekrarı: < 5%
- Siklomat karmaşıklığı: ≤ 15
- clippy/cppcheck uyarısı: 0
- Belgelendirme yorumları: Zorunlu
- Unsafe kod: Minimum ve tam belgelenmiş

---

## İşçi 7: AI Uzmanı - Yapay Zeka Katmanı Geliştirme

### Temel Sorumluluklar
- AI Orchestrator tasarımı ve implementasyonu
- Yerel LLM ve diğer AI modellerinin entegrasyonu
- Bilgisayarlı görü ve ses işleme servisleri
- Model yönetimi, optimizasyonu ve değerlendirmesi
- AI katmanı performans ve doğruluk metrikleri

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 7.1: Temel Altyapı (Hafta 1-2)
- **Mikro Görev 7.1.1:** Python ile AI Orchestrator projesinin kurulumu
  - Detay: Proje yapısı, Asenkron destek (asyncio), Dependency injection, Docker.
- **Mikro Görev 7.1.2:** Temel API yapılandırması (FastAPI)
  - Detay: RESTful API, Endpoint tanımları, Pydantic validasyonu, API versiyonlama.
- **Mikro Görev 7.1.3:** Loglama ve hata işleme
  - Detay: Yapılandırılabilir loglama, Hata yakalama/raporlama, Distributed tracing, Metrik.
- **Mikro Görev 7.1.4:** Model yönetim altyapısı
  - Detay: Model registry, Model yükleme/indirme, Versiyon kontrolü.
- **Mikro Görev 7.1.5:** Temel birim testleri
  - Detay: Test altyapısı, Mock/fixture'lar, Kapsam raporlama.

#### Makro Görev 7.2: Local LLM Entegrasyonu (Hafta 3-4)
- **Mikro Görev 7.2.1:** llama.cpp/GGML entegrasyonu
  - Detay: Python bindings, Model yükleme/yapılandırma, Inference API.
- **Mikro Görev 7.2.2:** Metin üretimi API'si
  - Detay: Prompt mühendisliği, Üretim parametreleri, Streaming desteği.
- **Mikro Görev 7.2.3:** Model seçimi ve yönlendirme
  - Detay: Model yetenek matrisi, Dinamik model seçimi, Yük dengeleme.
- **Mikro Görev 7.2.4:** Performans optimizasyonu
  - Detay: Quantization, Batch processing, GPU hızlandırma.
- **Mikro Görev 7.2.5:** LLM entegrasyon testleri
  - Detay: Birim, Entegrasyon, Performans, Doğruluk testleri.

#### Makro Görev 7.3: Computer Vision Servisi (Hafta 5-6)
- **Mikro Görev 7.3.1:** OpenCV entegrasyonu
  - Detay: Python bindings, Görüntü işleme pipeline.
- **Mikro Görev 7.3.2:** Görüntü analizi API'si
  - Detay: Nesne tanıma, Görüntü sınıflandırma, Yüz tanıma.
- **Mikro Görev 7.3.3:** OCR (Optical Character Recognition) entegrasyonu
  - Detay: Tesseract entegrasyonu, Metin çıkarma API'si, Dil desteği.
- **Mikro Görev 7.3.4:** Performans optimizasyonu
  - Detay: GPU hızlandırma (CUDA/OpenCL), Paralel işleme.
- **Mikro Görev 7.3.5:** CV servis testleri
  - Detay: Birim, Entegrasyon, Performans, Doğruluk testleri.

#### Makro Görev 7.4: Voice Processing Servisi (Hafta 7-8)
- **Mikro Görev 7.4.1:** Ses tanıma (Speech-to-Text) entegrasyonu
  - Detay: Whisper entegrasyonu, Ses işleme pipeline, Dil algılama.
- **Mikro Görev 7.4.2:** Ses sentezi (Text-to-Speech) entegrasyonu
  - Detay: Piper TTS (veya MIT lisanslı alternatif) entegrasyonu, Ses üretimi API'si, Ses seçimi.
- **Mikro Görev 7.4.3:** Ses işleme API'si
  - Detay: Streaming desteği, Gürültü azaltma, Format dönüşümü.
- **Mikro Görev 7.4.4:** Performans optimizasyonu
  - Detay: GPU hızlandırma, Model optimizasyonu.
- **Mikro Görev 7.4.5:** Ses servis testleri
  - Detay: Birim, Entegrasyon, Performans, Doğruluk (WER/MOS) testleri.

#### Makro Görev 7.5: AI Orkestrasyon (Hafta 9-10)
- **Mikro Görev 7.5.1:** Çoklu model koordinasyon mantığı
  - Detay: Görev analizi, Model seçimi algoritması, Sonuç birleştirme.
- **Mikro Görev 7.5.2:** Bağlam yönetimi
  - Detay: Sohbet geçmişi, Kullanıcı tercihleri, Sistem durumu.
- **Mikro Görev 7.5.3:** Geri bildirim döngüsü entegrasyonu
  - Detay: Başarı/hata analizi, Model yeniden eğitimi tetikleme.
- **Mikro Görev 7.5.4:** Kaynak yönetimi ve optimizasyon
  - Detay: GPU/CPU/Bellek izleme, Model yükleme/boşaltma.
- **Mikro Görev 7.5.5:** Orkestrasyon testleri
  - Detay: Birim, Entegrasyon, Senaryo bazlı testler.

#### Makro Görev 7.6: Değerlendirme ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 7.6.1:** Model değerlendirme metrikleri
  - Detay: Doğruluk, Hız, Kaynak kullanımı, Robustness.
- **Mikro Görev 7.6.2:** Kapsamlı test ve hata ayıklama
  - Detay: Sınır durum testleri, Hata enjeksiyonu.
- **Mikro Görev 7.6.3:** Performans iyileştirmeleri
  - Detay: Profiling, Darboğaz analizi, Algoritma optimizasyonu.
- **Mikro Görev 7.6.4:** Dokümantasyon güncellemesi
  - Detay: API referansı, Model entegrasyon kılavuzu, Mimari, Sorun giderme.
- **Mikro Görev 7.6.5:** Dağıtım ve CI/CD entegrasyonu
  - Detay: CI/CD pipeline, Model dağıtımı, Monitoring/alerting.

### Teknik Gereksinimler
- Python 3.10+, FastAPI 0.95+, Pydantic 2.0+, ONNX Runtime, PyTorch (veya ilgili framework), llama.cpp bindings, OpenCV-Python, Tesseract bindings, Whisper bindings, Piper TTS (veya alternatif), Docker & Docker Compose, GitHub Actions.

### Kod Kalite Metrikleri
- Test kapsamı: ≥ 85%
- Kod tekrarı: < 5%
- Siklomat karmaşıklığı: ≤ 15
- flake8/Black uyarısı: 0
- Type hints: Zorunlu
- Dokümantasyon kapsamı: ≥ 80%

---

## İşçi 8: Güvenlik ve DevOps Uzmanı - Güvenlik ve Altyapı Geliştirme

### Temel Sorumluluklar
- Güvenlik katmanı (Policy Enforcement, Sandbox, Audit) tasarımı ve implementasyonu
- CI/CD pipeline kurulumu, yönetimi ve optimizasyonu
- Konteyner orkestrasyonu (Docker Compose, Kubernetes)
- İzleme (monitoring) ve günlük kaydı (logging) altyapısı
- Altyapı güvenliği ve sertleştirmesi

### Detaylı Görevler (12 Haftalık Plan)

#### Makro Görev 8.1: Temel Altyapı ve CI/CD (Hafta 1-2)
- **Mikro Görev 8.1.1:** CI/CD pipeline (GitHub Actions) kurulumu
  - Detay: Linting, Test, Build, Artifact yönetimi.
- **Mikro Görev 8.1.2:** Docker yapılandırmaları ve optimizasyonu
  - Detay: Multi-stage builds, Image boyut optimizasyonu, Güvenlik taraması.
- **Mikro Görev 8.1.3:** Geliştirme ortamı (Docker Compose) yönetimi
  - Detay: Servis yapılandırmaları, Ağ ayarları, Veri kalıcılığı.
- **Mikro Görev 8.1.4:** Temel izleme ve günlük kaydı altyapısı
  - Detay: Prometheus/Grafana kurulumu, Temel metrik toplama, Merkezi loglama (ELK/Loki).
- **Mikro Görev 8.1.5:** Altyapı dokümantasyonu
  - Detay: CI/CD akışı, Docker yapılandırmaları, İzleme kurulumu.

#### Makro Görev 8.2: Güvenlik Katmanı - Policy Enforcement (Hafta 3-4)
- **Mikro Görev 8.2.1:** Rust ile Policy Enforcement Service kurulumu
  - Detay: Proje yapısı, API (gRPC/REST), Docker yapılandırması.
- **Mikro Görev 8.2.2:** OPA (Open Policy Agent) entegrasyonu
  - Detay: Rego politikaları, OPA SDK kullanımı, Politika yönetimi.
- **Mikro Görev 8.2.3:** Erişim kontrol politikaları
  - Detay: Rol tabanlı, Öznitelik tabanlı politikalar, API yetkilendirme.
- **Mikro Görev 8.2.4:** Politika testleri
  - Detay: Birim testleri, Entegrasyon testleri, Politika doğrulama.
- **Mikro Görev 8.2.5:** API Gateway entegrasyonu
  - Detay: Yetkilendirme çağrıları, Hata işleme, Performans.

#### Makro Görev 8.3: Güvenlik Katmanı - Sandbox Manager (Hafta 5-6)
- **Mikro Görev 8.3.1:** Go ile Sandbox Manager Service kurulumu
  - Detay: Proje yapısı, API (gRPC/REST), Docker yapılandırması.
- **Mikro Görev 8.3.2:** Linux cgroups ve namespaces entegrasyonu
  - Detay: Kaynak sınırlama (CPU, Bellek), İzolasyon (PID, Ağ).
- **Mikro Görev 8.3.3:** Sandbox yaşam döngüsü yönetimi
  - Detay: Sandbox oluşturma/yok etme, Yapılandırma, Durum izleme.
- **Mikro Görev 8.3.4:** Güvenlik profilleri
  - Detay: Seccomp, AppArmor/SELinux entegrasyonu.
- **Mikro Görev 8.3.5:** Sandbox testleri
  - Detay: İzolasyon testleri, Kaynak limit testleri, Güvenlik testleri.

#### Makro Görev 8.4: Güvenlik Katmanı - Audit Service (Hafta 7-8)
- **Mikro Görev 8.4.1:** Go ile Audit Service kurulumu
  - Detay: Proje yapısı, API (gRPC/REST), Docker yapılandırması.
- **Mikro Görev 8.4.2:** Güvenlik günlüğü toplama
  - Detay: Log formatı, Servislerden log alma, Log zenginleştirme.
- **Mikro Görev 8.4.3:** SQLite/PostgreSQL entegrasyonu
  - Detay: Veritabanı şeması, Log saklama, İndeksleme.
- **Mikro Görev 8.4.4:** Denetim API'si
  - Detay: Log sorgulama, Filtreleme, Raporlama.
- **Mikro Görev 8.4.5:** Audit testleri
  - Detay: Log bütünlüğü, Sorgu doğruluğu, Performans testleri.

#### Makro Görev 8.5: Kubernetes Dağıtımı (Hafta 9-10)
- **Mikro Görev 8.5.1:** Kubernetes manifest dosyaları (YAML)
  - Detay: Deployment, Service, Ingress, ConfigMap, Secret.
- **Mikro Görev 8.5.2:** Helm chart oluşturma
  - Detay: Şablonlama, Değerler, Bağımlılıklar.
- **Mikro Görev 8.5.3:** Kubernetes güvenlik yapılandırmaları
  - Detay: Network Policies, Pod Security Policies/Admission, RBAC.
- **Mikro Görev 8.5.4:** CI/CD ile Kubernetes entegrasyonu
  - Detay: Otomatik dağıtım, Canary/Blue-Green deployment.
- **Mikro Görev 8.5.5:** Kubernetes testleri
  - Detay: Manifest validasyonu, Dağıtım testleri, Güvenlik taraması.

#### Makro Görev 8.6: İzleme, Günlük Kaydı ve Stabilizasyon (Hafta 11-12)
- **Mikro Görev 8.6.1:** Gelişmiş izleme (Prometheus/Grafana)
  - Detay: Servis metrikleri, Özel dashboardlar, Alerting kuralları.
- **Mikro Görev 8.6.2:** Merkezi günlük kaydı (ELK/Loki)
  - Detay: Log toplama ajanları, Log ayrıştırma, Arama/analiz.
- **Mikro Görev 8.6.3:** Altyapı güvenlik taraması ve sertleştirmesi
  - Detay: Konteyner/Host taraması, CIS benchmark uyumluluğu.
- **Mikro Görev 8.6.4:** Dokümantasyon güncellemesi
  - Detay: Güvenlik mimarisi, CI/CD, Dağıtım, İzleme/Günlük kaydı kılavuzları.
- **Mikro Görev 8.6.5:** Performans testi ve optimizasyon
  - Detay: Altyapı darboğaz analizi, Kaynak optimizasyonu.

### Teknik Gereksinimler
- Docker, Docker Compose, Kubernetes, Helm, GitHub Actions, Prometheus, Grafana, ELK Stack/Loki, Rust 1.70+, Go 1.20+, OPA, Linux (cgroups, namespaces), Bash/Shell scripting.

### Kod/Yapılandırma Kalite Metrikleri
- CI/CD başarı oranı: > 98%
- Güvenlik taraması açıkları: 0 Kritik/Yüksek
- Altyapı yapılandırma tekrarı: Minimum (IaC prensipleri)
- İzleme kapsamı: Kritik servis metriklerinin %95'i
- Dokümantasyon kapsamı: ≥ 85%

