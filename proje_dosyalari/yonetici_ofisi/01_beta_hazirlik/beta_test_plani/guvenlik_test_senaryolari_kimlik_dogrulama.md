# Güvenlik Test Senaryoları - Kimlik Doğrulama ve Yetkilendirme

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Güvenlik Test Senaryoları - Kimlik Doğrulama ve Yetkilendirme

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için kimlik doğrulama ve yetkilendirme güvenlik test senaryolarını içermektedir. Bu test senaryoları, sistemin kimlik doğrulama ve yetkilendirme mekanizmalarının güvenliğini değerlendirmek için kullanılacaktır.

## 2. Kimlik Doğrulama Test Senaryoları

### 2.1. Kaba Kuvvet Saldırısı Testi

| Test ID | ST-AU-001 |
|---------|-----------|
| Test Adı | Kaba Kuvvet Saldırısı Testi |
| Açıklama | Giriş sayfasına kaba kuvvet saldırısı gerçekleştirerek hesap kilitleme ve saldırı tespit mekanizmalarını test etme |
| Ön Koşullar | Test kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Giriş sayfasına git<br>2. Doğru kullanıcı adı ve yanlış parola ile 5 kez giriş yapmayı dene<br>3. Aynı IP adresinden farklı kullanıcı adları ve parolalar ile 20 kez giriş yapmayı dene<br>4. Otomatik araçlar (Burp Suite, OWASP ZAP) kullanarak kaba kuvvet saldırısı gerçekleştir |
| Beklenen Sonuç | - Belirli sayıda başarısız giriş denemesinden sonra hesap geçici olarak kilitlenmeli<br>- Belirli sayıda başarısız giriş denemesinden sonra CAPTCHA veya benzer bir mekanizma devreye girmeli<br>- Şüpheli giriş denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Parola Politikası Testi

| Test ID | ST-AU-002 |
|---------|-----------|
| Test Adı | Parola Politikası Testi |
| Açıklama | Parola politikasının etkinliğini test etme |
| Ön Koşullar | Kullanıcı kayıt sayfası veya parola değiştirme sayfası erişilebilir olmalı |
| Test Adımları | 1. Kullanıcı kayıt sayfasına veya parola değiştirme sayfasına git<br>2. Aşağıdaki zayıf parolaları deneyerek kayıt olmayı veya parola değiştirmeyi dene:<br>   - Çok kısa parola (123)<br>   - Sadece sayılardan oluşan parola (12345678)<br>   - Sadece harflerden oluşan parola (password)<br>   - Sözlükte bulunan parola (welcome)<br>   - Kullanıcı adı ile aynı parola<br>   - Yaygın parolalar (admin123, qwerty) |
| Beklenen Sonuç | - Zayıf parolalar reddedilmeli<br>- Parola politikası gereksinimleri (minimum uzunluk, karmaşıklık, vb.) kullanıcıya açıkça bildirilmeli<br>- Parola gücü göstergesi doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Parola Sıfırlama Testi

| Test ID | ST-AU-003 |
|---------|-----------|
| Test Adı | Parola Sıfırlama Testi |
| Açıklama | Parola sıfırlama mekanizmasının güvenliğini test etme |
| Ön Koşullar | Test kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Parola sıfırlama sayfasına git<br>2. Test kullanıcısının e-posta adresini gir<br>3. Parola sıfırlama e-postasını al<br>4. E-postadaki bağlantıya tıkla<br>5. Yeni parola belirle<br>6. Aşağıdaki güvenlik açıklarını test et:<br>   - Parola sıfırlama token'ının tekrar kullanılabilirliği<br>   - Token'ın tahmin edilebilirliği<br>   - Token'ın süresi<br>   - Kullanıcı doğrulama olmadan parola sıfırlama |
| Beklenen Sonuç | - Parola sıfırlama token'ı güvenli (yeterince uzun ve rastgele) olmalı<br>- Token belirli bir süre sonra geçersiz olmalı<br>- Token yalnızca bir kez kullanılabilmeli<br>- Parola sıfırlama işlemi kullanıcıya e-posta ile bildirilmeli<br>- Parola sıfırlama sayfası brute force saldırılarına karşı korumalı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. Çoklu Oturum Testi

| Test ID | ST-AU-004 |
|---------|-----------|
| Test Adı | Çoklu Oturum Testi |
| Açıklama | Aynı kullanıcı için çoklu oturum yönetimini test etme |
| Ön Koşullar | Test kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. Farklı tarayıcılardan veya cihazlardan aynı kullanıcı hesabı ile giriş yap<br>2. Bir oturumda parola değiştir<br>3. Diğer oturumların durumunu kontrol et<br>4. Bir oturumda çıkış yap ve diğer oturumların durumunu kontrol et |
| Beklenen Sonuç | - Sistem çoklu oturumları doğru şekilde yönetmeli<br>- Parola değiştirildiğinde tüm aktif oturumlar sonlandırılmalı veya yeniden kimlik doğrulaması istenmeli<br>- Kullanıcı, aktif oturumlarını görüntüleyebilmeli ve yönetebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. Sosyal Mühendislik Testi

| Test ID | ST-AU-005 |
|---------|-----------|
| Test Adı | Sosyal Mühendislik Testi |
| Açıklama | Kullanıcı bilgilerini elde etmek için sosyal mühendislik tekniklerinin etkinliğini test etme |
| Ön Koşullar | Destek ekibi ve kullanıcılar test hakkında bilgilendirilmiş olmalı |
| Test Adımları | 1. Destek ekibini arayarak veya e-posta göndererek kullanıcı bilgilerini elde etmeye çalış<br>2. "Parola unuttum" fonksiyonunu kullanarak güvenlik sorularını tahmin etmeye çalış<br>3. Sahte giriş sayfası oluşturarak phishing saldırısı gerçekleştir |
| Beklenen Sonuç | - Destek ekibi kullanıcı bilgilerini vermemeli ve uygun kimlik doğrulama prosedürlerini izlemeli<br>- Güvenlik soruları tahmin edilemez olmalı<br>- Kullanıcılar phishing saldırılarına karşı eğitilmiş olmalı<br>- Sistem, phishing saldırılarını tespit etmek için mekanizmalara sahip olmalı (örn. HTTP Referer kontrolü) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Yetkilendirme Test Senaryoları

### 3.1. Yatay Yetki Yükseltme Testi

| Test ID | ST-AZ-001 |
|---------|-----------|
| Test Adı | Yatay Yetki Yükseltme Testi |
| Açıklama | Bir kullanıcının diğer kullanıcıların verilerine erişimini test etme |
| Ön Koşullar | İki farklı test kullanıcı hesabı oluşturulmuş olmalı |
| Test Adımları | 1. İlk kullanıcı hesabı ile giriş yap<br>2. Kullanıcıya özel bir kaynağın URL'sini veya ID'sini not al (örn. /api/v1/users/123/profile)<br>3. İkinci kullanıcı hesabı ile giriş yap<br>4. İlk kullanıcının kaynağına erişmeyi dene (URL'yi değiştirerek veya API istekleri göndererek)<br>5. Farklı HTTP metodları (GET, POST, PUT, DELETE) ile dene |
| Beklenen Sonuç | - Bir kullanıcı, diğer kullanıcıların verilerine erişememeli<br>- Yetkilendirme kontrolleri tüm HTTP metodları için uygulanmalı<br>- Yetkisiz erişim denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Dikey Yetki Yükseltme Testi

| Test ID | ST-AZ-002 |
|---------|-----------|
| Test Adı | Dikey Yetki Yükseltme Testi |
| Açıklama | Düşük yetkili bir kullanıcının yüksek yetkili işlemlere erişimini test etme |
| Ön Koşullar | Farklı yetki seviyelerine sahip test kullanıcı hesapları oluşturulmuş olmalı (normal kullanıcı, yönetici) |
| Test Adımları | 1. Normal kullanıcı hesabı ile giriş yap<br>2. Yönetici paneline veya yönetici işlevlerine erişmeyi dene (URL'leri doğrudan ziyaret ederek veya API istekleri göndererek)<br>3. Yönetici hesabı ile giriş yap ve yönetici işlevlerinin URL'lerini veya API endpoint'lerini not al<br>4. Normal kullanıcı hesabı ile giriş yap ve not alınan URL'lere veya API endpoint'lerine erişmeyi dene |
| Beklenen Sonuç | - Normal kullanıcı, yönetici işlevlerine erişememeli<br>- Yetkilendirme kontrolleri hem sunucu tarafında hem de istemci tarafında uygulanmalı<br>- Yetkisiz erişim denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. İşlev Seviyesi Yetkilendirme Testi

| Test ID | ST-AZ-003 |
|---------|-----------|
| Test Adı | İşlev Seviyesi Yetkilendirme Testi |
| Açıklama | Kullanıcıların yalnızca yetkili oldukları işlevlere erişebildiğini test etme |
| Ön Koşullar | Farklı yetki seviyelerine sahip test kullanıcı hesapları oluşturulmuş olmalı |
| Test Adımları | 1. Farklı yetki seviyelerine sahip kullanıcılar ile giriş yap<br>2. Her kullanıcı için erişilebilir ve erişilemez işlevleri belirle<br>3. Her kullanıcı için erişilemez işlevlere erişmeyi dene<br>4. Gizli işlevleri keşfetmeye çalış (örn. HTML kaynak kodunu inceleyerek, JavaScript dosyalarını analiz ederek) |
| Beklenen Sonuç | - Kullanıcılar yalnızca yetkili oldukları işlevlere erişebilmeli<br>- Yetkisiz işlevler kullanıcı arayüzünde görünmemeli<br>- Gizli işlevler de yetkilendirme kontrollerine tabi olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. Veri Seviyesi Yetkilendirme Testi

| Test ID | ST-AZ-004 |
|---------|-----------|
| Test Adı | Veri Seviyesi Yetkilendirme Testi |
| Açıklama | Kullanıcıların yalnızca yetkili oldukları verilere erişebildiğini test etme |
| Ön Koşullar | Farklı kullanıcılara ait test verileri oluşturulmuş olmalı |
| Test Adımları | 1. Farklı kullanıcılar ile giriş yap<br>2. Her kullanıcı için erişilebilir ve erişilemez verileri belirle<br>3. Her kullanıcı için erişilemez verilere erişmeyi dene (URL manipülasyonu, API istekleri, vb.)<br>4. Toplu veri işlemleri sırasında yetkilendirme kontrollerini test et (örn. toplu silme, toplu güncelleme) |
| Beklenen Sonuç | - Kullanıcılar yalnızca yetkili oldukları verilere erişebilmeli<br>- Toplu işlemler sırasında da yetkilendirme kontrolleri uygulanmalı<br>- Yetkisiz veri erişim denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.5. JWT Token Güvenliği Testi

| Test ID | ST-AZ-005 |
|---------|-----------|
| Test Adı | JWT Token Güvenliği Testi |
| Açıklama | JWT token'larının güvenliğini test etme |
| Ön Koşullar | Sistem JWT token'ları kullanmalı |
| Test Adımları | 1. Kullanıcı girişi yaparak geçerli bir JWT token al<br>2. Token'ı decode ederek içeriğini incele<br>3. Token'ı manipüle etmeyi dene (yetki seviyesini değiştirme, kullanıcı ID'sini değiştirme, vb.)<br>4. Süresi dolmuş token ile istekler göndermeyi dene<br>5. Token'ı farklı bir kullanıcı için kullanmayı dene |
| Beklenen Sonuç | - JWT token'ları güvenli bir şekilde imzalanmalı<br>- Token manipülasyonları reddedilmeli<br>- Süresi dolmuş token'lar reddedilmeli<br>- Token'lar yeterli güvenlik bilgilerini içermeli (kullanıcı ID, yetki seviyesi, süre, vb.)<br>- Token'lar güvenli bir şekilde iletilmeli (HTTPS, httpOnly çerezler) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
