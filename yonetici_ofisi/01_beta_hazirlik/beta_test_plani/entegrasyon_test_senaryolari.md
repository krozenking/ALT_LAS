# Entegrasyon Test Senaryoları

**Tarih:** 17 Haziran 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Test Entegrasyon Test Senaryoları

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta test aşaması için entegrasyon test senaryolarını içermektedir. Entegrasyon testleri, sistemin farklı bileşenlerinin birbirleriyle doğru şekilde entegre olup olmadığını değerlendirmek için kullanılacaktır.

Entegrasyon testleri, aşağıdaki kategorilere ayrılmıştır:

1. **Servisler Arası Entegrasyon Test Senaryoları**: Farklı mikroservislerin birbirleriyle entegrasyonunu test etmek için.
2. **Veritabanı Entegrasyon Test Senaryoları**: Sistemin veritabanları ile entegrasyonunu test etmek için.
3. **Harici Sistem Entegrasyon Test Senaryoları**: Sistemin harici sistemlerle entegrasyonunu test etmek için.
4. **API Entegrasyon Test Senaryoları**: Sistemin API'lerinin entegrasyonunu test etmek için.
5. **Mesaj Kuyruğu Entegrasyon Test Senaryoları**: Sistemin mesaj kuyruğu sistemleriyle entegrasyonunu test etmek için.

Her kategori için detaylı test senaryoları, ilgili dosyalarda bulunmaktadır.

## 2. Test Senaryoları Özeti

### 2.1. Servisler Arası Entegrasyon Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| IT-SS-001 | API Gateway - Segmentation Service Entegrasyon Testi | API Gateway üzerinden Segmentation Service'e yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| IT-SS-002 | API Gateway - Runner Service Entegrasyon Testi | API Gateway üzerinden Runner Service'e yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| IT-SS-003 | API Gateway - Archive Service Entegrasyon Testi | API Gateway üzerinden Archive Service'e yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| IT-SS-004 | API Gateway - AI Orchestrator Entegrasyon Testi | API Gateway üzerinden AI Orchestrator'a yapılan isteklerin doğru şekilde yönlendirildiğini ve işlendiğini test etme |
| IT-SS-005 | API Gateway Yük Dengeleme Testi | API Gateway'in yük dengeleme özelliğinin doğru çalıştığını test etme |
| IT-SS-006 | Segmentation Service - Runner Service Entegrasyon Testi | Segmentation Service'in Runner Service ile entegrasyonunu test etme |
| IT-SS-007 | Segmentation Service - AI Orchestrator Entegrasyon Testi | Segmentation Service'in AI Orchestrator ile entegrasyonunu test etme |
| IT-SS-008 | Segmentation Service - Archive Service Entegrasyon Testi | Segmentation Service'in Archive Service ile entegrasyonunu test etme |
| IT-SS-009 | Runner Service - Segmentation Service Entegrasyon Testi | Runner Service'in Segmentation Service ile entegrasyonunu test etme |
| IT-SS-010 | Runner Service - AI Orchestrator Entegrasyon Testi | Runner Service'in AI Orchestrator ile entegrasyonunu test etme |
| IT-SS-011 | Runner Service İş Önceliklendirme Testi | Runner Service'in iş önceliklendirme özelliğinin doğru çalıştığını test etme |
| IT-SS-012 | Archive Service - Segmentation Service Entegrasyon Testi | Archive Service'in Segmentation Service ile entegrasyonunu test etme |
| IT-SS-013 | Archive Service Dosya Versiyonlama Testi | Archive Service'in dosya versiyonlama özelliğinin doğru çalıştığını test etme |
| IT-SS-014 | Archive Service Metadata Yönetimi Testi | Archive Service'in dosya metadata yönetimi özelliğinin doğru çalıştığını test etme |
| IT-SS-015 | AI Orchestrator - Segmentation Service Entegrasyon Testi | AI Orchestrator'ın Segmentation Service ile entegrasyonunu test etme |
| IT-SS-016 | AI Orchestrator Model Yönetimi Testi | AI Orchestrator'ın model yönetimi özelliğinin doğru çalıştığını test etme |
| IT-SS-017 | AI Orchestrator Model Dağıtım Testi | AI Orchestrator'ın model dağıtım özelliğinin doğru çalıştığını test etme |

Detaylı bilgi için: [Servisler Arası Entegrasyon Test Senaryoları](entegrasyon_test_senaryolari_servisler_arasi.md)

### 2.2. Veritabanı Entegrasyon Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| IT-DB-001 | API Gateway - PostgreSQL Entegrasyon Testi | API Gateway'in PostgreSQL veritabanı ile entegrasyonunu test etme |
| IT-DB-002 | Runner Service - PostgreSQL Entegrasyon Testi | Runner Service'in PostgreSQL veritabanı ile entegrasyonunu test etme |
| IT-DB-003 | PostgreSQL Bağlantı Havuzu Testi | PostgreSQL bağlantı havuzunun doğru çalıştığını test etme |
| IT-DB-004 | PostgreSQL Şema Migrasyon Testi | PostgreSQL şema migrasyon işlemlerinin doğru çalıştığını test etme |
| IT-DB-005 | PostgreSQL Yedekleme ve Geri Yükleme Testi | PostgreSQL yedekleme ve geri yükleme işlemlerinin doğru çalıştığını test etme |
| IT-DB-006 | Segmentation Service - MongoDB Entegrasyon Testi | Segmentation Service'in MongoDB veritabanı ile entegrasyonunu test etme |
| IT-DB-007 | AI Orchestrator - MongoDB Entegrasyon Testi | AI Orchestrator'ın MongoDB veritabanı ile entegrasyonunu test etme |
| IT-DB-008 | MongoDB Bağlantı Havuzu Testi | MongoDB bağlantı havuzunun doğru çalıştığını test etme |
| IT-DB-009 | MongoDB Şema Doğrulama Testi | MongoDB şema doğrulama özelliğinin doğru çalıştığını test etme |
| IT-DB-010 | MongoDB Yedekleme ve Geri Yükleme Testi | MongoDB yedekleme ve geri yükleme işlemlerinin doğru çalıştığını test etme |
| IT-DB-011 | API Gateway - Redis Entegrasyon Testi | API Gateway'in Redis ile entegrasyonunu test etme |
| IT-DB-012 | Runner Service - Redis Entegrasyon Testi | Runner Service'in Redis ile entegrasyonunu test etme |
| IT-DB-013 | Redis Oturum Yönetimi Testi | Redis'in oturum yönetimi için kullanımını test etme |
| IT-DB-014 | Redis Önbellek Performansı Testi | Redis önbellek performansını test etme |
| IT-DB-015 | Redis Yük Devretme Testi | Redis yük devretme (failover) özelliğinin doğru çalıştığını test etme |

Detaylı bilgi için: [Veritabanı Entegrasyon Test Senaryoları](entegrasyon_test_senaryolari_veritabani.md)

### 2.3. Harici Sistem Entegrasyon Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| IT-ES-001 | S3 Depolama Entegrasyon Testi | Sistemin S3 uyumlu depolama hizmetiyle entegrasyonunu test etme |
| IT-ES-002 | SMTP Sunucu Entegrasyon Testi | Sistemin SMTP sunucusuyla entegrasyonunu test etme |
| IT-ES-003 | LDAP Entegrasyon Testi | Sistemin LDAP sunucusuyla entegrasyonunu test etme |
| IT-ES-004 | OAuth2 Sağlayıcı Entegrasyon Testi | Sistemin OAuth2 sağlayıcılarıyla entegrasyonunu test etme |
| IT-ES-005 | Prometheus Metrik Entegrasyon Testi | Sistemin Prometheus ile metrik entegrasyonunu test etme |
| IT-ES-006 | Grafana Dashboard Entegrasyon Testi | Sistemin Grafana ile dashboard entegrasyonunu test etme |
| IT-ES-007 | ELK Stack Log Entegrasyon Testi | Sistemin ELK Stack ile log entegrasyonunu test etme |
| IT-ES-008 | Harici AI Model API Entegrasyon Testi | Sistemin harici AI model API'leriyle entegrasyonunu test etme |
| IT-ES-009 | Webhook Entegrasyon Testi | Sistemin webhook mekanizmasının entegrasyonunu test etme |
| IT-ES-010 | Dosya Formatı Dönüştürme Servisi Entegrasyon Testi | Sistemin dosya formatı dönüştürme servisiyle entegrasyonunu test etme |

Detaylı bilgi için: [Harici Sistem Entegrasyon Test Senaryoları](entegrasyon_test_senaryolari_harici_sistem.md)

### 2.4. API Entegrasyon Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| IT-API-001 | RESTful API Entegrasyon Testi | Sistemin RESTful API'lerinin entegrasyonunu test etme |
| IT-API-002 | GraphQL API Entegrasyon Testi | Sistemin GraphQL API'lerinin entegrasyonunu test etme |
| IT-API-003 | API Versiyonlama Testi | API versiyonlama mekanizmasının doğru çalıştığını test etme |
| IT-API-004 | API Hız Sınırlama Testi | API hız sınırlama mekanizmasının doğru çalıştığını test etme |
| IT-API-005 | API Belgelendirme Testi | API belgelendirmesinin doğruluğunu ve güncelliğini test etme |
| IT-API-006 | API Hata İşleme Testi | API hata işleme mekanizmasının doğru çalıştığını test etme |
| IT-API-007 | API Güvenlik Testi | API güvenlik mekanizmalarının doğru çalıştığını test etme |
| IT-API-008 | API Performans Testi | API'lerin performansını test etme |
| IT-API-009 | API İzleme ve Günlükleme Testi | API izleme ve günlükleme mekanizmalarının doğru çalıştığını test etme |
| IT-API-010 | API İstemci SDK Entegrasyon Testi | API istemci SDK'larının entegrasyonunu test etme |

Detaylı bilgi için: [API Entegrasyon Test Senaryoları](entegrasyon_test_senaryolari_api.md)

### 2.5. Mesaj Kuyruğu Entegrasyon Test Senaryoları

| Test ID | Test Adı | Açıklama |
|---------|----------|----------|
| IT-MQ-001 | RabbitMQ Üretici-Tüketici Entegrasyon Testi | RabbitMQ üretici ve tüketici entegrasyonunu test etme |
| IT-MQ-002 | RabbitMQ Mesaj Kalıcılığı Testi | RabbitMQ mesaj kalıcılığı özelliğinin doğru çalıştığını test etme |
| IT-MQ-003 | RabbitMQ Mesaj Yönlendirme Testi | RabbitMQ mesaj yönlendirme mekanizmasının doğru çalıştığını test etme |
| IT-MQ-004 | RabbitMQ Ölü Mektup Kuyruğu Testi | RabbitMQ ölü mektup kuyruğu mekanizmasının doğru çalıştığını test etme |
| IT-MQ-005 | RabbitMQ Yük Devretme Testi | RabbitMQ yük devretme özelliğinin doğru çalıştığını test etme |
| IT-MQ-006 | Kafka Üretici-Tüketici Entegrasyon Testi | Kafka üretici ve tüketici entegrasyonunu test etme |
| IT-MQ-007 | Kafka Konu Bölümlendirme Testi | Kafka konu bölümlendirme mekanizmasının doğru çalıştığını test etme |
| IT-MQ-008 | Kafka Mesaj Sıralama Testi | Kafka mesaj sıralama özelliğinin doğru çalıştığını test etme |
| IT-MQ-009 | Kafka Tüketici Grubu Testi | Kafka tüketici grubu mekanizmasının doğru çalıştığını test etme |
| IT-MQ-010 | Kafka Yük Devretme Testi | Kafka yük devretme özelliğinin doğru çalıştığını test etme |

Detaylı bilgi için: [Mesaj Kuyruğu Entegrasyon Test Senaryoları](entegrasyon_test_senaryolari_mesaj_kuyrugu.md)

## 3. Test Ortamı

Entegrasyon testleri, beta test ortamında gerçekleştirilecektir. Test ortamı, aşağıdaki bileşenleri içermelidir:

- **Kubernetes Cluster**: Tüm mikroservislerin ve bağımlılıkların çalıştığı ortam
- **Veritabanları**: PostgreSQL, MongoDB, Redis
- **Mesaj Kuyruğu Sistemleri**: RabbitMQ, Kafka
- **Harici Sistemler**: S3 uyumlu depolama, SMTP sunucu, LDAP sunucu, OAuth2 sağlayıcılar
- **İzleme ve Günlükleme Araçları**: Prometheus, Grafana, ELK Stack
- **Test Araçları**: Postman, JMeter, Newman, Gatling

## 4. Test Yaklaşımı

Entegrasyon testleri, aşağıdaki yaklaşımla gerçekleştirilecektir:

1. **Aşağıdan Yukarıya (Bottom-Up) Entegrasyon Testi**: Alt seviye bileşenlerden başlayarak üst seviye bileşenlere doğru test etme
2. **Yukarıdan Aşağıya (Top-Down) Entegrasyon Testi**: Üst seviye bileşenlerden başlayarak alt seviye bileşenlere doğru test etme
3. **Büyük Patlama (Big Bang) Entegrasyon Testi**: Tüm bileşenleri bir araya getirerek test etme
4. **Sandviç Entegrasyon Testi**: Hem aşağıdan yukarıya hem de yukarıdan aşağıya yaklaşımlarını birleştirerek test etme

## 5. Raporlama

Entegrasyon testleri sonucunda, aşağıdaki bilgileri içeren bir rapor hazırlanacaktır:

- Tespit edilen entegrasyon sorunları ve çözüm önerileri
- Her entegrasyon noktasının durumu (Başarılı, Başarısız, Kısmen Başarılı)
- Entegrasyon performans metrikleri
- Entegrasyon güvenlik değerlendirmesi
- Genel entegrasyon değerlendirmesi ve öneriler

## 6. Sorumluluklar

Entegrasyon testleri, aşağıdaki sorumluluklar çerçevesinde gerçekleştirilecektir:

- **Entegrasyon Test Ekibi**: Entegrasyon testlerinin planlanması, gerçekleştirilmesi ve raporlanması
- **Geliştirme Ekibi**: Tespit edilen entegrasyon sorunlarının giderilmesi
- **DevOps Ekibi**: Test ortamının hazırlanması ve yapılandırılması
- **Proje Yöneticisi**: Test sürecinin koordinasyonu ve sonuçların değerlendirilmesi

## 7. Zaman Çizelgesi

Entegrasyon testleri, aşağıdaki zaman çizelgesine göre gerçekleştirilecektir:

- **Hazırlık**: 18-19 Haziran 2025
- **Servisler Arası Entegrasyon Testleri**: 20-21 Haziran 2025
- **Veritabanı Entegrasyon Testleri**: 22-23 Haziran 2025
- **Harici Sistem Entegrasyon Testleri**: 24-25 Haziran 2025
- **API Entegrasyon Testleri**: 26-27 Haziran 2025
- **Mesaj Kuyruğu Entegrasyon Testleri**: 28-29 Haziran 2025
- **Raporlama**: 30 Haziran 2025

## 8. Sonuç

Bu belge, ALT_LAS projesinin beta test aşaması için entegrasyon test senaryolarını içermektedir. Entegrasyon testleri, sistemin farklı bileşenlerinin birbirleriyle doğru şekilde entegre olup olmadığını değerlendirmek için kullanılacaktır. Test sonuçları, sistemin entegrasyon kalitesinin iyileştirilmesi için kullanılacaktır.
