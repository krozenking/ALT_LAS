# Güvenlik Test Senaryoları - Ağ Güvenliği

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Güvenlik Test Senaryoları - Ağ Güvenliği

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için ağ güvenliği test senaryolarını içermektedir. Bu test senaryoları, sistemin ağ güvenliğini değerlendirmek için kullanılacaktır.

## 2. SSL/TLS Güvenliği Test Senaryoları

### 2.1. SSL/TLS Yapılandırma Testi

| Test ID | ST-NS-001 |
|---------|-----------|
| Test Adı | SSL/TLS Yapılandırma Testi |
| Açıklama | SSL/TLS yapılandırmasının güvenliğini test etme |
| Ön Koşullar | Sistem HTTPS üzerinden erişilebilir olmalı |
| Test Adımları | 1. SSL Labs, testssl.sh gibi araçlar kullanarak SSL/TLS yapılandırmasını test et<br>2. Desteklenen SSL/TLS protokol versiyonlarını kontrol et<br>3. Desteklenen şifreleme paketlerini (cipher suites) kontrol et<br>4. Sertifika zincirini ve güvenini kontrol et<br>5. Perfect Forward Secrecy (PFS) desteğini kontrol et |
| Beklenen Sonuç | - Yalnızca güvenli SSL/TLS protokol versiyonları desteklenmeli (TLS 1.2+)<br>- Yalnızca güçlü şifreleme paketleri desteklenmeli<br>- Sertifika zinciri geçerli ve güvenilir olmalı<br>- Perfect Forward Secrecy desteklenmeli<br>- SSL/TLS yapılandırması en az A derecesi almalı (SSL Labs) |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. SSL/TLS Sertifika Testi

| Test ID | ST-NS-002 |
|---------|-----------|
| Test Adı | SSL/TLS Sertifika Testi |
| Açıklama | SSL/TLS sertifikasının güvenliğini test etme |
| Ön Koşullar | Sistem HTTPS üzerinden erişilebilir olmalı |
| Test Adımları | 1. Sertifika bilgilerini incele (tarayıcı veya OpenSSL kullanarak)<br>2. Sertifikanın geçerlilik süresini kontrol et<br>3. Sertifikanın alan adı uyumluluğunu kontrol et<br>4. Sertifikanın anahtar uzunluğunu ve algoritmasını kontrol et<br>5. Sertifikanın revoke durumunu kontrol et |
| Beklenen Sonuç | - Sertifika geçerli ve güncel olmalı<br>- Sertifika alan adı ile eşleşmeli (CN veya SAN)<br>- Sertifika yeterli anahtar uzunluğuna sahip olmalı (RSA için en az 2048 bit)<br>- Sertifika güçlü bir imza algoritması kullanmalı (SHA-256+)<br>- Sertifika revoke edilmemiş olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. HTTP Güvenlik Başlıkları Testi

| Test ID | ST-NS-003 |
|---------|-----------|
| Test Adı | HTTP Güvenlik Başlıkları Testi |
| Açıklama | HTTP güvenlik başlıklarının doğru yapılandırıldığını test etme |
| Ön Koşullar | Sistem HTTP/HTTPS üzerinden erişilebilir olmalı |
| Test Adımları | 1. HTTP yanıt başlıklarını incele<br>2. Aşağıdaki güvenlik başlıklarını kontrol et:<br>   - Strict-Transport-Security (HSTS)<br>   - Content-Security-Policy (CSP)<br>   - X-Content-Type-Options<br>   - X-Frame-Options<br>   - X-XSS-Protection<br>   - Referrer-Policy<br>   - Feature-Policy/Permissions-Policy |
| Beklenen Sonuç | - HSTS başlığı doğru yapılandırılmalı (includeSubDomains, preload)<br>- CSP başlığı kısıtlayıcı bir politika içermeli<br>- X-Content-Type-Options: nosniff olmalı<br>- X-Frame-Options: DENY veya SAMEORIGIN olmalı<br>- X-XSS-Protection: 1; mode=block olmalı<br>- Referrer-Policy güvenli bir değere ayarlanmalı<br>- Feature-Policy/Permissions-Policy gereksiz özellikleri kısıtlamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Ağ Altyapısı Güvenliği Test Senaryoları

### 3.1. Port Tarama Testi

| Test ID | ST-NS-004 |
|---------|-----------|
| Test Adı | Port Tarama Testi |
| Açıklama | Açık portları ve çalışan servisleri test etme |
| Ön Koşullar | Sistem ağ üzerinden erişilebilir olmalı |
| Test Adımları | 1. Nmap veya benzer araçlar kullanarak port taraması yap<br>2. Açık portları ve çalışan servisleri belirle<br>3. Servis versiyonlarını belirle<br>4. Gereksiz veya beklenmeyen açık portları tespit et |
| Beklenen Sonuç | - Yalnızca gerekli portlar açık olmalı<br>- Açık portlarda çalışan servisler güncel ve güvenli olmalı<br>- Yönetim arayüzleri (SSH, RDP, vb.) uygun şekilde korunmalı<br>- Gereksiz veya beklenmeyen portlar kapalı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Güvenlik Duvarı Testi

| Test ID | ST-NS-005 |
|---------|-----------|
| Test Adı | Güvenlik Duvarı Testi |
| Açıklama | Güvenlik duvarı kurallarının etkinliğini test etme |
| Ön Koşullar | Sistem güvenlik duvarı ile korunmalı |
| Test Adımları | 1. Farklı kaynaklardan ve portlardan bağlantı denemeleri yap<br>2. Farklı protokoller üzerinden bağlantı denemeleri yap<br>3. Güvenlik duvarı bypass teknikleri dene (fragmantasyon, port hopping, vb.)<br>4. Güvenlik duvarı kurallarının tutarlılığını kontrol et |
| Beklenen Sonuç | - Güvenlik duvarı kuralları etkili bir şekilde uygulanmalı<br>- Yalnızca izin verilen trafik geçebilmeli<br>- Güvenlik duvarı bypass denemeleri başarısız olmalı<br>- Güvenlik duvarı kuralları tutarlı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. DoS/DDoS Dayanıklılık Testi

| Test ID | ST-NS-006 |
|---------|-----------|
| Test Adı | DoS/DDoS Dayanıklılık Testi |
| Açıklama | Sistemin DoS/DDoS saldırılarına karşı dayanıklılığını test etme |
| Ön Koşullar | Test ortamı izole olmalı ve üretim sistemlerini etkilememeli |
| Test Adımları | 1. Kontrollü bir ortamda basit DoS saldırıları gerçekleştir<br>2. HTTP flood, Slowloris gibi uygulama katmanı DoS saldırıları dene<br>3. Sistemin yük altındaki davranışını gözlemle<br>4. DoS/DDoS koruma mekanizmalarının etkinliğini değerlendir |
| Beklenen Sonuç | - Sistem basit DoS saldırılarına karşı dayanıklı olmalı<br>- DoS/DDoS koruma mekanizmaları (rate limiting, IP bloklama, vb.) etkili olmalı<br>- Sistem aşırı yük altında düzgün şekilde degrade olmalı<br>- DoS/DDoS saldırıları tespit edilmeli ve uyarı oluşturulmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Ağ Segmentasyonu Test Senaryoları

### 4.1. Ağ Segmentasyonu Testi

| Test ID | ST-NS-007 |
|---------|-----------|
| Test Adı | Ağ Segmentasyonu Testi |
| Açıklama | Ağ segmentasyonunun etkinliğini test etme |
| Ön Koşullar | Sistem birden fazla ağ segmentine sahip olmalı |
| Test Adımları | 1. Farklı ağ segmentleri arasında erişim denemeleri yap<br>2. Bir segmentten diğerine geçiş denemeleri yap<br>3. Segmentler arası trafik kurallarını test et<br>4. Segmentasyon bypass teknikleri dene |
| Beklenen Sonuç | - Ağ segmentleri arasında yalnızca izin verilen trafik geçebilmeli<br>- Hassas segmentler (veritabanı, yönetim, vb.) uygun şekilde izole edilmiş olmalı<br>- Segmentler arası trafik kuralları tutarlı olmalı<br>- Segmentasyon bypass denemeleri başarısız olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Kubernetes Ağ Politikaları Testi

| Test ID | ST-NS-008 |
|---------|-----------|
| Test Adı | Kubernetes Ağ Politikaları Testi |
| Açıklama | Kubernetes ağ politikalarının etkinliğini test etme |
| Ön Koşullar | Sistem Kubernetes üzerinde çalışmalı |
| Test Adımları | 1. Pod'lar arası iletişim denemeleri yap<br>2. Namespace'ler arası iletişim denemeleri yap<br>3. Dış ağdan pod'lara erişim denemeleri yap<br>4. Ağ politikası bypass teknikleri dene |
| Beklenen Sonuç | - Pod'lar arası iletişim ağ politikalarına uygun olmalı<br>- Namespace'ler arası iletişim ağ politikalarına uygun olmalı<br>- Dış ağdan pod'lara erişim ağ politikalarına uygun olmalı<br>- Ağ politikası bypass denemeleri başarısız olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. VPN ve Uzak Erişim Güvenliği Test Senaryoları

### 5.1. VPN Güvenliği Testi

| Test ID | ST-NS-009 |
|---------|-----------|
| Test Adı | VPN Güvenliği Testi |
| Açıklama | VPN çözümünün güvenliğini test etme |
| Ön Koşullar | Sistem VPN erişimi sağlamalı |
| Test Adımları | 1. VPN protokolünün ve şifreleme ayarlarının güvenliğini kontrol et<br>2. VPN kimlik doğrulama mekanizmalarını test et<br>3. VPN tüneli üzerinden geçen trafiğin şifrelendiğini doğrula<br>4. VPN split tunneling yapılandırmasını kontrol et |
| Beklenen Sonuç | - Güvenli VPN protokolleri kullanılmalı (OpenVPN, IKEv2/IPSec, WireGuard)<br>- Güçlü kimlik doğrulama mekanizmaları uygulanmalı (çok faktörlü kimlik doğrulama)<br>- VPN tüneli üzerinden geçen trafik şifrelenmeli<br>- Split tunneling güvenli şekilde yapılandırılmalı veya devre dışı bırakılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. Uzak Erişim Güvenliği Testi

| Test ID | ST-NS-010 |
|---------|-----------|
| Test Adı | Uzak Erişim Güvenliği Testi |
| Açıklama | Uzak erişim mekanizmalarının güvenliğini test etme |
| Ön Koşullar | Sistem uzak erişim mekanizmaları sağlamalı (SSH, RDP, vb.) |
| Test Adımları | 1. Uzak erişim protokollerinin güvenliğini kontrol et<br>2. Uzak erişim kimlik doğrulama mekanizmalarını test et<br>3. Uzak erişim oturum yönetimini test et<br>4. Uzak erişim kısıtlamalarını test et |
| Beklenen Sonuç | - Güvenli uzak erişim protokolleri kullanılmalı (SSH v2, RDP with TLS)<br>- Güçlü kimlik doğrulama mekanizmaları uygulanmalı (anahtar tabanlı, çok faktörlü)<br>- Uzak erişim oturumları zaman aşımına uğramalı ve izlenmeli<br>- Uzak erişim belirli IP adresleri veya ağlarla sınırlandırılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Kablosuz Ağ Güvenliği Test Senaryoları

### 6.1. Wi-Fi Güvenliği Testi

| Test ID | ST-NS-011 |
|---------|-----------|
| Test Adı | Wi-Fi Güvenliği Testi |
| Açıklama | Kablosuz ağ güvenliğini test etme |
| Ön Koşullar | Sistem kablosuz ağ erişimi sağlamalı |
| Test Adımları | 1. Wi-Fi şifreleme ve kimlik doğrulama protokollerini kontrol et<br>2. Wi-Fi ağının sinyal gücünü ve kapsama alanını kontrol et<br>3. Yetkisiz erişim noktalarını (rogue access points) tespit et<br>4. Wi-Fi ağına yetkisiz erişim denemeleri yap |
| Beklenen Sonuç | - Güvenli Wi-Fi protokolleri kullanılmalı (WPA2-Enterprise veya WPA3)<br>- Wi-Fi sinyal gücü kontrollü olmalı ve gereksiz yere dışarıya sızmamalı<br>- Yetkisiz erişim noktaları tespit edilmeli ve engellenmeli<br>- Wi-Fi ağına yetkisiz erişim denemeleri başarısız olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Bluetooth Güvenliği Testi

| Test ID | ST-NS-012 |
|---------|-----------|
| Test Adı | Bluetooth Güvenliği Testi |
| Açıklama | Bluetooth cihazlarının ve bağlantılarının güvenliğini test etme |
| Ön Koşullar | Sistem Bluetooth cihazları kullanmalı |
| Test Adımları | 1. Bluetooth cihazlarının keşfedilebilirlik ayarlarını kontrol et<br>2. Bluetooth eşleştirme ve kimlik doğrulama mekanizmalarını test et<br>3. Bluetooth bağlantılarının şifrelendiğini doğrula<br>4. Bluetooth saldırılarına karşı dayanıklılığı test et (BlueBorne, KNOB, vb.) |
| Beklenen Sonuç | - Bluetooth cihazları yalnızca gerektiğinde keşfedilebilir olmalı<br>- Güvenli eşleştirme ve kimlik doğrulama mekanizmaları kullanılmalı<br>- Bluetooth bağlantıları şifrelenmeli<br>- Bilinen Bluetooth güvenlik açıklarına karşı korunmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
