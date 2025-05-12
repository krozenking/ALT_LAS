# Network Policy Yapısı Raporu

**Tarih:** 12 Mayıs 2025  
**Hazırlayan:** Can Tekin (DevOps Mühendisi)  
**Konu:** ALT_LAS Projesi Alpha Aşaması - Network Policy Yapısı

## 1. Genel Bakış

Bu rapor, ALT_LAS projesinin alpha aşamasına geçiş için oluşturulan Network Policy yapısını detaylandırmaktadır. Network Policy'ler, Kubernetes kümesindeki pod'lar arasındaki ağ trafiğini kontrol etmek için kullanılır. Bu, güvenliği artırmak ve servislerin yalnızca gerekli diğer servislerle iletişim kurmasını sağlamak için önemlidir.

## 2. Network Policy Stratejisi

ALT_LAS projesi için aşağıdaki Network Policy stratejisi belirlenmiştir:

1. **Varsayılan Reddetme Politikası**: Tüm gelen ve giden trafiği varsayılan olarak reddet ve yalnızca açıkça izin verilen trafiğe izin ver.
2. **Servis Bazlı Politikalar**: Her servis için ayrı bir Network Policy oluştur.
3. **Namespace İçi İletişim**: alt-las namespace'i içindeki servisler arasındaki iletişimi kontrol et.
4. **Dış Erişim**: Ingress üzerinden gelen dış trafiği kontrol et.

## 3. Oluşturulan Network Policy'ler

### 3.1. Varsayılan Reddetme Politikası

`kubernetes-manifests/network-policies/default-deny.yaml` dosyasında, tüm gelen ve giden trafiği varsayılan olarak reddeden iki Network Policy oluşturuldu:

- `default-deny-ingress`: Tüm gelen trafiği reddeder.
- `default-deny-egress`: Tüm giden trafiği reddeder.

### 3.2. API Gateway Network Policy

`kubernetes-manifests/network-policies/api-gateway.yaml` dosyasında, API Gateway için Network Policy oluşturuldu:

- **Gelen Trafik**:
  - Ingress Controller'dan gelen trafiğe izin verildi.
  - Prometheus'tan gelen metrik toplama trafiğine izin verildi.
- **Giden Trafik**:
  - Redis'e giden trafiğe izin verildi.
  - Segmentation Service'e giden trafiğe izin verildi.
  - Runner Service'e giden trafiğe izin verildi.
  - Archive Service'e giden trafiğe izin verildi.
  - AI Orchestrator'a giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

### 3.3. Segmentation Service Network Policy

`kubernetes-manifests/network-policies/segmentation-service.yaml` dosyasında, Segmentation Service için Network Policy oluşturuldu:

- **Gelen Trafik**:
  - API Gateway'den gelen trafiğe izin verildi.
  - Prometheus'tan gelen metrik toplama trafiğine izin verildi.
- **Giden Trafik**:
  - PostgreSQL'e giden trafiğe izin verildi.
  - AI Orchestrator'a giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

### 3.4. Runner Service Network Policy

`kubernetes-manifests/network-policies/runner-service.yaml` dosyasında, Runner Service için Network Policy oluşturuldu:

- **Gelen Trafik**:
  - API Gateway'den gelen trafiğe izin verildi.
  - Prometheus'tan gelen metrik toplama trafiğine izin verildi.
- **Giden Trafik**:
  - PostgreSQL'e giden trafiğe izin verildi.
  - NATS'a giden trafiğe izin verildi.
  - AI Orchestrator'a giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

### 3.5. Archive Service Network Policy

`kubernetes-manifests/network-policies/archive-service.yaml` dosyasında, Archive Service için Network Policy oluşturuldu:

- **Gelen Trafik**:
  - API Gateway'den gelen trafiğe izin verildi.
  - Prometheus'tan gelen metrik toplama trafiğine izin verildi.
- **Giden Trafik**:
  - PostgreSQL'e giden trafiğe izin verildi.
  - NATS'a giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

### 3.6. AI Orchestrator Network Policy

`kubernetes-manifests/network-policies/ai-orchestrator.yaml` dosyasında, AI Orchestrator için Network Policy oluşturuldu:

- **Gelen Trafik**:
  - API Gateway'den gelen trafiğe izin verildi.
  - Segmentation Service'den gelen trafiğe izin verildi.
  - Runner Service'den gelen trafiğe izin verildi.
  - Prometheus'tan gelen metrik toplama trafiğine izin verildi.
- **Giden Trafik**:
  - Dış API'lere giden trafiğe izin verildi (OpenAI API vb.).
  - DNS trafiğine izin verildi.

### 3.7. Altyapı Bileşenleri Network Policy'leri

- **PostgreSQL**: `kubernetes-manifests/network-policies/postgres.yaml`
  - Segmentation Service, Runner Service ve Archive Service'den gelen trafiğe izin verildi.
  - DNS trafiğine izin verildi.

- **Redis**: `kubernetes-manifests/network-policies/redis.yaml`
  - API Gateway'den gelen trafiğe izin verildi.
  - DNS trafiğine izin verildi.

- **NATS**: `kubernetes-manifests/network-policies/nats.yaml`
  - Runner Service ve Archive Service'den gelen trafiğe izin verildi.
  - Prometheus'tan gelen metrik toplama trafiğine izin verildi.
  - DNS trafiğine izin verildi.

### 3.8. İzleme ve Loglama Bileşenleri Network Policy'leri

`kubernetes-manifests/network-policies/monitoring.yaml` dosyasında, izleme ve loglama bileşenleri için Network Policy'ler oluşturuldu:

- **Prometheus**:
  - Grafana'dan gelen trafiğe izin verildi.
  - Tüm servislere metrik toplama için giden trafiğe izin verildi.
  - Kubernetes API'ye giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

- **Grafana**:
  - Ingress Controller'dan gelen trafiğe izin verildi.
  - Prometheus'a giden trafiğe izin verildi.
  - Loki'ye giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

- **Loki**:
  - Grafana'dan gelen trafiğe izin verildi.
  - Promtail'den gelen trafiğe izin verildi.
  - DNS trafiğine izin verildi.

- **Promtail**:
  - Loki'ye giden trafiğe izin verildi.
  - DNS trafiğine izin verildi.

## 4. Kustomization Dosyası Güncellemesi

`kubernetes-manifests/kustomization.yaml` dosyası, oluşturulan Network Policy'leri içerecek şekilde güncellendi.

## 5. Sonraki Adımlar

### 5.1. Network Policy'lerin Test Edilmesi

Network Policy'lerin doğru çalıştığını doğrulamak için aşağıdaki testler yapılmalıdır:

- İzin verilen trafik akışlarının çalıştığını doğrulama
- İzin verilmeyen trafik akışlarının engellendiğini doğrulama
- Servisler arası iletişimin doğru çalıştığını doğrulama

### 5.2. Network Policy'lerin İzlenmesi

Network Policy'lerin etkisini izlemek için aşağıdaki adımlar atılmalıdır:

- Network Policy metriklerinin toplanması
- Engellenen trafik loglarının analiz edilmesi
- Servis performansının izlenmesi

### 5.3. Network Policy'lerin Güncellenmesi

Gerektiğinde Network Policy'leri güncellemek için bir süreç oluşturulmalıdır:

- Yeni servisler eklendiğinde Network Policy'lerin güncellenmesi
- Servis iletişim gereksinimleri değiştiğinde Network Policy'lerin güncellenmesi
- Güvenlik gereksinimleri değiştiğinde Network Policy'lerin güncellenmesi

## 6. Sonuç

ALT_LAS projesinin alpha aşamasına geçiş için gerekli Network Policy yapısı oluşturuldu. Bu yapı, servisler arası iletişimi kontrol ederek güvenliği artıracak ve yalnızca gerekli trafik akışlarına izin verecektir. Network Policy'lerin test edilmesi, izlenmesi ve güncellenmesi için bir süreç oluşturulmalıdır.
