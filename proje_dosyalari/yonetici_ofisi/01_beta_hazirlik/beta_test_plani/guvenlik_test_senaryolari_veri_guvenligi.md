# Güvenlik Test Senaryoları - Veri Güvenliği

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Güvenlik Test Senaryoları - Veri Güvenliği

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için veri güvenliği test senaryolarını içermektedir. Bu test senaryoları, sistemdeki verilerin güvenliğini değerlendirmek için kullanılacaktır.

## 2. Veri Şifreleme Test Senaryoları

### 2.1. İletim Sırasında Veri Şifreleme Testi

| Test ID | ST-DS-001 |
|---------|-----------|
| Test Adı | İletim Sırasında Veri Şifreleme Testi |
| Açıklama | Verilerin iletim sırasında şifrelendiğini test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Wireshark veya benzer bir ağ analiz aracı kullanarak ağ trafiğini yakala<br>2. Kullanıcı girişi yap ve hassas işlemler gerçekleştir (parola değiştirme, kişisel bilgi güncelleme, vb.)<br>3. Yakalanan trafiği analiz et<br>4. SSL/TLS yapılandırmasını test et (SSL Labs, testssl.sh gibi araçlarla) |
| Beklenen Sonuç | - Tüm trafik HTTPS üzerinden iletilmeli<br>- Hassas veriler (parolalar, kişisel bilgiler, vb.) şifreli olarak iletilmeli<br>- Güçlü şifreleme protokolleri ve şifreleme paketleri kullanılmalı (TLS 1.2+)<br>- Zayıf şifreleme paketleri devre dışı bırakılmalı<br>- HSTS (HTTP Strict Transport Security) etkinleştirilmiş olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Depolama Sırasında Veri Şifreleme Testi

| Test ID | ST-DS-002 |
|---------|-----------|
| Test Adı | Depolama Sırasında Veri Şifreleme Testi |
| Açıklama | Hassas verilerin depolama sırasında şifrelendiğini test etme |
| Ön Koşullar | Veritabanı erişimi mevcut olmalı |
| Test Adımları | 1. Veritabanına doğrudan erişim sağla<br>2. Hassas veri içeren tabloları sorgula (kullanıcılar, kimlik bilgileri, vb.)<br>3. Hassas verilerin nasıl depolandığını incele<br>4. Şifreleme anahtarlarının nasıl yönetildiğini incele |
| Beklenen Sonuç | - Parolalar güçlü bir şekilde hash'lenmeli (bcrypt, Argon2 gibi)<br>- Kişisel tanımlayıcı bilgiler (PII) şifrelenmiş olmalı<br>- Ödeme bilgileri gibi çok hassas veriler şifrelenmiş olmalı<br>- Şifreleme anahtarları güvenli bir şekilde yönetilmeli<br>- Veritabanı yedeklemeleri de şifrelenmiş olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. Veri Maskeleme Testi

| Test ID | ST-DS-003 |
|---------|-----------|
| Test Adı | Veri Maskeleme Testi |
| Açıklama | Hassas verilerin kullanıcı arayüzünde ve günlüklerde maskelendiğini test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Hassas veri içeren sayfaları ziyaret et (profil sayfası, ödeme bilgileri, vb.)<br>2. Tarayıcı geliştirici araçlarını kullanarak HTML ve JavaScript kodunu incele<br>3. Sistem günlüklerini incele<br>4. Hata mesajlarını incele |
| Beklenen Sonuç | - Kredi kartı numaraları, sosyal güvenlik numaraları gibi hassas veriler maskelenmeli (örn. **** **** **** 1234)<br>- Hassas veriler JavaScript kodunda açık metin olarak bulunmamalı<br>- Günlüklerde hassas veriler maskelenmeli veya şifrelenmeli<br>- Hata mesajlarında hassas veriler açıklanmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Veri Sızıntısı Test Senaryoları

### 3.1. Hata Mesajları Veri Sızıntısı Testi

| Test ID | ST-DL-001 |
|---------|-----------|
| Test Adı | Hata Mesajları Veri Sızıntısı Testi |
| Açıklama | Hata mesajlarında hassas bilgilerin sızdırılmadığını test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Çeşitli hatalara neden olacak işlemler gerçekleştir (geçersiz giriş, veritabanı hataları, vb.)<br>2. Hata mesajlarını incele<br>3. Özel olarak hazırlanmış istekler göndererek hata oluşturmayı dene<br>4. 404, 500 gibi HTTP hata sayfalarını incele |
| Beklenen Sonuç | - Hata mesajları teknik detayları açıklamamalı (SQL sorguları, yığın izleri, vb.)<br>- Hata mesajları hassas bilgileri içermemeli (kullanıcı adları, parolalar, vb.)<br>- Hata mesajları kullanıcı dostu olmalı ancak aşırı bilgi vermemeli<br>- HTTP hata sayfaları özelleştirilmiş olmalı ve hassas bilgiler içermemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. HTTP Başlıkları Veri Sızıntısı Testi

| Test ID | ST-DL-002 |
|---------|-----------|
| Test Adı | HTTP Başlıkları Veri Sızıntısı Testi |
| Açıklama | HTTP başlıklarında hassas bilgilerin sızdırılmadığını test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Çeşitli sayfalara istekler gönder<br>2. HTTP yanıt başlıklarını incele<br>3. Server, X-Powered-By gibi başlıkları kontrol et<br>4. Set-Cookie başlıklarını incele |
| Beklenen Sonuç | - Server, X-Powered-By gibi başlıklar aşırı bilgi vermemeli veya gizlenmeli<br>- Set-Cookie başlıkları güvenli yapılandırılmalı (Secure, HttpOnly, SameSite)<br>- Özel başlıklar hassas bilgiler içermemeli<br>- Cache-Control başlıkları hassas sayfalar için doğru yapılandırılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Yorumlar ve Metadata Veri Sızıntısı Testi

| Test ID | ST-DL-003 |
|---------|-----------|
| Test Adı | Yorumlar ve Metadata Veri Sızıntısı Testi |
| Açıklama | HTML yorumları, dosya metadata'sı ve kaynak kodunda hassas bilgilerin sızdırılmadığını test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Sayfa kaynak kodunu incele ve HTML yorumlarını kontrol et<br>2. JavaScript ve CSS dosyalarını incele<br>3. İndirilebilir dosyaların (PDF, DOCX, vb.) metadata'sını incele<br>4. Görüntü dosyalarının EXIF verilerini incele |
| Beklenen Sonuç | - HTML yorumları hassas bilgiler içermemeli (kullanıcı adları, parolalar, API anahtarları, vb.)<br>- JavaScript ve CSS dosyaları hassas bilgiler içermemeli<br>- Dosya metadata'sı temizlenmeli (yazar adı, kurum adı, vb.)<br>- Görüntü dosyalarının EXIF verileri temizlenmeli (konum bilgisi, vb.) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. Önbellek Veri Sızıntısı Testi

| Test ID | ST-DL-004 |
|---------|-----------|
| Test Adı | Önbellek Veri Sızıntısı Testi |
| Açıklama | Tarayıcı önbelleğinde ve uygulama önbelleğinde hassas bilgilerin sızdırılmadığını test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Hassas bilgiler içeren sayfalara eriş (profil sayfası, ödeme bilgileri, vb.)<br>2. Tarayıcı önbelleğini incele<br>3. Tarayıcı geçmişini incele<br>4. Tarayıcı yerel depolama ve oturum depolama alanlarını incele<br>5. Çıkış yap ve tarayıcı önbelleğini kontrol et |
| Beklenen Sonuç | - Hassas sayfalar önbelleklenmemeli (Cache-Control: no-store, no-cache)<br>- Hassas veriler tarayıcı yerel depolama veya oturum depolama alanlarında saklanmamalı<br>- Çıkış yapıldığında hassas veriler temizlenmeli<br>- Hassas sayfalar tarayıcı geçmişinde görünse bile içerik önbelleklenmemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Veri Bütünlüğü Test Senaryoları

### 4.1. Veri Doğrulama Testi

| Test ID | ST-DI-001 |
|---------|-----------|
| Test Adı | Veri Doğrulama Testi |
| Açıklama | Kullanıcı girdilerinin doğru şekilde doğrulandığını test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Çeşitli formlara geçersiz veriler gir (çok uzun metinler, özel karakterler, vb.)<br>2. Veri formatı gerektiren alanlara geçersiz formatlar gir (e-posta, telefon numarası, vb.)<br>3. Sayısal alanlara metin gir<br>4. Tarayıcı form doğrulamasını atlayarak doğrudan istekler gönder |
| Beklenen Sonuç | - Tüm kullanıcı girdileri hem istemci hem de sunucu tarafında doğrulanmalı<br>- Geçersiz veriler reddedilmeli ve kullanıcıya anlaşılır hata mesajları gösterilmeli<br>- Veri formatı gerektiren alanlar doğru şekilde doğrulanmalı<br>- Tarayıcı doğrulaması atlandığında sunucu tarafı doğrulama çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Veri Manipülasyonu Testi

| Test ID | ST-DI-002 |
|---------|-----------|
| Test Adı | Veri Manipülasyonu Testi |
| Açıklama | Kullanıcıların veri manipülasyonu yapamadığını test etme |
| Ön Koşullar | Sistem erişilebilir olmalı |
| Test Adımları | 1. Form alanlarını manipüle et (gizli alanlar, readonly alanlar, vb.)<br>2. URL parametrelerini manipüle et<br>3. HTTP isteklerini manipüle et (Burp Suite, OWASP ZAP gibi araçlarla)<br>4. JSON/XML verileri manipüle et |
| Beklenen Sonuç | - Gizli ve readonly alanlar sunucu tarafında doğrulanmalı<br>- URL parametreleri manipülasyonu etkisiz olmalı<br>- HTTP istek manipülasyonları reddedilmeli<br>- JSON/XML veri manipülasyonları reddedilmeli<br>- Tüm manipülasyon denemeleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Veri Tutarlılığı Testi

| Test ID | ST-DI-003 |
|---------|-----------|
| Test Adı | Veri Tutarlılığı Testi |
| Açıklama | Veritabanı ve uygulama arasındaki veri tutarlılığını test etme |
| Ön Koşullar | Veritabanı erişimi mevcut olmalı |
| Test Adımları | 1. Uygulama üzerinden veri ekle, güncelle ve sil<br>2. Veritabanında yapılan değişiklikleri doğrula<br>3. Veritabanında doğrudan değişiklikler yap ve uygulamada yansıdığını kontrol et<br>4. Eşzamanlı işlemler gerçekleştirerek yarış koşullarını test et |
| Beklenen Sonuç | - Uygulama ve veritabanı arasında veri tutarlılığı sağlanmalı<br>- Veritabanı kısıtlamaları (foreign key, unique, vb.) doğru yapılandırılmalı<br>- Yarış koşulları doğru şekilde yönetilmeli (kilitleme, işlem yönetimi, vb.)<br>- Veri bütünlüğü kontrolleri uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. Veri Yedekleme ve Kurtarma Test Senaryoları

### 5.1. Veri Yedekleme Testi

| Test ID | ST-DR-001 |
|---------|-----------|
| Test Adı | Veri Yedekleme Testi |
| Açıklama | Veri yedekleme mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | Yedekleme sistemi yapılandırılmış olmalı |
| Test Adımları | 1. Otomatik yedekleme işlemini başlat<br>2. Yedekleme dosyalarının oluşturulduğunu doğrula<br>3. Yedekleme dosyalarının bütünlüğünü kontrol et<br>4. Yedekleme dosyalarının şifrelendiğini doğrula<br>5. Yedekleme zamanlamasını kontrol et |
| Beklenen Sonuç | - Yedekleme işlemi başarıyla tamamlanmalı<br>- Yedekleme dosyaları tam ve doğru olmalı<br>- Yedekleme dosyaları şifrelenmiş olmalı<br>- Yedekleme zamanlaması doğru çalışmalı<br>- Yedekleme işlemi sistem performansını aşırı etkilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Veri Kurtarma Testi

| Test ID | ST-DR-002 |
|---------|-----------|
| Test Adı | Veri Kurtarma Testi |
| Açıklama | Veri kurtarma mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | Yedekleme dosyaları mevcut olmalı |
| Test Adımları | 1. Test ortamında veri kaybı senaryosu oluştur<br>2. Yedekleme dosyasından veri kurtarma işlemini başlat<br>3. Kurtarılan verilerin doğruluğunu ve bütünlüğünü kontrol et<br>4. Kurtarma işlemi sırasında sistem davranışını gözlemle |
| Beklenen Sonuç | - Veri kurtarma işlemi başarıyla tamamlanmalı<br>- Kurtarılan veriler tam ve doğru olmalı<br>- Kurtarma işlemi belgelenmiş prosedürlere uygun olmalı<br>- Kurtarma işlemi makul bir sürede tamamlanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. Felaket Kurtarma Testi

| Test ID | ST-DR-003 |
|---------|-----------|
| Test Adı | Felaket Kurtarma Testi |
| Açıklama | Felaket kurtarma planının etkinliğini test etme |
| Ön Koşullar | Felaket kurtarma planı mevcut olmalı |
| Test Adımları | 1. Test ortamında felaket senaryosu simüle et (sunucu çökmesi, veri merkezi kaybı, vb.)<br>2. Felaket kurtarma planını uygula<br>3. Sistemin yeniden çalışır duruma gelme süresini ölç<br>4. Kurtarılan sistemin doğruluğunu ve bütünlüğünü kontrol et |
| Beklenen Sonuç | - Felaket kurtarma planı başarıyla uygulanabilmeli<br>- Sistem, hedeflenen RTO (Recovery Time Objective) içinde yeniden çalışır duruma gelmeli<br>- Veri kaybı, hedeflenen RPO (Recovery Point Objective) içinde olmalı<br>- Kurtarılan sistem tam ve doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
