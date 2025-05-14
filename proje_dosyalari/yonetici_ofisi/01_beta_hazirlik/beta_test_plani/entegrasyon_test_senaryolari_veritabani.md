# Entegrasyon Test Senaryoları - Veritabanı

**Tarih:** 17 Haziran 2025
**Hazırlayan:** Can Tekin (DevOps Mühendisi)
**Konu:** ALT_LAS Projesi Beta Test Entegrasyon Test Senaryoları - Veritabanı

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için veritabanı entegrasyon test senaryolarını içermektedir. Bu test senaryoları, ALT_LAS sisteminin veritabanları ile doğru şekilde entegre olup olmadığını değerlendirmek için kullanılacaktır.

## 2. PostgreSQL Entegrasyon Test Senaryoları

### 2.1. API Gateway - PostgreSQL Entegrasyon Testi

| Test ID | IT-DB-001 |
|---------|-----------|
| Test Adı | API Gateway - PostgreSQL Entegrasyon Testi |
| Açıklama | API Gateway'in PostgreSQL veritabanı ile entegrasyonunu test etme |
| Ön Koşullar | API Gateway ve PostgreSQL veritabanı çalışır durumda olmalı |
| Test Adımları | 1. API Gateway üzerinden kullanıcı kimlik doğrulama işlemi gerçekleştir<br>2. API Gateway'in PostgreSQL'deki kullanıcı tablosuna eriştiğini doğrula<br>3. Yeni bir kullanıcı oluştur ve veritabanına eklendiğini doğrula<br>4. Kullanıcı bilgilerini güncelle ve değişikliklerin veritabanına yansıdığını doğrula<br>5. Kullanıcıyı sil ve veritabanından kaldırıldığını doğrula |
| Beklenen Sonuç | - API Gateway PostgreSQL veritabanına bağlanabilmeli<br>- Kullanıcı kimlik doğrulama işlemi doğru çalışmalı<br>- Kullanıcı CRUD işlemleri veritabanına doğru şekilde yansımalı<br>- Veritabanı bağlantı havuzu doğru yapılandırılmış olmalı<br>- Veritabanı işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. Runner Service - PostgreSQL Entegrasyon Testi

| Test ID | IT-DB-002 |
|---------|-----------|
| Test Adı | Runner Service - PostgreSQL Entegrasyon Testi |
| Açıklama | Runner Service'in PostgreSQL veritabanı ile entegrasyonunu test etme |
| Ön Koşullar | Runner Service ve PostgreSQL veritabanı çalışır durumda olmalı |
| Test Adımları | 1. Runner Service üzerinden bir iş oluştur<br>2. İşin PostgreSQL'deki jobs tablosuna eklendiğini doğrula<br>3. İşin durumunu güncelle ve değişikliklerin veritabanına yansıdığını doğrula<br>4. İşleri filtrele ve doğru sonuçların döndüğünü doğrula<br>5. İşi sil ve veritabanından kaldırıldığını doğrula |
| Beklenen Sonuç | - Runner Service PostgreSQL veritabanına bağlanabilmeli<br>- İş CRUD işlemleri veritabanına doğru şekilde yansımalı<br>- İş durumu güncellemeleri veritabanına doğru şekilde yansımalı<br>- Filtreleme sorguları doğru sonuçlar döndürmeli<br>- Veritabanı işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. PostgreSQL Bağlantı Havuzu Testi

| Test ID | IT-DB-003 |
|---------|-----------|
| Test Adı | PostgreSQL Bağlantı Havuzu Testi |
| Açıklama | PostgreSQL bağlantı havuzunun doğru çalıştığını test etme |
| Ön Koşullar | PostgreSQL veritabanı çalışır durumda olmalı ve bağlantı havuzu yapılandırılmış olmalı |
| Test Adımları | 1. Eşzamanlı olarak çok sayıda veritabanı isteği gönder<br>2. Bağlantı havuzunun bağlantıları yeniden kullandığını doğrula<br>3. Maksimum bağlantı sayısına ulaşıldığında davranışı gözlemle<br>4. Bağlantı zaman aşımı durumunda davranışı gözlemle<br>5. Bağlantı havuzu metriklerini kontrol et (aktif bağlantılar, bekleyen bağlantılar, vb.) |
| Beklenen Sonuç | - Bağlantı havuzu bağlantıları yeniden kullanmalı<br>- Maksimum bağlantı sayısına ulaşıldığında istekler kuyruğa alınmalı<br>- Bağlantı zaman aşımı durumunda bağlantılar yenilenmeli<br>- Bağlantı havuzu metrikleri doğru raporlanmalı<br>- Bağlantı havuzu yüksek yük altında performanslı çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. PostgreSQL Şema Migrasyon Testi

| Test ID | IT-DB-004 |
|---------|-----------|
| Test Adı | PostgreSQL Şema Migrasyon Testi |
| Açıklama | PostgreSQL şema migrasyon işlemlerinin doğru çalıştığını test etme |
| Ön Koşullar | PostgreSQL veritabanı çalışır durumda olmalı ve migrasyon araçları yapılandırılmış olmalı |
| Test Adımları | 1. Mevcut veritabanı şemasını kontrol et<br>2. Yeni bir migrasyon betiği oluştur (tablo ekleme, sütun ekleme, vb.)<br>3. Migrasyon işlemini çalıştır<br>4. Şema değişikliklerinin uygulandığını doğrula<br>5. Geri alma (rollback) işlemini test et |
| Beklenen Sonuç | - Migrasyon işlemi başarıyla tamamlanmalı<br>- Şema değişiklikleri doğru şekilde uygulanmalı<br>- Migrasyon geçmişi kaydedilmeli<br>- Geri alma işlemi doğru çalışmalı<br>- Migrasyon işlemi veri kaybına neden olmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. PostgreSQL Yedekleme ve Geri Yükleme Testi

| Test ID | IT-DB-005 |
|---------|-----------|
| Test Adı | PostgreSQL Yedekleme ve Geri Yükleme Testi |
| Açıklama | PostgreSQL yedekleme ve geri yükleme işlemlerinin doğru çalıştığını test etme |
| Ön Koşullar | PostgreSQL veritabanı çalışır durumda olmalı ve yedekleme araçları yapılandırılmış olmalı |
| Test Adımları | 1. Veritabanının tam bir yedeğini al<br>2. Veritabanına yeni veriler ekle<br>3. Yedeği farklı bir veritabanına geri yükle<br>4. Geri yüklenen veritabanının tutarlılığını kontrol et<br>5. Belirli bir zamana geri yükleme (point-in-time recovery) işlemini test et |
| Beklenen Sonuç | - Yedekleme işlemi başarıyla tamamlanmalı<br>- Geri yükleme işlemi başarıyla tamamlanmalı<br>- Geri yüklenen veritabanı tutarlı olmalı<br>- Belirli bir zamana geri yükleme işlemi doğru çalışmalı<br>- Yedekleme ve geri yükleme işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. MongoDB Entegrasyon Test Senaryoları

### 3.1. Segmentation Service - MongoDB Entegrasyon Testi

| Test ID | IT-DB-006 |
|---------|-----------|
| Test Adı | Segmentation Service - MongoDB Entegrasyon Testi |
| Açıklama | Segmentation Service'in MongoDB veritabanı ile entegrasyonunu test etme |
| Ön Koşullar | Segmentation Service ve MongoDB veritabanı çalışır durumda olmalı |
| Test Adımları | 1. Segmentation Service üzerinden bir segmentasyon işi oluştur<br>2. İşin MongoDB'deki segmentation_jobs koleksiyonuna eklendiğini doğrula<br>3. Segmentasyon sonuçlarının MongoDB'ye kaydedildiğini doğrula<br>4. Segmentasyon işlerini filtrele ve doğru sonuçların döndüğünü doğrula<br>5. İşi sil ve veritabanından kaldırıldığını doğrula |
| Beklenen Sonuç | - Segmentation Service MongoDB veritabanına bağlanabilmeli<br>- Segmentasyon işleri ve sonuçları veritabanına doğru şekilde kaydedilmeli<br>- Filtreleme sorguları doğru sonuçlar döndürmeli<br>- Büyük segmentasyon sonuçları verimli şekilde depolanmalı<br>- Veritabanı işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. AI Orchestrator - MongoDB Entegrasyon Testi

| Test ID | IT-DB-007 |
|---------|-----------|
| Test Adı | AI Orchestrator - MongoDB Entegrasyon Testi |
| Açıklama | AI Orchestrator'ın MongoDB veritabanı ile entegrasyonunu test etme |
| Ön Koşullar | AI Orchestrator ve MongoDB veritabanı çalışır durumda olmalı |
| Test Adımları | 1. AI Orchestrator üzerinden bir model ekle<br>2. Modelin MongoDB'deki models koleksiyonuna eklendiğini doğrula<br>3. Model parametrelerini güncelle ve değişikliklerin veritabanına yansıdığını doğrula<br>4. Modelleri filtrele ve doğru sonuçların döndüğünü doğrula<br>5. Modeli sil ve veritabanından kaldırıldığını doğrula |
| Beklenen Sonuç | - AI Orchestrator MongoDB veritabanına bağlanabilmeli<br>- Model CRUD işlemleri veritabanına doğru şekilde yansımalı<br>- Filtreleme sorguları doğru sonuçlar döndürmeli<br>- Büyük model dosyaları verimli şekilde depolanmalı<br>- Veritabanı işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. MongoDB Bağlantı Havuzu Testi

| Test ID | IT-DB-008 |
|---------|-----------|
| Test Adı | MongoDB Bağlantı Havuzu Testi |
| Açıklama | MongoDB bağlantı havuzunun doğru çalıştığını test etme |
| Ön Koşullar | MongoDB veritabanı çalışır durumda olmalı ve bağlantı havuzu yapılandırılmış olmalı |
| Test Adımları | 1. Eşzamanlı olarak çok sayıda veritabanı isteği gönder<br>2. Bağlantı havuzunun bağlantıları yeniden kullandığını doğrula<br>3. Maksimum bağlantı sayısına ulaşıldığında davranışı gözlemle<br>4. Bağlantı zaman aşımı durumunda davranışı gözlemle<br>5. Bağlantı havuzu metriklerini kontrol et (aktif bağlantılar, bekleyen bağlantılar, vb.) |
| Beklenen Sonuç | - Bağlantı havuzu bağlantıları yeniden kullanmalı<br>- Maksimum bağlantı sayısına ulaşıldığında istekler kuyruğa alınmalı<br>- Bağlantı zaman aşımı durumunda bağlantılar yenilenmeli<br>- Bağlantı havuzu metrikleri doğru raporlanmalı<br>- Bağlantı havuzu yüksek yük altında performanslı çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. MongoDB Şema Doğrulama Testi

| Test ID | IT-DB-009 |
|---------|-----------|
| Test Adı | MongoDB Şema Doğrulama Testi |
| Açıklama | MongoDB şema doğrulama özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | MongoDB veritabanı çalışır durumda olmalı ve şema doğrulama yapılandırılmış olmalı |
| Test Adımları | 1. Şema doğrulama kuralları tanımlanmış bir koleksiyonu kontrol et<br>2. Geçerli bir doküman ekle ve başarılı olduğunu doğrula<br>3. Geçersiz bir doküman ekle ve reddedildiğini doğrula<br>4. Şema doğrulama kurallarını güncelle<br>5. Güncellenen kurallara göre doküman ekleme işlemlerini test et |
| Beklenen Sonuç | - Şema doğrulama kuralları doğru uygulanmalı<br>- Geçerli dokümanlar kabul edilmeli<br>- Geçersiz dokümanlar reddedilmeli<br>- Şema doğrulama kuralları güncellenebilmeli<br>- Şema doğrulama performansı etkilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.5. MongoDB Yedekleme ve Geri Yükleme Testi

| Test ID | IT-DB-010 |
|---------|-----------|
| Test Adı | MongoDB Yedekleme ve Geri Yükleme Testi |
| Açıklama | MongoDB yedekleme ve geri yükleme işlemlerinin doğru çalıştığını test etme |
| Ön Koşullar | MongoDB veritabanı çalışır durumda olmalı ve yedekleme araçları yapılandırılmış olmalı |
| Test Adımları | 1. Veritabanının tam bir yedeğini al (mongodump)<br>2. Veritabanına yeni veriler ekle<br>3. Yedeği farklı bir veritabanına geri yükle (mongorestore)<br>4. Geri yüklenen veritabanının tutarlılığını kontrol et<br>5. Oplog kullanarak belirli bir zamana geri yükleme işlemini test et |
| Beklenen Sonuç | - Yedekleme işlemi başarıyla tamamlanmalı<br>- Geri yükleme işlemi başarıyla tamamlanmalı<br>- Geri yüklenen veritabanı tutarlı olmalı<br>- Belirli bir zamana geri yükleme işlemi doğru çalışmalı<br>- Yedekleme ve geri yükleme işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Redis Entegrasyon Test Senaryoları

### 4.1. API Gateway - Redis Entegrasyon Testi

| Test ID | IT-DB-011 |
|---------|-----------|
| Test Adı | API Gateway - Redis Entegrasyon Testi |
| Açıklama | API Gateway'in Redis ile entegrasyonunu test etme |
| Ön Koşullar | API Gateway ve Redis çalışır durumda olmalı |
| Test Adımları | 1. API Gateway üzerinden bir istek gönder<br>2. API Gateway'in Redis'i önbellek olarak kullandığını doğrula<br>3. Aynı isteği tekrar gönder ve önbellekten yanıt alındığını doğrula<br>4. Önbellek süresinin dolmasını bekle ve isteği tekrar gönder<br>5. Önbelleğin temizlendiğini ve yeni bir yanıt alındığını doğrula |
| Beklenen Sonuç | - API Gateway Redis'e bağlanabilmeli<br>- İstekler önbelleklenebilmeli<br>- Önbelleklenen yanıtlar doğru şekilde alınabilmeli<br>- Önbellek süresi doğru şekilde uygulanmalı<br>- Önbellek performansı iyi olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Runner Service - Redis Entegrasyon Testi

| Test ID | IT-DB-012 |
|---------|-----------|
| Test Adı | Runner Service - Redis Entegrasyon Testi |
| Açıklama | Runner Service'in Redis ile entegrasyonunu test etme |
| Ön Koşullar | Runner Service ve Redis çalışır durumda olmalı |
| Test Adımları | 1. Runner Service üzerinden bir iş oluştur<br>2. Runner Service'in iş durumunu Redis'e kaydettiğini doğrula<br>3. İş durumunu güncelle ve Redis'teki değerin güncellendiğini doğrula<br>4. Redis'teki iş durumunu sorgula<br>5. Redis'teki iş durumunu sil ve silindiğini doğrula |
| Beklenen Sonuç | - Runner Service Redis'e bağlanabilmeli<br>- İş durumları Redis'e kaydedilebilmeli<br>- İş durumu güncellemeleri Redis'e yansımalı<br>- Redis'teki iş durumları sorgulanabilmeli<br>- Redis işlemleri performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Redis Oturum Yönetimi Testi

| Test ID | IT-DB-013 |
|---------|-----------|
| Test Adı | Redis Oturum Yönetimi Testi |
| Açıklama | Redis'in oturum yönetimi için kullanımını test etme |
| Ön Koşullar | API Gateway ve Redis çalışır durumda olmalı |
| Test Adımları | 1. Kullanıcı girişi yap ve oturum bilgilerinin Redis'e kaydedildiğini doğrula<br>2. Oturum bilgilerini kullanarak kimlik doğrulamalı bir istek gönder<br>3. Oturum süresinin dolmasını bekle ve isteği tekrar gönder<br>4. Çıkış yap ve oturum bilgilerinin Redis'ten silindiğini doğrula<br>5. Birden fazla cihazdan giriş yaparak oturum yönetimini test et |
| Beklenen Sonuç | - Oturum bilgileri Redis'e kaydedilebilmeli<br>- Oturum bilgileri kimlik doğrulama için kullanılabilmeli<br>- Oturum süresi doğru şekilde uygulanmalı<br>- Çıkış yapıldığında oturum bilgileri silinmeli<br>- Çoklu cihaz oturumları doğru yönetilebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.4. Redis Önbellek Performansı Testi

| Test ID | IT-DB-014 |
|---------|-----------|
| Test Adı | Redis Önbellek Performansı Testi |
| Açıklama | Redis önbellek performansını test etme |
| Ön Koşullar | Redis çalışır durumda olmalı |
| Test Adımları | 1. Farklı boyutlarda verileri Redis'e kaydet<br>2. Verileri okuma performansını ölç<br>3. Yüksek yük altında Redis performansını test et<br>4. Önbellek isabet oranını (cache hit ratio) ölç<br>5. Redis bellek kullanımını izle |
| Beklenen Sonuç | - Veri okuma/yazma performansı iyi olmalı<br>- Yüksek yük altında performans kabul edilebilir seviyede olmalı<br>- Önbellek isabet oranı yüksek olmalı<br>- Bellek kullanımı verimli olmalı<br>- Redis performansı sistem performansını olumlu etkilemeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.5. Redis Yük Devretme Testi

| Test ID | IT-DB-015 |
|---------|-----------|
| Test Adı | Redis Yük Devretme Testi |
| Açıklama | Redis yük devretme (failover) özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | Redis Sentinel veya Redis Cluster yapılandırılmış olmalı |
| Test Adımları | 1. Redis master node'una veri yaz<br>2. Master node'u devre dışı bırak<br>3. Sentinel veya Cluster'ın yeni bir master seçtiğini doğrula<br>4. Yeni master'a veri yazabildiğini ve okuyabildiğini doğrula<br>5. Eski master'ı tekrar çalıştır ve slave olarak yapılandırıldığını doğrula |
| Beklenen Sonuç | - Yük devretme mekanizması doğru çalışmalı<br>- Yeni master otomatik olarak seçilmeli<br>- Veri kaybı olmamalı<br>- Yük devretme süresi kabul edilebilir seviyede olmalı<br>- Eski master slave olarak yapılandırılmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |
