# OS Integration Service - Teknik Dokümantasyon

Bu dokümantasyon, ALT_LAS projesi için İşçi 6 (OS Entegrasyon Uzmanı) tarafından geliştirilen OS Integration Service'in teknik detaylarını içermektedir.

## Genel Bakış

OS Integration Service, ALT_LAS platformunun farklı işletim sistemleriyle entegrasyonunu sağlayan mikroservistir. Bu servis, Windows, macOS ve Linux işletim sistemlerinde çalışacak şekilde tasarlanmıştır ve aşağıdaki temel işlevleri sağlar:

- İşletim sistemi bilgilerini alma
- Dosya sistemi erişimi ve yönetimi
- İşlem (process) yönetimi ve kontrolü
- Ekran görüntüsü alma (CUDA hızlandırmalı seçeneği ile)

## Mimari

Servis, Rust programlama dili kullanılarak geliştirilmiştir ve modüler bir yapıya sahiptir:

```
os-integration-service/
├── src/
│   ├── main.rs                 # Ana uygulama ve HTTP sunucusu
│   ├── platform/               # Platform-spesifik modüller
│   │   ├── mod.rs              # Platform modülü tanımları
│   │   ├── windows.rs          # Windows entegrasyonu
│   │   ├── macos.rs            # macOS entegrasyonu
│   │   └── linux.rs            # Linux entegrasyonu
│   ├── api/                    # API modülleri
│   │   ├── mod.rs              # API modülü tanımları
│   │   ├── platform.rs         # Platform API'leri
│   │   ├── filesystem.rs       # Dosya sistemi API'leri
│   │   ├── process.rs          # İşlem yönetimi API'leri
│   │   └── screenshot.rs       # Ekran görüntüsü API'leri
│   ├── error.rs                # Hata yönetimi
│   └── utils.rs                # Yardımcı fonksiyonlar
└── tests/                      # Test dosyaları
    └── test_api.sh             # API test scripti
```

## API Referansı

Servis, RESTful API aracılığıyla aşağıdaki endpoint'leri sunar:

### Platform API'leri

- `GET /api/platform/info`: İşletim sistemi bilgilerini döndürür
- `GET /api/platform/processes`: Çalışan işlemleri listeler
- `POST /api/platform/run`: Yeni bir işlem başlatır
- `POST /api/platform/kill`: Çalışan bir işlemi sonlandırır
- `POST /api/platform/input`: Çalışan bir işleme girdi gönderir
- `GET /api/platform/output/{id}`: Çalışan bir işlemin çıktısını alır
- `GET /api/platform/running`: Servis tarafından yönetilen işlemleri listeler

### Dosya Sistemi API'leri

- `GET /api/fs/list`: Bir dizindeki dosya ve klasörleri listeler
- `GET /api/fs/read`: Bir dosyanın içeriğini okur
- `POST /api/fs/write`: Bir dosyaya içerik yazar
- `POST /api/fs/delete`: Bir dosya veya dizini siler
- `POST /api/fs/move`: Bir dosya veya dizini taşır/yeniden adlandırır
- `POST /api/fs/copy`: Bir dosya veya dizini kopyalar
- `POST /api/fs/mkdir`: Yeni bir dizin oluşturur
- `GET /api/fs/disks`: Disk bilgilerini döndürür

### Ekran Görüntüsü API'leri

- `GET /api/screenshot`: Tam ekran görüntüsü alır
- `POST /api/screenshot/region`: Belirli bir bölgenin ekran görüntüsünü alır
- `GET /api/screenshot/cuda`: CUDA hızlandırmalı ekran görüntüsü alır (uygun donanım varsa)

## Platform Desteği

### Windows

Windows entegrasyonu, Windows API'leri ve PowerShell komutları kullanılarak gerçekleştirilmiştir. Aşağıdaki özellikler desteklenmektedir:

- Windows sürüm bilgisi alma
- İşlem listesi ve yönetimi
- Dosya sistemi erişimi
- Ekran görüntüsü alma

### macOS

macOS entegrasyonu, Cocoa API'leri ve macOS komutları kullanılarak gerçekleştirilmiştir. Aşağıdaki özellikler desteklenmektedir:

- macOS sürüm bilgisi alma
- İşlem listesi ve yönetimi
- Dosya sistemi erişimi
- Ekran görüntüsü alma (screencapture kullanarak)

### Linux

Linux entegrasyonu, Linux sistem çağrıları ve komutları kullanılarak gerçekleştirilmiştir. Aşağıdaki özellikler desteklenmektedir:

- Linux dağıtım bilgisi alma
- İşlem listesi ve yönetimi
- Dosya sistemi erişimi
- Ekran görüntüsü alma (ImageMagick veya gnome-screenshot kullanarak)

## CUDA Hızlandırmalı Ekran Yakalama

Servis, NVIDIA GPU'ları olan sistemlerde CUDA hızlandırmalı ekran görüntüsü alma özelliğini desteklemektedir. Bu özellik, özellikle yüksek çözünürlüklü ekranlarda ve çoklu monitör kurulumlarında performans avantajı sağlar.

## Kurulum ve Çalıştırma

### Gereksinimler

- Rust 1.70 veya üzeri
- Cargo paket yöneticisi
- Platform-spesifik gereksinimler:
  - Windows: PowerShell 5.0+
  - macOS: Xcode Command Line Tools
  - Linux: ImageMagick veya gnome-screenshot

### Derleme

```bash
cd os-integration-service
cargo build --release
```

### Çalıştırma

```bash
cd os-integration-service
cargo run --release
```

Servis varsayılan olarak `127.0.0.1:8080` adresinde çalışır. Bu ayarı değiştirmek için aşağıdaki ortam değişkenlerini kullanabilirsiniz:

- `HOST`: Sunucu adresi (varsayılan: 127.0.0.1)
- `PORT`: Sunucu portu (varsayılan: 8080)
- `RUST_LOG`: Log seviyesi (trace, debug, info, warn, error)
- `TEMP_DIR`: Geçici dosyalar için dizin (varsayılan: /tmp/os_integration_service)

## Test

Servisi test etmek için aşağıdaki komutu çalıştırabilirsiniz:

```bash
cd os-integration-service
./tests/test_api.sh
```

Bu script, servisin tüm temel işlevlerini test eder ve sonuçları gösterir.

## Güvenlik Notları

- Bu servis, güvenlik duvarı arkasında veya güvenli bir ağda çalıştırılmalıdır.
- Dosya sistemi ve işlem yönetimi API'leri, yetkilendirme olmadan kullanıldığında güvenlik riskleri oluşturabilir.
- Üretim ortamında kullanmadan önce uygun kimlik doğrulama ve yetkilendirme mekanizmaları eklenmelidir.

## Gelecek Geliştirmeler

- Kimlik doğrulama ve yetkilendirme mekanizmaları
- WebSocket desteği ile gerçek zamanlı işlem çıktısı
- Daha gelişmiş CUDA entegrasyonu
- Uzaktan yönetim özellikleri
- Daha kapsamlı hata işleme ve raporlama

## Lisans

Bu proje MIT/Apache-2.0 lisansı altında lisanslanmıştır.

## İletişim

Bu servis hakkında sorularınız veya önerileriniz için İşçi 6 (OS Entegrasyon Uzmanı) ile iletişime geçebilirsiniz.
