# Güvenlik Test Senaryoları

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Güvenlik Test Senaryoları

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için güvenlik test senaryolarını içermektedir. Güvenlik test senaryoları, sistemin güvenlik özelliklerini ve zafiyetlerini değerlendirmek için kullanılacaktır.

Güvenlik testleri, aşağıdaki kategorilere ayrılmıştır:

1. **Kimlik Doğrulama ve Yetkilendirme Testleri**: Kullanıcı kimlik doğrulama ve yetkilendirme mekanizmalarının güvenliğini test etmek için.
2. **Veri Güvenliği Testleri**: Verilerin şifrelenmesi, maskelenmesi ve korunmasını test etmek için.
3. **API Güvenliği Testleri**: API'lerin güvenliğini ve korunmasını test etmek için.
4. **Ağ Güvenliği Testleri**: Ağ altyapısının ve iletişiminin güvenliğini test etmek için.
5. **Oturum Yönetimi Testleri**: Oturum yönetimi mekanizmalarının güvenliğini test etmek için.

Her kategori için detaylı test senaryoları, ilgili dosyalarda bulunmaktadır.

## 2. Test Senaryoları Özeti

### 2.1. Kimlik Doğrulama ve Yetkilendirme Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| ST-AU-001 | Kaba Kuvvet Saldırısı Testi | Giriş sayfasına kaba kuvvet saldırısı gerçekleştirerek hesap kilitleme ve saldırı tespit mekanizmalarını test etme |
| ST-AU-002 | Parola Politikası Testi | Parola politikasının etkinliğini test etme |
| ST-AU-003 | Parola Sıfırlama Testi | Parola sıfırlama mekanizmasının güvenliğini test etme |
| ST-AU-004 | Çoklu Oturum Testi | Aynı kullanıcı için çoklu oturum yönetimini test etme |
| ST-AU-005 | Sosyal Mühendislik Testi | Kullanıcı bilgilerini elde etmek için sosyal mühendislik tekniklerinin etkinliğini test etme |
| ST-AZ-001 | Yatay Yetki Yükseltme Testi | Bir kullanıcının diğer kullanıcıların verilerine erişimini test etme |
| ST-AZ-002 | Dikey Yetki Yükseltme Testi | Düşük yetkili bir kullanıcının yüksek yetkili işlemlere erişimini test etme |
| ST-AZ-003 | İşlev Seviyesi Yetkilendirme Testi | Kullanıcıların yalnızca yetkili oldukları işlevlere erişebildiğini test etme |
| ST-AZ-004 | Veri Seviyesi Yetkilendirme Testi | Kullanıcıların yalnızca yetkili oldukları verilere erişebildiğini test etme |
| ST-AZ-005 | JWT Token Güvenliği Testi | JWT token'larının güvenliğini test etme |

Detaylı bilgi için: [Kimlik Doğrulama ve Yetkilendirme Test Senaryoları](guvenlik_test_senaryolari_kimlik_dogrulama.md)

### 2.2. Veri Güvenliği Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| ST-DS-001 | İletim Sırasında Veri Şifreleme Testi | Verilerin iletim sırasında şifrelendiğini test etme |
| ST-DS-002 | Depolama Sırasında Veri Şifreleme Testi | Hassas verilerin depolama sırasında şifrelendiğini test etme |
| ST-DS-003 | Veri Maskeleme Testi | Hassas verilerin kullanıcı arayüzünde ve günlüklerde maskelendiğini test etme |
| ST-DL-001 | Hata Mesajları Veri Sızıntısı Testi | Hata mesajlarında hassas bilgilerin sızdırılmadığını test etme |
| ST-DL-002 | HTTP Başlıkları Veri Sızıntısı Testi | HTTP başlıklarında hassas bilgilerin sızdırılmadığını test etme |
| ST-DL-003 | Yorumlar ve Metadata Veri Sızıntısı Testi | HTML yorumları, dosya metadata'sı ve kaynak kodunda hassas bilgilerin sızdırılmadığını test etme |
| ST-DL-004 | Önbellek Veri Sızıntısı Testi | Tarayıcı önbelleğinde ve uygulama önbelleğinde hassas bilgilerin sızdırılmadığını test etme |
| ST-DI-001 | Veri Doğrulama Testi | Kullanıcı girdilerinin doğru şekilde doğrulandığını test etme |
| ST-DI-002 | Veri Manipülasyonu Testi | Kullanıcıların veri manipülasyonu yapamadığını test etme |
| ST-DI-003 | Veri Tutarlılığı Testi | Veritabanı ve uygulama arasındaki veri tutarlılığını test etme |
| ST-DR-001 | Veri Yedekleme Testi | Veri yedekleme mekanizmalarının doğru çalıştığını test etme |
| ST-DR-002 | Veri Kurtarma Testi | Veri kurtarma mekanizmalarının doğru çalıştığını test etme |
| ST-DR-003 | Felaket Kurtarma Testi | Felaket kurtarma planının etkinliğini test etme |

Detaylı bilgi için: [Veri Güvenliği Test Senaryoları](guvenlik_test_senaryolari_veri_guvenligi.md)

### 2.3. API Güvenliği Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| ST-AP-001 | API Kimlik Doğrulama Bypass Testi | API kimlik doğrulama mekanizmalarının bypass edilemediğini test etme |
| ST-AP-002 | API Rate Limiting Testi | API rate limiting mekanizmalarının doğru çalıştığını test etme |
| ST-AP-003 | SQL Enjeksiyon Testi | API'lerin SQL enjeksiyon saldırılarına karşı korumalı olduğunu test etme |
| ST-AP-004 | NoSQL Enjeksiyon Testi | API'lerin NoSQL enjeksiyon saldırılarına karşı korumalı olduğunu test etme |
| ST-AP-005 | Command Enjeksiyon Testi | API'lerin komut enjeksiyon saldırılarına karşı korumalı olduğunu test etme |
| ST-AP-006 | XML Enjeksiyon ve XXE Testi | API'lerin XML enjeksiyon ve XXE saldırılarına karşı korumalı olduğunu test etme |
| ST-AP-007 | API Girdi Doğrulama Testi | API'lerin girdi doğrulama mekanizmalarının doğru çalıştığını test etme |
| ST-AP-008 | API Çıktı Doğrulama Testi | API'lerin çıktı doğrulama mekanizmalarının doğru çalıştığını test etme |
| ST-AP-009 | API İş Akışı Manipülasyon Testi | API'lerin iş akışı manipülasyonlarına karşı korumalı olduğunu test etme |
| ST-AP-010 | API İş Mantığı Zafiyeti Testi | API'lerin iş mantığı zafiyetlerine karşı korumalı olduğunu test etme |
| ST-AP-011 | API Dokümantasyon Güvenliği Testi | API dokümantasyonunun güvenliğini test etme |
| ST-AP-012 | API Keşif ve Numara Tahmin Testi | Belgelenmemiş API endpoint'lerinin ve kaynak ID'lerinin tahmin edilebilirliğini test etme |

Detaylı bilgi için: [API Güvenliği Test Senaryoları](guvenlik_test_senaryolari_api_guvenligi.md)

### 2.4. Ağ Güvenliği Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| ST-NS-001 | SSL/TLS Yapılandırma Testi | SSL/TLS yapılandırmasının güvenliğini test etme |
| ST-NS-002 | SSL/TLS Sertifika Testi | SSL/TLS sertifikasının güvenliğini test etme |
| ST-NS-003 | HTTP Güvenlik Başlıkları Testi | HTTP güvenlik başlıklarının doğru yapılandırıldığını test etme |
| ST-NS-004 | Port Tarama Testi | Açık portları ve çalışan servisleri test etme |
| ST-NS-005 | Güvenlik Duvarı Testi | Güvenlik duvarı kurallarının etkinliğini test etme |
| ST-NS-006 | DoS/DDoS Dayanıklılık Testi | Sistemin DoS/DDoS saldırılarına karşı dayanıklılığını test etme |
| ST-NS-007 | Ağ Segmentasyonu Testi | Ağ segmentasyonunun etkinliğini test etme |
| ST-NS-008 | Kubernetes Ağ Politikaları Testi | Kubernetes ağ politikalarının etkinliğini test etme |
| ST-NS-009 | VPN Güvenliği Testi | VPN çözümünün güvenliğini test etme |
| ST-NS-010 | Uzak Erişim Güvenliği Testi | Uzak erişim mekanizmalarının güvenliğini test etme |
| ST-NS-011 | Wi-Fi Güvenliği Testi | Kablosuz ağ güvenliğini test etme |
| ST-NS-012 | Bluetooth Güvenliği Testi | Bluetooth cihazlarının ve bağlantılarının güvenliğini test etme |

Detaylı bilgi için: [Ağ Güvenliği Test Senaryoları](guvenlik_test_senaryolari_ag_guvenligi.md)

### 2.5. Oturum Yönetimi Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| ST-SM-001 | Oturum Token Güvenliği Testi | Oturum token'larının güvenliğini test etme |
| ST-SM-002 | Oturum Çerezleri Güvenliği Testi | Oturum çerezlerinin güvenlik ayarlarını test etme |
| ST-SM-003 | Oturum Oluşturma Sonrası Yönlendirme Testi | Oturum oluşturma sonrası yönlendirmelerin güvenliğini test etme |
| ST-SM-004 | Oturum Zaman Aşımı Testi | Oturum zaman aşımı mekanizmalarının doğru çalıştığını test etme |
| ST-SM-005 | Oturum Geçersiz Kılma Testi | Oturum geçersiz kılma mekanizmalarının doğru çalıştığını test etme |
| ST-SM-006 | Oturum Sabitlenmesi Testi | Oturum sabitlenmesi saldırılarına karşı korumaları test etme |
| ST-SM-007 | CSRF Koruması Testi | Cross-Site Request Forgery saldırılarına karşı korumaları test etme |
| ST-SM-008 | XSS Koruması Testi | Cross-Site Scripting saldırılarına karşı korumaları test etme |
| ST-SM-009 | Clickjacking Koruması Testi | Clickjacking saldırılarına karşı korumaları test etme |
| ST-SM-010 | Tarayıcı Önbelleği Koruması Testi | Hassas oturum bilgilerinin tarayıcı önbelleğinde saklanmadığını test etme |
| ST-SM-011 | Yerel Depolama Güvenliği Testi | Tarayıcı yerel depolama alanlarında hassas bilgilerin saklanmadığını test etme |
| ST-SM-012 | Oturum Bilgisi Sızıntısı Testi | Oturum bilgilerinin harici kaynaklara sızdırılmadığını test etme |
| ST-SM-013 | Mobil Uygulama Oturum Güvenliği Testi | Mobil uygulamanın oturum yönetimi güvenliğini test etme |
| ST-SM-014 | Mobil API Oturum Yönetimi Testi | Mobil uygulamanın API oturum yönetimi güvenliğini test etme |
| ST-SM-015 | Çoklu Cihaz Oturum Yönetimi Testi | Çoklu cihaz oturum yönetimi güvenliğini test etme |

Detaylı bilgi için: [Oturum Yönetimi Test Senaryoları](guvenlik_test_senaryolari_oturum_yonetimi.md)

## 3. Test Ortamı

Güvenlik testleri, beta test ortamında gerçekleştirilecektir. Test ortamı, üretim ortamına benzer şekilde yapılandırılmış olmalıdır. Testler, aşağıdaki araçlar kullanılarak gerçekleştirilecektir:

- **Ağ Güvenliği Araçları**: Nmap, Wireshark, OpenVAS
- **Web Uygulama Güvenliği Araçları**: OWASP ZAP, Burp Suite
- **API Güvenliği Araçları**: Postman, SoapUI
- **SSL/TLS Analiz Araçları**: SSL Labs, testssl.sh
- **Kod Analiz Araçları**: SonarQube, OWASP Dependency Check
- **Mobil Uygulama Güvenliği Araçları**: MobSF, Drozer

## 4. Test Yaklaşımı

Güvenlik testleri, aşağıdaki yaklaşımla gerçekleştirilecektir:

1. **Otomatik Tarama**: Otomatik güvenlik tarama araçları kullanılarak bilinen güvenlik açıkları tespit edilecektir.
2. **Manuel Test**: Otomatik araçlarla tespit edilemeyen güvenlik açıkları için manuel testler gerçekleştirilecektir.
3. **Kod İnceleme**: Güvenlik açısından kritik bileşenlerin kaynak kodu incelenecektir.
4. **Yapılandırma İnceleme**: Sistem ve uygulama yapılandırmaları güvenlik açısından incelenecektir.
5. **Penetrasyon Testi**: Gerçek saldırı senaryoları simüle edilerek sistemin güvenliği test edilecektir.

## 5. Raporlama

Güvenlik testleri sonucunda, aşağıdaki bilgileri içeren bir rapor hazırlanacaktır:

- Tespit edilen güvenlik açıkları ve zafiyetler
- Her güvenlik açığının risk seviyesi (Kritik, Yüksek, Orta, Düşük)
- Güvenlik açıklarının teknik detayları ve etkileri
- Güvenlik açıklarının giderilmesi için öneriler
- Test sonuçlarının özeti ve genel güvenlik değerlendirmesi

## 6. Sorumluluklar

Güvenlik testleri, aşağıdaki sorumluluklar çerçevesinde gerçekleştirilecektir:

- **Güvenlik Test Ekibi**: Güvenlik testlerinin planlanması, gerçekleştirilmesi ve raporlanması
- **Geliştirme Ekibi**: Tespit edilen güvenlik açıklarının giderilmesi
- **Sistem Yöneticileri**: Test ortamının hazırlanması ve yapılandırılması
- **Proje Yöneticisi**: Test sürecinin koordinasyonu ve sonuçların değerlendirilmesi

## 7. Zaman Çizelgesi

Güvenlik testleri, aşağıdaki zaman çizelgesine göre gerçekleştirilecektir:

- **Hazırlık**: 18-19 Haziran 2025
- **Otomatik Tarama**: 20-21 Haziran 2025
- **Manuel Test**: 22-24 Haziran 2025
- **Kod ve Yapılandırma İnceleme**: 25-26 Haziran 2025
- **Penetrasyon Testi**: 27-29 Haziran 2025
- **Raporlama**: 30 Haziran 2025

## 8. Sonuç

Bu belge, ALT_LAS projesinin beta test aşaması için güvenlik test senaryolarını içermektedir. Güvenlik testleri, sistemin güvenlik özelliklerini ve zafiyetlerini değerlendirmek için kullanılacaktır. Test sonuçları, sistemin güvenliğinin iyileştirilmesi için kullanılacaktır.
