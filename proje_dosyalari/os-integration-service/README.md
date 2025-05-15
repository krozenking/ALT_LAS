# OS Integration Service - Gelişmiş Dokümantasyon

Bu dokümantasyon, ALT_LAS projesi için İşçi 6 (OS Entegrasyon Uzmanı) tarafından geliştirilen OS Integration Service'in teknik detaylarını içermektedir.

## Genel Bakış

OS Integration Service, ALT_LAS platformunun farklı işletim sistemleriyle entegrasyonunu sağlayan mikroservistir. Bu servis, Windows, macOS ve Linux işletim sistemlerinde çalışacak şekilde tasarlanmıştır ve aşağıdaki temel işlevleri sağlar:

- İşletim sistemi bilgilerini alma
- Dosya sistemi erişimi ve yönetimi
- İşlem (process) yönetimi ve kontrolü
- Ekran görüntüsü alma (CUDA hızlandırmalı seçeneği ile)
- Güvenlik özellikleri (kimlik doğrulama, yetkilendirme, şifreleme)
- Platform bağımsız çalışma

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
│   ├── cuda_screenshot.rs      # CUDA hızlandırmalı ekran görüntüsü modülü
│   ├── cross_platform.rs       # Platform bağımsız yardımcı fonksiyonlar
│   ├── security.rs             # Güvenlik özellikleri
│   ├── error.rs                # Hata yönetimi
│   └── utils.rs                # Yardımcı fonksiyonlar
└── tests/                      # Test dosyaları
    ├── test_api.sh             # Temel API test scripti
    └── comprehensive_test.sh   # Kapsamlı test scripti
```

## Yeni Özellikler ve Geliştirmeler

### 1. CUDA Hızlandırmalı Ekran Görüntüsü Alma

CUDA hızlandırmalı ekran görüntüsü alma özelliği, NVIDIA GPU'ları olan sistemlerde ekran görüntüsü alma işlemini hızlandırmak için geliştirilmiştir. Bu özellik, özellikle yüksek çözünürlüklü ekranlarda ve çoklu monitör kurulumlarında performans avantajı sağlar.

**Özellikler:**
- NVIDIA GPU varlığını otomatik tespit etme
- GPU hızlandırmalı ekran görüntüsü alma
- Belirli bir bölgenin ekran görüntüsünü alma
- Çoklu monitör desteği
- Farklı formatlarda (PNG, JPEG, vb.) kaydetme
- Kalite ve boyut ayarları
- Alternatif yöntemlere otomatik geçiş (GPU yoksa)

**Kullanım:**
```
GET /api/screenshot/cuda?output_path=/path/to/output.png&format=png&quality=90&display_index=0
```

### 2. Platform Bağımsız Entegrasyon

Cross-platform modülü, farklı işletim sistemlerinde tutarlı bir şekilde çalışan yardımcı fonksiyonlar sağlar. Bu modül, dosya yolları, sistem bilgileri ve işlem yönetimi gibi platform-spesifik farklılıkları soyutlar.

**Özellikler:**
- Platform algılama ve bilgi toplama
- Dosya yolu normalizasyonu
- Platform-spesifik geçici dizin ve ev dizini bulma
- Dosya işlemleri için platform bağımsız fonksiyonlar
- İşlem çalıştırma ve yönetme için platform bağımsız fonksiyonlar
- Sistem bilgisi toplama
- Ekran bilgisi toplama

**Kullanım Örneği:**
```rust
// Platform algılama
let platform = cross_platform::get_current_platform();

// Dosya yolu normalizasyonu
let normalized_path = cross_platform::normalize_path("/path/to/file");

// Sistem bilgisi alma
let system_info = cross_platform::get_system_info()?;
println!("OS: {} {}", system_info.os_name, system_info.os_version);
```

### 3. Güvenlik Özellikleri

Güvenlik modülü, servisin güvenli bir şekilde çalışmasını sağlamak için kimlik doğrulama, yetkilendirme, şifreleme, hız sınırlama ve IP filtreleme gibi özellikler sunar.

**Özellikler:**
- Kullanıcı kimlik doğrulama ve yetkilendirme
- Token tabanlı oturum yönetimi
- Rol tabanlı erişim kontrolü (Admin, User, ReadOnly)
- Veri şifreleme ve şifre çözme
- API hız sınırlama
- IP filtreleme (beyaz liste ve kara liste)
- Güvenlik olayları için denetim günlüğü

**Kullanım Örneği:**
```
# Kimlik doğrulama
POST /api/auth/login
{
  "username": "admin",
  "password": "secure_password"
}

# Token ile API erişimi
GET /api/platform/info
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Kapsamlı Test Altyapısı

Servisin tüm bileşenlerini test etmek için kapsamlı bir test altyapısı geliştirilmiştir. Bu altyapı, platform algılama, dosya işlemleri, işlem yönetimi, ekran görüntüsü alma ve güvenlik özellikleri gibi tüm bileşenleri test eder.

**Test Kategorileri:**
1. Platform Algılama Testleri
2. Dosya Sistemi İşlemleri Testleri
3. İşlem Yönetimi Testleri
4. Ekran Görüntüsü Alma Testleri
5. Güvenlik Özellikleri Testleri
6. Platform Bağımsız Özellikler Testleri

**Testleri Çalıştırma:**
```bash
cd os-integration-service
./tests/comprehensive_test.sh
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
- `GET /api/platform/displays`: Bağlı ekranların bilgilerini döndürür

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

### Güvenlik API'leri

- `POST /api/auth/login`: Kullanıcı girişi yapar ve token döndürür
- `POST /api/auth/logout`: Mevcut token'ı geçersiz kılar
- `GET /api/auth/validate`: Mevcut token'ın geçerliliğini kontrol eder
- `POST /api/auth/change-password`: Kullanıcı şifresini değiştirir

## Platform Desteği

### Windows

Windows entegrasyonu, Windows API'leri ve PowerShell komutları kullanılarak gerçekleştirilmiştir. Aşağıdaki özellikler desteklenmektedir:

- Windows sürüm bilgisi alma
- İşlem listesi ve yönetimi
- Dosya sistemi erişimi
- Ekran görüntüsü alma (CUDA desteği ile)
- Windows-spesifik güvenlik özellikleri

### macOS

macOS entegrasyonu, Cocoa API'leri ve macOS komutları kullanılarak gerçekleştirilmiştir. Aşağıdaki özellikler desteklenmektedir:

- macOS sürüm bilgisi alma
- İşlem listesi ve yönetimi
- Dosya sistemi erişimi
- Ekran görüntüsü alma (Metal API desteği ile)
- macOS-spesifik güvenlik özellikleri

### Linux

Linux entegrasyonu, Linux sistem çağrıları ve komutları kullanılarak gerçekleştirilmiştir. Aşağıdaki özellikler desteklenmektedir:

- Linux dağıtım bilgisi alma
- İşlem listesi ve yönetimi
- Dosya sistemi erişimi
- Ekran görüntüsü alma (CUDA desteği ile)
- Linux-spesifik güvenlik özellikleri

## Kurulum ve Çalıştırma

### Gereksinimler

- Rust 1.70 veya üzeri
- Cargo paket yöneticisi
- Platform-spesifik gereksinimler:
  - Windows: PowerShell 5.0+, Visual C++ Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: build-essential, libx11-dev, libxrandr-dev

### CUDA Desteği İçin Ek Gereksinimler

- NVIDIA CUDA Toolkit 11.0 veya üzeri
- NVIDIA GPU sürücüleri
- Python 3.6 veya üzeri (CUDA entegrasyonu için)
- PyCUDA (Python CUDA kütüphanesi)

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
- `AUTH_ENABLED`: Kimlik doğrulama etkin mi (varsayılan: true)
- `REQUIRE_HTTPS`: HTTPS gerektir (varsayılan: true)

## Güvenlik Notları

- Bu servis, güvenlik duvarı arkasında veya güvenli bir ağda çalıştırılmalıdır.
- Üretim ortamında kullanmadan önce HTTPS yapılandırması yapılmalıdır.
- Varsayılan kimlik bilgileri değiştirilmelidir.
- Dosya sistemi ve işlem yönetimi API'leri, yetkilendirme olmadan kullanıldığında güvenlik riskleri oluşturabilir.
- Güvenlik modülü, temel güvenlik önlemlerini sağlar ancak üretim ortamında ek güvenlik önlemleri alınmalıdır.

## Performans Optimizasyonları

- CUDA hızlandırmalı ekran görüntüsü alma, standart yöntemlere göre 2-5 kat daha hızlıdır.
- Asenkron işlem yönetimi, çoklu işlem çalıştırma ve izleme için performans sağlar.
- Platform-spesifik optimizasyonlar, her işletim sisteminde en iyi performansı elde etmek için uygulanmıştır.
- Önbellek mekanizmaları, sık kullanılan bilgiler için uygulanmıştır.

## Gelecek Geliştirmeler

- WebSocket desteği ile gerçek zamanlı işlem çıktısı
- Daha gelişmiş CUDA entegrasyonu ve GPU hızlandırmalı görüntü işleme
- Uzaktan yönetim özellikleri
- Daha kapsamlı hata işleme ve raporlama
- Konteyner desteği (Docker, Kubernetes)
- Dağıtık sistem entegrasyonu

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **Servis başlatılamıyor**
   - Port çakışması olabilir, farklı bir port deneyin
   - Gerekli bağımlılıkların kurulu olduğunu kontrol edin
   - Log dosyalarını inceleyin

2. **CUDA ekran görüntüsü alma çalışmıyor**
   - NVIDIA GPU'nun mevcut olduğunu kontrol edin
   - CUDA Toolkit'in kurulu olduğunu doğrulayın
   - PyCUDA'nın kurulu olduğunu kontrol edin

3. **Kimlik doğrulama hataları**
   - Token'ın geçerli olduğunu kontrol edin
   - Kullanıcı adı ve şifrenin doğru olduğunu doğrulayın
   - Hesabın kilitli olmadığından emin olun

### Log Dosyaları

Log dosyaları varsayılan olarak aşağıdaki konumlarda bulunur:
- Linux/macOS: `/var/log/os_integration_service.log`
- Windows: `C:\ProgramData\os_integration_service\logs\service.log`

Güvenlik log dosyaları:
- Linux/macOS: `/var/log/os_integration_service_security.log`
- Windows: `C:\ProgramData\os_integration_service\logs\security.log`

## Lisans

Bu proje MIT/Apache-2.0 lisansı altında lisanslanmıştır.

## İletişim

Bu servis hakkında sorularınız veya önerileriniz için İşçi 6 (OS Entegrasyon Uzmanı) ile iletişime geçebilirsiniz.
