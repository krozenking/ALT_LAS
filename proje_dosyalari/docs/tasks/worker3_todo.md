# İşçi 3: Runner Service Geliştirme Uzmanı - Görev Listesi

**Note:** Following the deletion of all non-main branches (Apr 30, 2025), tasks previously marked as complete based on work in those branches have been reset to incomplete `[ ]`. All future work must be done directly on the `main` branch.

## Yeni Görevler
### Yüksek Öncelikli
- [ ] **Serde Kütüphanesi Kullanarak *.alt Dosyalarını İşleme Modülü**: *.alt dosyalarını işlemek için Rust Serde kütüphanesini kullanarak modülü geliştirme.
  - [ ] *.alt dosya yapısını tanımlayan Rust struct'ları oluşturma.
  - [ ] Serde deserialize kullanarak *.alt içeriğini struct'lara dönüştürme.
  - [ ] Farklı *.alt versiyonları ve formatları için hata işleme.
  - [ ] İşlenen verilerin sonraki adımlar için uygun formatta sunulması.
  - [ ] Birim testleri yazma.

### Orta Öncelikli
- [ ] **AI Çağrıları İçin API**: AI Orkestratörü ile iletişim kuracak API istemcisini geliştirme.
  - [ ] AI Orkestratörü API endpoint'lerini belirleme.
  - [ ] Reqwest veya benzeri bir kütüphane kullanarak asenkron HTTP istekleri yapma.
  - [ ] AI modellerine gönderilecek verilerin hazırlanması.
  - [ ] AI Orkestratöründen gelen yanıtların işlenmesi.
  - [ ] Hata işleme ve yeniden deneme mekanizmaları.
  - [ ] Entegrasyon testleri yazma.
- [ ] **Asenkron Görev İşleme**: Tokio kullanarak görevlerin asenkron ve paralel işlenmesini sağlama.
  - [ ] Gelen *.alt işleme istekleri için görev kuyruğu oluşturma.
  - [ ] Tokio task'leri kullanarak görevleri asenkron çalıştırma.
  - [ ] Görevlerin durumunu (beklemede, çalışıyor, tamamlandı, hata) takip etme.
  - [ ] Kaynak kullanımını optimize etme (örneğin, thread pool boyutları).
  - [ ] Performans testleri yapma.

### Düşük Öncelikli
- [ ] ***.last Üretim Sistemi**: İşlenen görevlerin sonuçlarını içeren *.last dosyalarını oluşturma.
  - [ ] *.last dosya formatını tanımlama.
  - [ ] Görev sonuçlarını (başarı/hata durumu, çıktılar, metrikler) toplama.
  - [ ] Serde serialize kullanarak verileri *.last formatına dönüştürme.
  - [ ] *.last dosyalarını NATS veya başka bir mesajlaşma sistemine gönderme.
  - [ ] Birim testleri yazma.
- [ ] **Hata İşleme ve Loglama**: Kapsamlı hata işleme ve yapılandırılmış loglama ekleme.
  - [ ] `thiserror` ve `anyhow` gibi kütüphaneler kullanarak hata yönetimini iyileştirme.
  - [ ] `tracing` veya `log` kütüphanesi kullanarak yapılandırılmış loglama ekleme.
  - [ ] Hata durumlarında anlamlı log mesajları ve metrikler üretme.
- [ ] **Birim ve Entegrasyon Testleri**: Kod kalitesini ve doğruluğunu sağlamak için test kapsamını artırma.
- [ ] **Performans Optimizasyonu**: Darboğazları belirlemek ve gidermek için kod profilleme ve optimizasyon yapma.
- [ ] **Dağıtım ve CI/CD Entegrasyonu**: Servisin Dockerize edilmesi ve CI/CD pipeline'ına entegre edilmesi.

## Mevcut İlerleme
- **Mevcut İlerleme**: %15
- **Tamamlanan Görevler**:
  - Temel Rust yapısı
  - Cargo.toml yapılandırması
  - Dockerfile oluşturma
  - Tokio asenkron runtime entegrasyonu
  - Basit HTTP API endpoint'lerinin oluşturulması
- **Kalan Görevler ve Yüzdeleri**:
  - *.alt dosyalarını işleme modülü (%20)
  - AI çağrıları için API (%15)
  - *.last üretim sistemi (%15)
  - Asenkron görev işleme (%15)
  - Hata işleme ve loglama (%10)
  - Birim ve entegrasyon testleri (%5)
  - Performans optimizasyonu (%5)
  - Dağıtım ve CI/CD entegrasyonu (%5)

## Sonraki Adım
Serde kütüphanesi kullanarak *.alt dosyalarını işleme modülünün geliştirilmesi.

## İlerleme Takip Notu

### Önemli: Düzenli İlerleme Doğrulaması

Tüm işçilerin, kendi görevlerindeki ilerlemeyi düzenli olarak doğrulamaları ve güncellemeleri gerekmektedir. Bu, projenin genel durumunun doğru bir şekilde yansıtılması için kritik öneme sahiptir.

#### Düzenli Yapılması Gereken İşlemler:

1. **İlerleme Doğrulama**: Her sprint sonunda veya önemli bir görev tamamlandığında, gerçek kod durumunuzu kontrol edin ve ilerleme yüzdenizi güncelleyin.

2. **Kod-Dokümantasyon Uyumu**: Dokümantasyonda belirttiğiniz ilerleme yüzdesi, gerçek kod tabanındaki durumla uyumlu olmalıdır.

3. **Doğrulama Raporu İncelemesi**: `/workspace/ALT_LAS/worker_progress_verification.md` dosyasını düzenli olarak inceleyin ve kendi bileşeninizle ilgili değerlendirmeleri gözden geçirin.

4. **Kalan Görevler Güncellemesi**: Tamamlanan görevleri "Tamamlanan Görevler" bölümüne ekleyin ve "Kalan Görevler ve Yüzdeleri" bölümünü güncelleyin.

5. **Öncelik Ayarlaması**: Kalan görevlerinizi öncelik sırasına göre düzenleyin ve bir sonraki adımı belirleyin.

#### Doğrulama Kriterleri:

- **%0-25**: Temel yapı oluşturulmuş, ancak çoğu özellik henüz tamamlanmamış
- **%26-50**: Temel özellikler tamamlanmış, ancak gelişmiş özellikler eksik
- **%51-75**: Çoğu özellik tamamlanmış, ancak bazı iyileştirmeler ve entegrasyonlar eksik
- **%76-99**: Neredeyse tüm özellikler tamamlanmış, son rötuşlar ve optimizasyonlar yapılıyor
- **%100**: Tüm özellikler tamamlanmış, testler geçilmiş, dokümantasyon güncel

Bu doğrulama süreci, projenin şeffaf ve doğru bir şekilde ilerlemesini sağlamak için tüm işçiler tarafından düzenli olarak uygulanmalıdır.

## Yeni Çalışma Kuralları (30 Nisan 2025 itibarıyla)

- **Tüm geliştirme işlemleri doğrudan `main` dalı üzerinde yapılacaktır.**
- **Yeni geliştirme dalları (feature branches) oluşturulmayacaktır.**
- Tüm değişiklikler küçük, mantıksal commit'ler halinde doğrudan `main` dalına push edilecektir.
- Bu kural, proje genelinde dallanma karmaşıklığını azaltmak ve sürekli entegrasyonu teşvik etmek amacıyla getirilmiştir.

## Yönetici Tarafından Atanan Kapsamlı Önerilerden Gelen Görevler (Mayıs 2025)

Proje Yöneticisi tarafından belirlenen ve önceliklendirilen yeni görevler aşağıdadır. Bu görevler, mevcut planlamayı tamamlayıcı niteliktedir ve projenin genel güvenliği, istikrarı ve kalitesi için kritik öneme sahiptir.

### Öncelik 1 (En Yüksek - Temel Güvenlik, İstikrar, Süreç)
- **Görev PM.3.1 (Güvenlik 1.4):** Güvenli servisler arası iletişim (örneğin, mTLS) ve en az ayrıcalık erişimi uygulamalarına katılın (İşçi 8 Liderliğinde). (Tahmini Süre: Koordinasyon)
- **Görev PM.3.2 (Güvenlik 6.4):** Sağlam veri erişim kontrolleri ve şifreleme uygulamalarına katılın (İşçi 8 Liderliğinde). (Tahmini Süre: Koordinasyon)
- **Görev PM.3.3 (Veri Bilimci 1.10):** Servis performans metriklerinin (gecikme, hata oranları, kaynak kullanımı) toplanması ve analizi için gerekli altyapı/loglama desteğini sağlayın (DevOps ile koordinasyon). (Tahmini Süre: 2 gün)
- **Görev PM.3.4 (DevOps 9.5 / YMimar 9.2):** Altyapı direncini artırmak için devre kesici/yeniden deneme gibi desenleri Runner Service içinde uygulayın (DevOps ile koordinasyon). (Tahmini Süre: 3 gün)
- **Görev PM.3.5 (KG 8.2):** Runner Service için birim ve entegrasyon test kapsamını genişletmeye devam edin (KG ile koordinasyon). (Tahmini Süre: Sürekli)

### Öncelik 2 (Yüksek - Bileşen Kalitesi)
- **Görev PM.3.6 (KG 1.6):** Runner Service'e özel performans ve yük testlerinin uygulanmasına yardımcı olun (KG ile koordinasyon). (Tahmini Süre: 2 gün)

