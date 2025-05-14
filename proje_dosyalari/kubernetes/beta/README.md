# ATLAS Beta Ortamı

Bu dizin, ATLAS projesinin beta ortamı için Kubernetes yapılandırma dosyalarını içerir.

## Beta Ortamı Hakkında

Beta ortamı, aşağıdaki iyileştirmeleri içeren yeni sürümleri test etmek için kullanılır:

- Ölçeklendirme iyileştirmeleri
- Performans optimizasyonları
- Güvenlik güncellemeleri
- Kullanıcı deneyimi iyileştirmeleri

## Servisler

Beta ortamı aşağıdaki servisleri içerir:

1. **API Gateway**: Tüm istekleri karşılayan ve ilgili servislere yönlendiren ana giriş noktası
2. **Archive Service**: Belge arşivleme ve yönetim hizmetleri
3. **Segmentation Service**: Belge segmentasyonu ve analizi
4. **AI Orchestrator**: Yapay zeka modellerinin yönetimi ve koordinasyonu
5. **PostgreSQL**: Veritabanı

## Dağıtım

Beta ortamını dağıtmak için:

```bash
cd kubernetes/beta
chmod +x deploy.sh
./deploy.sh
```

## Erişim

Beta API'sine şu adresten erişilebilir:

```
https://beta-api.atlas.example.com
```

## Notlar

- Beta ortamı, gerçek üretim verilerini kullanmaz, test verileri ile çalışır.
- Beta ortamındaki güvenlik anahtarları ve parolalar gerçek ortamda değiştirilmelidir.
- Herhangi bir sorun bulunursa, lütfen geliştirme ekibine bildirin.

## Kaynaklar

- CPU ve bellek kaynakları, beta ortamı için optimize edilmiştir.
- Veritabanı için 10GB depolama alanı ayrılmıştır.
- Tüm servisler, yüksek kullanılabilirlik için en az 2 replika ile çalışır (API Gateway 3 replika).

## Güvenlik

- Tüm servisler, güvenli iletişim için TLS kullanır.
- API Gateway, JWT tabanlı kimlik doğrulama kullanır.
- Hassas bilgiler Kubernetes Secret'ları içinde saklanır.
