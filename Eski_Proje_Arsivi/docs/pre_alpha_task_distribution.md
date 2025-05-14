# ALT_LAS Projesi: Pre-Alpha Görev Dağılımı ve Öncelikleri

**Tarih:** 07 Mayıs 2025
**Hazırlayan:** Manus (Yönetici Rolünde)
**Faz:** Pre-Alpha

## 1. Giriş

Bu belge, ALT_LAS projesinin Pre-Alpha aşaması için tüm çalışanların görevlerini yeniden düzenlemekte ve önceliklendirmektedir. Temel hedef, çekirdek servislerin (API Gateway, Segmentation Service, Runner Service) en temel işlevlerini çalışır hale getirmek ve ana iş akışının (`*.alt` -> `*.last`) bir prototipini oluşturmaktır. Tüm çalışanların bu Pre-Alpha hedeflerine odaklanması beklenmektedir. Mevcut görevler analiz edilmiş, Pre-Alpha için kritik olanlar belirlenmiş ve diğerleri "Pre-Alpha Sonrası" olarak sınıflandırılmıştır.

## 2. Genel Pre-Alpha Hedefleri

*   **API Gateway (İşçi 1):** Temel istek yönlendirme, temel kimlik doğrulama ve çekirdek servislerle (Segmentation, Runner) iletişim için gerekli API endpoint'lerinin çalışır hale getirilmesi.
*   **Segmentation Service (İşçi 2):** Basit `*.alt` dosyalarını alıp, temel düzeyde segmentlere ayırabilen ve Runner Service'e iletebilen bir MVP oluşturulması.
*   **Runner Service (İşçi 3):** Segmentation Service'den gelen temel segmentleri işleyip, basit `*.last` dosyaları üretebilen bir MVP oluşturulması.
*   **Temel İş Akışı:** `*.alt` dosyasının API Gateway üzerinden Segmentation Service'e gönderilmesi, oradan Runner Service'e iletilmesi ve sonucunda bir `*.last` dosyasının üretilmesi sürecinin en basit haliyle çalışması.
*   **Diğer İşçiler:** Çekirdek servislerin Pre-Alpha hedeflerine ulaşmasını destekleyici minimum görevler.

## 3. İşçi Bazlı Pre-Alpha Görevleri

### İşçi 1: Backend Lider - API Gateway Geliştirme

**Pre-Alpha Odak:** API Gateway'in çekirdek servislerle (Segmentation, Runner) temel iletişimi kurabilmesi, basit istekleri yönlendirebilmesi ve temel bir kimlik doğrulama mekanizmasına sahip olması.

#### Pre-Alpha Makro Görev 1.1: Temel API Gateway Altyapısı (MVP)
*   **Mikro Görev 1.1.1 (Pre-Alpha):** Proje kurulumu ve temel middleware (CORS, body-parser) yapılandırmasının teyidi. (Mevcut durumda tamamlanmış görünüyor, kontrol edilecek.)
*   **Mikro Görev 1.1.2 (Pre-Alpha):** Temel loglama (konsola çıktı) ve basit hata işleme mekanizmasının çalışır olması.
*   **Mikro Görev 1.1.3 (Pre-Alpha):** Swagger/OpenAPI ile en temel endpointlerin (sağlık kontrolü, çekirdek servis proxy endpointleri) dokümante edilmesi.

#### Pre-Alpha Makro Görev 1.2: Temel Kimlik Doğrulama (MVP)
*   **Mikro Görev 1.2.1 (Pre-Alpha):** Çok basit bir JWT veya API Key tabanlı kimlik doğrulama mekanizmasının (doğrulama odaklı, karmaşık özellikler olmadan) çekirdek API endpointleri için implementasyonu.
    *   *Pre-Alpha Sonrası:* Refresh token, token blacklisting, rol tabanlı yetkilendirme, tam kullanıcı yönetimi API'leri, güvenlik testleri.

#### Pre-Alpha Makro Görev 1.3: Çekirdek Servis Entegrasyonu (MVP)
*   **Mikro Görev 1.3.1 (Pre-Alpha):** Segmentation Service için temel proxy endpointlerinin oluşturulması ve istek/yanıt yönlendirmesinin sağlanması.
*   **Mikro Görev 1.3.2 (Pre-Alpha):** Runner Service için temel proxy endpointlerinin oluşturulması ve istek/yanıt yönlendirmesinin sağlanması.
    *   *Pre-Alpha Sonrası:* Archive Service entegrasyonu, gelişmiş servis keşif, load balancing, circuit breaker, detaylı sağlık kontrolü ve izleme.

#### Pre-Alpha Makro Görev 1.4: Temel Komut ve Dosya İşleme API'leri (MVP)
*   **Mikro Görev 1.4.1 (Pre-Alpha):** `*.alt` dosyasını kabul edip Segmentation Service'e yönlendirecek temel bir komut gönderme API endpoint'inin oluşturulması.
    *   *Pre-Alpha Sonrası:* Komut durumu sorgulama, komut geçmişi, `*.last` dosyası indirme, performans optimizasyonu, caching, API versiyonlama, kapsamlı API testleri.

*Diğer tüm İşçi 1 görevleri (İleri Özellikler, Entegrasyon ve Stabilizasyonun detayları) Pre-Alpha Sonrası olarak sınıflandırılmıştır.*

### İşçi 2: Segmentation Uzmanı - Segmentation Service Geliştirme

**Pre-Alpha Odak:** Gelen basit bir `*.alt` dosyasını alıp, temel düzeyde ayrıştırarak (karmaşık NLP veya DSL olmadan) Runner Service'in işleyebileceği segmentlere bölmek ve iletmek.

#### Pre-Alpha Makro Görev 2.1: Temel Segmentation Altyapısı (MVP)
*   **Mikro Görev 2.1.1 (Pre-Alpha):** Python/FastAPI proje kurulumu ve temel API endpoint'inin (`/segment`) oluşturulması.
*   **Mikro Görev 2.1.2 (Pre-Alpha):** Temel loglama ve basit hata işleme.
*   **Mikro Görev 2.1.3 (Pre-Alpha):** `*.alt` dosyasını girdi olarak alacak ve segment listesini çıktı olarak verecek temel Pydantic modellerinin oluşturulması.
*   **Mikro Görev 2.1.4 (Pre-Alpha):** En temel birim testlerinin yazılması.

#### Pre-Alpha Makro Görev 2.2: Temel `*.alt` Ayrıştırma ve Segmentasyon (MVP)
*   **Mikro Görev 2.2.1 (Pre-Alpha):** Basit `*.alt` dosya formatını (örneğin, her satır bir komut/segment) okuyup temel segmentlere ayırabilen bir ayrıştırıcı geliştirilmesi. (Karmaşık DSL veya NLP özellikleri bu aşamada gerekli değil).
*   **Mikro Görev 2.2.2 (Pre-Alpha):** Ayrıştırılan segmentlerin Runner Service'e iletilmesi için temel entegrasyonun sağlanması.
    *   *Pre-Alpha Sonrası:* Detaylı DSL tasarımı, gelişmiş komut ayrıştırma, NLP entegrasyonu, tam `*.alt` format implementasyonu, kapsamlı ayrıştırma testleri.

*Diğer tüm İşçi 2 görevleri (Mod ve Persona Sistemi, İleri Segmentasyon ve Metadata, API ve Entegrasyon detayları, İleri Özellikler) Pre-Alpha Sonrası olarak sınıflandırılmıştır.*

### İşçi 3: Runner Geliştirici - Runner Service Geliştirme

**Pre-Alpha Odak:** Segmentation Service'den gelen basit segmentleri alıp, her segment için varsayılan bir işlem (örneğin, sadece loglama veya basit bir komut çalıştırma) gerçekleştirerek temel bir `*.last` dosyası (veya yapısı) üretmek.

#### Pre-Alpha Makro Görev 3.1: Temel Runner Altyapısı (MVP)
*   **Mikro Görev 3.1.1 (Pre-Alpha):** Rust/Tokio proje kurulumu ve temel API endpoint'inin (`/execute_segment`) oluşturulması.
*   **Mikro Görev 3.1.2 (Pre-Alpha):** Temel loglama ve basit hata işleme.
*   **Mikro Görev 3.1.3 (Pre-Alpha):** Segmenti girdi olarak alacak ve işlem sonucunu (`*.last` formatına temel oluşturacak bilgiyi) çıktı olarak verecek temel Serde modellerinin oluşturulması.
*   **Mikro Görev 3.1.4 (Pre-Alpha):** En temel birim testlerinin yazılması.

#### Pre-Alpha Makro Görev 3.2: Temel Segment İşleme ve `*.last` Üretimi (MVP)
*   **Mikro Görev 3.2.1 (Pre-Alpha):** Gelen segmentleri alıp, her biri için önceden tanımlanmış basit bir işlemi (örneğin, "echo [segment_adı] executed") çalıştıran bir mantık geliştirilmesi.
*   **Mikro Görev 3.2.2 (Pre-Alpha):** İşlem sonuçlarını içeren (segment ID, başarı durumu, basit çıktı) temel bir `*.last` dosyası yapısının (JSON veya basit metin formatında) oluşturulması ve API Gateway'e veya bir sonraki adıma (eğer varsa) iletilmesi.
    *   *Pre-Alpha Sonrası:* Detaylı `*.alt` dosya işleme, AI servis entegrasyonları, paralel/asenkron işlem yönetimi, tam `*.last` format implementasyonu, hata toleransı, kapsamlı testler.

*Diğer tüm İşçi 3 görevleri (AI Servis Entegrasyonları, İleri İşlem Yönetimi, API ve Entegrasyon detayları, İleri Özellikler) Pre-Alpha Sonrası olarak sınıflandırılmıştır.*

### İşçi 4: Arşiv Servisi Geliştiricisi - Archive Service

**Pre-Alpha Odak:** Pre-Alpha aşamasında Archive Service'in aktif geliştirilmesi **öncelikli değildir**. Temel iş akışı (`*.alt` -> `*.last`) tamamlandıktan sonra Alpha aşamasında devreye alınması daha uygundur. Bu nedenle, İşçi 4 Pre-Alpha süresince diğer çekirdek servislerin (API Gateway, Segmentation, Runner) testlerine ve dokümantasyonuna destek olabilir veya kendi servisinin Alpha MVP'si için hazırlık yapabilir.

*   **Mikro Görev 4.P1 (Pre-Alpha Destek):** API Gateway, Segmentation Service ve Runner Service için temel API dokümantasyonlarının (Swagger/OpenAPI) gözden geçirilmesine ve iyileştirilmesine yardımcı olmak.
*   **Mikro Görev 4.P2 (Pre-Alpha Destek):** Çekirdek servislerin temel entegrasyon test senaryolarının oluşturulmasına katkıda bulunmak.
*   **Mikro Görev 4.P3 (Pre-Alpha Hazırlık):** Archive Service'in Alpha MVP'si için (`*.last` dosyalarını alıp temel düzeyde saklayacak ve basit bir ID ile sorgulanabilir yapacak) mimari ve veri modeli tasarımını başlatmak.

*İşçi 4'ün `worker_tasks_detailed.md` dosyasındaki tüm ana geliştirme görevleri Pre-Alpha Sonrası (Alpha ve sonrası) olarak sınıflandırılmıştır.*

### İşçi 5: AI Orchestrator Uzmanı - AI Orchestrator Service

**Pre-Alpha Odak:** Pre-Alpha aşamasında AI Orchestrator Service'in aktif geliştirilmesi **öncelikli değildir**. Runner Service'in temel MVP'si tamamlandıktan sonra bu servisin entegrasyonu değerlendirilecektir.

*   **Mikro Görev 5.P1 (Pre-Alpha Destek):** Runner Service (İşçi 3) ile koordineli olarak, AI modellerinin Runner Service'e nasıl entegre edilebileceğine dair temel bir konsept ve arayüz (API sözleşmesi) üzerinde fikir üretmek.
*   **Mikro Görev 5.P2 (Pre-Alpha Hazırlık):** En temel bir AI model adaptörünün (örneğin, sadece bir API çağrısı yapıp yanıtı döndüren basit bir OpenAI adaptörü) prototipini geliştirmeye başlamak (Runner Service'den bağımsız olarak).

*İşçi 5'in `worker_tasks_detailed.md` dosyasındaki tüm ana geliştirme görevleri Pre-Alpha Sonrası (Alpha ve sonrası) olarak sınıflandırılmıştır.*

### İşçi 6: OS Integration & DevOps Uzmanı - CI/CD, Test Otomasyonu ve Altyapı

**Pre-Alpha Odak:** Çekirdek servisler (API Gateway, Segmentation, Runner) için en temel CI (Sürekli Entegrasyon) pipeline'larını kurmak: Kod derleme ve temel birim testlerini otomatik çalıştırma.

#### Pre-Alpha Makro Görev 6.1: Temel CI Altyapısı (MVP)
*   **Mikro Görev 6.1.1 (Pre-Alpha):** GitHub Actions (veya seçilen CI platformu) üzerinde API Gateway, Segmentation Service ve Runner Service için ayrı CI workflow'ları oluşturmak.
*   **Mikro Görev 6.1.2 (Pre-Alpha):** Bu workflow'ların her commit'te otomatik olarak tetiklenmesini sağlamak.
*   **Mikro Görev 6.1.3 (Pre-Alpha):** Her servis için kodun derlenmesini (build) ve temel birim testlerinin çalıştırılmasını CI pipeline'ına eklemek.
*   **Mikro Görev 6.1.4 (Pre-Alpha):** Build ve test sonuçlarının (başarılı/başarısız) basit bir şekilde raporlanmasını sağlamak.
    *   *Pre-Alpha Sonrası:* Docker yapılandırması, artifact repository, test otomasyon altyapısı, K8s, performans testleri, güvenlik taramaları.

*Diğer tüm İşçi 6 görevleri Pre-Alpha Sonrası olarak sınıflandırılmıştır.*

### İşçi 7: UI/UX Lideri - Arayüz Geliştirme

**Pre-Alpha Odak:** Pre-Alpha aşamasında UI geliştirilmesi **öncelikli değildir**. Çekirdek backend servislerinin API'leri stabil hale geldikten sonra Alpha aşamasında UI geliştirilmeye başlanacaktır.

*   **Mikro Görev 7.P1 (Pre-Alpha Destek):** API Gateway (İşçi 1) tarafından tanımlanan temel API endpoint'lerini (özellikle `*.alt` gönderme) inceleyerek, gelecekteki UI entegrasyonu için temel gereksinimleri ve kullanıcı akışlarını taslak olarak belirlemek.
*   **Mikro Görev 7.P2 (Pre-Alpha Hazırlık):** En temel UI bileşenleri için (örneğin, bir dosya yükleme formu) wireframe veya mock-up tasarımlarına başlamak.

*İşçi 7'nin `worker_tasks_detailed.md` dosyasındaki tüm ana geliştirme görevleri Pre-Alpha Sonrası (Alpha ve sonrası) olarak sınıflandırılmıştır.*

### İşçi 8: Dokümantasyon ve Topluluk Yöneticisi - Teknik Yazarlık ve İletişim

**Pre-Alpha Odak:** Pre-Alpha aşamasında geliştirilen çekirdek servislerin (API Gateway, Segmentation, Runner) en temel API endpoint'lerinin ve işleyişinin geliştiriciler için dokümante edilmesi.

#### Pre-Alpha Makro Görev 8.1: Temel Geliştirici Dokümantasyonu (MVP)
*   **Mikro Görev 8.1.1 (Pre-Alpha):** Seçilen dokümantasyon platformunda (örneğin, projenin `docs/` klasöründe Markdown dosyaları) temel bir yapı oluşturmak.
*   **Mikro Görev 8.1.2 (Pre-Alpha):** API Gateway'in Pre-Alpha kapsamındaki temel endpoint'lerini (sağlık kontrolü, `*.alt` yükleme) açıklayan basit bir doküman oluşturmak.
*   **Mikro Görev 8.1.3 (Pre-Alpha):** Segmentation Service'in Pre-Alpha kapsamındaki temel API'sini (`/segment`) ve beklenen girdi/çıktı formatını açıklayan basit bir doküman oluşturmak.
*   **Mikro Görev 8.1.4 (Pre-Alpha):** Runner Service'in Pre-Alpha kapsamındaki temel API'sini (`/execute_segment`) ve beklenen girdi/çıktı formatını açıklayan basit bir doküman oluşturmak.
*   **Mikro Görev 8.1.5 (Pre-Alpha):** Temel `*.alt` -> `*.last` iş akışını ve servislerin bu akıştaki rollerini özetleyen bir sayfa oluşturmak.
    *   *Pre-Alpha Sonrası:* Kapsamlı API dokümantasyonu, mimari dokümanları, kullanım kılavuzları, eğitim materyalleri, topluluk yönetimi.

*Diğer tüm İşçi 8 görevleri Pre-Alpha Sonrası olarak sınıflandırılmıştır.*

## 4. Genel Notlar

*   Bu Pre-Alpha görev dağılımı, projenin en hızlı şekilde temel bir çalışan prototipe ulaşmasını hedeflemektedir.
*   Tüm işçilerin öncelikle kendi Pre-Alpha görevlerine odaklanması, ancak gerektiğinde diğer çekirdek servis geliştiricilerine destek olması beklenmektedir.
*   İletişim ve koordinasyon bu aşamada kritik öneme sahiptir. Düzenli kısa toplantılar (daily stand-ups) yapılması önerilir.
*   Pre-Alpha tamamlandığında, elde edilen sonuçlar ve geri bildirimler doğrultusunda Alpha fazı için görevler detaylandırılacaktır.

