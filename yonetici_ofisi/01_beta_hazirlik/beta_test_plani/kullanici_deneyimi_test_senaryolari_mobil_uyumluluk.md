# Kullanıcı Deneyimi Test Senaryoları - Mobil Uyumluluk

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Kullanıcı Deneyimi Test Senaryoları - Mobil Uyumluluk

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için mobil uyumluluk test senaryolarını içermektedir. Bu test senaryoları, sistemin mobil cihazlarda kullanılabilirliğini ve uyumluluğunu değerlendirmek için kullanılacaktır.

## 2. Mobil Görünüm Test Senaryoları

### 2.1. Mobil Duyarlı Tasarım Testi

| Test ID | UX-MC-001 |
|---------|-----------|
| Test Adı | Mobil Duyarlı Tasarım Testi |
| Açıklama | Sistemin mobil cihazlarda duyarlı tasarım uyumluluğunu test etme |
| Ön Koşullar | Mobil cihaz veya mobil emülatör erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi farklı mobil cihazlarda aç (iPhone, Android telefonlar, farklı ekran boyutları)<br>2. Sayfaların mobil ekranlara uyum sağlayıp sağlamadığını kontrol et<br>3. Yatay kaydırma çubuğunun olup olmadığını kontrol et<br>4. İçeriğin okunabilirliğini değerlendir<br>5. Öğelerin boyut ve yerleşiminin mobil kullanım için uygunluğunu değerlendir |
| Beklenen Sonuç | - Sayfalar mobil ekranlara uyum sağlamalı<br>- Yatay kaydırma çubuğu olmamalı<br>- İçerik okunabilir olmalı<br>- Öğelerin boyut ve yerleşimi mobil kullanım için uygun olmalı<br>- Duyarlı tasarım tüm mobil cihazlarda tutarlı çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Mobil Yönlendirme Testi

| Test ID | UX-MC-002 |
|---------|-----------|
| Test Adı | Mobil Yönlendirme Testi |
| Açıklama | Sistemin dikey ve yatay yönlendirmelerde uyumluluğunu test etme |
| Ön Koşullar | Mobil cihaz veya mobil emülatör erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi mobil cihazda dikey yönlendirmede aç<br>2. Sayfaların dikey yönlendirmede görünümünü kontrol et<br>3. Cihazı yatay yönlendirmeye çevir<br>4. Sayfaların yatay yönlendirmede görünümünü kontrol et<br>5. Yönlendirme değişikliği sırasında içeriğin ve düzenin davranışını gözlemle |
| Beklenen Sonuç | - Sayfalar dikey yönlendirmede düzgün görüntülenmeli<br>- Sayfalar yatay yönlendirmede düzgün görüntülenmeli<br>- Yönlendirme değişikliği sorunsuz olmalı<br>- İçerik ve düzen yönlendirmeye uygun şekilde uyarlanmalı<br>- Kullanıcı deneyimi her iki yönlendirmede de etkili olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Mobil Menü ve Gezinme Testi

| Test ID | UX-MC-003 |
|---------|-----------|
| Test Adı | Mobil Menü ve Gezinme Testi |
| Açıklama | Mobil cihazlarda menü ve gezinme öğelerinin kullanılabilirliğini test etme |
| Ön Koşullar | Mobil cihaz veya mobil emülatör erişimi mevcut olmalı ve kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Mobil cihazda ana menüyü aç<br>2. Menü öğelerinin görünürlüğünü ve erişilebilirliğini kontrol et<br>3. Alt menülere erişimi test et<br>4. Menü öğelerine tıklayarak farklı sayfalara gezinmeyi dene<br>5. Hamburger menü veya diğer mobil menü türlerinin işlevselliğini değerlendir |
| Beklenen Sonuç | - Mobil menü kolay erişilebilir olmalı<br>- Menü öğeleri görünür ve tıklanabilir boyutta olmalı<br>- Alt menülere erişim kolay olmalı<br>- Gezinme sorunsuz çalışmalı<br>- Mobil menü türü (hamburger menü, vb.) mobil kullanım için uygun olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Mobil Etkileşim Test Senaryoları

### 3.1. Dokunmatik Etkileşim Testi

| Test ID | UX-MC-004 |
|---------|-----------|
| Test Adı | Dokunmatik Etkileşim Testi |
| Açıklama | Dokunmatik ekranlarda etkileşimli öğelerin kullanılabilirliğini test etme |
| Ön Koşullar | Dokunmatik ekranlı mobil cihaz erişimi mevcut olmalı ve kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki çeşitli etkileşimli öğelere dokun (düğmeler, bağlantılar, açılır menüler, vb.)<br>2. Dokunma hedeflerinin boyutunu ve aralığını değerlendir<br>3. Dokunma geri bildiriminin varlığını ve anlaşılırlığını kontrol et<br>4. Dokunma hassasiyetini ve doğruluğunu test et<br>5. Dokunmatik etkileşimlerin genel kullanılabilirliğini değerlendir |
| Beklenen Sonuç | - Dokunma hedefleri yeterli boyutta olmalı (en az 44x44 piksel)<br>- Dokunma hedefleri arasında yeterli boşluk olmalı<br>- Dokunma geri bildirimi anlaşılır olmalı<br>- Dokunma hassasiyeti ve doğruluğu iyi olmalı<br>- Dokunmatik etkileşimler kullanıcı dostu olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Mobil Hareket ve Jest Testi

| Test ID | UX-MC-005 |
|---------|-----------|
| Test Adı | Mobil Hareket ve Jest Testi |
| Açıklama | Mobil cihazlarda hareket ve jestlerin kullanılabilirliğini test etme |
| Ön Koşullar | Dokunmatik ekranlı mobil cihaz erişimi mevcut olmalı ve kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemde çeşitli mobil jestleri dene (kaydırma, sürükleme, yakınlaştırma/uzaklaştırma, çift dokunma, vb.)<br>2. Jestlerin tanınma doğruluğunu kontrol et<br>3. Jest geri bildiriminin varlığını ve anlaşılırlığını değerlendir<br>4. Özel jestlerin varlığını ve kullanım kolaylığını kontrol et<br>5. Jestlerin genel kullanılabilirliğini değerlendir |
| Beklenen Sonuç | - Standart mobil jestler doğru tanınmalı<br>- Jest geri bildirimi anlaşılır olmalı<br>- Özel jestler (varsa) sezgisel ve kullanımı kolay olmalı<br>- Jestler kullanıcı deneyimini geliştirmeli<br>- Jestler tutarlı şekilde uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Mobil Form Etkileşimi Testi

| Test ID | UX-MC-006 |
|---------|-----------|
| Test Adı | Mobil Form Etkileşimi Testi |
| Açıklama | Mobil cihazlarda form öğelerinin kullanılabilirliğini test etme |
| Ön Koşullar | Mobil cihaz veya mobil emülatör erişimi mevcut olmalı ve kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki çeşitli formları mobil cihazda doldur<br>2. Form öğelerinin boyutunu ve erişilebilirliğini değerlendir<br>3. Mobil klavyenin davranışını ve form öğeleriyle uyumunu kontrol et<br>4. Form doğrulama geri bildirimlerinin görünürlüğünü ve anlaşılırlığını test et<br>5. Formları gönderme ve sonuçları görüntüleme sürecini değerlendir |
| Beklenen Sonuç | - Form öğeleri dokunmatik kullanım için uygun boyutta olmalı<br>- Mobil klavye form öğeleriyle uyumlu çalışmalı<br>- Form doğrulama geri bildirimleri görünür ve anlaşılır olmalı<br>- Form gönderimi kolay olmalı<br>- Sonuçlar mobil ekranda düzgün görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Mobil Performans Test Senaryoları

### 4.1. Mobil Sayfa Yükleme Performansı Testi

| Test ID | UX-MC-007 |
|---------|-----------|
| Test Adı | Mobil Sayfa Yükleme Performansı Testi |
| Açıklama | Mobil cihazlarda sayfa yükleme performansını test etme |
| Ön Koşullar | Mobil cihaz veya mobil emülatör erişimi mevcut olmalı |
| Test Adımları | 1. Farklı mobil ağ koşullarında (4G, 3G, 2G, Wi-Fi) sisteme eriş<br>2. Sayfa yükleme sürelerini ölç<br>3. İlk içerik görüntülenme süresini not et<br>4. Sayfanın tamamen etkileşimli hale gelme süresini not et<br>5. Mobil sayfa yükleme performansının kullanıcı deneyimine etkisini değerlendir |
| Beklenen Sonuç | - Sayfalar mobil cihazlarda makul sürede yüklenmeli<br>- İlk içerik hızlı görüntülenmeli<br>- Düşük bant genişliğinde bile kullanılabilir olmalı<br>- Yükleme sırasında uygun geri bildirim sağlanmalı<br>- Sayfa yükleme performansı kullanıcı deneyimini olumsuz etkilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Mobil Batarya Kullanımı Testi

| Test ID | UX-MC-008 |
|---------|-----------|
| Test Adı | Mobil Batarya Kullanımı Testi |
| Açıklama | Sistemin mobil cihaz batarya kullanımını test etme |
| Ön Koşullar | Mobil cihaz erişimi mevcut olmalı ve batarya kullanımını izleme imkanı olmalı |
| Test Adımları | 1. Sistemi mobil cihazda belirli bir süre kullan (30 dakika)<br>2. Batarya kullanım istatistiklerini kontrol et<br>3. Yüksek batarya tüketimine neden olan özellikleri veya işlemleri belirle<br>4. Arka planda çalışırken batarya kullanımını kontrol et<br>5. Batarya kullanımının kullanıcı deneyimine etkisini değerlendir |
| Beklenen Sonuç | - Sistem aşırı batarya tüketimi yapmamalı<br>- Yüksek batarya tüketimine neden olan özellikler optimize edilmeli<br>- Arka planda çalışırken minimal batarya kullanmalı<br>- Batarya tasarrufu modu ile uyumlu çalışmalı<br>- Batarya kullanımı kullanıcı deneyimini olumsuz etkilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Mobil Veri Kullanımı Testi

| Test ID | UX-MC-009 |
|---------|-----------|
| Test Adı | Mobil Veri Kullanımı Testi |
| Açıklama | Sistemin mobil veri kullanımını test etme |
| Ön Koşullar | Mobil cihaz erişimi mevcut olmalı ve veri kullanımını izleme imkanı olmalı |
| Test Adımları | 1. Sistemi mobil veri bağlantısı üzerinden belirli bir süre kullan (15 dakika)<br>2. Veri kullanım istatistiklerini kontrol et<br>3. Yüksek veri kullanımına neden olan özellikleri veya işlemleri belirle<br>4. Veri tasarrufu seçeneklerinin varlığını kontrol et<br>5. Veri kullanımının kullanıcı deneyimine etkisini değerlendir |
| Beklenen Sonuç | - Sistem aşırı veri tüketimi yapmamalı<br>- Yüksek veri kullanımına neden olan özellikler optimize edilmeli<br>- Veri tasarrufu seçenekleri bulunmalı<br>- Düşük veri kullanımı modunda çalışabilmeli<br>- Veri kullanımı kullanıcı deneyimini olumsuz etkilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Mobil Özel Özellikler Test Senaryoları

### 5.1. Mobil Bildirim Testi

| Test ID | UX-MC-010 |
|---------|-----------|
| Test Adı | Mobil Bildirim Testi |
| Açıklama | Mobil bildirimlerin işlevselliğini ve kullanılabilirliğini test etme |
| Ön Koşullar | Mobil cihaz erişimi mevcut olmalı, kullanıcı giriş yapmış olmalı ve bildirimler etkinleştirilmiş olmalı |
| Test Adımları | 1. Bildirim tetikleyecek işlemler gerçekleştir<br>2. Bildirimlerin alınıp alınmadığını kontrol et<br>3. Bildirim içeriğinin anlaşılırlığını ve yararlılığını değerlendir<br>4. Bildirime tıklama davranışını test et<br>5. Bildirim ayarlarının özelleştirilebilirliğini kontrol et |
| Beklenen Sonuç | - Bildirimler doğru şekilde alınmalı<br>- Bildirim içeriği anlaşılır ve yararlı olmalı<br>- Bildirime tıklama ilgili içeriğe yönlendirmeli<br>- Bildirim ayarları özelleştirilebilir olmalı<br>- Bildirimler kullanıcı deneyimini geliştirmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Mobil Çevrimdışı Modu Testi

| Test ID | UX-MC-011 |
|---------|-----------|
| Test Adı | Mobil Çevrimdışı Modu Testi |
| Açıklama | Sistemin çevrimdışı modda kullanılabilirliğini test etme |
| Ön Koşullar | Mobil cihaz erişimi mevcut olmalı ve kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemi normal şekilde kullan ve bazı verilere eriş<br>2. Cihazı uçak moduna al veya ağ bağlantısını kapat<br>3. Sistemin çevrimdışı davranışını gözlemle<br>4. Çevrimdışıyken erişilebilir özellikleri ve verileri kontrol et<br>5. Ağ bağlantısını yeniden aç ve senkronizasyon davranışını gözlemle |
| Beklenen Sonuç | - Sistem çevrimdışı durumu düzgün şekilde ele almalı<br>- Çevrimdışı erişilebilir özellikler ve veriler belirtilmeli<br>- Çevrimdışı durumda uygun geri bildirim sağlanmalı<br>- Ağ bağlantısı yeniden sağlandığında veriler senkronize edilmeli<br>- Çevrimdışı mod kullanıcı deneyimini aşırı kısıtlamamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Mobil Cihaz Özellikleri Entegrasyonu Testi

| Test ID | UX-MC-012 |
|---------|-----------|
| Test Adı | Mobil Cihaz Özellikleri Entegrasyonu Testi |
| Açıklama | Sistemin mobil cihaz özellikleriyle entegrasyonunu test etme |
| Ön Koşullar | Mobil cihaz erişimi mevcut olmalı ve kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemin kamera entegrasyonunu test et (varsa)<br>2. Sistemin konum servisleri entegrasyonunu test et (varsa)<br>3. Sistemin biyometrik kimlik doğrulama entegrasyonunu test et (varsa)<br>4. Sistemin dosya sistemi entegrasyonunu test et<br>5. Diğer cihaz özelliklerinin entegrasyonunu test et (NFC, Bluetooth, vb.) |
| Beklenen Sonuç | - Cihaz özellikleri entegrasyonları doğru çalışmalı<br>- Özellik izinleri uygun şekilde istenmeli<br>- Özellik kullanılamadığında alternatifler sunulmalı<br>- Entegrasyonlar kullanıcı deneyimini geliştirmeli<br>- Cihaz özellikleri güvenli şekilde kullanılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Mobil Tarayıcı Uyumluluk Test Senaryoları

### 6.1. Mobil Safari Uyumluluk Testi

| Test ID | UX-MC-013 |
|---------|-----------|
| Test Adı | Mobil Safari Uyumluluk Testi |
| Açıklama | Sistemin iOS Safari tarayıcısıyla uyumluluğunu test etme |
| Ön Koşullar | iOS cihaz veya emülatör erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi iOS Safari tarayıcısında aç<br>2. Temel işlevleri test et (gezinme, form doldurma, veri görüntüleme, vb.)<br>3. Sayfa düzeninin ve görsel öğelerin doğru görüntülenip görüntülenmediğini kontrol et<br>4. Safari'ye özgü özelliklerin (dokunma hareketleri, vb.) çalışıp çalışmadığını test et<br>5. Safari'ye özgü sorunları tespit et |
| Beklenen Sonuç | - Sistem iOS Safari'de düzgün çalışmalı<br>- Sayfa düzeni ve görsel öğeler doğru görüntülenmeli<br>- Safari'ye özgü özellikler desteklenmeli<br>- Safari'ye özgü sorunlar minimal olmalı<br>- Kullanıcı deneyimi diğer tarayıcılarla tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Mobil Chrome Uyumluluk Testi

| Test ID | UX-MC-014 |
|---------|-----------|
| Test Adı | Mobil Chrome Uyumluluk Testi |
| Açıklama | Sistemin Android Chrome tarayıcısıyla uyumluluğunu test etme |
| Ön Koşullar | Android cihaz veya emülatör erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi Android Chrome tarayıcısında aç<br>2. Temel işlevleri test et (gezinme, form doldurma, veri görüntüleme, vb.)<br>3. Sayfa düzeninin ve görsel öğelerin doğru görüntülenip görüntülenmediğini kontrol et<br>4. Chrome'a özgü özelliklerin (dokunma hareketleri, vb.) çalışıp çalışmadığını test et<br>5. Chrome'a özgü sorunları tespit et |
| Beklenen Sonuç | - Sistem Android Chrome'da düzgün çalışmalı<br>- Sayfa düzeni ve görsel öğeler doğru görüntülenmeli<br>- Chrome'a özgü özellikler desteklenmeli<br>- Chrome'a özgü sorunlar minimal olmalı<br>- Kullanıcı deneyimi diğer tarayıcılarla tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.3. Diğer Mobil Tarayıcılar Uyumluluk Testi

| Test ID | UX-MC-015 |
|---------|-----------|
| Test Adı | Diğer Mobil Tarayıcılar Uyumluluk Testi |
| Açıklama | Sistemin diğer mobil tarayıcılarla uyumluluğunu test etme |
| Ön Koşullar | Farklı mobil tarayıcılar yüklü cihaz veya emülatör erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi diğer mobil tarayıcılarda aç (Firefox Mobile, Samsung Internet, Opera Mobile, vb.)<br>2. Temel işlevleri test et (gezinme, form doldurma, veri görüntüleme, vb.)<br>3. Sayfa düzeninin ve görsel öğelerin doğru görüntülenip görüntülenmediğini kontrol et<br>4. Tarayıcıya özgü özelliklerin çalışıp çalışmadığını test et<br>5. Tarayıcıya özgü sorunları tespit et |
| Beklenen Sonuç | - Sistem diğer mobil tarayıcılarda düzgün çalışmalı<br>- Sayfa düzeni ve görsel öğeler doğru görüntülenmeli<br>- Tarayıcıya özgü özellikler mümkün olduğunca desteklenmeli<br>- Tarayıcıya özgü sorunlar minimal olmalı<br>- Kullanıcı deneyimi tarayıcılar arasında tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
