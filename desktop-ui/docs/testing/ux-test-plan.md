# ALT_LAS Desktop UI Kullanıcı Deneyimi Test Planı

## İçindekiler

1. [Giriş](#giriş)
2. [Test Hedefleri](#test-hedefleri)
3. [Test Kapsamı](#test-kapsamı)
4. [Test Metodolojisi](#test-metodolojisi)
5. [Test Ortamı](#test-ortamı)
6. [Test Senaryoları](#test-senaryoları)
7. [Test Takvimi](#test-takvimi)
8. [Raporlama](#raporlama)
9. [Ekler](#ekler)

## Giriş

Bu test planı, ALT_LAS Desktop UI uygulamasının kullanıcı deneyimi testlerini planlamak, yürütmek ve raporlamak için bir çerçeve sağlar. Kullanıcı deneyimi testleri, uygulamanın kullanılabilirliğini, erişilebilirliğini ve genel kullanıcı deneyimini değerlendirmek için tasarlanmıştır.

### Belge Bilgileri

- **Belge Adı**: ALT_LAS Desktop UI Kullanıcı Deneyimi Test Planı
- **Versiyon**: 1.0
- **Tarih**: 15.05.2025
- **Hazırlayan**: İşçi 5
- **Onaylayan**: Yönetici

### Revizyon Geçmişi

| Versiyon | Tarih | Açıklama | Yazar |
|----------|-------|----------|-------|
| 1.0 | 15.05.2025 | İlk sürüm | İşçi 5 |

## Test Hedefleri

Kullanıcı deneyimi testlerinin temel hedefleri şunlardır:

1. **Kullanılabilirlik**: Uygulamanın ne kadar kullanıcı dostu olduğunu değerlendirmek
2. **Erişilebilirlik**: Uygulamanın farklı yeteneklere sahip kullanıcılar tarafından ne kadar erişilebilir olduğunu değerlendirmek
3. **Performans Algısı**: Kullanıcıların uygulamanın performansını nasıl algıladığını değerlendirmek
4. **Kullanıcı Memnuniyeti**: Kullanıcıların uygulamayı kullanırken ne kadar memnun olduğunu değerlendirmek
5. **Öğrenilebilirlik**: Uygulamanın ne kadar kolay öğrenilebilir olduğunu değerlendirmek
6. **Hata Tespiti**: Kullanıcı arayüzündeki hataları ve sorunları tespit etmek
7. **İyileştirme Önerileri**: Kullanıcı deneyimini iyileştirmek için öneriler toplamak

## Test Kapsamı

Kullanıcı deneyimi testleri, ALT_LAS Desktop UI uygulamasının aşağıdaki bileşenlerini ve özelliklerini kapsar:

### Kapsam İçindeki Bileşenler

1. **Giriş ve Kimlik Doğrulama**
   - Giriş ekranı
   - Kayıt ekranı
   - Şifre sıfırlama
   - İki faktörlü kimlik doğrulama

2. **Ana Arayüz**
   - Üst çubuk
   - Kenar çubuğu
   - Ana içerik alanı
   - Durum çubuğu
   - Panel sistemi

3. **Dosya Yönetimi**
   - Dosya yükleme
   - Dosya indirme
   - Dosya organizasyonu
   - Dosya paylaşımı
   - Dosya önizleme

4. **Proje Yönetimi**
   - Proje oluşturma
   - Proje düzenleme
   - Görev yönetimi
   - Görev tahtası
   - Zaman takibi

5. **Raporlama**
   - Rapor oluşturma
   - Rapor görüntüleme
   - Rapor dışa aktarma

6. **Ayarlar**
   - Genel ayarlar
   - Görünüm ayarları
   - Senkronizasyon ayarları
   - Ağ ayarları
   - Güvenlik ayarları

### Kapsam Dışındaki Bileşenler

1. **Sunucu tarafı bileşenler**
2. **API entegrasyonları**
3. **Veritabanı performansı**
4. **Ağ performansı**

## Test Metodolojisi

Kullanıcı deneyimi testleri için aşağıdaki metodolojiler kullanılacaktır:

### 1. Kullanılabilirlik Testleri

Kullanılabilirlik testleri, gerçek kullanıcıların uygulamayı kullanırken karşılaştıkları sorunları ve deneyimleri değerlendirmek için yapılır.

**Metodoloji**:
- **Görev Tabanlı Testler**: Kullanıcılara belirli görevler verilir ve bu görevleri tamamlamaları istenir.
- **Düşünce Sesli Protokol**: Kullanıcılardan uygulamayı kullanırken düşüncelerini sesli olarak ifade etmeleri istenir.
- **Göz İzleme (İsteğe Bağlı)**: Kullanıcıların arayüzde nereye baktıklarını izlemek için göz izleme teknolojisi kullanılabilir.

**Ölçümler**:
- Görev tamamlama süresi
- Görev tamamlama oranı
- Hata sayısı
- Kullanıcı memnuniyeti puanı
- Kullanıcı yorumları

### 2. Erişilebilirlik Testleri

Erişilebilirlik testleri, uygulamanın farklı yeteneklere sahip kullanıcılar tarafından ne kadar erişilebilir olduğunu değerlendirmek için yapılır.

**Metodoloji**:
- **Otomatik Erişilebilirlik Kontrolleri**: WCAG (Web Content Accessibility Guidelines) uyumluluğunu kontrol etmek için otomatik araçlar kullanılır.
- **Manuel Erişilebilirlik Kontrolleri**: Erişilebilirlik uzmanları tarafından manuel kontroller yapılır.
- **Yardımcı Teknoloji Testleri**: Ekran okuyucular, büyüteçler, klavye navigasyonu gibi yardımcı teknolojilerle testler yapılır.

**Ölçümler**:
- WCAG uyumluluk seviyesi (A, AA, AAA)
- Erişilebilirlik sorunlarının sayısı ve şiddeti
- Yardımcı teknolojilerle kullanılabilirlik puanı

### 3. Performans Algısı Testleri

Performans algısı testleri, kullanıcıların uygulamanın performansını nasıl algıladığını değerlendirmek için yapılır.

**Metodoloji**:
- **Subjektif Değerlendirme**: Kullanıcılardan uygulamanın hızı, yanıt süresi ve genel performansı hakkında geri bildirim alınır.
- **Algılanan Performans Ölçümleri**: Kullanıcıların belirli işlemlerin ne kadar sürdüğünü tahmin etmeleri istenir ve gerçek sürelerle karşılaştırılır.

**Ölçümler**:
- Algılanan yanıt süresi
- Performans memnuniyeti puanı
- Bekleme süresi toleransı

### 4. Kullanıcı Memnuniyeti Anketleri

Kullanıcı memnuniyeti anketleri, kullanıcıların uygulamayı kullanırken ne kadar memnun olduğunu değerlendirmek için yapılır.

**Metodoloji**:
- **System Usability Scale (SUS)**: Standart bir kullanılabilirlik ölçeği kullanılır.
- **Net Promoter Score (NPS)**: Kullanıcıların uygulamayı başkalarına tavsiye etme olasılığı ölçülür.
- **Özel Memnuniyet Anketleri**: Uygulamaya özgü memnuniyet soruları sorulur.

**Ölçümler**:
- SUS puanı (0-100)
- NPS puanı (-100 ile +100 arası)
- Özel memnuniyet puanları

## Test Ortamı

Kullanıcı deneyimi testleri, aşağıdaki ortamlarda gerçekleştirilecektir:

### Donanım

- **Masaüstü Bilgisayarlar**:
  - Windows 10/11 (Intel Core i5/i7, 8GB RAM)
  - macOS 12+ (Intel/M1/M2, 8GB RAM)
  - Linux Ubuntu 20.04+ (Intel Core i5/i7, 8GB RAM)

- **Dizüstü Bilgisayarlar**:
  - Windows 10/11 (Intel Core i5/i7, 8GB RAM)
  - macOS 12+ (Intel/M1/M2, 8GB RAM)
  - Linux Ubuntu 20.04+ (Intel Core i5/i7, 8GB RAM)

### Ekran Çözünürlükleri

- 1366x768 (Yaygın dizüstü çözünürlüğü)
- 1920x1080 (Full HD)
- 2560x1440 (QHD)
- 3840x2160 (4K)

### Yazılım

- **İşletim Sistemleri**:
  - Windows 10/11
  - macOS 12+
  - Linux Ubuntu 20.04+

- **ALT_LAS Desktop UI Sürümü**: 1.5.0

- **Test Araçları**:
  - Ekran kaydediciler
  - Göz izleme yazılımı (isteğe bağlı)
  - Erişilebilirlik değerlendirme araçları
  - Anket araçları

## Test Senaryoları

Kullanıcı deneyimi testleri için aşağıdaki test senaryoları kullanılacaktır. Her senaryo, belirli bir kullanıcı görevini veya yolculuğunu temsil eder.

### Senaryo 1: Yeni Kullanıcı Kaydı ve Giriş

**Hedef**: Yeni bir kullanıcının kayıt olma ve giriş yapma sürecini değerlendirmek.

**Adımlar**:
1. Uygulamayı başlat
2. "Yeni Hesap Oluştur" seçeneğini tıkla
3. Gerekli bilgileri doldur (ad, e-posta, şifre)
4. Hesap oluştur
5. E-posta doğrulama sürecini tamamla
6. Uygulamaya giriş yap

**Beklenen Sonuç**: Kullanıcı, hesap oluşturma ve giriş yapma sürecini sorunsuz bir şekilde tamamlayabilmelidir.

### Senaryo 2: Dosya Yükleme ve Organizasyon

**Hedef**: Dosya yükleme ve organizasyon sürecini değerlendirmek.

**Adımlar**:
1. Uygulamaya giriş yap
2. "Dosyalar" bölümüne git
3. "Yükle" düğmesine tıkla
4. Birden fazla dosya seç ve yükle
5. Yeni bir klasör oluştur
6. Dosyaları klasöre taşı
7. Dosyaları etiketle
8. Dosyaları farklı görünümlerde görüntüle (liste, ızgara, galeri)

**Beklenen Sonuç**: Kullanıcı, dosya yükleme ve organizasyon sürecini sorunsuz bir şekilde tamamlayabilmelidir.

### Senaryo 3: Proje Oluşturma ve Görev Yönetimi

**Hedef**: Proje oluşturma ve görev yönetimi sürecini değerlendirmek.

**Adımlar**:
1. Uygulamaya giriş yap
2. "Projeler" bölümüne git
3. "Yeni Proje" düğmesine tıkla
4. Proje bilgilerini doldur ve oluştur
5. Projeye görevler ekle
6. Görevleri farklı durumlara taşı
7. Görevlere etiketler ve öncelikler ata
8. Görev tahtasını kullanarak görevleri yönet

**Beklenen Sonuç**: Kullanıcı, proje oluşturma ve görev yönetimi sürecini sorunsuz bir şekilde tamamlayabilmelidir.

### Senaryo 4: Rapor Oluşturma ve Dışa Aktarma

**Hedef**: Rapor oluşturma ve dışa aktarma sürecini değerlendirmek.

**Adımlar**:
1. Uygulamaya giriş yap
2. "Raporlar" bölümüne git
3. "Yeni Rapor" düğmesine tıkla
4. Rapor türünü seç
5. Rapor parametrelerini ayarla
6. Raporu oluştur
7. Raporu görüntüle
8. Raporu dışa aktar (PDF, Excel, CSV)

**Beklenen Sonuç**: Kullanıcı, rapor oluşturma ve dışa aktarma sürecini sorunsuz bir şekilde tamamlayabilmelidir.

### Senaryo 5: Ayarları Yapılandırma

**Hedef**: Uygulama ayarlarını yapılandırma sürecini değerlendirmek.

**Adımlar**:
1. Uygulamaya giriş yap
2. "Ayarlar" bölümüne git
3. Genel ayarları değiştir (dil, tema, vb.)
4. Görünüm ayarlarını değiştir
5. Senkronizasyon ayarlarını değiştir
6. Değişiklikleri kaydet
7. Uygulamayı yeniden başlat
8. Ayarların doğru uygulandığını kontrol et

**Beklenen Sonuç**: Kullanıcı, uygulama ayarlarını yapılandırma sürecini sorunsuz bir şekilde tamamlayabilmelidir.

## Test Takvimi

Kullanıcı deneyimi testleri, aşağıdaki takvime göre gerçekleştirilecektir:

| Tarih | Aktivite | Sorumlular |
|-------|----------|------------|
| 15.05.2025 | Test planı oluşturma | İşçi 5 |
| 16.05.2025 | Test senaryolarını detaylandırma | İşçi 5 |
| 17.05.2025 | Test ortamını hazırlama | İşçi 5 |
| 18.05.2025 | Kullanılabilirlik testleri | İşçi 5, Test Kullanıcıları |
| 19.05.2025 | Erişilebilirlik testleri | İşçi 5, Erişilebilirlik Uzmanı |
| 20.05.2025 | Performans algısı testleri | İşçi 5, Test Kullanıcıları |
| 21.05.2025 | Kullanıcı memnuniyeti anketleri | İşçi 5 |
| 22.05.2025 | Veri analizi ve raporlama | İşçi 5 |
| 23.05.2025 | Final rapor hazırlama | İşçi 5 |
| 24.05.2025 | Rapor sunumu | İşçi 5, Yönetici |

## Raporlama

Kullanıcı deneyimi testlerinin sonuçları, aşağıdaki formatta raporlanacaktır:

### Rapor Yapısı

1. **Yönetici Özeti**
   - Test hedefleri
   - Temel bulgular
   - Öneriler

2. **Test Metodolojisi**
   - Kullanılan metodolojiler
   - Test katılımcıları
   - Test ortamı

3. **Test Sonuçları**
   - Kullanılabilirlik test sonuçları
   - Erişilebilirlik test sonuçları
   - Performans algısı test sonuçları
   - Kullanıcı memnuniyeti anket sonuçları

4. **Bulgular ve Sorunlar**
   - Tespit edilen sorunlar
   - Sorunların şiddeti ve önceliği
   - Sorunların etkilediği kullanıcı grupları

5. **Öneriler**
   - Kullanılabilirlik iyileştirmeleri
   - Erişilebilirlik iyileştirmeleri
   - Performans iyileştirmeleri
   - Kullanıcı memnuniyeti iyileştirmeleri

6. **Ekler**
   - Test senaryoları
   - Test verileri
   - Ekran görüntüleri ve videolar
   - Anket formları

### Raporlama Metrikleri

Raporda aşağıdaki metrikler kullanılacaktır:

- **Kullanılabilirlik Metrikleri**:
  - Görev tamamlama süresi (saniye)
  - Görev tamamlama oranı (%)
  - Hata sayısı
  - Kullanıcı memnuniyeti puanı (1-5)

- **Erişilebilirlik Metrikleri**:
  - WCAG uyumluluk seviyesi (A, AA, AAA)
  - Erişilebilirlik sorunlarının sayısı ve şiddeti
  - Yardımcı teknolojilerle kullanılabilirlik puanı (1-5)

- **Performans Algısı Metrikleri**:
  - Algılanan yanıt süresi (saniye)
  - Performans memnuniyeti puanı (1-5)
  - Bekleme süresi toleransı (saniye)

- **Kullanıcı Memnuniyeti Metrikleri**:
  - System Usability Scale (SUS) puanı (0-100)
  - Net Promoter Score (NPS) puanı (-100 ile +100 arası)
  - Özel memnuniyet puanları (1-5)

## Ekler

### Ek A: Test Katılımcı Profilleri

Test katılımcıları, aşağıdaki profillere göre seçilecektir:

- **Yeni Kullanıcılar**: Uygulamayı daha önce hiç kullanmamış kişiler
- **Orta Seviye Kullanıcılar**: Uygulamayı ara sıra kullanan kişiler
- **İleri Seviye Kullanıcılar**: Uygulamayı sık kullanan ve ileri düzey özelliklerini bilen kişiler
- **Erişilebilirlik İhtiyaçları Olan Kullanıcılar**: Görme, işitme, motor veya bilişsel engelleri olan kişiler

### Ek B: Test Ortamı Kurulum Talimatları

Test ortamının kurulumu için ayrıntılı talimatlar bu bölümde verilecektir.

### Ek C: Test Senaryoları Detayları

Test senaryolarının ayrıntılı adımları ve beklenen sonuçları bu bölümde verilecektir.

### Ek D: Anket Formları

Kullanıcı memnuniyeti anketleri ve diğer anket formları bu bölümde verilecektir.
