# Güvenlik Test Senaryoları - API Güvenliği

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Güvenlik Test Senaryoları - API Güvenliği

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için API güvenliği test senaryolarını içermektedir. Bu test senaryoları, sistemin API'lerinin güvenliğini değerlendirmek için kullanılacaktır.

## 2. API Kimlik Doğrulama Test Senaryoları

### 2.1. API Kimlik Doğrulama Bypass Testi

| Test ID | ST-AP-001 |
|---------|-----------|
| Test Adı | API Kimlik Doğrulama Bypass Testi |
| Açıklama | API kimlik doğrulama mekanizmalarının bypass edilemediğini test etme |
| Ön Koşullar | API dokümantasyonu mevcut olmalı |
| Test Adımları | 1. API endpoint'lerini belirle<br>2. Kimlik doğrulama olmadan API istekleri gönder<br>3. Geçersiz veya manipüle edilmiş token'lar ile API istekleri gönder<br>4. Farklı HTTP metodları ile kimlik doğrulama bypass'ı dene (GET, POST, PUT, DELETE, OPTIONS, vb.) |
| Beklenen Sonuç | - Kimlik doğrulama olmadan yapılan API istekleri reddedilmeli<br>- Geçersiz veya manipüle edilmiş token'lar reddedilmeli<br>- Tüm HTTP metodları için kimlik doğrulama kontrolleri uygulanmalı<br>- Kimlik doğrulama bypass denemeleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. API Rate Limiting Testi

| Test ID | ST-AP-002 |
|---------|-----------|
| Test Adı | API Rate Limiting Testi |
| Açıklama | API rate limiting mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. Kısa sürede çok sayıda API isteği gönder<br>2. Farklı IP adreslerinden istekler gönder<br>3. Farklı kullanıcı hesapları ile istekler gönder<br>4. Rate limit aşıldıktan sonra istekler göndermeye devam et |
| Beklenen Sonuç | - Belirli bir eşik aşıldığında istekler sınırlandırılmalı<br>- Rate limit aşıldığında uygun HTTP durum kodu döndürülmeli (429 Too Many Requests)<br>- Rate limit başlıkları döndürülmeli (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)<br>- Rate limit aşımları günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. API Enjeksiyon Test Senaryoları

### 3.1. SQL Enjeksiyon Testi

| Test ID | ST-AP-003 |
|---------|-----------|
| Test Adı | SQL Enjeksiyon Testi |
| Açıklama | API'lerin SQL enjeksiyon saldırılarına karşı korumalı olduğunu test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. SQL enjeksiyon payload'ları içeren API istekleri gönder<br>2. Farklı parametrelerde SQL enjeksiyon dene (URL parametreleri, form verileri, JSON verileri, vb.)<br>3. Blind SQL enjeksiyon dene<br>4. Error-based SQL enjeksiyon dene<br>5. Union-based SQL enjeksiyon dene |
| Beklenen Sonuç | - SQL enjeksiyon denemeleri başarısız olmalı<br>- Parametreler doğru şekilde temizlenmeli veya parametreli sorgular kullanılmalı<br>- Hata mesajları SQL detaylarını açıklamamalı<br>- SQL enjeksiyon denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. NoSQL Enjeksiyon Testi

| Test ID | ST-AP-004 |
|---------|-----------|
| Test Adı | NoSQL Enjeksiyon Testi |
| Açıklama | API'lerin NoSQL enjeksiyon saldırılarına karşı korumalı olduğunu test etme |
| Ön Koşullar | API erişimi mevcut olmalı ve sistem NoSQL veritabanı kullanmalı |
| Test Adımları | 1. NoSQL enjeksiyon payload'ları içeren API istekleri gönder<br>2. MongoDB operatörlerini kullanarak enjeksiyon dene ($gt, $ne, $in, vb.)<br>3. JavaScript enjeksiyonu dene<br>4. Farklı parametrelerde NoSQL enjeksiyon dene |
| Beklenen Sonuç | - NoSQL enjeksiyon denemeleri başarısız olmalı<br>- Parametreler doğru şekilde temizlenmeli veya tip kontrolü yapılmalı<br>- Hata mesajları veritabanı detaylarını açıklamamalı<br>- NoSQL enjeksiyon denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Command Enjeksiyon Testi

| Test ID | ST-AP-005 |
|---------|-----------|
| Test Adı | Command Enjeksiyon Testi |
| Açıklama | API'lerin komut enjeksiyon saldırılarına karşı korumalı olduğunu test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. Komut enjeksiyon payload'ları içeren API istekleri gönder<br>2. Farklı işletim sistemi komutlarını dene (Windows, Linux)<br>3. Farklı parametrelerde komut enjeksiyon dene<br>4. Komut zincirleme operatörlerini dene (;, &&, ||, |, vb.) |
| Beklenen Sonuç | - Komut enjeksiyon denemeleri başarısız olmalı<br>- Kullanıcı girdileri doğrudan komut satırında çalıştırılmamalı<br>- Hata mesajları sistem detaylarını açıklamamalı<br>- Komut enjeksiyon denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. XML Enjeksiyon ve XXE Testi

| Test ID | ST-AP-006 |
|---------|-----------|
| Test Adı | XML Enjeksiyon ve XXE Testi |
| Açıklama | API'lerin XML enjeksiyon ve XXE (XML External Entity) saldırılarına karşı korumalı olduğunu test etme |
| Ön Koşullar | API erişimi mevcut olmalı ve sistem XML verilerini işlemeli |
| Test Adımları | 1. XML enjeksiyon payload'ları içeren API istekleri gönder<br>2. XXE payload'ları içeren XML verileri gönder<br>3. Harici varlıklar ve DTD'ler içeren XML verileri gönder<br>4. XML bombaları gönder |
| Beklenen Sonuç | - XML enjeksiyon denemeleri başarısız olmalı<br>- XXE işleme devre dışı bırakılmalı<br>- Harici varlıklar ve DTD'ler işlenmemeli<br>- XML bombaları reddedilmeli ve DoS koruması sağlanmalı<br>- XML enjeksiyon ve XXE denemeleri günlüklere kaydedilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. API Veri Doğrulama Test Senaryoları

### 4.1. API Girdi Doğrulama Testi

| Test ID | ST-AP-007 |
|---------|-----------|
| Test Adı | API Girdi Doğrulama Testi |
| Açıklama | API'lerin girdi doğrulama mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. Geçersiz veri tipleri içeren API istekleri gönder<br>2. Geçersiz veri formatları içeren API istekleri gönder<br>3. Çok büyük veya çok küçük değerler içeren API istekleri gönder<br>4. Eksik veya fazla parametreler içeren API istekleri gönder |
| Beklenen Sonuç | - Geçersiz girdiler reddedilmeli<br>- Uygun hata mesajları döndürülmeli<br>- Veri tipleri ve formatları doğru şekilde doğrulanmalı<br>- Sınır değerleri doğru şekilde işlenmeli<br>- Eksik zorunlu parametreler reddedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. API Çıktı Doğrulama Testi

| Test ID | ST-AP-008 |
|---------|-----------|
| Test Adı | API Çıktı Doğrulama Testi |
| Açıklama | API'lerin çıktı doğrulama mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. Çeşitli API istekleri gönder ve yanıtları incele<br>2. Yanıtlardaki veri tiplerini ve formatlarını kontrol et<br>3. Hassas verilerin yanıtlarda bulunup bulunmadığını kontrol et<br>4. Hata yanıtlarını incele |
| Beklenen Sonuç | - API yanıtları belirtilen şemaya uygun olmalı<br>- Hassas veriler yanıtlarda bulunmamalı veya maskelenmeli<br>- Hata yanıtları aşırı bilgi vermemeli<br>- Yanıtlar tutarlı bir format ve yapıda olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. API İş Mantığı Test Senaryoları

### 5.1. API İş Akışı Manipülasyon Testi

| Test ID | ST-AP-009 |
|---------|-----------|
| Test Adı | API İş Akışı Manipülasyon Testi |
| Açıklama | API'lerin iş akışı manipülasyonlarına karşı korumalı olduğunu test etme |
| Ön Koşullar | API erişimi mevcut olmalı ve çok adımlı iş akışları bulunmalı |
| Test Adımları | 1. Çok adımlı iş akışlarını belirle (örn. sipariş oluşturma, ödeme, onaylama)<br>2. İş akışı adımlarını atlama veya değiştirme dene<br>3. İş akışı adımlarını farklı sırada çalıştırma dene<br>4. Aynı iş akışı adımını birden fazla kez çalıştırma dene |
| Beklenen Sonuç | - İş akışı adımları doğru sırada uygulanmalı<br>- Adımlar atlanamamalı veya değiştirilememeli<br>- İş akışı durumu sunucu tarafında doğru şekilde yönetilmeli<br>- İş akışı manipülasyon denemeleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. API İş Mantığı Zafiyeti Testi

| Test ID | ST-AP-010 |
|---------|-----------|
| Test Adı | API İş Mantığı Zafiyeti Testi |
| Açıklama | API'lerin iş mantığı zafiyetlerine karşı korumalı olduğunu test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. İş mantığı zafiyetlerini belirle (fiyat manipülasyonu, miktar manipülasyonu, vb.)<br>2. Parametreleri manipüle ederek iş mantığı zafiyetlerini istismar etmeyi dene<br>3. Yarış koşulları oluşturarak iş mantığı zafiyetlerini istismar etmeyi dene<br>4. İş kurallarını bypass etmeyi dene |
| Beklenen Sonuç | - İş mantığı zafiyetleri istismar edilememeli<br>- Parametreler sunucu tarafında doğrulanmalı<br>- Yarış koşulları doğru şekilde yönetilmeli<br>- İş kuralları tutarlı bir şekilde uygulanmalı<br>- İş mantığı zafiyeti istismar denemeleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. API Dokümantasyon ve Keşif Test Senaryoları

### 6.1. API Dokümantasyon Güvenliği Testi

| Test ID | ST-AP-011 |
|---------|-----------|
| Test Adı | API Dokümantasyon Güvenliği Testi |
| Açıklama | API dokümantasyonunun güvenliğini test etme |
| Ön Koşullar | API dokümantasyonu mevcut olmalı |
| Test Adımları | 1. API dokümantasyonuna erişim kontrolünü test et<br>2. Dokümantasyonda hassas bilgilerin bulunup bulunmadığını kontrol et<br>3. Swagger, OpenAPI gibi dokümantasyon araçlarının güvenlik yapılandırmasını kontrol et<br>4. Dokümantasyondaki örnek istekleri ve yanıtları incele |
| Beklenen Sonuç | - API dokümantasyonu yetkilendirme kontrollerine tabi olmalı<br>- Dokümantasyon hassas bilgiler içermemeli (API anahtarları, kimlik bilgileri, vb.)<br>- Dokümantasyon araçları güvenli şekilde yapılandırılmalı<br>- Örnek istekler ve yanıtlar hassas veriler içermemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. API Keşif ve Numara Tahmin Testi

| Test ID | ST-AP-012 |
|---------|-----------|
| Test Adı | API Keşif ve Numara Tahmin Testi |
| Açıklama | Belgelenmemiş API endpoint'lerinin ve kaynak ID'lerinin tahmin edilebilirliğini test etme |
| Ön Koşullar | API erişimi mevcut olmalı |
| Test Adımları | 1. API keşif araçları kullanarak belgelenmemiş endpoint'leri bulmaya çalış<br>2. Yaygın API endpoint isimlerini deneyerek keşif yap<br>3. Kaynak ID'lerini tahmin etmeyi dene (ardışık ID'ler, UUID'ler, vb.)<br>4. HTTP OPTIONS ve HEAD metodlarını kullanarak API bilgilerini elde etmeyi dene |
| Beklenen Sonuç | - Belgelenmemiş API endpoint'leri yetkilendirme kontrollerine tabi olmalı<br>- Kaynak ID'leri tahmin edilemez olmalı (UUID gibi)<br>- HTTP OPTIONS ve HEAD metodları aşırı bilgi vermemeli<br>- API keşif denemeleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
