# Kubernetes Pod Security Admission (PSA)

Bu belge, ALT_LAS projesi için Kubernetes Pod Güvenlik Kabulü (PSA) standartlarını tanımlar. Pod Güvenlik Politikaları (PSP) kullanımdan kaldırıldığı için, küme genelinde pod güvenliğini zorlamak amacıyla PSA kullanılacaktır.

## Pod Güvenlik Standartları

Kubernetes üç yerleşik Pod Güvenlik Standardı tanımlar:

1.  **Privileged (Ayrıcalıklı):** Kasıtlı olarak açık ve tamamen kısıtlanmamış bir politikadır. Bu politika genellikle sistem düzeyindeki ve altyapı iş yükleri için ayrılmıştır.
2.  **Baseline (Temel):** Bilinen ayrıcalık yükseltmelerini engelleyen, kolayca benimsenebilen bir politikadır. Varsayılan (minimum) pod yapılandırmasını hedefler.
3.  **Restricted (Kısıtlı):** Mevcut en iyi pod sertleştirme uygulamalarını takip eden, oldukça kısıtlı bir politikadır. Bu politika, güvenlik açısından kritik uygulamalar için hedeflenmiştir.

## Namespace Yapılandırması

PSA, namespace etiketleri aracılığıyla yapılandırılır. Her namespace için bir veya daha fazla modda (enforce, audit, warn) bir güvenlik standardı seviyesi atanabilir.

**Önerilen Yapılandırma:**

*   **kube-system ve diğer altyapı namespace'leri:** Genellikle `privileged` seviyesine ihtiyaç duyabilirler, ancak dikkatli olunmalıdır.
*   **Uygulama namespace'leri (örneğin, `alt-las-dev`, `alt-las-staging`, `alt-las-prod`):**
    *   **Enforce (Zorunlu Kıl):** `restricted`
    *   **Audit (Denetle):** `restricted`
    *   **Warn (Uyar):** `restricted`

Bu yapılandırma, uygulama namespace'lerindeki tüm podların en katı güvenlik standartlarına uymasını zorunlu kılar.

**Örnek Namespace Etiketlemesi:**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: alt-las-prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
    # Ortam ve uygulama ile ilgili diğer etiketler
    environment: production
    app: alt-las
```

## Sonraki Adımlar

1.  Mevcut veya oluşturulacak Kubernetes Deployment/Pod manifestlerine uygun `securityContext` ayarlarının eklenmesi.
2.  Namespace'lerin yukarıda belirtilen etiketlerle yapılandırılması.
3.  CI/CD süreçlerine pod güvenlik standartları denetimlerinin eklenmesi (örneğin, `kubeval`, `conftest` kullanarak).
