# Entegrasyon Test Senaryoları - Harici Sistem

**Tarih:** 17 Haziran 2025
**Hazırlayan:** Can Tekin (DevOps Mühendisi)
**Konu:** ALT_LAS Projesi Beta Test Entegrasyon Test Senaryoları - Harici Sistem

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için harici sistem entegrasyon test senaryolarını içermektedir. Bu test senaryoları, ALT_LAS sisteminin harici sistemlerle doğru şekilde entegre olup olmadığını değerlendirmek için kullanılacaktır.

## 2. S3 Depolama Entegrasyon Test Senaryoları

### 2.1. S3 Depolama Entegrasyon Testi

| Test ID | IT-ES-001 |
|---------|-----------|
| Test Adı | S3 Depolama Entegrasyon Testi |
| Açıklama | Sistemin S3 uyumlu depolama hizmetiyle entegrasyonunu test etme |
| Ön Koşullar | S3 uyumlu depolama hizmeti (AWS S3, MinIO, vb.) yapılandırılmış olmalı |
| Test Adımları | 1. Sistem üzerinden bir dosya yükle<br>2. Dosyanın S3 depolama alanına yüklendiğini doğrula<br>3. S3 depolama alanından bir dosya indir<br>4. İndirilen dosyanın bütünlüğünü kontrol et<br>5. S3 depolama alanından bir dosyayı sil ve silindiğini doğrula |
| Beklenen Sonuç | - Dosya yükleme işlemi başarılı olmalı<br>- Dosya S3 depolama alanında doğru şekilde saklanmalı<br>- Dosya indirme işlemi başarılı olmalı<br>- İndirilen dosya orijinal dosya ile aynı olmalı<br>- Dosya silme işlemi başarılı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. S3 Bucket Yönetimi Testi

| Test ID | IT-ES-002 |
|---------|-----------|
| Test Adı | S3 Bucket Yönetimi Testi |
| Açıklama | Sistemin S3 bucket yönetimi özelliklerinin doğru çalıştığını test etme |
| Ön Koşullar | S3 uyumlu depolama hizmeti yapılandırılmış olmalı |
| Test Adımları | 1. Sistem üzerinden yeni bir bucket oluştur<br>2. Bucket'ın oluşturulduğunu doğrula<br>3. Bucket izinlerini güncelle ve değişikliklerin uygulandığını doğrula<br>4. Bucket yaşam döngüsü kurallarını yapılandır ve doğru uygulandığını doğrula<br>5. Bucket'ı sil ve silindiğini doğrula |
| Beklenen Sonuç | - Bucket oluşturma işlemi başarılı olmalı<br>- Bucket izinleri doğru şekilde güncellenebilmeli<br>- Bucket yaşam döngüsü kuralları doğru şekilde uygulanmalı<br>- Bucket silme işlemi başarılı olmalı<br>- Tüm bucket yönetimi işlemleri günlüklere kaydedilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. S3 Çoklu Bölge Replikasyon Testi

| Test ID | IT-ES-003 |
|---------|-----------|
| Test Adı | S3 Çoklu Bölge Replikasyon Testi |
| Açıklama | S3 çoklu bölge replikasyon özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | S3 uyumlu depolama hizmeti yapılandırılmış olmalı ve çoklu bölge desteği bulunmalı |
| Test Adımları | 1. Çoklu bölge replikasyonunu yapılandır<br>2. Kaynak bucket'a bir dosya yükle<br>3. Dosyanın hedef bucket'a replike edildiğini doğrula<br>4. Kaynak bucket'taki bir dosyayı güncelle ve değişikliklerin hedef bucket'a yansıdığını doğrula<br>5. Kaynak bucket'tan bir dosyayı sil ve silinmenin hedef bucket'a yansıdığını doğrula |
| Beklenen Sonuç | - Çoklu bölge replikasyonu doğru şekilde yapılandırılabilmeli<br>- Dosyalar hedef bucket'a doğru şekilde replike edilmeli<br>- Dosya güncellemeleri hedef bucket'a yansımalı<br>- Dosya silme işlemleri hedef bucket'a yansımalı (yapılandırmaya bağlı)<br>- Replikasyon durumu izlenebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. SMTP Sunucu Entegrasyon Test Senaryoları

### 3.1. SMTP Sunucu Entegrasyon Testi

| Test ID | IT-ES-004 |
|---------|-----------|
| Test Adı | SMTP Sunucu Entegrasyon Testi |
| Açıklama | Sistemin SMTP sunucusuyla entegrasyonunu test etme |
| Ön Koşullar | SMTP sunucusu yapılandırılmış olmalı |
| Test Adımları | 1. Sistem üzerinden bir e-posta gönder<br>2. E-postanın SMTP sunucusu üzerinden gönderildiğini doğrula<br>3. E-postanın alıcıya ulaştığını doğrula<br>4. E-posta içeriğinin doğru olduğunu kontrol et<br>5. E-posta eklerinin doğru şekilde gönderildiğini doğrula |
| Beklenen Sonuç | - E-posta gönderme işlemi başarılı olmalı<br>- E-posta SMTP sunucusu üzerinden doğru şekilde iletilmeli<br>- E-posta alıcıya ulaşmalı<br>- E-posta içeriği doğru olmalı<br>- E-posta ekleri doğru şekilde gönderilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. E-posta Şablonu Testi

| Test ID | IT-ES-005 |
|---------|-----------|
| Test Adı | E-posta Şablonu Testi |
| Açıklama | E-posta şablonlarının doğru şekilde işlendiğini test etme |
| Ön Koşullar | SMTP sunucusu yapılandırılmış olmalı ve e-posta şablonları tanımlanmış olmalı |
| Test Adımları | 1. Farklı e-posta şablonlarını kullanarak e-postalar gönder<br>2. Şablonlardaki değişkenlerin doğru şekilde değiştirildiğini doğrula<br>3. E-posta şablonlarının farklı dillerde doğru şekilde işlendiğini kontrol et<br>4. E-posta şablonlarının farklı e-posta istemcilerinde doğru görüntülendiğini doğrula<br>5. E-posta şablonlarının mobil cihazlarda doğru görüntülendiğini doğrula |
| Beklenen Sonuç | - E-posta şablonları doğru şekilde işlenmeli<br>- Şablonlardaki değişkenler doğru değerlerle değiştirilmeli<br>- Şablonlar farklı dillerde doğru şekilde işlenmeli<br>- Şablonlar farklı e-posta istemcilerinde doğru görüntülenmeli<br>- Şablonlar mobil cihazlarda doğru görüntülenmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Toplu E-posta Gönderimi Testi

| Test ID | IT-ES-006 |
|---------|-----------|
| Test Adı | Toplu E-posta Gönderimi Testi |
| Açıklama | Toplu e-posta gönderim özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | SMTP sunucusu yapılandırılmış olmalı |
| Test Adımları | 1. Sistem üzerinden çok sayıda alıcıya e-posta gönder<br>2. E-postaların SMTP sunucusu üzerinden gönderildiğini doğrula<br>3. E-postaların alıcılara ulaştığını doğrula<br>4. SMTP sunucusu hız sınırlarının aşılmadığını kontrol et<br>5. Başarısız gönderimler için yeniden deneme mekanizmasını test et |
| Beklenen Sonuç | - Toplu e-posta gönderimi başarılı olmalı<br>- E-postalar SMTP sunucusu üzerinden doğru şekilde iletilmeli<br>- E-postalar alıcılara ulaşmalı<br>- SMTP sunucusu hız sınırları aşılmamalı<br>- Başarısız gönderimler için yeniden deneme mekanizması çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. LDAP Entegrasyon Test Senaryoları

### 4.1. LDAP Entegrasyon Testi

| Test ID | IT-ES-007 |
|---------|-----------|
| Test Adı | LDAP Entegrasyon Testi |
| Açıklama | Sistemin LDAP sunucusuyla entegrasyonunu test etme |
| Ön Koşullar | LDAP sunucusu yapılandırılmış olmalı |
| Test Adımları | 1. LDAP kimlik bilgileriyle sisteme giriş yap<br>2. LDAP kullanıcı bilgilerinin doğru şekilde alındığını doğrula<br>3. LDAP grup üyeliklerinin doğru şekilde alındığını doğrula<br>4. LDAP kullanıcı bilgilerinin değiştiğinde sistemde güncellendiğini doğrula<br>5. LDAP bağlantısının kesilmesi durumunda sistemin davranışını test et |
| Beklenen Sonuç | - LDAP kimlik bilgileriyle giriş başarılı olmalı<br>- LDAP kullanıcı bilgileri doğru şekilde alınmalı<br>- LDAP grup üyelikleri doğru şekilde alınmalı<br>- LDAP kullanıcı bilgileri değiştiğinde sistem güncellenebilmeli<br>- LDAP bağlantısı kesildiğinde sistem uygun şekilde davranmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. LDAP Grup Yetkilendirme Testi

| Test ID | IT-ES-008 |
|---------|-----------|
| Test Adı | LDAP Grup Yetkilendirme Testi |
| Açıklama | LDAP grup üyeliklerine dayalı yetkilendirme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | LDAP sunucusu yapılandırılmış olmalı ve grup-rol eşleştirmeleri tanımlanmış olmalı |
| Test Adımları | 1. Farklı LDAP gruplarına üye kullanıcılarla sisteme giriş yap<br>2. Her kullanıcının grup üyeliklerine göre doğru rollere sahip olduğunu doğrula<br>3. Bir kullanıcının LDAP grup üyeliğini değiştir ve rol değişikliğinin sisteme yansıdığını doğrula<br>4. Yetkilendirme kararlarının LDAP grup üyeliklerine göre doğru şekilde uygulandığını test et<br>5. LDAP grup hiyerarşisinin yetkilendirme kararlarına etkisini test et |
| Beklenen Sonuç | - Kullanıcılar LDAP grup üyeliklerine göre doğru rollere sahip olmalı<br>- LDAP grup üyeliği değiştiğinde roller güncellenebilmeli<br>- Yetkilendirme kararları LDAP grup üyeliklerine göre doğru uygulanmalı<br>- LDAP grup hiyerarşisi yetkilendirme kararlarında dikkate alınmalı<br>- Grup-rol eşleştirmeleri doğru şekilde yapılandırılabilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. LDAP Önbellek Testi

| Test ID | IT-ES-009 |
|---------|-----------|
| Test Adı | LDAP Önbellek Testi |
| Açıklama | LDAP önbellekleme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | LDAP sunucusu yapılandırılmış olmalı ve LDAP önbellekleme etkinleştirilmiş olmalı |
| Test Adımları | 1. LDAP kimlik bilgileriyle sisteme giriş yap<br>2. LDAP kullanıcı bilgilerinin önbelleğe alındığını doğrula<br>3. LDAP sunucusu bağlantısını kes ve önbellekteki bilgilerle kimlik doğrulamanın çalıştığını doğrula<br>4. Önbellek süresinin dolmasını bekle ve önbelleğin yenilendiğini doğrula<br>5. Önbellek yapılandırmasını değiştir ve değişikliklerin uygulandığını doğrula |
| Beklenen Sonuç | - LDAP kullanıcı bilgileri önbelleğe alınmalı<br>- LDAP sunucusu bağlantısı kesildiğinde önbellekteki bilgiler kullanılabilmeli<br>- Önbellek süresi dolduğunda önbellek yenilenmeli<br>- Önbellek yapılandırması değiştirilebilmeli<br>- Önbellekleme performansı iyi olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 5. OAuth2 Sağlayıcı Entegrasyon Test Senaryoları

### 5.1. OAuth2 Sağlayıcı Entegrasyon Testi

| Test ID | IT-ES-010 |
|---------|-----------|
| Test Adı | OAuth2 Sağlayıcı Entegrasyon Testi |
| Açıklama | Sistemin OAuth2 sağlayıcılarıyla entegrasyonunu test etme |
| Ön Koşullar | OAuth2 sağlayıcıları (Google, Microsoft, GitHub, vb.) yapılandırılmış olmalı |
| Test Adımları | 1. Farklı OAuth2 sağlayıcılarıyla sisteme giriş yap<br>2. OAuth2 kimlik doğrulama akışının doğru çalıştığını doğrula<br>3. OAuth2 token'larının doğru şekilde alındığını ve kullanıldığını doğrula<br>4. OAuth2 kullanıcı bilgilerinin doğru şekilde alındığını doğrula<br>5. OAuth2 token yenileme mekanizmasının doğru çalıştığını test et |
| Beklenen Sonuç | - OAuth2 sağlayıcılarıyla giriş başarılı olmalı<br>- OAuth2 kimlik doğrulama akışı doğru çalışmalı<br>- OAuth2 token'ları doğru şekilde alınmalı ve kullanılmalı<br>- OAuth2 kullanıcı bilgileri doğru şekilde alınmalı<br>- OAuth2 token yenileme mekanizması doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.2. OAuth2 Kapsam (Scope) Testi

| Test ID | IT-ES-011 |
|---------|-----------|
| Test Adı | OAuth2 Kapsam (Scope) Testi |
| Açıklama | OAuth2 kapsam (scope) mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | OAuth2 sağlayıcıları yapılandırılmış olmalı |
| Test Adımları | 1. Farklı kapsamlarla OAuth2 kimlik doğrulama işlemi gerçekleştir<br>2. İstenen kapsamların OAuth2 sağlayıcısına doğru şekilde iletildiğini doğrula<br>3. Alınan token'ların istenen kapsamları içerdiğini doğrula<br>4. Kapsamlara dayalı yetkilendirme kararlarının doğru uygulandığını test et<br>5. Eksik kapsamlarla yapılan isteklerin reddedildiğini doğrula |
| Beklenen Sonuç | - İstenen kapsamlar OAuth2 sağlayıcısına doğru şekilde iletilmeli<br>- Alınan token'lar istenen kapsamları içermeli<br>- Kapsamlara dayalı yetkilendirme kararları doğru uygulanmalı<br>- Eksik kapsamlarla yapılan istekler reddedilmeli<br>- Kapsam yapılandırması doğru şekilde yönetilebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 5.3. OAuth2 Çoklu Sağlayıcı Testi

| Test ID | IT-ES-012 |
|---------|-----------|
| Test Adı | OAuth2 Çoklu Sağlayıcı Testi |
| Açıklama | Birden fazla OAuth2 sağlayıcısının entegrasyonunu test etme |
| Ön Koşullar | Birden fazla OAuth2 sağlayıcısı yapılandırılmış olmalı |
| Test Adımları | 1. Farklı OAuth2 sağlayıcılarıyla sisteme giriş yap<br>2. Aynı e-posta adresine sahip farklı OAuth2 sağlayıcı hesaplarıyla giriş yapma durumunu test et<br>3. OAuth2 sağlayıcıları arasında geçiş yapma durumunu test et<br>4. Bir OAuth2 sağlayıcısının kullanılamaz olması durumunda sistemin davranışını test et<br>5. OAuth2 sağlayıcı yapılandırmasını değiştir ve değişikliklerin uygulandığını doğrula |
| Beklenen Sonuç | - Farklı OAuth2 sağlayıcılarıyla giriş başarılı olmalı<br>- Aynı e-posta adresine sahip farklı OAuth2 sağlayıcı hesapları doğru şekilde yönetilmeli<br>- OAuth2 sağlayıcıları arasında geçiş yapılabilmeli<br>- Bir OAuth2 sağlayıcısı kullanılamaz olduğunda sistem uygun şekilde davranmalı<br>- OAuth2 sağlayıcı yapılandırması değiştirilebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 6. Prometheus Metrik Entegrasyon Test Senaryoları

### 6.1. Prometheus Metrik Entegrasyon Testi

| Test ID | IT-ES-013 |
|---------|-----------|
| Test Adı | Prometheus Metrik Entegrasyon Testi |
| Açıklama | Sistemin Prometheus ile metrik entegrasyonunu test etme |
| Ön Koşullar | Prometheus yapılandırılmış olmalı ve sistem metrik endpoint'leri açık olmalı |
| Test Adımları | 1. Prometheus'un sistem metriklerini topladığını doğrula<br>2. Farklı sistem bileşenlerinin metriklerinin doğru şekilde raporlandığını kontrol et<br>3. Özel metriklerin doğru şekilde tanımlandığını ve raporlandığını doğrula<br>4. Metrik etiketlerinin doğru şekilde uygulandığını kontrol et<br>5. Metrik toplama aralığının doğru yapılandırıldığını doğrula |
| Beklenen Sonuç | - Prometheus sistem metriklerini toplayabilmeli<br>- Farklı sistem bileşenlerinin metrikleri doğru şekilde raporlanmalı<br>- Özel metrikler doğru şekilde tanımlanmalı ve raporlanmalı<br>- Metrik etiketleri doğru şekilde uygulanmalı<br>- Metrik toplama aralığı doğru yapılandırılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.2. Prometheus Uyarı Testi

| Test ID | IT-ES-014 |
|---------|-----------|
| Test Adı | Prometheus Uyarı Testi |
| Açıklama | Prometheus uyarı mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Prometheus ve AlertManager yapılandırılmış olmalı |
| Test Adımları | 1. Uyarı kurallarının doğru tanımlandığını kontrol et<br>2. Uyarı koşullarını tetikleyecek durumlar oluştur<br>3. Uyarıların doğru şekilde tetiklendiğini doğrula<br>4. Uyarıların doğru hedeflere (e-posta, Slack, PagerDuty, vb.) iletildiğini doğrula<br>5. Uyarı sessizleştirme ve gruplama özelliklerinin doğru çalıştığını test et |
| Beklenen Sonuç | - Uyarı kuralları doğru tanımlanmalı<br>- Uyarılar doğru şekilde tetiklenmeli<br>- Uyarılar doğru hedeflere iletilmeli<br>- Uyarı sessizleştirme ve gruplama özellikleri doğru çalışmalı<br>- Uyarı yapılandırması değiştirilebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 6.3. Prometheus Veri Saklama Testi

| Test ID | IT-ES-015 |
|---------|-----------|
| Test Adı | Prometheus Veri Saklama Testi |
| Açıklama | Prometheus veri saklama mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Prometheus yapılandırılmış olmalı |
| Test Adımları | 1. Prometheus veri saklama yapılandırmasını kontrol et<br>2. Uzun süreli veri saklama için uzak depolama (remote storage) entegrasyonunu test et<br>3. Veri saklama süresi politikalarının doğru uygulandığını doğrula<br>4. Veri sıkıştırma ve örnekleme (downsampling) özelliklerinin doğru çalıştığını test et<br>5. Veri yedekleme ve geri yükleme işlemlerini test et |
| Beklenen Sonuç | - Prometheus veri saklama yapılandırması doğru olmalı<br>- Uzak depolama entegrasyonu doğru çalışmalı<br>- Veri saklama süresi politikaları doğru uygulanmalı<br>- Veri sıkıştırma ve örnekleme özellikleri doğru çalışmalı<br>- Veri yedekleme ve geri yükleme işlemleri başarılı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 7. Grafana Dashboard Entegrasyon Test Senaryoları

### 7.1. Grafana Dashboard Entegrasyon Testi

| Test ID | IT-ES-016 |
|---------|-----------|
| Test Adı | Grafana Dashboard Entegrasyon Testi |
| Açıklama | Sistemin Grafana ile dashboard entegrasyonunu test etme |
| Ön Koşullar | Grafana yapılandırılmış olmalı ve Prometheus veri kaynağı eklenmiş olmalı |
| Test Adımları | 1. Grafana'nın Prometheus veri kaynağına bağlandığını doğrula<br>2. Sistem için oluşturulan dashboardların yüklendiğini kontrol et<br>3. Dashboard panellerinin doğru metrikleri gösterdiğini doğrula<br>4. Dashboard'ların farklı zaman aralıklarında doğru çalıştığını test et<br>5. Dashboard uyarılarının doğru şekilde yapılandırıldığını ve çalıştığını doğrula |
| Beklenen Sonuç | - Grafana Prometheus veri kaynağına bağlanabilmeli<br>- Sistem dashboardları doğru şekilde yüklenmeli<br>- Dashboard panelleri doğru metrikleri göstermeli<br>- Dashboard'lar farklı zaman aralıklarında doğru çalışmalı<br>- Dashboard uyarıları doğru şekilde yapılandırılmalı ve çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 7.2. Grafana Kullanıcı Yönetimi Testi

| Test ID | IT-ES-017 |
|---------|-----------|
| Test Adı | Grafana Kullanıcı Yönetimi Testi |
| Açıklama | Grafana kullanıcı yönetimi entegrasyonunu test etme |
| Ön Koşullar | Grafana yapılandırılmış olmalı ve kimlik doğrulama yapılandırılmış olmalı |
| Test Adımları | 1. Sistem kimlik doğrulama mekanizmasıyla Grafana'ya giriş yap<br>2. Farklı kullanıcı rollerinin (Admin, Editor, Viewer) doğru şekilde atandığını doğrula<br>3. Kullanıcı izinlerinin dashboard ve veri kaynaklarına doğru şekilde uygulandığını test et<br>4. Takım ve organizasyon yapılandırmasının doğru çalıştığını doğrula<br>5. Kullanıcı oturumlarının doğru şekilde yönetildiğini test et |
| Beklenen Sonuç | - Sistem kimlik doğrulama mekanizmasıyla Grafana'ya giriş yapılabilmeli<br>- Kullanıcı rolleri doğru şekilde atanmalı<br>- Kullanıcı izinleri doğru şekilde uygulanmalı<br>- Takım ve organizasyon yapılandırması doğru çalışmalı<br>- Kullanıcı oturumları doğru şekilde yönetilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 7.3. Grafana API Entegrasyon Testi

| Test ID | IT-ES-018 |
|---------|-----------|
| Test Adı | Grafana API Entegrasyon Testi |
| Açıklama | Sistemin Grafana API'si ile entegrasyonunu test etme |
| Ön Koşullar | Grafana yapılandırılmış olmalı ve API erişimi etkinleştirilmiş olmalı |
| Test Adımları | 1. Sistem üzerinden Grafana API'sine erişim sağla<br>2. API üzerinden dashboard oluşturma, güncelleme ve silme işlemlerini test et<br>3. API üzerinden kullanıcı yönetimi işlemlerini test et<br>4. API üzerinden uyarı yapılandırması işlemlerini test et<br>5. API isteklerinin yetkilendirme kontrollerini test et |
| Beklenen Sonuç | - Sistem Grafana API'sine erişebilmeli<br>- Dashboard oluşturma, güncelleme ve silme işlemleri başarılı olmalı<br>- Kullanıcı yönetimi işlemleri başarılı olmalı<br>- Uyarı yapılandırması işlemleri başarılı olmalı<br>- API istekleri için yetkilendirme kontrolleri doğru uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 8. ELK Stack Log Entegrasyon Test Senaryoları

### 8.1. ELK Stack Log Entegrasyon Testi

| Test ID | IT-ES-019 |
|---------|-----------|
| Test Adı | ELK Stack Log Entegrasyon Testi |
| Açıklama | Sistemin ELK Stack ile log entegrasyonunu test etme |
| Ön Koşullar | ELK Stack (Elasticsearch, Logstash, Kibana) yapılandırılmış olmalı |
| Test Adımları | 1. Sistem bileşenlerinin loglarının Logstash'e gönderildiğini doğrula<br>2. Logların Elasticsearch'e doğru şekilde kaydedildiğini kontrol et<br>3. Kibana'da logların görüntülenebildiğini ve sorgulanabildiğini doğrula<br>4. Log formatlarının doğru şekilde ayrıştırıldığını ve yapılandırıldığını test et<br>5. Log rotasyon ve saklama politikalarının doğru uygulandığını doğrula |
| Beklenen Sonuç | - Sistem bileşenlerinin logları Logstash'e gönderilebilmeli<br>- Loglar Elasticsearch'e doğru şekilde kaydedilmeli<br>- Loglar Kibana'da görüntülenebilmeli ve sorgulanabilmeli<br>- Log formatları doğru şekilde ayrıştırılmalı ve yapılandırılmalı<br>- Log rotasyon ve saklama politikaları doğru uygulanmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 8.2. Kibana Dashboard Testi

| Test ID | IT-ES-020 |
|---------|-----------|
| Test Adı | Kibana Dashboard Testi |
| Açıklama | Kibana dashboard'larının doğru çalıştığını test etme |
| Ön Koşullar | ELK Stack yapılandırılmış olmalı ve Kibana dashboard'ları oluşturulmuş olmalı |
| Test Adımları | 1. Sistem için oluşturulan Kibana dashboard'larının yüklendiğini kontrol et<br>2. Dashboard'ların doğru log verilerini gösterdiğini doğrula<br>3. Dashboard'ların farklı zaman aralıklarında doğru çalıştığını test et<br>4. Dashboard filtrelerinin ve sorgularının doğru çalıştığını doğrula<br>5. Dashboard'ların farklı kullanıcı rolleri için doğru erişim kontrollerine sahip olduğunu test et |
| Beklenen Sonuç | - Kibana dashboard'ları doğru şekilde yüklenmeli<br>- Dashboard'lar doğru log verilerini göstermeli<br>- Dashboard'lar farklı zaman aralıklarında doğru çalışmalı<br>- Dashboard filtreleri ve sorguları doğru çalışmalı<br>- Dashboard'lar doğru erişim kontrollerine sahip olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 8.3. Log Uyarı Testi

| Test ID | IT-ES-021 |
|---------|-----------|
| Test Adı | Log Uyarı Testi |
| Açıklama | Log tabanlı uyarı mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | ELK Stack yapılandırılmış olmalı ve log uyarıları tanımlanmış olmalı |
| Test Adımları | 1. Log uyarı kurallarının doğru tanımlandığını kontrol et<br>2. Uyarı koşullarını tetikleyecek loglar oluştur<br>3. Uyarıların doğru şekilde tetiklendiğini doğrula<br>4. Uyarıların doğru hedeflere (e-posta, Slack, PagerDuty, vb.) iletildiğini doğrula<br>5. Uyarı sessizleştirme ve gruplama özelliklerinin doğru çalıştığını test et |
| Beklenen Sonuç | - Log uyarı kuralları doğru tanımlanmalı<br>- Uyarılar doğru şekilde tetiklenmeli<br>- Uyarılar doğru hedeflere iletilmeli<br>- Uyarı sessizleştirme ve gruplama özellikleri doğru çalışmalı<br>- Uyarı yapılandırması değiştirilebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 9. Harici AI Model API Entegrasyon Test Senaryoları

### 9.1. Harici AI Model API Entegrasyon Testi

| Test ID | IT-ES-022 |
|---------|-----------|
| Test Adı | Harici AI Model API Entegrasyon Testi |
| Açıklama | Sistemin harici AI model API'leriyle entegrasyonunu test etme |
| Ön Koşullar | Harici AI model API'leri (OpenAI, Hugging Face, vb.) yapılandırılmış olmalı |
| Test Adımları | 1. Sistem üzerinden harici AI model API'lerine istek gönder<br>2. API isteklerinin doğru formatta gönderildiğini doğrula<br>3. API yanıtlarının doğru şekilde alındığını ve işlendiğini kontrol et<br>4. API hata durumlarının doğru şekilde ele alındığını test et<br>5. API kimlik doğrulama ve yetkilendirme mekanizmalarının doğru çalıştığını doğrula |
| Beklenen Sonuç | - Sistem harici AI model API'lerine istek gönderebilmeli<br>- API istekleri doğru formatta gönderilmeli<br>- API yanıtları doğru şekilde alınmalı ve işlenmeli<br>- API hata durumları doğru şekilde ele alınmalı<br>- API kimlik doğrulama ve yetkilendirme mekanizmaları doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 9.2. AI Model Önbellek Testi

| Test ID | IT-ES-023 |
|---------|-----------|
| Test Adı | AI Model Önbellek Testi |
| Açıklama | AI model sonuçlarının önbellekleme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Harici AI model API'leri yapılandırılmış olmalı ve önbellekleme etkinleştirilmiş olmalı |
| Test Adımları | 1. Aynı girdi ile bir AI model API'sine birden fazla istek gönder<br>2. İlk isteğin API'ye gönderildiğini, sonraki isteklerin önbellekten yanıtlandığını doğrula<br>3. Önbellek süresinin dolmasını bekle ve yeni isteğin API'ye gönderildiğini doğrula<br>4. Önbellek yapılandırmasını değiştir ve değişikliklerin uygulandığını doğrula<br>5. Önbellek isabet oranını (cache hit ratio) ölç |
| Beklenen Sonuç | - İlk istek API'ye gönderilmeli, sonraki istekler önbellekten yanıtlanmalı<br>- Önbellek süresi dolduğunda yeni istek API'ye gönderilmeli<br>- Önbellek yapılandırması değiştirilebilmeli<br>- Önbellek isabet oranı yüksek olmalı<br>- Önbellekleme performansı iyi olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 9.3. AI Model Yük Dengeleme Testi

| Test ID | IT-ES-024 |
|---------|-----------|
| Test Adı | AI Model Yük Dengeleme Testi |
| Açıklama | AI model API isteklerinin yük dengeleme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Birden fazla AI model API sağlayıcısı yapılandırılmış olmalı ve yük dengeleme etkinleştirilmiş olmalı |
| Test Adımları | 1. Sistem üzerinden çok sayıda AI model API isteği gönder<br>2. İsteklerin farklı API sağlayıcılarına dağıtıldığını doğrula<br>3. Bir API sağlayıcısının kullanılamaz olması durumunda isteklerin diğer sağlayıcılara yönlendirildiğini test et<br>4. Yük dengeleme algoritmasının (round-robin, least connections, vb.) doğru çalıştığını kontrol et<br>5. API sağlayıcılarının hız sınırlarının aşılmadığını doğrula |
| Beklenen Sonuç | - İstekler farklı API sağlayıcılarına dağıtılmalı<br>- Bir API sağlayıcısı kullanılamaz olduğunda istekler diğer sağlayıcılara yönlendirilmeli<br>- Yük dengeleme algoritması doğru çalışmalı<br>- API sağlayıcılarının hız sınırları aşılmamalı<br>- Yük dengeleme performansı iyi olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 10. Webhook Entegrasyon Test Senaryoları

### 10.1. Webhook Entegrasyon Testi

| Test ID | IT-ES-025 |
|---------|-----------|
| Test Adı | Webhook Entegrasyon Testi |
| Açıklama | Sistemin webhook mekanizmasının entegrasyonunu test etme |
| Ön Koşullar | Webhook mekanizması yapılandırılmış olmalı |
| Test Adımları | 1. Webhook tetikleyecek olaylar oluştur<br>2. Webhook'ların doğru hedeflere gönderildiğini doğrula<br>3. Webhook içeriğinin doğru formatta olduğunu kontrol et<br>4. Webhook alıcılarının webhook'ları doğru şekilde işlediğini doğrula<br>5. Webhook hata durumlarının doğru şekilde ele alındığını test et |
| Beklenen Sonuç | - Webhook'lar doğru hedeflere gönderilmeli<br>- Webhook içeriği doğru formatta olmalı<br>- Webhook alıcıları webhook'ları doğru şekilde işlemeli<br>- Webhook hata durumları doğru şekilde ele alınmalı<br>- Webhook mekanizması performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 10.2. Webhook Güvenlik Testi

| Test ID | IT-ES-026 |
|---------|-----------|
| Test Adı | Webhook Güvenlik Testi |
| Açıklama | Webhook güvenlik mekanizmalarının doğru çalıştığını test etme |
| Ön Koşullar | Webhook mekanizması yapılandırılmış olmalı ve güvenlik özellikleri etkinleştirilmiş olmalı |
| Test Adımları | 1. Webhook imzalama mekanizmasının doğru çalıştığını test et<br>2. Webhook alıcılarının imza doğrulamasını doğru şekilde gerçekleştirdiğini doğrula<br>3. Webhook kimlik doğrulama mekanizmasının doğru çalıştığını test et<br>4. Webhook HTTPS kullanımını ve sertifika doğrulamasını kontrol et<br>5. Webhook içeriğinde hassas bilgilerin korunduğunu doğrula |
| Beklenen Sonuç | - Webhook imzalama mekanizması doğru çalışmalı<br>- Webhook alıcıları imza doğrulamasını doğru şekilde gerçekleştirmeli<br>- Webhook kimlik doğrulama mekanizması doğru çalışmalı<br>- Webhook'lar HTTPS üzerinden gönderilmeli ve sertifikalar doğrulanmalı<br>- Webhook içeriğinde hassas bilgiler korunmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 10.3. Webhook Yeniden Deneme Testi

| Test ID | IT-ES-027 |
|---------|-----------|
| Test Adı | Webhook Yeniden Deneme Testi |
| Açıklama | Webhook yeniden deneme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Webhook mekanizması yapılandırılmış olmalı ve yeniden deneme özelliği etkinleştirilmiş olmalı |
| Test Adımları | 1. Webhook alıcısını geçici olarak kullanılamaz hale getir<br>2. Webhook tetikleyecek bir olay oluştur<br>3. Webhook gönderiminin başarısız olduğunu ve yeniden deneme kuyruğuna eklendiğini doğrula<br>4. Webhook alıcısını tekrar kullanılabilir hale getir<br>5. Webhook'un yeniden denendiğini ve başarılı olduğunu doğrula |
| Beklenen Sonuç | - Webhook gönderimi başarısız olduğunda yeniden deneme kuyruğuna eklenmeli<br>- Webhook yeniden deneme stratejisi (üstel geri çekilme, vb.) doğru uygulanmalı<br>- Webhook alıcısı kullanılabilir hale geldiğinde webhook başarıyla gönderilmeli<br>- Maksimum yeniden deneme sayısı aşıldığında uygun şekilde davranılmalı<br>- Yeniden deneme durumu izlenebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
