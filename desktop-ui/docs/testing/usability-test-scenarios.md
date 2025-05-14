# ALT_LAS Desktop UI Kullanılabilirlik Test Senaryoları

## İçindekiler

1. [Giriş](#giriş)
2. [Test Metodolojisi](#test-metodolojisi)
3. [Test Senaryoları](#test-senaryoları)
4. [Değerlendirme Kriterleri](#değerlendirme-kriterleri)
5. [Test Raporu Şablonu](#test-raporu-şablonu)

## Giriş

Bu belge, ALT_LAS Desktop UI uygulamasının kullanılabilirlik testleri için test senaryolarını içerir. Bu senaryolar, uygulamanın kullanılabilirliğini değerlendirmek için tasarlanmıştır.

### Belge Bilgileri

- **Belge Adı**: ALT_LAS Desktop UI Kullanılabilirlik Test Senaryoları
- **Versiyon**: 1.0
- **Tarih**: 15.05.2025
- **Hazırlayan**: İşçi 5
- **Onaylayan**: Yönetici

## Test Metodolojisi

Kullanılabilirlik testleri, aşağıdaki metodoloji kullanılarak gerçekleştirilecektir:

### Test Katılımcıları

- **Katılımcı Sayısı**: 5-8 kişi
- **Katılımcı Profilleri**:
  - Yeni Kullanıcılar (2-3 kişi)
  - Orta Seviye Kullanıcılar (2-3 kişi)
  - İleri Seviye Kullanıcılar (1-2 kişi)

### Test Süreci

1. **Ön Anket**: Katılımcıların demografik bilgileri ve teknoloji deneyimleri hakkında bilgi toplamak için bir ön anket uygulanır.
2. **Görev Tabanlı Testler**: Katılımcılara belirli görevler verilir ve bu görevleri tamamlamaları istenir.
3. **Düşünce Sesli Protokol**: Katılımcılardan uygulamayı kullanırken düşüncelerini sesli olarak ifade etmeleri istenir.
4. **Gözlem**: Test yöneticisi, katılımcıların davranışlarını, zorlandıkları noktaları ve hata yaptıkları yerleri gözlemler ve not alır.
5. **Son Anket**: Test sonrasında, katılımcıların deneyimleri hakkında geri bildirim almak için bir son anket uygulanır.
6. **Görüşme**: Test sonrasında, katılımcılarla kısa bir görüşme yapılarak daha derinlemesine geri bildirim alınır.

### Ölçümler

- **Görev Tamamlama Süresi**: Her görevin tamamlanması için geçen süre ölçülür.
- **Görev Tamamlama Oranı**: Katılımcıların görevleri başarıyla tamamlama oranı ölçülür.
- **Hata Sayısı**: Katılımcıların görevleri tamamlarken yaptıkları hata sayısı ölçülür.
- **Yardım İsteme Sayısı**: Katılımcıların görevleri tamamlarken yardım isteme sayısı ölçülür.
- **Kullanıcı Memnuniyeti**: Katılımcıların her görev sonrasında ve genel olarak uygulamadan memnuniyeti ölçülür.

## Test Senaryoları

### Senaryo 1: Uygulama Kurulumu ve İlk Çalıştırma

**Hedef**: Uygulamanın kurulumu ve ilk çalıştırma deneyimini değerlendirmek.

**Ön Koşullar**:
- Katılımcının bilgisayarında uygulama kurulu değil.
- Katılımcı, ALT_LAS hesabına sahip değil.

**Görevler**:

1. **Görev 1.1**: Uygulamayı indirin ve kurun.
   - **Beklenen Sonuç**: Katılımcı, uygulamayı başarıyla indirir ve kurar.
   - **Ölçümler**: İndirme ve kurulum süresi, karşılaşılan sorunlar.

2. **Görev 1.2**: Uygulamayı ilk kez çalıştırın ve yeni bir hesap oluşturun.
   - **Beklenen Sonuç**: Katılımcı, uygulamayı başlatır ve yeni bir hesap oluşturur.
   - **Ölçümler**: Hesap oluşturma süresi, form doldurma hataları.

3. **Görev 1.3**: E-posta doğrulama sürecini tamamlayın ve uygulamaya giriş yapın.
   - **Beklenen Sonuç**: Katılımcı, e-posta doğrulama sürecini tamamlar ve uygulamaya giriş yapar.
   - **Ölçümler**: Doğrulama ve giriş süresi, karşılaşılan sorunlar.

4. **Görev 1.4**: Uygulama arayüzünü keşfedin ve ana bileşenleri tanımlayın.
   - **Beklenen Sonuç**: Katılımcı, üst çubuk, kenar çubuğu, ana içerik alanı ve durum çubuğu gibi ana bileşenleri tanımlar.
   - **Ölçümler**: Keşif süresi, doğru tanımlanan bileşen sayısı.

### Senaryo 2: Dosya Yönetimi

**Hedef**: Dosya yönetimi özelliklerinin kullanılabilirliğini değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Katılımcının bilgisayarında test dosyaları mevcut.

**Görevler**:

1. **Görev 2.1**: Dosya yükleme arayüzünü bulun ve üç farklı dosya yükleyin.
   - **Beklenen Sonuç**: Katılımcı, dosya yükleme arayüzünü bulur ve dosyaları başarıyla yükler.
   - **Ölçümler**: Arayüzü bulma süresi, yükleme süresi, karşılaşılan sorunlar.

2. **Görev 2.2**: Yeni bir klasör oluşturun ve yüklediğiniz dosyaları bu klasöre taşıyın.
   - **Beklenen Sonuç**: Katılımcı, yeni bir klasör oluşturur ve dosyaları bu klasöre taşır.
   - **Ölçümler**: Klasör oluşturma süresi, dosya taşıma süresi, karşılaşılan sorunlar.

3. **Görev 2.3**: Dosyaları farklı kriterlere göre sıralayın ve filtreleme özelliğini kullanın.
   - **Beklenen Sonuç**: Katılımcı, dosyaları ad, boyut ve tarih gibi kriterlere göre sıralar ve filtreleme özelliğini kullanır.
   - **Ölçümler**: Sıralama ve filtreleme süresi, doğru sıralama ve filtreleme sayısı.

4. **Görev 2.4**: Bir dosyayı paylaşın ve paylaşım ayarlarını yapılandırın.
   - **Beklenen Sonuç**: Katılımcı, bir dosyayı paylaşır ve paylaşım ayarlarını yapılandırır.
   - **Ölçümler**: Paylaşım süresi, ayar yapılandırma süresi, karşılaşılan sorunlar.

### Senaryo 3: Proje Yönetimi

**Hedef**: Proje yönetimi özelliklerinin kullanılabilirliğini değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.

**Görevler**:

1. **Görev 3.1**: Yeni bir proje oluşturun ve proje detaylarını girin.
   - **Beklenen Sonuç**: Katılımcı, yeni bir proje oluşturur ve proje detaylarını girer.
   - **Ölçümler**: Proje oluşturma süresi, form doldurma hataları.

2. **Görev 3.2**: Projeye üç farklı görev ekleyin ve görev detaylarını girin.
   - **Beklenen Sonuç**: Katılımcı, projeye görevler ekler ve görev detaylarını girer.
   - **Ölçümler**: Görev ekleme süresi, form doldurma hataları.

3. **Görev 3.3**: Görev tahtasını kullanarak görevlerin durumlarını değiştirin.
   - **Beklenen Sonuç**: Katılımcı, görev tahtasını kullanarak görevlerin durumlarını değiştirir.
   - **Ölçümler**: Durum değiştirme süresi, doğru durum değişikliği sayısı.

4. **Görev 3.4**: Bir görev için zaman takibi yapın ve harcanan zamanı kaydedin.
   - **Beklenen Sonuç**: Katılımcı, bir görev için zaman takibi yapar ve harcanan zamanı kaydeder.
   - **Ölçümler**: Zaman takibi başlatma ve durdurma süresi, kaydetme süresi.

### Senaryo 4: Raporlama

**Hedef**: Raporlama özelliklerinin kullanılabilirliğini değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Katılımcının en az bir projesi ve birkaç görevi mevcut.

**Görevler**:

1. **Görev 4.1**: Raporlama arayüzünü bulun ve yeni bir rapor oluşturun.
   - **Beklenen Sonuç**: Katılımcı, raporlama arayüzünü bulur ve yeni bir rapor oluşturur.
   - **Ölçümler**: Arayüzü bulma süresi, rapor oluşturma süresi.

2. **Görev 4.2**: Proje ilerleme raporu oluşturun ve rapor parametrelerini ayarlayın.
   - **Beklenen Sonuç**: Katılımcı, proje ilerleme raporu oluşturur ve rapor parametrelerini ayarlar.
   - **Ölçümler**: Rapor oluşturma süresi, parametre ayarlama süresi.

3. **Görev 4.3**: Raporu görüntüleyin ve farklı formatlarda dışa aktarın.
   - **Beklenen Sonuç**: Katılımcı, raporu görüntüler ve PDF, Excel ve CSV formatlarında dışa aktarır.
   - **Ölçümler**: Görüntüleme süresi, dışa aktarma süresi, karşılaşılan sorunlar.

4. **Görev 4.4**: Özel bir rapor şablonu oluşturun ve kaydedin.
   - **Beklenen Sonuç**: Katılımcı, özel bir rapor şablonu oluşturur ve kaydeder.
   - **Ölçümler**: Şablon oluşturma süresi, kaydetme süresi, karşılaşılan sorunlar.

### Senaryo 5: Ayarlar ve Özelleştirme

**Hedef**: Ayarlar ve özelleştirme özelliklerinin kullanılabilirliğini değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.

**Görevler**:

1. **Görev 5.1**: Ayarlar menüsünü bulun ve genel ayarları değiştirin.
   - **Beklenen Sonuç**: Katılımcı, ayarlar menüsünü bulur ve dil, tema gibi genel ayarları değiştirir.
   - **Ölçümler**: Menüyü bulma süresi, ayar değiştirme süresi.

2. **Görev 5.2**: Görünüm ayarlarını değiştirin ve arayüzü özelleştirin.
   - **Beklenen Sonuç**: Katılımcı, görünüm ayarlarını değiştirir ve arayüzü özelleştirir.
   - **Ölçümler**: Ayar değiştirme süresi, özelleştirme süresi.

3. **Görev 5.3**: Senkronizasyon ayarlarını yapılandırın.
   - **Beklenen Sonuç**: Katılımcı, senkronizasyon sıklığı ve kapsamı gibi senkronizasyon ayarlarını yapılandırır.
   - **Ölçümler**: Ayar yapılandırma süresi, karşılaşılan sorunlar.

4. **Görev 5.4**: Bildirim ayarlarını yapılandırın.
   - **Beklenen Sonuç**: Katılımcı, bildirim türleri ve sıklığı gibi bildirim ayarlarını yapılandırır.
   - **Ölçümler**: Ayar yapılandırma süresi, karşılaşılan sorunlar.

### Senaryo 6: Çevrimdışı Mod

**Hedef**: Çevrimdışı mod özelliklerinin kullanılabilirliğini değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- İnternet bağlantısı mevcut.

**Görevler**:

1. **Görev 6.1**: Çevrimdışı modu etkinleştirin.
   - **Beklenen Sonuç**: Katılımcı, çevrimdışı modu etkinleştirir.
   - **Ölçümler**: Etkinleştirme süresi, karşılaşılan sorunlar.

2. **Görev 6.2**: İnternet bağlantısını kesin ve çevrimdışı modda dosya oluşturun.
   - **Beklenen Sonuç**: Katılımcı, çevrimdışı modda dosya oluşturur.
   - **Ölçümler**: Dosya oluşturma süresi, karşılaşılan sorunlar.

3. **Görev 6.3**: Çevrimdışı modda bir projeye görev ekleyin.
   - **Beklenen Sonuç**: Katılımcı, çevrimdışı modda bir projeye görev ekler.
   - **Ölçümler**: Görev ekleme süresi, karşılaşılan sorunlar.

4. **Görev 6.4**: İnternet bağlantısını yeniden kurun ve verileri senkronize edin.
   - **Beklenen Sonuç**: Katılımcı, internet bağlantısını yeniden kurar ve verileri senkronize eder.
   - **Ölçümler**: Senkronizasyon süresi, karşılaşılan sorunlar.

## Değerlendirme Kriterleri

Kullanılabilirlik testleri, aşağıdaki kriterlere göre değerlendirilecektir:

### Etkinlik

- **Görev Tamamlama Oranı**: Katılımcıların görevleri başarıyla tamamlama oranı.
  - **Mükemmel**: %90-100
  - **İyi**: %80-89
  - **Orta**: %70-79
  - **Zayıf**: %70'in altı

- **Hata Sayısı**: Katılımcıların görevleri tamamlarken yaptıkları hata sayısı.
  - **Mükemmel**: 0-1 hata
  - **İyi**: 2-3 hata
  - **Orta**: 4-5 hata
  - **Zayıf**: 5'ten fazla hata

### Verimlilik

- **Görev Tamamlama Süresi**: Katılımcıların görevleri tamamlaması için geçen süre.
  - **Mükemmel**: Beklenen sürenin %80'i veya daha azı
  - **İyi**: Beklenen sürenin %81-100'ü
  - **Orta**: Beklenen sürenin %101-120'si
  - **Zayıf**: Beklenen sürenin %120'sinden fazla

- **Yardım İsteme Sayısı**: Katılımcıların görevleri tamamlarken yardım isteme sayısı.
  - **Mükemmel**: 0 yardım
  - **İyi**: 1 yardım
  - **Orta**: 2 yardım
  - **Zayıf**: 2'den fazla yardım

### Memnuniyet

- **Kullanıcı Memnuniyeti**: Katılımcıların her görev sonrasında ve genel olarak uygulamadan memnuniyeti (1-5 ölçeği).
  - **Mükemmel**: 4.5-5.0
  - **İyi**: 4.0-4.4
  - **Orta**: 3.5-3.9
  - **Zayıf**: 3.5'in altı

- **System Usability Scale (SUS) Puanı**: Katılımcıların uygulamanın kullanılabilirliğine ilişkin genel değerlendirmesi (0-100 ölçeği).
  - **Mükemmel**: 85-100
  - **İyi**: 70-84
  - **Orta**: 50-69
  - **Zayıf**: 50'nin altı

## Test Raporu Şablonu

Kullanılabilirlik testlerinin sonuçları, aşağıdaki şablona göre raporlanacaktır:

### 1. Yönetici Özeti

- Test hedefleri
- Katılımcı profilleri
- Temel bulgular
- Öneriler

### 2. Test Metodolojisi

- Kullanılan metodolojiler
- Test katılımcıları
- Test ortamı
- Test senaryoları

### 3. Test Sonuçları

#### 3.1. Senaryo 1: Uygulama Kurulumu ve İlk Çalıştırma

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Hata sayısı
- Yardım isteme sayısı
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.2. Senaryo 2: Dosya Yönetimi

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Hata sayısı
- Yardım isteme sayısı
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.3. Senaryo 3: Proje Yönetimi

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Hata sayısı
- Yardım isteme sayısı
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.4. Senaryo 4: Raporlama

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Hata sayısı
- Yardım isteme sayısı
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.5. Senaryo 5: Ayarlar ve Özelleştirme

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Hata sayısı
- Yardım isteme sayısı
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.6. Senaryo 6: Çevrimdışı Mod

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Hata sayısı
- Yardım isteme sayısı
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

### 4. Bulgular ve Sorunlar

- Tespit edilen sorunlar
- Sorunların şiddeti ve önceliği
- Sorunların etkilediği kullanıcı grupları

### 5. Öneriler

- Kullanılabilirlik iyileştirmeleri
- Arayüz iyileştirmeleri
- İş akışı iyileştirmeleri
- Dokümantasyon iyileştirmeleri

### 6. Ekler

- Test senaryoları
- Test verileri
- Ekran görüntüleri ve videolar
- Anket formları
