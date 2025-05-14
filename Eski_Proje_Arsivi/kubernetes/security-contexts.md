# Kubernetes Pod ve Konteyner Güvenlik Bağlamları (Security Contexts)

Bu belge, ALT_LAS projesi için Kubernetes Pod ve Konteyner Güvenlik Bağlamları (Security Contexts) kullanımına yönelik en iyi uygulamaları ve önerileri tanımlar.

## Güvenlik Bağlamı Nedir?

Güvenlik Bağlamı, bir Pod veya Konteyner için ayrıcalık ve erişim kontrolü ayarlarını tanımlar. Bu ayarlar, podların ve konteynerlerin ana makine (node) üzerinde ve birbirleriyle nasıl etkileşim kurabileceğini kısıtlamak için kullanılır.

## Önerilen Ayarlar

Pod ve Konteyner tanımlarında aşağıdaki `securityContext` ayarlarının kullanılması şiddetle tavsiye edilir:

1.  **`runAsNonRoot: true`**: Konteynerin kök (root) kullanıcı olarak çalışmasını engeller. Bu, konteynerin ele geçirilmesi durumunda potansiyel hasarı sınırlar.
2.  **`runAsUser` / `runAsGroup`**: Konteynerin çalışacağı belirli bir kullanıcı kimliği (UID) ve grup kimliği (GID) ayarlar. Genellikle `runAsNonRoot` ile birlikte kullanılır ve Dockerfile'da oluşturulan kullanıcıyla eşleşmelidir.
3.  **`readOnlyRootFilesystem: true`**: Konteynerin kök dosya sistemini salt okunur yapar. Bu, saldırganların konteynerin dosya sistemine yazmasını engeller. Uygulamanın yazma erişimine ihtiyaç duyduğu dizinler için `volumeMounts` ile birlikte boş `emptyDir` veya kalıcı birimler (Persistent Volumes) kullanılmalıdır.
4.  **`allowPrivilegeEscalation: false`**: Konteyner içindeki bir işlemin, ana işlemden daha fazla ayrıcalık kazanmasını engeller. `setuid` veya `setgid` gibi mekanizmaların kullanılmasını önler.
5.  **`capabilities`**: Linux yeteneklerini (capabilities) yönetir.
    *   **`drop: ["ALL"]`**: Varsayılan olarak tüm yetenekleri kaldırır. Bu, en güvenli yaklaşımdır.
    *   **`add: [...]`**: Yalnızca uygulamanın çalışması için kesinlikle gerekli olan minimum yetenekleri ekler (örneğin, `NET_BIND_SERVICE` eğer konteyner 1024'ün altındaki bir portu dinliyorsa ve root olarak çalışmıyorsa).
6.  **`seccompProfile`**: Konteynerin yapabileceği sistem çağrılarını (syscalls) kısıtlamak için `seccomp` profillerini kullanır.
    *   **`type: RuntimeDefault`**: Çoğu iş yükü için iyi bir başlangıç noktası olan, konteyner çalışma zamanı tarafından sağlanan varsayılan profili kullanır.
    *   **`type: Localhost`**: Daha özel profiller için düğüm üzerinde tanımlanmış bir profili kullanır.

## Örnek Pod Tanımı

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod-example
spec:
  securityContext:
    # Pod seviyesi güvenlik bağlamı (tüm konteynerlere uygulanır)
    runAsNonRoot: true
    runAsUser: 1001 # Dockerfile'da oluşturulan UID ile eşleşmeli
    runAsGroup: 1001 # Dockerfile'da oluşturulan GID ile eşleşmeli
    fsGroup: 1001 # Birimlere erişim için grup
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: my-secure-container
    image: my-app:latest
    securityContext:
      # Konteyner seviyesi güvenlik bağlamı (Pod seviyesini geçersiz kılabilir/ekleyebilir)
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
        # add:
        # - NET_BIND_SERVICE # Gerekliyse ekleyin
    volumeMounts:
    - name: tmp-data
      mountPath: /tmp # Yazılabilir geçici dizin
    # ... diğer volumeMounts
  volumes:
  - name: tmp-data
    emptyDir: {} # Geçici veriler için boş dizin
  # ... diğer volumes
```

## Sonraki Adımlar

1.  Tüm Deployment, StatefulSet, DaemonSet vb. manifestlerdeki Pod ve Konteyner tanımlarına yukarıdaki önerilen `securityContext` ayarlarını ekleyin.
2.  Dockerfile'larda oluşturulan kullanıcı/grup kimliklerinin (`runAsUser`/`runAsGroup`) manifestlerdeki değerlerle tutarlı olduğundan emin olun.
3.  Uygulamaların ihtiyaç duyduğu minimum yetenekleri belirleyin ve yalnızca bunları `capabilities.add` listesine ekleyin.
4.  `readOnlyRootFilesystem: true` kullanılıyorsa, gerekli yazılabilir dizinler için `volumeMounts` ve `volumes` tanımlayın.
