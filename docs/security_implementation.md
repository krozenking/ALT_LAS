# ALT_LAS Güvenlik Uygulamaları Dokümantasyonu

Bu belge, ALT_LAS projesi için uygulanan güvenlik önlemlerini ve en iyi uygulamaları detaylandırmaktadır. Belge, Docker güvenliği, Kubernetes güvenliği ve CI/CD güvenliği konularını kapsamaktadır.

## Docker Güvenliği

### Güvenli Dockerfile Uygulamaları

Tüm ortamlar (geliştirme, test, staging, üretim) için güvenli Dockerfile'lar oluşturulmuştur. Bu Dockerfile'lar aşağıdaki güvenlik önlemlerini içermektedir:

1. **Çok Aşamalı Yapı (Multi-Stage Builds)**: Derleme bağımlılıklarını ve araçlarını nihai imajdan ayırmak için kullanılmıştır.
2. **Minimum Bağımlılıklar**: Sadece gerekli paketler yüklenmiştir.
3. **Kök Olmayan Kullanıcı (Non-Root User)**: Tüm servisler kök olmayan kullanıcılar tarafından çalıştırılmaktadır.
4. **Salt Okunur Dosya Sistemi**: Mümkün olduğunda, kök dosya sistemi salt okunur olarak yapılandırılmıştır.
5. **Sağlık Kontrolleri**: Tüm servislere sağlık kontrolleri eklenmiştir.
6. **Kaynak Sınırlamaları**: Docker Compose yapılandırmasında CPU ve bellek sınırlamaları tanımlanmıştır.
7. **Yeteneklerin Düşürülmesi (Capability Dropping)**: Tüm gereksiz Linux yetenekleri kaldırılmıştır.

### Ortam Özelinde Güvenlik Ayarları

Her ortam için özel güvenlik ayarları uygulanmıştır:

#### Geliştirme Ortamı
- Geliştirme kolaylığı sağlarken temel güvenlik önlemlerini korur
- Kök olmayan kullanıcı kullanımı
- Sağlık kontrolleri
- Hot-reloading için yapılandırma

#### Test Ortamı
- Test araçları ve bağımlılıkları içerir
- Güvenli yapılandırma ile test çalıştırma
- Kök olmayan kullanıcı kullanımı

#### Staging Ortamı
- Üretim benzeri güvenlik ayarları
- Daha sık sağlık kontrolleri (15 saniye aralıklarla)
- Tam güvenlik kısıtlamaları

#### Üretim Ortamı
- En katı güvenlik önlemleri
- Minimum bağımlılıklar
- Salt okunur dosya sistemi
- Kök olmayan kullanıcı
- Yeteneklerin düşürülmesi
- Standart sağlık kontrolleri (30 saniye aralıklarla)

## Kubernetes Güvenliği

### Pod Güvenlik Politikaları

Kubernetes Pod Güvenlik Kabulü (PSA) standartları uygulanmıştır:

- **Geliştirme ve Test Ortamları**: `baseline` seviyesinde zorunlu kılma, `restricted` seviyesinde denetleme ve uyarı
- **Staging ve Üretim Ortamları**: `restricted` seviyesinde zorunlu kılma, denetleme ve uyarı

Bu yapılandırma, `pod-security-policies.yaml` dosyasında tanımlanmıştır.

### Pod Güvenlik Bağlamları

Tüm pod tanımları için güvenlik bağlamları (Security Contexts) uygulanmıştır:

- `runAsNonRoot: true`
- `runAsUser` ve `runAsGroup` tanımları
- `readOnlyRootFilesystem: true`
- `allowPrivilegeEscalation: false`
- Tüm yeteneklerin düşürülmesi ve sadece gerekli olanların eklenmesi
- `seccompProfile` ile sistem çağrılarının kısıtlanması

Örnek bir uygulama `api-gateway-deployment.yaml` dosyasında gösterilmiştir.

### Ağ Politikaları

Kubernetes Ağ Politikaları (Network Policies) uygulanmıştır:

- Varsayılan olarak tüm gelen trafiği reddeden politika
- Servisler arası iletişime izin veren özel politikalar
- API Gateway'e dışarıdan erişime izin veren politika

Bu politikalar `network-policies.yaml` dosyasında tanımlanmıştır.

### Gizli Anahtar Yönetimi

Kubernetes Secrets kullanılarak gizli anahtar yönetimi uygulanmıştır:

- Veritabanı kimlik bilgileri için secret
- API anahtarları için secret
- Birim (Volume) olarak bağlama önerileri

Örnek yapılandırma `secrets.yaml` dosyasında gösterilmiştir.

## CI/CD Güvenliği

CI/CD güvenliği için aşağıdaki bileşenler uygulanmıştır:

1. **Pipeline Güvenlik Kontrolleri**: GitHub Actions workflow'ları güvenlik kontrolleri içerecek şekilde yapılandırılmıştır.
2. **Kod Analizi Entegrasyonu**: Statik kod analizi araçları entegre edilmiştir.
3. **Güvenlik Testleri Otomasyonu**: Otomatik güvenlik taramaları eklenmiştir.
4. **Dağıtım Güvenliği**: Güvenli dağıtım pratikleri uygulanmıştır.

## Düzenli Docker Güvenlik Denetimleri

Düzenli Docker güvenlik denetimleri için aşağıdaki bileşenler planlanmıştır:

1. **Denetim Planı**: Haftalık ve aylık denetimler için plan
2. **Denetim Araçları**: Trivy, Hadolint, Dockle ve Docker Bench Security kullanımı
3. **Raporlama Şablonu**: Standart raporlama formatı
4. **Takip Sistemi**: Bulunan güvenlik açıklarının takibi için sistem
5. **Otomasyon**: Denetimlerin otomatikleştirilmesi için betikler

## Sonuç

Bu güvenlik uygulamaları, ALT_LAS projesinin tüm bileşenlerinde güvenliği sağlamak için kapsamlı bir yaklaşım sunmaktadır. Güvenlik, geliştirme sürecinin başından itibaren düşünülmüş ve tüm ortamlarda uygulanmıştır.

Gelecekteki iyileştirmeler için öneriler:

1. Güvenlik taramalarının CI/CD pipeline'ına tam entegrasyonu
2. Güvenlik açıklarının otomatik raporlanması ve takibi
3. Güvenlik eğitim materyallerinin geliştirilmesi
4. Düzenli güvenlik denetimlerinin otomatikleştirilmesi
