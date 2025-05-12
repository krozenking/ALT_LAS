# Canary Dağıtım Stratejisi Raporu

**Tarih:** 19 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Canary Dağıtım Stratejisi

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan Canary dağıtım stratejisini detaylandırmaktadır. Canary dağıtım, yeni sürümlerin kademeli olarak dağıtılmasını sağlayan bir stratejidir. Bu, yeni sürümlerin önce küçük bir kullanıcı grubuna dağıtılarak test edilmesini ve sorun çıkmaması durumunda tüm kullanıcılara dağıtılmasını sağlar. Bu, ALT_LAS projesinin alpha aşamasında dağıtım risklerini azaltacak ve kullanıcı deneyimini iyileştirecektir.

## 2. Canary Dağıtım Stratejisi

ALT_LAS projesi için aşağıdaki Canary dağıtım stratejisi belirlenmiştir:

1. **Çoklu Sürüm Dağıtımı**: Her servis için birden fazla sürüm dağıtma
2. **Trafik Ağırlıklandırma**: Sürümler arasında trafik ağırlıklandırma
3. **Kademeli Dağıtım**: Yeni sürümlerin kademeli olarak dağıtılması
4. **Otomatik Geri Alma**: Sorun durumunda otomatik geri alma
5. **Metrik İzleme**: Dağıtım sürecinde metriklerin izlenmesi

## 3. Oluşturulan Canary Dağıtım Kaynakları

### 3.1. API Gateway Canary Dağıtım

API Gateway için Canary dağıtım kaynakları oluşturuldu:

- **Deployment**: `api-gateway-v2`
  - v2 sürümü için Deployment kaynağı
  - Güvenlik bağlamı ve kaynak sınırlamaları ile yapılandırıldı
  - Liveness ve readiness probe'ları ile yapılandırıldı

- **VirtualService**: `api-gateway`
  - Trafik ağırlıklandırma: v1 %90, v2 %10
  - Kademeli olarak v2 sürümüne trafik yönlendirme

- **DestinationRule**: `api-gateway`
  - v1 ve v2 sürümleri için alt kümeler tanımlandı
  - Yük dengeleme politikası: ROUND_ROBIN

### 3.2. Segmentation Service Canary Dağıtım

Segmentation Service için Canary dağıtım kaynakları oluşturuldu:

- **Deployment**: `segmentation-service-v2`
  - v2 sürümü için Deployment kaynağı
  - Güvenlik bağlamı ve kaynak sınırlamaları ile yapılandırıldı
  - Liveness ve readiness probe'ları ile yapılandırıldı

- **VirtualService**: `segmentation-service`
  - Trafik ağırlıklandırma: v1 %90, v2 %10
  - Kademeli olarak v2 sürümüne trafik yönlendirme

- **DestinationRule**: `segmentation-service`
  - v1 ve v2 sürümleri için alt kümeler tanımlandı
  - Yük dengeleme politikası: ROUND_ROBIN

### 3.3. Canary Dağıtım Yapılandırması

Canary dağıtım için yapılandırma kaynakları oluşturuldu:

- **ConfigMap**: `canary-config`
  - `canary-deployment-strategy.yaml`: Canary dağıtım stratejisi
  - `canary-rollback-strategy.yaml`: Canary geri alma stratejisi
  - `canary-metrics.yaml`: Canary dağıtım metrikleri

### 3.4. Canary Dağıtım Betikleri

Canary dağıtım için betikler oluşturuldu:

- **canary-deployment.sh**:
  - Canary dağıtımı başlatma
  - Trafik ağırlıklandırmayı kademeli olarak artırma
  - Metrikleri izleme ve sorun durumunda geri alma

- **canary-rollback.sh**:
  - Canary dağıtımı geri alma
  - Tüm trafiği eski sürüme yönlendirme
  - Yeni sürümü sıfıra indirme

- **canary-monitor.sh**:
  - Canary dağıtım metriklerini izleme
  - Hata oranı, gecikme süresi, başarı oranı, CPU ve bellek kullanımı
  - Trafik dağılımını izleme

## 4. Canary Dağıtım Süreci

Canary dağıtım süreci aşağıdaki adımlardan oluşmaktadır:

### 4.1. Aşama 1: İlk Dağıtım (%10)

- Yeni sürüm dağıtılır
- Trafiğin %10'u yeni sürüme yönlendirilir
- 1 saat boyunca metrikler izlenir
- Hata oranı ve gecikme süresi eşik değerlerin altında kalırsa bir sonraki aşamaya geçilir

### 4.2. Aşama 2: Genişletilmiş Dağıtım (%30)

- Trafiğin %30'u yeni sürüme yönlendirilir
- 2 saat boyunca metrikler izlenir
- Hata oranı ve gecikme süresi eşik değerlerin altında kalırsa bir sonraki aşamaya geçilir

### 4.3. Aşama 3: Yarı Dağıtım (%50)

- Trafiğin %50'si yeni sürüme yönlendirilir
- 4 saat boyunca metrikler izlenir
- Hata oranı ve gecikme süresi eşik değerlerin altında kalırsa bir sonraki aşamaya geçilir

### 4.4. Aşama 4: Tam Dağıtım (%100)

- Trafiğin %100'ü yeni sürüme yönlendirilir
- Eski sürüm kaldırılır

## 5. Canary Dağıtım Metrikleri

Canary dağıtım sürecinde aşağıdaki metrikler izlenir:

### 5.1. Temel Metrikler

- **Hata Oranı**: HTTP 5xx hata oranı
  - Eşik değer: %1
  - Prometheus sorgusu: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`

- **Gecikme Süresi**: HTTP isteklerinin %95 yüzdelik dilim gecikme süresi
  - Eşik değer: 500ms
  - Prometheus sorgusu: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`

- **Başarı Oranı**: HTTP 2xx başarı oranı
  - Eşik değer: %99
  - Prometheus sorgusu: `sum(rate(http_requests_total{status=~"2.."}[5m])) / sum(rate(http_requests_total[5m]))`

### 5.2. Kaynak Kullanım Metrikleri

- **CPU Kullanımı**: CPU kullanımı
  - Eşik değer: %80
  - Prometheus sorgusu: `sum(rate(container_cpu_usage_seconds_total{container_name!="POD"}[5m])) by (pod)`

- **Bellek Kullanımı**: Bellek kullanımı
  - Eşik değer: %80
  - Prometheus sorgusu: `sum(container_memory_usage_bytes{container_name!="POD"}) by (pod) / sum(container_spec_memory_limit_bytes{container_name!="POD"}) by (pod)`

### 5.3. İş Metrikleri

- **İşlenen Belge Sayısı**: İşlenen belge sayısı
  - Eşik değer: 10
  - Prometheus sorgusu: `sum(rate(documents_processed_total[5m]))`

- **İşleme Süresi**: Belge işleme süresi
  - Eşik değer: 2s
  - Prometheus sorgusu: `histogram_quantile(0.95, sum(rate(document_processing_duration_seconds_bucket[5m])) by (le))`

## 6. Canary Dağıtım Geri Alma Stratejisi

Canary dağıtım sürecinde sorun çıkması durumunda aşağıdaki geri alma stratejisi uygulanır:

### 6.1. Otomatik Geri Alma Koşulları

- **Hata Oranı**: %2'den fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

- **Gecikme Süresi**: 1000ms'den fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

- **CPU Kullanımı**: %90'dan fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

- **Bellek Kullanımı**: %90'dan fazla olması durumunda
  - 5 dakika boyunca devam ederse geri alınır

### 6.2. Geri Alma Prosedürü

1. **Dağıtımı Durdur**: Yeni sürüm dağıtımını durdur
2. **Trafiği Yönlendir**: Tüm trafiği eski sürüme yönlendir
3. **Yeni Sürümü Sıfıra İndir**: Yeni sürüm pod'larını sıfıra indir
4. **Bildir**: Geri alma durumunu bildir

## 7. Canary Dağıtım Avantajları

1. **Risk Azaltma**: Yeni sürümlerin kademeli olarak dağıtılması, dağıtım risklerini azaltır
2. **Erken Tespit**: Sorunların erken tespit edilmesini sağlar
3. **Kullanıcı Deneyimi**: Kullanıcı deneyimini olumsuz etkilemeden yeni sürümlerin dağıtılmasını sağlar
4. **Geri Alma Kolaylığı**: Sorun durumunda hızlı ve kolay geri alma imkanı sağlar
5. **Metrik İzleme**: Dağıtım sürecinde metriklerin izlenmesini sağlar

## 8. Sonraki Adımlar

### 8.1. CI/CD Pipeline Entegrasyonu

Canary dağıtım stratejisinin CI/CD pipeline'ına entegre edilmesi için aşağıdaki adımlar atılmalıdır:

- Canary dağıtım betiklerinin CI/CD pipeline'ına eklenmesi
- Canary dağıtım metriklerinin CI/CD pipeline'ına entegre edilmesi
- Canary dağıtım geri alma stratejisinin CI/CD pipeline'ına entegre edilmesi

### 8.2. Otomatik Canary Analizi

Canary dağıtım metriklerinin otomatik olarak analiz edilmesi için aşağıdaki adımlar atılmalıdır:

- Prometheus ve Grafana'da Canary dağıtım dashboard'larının oluşturulması
- Canary dağıtım metriklerinin otomatik olarak analiz edilmesi
- Canary dağıtım kararlarının otomatik olarak verilmesi

### 8.3. A/B Testi Entegrasyonu

Canary dağıtım stratejisine A/B testi entegrasyonu için aşağıdaki adımlar atılmalıdır:

- A/B testi için VirtualService yapılandırması
- A/B testi metriklerinin izlenmesi
- A/B testi sonuçlarının analiz edilmesi

## 9. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli Canary dağıtım stratejisi oluşturuldu. Bu strateji, yeni sürümlerin kademeli olarak dağıtılmasını, metriklerin izlenmesini ve sorun durumunda otomatik geri alma yapılmasını sağlayacaktır. Canary dağıtım, ALT_LAS projesinin alpha aşamasında dağıtım risklerini azaltacak ve kullanıcı deneyimini iyileştirecektir.
