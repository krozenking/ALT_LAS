# ALT_LAS Projesi Güvenlik Genel Bakışı ve En İyi Uygulamalar

Bu belge, ALT_LAS projesinde uygulanan güvenlik önlemlerini ve DevOps ekibi için en iyi güvenlik uygulamalarını özetlemektedir. Amaç, projenin geliştirme ve dağıtım yaşam döngüsü boyunca güvenliği sağlamak ve sürdürmektir.

## 1. Giriş

Bu dokümantasyon, "İşçi 8" (Güvenlik ve DevOps Uzmanı) tarafından `todo_worker8.md` dosyasında belirtilen görevler kapsamında oluşturulmuştur. Docker konteyner güvenliği, Kubernetes orkestrasyon güvenliği ve CI/CD pipeline güvenliği alanlarında uygulanan temel stratejileri ve yapılandırmaları kapsar.

## 2. Docker Güvenliği

Konteyner güvenliği, uygulama güvenliğinin temel katmanlarından biridir. Aşağıdaki önlemler alınmış ve en iyi uygulamalar benimsenmiştir:

### 2.1. Ortama Özel Güvenli Dockerfile'lar

Her servis (api-gateway, ai-orchestrator, archive-service, os-integration-service, runner-service) için geliştirme (`dev`), test (`test`), hazırlık (`staging`) ve üretim (`prod`) ortamlarına özel Dockerfile'lar oluşturulmuştur. Bu dosyalar `/home/ubuntu/ALT_LAS/docker/` dizininde bulunabilir (örneğin, `Dockerfile.prod.api-gateway`).

Bu Dockerfile'larda uygulanan temel güvenlik prensipleri şunlardır:

*   **Çok Aşamalı Derlemeler (Multi-stage Builds):** Sonuç imaj boyutunu küçültmek ve yalnızca çalışma zamanı için gerekli bağımlılıkları ve dosyaları içermek amacıyla derleme ve çalışma zamanı aşamaları ayrılmıştır.
*   **Minimal Temel İmajlar:** Mümkün olduğunca küçük ve güvenliği sıkılaştırılmış temel imajlar (örneğin, `alpine`, `*-slim`) kullanılmıştır.
*   **Kök Olmayan Kullanıcı (Non-root User):** Konteynerler, `USER` direktifi kullanılarak ayrıcalıksız (non-root) kullanıcılar ile çalıştırılır. Bu kullanıcılar `adduser` veya `groupadd` ile oluşturulur.
*   **En Az Ayrıcalık:** Konteynerlere yalnızca işlevlerini yerine getirmek için gereken minimum izinler verilir. Dosya sistemi izinleri `chown` ve `chmod` ile ayarlanır.
*   **Gereksiz Paketlerin Kaldırılması:** Derleme aşamasında kullanılan araçlar (`build-essential`, `gcc` vb.) ve paket yöneticisi önbellekleri (`/var/lib/apt/lists/*`, `--no-cache-dir`) son imajdan kaldırılır.
*   **`COPY` yerine `ADD` Kullanımı:** Dosyaları kopyalamak için genellikle `COPY` tercih edilir, çünkü `ADD`'nin otomatik arşiv açma veya URL indirme gibi beklenmedik davranışları olabilir.
*   **Sağlık Kontrolleri (`HEALTHCHECK`):** Konteynerlerin sağlık durumunu izlemek ve orkestratörlerin sağlıksız konteynerleri yeniden başlatmasını sağlamak için `HEALTHCHECK` talimatları eklenmiştir.

### 2.2. CI/CD Entegrasyonu

Dockerfile'ların ve oluşturulan imajların güvenliğini sürekli olarak doğrulamak için CI/CD pipeline'larına çeşitli araçlar entegre edilmiştir (`.github/workflows/docker-security-scan.yml`, `.github/workflows/pipeline-security.yml`):

*   **Hadolint:** Dockerfile'lar için en iyi uygulamaları kontrol eden bir linter.
*   **Trivy / Grype:** Konteyner imajlarındaki işletim sistemi paketlerinde ve uygulama bağımlılıklarında bilinen güvenlik açıklarını (CVE) tarar.
*   **Dockle:** Konteyner imajları için CIS Benchmark'ları gibi güvenlik en iyi uygulamalarını kontrol eder.
*   **Docker Bench Security:** Çalışan konteynerler ve Docker daemon yapılandırması için güvenlik denetimleri yapar.

## 3. Kubernetes Güvenliği

Uygulamaların orkestrasyonu için Kubernetes kullanılırken, küme ve pod güvenliğini sağlamak amacıyla aşağıdaki politikalar ve yapılandırmalar benimsenmiştir. İlgili detaylı dokümanlar `/home/ubuntu/ALT_LAS/kubernetes/` dizininde bulunabilir.

### 3.1. Pod Güvenlik Kabulü (Pod Security Admission - PSA)

*   **Referans:** `kubernetes/pod-security-admission.md`
*   Uygulama namespace'leri (`alt-las-dev`, `alt-las-staging`, `alt-las-prod` vb.) için `restricted` (Kısıtlı) Pod Güvenlik Standardı zorunlu kılınmıştır (`enforce=restricted`). Bu, podların en katı güvenlik kurallarına uymasını sağlar.

### 3.2. Güvenlik Bağlamları (Security Contexts)

*   **Referans:** `kubernetes/security-contexts.md`
*   Pod ve konteyner tanımlarında aşağıdaki `securityContext` ayarları standart olarak kullanılır:
    *   `runAsNonRoot: true`
    *   `runAsUser` / `runAsGroup` (Dockerfile'daki UID/GID ile uyumlu)
    *   `allowPrivilegeEscalation: false`
    *   `readOnlyRootFilesystem: true` (Gerektiğinde yazılabilir birimler `volumeMounts` ile eklenir)
    *   `capabilities.drop: ["ALL"]` (Gerekli minimum yetenekler `add` ile eklenir)
    *   `seccompProfile.type: RuntimeDefault`

### 3.3. Ağ Politikaları (Network Policies)

*   **Referans:** `kubernetes/network-policies.md`
*   Namespace'lerde varsayılan olarak tüm gelen (ingress) trafiği engelleyen `default-deny-ingress` politikası uygulanır.
*   Servisler arası ve dışarıdan gelen gerekli trafiğe izin vermek için pod etiketlerine dayalı özel `NetworkPolicy` tanımları oluşturulur (örneğin, Ingress Controller'dan API Gateway'e, API Gateway'den backend servislere izin verme).

### 3.4. Gizli Anahtar Yönetimi (Secret Management)

*   **Referans:** `kubernetes/secret-management.md`
*   Hassas veriler (şifreler, API anahtarları vb.) Kubernetes `Secret` kaynakları kullanılarak yönetilir.
*   Gizli anahtarlar asla koda veya imajlara gömülmez.
*   Podlara gizli anahtar bağlarken, ortam değişkenleri yerine **birim (volume)** olarak bağlama yöntemi tercih edilir (`readOnly: true` ile).
*   Gizli anahtarlara erişimi kısıtlamak için RBAC kuralları kullanılır.
*   Gizli anahtarların etcd'de şifrelenerek saklanması (Encryption at Rest) sağlanmalıdır (küme yapılandırması).
*   Gelecekte daha gelişmiş ihtiyaçlar için HashiCorp Vault veya Sealed Secrets gibi araçlar değerlendirilebilir.

## 4. CI/CD Güvenliği

Güvenli yazılım geliştirme yaşam döngüsünün (SSDLC) önemli bir parçası olarak, CI/CD pipeline'larına çeşitli güvenlik kontrolleri entegre edilmiştir:

*   **Referans:** `.github/workflows/` dizinindeki iş akışları (`ci.yml`, `cd.yml`, `docker-security-scan.yml`, `security-scan.yml`, `pipeline-security.yml`).

### 4.1. Kod Analizi ve Tarama

*   **SAST (Static Application Security Testing):** GitHub CodeQL kullanılarak kod tabanındaki potansiyel güvenlik açıkları taranır.
*   **SCA (Software Composition Analysis):** Trivy ve OWASP Dependency Check kullanılarak açık kaynaklı bağımlılıklardaki bilinen güvenlik açıkları ve lisans uyumluluk sorunları tespit edilir.
*   **Secrets Scanning:** TruffleHog ve GitLeaks kullanılarak kod tabanına yanlışlıkla eklenmiş olabilecek gizli anahtarlar (API anahtarları, şifreler vb.) taranır.

### 4.2. Konteyner ve Pipeline Güvenliği

*   **Dockerfile Linting/Scanning:** Hadolint, Dockle, Docker Bench Security ile Dockerfile'lar ve imajlar en iyi uygulamalar açısından kontrol edilir.
*   **Container Image Scanning:** Trivy ve Grype ile konteyner imajlarındaki güvenlik açıkları taranır.
*   **SBOM (Software Bill of Materials) Üretimi:** Syft kullanılarak imajların içerdiği tüm bileşenlerin listesi oluşturulur. Bu, şeffaflık ve güvenlik açığı takibi için önemlidir.
*   **Supply Chain Security:**
    *   SLSA (Supply-chain Levels for Software Artifacts) uyumlu provenance (kaynak kökeni) bilgisi oluşturulur.
    *   Sigstore/Cosign kullanılarak konteyner imajları imzalanır ve dağıtım öncesinde imzalar doğrulanır.
*   **Runtime Security (Pipeline):** Falco gibi araçlarla pipeline sırasında anormal davranışlar tespit edilebilir (örnek yapılandırma eklenmiştir).

### 4.3. Güvenli Dağıtım

*   **İmaj İmzalama ve Doğrulama:** Cosign ile imzalanan imajların dağıtım ortamında doğrulanması (örneğin, Kubernetes Admission Controller ile) önerilir.
*   **Manifest Doğrulama:** `kubectl apply --dry-run=client` ve `kubeval` gibi araçlarla Kubernetes manifestlerinin geçerliliği ve en iyi uygulamalara uygunluğu kontrol edilir.
*   **Aşamalı Dağıtım (Progressive Delivery):** Canary veya Blue/Green gibi dağıtım stratejileri kullanarak yeni sürümlerin etkisini sınırlamak ve geri dönüşleri kolaylaştırmak önerilir.

## 5. DevOps Ekibi İçin Öneriler ve Eğitim

Projenin güvenliğini sürekli kılmak için DevOps ekibinin aşağıdaki noktalara dikkat etmesi önemlidir:

1.  **Güvenli Kodlama Alışkanlıkları:** OWASP Top 10 gibi yaygın güvenlik açıklarına karşı farkındalık ve güvenli kodlama prensiplerinin (girdi doğrulama, çıktı kodlama, yetkilendirme kontrolleri vb.) uygulanması.
2.  **Bağımlılık Yönetimi:** Yalnızca güvenilir kaynaklardan bağımlılık ekleyin. Bağımlılıkları düzenli olarak güncelleyin ve SCA tarama sonuçlarını (Trivy, Dependency Check) takip ederek zafiyetli bağımlılıkları giderin.
3.  **Tarama Sonuçlarının İncelenmesi:** CI/CD pipeline'larındaki güvenlik taramalarının (SAST, SCA, Secrets, Image Scanning) sonuçlarını düzenli olarak inceleyin ve bulunan kritik/yüksek önemdeki bulguları önceliklendirerek düzeltin.
4.  **Gizli Anahtar Yönetimi:** Gizli anahtarları asla kodda veya yapılandırma dosyalarında saklamayın. Kubernetes Secrets veya entegre edilmiş diğer gizli anahtar yönetimi araçlarını doğru şekilde kullanın. Erişimleri RBAC ile kısıtlayın.
5.  **Altyapı Olarak Kod (IaC) Güvenliği:** Dockerfile, Kubernetes manifestleri ve CI/CD pipeline tanımları gibi IaC dosyalarını düzenlerken güvenlik en iyi uygulamalarını takip edin. Değişiklikleri kod gözden geçirme süreçlerine dahil edin.
6.  **En Az Ayrıcalık İlkesi:** Hem kullanıcı hesapları hem de servisler için (örneğin, Kubernetes ServiceAccounts, IAM rolleri) yalnızca gerekli olan minimum izinleri atayın.
7.  **Loglama ve İzleme:** Güvenlik olaylarını tespit etmek ve analiz etmek için kapsamlı loglama ve izleme mekanizmaları kurun. Anormal aktiviteler için uyarılar (alerting) yapılandırın.
8.  **Düzenli Güncelleme ve Yamalama:** İşletim sistemlerini, konteyner temel imajlarını, bağımlılıkları ve diğer yazılım bileşenlerini düzenli olarak güncelleyerek bilinen güvenlik açıklarına karşı korunun.
9.  **Güvenlik Farkındalığı ve Eğitimi:** Ekip üyelerinin güncel güvenlik tehditleri ve en iyi uygulamalar konusunda düzenli olarak bilgilendirilmesi ve eğitilmesi önemlidir.
10. **Bu Dokümantasyonun Güncel Tutulması:** Yeni güvenlik önlemleri eklendikçe veya mevcutlar değiştikçe bu dokümanın güncellenmesi gerekmektedir.
