# ALT_LAS Sistem Mimarisi

## 1. Genel Bakış

ALT_LAS, bilgisayar sistemlerini yapay zeka ile yönetmek için tasarlanmış, modüler bir mikroservis mimarisi kullanan, açık kaynaklı ve ticari kullanıma uygun bir platformdur. Sistem, UI-TARS-desktop'ın kullanıcı arayüzü yetenekleri ile alt_last'ın bilgisayar yönetim özelliklerini birleştirerek daha güçlü bir çözüm sunmayı hedeflemektedir.

## 2. Temel Prensipler

- **Modülerlik**: Tüm bileşenler bağımsız mikroservisler olarak çalışır
- **Ölçeklenebilirlik**: Yatay ve dikey ölçeklendirme desteği
- **Lisans Uyumluluğu**: Tüm bileşenler ticari kullanıma uygun ücretsiz lisanslara sahiptir
- **Sürekli Öğrenme**: Başarılı işlemler arşivlenerek sistem kendini geliştirir
- **Güvenlik**: Sandbox izolasyonu ve güvenli FFI (Foreign Function Interface) katmanı

## 3. Dosya Tabanlı İş Akışı

ALT_LAS, üç temel dosya tipine dayalı bir iş akışı kullanır:

1. **\*.alt**: Alt görev tanımları ve segmentasyon
2. **\*.last**: Görev çıktıları ve sonuçlar
3. **\*.atlas**: Başarılı sonuçların arşivi ve öğrenme veritabanı

## 4. Mimari Katmanlar

### 4.1. Çekirdek Katmanı (Core Layer)

```
[Kullanıcı/Harici AI] → API Gateway → [Segmentation Service → Runner Service → Archive Service]
                                                ↓               ↓               ↓
                                           *.alt dosyaları  *.last dosyaları  *.atlas DB
                                                ↖───────────────↗
                                           Feedback Loop & Fine-Tuning
```

#### API Gateway (Node.js/Express)
- **Lisans**: MIT
- **Sorumluluklar**: Kimlik doğrulama, yönlendirme (arka uç servislere ters proxy ve devre kesici ile), API dokümantasyonu, rate-limiting
- **Teknolojiler**: Express.js, Swagger/OpenAPI, JWT, http-proxy-middleware, opossum

#### Segmentation Service (Python/FastAPI)
- **Lisans**: MIT
- **Sorumluluklar**: Komut ayrıştırma, DSL → *.alt dönüşümü, metadata ekleme
- **Teknolojiler**: FastAPI, Pydantic, PyParsing (MIT lisanslı)

#### Runner Service (Rust)
- **Lisans**: MIT/Apache 2.0
- **Sorumluluklar**: *.alt dosyalarını işleme, AI çağrıları, *.last üretimi
- **Teknolojiler**: Tokio, Actix-web, Serde

#### Archive Service (Go)
- **Lisans**: BSD-3-Clause
- **Sorumluluklar**: *.last dinleme, başarı oranı kontrolü, *.atlas yazma
- **Teknolojiler**: Go, NATS (Apache 2.0), PostgreSQL (PostgreSQL License)

### 4.2. Kullanıcı Arayüzü Katmanı (UI Layer)

#### Desktop UI (Electron/React)
- **Lisans**: MIT
- **Sorumluluklar**: Masaüstü uygulaması, sistem tepsisi entegrasyonu, kısayollar
- **Teknolojiler**: Electron, React, TypeScript

#### Web Dashboard (React)
- **Lisans**: MIT
- **Sorumluluklar**: Görev izleme, analitik, ayarlar
- **Teknolojiler**: React, Redux, Chart.js

#### Mobile Companion (React Native)
- **Lisans**: MIT
- **Sorumluluklar**: Mobil bildirimler, uzaktan kontrol
- **Teknolojiler**: React Native, Expo

### 4.3. Entegrasyon Katmanı (Integration Layer)

#### OS Integration Service (Rust/C++)
- **Lisans**: MIT/Apache 2.0
- **Sorumluluklar**: İşletim sistemi entegrasyonu, dosya sistemi erişimi, uygulama kontrolü
- **Teknolojiler**: Rust FFI, Windows API, X11/Wayland, macOS Cocoa

#### Device Control Service (Python)
- **Lisans**: MIT
- **Sorumluluklar**: Donanım kontrolü, sensör verileri, çevre birimleri
- **Teknolojiler**: PyUSB, BlueZ, HIDAPI
- **Not**: Bu servis henüz bir işçiye atanmamıştır ve gelecek aşamalarda geliştirilmesi planlanmaktadır.

#### Network Service (Go)
- **Lisans**: BSD-3-Clause
- **Sorumluluklar**: Ağ yönetimi, cihaz keşfi, güvenlik duvarı kontrolü
- **Teknolojiler**: Go, libpcap, nftables
- **Not**: Bu servis henüz bir işçiye atanmamıştır ve gelecek aşamalarda geliştirilmesi planlanmaktadır.

### 4.4. Yapay Zeka Katmanı (AI Layer)

#### Core AI Orchestrator (Python)
- **Lisans**: MIT
- **Sorumluluklar**: AI modellerini koordine etme, model seçimi, çıktı birleştirme
- **Teknolojiler**: ONNX Runtime, PyTorch (BSD-3-Clause)

#### Local LLM Service (C++/Python)
- **Lisans**: MIT
- **Sorumluluklar**: Yerel dil modelleri çalıştırma, metin üretimi
- **Teknolojiler**: llama.cpp (MIT), GGML (MIT)

#### Computer Vision Service (Python)
- **Lisans**: MIT
- **Sorumluluklar**: Görüntü analizi, OCR, nesne tanıma
- **Teknolojiler**: OpenCV (Apache 2.0), Tesseract (Apache 2.0)

#### Voice Processing Service (Python)
- **Lisans**: MIT
- **Sorumluluklar**: Ses tanıma, ses sentezi
- **Teknolojiler**: Whisper (MIT), Coqui TTS (MPL 2.0 → MIT alternatifi bulunacak)
- **Not**: Bu servis henüz bir işçiye atanmamıştır ve gelecek aşamalarda geliştirilmesi planlanmaktadır. Coqui TTS lisansı (MPL 2.0) ticari kullanım için uygun olmadığından, MIT lisanslı bir alternatif (örneğin Piper TTS) araştırılacaktır.### 4.5. Güvenlik Katmanı (Security Layer)

#### Policy Enforcement (Rust)
- **Lisans**: MIT/Apache 2.0
- **Sorumluluklar**: Güvenlik politikaları, izin kontrolü
- **Teknolojiler**: Rust, OPA (Apache 2.0)

#### Sandbox Manager (Go)
- **Lisans**: BSD-3-Clause
- **Sorumluluklar**: İzolasyon, kaynak sınırlama
- **Teknolojiler**: Go, cgroups, namespaces

#### Audit Service (Go)
- **Lisans**: BSD-3-Clause
- **Sorumluluklar**: İşlem kaydı, güvenlik günlükleri
- **Teknolojiler**: Go, SQLite (Public Domain)

## 5. Çalışma Modları

### 5.1. Normal Mod
Standart görev işleme ve sistem yönetimi

### 5.2. Dream Mod
Test senaryoları, log analizi, otomatik optimizasyon

### 5.3. Explore Mod
Varyasyon analizi, alternatif çözüm keşfi

### 5.4. Chaos Mod
Yaratıcı düşünme, farklı bakış açıları, chaos_level (1-4) ile kontrol

## 6. Persona Sistemi

Sistem farklı kişilik özellikleriyle çalışabilir:

- empathetic_assistant
- technical_expert
- creative_designer
- security_focused
- efficiency_optimizer
- learning_tutor

## 7. Teknoloji Yığını Özeti

| Bileşen | Teknoloji | Lisans |
|---------|-----------|--------|
| Backend API | Node.js/Express | MIT |
| Segmentation | Python/FastAPI | MIT |
| Runner | Rust/Tokio | MIT/Apache 2.0 |
| Archive | Go/NATS | BSD-3-Clause/Apache 2.0 |
| Desktop UI | Electron/React | MIT |
| Web Dashboard | React | MIT |
| Mobile App | React Native | MIT |
| OS Integration | Rust/C++ | MIT/Apache 2.0 |
| Device Control | Python | MIT |
| Network | Go | BSD-3-Clause |
| AI Orchestrator | Python | MIT |
| Local LLM | C++/Python | MIT |
| Computer Vision | Python/OpenCV | MIT/Apache 2.0 |
| Voice Processing | Python | MIT |
| Database | PostgreSQL | PostgreSQL License |
| Message Queue | NATS | Apache 2.0 |
| Monitoring | Prometheus/Grafana | Apache 2.0/AGPL* |

*Not: Grafana AGPL lisanslıdır, ancak yalnızca izleme amaçlı kullanılacak ve kodla doğrudan entegre edilmeyecektir. Alternatif olarak MIT lisanslı Chronograf kullanılabilir.

## 8. Veri Akışı

1. Kullanıcı veya harici sistem bir komut gönderir
2. API Gateway komutu doğrular ve Segmentation Service'e yönlendirir
3. Segmentation Service komutu analiz eder ve *.alt dosyası oluşturur
4. Runner Service *.alt dosyasını alır ve gerekli AI servislerini çağırır
5. Runner Service sonuçları birleştirir ve *.last dosyası oluşturur
6. Archive Service başarılı *.last dosyalarını *.atlas veritabanına kaydeder
7. Feedback Loop başarısız sonuçları analiz eder ve iyileştirmeler önerir

## 9. Dağıtım Mimarisi

```
[Docker Containers]
  ├── api-gateway
  ├── segmentation-service
  ├── runner-service
  ├── archive-service
  ├── os-integration-service
  ├── device-control-service
  ├── network-service
  ├── ai-orchestrator
  ├── local-llm-service
  ├── computer-vision-service
  ├── voice-processing-service
  ├── policy-enforcement
  ├── sandbox-manager
  ├── audit-service
  └── web-dashboard

[Desktop Application]
  └── Electron App (Windows/macOS/Linux)

[Mobile Application]
  └── React Native App (iOS/Android)
```

## 10. Ölçeklenebilirlik ve Performans

- Mikroservis mimarisi yatay ölçeklendirmeye olanak tanır
- Yüksek performanslı diller (Rust, Go, C++) kritik bileşenlerde kullanılır
- Yerel AI modelleri düşük gecikme süresi sağlar
- Bulut AI servisleri opsiyonel olarak entegre edilebilir

## 11. Güvenlik Önlemleri

- Sandbox izolasyonu tüm AI işlemleri için
- Güvenli FFI katmanı diller arası iletişim için
- Detaylı denetim günlükleri
- Rol tabanlı erişim kontrolü
- Veri şifreleme (depolama ve iletim sırasında)

## 12. Lisans Stratejisi

ALT_LAS, ticari kullanıma uygun ücretsiz lisanslar kullanarak geliştirilecektir:

- MIT Lisansı (çoğu bileşen)
- Apache 2.0 Lisansı (bazı kütüphaneler)
- BSD-3-Clause Lisansı (Go bileşenleri)
- PostgreSQL Lisansı (veritabanı)

Bu lisanslar, projenin kapalı kaynak olarak ticari amaçla satılmasına olanak tanır.
