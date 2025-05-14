# Kullanıcı Deneyimi Test Senaryoları - Kullanılabilirlik

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Kullanıcı Deneyimi Test Senaryoları - Kullanılabilirlik

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için kullanılabilirlik test senaryolarını içermektedir. Bu test senaryoları, sistemin kullanıcı dostu olup olmadığını ve kullanıcıların görevleri verimli bir şekilde tamamlayıp tamamlayamadığını değerlendirmek için kullanılacaktır.

## 2. Gezinme ve Bilgi Mimarisi Test Senaryoları

### 2.1. Ana Menü Gezinme Testi

| Test ID | UX-US-001 |
|---------|-----------|
| Test Adı | Ana Menü Gezinme Testi |
| Açıklama | Ana menü üzerinden sistemin farklı bölümlerine gezinmeyi test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Ana sayfaya git<br>2. Ana menüdeki her bir bölüme tıkla ve ilgili sayfanın yüklendiğini doğrula<br>3. Alt menüleri kontrol et ve her birine tıkla<br>4. Menü öğelerinin mantıksal gruplandırmasını değerlendir<br>5. Menü öğelerinin adlandırmasının anlaşılır olup olmadığını değerlendir |
| Beklenen Sonuç | - Tüm menü öğeleri doğru sayfaları yüklemeli<br>- Menü yapısı mantıksal ve tutarlı olmalı<br>- Menü öğelerinin adlandırması anlaşılır olmalı<br>- Aktif menü öğesi görsel olarak vurgulanmalı<br>- Alt menüler doğru şekilde açılmalı ve kapanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Ekmek Kırıntısı Gezinme Testi

| Test ID | UX-US-002 |
|---------|-----------|
| Test Adı | Ekmek Kırıntısı Gezinme Testi |
| Açıklama | Ekmek kırıntısı (breadcrumb) gezinme özelliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Ana sayfadan başlayarak birkaç seviye derinliğinde bir sayfaya git<br>2. Ekmek kırıntısı gezinme çubuğunun görünürlüğünü kontrol et<br>3. Ekmek kırıntısı öğelerine tıklayarak üst seviye sayfalara git<br>4. Ekmek kırıntısı öğelerinin adlandırmasını ve sırasını kontrol et |
| Beklenen Sonuç | - Ekmek kırıntısı gezinme çubuğu görünür olmalı<br>- Ekmek kırıntısı öğeleri doğru sırada gösterilmeli<br>- Ekmek kırıntısı öğelerine tıklandığında ilgili sayfalar yüklenmeli<br>- Mevcut sayfa ekmek kırıntısında vurgulanmalı<br>- Ekmek kırıntısı öğelerinin adlandırması anlaşılır olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Arama İşlevi Testi

| Test ID | UX-US-003 |
|---------|-----------|
| Test Adı | Arama İşlevi Testi |
| Açıklama | Sistem genelinde arama işlevini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve sistemde aranabilir veriler bulunmalı |
| Test Adımları | 1. Ana sayfadaki arama kutusunu bul<br>2. Farklı arama terimleri gir (tam eşleşme, kısmi eşleşme, büyük/küçük harf, özel karakterler)<br>3. Arama sonuçlarının doğruluğunu ve ilgisini değerlendir<br>4. Arama sonuçlarının sıralama ve filtreleme seçeneklerini test et<br>5. Arama önerilerini ve otomatik tamamlama özelliğini test et |
| Beklenen Sonuç | - Arama kutusu kolay bulunabilir olmalı<br>- Arama sonuçları doğru ve ilgili olmalı<br>- Arama sonuçları anlaşılır bir şekilde gösterilmeli<br>- Sıralama ve filtreleme seçenekleri çalışmalı<br>- Arama önerileri ve otomatik tamamlama yararlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. Sayfa İçi Gezinme Testi

| Test ID | UX-US-004 |
|---------|-----------|
| Test Adı | Sayfa İçi Gezinme Testi |
| Açıklama | Uzun sayfalarda sayfa içi gezinme özelliklerini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve uzun içerikli sayfalar bulunmalı |
| Test Adımları | 1. Uzun içerikli bir sayfaya git<br>2. Sayfa içi gezinme öğelerini (içindekiler tablosu, başa dön düğmesi, vb.) kontrol et<br>3. Sayfa içi bağlantıları kullanarak sayfanın farklı bölümlerine git<br>4. Sayfayı aşağı kaydırdıkça gezinme öğelerinin davranışını gözlemle |
| Beklenen Sonuç | - Sayfa içi gezinme öğeleri görünür ve kullanılabilir olmalı<br>- Sayfa içi bağlantılar doğru bölümlere yönlendirmeli<br>- Başa dön düğmesi sayfayı yukarı kaydırmalı<br>- Sayfa aşağı kaydırıldıkça gezinme öğeleri uygun şekilde davranmalı<br>- İçindekiler tablosu mevcut bölümü vurgulamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. Bilgi Mimarisi Değerlendirme Testi

| Test ID | UX-US-005 |
|---------|-----------|
| Test Adı | Bilgi Mimarisi Değerlendirme Testi |
| Açıklama | Sistemin bilgi mimarisinin mantıksal ve kullanıcı dostu olup olmadığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemin farklı bölümlerini keşfet<br>2. İçeriğin kategorilere ayrılmasını değerlendir<br>3. İlgili içeriklerin bir arada bulunup bulunmadığını kontrol et<br>4. Bilgiye ulaşmak için gereken tıklama sayısını ölç<br>5. Kullanıcıların sık kullandığı içeriklere kolay erişilebilirliği değerlendir |
| Beklenen Sonuç | - İçerik mantıksal kategorilere ayrılmış olmalı<br>- İlgili içerikler bir arada bulunmalı<br>- Önemli bilgilere ulaşmak için en fazla 3 tıklama gerekli olmalı<br>- Sık kullanılan içeriklere kolay erişilebilir olmalı<br>- Bilgi mimarisi kullanıcı beklentileriyle uyumlu olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Form ve Veri Giriş Test Senaryoları

### 3.1. Form Doldurma Testi

| Test ID | UX-US-006 |
|---------|-----------|
| Test Adı | Form Doldurma Testi |
| Açıklama | Sistemdeki formların kullanılabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki farklı formları belirle (kayıt formu, profil düzenleme formu, vb.)<br>2. Her formu doldur ve gönder<br>3. Form alanlarının etiketlerinin anlaşılırlığını değerlendir<br>4. Zorunlu alanların belirtilme şeklini kontrol et<br>5. Form doğrulama mesajlarının anlaşılırlığını değerlendir |
| Beklenen Sonuç | - Form alanları mantıksal bir sırada düzenlenmeli<br>- Form alanlarının etiketleri anlaşılır olmalı<br>- Zorunlu alanlar açıkça belirtilmeli<br>- Doğrulama mesajları anlaşılır ve yardımcı olmalı<br>- Form gönderimi kolay ve anlaşılır olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Veri Giriş Kolaylığı Testi

| Test ID | UX-US-007 |
|---------|-----------|
| Test Adı | Veri Giriş Kolaylığı Testi |
| Açıklama | Veri giriş mekanizmalarının kullanım kolaylığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Farklı veri giriş mekanizmalarını belirle (metin kutuları, açılır menüler, tarih seçiciler, vb.)<br>2. Her mekanizma ile veri girişi yap<br>3. Otomatik tamamlama özelliklerini test et<br>4. Varsayılan değerlerin uygunluğunu değerlendir<br>5. Veri formatı kısıtlamalarını ve yardımcı ipuçlarını kontrol et |
| Beklenen Sonuç | - Veri giriş mekanizmaları kullanımı kolay olmalı<br>- Otomatik tamamlama özellikleri doğru çalışmalı<br>- Varsayılan değerler mantıklı olmalı<br>- Veri formatı kısıtlamaları açıkça belirtilmeli<br>- Yardımcı ipuçları mevcut ve yararlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Hata Mesajları Testi

| Test ID | UX-US-008 |
|---------|-----------|
| Test Adı | Hata Mesajları Testi |
| Açıklama | Hata mesajlarının anlaşılırlığını ve yardımcı olma düzeyini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Çeşitli hatalara neden olacak işlemler gerçekleştir<br>2. Hata mesajlarının görünürlüğünü kontrol et<br>3. Hata mesajlarının anlaşılırlığını değerlendir<br>4. Hata mesajlarının çözüm önerip önermediğini kontrol et<br>5. Hata durumunda kullanıcının ne yapması gerektiğinin açıkça belirtilip belirtilmediğini değerlendir |
| Beklenen Sonuç | - Hata mesajları görünür olmalı<br>- Hata mesajları anlaşılır bir dille yazılmış olmalı<br>- Hata mesajları teknik jargon içermemeli<br>- Hata mesajları çözüm önerileri içermeli<br>- Kullanıcının ne yapması gerektiği açıkça belirtilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. Geri Bildirim ve Onay Mesajları Testi

| Test ID | UX-US-009 |
|---------|-----------|
| Test Adı | Geri Bildirim ve Onay Mesajları Testi |
| Açıklama | Sistem geri bildirimlerinin ve onay mesajlarının etkinliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Çeşitli işlemler gerçekleştir (form gönderimi, veri kaydetme, silme, vb.)<br>2. İşlem sonrası geri bildirimlerin görünürlüğünü kontrol et<br>3. Geri bildirimlerin anlaşılırlığını değerlendir<br>4. Kritik işlemler için onay iletişim kutularının varlığını kontrol et<br>5. Onay iletişim kutularının anlaşılırlığını değerlendir |
| Beklenen Sonuç | - İşlem sonrası geri bildirimler görünür olmalı<br>- Geri bildirimler anlaşılır olmalı<br>- Kritik işlemler için onay istenmelidir<br>- Onay iletişim kutuları açık ve anlaşılır olmalı<br>- Geri bildirimler işlemin başarılı olup olmadığını açıkça belirtmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.5. İlerleme Göstergeleri Testi

| Test ID | UX-US-010 |
|---------|-----------|
| Test Adı | İlerleme Göstergeleri Testi |
| Açıklama | İlerleme göstergelerinin etkinliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Uzun süren işlemleri başlat (dosya yükleme, rapor oluşturma, vb.)<br>2. İlerleme göstergelerinin varlığını kontrol et<br>3. İlerleme göstergelerinin doğruluğunu değerlendir<br>4. İlerleme göstergelerinin anlaşılırlığını değerlendir<br>5. İşlem tamamlandığında ilerleme göstergesinin davranışını gözlemle |
| Beklenen Sonuç | - Uzun süren işlemler için ilerleme göstergeleri bulunmalı<br>- İlerleme göstergeleri doğru ilerlemeyi göstermeli<br>- İlerleme göstergeleri anlaşılır olmalı<br>- Tahmini tamamlanma süresi gösterilmeli (mümkünse)<br>- İşlem tamamlandığında ilerleme göstergesi uygun şekilde kapanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Görev Tamamlama Test Senaryoları

### 4.1. Temel Görev Tamamlama Testi

| Test ID | UX-US-011 |
|---------|-----------|
| Test Adı | Temel Görev Tamamlama Testi |
| Açıklama | Kullanıcıların temel görevleri tamamlama kolaylığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Aşağıdaki temel görevleri belirle:<br>   - Kullanıcı profilini güncelleme<br>   - Yeni bir görüntü yükleme<br>   - Segmentasyon işi oluşturma<br>   - Sonuçları görüntüleme<br>   - Dosya indirme<br>2. Her görevi tamamlamak için gereken adımları say<br>3. Her görevin tamamlanma süresini ölç<br>4. Görevleri tamamlarken karşılaşılan zorlukları not et |
| Beklenen Sonuç | - Temel görevler en fazla 5 adımda tamamlanabilmeli<br>- Görevler makul bir sürede tamamlanabilmeli<br>- Görev adımları mantıksal ve sezgisel olmalı<br>- Kullanıcılar görevleri tamamlarken zorlanmamalı<br>- Görev tamamlama yolları tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Karmaşık Görev Tamamlama Testi

| Test ID | UX-US-012 |
|---------|-----------|
| Test Adı | Karmaşık Görev Tamamlama Testi |
| Açıklama | Kullanıcıların karmaşık görevleri tamamlama kolaylığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Aşağıdaki karmaşık görevleri belirle:<br>   - Toplu segmentasyon işi oluşturma<br>   - Özel parametrelerle segmentasyon yapma<br>   - Sonuçları filtreleme ve analiz etme<br>   - Rapor oluşturma<br>   - Veri arşivleme<br>2. Her görevi tamamlamak için gereken adımları say<br>3. Her görevin tamamlanma süresini ölç<br>4. Görevleri tamamlarken karşılaşılan zorlukları not et |
| Beklenen Sonuç | - Karmaşık görevler makul sayıda adımda tamamlanabilmeli<br>- Görevler makul bir sürede tamamlanabilmeli<br>- Görev adımları mantıksal ve anlaşılır olmalı<br>- Karmaşık görevler için yardım ve rehberlik mevcut olmalı<br>- Görev tamamlama yolları tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Görev Akışı Optimizasyonu Testi

| Test ID | UX-US-013 |
|---------|-----------|
| Test Adı | Görev Akışı Optimizasyonu Testi |
| Açıklama | Görev akışlarının optimizasyonunu ve verimliliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sık kullanılan görev akışlarını belirle<br>2. Her görev akışını tamamlamak için gereken adımları say<br>3. Gereksiz veya tekrarlayan adımları tespit et<br>4. Kısayolların ve hızlı erişim özelliklerinin varlığını kontrol et<br>5. Görev akışlarının kullanıcı beklentileriyle uyumunu değerlendir |
| Beklenen Sonuç | - Görev akışları gereksiz adımlar içermemeli<br>- Sık kullanılan görevler için kısayollar bulunmalı<br>- Tekrarlayan görevler için otomatikleştirme seçenekleri olmalı<br>- Görev akışları kullanıcı beklentileriyle uyumlu olmalı<br>- Görev akışları verimli ve mantıksal olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.4. Çoklu Görev Testi

| Test ID | UX-US-014 |
|---------|-----------|
| Test Adı | Çoklu Görev Testi |
| Açıklama | Kullanıcıların aynı anda birden fazla görevi yönetme kolaylığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Aynı anda birden fazla görevi başlat (örn. dosya yükleme, segmentasyon işi oluşturma, rapor görüntüleme)<br>2. Görevler arasında geçiş yapma kolaylığını değerlendir<br>3. Görevlerin durumlarının görünürlüğünü kontrol et<br>4. Bir görevden diğerine geçerken bağlamın korunup korunmadığını değerlendir<br>5. Çoklu görev yönetimi için yardımcı özelliklerin varlığını kontrol et |
| Beklenen Sonuç | - Kullanıcılar aynı anda birden fazla görevi yönetebilmeli<br>- Görevler arasında geçiş kolay olmalı<br>- Görevlerin durumları görünür olmalı<br>- Görevler arasında geçiş yaparken bağlam korunmalı<br>- Çoklu görev yönetimi için yardımcı özellikler bulunmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.5. Görev İptal ve Geri Alma Testi

| Test ID | UX-US-015 |
|---------|-----------|
| Test Adı | Görev İptal ve Geri Alma Testi |
| Açıklama | Görevleri iptal etme ve işlemleri geri alma kolaylığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Çeşitli görevleri başlat ve iptal et<br>2. İptal işleminin kolaylığını ve anlaşılırlığını değerlendir<br>3. Çeşitli işlemleri gerçekleştir ve geri al<br>4. Geri alma işleminin kolaylığını ve anlaşılırlığını değerlendir<br>5. İptal ve geri alma işlemlerinin sonuçlarını kontrol et |
| Beklenen Sonuç | - Görevleri iptal etmek kolay olmalı<br>- İptal işlemi açıkça belirtilmeli<br>- İşlemleri geri almak mümkün olmalı<br>- Geri alma işlemi açıkça belirtilmeli<br>- İptal ve geri alma işlemleri beklenen sonuçları üretmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
