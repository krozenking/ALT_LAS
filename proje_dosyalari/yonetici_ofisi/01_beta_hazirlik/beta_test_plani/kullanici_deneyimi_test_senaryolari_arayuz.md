# Kullanıcı Deneyimi Test Senaryoları - Arayüz

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Kullanıcı Deneyimi Test Senaryoları - Arayüz

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için arayüz test senaryolarını içermektedir. Bu test senaryoları, sistemin görsel tasarımını, tutarlılığını ve kullanıcı arayüzü öğelerinin işlevselliğini değerlendirmek için kullanılacaktır.

## 2. Görsel Tasarım Test Senaryoları

### 2.1. Marka Kimliği Tutarlılığı Testi

| Test ID | UX-UI-001 |
|---------|-----------|
| Test Adı | Marka Kimliği Tutarlılığı Testi |
| Açıklama | Sistemin marka kimliği öğelerinin tutarlılığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemin farklı sayfalarını ziyaret et<br>2. Logo, renk şeması ve tipografi kullanımını kontrol et<br>3. Marka kimliği öğelerinin tutarlılığını değerlendir<br>4. Marka kimliği öğelerinin görünürlüğünü kontrol et<br>5. Marka kimliği öğelerinin kalitesini değerlendir |
| Beklenen Sonuç | - Logo tüm sayfalarda tutarlı şekilde görüntülenmeli<br>- Renk şeması tüm sayfalarda tutarlı olmalı<br>- Tipografi tüm sayfalarda tutarlı olmalı<br>- Marka kimliği öğeleri görünür olmalı<br>- Marka kimliği öğeleri yüksek kalitede olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Sayfa Düzeni Tutarlılığı Testi

| Test ID | UX-UI-002 |
|---------|-----------|
| Test Adı | Sayfa Düzeni Tutarlılığı Testi |
| Açıklama | Sistemdeki sayfa düzenlerinin tutarlılığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemin farklı sayfalarını ziyaret et<br>2. Sayfa düzenlerini kontrol et (başlık, içerik, kenar çubukları, altbilgi)<br>3. Sayfa düzenlerinin tutarlılığını değerlendir<br>4. Sayfa öğelerinin hizalamasını kontrol et<br>5. Boşluk kullanımını ve sayfa dengesini değerlendir |
| Beklenen Sonuç | - Sayfa düzenleri tüm sayfalarda tutarlı olmalı<br>- Sayfa öğeleri doğru hizalanmış olmalı<br>- Boşluk kullanımı dengeli olmalı<br>- Sayfa düzeni kullanıcı deneyimini desteklemeli<br>- Sayfa düzeni içeriği vurgulamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Renk Kontrastı ve Okunabilirlik Testi

| Test ID | UX-UI-003 |
|---------|-----------|
| Test Adı | Renk Kontrastı ve Okunabilirlik Testi |
| Açıklama | Sistemdeki renk kontrastı ve metin okunabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemin farklı sayfalarını ziyaret et<br>2. Metin ve arka plan renk kontrastını kontrol et<br>3. Farklı metin boyutlarının okunabilirliğini değerlendir<br>4. Vurgulanan öğelerin görünürlüğünü kontrol et<br>5. Renk körlüğü simülasyonu ile renk kontrastını test et |
| Beklenen Sonuç | - Metin ve arka plan arasında yeterli kontrast olmalı (WCAG AA standardı)<br>- Tüm metin boyutları okunabilir olmalı<br>- Vurgulanan öğeler açıkça görünür olmalı<br>- Renk körlüğü olan kullanıcılar için içerik ayırt edilebilir olmalı<br>- Renk, bilgi iletmek için tek başına kullanılmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. Görsel Hiyerarşi Testi

| Test ID | UX-UI-004 |
|---------|-----------|
| Test Adı | Görsel Hiyerarşi Testi |
| Açıklama | Sistemdeki görsel hiyerarşinin etkinliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemin farklı sayfalarını ziyaret et<br>2. Öğelerin boyut, renk ve yerleşim hiyerarşisini kontrol et<br>3. Önemli öğelerin vurgulanma şeklini değerlendir<br>4. Kullanıcı dikkatinin doğru yönlendirilip yönlendirilmediğini kontrol et<br>5. Görsel hiyerarşinin içerik organizasyonunu destekleyip desteklemediğini değerlendir |
| Beklenen Sonuç | - Önemli öğeler görsel olarak vurgulanmalı<br>- Görsel hiyerarşi kullanıcı dikkatini doğru yönlendirmeli<br>- Başlıklar ve alt başlıklar açıkça ayırt edilebilir olmalı<br>- İlgili öğeler görsel olarak gruplandırılmalı<br>- Görsel hiyerarşi içerik organizasyonunu desteklemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. Görsel Geri Bildirim Testi

| Test ID | UX-UI-005 |
|---------|-----------|
| Test Adı | Görsel Geri Bildirim Testi |
| Açıklama | Sistemdeki görsel geri bildirimlerin etkinliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Çeşitli etkileşimli öğelerle etkileşime geç (düğmeler, bağlantılar, formlar)<br>2. Hover, focus, active ve disabled durumlarındaki görsel geri bildirimleri kontrol et<br>3. İşlem sonrası görsel geri bildirimleri değerlendir<br>4. Hata ve başarı durumlarındaki görsel geri bildirimleri kontrol et<br>5. Animasyon ve geçiş efektlerinin etkinliğini değerlendir |
| Beklenen Sonuç | - Etkileşimli öğeler hover, focus ve active durumlarında görsel geri bildirim sağlamalı<br>- Disabled öğeler görsel olarak ayırt edilebilir olmalı<br>- İşlem sonrası görsel geri bildirimler açık ve anlaşılır olmalı<br>- Hata ve başarı durumları görsel olarak ayırt edilebilir olmalı<br>- Animasyon ve geçiş efektleri kullanıcı deneyimini desteklemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Arayüz Öğeleri Test Senaryoları

### 3.1. Düğme ve Bağlantı Testi

| Test ID | UX-UI-006 |
|---------|-----------|
| Test Adı | Düğme ve Bağlantı Testi |
| Açıklama | Sistemdeki düğme ve bağlantıların kullanılabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki farklı düğme ve bağlantıları belirle<br>2. Her düğme ve bağlantıya tıkla<br>3. Düğme ve bağlantıların boyut ve yerleşimini değerlendir<br>4. Düğme ve bağlantıların etiketlerinin anlaşılırlığını kontrol et<br>5. Düğme ve bağlantıların görsel durumlarını (normal, hover, active, disabled) kontrol et |
| Beklenen Sonuç | - Düğme ve bağlantılar tıklanabilir boyutta olmalı<br>- Düğme ve bağlantılar mantıksal olarak yerleştirilmiş olmalı<br>- Düğme ve bağlantıların etiketleri anlaşılır olmalı<br>- Düğme ve bağlantıların görsel durumları ayırt edilebilir olmalı<br>- Düğme ve bağlantılar beklenen işlevleri gerçekleştirmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Form Öğeleri Testi

| Test ID | UX-UI-007 |
|---------|-----------|
| Test Adı | Form Öğeleri Testi |
| Açıklama | Sistemdeki form öğelerinin kullanılabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki farklı form öğelerini belirle (metin kutuları, açılır menüler, onay kutuları, radyo düğmeleri)<br>2. Her form öğesi ile etkileşime geç<br>3. Form öğelerinin boyut ve yerleşimini değerlendir<br>4. Form öğelerinin etiketlerinin anlaşılırlığını kontrol et<br>5. Form öğelerinin görsel durumlarını (normal, focus, disabled, error) kontrol et |
| Beklenen Sonuç | - Form öğeleri kullanımı kolay boyutta olmalı<br>- Form öğeleri mantıksal olarak yerleştirilmiş olmalı<br>- Form öğelerinin etiketleri anlaşılır olmalı<br>- Form öğelerinin görsel durumları ayırt edilebilir olmalı<br>- Form öğeleri beklenen işlevleri gerçekleştirmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Tablo ve Liste Testi

| Test ID | UX-UI-008 |
|---------|-----------|
| Test Adı | Tablo ve Liste Testi |
| Açıklama | Sistemdeki tablo ve listelerin kullanılabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve tablolarda/listelerde veri bulunmalı |
| Test Adımları | 1. Sistemdeki farklı tablo ve listeleri belirle<br>2. Tablo ve listelerdeki verileri incele<br>3. Sıralama, filtreleme ve sayfalama özelliklerini test et<br>4. Tablo ve liste başlıklarının anlaşılırlığını kontrol et<br>5. Tablo ve listelerdeki veri yoğunluğunu ve okunabilirliğini değerlendir |
| Beklenen Sonuç | - Tablo ve listeler verileri düzenli şekilde göstermeli<br>- Sıralama, filtreleme ve sayfalama özellikleri çalışmalı<br>- Tablo ve liste başlıkları anlaşılır olmalı<br>- Veri yoğunluğu uygun olmalı<br>- Tablo ve listeler büyük veri setlerini etkili şekilde gösterebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. İletişim Kutuları ve Bildirimler Testi

| Test ID | UX-UI-009 |
|---------|-----------|
| Test Adı | İletişim Kutuları ve Bildirimler Testi |
| Açıklama | Sistemdeki iletişim kutuları ve bildirimlerin kullanılabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Çeşitli iletişim kutularını tetikle (onay, uyarı, hata, bilgi)<br>2. Bildirimleri tetikle (başarı, hata, bilgi)<br>3. İletişim kutuları ve bildirimlerin görünürlüğünü kontrol et<br>4. İletişim kutuları ve bildirimlerin anlaşılırlığını değerlendir<br>5. İletişim kutuları ve bildirimlerin kapatılma kolaylığını test et |
| Beklenen Sonuç | - İletişim kutuları ve bildirimler görünür olmalı<br>- İletişim kutuları ve bildirimler anlaşılır mesajlar içermeli<br>- İletişim kutuları ve bildirimler kullanıcı dikkatini çekmeli<br>- İletişim kutuları ve bildirimler kolayca kapatılabilmeli<br>- İletişim kutuları ve bildirimler kullanıcı iş akışını kesintiye uğratmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.5. İkonlar ve Görsel Öğeler Testi

| Test ID | UX-UI-010 |
|---------|-----------|
| Test Adı | İkonlar ve Görsel Öğeler Testi |
| Açıklama | Sistemdeki ikonlar ve görsel öğelerin anlaşılırlığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki farklı ikonları ve görsel öğeleri belirle<br>2. İkonların ve görsel öğelerin anlaşılırlığını değerlendir<br>3. İkonların ve görsel öğelerin tutarlılığını kontrol et<br>4. İkonların ve görsel öğelerin kalitesini değerlendir<br>5. İkonların ve görsel öğelerin alternatif metin veya araç ipuçlarını kontrol et |
| Beklenen Sonuç | - İkonlar ve görsel öğeler anlaşılır olmalı<br>- İkonlar ve görsel öğeler tutarlı olmalı<br>- İkonlar ve görsel öğeler yüksek kalitede olmalı<br>- İkonlar ve görsel öğeler alternatif metin veya araç ipuçları içermeli<br>- İkonlar ve görsel öğeler kullanıcı deneyimini desteklemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Duyarlı Tasarım Test Senaryoları

### 4.1. Masaüstü Görünüm Testi

| Test ID | UX-UI-011 |
|---------|-----------|
| Test Adı | Masaüstü Görünüm Testi |
| Açıklama | Sistemin masaüstü ekranlarda görünümünü test etme |
| Ön Koşullar | Masaüstü tarayıcı erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi farklı masaüstü ekran çözünürlüklerinde aç (1920x1080, 1366x768, vb.)<br>2. Sayfa düzeninin farklı çözünürlüklerde nasıl uyarlandığını kontrol et<br>3. Öğelerin boyut ve yerleşiminin uygunluğunu değerlendir<br>4. Metin okunabilirliğini kontrol et<br>5. Yatay kaydırma çubuğunun olup olmadığını kontrol et |
| Beklenen Sonuç | - Sayfa düzeni farklı masaüstü çözünürlüklerine uyum sağlamalı<br>- Öğelerin boyut ve yerleşimi uygun olmalı<br>- Metin okunabilir olmalı<br>- Yatay kaydırma çubuğu olmamalı<br>- Kullanıcı deneyimi tüm masaüstü çözünürlüklerinde tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Tablet Görünüm Testi

| Test ID | UX-UI-012 |
|---------|-----------|
| Test Adı | Tablet Görünüm Testi |
| Açıklama | Sistemin tablet ekranlarda görünümünü test etme |
| Ön Koşullar | Tablet cihaz veya tablet emülatörü erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi farklı tablet ekran çözünürlüklerinde aç (iPad, iPad Pro, vb.)<br>2. Sayfa düzeninin tablet çözünürlüklerinde nasıl uyarlandığını kontrol et<br>3. Öğelerin boyut ve yerleşiminin uygunluğunu değerlendir<br>4. Dokunmatik etkileşimlerin kullanılabilirliğini test et<br>5. Yatay ve dikey yönlendirme arasında geçiş yaparak uyumu kontrol et |
| Beklenen Sonuç | - Sayfa düzeni tablet çözünürlüklerine uyum sağlamalı<br>- Öğelerin boyut ve yerleşimi dokunmatik kullanım için uygun olmalı<br>- Dokunmatik etkileşimler doğru çalışmalı<br>- Yatay ve dikey yönlendirmede sayfa düzeni uygun şekilde uyarlanmalı<br>- Kullanıcı deneyimi tablet cihazlarda etkili olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Mobil Görünüm Testi

| Test ID | UX-UI-013 |
|---------|-----------|
| Test Adı | Mobil Görünüm Testi |
| Açıklama | Sistemin mobil ekranlarda görünümünü test etme |
| Ön Koşullar | Mobil cihaz veya mobil emülatörü erişimi mevcut olmalı |
| Test Adımları | 1. Sistemi farklı mobil ekran çözünürlüklerinde aç (iPhone, Android, vb.)<br>2. Sayfa düzeninin mobil çözünürlüklerde nasıl uyarlandığını kontrol et<br>3. Öğelerin boyut ve yerleşiminin uygunluğunu değerlendir<br>4. Dokunmatik etkileşimlerin kullanılabilirliğini test et<br>5. Yatay ve dikey yönlendirme arasında geçiş yaparak uyumu kontrol et |
| Beklenen Sonuç | - Sayfa düzeni mobil çözünürlüklere uyum sağlamalı<br>- Öğelerin boyut ve yerleşimi dokunmatik kullanım için uygun olmalı<br>- Dokunmatik etkileşimler doğru çalışmalı<br>- Yatay ve dikey yönlendirmede sayfa düzeni uygun şekilde uyarlanmalı<br>- Kullanıcı deneyimi mobil cihazlarda etkili olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.4. Farklı Tarayıcı Testi

| Test ID | UX-UI-014 |
|---------|-----------|
| Test Adı | Farklı Tarayıcı Testi |
| Açıklama | Sistemin farklı tarayıcılarda görünümünü test etme |
| Ön Koşullar | Farklı tarayıcılara erişim mevcut olmalı |
| Test Adımları | 1. Sistemi farklı tarayıcılarda aç (Chrome, Firefox, Safari, Edge)<br>2. Sayfa düzeninin farklı tarayıcılarda tutarlı olup olmadığını kontrol et<br>3. Öğelerin görünüm ve davranışlarının tutarlılığını değerlendir<br>4. Tarayıcıya özgü sorunları tespit et<br>5. Tarayıcı uyumluluğunu genel olarak değerlendir |
| Beklenen Sonuç | - Sayfa düzeni farklı tarayıcılarda tutarlı olmalı<br>- Öğelerin görünüm ve davranışları tutarlı olmalı<br>- Tarayıcıya özgü sorunlar minimal olmalı<br>- Sistem tüm modern tarayıcılarda düzgün çalışmalı<br>- Kullanıcı deneyimi tarayıcılar arasında tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.5. Ekran Boyutu Değişikliği Testi

| Test ID | UX-UI-015 |
|---------|-----------|
| Test Adı | Ekran Boyutu Değişikliği Testi |
| Açıklama | Sistemin ekran boyutu değişikliklerine tepkisini test etme |
| Ön Koşullar | Tarayıcı pencere boyutunu değiştirebilme imkanı olmalı |
| Test Adımları | 1. Sistemi tarayıcıda aç<br>2. Tarayıcı penceresini farklı boyutlara yeniden boyutlandır<br>3. Sayfa düzeninin yeniden boyutlandırma sırasında nasıl uyarlandığını gözlemle<br>4. Öğelerin yeniden düzenlenmesini ve yeniden boyutlandırılmasını kontrol et<br>5. Kesme noktalarında (breakpoint) geçişlerin sorunsuz olup olmadığını değerlendir |
| Beklenen Sonuç | - Sayfa düzeni ekran boyutu değişikliklerine sorunsuz uyum sağlamalı<br>- Öğeler uygun şekilde yeniden düzenlenmeli ve yeniden boyutlandırılmalı<br>- Kesme noktalarında geçişler sorunsuz olmalı<br>- Yeniden boyutlandırma sırasında içerik kaybolmamalı<br>- Kullanıcı deneyimi farklı ekran boyutlarında tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
