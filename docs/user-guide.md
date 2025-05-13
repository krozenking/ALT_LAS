# ALT_LAS Kullanıcı Kılavuzu (Güncellenmiş)

Bu belge, ALT_LAS sisteminin kullanımı hakkında güncel bilgiler içermektedir. Platformun temel işlevlerine nasıl erişileceği ve sistemle nasıl etkileşim kurulacağı açıklanmaktadır. Mevcut durumda, kullanıcı etkileşimi öncelikli olarak API Gateway üzerinden programatik olarak veya API test araçları (Postman, curl vb.) aracılığıyla gerçekleştirilmektedir.

## İçindekiler

1.  [Giriş](#giriş)
2.  [Sistem Mimarisine Genel Bakış](#sistem-mimarisine-genel-bakış)
3.  [Başlarken: API Gateway ile Etkileşim](#başlarken-api-gateway-ile-etkileşim)
    *   [API Gateway Adresi](#api-gateway-adresi)
    *   [Kimlik Doğrulama](#kimlik-doğrulama)
    *   [API Dokümantasyonu (Swagger UI)](#api-dokümantasyonu-swagger-ui)
4.  [Temel Kullanım Senaryoları (API Üzerinden)](#temel-kullanım-senaryoları-api-üzerinden)
    *   [Yeni Bir Görev Oluşturma (Segmentation Service)](#yeni-bir-görev-oluşturma-segmentation-service)
    *   [Bir Görevi Yürütme (Runner Service)](#bir-görevi-yürütme-runner-service)
    *   [Yürütme Sonuçlarını Arşivleme ve Sorgulama (Archive Service)](#yürütme-sonuçlarını-arşivleme-ve-sorgulama-archive-service)
    *   [İş Akışlarını Yönetme (Workflow Engine)](#i̇ş-akışlarını-yönetme-workflow-engine)
5.  [Çalışma Modları ve Persona Sistemi](#çalışma-modları-ve-persona-sistemi)
6.  [Sorun Giderme ve Destek](#sorun-giderme-ve-destek)

## 1. Giriş

ALT_LAS, bilgisayar sistemlerini ve dijital görevleri yapay zeka ile yönetmek için tasarlanmış modüler bir platformdur. Kullanıcıların karmaşık görevleri otomatikleştirmesini, verileri analiz etmesini ve sistemlerle akıllı bir şekilde etkileşim kurmasını sağlar.

### Temel Özellikler (API Odaklı)

-   **Modüler Mikroservis Mimarisi**: Her biri belirli bir işlevi yerine getiren bağımsız servisler (API Gateway, Segmentation, Workflow, Runner, Archive, OS Integration, AI Orchestrator).
-   **API Odaklı Etkileşim**: Tüm servislere API Gateway üzerinden erişim.
-   **Dosya Tabanlı İş Akışı**: Görev tanımları için `*.alt`, yürütme sonuçları için `*.last` ve bilgi birikimi için `*.atlas` dosyaları (bu dosyalar genellikle servisler arası iletilir ve doğrudan kullanıcı etkileşimi gerektirmeyebilir).
-   **Esnek Görev Tanımlama**: Segmentation Service aracılığıyla doğal dil veya yapılandırılmış girdilerden görev oluşturma.
-   **Çalışma Modları ve Persona Desteği**: Görev işleme davranışını ve AI etkileşimlerini özelleştirme.

## 2. Sistem Mimarisine Genel Bakış

ALT_LAS, bir dizi mikroservisten oluşur. Bu servislerle etkileşim kurmanın ana yolu API Gateway'dir. Detaylı mimari için lütfen [`architecture.md`](../architecture.md) belgesine başvurun.

## 3. Başlarken: API Gateway ile Etkileşim

### API Gateway Adresi

API Gateway genellikle yerel geliştirme ortamında `http://localhost:3000` adresinde çalışır. Üretim ortamında bu adres farklılık gösterecektir.

### Kimlik Doğrulama

API Gateway üzerinden korumalı endpoint'lere erişim için JWT (JSON Web Token) tabanlı kimlik doğrulama kullanılır.

1.  **Kayıt Olma**: `/api/auth/register` endpoint'ine `POST` isteği ile kullanıcı adı ve şifre göndererek kayıt olun.
2.  **Giriş Yapma**: `/api/auth/login` endpoint'ine `POST` isteği ile kullanıcı adı ve şifre göndererek giriş yapın. Yanıtta bir `accessToken` ve `refreshToken` alacaksınız.
3.  **Token Kullanımı**: Korumalı endpoint'lere yapılan isteklerde `Authorization` başlığına `Bearer <accessToken>` şeklinde token'ı ekleyin.
4.  **Token Yenileme**: `accessToken` süresi dolduğunda, `/api/auth/refresh` endpoint'ine `refreshToken` göndererek yeni bir `accessToken` alabilirsiniz.
5.  **Çıkış Yapma**: `/api/auth/logout` endpoint'ine `refreshToken` göndererek oturumu sonlandırabilirsiniz.

### API Dokümantasyonu (Swagger UI)

API Gateway, mevcut tüm endpoint'leri, istek parametrelerini ve yanıt formatlarını detaylandıran interaktif bir Swagger UI dokümantasyonu sunar. Bu dokümantasyona genellikle API Gateway adresinin `/api-docs` yolundan (örn: `http://localhost:3000/api-docs`) erişebilirsiniz.

## 4. Temel Kullanım Senaryoları (API Üzerinden)

Aşağıda, ALT_LAS platformunun temel işlevlerini API Gateway üzerinden nasıl kullanabileceğinize dair örnek senaryolar bulunmaktadır.

### Yeni Bir Görev Oluşturma (Segmentation Service)

Kullanıcıdan gelen bir komutu (doğal dil veya yapılandırılmış) işlenebilir bir görev tanımına (`*.alt` dosyasına referans) dönüştürmek için Segmentation Service kullanılır.

-   **Endpoint**: `POST /api/v1/segmentation`
-   **İstek Gövdesi (Örnek)**:
    ```json
    {
      "command": "Belgelerimdeki tüm .txt dosyalarını bul ve içeriklerini özetle.",
      "mode": "Normal", // Opsiyonel: Normal, Dream, Explore, Chaos
      "persona": "technical_expert" // Opsiyonel
    }
    ```
-   **Yanıt (Örnek)**:
    ```json
    {
      "id": "seg_xxxxxx",
      "status": "success",
      "altFile": "task_yyyyyy.alt", // Oluşturulan görev tanım dosyasının referansı
      "metadata": { ... }
    }
    ```

### Bir Görevi Yürütme (Runner Service)

Segmentation Service tarafından oluşturulan bir görevi (`*.alt` dosyası) yürütmek için Runner Service kullanılır.

-   **Endpoint**: `POST /api/v1/runner/execute` (veya benzeri, Swagger'dan kontrol edin)
-   **İstek Gövdesi (Örnek)**:
    ```json
    {
      "altFileReference": "task_yyyyyy.alt", // Segmentation'dan dönen referans
      "parameters": { ... } // Görev için ek parametreler (opsiyonel)
    }
    ```
-   **Yanıt (Örnek)**:
    ```json
    {
      "taskId": "run_zzzzzz",
      "status": "pending" // veya "running"
    }
    ```
-   Görev durumunu sorgulamak için `GET /api/v1/runner/{taskId}` gibi bir endpoint kullanılabilir.

### Yürütme Sonuçlarını Arşivleme ve Sorgulama (Archive Service)

Runner Service tarafından tamamlanan görevlerin sonuçları (`*.last` dosyaları) Archive Service tarafından saklanır ve analiz için `*.atlas` verileri oluşturulur.

-   Archive Service genellikle Runner Service ile otomatik olarak entegre çalışır.
-   Arşivlenmiş görev sonuçlarını sorgulamak için Archive Service'in API endpoint'leri (örn: `GET /api/v1/archive/{archiveId}` veya arama endpoint'leri) kullanılabilir. Detaylar için Swagger dokümantasyonuna bakın.

### İş Akışlarını Yönetme (Workflow Engine)

Birden fazla adımı ve servisi içeren karmaşık otomasyonlar oluşturmak ve yönetmek için Workflow Engine kullanılır.

-   **Yeni İş Akışı Oluşturma**: `POST /workflows`
-   **İş Akışlarını Listeleme**: `GET /workflows`
-   **Bir İş Akışını Çalıştırma**: `POST /workflows/{workflowId}/run`
-   **Çalışma Durumlarını İzleme**: `GET /runs/{runId}`
-   **Kullanılabilir Parçaları (Pieces) Listeleme**: `GET /pieces`

Detaylı endpoint bilgileri ve istek/yanıt formatları için Workflow Engine'in Swagger dokümantasyonuna (API Gateway üzerinden erişilebilir) başvurun.

## 5. Çalışma Modları ve Persona Sistemi

Segmentation Service'e istek gönderirken `mode` ve `persona` parametrelerini kullanarak AI'nin davranışını ve görev yorumlama şeklini etkileyebilirsiniz.

-   **Modlar**: `Normal`, `Dream` (yaratıcı/varsayımsal), `Explore` (kapsam genişletici), `Chaos` (rastgele/öngörülemez).
-   **Personalar**: `technical_expert`, `creative_writer`, `researcher`, `project_manager` vb. (Desteklenen personalar için AI Orchestrator veya Segmentation Service dokümantasyonuna bakın).

Bu parametreler, özellikle doğal dil komutlarının işlenmesinde ve AI tabanlı görevlerin yürütülmesinde sonuçları önemli ölçüde değiştirebilir.

## 6. Sorun Giderme ve Destek

-   **API Hataları**: API Gateway'den dönen hata mesajlarını ve HTTP durum kodlarını kontrol edin. Swagger UI, olası hata yanıtlarını da listeler.
-   **Servis Durumları**: API Gateway üzerinden `/api/status` (admin erişimi) endpoint'i ile backend servislerinin sağlık durumlarını kontrol edebilirsiniz.
-   **Loglar**: Her servisin kendi logları bulunmaktadır. Geliştirme ortamında bu loglar genellikle konsola yazdırılır veya dosyalara kaydedilir. Detaylar için [`developer-guide.md`](../docs/developer-guide.md) belgesine bakın.
-   **Destek**: Proje ile ilgili sorularınız veya sorunlarınız için GitHub Issues sayfasını kullanabilirsiniz.

Bu kullanıcı kılavuzu, ALT_LAS platformuyla API üzerinden etkileşim kurmaya başlamanıza yardımcı olmayı amaçlamaktadır. Platform geliştikçe ve kullanıcı arayüzleri (Desktop, Web) tam olarak entegre edildikçe bu kılavuz güncellenecektir.
