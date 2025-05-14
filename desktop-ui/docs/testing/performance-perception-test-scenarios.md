# ALT_LAS Desktop UI Performans Algısı Test Senaryoları

## İçindekiler

1. [Giriş](#giriş)
2. [Test Metodolojisi](#test-metodolojisi)
3. [Test Senaryoları](#test-senaryoları)
4. [Değerlendirme Kriterleri](#değerlendirme-kriterleri)
5. [Test Raporu Şablonu](#test-raporu-şablonu)

## Giriş

Bu belge, ALT_LAS Desktop UI uygulamasının performans algısı testleri için test senaryolarını içerir. Bu senaryolar, kullanıcıların uygulamanın performansını nasıl algıladığını değerlendirmek için tasarlanmıştır.

### Belge Bilgileri

- **Belge Adı**: ALT_LAS Desktop UI Performans Algısı Test Senaryoları
- **Versiyon**: 1.0
- **Tarih**: 15.05.2025
- **Hazırlayan**: İşçi 5
- **Onaylayan**: Yönetici

## Test Metodolojisi

Performans algısı testleri, aşağıdaki metodoloji kullanılarak gerçekleştirilecektir:

### Test Katılımcıları

- **Katılımcı Sayısı**: 10-15 kişi
- **Katılımcı Profilleri**:
  - Yeni Kullanıcılar (3-5 kişi)
  - Orta Seviye Kullanıcılar (3-5 kişi)
  - İleri Seviye Kullanıcılar (3-5 kişi)

### Test Süreci

1. **Ön Anket**: Katılımcıların demografik bilgileri, teknoloji deneyimleri ve performans beklentileri hakkında bilgi toplamak için bir ön anket uygulanır.
2. **Görev Tabanlı Testler**: Katılımcılara belirli görevler verilir ve bu görevleri tamamlamaları istenir.
3. **Subjektif Değerlendirme**: Katılımcılardan her görev sonrasında uygulamanın performansını değerlendirmeleri istenir.
4. **Algılanan Performans Ölçümleri**: Katılımcılardan belirli işlemlerin ne kadar sürdüğünü tahmin etmeleri istenir ve gerçek sürelerle karşılaştırılır.
5. **Gözlem**: Test yöneticisi, katılımcıların davranışlarını, tepkilerini ve yorumlarını gözlemler ve not alır.
6. **Son Anket**: Test sonrasında, katılımcıların genel performans algıları hakkında geri bildirim almak için bir son anket uygulanır.
7. **Görüşme**: Test sonrasında, katılımcılarla kısa bir görüşme yapılarak daha derinlemesine geri bildirim alınır.

### Ölçümler

- **Algılanan Yanıt Süresi**: Katılımcıların belirli işlemlerin ne kadar sürdüğünü tahmin etmeleri.
- **Gerçek Yanıt Süresi**: Belirli işlemlerin gerçekte ne kadar sürdüğü.
- **Algı-Gerçek Farkı**: Algılanan ve gerçek yanıt süreleri arasındaki fark.
- **Performans Memnuniyeti Puanı**: Katılımcıların uygulamanın performansından memnuniyeti (1-5 ölçeği).
- **Bekleme Süresi Toleransı**: Katılımcıların belirli işlemler için kabul edilebilir buldukları maksimum bekleme süresi.
- **Performans Algısı Endeksi**: Algılanan performans, memnuniyet ve tolerans ölçümlerinden hesaplanan bileşik bir endeks.

## Test Senaryoları

### Senaryo 1: Uygulama Başlatma ve Giriş

**Hedef**: Uygulamanın başlatma ve giriş sürecinin performans algısını değerlendirmek.

**Ön Koşullar**:
- Katılımcının bilgisayarında uygulama kurulu.
- Katılımcı, ALT_LAS hesabına sahip.

**Görevler**:

1. **Görev 1.1**: Uygulamayı başlatın ve giriş yapın.
   - **Beklenen Sonuç**: Katılımcı, uygulamayı başlatır ve giriş yapar.
   - **Ölçümler**:
     - Algılanan başlatma süresi
     - Gerçek başlatma süresi
     - Algılanan giriş süresi
     - Gerçek giriş süresi
     - Performans memnuniyeti puanı (1-5)

2. **Görev 1.2**: Uygulamayı kapatın ve yeniden başlatın.
   - **Beklenen Sonuç**: Katılımcı, uygulamayı kapatır ve yeniden başlatır.
   - **Ölçümler**:
     - Algılanan kapatma süresi
     - Gerçek kapatma süresi
     - Algılanan yeniden başlatma süresi
     - Gerçek yeniden başlatma süresi
     - Performans memnuniyeti puanı (1-5)

3. **Görev 1.3**: Uygulamayı minimize edip geri getirin.
   - **Beklenen Sonuç**: Katılımcı, uygulamayı minimize eder ve geri getirir.
   - **Ölçümler**:
     - Algılanan minimize etme süresi
     - Gerçek minimize etme süresi
     - Algılanan geri getirme süresi
     - Gerçek geri getirme süresi
     - Performans memnuniyeti puanı (1-5)

### Senaryo 2: Dosya İşlemleri

**Hedef**: Dosya işlemlerinin performans algısını değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Katılımcının bilgisayarında test dosyaları mevcut.

**Görevler**:

1. **Görev 2.1**: Küçük bir dosya yükleyin (1 MB).
   - **Beklenen Sonuç**: Katılımcı, küçük bir dosyayı başarıyla yükler.
   - **Ölçümler**:
     - Algılanan yükleme süresi
     - Gerçek yükleme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

2. **Görev 2.2**: Büyük bir dosya yükleyin (100 MB).
   - **Beklenen Sonuç**: Katılımcı, büyük bir dosyayı başarıyla yükler.
   - **Ölçümler**:
     - Algılanan yükleme süresi
     - Gerçek yükleme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

3. **Görev 2.3**: Çok sayıda dosya yükleyin (50 dosya, toplam 50 MB).
   - **Beklenen Sonuç**: Katılımcı, çok sayıda dosyayı başarıyla yükler.
   - **Ölçümler**:
     - Algılanan yükleme süresi
     - Gerçek yükleme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

4. **Görev 2.4**: Büyük bir dosyayı indirin (100 MB).
   - **Beklenen Sonuç**: Katılımcı, büyük bir dosyayı başarıyla indirir.
   - **Ölçümler**:
     - Algılanan indirme süresi
     - Gerçek indirme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

### Senaryo 3: Arayüz Yanıt Süresi

**Hedef**: Arayüz yanıt süresinin performans algısını değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.

**Görevler**:

1. **Görev 3.1**: Ana menü öğeleri arasında gezinin.
   - **Beklenen Sonuç**: Katılımcı, ana menü öğeleri arasında gezinir.
   - **Ölçümler**:
     - Algılanan gezinme süresi
     - Gerçek gezinme süresi
     - Performans memnuniyeti puanı (1-5)

2. **Görev 3.2**: Bir modal pencere açın ve kapatın.
   - **Beklenen Sonuç**: Katılımcı, bir modal pencere açar ve kapatır.
   - **Ölçümler**:
     - Algılanan açma süresi
     - Gerçek açma süresi
     - Algılanan kapatma süresi
     - Gerçek kapatma süresi
     - Performans memnuniyeti puanı (1-5)

3. **Görev 3.3**: Bir form doldurun ve gönderin.
   - **Beklenen Sonuç**: Katılımcı, bir form doldurur ve gönderir.
   - **Ölçümler**:
     - Algılanan form yanıt süresi
     - Gerçek form yanıt süresi
     - Algılanan gönderme süresi
     - Gerçek gönderme süresi
     - Performans memnuniyeti puanı (1-5)

4. **Görev 3.4**: Bir tabloda sıralama ve filtreleme yapın.
   - **Beklenen Sonuç**: Katılımcı, bir tabloda sıralama ve filtreleme yapar.
   - **Ölçümler**:
     - Algılanan sıralama süresi
     - Gerçek sıralama süresi
     - Algılanan filtreleme süresi
     - Gerçek filtreleme süresi
     - Performans memnuniyeti puanı (1-5)

### Senaryo 4: Veri Yükleme ve İşleme

**Hedef**: Veri yükleme ve işleme süreçlerinin performans algısını değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Katılımcının en az bir projesi ve birkaç görevi mevcut.

**Görevler**:

1. **Görev 4.1**: Gösterge panelini yükleyin.
   - **Beklenen Sonuç**: Katılımcı, gösterge panelini yükler.
   - **Ölçümler**:
     - Algılanan yükleme süresi
     - Gerçek yükleme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

2. **Görev 4.2**: Büyük bir proje listesini yükleyin (100+ proje).
   - **Beklenen Sonuç**: Katılımcı, büyük bir proje listesini yükler.
   - **Ölçümler**:
     - Algılanan yükleme süresi
     - Gerçek yükleme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

3. **Görev 4.3**: Karmaşık bir rapor oluşturun ve görüntüleyin.
   - **Beklenen Sonuç**: Katılımcı, karmaşık bir rapor oluşturur ve görüntüler.
   - **Ölçümler**:
     - Algılanan oluşturma süresi
     - Gerçek oluşturma süresi
     - Algılanan görüntüleme süresi
     - Gerçek görüntüleme süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

4. **Görev 4.4**: Büyük bir veri setini dışa aktarın.
   - **Beklenen Sonuç**: Katılımcı, büyük bir veri setini dışa aktarır.
   - **Ölçümler**:
     - Algılanan dışa aktarma süresi
     - Gerçek dışa aktarma süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

### Senaryo 5: Çevrimdışı ve Senkronizasyon

**Hedef**: Çevrimdışı çalışma ve senkronizasyon süreçlerinin performans algısını değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- İnternet bağlantısı mevcut.

**Görevler**:

1. **Görev 5.1**: Çevrimdışı moda geçin.
   - **Beklenen Sonuç**: Katılımcı, çevrimdışı moda geçer.
   - **Ölçümler**:
     - Algılanan geçiş süresi
     - Gerçek geçiş süresi
     - Performans memnuniyeti puanı (1-5)

2. **Görev 5.2**: Çevrimdışı modda dosya oluşturun ve düzenleyin.
   - **Beklenen Sonuç**: Katılımcı, çevrimdışı modda dosya oluşturur ve düzenler.
   - **Ölçümler**:
     - Algılanan oluşturma süresi
     - Gerçek oluşturma süresi
     - Algılanan düzenleme süresi
     - Gerçek düzenleme süresi
     - Performans memnuniyeti puanı (1-5)

3. **Görev 5.3**: Çevrimiçi moda geçin ve verileri senkronize edin.
   - **Beklenen Sonuç**: Katılımcı, çevrimiçi moda geçer ve verileri senkronize eder.
   - **Ölçümler**:
     - Algılanan geçiş süresi
     - Gerçek geçiş süresi
     - Algılanan senkronizasyon süresi
     - Gerçek senkronizasyon süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

4. **Görev 5.4**: Büyük bir veri setini senkronize edin.
   - **Beklenen Sonuç**: Katılımcı, büyük bir veri setini senkronize eder.
   - **Ölçümler**:
     - Algılanan senkronizasyon süresi
     - Gerçek senkronizasyon süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

### Senaryo 6: Yüksek Yük Altında Performans

**Hedef**: Yüksek yük altında uygulamanın performans algısını değerlendirmek.

**Ön Koşullar**:
- Katılımcı, uygulamaya giriş yapmış durumda.
- Uygulamada çok sayıda dosya, proje ve görev mevcut.

**Görevler**:

1. **Görev 6.1**: Çok sayıda sekme ve panel açın.
   - **Beklenen Sonuç**: Katılımcı, çok sayıda sekme ve panel açar.
   - **Ölçümler**:
     - Algılanan yanıt süresi
     - Gerçek yanıt süresi
     - Performans memnuniyeti puanı (1-5)

2. **Görev 6.2**: Büyük bir dosyayı düzenlerken başka bir dosyayı açın.
   - **Beklenen Sonuç**: Katılımcı, büyük bir dosyayı düzenlerken başka bir dosyayı açar.
   - **Ölçümler**:
     - Algılanan yanıt süresi
     - Gerçek yanıt süresi
     - Performans memnuniyeti puanı (1-5)

3. **Görev 6.3**: Birden fazla işlemi aynı anda başlatın.
   - **Beklenen Sonuç**: Katılımcı, birden fazla işlemi aynı anda başlatır.
   - **Ölçümler**:
     - Algılanan yanıt süresi
     - Gerçek yanıt süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

4. **Görev 6.4**: Uzun süren bir işlem sırasında arayüzü kullanmaya çalışın.
   - **Beklenen Sonuç**: Katılımcı, uzun süren bir işlem sırasında arayüzü kullanmaya çalışır.
   - **Ölçümler**:
     - Algılanan yanıt süresi
     - Gerçek yanıt süresi
     - Performans memnuniyeti puanı (1-5)
     - Bekleme süresi toleransı

## Değerlendirme Kriterleri

Performans algısı testleri, aşağıdaki kriterlere göre değerlendirilecektir:

### Algılanan Yanıt Süresi

- **Mükemmel**: < 0.1 saniye (anında yanıt)
- **İyi**: 0.1 - 1 saniye (küçük bir gecikme, ancak kullanıcı akışı kesintiye uğramaz)
- **Orta**: 1 - 3 saniye (kullanıcı gecikmeyi fark eder, ancak tolere edilebilir)
- **Zayıf**: > 3 saniye (kullanıcı sabırsızlanır ve dikkat dağılır)

### Algı-Gerçek Farkı

- **Mükemmel**: Algılanan süre gerçek süreden daha kısa
- **İyi**: Algılanan süre gerçek süreye yakın (±10%)
- **Orta**: Algılanan süre gerçek süreden biraz uzun (±30%)
- **Zayıf**: Algılanan süre gerçek süreden çok daha uzun (>30%)

### Performans Memnuniyeti Puanı

- **Mükemmel**: 4.5-5.0
- **İyi**: 4.0-4.4
- **Orta**: 3.5-3.9
- **Zayıf**: 3.5'in altı

### Bekleme Süresi Toleransı

- **Yüksek**: Kullanıcı 5+ saniye bekleyebilir
- **Orta**: Kullanıcı 2-5 saniye bekleyebilir
- **Düşük**: Kullanıcı 2 saniyeden az bekleyebilir

### Performans Algısı Endeksi

- **Mükemmel**: 85-100
- **İyi**: 70-84
- **Orta**: 50-69
- **Zayıf**: 50'nin altı

## Test Raporu Şablonu

Performans algısı testlerinin sonuçları, aşağıdaki şablona göre raporlanacaktır:

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

#### 3.1. Senaryo 1: Uygulama Başlatma ve Giriş

- Algılanan yanıt süreleri
- Gerçek yanıt süreleri
- Algı-gerçek farkları
- Performans memnuniyeti puanları
- Bekleme süresi toleransları
- Gözlemler ve yorumlar

#### 3.2. Senaryo 2: Dosya İşlemleri

- Algılanan yanıt süreleri
- Gerçek yanıt süreleri
- Algı-gerçek farkları
- Performans memnuniyeti puanları
- Bekleme süresi toleransları
- Gözlemler ve yorumlar

#### 3.3. Senaryo 3: Arayüz Yanıt Süresi

- Algılanan yanıt süreleri
- Gerçek yanıt süreleri
- Algı-gerçek farkları
- Performans memnuniyeti puanları
- Bekleme süresi toleransları
- Gözlemler ve yorumlar

#### 3.4. Senaryo 4: Veri Yükleme ve İşleme

- Algılanan yanıt süreleri
- Gerçek yanıt süreleri
- Algı-gerçek farkları
- Performans memnuniyeti puanları
- Bekleme süresi toleransları
- Gözlemler ve yorumlar

#### 3.5. Senaryo 5: Çevrimdışı ve Senkronizasyon

- Algılanan yanıt süreleri
- Gerçek yanıt süreleri
- Algı-gerçek farkları
- Performans memnuniyeti puanları
- Bekleme süresi toleransları
- Gözlemler ve yorumlar

#### 3.6. Senaryo 6: Yüksek Yük Altında Performans

- Algılanan yanıt süreleri
- Gerçek yanıt süreleri
- Algı-gerçek farkları
- Performans memnuniyeti puanları
- Bekleme süresi toleransları
- Gözlemler ve yorumlar

### 4. Bulgular ve Sorunlar

- Tespit edilen sorunlar
- Sorunların şiddeti ve önceliği
- Sorunların etkilediği kullanıcı grupları

### 5. Öneriler

- Algılanan performansı iyileştirme önerileri
- Gerçek performansı iyileştirme önerileri
- Kullanıcı geri bildirimlerine dayalı öneriler

### 6. Ekler

- Test senaryoları
- Test verileri
- Ekran görüntüleri ve videolar
- Anket formları
