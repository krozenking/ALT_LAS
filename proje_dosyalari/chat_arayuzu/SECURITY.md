# Güvenlik Politikası

## Desteklenen Sürümler

Aşağıdaki sürümler için güvenlik güncellemeleri sağlanmaktadır:

| Sürüm | Destekleniyor |
| ----- | ------------- |
| 1.0.x | :white_check_mark: |
| 0.9.x | :white_check_mark: |
| 0.8.x | :x: |
| < 0.8.0 | :x: |

## Güvenlik Açığı Bildirme

ALT_LAS Chat Botu'nda bir güvenlik açığı bulduysanız, lütfen bunu security@altlas.com adresine bildirin. Tüm güvenlik açıkları ciddiyetle ele alınacak ve hızla çözülecektir.

Güvenlik açığı bildiriminizde lütfen aşağıdaki bilgileri sağlayın:

1. Güvenlik açığının açık ve özlü bir açıklaması
2. Güvenlik açığını yeniden oluşturmak için adımlar
3. Güvenlik açığının potansiyel etkisi
4. Mümkünse, güvenlik açığını gidermek için öneriler

## Güvenlik Açığı Bildirimi Süreci

1. Güvenlik açığı bildiriminizi aldığımızda, 48 saat içinde yanıt vereceğiz.
2. Güvenlik açığını doğrulayacağız ve etkisini değerlendireceğiz.
3. Güvenlik açığını gidermek için bir plan geliştireceğiz.
4. Güvenlik açığını gidermek için bir yama yayınlayacağız.
5. Güvenlik açığını ve yamayı kamuya açık olarak duyuracağız.

## Güvenlik Açığı Bildirimi Ödül Programı

Şu anda resmi bir ödül programımız bulunmamaktadır, ancak önemli güvenlik açıklarını bildiren kişilere teşekkür olarak ALT_LAS katkıda bulunanlar listesine eklenme ve/veya sembolik bir ödül sunulabilir.

## Güvenlik En İyi Uygulamaları

ALT_LAS Chat Botu'nu kullanırken aşağıdaki güvenlik en iyi uygulamalarını takip etmenizi öneririz:

1. **Güncel Tutun**: Her zaman en son sürümü kullanın.
2. **Güçlü Parolalar**: Güçlü ve benzersiz parolalar kullanın.
3. **API Anahtarları**: API anahtarlarını güvenli bir şekilde saklayın ve asla kaynak koduna dahil etmeyin.
4. **HTTPS**: Her zaman HTTPS kullanın.
5. **İçerik Güvenliği Politikası**: Uygun bir Content Security Policy (CSP) yapılandırın.
6. **Erişim Kontrolü**: Uygun erişim kontrolü mekanizmaları uygulayın.
7. **Giriş Doğrulama**: Tüm kullanıcı girişlerini doğrulayın ve temizleyin.
8. **Günlük Kaydı**: Güvenlik olaylarını izlemek için uygun günlük kaydı yapın.

## Güvenlik Özellikleri

ALT_LAS Chat Botu, aşağıdaki güvenlik özelliklerini içerir:

1. **XSS Koruması**: Tüm kullanıcı girişleri temizlenir ve HTML escape edilir.
2. **CSRF Koruması**: CSRF token'ları kullanılarak Cross-Site Request Forgery saldırılarına karşı koruma sağlanır.
3. **Content Security Policy**: Tarayıcı tabanlı saldırılara karşı koruma sağlamak için CSP uygulanır.
4. **Güvenli Depolama**: Hassas veriler şifrelenerek yerel depolamada saklanır.
5. **Güvenli Dosya İşleme**: Yüklenen dosyalar güvenli bir şekilde işlenir ve doğrulanır.
6. **Güvenli API İstekleri**: Tüm API istekleri HTTPS üzerinden yapılır ve uygun kimlik doğrulama ile korunur.

## Güvenlik Güncellemeleri

Güvenlik güncellemeleri, [GitHub Releases](https://github.com/krozenking/ALT_LAS/releases) sayfasında ve [ALT_LAS Güvenlik Bültenleri](https://altlas.com/security) sayfasında duyurulacaktır.

Güvenlik güncellemeleri hakkında otomatik bildirimler almak için, GitHub deposunu izleyebilir veya security-updates@altlas.com adresine e-posta gönderebilirsiniz.

## İletişim

Güvenlikle ilgili sorularınız veya endişeleriniz için lütfen security@altlas.com adresine e-posta gönderin.
