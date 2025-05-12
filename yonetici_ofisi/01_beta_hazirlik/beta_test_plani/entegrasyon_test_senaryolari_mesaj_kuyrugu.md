# Entegrasyon Test Senaryoları - Mesaj Kuyruğu

**Tarih:** 17 Haziran 2025
**Hazırlayan:** Can Tekin (DevOps Mühendisi)
**Konu:** ALT_LAS Projesi Beta Test Entegrasyon Test Senaryoları - Mesaj Kuyruğu

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için mesaj kuyruğu entegrasyon test senaryolarını içermektedir. Bu test senaryoları, ALT_LAS sisteminin mesaj kuyruğu sistemleriyle doğru şekilde entegre olup olmadığını değerlendirmek için kullanılacaktır.

## 2. RabbitMQ Entegrasyon Test Senaryoları

### 2.1. RabbitMQ Üretici-Tüketici Entegrasyon Testi

| Test ID | IT-MQ-001 |
|---------|-----------|
| Test Adı | RabbitMQ Üretici-Tüketici Entegrasyon Testi |
| Açıklama | RabbitMQ üretici ve tüketici entegrasyonunu test etme |
| Ön Koşullar | RabbitMQ çalışır durumda olmalı ve ilgili servisler yapılandırılmış olmalı |
| Test Adımları | 1. Üretici servis üzerinden bir mesaj gönder<br>2. Mesajın RabbitMQ kuyruğuna eklendiğini doğrula<br>3. Tüketici servisin mesajı kuyruğundan aldığını doğrula<br>4. Tüketici servisin mesajı doğru şekilde işlediğini kontrol et<br>5. Farklı mesaj türleri ve boyutları için testi tekrarla |
| Beklenen Sonuç | - Üretici servis mesajları RabbitMQ kuyruğuna ekleyebilmeli<br>- Mesajlar RabbitMQ kuyruğunda doğru şekilde saklanmalı<br>- Tüketici servis mesajları kuyruğundan alabilmeli<br>- Tüketici servis mesajları doğru şekilde işleyebilmeli<br>- Farklı mesaj türleri ve boyutları doğru şekilde işlenebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.2. RabbitMQ Mesaj Kalıcılığı Testi

| Test ID | IT-MQ-002 |
|---------|-----------|
| Test Adı | RabbitMQ Mesaj Kalıcılığı Testi |
| Açıklama | RabbitMQ mesaj kalıcılığı özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | RabbitMQ çalışır durumda olmalı ve kalıcı kuyruklar yapılandırılmış olmalı |
| Test Adımları | 1. Kalıcı bir kuyruğa mesajlar gönder<br>2. RabbitMQ sunucusunu yeniden başlat<br>3. Sunucu yeniden başladıktan sonra mesajların hala kuyrukta olduğunu doğrula<br>4. Tüketici servisin mesajları alabildiğini ve işleyebildiğini kontrol et<br>5. Kalıcı olmayan bir kuyrukla karşılaştırma testi yap |
| Beklenen Sonuç | - Kalıcı kuyruktaki mesajlar RabbitMQ yeniden başlatıldıktan sonra korunmalı<br>- Tüketici servis yeniden başlatma sonrası mesajları alabilmeli<br>- Mesaj içeriği ve özellikleri korunmalı<br>- Kalıcı olmayan kuyruktaki mesajlar yeniden başlatma sonrası kaybolmalı<br>- Mesaj kalıcılığı yapılandırması doğru çalışmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.3. RabbitMQ Mesaj Yönlendirme Testi

| Test ID | IT-MQ-003 |
|---------|-----------|
| Test Adı | RabbitMQ Mesaj Yönlendirme Testi |
| Açıklama | RabbitMQ mesaj yönlendirme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | RabbitMQ çalışır durumda olmalı ve exchange'ler yapılandırılmış olmalı |
| Test Adımları | 1. Farklı exchange türleri (direct, topic, fanout, headers) için mesajlar gönder<br>2. Mesajların doğru kuyruklara yönlendirildiğini doğrula<br>3. Yönlendirme anahtarlarının (routing keys) doğru çalıştığını kontrol et<br>4. Birden fazla kuyruğa yönlendirilen mesajların tüm hedef kuyruklara ulaştığını doğrula<br>5. Yönlendirme kurallarını değiştir ve değişikliklerin doğru uygulandığını test et |
| Beklenen Sonuç | - Farklı exchange türleri doğru çalışmalı<br>- Mesajlar yönlendirme anahtarlarına göre doğru kuyruklara yönlendirilmeli<br>- Birden fazla kuyruğa yönlendirilen mesajlar tüm hedef kuyruklara ulaşmalı<br>- Yönlendirme kuralları değişiklikleri doğru uygulanmalı<br>- Yönlendirme mekanizması performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.4. RabbitMQ Ölü Mektup Kuyruğu Testi

| Test ID | IT-MQ-004 |
|---------|-----------|
| Test Adı | RabbitMQ Ölü Mektup Kuyruğu Testi |
| Açıklama | RabbitMQ ölü mektup kuyruğu mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | RabbitMQ çalışır durumda olmalı ve ölü mektup kuyruğu yapılandırılmış olmalı |
| Test Adımları | 1. Tüketici servisin reddedebileceği bir mesaj gönder<br>2. Tüketici servisin mesajı reddettiğini (nack) doğrula<br>3. Mesajın ölü mektup kuyruğuna yönlendirildiğini kontrol et<br>4. Mesaj TTL (Time-To-Live) süresi dolan bir mesaj gönder ve ölü mektup kuyruğuna yönlendirildiğini doğrula<br>5. Ölü mektup kuyruğundaki mesajların işlenmesini test et |
| Beklenen Sonuç | - Reddedilen mesajlar ölü mektup kuyruğuna yönlendirilmeli<br>- TTL süresi dolan mesajlar ölü mektup kuyruğuna yönlendirilmeli<br>- Ölü mektup kuyruğundaki mesajlar orijinal içeriklerini korumalı<br>- Ölü mektup kuyruğundaki mesajlar işlenebilmeli<br>- Ölü mektup kuyruğu mekanizması hata durumlarında güvenilir olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 2.5. RabbitMQ Yük Devretme Testi

| Test ID | IT-MQ-005 |
|---------|-----------|
| Test Adı | RabbitMQ Yük Devretme Testi |
| Açıklama | RabbitMQ yük devretme özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | RabbitMQ küme (cluster) yapılandırılmış olmalı |
| Test Adımları | 1. RabbitMQ kümesine mesajlar gönder<br>2. Ana (master) RabbitMQ node'unu devre dışı bırak<br>3. Yük devretme işleminin gerçekleştiğini ve yedek node'un aktif hale geldiğini doğrula<br>4. Mesaj gönderme ve alma işlemlerinin kesintisiz devam ettiğini kontrol et<br>5. Ana node'u tekrar aktif hale getir ve kümenin normal durumuna döndüğünü doğrula |
| Beklenen Sonuç | - Yük devretme işlemi otomatik olarak gerçekleşmeli<br>- Yedek node aktif hale gelmeli<br>- Mesaj gönderme ve alma işlemleri kesintisiz devam etmeli<br>- Ana node tekrar aktif hale geldiğinde küme normal durumuna dönmeli<br>- Yük devretme sırasında veri kaybı olmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 3. Kafka Entegrasyon Test Senaryoları

### 3.1. Kafka Üretici-Tüketici Entegrasyon Testi

| Test ID | IT-MQ-006 |
|---------|-----------|
| Test Adı | Kafka Üretici-Tüketici Entegrasyon Testi |
| Açıklama | Kafka üretici ve tüketici entegrasyonunu test etme |
| Ön Koşullar | Kafka çalışır durumda olmalı ve ilgili servisler yapılandırılmış olmalı |
| Test Adımları | 1. Üretici servis üzerinden bir mesaj gönder<br>2. Mesajın Kafka konusuna (topic) eklendiğini doğrula<br>3. Tüketici servisin mesajı konudan aldığını doğrula<br>4. Tüketici servisin mesajı doğru şekilde işlediğini kontrol et<br>5. Farklı mesaj türleri ve boyutları için testi tekrarla |
| Beklenen Sonuç | - Üretici servis mesajları Kafka konusuna ekleyebilmeli<br>- Mesajlar Kafka konusunda doğru şekilde saklanmalı<br>- Tüketici servis mesajları konudan alabilmeli<br>- Tüketici servis mesajları doğru şekilde işleyebilmeli<br>- Farklı mesaj türleri ve boyutları doğru şekilde işlenebilmeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.2. Kafka Konu Bölümlendirme Testi

| Test ID | IT-MQ-007 |
|---------|-----------|
| Test Adı | Kafka Konu Bölümlendirme Testi |
| Açıklama | Kafka konu bölümlendirme mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Kafka çalışır durumda olmalı ve çoklu bölümlü konular yapılandırılmış olmalı |
| Test Adımları | 1. Çoklu bölümlü bir konuya farklı bölüm anahtarlarıyla mesajlar gönder<br>2. Mesajların doğru bölümlere dağıtıldığını doğrula<br>3. Aynı bölüm anahtarına sahip mesajların aynı bölüme gittiğini kontrol et<br>4. Bölüm sayısını değiştir ve mesaj dağıtımının nasıl etkilendiğini gözlemle<br>5. Bölüm dengesini kontrol et |
| Beklenen Sonuç | - Mesajlar bölüm anahtarlarına göre doğru bölümlere dağıtılmalı<br>- Aynı bölüm anahtarına sahip mesajlar aynı bölüme gitmeli<br>- Bölüm sayısı değişikliği sonrası mesaj dağıtımı doğru şekilde uyarlanmalı<br>- Bölümler arasında dengeli bir yük dağılımı olmalı<br>- Bölümlendirme mekanizması performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.3. Kafka Mesaj Sıralama Testi

| Test ID | IT-MQ-008 |
|---------|-----------|
| Test Adı | Kafka Mesaj Sıralama Testi |
| Açıklama | Kafka mesaj sıralama özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | Kafka çalışır durumda olmalı |
| Test Adımları | 1. Aynı bölüm anahtarına sahip sıralı mesajlar gönder<br>2. Tüketici servisin mesajları gönderildiği sırayla aldığını doğrula<br>3. Farklı bölüm anahtarlarına sahip mesajların sıralamasını kontrol et<br>4. Tüketici grubu yeniden dengeleme (rebalancing) durumunda sıralamanın korunduğunu doğrula<br>5. Kafka broker yeniden başlatma durumunda sıralamanın korunduğunu test et |
| Beklenen Sonuç | - Aynı bölüm anahtarına sahip mesajlar gönderildiği sırayla alınmalı<br>- Farklı bölüm anahtarlarına sahip mesajların sıralaması bölüm bazında korunmalı<br>- Tüketici grubu yeniden dengeleme durumunda sıralama korunmalı<br>- Broker yeniden başlatma durumunda sıralama korunmalı<br>- Mesaj sıralama garantisi performansı etkilememeli |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.4. Kafka Tüketici Grubu Testi

| Test ID | IT-MQ-009 |
|---------|-----------|
| Test Adı | Kafka Tüketici Grubu Testi |
| Açıklama | Kafka tüketici grubu mekanizmasının doğru çalıştığını test etme |
| Ön Koşullar | Kafka çalışır durumda olmalı ve tüketici grupları yapılandırılmış olmalı |
| Test Adımları | 1. Aynı tüketici grubunda birden fazla tüketici başlat<br>2. Konuya mesajlar gönder<br>3. Mesajların tüketici grubu içindeki tüketiciler arasında dengeli dağıtıldığını doğrula<br>4. Bir tüketiciyi devre dışı bırak ve mesajların diğer tüketicilere yeniden dağıtıldığını kontrol et<br>5. Yeni bir tüketici ekle ve tüketici grubu yeniden dengeleme işleminin gerçekleştiğini doğrula |
| Beklenen Sonuç | - Mesajlar tüketici grubu içindeki tüketiciler arasında dengeli dağıtılmalı<br>- Bir tüketici devre dışı kaldığında mesajlar diğer tüketicilere yeniden dağıtılmalı<br>- Yeni bir tüketici eklendiğinde tüketici grubu yeniden dengeleme işlemi gerçekleşmeli<br>- Tüketici grubu offset yönetimi doğru çalışmalı<br>- Tüketici grubu mekanizması performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 3.5. Kafka Yük Devretme Testi

| Test ID | IT-MQ-010 |
|---------|-----------|
| Test Adı | Kafka Yük Devretme Testi |
| Açıklama | Kafka yük devretme özelliğinin doğru çalıştığını test etme |
| Ön Koşullar | Kafka küme (cluster) yapılandırılmış olmalı |
| Test Adımları | 1. Kafka kümesine mesajlar gönder<br>2. Bir Kafka broker'ını devre dışı bırak<br>3. Yük devretme işleminin gerçekleştiğini ve lider bölümlerin diğer broker'lara taşındığını doğrula<br>4. Mesaj gönderme ve alma işlemlerinin kesintisiz devam ettiğini kontrol et<br>5. Devre dışı bırakılan broker'ı tekrar aktif hale getir ve kümenin normal durumuna döndüğünü doğrula |
| Beklenen Sonuç | - Yük devretme işlemi otomatik olarak gerçekleşmeli<br>- Lider bölümler diğer broker'lara taşınmalı<br>- Mesaj gönderme ve alma işlemleri kesintisiz devam etmeli<br>- Broker tekrar aktif hale geldiğinde küme normal durumuna dönmeli<br>- Yük devretme sırasında veri kaybı olmamalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

## 4. Servis Entegrasyonu Test Senaryoları

### 4.1. Segmentation Service - Mesaj Kuyruğu Entegrasyon Testi

| Test ID | IT-MQ-011 |
|---------|-----------|
| Test Adı | Segmentation Service - Mesaj Kuyruğu Entegrasyon Testi |
| Açıklama | Segmentation Service'in mesaj kuyruğu ile entegrasyonunu test etme |
| Ön Koşullar | Segmentation Service ve mesaj kuyruğu (RabbitMQ veya Kafka) çalışır durumda olmalı |
| Test Adımları | 1. Segmentation Service üzerinden bir segmentasyon işi başlat<br>2. Segmentation Service'in işi mesaj kuyruğuna eklediğini doğrula<br>3. İşin mesaj kuyruğundan alındığını ve işlendiğini kontrol et<br>4. İşlem sonucunun mesaj kuyruğu üzerinden Segmentation Service'e iletildiğini doğrula<br>5. Hata durumlarında mesaj işleme davranışını test et |
| Beklenen Sonuç | - Segmentation Service işi mesaj kuyruğuna ekleyebilmeli<br>- İş mesaj kuyruğundan alınabilmeli ve işlenebilmeli<br>- İşlem sonucu mesaj kuyruğu üzerinden iletilebilmeli<br>- Hata durumları doğru şekilde ele alınmalı<br>- Entegrasyon performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.2. Runner Service - Mesaj Kuyruğu Entegrasyon Testi

| Test ID | IT-MQ-012 |
|---------|-----------|
| Test Adı | Runner Service - Mesaj Kuyruğu Entegrasyon Testi |
| Açıklama | Runner Service'in mesaj kuyruğu ile entegrasyonunu test etme |
| Ön Koşullar | Runner Service ve mesaj kuyruğu (RabbitMQ veya Kafka) çalışır durumda olmalı |
| Test Adımları | 1. Runner Service'e bir iş gönder<br>2. Runner Service'in işi mesaj kuyruğuna eklediğini doğrula<br>3. İşin mesaj kuyruğundan alındığını ve işlendiğini kontrol et<br>4. İşlem sonucunun mesaj kuyruğu üzerinden Runner Service'e iletildiğini doğrula<br>5. İş önceliklendirme mekanizmasının mesaj kuyruğu ile entegrasyonunu test et |
| Beklenen Sonuç | - Runner Service işi mesaj kuyruğuna ekleyebilmeli<br>- İş mesaj kuyruğundan alınabilmeli ve işlenebilmeli<br>- İşlem sonucu mesaj kuyruğu üzerinden iletilebilmeli<br>- İş önceliklendirme mekanizması mesaj kuyruğu ile entegre çalışmalı<br>- Entegrasyon performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.3. Archive Service - Mesaj Kuyruğu Entegrasyon Testi

| Test ID | IT-MQ-013 |
|---------|-----------|
| Test Adı | Archive Service - Mesaj Kuyruğu Entegrasyon Testi |
| Açıklama | Archive Service'in mesaj kuyruğu ile entegrasyonunu test etme |
| Ön Koşullar | Archive Service ve mesaj kuyruğu (RabbitMQ veya Kafka) çalışır durumda olmalı |
| Test Adımları | 1. Archive Service'e bir arşivleme işi gönder<br>2. Archive Service'in işi mesaj kuyruğuna eklediğini doğrula<br>3. İşin mesaj kuyruğundan alındığını ve işlendiğini kontrol et<br>4. İşlem sonucunun mesaj kuyruğu üzerinden Archive Service'e iletildiğini doğrula<br>5. Büyük dosya arşivleme işlemlerinin mesaj kuyruğu ile entegrasyonunu test et |
| Beklenen Sonuç | - Archive Service işi mesaj kuyruğuna ekleyebilmeli<br>- İş mesaj kuyruğundan alınabilmeli ve işlenebilmeli<br>- İşlem sonucu mesaj kuyruğu üzerinden iletilebilmeli<br>- Büyük dosya arşivleme işlemleri mesaj kuyruğu ile entegre çalışmalı<br>- Entegrasyon performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.4. AI Orchestrator - Mesaj Kuyruğu Entegrasyon Testi

| Test ID | IT-MQ-014 |
|---------|-----------|
| Test Adı | AI Orchestrator - Mesaj Kuyruğu Entegrasyon Testi |
| Açıklama | AI Orchestrator'ın mesaj kuyruğu ile entegrasyonunu test etme |
| Ön Koşullar | AI Orchestrator ve mesaj kuyruğu (RabbitMQ veya Kafka) çalışır durumda olmalı |
| Test Adımları | 1. AI Orchestrator'a bir model eğitim işi gönder<br>2. AI Orchestrator'ın işi mesaj kuyruğuna eklediğini doğrula<br>3. İşin mesaj kuyruğundan alındığını ve işlendiğini kontrol et<br>4. İşlem sonucunun mesaj kuyruğu üzerinden AI Orchestrator'a iletildiğini doğrula<br>5. Model dağıtım işlemlerinin mesaj kuyruğu ile entegrasyonunu test et |
| Beklenen Sonuç | - AI Orchestrator işi mesaj kuyruğuna ekleyebilmeli<br>- İş mesaj kuyruğundan alınabilmeli ve işlenebilmeli<br>- İşlem sonucu mesaj kuyruğu üzerinden iletilebilmeli<br>- Model dağıtım işlemleri mesaj kuyruğu ile entegre çalışmalı<br>- Entegrasyon performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |

### 4.5. Olay Tabanlı İletişim Testi

| Test ID | IT-MQ-015 |
|---------|-----------|
| Test Adı | Olay Tabanlı İletişim Testi |
| Açıklama | Servisler arası olay tabanlı iletişimin mesaj kuyruğu üzerinden doğru çalıştığını test etme |
| Ön Koşullar | Tüm servisler ve mesaj kuyruğu (RabbitMQ veya Kafka) çalışır durumda olmalı |
| Test Adımları | 1. Bir servis üzerinden olay tetikleyecek bir işlem gerçekleştir<br>2. Olayın mesaj kuyruğuna eklendiğini doğrula<br>3. İlgili servislerin olayı mesaj kuyruğundan aldığını ve işlediğini kontrol et<br>4. Olay işleme sonuçlarının doğru olduğunu doğrula<br>5. Farklı olay türleri için testi tekrarla |
| Beklenen Sonuç | - Olaylar mesaj kuyruğuna eklenebilmeli<br>- İlgili servisler olayları mesaj kuyruğundan alabilmeli ve işleyebilmeli<br>- Olay işleme sonuçları doğru olmalı<br>- Farklı olay türleri için sistem doğru çalışmalı<br>- Olay tabanlı iletişim performanslı olmalı |
| Gerçek Sonuç | |
| Durum | |
| Notlar | |