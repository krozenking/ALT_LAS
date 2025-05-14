# ALT_LAS Desktop UI Erişilebilirlik Test Senaryoları

## İçindekiler

1. [Giriş](#giriş)
2. [Test Metodolojisi](#test-metodolojisi)
3. [Test Senaryoları](#test-senaryoları)
4. [Değerlendirme Kriterleri](#değerlendirme-kriterleri)
5. [Test Raporu Şablonu](#test-raporu-şablonu)

## Giriş

Bu belge, ALT_LAS Desktop UI uygulamasının erişilebilirlik testleri için test senaryolarını içerir. Bu senaryolar, uygulamanın farklı yeteneklere sahip kullanıcılar tarafından ne kadar erişilebilir olduğunu değerlendirmek için tasarlanmıştır.

### Belge Bilgileri

- **Belge Adı**: ALT_LAS Desktop UI Erişilebilirlik Test Senaryoları
- **Versiyon**: 1.0
- **Tarih**: 15.05.2025
- **Hazırlayan**: İşçi 5
- **Onaylayan**: Yönetici

## Test Metodolojisi

Erişilebilirlik testleri, aşağıdaki metodoloji kullanılarak gerçekleştirilecektir:

### Test Katılımcıları

- **Katılımcı Sayısı**: 5-8 kişi
- **Katılımcı Profilleri**:
  - Görme Engelli Kullanıcılar (1-2 kişi)
  - İşitme Engelli Kullanıcılar (1-2 kişi)
  - Motor Engelli Kullanıcılar (1-2 kişi)
  - Bilişsel Engelli Kullanıcılar (1-2 kişi)
  - Erişilebilirlik Uzmanları (1-2 kişi)

### Test Süreci

1. **Otomatik Erişilebilirlik Kontrolleri**: WCAG (Web Content Accessibility Guidelines) uyumluluğunu kontrol etmek için otomatik araçlar kullanılır.
2. **Manuel Erişilebilirlik Kontrolleri**: Erişilebilirlik uzmanları tarafından manuel kontroller yapılır.
3. **Yardımcı Teknoloji Testleri**: Ekran okuyucular, büyüteçler, klavye navigasyonu gibi yardımcı teknolojilerle testler yapılır.
4. **Kullanıcı Testleri**: Farklı engellere sahip kullanıcılarla testler yapılır.
5. **Gözlem**: Test yöneticisi, katılımcıların davranışlarını, zorlandıkları noktaları ve hata yaptıkları yerleri gözlemler ve not alır.
6. **Son Anket**: Test sonrasında, katılımcıların deneyimleri hakkında geri bildirim almak için bir son anket uygulanır.
7. **Görüşme**: Test sonrasında, katılımcılarla kısa bir görüşme yapılarak daha derinlemesine geri bildirim alınır.

### Ölçümler

- **WCAG Uyumluluk Seviyesi**: Uygulamanın WCAG 2.1 standartlarına uyumluluk seviyesi (A, AA, AAA).
- **Erişilebilirlik Sorunlarının Sayısı ve Şiddeti**: Tespit edilen erişilebilirlik sorunlarının sayısı ve şiddeti.
- **Görev Tamamlama Oranı**: Katılımcıların görevleri başarıyla tamamlama oranı.
- **Görev Tamamlama Süresi**: Her görevin tamamlanması için geçen süre.
- **Yardımcı Teknolojilerle Kullanılabilirlik Puanı**: Yardımcı teknolojilerle uygulamanın ne kadar kullanılabilir olduğuna dair puan (1-5).
- **Kullanıcı Memnuniyeti**: Katılımcıların her görev sonrasında ve genel olarak uygulamadan memnuniyeti.

## Test Senaryoları

### Senaryo 1: Klavye Erişilebilirliği

**Hedef**: Uygulamanın klavye ile ne kadar erişilebilir olduğunu değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Fare kullanımı yasak.

**Görevler**:

1. **Görev 1.1**: Klavye ile ana menü öğeleri arasında gezinin.
   - **Beklenen Sonuç**: Katılımcı, Tab, Shift+Tab ve ok tuşlarını kullanarak ana menü öğeleri arasında gezinebilir.
   - **Ölçümler**: Gezinme süresi, karşılaşılan sorunlar.

2. **Görev 1.2**: Klavye ile bir dosya yükleyin.
   - **Beklenen Sonuç**: Katılımcı, klavye kısayollarını ve Tab tuşunu kullanarak dosya yükleme işlemini gerçekleştirebilir.
   - **Ölçümler**: Yükleme süresi, karşılaşılan sorunlar.

3. **Görev 1.3**: Klavye ile bir proje oluşturun ve görev ekleyin.
   - **Beklenen Sonuç**: Katılımcı, klavye kısayollarını ve Tab tuşunu kullanarak proje oluşturma ve görev ekleme işlemlerini gerçekleştirebilir.
   - **Ölçümler**: Proje oluşturma ve görev ekleme süresi, karşılaşılan sorunlar.

4. **Görev 1.4**: Klavye ile bir modal pencereyi kapatın.
   - **Beklenen Sonuç**: Katılımcı, Escape tuşunu veya Tab tuşunu kullanarak modal pencereyi kapatabilir.
   - **Ölçümler**: Kapatma süresi, karşılaşılan sorunlar.

### Senaryo 2: Ekran Okuyucu Uyumluluğu

**Hedef**: Uygulamanın ekran okuyucularla ne kadar uyumlu olduğunu değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Ekran okuyucu (NVDA, JAWS, VoiceOver, vb.) etkinleştirilmiş.

**Görevler**:

1. **Görev 2.1**: Ekran okuyucu ile ana menü öğelerini keşfedin.
   - **Beklenen Sonuç**: Ekran okuyucu, ana menü öğelerini doğru bir şekilde okur ve katılımcı menü yapısını anlayabilir.
   - **Ölçümler**: Keşif süresi, doğru okunan öğe sayısı.

2. **Görev 2.2**: Ekran okuyucu ile bir form doldurun.
   - **Beklenen Sonuç**: Ekran okuyucu, form alanlarını ve etiketlerini doğru bir şekilde okur ve katılımcı formu doldurabilir.
   - **Ölçümler**: Form doldurma süresi, karşılaşılan sorunlar.

3. **Görev 2.3**: Ekran okuyucu ile bir tablo içeriğini keşfedin.
   - **Beklenen Sonuç**: Ekran okuyucu, tablo başlıklarını ve hücrelerini doğru bir şekilde okur ve katılımcı tablo yapısını anlayabilir.
   - **Ölçümler**: Keşif süresi, doğru okunan hücre sayısı.

4. **Görev 2.4**: Ekran okuyucu ile bir hata mesajını algılayın.
   - **Beklenen Sonuç**: Ekran okuyucu, hata mesajını otomatik olarak okur ve katılımcı hatayı anlayabilir.
   - **Ölçümler**: Algılama süresi, hata mesajının anlaşılabilirliği.

### Senaryo 3: Renk Kontrastı ve Görsel Erişilebilirlik

**Hedef**: Uygulamanın renk kontrastı ve görsel erişilebilirliğini değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Renk körlüğü simülasyonu veya düşük kontrast modu etkinleştirilmiş.

**Görevler**:

1. **Görev 3.1**: Farklı renk temalarını keşfedin ve değiştirin.
   - **Beklenen Sonuç**: Katılımcı, farklı renk temalarını keşfedebilir ve değiştirebilir.
   - **Ölçümler**: Keşif ve değiştirme süresi, karşılaşılan sorunlar.

2. **Görev 3.2**: Yüksek kontrastlı temayı etkinleştirin.
   - **Beklenen Sonuç**: Katılımcı, yüksek kontrastlı temayı etkinleştirebilir.
   - **Ölçümler**: Etkinleştirme süresi, karşılaşılan sorunlar.

3. **Görev 3.3**: Metin boyutunu artırın.
   - **Beklenen Sonuç**: Katılımcı, metin boyutunu artırabilir ve arayüz buna uyum sağlar.
   - **Ölçümler**: Artırma süresi, arayüz uyumu.

4. **Görev 3.4**: Simgeleri ve düğmeleri tanımlayın.
   - **Beklenen Sonuç**: Katılımcı, simgeleri ve düğmeleri renk olmadan tanımlayabilir.
   - **Ölçümler**: Tanımlama süresi, doğru tanımlanan öğe sayısı.

### Senaryo 4: Motor Engelli Kullanıcılar İçin Erişilebilirlik

**Hedef**: Uygulamanın motor engelli kullanıcılar için ne kadar erişilebilir olduğunu değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Motor engelli kullanıcılar için yardımcı teknolojiler (switch kontrol, göz izleme, vb.) etkinleştirilmiş.

**Görevler**:

1. **Görev 4.1**: Büyük hedef alanları olan düğmeleri ve kontrolleri kullanın.
   - **Beklenen Sonuç**: Katılımcı, büyük hedef alanları olan düğmeleri ve kontrolleri kolayca kullanabilir.
   - **Ölçümler**: Kullanım süresi, karşılaşılan sorunlar.

2. **Görev 4.2**: Sürükle-bırak işlemlerini alternatif yöntemlerle gerçekleştirin.
   - **Beklenen Sonuç**: Katılımcı, sürükle-bırak işlemlerini alternatif yöntemlerle (menüler, kısayollar, vb.) gerçekleştirebilir.
   - **Ölçümler**: İşlem süresi, karşılaşılan sorunlar.

3. **Görev 4.3**: Form alanlarını doldururken otomatik tamamlama özelliğini kullanın.
   - **Beklenen Sonuç**: Katılımcı, form alanlarını doldururken otomatik tamamlama özelliğinden yararlanabilir.
   - **Ölçümler**: Form doldurma süresi, otomatik tamamlama kullanım sayısı.

4. **Görev 4.4**: Zamanlı işlemleri gerçekleştirin ve zaman aşımı süresini uzatın.
   - **Beklenen Sonuç**: Katılımcı, zamanlı işlemleri gerçekleştirebilir ve gerektiğinde zaman aşımı süresini uzatabilir.
   - **Ölçümler**: İşlem süresi, zaman aşımı uzatma sayısı.

### Senaryo 5: Bilişsel Engelli Kullanıcılar İçin Erişilebilirlik

**Hedef**: Uygulamanın bilişsel engelli kullanıcılar için ne kadar erişilebilir olduğunu değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.

**Görevler**:

1. **Görev 5.1**: Basit ve tutarlı navigasyon yapısını kullanın.
   - **Beklenen Sonuç**: Katılımcı, basit ve tutarlı navigasyon yapısını anlayabilir ve kullanabilir.
   - **Ölçümler**: Navigasyon süresi, karşılaşılan sorunlar.

2. **Görev 5.2**: Adım adım talimatları takip edin.
   - **Beklenen Sonuç**: Katılımcı, adım adım talimatları takip edebilir ve görevleri tamamlayabilir.
   - **Ölçümler**: Talimat takip süresi, doğru tamamlanan adım sayısı.

3. **Görev 5.3**: Hata mesajlarını anlayın ve düzeltin.
   - **Beklenen Sonuç**: Katılımcı, hata mesajlarını anlayabilir ve hataları düzeltebilir.
   - **Ölçümler**: Anlama ve düzeltme süresi, doğru düzeltilen hata sayısı.

4. **Görev 5.4**: Yardım ve ipucu özelliklerini kullanın.
   - **Beklenen Sonuç**: Katılımcı, yardım ve ipucu özelliklerini bulabilir ve kullanabilir.
   - **Ölçümler**: Bulma ve kullanma süresi, yardım kullanım sayısı.

### Senaryo 6: ARIA (Accessible Rich Internet Applications) Öznitelikleri

**Hedef**: Uygulamanın ARIA özniteliklerini ne kadar doğru kullandığını değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Ekran okuyucu etkinleştirilmiş.

**Görevler**:

1. **Görev 6.1**: Dinamik içeriği olan bileşenleri keşfedin.
   - **Beklenen Sonuç**: Ekran okuyucu, dinamik içeriği olan bileşenleri doğru bir şekilde okur ve katılımcı içerik değişikliklerini algılayabilir.
   - **Ölçümler**: Keşif süresi, algılanan değişiklik sayısı.

2. **Görev 6.2**: Özel kontrolleri (custom controls) kullanın.
   - **Beklenen Sonuç**: Ekran okuyucu, özel kontrolleri doğru bir şekilde tanımlar ve katılımcı bu kontrolleri kullanabilir.
   - **Ölçümler**: Kullanım süresi, doğru tanımlanan kontrol sayısı.

3. **Görev 6.3**: Modal pencereleri ve diyalogları kullanın.
   - **Beklenen Sonuç**: Ekran okuyucu, modal pencereleri ve diyalogları doğru bir şekilde tanımlar ve katılımcı bu bileşenleri kullanabilir.
   - **Ölçümler**: Kullanım süresi, doğru tanımlanan bileşen sayısı.

4. **Görev 6.4**: Bildirim ve uyarıları algılayın.
   - **Beklenen Sonuç**: Ekran okuyucu, bildirimleri ve uyarıları otomatik olarak okur ve katılımcı bu bildirimleri algılayabilir.
   - **Ölçümler**: Algılama süresi, doğru algılanan bildirim sayısı.

## Değerlendirme Kriterleri

Erişilebilirlik testleri, aşağıdaki kriterlere göre değerlendirilecektir:

### WCAG Uyumluluk Seviyesi

- **AAA**: Tüm WCAG 2.1 AAA kriterlerini karşılar.
- **AA**: Tüm WCAG 2.1 AA kriterlerini karşılar.
- **A**: Tüm WCAG 2.1 A kriterlerini karşılar.
- **Uyumsuz**: WCAG 2.1 A kriterlerini bile karşılamaz.

### Erişilebilirlik Sorunlarının Şiddeti

- **Kritik**: Kullanıcının uygulamayı kullanmasını tamamen engelleyen sorunlar.
- **Önemli**: Kullanıcının uygulamayı kullanmasını önemli ölçüde zorlaştıran sorunlar.
- **Orta**: Kullanıcının uygulamayı kullanmasını biraz zorlaştıran sorunlar.
- **Düşük**: Kullanıcının uygulamayı kullanmasını çok az etkileyen sorunlar.

### Görev Tamamlama Oranı

- **Mükemmel**: %90-100
- **İyi**: %80-89
- **Orta**: %70-79
- **Zayıf**: %70'in altı

### Yardımcı Teknolojilerle Kullanılabilirlik Puanı

- **Mükemmel**: 4.5-5.0
- **İyi**: 4.0-4.4
- **Orta**: 3.5-3.9
- **Zayıf**: 3.5'in altı

### Kullanıcı Memnuniyeti

- **Mükemmel**: 4.5-5.0
- **İyi**: 4.0-4.4
- **Orta**: 3.5-3.9
- **Zayıf**: 3.5'in altı

## Test Raporu Şablonu

Erişilebilirlik testlerinin sonuçları, aşağıdaki şablona göre raporlanacaktır:

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

#### 3.1. Otomatik Erişilebilirlik Kontrolleri

- WCAG uyumluluk seviyesi
- Tespit edilen sorunların sayısı ve şiddeti
- Sorunların kategorilere göre dağılımı

#### 3.2. Manuel Erişilebilirlik Kontrolleri

- WCAG uyumluluk seviyesi
- Tespit edilen sorunların sayısı ve şiddeti
- Sorunların kategorilere göre dağılımı

#### 3.3. Senaryo 1: Klavye Erişilebilirliği

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Karşılaşılan sorunlar
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.4. Senaryo 2: Ekran Okuyucu Uyumluluğu

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Karşılaşılan sorunlar
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.5. Senaryo 3: Renk Kontrastı ve Görsel Erişilebilirlik

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Karşılaşılan sorunlar
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.6. Senaryo 4: Motor Engelli Kullanıcılar İçin Erişilebilirlik

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Karşılaşılan sorunlar
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.7. Senaryo 5: Bilişsel Engelli Kullanıcılar İçin Erişilebilirlik

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Karşılaşılan sorunlar
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

#### 3.8. Senaryo 6: ARIA Öznitelikleri

- Görev tamamlama oranı
- Ortalama görev tamamlama süresi
- Karşılaşılan sorunlar
- Kullanıcı memnuniyeti
- Gözlemler ve yorumlar

### 4. Bulgular ve Sorunlar

- Tespit edilen sorunlar
- Sorunların şiddeti ve önceliği
- Sorunların etkilediği kullanıcı grupları

### 5. Öneriler

- Klavye erişilebilirliği iyileştirmeleri
- Ekran okuyucu uyumluluğu iyileştirmeleri
- Renk kontrastı ve görsel erişilebilirlik iyileştirmeleri
- Motor engelli kullanıcılar için erişilebilirlik iyileştirmeleri
- Bilişsel engelli kullanıcılar için erişilebilirlik iyileştirmeleri
- ARIA öznitelikleri iyileştirmeleri

### 6. Ekler

- Test senaryoları
- Test verileri
- Ekran görüntüleri ve videolar
- Anket formları
