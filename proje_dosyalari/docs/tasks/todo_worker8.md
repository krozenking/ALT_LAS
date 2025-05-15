# İşçi 8: Güvenlik ve DevOps Uzmanı - Görev Listesi

**Note:** Following the deletion of all non-main branches (Apr 30, 2025), tasks previously marked as complete based on work in those branches have been reset to incomplete `[ ]`. All future work must be done directly on the `main` branch.

## Yeni Görevler
### Yüksek Öncelikli
- [/] **Docker Güvenlik Taraması CI/CD Entegrasyonu**: Docker güvenlik taramasını CI/CD pipeline'ına entegre etme (Trivy mevcut, diğerleri eksik)
  - [X] Trivy entegrasyonu (GitHub Actions ci.yml içinde mevcut)
  - [ ] Hadolint entegrasyonu (GitHub Actions ci.yml içinde eksik)
  - [ ] Dockle entegrasyonu (GitHub Actions ci.yml içinde eksik)
  - [ ] Docker Bench Security entegrasyonu (GitHub Actions ci.yml içinde eksik)
  - [/] CI/CD pipeline yapılandırması (GitHub Actions oluşturuldu - *main üzerinde doğrulanmalı, ancak AI Orchestrator, UI, OS Integration, Workflow Engine gibi servisler için eksik*)

### Orta Öncelikli
- [ ] **Tüm Ortamlarda Güvenli Dockerfile Uygulaması**: Güvenli Dockerfile'ların tüm ortamlarda uygulanması
  - [ ] Geliştirme ortamı yapılandırması
  - [ ] Test ortamı yapılandırması
  - [ ] Staging ortamı yapılandırması
  - [ ] Üretim ortamı yapılandırması
  - [ ] Ortam özelinde güvenlik ayarları

### Düşük Öncelikli
- [ ] **Düzenli Docker Güvenlik Denetimleri**: Docker güvenlik denetimlerinin düzenli olarak gerçekleştirilmesi
  - [ ] Denetim planı oluşturma
  - [ ] Denetim araçları ve kontrol listeleri
  - [ ] Denetim raporlama şablonu
  - [ ] Denetim takip sistemi
  - [ ] Denetim otomasyonu

## Mevcut Kalan Görevler
### Docker Güvenlik İyileştirmeleri (%0)
- [ ] Kalan servislerin güvenli Dockerfile'larının oluşturulması (AI Orchestrator, Segmentation, API Gateway, Archive, Runner)
- [ ] Docker Compose güvenlik yapılandırması (docker-compose.secure.yml oluşturuldu - *main üzerinde doğrulanmalı*)
- [ ] Docker ağ güvenliği iyileştirmeleri (docs/docker_network_volume_security.md oluşturuldu - *main üzerinde doğrulanmalı*)
- [ ] Docker volume güvenliği (docs/docker_network_volume_security.md oluşturuldu - *main üzerinde doğrulanmalı*)
### Kubernetes Entegrasyonu (%0)
- [ ] Kubernetes güvenlik politikaları
- [ ] Pod güvenlik bağlamları
- [ ] Network policy yapılandırması
- [ ] Secret yönetimi

### CI/CD Güvenliği (%0)
- [ ] Pipeline güvenlik kontrolleri
- [ ] Kod analizi entegrasyonu
- [ ] Güvenlik testleri otomasyonu
- [ ] Dağıtım güvenliği

### Dokümantasyon ve Eğitim (%0)
- [ ] Güvenlik en iyi uygulamaları dokümantasyonu
- [ ] DevOps ekibi için güvenlik eğitim materyalleri

## Sonraki Adım
Görevlerin `main` dalı üzerindeki durumunu gözden geçirip yeniden önceliklendirme.

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
- **Görev PM.8.1 (Güvenlik 1.4):** Servisler arası güvenli iletişim (örneğin, mTLS) uygulayın ve tüm servislerde en az ayrıcalık erişimini zorunlu kılın (Liderlik). (Tahmini Süre: 5 gün - Diğer çalışanlarla koordinasyon gerektirir)
- **Görev PM.8.2 (Güvenlik 4.4):** Kapsamlı tehdit modellemesi yapın. Sandbox uygulama etkinliğini gözden geçirin ve gelecekteki sızma testi için plan yapın. (Tahmini Süre: 3 gün)
- **Görev PM.8.3 (KG 4.6):** Güvenlik odaklı test senaryoları (negatif testler, yetkilendirme, potansiyel sanal alan kaçışları) geliştirin ve yürütün (KG ile koordinasyon). (Tahmini Süre: 4 gün)
- **Görev PM.8.4 (Güvenlik 6.4):** Sağlam veri erişim kontrolleri uygulayın ve bekleyen ve aktarılan veriler için şifrelemeyi sağlayın (Liderlik). (Tahmini Süre: 4 gün - Diğer çalışanlarla koordinasyon gerektirir)
- **Görev PM.8.5 (DevOps 4.5):** Güvenlik tarama araçlarını (SAST, DAST, bağımlılık taraması) CI/CD ardışık düzenine entegre edin (İlgili çalışanlarla koordinasyon). (Tahmini Süre: 3 gün)
- **Görev PM.8.6 (Veri Bilimci 1.10):** Tüm servisler için performans metriklerinin (gecikme, hata oranları, kaynak kullanımı) sağlam bir şekilde toplanmasını ve analiz edilmesini sağlayın (DevOps rolü, ilgili çalışanlarla koordinasyon). (Tahmini Süre: 4 gün)
- **Görev PM.8.7 (DevOps 9.5 / YMimar 9.2):** Altyapı direncini (replikasyon, yük devretme) artırın ve kritik servis etkileşimleri için devre kesici/yeniden deneme gibi desenleri uygulayın (DevOps rolü, ilgili çalışanlarla koordinasyon). (Tahmini Süre: 5 gün)
- **Görev PM.8.8 (DevOps 7.5):** Performans verilerine dayanarak altyapıyı (kaynak tahsisi, ağ yapılandırması) sürekli olarak ayarlayın (DevOps rolü). (Tahmini Süre: Sürekli)
- **Görev PM.8.9 (DevOps 5.5):** Çapraz platform derleme, paketleme ve dağıtım süreçlerini otomatikleştirin (DevOps rolü, ilgili çalışanlarla koordinasyon). (Tahmini Süre: 5 gün)
- **Görev PM.8.10 (KG 8.2):** Tüm bileşenlerde test kapsamını (birim, entegrasyon, E2E) genişletmeye yönelik çalışmalara katkıda bulunun (Tüm çalışanlar ve KG ile koordinasyon). (Tahmini Süre: Sürekli)

### Öncelik 2 (Yüksek - Bileşen Kalitesi)
- **Görev PM.8.11 (Güvenlik 2.4):** YZ modellerine veri gönderirken veri gizliliğini sağlayın (gerektiğinde anonimleştirme/maskeleme). Yaygın YZ saldırılarına karşı savunmaları araştırın (İşçi 7 ile koordinasyon). (Tahmini Süre: 3 gün)

### Öncelik 3 (Orta - Uzun Vadeli Kalite)
- **Görev PM.8.12 (KG 9.6):** Sistem direncini arızalara karşı test etmek için kaos mühendisliği uygulamalarını tanıtın (KG ile koordinasyon). (Tahmini Süre: 4 gün)

