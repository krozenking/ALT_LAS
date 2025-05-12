# Kullanıcı Deneyimi Test Senaryoları - Performans Algısı

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Kullanıcı Deneyimi Test Senaryoları - Performans Algısı

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için performans algısı test senaryolarını içermektedir. Bu test senaryoları, sistemin kullanıcılar tarafından algılanan performansını değerlendirmek için kullanılacaktır. Teknik performans ölçümlerinden ziyade, kullanıcıların sistemin hızı ve yanıt verebilirliği hakkındaki algılarına odaklanılacaktır.

## 2. Sayfa Yükleme Algısı Test Senaryoları

### 2.1. İlk Sayfa Yükleme Algısı Testi

| Test ID | UX-PP-001 |
|---------|-----------|
| Test Adı | İlk Sayfa Yükleme Algısı Testi |
| Açıklama | Kullanıcıların ilk sayfa yükleme hızı algısını test etme |
| Ön Koşullar | Kullanıcı henüz giriş yapmamış olmalı |
| Test Adımları | 1. Tarayıcı önbelleğini temizle<br>2. Sistemin giriş sayfasını yükle<br>3. Sayfanın yüklenme süresini ölç (algılanan süre)<br>4. İlk içeriğin görüntülenme süresini not et<br>5. Sayfanın tamamen etkileşimli hale gelme süresini not et<br>6. Kullanıcının yükleme hızı hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - İlk içerik 1-2 saniye içinde görüntülenmeli<br>- Sayfa 3 saniye içinde tamamen etkileşimli hale gelmeli<br>- Yükleme sırasında görsel geri bildirim (ilerleme çubuğu, yükleniyor animasyonu) sağlanmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı<br>- Sayfa yükleme sırasında kullanıcı arayüzü donmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Gezinme Hızı Algısı Testi

| Test ID | UX-PP-002 |
|---------|-----------|
| Test Adı | Gezinme Hızı Algısı Testi |
| Açıklama | Kullanıcıların sayfalar arası gezinme hızı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Ana sayfadan başlayarak sistemin farklı sayfaları arasında gezin<br>2. Her sayfa geçişinin süresini ölç (algılanan süre)<br>3. Sayfa geçişlerindeki animasyonların akıcılığını değerlendir<br>4. Gezinme sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının gezinme hızı hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Sayfa geçişleri 1 saniye içinde tamamlanmalı<br>- Sayfa geçiş animasyonları akıcı olmalı<br>- Gezinme sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı<br>- Gezinme sırasında içerik titremesi (layout shift) minimal olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. İçerik Yükleme Önceliklendirme Testi

| Test ID | UX-PP-003 |
|---------|-----------|
| Test Adı | İçerik Yükleme Önceliklendirme Testi |
| Açıklama | İçerik yükleme sırasının kullanıcı algısına etkisini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Büyük miktarda içerik (görüntüler, tablolar, grafikler) içeren bir sayfayı yükle<br>2. İçeriğin yüklenme sırasını gözlemle<br>3. Görünür alandaki içeriğin önceliklendirilip önceliklendirilmediğini kontrol et<br>4. Kritik içeriğin (navigasyon, ana metin) önceliklendirilip önceliklendirilmediğini kontrol et<br>5. Kullanıcının içerik yükleme sırası hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Görünür alandaki içerik öncelikli olarak yüklenmeli<br>- Kritik içerik (navigasyon, ana metin) öncelikli olarak yüklenmeli<br>- Büyük medya dosyaları (görüntüler, videolar) aşamalı olarak yüklenmeli<br>- İçerik yükleme sırası kullanıcı deneyimini desteklemeli<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Etkileşim Yanıt Süresi Algısı Test Senaryoları

### 3.1. Düğme ve Bağlantı Yanıt Süresi Testi

| Test ID | UX-PP-004 |
|---------|-----------|
| Test Adı | Düğme ve Bağlantı Yanıt Süresi Testi |
| Açıklama | Düğme ve bağlantıların yanıt süresi algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki çeşitli düğme ve bağlantılara tıkla<br>2. Tıklama ile görsel geri bildirim arasındaki süreyi ölç<br>3. Tıklama ile işlemin tamamlanması arasındaki süreyi ölç<br>4. Tıklama sonrası geri bildirimin anlaşılırlığını değerlendir<br>5. Kullanıcının düğme ve bağlantı yanıt süresi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Tıklama ile görsel geri bildirim arasındaki süre 100ms'den az olmalı<br>- Basit işlemler 300ms içinde tamamlanmalı<br>- Tıklama sonrası geri bildirim anlaşılır olmalı<br>- Uzun süren işlemler için ilerleme göstergesi sağlanmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Form Gönderim Yanıt Süresi Testi

| Test ID | UX-PP-005 |
|---------|-----------|
| Test Adı | Form Gönderim Yanıt Süresi Testi |
| Açıklama | Form gönderimlerinin yanıt süresi algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki çeşitli formları doldur ve gönder<br>2. Form gönderimi ile görsel geri bildirim arasındaki süreyi ölç<br>3. Form gönderimi ile işlemin tamamlanması arasındaki süreyi ölç<br>4. Form gönderimi sonrası geri bildirimin anlaşılırlığını değerlendir<br>5. Kullanıcının form gönderim yanıt süresi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Form gönderimi ile görsel geri bildirim arasındaki süre 100ms'den az olmalı<br>- Form doğrulama geri bildirimi anında sağlanmalı<br>- Form gönderimi sonrası geri bildirim anlaşılır olmalı<br>- Uzun süren form işlemleri için ilerleme göstergesi sağlanmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Veri Filtreleme ve Sıralama Yanıt Süresi Testi

| Test ID | UX-PP-006 |
|---------|-----------|
| Test Adı | Veri Filtreleme ve Sıralama Yanıt Süresi Testi |
| Açıklama | Veri filtreleme ve sıralama işlemlerinin yanıt süresi algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve veri listeleri görüntülenebilir olmalı |
| Test Adımları | 1. Veri listelerinde çeşitli filtreleme ve sıralama işlemleri gerçekleştir<br>2. Filtreleme/sıralama işlemi ile görsel geri bildirim arasındaki süreyi ölç<br>3. Filtreleme/sıralama işlemi ile sonuçların görüntülenmesi arasındaki süreyi ölç<br>4. İşlem sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının filtreleme/sıralama yanıt süresi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Filtreleme/sıralama işlemi ile görsel geri bildirim arasındaki süre 100ms'den az olmalı<br>- Küçük veri setleri için sonuçlar 300ms içinde görüntülenmeli<br>- Büyük veri setleri için ilerleme göstergesi sağlanmalı<br>- İşlem sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Uzun Süren İşlemler Algısı Test Senaryoları

### 4.1. Dosya Yükleme İşlemi Algısı Testi

| Test ID | UX-PP-007 |
|---------|-----------|
| Test Adı | Dosya Yükleme İşlemi Algısı Testi |
| Açıklama | Dosya yükleme işlemlerinin kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Farklı boyutlarda dosyalar yükle (küçük, orta, büyük)<br>2. Yükleme işlemi sırasında ilerleme göstergesinin varlığını ve doğruluğunu kontrol et<br>3. Yükleme işlemi sırasında tahmini kalan süre göstergesinin varlığını kontrol et<br>4. Yükleme işlemi sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının dosya yükleme işlemi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Dosya yükleme işlemi için ilerleme göstergesi sağlanmalı<br>- İlerleme göstergesi doğru ilerlemeyi göstermeli<br>- Tahmini kalan süre göstergesi sağlanmalı (mümkünse)<br>- Yükleme işlemi sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Segmentasyon İşlemi Algısı Testi

| Test ID | UX-PP-008 |
|---------|-----------|
| Test Adı | Segmentasyon İşlemi Algısı Testi |
| Açıklama | Segmentasyon işlemlerinin kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve görüntü yüklenmiş olmalı |
| Test Adımları | 1. Farklı karmaşıklıkta görüntüler için segmentasyon işlemleri başlat<br>2. Segmentasyon işlemi sırasında ilerleme göstergesinin varlığını ve doğruluğunu kontrol et<br>3. Segmentasyon işlemi sırasında tahmini kalan süre göstergesinin varlığını kontrol et<br>4. Segmentasyon işlemi sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının segmentasyon işlemi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Segmentasyon işlemi için ilerleme göstergesi sağlanmalı<br>- İlerleme göstergesi doğru ilerlemeyi göstermeli<br>- Tahmini kalan süre göstergesi sağlanmalı (mümkünse)<br>- Segmentasyon işlemi sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Rapor Oluşturma İşlemi Algısı Testi

| Test ID | UX-PP-009 |
|---------|-----------|
| Test Adı | Rapor Oluşturma İşlemi Algısı Testi |
| Açıklama | Rapor oluşturma işlemlerinin kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve rapor oluşturulabilir veriler mevcut olmalı |
| Test Adımları | 1. Farklı karmaşıklıkta raporlar oluştur<br>2. Rapor oluşturma işlemi sırasında ilerleme göstergesinin varlığını ve doğruluğunu kontrol et<br>3. Rapor oluşturma işlemi sırasında tahmini kalan süre göstergesinin varlığını kontrol et<br>4. Rapor oluşturma işlemi sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının rapor oluşturma işlemi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Rapor oluşturma işlemi için ilerleme göstergesi sağlanmalı<br>- İlerleme göstergesi doğru ilerlemeyi göstermeli<br>- Tahmini kalan süre göstergesi sağlanmalı (mümkünse)<br>- Rapor oluşturma işlemi sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Arka Plan İşlemleri Algısı Test Senaryoları

### 5.1. Arka Plan Veri Yükleme Algısı Testi

| Test ID | UX-PP-010 |
|---------|-----------|
| Test Adı | Arka Plan Veri Yükleme Algısı Testi |
| Açıklama | Arka planda veri yükleme işlemlerinin kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Büyük veri setleri içeren sayfalara eriş<br>2. Sayfa ilk yüklendiğinde hangi verilerin hemen gösterildiğini gözlemle<br>3. Arka planda yüklenen verilerin gösterilme şeklini ve zamanlamasını kontrol et<br>4. Arka plan veri yüklemesi sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının arka plan veri yükleme işlemi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Sayfa ilk yüklendiğinde kritik veriler hemen gösterilmeli<br>- Arka planda yüklenen veriler kademeli olarak gösterilmeli<br>- Arka plan veri yüklemesi için uygun göstergeler sağlanmalı<br>- Arka plan veri yüklemesi sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Otomatik Kaydetme Algısı Testi

| Test ID | UX-PP-011 |
|---------|-----------|
| Test Adı | Otomatik Kaydetme Algısı Testi |
| Açıklama | Otomatik kaydetme işlemlerinin kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve otomatik kaydetme özelliği olan bir form açık olmalı |
| Test Adımları | 1. Otomatik kaydetme özelliği olan bir formda değişiklikler yap<br>2. Otomatik kaydetme işleminin tetiklenme zamanını gözlemle<br>3. Otomatik kaydetme işlemi sırasında ve sonrasında görsel geri bildirimin varlığını kontrol et<br>4. Otomatik kaydetme işlemi sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının otomatik kaydetme işlemi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Otomatik kaydetme işlemi kullanıcı deneyimini kesintiye uğratmamalı<br>- Otomatik kaydetme işlemi için uygun görsel geri bildirim sağlanmalı<br>- Otomatik kaydetme işlemi başarılı/başarısız durumu bildirilmeli<br>- Otomatik kaydetme işlemi sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Bildirim Yükleme Algısı Testi

| Test ID | UX-PP-012 |
|---------|-----------|
| Test Adı | Bildirim Yükleme Algısı Testi |
| Açıklama | Bildirimlerin yüklenmesi ve gösterilmesinin kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve bildirimler mevcut olmalı |
| Test Adımları | 1. Bildirim alanını aç veya bildirim sayfasına git<br>2. Bildirimlerin yüklenme süresini ölç<br>3. Bildirimlerin yüklenmesi sırasında görsel geri bildirimin varlığını kontrol et<br>4. Bildirimlerin yüklenmesi sırasında kullanıcı arayüzünün yanıt verebilirliğini kontrol et<br>5. Kullanıcının bildirim yükleme işlemi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Bildirimler hızlı bir şekilde yüklenmeli<br>- Bildirim yükleme işlemi için uygun görsel geri bildirim sağlanmalı<br>- Bildirimler öncelik sırasına göre gösterilmeli<br>- Bildirim yükleme işlemi sırasında kullanıcı arayüzü yanıt verebilir kalmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Genel Performans Algısı Test Senaryoları

### 6.1. Genel Sistem Yanıt Verebilirliği Testi

| Test ID | UX-PP-013 |
|---------|-----------|
| Test Adı | Genel Sistem Yanıt Verebilirliği Testi |
| Açıklama | Sistemin genel yanıt verebilirliği hakkındaki kullanıcı algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemde çeşitli görevleri gerçekleştir (gezinme, form doldurma, veri görüntüleme, vb.)<br>2. Sistemin farklı işlemlere yanıt verme süresini genel olarak değerlendir<br>3. Sistemin yanıt verebilirliğinin tutarlılığını kontrol et<br>4. Sistemin yanıt verebilirliğinin kullanıcı deneyimine etkisini değerlendir<br>5. Kullanıcının genel sistem yanıt verebilirliği hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Sistem genel olarak hızlı ve yanıt verebilir olmalı<br>- Sistem yanıt verebilirliği tutarlı olmalı<br>- Sistem yanıt verebilirliği kullanıcı deneyimini olumlu etkilemeli<br>- Kullanıcı algısı puanı en az 4/5 olmalı<br>- Kullanıcılar sistemin performansından memnun olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Çoklu Görev Performans Algısı Testi

| Test ID | UX-PP-014 |
|---------|-----------|
| Test Adı | Çoklu Görev Performans Algısı Testi |
| Açıklama | Çoklu görevler gerçekleştirilirken sistemin performans algısını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Aynı anda birden fazla görevi gerçekleştir (dosya yükleme, segmentasyon işlemi, rapor oluşturma, vb.)<br>2. Çoklu görevler sırasında sistemin yanıt verebilirliğini kontrol et<br>3. Arka plan görevlerinin ön plan görevlerine etkisini değerlendir<br>4. Çoklu görevlerin ilerleme durumunun görünürlüğünü kontrol et<br>5. Kullanıcının çoklu görev performansı hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Çoklu görevler sırasında sistem yanıt verebilir kalmalı<br>- Arka plan görevleri ön plan görevlerini olumsuz etkilememeli<br>- Çoklu görevlerin ilerleme durumu görünür olmalı<br>- Görevler arasında geçiş yapmak kolay olmalı<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.3. Performans Beklentileri Karşılama Testi

| Test ID | UX-PP-015 |
|---------|-----------|
| Test Adı | Performans Beklentileri Karşılama Testi |
| Açıklama | Sistemin kullanıcı performans beklentilerini karşılama düzeyini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Kullanıcıların sistem performansı hakkındaki beklentilerini belirle (anket veya görüşme yoluyla)<br>2. Kullanıcıların beklentilerini karşılayan ve karşılamayan performans alanlarını tespit et<br>3. Performans beklentileri ile gerçek performans arasındaki farkı değerlendir<br>4. Performans beklentilerinin karşılanmamasının kullanıcı deneyimine etkisini değerlendir<br>5. Kullanıcının performans beklentilerinin karşılanma düzeyi hakkındaki algısını değerlendir (1-5 ölçeği) |
| Beklenen Sonuç | - Sistem kullanıcı performans beklentilerini karşılamalı<br>- Performans beklentileri ile gerçek performans arasında minimal fark olmalı<br>- Performans beklentilerinin karşılanmaması kullanıcı deneyimini olumsuz etkilememeli<br>- Performans iyileştirme alanları belirlenebilmeli<br>- Kullanıcı algısı puanı en az 4/5 olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
