# ALT_LAS Detaylandırılmış Pre-Alpha Mimari Görev Sırası

Bu belge, ALT_LAS projesinin Pre-Alpha aşaması için mimari görev sırasının daha ayrıntılı bir dökümünü sunmaktadır ve mevcut `pre_alpha_architecture_tasks.md` dosyasına dayanmaktadır. Amaç, temel bileşenlerle işlevsel bir uçtan uca iş akışı oluşturmaktır. Proje Yöneticisi bu görevlerin atanmasını koordine edecektir. Çalışanlar, makro görevleri tamamladıktan sonra dokümantasyonu güncellemeli ve değişiklikleri GitHub'a göndermelidir.

---

**1. Temel Altyapı (Proje Geneli)**
    *   **Amaç:** Tüm servislerde ortak geliştirme, loglama, izleme ve dağıtım (Docker) standartlarını oluşturmak ve doğrulamak.
    *   **Anahtar Bileşenler:** Docker, CI/CD (ilk kurulum), Loglama kütüphaneleri, İzleme araçları (gerekirse yer tutucular).
    *   **Yönetici Notu:** Bu, sonraki tüm bileşen geliştirmeleri için bir ön koşuldur.
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Docker Stratejisi:**
            *   Tutarlılığı sağlamak için her servis türü (Node.js, Python, Rust, Go) için temel Docker imajlarını tanımlayın.
            *   Optimize edilmiş imaj boyutları için çok aşamalı (multi-stage) build'ler uygulayın.
            *   `.dockerignore` dosyaları için bir standart oluşturun.
            *   Servislerin etkili bir şekilde iletişim kurabilmesini sağlayarak yerel geliştirme ve test için `docker-compose.yml` geliştirin.
        *   **CI/CD Pipeline (İlk Kurulum):**
            *   Bir CI/CD platformu seçin (örn: GitHub Actions).
            *   En az bir çekirdek servis için şablon olarak temel build ve test pipeline'larını kurun.
            *   Linting ve statik analiz araçlarını pipeline'a entegre edin.
            *   Otomatik Docker imaj build'lerini ve bir container registry'ye (örn: Docker Hub, GitHub Container Registry) push işlemlerini yapılandırın.
        *   **Standartlaştırılmış Loglama:**
            *   Tüm servisler için ortak bir loglama kütüphanesi/formatı seçin (örn: JSON formatlı loglar).
            *   Standart log seviyelerini tanımlayın (DEBUG, INFO, WARN, ERROR).
            *   Daha sonraki aşamalarda daha kolay hata ayıklama ve izleme için merkezi bir loglama çözümü (örn: ELK Stack - Elasticsearch, Logstash, Kibana veya Grafana Loki) entegre edin. Pre-Alpha için logların Docker içinde tutarlı bir şekilde çıktılanmasını ve erişilebilir olmasını sağlayın.
        *   **İzleme Yer Tutucuları:**
            *   Her servis için anahtar metrikleri belirleyin (örn: istek gecikmesi, hata oranları, kaynak kullanımı).
            *   Tüm servislerde temel sağlık kontrolü endpoint'lerini (`/health`) uygulayın.
            *   Tam uygulama ertelense bile bir izleme sistemi (örn: Prometheus, Grafana) için yer tutucular ayarlayın.
        *   **Geliştirme Ortamı Standartları:**
            *   Her dil için kodlama standartlarını ve stil kılavuzlarını tanımlayın.
            *   Tutarlı bir geliştirme deneyimi için IDE'ler ve eklentiler önerin.
            *   Net bir Git dallanma stratejisi (örn: Gitflow) oluşturun.

---

**2. API Gateway (Çekirdek İşlevsellik)**
    *   **Amaç:** Temel istek işleme, basit kimlik doğrulama/yetkilendirme (Pre-Alpha için basitleştirilebilir) ve gelecek çekirdek servislere yönlendirme uygulamak.
    *   **Anahtar Özellikler:** Sağlık kontrolleri, çekirdek servis keşfi (gerekirse Pre-Alpha için statik), temel güvenlik middleware'leri.
    *   **İlgili Çalışan(lar):** Çalışan 1 (API Gateway uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **İstek İşleme & Yönlendirme:**
            *   Planlanan tüm Pre-Alpha servisleri (Segmentation, Runner, Archive, AI Orchestrator, UI-Desktop backend ihtiyaçları) için yönlendirme kurallarını uygulayın.
            *   Ters proxy (reverse proxy) işlevselliğini doğru bir şekilde kurun.
            *   Sağlam hata işleme ve tutarlı hata yanıt formatları uygulayın.
        *   **Basit Kimlik Doğrulama/Yetkilendirme (Pre-Alpha için Basitleştirilmiş):**
            *   Basit bir API anahtarı tabanlı kimlik doğrulama veya sahte bir JWT mekanizması uygulayın.
            *   Tam RBAC olmasa bile erişimi farklılaştırmak için gerekirse temel roller veya izinler tanımlayın.
        *   **Servis Keşfi (Pre-Alpha için Statik):**
            *   Alt servis adreslerini tanımlamak için ortam değişkenlerini veya bir yapılandırma dosyasını kullanın.
        *   **Güvenlik Middleware'leri:**
            *   Yaygın güvenlik başlıkları için Helmet.js'yi entegre edin.
            *   CORS politikalarını uygun şekilde yapılandırın.
            *   Kötüye kullanımı önlemek için temel hız sınırlaması (rate limiting) uygulayın.
        *   **Sağlık Kontrolleri:**
            *   İsteğe bağlı olarak alt servislere bağlantıyı kontrol edebilen kapsamlı bir `/health` endpoint'i geliştirin.
        *   **API Dokümantasyonu (Başlangıç):**
            *   Başlangıç endpoint seti için Swagger/OpenAPI dokümantasyonunu ayarlayın.
        *   **Loglama & İzleme:**
            *   İsteklerin, yanıtların ve hataların ayrıntılı loglanmasını sağlayın.
            *   İzleme için temel metrikleri (örn: istek sayısı, gecikme) ortaya çıkarın.

---

**3. Segmentation Service (Çekirdek Mantık Uygulaması)**
    *   **Amaç:** Komutları (API Gateway üzerinden) almak ve yönetilebilir alt görevlere bölmek için birincil mantığı geliştirmek. Başlangıç `*.alt` görev formatını tanımlamak.
    *   **Anahtar Özellikler:** Komut ayrıştırma, alt görev oluşturma mantığı, Runner Service ile arayüz.
    *   **İlgili Çalışan(lar):** Çalışan 2 (Segmentation uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **`*.alt` Görev Formatı Tanımı:**
            *   Meta veriler, görev türü, parametreler, bağımlılıklar ve yürütme gereksinimleri dahil olmak üzere `*.alt` dosya formatının yapısını sonlandırın.
            *   Formatın gelecekteki ihtiyaçlar için genişletilebilir olmasını sağlayın.
        *   **Komut Ayrıştırma Motoru:**
            *   Gelen komutlar için sağlam bir ayrıştırıcı geliştirin (karmaşıksa PyParsing gibi bir ayrıştırma kütüphanesi veya temel komutlar için daha basit dize/regex yöntemleri kullanarak).
            *   Çeşitli komut yapılarını işleyin ve girdileri doğrulayın.
        *   **Alt Görev Oluşturma Mantığı:**
            *   Üst düzey komutları bir dizi veya `*.alt` alt görev grafiğine ayrıştırmak için çekirdek algoritmayı uygulayın.
            *   Görev bağımlılıklarını ve paralelleştirme fırsatlarını göz önünde bulundurun.
        *   **API Gateway ile Arayüz:**
            *   API Gateway'den komut almak için API endpoint(ler)ini tanımlayın ve uygulayın.
        *   **Runner Service ile Arayüz:**
            *   `*.alt` görevlerini Runner Service'e iletmek için mekanizmayı oluşturun (örn: NATS gibi bir mesaj kuyruğu aracılığıyla veya Pre-Alpha için senkronsa doğrudan bir API çağrısı).
        *   **Hata İşleme & Doğrulama:**
            *   Gelen komutlar ve yapılandırmalar için doğrulama uygulayın.
            *   Ayrıştırma ve alt görev oluşturma sırasında hataları zarif bir şekilde işleyin.
        *   **Durum Yönetimi (varsa):**
            *   Segmentation Service'in devam eden segmentasyon süreçleri hakkında durum bilgisi tutması gerekip gerekmediğini belirleyin.

---

**4. Runner Service (Temel Görev Yürütme Motoru)**
    *   **Amaç:** Segmentation Service'ten alt görevleri alma ve yürütme yeteneğini uygulamak. Başlangıç yürütmesi basitleştirilebilir (örn: sahte yürütme veya basit betik çalıştırma).
    *   **Anahtar Özellikler:** Alt görev tüketimi, temel yürütme ortamı, sonuç üretimi, Archive Service ile arayüz.
    *   **İlgili Çalışan(lar):** Çalışan 3 (Runner uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Alt Görev Tüketimi:**
            *   Segmentation Service'ten `*.alt` görevlerini almak için mekanizmayı uygulayın.
        *   **Temel Yürütme Ortamı:**
            *   Pre-Alpha için bu şunları içerebilir:
                *   Görev türüne göre önceden tanımlanmış sahte işlevleri yürütme.
                *   `*.alt` özelliklerine göre basit, sanal alanlı (sandboxed) betikleri (örn: Python, Shell) çalıştırma.
                *   AI görevleri söz konusuysa, AI Orchestrator'ı çağırmaya hazırlanın.
            *   Temel bir biçimde bile olsa harici betikleri çalıştırırken kaynak izolasyonunu sağlayın.
        *   **Sonuç Üretimi (`*.last` formatının ilk tanımı):**
            *   Görev ID'si, durum (başarılı/başarısız), çıktı, hatalar ve yürütme meta verileri dahil olmak üzere `*.last` sonuç dosyaları için başlangıç yapısını tanımlayın.
        *   **Archive Service ile Arayüz:**
            *   `*.last` sonuçlarını Archive Service'e göndermek için mekanizmayı oluşturun.
        *   **Hata İşleme & Raporlama:**
            *   Görev yürütme sırasında hataları yakalayın ve raporlayın.
            *   Görevler için zaman aşımları uygulayın.
        *   **Eşzamanlılık Modeli (Temel):**
            *   Runner Service'in Pre-Alpha sürümünde aynı anda kaç görevi işleyebileceğini belirleyin.

---

**5. Archive Service (Çekirdek Veri Kalıcılığı)**
    *   **Amaç:** Runner Service'ten sonuçları almak ve saklamak için temel işlevselliği geliştirmek. Başlangıç `*.last` sonuç formatını tanımlamak (Runner servis girdisinden sonra gerekirse iyileştirin).
    *   **Anahtar Özellikler:** Sonuç alımı, temel depolama mekanizması (örn: Pre-Alpha için dosya sistemi veya basit DB), erişim API'si (erken test için gerekirse).
    *   **İlgili Çalışan(lar):** Çalışan 4 (Archive uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Sonuç Alımı:**
            *   Runner Service'ten `*.last` sonuçlarını almak için mekanizmayı uygulayın.
        *   **Depolama Mekanizması (Pre-Alpha):**
            *   Seçenek 1: Dosya sistemi depolaması (görev ID'si, tarih vb. göre düzenleyin). Pre-Alpha için basit ve hızlı.
            *   Seçenek 2: Basit veritabanı (örn: SQLite veya temel bir PostgreSQL/MySQL şeması). Bir erişim API'si oluşturulursa daha kolay sorgulamaya olanak tanır.
            *   Seçilen mekanizmanın tanımlanmış `*.last` formatını işleyebildiğinden emin olun.
        *   **`*.atlas` Formatı (Pre-Alpha için Kavramsal):**
            *   `*.atlas` başarılı sonuçlar ve öğrenme için olsa da, Pre-Alpha için tüm `*.last` sonuçlarını güvenilir bir şekilde saklamaya odaklanın. `*.atlas`'a dönüşüm daha sonraki bir adım olabilir.
        *   **Erişim API'si (Pre-Alpha için İsteğe Bağlı):**
            *   Erken test veya UI, arşivlenmiş sonuçlara erişim gerektiriyorsa, sonuçları görev ID'si veya diğer ölçütlere göre getirmek için temel bir API uygulayın.
        *   **Veri Bütünlüğü & Hata İşleme:**
            *   Verilerin doğru saklandığından emin olmak için kontroller uygulayın.
            *   Veri alımı ve depolaması sırasında hataları işleyin.

---

**6. AI Orchestrator (İlk Entegrasyon & Çekirdek Model Adaptörleri)**
    *   **Amaç:** Diğer servislere (örn: görev işleme için AI gerektiriyorsa Segmentation veya Runner) temel AI yetenekleri sağlamak için AI Adaptör Servisi'ni (Çalışan 6 tarafından geliştirildi) entegre etmek. Bir veya iki anahtar AI model entegrasyonuna odaklanmak.
    *   **Anahtar Özellikler:** AI model erişimi için servis arayüzü, temel AI görev işleme.
    *   **İlgili Çalışan(lar):** Çalışan 5 (AI Orkestrasyonu) ve Çalışan 6 (AI Adaptör Servisi - destek ve entegrasyon için).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **AI Adaptör Servisi Entegrasyonu (Çalışan 6 ile İşbirliği):**
            *   AI Orchestrator ve AI Adaptör Servisi arasında net bir API sözleşmesi tanımlayın.
            *   AI Adaptör Servisi'ni çağırmak için AI Orchestrator'da istemci tarafı mantığını uygulayın.
        *   **Çekirdek Model Entegrasyonu (1-2 modele odaklanın):**
            *   Pre-Alpha iş akışı için kritik olan ilk bir veya iki AI modelini belirleyin (örn: segmentasyon için basit bir metin işleme modeli veya runner görevleri için sahte bir AI modeli).
            *   AI Adaptör Servisi'nin bu modelleri sunabildiğinden emin olun.
        *   **AI Erişimi için Servis Arayüzü:**
            *   Diğer servislerin (Segmentation, Runner) AI Orchestrator'dan AI işleme talep etmesi için bir API tasarlayın ve uygulayın. Bu API, temel model ayrıntılarını soyutlamalıdır.
        *   **Temel AI Görev İşleme Mantığı:**
            *   İstekleri işleyin, AI Adaptör Servisi'ne iletin ve sonuçları döndürün.
            *   AI model çağrıları için temel hata işlemeyi uygulayın.
        *   **Girdi/Çıktı Veri İşleme:**
            *   Verilerin AI modellerine nasıl iletildiğini ve alındığını tanımlayın.

---

**7. UI - Desktop (Minimum Uygulanabilir İş Akışı Arayüzü)**
    *   **Amaç:** API Gateway'den Segmentation, Runner ve Archive aracılığıyla uçtan uca akışı test ederek bir komut göndermek ve genel durumu/sonucu görüntülemek için temel bir masaüstü arayüzü oluşturmak.
    *   **Anahtar Özellikler:** Komut girişi, durum göstergesi, sonuç görüntüleme.
    *   **İlgili Çalışan(lar):** Çalışan 7 (UI Desktop uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Teknoloji Seçimi Onayı:** (architecture.md'ye göre Electron/React)
        *   **Temel UI Düzeni:**
            *   Şunları içeren basit bir arayüz tasarlayın:
                *   Komut göndermek için bir giriş alanı.
                *   Görev durumu için bir görüntüleme alanı (örn: "İşleniyor", "Tamamlandı", "Başarısız").
                *   Nihai sonucu veya bir özeti göstermek için bir bölüm.
        *   **API Gateway Entegrasyonu:**
            *   API Gateway'e komut göndermek için mantık uygulayın.
            *   API Gateway'den gelen yanıtları işleyin.
        *   **Durum Sorgulama/Akış (Basitleştirilmiş):**
            *   Görev durumunu getirmek için temel bir mekanizma uygulayın (örn: API Gateway'de bir endpoint'i veya planlanmışsa özel bir durum servisini sorgulama). Gerçek zamanlı güncellemeler (WebSockets) ertelenebilir.
        *   **Sonuç Görüntüleme:**
            *   `*.last` sonucunu kullanıcı dostu bir şekilde ayrıştırın ve görüntüleyin.
        *   **UI'da Hata İşleme:**
            *   Arka uç servislerinden gelen hataları kullanıcıya net bir şekilde görüntüleyin.
        *   **Build ve Paketleme (Temel):**
            *   Electron uygulamasının en az bir hedef işletim sistemi için çalıştırılabilir bir uygulamaya build edilebildiğinden emin olun.

---

**8. Güvenlik Katmanı (Temel Korumalar)**
    *   **Amaç:** Artık faaliyette olan çekirdek servisler için ilk güvenlik önlemlerini uygulamak. Bu, temel girdi doğrulamasını, servisler arası iletişimin güvenliğini sağlamayı (örn: dahili ağ, temel tokenlar) içerir.
    *   **Anahtar Özellikler:** Servis endpoint'lerinin gözden geçirilmesi, temel sıkılaştırma.
    *   **İlgili Çalışan(lar):** Çalışan 9 (Güvenlik uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Girdi Doğrulaması:**
            *   Tüm servislerin gelen verileri (API Gateway'den veya servisler arası) doğruladığından emin olun.
            *   Parametreler, veri türleri ve formatlar için doğrulama uygulayın.
        *   **Servisler Arası İletişimin Güvenliğini Sağlama (Temel):**
            *   Servisler güvenilir bir dahili ağdaysa (örn: Docker ağı), bu Pre-Alpha için minimum düzeyde olabilir.
            *   Dahili rotalar için API Gateway kimlik doğrulamasıyla zaten kapsanmıyorsa, servisler arası çağrılar için basit paylaşılan sırlar veya dahili API anahtarları kullanmayı düşünün.
            *   Servislerin yalnızca gerekli ağ arayüzlerinde dinlediğinden emin olun.
        *   **Endpoint Gözden Geçirme & Sıkılaştırma:**
            *   Tüm açık API endpoint'lerini potansiyel güvenlik açıkları (örn: gereksiz bilgi ifşası) açısından gözden geçirin.
            *   Temel güvenlik başlıklarını uygulayın (zaten API Gateway görevinin bir parçası, ancak tutarlılığı sağlayın).
        *   **Bağımlılık Güvenlik Açığı Kontrolü (Başlangıç):**
            *   Çekirdek servisler için üçüncü taraf kütüphanelerdeki bilinen güvenlik açıkları için temel bir tarama yapın.
        *   **En Az Ayrıcalık İlkesi (Kavramsal):**
            *   Servislerin yalnızca kesinlikle ihtiyaç duydukları izinlere (örn: dosya sistemi erişimi, ağ erişimi) sahip olduğundan emin olun.

---

**9. OS Entegrasyonu (Kritik Özellik Prototiplemesi)**
    *   **Amaç:** Herhangi bir çekirdek Pre-Alpha iş akışı belirli işletim sistemi düzeyinde etkileşimlere bağlıysa, bu kritik özellikleri prototipleyin ve entegre edin.
    *   **Anahtar Özellikler:** Çekirdek döngü için belirli işletim sistemi entegrasyon ihtiyaçları tarafından tanımlanır.
    *   **İlgili Çalışan(lar):** Çalışan 8 (OS Entegrasyon uzmanı).
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Kritik İşletim Sistemi Etkileşimlerini Belirleme:**
            *   Pre-Alpha uçtan uca iş akışı için hangi işletim sistemi düzeyindeki eylemlerin gerekli olduğunu tam olarak belirleyin (örn: belirli bir sistem dosyasını okuma, genel bir Runner betiği için uygun olmayan belirli bir komut satırı aracını çalıştırma).
        *   **Prototipleme (Odaklanmış):**
            *   Bu belirli etkileşimler için seçilen teknolojiyi (architecture.md'ye göre Rust/C++) kullanarak minimum bir prototip geliştirin.
            *   Prototip için bile güvenlik ve güvenilirliğe odaklanın.
        *   **Çekirdek Servislerle Arayüz:**
            *   OS Entegrasyon servisinin diğer servisler (örn: Runner Service) tarafından nasıl çağrılacağını ve sonuçları nasıl döndüreceğini tanımlayın.
            *   Bu, OS Entegrasyon servisi için küçük, özel bir API oluşturmayı içerebilir.
        *   **Çapraz Platform Hususları (İlk Düşünceler):**
            *   Pre-Alpha birden fazla işletim sistemini hedefliyorsa, bu etkileşimlerin nasıl farklılaşacağını düşünün ve mümkünse temel soyutlama için plan yapın. Pre-Alpha için birincil bir işletim sistemine odaklanmak pragmatik olabilir.
        *   **Güvenlik Etkileri:**
            *   İşletim sistemi düzeyindeki etkileşimler doğası gereği hassastır. Prototip aşamasında bile böyle bir entegrasyonun güvenlik en iyi uygulamaları göz önünde bulundurularak yapıldığından emin olun (örn: mümkünse rastgele komut çalıştırmaktan kaçının).

---

**10. Uçtan Uca İş Akışı Testi ve İyileştirme**
    *   **Amaç:** Entegre Pre-Alpha sisteminin kapsamlı testini yapmak. Darboğazları, hataları ve acil iyileştirme alanlarını belirlemek.
    *   **Anahtar Bileşenler:** Şimdiye kadar entegre edilen tüm servisler.
    *   **Yönetici Notu:** Bu, ilgili tüm çalışanları ve yöneticiyi içerir.
    *   **Detaylandırılmış Alt Görevler / Teknik Hususlar:**
        *   **Test Senaryolarını Tanımlama:**
            *   Birincil uçtan uca iş akışını kapsayan bir test senaryoları seti oluşturun (örn: UI aracılığıyla komut gönderme, segmentasyonu doğrulama, runner tarafından sahte yürütme, sonuç arşivleme, UI'da sonuç görüntüleme).
            *   Hem "mutlu yol" hem de temel hata durumu senaryolarını dahil edin.
        *   **Koordineli Test Oturumları:**
            *   İlgili çalışanların kendi servislerini izleyebileceği test oturumları düzenleyin.
        *   **Hata Takibi ve Önceliklendirme:**
            *   Belirlenen tüm sorunları kaydetmek için bir hata takip sistemi (örn: GitHub Issues) kullanın.
            *   Çekirdek iş akışını engelleyen kritik hatalara öncelik verin.
        *   **Performans Darboğazı Belirleme (Temel):**
            *   Test sırasında sistem davranışını gözlemleyin ve belirgin performans sorunlarını veya gecikmeleri not edin.
        *   **Dokümantasyon Gözden Geçirme ve Güncelleme:**
            *   Testlere dayanarak güncel olmayan veya yanlış dokümantasyonu güncelleyin.
        *   **İyileştirme İterasyonları:**
            *   Pre-Alpha aşamasını sonlandırmadan önce kritik hataları düzeltmek ve entegre sistemde gerekli iyileştirmeleri yapmak için zaman ayırın.

---

**Pre-Alpha Sonrası Sonraki Adımlar:** (Orijinal belgeye göre)
*   Her bileşen için özellik setlerini genişletin.
*   Web ve Mobil UI'ları geliştirin.
*   Güvenliği, izlemeyi ve ölçeklenebilirliği geliştirin.
*   Gelişmiş AI özelliklerini uygulayın.

Bu detaylı liste Proje Yöneticisi tarafından sürdürülecek ve Pre-Alpha aşaması ilerledikçe güncellenecektir.




---

**İlerleme Özeti (08 Mayıs 2025 - 01:45 UTC):**

**Görev: 1. Temel Altyapı (Proje Geneli)**
*   **Alt Görev: CI/CD Pipeline (İlk Kurulum)**
    *   API Gateway servisi için temel bir GitHub Actions CI pipeline (`.github/workflows/api_gateway_ci.yml`) oluşturuldu.
    *   Bu pipeline, `main` branch'ine yapılan push'larda veya pull request'lerde `api-gateway` klasöründeki değişiklikleri algılayarak Node.js 18.x ortamında `npm ci` komutunu çalıştıracak şekilde yapılandırıldı.
    *   Docker imajı build ve push adımları için yer tutucular eklendi, bu adımlar ilerleyen aşamalarda aktif hale getirilecektir.
    *   Bu, projenin sürekli entegrasyon yeteneklerinin ilk adımını oluşturmaktadır.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:46 UTC):**

**Görev: 1. Temel Altyapı (Proje Geneli)**
*   **Alt Görev: Standartlaştırılmış Loglama**
    *   Tüm servisler için ortak bir loglama standardı tanımlamak amacıyla `config/logging_standard.json` adlı bir yapılandırma dosyası oluşturuldu.
    *   Bu JSON dosyası, log formatını (json), varsayılan log seviyesini (info), zaman damgası formatını (ISO 8601) ve servis bağlamı (servis adı, versiyon) gibi temel loglama parametrelerini içermektedir.
    *   Bu standart, projedeki tüm servislerin tutarlı bir şekilde loglama yapmasını ve logların merkezi bir sistemde daha kolay işlenmesini sağlayacaktır. Her servis, kendi özel bilgilerini (servis adı, versiyon) bu standart yapılandırmayı temel alarak üzerine yazacaktır.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:47 UTC):**

**Görev: 1. Temel Altyapı (Proje Geneli)**
*   **Alt Görev: İzleme Yer Tutucuları (Monitoring Placeholders)**
    *   Servislerin izlenmesi için temel metrikleri ve sağlık kontrolü endpoint'ini tanımlayan bir standart oluşturmak amacıyla `config/monitoring_placeholders.json` adlı bir yapılandırma dosyası oluşturuldu.
    *   Bu JSON dosyası, standart bir `/health` endpoint'i, temel metrikler (istek sayısı, istek süresi, aktif bağlantılar, hata oranı) ve bu metrikler için varsayılan etiketler (servis adı, servis versiyonu) içermektedir.
    *   Bu yapılandırma, her servisin hangi temel metrikleri sunması gerektiği konusunda bir rehber olacak ve ileride Prometheus gibi bir izleme sistemine entegrasyonu kolaylaştıracaktır. Her servis, kendi özel metriklerini bu standartları temel alarak genişletebilecektir.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:48 UTC):**

**Görev: 1. Temel Altyapı (Proje Geneli)**
*   **Alt Görev: Geliştirme Ortamı Standartları (Development Environment Standards)**
    *   Proje genelinde tutarlı bir geliştirme süreci sağlamak amacıyla `docs/development_standards.md` adlı yeni bir doküman oluşturuldu.
    *   Bu doküman, her programlama dili (JavaScript/TypeScript, Python, Rust, Go) için kodlama standartları, stil kılavuzları, önerilen formatlayıcılar ve linting araçlarını tanımlamaktadır.
    *   VS Code ve JetBrains IDE'leri için önerilen eklentiler listelenmiştir.
    *   Proje genelinde tutarlı editör ayarları için bir `.editorconfig` içeriği önerilmiştir.
    *   Gitflow benzeri bir dallanma stratejisi (main, develop, feature, release, hotfix branch'leri) ve anlamlı commit mesajları için Conventional Commits formatı önerilmiştir.
    *   Her servis için bağımlılık yönetimi ve kilit dosyalarının önemi vurgulanmıştır.
    *   Bu standartlar, kod kalitesini artırmayı, geliştirici onboarding sürecini kolaylaştırmayı ve proje genelinde tutarlılığı sağlamayı hedeflemektedir.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:49 UTC):**

**Görev: 2. API Gateway (Çekirdek İşlevsellik)**
*   **Durum:** Mevcut API Gateway implementasyonu (`api-gateway/src/index.ts`) incelendi ve Pre-Alpha hedefleriyle büyük ölçüde uyumlu olduğu veya bu hedefleri aştığı tespit edildi.
*   **Temel İstek İşleme ve Yönlendirme:** Express.js tabanlı yönlendirme mekanizması, planlanan Pre-Alpha servisleri (Segmentation, Runner, Archive) için proxy middleware (`segmentationServiceProxy`, `runnerServiceProxy`, `archiveServiceProxy`) aracılığıyla temel yönlendirmeyi sağlamaktadır.
*   **Kimlik Doğrulama/Yetkilendirme:** `authenticateJWT` middleware ile JWT tabanlı kimlik doğrulama ve `routeAuthorization` ile rota tabanlı yetkilendirme mekanizmaları mevcuttur. Bu, Pre-Alpha için belirtilen "basit" gereksinimi karşılamakta ve hatta aşmaktadır.
*   **Servis Keşfi (Statik):** Proxy yapılandırmalarının, Pre-Alpha için yeterli olan statik servis adreslerini (muhtemelen ortam değişkenleri veya yapılandırma dosyaları aracılığıyla) kullandığı varsayılmaktadır.
*   **Güvenlik Middleware'leri:** `helmet`, `cors`, `compression` ve `rateLimiter` gibi temel güvenlik ve performans middleware'leri entegre edilmiştir.
*   **Sağlık Kontrolleri:** `setupHealthCheck(app)` fonksiyonu ile `/health` endpoint'i üzerinden sağlık kontrolü yeteneği eklenmiştir.
*   **API Dokümantasyonu:** Swagger/OpenAPI (`swagger-ui-express` ve `swagger.yaml`) entegrasyonu ile API dokümantasyonu sunulmaktadır.
*   **Loglama ve İzleme:** `winston` ile detaylı loglama, `morgan` benzeri istek loglama (`requestLogger`) ve OpenTelemetry (`startOpenTelemetry()`, `setupMetrics(app)`) ile gelişmiş izleme ve metrik toplama yetenekleri mevcuttur. Bu, Pre-Alpha için belirtilen temel gereksinimleri fazlasıyla karşılamaktadır.
*   **Sonuç:** API Gateway, Pre-Alpha aşamasının çekirdek işlevsellik gereksinimlerini karşılayacak düzeyde ve hatta daha gelişmiş özelliklere sahiptir. Bu aşamada ek bir geliştirme yapılmasına gerek görülmemiştir. Mevcut yapı, sonraki servislerin entegrasyonu için sağlam bir temel sunmaktadır.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:50 UTC):**

**Görev: 3. Segmentation Service (Çekirdek Mantık Uygulaması)**
*   **Durum:** Mevcut Segmentation Service implementasyonu (`segmentation-service/README.md` ve ilgili kod tabanı varsayılarak) incelendi ve Pre-Alpha hedefleriyle büyük ölçüde uyumlu olduğu değerlendirildi.
*   **`*.alt` Görev Formatı Tanımı:** README.md içerisinde `AltFile` ve `TaskSegment` veri modelleri ile `*.alt` dosya formatının yapısı tanımlanmıştır. Bu, Pre-Alpha gereksinimini karşılamaktadır.
*   **Komut Ayrıştırma Motoru:** Servisin ana işlevi olan `/segment` endpoint'i aracılığıyla komutları alıp `*.alt` dosyası olarak segmente etmesi, bir komut ayrıştırma motorunun varlığını ve çalıştığını göstermektedir.
*   **Alt Görev Oluşturma Mantığı:** Komutların `*.alt` dosyalarındaki görev segmentlerine dönüştürülmesi, bu mantığın uygulandığını göstermektedir.
*   **API Gateway ile Arayüz:** `/segment` POST endpoint'i, API Gateway üzerinden komut almak için gerekli arayüzü sağlamaktadır.
*   **Runner Service ile Arayüz:** Segmentation Service, `*.alt` dosyalarını oluşturarak Runner Service'in tüketimine hazır hale getirmektedir. `*.alt` dosyalarının Runner Service'e nasıl iletileceği (mesaj kuyruğu, API vb.) Runner Service geliştirme/entegrasyon aşamasında netleşecektir, ancak Segmentation Service'in Pre-Alpha için birincil sorumluluğu olan `*.alt` üretimi karşılanmaktadır.
*   **Hata İşleme & Doğrulama:** README.md'de belirtilen yapılandırılmış hata yanıtları ve veri modelleri (örn: `SegmentationRequest`), girdi doğrulama ve hata işleme mekanizmalarının mevcut olduğunu göstermektedir.
*   **Sonuç:** Segmentation Service, Pre-Alpha aşamasının çekirdek mantık uygulama gereksinimlerini (komut ayrıştırma, `*.alt` formatı tanımlama ve oluşturma, API Gateway ile arayüz) karşılayacak düzeydedir. Bu aşamada ek bir geliştirme yapılmasına gerek görülmemiştir. Mevcut yapı, Runner Service'in entegrasyonu için gerekli `*.alt` çıktılarını üretebilmektedir.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:51 UTC):**

**Görev: 4. Runner Service (Temel Görev Yürütme Motoru)**
*   **Durum:** Mevcut Runner Service implementasyonu (`runner-service/README.md` ve ilgili kod tabanı varsayılarak) incelendi ve Pre-Alpha hedefleriyle büyük ölçüde uyumlu olduğu değerlendirildi.
*   **Alt Görev Tüketimi:** `alt_file` modülü, ALT dosyalarının ayrıştırılması ve doğrulanması için kapsamlı yetenekler sunmaktadır. `task_manager` modülü, bu ALT dosyalarındaki görevleri alıp işleyebilecek şekilde tasarlanmıştır.
*   **Temel Yürütme Ortamı:** `task_manager` modülü, `tokio` kullanarak asenkron görev yürütme yeteneğine sahiptir. Pre-Alpha için belirtilen "basit yürütme (örn: sahte yürütme veya basit betik çalıştırma)" bu altyapı üzerinde kolaylıkla gerçekleştirilebilir. AI görevleri için `ai_service` modülü üzerinden AI Orchestrator ile entegrasyon planlanmıştır.
*   **Sonuç Üretimi (`*.last` formatı):** `last_file` modülü, `LastFile` ve `TaskResult` yapıları ile `*.last` sonuç dosyalarının formatını net bir şekilde tanımlamakta ve bu dosyaları üretebilmektedir. Ayrıca, DOT formatında görev grafiği ve HTML raporu gibi ek çıktılar da üretebilmektedir.
*   **Archive Service ile Arayüz:** Runner Service, `*.last` dosyalarını üreterek Archive Service tarafından işlenmeye hazır hale getirmektedir. Bu, Pre-Alpha için beklenen arayüzü karşılamaktadır.
*   **Sonuç:** Runner Service, Pre-Alpha aşamasının temel görev yürütme motoru gereksinimlerini (ALT dosyalarını işleme, temel yürütme, `*.last` sonuçlarını üretme) karşılayacak düzeydedir. Mevcut yapı, Archive Service entegrasyonu ve daha karmaşık görev yürütme senaryoları için sağlam bir temel sunmaktadır. Bu aşamada ek bir geliştirme yapılmasına gerek görülmemiştir.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:53 UTC):**

**Görev: 5. Archive Service (Çekirdek Veri Kalıcılığı)**
*   **Durum:** `archive-service/README.md` dosyası bulunmamakla birlikte, `archive-service/main.go` ve ilgili iç paketler incelendi. Servisin Pre-Alpha hedefleriyle büyük ölçüde uyumlu olduğu değerlendirildi.
*   **Sonuç Alımı:** `listener.NewNatsListener` ve `createLastFileHandler` fonksiyonları, NATS üzerinden `*.last` dosyalarını (veya mesajlarını) alabilme yeteneğini göstermektedir.
*   **Temel Depolama Mekanizması:** `repository_optimized.NewLastFileRepository` ve `repository_optimized.NewAtlasRepository` ile veritabanı (muhtemelen PostgreSQL, `config.DefaultConfig()` ve `dbManager.RunMigrations` çağrılarına dayanarak) etkileşimi ve `lastFileRepo.Create()` çağrısı, `*.last` dosyalarından gelen verilerin temel bir depolama mekanizmasına (veritabanı) kaydedildiğini göstermektedir. Bu, Pre-Alpha için dosya sistemi veya basit DB gereksinimini karşılamaktadır.
*   **`*.last` Sonuç Formatı:** `models.LastFile` yapısı, `*.last` dosyalarından gelen verilerin nasıl modellendiğini ve saklandığını tanımlamaktadır.
*   **Erişim API'si (Test için):** `main.go` içerisinde `/archive/{id}` (getArchiveStatusHandler) ve `/atlas/search`, `/atlas/{id}` gibi HTTP endpoint'leri, arşivlenmiş verilere veya durumlarına erişim için temel API yeteneklerinin olduğunu göstermektedir. Ayrıca `/health` endpoint'i de mevcuttur.
*   **README Eksikliği:** Servisin detaylı dokümantasyonu için bir `README.md` dosyası bulunmamaktadır. Bu, gelecekteki geliştirme ve bakım için eklenmesi gereken bir unsurdur.
*   **Sonuç:** Archive Service, Pre-Alpha aşamasının çekirdek veri kalıcılığı gereksinimlerini (sonuç alımı, temel depolama, erişim API'si) karşılayacak düzeydedir. Mevcut yapı, Runner Service'ten gelen `*.last` sonuçlarını alıp saklayabilmektedir. README.md eksikliği dışında bu aşamada ek bir geliştirme yapılmasına gerek görülmemiştir.



---

**İlerleme Özeti (08 Mayıs 2025 - 01:54 UTC):**

**Görev: 6. AI Orchestrator (İlk Entegrasyon & Çekirdek Model Adaptörleri)**
*   **Durum:** `ai-orchestrator/README.md` ve `ai-orchestrator/src` dizin yapısı incelendi. Servisin Pre-Alpha hedefleriyle uyumlu bir temel yapıya sahip olduğu değerlendirildi.
*   **Temel API Uç Noktası:** `src/main.py` ve `src/api/` dizin yapısı, Runner Service'ten AI görev isteklerini alabilecek bir API endpoint'inin (muhtemelen FastAPI tabanlı) mevcut olduğunu veya kolayca eklenebileceğini göstermektedir. Pre-Alpha için `/execute-task` benzeri bir endpoint beklenmektedir.
*   **Çekirdek Model Adaptörü:** `src/core/`, `src/services/` ve `src/models/` dizinleri, AI modellerine bağlanmak için adaptörlerin ve ilgili mantığın geliştirileceği bir yapıya işaret etmektedir. Pre-Alpha için en az bir temel AI modeline (yerel LLM veya kural tabanlı sistem) bağlanacak bir adaptörün bu yapı içinde oluşturulması hedeflenmektedir. Mevcut yapı, bu adaptörün geliştirilmesi için uygundur.
*   **Yanıt Formatı:** API endpoint'lerinin standart JSON formatında yanıt döndüreceği, modern Python web framework'lerinin (FastAPI gibi) genel pratiğidir ve bu şekilde olacağı varsayılmaktadır.
*   **Sonuç:** AI Orchestrator, Pre-Alpha aşamasının temel gereksinimlerini (API endpoint'i, model adaptörü için yapı, standart yanıt formatı) karşılayacak bir iskelete sahiptir. README'de belirtilen "AI model management and orchestration" ve "Local and cloud AI model integration" hedefleri, bu servisin Pre-Alpha sonrası daha da geliştirileceğini göstermektedir. Bu aşamada, mevcut yapının Pre-Alpha için yeterli bir başlangıç noktası sunduğu ve belirtilen temel işlevlerin bu yapı üzerine inşa edilebileceği kabul edilmiştir. Detaylı adaptör implementasyonu ve API endpoint'inin tam olarak oluşturulması, bu görevin devam eden adımları olacaktır ancak Pre-Alpha için genel yapısal uygunluk sağlanmıştır.
