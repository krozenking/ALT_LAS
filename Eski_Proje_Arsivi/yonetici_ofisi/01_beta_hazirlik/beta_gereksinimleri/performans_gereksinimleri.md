# Beta Aşaması Performans Gereksinimleri

**Tarih:** 29 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Beta Aşaması Performans Gereksinimleri

## 1. Genel Bakış

Bu belge, ALT_LAS projesinin beta aşaması için performans gereksinimlerini içermektedir. Bu gereksinimler, alpha aşamasında toplanan performans metrikleri, kullanıcı geri bildirimleri ve öğrenilen dersler doğrultusunda belirlenmiştir. Beta aşamasında, sistemin daha yüksek yük altında daha iyi performans göstermesi ve daha fazla kullanıcıyı desteklemesi hedeflenmektedir.

## 2. Mevcut Performans Metrikleri

Alpha aşamasında ölçülen mevcut performans metrikleri aşağıdaki gibidir:

### 2.1. Yanıt Süresi

| Servis | Ortalama Yanıt Süresi | 95. Yüzdelik Dilim Yanıt Süresi | 99. Yüzdelik Dilim Yanıt Süresi |
|--------|------------------------|----------------------------------|----------------------------------|
| API Gateway | 150ms | 250ms | 350ms |
| Segmentation Service | 200ms | 350ms | 450ms |
| Runner Service | 180ms | 300ms | 400ms |
| Archive Service | 120ms | 200ms | 300ms |
| AI Orchestrator | 250ms | 400ms | 500ms |

### 2.2. Verimlilik

| Servis | RPS | Başarı Oranı | Hata Oranı |
|--------|-----|--------------|------------|
| API Gateway | 100 | %99.9 | %0.1 |
| Segmentation Service | 80 | %99.8 | %0.2 |
| Runner Service | 70 | %99.9 | %0.1 |
| Archive Service | 60 | %100.0 | %0.0 |
| AI Orchestrator | 50 | %99.7 | %0.3 |

### 2.3. Kaynak Kullanımı

| Servis | CPU Kullanımı | Bellek Kullanımı | Disk I/O |
|--------|---------------|------------------|----------|
| API Gateway | %30 | %40 | 10MB/s |
| Segmentation Service | %40 | %50 | 20MB/s |
| Runner Service | %35 | %45 | 15MB/s |
| Archive Service | %25 | %35 | 30MB/s |
| AI Orchestrator | %45 | %55 | 25MB/s |

### 2.4. Ölçeklenebilirlik

| Servis | Yatay Ölçeklenebilirlik | Dikey Ölçeklenebilirlik | Ölçeklendirme Sınırları |
|--------|--------------------------|--------------------------|-------------------------|
| API Gateway | Yüksek | Orta | 10 replika |
| Segmentation Service | Orta | Yüksek | 5 replika |
| Runner Service | Yüksek | Orta | 8 replika |
| Archive Service | Yüksek | Yüksek | 6 replika |
| AI Orchestrator | Orta | Yüksek | 4 replika |

## 3. Beta Aşaması Performans Gereksinimleri

Beta aşamasında hedeflenen performans gereksinimleri aşağıdaki gibidir:

### 3.1. Yanıt Süresi Gereksinimleri

| Servis | Ortalama Yanıt Süresi | 95. Yüzdelik Dilim Yanıt Süresi | 99. Yüzdelik Dilim Yanıt Süresi |
|--------|------------------------|----------------------------------|----------------------------------|
| API Gateway | ≤ 100ms | ≤ 200ms | ≤ 300ms |
| Segmentation Service | ≤ 150ms | ≤ 250ms | ≤ 350ms |
| Runner Service | ≤ 130ms | ≤ 230ms | ≤ 330ms |
| Archive Service | ≤ 100ms | ≤ 180ms | ≤ 280ms |
| AI Orchestrator | ≤ 180ms | ≤ 300ms | ≤ 400ms |

### 3.2. Verimlilik Gereksinimleri

| Servis | RPS | Başarı Oranı | Hata Oranı |
|--------|-----|--------------|------------|
| API Gateway | ≥ 200 | ≥ %99.95 | ≤ %0.05 |
| Segmentation Service | ≥ 160 | ≥ %99.9 | ≤ %0.1 |
| Runner Service | ≥ 140 | ≥ %99.95 | ≤ %0.05 |
| Archive Service | ≥ 120 | ≥ %100.0 | ≤ %0.0 |
| AI Orchestrator | ≥ 100 | ≥ %99.9 | ≤ %0.1 |

### 3.3. Kaynak Kullanımı Gereksinimleri

| Servis | CPU Kullanımı | Bellek Kullanımı | Disk I/O |
|--------|---------------|------------------|----------|
| API Gateway | ≤ %20 | ≤ %30 | ≤ 8MB/s |
| Segmentation Service | ≤ %30 | ≤ %40 | ≤ 15MB/s |
| Runner Service | ≤ %25 | ≤ %35 | ≤ 12MB/s |
| Archive Service | ≤ %20 | ≤ %30 | ≤ 25MB/s |
| AI Orchestrator | ≤ %35 | ≤ %45 | ≤ 20MB/s |

### 3.4. Ölçeklenebilirlik Gereksinimleri

| Servis | Yatay Ölçeklenebilirlik | Dikey Ölçeklenebilirlik | Ölçeklendirme Sınırları |
|--------|--------------------------|--------------------------|-------------------------|
| API Gateway | Yüksek | Yüksek | ≥ 20 replika |
| Segmentation Service | Yüksek | Yüksek | ≥ 15 replika |
| Runner Service | Yüksek | Yüksek | ≥ 16 replika |
| Archive Service | Yüksek | Yüksek | ≥ 12 replika |
| AI Orchestrator | Yüksek | Yüksek | ≥ 10 replika |

## 4. Docker ve Kubernetes Performans Gereksinimleri

Beta aşamasında Docker ve Kubernetes ile ilgili performans gereksinimleri aşağıdaki gibidir:

### 4.1. Docker Konteyner Gereksinimleri

| Servis | CPU Limiti | Bellek Limiti | CPU İsteği | Bellek İsteği |
|--------|------------|---------------|------------|---------------|
| API Gateway | 1000m | 1024Mi | 500m | 512Mi |
| Segmentation Service | 2000m | 2048Mi | 1000m | 1024Mi |
| Runner Service | 1000m | 1024Mi | 500m | 512Mi |
| Archive Service | 1000m | 1024Mi | 500m | 512Mi |
| AI Orchestrator | 2000m | 2048Mi | 1000m | 1024Mi |

### 4.2. Kubernetes HPA Gereksinimleri

| Servis | Min Replika | Max Replika | CPU Hedef Kullanımı | Bellek Hedef Kullanımı |
|--------|-------------|-------------|---------------------|------------------------|
| API Gateway | 3 | 20 | %70 | %70 |
| Segmentation Service | 3 | 15 | %70 | %70 |
| Runner Service | 3 | 16 | %70 | %70 |
| Archive Service | 2 | 12 | %70 | %70 |
| AI Orchestrator | 2 | 10 | %70 | %70 |

### 4.3. Kubernetes Liveness ve Readiness Probe Gereksinimleri

| Servis | Liveness Probe Yolu | Readiness Probe Yolu | İlk Gecikme | Periyot | Zaman Aşımı | Başarı Eşiği | Başarısızlık Eşiği |
|--------|---------------------|----------------------|-------------|---------|-------------|--------------|-------------------|
| API Gateway | /health/live | /health/ready | 30s | 10s | 5s | 1 | 3 |
| Segmentation Service | /health/live | /health/ready | 60s | 15s | 10s | 1 | 3 |
| Runner Service | /health/live | /health/ready | 45s | 15s | 10s | 1 | 3 |
| Archive Service | /health/live | /health/ready | 30s | 10s | 5s | 1 | 3 |
| AI Orchestrator | /health/live | /health/ready | 60s | 15s | 10s | 1 | 3 |

## 5. Performans İzleme ve Raporlama Gereksinimleri

Beta aşamasında performans izleme ve raporlama gereksinimleri aşağıdaki gibidir:

### 5.1. Metrik Toplama

- **Sistem Metrikleri**: CPU, bellek, disk I/O, ağ I/O gibi sistem metriklerinin toplanması
- **Uygulama Metrikleri**: Yanıt süresi, istek sayısı, hata oranı gibi uygulama metriklerinin toplanması
- **Kubernetes Metrikleri**: Pod sayısı, pod durumu, HPA durumu gibi Kubernetes metriklerinin toplanması
- **Docker Metrikleri**: Konteyner sayısı, konteyner durumu, konteyner kaynak kullanımı gibi Docker metriklerinin toplanması

### 5.2. Metrik Depolama

- **Zaman Serisi Veritabanı**: Prometheus gibi bir zaman serisi veritabanında metriklerin depolanması
- **Veri Saklama Süresi**: Metriklerin en az 30 gün boyunca saklanması
- **Veri Sıkıştırma**: Metriklerin disk kullanımını azaltmak için sıkıştırılması

### 5.3. Metrik Görselleştirme

- **Dashboard**: Grafana gibi bir araçla metriklerin görselleştirilmesi
- **Alarm Paneli**: Alarmların görselleştirilmesi
- **Özel Dashboard'lar**: Her servis için özel dashboard'ların oluşturulması

### 5.4. Alarm ve Bildirim

- **Eşik Alarmları**: Belirli metriklerin belirli eşikleri aşması durumunda alarm oluşturulması
- **Trend Alarmları**: Metriklerin belirli bir süre boyunca belirli bir trendi göstermesi durumunda alarm oluşturulması
- **Bildirim Kanalları**: E-posta, Slack, SMS gibi kanallar üzerinden bildirim gönderilmesi

## 6. Performans Test Gereksinimleri

Beta aşamasında performans test gereksinimleri aşağıdaki gibidir:

### 6.1. Yük Testi

- **Sabit Yük**: Sabit sayıda kullanıcı ile sistemin performansının test edilmesi
- **Artan Yük**: Kullanıcı sayısının kademeli olarak artırılarak sistemin performansının test edilmesi
- **Yük Profilleri**: Farklı yük profilleri (örn. sabah, öğle, akşam) ile sistemin performansının test edilmesi

### 6.2. Stres Testi

- **Maksimum Yük**: Sistemin maksimum yük altında performansının test edilmesi
- **Aşırı Yük**: Sistemin kapasitesini aşan yük altında davranışının test edilmesi
- **Kaynak Kısıtlaması**: Sistem kaynaklarının kısıtlanarak sistemin performansının test edilmesi

### 6.3. Dayanıklılık Testi

- **Uzun Süreli Test**: Sistemin uzun süre boyunca (örn. 24 saat) performansının test edilmesi
- **Bellek Sızıntısı Testi**: Sistemin bellek sızıntısı olup olmadığının test edilmesi
- **Kaynak Kullanımı Testi**: Sistemin kaynak kullanımının uzun süre boyunca izlenmesi

### 6.4. Ölçeklenebilirlik Testi

- **Yatay Ölçeklendirme**: Sistemin yatay ölçeklenebilirliğinin test edilmesi
- **Dikey Ölçeklendirme**: Sistemin dikey ölçeklenebilirliğinin test edilmesi
- **Otomatik Ölçeklendirme**: Sistemin otomatik ölçeklendirme özelliğinin test edilmesi

## 7. Performans İyileştirme Stratejileri

Beta aşamasında uygulanacak performans iyileştirme stratejileri aşağıdaki gibidir:

### 7.1. Kod Optimizasyonu

- **Algoritma İyileştirmeleri**: Algoritmaların daha verimli hale getirilmesi
- **Bellek Kullanımı Optimizasyonu**: Bellek kullanımının optimize edilmesi
- **CPU Kullanımı Optimizasyonu**: CPU kullanımının optimize edilmesi
- **I/O Optimizasyonu**: Disk ve ağ I/O işlemlerinin optimize edilmesi

### 7.2. Veritabanı Optimizasyonu

- **Sorgu Optimizasyonu**: Veritabanı sorgularının optimize edilmesi
- **İndeks Optimizasyonu**: Veritabanı indekslerinin optimize edilmesi
- **Bağlantı Havuzu Optimizasyonu**: Veritabanı bağlantı havuzunun optimize edilmesi
- **Şema Optimizasyonu**: Veritabanı şemasının optimize edilmesi

### 7.3. Önbellek Stratejisi

- **Uygulama Önbelleği**: Uygulama seviyesinde önbellek kullanımı
- **Veritabanı Önbelleği**: Veritabanı seviyesinde önbellek kullanımı
- **Dağıtık Önbellek**: Redis gibi dağıtık önbellek sistemlerinin kullanımı
- **CDN**: Statik içerik için CDN kullanımı

### 7.4. Asenkron İşlemler

- **Mesaj Kuyruğu**: RabbitMQ, Kafka gibi mesaj kuyruğu sistemlerinin kullanımı
- **İş Kuyruğu**: Celery gibi iş kuyruğu sistemlerinin kullanımı
- **Webhook**: Webhook'lar ile asenkron bildirimler
- **WebSocket**: WebSocket ile gerçek zamanlı iletişim

### 7.5. Mikroservis Optimizasyonu

- **Servis Boyutu**: Servislerin optimum boyutta olması
- **Servis İletişimi**: Servisler arası iletişimin optimize edilmesi
- **Servis Keşfi**: Servis keşif mekanizmasının optimize edilmesi
- **Servis Mesh**: Istio gibi servis mesh çözümlerinin kullanımı

## 8. Sonuç

Bu belge, ALT_LAS projesinin beta aşaması için performans gereksinimlerini içermektedir. Bu gereksinimler, alpha aşamasında toplanan performans metrikleri, kullanıcı geri bildirimleri ve öğrenilen dersler doğrultusunda belirlenmiştir. Beta aşamasında, sistemin daha yüksek yük altında daha iyi performans göstermesi ve daha fazla kullanıcıyı desteklemesi hedeflenmektedir. Bu gereksinimlerin karşılanması için çeşitli performans iyileştirme stratejileri uygulanacak ve performans testleri yapılacaktır.
