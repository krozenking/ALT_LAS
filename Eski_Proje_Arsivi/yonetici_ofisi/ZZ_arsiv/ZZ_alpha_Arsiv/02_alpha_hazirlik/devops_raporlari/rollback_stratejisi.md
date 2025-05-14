# Rollback Stratejisi Raporu

**Tarih:** 21 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Rollback Stratejisi

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan Rollback stratejisini detaylandırmaktadır. Rollback stratejisi, dağıtılan yeni sürümlerde sorun çıkması durumunda hızlı bir şekilde önceki kararlı sürüme geri dönmeyi sağlayan bir stratejidir. Bu, ALT_LAS projesinin alpha aşamasında dağıtım risklerini daha da azaltacak ve hizmet sürekliliğini sağlayacaktır.

## 2. Rollback Stratejisi

ALT_LAS projesi için aşağıdaki Rollback stratejisi belirlenmiştir:

1. **Otomatik Rollback**: Belirli koşullar oluştuğunda otomatik olarak geri alma
2. **Manuel Rollback**: Gerektiğinde manuel olarak geri alma
3. **Kademeli Rollback**: Kademeli olarak önceki sürüme geri dönme
4. **Rollback Doğrulama**: Geri alma işleminin başarılı olduğunu doğrulama
5. **Rollback Bildirimi**: Geri alma durumunda bildirim gönderme

## 3. Oluşturulan Rollback Kaynakları

### 3.1. Rollback Yapılandırması

Rollback için yapılandırma kaynakları oluşturuldu:

- **ConfigMap**: `rollback-config`
  - `rollback-strategy.yaml`: Rollback stratejisi
  - `rollback-metrics.yaml`: Rollback metrikleri

### 3.2. Otomatik Rollback

Otomatik Rollback için aşağıdaki kaynaklar oluşturuldu:

- **auto-rollback.sh**:
  - Belirli koşullar oluştuğunda otomatik olarak geri alma
  - Metrikleri izleme ve eşik değerleri aşıldığında geri alma
  - Rollback işlemini gerçekleştirme

### 3.3. Manuel Rollback

Manuel Rollback için aşağıdaki kaynaklar oluşturuldu:

- **manual-rollback.sh**:
  - Kullanıcı onayı ile geri alma
  - Kademeli veya anında geri alma seçeneği
  - Rollback işlemini gerçekleştirme ve doğrulama

### 3.4. Rollback Doğrulama

Rollback doğrulama için aşağıdaki kaynaklar oluşturuldu:

- **verify-rollback.sh**:
  - Servis erişilebilirliğini kontrol etme
  - Hata oranını kontrol etme
  - Gecikme süresini kontrol etme
  - Başarı oranını kontrol etme
  - CPU ve bellek kullanımını kontrol etme

### 3.5. Rollback Bildirimi

Rollback bildirimi için aşağıdaki kaynaklar oluşturuldu:

- **notify-rollback.sh**:
  - E-posta bildirimi gönderme
  - Slack bildirimi gönderme
  - Log bildirimi oluşturma
  - Kubernetes Event oluşturma

## 4. Rollback Koşulları

### 4.1. Otomatik Rollback Koşulları

Aşağıdaki koşullar oluştuğunda otomatik Rollback gerçekleştirilir:

- **Hata Oranı**: %2'den fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

- **Gecikme Süresi**: 1000ms'den fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

- **CPU Kullanımı**: %90'dan fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

- **Bellek Kullanımı**: %90'dan fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

### 4.2. Manuel Rollback Koşulları

Aşağıdaki koşullar oluştuğunda manuel Rollback değerlendirilir:

- **Kullanıcı Geri Bildirimleri**: Olumsuz geri bildirimler olması durumunda
  - Bildirim gönderilir ve onay beklenir

- **İş Metrikleri**: İş metriklerinde düşüş olması durumunda
  - Bildirim gönderilir ve onay beklenir

## 5. Rollback Prosedürü

### 5.1. Otomatik Rollback Prosedürü

1. **Dağıtımı Durdur**: Yeni sürüm dağıtımını durdur
2. **Trafiği Yönlendir**: Tüm trafiği eski sürüme yönlendir
3. **Yeni Sürümü Sıfıra İndir**: Yeni sürüm pod'larını sıfıra indir
4. **Bildir**: Geri alma durumunu bildir

### 5.2. Manuel Rollback Prosedürü

1. **Onay Al**: Geri alma işlemini onayla
2. **Dağıtımı Durdur**: Yeni sürüm dağıtımını durdur
3. **Trafiği Yönlendir**: Kademeli veya anında trafiği eski sürüme yönlendir
   - Kademeli: Önce %50, sonra %100
   - Anında: Doğrudan %100
4. **Yeni Sürümü Sıfıra İndir**: Yeni sürüm pod'larını sıfıra indir
5. **Doğrula**: Geri alma işleminin başarılı olduğunu doğrula
6. **Bildir**: Geri alma durumunu bildir

## 6. Rollback Metrikleri

Rollback kararı vermek için aşağıdaki metrikler izlenir:

### 6.1. Temel Metrikler

- **Hata Oranı**: HTTP 5xx hata oranı
  - Eşik değer: %1
  - Prometheus sorgusu: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`

- **Gecikme Süresi**: HTTP isteklerinin %95 yüzdelik dilim gecikme süresi
  - Eşik değer: 500ms
  - Prometheus sorgusu: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`

- **Başarı Oranı**: HTTP 2xx başarı oranı
  - Eşik değer: %99
  - Prometheus sorgusu: `sum(rate(http_requests_total{status=~"2.."}[5m])) / sum(rate(http_requests_total[5m]))`

### 6.2. Kaynak Kullanım Metrikleri

- **CPU Kullanımı**: CPU kullanımı
  - Eşik değer: %80
  - Prometheus sorgusu: `sum(rate(container_cpu_usage_seconds_total{container_name!="POD"}[5m])) by (pod)`

- **Bellek Kullanımı**: Bellek kullanımı
  - Eşik değer: %80
  - Prometheus sorgusu: `sum(container_memory_usage_bytes{container_name!="POD"}) by (pod) / sum(container_spec_memory_limit_bytes{container_name!="POD"}) by (pod)`

### 6.3. İş Metrikleri

- **İşlenen Belge Sayısı**: İşlenen belge sayısı
  - Eşik değer: 10
  - Prometheus sorgusu: `sum(rate(documents_processed_total[5m]))`

- **İşleme Süresi**: Belge işleme süresi
  - Eşik değer: 2s
  - Prometheus sorgusu: `histogram_quantile(0.95, sum(rate(document_processing_duration_seconds_bucket[5m])) by (le))`

## 7. Rollback Doğrulama

Rollback işleminin başarılı olduğunu doğrulamak için aşağıdaki kontroller yapılır:

1. **Servis Erişilebilirliği**: Servisin erişilebilir olduğunu kontrol etme
2. **Hata Oranı**: Hata oranının normal olduğunu kontrol etme
3. **Gecikme Süresi**: Gecikme süresinin normal olduğunu kontrol etme
4. **Başarı Oranı**: Başarı oranının normal olduğunu kontrol etme
5. **CPU Kullanımı**: CPU kullanımının normal olduğunu kontrol etme
6. **Bellek Kullanımı**: Bellek kullanımının normal olduğunu kontrol etme

## 8. Rollback Bildirimi

Rollback durumunda aşağıdaki bildirimleri gönderilir:

1. **E-posta Bildirimi**: DevOps ekibine e-posta gönderme
2. **Slack Bildirimi**: DevOps kanalına Slack mesajı gönderme
3. **Log Bildirimi**: Log dosyasına bildirim yazma
4. **Kubernetes Event**: Kubernetes Event oluşturma

## 9. Rollback Stratejisinin Avantajları

1. **Hızlı Geri Alma**: Sorun durumunda hızlı bir şekilde önceki kararlı sürüme geri dönme
2. **Otomatik Tespit**: Sorunların otomatik olarak tespit edilmesi
3. **Kademeli Geri Alma**: Kademeli olarak önceki sürüme geri dönme imkanı
4. **Doğrulama**: Geri alma işleminin başarılı olduğunu doğrulama
5. **Bildirim**: Geri alma durumunda bildirim gönderme

## 10. Sonraki Adımlar

### 10.1. CI/CD Pipeline Entegrasyonu

Rollback stratejisinin CI/CD pipeline'ına entegre edilmesi için aşağıdaki adımlar atılmalıdır:

- Rollback betiklerinin CI/CD pipeline'ına eklenmesi
- Rollback metriklerinin CI/CD pipeline'ına entegre edilmesi
- Rollback kararlarının CI/CD pipeline'ında otomatik olarak verilmesi

### 10.2. Otomatik Rollback Analizi

Rollback metriklerinin otomatik olarak analiz edilmesi için aşağıdaki adımlar atılmalıdır:

- Prometheus ve Grafana'da Rollback dashboard'larının oluşturulması
- Rollback metriklerinin otomatik olarak analiz edilmesi
- Rollback kararlarının otomatik olarak verilmesi

### 10.3. Rollback Testleri

Rollback stratejisinin test edilmesi için aşağıdaki adımlar atılmalıdır:

- Otomatik Rollback testlerinin oluşturulması
- Manuel Rollback testlerinin oluşturulması
- Rollback doğrulama testlerinin oluşturulması

## 11. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli Rollback stratejisi oluşturuldu. Bu strateji, dağıtılan yeni sürümlerde sorun çıkması durumunda hızlı bir şekilde önceki kararlı sürüme geri dönmeyi sağlayacaktır. Otomatik ve manuel Rollback prosedürleri, Rollback doğrulama ve Rollback bildirimi mekanizmaları ile ALT_LAS projesinin alpha aşamasında dağıtım riskleri daha da azaltılacak ve hizmet sürekliliği sağlanacaktır.
