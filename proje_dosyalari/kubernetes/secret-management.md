# Kubernetes Gizli Anahtar Yönetimi (Secret Management)

Bu belge, ALT_LAS projesi için Kubernetes ortamında gizli anahtarların (secrets) güvenli bir şekilde yönetilmesine yönelik stratejiyi ve en iyi uygulamaları tanımlar.

## Gizli Anahtar Nedir?

Gizli anahtarlar, şifreler, API anahtarları, tokenlar, TLS sertifikaları gibi hassas verilerdir. Bu verilerin güvenli bir şekilde saklanması ve podlara iletilmesi kritik öneme sahiptir.

## Temel İlkeler

1.  **Gizli Anahtarları Koddan ve Yapılandırmadan Ayırın:** Gizli anahtarları asla doğrudan uygulama koduna, Docker imajlarına veya ConfigMap'lere gömmeyin.
2.  **En Az Ayrıcalık İlkesi:** Podların yalnızca ihtiyaç duydukları gizli anahtarlara erişebildiğinden emin olun.
3.  **Şifreleme:** Kubernetes etcd veritabanında gizli anahtarların şifrelenerek saklandığından emin olun (Encryption at Rest).
4.  **Rotasyon:** Mümkün olduğunda gizli anahtarların düzenli olarak değiştirilmesini (rotasyon) sağlayın.
5.  **Denetim:** Gizli anahtarlara erişimi ve yapılan değişiklikleri denetleyin.

## Kubernetes Secrets Kullanımı

Kubernetes'in yerleşik `Secret` kaynağı, gizli anahtarları yönetmek için temel bir mekanizma sunar.

**Oluşturma:**

*   **Imperative (Komut Satırı):**
    ```bash
    # Opaque (Genel) secret
    kubectl create secret generic db-credentials --from-literal=username=admin --from-literal=password='s3cr3tP@ssw0rd'

    # TLS secret
    kubectl create secret tls tls-certificate --cert=path/to/tls.crt --key=path/to/tls.key
    ```
*   **Declarative (Manifest Dosyası):**
    ```yaml
    apiVersion: v1
    kind: Secret
    metadata:
      name: db-credentials
    type: Opaque
    data:
      # Değerler base64 ile kodlanmalıdır
      username: YWRtaW4=
      password: czNjcjN0UEBzc3cwcmQ=
    ```
    *Not: Base64 kodlaması şifreleme değildir, yalnızca veriyi temsil etme biçimidir.*

**Podlara Bağlama:**

Gizli anahtarlar podlara iki ana yolla bağlanabilir:

1.  **Ortam Değişkenleri Olarak:**
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: my-app-pod
    spec:
      containers:
      - name: my-app-container
        image: my-app:latest
        env:
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: password
    ```
2.  **Birim (Volume) Olarak:**
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: my-app-pod
    spec:
      containers:
      - name: my-app-container
        image: my-app:latest
        volumeMounts:
        - name: db-secret-volume
          mountPath: "/etc/secrets/db"
          readOnly: true
      volumes:
      - name: db-secret-volume
        secret:
          secretName: db-credentials
    ```
    *Birim olarak bağlamak genellikle daha güvenli kabul edilir, çünkü ortam değişkenleri loglarda veya `kubectl describe` çıktılarında kazara ifşa olabilir.*

## Gelişmiş Gizli Anahtar Yönetimi Araçları

Daha karmaşık ihtiyaçlar ve daha yüksek güvenlik gereksinimleri için harici araçlar entegre edilebilir:

1.  **HashiCorp Vault:** Merkezi gizli anahtar yönetimi, dinamik gizli anahtarlar, kiralama, rotasyon ve denetim gibi gelişmiş özellikler sunar. Kubernetes ile entegrasyonu için Vault Agent Sidecar veya CSI (Container Storage Interface) sürücüsü kullanılabilir.
2.  **Sealed Secrets (Bitnami):** GitOps akışlarında gizli anahtarları güvenli bir şekilde saklamak için kullanılır. Gizli anahtarlar bir denetleyici tarafından şifrelenir ve yalnızca küme içinde çalışan bir denetleyici tarafından deşifre edilebilir. Bu, şifrelenmiş gizli anahtarların güvenle Git deposunda saklanmasını sağlar.
3.  **Bulut Sağlayıcı Gizli Anahtar Yöneticileri:** AWS Secrets Manager, Azure Key Vault, Google Secret Manager gibi bulut sağlayıcılarının sunduğu yönetilen servisler de Kubernetes ile entegre edilebilir (genellikle CSI sürücüleri aracılığıyla).

**Öneri:** Projenin başlangıç aşamasında Kubernetes Secrets yeterli olabilir. Ancak, gizli anahtar sayısı arttıkça, rotasyon ihtiyacı doğduğunda veya daha sıkı denetim gerektiğinde HashiCorp Vault veya Sealed Secrets gibi çözümler değerlendirilmelidir.

## RBAC (Rol Tabanlı Erişim Kontrolü)

Kubernetes RBAC kullanarak `Secret` kaynaklarına erişimi kısıtlayın. Yalnızca belirli ServiceAccount'ların veya kullanıcıların gerekli gizli anahtarları okumasına izin verin.

## Sonraki Adımlar

1.  Uygulamaların ihtiyaç duyduğu tüm gizli anahtarları belirleyin (veritabanı şifreleri, API anahtarları, sertifikalar vb.).
2.  Seçilen yönteme göre (Kubernetes Secrets, Vault, Sealed Secrets vb.) gizli anahtarları oluşturun.
3.  Deployment manifestlerinde gizli anahtarları podlara güvenli bir şekilde bağlayın (tercihen birim olarak).
4.  Gizli anahtarlara erişimi kısıtlamak için uygun RBAC kuralları tanımlayın.
5.  Gizli anahtarların etcd'de şifrelendiğinden emin olun (küme yapılandırması).
