# Docker Arşivi

Bu klasör, ALT_LAS projesinin beta aşamasına geçiş kapsamında arşivlenen Docker dosyalarını içermektedir. Bu dosyalar, beta aşamasına geçiş sürecinde oluşturulan ancak artık kullanılmayan Docker dosyalarıdır.

## Arşivlenen Dosyalar

### Runner Service

- `Dockerfile.beta.runner-service.v1`: İlk beta sürümü, Rust 1.75 kullanıyor
- `Dockerfile.beta.runner-service.v2`: İkinci beta sürümü, en son Rust sürümünü kullanıyor
- `Dockerfile.beta.runner-service.v3`: Üçüncü beta sürümü, mevcut Dockerfile'ı temel alıyor
- `Dockerfile.beta.runner-service.v4`: Dördüncü beta sürümü, bağımlılıkları önbelleğe almak için farklı bir yaklaşım kullanıyor

### API Gateway

- `Dockerfile.beta.api-gateway.v2`: İkinci beta sürümü, temel güvenlik iyileştirmeleri içeriyor
- `Dockerfile.beta.api-gateway.v4`: Dördüncü beta sürümü, CommonJS modül sistemi kullanımı eklendi
- `Dockerfile.beta.api-gateway.v5`: Beşinci beta sürümü, package.json doğrulaması eklendi
- `Dockerfile.beta.api-gateway.v6`: Altıncı beta sürümü, dosya kodlama sorunları giderildi
- `Dockerfile.beta.api-gateway.v7`: Yedinci beta sürümü, dosya kodlama sorunları giderildi
- `Dockerfile.beta.api-gateway.v8`: Sekizinci beta sürümü, dosya kodlama sorunları giderildi

## Arşivleme Nedeni

Bu dosyalar, beta aşamasına geçiş sürecinde oluşturulan ancak çeşitli nedenlerle (derleme hataları, performans sorunları, güvenlik açıkları vb.) kullanılmayan Docker dosyalarıdır. Bu dosyalar, gelecekte benzer sorunlarla karşılaşıldığında referans olarak kullanılabilir.

## Güncel Dosyalar

Güncel Docker dosyaları aşağıdaki gibidir:

- Runner Service: `docker/Dockerfile.beta.runner-service.final`
- API Gateway: `docker/Dockerfile.beta.api-gateway.v9`
- Segmentation Service: `docker/Dockerfile.beta.segmentation-service`

## Arşivleme Tarihi

Bu dosyalar, 15 Temmuz 2023 tarihinde arşivlenmiştir.

## Arşivleyen

Bu dosyalar, Can Tekin (DevOps Mühendisi) tarafından arşivlenmiştir.
