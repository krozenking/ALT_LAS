# ALT_LAS Geliştirme Yol Haritası (Güncellenmiş - Mayıs 2025)

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin geliştirme sürecini, aşamalarını ve zaman çizelgesini detaylandırmaktadır. Proje, modüler bir yaklaşımla geliştirilecek ve her bir aşama belirli hedeflere ulaşmayı amaçlayacaktır.

## 1.1 Mevcut Durum ve Yol Haritası Güncellemesi (Mayıs 2025)

*   **Mevcut İlerleme:** ~%42 (Mayıs 2025 başı itibarıyla).
*   **Kritik Darboğazlar:** Projenin genel ilerlemesi, aşağıdaki bileşenlerdeki başlangıç gecikmeleri nedeniyle beklenenin gerisindedir:
    *   Runner Service (İşçi 3): %15
    *   Kullanıcı Arayüzleri (UI - İşçi 5): %0
    *   Güvenlik Katmanı (İşçi 8): %0
*   **Yol Haritası Ayarlaması:** Bu darboğazları gidermek ve projenin temelini sağlamlaştırmak amacıyla, yol haritasının sonraki aşamaları yeniden önceliklendirilmiştir. Özellikle **Aşama 2**'nin ilk haftaları (Hafta 9-12), bu kritik bileşenlerin başlatılmasına/ilerletilmesine ve temel güvenlik/süreç iyileştirmelerine odaklanacaktır. Bu durum, sonraki kilometre taşlarının (Alfa, Beta, Sürüm 1.0) zaman çizelgesini etkileyebilir ve ilerleyen sprintlerde yeniden değerlendirilecektir.

## 2. Geliştirme Aşamaları

### Aşama 1: Temel Altyapı ve Prototip (Tamamlandı - Gecikmelerle)

*(Bu aşama nominal olarak tamamlanmış olsa da, Runner Service, UI ve Güvenlik bileşenleri planlanandan önemli ölçüde geridedir.)*

#### Hafta 1-8 Özeti:
- Proje Kurulumu ve Temel Altyapı (Tamamlandı)
- Çekirdek Servisler (API Gateway, Segmentation Service, Archive Service temelleri atıldı; Runner Service başlatıldı ancak geride kaldı)
- Kullanıcı Arayüzü Temelleri (Başlatılamadı)
- Entegrasyon ve Test (Kısmen yapıldı)

### Aşama 2: Temel İşlevsellik ve Darboğaz Giderme (Tahmini 8-10 Hafta)

#### Hafta 9-12 (Sprint X, X+1 Odaklı): Kritik Başlangıçlar ve Temel Güvenlik
- **Runner Service (İşçi 3):** *.alt* dosya işleme modülünün implementasyonu.
- **UI Geliştirme (İşçi 5):** Desktop UI (Electron/React) temel yapısının başlatılması, Erişilebilirlik (WCAG) ve girdi doğrulama prensiplerinin entegrasyonu.
- **Güvenlik Katmanı (İşçi 8):** Policy Enforcement bileşeninin başlatılması, Tehdit Modellemesi yapılması.
- **Temel Güvenlik (İşçi 8 Liderliğinde, Tüm Çalışanlar):** Servisler arası güvenli iletişim (mTLS), en az ayrıcalık erişimi, veri şifreleme ve erişim kontrollerinin uygulanması (çekirdek servisler öncelikli).
- **DevOps/Süreç:** Güvenlik tarama araçlarının (SAST, DAST vb.) CI/CD'ye entegrasyonu, Performans metrik toplama altyapısının kurulması, Çapraz platform derleme/paketleme otomasyonu, İlk SLO'ların tanımlanması, Bağımlılık lisanslarının doğrulanması.
- **OS Entegrasyonu (İşçi 6):** CUDA hızlandırmalı ekran yakalama modülüne devam edilmesi.
- **AI Katmanı (İşçi 7):** Model seçim algoritması ve paralel çalıştırma mekanizmasına devam edilmesi.
- **Diğer Servisler (İşçi 1, 2, 4):** Güvenlik ve metrik toplama entegrasyonlarına destek, CI/CD entegrasyonu, performans optimizasyonu.

#### Hafta 13-16: İşlevsellik Geliştirme ve Entegrasyon
- **Runner Service:** AI çağrıları API, Asenkron görev işleme.
- **UI Geliştirme:** Desktop UI ilerlemesi, Web Dashboard başlatılması.
- **Güvenlik Katmanı:** Sandbox Manager ve Audit Service başlatılması.
- **AI Katmanı:** Computer Vision ve Ses İşleme servislerinin ilerletilmesi.
- **OS Entegrasyonu:** Kalan OS entegrasyon görevlerinin tamamlanması.
- **Veri Yönetimi:** *.alt, *.last, *.atlas* formatlarının finalize edilmesi, Veritabanı şeması ve migrasyonlar.
- **Entegrasyon:** Servisler arası ve UI-Backend entegrasyonlarının derinleştirilmesi.
- **Test:** Test kapsamının (birim, entegrasyon, UI, güvenlik) genişletilmesi.

### Aşama 3: Gelişmiş Özellikler (Yeniden Değerlendirilecek Zaman Çizelgesi)

*(Bu aşamanın başlangıcı ve içeriği, Aşama 2'deki ilerlemeye göre ayarlanacaktır)*

- Gelişmiş AI Yetenekleri (Çoklu model orkestrasyon, bağlam anlama)
- Mod ve Persona Sistemi Implementasyonu
- Mobil Uygulama Geliştirme
- Ağ ve Cihaz Entegrasyonu

### Aşama 4: Optimizasyon ve Tamamlama (Yeniden Değerlendirilecek Zaman Çizelgesi)

*(Bu aşamanın başlangıcı ve içeriği, Aşama 3'teki ilerlemeye göre ayarlanacaktır)*

- Performans Optimizasyonu
- Kullanıcı Deneyimi İyileştirmeleri
- Dokümantasyon ve Eğitim
- Kapsamlı Test ve Hata Ayıklama

## 3. Kilometre Taşları (Tahmini - Yeniden Değerlendirilecek)

*   **Kilometre Taşı 1:** İlk Çalışan Prototip (Tamamlandı - Gecikmelerle)
*   **Kilometre Taşı 2:** Alfa Sürümü (Tahmini Hafta 18-20 - *Aşama 2'deki ilerlemeye bağlı*)
*   **Kilometre Taşı 3:** Beta Sürümü (Tahmini Hafta 26-28 - *Aşama 2 ve 3'teki ilerlemeye bağlı*)
*   **Kilometre Taşı 4:** Sürüm 1.0 (Tahmini Hafta 34-36 - *Tüm aşamalardaki ilerlemeye bağlı*)

## 4. Geliştirme Metodolojisi

### Agile Yaklaşım
- 2 haftalık sprint döngüleri
- Günlük stand-up toplantıları
- Sprint planlama ve retrospektif
- Sürekli entegrasyon ve dağıtım (CI/CD)

### Kod Kalitesi
- Kod incelemeleri (peer review)
- Statik kod analizi (CI/CD'ye entegre)
- Güvenlik taramaları (CI/CD'ye entegre)
- Test kapsamı hedefleri (%80+)
- Dokümantasyon standartları

### Sürüm Yönetimi
- Semantic versioning (SemVer)
- **Doğrudan `main` dalına geliştirme** (Yeni kural - 30 Nisan 2025)
- Küçük, mantıksal commit'ler
- Otomatik sürüm notları (Hedef)

## 5. Teknik Borç Yönetimi

Her sprint'in ~%10-15'i teknik borç azaltmaya ayrılacaktır (önceliklendirme ile):
- Kod refactoring
- Test kapsamını artırma
- Dokümantasyon iyileştirme
- Performans optimizasyonu

## 6. Risk Yönetimi

| Risk | Etki | Olasılık | Azaltma Stratejisi |
|------|------|----------|-------------------|
| **Kritik Bileşen Gecikmeleri (Runner, UI, Security)** | **Yüksek** | **Gerçekleşti** | **Yeniden önceliklendirme, kaynak odaklama (Mevcut Plan)** |
| Lisans uyumsuzluğu | Yüksek | Düşük | Sürekli bağımlılık denetimi (CI/CD), Hukuki doğrulama (Sprint X) |
| Performans sorunları | Yüksek | Orta | Erken performans metrik toplama (Sprint X), profiling, kademeli optimizasyon |
| Entegrasyon zorlukları | Orta | Orta | Servis kontratları, API versiyonlama, kapsamlı entegrasyon testleri |
| Güvenlik açıkları | Yüksek | Orta | Tehdit modellemesi (Sprint X), Güvenlik taramaları (CI/CD), Güvenli kodlama, Sızma testleri (Planlandı) |
| Kaynak yetersizliği / Çakışan Öncelikler | Orta | Orta | Net sprint hedefleri, Proje Yöneticisi tarafından sürekli önceliklendirme |

## 7. Kaynaklar ve Gereksinimler

### Geliştirme Ekibi
- 8 geliştirici (detaylar görev bölümünde)
- 1 proje yöneticisi
- 1 UI/UX tasarımcı (danışmanlık/gözden geçirme)
- 1 QA uzmanı (danışmanlık/gözden geçirme)

### Altyapı
- Geliştirme sunucuları
- CI/CD pipeline (GitHub Actions)
- Test ortamları
- Kod kalite analiz araçları (CI/CD'ye entegre)

### Yazılım ve Araçlar
- Git ve GitHub
- Docker ve Kubernetes (Hedef)
- IDE'ler ve geliştirme araçları
- Test ve izleme araçları

## 8. Başarı Kriterleri

- Kritik darboğazların (Runner, UI, Security) giderilmesi ve temel işlevselliklerinin sağlanması.
- Tanımlanmış SLO'lara ulaşılması.
- %80+ test kapsamı.
- Başarılı Alfa ve Beta testleri.
- Ticari lisans uyumluluğunun sağlanması.
- Kapsamlı ve güncel dokümantasyon.

