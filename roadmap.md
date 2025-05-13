# ALT_LAS Geliştirme Yol Haritası (Güncellenmiş)

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin geliştirme sürecini, mevcut durumunu ve gelecek hedeflerini yansıtan güncellenmiş bir yol haritasıdır. Proje, modüler bir yaklaşımla geliştirilmekte olup, her bir servis belirli işlevlere odaklanmaktadır.

## 2. Mevcut Durum ve Tamamlananlar (Mayıs 2025 itibarıyla)

Proje, başlangıçtaki 32 haftalık genel yol haritasının önemli bir bölümünü tamamlamış ve birçok çekirdek servisin temel işlevselliği hayata geçirilmiştir. Özellikle aşağıdaki alanlarda önemli ilerlemeler kaydedilmiştir:

-   **Temel Altyapı ve Çekirdek Servisler**: Monorepo yapısı kurulmuş, CI/CD temelleri atılmış, Docker yapılandırmaları oluşturulmuştur.
    -   **API Gateway**: Kapsamlı kimlik doğrulama (JWT, token yenileme, çıkış), RBAC, servis keşfi, performans izleme, loglama, caching ve Swagger dokümantasyonu gibi birçok özelliğiyle büyük ölçüde tamamlanmıştır.
    -   **Workflow Engine**: Temel iş akışı tanımlama, tetikleyiciler (manuel, zamanlanmış, webhook) ve eylemler (kod yürütme, HTTP isteği) ile çalışır durumdadır. Parça (piece) kayıt ve listeleme API'leri mevcuttur.
    -   **Segmentation Service**: Komut ayrıştırma, `*.alt` dosyası oluşturma, Mod ve Persona sistemleri ile temel işlevselliği sunmaktadır. (Not: `enhanced_main.py` dosyası eksik, bu durum servisin tam entegrasyonunu etkileyebilir.)
    -   **Runner Service**: `*.alt` dosyalarını işleme, AI servisleriyle (temel düzeyde) etkileşim, `*.last` dosyası (HTML rapor ve görev grafiği dahil) üretme yetenekleri geliştirilmiştir.
    -   **Archive Service**: `*.last` dosyalarını NATS üzerinden veya API ile kabul etme, PostgreSQL'de saklama, `*.atlas` dosyası oluşturma ve temel arama/analiz API'leri ile çalışır durumdadır.
    -   **OS Integration Service**: Windows, macOS ve Linux için temel dosya sistemi işlemleri, süreç yönetimi ve CUDA hızlandırmalı ekran görüntüsü alma gibi özellikler sunmaktadır.
    -   **AI Orchestrator**: Temel model yönetimi ve orkestrasyon yetenekleri mevcuttur, ancak daha fazla geliştirme ve entegrasyon gerektirmektedir.
-   **Kullanıcı Arayüzü Temelleri**: Desktop UI ve Web Dashboard için iskelet yapılar ve temel bileşenler oluşturulmuştur, ancak tam entegrasyon ve işlevsellik için daha fazla çalışma gerekmektedir.
-   **Veri Yönetimi**: `*.alt`, `*.last`, `*.atlas` formatları tanımlanmış ve servisler tarafından kullanılmaktadır.

## 3. Güncellenmiş Yol Haritası ve Öncelikler

Mevcut ilerleme göz önüne alındığında, yol haritası aşağıdaki önceliklere göre güncellenmiştir:

### Aşama A: Stabilizasyon ve Entegrasyon (Mevcut Odak - Yaklaşık 4-6 Hafta)

Bu aşamanın temel amacı, mevcut servislerin birbirleriyle tam entegrasyonunu sağlamak, hataları gidermek, performansı iyileştirmek ve dokümantasyonu kodla tamamen uyumlu hale getirmektir.

-   **Servis Entegrasyonlarının Tamamlanması**:
    -   Segmentation Service'in eksik ana dosyası (`enhanced_main.py`) tamamlanmalı ve diğer servislerle tam entegrasyonu sağlanmalıdır.
    -   Tüm servisler arasındaki API çağrılarının ve veri akışlarının sorunsuz çalıştığından emin olunmalıdır.
    -   Workflow Engine'in diğer servislerle (AI Orchestrator, OS Integration) entegrasyonu güçlendirilmelidir.
-   **Hata Ayıklama ve Stabilizasyon**:
    -   Her serviste kapsamlı testler (birim, entegrasyon, E2E) yapılmalı ve tespit edilen hatalar giderilmelidir.
    -   Servislerin uzun süreli çalışmalarda stabil kalması sağlanmalıdır.
-   **Performans İyileştirmeleri**:
    -   API Gateway, Runner Service ve AI Orchestrator gibi kritik servislerde performans profillemesi yapılmalı ve darboğazlar giderilmelidir.
    -   Veritabanı sorguları (Archive Service) optimize edilmelidir.
-   **Dokümantasyon Güncellemesi (Devam Ediyor)**:
    -   Tüm harici dokümanlar (README'ler, mimari, geliştirici kılavuzu vb.) mevcut kod işlevleriyle %100 uyumlu hale getirilmelidir.
    -   Kod içi dokümantasyon (yorumlar, docstring'ler) güncellenmeli ve iyileştirilmelidir.
-   **Güvenlik İyileştirmeleri**:
    -   API Gateway'deki güvenlik önlemleri gözden geçirilmeli ve güçlendirilmelidir.
    -   Servisler arası iletişimde güvenlik (mTLS vb.) değerlendirilmelidir.

### Aşama B: Gelişmiş Özellikler ve Kullanıcı Deneyimi (Stabilizasyon Sonrası - Yaklaşık 8-12 Hafta)

-   **Gelişmiş AI Yetenekleri**:
    -   AI Orchestrator'ın yetenekleri artırılmalı (daha fazla model desteği, gelişmiş model seçimi, çıktı birleştirme).
    -   Computer Vision ve Ses İşleme servislerinin entegrasyonu tamamlanmalıdır.
    -   Bağlam anlama ve sürdürme yetenekleri geliştirilmelidir.
-   **Workflow Engine Geliştirmeleri**:
    -   Daha karmaşık iş akışları için destek (koşullu mantık, döngüler vb.).
    -   Daha fazla entegrasyon "parçası" eklenmelidir.
    -   Görsel iş akışı tasarım arayüzü (UI tarafında).
-   **Kullanıcı Arayüzlerinin Tamamlanması ve İyileştirilmesi**:
    -   Desktop UI ve Web Dashboard'un tüm işlevleri tamamlanmalı ve backend servisleriyle tam entegre edilmelidir.
    -   Kullanıcı deneyimi (UX) testleri yapılmalı ve geri bildirimlere göre iyileştirmeler yapılmalıdır.
    -   Mobil Companion uygulamasının geliştirilmesine başlanmalıdır.
-   **Mod ve Persona Sisteminin Derinleştirilmesi**:
    -   Mevcut modların (Normal, Dream, Explore, Chaos) ve personaların etkileri daha belirgin ve kullanışlı hale getirilmelidir.
    -   Kullanıcıların bu modları ve personaları kolayca seçip yönetebileceği arayüzler sağlanmalıdır.

### Aşama C: Beta Sürümü ve Geri Bildirim (Gelişmiş Özellikler Sonrası - Yaklaşık 4-6 Hafta)

-   **Beta Sürümünün Yayınlanması**:
    -   Platformun temel özelliklerini içeren stabil bir Beta sürümü hazırlanmalı ve sınırlı bir kullanıcı kitlesine sunulmalıdır.
-   **Kullanıcı Geri Bildirimlerinin Toplanması ve Değerlendirilmesi**:
    -   Beta kullanıcılarından aktif olarak geri bildirim toplanmalı ve bu geri bildirimler doğrultusunda iyileştirmeler planlanmalıdır.
-   **Kapsamlı Testler**:
    -   Yük testleri, güvenlik testleri ve uzun süreli stabilite testleri yapılmalıdır.

### Aşama D: Sürüm 1.0 ve Sonrası (Sürekli Geliştirme)

-   **Sürüm 1.0 Lansmanı**:
    -   Beta geri bildirimleri doğrultusunda yapılan iyileştirmelerle birlikte kararlı Sürüm 1.0 yayınlanmalıdır.
-   **Sürekli İyileştirme ve Yeni Özellikler**:
    -   Kullanıcı talepleri ve teknolojik gelişmeler doğrultusunda platforma yeni özellikler eklenmeye ve mevcut özellikler iyileştirilmeye devam edilmelidir.
    -   Topluluk katılımı teşvik edilmelidir.

## 4. Kilometre Taşları (Güncellenmiş)

-   **Kilometre Taşı A.1: Tam Dokümantasyon Uyumu (Mevcut hedef)**
    -   Tüm dokümanların (harici ve kod içi) mevcut kod tabanıyla tam uyumlu hale getirilmesi.
-   **Kilometre Taşı A.2: Servis Entegrasyonlarının Tamamlanması ve Temel Stabilizasyon**
    -   Tüm çekirdek servislerin birbirleriyle sorunsuz entegrasyonu ve temel hataların giderilmesi.
-   **Kilometre Taşı B.1: Gelişmiş AI ve Workflow Yetenekleri Prototipi**
    -   AI Orchestrator ve Workflow Engine'in gelişmiş özelliklerinin prototip olarak çalışır durumda olması.
-   **Kilometre Taşı B.2: Tamamlanmış Kullanıcı Arayüzleri (Desktop & Web)**
    -   Desktop UI ve Web Dashboard'un tüm ana işlevleriyle birlikte tamamlanmış olması.
-   **Kilometre Taşı C.1: Beta Sürümü Yayını**
    -   Platformun stabil bir Beta sürümünün yayınlanması.
-   **Kilometre Taşı D.1: Sürüm 1.0 Lansmanı**
    -   Ticari kullanıma hazır, kararlı Sürüm 1.0'ın yayınlanması.

## 5. Geliştirme Metodolojisi ve Risk Yönetimi

Proje, Agile prensiplerine uygun olarak yönetilmeye devam edecektir. Düzenli sprintler, kod incelemeleri, sürekli entegrasyon ve testler kaliteyi sağlamak için kritik öneme sahiptir. Teknik borç yönetimi ve risklerin (lisans uyumsuzlukları, performans sorunları, entegrasyon zorlukları) proaktif bir şekilde ele alınması gerekmektedir.

Bu güncellenmiş yol haritası, projenin mevcut durumunu yansıtmakta ve gelecek adımlar için bir çerçeve sunmaktadır. Esneklik korunarak, geliştirme sürecindeki öğrenimler ve geri bildirimler doğrultusunda bu yol haritası periyodik olarak gözden geçirilecektir.
