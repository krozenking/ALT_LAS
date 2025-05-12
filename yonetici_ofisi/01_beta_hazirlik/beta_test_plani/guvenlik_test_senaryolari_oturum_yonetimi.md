# Güvenlik Test Senaryoları - Oturum Yönetimi

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Güvenlik Test Senaryoları - Oturum Yönetimi

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için oturum yönetimi güvenlik test senaryolarını içermektedir. Bu test senaryoları, sistemin oturum yönetimi mekanizmalarının güvenliğini değerlendirmek için kullanılacaktır.

## 2. Oturum Oluşturma Test Senaryoları

### 2.1. Oturum Token Güvenliği Testi

| Test ID | ST-SM-001 |
|---------|-----------|
| Test Adı | Oturum Token Güvenliği Testi |
| Açıklama | Oturum token'larının güvenliğini test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap ve oturum token'ını (çerez, JWT, vb.) elde et<br>2. Token'ın yapısını ve içeriğini incele<br>3. Token'ın tahmin edilebilirliğini değerlendir<br>4. Token'ın yeniden kullanılabilirliğini test et<br>5. Token'ın şifrelendiğini veya imzalandığını doğrula |
| Beklenen Sonuç | - Oturum token'ları yeterince uzun ve rastgele olmalı<br>- Token'lar tahmin edilemez olmalı<br>- Token'lar şifrelenmeli veya güvenli şekilde imzalanmalı<br>- Token'lar hassas bilgiler içermemeli veya bu bilgiler şifrelenmeli<br>- Token'lar yeniden oynatma saldırılarına karşı korumalı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Oturum Çerezleri Güvenliği Testi

| Test ID | ST-SM-002 |
|---------|-----------|
| Test Adı | Oturum Çerezleri Güvenliği Testi |
| Açıklama | Oturum çerezlerinin güvenlik ayarlarını test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap ve oturum çerezlerini incele<br>2. Çerezlerin güvenlik bayraklarını kontrol et (Secure, HttpOnly, SameSite)<br>3. Çerezlerin geçerlilik süresini kontrol et<br>4. Çerezlerin alan adı ve yol kısıtlamalarını kontrol et<br>5. JavaScript ile çerezlere erişmeyi dene |
| Beklenen Sonuç | - Oturum çerezleri Secure bayrağına sahip olmalı (yalnızca HTTPS)<br>- Oturum çerezleri HttpOnly bayrağına sahip olmalı (JavaScript erişimi engellenmeli)<br>- Oturum çerezleri SameSite bayrağına sahip olmalı (CSRF koruması)<br>- Çerezlerin geçerlilik süresi makul olmalı<br>- Çerezler alan adı ve yol kısıtlamalarına sahip olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Oturum Oluşturma Sonrası Yönlendirme Testi

| Test ID | ST-SM-003 |
|---------|-----------|
| Test Adı | Oturum Oluşturma Sonrası Yönlendirme Testi |
| Açıklama | Oturum oluşturma sonrası yönlendirmelerin güvenliğini test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. URL'de yönlendirme parametresi içeren giriş sayfasına git (örn. /login?redirect=https://example.com)<br>2. Kullanıcı girişi yap<br>3. Farklı yönlendirme hedefleri dene (harici siteler, JavaScript URL'leri, vb.)<br>4. Yönlendirme parametresini manipüle etmeyi dene |
| Beklenen Sonuç | - Yönlendirmeler yalnızca güvenilir ve izin verilen URL'lere yapılmalı<br>- Harici sitelere yönlendirmeler engellenmeli veya uyarı gösterilmeli<br>- JavaScript URL'lerine yönlendirmeler engellenmeli<br>- Yönlendirme parametresi manipülasyonları etkisiz olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Oturum Yönetimi Test Senaryoları

### 3.1. Oturum Zaman Aşımı Testi

| Test ID | ST-SM-004 |
|---------|-----------|
| Test Adı | Oturum Zaman Aşımı Testi |
| Açıklama | Oturum zaman aşımı mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. Belirli bir süre (oturum zaman aşımı süresinden fazla) hiçbir işlem yapmadan bekle<br>3. Oturumun durumunu kontrol et<br>4. Zaman aşımından sonra işlem yapmayı dene<br>5. Oturum zaman aşımı ayarlarını manipüle etmeyi dene |
| Beklenen Sonuç | - Oturum, belirli bir hareketsizlik süresinden sonra zaman aşımına uğramalı<br>- Zaman aşımından sonra kullanıcı yeniden giriş yapmalı<br>- Zaman aşımı süresi güvenlik politikalarına uygun olmalı<br>- Oturum zaman aşımı ayarları manipüle edilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Oturum Geçersiz Kılma Testi

| Test ID | ST-SM-005 |
|---------|-----------|
| Test Adı | Oturum Geçersiz Kılma Testi |
| Açıklama | Oturum geçersiz kılma mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Farklı tarayıcılardan veya cihazlardan aynı kullanıcı hesabı ile giriş yap<br>2. Bir oturumda çıkış yap<br>3. Diğer oturumların durumunu kontrol et<br>4. Bir oturumda parola değiştir<br>5. Diğer oturumların durumunu kontrol et |
| Beklenen Sonuç | - Çıkış yapıldığında yalnızca mevcut oturum geçersiz kılınmalı<br>- Parola değiştirildiğinde tüm aktif oturumlar geçersiz kılınmalı<br>- Kullanıcı, aktif oturumlarını görüntüleyebilmeli ve yönetebilmeli<br>- Geçersiz kılınan oturumlarla işlem yapılamamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Oturum Sabitlenmesi Testi

| Test ID | ST-SM-006 |
|---------|-----------|
| Test Adı | Oturum Sabitlenmesi Testi |
| Açıklama | Oturum sabitlenmesi (session fixation) saldırılarına karşı korumaları test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Giriş yapmadan önce oturum ID'sini not al<br>2. Bu oturum ID'si ile kullanıcı girişi yap<br>3. Giriş sonrası oturum ID'sinin değişip değişmediğini kontrol et<br>4. URL'de veya form alanında oturum ID'si belirterek giriş yapmayı dene |
| Beklenen Sonuç | - Kullanıcı girişi sonrası oturum ID'si yenilenmeli<br>- Önceden belirlenmiş oturum ID'leri kabul edilmemeli<br>- URL'de veya form alanında oturum ID'si belirtme denemeleri başarısız olmalı<br>- Oturum sabitlenmesi denemeleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Oturum Çalma Koruması Test Senaryoları

### 4.1. CSRF Koruması Testi

| Test ID | ST-SM-007 |
|---------|-----------|
| Test Adı | CSRF Koruması Testi |
| Açıklama | Cross-Site Request Forgery (CSRF) saldırılarına karşı korumaları test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. Form gönderen sayfaları incele ve CSRF token'larını kontrol et<br>3. CSRF token olmadan form göndermeyi dene<br>4. Geçersiz veya eski CSRF token ile form göndermeyi dene<br>5. Başka bir kullanıcının CSRF token'ı ile form göndermeyi dene |
| Beklenen Sonuç | - Durum değiştiren tüm işlemler CSRF token'ları içermeli<br>- CSRF token olmadan yapılan istekler reddedilmeli<br>- Geçersiz veya eski CSRF token'lar reddedilmeli<br>- CSRF token'lar kullanıcıya ve oturuma özgü olmalı<br>- SameSite çerez ayarları CSRF korumasını desteklemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. XSS Koruması Testi

| Test ID | ST-SM-008 |
|---------|-----------|
| Test Adı | XSS Koruması Testi |
| Açıklama | Cross-Site Scripting (XSS) saldırılarına karşı korumaları test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. Çeşitli form alanlarına XSS payload'ları gir<br>3. Kullanıcı tarafından oluşturulan içeriğe XSS payload'ları eklemeyi dene<br>4. URL parametrelerinde XSS payload'ları dene<br>5. DOM tabanlı XSS zafiyetlerini test et |
| Beklenen Sonuç | - XSS payload'ları etkisiz hale getirilmeli veya filtrelenmeli<br>- Kullanıcı tarafından oluşturulan içerik güvenli şekilde işlenmeli<br>- URL parametreleri XSS'e karşı korumalı olmalı<br>- DOM tabanlı XSS zafiyetleri bulunmamalı<br>- Content-Security-Policy başlığı XSS korumasını desteklemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Clickjacking Koruması Testi

| Test ID | ST-SM-009 |
|---------|-----------|
| Test Adı | Clickjacking Koruması Testi |
| Açıklama | Clickjacking saldırılarına karşı korumaları test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. Sayfayı iframe içinde yüklemeyi dene<br>3. X-Frame-Options ve Content-Security-Policy başlıklarını kontrol et<br>4. Frame busting JavaScript kodunu kontrol et |
| Beklenen Sonuç | - X-Frame-Options başlığı DENY veya SAMEORIGIN olarak ayarlanmalı<br>- Content-Security-Policy başlığı frame-ancestors direktifini içermeli<br>- Sayfalar iframe içinde yüklenememeli (izin verilen durumlar hariç)<br>- Frame busting JavaScript kodu uygulanmalı (yedek koruma olarak) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Oturum Bilgisi Koruması Test Senaryoları

### 5.1. Tarayıcı Önbelleği Koruması Testi

| Test ID | ST-SM-010 |
|---------|-----------|
| Test Adı | Tarayıcı Önbelleği Koruması Testi |
| Açıklama | Hassas oturum bilgilerinin tarayıcı önbelleğinde saklanmadığını test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. Hassas bilgiler içeren sayfaları ziyaret et<br>3. Tarayıcı önbelleğini incele<br>4. Tarayıcı geçmişini incele<br>5. Cache-Control ve Pragma başlıklarını kontrol et |
| Beklenen Sonuç | - Hassas bilgiler içeren sayfalar önbelleklenmemeli<br>- Cache-Control: no-store, no-cache, must-revalidate başlıkları ayarlanmalı<br>- Pragma: no-cache başlığı ayarlanmalı<br>- Tarayıcı geçmişinde hassas bilgiler görünmemeli<br>- Çıkış yapıldığında önbellek temizlenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Yerel Depolama Güvenliği Testi

| Test ID | ST-SM-011 |
|---------|-----------|
| Test Adı | Yerel Depolama Güvenliği Testi |
| Açıklama | Tarayıcı yerel depolama alanlarında (localStorage, sessionStorage) hassas bilgilerin saklanmadığını test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. localStorage ve sessionStorage içeriğini incele<br>3. Hassas bilgilerin (token'lar, kimlik bilgileri, vb.) depolanıp depolanmadığını kontrol et<br>4. Çıkış yapıldığında depolama alanlarının temizlenip temizlenmediğini kontrol et |
| Beklenen Sonuç | - Hassas bilgiler localStorage'da saklanmamalı<br>- sessionStorage'da saklanan hassas bilgiler şifrelenmeli<br>- Çıkış yapıldığında tüm hassas bilgiler temizlenmeli<br>- Oturum token'ları yerel depolama yerine HttpOnly çerezlerde saklanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Oturum Bilgisi Sızıntısı Testi

| Test ID | ST-SM-012 |
|---------|-----------|
| Test Adı | Oturum Bilgisi Sızıntısı Testi |
| Açıklama | Oturum bilgilerinin harici kaynaklara sızdırılmadığını test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Kullanıcı girişi yap<br>2. Ağ trafiğini izle ve harici kaynaklara yapılan istekleri incele<br>3. Referrer başlıklarını kontrol et<br>4. Harici JavaScript kütüphanelerinin oturum bilgilerine erişimini kontrol et<br>5. URL'lerde oturum bilgilerinin bulunup bulunmadığını kontrol et |
| Beklenen Sonuç | - Oturum bilgileri harici kaynaklara sızdırılmamalı<br>- Referrer-Policy başlığı güvenli bir değere ayarlanmalı<br>- Harici JavaScript kütüphaneleri oturum bilgilerine erişememeli<br>- URL'lerde oturum bilgileri bulunmamalı<br>- Content-Security-Policy başlığı veri sızıntısını önlemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Mobil Oturum Yönetimi Test Senaryoları

### 6.1. Mobil Uygulama Oturum Güvenliği Testi

| Test ID | ST-SM-013 |
|---------|-----------|
| Test Adı | Mobil Uygulama Oturum Güvenliği Testi |
| Açıklama | Mobil uygulamanın oturum yönetimi güvenliğini test etme |
| Ön Koşullar | Mobil uygulama yüklü olmalı ve kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Mobil uygulama ile kullanıcı girişi yap<br>2. Oturum token'larının nasıl saklandığını incele (güvenli depolama, keychain, vb.)<br>3. Uygulama arka plana alındığında oturum davranışını kontrol et<br>4. Cihaz yeniden başlatıldığında oturum davranışını kontrol et<br>5. Jailbreak/root erişimi olan cihazlarda oturum güvenliğini test et |
| Beklenen Sonuç | - Oturum token'ları güvenli depolama alanlarında saklanmalı<br>- Uygulama arka plana alındığında hassas veriler gizlenmeli<br>- Belirli bir süre sonra yeniden kimlik doğrulaması istenmeli<br>- Cihaz yeniden başlatıldığında oturum güvenli şekilde yönetilmeli<br>- Jailbreak/root erişimi algılanmalı ve ek güvenlik önlemleri alınmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Mobil API Oturum Yönetimi Testi

| Test ID | ST-SM-014 |
|---------|-----------|
| Test Adı | Mobil API Oturum Yönetimi Testi |
| Açıklama | Mobil uygulamanın API oturum yönetimi güvenliğini test etme |
| Ön Koşullar | Mobil uygulama yüklü olmalı ve kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Mobil uygulama ile kullanıcı girişi yap<br>2. API isteklerini ve yanıtlarını izle<br>3. API kimlik doğrulama mekanizmalarını incele<br>4. Token yenileme mekanizmalarını test et<br>5. API isteklerini manipüle etmeyi dene |
| Beklenen Sonuç | - API istekleri güvenli kimlik doğrulama mekanizmaları kullanmalı<br>- Token'lar güvenli şekilde iletilmeli ve yenilenmeli<br>- API yanıtları hassas bilgileri sızdırmamalı<br>- API istekleri manipülasyonları reddedilmeli<br>- API güvenlik kontrolleri web uygulamasıyla tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.3. Çoklu Cihaz Oturum Yönetimi Testi

| Test ID | ST-SM-015 |
|---------|-----------|
| Test Adı | Çoklu Cihaz Oturum Yönetimi Testi |
| Açıklama | Çoklu cihaz oturum yönetimi güvenliğini test etme |
| Ön Koşullar | Kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Farklı cihazlardan (web, mobil, tablet) aynı kullanıcı hesabı ile giriş yap<br>2. Bir cihazda oturumu sonlandır ve diğer cihazlardaki etkisini gözlemle<br>3. Bir cihazda parola değiştir ve diğer cihazlardaki etkisini gözlemle<br>4. Aktif oturumları görüntüleme ve yönetme özelliklerini test et |
| Beklenen Sonuç | - Çoklu cihaz oturumları doğru şekilde yönetilmeli<br>- Bir cihazda oturumu sonlandırmak diğer cihazları etkilememeli<br>- Parola değiştirildiğinde tüm cihazlardaki oturumlar sonlandırılmalı<br>- Kullanıcı, tüm aktif oturumlarını görüntüleyebilmeli ve yönetebilmeli<br>- Şüpheli oturum etkinlikleri tespit edilmeli ve bildirilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
