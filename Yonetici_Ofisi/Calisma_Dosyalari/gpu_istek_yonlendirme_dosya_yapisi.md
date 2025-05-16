# GPU İstek Yönlendirme Katmanı Dosya Yapısı

**Doküman Bilgileri:**
- **Oluşturan:** Yazılım Mimarı, Kıdemli Backend Geliştirici
- **Oluşturma Tarihi:** 2025-08-23
- **Son Güncelleme:** 2025-08-23
- **Durum:** Taslak
- **İlgili Görev:** KM-2.2 (GPU İstek Yönlendirme Katmanı)
- **Öncelik:** P1

## 1. Giriş

Bu belge, GPU İstek Yönlendirme Katmanı'nın dosya yapısını ve organizasyonunu tanımlamaktadır. Bu yapı, projenin modüler, test edilebilir ve bakımı kolay olmasını sağlamak amacıyla tasarlanmıştır.

## 2. Dosya Yapısı

```
gpu_request_router/
├── README.md                     # Proje açıklaması ve kurulum talimatları
├── setup.py                      # Paket kurulum dosyası
├── requirements.txt              # Bağımlılıklar
├── config/
│   ├── __init__.py
│   ├── default_config.yaml       # Varsayılan yapılandırma
│   └── config_loader.py          # Yapılandırma yükleyici
├── src/
│   ├── __init__.py
│   ├── api/                      # API katmanı
│   │   ├── __init__.py
│   │   ├── app.py                # FastAPI uygulaması
│   │   ├── routes/               # API rotaları
│   │   │   ├── __init__.py
│   │   │   ├── request_routes.py # İstek yönlendirme rotaları
│   │   │   ├── gpu_routes.py     # GPU durum rotaları
│   │   │   └── metrics_routes.py # Metrik rotaları
│   │   ├── models/               # API veri modelleri
│   │   │   ├── __init__.py
│   │   │   ├── request_models.py # İstek modelleri
│   │   │   ├── gpu_models.py     # GPU durum modelleri
│   │   │   └── metrics_models.py # Metrik modelleri
│   │   └── middleware/           # API middleware
│   │       ├── __init__.py
│   │       ├── auth.py           # Kimlik doğrulama
│   │       ├── logging.py        # Loglama
│   │       └── error_handler.py  # Hata işleme
│   ├── core/                     # Çekirdek modüller
│   │   ├── __init__.py
│   │   ├── request_receiver.py   # İstek Alıcı
│   │   ├── priority_manager.py   # Öncelik Yöneticisi
│   │   ├── resource_estimator.py # Kaynak Tahmin Edici
│   │   ├── load_balancer.py      # Yük Dengeleyici
│   │   ├── gpu_state_monitor.py  # GPU Durum İzleyici
│   │   ├── request_router.py     # İstek Yönlendirici
│   │   ├── error_handler.py      # Hata İşleyici
│   │   └── metric_collector.py   # Metrik Toplayıcı
│   ├── models/                   # Veri modelleri
│   │   ├── __init__.py
│   │   ├── request.py            # İstek modeli
│   │   ├── gpu_state.py          # GPU durum modeli
│   │   └── user_quota.py         # Kullanıcı kota modeli
│   ├── services/                 # Dış servis entegrasyonları
│   │   ├── __init__.py
│   │   ├── gpu_monitoring.py     # GPU Monitoring System entegrasyonu
│   │   ├── logging_service.py    # Logging and Monitoring System entegrasyonu
│   │   └── ai_orchestrator.py    # AI Orchestrator entegrasyonu
│   └── utils/                    # Yardımcı modüller
│       ├── __init__.py
│       ├── logging.py            # Loglama yardımcıları
│       ├── metrics.py            # Metrik yardımcıları
│       └── validators.py         # Doğrulama yardımcıları
├── tests/                        # Testler
│   ├── __init__.py
│   ├── unit/                     # Birim testleri
│   │   ├── __init__.py
│   │   ├── core/                 # Çekirdek modül testleri
│   │   │   ├── __init__.py
│   │   │   ├── test_request_receiver.py
│   │   │   ├── test_priority_manager.py
│   │   │   ├── test_resource_estimator.py
│   │   │   ├── test_load_balancer.py
│   │   │   ├── test_gpu_state_monitor.py
│   │   │   ├── test_request_router.py
│   │   │   ├── test_error_handler.py
│   │   │   └── test_metric_collector.py
│   │   ├── models/               # Model testleri
│   │   │   ├── __init__.py
│   │   │   ├── test_request.py
│   │   │   ├── test_gpu_state.py
│   │   │   └── test_user_quota.py
│   │   └── utils/                # Yardımcı modül testleri
│   │       ├── __init__.py
│   │       ├── test_logging.py
│   │       ├── test_metrics.py
│   │       └── test_validators.py
│   ├── integration/              # Entegrasyon testleri
│   │   ├── __init__.py
│   │   ├── test_api.py           # API entegrasyon testleri
│   │   ├── test_gpu_monitoring.py # GPU Monitoring entegrasyon testleri
│   │   └── test_logging_service.py # Logging Service entegrasyon testleri
│   └── system/                   # Sistem testleri
│       ├── __init__.py
│       ├── test_end_to_end.py    # Uçtan uca testler
│       └── test_performance.py   # Performans testleri
└── docs/                         # Dokümantasyon
    ├── api.md                    # API dokümantasyonu
    ├── architecture.md           # Mimari dokümantasyon
    ├── deployment.md             # Dağıtım dokümantasyonu
    └── development.md            # Geliştirme dokümantasyonu
```

## 3. Modül Açıklamaları

### 3.1 API Katmanı

API katmanı, dış sistemlerle iletişim için HTTP API'leri sağlar. FastAPI kullanılarak geliştirilecektir.

#### 3.1.1 API Rotaları

- **request_routes.py**: İstek yönlendirme, durum sorgulama ve iptal etme API'leri
- **gpu_routes.py**: GPU durumu sorgulama API'leri
- **metrics_routes.py**: Metrik sorgulama API'leri

#### 3.1.2 API Veri Modelleri

- **request_models.py**: İstek API veri modelleri (Pydantic)
- **gpu_models.py**: GPU durum API veri modelleri (Pydantic)
- **metrics_models.py**: Metrik API veri modelleri (Pydantic)

#### 3.1.3 API Middleware

- **auth.py**: Kimlik doğrulama middleware'i
- **logging.py**: Loglama middleware'i
- **error_handler.py**: Hata işleme middleware'i

### 3.2 Çekirdek Modüller

Çekirdek modüller, GPU İstek Yönlendirme Katmanı'nın temel işlevselliğini sağlar.

- **request_receiver.py**: Gelen istekleri kabul eden ve ön işleme tabi tutan modül
- **priority_manager.py**: İstekleri önceliklerine göre sıralayan ve yöneten modül
- **resource_estimator.py**: İsteklerin kaynak gereksinimlerini tahmin eden modül
- **load_balancer.py**: GPU'lar arasında yük dengelemesi yapan modül
- **gpu_state_monitor.py**: GPU'ların durumunu ve kullanım oranlarını izleyen modül
- **request_router.py**: İstekleri uygun GPU'lara yönlendiren modül
- **error_handler.py**: Hataları tespit eden ve gerekli aksiyonları alan modül
- **metric_collector.py**: Performans metriklerini toplayan ve raporlayan modül

### 3.3 Veri Modelleri

Veri modelleri, GPU İstek Yönlendirme Katmanı'nın kullandığı veri yapılarını tanımlar.

- **request.py**: İstek veri modeli
- **gpu_state.py**: GPU durum veri modeli
- **user_quota.py**: Kullanıcı kota veri modeli

### 3.4 Servis Entegrasyonları

Servis entegrasyonları, GPU İstek Yönlendirme Katmanı'nın dış sistemlerle entegrasyonunu sağlar.

- **gpu_monitoring.py**: GPU Monitoring System ile entegrasyon
- **logging_service.py**: Logging and Monitoring System ile entegrasyon
- **ai_orchestrator.py**: AI Orchestrator ile entegrasyon

### 3.5 Yardımcı Modüller

Yardımcı modüller, GPU İstek Yönlendirme Katmanı'nın çeşitli işlevlerini destekler.

- **logging.py**: Loglama yardımcıları
- **metrics.py**: Metrik yardımcıları
- **validators.py**: Doğrulama yardımcıları

## 4. Geliştirme Yaklaşımı

### 4.1 Modüler Geliştirme

Her modül, belirli bir sorumluluğa sahip olacak ve diğer modüllerden bağımsız olarak geliştirilebilecek şekilde tasarlanacaktır. Bu, kodun bakımını ve test edilebilirliğini artıracaktır.

### 4.2 Test Odaklı Geliştirme (TDD)

Her modül için önce testler yazılacak, ardından bu testleri geçecek şekilde kod geliştirilecektir. Bu, kodun doğruluğunu ve güvenilirliğini artıracaktır.

### 4.3 Sürekli Entegrasyon (CI)

Kod değişiklikleri, otomatik testler ve statik kod analizi ile sürekli olarak doğrulanacaktır. Bu, hataların erken tespit edilmesini ve kodun kalitesinin korunmasını sağlayacaktır.

### 4.4 Dokümantasyon

Her modül, fonksiyon ve sınıf için dokümantasyon yazılacaktır. API'ler için OpenAPI (Swagger) dokümantasyonu oluşturulacaktır. Bu, kodun anlaşılabilirliğini ve kullanılabilirliğini artıracaktır.

## 5. Sonuç

Bu dosya yapısı, GPU İstek Yönlendirme Katmanı'nın modüler, test edilebilir ve bakımı kolay olmasını sağlayacaktır. Geliştirme süreci boyunca, bu yapı gerektiğinde güncellenebilir ve genişletilebilir.
