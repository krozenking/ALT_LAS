# Otomatik Ölçeklendirme Yapılandırması Raporu

**Tarih:** 12 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Otomatik Ölçeklendirme Yapılandırması

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan otomatik ölçeklendirme yapılandırmasını detaylandırmaktadır. HorizontalPodAutoscaler (HPA), Kubernetes'te pod'ların yük durumuna göre otomatik olarak ölçeklendirilmesini sağlayan bir kaynaktır. Bu, sistemin yüksek yük altında performansını korurken, düşük yük durumlarında kaynak kullanımını optimize etmeye yardımcı olur.

## 2. Otomatik Ölçeklendirme Stratejisi

ALT_LAS projesi için aşağıdaki otomatik ölçeklendirme stratejisi belirlenmiştir:

1. **Servis Bazlı Ölçeklendirme**: Her servis için ayrı bir HPA kaynağı oluşturuldu.
2. **Metrik Tabanlı Ölçeklendirme**: CPU ve bellek kullanımına göre ölçeklendirme yapılacak.
3. **Minimum ve Maksimum Replikalar**: Her servis için minimum ve maksimum replika sayısı belirlendi.
4. **Hedef Kullanım Oranı**: Ölçeklendirme için hedef CPU ve bellek kullanım oranları belirlendi.
5. **Davranış Yapılandırması**: Ölçeklendirme davranışı (stabilizasyon pencereleri, politikalar) yapılandırıldı.

## 3. Oluşturulan HPA Kaynakları

### 3.1. API Gateway HPA

`kubernetes-manifests/autoscaling/api-gateway-hpa.yaml` dosyasında, API Gateway için HPA kaynağı oluşturuldu:

- **Minimum Replikalar**: 2
- **Maksimum Replikalar**: 5
- **Hedef CPU Kullanımı**: %70
- **Hedef Bellek Kullanımı**: %80
- **Ölçeklendirme Davranışı**:
  - Yukarı Ölçeklendirme: 60 saniyelik stabilizasyon penceresi, %100 artış
  - Aşağı Ölçeklendirme: 300 saniyelik stabilizasyon penceresi, %25 azalış

### 3.2. Segmentation Service HPA

`kubernetes-manifests/autoscaling/segmentation-service-hpa.yaml` dosyasında, Segmentation Service için HPA kaynağı oluşturuldu:

- **Minimum Replikalar**: 2
- **Maksimum Replikalar**: 5
- **Hedef CPU Kullanımı**: %70
- **Hedef Bellek Kullanımı**: %80
- **Ölçeklendirme Davranışı**:
  - Yukarı Ölçeklendirme: 60 saniyelik stabilizasyon penceresi, %100 artış
  - Aşağı Ölçeklendirme: 300 saniyelik stabilizasyon penceresi, %25 azalış

### 3.3. Runner Service HPA

`kubernetes-manifests/autoscaling/runner-service-hpa.yaml` dosyasında, Runner Service için HPA kaynağı oluşturuldu:

- **Minimum Replikalar**: 2
- **Maksimum Replikalar**: 8
- **Hedef CPU Kullanımı**: %70
- **Hedef Bellek Kullanımı**: %80
- **Ölçeklendirme Davranışı**:
  - Yukarı Ölçeklendirme: 60 saniyelik stabilizasyon penceresi, %100 artış
  - Aşağı Ölçeklendirme: 300 saniyelik stabilizasyon penceresi, %25 azalış

### 3.4. Archive Service HPA

`kubernetes-manifests/autoscaling/archive-service-hpa.yaml` dosyasında, Archive Service için HPA kaynağı oluşturuldu:

- **Minimum Replikalar**: 2
- **Maksimum Replikalar**: 5
- **Hedef CPU Kullanımı**: %70
- **Hedef Bellek Kullanımı**: %80
- **Ölçeklendirme Davranışı**:
  - Yukarı Ölçeklendirme: 60 saniyelik stabilizasyon penceresi, %100 artış
  - Aşağı Ölçeklendirme: 300 saniyelik stabilizasyon penceresi, %25 azalış

### 3.5. AI Orchestrator HPA

`kubernetes-manifests/autoscaling/ai-orchestrator-hpa.yaml` dosyasında, AI Orchestrator için HPA kaynağı oluşturuldu:

- **Minimum Replikalar**: 2
- **Maksimum Replikalar**: 10
- **Hedef CPU Kullanımı**: %70
- **Hedef Bellek Kullanımı**: %80
- **Ölçeklendirme Davranışı**:
  - Yukarı Ölçeklendirme: 60 saniyelik stabilizasyon penceresi, %100 artış
  - Aşağı Ölçeklendirme: 300 saniyelik stabilizasyon penceresi, %25 azalış

### 3.6. İzleme ve Loglama Bileşenleri HPA'ları

İzleme ve loglama bileşenleri için de HPA kaynakları oluşturuldu:

- **Prometheus HPA**:
  - Minimum Replikalar: 1
  - Maksimum Replikalar: 3
  - Hedef CPU Kullanımı: %70
  - Hedef Bellek Kullanımı: %80
  - Daha uzun stabilizasyon pencereleri (300s yukarı, 600s aşağı)

- **Grafana HPA**:
  - Minimum Replikalar: 1
  - Maksimum Replikalar: 3
  - Hedef CPU Kullanımı: %70
  - Hedef Bellek Kullanımı: %80
  - Daha uzun stabilizasyon pencereleri (300s yukarı, 600s aşağı)

- **Loki HPA**:
  - Minimum Replikalar: 1
  - Maksimum Replikalar: 3
  - Hedef CPU Kullanımı: %70
  - Hedef Bellek Kullanımı: %80
  - Daha uzun stabilizasyon pencereleri (300s yukarı, 600s aşağı)

## 4. Kustomization Dosyası Güncellemesi

`kubernetes-manifests/kustomization.yaml` dosyası, oluşturulan HPA kaynaklarını içerecek şekilde güncellendi.

## 5. Otomatik Ölçeklendirme Yapılandırmasının Avantajları

1. **Yüksek Kullanılabilirlik**: Minimum replika sayısı 2 olarak ayarlanarak, servis kesintilerinin önlenmesi sağlandı.
2. **Maliyet Optimizasyonu**: Düşük yük durumlarında gereksiz pod'ların çalışması engellendi.
3. **Performans Garantisi**: Yüksek yük durumlarında otomatik ölçeklendirme ile performans korundu.
4. **Kaynak Verimliliği**: Hedef kullanım oranları belirlenerek, kaynakların verimli kullanılması sağlandı.
5. **Stabilite**: Stabilizasyon pencereleri ve ölçeklendirme politikaları ile gereksiz ölçeklendirmelerin önüne geçildi.

## 6. Sonraki Adımlar

### 6.1. HPA'ların Test Edilmesi

HPA'ların doğru çalıştığını doğrulamak için aşağıdaki testler yapılmalıdır:

- Yük testleri ile yukarı ölçeklendirmenin doğrulanması
- Yükün azaltılması ile aşağı ölçeklendirmenin doğrulanması
- Stabilizasyon pencerelerinin etkisinin gözlemlenmesi

### 6.2. HPA Metriklerinin İzlenmesi

HPA'ların etkisini izlemek için aşağıdaki adımlar atılmalıdır:

- Prometheus ve Grafana'da HPA metrikleri için dashboard'lar oluşturulması
- Ölçeklendirme olaylarının loglanması ve analiz edilmesi
- Kaynak kullanımı ve ölçeklendirme ilişkisinin izlenmesi

### 6.3. HPA Yapılandırmasının İyileştirilmesi

Gerçek kullanım verileri elde edildikten sonra HPA yapılandırması iyileştirilmelidir:

- Hedef kullanım oranlarının gerçek kullanım verilerine göre ayarlanması
- Minimum ve maksimum replika sayılarının gerçek ihtiyaçlara göre güncellenmesi
- Stabilizasyon pencerelerinin ve ölçeklendirme politikalarının optimize edilmesi

## 7. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli otomatik ölçeklendirme yapılandırması oluşturuldu. Bu yapılandırma, sistemin yüksek yük altında performansını korurken, düşük yük durumlarında kaynak kullanımını optimize etmeye yardımcı olacaktır. HPA'ların test edilmesi, izlenmesi ve iyileştirilmesi için bir süreç oluşturulmalıdır.
