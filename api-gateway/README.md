# API Gateway

Bu dizin, ALT_LAS projesinin API Gateway servisi için kodları içerir. API Gateway, istemcilerden gelen tüm istekleri karşılayan, kimlik doğrulama, yetkilendirme, yönlendirme, rate limiting, caching ve diğer çeşitli ara katman görevlerini yerine getiren merkezi bir bileşendir.

## Temel Özellikler

API Gateway aşağıdaki temel özellikleri içerir:

*   **RESTful API Uç Noktaları:** Mikroservislere erişim için standart HTTP metodlarını destekleyen uç noktalar.
*   **Kimlik Doğrulama:** JWT (JSON Web Token) tabanlı kimlik doğrulama. Token oluşturma, doğrulama, yenileme ve güvenli bir şekilde sonlandırma mekanizmalarını içerir.
*   **Yetkilendirme:** Rol Tabanlı Erişim Kontrolü (RBAC) ve daha granüler izin tabanlı yetkilendirme. Kullanıcıların rollerine ve izinlerine göre kaynaklara erişimini kısıtlar.
*   **Servis Yönlendirme (Proxy):** Gelen istekleri uygun backend mikroservislerine (Segmentation, Runner, Archive) yönlendirir.
*   **Rate Limiting:** API kullanımını sınırlayarak kötüye kullanımı ve aşırı yüklenmeyi önler.
*   **Caching:** Sık erişilen yanıtları Redis kullanarak önbelleğe alarak performansı artırır.
*   **Loglama:** Kapsamlı istek/yanıt loglaması (Winston) ve dağıtık izleme için OpenTelemetry entegrasyonu.
*   **Hata İşleme:** Standartlaştırılmış ve kullanıcı dostu hata yanıtları.
*   **API Dokümantasyonu:** Swagger/OpenAPI kullanılarak otomatik olarak oluşturulan ve güncel tutulan interaktif API dokümantasyonu (`/api-docs` altında erişilebilir).
*   **Güvenlik:** Helmet ile temel güvenlik başlıkları, CORS yapılandırması.
*   **Sıkıştırma:** Yanıtları sıkıştırarak (compression) ağ trafiğini azaltır.
*   **Servis Keşfi:** Temel servis kayıt ve sağlık kontrolü mekanizması.
*   **Performans İzleme:** Temel metriklerin toplanması ve `/metrics` endpoint üzerinden sunulması.
*   **Sağlık Kontrolü:** `/health` endpoint üzerinden servis sağlık durumunun kontrolü.

## Kurulum ve Çalıştırma

1.  **Bağımlılıkların Kurulumu:**

    ```bash
    cd api-gateway
    npm install
    ```
2.  **Ortam Değişkenleri:**

    Proje kök dizininde (`api-gateway/`) bir `.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın (örnek değerler verilmiştir, kendi yapılandırmanıza göre düzenleyin):

    ```env
    PORT=3000
    JWT_SECRET=your_super_secret_jwt_key_change_this
    JWT_EXPIRES_IN=1h
    JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_change_this
    JWT_REFRESH_EXPIRES_IN=7d
    REDIS_URL=redis://localhost:6379
    SEGMENTATION_SERVICE_URL=http://localhost:3001
    RUNNER_SERVICE_URL=http://localhost:3002
    ARCHIVE_SERVICE_URL=http://localhost:3003
    # OpenTelemetry Collector Endpoint (optional)
    OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
    ```
3.  **Uygulamayı Başlatma (Geliştirme Modu):**

    ```bash
    npm run dev
    ```
4.  **Uygulamayı Başlatma (Production Modu):**

    ```bash
    npm run build
    npm start
    ```
5.  **Testleri Çalıştırma:**

    ```bash
    npm test
    ```

## API Dokümantasyonu

API Gateway için detaylı ve interaktif dokümantasyon, uygulama çalıştırıldıktan sonra `/api-docs` adresinden (örneğin, `http://localhost:3000/api-docs`) erişilebilir. Dokümantasyon `swagger.yaml` dosyasından otomatik olarak oluşturulmaktadır.

