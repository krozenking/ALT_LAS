# ALT_LAS Kubernetes Manifest Dosyaları

Bu dizin, ALT_LAS projesinin Kubernetes üzerinde çalıştırılması için gerekli YAML manifest dosyalarını içermektedir.

## Dosya Açıklamaları

- **alt-las-configmap.yaml**: Ortam değişkenleri ve yapılandırma ayarları
- **alt-las-secrets.yaml**: Hassas bilgiler (şifreler, API anahtarları)
- **api-gateway-deployment.yaml**: API Gateway servisinin Deployment kaynağı
- **api-gateway-service.yaml**: API Gateway servisinin Service kaynağı
- **ingress.yaml**: Dış erişim için Ingress kaynağı

## Kullanım

Bu manifest dosyalarını Kubernetes kümenize uygulamak için:

```bash
kubectl apply -f .
```

## Notlar

- Gerçek bir üretim ortamında, `alt-las-secrets.yaml` dosyasını Git'e eklememelisiniz. Bunun yerine, Kubernetes Secret'larını güvenli bir şekilde yönetmek için HashiCorp Vault gibi bir sır yönetimi çözümü kullanmalısınız.
- Bu manifest dosyaları, yerel geliştirme ortamı için optimize edilmiştir. Üretim ortamı için ek yapılandırmalar gerekebilir.

## Diğer Servisler

Diğer servisler (segmentation-service, runner-service, archive-service, ai-orchestrator) için benzer Deployment ve Service YAML dosyaları oluşturulmalıdır. Bu dosyalar, Docker Compose dosyasından Kompose aracı kullanılarak otomatik olarak oluşturulabilir.
