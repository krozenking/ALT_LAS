# Kullanıcı Deneyimi Test Senaryoları - Erişilebilirlik

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Kullanıcı Deneyimi Test Senaryoları - Erişilebilirlik

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için erişilebilirlik test senaryolarını içermektedir. Bu test senaryoları, sistemin farklı yeteneklere sahip kullanıcılar tarafından erişilebilir olup olmadığını değerlendirmek için kullanılacaktır.

## 2. Klavye Erişilebilirliği Test Senaryoları

### 2.1. Klavye Gezinme Testi

| Test ID | UX-AC-001 |
|---------|-----------|
| Test Adı | Klavye Gezinme Testi |
| Açıklama | Sistemin yalnızca klavye kullanarak gezinilebilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Fareyi kullanmadan, yalnızca Tab, Shift+Tab, Enter ve ok tuşlarını kullanarak sisteme eriş<br>2. Tüm etkileşimli öğelere (bağlantılar, düğmeler, form öğeleri) klavye ile erişilebilirliği kontrol et<br>3. Klavye odağının görsel olarak belirtilip belirtilmediğini kontrol et<br>4. Klavye tuzaklarının (keyboard traps) olup olmadığını kontrol et<br>5. Klavye kısayollarının varlığını ve işlevselliğini test et |
| Beklenen Sonuç | - Tüm etkileşimli öğelere klavye ile erişilebilmeli<br>- Klavye odağı görsel olarak belirtilmeli<br>- Klavye tuzakları olmamalı<br>- Klavye gezinme sırası mantıksal olmalı<br>- Klavye kısayolları mevcut ve işlevsel olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Klavye Odağı Görünürlüğü Testi

| Test ID | UX-AC-002 |
|---------|-----------|
| Test Adı | Klavye Odağı Görünürlüğü Testi |
| Açıklama | Klavye odağının görsel olarak belirtilme durumunu test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Tab tuşunu kullanarak sistemdeki farklı öğeler arasında gezin<br>2. Her öğe odaklandığında görsel bir göstergenin (kenarlık, vurgulama, vb.) olup olmadığını kontrol et<br>3. Odak göstergesinin görünürlüğünü ve belirginliğini değerlendir<br>4. Odak göstergesinin tutarlılığını kontrol et<br>5. Özel bileşenlerde (özel açılır menüler, sekmeler, vb.) odak göstergesinin davranışını test et |
| Beklenen Sonuç | - Her öğe odaklandığında görsel bir gösterge olmalı<br>- Odak göstergesi yeterince görünür ve belirgin olmalı<br>- Odak göstergesi tüm sistemde tutarlı olmalı<br>- Özel bileşenlerde de odak göstergesi doğru çalışmalı<br>- Odak göstergesi varsayılan tarayıcı davranışını geçersiz kılmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Klavye Kısayolları Testi

| Test ID | UX-AC-003 |
|---------|-----------|
| Test Adı | Klavye Kısayolları Testi |
| Açıklama | Sistemdeki klavye kısayollarının işlevselliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki klavye kısayollarını belirle (dokümantasyon veya yardım bölümünden)<br>2. Her klavye kısayolunu test et<br>3. Klavye kısayollarının tutarlılığını kontrol et<br>4. Klavye kısayollarının çakışma durumunu test et<br>5. Klavye kısayollarının özelleştirilebilirliğini kontrol et |
| Beklenen Sonuç | - Klavye kısayolları doğru çalışmalı<br>- Klavye kısayolları tutarlı olmalı<br>- Klavye kısayolları arasında çakışma olmamalı<br>- Klavye kısayolları özelleştirilebilir olmalı (mümkünse)<br>- Klavye kısayolları dokümante edilmiş olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Ekran Okuyucu Erişilebilirliği Test Senaryoları

### 3.1. Ekran Okuyucu Uyumluluğu Testi

| Test ID | UX-AC-004 |
|---------|-----------|
| Test Adı | Ekran Okuyucu Uyumluluğu Testi |
| Açıklama | Sistemin ekran okuyucularla uyumluluğunu test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve ekran okuyucu yazılımı (NVDA, JAWS, VoiceOver) yüklü olmalı |
| Test Adımları | 1. Ekran okuyucuyu etkinleştir<br>2. Sistemin ana sayfasını ve temel işlevlerini ekran okuyucu ile gezin<br>3. Ekran okuyucunun içeriği doğru şekilde okuduğunu kontrol et<br>4. Etkileşimli öğelerin ekran okuyucu tarafından doğru tanımlandığını kontrol et<br>5. Dinamik içerik değişikliklerinin ekran okuyucuya bildirildiğini kontrol et |
| Beklenen Sonuç | - Ekran okuyucu içeriği doğru şekilde okumalı<br>- Etkileşimli öğeler ekran okuyucu tarafından doğru tanımlanmalı<br>- Dinamik içerik değişiklikleri ekran okuyucuya bildirilmeli<br>- Ekran okuyucu ile tüm işlevlere erişilebilmeli<br>- Farklı ekran okuyucularla uyumluluk sağlanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. ARIA Öznitelikleri Testi

| Test ID | UX-AC-005 |
|---------|-----------|
| Test Adı | ARIA Öznitelikleri Testi |
| Açıklama | ARIA (Accessible Rich Internet Applications) özniteliklerinin doğru kullanımını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve ekran okuyucu yazılımı yüklü olmalı |
| Test Adımları | 1. Sayfanın HTML kodunu incele ve ARIA özniteliklerini belirle<br>2. ARIA landmark'larının (banner, navigation, main, complementary, contentinfo) doğru kullanımını kontrol et<br>3. ARIA rol özniteliklerinin doğru kullanımını kontrol et<br>4. ARIA durum ve özellik özniteliklerinin doğru kullanımını kontrol et<br>5. Dinamik içerik için ARIA live bölgelerinin kullanımını test et |
| Beklenen Sonuç | - ARIA landmark'ları doğru kullanılmalı<br>- ARIA rol öznitelikleri doğru kullanılmalı<br>- ARIA durum ve özellik öznitelikleri doğru kullanılmalı<br>- Dinamik içerik için ARIA live bölgeleri kullanılmalı<br>- ARIA öznitelikleri HTML5 semantik öğeleriyle uyumlu olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Alternatif Metin Testi

| Test ID | UX-AC-006 |
|---------|-----------|
| Test Adı | Alternatif Metin Testi |
| Açıklama | Görsel öğeler için alternatif metin kullanımını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve ekran okuyucu yazılımı yüklü olmalı |
| Test Adımları | 1. Sistemdeki görsel öğeleri (resimler, ikonlar, grafikler) belirle<br>2. Her görsel öğe için alternatif metin varlığını kontrol et<br>3. Alternatif metinlerin içeriği doğru ve anlamlı şekilde tanımlayıp tanımlamadığını değerlendir<br>4. Dekoratif görsel öğelerin boş alternatif metin (alt="") kullanıp kullanmadığını kontrol et<br>5. Karmaşık görseller (grafikler, şemalar) için daha detaylı açıklamaların varlığını kontrol et |
| Beklenen Sonuç | - Tüm anlamlı görsel öğeler için alternatif metin bulunmalı<br>- Alternatif metinler içeriği doğru ve anlamlı şekilde tanımlamalı<br>- Dekoratif görsel öğeler boş alternatif metin kullanmalı<br>- Karmaşık görseller için daha detaylı açıklamalar bulunmalı<br>- Alternatif metinler kısa ve öz olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Görsel Erişilebilirlik Test Senaryoları

### 4.1. Renk Kontrastı Testi

| Test ID | UX-AC-007 |
|---------|-----------|
| Test Adı | Renk Kontrastı Testi |
| Açıklama | Metin ve arka plan arasındaki renk kontrastını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki farklı metin ve arka plan renk kombinasyonlarını belirle<br>2. Her kombinasyon için kontrast oranını ölç (kontrast analiz aracı kullanarak)<br>3. Ölçülen kontrast oranlarını WCAG 2.1 AA standardı ile karşılaştır (normal metin için 4.5:1, büyük metin için 3:1)<br>4. Düşük kontrastlı alanları tespit et<br>5. Yüksek kontrast modu etkinken görünümü kontrol et (mümkünse) |
| Beklenen Sonuç | - Normal metin için kontrast oranı en az 4.5:1 olmalı<br>- Büyük metin için kontrast oranı en az 3:1 olmalı<br>- Etkileşimli öğeler ve grafik nesneleri için kontrast oranı en az 3:1 olmalı<br>- Düşük kontrastlı alan bulunmamalı<br>- Yüksek kontrast modunda içerik okunabilir olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Metin Boyutu ve Yakınlaştırma Testi

| Test ID | UX-AC-008 |
|---------|-----------|
| Test Adı | Metin Boyutu ve Yakınlaştırma Testi |
| Açıklama | Metin boyutu değişikliklerine ve sayfa yakınlaştırmaya sistemin tepkisini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Tarayıcı metin boyutunu artır (Ctrl + veya tarayıcı ayarlarından)<br>2. Sayfayı yakınlaştır (%125, %150, %200)<br>3. Metin boyutu artırıldığında ve sayfa yakınlaştırıldığında içeriğin okunabilirliğini kontrol et<br>4. İçeriğin kesilmediğini, üst üste binmediğini veya kaybolmadığını doğrula<br>5. Yatay kaydırma çubuğunun %200 yakınlaştırmaya kadar oluşmadığını kontrol et |
| Beklenen Sonuç | - Metin boyutu artırıldığında içerik okunabilir kalmalı<br>- Sayfa yakınlaştırıldığında içerik okunabilir kalmalı<br>- İçerik kesilmemeli, üst üste binmemeli veya kaybolmamalı<br>- %200 yakınlaştırmaya kadar yatay kaydırma çubuğu oluşmamalı<br>- Sayfa düzeni yakınlaştırma ile bozulmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Renk Körlüğü Simülasyonu Testi

| Test ID | UX-AC-009 |
|---------|-----------|
| Test Adı | Renk Körlüğü Simülasyonu Testi |
| Açıklama | Farklı renk körlüğü türleri için sistemin kullanılabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı ve renk körlüğü simülasyon aracı mevcut olmalı |
| Test Adımları | 1. Renk körlüğü simülasyon aracını kullanarak sistemi farklı renk körlüğü türlerinde görüntüle (protanopia, deuteranopia, tritanopia, achromatopsia)<br>2. Her simülasyonda içeriğin okunabilirliğini kontrol et<br>3. Renk ile iletilen bilgilerin renk olmadan da anlaşılabilir olup olmadığını kontrol et<br>4. Grafik ve görsellerin renk körlüğü durumunda anlaşılabilirliğini değerlendir<br>5. Hata mesajları ve uyarıların renk körlüğü durumunda ayırt edilebilirliğini kontrol et |
| Beklenen Sonuç | - İçerik tüm renk körlüğü türlerinde okunabilir olmalı<br>- Renk ile iletilen bilgiler renk olmadan da anlaşılabilir olmalı (metin, simge, desen vb. ile desteklenmeli)<br>- Grafik ve görseller renk körlüğü durumunda anlaşılabilir olmalı<br>- Hata mesajları ve uyarılar renk körlüğü durumunda ayırt edilebilir olmalı<br>- Renk, bilgi iletmek için tek başına kullanılmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Motor Beceri Erişilebilirliği Test Senaryoları

### 5.1. Tıklanabilir Alan Boyutu Testi

| Test ID | UX-AC-010 |
|---------|-----------|
| Test Adı | Tıklanabilir Alan Boyutu Testi |
| Açıklama | Tıklanabilir öğelerin boyutunun yeterli olup olmadığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki tıklanabilir öğeleri (düğmeler, bağlantılar, simgeler, vb.) belirle<br>2. Her tıklanabilir öğenin boyutunu ölç<br>3. Tıklanabilir öğelerin minimum 44x44 piksel boyutunda olup olmadığını kontrol et<br>4. Küçük tıklanabilir öğeleri tespit et<br>5. Mobil cihazlarda tıklanabilir öğelerin kullanılabilirliğini test et |
| Beklenen Sonuç | - Tıklanabilir öğeler minimum 44x44 piksel boyutunda olmalı<br>- Küçük tıklanabilir öğe bulunmamalı<br>- Tıklanabilir öğeler arasında yeterli boşluk olmalı<br>- Mobil cihazlarda tıklanabilir öğeler parmakla kolayca seçilebilmeli<br>- Tıklanabilir alanın görsel göstergesi ile gerçek tıklanabilir alan eşleşmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Zamanlama ve Otomatik İçerik Testi

| Test ID | UX-AC-011 |
|---------|-----------|
| Test Adı | Zamanlama ve Otomatik İçerik Testi |
| Açıklama | Zamanlı işlemlerin ve otomatik değişen içeriğin erişilebilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki zamanlı işlemleri belirle (oturum zaman aşımı, formlar, vb.)<br>2. Otomatik değişen içerikleri belirle (slayt gösterileri, bildirimler, vb.)<br>3. Zamanlı işlemleri durdurma, uzatma veya devre dışı bırakma seçeneklerinin varlığını kontrol et<br>4. Otomatik değişen içerikleri durdurma, duraklatma veya gizleme seçeneklerinin varlığını kontrol et<br>5. Zamanlı işlemler ve otomatik içerik için verilen sürelerin yeterliliğini değerlendir |
| Beklenen Sonuç | - Zamanlı işlemleri durdurma, uzatma veya devre dışı bırakma seçenekleri bulunmalı<br>- Otomatik değişen içerikleri durdurma, duraklatma veya gizleme seçenekleri bulunmalı<br>- Zamanlı işlemler için verilen süreler yeterli olmalı<br>- Otomatik içerik kullanıcıyı rahatsız etmemeli<br>- Kritik işlemler için zaman sınırı olmamalı veya uzatılabilir olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Hareket ve Titreşim Testi

| Test ID | UX-AC-012 |
|---------|-----------|
| Test Adı | Hareket ve Titreşim Testi |
| Açıklama | Sistemdeki hareket ve titreşim içeren öğelerin erişilebilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki hareket içeren öğeleri belirle (animasyonlar, video, hareketli grafikler)<br>2. Titreşim veya yanıp sönme içeren öğeleri belirle<br>3. Hareket ve titreşimleri durdurma, duraklatma veya gizleme seçeneklerinin varlığını kontrol et<br>4. Saniyede üç kereden fazla yanıp sönen içerik olup olmadığını kontrol et<br>5. Hareket ve titreşimlerin kullanıcı deneyimine etkisini değerlendir |
| Beklenen Sonuç | - Hareket ve titreşimleri durdurma, duraklatma veya gizleme seçenekleri bulunmalı<br>- Saniyede üç kereden fazla yanıp sönen içerik bulunmamalı<br>- Hareket ve titreşimler kullanıcıyı rahatsız etmemeli<br>- İşletim sistemi hareket azaltma ayarlarına uyum sağlanmalı<br>- Hareket ve titreşimler bilgi iletmek için tek başına kullanılmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Bilişsel Erişilebilirlik Test Senaryoları

### 6.1. Dil ve Okunabilirlik Testi

| Test ID | UX-AC-013 |
|---------|-----------|
| Test Adı | Dil ve Okunabilirlik Testi |
| Açıklama | Sistemdeki dilin anlaşılabilirliğini ve okunabilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki metinleri incele<br>2. Metinlerin anlaşılabilirliğini değerlendir (teknik jargon, karmaşık cümleler, vb.)<br>3. Sayfa dilinin HTML lang özniteliği ile belirtilip belirtilmediğini kontrol et<br>4. Dil değişikliklerinin (yabancı kelimeler, terimler) uygun şekilde işaretlenip işaretlenmediğini kontrol et<br>5. Kısaltmaların ve teknik terimlerin açıklamalarının varlığını kontrol et |
| Beklenen Sonuç | - Metinler anlaşılabilir olmalı<br>- Teknik jargon ve karmaşık cümleler minimumda tutulmalı<br>- Sayfa dili HTML lang özniteliği ile belirtilmeli<br>- Dil değişiklikleri uygun şekilde işaretlenmeli<br>- Kısaltmalar ve teknik terimler açıklanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Tahmin Edilebilirlik ve Tutarlılık Testi

| Test ID | UX-AC-014 |
|---------|-----------|
| Test Adı | Tahmin Edilebilirlik ve Tutarlılık Testi |
| Açıklama | Sistemin tahmin edilebilirliğini ve tutarlılığını test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki gezinme mekanizmalarının tutarlılığını kontrol et<br>2. Etkileşimli öğelerin davranışlarının tahmin edilebilirliğini değerlendir<br>3. Beklenmedik otomatik değişikliklerin varlığını kontrol et<br>4. Form alanlarının etiketlenmesinin tutarlılığını kontrol et<br>5. Hata mesajlarının ve geri bildirimlerin tutarlılığını değerlendir |
| Beklenen Sonuç | - Gezinme mekanizmaları tutarlı olmalı<br>- Etkileşimli öğelerin davranışları tahmin edilebilir olmalı<br>- Beklenmedik otomatik değişiklikler olmamalı<br>- Form alanları tutarlı şekilde etiketlenmeli<br>- Hata mesajları ve geri bildirimler tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.3. Yardım ve Dokümantasyon Testi

| Test ID | UX-AC-015 |
|---------|-----------|
| Test Adı | Yardım ve Dokümantasyon Testi |
| Açıklama | Sistemdeki yardım ve dokümantasyon özelliklerinin erişilebilirliğini test etme |
| Ön Koşullar | Kullanıcı giriş yapmış olmalı |
| Test Adımları | 1. Sistemdeki yardım ve dokümantasyon özelliklerini belirle<br>2. Yardım ve dokümantasyona erişim kolaylığını değerlendir<br>3. Yardım ve dokümantasyon içeriğinin anlaşılabilirliğini kontrol et<br>4. Bağlam duyarlı yardım özelliklerinin varlığını kontrol et<br>5. Yardım ve dokümantasyonun erişilebilirlik özelliklerini test et |
| Beklenen Sonuç | - Yardım ve dokümantasyona kolay erişilebilmeli<br>- Yardım ve dokümantasyon içeriği anlaşılabilir olmalı<br>- Bağlam duyarlı yardım özellikleri bulunmalı<br>- Yardım ve dokümantasyon erişilebilirlik standartlarına uygun olmalı<br>- Yardım ve dokümantasyon güncel olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
