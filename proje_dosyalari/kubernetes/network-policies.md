# Kubernetes Network Policies

Bu belge, ALT_LAS projesi için Kubernetes Ağ Politikaları (Network Policies) stratejisini ve örneklerini tanımlar.

## Varsayılan Reddetme Politikası (Default Deny)

Güvenliği artırmak için, tüm namespace'lerde varsayılan olarak tüm gelen (ingress) trafiği reddeden bir politika uygulanması önerilir. Bu, yalnızca açıkça izin verilen trafiğin podlara ulaşmasını sağlar.

**Örnek Varsayılan Reddetme Politikası (`default-deny-ingress.yaml`):**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  # Bu politika uygulanacak namespace'i belirtin
  # namespace: alt-las-prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
```

Bu politika, seçili namespace'deki tüm podlara gelen trafiği engeller. Giden (egress) trafik varsayılan olarak engellenmez, ancak gerekirse benzer bir `default-deny-egress` politikası da oluşturulabilir.

## Servis Özelinde İzin Politikaları

Varsayılan reddetme politikası uygulandıktan sonra, servisler arasında ve dış dünyadan gelen gerekli trafiğe izin vermek için özel politikalar oluşturulmalıdır.

**Örnek: API Gateway'e Gelen Trafiğe İzin Verme (`allow-ingress-to-api-gateway.yaml`):**

Bu politika, dışarıdan (örneğin bir Ingress Controller'dan) ve belirli diğer podlardan (örneğin UI'dan) `api-gateway` podlarına gelen trafiğe izin verir.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-api-gateway
  # namespace: alt-las-prod
spec:
  podSelector:
    matchLabels:
      app: api-gateway # api-gateway podlarının etiketi
  policyTypes:
  - Ingress
  ingress:
  - from:
    # Ingress controller'ın bulunduğu namespace'den gelen trafiğe izin ver
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: ingress-nginx # Ingress controller namespace etiketi
      podSelector:
        matchLabels:
          app.kubernetes.io/name: ingress-nginx # Ingress controller pod etiketi
    # UI podlarından gelen trafiğe izin ver (aynı namespace içinde)
    - podSelector:
        matchLabels:
          app: ui-desktop # ui-desktop podlarının etiketi
    ports:
    - protocol: TCP
      port: 3000 # api-gateway'in dinlediği port
```

**Örnek: Servisler Arası İletişime İzin Verme (`allow-api-gateway-to-backend.yaml`):**

Bu politika, `api-gateway` podlarının `ai-orchestrator` podlarına belirli bir port üzerinden erişmesine izin verir.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway-to-ai-orchestrator
  # namespace: alt-las-prod
spec:
  podSelector:
    matchLabels:
      app: ai-orchestrator # ai-orchestrator podlarının etiketi
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway # api-gateway podlarının etiketi
    ports:
    - protocol: TCP
      port: 8000 # ai-orchestrator'ın dinlediği port
```

## Sonraki Adımlar

1.  Her namespace için `default-deny-ingress` politikasını oluşturun ve uygulayın.
2.  Uygulama mimarisine göre gerekli servisler arası ve dış trafiğe izin veren özel NetworkPolicy manifestleri oluşturun.
3.  Podlara doğru etiketlerin (`app`, `environment` vb.) atandığından emin olun.
4.  Politikaları test edin ve doğrulayın.
