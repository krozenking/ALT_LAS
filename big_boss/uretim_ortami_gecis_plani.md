# ALT_LAS Üretim Ortamına Geçiş Planı

## Genel Bakış

Bu belge, ALT_LAS projesinin beta aşamasından üretim ortamına geçiş planını detaylandırmaktadır. Üretim ortamına geçiş, aşağıdaki adımları içermektedir:

1. Kubernetes yapılandırması
2. CI/CD pipeline kurulumu
3. Güvenlik yapılandırması
4. Ölçeklendirme yapılandırması
5. İzleme ve günlük kaydı yapılandırması
6. Üretim ortamına dağıtım
7. Doğrulama ve test

## 1. Kubernetes Yapılandırması

ALT_LAS projesi, üretim ortamında Kubernetes üzerinde çalışacaktır. Kubernetes yapılandırması, aşağıdaki bileşenleri içermektedir:

- **Namespace**: `atlas-production`
- **Servisler**:
  - API Gateway
  - Segmentation Service
  - AI Orchestrator
  - Archive Service
  - PostgreSQL
  - Prometheus ve Grafana (izleme)

Kubernetes yapılandırma dosyaları, `kubernetes/production` klasöründe bulunmaktadır:

- `namespace.yaml`: Üretim ortamı için namespace tanımı
- `postgres.yaml`: PostgreSQL veritabanı yapılandırması
- `api-gateway.yaml`: API Gateway servisi yapılandırması
- `segmentation-service.yaml`: Segmentation Service yapılandırması
- `ai-orchestrator.yaml`: AI Orchestrator servisi yapılandırması
- `archive-service.yaml`: Archive Service yapılandırması
- `monitoring.yaml`: Prometheus ve Grafana izleme yapılandırması
- `security.yaml`: Güvenlik yapılandırması (NetworkPolicy, Secret)

## 2. CI/CD Pipeline Kurulumu

Üretim ortamına geçiş için CI/CD pipeline, GitHub Actions kullanılarak yapılandırılmıştır. CI/CD pipeline, aşağıdaki adımları içermektedir:

1. **Build ve Test**: Tüm servislerin derlenmesi ve test edilmesi
2. **Güvenlik Taraması**: Trivy kullanılarak güvenlik açıklarının taranması
3. **Docker İmajlarının Oluşturulması ve Yüklenmesi**: GitHub Container Registry'ye Docker imajlarının yüklenmesi
4. **Üretim Ortamına Dağıtım**: Kubernetes üzerinde servislerin dağıtılması

CI/CD pipeline yapılandırması, `.github/workflows/production-ci-cd.yaml` dosyasında bulunmaktadır.

## 3. Güvenlik Yapılandırması

Üretim ortamı için güvenlik yapılandırması, aşağıdaki bileşenleri içermektedir:

- **Secrets**: Hassas bilgilerin (veritabanı kimlik bilgileri, API anahtarları) güvenli bir şekilde saklanması
- **NetworkPolicy**: Servisler arasındaki ağ trafiğinin kısıtlanması
- **TLS**: API Gateway ve izleme araçları için TLS sertifikalarının yapılandırılması
- **RBAC**: Kubernetes kaynaklarına erişimin kısıtlanması

Güvenlik yapılandırması, `kubernetes/production/security.yaml` dosyasında bulunmaktadır.

## 4. Ölçeklendirme Yapılandırması

Üretim ortamında, servislerin yatay ölçeklendirilmesi için aşağıdaki yapılandırmalar yapılmıştır:

- **API Gateway**: 3 replika
- **Segmentation Service**: 2 replika
- **AI Orchestrator**: 2 replika
- **Archive Service**: 2 replika
- **PostgreSQL**: 1 replika (StatefulSet)

Ölçeklendirme yapılandırması, her servisin Kubernetes yapılandırma dosyasında `replicas` parametresi ile belirtilmiştir.

## 5. İzleme ve Günlük Kaydı Yapılandırması

Üretim ortamında, servislerin izlenmesi ve günlük kayıtlarının toplanması için aşağıdaki araçlar kullanılmaktadır:

- **Prometheus**: Metrik toplama ve izleme
- **Grafana**: Metrik görselleştirme ve dashboard'lar
- **Loki**: Günlük kayıtlarının toplanması ve sorgulanması

İzleme ve günlük kaydı yapılandırması, `kubernetes/production/monitoring.yaml` dosyasında bulunmaktadır.

## 6. Üretim Ortamına Dağıtım

Üretim ortamına dağıtım, aşağıdaki adımları içermektedir:

1. GitHub'da yeni bir sürüm etiketi oluşturma (örn. `v1.0.0`)
2. CI/CD pipeline'ın otomatik olarak çalıştırılması
3. Docker imajlarının oluşturulması ve GitHub Container Registry'ye yüklenmesi
4. Kubernetes üzerinde servislerin dağıtılması
5. Dağıtımın doğrulanması

Dağıtım, CI/CD pipeline tarafından otomatik olarak gerçekleştirilmektedir. Dağıtım adımları, `.github/workflows/production-ci-cd.yaml` dosyasında `deploy-production` iş akışında tanımlanmıştır.

## 7. Doğrulama ve Test

Üretim ortamına dağıtımın ardından, aşağıdaki doğrulama ve test adımları gerçekleştirilmelidir:

1. **Servis Sağlık Kontrolü**: Tüm servislerin sağlıklı çalıştığının doğrulanması
2. **API Testi**: API Gateway üzerinden tüm API'lerin test edilmesi
3. **Performans Testi**: Yük altında sistemin performansının test edilmesi
4. **Güvenlik Testi**: Güvenlik yapılandırmasının doğrulanması

Doğrulama ve test adımları, CI/CD pipeline'ın son adımında otomatik olarak gerçekleştirilmektedir.

## Sonuç

ALT_LAS projesi, beta aşamasından üretim ortamına geçiş için gerekli tüm hazırlıkları tamamlamıştır. Üretim ortamına geçiş, CI/CD pipeline kullanılarak otomatik olarak gerçekleştirilecektir. Üretim ortamında, servisler Kubernetes üzerinde çalışacak ve Prometheus, Grafana ve Loki kullanılarak izlenecektir.

Üretim ortamına geçiş, aşağıdaki komutla başlatılabilir:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Bu komut, CI/CD pipeline'ı tetikleyecek ve üretim ortamına dağıtımı başlatacaktır.
